import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — How a Lock Lifts a Boat. Upper-primary science and measuring beside the Mississippi River in Louisiana, from Plaquemine to the New Orleans riverfront: why a river runs higher than the land beside it, how a levee holds it back, and how a lock raises or lowers a boat between two water levels, worked on a model lock and a levee cross-section in the scene.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_LK_HOW_A_LOCK_LIFTS_A_BOAT = {
  id: "k12-lk-how-a-lock-lifts-a-boat",
  index: "965",
  domain: "Education",
  trade: "Science and measuring lesson with a lock and levee crew on the Mississippi — learner and lock operator",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "How a Lock Lifts a Boat",
  title: simTitle("How a Lock Lifts a Boat"),
  tagline: "Two water levels, two gates and one chamber — fill it, empty it and see the boat rise",
  accent: 0x4f86b8,
  accentCss: "#4f86b8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"lock-keeper","name":"Lock Keeper","note":"Worked a model lock in the right order, read the water levels and found how a levee holds the river back"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Lock Board",
    currency: "RIPPLES",
    ranks: ["Puddle","Bayou","Canal","River","Lock Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-the-lock") },
      { id: "no-shortcut", name: "No Shortcuts", note: "No misconception or unsafe shortcut anywhere in the run", test: AWARD.safe },
      { id: "in-the-band", name: "In the Band", note: "Every gauge and meter held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every hold and track carried its full count", test: AWARD.unbroken },
      { id: "quick-and-right", name: "Quick and Right", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-both-gates": "You tried to open both gates together. Water would rush straight through the chamber from the high side to the low side and push the boat hard. A lock only works because one gate stays shut while the water level changes.",
    "lean-over-the-wall": "You leaned over the chamber wall. The walls are tall and the water moves while the chamber fills and empties. Visitors watch from behind the rail, and the lock crew wears life jackets when they work by the edge.",
    "levee-is-just-a-hill": "You said the levee is just a hill. A levee is built on purpose from packed earth, shaped and covered in grass, to hold the river back from the land and the town behind it. Crews walk it and look after it, because it has a job to do.",
    "play-on-the-levee-slope": "You went to slide down the levee. Sliding and digging wear away the grass that keeps the earth in place. Walk on the path on top, and leave the slope for the grass and the crew who inspect it."
  },

  lateNotes: {
    "lkr-lock-log": "The lock record is written once the boat has gone through — nothing to record yet.",
    "lkr-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-parts-of-the-lock",
      kind: "find",
      noHint: true,
      targets: [
        "lkr-upper-gate",
        "lkr-chamber",
        "lkr-lower-gate"
      ],
      itemNames: {
        "lkr-upper-gate": "the upper gate",
        "lkr-chamber": "the chamber",
        "lkr-lower-gate": "the lower gate"
      },
      itemNotes: {
        "lkr-upper-gate": "Faces the higher water.",
        "lkr-chamber": "Where the boat rises or falls.",
        "lkr-lower-gate": "Faces the lower water."
      },
      decoyNotes: {
        "lkr-flag": "It shows the wind, not part of how the lock works."
      },
      title: "Find the parts of the lock",
      cue: "Mark the three parts a lock needs to move a boat between two water levels.",
      why: "A lock is a box of water with a gate at each end. The upper gate faces the higher water and the lower gate faces the lower water. Between them is the chamber, where the boat waits while the water inside rises or falls. Valves let water in or out slowly, so the level changes gently and the boat rides up or down on it."
    },
    {
      id: "put-the-steps-to-raise-a",
      kind: "sequence",
      targets: [
        "lkr-ord-enter",
        "lkr-ord-close",
        "lkr-ord-fill",
        "lkr-ord-open"
      ],
      itemNames: {
        "lkr-ord-enter": "1 · the boat enters from the low side",
        "lkr-ord-close": "2 · the lower gate closes behind it",
        "lkr-ord-fill": "3 · water flows in until the levels match",
        "lkr-ord-open": "4 · the upper gate opens and the boat leaves"
      },
      title: "Put the steps to raise a boat in order",
      cue: "Order the steps that lift a boat from the low water to the high water.",
      why: "A lock follows the same order every time, so the water never rushes through. The boat enters from the low side and the lower gate closes behind it. Water from the high side flows in slowly until the chamber is level with it. Only then does the upper gate open so the boat can leave. Getting the order right is the whole trick.",
      outOfOrderNote: "Out of order. The boat enters and the lower gate closes before any water comes in."
    },
    {
      id: "watch-from-behind-the-rail",
      kind: "select",
      target: "lkr-rail-card",
      title: "Watch from behind the rail",
      cue: "Join the lock operator at the viewing rail beside the control house.",
      why: "The lock walls are tall and the water inside keeps moving as the chamber fills and empties. The rail marks the safe place to stand and still see everything. The lock operator works from the control house, where every gate and valve can be seen, so the class watches from beside it."
    },
    {
      id: "turn-the-wheel-to-swing-the",
      kind: "turn",
      target: "lkr-gate-wheel",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "GATE"
      },
      title: "Turn the wheel to swing the gate open",
      cue: "Turn the gate wheel slowly until the upper gate stands fully open.",
      why: "A lock gate is big and heavy, and it has water on both sides. When the levels match, the push from each side is the same, so the gate can swing easily. Turning the wheel slowly keeps the gate under control. That is why the operator waits for level water before moving any gate."
    },
    {
      id: "read-the-water-level-on-the",
      kind: "gauge",
      target: "lkr-level-meter",
      gauge: {
        label: "LEVEL",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the water line. Read where the water meets the gauge.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the water level on the staff gauge",
      cue: "Commit when the marker sits at the water line on the chamber's staff gauge.",
      why: "A staff gauge is a tall ruler fixed in the water. Reading it tells the operator how high the water stands in the chamber compared with the river outside. When the two readings match, the levels are equal and it is safe to open the gate. Measuring carefully is how the operator knows, not guesses."
    },
    {
      id: "hold-the-valve-open-while-the",
      kind: "hold",
      target: "lkr-valve-hold",
      seconds: 6,
      title: "Hold the valve open while the chamber fills",
      cue: "Hold the model fill valve open until the chamber water reaches the high mark.",
      why: "Water always flows from higher to lower until the two levels are the same. Holding the fill valve open lets water from the high side pour into the chamber and lift the boat. Letting go too soon leaves the chamber lower than the high side, and the upper gate would be pushed shut by the water behind it.",
      holdBreakNote: "The valve closed too soon and the filling stopped. Hold it open until the levels match."
    },
    {
      id: "place-the-grass-mat-on-the",
      kind: "drag",
      target: "lkr-grass-mat",
      drag: {
        to: "lkr-bare-spot",
        radius: 0.45,
        missNote: "Not on the bare patch yet. Place it where the levee has no grass."
      },
      title: "Place the grass mat on the bare levee patch",
      cue: "Drag the model grass mat onto the bare patch on the levee cross-section.",
      why: "A levee is packed earth, and grass roots hold its surface together against rain and river water. A bare patch can wash away and weaken the levee. Placing the grass mat on the patch shows how crews repair a levee before a small problem grows. Looking after the grass is part of looking after the levee."
    },
    {
      id: "spot-what-the-levee-crew-checks",
      kind: "find",
      noHint: true,
      targets: [
        "lkr-seep",
        "lkr-crack",
        "lkr-burrow"
      ],
      itemNames: {
        "lkr-seep": "water seeping at the land-side toe",
        "lkr-crack": "a crack near the top",
        "lkr-burrow": "an animal burrow in the slope"
      },
      itemNotes: {
        "lkr-seep": "Water may be finding a path.",
        "lkr-crack": "The earth may be moving.",
        "lkr-burrow": "A hole can let water in."
      },
      decoyNotes: {
        "lkr-bike": "People use the path, but it is not a levee problem."
      },
      title: "Spot what the levee crew checks",
      cue: "Look along the model levee and mark the three things a crew inspects on its walk.",
      why: "Levee crews walk the levee looking for early signs of trouble. Water seeping out at the bottom of the land side can mean water is finding a path through. A crack or a slump shows the earth is moving. A bare or burrowed patch can let water in. Finding these early lets the crew fix them while they are small."
    },
    {
      id: "say-why-the-river-runs-higher",
      kind: "select",
      target: "lkr-result-card",
      title: "Say why the river runs higher than the land",
      cue: "Choose the sentence that explains why the river can stand above the town beside it.",
      why: "Over a very long time the river dropped mud along its banks when it spilled over, building its edges up. The land behind slowly packed down and sank. That is why, along parts of the lower Mississippi, the river can stand higher than the streets nearby, and why levees and locks matter so much here."
    },
    {
      id: "follow-the-boat-as-it-rises",
      kind: "track",
      target: "lkr-boat-track",
      seconds: 8,
      track: {
        start: 0.3,
        green: [
          0.4,
          0.62
        ],
        rise: 0.46,
        fall: 0.38,
        drift: 0.14,
        label: "FOLLOW",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Follow the boat as it rises in the chamber",
      cue: "Keep the marker on the model boat as the water lifts it up the chamber wall.",
      why: "The boat is not lifted by a crane or a machine. It floats on the water, so when the water in the chamber rises, the boat rises with it. Following the boat up the wall shows that the water does all the lifting. Opening one valve moves a heavy boat with no engine at all.",
      holdBreakNote: "The marker lost the boat. Find it again and follow it up the wall."
    },
    {
      id: "record-the-level-before-and-after",
      kind: "select",
      target: "lkr-lock-log",
      doneLine: "Levels recorded",
      title: "Record the level before and after",
      cue: "Write one line each for the low water, the chamber and the high water.",
      why: "Writing down the level at each stage shows what the lock did. Anyone reading your record can see that the chamber started level with the low water and finished level with the high water. Lock operators keep a log of every boat for the same reason, so the next shift knows what happened."
    },
    {
      id: "explain-the-lock-to-a-partner",
      kind: "select",
      target: "lkr-share-board",
      doneLine: "Lock explained",
      title: "Explain the lock to a partner",
      cue: "Take turns telling a partner how the boat got from the low water to the high water.",
      why: "Explaining something out loud is a good test of whether you really understand it. If your partner can follow your steps, your order was right. Lock crews explain each move to one another by radio before they make it, so everyone knows what is about to happen."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "lkr-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the rail",
      cue: "Why does only one gate open at a time? What does the levee keep out?",
      why: "The operator and the class finish the same way, by checking what everyone understood. Each learner gives one reason for the gate order and one job the levee does. If anyone still thinks a levee is just a hill, the group talks it through now before leaving."
    }
  ],

  interrupts: [
    {
      id: "a-horn-sounds-from-a-towboat",
      kind: "Boat signal",
      after: "hold-the-valve-open-while-the",
      delay: 3,
      seconds: 12,
      target: "lkr-clear-rail",
      alert: "A towboat sounds its horn as it lines up to enter the lock.",
      cue: "Step back from the rail edge and let the lock crew handle the lines.",
      why: "A horn tells the lock crew a boat is coming in. The crew needs room to move along the wall with the lines. Stepping back straight away gives them that room, and good visitors do it without being asked twice.",
      missNote: "The class stayed crowded at the rail, and the crew had to squeeze past with the lines.",
      wrongNote: "That does not give the crew room. Step back and let them work. Choose the response that deals with it now."
    },
    {
      id: "the-operator-asks-about-the-valves",
      kind: "Operator question",
      after: "follow-the-boat-as-it-rises",
      delay: 3,
      seconds: 12,
      target: "lkr-name-valves",
      alert: "The lock operator asks what makes the water flow into the chamber.",
      cue: "Say that water flows from the higher side to the lower side until the levels match.",
      why: "The whole lock depends on one rule: water runs downhill until it is level. The valves just open a path. Knowing the rule shows you understand why a lock needs no pump to lift a boat.",
      missNote: "You could not say what moves the water, and the operator explained before the class went on.",
      wrongNote: "That does not explain the flow. Say which way water moves. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4f86b8;
    const CSS = "#4f86b8";
    stationPad(g, 2.7, ACC);

    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      cyl(m, 0.012, 0.012, y - 0.05, 0, (y - 0.05) / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? ACC, { emissive: o.color ?? ACC, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CSS, w: o.w ?? 0.46 });
      reg(hits, b, id);
      return m;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      cyl(c, 0.014, 0.014, y - 0.1, 0, (y - 0.1) / 2, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const plate = decal(c, o.cw ?? 0.4, o.ch ?? 0.22, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1c1a24", accent: o.accent ?? CSS, scale: 0.36 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.18, 0.002, { css: o.css ?? CSS, w: o.w ?? 0.5 });
      reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.52 });
    const text = (cx, w, h, title, rows, accent = CSS) => {
      cx.fillStyle = "rgba(20,18,26,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff4e2"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.42 + i * 0.14)));
    };
    const board = (x, z, ry, id, label) => {
      const b = group(g, x, 1.55, z, ry);
      box(b, 0.64, 0.4, 0.02, 0, 0, -0.012, ACC, { rough: 0.5, emissive: ACC, ei: 0.25 });
      cyl(b, 0.02, 0.02, 1.35, 0, -0.85, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, 0.6, 0.36, 0, 0, 0, (cx, w, h) => text(cx, w, h, label.toUpperCase(), ["Open"]), { px: 384, glow: true, ei: 0.9 });
      reg(hits, b.userData.face, id);
      return b;
    };
    const meter = (x, z, ry, id, label) => {
      const s = stand(x, z, ry);
      const m = instrument(s, 0, 1.02, 0, { idle: "READY", color: ACC, w: 0.2, d: 0.26 });
      holoTag(s, label, 0, 1.24, 0, { css: CSS, w: 0.46 });
      reg(hits, m, id);
      return m;
    };
    const dial = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.9);
      const dd = cyl(s, 0.09, 0.09, 0.06, 0, 0.95, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 18 });
      box(s, 0.02, 0.02, 0.1, 0, 0.99, 0.05, 0x1a1a1a, { rough: 0.6 });
      holoTag(s, label, 0, 1.15, 0, { css: CSS, w: 0.42 });
      reg(hits, dd, id);
      return dd;
    };
    const token = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const tk = cyl(s, 0.06, 0.06, 0.025, 0, 0.98, 0, 0xd8a54a, { rough: 0.5, seg: 16 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.4 });
      reg(hits, tk, id);
      return tk;
    };
    const spot = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const p = box(s, 0.2, 0.012, 0.2, 0, 0.965, 0, ACC, { emissive: ACC, ei: 0.5, rough: 0.6 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.42 });
      reg(hits, p, id);
      return s;
    };

    // ------------------------------------------------------------ the place
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#707478", base2: "#62666a", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dde4ea", base2: "#c8d2dc", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a lab bench behind the station, a fume cabinet, a reagent rack and an eyewash post
    const back = group(g, 0, 0, -4.7);
    box(back, 6.4, 2.6, 0.12, 0, 1.3, 0, 0xe0dccf, { rough: 0.7 }).material = wallMat;
    const bench = group(g, 0, 0, -4.1);
    box(bench, 4.6, 0.9, 0.7, 0, 0.45, 0, 0x2b2f35, { rough: 0.6 });
    box(bench, 4.7, 0.05, 0.75, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    box(bench, 0.5, 0.02, 0.4, -1.4, 0.94, 0, 0x8aa0a8, { rough: 0.3, metal: 0.5 });
    cyl(bench, 0.02, 0.02, 0.3, -1.4, 1.1, -0.15, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });
    for (let i = 0; i < 6; i++) cyl(bench, 0.05, 0.05, 0.22 + (i % 3) * 0.06, -0.4 + i * 0.28, 1.06, -0.15, [0x7fc4d8, 0xf2c14b, 0xa0e0a0][i % 3], { rough: 0.2, seg: 10 });
    const hood = group(g, 2.9, 0, -4.2);
    box(hood, 1.2, 0.9, 0.8, 0, 0.45, 0, 0xd8d4cc, { rough: 0.6 });
    box(hood, 1.2, 1.3, 0.8, 0, 1.55, 0, 0xc8d8dc, { rough: 0.2, metal: 0.1 });
    box(hood, 1.1, 0.04, 0.7, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    const rack = group(g, -2.9, 0, -4.3);
    box(rack, 1.0, 1.8, 0.34, 0, 0.9, 0, 0x8a8f96, { rough: 0.5, metal: 0.4 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cyl(rack, 0.06, 0.06, 0.24, -0.33 + c * 0.22, 0.32 + r * 0.55, 0.06, [0xd86a4a, 0x4a8ad8, 0xd8c04a, 0x5ab87a][(r + c) % 4], { rough: 0.3, seg: 10 });
    const wash = group(g, 3.6, 0, -2.8);
    cyl(wash, 0.03, 0.03, 1.1, 0, 0.55, 0, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 8 });
    box(wash, 0.3, 0.1, 0.3, 0, 1.12, 0, 0x59c97b, { rough: 0.5 });
    for (const bx of [-0.08, 0.08]) cyl(wash, 0.03, 0.03, 0.08, bx, 1.2, 0, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "lkr-upper-gate", "the upper gate", {});
    bead(-1.42, 1.18, -0.62, "lkr-chamber", "the chamber", {});
    bead(-1.03, 1.46, -0.71, "lkr-lower-gate", "the lower gate", {});
    bead(-1.08, 0.9, -1.11, "lkr-flag", "the flag on the lock house", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "lkr-ord-enter", "1 · the boat enters from the low side", {});
    bead(-0.58, 1.46, -1.44, "lkr-ord-close", "2 · the lower gate closes behind it", {});
    bead(-0.24, 0.9, -1.23, "lkr-ord-fill", "3 · water flows in until the levels match", {});
    bead(0, 1.18, -1.55, "lkr-ord-open", "4 · the upper gate opens and the boat leaves", {});
    bead(0.24, 1.46, -1.23, "lkr-valve-hold", "Hold the fill valve", {});
    bead(0.58, 0.9, -1.44, "lkr-seep", "water seeping at the land-side toe", {});
    bead(0.68, 1.18, -1.05, "lkr-crack", "a crack near the top", {});
    bead(1.08, 1.46, -1.11, "lkr-burrow", "an animal burrow in the slope", {});
    bead(1.03, 0.9, -0.71, "lkr-bike", "a bike on the top path", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "lkr-clear-rail", "Step back and let the crew work", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "lkr-name-valves", "Say water flows from high to low", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "lkr-rail-card", "Behind the rail", "BEHIND\nTHE RAIL", { ry: 1.2 });
    dials["lkr-gate-wheel"] = dial(-1.89, -1.4, 0.93, "lkr-gate-wheel", "Gate wheel");
    meters["lkr-level-meter"] = meter(-1.45, -1.85, 0.67, "lkr-level-meter", "Chamber water level");
    tokens["lkr-grass-mat"] = token(-0.92, -2.16, 0.4, "lkr-grass-mat", "Grass mat");
    spots["lkr-bare-spot"] = spot(-0.31, -2.33, 0.13, "lkr-bare-spot", "The bare levee patch");
    card(0.31, 1.35, -2.33, "lkr-result-card", "State why", "WHY SO\nHIGH?", { ry: -0.13 });
    meters["lkr-boat-track"] = meter(0.92, -2.16, -0.4, "lkr-boat-track", "Boat followed");
    boards["lkr-lock-log"] = board(1.45, -1.85, -0.67, "lkr-lock-log", "Lock record");
    boards["lkr-share-board"] = board(1.89, -1.4, -0.93, "lkr-share-board", "Explain to a partner");
    boards["lkr-checkin"] = board(2.19, -0.85, -1.2, "lkr-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "open-both-gates", "Open both lock gates at once?", "BOTH\nGATES", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "lean-over-the-wall", "Lean over the chamber wall?", "LEAN\nOVER", 0.3);
    hazardCard(0.58, 0.72, -1.86, "levee-is-just-a-hill", "Say a levee is just a grassy hill?", "JUST A\nHILL?", -0.3);
    hazardCard(1.53, 0.72, -1.21, "play-on-the-levee-slope", "Slide down the levee slope?", "SLIDE\nDOWN", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Behind the rail with the operator."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
    const paintGuide = (msg) => repaint(guideFace, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.1; const x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.13;
      for (const word of String(msg).split(" ")) {
        const tt = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(tt)?.width ?? tt.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = tt;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the people (clear of every control)
    const crew = {};
    crew["a"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x3a6a4a, trousers: 0x2b2f35 });
    holoTag(g, "Science teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Lock operator", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Levee crew member", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-horn-sounds-from-a-towboat"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-horn-sounds-from-a-towboat"].visible = false;
    arrivals["the-operator-asks-about-the-valves"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-operator-asks-about-the-valves"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-grass-mat-on-the") { const s = spots["lkr-bare-spot"]; tokens["lkr-grass-mat"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-level-before-and-after") repaint(boards["lkr-lock-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Levels recorded"], "#59c97b"));
        if (step.id === "explain-the-lock-to-a-partner") repaint(boards["lkr-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Lock explained"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["lkr-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-the-river-runs-higher") paintGuide("One gate at a time, water finds its level.");
      },

      onHazard() {
        paintGuide("Stop. Stay behind the rail.");
      },

      onInterrupt(it) {
        const who = arrivals[it.id];
        if (who) { who.visible = true; who.position.z += 0.4; }
        alarmLamp.material = lampLit;
      },
      onInterruptEnd(it) {
        alarmLamp.material = lampOn;
        const who = arrivals[it.id];
        if (it.resolved !== "answered") { if (who) who.rotation.y += 0.6; paintGuide("That one went unanswered. Next time, stop and deal with it first."); return; }
        if (it.id === "a-horn-sounds-from-a-towboat") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class stepped back, the towboat entered. The lesson carries on."); }
        if (it.id === "the-operator-asks-about-the-valves") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Flow explained. The lesson carries on."); }
      },

      animate(tm, dt, session) {
        void tm; void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && meters[session.step?.target]) {
          const [lo, hi] = session.step.gauge.green;
          const ok = gg.t >= lo && gg.t <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "IN BAND" : gg.t < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
        const tr = session?.track;
        if (tr && meters[session.step?.target]) {
          const [lo, hi] = session.step.track.green;
          const ok = tr.v >= lo && tr.v <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "STEADY" : tr.v < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
      },
    };
  },
};
