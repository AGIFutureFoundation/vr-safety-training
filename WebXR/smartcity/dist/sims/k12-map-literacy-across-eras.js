import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Map Literacy Across Eras. Upper-primary and lower-secondary history at a civic centre's archive room: reading maps from different eras as sources, finding the key, scale and orientation, asking who made a map and why, and comparing old and new maps of the same place. Every map in the scene is fictional and labelled as the lesson's own archive.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_MAP_LITERACY_ACROSS_ERAS = {
  id: "k12-map-literacy-across-eras",
  index: "825",
  domain: "Education",
  trade: "History class in the civic centre's archive room — learner and archivist",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Map Literacy Across Eras",
  title: simTitle("Map Literacy Across Eras"),
  tagline: "Every map was made by someone, for a reason — find the key, the scale and the north first",
  accent: 0xc08a4a,
  accentCss: "#c08a4a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"map-reader","name":"Map Reader","note":"Maps from different eras read for key, scale and orientation, their makers' purposes asked and changes compared"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Map Board",
    currency: "MAPS",
    ranks: ["Browser","Reader","Comparer","Map Historian","Archivist"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-key-the-scale-and") },
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
    "north-is-always-up": "You assumed north was at the top of the old map. Many older maps put another direction at the top, depending on who made them and why; always find the map's own orientation mark before you read directions from it.",
    "a-map-is-neutral": "You said a map just shows what is there. Every map is made by someone for a reason, and they choose what to include, what to leave out and what to make big; reading a map as a source means asking who made it and why.",
    "touch-the-map-surface": "You traced the route on the old map with your finger. Skin oils damage old paper and ink; in the archive you use the pointer and the clear overlay, and the archivist handles the originals.",
    "old-map-is-wrong": "You said the old map is wrong because it differs from the new one. The place may have changed, the mapmaker may have had different tools or purposes, or both; differences are evidence to explain, not mistakes to dismiss."
  },

  lateNotes: {
    "kml-map-log": "The comparison is written once both maps are read — nothing to record yet.",
    "kml-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-key-the-scale-and",
      kind: "find",
      noHint: true,
      targets: [
        "kml-key",
        "kml-scale",
        "kml-orientation"
      ],
      itemNames: {
        "kml-key": "the map's key",
        "kml-scale": "the scale bar",
        "kml-orientation": "the orientation mark"
      },
      itemNotes: {
        "kml-key": "It explains what each symbol means.",
        "kml-scale": "It links map distance to real distance.",
        "kml-orientation": "It shows which direction is at the top."
      },
      decoyNotes: {
        "kml-decoration": "Beautiful, and it may tell you about the maker, but it does not help you read distances."
      },
      title: "Find the key, the scale and the orientation",
      cue: "Mark the three things on the map you read before anything else.",
      why: "Every map has three things that tell you how to read it: a key that explains its symbols, a scale that links distances on paper to distances on the ground, and an orientation mark that shows which way is which. Reading those three first, on any map from any era, stops you misreading everything else."
    },
    {
      id: "follow-the-archives-handling-rules",
      kind: "select",
      target: "kml-archive-card",
      title: "Follow the archive's handling rules",
      cue: "Read the card: no touching originals, use the pointer and the overlay.",
      why: "Old maps are fragile and some exist only once. Using the pointer and the clear overlay instead of fingers protects them from skin oils and tears, and it is how every archive keeps its collection readable for future learners."
    },
    {
      id: "put-the-map-reading-in-order",
      kind: "sequence",
      targets: [
        "kml-ord-label",
        "kml-ord-key",
        "kml-ord-orient",
        "kml-ord-read"
      ],
      itemNames: {
        "kml-ord-label": "1 · read who made it, when and why",
        "kml-ord-key": "2 · find the key and scale",
        "kml-ord-orient": "3 · find the orientation",
        "kml-ord-read": "4 · read routes and places"
      },
      title: "Put the map reading in order",
      cue: "Read the label, find the key and scale, find the orientation, then read the map.",
      why: "The label tells you who made the map, when and for what, which frames everything else. Key, scale and orientation then tell you how to read it, and only then do you read routes and places. The same order works on a fictional old map, a modern street plan or a satellite image.",
      outOfOrderNote: "Out of order. Read the label and the key before you read routes."
    },
    {
      id: "hold-the-overlay-still-on-the",
      kind: "hold",
      target: "kml-overlay-hold",
      seconds: 6,
      title: "Hold the overlay still on the map",
      cue: "Hold the clear overlay steady over the old map while you trace the route on it.",
      why: "The overlay lets you mark without touching the original, but only if it stays still. Holding it steady while you trace means your marks line up with the map, and the original stays untouched.",
      holdBreakNote: "The overlay slipped and the trace no longer lines up. Set it back and hold it."
    },
    {
      id: "turn-the-old-map-to-match",
      kind: "turn",
      target: "kml-rotate-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "ORIENT"
      },
      title: "Turn the old map to match the new one",
      cue: "Turn the old map until its orientation matches the modern map beside it.",
      why: "Comparing two maps only works if they face the same way. Turning the old map to match the new one's orientation lines up the coast, roads and rivers, so real changes stand out instead of being hidden by a turned page."
    },
    {
      id: "use-the-scale-to-estimate-a",
      kind: "gauge",
      target: "kml-scale-meter",
      gauge: {
        label: "SCALE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not matched to the scale bar. Set the dividers against it again."
      },
      title: "Use the scale to estimate a distance",
      cue: "Commit when the dividers match the scale bar for the distance you are measuring.",
      why: "Setting the dividers against the scale bar turns a gap on paper into a distance on the ground. Checking against the scale each time, rather than guessing, lets you compare the same route on maps drawn at different scales."
    },
    {
      id: "match-the-old-landmark-to-the",
      kind: "drag",
      target: "kml-harbour-token",
      drag: {
        to: "kml-harbour-spot",
        radius: 0.45,
        missNote: "Not matched yet. Find the same stretch of coast on the modern map."
      },
      title: "Match the old landmark to the new map",
      cue: "Drag the old map's harbour marker to the same place on the modern map.",
      why: "Finding the same landmark on both maps anchors the comparison. Once one place is matched, you can see what moved, grew or disappeared around it, which is how historians use maps to study change over time."
    },
    {
      id: "say-why-the-maker-drew-it",
      kind: "select",
      target: "kml-compare-card",
      title: "Say why the maker drew it this way",
      cue: "Say one reason the old map's maker might have shown some places large and left others out.",
      why: "A map made for sailors shows harbours and shoals; one made for landowners shows boundaries. Asking why a maker chose what to show is reading a map as a source, and it reveals as much about the maker as about the place."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "kml-cm-north",
        "kml-cm-wrong",
        "kml-cm-maker"
      ],
      itemNames: {
        "kml-cm-north": "north assumed to be at the top",
        "kml-cm-wrong": "the old map called wrong",
        "kml-cm-maker": "no mention of who made the map"
      },
      itemNotes: {
        "kml-cm-north": "Find each map's own orientation.",
        "kml-cm-wrong": "Differences are evidence to explain.",
        "kml-cm-maker": "Ask who made it and why."
      },
      decoyNotes: {
        "kml-cm-labels": "Clear labels are good practice. Keep them."
      },
      title: "Spot the problems in a classmate's comparison",
      cue: "Look at the draft map comparison and mark each problem.",
      why: "Map comparisons go wrong in familiar ways: north assumed to be at the top, an old map called wrong because it differs, and no mention of who made the map. Spotting them helps you write comparisons that treat maps as the sources they are."
    },
    {
      id: "follow-the-old-road-across-both",
      kind: "track",
      target: "kml-track-meter",
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
        label: "ROAD"
      },
      title: "Follow the old road across both maps",
      cue: "Keep the pointer on the old road as it crosses from the old map to the new.",
      why: "Following one road across two eras shows which stretches survived, which were straightened and which vanished. Tracing it carefully, without jumping to where you expect it to go, keeps your comparison based on what the maps actually show.",
      holdBreakNote: "The pointer left the road. Find it again and follow it."
    },
    {
      id: "record-the-comparison",
      kind: "select",
      target: "kml-map-log",
      doneLine: "Comparison recorded",
      title: "Record the comparison",
      cue: "Write each map's maker, purpose, orientation and the changes you found.",
      why: "A written comparison that names each map's maker and purpose shows why they differ, not just that they do. It is the kind of record another historian can check against the maps themselves."
    },
    {
      id: "return-the-maps-to-the-archivist",
      kind: "select",
      target: "kml-share-board",
      doneLine: "Maps returned",
      title: "Return the maps to the archivist",
      cue: "Hand the overlays back and let the archivist return the originals.",
      why: "Returning maps properly, with the archivist handling the originals, keeps the collection in order and undamaged. It finishes the lesson the way every archive visit should end, with the sources safe for the next reader."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kml-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the visit",
      cue: "What surprised you about how the place changed? What was hard to read?",
      why: "A check-in gives learners a moment to say what surprised them about the change over time, and lets the teacher hear which map skills need more practice. It is not marked, and a trusted adult is there if anyone wants to talk."
    }
  ],

  interrupts: [
    {
      id: "a-drink-appears-on-the-table",
      kind: "Archive rule",
      after: "hold-the-overlay-still-on-the",
      delay: 3,
      seconds: 12,
      target: "kml-move-drink",
      alert: "A visitor sets an open drink down on the archive table beside an old map.",
      cue: "Politely ask for the drink to be taken outside and tell the archivist.",
      why: "One spill can ruin an old map for ever, which is why archives ban drinks at the table. Asking politely and telling the archivist protects the sources without anyone needing to feel told off.",
      missNote: "The drink stayed, was knocked over, and an old map was stained.",
      wrongNote: "That leaves the drink by the maps. Choose the response that deals with it now."
    },
    {
      id: "the-archivist-asks-which-way",
      kind: "Archivist question",
      after: "follow-the-old-road-across-both",
      delay: 3,
      seconds: 12,
      target: "kml-say-orientation",
      alert: "The archivist asks how you know which way the old map faces.",
      cue: "Point to the orientation mark and say which direction is at the top.",
      why: "The archivist is checking you read the map's own mark rather than assuming. Pointing to it shows the habit that keeps every direction you read from the map correct.",
      missNote: "You said north is always up, and the archivist showed you the mark pointing elsewhere.",
      wrongNote: "That assumes instead of reading the mark. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0xc08a4a;
    const CSS = "#c08a4a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#78726a", base2: "#6a645c", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#ece4d4", base2: "#ded6c4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "kml-key", "the map's key", {});
    bead(-1.42, 1.18, -0.62, "kml-scale", "the scale bar", {});
    bead(-1.03, 1.46, -0.71, "kml-orientation", "the orientation mark", {});
    bead(-1.08, 0.9, -1.11, "kml-decoration", "the decorated border", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kml-ord-label", "1 · read who made it, when and why", {});
    bead(-0.58, 1.46, -1.44, "kml-ord-key", "2 · find the key and scale", {});
    bead(-0.24, 0.9, -1.23, "kml-ord-orient", "3 · find the orientation", {});
    bead(0, 1.18, -1.55, "kml-ord-read", "4 · read routes and places", {});
    bead(0.24, 1.46, -1.23, "kml-overlay-hold", "Overlay held steady", {});
    bead(0.58, 0.9, -1.44, "kml-cm-north", "north assumed to be at the top", {});
    bead(0.68, 1.18, -1.05, "kml-cm-wrong", "the old map called wrong", {});
    bead(1.08, 1.46, -1.11, "kml-cm-maker", "no mention of who made the map", {});
    bead(1.03, 0.9, -0.71, "kml-cm-labels", "both maps clearly labelled", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kml-move-drink", "Ask for the drink to go outside", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kml-say-orientation", "Show how you found the orientation", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kml-archive-card", "Pointer and overlay only", "NO\nTOUCHING", { ry: 1.2 });
    dials["kml-rotate-dial"] = dial(-1.89, -1.4, 0.93, "kml-rotate-dial", "Rotate the old map");
    meters["kml-scale-meter"] = meter(-1.45, -1.85, 0.67, "kml-scale-meter", "Dividers on the scale");
    tokens["kml-harbour-token"] = token(-0.92, -2.16, 0.4, "kml-harbour-token", "Old harbour marker");
    spots["kml-harbour-spot"] = spot(-0.31, -2.33, 0.13, "kml-harbour-spot", "Same place today");
    card(0.31, 1.35, -2.33, "kml-compare-card", "Who made it, and why?", "WHO AND\nWHY?", { ry: -0.13 });
    meters["kml-track-meter"] = meter(0.92, -2.16, -0.4, "kml-track-meter", "Road followed");
    boards["kml-map-log"] = board(1.45, -1.85, -0.67, "kml-map-log", "Comparison record");
    boards["kml-share-board"] = board(1.89, -1.4, -0.93, "kml-share-board", "Return to the archivist");
    boards["kml-checkin"] = board(2.19, -0.85, -1.2, "kml-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "north-is-always-up", "Assume north is at the top of the old map?", "NORTH\nIS UP?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "a-map-is-neutral", "Say a map just shows what is there?", "JUST\nSHOWS IT", 0.3);
    hazardCard(0.58, 0.72, -1.86, "touch-the-map-surface", "Trace the old route with your finger?", "TRACE IT\nBY HAND", -0.3);
    hazardCard(1.53, 0.72, -1.21, "old-map-is-wrong", "Say the old map is wrong because it differs?", "OLD =\nWRONG", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Key, scale, orientation."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "History teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Archivist", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Visitor", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-drink-appears-on-the-table"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-drink-appears-on-the-table"].visible = false;
    arrivals["the-archivist-asks-which-way"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-archivist-asks-which-way"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "match-the-old-landmark-to-the") { const s = spots["kml-harbour-spot"]; tokens["kml-harbour-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-comparison") repaint(boards["kml-map-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Comparison recorded"], "#59c97b"));
        if (step.id === "return-the-maps-to-the-archivist") repaint(boards["kml-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Maps returned"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kml-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-the-maker-drew-it") paintGuide("Every map has a maker and a purpose.");
      },

      onHazard() {
        paintGuide("Stop. Which way does this map face? Who made it?");
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
        if (it.id === "a-drink-appears-on-the-table") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Drink taken outside, archivist thanked you. The lesson carries on."); }
        if (it.id === "the-archivist-asks-which-way") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Orientation mark found. The archivist agrees."); }
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
