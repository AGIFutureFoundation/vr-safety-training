import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Graphing Tide Readings at the Pier. Upper-primary and lower-secondary maths on a pier's viewing deck: reading a tide staff, recording readings with their times, plotting them as a line graph and reading the pattern, using only the readings the scene itself shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_GRAPHING_TIDE_READINGS_AT_THE_PIER = {
  id: "k12-graphing-tide-readings-at-the-pier",
  index: "816",
  domain: "Education",
  trade: "Maths class on the pier's viewing deck — learner and harbour technician",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Graphing Tide Readings at the Pier",
  title: simTitle("Graphing Tide Readings at the Pier"),
  tagline: "Time along the bottom, height up the side — and keep behind the rail while you read the staff",
  accent: 0x5a9fd8,
  accentCss: "#5a9fd8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"rise-and-fall","name":"Rise and Fall","note":"Tide readings taken from the staff, plotted on labelled axes and the pattern described from the graph"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Tide Board",
    currency: "READINGS",
    ranks: ["Watcher","Reader","Recorder","Plotter","Hydrographer"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-the-tide-staff-shows") },
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
    "time-up-the-side": "You put time up the side and height along the bottom. Time is what you chose to measure at, so it goes along the bottom; the height is what you found, so it goes up the side. Swapped axes turn a rising tide into a picture nobody can read.",
    "uneven-axis-steps": "You spaced the marks on the axis unevenly to make the points fit. Each step along an axis must stand for the same amount, or the graph's shape lies: a steady rise can look like a sudden jump and a jump can look like nothing at all.",
    "lean-over-the-rail": "You leaned over the pier rail to see the staff better. The rail is there because the drop to the water is dangerous; the technician's camera feed on the bench shows the staff close up, and you read it from behind the rail.",
    "join-dots-as-straight-rule": "You said the tide will keep rising along the same straight line. Your graph shows only the readings you took; a tide rises and falls again, and a line drawn past your last reading is a guess, not a finding."
  },

  lateNotes: {
    "ktp-tide-log": "The tide record is written once every reading is plotted — nothing to record yet.",
    "ktp-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-what-the-tide-staff-shows",
      kind: "find",
      noHint: true,
      targets: [
        "ktp-waterline",
        "ktp-scale-unit",
        "ktp-clock"
      ],
      itemNames: {
        "ktp-waterline": "where the water meets the scale",
        "ktp-scale-unit": "the unit the staff is marked in",
        "ktp-clock": "the time on the pier clock"
      },
      itemNotes: {
        "ktp-waterline": "Read at the water surface, looking level, not from above.",
        "ktp-scale-unit": "Write it beside every reading.",
        "ktp-clock": "Every reading needs its time, or it cannot be plotted."
      },
      decoyNotes: {
        "ktp-gull": "Nice to watch, but it is not part of the reading."
      },
      title: "Find what the tide staff shows",
      cue: "Mark the three things you need before taking a reading from the tide staff.",
      why: "A tide staff is a tall ruler fixed in the water, and a reading means nothing without three things: where the water surface meets the scale, what unit the scale is marked in, and the time you read it. Taking all three together is what turns looking at the water into data you can plot."
    },
    {
      id: "put-the-graphing-method-in-order",
      kind: "sequence",
      targets: [
        "ktp-ord-table",
        "ktp-ord-axes",
        "ktp-ord-scale",
        "ktp-ord-plot"
      ],
      itemNames: {
        "ktp-ord-table": "1 · record each reading with its time",
        "ktp-ord-axes": "2 · draw and label both axes",
        "ktp-ord-scale": "3 · choose an even scale",
        "ktp-ord-plot": "4 · plot each reading as a point"
      },
      title: "Put the graphing method in order",
      cue: "Record the readings, draw the axes, choose an even scale, then plot the points.",
      why: "Recording the readings first, in a table with their times, means the graph is drawn from data and not from memory. Drawing and labelling the axes, choosing an even scale that fits the smallest and largest readings, and only then plotting each point keeps every point honest and the shape true.",
      outOfOrderNote: "Out of order. Record the readings in a table before you draw anything."
    },
    {
      id: "take-your-place-behind-the-rail",
      kind: "select",
      target: "ktp-rail-card",
      title: "Take your place behind the rail",
      cue: "Stand at the viewing rail before the technician switches on the staff camera.",
      why: "A pier is a working edge above deep water, and the rail marks where visitors stop. Taking your place behind it first means the whole lesson can happen without anyone near the drop, which is the same habit harbour workers keep when they work to the edge only with the right equipment."
    },
    {
      id: "turn-the-graph-to-the-right",
      kind: "turn",
      target: "ktp-axis-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "AXES"
      },
      title: "Turn the graph to the right way round",
      cue: "Turn the axis dial until time runs along the bottom and height runs up the side.",
      why: "By agreement, the thing you choose to measure at goes along the bottom and the thing you find goes up the side. Following that agreement means anyone who picks up your graph reads it the right way first time, which is why every scientist and engineer draws time along the bottom."
    },
    {
      id: "plot-the-latest-reading-at-the",
      kind: "gauge",
      target: "ktp-plot-meter",
      gauge: {
        label: "HEIGHT",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Off the reading. Go straight up from the time to the height in your table."
      },
      title: "Plot the latest reading at the right height",
      cue: "Commit when the point sits exactly at the height the latest reading shows.",
      why: "Plotting means finding the time along the bottom, going straight up to the reading's height, and marking there. Stopping exactly at the height the table shows, not roughly near it, is what keeps the line honest when the points are joined."
    },
    {
      id: "read-the-staff-at-eye-level",
      kind: "hold",
      target: "ktp-eye-level",
      seconds: 6,
      title: "Read the staff at eye level",
      cue: "Hold your view level with the waterline on the camera feed until the ripples settle.",
      why: "Looking at a scale from above or below makes the reading seem higher or lower than it is, which is called parallax. Holding your eye level with the waterline and waiting for the ripples to settle gives a reading that another person would agree with, and that is what makes data trustworthy.",
      holdBreakNote: "The view tilted and the reading jumped. Look level again and let the ripples settle."
    },
    {
      id: "place-the-point-at-its-time",
      kind: "drag",
      target: "ktp-time-marker",
      drag: {
        to: "ktp-time-spot",
        radius: 0.45,
        missNote: "Not at its time yet. Slide it along the bottom to the time in the table."
      },
      title: "Place the point at its time",
      cue: "Drag the marker along the bottom to the time the reading was taken.",
      why: "A point sits where its time and its height meet. Placing it at the time the reading was actually taken, not at the next free space, keeps the gaps between readings true, so that a graph with readings taken at uneven times still shows the tide's real shape."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "ktp-gr-no-label",
        "ktp-gr-uneven",
        "ktp-gr-wrong-time"
      ],
      itemNames: {
        "ktp-gr-no-label": "an axis with no label",
        "ktp-gr-uneven": "axis steps that are not even",
        "ktp-gr-wrong-time": "a point at the wrong time"
      },
      itemNotes: {
        "ktp-gr-no-label": "Name the axis and its unit.",
        "ktp-gr-uneven": "Every step stands for the same amount.",
        "ktp-gr-wrong-time": "Check each point against the table."
      },
      decoyNotes: {
        "ktp-gr-title": "A clear title is good practice. Keep it."
      },
      title: "Spot the problems in a classmate's tide graph",
      cue: "Look at the draft graph and mark each problem.",
      why: "Line graphs go wrong in a few familiar ways: an axis with no label, a scale whose steps are not even, and a point plotted at the wrong time. Spotting them on someone else's graph trains the eye that checks your own before it is shared."
    },
    {
      id: "say-what-the-graph-shows",
      kind: "select",
      target: "ktp-compare-card",
      title: "Say what the graph shows",
      cue: "Say whether the tide was rising or falling across your readings, and how the graph shows it.",
      why: "A line going up from left to right means the height grew as time went on; going down means it fell. Describing the pattern in words, and pointing to the part of the graph that shows it, is reading a graph rather than just drawing one."
    },
    {
      id: "follow-the-waterline-as-the-tide",
      kind: "track",
      target: "ktp-track-meter",
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
        label: "WATERLINE"
      },
      title: "Follow the waterline as the tide moves",
      cue: "Keep the marker on the waterline as the water moves up and down the staff.",
      why: "Water in a harbour is never perfectly still, and a reading is the level the surface keeps returning to, not one splash. Following the waterline for a while shows why a technician takes the middle of the movement, and why one quick glance can be off.",
      holdBreakNote: "The marker lost the waterline. Follow the surface back and settle on its middle."
    },
    {
      id: "record-the-table-and-the-graph",
      kind: "select",
      target: "ktp-tide-log",
      doneLine: "Table and graph recorded",
      title: "Record the table and the graph",
      cue: "Write each reading with its time and unit, and label the graph's axes and title.",
      why: "The table is the evidence and the graph is the picture of it; keeping both lets anyone check a point against the reading it came from. Labelled axes, units and a title mean the graph still makes sense to someone who was not on the pier when the readings were taken."
    },
    {
      id: "compare-your-graph-with-the-technicians",
      kind: "select",
      target: "ktp-share-board",
      doneLine: "Graphs compared",
      title: "Compare your graph with the technician's",
      cue: "Hold your graph beside the technician's own record and look for differences.",
      why: "Comparing with an independent record is how scientists check their measurements. If both graphs show the same shape, the readings agree; if they differ, you look for the reason, a misread staff or a point at the wrong time, before trusting either one."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "ktp-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the visit",
      cue: "How did the readings and the graph go? What would you change next time?",
      why: "The pier crew closes every shift by reading the day's log back together, so the class does the same with its tide graph. Each learner points to one reading they plotted and says what the curve told them; a puzzled face here is worth more than a tidy chart, because it shows where the graph still needs explaining."
    }
  ],

  interrupts: [
    {
      id: "a-wave-splashes-the-deck",
      kind: "Wet deck",
      after: "read-the-staff-at-eye-level",
      delay: 3,
      seconds: 12,
      target: "ktp-move-back",
      alert: "A boat's wake sends a wave over the lower deck and the boards near the rail are wet.",
      cue: "Move back to the dry part of the deck and tell the technician the boards are wet.",
      why: "Wet boards are slippery, and near a rail a slip is serious. Moving back and telling the technician lets them mark or dry the area; carrying on at the rail because the lesson is going well is how a small hazard becomes a fall.",
      missNote: "Nobody moved back, and a classmate slipped on the wet boards right beside the rail.",
      wrongNote: "That leaves you on the wet boards. Move back and tell the technician. Choose the response that deals with it now."
    },
    {
      id: "the-technician-asks-for-a-reading",
      kind: "Technician question",
      after: "follow-the-waterline-as-the-tide",
      delay: 3,
      seconds: 12,
      target: "ktp-say-reading",
      alert: "The harbour technician asks you to read out the staff as it is now.",
      cue: "Give the reading with its time and its unit.",
      why: "A reading without its time or unit cannot go in anyone's record. Saying all three together is the habit that makes your data usable by the technician, and it is exactly how readings are passed on at a working harbour.",
      missNote: "You gave a bare number with no time or unit, and the technician could not write it in the record.",
      wrongNote: "That misses the time or the unit. Give all three. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x5a9fd8;
    const CSS = "#5a9fd8";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7d7768", base2: "#6f6a5c", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dce4e6", base2: "#ccd6d8", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "ktp-waterline", "where the water meets the scale", {});
    bead(-1.42, 1.18, -0.62, "ktp-scale-unit", "the unit the staff is marked in", {});
    bead(-1.03, 1.46, -0.71, "ktp-clock", "the time on the pier clock", {});
    bead(-1.08, 0.9, -1.11, "ktp-gull", "a gull sitting on the piling", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "ktp-ord-table", "1 · record each reading with its time", {});
    bead(-0.58, 1.46, -1.44, "ktp-ord-axes", "2 · draw and label both axes", {});
    bead(-0.24, 0.9, -1.23, "ktp-ord-scale", "3 · choose an even scale", {});
    bead(0, 1.18, -1.55, "ktp-ord-plot", "4 · plot each reading as a point", {});
    bead(0.24, 1.46, -1.23, "ktp-eye-level", "Eye level with the waterline", {});
    bead(0.58, 0.9, -1.44, "ktp-gr-no-label", "an axis with no label", {});
    bead(0.68, 1.18, -1.05, "ktp-gr-uneven", "axis steps that are not even", {});
    bead(1.08, 1.46, -1.11, "ktp-gr-wrong-time", "a point at the wrong time", {});
    bead(1.03, 0.9, -0.71, "ktp-gr-title", "a clear title at the top", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "ktp-move-back", "Move back to the dry part of the deck", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "ktp-say-reading", "Give the reading with its time and unit", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "ktp-rail-card", "Stand behind the rail", "BEHIND\nTHE RAIL", { ry: 1.2 });
    dials["ktp-axis-dial"] = dial(-1.89, -1.4, 0.93, "ktp-axis-dial", "Axis orientation");
    meters["ktp-plot-meter"] = meter(-1.45, -1.85, 0.67, "ktp-plot-meter", "Point height");
    tokens["ktp-time-marker"] = token(-0.92, -2.16, 0.4, "ktp-time-marker", "Reading marker");
    spots["ktp-time-spot"] = spot(-0.31, -2.33, 0.13, "ktp-time-spot", "The reading's time");
    card(0.31, 1.35, -2.33, "ktp-compare-card", "Read the pattern", "RISING OR\nFALLING?", { ry: -0.13 });
    meters["ktp-track-meter"] = meter(0.92, -2.16, -0.4, "ktp-track-meter", "Waterline followed");
    boards["ktp-tide-log"] = board(1.45, -1.85, -0.67, "ktp-tide-log", "Tide record");
    boards["ktp-share-board"] = board(1.89, -1.4, -0.93, "ktp-share-board", "Compare with the technician");
    boards["ktp-checkin"] = board(2.19, -0.85, -1.2, "ktp-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "time-up-the-side", "Put time up the side and height along the bottom?", "AXES\nSWAPPED", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "uneven-axis-steps", "Space the axis marks however they fit?", "UNEVEN\nSCALE", 0.3);
    hazardCard(0.58, 0.72, -1.86, "lean-over-the-rail", "Lean over the rail to read the staff closer?", "LEAN\nOVER", -0.3);
    hazardCard(1.53, 0.72, -1.21, "join-dots-as-straight-rule", "Say the tide will keep rising in a straight line?", "STRAIGHT\nFOREVER", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Time along, height up."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Maths teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Harbour technician", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Deckhand", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-wave-splashes-the-deck"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-wave-splashes-the-deck"].visible = false;
    arrivals["the-technician-asks-for-a-reading"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-technician-asks-for-a-reading"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-point-at-its-time") { const s = spots["ktp-time-spot"]; tokens["ktp-time-marker"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-table-and-the-graph") repaint(boards["ktp-tide-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Table and graph recorded"], "#59c97b"));
        if (step.id === "compare-your-graph-with-the-technicians") repaint(boards["ktp-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Graphs compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["ktp-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-the-graph-shows") paintGuide("Up to the right: the tide is rising.");
      },

      onHazard() {
        paintGuide("Stop. Are the axes the right way round, with even steps?");
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
        if (it.id === "a-wave-splashes-the-deck") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group moved back, wet boards coned off. The lesson carries on."); }
        if (it.id === "the-technician-asks-for-a-reading") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Reading given with its time and unit. It goes in the record."); }
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
