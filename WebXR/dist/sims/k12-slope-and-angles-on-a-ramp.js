import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Slope and Angles on a Ramp. Lower-secondary maths at a construction site's visitor bay: slope as rise over run on an access ramp, the angle it makes with the ground, and why the ramp is built to a limit the plans set, using only the measurements the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_SLOPE_AND_ANGLES_ON_A_RAMP = {
  id: "k12-slope-and-angles-on-a-ramp",
  index: "815",
  domain: "Education",
  trade: "Maths class at the construction site's visitor bay — learner and site engineer",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Slope and Angles on a Ramp",
  title: simTitle("Slope and Angles on a Ramp"),
  tagline: "Rise over run, both in the same unit — and stay behind the barrier while the crew works",
  accent: 0x5a9fd8,
  accentCss: "#5a9fd8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"rise-over-run","name":"Rise over Run","note":"A ramp's slope worked out from its own rise and run, compared with its angle and checked against the plan's limit"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Ramp Board",
    currency: "LEVELS",
    ranks: ["Visitor","Measurer","Setter-out","Checker","Engineer"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-the-ramp-drawing-gives") },
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
    "divide-run-by-rise": "You divided the run by the rise. Slope is rise over run: how far up for every step along. Turned upside down, a gentle ramp looks steep and a steep one looks gentle, which is exactly backwards when someone is pushing a wheelchair up it.",
    "mix-the-units": "You measured the rise in one unit and the run in another and divided anyway. A slope is a comparison of two lengths, so both must be in the same unit first; mixed units give a number that means nothing.",
    "duck-under-the-barrier": "You ducked under the barrier to reach the ramp the crew is building. Visitors stay in the visitor bay while plant and people are moving; the engineer brings the measurements to you, and the scale model on the bench is there for the hands-on part.",
    "steeper-is-just-quicker": "You said a steeper ramp is better because it takes less room. A ramp is built for the people who use it: the plan sets how steep it may be so that a wheelchair user, a parent with a buggy or a worker with a trolley can use it safely, and shorter is not the goal."
  },

  lateNotes: {
    "ksr-ramp-log": "The slope record is written once the check is done — nothing to record yet.",
    "ksr-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-what-the-ramp-drawing-gives",
      kind: "find",
      noHint: true,
      targets: [
        "ksr-rise",
        "ksr-run",
        "ksr-unit"
      ],
      itemNames: {
        "ksr-rise": "the rise marked on the drawing",
        "ksr-run": "the run marked on the drawing",
        "ksr-unit": "the unit the drawing uses"
      },
      itemNotes: {
        "ksr-rise": "How far up the ramp climbs, top of the ramp to the ground.",
        "ksr-run": "How far along the ground the ramp travels.",
        "ksr-unit": "Both lengths must be in this unit before you divide."
      },
      decoyNotes: {
        "ksr-title-block": "Useful for knowing which drawing this is, but it holds no length for the slope."
      },
      title: "Find what the ramp drawing gives you",
      cue: "Mark the three things on the ramp drawing you need before working out its slope.",
      why: "A slope needs two lengths and one agreement. The drawing gives the rise, how far the ramp climbs, and the run, how far along the ground it goes, and it states the unit both are measured in. Find those three first and the rest is one division; miss one and every later step is built on a guess."
    },
    {
      id: "stay-behind-the-barrier-in-the",
      kind: "select",
      target: "ksr-barrier-card",
      title: "Stay behind the barrier in the visitor bay",
      cue: "Take your place behind the barrier before the engineer starts.",
      why: "A construction site is a workplace with moving plant, and the visitor bay is where learners stand so that the crew can work and nobody walks into a machine's path. Starting behind the barrier every time is the same rule the site's own workers follow when they keep to marked walkways."
    },
    {
      id: "put-the-slope-method-in-order",
      kind: "sequence",
      targets: [
        "ksr-ord-measure",
        "ksr-ord-units",
        "ksr-ord-divide",
        "ksr-ord-compare"
      ],
      itemNames: {
        "ksr-ord-measure": "1 · measure the rise and the run",
        "ksr-ord-units": "2 · put both in the same unit",
        "ksr-ord-divide": "3 · divide the rise by the run",
        "ksr-ord-compare": "4 · compare with the plan's limit"
      },
      title: "Put the slope method in order",
      cue: "Measure the rise and run, match the units, divide rise by run, then compare with the plan.",
      why: "Measuring both lengths first, putting them in the same unit, and only then dividing rise by run gives a slope you can trust. Comparing it with the limit the plan sets is the last step, and the one that matters to the person using the ramp: a correct number is only useful if you check it against what the ramp is allowed to be.",
      outOfOrderNote: "Out of order. Measure both lengths and match their units before you divide."
    },
    {
      id: "hold-the-level-on-the-model",
      kind: "hold",
      target: "ksr-level",
      seconds: 6,
      title: "Hold the level on the model ramp",
      cue: "Hold the spirit level flat on the base of the model ramp until the bubble settles.",
      why: "The run is measured along level ground, so the base has to be level before any length means anything. A spirit level's bubble sits in the middle only when the surface is flat, and holding it still until it settles is how setters-out on a real site start every ramp and every floor.",
      holdBreakNote: "The level tipped and the bubble ran to one end. Set it flat and hold it again."
    },
    {
      id: "say-which-ramp-is-steeper",
      kind: "select",
      target: "ksr-compare-card",
      title: "Say which ramp is steeper",
      cue: "Two ramps climb the same rise; one has a longer run. Say which is steeper, and why.",
      why: "For the same rise, a longer run means a smaller rise for each step along, so the ramp with the longer run is gentler. Saying why, in terms of rise for each step along, is the understanding that lets you compare any two slopes without drawing them."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "ksr-sl-upside",
        "ksr-sl-units",
        "ksr-sl-sloping"
      ],
      itemNames: {
        "ksr-sl-upside": "the run divided by the rise",
        "ksr-sl-units": "a rise and a run in different units",
        "ksr-sl-sloping": "the sloping length used as the run"
      },
      itemNotes: {
        "ksr-sl-upside": "Slope is rise over run.",
        "ksr-sl-units": "Same unit before you divide.",
        "ksr-sl-sloping": "The run is measured flat along the ground."
      },
      decoyNotes: {
        "ksr-sl-sketch": "A labelled sketch is good practice. Keep it."
      },
      title: "Spot the problems in a classmate's slope sheet",
      cue: "Look at the draft slope calculation and mark each problem.",
      why: "Slope calculations go wrong in the same few ways: the fraction written upside down, two lengths in different units, and the sloping length used in place of the run. Finding them in someone else's working is practice at checking your own before it goes to anyone who will build from it."
    },
    {
      id: "turn-the-model-ramp-to-the",
      kind: "turn",
      target: "ksr-angle-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "ANGLE"
      },
      title: "Turn the model ramp to the drawing's angle",
      cue: "Turn the dial until the model ramp matches the angle on the drawing.",
      why: "The angle a ramp makes with the ground and its slope describe the same steepness in two languages: a steeper ramp has both a bigger angle and a bigger rise for each step along. Turning the model until it matches the drawing lets you see that link rather than just calculate it."
    },
    {
      id: "read-the-angle-on-the-protractor",
      kind: "gauge",
      target: "ksr-protractor",
      gauge: {
        label: "ANGLE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Off the mark. Line the base up with the ground and read from the side that starts at zero.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the angle on the protractor",
      cue: "Commit when the protractor's pointer sits on the angle the drawing shows.",
      why: "Reading an angle means lining the protractor's base with the ground and reading where the ramp crosses the scale, from the correct side. Reading from the wrong side of the scale gives the angle's partner instead, which is the commonest protractor slip and is easy to catch by asking whether the ramp looks gentle or steep."
    },
    {
      id: "place-the-measuring-rod-along-the",
      kind: "drag",
      target: "ksr-rod",
      drag: {
        to: "ksr-run-spot",
        radius: 0.45,
        missNote: "Not along the run yet. Lay the rod flat on the ground under the ramp."
      },
      title: "Place the measuring rod along the run",
      cue: "Drag the measuring rod to lie along the ground under the ramp, not up its surface.",
      why: "The run is the horizontal distance, measured flat along the ground under the ramp, not the sloping length up its surface. The sloping length is always a little longer, and using it instead of the run makes a ramp look gentler than it is, which is the wrong way to be wrong."
    },
    {
      id: "keep-the-model-ramp-inside-the",
      kind: "track",
      target: "ksr-track-meter",
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
        label: "SLOPE",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep the model ramp inside the plan's limit",
      cue: "Hold the model's slope inside the band as the engineer adds weight to the top.",
      why: "A ramp has to stay inside its slope limit along its whole length, not just where it was measured. Holding the model steady as it is loaded shows how a small sag or lift changes the slope, which is why a site engineer checks a ramp at more than one point before anyone uses it.",
      holdBreakNote: "The model drifted past the limit. Bring it back inside the band before the next check."
    },
    {
      id: "record-the-slope-and-the-check",
      kind: "select",
      target: "ksr-ramp-log",
      doneLine: "Slope and check recorded",
      title: "Record the slope and the check",
      cue: "Write the rise, the run, their unit, the slope and whether it meets the plan's limit.",
      why: "A written record shows how the answer was reached, so anyone can check it or reuse it. Writing the unit and the comparison with the plan's limit, not just the final number, turns a sum into a check that a site engineer could actually sign off."
    },
    {
      id: "explain-your-answer-to-the-engineer",
      kind: "select",
      target: "ksr-share-board",
      doneLine: "Answer explained to the engineer",
      title: "Explain your answer to the engineer",
      cue: "Tell the engineer the slope, how you found it and whether the ramp meets its limit.",
      why: "Explaining aloud is how you find out whether you really understand. Saying the slope, the method and the comparison in your own words lets the engineer hear where the reasoning holds and where it wobbles, and it is how engineers on real sites hand information to the crew."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "ksr-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the visit",
      cue: "How did the slope work go? What was hard, and what would you try next time?",
      why: "Before the group leaves the visitor bay, everyone names the measurement that surprised them and the one they would take again more carefully. Saying it out loud fixes the idea of rise over run far better than a worksheet, and it shows the site supervisor which learners want another turn at the model ramp."
    }
  ],

  interrupts: [
    {
      id: "a-reversing-alarm-sounds",
      kind: "Reversing plant",
      after: "hold-the-level-on-the-model",
      delay: 3,
      seconds: 12,
      target: "ksr-step-back",
      alert: "A reversing alarm sounds from a dumper near the edge of the visitor bay.",
      cue: "Step back from the barrier and wait for the banksman's all-clear.",
      why: "A reversing alarm means a driver with limited view is moving. Stepping back and waiting for the banksman, the person guiding the driver, keeps the space behind the machine clear; leaning over to watch is how people end up where a driver cannot see them.",
      missNote: "You stayed leaning on the barrier, and the banksman had to stop the dumper and move the group back.",
      wrongNote: "That does not clear the space. Step back and wait for the all-clear. Choose the response that deals with it now."
    },
    {
      id: "the-engineer-asks-for-the-slope",
      kind: "Engineer question",
      after: "keep-the-model-ramp-inside-the",
      delay: 3,
      seconds: 12,
      target: "ksr-say-slope",
      alert: "The site engineer asks you what the model ramp's slope is and how you know.",
      cue: "Say the slope as rise over run, with both lengths in the same unit.",
      why: "The engineer is checking that the slope was found the right way up and with matched units. Giving it as rise over run, and naming the unit, shows both, and it is the form the crew needs to set out the real ramp.",
      missNote: "You gave a number with no method, and the engineer could not tell whether it was the right way up.",
      wrongNote: "That answer skips how you found it. Say rise over run. Choose the response that deals with it now."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#8a8478", base2: "#7c776c", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e6ddcc", base2: "#d8cfbe", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "ksr-rise", "the rise marked on the drawing", {});
    bead(-1.42, 1.18, -0.62, "ksr-run", "the run marked on the drawing", {});
    bead(-1.03, 1.46, -0.71, "ksr-unit", "the unit the drawing uses", {});
    bead(-1.08, 0.9, -1.11, "ksr-title-block", "the drawing's title block", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "ksr-ord-measure", "1 · measure the rise and the run", {});
    bead(-0.58, 1.46, -1.44, "ksr-ord-units", "2 · put both in the same unit", {});
    bead(-0.24, 0.9, -1.23, "ksr-ord-divide", "3 · divide the rise by the run", {});
    bead(0, 1.18, -1.55, "ksr-ord-compare", "4 · compare with the plan's limit", {});
    bead(0.24, 1.46, -1.23, "ksr-level", "Spirit level on the model base", {});
    bead(0.58, 0.9, -1.44, "ksr-sl-upside", "the run divided by the rise", {});
    bead(0.68, 1.18, -1.05, "ksr-sl-units", "a rise and a run in different units", {});
    bead(1.08, 1.46, -1.11, "ksr-sl-sloping", "the sloping length used as the run", {});
    bead(1.03, 0.9, -0.71, "ksr-sl-sketch", "a labelled sketch of the ramp", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "ksr-step-back", "Step back and wait for the all-clear", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "ksr-say-slope", "Say the slope as rise over run", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "ksr-barrier-card", "Stand behind the barrier", "VISITOR\nBAY", { ry: 1.2 });
    dials["ksr-angle-dial"] = dial(-1.89, -1.4, 0.93, "ksr-angle-dial", "Model ramp angle");
    meters["ksr-protractor"] = meter(-1.45, -1.85, 0.67, "ksr-protractor", "Protractor reading");
    tokens["ksr-rod"] = token(-0.92, -2.16, 0.4, "ksr-rod", "Measuring rod");
    spots["ksr-run-spot"] = spot(-0.31, -2.33, 0.13, "ksr-run-spot", "Along the ground");
    card(0.31, 1.35, -2.33, "ksr-compare-card", "Compare the ramps", "SAME RISE\nLONGER RUN", { ry: -0.13 });
    meters["ksr-track-meter"] = meter(0.92, -2.16, -0.4, "ksr-track-meter", "Slope kept in the limit");
    boards["ksr-ramp-log"] = board(1.45, -1.85, -0.67, "ksr-ramp-log", "Slope record");
    boards["ksr-share-board"] = board(1.89, -1.4, -0.93, "ksr-share-board", "Explain to the engineer");
    boards["ksr-checkin"] = board(2.19, -0.85, -1.2, "ksr-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "divide-run-by-rise", "Divide the run by the rise?", "RUN ÷\nRISE", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "mix-the-units", "Measure the rise in one unit and the run in another?", "MIXED\nUNITS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "duck-under-the-barrier", "Duck under the barrier to measure the real ramp?", "UNDER THE\nTAPE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "steeper-is-just-quicker", "Say a steeper ramp is better because it is shorter?", "STEEPER\nIS FINE", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Rise over run, same unit."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Site engineer", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Banksman", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-reversing-alarm-sounds"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-reversing-alarm-sounds"].visible = false;
    arrivals["the-engineer-asks-for-the-slope"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-engineer-asks-for-the-slope"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-measuring-rod-along-the") { const s = spots["ksr-run-spot"]; tokens["ksr-rod"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-slope-and-the-check") repaint(boards["ksr-ramp-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Slope and check recorded"], "#59c97b"));
        if (step.id === "explain-your-answer-to-the-engineer") repaint(boards["ksr-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Answer explained to the engineer"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["ksr-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-which-ramp-is-steeper") paintGuide("Longer run, same rise: gentler ramp.");
      },

      onHazard() {
        paintGuide("Stop. Is it rise over run, in one unit?");
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
        if (it.id === "a-reversing-alarm-sounds") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group stepped back, banksman gave the all-clear. The lesson carries on."); }
        if (it.id === "the-engineer-asks-for-the-slope") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Rise over run given, units matched. The engineer can check it."); }
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
