import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Measuring and Scaling the Court. Upper-primary and lower-secondary maths on a real surface: area, perimeter and ratio, measured on the arena court and drawn to scale.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_MEASURING_AND_SCALING_THE_COURT = {
  id: "k12-measuring-and-scaling-the-court",
  index: "801",
  domain: "Education",
  trade: "Maths class on the arena court — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Measuring and Scaling the Court",
  title: simTitle("Measuring and Scaling the Court"),
  tagline: "Measure it twice, write the unit, then scale it — a court drawn to scale is a court you can reason about",
  accent: 0x5a9fd8,
  accentCss: "#5a9fd8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"true-to-scale","name":"True to Scale","note":"Court measured, units kept and a scale drawing that matches"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Scale Board",
    currency: "UNITS",
    ranks: ["Counter","Measurer","Surveyor","Scaler","Designer"],
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
    "mix-metres-and-steps": "You added a paced-out length to a taped one. Paces are a fine estimate, but they are not the same unit as the tape, and mixing them gives a number that looks precise and means nothing. Every measurement in a calculation has to be in one unit, written beside the number, or the drawing will not match the court.",
    "add-area-like-perimeter": "You added the side lengths and called it the area. Adding sides gives the distance around the court, which is the perimeter; area is how much surface the court covers and comes from multiplying length by width. Confusing the two is the most common mistake in this topic, and it is why every answer gets its unit written: a length in metres, an area in square metres.",
    "scale-one-side-only": "You shrank the length to fit the paper and left the width as it was. A scale drawing only works when every length is divided by the same scale factor; scale one side and the drawing is a different shape from the court, so any angle or ratio you read from it is wrong.",
    "run-across-during-play": "You walked out with the tape while players were still running. A measuring lesson on a working court waits for the court to be clear, and the caretaker says when it is: a tape across a playing surface is a trip line, and a learner bent over it is in the path of someone who is watching the ball, not the floor."
  },

  lateNotes: {
    "kmc-class-record": "The class record is written once the drawing and the ratio are checked — nothing to record yet.",
    "kmc-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      "id": "find-what-you-need-to-measure",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kmc-side-line",
        "kmc-end-line",
        "kmc-corner-square"
      ],
      "itemNames": {
        "kmc-side-line": "the long side line",
        "kmc-end-line": "the short end line",
        "kmc-corner-square": "a corner, to check it is square"
      },
      "itemNotes": {
        "kmc-side-line": "One of the two lengths the area depends on. Measure it end to end, along the line, not across the paint.",
        "kmc-end-line": "The second length. Length times width gives the area; the two added and doubled give the perimeter.",
        "kmc-corner-square": "If the corners are not square the shape is not a rectangle, and the rectangle formulas do not apply."
      },
      "decoyNotes": {
        "kmc-logo-centre": "The logo is interesting, but it does not change the area or the perimeter. Stick to what the question needs."
      },
      "title": "Find what you need to measure",
      "cue": "Mark the three things on the court you must measure before you can find its area and perimeter.",
      "why": "Before any calculation, a mathematician decides what actually needs measuring. For a rectangular court that is the length of a side line, the length of an end line and a check that the corners are square; everything else, from the centre circle to the key, can wait. Choosing the measurements first stops you taping the whole floor and still missing the one you need."
    },
    {
      "id": "ask-the-caretaker-for-the-all",
      "kind": "select",
      "target": "kmc-wait-for-clear",
      "title": "Ask the caretaker for the all-clear",
      "cue": "Ask whether the court is clear before you take the tape onto it.",
      "why": "A court is a working space before it is a maths lesson. The caretaker knows when play has stopped and the floor is dry, and asking first means the tape is never a trip line across a game. It is also the first habit of any fieldwork: the site's own rules come before the measurement, whatever the measurement is for."
    },
    {
      "id": "put-the-method-in-order",
      "kind": "sequence",
      "targets": [
        "kmc-ord-estimate",
        "kmc-ord-measure",
        "kmc-ord-record",
        "kmc-ord-calc"
      ],
      "itemNames": {
        "kmc-ord-estimate": "1 · estimate by pacing",
        "kmc-ord-measure": "2 · measure with the tape",
        "kmc-ord-record": "3 · record with the unit",
        "kmc-ord-calc": "4 · calculate from the record"
      },
      "title": "Put the method in order",
      "cue": "Estimate, measure, record with the unit, then calculate.",
      "why": "Estimating first gives you a number to check the tape against, so a misread tape shows up at once. Measuring and recording with the unit keeps every number honest. Calculating last, from the written record rather than memory, means someone else can follow your working and find your mistake, which is how mathematics is checked in the real world.",
      "outOfOrderNote": "Out of order. Estimate before you measure, so the estimate can catch a misread tape."
    },
    {
      "id": "hold-the-tape-taut-along-the",
      "kind": "hold",
      "target": "kmc-tape-held",
      "seconds": 6,
      "title": "Hold the tape taut along the line",
      "cue": "Your classmate holds the zero end at the corner. Hold the tape taut and straight along the side line.",
      "why": "A tape that sags or wanders off the line reads long, because a curve between two points is always longer than the straight line. Holding it taut and on the line for the whole reading is what makes the number the true length of the side, and it is the same care a surveyor takes on any real site.",
      "holdBreakNote": "The tape went slack. A sagging tape reads long — pull it taut along the line and read again."
    },
    {
      "id": "switch-from-length-to-area-units",
      "kind": "turn",
      "target": "kmc-unit-dial",
      "turn": {
        "turns": 0.5,
        "axis": "y",
        "label": "SQ M"
      },
      "title": "Switch from length to area units",
      "cue": "You have both lengths. Turn the unit dial from metres to square metres before you multiply.",
      "why": "Area is measured in square units because it counts how many unit squares fit on the surface. Turning the unit from metres to square metres before you multiply is a reminder that the answer is a different kind of quantity from either side: a length times a length is an area, and writing the right unit is how you prove you know which one you found."
    },
    {
      "id": "choose-a-scale-that-fits-the",
      "kind": "gauge",
      "target": "kmc-scale-meter",
      "gauge": {
        "label": "SCALE",
        "speed": 0.6,
        "green": [
          0.4,
          0.58
        ],
        "missNote": "Outside the band. Too large and it will not fit; too small and nobody can read it. Try again."
      },
      "title": "Choose a scale that fits the page",
      "cue": "Commit when the scale factor lets the whole court fit on the paper with a margin, not too small to read.",
      "why": "Choosing a scale is a trade: too large and the court runs off the page, too small and the key and circles become too tiny to draw. A good scale fits the whole shape with a margin and is easy to work with, which is why mapmakers and architects choose round, simple scale factors rather than awkward ones."
    },
    {
      "id": "place-the-scaled-length-on-the",
      "kind": "drag",
      "target": "kmc-length-token",
      "drag": {
        "to": "kmc-drawing-spot",
        "radius": 0.45,
        "missNote": "It is not on the drawing yet. Take it all the way to the paper."
      },
      "title": "Place the scaled length on the drawing",
      "cue": "Drag the scaled side length onto the scale drawing, then do the same division for the width.",
      "why": "A scale drawing is made by dividing every real length by the same scale factor and drawing the results. Placing the scaled length on the drawing, then the scaled width, gives a shape exactly the same as the court but smaller, which means any angle you measure on the drawing is the same angle on the floor."
    },
    {
      "id": "write-the-length-to-width-ratio",
      "kind": "select",
      "target": "kmc-ratio-card",
      "title": "Write the length-to-width ratio",
      "cue": "Write length to width as a ratio, then check it is the same on the drawing as on the court.",
      "why": "A ratio compares two quantities of the same kind, and a true scale drawing keeps every ratio the court has. Checking that length to width is the same on paper as on the floor is the quickest proof that the drawing is right, and it is how a designer knows a model will look like the thing it models."
    },
    {
      "id": "catch-the-mistakes-in-a-classmate",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kmc-err-no-unit",
        "kmc-err-perim-area",
        "kmc-err-one-scaled"
      ],
      "itemNames": {
        "kmc-err-no-unit": "an answer with no unit",
        "kmc-err-perim-area": "a perimeter labelled as area",
        "kmc-err-one-scaled": "a drawing with one side scaled"
      },
      "itemNotes": {
        "kmc-err-no-unit": "A number with no unit could be a length, an area or nothing at all. Every answer carries its unit.",
        "kmc-err-perim-area": "Adding sides gives the distance around. Area comes from length times width.",
        "kmc-err-one-scaled": "Every length must be divided by the same scale factor, or the shape changes."
      },
      "decoyNotes": {
        "kmc-ok-estimate": "Writing an estimate first is good practice. Leave it in."
      },
      "title": "Catch the mistakes in a classmate's working",
      "cue": "Look at the worked sheet on the bench and mark each mistake before it is handed in.",
      "why": "Checking someone else's working is a skill of its own: you have to follow their reasoning, not just compare answers. The usual slips are a missing unit, a perimeter labelled as an area, and one side scaled while the other was not. Finding them in someone else's work is how you learn to find them in your own before a teacher does."
    },
    {
      "id": "keep-the-answer-close-to-the",
      "kind": "track",
      "target": "kmc-check-meter",
      "seconds": 8,
      "track": {
        "start": 0.3,
        "green": [
          0.4,
          0.62
        ],
        "rise": 0.46,
        "fall": 0.38,
        "drift": 0.14,
        "label": "AGREE"
      },
      "title": "Keep the answer close to the estimate",
      "cue": "Hold the calculated answer in band with your paced estimate while you recheck the arithmetic.",
      "why": "An estimate is your safety net: if the calculated area is wildly different from what pacing suggested, something went wrong, usually a slipped decimal or a unit mixed in. Holding the two in agreement while you recheck is what careful people do with any number that matters, from a recipe to a bridge.",
      "holdBreakNote": "The answer and the estimate drifted apart. Recheck the arithmetic and the units before you go on."
    },
    {
      "id": "record-the-measurements-and-the-drawing",
      "kind": "select",
      "target": "kmc-class-record",
      "doneLine": "Measurements and drawing recorded",
      "title": "Record the measurements and the drawing",
      "cue": "Write the lengths, the units, the scale factor and the ratio on the class record.",
      "why": "A result nobody can check is not finished. Recording the measured lengths with their units, the scale factor you chose and the ratio you checked means your teacher, or anyone else, can repeat the work and get the same answer. It is the difference between a guess that happened to be right and a measurement."
    },
    {
      "id": "show-the-class-how-you-checked",
      "kind": "select",
      "target": "kmc-share-board",
      "doneLine": "Method shared with the class",
      "title": "Show the class how you checked",
      "cue": "Explain to the class how the estimate and the ratio proved your drawing was right.",
      "why": "Explaining a method out loud is the strongest test of whether you understand it. Showing the class how the estimate caught errors and how the ratio proved the drawing matched the court helps classmates who got stuck and fixes the idea in your own memory far better than a mark on a page."
    },
    {
      "id": "crew-check-in",
      "kind": "select",
      "target": "kmc-checkin",
      "doneLine": "Checked in",
      "title": "Check in at the end of the lesson",
      "cue": "How did that go? What was hard, and what would you do differently next time?",
      "why": "A short check-in at the end of a lesson tells the teacher who is confident and who needs another go, and it gives every learner a moment to notice what they learned. Nobody is graded here; the question is simply how it went and what to try next, with the teacher or a trusted adult there for anyone who wants to talk more."
    }
  ],

  interrupts: [
    {
      "id": "a-ball-rolls-onto-the-court",
      "kind": "Ball on the court",
      "after": "hold-the-tape-taut-along-the",
      "delay": 3,
      "seconds": 12,
      "target": "kmc-stop-and-clear",
      "alert": "A ball from the next court rolls across the tape line and a younger pupil runs after it.",
      "cue": "Stop measuring, call out, and let the caretaker clear the court before anyone steps back on.",
      "why": "A tape across a court is a trip line the moment anyone runs, and a younger pupil chasing a ball is watching the ball. Stopping, calling out and letting the caretaker clear the court comes before any measurement; the reading can be taken again, a fall cannot be taken back.",
      "missNote": "Nobody stopped. The pupil caught a foot on the tape and fell, and the reading was lost anyway.",
      "wrongNote": "That does not stop anyone. Call out and pause the measuring."
    },
    {
      "id": "the-teacher-asks-for-your-estimate",
      "kind": "Teacher question",
      "after": "keep-the-answer-close-to-the",
      "delay": 3,
      "seconds": 12,
      "target": "kmc-say-the-estimate",
      "alert": "The teacher stops by and asks what you expect the area to be before you have finished calculating.",
      "cue": "Give your paced estimate with its unit and say how you got it.",
      "why": "A teacher asking for an estimate mid-task is checking your reasoning, not your arithmetic. Saying the estimate with its unit, and how pacing gave it to you, shows you know roughly what the answer should be, which is the skill that catches mistakes long after the tape is put away.",
      "missNote": "You had no estimate to give, so the error in your calculation went unnoticed until it was marked.",
      "wrongNote": "That is not an estimate with a unit. Say the number and how you got it."
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
    bead(-1.22, 0.9, -0.27, "kmc-side-line", "the long side line", {});
    bead(-1.42, 1.18, -0.62, "kmc-end-line", "the short end line", {});
    bead(-1.03, 1.46, -0.71, "kmc-corner-square", "a corner, to check it is square", {});
    bead(-1.08, 0.9, -1.11, "kmc-logo-centre", "the logo in the centre circle", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kmc-ord-estimate", "1 · estimate by pacing", {});
    bead(-0.58, 1.46, -1.44, "kmc-ord-measure", "2 · measure with the tape", {});
    bead(-0.24, 0.9, -1.23, "kmc-ord-record", "3 · record with the unit", {});
    bead(0, 1.18, -1.55, "kmc-ord-calc", "4 · calculate from the record", {});
    bead(0.24, 1.46, -1.23, "kmc-tape-held", "Tape held taut along the line", {});
    bead(0.58, 0.9, -1.44, "kmc-err-no-unit", "an answer with no unit", {});
    bead(0.68, 1.18, -1.05, "kmc-err-perim-area", "a perimeter labelled as area", {});
    bead(1.08, 1.46, -1.11, "kmc-err-one-scaled", "a drawing with one side scaled", {});
    bead(1.03, 0.9, -0.71, "kmc-ok-estimate", "an estimate written first", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kmc-stop-and-clear", "Stop, clear the ball, check the tape", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kmc-say-the-estimate", "Say your estimate and why", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kmc-wait-for-clear", "Wait for the caretaker's all-clear", "COURT\nCLEAR?", { ry: 1.2 });
    dials["kmc-unit-dial"] = dial(-1.89, -1.4, 0.93, "kmc-unit-dial", "Unit selector");
    meters["kmc-scale-meter"] = meter(-1.45, -1.85, 0.67, "kmc-scale-meter", "Scale factor meter");
    tokens["kmc-length-token"] = token(-0.92, -2.16, 0.4, "kmc-length-token", "Scaled length");
    spots["kmc-drawing-spot"] = spot(-0.31, -2.33, 0.13, "kmc-drawing-spot", "On the scale drawing");
    card(0.31, 1.35, -2.33, "kmc-ratio-card", "Length to width, as a ratio", "LENGTH :\nWIDTH", { ry: -0.13 });
    meters["kmc-check-meter"] = meter(0.92, -2.16, -0.4, "kmc-check-meter", "Estimate and answer agree");
    boards["kmc-class-record"] = board(1.45, -1.85, -0.67, "kmc-class-record", "Class record");
    boards["kmc-share-board"] = board(1.89, -1.4, -0.93, "kmc-share-board", "Share the method");
    boards["kmc-checkin"] = board(2.19, -0.85, -1.2, "kmc-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "mix-metres-and-steps", "Mix paced steps with tape readings?", "STEPS +\nMETRES", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "add-area-like-perimeter", "Add the sides to get the area?", "AREA =\nSIDE + SIDE", 0.3);
    hazardCard(0.58, 0.72, -1.86, "scale-one-side-only", "Scale the length but not the width?", "SCALE\nONE SIDE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "run-across-during-play", "Walk onto the court while a game is on?", "WALK ON\nDURING PLAY", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Measure twice. Write the unit."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Court caretaker", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-ball-rolls-onto-the-court"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-ball-rolls-onto-the-court"].visible = false;
    arrivals["the-teacher-asks-for-your-estimate"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-teacher-asks-for-your-estimate"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-scaled-length-on-the") { const s = spots["kmc-drawing-spot"]; tokens["kmc-length-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-measurements-and-the-drawing") repaint(boards["kmc-class-record"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Measurements and drawing recorded"], "#59c97b"));
        if (step.id === "show-the-class-how-you-checked") repaint(boards["kmc-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Method shared with the class"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kmc-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "write-the-length-to-width-ratio") paintGuide("Area covers, perimeter goes around, ratio compares.");
      },

      onHazard() {
        paintGuide("Stop. Check the unit and the method before you go on.");
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
        if (it.id === "a-ball-rolls-onto-the-court") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Stopped and cleared. Take the reading again from the corner."); }
        if (it.id === "the-teacher-asks-for-your-estimate") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Estimate given with its unit. The calculation now has something to be checked against."); }
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
