import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Measuring a Floodwall in Steps. Upper-primary maths at the Surge Barrier and Floodwall Crew in St. Bernard Parish: measuring a stretch of wall by pacing it, finding the length of your own pace against a tape, turning steps into a real length, checking by counting the wall's panels, and comparing everyone's answers, using only the tape, the panels and the paces the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_MEASURING_A_FLOODWALL_IN_STEPS = {
  id: "k12-by-measuring-a-floodwall-in-steps",
  index: "840",
  domain: "Education",
  trade: "Maths class along the floodwall with the structure crew — learner and floodwall crew foreman",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Measuring a Floodwall in Steps",
  title: simTitle("Measuring a Floodwall in Steps"),
  tagline: "Measure your pace, count your steps, check with the panels — the same unit all the way",
  accent: 0x8a8f98,
  accentCss: "#8a8f98",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"pace-counter","name":"Pace Counter","note":"Measured a stretch of floodwall by pacing, turned steps into a real length with a measured pace and checked it against the panels"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Wall Board",
    currency: "PACES",
    ranks: ["Walker","Pacer","Counter","Checker","Foreman"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-you-need-to-measure") },
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
    "uneven-steps": "You changed the size of your steps as you went. A pace is only a unit if it stays the same every time. Walk at your normal, steady pace from start to finish, just as you did when you measured it against the tape.",
    "count-from-one": "You counted one before your first step had landed. Count each step as your foot lands, starting with your toes on the line. Counting too soon adds a step that was never taken.",
    "climb-the-wall": "You tried to climb the floodwall. Walls are not for climbing, and the crew measures height from the ground with a marked pole. Stay on the path at the foot of the wall and read the pole instead.",
    "mix-the-units": "You added steps to a tape reading. They are different units, like adding apples to minutes. Turn your steps into the tape's unit first, using your measured pace, then compare."
  },

  lateNotes: {
    "byx-wall-log": "The measurement record is written once the wall is paced — nothing to record yet.",
    "byx-checkin": "The check-in comes at the very end of the walk."
  },

  steps: [
    {
      id: "find-what-you-need-to-measure",
      kind: "find",
      noHint: true,
      targets: [
        "byx-start",
        "byx-end",
        "byx-joins"
      ],
      itemNames: {
        "byx-start": "the painted starting mark",
        "byx-end": "the painted ending mark",
        "byx-joins": "the joins between wall panels"
      },
      itemNotes: {
        "byx-start": "Toes on the line to begin.",
        "byx-end": "Stop counting when you reach it.",
        "byx-joins": "A second way to check your answer."
      },
      decoyNotes: {
        "byx-bird": "Lovely to see, but it will not help you measure."
      },
      title: "Find what you need to measure the wall",
      cue: "Mark the three things along the wall you will use to measure its length.",
      why: "To measure something long without a very long tape, you need a starting mark, an ending mark and a unit you can repeat. Here the unit is your own pace, checked against the crew's tape. The panel joins on the wall give you a second way to check. Knowing what you will use before you start makes the measurement fair."
    },
    {
      id: "put-the-pacing-method-in-order",
      kind: "sequence",
      targets: [
        "byx-ord-pace",
        "byx-ord-walk",
        "byx-ord-convert",
        "byx-ord-check"
      ],
      itemNames: {
        "byx-ord-pace": "1 · measure your pace on the tape",
        "byx-ord-walk": "2 · walk the wall counting steps",
        "byx-ord-convert": "3 · turn steps into length",
        "byx-ord-check": "4 · check with the panels"
      },
      title: "Put the pacing method in order",
      cue: "Measure your pace on the tape, walk the wall counting steps, turn steps into length, then check with the panels.",
      why: "Measuring your pace first tells you what one step is worth. Walking and counting gives the number of steps. Multiplying turns steps into a real length in the tape's unit. Checking with the panels last tells you whether your answer is sensible. That order means every number has a reason behind it.",
      outOfOrderNote: "Out of order. Measure your own pace against the tape before you walk the wall."
    },
    {
      id: "walk-on-the-path-at-the",
      kind: "select",
      target: "byx-path-card",
      title: "Walk on the path at the foot of the wall",
      cue: "Step onto the gravel path along the foot of the wall before you start measuring.",
      why: "The path is flat and firm, and it keeps you away from the crew's equipment and off the wall itself. Walking on the same flat path for every measurement also keeps your steps even. The crew uses this path for its own inspections, so it is the safe, sensible place to be."
    },
    {
      id: "turn-the-tape-out-along-the",
      kind: "turn",
      target: "byx-tape-reel",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "TAPE"
      },
      title: "Turn the tape out along the ground",
      cue: "Turn the tape reel to pull the crew's tape out flat along the path.",
      why: "The tape gives you a true length to compare your pace against. Pulling it out flat and straight, not sagging or twisted, makes the reading accurate. Crews always check their tape is flat and straight, because a sagging tape reads longer than the ground really is."
    },
    {
      id: "read-the-length-of-your-paces",
      kind: "gauge",
      target: "byx-pace-meter",
      gauge: {
        label: "PACE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not where your step landed. Read the tape right at your heel."
      },
      title: "Read the length of your paces on the tape",
      cue: "Commit when the marker sits where your last step landed on the tape.",
      why: "Walking a few steps along the tape and reading where you land tells you how long your steps are. Sharing that length equally across the steps gives the length of one pace. That is your personal unit, and every later answer depends on reading this spot carefully."
    },
    {
      id: "keep-a-steady-pace-along-the",
      kind: "hold",
      target: "byx-steady-pace",
      seconds: 6,
      title: "Keep a steady pace along the wall",
      cue: "Hold a steady pace along the wall until you reach the ending mark.",
      why: "Your measured pace is only useful if you walk the same way along the wall. Keeping a steady, normal rhythm, not rushing and not stretching, means every step matches the pace you measured on the tape. Steady walking is what turns a count of steps into a fair measurement.",
      holdBreakNote: "Your pace changed partway along. Go back to the start and walk it steadily."
    },
    {
      id: "move-the-counter-bead-for-each",
      kind: "drag",
      target: "byx-bead",
      drag: {
        to: "byx-counted",
        radius: 0.45,
        missNote: "The bead is not on the counted side yet. Slide it all the way across."
      },
      title: "Move the counter bead for each step",
      cue: "Drag a bead along the counting string each time your foot lands.",
      why: "Counting in your head while walking is easy to lose track of. Moving one bead for each step keeps an honest count you can check at the end. Crews use clickers or tally sheets for long counts for the same reason: a count you can see is a count you can trust."
    },
    {
      id: "spot-the-mistakes-in-a-partners",
      kind: "find",
      noHint: true,
      targets: [
        "byx-pn-uneven",
        "byx-pn-early",
        "byx-pn-mixed"
      ],
      itemNames: {
        "byx-pn-uneven": "steps that changed size",
        "byx-pn-early": "a count that started too soon",
        "byx-pn-mixed": "steps added to a tape reading"
      },
      itemNotes: {
        "byx-pn-uneven": "Walk at one steady pace.",
        "byx-pn-early": "Count as each foot lands.",
        "byx-pn-mixed": "Turn steps into the tape's unit first."
      },
      decoyNotes: {
        "byx-pn-unit": "Good practice. Keep it."
      },
      title: "Spot the mistakes in a partner's measurement",
      cue: "Look at your partner's notes and mark each mistake.",
      why: "Pacing goes wrong in familiar ways: steps that changed size, a count that started too soon, or steps and tape units added together. Finding them in a partner's notes helps you both improve, and it trains you to check your own before you share it with the crew."
    },
    {
      id: "choose-how-to-turn-steps-into",
      kind: "select",
      target: "byx-method-card",
      title: "Choose how to turn steps into length",
      cue: "Choose the method that turns your step count into a length in the tape's unit.",
      why: "If one pace is a known length, then many paces are that length many times over. Multiplying your step count by your pace length gives the wall's length in the tape's unit. Choosing that method, and saying why, shows you understand measuring as repeating a unit."
    },
    {
      id: "follow-the-panel-joins-along-the",
      kind: "track",
      target: "byx-join-meter",
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
        label: "PANELS"
      },
      title: "Follow the panel joins along the wall",
      cue: "Keep the marker on each panel join as you walk back along the wall counting panels.",
      why: "The wall is made of panels that are all the same width. Counting the panels and multiplying by one panel's width gives a second answer to compare with your pacing. If the two are close, you can be confident; if not, you look for where a count went wrong.",
      holdBreakNote: "The marker skipped a join. Go back to the last panel you counted."
    },
    {
      id: "record-your-measurements",
      kind: "select",
      target: "byx-wall-log",
      doneLine: "Measurements recorded",
      title: "Record your measurements",
      cue: "Write your pace length, your step count, the wall's length and your panel check, each with its unit.",
      why: "Writing every number with its unit shows your working and lets anyone check it. It also shows how close your two methods came. The crew keeps records of every measurement it takes along the wall, so the next crew can compare and spot any change."
    },
    {
      id: "compare-with-the-class-and-the",
      kind: "select",
      target: "byx-share-board",
      doneLine: "Answers compared",
      title: "Compare with the class and the foreman",
      cue: "Add your answer to the class chart and compare it with the foreman's measurement.",
      why: "Everyone's pace is different, but if everyone measured well, everyone's final length should be close. Seeing all the answers together shows the spread, and comparing with the foreman's tape shows how accurate pacing can be. That is how measurers learn to trust, and check, their methods."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byx-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the wall",
      cue: "How close did your pacing get? What would you do differently next time?",
      why: "The floodwall crew finishes each inspection by comparing notes at the end of the wall, so the class does the same. Each learner says how close their pacing came and one thing that made it fair. If anyone mixed steps with tape units, the group works one example together before heading back."
    }
  ],

  interrupts: [
    {
      id: "a-crew-cart-comes-along-the-path",
      kind: "Crew cart",
      after: "keep-a-steady-pace-along-the",
      delay: 3,
      seconds: 12,
      target: "byx-step-aside",
      alert: "A crew cart comes slowly along the gravel path towards the group.",
      cue: "Step to the side of the path, stay together and wait for the cart to pass.",
      why: "The path is shared with the crew's cart. Stepping aside together, where the driver can see everyone, keeps it clear and safe. Your count can wait; remember the number or leave your beads where they are.",
      missNote: "Nobody stepped aside, and the crew cart had to stop and wait on the path while the group kept counting.",
      wrongNote: "That keeps you in the cart's way. Step to the side of the path. Choose the response that deals with it now."
    },
    {
      id: "the-foreman-asks-about-units",
      kind: "Foreman question",
      after: "follow-the-panel-joins-along-the",
      delay: 3,
      seconds: 12,
      target: "byx-say-unit",
      alert: "The foreman asks what unit your wall length is measured in.",
      cue: "Say the tape's unit, and that you turned your steps into it using your pace.",
      why: "A length with no unit means nothing to anyone else. Saying the unit, and how you got there, makes your answer something the crew could use. The foreman asks because units are where many measuring mistakes begin.",
      missNote: "You gave a bare number with no unit, and the foreman could not tell whether it meant steps or tape lengths.",
      wrongNote: "That does not name the unit. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x8a8f98;
    const CSS = "#8a8f98";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#76766e", base2: "#686860", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e4e4dc", base2: "#d4d4ca", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byx-start", "the painted starting mark", {});
    bead(-1.42, 1.18, -0.62, "byx-end", "the painted ending mark", {});
    bead(-1.03, 1.46, -0.71, "byx-joins", "the joins between wall panels", {});
    bead(-1.08, 0.9, -1.11, "byx-bird", "a pelican on the railing", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byx-ord-pace", "1 · measure your pace on the tape", {});
    bead(-0.58, 1.46, -1.44, "byx-ord-walk", "2 · walk the wall counting steps", {});
    bead(-0.24, 0.9, -1.23, "byx-ord-convert", "3 · turn steps into length", {});
    bead(0, 1.18, -1.55, "byx-ord-check", "4 · check with the panels", {});
    bead(0.24, 1.46, -1.23, "byx-steady-pace", "Hold a steady pace", {});
    bead(0.58, 0.9, -1.44, "byx-pn-uneven", "steps that changed size", {});
    bead(0.68, 1.18, -1.05, "byx-pn-early", "a count that started too soon", {});
    bead(1.08, 1.46, -1.11, "byx-pn-mixed", "steps added to a tape reading", {});
    bead(1.03, 0.9, -0.71, "byx-pn-unit", "the unit written beside the answer", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byx-step-aside", "Step to the side of the path and let the cart pass", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byx-say-unit", "Say which unit your answer is in", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byx-path-card", "On the path", "GRAVEL\nPATH", { ry: 1.2 });
    dials["byx-tape-reel"] = dial(-1.89, -1.4, 0.93, "byx-tape-reel", "Tape reel");
    meters["byx-pace-meter"] = meter(-1.45, -1.85, 0.67, "byx-pace-meter", "Pace reading");
    tokens["byx-bead"] = token(-0.92, -2.16, 0.4, "byx-bead", "Counting bead");
    spots["byx-counted"] = spot(-0.31, -2.33, 0.13, "byx-counted", "The counted side");
    card(0.31, 1.35, -2.33, "byx-method-card", "Choose the method", "STEPS TO\nLENGTH?", { ry: -0.13 });
    meters["byx-join-meter"] = meter(0.92, -2.16, -0.4, "byx-join-meter", "Panel joins followed");
    boards["byx-wall-log"] = board(1.45, -1.85, -0.67, "byx-wall-log", "Measurement record");
    boards["byx-share-board"] = board(1.89, -1.4, -0.93, "byx-share-board", "Compare answers");
    boards["byx-checkin"] = board(2.19, -0.85, -1.2, "byx-checkin", "End-of-walk check-in");
    hazardCard(-1.53, 0.72, -1.21, "uneven-steps", "Take big steps at the start and small ones at the end?", "UNEVEN\nSTEPS", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "count-from-one", "Say one as you lift your foot at the starting line?", "COUNT\nTOO SOON", 0.3);
    hazardCard(0.58, 0.72, -1.86, "climb-the-wall", "Climb onto the wall to measure how high it is?", "CLIMB\nUP", -0.3);
    hazardCard(1.53, 0.72, -1.21, "mix-the-units", "Add your steps to your partner's tape reading?", "MIXED\nUNITS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Measure your pace first."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Floodwall crew foreman", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Crew cart driver", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-crew-cart-comes-along-the-path"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-crew-cart-comes-along-the-path"].visible = false;
    arrivals["the-foreman-asks-about-units"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-foreman-asks-about-units"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-counter-bead-for-each") { const s = spots["byx-counted"]; tokens["byx-bead"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-your-measurements") repaint(boards["byx-wall-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Measurements recorded"], "#59c97b"));
        if (step.id === "compare-with-the-class-and-the") repaint(boards["byx-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Answers compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byx-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "choose-how-to-turn-steps-into") paintGuide("Steps times pace gives the length.");
      },

      onHazard() {
        paintGuide("Stop. Same unit — and stay off the wall.");
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
        if (it.id === "a-crew-cart-comes-along-the-path") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group stepped aside, the cart passed. The lesson carries on."); }
        if (it.id === "the-foreman-asks-about-units") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Unit named and explained. The lesson carries on."); }
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
