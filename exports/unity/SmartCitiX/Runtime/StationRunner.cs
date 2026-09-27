// SmartCiti.X content bridge — the procedure engine.
//
// A MonoBehaviour state machine over the nine step kinds, with the same
// scoring and pass rules WebXR/shared/game.js applies (Session), so a run in
// Unity scores what the same run scores in the browser:
//
//   select   — touch the step's target; anything else is a wrong step, or an
//              unsafe action if it is one of the station's hazards (−50).
//   sequence — the targets in order (anyOrder: in any order); an out-of-order
//              target costs a wrong step (−25).
//   find     — a sequence in any order.
//   gauge    — a marker sweeps 0..1; commit inside the green band, bonus by
//              closeness to the centre; outside the band is a wrong step.
//   hold     — hold the target for `seconds`; releasing early resets the clock
//              and counts a hold break.
//   track    — press to drive a value up, release to let it fall; keep it in
//              the green band for `seconds` total.
//   turn     — rotate the target through `turn.turns` full turns.
//   drag     — carry the target and drop it within `drag.radius` metres of the
//              socket; a miss costs nothing and can be tried again.
//   drive    — follow the route inside the lane and the speed band; out of
//              either past the grace is unsafe; every check in its window.
//
// Interruptions fire `delay` seconds into the step they name and take the
// next thing the learner touches. Answering is worth 120 plus up to 60 for
// speed; a wrong response or a miss is an unsafe action.
//
// Pass rule (records.js): stars >= 2 and hazardHits == 0. Stars: 3 when no
// error and inside par, 2 when at most one error and inside 1.5 x par, else 1.
using System;
using System.Collections.Generic;
using UnityEngine;

namespace SmartCitiX
{
    public enum FeedbackKind { Ok, Partial, Warn, Danger }

    public class Feedback
    {
        public FeedbackKind kind;
        public string text;
        public int points;
        public bool hazard;
        public Feedback(FeedbackKind k, string t, int p = 0, bool h = false) { kind = k; text = t; points = p; hazard = h; }
    }

    public class StepLogEntry
    {
        public string id; public string title; public string kind; public float seconds; public int corrections; public int hazards; public bool clean; public int points;
    }

    public class InterruptLogEntry { public string id; public string alert; public string outcome; public float seconds; }

    public class StationRunner : MonoBehaviour
    {
        public const int StepPoints = 100;
        public const int WrongStepPenalty = 25;
        public const int HazardPenalty = 50;
        public const float MaxCombo = 2f;
        public const int InterruptPoints = 120;
        public const int InterruptSpeedBonus = 60;
        public const float PreparedBonus = 0.1f;

        public Station station;
        public bool prepared;
        public bool tickInUpdate = true;

        public int Index { get; private set; }
        public int Score { get; private set; }
        public int Streak { get; private set; }
        public float PeakCombo { get; private set; }
        public int Errors { get; private set; }
        public int HazardHits { get; private set; }
        public int HoldBreaks { get; private set; }
        public float Elapsed { get; private set; }
        public bool Finished { get; private set; }
        public int Stars { get; private set; }
        public int TimeBonus { get; private set; }
        public int PreparedBonusPoints { get; private set; }
        public readonly List<StepLogEntry> StepLog = new List<StepLogEntry>();
        public readonly List<InterruptLogEntry> InterruptLog = new List<InterruptLogEntry>();
        public readonly List<float> GaugeScores = new List<float>();

        public event Action<Step> OnStep;
        public event Action<Feedback> OnFeedback;
        public event Action<string> OnHazard;
        public event Action<Interrupt> OnInterrupt;
        public event Action<Interrupt> OnInterruptEnd;
        public event Action<StationRunner> OnFinish;
        public event Action<DrivePose> OnDrive;

        // Live state for the current step.
        readonly List<string> sequence = new List<string>();
        float holdFor;
        bool holding;
        float stepStartedAt;
        int stepErrors, stepHazards;
        GaugeState gauge;
        TrackState track;
        TurnState turn;
        DriveState drive;
        readonly List<InterruptState> interrupts = new List<InterruptState>();
        InterruptState active;

