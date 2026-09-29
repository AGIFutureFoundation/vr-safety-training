import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Simple Machines at a Crane. Lower-secondary science at a container terminal's training room: levers, pulleys and the wheel and axle in a crane, why a machine trades force for distance and never gives more work than it gets, and why the operator's load chart sets what the crane may lift, all on a bench model with the real cranes seen from the window.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_SIMPLE_MACHINES_AT_A_CRANE = {
  id: "k12-simple-machines-at-a-crane",
  index: "821",
  domain: "Education",
  trade: "Science class at the container terminal's training room — learner and crane operator",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Simple Machines at a Crane",
  title: simTitle("Simple Machines at a Crane"),
  tagline: "A machine trades force for distance, never free work — and the load chart has the last word",
  accent: 0x4fb88a,
  accentCss: "#4fb88a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"force-for-distance","name":"Force for Distance","note":"A crane's levers and pulleys explained, force traded for distance on the model and the load chart respected"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Machine Board",
    currency: "LIFTS",
    ranks: ["Visitor","Rigger's Helper","Tester","Explainer","Engineer"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-simple-machines-in-the") },
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
    "pulley-gives-free-energy": "You said adding pulleys means less work is done. More pulley lines make the pull easier, but you pull a longer length of rope for the same lift; the work, force multiplied by distance, stays the same or a little more because of friction. Machines trade, they never give work away.",
    "longer-boom-lifts-more": "You said reaching further out lets the crane lift more. It is the other way round: the further the load is from the crane's base, the bigger its turning effect, so the crane can lift less at long reach. That is exactly what the operator's load chart shows.",
    "stand-under-the-load": "You stood under the suspended load to look at the pulley. Nobody stands under a load, on the model or on the quay; it is the first rule every rigger and operator learns, and the model is built so you can see the pulley from the side.",
    "load-chart-is-a-guide": "You said the load chart is only a guide. For a crane operator it is a limit, set by the maker for each reach and configuration; going past it risks the crane tipping or failing. The science explains the chart, and the chart is obeyed."
  },

  lateNotes: {
    "kcr-machine-log": "The test record is written once every test is done — nothing to record yet.",
    "kcr-checkin": "The check-in comes at the very end of the session."
  },

  steps: [
    {
      id: "find-the-simple-machines-in-the",
      kind: "find",
      noHint: true,
      targets: [
        "kcr-lever",
        "kcr-pulley",
        "kcr-wheel-axle"
      ],
      itemNames: {
        "kcr-lever": "the boom turning about its pivot",
        "kcr-pulley": "the pulleys in the hook block",
        "kcr-wheel-axle": "the winch drum and its handle"
      },
      itemNotes: {
        "kcr-lever": "A lever: a bar turning about a fixed point.",
        "kcr-pulley": "Pulleys share the load between several lines of rope.",
        "kcr-wheel-axle": "A wheel and axle: a big turn on the handle, a small turn on the drum."
      },
      decoyNotes: {
        "kcr-cab-window": "It gives the operator a view, but it is not a machine."
      },
      title: "Find the simple machines in the crane",
      cue: "Mark the three simple machines in the model crane.",
      why: "A crane is several simple machines working together. The boom is a lever turning about its pivot, the hook block is a set of pulleys, and the winch drum is a wheel and axle. Finding each one in the model shows that the big machines on the quay are built from ideas you can test on a bench."
    },
    {
      id: "know-the-rule-never-under-a",
      kind: "select",
      target: "kcr-load-card",
      title: "Know the rule: never under a load",
      cue: "Read the card: never stand or reach under a suspended load.",
      why: "A suspended load can slip, swing or drop, and the space beneath it is the most dangerous place near any crane. The rule applies to the bench model too, because the habit you practise here is the one that keeps people safe on every quay and building site."
    },
    {
      id: "put-the-pulley-test-in-order",
      kind: "sequence",
      targets: [
        "kcr-ord-one",
        "kcr-ord-add",
        "kcr-ord-again",
        "kcr-ord-rope"
      ],
      itemNames: {
        "kcr-ord-one": "1 · measure the pull with one line",
        "kcr-ord-add": "2 · add pulley lines",
        "kcr-ord-again": "3 · measure the pull again",
        "kcr-ord-rope": "4 · measure the rope you pulled"
      },
      title: "Put the pulley test in order",
      cue: "Weigh the pull with one line, add lines, weigh again, then measure the rope pulled.",
      why: "Measuring the pull with one line first gives a baseline to compare with. Adding lines and measuring again shows the pull getting smaller, and measuring the length of rope you had to pull shows where the trade happens: less force, more distance, and never less work.",
      outOfOrderNote: "Out of order. Measure with one line first, so you have something to compare."
    },
    {
      id: "hold-the-force-meter-steady-on",
      kind: "hold",
      target: "kcr-force-hold",
      seconds: 6,
      title: "Hold the force meter steady on the rope",
      cue: "Hold the force meter still on the rope while the load hangs clear.",
      why: "A force meter only reads the pull correctly while the load is hanging still; any jerk or swing adds to the reading. Holding it steady until the needle settles gives a number you can compare fairly with the next test.",
      holdBreakNote: "The load swung and the reading jumped. Let it settle and hold still."
    },
    {
      id: "say-why-more-pulleys-make-pulling",
      kind: "select",
      target: "kcr-compare-card",
      title: "Say why more pulleys make pulling easier",
      cue: "Say why more pulley lines make the pull easier, and what you give up.",
      why: "More lines share the load, so each carries less and your pull is smaller, but you must pull a longer length of rope. Saying both halves, easier pull and longer rope, is understanding the trade instead of thinking the machine gives something for nothing."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "kcr-ex-free",
        "kcr-ex-reach",
        "kcr-ex-guide"
      ],
      itemNames: {
        "kcr-ex-free": "a machine said to give free work",
        "kcr-ex-reach": "a longer reach said to lift more",
        "kcr-ex-guide": "the load chart called a rough guide"
      },
      itemNotes: {
        "kcr-ex-free": "Machines trade force for distance.",
        "kcr-ex-reach": "Further out, the crane lifts less.",
        "kcr-ex-guide": "The chart is a limit."
      },
      decoyNotes: {
        "kcr-ex-diagram": "A labelled diagram is good practice. Keep it."
      },
      title: "Spot the problems in a classmate's explanation",
      cue: "Look at the draft explanation and mark each problem.",
      why: "Explanations of machines go wrong in the same ways: a machine said to give free work, a longer reach said to lift more and a load chart called a rough guide. Spotting them helps you write explanations that are true as well as tidy."
    },
    {
      id: "turn-the-winch-handle-to-lift",
      kind: "turn",
      target: "kcr-winch-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "WINCH"
      },
      title: "Turn the winch handle to lift the load",
      cue: "Turn the winch handle and watch how far it turns for a small lift.",
      why: "The handle travels round a big circle while the drum winds only a little rope, which is how a small push on the handle lifts a heavy load. Feeling how many turns a short lift takes is the wheel and axle's trade, felt in your own hand."
    },
    {
      id: "read-the-pull-at-the-right",
      kind: "gauge",
      target: "kcr-pull-meter",
      gauge: {
        label: "PULL",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not the steady pull. Wait until the load hangs still before reading.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the pull at the right moment",
      cue: "Commit when the force meter shows the steady pull with the load held still.",
      why: "The pull needed to hold a load still is the fair measurement; the pull while starting or speeding up is larger. Reading at the steady moment is what lets you compare one line with several and see the pulleys' effect clearly."
    },
    {
      id: "move-the-load-closer-on-the",
      kind: "drag",
      target: "kcr-load-token",
      drag: {
        to: "kcr-reach-spot",
        radius: 0.45,
        missNote: "Still too far out for the chart. Bring the load closer to the base."
      },
      title: "Move the load closer on the model boom",
      cue: "Drag the load block to the reach where the model's load chart allows it.",
      why: "The same load has a bigger turning effect the further out it hangs, so a crane can lift less at long reach. Moving it inside the chart's limit is exactly the decision an operator makes before every lift, with the chart, not a guess, as the guide."
    },
    {
      id: "lower-the-load-smoothly",
      kind: "track",
      target: "kcr-track-meter",
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
        label: "LOWERING",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Lower the load smoothly",
      cue: "Keep the lowering speed steady as the model load comes down.",
      why: "Lowering smoothly keeps the load from swinging and stops sudden jerks that load the rope far more than the steady weight does. Operators lower with care for the same reason, and feeling it on the model shows why speed changes matter.",
      holdBreakNote: "The load dropped too fast and swung. Slow it and bring it back steady."
    },
    {
      id: "record-the-test-results",
      kind: "select",
      target: "kcr-machine-log",
      doneLine: "Results recorded",
      title: "Record the test results",
      cue: "Write the pull and the rope length for each number of lines.",
      why: "A results table puts force and distance side by side, so the trade becomes visible: as one goes down the other goes up. Writing both for each test is what turns a demonstration into evidence someone else can check."
    },
    {
      id: "ask-the-operator-how-they-use",
      kind: "select",
      target: "kcr-share-board",
      doneLine: "Operator's answer noted",
      title: "Ask the operator how they use the chart",
      cue: "Ask the crane operator how the load chart guides a real lift.",
      why: "Hearing an operator explain how they check reach, load and configuration before every lift connects the science to a skilled trade. It shows that the ideas tested on the bench are the ones professionals rely on every shift."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kcr-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the session",
      cue: "Where else have you seen a lever or a pulley? What still puzzles you?",
      why: "The terminal shift ends with a tailgate talk, so the visit ends with one too: every learner names the machine part that made the load easier to move and says how. The riggers listening can tell straight away who has seen the trade in a lever and a pulley and who has only seen a crane."
    }
  ],

  interrupts: [
    {
      id: "a-horn-sounds-on-the-quay",
      kind: "Quay signal",
      after: "hold-the-force-meter-steady-on",
      delay: 3,
      seconds: 12,
      target: "kcr-stay-back",
      alert: "A horn sounds on the quay outside and a real crane begins to move a container.",
      cue: "Stay back from the window and listen to the operator's instruction.",
      why: "A horn on the quay warns everyone that a lift is starting. Even inside, the rule is to stay where you are told and listen; learning to respond to signals straight away is part of being safe anywhere machines work.",
      missNote: "Learners crowded the window door, and the operator had to stop the talk to move them back.",
      wrongNote: "That takes you towards the quay. Stay back and listen. Choose the response that deals with it now."
    },
    {
      id: "the-operator-asks-about-reach",
      kind: "Operator question",
      after: "lower-the-load-smoothly",
      delay: 3,
      seconds: 12,
      target: "kcr-say-reach",
      alert: "The crane operator asks what happens to how much the crane can lift as the load moves further out.",
      cue: "Say that further out, the crane can lift less, and why.",
      why: "The operator is checking the idea behind every load chart. Saying that a load further out has a bigger turning effect, so the crane can lift less, shows you understand why the chart looks the way it does.",
      missNote: "You said it could lift more, and the operator showed you the chart going the other way.",
      wrongNote: "That has it backwards. Choose the response that deals with it now."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7c7a72", base2: "#6e6c64", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e4e0d6", base2: "#d6d2c6", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
      box(desk, 0.9, 0.04, 0.55, 0, 0.74, 0, 5930936, { rough: 0.6 });
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
    bead(-1.22, 0.9, -0.27, "kcr-lever", "the boom turning about its pivot", {});
    bead(-1.42, 1.18, -0.62, "kcr-pulley", "the pulleys in the hook block", {});
    bead(-1.03, 1.46, -0.71, "kcr-wheel-axle", "the winch drum and its handle", {});
    bead(-1.08, 0.9, -1.11, "kcr-cab-window", "the operator's cab window", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kcr-ord-one", "1 · measure the pull with one line", {});
    bead(-0.58, 1.46, -1.44, "kcr-ord-add", "2 · add pulley lines", {});
    bead(-0.24, 0.9, -1.23, "kcr-ord-again", "3 · measure the pull again", {});
    bead(0, 1.18, -1.55, "kcr-ord-rope", "4 · measure the rope you pulled", {});
    bead(0.24, 1.46, -1.23, "kcr-force-hold", "Force meter on the rope", {});
    bead(0.58, 0.9, -1.44, "kcr-ex-free", "a machine said to give free work", {});
    bead(0.68, 1.18, -1.05, "kcr-ex-reach", "a longer reach said to lift more", {});
    bead(1.08, 1.46, -1.11, "kcr-ex-guide", "the load chart called a rough guide", {});
    bead(1.03, 0.9, -0.71, "kcr-ex-diagram", "a labelled diagram of the pulleys", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kcr-stay-back", "Stay back from the window and listen", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kcr-say-reach", "Say what reach does to the lift", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kcr-load-card", "Never under a load", "NEVER\nUNDER", { ry: 1.2 });
    dials["kcr-winch-dial"] = dial(-1.89, -1.4, 0.93, "kcr-winch-dial", "Winch handle");
    meters["kcr-pull-meter"] = meter(-1.45, -1.85, 0.67, "kcr-pull-meter", "Force meter reading");
    tokens["kcr-load-token"] = token(-0.92, -2.16, 0.4, "kcr-load-token", "Load block");
    spots["kcr-reach-spot"] = spot(-0.31, -2.33, 0.13, "kcr-reach-spot", "Inside the chart's reach");
    card(0.31, 1.35, -2.33, "kcr-compare-card", "What is the trade?", "EASIER\nBUT...?", { ry: -0.13 });
    meters["kcr-track-meter"] = meter(0.92, -2.16, -0.4, "kcr-track-meter", "Smooth lowering");
    boards["kcr-machine-log"] = board(1.45, -1.85, -0.67, "kcr-machine-log", "Test record");
    boards["kcr-share-board"] = board(1.89, -1.4, -0.93, "kcr-share-board", "Ask the operator");
    boards["kcr-checkin"] = board(2.19, -0.85, -1.2, "kcr-checkin", "End-of-session check-in");
    hazardCard(-1.53, 0.72, -1.21, "pulley-gives-free-energy", "Say more pulleys mean the crane does less work?", "FREE\nWORK", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "longer-boom-lifts-more", "Say a longer boom reach lifts more?", "REACH\nFURTHER", 0.3);
    hazardCard(0.58, 0.72, -1.86, "stand-under-the-load", "Stand under the model's load to see the pulley?", "UNDER THE\nLOAD", -0.3);
    hazardCard(1.53, 0.72, -1.21, "load-chart-is-a-guide", "Say the load chart is only a rough guide?", "ROUGH\nGUIDE", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Less force, more distance."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Crane operator", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Rigger", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-horn-sounds-on-the-quay"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-horn-sounds-on-the-quay"].visible = false;
    arrivals["the-operator-asks-about-reach"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-operator-asks-about-reach"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-load-closer-on-the") { const s = spots["kcr-reach-spot"]; tokens["kcr-load-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-test-results") repaint(boards["kcr-machine-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Results recorded"], "#59c97b"));
        if (step.id === "ask-the-operator-how-they-use") repaint(boards["kcr-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Operator's answer noted"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kcr-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-more-pulleys-make-pulling") paintGuide("Easier pull, longer rope.");
      },

      onHazard() {
        paintGuide("Stop. Is the machine giving free work? Is anyone under the load?");
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
        if (it.id === "a-horn-sounds-on-the-quay") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group stayed back, lift finished outside. The lesson carries on."); }
        if (it.id === "the-operator-asks-about-reach") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Reach and turning effect explained. The operator agrees."); }
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
