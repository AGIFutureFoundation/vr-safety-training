import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Reading a Flood Map's Colours. Lower-secondary maths at the Lakefront Levee and Floodwall Crew in Jefferson Parish: a flood map as a coloured data display, read through its key, its scale and its north arrow, low ground told apart from high ground, and the map used to plan a route and a meeting place, using only the practice map the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_READING_A_FLOOD_MAPS_COLOURS = {
  id: "k12-by-reading-a-flood-maps-colours",
  index: "838",
  domain: "Education",
  trade: "Maths and map class with the levee district's planner — learner and levee district planner",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Reading a Flood Map's Colours",
  title: simTitle("Reading a Flood Map's Colours"),
  tagline: "Key first, then colours — a flood map shows low and high ground so a family can plan calmly",
  accent: 0x7a6fc0,
  accentCss: "#7a6fc0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"map-key-reader","name":"Map Key Reader","note":"Read a practice flood map through its key and scale, told low ground from high and planned a route to higher ground"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Map Board",
    currency: "KEYS",
    ranks: ["Looker","Key Reader","Scale Reader","Route Planner","Planner"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-three-tools-on-the") },
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
    "colours-without-the-key": "You guessed what the colours mean. Different maps use colours differently, so the key is the only honest guide. Read the key first, then the map; a colour means exactly what the key says and nothing else.",
    "map-shows-today": "You said the map shows today's water. A flood map shows which ground is lower or more likely to hold water in heavy rain, so people can plan ahead. It is a planning tool, not a live picture of the streets.",
    "ignore-the-scale": "You judged the distance by eye. Maps are drawn smaller than real life, and the scale bar tells you by how much. Measure along the route and use the scale bar, or your plan could be far longer or shorter than you think.",
    "no-plan-needed": "You said families on higher ground need no plan. Every family benefits from a plan: roads you use may cross low ground, and neighbours may need help. The map helps everyone plan, wherever they live."
  },

  lateNotes: {
    "bym-map-log": "The map reading is recorded once the route is chosen — nothing to record yet.",
    "bym-checkin": "The check-in comes at the very end of the session."
  },

  steps: [
    {
      id: "find-the-three-tools-on-the",
      kind: "find",
      noHint: true,
      targets: [
        "bym-key",
        "bym-scale",
        "bym-north"
      ],
      itemNames: {
        "bym-key": "the colour key",
        "bym-scale": "the scale bar",
        "bym-north": "the north arrow"
      },
      itemNotes: {
        "bym-key": "It says what each colour means.",
        "bym-scale": "It turns map distance into real distance.",
        "bym-north": "It shows which way the map faces."
      },
      decoyNotes: {
        "bym-title-art": "Nice to look at, but it tells you nothing about the ground."
      },
      title: "Find the three tools on the map",
      cue: "Mark the three parts of the practice map you read before looking at any colours.",
      why: "Every good map carries three tools. The key tells you what each colour means, the scale bar tells you how map distance turns into real distance, and the north arrow tells you which way the map faces. Reading those first is the difference between looking at a pretty picture and actually reading a map."
    },
    {
      id: "sit-at-the-planning-table",
      kind: "select",
      target: "bym-table-card",
      title: "Sit at the planning table",
      cue: "Take your seat at the planner's table before the practice map is unrolled.",
      why: "The planner's table is where the levee district lays out its maps and talks through plans. Sitting there means everyone can see the whole map at once and point to what they mean. Planners work round a shared table for the same reason: a plan made together is understood together."
    },
    {
      id: "put-the-map-reading-steps-in",
      kind: "sequence",
      targets: [
        "bym-ord-title",
        "bym-ord-key",
        "bym-ord-where",
        "bym-ord-colours"
      ],
      itemNames: {
        "bym-ord-title": "1 · read the map's title",
        "bym-ord-key": "2 · read the colour key",
        "bym-ord-where": "3 · find where you are",
        "bym-ord-colours": "4 · read the colours around you"
      },
      title: "Put the map-reading steps in order",
      cue: "Read the title, read the key, find where you are, then read the colours around you.",
      why: "The title tells you what the map is about, the key tells you how to read it, finding yourself anchors the map to the real world, and only then do the colours around you make sense. Reading in that order stops you jumping to a conclusion before you know what the colours mean.",
      outOfOrderNote: "Out of order. Read the map's title and key before you look at any colours."
    },
    {
      id: "keep-your-finger-on-the-school",
      kind: "hold",
      target: "bym-finger",
      seconds: 6,
      title: "Keep your finger on the school",
      cue: "Hold your finger on the school's symbol while your partner reads the colour around it.",
      why: "On a busy map it is easy to lose the spot you were reading. Holding your place while a partner reads the colour against the key means you both talk about the same place. Planners pin a marker to the map in the same way, so the conversation stays on the spot that matters.",
      holdBreakNote: "Your finger slid off the school. Find its symbol again and hold it there."
    },
    {
      id: "turn-the-map-to-face-north",
      kind: "turn",
      target: "bym-map-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "NORTH"
      },
      title: "Turn the map to face north",
      cue: "Turn the map dial until the north arrow points the same way as the compass on the table.",
      why: "When a map faces the same way as the real world, left on the map is left outside and routes are easier to follow. Lining the north arrow up with a compass is called setting the map. Crews set their maps before every job in the field so no one heads off the wrong way."
    },
    {
      id: "measure-the-route-with-the-scale",
      kind: "gauge",
      target: "bym-scale-meter",
      gauge: {
        label: "SCALE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not matched yet. Line the strip up against the scale bar carefully."
      },
      title: "Measure the route with the scale bar",
      cue: "Commit when the measuring strip matches the length of the route on the scale bar.",
      why: "The scale bar is a ruler for the map. Laying your strip along the route and then against the scale bar turns a map length into a real distance. Knowing the real distance lets a family judge whether a route is a short walk or needs a car, which is the kind of choice a good plan makes early."
    },
    {
      id: "place-the-meeting-pin-on-higher",
      kind: "drag",
      target: "bym-meet-pin",
      drag: {
        to: "bym-high-ground",
        radius: 0.45,
        missNote: "That spot is not higher ground on the key. Check the key and try again."
      },
      title: "Place the meeting pin on higher ground",
      cue: "Drag the meeting pin to a place the key shows as higher ground.",
      why: "A family meeting place works best somewhere easy to reach and on higher ground. Using the key to choose it, rather than guessing, means the choice is based on the map's evidence. Planners choose staging areas and shelters in the same careful way, colour by colour."
    },
    {
      id: "choose-the-route-that-stays-on",
      kind: "select",
      target: "bym-route-card",
      title: "Choose the route that stays on higher ground",
      cue: "Choose the route from school to the meeting pin that crosses the least low ground.",
      why: "Two routes can be the same length but cross very different ground. Reading the colours along each route and choosing the one that stays higher is using the map as intended: to make a calm, sensible plan ahead of time. That is exactly how the planner helps crews choose their roads."
    },
    {
      id: "spot-the-mistakes-in-a-sample",
      kind: "find",
      noHint: true,
      targets: [
        "bym-mn-key",
        "bym-mn-guess",
        "bym-mn-flip"
      ],
      itemNames: {
        "bym-mn-key": "a colour read without checking the key",
        "bym-mn-guess": "a distance guessed by eye",
        "bym-mn-flip": "a map read upside down"
      },
      itemNotes: {
        "bym-mn-key": "Always check the key.",
        "bym-mn-guess": "Use the scale bar.",
        "bym-mn-flip": "Set it to north first."
      },
      decoyNotes: {
        "bym-mn-date": "Good practice. Keep it."
      },
      title: "Spot the mistakes in a sample map reading",
      cue: "Look at another group's notes on the map and mark each mistake.",
      why: "Map readings go wrong in familiar ways: a colour read without the key, a distance guessed instead of measured, or a map that was upside down. Finding these in someone else's notes trains the careful habits that make your own reading trustworthy."
    },
    {
      id: "trace-the-route-along-the-streets",
      kind: "track",
      target: "bym-route-meter",
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
        label: "ROUTE"
      },
      title: "Trace the route along the streets",
      cue: "Keep the marker on your chosen route as you trace it along the streets on the map.",
      why: "Tracing the route slowly shows every turn and every change of colour along the way. You might notice a stretch that dips into low ground or a bridge you had not seen. Planners trace routes the same way before a crew sets off, so there are no surprises on the road.",
      holdBreakNote: "The marker left the route. Find the street again and keep tracing."
    },
    {
      id: "record-your-map-reading",
      kind: "select",
      target: "bym-map-log",
      doneLine: "Map reading recorded",
      title: "Record your map reading",
      cue: "Write what the key says, your meeting place, your route and its real distance.",
      why: "Written notes turn a map reading into a plan anyone can follow. Recording what the key says beside your choices shows your reasons, so a grown-up can check them. The levee district keeps notes like these with every map it uses, so plans can be shared and improved."
    },
    {
      id: "check-your-plan-with-the-planner",
      kind: "select",
      target: "bym-share-board",
      doneLine: "Plan checked",
      title: "Check your plan with the planner",
      cue: "Show the planner your route and meeting place and ask if they would choose the same.",
      why: "The planner knows the parish's roads and the map's details well. Checking your plan with someone who uses these maps every day tests your reading. If they suggest a change, it is usually because of something on the ground the map alone cannot show."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "bym-checkin",
      doneLine: "Checked in",
      title: "Check in at the planning table",
      cue: "What did the key help you see? How could a map like this help your family plan?",
      why: "The planner closes each meeting by asking what everyone will do next, so the class closes the same way. Each learner names one thing the key showed and one way a family could use a map to plan calmly. Anyone who found the map worrying can say so, and the group talks about how planning helps."
    }
  ],

  interrupts: [
    {
      id: "the-map-starts-to-roll-up",
      kind: "Map slipping",
      after: "keep-your-finger-on-the-school",
      delay: 3,
      seconds: 12,
      target: "bym-weight-corners",
      alert: "The practice map starts to roll up and the group's markers slide off.",
      cue: "Put the weights on the map's corners so it lies flat again.",
      why: "A map that keeps moving is hard to read accurately, and markers end up in the wrong place. Weighting the corners fixes the map so everyone reads the same spot. Planners do this before every meeting for exactly this reason.",
      missNote: "Nobody weighted the corners, and the markers slid into the wrong places as the map kept rolling up.",
      wrongNote: "That does not hold the map flat. Put the weights on the corners. Choose the response that deals with it now."
    },
    {
      id: "the-planner-asks-about-a-colour",
      kind: "Planner question",
      after: "trace-the-route-along-the-streets",
      delay: 3,
      seconds: 12,
      target: "bym-read-key",
      alert: "The planner points to a colour on the map and asks what it means.",
      cue: "Check the key and say what that colour stands for.",
      why: "Going to the key, rather than guessing, is the habit the whole lesson teaches. Saying what the key says shows you read the map honestly. The planner asks because a wrong guess can lead to a poor plan.",
      missNote: "You guessed the colour's meaning without checking the key, and the planner had to show you the key before the group could go on.",
      wrongNote: "That is a guess. Check the key first. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x7a6fc0;
    const CSS = "#7a6fc0";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#727078", base2: "#64626a", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e2dff0", base2: "#d2cee4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "bym-key", "the colour key", {});
    bead(-1.42, 1.18, -0.62, "bym-scale", "the scale bar", {});
    bead(-1.03, 1.46, -0.71, "bym-north", "the north arrow", {});
    bead(-1.08, 0.9, -1.11, "bym-title-art", "the decorated border", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "bym-ord-title", "1 · read the map's title", {});
    bead(-0.58, 1.46, -1.44, "bym-ord-key", "2 · read the colour key", {});
    bead(-0.24, 0.9, -1.23, "bym-ord-where", "3 · find where you are", {});
    bead(0, 1.18, -1.55, "bym-ord-colours", "4 · read the colours around you", {});
    bead(0.24, 1.46, -1.23, "bym-finger", "Finger on the school", {});
    bead(0.58, 0.9, -1.44, "bym-mn-key", "a colour read without checking the key", {});
    bead(0.68, 1.18, -1.05, "bym-mn-guess", "a distance guessed by eye", {});
    bead(1.08, 1.46, -1.11, "bym-mn-flip", "a map read upside down", {});
    bead(1.03, 0.9, -0.71, "bym-mn-date", "the map's title written at the top of the notes", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "bym-weight-corners", "Put the weights on the map's corners", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "bym-read-key", "Read the colour from the key", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "bym-table-card", "Sit at the table", "PLANNING\nTABLE", { ry: 1.2 });
    dials["bym-map-dial"] = dial(-1.89, -1.4, 0.93, "bym-map-dial", "Map set to north");
    meters["bym-scale-meter"] = meter(-1.45, -1.85, 0.67, "bym-scale-meter", "Route length");
    tokens["bym-meet-pin"] = token(-0.92, -2.16, 0.4, "bym-meet-pin", "Meeting pin");
    spots["bym-high-ground"] = spot(-0.31, -2.33, 0.13, "bym-high-ground", "Higher ground on the key");
    card(0.31, 1.35, -2.33, "bym-route-card", "Choose the route", "WHICH\nROUTE?", { ry: -0.13 });
    meters["bym-route-meter"] = meter(0.92, -2.16, -0.4, "bym-route-meter", "Route traced");
    boards["bym-map-log"] = board(1.45, -1.85, -0.67, "bym-map-log", "Map reading record");
    boards["bym-share-board"] = board(1.89, -1.4, -0.93, "bym-share-board", "Check with the planner");
    boards["bym-checkin"] = board(2.19, -0.85, -1.2, "bym-checkin", "End-of-session check-in");
    hazardCard(-1.53, 0.72, -1.21, "colours-without-the-key", "Decide what each colour means without reading the key?", "NO\nKEY", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "map-shows-today", "Say the map shows where water is right now?", "RIGHT\nNOW?", 0.3);
    hazardCard(0.58, 0.72, -1.86, "ignore-the-scale", "Judge the distance to higher ground by eye?", "BY\nEYE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "no-plan-needed", "Say a family on higher ground needs no plan at all?", "NO\nPLAN?", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Key first, then colours."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Levee district planner", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Levee crew member", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-map-starts-to-roll-up"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-map-starts-to-roll-up"].visible = false;
    arrivals["the-planner-asks-about-a-colour"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-planner-asks-about-a-colour"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-meeting-pin-on-higher") { const s = spots["bym-high-ground"]; tokens["bym-meet-pin"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-your-map-reading") repaint(boards["bym-map-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Map reading recorded"], "#59c97b"));
        if (step.id === "check-your-plan-with-the-planner") repaint(boards["bym-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Plan checked"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["bym-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "choose-the-route-that-stays-on") paintGuide("Higher ground, measured route.");
      },

      onHazard() {
        paintGuide("Stop. Check the key — do not guess.");
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
        if (it.id === "the-map-starts-to-roll-up") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Map weighted flat, markers replaced. The lesson carries on."); }
        if (it.id === "the-planner-asks-about-a-colour") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Colour read from the key. The lesson carries on."); }
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