        class GaugeState { public float t; public float dir = 1; public float speed = 0.85f; public float lo = 0.44f, hi = 0.62f; public bool committed; }
        class TrackState { public float v = 0.1f, lo = 0.42f, hi = 0.62f, rise = 0.62f, fall = 0.46f, drift = 0.1f, wobble, inBand; public int dropouts; public bool wasIn; }
        class TurnState { public float amount, required = 1f; }
        class InterruptState { public Interrupt it; public bool fired; public float? armedAt; public float firedAt; public string resolved; }
        class DriveCheck { public string kind; public float from, to; public bool done, missed; public string note; }
        public struct DrivePose { public float x, z, heading, s, total; public bool reverse; }
        class DriveState
        {
            public List<Vector2> path; public List<float> cum; public float total; public float lo, hi, laneWidth, grace, ramp, sceneRate, accel, maxSpeed, steerRate, driftK;
            public bool reverse; public Dictionary<string, string> controls; public Dictionary<string, string> forbid; public string laneNote, speedNote, wrongSignalNote;
            public List<DriveCheck> plan; public float s, speed, offset, throttle, steer, outLane, outBand, inBand, driven, quietUntil = -1f;
            public bool started, reachedBand, laneFlagged, bandFlagged, wasIn = true, braking; public float startedAt; public int dropouts;
        }

        public Step Current { get { return station != null && Index < station.steps.Count ? station.steps[Index] : null; } }
        public float Combo { get { return Mathf.Min(MaxCombo, 1f + Streak * 0.1f); } }
        public float Progress01 { get { return station == null || station.steps.Count == 0 ? 0f : (float)Index / station.steps.Count; } }
        public Interrupt ActiveInterrupt { get { return active != null ? active.it : null; } }
        public float Precision
        {
            get { if (GaugeScores.Count == 0) return 0f; float s = 0; foreach (var g in GaugeScores) s += g; return s / GaugeScores.Count; }
        }

        public void Begin(Station st, bool wasPrepared = false)
        {
            station = st;
            prepared = wasPrepared;
            Index = 0; Score = 0; Streak = 0; PeakCombo = 1f; Errors = 0; HazardHits = 0; HoldBreaks = 0; Elapsed = 0; Finished = false; Stars = 0;
            StepLog.Clear(); InterruptLog.Clear(); GaugeScores.Clear();
            interrupts.Clear();
            foreach (var it in st.interrupts) interrupts.Add(new InterruptState { it = it });
            active = null;
            EnterStep();
        }

        void Update() { if (tickInUpdate && station != null && !Finished) Tick(Time.deltaTime); }

        void EnterStep()
        {
            var step = Current;
            stepStartedAt = Elapsed; stepErrors = 0; stepHazards = 0;
            sequence.Clear(); holdFor = 0; holding = false; gauge = null; track = null; turn = null; drive = null;
            if (step == null) return;
            ArmInterrupts(step.id);
            if (step.kind == "track")
            {
                track = new TrackState();
                var cfg = step.track;
                if (cfg != null)
                {
                    track.v = MiniJson.Num(cfg, "start", 0.1f); track.rise = MiniJson.Num(cfg, "rise", 0.62f); track.fall = MiniJson.Num(cfg, "fall", 0.46f); track.drift = MiniJson.Num(cfg, "drift", 0.1f);
                    var g = MiniJson.Floats(cfg, "green"); if (g.Count == 2) { track.lo = g[0]; track.hi = g[1]; }
                }
                track.wobble = UnityEngine.Random.value * 6f;
            }
            if (step.kind == "gauge")
            {
                gauge = new GaugeState();
                if (step.gauge != null)
                {
                    gauge.speed = MiniJson.Num(step.gauge, "speed", 0.85f);
                    var g = MiniJson.Floats(step.gauge, "green"); if (g.Count == 2) { gauge.lo = g[0]; gauge.hi = g[1]; }
                }
            }
            if (step.kind == "turn") turn = new TurnState { required = step.turn != null ? MiniJson.Num(step.turn, "turns", 1f) : 1f };
            if (step.kind == "drive") drive = MakeDrive(step);
            if (OnStep != null) OnStep(step);
            if (drive != null && OnDrive != null) OnDrive(Pose(drive));
        }

        // ------------------------------------------------------------ input

