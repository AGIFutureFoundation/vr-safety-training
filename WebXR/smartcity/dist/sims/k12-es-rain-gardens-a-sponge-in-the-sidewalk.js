import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Rain Gardens: a Sponge in the Sidewalk. Upper-primary science at the Mission District School Campus in San Francisco: how a rain garden holds storm water and lets it soak into the ground, tested with soil columns and seen in the crew's garden beside the sidewalk, using only what the columns and the garden in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_RAIN_GARDENS_A_SPONGE_IN_THE_SIDEWALK = {
  id: "k12-es-rain-gardens-a-sponge-in-the-sidewalk",
  index: "873",
  domain: "Education",
  trade: "Science class with the green infrastructure crew at a school rain garden — learner and landscape crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Rain Gardens: a Sponge in the Sidewalk",
  title: simTitle("Rain Gardens: a Sponge in the Sidewalk"),
  tagline: "Loose soil and plants soak up the rain that a hard sidewalk sends away — test it, then help the crew plant",
  accent: 0x6a9a4a,
  accentCss: "#6a9a4a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"sponge-builder","name":"Sponge Builder","note":"Compared how fast water soaks through garden soil and packed ground, explained what a rain garden does and helped the crew plant one"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Garden Board",
    currency: "SOAKS",
    ranks: ["Seed","Shoot","Leaf","Bloom","Garden Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-the-rain") },
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
    "rain-garden-is-a-pond": "You said a rain garden stays full like a pond. A rain garden holds the water for a short while and lets it soak down into the soil. A day or so after the rain it is dry again and ready for the next storm.",
    "dig-without-the-locate": "You picked up a spade before the crew checked for pipes and cables. Under a sidewalk there can be water pipes and power lines. The crew has them marked with paint and flags before anyone digs, every time.",
    "stand-on-the-edge": "You stood right on the edge of the dug bed. Fresh soil edges can crumble. Stand back on the path and let the crew work in the bed.",
    "trample-the-plants": "You walked through the rain garden. Feet press the soil hard, and hard soil cannot soak up rain. Use the path around the garden so the soil stays loose like a sponge."
  },

  lateNotes: {
    "esr-soak-log": "The soak record is written once both columns have drained — nothing to record yet.",
    "esr-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-the-parts-of-the-rain",
      kind: "find",
      noHint: true,
      targets: [
        "esr-kerb-cut",
        "esr-soil",
        "esr-roots"
      ],
      itemNames: {
        "esr-kerb-cut": "the gap in the kerb",
        "esr-soil": "the loose garden soil",
        "esr-roots": "the deep plant roots"
      },
      itemNotes: {
        "esr-kerb-cut": "Street water flows in here.",
        "esr-soil": "It soaks up water like a sponge.",
        "esr-roots": "Roots keep the soil open."
      },
      decoyNotes: {
        "esr-bike-rack": "Handy for bikes, but not part of the garden."
      },
      title: "Find the parts of the rain garden",
      cue: "Mark the three parts that help the garden soak up rain.",
      why: "A rain garden is a shallow dip beside a sidewalk or roof. A gap in the kerb lets street water flow in, loose soil soaks it up like a sponge, and deep plant roots keep the soil open so water can keep moving down. Together they turn runoff into water that soaks into the ground instead of racing to a drain."
    },
    {
      id: "put-the-soil-test-in-order",
      kind: "sequence",
      targets: [
        "esr-ord-fill",
        "esr-ord-pour",
        "esr-ord-time",
        "esr-ord-compare"
      ],
      itemNames: {
        "esr-ord-fill": "1 · fill one column with packed ground and one with garden soil",
        "esr-ord-pour": "2 · pour the same cup of water on each",
        "esr-ord-time": "3 · time how long each takes to soak in",
        "esr-ord-compare": "4 · compare the two times"
      },
      title: "Put the soil test in order",
      cue: "Fill both columns, pour the same water on each, time it, then compare.",
      why: "A fair test uses the same amount of water on each column. One column holds packed ground like a path, the other holds loose garden soil. Pouring the same water and timing each one means the soil is the only difference, so the timing tells you which one soaks water faster.",
      outOfOrderNote: "Out of order. Fill both columns first, then pour the same water on each."
    },
    {
      id: "wait-for-the-crews-paint-marks",
      kind: "select",
      target: "esr-locate-card",
      title: "Wait for the crew's paint marks",
      cue: "Point to the paint marks and flags that show where pipes run before anyone digs.",
      why: "Before any digging, a locate crew marks pipes and cables under the ground with coloured paint and small flags. The garden crew digs only once those marks are there and plans the bed around them. Waiting for the marks is a habit every digging crew keeps, because what is underground cannot be seen from above."
    },
    {
      id: "set-the-cup-to-the-same",
      kind: "turn",
      target: "esr-cup-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "CUP"
      },
      title: "Set the cup to the same mark",
      cue: "Turn the dial until the measuring cup fills to the teacher's mark.",
      why: "Each column must get exactly the same amount of water, or the comparison is not fair. Filling the cup to one mark and using it for both pours controls the amount. Keeping that one thing the same is what lets you trust the result you get."
    },
    {
      id: "read-the-timer-when-the-water",
      kind: "gauge",
      target: "esr-soak-meter",
      gauge: {
        label: "SOAK",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the moment the water was gone. Read when the top is dry.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the timer when the water is gone",
      cue: "Commit when the timer marker sits where the last water soaked in.",
      why: "You stop the timer when no water is left sitting on top of the soil. Reading it at that moment for both columns makes the comparison honest. The loose soil usually wins by a long way, which is exactly the job a rain garden does in a storm."
    },
    {
      id: "hold-the-column-upright-while-it",
      kind: "hold",
      target: "esr-column-hold",
      seconds: 6,
      title: "Hold the column upright while it drains",
      cue: "Hold the soil column straight until the water stops dripping out.",
      why: "If the column tips, water runs down the side instead of through the soil, and the test goes wrong. Holding it straight lets the water move through the soil the way rain moves through a garden bed. Careful handling keeps the result about the soil, not about the spill.",
      holdBreakNote: "The column tipped before it finished draining. Hold it straight again."
    },
    {
      id: "place-a-plant-in-the-garden",
      kind: "drag",
      target: "esr-plant",
      drag: {
        to: "esr-bed-spot",
        radius: 0.45,
        missNote: "Not on the marked spot yet. Check the crew's plan and place it there."
      },
      title: "Place a plant in the garden bed",
      cue: "Drag the young plant to the marked spot in the bed.",
      why: "Plants go where the crew's plan shows. Thirsty plants sit in the low middle where water gathers, and plants that like it drier sit on the sides. Putting each one in the right place keeps the garden healthy, so its roots keep the soil loose for years."
    },
    {
      id: "spot-how-the-crew-works-safely",
      kind: "find",
      noHint: true,
      targets: [
        "esr-paint",
        "esr-fence",
        "esr-gloves"
      ],
      itemNames: {
        "esr-paint": "paint marks left in place",
        "esr-fence": "a fence around the dug bed",
        "esr-gloves": "gloves and boots on the crew"
      },
      itemNotes: {
        "esr-paint": "Everyone can see where pipes run.",
        "esr-fence": "Walkers stay clear of the edge.",
        "esr-gloves": "Hands and feet stay protected."
      },
      decoyNotes: {
        "esr-mural": "Bright and cheerful, but not a safety habit."
      },
      title: "Spot how the crew works safely",
      cue: "Watch the crew at the garden bed and mark each safe habit.",
      why: "Building a rain garden means digging near a sidewalk, so the crew keeps people and pipes safe. They leave the paint marks in place, fence off the dug bed, and wear gloves and boots when they handle soil. Each habit is part of doing the job well, not an extra."
    },
    {
      id: "say-what-the-soil-test-showed",
      kind: "select",
      target: "esr-result-card",
      title: "Say what the soil test showed",
      cue: "Choose the sentence that says what your two columns showed.",
      why: "Both columns got the same water. The loose garden soil soaked it up faster than the packed ground. A good answer says just that and connects it to the garden: loose soil and roots let rain soak in, so less water rushes to the storm drain."
    },
    {
      id: "follow-the-water-from-the-kerb",
      kind: "track",
      target: "esr-flow-track",
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
      title: "Follow the water from the kerb to the soil",
      cue: "Keep the marker on the water as it flows through the kerb gap and spreads.",
      why: "Watching the water arrive shows the garden working. It runs along the gutter, turns in at the kerb gap, spreads across the bed and slowly sinks. Seeing it disappear into the soil is the best way to understand why people call a rain garden a sponge.",
      holdBreakNote: "The marker lost the water. Find it at the kerb gap and follow it again."
    },
    {
      id: "record-both-soak-times",
      kind: "select",
      target: "esr-soak-log",
      doneLine: "Both times recorded",
      title: "Record both soak times",
      cue: "Write the soak time for packed ground and for garden soil in a table.",
      why: "A table with the two times side by side makes the difference plain to anyone who reads it. It also lets another class repeat your test and compare. The crew keeps records too, noting how quickly the garden is dry after rain, to know the soil is still working."
    },
    {
      id: "share-where-a-rain-garden-could",
      kind: "select",
      target: "esr-share-board",
      doneLine: "Spot shared",
      title: "Share where a rain garden could go",
      cue: "Show another group one place near school where rain runs off and a garden could help.",
      why: "Rain gardens work best where lots of water runs off hard ground, like the edge of a car park or below a roof pipe. Sharing ideas helps the class see how many places could soak up rain. Planners look for spots the same way when they choose where gardens go."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esr-checkin",
      doneLine: "Checked in",
      title: "Check in before the crew packs up",
      cue: "What does a rain garden do with the rain? Why must the soil stay loose?",
      why: "The crew looks over the garden before it leaves, and the class checks its ideas the same way. Each learner says what the garden does with rain and why feet stay on the path. If anyone thinks a rain garden stays full like a pond, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "a-wheelbarrow-comes-down-the-path",
      kind: "Wheelbarrow",
      after: "hold-the-column-upright-while-it",
      delay: 3,
      seconds: 12,
      target: "esr-make-way",
      alert: "A crew member pushes a full wheelbarrow of soil down the path.",
      cue: "Step to the side of the path and let the wheelbarrow pass.",
      why: "A heavy wheelbarrow is hard to stop quickly. Stepping aside gives the crew member a clear path and keeps toes safe. The crew calls out before moving loads, and everyone makes way.",
      missNote: "The class blocked the path, and the crew member had to set the wheelbarrow down and wait.",
      wrongNote: "That leaves you in the wheelbarrow's way. Step to the side. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-the-marks",
      kind: "Crew question",
      after: "follow-the-water-from-the-kerb",
      delay: 3,
      seconds: 12,
      target: "esr-name-marks",
      alert: "The crew lead points at the paint on the sidewalk and asks what it is for.",
      cue: "Say the marks show where pipes and cables run under the ground.",
      why: "Knowing what the marks mean shows you understand why digging waits. The paint colours tell the crew what kind of line is below. Nobody digs near a line without planning around it.",
      missNote: "You could not say what the marks were for, and the crew lead had to explain before the class could go on.",
      wrongNote: "That does not explain the marks. Say what is under the ground. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x6a9a4a;
    const CSS = "#6a9a4a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6a6250", base2: "#5c5544", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e4e8d6", base2: "#d2dac0", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "esr-kerb-cut", "the gap in the kerb", {});
    bead(-1.42, 1.18, -0.62, "esr-soil", "the loose garden soil", {});
    bead(-1.03, 1.46, -0.71, "esr-roots", "the deep plant roots", {});
    bead(-1.08, 0.9, -1.11, "esr-bike-rack", "the bike rack by the gate", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esr-ord-fill", "1 · fill one column with packed ground and one with garden soil", {});
    bead(-0.58, 1.46, -1.44, "esr-ord-pour", "2 · pour the same cup of water on each", {});
    bead(-0.24, 0.9, -1.23, "esr-ord-time", "3 · time how long each takes to soak in", {});
    bead(0, 1.18, -1.55, "esr-ord-compare", "4 · compare the two times", {});
    bead(0.24, 1.46, -1.23, "esr-column-hold", "Hold the column", {});
    bead(0.58, 0.9, -1.44, "esr-paint", "paint marks left in place", {});
    bead(0.68, 1.18, -1.05, "esr-fence", "a fence around the dug bed", {});
    bead(1.08, 1.46, -1.11, "esr-gloves", "gloves and boots on the crew", {});
    bead(1.03, 0.9, -0.71, "esr-mural", "a mural on the school wall", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esr-make-way", "Step aside and make way", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esr-name-marks", "Say what the paint marks show", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esr-locate-card", "Marks checked", "MARKS\nFIRST", { ry: 1.2 });
    dials["esr-cup-dial"] = dial(-1.89, -1.4, 0.93, "esr-cup-dial", "Cup level");
    meters["esr-soak-meter"] = meter(-1.45, -1.85, 0.67, "esr-soak-meter", "Soak time");
    tokens["esr-plant"] = token(-0.92, -2.16, 0.4, "esr-plant", "Young plant");
    spots["esr-bed-spot"] = spot(-0.31, -2.33, 0.13, "esr-bed-spot", "The marked spot");
    card(0.31, 1.35, -2.33, "esr-result-card", "State the result", "WHICH\nSOAKED?", { ry: -0.13 });
    meters["esr-flow-track"] = meter(0.92, -2.16, -0.4, "esr-flow-track", "Water followed");
    boards["esr-soak-log"] = board(1.45, -1.85, -0.67, "esr-soak-log", "Soak record");
    boards["esr-share-board"] = board(1.89, -1.4, -0.93, "esr-share-board", "Share a spot");
    boards["esr-checkin"] = board(2.19, -0.85, -1.2, "esr-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "rain-garden-is-a-pond", "Say a rain garden is a pond that stays full?", "A\nPOND?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "dig-without-the-locate", "Start digging before the crew checks for pipes?", "DIG\nNOW", 0.3);
    hazardCard(0.58, 0.72, -1.86, "stand-on-the-edge", "Stand on the edge of the dug garden bed?", "ON THE\nEDGE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "trample-the-plants", "Walk through the garden to reach the other side?", "WALK\nTHROUGH", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Same water on both columns."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Landscape crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Crew member with wheelbarrow", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-wheelbarrow-comes-down-the-path"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-wheelbarrow-comes-down-the-path"].visible = false;
    arrivals["the-crew-lead-asks-about-the-marks"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-the-marks"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-a-plant-in-the-garden") { const s = spots["esr-bed-spot"]; tokens["esr-plant"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-both-soak-times") repaint(boards["esr-soak-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Both times recorded"], "#59c97b"));
        if (step.id === "share-where-a-rain-garden-could") repaint(boards["esr-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Spot shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esr-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-the-soil-test-showed") paintGuide("Loose soil soaks it up.");
      },

      onHazard() {
        paintGuide("Stop. Marks first, feet on the path.");
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
        if (it.id === "a-wheelbarrow-comes-down-the-path") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Path clear, the soil delivered. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-the-marks") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Marks explained. The lesson carries on."); }
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
