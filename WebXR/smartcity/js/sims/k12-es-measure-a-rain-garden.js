import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Measure a Rain Garden. Upper-primary maths at the Sunset District School Campus in San Francisco: how to measure a rain garden bed with a tape and a grid, find its length, width and area, and scale it on paper, using only what the tape, the grid and the garden in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_MEASURE_A_RAIN_GARDEN = {
  id: "k12-es-measure-a-rain-garden",
  index: "882",
  domain: "Education",
  trade: "Maths class with the school garden crew sizing a rain garden — learner and garden crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Measure a Rain Garden",
  title: simTitle("Measure a Rain Garden"),
  tagline: "Length times width gives the area — measure the bed with the crew, then draw it to scale",
  accent: 0x8aa04a,
  accentCss: "#8aa04a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"garden-measurer","name":"Garden Measurer","note":"Measured a rain garden bed with a tape, worked out its area on a grid and drew it to scale for the crew"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Measure Board",
    currency: "SQUARES",
    ranks: ["Mark","Line","Edge","Area","Garden Planner"],
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
    "add-instead-of-multiply": "You added the length and the width. Adding them gives half the distance round the edge, not the area. Area counts the squares inside, so multiply the length by the width.",
    "tape-not-at-zero": "You started from the tape case instead of the zero mark. The zero is at the hook end. Hold the hook on the edge of the bed and read where the other edge meets the tape.",
    "stretch-across-the-path": "You stretched the tape across the path where people walk. A tape at ankle height is a tripping line. Ask the crew lead to hold people back, and measure quickly, then reel it in.",
    "step-into-the-bed": "You stepped into the garden bed. Feet pack the soil hard so it cannot soak up rain. Hold the tape from the path edge, and let the stakes mark the corners."
  },

  lateNotes: {
    "esg-measure-log": "The measurements are written once you have read the tape — nothing to record yet.",
    "esg-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-what-you-need-to-measure",
      kind: "find",
      noHint: true,
      targets: [
        "esg-stakes",
        "esg-long",
        "esg-short"
      ],
      itemNames: {
        "esg-stakes": "the four corner stakes",
        "esg-long": "the long side of the bed",
        "esg-short": "the short side of the bed"
      },
      itemNotes: {
        "esg-stakes": "They mark where the bed ends.",
        "esg-long": "This is the length.",
        "esg-short": "This is the width."
      },
      decoyNotes: {
        "esg-hose": "Useful for watering, but not for measuring."
      },
      title: "Find what you need to measure",
      cue: "Mark the three things that tell you the size of the bed.",
      why: "To size a rectangle-shaped bed you need its length, its width and a way to see its corners. The corner stakes show where the bed begins and ends, the long side is the length, and the short side is the width. Once you have those, you can find the area and draw it on paper."
    },
    {
      id: "put-the-measuring-steps-in-order",
      kind: "sequence",
      targets: [
        "esg-ord-length",
        "esg-ord-width",
        "esg-ord-multiply",
        "esg-ord-unit"
      ],
      itemNames: {
        "esg-ord-length": "1 · measure the length",
        "esg-ord-width": "2 · measure the width",
        "esg-ord-multiply": "3 · multiply length by width",
        "esg-ord-unit": "4 · write the answer with square units"
      },
      title: "Put the measuring steps in order",
      cue: "Put the steps for finding the bed's area in order.",
      why: "Finding an area has a clear order. You measure the length, measure the width, multiply them, and write the answer with its unit. Following the order means nothing gets missed and anyone can check your working.",
      outOfOrderNote: "Out of order. Measure the length first."
    },
    {
      id: "check-the-tape-starts-at-zero",
      kind: "select",
      target: "esg-zero-card",
      title: "Check the tape starts at zero",
      cue: "Point to the zero mark at the hook end of the tape before you start.",
      why: "Every measurement starts from zero. The hook end of the tape is the zero mark, so it goes on the edge you measure from. Checking it first stops a very common mistake, and crews check it every time before they cut or dig."
    },
    {
      id: "set-the-scale-on-the-drawing",
      kind: "turn",
      target: "esg-scale-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SCALE"
      },
      title: "Set the scale on the drawing grid",
      cue: "Turn the scale dial so one grid square stands for one step of the tape.",
      why: "A scale drawing uses small squares on paper to stand for real distances. Choosing the scale first means every side of the drawing matches the real bed. Garden planners draw to scale so they can plan plants before anyone digs."
    },
    {
      id: "read-the-length-on-the-tape",
      kind: "gauge",
      target: "esg-tape-meter",
      gauge: {
        label: "TAPE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the far stake. Read where the stake meets the tape."
      },
      title: "Read the length on the tape",
      cue: "Commit when the marker sits where the far stake meets the tape.",
      why: "Reading the tape exactly where the far stake stands gives the true length. Read straight down, not from the side, so the line you see is the right one. A careful reading here makes the area correct later."
    },
    {
      id: "hold-the-tape-hook-on-the",
      kind: "hold",
      target: "esg-hook-hold",
      seconds: 6,
      title: "Hold the tape hook on the corner stake",
      cue: "Hold the hook against the corner stake while your partner reads the tape.",
      why: "If the hook slips, the reading is too short. Holding it firmly against the stake keeps zero exactly on the corner. Measuring is a two-person job, one holding and one reading, just as the crew does it.",
      holdBreakNote: "The hook slipped off the stake. Hold it on the corner again."
    },
    {
      id: "place-the-bed-on-the-drawing",
      kind: "drag",
      target: "esg-outline",
      drag: {
        to: "esg-grid-spot",
        radius: 0.45,
        missNote: "Not on the grid points yet. Line the corners up with the grid."
      },
      title: "Place the bed on the drawing grid",
      cue: "Drag the bed outline onto the grid so its corners sit on grid points.",
      why: "Putting the corners on grid points makes the scale drawing accurate. Then you can count the squares inside to check your multiplying. When the count and the sum match, you know your area is right."
    },
    {
      id: "spot-the-parts-to-add-to",
      kind: "find",
      noHint: true,
      targets: [
        "esg-gap",
        "esg-low",
        "esg-path"
      ],
      itemNames: {
        "esg-gap": "the kerb gap where water enters",
        "esg-low": "the low middle of the bed",
        "esg-path": "the path around the bed"
      },
      itemNotes: {
        "esg-gap": "Show where the water comes in.",
        "esg-low": "Thirsty plants go here.",
        "esg-path": "Feet stay on this side."
      },
      decoyNotes: {
        "esg-cloud": "Rain may come from it, but it does not go on the plan."
      },
      title: "Spot the parts to add to the plan",
      cue: "Look at the real garden and mark each part the plan should show.",
      why: "A good plan shows more than the edges. The kerb gap where water enters, the low middle where water collects and the path around the bed all matter to the crew. Adding them helps the crew plant the right things in the right places."
    },
    {
      id: "choose-the-right-area-sum",
      kind: "select",
      target: "esg-sum-card",
      title: "Choose the right area sum",
      cue: "Choose the sum that gives the area of the bed.",
      why: "The area of a rectangle is its length multiplied by its width. A sum that adds them gives part of the distance round the edge instead. Choosing the multiply sum shows you know the difference between area and perimeter."
    },
    {
      id: "trace-the-edge-of-the-bed",
      kind: "track",
      target: "esg-edge-track",
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
        label: "EDGE"
      },
      title: "Trace the edge of the bed on the grid",
      cue: "Keep the marker on the edge as you trace all the way round the bed.",
      why: "Tracing the edge shows the perimeter, the distance all the way round. It is different from the area, which is the space inside. Tracing both on the same drawing helps you see why they are measured differently.",
      holdBreakNote: "The marker left the edge. Find the edge again and keep tracing."
    },
    {
      id: "record-the-measurements-and-the-area",
      kind: "select",
      target: "esg-measure-log",
      doneLine: "Measurements recorded",
      title: "Record the measurements and the area",
      cue: "Write the length, the width and the area with their units on the plan.",
      why: "Writing every measurement with its unit lets anyone check your work. The crew uses these numbers to order soil and plants. A missing unit can cause a big mix-up, so units always go with the numbers."
    },
    {
      id: "check-your-area-with-another-pair",
      kind: "select",
      target: "esg-share-board",
      doneLine: "Areas compared",
      title: "Check your area with another pair",
      cue: "Compare your area with another pair who measured the same bed.",
      why: "Two pairs measuring the same bed should get about the same answer. If not, someone may have missed zero or added instead of multiplied. Checking with others is how crews catch mistakes before they order materials."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esg-checkin",
      doneLine: "Checked in",
      title: "Check in before handing the plan over",
      cue: "How do you find the area of the bed? Why do units matter?",
      why: "The crew lead checks the plan before using it, and the class checks its understanding too. Each learner explains length times width and why units go with numbers. If anyone added instead of multiplying, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "someone-walks-towards-the-tape",
      kind: "Walker",
      after: "hold-the-tape-hook-on-the",
      delay: 3,
      seconds: 12,
      target: "esg-lower-tape",
      alert: "A classmate walks along the path towards the stretched tape.",
      cue: "Lower the tape to the ground and wait for them to pass.",
      why: "A stretched tape is easy to trip over. Lowering it to the ground and waiting lets people pass safely. Crews do the same with any line or hose across a path.",
      missNote: "The tape stayed stretched, and the classmate had to stop short before stepping over it.",
      wrongNote: "That leaves the tape stretched across the path. Lower it. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-area",
      kind: "Crew question",
      after: "trace-the-edge-of-the-bed",
      delay: 3,
      seconds: 12,
      target: "esg-name-area",
      alert: "The crew lead asks how you will work out the area.",
      cue: "Say you multiply the length by the width and write square units.",
      why: "Knowing the rule shows you can plan the garden. The area tells the crew how much soil and how many plants they need. Getting it right saves time and materials.",
      missNote: "You could not say how to find the area, and the crew lead had to explain before the class went on.",
      wrongNote: "That does not give the area rule. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x8aa04a;
    const CSS = "#8aa04a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#68644e", base2: "#5c5844", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e6e8d4", base2: "#d6dabe", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "esg-stakes", "the four corner stakes", {});
    bead(-1.42, 1.18, -0.62, "esg-long", "the long side of the bed", {});
    bead(-1.03, 1.46, -0.71, "esg-short", "the short side of the bed", {});
    bead(-1.08, 0.9, -1.11, "esg-hose", "the coiled garden hose", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esg-ord-length", "1 · measure the length", {});
    bead(-0.58, 1.46, -1.44, "esg-ord-width", "2 · measure the width", {});
    bead(-0.24, 0.9, -1.23, "esg-ord-multiply", "3 · multiply length by width", {});
    bead(0, 1.18, -1.55, "esg-ord-unit", "4 · write the answer with square units", {});
    bead(0.24, 1.46, -1.23, "esg-hook-hold", "Hold the hook", {});
    bead(0.58, 0.9, -1.44, "esg-gap", "the kerb gap where water enters", {});
    bead(0.68, 1.18, -1.05, "esg-low", "the low middle of the bed", {});
    bead(1.08, 1.46, -1.11, "esg-path", "the path around the bed", {});
    bead(1.03, 0.9, -0.71, "esg-cloud", "a cloud in the sky", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esg-lower-tape", "Lower the tape and wait", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esg-name-area", "Say how to find the area", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esg-zero-card", "Zero checked", "START AT\nZERO", { ry: 1.2 });
    dials["esg-scale-dial"] = dial(-1.89, -1.4, 0.93, "esg-scale-dial", "Drawing scale");
    meters["esg-tape-meter"] = meter(-1.45, -1.85, 0.67, "esg-tape-meter", "Tape reading");
    tokens["esg-outline"] = token(-0.92, -2.16, 0.4, "esg-outline", "Bed outline");
    spots["esg-grid-spot"] = spot(-0.31, -2.33, 0.13, "esg-grid-spot", "The drawing grid");
    card(0.31, 1.35, -2.33, "esg-sum-card", "Area sum", "WHICH\nSUM?", { ry: -0.13 });
    meters["esg-edge-track"] = meter(0.92, -2.16, -0.4, "esg-edge-track", "Edge traced");
    boards["esg-measure-log"] = board(1.45, -1.85, -0.67, "esg-measure-log", "Measurement record");
    boards["esg-share-board"] = board(1.89, -1.4, -0.93, "esg-share-board", "Compare areas");
    boards["esg-checkin"] = board(2.19, -0.85, -1.2, "esg-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "add-instead-of-multiply", "Add the length and width to get the area?", "ADD\nTHEM?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "tape-not-at-zero", "Start measuring from the end of the tape case?", "FROM\nTHE CASE", 0.3);
    hazardCard(0.58, 0.72, -1.86, "stretch-across-the-path", "Stretch the tape across the busy path?", "ACROSS\nPATH", -0.3);
    hazardCard(1.53, 0.72, -1.21, "step-into-the-bed", "Step into the bed to hold the tape?", "STEP\nIN", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Start at zero, length then width."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Garden crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Measuring partner", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["someone-walks-towards-the-tape"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["someone-walks-towards-the-tape"].visible = false;
    arrivals["the-crew-lead-asks-about-area"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-area"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-bed-on-the-drawing") { const s = spots["esg-grid-spot"]; tokens["esg-outline"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-measurements-and-the-area") repaint(boards["esg-measure-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Measurements recorded"], "#59c97b"));
        if (step.id === "check-your-area-with-another-pair") repaint(boards["esg-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Areas compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esg-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "choose-the-right-area-sum") paintGuide("Multiply for area, add units.");
      },

      onHazard() {
        paintGuide("Stop. Tape low, feet out of the bed.");
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
        if (it.id === "someone-walks-towards-the-tape") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Tape lowered, the path clear. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-area") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Area rule explained. The lesson carries on."); }
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