        /// The learner touched an interactable. Returns the feedback, or null when the touch was harmless.
        public Feedback Select(string hitId)
        {
            if (Finished || Current == null) return null;
            if (active != null) return ResolveInterrupt(hitId);
            var step = Current;
            switch (step.kind)
            {
                case "sequence": return SelectInSequence(hitId, step, step.anyOrder);
                case "find": return SelectInSequence(hitId, step, true);
                case "gauge":
                    if (hitId == step.target || hitId == "gauge-commit") return CommitGauge();
                    return Wrong(hitId, "Set the gauge first, then commit the reading.");
                case "hold":
                case "track":
                case "turn":
                case "drag":
                    return hitId == step.target ? null : Wrong(hitId);
                case "drive":
                    if (hitId == step.target || (drive != null && drive.controls.ContainsValue(hitId))) return null;
                    return Wrong(hitId);
                case "select":
                default:
                    return hitId == step.target ? Advance(StepPoints) : Wrong(hitId);
            }
        }

        Feedback SelectInSequence(string hitId, Step step, bool anyOrder)
        {
            if (sequence.Contains(hitId)) return Emit(new Feedback(FeedbackKind.Partial, "Already verified — " + Name(step, hitId) + "."));
            string expected = anyOrder ? (step.targets.Contains(hitId) ? hitId : null) : (sequence.Count < step.targets.Count ? step.targets[sequence.Count] : null);
            if (hitId == expected)
            {
                sequence.Add(hitId);
                if (sequence.Count == step.targets.Count) return Advance(StepPoints + 20 * (step.targets.Count - 1));
                string note; step.itemNotes.TryGetValue(hitId, out note);
                return Emit(new Feedback(FeedbackKind.Partial, sequence.Count + "/" + step.targets.Count + " — " + Name(step, hitId) + "." + (note != null ? " " + note : " Keep going.")));
            }
            string decoy; if (step.decoyNotes.TryGetValue(hitId, out decoy)) return Wrong(hitId, decoy);
            if (step.targets.Contains(hitId)) return Wrong(hitId, step.outOfOrderNote ?? "Out of order. Sequence matters here — reset and take them in the required order.", true);
            return Wrong(hitId);
        }

        static string Name(Step step, string hitId) { string n; return step.itemNames.TryGetValue(hitId, out n) ? n : hitId; }

        /// Hold and track steps: the target is being pressed (true) or released (false).
        public void SetHolding(bool on)
        {
            var step = Current;
            if (step == null) return;
            if (step.kind == "track") { holding = on; return; }
            if (step.kind != "hold") return;
            holding = on;
            if (!on && holdFor > 0 && holdFor < step.seconds)
            {
                holdFor = 0; HoldBreaks++;
                Emit(new Feedback(FeedbackKind.Warn, step.holdBreakNote ?? "Released too early — start the full duration again."));
            }
        }

        public float GaugeT { get { return gauge != null ? gauge.t : 0f; } }
        public float TrackValue { get { return track != null ? track.v : 0f; } }
        public float TurnAmount { get { return turn != null ? turn.amount : 0f; } }

        public Feedback CommitGauge()
        {
            var step = Current;
            if (gauge == null || gauge.committed) return null;
            float t = gauge.t;
            gauge.committed = true;
            if (t < gauge.lo || t > gauge.hi)
            {
                gauge.committed = false;
                string miss = step.gauge != null ? MiniJson.Str(step.gauge, "missNote") : null;
                return Wrong(step.target, miss ?? "Outside the acceptable band. Watch the marker and commit inside the green zone.");
            }
            float centre = (gauge.lo + gauge.hi) / 2f, half = (gauge.hi - gauge.lo) / 2f;
            float accuracy = Mathf.Max(0f, 1f - Mathf.Abs(t - centre) / half);
            GaugeScores.Add(accuracy);
            int bonus = Mathf.RoundToInt(50f * accuracy);
            return Advance(StepPoints + bonus, bonus >= 40 ? "Dead centre." : null);
        }

        /// Turn steps: a signed fraction of one full turn. Turning back is free.
        public Feedback Rotate(string hitId, float deltaTurns)
        {
            var step = Current;
            if (Finished || step == null || step.kind != "turn" || hitId != step.target || turn == null) return null;
            turn.amount = Mathf.Clamp(turn.amount + deltaTurns, 0f, turn.required);
            return turn.amount >= turn.required ? Advance(StepPoints) : null;
        }

        public bool CanDrag(string hitId) { var s = Current; return !Finished && s != null && s.kind == "drag" && hitId == s.target; }

