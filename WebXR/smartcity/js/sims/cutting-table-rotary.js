import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace } from "../../../shared/kit.js";
import { stationPad, holoTag, toolChest, instrument, standingFigure, rackFrame, rackUnit, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cutting Table and Rotary Knife VR — Sewing & Garment Trades,
// station four. Where the garment actually starts: a spread of cloth cut to
// a paper marker with two different blades — a hand-held rotary knife
// following the tight curves, a stand-up straight knife carrying the long
// straight cuts through the full stack — and every ply in that stack riding
// on the same cut, so an error here is not one piece wrong, it is the whole
// bundle wrong the same way. The cutting room is where a real cut-resistant
// glove, a real guard and a real lockout for the blade change earn their
// place in the same sentence as scissors and shears.

const CTR_ACCENT = 0xd67b4f;

export const SIM_CUTTING_TABLE_ROTARY = {
  id: "cutting-table-rotary",
  index: "175",
  domain: "Garment manufacturing",
  trade: "Industrial sewing machine operator — Workers United (SEIU)",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "ANSI B11 safety requirements for cutting machines, OSHA 29 CFR 1910.212 machine guarding for the rotary and straight knives, 1910.132 hand protection for the cut-resistant glove on the guiding hand, and 1910.147 control of hazardous energy for the blade change — Workers United (SEIU) and state apprenticeship standards for industrial sewing machine operators",
  name: "Cutting Table and Rotary Knife",
  title: simTitle("Cutting Table and Rotary Knife"),
  tagline: "The spread checked, the marker weighted, the glove on, both blades guarded, the ply count right, bundled and ticketed, the blade changed locked out",
  accent: CTR_ACCENT,
  accentCss: "#d67b4f",
  parSeconds: 245,
  footprint: 2.3,
  badge: { id: "cut-clean", name: "Cut Clean", note: "A spread cut to the marker on both blades with the glove on, the guard proven, and the count right" },

  game: system({
    name: "Cutting Room Authority",
    currency: "PLY",
    ranks: ["Floor Trainee", "Cutter", "Lead Cutter", "Cutting Room Lead", "Cutting Room Authority Certified"],
    badges: [
      { id: "blade-locked", name: "Blade Changed Locked Out", note: "Never changed a blade without the power locked out first", test: AWARD.stepClean("lockout") },
      { id: "glove-on", name: "Glove On the Guiding Hand", note: "Never guided fabric bare-handed at either blade", test: AWARD.safe },
      { id: "ply-true", name: "Ply Count True", note: "Ply count held close to the ticket's spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-spread", name: "Clean Spread", note: "No corrections through the whole cut", test: AWARD.clean },
      { id: "steady-cut", name: "Steady Cut", note: "Held both blades' feed without dropping out", test: AWARD.unbroken },
      { id: "cut-fast", name: "Cut Fast", note: "Spread bundled inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "rotary-blade-exposed": "The rotary knife's retractable guard is left open with the blade exposed while it is set down on the table. That guard is spring-loaded to close the instant the knife is not actively cutting for exactly this reason — a blade left exposed on a table full of cloth and hands is a hazard whether or not anyone is holding it right now.",
    "straight-knife-reach-across": "You reached across the straight knife's own blade path instead of walking around it to clear scrap. That vertical blade runs the full height of the stack and does not pause because a hand is passing in front of it to grab something that would have taken two extra steps to reach safely.",
    "bare-hand-guide": "The guiding hand is bare at the cut line instead of wearing the rated glove. A rotary or straight blade does not treat a guiding hand any differently than the twenty-four plies of cloth it is already cutting through — the glove is what the blade meets first, not the skin under it.",
    "spare-blade-exposed": "A fresh replacement blade is sitting loose on the table with its edge uncased. A brand-new blade is sharper than the one it is replacing, and one left exposed instead of in its case is a laceration waiting for whoever's hand lands on the table next, not just the person changing it.",
  },

  lateNotes: {
    "power-switch": "That is the lockout switch for the blade change — nothing needs it yet.",
    "rotary-knife": "Not yet — the spread, the glove and the guard all get checked first.",
    "straight-knife": "The rotary cuts the curves first. The straight knife takes the long straight runs after.",
  },

  steps: [
    {
      id: "spread-check", kind: "select", target: "spread",
      title: "Check the spread",
      cue: "Look down the full length of the spread for wrinkles, slack plies or a shifted edge before cutting anything.",
      why: "Every ply in this stack is about to be cut to the exact same paper marker, so a wrinkle or a slipped edge buried on ply twelve does not stay a small flaw — it becomes a piece cut off-grain or short on every layer above it, and nobody finds it until a sewing operator further down the line cannot get two pieces to match.",
    },
    {
      id: "weight-marker", kind: "drag", target: "weights",
      title: "Weight the marker down",
      cue: "Carry the weights onto the paper marker's corners so it cannot shift while you cut.",
      why: "The paper marker is the only thing telling the blade where every piece's edge actually is, and a marker that creeps even a few millimetres mid-cut moves that line on every ply still under the blade — the weights are what keep the one reference this whole spread is cut against from becoming a moving target.",
      drag: { to: "marker-corner", radius: 0.3, missNote: "Not on the marker's corner — carry the weights fully onto the paper before cutting." },
    },
    {
      id: "glove-on", kind: "select", target: "cut-glove",
      title: "Glove the guiding hand",
      cue: "Pull the rated cut-resistant glove onto the hand that will guide the fabric at the blade.",
      why: "The guiding hand works closer to a moving blade for longer, continuously, than almost any other hand in this whole trade series — the rated glove is graded to resist exactly that contact, and it goes on before either blade is picked up, not after the first close pass proves why it matters.",
    },
    {
      id: "rotary-guard-check", kind: "select", target: "rotary-guard",
      title: "Confirm the rotary knife's guard is free",
      cue: "Check the retractable guard springs closed over the blade the instant you let up on the trigger.",
      why: "A guard that sticks open even once is a guard that is not doing its job the one time it matters — the rotary knife's whole safety case rests on that spring closing every single time the blade is not actively being pressed into the cloth, so it gets proven before the first cut, not assumed from the last time it was used.",
    },
    {
      id: "ply-count", kind: "gauge", target: "ply-gauge",
      title: "Check the ply count",
      cue: "Read the spread's height on the ply gauge against the ticket's count.",
      why: "Too few plies wastes the whole spread's set-up time on an undersized cut; too many and the blade cannot travel cleanly through the bottom layers, leaving pieces that are cut clean on top and ragged or uncut at the base — the count is checked against the ticket before the blade ever enters the stack, not guessed by the height of the pile.",
      gauge: { label: "PLY COUNT", speed: 0.75, green: [0.44, 0.6], readout: (t) => `${Math.round(14 + t * 20)} plies`, missNote: "Off the ticket's ply count — restack the spread to the called-for height before cutting." },
    },
    {
      id: "rotary-cut", kind: "track", target: "rotary-knife", seconds: 6,
      title: "Cut the curves with the rotary knife",
      cue: "Guide the rotary knife along the marker's curved lines at a steady feed.",
      why: "A rotary blade pushed too fast rides up out of the stack and leaves the bottom plies uncut; pushed too slowly it wanders off the marker's line one small correction at a time until the curve is visibly off — a steady feed is what keeps the blade following the line instead of the operator chasing it back onto the line every few inches.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "FEED RATE", readout: (v) => (v < 0.4 ? "too slow — wandering off the line" : v > 0.6 ? "too fast — riding up out of the stack" : "steady") },
      holdBreakNote: "Feed rate broke out of the steady band. Bring the blade back onto the marker's line before continuing.",
    },
    {
      id: "straight-stance", kind: "select", target: "stance-zone",
      title: "Take your stance beside the straight knife's path",
      cue: "Stand to the side of the blade's travel, never directly in front of it, before switching to the straight knife.",
      why: "The straight knife's whole cutting stroke travels in one line, and a body standing anywhere in that line is standing exactly where a stalled cut, a kicked-back stack or a slipped stroke goes — the correct stance is decided before the blade starts moving, not adjusted after it is already running.",
    },
    {
      id: "straight-cut", kind: "track", target: "straight-knife", seconds: 6,
      title: "Cut the long straight runs",
      cue: "Feed the straight knife through the marker's long straight lines at a steady pace from your stance beside the blade.",
      why: "The straight knife carries the full height of the stack in one continuous pass, so an uneven feed here does not just mis-cut a piece, it can bind the blade partway through twenty-plus layers of cloth — the same steady feed that kept the rotary cut clean is what gets this blade through the whole stack in one controlled stroke.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.48, fall: 0.4, drift: 0.13, label: "FEED RATE", readout: (v) => (v < 0.4 ? "too slow — binding in the stack" : v > 0.6 ? "too fast — losing the line" : "steady") },
      holdBreakNote: "Feed rate broke out of the steady band on the straight knife. Bring it back before the stack shifts.",
    },
    {
      id: "bundle-ticket", kind: "sequence",
      targets: ["stack-pieces", "band-bundle", "attach-ticket"],
      itemNames: { "stack-pieces": "pieces stacked by size", "band-bundle": "bundle banded", "attach-ticket": "ticket attached" },
      title: "Bundle and ticket the cut pieces",
      cue: "Stack the cut pieces by size, band the bundle, then attach the cutting ticket.",
      why: "A bundle without its own ticket is a stack of cloth nobody downstream can trace back to a style, a size or a quantity — banding it and ticketing it here is what turns a pile of cut pieces into a bundle a sewing operation can actually run against, the same ticket every operator after this one reads first.",
      outOfOrderNote: "Stack, then band, then ticket — a ticket on an unbanded pile falls off the first time somebody lifts it.",
    },
    {
      id: "lockout", kind: "turn", target: "power-switch",
      title: "Lock out before changing the blade",
      cue: "Turn the straight knife's power off and apply your lock before the blade is touched.",
      why: "A straight knife blade dulls fast against layered cloth and gets changed often enough that skipping the lockout is the easiest habit on this whole floor to fall into — the machine cannot tell the difference between a hand steadying the mount and one about to be in the blade's path the instant it restarts.",
      turn: { turns: 0.5, axis: "y", label: "LOCKOUT" },
    },
    {
      id: "blade-change", kind: "drag", target: "spare-blade",
      title: "Change the blade",
      cue: "Carry the fresh blade from its case into the mount and seat it fully.",
      why: "A blade that is not seated fully in the mount can work loose the first time it meets real resistance in a thick spread, and a loose blade in a straight knife is metal breaking free at whatever speed the motor was turning when it let go — the fresh blade goes in from its case straight to the mount, never carried around loose in a hand first.",
      drag: { to: "blade-socket", radius: 0.3, missNote: "Not seated in the mount — carry the blade fully home before releasing your lock." },
    },
    {
      id: "power-restore", kind: "select", target: "power-switch",
      title: "Remove your lock and restore power",
      cue: "Clear your hands from the blade, remove your lock, then restore power.",
      why: "Your lock, your call — the blade mount is confirmed clear of tools and fingers before power comes back, because the machine restarts able to cut the instant it is live again, not after some grace period to double-check the mount.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["loose-thread-table", "weights-missing"],
      itemNames: { "loose-thread-table": "loose scrap on the cutting surface", "weights-missing": "a marker corner without a weight" },
      itemNotes: {
        "loose-thread-table": "Scrap left on the cutting surface is exactly what the next spread's blade catches on a pass nobody was watching for it.",
        "weights-missing": "A marker corner with no weight on it is the one corner that walks the instant the next cut starts.",
      },
      title: "Walk the table before the next spread",
      cue: "Two things at this station are out of place. Find them by looking.",
      why: "A cut that measured perfectly can still leave the table worse for the next spread — loose scrap and an unweighted corner are both invisible from where the last cut finished, and both become somebody else's mis-cut bundle if they are not caught here first.",
    },
  ],

  // A coworker crosses the straight knife's own path mid-cut, and the guard
  // meant to stop exactly that is found tied back afterward. See
  // shared/game.js.
  interrupts: [
    {
      id: "coworker-crosses-path",
      kind: "Coworker crosses the blade's path",
      after: "straight-cut", delay: 3, seconds: 10,
      alert: "A coworker carrying a bundle cuts straight through the blade's own line of travel to save walking around the table.",
      cue: "Somebody just walked through the blade's path carrying a bundle.",
      target: "power-switch",
      why: "The straight knife's stroke does not stop because someone is mid-crossing in front of it, and a coworker with both hands full of a bundle has no free hand to catch themselves or the blade — the machine comes off the instant anyone enters that line, not after they have already cleared it safely this time.",
      missNote: "The blade kept running while they crossed its path with a full bundle in both hands. Nobody was hurt this time, which says nothing about the next crossing — the stop happens the moment somebody enters the line, not based on how it turns out.",
      wrongNote: "The bundle can wait — the blade needs to stop while somebody is in its path.",
    },
    {
      id: "guard-tied-back",
      kind: "Guard found tied back",
      after: "bundle-ticket", delay: 4, seconds: 12,
      alert: "Coiling the scrap thread by the straight knife, you find its blade guard tied back out of the way with a piece of twine from an earlier shift.",
      cue: "That guard has been tied open, not just left open.",
      target: "guard-tie-back",
      why: "A guard tied back is a guard somebody deliberately defeated, usually to see the cut line better or move faster through a rush order, and it stays defeated for every operator who uses this machine after them until somebody actually notices and cuts the twine — found is not fixed until the guard is actually freed to close again.",
      missNote: "The twine stayed on the guard. The next person to use this straight knife inherits a guard that cannot do its job, with no way of knowing that from looking at the machine running.",
      wrongNote: "That's the tied-back guard — cut it free before moving on to anything else at this machine.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, CTR_ACCENT);
    box(g, 5.0, 0.1, 4.4, 0, 0.05, 0, 0x46403a, { rough: 0.9 });

    // The cutting table: long steel-topped table, the spread and marker.
    const table = group(g, 0, 0.1, -0.6);
    for (const dx of [-1.5, 0, 1.5]) box(table, 0.08, 0.75, 0.7, dx, 0.375, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    box(table, 3.4, 0.05, 0.9, 0, 0.75, 0, 0x8b929a, { rough: 0.45, metal: 0.6 });
    const spread = box(table, 3.0, 0.16, 0.8, 0, 0.855, 0, 0xd8d0bc, { rough: 0.7 });
    reg(hits, spread, "spread");
    const marker = box(table, 2.9, 0.006, 0.76, 0, 0.94, 0, 0xf2eddb, { rough: 0.75 });
    void marker;
    // Marker outlines for a little visual detail.
    for (let i = 0; i < 3; i++) box(table, 0.35, 0.002, 0.24, -0.9 + i * 0.7, 0.945, 0.1, 0x2b2f34, { rough: 0.8, cast: false, receive: false });

    // Weights, unplaced until the drag step lands them.
    const weights = group(g, -1.9, 0.79, -0.9, 0.3);
    for (const dx of [-0.05, 0.05]) cyl(weights, 0.045, 0.045, 0.03, dx, 0, 0, 0x22262b, { rough: 0.5, metal: 0.6, seg: 14 });
    reg(hits, weights, "weights");
    const markerCorner = box(table, 0.1, 0.01, 0.1, -1.35, 0.95, -0.35, 0xffffff, { rough: 0.5 });
    markerCorner.visible = false; hits["marker-corner"] = markerCorner;
    // A second, already-weighted corner, and one left bare for the walk step.
    const weightGood = cyl(table, 0.045, 0.045, 0.03, 1.35, 0.965, -0.35, 0x22262b, { rough: 0.5, metal: 0.6, seg: 14 });
    void weightGood;
    const weightsMissing = box(table, 0.1, 0.01, 0.1, 1.35, 0.95, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, weightsMissing, "weights-missing");

    // Ply gauge, standing beside the spread.
    const plyGauge = instrument(g, -0.3, 0.85, -1.6, { idle: "-- plies", color: CTR_ACCENT, w: 0.13, d: 0.2 });
    holoTag(plyGauge, "ply gauge", 0, 0.15, 0, { css: "#d67b4f", w: 0.24 });
    reg(hits, plyGauge, "ply-gauge");

    // The rotary knife, resting on the table with its guard.
    const rotary = group(table, 0.6, 0.9, 0);
    box(rotary, 0.14, 0.03, 0.04, 0, 0, 0, 0xe86b3a, { rough: 0.5 });
    const rotaryBlade = cyl(rotary, 0.045, 0.045, 0.006, 0.09, -0.01, 0, 0xdfe4e8, { rough: 0.15, metal: 0.9, seg: 20 });
    rotaryBlade.rotation.x = Math.PI / 2;
    reg(hits, rotary, "rotary-knife");
    const rotaryGuard = group(rotary, 0.09, 0, 0, 0.2);
    box(rotaryGuard, 0.05, 0.01, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.5, opacity: 0.75, transparent: true });
    reg(hits, rotaryGuard, "rotary-guard");
    const rotaryExposed = box(rotary, 0.05, 0.01, 0.05, 0.14, -0.005, 0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, rotaryExposed, "rotary-blade-exposed");

    // The straight knife: a stand-up cutting machine at the head of the table.
    const straight = group(g, 1.9, 0.1, -1.5, -0.3);
    box(straight, 0.4, 1.1, 0.3, 0, 0.55, 0, 0x53606b, { rough: 0.55, metal: 0.45 });
    const blade = box(straight, 0.02, 0.9, 0.14, 0, 1.0, 0.1, 0xdfe4e8, { rough: 0.15, metal: 0.9 });
    reg(hits, straight, "straight-knife");
    const bladeReachZone = box(straight, 0.3, 0.9, 0.3, 0, 1.0, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bladeReachZone, "straight-knife-reach-across");
    const stanceZone = box(g, 0.5, 0.02, 0.5, 1.4, 0.005, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, stanceZone, "stance-zone");
    // The guard, and the twine that finds it tied back.
    const straightGuard = box(straight, 0.06, 0.9, 0.04, 0.16, 1.0, 0.1, 0xf2c14b, { rough: 0.5, opacity: 0.7, transparent: true });
    const guardTie = group(straight, 0.16, 1.35, 0.1);
    box(guardTie, 0.14, 0.006, 0.006, 0, 0, 0, 0xc9b070, { rough: 0.6, cast: false });
    reg(hits, guardTie, "guard-tie-back");
    const powerSwitch = group(straight, 0.24, 0.7, 0.16);
    box(powerSwitch, 0.06, 0.08, 0.04, 0, 0, 0, 0x22262b, { rough: 0.5 });
    box(powerSwitch, 0.02, 0.045, 0.02, 0, 0.01, 0.025, 0xd2312b, { rough: 0.5 });
    decal(powerSwitch, 0.09, 0.025, 0, -0.05, 0.022, signFace("LOCKOUT", { bg: "#22262b", accent: "#d67b4f", scale: 0.5 }));
    reg(hits, powerSwitch, "power-switch");
    const bladeSocket = box(straight, 0.06, 0.1, 0.16, 0, 1.35, 0.1, 0xffffff, { rough: 0.5 });
    bladeSocket.visible = false; hits["blade-socket"] = bladeSocket;

    // Spare blade case on the tool chest, exposed sibling on the table.
    const spareBlade = box(g, 0.02, 0.16, 0.1, 2.4, 0.85, -0.3, 0xdfe4e8, { rough: 0.15, metal: 0.9 });
    holoTag(g, "spare blade", 2.4, 0.98, -0.3, { css: "#d67b4f", w: 0.24 });
    reg(hits, spareBlade, "spare-blade");
    const exposedBlade = box(g, 0.02, 0.14, 0.09, -2.0, 0.9, 1.5, 0xdfe4e8, { rough: 0.15, metal: 0.9 });
    reg(hits, exposedBlade, "spare-blade-exposed");

    // Glove and the bare-hand-guide hazard, both at the guiding-hand spot.
    const glove = group(g, -2.2, 0.79, -0.4, 0.3);
    box(glove, 0.02, 0.16, 0.02, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    ball(glove, 0.06, 0, -0.1, 0, 0x3c4a52, { rough: 0.8, seg: 12 });
    holoTag(glove, "cut-resistant glove", 0, 0.06, 0, { css: "#d67b4f", w: 0.36 });
    reg(hits, glove, "cut-glove");
    const bareHandZone = box(table, 0.1, 0.1, 0.1, 0.7, 0.95, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bareHandZone, "bare-hand-guide");

    // Bundle build-up: stacking, banding and the ticket.
    const stack = group(g, -0.6, 0.1, 1.4, 0.2);
    box(stack, 0.4, 0.2, 0.3, 0, 0.1, 0, 0xd8c9a3, { rough: 0.7 });
    reg(hits, stack, "stack-pieces");
    const bandBundle = box(stack, 0.42, 0.02, 0.32, 0, 0.21, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    bandBundle.visible = false; reg(hits, bandBundle, "band-bundle");
    const ticketTag = decal(stack, 0.12, 0.08, 0.24, 0.15, 0, signFace("TKT", { bg: "#0d1c24", accent: "#d67b4f", scale: 0.55 }));
    ticketTag.visible = false; reg(hits, ticketTag, "attach-ticket");

    // Scrap left on the table, for the closing walk.
    const scrapDecoy = box(table, 0.1, 0.006, 0.08, 1.0, 0.95, -0.3, 0x9a8f70, { rough: 0.8 });
    reg(hits, scrapDecoy, "loose-thread-table");

    // -------------------------------------------------------- room dressing
    for (const dz of [1.1, 2.0]) {
      const other = group(g, -2.2, 0.1, 0.4 + dz * 0.4, 1.4);
      box(other, 1.1, 0.75, 0.46, 0, 0.375, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
      box(other, 0.56, 0.26, 0.2, -0.1, 0.9, 0, 0xdfe4e8, { rough: 0.3, metal: 0.6 });
      cyl(other, 0.06, 0.02, 0.26, 0.22, 1.0, 0, 0x22262b, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    }
    const overlockBox = group(g, 2.1, 0.1, 1.7, -0.5);
    box(overlockBox, 0.7, 0.75, 0.5, 0, 0.375, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    box(overlockBox, 0.4, 0.3, 0.3, 0, 0.9, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    holoTag(overlockBox, "overlock", 0, 1.15, 0, { css: "#d67b4f", w: 0.24 });
    const press = group(g, 2.4, 0.1, -0.6, 0.6);
    box(press, 0.5, 1.1, 0.5, 0, 0.55, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    box(press, 0.6, 0.1, 0.6, 0, 1.15, 0, 0x3a4048, { rough: 0.6, metal: 0.5 });
    holoTag(press, "press", 0, 1.35, 0, { css: "#d67b4f", w: 0.2 });

    const threadRack = rackFrame(g, 0, 2.1, { ry: 0, h: 1.1 });
    for (let i = 0; i < 3; i++) rackUnit(threadRack, 0.22 + i * 0.3, ["POLY CORE", "COTTON WRAP", "HEAVY BOND"][i], { css: "#d67b4f" });

    const bolts = group(g, -1.0, 0.1, 2.0, 0.2);
    for (let i = 0; i < 3; i++) cyl(bolts, 0.15, 0.15, 0.7, i * 0.34, 0.15, 0, [0x4f6f8c, 0x8c5a4f, 0x5a8c6f][i], { rough: 0.7, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(bolts, "cloth bolts", 0.34, 0.4, 0, { css: "#d67b4f", w: 0.24 });

    const otherBundle = group(g, 0.4, 0.1, 2.0, -0.3);
    box(otherBundle, 0.4, 0.28, 0.3, 0, 0.14, 0, 0xd0c39a, { rough: 0.7 });
    box(otherBundle, 0.42, 0.02, 0.32, 0, 0.29, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    holoTag(otherBundle, "finished bundle", 0, 0.42, 0, { css: "#d67b4f", w: 0.3 });

    toolChest(g, -2.6, -0.5, { ry: 0.5, color: 0x5b6672 });
    const crewOne = standingFigure(g, -2.7, 1.3, { ry: -0.6, cloth: 0x37505f });
    const crewTwo = standingFigure(g, 2.7, -1.6, { ry: 2.0, cloth: 0x506070 });
    void crewOne; void crewTwo;

    let locked = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "weight-marker") { weights.parent.remove(weights); table.add(weights); weights.position.set(-1.35, 0.955, -0.35); weights.rotation.set(0, 0, 0); }
        if (step.id === "rotary-guard-check") rotaryGuard.rotation.y = 0.2;
        if (step.id === "lockout") locked = true;
        if (step.id === "blade-change") { spareBlade.parent.remove(spareBlade); straight.add(spareBlade); spareBlade.position.set(0, 1.35, 0.1); spareBlade.scale.set(1, 0.6, 1); }
        if (step.id === "power-restore") locked = false;
        if (step.id === "bundle-ticket") {}
        if (step.id === "walk") { scrapDecoy.visible = false; weightsMissing.visible = false; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "coworker-crosses-path") bladeReachZone.scale.set(1.5, 1, 1.5);
        if (it.id === "guard-tied-back") guardTie.position.y = 1.32;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coworker-crosses-path") bladeReachZone.scale.set(1, 1, 1);
        if (it.id === "guard-tied-back") { guardTie.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.sequence?.includes("stack-pieces")) bandBundle.visible = true;
        if (session?.sequence?.includes("band-bundle")) ticketTag.visible = true;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "ply-count") {
          repaint(plyGauge.userData.screen, signFace(`${Math.round(14 + gg.t * 20)}`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#fbe6d8", scale: 0.6 }));
        }
        if (!locked && step?.id === "rotary-cut" && session.holding) rotaryBlade.rotation.z += dt * 16;
        if (!locked && step?.id === "straight-cut" && session.holding) blade.position.y = 1.0 + Math.sin(t * 8) * 0.03;
        if (session?.turn && step?.id === "lockout") powerSwitch.rotation.y = session.turn.amount * Math.PI;
      },
    };
  },
};
