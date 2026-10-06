import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — How a Levee Holds Water Back. Upper-primary science at the River Levee and Floodwall Crew in Orleans Parish: why a levee is wide at the bottom, why packed clay holds water better than loose sand, and how an inspector's walk keeps the bank strong, using only what the model and the bank in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_HOW_A_LEVEE_HOLDS_WATER_BACK = {
  id: "k12-by-how-a-levee-holds-water-back",
  index: "829",
  domain: "Education",
  trade: "Science class on the levee crest with the levee inspection crew — learner and levee inspector",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "How a Levee Holds Water Back",
  title: simTitle("How a Levee Holds Water Back"),
  tagline: "Wide at the bottom, packed clay inside, grass on top — and a wet spot is flagged, never dug",
  accent: 0x6fae5a,
  accentCss: "#6fae5a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"bank-reader","name":"Bank Reader","note":"Explained why a levee is wide at its base, tested clay against sand in the model tank and flagged a wet spot for the inspector"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Levee Board",
    currency: "FLAGS",
    ranks: ["Walker","Spotter","Tester","Reader","Inspector"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-the-levee") },
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
    "wall-not-a-hill": "You said a levee holds water because it is a thin wall. A levee is a long, low hill of packed earth. Water pushes hardest near the bottom, so the bank is widest there, and its gentle sides spread that push into the ground.",
    "sand-is-just-as-good": "You filled the model with loose sand. Water finds its way through the gaps between sand grains, and it carries grains with it. Packed clay has tiny gaps that hold water back, which is why the crew packs clay into the core of the bank.",
    "dig-at-the-wet-spot": "You started to dig at a wet spot. Digging makes an easy path for water and weakens the bank. The inspector's rule is simple: you mark the spot with a flag, call it in and step back, and the crew decides what to do.",
    "cut-the-grass-cover": "You pulled up the grass cover. The roots knit the top soil together so rain and waves do not wash it off. Bare soil wears away fast, so the crew keeps the grass short and healthy rather than removing it."
  },

  lateNotes: {
    "byl-levee-log": "The levee record is written once the model test is done — nothing to record yet.",
    "byl-checkin": "The check-in comes at the very end of the walk."
  },

  steps: [
    {
      id: "find-the-parts-of-the-levee",
      kind: "find",
      noHint: true,
      targets: [
        "byl-base",
        "byl-core",
        "byl-grass"
      ],
      itemNames: {
        "byl-base": "the wide base at the bottom",
        "byl-core": "the packed clay core",
        "byl-grass": "the grass cover on the slope"
      },
      itemNotes: {
        "byl-base": "Water pushes hardest down low, so the bank is widest here.",
        "byl-core": "Tiny gaps in clay hold water back.",
        "byl-grass": "Roots knit the top soil together."
      },
      decoyNotes: {
        "byl-sign": "Useful for visitors, but it does not hold any water back."
      },
      title: "Find the parts of the levee",
      cue: "Mark the three parts of the levee cut-away model that do the holding.",
      why: "A levee is more than a heap of dirt. The wide base spreads the water's push into the ground, the packed clay core stops water soaking through, and the grass cover holds the top soil in place. Knowing each part is what lets you explain how the whole bank does its job."
    },
    {
      id: "stay-on-the-crest-path-with",
      kind: "select",
      target: "byl-crest-card",
      title: "Stay on the crest path with the inspector",
      cue: "Step onto the crest path beside the inspector before the walk begins.",
      why: "The inspector walks the flat path along the top of the bank, where the footing is firm and the whole slope can be seen at once. Keeping to that path means you never trample the grass cover or slip on a wet slope, and the crew always knows where everyone in the group is standing."
    },
    {
      id: "put-the-model-test-in-order",
      kind: "sequence",
      targets: [
        "byl-ord-pack",
        "byl-ord-fill",
        "byl-ord-wait",
        "byl-ord-dry"
      ],
      itemNames: {
        "byl-ord-pack": "1 · pack the model bank firmly",
        "byl-ord-fill": "2 · fill the tank on the river side",
        "byl-ord-wait": "3 · wait and watch the bank",
        "byl-ord-dry": "4 · check the dry side for water"
      },
      title: "Put the model test in order",
      cue: "Pack the model bank, fill the tank on one side, wait and watch, then look for water on the dry side.",
      why: "A fair model test follows the same order every time. Packing the bank first, then adding water to one side, then waiting before you look, gives the water time to show where it can creep through. Checking the dry side last is how you see whether the bank really held.",
      outOfOrderNote: "Out of order. Pack the model bank before any water goes into the tank."
    },
    {
      id: "watch-the-dry-side-of-the",
      kind: "hold",
      target: "byl-watch-dry",
      seconds: 6,
      title: "Watch the dry side of the model",
      cue: "Hold your eyes on the dry side of the clay bank until the timer bar fills.",
      why: "Water can take a while to soak through a bank, so a quick look can miss it. Watching the dry side steadily lets you see the first dark patch if one appears. Inspectors are patient in the same way, because a slow, small change is the one that matters most to spot early.",
      holdBreakNote: "You looked away and missed the dry side. Watch it again until the bar fills."
    },
    {
      id: "turn-the-tank-tap-to-add",
      kind: "turn",
      target: "byl-tap-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "TAP"
      },
      title: "Turn the tank tap to add water slowly",
      cue: "Turn the tap a little so the water rises slowly beside the model bank.",
      why: "Adding water gently is part of a fair test. A sudden rush splashes over the top and tells you nothing about how the bank holds. A slow rise lets the water press on the bank the way a river rises over a day, so what you see is the bank's real strength."
    },
    {
      id: "stop-the-water-at-the-mark",
      kind: "gauge",
      target: "byl-fill-meter",
      gauge: {
        label: "WATER",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the line. Stop the water right where the teacher's mark is.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Stop the water at the mark on the tank",
      cue: "Commit when the water in the tank reaches the line the teacher drew.",
      why: "Every group stops its water at the same line so the tests can be compared. If one tank is fuller than another, you cannot tell whether the clay or the extra water made the difference. Stopping at the line keeps one thing the same, which is what makes a test fair."
    },
    {
      id: "place-a-flag-at-the-wet",
      kind: "drag",
      target: "byl-flag",
      drag: {
        to: "byl-wet-spot",
        radius: 0.45,
        missNote: "Not on the damp patch yet. Put the flag right where the soil is darker."
      },
      title: "Place a flag at the wet spot",
      cue: "Drag a flag to the damp patch on the model's dry side.",
      why: "When inspectors find a wet spot on a real bank they mark it with a flag so the crew can find it again and watch it. A flag does no harm to the bank, and it tells everyone exactly where to look. Marking and reporting is always the first job, never digging."
    },
    {
      id: "say-why-the-clay-bank-held",
      kind: "select",
      target: "byl-reason-card",
      title: "Say why the clay bank held better",
      cue: "Choose the reason the clay model stayed dry when the sand model did not.",
      why: "The clay and sand models got the same water, the same shape and the same wait. The only change was the soil, so the soil explains the result. Saying that clearly, with the reason that clay has tiny gaps and sand has big ones, is how a scientist turns a result into an idea."
    },
    {
      id: "spot-what-the-inspector-would-flag",
      kind: "find",
      noHint: true,
      targets: [
        "byl-ph-damp",
        "byl-ph-bare",
        "byl-ph-burrow"
      ],
      itemNames: {
        "byl-ph-damp": "a damp patch low on the slope",
        "byl-ph-bare": "a bare strip with no grass",
        "byl-ph-burrow": "a small burrow hole"
      },
      itemNotes: {
        "byl-ph-damp": "Flag it and report it.",
        "byl-ph-bare": "Grass holds the top soil; report the gap.",
        "byl-ph-burrow": "Holes let water in; report it."
      },
      decoyNotes: {
        "byl-ph-mower": "A short, even grass cover is what a healthy bank looks like."
      },
      title: "Spot what the inspector would flag",
      cue: "Look along the bank in the photo board and mark each thing worth reporting.",
      why: "An inspector's walk is a search for small signs: a damp patch low on the slope, a bare strip where grass has gone, a hole an animal has dug. Each can let water in over time. Seeing them early means the crew can fix a small thing before it grows into a big job."
    },
    {
      id: "follow-the-river-level-on-the",
      kind: "track",
      target: "byl-river-meter",
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
        label: "RIVER",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Follow the river level on the gauge post",
      cue: "Keep the marker on the river's level as it rises and falls against the gauge post.",
      why: "The crew watches the river level every day, so they know when to walk the bank more often. The water never sits perfectly still, so you follow the middle of its movement. That habit of steady watching is what lets the crew get ready early and calmly.",
      holdBreakNote: "The marker slipped off the river level. Follow the water back and settle on the middle."
    },
    {
      id: "record-what-you-found",
      kind: "select",
      target: "byl-levee-log",
      doneLine: "Test and flag recorded",
      title: "Record what you found",
      cue: "Write down both models, what happened on the dry side and where you placed the flag.",
      why: "A record lets someone who was not there see what you saw. Writing which soil you used, how long you waited and what the dry side looked like means another class can repeat the test and check it. The crew keeps the same kind of notes after every walk along the bank."
    },
    {
      id: "tell-the-inspector-what-you-flagged",
      kind: "select",
      target: "byl-share-board",
      doneLine: "Flag passed to the inspector",
      title: "Tell the inspector what you flagged",
      cue: "Hand your flag notes to the inspector and say where the wet spot was.",
      why: "A flag is only useful when the right person knows about it. Telling the inspector what you saw and where, in plain words, is how a small sign reaches the crew who can deal with it. That is the same chain every levee walk follows: see it, mark it, tell someone."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byl-checkin",
      doneLine: "Checked in",
      title: "Check in on the crest before you leave",
      cue: "What did the model show you? Which part of the levee would you explain to someone at home?",
      why: "The levee crew ends each walk by talking it through, so the class does the same on the crest path. Each learner names one part of the bank and what it does. If someone is still unsure why the base is wide, this is the moment to go back to the model together before the group heads home."
    }
  ],

  interrupts: [
    {
      id: "a-mower-comes-along-the-crest",
      kind: "Crew vehicle",
      after: "watch-the-dry-side-of-the",
      delay: 3,
      seconds: 12,
      target: "byl-step-aside",
      alert: "A crew mower comes along the crest path towards the group.",
      cue: "Step to the marked side area and wait until the mower has passed.",
      why: "The crest path is also the crew's road. Stepping aside together, where the driver can see everyone, keeps the path clear and safe. The lesson can wait a minute; nobody should be standing in the way of a working machine.",
      missNote: "Nobody stepped aside, and the mower had to stop on the crest path while the group stood in its way.",
      wrongNote: "That keeps you on the path. Step to the marked side area first. Choose the response that deals with it now."
    },
    {
      id: "the-inspector-asks-where-the-flag-is",
      kind: "Inspector question",
      after: "follow-the-river-level-on-the",
      delay: 3,
      seconds: 12,
      target: "byl-point-flag",
      alert: "The inspector asks which part of the slope your flag is on.",
      cue: "Point to the flag and say whether it is high, middle or low on the slope.",
      why: "Where a wet spot sits tells the crew a lot, because a low damp patch means something different from a high one. Saying the place clearly is the report; a flag with no words beside it leaves the crew guessing.",
      missNote: "You pointed vaguely at the bank, and the inspector could not tell which part of the slope the flag was on.",
      wrongNote: "That does not say where the flag is. Point to it and name the part of the slope. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x6fae5a;
    const CSS = "#6fae5a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a7a62", base2: "#6c6c56", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dfe6d8", base2: "#cfd8c6", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byl-base", "the wide base at the bottom", {});
    bead(-1.42, 1.18, -0.62, "byl-core", "the packed clay core", {});
    bead(-1.03, 1.46, -0.71, "byl-grass", "the grass cover on the slope", {});
    bead(-1.08, 0.9, -1.11, "byl-sign", "the crew's sign at the gate", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byl-ord-pack", "1 · pack the model bank firmly", {});
    bead(-0.58, 1.46, -1.44, "byl-ord-fill", "2 · fill the tank on the river side", {});
    bead(-0.24, 0.9, -1.23, "byl-ord-wait", "3 · wait and watch the bank", {});
    bead(0, 1.18, -1.55, "byl-ord-dry", "4 · check the dry side for water", {});
    bead(0.24, 1.46, -1.23, "byl-watch-dry", "Watch the dry side", {});
    bead(0.58, 0.9, -1.44, "byl-ph-damp", "a damp patch low on the slope", {});
    bead(0.68, 1.18, -1.05, "byl-ph-bare", "a bare strip with no grass", {});
    bead(1.08, 1.46, -1.11, "byl-ph-burrow", "a small burrow hole", {});
    bead(1.03, 0.9, -0.71, "byl-ph-mower", "a mowed, even slope", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byl-step-aside", "Step to the side and let the mower pass", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byl-point-flag", "Point to the flag and say where it is", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byl-crest-card", "Stand on the crest path", "CREST\nPATH", { ry: 1.2 });
    dials["byl-tap-dial"] = dial(-1.89, -1.4, 0.93, "byl-tap-dial", "Tank tap");
    meters["byl-fill-meter"] = meter(-1.45, -1.85, 0.67, "byl-fill-meter", "Water level");
    tokens["byl-flag"] = token(-0.92, -2.16, 0.4, "byl-flag", "Marker flag");
    spots["byl-wet-spot"] = spot(-0.31, -2.33, 0.13, "byl-wet-spot", "The damp patch");
    card(0.31, 1.35, -2.33, "byl-reason-card", "Give the reason", "WHY DID IT\nHOLD?", { ry: -0.13 });
    meters["byl-river-meter"] = meter(0.92, -2.16, -0.4, "byl-river-meter", "River level followed");
    boards["byl-levee-log"] = board(1.45, -1.85, -0.67, "byl-levee-log", "Levee test record");
    boards["byl-share-board"] = board(1.89, -1.4, -0.93, "byl-share-board", "Tell the inspector");
    boards["byl-checkin"] = board(2.19, -0.85, -1.2, "byl-checkin", "End-of-walk check-in");
    hazardCard(-1.53, 0.72, -1.21, "wall-not-a-hill", "Say a levee works because it is a high, thin wall?", "THIN\nWALL?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "sand-is-just-as-good", "Fill the model levee with loose sand?", "LOOSE\nSAND", 0.3);
    hazardCard(0.58, 0.72, -1.86, "dig-at-the-wet-spot", "Dig into the wet spot to see what is inside?", "DIG\nIN", -0.3);
    hazardCard(1.53, 0.72, -1.21, "cut-the-grass-cover", "Pull up the grass so you can see the soil better?", "PULL\nGRASS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Wide base, clay core, grass on top."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Levee inspector", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Crew mower driver", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-mower-comes-along-the-crest"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-mower-comes-along-the-crest"].visible = false;
    arrivals["the-inspector-asks-where-the-flag-is"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-inspector-asks-where-the-flag-is"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-a-flag-at-the-wet") { const s = spots["byl-wet-spot"]; tokens["byl-flag"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-what-you-found") repaint(boards["byl-levee-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Test and flag recorded"], "#59c97b"));
        if (step.id === "tell-the-inspector-what-you-flagged") repaint(boards["byl-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Flag passed to the inspector"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byl-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-the-clay-bank-held") paintGuide("Clay held; sand let water through.");
      },

      onHazard() {
        paintGuide("Stop. Flag it and tell someone — never dig.");
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
        if (it.id === "a-mower-comes-along-the-crest") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group stepped aside, the mower passed. The lesson carries on."); }
        if (it.id === "the-inspector-asks-where-the-flag-is") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Flag located on the slope. The lesson carries on."); }
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
