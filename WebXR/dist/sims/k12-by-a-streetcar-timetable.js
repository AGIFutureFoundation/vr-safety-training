import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — A Streetcar Timetable. Upper-primary maths at the Streetcar Barn and Shops in Orleans Parish: a timetable as a table of stops and trips, reading across a row and down a column, finding the gap between departures by subtracting times, and planning a trip that arrives before you need to be there, using only the times the timetable in the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_A_STREETCAR_TIMETABLE = {
  id: "k12-by-a-streetcar-timetable",
  index: "835",
  domain: "Education",
  trade: "Maths class at the streetcar barn with a transit dispatcher — learner and streetcar dispatcher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "A Streetcar Timetable",
  title: simTitle("A Streetcar Timetable"),
  tagline: "Stops down the side, trips across the top — read the right column, then count the gap",
  accent: 0xb8503a,
  accentCss: "#b8503a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"timetable-reader","name":"Timetable Reader","note":"Read a streetcar timetable by row and column, found the gap between trips and planned a journey that arrives on time"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Timetable Board",
    currency: "TRIPS",
    ranks: ["Rider","Reader","Planner","Conductor","Dispatcher"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-the-timetable") },
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
    "read-the-wrong-column": "You read the time from the next column along. Each column is a different trip, so the time you found belongs to another streetcar. Put a finger on your trip at the top and slide straight down to your stop.",
    "count-stops-not-time": "You counted the stops to find the journey time. Stops are not evenly spaced, so some take longer to reach than others. The journey time is the arrival time take away the departure time, both read from the same column.",
    "arrive-just-in-time": "You picked the trip that arrives exactly as school starts. Traffic and busy stops can slow a streetcar a little, so planners pick the trip before, which leaves time to walk in calmly. Arriving early beats arriving in a rush.",
    "cross-behind-the-car": "You stepped onto the tracks behind a stopped streetcar. Another car or a vehicle can come the other way where you cannot see it. Cross at the marked crossing, look both ways along the tracks and wait until it is clear."
  },

  lateNotes: {
    "bys-trip-log": "The trip plan is written once the trip is chosen — nothing to record yet.",
    "bys-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-parts-of-the-timetable",
      kind: "find",
      noHint: true,
      targets: [
        "bys-stops",
        "bys-trips",
        "bys-cell"
      ],
      itemNames: {
        "bys-stops": "the list of stops down the side",
        "bys-trips": "the trips across the top",
        "bys-cell": "a time where a row meets a column"
      },
      itemNotes: {
        "bys-stops": "Each row is a stop.",
        "bys-trips": "Each column is one streetcar's run.",
        "bys-cell": "That is when that trip reaches that stop."
      },
      decoyNotes: {
        "bys-logo": "It names the service, but it does not tell you any times."
      },
      title: "Find the parts of the timetable",
      cue: "Mark the three parts of the timetable you need to read any trip.",
      why: "A timetable is a table with a job. The list of stops runs down the side, each trip is a column across the top, and where a row meets a column you find a time. Knowing those three parts lets you read any timetable, for a streetcar, a ferry or a bus, anywhere you go."
    },
    {
      id: "wait-behind-the-platform-line",
      kind: "select",
      target: "bys-line-card",
      title: "Wait behind the platform line",
      cue: "Take your place behind the painted line on the barn's visitor platform.",
      why: "Streetcars move in and out of the barn, and the painted line shows where visitors stand. From behind it you can read the big timetable board and watch the cars without being in their way. Riders keep behind the line at every stop for the same reason."
    },
    {
      id: "put-the-trip-planning-steps-in",
      kind: "sequence",
      targets: [
        "bys-ord-stop",
        "bys-ord-arrive",
        "bys-ord-pick",
        "bys-ord-leave"
      ],
      itemNames: {
        "bys-ord-stop": "1 · find your stop's row",
        "bys-ord-arrive": "2 · note when you must arrive",
        "bys-ord-pick": "3 · pick a trip that arrives before then",
        "bys-ord-leave": "4 · read that trip's departure time"
      },
      title: "Put the trip-planning steps in order",
      cue: "Find your stop, find when you must arrive, pick the trip that arrives before then, then read its departure time.",
      why: "Planning a trip works backwards from when you need to be there. Finding your stop first tells you which row to read. Knowing your arrival time tells you which trips are early enough. Picking the trip and then reading its departure tells you when to leave home. That order stops you guessing.",
      outOfOrderNote: "Out of order. Find your stop on the timetable before you choose a trip."
    },
    {
      id: "keep-your-finger-on-the-column",
      kind: "hold",
      target: "bys-finger",
      seconds: 6,
      title: "Keep your finger on the column",
      cue: "Hold your finger on your trip's column while you slide down to your stop.",
      why: "Timetables are packed with numbers, and it is easy for your eye to jump to the next column. Holding your finger on the column as you move down keeps you on the right trip. Dispatchers use a ruler or a highlighter on big timetables for exactly the same reason.",
      holdBreakNote: "Your finger slipped to the next column. Go back to your trip and slide down again."
    },
    {
      id: "turn-the-clock-face-to-the",
      kind: "turn",
      target: "bys-clock-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "CLOCK"
      },
      title: "Turn the clock face to the departure time",
      cue: "Turn the clock dial until its hands show the departure time from the timetable.",
      why: "Timetables write times as numbers, but many clocks show them with hands. Turning the clock to match the timetable links the two ways of showing time. Being able to read both means you can check a platform clock and know at a glance whether your streetcar is coming soon."
    },
    {
      id: "find-the-gap-between-two-trips",
      kind: "gauge",
      target: "bys-gap-meter",
      gauge: {
        label: "GAP",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not the gap yet. Take the earlier time away from the later time.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Find the gap between two trips",
      cue: "Commit when the marker shows the gap between your trip and the next one on the board.",
      why: "The gap between trips is the later time take away the earlier one. It tells you how long you would wait if you just missed your streetcar. Knowing the gap helps you plan calmly: if the next one is soon you wait, and if it is a long gap you leave home earlier."
    },
    {
      id: "place-the-token-on-your-stop",
      kind: "drag",
      target: "bys-token",
      drag: {
        to: "bys-my-stop",
        radius: 0.45,
        missNote: "The token is not on your stop yet. Find its name on the route map."
      },
      title: "Place the token on your stop",
      cue: "Drag the rider token to your stop on the route map beside the timetable.",
      why: "The route map and the timetable show the same stops in two ways: as places along a line and as rows in a table. Placing your token on the map, then finding the same stop in the table, links the picture to the numbers. That is how a rider knows both where and when."
    },
    {
      id: "choose-the-trip-that-gets-you",
      kind: "select",
      target: "bys-trip-card",
      title: "Choose the trip that gets you there on time",
      cue: "Choose the trip that arrives before school starts, with time to walk in.",
      why: "Several trips might reach your stop, but only some arrive early enough. Choosing the one that arrives a little before you need to be there leaves room for a busy stop or a slow corner. Good planners always leave a little spare time, whether for a streetcar, a ferry or a family trip."
    },
    {
      id: "spot-the-mistakes-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "bys-pl-column",
        "bys-pl-count",
        "bys-pl-late"
      ],
      itemNames: {
        "bys-pl-column": "a time from the wrong column",
        "bys-pl-count": "a journey time found by counting stops",
        "bys-pl-late": "a trip that arrives after school starts"
      },
      itemNotes: {
        "bys-pl-column": "Slide straight down your trip's column.",
        "bys-pl-count": "Subtract the two times instead.",
        "bys-pl-late": "Pick an earlier trip."
      },
      decoyNotes: {
        "bys-pl-name": "Writing the stop name is good practice. Keep it."
      },
      title: "Spot the mistakes in a classmate's plan",
      cue: "Look at the sample trip plan and mark each mistake.",
      why: "Trip plans usually go wrong in a few familiar ways: a time read from the wrong column, a journey worked out by counting stops, or a trip that arrives too late. Spotting them in someone else's plan trains you to check your own before you rely on it."
    },
    {
      id: "follow-the-streetcar-along-the-route",
      kind: "track",
      target: "bys-car-meter",
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
        label: "ROUTE",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Follow the streetcar along the route",
      cue: "Keep the marker on the streetcar as it moves along the route map from stop to stop.",
      why: "Watching the car move along the map while checking the times shows that the timetable describes something real. Some stretches are quick and some are slow. Dispatchers watch cars along the route all day so they can keep the gaps even and help riders who are waiting.",
      holdBreakNote: "The marker lost the streetcar. Find it on the map again and follow it."
    },
    {
      id: "write-your-trip-plan",
      kind: "select",
      target: "bys-trip-log",
      doneLine: "Trip plan written",
      title: "Write your trip plan",
      cue: "Write your stop, your trip, its departure and arrival times and the journey time.",
      why: "A written plan can be checked by a grown-up and followed on the day without re-reading the whole timetable. Writing the journey time as a subtraction shows your working, so anyone can see how you got it. Dispatchers keep written logs of every trip for the same clear, checkable reason."
    },
    {
      id: "check-your-plan-with-the-dispatcher",
      kind: "select",
      target: "bys-share-board",
      doneLine: "Plan checked",
      title: "Check your plan with the dispatcher",
      cue: "Read your plan to the dispatcher and ask if they would choose the same trip.",
      why: "The dispatcher knows which stretches run slow at busy times. Checking with someone who knows the route is a good test of your plan. If they agree, you read the timetable well; if they suggest another trip, you learn something the table alone could not tell you."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "bys-checkin",
      doneLine: "Checked in",
      title: "Check in on the visitor platform",
      cue: "What was tricky about the timetable? Where else could you use rows and columns like this?",
      why: "The dispatcher's shift ends with a handover of the day's timetable notes, so the class ends with a handover too. Each learner says how they found their trip and one place rows and columns help, like a ferry board or a sports table. Anyone still reading the wrong column can practise once more before leaving."
    }
  ],

  interrupts: [
    {
      id: "a-streetcar-rings-its-bell",
      kind: "Car moving",
      after: "keep-your-finger-on-the-column",
      delay: 3,
      seconds: 12,
      target: "bys-stay-behind-line",
      alert: "A streetcar rings its bell as it rolls out of the barn past the platform.",
      cue: "Stay behind the painted line and wait until the car has passed.",
      why: "The bell is a warning that a car is moving. Staying behind the line, and not leaning out to look, keeps everyone clear. The timetable will still be there when the car has gone.",
      missNote: "A classmate leaned over the line to watch the car roll out, and the operator had to stop and ring the bell again.",
      wrongNote: "That does not keep you clear of the moving car. Stay behind the line. Choose the response that deals with it now."
    },
    {
      id: "the-dispatcher-asks-for-the-gap",
      kind: "Dispatcher question",
      after: "follow-the-streetcar-along-the-route",
      delay: 3,
      seconds: 12,
      target: "bys-say-gap",
      alert: "The dispatcher asks how long a rider would wait if they just missed your trip.",
      cue: "Say that you take your trip's time away from the next trip's time.",
      why: "Explaining the method matters more than the answer, because the method works on any timetable. Saying it out loud shows you can use subtraction for a real question riders ask every day.",
      missNote: "You guessed a wait without working it out, and the dispatcher had to show the subtraction before the group could go on.",
      wrongNote: "That does not explain how to find the gap. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0xb8503a;
    const CSS = "#b8503a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#77706a", base2: "#69635d", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#ecdcd4", base2: "#dccac0", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "bys-stops", "the list of stops down the side", {});
    bead(-1.42, 1.18, -0.62, "bys-trips", "the trips across the top", {});
    bead(-1.03, 1.46, -0.71, "bys-cell", "a time where a row meets a column", {});
    bead(-1.08, 0.9, -1.11, "bys-logo", "the transit logo in the corner", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "bys-ord-stop", "1 · find your stop's row", {});
    bead(-0.58, 1.46, -1.44, "bys-ord-arrive", "2 · note when you must arrive", {});
    bead(-0.24, 0.9, -1.23, "bys-ord-pick", "3 · pick a trip that arrives before then", {});
    bead(0, 1.18, -1.55, "bys-ord-leave", "4 · read that trip's departure time", {});
    bead(0.24, 1.46, -1.23, "bys-finger", "Finger on the column", {});
    bead(0.58, 0.9, -1.44, "bys-pl-column", "a time from the wrong column", {});
    bead(0.68, 1.18, -1.05, "bys-pl-count", "a journey time found by counting stops", {});
    bead(1.08, 1.46, -1.11, "bys-pl-late", "a trip that arrives after school starts", {});
    bead(1.03, 0.9, -0.71, "bys-pl-name", "the stop name written clearly", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "bys-stay-behind-line", "Stay behind the line and let the car pass", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "bys-say-gap", "Say how you found the gap between trips", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "bys-line-card", "Behind the platform line", "BEHIND\nTHE LINE", { ry: 1.2 });
    dials["bys-clock-dial"] = dial(-1.89, -1.4, 0.93, "bys-clock-dial", "Clock hands");
    meters["bys-gap-meter"] = meter(-1.45, -1.85, 0.67, "bys-gap-meter", "Gap between trips");
    tokens["bys-token"] = token(-0.92, -2.16, 0.4, "bys-token", "Rider token");
    spots["bys-my-stop"] = spot(-0.31, -2.33, 0.13, "bys-my-stop", "Your stop");
    card(0.31, 1.35, -2.33, "bys-trip-card", "Choose your trip", "WHICH\nTRIP?", { ry: -0.13 });
    meters["bys-car-meter"] = meter(0.92, -2.16, -0.4, "bys-car-meter", "Streetcar followed");
    boards["bys-trip-log"] = board(1.45, -1.85, -0.67, "bys-trip-log", "Trip plan");
    boards["bys-share-board"] = board(1.89, -1.4, -0.93, "bys-share-board", "Check with the dispatcher");
    boards["bys-checkin"] = board(2.19, -0.85, -1.2, "bys-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "read-the-wrong-column", "Read the time from the column next to your trip?", "WRONG\nCOLUMN", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "count-stops-not-time", "Work out the journey time by counting the stops?", "COUNT\nSTOPS?", 0.3);
    hazardCard(0.58, 0.72, -1.86, "arrive-just-in-time", "Pick the trip that arrives exactly when school starts?", "EXACTLY\nON TIME", -0.3);
    hazardCard(1.53, 0.72, -1.21, "cross-behind-the-car", "Step onto the tracks behind a stopped streetcar?", "BEHIND\nTHE CAR", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Find your trip, slide down to your stop."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Streetcar dispatcher", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Streetcar operator", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-streetcar-rings-its-bell"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-streetcar-rings-its-bell"].visible = false;
    arrivals["the-dispatcher-asks-for-the-gap"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-dispatcher-asks-for-the-gap"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-token-on-your-stop") { const s = spots["bys-my-stop"]; tokens["bys-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "write-your-trip-plan") repaint(boards["bys-trip-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Trip plan written"], "#59c97b"));
        if (step.id === "check-your-plan-with-the-dispatcher") repaint(boards["bys-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Plan checked"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["bys-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "choose-the-trip-that-gets-you") paintGuide("Later time take away earlier time.");
      },

      onHazard() {
        paintGuide("Stop. Same column, and cross at the crossing.");
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
        if (it.id === "a-streetcar-rings-its-bell") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group behind the line, the car passed. The lesson carries on."); }
        if (it.id === "the-dispatcher-asks-for-the-gap") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Gap method explained. The lesson carries on."); }
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
