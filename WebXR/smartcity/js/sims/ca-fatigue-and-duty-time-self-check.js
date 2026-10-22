import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, decal, repaint, signFace, paperFace, mat, standingFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fatigue and Duty-Time Self-Check VR — Airline Cabin and
// Flight Crew, station eight, the crew rest area rather than the cabin or
// the flight deck. Nothing here states an hour, a rest-period length or a
// duty-time limit — those live entirely in the airline's own fatigue risk
// management policy, never guessed at by this platform. What this station
// actually teaches is the habit around that policy: an honest self-
// assessment before signing in, a rest facility actually fit to rest in, a
// no-fault fatigue call-in used without hesitation the moment it's needed,
// and a handoff to relief crew that says so plainly if that crew member is
// not actually fit to fly.

const CAFD_ACCENT = 0x7a8fa3;

export const SIM_CA_FATIGUE_AND_DUTY_TIME_SELF_CHECK = {
  id: "ca-fatigue-and-duty-time-self-check",
  index: "ca-8",
  domain: "Aviation",
  trade: "Flight attendant and airline pilot — AFA-CWA and ALPA crew",
  category: "Mobility & Transit",
  certification: "AFA-CWA and ALPA member fatigue-awareness training; the airline's own fatigue risk management policy under 14 CFR 121 — no duty-time limit, rest-period length or numeric fatigue score is stated here, every threshold runs per the airline's own policy",
  name: "Fatigue and Duty-Time Self-Check",
  title: simTitle("Fatigue and Duty-Time Self-Check"),
  tagline: "An honest self-assessment before signing in, a rest facility actually fit to rest in, a no-fault fatigue call-in used without hesitation, and a handoff to relief crew that says so plainly if they aren't actually fit to fly — no hour or duty limit stated anywhere",
  accent: CAFD_ACCENT,
  accentCss: "#7a8fa3",
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "fit-for-duty", name: "Fit for Duty Certified", note: "An honest self-assessment, a rest facility actually checked, a no-fault fatigue call made without hesitation, and a relief handoff that told the truth" },

  supportLine: "your AFA-CWA or ALPA local's member assistance resources, or the airline's own employee assistance line — fatigue is a safety issue this crew's own unions built a no-fault reporting line to actually hear about",

  game: system({
    name: "Fit for Duty",
    currency: "REST",
    ranks: ["New Crew Member", "Line Qualified", "Lead Crew", "Check Instructor", "Fit for Duty Certified"],
    badges: [
      { id: "honest-selfcheck", name: "Honest Self-Check", note: "Completed the alertness self-assessment honestly before signing in", test: AWARD.stepClean("self-assess-alertness") },
      { id: "no-fault-call", name: "No-Fault Call Made", note: "Called in fatigued without hesitation when the self-check called for it", test: AWARD.stepClean("report-fatigue-line") },
      { id: "alarm-tested", name: "Alarm Tested", note: "Actually tested the wake alarm rather than trusting it untested", test: AWARD.stepClean("test-wake-alarm") },
    ],
    challenges: [
      { id: "clean-check", name: "Clean Check", note: "No corrections anywhere in the self-check", test: AWARD.clean },
      { id: "steady-vigilance", name: "Steady Attention", note: "Held the vigilance check the full count, first try", test: AWARD.unbroken },
      { id: "fast-check", name: "Fast Check", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "messy-bunk-hazard": "That rest bunk still has the last crew member's bedding on it. A rest facility that isn't actually reset between users is a rest facility the next tired crew member cannot trust is even clean, let alone quiet enough to actually rest in.",
    "noise-source-hazard": "That equipment is running loudly right next to the rest area. A rest period spent next to a noise nobody addressed is not actually rest, whatever the schedule says this crew member was given the time for.",
    "pressure-not-to-report-decoy": "That note says the flight needs covering, so don't call in fatigued. A no-fault fatigue report exists specifically so a genuinely tired crew member can say so without a schedule pressure like this one weighing against it — the pressure is the thing that gets ignored here, not the honest report.",
    "untested-alarm-decoy": "That wake alarm has never actually been tested. A rest period that ends on an alarm nobody confirmed works is a rest period that might not end when this crew member actually needs it to.",
  },

  lateNotes: {
    "fatigue-report-line": "Not yet — the self-assessment comes first. Whether this call is even needed depends on being honest about that first.",
    "brief-relief-crew": "Hold that. The self-check has to actually be complete before there's anything honest to hand off to relief crew.",
  },

  steps: [
    {
      id: "pull-fatigue-policy", kind: "select", target: "fatigue-policy-card",
      title: "Pull the fatigue risk management policy",
      cue: "Open the airline's own fatigue policy before signing in for duty.",
      why: "This policy is what actually defines every threshold this station respects — reading it first is what keeps this self-check honest to the airline's own standard instead of this crew member's own guess at what's probably fine.",
    },
    {
      id: "self-assess-alertness", kind: "select", target: "alertness-self-assessment",
      title: "Complete the alertness self-assessment",
      cue: "Answer the self-assessment honestly before signing in for duty.",
      why: "This self-assessment only protects anyone if it's answered honestly — a crew member who talks themselves into a better answer than the one that's actually true has removed the one check standing between fatigue and a flight this crew member should not have signed in for.",
    },
    {
      id: "review-personal-factors", kind: "sequence", anyOrder: true,
      targets: ["sleep-log-reviewed", "commute-time-logged"],
      itemNames: { "sleep-log-reviewed": "review the sleep log", "commute-time-logged": "log the commute time" },
      title: "Review the factors behind the number",
      cue: "Review the sleep log and log today's commute time before relying on the self-assessment alone.",
      why: "The self-assessment score means more once it's read against what's actually behind it — the sleep log and the commute time are the two facts this crew member has that the score alone doesn't carry on its own.",
    },
    {
      id: "scan-rest-area", kind: "find", noHint: true,
      targets: ["messy-bunk", "noise-source"],
      itemNames: { "messy-bunk": "a rest bunk that wasn't reset for the next crew member", "noise-source": "loud equipment running next to the rest area" },
      itemNotes: {
        "messy-bunk": "This gets reset now — a bunk left as the last user left it is not actually ready for whoever needs it next.",
        "noise-source": "This gets flagged and addressed — a rest area next to something this loud isn't actually a rest area, whatever it's labelled.",
      },
      title: "Scan the rest area before using it",
      cue: "Two things about this rest area aren't right. Find them before trusting it for real rest.",
      why: "A rest period only does what it's meant to if the facility it happens in actually supports rest — this scan is what catches the difference between a rest area on paper and one that actually works before this crew member is relying on it.",
    },
    {
      id: "confirm-rest-facility", kind: "select", target: "rest-bunk",
      title: "Confirm the rest facility is ready",
      cue: "Confirm the bunk, the curtain and the temperature are all actually set for rest.",
      why: "Confirming this now, before lying down, is what turns a facility that's merely available into one this crew member can actually count on for the rest period it's meant to provide.",
    },
    {
      id: "test-wake-alarm", kind: "hold", target: "wake-alarm-test", seconds: 5,
      title: "Test the wake alarm",
      cue: "Hold the test button and confirm the wake alarm actually sounds before relying on it.",
      why: "An alarm that looks set and an alarm that's actually confirmed to sound are two different facts, and the only way to know the second one is true is testing it now, not trusting it for the one moment it actually has to work.",
      holdBreakNote: "Let go before the alarm actually sounded. An untested alarm is exactly the kind of assumption this rest period cannot afford to rely on.",
    },
    {
      id: "set-rest-environment", kind: "turn", target: "rest-temperature-dial",
      title: "Set the rest area temperature",
      cue: "Turn the dial to a comfortable setting for actual rest, per the facility's own controls.",
      turn: { turns: 0.3, axis: "y", label: "REST TEMP" },
      why: "A rest period spent too hot or too cold to actually settle into sleep is a rest period that only counted on the schedule, not in practice — setting this now is a small step that makes the difference between the two.",
    },
    {
      id: "fatigue-risk-check", kind: "gauge", target: "fatigue-risk-gauge",
      title: "Read the fatigue risk indicator",
      cue: "Check the fatigue risk indicator and read it honestly against the self-assessment already given.",
      gauge: { label: "FATIGUE RISK", speed: 0.55, green: [0, 0.5], readout: (t) => (t > 0.5 ? "elevated — consider reporting" : "within normal range"), missNote: "Signed in without reading this indicator honestly against the self-assessment. A risk indicator only helps if its reading is actually looked at before, not after, signing in." },
      why: "This indicator exists to be read honestly against the self-assessment this crew member already gave — it only protects anyone if the reading that comes back elevated is actually acted on, not glossed over on the way to signing in.",
    },
    {
      id: "vigilance-check", kind: "track", target: "vigilance-indicator", seconds: 6,
      title: "Complete the brief vigilance check",
      cue: "Keep the vigilance indicator steady in the target band for the whole check.",
      track: { start: 0.3, green: [0.4, 0.65], rise: 0.32, fall: 0.3, drift: 0.15, label: "VIGILANCE", readout: (v) => (v < 0.4 ? "attention lapsing" : v > 0.65 ? "overcorrecting" : "steady") },
      holdBreakNote: "Attention lapsed during the check. A vigilance check that drifts out of band is exactly the kind of early signal this self-check is designed to surface.",
      why: "A brief, steady vigilance check is a second honest data point alongside the self-assessment — attention that keeps lapsing here is worth noticing now, in a training exercise, rather than for the first time on an actual flight.",
    },
    {
      id: "report-fatigue-line", kind: "select", target: "fatigue-report-line",
      title: "Call the no-fault fatigue line if needed",
      cue: "Call the no-fault fatigue reporting line the moment the self-check calls for it — no hesitation.",
      why: "This line exists specifically so a genuinely tired crew member can say so without it counting against them — using it the moment it's actually called for is the entire point of building a no-fault system in the first place.",
    },
    {
      id: "log-duty-time", kind: "select", target: "duty-time-log",
      title: "Log the duty time",
      cue: "Record the actual start and end times for this duty period in the logbook.",
      why: "An honest, actual-time log is what the airline's own fatigue policy is checked against later — a log that rounds favorably or gets filled in from memory afterward is a log that can no longer be trusted to catch a pattern building over several duty periods.",
    },
    {
      id: "handoff-briefing", kind: "sequence", anyOrder: false,
      targets: ["brief-relief-crew", "confirm-relief-alert"],
      itemNames: { "brief-relief-crew": "brief the relief crew member", "confirm-relief-alert": "confirm they're actually alert" },
      title: "Brief relief crew, then confirm they're alert",
      cue: "Brief the relief crew member on the handoff, then confirm — honestly — that they're actually alert enough to take over.",
      why: "A handoff briefing that skips the honest question about alertness hands off a risk along with the job — confirming it out loud, after the briefing, is what makes this crew member's own honesty about fitness for duty something the next person actually benefits from too.",
      outOfOrderNote: "Brief first, then confirm alertness — asking about fitness before the handoff has even been explained skips the context that question needs.",
    },
    {
      id: "log-fatigue-selfcheck", kind: "select", target: "fatigue-selfcheck-log",
      title: "Log the self-check",
      cue: "Record that the self-check was completed, including anything flagged.",
      why: "This log is what lets the airline's own fatigue risk management program see patterns across many crew members over time — a self-check that was actually done but never logged is invisible to the one system built to catch problems this platform, or any one flight, cannot see on its own.",
    },
  ],

  interrupts: [
    {
      id: "scheduling-calls-for-extension",
      kind: "Scheduling calls asking for a duty extension",
      after: "confirm-rest-facility", delay: 3, seconds: 12,
      alert: "Crew scheduling calls mid-rest asking this crew member to extend today's duty to cover a gap.",
      cue: "That gets deferred to the fatigue policy, not agreed to on the spot.",
      target: "defer-to-policy",
      why: "Agreeing to an extension mid-rest, before the rest period is even finished, is exactly the kind of pressure the fatigue policy exists to answer instead of this crew member's own instinct to help out — the honest answer is checking the policy, not saying yes to make scheduling's problem go away.",
      missNote: "The extension got agreed to on the spot, mid-rest, with no reference to the fatigue policy at all. That's the exact pressure this policy was written to take out of one tired crew member's hands.",
      wrongNote: "Defer to the fatigue policy — this isn't a decision to make on the phone mid-rest.",
    },
    {
      id: "alarm-fails-live",
      kind: "The wake alarm fails during the actual rest period",
      after: "vigilance-check", delay: 3, seconds: 12,
      alert: "The primary wake alarm fails to sound as the rest period is ending.",
      cue: "That's exactly why a backup method exists — use it now.",
      target: "backup-wake-method",
      why: "A tested primary alarm that still fails is not a reason to skip waking up on time — it's exactly the situation the backup method exists for, and using it immediately is what keeps one equipment failure from turning into a missed sign-in.",
      missNote: "The failed alarm went unaddressed with no backup used. A single point of failure on something this important is exactly what a backup method exists to catch.",
      wrongNote: "Use the backup wake method now — a failed primary alarm is exactly why it exists.",
    },
  ],

  build(root) {
    const hits = {};
    const g = root;
    stationPad(g, 2.4, CAFD_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#2a3038"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#242a30";
      for (let i = 0; i < 5; i++) cx.fillRect(0, (i * h) / 5, w, 2);
    }, { repeat: 4, px: 256 });
    const floorMat = texturedMat(floorTex, { rough: 0.7, metal: 0.05, color: 0x353c44 });
    const floor = box(g, 3.2, 0.06, 3.2, 0, -0.03, 0, 0xffffff, { rough: 0.7, cast: false });
    floor.material = floorMat;

    const policyCard = decal(g, 0.3, 0.4, -1.3, 1.3, -1.2,
      paperFace("FATIGUE POLICY", ["Self-assess honestly", "No-fault reporting"], { bg: "#fbf3df", band: "#4a5a6a" }), { px: 220 });
    reg(hits, policyCard, "fatigue-policy-card");

    const assessPanel = instrument(g, -1.1, 1.1, -0.9, { idle: "ASSESS", color: CAFD_ACCENT, w: 0.18, d: 0.2, ry: 0.6 });
    holoTag(assessPanel, "alertness self-assessment", 0, 0.2, 0, { css: "#7a8fa3", w: 0.44 });
    reg(hits, assessPanel, "alertness-self-assessment");

    const sleepLog = decal(g, 0.18, 0.12, -0.6, 0.9, -1.0,
      paperFace("SLEEP LOG", ["Last 24h"], { bg: "#eef1f4" }), { px: 160 });
    reg(hits, sleepLog, "sleep-log-reviewed");
    const commuteLog = decal(g, 0.18, 0.12, -0.3, 0.9, -1.0,
      paperFace("COMMUTE", ["Time logged"], { bg: "#eef1f4" }), { px: 160 });
    reg(hits, commuteLog, "commute-time-logged");

    // ------------------------------------------------------------------ rest bunk
    const bunk = box(g, 0.8, 0.3, 1.8, 1.1, 0.5, -0.6, 0x6b5a4a, { rough: 0.6 });
    holoTag(bunk, "rest bunk", 0, 0.24, 0, { css: "#7a8fa3", w: 0.32 });
    reg(hits, bunk, "rest-bunk");
    const messyBedding = box(g, 0.7, 0.1, 1.6, 1.1, 0.7, -0.6, 0xc9a06a, { rough: 0.8 });
    holoTag(messyBedding, "bedding not reset", 0, 0.1, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, messyBedding, "messy-bunk");
    reg(hits, messyBedding, "messy-bunk-hazard");
    const curtain = box(g, 0.04, 1.2, 1.8, 1.5, 0.9, -0.6, 0x3a4048, { rough: 0.7, opacity: 0.6, transparent: true });
    void curtain;

    const noiseEquip = box(g, 0.4, 0.5, 0.3, 1.5, 0.25, 0.6, 0x8b929a, { rough: 0.5, metal: 0.3 });
    holoTag(noiseEquip, "loud equipment", 0, 0.5, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, noiseEquip, "noise-source");
    reg(hits, noiseEquip, "noise-source-hazard");

    const tempDial = cyl(g, 0.05, 0.05, 0.04, 1.6, 0.8, -1.1, 0x8b98a5, { rough: 0.4, metal: 0.5, seg: 12 });
    holoTag(tempDial, "rest temperature", 0, 0.1, 0, { css: "#7a8fa3", w: 0.4 });
    reg(hits, tempDial, "rest-temperature-dial");

    const alarmClock = box(g, 0.14, 0.08, 0.1, 0.9, 0.85, -1.15, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(alarmClock, "wake alarm", 0, 0.1, 0, { css: "#7a8fa3", w: 0.32 });
    const alarmTestBtn = ball(alarmClock, 0.02, 0, 0.06, 0.03, 0xf2c14b, { rough: 0.4, emissive: 0xf2c14b, ei: 0.5, seg: 10 });
    reg(hits, alarmTestBtn, "wake-alarm-test");
    const untestedTag = decal(g, 0.14, 0.06, 0.9, 0.95, -1.15,
      paperFace("", ["NEVER TESTED"], { bg: "#fbe0df", band: "#c9302b" }), { px: 120 });
    reg(hits, untestedTag, "untested-alarm-decoy");
    const backupAlarm = box(g, 0.1, 0.1, 0.06, 1.15, 0.85, -1.15, 0xf2c14b, { rough: 0.6 });
    holoTag(backupAlarm, "backup wake method", 0, 0.1, 0, { css: "#7a8fa3", w: 0.4 });
    reg(hits, backupAlarm, "backup-wake-method");

    const fatigueGauge = instrument(g, -1.3, 1.0, 0.4, { idle: "-- RISK", color: CAFD_ACCENT, w: 0.16, d: 0.2, ry: 0.9 });
    holoTag(fatigueGauge, "fatigue risk indicator", 0, 0.2, 0, { css: "#7a8fa3", w: 0.4 });
    reg(hits, fatigueGauge, "fatigue-risk-gauge");

    const vigilancePanel = instrument(g, -1.3, 0.7, 0.7, { idle: "-- ATT", color: CAFD_ACCENT, w: 0.14, d: 0.18, ry: 0.9 });
    holoTag(vigilancePanel, "vigilance check", 0, 0.16, 0, { css: "#7a8fa3", w: 0.36 });
    reg(hits, vigilancePanel, "vigilance-indicator");

    const fatigueLinePhone = box(g, 0.08, 0.16, 0.06, 1.3, 1.1, 0.9, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(fatigueLinePhone, "no-fault fatigue line", 0, 0.14, 0, { css: "#7a8fa3", w: 0.44 });
    reg(hits, fatigueLinePhone, "fatigue-report-line");
    const pressureNote = decal(g, 0.2, 0.14, 1.5, 1.1, 0.9,
      paperFace("", ["DON'T CALL IN —", "WE NEED COVERAGE"], { bg: "#fbe0df", band: "#c9302b" }), { px: 160 });
    reg(hits, pressureNote, "pressure-not-to-report-decoy");
    const deferPanel = instrument(g, 1.3, 0.8, 0.6, { idle: "DEFER?", color: CAFD_ACCENT, w: 0.16, d: 0.2, ry: -0.6 });
    holoTag(deferPanel, "defer to fatigue policy", 0, 0.2, 0, { css: "#7a8fa3", w: 0.44 });
    reg(hits, deferPanel, "defer-to-policy");
    const schedulingLamp = ball(g, 0.02, 1.3, 1.04, 0.6, 0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 8, seg2: 6 });

    const dutyLog = holoPanel(g, 0.5, 0.34, 1.3, 1.5, -0.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(14,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7a8fa3"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e8edf1";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DUTY TIME LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: open", w * 0.06, h * 0.6);
    }, { accent: CAFD_ACCENT, ry: -0.7 });
    reg(hits, dutyLog, "duty-time-log");

    const reliefCrew = standingFigure(g, -0.05, 1.45, { ry: 1.6, cloth: 0x3f6fa0, skin: 0xd9a985 });
    const briefMark = box(g, 0.3, 0.2, 0.02, -0.6, 1.3, 1.75, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, briefMark, "brief-relief-crew");
    const alertConfirmMark = box(g, 0.3, 0.2, 0.02, -0.6, 1.05, 1.75, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, alertConfirmMark, "confirm-relief-alert");
    void reliefCrew;

    const selfcheckLog = holoPanel(g, 0.5, 0.34, -1.3, 1.6, 0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(14,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7a8fa3"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e8edf1";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SELF-CHECK LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: open", w * 0.06, h * 0.6);
    }, { accent: CAFD_ACCENT, ry: 0.7 });
    reg(hits, selfcheckLog, "fatigue-selfcheck-log");

    const attendant = standingFigure(g, 0.9, 1.9, { ry: -1.6, cloth: 0x1c3a5c, skin: 0xb98a63 });
    void attendant;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.2, -0.4),

      onStepComplete(step) {
        if (step.id === "self-assess-alertness") repaint(assessPanel.userData.screen, signFace("LOGGED", { bg: "#0d1c24", accent: "#59c97b", fg: "#e8edf1", scale: 0.42 }));
        if (step.id === "scan-rest-area") { messyBedding.visible = false; noiseEquip.material = mat(0x59c97b, { rough: 0.5, metal: 0.3 }); }
        if (step.id === "test-wake-alarm") { alarmTestBtn.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 10 }); untestedTag.visible = false; }
        if (step.id === "report-fatigue-line") pressureNote.visible = false;
        if (step.id === "log-duty-time") {
          repaint(dutyLog.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(14,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#7a8fa3"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#e8edf1";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("DUTY TIME LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: logged", w * 0.06, h * 0.6);
          });
        }
        if (step.id === "log-fatigue-selfcheck") {
          repaint(selfcheckLog.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(14,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#7a8fa3"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#e8edf1";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("SELF-CHECK LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: logged", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "scheduling-calls-for-extension") {
          schedulingLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8, seg: 8, seg2: 6 });
          repaint(deferPanel.userData.screen, signFace("SCHEDULING CALLED", { bg: "#2a1610", accent: "#f0645b", fg: "#ffd9d0", scale: 0.32 }));
        }
        if (it.id === "alarm-fails-live") backupAlarm.material = mat(0xf0645b, { rough: 0.6 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "scheduling-calls-for-extension") {
          schedulingLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 8, seg2: 6 });
          repaint(deferPanel.userData.screen, signFace("DEFERRED", { bg: "#0d1c24", accent: "#59c97b", fg: "#e8edf1", scale: 0.4 }));
        }
        if (it.id === "alarm-fails-live") backupAlarm.material = mat(0x59c97b, { rough: 0.6 });
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge, tk = session?.track;
        if (gg && !gg.committed && session.step?.id === "fatigue-risk-check") {
          repaint(fatigueGauge.userData.screen, signFace(gg.t > 0.5 ? "ELEVATED" : "NORMAL", {
            bg: "#0d1c24", accent: gg.t <= 0.5 ? "#59c97b" : "#f0645b", fg: "#e8edf1", scale: 0.38,
          }));
        }
        if (tk && session.step?.id === "vigilance-check") {
          repaint(vigilancePanel.userData.screen, signFace(tk.readout ?? "--", {
            bg: "#0d1c24", accent: tk.inBand ? "#59c97b" : "#f0645b", fg: "#e8edf1", scale: 0.4,
          }));
        }
        void t;
      },
    };
  },
};
