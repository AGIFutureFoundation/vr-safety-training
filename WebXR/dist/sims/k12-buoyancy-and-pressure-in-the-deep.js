import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Buoyancy and Pressure in the Deep. Upper-primary and lower-secondary science, qualitative only: why things float or sink and why water pushes harder the deeper you go, watched from the Deep's viewing platform with no depth figures stated.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BUOYANCY_AND_PRESSURE_IN_THE_DEEP = {
  id: "k12-buoyancy-and-pressure-in-the-deep",
  index: "807",
  domain: "Education",
  trade: "Science class at the Deep's viewing platform — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Buoyancy and Pressure in the Deep",
  title: simTitle("Buoyancy and Pressure in the Deep"),
  tagline: "Float or sink is a push-up against a pull-down — and deeper water pushes harder",
  accent: 0x4fb88a,
  accentCss: "#4fb88a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"float-or-sink","name":"Float or Sink","note":"Predictions made, tested fairly and explained with the upward push of the water"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Buoyancy Board",
    currency: "BUBBLES",
    ranks: ["Observer","Predictor","Tester","Explainer","Scientist"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-you-will-test") },
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
    "heavy-things-always-sink": "You said heavy things always sink. Whether something rides or sinks depends on how much water it shoves aside compared with its own weight, which is why an iron ship rides the swell while a pebble drops to the seabed. Heavy on its own decides nothing; the shape and the room it takes up in the water matter too.",
    "change-two-things-at-once": "You swapped the shape and the material in one drop. When two things alter at once, the tank cannot tell you which one made the difference; an honest trial alters one thing and keeps the rest exactly as it was.",
    "lean-over-the-viewing-rail": "You leaned over the viewing rail. The rail is there because the lip beyond it is a drop into deep water, and the guide carries the tank to the bench so nobody ever needs to lean; the whole visit happens on the dry side of the rail.",
    "say-pressure-is-the-same-everywhere": "You said the water squeezes the same at every depth. The deeper a diver goes, the more water is stacked above, and the harder it squeezes from every side; that is why the lowest hole in the corked bottle jets furthest, and why the hulls that work in deep water are built so thick."
  },

  lateNotes: {
    "kbd-lab-log": "The lab record is written once the tests are done — nothing to record yet.",
    "kbd-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-what-you-will-test",
      kind: "find",
      noHint: true,
      targets: [
        "kbd-block",
        "kbd-boat",
        "kbd-bottle"
      ],
      itemNames: {
        "kbd-block": "the solid block",
        "kbd-boat": "the same material shaped as a boat",
        "kbd-bottle": "the sealed bottle of air"
      },
      itemNotes: {
        "kbd-block": "A solid lump of material. Predict: float or sink?",
        "kbd-boat": "The same material, a different shape. This is the interesting one.",
        "kbd-bottle": "Mostly air inside. Predict what happens and why."
      },
      decoyNotes: {
        "kbd-platform-sign": "Part of the platform, not the test. Choose the objects on the bench."
      },
      title: "Find what you will test",
      cue: "Tap the three things on the bench that will go into the tank: the solid block, the hull shaped from the same stuff, and the corked bottle with air inside.",
      why: "A trial in the tank starts by choosing what to drop in. Here it is a solid block, the very same material hammered into a hollow hull, and a corked bottle full of air. Each differs from the next in one useful way, which is what lets the tank teach something rather than merely splash."
    },
    {
      id: "take-your-place-behind-the-viewing",
      kind: "select",
      target: "kbd-rail-card",
      title: "Take your place behind the viewing rail",
      cue: "Stand behind the viewing rail; the guide carries the tank to the bench on the dry side.",
      why: "The viewing rail marks the lip of a drop into deep water, and every visit to the platform begins behind it. The guide carries the tank to the bench precisely so curiosity never has to lean over the lip; keeping the platform's rule comes before any trial in the tank."
    },
    {
      id: "put-the-test-in-order",
      kind: "sequence",
      targets: [
        "kbd-ord-predict",
        "kbd-ord-change",
        "kbd-ord-observe",
        "kbd-ord-explain"
      ],
      itemNames: {
        "kbd-ord-predict": "1 · predict",
        "kbd-ord-change": "2 · change one thing",
        "kbd-ord-observe": "3 · observe",
        "kbd-ord-explain": "4 · explain"
      },
      title: "Put the test in order",
      cue: "Write the guess, alter one thing, drop it in and keep eyes on it, then explain with the water's upthrust.",
      why: "Writing the guess down before anything touches the tank means the water can surprise you, and surprise is where the learning lives. Altering a single thing keeps the trial honest, keeping eyes on the tank keeps the notes honest, and explaining with the water's upthrust turns a splash into understanding.",
      outOfOrderNote: "Not that way round. Write the guess before the drop, or the tank cannot surprise you."
    },
    {
      id: "watch-the-boat-settle-without-touching",
      kind: "hold",
      target: "kbd-watch-boat",
      seconds: 6,
      title: "Watch the boat settle without touching it",
      cue: "Hands off: keep eyes on the hull until it settles and its waterline stops moving.",
      why: "Left alone, a hull sinks until the water's upthrust balances its weight, and the waterline it settles at shows that balance. A finger on the rim spoils the reading; patient waiting is what lets the balance the whole platform is about show itself in the tank.",
      holdBreakNote: "You nudged the hull and the waterline jumped. Hands off and let it settle again."
    },
    {
      id: "explain-the-squirting-bottle",
      kind: "select",
      target: "kbd-depth-card",
      title: "Explain the squirting bottle",
      cue: "The corked bottle jets furthest from its lowest hole. Say why.",
      why: "The lowest hole has the most water stacked above it, so the water there squeezes hardest and jets furthest. Explaining that with the weight of water pressing down from above is the understanding of pressure this platform aims at, with no figures needed: deeper means more squeeze."
    },
    {
      id: "spot-the-problems-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kbd-con-weight",
        "kbd-con-unfair",
        "kbd-con-ignored"
      ],
      itemNames: {
        "kbd-con-weight": "floating explained by weight alone",
        "kbd-con-unfair": "a conclusion from an unfair test",
        "kbd-con-ignored": "a result that did not fit, left out"
      },
      itemNotes: {
        "kbd-con-weight": "Weight is only half of it. Where is the water's upward push?",
        "kbd-con-unfair": "Two things changed at once. Which one made the difference?",
        "kbd-con-ignored": "Odd results are kept and discussed, not hidden."
      },
      decoyNotes: {
        "kbd-con-prediction": "Writing the prediction first is good practice. Keep it."
      },
      title: "Spot the problems in a classmate's conclusion",
      cue: "Look over the verdict a classmate wrote on the bench and tap each slip before it goes on the chart.",
      why: "A verdict should follow from the tank and lean on the right idea. The usual slips are blaming weight alone for a sinking, drawing a verdict from a trial that altered two things at once, and leaving out a reading that did not suit. Catching them on a classmate's sheet makes your own verdicts sturdier."
    },
    {
      id: "turn-the-block-into-a-boat",
      kind: "turn",
      target: "kbd-shape-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "BOAT"
      },
      title: "Turn the block into a boat",
      cue: "Turn the dial from the solid block to the hull hammered from the same stuff.",
      why: "Altering only the shape, with the same material and the same amount, is the one-change trial that proves shape decides it. A hollow hull shoves aside far more water, so the water shoves back harder, and the very stuff that sank as a block rides as a hull. That is why an iron ship floats while an iron bolt drops to the seabed."
    },
    {
      id: "load-the-boat-until-it-sits",
      kind: "gauge",
      target: "kbd-load-meter",
      gauge: {
        label: "CARGO",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too light a load teaches nothing; too heavy and the tank has it. Load the hull again.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Load the boat until it sits low but still floats",
      cue: "Commit when the cargo has the hull riding low, its waterline near the rim but still afloat.",
      why: "Every crate of cargo makes the hull ride lower as it shoves aside more water to balance the added weight. Stopping while the rim is still dry shows that balance at its edge, and it is the idea behind the load line painted on a real ship's side. Crews read that line so a hull is never loaded so deep that a wave comes over the rim."
    },
    {
      id: "put-your-result-on-the-class",
      kind: "drag",
      target: "kbd-result-token",
      drag: {
        to: "kbd-results-spot",
        radius: 0.45,
        missNote: "Not on the chart yet. Carry the card all the way to the tank-side chart."
      },
      title: "Put your result on the class board",
      cue: "Drag your reading card onto the tank-side chart beside the other groups' cards.",
      why: "A single reading may be a fluke; a chart of every group's readings shows a pattern. Sliding your card beside the others is how a finding earns trust, and it lets the platform spot a reading that wants a second drop in the tank. Cards side by side show which findings hold water and which were flukes."
    },
    {
      id: "keep-your-observations-matched-to-what",
      kind: "track",
      target: "kbd-track-meter",
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
        label: "HONEST",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep your observations matched to what you see",
      cue: "Keep your notes in band with what the tank actually shows as each object settles to its waterline.",
      why: "It is easy to write down what the guess said instead of what the tank shows. Keeping the notes matched to the waterline, surprises included, is the honesty that makes a reading from the platform worth trusting. A surprise is often where the best question of the whole visit is hiding.",
      holdBreakNote: "Your notes have drifted from the tank. Look at the waterline again and write what you see."
    },
    {
      id: "record-predictions-results-and-explanations",
      kind: "select",
      target: "kbd-lab-log",
      doneLine: "Predictions and results recorded",
      title: "Record predictions, results and explanations",
      cue: "Write each guess, what the tank did, and the explanation in terms of the water's upthrust.",
      why: "Writing the guess beside what the tank did shows where your thinking changed, which is the real proof of learning on the platform. Anyone with the same block, hull and bottle can repeat the drop from your sheet and weigh your explanation against their own tank."
    },
    {
      id: "explain-the-boat-to-the-class",
      kind: "select",
      target: "kbd-share-board",
      doneLine: "Explanation shared",
      title: "Explain the boat to the class",
      cue: "Explain to the group why the hull rides when the block of the same stuff sinks.",
      why: "Explaining the hull and the block to the group, in terms of the water's upthrust, is the surest sign the idea has landed. Classmates whose guess was wrong learn most from an explanation built on the very objects they watched settle. The real objects keep the explanation honest, because anyone can hold it against the tank."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kbd-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "Before the group leaves the platform: what did the tank do that you did not expect, and what would you drop in next?",
      why: "A short round before the group leaves the platform lets the teacher hear which ideas landed and which did not, and gives every learner a moment to name one thing they would drop into the tank next time. Nobody is marked on the platform, and the teacher or a trusted adult is there for anyone who wants to talk more afterwards."
    }
  ],

  interrupts: [
    {
      id: "the-tank-starts-to-overflow",
      kind: "Overflow",
      after: "watch-the-boat-settle-without-touching",
      delay: 3,
      seconds: 12,
      target: "kbd-stop-and-tell-guide",
      alert: "The tank brims over and water runs across the platform decking towards the rail.",
      cue: "Stop pouring, step back off the wet decking and tell the guide.",
      why: "Water across the decking beside a rail is a slip in exactly the wrong spot. Stopping the pour, stepping back and telling the guide, who has the mop and the wet-floor sign, comes before any drop in the tank.",
      missNote: "Nobody told the guide, and a classmate slipped on the wet decking by the rail. Next time, stop the trial and deal with it first.",
      wrongNote: "That does not deal with the water on the decking. Stop and tell the guide. Choose the response that deals with it now."
    },
    {
      id: "the-guide-asks-why-ships-float",
      kind: "Guide question",
      after: "keep-your-observations-matched-to-what",
      delay: 3,
      seconds: 12,
      target: "kbd-explain-push",
      alert: "The platform guide asks how a great iron ship can ride the sea when an iron nut sinks in the tank.",
      cue: "Answer with the hull's shape and the water's upthrust, not with weight alone.",
      why: "The guide is asking whether the hull-and-block reading carries over to something new. Saying that the ship's hollow hull shoves aside a great deal of water, so the upthrust balances its weight, shows the idea has left the tank and reached the sea.",
      missNote: "You said the ship was lighter than it looks, which is not why it rides. Next time, stop the trial and deal with it first.",
      wrongNote: "That is weight alone. Use the hull's shape and the water's upthrust."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4fb88a;
    const CSS = "#4fb88a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6d7470", base2: "#616864", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dfe6e2", base2: "#cfd8d4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a working boat's deck: a rail along the stern, a wheelhouse, coiled lines and a life ring
    void wallMat;
    const rail = group(g, 0, 0, -4.6);
    for (let i = 0; i < 9; i++) cyl(rail, 0.025, 0.025, 1.0, -3.2 + i * 0.8, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 8 });
    box(rail, 6.6, 0.05, 0.05, 0, 1.0, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    box(rail, 6.6, 0.03, 0.03, 0, 0.55, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    const house = group(g, -2.6, 0, -3.9);
    box(house, 1.8, 2.1, 1.2, 0, 1.05, 0, 0xf4f0e6, { rough: 0.7 });
    box(house, 1.5, 0.6, 0.04, 0, 1.5, 0.61, 0x2a3a4a, { rough: 0.3, metal: 0.2 });
    box(house, 1.9, 0.08, 1.3, 0, 2.14, 0, 0xd8a54a, { rough: 0.6 });
    for (const [cx0, cz0] of [[2.4, -3.8], [3.0, -3.3]]) for (let i = 0; i < 3; i++) cyl(g, 0.28 - i * 0.03, 0.28 - i * 0.03, 0.05, cx0, 0.03 + i * 0.05, cz0, 0xd8c04a, { rough: 0.9, seg: 14 });
    const ring = group(g, 3.3, 1.2, -4.55);
    cyl(ring, 0.32, 0.32, 0.06, 0, 0, 0, 0xf0645b, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    cyl(ring, 0.18, 0.18, 0.08, 0, 0, 0, 0xf4f0e6, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    for (const bx of [-3.6, 3.6]) box(g, 0.5, 0.5, 0.5, bx, 0.25, -2.6, 0x6b4a2e, { rough: 0.8 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "kbd-block", "the solid block", {});
    bead(-1.42, 1.18, -0.62, "kbd-boat", "the same material shaped as a boat", {});
    bead(-1.03, 1.46, -0.71, "kbd-bottle", "the sealed bottle of air", {});
    bead(-1.08, 0.9, -1.11, "kbd-platform-sign", "the platform's painted sign", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kbd-ord-predict", "1 · predict", {});
    bead(-0.58, 1.46, -1.44, "kbd-ord-change", "2 · change one thing", {});
    bead(-0.24, 0.9, -1.23, "kbd-ord-observe", "3 · observe", {});
    bead(0, 1.18, -1.55, "kbd-ord-explain", "4 · explain", {});
    bead(0.24, 1.46, -1.23, "kbd-watch-boat", "Watching the boat settle", {});
    bead(0.58, 0.9, -1.44, "kbd-con-weight", "floating explained by weight alone", {});
    bead(0.68, 1.18, -1.05, "kbd-con-unfair", "a conclusion from an unfair test", {});
    bead(1.08, 1.46, -1.11, "kbd-con-ignored", "a result that did not fit, left out", {});
    bead(1.03, 0.9, -0.71, "kbd-con-prediction", "the prediction written first", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kbd-stop-and-tell-guide", "Stop pouring and tell the guide", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kbd-explain-push", "Explain with the water's upward push", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kbd-rail-card", "Stay behind the viewing rail", "BEHIND\nTHE RAIL", { ry: 1.2 });
    dials["kbd-shape-dial"] = dial(-1.89, -1.4, 0.93, "kbd-shape-dial", "Block to boat");
    meters["kbd-load-meter"] = meter(-1.45, -1.85, 0.67, "kbd-load-meter", "Cargo in the boat");
    tokens["kbd-result-token"] = token(-0.92, -2.16, 0.4, "kbd-result-token", "Your result card");
    spots["kbd-results-spot"] = spot(-0.31, -2.33, 0.13, "kbd-results-spot", "On the class results board");
    card(0.31, 1.35, -2.33, "kbd-depth-card", "Deeper water pushes harder", "DEEPER =\nHARDER PUSH", { ry: -0.13 });
    meters["kbd-track-meter"] = meter(0.92, -2.16, -0.4, "kbd-track-meter", "Honest observation");
    boards["kbd-lab-log"] = board(1.45, -1.85, -0.67, "kbd-lab-log", "Lab record");
    boards["kbd-share-board"] = board(1.89, -1.4, -0.93, "kbd-share-board", "Share with the class");
    boards["kbd-checkin"] = board(2.19, -0.85, -1.2, "kbd-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "heavy-things-always-sink", "Say heavy things always sink?", "HEAVY =\nSINKS", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "change-two-things-at-once", "Change the shape and the material in one test?", "CHANGE\nEVERYTHING", 0.3);
    hazardCard(0.58, 0.72, -1.86, "lean-over-the-viewing-rail", "Lean over the viewing rail for a closer look?", "LEAN OVER\nTHE RAIL", -0.3);
    hazardCard(1.53, 0.72, -1.21, "say-pressure-is-the-same-everywhere", "Say the water pushes the same at every depth?", "SAME PUSH\nEVERYWHERE", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Guess, drop, explain."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Platform guide", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-tank-starts-to-overflow"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-tank-starts-to-overflow"].visible = false;
    arrivals["the-guide-asks-why-ships-float"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-guide-asks-why-ships-float"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "put-your-result-on-the-class") { const s = spots["kbd-results-spot"]; tokens["kbd-result-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-predictions-results-and-explanations") repaint(boards["kbd-lab-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Predictions and results recorded"], "#59c97b"));
        if (step.id === "explain-the-boat-to-the-class") repaint(boards["kbd-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Explanation shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kbd-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "explain-the-squirting-bottle") paintGuide("Water shoves up; deeper water squeezes harder.");
      },

      onHazard() {
        paintGuide("Stop. Heavy is not the whole tale — think about the water's upthrust.");
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
        if (it.id === "the-tank-starts-to-overflow") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Guide told, decking mopped and signed. The trial carries on at the bench."); }
        if (it.id === "the-guide-asks-why-ships-float") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Answered with shape and upthrust. The idea has reached the sea."); }
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
