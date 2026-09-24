import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, mat, gradientFill, noiseTexture } from "../../../shared/kit.js";
import { tractorTrailer, flArticulate, sedan } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Freeway Merge and Following Distance VR — Mobility & Transit,
// the second deep driving station in the Job Readiness Edition. A loaded
// tractor-trailer up an on-ramp and into freeway traffic: build speed on the
// ramp, signal, find a gap in the left mirror and take it without forcing
// anybody; then the space cushion — a following distance counted in seconds,
// the way the state CDL handbook teaches it — a lane change to make room for
// the next merge, a car that dives into the gap in front, and an exit ramp
// with the traffic queued round the curve.
//
// The freeway is drawn as a half-scale arc round the north of the pad and the
// course runs at reduced time, so the HUD's speed is the band a trainee holds
// and not a limit: every speed in the station's text is "per the posted
// limit". The only number quoted is the handbook's own following-distance
// rule, attributed to it. Sited generically: no real highway or carrier.

const DRF_ACCENT = 0x7fc97a;
const DRF_CSS = "#7fc97a";
const DRF_SCALE = 0.5;

export const SIM_DRIVE_FREEWAY_MERGE_AND_FOLLOWING_DISTANCE = {
  id: "drive-freeway-merge-and-following-distance",
  index: "319",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, Job Readiness Edition deep driving — Teamsters over-the-road freight: merging, space management and following distance under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "clear",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A curriculum includes space management, speed management and visual search; 49 CFR 383 for the Class A skills test's road portion; 49 CFR 392 for driving a commercial motor vehicle, including the hand-held phone and texting prohibitions; 49 CFR 393 for mirrors, lamps and the four-way flashers; 49 CFR 395 for the duty status at the end of the leg; the state CDL handbook's following-distance rule and merging guidance; CVSA roadside inspection practice; Teamsters (IBT) freight locals' driver training",
  name: "Freeway Merge and Following Distance",
  title: simTitle("Freeway Merge and Following Distance"),
  tagline: "Up the ramp and into traffic: build speed, signal, take a gap you found in the mirror, count your seconds of space, move over for the next merge, and come off at an exit where the queue is round the bend",
  accent: DRF_ACCENT,
  accentCss: DRF_CSS,
  parSeconds: 300,
  footprint: 2.6,
  apron: false,
  badge: { id: "seven-seconds", name: "Seven Seconds", note: "A clean merge, a full space cushion held, a car cutting in handled without drama and the exit queue warned — first time" },

  game: system({
    name: "Space",
    currency: "SECOND",
    ranks: ["Permit Holder", "Highway Trainee", "Freeway Driver", "Linehaul Lead", "Space Certified"],
    badges: [
      { id: "gap-finder", name: "Gap Finder", note: "The merge and the lane change done with every mirror and signal on time", test: AWARD.all(AWARD.stepClean("drf-merge"), AWARD.stepClean("drf-move-over")) },
      { id: "cushion", name: "Cushion Keeper", note: "Never tailgated, passed on the shoulder, stopped at the ramp end or reached for the phone", test: AWARD.safe },
      { id: "steady-foot", name: "Steady Foot", note: "Every drive and the speed hold in band with no excursion", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-leg", name: "Clean Leg", note: "No corrections anywhere", test: AWARD.clean },
      { id: "right-count", name: "Right Count", note: "Following distance and drives near the centre of their bands", test: AWARD.precise(0.8) },
      { id: "on-time", name: "On Time", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "drf-ramp-stop": "You went to stop at the end of the on-ramp and wait for a gap. From a standstill a loaded tractor-trailer needs a long run to get anywhere near the speed of freeway traffic, so a stop at the ramp's end turns a merge into a crawl across lanes of fast cars. Build speed on the ramp and fit into a gap you picked in the mirror.",
    "drf-tailgate": "You went to close up on the car ahead. A heavy vehicle needs far more distance to stop than a car, and following close leaves you nothing when the traffic ahead brakes — the rear-end crash that pushes a car into the next one. Keep the space cushion the handbook gives you, and more in bad weather.",
    "drf-shoulder-pass": "You went to pass on the shoulder. The shoulder is where broken-down vehicles, debris and people changing tyres are, and it is not a lane: passing on it takes the trailer past someone standing beside a car at freeway speed. Stay in the travel lanes and wait.",
    "drf-phone": "You went to pick up the hand-held phone at freeway speed. 49 CFR 392 prohibits hand-held mobile phone use and texting by commercial drivers, and a glance down at freeway speed covers the length of a football field with nobody watching the road.",
  },

  lateNotes: {
    "drf-convex-knob": "The convex mirror is set in the cab before the ramp, not while you are merging.",
    "drf-follow-count": "Count the seconds once you are settled in the lane behind the car ahead — not while you are still merging.",
    "drf-eld-status": "The log changes when the leg ends at the exit, not before.",
  },

  steps: [
    {
      id: "drf-plan", kind: "select", target: "drf-trip-plan",
      title: "Read the leg before you roll",
      cue: "Read the trip plan: the on-ramp, the merge ahead from the right, the exit and the traffic report.",
      why: "A freeway leg is a series of decisions made at speed, so the ones you can make early you make in the cab: which lane you want after the merge, where the next on-ramp will feed traffic in beside you, which exit you need and what the traffic report says about it. A driver who knows the exit is coming does not dive across two lanes for it at the last moment.",
    },
    {
      id: "drf-cab", kind: "sequence",
      targets: ["drf-belt", "drf-mirror-set", "drf-gauges"],
      itemNames: { "drf-belt": "seat belt on", "drf-mirror-set": "flat mirrors set to the trailer's sides", "drf-gauges": "air pressure and temperatures read" },
      title: "Belt, flat mirrors, gauges",
      cue: "Belt first, then the flat mirrors so each shows a strip of trailer and the lane beside it, then read the gauges.",
      why: "Freeway speed turns a small unsecured thing into a big problem: an unbelted driver in a sudden stop, a mirror that shows sky instead of the lane you are merging into, a pressure warning you first notice in the left lane. Each is set in a few seconds before the ramp, and none of them can be fixed safely once the rig is at speed in traffic.",
      outOfOrderNote: "Belt, then mirrors, then gauges — you set mirrors from the driving position, belted in.",
    },
    {
      id: "drf-convex", kind: "turn", target: "drf-convex-knob",
      title: "Set the convex mirror on the no-zone",
      cue: "Turn the convex mirror so it covers the blind area beside the tractor's right door.",
      why: "The flat mirrors show the lanes behind; the convex mirror is what covers the space right beside the tractor, where a car sitting alongside disappears from view. That no-zone is exactly where a merging car or a car you are about to change lanes into will be hiding, so the convex is angled to cover it before you need it.",
      turn: { turns: 0.5, axis: "z", label: "CONVEX MIRROR" },
    },
    {
      id: "drf-merge", kind: "drive", target: "drf-rig",
      title: "Build speed on the ramp and merge",
      cue: "Up a gear as you build speed on the ramp, signal left, find your gap in the left mirror twice, and fit in without forcing anyone.",
      why: "A merge is decided in the mirror, not at the end of the ramp. Building speed on the ramp gives you a chance of matching the traffic; the signal tells the drivers in the right lane you are coming; two looks in the left mirror find a gap and confirm it is still there. The traffic on the freeway has the right of way, and a good merge never makes anyone brake.",
      holdBreakNote: "Out of the lane or out of the band on the ramp. Build speed steadily and hold the ramp's lane until the gap is yours.",
      drive: {
        path: [[-6.2, -1.0], [-6.3, -2.6], [-5.9, -4.1], [-4.76, -5.67], [-3.7, -6.41], [-2.53, -6.95], [-1.28, -7.29]],
        speedBand: [30, 60], laneWidth: 1.5, graceSeconds: 1.8, checkWindow: 1.8, sceneRate: 0.06,
        bandLabel: "matching traffic, per the posted limit",
        checks: [
          { at: 0, kind: "gear-up", note: "Up through the gears on the ramp: the ramp is where the speed for the merge is built." },
          { at: 1, kind: "signal-left", note: "Signal left early on the ramp so the right lane sees you coming." },
          { at: 2, kind: "mirror-left", note: "First look: find the gap you are aiming for." },
          { at: 3, kind: "mirror-left", note: "Second look: confirm the gap is still there before the lines end." },
        ],
        controls: { brake: "drf-brake-pedal" },
        laneNote: "You left the lane and stayed out on the merge — onto the shoulder or across the lane line into traffic.",
      },
    },
    {
      id: "drf-follow", kind: "gauge", target: "drf-follow-count",
      title: "Count your following distance",
      cue: "As the car ahead passes a fixed mark, count the seconds until your cab reaches it. Commit when the count is right for this rig.",
      why: "The state CDL handbook gives the rule in time, not length: at least one second for every ten feet of vehicle length at speeds below 40 mph, and one second more above that — so a sixty-foot rig at freeway speed wants seven seconds. Counting from a fixed mark is how you know you have it, because at speed every gap looks bigger than it is.",
      gauge: { label: "SECONDS", speed: 0.7, green: [0.62, 0.88], readout: (t) => `${Math.round(2 + t * 8)} s`, missNote: "That count is short for a rig this long at this speed — drop back until the car ahead passes the mark seven seconds before you." },
    },
    {
      id: "drf-move-over", kind: "drive", target: "drf-rig",
      title: "Move left for the next merge",
      cue: "Signal left, check the left mirror for your gap, move over into the left lane, then check the right mirror as you settle.",
      why: "Moving left ahead of an on-ramp gives the merging traffic room and keeps you out of the scrum where two streams meet. A lane change in a long rig is slow on purpose: signal first, confirm in the mirror that the lane is clear back past your trailer, move over gradually, then check the right mirror to see the trailer is fully across and what you left behind.",
      holdBreakNote: "Out of lane or band during the lane change — make it slowly and hold your speed while you do.",
      drive: {
        path: [[-1.28, -7.29], [0, -7.4], [1.28, -7.29], [2.7, -7.55], [3.89, -8.34]],
        speedBand: [40, 60], laneWidth: 1.6, graceSeconds: 1.8, checkWindow: 1.6, sceneRate: 0.06,
        bandLabel: "with the flow, per the posted limit",
        checks: [
          { at: 1, kind: "signal-left", note: "Signal before you move, not as you move — the lane you want needs the warning." },
          { at: 2, kind: "mirror-left", note: "Left mirror right back past the trailer: nobody should be in the lane you are about to take." },
          { at: 4, kind: "mirror-right", note: "Right mirror as you settle: the whole trailer is across, and the merging car has its room." },
        ],
        controls: { brake: "drf-brake-pedal" },
      },
    },
    {
      id: "drf-scan", kind: "find", noHint: true,
      targets: ["drf-brake-lights", "drf-shoulder-car", "drf-lane-sign"],
      itemNames: { "drf-brake-lights": "brake lights far ahead", "drf-shoulder-car": "the car on the shoulder with its door open", "drf-lane-sign": "the lane-closed sign ahead" },
      itemNotes: {
        "drf-brake-lights": "Brake lights a long way ahead: the traffic is compressing, and the sooner you ease off the more cushion you keep.",
        "drf-shoulder-car": "A car stopped on the shoulder with its door open — someone may step out. Move over or slow, and give it room.",
        "drf-lane-sign": "A lane-closed sign well ahead. Merging early, with a signal, beats a forced move at the cones.",
      },
      title: "Look well down the road",
      cue: "Scan far ahead and on both shoulders. Find what will change your plan.",
      why: "At freeway speed the things that matter are far away when there is still time to deal with them: brake lights several vehicles ahead, a car on the shoulder, a sign for a lane that is about to close. Looking far ahead, not just at the bumper in front, is what turns an emergency stop into an easy lift of the throttle.",
    },
    {
      id: "drf-cover", kind: "hold", target: "drf-brake-pedal", seconds: 4,
      title: "Cover the brake as traffic bunches",
      cue: "Foot off the throttle and hovering on the brake while the traffic ahead compresses.",
      why: "Covering the brake — foot off the throttle and resting over the pedal — takes the reaction delay out of a stop before you need one. When traffic ahead bunches up, easing off early and covering the brake keeps the space cushion you built instead of eating it, and lets the rig slow smoothly rather than in one hard stab that surprises the driver behind.",
      holdBreakNote: "You came off the brake too soon while the traffic was still bunching — keep covering it until the gaps open again.",
    },
    {
      id: "drf-steady", kind: "track", target: "drf-cruise-hold", seconds: 5,
      title: "Hold a steady speed round the curve",
      cue: "Hold the rig at a steady speed through the long curve — no surging, no drifting back.",
      why: "A steady speed is the kindest thing you can give the traffic round you: drivers behind can predict you, the space in front stays the size you set, and the trailer tracks quietly through a curve instead of being pushed and pulled. Surging and dropping back is also how following distances collapse without the driver noticing.",
      track: { start: 0.2, green: [0.44, 0.64], rise: 0.5, fall: 0.44, drift: 0.12, label: "SPEED", readout: (v) => (v < 0.44 ? "dropping back" : v > 0.64 ? "surging" : "steady") },
      holdBreakNote: "The speed wandered out of band on the curve — smooth, small corrections.",
    },
    {
      id: "drf-exit", kind: "drive", target: "drf-rig",
      title: "Back right and off at the exit",
      cue: "Signal right, check the right mirror, move back and take the exit ramp — down a gear for the ramp curve, and a last look left.",
      why: "Exits are planned a mile out, not at the gore: signal, check the right mirror for anyone in the lane or on the ramp, move back and slow on the ramp rather than on the freeway, where the traffic behind is still at speed. The ramp's curve is tighter than it looks with a high trailer behind you, so the gear comes down before it and the brakes stay for the queue.",
      holdBreakNote: "Out of lane or band leaving the freeway — slow down on the ramp, before the curve.",
      drive: {
        path: [[3.89, -8.34], [4.9, -6.9], [5.4, -5.6], [5.9, -4.2], [6.1, -2.6]],
        speedBand: [20, 50], laneWidth: 1.6, graceSeconds: 1.8, checkWindow: 1.5, sceneRate: 0.06,
        bandLabel: "ramp — slow before the curve",
        checks: [
          { at: 0, kind: "signal-right", note: "Signal right well before the exit so the traffic behind knows you are leaving." },
          { at: 1, kind: "mirror-right", note: "Right mirror: nobody on the ramp or in the lane you are moving back into." },
          { at: 3, kind: "gear-down", note: "Down a gear for the ramp curve — the engine holds the speed and the brakes stay ready." },
          { at: 4, kind: "mirror-left", note: "Last look left at the ramp's end before you join the queue." },
        ],
        controls: { brake: "drf-brake-pedal", lights: "drf-flashers" },
      },
    },
    {
      id: "drf-clipboard", kind: "drag", target: "drf-clipboard",
      title: "Stow the loose clipboard",
      cue: "At the ramp stop, put the loose clipboard in the door pocket before you roll on.",
      why: "Anything loose on the dash becomes a missile in a hard stop or a crash, and a clipboard sliding off the seat is the kind of thing a driver reaches for without thinking. Stowing it at a stop, not while moving, keeps both your hands and your eyes where they belong for the next time the traffic stops without warning.",
      drag: { to: "drf-door-pocket", radius: 0.45, missNote: "Not in the pocket — slide the clipboard fully into the door pocket." },
    },
    {
      id: "drf-debrief", kind: "select", target: "drf-crew-checkin",
      title: "Talk the leg through with the trainer",
      cue: "Go over the merge, the car that cut in and the exit queue with the trainer, and say how the freeway felt.",
      why: "Freeway driving is where a new driver's stress hides best, because everything happens fast and nothing looks like a crisis until it is one. Going over the merge, the car that dived into the cushion and the queue on the exit with the trainer fixes what went well; saying out loud that the freeway was tiring is the start of managing fatigue rather than pushing through it.",
    },
    {
      id: "drf-log", kind: "select", target: "drf-eld-status",
      title: "Close out the leg in the log",
      cue: "At the stop, change the electronic log's duty status from driving to on duty, not driving.",
      why: "The freeway leg counts toward the day's driving limit under 49 CFR 395, and the minutes after it — fuel, paperwork, the walk-around — are on-duty work that is not driving. Changing the status when the wheels stop keeps the electronic record matching what the day really was, which is the record that decides whether you can legally take the next leg.",
    },
  ],

  interrupts: [
    {
      id: "drf-cut-in",
      kind: "Car cutting in",
      after: "drf-move-over", delay: 3, seconds: 10,
      alert: "A car has swerved from the right lane into the space cushion in front of your cab, and its brake lights are on.",
      cue: "Brake and rebuild the gap.",
      target: "drf-brake-pedal",
      why: "A car that cuts into your cushion has just spent the space that was keeping you safe. Easing onto the brake — not stabbing it, with a glance at the mirror for whoever is behind — rebuilds the gap before the car ahead does anything else sudden.",
      missNote: "You held your speed with a car braking in the gap in front of you. A loaded rig cannot stop in the space a car leaves when it cuts in, and this is how a heavy truck ends up in the back of a sedan.",
      wrongNote: "It is the brake. A car has cut in and is slowing in front of you — ease off and rebuild the space.",
    },
    {
      id: "drf-exit-queue",
      kind: "Queue on the exit",
      after: "drf-exit", delay: 3, seconds: 10,
      alert: "Round the ramp curve the traffic has stopped dead, with its tail almost at the freeway, and a car is following close behind your trailer.",
      cue: "Warn the traffic behind you.",
      target: "drf-flashers",
      why: "When you have to slow sharply where the driver behind does not expect it, the four-way flashers tell them before your brake lights alone can. On an exit queue the flashers go on as you come off the throttle, so the car behind is slowing with you instead of into you.",
      missNote: "You slowed for the queue with nothing to warn the car close behind. A driver following a trailer cannot see past it, and a sudden stop without a warning is how the rear of a truck gets hit.",
      wrongNote: "It is the four-way flashers. Traffic is stopped round the curve, and the car behind needs the warning.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root, 0, 0.06, 0);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, DRF_ACCENT);

    // ------------------------------------------------------------ ground and the freeway arc
    const drfLaneTex = surfaceTexture((cx, w, h) => {
      gradientFill(cx, w, h, [[0, "#3a3d41"], [1, "#333639"]], { horizontal: true });
      noiseTexture(cx, w, h, { density: 4200, alpha: 0.16, tone: "0,0,0" });
      cx.fillStyle = "rgba(236,236,228,0.9)"; cx.fillRect(3, 0, 5, h); cx.fillRect(w - 8, 0, 5, h);
      for (let y = 0; y < h; y += h / 2) cx.fillRect(w / 2 - 2, y, 4, h * 0.22);
    }, { repeat: 1, px: 256 });
    drfLaneTex.repeat?.set?.(1, 2);
    const laneMat = texturedMat(drfLaneTex, { rough: 0.92, metal: 0.02 });
    const shoulderTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#7c8a6a", base2: "#71805f", seam: "rgba(0,0,0,0.2)" }), { repeat: 9, px: 256 });
    const ground = box(g, 26, 0.06, 22, 0.3, -0.03, -4.5, 0xffffff, { rough: 0.95 });
    ground.material = texturedMat(shoulderTex, { rough: 0.95, metal: 0.02, color: 0xb9c2ae });
    const chord = (r, a0, a1, w) => {
      const x0 = r * Math.sin(a0), z0 = -r * Math.cos(a0), x1 = r * Math.sin(a1), z1 = -r * Math.cos(a1);
      const len = Math.hypot(x1 - x0, z1 - z0) + 0.2;
      const seg = box(g, w, 0.04, len, (x0 + x1) / 2, 0.02, (z0 + z1) / 2, 0xffffff, { rough: 0.9, cast: false });
      seg.material = laneMat; seg.rotation.y = Math.atan2(x1 - x0, z1 - z0);
      return seg;
    };
    const D = Math.PI / 180;
    // Two eastbound lanes (the inner one is the right lane) as chords of the arc.
    for (let a = -70; a < 70; a += 20) chord(8.3, a * D, (a + 20) * D, 3.6);
    // The median barrier and the far carriageway, just seen.
    for (let a = -60; a < 60; a += 40) {
      const x0 = 10.4 * Math.sin(a * D), z0 = -10.4 * Math.cos(a * D), x1 = 10.4 * Math.sin((a + 40) * D), z1 = -10.4 * Math.cos((a + 40) * D);
      const bar = box(g, 0.2, 0.42, Math.hypot(x1 - x0, z1 - z0) + 0.1, (x0 + x1) / 2, 0.21, (z0 + z1) / 2, 0xb9bcbf, { rough: 0.8 });
      bar.rotation.y = Math.atan2(x1 - x0, z1 - z0);
    }
    // The on-ramp from the south-west and the exit ramp to the south-east.
    const ramp = (pts) => {
      for (let i = 1; i < pts.length; i++) {
        const [x0, z0] = pts[i - 1], [x1, z1] = pts[i];
        const seg = box(g, 1.8, 0.035, Math.hypot(x1 - x0, z1 - z0) + 0.3, (x0 + x1) / 2, 0.018, (z0 + z1) / 2, 0x3d4044, { rough: 0.9, cast: false });
        seg.rotation.y = Math.atan2(x1 - x0, z1 - z0);
      }
    };
    ramp([[-6.2, 0.4], [-6.3, -2.6], [-5.4, -4.9]]);
    ramp([[5.1, -6.4], [5.9, -4.2], [6.2, -1.2]]);
    // Gantry sign over the lanes.
    const gantry = group(g, -1.6, 0, -8.3, 0.2);
    for (const sx of [-1, 1]) cyl(gantry, 0.08, 0.08, 3.6, sx * 2.1, 1.8, 0, 0x8b949c, { rough: 0.5, metal: 0.6, seg: 8 });
    box(gantry, 4.4, 0.16, 0.16, 0, 3.5, 0, 0x8b949c, { rough: 0.5, metal: 0.6 });
    decal(gantry, 3.6, 0.7, 0, 3.0, 0.1, signFace("EXIT 2 · 2 MI  —  MERGE AHEAD", { bg: "#1f6b3a", fg: "#ffffff", accent: "#ffffff", scale: 0.42 }), { px: 512 });

    // ------------------------------------------------------------ the rig, the car ahead and the car that cuts in
    const rig = flArticulate(tractorTrailer(g, -6.2, 0, -1.0, { ry: Math.PI, livery: { colour: 0x2e7d4f, fleetName: "SMARTCITI LINEHAUL", unitNumber: "T-319" } }));
    rig.scale.setScalar(DRF_SCALE);
    reg2(rig, "drf-rig");
    const leadCar = sedan(g, -1.4, 0, -9.0, { ry: Math.PI / 2, livery: { colour: 0x9aa4ad } });
    leadCar.scale.setScalar(DRF_SCALE);
    const cutter = sedan(g, 9.2, 0, -12.2, { ry: -Math.PI / 2, livery: { colour: 0xb3261e } });
    cutter.scale.setScalar(DRF_SCALE);

    // ------------------------------------------------------------ what the scan finds, by the inner shoulder
    const shoulderCar = group(g, -3.2, 0, -5.2, 0.9);
    box(shoulderCar, 0.95, 0.62, 2.3, 0, 0.4, 0, 0x2d4f8f, { rough: 0.4, metal: 0.4 });
    reg2(shoulderCar, "drf-shoulder-car");
    const laneSign = group(g, 4.4, 0, -4.1, -0.7);
    cyl(laneSign, 0.03, 0.03, 1.2, 0, 0.6, 0, 0x9aa1a7, { rough: 0.4, metal: 0.6, seg: 8 });
    decal(laneSign, 0.6, 0.6, 0, 1.3, 0.02, signFace("LEFT LANE CLOSED", { bg: "#f28c28", fg: "#1b1e23", accent: "#1b1e23", scale: 0.34 }), { px: 192 });
    reg2(laneSign, "drf-lane-sign");
    const brakeLights = group(g, 0.8, 0, -5.9);
    box(brakeLights, 0.64, 0.08, 0.04, 0, 0.9, 0, 0xd8322c, { emissive: 0xc01810, ei: 1.6, rough: 0.35 });
    holoTag(brakeLights, "brake lights, far ahead", 0, 1.18, 0, { css: DRF_CSS, w: 0.36 });
    reg2(brakeLights, "drf-brake-lights");

    // ------------------------------------------------------------ the unsafe choices
    const redSlab = (x, z, w, d, id, text, tw) => {
      const s = slab(g, w, 0.02, d, x, 0.06, z, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
      holoTag(g, text, x, 0.3, z, { css: "#d2312b", w: tw });
      reg2(s, id);
      return s;
    };
    redSlab(-5.3, -2.3, 1.0, 0.6, "drf-ramp-stop", "stop at the ramp end?", 0.38);
    redSlab(1.9, -5.6, 1.0, 0.6, "drf-tailgate", "close the gap?", 0.3);
    redSlab(-2.4, -4.2, 1.0, 0.6, "drf-shoulder-pass", "pass on the shoulder?", 0.38);

    // ------------------------------------------------------------ the cab controls, brought to the pad
    const dash = group(g, -1.7, 0, 1.1, 0.5);
    box(dash, 1.1, 0.9, 0.36, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 1.06, 0.34, 0.05, 0, 1.06, 0.06, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const belt = box(dash, 0.05, 0.3, 0.02, -0.5, 1.15, 0.2, 0x3a3f45, { rough: 0.7 });
    reg2(belt, "drf-belt");
    const mirrorSw = box(dash, 0.08, 0.05, 0.05, 0.26, 1.12, 0.1, 0x59636d, { rough: 0.5 });
    reg2(mirrorSw, "drf-mirror-set");
    const gauges = decal(dash, 0.32, 0.12, 0.08, 1.1, 0.09, signFace("AIR 125 · TEMP OK", { bg: "#0d1c24", accent: DRF_CSS, fg: "#d9f2d6", scale: 0.42 }), { px: 256, glow: true, ei: 0.8 });
    reg2(gauges, "drf-gauges");
    const convex = group(dash, 0.52, 1.3, 0.05);
    cyl(convex, 0.07, 0.07, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.3, metal: 0.6, seg: 14 }).rotation.x = Math.PI / 2;
    reg2(convex, "drf-convex-knob");
    const pedal = box(dash, 0.1, 0.03, 0.16, 0.05, 0.2, 0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    reg2(pedal, "drf-brake-pedal");
    const cruise = box(dash, 0.08, 0.03, 0.18, 0.22, 0.2, 0.3, 0x3a3f45, { rough: 0.5 });
    reg2(cruise, "drf-cruise-hold");
    const flashers = box(dash, 0.07, 0.05, 0.05, -0.2, 1.12, 0.1, 0xd2312b, { rough: 0.5 });
    reg2(flashers, "drf-flashers");
    const phone = box(dash, 0.07, 0.12, 0.01, 0.4, 0.96, 0.18, 0x1b1e23, { rough: 0.3 });
    holoTag(dash, "text coming in — read it?", 0.4, 0.8, 0.2, { css: "#d2312b", w: 0.4 });
    reg2(phone, "drf-phone");
    const eld = instrument(dash, -0.36, 1.08, 0.09, { idle: "DRIVING", color: DRF_ACCENT, w: 0.16, d: 0.12 });
    reg2(eld, "drf-eld-status");
    const clip = box(g, 0.24, 0.02, 0.32, -0.6, 0.93, 1.35, 0xc9a26b, { rough: 0.8 });
    reg2(clip, "drf-clipboard");
    const pocket = box(g, 0.34, 0.26, 0.06, -2.55, 0.5, 1.7, 0x3a3f45, { rough: 0.8 });
    hits["drf-door-pocket"] = pocket;

    // ------------------------------------------------------------ the following-distance count, boards, trainer
    const countPost = group(g, 2.3, 0, 1.5, -0.5);
    box(countPost, 0.06, 1.1, 0.06, 0, 0.55, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    const countFace = decal(countPost, 0.34, 0.2, 0, 1.22, 0.04, signFace("SECONDS", { bg: "#0a1a10", accent: DRF_CSS, fg: "#eaf7e8", scale: 0.42 }), { px: 256, glow: true, ei: 0.8 });
    reg2(countPost, "drf-follow-count");
    const plan = holoPanel(g, 0.84, 0.54, 1.9, 1.5, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "#0a160c"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = DRF_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e8f6e6"; ctx.fillText("LEG — RAMP TO EXIT 2", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#f3faf2";
      ["On-ramp joins from the right", "Merge ahead: move left early", "Following: 1 s per 10 ft, +1 s over 40", "Exit 2: queue reported on the ramp", "Speed: per the posted limit", "Log the stop at the ramp end"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.6, accent: DRF_ACCENT });
    reg2(plan, "drf-trip-plan");
    const checkin = holoPanel(g, 0.46, 0.3, 0.2, 1.75, 2.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("LEG DEBRIEF", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Merge · cut-in · exit queue · fatigue", w / 2, h * 0.66);
    }, { ry: 0.2, accent: 0x4fd1ff });
    reg2(checkin, "drf-crew-checkin");
    standingFigure(g, -2.8, -0.5, { ry: 1.3, cloth: 0x33503a, vest: 0xd8e24a });
    let queueLit = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.0, -6.0),
      onStepComplete(step) {
        if (step.id === "drf-follow") repaint(countFace, signFace("7 s", { bg: "#0a1a10", accent: "#59c97b", fg: "#eaf7e8", scale: 0.55 }));
        if (step.id === "drf-scan") shoulderCar.position.set(-3.7, 0, -4.2);
        if (step.id === "drf-clipboard") clip.position.set(-2.55, 0.6, 1.72);
        if (step.id === "drf-log") repaint(eld.userData.screen, signFace("ON DUTY", { bg: "#0a160c", accent: "#59c97b", fg: "#f3faf2", scale: 0.45 }));
      },
      // The car really dives into the cushion in front of the cab; the ramp's
      // queue really appears round the curve with its brake lights on.
      onInterrupt(it, session) {
        const p = session?.drive?.pose;
        if (it.id === "drf-cut-in") {
          const hx = p ? Math.sin(p.heading) : 1, hz = p ? Math.cos(p.heading) : 0;
          cutter.position.set((p?.x ?? 1.3) + hx * 2.0, 0, (p?.z ?? -7.3) + hz * 2.0);
          cutter.rotation.y = (p?.heading ?? Math.PI / 2) - 0.25;
        }
        if (it.id === "drf-exit-queue") { leadCar.position.set(6.2, 0, -1.4); leadCar.rotation.y = Math.PI * 0.95; queueLit = true; flashers.material = mat(0xff8a00, { emissive: 0xff8a00, ei: 1.4, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "drf-cut-in") { cutter.position.set(9.2, 0, -12.2); cutter.rotation.y = -Math.PI / 2; }
        if (it.id === "drf-exit-queue") flashers.material = mat(0xffab2e, { emissive: 0xff8a00, ei: 2.2, rough: 0.35 });
      },
      // The car ahead holds station in front of the rig while the cushion is
      // the lesson, so the gap the learner counts is really there.
      onDrive(step, session) {
        const p = session?.drive?.pose;
        if (!p || queueLit || step.id === "drf-exit") return;
        if (step.id === "drf-move-over" || step.id === "drf-merge") {
          leadCar.position.set(p.x + Math.sin(p.heading) * 3.6, 0, p.z + Math.cos(p.heading) * 3.6);
          leadCar.rotation.y = p.heading;
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "drf-follow") {
          const ok = gg.t >= 0.62 && gg.t <= 0.88;
          repaint(countFace, signFace(`${Math.round(2 + gg.t * 8)} s`, { bg: "#0a1a10", accent: ok ? "#59c97b" : "#f2ae14", fg: "#eaf7e8", scale: 0.55 }));
        }
        if (session?.turn && step?.id === "drf-convex") convex.rotation.z = session.turn.amount * Math.PI * 2;
        void t; void dt;
      },
    };
  },
};
