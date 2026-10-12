import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Why a Steel Boat Floats. Upper-primary science at a bayou shipyard like the ones at Franklin: why a heavy steel hull floats, how its shape pushes water aside, why a boat has a mark showing how deep it may sit, and how a new hull slides down a slip into the water, worked with model hulls in a test tank and a model slip in the scene.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_LK_WHY_A_STEEL_BOAT_FLOATS = {
  id: "k12-lk-why-a-steel-boat-floats",
  index: "968",
  domain: "Education",
  trade: "Science and making lesson with a shipyard crew on a Louisiana bayou — learner and shipfitter",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Why a Steel Boat Floats",
  title: simTitle("Why a Steel Boat Floats"),
  tagline: "A lump of steel sinks, a steel hull floats — shape it, load it and launch it down the slip",
  accent: 0x3f8f9a,
  accentCss: "#3f8f9a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"hull-shaper","name":"Hull Shaper","note":"Shaped a hull that floats, loaded it to its mark and watched a model hull launch down the slip"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Shipyard Board",
    currency: "RIVETS",
    ranks: ["Raft","Skiff","Tug","Workboat","Hull Shaper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-the-hull") },
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
    "look-at-the-weld-arc": "You turned to watch the welding arc. The light from a welding arc is so bright it can burn your eyes, even from a distance and even in a quick look. Welders wear dark helmets and put up screens so people nearby are protected; watch from behind the screen.",
    "steel-always-sinks": "You said steel always sinks. A solid lump of steel does sink. Shaped into a hull full of air, the same steel pushes aside much more water, and the water pushes back up hard enough to hold it. It is shape, not magic.",
    "stand-at-the-slip-end": "You went to the bottom of the slip. When a hull is launched, it slides down fast and pushes a wave of water ahead of it. Everyone except the launch crew watches from the viewing area to the side, well clear of the slip and the water.",
    "overload-the-hull": "You loaded the model past its mark. A boat loaded too deep has too little hull above the water, so waves can wash over the deck. The load mark on the side shows how deep it may safely sit, and crews never load past it."
  },

  lateNotes: {
    "lkb-hull-log": "The float record is written once you have tested the lump and the hull — nothing to record yet.",
    "lkb-checkin": "The check-in comes at the end, at the viewing area."
  },

  steps: [
    {
      id: "find-the-parts-of-the-hull",
      kind: "find",
      noHint: true,
      targets: [
        "lkb-keel",
        "lkb-plating",
        "lkb-deck"
      ],
      itemNames: {
        "lkb-keel": "the keel along the bottom",
        "lkb-plating": "the side plating",
        "lkb-deck": "the deck on top"
      },
      itemNotes: {
        "lkb-keel": "The backbone of the hull.",
        "lkb-plating": "Keeps the water out.",
        "lkb-deck": "Closes the box."
      },
      decoyNotes: {
        "lkb-crane": "It lifts the plates, but it is not part of the hull."
      },
      title: "Find the parts of the hull",
      cue: "Mark the keel, the side plating and the deck on the model hull.",
      why: "A hull is built like a strong box. The keel runs along the bottom like a backbone and keeps the boat straight and steady. Side plates of steel are welded on to form the watertight shell. The deck closes the top. Together they make a shape that holds air inside and keeps water outside, which is what lets it float."
    },
    {
      id: "stand-behind-the-welding-screen",
      kind: "select",
      target: "lkb-screen-card",
      title: "Stand behind the welding screen",
      cue: "Join the shipfitter behind the green welding screen at the edge of the yard.",
      why: "Shipyards are full of welding, cutting and lifting. The welding screen blocks the bright light and the sparks, and the painted line keeps visitors clear of moving loads. The shipfitter explains the work from behind the screen, which is where the class stays for the whole visit."
    },
    {
      id: "put-the-building-of-a-hull",
      kind: "sequence",
      targets: [
        "lkb-ord-cut",
        "lkb-ord-weld",
        "lkb-ord-join",
        "lkb-ord-launch"
      ],
      itemNames: {
        "lkb-ord-cut": "1 · cut the steel plates to shape",
        "lkb-ord-weld": "2 · fit and weld the plates into blocks",
        "lkb-ord-join": "3 · join the blocks on the slip",
        "lkb-ord-launch": "4 · slide the hull into the water"
      },
      title: "Put the building of a hull in order",
      cue: "Order the steps a shipyard follows to turn steel plates into a boat in the water.",
      why: "A hull is built in an order. Steel plates are cut to shape first. Then fitters line them up and welders join them into blocks. The blocks are joined on the slip into a whole hull. Last, the hull slides down the slip into the water. Each step depends on the one before it being done well.",
      outOfOrderNote: "Out of order. The plates must be cut before anything can be welded."
    },
    {
      id: "hold-the-lump-under-the-water",
      kind: "hold",
      target: "lkb-lump-hold",
      seconds: 6,
      title: "Hold the lump under the water",
      cue: "Hold the steel lump on the scale under the water until the reading settles.",
      why: "Under water the lump seems lighter, because the water pushes up on it. But the lump is small and pushes aside only a little water, so the upward push is weaker than its weight and it sinks. Holding it still lets you read how much lighter it feels, which is the push the water gives.",
      holdBreakNote: "The lump moved and the reading jumped. Hold it still under the water."
    },
    {
      id: "say-why-the-hull-floats-and",
      kind: "select",
      target: "lkb-result-card",
      title: "Say why the hull floats and the lump sinks",
      cue: "Choose the sentence that explains the difference between the lump and the hull.",
      why: "The lump and the hull are made of the same steel. You saw the hull sit high while the lump went to the bottom. A good answer says the hull's wide, hollow shape pushes aside enough water to match its weight, so the water holds it up; the lump pushes aside too little. It uses what the tank showed."
    },
    {
      id: "spot-the-trades-working-on-the",
      kind: "find",
      noHint: true,
      targets: [
        "lkb-welder",
        "lkb-electrician",
        "lkb-painter"
      ],
      itemNames: {
        "lkb-welder": "a welder behind a screen",
        "lkb-electrician": "a marine electrician at a panel",
        "lkb-painter": "a painter coating the hull"
      },
      itemNotes: {
        "lkb-welder": "Joins the plates.",
        "lkb-electrician": "Runs power through the boat.",
        "lkb-painter": "Keeps the rust out."
      },
      decoyNotes: {
        "lkb-gull": "A bayou neighbour, not a shipyard trade."
      },
      title: "Spot the trades working on the new hull",
      cue: "Look along the slip and mark three kinds of work on the hull.",
      why: "Many trades build a boat. Welders join the steel plates. Marine electricians run the cables for lights, engines and controls. Painters coat the hull so salt water cannot rust it. These are kinds of work people train for, and each one uses the science of this lesson in their own way."
    },
    {
      id: "turn-the-winch-to-ease-the",
      kind: "turn",
      target: "lkb-slip-winch",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "WINCH"
      },
      title: "Turn the winch to ease the hull down",
      cue: "Turn the model slip winch slowly so the hull eases down toward the water.",
      why: "A hull on a slip is held back until the launch crew is ready. Easing it down slowly on a model shows how gravity pulls it toward the water along the slope. On a real slip the crew controls the launch with great care, because a big hull moving down a slope carries a lot of energy."
    },
    {
      id: "read-the-load-mark-at-the",
      kind: "gauge",
      target: "lkb-mark-meter",
      gauge: {
        label: "MARK",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the mark yet. Read where the water meets the painted line.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the load mark at the water line",
      cue: "Commit when the marker sits where the water line meets the load mark on the hull.",
      why: "Every working boat has a mark painted on its side that shows how deep it may safely sit in the water. As cargo goes on, the hull sinks lower and the water climbs toward the mark. Reading it tells the crew when the boat is fully loaded. Past the mark, too little hull stays above the water."
    },
    {
      id: "load-the-cargo-block-into-the",
      kind: "drag",
      target: "lkb-cargo-block",
      drag: {
        to: "lkb-middle-spot",
        radius: 0.45,
        missNote: "Not in the middle yet. Place it on the centre of the deck."
      },
      title: "Load the cargo block into the middle",
      cue: "Drag the cargo block to the middle of the model hull's deck.",
      why: "Where the load goes matters as much as how heavy it is. A block in the middle keeps the hull level. A block at one side makes the boat lean, and a leaning boat can tip in a wave. Crews load the heaviest things low and in the middle, so the boat stays upright and steady."
    },
    {
      id: "follow-the-hull-down-the-slip",
      kind: "track",
      target: "lkb-hull-track",
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
      title: "Follow the hull down the slip",
      cue: "Keep the marker on the model hull as it slides down the slip and floats.",
      why: "Following the hull shows the moment it stops being carried and starts floating. As it slides into the water, the water pushes up more and more until the hull rides on its own. The wave it makes shows how much water it pushed aside, the same water that now holds it up.",
      holdBreakNote: "The marker lost the hull. Find it again and follow it into the water."
    },
    {
      id: "record-the-lump-the-hull-and",
      kind: "select",
      target: "lkb-hull-log",
      doneLine: "Float test recorded",
      title: "Record the lump, the hull and the load",
      cue: "Write what happened to the lump, the empty hull and the loaded hull.",
      why: "Three short lines tell the whole story: the lump sank, the empty hull floated high, and the loaded hull sat lower but still floated to its mark. A record like this lets anyone check your thinking later. Shipyards keep careful records of every hull for the same reason."
    },
    {
      id: "swap-a-question-with-a-partner",
      kind: "select",
      target: "lkb-share-board",
      doneLine: "Questions swapped",
      title: "Swap a question with a partner",
      cue: "Ask a partner one question about floating, then answer one of theirs.",
      why: "Asking and answering questions shows what you understand and what you still wonder about. A good question might be why a loaded boat sits lower. Shipfitters ask each other questions all day, because asking early is how mistakes get caught before the steel is welded."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "lkb-checkin",
      doneLine: "Checked in",
      title: "Check in at the viewing area",
      cue: "Why does the steel hull float? What does the load mark tell the crew?",
      why: "The shipfitter ends the visit by checking what everyone learned. Each learner gives one reason the hull floats and says what the mark is for. If anyone still thinks steel must always sink, the group works it out together before leaving the yard."
    }
  ],

  interrupts: [
    {
      id: "the-crane-horn-sounds-overhead",
      kind: "Crane signal",
      after: "hold-the-lump-under-the-water",
      delay: 3,
      seconds: 12,
      target: "lkb-stop-still",
      alert: "The yard crane sounds its horn as it lifts a steel plate.",
      cue: "Stop where you are, look up and stay out from under the load until it has passed.",
      why: "A crane horn warns everyone that a load is moving overhead. Nobody walks under a hanging load, ever. Stopping and looking up lets you see where it is going and stay clear, just as the yard crew does.",
      missNote: "The class kept walking under the path of the moving plate. When the crane horn sounds, stop and step clear, because nobody stands or walks under a load that is being lifted.",
      wrongNote: "That keeps the class under the load. Stop and look up. Choose the response that deals with it now."
    },
    {
      id: "the-shipfitter-asks-about-the-load",
      kind: "Crew question",
      after: "follow-the-hull-down-the-slip",
      delay: 3,
      seconds: 12,
      target: "lkb-name-middle",
      alert: "The shipfitter asks where the heaviest cargo should go.",
      cue: "Say heavy loads go low and in the middle, so the boat stays level and steady.",
      why: "A boat that leans can tip in a wave. Loading heavy things low and central keeps it upright. Knowing this shows you understand that floating is not only about weight but also about balance.",
      missNote: "You could not say where the load goes, and the shipfitter explained before the class went on.",
      wrongNote: "That does not answer where the load goes. Say where heavy cargo belongs. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x3f8f9a;
    const CSS = "#3f8f9a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6c6e70", base2: "#5e6062", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dfe6e6", base2: "#cad6d6", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a working boat's deck: a rail along the stern, a wheelhouse, coiled lines and a life ring
    void wallMat;
    const rail = group(g, 0, 0, -4.6);
    for (let i = 0; i < 9; i++) cyl(rail, 0.025, 0.025, 1.0, -3.2 + i * 0.8, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 8 });
    box(rail, 6.6, 0.05, 0.05, 0, 1.0, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    box(rail, 6.6, 0.03, 0.03, 0, 0.55, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    const house = group(g, -2.6, 0, -3.9);
    box(house, 1.8, 2.1, 1.2, 0, 1.05, 0, 0xf4f0e6, { rough: 0.7 });
    box(house, 1.5, 0.6, 0.04, 0, 1.5, 0.61, 0x2a3a4a, { rough: 0.3, metal: 0.2 });
    box(house, 1.9, 0.08, 1.3, 0, 2.14, 0, 0xd8a54a, { rough: 0.6 });
    for (const [cx0, cz0] of [[2.4, -3.8], [3.0, -3.3]]) for (let i = 0; i < 3; i++) cyl(g, 0.28 - i * 0.03, 0.28 - i * 0.03, 0.05, cx0, 0.03 + i * 0.05, cz0, 0xd8c04a, { rough: 0.9, seg: 14 });
    const ring = group(g, 3.3, 1.2, -4.55);
    cyl(ring, 0.32, 0.32, 0.06, 0, 0, 0, 0xf0645b, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    cyl(ring, 0.18, 0.18, 0.08, 0, 0, 0, 0xf4f0e6, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    for (const bx of [-3.6, 3.6]) box(g, 0.5, 0.5, 0.5, bx, 0.25, -2.6, 0x6b4a2e, { rough: 0.8 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "lkb-keel", "the keel along the bottom", {});
    bead(-1.42, 1.18, -0.62, "lkb-plating", "the side plating", {});
    bead(-1.03, 1.46, -0.71, "lkb-deck", "the deck on top", {});
    bead(-1.08, 0.9, -1.11, "lkb-crane", "the yard crane overhead", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "lkb-ord-cut", "1 · cut the steel plates to shape", {});
    bead(-0.58, 1.46, -1.44, "lkb-ord-weld", "2 · fit and weld the plates into blocks", {});
    bead(-0.24, 0.9, -1.23, "lkb-ord-join", "3 · join the blocks on the slip", {});
    bead(0, 1.18, -1.55, "lkb-ord-launch", "4 · slide the hull into the water", {});
    bead(0.24, 1.46, -1.23, "lkb-lump-hold", "Hold the lump", {});
    bead(0.58, 0.9, -1.44, "lkb-welder", "a welder behind a screen", {});
    bead(0.68, 1.18, -1.05, "lkb-electrician", "a marine electrician at a panel", {});
    bead(1.08, 1.46, -1.11, "lkb-painter", "a painter coating the hull", {});
    bead(1.03, 0.9, -0.71, "lkb-gull", "a gull on a piling", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "lkb-stop-still", "Stop still and look up", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "lkb-name-middle", "Say heavy loads go low and in the middle", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "lkb-screen-card", "Behind the screen", "BEHIND THE\nSCREEN", { ry: 1.2 });
    dials["lkb-slip-winch"] = dial(-1.89, -1.4, 0.93, "lkb-slip-winch", "Slip winch");
    meters["lkb-mark-meter"] = meter(-1.45, -1.85, 0.67, "lkb-mark-meter", "Load mark");
    tokens["lkb-cargo-block"] = token(-0.92, -2.16, 0.4, "lkb-cargo-block", "Cargo block");
    spots["lkb-middle-spot"] = spot(-0.31, -2.33, 0.13, "lkb-middle-spot", "The middle of the deck");
    card(0.31, 1.35, -2.33, "lkb-result-card", "State why", "WHY DOES\nIT FLOAT?", { ry: -0.13 });
    meters["lkb-hull-track"] = meter(0.92, -2.16, -0.4, "lkb-hull-track", "Hull followed");
    boards["lkb-hull-log"] = board(1.45, -1.85, -0.67, "lkb-hull-log", "Float record");
    boards["lkb-share-board"] = board(1.89, -1.4, -0.93, "lkb-share-board", "Swap questions");
    boards["lkb-checkin"] = board(2.19, -0.85, -1.2, "lkb-checkin", "Viewing-area check-in");
    hazardCard(-1.53, 0.72, -1.21, "look-at-the-weld-arc", "Watch the welder's bright arc without a screen?", "LOOK\nAT ARC", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "steel-always-sinks", "Say steel always sinks, so boats must be magic?", "STEEL\nSINKS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "stand-at-the-slip-end", "Stand at the bottom of the slip to watch?", "SLIP\nEND", -0.3);
    hazardCard(1.53, 0.72, -1.21, "overload-the-hull", "Pile on cargo past the load mark?", "PILE\nON", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Behind the screen with the shipfitter."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Shipfitter", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Launch crew member", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-crane-horn-sounds-overhead"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-crane-horn-sounds-overhead"].visible = false;
    arrivals["the-shipfitter-asks-about-the-load"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-shipfitter-asks-about-the-load"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "load-the-cargo-block-into-the") { const s = spots["lkb-middle-spot"]; tokens["lkb-cargo-block"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-lump-the-hull-and") repaint(boards["lkb-hull-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Float test recorded"], "#59c97b"));
        if (step.id === "swap-a-question-with-a-partner") repaint(boards["lkb-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Questions swapped"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["lkb-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-the-hull-floats-and") paintGuide("Shape pushes water aside; water pushes back up.");
      },

      onHazard() {
        paintGuide("Stop. Do not look at the arc.");
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
        if (it.id === "the-crane-horn-sounds-overhead") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class stopped, the plate passed over. The lesson carries on."); }
        if (it.id === "the-shipfitter-asks-about-the-load") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Loading explained. The lesson carries on."); }
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
