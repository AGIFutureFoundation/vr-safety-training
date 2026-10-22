import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, concreteFace, gratingFace, asphaltFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Below-Grade Waterproofing & Drainage Board VR — Construction &
// Structural Trades, the Roofers and Waterproofers pack.
//
// An open excavation beside a poured foundation wall: the wall primed and
// hot rubberized-asphalt waterproofing brought down to it, a dimpled
// drainage board staged to press into the fresh membrane before backfill.
// The learner is the waterproofer working the wall from inside the trench,
// with a barricade and a spoil pile at grade above. A generic building, a
// generic excavation; no contractor, engineer or address is named.

const BGWD_PAL = palette("construction");
const BGWD_ACCENT = BGWD_PAL.accent;
const BGWD_CSS = "#f2c14b";

export const SIM_RF_BELOW_GRADE_WATERPROOFING_AND_DRAINAGE_BOARD = {
  id: "rf-below-grade-waterproofing-and-drainage-board",
  index: "rf5",
  domain: "Construction & Structural Trades",
  trade: "Waterproofer applying hot rubberized-asphalt waterproofing and drainage board to a foundation wall inside an open excavation",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OSHA 29 CFR 1926 Subpart P Excavations for the protective system, the barricade and the ladder access; 29 CFR 1926.1053 for the ladder itself; NFPA 51B for the small heater warming the hot material; NRCA and URW below-grade waterproofing practice; Roofers Local 40 apprenticeship and training",
  name: "Below-Grade Waterproofing & Drainage Board",
  title: simTitle("Below-Grade Waterproofing & Drainage Board"),
  tagline: "The excavation plan read, the barricade confirmed and the ladder climbed, a torn roll and a damp patch on the wall found, the wall's moisture checked, the trench air tested, the membrane brought down out of the wind, the heater lit, the wall mopped at a steady rate and its coverage checked, the drainage board pressed in and held, the wall walked for gaps, the day logged, with a gust catching a board at grade and a second worker calling up about fumes pooling below along the way",
  accent: BGWD_ACCENT,
  accentCss: BGWD_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "wall-sealed-clean", name: "Wall Sealed Clean", note: "A wall waterproofed to coverage and boarded before backfill, with the trench edge, the heater and the air all answered for" },

  supportLine: "Roofers Local 40's member assistance programme, or your contractor's employee assistance line",

  game: system({
    name: "Trench Run",
    currency: "SEAL",
    ranks: ["Apprentice", "Wall Hand", "Membrane Runner", "Lead Waterproofer", "Below-Grade Certified"],
    badges: [
      { id: "plan-first", name: "Plan First", note: "The excavation plan read before the ladder was ever climbed", test: AWARD.stepClean("excavation-plan") },
      { id: "steady-wall", name: "Steady Wall", note: "The wall was mopped without a break in pace", test: AWARD.unbroken },
      { id: "never-past-the-barricade", name: "Never Past The Barricade", note: "No step past the spoil pile edge, no primer left open, no board carried across the wind", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-wall", name: "Clean Wall", note: "No corrections anywhere on this run", test: AWARD.clean },
      { id: "on-the-mil", name: "On The Mil", note: "The coverage reading committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "wall-closed", name: "Wall Closed", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "trench-edge-no-barrier": "You are about to step past the stretch of spoil-pile edge with no barricade up. 29 CFR 1926 Subpart P treats the lip of an open excavation as an edge people can go over just as surely as a roof edge, and a barricade around it is what stops a person walking backward with a hose or a roll of membrane from finding that out the hard way.",
    "hot-material-splash": "You are reaching toward the heated pot of rubberized asphalt without your gauntlets on. This material is held well above a temperature that burns skin on contact, the same as a roofing kettle's brew, and it is handled with the same rule — gauntlets and a face shield on before a hand goes anywhere near it.",
    "primer-fumes-pooling": "The primer can is open at the bottom of the trench, and its solvent vapour has nowhere to go in a space this low and this still — it pools instead of dispersing, exactly the way a low corner behind a parapet does, only worse, because a trench does not have an open side for the wind to reach. It is capped between uses, every time.",
    "board-catch-wind": "You are about to carry the drainage board flat across the gust coming over the spoil pile. A board this wide and this light catches wind exactly like an unclipped roof panel does, and a gust that gets under it at the top of a ladder access can as easily pull a person off balance as take the board out of their hands.",
  },

  lateNotes: {
    "heater-valve": "The heater is not lit until the plan, the wall and the trench air have all been checked — not before.",
    "coverage-mil": "Coverage is read once the wall has actually been mopped — there is nothing to check yet.",
    "log-board": "The log is written once the wall has been walked for gaps, not before.",
  },

  steps: [
    {
      id: "excavation-plan", kind: "select", target: "plan-board",
      title: "Read the excavation and waterproofing plan",
      cue: "Read the plan: the protective system for this trench, the barricade line, the ladder access, and the waterproofing coverage specified for the wall.",
      why: "29 CFR 1926 Subpart P puts the protective system, the spoil setback and the access into one plan the competent person has already worked out, and it is read before anyone climbs down rather than assumed from how the trench looked yesterday — soil moves, and what held the wall open yesterday is not a guarantee about today.",
    },
    {
      id: "trench-access", kind: "sequence",
      targets: ["barricade", "ladder"],
      itemNames: { barricade: "barricade confirmed up around the spoil-pile edge", ladder: "ladder climbed down into the trench" },
      outOfOrderNote: "Barricade first — the edge is protected before anyone climbs down into a trench it is supposed to be guarding.",
      title: "Confirm the barricade, then climb down",
      cue: "Confirm the barricade is up around the open edge, then climb down the ladder into the trench facing it, hands on the rails.",
      why: "The barricade protects the edge for everyone walking at grade, and it is confirmed before anyone's attention goes underground with them — a barricade checked after the climb is a barricade that has already had a chance to fail unnoticed. 29 CFR 1926.1053 wants the ladder climbed with both hands free the whole way down.",
    },
    {
      id: "wall-inspect", kind: "find", noHint: true,
      targets: ["torn-roll", "damp-wall-spot"],
      itemNames: { "torn-roll": "a torn membrane roll on the stack", "damp-wall-spot": "a damp patch on the foundation wall" },
      itemNotes: {
        "torn-roll": "One roll on the stack has a split down its core wrap, torn in handling — rolled out anyway, that split becomes a hole in the waterproofing exactly where nobody was looking for one.",
        "damp-wall-spot": "A patch of the wall is still visibly damp from yesterday's rain. Hot rubberized asphalt applied over damp concrete does not bond to it — it bonds to a thin film of water instead, and that film is exactly what lets the whole patch peel off the wall the first time the backfill settles.",
      },
      title: "Inspect the membrane stock and the wall before mopping",
      cue: "Check the membrane rolls for damage and run a hand over the wall's surface, looking for anywhere still damp.",
      why: "A torn roll and a damp wall both fail the same way — invisibly, until the waterproofing they were part of lets water through years after the backfill has gone back in and nobody can see the wall to check either one again.",
    },
    {
      id: "wall-moisture", kind: "gauge", target: "moisture-meter",
      title: "Check the wall's moisture content before priming",
      cue: "Read the moisture meter against the wall and commit only once it sits under the manufacturer's application threshold.",
      why: "A concrete wall that reads dry to the touch can still be carrying moisture just under its surface, and the manufacturer's threshold exists because that hidden moisture is exactly what keeps a primer or a hot-applied membrane from ever actually bonding to the substrate underneath it.",
      gauge: {
        label: "WALL MOISTURE", speed: 0.55, green: [0.1, 0.4],
        readout: (t) => `${Math.round(t * 20)}%`,
        missNote: "Above the manufacturer's threshold. Let the wall dry further and read it again before priming.",
      },
    },
    {
      id: "atmosphere-check", kind: "select", target: "air-monitor",
      title: "Test the trench air before working it for long",
      cue: "Read the air monitor at the bottom of the trench before settling in to mop the wall.",
      why: "A trench this deep does not move air the way open ground does, and solvent primer or an idling heater can both add to what is already sitting still down there. Testing it before committing to a long stretch of work is what turns a trench into a checked space rather than an assumed one.",
    },
    {
      id: "membrane-carry", kind: "drag", target: "membrane-roll",
      title: "Bring the membrane roll down out of the wind",
      cue: "Carry the roll down the ladder access and set it at the wall, keeping it low and out of the gust crossing the top of the trench.",
      why: "A roll carried high across the top of an open trench is exactly where a gust reaches it hardest, and a dropped roll of membrane into a trench with a waterproofer already at the bottom is a falling-object hazard on top of the wind hazard. Kept low and carried down deliberately, it never becomes either.",
      drag: { to: "wall-line", radius: 0.55, missNote: "Not at the wall. Carry the roll all the way down to the wall line before letting go." },
    },
    {
      id: "heater-valve", kind: "turn", target: "heater-valve",
      title: "Light the heater warming the hot material",
      cue: "Open the heater's fuel valve and light it once the pot is in place and clear of anything that could catch.",
      why: "The heater is a small open flame doing the same job a kettle's burner does, warming material well above a temperature that burns — NFPA 51B's open-flame logic applies here at the scale of a trench just as it does to a roof: clear the area, then light it, not the other way round.",
      turn: { turns: 0.4, axis: "z", label: "HEATER VALVE", readout: (t) => (t < 0.5 ? "closed" : "lit") },
    },
    {
      id: "wall-mop", kind: "track", target: "mop-wand", seconds: 6,
      title: "Mop the wall at a steady pace",
      cue: "Spread the hot rubberized asphalt up the wall at a steady pace — too slow cools before the next lift, too fast starves the coverage.",
      why: "Hot rubberized asphalt only bonds and seals while it is still hot and evenly spread, and a wall mopped too slowly cools into ridges before the next lift goes over it, while one mopped too fast leaves thin patches that never reach the specified thickness. A steady pace keeps the whole wall at the coverage the specification calls for.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, label: "MOP SWEEP RATE", readout: (v) => (v < 0.4 ? "too slow — cooling" : v > 0.62 ? "too fast — starved" : "even coverage") },
      holdBreakNote: "The sweep broke out of the steady band. Bring the wand back to a steady pace before the material cools unevenly.",
    },
    {
      id: "coverage-mil", kind: "gauge", target: "coverage-mil",
      title: "Check the wet film coverage on the wall",
      cue: "Press the wet-film gauge into the fresh membrane and commit once the reading sits inside the specification's thickness band.",
      why: "A wall that looks fully coated can still be thin in patches, and a thin patch of below-grade waterproofing is invisible from the day the backfill goes in until the day water finds it from the inside. The gauge is what turns 'looks coated' into a thickness the specification can actually stand behind.",
      gauge: {
        label: "WET FILM THICKNESS", speed: 0.55, green: [0.42, 0.6],
        readout: (t) => `${Math.round(60 + t * 60)} mils`,
        missNote: "Off the specification's thickness band. Mop the light patch again before it skins over.",
      },
    },
    {
      id: "board-place", kind: "drag", target: "drainage-board",
      title: "Bring the drainage board to the fresh membrane",
      cue: "Carry the board down to the wall while the membrane is still tacky enough to take it.",
      why: "Drainage board only presses into a membrane that is still tacky — set against a wall that has already skinned over, it just leans there loose, ready to slide the moment the backfill starts going in around it.",
      drag: { to: "wall-line", radius: 0.55, missNote: "Not at the wall. Carry the board all the way down while the membrane is still tacky." },
    },
    {
      id: "board-seat", kind: "hold", target: "drainage-board-seat", seconds: 4,
      title: "Press and hold the board into the membrane",
      cue: "Press the board flat against the fresh membrane and hold it there until it has taken.",
      why: "A board pressed on and released immediately can spring back off a membrane that has not quite grabbed it yet, leaving a gap between the board and the wall that becomes a channel for water to travel down instead of the drainage plane it was installed to be. Held until it has actually taken, it stays where it was pressed.",
      holdBreakNote: "The board came off before the membrane had taken it — press it back on and hold a little longer.",
    },
    {
      id: "wall-walk", kind: "find", noHint: true,
      targets: ["gap-in-coverage", "board-seam-open"],
      itemNames: { "gap-in-coverage": "a gap in the membrane coverage", "board-seam-open": "a drainage board seam left open" },
      itemNotes: {
        "gap-in-coverage": "A hand-width of the wall was never mopped — it will not show as a leak until the backfill has settled around it and the wall is no longer visible to fix.",
        "board-seam-open": "Two boards meet here without their seam taped or overlapped — water will find the open seam and run behind the board instead of down it, straight back to the wall it was installed to protect.",
      },
      title: "Walk the finished wall for what the plan says should already be closed",
      cue: "Walk the wall against the plan: find the stretch of membrane that never got mopped and the board seam that was never closed.",
      why: "Once the backfill goes back in, this wall is not visible again for the life of the building, which makes the walk-round with the plan in hand the last real chance to catch a skipped patch or an open seam before it becomes a foundation leak years from now.",
    },
    {
      id: "log-board", kind: "select", target: "log-board",
      title: "Log the wall, the finds and the coverage",
      cue: "Write the torn roll discarded, the damp patch dried and mopped, the gap closed, and the coverage readings into the log.",
      why: "This wall disappears behind backfill the same day it is finished, so the log is the only record anyone will ever have of what actually went onto it — the next engineer who has to explain a leak reads this log before they ever get a shovel near the wall again.",
    },
    {
      id: "crew-checkin", kind: "select", target: "radio",
      title: "Check in with the spotter at grade",
      cue: "Radio the spotter watching the trench from grade: the wall is boarded, the plan is closed out, and name the support line.",
      why: "Nobody working alone at the bottom of an open trench should be out of contact with someone at grade, and a short check-in when the wall is finished is what lets the spotter stand down knowing the person they have been watching all shift is on their way back up the ladder.",
    },
  ],

  interrupts: [
    {
      id: "gust-catches-board",
      kind: "Gust catches a board at grade",
      after: "board-place", delay: 2, seconds: 14,
      alert: "A gust catches the next drainage board staged at grade, and it starts sliding flat toward the open trench edge.",
      cue: "Get to grade and set the board down flat before it slides over the edge onto anyone below.",
      target: "board-flat",
      why: "A board sliding toward an open trench edge is a falling-object hazard for whoever is working at the bottom of it, which is exactly why boards are staged flat and weighted rather than left to lean where a gust can pick them up — setting it down flat the moment it starts moving is the fastest way to take the wind's leverage away from it.",
      missNote: "The board slid over the spoil-pile edge and dropped into the trench, missing the wall by less than its own width.",
      wrongNote: "That does not stop a sliding board. Get to it and set it down flat before it reaches the edge.",
    },
    {
      id: "fumes-in-trench",
      kind: "Worker below reports fumes",
      after: "wall-mop", delay: 3, seconds: 14,
      alert: "The waterproofer working the far end of the wall radios that the primer smell has gotten strong enough to make their eyes water.",
      cue: "Cap the open primer can that is pooling fumes at this end of the trench.",
      target: "primer-can",
      why: "A trench holds still air the way a low corner behind a parapet does, only more completely, and solvent vapour from an open can has nowhere to go but into whatever the two of you are both breathing down there. Capping it is the only thing that stops adding to what has already pooled.",
      missNote: "The can stayed open and the fumes kept building at the far end of the trench until the other waterproofer had to climb out to clear their head.",
      wrongNote: "Not that. Cap the primer can that is filling the trench with fumes.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BGWD_ACCENT);

    // ------------------------------------------------------------ grade level: spoil pile, barricade
    const gradeTex = surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#4a4038", base2: "#3e352e", lanes: 0 }), { repeat: 3, px: 384 });
    const grade = box(g, 6.4, 0.24, 5.6, 0, 0.12, 0, 0xffffff);
    grade.material = texturedMat(gradeTex, { rough: 0.95, metal: 0.0, color: 0x8a7a68 });
    grade.receiveShadow = true;
    // The trench: a cut pit in the raised pad, per the footgun note.
    const pitDepth = 1.6;
    const trench = group(g, 0.6, 0.24, -0.4);
    box(trench, 3.6, 0.02, 2.6, 0, -pitDepth, 0, 0x2a2521, { rough: 1.0, cast: false });
    for (const [sx, sw] of [[-1.8, 0.06], [1.8, 0.06]]) box(trench, sw, pitDepth, 2.6, sx, -pitDepth / 2, 0, 0x3a332c, { rough: 0.95, cast: false });
    box(trench, 3.72, pitDepth, 0.06, 0, -pitDepth / 2, -1.3, 0x3a332c, { rough: 0.95, cast: false });
    box(trench, 3.72, pitDepth, 0.06, 0, -pitDepth / 2, 1.3, 0x3a332c, { rough: 0.95, cast: false });
    // Foundation wall along the far side of the trench.
    const wallTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom", tone: "#8a8d89", tone2: "#7d7f7b" }), { repeat: 2, px: 320 });
    const wall = box(trench, 3.6, pitDepth + 0.6, 0.2, 0, -pitDepth / 2 + 0.3, -1.33, 0xffffff);
    wall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0xb8bcb6 });
    const wallLineMark = box(trench, 3.4, 0.4, 0.1, 0, -pitDepth + 0.4, -1.25, 0xd8c88a, { opacity: 0.4, transparent: true, cast: false });
    holoTag(trench, "wall line", 0, -pitDepth + 0.9, -1.25, { css: BGWD_CSS, w: 0.22 });
    reg(hits, wallLineMark, "wall-line");
    const dampSpot = box(wall, 0.4, 0.3, 0.02, 0.9, -0.2, 0.11, 0x4a4a44, { rough: 0.95 });
    reg(hits, dampSpot, "damp-wall-spot");
    const wetMembrane = box(trench, 3.4, 1.5, 0.03, 0, -pitDepth / 2 + 0.3, -1.22, 0x1a1614, { rough: 0.3 });
    wetMembrane.visible = false;

    // Barricade around the spoil-pile edge, with a deliberate gap.
    for (const [x0, x1] of [[-2.4, -0.6], [0.2, 2.6]]) {
      const cx0 = (x0 + x1) / 2, len = x1 - x0;
      box(g, len, 0.04, 0.03, cx0, 1.02, 0.9, BGWD_PAL.trim, { rough: 0.5, metal: 0.5 });
      box(g, len, 0.04, 0.03, cx0, 0.58, 0.9, BGWD_PAL.trim, { rough: 0.5, metal: 0.5 });
      for (let x = x0; x <= x1 + 0.001; x += (x1 - x0) / Math.round((x1 - x0) / 0.55)) {
        cyl(g, 0.018, 0.018, 1.05, x, 0.52, 0.9, BGWD_PAL.trim, { rough: 0.5, metal: 0.5, seg: 8 });
      }
    }
    const barricadeGap = box(g, 0.8, 0.6, 0.1, -0.2, 0.55, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "confirm barricade", -0.2, 1.3, 0.9, { css: BGWD_CSS, w: 0.32 });
    reg(hits, barricadeGap, "barricade");
    const trenchEdgeGap = box(g, 0.8, 0.3, 0.1, 2.1, 0.4, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "gap in the barricade?", 2.1, 0.6, 0.9, { css: "#d2312b", w: 0.44 });
    reg(hits, trenchEdgeGap, "trench-edge-no-barrier");

    // Ladder into the trench.
    const ladder = group(trench, -1.5, 0, 1.0, -0.2);
    for (const sx of [-0.24, 0.24]) cyl(ladder, 0.025, 0.025, pitDepth + 0.6, sx, -pitDepth / 2 + 0.3, 0, 0xd9a441, { rough: 0.5, metal: 0.4, seg: 8 });
    for (let i = 0; i < 8; i++) box(ladder, 0.4, 0.03, 0.03, 0, -pitDepth + i * 0.28, 0, 0xd9a441, { rough: 0.5 });
    holoTag(ladder, "ladder", 0, 0.6, 0, { css: BGWD_CSS, w: 0.2 });
    reg(hits, ladder, "ladder");

    // ------------------------------------------------------------ materials at the wall
    const rollStack = group(trench, 1.2, -pitDepth + 0.2, 0.5);
    for (let i = 0; i < 2; i++) { const r = cyl(rollStack, 0.14, 0.14, 0.8, i * 0.3, 0.14, 0, 0x1c1815, { rough: 0.85, seg: 14 }); r.rotation.z = Math.PI / 2; }
    holoTag(rollStack, "membrane rolls", 0.15, 0.4, 0, { css: BGWD_CSS, w: 0.28 });
    reg(hits, rollStack, "membrane-roll");
    const tornRoll = box(rollStack, 0.03, 0.02, 0.06, 0.3, 0.28, 0, 0x8a4a2a, { rough: 0.9 });
    reg(hits, tornRoll, "torn-roll");

    const moisture = group(trench, 0.4, -pitDepth + 0.6, -1.1);
    box(moisture, 0.1, 0.14, 0.03, 0, 0, 0, 0x2b2b30, { rough: 0.5 });
    const moistureFace = decal(moisture, 0.08, 0.05, 0, 0.03, 0.017, signFace("--%", { bg: "#0d1c24", accent: BGWD_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 128 });
    holoTag(moisture, "moisture meter", 0, 0.18, 0, { css: BGWD_CSS, w: 0.3 });
    reg(hits, moistureFace, "moisture-meter");

    const airMonitor = group(trench, 1.6, -pitDepth + 0.3, 0.9);
    box(airMonitor, 0.08, 0.1, 0.03, 0, 0, 0, 0x2b2b30, { rough: 0.5 });
    holoTag(airMonitor, "air monitor", 0, 0.16, 0, { css: BGWD_CSS, w: 0.24 });
    reg(hits, airMonitor, "air-monitor");

    const heater = group(trench, -0.6, -pitDepth + 0.25, 0.6);
    cyl(heater, 0.14, 0.15, 0.3, 0, 0.15, 0, BGWD_PAL.structure, { rough: 0.55, metal: 0.4, seg: 16 });
    const heaterHandle = box(heater, 0.03, 0.08, 0.02, 0.14, 0.15, 0, BGWD_PAL.accent, { rough: 0.5 });
    heater.userData.wheel = heaterHandle;
    holoTag(heater, "heater valve", 0, 0.36, 0, { css: BGWD_CSS, w: 0.26 });
    reg(hits, heater, "heater-valve");
    const flame = ball(heater, 0.04, 0, 0.02, 0.16, 0x4fa8ff, { emissive: 0x4fa8ff, ei: 3.0, seg: 10 });
    flame.visible = false;

    const mopWand = group(trench, 0.2, -pitDepth + 0.4, -0.9, -0.4);
    cyl(mopWand, 0.015, 0.02, 0.6, 0, 0.02, 0, 0x8a7048, { rough: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(mopWand, "mop wand", 0, 0.2, 0, { css: BGWD_CSS, w: 0.2 });
    reg(hits, mopWand, "mop-wand");

    const scale = group(trench, -0.2, -pitDepth + 0.5, -1.0);
    box(scale, 0.1, 0.08, 0.02, 0, 0, 0, 0x2b2b30, { rough: 0.5 });
    const scaleFace = decal(scale, 0.08, 0.04, 0, 0.05, 0.011, signFace("-- mil", { bg: "#0d1c24", accent: BGWD_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 128 });
    holoTag(scale, "wet film gauge", 0, 0.14, 0, { css: BGWD_CSS, w: 0.3 });
    reg(hits, scaleFace, "coverage-mil");

    const boardStack = group(trench, 1.3, -pitDepth + 0.2, 1.0);
    for (let i = 0; i < 3; i++) box(boardStack, 0.9, 0.03, 1.0, 0, 0.02 + i * 0.05, 0, 0x2f4f6f, { rough: 0.7 });
    holoTag(boardStack, "drainage board", 0, 0.4, 0, { css: BGWD_CSS, w: 0.26 });
    reg(hits, boardStack, "drainage-board");
    const boardSeat = box(trench, 0.9, 1.4, 0.06, 0.2, -pitDepth / 2 + 0.35, -1.2, 0x2f4f6f, { rough: 0.7, opacity: 0.001, transparent: true, cast: false });
    holoTag(trench, "press board here", 0.2, -pitDepth + 0.7, -1.2, { css: BGWD_CSS, w: 0.3 });
    reg(hits, boardSeat, "drainage-board-seat");
    const boardOnWall = box(trench, 0.9, 1.4, 0.03, 0.2, -pitDepth / 2 + 0.35, -1.18, 0x2f4f6f, { rough: 0.7 });
    boardOnWall.visible = false;

    // Wall-walk find markers.
    const gapMark = box(trench, 0.4, 0.3, 0.03, -1.0, -pitDepth + 1.0, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trench, "gap in coverage", -1.0, -pitDepth + 1.3, -1.2, { css: BGWD_CSS, w: 0.24 });
    reg(hits, gapMark, "gap-in-coverage");
    const seamMark = box(trench, 0.3, 0.4, 0.03, 1.5, -pitDepth + 1.0, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trench, "open board seam", 1.5, -pitDepth + 1.3, -1.2, { css: BGWD_CSS, w: 0.28 });
    reg(hits, seamMark, "board-seam-open");

    // Hazards: hot material, primer, wind board at grade.
    const hotPot = group(heater, 0, 0.32, 0);
    cyl(hotPot, 0.16, 0.16, 0.1, 0, 0.05, 0, 0x2b2f33, { rough: 0.5, metal: 0.5, seg: 16 });
    holoTag(hotPot, "hot material — gauntlets on?", 0, 0.3, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, hotPot, "hot-material-splash");
    const primer = group(trench, -1.0, -pitDepth + 0.2, -0.5);
    cyl(primer, 0.06, 0.06, 0.12, 0, 0.06, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    holoTag(primer, "primer can — capped?", 0, 0.3, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, primer, "primer-can");
    const primerOpenHit = box(primer, 0.14, 0.05, 0.14, 0, 0.16, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, primerOpenHit, "primer-fumes-pooling");
    const fumes = particles(g, 40, 0x9a9a70, { size: 0.045, life: 1.3, opacity: 0.45 });
    fumes.position.set(0.6 - 1.0, -pitDepth + 0.24 + 0.3, -0.4 - 0.5);
    fumes.visible = false;

    const boardAtGrade = group(g, 2.4, 0.24, 1.6);
    box(boardAtGrade, 0.9, 0.02, 1.0, 0, 0.01, 0, 0x2f4f6f, { rough: 0.7 });
    holoTag(boardAtGrade, "board catching wind?", 0, 0.3, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, boardAtGrade, "board-catch-wind");
    const boardFlat = box(g, 0.9, 0.02, 1.0, 2.4, 0.256, 1.6, 0x2f4f6f, { rough: 0.7 });
    boardFlat.visible = false;
    reg(hits, boardFlat, "board-flat");

    // ------------------------------------------------------------ crew, chest, boards
    const spotter = standingFigure(g, 1.3, 2.6, { ry: 2.4, vest: 0xd8f23a, helmet: BGWD_PAL.accent, gloves: true });
    holoTag(spotter, "spotter at grade", 0, 2.0, 0, { css: BGWD_CSS, w: 0.3 });
    const otherWorker = standingFigure(trench, 1.8, -1.0, { ry: -1.2, vest: 0xd8f23a, gloves: true, atStation: true });
    otherWorker.position.y = -pitDepth + 0.05;
    holoTag(otherWorker, "waterproofer, far end", 0, 1.9, 0, { css: BGWD_CSS, w: 0.4 });
    const chest = toolChest(g, -2.0, 2.3, { ry: 2.2, color: BGWD_PAL.structure });
    chest.position.y = 0.24;
    const radio = instrument(chest, -0.14, 0.79, -0.04, { ry: -0.3, idle: "CH 3 · TRENCH", color: BGWD_PAL.accent, w: 0.1, d: 0.16 });
    holoTag(radio, "radio", 0, 0.16, 0, { css: BGWD_CSS, w: 0.24 });
    reg(hits, radio, "radio");

    const plan = holoPanel(g, 0.95, 0.64, -2.5, 1.6, 1.7, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = BGWD_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("EXCAVATION + WATERPROOFING PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Protective system: per the competent person", "Barricade at the spoil-pile edge",
       "Coverage: per the specification", "Moisture threshold: per the manufacturer",
       "NRCA + URW below-grade practice"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.7, accent: BGWD_ACCENT });
    reg(hits, plan, "plan-board");
    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.35, 0.2, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = BGWD_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("WALL LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Wall: —", "Finds: —", "Coverage: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.1, accent: BGWD_ACCENT });
    reg(hits, log, "log-board");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "wall-inspect") { tornRoll.material = mat(0x59c97b); dampSpot.material = mat(0x59c97b); }
        if (step.id === "heater-valve") flame.visible = true;
        if (step.id === "wall-mop") wetMembrane.visible = true;
        if (step.id === "board-seat") boardOnWall.visible = true;
        if (step.id === "log-board") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf0c8"; cx.fillText("WALL LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Wall: mopped + boarded", "Finds: roll + damp patch + gap", "Coverage: on the specification"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("WALL SEALED", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.38 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-catches-board") boardAtGrade.rotation.z = 0.5;
        if (it.id === "fumes-in-trench") fumes.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-catches-board") { boardAtGrade.rotation.z = 0; boardFlat.visible = true; }
        if (it.id === "fumes-in-trench") fumes.visible = false;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "heater-valve") heaterHandle.rotation.x = session.turn.amount * Math.PI * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wall-moisture") {
          repaint(moistureFace, signFace(`${Math.round(gg.t * 20)}%`, { bg: "#0d1c24", accent: gg.t <= 0.4 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (gg && !gg.committed && step?.id === "coverage-mil") {
          repaint(scaleFace, signFace(`${Math.round(60 + gg.t * 60)} mil`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (flame.visible) flame.scale.setScalar(0.85 + 0.3 * Math.abs(Math.sin(t * 22)));
        if (fumes.visible) fumes.userData.step(dt ?? 0.016, new THREE.Vector3(0, 0, 0), 0.05, 0.2, -0.2);
        void paperFace; void gratingFace; void CITY;
      },
    };
  },
};