        /// Drag steps: the carried object was released `distance` metres from the socket (null for no useful distance).
        public Feedback DropAt(string hitId, float? distance)
        {
            var step = Current;
            if (Finished || step == null || step.kind != "drag" || hitId != step.target) return null;
            float radius = step.drag != null ? MiniJson.Num(step.drag, "radius", 0.35f) : 0.35f;
            if (distance.HasValue && distance.Value <= radius) return Advance(StepPoints);
            string miss = step.drag != null ? MiniJson.Str(step.drag, "missNote") : null;
            return Emit(new Feedback(FeedbackKind.Partial, miss ?? "Not quite lined up — line it up with the marker and try again."));
        }

        // ------------------------------------------------------------ drive

        DriveState MakeDrive(Step step)
        {
            var cfg = step.drive ?? new Dictionary<string, object>();
            var d = new DriveState { path = new List<Vector2>(), cum = new List<float> { 0f }, controls = new Dictionary<string, string>(), forbid = new Dictionary<string, string>(), plan = new List<DriveCheck>() };
            foreach (var p in MiniJson.List(cfg, "path"))
            {
                var pt = p as List<object>;
                if (pt != null && pt.Count >= 2 && pt[0] is double && pt[1] is double) d.path.Add(new Vector2((float)(double)pt[0], (float)(double)pt[1]));
            }
            if (d.path.Count < 2) { d.path.Clear(); d.path.Add(new Vector2(0, 0)); d.path.Add(new Vector2(0, 4)); }
            for (int i = 1; i < d.path.Count; i++) d.cum.Add(d.cum[i - 1] + Vector2.Distance(d.path[i - 1], d.path[i]));
            d.total = d.cum[d.cum.Count - 1];
            var band = MiniJson.Floats(cfg, "speedBand");
            d.lo = band.Count == 2 ? band[0] : 3f; d.hi = band.Count == 2 ? band[1] : 8f;
            float width = Mathf.Max(1f, d.hi - d.lo);
            d.laneWidth = MiniJson.Num(cfg, "laneWidth", 1.4f);
            d.reverse = MiniJson.Bool(cfg, "reverse");
            d.grace = MiniJson.Num(cfg, "graceSeconds", 1.5f);
            d.ramp = MiniJson.Num(cfg, "rampSeconds", 4f);
            d.sceneRate = MiniJson.Num(cfg, "sceneRate", 0.2f);
            d.accel = MiniJson.Num(cfg, "accel", Mathf.Max(2f, width * 1.2f));
            d.maxSpeed = MiniJson.Num(cfg, "maxSpeed", d.hi * 1.6f + 2f);
            d.steerRate = MiniJson.Num(cfg, "steerRate", d.laneWidth * 0.9f);
            d.driftK = MiniJson.Num(cfg, "driftK", 0.35f);
            d.controls = MiniJson.StringMap(cfg, "controls");
            d.forbid = MiniJson.StringMap(cfg, "forbid");
            d.laneNote = MiniJson.Str(cfg, "laneNote"); d.speedNote = MiniJson.Str(cfg, "speedNote"); d.wrongSignalNote = MiniJson.Str(cfg, "wrongSignalNote");
            float w = MiniJson.Num(cfg, "checkWindow", Mathf.Max(1.2f, d.total * 0.12f));
            var notes = MiniJson.StringMap(cfg, "checkNotes");
            foreach (var c in MiniJson.List(cfg, "checks"))
            {
                var cd = c as Dictionary<string, object>;
                if (cd == null) continue;
                int at = Mathf.Clamp((int)MiniJson.Num(cd, "at", 0f), 0, d.cum.Count - 1);
                float dist = d.cum[at];
                string kind = MiniJson.Str(cd, "kind");
                string note = MiniJson.Str(cd, "note"); if (note == null) notes.TryGetValue(kind ?? "", out note);
                d.plan.Add(new DriveCheck { kind = kind, from = Mathf.Max(0f, dist - w), to = Mathf.Min(d.total, dist + w), note = note });
            }
            return d;
        }

