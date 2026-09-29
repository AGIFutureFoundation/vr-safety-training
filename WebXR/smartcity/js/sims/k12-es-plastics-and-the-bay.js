import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Plastics and the Bay. Upper-primary science at the Ocean Beach Lifeguard Station site in San Francisco: how plastic breaks into smaller and smaller pieces but does not go away, which pieces float and which sink, tested with a float tray and seen on a careful shoreline sweep with the beach crew, using only what the tray and the beach in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_PLASTICS_AND_THE_BAY = {
  id: "k12-es-plastics-and-the-bay",
  index: "881",
  domain: "Education",
  trade: "Science class with the beach crew on a shoreline sweep — learner and beach crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Plastics and the Bay",
  title: simTitle("Plastics and the Bay"),
  tagline: "Plastic breaks into smaller pieces but does not go away — test which pieces float, then sweep the shore safely",
  accent: 0x4aa0a0,
  accentCss: "#4aa0a0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"shore-sweeper","name":"Shore Sweeper","note":"Sorted plastics in a float test, explained why plastic breaks up but stays, and swept a shoreline strip safely with the beach crew"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Sweep Board",
    currency: "PIECES",
    ranks: ["Spotter","Picker","Sorter","Sweeper","Shore Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-kinds-of-plastic-on") },
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
    "plastic-melts-away": "You said plastic melts away in the water. Sun and waves break plastic into smaller and smaller pieces, but the pieces stay. That is why keeping plastic out of the water in the first place matters most.",
    "pick-up-sharp-things": "You reached for broken glass. Sharp things are picked up only with tongs and go into the crew's sharps tub. Call the crew lead if you see anything sharp.",
    "turn-your-back-on-waves": "You turned your back on the waves. Waves can run up the beach further than you expect. Sweep above the wet sand line and face the water whenever you are near it.",
    "sweep-alone": "You wandered off on your own. The crew sweeps in pairs inside the flagged strip so everyone stays in sight. Stay with your partner and inside the flags."
  },

  lateNotes: {
    "esp-sweep-log": "The sweep tally is written after the sweep — nothing to record yet.",
    "esp-checkin": "The check-in comes at the very end of the sweep."
  },

  steps: [
    {
      id: "find-the-kinds-of-plastic-on",
      kind: "find",
      noHint: true,
      targets: [
        "esp-cap",
        "esp-strip",
        "esp-bits"
      ],
      itemNames: {
        "esp-cap": "a whole bottle cap",
        "esp-strip": "a torn strip of plastic bag",
        "esp-bits": "tiny coloured plastic bits"
      },
      itemNotes: {
        "esp-cap": "Still in one piece.",
        "esp-strip": "Breaking into smaller parts.",
        "esp-bits": "What is left after breaking up."
      },
      decoyNotes: {
        "esp-shell": "It belongs on the beach. Leave it."
      },
      title: "Find the kinds of plastic on the beach",
      cue: "Mark the three kinds of plastic you can see in the sweep strip.",
      why: "Plastic reaches the shore in many forms. A bottle cap arrives whole, a bag gets torn into strips, and tiny coloured bits are what is left after sun and waves break bigger pieces apart. Seeing all three shows that plastic changes shape but does not disappear."
    },
    {
      id: "put-the-float-test-in-order",
      kind: "sequence",
      targets: [
        "esp-ord-fill",
        "esp-ord-drop",
        "esp-ord-watch",
        "esp-ord-sort"
      ],
      itemNames: {
        "esp-ord-fill": "1 · fill the tray with salty water",
        "esp-ord-drop": "2 · drop in one piece at a time",
        "esp-ord-watch": "3 · watch whether it floats or sinks",
        "esp-ord-sort": "4 · sort floaters and sinkers into two piles"
      },
      title: "Put the float test in order",
      cue: "Fill the tray, drop in each piece, watch it, then sort floaters and sinkers.",
      why: "The float test shows which plastics ride on the surface and which sink. Filling the tray first, dropping each piece in and watching it before sorting keeps the test tidy. Knowing which pieces float explains why some plastic washes up on beaches and some ends up in the mud.",
      outOfOrderNote: "Out of order. Fill the tray with water first."
    },
    {
      id: "put-on-gloves-and-pick-up",
      kind: "select",
      target: "esp-tong-card",
      title: "Put on gloves and pick up the tongs",
      cue: "Put on gloves and take a pair of tongs before the sweep starts.",
      why: "Gloves keep hands clean, and tongs let you pick things up without touching them. The crew uses both on every sweep, because some beach litter is sharp or dirty. Getting ready before you start means you never have to grab something with a bare hand."
    },
    {
      id: "set-the-salt-level-in-the",
      kind: "turn",
      target: "esp-salt-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SALT"
      },
      title: "Set the salt level in the tray",
      cue: "Turn the salt dial to the teacher's setting to make Bay-like water.",
      why: "Salty water holds things up a little more than fresh water. Setting the salt level like Bay water makes the float test closer to what happens in the real Bay. Keeping the same salt level for every piece keeps the test fair. Scientists try to make a model as close to the real place as they can, so the results mean more."
    },
    {
      id: "read-how-many-pieces-floated",
      kind: "gauge",
      target: "esp-float-meter",
      gauge: {
        label: "FLOAT",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not matched yet. Move the marker to match the floater pile."
      },
      title: "Read how many pieces floated",
      cue: "Commit when the marker matches the size of the floater pile.",
      why: "Comparing the floater and sinker piles shows how much plastic stays on the surface. Floating plastic travels with wind and tides and often washes up on beaches. Reading the pile size helps you explain why the sweep finds so much light plastic."
    },
    {
      id: "hold-the-bag-open-for-your",
      kind: "hold",
      target: "esp-bag-hold",
      seconds: 6,
      title: "Hold the bag open for your partner",
      cue: "Hold the collection bag open while your partner drops the pieces in.",
      why: "Holding the bag open makes the sweep quick and keeps pieces from blowing away. Working in pairs, one holding and one picking, is how the crew sweeps safely. It also means someone is always watching the waves while the other looks down.",
      holdBreakNote: "The bag closed and a piece blew away. Hold it open again."
    },
    {
      id: "put-the-sharp-piece-in-the",
      kind: "drag",
      target: "esp-glass",
      drag: {
        to: "esp-sharps-tub",
        radius: 0.45,
        missNote: "Not in the sharps tub yet. Use the tongs and place it in the tub."
      },
      title: "Put the sharp piece in the sharps tub",
      cue: "Use the tongs to drag the broken glass into the sharps tub.",
      why: "Sharp things never go in the soft bag, where they could cut someone later. The sharps tub has hard sides and a lid. Putting sharp pieces there straight away keeps the whole crew safe while they carry the bags. Hard sides and a lid mean nobody gets a surprise cut when the bags are lifted into the truck."
    },
    {
      id: "spot-where-plastic-comes-from",
      kind: "find",
      noHint: true,
      targets: [
        "esp-bin",
        "esp-outfall",
        "esp-tideline"
      ],
      itemNames: {
        "esp-bin": "an overflowing bin by the path",
        "esp-outfall": "a storm drain pipe onto the beach",
        "esp-tideline": "the line of litter the tide left"
      },
      itemNotes: {
        "esp-bin": "Wind blows plastic out.",
        "esp-outfall": "It carries street litter.",
        "esp-tideline": "Waves bring it in."
      },
      decoyNotes: {
        "esp-tower": "Important for safety, but not a plastic source."
      },
      title: "Spot where plastic comes from",
      cue: "Look along the beach and mark each way plastic reaches the shore.",
      why: "Plastic reaches the beach from many places. Wind blows it from bins, storm drains carry it from streets, and waves bring it in from the water. Knowing where it comes from helps people stop it at the start, which works better than cleaning it up later."
    },
    {
      id: "say-what-happens-to-plastic-in",
      kind: "select",
      target: "esp-result-card",
      title: "Say what happens to plastic in the water",
      cue: "Choose the sentence that says what your test and sweep showed.",
      why: "Your tray showed many plastics float, and the beach showed pieces of every size, from whole caps to tiny bits. A good answer says plastic breaks into smaller pieces but stays in the water. It does not claim more than you saw. Keeping to what you saw, and not guessing, is what makes a conclusion strong."
    },
    {
      id: "follow-a-floating-bag-on-the",
      kind: "track",
      target: "esp-bag-track",
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
        label: "DRIFT"
      },
      title: "Follow a floating bag on the waves",
      cue: "Keep the marker on the floating bag as the waves carry it to the shore.",
      why: "Following one bag shows how plastic travels. It rides on the surface, drifts with the wind and waves, and lands on the beach at the tide line. Seeing that path helps you understand why beaches collect so much floating plastic. The tide line on a beach is often where the most floating plastic gathers, which is why sweeps start there.",
      holdBreakNote: "The marker lost the bag. Find it again and follow it to the shore."
    },
    {
      id: "record-what-you-collected",
      kind: "select",
      target: "esp-sweep-log",
      doneLine: "Sweep recorded",
      title: "Record what you collected",
      cue: "Tally the caps, strips and bits your pair collected on the sweep sheet.",
      why: "A tally of what was collected shows which kinds of plastic are most common. Beach crews keep these records from every sweep, so they can tell people which items to stop using. Your tally joins theirs. Totals from many sweeps show whether fewer caps and bags are reaching the shore over the months."
    },
    {
      id: "share-one-way-to-use-less",
      kind: "select",
      target: "esp-share-board",
      doneLine: "Swap shared",
      title: "Share one way to use less plastic",
      cue: "Tell another group one swap that means less plastic reaches the Bay.",
      why: "Stopping plastic at the start works best. Sharing swaps like a refillable bottle or a cloth bag spreads good ideas. Beach crews say the best sweep is the one that finds less than last time. A swap that a whole class makes adds up to a lot of plastic that never reaches the beach at all."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esp-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the beach",
      cue: "What happens to plastic in the water? What is one way to keep it out?",
      why: "The crew counts the bags and checks everyone is back before leaving. Each learner says what happens to plastic and one way to keep it out. If anyone thinks plastic melts away, the group sorts it out now. The crew also checks that every tong and glove comes back, so the kit is ready for the next sweep."
    }
  ],

  interrupts: [
    {
      id: "a-big-wave-runs-up-the-sand",
      kind: "Wave run-up",
      after: "hold-the-bag-open-for-your",
      delay: 3,
      seconds: 12,
      target: "esp-move-up-beach",
      alert: "A bigger wave runs up the sand towards the sweep strip.",
      cue: "Move up the beach with your partner, facing the water.",
      why: "Waves sometimes run further up the beach than the others. Moving up with your partner, facing the water, keeps you dry and steady. The lifeguards and the crew watch the waves the whole time.",
      missNote: "The pair kept sweeping with their backs to the water, and the crew lead had to call them up the beach.",
      wrongNote: "That keeps you by the water's edge. Move up the beach. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-sharps",
      kind: "Crew question",
      after: "follow-a-floating-bag-on-the",
      delay: 3,
      seconds: 12,
      target: "esp-name-sharps",
      alert: "The crew lead asks where broken glass goes.",
      cue: "Say sharp pieces go in the sharps tub, picked up with tongs.",
      why: "Knowing the sharps rule shows you can sweep safely. Tongs and a hard tub keep hands safe now and later. Every crew uses the same rule.",
      missNote: "You could not say where sharp pieces go, and the crew lead had to explain before the sweep went on.",
      wrongNote: "That does not say where sharp pieces go. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4aa0a0;
    const CSS = "#4aa0a0";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6a665a", base2: "#5e5a4e", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e6e6da", base2: "#d6d6c4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "esp-cap", "a whole bottle cap", {});
    bead(-1.42, 1.18, -0.62, "esp-strip", "a torn strip of plastic bag", {});
    bead(-1.03, 1.46, -0.71, "esp-bits", "tiny coloured plastic bits", {});
    bead(-1.08, 0.9, -1.11, "esp-shell", "a shell on the sand", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esp-ord-fill", "1 · fill the tray with salty water", {});
    bead(-0.58, 1.46, -1.44, "esp-ord-drop", "2 · drop in one piece at a time", {});
    bead(-0.24, 0.9, -1.23, "esp-ord-watch", "3 · watch whether it floats or sinks", {});
    bead(0, 1.18, -1.55, "esp-ord-sort", "4 · sort floaters and sinkers into two piles", {});
    bead(0.24, 1.46, -1.23, "esp-bag-hold", "Hold the bag", {});
    bead(0.58, 0.9, -1.44, "esp-bin", "an overflowing bin by the path", {});
    bead(0.68, 1.18, -1.05, "esp-outfall", "a storm drain pipe onto the beach", {});
    bead(1.08, 1.46, -1.11, "esp-tideline", "the line of litter the tide left", {});
    bead(1.03, 0.9, -0.71, "esp-tower", "the lifeguard tower", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esp-move-up-beach", "Move up the beach with your partner", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esp-name-sharps", "Say where sharp pieces go", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esp-tong-card", "Gloves and tongs", "GLOVES AND\nTONGS", { ry: 1.2 });
    dials["esp-salt-dial"] = dial(-1.89, -1.4, 0.93, "esp-salt-dial", "Salt level");
    meters["esp-float-meter"] = meter(-1.45, -1.85, 0.67, "esp-float-meter", "Floaters");
    tokens["esp-glass"] = token(-0.92, -2.16, 0.4, "esp-glass", "Broken glass");
    spots["esp-sharps-tub"] = spot(-0.31, -2.33, 0.13, "esp-sharps-tub", "The sharps tub");
    card(0.31, 1.35, -2.33, "esp-result-card", "State the result", "WHERE DOES\nIT GO?", { ry: -0.13 });
    meters["esp-bag-track"] = meter(0.92, -2.16, -0.4, "esp-bag-track", "Bag followed");
    boards["esp-sweep-log"] = board(1.45, -1.85, -0.67, "esp-sweep-log", "Sweep tally");
    boards["esp-share-board"] = board(1.89, -1.4, -0.93, "esp-share-board", "Share a swap");
    boards["esp-checkin"] = board(2.19, -0.85, -1.2, "esp-checkin", "End-of-sweep check-in");
    hazardCard(-1.53, 0.72, -1.21, "plastic-melts-away", "Say plastic melts away in sea water?", "MELTS\nAWAY?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "pick-up-sharp-things", "Pick up broken glass with your hand?", "GRAB\nGLASS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "turn-your-back-on-waves", "Turn your back on the waves while you sweep?", "BACK TO\nWAVES", -0.3);
    hazardCard(1.53, 0.72, -1.21, "sweep-alone", "Wander off to sweep on your own?", "ON YOUR\nOWN", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Gloves, tongs and a partner."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Beach crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Lifeguard", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-big-wave-runs-up-the-sand"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-big-wave-runs-up-the-sand"].visible = false;
    arrivals["the-crew-lead-asks-about-sharps"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-sharps"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "put-the-sharp-piece-in-the") { const s = spots["esp-sharps-tub"]; tokens["esp-glass"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-what-you-collected") repaint(boards["esp-sweep-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Sweep recorded"], "#59c97b"));
        if (step.id === "share-one-way-to-use-less") repaint(boards["esp-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Swap shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esp-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-happens-to-plastic-in") paintGuide("Smaller pieces, still there.");
      },

      onHazard() {
        paintGuide("Stop. Face the waves, tongs for sharps.");
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
        if (it.id === "a-big-wave-runs-up-the-sand") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Pair up the beach, the wave ran back. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-sharps") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Sharps rule explained. The lesson carries on."); }
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
