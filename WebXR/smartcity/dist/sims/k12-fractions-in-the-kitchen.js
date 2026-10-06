import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Fractions in the Kitchen. Upper-primary maths in the teaching kitchen: halving and scaling a recipe card with fractions, using only the quantities the card itself shows, with the kitchen's own safety rules kept.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_FRACTIONS_IN_THE_KITCHEN = {
  id: "k12-fractions-in-the-kitchen",
  index: "813",
  domain: "Education",
  trade: "Maths class in the teaching kitchen — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Fractions in the Kitchen",
  title: simTitle("Fractions in the Kitchen"),
  tagline: "Scale every ingredient by the same fraction — and wash your hands before you touch any of it",
  accent: 0x5a9fd8,
  accentCss: "#5a9fd8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"same-fraction","name":"Same Fraction","note":"A recipe scaled by one fraction throughout, measured with the right spoon and checked"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Recipe Board",
    currency: "PORTIONS",
    ranks: ["Helper","Measurer","Scaler","Cook","Chef"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-the-recipe-card-gives") },
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
    "scale-some-ingredients": "You halved some ingredients and not others. Scaling a recipe only works when every quantity is multiplied by the same fraction; change some and not others and the proportions change, and so does what comes out of the oven.",
    "bigger-denominator-means-more": "You said a quarter is more than a half because four is bigger than two. The bottom number says how many equal parts the whole is cut into, so more parts means smaller parts; a quarter is less than a half.",
    "skip-washing-hands": "You started handling ingredients without washing your hands. The kitchen's first rule is clean hands before food, every time; a maths lesson in a kitchen keeps the kitchen's rules.",
    "near-the-hot-hob": "You reached across the hob for the jug. The hob may be hot even when it looks off, and the kitchen supervisor keeps the maths bench well away from it; you walk round, or ask."
  },

  lateNotes: {
    "kfk-recipe-log": "The recipe record is written once the scaling is checked — nothing to record yet.",
    "kfk-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-what-the-recipe-card-gives",
      kind: "find",
      noHint: true,
      targets: [
        "kfk-serves",
        "kfk-quantities",
        "kfk-units"
      ],
      itemNames: {
        "kfk-serves": "how many the recipe serves",
        "kfk-quantities": "the list of quantities",
        "kfk-units": "the units beside each quantity"
      },
      itemNotes: {
        "kfk-serves": "Compare it with how many you need. That gives the scale fraction.",
        "kfk-quantities": "Every one will be multiplied by the same fraction.",
        "kfk-units": "Keep the unit with the number when you scale it."
      },
      decoyNotes: {
        "kfk-picture": "Nice to look at, but it does not help the arithmetic."
      },
      title: "Find what the recipe card gives you",
      cue: "Mark the three things on the recipe card you need before scaling it.",
      why: "Before scaling a recipe, find how many it serves, the list of quantities and the units each quantity is in. With those three, scaling is one calculation repeated; without them, it is guesswork. All the quantities are the ones the card itself shows."
    },
    {
      id: "wash-your-hands-before-touching-ingredients",
      kind: "select",
      target: "kfk-wash-card",
      title: "Wash your hands before touching ingredients",
      cue: "Wash and dry your hands before the lesson starts.",
      why: "Clean hands before food is the kitchen's first rule, and it applies to a maths lesson here as much as to a cooking class. Starting with it every time makes it automatic, which is exactly how professional kitchens keep food safe."
    },
    {
      id: "put-the-scaling-in-order",
      kind: "sequence",
      targets: [
        "kfk-ord-fraction",
        "kfk-ord-scale",
        "kfk-ord-unit",
        "kfk-ord-check"
      ],
      itemNames: {
        "kfk-ord-fraction": "1 · find the scale fraction",
        "kfk-ord-scale": "2 · scale each quantity",
        "kfk-ord-unit": "3 · keep each unit",
        "kfk-ord-check": "4 · check the proportions"
      },
      title: "Put the scaling in order",
      cue: "Find the fraction, scale each quantity, keep the unit, then check.",
      why: "Finding the scale fraction first, from how many you need compared with how many the card serves, gives you one number to use for everything. Scaling each quantity by it, keeping the units, and then checking the proportions still look right is a method that works for any recipe.",
      outOfOrderNote: "Out of order. Find the fraction first, so every quantity uses the same one."
    },
    {
      id: "level-the-spoon-with-a-straight",
      kind: "hold",
      target: "kfk-level-spoon",
      seconds: 6,
      title: "Level the spoon with a straight edge",
      cue: "Hold the spoon steady and level it off with the back of a knife.",
      why: "A heaped spoon can hold a lot more than a level one, which quietly undoes careful arithmetic. Levelling each spoonful makes the measurement match the number you calculated, the same way a scientist reads a measuring cylinder at eye level.",
      holdBreakNote: "The spoon tipped and heaped. Level it again with the straight edge."
    },
    {
      id: "say-which-fraction-is-bigger",
      kind: "select",
      target: "kfk-compare-card",
      title: "Say which fraction is bigger",
      cue: "Say which is bigger, a half or a quarter, and why.",
      why: "A half is bigger than a quarter because the whole is cut into fewer, larger parts. Being able to say why, not just which, is the understanding that stops the commonest fraction mistake."
    },
    {
      id: "spot-the-problems-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kfk-rc-unscaled",
        "kfk-rc-no-unit",
        "kfk-rc-wrong-way"
      ],
      itemNames: {
        "kfk-rc-unscaled": "an ingredient left unscaled",
        "kfk-rc-no-unit": "a quantity with no unit",
        "kfk-rc-wrong-way": "a quarter written as more than a half"
      },
      itemNotes: {
        "kfk-rc-unscaled": "Every quantity gets the same fraction.",
        "kfk-rc-no-unit": "Keep the unit with the number.",
        "kfk-rc-wrong-way": "More parts means smaller parts."
      },
      decoyNotes: {
        "kfk-rc-fraction-written": "Writing the fraction once at the top is good practice. Keep it."
      },
      title: "Spot the problems in a classmate's scaled recipe",
      cue: "Look at the draft scaled recipe and mark each problem.",
      why: "Scaled recipes go wrong in predictable ways: one ingredient left unscaled, a unit lost and a fraction compared the wrong way round. Spotting them in someone else's card helps you check your own."
    },
    {
      id: "turn-the-recipe-from-whole-to",
      kind: "turn",
      target: "kfk-fraction-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "HALF"
      },
      title: "Turn the recipe from whole to half",
      cue: "Turn the dial from the whole recipe to half, for half as many people.",
      why: "Halving is multiplying by one half, and it applies to every quantity equally. Turning the whole recipe to half at once, rather than ingredient by ingredient in your head, keeps the proportions right, and it is the same move a cook makes when fewer people are coming to dinner than the card expects."
    },
    {
      id: "measure-the-halved-amount-accurately",
      kind: "gauge",
      target: "kfk-measure-meter",
      gauge: {
        label: "AMOUNT",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Over or under the halved amount. Pour again carefully.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Measure the halved amount accurately",
      cue: "Commit when the jug shows the halved amount, not over and not under.",
      why: "Measuring accurately is where the fraction meets the real ingredient. Stopping at the halved amount, reading the jug at eye level, is what makes the scaled recipe actually work."
    },
    {
      id: "choose-the-right-measuring-spoon",
      kind: "drag",
      target: "kfk-spoon-token",
      drag: {
        to: "kfk-right-spoon-spot",
        radius: 0.45,
        missNote: "Not in place yet. Take it all the way to the quarter measure."
      },
      title: "Choose the right measuring spoon",
      cue: "Half of a half is needed. Drag the quarter spoon to the ingredient.",
      why: "Half of a half is a quarter, which is why the quarter spoon is the right one here. Choosing the right measure, rather than guessing with the wrong one and hoping, is fractions used for real, and it is the moment the arithmetic on the card becomes food in the bowl."
    },
    {
      id: "keep-the-proportions-right-as-you",
      kind: "track",
      target: "kfk-track-meter",
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
        label: "PROPORTION",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep the proportions right as you combine",
      cue: "Hold the mix in band with the scaled recipe as you combine the ingredients.",
      why: "Combining is where a missed ingredient or a double measure shows up. Checking each addition against the scaled card, one ingredient at a time, keeps the proportions right to the end and catches the slip while it can still be fixed.",
      holdBreakNote: "The mix drifted from the recipe. Check the card before you add the next ingredient."
    },
    {
      id: "record-the-scaled-recipe",
      kind: "select",
      target: "kfk-recipe-log",
      doneLine: "Scaled recipe recorded",
      title: "Record the scaled recipe",
      cue: "Write the scaled quantities with their units and the fraction used.",
      why: "A written scaled recipe can be reused next time and checked by anyone. Recording the fraction at the top shows exactly how every quantity was worked out, so a slip in one line can be found and fixed without redoing the whole card."
    },
    {
      id: "clean-down-the-bench",
      kind: "select",
      target: "kfk-share-board",
      doneLine: "Bench cleaned and put away",
      title: "Clean down the bench",
      cue: "Wipe the bench and put the measures back where they belong.",
      why: "Cleaning down is the kitchen's last rule, as washing hands is its first. It keeps the kitchen safe and clean for the next class, stops a spill becoming a slip, and finishes the lesson the way every professional kitchen finishes a shift."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kfk-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the recipe go? What was hard, and what would you try next time?",
      why: "A short check-in at the end tells the teacher who is confident and who needs another go, and gives every learner a moment to notice what they learned. Nobody is graded here, and the teacher or a trusted adult is there for anyone who wants to talk it through."
    }
  ],

  interrupts: [
    {
      id: "a-pan-starts-to-smoke",
      kind: "Smoking pan",
      after: "level-the-spoon-with-a-straight",
      delay: 3,
      seconds: 12,
      target: "kfk-tell-the-supervisor",
      alert: "A pan left on the hob by another group starts to smoke.",
      cue: "Step back from the hob and tell the kitchen supervisor at once; do not touch it.",
      why: "A smoking pan is the kitchen supervisor's to deal with, not a learner's. Stepping back and telling them straight away keeps everyone safe; touching or moving a hot pan is how burns happen.",
      missNote: "Nobody told the supervisor, and a classmate tried to move the pan and burned a hand.",
      wrongNote: "That does not get the supervisor. Step back and tell them. Choose the response that deals with it now."
    },
    {
      id: "the-supervisor-asks-how-much-for-half",
      kind: "Supervisor question",
      after: "keep-the-proportions-right-as-you",
      delay: 3,
      seconds: 12,
      target: "kfk-say-the-half",
      alert: "The kitchen supervisor points at an ingredient and asks how much you need for the half recipe.",
      cue: "Say the halved amount with its unit.",
      why: "The supervisor is checking the fraction was applied and the unit kept. Answering with the amount and its unit shows both, which is exactly what someone following your recipe will need.",
      missNote: "You gave a number with no unit, and the supervisor could not tell if it was right.",
      wrongNote: "That has no unit. Say the amount and its unit. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x5a9fd8;
    const CSS = "#5a9fd8";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a7d80", base2: "#6c6f72", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e8e2d4", base2: "#dcd6c8", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "kfk-serves", "how many the recipe serves", {});
    bead(-1.42, 1.18, -0.62, "kfk-quantities", "the list of quantities", {});
    bead(-1.03, 1.46, -0.71, "kfk-units", "the units beside each quantity", {});
    bead(-1.08, 0.9, -1.11, "kfk-picture", "the picture of the finished dish", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kfk-ord-fraction", "1 · find the scale fraction", {});
    bead(-0.58, 1.46, -1.44, "kfk-ord-scale", "2 · scale each quantity", {});
    bead(-0.24, 0.9, -1.23, "kfk-ord-unit", "3 · keep each unit", {});
    bead(0, 1.18, -1.55, "kfk-ord-check", "4 · check the proportions", {});
    bead(0.24, 1.46, -1.23, "kfk-level-spoon", "Levelling the measuring spoon", {});
    bead(0.58, 0.9, -1.44, "kfk-rc-unscaled", "an ingredient left unscaled", {});
    bead(0.68, 1.18, -1.05, "kfk-rc-no-unit", "a quantity with no unit", {});
    bead(1.08, 1.46, -1.11, "kfk-rc-wrong-way", "a quarter written as more than a half", {});
    bead(1.03, 0.9, -0.71, "kfk-rc-fraction-written", "the scale fraction written at the top", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kfk-tell-the-supervisor", "Step back and tell the supervisor", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kfk-say-the-half", "Say the halved amount with its unit", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kfk-wash-card", "Wash your hands first", "WASH\nHANDS", { ry: 1.2 });
    dials["kfk-fraction-dial"] = dial(-1.89, -1.4, 0.93, "kfk-fraction-dial", "Whole to half");
    meters["kfk-measure-meter"] = meter(-1.45, -1.85, 0.67, "kfk-measure-meter", "Measured amount");
    tokens["kfk-spoon-token"] = token(-0.92, -2.16, 0.4, "kfk-spoon-token", "Quarter spoon");
    spots["kfk-right-spoon-spot"] = spot(-0.31, -2.33, 0.13, "kfk-right-spoon-spot", "The quarter measure");
    card(0.31, 1.35, -2.33, "kfk-compare-card", "Compare the fractions", "HALF >\nQUARTER", { ry: -0.13 });
    meters["kfk-track-meter"] = meter(0.92, -2.16, -0.4, "kfk-track-meter", "Proportions kept");
    boards["kfk-recipe-log"] = board(1.45, -1.85, -0.67, "kfk-recipe-log", "Recipe record");
    boards["kfk-share-board"] = board(1.89, -1.4, -0.93, "kfk-share-board", "Clean down");
    boards["kfk-checkin"] = board(2.19, -0.85, -1.2, "kfk-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "scale-some-ingredients", "Halve the flour but not the milk?", "HALVE\nSOME", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "bigger-denominator-means-more", "Say a quarter is more than a half because four is bigger?", "QUARTER >\nHALF", 0.3);
    hazardCard(0.58, 0.72, -1.86, "skip-washing-hands", "Start measuring without washing your hands?", "SKIP THE\nSINK", -0.3);
    hazardCard(1.53, 0.72, -1.21, "near-the-hot-hob", "Reach across the hob for the measuring jug?", "REACH\nACROSS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Same fraction, every ingredient."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Maths teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Kitchen supervisor", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-pan-starts-to-smoke"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-pan-starts-to-smoke"].visible = false;
    arrivals["the-supervisor-asks-how-much-for-half"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-supervisor-asks-how-much-for-half"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "choose-the-right-measuring-spoon") { const s = spots["kfk-right-spoon-spot"]; tokens["kfk-spoon-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-scaled-recipe") repaint(boards["kfk-recipe-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Scaled recipe recorded"], "#59c97b"));
        if (step.id === "clean-down-the-bench") repaint(boards["kfk-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Bench cleaned and put away"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kfk-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-which-fraction-is-bigger") paintGuide("Half of a half is a quarter.");
      },

      onHazard() {
        paintGuide("Stop. Did every ingredient get the same fraction?");
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
        if (it.id === "a-pan-starts-to-smoke") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Supervisor told, hob off, pan left to cool. The lesson carries on."); }
        if (it.id === "the-supervisor-asks-how-much-for-half") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Amount and unit given. The supervisor can check it."); }
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
