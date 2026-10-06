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
    "mix-metres-and-steps": "You added a paced length to a taped one. Paces in sneakers are a fair guess, but a stride is not a metre, and a sum that mixes them looks precise while meaning nothing. Every length on the clipboard has to be in one unit, written beside the number, or the drawing will not match the hardwood.",
    "add-area-like-perimeter": "You added the sideline and the baseline and called the total the area. Adding the sides walks the perimeter, the distance a player runs around the floor; area is the hardwood itself, sideline times baseline. Mixing them is the commonest slip on a court sheet, which is why every answer carries its unit: metres around, square metres of floor.",
    "scale-one-side-only": "You shrank the sideline to fit the sheet and left the baseline as it was. A scale drawing holds only when every length is divided by the same factor; scale one side alone and the drawing is a different rectangle from the floor, so every angle and ratio taken from it is false.",
    "run-across-during-play": "You walked onto the hardwood with the tape while sneakers were still squeaking. Geometry on a live court waits for the caretaker's nod: a tape across the paint is a trip line, and a player chasing a pass is watching the ball, not the floor."
  },

  lateNotes: {
    "kmc-class-record": "The class record is written once the drawing and the ratio are checked — nothing to record yet.",
    "kmc-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-what-you-need-to-measure",
      kind: "find",
      noHint: true,
      targets: [
        "kmc-side-line",
        "kmc-end-line",
        "kmc-corner-square"
      ],
      itemNames: {
        "kmc-side-line": "the long side line",
        "kmc-end-line": "the short end line",
        "kmc-corner-square": "a corner, to check it is square"
      },
      itemNotes: {
        "kmc-side-line": "One of the two lengths the area depends on. Measure it end to end, along the line, not across the paint.",
        "kmc-end-line": "The second length. Length times width gives the area; the two added and doubled give the perimeter.",
        "kmc-corner-square": "If the corners are not square the shape is not a rectangle, and the rectangle formulas do not apply."
      },
      decoyNotes: {
        "kmc-logo-centre": "The logo is interesting, but it does not change the area or the perimeter. Stick to what the question needs."
      },
      title: "Find what you need to measure",
      cue: "Tap the sideline, the baseline and a corner: the three lengths an arena crew needs before the floor's area and perimeter can be worked out.",
      why: "Nobody tapes a whole basketball floor. The arena crew takes the sideline, the baseline and a corner to prove the rectangle is square; the key, the arc and the centre circle wait. Deciding which lengths matter is the first move in geometry, and it saves the sneakers, the tape and the afternoon."
    },
    {
      id: "ask-the-caretaker-for-the-all",
      kind: "select",
      target: "kmc-wait-for-clear",
      title: "Ask the caretaker for the all-clear",
      cue: "Catch the caretaker's eye and ask for the floor before the tape touches the hardwood.",
      why: "Hardwood is a playing surface first and a geometry lesson second. The caretaker knows when the buzzer has sounded, the players have gone to the bleachers and the mop has dried the varnish. Asking for the floor is the arena's own rule, and it comes before any tape is unrolled."
    },
    {
      id: "put-the-method-in-order",
      kind: "sequence",
      targets: [
        "kmc-ord-estimate",
        "kmc-ord-measure",
        "kmc-ord-record",
        "kmc-ord-calc"
      ],
      itemNames: {
        "kmc-ord-estimate": "1 · estimate by pacing",
        "kmc-ord-measure": "2 · measure with the tape",
        "kmc-ord-record": "3 · record with the unit",
        "kmc-ord-calc": "4 · calculate from the record"
      },
      title: "Put the method in order",
      cue: "Pace it in sneakers, tape it, log it with its unit, then work the arithmetic.",
      why: "Pacing the sideline in sneakers gives a rough length to hold the tape against, so a misread tape jumps out at once. Taping and logging with the unit keeps the numbers honest. The arithmetic waits until the clipboard is filled in, because a court worked from memory is a court worked twice.",
      outOfOrderNote: "Not that way round. Pace the sideline first, so the paces can catch a misread tape."
    },
    {
      id: "hold-the-tape-taut-along-the",
      kind: "hold",
      target: "kmc-tape-held",
      seconds: 6,
      title: "Hold the tape taut along the line",
      cue: "Your classmate pins the zero at the corner. Keep the tape taut along the painted sideline until the reading settles.",
      why: "A tape that sags between two corners bows like a skipping rope, and a bow is longer than the painted line beneath it. Keeping it taut and on the paint for the whole reading is the difference between the sideline's true length and a number that is always a little too big.",
      holdBreakNote: "The tape bowed. A bowed tape reads long; pull it flat along the paint and read again."
    },
    {
      id: "write-the-length-to-width-ratio",
      kind: "select",
      target: "kmc-ratio-card",
      title: "Write the length-to-width ratio",
      cue: "Write sideline to baseline as a ratio, then prove the same ratio holds on the drawing.",
      why: "A ratio compares two lengths of the same kind, and a faithful scale drawing keeps every ratio the floor has. If sideline to baseline matches on the sheet and on the hardwood, the drawing is in proportion; if it does not, one side was scaled and the other was not."
    },
    {
      id: "catch-the-mistakes-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kmc-err-no-unit",
        "kmc-err-perim-area",
        "kmc-err-one-scaled"
      ],
      itemNames: {
        "kmc-err-no-unit": "an answer with no unit",
        "kmc-err-perim-area": "a perimeter labelled as area",
        "kmc-err-one-scaled": "a drawing with one side scaled"
      },
      itemNotes: {
        "kmc-err-no-unit": "A number with no unit could be a length, an area or nothing at all. Every answer carries its unit.",
        "kmc-err-perim-area": "Adding sides gives the distance around. Area comes from length times width.",
        "kmc-err-one-scaled": "Every length must be divided by the same scale factor, or the shape changes."
      },
      decoyNotes: {
        "kmc-ok-estimate": "Writing an estimate first is good practice. Leave it in."
      },
      title: "Catch the mistakes in a classmate's working",
      cue: "Look over the worked sheet a classmate left on the bleachers and tap each slip before the coach collects it.",
      why: "Reading someone else's arithmetic means following their reasoning, not only comparing answers. On a court sheet the slips are always the same three: a missing unit, a perimeter labelled as an area, and a sideline scaled while the baseline was left alone. Spotting them on a classmate's page trains the eye for your own."
    },
    {
      id: "switch-from-length-to-area-units",
      kind: "turn",
      target: "kmc-unit-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SQ M"
      },
      title: "Switch from length to area units",
      cue: "Both lengths are on the clipboard. Turn the unit dial from metres to square metres before the multiplication.",
      why: "Area counts how many unit squares would tile the hardwood, so its unit is a square unit. Turning the dial before multiplying is a reminder that a length times a length is a new kind of quantity, and that the floor's area and its sideline can never share a unit."
    },
    {
      id: "choose-a-scale-that-fits-the",
      kind: "gauge",
      target: "kmc-scale-meter",
      gauge: {
        label: "SCALE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too big and the floor runs off the sheet; too small and the key vanishes. Try again.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Choose a scale that fits the page",
      cue: "Commit when the scale factor lets the whole floor sit on the sheet with a border, and the key is still big enough to draw.",
      why: "A scale factor is a bargain. Too generous and the baseline runs off the paper; too mean and the key and the centre circle shrink to dots. Arena architects and the people who paint the lines pick round, simple factors so every helper on the crew can work the same drawing without a calculator."
    },
    {
      id: "place-the-scaled-length-on-the",
      kind: "drag",
      target: "kmc-length-token",
      drag: {
        to: "kmc-drawing-spot",
        radius: 0.45,
        missNote: "Not on the sheet yet. Carry the scaled length all the way to the paper."
      },
      title: "Place the scaled length on the drawing",
      cue: "Drag the scaled sideline onto the sheet, then divide the baseline by the same factor and draw it too.",
      why: "Every real length divided by one scale factor gives a shape the same as the hardwood but small enough for a clipboard. Once the scaled sideline and baseline are down, any angle at a corner of the drawing is the angle at the corner of the floor, which is why a coach can plan a drill on paper."
    },
    {
      id: "keep-the-answer-close-to-the",
      kind: "track",
      target: "kmc-check-meter",
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
        label: "AGREE",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep the answer close to the estimate",
      cue: "Keep the calculated area in band with the paced guess while you rework the multiplication.",
      why: "The paced guess is the safety net. If the calculated area is far from what the sneakers suggested, a decimal has slipped or a unit has crept in. Keeping the two in agreement while the multiplication is reworked is how an arena crew orders the right amount of varnish for the floor.",
      holdBreakNote: "The area and the paced guess have drifted apart. Rework the multiplication and the units before you go on."
    },
    {
      id: "record-the-measurements-and-the-drawing",
      kind: "select",
      target: "kmc-class-record",
      doneLine: "Measurements and drawing recorded",
      title: "Record the measurements and the drawing",
      cue: "Log the sideline, the baseline, their unit, the scale factor and the ratio on the clipboard.",
      why: "A floor nobody can re-measure from the clipboard is not finished. Logging both lengths with their unit, the scale factor and the ratio lets the coach, the caretaker or the next class reproduce the drawing and land on the same numbers. That is the line between a lucky guess and a measurement."
    },
    {
      id: "show-the-class-how-you-checked",
      kind: "select",
      target: "kmc-share-board",
      doneLine: "Method shared with the class",
      title: "Show the class how you checked",
      cue: "Tell the class how the paced guess and the ratio proved the drawing true to the floor.",
      why: "Saying a method aloud in front of the bleachers is the sternest test of understanding it. Showing how the paced guess caught a slipped decimal and how the ratio proved the drawing in proportion helps the classmates who stalled and fixes the idea far better than a tick on a page."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kmc-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "Before the buzzer for the next class: what went well on the floor, what was awkward, and what would you do differently?",
      why: "A short huddle at the end of the session tells the coach who can tape a floor unaided and who wants another go. Nobody is graded in the huddle; the question is simply how it went and what to try next, with the coach or a trusted adult there for anyone who wants to talk more afterwards."
    }
  ],

  interrupts: [
    {
      id: "a-ball-rolls-onto-the-court",
      kind: "Ball on the court",
      after: "hold-the-tape-taut-along-the",
      delay: 3,
      seconds: 12,
      target: "kmc-stop-and-clear",
      alert: "A ball from the practice court bounces across the tape and a younger pupil sprints after it.",
      cue: "Stop the reading, shout a warning, and let the caretaker clear the floor before anyone steps back on the paint.",
      why: "The moment anyone sprints, a tape across the hardwood becomes a trip line, and a younger pupil chasing a ball sees only the ball. Shouting, stopping and letting the caretaker clear the floor comes before any length; the sideline can be taped again, a fall on the hardwood cannot be undone.",
      missNote: "Nobody shouted. The pupil caught a foot on the tape and went down, and the reading was lost anyway.",
      wrongNote: "That stops nobody. Shout the warning and pause the tape."
    },
    {
      id: "the-teacher-asks-for-your-estimate",
      kind: "Teacher question",
      after: "keep-the-answer-close-to-the",
      delay: 3,
      seconds: 12,
      target: "kmc-say-the-estimate",
      alert: "The coach wanders over from the bleachers and asks what the floor's area will roughly be, before the multiplication is done.",
      cue: "Give the paced guess with its unit and say how the sneakers gave it to you.",
      why: "A coach asking for a rough figure mid-drill is testing the reasoning, not the arithmetic. Giving the paced guess with its unit, and saying how pacing produced it, shows you know roughly what the floor should come to, which is the sense that catches a slipped decimal long after the tape is rolled up.",
      missNote: "You had no rough figure to give, so the slip in the multiplication went unseen until it was marked.",
      wrongNote: "That is not a rough figure with a unit. Give the number and say how pacing gave it."
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
    // a hall's stage behind the station: risers, a curtain, footlights and rows of seats at the sides
    void wallMat;
    const stage = group(g, 0, 0, -4.4);
    box(stage, 6.6, 0.5, 1.6, 0, 0.25, 0, 0x4a3a30, { rough: 0.7 });
    box(stage, 6.8, 0.05, 1.7, 0, 0.52, 0, 0x6b4a2e, { rough: 0.6 });
    box(stage, 6.6, 2.6, 0.1, 0, 1.85, -0.75, 0x7a2a2a, { rough: 0.95 });
    for (let i = 0; i < 7; i++) box(stage, 0.12, 2.5, 0.06, -2.7 + i * 0.9, 1.85, -0.68, 0x8a3232, { rough: 0.95 });
    for (let i = 0; i < 6; i++) ball(stage, 0.05, -2.5 + i * 1.0, 0.56, 0.8, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.2, rough: 0.4, seg: 8 });
    for (const side of [-1, 1]) for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const seat = group(g, side * (2.9 + c * 0.55), 0, -3.2 + r * 0.7, side * 0.35);
      box(seat, 0.45, 0.06, 0.45, 0, 0.45, 0, 0x2a5a8a, { rough: 0.8 });
      box(seat, 0.45, 0.5, 0.06, 0, 0.72, -0.2, 0x2a5a8a, { rough: 0.8 });
      for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) box(seat, 0.03, 0.42, 0.03, lx, 0.21, lz, 0x3a3f46, { rough: 0.5, metal: 0.5 });
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
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Pace it, tape it, write the unit."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
        if (step.id === "write-the-length-to-width-ratio") paintGuide("Area is the floor, perimeter is the run round it, ratio keeps the shape.");
      },

      onHazard() {
        paintGuide("Stop. Is the unit written, and the method in order?");
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
        if (it.id === "a-ball-rolls-onto-the-court") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Floor cleared, tape lifted. Take the sideline again from the corner."); }
        if (it.id === "the-teacher-asks-for-your-estimate") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Rough figure given with its unit. The multiplication now has something to be held against."); }
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