        DrivePose Pose(DriveState d)
        {
            int n = d.path.Count;
            float dist = Mathf.Clamp(d.s, 0f, d.total);
            int i = 1; while (i < n - 1 && d.cum[i] < dist) i++;
            Vector2 a = d.path[i - 1], b = d.path[i];
            float len = Mathf.Max(1e-6f, d.cum[i] - d.cum[i - 1]);
            float u = (dist - d.cum[i - 1]) / len;
            float tx = (b.x - a.x) / len, tz = (b.y - a.y) / len;
            float px = a.x + (b.x - a.x) * u, pz = a.y + (b.y - a.y) * u;
            float heading = Mathf.Atan2(tx, tz);
            if (d.reverse) heading = Mathf.Repeat(heading + Mathf.PI + Mathf.PI, Mathf.PI * 2f) - Mathf.PI;
            return new DrivePose { x = px + -tz * d.offset, z = pz + tx * d.offset, heading = heading, s = d.s, total = d.total, reverse = d.reverse };
        }

        float Curvature(DriveState d)
        {
            // Turn rate around s, from the headings a little either side.
            float h = 0.5f;
            float s0 = Mathf.Clamp(d.s - h, 0f, d.total), s1 = Mathf.Clamp(d.s + h, 0f, d.total);
            if (s1 - s0 < 1e-4f) return 0f;
            var save = d.s; d.s = s0; float h0 = Pose(d).heading; d.s = s1; float h1 = Pose(d).heading; d.s = save;
            float da = Mathf.Repeat(h1 - h0 + Mathf.PI, Mathf.PI * 2f) - Mathf.PI;
            return da / (s1 - s0);
        }

        /// Continuous vehicle input each frame: throttle in [-1, 1] (below zero brakes), steer in [-1, 1] (positive is right).
        public Feedback DriveInput(float throttle, float steer, bool brake = false)
        {
            var d = drive;
            if (Finished || d == null || Current == null || Current.kind != "drive") return null;
            float t = brake ? -1f : Mathf.Clamp(throttle, -1f, 1f);
            d.throttle = t; d.steer = Mathf.Clamp(steer, -1f, 1f);
            if (!d.started && t > 0.05f) { d.started = true; d.startedAt = Elapsed; }
            bool braking = t < -0.4f;
            Feedback fb = null;
            if (braking && !d.braking) fb = DriveControl("brake");
            d.braking = braking;
            return fb;
        }

        public Feedback DriveControl(string name)
        {
            var d = drive;
            if (d == null || active == null) return null;
            string id; if (!d.controls.TryGetValue(name, out id) || id != active.it.target) return null;
            return ResolveInterrupt(id);
        }

        /// A discrete check on a drive step (mirror-left, signal-right, horn, lights, gear-up ...), credited inside its window.
        public Feedback DriveCheckDone(string kind)
        {
            var d = drive;
            var step = Current;
            if (Finished || d == null || step == null || step.kind != "drive" || string.IsNullOrEmpty(kind)) return null;
            string ctl;
            if (active != null && d.controls.TryGetValue(kind, out ctl) && ctl == active.it.target) return ResolveInterrupt(ctl);
            DriveCheck due = null;
            foreach (var c in d.plan) if (!c.done && !c.missed && c.kind == kind && d.s >= c.from && d.s <= c.to) { due = c; break; }
            string forbidden; if (d.forbid.TryGetValue(kind, out forbidden) && due == null) return Wrong(step.target, forbidden);
            if (due != null)
            {
                due.done = true;
                int left = 0; foreach (var c in d.plan) if (!c.done && !c.missed) left++;
                return Emit(new Feedback(FeedbackKind.Partial, kind + " — on time." + (due.note != null ? " " + due.note : left > 0 ? " Keep driving." : "")));
            }
            string opposite = kind == "signal-left" ? "signal-right" : kind == "signal-right" ? "signal-left" : null;
            if (opposite != null)
                foreach (var c in d.plan)
                    if (!c.done && !c.missed && c.kind == opposite && d.s >= c.from && d.s <= c.to)
                        return Wrong(step.target, d.wrongSignalNote ?? "Wrong signal. A signal tells every driver and pedestrian round you where you are about to go, and this one told them the opposite.");
            return Emit(new Feedback(FeedbackKind.Partial, "Nothing on this stretch calls for the " + kind + "."));
        }

        Feedback DriveHazard(string note)
        {
            var step = Current;
            Score = Mathf.Max(0, Score - HazardPenalty); Streak = 0; Errors++; stepErrors++; stepHazards++; HazardHits++;
            if (OnHazard != null) OnHazard(step != null ? step.target : null);
            return Emit(new Feedback(FeedbackKind.Danger, "−" + HazardPenalty + " — Unsafe driving. " + note, 0, true));
        }

