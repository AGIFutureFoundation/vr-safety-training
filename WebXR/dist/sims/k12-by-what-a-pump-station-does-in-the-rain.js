import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — What a Pump Station Does in the Rain. Upper-primary science at the Drainage Pumping Station in Orleans Parish: rain runs to the lowest place it can reach, drains and canals carry it to the station, and pumps lift it up and over to the river or the lake, using only the model and the operator's panel the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_WHAT_A_PUMP_STATION_DOES_IN_THE_RAIN = {
  id: "k12-by-what-a-pump-station-does-in-the-rain",
  index: "830",
  domain: "Education",
  trade: "Science class at the drainage pumping station — learner and pump station operator",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "What a Pump Station Does in the Rain",
  title: simTitle("What a Pump Station Does in the Rain"),
  tagline: "Water only runs downhill — so in low ground the pumps give it a lift, and the screen stays clear",
  accent: 0x4f9fc0,
  accentCss: "#4f9fc0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"rain-lifter","name":"Rain Lifter","note":"Traced rain from a roof to the pump station, explained why low ground needs a pump and kept the model's screen clear"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Pump Board",
    currency: "LIFTS",
    ranks: ["Drop","Gutter","Drain","Canal","Operator"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-where-the-rain-goes") },
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
    "water-runs-uphill": "You said the water would run out to the river on its own. Water only runs downhill. Where the streets sit lower than the water around them, it collects in the low places, and a pump has to lift it up and over before it can leave.",
    "clear-the-screen-by-hand": "You reached into the intake while the model pump was running. Operators never put a hand near moving parts: they stop the pump, lock it off and use the rake. The rule is the same for a model on the bench and a real station.",
    "one-big-pump-is-enough": "You switched every pump on at once. Operators start pumps one after another as the water in the canal rises, so the power supply and the canals keep up. Starting in order is steadier and leaves pumps ready if more rain comes.",
    "litter-does-not-matter": "You said street litter does not matter. Leaves, bottles and bags wash into the drains and pile up on the station's screens, which slows the water down. Keeping drains clear at home is one way every family helps the pumps do their job."
  },

  lateNotes: {
    "byp-pump-log": "The pump record is written once the model test is done — nothing to record yet.",
    "byp-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-where-the-rain-goes",
      kind: "find",
      noHint: true,
      targets: [
        "byp-gutter",
        "byp-drain",
        "byp-canal"
      ],
      itemNames: {
        "byp-gutter": "the roof gutter and downpipe",
        "byp-drain": "the street drain grate",
        "byp-canal": "the drainage canal"
      },
      itemNotes: {
        "byp-gutter": "Rain leaves the roof here.",
        "byp-drain": "Water from the street goes in here.",
        "byp-canal": "It carries the water to the station."
      },
      decoyNotes: {
        "byp-mailbox": "Part of the street, but no rainwater passes through it."
      },
      title: "Find where the rain goes",
      cue: "Mark the three places the rain passes on its way to the pump station in the model street.",
      why: "Rain that lands on a roof does not vanish. It runs down the gutter, into the street drain, then along an underground pipe or an open canal to the pump station. Finding each stop on the model is how you follow the water's whole path, and it shows why a blocked drain anywhere slows everything behind it."
    },
    {
      id: "stand-behind-the-yellow-line-in",
      kind: "select",
      target: "byp-line-card",
      title: "Stand behind the yellow line in the pump hall",
      cue: "Take your place behind the yellow line before the operator starts the demonstration.",
      why: "A pump hall is a working room with big machines, and the yellow line shows where visitors stand. From behind it you can see the pumps, the panel and the operator clearly. Standing there first means the operator can concentrate on the pumps and never has to stop to move someone out of the way."
    },
    {
      id: "put-the-pump-start-up-in",
      kind: "sequence",
      targets: [
        "byp-ord-screen",
        "byp-ord-level",
        "byp-ord-start",
        "byp-ord-watch"
      ],
      itemNames: {
        "byp-ord-screen": "1 · check the screen is clear",
        "byp-ord-level": "2 · read the canal level",
        "byp-ord-start": "3 · start the first pump",
        "byp-ord-watch": "4 · watch the level fall"
      },
      title: "Put the pump start-up in order",
      cue: "Check the screen is clear, check the canal level, start the first pump, then watch the level fall.",
      why: "Operators follow the same order every time. A clear screen lets water reach the pump, the canal level tells them whether a pump is needed, and starting one pump before the next keeps the flow steady. Watching the level afterwards proves the pump is really moving water.",
      outOfOrderNote: "Out of order. Check the screen is clear before any pump starts."
    },
    {
      id: "hold-the-model-pump-steady",
      kind: "hold",
      target: "byp-pump-switch",
      seconds: 6,
      title: "Hold the model pump steady",
      cue: "Hold the model pump's switch until the water in the low tank is lifted into the high tank.",
      why: "A pump does its work only while it runs. Holding the switch shows how long it takes to lift water from the low tank up to the high one. Seeing that it takes time helps you understand why a station keeps running long after the rain has stopped, until the canals are back down.",
      holdBreakNote: "The pump stopped halfway and the water ran back down. Hold the switch until the lift is done."
    },
    {
      id: "say-why-this-water-needs-a",
      kind: "select",
      target: "byp-reason-card",
      title: "Say why this water needs a pump",
      cue: "Choose the reason the water in the low tank could not reach the high tank without the pump.",
      why: "Water moves from high places to low places on its own. The low tank sits below the high tank, so the water had no way up until the pump lifted it. Saying that clearly is the big idea of the lesson, and it explains every pump station you will ever see."
    },
    {
      id: "spot-what-slows-the-water-down",
      kind: "find",
      noHint: true,
      targets: [
        "byp-ph-leaves",
        "byp-ph-bag",
        "byp-ph-cuttings"
      ],
      itemNames: {
        "byp-ph-leaves": "leaves piled on a grate",
        "byp-ph-bag": "a plastic bag in the gutter",
        "byp-ph-cuttings": "grass cuttings in the street"
      },
      itemNotes: {
        "byp-ph-leaves": "Rake them up before rain.",
        "byp-ph-bag": "Put it in the bin.",
        "byp-ph-cuttings": "Keep them on the lawn."
      },
      decoyNotes: {
        "byp-ph-clear": "That is what a drain should look like."
      },
      title: "Spot what slows the water down",
      cue: "Look at the street photo board and mark each thing that could block a drain.",
      why: "Most drain problems start small: leaves piled on a grate, a bag caught in a gutter, grass cuttings swept into the street. Each one slows the water on its way to the pumps. Spotting them teaches you what your family can clear before a rainy day, which is one real way to help."
    },
    {
      id: "open-the-canal-gate-a-little",
      kind: "turn",
      target: "byp-gate-wheel",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "GATE"
      },
      title: "Open the canal gate a little",
      cue: "Turn the gate wheel so water in the model canal flows gently towards the pump.",
      why: "Gates guide water to the pumps. Opening a gate slowly lets the canal fill the pump's intake without a rush that stirs up mud and litter. Operators open gates gently for the same reason, so the flow stays smooth and the screens do not clog all at once."
    },
    {
      id: "start-the-pump-at-the-right",
      kind: "gauge",
      target: "byp-canal-meter",
      gauge: {
        label: "CANAL",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the start mark. Watch the gauge and commit right on the line."
      },
      title: "Start the pump at the right level",
      cue: "Commit when the canal gauge reaches the start mark on the operator's panel.",
      why: "A pump that starts too early runs dry and wears out; one that starts too late lets the canal fill up. The start mark is the level the operators chose for the first pump. Reading the gauge and acting at that mark is the same careful choice a real operator makes on every rainy shift."
    },
    {
      id: "move-the-rake-to-the-screen",
      kind: "drag",
      target: "byp-rake",
      drag: {
        to: "byp-screen",
        radius: 0.45,
        missNote: "The rake is not on the screen yet. Move it right up to the bars."
      },
      title: "Move the rake to the screen",
      cue: "Drag the long rake to the screen once the model pump is switched off.",
      why: "The screen is a row of bars that stops litter from reaching the pump. When it fills up, water slows down. The operator switches the pump off first, then uses a long rake from the walkway to clear it. Using the rake keeps hands far from the water and any moving part."
    },
    {
      id: "follow-the-canal-level-as-the",
      kind: "track",
      target: "byp-level-meter",
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
        label: "LEVEL"
      },
      title: "Follow the canal level as the pumps work",
      cue: "Keep the marker on the canal level as it rises with the rain and falls with the pumps.",
      why: "During rain the canal rises, and as pumps run it falls again. The operator watches that level all shift, because it shows whether the pumps are keeping up. Following it teaches you that the job is not one switch, it is steady watching and adjusting until the rain has passed.",
      holdBreakNote: "The marker left the canal level. Follow the water back and settle on the middle."
    },
    {
      id: "record-the-rains-path-and-the",
      kind: "select",
      target: "byp-pump-log",
      doneLine: "Path and pump test recorded",
      title: "Record the rain's path and the pump test",
      cue: "Draw the path from roof to river and write when the model pump started and stopped.",
      why: "A drawing of the water's path and a note of what the pump did turn a demonstration into something you can explain at home. Operators keep a log of every start and stop for the same reason, so the next shift can see what happened and plan for the next rain."
    },
    {
      id: "explain-the-path-to-a-classmate",
      kind: "select",
      target: "byp-share-board",
      doneLine: "Path explained",
      title: "Explain the path to a classmate",
      cue: "Show your drawing to a classmate and trace the water's path out loud.",
      why: "Explaining something out loud shows whether you really understand it. As you trace the path from roof to river, your classmate can ask where the water goes next. If you can answer each question, the idea is yours, and you can teach it to your family too."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byp-checkin",
      doneLine: "Checked in",
      title: "Check in at the viewing window",
      cue: "What surprised you about where the rain goes? What could your family do to help the drains?",
      why: "The operators end a shift by handing over to the next crew, so the class ends by handing over what it learned. Each learner names one step on the water's path and one thing a family can do, like clearing a grate. Anyone still puzzled about why the water needs a lift can ask the operator now."
    }
  ],

  interrupts: [
    {
      id: "the-screen-alarm-light-comes-on",
      kind: "Panel alarm",
      after: "hold-the-model-pump-steady",
      delay: 3,
      seconds: 12,
      target: "byp-tell-operator",
      alert: "A light on the model panel shows the intake screen is filling with leaves.",
      cue: "Tell the operator the screen light is on and wait behind the line.",
      why: "The light means the screen needs clearing. Telling the operator lets them stop the pump and rake it safely. Trying to fix it yourself, or ignoring it because the demonstration is going well, is how a small blockage becomes a bigger problem.",
      missNote: "Nobody spoke up, and the model screen filled until the water in the canal stopped moving towards the pump.",
      wrongNote: "That does not tell the operator about the light. Say it clearly and stay behind the line. Choose the response that deals with it now."
    },
    {
      id: "the-operator-asks-where-the-water-goes",
      kind: "Operator question",
      after: "follow-the-canal-level-as-the",
      delay: 3,
      seconds: 12,
      target: "byp-say-path",
      alert: "The operator asks where the water goes after the pump lifts it.",
      cue: "Say that it goes up and over into the outfall canal and on to the river or the lake.",
      why: "Knowing where the water ends up completes the picture. The pump is only one step; the water still has to travel on to the river or the lake. Saying the whole path shows you understand the station as part of a bigger system.",
      missNote: "You said the water just disappears, and the operator had to explain the outfall canal before the group could go on.",
      wrongNote: "That leaves out where the water goes. Name the next step on its path. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4f9fc0;
    const CSS = "#4f9fc0";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6f7478", base2: "#62676b", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#d8e2e8", base2: "#c8d4dc", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byp-gutter", "the roof gutter and downpipe", {});
    bead(-1.42, 1.18, -0.62, "byp-drain", "the street drain grate", {});
    bead(-1.03, 1.46, -0.71, "byp-canal", "the drainage canal", {});
    bead(-1.08, 0.9, -1.11, "byp-mailbox", "a mailbox on the corner", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byp-ord-screen", "1 · check the screen is clear", {});
    bead(-0.58, 1.46, -1.44, "byp-ord-level", "2 · read the canal level", {});
    bead(-0.24, 0.9, -1.23, "byp-ord-start", "3 · start the first pump", {});
    bead(0, 1.18, -1.55, "byp-ord-watch", "4 · watch the level fall", {});
    bead(0.24, 1.46, -1.23, "byp-pump-switch", "Run the model pump", {});
    bead(0.58, 0.9, -1.44, "byp-ph-leaves", "leaves piled on a grate", {});
    bead(0.68, 1.18, -1.05, "byp-ph-bag", "a plastic bag in the gutter", {});
    bead(1.08, 1.46, -1.11, "byp-ph-cuttings", "grass cuttings in the street", {});
    bead(1.03, 0.9, -0.71, "byp-ph-clear", "a clear, open drain grate", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byp-tell-operator", "Tell the operator the screen light is on", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byp-say-path", "Say where the lifted water goes next", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byp-line-card", "Stand behind the line", "BEHIND\nTHE LINE", { ry: 1.2 });
    dials["byp-gate-wheel"] = dial(-1.89, -1.4, 0.93, "byp-gate-wheel", "Canal gate wheel");
    meters["byp-canal-meter"] = meter(-1.45, -1.85, 0.67, "byp-canal-meter", "Canal level");
    tokens["byp-rake"] = token(-0.92, -2.16, 0.4, "byp-rake", "Screen rake");
    spots["byp-screen"] = spot(-0.31, -2.33, 0.13, "byp-screen", "The intake screen");
    card(0.31, 1.35, -2.33, "byp-reason-card", "Give the reason", "WHY A\nPUMP?", { ry: -0.13 });
    meters["byp-level-meter"] = meter(0.92, -2.16, -0.4, "byp-level-meter", "Canal level followed");
    boards["byp-pump-log"] = board(1.45, -1.85, -0.67, "byp-pump-log", "Pump record");
    boards["byp-share-board"] = board(1.89, -1.4, -0.93, "byp-share-board", "Explain to a classmate");
    boards["byp-checkin"] = board(2.19, -0.85, -1.2, "byp-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "water-runs-uphill", "Say rain in low ground flows out to the river by itself?", "FLOWS\nUPHILL?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "clear-the-screen-by-hand", "Reach into the model's intake to pull out the leaves?", "HAND\nIN", 0.3);
    hazardCard(0.58, 0.72, -1.86, "one-big-pump-is-enough", "Run every pump at once the moment it starts to rain?", "ALL\nAT ONCE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "litter-does-not-matter", "Say litter in the street drain does no harm?", "JUST\nLITTER", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Rain runs downhill — follow it."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Pump station operator", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Screen rake crew", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-screen-alarm-light-comes-on"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-screen-alarm-light-comes-on"].visible = false;
    arrivals["the-operator-asks-where-the-water-goes"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-operator-asks-where-the-water-goes"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-rake-to-the-screen") { const s = spots["byp-screen"]; tokens["byp-rake"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-rains-path-and-the") repaint(boards["byp-pump-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Path and pump test recorded"], "#59c97b"));
        if (step.id === "explain-the-path-to-a-classmate") repaint(boards["byp-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Path explained"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byp-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-this-water-needs-a") paintGuide("Low ground needs a lift.");
      },

      onHazard() {
        paintGuide("Stop. Pump off, lock it, use the rake.");
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
        if (it.id === "the-screen-alarm-light-comes-on") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Operator told, screen cleared with the rake. The lesson carries on."); }
        if (it.id === "the-operator-asks-where-the-water-goes") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Path to the outfall named. The lesson carries on."); }
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
