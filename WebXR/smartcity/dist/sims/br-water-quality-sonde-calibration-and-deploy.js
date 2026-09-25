import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, waterFace,
} from "../citykit.js";
import { workboat, deckBarge } from "../../../shared/fleet.js";
import { excavator } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Water Quality Sonde Calibration & Deploy VR — SF Bay
// Restoration & Cleanup, pack D (contaminated sediment and water quality).
//
// A multiparameter sonde is the instrument that tells a dredging job, minute
// by minute, whether the water outside its curtain still meets the Section
// 401 certification. This station is the technician's side of that: the
// monitoring plan read, the sonde inspected, pH calibrated two-point with a
// rinse between, the turbidity check standard read, dissolved oxygen
// calibrated in air-saturated water, the sonde lowered into its deployment
// pipe on the compliance pile and locked at the plan's depth, a side-by-side
// reading held against a handheld, telemetry confirmed, the kit put away, the
// calibration logged and the crew checked in. The learner is a LIUNA Local
// 261 monitoring technician; an IUOE Local 3 operator runs the dredge the
// sonde is watching. Every acceptance and trigger reads against "the
// monitoring plan" — no limit is stated as a number.

const BRWQ_ACCENT = 0x4fc1b0;

export const SIM_BR_WATER_QUALITY_SONDE_CALIBRATION_AND_DEPLOY = {
  id: "br-water-quality-sonde-calibration-and-deploy",
  index: "BR-D4",
  domain: "Environmental",
  trade: "LIUNA Local 261 monitoring technician calibrating and deploying the compliance sonde, working from a pier beside an Inlandboatmen's Union workboat, with an IUOE Local 3 operator running the dredge the sonde watches",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "clear",
  certification: "LIUNA Local 261 environmental remediation and monitoring training (LIUNA Training and Education Fund); IUOE Local 3 operating engineer on the barge-mounted dredge the monitoring governs; the Regional Water Quality Control Board's Section 401 water quality certification and its monitoring and reporting requirements; Army Corps Section 404 permit conditions; EPA QA/G-5 quality assurance project plan practice for calibration records and field checks; 40 CFR 136 for the grab samples that verify the sonde; OSHA HAZWOPER, 29 CFR 1910.120, for work at a contaminated-sediment site; BCDC permit conditions for the monitoring pile in the Bay; DMMO dredging the readings are reported against",
  name: "Water Quality Sonde Calibration & Deploy",
  title: simTitle("Water Quality Sonde Calibration & Deploy"),
  tagline: "The instrument the whole certification leans on: the monitoring plan read, the sonde inspected, pH calibrated seven then ten with a rinse between, the turbidity check standard read, oxygen calibrated in saturated air while an expired buffer turns up, the sonde lowered and locked on the compliance pile, a side-by-side held while the telemetry trips, the live feed confirmed, the deployment walked, the kit put away, the calibration logged and the crew checked in",
  accent: BRWQ_ACCENT,
  accentCss: "#4fc1b0",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "defensible-number", name: "Defensible Number", note: "Every sensor calibrated against in-date standards, checked side by side and logged before the first reading counted" },

  supportLine: "your union hall's member assistance programme — LIUNA Local 261 — with the employer's employee assistance line behind it",

  game: system({
    name: "Sonde Deck",
    currency: "READING",
    ranks: ["Probe Hand", "Monitoring Tech", "Sonde Lead", "Water Quality Coordinator", "Sonde Deck Certified"],
    badges: [
      { id: "plan-then-probe", name: "Plan Then Probe", note: "The monitoring plan read and the sonde inspected clean before any calibration", test: AWARD.all(AWARD.stepClean("read-plan"), AWARD.stepClean("inspect-sonde")) },
      { id: "nothing-over-the-side", name: "Nothing Over The Side", note: "Never a buffer poured overboard, never a lean over the rail, never a cable round the hand, never under the swing", test: AWARD.safe },
      { id: "checks-in-band", name: "Checks In Band", note: "The turbidity check and the telemetry match both committed inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-cal", name: "Clean Cal", note: "No corrections from the plan to the check-in", test: AWARD.clean },
      { id: "steady-comparison", name: "Steady Comparison", note: "Held the side-by-side in band the whole time", test: AWARD.unbroken },
      { id: "on-station", name: "On Station", note: "Sonde deployed and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "buffer-overboard": "You went to tip the spent buffer and standards over the side of the pier. Calibration solutions are chemicals, and the Bay is the water the certification protects; tipping them in is a discharge the job has no permit for, done in view of the monitoring pile that is supposed to catch exactly that. Spent solutions go in the labelled waste jug and are handled as the work plan says.",
    "lean-over-rail": "You leaned out past the pier rail to lower the sonde by hand into the deployment pipe. A sonde and its cable are heavy at arm's length, a wake arrives without warning, and a lean past the rail over cold water is how a technician goes in after the instrument. The sonde is lowered on its line from behind the rail, with the PFD fastened.",
    "cable-round-hand": "You started to take a wrap of the sonde cable round your hand to hold the weight. If the sonde snags on the pipe or the boat surges, a wrapped line cannot be let go — it takes the hand with it. Line is held in an open palm and payed out hand over hand, so it can be dropped the instant it loads.",
    "under-the-swing": "You waved the workboat in under the barge excavator's swing to reach the far side of the pile. An operator watching the bucket and the barge does not see a small boat nosing under the boom, and a loaded bucket or a swinging counterweight comes down wherever the house turns. The boat goes round, clear of the swing, or the operator grounds the bucket and says so on the radio first.",
  },

  lateNotes: {
    "ph10-buffer": "The ten buffer is the second point: calibrate the seven first so the offset is set before the slope is — and rinse between them.",
    "sonde-body": "Deploy the sonde once every sensor is calibrated and the oxygen has settled — a sonde lowered half-calibrated reports numbers nobody can defend.",
    "cage-clamp": "The clamp is locked once the sonde is down the pipe at the plan's depth mark — locked early, it holds the sonde at the wrong depth all deployment.",
    "cal-log": "The calibration log is written once the kit is put away — it is the last record of the deployment and it needs every standard's lot and every check.",
  },

  steps: [
    {
      id: "read-plan", kind: "select", target: "monitoring-plan",
      title: "Read the monitoring plan for this deployment",
      cue: "At the board: the parameters, the calibration standards and their order, the check-standard acceptance, the compliance pile and depth, and what a trigger reading requires.",
      why: "The Section 401 certification's monitoring requirements say what must be measured, where and how often, and the monitoring plan turns that into the technician's day: which standards, in what order, what a passing check looks like and who is called when a reading trips. A sonde calibrated from memory produces readings, but not ones anyone can stand behind when a regulator asks.",
    },
    {
      id: "pier-gear", kind: "sequence", anyOrder: true,
      targets: ["gear-pfd", "gear-nitrile", "gear-glasses"],
      itemNames: { "gear-pfd": "work vest PFD, fastened", "gear-nitrile": "nitrile gloves", "gear-glasses": "safety glasses" },
      title: "Gear up at the pier edge",
      cue: "PFD fastened for the pier edge and the boat, nitrile gloves for the standards and the sonde, glasses for the splash.",
      why: "The deployment happens at the edge of cold water beside a working barge, so the PFD is worn and fastened from the start. Gloves keep skin off the standards and off a sonde that has sat in water over contaminated sediment, and glasses are for the buffer that flicks off a sensor when it is shaken dry.",
    },
    {
      id: "inspect-sonde", kind: "find", noHint: true,
      targets: ["do-cap-scratched", "wiper-fouled"],
      itemNames: { "do-cap-scratched": "the oxygen sensor cap scored across its face", "wiper-fouled": "the turbidity wiper pad matted with growth" },
      itemNotes: {
        "do-cap-scratched": "The optical oxygen cap has a score across its face — light scatters off it and the reading drifts. It is swapped for a fresh cap before the oxygen calibration, not after.",
        "wiper-fouled": "The wiper pad is matted with growth from the last deployment. A fouled wiper smears the turbidity window instead of clearing it, and turbidity is the reading the dredge will be stopped on.",
      },
      title: "Inspect the sonde before calibrating",
      cue: "Look over every sensor and the guard: sensor faces clean and unscored, the wiper pad fresh, the O-rings seated.",
      why: "Calibration corrects a sensor's reading; it does not fix a damaged sensor, and a calibration performed on a scored cap or a fouled wiper passes on the bench and drifts in the water. Inspecting first means the calibration record describes a sonde that can hold it, which is the only kind worth deploying at a compliance point.",
    },
    {
      id: "ph-cal", kind: "sequence",
      targets: ["rinse-bottle", "ph7-buffer", "ph10-buffer"],
      itemNames: { "rinse-bottle": "rinse with clean water", "ph7-buffer": "calibrate at the pH 7 buffer", "ph10-buffer": "calibrate at the pH 10 buffer" },
      title: "Calibrate pH at two points, seven then ten",
      cue: "Rinse the sensor, calibrate at the seven buffer, rinse again, then calibrate at the ten.",
      why: "A pH sensor is calibrated at the neutral buffer first because that sets its offset, and at the second buffer afterwards because that sets its slope; done the other way round, the slope is fitted to an uncorrected offset. The rinse before each keeps one buffer from carrying into the next, which would shift both points and leave a calibration that looks accepted and reads wrong.",
      outOfOrderNote: "Out of order — rinse, the seven buffer first to set the offset, then the ten to set the slope.",
    },
    {
      id: "turbidity-check", kind: "gauge", target: "check-standard",
      title: "Read the turbidity check standard",
      cue: "Put the sonde's turbidity sensor in the check standard and commit the reading against the plan's acceptance.",
      why: "Turbidity is the reading the dredge will be stopped on, so after it is calibrated it is proved against a check standard the calibration did not use. A reading inside the plan's acceptance says the sensor reads true across the range; one outside it means recalibrating now, on the pier, rather than finding out from a disputed exceedance a week later.",
      gauge: { label: "TURBIDITY CHECK", speed: 0.68, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "reading low — bubbles on the window" : t <= 0.58 ? "inside the plan's acceptance" : "reading high — wiper not parked"), missNote: "Outside the band — tap the bubbles off the window, let the wiper park, and read the check standard again." },
    },
    {
      id: "do-cal", kind: "hold", target: "do-chamber", seconds: 5,
      title: "Calibrate oxygen in air-saturated water",
      cue: "Seat the sonde in the calibration chamber with its damp sponge and hold it still until the oxygen reading settles.",
      why: "Dissolved oxygen is calibrated against water that is saturated with air at the day's temperature and pressure, and the reading has to be allowed to settle before it is accepted — an oxygen sensor calibrated while still drifting carries that drift into every reading afterwards. Holding the sonde still in the chamber is the whole technique; it is what makes the saturation point real.",
      holdBreakNote: "The sonde moved before the oxygen settled and the reading jumped. Seat it again in the chamber and hold it still until it stops drifting.",
    },
    {
      id: "lower-sonde", kind: "drag", target: "sonde-body",
      title: "Lower the sonde into the deployment pipe",
      cue: "Carry the sonde to the compliance pile and lower it on its line down the slotted deployment pipe, from behind the rail.",
      why: "The deployment pipe holds the sonde in the same place in the water column for the whole deployment, protected from debris and from boats, with slots that let the water through. It is lowered on its line from behind the rail, because a sonde lowered by hand at arm's length over the edge is how instruments and technicians both end up in the Bay.",
      drag: { to: "deploy-pipe", radius: 0.5, missNote: "Not in the pipe — the sonde goes down the slotted deployment pipe on the compliance pile, not over the side beside it." },
    },
    {
      id: "lock-depth", kind: "turn", target: "cage-clamp",
      title: "Lock the sonde at the plan's depth mark",
      cue: "With the line's depth mark at the pipe top, turn the clamp down until it is locked on the line.",
      why: "The monitoring plan sets the depth the compliance reading is taken at, because turbidity and oxygen both change with depth and a reading from the wrong depth is a reading of different water. The clamp locks the line at the mark so the sonde stays there through every tide, and a sonde that slides down the pipe overnight reports a plume that is not there.",
      turn: { turns: 1.25, label: "DEPTH CLAMP", readout: (t) => (t < 0.3 ? "line free — sonde sliding" : t < 0.9 ? "clamp closing on the mark" : "locked at the plan's depth") },
    },
    {
      id: "side-by-side", kind: "track", target: "handheld-probe", seconds: 7,
      title: "Hold a side-by-side reading against the handheld",
      cue: "Hold the calibrated handheld probe at the sonde's depth beside the pipe, steady, while both readings are logged together.",
      why: "The side-by-side is the field proof that the sonde reads the same water the same way once it is in place: a separately calibrated handheld at the same depth, at the same moment. It catches what a bench calibration cannot — a sonde fouled on the way down, a sensor knocked on the pipe — and it has to be held steady, because a probe bobbing through the water column is comparing two different depths.",
      track: { start: 0.14, green: [0.4, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "HANDHELD DEPTH", readout: (v) => (v < 0.4 ? "too shallow — above the sonde" : v > 0.6 ? "too deep — below the sonde" : "at the sonde's depth") },
      holdBreakNote: "The handheld drifted off the sonde's depth. Bring it back alongside and hold it steady while both readings log.",
    },
    {
      id: "telemetry", kind: "gauge", target: "telemetry-screen",
      title: "Confirm the live feed matches the side-by-side",
      cue: "Read the shore station's live feed and commit it against the side-by-side just logged.",
      why: "The readings that matter are the ones the shore station records and the dredge is told about, not the ones on the sonde's own memory. Confirming the live feed matches the side-by-side proves the telemetry is carrying the right sensor's data, at the right time, into the record the Water Board will read.",
      gauge: { label: "LIVE FEED", speed: 0.72, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "feed lagging the sonde" : t <= 0.6 ? "matches the side-by-side" : "stale packet — wait"), missNote: "Outside the band — wait for a fresh packet and read the live feed against the side-by-side again." },
    },
    {
      id: "deploy-walk", kind: "find", noHint: true,
      targets: ["cable-chafe", "pile-light-out"],
      itemNames: { "cable-chafe": "the sonde line chafing on the pipe's rim", "pile-light-out": "the compliance pile's warning light dark" },
      itemNotes: {
        "cable-chafe": "The line is sawing on the sharp rim of the deployment pipe with every swell. It will part in a day or two and take the sonde to the bottom; a rim guard goes on now.",
        "pile-light-out": "The pile's warning light is dark. An unlit pile in a work zone at dusk is a hazard to every boat, and to the sonde on it.",
      },
      title: "Walk the deployment before leaving it",
      cue: "Look over the pile: the line where it enters the pipe, the telemetry box, the pile's warning light.",
      why: "A deployed sonde is left alone for days, and what ends a deployment early is usually already visible when it goes in: a line chafing on a rim, a light that is out and invites a boat into the pile. One walk before leaving turns those into a rim guard and a lamp change rather than a lost instrument and a gap in the record.",
    },
    {
      id: "kit-away", kind: "sequence", anyOrder: true,
      targets: ["waste-jug", "standards-case"],
      itemNames: { "waste-jug": "spent solutions into the labelled waste jug", "standards-case": "standards capped and back in their case" },
      title: "Put the calibration kit away",
      cue: "Spent buffer and standards into the labelled waste jug, the fresh standards capped and back in their case.",
      why: "Spent calibration solutions are waste and are handled as the work plan says, not tipped at the pier edge, and a standard left uncapped in the sun is not the standard its label claims by the next calibration. Putting the kit away properly is what makes tomorrow's calibration traceable to in-date, uncontaminated standards.",
    },
    {
      id: "cal-log", kind: "select", target: "cal-log",
      title: "Write the calibration and deployment log",
      cue: "Log each sensor's calibration and standard lot, the expired buffer pulled, the check standard, the side-by-side, the telemetry trip and who was called, the depth, and the chafe guard.",
      why: "Every reading this sonde reports for the deployment is only as good as the calibration log behind it, and EPA QA/G-5 practice is what makes that log a required record rather than a habit. The expired buffer and the trip go in with their times, because the log is what shows the data was produced by a calibrated instrument and acted on when it said to.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the skipper and the dredge",
      cue: "On the radio: the sonde is deployed and logged, who reads the feed overnight, and how the skipper and the dredge crew are after a stop on a trigger reading.",
      why: "The dredge crew was stopped mid-bucket on the sonde's say-so, and the skipper held a boat beside a pile in a wake; the check-in makes sure everyone knows the sonde is trusted and who watches it overnight. It is also the crew's own — the member assistance line is there for anything that is still with someone after the radio goes quiet.",
    },
  ],

  interrupts: [
    {
      id: "expired-buffer",
      kind: "Expired calibration standard on the bench",
      after: "do-cal", delay: 2, seconds: 13,
      alert: "While the oxygen settles you notice the lot sticker on the ten buffer you just used — its expiry date has passed.",
      cue: "Pull the expired bottle and set out a fresh in-date one, so the pH point can be recalibrated.",
      target: "fresh-buffer",
      why: "A calibration is a comparison against a standard whose value is known, and a standard past its expiry no longer has a known value — the pH slope set from it is fitted to a guess. The bottle is pulled and a fresh, in-date buffer set out so the point can be redone before the sonde goes in, and the pulled lot goes in the log.",
      missNote: "The expired buffer stayed on the bench and the sonde was deployed on a slope fitted to it; the week's pH record carried a qualifier and a recalibration trip was needed to find out how far off it was.",
      wrongNote: "The fresh buffer — pull the expired bottle and set out an in-date one before anything else.",
    },
    {
      id: "trigger-reading",
      kind: "Telemetry trigger at the compliance pile",
      after: "side-by-side", delay: 2, seconds: 14,
      alert: "The shore station's alarm has gone off: turbidity at the compliance pile is over the plan's trigger, and the dredge is still swinging buckets.",
      cue: "Call the dredge operator on the work channel: the trigger has tripped, stop and hold per the plan.",
      target: "dredge-radio",
      why: "A trigger reading is the moment the monitoring exists for, and the plan's response starts with the dredge stopping, because every bucket after the trigger adds to a plume that is already past what the certification allows. The technician holding the side-by-side knows the reading is real, and the call goes to the operator on the work channel before anything else.",
      missNote: "The dredge kept working through the trigger for another dozen buckets; the plume held over the compliance pile for most of an hour and the day's report went to the Water Board as an exceedance with no response in it.",
      wrongNote: "The dredge's work radio — the operator has to hear the trigger and stop before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BRWQ_ACCENT);

    // ---------------------------------------------------------- pier, water
    const pier = box(g, 9, 0.1, 5.4, 0, 0.05, 0.2, 0xffffff, { rough: 0.9 });
    pier.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#56534c", base2: "#4a4842", seam: "rgba(0,0,0,0.35)" }), { repeat: 4, px: 512 }), { rough: 0.9, color: 0xd4ccc0 });
    for (const x of [-4, -2, 0, 2, 4]) cyl(g, 0.05, 0.05, 1.0, x, 0.6, -2.5, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const rail = box(g, 9, 0.05, 0.05, 0, 1.08, -2.5, CITY.hiVis, { rough: 0.6 });
    void rail;
    const water = box(g, 18, 0.02, 11, 0, 0.004, -8.0, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0f2a2e", mid: "#133338" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x88aeb0 });

    const boat = workboat(g, -2.8, -0.45, -4.3, { ry: Math.PI / 2 });
    void boat;
    const skipper = standingFigure(g, -2.0, -4.1, { ry: -1.3, atStation: true, cloth: 0x243a4a, vest: 0xf06a2b, helmet: 0xf2f2ee });
    skipper.position.y = 0.72;
    holoTag(g, "workboat skipper", -2.0, 2.8, -4.1, { css: "#4fc1b0", w: 0.32 });

    const barge = deckBarge(g, 1.6, -0.6, -11.5, { ry: Math.PI / 2 });
    void barge;
    const exc = excavator(g, 1.4, 0.95, -11.5, { ry: -Math.PI / 2 });
    const { house, bucket } = exc.userData.parts;
    house.rotation.y = 0.7;
    holoTag(g, "dredge — IUOE Local 3", 1.4, 5.9, -11.5, { css: "#4fc1b0", w: 0.44 });
    const dredgeLamp = ball(g, 0.15, -0.6, 4.2, -10.6, 0xf2ae14, { emissive: 0xf2ae14, ei: 1.0, seg: 10, seg2: 8 });
    const swingHit = box(g, 0.8, 0.5, 0.8, 3.6, 0.3, -5.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "nose in under the swing?", 3.6, 0.72, -5.0, { css: "#e8622a", w: 0.44 });
    reg(hits, swingHit, "under-the-swing");

    // ------------------------------------------------------ compliance pile
    const pile = group(g, 1.8, 0, -3.4);
    cyl(pile, 0.2, 0.2, 3.2, 0, 0.9, 0, 0x4a4238, { rough: 0.95, seg: 12 });
    const pipe = cyl(pile, 0.07, 0.07, 1.8, 0.28, 0.4, 0, 0xe8edf1, { rough: 0.5, seg: 10 });
    void pipe;
    const pipeTop = group(pile, 0.28, 1.32, 0);
    hits["deploy-pipe"] = pipeTop;
    const clamp = group(pile, 0.28, 1.36, 0);
    const clampRing = torus(clamp, 0.09, 0.02, 0, 0, 0, BRWQ_ACCENT, { rough: 0.4, metal: 0.6, seg: 6, seg2: 16 });
    clampRing.rotation.x = Math.PI / 2;
    box(clamp, 0.14, 0.03, 0.03, 0.12, 0.02, 0, 0xe8b02e, { rough: 0.5 });
    holoTag(pile, "depth clamp", 0.28, 1.62, 0, { css: "#4fc1b0", w: 0.26 });
    reg(hits, clamp, "cage-clamp");
    const teleBox = box(pile, 0.3, 0.36, 0.2, -0.3, 1.9, 0, 0x2b3138, { rough: 0.55 });
    void teleBox;
    cyl(pile, 0.01, 0.01, 0.8, -0.3, 2.45, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 6 });
    const pileLight = ball(pile, 0.08, 0, 2.6, 0, 0x3a3f45, { rough: 0.6, seg: 10, seg2: 8 });
    reg(hits, pileLight, "pile-light-out");
    const chafe = box(pile, 0.1, 0.06, 0.1, 0.28, 1.3, 0.08, 0x8a6a3a, { rough: 0.9, emissive: 0x3a1a06, ei: 0.35 });
    reg(hits, chafe, "cable-chafe");
    const guard = torus(pile, 0.08, 0.02, 0.28, 1.31, 0, 0xe8b02e, { rough: 0.6, seg: 6, seg2: 14 });
    guard.rotation.x = Math.PI / 2;
    guard.visible = false;
    const sondeDown = cyl(pile, 0.045, 0.045, 0.5, 0.28, 0.05, 0, 0x2f4d5f, { rough: 0.5, metal: 0.4, seg: 10 });
    sondeDown.visible = false;
    holoTag(pile, "compliance pile", 0, 3.0, 0, { css: "#4fc1b0", w: 0.32 });
    const leanHit = box(g, 0.6, 0.5, 0.4, 2.7, 1.0, -2.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean out past the rail?", 2.7, 1.42, -2.6, { css: "#e8622a", w: 0.42 });
    reg(hits, leanHit, "lean-over-rail");

    // Handheld comparison probe on its own line at the rail.
    const hh = group(g, 1.0, 0.1, -2.2);
    box(hh, 0.12, 0.2, 0.06, 0, 0.9, 0, 0x2b3138, { rough: 0.5 });
    const hhLine = cyl(hh, 0.008, 0.008, 1.0, 0, 0.45, -0.1, 0xf2c14b, { rough: 0.7, seg: 6 });
    void hhLine;
    const hhProbe = cyl(hh, 0.025, 0.025, 0.2, 0, 0.1, -0.1, 0x4fc1b0, { rough: 0.5, seg: 8 });
    holoTag(hh, "handheld probe", 0, 1.18, 0, { css: "#4fc1b0", w: 0.3 });
    reg(hits, hh, "handheld-probe");

    // -------------------------------------------------- calibration bench
    const bench = group(g, -0.9, 0.1, -0.9);
    box(bench, 2.2, 0.06, 0.7, 0, 0.88, 0, 0xd8dcdf, { rough: 0.4, metal: 0.3 });
    box(bench, 2.1, 0.85, 0.04, 0, 0.43, -0.32, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    // The sonde on its stand.
    const sonde = group(bench, -0.75, 0.92, 0.05);
    cyl(sonde, 0.05, 0.05, 0.55, 0, 0.3, 0, 0x2f4d5f, { rough: 0.5, metal: 0.4, seg: 12 });
    cyl(sonde, 0.06, 0.06, 0.14, 0, 0.07, 0, 0xc0c6cc, { rough: 0.4, metal: 0.6, seg: 12, open: true });
    holoTag(sonde, "sonde", 0, 0.7, 0, { css: "#4fc1b0", w: 0.18 });
    reg(hits, sonde, "sonde-body");
    const doCap = box(sonde, 0.05, 0.03, 0.03, 0.05, 0.04, 0.04, 0x1b1e22, { rough: 0.6, emissive: 0x3a1206, ei: 0.4 });
    reg(hits, doCap, "do-cap-scratched");
    const wiper = box(sonde, 0.04, 0.05, 0.02, -0.05, 0.05, 0.04, 0x4a5a2a, { rough: 0.9, emissive: 0x1a2a06, ei: 0.3 });
    reg(hits, wiper, "wiper-fouled");
    // Bottles.
    const bottles = {};
    for (const [id, x, colour, label] of [["rinse-bottle", -0.4, 0xe8edf1, "RINSE"], ["ph7-buffer", -0.2, 0xf2c14b, "pH 7"], ["ph10-buffer", 0.0, 0x2f6fb8, "pH 10"], ["check-standard", 0.25, 0xe6ecef, "CHECK STD"]]) {
      const b = group(bench, x, 0.92, 0.12);
      cyl(b, 0.045, 0.045, 0.16, 0, 0.08, 0, colour, { rough: 0.4, seg: 10 });
      decal(b, 0.14, 0.05, 0, 0.26, 0, signFace(label, { bg: "#0d1c24", accent: "#4fc1b0", scale: 0.55 }), { px: 128 });
      reg(hits, b, id);
      bottles[id] = b;
    }
    const expiredTag = box(bottles["ph10-buffer"], 0.05, 0.03, 0.005, 0, 0.1, 0.047, 0xf2f2ee, { rough: 0.6 });
    const freshBuffer = group(bench, 0.2, 0.92, -0.2);
    cyl(freshBuffer, 0.045, 0.045, 0.16, 0, 0.08, 0, 0x2f6fb8, { rough: 0.4, seg: 10 });
    holoTag(freshBuffer, "fresh buffer lot", 0, 0.28, 0, { css: "#4fc1b0", w: 0.28 });
    reg(hits, freshBuffer, "fresh-buffer");
    const chamber = group(bench, 0.55, 0.92, 0.05);
    cyl(chamber, 0.07, 0.07, 0.22, 0, 0.11, 0, 0xdfe6ea, { rough: 0.3, seg: 12 });
    const chamberScreen = decal(chamber, 0.16, 0.06, 0, 0.3, 0, signFace("DO —", { bg: "#0d1c24", accent: "#4fc1b0", fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.8 });
    holoTag(chamber, "oxygen chamber", 0, 0.44, 0, { css: "#4fc1b0", w: 0.3 });
    reg(hits, chamber, "do-chamber");
    const pourHit = box(g, 0.5, 0.4, 0.4, -3.6, 0.9, -2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    cyl(g, 0.05, 0.05, 0.16, -3.6, 0.2, -2.1, 0x2f6fb8, { rough: 0.4, seg: 10 });
    holoTag(g, "tip the spent buffer over the side?", -3.6, 1.3, -2.25, { css: "#e8622a", w: 0.58 });
    reg(hits, pourHit, "buffer-overboard");
    const coil = group(bench, -0.95, 0.92, -0.2);
    torus(coil, 0.12, 0.012, 0, 0.02, 0, 0xf2c14b, { rough: 0.7, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    const coilHit = box(coil, 0.3, 0.2, 0.3, 0, 0.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(coil, "wrap the line round your hand?", 0, 0.24, 0, { css: "#e8622a", w: 0.52 });
    reg(hits, coilHit, "cable-round-hand");

    // Kit away: waste jug and standards case under the bench end.
    const jug = group(g, 0.7, 0.1, 0.0);
    cyl(jug, 0.12, 0.12, 0.34, 0, 0.17, 0, 0xf2c14b, { rough: 0.6, seg: 12 });
    decal(jug, 0.16, 0.08, 0, 0.2, 0.122, signFace("SPENT CAL WASTE", { bg: "#231c0d", accent: "#f2c14b", scale: 0.4 }), { px: 128 });
    holoTag(jug, "waste jug", 0, 0.5, 0, { css: "#4fc1b0", w: 0.22 });
    reg(hits, jug, "waste-jug");
    const kase = group(g, 1.2, 0.1, 0.2);
    box(kase, 0.46, 0.2, 0.3, 0, 0.1, 0, 0x1b1e22, { rough: 0.5 });
    const kaseLid = box(kase, 0.46, 0.03, 0.3, 0, 0.22, -0.12, 0x2b3138, { rough: 0.5 });
    kaseLid.rotation.x = -0.9;
    holoTag(kase, "standards case", 0, 0.45, 0, { css: "#4fc1b0", w: 0.28 });
    reg(hits, kase, "standards-case");

    // ---------------------------------------- shore station, radios, boards
    const station = group(g, 2.8, 0.1, -0.4, -0.6);
    cyl(station, 0.04, 0.04, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(station, 0.46, 0.3, 0.08, 0, 1.25, 0, 0x2b3138, { rough: 0.55 });
    const teleScreen = decal(station, 0.4, 0.24, 0, 1.25, 0.045, signFace("FEED —", { bg: "#0d1c24", accent: "#4fc1b0", fg: "#bfeaf7", scale: 0.36 }), { px: 256, glow: true, ei: 0.8 });
    const teleLamp = ball(station, 0.03, 0.2, 1.45, 0.03, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(station, "shore station feed", 0, 1.6, 0, { css: "#4fc1b0", w: 0.34 });
    reg(hits, teleScreen, "telemetry-screen");
    const dredgeRadio = group(g, 2.1, 0.1, 0.9);
    box(dredgeRadio, 0.3, 0.9, 0.3, 0, 0.45, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    const dRadioBody = box(dredgeRadio, 0.07, 0.2, 0.05, 0, 1.02, 0.05, 0xd2312b, { rough: 0.5 });
    holoTag(dredgeRadio, "dredge work channel", 0, 1.3, 0, { css: "#4fc1b0", w: 0.36 });
    reg(hits, dredgeRadio, "dredge-radio");
    void dRadioBody;

    const gear = group(g, -2.6, 0.1, 1.0, 0.6);
    box(gear, 0.9, 0.05, 0.4, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(gear, 0.8, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["gear-pfd", -0.28, 0xf06a2b, "PFD"], ["gear-nitrile", 0, 0x3a6fd8, "NITRILE"], ["gear-glasses", 0.28, 0x1b1e22, "GLASSES"]]) {
      const it = group(gear, dx, 0.8, 0);
      box(it, 0.2, 0.08, 0.16, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.18, 0.05, 0, 0.041, 0, signFace(label, { bg: "#0d1c24", accent: "#4fc1b0", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const plan = decal(g, 0.56, 0.4, -1.0, 1.25, 1.7, paperFace("MONITORING PLAN — PILE C-1", ["Parameters: turbidity, DO, pH, cond., temp", "pH: 7 then 10, rinse between", "Check standard: per the plan", "Depth: the line's mark at pipe top", "Trigger: stop the dredge, call it in"], { bg: "#e6f2ef", band: "#4fc1b0" }), { px: 320 });
    plan.rotation.y = 0.3;
    cyl(g, 0.03, 0.035, 1.0, -1.0, 0.6, 1.68, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, plan, "monitoring-plan");
    const logBoard = decal(g, 0.46, 0.34, 1.0, 1.2, 1.9, paperFace("CALIBRATION LOG", ["pH: —", "DO: —", "Turbidity check: —", "Deployed: —"], { bg: "#e6f2ef", band: "#6b7178" }), { px: 256 });
    logBoard.rotation.y = -0.3;
    cyl(g, 0.03, 0.035, 1.0, 1.0, 0.6, 1.88, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "cal-log");
    const radioPost = group(g, 0.0, 0.1, 2.1);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "crew radio", 0, 1.3, 0, { css: "#4fc1b0", w: 0.24 });
    reg(hits, radioBody, "crew-radio");

    const tech = standingFigure(g, -0.4, 0.6, { ry: 2.6, cloth: 0x2f4a55, vest: 0x4fc1b0, gloves: true });
    tech.position.y = 0.1;
    holoTag(tech, "second technician", 0, 1.95, 0, { css: "#4fc1b0", w: 0.34 });

    const waterTex = water.material.map;
    let dig = 0, stopped = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 0.9, -1.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-sonde") { doCap.material = mat(0x2f4d5f, { rough: 0.4 }); wiper.material = mat(0xf2f2ee, { rough: 0.9 }); }
        if (step.id === "ph-cal") bottles["ph7-buffer"].children[0].material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "turbidity-check") repaint(chamberScreen, signFace("TURB OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "do-cal") repaint(chamberScreen, signFace("DO SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "lower-sonde") { sonde.visible = false; sondeDown.visible = true; }
        if (step.id === "lock-depth") clampRing.material = mat(0x59c97b, { rough: 0.4, metal: 0.5 });
        if (step.id === "telemetry") repaint(teleScreen, signFace("FEED MATCHES", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.36 }));
        if (step.id === "deploy-walk") { chafe.visible = false; guard.visible = true; pileLight.material = mat(0xffe9a8, { emissive: 0xffe9a8, ei: 1.4 }); }
        if (step.id === "kit-away") { kaseLid.rotation.x = 0; kaseLid.position.z = 0; }
        if (step.id === "cal-log") repaint(logBoard, paperFace("CALIBRATION LOG", ["pH: 7 › 10 · expired lot pulled", "DO: saturated air, settled", "Turbidity check: in plan", "Deployed · trigger called · guard on"], { bg: "#e6f2ef", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "expired-buffer") expiredTag.material = mat(0xd2312b, { rough: 0.6, emissive: 0x5a0808, ei: 0.8 });
        if (it.id === "trigger-reading") {
          teleLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0 });
          repaint(teleScreen, signFace("TRIGGER — TURBIDITY", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffdada", scale: 0.34 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "expired-buffer") { bottles["ph10-buffer"].visible = false; freshBuffer.position.set(0.0, 0.92, 0.12); }
        if (it.id === "trigger-reading") {
          stopped = true;
          dredgeLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
          teleLamp.material = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 1.2 });
          repaint(teleScreen, signFace("DREDGE HOLDING", { bg: "#0d1c24", accent: "#f2ae14", fg: "#bfeaf7", scale: 0.36 }));
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.007; waterTex.offset.y = -t * 0.003; }
        if (!stopped) { dig += dt * 0.5; house.rotation.y = 0.7 + Math.sin(dig) * 0.35; if (bucket) bucket.rotation.x = Math.sin(dig * 2) * 0.25; }
        if (session?.turn && step?.id === "lock-depth") clamp.rotation.y = session.turn.amount * Math.PI * 2;
        if (step?.id === "side-by-side") hhProbe.position.y = 0.1 - (session.track?.v ?? 0) * 0.15;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "telemetry") repaint(teleScreen, signFace(gg.t < 0.42 ? "LAGGING" : gg.t <= 0.6 ? "MATCHES" : "STALE", { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.36 }));
      },
    };
  },
};
