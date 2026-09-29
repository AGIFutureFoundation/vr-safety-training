import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — The Water Cycle from Lake to Tap. Upper-primary science at the Mandeville Lakefront and Harbour in St. Tammany Parish: the sun lifts water from the lake as vapour, it cools into clouds and falls as rain, it gathers in rivers, lakes and underground, and a treatment plant cleans it before it ever reaches a tap, using only the model and the jars the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_THE_WATER_CYCLE_FROM_LAKE_TO_TAP = {
  id: "k12-by-the-water-cycle-from-lake-to-tap",
  index: "834",
  domain: "Education",
  trade: "Science class on the lakefront with a water utility operator — learner and water treatment operator",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "The Water Cycle from Lake to Tap",
  title: simTitle("The Water Cycle from Lake to Tap"),
  tagline: "Up as vapour, down as rain, cleaned at the plant — and clear is never the same as safe to drink",
  accent: 0x3fa6c8,
  accentCss: "#3fa6c8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"cycle-tracer","name":"Cycle Tracer","note":"Traced water from the lake to the sky and back, ordered the cleaning steps at a model plant and kept lake water out of the cup"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Cycle Board",
    currency: "DROPS",
    ranks: ["Droplet","Vapour","Cloud","Stream","Operator"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-water-cycle-around-the") },
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
    "drink-the-lake-water": "You went to sip the lake water because it looked clear. Clear water can still carry germs you cannot see. Only water that has been cleaned and tested at a treatment plant is safe to drink, so the jars on the bench are for looking, not tasting.",
    "rain-is-new-water": "You said rain is brand-new water. The same water goes round and round: it rises from lakes and the sea as vapour, falls as rain and flows back again. The water in the lake today has been round the cycle many times before.",
    "clouds-are-smoke": "You said clouds are smoke. Clouds are made of tiny drops of water that formed when vapour cooled high up. That is why clouds can turn into rain, and smoke cannot.",
    "lean-off-the-seawall": "You climbed down the seawall steps to reach the water. Wet steps are slippery and the edge is no place for a class. The operator fills the sample jar with a long pole from the path while everyone stays back."
  },

  lateNotes: {
    "byc-cycle-log": "The drawing is made once the cycle and the plant are explored — nothing to record yet.",
    "byc-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-water-cycle-around-the",
      kind: "find",
      noHint: true,
      targets: [
        "byc-vapour",
        "byc-cloud",
        "byc-stream"
      ],
      itemNames: {
        "byc-vapour": "vapour rising from the warm lake",
        "byc-cloud": "a cloud forming as vapour cools",
        "byc-stream": "a stream running back into the lake"
      },
      itemNotes: {
        "byc-vapour": "The sun lifts water as a gas.",
        "byc-cloud": "Tiny drops gather into a cloud.",
        "byc-stream": "Rain returns to the lake."
      },
      decoyNotes: {
        "byc-sailboat": "It floats on the water but is not part of the cycle."
      },
      title: "Find the water cycle around the lake",
      cue: "Mark the three places on the lakefront model where water is changing or moving in the cycle.",
      why: "The water cycle is happening all around you. Over the lake the sun warms the water and some rises as invisible vapour. High up it cools into clouds. Rain falls and runs back into streams and the lake. Finding each part on the model helps you see the cycle as one big loop, not a list of words."
    },
    {
      id: "put-the-cycle-in-order",
      kind: "sequence",
      targets: [
        "byc-ord-evap",
        "byc-ord-cond",
        "byc-ord-rain",
        "byc-ord-gather"
      ],
      itemNames: {
        "byc-ord-evap": "1 · evaporation from the lake",
        "byc-ord-cond": "2 · condensation into clouds",
        "byc-ord-rain": "3 · rain falls",
        "byc-ord-gather": "4 · water gathers again"
      },
      title: "Put the cycle in order",
      cue: "Evaporation, condensation, rain, then the water gathering in the lake again.",
      why: "The cycle has an order, even though it never really stops. Water evaporates, the vapour condenses into clouds, the clouds release rain, and the rain gathers in streams, lakes and underground. Putting the steps in order shows how each one leads to the next, round and round.",
      outOfOrderNote: "Out of order. Water has to evaporate before it can form a cloud."
    },
    {
      id: "stay-on-the-path-behind-the",
      kind: "select",
      target: "byc-path-card",
      title: "Stay on the path behind the seawall rail",
      cue: "Take your place on the path behind the rail before the operator lowers the sample pole.",
      why: "The seawall edge is slippery and the water beside it can be deep. Standing on the path behind the rail keeps the group safe while you watch the operator take a sample with a long pole. Crews who work by water keep to safe footing the same way on every job."
    },
    {
      id: "turn-the-lamp-to-warm-the",
      kind: "turn",
      target: "byc-lamp-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SUN"
      },
      title: "Turn the lamp to warm the model lake",
      cue: "Turn the lamp dial so the model sun shines on the water in the clear box.",
      why: "In the model, the lamp stands in for the sun. Warming the water gives some of it enough energy to rise as vapour. Watching drops form on the cold lid above shows condensation, and drips falling back show rain. One lamp and one box can show the whole cycle happening in front of you."
    },
    {
      id: "cool-the-lid-to-the-right",
      kind: "gauge",
      target: "byc-cool-meter",
      gauge: {
        label: "COOL",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the line yet. Cool the lid until drops begin to form.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Cool the lid to the right point",
      cue: "Commit when the lid's cooling marker reaches the line where drops start to form.",
      why: "Vapour turns back into drops when it touches something cold. Cooling the lid to the right point shows exactly when condensation starts. The same thing happens high in the sky, where the air is cold, which is why clouds form up there and not down by the lake."
    },
    {
      id: "watch-the-drops-gather-on-the",
      kind: "hold",
      target: "byc-lid-watch",
      seconds: 6,
      title: "Watch the drops gather on the lid",
      cue: "Hold your gaze on the lid until the drops grow big enough to fall.",
      why: "Small drops join together into bigger ones until they are too heavy to hang on. Watching patiently shows the moment a drop falls, which is a tiny model of rain. Seeing it happen in front of you makes the idea stick better than reading it in a book.",
      holdBreakNote: "You looked away before a drop fell. Watch the lid again until one drips."
    },
    {
      id: "carry-the-sample-jar-to-the",
      kind: "drag",
      target: "byc-sample-jar",
      drag: {
        to: "byc-plant-start",
        radius: 0.45,
        missNote: "Not at the plant's intake yet. Carry the jar to where the cleaning begins."
      },
      title: "Carry the sample jar to the plant model",
      cue: "Drag the lake sample jar to the start of the treatment plant model.",
      why: "Before water reaches a tap, it goes to a treatment plant. Carrying the sample to the plant model shows that lake, river or ground water always has a cleaning journey first. That step, not the look of the water, is what makes tap water safe."
    },
    {
      id: "spot-the-cleaning-steps-at-the",
      kind: "find",
      noHint: true,
      targets: [
        "byc-pl-settle",
        "byc-pl-filter",
        "byc-pl-clean"
      ],
      itemNames: {
        "byc-pl-settle": "the settling tank",
        "byc-pl-filter": "the sand and gravel filter",
        "byc-pl-clean": "the disinfection stage"
      },
      itemNotes: {
        "byc-pl-settle": "Heavy bits sink to the bottom.",
        "byc-pl-filter": "Smaller bits are caught here.",
        "byc-pl-clean": "Germs are killed before the water leaves."
      },
      decoyNotes: {
        "byc-pl-office": "Where the logs are kept, but it does not clean water."
      },
      title: "Spot the cleaning steps at the plant",
      cue: "Look at the treatment plant model and mark each step that cleans the water.",
      why: "A treatment plant cleans water in stages. First bits settle out, then the water passes through layers that filter it, then a small safe amount of disinfectant kills germs. Each step does a different job, and together they make water safe. Knowing the steps shows why operators test at every stage."
    },
    {
      id: "say-why-clear-water-needs-cleaning",
      kind: "select",
      target: "byc-reason-card",
      title: "Say why clear water needs cleaning",
      cue: "Choose the reason the operator still cleans water that already looks clear.",
      why: "Germs are far too small to see. Water can look sparkling and still carry them. That is why looks are never enough, and why operators test water with instruments, not eyes. Saying this clearly is the safety idea the whole lesson rests on."
    },
    {
      id: "follow-the-water-through-the-pipes",
      kind: "track",
      target: "byc-pipe-meter",
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
        label: "FLOW",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Follow the water through the pipes to the tap",
      cue: "Keep the marker on the flowing water as it moves from the plant to a model home's tap.",
      why: "After cleaning, water travels through pipes under the streets to homes and schools. Following it all the way shows how far it goes and why the pipes must stay sealed and clean. When you turn on a tap, you are at the end of a long journey that started as rain.",
      holdBreakNote: "The marker left the flow. Find the water again and follow it to the tap."
    },
    {
      id: "draw-the-cycle-and-the-tap",
      kind: "select",
      target: "byc-cycle-log",
      doneLine: "Cycle and tap journey drawn",
      title: "Draw the cycle and the tap journey",
      cue: "Draw the water cycle as a loop and add the plant and the tap as a side path.",
      why: "A drawing shows how the ideas connect: the big loop of the cycle, and the side path people add to clean water for drinking. Labelling each arrow with its word makes the drawing a summary you can use again. Scientists sketch systems like this to explain them simply."
    },
    {
      id: "explain-the-journey-to-the-operator",
      kind: "select",
      target: "byc-share-board",
      doneLine: "Journey explained",
      title: "Explain the journey to the operator",
      cue: "Show your drawing to the operator and explain one step in your own words.",
      why: "The operator works with this journey every day and can tell you if you have it right. Explaining a step in your own words shows you understand it, not just remember it. The operator might add something you did not know, which is how learning keeps going."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byc-checkin",
      doneLine: "Checked in",
      title: "Check in on the lakefront path",
      cue: "What part of the cycle surprised you? What will you think of next time you turn on a tap?",
      why: "The operator ends every sampling round by checking the log with a colleague, so the class ends by checking in together on the path. Each learner names one step of the cycle and one reason water is cleaned. If anyone still thinks clear means safe, the group talks it through before leaving the lakefront."
    }
  ],

  interrupts: [
    {
      id: "a-gust-blows-spray-over-the-path",
      kind: "Wet path",
      after: "watch-the-drops-gather-on-the",
      delay: 3,
      seconds: 12,
      target: "byc-step-back",
      alert: "A gust blows spray from the lake over the rail and wets the path.",
      cue: "Step back to the dry part of the path and tell the teacher it is wet.",
      why: "A wet path next to a rail is slippery. Stepping back and telling the teacher lets the group move somewhere safer. Carrying on at the rail because the lesson is interesting is how small slips happen.",
      missNote: "Nobody stepped back, and the group stayed on the wet, slippery path right beside the rail as the spray kept coming.",
      wrongNote: "That keeps you on the wet path. Step back and tell the teacher. Choose the response that deals with it now."
    },
    {
      id: "the-operator-asks-about-the-jar",
      kind: "Operator question",
      after: "follow-the-water-through-the-pipes",
      delay: 3,
      seconds: 12,
      target: "byc-say-not-drink",
      alert: "The operator holds up the clear lake sample and asks if it is safe to drink.",
      cue: "Say no, it has not been cleaned and tested yet.",
      why: "This is the lesson's safety idea said out loud. Knowing that only treated, tested water is safe to drink protects you anywhere, at a lake, a river or a camp. The operator asks because it matters.",
      missNote: "You said the clear water looked safe to drink, and the operator had to explain germs before the group could go on.",
      wrongNote: "That misses why the water is not safe yet. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x3fa6c8;
    const CSS = "#3fa6c8";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#74766c", base2: "#66685f", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dbe8ec", base2: "#cadbe0", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byc-vapour", "vapour rising from the warm lake", {});
    bead(-1.42, 1.18, -0.62, "byc-cloud", "a cloud forming as vapour cools", {});
    bead(-1.03, 1.46, -0.71, "byc-stream", "a stream running back into the lake", {});
    bead(-1.08, 0.9, -1.11, "byc-sailboat", "a sailboat on the lake", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byc-ord-evap", "1 · evaporation from the lake", {});
    bead(-0.58, 1.46, -1.44, "byc-ord-cond", "2 · condensation into clouds", {});
    bead(-0.24, 0.9, -1.23, "byc-ord-rain", "3 · rain falls", {});
    bead(0, 1.18, -1.55, "byc-ord-gather", "4 · water gathers again", {});
    bead(0.24, 1.46, -1.23, "byc-lid-watch", "Watch the lid", {});
    bead(0.58, 0.9, -1.44, "byc-pl-settle", "the settling tank", {});
    bead(0.68, 1.18, -1.05, "byc-pl-filter", "the sand and gravel filter", {});
    bead(1.08, 1.46, -1.11, "byc-pl-clean", "the disinfection stage", {});
    bead(1.03, 0.9, -0.71, "byc-pl-office", "the operator's office window", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byc-step-back", "Step back from the rail to the dry path", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byc-say-not-drink", "Say the jar water is not for drinking", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byc-path-card", "Stay behind the rail", "PATH\nBEHIND RAIL", { ry: 1.2 });
    dials["byc-lamp-dial"] = dial(-1.89, -1.4, 0.93, "byc-lamp-dial", "Model sun");
    meters["byc-cool-meter"] = meter(-1.45, -1.85, 0.67, "byc-cool-meter", "Lid cooling");
    tokens["byc-sample-jar"] = token(-0.92, -2.16, 0.4, "byc-sample-jar", "Lake sample jar");
    spots["byc-plant-start"] = spot(-0.31, -2.33, 0.13, "byc-plant-start", "The plant's intake");
    card(0.31, 1.35, -2.33, "byc-reason-card", "Give the reason", "CLEAR BUT\nNOT SAFE?", { ry: -0.13 });
    meters["byc-pipe-meter"] = meter(0.92, -2.16, -0.4, "byc-pipe-meter", "Flow followed");
    boards["byc-cycle-log"] = board(1.45, -1.85, -0.67, "byc-cycle-log", "Cycle drawing");
    boards["byc-share-board"] = board(1.89, -1.4, -0.93, "byc-share-board", "Explain to the operator");
    boards["byc-checkin"] = board(2.19, -0.85, -1.2, "byc-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "drink-the-lake-water", "Take a sip of the clear lake water from the jar?", "SIP\nIT?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "rain-is-new-water", "Say rain is brand-new water made in the clouds?", "NEW\nWATER?", 0.3);
    hazardCard(0.58, 0.72, -1.86, "clouds-are-smoke", "Say clouds are made of smoke or steam from chimneys?", "SMOKE?", -0.3);
    hazardCard(1.53, 0.72, -1.21, "lean-off-the-seawall", "Climb onto the seawall steps to fill the jar yourself?", "CLIMB\nDOWN", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Up as vapour, down as rain."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Water treatment operator", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Lakefront grounds crew", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-gust-blows-spray-over-the-path"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-gust-blows-spray-over-the-path"].visible = false;
    arrivals["the-operator-asks-about-the-jar"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-operator-asks-about-the-jar"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "carry-the-sample-jar-to-the") { const s = spots["byc-plant-start"]; tokens["byc-sample-jar"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "draw-the-cycle-and-the-tap") repaint(boards["byc-cycle-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Cycle and tap journey drawn"], "#59c97b"));
        if (step.id === "explain-the-journey-to-the-operator") repaint(boards["byc-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Journey explained"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byc-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-clear-water-needs-cleaning") paintGuide("Cleaned and tested before the tap.");
      },

      onHazard() {
        paintGuide("Stop. Clear is not the same as safe.");
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
        if (it.id === "a-gust-blows-spray-over-the-path") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group moved back to the dry path. The lesson carries on."); }
        if (it.id === "the-operator-asks-about-the-jar") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Not for drinking — explained. The lesson carries on."); }
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
