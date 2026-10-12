import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { pileDrivingRig } from "../../../shared/equipment.js";
import { shippingContainer } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pile Driving Rig & Lead Setup VR — its own gamified system:
// Pile Command.
//
// The IUOE pile rig operator's own procedure for setting the leads and
// driving the first pile: the rig itself inspected before the leads ever go
// up, the ground mats set under the tracks, the drop zone barricaded, the
// leads plumbed in two planes before the pile is even set in the gate, an
// overhead clearance confirmed away from anything energised, and the pile
// started on low energy with a spotter watching plumbness before full
// driving ever begins. No pile length, blow count or refusal criterion here
// is one this platform is certain of — those live on the job's own pile
// driving plan.

const OPPD_ACCENT = 0x6a4fb0;

export const SIM_OP_PILE_DRIVING_RIG_AND_LEAD_SETUP = {
  id: "op-pile-driving-rig-and-lead-setup",
  index: "op-7",
  domain: "Construction",
  trade: "Pile driving rig operator — IUOE Local 3 operating engineer",
  category: "Construction & Structural Trades",
  weather: "overcast",
  certification: "IUOE Local 3 operating engineer training; OSHA 29 CFR 1926.603 Pile driving equipment and 29 CFR 1926 Subpart O Motor vehicles, mechanized equipment, and marine operations; 29 CFR 1926.21 safety training and education; NIOSH fatality-investigation findings on struck-by incidents around pile driving rigs",
  name: "Pile Driving Rig & Lead Setup",
  title: simTitle("Pile Driving Rig & Lead Setup"),
  tagline: "Pile driving rig set up and proved before the first pile: the rig inspected, the drop zone barricaded, the leads plumbed in two planes, overhead clearance confirmed, and the pile started on low energy under a tender's signal",
  accent: OPPD_ACCENT,
  accentCss: "#6a4fb0",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "pile-command", name: "Pile Command", note: "Leads plumbed in two planes, the drop zone held clear, and the pile started on low energy before full driving began" },

  game: system({
    name: "Pile Command",
    currency: "PILE",
    ranks: ["Ground Hand", "Rig Hand", "Lead Certified", "Drive Authority", "Pile Command Certified"],
    badges: [
      { id: "plumb-first", name: "Plumb First", note: "Never drove a pile before the leads were confirmed plumb", test: AWARD.stepClean("plumb-check") },
      { id: "drop-zone-held", name: "Drop Zone Held", note: "Never let anyone stand under the suspended load", test: AWARD.safe },
      { id: "steady-drive", name: "Steady Drive", note: "Held the gauge readings near band centre all shift", test: AWARD.precise(0.72) },
      { id: "clean-set", name: "Clean Set Certified", note: "Set the pile clean, first try", test: AWARD.stepClean("pile-rig-in") },
    ],
    challenges: [
      { id: "quick-setup", name: "Quick Setup", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "pile-streak", name: "Pile Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IUOE local's member assistance programme, or the site's employee assistance line if a close call under the leads is what stayed with you",

  hazards: {
    "drop-zone-stand": "You are standing under the leads while a pile or the hammer is suspended above. OSHA's pile driving equipment rule at 29 CFR 1926.603 exists because anything suspended over a person's head is a load that only has to fail once, and the drop zone is barricaded so that failure has nobody underneath it.",
    "unplumbed-drive-hazard": "That drives the pile before the leads were confirmed plumb in both planes. A pile started out of plumb does not correct itself as it goes deeper — it walks further off line with every blow, and by the time it is obviously wrong it is already too deep to pull back and reset.",
    "overhead-line-hazard": "The leads are inside the clearance distance to the overhead line at this position. Raised steel leads reaching toward an energised conductor do not need to touch it to close the gap — the clearance is what keeps that gap a fact of the setup, not a judgement call made under a live line.",
    "cushion-skip-hazard": "That skips the hammer cushion and pile cap check before driving. A missing or worn cushion transmits the full force of every blow straight into the pile head and the hammer's own striking parts, and that is exactly what shatters a pile head or damages a hammer this rig cannot easily replace mid-shift.",
  },

  lateNotes: {
    "plumb-target": "The leads get plumbed in both planes before the pile is even set in the gate, not corrected afterward once the pile has already started driving out of line.",
    "blow-log": "The blow count gets logged against the refusal criterion as driving happens, not reconstructed afterward from memory once the pile is already at its final depth.",
  },

  interrupts: [
    {
      id: "pile-walks-off-plumb",
      kind: "Plumbness lost",
      after: "pitch-and-drive", delay: 4, seconds: 12,
      alert: "The pile has started leaning out of plumb on the first low-energy blows, visible against the leads' own reference marks.",
      cue: "Call it out and stop the hammer before the pile drives any further out of line.",
      target: "tender",
      why: "Low-energy starting blows exist specifically to catch a pile that is walking off plumb while it is still shallow enough to pull back and reset — a lean that goes uncalled at this stage is a lean that gets driven permanently into the ground a few blows later.",
      missNote: "The hammer kept striking while the pile walked further out of plumb. Once a misaligned pile is driven to depth, resetting it means pulling and starting over, not nudging it back into line.",
      wrongNote: "Not that — the pile walking out of plumb is what has to stop this drive before anything else about it matters.",
    },
    {
      id: "worker-enters-drop-zone",
      kind: "Drop zone incursion",
      after: "direct-drive", delay: 4, seconds: 11,
      alert: "A coworker has walked under the leads to check something on the far side, straight into the drop zone.",
      cue: "Stop the hammer now and get them clear before the next blow.",
      target: "drop-zone-stop-flag",
      why: "The barricade only controls who chooses to respect it — the plan still needs a live response for the one person who does not, and the hammer has to be stopped the instant someone is seen under the leads, not signalled to hurry up and clear it.",
      missNote: "The hammer kept striking while a coworker was under the leads. Nothing about a driving pile gives a person underneath it any warning before the next blow lands.",
      wrongNote: "Not that — the person in the drop zone is what has to stop this drive before anything else continues.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the rig",
      cue: "Hi-vis vest and hard hat before anyone is near the leads.",
      why: "A rig this tall is going to have a crew working in close under it, and the tender's whole job of watching for anyone near the drop zone depends on being able to pick a person out from the ground and steel around them at a glance.",
    },
    {
      id: "pile-plan", kind: "select", target: "pile-plan-board",
      title: "Read the pile driving plan",
      cue: "Confirm the pile type, the target tip elevation and the refusal criterion before rigging up.",
      why: "The plan is what sets today's refusal criterion — the blow count per foot that means this pile has reached capacity — and driving without having read it first means the operator has no way to know when to stop short of guessing.",
    },
    {
      id: "inspect-rig", kind: "find", noHint: true,
      targets: ["worn-sheave", "damaged-gate", "hydraulic-leak"],
      itemNames: {
        "worn-sheave": "worn hoist line sheave",
        "damaged-gate": "damaged pile gate",
        "hydraulic-leak": "hydraulic leak at the raising boom",
      },
      itemNotes: {
        "worn-sheave": "A sheave grooved deep enough to pinch the hoist line wears through that line faster than the inspection interval expects it to.",
        "damaged-gate": "A pile gate that does not close fully lets the pile shift sideways in the leads exactly when the hammer's first blows need it held dead straight.",
        "hydraulic-leak": "A leak at the raising boom is pressure this rig is losing in the one system holding the leads at the angle they were just plumbed to.",
      },
      decoyNotes: {
        "sound-hammer-mount": "The hammer mount is tight, dry and shows no wear. Nothing to flag there.",
      },
      title: "Inspect the rig before raising the leads",
      cue: "Walk the rig. Three problems are hiding on it — find them by looking.",
      why: "A rig that looks ready from the ground is not the same thing as one a competent person has actually walked before the leads go up — a worn sheave, a damaged gate or a hydraulic leak found now costs a repair, and found once the leads are raised and loaded costs a rig that fails with a pile already in the gate.",
    },
    {
      id: "set-mats", kind: "sequence", anyOrder: true,
      targets: ["mat-left", "mat-right"],
      itemNames: { "mat-left": "ground mat, left track", "mat-right": "ground mat, right track" },
      title: "Set the ground mats",
      cue: "Set a mat under each track before raising the leads.",
      why: "This rig's stability with the leads raised assumes the ground under both tracks can actually carry that weight without settling unevenly — the mats are what make that assumption true instead of something the crew discovers the first time the leads start to lean.",
    },
    {
      id: "barricade-drop-zone", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "drop-zone-barrier"],
      itemNames: { "cone-a": "cone at the approach", "cone-b": "cone at the far side", "drop-zone-barrier": "drop zone barrier" },
      title: "Barricade the drop zone",
      cue: "Cone both approaches and set the barrier around the full area under the leads.",
      why: "Everything under the leads is inside the drop zone the moment anything is suspended in them, and the barrier is what keeps that zone empty of anyone who is not the crew actually running the drive.",
    },
    {
      id: "tender-brief", kind: "select", target: "tender",
      title: "Confirm the tender's protocol",
      cue: "Agree hand signals and the stop signal with the dedicated tender before raising the pile.",
      why: "The tender is watching the leads' plumbness and the drop zone from an angle the operator's own seat cannot match, and that only works if both of them already agree what a stop signal looks like before the hammer is running and it is needed for real.",
    },
    {
      id: "rake-adjust", kind: "turn", target: "rake-lever",
      title: "Plumb the leads' rake",
      cue: "Turn the rake lever to bring the leads to the plan's angle before the pile goes in.",
      why: "The rake sets the leads' angle in the plane along the direction of drive, and getting it right before the pile is set means the first blow is already driving on line instead of correcting a lean nobody caught until the pile was already moving.",
      turn: { turns: 0.5, axis: "z", label: "LEAD RAKE" },
    },
    {
      id: "pile-rig-in", kind: "drag", target: "pile-roll",
      title: "Set the pile in the leads",
      cue: "Carry the pile to the gate and seat it in the leads before closing the gate.",
      why: "The pile only sits where the crew actually sets it — carrying it in deliberately and seating it square in the gate is what gives the plumb check that follows something honest to measure, rather than a pile already leaning from how it was dropped in.",
      drag: { to: "pile-socket", radius: 0.4, missNote: "Not seated in the gate — carry the pile fully into the leads before closing anything on it." },
    },
    {
      id: "plumb-check", kind: "gauge", target: "plumb-target",
      title: "Check the leads are plumb",
      cue: "Read the plumb bubble in both planes and commit only when it is centred.",
      why: "A pile driven from leads that are out of plumb in either plane drifts off line with every blow, and by the time that drift is visible at the surface the pile is already too deep to correct — this is where plumbness gets proven, not assumed from how the rig looks standing there.",
      gauge: {
        label: "LEAD PLUMB", speed: 0.6, green: [0.46, 0.58],
        readout: (t) => `${((t - 0.5) * 4).toFixed(1)}° off plumb`,
        missNote: "Not plumb. Adjust the rake and the mats before the pile goes anywhere near the gate.",
      },
    },
    {
      id: "cushion-check", kind: "select", target: "hammer-cushion",
      title: "Confirm the hammer cushion and pile cap",
      cue: "Confirm the cushion and pile cap are seated and in good condition before the first blow.",
      why: "The cushion is what spreads the hammer's force evenly across the pile head instead of concentrating it on one point — a worn or missing cushion shatters a pile head or damages the hammer's own striking parts on blows this rig cannot recover from mid-shift.",
    },
    {
      id: "pitch-and-drive", kind: "hold", target: "rig-controls", seconds: 6,
      title: "Start the pile on low energy",
      cue: "Hold the hammer on low energy for the first blows, watching the plumb reference the whole time.",
      why: "Starting on low energy is what gives the crew a chance to actually see a pile beginning to walk off plumb while it is still shallow enough to stop, pull back and reset — full energy from the first blow removes that chance entirely.",
      holdBreakNote: "Released the hammer mid-set. Hold it through the low-energy start — that is what catches a pile walking off plumb before it is driven too deep to fix.",
    },
    {
      id: "direct-drive", kind: "track", target: "tender", seconds: 8,
      title: "Drive under the tender's signal",
      cue: "Keep the tender's signal steady, holding the drive inside the barricaded drop zone.",
      why: "The tender is watching the one thing the operator's own seat cannot judge from directly behind the leads — how plumb the pile is actually staying as it goes in — and continuous signals are what keep the operator trusting that reading instead of guessing it from the cab.",
      track: {
        start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12,
        label: "DRIVE LINE",
        readout: (v) => (v < 0.4 ? "walking off plumb" : v > 0.62 ? "driving too fast to read" : "on line"),
      },
      holdBreakNote: "The drive drifted off the tender's signal. Bring it back on line before the hammer strikes again.",
    },
    {
      id: "blow-count-check", kind: "gauge", target: "blow-log",
      title: "Check the blow count against refusal",
      cue: "Read the blow count and commit only once it reads inside the plan's target band.",
      why: "The blow count per foot is the one number that tells the crew this pile has actually reached the capacity the plan calls for — stopping short of it means an underdriven pile, and driving well past it risks damage the log was supposed to catch before it happened.",
      gauge: {
        label: "BLOWS PER FOOT", speed: 0.55, green: [0.45, 0.72],
        readout: (t) => `${Math.round(4 + t * 20)} blows/ft`,
        missNote: "Outside the plan's target band. Confirm the reading against the refusal criterion before driving further.",
      },
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the pile driving log",
      cue: "Log the plumb reading, the blow count and the final depth before shutting the rig down.",
      why: "The pile driving log is what the foundation inspection and the next shift both read — a pile that was set and driven cleanly but never logged against the refusal criterion leaves nothing behind to prove it actually met the plan.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, OPPD_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.6, 0.14, 6.2, 0, 0.07, 0, 0xffffff, { rough: 0.94 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#463c2c", base2: "#3a3122", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.94, metal: 0.02, color: 0xb9a67b },
    );

    // ------------------------------------------------------------------ the rig
    const rig = pileDrivingRig(g, -1.2, 0.14, -1.2, { ry: 1.4, livery: { colour: OPPD_ACCENT, fleetName: "SITE PILING", unitNumber: "PD-11" } });
    const { house, leads, hammer, gate, cabDoor } = rig.userData.parts;
    holoTag(rig, "pile rig PD-11", 0, 4.5, 0, { css: "#6a4fb0", w: 0.36 });
    reg(hits, cabDoor, "rig-controls");

    const soundHammerMount = group(house, 0.5, 0.2, -0.3);
    ball(soundHammerMount, 0.03, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 10 });
    reg(hits, soundHammerMount, "sound-hammer-mount");
    const wornSheave = group(leads, 0.4, 6.2, 0);
    torus(wornSheave, 0.06, 0.014, 0, 0, 0, 0xb8402f, { rough: 0.7, seg: 8, seg2: 16 });
    reg(hits, wornSheave, "worn-sheave");
    const damagedGate = group(gate, 0, 0.1, 0.3);
    box(damagedGate, 0.1, 0.03, 0.02, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, damagedGate, "damaged-gate");
    const hydraulicLeak = group(house, -0.3, 0.9, 0.6);
    ball(hydraulicLeak, 0.03, 0, 0, 0, 0x2b2318, { rough: 0.5, opacity: 0.7, transparent: true, seg: 10 });
    reg(hits, hydraulicLeak, "hydraulic-leak");

    const rakeLever = group(g, -1.8, 0.14, 0.6, 0.3);
    box(rakeLever, 0.08, 0.04, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.55 });
    const rakeKnob = cyl(rakeLever, 0.018, 0.018, 0.16, 0.06, 0.5, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.6, rough: 0.4, seg: 12 });
    rakeKnob.rotation.z = Math.PI / 2;
    holoTag(rakeLever, "lead rake", 0, 0.66, 0, { css: "#6a4fb0", w: 0.3 });
    reg(hits, rakeKnob, "rake-lever");
    const driveAnywayLever = box(rakeLever, 0.08, 0.06, 0.02, -0.14, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(driveAnywayLever, 0.07, 0.05, 0, 0, 0.011, signFace("DRIVE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    reg(hits, driveAnywayLever, "unplumbed-drive-hazard");
    const skipCushionLever = box(rakeLever, 0.08, 0.06, 0.02, 0.14, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(skipCushionLever, 0.07, 0.05, 0, 0, 0.011, signFace("SKIP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    reg(hits, skipCushionLever, "cushion-skip-hazard");

    // ------------------------------------------------------------------ pile + gauges
    const pileRoll = group(g, 1.6, 0.14, 0.8, 0.2);
    cyl(pileRoll, 0.14, 0.14, 1.6, 0, 0.8, 0, 0x8b929a, { rough: 0.55, metal: 0.4, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(pileRoll, "pile", 0, 0.4, 0, { css: "#6a4fb0", w: 0.24 });
    reg(hits, pileRoll, "pile-roll");
    const pileSocket = group(gate, 0, 1.0, 0);
    hits["pile-socket"] = pileSocket;

    const plumbTarget = instrument(g, 1.6, 0, -0.6, { ry: -0.3, idle: "--°", color: OPPD_ACCENT });
    holoTag(plumbTarget, "plumb bubble", 0, 0.16, 0, { css: "#6a4fb0", w: 0.3 });
    reg(hits, plumbTarget, "plumb-target");
    const blowLog = instrument(g, 1.6, 0, -1.4, { ry: -0.3, idle: "-- bpf", color: OPPD_ACCENT });
    holoTag(blowLog, "blow count log", 0, 0.16, 0, { css: "#6a4fb0", w: 0.36 });
    reg(hits, blowLog, "blow-log");

    const cushionMount = group(hammer, 0, -0.6, 0);
    box(cushionMount, 0.5, 0.1, 0.4, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    holoTag(cushionMount, "hammer cushion", 0, 0.16, 0, { css: "#6a4fb0", w: 0.32 });
    reg(hits, cushionMount, "hammer-cushion");

    // ------------------------------------------------------------------ overhead line
    const overheadLine = group(g, 2.6, 0, -2.0);
    cyl(overheadLine, 0.05, 0.05, 4.0, 0, 4.2, 0, 0x2b2f34, { rough: 0.6, metal: 0.4, seg: 10 });
    cyl(overheadLine, 0.012, 0.012, 5.0, 0, 4.4, 0, 0x1c1c1c, { rough: 0.5, metal: 0.5, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(overheadLine, "overhead line", 0, 4.7, 0, { css: "#f0645b", w: 0.34 });
    const clearanceMarker = group(g, 1.9, 0, -1.6);
    hits["overhead-clearance-marker"] = clearanceMarker;
    reg(hits, clearanceMarker, "overhead-clearance-marker");
    const overheadHazard = box(g, 1.0, 0.02, 1.0, 2.3, 3.0, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, overheadHazard, "overhead-line-hazard");

    // ------------------------------------------------------------------ guarding
    reg(hits, cone(g, -2.9, 2.3, { color: OPPD_ACCENT }), "cone-a");
    reg(hits, cone(g, 2.9, 2.3, { color: OPPD_ACCENT }), "cone-b");
    const barrierPanels = [];
    for (const [bx, bz, ry] of [[-1.2, 3.0, 0], [0.0, 3.0, 0], [1.2, 3.0, 0], [-2.4, 0.8, Math.PI / 2]]) {
      const p = barrierPanel(g, bx, bz, { ry, w: 1.1, color: OPPD_ACCENT });
      p.visible = false;
      barrierPanels.push(p);
    }
    const dropZoneBarrierKit = group(g, -2.4, 0, -0.8, -0.4);
    slab(dropZoneBarrierKit, 1.0, 0.14, 0.18, 0, 0.08, 0, OPPD_ACCENT, { radius: 0.02, rough: 0.6 });
    holoTag(dropZoneBarrierKit, "drop zone barrier", 0, 0.3, 0, { css: "#6a4fb0", w: 0.38 });
    reg(hits, dropZoneBarrierKit, "drop-zone-barrier");
    const dropZoneShadow = box(g, 1.4, 0.005, 1.4, -1.2, 0.15, -1.2, 0x000000, { opacity: 0.16, transparent: true, cast: false });
    holoTag(dropZoneShadow, "drop zone", -1.2, 0.3, -0.4, { css: "#f0645b", w: 0.3 });
    reg(hits, dropZoneShadow, "drop-zone-stand");

    // Ground mats.
    const matLeft = group(g, -0.4, 0, -2.4);
    box(matLeft, 1.4, 0.05, 0.7, 0, 0.025, 0, 0x453522, { rough: 0.9 });
    reg(hits, matLeft, "mat-left");
    const matRight = group(g, -2.0, 0, -2.4);
    box(matRight, 1.4, 0.05, 0.7, 0, 0.025, 0, 0x453522, { rough: 0.9 });
    reg(hits, matRight, "mat-right");

    // Drop-zone stop flag the worker-enters-drop-zone interrupt is answered with.
    const dropStopFlag = group(g, 0.4, 0.14, 1.8, 0.3);
    cyl(dropStopFlag, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(dropStopFlag, 0.16, 0.11, 0.01, 0, 0.62, 0.02, 0xd2312b, { rough: 0.55 });
    decal(dropStopFlag, 0.14, 0.09, 0, 0.62, 0.026, signFace("STOP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(dropStopFlag, "drop zone stop", 0, 0.78, 0, { css: "#6a4fb0", w: 0.34 });
    reg(hits, dropStopFlag, "drop-zone-stop-flag");

    // ------------------------------------------------------------------ crew
    const tender = standingFigure(g, 2.3, 1.4, { ry: -2.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(tender, "tender", 0, 1.95, 0.15, { css: "#6a4fb0", w: 0.24 });
    reg(hits, tender, "tender");
    const tenderSafe = { x: 2.3, z: 1.4 };

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.58, 0.4, -2.7, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6a4fb0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PILE DRIVING PLAN · P-14", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("REFUSAL PER THE PLAN", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Pile type + length: per the plan", "Plumb tolerance: per the spec",
       "Overhead clearance: confirmed before swinging", "Cushion: checked before every pile",
       "Drop zone: barricaded before raising"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.5, accent: OPPD_ACCENT });
    reg(hits, plan, "pile-plan-board");

    const ppeRack = group(g, -2.9, 0, 2.5, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, OPPD_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#6a4fb0", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#6a4fb0", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    const closingLog = group(g, 2.7, 0, 2.5, 0.4);
    slab(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("PILE LOG\nOPEN", { bg: "#11181f", accent: "#6a4fb0", scale: 0.3 }), { px: 320 });
    holoTag(closingLog, "pile driving log", 0, 1.34, 0, { css: "#6a4fb0", w: 0.32 });
    reg(hits, closingLog, "closing-log");

    // Site dressing from the shared props kit.
    shippingContainer(g, 2.9, 0, -2.6, { ry: -0.4 });

    const dust = particles(rig, 20, 0x9a8a6a, { size: 0.02, life: 0.6, additive: false, opacity: 0.16 });

    return {
      hits,
      footprint: 2.6,

      onInterrupt(it) {
        if (it.id === "pile-walks-off-plumb") { leads.rotation.x = 0.06; }
        if (it.id === "worker-enters-drop-zone") { tender.position.x -= 0.5; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pile-walks-off-plumb") { leads.rotation.x = 0; }
        if (it.id === "worker-enters-drop-zone") { tender.position.x += 0.5; }
      },
      onStepComplete(step) {
        if (step.id === "inspect-rig") {
          wornSheave.children[0].material = mat(0x59c97b, { rough: 0.5 });
          damagedGate.children[0].material = mat(0x59c97b, { rough: 0.6 });
          hydraulicLeak.children[0].material = mat(0x59c97b, { rough: 0.5, opacity: 0.3, transparent: true });
        }
        if (step.id === "barricade-drop-zone") barrierPanels.forEach((p) => { p.visible = true; });
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("PILE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        tender.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.4, 0), 0.15, 0.15, -0.1);
        if (session?.step?.id === "pitch-and-drive" && session.holding) {
          hammer.position.y = 5.6 - Math.abs(Math.sin(t * 8)) * 0.3;
        } else if (session?.step?.id === "direct-drive" && session.holding) {
          hammer.position.y = 5.6 - Math.abs(Math.sin(t * 12)) * 0.5;
        } else {
          hammer.position.y = 5.6;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "plumb-check") {
            const off = ((gg.t - 0.5) * 4).toFixed(1);
            repaint(plumbTarget.userData.screen, signFace(`${off}°`, {
              bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
            }));
          }
          if (session.step?.id === "blow-count-check") {
            const bpf = Math.round(4 + gg.t * 20);
            repaint(blowLog.userData.screen, signFace(`${bpf} bpf`, {
              bg: "#0d1c24", accent: gg.t > 0.45 && gg.t < 0.72 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
            }));
          }
        }
        void tenderSafe;
      },
    };
  },
};
