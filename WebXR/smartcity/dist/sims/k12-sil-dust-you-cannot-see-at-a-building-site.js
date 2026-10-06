import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Dust You Cannot See at a Building Site. Lower-secondary science at a building site (the Tank Foundation Pour site on the Lake Charles map): why drilling concrete makes dust too fine to see, how builders keep it out of the air with a vacuum shroud and water, and why standing where the breeze comes from matters, using only what the scene shows and OSHA's public description of its silica rule for construction. The awareness version of the Concrete Drilling & Silica Dust Cues station.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_SIL_DUST_YOU_CANNOT_SEE_AT_A_BUILDING_SITE = {
  id: "k12-sil-dust-you-cannot-see-at-a-building-site",
  index: "971",
  domain: "Education",
  trade: "Science visit with a concrete drilling crew at a building site — learner and crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Dust You Cannot See at a Building Site",
  title: simTitle("Dust You Cannot See at a Building Site"),
  tagline: "Drilling concrete makes dust finer than you can see — find out how builders catch it before anyone breathes it",
  accent: 0xd9a441,
  accentCss: "#d9a441",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"dust-catcher","name":"Dust Catcher","note":"Compared a model drill with and without its dust shroud, followed the breeze and explained how builders keep fine dust out of the air"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Dust Board",
    currency: "CLEAR AIR",
    ranks: ["Speck","Puff","Breeze","Clear Air","Dust Catcher"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-tools-that-catch-the") },
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
    "blow-the-dust-away": "You went to blow the dust off the card. Blowing lifts the finest dust into the air, where people breathe it. Builders use a special vacuum to pick dust up instead, and the class does the same with the little vacuum.",
    "walk-under-the-drill": "You started toward the crew's real drill. The crew is working, and visitors watch from behind the rope with the crew lead. Everything the class needs to see is on the model bench.",
    "dust-is-just-dirt": "You said concrete dust is just dirt. Concrete has sand and stone in it, and drilling grinds some of that into dust finer than you can see. That fine dust is why builders catch it at the drill instead of letting it float around.",
    "sweep-the-floor-dry": "You picked up a dry brush to sweep the bench. A dry brush throws fine dust back into the air. Builders use a vacuum or a damp cloth, so the dust ends up in the bag and not in anyone's breath."
  },

  lateNotes: {
    "sld-plan-log": "The dust plan record is written after both drill runs — nothing to record yet.",
    "sld-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-tools-that-catch-the",
      kind: "find",
      noHint: true,
      targets: [
        "sld-shroud",
        "sld-water",
        "sld-hepa"
      ],
      itemNames: {
        "sld-shroud": "the shroud around the drill bit",
        "sld-water": "the water line on the core drill",
        "sld-hepa": "the dust-catching vacuum"
      },
      itemNotes: {
        "sld-shroud": "It pulls dust into the vacuum hose.",
        "sld-water": "It turns the dust into wet mud.",
        "sld-hepa": "Its filter keeps the finest dust inside."
      },
      decoyNotes: {
        "sld-radio": "Useful for talking, but it catches no dust."
      },
      title: "Find the tools that catch the dust",
      cue: "Mark the three things the crew uses to keep drilling dust out of the air.",
      why: "A crew drilling concrete has more than one way to catch dust. A shroud around the drill bit pulls dust into a vacuum hose, a water line keeps a bigger drill wet so the dust turns to mud, and a special vacuum cleans the holes afterwards. Each one stops dust before it reaches the air people breathe."
    },
    {
      id: "put-the-dust-test-in-order",
      kind: "sequence",
      targets: [
        "sld-ord-card",
        "sld-ord-bare",
        "sld-ord-look",
        "sld-ord-shroud"
      ],
      itemNames: {
        "sld-ord-card": "1 · lay a clean dark card beside the block",
        "sld-ord-bare": "2 · drill the model block without the shroud",
        "sld-ord-look": "3 · look at the dust on the card",
        "sld-ord-shroud": "4 · lay a fresh card and drill with the shroud on"
      },
      title: "Put the dust test in order",
      cue: "Lay a clean dark card, drill the model without the shroud, look at the card, then a fresh card and drill with the shroud on.",
      why: "A fair test changes only one thing. A clean dark card each time shows exactly how much dust landed. Drilling once without the shroud and once with it, on the same model block for the same time, shows what the shroud catches, because the shroud is the only change. Without the clean card, old dust would mix into the new reading.",
      outOfOrderNote: "Out of order. Start with a clean dark card beside the model block."
    },
    {
      id: "stand-behind-the-rope-with-the",
      kind: "select",
      target: "sld-rope-card",
      title: "Stand behind the rope with the crew lead",
      cue: "Stand behind the rope at the edge of the work area with the crew lead.",
      why: "A building site is busy, with tools running and people carrying heavy things. Standing behind the rope keeps the class clear of the crew's work and out of their way. The crew lead watches the site so the class can watch the lesson. Watching from the rope also gives the best view of the whole site at once."
    },
    {
      id: "set-the-drill-timer-and-leave",
      kind: "turn",
      target: "sld-timer-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "TIME"
      },
      title: "Set the drill timer and leave it",
      cue: "Turn the timer dial to the teacher's setting for both runs.",
      why: "Both runs must last the same time, or the test is not fair. A longer run would leave more dust on the card whatever else happened. Setting the timer once for both runs keeps the time the same, so only the shroud changes. Scientists call this keeping everything else the same."
    },
    {
      id: "read-the-dust-on-the-card",
      kind: "gauge",
      target: "sld-dust-meter",
      gauge: {
        label: "DUST",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not matched yet. Slide the marker to the grey that looks like the card.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the dust on the card",
      cue: "Commit when the marker matches the card's colour on the grey scale.",
      why: "Matching the card against a grey scale turns what you see into a reading you can compare. A grey card means more dust landed, and a dark clean card means less. Real dust monitors on building sites do the same job much more precisely, and they can measure dust far too fine to see."
    },
    {
      id: "hold-the-model-drill-square-to",
      kind: "hold",
      target: "sld-drill-hold",
      seconds: 6,
      title: "Hold the model drill square to the block",
      cue: "Hold the model drill flat against the block until the timer ends.",
      why: "The shroud only catches dust when it sits flat on the surface. If the drill tips, a gap opens and dust escapes past the shroud. Holding it square is the same skill the real crew uses, and it is what makes the test honest. A steady hand matters more than a fast one here.",
      holdBreakNote: "The drill tipped and the shroud lifted. Hold it flat again until the timer ends."
    },
    {
      id: "move-the-bench-to-where-the",
      kind: "drag",
      target: "sld-bench",
      drag: {
        to: "sld-breeze-side",
        radius: 0.45,
        missNote: "That side puts the dust in the breeze's path toward you. Move to where the breeze comes from."
      },
      title: "Move the bench to where the breeze comes from",
      cue: "Drag the model bench to the side of the work area the breeze blows from.",
      why: "No dust catcher is perfect, and the breeze carries whatever escapes. Working on the side the breeze comes from sends that little bit of dust away from you instead of into your face. Builders choose where to stand for the same reason. Watching the flag or a strip of tape on a fence shows which way the breeze is blowing."
    },
    {
      id: "spot-how-the-crew-protects-their",
      kind: "find",
      noHint: true,
      targets: [
        "sld-mask",
        "sld-vac",
        "sld-plan"
      ],
      itemNames: {
        "sld-mask": "a fitted dust mask on the shelf",
        "sld-vac": "a vacuum cleaning the floor",
        "sld-plan": "the dust plan on the board"
      },
      itemNotes: {
        "sld-mask": "Worn when the plan asks for it.",
        "sld-vac": "No dry sweeping on a dusty floor.",
        "sld-plan": "It says which tool gets which dust catcher."
      },
      decoyNotes: {
        "sld-cone": "It marks the edge of the work, but it does not catch dust."
      },
      title: "Spot how the crew protects their breathing",
      cue: "Look across the site and mark each thing the crew does for clean air.",
      why: "The national rule for silica dust on building sites asks builders to catch dust at many tools with water or a vacuum, and to clean up without dry sweeping or blowing. When a job still makes dust, the crew's written plan can ask for a fitted mask too. Each of these keeps the air clean where people work, and the plan on the board says which one goes with which tool."
    },
    {
      id: "say-what-your-cards-showed",
      kind: "select",
      target: "sld-result-card",
      title: "Say what your cards showed",
      cue: "Choose the sentence that says what the two runs showed.",
      why: "Both runs lasted the same time on the same block with clean cards. The card from the run without the shroud came out greyer, and the card from the run with the shroud stayed darker. A good answer says the shroud caught much of the dust, and it does not claim more than the two cards showed."
    },
    {
      id: "follow-the-dust-puff-on-the",
      kind: "track",
      target: "sld-puff-track",
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
        label: "BREEZE",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Follow the dust puff on the breeze",
      cue: "Keep the marker on the dust puff as the breeze carries it across the site.",
      why: "Dust does not stay where it is made. A breeze carries it across the site to people who are not even drilling. Following the puff shows why one crew's dust is everyone's business, and why builders catch it at the drill instead of hoping it blows away.",
      holdBreakNote: "The marker lost the puff. Find it again and follow it with the breeze."
    },
    {
      id: "record-the-crews-dust-plan-in",
      kind: "select",
      target: "sld-plan-log",
      doneLine: "Plan recorded",
      title: "Record the crew's dust plan in your own words",
      cue: "Write the ways the crew keeps dust out of the air, and name where you learned them.",
      why: "Writing the plan in your own words shows you understood it, and naming the source shows where it came from. A careful scientist or reporter always says where a fact came from, so someone else can check it. Your record can list the shroud, the water, the vacuum and the place to stand, each in one short line."
    },
    {
      id: "share-one-way-to-keep-dust",
      kind: "select",
      target: "sld-share-board",
      doneLine: "Way shared",
      title: "Share one way to keep dust out of the air",
      cue: "Tell another group one way builders stop drilling dust from reaching people.",
      why: "Workers, neighbours and visitors all share the air around a building site. Sharing ways to catch dust helps the class see that small habits, like using a vacuum instead of a brush, keep the air clean for everyone. Hearing another group's way often reminds you of one you forgot."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "sld-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the site",
      cue: "How does the crew catch drilling dust? Why does it matter where you stand?",
      why: "The crew talks over each visit before the class leaves the site. Each learner names a way to catch dust and says why the breeze matters. If anyone thinks the dust is just dirt, the group sorts it out now. Then everyone leaves knowing the same few habits."
    }
  ],

  interrupts: [
    {
      id: "the-vacuum-hose-slips-off",
      kind: "Hose off",
      after: "hold-the-model-drill-square-to",
      delay: 3,
      seconds: 12,
      target: "sld-stop-drill",
      alert: "The little vacuum hose slips off the model drill's shroud and a puff of dust appears.",
      cue: "Stop the model drill first, then fix the hose.",
      why: "When the hose comes off, the shroud stops catching dust. Stopping the drill stops the dust right away, and then the hose goes back on. The real crew does exactly the same when their hose slips.",
      missNote: "The model drill kept running while the hose hung loose, and a little cloud settled on the bench.",
      wrongNote: "That leaves the drill running. Stop the drill first. Choose the response that deals with it now."
    },
    {
      id: "dust-drifts-from-another-crew",
      kind: "Drifting dust",
      after: "follow-the-dust-puff-on-the",
      delay: 3,
      seconds: 12,
      target: "sld-step-aside",
      alert: "Dust from another crew's work drifts toward the class on the breeze.",
      cue: "Step aside out of the dust's path with the crew lead, who asks the other crew to stop.",
      why: "Dust from someone else's tool is still dust to breathe. Stepping out of its path is the quick fix, and asking the other crew to catch their dust fixes the cause. Speaking up about dust is part of working safely together.",
      missNote: "The class stayed in the dust's path until the crew lead moved everyone aside.",
      wrongNote: "That stays in the dust's path. Step aside first. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0xd9a441;
    const CSS = "#d9a441";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#8f8a80", base2: "#7f7a70", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e6e0d2", base2: "#d6d0c2", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "sld-shroud", "the shroud around the drill bit", {});
    bead(-1.42, 1.18, -0.62, "sld-water", "the water line on the core drill", {});
    bead(-1.03, 1.46, -0.71, "sld-hepa", "the dust-catching vacuum", {});
    bead(-1.08, 0.9, -1.11, "sld-radio", "the crew's radio", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "sld-ord-card", "1 · lay a clean dark card beside the block", {});
    bead(-0.58, 1.46, -1.44, "sld-ord-bare", "2 · drill the model block without the shroud", {});
    bead(-0.24, 0.9, -1.23, "sld-ord-look", "3 · look at the dust on the card", {});
    bead(0, 1.18, -1.55, "sld-ord-shroud", "4 · lay a fresh card and drill with the shroud on", {});
    bead(0.24, 1.46, -1.23, "sld-drill-hold", "Hold the model drill", {});
    bead(0.58, 0.9, -1.44, "sld-mask", "a fitted dust mask on the shelf", {});
    bead(0.68, 1.18, -1.05, "sld-vac", "a vacuum cleaning the floor", {});
    bead(1.08, 1.46, -1.11, "sld-plan", "the dust plan on the board", {});
    bead(1.03, 0.9, -0.71, "sld-cone", "an orange cone", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "sld-stop-drill", "Stop the model drill", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "sld-step-aside", "Step out of the dust's path", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "sld-rope-card", "Behind the rope", "BEHIND\nTHE ROPE", { ry: 1.2 });
    dials["sld-timer-dial"] = dial(-1.89, -1.4, 0.93, "sld-timer-dial", "Drill timer");
    meters["sld-dust-meter"] = meter(-1.45, -1.85, 0.67, "sld-dust-meter", "Card reading");
    tokens["sld-bench"] = token(-0.92, -2.16, 0.4, "sld-bench", "Model bench");
    spots["sld-breeze-side"] = spot(-0.31, -2.33, 0.13, "sld-breeze-side", "Where the breeze comes from");
    card(0.31, 1.35, -2.33, "sld-result-card", "State the result", "WHICH CARD\nWAS CLEANER?", { ry: -0.13 });
    meters["sld-puff-track"] = meter(0.92, -2.16, -0.4, "sld-puff-track", "Puff followed");
    boards["sld-plan-log"] = board(1.45, -1.85, -0.67, "sld-plan-log", "Dust plan record");
    boards["sld-share-board"] = board(1.89, -1.4, -0.93, "sld-share-board", "Share a way");
    boards["sld-checkin"] = board(2.19, -0.85, -1.2, "sld-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "blow-the-dust-away", "Blow the dust off the card to clean it?", "BLOW\nIT?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "walk-under-the-drill", "Step up to the crew's drill for a closer look?", "CLOSER?", 0.3);
    hazardCard(0.58, 0.72, -1.86, "dust-is-just-dirt", "Say concrete dust is just dirt and nothing more?", "JUST\nDIRT?", -0.3);
    hazardCard(1.53, 0.72, -1.21, "sweep-the-floor-dry", "Sweep the dusty bench with a dry brush?", "DRY\nBRUSH?", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Same time, clean card each run."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Drilling crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Laborer", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-vacuum-hose-slips-off"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-vacuum-hose-slips-off"].visible = false;
    arrivals["dust-drifts-from-another-crew"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["dust-drifts-from-another-crew"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-bench-to-where-the") { const s = spots["sld-breeze-side"]; tokens["sld-bench"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-crews-dust-plan-in") repaint(boards["sld-plan-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Plan recorded"], "#59c97b"));
        if (step.id === "share-one-way-to-keep-dust") repaint(boards["sld-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Way shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["sld-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-your-cards-showed") paintGuide("Catch dust at the drill.");
      },

      onHazard() {
        paintGuide("Stop. Behind the rope.");
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
        if (it.id === "the-vacuum-hose-slips-off") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Drill stopped and the hose back on. The lesson carries on."); }
        if (it.id === "dust-drifts-from-another-crew") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Class out of the dust's path, the other crew stopped. The lesson carries on."); }
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
