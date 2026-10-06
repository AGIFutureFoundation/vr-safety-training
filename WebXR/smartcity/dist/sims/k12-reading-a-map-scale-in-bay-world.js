import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Reading a Map Scale in Bay World. Upper-primary and lower-secondary maths on a map of Bay World: scale, distance, speed and time, using only the distances the map itself shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_READING_A_MAP_SCALE_IN_BAY_WORLD = {
  id: "k12-reading-a-map-scale-in-bay-world",
  index: "806",
  domain: "Education",
  trade: "Maths class at the ferry landing map board — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Reading a Map Scale in Bay World",
  title: simTitle("Reading a Map Scale in Bay World"),
  tagline: "Measure on the map, scale it up, then work out how long the journey takes",
  accent: 0x5a9fd8,
  accentCss: "#5a9fd8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"on-the-map","name":"On the Map","note":"A route measured, scaled and timed, with the answer checked against common sense"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Route Board",
    currency: "LEGS",
    ranks: ["Walker","Map Reader","Navigator","Planner","Pathfinder"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-the-map-gives-you") },
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
    "measure-as-the-crow-flies": "You measured straight across the water for a route that has to go round by the path. A journey's distance is the length of the route actually travelled, not the straight line between the ends; measuring the wrong one makes the time wrong too.",
    "forget-the-scale": "You used the ruler reading on the map as if it were the real distance. A map is a scale drawing, so every length on it has to be multiplied by the scale to give the real distance; without that step the journey is impossibly short.",
    "mix-minutes-and-hours": "You mixed minutes and hours in one calculation. Speed, distance and time only fit together when the units match, so a speed per hour needs a time in hours; mixing them gives an answer that is wildly out.",
    "step-over-the-landing-rope": "You stepped past the rope at the ferry landing to read the map. The rope keeps people back from the edge while the ferry comes in, and the map board is placed so it can be read from the safe side; the lesson waits on the right side of the rope."
  },

  lateNotes: {
    "kms-route-log": "The route record is written once the time is checked — nothing to record yet.",
    "kms-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-what-the-map-gives-you",
      kind: "find",
      noHint: true,
      targets: [
        "kms-scale-bar",
        "kms-start-end",
        "kms-route"
      ],
      itemNames: {
        "kms-scale-bar": "the scale bar",
        "kms-start-end": "the start and the destination",
        "kms-route": "the marked route"
      },
      itemNotes: {
        "kms-scale-bar": "The link between a length on the map and a real distance. Everything depends on it.",
        "kms-start-end": "Where the journey begins and ends, marked on the map.",
        "kms-route": "The path actually travelled, which is not always the straight line."
      },
      decoyNotes: {
        "kms-compass-rose": "Useful for direction, but it does not give distance. Stick to what the question needs."
      },
      title: "Find what the map gives you",
      cue: "Mark the three things on the map board you need to work out the journey.",
      why: "Before measuring anything, find what the map provides: the scale bar that links map length to real distance, the start and the destination, and the route between them. With these three a map becomes a calculation, and without any one of them it is only a picture."
    },
    {
      id: "put-the-method-in-order",
      kind: "sequence",
      targets: [
        "kms-ord-measure",
        "kms-ord-scale",
        "kms-ord-speed",
        "kms-ord-time"
      ],
      itemNames: {
        "kms-ord-measure": "1 · measure the route on the map",
        "kms-ord-scale": "2 · scale it up to real distance",
        "kms-ord-speed": "3 · choose the speed",
        "kms-ord-time": "4 · work out the time"
      },
      title: "Put the method in order",
      cue: "Measure on the map, scale it up, choose the speed, then work out the time.",
      why: "The order follows the reasoning: you cannot scale a length you have not measured, and you cannot find a time until you know the real distance and the speed. Working in this order, and writing each result with its unit, means anyone can follow the working and find a slip.",
      outOfOrderNote: "Out of order. Measure on the map before you scale — there is nothing to scale yet."
    },
    {
      id: "read-the-map-from-behind-the",
      kind: "select",
      target: "kms-behind-rope",
      title: "Read the map from behind the rope",
      cue: "Stand behind the landing rope where the board is meant to be read.",
      why: "At a ferry landing, the rope marks where people wait safely while the boat comes in. The map board is placed to be read from that side; staying behind the rope is the landing's own rule, and following a site's rules comes before any lesson held there."
    },
    {
      id: "convert-the-time-into-matching-units",
      kind: "turn",
      target: "kms-unit-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "HOURS"
      },
      title: "Convert the time into matching units",
      cue: "The speed is per hour. Turn the dial so the time is worked in hours too.",
      why: "Speed, distance and time only fit together when the units match. Converting before calculating, rather than after, avoids the commonest error in this topic, and writing the unit at each step shows you checked."
    },
    {
      id: "choose-a-sensible-walking-speed",
      kind: "gauge",
      target: "kms-speed-meter",
      gauge: {
        label: "SPEED",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. That speed is not how a class walks. Choose again.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Choose a sensible walking speed",
      cue: "Commit when the speed is a sensible walking pace for a class — not a run, not a crawl.",
      why: "A calculation is only as good as the numbers put into it. Choosing a sensible speed for the way the class will actually travel makes the time realistic, and questioning whether an input makes sense is a skill every good problem-solver uses."
    },
    {
      id: "trace-the-route-with-the-string",
      kind: "hold",
      target: "kms-trace-route",
      seconds: 6,
      title: "Trace the route with the string",
      cue: "Hold the string along the winding route from start to end.",
      why: "A winding route cannot be measured with a straight ruler, so the string follows every bend and is then straightened against the ruler. Holding it carefully along the route gives the true path length, the same trick map readers have always used.",
      holdBreakNote: "The string slipped off the route. Lay it back along the path from the last point you are sure of."
    },
    {
      id: "put-the-journey-time-on-the",
      kind: "drag",
      target: "kms-time-token",
      drag: {
        to: "kms-timetable-spot",
        radius: 0.45,
        missNote: "Not in place yet. Take it all the way to on the day's timetable."
      },
      title: "Put the journey time on the timetable",
      cue: "Drag the journey time onto the class timetable to see when you arrive.",
      why: "Placing the journey time on the day's timetable turns a calculation into a plan: it shows when the class arrives and whether it fits before the ferry leaves. This is why people work out journey times at all."
    },
    {
      id: "spot-the-problems-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kms-plan-straight",
        "kms-plan-no-scale",
        "kms-plan-mixed-units"
      ],
      itemNames: {
        "kms-plan-straight": "a straight line across the water",
        "kms-plan-no-scale": "a map length used as real distance",
        "kms-plan-mixed-units": "minutes and hours mixed"
      },
      itemNotes: {
        "kms-plan-straight": "The class walks the path, not across the water. Measure the route.",
        "kms-plan-no-scale": "Multiply by the scale first.",
        "kms-plan-mixed-units": "Match the units before calculating."
      },
      decoyNotes: {
        "kms-plan-units-written": "Units at every step make checking easy. Keep them."
      },
      title: "Spot the problems in a classmate's route plan",
      cue: "Look at the draft route plan and mark each problem.",
      why: "Route plans go wrong in predictable ways: a straight line measured where the path winds, a map length used without the scale, and units mixed in the time. Spotting them in someone else's plan teaches you to check your own before the class sets off."
    },
    {
      id: "check-the-answer-against-common-sense",
      kind: "select",
      target: "kms-sense-card",
      title: "Check the answer against common sense",
      cue: "Ask whether the journey time is believable for that walk.",
      why: "A quick sense check catches the big errors: a walk across a small park should not take a day, and a long route should not take moments. If the answer looks wrong it probably is, and the usual culprit is a missed scale or mixed units."
    },
    {
      id: "keep-the-class-on-pace-along",
      kind: "track",
      target: "kms-track-meter",
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
        label: "ON TIME",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep the class on pace along the route",
      cue: "Hold the pace in band as the class walks the route.",
      why: "A journey time assumes a steady pace. Keeping the class near that pace, not racing ahead or falling behind, is how the plan holds, and noticing when it slips is how you know to adjust the arrival time.",
      holdBreakNote: "The pace drifted. Adjust and bring it back, or update the arrival time."
    },
    {
      id: "record-the-route-and-the-working",
      kind: "select",
      target: "kms-route-log",
      doneLine: "Route and working recorded",
      title: "Record the route and the working",
      cue: "Write down the map length, the scale, the real distance, the speed and the time.",
      why: "Recording each step with its unit means the plan can be checked and reused. It also shows exactly where a mistake happened if the class arrives at a different time than expected."
    },
    {
      id: "show-the-class-your-sense-check",
      kind: "select",
      target: "kms-share-board",
      doneLine: "Method shared",
      title: "Show the class your sense check",
      cue: "Explain how you checked the time made sense.",
      why: "Explaining a sense check out loud helps classmates who trusted a strange answer, and it fixes the habit in your own mind. Checking whether an answer is believable is one of the most useful things mathematics teaches."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kms-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the route go? What was hard, and what would you try next time?",
      why: "A short check-in at the end tells the teacher who is confident and who needs another go, and it gives every learner a moment to notice what they learned. Nobody is graded here, and the teacher or a trusted adult is there for anyone who found the lesson hard and wants to talk it through."
    }
  ],

  interrupts: [
    {
      id: "the-ferry-comes-in",
      kind: "Ferry arriving",
      after: "trace-the-route-with-the-string",
      delay: 3,
      seconds: 12,
      target: "kms-step-back-from-edge",
      alert: "The ferry horn sounds and a classmate walks towards the edge to watch it dock.",
      cue: "Call them back behind the rope and keep the group together until the attendant says it is clear.",
      why: "A docking ferry is exactly when the landing's rope matters most. Calling a classmate back and keeping the group together until the attendant gives the all-clear comes before the lesson, every time.",
      missNote: "Nobody called them back, and the attendant had to stop the docking while they were moved.",
      wrongNote: "That does not bring them back. Call them behind the rope. Choose the response that deals with it now."
    },
    {
      id: "the-teacher-asks-for-the-real-distance",
      kind: "Teacher question",
      after: "keep-the-class-on-pace-along",
      delay: 3,
      seconds: 12,
      target: "kms-say-real-distance",
      alert: "The teacher asks how far the route really is, not how long it is on the map.",
      cue: "Give the real distance with its unit and say how the scale gave it.",
      why: "The teacher is checking that you used the scale. Saying the real distance with its unit, and how the scale turned the map length into it, shows you understand what a map is: a drawing to scale.",
      missNote: "You gave the map length, and the time worked from it was far too short. Next time, stop the lesson and deal with it first.",
      wrongNote: "That is the map length. Give the real distance and its unit."
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
    bead(-1.22, 0.9, -0.27, "kms-scale-bar", "the scale bar", {});
    bead(-1.42, 1.18, -0.62, "kms-start-end", "the start and the destination", {});
    bead(-1.03, 1.46, -0.71, "kms-route", "the marked route", {});
    bead(-1.08, 0.9, -1.11, "kms-compass-rose", "the decorative compass rose", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kms-ord-measure", "1 · measure the route on the map", {});
    bead(-0.58, 1.46, -1.44, "kms-ord-scale", "2 · scale it up to real distance", {});
    bead(-0.24, 0.9, -1.23, "kms-ord-speed", "3 · choose the speed", {});
    bead(0, 1.18, -1.55, "kms-ord-time", "4 · work out the time", {});
    bead(0.24, 1.46, -1.23, "kms-trace-route", "Tracing the route with the string", {});
    bead(0.58, 0.9, -1.44, "kms-plan-straight", "a straight line across the water", {});
    bead(0.68, 1.18, -1.05, "kms-plan-no-scale", "a map length used as real distance", {});
    bead(1.08, 1.46, -1.11, "kms-plan-mixed-units", "minutes and hours mixed", {});
    bead(1.03, 0.9, -0.71, "kms-plan-units-written", "units written at every step", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kms-step-back-from-edge", "Step back and keep the group together", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kms-say-real-distance", "Say the real distance with its unit", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kms-behind-rope", "Stay behind the landing rope", "BEHIND\nTHE ROPE", { ry: 1.2 });
    dials["kms-unit-dial"] = dial(-1.89, -1.4, 0.93, "kms-unit-dial", "Minutes to hours");
    meters["kms-speed-meter"] = meter(-1.45, -1.85, 0.67, "kms-speed-meter", "Walking speed");
    tokens["kms-time-token"] = token(-0.92, -2.16, 0.4, "kms-time-token", "Journey time");
    spots["kms-timetable-spot"] = spot(-0.31, -2.33, 0.13, "kms-timetable-spot", "On the day's timetable");
    card(0.31, 1.35, -2.33, "kms-sense-card", "Does the answer make sense?", "DOES IT\nMAKE SENSE?", { ry: -0.13 });
    meters["kms-track-meter"] = meter(0.92, -2.16, -0.4, "kms-track-meter", "Pace on the walk");
    boards["kms-route-log"] = board(1.45, -1.85, -0.67, "kms-route-log", "Route record");
    boards["kms-share-board"] = board(1.89, -1.4, -0.93, "kms-share-board", "Share with the class");
    boards["kms-checkin"] = board(2.19, -0.85, -1.2, "kms-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "measure-as-the-crow-flies", "Measure straight across the water for a walking route?", "STRAIGHT\nACROSS", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "forget-the-scale", "Use the ruler reading as the real distance?", "RULER =\nREAL", 0.3);
    hazardCard(0.58, 0.72, -1.86, "mix-minutes-and-hours", "Mix minutes and hours in the time?", "MINUTES +\nHOURS", -0.3);
    hazardCard(1.53, 0.72, -1.21, "step-over-the-landing-rope", "Step past the landing rope to see the map better?", "PAST THE\nROPE", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Map distance times scale."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Ferry landing attendant", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-ferry-comes-in"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-ferry-comes-in"].visible = false;
    arrivals["the-teacher-asks-for-the-real-distance"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-teacher-asks-for-the-real-distance"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "put-the-journey-time-on-the") { const s = spots["kms-timetable-spot"]; tokens["kms-time-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-route-and-the-working") repaint(boards["kms-route-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Route and working recorded"], "#59c97b"));
        if (step.id === "show-the-class-your-sense-check") repaint(boards["kms-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Method shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kms-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "check-the-answer-against-common-sense") paintGuide("Distance, speed, time: know two, find the third.");
      },

      onHazard() {
        paintGuide("Stop. Check the scale and the units before you go on.");
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
        if (it.id === "the-ferry-comes-in") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Back behind the rope. The attendant gives the all-clear and the lesson carries on."); }
        if (it.id === "the-teacher-asks-for-the-real-distance") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Real distance given with its unit. The time can now be trusted."); }
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
