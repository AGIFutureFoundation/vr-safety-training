import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — How a Robot Knows to Stop. Upper-primary and lower-secondary science at a robotics training lab: how a robot senses that a person is near, why it slows and stops in zones around it, who is allowed to start it again, and the people who build, mend and teach robots, worked with a small robot arm behind a fence and a floor scanner in the scene. ROBOPROG's awareness level (docs/robotics-programme.md).
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_RP_HOW_A_ROBOT_KNOWS_TO_STOP = {
  id: "k12-rp-how-a-robot-knows-to-stop",
  index: "rp-4",
  domain: "Education",
  trade: "Science and careers lesson on robot sensing with a robotics technician at a training lab — learner and robot technician",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "How a Robot Knows to Stop",
  title: simTitle("How a Robot Knows to Stop"),
  tagline: "Walk toward the robot, watch it slow and stop — then meet the people who keep robots safe",
  accent: 0x5fae8a,
  accentCss: "#5fae8a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"zone-reader","name":"Zone Reader","note":"Watched the robot slow and stop as people came near, found its sensors and said who may start it again"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Robot Lab Board",
    currency: "SPARKS",
    ranks: ["Visitor","Watcher","Helper","Lab Partner","Zone Reader"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-robots-sensors") },
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
    "reach-through-the-fence": "You reached toward the fence to touch the arm. A robot arm can move quickly and does not feel you the way a person would. The fence and the zones are there so hands stay outside; the technician shows the arm up close only when it is switched off and locked.",
    "robots-see-like-people": "You said the robot sees like a person. It does not. Its sensors measure things like distance or light and send numbers to its controller. It only knows what its sensors tell it, which is why the zones and the stop button matter so much.",
    "press-start-yourself": "You went to press start. Only the trained person in charge starts a robot again, after checking that everyone is out of the zones. A visitor never presses start, even when the robot looks ready.",
    "hide-from-the-scanner": "You tried to sneak past the scanner. The scanner is how the robot knows someone is near. Tricking it does not make the robot safe, it only makes it blind. Walk where everyone can be seen, and let the scanner do its job."
  },

  lateNotes: {
    "rpk-robot-log": "The zone record is written once you have watched the robot slow and stop — nothing to record yet.",
    "rpk-checkin": "The check-in comes at the end, at the visitor line."
  },

  steps: [
    {
      id: "find-the-robots-sensors",
      kind: "find",
      noHint: true,
      targets: [
        "rpk-scanner",
        "rpk-curtain",
        "rpk-camera"
      ],
      itemNames: {
        "rpk-scanner": "the floor scanner near the base",
        "rpk-curtain": "the light curtain at the gate",
        "rpk-camera": "the camera above the cell"
      },
      itemNotes: {
        "rpk-scanner": "Measures how far away people are.",
        "rpk-curtain": "Notices when a beam is broken.",
        "rpk-camera": "Watches the work area."
      },
      decoyNotes: {
        "rpk-fan": "It keeps the lab cool, but it is not a sensor."
      },
      title: "Find the robot's sensors",
      cue: "Mark the floor scanner, the light curtain and the camera around the robot cell.",
      why: "A robot cannot see or hear like you. It uses sensors: a floor scanner that measures how far away things are, a light curtain that notices when a beam is broken, and sometimes a camera. Each one sends a signal to the robot's controller, which decides whether to keep going, slow down or stop."
    },
    {
      id: "stand-on-the-visitor-line",
      kind: "select",
      target: "rpk-line-card",
      title: "Stand on the visitor line",
      cue: "Join the technician on the painted visitor line outside the fence.",
      why: "Robot labs have painted lines that show where visitors stand. The line is outside every zone, so the robot can keep working while you watch. The technician explains from the line too, because everyone, even the experts, follows the same rules near a working robot."
    },
    {
      id: "put-the-robots-reactions-in-order",
      kind: "sequence",
      targets: [
        "rpk-ord-work",
        "rpk-ord-slow",
        "rpk-ord-stop",
        "rpk-ord-restart"
      ],
      itemNames: {
        "rpk-ord-work": "1 · the robot works at normal speed",
        "rpk-ord-slow": "2 · a person enters the warning zone and it slows",
        "rpk-ord-stop": "3 · a person enters the stop zone and it stops",
        "rpk-ord-restart": "4 · the technician checks the zones and restarts it"
      },
      title: "Put the robot's reactions in order",
      cue: "Order what the robot does as a person walks closer and closer.",
      why: "The robot reacts in steps. Far away, it works at its normal speed. When someone enters the warning zone, it slows down. If they come into the stop zone, it stops and holds still. Only after the person leaves and the technician checks does it start again. Each step depends on how close the person is.",
      outOfOrderNote: "Out of order. The robot slows down before it stops."
    },
    {
      id: "hold-still-in-the-warning-zone",
      kind: "hold",
      target: "rpk-warn-hold",
      seconds: 6,
      title: "Hold still in the warning zone",
      cue: "Stand still on the yellow warning zone and hold while the robot slows down.",
      why: "Standing still in the warning zone lets you watch the robot change speed because of you. The scanner measured your distance, the controller compared it with the zone, and the arm slowed. Holding still long enough shows that the robot keeps slowing for as long as someone is close.",
      holdBreakNote: "You stepped off before the robot finished slowing. Hold still on the yellow zone."
    },
    {
      id: "turn-the-dial-to-set-the",
      kind: "turn",
      target: "rpk-zone-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "ZONE"
      },
      title: "Turn the dial to set the warning zone",
      cue: "Turn the model dial slowly to make the warning zone bigger around the robot.",
      why: "A bigger warning zone gives the robot more room to slow down before anyone gets close. Turning the dial on the model shows the yellow ring growing. Real zones are set by trained people using the robot's speed and how quickly it can stop, and they are tested before anyone relies on them."
    },
    {
      id: "read-the-distance-on-the-scanner",
      kind: "gauge",
      target: "rpk-range-meter",
      gauge: {
        label: "RANGE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not outside the stop zone yet. Read where the marker sits.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the distance on the scanner screen",
      cue: "Commit when the marker shows the person standing outside the stop zone.",
      why: "The scanner screen shows how far away the nearest person is. When the marker sits outside the red stop zone, the robot is allowed to keep moving slowly. Reading the screen shows that the robot's choice comes from a measurement, not from guessing, which is why a working sensor matters."
    },
    {
      id: "move-the-cone-back-to-the",
      kind: "drag",
      target: "rpk-cone",
      drag: {
        to: "rpk-line-spot",
        radius: 0.45,
        missNote: "Not on the line yet. Place the cone on the painted visitor line."
      },
      title: "Move the cone back to the line",
      cue: "Drag the traffic cone back onto the painted visitor line.",
      why: "Cones and lines only work if they stay where they belong. A cone pushed inside the zone could make people think the safe area is bigger than it is. Putting it back on the line keeps the message clear for the next visitor, just as technicians do at the start of every shift."
    },
    {
      id: "say-who-may-start-the-robot",
      kind: "select",
      target: "rpk-who-card",
      title: "Say who may start the robot again",
      cue: "Choose the sentence that says who restarts the robot and what they check first.",
      why: "When a robot stops for a person, starting it again is a decision, not a button anyone can press. A good answer says the trained person in charge restarts it, and only after checking that nobody is inside the zones. It uses what you saw when the technician walked round the fence."
    },
    {
      id: "spot-the-people-who-work-with",
      kind: "find",
      noHint: true,
      targets: [
        "rpk-operator",
        "rpk-technician",
        "rpk-trainer"
      ],
      itemNames: {
        "rpk-operator": "an operator at the control panel",
        "rpk-technician": "a technician checking a sensor",
        "rpk-trainer": "a robot trainer with a controller"
      },
      itemNotes: {
        "rpk-operator": "Runs the robot and keeps the area clear.",
        "rpk-technician": "Mends the robot and tests its sensors.",
        "rpk-trainer": "Shows the robot a task and tests it."
      },
      decoyNotes: {
        "rpk-plant": "Nice to have, but not a robot job."
      },
      title: "Spot the people who work with robots",
      cue: "Look round the lab and mark three kinds of work people do with robots.",
      why: "Many people work with robots. Operators run them and keep the area clear. Technicians mend them and check the sensors. Robot trainers show robots how to do a task and test whether they learned it well. These are jobs people train for, and each one uses the ideas in this lesson."
    },
    {
      id: "follow-the-robot-arm-as-it",
      kind: "track",
      target: "rpk-arm-track",
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
      title: "Follow the robot arm as it moves",
      cue: "Keep the marker on the robot's gripper as it picks up a block and puts it down.",
      why: "Following the gripper shows how the arm moves in arcs, not straight lines, which is why the zones are round. The arm can swing farther than it looks. Watching it from the line helps you see why nobody stands near a robot that is working, even when it seems far away.",
      holdBreakNote: "The marker lost the gripper. Find it again and follow it."
    },
    {
      id: "record-what-made-the-robot-slow",
      kind: "select",
      target: "rpk-robot-log",
      doneLine: "Zone test recorded",
      title: "Record what made the robot slow and stop",
      cue: "Write what the robot did when you were far, in the warning zone and in the stop zone.",
      why: "Three short lines tell the story: far away it worked, in the warning zone it slowed, in the stop zone it stopped. A record like this lets you check your thinking later. Technicians keep records of every sensor test for the same reason, so the next person knows it was checked."
    },
    {
      id: "swap-a-question-with-a-partner",
      kind: "select",
      target: "rpk-share-board",
      doneLine: "Questions swapped",
      title: "Swap a question with a partner",
      cue: "Ask a partner one question about how robots sense people, then answer one of theirs.",
      why: "Asking and answering questions shows what you understand and what you still wonder about. A good question might be what happens if a sensor breaks. Robot teams ask each other questions all the time, because asking early is how problems get found before anyone is near the arm."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "rpk-checkin",
      doneLine: "Checked in",
      title: "Check in at the visitor line",
      cue: "How does the robot know you are near? Who may start it again?",
      why: "The technician ends the visit by checking what everyone learned. Each learner names one sensor and says who restarts the robot. If anyone still thinks the robot sees like a person, the group works it out together before leaving the lab."
    }
  ],

  interrupts: [
    {
      id: "the-robot-stops-for-a-visitor",
      kind: "Robot stop",
      after: "hold-still-in-the-warning-zone",
      delay: 3,
      seconds: 12,
      target: "rpk-stay-on-line",
      alert: "The robot has stopped because a visitor stepped too close to the gate.",
      cue: "Stay on the visitor line and wait while the technician checks the zones.",
      why: "When a robot stops for a person, the safe thing is to stay put and let the person in charge check. Moving around, or going to look, only adds more people near the robot. Waiting on the line shows you understand that a stop is the robot doing its job.",
      missNote: "The class drifted toward the gate after the stop. When a robot stops, stay on the line and wait for the technician.",
      wrongNote: "That moves people toward the robot. Stay on the line. Choose the response that deals with it now."
    },
    {
      id: "the-technician-asks-about-sensors",
      kind: "Crew question",
      after: "follow-the-robot-arm-as-it",
      delay: 3,
      seconds: 12,
      target: "rpk-name-sensor",
      alert: "The technician asks how the robot knew to slow down.",
      cue: "Say the floor scanner measured how far away the person was and the robot slowed for the zone.",
      why: "Knowing that a sensor measured a distance shows you understand the robot is not guessing. It follows rules about zones using numbers from its sensors. That is the main idea of this lesson.",
      missNote: "You could not say how the robot knew, and the technician explained before the class went on.",
      wrongNote: "That does not say how the robot knew. Name the sensor. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x5fae8a;
    const CSS = "#5fae8a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6a6f73", base2: "#5c6165", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e2e7e4", base2: "#cfd8d3", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "rpk-scanner", "the floor scanner near the base", {});
    bead(-1.42, 1.18, -0.62, "rpk-curtain", "the light curtain at the gate", {});
    bead(-1.03, 1.46, -0.71, "rpk-camera", "the camera above the cell", {});
    bead(-1.08, 0.9, -1.11, "rpk-fan", "the cooling fan on the wall", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "rpk-ord-work", "1 · the robot works at normal speed", {});
    bead(-0.58, 1.46, -1.44, "rpk-ord-slow", "2 · a person enters the warning zone and it slows", {});
    bead(-0.24, 0.9, -1.23, "rpk-ord-stop", "3 · a person enters the stop zone and it stops", {});
    bead(0, 1.18, -1.55, "rpk-ord-restart", "4 · the technician checks the zones and restarts it", {});
    bead(0.24, 1.46, -1.23, "rpk-warn-hold", "Hold in the warning zone", {});
    bead(0.58, 0.9, -1.44, "rpk-operator", "an operator at the control panel", {});
    bead(0.68, 1.18, -1.05, "rpk-technician", "a technician checking a sensor", {});
    bead(1.08, 1.46, -1.11, "rpk-trainer", "a robot trainer with a controller", {});
    bead(1.03, 0.9, -0.71, "rpk-plant", "a plant by the window", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "rpk-stay-on-line", "Stay on the line and wait", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "rpk-name-sensor", "Say the scanner measures how far people are", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "rpk-line-card", "On the visitor line", "VISITOR\nLINE", { ry: 1.2 });
    dials["rpk-zone-dial"] = dial(-1.89, -1.4, 0.93, "rpk-zone-dial", "Zone dial");
    meters["rpk-range-meter"] = meter(-1.45, -1.85, 0.67, "rpk-range-meter", "Scanner distance");
    tokens["rpk-cone"] = token(-0.92, -2.16, 0.4, "rpk-cone", "Traffic cone");
    spots["rpk-line-spot"] = spot(-0.31, -2.33, 0.13, "rpk-line-spot", "The visitor line");
    card(0.31, 1.35, -2.33, "rpk-who-card", "Who restarts it", "WHO MAY\nRESTART?", { ry: -0.13 });
    meters["rpk-arm-track"] = meter(0.92, -2.16, -0.4, "rpk-arm-track", "Gripper followed");
    boards["rpk-robot-log"] = board(1.45, -1.85, -0.67, "rpk-robot-log", "Zone record");
    boards["rpk-share-board"] = board(1.89, -1.4, -0.93, "rpk-share-board", "Swap questions");
    boards["rpk-checkin"] = board(2.19, -0.85, -1.2, "rpk-checkin", "Visitor-line check-in");
    hazardCard(-1.53, 0.72, -1.21, "reach-through-the-fence", "Reach through the fence to touch the robot arm?", "REACH\nIN", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "robots-see-like-people", "Say the robot sees people just like we do?", "SEES\nLIKE US", 0.3);
    hazardCard(0.58, 0.72, -1.86, "press-start-yourself", "Press the start button after the robot stops?", "PRESS\nSTART", -0.3);
    hazardCard(1.53, 0.72, -1.21, "hide-from-the-scanner", "Duck low to sneak past the floor scanner?", "SNEAK\nPAST", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["On the visitor line with the technician."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Robot technician", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Robot operator", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-robot-stops-for-a-visitor"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-robot-stops-for-a-visitor"].visible = false;
    arrivals["the-technician-asks-about-sensors"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-technician-asks-about-sensors"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-cone-back-to-the") { const s = spots["rpk-line-spot"]; tokens["rpk-cone"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-what-made-the-robot-slow") repaint(boards["rpk-robot-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Zone test recorded"], "#59c97b"));
        if (step.id === "swap-a-question-with-a-partner") repaint(boards["rpk-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Questions swapped"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["rpk-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-who-may-start-the-robot") paintGuide("Sensors measure; the robot slows and stops by zone.");
      },

      onHazard() {
        paintGuide("Stop. Hands stay outside the fence.");
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
        if (it.id === "the-robot-stops-for-a-visitor") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class waited, the zones were checked. The lesson carries on."); }
        if (it.id === "the-technician-asks-about-sensors") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Sensor named. The lesson carries on."); }
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
