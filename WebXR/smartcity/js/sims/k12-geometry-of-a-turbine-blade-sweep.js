import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Geometry of a Turbine's Blade Sweep. Lower-secondary maths at a wind farm's visitor centre: the circle a turbine's blades sweep, radius from blade length, circumference as the distance a tip travels and area as the air the rotor meets, worked from the scale model's own measurements with no output figure claimed.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_GEOMETRY_OF_A_TURBINE_BLADE_SWEEP = {
  id: "k12-geometry-of-a-turbine-blade-sweep",
  index: "818",
  domain: "Education",
  trade: "Maths class at the wind farm's visitor centre — learner and site technician",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Geometry of a Turbine's Blade Sweep",
  title: simTitle("Geometry of a Turbine's Blade Sweep"),
  tagline: "The blade is the radius, the tip draws the circle — and visitors stay outside the fence",
  accent: 0x5a9fd8,
  accentCss: "#5a9fd8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"full-sweep","name":"Full Sweep","note":"A rotor's swept circle worked from its blade length, circumference and area kept apart and the answer checked by estimate"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Rotor Board",
    currency: "SWEEPS",
    ranks: ["Visitor","Measurer","Drafter","Calculator","Engineer"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-the-model-gives-you") },
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
    "blade-is-the-diameter": "You used the blade length as the diameter. Each blade reaches from the hub to the edge of the circle, so the blade is the radius; the diameter is twice as long. Mixing them up changes the area by a factor of four, not two.",
    "area-and-circumference-mixed": "You used the circumference formula when the question asked for the area. Circumference is the distance round the edge, measured in a length unit; area is the space inside, measured in a square unit. Checking the unit of the answer catches the mix-up.",
    "walk-to-the-turbine-base": "You walked towards the turbine to measure a real blade. Visitors stay outside the fenced area the site team sets round each turbine; the scale model in the visitor centre is there so the maths can be done safely.",
    "double-radius-double-area": "You said doubling the blade length doubles the swept area. Area grows with the radius multiplied by itself, so doubling the blade gives four times the area; it is why longer blades matter so much in turbine design."
  },

  lateNotes: {
    "kbs-rotor-log": "The working record is written once the answer is checked — nothing to record yet.",
    "kbs-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      "id": "find-what-the-model-gives-you",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kbs-blade-length",
        "kbs-model-scale",
        "kbs-length-unit"
      ],
      "itemNames": {
        "kbs-blade-length": "the blade length from hub to tip",
        "kbs-model-scale": "the scale printed on the model's base",
        "kbs-length-unit": "the unit the length is marked in"
      },
      "itemNotes": {
        "kbs-blade-length": "This is the radius of the swept circle.",
        "kbs-model-scale": "It links the model to a full-size turbine.",
        "kbs-length-unit": "Area will come out in this unit squared."
      },
      "decoyNotes": {
        "kbs-tower-colour": "It helps pilots see the tower, but it has nothing to do with the circle."
      },
      "title": "Find what the model gives you",
      "cue": "Mark the three things on the scale model you need before any calculation.",
      "why": "A swept circle is set by one length, but only if you know where it is measured and in what unit. The blade length from hub centre to tip is the radius, the model's scale tells you how it relates to a real turbine, and the unit keeps the answer honest. Find those three before you calculate anything."
    },
    {
      "id": "stay-outside-the-turbine-fence",
      "kind": "select",
      "target": "kbs-fence-card",
      "title": "Stay outside the turbine fence",
      "cue": "Read the site rule on the card before the lesson starts.",
      "why": "A working turbine has moving blades high above the ground and heavy parts inside, and the site team keeps visitors outside its fenced area for good reason. The whole lesson uses the scale model, so nobody needs to go near a turbine to learn how its circle works."
    },
    {
      "id": "put-the-calculation-in-order",
      "kind": "sequence",
      "targets": [
        "kbs-ord-radius",
        "kbs-ord-formula",
        "kbs-ord-calc",
        "kbs-ord-estimate"
      ],
      "itemNames": {
        "kbs-ord-radius": "1 · identify the radius",
        "kbs-ord-formula": "2 · choose the formula the question needs",
        "kbs-ord-calc": "3 · calculate with the unit",
        "kbs-ord-estimate": "4 · check against an estimate"
      },
      "title": "Put the calculation in order",
      "cue": "Identify the radius, choose the formula, calculate, then check with an estimate.",
      "why": "Deciding which length is the radius comes first, because every later step depends on it. Choosing the formula to match the question, circumference for distance round or area for space inside, then calculating and checking against a rough estimate, catches the two commonest slips before anyone relies on the number.",
      "outOfOrderNote": "Out of order. Decide which length is the radius before you choose a formula."
    },
    {
      "id": "hold-the-tape-along-one-blade",
      "kind": "hold",
      "target": "kbs-tape",
      "seconds": 6,
      "title": "Hold the tape along one blade",
      "cue": "Hold the tape straight from the hub centre to the blade tip until the reading steadies.",
      "why": "The radius runs from the centre of the hub, not from its edge, to the very tip of the blade. Holding the tape straight along that line until the reading steadies gives the true radius; starting at the hub's edge quietly shortens every answer that follows.",
      "holdBreakNote": "The tape slipped off the hub centre. Set it back at the centre and hold it again."
    },
    {
      "id": "turn-the-rotor-through-a-full",
      "kind": "turn",
      "target": "kbs-rotor-dial",
      "turn": {
        "turns": 0.5,
        "axis": "y",
        "label": "SWEEP"
      },
      "title": "Turn the rotor through a full sweep",
      "cue": "Turn the model rotor slowly so one tip traces the whole circle.",
      "why": "Turning the model and watching one tip makes the circle visible: the tip travels the circumference and the blades pass over the whole area inside it. Seeing it move is what turns a formula into a picture you can reason with."
    },
    {
      "id": "check-your-answer-against-an-estimate",
      "kind": "gauge",
      "target": "kbs-estimate-meter",
      "gauge": {
        "label": "ESTIMATE",
        "speed": 0.6,
        "green": [
          0.4,
          0.58
        ],
        "missNote": "Too far from the estimate. Check the radius and the formula before you trust it."
      },
      "title": "Check your answer against an estimate",
      "cue": "Commit when the estimate bar sits where your calculated area should fall.",
      "why": "A circle's area is a little over three times the radius multiplied by itself, so a quick estimate tells you roughly what size answer to expect. If the calculated area lands far from the estimate, a length or formula has slipped, and it is far cheaper to find that now than later."
    },
    {
      "id": "place-the-radius-on-the-drawing",
      "kind": "drag",
      "target": "kbs-radius-token",
      "drag": {
        "to": "kbs-radius-spot",
        "radius": 0.45,
        "missNote": "Not centre to edge yet. Start the radius at the middle of the circle."
      },
      "title": "Place the radius on the drawing",
      "cue": "Drag the radius marker so it runs from the centre of the circle to its edge.",
      "why": "Drawing the radius in the right place, centre to edge, is the step that stops the blade-as-diameter mistake. A labelled drawing also shows anyone checking your work exactly which length you used, before they look at a single number."
    },
    {
      "id": "say-what-happens-when-the-blade",
      "kind": "select",
      "target": "kbs-compare-card",
      "title": "Say what happens when the blade doubles",
      "cue": "Say how the swept area changes if the blade is twice as long, and why.",
      "why": "Doubling the radius makes the area four times larger, because area depends on the radius multiplied by itself. Saying why, not just the answer, is the understanding engineers use when they explain why longer blades catch so much more of the wind."
    },
    {
      "id": "spot-the-problems-in-a-classmates",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kbs-wk-diameter",
        "kbs-wk-unit",
        "kbs-wk-formula"
      ],
      "itemNames": {
        "kbs-wk-diameter": "the blade used as the diameter",
        "kbs-wk-unit": "an area with a plain length unit",
        "kbs-wk-formula": "the circumference formula used for area"
      },
      "itemNotes": {
        "kbs-wk-diameter": "The blade is the radius.",
        "kbs-wk-unit": "Area needs a square unit.",
        "kbs-wk-formula": "Match the formula to the question."
      },
      "decoyNotes": {
        "kbs-wk-drawing": "A labelled drawing is good practice. Keep it."
      },
      "title": "Spot the problems in a classmate's working",
      "cue": "Look at the draft calculation and mark each problem.",
      "why": "Circle calculations go wrong in the same few ways: the blade used as the diameter, an area given in a plain length unit, and the circumference formula used for area. Spotting them on another page trains you to check your own before you hand it in."
    },
    {
      "id": "follow-the-tip-round-the-circle",
      "kind": "track",
      "target": "kbs-track-meter",
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
        "label": "TIP"
      },
      "title": "Follow the tip round the circle",
      "cue": "Keep the pointer on the blade tip as the model rotor turns.",
      "why": "The tip of the blade moves fastest of any point on the rotor, because it covers the whole circumference in the same time the hub makes one turn. Following it makes clear why the tip travels so far on each turn compared with points nearer the hub.",
      "holdBreakNote": "The pointer lost the tip. Find it again and follow it round."
    },
    {
      "id": "record-the-working-and-the-answer",
      "kind": "select",
      "target": "kbs-rotor-log",
      "doneLine": "Working and answer recorded",
      "title": "Record the working and the answer",
      "cue": "Write the radius, the formula, the answer with its unit and your estimate.",
      "why": "Writing each step, not just the answer, means a slip can be found in one line instead of redoing everything. Keeping the estimate beside the answer shows the check was done, which is what makes a calculation trustworthy to someone else."
    },
    {
      "id": "explain-the-sweep-to-the-technician",
      "kind": "select",
      "target": "kbs-share-board",
      "doneLine": "Sweep explained to the technician",
      "title": "Explain the sweep to the technician",
      "cue": "Tell the technician what the blade's circle is and how you worked it out.",
      "why": "Explaining your method to someone who works with turbines every day tests whether you really understand it. They will hear straight away whether the radius and the formula were chosen for the right reasons, and they can tell you how the idea is used on site."
    },
    {
      "id": "crew-check-in",
      "kind": "select",
      "target": "kbs-checkin",
      "doneLine": "Checked in",
      "title": "Check in at the end of the visit",
      "cue": "What made sense about circles today, and what still feels tricky?",
      "why": "A check-in at the end gives every learner a chance to say what clicked and what did not, so the teacher knows where to start next time. Nobody is marked on it, and the teacher or a trusted adult is there for anyone who found the lesson hard."
    }
  ],

  interrupts: [
    {
      "id": "a-gust-rattles-the-door",
      "kind": "Weather warning",
      "after": "hold-the-tape-along-one-blade",
      "delay": 3,
      "seconds": 12,
      "target": "kbs-stay-inside",
      "alert": "A strong gust rattles the visitor centre door and the technician asks everyone to stay inside.",
      "cue": "Stay inside with your group and listen for the technician's instruction.",
      "why": "On a windy ridge, the site team decides when it is safe to be outside, and a sudden gust is their call to make. Staying with your group and listening means nobody is caught outdoors in weather the site has not cleared.",
      "missNote": "Two learners stepped outside to feel the wind, and the technician had to fetch them back.",
      "wrongNote": "That takes you outside. Stay in and listen. Choose the response that deals with it now."
    },
    {
      "id": "the-technician-asks-which-is-radius",
      "kind": "Technician question",
      "after": "follow-the-tip-round-the-circle",
      "delay": 3,
      "seconds": 12,
      "target": "kbs-say-radius",
      "alert": "The site technician points at the model and asks which length is the radius of the swept circle.",
      "cue": "Say that the blade, from hub centre to tip, is the radius.",
      "why": "The technician is checking the step every later calculation depends on. Naming the blade as the radius, measured from the hub's centre, shows you will not double or halve the circle by accident.",
      "missNote": "You said the whole rotor width, and the technician showed you that was the diameter.",
      "wrongNote": "That is the diameter, not the radius. Choose the response that deals with it now."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a8270", base2: "#6c7462", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e2e6dc", base2: "#d2d8cc", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "kbs-blade-length", "the blade length from hub to tip", {});
    bead(-1.42, 1.18, -0.62, "kbs-model-scale", "the scale printed on the model's base", {});
    bead(-1.03, 1.46, -0.71, "kbs-length-unit", "the unit the length is marked in", {});
    bead(-1.08, 0.9, -1.11, "kbs-tower-colour", "the tower's paint colour", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kbs-ord-radius", "1 · identify the radius", {});
    bead(-0.58, 1.46, -1.44, "kbs-ord-formula", "2 · choose the formula the question needs", {});
    bead(-0.24, 0.9, -1.23, "kbs-ord-calc", "3 · calculate with the unit", {});
    bead(0, 1.18, -1.55, "kbs-ord-estimate", "4 · check against an estimate", {});
    bead(0.24, 1.46, -1.23, "kbs-tape", "Tape from hub centre to tip", {});
    bead(0.58, 0.9, -1.44, "kbs-wk-diameter", "the blade used as the diameter", {});
    bead(0.68, 1.18, -1.05, "kbs-wk-unit", "an area with a plain length unit", {});
    bead(1.08, 1.46, -1.11, "kbs-wk-formula", "the circumference formula used for area", {});
    bead(1.03, 0.9, -0.71, "kbs-wk-drawing", "a labelled drawing of the circle", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kbs-stay-inside", "Stay inside and listen to the technician", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kbs-say-radius", "Say which length is the radius", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kbs-fence-card", "Visitors stay outside the fence", "OUTSIDE\nTHE FENCE", { ry: 1.2 });
    dials["kbs-rotor-dial"] = dial(-1.89, -1.4, 0.93, "kbs-rotor-dial", "Turn the model rotor");
    meters["kbs-estimate-meter"] = meter(-1.45, -1.85, 0.67, "kbs-estimate-meter", "Estimate check");
    tokens["kbs-radius-token"] = token(-0.92, -2.16, 0.4, "kbs-radius-token", "Radius marker");
    spots["kbs-radius-spot"] = spot(-0.31, -2.33, 0.13, "kbs-radius-spot", "Centre to edge");
    card(0.31, 1.35, -2.33, "kbs-compare-card", "Double the blade", "TWICE THE\nBLADE?", { ry: -0.13 });
    meters["kbs-track-meter"] = meter(0.92, -2.16, -0.4, "kbs-track-meter", "Tip followed");
    boards["kbs-rotor-log"] = board(1.45, -1.85, -0.67, "kbs-rotor-log", "Working record");
    boards["kbs-share-board"] = board(1.89, -1.4, -0.93, "kbs-share-board", "Explain to the technician");
    boards["kbs-checkin"] = board(2.19, -0.85, -1.2, "kbs-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "blade-is-the-diameter", "Use the blade length as the circle's diameter?", "BLADE =\nDIAMETER", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "area-and-circumference-mixed", "Use the circumference formula to find the area?", "WRONG\nFORMULA", 0.3);
    hazardCard(0.58, 0.72, -1.86, "walk-to-the-turbine-base", "Walk out to the turbine to measure a real blade?", "INSIDE THE\nFENCE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "double-radius-double-area", "Say twice the blade length means twice the area?", "DOUBLE =\nDOUBLE?", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["The blade is the radius."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Site technician", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Visitor centre guide", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-gust-rattles-the-door"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-gust-rattles-the-door"].visible = false;
    arrivals["the-technician-asks-which-is-radius"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-technician-asks-which-is-radius"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-radius-on-the-drawing") { const s = spots["kbs-radius-spot"]; tokens["kbs-radius-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-working-and-the-answer") repaint(boards["kbs-rotor-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Working and answer recorded"], "#59c97b"));
        if (step.id === "explain-the-sweep-to-the-technician") repaint(boards["kbs-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Sweep explained to the technician"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kbs-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-happens-when-the-blade") paintGuide("Double the blade, four times the area.");
      },

      onHazard() {
        paintGuide("Stop. Is that the radius, and the right formula?");
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
        if (it.id === "a-gust-rattles-the-door") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group stayed inside, gust passed. The lesson carries on."); }
        if (it.id === "the-technician-asks-which-is-radius") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Blade named as the radius. The technician nods."); }
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