        Feedback DriveMissed(DriveCheck c)
        {
            Score = Mathf.Max(0, Score - WrongStepPenalty); Streak = 0; Errors++; stepErrors++;
            return Emit(new Feedback(FeedbackKind.Warn, "−" + WrongStepPenalty + " — Missed the " + c.kind + ". " + (c.note ?? "The " + c.kind + " belonged back there, before the point on the route that needed it.")));
        }

        void TickDrive(float dt)
        {
            var d = drive; var step = Current;
            float left = dt;
            while (left > 1e-9f && Current == step && !Finished)
            {
                float h = Mathf.Min(0.05f, left); left -= h;
                if (!d.started) continue;
                float t = d.throttle, coast = d.accel * 0.3f;
                d.speed += (t >= 0 ? t * d.accel - coast : t * d.accel * 2.5f) * h;
                d.speed = Mathf.Clamp(d.speed, 0f, d.maxSpeed);
                float ds = d.speed * d.sceneRate * h;
                d.s = Mathf.Min(d.total, d.s + ds);
                float curvature = Curvature(d);
                float drift = curvature * d.speed * d.sceneRate * d.driftK + Mathf.Sin((Elapsed + d.s) * 1.3f) * 0.04f * d.laneWidth * (d.speed > 0.1f ? 1f : 0f);
                d.offset = Mathf.Clamp(d.offset + (d.steer * d.steerRate + drift) * h, -d.laneWidth * 1.5f, d.laneWidth * 1.5f);
                d.driven += h;
                bool quiet = active != null || Elapsed < d.quietUntil;
                bool inLane = Mathf.Abs(d.offset) <= d.laneWidth / 2f;
                if (d.speed >= d.lo && d.speed <= d.hi) d.reachedBand = true;
                bool early = !d.reachedBand && Elapsed - d.startedAt < d.ramp;
                bool inBandNow = d.speed <= d.hi && (d.speed >= d.lo || early);
                bool inside = inLane && inBandNow;
                if (inside) d.inBand += h; else if (d.wasIn) { d.dropouts++; HoldBreaks++; }
                d.wasIn = inside;
                if (!inLane && !quiet)
                {
                    d.outLane += h;
                    if (d.outLane > d.grace && !d.laneFlagged) { d.laneFlagged = true; DriveHazard(d.laneNote ?? "You left the lane and stayed out of it. On a real road that is the curb, the next lane's traffic or the ditch."); }
                }
                else if (inLane) { d.outLane = 0; d.laneFlagged = false; }
                if (!inBandNow && !quiet)
                {
                    d.outBand += h;
                    if (d.outBand > d.grace && !d.bandFlagged)
                    {
                        d.bandFlagged = true;
                        DriveHazard(d.speedNote ?? (d.speed > d.hi
                            ? "Too fast for this stretch, and for long enough to matter. Speed is the one thing that turns every other mistake into a crash."
                            : "Too slow for this stretch, and for long enough to matter: a vehicle far under the flow of traffic is one the traffic behind has to swerve round."));
                    }
                }
                else if (inBandNow) { d.outBand = 0; d.bandFlagged = false; }
                foreach (var c in d.plan) if (!c.done && !c.missed && d.s > c.to) { c.missed = true; DriveMissed(c); }
                if (d.s >= d.total - 1e-6f && Current == step)
                {
                    foreach (var c in d.plan) if (!c.done && !c.missed) { c.missed = true; DriveMissed(c); }
                    if (OnDrive != null) OnDrive(Pose(d));
                    float share = d.driven > 0 ? d.inBand / d.driven : 1f;
                    GaugeScores.Add(Mathf.Clamp01(share));
                    int clean = Mathf.Max(0, 40 - d.dropouts * 12);
                    Advance(StepPoints + 20 + clean, d.dropouts == 0 ? "In the lane and in the band the whole way." : null);
                    return;
                }
                if (OnDrive != null) OnDrive(Pose(d));
            }
        }

        // -------------------------------------------------------- scoring

        Feedback Emit(Feedback f) { if (OnFeedback != null) OnFeedback(f); return f; }

