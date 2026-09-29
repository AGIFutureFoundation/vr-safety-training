import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — The River's Current and a Pilot's Job. Lower-secondary science at the Venice Marina in Plaquemines Parish: a river's current adds to a boat's speed going downstream and takes away from it going up, water runs faster on the outside of a bend, and a river pilot uses that knowledge to guide a ship safely, using only the floats and the chart the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_THE_RIVERS_CURRENT_AND_A_PILOTS_JOB = {
  id: "k12-by-the-rivers-current-and-a-pilots-job",
  index: "832",
  domain: "Education",
  trade: "Science class aboard the pilot boat at the marina — learner and river pilot boat operator",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "The River's Current and a Pilot's Job",
  title: simTitle("The River's Current and a Pilot's Job"),
  tagline: "Downstream the river helps, upstream it pushes back — a pilot reads the current before every turn",
  accent: 0x5b86b8,
  accentCss: "#5b86b8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"current-reader","name":"Current Reader","note":"Timed floats in the channel, explained how current changes a boat's speed and aimed a model boat upstream to cross"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "River Board",
    currency: "BENDS",
    ranks: ["Deckhand","Lookout","Helm","Mate","Pilot"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-signs-of-the-current") },
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
    "current-is-the-same-everywhere": "You said the current is the same all across the river. It runs faster in the deep middle and on the outside of a bend, and slower in the shallows and on the inside. Pilots know where the fast water is before they turn.",
    "aim-straight-across": "You pointed the boat straight at the far landing. The current carries it downstream while it crosses, so it lands below the target. Aiming a little upstream lets the current bring the boat to the right place.",
    "lean-over-for-a-float": "You leaned over the side to grab a float. Current near a hull pulls hard, and the rail is the edge of safe footing. The deckhand collects floats with a long net from inside the rail.",
    "speed-is-just-the-engine": "You said the boat's speed comes only from the engine. Over the ground, a boat's speed is its speed through the water plus or minus the current. The same engine setting is quicker going downstream and slower going up."
  },

  lateNotes: {
    "byr-river-log": "The float record is written once the timings are done — nothing to record yet.",
    "byr-checkin": "The check-in comes at the very end of the trip."
  },

  steps: [
    {
      id: "find-the-signs-of-the-current",
      kind: "find",
      noHint: true,
      targets: [
        "byr-leaf",
        "byr-buoy",
        "byr-swirl"
      ],
      itemNames: {
        "byr-leaf": "a leaf drifting on the surface",
        "byr-buoy": "the ripple trailing from a buoy",
        "byr-swirl": "swirls where fast and slow water meet"
      },
      itemNotes: {
        "byr-leaf": "It moves with the water.",
        "byr-buoy": "The ripple points downstream.",
        "byr-swirl": "They mark a change in current."
      },
      decoyNotes: {
        "byr-cloud": "It moves with the wind, not the current."
      },
      title: "Find the signs of the current",
      cue: "Mark the three things on the water that show which way and how fast the current is moving.",
      why: "You cannot see a current directly, but it leaves clues. A floating leaf drifts with it, a buoy leans and trails a ripple downstream, and swirls form where fast water meets slow. Reading those clues is the first skill a river pilot learns, long before they ever take a ship's wheel."
    },
    {
      id: "fasten-your-life-jacket-and-stay",
      kind: "select",
      target: "byr-jacket-card",
      title: "Fasten your life jacket and stay inside the rail",
      cue: "Fasten your life jacket and take your place inside the deck rail before the boat leaves the dock.",
      why: "On a pilot boat everyone wears a life jacket, even the crew who have done it for years. The rail marks where safe footing ends. Getting both right before the boat moves means the whole trip can be about the river, and the operator never has to stop to sort out safety on the water."
    },
    {
      id: "put-the-float-test-in-order",
      kind: "sequence",
      targets: [
        "byr-ord-marks",
        "byr-ord-drop",
        "byr-ord-time",
        "byr-ord-repeat"
      ],
      itemNames: {
        "byr-ord-marks": "1 · set the start and finish marks",
        "byr-ord-drop": "2 · drop the float at the start",
        "byr-ord-time": "3 · time it to the finish",
        "byr-ord-repeat": "4 · repeat and compare"
      },
      title: "Put the float test in order",
      cue: "Mark a start and finish, drop the float at the start, time it to the finish, then repeat.",
      why: "Timing a float between two marks is a simple way to compare current in different places. Setting the marks first keeps the distance the same, timing from start to finish gives a fair reading, and repeating shows whether your first result was typical or just a lucky gust.",
      outOfOrderNote: "Out of order. Set the start and finish marks before any float goes in."
    },
    {
      id: "hold-the-stopwatch-steady",
      kind: "hold",
      target: "byr-stopwatch",
      seconds: 6,
      title: "Hold the stopwatch steady",
      cue: "Hold the stopwatch button until the float crosses the finish mark.",
      why: "A timing is only as good as the moment you stop it. Holding steady and watching the float, not the watch, means you stop exactly as it crosses the mark. Careful timing lets you compare the middle of the channel with the edge and trust the difference you find.",
      holdBreakNote: "You let go too early and lost the time. Start again and hold until the float crosses."
    },
    {
      id: "turn-the-model-boats-rudder-upstream",
      kind: "turn",
      target: "byr-rudder-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "RUDDER"
      },
      title: "Turn the model boat's rudder upstream",
      cue: "Turn the rudder dial so the model boat points a little upstream of the far landing.",
      why: "To cross a moving river and land where you mean to, you aim upstream of your target. The current then carries the boat sideways as it crosses, bringing it to the landing. Pilots do the same thing with huge ships, judging the angle from how fast the water is running that day."
    },
    {
      id: "set-the-model-boats-speed",
      kind: "gauge",
      target: "byr-throttle",
      gauge: {
        label: "THROTTLE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not on the card's setting. Match the throttle to the operator's card.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Set the model boat's speed",
      cue: "Commit when the throttle reaches the setting on the operator's card.",
      why: "Using the same throttle setting for each run makes the comparison fair. Then any difference in how long the boat takes is caused by the current, not the engine. A pilot also thinks about speed through the water and speed over the ground as two separate things."
    },
    {
      id: "place-the-float-at-the-outside",
      kind: "drag",
      target: "byr-float",
      drag: {
        to: "byr-outer-bend",
        radius: 0.45,
        missNote: "Not on the outside of the bend yet. Move it to the long side of the curve."
      },
      title: "Place the float at the outside of the bend",
      cue: "Drag the second float to the outside of the bend on the model river.",
      why: "Water on the outside of a bend has further to go, so it runs faster and digs a deeper channel there. Timing a float on the outside and comparing it with the inside shows you the difference. Pilots use that knowledge to keep big ships in the deep water around every turn."
    },
    {
      id: "say-where-the-current-was-fastest",
      kind: "select",
      target: "byr-finding-card",
      title: "Say where the current was fastest",
      cue: "Choose the sentence that matches your float times.",
      why: "The float that took the least time moved fastest. Linking the shortest time to the fastest water, and naming where that float was, is how you turn a list of timings into a finding about the river. Saying it clearly is the same as a pilot telling the ship's crew where the strong water is."
    },
    {
      id: "spot-what-a-pilot-watches-for",
      kind: "find",
      noHint: true,
      targets: [
        "byr-ch-bend",
        "byr-ch-shallow",
        "byr-ch-traffic"
      ],
      itemNames: {
        "byr-ch-bend": "a sharp bend with fast water",
        "byr-ch-shallow": "a shallow edge marked on the chart",
        "byr-ch-traffic": "a ship coming the other way"
      },
      itemNotes: {
        "byr-ch-bend": "Plan the turn early.",
        "byr-ch-shallow": "Stay in the deep channel.",
        "byr-ch-traffic": "Agree who passes where by radio."
      },
      decoyNotes: {
        "byr-ch-compass": "Useful for direction, but not a hazard to plan around."
      },
      title: "Spot what a pilot watches for",
      cue: "Look at the river chart and mark each thing a pilot plans around.",
      why: "A river pilot knows a stretch of river so well they can picture it in fog. They plan around the bends where current runs strong, the shallows at the edges, and other ships coming the other way. Seeing these on the chart shows why a ship takes on a local pilot for this part of its journey."
    },
    {
      id: "keep-the-model-boat-on-the",
      kind: "track",
      target: "byr-channel-meter",
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
        label: "CHANNEL",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep the model boat on the channel line",
      cue: "Keep the marker on the channel line as the current pushes the model boat sideways.",
      why: "The current never stops pushing, so steering is a steady job of small corrections. Keeping the boat on the channel line teaches the feel a pilot has, adjusting a little and often rather than waiting until the ship has drifted. Calm, small corrections are what keep a ship safe in a moving river.",
      holdBreakNote: "The boat drifted off the channel line. Correct gently and bring it back."
    },
    {
      id: "record-the-float-times",
      kind: "select",
      target: "byr-river-log",
      doneLine: "Float times recorded",
      title: "Record the float times",
      cue: "Write each float's place and time in a table, with the repeat beside it.",
      why: "A table of places and times lets anyone check your finding and see the pattern at once. Writing the repeat beside the first try shows how steady your results were. Pilots and river crews keep careful logs of conditions too, because the river changes and yesterday's notes help today's plan."
    },
    {
      id: "check-your-finding-with-the-operator",
      kind: "select",
      target: "byr-share-board",
      doneLine: "Finding checked",
      title: "Check your finding with the operator",
      cue: "Tell the pilot boat operator where you found the fastest water and see if they agree.",
      why: "The operator has run this river many times and knows where the current is strong. Checking your finding with someone who has that experience is a good test of your method. If you agree, your floats told the truth; if not, you look for the reason together."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byr-checkin",
      doneLine: "Checked in",
      title: "Check in at the dock",
      cue: "What did the floats show you? How would you explain a pilot's job to someone at home?",
      why: "The pilot boat crew talks through every run once the lines are tied, so the class does the same at the dock. Each learner says where the current ran fastest and why a pilot aims upstream to cross. Anyone still thinking a boat's speed comes only from its engine can ask the operator before the group leaves."
    }
  ],

  interrupts: [
    {
      id: "a-ship-sounds-its-horn",
      kind: "Ship signal",
      after: "hold-the-stopwatch-steady",
      delay: 3,
      seconds: 12,
      target: "byr-sit-down",
      alert: "A large ship sounds its horn and the operator turns the pilot boat to give it room.",
      cue: "Sit down, hold the handrail and stay quiet while the operator turns.",
      why: "The horn is a signal between vessels, and the operator needs to concentrate. Sitting and holding on keeps everyone steady during the turn. Quiet lets the operator hear the radio. The lesson waits; giving way to a big ship does not.",
      missNote: "Nobody sat down, and the group was still standing and talking as the pilot boat turned sharply to give way.",
      wrongNote: "That leaves you standing during the turn. Sit down and hold on. Choose the response that deals with it now."
    },
    {
      id: "the-operator-asks-how-to-reach-the-landing",
      kind: "Operator question",
      after: "keep-the-model-boat-on-the",
      delay: 3,
      seconds: 12,
      target: "byr-say-aim",
      alert: "The operator asks how to steer to reach the far landing across the current.",
      cue: "Say to aim a little upstream so the current carries the boat to the landing.",
      why: "This is the idea the whole lesson builds to. Saying it in your own words shows you can use it, not just repeat it. It is exactly what a pilot thinks every time a ship must cross or turn in a moving river.",
      missNote: "You said to point straight at the landing, and the operator had to show how the current would carry the boat below it.",
      wrongNote: "That would land you downstream of the target. Say where to aim. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x5b86b8;
    const CSS = "#5b86b8";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6a6e70", base2: "#5d6163", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#d6dee4", base2: "#c6d0d8", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byr-leaf", "a leaf drifting on the surface", {});
    bead(-1.42, 1.18, -0.62, "byr-buoy", "the ripple trailing from a buoy", {});
    bead(-1.03, 1.46, -0.71, "byr-swirl", "swirls where fast and slow water meet", {});
    bead(-1.08, 0.9, -1.11, "byr-cloud", "a cloud's shadow on the water", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byr-ord-marks", "1 · set the start and finish marks", {});
    bead(-0.58, 1.46, -1.44, "byr-ord-drop", "2 · drop the float at the start", {});
    bead(-0.24, 0.9, -1.23, "byr-ord-time", "3 · time it to the finish", {});
    bead(0, 1.18, -1.55, "byr-ord-repeat", "4 · repeat and compare", {});
    bead(0.24, 1.46, -1.23, "byr-stopwatch", "Stopwatch held", {});
    bead(0.58, 0.9, -1.44, "byr-ch-bend", "a sharp bend with fast water", {});
    bead(0.68, 1.18, -1.05, "byr-ch-shallow", "a shallow edge marked on the chart", {});
    bead(1.08, 1.46, -1.11, "byr-ch-traffic", "a ship coming the other way", {});
    bead(1.03, 0.9, -0.71, "byr-ch-compass", "the compass rose in the chart's corner", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byr-sit-down", "Sit down and hold on while the boat gives way", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byr-say-aim", "Say to aim a little upstream of the landing", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byr-jacket-card", "Jacket on, inside the rail", "JACKET\nAND RAIL", { ry: 1.2 });
    dials["byr-rudder-dial"] = dial(-1.89, -1.4, 0.93, "byr-rudder-dial", "Rudder angle");
    meters["byr-throttle"] = meter(-1.45, -1.85, 0.67, "byr-throttle", "Throttle");
    tokens["byr-float"] = token(-0.92, -2.16, 0.4, "byr-float", "Test float");
    spots["byr-outer-bend"] = spot(-0.31, -2.33, 0.13, "byr-outer-bend", "The outside of the bend");
    card(0.31, 1.35, -2.33, "byr-finding-card", "State the finding", "WHERE WAS\nIT FASTEST?", { ry: -0.13 });
    meters["byr-channel-meter"] = meter(0.92, -2.16, -0.4, "byr-channel-meter", "Channel line held");
    boards["byr-river-log"] = board(1.45, -1.85, -0.67, "byr-river-log", "Float record");
    boards["byr-share-board"] = board(1.89, -1.4, -0.93, "byr-share-board", "Check with the operator");
    boards["byr-checkin"] = board(2.19, -0.85, -1.2, "byr-checkin", "End-of-trip check-in");
    hazardCard(-1.53, 0.72, -1.21, "current-is-the-same-everywhere", "Say the current runs at the same speed all across the river?", "SAME\nEVERYWHERE?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "aim-straight-across", "Point the model boat straight across to reach the far landing?", "STRAIGHT\nACROSS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "lean-over-for-a-float", "Lean over the side to catch a float as it passes?", "LEAN\nOVER", -0.3);
    hazardCard(1.53, 0.72, -1.21, "speed-is-just-the-engine", "Say the boat's speed comes only from its engine?", "ENGINE\nONLY?", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Read the current before you steer."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Pilot boat operator", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Deckhand with a net", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-ship-sounds-its-horn"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-ship-sounds-its-horn"].visible = false;
    arrivals["the-operator-asks-how-to-reach-the-landing"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-operator-asks-how-to-reach-the-landing"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-float-at-the-outside") { const s = spots["byr-outer-bend"]; tokens["byr-float"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-float-times") repaint(boards["byr-river-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Float times recorded"], "#59c97b"));
        if (step.id === "check-your-finding-with-the-operator") repaint(boards["byr-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Finding checked"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byr-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-where-the-current-was-fastest") paintGuide("Aim upstream; the river brings you in.");
      },

      onHazard() {
        paintGuide("Stop. Stay inside the rail — the net does the reaching.");
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
        if (it.id === "a-ship-sounds-its-horn") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group seated and quiet, the ship passed. The lesson carries on."); }
        if (it.id === "the-operator-asks-how-to-reach-the-landing") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Upstream aim explained. The lesson carries on."); }
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
