import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Probability with a Fair Spinner. Upper-primary maths at a community fair's games tent: what makes a spinner fair, predicting outcomes as fractions of equal parts, running a tally and comparing what happened with what was expected, with prizes that are stickers and no money at stake.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_PROBABILITY_WITH_A_FAIR_SPINNER = {
  id: "k12-probability-with-a-fair-spinner",
  index: "817",
  domain: "Education",
  trade: "Maths class at the community fair's games tent — learner and stall volunteer",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Probability with a Fair Spinner",
  title: simTitle("Probability with a Fair Spinner"),
  tagline: "Equal parts make a fair spinner — and one lucky run proves nothing",
  accent: 0x5a9fd8,
  accentCss: "#5a9fd8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"fair-and-square","name":"Fair and Square","note":"A spinner checked for fairness, outcomes predicted from equal parts and a tally compared honestly with the prediction"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Spinner Board",
    currency: "SPINS",
    ranks: ["Spinner","Counter","Tallier","Predictor","Statistician"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-makes-the-spinner-fair") },
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
    "due-for-a-win": "You said red is due because it has not come up for a while. A fair spinner has no memory: each spin has the same chance as the last, whatever came before. Believing an outcome is due is the gambler's mistake, and it is why games of chance are not a way to win anything back.",
    "count-colours-not-areas": "You counted how many colours there are and ignored how big each part is. Chance depends on the share of the spinner each outcome takes up, so a spinner with one big part and two small ones is not an equal three-way chance.",
    "spin-near-the-guy-ropes": "You stepped back across the tent's guy ropes to get a better view. Guy ropes are a trip hazard at every fair; you watch from inside the tent, and the volunteer keeps the ropes flagged so nobody walks into them.",
    "few-spins-prove-it": "You decided the spinner was unfair after a handful of spins. Short runs wobble a lot by chance alone; only many spins show whether the results settle near what equal parts predict, and even then you check the spinner itself."
  },

  lateNotes: {
    "kfs-spin-log": "The experiment record is written once the tally is done — nothing to record yet.",
    "kfs-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-what-makes-the-spinner-fair",
      kind: "find",
      noHint: true,
      targets: [
        "kfs-equal-parts",
        "kfs-free-pointer",
        "kfs-level-board"
      ],
      itemNames: {
        "kfs-equal-parts": "parts that are all the same size",
        "kfs-free-pointer": "a pointer that turns freely",
        "kfs-level-board": "a board that sits level"
      },
      itemNotes: {
        "kfs-equal-parts": "Equal parts give each outcome the same chance.",
        "kfs-free-pointer": "A sticking pointer favours where it sticks.",
        "kfs-level-board": "A tilted board can pull the pointer downhill."
      },
      decoyNotes: {
        "kfs-bright-colours": "Colour makes it easy to read, but it does not change the chances."
      },
      title: "Find what makes the spinner fair",
      cue: "Mark the three things you check before trusting a spinner.",
      why: "A spinner is fair when every part is the same size, the pointer turns freely and nothing makes it stop in one place more than another. Checking those three before predicting anything means the maths describes the real spinner, not a spinner you are imagining."
    },
    {
      id: "put-the-experiment-in-order",
      kind: "sequence",
      targets: [
        "kfs-ord-check",
        "kfs-ord-predict",
        "kfs-ord-tally",
        "kfs-ord-compare"
      ],
      itemNames: {
        "kfs-ord-check": "1 · check the spinner is fair",
        "kfs-ord-predict": "2 · write a prediction from equal parts",
        "kfs-ord-tally": "3 · spin many times and tally",
        "kfs-ord-compare": "4 · compare the tally with the prediction"
      },
      title: "Put the experiment in order",
      cue: "Check the spinner, predict, spin and tally, then compare.",
      why: "Checking the spinner first and writing a prediction before spinning keeps the experiment honest, because you cannot change the prediction to match the result. Spinning and tallying many times, and only then comparing, is how any probability experiment is run, from a classroom to a lab.",
      outOfOrderNote: "Out of order. Write the prediction before you spin, so the results cannot change it."
    },
    {
      id: "agree-what-the-prizes-are",
      kind: "select",
      target: "kfs-prize-card",
      title: "Agree what the prizes are",
      cue: "Read the stall card: stickers only, nothing to pay, nothing to lose.",
      why: "This lesson is about how chance works, so the stall uses stickers and nobody pays or loses anything. Being clear about that from the start matters, because the same maths explains why games where money is at stake are built so that, over time, the players lose."
    },
    {
      id: "give-the-pointer-a-full-spin",
      kind: "turn",
      target: "kfs-spin-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SPIN"
      },
      title: "Give the pointer a full spin",
      cue: "Turn the pointer firmly so it goes round more than once before it stops.",
      why: "A gentle nudge that barely moves the pointer lets the starting position decide the result. Spinning firmly, so the pointer goes round several times, is what makes each outcome depend on chance alone and not on where you started."
    },
    {
      id: "read-which-part-the-pointer-stopped",
      kind: "gauge",
      target: "kfs-read-meter",
      gauge: {
        label: "RESULT",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not clear yet. Wait until the pointer has stopped and read its tip."
      },
      title: "Read which part the pointer stopped on",
      cue: "Commit when you can see clearly which part the pointer's tip is in.",
      why: "A result only counts once you can see which part the pointer's tip sits in. If it lands on a line, the stall's rule is to spin again, decided before the game starts, so that nobody chooses the result they would prefer."
    },
    {
      id: "hold-the-board-level-while-it",
      kind: "hold",
      target: "kfs-hold-board",
      seconds: 6,
      title: "Hold the board level while it spins",
      cue: "Hold the spinner board steady and level while the pointer turns.",
      why: "If the board tilts, the pointer tends to settle at the lowest point, and the spinner stops being fair even if its parts are equal. Holding it level while it turns is part of running a fair test, the same as keeping any other condition the same between trials.",
      holdBreakNote: "The board tipped while the pointer turned. Set it level and hold it again."
    },
    {
      id: "add-the-result-to-the-tally",
      kind: "drag",
      target: "kfs-tally-token",
      drag: {
        to: "kfs-tally-spot",
        radius: 0.45,
        missNote: "Not in its row yet. Put the mark beside the part the pointer landed on."
      },
      title: "Add the result to the tally",
      cue: "Drag the tally mark to the row for the part the pointer stopped on.",
      why: "A tally is a running record, one mark per spin in the row it belongs to. Putting each mark in the right row as it happens, rather than trying to remember a string of results, is what makes the final count something you can trust."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "kfs-rp-late",
        "kfs-rp-few",
        "kfs-rp-due"
      ],
      itemNames: {
        "kfs-rp-late": "a prediction written after the spins",
        "kfs-rp-few": "a verdict from only a few spins",
        "kfs-rp-due": "a colour called due to come up"
      },
      itemNotes: {
        "kfs-rp-late": "Predict first, then spin.",
        "kfs-rp-few": "Short runs wobble by chance.",
        "kfs-rp-due": "The spinner has no memory."
      },
      decoyNotes: {
        "kfs-rp-table": "A clear tally table is good practice. Keep it."
      },
      title: "Spot the problems in a classmate's report",
      cue: "Look at the draft experiment report and mark each problem.",
      why: "Probability reports go wrong in a few familiar ways: a prediction written after the spins, a conclusion drawn from too few trials and an outcome called due. Spotting them in another report is how you learn to write a conclusion that the evidence actually supports."
    },
    {
      id: "say-the-chance-of-landing-on",
      kind: "select",
      target: "kfs-compare-card",
      title: "Say the chance of landing on one part",
      cue: "The spinner has equal parts. Say the chance of one of them as a fraction.",
      why: "With equal parts, the chance of one part is one out of the number of parts, written as a fraction. Saying it as a fraction, and why, links probability to the fractions you already know and gives a prediction you can test."
    },
    {
      id: "keep-the-tally-going-through-a",
      kind: "track",
      target: "kfs-track-meter",
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
        label: "TALLY"
      },
      title: "Keep the tally going through a long run",
      cue: "Keep up with the spins, marking each one as it lands.",
      why: "The point of many spins is that short-run wobbles even out, but only if every spin is counted. Keeping up through a long run, without skipping or double-counting, is where concentration matters more than arithmetic.",
      holdBreakNote: "The tally fell behind the spins. Catch up before the next one."
    },
    {
      id: "record-the-prediction-and-the-results",
      kind: "select",
      target: "kfs-spin-log",
      doneLine: "Prediction and results recorded",
      title: "Record the prediction and the results",
      cue: "Write the prediction, the tally totals and how they compare.",
      why: "Writing the prediction beside the results shows how close chance came to what equal parts predicted. The record is what lets someone else repeat your experiment and see whether they get a similar pattern."
    },
    {
      id: "pool-your-results-with-the-class",
      kind: "select",
      target: "kfs-share-board",
      doneLine: "Results pooled with the class",
      title: "Pool your results with the class",
      cue: "Add your tally to the class total on the board.",
      why: "Pooling everyone's spins gives a much longer run than any one group could manage, and the class total usually sits closer to the prediction than any single group's. Seeing that happen is the clearest evidence that more trials give a better picture."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kfs-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "What surprised you about the spins? What would you test next?",
      why: "The stall closes with the class comparing what they expected the spinner to do with what it did. That gap between the guess and the tally is the whole lesson in chance, and hearing classmates describe it in their own words helps the ones who still think a spinner remembers its last spin."
    }
  ],

  interrupts: [
    {
      id: "a-small-child-is-lost",
      kind: "Lost child",
      after: "hold-the-board-level-while-it",
      delay: 3,
      seconds: 12,
      target: "kfs-tell-volunteer",
      alert: "A small child who is not in your class is standing alone and crying at the tent entrance.",
      cue: "Tell the stall volunteer straight away; stay where you are with your group.",
      why: "A lost child at a fair is found fastest when an adult who knows the fair's plan takes charge. Telling the volunteer at once, and staying with your own group, gets the child help without anyone else going missing.",
      missNote: "Nobody told an adult, and the child wandered off into the crowd before anyone could help.",
      wrongNote: "That does not get an adult involved. Tell the volunteer. Choose the response that deals with it now."
    },
    {
      id: "the-volunteer-asks-if-it-is-fair",
      kind: "Volunteer question",
      after: "keep-the-tally-going-through-a",
      delay: 3,
      seconds: 12,
      target: "kfs-say-fair",
      alert: "The stall volunteer asks your group whether their spinner is fair and how you would know.",
      cue: "Say what you checked about the spinner and what the long run shows.",
      why: "The volunteer is checking you know fairness comes from the spinner, not from a lucky run. Naming equal parts, a free pointer and a level board, and then the long-run tally, is exactly the reasoning a fair test needs.",
      missNote: "You said it was fair because you won, and the volunteer pointed out that proves nothing.",
      wrongNote: "That relies on one lucky result. Say what you checked. Choose the response that deals with it now."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6f7a6c", base2: "#636d60", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#ece2d2", base2: "#ded4c2", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // outdoors: a low wall to sit on, planters, a notice board on posts and two trees
    void wallMat;
    for (const [bx, bz, ry] of [[-2.8, -3.4, 0.5], [2.8, -3.4, -0.5]]) {
      const b = group(g, bx, 0, bz, ry);
      box(b, 2.2, 0.42, 0.5, 0, 0.21, 0, 0x9a948a, { rough: 0.9 });
      box(b, 2.3, 0.06, 0.56, 0, 0.45, 0, 0xb89a6a, { rough: 0.6 });
    }
    for (const px of [-1.4, 1.4]) {
      const pl = group(g, px, 0, -4.5);
      box(pl, 0.9, 0.5, 0.9, 0, 0.25, 0, 0x6b4a2e, { rough: 0.8 });
      for (let i = 0; i < 5; i++) ball(pl, 0.16, -0.25 + (i % 3) * 0.25, 0.62 + (i % 2) * 0.08, -0.2 + Math.floor(i / 3) * 0.35, [0x5ab87a, 0x4a9a5a, 0x7fc464][i % 3], { rough: 0.9, seg: 8 });
    }
    const notice = group(g, 0, 0, -4.7);
    for (const nx of [-0.9, 0.9]) cyl(notice, 0.05, 0.05, 2.2, nx, 1.1, 0, 0x6b4a2e, { rough: 0.8, seg: 8 });
    box(notice, 2.0, 1.1, 0.06, 0, 1.6, 0, 0x2f4a3a, { rough: 0.9 });
    box(notice, 2.1, 0.12, 0.1, 0, 2.2, 0, 0x6b4a2e, { rough: 0.8 });
    for (const [tx, tz] of [[-3.6, -4.6], [3.6, -4.6]]) {
      cyl(g, 0.12, 0.16, 2.4, tx, 1.2, tz, 0x5a4030, { rough: 0.9, seg: 8 });
      ball(g, 1.1, tx, 2.9, tz, 0x4a8a4a, { rough: 0.9, seg: 10 });
      ball(g, 0.8, tx + 0.5, 3.3, tz + 0.3, 0x5a9a52, { rough: 0.9, seg: 10 });
    }

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "kfs-equal-parts", "parts that are all the same size", {});
    bead(-1.42, 1.18, -0.62, "kfs-free-pointer", "a pointer that turns freely", {});
    bead(-1.03, 1.46, -0.71, "kfs-level-board", "a board that sits level", {});
    bead(-1.08, 0.9, -1.11, "kfs-bright-colours", "the bright paint on the parts", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kfs-ord-check", "1 · check the spinner is fair", {});
    bead(-0.58, 1.46, -1.44, "kfs-ord-predict", "2 · write a prediction from equal parts", {});
    bead(-0.24, 0.9, -1.23, "kfs-ord-tally", "3 · spin many times and tally", {});
    bead(0, 1.18, -1.55, "kfs-ord-compare", "4 · compare the tally with the prediction", {});
    bead(0.24, 1.46, -1.23, "kfs-hold-board", "Board held level", {});
    bead(0.58, 0.9, -1.44, "kfs-rp-late", "a prediction written after the spins", {});
    bead(0.68, 1.18, -1.05, "kfs-rp-few", "a verdict from only a few spins", {});
    bead(1.08, 1.46, -1.11, "kfs-rp-due", "a colour called due to come up", {});
    bead(1.03, 0.9, -0.71, "kfs-rp-table", "a neat tally table", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kfs-tell-volunteer", "Tell the stall volunteer at once", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kfs-say-fair", "Say what makes it fair", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kfs-prize-card", "Stickers only, nothing to pay", "STICKERS\nONLY", { ry: 1.2 });
    dials["kfs-spin-dial"] = dial(-1.89, -1.4, 0.93, "kfs-spin-dial", "Spin the pointer");
    meters["kfs-read-meter"] = meter(-1.45, -1.85, 0.67, "kfs-read-meter", "Pointer read");
    tokens["kfs-tally-token"] = token(-0.92, -2.16, 0.4, "kfs-tally-token", "Tally mark");
    spots["kfs-tally-spot"] = spot(-0.31, -2.33, 0.13, "kfs-tally-spot", "The right row");
    card(0.31, 1.35, -2.33, "kfs-compare-card", "Chance as a fraction", "ONE OUT\nOF ...?", { ry: -0.13 });
    meters["kfs-track-meter"] = meter(0.92, -2.16, -0.4, "kfs-track-meter", "Tally kept up");
    boards["kfs-spin-log"] = board(1.45, -1.85, -0.67, "kfs-spin-log", "Experiment record");
    boards["kfs-share-board"] = board(1.89, -1.4, -0.93, "kfs-share-board", "Class total");
    boards["kfs-checkin"] = board(2.19, -0.85, -1.2, "kfs-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "due-for-a-win", "Say red is due because it has not come up for a while?", "RED IS\nDUE", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "count-colours-not-areas", "Count the colours and ignore the sizes of the parts?", "COUNT\nCOLOURS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "spin-near-the-guy-ropes", "Step back over the guy ropes to watch the spin?", "GUY\nROPES", -0.3);
    hazardCard(1.53, 0.72, -1.21, "few-spins-prove-it", "Decide the spinner is unfair after a handful of spins?", "A FEW\nSPINS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Equal parts, equal chances."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Stall volunteer", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Parent helper", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-small-child-is-lost"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-small-child-is-lost"].visible = false;
    arrivals["the-volunteer-asks-if-it-is-fair"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-volunteer-asks-if-it-is-fair"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "add-the-result-to-the-tally") { const s = spots["kfs-tally-spot"]; tokens["kfs-tally-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-prediction-and-the-results") repaint(boards["kfs-spin-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Prediction and results recorded"], "#59c97b"));
        if (step.id === "pool-your-results-with-the-class") repaint(boards["kfs-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Results pooled with the class"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kfs-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-the-chance-of-landing-on") paintGuide("One part out of all the equal parts.");
      },

      onHazard() {
        paintGuide("Stop. Does the spinner remember? Are the parts equal?");
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
        if (it.id === "a-small-child-is-lost") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Volunteer told, child taken to the fair's help point. The lesson carries on."); }
        if (it.id === "the-volunteer-asks-if-it-is-fair") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Checks named, long run described. The volunteer agrees it is fair."); }
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
