import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hot Tap VR — Water & Environmental, station seven.
// Tapping a live water main under pressure and setting a line stop, so a
// section can be taken out of service without shutting the street down.
//
// The whole job is a sequence of one-way doors. The sleeve is bolted round a
// pipe that is still full and still at pressure, and the only thing that will
// ever let you undo the hole you are about to cut is the tapping valve bolted
// on top of it. So the valve is proven before the cutter turns, the cutter is
// proven clear of the gate before the valve closes, and the coupon — the disc
// of pipe wall cut out of the main — is accounted for on the cutter before
// anybody calls the tap finished. A coupon that is not on the cutter is in
// the main, travelling, and it will stop somewhere that matters.
//
// The last step is the one people skip because the water is already back on:
// anything that opens a potable main is disinfected, flushed and sampled
// before it serves anybody. AWWA C651 is what that is written in.

const HT_ACCENT = 0x38a3d1;

export const SIM_HOT_TAP = {
  id: "hot-tap",
  index: "66",
  domain: "Water",
  trade: "Pipefitter / water distribution tapping crew",
  category: "Water & Environmental",
  weather: "rain",
  certification: "UA pipefitters and plumbers with LIUNA on the excavation; AWWA C651 disinfecting water mains and the utility's own tapping specification; state water distribution operator certification for the return to service; OSHA 29 CFR 1926 Subpart P excavations for the bell hole; 1926 Subpart O for the equipment working over it",
  name: "Hot Tap",
  title: simTitle("Hot Tap"),
  tagline: "Cutting into a live main: sleeve proven before the valve opens, cutter proven clear before the valve closes, coupon accounted for, and the main disinfected before it serves anybody",
  accent: HT_ACCENT,
  accentCss: "#38a3d1",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "tap-held", name: "Tap Held", note: "A live main tapped and stopped with the pressure test done first, the coupon on the cutter and the section disinfected before it went back" },

  game: system({
    name: "Tapping Authority",
    currency: "PSI",
    ranks: ["Labourer", "Tapping Crew", "Lead Fitter", "Distribution Foreman", "Tapping Authority Certified"],
    badges: [
      { id: "proven-first", name: "Proven First", note: "The sleeve and valve were pressure-tested before the cutter ever turned", test: AWARD.stepClean("test") },
      { id: "coupon-home", name: "Coupon Home", note: "The coupon came back on the cutter and was accounted for", test: AWARD.safe },
      { id: "read-the-travel", name: "Read The Travel", note: "The cutter was proven clear of the gate on the indicator, not by feel", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-tap", name: "Clean Tap", note: "No corrections from the locate to the sample", test: AWARD.clean },
      { id: "steady-feed", name: "Steady Feed", note: "Held the feed rate through the whole cut", test: AWARD.unbroken },
      { id: "street-back", name: "Street Back", note: "Section stopped and the hole handed over inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-early": "You opened the tapping valve before the sleeve had been pressure-tested. The test is the only moment in this job where finding out the gasket has not seated costs you nothing: before the valve opens, the sleeve is a clamp on a pipe, and after it opens, it is the only thing between the main and the hole you are standing in. A sleeve that fails after the cutter is in has no way back.",
    "close-on-cutter": "You closed the tapping valve with the cutter still in the bore. The gate closes onto the boring bar, which wrecks the seat and jams the gate part open — and a tapping valve that will not close is a live main with a hole in it and a machine bolted over the hole, which has to come off some time.",
    "lost-coupon": "You called the tap finished without the coupon. That disc of pipe wall is somewhere: on the cutter, where it belongs and where the retaining wire is meant to hold it, or in the main, travelling downstream until it lodges in a valve seat or a meter or somebody's service. A coupon found later is found by the customer whose water stopped.",
    "skip-disinfect": "You put the section back into service without disinfecting it. Everything that went into that main — the sleeve, the cutter, the trench water on the fitter's gloves — is now in the water somebody is going to drink. AWWA C651 is what disinfection, flushing and a sample before return to service are written in, and the sample is the part that proves it rather than assuming it.",
  },

  lateNotes: {
    "tapping-valve": "The valve opens after the sleeve has been pressure-tested and the machine is bolted on, not before.",
    "feed-handle": "The cutter feeds after the valve is proven open — there is nowhere for it to go until then.",
    "linestop-head": "The line stop goes in through the same fitting, after the tap is cut and the coupon is accounted for.",
  },

  // Interruptions: see shared/game.js. Both happen down the hole, behind a
  // fitter whose eyes are on a feed handle.
  interrupts: [
    {
      id: "sleeve-weep",
      kind: "Sleeve weeping",
      after: "cut", delay: 4, seconds: 13,
      alert: "There is water running down the side of the sleeve from the bolt line on the far side, and it is getting faster.",
      cue: "The thing holding the main shut around your cut is letting go.",
      target: "sleeve-bolts",
      why: "A sleeve that weeps under load has a gasket lifting off the barrel, and the cut you are in the middle of is what put the load on it. It is taken up on the bolts, across the joint, while it is still a weep — because the next state after a weep is the gasket rolling out, and that happens with a hole already in the pipe.",
      missNote: "The weep became a jet and the bell hole filled with the main's own water while the cutter was still in the bore. Everything after that happened in a flooded hole nobody could see the bottom of.",
      wrongNote: "That is not it. It is the sleeve bolts, and the time to take them up is while it is still a weep.",
    },
    {
      id: "hole-filling",
      kind: "Hole filling",
      after: "retract", delay: 4, seconds: 12,
      alert: "The trash pump has stopped and the bell hole is filling around the fitting.",
      cue: "You are about to be working blind and standing in it.",
      target: "trash-pump",
      why: "A flooded bell hole hides the shoring, hides the fitting and hides the coupon if it drops. It also puts a crew in water in an excavation, which is a different job from the one anybody signed onto this morning. The pump comes back on before the next thing is touched.",
      missNote: "The hole filled while the work carried on above it. Nobody could see the invert, the bolts or the floor of the excavation for the rest of the job.",
      wrongNote: "Not that. The pump is what keeps this hole a workplace.",
    },
  ],

  steps: [
    {
      id: "locate", kind: "select", target: "locate-marks",
      title: "Confirm the locate and the valve records",
      cue: "Check the marks on the road against the records: what this main is, what else is in the trench, and which valves make the section.",
      why: "The tap is designed around a pipe of a stated material and diameter, and the section it creates is defined by valves somebody else operated last. A main that turns out to be cast iron where the record says ductile is a different sleeve, a different cutter and a different day.",
    },
    {
      id: "shore", kind: "select", target: "trench-shield",
      title: "Shore the bell hole",
      cue: "Confirm the shield is set and the hole is big enough to swing the machine in.",
      why: "A tapping machine is long and it is swung into place over an open excavation. The hole is sized for the machine before anybody is in it, because widening a bell hole with a fitter standing in it is how the wall comes in on them.",
    },
    {
      id: "expose", kind: "find", noHint: true,
      targets: ["main-barrel", "bell-joint", "service-tap"],
      itemNames: { "main-barrel": "the barrel where the sleeve seats", "bell-joint": "the bell joint", "service-tap": "an existing service tap" },
      itemNotes: {
        "main-barrel": "Clean, straight barrel with no pitting. That is where the sleeve seats and it is the only part of this pipe the gasket can seal on.",
        "bell-joint": "There is a bell joint a short way along. You cannot tap over a joint — the sleeve needs full round barrel under both halves of the gasket.",
        "service-tap": "There is an existing service tap on the springline. Tapping close to one weakens what is left of the wall between them, and the service is somebody's house.",
      },
      title: "Expose the main and find what you actually have",
      cue: "Click the three things on this pipe that decide where the sleeve can go.",
      why: "A tap location is chosen on the pipe in front of you, not on the drawing. The barrel, the joint and any existing tap are the three things that move it, and all three are invisible until the main is dug clear all the way round.",
    },
    {
      id: "sleeve", kind: "drag", target: "tapping-sleeve",
      title: "Fit the tapping sleeve",
      cue: "Bring the sleeve down and close it round the cleaned barrel.",
      why: "The barrel is wire-brushed clean where the gasket lands, because a gasket seats on pipe and not on tuberculation. Both halves go round the main square, with the outlet where the machine can be swung onto it.",
      drag: { to: "main-socket", radius: 0.45, missNote: "Not on the barrel — a sleeve over a joint or over the existing tap has nothing to seal against." },
    },
    {
      id: "bolt", kind: "sequence",
      targets: ["bolts-a", "bolts-b", "bolts-c"],
      itemNames: { "bolts-a": "snug all round", "bolts-b": "cross-pattern to half torque", "bolts-c": "cross-pattern to full torque" },
      title: "Torque the sleeve in pattern",
      cue: "Snug all round, then cross-pattern to half, then cross-pattern to full.",
      why: "A gasket pulled down on one side first rolls out of the groove on the other. Snug, half, full, across the joint every time — the pattern is what makes the seal even, and an even seal is the only kind that holds pressure.",
      outOfOrderNote: "Snug all round first, then half torque across the pattern, then full. Pulling one side home first is how a gasket rolls.",
    },
    {
      id: "test", kind: "gauge", target: "test-pump",
      title: "Pressure-test the sleeve and valve",
      cue: "Bring the test pump up and commit on the pressure the fitting holds.",
      why: "This is the one moment where a bad gasket costs nothing. The sleeve and the valve are tested as an assembly, before there is a hole in the main, because afterwards the only way to take the sleeve off is to shut the street down — which is the thing this whole job exists to avoid.",
      gauge: {
        label: "TEST", speed: 0.68, green: [0.55, 0.78],
        readout: (t) => `${Math.round(t * 260)} psi`,
        missNote: "The fitting did not hold the test. Back it off, find the gasket, and do not put a cutter anywhere near this main until it does.",
      },
    },
    {
      id: "mount", kind: "drag", target: "tapping-machine",
      title: "Mount the machine on the valve",
      cue: "Swing the tapping machine onto the valve flange and bolt it down.",
      why: "The machine bolts to the valve, not to the sleeve, so that the valve is between the cutter and the main at every moment. That is the arrangement that makes the whole thing reversible.",
      drag: { to: "valve-flange", radius: 0.42, missNote: "Not seated on the flange — a machine that is not bolted square will not hold pressure and will not run true." },
    },
    {
      id: "open-valve", kind: "turn", target: "tapping-valve",
      title: "Open the tapping valve",
      cue: "Wind the tapping valve fully open and confirm it on the indicator.",
      why: "Fully open, and known to be fully open. A gate that is part way across is a gate the cutter will find on the way past, and the indicator is how you know rather than how it felt on the wrench.",
      turn: { turns: 0.75, axis: "y", label: "TAPPING VALVE" },
    },
    {
      id: "cut", kind: "track", target: "feed-handle", seconds: 7,
      title: "Feed the cutter through the wall",
      cue: "Hold the feed rate steady in the band while the shell cutter goes through.",
      why: "Steady feed is what keeps the coupon on the pilot and the cutter in one piece. Too fast and the cutter loads up and can break through and drop the coupon; too slow and it burnishes the wall instead of cutting it, and a work-hardened ring is harder to get through than the pipe was.",
      track: {
        start: 0.1, green: [0.36, 0.56], rise: 0.5, fall: 0.45, drift: 0.12, label: "FEED RATE",
        readout: (v) => (v < 0.36 ? "burnishing, not cutting" : v > 0.56 ? "loading the cutter" : "cutting steadily"),
      },
      holdBreakNote: "Feed rate out of band — a loaded cutter breaks through and drops the coupon, and a slow one polishes the wall instead of cutting it. Bring it back and hold.",
    },
    {
      id: "retract", kind: "gauge", target: "travel-indicator",
      title: "Prove the cutter is clear of the gate",
      cue: "Wind the boring bar back and commit on the travel the indicator shows.",
      why: "Read, not felt. The indicator is what says the cutter is behind the gate; the wrench only says it stopped turning, and it stops turning against the machine's own stop as readily as against the top of its travel.",
      gauge: {
        label: "BAR TRAVEL", speed: 0.7, green: [0.72, 0.95],
        readout: (t) => `${(t * 24).toFixed(1)} in retracted`,
        missNote: "Not far enough back. The cutter is still in the bore, and the gate closes into it rather than across it.",
      },
    },
    {
      id: "close-valve", kind: "turn", target: "tapping-valve",
      title: "Close the tapping valve",
      cue: "Wind the valve shut now the bar is proven clear.",
      why: "This is the moment the hole becomes reversible. With the valve shut, the machine can come off a live main and everything above the gate is at atmosphere — which is the only reason it was ever safe to cut the hole at all.",
      turn: { turns: 0.75, axis: "y", reverse: true, label: "TAPPING VALVE" },
    },
    {
      id: "coupon", kind: "select", target: "coupon-tray",
      title: "Account for the coupon",
      cue: "Take the coupon off the cutter and put it in the tray where the crew can see it.",
      why: "There are two places that disc can be and only one of them is acceptable. Off the cutter and in the tray, the tap is finished; not on the cutter, and there is a piece of pipe wall moving down a live main toward a valve seat, and that is a call that gets made now rather than discovered next week.",
    },
    {
      id: "linestop", kind: "drag", target: "linestop-head",
      title: "Set the line stop",
      cue: "Swap the machine for the line stop head and set it through the same fitting.",
      why: "The stop goes in through the hole the tap made, which is why the fitting was specified for both. It is restrained, because a plugged main pushes the fitting sideways with the full pressure of the section behind it.",
      drag: { to: "valve-flange", radius: 0.42, missNote: "Not seated on the fitting — a line stop that is not square does not seal, and an unrestrained one moves." },
    },
    {
      id: "disinfect", kind: "hold", target: "chlorine-pump", seconds: 5,
      title: "Disinfect the section",
      cue: "Hold the chlorine feed for the full dose before anything is flushed.",
      why: "Everything that touched the inside of that main is in the water now — the cutter, the sleeve, whatever was on the fitter's gloves. AWWA C651 is where disinfection, flushing and a bacteriological sample before return to service are written down, and the sample is what turns 'we disinfected it' into evidence.",
      holdBreakNote: "The dose was cut short. A partial disinfection is not a shorter version of the same thing — it is a main going back into service unproven.",
    },
    {
      id: "walk", kind: "find",
      targets: ["restraint-rods", "bypass-line", "flush-point"],
      itemNames: { "restraint-rods": "restraint on the fitting", "bypass-line": "the bypass", "flush-point": "the flush point and sample tap" },
      itemNotes: {
        "restraint-rods": "The restraint rods are on and tight. A line stop is an unbalanced load on the main and the fitting is the thing holding against it.",
        "bypass-line": "The bypass is carrying the customers past the stopped section. It is the reason the street still has water and the reason this job was a hot tap rather than a shutdown.",
        "flush-point": "The flush point and the sample tap are the last two things anybody uses here. Flushed to waste, sampled, and the section stays out of service until the sample comes back.",
      },
      title: "Walk the fitting before you leave it",
      cue: "Click the three things that decide whether this section goes back safely.",
      why: "The tap is the interesting part and these three are the part that fails later: the restraint that holds the fitting, the bypass that is keeping the street in water, and the sample that says the main is fit to drink from.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, HT_ACCENT);

    // -------------------------------------------------------------- the street
    const road = box(g, 6.0, 0.06, 3.0, 0, 0.03, 1.4, 0x33383d,
      { rough: 0.96, finish: "asphalt", tile: [6, 3] });
    void road;
    for (let i = -2; i <= 2; i++) {
      box(g, 0.5, 0.008, 0.1, i * 1.2, 0.065, 2.5, 0xdcc84a, { rough: 0.85, cast: false });
    }
    const marks = group(g, -1.55, 0.07, 0.95);
    for (let i = 0; i < 5; i++) {
      box(marks, 0.16, 0.006, 0.07, -0.32 + i * 0.16, 0, 0, 0x3fa2e0, { rough: 0.8, cast: false });
    }
    decal(marks, 0.42, 0.14, 0, 0.004, 0.22, signFace("W 12\" DI", { bg: "#0d2430", accent: "#4fd1ff", scale: 0.5 }));
    holoTag(g, "Locate marks and valve records", -1.55, 0.6, 0.95, { css: "#4fd1ff", w: 0.66 });
    reg(hits, marks, "locate-marks");

    // ---------------------------------------------------------- the bell hole
    // The excavation is cut into a raised apron of spoil and road plate rather
    // than straight into the ground plane. A hole in a flat deck reads as a
    // dark smudge from the gate; cut into something, it reads as a hole. The
    // same trick trench-box uses, and it is what a tapping crew's street
    // actually looks like.
    const APRON = 0.34;
    const apron = group(g, 0.1, 0, -0.75);
    for (const sz of [-1, 1]) {
      box(apron, 3.3, APRON, 0.5, 0, APRON / 2, sz * 1.1, 0x54493a,
        { rough: 0.98, finish: "concrete", tile: [3, 1] });
    }
    for (const sx of [-1, 1]) {
      box(apron, 0.5, APRON, 1.72, sx * 1.4, APRON / 2, 0, 0x54493a,
        { rough: 0.98, finish: "concrete", tile: [1, 2] });
    }
    // Spoil heaped on the kerb side and a road plate leaning on the other.
    for (let i = 0; i < 4; i++) {
      ball(apron, 0.3 + (i % 2) * 0.08, -1.15 + i * 0.72, APRON + 0.16, -1.34, 0x4a3a24, { rough: 1.0, seg: 12 });
    }
    box(apron, 1.4, 0.05, 0.9, 1.15, APRON + 0.3, 1.25, 0x5a636b,
      { rough: 0.7, metal: 0.45 }).rotation.x = -0.25;

    const holeD = 1.0;
    const hole = group(g, 0.1, APRON, -0.75);
    box(hole, 2.3, 0.02, 1.7, 0, -holeD, 0, 0x33291b, { rough: 0.98, cast: false });
    for (const sx of [-1, 1]) box(hole, 0.06, holeD, 1.7, sx * 1.15, -holeD / 2, 0, 0x4a3a24, { rough: 0.96, cast: false });
    for (const sz of [-1, 1]) box(hole, 2.3, holeD, 0.06, 0, -holeD / 2, sz * 0.85, 0x4a3a24, { rough: 0.96, cast: false });
    // Shield panels standing in the hole.
    const shield = group(hole, 0, 0, 0);
    for (const sx of [-1, 1]) {
      box(shield, 0.05, holeD - 0.1, 1.5, sx * 1.05, -holeD / 2, 0, 0xd8b23a, { rough: 0.55, metal: 0.5 });
    }
    for (let i = 0; i < 2; i++) {
      cyl(shield, 0.035, 0.035, 2.05, 0, -0.35 - i * 0.5, 0.5 - i * 1.0, 0xd8b23a, { rough: 0.55, metal: 0.5, seg: 12 })
        .rotation.z = Math.PI / 2;
    }
    holoTag(hole, "Shielded bell hole", 0, 0.45, 0.9, { css: "#f2c14b", w: 0.4 });
    reg(hits, shield, "trench-shield");

    // The main running across the bottom of the hole.
    const main = group(hole, 0, -holeD + 0.32, 0);
    const barrel = cyl(main, 0.17, 0.17, 2.2, 0, 0, 0, 0x4c5a62, { rough: 0.75, metal: 0.35, seg: 20 });
    barrel.rotation.z = Math.PI / 2;
    holoTag(main, "clean barrel", -0.2, 0.34, 0.2, { css: "#8fa9c4", w: 0.26 });
    reg(hits, barrel, "main-barrel");
    const bell = cyl(main, 0.21, 0.21, 0.24, 0.85, 0, 0, 0x3f4c54, { rough: 0.8, metal: 0.35, seg: 20 });
    bell.rotation.z = Math.PI / 2;
    holoTag(main, "bell joint", 0.85, 0.36, 0, { css: "#8fa9c4", w: 0.26 });
    reg(hits, bell, "bell-joint");
    const svc = cyl(main, 0.035, 0.035, 0.22, -0.7, 0.12, 0.1, 0xb87333, { rough: 0.45, metal: 0.7, seg: 12 });
    svc.rotation.x = -0.6;
    holoTag(main, "existing service", -0.7, 0.4, 0.2, { css: "#f2894b", w: 0.3 });
    reg(hits, svc, "service-tap");
    const mainSocket = group(main, -0.1, 0.18, 0);
    hits["main-socket"] = mainSocket;

    // The sleeve, staged on the verge until it is carried in.
    const sleeve = group(g, -2.35, 0, -0.35, 0.4);
    cyl(sleeve, 0.24, 0.24, 0.42, 0, 0.3, 0, 0x2f6f4a, { rough: 0.55, metal: 0.45, seg: 20 })
      .rotation.z = Math.PI / 2;
    cyl(sleeve, 0.12, 0.12, 0.2, 0, 0.5, 0, 0x2f6f4a, { rough: 0.55, metal: 0.45, seg: 16 });
    for (const sz of [-1, 1]) for (let i = 0; i < 3; i++) {
      cyl(sleeve, 0.016, 0.016, 0.1, -0.16 + i * 0.16, 0.3, sz * 0.25, CITY.steel, { rough: 0.35, metal: 0.9, seg: 8 })
        .rotation.x = Math.PI / 2;
    }
    holoTag(sleeve, "Tapping sleeve", 0, 0.78, 0, { css: "#59c97b", w: 0.36 });
    reg(hits, sleeve, "tapping-sleeve");

    // Bolt stations round the sleeve, worked in pattern.
    const boltRig = group(hole, -0.1, -holeD + 0.5, 0);
    const boltGroups = [];
    for (let i = 0; i < 3; i++) {
      const b = group(boltRig, -0.24 + i * 0.24, 0, 0.28);
      torus(b, 0.035, 0.012, 0, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
      boltGroups.push(b);
      reg(hits, b, `bolts-${"abc"[i]}`);
    }
    holoTag(boltRig, "snug, half, full", 0, 0.3, 0.3, { css: "#8fa9c4", w: 0.36 });
    // The wrench that stays on the joint. Taking the bolts up across the
    // pattern is a different act from working the three stations in order,
    // so it is its own control — it is what answers a weep mid-cut.
    const torqueWrench = group(boltRig, 0.34, 0.02, 0.3, 0.4);
    cyl(torqueWrench, 0.016, 0.016, 0.44, 0, 0, 0, 0x9aa4ad, { rough: 0.4, metal: 0.8, seg: 10 })
      .rotation.z = Math.PI / 2;
    box(torqueWrench, 0.06, 0.05, 0.05, -0.24, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(torqueWrench, 0.16, 0.035, 0.035, 0.18, 0, 0, 0xd8232a, { rough: 0.6 });
    holoTag(boltRig, "Torque wrench on the joint", 0.34, 0.24, 0.3, { css: "#f0645b", w: 0.56 });
    reg(hits, torqueWrench, "sleeve-bolts");

    // The tapping valve and its flange, on top of the sleeve outlet.
    const valveStack = group(hole, -0.1, -holeD + 0.66, 0);
    box(valveStack, 0.3, 0.34, 0.3, 0, 0.17, 0, 0x3f4c54, { rough: 0.55, metal: 0.45 });
    const tapValve = valveWheel(valveStack, 0.26, 0.2, 0, { color: 0xd8232a, body: 0x2f3740, r: 0.11 });
    holoTag(valveStack, "Tapping valve", 0.26, 0.5, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, tapValve.userData.wheel, "tapping-valve");
    const flange = cyl(valveStack, 0.16, 0.16, 0.05, 0, 0.37, 0, 0x8a939b, { rough: 0.45, metal: 0.7, seg: 18 });
    holoTag(valveStack, "Valve flange", 0, 0.52, 0.2, { css: "#8fa9c4", w: 0.3 });
    hits["valve-flange"] = flange;
    const valveInd = instrument(valveStack, -0.24, 0.3, 0.02, { idle: "-- turns", color: 0x2b3138, w: 0.14, d: 0.12 });
    holoTag(valveStack, "gate position", -0.24, 0.48, 0.02, { css: "#8fa9c4", w: 0.3 });
    void valveInd;

    // Machine and line stop head, staged on the verge.
    const machine = group(g, 2.25, 0, -0.5, -0.4);
    cyl(machine, 0.1, 0.1, 1.1, 0, 0.7, 0, 0x4a5560, { rough: 0.5, metal: 0.55, seg: 18 });
    box(machine, 0.3, 0.26, 0.3, 0, 1.32, 0, 0x3c454e, { rough: 0.5, metal: 0.5 });
    const feedHandle = group(machine, 0.2, 1.32, 0);
    box(feedHandle, 0.05, 0.05, 0.3, 0, 0, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(machine, "Feed handle", 0.32, 1.52, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, feedHandle, "feed-handle");
    const travelInd = instrument(machine, -0.2, 1.26, 0.04, { idle: "-- in", color: 0x2b3138, w: 0.16, d: 0.14 });
    holoTag(machine, "Bar travel indicator", -0.2, 1.48, 0.04, { css: "#4fd1ff", w: 0.44 });
    reg(hits, travelInd, "travel-indicator");
    holoTag(machine, "Tapping machine", 0, 1.72, 0, { css: "#38a3d1", w: 0.4 });
    reg(hits, machine, "tapping-machine");

    const stopHead = group(g, 2.3, 0, 0.6, 0.3);
    cyl(stopHead, 0.13, 0.13, 0.5, 0, 0.3, 0, 0x2f6f4a, { rough: 0.5, metal: 0.45, seg: 18 });
    box(stopHead, 0.22, 0.08, 0.22, 0, 0.58, 0, 0x8a939b, { rough: 0.45, metal: 0.7 });
    holoTag(stopHead, "Line stop head", 0, 0.78, 0, { css: "#59c97b", w: 0.36 });
    reg(hits, stopHead, "linestop-head");

    // Test pump, chlorine feed, coupon tray, trash pump.
    const testPump = group(g, -2.3, 0, 0.75, 0.9);
    box(testPump, 0.4, 0.3, 0.3, 0, 0.35, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    cyl(testPump, 0.04, 0.04, 0.4, 0, 0.7, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const testGauge = instrument(testPump, 0, 0.94, 0, { idle: "-- psi", color: 0x2b3138, w: 0.16, d: 0.14 });
    holoTag(testPump, "Test pump", 0, 1.12, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, testPump, "test-pump");

    const chlor = group(g, -1.15, 0, 1.75, 1.3);
    cyl(chlor, 0.13, 0.13, 0.6, 0, 0.3, 0, 0xf2c14b, { rough: 0.55, seg: 16 });
    box(chlor, 0.2, 0.18, 0.18, 0.2, 0.5, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    decal(chlor, 0.14, 0.06, 0, 0.42, 0.131, signFace("NaOCl", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.55 }));
    holoTag(chlor, "Chlorine feed", 0, 0.78, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, chlor, "chlorine-pump");
    const skipDis = box(g, 0.24, 0.24, 0.24, -0.72, 0.4, 1.9, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "water is back on, call it done?", -0.72, 0.72, 1.9, { css: "#d2312b", w: 0.6 });
    reg(hits, skipDis, "skip-disinfect");

    const tray = slab(g, 0.3, 0.05, 0.24, 1.35, 0.32, 0.95, 0x8a939b, { radius: 0.01, rough: 0.5, metal: 0.6 });
    const coupon = cyl(g, 0.075, 0.075, 0.03, 1.35, 0.36, 0.95, 0x4c5a62, { rough: 0.7, metal: 0.35, seg: 18 });
    coupon.visible = false;
    holoTag(g, "Coupon tray", 1.35, 0.56, 0.95, { css: "#8fa9c4", w: 0.28 });
    reg(hits, tray, "coupon-tray");
    const lostCoupon = box(g, 0.22, 0.22, 0.22, 1.75, 0.35, 1.2, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "it will have washed through?", 1.8, 0.66, 1.2, { css: "#d2312b", w: 0.56 });
    reg(hits, lostCoupon, "lost-coupon");

    const pump = group(g, 1.55, 0, -1.75, -0.8);
    box(pump, 0.42, 0.34, 0.36, 0, 0.2, 0, 0xe4622a, { rough: 0.6, metal: 0.35 });
    cyl(pump, 0.06, 0.06, 1.5, -0.1, 0.12, 0.45, 0x2b2f34, { rough: 0.85, seg: 12 }).rotation.x = 0.9;
    const pumpLamp = ball(pump, 0.024, 0.14, 0.4, 0.14, 0x59c97b, { emissive: 0x59c97b, ei: 2.0 });
    holoTag(pump, "Trash pump", 0, 0.58, 0, { css: "#f2894b", w: 0.3 });
    reg(hits, pump, "trash-pump");

    // The two hazards that live on the fitting itself.
    const earlyOpen = box(hole, 0.24, 0.24, 0.24, 0.42, -holeD + 0.7, 0.35, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(hole, "crack the valve and have a look?", 0.52, -holeD + 1.0, 0.35, { css: "#d2312b", w: 0.64 });
    reg(hits, earlyOpen, "open-early");
    const closeEarly = box(g, 0.24, 0.24, 0.24, 2.6, 1.2, -0.2, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "shut the valve, it feels back?", 2.65, 1.5, -0.2, { css: "#d2312b", w: 0.6 });
    reg(hits, closeEarly, "close-on-cutter");

    // Walk-round items.
    const rods = group(hole, -0.1, -holeD + 0.45, -0.3);
    for (const sx of [-1, 1]) cyl(rods, 0.014, 0.014, 0.5, sx * 0.18, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8 });
    holoTag(rods, "restraint rods", 0, 0.3, 0, { css: "#8fa9c4", w: 0.32 });
    reg(hits, rods, "restraint-rods");
    const bypass = cyl(g, 0.06, 0.06, 2.6, -0.4, 0.14, 1.95, 0x2f6f4a, { rough: 0.6, seg: 14 });
    bypass.rotation.z = Math.PI / 2;
    holoTag(g, "Bypass — the street still has water", -0.4, 0.42, 1.95, { css: "#59c97b", w: 0.64 });
    reg(hits, bypass, "bypass-line");
    const flushPt = group(g, 2.15, 0, 1.6, -1.1);
    cyl(flushPt, 0.05, 0.06, 0.7, 0, 0.35, 0, 0xd8232a, { rough: 0.6, metal: 0.4, seg: 14 });
    box(flushPt, 0.14, 0.1, 0.1, 0.1, 0.6, 0, 0xd8232a, { rough: 0.6 });
    holoTag(flushPt, "Flush point and sample tap", 0, 0.88, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, flushPt, "flush-point");

    barrierPanel(g, -1.9, 2.1, { color: 0xe4622a });
    cone(g, 1.05, 2.25, { color: 0xe4622a });
    cone(g, -0.35, 2.4, { color: 0xe4622a });
    toolChest(g, 2.55, 0.9);
    standingFigure(g, -2.0, 1.55, { ry: -1.0, cloth: 0x2b6f8f, helmet: 0xf2c14b, vest: 0xe4dc3a });

    // -------------------------------------------------------------- live state
    let pumping = true, weeping = false, valveOpen = false, cutDone = false;
    const weep = particles(g, 20, 0xbfe6f5, { size: 0.03, life: 0.7, additive: false, opacity: 0.55 });
    weep.position.set(0.1, APRON - holeD + 0.55, -0.75);
    weep.visible = false;
    const water = box(hole, 2.2, 0.02, 1.6, 0, -holeD + 0.02, 0, 0x2b4a55,
      { rough: 0.15, opacity: 0.75, transparent: true, cast: false });
    water.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 0.35, -0.9),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "sleeve") { sleeve.position.set(0.1, APRON - holeD + 0.5, -0.75); sleeve.rotation.y = 0; }
        if (step.id === "bolt") boltGroups.forEach((b, i) => { b.rotation.z = 0.5 + i * 0.3; });
        if (step.id === "test") {
          repaint(testGauge.userData.screen, signFace("HELD", {
            bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55,
          }));
        }
        if (step.id === "mount") { machine.position.set(0.1, APRON - holeD + 1.03, -0.75); machine.rotation.y = 0; }
        if (step.id === "open-valve") valveOpen = true;
        if (step.id === "cut") cutDone = true;
        if (step.id === "close-valve") valveOpen = false;
        if (step.id === "coupon") coupon.visible = true;
        if (step.id === "linestop") { stopHead.position.set(0.1, APRON - holeD + 1.08, -0.75); stopHead.rotation.y = 0; }
      },

      // Both interruptions really happen in the hole: the sleeve starts
      // weeping and the bell hole starts filling.
      onInterrupt(it) {
        if (it.id === "sleeve-weep") {
          weeping = true; weep.visible = true;
          boltGroups[2].material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6, rough: 0.4 });
          torqueWrench.position.y = 0.12;
        }
        if (it.id === "hole-filling") {
          pumping = false; water.visible = true;
          pumpLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.6, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sleeve-weep") {
          weeping = false; weep.visible = false;
          boltGroups[2].material = mat(0x8a939b, { rough: 0.4, metal: 0.8 });
          torqueWrench.position.y = 0.02;
        }
        if (it.id === "hole-filling") {
          pumping = true; water.visible = false; water.scale.y = 1;
          pumpLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
        }
      },

      onHazard(hitId) {
        if (hitId === "open-early" || hitId === "close-on-cutter") {
          weeping = true; weep.visible = true;
        }
      },

      animate(t, dt, session) {
        const step = session?.step;

        if (weeping) weep.userData.step(dt, new THREE.Vector3(0.2, -0.5, 0), 0.05, 0.6, -1.2);
        if (!pumping && water.visible) water.position.y = Math.min(-holeD + 0.5, water.position.y + dt * 0.06);
        else if (pumping) water.position.y = -holeD + 0.02;
        if (valveOpen && !cutDone) {
          feedHandle.rotation.z = Math.sin(t * 1.2) * 0.05;
        }

        if (step?.id === "cut" && session.track) {
          repaint(travelInd.userData.screen, signFace(`${(session.track.v * 24).toFixed(1)}`, {
            bg: "#0d1c24", accent: session.track.v > 0.36 && session.track.v < 0.56 ? "#59c97b" : "#f0645b",
            fg: "#bfeaf7", scale: 0.55,
          }));
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "test") {
            repaint(testGauge.userData.screen, signFace(`${Math.round(gg.t * 260)}`, {
              bg: "#0d1c24", accent: gg.t > 0.53 && gg.t < 0.8 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (step?.id === "retract") {
            repaint(travelInd.userData.screen, signFace(`${(gg.t * 24).toFixed(1)}`, {
              bg: "#0d1c24", accent: gg.t > 0.7 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
