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
    "heavy-things-always-sink": "You said heavy things always sink. Whether something floats depends on how much water it pushes aside compared with its own weight, which is why a large ship floats and a small stone sinks. Heavy on its own does not decide it; the shape and the space it takes up matter too.",
    "change-two-things-at-once": "You changed the shape and the material in the same test. When two things change at once, you cannot tell which one made the difference; a fair test changes one thing and keeps the rest the same.",
    "lean-over-the-viewing-rail": "You leaned over the viewing rail. The rail is there because the edge is a drop into water, and the guide brings the test tank to the bench so nobody needs to lean; the lesson happens on the safe side of the rail.",
    "say-pressure-is-the-same-everywhere": "You said the water pushes the same at every depth. The deeper you go, the more water is above, and the harder it pushes from every side; that is why the holes lower down on the test bottle squirt furthest, and why deep-water equipment is built so strongly."
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
      cue: "Mark the three objects on the bench you will predict and test.",
      why: "A good test starts with a clear set of things to try. Here that is a solid block, the same material shaped into a hollow boat, and a sealed bottle with air inside. Picking objects that differ in one useful way each is what lets the results teach something rather than just entertain."
    },
    {
      id: "take-your-place-behind-the-viewing",
      kind: "select",
      target: "kbd-rail-card",
      title: "Take your place behind the viewing rail",
      cue: "Stand behind the rail; the guide brings the test tank to the bench.",
      why: "The viewing rail marks the edge of a drop into water, and every visit starts behind it. The guide brings the test tank to the bench precisely so that curiosity never needs to lean over anything; following the platform's rule comes before the experiment."
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
      cue: "Predict, test one change, observe, explain.",
      why: "Writing a prediction before testing means the result can surprise you, which is where learning happens. Changing one thing at a time keeps the test fair, observing carefully keeps it honest, and explaining in terms of the water's upward push turns a result into understanding.",
      outOfOrderNote: "Out of order. Predict before you test, or the result cannot surprise you."
    },
    {
      id: "watch-the-boat-settle-without-touching",
      kind: "hold",
      target: "kbd-watch-boat",
      seconds: 6,
      title: "Watch the boat settle without touching it",
      cue: "Keep still and watch where the boat settles in the water.",
      why: "Watching an object settle, without nudging it, shows how low it sits once the water's upward push balances its weight. Touching it spoils the observation; patient watching is what lets you see the balance the whole topic is about.",
      holdBreakNote: "You nudged the boat and spoiled the observation. Let it settle again on its own."
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
      cue: "Turn the dial from the solid block to the same material shaped as a boat.",
      why: "Changing only the shape, and keeping the same material and amount, is the fair test that shows shape matters. A hollow shape pushes aside more water, so the water pushes up harder, and the same material that sank can float."
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
        missNote: "Outside the band. Too little and nothing is learned; too much and it sinks. Load it again."
      },
      title: "Load the boat until it sits low but still floats",
      cue: "Commit when the boat is loaded low in the water but still floating.",
      why: "Adding cargo makes the boat sit lower as it pushes aside more water to balance the extra weight. Stopping while it still floats shows that balance at its limit, and it is the idea behind the load lines painted on real ships' hulls."
    },
    {
      id: "put-your-result-on-the-class",
      kind: "drag",
      target: "kbd-result-token",
      drag: {
        to: "kbd-results-spot",
        radius: 0.45,
        missNote: "Not in place yet. Take it all the way to on the class results board."
      },
      title: "Put your result on the class board",
      cue: "Drag your result card onto the class results board beside everyone else's.",
      why: "One result can be a fluke; many results from the class together show a pattern. Putting yours beside everyone else's is how science builds confidence in a finding, and it lets the class spot any result that needs repeating."
    },
    {
      id: "explain-the-squirting-bottle",
      kind: "select",
      target: "kbd-depth-card",
      title: "Explain the squirting bottle",
      cue: "Water squirts furthest from the lowest hole. Say why.",
      why: "The lowest hole has the most water above it, so the water there pushes hardest and squirts furthest. Explaining that with the idea of water pressing from above is the qualitative understanding of pressure this lesson aims at, without needing any figures."
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
      cue: "Look at the draft conclusion and mark each problem.",
      why: "A conclusion should follow from the evidence and use the right idea to explain it. The usual problems are explaining floating by weight alone, drawing a conclusion from an unfair test and ignoring a result that did not fit. Spotting them makes your own conclusions stronger."
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
        label: "HONEST"
      },
      title: "Keep your observations matched to what you see",
      cue: "Hold your notes in band with what the tank actually shows as objects settle.",
      why: "It is easy to write what you expected rather than what happened. Keeping notes matched to the tank, including surprises, is the honesty that makes a science result worth trusting.",
      holdBreakNote: "Your notes drifted from what the tank shows. Look again and write what you see."
    },
    {
      id: "record-predictions-results-and-explanations",
      kind: "select",
      target: "kbd-lab-log",
      doneLine: "Predictions and results recorded",
      title: "Record predictions, results and explanations",
      cue: "Write each prediction, what happened, and the explanation using the water's push.",
      why: "Recording predictions alongside results shows where your thinking changed, which is the real evidence of learning. Anyone can repeat the test from your record and check your explanation."
    },
    {
      id: "explain-the-boat-to-the-class",
      kind: "select",
      target: "kbd-share-board",
      doneLine: "Explanation shared",
      title: "Explain the boat to the class",
      cue: "Explain why the boat floats when the block of the same material sinks.",
      why: "Explaining the boat and the block to the class, using the push of the water, is the clearest test of whether the idea has landed. Classmates who predicted wrongly learn most from an explanation that uses the same objects they saw."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kbd-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the experiment go? What surprised you, and what would you test next?",
      why: "Ending with a short check-in lets the teacher hear what made sense and what did not, and gives each learner a moment to name one thing they would test next. Nobody is marked here, and anyone who found the lesson hard can talk to the teacher or a trusted adult afterwards."
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
      alert: "The test tank starts to overflow onto the platform floor near the rail.",
      cue: "Stop adding water, step back from the wet patch and tell the guide.",
      why: "Water on a platform floor beside a rail is a slip hazard in exactly the wrong place. Stopping, stepping back and telling the guide, who can mop and mark it, comes before the experiment.",
      missNote: "Nobody told the guide, and a classmate slipped on the wet floor by the rail. Next time, stop the lesson and deal with it first.",
      wrongNote: "That does not deal with the spill. Stop and tell the guide. Choose the response that deals with it now."
    },
    {
      id: "the-guide-asks-why-ships-float",
      kind: "Guide question",
      after: "keep-your-observations-matched-to-what",
      delay: 3,
      seconds: 12,
      target: "kbd-explain-push",
      alert: "The platform guide asks how a huge metal ship can float when a small metal nut sinks.",
      cue: "Explain using shape and the water's upward push, not weight alone.",
      why: "The guide is checking whether the boat-and-block result transfers to something new. Explaining that the ship's hollow shape pushes aside a great deal of water, so the upward push balances its weight, shows real understanding.",
      missNote: "You said the ship was lighter than it looks, which is not why it floats. Next time, stop the lesson and deal with it first.",
      wrongNote: "That explains by weight alone. Use the shape and the water's push."
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
    // a learning wall behind the station, with a board the class works on
    const wall = group(g, 0, 0, -4.7);
    box(wall, 6.4, 2.6, 0.12, 0, 1.3, 0, 0xe0dccf, { rough: 0.7 }).material = wallMat;
    box(wall, 2.6, 1.2, 0.03, 0, 1.55, 0.08, 0x2f4a3a, { rough: 0.9 });
    box(wall, 2.7, 0.05, 0.08, 0, 0.93, 0.1, 0xb89a6a, { rough: 0.6 });
    for (let i = 0; i < 5; i++) box(wall, 0.34, 0.24, 0.02, -2.6 + i * 0.3 + (i > 2 ? 3.1 : 0) - (i > 2 ? 0.9 : 0), 1.8, 0.08, [0xf2c14b, 0x7fc4d8, 0xf0a0a0, 0xa0e0a0, 0xd0b0f0][i], { rough: 0.8 });
    // desks and stools for the class, clear of every control
    for (let i = 0; i < 4; i++) {
      const side = i < 2 ? -1 : 1, k = i % 2;
      const desk = group(g, side * (3.2 + (k % 2) * 0.2), 0, -2.4 + k * 1.3, side * 0.3);
      box(desk, 0.9, 0.04, 0.55, 0, 0.74, 0, 5216890, { rough: 0.6 });
      for (const [lx, lz] of [[-0.4, -0.23], [0.4, -0.23], [-0.4, 0.23], [0.4, 0.23]]) box(desk, 0.035, 0.72, 0.035, lx, 0.36, lz, 0x3a3f46, { rough: 0.5, metal: 0.5 });
      box(desk, 0.3, 0.02, 0.22, 0.1, 0.77, 0, 0xf4f0e6, { rough: 0.9 });
      const stool = group(desk, 0, 0, 0.55);
      cyl(stool, 0.16, 0.16, 0.04, 0, 0.45, 0, 0x2b2f35, { rough: 0.6, seg: 14 });
      for (let a = 0; a < 3; a++) box(stool, 0.03, 0.44, 0.03, Math.sin(a * 2.1) * 0.11, 0.22, Math.cos(a * 2.1) * 0.11, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    }
    // shelves of the lesson's materials
    for (const sx of [-2.9, 2.9]) {
      const sh = group(g, sx, 0, -4.2);
      box(sh, 1.0, 1.6, 0.34, 0, 0.8, 0, 0x6b4a2e, { rough: 0.7 });
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) box(sh, 0.18, 0.28, 0.24, -0.33 + c * 0.22, 0.3 + r * 0.5, 0.04, [0xd86a4a, 0x4a8ad8, 0xd8c04a, 0x5ab87a][(r + c) % 4], { rough: 0.8 });
    }

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
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Predict, test, explain."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
        if (step.id === "explain-the-squirting-bottle") paintGuide("Water pushes up; deeper water pushes harder.");
      },

      onHazard() {
        paintGuide("Stop. Heavy is not the whole story — think about the push of the water.");
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
        if (it.id === "the-tank-starts-to-overflow") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Guide told, floor mopped and marked. The test carries on at the bench."); }
        if (it.id === "the-guide-asks-why-ships-float") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Explained with shape and the water's push. The idea has transferred."); }
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
