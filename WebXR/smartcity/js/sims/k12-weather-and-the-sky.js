import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Weather and the Sky. Upper-primary science at a shoreline field lab's weather station: reading clouds, wind direction and the station's instruments, telling weather from climate, and why a forecast is a likelihood, using only the readings the station's own displays show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_WEATHER_AND_THE_SKY = {
  id: "k12-weather-and-the-sky",
  index: "820",
  domain: "Education",
  trade: "Science class at the shoreline field lab's weather station — learner and field technician",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Weather and the Sky",
  title: simTitle("Weather and the Sky"),
  tagline: "Read the sky and the instruments together — and head indoors when the lightning rule says so",
  accent: 0x4fb88a,
  accentCss: "#4fb88a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"sky-reader","name":"Sky Reader","note":"Clouds, wind and the station's instruments read together, weather told apart from climate and a forecast stated as a likelihood"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Sky Board",
    currency: "OBSERVATIONS",
    ranks: ["Watcher","Observer","Recorder","Forecaster","Meteorologist"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-the-sky-and-station") },
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
    "wind-named-by-where-it-goes": "You named the wind by where it was blowing to. Winds are named by where they come from, so a wind from the sea is a sea wind even though it blows inland. Getting it backwards turns every forecast you read upside down.",
    "one-cold-day-disproves-climate": "You said one cold day shows the climate is not changing. Weather is what the sky does today; climate is the pattern over many years. One day, cold or hot, cannot tell you about a pattern that needs decades of records to see.",
    "stay-out-with-thunder": "You wanted to stay outside to watch the storm. When thunder can be heard, lightning is close enough to be dangerous; the field lab's rule is everyone indoors, and the instruments keep recording without you.",
    "forecast-is-a-promise": "You said the forecast promised no rain. A forecast gives the likelihood of weather from what the instruments show now; it can be wrong, which is why it is stated as a chance, and why forecasters keep checking and updating."
  },

  lateNotes: {
    "kws-sky-log": "The weather record is written once every reading is taken — nothing to record yet.",
    "kws-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      "id": "find-what-the-sky-and-station",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kws-clouds",
        "kws-windsock",
        "kws-station-display"
      ],
      "itemNames": {
        "kws-clouds": "the kind of cloud overhead",
        "kws-windsock": "the windsock on its mast",
        "kws-station-display": "the station's live display"
      },
      "itemNotes": {
        "kws-clouds": "Tall, heaped clouds and flat grey sheets bring different weather.",
        "kws-windsock": "It points away from where the wind comes from.",
        "kws-station-display": "It shows readings the lesson can use; no figures are invented."
      },
      "decoyNotes": {
        "kws-gulls-flying": "Folk sayings about gulls are fun but are not a reliable instrument."
      },
      "title": "Find what the sky and station show",
      "cue": "Mark the three things you read before describing today's weather.",
      "why": "Describing the weather properly means reading the sky and the instruments together: the kind of cloud, which way the wind is coming from, and what the station's displays show. Each one alone can mislead; all three together give a description another observer would recognise."
    },
    {
      "id": "learn-the-field-labs-lightning-rule",
      "kind": "select",
      "target": "kws-lightning-card",
      "title": "Learn the field lab's lightning rule",
      "cue": "Read the lab's rule on the card: if you hear thunder, go indoors.",
      "why": "Lightning can strike well away from the storm cloud, so waiting until it is overhead is too late. The simple rule, hear thunder and go inside, is the one weather services and outdoor workers use, and knowing it before the lesson starts means nobody has to think in a hurry."
    },
    {
      "id": "put-the-observation-in-order",
      "kind": "sequence",
      "targets": [
        "kws-ord-sky",
        "kws-ord-wind",
        "kws-ord-instruments",
        "kws-ord-write"
      ],
      "itemNames": {
        "kws-ord-sky": "1 · look at the sky",
        "kws-ord-wind": "2 · read where the wind comes from",
        "kws-ord-instruments": "3 · read the instruments",
        "kws-ord-write": "4 · write the observation"
      },
      "title": "Put the observation in order",
      "cue": "Look at the sky, read the wind, read the instruments, then write the observation.",
      "why": "Looking at the sky first gives the big picture, the wind shows what is coming, and the instruments put careful measurements to both. Writing the observation last, in the same order every time, makes records from different days easy to compare, which is how patterns are spotted.",
      "outOfOrderNote": "Out of order. Start with the sky and the wind before the instruments."
    },
    {
      "id": "hold-the-compass-steady-to-read",
      "kind": "hold",
      "target": "kws-compass",
      "seconds": 6,
      "title": "Hold the compass steady to read the wind",
      "cue": "Hold the compass flat and still beside the windsock until the needle settles.",
      "why": "A compass needle swings before it settles, and a tilted compass can stick. Holding it flat and still beside the windsock gives the direction the wind is coming from, which is the single most useful clue to what the next few hours will bring.",
      "holdBreakNote": "The compass tilted and the needle stuck. Hold it flat and let it settle."
    },
    {
      "id": "turn-the-wind-arrow-to-match",
      "kind": "turn",
      "target": "kws-wind-dial",
      "turn": {
        "turns": 0.5,
        "axis": "y",
        "label": "WIND"
      },
      "title": "Turn the wind arrow to match the sock",
      "cue": "Turn the arrow on the weather chart to show where the wind is coming from.",
      "why": "On a weather chart the wind arrow is drawn flying with the wind, from where it comes. Turning it to match the windsock builds the habit of naming winds by their source, so a chart you draw means the same thing as a chart a forecaster draws."
    },
    {
      "id": "read-the-rain-gauge-at-eye",
      "kind": "gauge",
      "target": "kws-rain-meter",
      "gauge": {
        "label": "RAIN",
        "speed": 0.6,
        "green": [
          0.4,
          0.58
        ],
        "missNote": "Not level yet. Bring your eye to the water's surface and read the middle."
      },
      "title": "Read the rain gauge at eye level",
      "cue": "Commit when your eye is level with the water in the gauge.",
      "why": "The water in a rain gauge curves slightly at the edge, and reading it from above or below gives the wrong amount. Reading at eye level, at the flat middle of the surface, is the same care scientists take with any measuring cylinder."
    },
    {
      "id": "match-the-cloud-to-its-weather",
      "kind": "drag",
      "target": "kws-cloud-token",
      "drag": {
        "to": "kws-cloud-spot",
        "radius": 0.45,
        "missNote": "Not matched yet. Tall heaped clouds bring showers and thunder."
      },
      "title": "Match the cloud to its weather",
      "cue": "Drag the tall heaped cloud card to the weather it can bring.",
      "why": "Tall, heaped clouds that build upwards through the day can bring heavy showers and thunder; flat grey sheets tend to bring steady drizzle. Matching cloud to weather is forecasting at its simplest, and it has helped sailors and farmers long before any instrument."
    },
    {
      "id": "say-the-difference-between-weather-and",
      "kind": "select",
      "target": "kws-compare-card",
      "title": "Say the difference between weather and climate",
      "cue": "Say what weather is, what climate is, and why one day cannot show a climate.",
      "why": "Weather is what happens today; climate is the pattern of weather over many years. Being able to say that clearly, and why one day is not enough, is what lets you make sense of news about climate without being fooled by a single hot or cold spell."
    },
    {
      "id": "spot-the-problems-in-a-classmates",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kws-lg-wind",
        "kws-lg-time",
        "kws-lg-climate"
      ],
      "itemNames": {
        "kws-lg-wind": "a wind named by where it blows to",
        "kws-lg-time": "a reading with no time",
        "kws-lg-climate": "one day used to judge the climate"
      },
      "itemNotes": {
        "kws-lg-wind": "Name winds by where they come from.",
        "kws-lg-time": "Every reading needs its time.",
        "kws-lg-climate": "Climate needs many years of records."
      },
      "decoyNotes": {
        "kws-lg-sketch": "A cloud sketch is good practice. Keep it."
      },
      "title": "Spot the problems in a classmate's weather log",
      "cue": "Look at the draft weather log and mark each problem.",
      "why": "Weather logs go wrong in predictable ways: a wind named by where it goes, a reading with no time, and one day's weather used to judge the climate. Spotting them in a classmate's log is practice for keeping your own records useful."
    },
    {
      "id": "follow-the-gusts-on-the-wind",
      "kind": "track",
      "target": "kws-track-meter",
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
        "label": "GUSTS"
      },
      "title": "Follow the gusts on the wind display",
      "cue": "Keep the marker with the wind speed as the gusts rise and fall.",
      "why": "Wind comes in gusts and lulls, not one steady speed. Following the display for a while shows why observers describe the typical wind and the strongest gust separately, and why a single glance can give a very different picture.",
      "holdBreakNote": "The marker lost the wind reading. Catch up with the display and follow it."
    },
    {
      "id": "record-todays-observation",
      "kind": "select",
      "target": "kws-sky-log",
      "doneLine": "Observation recorded",
      "title": "Record today's observation",
      "cue": "Write the cloud, the wind direction, the readings and the time.",
      "why": "One observation is a snapshot; a year of them, in the same form, is a record from which patterns emerge. Writing the time and the same details every day is how weather records, and eventually climate records, are built."
    },
    {
      "id": "make-a-forecast-as-a-likelihood",
      "kind": "select",
      "target": "kws-share-board",
      "doneLine": "Forecast made",
      "title": "Make a forecast as a likelihood",
      "cue": "Say what you think the weather will do next, and how likely it is.",
      "why": "A good forecast uses today's observations to say what is likely, not what is certain. Stating it as a likelihood, and checking it later against what happened, is how forecasters learn, and how you will too."
    },
    {
      "id": "crew-check-in",
      "kind": "select",
      "target": "kws-checkin",
      "doneLine": "Checked in",
      "title": "Check in at the end of the lesson",
      "cue": "What will you notice about the sky on the way home? What was hard today?",
      "why": "A check-in helps every learner connect the lesson to the sky they walk under every day, and lets the teacher hear what needs going over again. It is not marked, and the teacher or a trusted adult is there for anyone who wants to talk."
    }
  ],

  interrupts: [
    {
      "id": "thunder-is-heard",
      "kind": "Thunder",
      "after": "hold-the-compass-steady-to-read",
      "delay": 3,
      "seconds": 12,
      "target": "kws-go-indoors",
      "alert": "A low rumble of thunder rolls in from the hills.",
      "cue": "Go straight indoors with your group and wait for the technician's all-clear.",
      "why": "If you can hear thunder, lightning is close enough to strike. Going straight inside with your group, and waiting for the all-clear, is the rule weather services give everyone; the instruments keep recording while you are safe.",
      "missNote": "The group stayed out to watch, and the technician had to call everyone in as the storm arrived.",
      "wrongNote": "That keeps you outside. Go indoors now. Choose the response that deals with it now."
    },
    {
      "id": "the-technician-asks-wind-direction",
      "kind": "Technician question",
      "after": "follow-the-gusts-on-the-wind",
      "delay": 3,
      "seconds": 12,
      "target": "kws-say-wind",
      "alert": "The field technician asks you which way the wind is blowing.",
      "cue": "Say where the wind is coming from, reading the windsock and compass.",
      "why": "The technician is checking you name winds by their source. Saying where it comes from, and how you read it, shows you would write the same thing in the station log as they would.",
      "missNote": "You said where the wind was going, and the technician's log would have been backwards.",
      "wrongNote": "That names where it goes, not where it comes from. Choose the response that deals with it now."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#727a78", base2: "#666e6c", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dde6ea", base2: "#cdd8de", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "kws-clouds", "the kind of cloud overhead", {});
    bead(-1.42, 1.18, -0.62, "kws-windsock", "the windsock on its mast", {});
    bead(-1.03, 1.46, -0.71, "kws-station-display", "the station's live display", {});
    bead(-1.08, 0.9, -1.11, "kws-gulls-flying", "gulls flying inland", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kws-ord-sky", "1 · look at the sky", {});
    bead(-0.58, 1.46, -1.44, "kws-ord-wind", "2 · read where the wind comes from", {});
    bead(-0.24, 0.9, -1.23, "kws-ord-instruments", "3 · read the instruments", {});
    bead(0, 1.18, -1.55, "kws-ord-write", "4 · write the observation", {});
    bead(0.24, 1.46, -1.23, "kws-compass", "Compass held flat", {});
    bead(0.58, 0.9, -1.44, "kws-lg-wind", "a wind named by where it blows to", {});
    bead(0.68, 1.18, -1.05, "kws-lg-time", "a reading with no time", {});
    bead(1.08, 1.46, -1.11, "kws-lg-climate", "one day used to judge the climate", {});
    bead(1.03, 0.9, -0.71, "kws-lg-sketch", "a sketch of the clouds", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kws-go-indoors", "Go straight indoors with the group", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kws-say-wind", "Say where the wind is coming from", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kws-lightning-card", "Hear thunder, go indoors", "HEAR IT?\nGO IN", { ry: 1.2 });
    dials["kws-wind-dial"] = dial(-1.89, -1.4, 0.93, "kws-wind-dial", "Chart wind arrow");
    meters["kws-rain-meter"] = meter(-1.45, -1.85, 0.67, "kws-rain-meter", "Rain gauge reading");
    tokens["kws-cloud-token"] = token(-0.92, -2.16, 0.4, "kws-cloud-token", "Tall heaped cloud");
    spots["kws-cloud-spot"] = spot(-0.31, -2.33, 0.13, "kws-cloud-spot", "Showers and thunder");
    card(0.31, 1.35, -2.33, "kws-compare-card", "Weather or climate?", "TODAY OR\nYEARS?", { ry: -0.13 });
    meters["kws-track-meter"] = meter(0.92, -2.16, -0.4, "kws-track-meter", "Gusts followed");
    boards["kws-sky-log"] = board(1.45, -1.85, -0.67, "kws-sky-log", "Weather record");
    boards["kws-share-board"] = board(1.89, -1.4, -0.93, "kws-share-board", "Your forecast");
    boards["kws-checkin"] = board(2.19, -0.85, -1.2, "kws-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "wind-named-by-where-it-goes", "Name the wind by the way it is blowing to?", "WIND\nGOING TO", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "one-cold-day-disproves-climate", "Say one cold day shows the climate is not warming?", "ONE COLD\nDAY", 0.3);
    hazardCard(0.58, 0.72, -1.86, "stay-out-with-thunder", "Stay outside to watch the storm come in?", "WATCH THE\nSTORM", -0.3);
    hazardCard(1.53, 0.72, -1.21, "forecast-is-a-promise", "Say the forecast promised no rain?", "FORECAST\nPROMISED", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Sky, wind, instruments."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Field technician", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Lab volunteer", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["thunder-is-heard"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["thunder-is-heard"].visible = false;
    arrivals["the-technician-asks-wind-direction"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-technician-asks-wind-direction"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "match-the-cloud-to-its-weather") { const s = spots["kws-cloud-spot"]; tokens["kws-cloud-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-todays-observation") repaint(boards["kws-sky-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Observation recorded"], "#59c97b"));
        if (step.id === "make-a-forecast-as-a-likelihood") repaint(boards["kws-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Forecast made"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kws-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-the-difference-between-weather-and") paintGuide("Weather is today; climate is years.");
      },

      onHazard() {
        paintGuide("Stop. Where does the wind come from? Is it today or years?");
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
        if (it.id === "thunder-is-heard") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Everyone indoors, all-clear given later. The lesson carries on."); }
        if (it.id === "the-technician-asks-wind-direction") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Wind named by where it comes from. It goes in the log."); }
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
