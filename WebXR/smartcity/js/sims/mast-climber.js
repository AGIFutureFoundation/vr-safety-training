import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mast Climber VR — Construction & Structural Trades, station six.
// Adding a mast section to a mast climbing work platform and taking it up. The
// machine is a rack-and-pinion lift on a tied mast, and almost everything that
// goes wrong with one is a loading problem: an overloaded deck, an unbalanced
// deck, or a tie missed at the spacing the manufacturer computed the mast
// against. It does not fail gradually — the mast buckles.

const MC_ACCENT = 0xfb923c;

export const SIM_MAST_CLIMBER = {
  id: "mast-climber",
  index: "55",
  domain: "Construction access",
  trade: "Mast climber erector / ironworker",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "Ironworkers / LIUNA — mast climbing work platform erector; ANSI A92.9 for MCWP design, erection and use; OSHA 29 CFR 1926.451 scaffold general requirements and 1926.502 fall protection",
  name: "Mast Climber",
  title: simTitle("Mast Climber"),
  tagline: "Adding a mast section and climbing: tie spacing, plumb, rated load and its distribution, overload cut-out proven, emergency descent rehearsed",
  accent: MC_ACCENT,
  accentCss: "#fb923c",
  parSeconds: 265,
  footprint: 2.2,
  badge: { id: "mast-certified", name: "Mast Certified", note: "A mast section added, tied and plumbed, with the deck loaded inside its distribution chart and the cut-out proven" },

  game: system({
    name: "Mast Authority",
    currency: "TIES",
    ranks: ["Apprentice Erector", "Erector", "Lead Erector", "Erection Supervisor", "Mast Authority Certified"],
    badges: [
      { id: "tied-to-spec", name: "Tied To Spec", note: "Tie fitted at the manufacturer's spacing, first time", test: AWARD.stepClean("fit-tie") },
      { id: "never-overloaded", name: "Never Overloaded", note: "Deck never loaded outside its chart", test: AWARD.safe },
      { id: "plumb-true", name: "Plumb True", note: "Mast plumbed inside tolerance", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-climb", name: "Clean Climb", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "held-the-bolt", name: "Held The Bolt", note: "Held the tie bolt torque the full count", test: AWARD.unbroken },
      { id: "up-before-crew", name: "Up Before Crew", note: "Platform ready inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "overload-pallet": "You loaded the block pallet onto the deck. That is more than the platform's rated capacity in one place, and a mast climber does not sag to warn you — the rack-and-pinion drive stalls or the mast buckles at the section above the last tie.",
    "climb-untied": "You took the platform up past the last tie. The tie spacing is what the mast is designed against; above it the mast is a free-standing cantilever carrying a moving load, and the free-standing height on the data plate is a limit, not a guideline.",
    "gate-open": "You left the deck's access gate open. It is the one opening in the guardrail, it is at the exact place people step on and off, and it self-closes for a reason.",
    "ground-clutter": "There is material stacked under the platform's travel path. A mast climber comes down onto whatever is beneath it, and the base frame does not know the difference between a kerb and a gas bottle.",
  },

  lateNotes: {
    "tie-bolt": "The tie goes on before the platform climbs past it, not after.",
    "load-chart": "Read the distribution chart before anything goes on the deck.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "erection-plan",
      title: "Take the manufacturer's erection plan",
      cue: "Check the tie spacing, the free-standing height, and today's deck configuration.",
      why: "A mast climber is engineered per installation. Tie spacing, free-standing height and rated load all come off the manufacturer's plan for this building, and none of them transfer from the last job.",
    },
    {
      id: "base-check", kind: "find", noHint: true,
      targets: ["ground-clutter", "soft-ground"],
      itemNames: { "ground-clutter": "material under the travel path", "soft-ground": "soft ground at the base frame" },
      itemNotes: {
        "ground-clutter": "There is banding and offcut stacked inside the base frame's footprint. The platform comes down onto that.",
        "soft-ground": "The near corner of the base frame is bearing on fill that has taken this week's rain. A base that settles takes the mast out of plumb under load.",
      },
      title: "Walk the base before anything moves",
      cue: "Look at what the machine is standing on and what is under its travel path; click what has to be dealt with.",
      why: "Everything above depends on the base. A mast climber transfers its whole load and its whole overturning moment into a few square feet of ground, and the ground is the part nobody inspects.",
    },
    {
      id: "load-chart", kind: "select", target: "load-chart",
      title: "Read the load distribution chart",
      cue: "Capacity is not one number — check what the deck takes and where.",
      why: "The rated load assumes a distribution. The same total weight stacked at one end is a different machine from the same weight spread along the deck, and the chart is where that difference is written down.",
    },
    {
      id: "distribute", kind: "drag", target: "material-bundle",
      title: "Load the deck to the chart",
      cue: "Bundle spread along the deck over the mast, not stacked at the outboard end.",
      why: "Load near the mast is carried by the mast. Load at the outboard end is a lever on it. The chart's zones are the same machine rated three different ways depending on where you put things.",
      drag: { to: "deck-inboard", radius: 0.5, missNote: "Not over the mast — the outboard end is where the chart's capacity falls away fastest." },
    },
    {
      id: "gate", kind: "select", target: "access-gate",
      title: "Close the access gate",
      cue: "Gate shut and latched before the platform moves.",
      why: "The gate is the only break in the guardrail and it is exactly where people are standing when the platform starts. Self-closing is a design feature, not a substitute for closing it.",
    },
    {
      id: "hoist-section", kind: "drag", target: "mast-section",
      title: "Hoist the new mast section",
      cue: "Section up on the machine's own hoist, square to the mast top.",
      why: "The section goes up on the erection hoist that is part of the machine, guided rather than swung. A section that arrives crooked will not engage its rack, and forcing it damages the teeth the drive climbs on.",
      drag: { to: "mast-top", radius: 0.45, missNote: "Not aligned to the mast head — bring it square before it goes on." },
    },
    {
      id: "pin-section", kind: "sequence",
      targets: ["pin-a", "pin-b", "pin-c", "pin-d"],
      itemNames: { "pin-a": "pin 1", "pin-b": "pin 2", "pin-c": "pin 3", "pin-d": "pin 4" },
      title: "Pin the section, all four corners",
      cue: "Every pin in, every retainer fitted.",
      why: "Four pins and four retainers, checked by eye. A section running on three is carrying the whole machine on a joint the engineer never analysed, and the missing one is always found afterwards.",
    },
    {
      id: "fit-tie", kind: "drag", target: "wall-tie",
      title: "Fit the wall tie at the plan's spacing",
      cue: "Tie onto the mast and the building at the spacing the plan gives.",
      why: "Ties are what turn a tall free-standing mast into a braced one. Their spacing is computed against the mast's section properties and the wind load on the platform, which is why it is a number on a drawing and not a judgement.",
      drag: { to: "tie-bracket", radius: 0.45, missNote: "Not at the bracket — a tie at the wrong height is not the tie the calculation assumed." },
    },
    {
      id: "torque-tie", kind: "hold", target: "tie-bolt", seconds: 4,
      title: "Torque the tie bolts",
      cue: "Both bolts to the plan's figure, held to the click.",
      why: "A loose tie lets the mast move against the building, which works the anchor and enlarges its hole until the tie is decorative. The figure is on the plan for the anchor that was installed, not the anchor you would have chosen.",
      holdBreakNote: "Came off before the click — that tie is not carrying what the calculation says it carries.",
    },
    {
      id: "plumb", kind: "gauge", target: "plumb-gauge",
      title: "Plumb the mast",
      cue: "Read the mast against the plumb indicator and commit inside tolerance.",
      why: "Out of plumb, the mast carries its own weight partly as a bending load, and the drive fights the rack the whole way up. Tolerance is a few millimetres over the mast height, and it is adjusted at the base and the ties.",
      gauge: { label: "PLUMB mm", speed: 0.75, green: [0.44, 0.6], readout: (t) => `${((t - 0.5) * 60).toFixed(1)} mm`, missNote: "Outside plumb tolerance — adjust at the base before it goes any higher." },
    },
    {
      id: "cutout", kind: "gauge", target: "overload-cell",
      title: "Prove the overload cut-out",
      cue: "Load the cell to the trip point and confirm the drive inhibits.",
      why: "The overload cut-out is the last thing between a mis-loaded deck and a buckled mast, and it is the one safety device on the machine that is never exercised in normal use. It gets proven, not assumed.",
      gauge: { label: "LOAD %", speed: 0.72, green: [0.62, 0.78], readout: (t) => `${Math.round(t * 130)} %`, missNote: "The drive did not inhibit at the trip point — that cut-out is not protecting anything." },
    },
    {
      id: "descent-drill", kind: "hold", target: "manual-descent", seconds: 5,
      title: "Rehearse the emergency descent",
      cue: "Hand on the manual descent valve, hold it through a controlled drop.",
      why: "When the power fails the platform comes down on the manual descent, operated by whoever is on the deck. That is not the moment to read the label, so it is rehearsed while everything is working.",
      holdBreakNote: "Released early — a partial descent leaves the platform stopped between ties, which is where it must not stop.",
    },
    {
      id: "climb", kind: "track", target: "drive-control", seconds: 6,
      title: "Take the platform up to the new working height",
      cue: "Hold the drive control and keep the climb rate in the band.",
      why: "The drive is held, not latched, so that letting go stops the machine. The rate band is where the pinion and the rack are designed to mesh — driving it hard chews the rack, and the rack is the thing holding the platform up.",
      track: { label: "CLIMB", green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.16,
        readout: (v) => `${(v * 9).toFixed(1)} m/min` },
    },
    {
      id: "handover", kind: "select", target: "inspection-tag",
      title: "Sign the platform over",
      cue: "Tag the machine with the height, the ties fitted and today's date.",
      why: "The tag is what tells the trades who use this platform tomorrow that somebody competent last checked it, at this height, with these ties. Without it the machine is out of service, whatever its condition.",
    },
  ],

  interrupts: [
    {
      id: "crew-loading",
      kind: "Deck being loaded",
      after: "fit-tie", delay: 4, seconds: 12,
      alert: "A bricklaying crew has started landing a pallet of block onto the outboard end of the deck while you are on the tie.",
      cue: "That pallet is going on the wrong end, and probably over the number.",
      target: "load-chart",
      why: "The people using a mast climber are rarely the people who erected it, and the distribution chart is not intuitive — the deck looks equally strong everywhere. The chart is the conversation, and it has to happen before the pallet is down, not after.",
      missNote: "The pallet went down on the outboard end. Nothing buckled. The margin between the chart's outboard rating and a pallet of block is smaller than anyone on that deck believed, and none of them could see it.",
      wrongNote: "It is the load chart. Stop the loading and show them the zones before that pallet is on the deck.",
    },
    {
      id: "gust-tie",
      kind: "Wind on an untied mast",
      after: "plumb", delay: 3, seconds: 11,
      alert: "The wind has got up and the mast is visibly working above the last tie, with the new section not yet braced.",
      cue: "The section above the tie is free-standing.",
      target: "wall-tie",
      why: "Free-standing height is the one figure on a mast climber that is a hard limit. Above the last tie the mast is a cantilever, and the platform on it is a sail at the far end of the lever.",
      missNote: "You left the new section unbraced through the gusts. It stayed up. The free-standing height on the data plate was computed for the wind the manufacturer assumed, and this afternoon was above it.",
      wrongNote: "It is the wall tie. Get the new section braced before anything else happens on this mast.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, MC_ACCENT);

    // -------------------------------------------------------- building face
    const wall = group(g, 0, 0, -2.2);
    box(wall, 6.0, 5.6, 0.3, 0, 2.8, 0, 0xa79a86,
      { rough: 0.95, finish: "concrete", tile: [8, 7], cast: false });
    for (let i = 0; i < 3; i++) {
      for (const sx of [-1.7, 1.7]) {
        box(wall, 0.8, 1.0, 0.06, sx, 1.4 + i * 1.5, 0.18, 0x2b3138, { rough: 0.35, metal: 0.2, cast: false });
      }
    }
    holoTag(wall, "Elevation C — block face", 0, 5.9, 0.2, { css: "#fb923c", w: 0.48 });

    // ------------------------------------------------------------ base frame
    const base = group(g, 0, 0, -1.2);
    box(base, 2.4, 0.18, 1.4, 0, 0.09, 0, 0x59636d,
      { rough: 0.6, metal: 0.45, finish: "painted", tile: [3, 2] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(base, 0.09, 0.11, 0.16, sx * 1.05, 0.08, sz * 0.58, 0x2b3138, { rough: 0.7, seg: 12 });
      box(base, 0.34, 0.06, 0.34, sx * 1.05, 0.03, sz * 0.58, 0x6b7076,
        { rough: 0.9, finish: "concrete", tile: [1, 1], cast: false });               // sole plate
    }
    holoTag(base, "Base frame", 0, 0.45, 0.7, { css: "#fb923c", w: 0.26 });
    const softGround = box(g, 0.7, 0.02, 0.6, -1.05, 0.012, -0.64, 0x5a4b38,
      { rough: 1, opacity: 0.85, transparent: true, cast: false });
    holoTag(g, "Fill, wet", -1.05, 0.3, -0.64, { css: "#f0645b", w: 0.24 });
    reg(hits, softGround, "soft-ground");
    const clutter = group(g, 0.75, 0, -1.0);
    for (let i = 0; i < 3; i++) box(clutter, 0.4, 0.07, 0.22, 0, 0.035 + i * 0.075, i * 0.05, 0x8a7f5a, { rough: 0.9 });
    holoTag(clutter, "Stacked under the deck", 0, 0.42, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, clutter, "ground-clutter");

    // ----------------------------------------------------------------- mast
    // Square lattice with a rack up one face, in sections so a new one can
    // visibly land on top.
    const mast = group(base, 0, 0.18, 0);
    const SECT = 1.15;
    const mastSections = [];
    for (let sct = 0; sct < 3; sct++) {
      const sg = group(mast, 0, sct * SECT, 0);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        cyl(sg, 0.028, 0.028, SECT, sx * 0.16, SECT / 2, sz * 0.16, 0xe2a33d,
          { rough: 0.55, metal: 0.4, seg: 10, finish: "painted" });
      }
      for (let b = 0; b <= 2; b++) {
        for (const sz of [-1, 1]) box(sg, 0.36, 0.022, 0.022, 0, b * (SECT / 2), sz * 0.16, 0xe2a33d, { rough: 0.55, metal: 0.4, cast: false });
        for (const sx of [-1, 1]) box(sg, 0.022, 0.022, 0.36, sx * 0.16, b * (SECT / 2), 0, 0xe2a33d, { rough: 0.55, metal: 0.4, cast: false });
      }
      // The rack the pinion climbs.
      for (let tth = 0; tth < 14; tth++) {
        box(sg, 0.05, 0.022, 0.03, 0, 0.05 + tth * 0.08, 0.2, 0x8b929a, { rough: 0.4, metal: 0.8, cast: false });
      }
      mastSections.push(sg);
    }
    holoTag(mast, "Mast — 3 sections", 0.35, 2.6, 0, { css: "#fb923c", w: 0.36 });

    // The new section, on the ground until it goes up.
    const newSection = group(g, 1.75, 0, 0.55, 0.3);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(newSection, 0.028, 0.028, SECT, sx * 0.16, 0.2, sz * 0.16, 0xf0b455, { rough: 0.5, metal: 0.4, seg: 10, finish: "painted" }).rotation.x = Math.PI / 2;
    }
    holoTag(newSection, "New mast section", 0, 0.55, 0, { css: "#fb923c", w: 0.36 });
    reg(hits, newSection, "mast-section");
    const mastTop = box(mast, 0.45, 0.12, 0.45, 0, 3 * SECT + 0.06, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["mast-top"] = mastTop;
    const pins = {};
    for (const [i, id] of ["pin-a", "pin-b", "pin-c", "pin-d"].entries()) {
      const sx = i < 2 ? -1 : 1, sz = i % 2 ? -1 : 1;
      const pin = cyl(mast, 0.018, 0.018, 0.1, sx * 0.16, 3 * SECT - 0.05, sz * 0.16, 0xd8232a, { rough: 0.5, metal: 0.6, seg: 10 });
      pin.rotation.z = Math.PI / 2;
      pin.visible = false;
      pins[id] = pin;
      const slot = box(mast, 0.07, 0.07, 0.07, sx * 0.16, 3 * SECT - 0.05, sz * 0.16, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      reg(hits, slot, id);
    }

    // ------------------------------------------------------------- platform
    const deck = group(mast, 0, 1.25, 0.55);
    box(deck, 3.4, 0.08, 0.95, 0, 0, 0, 0x6b7076, { rough: 0.7, metal: 0.3, finish: "grating", tile: [5, 2] });
    for (const [dx, dz] of [[-1.7, 0], [1.7, 0], [0, 0.47], [0, -0.47]]) {
      box(deck, dx ? 0.05 : 3.4, 1.05, dz ? 0.05 : 0.95, dx, 0.55, dz, 0xf2c14b, { rough: 0.6, cast: false });
    }
    for (const dz of [0.47, -0.47]) box(deck, 3.4, 0.05, 0.05, 0, 0.5, dz, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(deck, "Work platform", 0, 1.3, 0, { css: "#fb923c", w: 0.32 });
    const gate = group(deck, 1.2, 0.55, 0.47);
    box(gate, 0.7, 1.0, 0.04, 0.35, 0, 0, 0xf2a23b, { rough: 0.6, cast: false });
    gate.rotation.y = -1.1;
    holoTag(deck, "Access gate", 1.2, 1.15, 0.47, { css: "#f2a23b", w: 0.28 });
    reg(hits, gate, "access-gate");
    // Stepping through the gap where the gate should be. The gate itself is a
    // step target; this is the opening it leaves, which is the actual hazard.
    const gateGap = box(deck, 0.7, 1.0, 0.12, 1.55, 0.55, 0.47, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(deck, "Step through?", 1.55, 1.2, 0.47, { css: "#f0645b", w: 0.28 });
    reg(hits, gateGap, "gate-open");

    const inboard = box(deck, 0.8, 0.1, 0.7, 0, 0.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["deck-inboard"] = inboard;
    const bundle = group(g, -1.85, 0, 0.7, -0.3);
    box(bundle, 0.7, 0.18, 0.4, 0, 0.09, 0, 0x8a7f5a, { rough: 0.9 });
    box(bundle, 0.72, 0.03, 0.42, 0, 0.19, 0, 0x2b3138, { rough: 0.7, cast: false });
    holoTag(bundle, "Material bundle", 0, 0.45, 0, { css: "#fb923c", w: 0.32 });
    reg(hits, bundle, "material-bundle");
    const pallet = group(g, -2.45, 0, -0.2, 0.2);
    for (let i = 0; i < 4; i++) box(pallet, 0.56, 0.1, 0.4, 0, 0.12 + i * 0.1, 0, 0x9a8878, { rough: 0.95 });
    box(pallet, 0.6, 0.08, 0.44, 0, 0.04, 0, 0x7a6a52, { rough: 0.95 });
    holoTag(pallet, "Block pallet", 0, 0.72, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, pallet, "overload-pallet");

    // ---------------------------------------------------------------- ties
    const tieBracket = box(wall, 0.24, 0.24, 0.12, 0, 3.55, 0.2, 0x8b929a, { rough: 0.5, metal: 0.6 });
    holoTag(wall, "Tie bracket", 0, 3.85, 0.22, { css: "#8fb3c4", w: 0.26 });
    hits["tie-bracket"] = tieBracket;
    const tie = group(g, 2.2, 0, -0.5, -0.4);
    cyl(tie, 0.03, 0.03, 0.9, 0, 0.35, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    box(tie, 0.1, 0.12, 0.05, -0.42, 0.35, 0, 0x8b929a, { rough: 0.5, metal: 0.6 });
    holoTag(tie, "Wall tie", 0, 0.68, 0, { css: "#8fb3c4", w: 0.24 });
    reg(hits, tie, "wall-tie");
    const tieBolt = group(wall, 0.18, 3.55, 0.26);
    for (const dy of [-0.07, 0.07]) box(tieBolt, 0.04, 0.04, 0.05, 0, dy, 0, 0xd8b23a, { rough: 0.45, metal: 0.7 });
    holoTag(wall, "Tie bolts", 0.18, 3.32, 0.28, { css: "#d8b23a", w: 0.24 });
    reg(hits, tieBolt, "tie-bolt");
    // The free-standing zone above the last tie, which is the untied trap.
    const untied = box(mast, 0.5, 1.0, 0.5, 0, 3 * SECT - 0.4, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, untied, "climb-untied");

    // ---------------------------------------------------------- controls
    const ctrl = group(deck, -1.3, 0.5, -0.36);
    box(ctrl, 0.3, 0.42, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.6, finish: "painted", tile: [1, 1] });
    const driveLever = box(ctrl, 0.05, 0.2, 0.05, -0.07, 0.12, 0.1, 0xf2c14b, { rough: 0.5 });
    holoTag(ctrl, "Drive control", 0, 0.34, 0, { css: "#f2c14b", w: 0.28 });
    reg(hits, ctrl, "drive-control");
    const descent = group(deck, -1.3, 0.28, 0.36);
    cyl(descent, 0.05, 0.05, 0.07, 0, 0, 0, 0xd8232a, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    box(descent, 0.04, 0.16, 0.04, 0, 0.1, 0.02, 0xd8232a, { rough: 0.5 });
    holoTag(deck, "Manual descent", -1.3, 0.52, 0.36, { css: "#f0645b", w: 0.32 });
    reg(hits, descent, "manual-descent");
    const cell = instrument(deck, 0.55, 0.5, -0.34, { ry: 0.2, idle: "-- %", color: 0xfb923c });
    holoTag(deck, "Overload cell", 0.55, 0.68, -0.34, { css: "#fb923c", w: 0.28 });
    reg(hits, cell, "overload-cell");
    const plumbGauge = instrument(base, 0.85, 0.5, 0.5, { ry: -0.6, idle: "-- mm", color: 0x4fd1ff });
    holoTag(base, "Plumb indicator", 0.85, 0.68, 0.5, { css: "#4fd1ff", w: 0.32 });
    reg(hits, plumbGauge, "plumb-gauge");

    const chest = toolChest(g, 2.45, 1.25, { ry: -0.9, color: 0xfb923c });
    const tag = box(chest, 0.16, 0.2, 0.02, 0, 0.82, 0.06, 0x59c97b, { rough: 0.6 });
    holoTag(chest, "Inspection tag", 0, 1.0, 0.06, { css: "#59c97b", w: 0.3 });
    reg(hits, tag, "inspection-tag");

    const chartBoard = holoPanel(g, 0.56, 0.4, -2.55, 1.5, 0.95, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#fb923c"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("LOAD DISTRIBUTION — MCWP 2400", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("RATED 2400 kg — NOT ANYWHERE", w * 0.06, h * 0.3);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Over mast (±1.0 m): 2400 kg", "Mid deck: 1400 kg",
       "Outboard end: 600 kg", "Point load max: 400 kg",
       "Tie spacing this job: 6.0 m", "Free-standing above last tie: 2.0 m"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.44 + i * h * 0.09));
    }, { ry: 0.5 });
    reg(hits, chartBoard, "load-chart");

    const plan = holoPanel(g, 0.54, 0.38, -2.55, 1.5, 1.85, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#fb923c"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ERECTION PLAN — ELEV. C", w * 0.06, h * 0.22);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Section add: 4th, to 12.6 m", "Tie at 6.0 m centres — bracket C3",
       "Tie bolts 120 Nm", "Plumb tolerance ±15 mm over mast",
       "Prove overload cut-out after load"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.42 + i * h * 0.1));
    }, { ry: 0.5 });
    reg(hits, plan, "erection-plan");

    standingFigure(g, 2.9, 0.1, { ry: -1.6, cloth: 0x2b3138, vest: 0xfb923c, helmet: 0xf2f2f2 });
    for (let i = 0; i < 2; i++) cone(g, -1.5 + i * 0.8, 1.6, { color: 0xf2a23b });
    barrierPanel(g, 0.4, 1.65, { color: 0xf2a23b });

    let climbing = 0, sway = 0, tied = true;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "base-check") { clutter.visible = false; softGround.material = mat(0x6b7076, { rough: 0.95 }); }
        if (step.id === "distribute") { bundle.parent.remove(bundle); deck.add(bundle); bundle.position.set(0, 0.13, 0); bundle.rotation.set(0, 0, 0); }
        if (step.id === "gate") { gate.rotation.y = 0; gateGap.visible = false; }
        if (step.id === "hoist-section") {
          newSection.parent.remove(newSection);
          mast.add(newSection);
          newSection.position.set(0, 3 * SECT + 0.1, 0);
          newSection.rotation.set(0, 0, 0);
          tied = false;
        }
        if (step.id === "pin-section") for (const p of Object.values(pins)) p.visible = true;
        if (step.id === "fit-tie") {
          tie.parent.remove(tie);
          wall.add(tie);
          tie.position.set(0.3, 3.55, 0.3);
          tie.rotation.set(0, Math.PI / 2, 0);
          tied = true;
        }
        if (step.id === "descent-drill") deck.position.y = 1.05;
        if (step.id === "climb") { climbing = 0; deck.position.y = 2.35; }
      },

      // The pallet really lands on the outboard end, and the mast really works
      // in the gust.
      onInterrupt(it) {
        if (it.id === "crew-loading") { pallet.parent.remove(pallet); deck.add(pallet); pallet.position.set(1.45, 0.14, 0); }
        if (it.id === "gust-tie") { sway = 1; mast.rotation.z = 0.02; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "crew-loading") { deck.remove(pallet); g.add(pallet); pallet.position.set(-2.45, 0, -0.2); }
        if (it.id === "gust-tie") { sway = 0; mast.rotation.z = 0; }
      },

      onHazard(hitId) {
        if (hitId === "overload-pallet" || hitId === "climb-untied") sway = 1;
      },

      animate(t, dt, session) {
        // A tied mast barely moves; an untied one in wind is visible from the
        // ground, which is the whole point of the free-standing limit.
        const amp = (tied ? 0.0015 : 0.008) + sway * 0.012;
        mast.rotation.z = Math.sin(t * 1.3) * amp;
        if (session?.step?.id === "climb") { climbing += dt; deck.position.y = 1.05 + Math.min(1.3, climbing * 0.22); }
        driveLever.rotation.x = session?.step?.id === "climb" ? -0.5 : 0;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "plumb") {
          repaint(plumbGauge.userData.screen, signFace(`${((gg.t - 0.5) * 60).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "cutout") {
          repaint(cell.userData.screen, signFace(`${Math.round(gg.t * 130)}%`, {
            bg: "#1c1408", accent: gg.t > 0.6 && gg.t < 0.8 ? "#59c97b" : "#f2c14b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
      },
    };
  },
};
