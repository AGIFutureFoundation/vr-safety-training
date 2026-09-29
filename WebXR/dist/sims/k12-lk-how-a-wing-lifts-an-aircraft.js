import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — How a Wing Lifts an Aircraft. Lower-secondary science at a regional airport hangar like the one at New Iberia: the four forces on an aircraft, how a wing's shape and angle turn moving air into lift, and why mechanics check every control surface before flight, worked with a model wing in a small wind tunnel and a parked aircraft in the scene.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_LK_HOW_A_WING_LIFTS_AN_AIRCRAFT = {
  id: "k12-lk-how-a-wing-lifts-an-aircraft",
  index: "967",
  domain: "Education",
  trade: "Science lesson on flight with an aircraft maintenance crew at a regional airport — learner and aircraft mechanic",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "How a Wing Lifts an Aircraft",
  title: simTitle("How a Wing Lifts an Aircraft"),
  tagline: "Lift, weight, thrust and drag — tilt the wing, feel the air push and see why mechanics check every hinge",
  accent: 0x5a8fd0,
  accentCss: "#5a8fd0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"wing-reader","name":"Wing Reader","note":"Balanced the four forces, found the angle that gives lift in the wind tunnel and walked round a parked aircraft with the mechanic"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Flight Board",
    currency: "UPDRAFTS",
    ranks: ["Paper Plane","Glider","Trainer","Airliner","Wing Reader"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-four-forces-on-the") },
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
    "walk-under-a-propeller": "You headed for the front of the propeller. A propeller can be hard to see when it spins, and even a still one should never be touched or walked in front of. On the apron, people walk only where the ground crew shows them, well away from propellers and engine intakes.",
    "heavier-cannot-fly": "You said the aircraft is too heavy to fly. It is heavy, but its wings push a huge amount of air downward every second as it moves, and the air pushes the wings up just as hard. Enough speed and the right wing shape make lift greater than weight.",
    "push-a-control-surface": "You reached to push a flap. Control surfaces are set and checked by the mechanics, and a pushed flap can hide damage or catch a hand. Look with your eyes, and let the mechanic move and inspect them.",
    "leave-a-pen-on-the-apron": "You left a pen on the apron. Loose objects on the ground can be sucked into an engine or thrown by the wind from a propeller. Crews walk the apron looking for anything loose, so keep everything you carry in your pocket."
  },

  lateNotes: {
    "lkf-lift-log": "The lift table is written once you have tested the angles — nothing to record yet.",
    "lkf-checkin": "The check-in comes at the end, by the hangar door."
  },

  steps: [
    {
      id: "find-the-four-forces-on-the",
      kind: "find",
      noHint: true,
      targets: [
        "lkf-lift",
        "lkf-weight",
        "lkf-thrust"
      ],
      itemNames: {
        "lkf-lift": "lift, pushing up on the wings",
        "lkf-weight": "weight, pulling down",
        "lkf-thrust": "thrust, pushing forward"
      },
      itemNotes: {
        "lkf-lift": "Comes from air moving over the wings.",
        "lkf-weight": "Gravity on the aircraft and its load.",
        "lkf-thrust": "Comes from the propellers."
      },
      decoyNotes: {
        "lkf-sock": "It shows the wind on the field, not a force on the aircraft."
      },
      title: "Find the four forces on the aircraft",
      cue: "Mark lift, weight and thrust on the model aircraft.",
      why: "Four forces act on every aircraft in flight. Lift pushes up and comes from the wings. Weight pulls down toward the ground. Thrust pushes forward and comes from the engines or propellers. Drag holds the aircraft back as it pushes through the air. The aircraft climbs, cruises or lands depending on which forces are stronger."
    },
    {
      id: "walk-the-painted-path-with-the",
      kind: "select",
      target: "lkf-path-card",
      title: "Walk the painted path with the mechanic",
      cue: "Follow the aircraft mechanic along the painted walkway into the hangar.",
      why: "An airport apron is busy, with aircraft, tugs and fuel trucks moving about. Painted walkways show where people on foot are expected, so drivers and pilots know where to look for them. Staying on the path with the mechanic keeps the class where the ground crew can see everyone at all times."
    },
    {
      id: "put-the-takeoff-forces-in-order",
      kind: "sequence",
      targets: [
        "lkf-ord-thrust",
        "lkf-ord-speed",
        "lkf-ord-lift",
        "lkf-ord-climb"
      ],
      itemNames: {
        "lkf-ord-thrust": "1 · engines give thrust and it rolls",
        "lkf-ord-speed": "2 · speed builds down the runway",
        "lkf-ord-lift": "3 · lift grows bigger than weight",
        "lkf-ord-climb": "4 · the wheels lift and it climbs"
      },
      title: "Put the takeoff forces in order",
      cue: "Order what happens as the aircraft goes from standing still to climbing.",
      why: "Takeoff is a story about forces changing. The engines give thrust and the aircraft rolls faster down the runway. As its speed grows, air moves faster over the wings and lift grows. When lift becomes greater than weight, the wheels leave the ground. Then the pilot keeps enough thrust to beat drag and keep climbing.",
      outOfOrderNote: "Out of order. The engines give thrust first, before there is any speed or lift."
    },
    {
      id: "hold-the-wing-steady-in-the",
      kind: "hold",
      target: "lkf-wing-hold",
      seconds: 6,
      title: "Hold the wing steady in the wind tunnel",
      cue: "Hold the model wing steady in the airflow until the lift scale settles.",
      why: "A wind tunnel blows air past a model so scientists can measure the forces on it. Holding the wing steady lets the lift reading settle to one value. If the wing wobbles, the reading jumps about and cannot be trusted. Engineers test wing shapes this way long before a real aircraft is built.",
      holdBreakNote: "The wing wobbled and the reading jumped. Hold it steady again and wait."
    },
    {
      id: "tilt-the-wing-to-find-more",
      kind: "turn",
      target: "lkf-angle-knob",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "ANGLE"
      },
      title: "Tilt the wing to find more lift",
      cue: "Turn the angle knob to tilt the wing's front edge up until the lift scale rises.",
      why: "Tilting the front of the wing up a little makes it push more air downward, so the air pushes the wing up harder. That tilt is called the angle of attack. Tilt it too far and the smooth airflow breaks away from the top of the wing and lift drops suddenly. Pilots and designers keep the angle in the safe range."
    },
    {
      id: "read-the-lift-on-the-scale",
      kind: "gauge",
      target: "lkf-lift-meter",
      gauge: {
        label: "LIFT",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the reading yet. Read where the needle points on the scale.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the lift on the scale",
      cue: "Commit when the marker sits at the reading on the wind tunnel's lift scale.",
      why: "The scale measures how hard the air pushes the model wing up. Reading it at each angle lets you compare one setting with another. That comparison is how you find the angle that gives the most lift before the airflow breaks away. Measuring, not guessing, is how engineers learn what a wing can do."
    },
    {
      id: "set-the-flap-down-for-landing",
      kind: "drag",
      target: "lkf-flap",
      drag: {
        to: "lkf-flap-spot",
        radius: 0.45,
        missNote: "Not at the landing position yet. Set the flap fully down."
      },
      title: "Set the flap down for landing",
      cue: "Drag the model flap down to its landing position at the back of the wing.",
      why: "Flaps slide out and down from the back of the wing. They change the wing's shape so it makes more lift at slow speed, which lets the aircraft land gently on a runway of normal length. They also add drag to help slow it down. That is why mechanics check that every flap moves freely before each flight."
    },
    {
      id: "say-why-the-aircraft-can-fly",
      kind: "select",
      target: "lkf-result-card",
      title: "Say why the aircraft can fly",
      cue: "Choose the sentence that explains how something so heavy gets off the ground.",
      why: "You saw lift grow with speed and with the wing's tilt. A good answer says that the moving wing pushes air downward and the air pushes the wing up, and when that lift is bigger than the weight, the aircraft rises. It uses the forces you measured and nothing more."
    },
    {
      id: "spot-what-the-mechanic-checks-on",
      kind: "find",
      noHint: true,
      targets: [
        "lkf-tyre",
        "lkf-aileron",
        "lkf-cover"
      ],
      itemNames: {
        "lkf-tyre": "the main wheel tyre",
        "lkf-aileron": "the aileron hinge",
        "lkf-cover": "the red cover on a sensor"
      },
      itemNotes: {
        "lkf-tyre": "Must be ready for landing.",
        "lkf-aileron": "Must move freely.",
        "lkf-cover": "Must be removed before flight."
      },
      decoyNotes: {
        "lkf-logo": "Nice paint, but not a safety check."
      },
      title: "Spot what the mechanic checks on the walk-round",
      cue: "Walk round the parked aircraft with the mechanic and mark the three things checked.",
      why: "Before every flight a mechanic walks all the way round the aircraft. Tyres must be in good shape for landing. Control surfaces must move freely and be undamaged. Covers on sensors and intakes must be taken off. A careful walk-round catches small problems on the ground, where they are easy and safe to fix."
    },
    {
      id: "follow-the-smoke-over-the-wing",
      kind: "track",
      target: "lkf-smoke-track",
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
      title: "Follow the smoke over the wing",
      cue: "Keep the marker on the smoke trail as it flows over the top of the wing.",
      why: "A thin line of smoke in the wind tunnel shows exactly how the air moves. Over a working wing it curves smoothly along the top and leaves the back edge heading downward. That downward push of air is the partner of lift. If you tilt the wing too far, the smoke tears away into swirls, and you can see lift being lost.",
      holdBreakNote: "The marker lost the smoke. Find the trail again and follow it over the wing."
    },
    {
      id: "record-lift-at-each-angle",
      kind: "select",
      target: "lkf-lift-log",
      doneLine: "Lift table written",
      title: "Record lift at each angle",
      cue: "Write a line for a small tilt, a medium tilt and a steep tilt.",
      why: "A record of lift at three angles shows the pattern in one glance: more tilt gives more lift, until too much tilt makes it fall away. A simple table like this is what test engineers build from wind tunnel runs, and pilots learn the same pattern so they never tilt too far."
    },
    {
      id: "show-your-table-to-the-mechanic",
      kind: "select",
      target: "lkf-share-board",
      doneLine: "Table shown",
      title: "Show your table to the mechanic",
      cue: "Hand your lift table to the mechanic and point to the angle where lift fell away.",
      why: "Showing your results to someone who works with aircraft every day is a real test. The mechanic can tell you whether your pattern matches what happens on a real wing. Mechanics sign their work so the next person can trust it, and your table is your own signed record."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "lkf-checkin",
      doneLine: "Checked in",
      title: "Check in at the hangar door",
      cue: "Name the four forces. What happens if the wing is tilted too far?",
      why: "The mechanic ends the visit by asking what stuck. Each learner names the forces and says what a too-steep tilt does to the airflow. If anyone still thinks a heavy aircraft simply cannot fly, the class talks it through at the door."
    }
  ],

  interrupts: [
    {
      id: "a-tug-backs-out-of-the-hangar",
      kind: "Ground traffic",
      after: "hold-the-wing-steady-in-the",
      delay: 3,
      seconds: 12,
      target: "lkf-stand-clear",
      alert: "A tug starts to back an aircraft out through the hangar door.",
      cue: "Stand still on the painted walkway and wait until the tug and aircraft are clear.",
      why: "A tug driver pushing an aircraft backward cannot see everything behind the wings. Staying still on the walkway keeps you where the wing walker and driver expect people to be. Ground crews stop and wait for moving aircraft every day.",
      missNote: "The class kept walking toward the door as the aircraft came out. When a tug moves an aircraft, stop behind the painted line and let the wing walker wave you on.",
      wrongNote: "That puts the class in the aircraft's path. Stand still on the walkway. Choose the response that deals with it now."
    },
    {
      id: "the-mechanic-asks-about-the-flaps",
      kind: "Crew question",
      after: "follow-the-smoke-over-the-wing",
      delay: 3,
      seconds: 12,
      target: "lkf-name-flaps",
      alert: "The mechanic asks why the flaps come down before landing.",
      cue: "Say the flaps change the wing's shape to give more lift at slow speed.",
      why: "Landing means flying slowly, and slow air gives less lift. Flaps make up for it. Knowing that shows why a stuck flap is something the mechanic will always fix before flight.",
      missNote: "You could not say what the flaps do, and the mechanic explained before the class went on.",
      wrongNote: "That does not explain the flaps. Say what they do at slow speed. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x5a8fd0;
    const CSS = "#5a8fd0";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#74787c", base2: "#66696e", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e4e8ee", base2: "#d0d6e0", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a lab bench behind the station, a fume cabinet, a reagent rack and an eyewash post
    const back = group(g, 0, 0, -4.7);
    box(back, 6.4, 2.6, 0.12, 0, 1.3, 0, 0xe0dccf, { rough: 0.7 }).material = wallMat;
    const bench = group(g, 0, 0, -4.1);
    box(bench, 4.6, 0.9, 0.7, 0, 0.45, 0, 0x2b2f35, { rough: 0.6 });
    box(bench, 4.7, 0.05, 0.75, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    box(bench, 0.5, 0.02, 0.4, -1.4, 0.94, 0, 0x8aa0a8, { rough: 0.3, metal: 0.5 });
    cyl(bench, 0.02, 0.02, 0.3, -1.4, 1.1, -0.15, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });
    for (let i = 0; i < 6; i++) cyl(bench, 0.05, 0.05, 0.22 + (i % 3) * 0.06, -0.4 + i * 0.28, 1.06, -0.15, [0x7fc4d8, 0xf2c14b, 0xa0e0a0][i % 3], { rough: 0.2, seg: 10 });
    const hood = group(g, 2.9, 0, -4.2);
    box(hood, 1.2, 0.9, 0.8, 0, 0.45, 0, 0xd8d4cc, { rough: 0.6 });
    box(hood, 1.2, 1.3, 0.8, 0, 1.55, 0, 0xc8d8dc, { rough: 0.2, metal: 0.1 });
    box(hood, 1.1, 0.04, 0.7, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    const rack = group(g, -2.9, 0, -4.3);
    box(rack, 1.0, 1.8, 0.34, 0, 0.9, 0, 0x8a8f96, { rough: 0.5, metal: 0.4 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cyl(rack, 0.06, 0.06, 0.24, -0.33 + c * 0.22, 0.32 + r * 0.55, 0.06, [0xd86a4a, 0x4a8ad8, 0xd8c04a, 0x5ab87a][(r + c) % 4], { rough: 0.3, seg: 10 });
    const wash = group(g, 3.6, 0, -2.8);
    cyl(wash, 0.03, 0.03, 1.1, 0, 0.55, 0, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 8 });
    box(wash, 0.3, 0.1, 0.3, 0, 1.12, 0, 0x59c97b, { rough: 0.5 });
    for (const bx of [-0.08, 0.08]) cyl(wash, 0.03, 0.03, 0.08, bx, 1.2, 0, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "lkf-lift", "lift, pushing up on the wings", {});
    bead(-1.42, 1.18, -0.62, "lkf-weight", "weight, pulling down", {});
    bead(-1.03, 1.46, -0.71, "lkf-thrust", "thrust, pushing forward", {});
    bead(-1.08, 0.9, -1.11, "lkf-sock", "the windsock on its pole", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "lkf-ord-thrust", "1 · engines give thrust and it rolls", {});
    bead(-0.58, 1.46, -1.44, "lkf-ord-speed", "2 · speed builds down the runway", {});
    bead(-0.24, 0.9, -1.23, "lkf-ord-lift", "3 · lift grows bigger than weight", {});
    bead(0, 1.18, -1.55, "lkf-ord-climb", "4 · the wheels lift and it climbs", {});
    bead(0.24, 1.46, -1.23, "lkf-wing-hold", "Hold the wing steady", {});
    bead(0.58, 0.9, -1.44, "lkf-tyre", "the main wheel tyre", {});
    bead(0.68, 1.18, -1.05, "lkf-aileron", "the aileron hinge", {});
    bead(1.08, 1.46, -1.11, "lkf-cover", "the red cover on a sensor", {});
    bead(1.03, 0.9, -0.71, "lkf-logo", "the logo on the tail", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "lkf-stand-clear", "Stand on the walkway and wait", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "lkf-name-flaps", "Say flaps add lift at slow speed", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "lkf-path-card", "Painted walkway", "WALK THE\nPATH", { ry: 1.2 });
    dials["lkf-angle-knob"] = dial(-1.89, -1.4, 0.93, "lkf-angle-knob", "Angle knob");
    meters["lkf-lift-meter"] = meter(-1.45, -1.85, 0.67, "lkf-lift-meter", "Lift reading");
    tokens["lkf-flap"] = token(-0.92, -2.16, 0.4, "lkf-flap", "Wing flap");
    spots["lkf-flap-spot"] = spot(-0.31, -2.33, 0.13, "lkf-flap-spot", "Landing position");
    card(0.31, 1.35, -2.33, "lkf-result-card", "State why it flies", "WHY DOES\nIT FLY?", { ry: -0.13 });
    meters["lkf-smoke-track"] = meter(0.92, -2.16, -0.4, "lkf-smoke-track", "Smoke followed");
    boards["lkf-lift-log"] = board(1.45, -1.85, -0.67, "lkf-lift-log", "Lift table");
    boards["lkf-share-board"] = board(1.89, -1.4, -0.93, "lkf-share-board", "Show the table");
    boards["lkf-checkin"] = board(2.19, -0.85, -1.2, "lkf-checkin", "Hangar door check-in");
    hazardCard(-1.53, 0.72, -1.21, "walk-under-a-propeller", "Walk past the front of the propeller?", "PAST\nPROP", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "heavier-cannot-fly", "Say something this heavy could never fly?", "TOO\nHEAVY?", 0.3);
    hazardCard(0.58, 0.72, -1.86, "push-a-control-surface", "Push a flap on the parked aircraft?", "PUSH\nFLAP", -0.3);
    hazardCard(1.53, 0.72, -1.21, "leave-a-pen-on-the-apron", "Leave your pen on the apron?", "DROP\nIT", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Walk the painted path with the mechanic."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Aircraft mechanic", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Ground crew wing walker", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-tug-backs-out-of-the-hangar"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-tug-backs-out-of-the-hangar"].visible = false;
    arrivals["the-mechanic-asks-about-the-flaps"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-mechanic-asks-about-the-flaps"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "set-the-flap-down-for-landing") { const s = spots["lkf-flap-spot"]; tokens["lkf-flap"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-lift-at-each-angle") repaint(boards["lkf-lift-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Lift table written"], "#59c97b"));
        if (step.id === "show-your-table-to-the-mechanic") repaint(boards["lkf-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Table shown"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["lkf-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-the-aircraft-can-fly") paintGuide("More speed and the right tilt give more lift.");
      },

      onHazard() {
        paintGuide("Stop. Stay clear of the propeller.");
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
        if (it.id === "a-tug-backs-out-of-the-hangar") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class on the walkway, the aircraft rolled clear. The lesson carries on."); }
        if (it.id === "the-mechanic-asks-about-the-flaps") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Flaps explained. The lesson carries on."); }
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
