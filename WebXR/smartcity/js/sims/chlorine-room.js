import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, valveWheel, cylinderTank, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Chlorine Room VR — Water & Environmental, station four.
// A 150-lb chlorine cylinder change at a water treatment plant: the room
// monitor and the SCBA before the door, the empty isolated and capped, the
// full one on the scale and chained, a new lead gasket every time, a yoke
// snugged a quarter turn past hand tight, an ammonia leak test before the
// valve opens one turn and no more, and the wrench left on the stem.

const CR_ACCENT = 0x7fd8a8;

export const SIM_CHLORINE_ROOM = {
  id: "chlorine-room",
  index: "38",
  domain: "Water & Environmental",
  trade: "Water treatment plant operator",
  category: "Water & Environmental",
  indoor: "plant",
  certification: "State / AWWA Water Treatment Operator Grade II; Chlorine Institute Pamphlets 1 and 65 (cylinder handling, Emergency Kit A); OSHA 29 CFR 1910.1000 chlorine PEL and 1910.134 respiratory protection; NFPA 55 compressed gas storage",
  name: "Chlorine Room",
  title: simTitle("Chlorine Room"),
  tagline: "150-lb chlorine cylinder change: room monitor and SCBA before the door, empty isolated and capped, full one on the scale and chained, new gasket, yoke a quarter turn past snug, ammonia leak test, valve one turn, wrench on the stem",
  accent: CR_ACCENT,
  accentCss: "#7fd8a8",
  parSeconds: 270,
  footprint: 2.4,
  badge: { id: "tight-and-tested", name: "Tight and Tested", note: "A change with a new gasket, a quarter-turn yoke, a clean ammonia test and the valve opened one turn — first time" },

  game: system({
    name: "Plant Operations",
    currency: "PPM",
    ranks: ["Operator-in-Training", "Grade I", "Grade II", "Chief Operator", "Plant Operations Certified"],
    badges: [
      { id: "door-discipline", name: "Door Discipline", note: "Monitor read and SCBA staged before the first valve, first time", test: AWARD.stepClean("scba") },
      { id: "never-reused", name: "Never Reused", note: "Never a reused gasket, never water on a leak, never in without air", test: AWARD.safe },
      { id: "quarter-turn", name: "Quarter Turn", note: "Yoke and feed rate both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-change", name: "Clean Change", note: "No corrections anywhere in the change", test: AWARD.clean },
      { id: "steady-test", name: "Steady Test", note: "Ammonia test held over every joint without a break", test: AWARD.unbroken },
      { id: "change-fast", name: "Changed In Time", note: "Cylinder on line inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "no-scba-entry": "You went into the chlorine room with no SCBA staged and nobody outside. A leak in there is one breath from a hospital; the air pack at the door and the operator watching through the window are what turn a leak into a procedure instead of a rescue.",
    "reused-gasket": "You reused the old lead gasket. A lead gasket crushes once to seal; the second time it seals until the pressure comes on and then weeps chlorine at the yoke all night.",
    "water-on-leak": "You put water on a chlorine leak. Chlorine and water make hydrochloric acid — the leak corrodes wider, the cloud grows, and the room becomes an entry for a hazmat team.",
    "roll-uncapped": "You moved a cylinder with the valve uncapped and unhooded. A snapped valve on a 150-lb cylinder empties it into the room in minutes; the cap and hood go on before the cylinder moves an inch.",
  },

  lateNotes: {
    "full-valve": "The new cylinder opens only after the yoke is tight and the ammonia test is clean — a leak found with the valve open is a release, not a test.",
    "feed-rotameter": "Feed rate is set once the cylinder is on line and tested; the rotameter reads nothing until then.",
    "ammonia-bottle": "The leak test comes after the yoke is snugged — there is nothing to test before the joint is made.",
  },

  steps: [
    {
      id: "sop", kind: "select", target: "sop-board",
      title: "Read the SOP and today's feed rate",
      cue: "Check the change-out procedure, the feed setpoint and who is the outside operator.",
      why: "The SOP names the setpoint the plant needs and the two-person rule for the room. The change is done the same way every time so the one time it leaks, the response is a habit.",
    },
    {
      id: "monitor", kind: "gauge", target: "room-monitor",
      title: "Check the room monitor",
      cue: "Read the chlorine monitor and bump-test it — commit when it reads inside the clean-air band.",
      why: "The monitor is the only thing that smells chlorine before you do at a concentration that matters. It is read and bump-tested before the door opens, every time.",
      gauge: { label: "ROOM Cl₂", speed: 0.7, green: [0.05, 0.22], readout: (t) => `${(t * 5).toFixed(1)} ppm`, missNote: "Above the clean-air band — do not enter; ventilate and re-read." },
    },
    {
      id: "scba", kind: "sequence", anyOrder: true,
      targets: ["scba-stage", "outside-operator"],
      itemNames: { "scba-stage": "SCBA at the door", "outside-operator": "outside operator" },
      title: "Stage the SCBA and post the outside operator",
      cue: "SCBA checked and staged at the door; a second operator outside the room with a radio and eyes on the window.",
      why: "Nobody works a chlorine cylinder alone. The pack is at the door because the leak, if it comes, comes at the yoke where you are standing.",
    },
    {
      id: "close", kind: "turn", target: "empty-valve",
      title: "Close the empty cylinder's valve",
      cue: "Turn the valve on the empty cylinder fully closed with the cylinder wrench.",
      why: "The regulator is removed from a closed valve. The cylinder is 'empty' at 20 lb residual and still under vapour pressure.",
      turn: { turns: 1, axis: "y", label: "CYLINDER VALVE" },
    },
    {
      id: "capoff", kind: "sequence",
      targets: ["vac-reg-off", "outlet-cap-on", "hood-on"],
      itemNames: { "vac-reg-off": "vacuum regulator", "outlet-cap-on": "outlet cap", "hood-on": "valve hood" },
      title: "Remove the regulator, cap and hood the empty",
      cue: "Vacuum regulator off the valve, outlet cap on, protective hood over the valve — in that order.",
      why: "The cap seals the outlet and the hood protects the valve stem. An uncapped, unhooded cylinder is the one that snaps a valve when it is rolled.",
      outOfOrderNote: "Regulator off, then cap, then hood — the valve is sealed before it is covered.",
    },
    {
      id: "swap", kind: "drag", target: "full-cylinder",
      title: "Bring the full cylinder onto the scale",
      cue: "Roll the full cylinder from the storage rack, hooded, and seat it on the scale.",
      why: "The scale is how the plant knows what is left: feed is confirmed by weight loss, and an empty is called at 20 lb residual, never run to zero.",
      drag: { to: "scale-socket", radius: 0.4, missNote: "Not on the scale — seat the cylinder on the platform, valve toward the yoke." },
    },
    {
      id: "secure", kind: "sequence", anyOrder: true,
      targets: ["chain-cylinder", "gasket-new"],
      itemNames: { "chain-cylinder": "restraint chain", "gasket-new": "new lead gasket" },
      title: "Chain the cylinder and fit a new gasket",
      cue: "Chain the cylinder upright to the wall bracket, and take a new lead gasket from the sealed pack for the yoke.",
      why: "A chained cylinder cannot fall on its valve. A new gasket every connection is the Chlorine Institute rule because the old one has already been crushed once.",
    },
    {
      id: "yoke", kind: "gauge", target: "yoke-wrench",
      title: "Tighten the yoke",
      cue: "Snug the yoke by hand, then a quarter turn with the wrench — commit inside the band.",
      why: "The lead gasket seals with a quarter turn past snug. Less weeps; more crushes the gasket into the threads and the next change starts with a damaged valve face.",
      gauge: { label: "TURNS PAST SNUG", speed: 0.75, green: [0.42, 0.58], readout: (t) => `${(t * 0.6).toFixed(2)} turn`, missNote: "Under- or over-tightened — back off and bring it to a quarter turn past snug." },
    },
    {
      id: "leaktest", kind: "hold", target: "ammonia-bottle", seconds: 5,
      title: "Ammonia leak test every joint",
      cue: "Hold the ammonia bottle's vapour under the yoke, the regulator and the valve packing — a white cloud is a leak.",
      why: "Ammonia vapour meets chlorine and makes a visible white ammonium chloride cloud at a few ppm — a leak you can see before you can smell it. Every joint, every change.",
      holdBreakNote: "You lifted the bottle before every joint was covered — start the test again.",
    },
    {
      id: "open", kind: "turn", target: "full-valve",
      title: "Open the valve one turn",
      cue: "Open the new cylinder's valve one full turn — no more — and leave the wrench on the stem.",
      why: "One turn gives full flow; more turns give nothing but a valve that takes longer to close in a leak. The wrench stays on the stem so the first move in an emergency is already in hand.",
      turn: { turns: 1, axis: "y", label: "CYLINDER VALVE" },
    },
    {
      id: "feed", kind: "gauge", target: "feed-rotameter",
      title: "Set the feed rate",
      cue: "Adjust the rotameter to the SOP setpoint and commit inside the band.",
      why: "The setpoint is the residual the plant needs at the tap: too little and the water is not disinfected, too much and the plant gets calls about the taste and the chlorine goes out the vent.",
      gauge: { label: "FEED RATE", speed: 0.7, green: [0.46, 0.6], readout: (t) => `${Math.round(t * 100)} lb/day`, missNote: "Off the setpoint — re-adjust the rotameter to the SOP feed rate." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["wrench-missing"],
      itemNames: { "wrench-missing": "wrench off the stem" },
      itemNotes: { "wrench-missing": "The cylinder wrench is on the bench, not on the in-service valve stem — in a leak, the first thing you need would not be there." },
      title: "Walk the room before leaving",
      cue: "Check the in-service cylinder, the kit and the door, and click what is not as it should be.",
      why: "The room is left the way the next leak needs it: wrench on the stem, kit A sealed and in reach, door closed, monitor live.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CR_ACCENT);
    box(g, 5.4, 0.1, 4.6, 0, 0.05, 0, 0x3d4a4a, { rough: 0.95 });
    // Room shell: back wall with a window, side wall with the door.
    box(g, 5.4, 2.6, 0.12, 0, 1.4, -2.3, 0xbfcfc4, { rough: 0.9 });
    box(g, 1.0, 0.7, 0.14, 1.6, 1.7, -2.3, 0x9fd8ff, { emissive: 0x9fd8ff, ei: 0.3, rough: 0.2, cast: false });
    const door = group(g, 2.7, 0.1, 0.6);
    box(door, 0.12, 2.4, 1.0, 0, 1.2, 0, 0x7b8a86, { rough: 0.8 });
    box(door, 0.14, 0.5, 0.35, 0, 1.6, 0.1, 0x9fd8ff, { emissive: 0x9fd8ff, ei: 0.25, rough: 0.2, cast: false });
    holoTag(door, "CHLORINE — SCBA REQUIRED", 0, 2.6, 0, { css: "#f2c14b", w: 0.5 });
    const noScba = box(door, 0.5, 1.6, 0.9, -0.4, 1.0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(door, "go in now?", -0.4, 2.15, 0, { css: "#d2312b", w: 0.22 });
    reg(hits, noScba, "no-scba-entry");
    // Scale platform with the empty cylinder on it; storage rack with the full one.
    const scale = group(g, -0.6, 0.1, -1.4);
    box(scale, 0.7, 0.08, 0.7, 0, 0.04, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const scaleSocket = box(scale, 0.6, 0.02, 0.6, 0, 0.09, 0, 0xffffff, { rough: 0.5 });
    scaleSocket.visible = false; hits["scale-socket"] = scaleSocket;
    const scaleRead = instrument(scale, 0.55, 0.5, 0, { idle: "22 lb", color: 0x7fd8a8, w: 0.12, d: 0.18, ry: 0 });
    holoTag(scale, "scale", 0.55, 0.72, 0, { css: "#7fd8a8", w: 0.14 });
    const empty = group(scale, 0, 0.08, 0);
    empty.scale.setScalar(1.35);
    cylinderTank(empty, 0, 0, 0xd9dde2);
    holoTag(empty, "EMPTY — 22 lb residual", 0, 1.25, 0, { css: "#f2c14b", w: 0.4 });
    const emptyValve = valveWheel(empty, 0, 1.08, 0.06, { color: 0xb9bec4, body: 0x7b8a86, r: 0.045 });
    reg(hits, emptyValve, "empty-valve");
    const vacReg = box(empty, 0.14, 0.12, 0.1, 0.12, 1.02, 0, 0x3a4a56, { rough: 0.5, metal: 0.5 });
    holoTag(empty, "vacuum regulator", 0.12, 1.2, 0.1, { css: "#7fd8a8", w: 0.3 });
    reg(hits, vacReg, "vac-reg-off");
    const cap = cyl(empty, 0.035, 0.035, 0.05, 0.12, 1.02, 0, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 12 });
    cap.rotation.z = Math.PI / 2; cap.visible = false;
    const hood = cyl(empty, 0.09, 0.1, 0.16, 0, 1.12, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 14 });
    hood.visible = false;
    const capPick = group(g, 0.4, 0.1, -1.9);
    box(capPick, 0.3, 0.4, 0.3, 0, 0.2, 0, 0x2b2f34, { rough: 0.6 });
    const capItem = cyl(capPick, 0.035, 0.035, 0.05, -0.08, 0.43, 0, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 12 });
    holoTag(capPick, "outlet cap", -0.08, 0.6, 0, { css: "#7fd8a8", w: 0.2 });
    reg(hits, capItem, "outlet-cap-on");
    const hoodItem = cyl(capPick, 0.09, 0.1, 0.16, 0.1, 0.48, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 14 });
    holoTag(capPick, "valve hood", 0.1, 0.72, 0, { css: "#7fd8a8", w: 0.2 });
    reg(hits, hoodItem, "hood-on");
    // Full cylinder in the rack, hooded; a second, uncapped one is the roll hazard.
    const rack = group(g, 1.6, 0.1, -1.6);
    box(rack, 1.4, 0.08, 0.7, 0, 0.04, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const full = group(rack, -0.35, 0.08, 0);
    full.scale.setScalar(1.35);
    cylinderTank(full, 0, 0, 0xe4d27a);
    cyl(full, 0.09, 0.1, 0.16, 0, 1.12, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 14 });
    holoTag(full, "FULL — 150 lb, hooded", 0, 1.3, 0, { css: "#7fd8a8", w: 0.4 });
    reg(hits, full, "full-cylinder");
    const fullValve = valveWheel(full, 0, 1.08, 0.06, { color: 0xb9bec4, body: 0x7b8a86, r: 0.045 });
    reg(hits, fullValve, "full-valve");
    const uncapped = group(rack, 0.35, 0.08, 0);
    uncapped.scale.setScalar(1.35);
    cylinderTank(uncapped, 0, 0, 0xe4d27a);
    holoTag(uncapped, "uncapped — roll this one?", 0, 1.3, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, uncapped, "roll-uncapped");
    // Wall bracket, chain, yoke, gasket packs, wrench, ammonia bottle, kit A, hose reel.
    const bracket = box(g, 0.5, 0.08, 0.08, -0.6, 1.25, -2.2, 0x7b8a86, { rough: 0.7, metal: 0.4 });
    const chain = hose(g, [[-0.85, 1.25, -2.18], [-0.75, 1.2, -1.75], [-0.45, 1.2, -1.75], [-0.35, 1.25, -2.18]], 0.012, 0x9aa3ab, { steps: 16, rough: 0.4, metal: 0.8 });
    chain.visible = false;
    const chainPick = box(g, 0.14, 0.08, 0.14, -1.2, 1.2, -2.2, 0x9aa3ab, { rough: 0.4, metal: 0.8 });
    holoTag(g, "restraint chain", -1.2, 1.4, -2.2, { css: "#7fd8a8", w: 0.3 });
    reg(hits, chainPick, "chain-cylinder");
    const bench = group(g, -2.0, 0.1, 0.4, 0.4);
    box(bench, 1.3, 0.85, 0.6, 0, 0.42, 0, 0x4a5561, { rough: 0.7, metal: 0.3 });
    const gasketNew = box(bench, 0.16, 0.03, 0.16, -0.4, 0.87, 0.1, 0xe6ecf1, { rough: 0.6 });
    decal(bench, 0.14, 0.14, -0.4, 0.89, 0.1, signFace("NEW", { bg: "#1b3a2a", accent: "#7fd8a8", scale: 0.6 })).rotation.x = -Math.PI / 2;
    holoTag(bench, "sealed gasket pack", -0.4, 1.05, 0.1, { css: "#7fd8a8", w: 0.32 });
    reg(hits, gasketNew, "gasket-new");
    const gasketOld = cyl(bench, 0.04, 0.04, 0.01, 0.0, 0.86, 0.15, 0x6b6f75, { rough: 0.8, metal: 0.6, seg: 16 });
    holoTag(bench, "old gasket", 0.0, 1.0, 0.15, { css: "#d2312b", w: 0.2 });
    reg(hits, gasketOld, "reused-gasket");
    const wrenchBench = box(bench, 0.22, 0.02, 0.04, 0.4, 0.86, 0.05, 0xb9bec4, { rough: 0.4, metal: 0.8 });
    wrenchBench.visible = false;
    const wrenchHint = box(bench, 0.24, 0.05, 0.08, 0.4, 0.87, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, wrenchHint, "wrench-missing");
    const yokeWrench = instrument(bench, 0.35, 0.87, -0.15, { idle: "-- turn", color: 0x7fd8a8, w: 0.13, d: 0.2 });
    holoTag(bench, "yoke wrench", 0.35, 1.08, -0.15, { css: "#7fd8a8", w: 0.24 });
    reg(hits, yokeWrench, "yoke-wrench");
    const ammonia = cyl(bench, 0.03, 0.03, 0.12, -0.05, 0.92, -0.15, 0xf2f6fa, { rough: 0.6, seg: 12 });
    holoTag(bench, "ammonia bottle", -0.05, 1.1, -0.15, { css: "#7fd8a8", w: 0.28 });
    reg(hits, ammonia, "ammonia-bottle");
    const cloud = particles(g, 50, 0xf2f6fa, { size: 0.03, life: 0.9, additive: false, opacity: 0.5 });
    const kitA = group(g, 1.2, 0.1, 1.6, -0.5);
    box(kitA, 0.7, 0.4, 0.45, 0, 0.2, 0, 0xf2c14b, { rough: 0.6 });
    decal(kitA, 0.5, 0.18, 0, 0.25, 0.226, signFace("EMERGENCY KIT A", { bg: "#1b1608", accent: "#f2c14b", scale: 0.5 }));
    holoTag(kitA, "kit A — sealed", 0, 0.6, 0, { css: "#7fd8a8", w: 0.28 });
    const reel = group(g, -2.3, 0.1, -1.8);
    cyl(reel, 0.22, 0.22, 0.14, 0, 0.9, 0, 0xd2312b, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    holoTag(reel, "water on the leak?", 0, 1.3, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, reel, "water-on-leak");
    // Feed line, rotameter, room monitor, SOP board, SCBA, outside operator.
    hose(g, [[-0.48, 1.45, -1.4], [-0.2, 1.7, -1.9], [0.6, 1.8, -2.15]], 0.02, 0x8a939b, { steps: 18, rough: 0.4, metal: 0.6 });
    const rotameter = instrument(g, 0.6, 1.5, -2.15, { idle: "0 lb/day", color: 0x7fd8a8, w: 0.13, d: 0.2, ry: 0 });
    rotameter.rotation.x = Math.PI / 2;
    holoTag(g, "feed rotameter", 0.6, 1.9, -2.1, { css: "#7fd8a8", w: 0.3 });
    reg(hits, rotameter, "feed-rotameter");
    const monitor = instrument(g, -1.6, 1.6, -2.15, { idle: "-.- ppm", color: 0x7fd8a8, w: 0.14, d: 0.22, ry: 0 });
    monitor.rotation.x = Math.PI / 2;
    holoTag(g, "room Cl₂ monitor", -1.6, 2.0, -2.1, { css: "#7fd8a8", w: 0.3 });
    reg(hits, monitor, "room-monitor");
    const board = group(g, 0.0, 0, 2.0, 0);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0d1a14"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#7fd8a8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d6f5e4"; ctx.fillText("SOP 7.3 — CYLINDER CHANGE", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eefaf3";
      ["Two operators: one in, one outside on radio", "Monitor < 1 ppm before entry; SCBA at door", "Empty at 20 lb residual — never to zero", "New lead gasket every connection", "Yoke: hand snug + 1/4 turn; ammonia test", "Valve: open ONE turn; wrench stays on stem", "Feed setpoint today: 55 lb/day"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: CR_ACCENT });
    reg(hits, board, "sop-board");
    const scba = group(g, 2.2, 0.1, 1.5);
    cyl(scba, 0.09, 0.09, 0.5, 0, 0.75, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 14 });
    box(scba, 0.3, 0.9, 0.18, 0, 0.5, -0.12, 0x2b2f34, { rough: 0.7 });
    holoTag(scba, "SCBA — checked", 0, 1.25, 0, { css: "#f2c14b", w: 0.28 });
    reg(hits, scba, "scba-stage");
    const outside = standingFigure(g, 2.9, -0.4, { ry: -1.6, cloth: 0x37505f });
    holoTag(outside, "outside operator — radio", 0, 1.9, 0, { css: "#7fd8a8", w: 0.42 });
    reg(hits, outside, "outside-operator");
    const wrenchStem = box(full, 0.16, 0.014, 0.03, 0.08, 1.1, 0.04, 0xb9bec4, { rough: 0.4, metal: 0.8 });
    wrenchStem.visible = false;

    let swapped = false, gasketOn = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "close") emptyValve.rotation.y = 0;
        if (step.id === "capoff") { vacReg.visible = false; cap.visible = true; hood.visible = true; capItem.visible = false; hoodItem.visible = false; }
        if (step.id === "swap") {
          swapped = true;
          empty.parent.remove(empty); rack.add(empty); empty.position.set(-0.35, 0.08, 0); empty.rotation.set(0, 0, 0);
          full.parent.remove(full); scale.add(full); full.position.set(0, 0.08, 0); full.rotation.set(0, 0, 0);
          repaint(scaleRead.userData.screen, signFace("151 lb", { bg: "#0d1c14", accent: "#7fd8a8", fg: "#e9ffe9", scale: 0.62 }));
        }
        if (step.id === "secure") { chain.visible = true; chainPick.visible = false; gasketOn = true; gasketNew.visible = false; }
        if (step.id === "open") wrenchStem.visible = true;
        if (step.id === "walk") { wrenchHint.visible = false; wrenchBench.visible = false; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "secure" && session.sequence.includes("chain-cylinder")) { chain.visible = true; chainPick.visible = false; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "monitor") repaint(monitor.userData.screen, signFace(`${(gg.t * 5).toFixed(1)} ppm`, { bg: "#0d1c14", accent: gg.t >= 0.05 && gg.t <= 0.22 ? "#59c97b" : "#f2ae14", fg: "#e9ffe9", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "yoke") repaint(yokeWrench.userData.screen, signFace(`${(gg.t * 0.6).toFixed(2)} turn`, { bg: "#0d1c14", accent: gg.t >= 0.42 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#e9ffe9", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "feed") repaint(rotameter.userData.screen, signFace(`${Math.round(gg.t * 100)} lb/day`, { bg: "#0d1c14", accent: gg.t >= 0.46 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#e9ffe9", scale: 0.62 }));
        if (session?.turn && step?.id === "close") emptyValve.rotation.y = -session.turn.amount * Math.PI * 2;
        if (session?.turn && step?.id === "open") { fullValve.rotation.y = session.turn.amount * Math.PI * 2; wrenchStem.rotation.y = fullValve.rotation.y; }
        if (step?.id === "leaktest" && session.holding) { cloud.visible = true; cloud.userData.step(dt, new THREE.Vector3(-0.5, 1.5, -1.3), 0.08, 0.15, 0.05); }
        else if (cloud.visible) cloud.visible = false;
        if (step?.id === "walk") wrenchBench.visible = true;
        void swapped; void gasketOn;
      },
    };
  },
};