        Feedback Advance(int points, string extraNote = null)
        {
            var step = Current;
            int earned = Mathf.RoundToInt(points * Combo);
            Score += earned; Streak++; PeakCombo = Mathf.Max(PeakCombo, Combo);
            StepLog.Add(new StepLogEntry
            {
                id = step.id, title = step.title, kind = step.kind, seconds = Mathf.Max(0f, Mathf.Round((Elapsed - stepStartedAt) * 10f) / 10f),
                corrections = stepErrors, hazards = stepHazards, clean = stepErrors == 0 && stepHazards == 0, points = earned,
            });
            var fb = Emit(new Feedback(FeedbackKind.Ok, "+" + earned + " — " + step.title + ". " + (extraNote != null ? extraNote + " " : "") + step.why, earned));
            Index++;
            if (Index >= station.steps.Count) Finish(); else EnterStep();
            return fb;
        }

        Step LaterStep(string hitId)
        {
            for (int i = Index + 1; i < station.steps.Count; i++)
            {
                var s = station.steps[i];
                if (s.target == hitId || s.targets.Contains(hitId)) return s;
            }
            return null;
        }

        Feedback Wrong(string hitId, string note = null, bool isOrderError = false)
        {
            string hazard; station.hazards.TryGetValue(hitId ?? "", out hazard);
            var later = hazard != null ? null : LaterStep(hitId);
            int penalty = hazard != null ? HazardPenalty : WrongStepPenalty;
            Score = Mathf.Max(0, Score - penalty); Streak = 0; Errors++; stepErrors++;
            if (hazard != null) stepHazards++;
            string lateNote = null;
            if (later != null && !station.lateNotes.TryGetValue(hitId, out lateNote)) lateNote = "That control belongs to a later step. " + (Current != null ? Current.prompt : "");
            string body = hazard ?? note ?? lateNote ?? ("That is not the next control. " + (Current != null ? Current.prompt : ""));
            string label = hazard != null ? "Unsafe action" : isOrderError ? "Out of sequence" : later != null ? "Too early" : "Wrong step";
            if (hazard != null) { HazardHits++; if (OnHazard != null) OnHazard(hitId); }
            return Emit(new Feedback(hazard != null ? FeedbackKind.Danger : FeedbackKind.Warn, "−" + penalty + " — " + label + ". " + body, 0, hazard != null));
        }

        // --------------------------------------------------- interruptions

        void ArmInterrupts(string stepId)
        {
            foreach (var s in interrupts)
            {
                if (!s.fired && s.armedAt.HasValue && s.it.after != stepId) s.armedAt = null;
                if (!s.fired && s.it.after == stepId) s.armedAt = Elapsed + s.it.delay;
            }
        }

        void TickInterrupts()
        {
            if (active == null)
            {
                foreach (var s in interrupts)
                {
                    if (!s.fired && s.armedAt.HasValue && Elapsed >= s.armedAt.Value)
                    {
                        s.fired = true; s.firedAt = Elapsed; active = s;
                        if (OnInterrupt != null) OnInterrupt(s.it);
                        break;
                    }
                }
            }
            if (active == null) return;
            if (active.firedAt + active.it.seconds - Elapsed <= 0f) ResolveInterrupt(null);
        }

        public float InterruptSecondsLeft { get { return active == null ? 0f : Mathf.Max(0f, active.firedAt + active.it.seconds - Elapsed); } }

        Feedback ResolveInterrupt(string hitId)
        {
            var s = active;
            if (s == null) return null;
            active = null;
            float took = Mathf.Round((Elapsed - s.firedAt) * 10f) / 10f;
            bool ok = hitId != null && hitId == s.it.target;
            if (drive != null) { drive.quietUntil = Elapsed + 3f; drive.outBand = 0; drive.outLane = 0; }
            s.resolved = ok ? "answered" : hitId != null ? "wrong" : "missed";
            InterruptLog.Add(new InterruptLogEntry { id = s.it.id, alert = s.it.alert, outcome = s.resolved, seconds = took });
            Feedback fb;
            if (ok)
            {
                float speed = Mathf.Max(0f, 1f - took / s.it.seconds);
                int points = InterruptPoints + Mathf.RoundToInt(speed * InterruptSpeedBonus);
                Score += points;
                fb = new Feedback(FeedbackKind.Ok, "+" + points + " — Caught it. " + s.it.why, points);
            }
            else
            {
                Score = Mathf.Max(0, Score - HazardPenalty); Streak = 0; Errors++; stepErrors++; stepHazards++; HazardHits++;
                string body = hitId != null ? (s.it.wrongNote ?? s.it.missNote) : s.it.missNote;
                fb = new Feedback(FeedbackKind.Danger, "−" + HazardPenalty + " — " + (hitId != null ? "Wrong response" : "Missed it") + ". " + body, 0, true);
                if (OnHazard != null) OnHazard(s.it.target);
            }
            if (OnInterruptEnd != null) OnInterruptEnd(s.it);
            return Emit(fb);
        }

