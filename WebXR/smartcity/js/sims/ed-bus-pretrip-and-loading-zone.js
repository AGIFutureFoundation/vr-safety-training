import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, asphaltFace,
} from "../citykit.js";
import { schoolBus } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bus Pre-Trip & Loading Zone VR — Mobility & Transit, the
// education-support-staff programme.
//
// A school bus yard at first light: the pre-trip walkaround before the
// engine turns over, a short pull-out onto the street to the curb stop, the
// amber lights on before the stop, the full stop, the stop arm and the
// crossing gate out together, the mirrors doing the watching a driver alone
// cannot do on foot, students loaded and counted, and the mirrors checked
// again before the bus ever rolls — because the collision this whole
// procedure is built around happens after the stop arm is already back in,
// not during the stop itself. The learner is the AFT- or CSEA-represented
// school bus driver; a route aide rides along. The district, the route
// number and every figure on a gauge are generic.

const EB_ACCENT = 0xf2b21b;
const EB_CSS = "#f2b21b";

export const SIM_ED_BUS_PRETRIP_AND_LOADING_ZONE = {
  id: "ed-bus-pretrip-and-loading-zone",
  index: "622",
  domain: "Mobility & Transit",
  trade: "AFT- or CSEA-represented school bus driver running the morning pre-trip inspection and the curb-side student loading zone, with a route aide riding along",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "AFT and CSEA school bus driver training; FMCSA 49 CFR 396 for the pre-trip inspection and the driver vehicle inspection report; 49 CFR 393 for the mirrors, lights, stop arm and warning-lamp system a school bus carries; 49 CFR 392 for conduct at the stop; the state CDL handbook's school-bus endorsement chapter and the district's own loading-zone procedure for the stop-arm sequence and the danger-zone scan",
  name: "Bus Pre-Trip & Loading Zone",
  title: simTitle("Bus Pre-Trip & Loading Zone"),
  tagline: "First light in the yard: the walkaround before the engine turns over, a short pull-out to the curb, amber lights before the stop, a full stop, the stop arm and crossing gate out together, the danger zone scanned in the mirrors, students counted aboard, the door shut, and the mirrors checked again before the bus ever rolls",
  accent: EB_ACCENT,
  accentCss: EB_CSS,
  parSeconds: 340,
  footprint: 3.0,
  apron: false,
  badge: { id: "checked-twice-not-once", name: "Checked Twice, Not Once", note: "Every defect found before the engine started, the stop sequence run in order, the danger zone scanned before the door opened, and the mirrors checked again before the bus ever moved off the curb" },

  supportLine: "your AFT or CSEA chapter's member assistance line, or the district's employee assistance programme",

  game: system({
    name: "Morning Run",
    currency: "STOP",
    ranks: ["Route Trainee", "Bus Driver", "Lead Driver", "Route Trainer", "Pupil Transportation Certified"],
    badges: [
      { id: "mirrors-both-times", name: "Mirrors Both Times", note: "Checked the mirrors before pulling out and again before releasing the brake at the stop", test: AWARD.all(AWARD.stepClean("pretrip-drive"), AWARD.stepClean("pretrip-drive-continue")) },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "No defect ignored, no phone touched, nobody moved without a full stop and a scan first", test: AWARD.safe },
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
    ],
    challenges: [
      { id: "yard-out-on-time", name: "Yard Out on Time", note: "Walkaround and cab setup finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-walkaround", name: "One-Pass Walkaround", note: "Pre-trip walkaround clean on the first pass", test: AWARD.stepClean("pretrip-walkaround") },
      { id: "ten-in-a-row", name: "Ten in a Row", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "cross-in-front-close": "That student is inside the danger zone right at the front bumper, and the bus has not been cleared to move. The zone around a school bus is the one stretch of ground the driver cannot see well from the seat — it gets scanned and cleared before the bus goes anywhere, not assumed clear because the mirrors looked fine a moment ago.",
    "loose-strap-hanging": "A backpack strap is hanging out of the closed door. A strap caught in a door that then pulls away drags whoever is wearing it alongside the bus — the door does not count as clear until nothing is hanging out of it.",
    "phone-lit-on-dash": "The phone on the dash just lit up during loading. Every second spent looking at it during boarding is a second the mirrors and the danger zone are not being watched, and boarding is exactly when a student is most likely to dart out from between the bus and the curb.",
    "walk-behind-bus": "That student is walking behind the bus instead of coming around where the driver can actually see them. The rear of a school bus is one more blind stretch on top of the danger zone at the front — the loading procedure exists to keep every student on the side and at the distance the driver's mirrors can actually cover.",
  },

  lateNotes: {
    "light-switch": "Not yet — the amber lights go on approaching the stop, not while the bus is still moving through the route.",
    "brake-pedal": "The full stop happens once the bus is actually at the marked curb spot, not before.",
  },

  steps: [
    {
      id: "read-run-sheet", kind: "select", target: "run-sheet-board",
      title: "Read this morning's run sheet",
      cue: "Read the route board for today's stop order, student count and any noted needs.",
      why: "The run sheet is where a driver learns who to expect at which stop and what today's route changes are before ever starting the engine — a stop skipped or a student missed because the sheet was never read is a call home the district has to make, not a surprise the road should be producing.",
    },
    {
      id: "pretrip-walkaround", kind: "find", noHint: true,
      targets: ["cracked-mirror", "brake-light-out", "worn-tire"],
      itemNames: { "cracked-mirror": "the cracked crossview mirror", "brake-light-out": "the warning lamp that doesn't light", "worn-tire": "the tyre worn to its wear bar" },
      itemNotes: {
        "cracked-mirror": "The crossview mirror is cracked across one corner. That mirror is what shows the ground right in front of the bumper — cracked, it hides exactly the part of the danger zone a driver can least afford to lose.",
        "brake-light-out": "One of the eight warning lamps doesn't light when tested. A driver behind who never sees that lamp never gets the warning it's built to give, and this bus doesn't roll on a route until it's replaced.",
        "worn-tire": "This tyre is worn flush with its wear bar. A tyre at that point stops shedding water the way the tread pattern is designed to, which shows up first as a longer stopping distance in the rain — exactly the condition a loaded school bus can least afford.",
      },
      title: "Walk round the bus before the engine starts",
      cue: "Three things about this bus are not right. Find them before the key turns.",
      why: "49 CFR 396 puts the pre-trip walkaround before the engine starts for a reason: every one of these three defects is easiest to find with the bus sitting still and silent, and hardest to notice once it's already moving with a load of students aboard.",
    },
    {
      id: "cab-setup", kind: "sequence", anyOrder: false,
      targets: ["seatbelt-on", "mirrors-adjusted", "gauges-read"],
      itemNames: { "seatbelt-on": "seat belt on", "mirrors-adjusted": "mirrors set to show the danger zone", "gauges-read": "gauges and warning lamps read" },
      title: "Belt, mirrors, gauges",
      cue: "Belt on, then set every mirror to show the danger zone around the bus, then read the gauges before moving.",
      why: "The belt goes on first because the yard and the road ahead both start the moment the bus moves; the mirrors are set from the seat the driver will actually be sitting in, aimed at the ground around the bus rather than the horizon, because that ground is what the whole loading procedure depends on being able to see.",
      outOfOrderNote: "Belt first, then the mirrors, then the gauges — mirrors are set from the belted driving position, not before it.",
    },
    {
      id: "warning-lamps-check", kind: "gauge", target: "dash-gauge",
      title: "Read the gauges to normal operating range",
      cue: "Watch the gauges come up to normal operating range and commit the reading before pulling out.",
      why: "A gauge that never settles into its normal band is telling the driver something the walkaround on the ground could not — low air, low oil pressure, an overheating engine — and it gets read and committed before the bus leaves the yard, not glanced at once it's already rolling.",
      gauge: { label: "GAUGES", speed: 0.6, green: [0.42, 0.66], readout: (t) => (t < 0.42 ? "still coming up" : t > 0.66 ? "past normal — check it" : "normal range"), missNote: "Not settled in the normal band yet. Give the gauges time to come up, or flag what isn't reading right, before pulling out." },
    },
    {
      id: "pretrip-drive", kind: "drive", target: "school-bus-rig",
      title: "Pull out of the yard toward the stop",
      cue: "Check the mirrors, signal, and pull out past the blind driveway toward the marked stop.",
      why: "The yard's own driveway is blind from the seat until the nose of the bus is already past the fence line, which is exactly why the mirrors are checked before moving and the horn is tapped crossing it — a habit built here in the empty yard is the same habit that has to hold on every blind driveway the whole route passes.",
      holdBreakNote: "Out of the lane or out of the band pulling out. Hold the lane at yard speed and check the mirrors before committing to the driveway.",
      drive: {
        path: [[-3.4, 3.6], [-1.2, 3.2], [0.8, 2.2], [1.6, 0.4], [1.6, -1.6]],
        speedBand: [3, 10], laneWidth: 1.6, graceSeconds: 1.6, checkWindow: 2.0, sceneRate: 0.2,
        bandLabel: "yard speed, per the posted limit",
        checks: [
          { at: 0, kind: "mirror-left", note: "Left mirror before moving — the yard behind the bus is exactly where another bus backs out." },
          { at: 1, kind: "signal-right", note: "Signal before the driveway, so anything on the street already knows the bus is coming out." },
          { at: 2, kind: "horn", note: "The driveway to the street is blind past the fence line — the horn is what warns anyone already on the other side of it." },
          { at: 4, kind: "mirror-right", note: "Right mirror as the bus settles onto the street — the curb side is where the stop is coming up." },
        ],
        controls: { brake: "brake-pedal", horn: "horn-button" },
        laneNote: "The bus left the lane and stayed out — on a yard driveway that is either the fence line or oncoming traffic on the street.",
      },
    },
    {
      id: "activate-warning-lights", kind: "select", target: "light-switch",
      title: "Switch on the amber warning lights",
      cue: "Approaching the stop, switch the amber warning lights on before slowing.",
      why: "The amber lights come on first, ahead of the red lights and the stop arm, precisely so traffic behind has warning the bus is about to stop before it actually does — a driver who only sees the red lights and the stop arm at the same moment the bus stops has already lost the warning the amber phase exists to give them.",
    },
    {
      id: "full-stop", kind: "hold", target: "brake-pedal", seconds: 5,
      title: "Bring the bus to a full stop at the marked spot",
      cue: "Hold the brake until the bus is fully stopped at the curb's marked spot.",
      why: "Nothing about the loading procedure — the stop arm, the crossing gate, the door — happens until the bus is actually stopped, not slowing down to a stop; a stop arm deployed while the bus is still rolling tells the traffic behind a story that isn't true yet.",
      holdBreakNote: "The brake eased off before the bus was fully stopped. The stop sequence starts from a dead stop at the marked spot, not from still slowing down.",
    },
    {
      id: "deploy-stop-arm", kind: "turn", target: "stop-arm-lever",
      title: "Deploy the stop arm and crossing gate",
      cue: "Pull the lever to swing out the stop arm, the red lights and the crossing gate together.",
      why: "The stop arm tells traffic to stop, the crossing gate keeps a student from cutting across the road right in front of the bumper where the driver can least see them, and both come out together because a stop arm without the gate still leaves the shortest, least visible path across the street wide open.",
      turn: { turns: 0.5, label: "STOP ARM LEVER", readout: (t) => (t < 0.7 ? "swinging out" : "deployed") },
    },
    {
      id: "open-door", kind: "select", target: "door-lever",
      title: "Open the door",
      cue: "Open the door once the stop arm and crossing gate are fully out.",
      why: "The door opens after the stop arm and gate, not before, because a door open onto a street that isn't yet actually stopped for is an invitation to step out into traffic that hasn't been told to stop yet.",
    },
    {
      id: "scan-danger-zone", kind: "find", noHint: true,
      targets: ["dropped-backpack", "student-tying-shoe", "student-crossing-behind"],
      itemNames: { "dropped-backpack": "the backpack dropped right at the front bumper", "student-tying-shoe": "the student crouched at the bumper", "student-crossing-behind": "the student heading around the back of the bus" },
      itemNotes: {
        "dropped-backpack": "A backpack has been dropped directly in the danger zone at the front bumper. Anyone about to reach for it is standing exactly where the driver's own sightline cannot reach.",
        "student-tying-shoe": "A student has crouched down at the front bumper to tie a shoe, low enough that they've dropped below where the mirrors show anything at all.",
        "student-crossing-behind": "A student is walking around the back of the bus instead of the front where the crossing gate and the driver's attention are both aimed.",
      },
      title: "Scan the danger zone before waving anyone forward",
      cue: "Three things in the danger zone need catching before boarding starts. Find them in the mirrors.",
      why: "The ground around a school bus has more blind area than clear area from the driver's seat, and the mirrors are the only tool that covers most of it — this scan happens every single stop, not just the ones where something looks obviously wrong, because the two or three feet right at the bumper look the same whether they're empty or not.",
    },
    {
      id: "load-students", kind: "sequence", anyOrder: false,
      targets: ["door-clear", "count-confirmed", "seated-and-belted"],
      itemNames: { "door-clear": "door area clear", "count-confirmed": "boarding count confirmed", "seated-and-belted": "students seated" },
      title: "Load and count the students aboard",
      cue: "Confirm the door area is clear, count students aboard against the run sheet, then confirm everyone is seated.",
      why: "The count against the run sheet is what tells the driver the stop is actually finished — a door closed on an assumption instead of a confirmed count is how a district ends up with a student who never made it onto a bus that already left the curb.",
      outOfOrderNote: "Clear, then count, then seated — the count only means something once the door area is confirmed clear of stragglers first.",
    },
    {
      id: "close-door", kind: "select", target: "door-lever",
      title: "Close the door",
      cue: "Close the door once every student is seated and counted.",
      why: "The door closes last in the sequence for the same reason it opened last going in — it is the one thing standing between the aisle and the street, and it stays open exactly as long as the boarding it was opened for is still happening.",
    },
    {
      id: "pretrip-drive-continue", kind: "drive", target: "school-bus-rig",
      title: "Check the mirrors again before pulling away",
      cue: "Check both mirrors and the danger zone once more, then pull away from the curb.",
      why: "The collision this whole stop is built to prevent happens most often after the stop arm is already back in and the bus is moving again — a student who darted out from behind a parked car during loading and is still crossing when the bus starts to roll is invisible to a driver who checked the mirrors only once, at the start of the stop.",
      holdBreakNote: "Out of lane or band pulling away from the curb — settle the bus into the lane before building speed.",
      drive: {
        path: [[1.6, -1.6], [1.6, -3.4], [1.0, -4.6], [-0.6, -5.2], [-2.6, -5.2]],
        speedBand: [3, 11], laneWidth: 1.6, graceSeconds: 1.6, checkWindow: 2.0, sceneRate: 0.2,
        bandLabel: "posted school-zone speed",
        checks: [
          { at: 0, kind: "mirror-right", note: "Right mirror one more time before the bus actually starts moving — the curb side is exactly where a late student reappears." },
          { at: 1, kind: "mirror-left", note: "Left mirror as the bus pulls away from the curb — anything passing on the left is now closing on a bus that's moving again." },
          { at: 3, kind: "signal-left", note: "Signal back into the travel lane so the traffic behind knows the stop is over." },
        ],
        controls: { brake: "brake-pedal" },
      },
    },
    {
      id: "log-dvir", kind: "select", target: "dvir-tablet",
      title: "Log the pre-trip and the stop",
      cue: "Record the walkaround defects and the stop on the inspection report before the next stop.",
      why: "The inspection report is the district's record of what was found and fixed before this bus ever carried a student today — a worn tyre or a dead warning lamp that isn't written down is a defect the shop has no way of knowing to fix before tomorrow's run.",
    },
  ],

  interrupts: [
    {
      id: "late-student-sprint",
      kind: "Late student runs from behind a parked car",
      after: "scan-danger-zone", delay: 3, seconds: 11,
      alert: "A student who missed the first call is sprinting from behind a parked car toward the bus, outside the crosswalk and not visible until now.",
      cue: "Sound the horn — don't wave them across yet.",
      target: "horn-button",
      why: "A horn is the fastest way to make a running student stop and look before they close the last few feet into the danger zone, and it is sounded before anyone is waved forward — the loading procedure does not resume until the student is stopped and accounted for, not just noticed.",
      missNote: "The student kept running straight into the danger zone with nobody's attention on them — a late arrival outside the crosswalk is exactly the student this stop's whole procedure is built to catch before they reach the bus, not after.",
      wrongNote: "The horn — that's what stops a running student before they close the distance, not a wave or a shout.",
    },
    {
      id: "figure-stands-at-bumper",
      kind: "Someone stands up at the front bumper as the bus starts to move",
      after: "pretrip-drive-continue", delay: 3, seconds: 9,
      alert: "Right as the bus starts to roll, a small figure that was crouched out of mirror view at the front bumper suddenly stands up.",
      cue: "Stop immediately.",
      target: "brake-pedal",
      why: "A figure below mirror height at the bumper is invisible until they move, and the only safe response to seeing one appear the instant the bus starts moving is a full stop, not a slow-down — this is exactly the moment the second mirror check earlier in the stop was meant to prevent, and it still needs an immediate stop now that it's happened.",
      missNote: "The bus kept rolling with someone right at the bumper who had just stood up out of nowhere — a school bus that keeps moving through that is the collision the whole loading procedure exists to prevent.",
      wrongNote: "The brake — stop the bus now, before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, EB_ACCENT);

    // ------------------------------------------------------------- yard and street
    const yard = box(g, 8.0, 0.06, 6.4, -1.0, 0.03, 1.6, 0xffffff, { rough: 0.9 });
    yard.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#3a3d41", base2: "#34373b" }), { repeat: 5, px: 448 }), { rough: 0.9, color: 0xafb3b7 });
    const street = box(g, 4.6, 0.06, 8.0, 1.6, 0.031, -3.0, 0xffffff, { rough: 0.85 });
    street.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#33363a", base2: "#2d3033", lanes: 2 }), { repeat: 4, px: 448 }), { rough: 0.85, color: 0xa4a8ac });
    const curbLine = box(g, 0.5, 0.09, 3.0, 3.9, 0.045, -1.6, 0xdcdfd8, { rough: 0.7 });
    void curbLine;

    // ------------------------------------------------------------- the bus
    const busRig = schoolBus(g, -3.4, 0, 3.6, { ry: Math.PI, livery: { colour: 0xf5c518, fleetName: "SCHOOL BUS", unitNumber: "18" } });
    reg(hits, busRig, "school-bus-rig");
    const parts = busRig.userData.parts ?? {};

    // Cracked crossview mirror.
    const crackDecal = box(g, 0.02, 0.06, 0.06, -3.6, 1.5, 3.65, 0xdfe4e8, { rough: 0.3, metal: 0.2, opacity: 0.6, transparent: true, cast: false });
    holoTag(g, "cracked crossview mirror", -3.6, 1.7, 3.65, { css: "#f0645b", w: 0.46 });
    reg(hits, crackDecal, "cracked-mirror");

    // Warning lamp out (dark, near the front warning-light cluster).
    const darkLamp = ball(g, 0.05, -3.3, 4.03, 4.15, 0x2a2a2a, { rough: 0.6 });
    holoTag(g, "warning lamp — won't light", -3.3, 4.2, 4.15, { css: "#f0645b", w: 0.46 });
    reg(hits, darkLamp, "brake-light-out");

    // Worn tyre indicator near the rear axle.
    const wearBar = torus(g, 0.28, 0.02, -2.0, 0.28, 4.6, 0x1a1d20, { rough: 0.9, seg: 8, seg2: 16 });
    wearBar.rotation.z = Math.PI / 2;
    holoTag(g, "tyre worn to the bar", -2.0, 0.6, 4.6, { css: "#f0645b", w: 0.4 });
    reg(hits, wearBar, "worn-tire");

    // Backpack strap hanging from the door — hazard.
    const strap = box(g, 0.03, 0.3, 0.02, -4.0, 1.0, 3.9, 0x8a6a3c, { rough: 0.8 });
    holoTag(g, "strap caught in the door", -4.0, 1.3, 3.9, { css: "#f0645b", w: 0.44 });
    reg(hits, strap, "loose-strap-hanging");

    // ------------------------------------------------------------- run sheet board and cab controls
    const runBoard = holoPanel(g, 0.7, 0.42, -1.6, 1.4, 4.2, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = EB_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#faf2df"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillText("ROUTE 18 — MORNING RUN", w * 0.05, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#e8ddc0";
      ["6 stops · 34 students", "Stop 3: wheelchair lift needed", "Danger zone scan — every stop"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.36 + i * 0.2)));
    }, { ry: 0.4, accent: EB_ACCENT });
    reg(hits, runBoard, "run-sheet-board");

    const dash = group(g, -2.9, 0, 3.0, 2.4);
    box(dash, 0.5, 0.7, 0.35, 0, 0.75, 0, 0x2b2b30, { rough: 0.6 });
    const dashGauge = instrument(dash, -0.1, 1.15, 0.05, { idle: "-- ", color: EB_ACCENT, w: 0.12, d: 0.16 });
    holoTag(dashGauge, "gauges", 0, 0.16, 0, { css: EB_CSS, w: 0.22 });
    reg(hits, dashGauge, "dash-gauge");
    const seatbelt = box(dash, 0.28, 0.03, 0.03, 0.1, 0.5, 0.15, 0xd8532a, { rough: 0.5 });
    holoTag(dash, "seat belt", 0.1, 0.66, 0.15, { css: EB_CSS, w: 0.22 });
    reg(hits, seatbelt, "seatbelt-on");
    const mirrorAdjust = ball(dash, 0.03, 0.15, 1.2, 0.05, 0xdfe4e8, { rough: 0.4, metal: 0.4, opacity: 0.6, transparent: true });
    reg(hits, mirrorAdjust, "mirrors-adjusted");
    const gaugesRead = box(dash, 0.06, 0.06, 0.02, -0.12, 1.15, 0.16, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, gaugesRead, "gauges-read");
    const lightSwitchObj = box(dash, 0.04, 0.06, 0.02, 0.2, 1.0, 0.16, 0xf2c14b, { rough: 0.5 });
    holoTag(dash, "amber lights switch", 0.2, 1.2, 0.16, { css: EB_CSS, w: 0.34 });
    reg(hits, lightSwitchObj, "light-switch");
    const brakePedal = box(dash, 0.1, 0.04, 0.16, -0.1, 0.1, 0.3, 0x14171a, { rough: 0.6 });
    holoTag(dash, "brake pedal — hold", -0.1, 0.28, 0.3, { css: EB_CSS, w: 0.36 });
    reg(hits, brakePedal, "brake-pedal");
    const hornButton = cyl(dash, 0.035, 0.035, 0.02, 0.15, 0.9, 0.2, 0xd8532a, { rough: 0.5, seg: 12 });
    holoTag(dash, "horn", 0.15, 1.05, 0.2, { css: EB_CSS, w: 0.2 });
    reg(hits, hornButton, "horn-button");
    const stopArmLever = group(dash, 0.24, 0.85, 0.12, -0.2);
    box(stopArmLever, 0.02, 0.14, 0.02, 0, 0.07, 0, 0xc0c6cc, { rough: 0.4, metal: 0.7 });
    holoTag(stopArmLever, "stop arm lever", 0, 0.24, 0, { css: EB_CSS, w: 0.3 });
    reg(hits, stopArmLever, "stop-arm-lever");
    const doorLever = group(dash, -0.24, 0.85, 0.12, 0.2);
    box(doorLever, 0.02, 0.12, 0.02, 0, 0.06, 0, 0xc0c6cc, { rough: 0.4, metal: 0.7 });
    holoTag(doorLever, "door lever", 0, 0.2, 0, { css: EB_CSS, w: 0.26 });
    reg(hits, doorLever, "door-lever");
    const dvirTablet = group(dash, 0.2, 0.55, -0.05);
    box(dvirTablet, 0.14, 0.01, 0.2, 0, 0, 0, 0x14171a, { rough: 0.4 });
    const dvirScreen = decal(dvirTablet, 0.12, 0.17, 0, 0.011, 0, signFace("DVIR", { bg: "#0d1c24", accent: EB_CSS, fg: "#f5ecd8", scale: 0.6 }), { px: 128, glow: true, ei: 0.8 });
    dvirScreen.rotation.x = -Math.PI / 2;
    holoTag(dvirTablet, "inspection report", 0, 0.18, 0, { css: EB_CSS, w: 0.32 });
    reg(hits, dvirTablet, "dvir-tablet");

    // Danger-zone find targets around the front of the bus.
    const backpackDrop = box(g, 0.16, 0.1, 0.12, -3.5, 0.05, 4.55, 0x5b8fae, { rough: 0.7 });
    holoTag(g, "backpack in the danger zone", -3.5, 0.3, 4.55, { css: "#f0645b", w: 0.5 });
    reg(hits, backpackDrop, "dropped-backpack");
    const shoeTie = box(g, 0.16, 0.3, 0.14, -3.1, 0.15, 4.6, 0x3f7a9e, { rough: 0.7 });
    holoTag(g, "student crouched at the bumper", -3.1, 0.4, 4.6, { css: "#f0645b", w: 0.5 });
    reg(hits, shoeTie, "student-tying-shoe");
    const crossBehind = box(g, 0.16, 0.5, 0.14, -3.4, 0.25, 2.9, 0x3f7a9e, { rough: 0.7 });
    holoTag(g, "heading around the back", -3.4, 0.6, 2.9, { css: "#f0645b", w: 0.44 });
    reg(hits, crossBehind, "student-crossing-behind");
    const walkBehind = box(g, 0.16, 0.5, 0.14, -1.6, 0.25, 3.9, 0x3f7a9e, { rough: 0.7 });
    holoTag(g, "walking behind the bus", -1.6, 0.6, 3.9, { css: "#f0645b", w: 0.4 });
    reg(hits, walkBehind, "walk-behind-bus");

    // Boarding sequence markers at the door.
    const doorClear = box(g, 0.4, 0.05, 0.4, -3.9, 0.03, 4.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, doorClear, "door-clear");
    const countBoard = holoPanel(g, 0.4, 0.28, -4.4, 1.2, 3.5, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = EB_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#faf2df"; cx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("COUNT", w / 2, h * 0.4);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e8ddc0"; cx.fillText("vs run sheet", w / 2, h * 0.7);
    }, { ry: -0.8, accent: EB_ACCENT });
    reg(hits, countBoard, "count-confirmed");
    const seatedSpot = box(g, 0.3, 0.3, 0.3, -3.9, 0.4, 4.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, seatedSpot, "seated-and-belted");

    // Phone lit on the dash.
    const phone = box(dash, 0.05, 0.01, 0.1, -0.2, 0.72, 0.05, 0x1c1c1c, { rough: 0.3, emissive: 0x3f7a9e, ei: 0.6 });
    holoTag(dash, "phone lit up?", -0.2, 0.86, 0.05, { css: "#f0645b", w: 0.32 });
    reg(hits, phone, "phone-lit-on-dash");

    // Danger-zone crossing hazard, right at the bumper.
    const crossClose = box(g, 0.16, 0.5, 0.14, -3.55, 0.25, 4.7, 0x3f7a9e, { rough: 0.7 });
    holoTag(g, "in the danger zone — not clear yet", -3.55, 0.6, 4.7, { css: "#f0645b", w: 0.56 });
    reg(hits, crossClose, "cross-in-front-close");

    // A route aide, clear of every control.
    const aide = standingFigure(g, -1.4, 3.1, { ry: -1.2, cloth: 0x2b3138, vest: 0xd8f23a });
    holoTag(aide, "route aide", 0, 1.95, 0, { css: EB_CSS, w: 0.26 });

    // A generic student figure, used by the loading find-step and both interrupts.
    const student = standingFigure(g, -5.5, 4.4, { ry: 1.2, cloth: 0x3f7a9e, trousers: 0x2b3138, atStation: true });
    student.scale.set(0.86, 0.86, 0.86);
    student.visible = false;

    let armDeployed = false, gateDeployed = false, doorOpen = false;
    const stopArmSwitch = parts.stopArm;
    const gateSwitch = parts.crossingGate;
    const warn = busRig.userData.warningParts ?? {};

    return {
      hits,
      spawnLook: new THREE.Vector3(-2.9, 1.0, 3.4),
      footprint: 3.0,

      onStepComplete(step) {
        if (step.id === "pretrip-walkaround") { crackDecal.visible = false; darkLamp.visible = false; wearBar.visible = false; }
        if (step.id === "warning-lamps-check") repaint(dashGauge.userData.screen, signFace("NORMAL", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.5 }));
        if (step.id === "activate-warning-lights") { if (warn.amberFront) warn.amberFront.children.forEach((c) => { c.material = mat(0xffcf5a, { emissive: 0xffb200, ei: 2.0 }); }); }
        if (step.id === "deploy-stop-arm") {
          armDeployed = true; gateDeployed = true;
          if (stopArmSwitch) stopArmSwitch.rotation.y = -Math.PI / 2;
          if (gateSwitch) gateSwitch.rotation.y = -1.3;
          if (warn.redFront) warn.redFront.children.forEach((c) => { c.material = mat(0xff3a2a, { emissive: 0xff1400, ei: 2.2 }); });
        }
        if (step.id === "open-door") doorOpen = true;
        if (step.id === "scan-danger-zone") { crossClose.visible = false; }
        if (step.id === "load-students") strap.visible = false;
        if (step.id === "close-door") {
          doorOpen = false; armDeployed = false; gateDeployed = false;
          if (stopArmSwitch) stopArmSwitch.rotation.y = 0;
          if (gateSwitch) gateSwitch.rotation.y = 0;
          if (warn.amberFront) warn.amberFront.children.forEach((c) => { c.material = mat(0xffab2e, { emissive: 0xff8a00, ei: 0.9 }); });
          if (warn.redFront) warn.redFront.children.forEach((c) => { c.material = mat(0xd8322c, { emissive: 0xc01810, ei: 0.8 }); });
        }
      },

      onInterrupt(it) {
        if (it.id === "late-student-sprint") { student.visible = true; student.position.set(-5.5, 0, 4.4); }
        if (it.id === "figure-stands-at-bumper") { student.visible = true; student.position.set(-3.6, 0, 4.7); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "late-student-sprint") student.position.set(-3.9, 0, 4.2);
        if (it.id === "figure-stands-at-bumper") student.visible = false;
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "warning-lamps-check") {
          repaint(dashGauge.userData.screen, signFace(gg.t > 0.42 && gg.t < 0.66 ? "NORMAL" : "CHECK", {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.66 ? "#59c97b" : "#f0645b", fg: "#f5ecd8", scale: 0.5,
          }));
        }
        if (session?.step?.id === "deploy-stop-arm" && session.turn && stopArmSwitch) stopArmSwitch.rotation.y = -session.turn.amount * Math.PI / 2 * 2;
        void armDeployed; void gateDeployed; void doorOpen; void aide; void dt; void CITY;
      },
    };
  },
};
