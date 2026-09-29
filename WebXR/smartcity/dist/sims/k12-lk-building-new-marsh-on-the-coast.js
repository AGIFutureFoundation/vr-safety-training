import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Building New Marsh on the Coast. Upper-primary science on the Louisiana coast of Vermilion and Cameron Parishes: how a marsh loses ground to waves and sinking mud, and how a restoration crew builds new marsh by pumping mud into a walled cell and planting it, observed from a dike and a model cell, using only what the marsh and the model in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_LK_BUILDING_NEW_MARSH_ON_THE_COAST = {
  id: "k12-lk-building-new-marsh-on-the-coast",
  index: "964",
  domain: "Education",
  trade: "Science walk with a coastal marsh restoration crew — learner and restoration crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Building New Marsh on the Coast",
  title: simTitle("Building New Marsh on the Coast"),
  tagline: "Mud, water and grass make a marsh — watch the crew fill a cell, then help plant it",
  accent: 0x6f9a58,
  accentCss: "#6f9a58",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"marsh-builder","name":"Marsh Builder","note":"Found why a coastal marsh shrinks, watched mud settle in a model cell and helped the crew plant the new edge"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Marsh Board",
    currency: "SPRIGS",
    ranks: ["Mud Pie","Seedling","Grass Clump","Marsh Edge","Marsh Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-makes-a-marsh-lose") },
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
    "walk-on-new-mud": "You stepped toward the new mud. Freshly pumped mud is still soft like pudding and can hold a boot fast. The crew stays on the dike and the boardwalk until the mud has settled and firmed up, and so does the class.",
    "touch-the-pipe": "You reached for the mud pipe. The pipe carries mud and water pushed hard by a pump, and it can shift and shake. Only the crew works beside it, so the class watches it from the dike.",
    "marsh-grows-back-alone": "You said the marsh will fix itself. Here the ground sinks slowly and waves chew at the edge, and the river no longer spreads new mud across the land as it once did. Without new mud the marsh keeps shrinking, which is why crews build new marsh.",
    "pull-up-a-plant": "You went to pull up a young plant. Its roots are just starting to grip the soft mud and hold it in place. Look at the plant where it grows, and leave it to do its job."
  },

  lateNotes: {
    "lkm-marsh-log": "The marsh record is written once you have seen each part of the cell — nothing to record yet.",
    "lkm-checkin": "The check-in comes at the very end of the walk."
  },

  steps: [
    {
      id: "find-what-makes-a-marsh-lose",
      kind: "find",
      noHint: true,
      targets: [
        "lkm-waves",
        "lkm-sinking",
        "lkm-channel"
      ],
      itemNames: {
        "lkm-waves": "the waves at the marsh edge",
        "lkm-sinking": "the sinking ground",
        "lkm-channel": "the long cut channel"
      },
      itemNotes: {
        "lkm-waves": "Waves carry mud away.",
        "lkm-sinking": "Old mud packs down and sinks.",
        "lkm-channel": "Salty water reaches the grass."
      },
      decoyNotes: {
        "lkm-heron": "A marsh visitor, not a cause of loss."
      },
      title: "Find what makes a marsh lose ground",
      cue: "Mark the three things that wear the marsh away along this coast.",
      why: "A coastal marsh is land made of mud held together by grass roots. Waves break against its edge and carry mud away. The mud underneath slowly packs down and sinks. Long channels let salty water reach deep into the marsh and harm the grass. When less new mud arrives than is lost, the marsh turns into open water bit by bit."
    },
    {
      id: "stay-on-the-dike-with-the",
      kind: "select",
      target: "lkm-dike-card",
      title: "Stay on the dike with the crew lead",
      cue: "Walk with the crew lead along the top of the dike and stop at the viewing spot.",
      why: "The dike is a wall of firm earth built around the new marsh area, and it is the safe place to stand. The mud inside is still soft, and the pipe and machines are working nearby. Staying on the dike lets the class see everything while the crew keeps working without having to stop."
    },
    {
      id: "put-the-marsh-building-steps-in",
      kind: "sequence",
      targets: [
        "lkm-ord-dike",
        "lkm-ord-pump",
        "lkm-ord-settle",
        "lkm-ord-plant"
      ],
      itemNames: {
        "lkm-ord-dike": "1 · build the dike around the cell",
        "lkm-ord-pump": "2 · pump mud and water into the cell",
        "lkm-ord-settle": "3 · let the water drain and the mud settle",
        "lkm-ord-plant": "4 · plant grass on the new mud"
      },
      title: "Put the marsh-building steps in order",
      cue: "Order the steps the crew follows to build a new piece of marsh.",
      why: "Building marsh follows an order. First the crew builds the dike so the mud stays where it is wanted. Then a pipe brings mud and water from the bottom of a nearby waterway. The water drains away and the mud settles. Last, the crew plants grass so roots can hold the new ground together.",
      outOfOrderNote: "Out of order. The dike comes first, so the mud has a place to stay."
    },
    {
      id: "hold-the-jar-still-while-the",
      kind: "hold",
      target: "lkm-jar-hold",
      seconds: 6,
      title: "Hold the jar still while the mud settles",
      cue: "Hold the jar of muddy water still until the mud sinks to the bottom.",
      why: "Mud carried in water sinks when the water is calm. Holding the jar still lets the tiny bits of mud fall and form a layer at the bottom. The same thing happens inside the marsh cell: the water slows down, the mud drops out, and a new layer of ground builds up where there was water before.",
      holdBreakNote: "The jar was shaken and the mud clouded up again. Hold it still and wait."
    },
    {
      id: "say-how-the-new-marsh-helps",
      kind: "select",
      target: "lkm-result-card",
      title: "Say how the new marsh helps the coast",
      cue: "Choose the sentence that says what the new marsh does for the land behind it.",
      why: "You saw grass and shallow mud slow the waves in the model. A good answer says that a marsh acts like a speed bump for waves and storm water, taking away some of their push before they reach the land and the towns behind it. It says what the model showed and nothing more."
    },
    {
      id: "spot-the-signs-of-a-healthy",
      kind: "find",
      noHint: true,
      targets: [
        "lkm-grass",
        "lkm-crabs",
        "lkm-birds"
      ],
      itemNames: {
        "lkm-grass": "grass spreading over the mud",
        "lkm-crabs": "small crabs in the mud",
        "lkm-birds": "wading birds feeding"
      },
      itemNotes: {
        "lkm-grass": "Roots are holding the ground.",
        "lkm-crabs": "Food for birds and fish.",
        "lkm-birds": "Animals are using the marsh."
      },
      decoyNotes: {
        "lkm-truck": "Useful for the crew, but not a sign of marsh life."
      },
      title: "Spot the signs of a healthy new marsh",
      cue: "Look across the older finished cell and mark the signs that the marsh is working.",
      why: "A new marsh is working when life moves in. Grass spreading across the mud shows roots are holding the ground. Small crabs in the mud show there is food. Wading birds feeding show the marsh has become a place animals use. Crews look for signs like these to know the new marsh is on its way."
    },
    {
      id: "turn-the-valve-to-slow-the",
      kind: "turn",
      target: "lkm-flow-valve",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "FLOW"
      },
      title: "Turn the valve to slow the pipe",
      cue: "Turn the model valve until the mud flow into the cell is gentle.",
      why: "If the mud comes in too fast it rushes straight across the cell and spills out the far side. A gentle flow gives the mud time to spread and settle evenly. The crew watches the flow closely and adjusts it for the same reason, so the new ground ends up level and firm."
    },
    {
      id: "read-the-mud-height-on-the",
      kind: "gauge",
      target: "lkm-mud-meter",
      gauge: {
        label: "MUD",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the mud top yet. Read where the mud meets the post.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the mud height on the marker post",
      cue: "Commit when the marker sits at the top of the mud on the post in the cell.",
      why: "The crew wants the new mud to reach the same height as a healthy marsh nearby, not higher and not lower. Too low and it stays under water; too high and marsh grass will not grow well. Reading the mud height on the marker post tells the crew when the cell is full enough."
    },
    {
      id: "plant-a-grass-clump-on-the",
      kind: "drag",
      target: "lkm-grass-clump",
      drag: {
        to: "lkm-edge-spot",
        radius: 0.45,
        missNote: "Not on the bare edge yet. Place it where the new mud has no grass."
      },
      title: "Plant a grass clump on the new edge",
      cue: "Drag the model grass clump to the bare edge of the new mud.",
      why: "Planting grass along the bare edge is how the crew protects new marsh. Roots spread through the mud and hold it together, and the leaves slow the water. Each clump you place in the model shows how one plant starts to guard the ground, and many plants together make the edge strong."
    },
    {
      id: "follow-the-water-as-it-drains",
      kind: "track",
      target: "lkm-water-track",
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
      title: "Follow the water as it drains away",
      cue: "Keep the marker on the draining water as it leaves the cell through the outlet.",
      why: "The water that carried the mud has to leave the cell, but the mud has to stay. Following the water to the outlet shows how the crew lets clearer water out while the mud stays behind. It is the same idea as the jar: calm water drops its mud, and then it can go.",
      holdBreakNote: "The marker lost the water. Find the flow again and follow it to the outlet."
    },
    {
      id: "record-what-you-saw-at-each",
      kind: "select",
      target: "lkm-marsh-log",
      doneLine: "Marsh recorded",
      title: "Record what you saw at each part of the cell",
      cue: "Write one line for the dike, the pipe and the new mud.",
      why: "A short note for each part shows how the pieces of the job fit together. Anyone reading your notes can see what the dike holds, what the pipe brings and what the mud becomes. Restoration crews keep records the same way, so they can compare the marsh as it grows over the seasons."
    },
    {
      id: "compare-notes-with-another-group",
      kind: "select",
      target: "lkm-share-board",
      doneLine: "Notes compared",
      title: "Compare notes with another group",
      cue: "Put your notes next to another group's and look for anything they saw that you missed.",
      why: "Two groups standing on the same dike may notice different things. Comparing notes gives a fuller picture of how the marsh is built. Scientists and crews share what they see for the same reason, because several careful watchers see more than one person alone."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "lkm-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the dike",
      cue: "Why does this coast need new marsh? What holds the new mud in place?",
      why: "The crew talks through the day before leaving, and the class does the same. Each learner says one reason the marsh shrinks and one thing that holds the new mud in place. If anyone thinks the marsh will simply grow back by itself, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "the-pump-crew-calls-a-pause",
      kind: "Crew signal",
      after: "hold-the-jar-still-while-the",
      delay: 3,
      seconds: 12,
      target: "lkm-step-back",
      alert: "The pump crew signals a pause while they move the end of the pipe.",
      cue: "Step back from the dike rail and wait until the crew lead says to go on.",
      why: "When the crew moves the pipe, everyone nearby steps back and waits. A pause keeps people clear while heavy gear moves. Good crews stop and listen to a signal straight away, and a class does too.",
      missNote: "The class stayed at the rail, and the crew had to wait before they could move the pipe.",
      wrongNote: "That does not answer the signal. Step back from the rail and wait. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-the-roots",
      kind: "Crew question",
      after: "follow-the-water-as-it-drains",
      delay: 3,
      seconds: 12,
      target: "lkm-name-roots",
      alert: "The crew lead asks why they plant grass as soon as the mud firms up.",
      cue: "Say the roots grip the mud and hold it together against the waves.",
      why: "Knowing why the grass matters shows you understand how a marsh stays put. Roots are like a net inside the mud. That is why the crew plants the new ground quickly once it can take a plant.",
      missNote: "You could not say why the grass matters, and the crew lead had to explain before the class went on.",
      wrongNote: "That does not explain the grass. Say what the roots do to the mud. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x6f9a58;
    const CSS = "#6f9a58";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#66604c", base2: "#5a5442", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e0e4cc", base2: "#ccd4b4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "lkm-waves", "the waves at the marsh edge", {});
    bead(-1.42, 1.18, -0.62, "lkm-sinking", "the sinking ground", {});
    bead(-1.03, 1.46, -0.71, "lkm-channel", "the long cut channel", {});
    bead(-1.08, 0.9, -1.11, "lkm-heron", "a heron fishing", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "lkm-ord-dike", "1 · build the dike around the cell", {});
    bead(-0.58, 1.46, -1.44, "lkm-ord-pump", "2 · pump mud and water into the cell", {});
    bead(-0.24, 0.9, -1.23, "lkm-ord-settle", "3 · let the water drain and the mud settle", {});
    bead(0, 1.18, -1.55, "lkm-ord-plant", "4 · plant grass on the new mud", {});
    bead(0.24, 1.46, -1.23, "lkm-jar-hold", "Hold the jar", {});
    bead(0.58, 0.9, -1.44, "lkm-grass", "grass spreading over the mud", {});
    bead(0.68, 1.18, -1.05, "lkm-crabs", "small crabs in the mud", {});
    bead(1.08, 1.46, -1.11, "lkm-birds", "wading birds feeding", {});
    bead(1.03, 0.9, -0.71, "lkm-truck", "a crew truck on the dike", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "lkm-step-back", "Step back from the rail and wait", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "lkm-name-roots", "Say the roots hold the mud", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "lkm-dike-card", "Stay on the dike", "STAY ON\nTHE DIKE", { ry: 1.2 });
    dials["lkm-flow-valve"] = dial(-1.89, -1.4, 0.93, "lkm-flow-valve", "Pipe valve");
    meters["lkm-mud-meter"] = meter(-1.45, -1.85, 0.67, "lkm-mud-meter", "Mud height");
    tokens["lkm-grass-clump"] = token(-0.92, -2.16, 0.4, "lkm-grass-clump", "Grass clump");
    spots["lkm-edge-spot"] = spot(-0.31, -2.33, 0.13, "lkm-edge-spot", "The bare new edge");
    card(0.31, 1.35, -2.33, "lkm-result-card", "State what it does", "WHAT DOES\nIT DO?", { ry: -0.13 });
    meters["lkm-water-track"] = meter(0.92, -2.16, -0.4, "lkm-water-track", "Water followed");
    boards["lkm-marsh-log"] = board(1.45, -1.85, -0.67, "lkm-marsh-log", "Marsh record");
    boards["lkm-share-board"] = board(1.89, -1.4, -0.93, "lkm-share-board", "Compare notes");
    boards["lkm-checkin"] = board(2.19, -0.85, -1.2, "lkm-checkin", "End-of-walk check-in");
    hazardCard(-1.53, 0.72, -1.21, "walk-on-new-mud", "Walk out onto the new mud?", "WALK\nOUT", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "touch-the-pipe", "Climb on the mud pipe?", "CLIMB\nPIPE", 0.3);
    hazardCard(0.58, 0.72, -1.86, "marsh-grows-back-alone", "Say the marsh will grow back by itself?", "GROWS\nBACK?", -0.3);
    hazardCard(1.53, 0.72, -1.21, "pull-up-a-plant", "Pull up a young plant to look at it?", "PULL\nIT", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Stay on the dike with the crew."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Pump crew member", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-pump-crew-calls-a-pause"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-pump-crew-calls-a-pause"].visible = false;
    arrivals["the-crew-lead-asks-about-the-roots"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-the-roots"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "plant-a-grass-clump-on-the") { const s = spots["lkm-edge-spot"]; tokens["lkm-grass-clump"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-what-you-saw-at-each") repaint(boards["lkm-marsh-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Marsh recorded"], "#59c97b"));
        if (step.id === "compare-notes-with-another-group") repaint(boards["lkm-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Notes compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["lkm-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-how-the-new-marsh-helps") paintGuide("New mud, new grass, new marsh.");
      },

      onHazard() {
        paintGuide("Stop. The new mud is soft.");
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
        if (it.id === "the-pump-crew-calls-a-pause") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class stepped back, the pipe moved. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-the-roots") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Roots explained. The lesson carries on."); }
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
