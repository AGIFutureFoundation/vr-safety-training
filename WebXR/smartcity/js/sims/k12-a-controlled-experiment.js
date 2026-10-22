import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — A Controlled Experiment. Lower-secondary science at a lab campus's teaching lab: the scientific method as a controlled experiment on how much light seedlings get, one variable changed, everything else kept the same, repeats and a fair conclusion, with goggles and the lab's rules kept throughout.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_A_CONTROLLED_EXPERIMENT = {
  id: "k12-a-controlled-experiment",
  index: "822",
  domain: "Education",
  trade: "Science class at the lab campus's teaching lab — learner and lab technician",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "A Controlled Experiment",
  title: simTitle("A Controlled Experiment"),
  tagline: "Change one thing, keep the rest the same — and goggles on before anything is poured",
  accent: 0x4fb88a,
  accentCss: "#4fb88a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"fair-test","name":"Fair Test","note":"A question turned into a fair test, one variable changed, the rest controlled, repeated and concluded only as far as the evidence goes"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Lab Board",
    currency: "TRIALS",
    ranks: ["Assistant","Observer","Tester","Investigator","Scientist"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-three-kinds-of-variable") },
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
    "change-two-things-at-once": "You gave one tray more light and more water at the same time. If two things change, you cannot tell which one caused the difference. A fair test changes only the thing you are testing and keeps everything else the same.",
    "one-trial-is-enough": "You drew a conclusion from a single tray of seedlings. One seedling can grow oddly for reasons nobody controls; repeats show whether the result is real or a fluke, and a conclusion from one trial is a guess.",
    "goggles-off-for-a-closer-look": "You lifted your goggles to read the label. In the lab, goggles stay on while anything is being poured or mixed, even plain plant food; the technician can read the label to you, and your eyes stay protected.",
    "prove-it-for-all-plants": "You said the result proves the same for every plant everywhere. Your experiment tested these seedlings in this lab; a fair conclusion says what the evidence shows and no more, and suggests testing other plants next."
  },

  lateNotes: {
    "kce-lab-log": "The results table is written once the trials are done — nothing to record yet.",
    "kce-checkin": "The check-in comes at the very end of the lab."
  },

  steps: [
    {
      id: "find-the-three-kinds-of-variable",
      kind: "find",
      noHint: true,
      targets: [
        "kce-independent",
        "kce-dependent",
        "kce-controlled"
      ],
      itemNames: {
        "kce-independent": "the light each tray gets",
        "kce-dependent": "the seedlings' growth",
        "kce-controlled": "the water each tray gets"
      },
      itemNotes: {
        "kce-independent": "The one thing you change on purpose.",
        "kce-dependent": "What you measure to see the effect.",
        "kce-controlled": "Kept the same, so it cannot cause the difference."
      },
      decoyNotes: {
        "kce-tray-colour": "The trays are all the same colour. Keep it that way, but it is not what you are testing."
      },
      title: "Find the three kinds of variable",
      cue: "Mark the variable you change, the one you measure and one you keep the same.",
      why: "A controlled experiment has three kinds of variable. The one you change on purpose is the independent variable, here the amount of light; the one you measure is the dependent variable, the seedlings' growth; and everything you keep the same, like water and soil, are the controls. Naming all three before starting is what makes the test fair."
    },
    {
      id: "put-your-goggles-on",
      kind: "select",
      target: "kce-goggles-card",
      title: "Put your goggles on",
      cue: "Put your goggles on and tie back long hair before the technician hands out anything.",
      why: "Goggles protect your eyes from splashes, even from liquids that seem harmless, and tying back hair keeps it clear of equipment. Doing both before anything is handed out is the lab's first rule, and it is the same one working scientists follow every day."
    },
    {
      id: "put-the-method-in-order",
      kind: "sequence",
      targets: [
        "kce-ord-question",
        "kce-ord-predict",
        "kce-ord-test",
        "kce-ord-conclude"
      ],
      itemNames: {
        "kce-ord-question": "1 · ask a testable question",
        "kce-ord-predict": "2 · write a prediction",
        "kce-ord-test": "3 · run a fair test with repeats",
        "kce-ord-conclude": "4 · conclude from the evidence"
      },
      title: "Put the method in order",
      cue: "Ask a question, predict, run a fair test with repeats, then conclude.",
      why: "A clear question tells you what to change and what to measure. A prediction written before the test stops the result from shaping what you say you expected. Running a fair test with repeats, and concluding only what the evidence shows, is the scientific method in miniature.",
      outOfOrderNote: "Out of order. Write the prediction before the test runs."
    },
    {
      id: "hold-the-ruler-still-against-the",
      kind: "hold",
      target: "kce-ruler-hold",
      seconds: 6,
      title: "Hold the ruler still against the seedling",
      cue: "Hold the ruler upright beside the seedling, zero at the soil, until you read it.",
      why: "A measurement is only fair if every seedling is measured the same way: ruler upright, zero at the soil surface, read at the tip. Holding it still until you have read it means your numbers can be compared across trays and repeats.",
      holdBreakNote: "The ruler tipped off the soil line. Set zero at the soil and hold it again."
    },
    {
      id: "say-why-only-one-thing-may",
      kind: "select",
      target: "kce-compare-card",
      title: "Say why only one thing may change",
      cue: "Say why the test changes only the light and keeps the water the same.",
      why: "If light and water both changed, a difference in growth could be caused by either, and you would not know which. Keeping everything else the same means any difference points to the one thing you changed, which is what makes the result mean something."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "kce-pl-two",
        "kce-pl-no-repeat",
        "kce-pl-too-much"
      ],
      itemNames: {
        "kce-pl-two": "two variables changed at once",
        "kce-pl-no-repeat": "no repeat trays",
        "kce-pl-too-much": "a conclusion for every plant"
      },
      itemNotes: {
        "kce-pl-two": "Change only one thing.",
        "kce-pl-no-repeat": "Repeats show whether a result is real.",
        "kce-pl-too-much": "Conclude only what the evidence shows."
      },
      decoyNotes: {
        "kce-pl-safety": "A safety note is good practice. Keep it."
      },
      title: "Spot the problems in a classmate's plan",
      cue: "Look at the draft experiment plan and mark each problem.",
      why: "Experiment plans go wrong in familiar ways: two variables changed at once, no repeats and a conclusion that claims more than the test can show. Spotting them in someone else's plan is how you learn to design a fair test of your own."
    },
    {
      id: "turn-the-lamp-dimmer-for-one",
      kind: "turn",
      target: "kce-lamp-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "LIGHT"
      },
      title: "Turn the lamp dimmer for one tray only",
      cue: "Turn the dimmer on one tray's lamp and leave the other lamps alone.",
      why: "Changing the light on one tray only, and leaving everything else as it was, is the heart of a fair test. If the growth differs later, the light is the only thing that could explain it, because it is the only thing that was different."
    },
    {
      id: "measure-the-same-amount-of-water",
      kind: "gauge",
      target: "kce-water-meter",
      gauge: {
        label: "WATER",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not the same amount. Match the other trays before pouring.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Measure the same amount of water for every tray",
      cue: "Commit when the measuring cylinder shows the same amount as the other trays got.",
      why: "Water is a control, so every tray must get the same amount. Measuring it carefully each time, at eye level, keeps it from becoming a second variable that could spoil the whole comparison without anyone noticing."
    },
    {
      id: "place-the-repeat-tray-beside-the",
      kind: "drag",
      target: "kce-repeat-token",
      drag: {
        to: "kce-repeat-spot",
        radius: 0.45,
        missNote: "Not under the same lamp yet. Repeats need the same conditions."
      },
      title: "Place the repeat tray beside the first",
      cue: "Drag the repeat tray to sit under the same lamp as the first tray.",
      why: "A repeat is the same test run again under the same conditions. Placing the repeat tray under the same lamp lets you see whether the result happens again, and a result that repeats is one you can start to trust."
    },
    {
      id: "keep-the-lamps-at-the-same",
      kind: "track",
      target: "kce-track-meter",
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
        label: "CONTROLS",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep the lamps at the same height",
      cue: "Keep the other trays' lamps steady at their set height as the day goes on.",
      why: "Controls can drift during an experiment: a lamp slips, a window lets in sunlight. Watching and correcting them keeps the test fair from start to finish, which is part of every real experiment, not just the setting up.",
      holdBreakNote: "A lamp slipped from its height. Put it back before it changes the test."
    },
    {
      id: "record-the-results-in-a-table",
      kind: "select",
      target: "kce-lab-log",
      doneLine: "Results recorded",
      title: "Record the results in a table",
      cue: "Write each tray's light setting and each seedling's growth, with repeats.",
      why: "A results table puts the independent and dependent variables side by side for every trial. Recording repeats separately, rather than only an average, shows how much the results varied, and that is what tells you how confident to be."
    },
    {
      id: "write-a-fair-conclusion",
      kind: "select",
      target: "kce-share-board",
      doneLine: "Conclusion written",
      title: "Write a fair conclusion",
      cue: "Say what the evidence shows, how sure you are and what you would test next.",
      why: "A fair conclusion answers the question, says how strong the evidence is and names what could be tested next. It never claims more than the experiment showed, and that honesty is what makes science trustworthy."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kce-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lab",
      cue: "What would you test next with a fair test? What was hardest to keep the same?",
      why: "Scientists end a session by writing down what they would change next time, so the class does the same aloud: one thing kept the test fair, one thing nearly spoiled it. Naming a near miss in a fair test is a skill in itself, and the lab lead can hear who owns it now."
    }
  ],

  interrupts: [
    {
      id: "water-is-spilled-on-the-floor",
      kind: "Spill",
      after: "hold-the-ruler-still-against-the",
      delay: 3,
      seconds: 12,
      target: "kce-tell-technician",
      alert: "A classmate knocks over a beaker and water spreads across the floor near the sink.",
      cue: "Tell the lab technician and keep people away from the spill.",
      why: "A wet lab floor is a slip hazard, and the technician knows what was in the beaker and how to clean it. Telling them straight away and keeping others clear stops a small spill becoming a fall.",
      missNote: "Nobody told the technician, and a classmate slipped and fell on the wet floor by the sink.",
      wrongNote: "That leaves the spill for someone to slip on. Tell the technician. Choose the response that deals with it now."
    },
    {
      id: "the-technician-asks-what-changed",
      kind: "Technician question",
      after: "keep-the-lamps-at-the-same",
      delay: 3,
      seconds: 12,
      target: "kce-say-variable",
      alert: "The lab technician asks what you changed between the trays and what you kept the same.",
      cue: "Say that only the light changed and name what you kept the same.",
      why: "The technician is checking the test is fair. Naming the one variable you changed and the controls you kept shows your result can be trusted, which is what anyone reading your report needs to know.",
      missNote: "You listed several changes, and the technician said the test could not show which one mattered.",
      wrongNote: "That names more than one change. Choose the response that deals with it now."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#767a80", base2: "#6a6e74", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e6e8ea", base2: "#d6d8dc", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "kce-independent", "the light each tray gets", {});
    bead(-1.42, 1.18, -0.62, "kce-dependent", "the seedlings' growth", {});
    bead(-1.03, 1.46, -0.71, "kce-controlled", "the water each tray gets", {});
    bead(-1.08, 0.9, -1.11, "kce-tray-colour", "the colour of the trays", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kce-ord-question", "1 · ask a testable question", {});
    bead(-0.58, 1.46, -1.44, "kce-ord-predict", "2 · write a prediction", {});
    bead(-0.24, 0.9, -1.23, "kce-ord-test", "3 · run a fair test with repeats", {});
    bead(0, 1.18, -1.55, "kce-ord-conclude", "4 · conclude from the evidence", {});
    bead(0.24, 1.46, -1.23, "kce-ruler-hold", "Ruler at the soil line", {});
    bead(0.58, 0.9, -1.44, "kce-pl-two", "two variables changed at once", {});
    bead(0.68, 1.18, -1.05, "kce-pl-no-repeat", "no repeat trays", {});
    bead(1.08, 1.46, -1.11, "kce-pl-too-much", "a conclusion for every plant", {});
    bead(1.03, 0.9, -0.71, "kce-pl-safety", "a safety note at the top", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kce-tell-technician", "Tell the technician and keep people away", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kce-say-variable", "Say the one thing you changed", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kce-goggles-card", "Goggles on, hair tied", "GOGGLES\nON", { ry: 1.2 });
    dials["kce-lamp-dial"] = dial(-1.89, -1.4, 0.93, "kce-lamp-dial", "One tray's lamp");
    meters["kce-water-meter"] = meter(-1.45, -1.85, 0.67, "kce-water-meter", "Water measured");
    tokens["kce-repeat-token"] = token(-0.92, -2.16, 0.4, "kce-repeat-token", "Repeat tray");
    spots["kce-repeat-spot"] = spot(-0.31, -2.33, 0.13, "kce-repeat-spot", "Under the same lamp");
    card(0.31, 1.35, -2.33, "kce-compare-card", "Why one change?", "ONLY THE\nLIGHT?", { ry: -0.13 });
    meters["kce-track-meter"] = meter(0.92, -2.16, -0.4, "kce-track-meter", "Controls kept steady");
    boards["kce-lab-log"] = board(1.45, -1.85, -0.67, "kce-lab-log", "Results table");
    boards["kce-share-board"] = board(1.89, -1.4, -0.93, "kce-share-board", "Fair conclusion");
    boards["kce-checkin"] = board(2.19, -0.85, -1.2, "kce-checkin", "End-of-lab check-in");
    hazardCard(-1.53, 0.72, -1.21, "change-two-things-at-once", "Give one tray more light and more water?", "TWO\nCHANGES", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "one-trial-is-enough", "Draw a conclusion from a single tray?", "ONE\nTRAY", 0.3);
    hazardCard(0.58, 0.72, -1.86, "goggles-off-for-a-closer-look", "Lift your goggles to see the label better?", "GOGGLES\nUP", -0.3);
    hazardCard(1.53, 0.72, -1.21, "prove-it-for-all-plants", "Say the result proves it for every plant?", "EVERY\nPLANT", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Change one thing only."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Lab technician", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["water-is-spilled-on-the-floor"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["water-is-spilled-on-the-floor"].visible = false;
    arrivals["the-technician-asks-what-changed"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-technician-asks-what-changed"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-repeat-tray-beside-the") { const s = spots["kce-repeat-spot"]; tokens["kce-repeat-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-results-in-a-table") repaint(boards["kce-lab-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Results recorded"], "#59c97b"));
        if (step.id === "write-a-fair-conclusion") repaint(boards["kce-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Conclusion written"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kce-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-only-one-thing-may") paintGuide("One change, so one cause.");
      },

      onHazard() {
        paintGuide("Stop. Did only one thing change? Are the goggles on?");
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
        if (it.id === "water-is-spilled-on-the-floor") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Technician told, spill cleaned. The lesson carries on."); }
        if (it.id === "the-technician-asks-what-changed") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("One change named, controls listed. The technician signs it off."); }
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