        // ------------------------------------------------------------ clock

        public void Tick(float dt)
        {
            if (Finished || station == null) return;
            Elapsed += dt;
            TickInterrupts();
            var step = Current;
            if (step == null) return;
            if (step.kind == "drive" && drive != null) { TickDrive(dt); return; }
            if (step.kind == "gauge" && gauge != null && !gauge.committed)
            {
                gauge.t += gauge.dir * gauge.speed * dt;
                if (gauge.t >= 1f) { gauge.t = 1f; gauge.dir = -1f; }
                if (gauge.t <= 0f) { gauge.t = 0f; gauge.dir = 1f; }
            }
            if (step.kind == "track" && track != null)
            {
                var tr = track;
                tr.v += (holding ? tr.rise : -tr.fall) * dt;
                tr.v += Mathf.Sin((Elapsed + tr.wobble) * 1.7f) * tr.drift * dt;
                tr.v = Mathf.Clamp01(tr.v);
                bool inside = tr.v >= tr.lo && tr.v <= tr.hi;
                if (inside) tr.inBand += dt;
                else { if (tr.wasIn) tr.dropouts++; tr.inBand = Mathf.Max(0f, tr.inBand - dt * 0.8f); }
                tr.wasIn = inside;
                if (tr.inBand >= step.seconds)
                {
                    int clean = Mathf.Max(0, 40 - tr.dropouts * 12);
                    Advance(StepPoints + 20 + clean, tr.dropouts == 0 ? "Held it clean the whole way." : null);
                }
                return;
            }
            if (step.kind == "hold" && holding)
            {
                holdFor = Mathf.Min(step.seconds, holdFor + dt);
                if (holdFor >= step.seconds) { holding = false; Advance(StepPoints + 25); }
            }
        }

        void Finish()
        {
            if (Finished) return;
            Finished = true;
            float par = station.parSeconds > 0 ? station.parSeconds : 150f;
            TimeBonus = Mathf.Max(0, Mathf.RoundToInt((par - Elapsed) * 2f));
            Score += TimeBonus;
            if (prepared) { PreparedBonusPoints = Mathf.RoundToInt(Score * PreparedBonus); Score += PreparedBonusPoints; }
            Stars = Errors == 0 && Elapsed <= par ? 3 : Errors <= 1 && Elapsed <= par * 1.5f ? 2 : 1;
            if (OnFinish != null) OnFinish(this);
        }

        /// The record this run writes, in the shape WebXR/shared/records.js stores.
        public TrainingRecord ToRecord(string learner = null)
        {
            var r = new TrainingRecord
            {
                app = station.app, simId = station.id, simName = station.name, category = station.category, trade = station.trade,
                certification = station.certification, system = station.gameSystem, score = Score, stars = Stars, errors = Errors,
                hazardHits = HazardHits, holdBreaks = HoldBreaks, seconds = Mathf.RoundToInt(Elapsed), parSeconds = Mathf.RoundToInt(station.parSeconds),
                learner = learner,
            };
            foreach (var s in StepLog) r.debrief.steps.Add(s);
            r.debrief.totalSteps = station.steps.Count;
            foreach (var s in StepLog) if (s.clean) r.debrief.cleanSteps++;
            if (InterruptLog.Count > 0)
            {
                r.interrupts = new InterruptTally { total = interrupts.Count };
                foreach (var l in InterruptLog)
                {
                    if (l.outcome == "answered") r.interrupts.answered++;
                    else if (l.outcome == "wrong") r.interrupts.wrong++;
                    else r.interrupts.missed++;
                    r.interrupts.log.Add(l);
                }
            }
            r.Seal();
            return r;
        }
    }
}
