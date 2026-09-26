import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, cone, barrierPanel, reg,
} from "../citykit.js";
import { grader } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ranch Road Grading & Culvert VR — Construction & Structural
// Trades, on the open-range district. An operating engineer regrading a
// ranch access road and setting a culvert under it: the work zone flagged
// before the blade moves, the crown and cross-slope checked against the
// plan rather than by eye, the culvert trench respected as an excavation
// rather than a ditch, and a school bus on the same road escorted through
// on the flagger's own call, not waved past on a guess.

const ORG_ACCENT = 0xc9a36b;

export const SIM_OR_RANCH_ROAD_GRADING_AND_CULVERT = {
  id: "or-ranch-road-grading-and-culvert",
  index: "263",
  domain: "Construction",
  trade: "Operating engineer — IUOE",
  category: "Construction & Structural Trades",
  district: "open-range",
  weather: "wind",
  certification: "IUOE operating engineers — grading and heavy equipment; OSHA 29 CFR 1926 safety and health regulations for construction; OSHA 29 CFR 1926 Subpart P Excavations for the culvert trench; OSHA 29 CFR 1926.21 safety training and education in construction; the Manual on Uniform Traffic Control Devices (MUTCD) for the work zone on the access road",
  name: "Ranch Road Grading & Culvert",
  title: simTitle("Ranch Road Grading & Culvert"),
  tagline: "A ranch access road regraded and a culvert set under it: the work zone flagged first, the crown and cross-slope checked against the plan, the trench respected as an excavation, and a school bus on the same road escorted through on the flagger's call",
  accent: ORG_ACCENT,
  accentCss: "#c9a36b",
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "road-restored", name: "Road Restored", note: "A crown cut to the plan, a culvert set and backfilled in a respected trench, and a school bus escorted through the work zone without anyone in its path" },

  supportLine: "the IUOE local's member assistance programme and the contractor's employee assistance line",

  game: system({
    name: "Grade Crew",
    currency: "GRADE",
    ranks: ["Ground Hand", "Grader Operator", "Lead Operator", "Grade Foreman", "Grade Certified"],
    badges: [
      { id: "zone-flagged-first", name: "Zone Flagged First", note: "The work zone set before the blade ever moved", test: AWARD.stepClean("traffic-control") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "grade-to-plan", name: "Grade to Plan", note: "Held the crown and cross-slope reading in band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-grade", name: "Clean Grade", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "grade-fast", name: "Grade Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "crew-streak", name: "Crew Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "reach-under-raised-blade": "You reached under the raised moldboard. A blade held up on hydraulics is held up by a system that can fail or drift exactly like any other hydraulic circuit, and a hand or a foot placed under it assumes a promise the cylinder has not actually made.",
    "stand-in-grader-blind-spot": "You stood in the grader's rear blind spot while it was working. The backup camera on this machine is exactly the thing that closes that blind spot for the operator, and standing in it anyway — camera blocked or not — puts you exactly where the operator has the least chance of seeing you before the machine moves.",
    "enter-unprotected-trench": "You stepped down into the culvert trench before the protective slope was confirmed. OSHA's excavation standard treats a trench as ground that can move the instant it is cut, not ground that is safe because nothing has fallen in yet — the slope or bench is checked and confirmed before anyone's feet go below grade, not after.",
    "cross-swing-radius-grader": "You walked through the grader's working envelope while it was cutting. An operator watching the blade and the grade stakes is not also watching every direction around the machine at once, and crossing through the space it is actively working in bets that they will notice you before the machine reaches where you are.",
  },

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order-board",
      title: "Take the grading plan",
      cue: "Check the plan for the road segment, the target crown and cross-slope, and the culvert location.",
      why: "The plan is what turns 'regrade the ranch road' into a specific crown percentage, a cross-slope and a culvert station number — without it, the crew is grading to what looks right from the cab, which is exactly the judgment call the plan exists to remove.",
    },
    {
      id: "conditions-board", kind: "select", target: "conditions-board",
      title: "Check the wind and dust conditions",
      cue: "Read today's wind outlook before grading starts, per the forecast.",
      why: "Wind decides how far the dust a grader throws travels and how well anyone downwind can see the work zone, and the current forecast — not yesterday's — is what the dust-control plan and the traffic control both depend on getting right.",
    },
    {
      id: "traffic-control", kind: "sequence",
      targets: ["warning-sign-placed", "cone-taper-set", "flagger-posted"],
      itemNames: { "warning-sign-placed": "warning sign placed", "cone-taper-set": "cone taper set", "flagger-posted": "flagger posted" },
      title: "Flag the work zone before the blade moves",
      cue: "Warning sign, then the cone taper, then the flagger — in that order, before the grader touches the road.",
      why: "This ranch road still carries traffic, including a bus on its route, and the MUTCD sequence — advance warning, then the taper that actually steers a driver into the open lane, then a flagger who can stop that lane entirely — is what gives a driver time to react before they are already on top of the equipment, not after.",
      outOfOrderNote: "Warning sign first, then the taper, then the flagger — a flagger posted before the taper is even set has nothing built yet to steer traffic into.",
    },
    {
      id: "equipment-find", kind: "find", noHint: true,
      targets: ["worn-cutting-edge", "blocked-backup-camera"],
      itemNames: { "worn-cutting-edge": "worn cutting edge", "blocked-backup-camera": "blocked backup camera" },
      itemNotes: {
        "worn-cutting-edge": "A cutting edge worn past its wear line stops cutting a clean crown and starts leaving a ridge the next pass has to fix.",
        "blocked-backup-camera": "Caked mud over the backup camera is a blind spot the operator thinks is covered and is not.",
      },
      decoyNotes: { "clean-mirror": "That mirror is clean and unobstructed — the find is for what's actually wrong on the machine, not everything on it." },
      title: "Walk around the grader before starting",
      cue: "Check the machine over before the first pass — two defects are here.",
      why: "A worn edge or a blocked camera found at the walkaround gets fixed in the yard with the machine shut down; the same defect found mid-pass is a defect the operator is working around instead of one that got fixed.",
    },
    {
      id: "culvert-plan-confirm", kind: "select", target: "culvert-plan-marker",
      title: "Confirm the culvert location and depth",
      cue: "Check the stake against the plan's culvert station and invert depth before any ground is disturbed there.",
      why: "The culvert has to sit at the depth and the station the plan actually calls for to carry the ditch flow under the road without ponding on one side of it — confirming the stake against the plan before the first cut is what keeps a shallow guess from becoming a road that floods every wet season.",
    },
    {
      id: "blade-turn", kind: "turn", target: "blade-circle",
      title: "Angle the blade to the cut",
      cue: "Turn the blade circle to the angle the plan calls for on this pass.",
      why: "The blade's angle is what actually casts material to build the crown rather than just pushing it straight ahead — set to the plan's angle before the pass starts, it does the shaping in one pass instead of leaving a flat road that still needs the crown cut into it separately.",
      turn: { turns: 0.6, axis: "y", label: "BLADE CIRCLE" },
    },
    {
      id: "first-pass", kind: "hold", target: "blade-depth-lever", seconds: 5,
      title: "Hold the cut through the first pass",
      cue: "Hold the blade depth steady through the full length of the first pass.",
      why: "A depth that wanders mid-pass leaves a wave in the road that the next pass has to grade back out — holding it steady the full length of the pass is what actually gets the crown cut in the number of passes the plan assumes rather than twice as many.",
      holdBreakNote: "Depth released mid-pass — that leaves a wave in the crown the next pass has to correct instead of build on. Hold it the full length.",
    },
    {
      id: "crown-grade-gauge", kind: "gauge", target: "slope-gauge",
      title: "Check the crown and cross-slope",
      cue: "Read the slope gauge across the crown and commit the reading against the plan.",
      why: "The plan sets a specific crown and cross-slope for this road so that water actually sheds off it instead of ponding in the travel lane, and the slope gauge is what proves the cut matches that number — not how level the road looks standing at one end of it.",
      gauge: { label: "CROWN — PER THE PLAN", speed: 0.68, green: [0.42, 0.62], readout: (t) => `${(t * 6).toFixed(1)}% cross-slope`, missNote: "Outside the plan's band — that section sheds water the wrong way or not at all. Grade it again rather than sign it off." },
    },
    {
      id: "compaction-check", kind: "select", target: "proof-roll-marker",
      title: "Proof-roll the graded surface",
      cue: "Run the proof roll and confirm no soft spots before the surface is called finished.",
      why: "A crown cut to the right shape over a soft spot still fails the first heavy truck that drives it — the proof roll is what catches that before the road is called done instead of after it ruts under the first load.",
    },
    {
      id: "culvert-place", kind: "drag", target: "culvert-pipe",
      title: "Set the culvert pipe",
      cue: "Carry the culvert pipe into the trench and seat it on the bedding at the marked grade.",
      why: "The pipe has to sit exactly on the bedding at the plan's invert grade for the ditch to actually drain through it rather than pond at one end — set here, on the bedding, is what the backfill goes in around next, not a pipe left sitting on bare trench bottom.",
      drag: { to: "culvert-bedding", radius: 0.5, missNote: "Not seated on the bedding — a pipe resting off the marked grade will settle unevenly and pond exactly where it was supposed to drain." },
    },
    {
      id: "backfill-track", kind: "track", target: "compactor-handle", seconds: 7,
      title: "Compact the backfill in lifts",
      cue: "Hold the compactor's pass speed steady in the band over the backfill lift.",
      why: "Backfill compacted too fast leaves voids under the road surface that show up as a settled dip months later; too slow overworks the lift without adding anything — a steady pass speed is what actually densifies the lift evenly across the pipe before the next one goes on top of it.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.55, fall: 0.5, drift: 0.13, label: "COMPACTOR PASS RATE", readout: (v) => (v < 0.4 ? "too fast — leaving voids" : v > 0.62 ? "overworking the lift" : "compacting evenly") },
      holdBreakNote: "Pass rate out of band — bring it back into the band so this lift actually compacts evenly before the next one goes on.",
    },
    {
      id: "reopen-road", kind: "select", target: "road-open-sign",
      title: "Reopen the road",
      cue: "Confirm the surface and shoulder are clear, then flip the sign to open the lane.",
      why: "Reopening the lane is its own decision, made after the surface and the shoulder are actually checked clear — not the moment the last tool is put away — because a road opened on a guess with tools or a trench still exposed is the exact hazard the work zone existed to keep off it.",
    },
    {
      id: "closing-log", kind: "sequence", anyOrder: true,
      targets: ["log-crown", "log-culvert", "log-compaction"],
      itemNames: { "log-crown": "crown reading logged", "log-culvert": "culvert install logged", "log-compaction": "compaction logged" },
      title: "Log the grading job",
      cue: "Write the crown reading, the culvert install and the compaction result into the grading log.",
      why: "The log is the record that this segment was actually graded to the plan and the culvert set at the depth it calls for — without it, the next crew working this road, or the inspector who signs off on it, is trusting a memory instead of a number.",
    },
    {
      id: "crew-checkin", kind: "select", target: "checkin-board",
      title: "Check in with the crew",
      cue: "Ask how the crew is doing after the bus and the cattle both came through the work zone, not just whether the road is done.",
      why: "A shift that includes a school bus and loose cattle both moving through an active work zone asks more attention of an operator than an ordinary grading day, and asking the question at the end of it is what keeps that kind of day from just getting absorbed as normal.",
    },
  ],

  interrupts: [
    {
      id: "school-bus-on-road",
      kind: "School bus approaching the work zone",
      after: "first-pass", delay: 3, seconds: 13,
      alert: "A school bus has just come around the bend, heading straight for the work zone on the one lane this road has.",
      cue: "Stop the grader. Get the flagger's stop sign up and escort the bus through.",
      target: "flagger-sign",
      why: "A school bus on a one-lane ranch road has nowhere to go around a working grader, and the flagger's stop sign is the one thing on this whole job that can actually hold traffic clear of the equipment while the operator gets the blade out of the way — waving it through on a guess trades a documented, practiced procedure for a judgment call made in the two seconds the bus is already visible.",
      missNote: "The grader kept working while the bus closed the distance. A driver following hand signals from a machine that is still moving is trusting a read on intent that the flagger's sign exists specifically so nobody has to make.",
      wrongNote: "It is the flagger's sign, not the blade — stop the grader and get the bus escorted through first.",
    },
    {
      id: "cattle-on-road",
      kind: "Cattle through an open gate",
      after: "culvert-place", delay: 3, seconds: 12,
      alert: "The gate at the fence line has swung open and a handful of cattle are wandering out toward the road and the open trench.",
      cue: "Stop work. Get the gate closed and the cattle clear before anyone goes back to the trench.",
      target: "gate-latch",
      why: "Cattle drawn toward an open trench and a running machine are a hazard to themselves and to the crew trying to work around them, and closing the gate is what actually solves the problem at its source instead of trying to herd animals away from equipment one at a time while the job is still live around them.",
      missNote: "Work went on with the cattle still loose near the trench and the machine. An animal that startles near an open excavation or a running grader can put itself, or somebody reacting to it, exactly where neither one should be.",
      wrongNote: "It is the gate, not the trench — close it and get the cattle clear before anything else continues.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, ORG_ACCENT);

    // ------------------------------------------------------------- the grader
    const graderRig = grader(g, -1.6, 0, 1.4, { ry: 2.6, livery: { colour: 0xf0b323, fleetName: "GRADE CREW", unitNumber: "GR-9" } });
    holoTag(graderRig, "Motor grader 9", 0, 3.2, 0, { css: "#c9a36b", w: 0.42 });
    const bladePart = graderRig.userData.parts.blade;
    reg(hits, bladePart, "blade-circle");
    const ropsPart = graderRig.userData.parts.rops;
    reg(hits, ropsPart, "clean-mirror");
    const beaconPart = graderRig.userData.parts.beacon;
    reg(hits, beaconPart, "blocked-backup-camera");
    // Blade depth, the pinch trap under the raised blade, and the worn
    // cutting edge — each its own invisible marker near the blade, since the
    // blade part itself is already registered for the turn step.
    const bladeLever = group(graderRig, 0.4, 1.3, -0.2);
    box(bladeLever, 0.04, 0.3, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(graderRig, "Blade depth", 0.4, 1.6, -0.2, { css: "#c9a36b", w: 0.3 });
    reg(hits, bladeLever, "blade-depth-lever");
    const cuttingEdgeMarker = box(graderRig, 0.3, 0.06, 0.06, 0, 0.3, 1.85, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(graderRig, "Cutting edge", 0, 0.5, 1.85, { css: "#f0645b", w: 0.32 });
    reg(hits, cuttingEdgeMarker, "worn-cutting-edge");
    const bladeUnderTrap = box(graderRig, 0.4, 0.3, 0.3, 0, 0.15, 1.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(graderRig, "Under the raised blade", 0, 0.35, 1.85, { css: "#f0645b", w: 0.4 });
    reg(hits, bladeUnderTrap, "reach-under-raised-blade");

    // ----------------------------------------------------------------- road
    const road = box(g, 3.2, 0.04, 8.0, 0.5, 0.02, -1.2, 0x8a7a5c, { rough: 0.95, cast: false });
    void road;
    const swingTrap = box(g, 1.4, 0.6, 1.4, -1.8, 0.3, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, swingTrap, "cross-swing-radius-grader");
    const blindSpotTrap = box(g, 0.8, 0.6, 0.8, -1.6, 0.3, 2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, blindSpotTrap, "stand-in-grader-blind-spot");

    // ------------------------------------------------------------- culvert
    const trench = box(g, 1.2, 0.02, 2.2, 1.6, 0.011, -3.0, 0x6d5f45, { rough: 0.9, cast: false });
    void trench;
    const trenchTrap = box(g, 1.0, 0.4, 1.8, 1.6, 0.2, -3.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Culvert trench", 1.6, 0.5, -3.0, { css: "#f0645b", w: 0.36 });
    reg(hits, trenchTrap, "enter-unprotected-trench");
    const culvertStake = group(g, 1.6, 0, -2.2);
    cyl(culvertStake, 0.02, 0.02, 0.6, 0, 0.3, 0, 0xf2c14b, { rough: 0.6, seg: 8 });
    holoTag(culvertStake, "Culvert stake", 0, 0.7, 0, { css: "#c9a36b", w: 0.32 });
    reg(hits, culvertStake, "culvert-plan-marker");
    const culvertBedding = box(g, 0.5, 0.02, 1.8, 1.6, 0.011, -3.0, 0x9a8a68, { rough: 0.9, cast: false });
    hits["culvert-bedding"] = culvertBedding;
    const culvertPipeRack = group(g, 3.0, 0, -1.4, Math.PI / 2);
    const culvertPipe = cyl(culvertPipeRack, 0.32, 0.32, 1.8, 0, 0.32, 0, 0x8b929a, { rough: 0.6, metal: 0.5, seg: 16 });
    culvertPipe.rotation.z = Math.PI / 2;
    holoTag(culvertPipeRack, "Culvert pipe", 0, 0.75, 0, { css: "#c9a36b", w: 0.32 });
    reg(hits, culvertPipe, "culvert-pipe");

    // -------------------------------------------------------- traffic control
    const signPost = group(g, 2.6, 0, 2.6);
    cyl(signPost, 0.03, 0.03, 1.6, 0, 0.8, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8 });
    const warnSign = decal(signPost, 0.5, 0.5, 0, 1.55, 0.01, signFace("ROAD WORK AHEAD", { bg: "#f2c14b", accent: "#1a1a1a", fg: "#1a1a1a", scale: 0.4 }), { px: 128 });
    holoTag(signPost, "Warning sign", 0, 1.9, 0, { css: "#c9a36b", w: 0.36 });
    reg(hits, warnSign, "warning-sign-placed");
    for (let i = 0; i < 4; i++) cone(g, 2.2 - i * 0.5, 2.0 - i * 0.4);
    const coneTaperMarker = box(g, 0.5, 0.5, 0.5, 1.0, 0.25, 1.0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Cone taper", 1.0, 0.6, 1.0, { css: "#c9a36b", w: 0.3 });
    reg(hits, coneTaperMarker, "cone-taper-set");

    const flagger = standingFigure(g, 2.2, 3.4, { ry: -2.4, cloth: 0x2b3a2f, vest: CITY.hiVis, helmet: 0xf2f2f2 });
    const flaggerSign = decal(flagger, 0.3, 0.3, 0.3, 1.3, 0, signFace("SLOW", { bg: "#f2c14b", accent: "#1a1a1a", fg: "#1a1a1a", scale: 0.5 }), { px: 96 });
    holoTag(flagger, "Flagger", 0, 2.0, 0, { css: "#c9a36b", w: 0.28 });
    reg(hits, flagger, "flagger-posted");
    reg(hits, flaggerSign, "flagger-sign");
    // The stop paddle itself: turned face-out and lit only while a vehicle is
    // actually being held — a real mesh swap, not just a repainted sign.
    const stopPaddle = box(flagger, 0.32, 0.32, 0.02, 0.32, 1.3, 0, 0x8a1f1f, { emissive: 0x8a1f1f, ei: 0, rough: 0.5 });
    stopPaddle.visible = false;

    // The school bus itself, parked out of sight up the road until the
    // interrupt actually brings it into the work zone.
    const bus = group(g, 5.5, 0, 4.6, -2.4);
    box(bus, 2.2, 1.6, 5.6, 0, 1.0, 0, 0xf2c14b, { rough: 0.55, metal: 0.15 });
    box(bus, 2.0, 0.5, 5.4, 0, 2.0, 0, 0xdfe3c8, { rough: 0.5 });
    for (let i = 0; i < 4; i++) cyl(bus, 0.32, 0.32, 0.24, -1.15, 0.32, -1.8 + i * 1.3, 0x1a1e23, { rough: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    bus.visible = false;

    const roadOpenSign = group(g, 2.6, 0, -4.4);
    box(roadOpenSign, 0.4, 0.3, 0.02, 0, 1.2, 0, 0x59c97b, { emissive: 0x59c97b, ei: 0.3, rough: 0.6 });
    holoTag(roadOpenSign, "Road open sign", 0, 1.5, 0, { css: "#c9a36b", w: 0.36 });
    reg(hits, roadOpenSign, "road-open-sign");

    // ------------------------------------------------------------ instruments
    const slopePost = group(g, -0.4, 0, -1.0);
    cyl(slopePost, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8 });
    const slopeGauge = instrument(slopePost, 0, 0.95, 0, { ry: 0.5, idle: "-- %", color: ORG_ACCENT, w: 0.16 });
    holoTag(slopePost, "Slope gauge", 0, 1.15, 0, { css: "#c9a36b", w: 0.34 });
    reg(hits, slopeGauge, "slope-gauge");

    const proofRoll = group(g, -0.8, 0, -1.8);
    ball(proofRoll, 0.02, 0, 0.02, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    const proofMarker = box(g, 0.4, 0.4, 0.4, -0.8, 0.2, -1.8, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Proof roll", -0.8, 0.5, -1.8, { css: "#c9a36b", w: 0.3 });
    reg(hits, proofMarker, "proof-roll-marker");

    const compactor = group(g, 2.8, 0, -2.6, -0.4);
    box(compactor, 0.5, 0.4, 0.7, 0, 0.2, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    const compactorHandle = box(compactor, 0.04, 0.5, 0.04, 0, 0.55, -0.3, 0x3a3f45, { rough: 0.5, metal: 0.4 });
    holoTag(compactor, "Plate compactor", 0, 0.9, -0.3, { css: "#c9a36b", w: 0.36 });
    reg(hits, compactorHandle, "compactor-handle");

    // ------------------------------------------------------------- ranch gate
    const gate = group(g, -3.4, 0, -2.6, 0.6);
    for (const sx of [-1, 1]) cyl(gate, 0.05, 0.05, 1.4, sx * 1.2, 0.7, 0, 0x6b4b30, { rough: 0.8, seg: 8 });
    const gateLeaf = box(gate, 2.3, 0.05, 0.05, 0, 1.1, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    holoTag(gate, "Ranch gate", 0, 1.6, 0, { css: "#c9a36b", w: 0.3 });
    reg(hits, gateLeaf, "gate-latch");
    const cattle = group(g, -2.0, 0, -3.4);
    for (let i = 0; i < 3; i++) {
      const c = group(cattle, i * 0.5, 0, (i % 2) * 0.3);
      box(c, 0.5, 0.4, 0.9, 0, 0.4, 0, 0x4a3a2a, { rough: 0.9 });
      for (const [lx, lz] of [[-0.18, -0.35], [0.18, -0.35], [-0.18, 0.35], [0.18, 0.35]]) cyl(c, 0.04, 0.04, 0.35, lx, 0.18, lz, 0x2b2018, { rough: 0.8, seg: 6 });
    }
    cattle.visible = false;

    // ---------------------------------------------------------------- boards
    const workOrderBoard = holoPanel(g, 0.56, 0.4, -1.6, 1.35, 3.2, (cx, w, h) => {
      cx.fillStyle = "rgba(20,16,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#c9a36b"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#f2e6d0";
      cx.fillText("GRADING PLAN — RANCH RD 6", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0d0b0";
      ["Crown and cross-slope per plan", "Culvert station 4+20, set to invert", "MUTCD work zone required"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: 0.9, accent: ORG_ACCENT });
    reg(hits, workOrderBoard, "work-order-board");

    const condBoard = holoPanel(g, 0.56, 0.4, -1.6, 1.35, 3.7, (cx, w, h) => {
      cx.fillStyle = "rgba(20,16,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b134"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffe9c8";
      cx.fillText("WIND & DUST CONDITIONS", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f0d9ad";
      ["Check the current spot forecast", "Dust control plan sets watering", "No figure repeated here as fact"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: 0.9, accent: 0xf2b134 });
    reg(hits, condBoard, "conditions-board");

    const checkinBoard = holoPanel(g, 0.55, 0.38, -1.6, 1.35, -4.2, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd1ff"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#e2f6ff";
      cx.fillText("CREW CHECK-IN", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfeaf7";
      ["\"How are you doing?\" — ask it", "IUOE member assistance line posted", "Answer logged, not assumed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: 0.9, accent: 0x4fd1ff });
    reg(hits, checkinBoard, "checkin-board");

    // Log board.
    const logSpec = [["log-crown", -0.2], ["log-culvert", 0.0], ["log-compaction", 0.2]];
    const logBoard = group(g, -2.4, 0, -4.0);
    for (const [id, tx] of logSpec) {
      const tile = box(logBoard, 0.12, 0.12, 0.02, tx, 0.9, 0, 0x1a0c0d, { rough: 0.6 });
      reg(hits, tile, id);
    }
    holoTag(logBoard, "Grading log", 0, 1.08, 0, { css: "#c9a36b", w: 0.3 });

    // A ground hand, clear of every control and the grader's own envelope.
    standingFigure(g, -3.2, 1.8, { ry: 1.6, cloth: 0x2b3a2f, vest: CITY.hiVis, helmet: 0xf2f2f2 });

    const dust = particles(g, 50, 0xc9bfa6, { size: 0.05, life: 1.4, additive: false, opacity: 0.35 });
    dust.position.set(-1.6, 0.3, 1.4);

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(0.6, 1.2, -0.4),

      onStepComplete(step) {
        if (step.id === "traffic-control") flaggerSign.material.emissiveIntensity = 0.3;
        if (step.id === "crown-grade-gauge") slopeGauge.userData.screen && repaint(slopeGauge.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
        if (step.id === "culvert-place") culvertPipe.material = mat(0x6b7078, { rough: 0.6, metal: 0.5 });
      },

      onInterrupt(it) {
        if (it.id === "school-bus-on-road") {
          bus.visible = true;
          stopPaddle.visible = true;
          stopPaddle.material.emissiveIntensity = 1.8;
          repaint(flaggerSign, signFace("STOP", { bg: "#8a1f1f", accent: "#ffffff", fg: "#ffffff", scale: 0.5 }));
        }
        if (it.id === "cattle-on-road") { cattle.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "school-bus-on-road") {
          bus.visible = false;
          stopPaddle.visible = false;
          repaint(flaggerSign, signFace("SLOW", { bg: "#f2c14b", accent: "#1a1a1a", fg: "#1a1a1a", scale: 0.5 }));
        }
        if (it.id === "cattle-on-road") { cattle.visible = false; }
      },

      animate(t, dt, session) {
        dust.visible = true;
        dust.userData.step(dt, new THREE.Vector3(-1.6, 0.3, 1.4), 1.0, 0.3, 0.15);
        if (session?.step?.id === "backfill-track" && session.track) {
          compactorHandle.rotation.x = Math.sin(t * 6) * 0.1;
        }
        void t;
      },
    };
  },
};
