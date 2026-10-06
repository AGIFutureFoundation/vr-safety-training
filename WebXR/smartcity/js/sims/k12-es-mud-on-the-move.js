import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Mud on the Move. Lower-secondary science at the Yosemite Slough Restoration Site in San Francisco: how tides carry mud into a marsh and drop it where the water slows, why a marsh needs that mud to keep up with the water, tested in a tide tray and seen on the crew's mats, using only what the tray and the slough in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_MUD_ON_THE_MOVE = {
  id: "k12-es-mud-on-the-move",
  index: "875",
  domain: "Education",
  trade: "Science class with the tidal restoration crew at a slough — learner and restoration crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Mud on the Move",
  title: simTitle("Mud on the Move"),
  tagline: "Tides carry mud in and drop it where water slows — test it in a tray, then see why marshes need it",
  accent: 0x9a8a5a,
  accentCss: "#9a8a5a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"mud-mover","name":"Mud Mover","note":"Showed in a tide tray where moving water drops its mud, explained why a marsh needs that mud and watched the crew work from mats"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Mud Board",
    currency: "GRAINS",
    ranks: ["Grain","Silt","Layer","Bank","Marsh Builder"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-where-the-water-slows-in") },
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
    "mud-is-dirt-to-remove": "You said the mud in the water is dirt to get rid of. Marshes are built from that mud. Each tide leaves a thin layer, and over time the layers raise the marsh so it can keep up with the water.",
    "walk-on-soft-mud": "You started out onto the soft mud. Tidal mud can hold a boot fast, and the tide comes back in. The crew works from wide mats and boardwalks, and visitors stay on the firm path.",
    "change-two-things": "You changed the water speed and the amount of mud in the same run. With two changes you cannot tell which one made the difference. Change one thing, the speed, and keep the mud the same.",
    "ignore-the-tide-board": "You skipped the tide board. The crew plans every job around the tide, because rising water changes where it is safe to stand. Read the board first, like the crew does."
  },

  lateNotes: {
    "esm-layer-log": "The tray record is written once both runs are done — nothing to record yet.",
    "esm-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-where-the-water-slows-in",
      kind: "find",
      noHint: true,
      targets: [
        "esm-plants",
        "esm-bend",
        "esm-flat"
      ],
      itemNames: {
        "esm-plants": "among the marsh plants",
        "esm-bend": "the inside of the channel bend",
        "esm-flat": "where the channel spreads out"
      },
      itemNotes: {
        "esm-plants": "Stems slow the water, and mud drops.",
        "esm-bend": "Slow water on the inside leaves mud.",
        "esm-flat": "Spreading water slows and settles."
      },
      decoyNotes: {
        "esm-sign": "Useful for visitors, but water does not slow there."
      },
      title: "Find where the water slows in the slough",
      cue: "Mark the three places where moving water slows down and drops its mud.",
      why: "Moving water can carry tiny grains of mud. When it slows down, it cannot hold them any longer, so the grains settle to the bottom. Water slows among the marsh plants, on the inside of a channel bend and where a channel spreads onto flat ground. Those are the places where new mud builds up."
    },
    {
      id: "read-the-tide-board-with-the",
      kind: "select",
      target: "esm-tide-card",
      title: "Read the tide board with the crew",
      cue: "Point to the tide board and say whether the tide is rising or falling.",
      why: "Everything in a tidal marsh follows the tide. The crew reads the tide board before every job so they know how long they have before the water returns. Reading it first is a safety habit, and it also tells you whether the water is bringing mud in or carrying it out."
    },
    {
      id: "put-the-tide-tray-test-in",
      kind: "sequence",
      targets: [
        "esm-ord-stir",
        "esm-ord-slow",
        "esm-ord-look",
        "esm-ord-fast"
      ],
      itemNames: {
        "esm-ord-stir": "1 · stir the same scoop of mud into the water",
        "esm-ord-slow": "2 · run the water slowly across the tray",
        "esm-ord-look": "3 · look where the mud settled",
        "esm-ord-fast": "4 · run the same muddy water fast"
      },
      title: "Put the tide tray test in order",
      cue: "Stir in the mud, run slow water, look, then run fast water with the same mud.",
      why: "A fair test changes only one thing. You mix the same mud into the water each time and change only the speed. Running slow water first and fast water second, and looking closely after each, shows how speed decides where the mud settles. Looking closely after each run, before changing anything, is what keeps the two results apart.",
      outOfOrderNote: "Out of order. Stir in the mud first, then run the slow water."
    },
    {
      id: "hold-the-plant-strip-in-the",
      kind: "hold",
      target: "esm-strip-hold",
      seconds: 6,
      title: "Hold the plant strip in the tray",
      cue: "Hold the model plant strip in place until the water settles.",
      why: "The plant strip stands for the marsh grass. If it lifts, the water runs under it and the test changes. Holding it steady lets you see how stems slow the water and make mud settle right among them, just as it does in a real marsh. Keeping the strip in place means the slow and fast runs both meet the same model plants.",
      holdBreakNote: "The strip lifted before the water settled. Hold it in place again."
    },
    {
      id: "say-where-the-mud-settled",
      kind: "select",
      target: "esm-result-card",
      title: "Say where the mud settled",
      cue: "Choose the sentence that says what your two runs showed.",
      why: "Your two runs used the same mud but different speeds. More mud settled when the water was slow. A good answer says that slow water drops more mud, which is why calm marshes build up. It uses your layer readings as the evidence. A careful conclusion sticks to the evidence in the table and leaves out guesses."
    },
    {
      id: "spot-how-the-crew-helps-mud",
      kind: "find",
      noHint: true,
      targets: [
        "esm-channel",
        "esm-low-bank",
        "esm-reuse"
      ],
      itemNames: {
        "esm-channel": "a newly opened tidal channel",
        "esm-low-bank": "a lowered old bank",
        "esm-reuse": "a pile of dug mud being reused"
      },
      itemNotes: {
        "esm-channel": "Tides can reach the marsh again.",
        "esm-low-bank": "Water spreads out and slows down.",
        "esm-reuse": "Low spots get raised with it."
      },
      decoyNotes: {
        "esm-truck": "It brings tools, but it is not part of the mud work."
      },
      title: "Spot how the crew helps mud build up",
      cue: "Look across the slough and mark each part of the crew's work.",
      why: "Restoration crews help the tide bring mud where the marsh needs it. They open channels so tides can reach the marsh, lower old banks so water spreads out, and reuse dug mud to raise low spots. Each job helps the marsh gain height with the help of the water itself."
    },
    {
      id: "set-the-trays-water-speed",
      kind: "turn",
      target: "esm-pump-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SPEED"
      },
      title: "Set the tray's water speed",
      cue: "Turn the pump dial to the slow setting for the first run.",
      why: "The pump dial controls how fast the water moves across the tray. Setting it exactly on slow for the first run gives you a clear starting point. Then you can turn it to fast for the second run and know that speed is the only thing that changed."
    },
    {
      id: "read-the-mud-layer-in-the",
      kind: "gauge",
      target: "esm-layer-meter",
      gauge: {
        label: "LAYER",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the top of the layer. Read where the new mud stops.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the mud layer in the tray",
      cue: "Commit when the marker sits at the top of the new mud layer.",
      why: "The new layer shows how much mud dropped out of the water. Reading its top against the tray's scale lets you compare the slow and fast runs fairly. Slow water usually leaves the thicker layer, which is why calm marsh water builds up new ground."
    },
    {
      id: "place-a-crew-mat-on-the",
      kind: "drag",
      target: "esm-crew-mat",
      drag: {
        to: "esm-mat-spot",
        radius: 0.45,
        missNote: "Not on the soft mud yet. Place the mat where the crew will stand."
      },
      title: "Place a crew mat on the model mud",
      cue: "Drag the wide mat onto the soft mud beside the model channel.",
      why: "Crews working on soft mud lay down wide mats to spread their weight, the way snowshoes work on snow. A mat keeps people and small machines from sinking and protects the mud and plants underneath. Placing it before anyone steps there is how the crew keeps the job steady."
    },
    {
      id: "follow-a-cloud-of-mud-across",
      kind: "track",
      target: "esm-cloud-track",
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
        label: "FOLLOW",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Follow a cloud of mud across the tray",
      cue: "Keep the marker on the cloud of mud as it drifts and settles.",
      why: "Following one cloud of mud shows the process as it happens. It drifts with the water, spreads out among the plants and slowly sinks to the bottom. Seeing it settle helps you explain why marshes need muddy water, not only clear water. In the real slough, each tide brings a new cloud of fine mud into the marsh.",
      holdBreakNote: "The marker lost the mud cloud. Find it again and follow it until it settles."
    },
    {
      id: "record-both-runs-side-by-side",
      kind: "select",
      target: "esm-layer-log",
      doneLine: "Both runs recorded",
      title: "Record both runs side by side",
      cue: "Write the layer reading for the slow run and the fast run in a table.",
      why: "Two columns make the difference easy to see and easy to check. Anyone reading your table can see what changed and what stayed the same. Scientists who study the Bay's mud keep careful records like this so they can plan where marshes can grow."
    },
    {
      id: "compare-with-another-group",
      kind: "select",
      target: "esm-share-board",
      doneLine: "Results compared",
      title: "Compare with another group",
      cue: "Put your table next to another group's and look for the same pattern.",
      why: "If another group also finds that slow water drops more mud, the result is stronger. Comparing results is how scientists build confidence in an idea. Crews and scientists share findings about moving mud so that restoration plans work with the water."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esm-checkin",
      doneLine: "Checked in",
      title: "Check in before the tide turns",
      cue: "Where does moving water drop its mud? Why does a marsh need it?",
      why: "The crew finishes before the tide turns, and the class checks its ideas in time too. Each learner says where mud settles and why the marsh needs it. If anyone thinks the mud is only dirt, the group sorts it out now. Understanding moving mud helps everyone see a marsh as a living place that grows with each tide."
    }
  ],

  interrupts: [
    {
      id: "the-tide-starts-to-turn",
      kind: "Tide turning",
      after: "hold-the-plant-strip-in-the",
      delay: 3,
      seconds: 12,
      target: "esm-move-up",
      alert: "The crew lead calls that the tide has turned and water is creeping up the channel.",
      cue: "Move back up the firm path with the crew and watch from higher ground.",
      why: "A rising tide can cover low mud quickly. Moving up the firm path early keeps everyone dry and steady. The crew plans every job to finish before the tide returns and never waits until the water arrives.",
      missNote: "The class stayed by the channel edge, and the crew lead had to call everyone back up as the water reached the path.",
      wrongNote: "That keeps you low by the channel. Move up the firm path. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-the-mats",
      kind: "Crew question",
      after: "follow-a-cloud-of-mud-across",
      delay: 3,
      seconds: 12,
      target: "esm-name-mats",
      alert: "The crew lead asks why the crew stands on wide mats.",
      cue: "Say the mats spread weight so people and machines do not sink.",
      why: "Knowing about the mats shows you understand soft ground. A wide mat spreads weight over more mud, so nobody sinks. It also protects the marsh plants below.",
      missNote: "You could not say why the crew uses mats, and the crew lead had to explain before the class could go on.",
      wrongNote: "That does not explain the mats. Say what they do to weight. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x9a8a5a;
    const CSS = "#9a8a5a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6e6450", base2: "#625846", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e6e2d0", base2: "#d6d0b8", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "esm-plants", "among the marsh plants", {});
    bead(-1.42, 1.18, -0.62, "esm-bend", "the inside of the channel bend", {});
    bead(-1.03, 1.46, -0.71, "esm-flat", "where the channel spreads out", {});
    bead(-1.08, 0.9, -1.11, "esm-sign", "the slough's welcome sign", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esm-ord-stir", "1 · stir the same scoop of mud into the water", {});
    bead(-0.58, 1.46, -1.44, "esm-ord-slow", "2 · run the water slowly across the tray", {});
    bead(-0.24, 0.9, -1.23, "esm-ord-look", "3 · look where the mud settled", {});
    bead(0, 1.18, -1.55, "esm-ord-fast", "4 · run the same muddy water fast", {});
    bead(0.24, 1.46, -1.23, "esm-strip-hold", "Hold the plant strip", {});
    bead(0.58, 0.9, -1.44, "esm-channel", "a newly opened tidal channel", {});
    bead(0.68, 1.18, -1.05, "esm-low-bank", "a lowered old bank", {});
    bead(1.08, 1.46, -1.11, "esm-reuse", "a pile of dug mud being reused", {});
    bead(1.03, 0.9, -0.71, "esm-truck", "the crew's parked truck", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esm-move-up", "Move back up the firm path", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esm-name-mats", "Say why the crew uses mats", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esm-tide-card", "Tide board read", "TIDE\nFIRST", { ry: 1.2 });
    dials["esm-pump-dial"] = dial(-1.89, -1.4, 0.93, "esm-pump-dial", "Water speed");
    meters["esm-layer-meter"] = meter(-1.45, -1.85, 0.67, "esm-layer-meter", "Mud layer");
    tokens["esm-crew-mat"] = token(-0.92, -2.16, 0.4, "esm-crew-mat", "Crew mat");
    spots["esm-mat-spot"] = spot(-0.31, -2.33, 0.13, "esm-mat-spot", "The soft mud");
    card(0.31, 1.35, -2.33, "esm-result-card", "State the result", "WHERE DID\nIT SETTLE?", { ry: -0.13 });
    meters["esm-cloud-track"] = meter(0.92, -2.16, -0.4, "esm-cloud-track", "Mud cloud followed");
    boards["esm-layer-log"] = board(1.45, -1.85, -0.67, "esm-layer-log", "Tray record");
    boards["esm-share-board"] = board(1.89, -1.4, -0.93, "esm-share-board", "Compare with a group");
    boards["esm-checkin"] = board(2.19, -0.85, -1.2, "esm-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "mud-is-dirt-to-remove", "Say the mud in the water is dirt to get rid of?", "JUST\nDIRT?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "walk-on-soft-mud", "Walk out onto the soft mud at low tide?", "WALK\nOUT", 0.3);
    hazardCard(0.58, 0.72, -1.86, "change-two-things", "Make the water faster and add more mud in the same run?", "TWO\nCHANGES", -0.3);
    hazardCard(1.53, 0.72, -1.21, "ignore-the-tide-board", "Ignore the crew's tide board?", "NO\nBOARD", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Same mud, change only speed."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Restoration crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Crew member on the mats", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-tide-starts-to-turn"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-tide-starts-to-turn"].visible = false;
    arrivals["the-crew-lead-asks-about-the-mats"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-the-mats"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-a-crew-mat-on-the") { const s = spots["esm-mat-spot"]; tokens["esm-crew-mat"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-both-runs-side-by-side") repaint(boards["esm-layer-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Both runs recorded"], "#59c97b"));
        if (step.id === "compare-with-another-group") repaint(boards["esm-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Results compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esm-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-where-the-mud-settled") paintGuide("Slow water drops mud.");
      },

      onHazard() {
        paintGuide("Stop. Firm path and tide board first.");
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
        if (it.id === "the-tide-starts-to-turn") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class on higher ground, the tide coming in. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-the-mats") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Mats explained. The lesson carries on."); }
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
