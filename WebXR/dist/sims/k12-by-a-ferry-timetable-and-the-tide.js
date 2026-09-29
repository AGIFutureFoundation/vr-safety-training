import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — A Ferry Timetable and the Tide. Lower-secondary maths at the Canal Street Ferry Landing in Orleans Parish: a ferry timetable read as departures on both banks, the crossing time found by subtraction, a round trip planned with a wait, and the water-level board read to see why the landing ramp is raised or lowered, using only the times and marks the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_A_FERRY_TIMETABLE_AND_THE_TIDE = {
  id: "k12-by-a-ferry-timetable-and-the-tide",
  index: "836",
  domain: "Education",
  trade: "Maths class at the ferry landing with the ferry mate — learner and ferry deck mate",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "A Ferry Timetable and the Tide",
  title: simTitle("A Ferry Timetable and the Tide"),
  tagline: "Depart, cross, arrive, return — and the water level tells the mate where to set the ramp",
  accent: 0x3e7fa6,
  accentCss: "#3e7fa6",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"crossing-planner","name":"Crossing Planner","note":"Read departures from both banks, found the crossing time, planned a round trip and matched the ramp to the water-level board"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Crossing Board",
    currency: "CROSSINGS",
    ranks: ["Passenger","Reader","Planner","Deckhand","Mate"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-the-landing-board-tells") },
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
    "mix-up-the-banks": "You read your return time from the column for the bank you started on. A ferry timetable has one column for each bank. To come back, you read the departures from the far bank, after the time you arrive there.",
    "no-time-to-board": "You planned to catch a return that leaves the minute you arrive. Passengers walk off first and the next group walks on after, so a round trip needs a wait. Pick a return that leaves after a sensible gap.",
    "level-never-changes": "You said the water level never changes. It rises and falls with the river and the weather, and at the coast with the tide. That is why the landing has a ramp the crew can raise or lower, so boarding is always level and safe.",
    "board-before-the-signal": "You started down the ramp before the mate's signal. The crew must tie the ferry, set the ramp and let passengers off first. Waiting for the wave keeps the ramp clear and everyone steady."
  },

  lateNotes: {
    "byt-crossing-log": "The round-trip record is written once the plan is made — nothing to record yet.",
    "byt-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-what-the-landing-board-tells",
      kind: "find",
      noHint: true,
      targets: [
        "byt-this-bank",
        "byt-far-bank",
        "byt-level"
      ],
      itemNames: {
        "byt-this-bank": "departures from this bank",
        "byt-far-bank": "departures from the far bank",
        "byt-level": "the water-level board"
      },
      itemNotes: {
        "byt-this-bank": "When the ferry leaves here.",
        "byt-far-bank": "When it leaves to come back.",
        "byt-level": "It tells the crew where to set the ramp."
      },
      decoyNotes: {
        "byt-map": "Handy for finding the landing, but it holds no ferry times."
      },
      title: "Find what the landing board tells you",
      cue: "Mark the three things on the landing board a passenger needs to plan a crossing.",
      why: "The landing board holds more than one kind of information. The departures from this bank tell you when to board, the departures from the far bank tell you when you can come back, and the water-level board tells the crew how to set the ramp. Reading all three is how a passenger and a mate plan the same crossing."
    },
    {
      id: "wait-in-the-passenger-line",
      kind: "select",
      target: "byt-line-card",
      title: "Wait in the passenger line",
      cue: "Join the passenger line behind the gate before the ferry comes in.",
      why: "The passenger line keeps the landing orderly: people coming off the ferry have a clear path, and people waiting are away from the edge. Joining the line first also means you can read the board calmly while you wait. The crew relies on everyone keeping to the line on every crossing."
    },
    {
      id: "put-the-round-trip-plan-in",
      kind: "sequence",
      targets: [
        "byt-ord-depart",
        "byt-ord-arrive",
        "byt-ord-wait",
        "byt-ord-return"
      ],
      itemNames: {
        "byt-ord-depart": "1 · pick your departure",
        "byt-ord-arrive": "2 · work out when it arrives",
        "byt-ord-wait": "3 · add a sensible wait",
        "byt-ord-return": "4 · pick a return from the far bank"
      },
      title: "Put the round-trip plan in order",
      cue: "Pick a departure, find when it arrives, add a wait, then pick a return from the far bank.",
      why: "A round trip is two timetable readings joined by a wait. Picking the outward trip first, then working out its arrival, tells you the earliest you could come back. Adding a sensible wait and then choosing a return from the far bank's column gives a plan that actually works on the day.",
      outOfOrderNote: "Out of order. Choose your outward departure before you look for a return."
    },
    {
      id: "hold-the-rail-on-the-ramp",
      kind: "hold",
      target: "byt-ramp-rail",
      seconds: 6,
      title: "Hold the rail on the ramp",
      cue: "Hold the ramp's handrail as you walk down, until you are standing on the deck.",
      why: "A ferry moves a little even when it is tied up, and the ramp can be wet. Holding the handrail all the way down keeps you steady. Deckhands hold on in the same places every time; it is not about being unsure, it is about staying safe as a habit.",
      holdBreakNote: "You let go of the rail halfway down the ramp. Hold on again until you reach the deck."
    },
    {
      id: "choose-the-crossing-time",
      kind: "select",
      target: "byt-crossing-card",
      title: "Choose the crossing time",
      cue: "Choose the crossing time you get by taking the departure away from the arrival.",
      why: "The crossing time is the arrival time take away the departure time. Working it out, rather than guessing, lets you plan the rest of the day. It also lets you spot when a crossing runs slow, which the mate notes in the log along with the weather and the water level."
    },
    {
      id: "spot-the-problems-in-a-sample",
      kind: "find",
      noHint: true,
      targets: [
        "byt-rt-bank",
        "byt-rt-nogap",
        "byt-rt-guess"
      ],
      itemNames: {
        "byt-rt-bank": "a return read from the wrong bank",
        "byt-rt-nogap": "no wait between arriving and returning",
        "byt-rt-guess": "a crossing time that was guessed"
      },
      itemNotes: {
        "byt-rt-bank": "Use the far bank's column.",
        "byt-rt-nogap": "Leave time to get off and on.",
        "byt-rt-guess": "Subtract the two times."
      },
      decoyNotes: {
        "byt-rt-labels": "Clear labels are good practice. Keep them."
      },
      title: "Spot the problems in a sample round trip",
      cue: "Look at a classmate's round-trip plan and mark each problem.",
      why: "Round-trip plans go wrong in a few familiar ways: a return read from the wrong bank, no time left to get off and back on, or a crossing time that was guessed. Spotting them on someone else's plan trains you to check your own before you head down to the landing."
    },
    {
      id: "set-the-ramp-to-match-the",
      kind: "turn",
      target: "byt-ramp-wheel",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "RAMP"
      },
      title: "Set the ramp to match the water level",
      cue: "Turn the ramp wheel until the ramp meets the deck level shown by the water-level board.",
      why: "When the water is high the deck sits high; when it is low the deck sits low. The mate reads the water-level board and raises or lowers the ramp so it meets the deck gently. A level ramp is easy and safe for walkers, bikes and wheelchairs, which is the whole point of reading the board."
    },
    {
      id: "read-the-water-level-on-the",
      kind: "gauge",
      target: "byt-level-meter",
      gauge: {
        label: "LEVEL",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not on the water line. Read where the surface meets the board."
      },
      title: "Read the water level on the board",
      cue: "Commit when the marker matches the water line on the level board.",
      why: "The level board is a scale fixed at the landing, like a giant ruler standing in the water. Reading where the surface meets it, at eye level, gives the number the crew uses to set the ramp. An accurate reading means the ramp fits the deck first time."
    },
    {
      id: "move-the-level-marker-onto-the",
      kind: "drag",
      target: "byt-level-marker",
      drag: {
        to: "byt-today-spot",
        radius: 0.45,
        missNote: "Not at today yet. Place the marker at today's place on the graph."
      },
      title: "Move the level marker onto the graph",
      cue: "Drag today's level marker onto the landing's water-level graph at today's date.",
      why: "One reading tells you about today. Plotting it on the graph with earlier readings shows the water rising or falling over days and weeks. The crew uses that pattern to plan ramp changes ahead of time, rather than being surprised on the morning of a crossing."
    },
    {
      id: "follow-the-ferry-across-the-river",
      kind: "track",
      target: "byt-ferry-meter",
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
        label: "CROSSING"
      },
      title: "Follow the ferry across the river",
      cue: "Keep the marker on the ferry as it crosses the river on the landing's screen.",
      why: "A ferry does not cross in a straight line; it angles into the current and curves across. Following it shows why the crossing takes the time the timetable says, and why the mate checks the river before each trip. Real journeys are shaped by the water, not just the distance.",
      holdBreakNote: "The marker lost the ferry. Find it again on the screen and follow it across."
    },
    {
      id: "write-your-round-trip-plan-and",
      kind: "select",
      target: "byt-crossing-log",
      doneLine: "Round trip and level recorded",
      title: "Write your round-trip plan and the level",
      cue: "Write your outward trip, crossing time, wait and return, and today's water-level reading.",
      why: "A written plan can be checked and followed without re-reading the whole board. Writing the water level beside it links your plan to the conditions of the day. The mate's log holds the same things, trip times and water level together, so each crew knows what the last one saw."
    },
    {
      id: "check-your-plan-with-the-mate",
      kind: "select",
      target: "byt-share-board",
      doneLine: "Plan checked",
      title: "Check your plan with the mate",
      cue: "Read your plan to the ferry mate and ask if the wait is long enough.",
      why: "The mate knows how long it takes a busy ferry to unload and reload. Checking your wait with someone who does it every day tests your plan against real experience. If the mate suggests a longer wait, you have learned something the timetable alone could not tell you."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byt-checkin",
      doneLine: "Checked in",
      title: "Check in on the landing",
      cue: "What was hardest to plan? How did the water-level board change what the crew did?",
      why: "The ferry crew finishes each shift by passing the log to the next mate, so the class finishes by passing on what it found. Each learner names one part of the round trip and one reason the ramp moves. If anyone mixed up the banks, the group reads the board together once more before leaving the landing."
    }
  ],

  interrupts: [
    {
      id: "the-ferry-arrives-early",
      kind: "Ferry arriving",
      after: "hold-the-rail-on-the-ramp",
      delay: 3,
      seconds: 12,
      target: "byt-stand-back",
      alert: "The ferry ties up and passengers start walking up the ramp towards the group.",
      cue: "Step back behind the gate and leave a clear path for people coming off.",
      why: "People coming off need a clear path first. Stepping back behind the gate keeps the landing calm and lets the crew work. The lesson can pause for a minute; a crowded ramp helps nobody.",
      missNote: "The group stayed at the top of the ramp, and people coming off the ferry had to squeeze past and wait.",
      wrongNote: "That leaves the ramp crowded. Step back behind the gate. Choose the response that deals with it now."
    },
    {
      id: "the-mate-asks-about-the-ramp",
      kind: "Mate question",
      after: "follow-the-ferry-across-the-river",
      delay: 3,
      seconds: 12,
      target: "byt-say-level",
      alert: "The mate asks whether the ramp should go up or down today.",
      cue: "Say whether the level board shows high or low water and which way the ramp goes.",
      why: "Linking the reading to an action is what makes the board useful. High water means a higher deck and a raised ramp; low water means the opposite. Saying it shows you can use a measurement to make a safe decision.",
      missNote: "You could not link the board to the ramp, and the mate had to explain it before the group could go on.",
      wrongNote: "That does not connect the water level to the ramp. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x3e7fa6;
    const CSS = "#3e7fa6";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6c7072", base2: "#5f6365", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#d4e0e6", base2: "#c4d2da", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byt-this-bank", "departures from this bank", {});
    bead(-1.42, 1.18, -0.62, "byt-far-bank", "departures from the far bank", {});
    bead(-1.03, 1.46, -0.71, "byt-level", "the water-level board", {});
    bead(-1.08, 0.9, -1.11, "byt-map", "a city map on the wall", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byt-ord-depart", "1 · pick your departure", {});
    bead(-0.58, 1.46, -1.44, "byt-ord-arrive", "2 · work out when it arrives", {});
    bead(-0.24, 0.9, -1.23, "byt-ord-wait", "3 · add a sensible wait", {});
    bead(0, 1.18, -1.55, "byt-ord-return", "4 · pick a return from the far bank", {});
    bead(0.24, 1.46, -1.23, "byt-ramp-rail", "Hold the handrail", {});
    bead(0.58, 0.9, -1.44, "byt-rt-bank", "a return read from the wrong bank", {});
    bead(0.68, 1.18, -1.05, "byt-rt-nogap", "no wait between arriving and returning", {});
    bead(1.08, 1.46, -1.11, "byt-rt-guess", "a crossing time that was guessed", {});
    bead(1.03, 0.9, -0.71, "byt-rt-labels", "both banks clearly labelled", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byt-stand-back", "Stand back behind the gate for passengers coming off", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byt-say-level", "Say what the water level means for the ramp", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byt-line-card", "Join the line", "PASSENGER\nLINE", { ry: 1.2 });
    dials["byt-ramp-wheel"] = dial(-1.89, -1.4, 0.93, "byt-ramp-wheel", "Ramp height");
    meters["byt-level-meter"] = meter(-1.45, -1.85, 0.67, "byt-level-meter", "Water level");
    tokens["byt-level-marker"] = token(-0.92, -2.16, 0.4, "byt-level-marker", "Today's level marker");
    spots["byt-today-spot"] = spot(-0.31, -2.33, 0.13, "byt-today-spot", "Today on the graph");
    card(0.31, 1.35, -2.33, "byt-crossing-card", "Choose the crossing time", "HOW\nLONG?", { ry: -0.13 });
    meters["byt-ferry-meter"] = meter(0.92, -2.16, -0.4, "byt-ferry-meter", "Ferry followed");
    boards["byt-crossing-log"] = board(1.45, -1.85, -0.67, "byt-crossing-log", "Round-trip record");
    boards["byt-share-board"] = board(1.89, -1.4, -0.93, "byt-share-board", "Check with the mate");
    boards["byt-checkin"] = board(2.19, -0.85, -1.2, "byt-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "mix-up-the-banks", "Read the return time from the same bank's column?", "WRONG\nBANK", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "no-time-to-board", "Plan to catch a return ferry that leaves the moment you land?", "NO\nGAP", 0.3);
    hazardCard(0.58, 0.72, -1.86, "level-never-changes", "Say the water sits at the same level all year at the landing?", "ALWAYS\nSAME?", -0.3);
    hazardCard(1.53, 0.72, -1.21, "board-before-the-signal", "Walk down the ramp before the mate waves you on?", "EARLY\nBOARD", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Depart, cross, wait, return."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Ferry mate", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Ferry deckhand", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-ferry-arrives-early"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-ferry-arrives-early"].visible = false;
    arrivals["the-mate-asks-about-the-ramp"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-mate-asks-about-the-ramp"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-level-marker-onto-the") { const s = spots["byt-today-spot"]; tokens["byt-level-marker"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "write-your-round-trip-plan-and") repaint(boards["byt-crossing-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Round trip and level recorded"], "#59c97b"));
        if (step.id === "check-your-plan-with-the-mate") repaint(boards["byt-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Plan checked"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byt-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "choose-the-crossing-time") paintGuide("Arrival take away departure.");
      },

      onHazard() {
        paintGuide("Stop. Far bank for the return — and wait for the wave.");
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
        if (it.id === "the-ferry-arrives-early") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Clear path left, passengers off. The lesson carries on."); }
        if (it.id === "the-mate-asks-about-the-ramp") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Ramp direction explained from the board. The lesson carries on."); }
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
