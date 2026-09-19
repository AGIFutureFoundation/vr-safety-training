import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, rackFrame, rackUnit,
  equipmentCabinet, standingFigure, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Data Hall VR — Connectivity & Telecom, station five.
// Landing a busway tap-off box on a live overhead busway in a hot aisle. The
// defining constraint of this trade is that nothing can be switched off: the
// hall is concurrently maintainable, the load is somebody's business, and the
// A-side stays live while you work the B-side. Everything here is about
// proving which side you are on before you put a hand on it.

const DH_ACCENT = 0x38bdf8;

export const SIM_DATA_HALL = {
  id: "data-hall",
  index: "54",
  domain: "Data centre",
  trade: "Critical facilities electrician",
  category: "Connectivity & Telecom",
  weather: "overcast",
  certification: "IBEW — critical facilities / data centre electrician; NFPA 70E arc-flash risk assessment and energised electrical work permit; OSHA 29 CFR 1910.333 for working on or near live parts; Uptime Institute concurrent maintainability practice",
  name: "Data Hall",
  title: simTitle("Data Hall"),
  tagline: "Busway tap-off on a live overhead run: EEWP, A/B side proven, arc PPE, boundary held, torqued and thermally verified",
  accent: DH_ACCENT,
  accentCss: "#38bdf8",
  parSeconds: 250,
  footprint: 2.1,
  badge: { id: "concurrent-certified", name: "Concurrent Certified", note: "A tap-off landed on a live busway with the redundant side proven, the boundary held and nothing dropped" },

  game: system({
    name: "Hall Authority",
    currency: "KW",
    ranks: ["Facilities Apprentice", "Critical Electrician", "Shift Engineer", "Hall Lead", "Hall Authority Certified"],
    badges: [
      { id: "right-side", name: "Right Side", note: "Proved the B-side dead and never touched the A-side", test: AWARD.stepClean("prove-side") },
      { id: "boundary-held", name: "Boundary Held", note: "No unqualified approach inside the restricted boundary", test: AWARD.safe },
      { id: "torque-true", name: "Torque True", note: "Tap-off landed inside the torque and thermal spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "no-trip", name: "No Trip", note: "Clean run — nothing on the floor lost a feed", test: AWARD.clean },
      { id: "held-the-stab", name: "Held The Stab", note: "Held the tap-off engagement the full count", test: AWARD.unbroken },
      { id: "in-the-window", name: "In The Window", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "a-side-bus": "That is the A-side busway — the live one carrying the floor. Concurrent maintainability means one side is always energised so the hall never goes down; it also means the energised side is always an arm's length from the one you are working on, and the only thing telling them apart is the label and the meter.",
    "no-eewp": "You started work on energised equipment without the permit. An energised electrical work permit is not paperwork for its own sake — it is the document where somebody senior had to write down why this cannot be done de-energised, and sign their name to that.",
    "open-floor": "You left the raised-floor tile out behind you with no barrier. A missing tile in a dark hot aisle is a broken ankle for the next person through, and the tile puller is sitting in the hole where nobody can see it.",
    "cardboard": "You brought packaging into the hall. Cardboard and pallets shed fibre straight into the air handlers and the containment, which is why they are broken down at the dock and never cross the threshold.",
  },

  lateNotes: {
    "tap-off": "The tap-off lands after the side is proven and the PPE is on.",
    "torque-tool": "Torque comes after the box is stabbed home, not before.",
  },

  steps: [
    {
      id: "eewp", kind: "select", target: "eewp-permit",
      title: "Take the energised electrical work permit",
      cue: "Read why this cannot be de-energised, the incident energy, and the approach boundaries.",
      why: "Everything in this hall is fed twice so that no single feed ever has to be someone's emergency. The permit is where the justification for working it live is written down and signed, and it carries the incident energy the PPE is chosen against.",
    },
    {
      id: "arc-ppe", kind: "sequence", anyOrder: true,
      targets: ["arc-hood", "arc-gloves", "boundary-tape"],
      itemNames: { "arc-hood": "arc-rated hood", "arc-gloves": "class 0 gloves with leathers", "boundary-tape": "restricted-approach boundary" },
      title: "Arc PPE to the permit's category, and the boundary",
      cue: "Hood and gloves to the stated category, boundary tape before anyone else walks the aisle.",
      why: "The boundary is as much for the technician walking past with an armful of drives as for you. In a hot aisle nobody expects an energised worker, because normally there isn't one.",
    },
    {
      id: "prove-side", kind: "gauge", target: "bus-meter",
      title: "Prove which side you are on",
      cue: "Meter on the B-side tap point, live-dead-live, and commit on the reading.",
      why: "A and B run parallel, a metre apart, in identical housings, with the labels facing whichever way the installer felt like. The meter is the only thing in this hall that actually knows which one is which.",
      gauge: { label: "BUS V", speed: 0.8, green: [0.02, 0.16], readout: (t) => `${Math.round(t * 500)} V`, missNote: "That is the live side. Stop, re-read the labels, and meter again before anything else happens." },
    },
    {
      id: "lock-b", kind: "select", target: "b-breaker-lock",
      title: "Lock and tag the B-side feeder",
      cue: "Your lock on the B-side breaker upstream, tag with the permit number.",
      why: "The side you are working is off and stays off because your lock is on it. Without that, the only thing between you and a re-energised busway is the fact that nobody happened to want it back yet.",
    },
    {
      id: "tile", kind: "drag", target: "floor-tile",
      title: "Lift the floor tile and barrier the hole",
      cue: "Puller on the tile, lift it out, and set the barrier round the opening.",
      why: "The tap-off's whip drops into the floor void to the cabinet. The tile comes up, and the hole gets a barrier immediately — not when you remember, because you will be looking up for the next twenty minutes.",
      drag: { to: "tile-rack", radius: 0.45, missNote: "Not on the rack — a loose tile leaning on a cabinet is the next thing somebody walks into." },
    },
    {
      id: "clean", kind: "select", target: "waste-cart",
      title: "Break down the packaging outside the hall",
      cue: "Box, bag and pallet go on the cart and out — nothing with fibre on it crosses the threshold.",
      why: "The hall's air handlers pull everything that sheds into the containment and then through fifty thousand pounds of server. Cardboard is not untidy in here, it is contamination.",
    },
    {
      id: "hoist", kind: "drag", target: "tap-off",
      title: "Lift the tap-off box to the busway",
      cue: "Two people, or the lift — the box goes up square to the plug-in opening.",
      why: "A tap-off box is thirty kilos held overhead at arm's length. Square to the opening or it will not seat, and a box hanging half-engaged off a live busway run is the worst place in the hall to be standing.",
      drag: { to: "plug-opening", radius: 0.4, missNote: "Not aligned to the plug-in opening — bring it square before it goes anywhere near the bus." },
    },
    {
      id: "stab", kind: "hold", target: "tap-off", seconds: 5,
      title: "Stab the tap-off home",
      cue: "Steady pressure, straight in, and hold until the interlock latches.",
      why: "The stabs have to engage together. Rocking it in engages one phase before the others, which is a phase-to-phase fault inside a box you are holding. Straight in, held, until the mechanical interlock says it is home.",
      holdBreakNote: "It came off part way. A partly stabbed tap-off is not installed, it is a hazard hanging on a bus — set it again.",
    },
    {
      id: "torque", kind: "gauge", target: "torque-tool",
      title: "Torque the tap-off terminations",
      cue: "Each lug to the figure on the label, and commit inside the band.",
      why: "Under-torqued lugs are the single most common cause of failures in this equipment: they run hot, oxidise, run hotter, and fail as an arcing fault months later with the hall on them.",
      gauge: { label: "Nm", speed: 0.72, green: [0.46, 0.62], readout: (t) => `${Math.round(t * 60)} Nm`, missNote: "Outside the torque band — that lug is a future arcing fault. Set it again." },
    },
    {
      id: "restore", kind: "turn", target: "b-breaker",
      title: "Close the B-side feeder",
      cue: "Lock off, permit closed, and close the breaker to re-energise the side.",
      why: "The side comes back on when the work is finished and the permit is closed, in that order. The hall has been running on one side for the whole job, which is the point of building it that way — and also why finishing matters.",
      turn: { turns: 0.5, axis: "y", label: "B FEED" },
    },
    {
      id: "thermal", kind: "gauge", target: "thermal-camera",
      title: "Thermal-scan the terminations under load",
      cue: "Scan each lug once the load is on and commit inside the temperature band.",
      why: "Torque is a proxy; temperature is the measurement. A joint that reads twenty degrees over its neighbours under load is a bad joint regardless of what the wrench said, and it is found now or it is found by the fire alarm.",
      gauge: { label: "ΔT °C", speed: 0.75, green: [0.04, 0.2], readout: (t) => `${Math.round(t * 60)} °C`, missNote: "That joint is running hot. Take the side back down and re-make it — it will not improve on its own." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["blanking-gap", "strained-whip"],
      itemNames: { "blanking-gap": "missing blanking panel", "strained-whip": "strained power whip" },
      itemNotes: {
        "blanking-gap": "There is a rack space with no blanking panel. Hot aisle air short-circuits straight back through it into the cold aisle, which is how a hall with plenty of cooling still cooks one cabinet.",
        "strained-whip": "A neighbouring cabinet's whip is pulled taut across the floor void opening. One tile lift away from being disconnected by somebody's boot.",
      },
      title: "Walk the aisle before you sign off",
      cue: "Look over the containment, the whips and the tiles before the barrier comes down; click what needs a ticket.",
      why: "In a hall where nothing can be switched off, the things that take a floor down are almost never the work anyone planned. They are the loose ends left behind by work that went fine.",
    },
  ],

  interrupts: [
    {
      id: "wrong-side-tag",
      kind: "Mislabelled equipment",
      after: "lock-b", delay: 4, seconds: 12,
      alert: "The busway above you is labelled B-SIDE. The breaker you have just locked is tagged A-FEED on the panel schedule.",
      cue: "Two labels, and they disagree.",
      target: "bus-meter",
      why: "Labels are applied by people and edited by nobody. When the schedule and the equipment disagree, neither is evidence — the meter is, and it gets used again rather than argued with.",
      missNote: "You carried on with the contradiction unresolved. It happened to be the B-side. The label that was wrong is still wrong, and the next person will read it the same way you nearly did.",
      wrongNote: "It is the meter. When two labels disagree, you do not pick the one you prefer — you measure again.",
    },
    {
      id: "tile-out",
      kind: "Open floor void",
      after: "stab", delay: 3, seconds: 11,
      alert: "Somebody has moved your barrier to get a cart past. The floor tile is still out and the hole is open in the aisle behind you.",
      cue: "There is an open floor void behind you and your hands are full.",
      target: "floor-barrier",
      why: "A raised-floor void is half a metre deep and invisible in a dark hot aisle. The barrier is the only thing making it visible, and it only works while it is where you put it.",
      missNote: "The hole stayed open and unbarriered for the rest of the job. Nobody went into it. That was luck and traffic, not control — and the cart that moved your barrier came back the other way.",
      wrongNote: "It is the floor barrier. Put it back round the hole before you finish what you are holding.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, DH_ACCENT);

    // -------------------------------------------------------- raised floor
    const FW = 5.4, FD = 4.4;
    const floor = group(g, 0, 0, 0);
    box(floor, FW, 0.12, FD, 0, 0.06, 0, 0x39424b,
      { rough: 0.7, metal: 0.2, finish: "brushed", tile: [9, 7], cast: false });
    // Tile grid lines, which is most of what a data hall floor looks like.
    for (let i = -8; i <= 8; i++) {
      box(floor, 0.012, 0.006, FD, i * 0.6, 0.125, 0, 0x22282e, { cast: false, receive: false });
      if (Math.abs(i) <= 6) box(floor, FW, 0.006, 0.012, 0, 0.125, i * 0.6, 0x22282e, { cast: false, receive: false });
    }
    // The lifted tile, its void and the barrier.
    const voidHole = box(floor, 0.56, 0.4, 0.56, -0.9, -0.14, 0.6, 0x05070a, { rough: 1, cast: false });
    voidHole.visible = false;
    const tile = box(floor, 0.56, 0.1, 0.56, -0.9, 0.07, 0.6, 0x434c55,
      { rough: 0.7, metal: 0.2, finish: "brushed", tile: [1, 1] });
    holoTag(floor, "Floor tile", -0.9, 0.34, 0.6, { css: "#38bdf8", w: 0.24 });
    reg(hits, tile, "floor-tile");
    const tileRack = box(g, 0.34, 0.5, 0.1, -2.3, 0.25, 1.5, 0x2b3138, { rough: 0.6, metal: 0.3 });
    holoTag(g, "Tile rack", -2.3, 0.6, 1.5, { css: "#8fb3c4", w: 0.22 });
    hits["tile-rack"] = tileRack;
    const barrier = group(floor, -0.9, 0, 0.6);
    for (const [dx, dz] of [[-0.42, 0], [0.42, 0], [0, -0.42], [0, 0.42]]) {
      box(barrier, dx ? 0.04 : 0.86, 0.66, dz ? 0.04 : 0.86, dx, 0.45, dz, 0xf2c14b, { rough: 0.6, cast: false });
    }
    barrier.visible = false;
    holoTag(floor, "Void barrier", -0.9, 1.0, 0.6, { css: "#f2c14b", w: 0.26 });
    reg(hits, barrier, "floor-barrier");
    const openTrap = box(floor, 0.6, 0.06, 0.6, -0.9, 0.16, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, openTrap, "open-floor");

    // ------------------------------------------------------------- cabinets
    // Two rows facing each other: the hot aisle is between them.
    const cabs = [];
    for (const side of [-1, 1]) {
      for (let i = -1; i <= 1; i++) {
        const c = group(floor, i * 0.82, 0.12, side * 1.35);
        box(c, 0.72, 2.0, 0.95, 0, 1.0, 0, 0x22262b,
          { rough: 0.55, metal: 0.35, finish: "painted", tile: [2, 3] });
        // Perforated door, suggested with a band of slots.
        for (let r = 0; r < 9; r++) {
          box(c, 0.6, 0.02, 0.012, 0, 0.3 + r * 0.19, side * -0.48, 0x11151a, { cast: false, receive: false });
        }
        // Equipment lamps, which is the only thing that makes a hall feel alive.
        for (let u = 0; u < 7; u++) {
          const lamp = ball(c, 0.011, -0.24 + (u % 3) * 0.05, 0.42 + u * 0.2, side * -0.49,
            u % 4 === 0 ? 0xf2c14b : 0x59c97b, { emissive: u % 4 === 0 ? 0xf2c14b : 0x59c97b, ei: 1.6, cast: false });
          cabs.push(lamp);
        }
        if (side === 1 && i === 1) {
          // The rack with the missing blanking panel.
          const gap = box(c, 0.58, 0.18, 0.02, 0, 1.2, -0.49, 0x05070a, { rough: 1 });
          holoTag(c, "Rack space", 0, 1.44, -0.5, { css: "#f0645b", w: 0.24 });
          reg(hits, gap, "blanking-gap");
        }
      }
    }
    // Containment roof over the aisle, which is why the blanking panel matters.
    for (let i = -2; i <= 2; i++) {
      box(floor, 0.8, 0.03, 2.4, i * 0.82, 2.2, 0, 0x8fb3c4,
        { rough: 0.2, metal: 0.1, opacity: 0.22, transparent: true, cast: false });
    }

    // ------------------------------------------------------- the two busways
    // A and B, parallel, a metre apart, in identical housings. That is the
    // whole hazard: they look the same because they are the same.
    const busA = group(floor, 0, 2.55, -0.55);
    box(busA, 4.4, 0.22, 0.28, 0, 0, 0, 0x8b929a, { rough: 0.45, metal: 0.6, finish: "brushed", tile: [6, 1] });
    decal(busA, 0.5, 0.11, -1.4, 0, 0.15, signFace("A-SIDE", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.5 }), { px: 192 });
    holoTag(busA, "Busway A — LIVE", 1.5, 0.28, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, busA, "a-side-bus");
    const busB = group(floor, 0, 2.55, 0.55);
    box(busB, 4.4, 0.22, 0.28, 0, 0, 0, 0x8b929a, { rough: 0.45, metal: 0.6, finish: "brushed", tile: [6, 1] });
    const bLabel = decal(busB, 0.5, 0.11, -1.4, 0, 0.15, signFace("B-SIDE", { bg: "#0d1c24", accent: "#38bdf8", fg: "#bfeaf7", scale: 0.5 }), { px: 192 });
    holoTag(busB, "Busway B", 1.5, 0.28, 0, { css: "#38bdf8", w: 0.28 });
    // The plug-in opening the tap-off lands on.
    const opening = box(busB, 0.34, 0.1, 0.3, -0.35, -0.14, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(busB, "Plug-in opening", -0.35, -0.34, 0, { css: "#38bdf8", w: 0.32 });
    hits["plug-opening"] = opening;

    // The tap-off box, on a lift trolley until it goes up.
    const tapOff = group(floor, -1.7, 0.12, 0.9);
    box(tapOff, 0.34, 0.42, 0.3, 0, 0.75, 0, 0x2f6f8c, { rough: 0.5, metal: 0.4, finish: "painted", tile: [1, 1] });
    box(tapOff, 0.3, 0.06, 0.26, 0, 0.99, 0, 0x8b929a, { rough: 0.45, metal: 0.6 });
    cyl(tapOff, 0.03, 0.03, 0.7, 0.1, 0.4, 0.1, 0x22262b, { rough: 0.85, seg: 10, finish: "rubber", cast: false });
    holoTag(tapOff, "Tap-off box — 60 A", 0, 1.16, 0, { css: "#38bdf8", w: 0.38 });
    reg(hits, tapOff, "tap-off");
    const trolley = group(floor, -1.7, 0.12, 0.9);
    box(trolley, 0.5, 0.06, 0.42, 0, 0.5, 0, 0x59636d, { rough: 0.6, metal: 0.4 });
    for (const [dx, dz] of [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.16], [0.2, 0.16]]) {
      cyl(trolley, 0.055, 0.055, 0.04, dx, 0.055, dz, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
      cyl(trolley, 0.02, 0.02, 0.4, dx, 0.28, dz, 0x59636d, { rough: 0.6, metal: 0.4, seg: 8, cast: false });
    }

    // ----------------------------------------------------- panel and permits
    const panel = equipmentCabinet(g, 0.75, 1.65, 0.34, 2.45, -0.5, { ry: -0.55, color: 0x4a5560 });
    holoTag(panel, "Feeder panel", 0, 1.95, 0, { css: "#38bdf8", w: 0.3 });
    const bBreaker = group(panel, 0.16, 1.15, 0.2);
    box(bBreaker, 0.11, 0.2, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const bHandle = box(bBreaker, 0.05, 0.1, 0.05, 0, 0.02, 0.05, 0x38bdf8, { rough: 0.45 });
    holoTag(panel, "B-side feeder", 0.16, 1.4, 0.2, { css: "#38bdf8", w: 0.3 });
    reg(hits, bBreaker, "b-breaker");
    const bLock = lockTag(panel, -0.12, 1.15, 0.2, { color: 0x38bdf8 });
    holoTag(panel, "Lock and tag", -0.12, 1.02, 0.2, { css: "#38bdf8", w: 0.26 });
    reg(hits, bLock, "b-breaker-lock");

    const busMeter = instrument(g, 1.5, 1.15, 1.1, { ry: -0.9, idle: "-- V", color: 0x38bdf8 });
    holoTag(busMeter, "Voltage tester", 0, 0.17, 0, { css: "#38bdf8", w: 0.3 });
    reg(hits, busMeter, "bus-meter");
    const thermal = instrument(g, 1.95, 1.15, 0.45, { ry: -1.1, idle: "-- °C", color: 0xf2c14b });
    holoTag(thermal, "Thermal camera", 0, 0.17, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, thermal, "thermal-camera");

    const chest = toolChest(g, -2.4, -0.3, { ry: 0.8, color: 0x38bdf8 });
    const torqueTool = box(chest, 0.05, 0.05, 0.34, 0.02, 0.8, 0.04, 0xdfe4e8,
      { rough: 0.35, metal: 0.75, finish: "brushed", tile: [1, 2] });
    holoTag(chest, "Torque tool", 0.02, 0.96, 0.04, { css: "#dfe4e8", w: 0.26 });
    reg(hits, torqueTool, "torque-tool");

    // PPE stand and the boundary.
    const ppe = group(g, -2.0, 0, -1.75, 0.5);
    box(ppe, 0.06, 1.6, 0.06, 0, 0.8, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const hood = ball(ppe, 0.15, 0.16, 1.25, 0.04, 0x2f6f8c, { rough: 0.5, metal: 0.1 });
    hood.scale.y = 0.85;
    holoTag(ppe, "Arc hood", 0.16, 1.5, 0.04, { css: "#2f6f8c", w: 0.24 });
    reg(hits, hood, "arc-hood");
    const gloves = box(ppe, 0.2, 0.15, 0.08, -0.2, 0.95, 0.04, 0xf2c14b, { rough: 0.8 });
    holoTag(ppe, "Class 0 gloves", -0.2, 1.14, 0.04, { css: "#f2c14b", w: 0.3 });
    reg(hits, gloves, "arc-gloves");
    const tape = group(g, 1.0, 0, 2.0);
    for (let i = 0; i < 3; i++) {
      box(tape, 0.05, 1.0, 0.05, -0.7 + i * 0.7, 0.5, 0, 0xf2a23b, { rough: 0.6 });
    }
    box(tape, 1.5, 0.05, 0.02, 0, 0.95, 0, 0xf2c14b, { rough: 0.7, cast: false });
    holoTag(tape, "Restricted approach", 0, 1.25, 0, { css: "#f2a23b", w: 0.4 });
    reg(hits, tape, "boundary-tape");

    // Contamination trap and the waste route out.
    const boxes = group(g, 2.15, 0, 1.6);
    box(boxes, 0.42, 0.3, 0.34, 0, 0.15, 0, 0xb08f5a, { rough: 0.95, finish: "concrete", tile: [1, 1] });
    box(boxes, 0.36, 0.26, 0.3, 0.06, 0.43, 0.03, 0xa98552, { rough: 0.95 });
    holoTag(boxes, "Packaging — in the hall", 0, 0.72, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, boxes, "cardboard");
    const cart = group(g, 2.75, 0, 2.1);
    box(cart, 0.5, 0.5, 0.4, 0, 0.35, 0, 0x2f7d4f, { rough: 0.6, finish: "painted", tile: [1, 1] });
    for (const dx of [-0.18, 0.18]) cyl(cart, 0.05, 0.05, 0.04, dx, 0.05, 0.14, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(cart, "Waste cart", 0, 0.75, 0, { css: "#59c97b", w: 0.26 });
    reg(hits, cart, "waste-cart");

    // A neighbouring cabinet's whip, pulled taut across the void.
    const whip = cyl(floor, 0.016, 0.016, 1.1, -0.35, 0.18, 0.72, 0x22262b,
      { rough: 0.85, seg: 8, finish: "rubber", cast: false });
    whip.rotation.z = Math.PI / 2;
    whip.rotation.y = 0.3;
    holoTag(floor, "Power whip", -0.35, 0.38, 0.72, { css: "#f2c14b", w: 0.24 });
    reg(hits, whip, "strained-whip");

    const permit = holoPanel(g, 0.58, 0.42, -2.5, 1.6, 0.9, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#38bdf8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("EEWP · HALL 3 / AISLE 7", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("BUSWAY TAP-OFF — B SIDE", w * 0.06, h * 0.32);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Cannot de-energise: A/B concurrent load", "Incident energy 6.1 cal/cm2 — Cat 2",
       "Restricted approach 0.3 m", "Prove B side at the tap point",
       "Lug torque 42 Nm", "Thermal scan under load before sign-off"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: 0.55 });
    reg(hits, permit, "eewp-permit");
    const noPermit = box(g, 0.4, 0.4, 0.4, -1.3, 1.0, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Just start?", -1.3, 1.35, 1.9, { css: "#f0645b", w: 0.24 });
    reg(hits, noPermit, "no-eewp");

    standingFigure(g, -2.9, 1.9, { ry: 1.1, cloth: 0x2b3138, vest: 0x38bdf8, helmet: 0xf2f2f2 });

    let liveB = true, tapUp = false, arcTimer = 0;
    const arc = particles(busB, 24, 0xbfe9ff, { size: 0.015, life: 0.28 });

    return {
      hits,
      footprint: 2.1,

      onStepComplete(step) {
        if (step.id === "lock-b") { liveB = false; bLock.rotation.z = 0.5; }
        if (step.id === "tile") {
          tile.position.set(-2.3, 0.62, 1.5);
          tile.rotation.z = Math.PI / 2;
          voidHole.visible = true;
          barrier.visible = true;
        }
        if (step.id === "clean") { boxes.visible = false; }
        if (step.id === "hoist") {
          tapUp = true;
          tapOff.position.set(-0.35, 2.28, 0.55);
          trolley.visible = false;
        }
        if (step.id === "stab") { tapOff.position.y = 2.36; }
        if (step.id === "restore") { liveB = true; bHandle.rotation.z = -1.0; }
        if (step.id === "walk") { voidHole.visible = false; tile.position.set(-0.9, 0.07, 0.6); tile.rotation.z = 0; barrier.visible = false; }
      },

      // The B-side label really flips to the contradiction, and the barrier
      // really goes away.
      onInterrupt(it) {
        if (it.id === "wrong-side-tag") {
          repaint(bLabel, signFace("A-FEED?", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.45 }));
          bLabel.material.emissiveIntensity = 1.6;
        }
        if (it.id === "tile-out") barrier.visible = false;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wrong-side-tag") {
          repaint(bLabel, signFace("B-SIDE", { bg: "#0d1c24", accent: "#38bdf8", fg: "#bfeaf7", scale: 0.5 }));
          bLabel.material.emissiveIntensity = 0.85;
        }
        if (it.id === "tile-out") barrier.visible = true;
      },

      onHazard(hitId) {
        if (hitId === "a-side-bus") arcTimer = 0.45;
      },

      animate(t, dt, session) {
        // The floor is alive whether or not anybody is working on it.
        for (let i = 0; i < cabs.length; i += 3) {
          cabs[i].material.emissiveIntensity = 1.2 + Math.sin(t * 3 + i) * 0.5;
        }
        if (arcTimer > 0) {
          arcTimer -= dt;
          arc.visible = true;
          arc.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 1.3, -2.6);
        } else if (arc.visible) arc.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "prove-side") {
          repaint(busMeter.userData.screen, signFace(`${Math.round(gg.t * 500)} V`, {
            bg: "#0d1c24", accent: gg.t < 0.18 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "torque") {
          repaint(torqueTool.userData?.screen ?? busMeter.userData.screen, signFace(`${Math.round(gg.t * 60)}Nm`, {
            bg: "#1c1408", accent: gg.t > 0.44 && gg.t < 0.64 ? "#59c97b" : "#f2c14b", fg: "#ffe3ac", scale: 0.5,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "thermal") {
          repaint(thermal.userData.screen, signFace(`${Math.round(gg.t * 60)}C`, {
            bg: "#1c1408", accent: gg.t < 0.22 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
        void liveB; void tapUp;
      },
    };
  },
};
