import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — A Robot Waits for a Grown-up's OK. Upper-primary science and careers at a robotics training lab: a helper program on a screen asks a practice robot to do a job, a rule checker looks at the job first, the grown-up in charge says OK or no, and a watcher keeps a hand near the stop while the robot works; worked with a job screen, a rule-checker box with lamps, an OK desk and a small practice robot behind a keep-away ring in the scene. The K-12 version of the agent-supervision station (console ROBOTRAIN, second loop; docs/consoles/VBRIDGE.md). The robot is a practice robot; no real machine is moved.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_RT_A_ROBOT_WAITS_FOR_A_GROWN_UPS_OK = {
  id: "k12-rt-a-robot-waits-for-a-grown-ups-ok",
  index: "rt-5",
  domain: "Education",
  trade: "Science and careers lesson on who may tell a robot what to do, with a robot supervisor at a training lab — learner and robot supervisor",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "A Robot Waits for a Grown-up's OK",
  title: simTitle("A Robot Waits for a Grown-up's OK"),
  tagline: "A program asks, a rule checker looks, a grown-up says OK — then the robot works while someone watches",
  accent: 0x5ec8d8,
  accentCss: "#5ec8d8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"ok-keeper","name":"OK Keeper","note":"Followed a robot job from the program's ask to the grown-up's OK, found the reasons the rule checker says no and kept a hand near the stop"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "OK Desk Board",
    currency: "CHECKS",
    ranks: ["Visitor","Looker","Checker","Watcher","OK Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-who-is-in-the-loop") },
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
    "press-ok-yourself": "You went to press OK. A polite ask is still only an ask. The OK belongs to the grown-up in charge, who has looked at the job, the ring and the stop lamp first. A visitor never gives a robot its OK, however friendly the message on the screen looks.",
    "program-is-the-boss": "You said the program is in charge. It is not. A program can ask for a job, and that is all. The rule checker can say no, the grown-up can say no, and the stop button wins over everything. People stay in charge of what a robot does, every single time.",
    "cover-the-stop": "You covered the stop button. The stop button must be easy to reach and easy to see for the whole job. Covering it makes the robot harder to stop, not safer. The supervisor keeps it clear and keeps a hand near it while the robot works.",
    "start-with-a-friend-inside": "You let the job start with someone inside the ring. The rule checker would say no to that, and so would the grown-up. The ring is the robot's keep-away space. Nobody is inside it when a job starts, and the job waits until the space is clear."
  },

  lateNotes: {
    "rtk-ok-log": "The decision record is written once the grown-up has decided about a job — nothing to record yet.",
    "rtk-checkin": "The check-in comes at the end, at the OK desk."
  },

  steps: [
    {
      id: "find-who-is-in-the-loop",
      kind: "find",
      noHint: true,
      targets: [
        "rtk-screen",
        "rtk-checker",
        "rtk-desk"
      ],
      itemNames: {
        "rtk-screen": "the job screen where the program asks",
        "rtk-checker": "the rule-checker box with its lamps",
        "rtk-desk": "the OK desk with the supervisor"
      },
      itemNotes: {
        "rtk-screen": "Shows the job the program wants done.",
        "rtk-checker": "Looks at every job before anyone sees it.",
        "rtk-desk": "Where the grown-up in charge says OK or no."
      },
      decoyNotes: {
        "rtk-trolley": "Nice at break time, but not part of the loop."
      },
      title: "Find who is in the loop",
      cue: "Mark the job screen, the rule-checker box and the OK desk around the practice robot.",
      why: "A robot job does not go straight from a program to a robot. It passes through a loop of people and checks. The job screen is where the helper program writes its ask. The rule-checker box looks at the ask and lights a lamp. The OK desk is where the grown-up in charge sits and decides. Finding all three shows you the whole path."
    },
    {
      id: "stand-at-the-ok-desk",
      kind: "select",
      target: "rtk-ok-desk",
      title: "Stand at the OK desk",
      cue: "Join the supervisor at the OK desk, outside the keep-away ring.",
      why: "The OK desk sits outside the ring on purpose. From there the supervisor can see the robot, the ring, the stop button and the screen all at once. Standing beside the supervisor lets you watch a real decision being made, and it keeps you where the robot's space stays clear."
    },
    {
      id: "put-a-robot-jobs-journey-in",
      kind: "sequence",
      targets: [
        "rtk-ord-ask",
        "rtk-ord-check",
        "rtk-ord-ok",
        "rtk-ord-work"
      ],
      itemNames: {
        "rtk-ord-ask": "1 · the helper program asks for a job",
        "rtk-ord-check": "2 · the rule checker looks and lights a lamp",
        "rtk-ord-ok": "3 · the grown-up in charge says OK or no",
        "rtk-ord-work": "4 · the robot works while a watcher stays near the stop"
      },
      title: "Put a robot job's journey in order",
      cue: "Order what happens from the program's ask to the robot's work.",
      why: "A job travels in steps. First the program asks for it. Next the rule checker looks at it and lights green or red. Then the grown-up in charge reads it and says OK or no. Only then does the robot start, and someone watches it the whole way with a hand near the stop. Each step waits for the one before it.",
      outOfOrderNote: "Out of order. The rule checker looks before the grown-up decides, and the robot starts last."
    },
    {
      id: "keep-a-hand-near-the-stop",
      kind: "hold",
      target: "rtk-watch-pad",
      seconds: 6,
      title: "Keep a hand near the stop",
      cue: "Hold the watcher's pad while the practice robot does its job.",
      why: "Saying OK is not the end of the grown-up's work. Someone watches the robot for the whole job, with a hand near the stop button. Holding the watcher's pad shows what that feels like: steady, patient and ready. If anything looks wrong, the watcher presses stop and the robot holds still at once.",
      holdBreakNote: "Your hand left the watcher's pad while the robot was still working. Stay with it until the job ends."
    },
    {
      id: "pick-the-job-that-gets-a",
      kind: "select",
      target: "rtk-no-card",
      title: "Pick the job that gets a no",
      cue: "Choose the job card the rule checker and the grown-up would turn down.",
      why: "Not every ask gets an OK. A job that wants the robot to go fast while a person stands close gets a no. So does a job that is not on the list of things this robot is allowed to do. Picking the card that gets a no shows you understand that the answer depends on the rules, not on how nicely the program asks."
    },
    {
      id: "find-the-reasons-the-checker-says",
      kind: "find",
      noHint: true,
      targets: [
        "rtk-lamp-stop",
        "rtk-lamp-close",
        "rtk-lamp-list"
      ],
      itemNames: {
        "rtk-lamp-stop": "the stop lamp",
        "rtk-lamp-close": "the too-close lamp",
        "rtk-lamp-list": "the not-on-the-list lamp"
      },
      itemNotes: {
        "rtk-lamp-stop": "The stop button is pressed, so nothing moves.",
        "rtk-lamp-close": "Somebody is inside the keep-away ring.",
        "rtk-lamp-list": "The job is not one this robot may do."
      },
      decoyNotes: {
        "rtk-paint": "It helps people see the robot, but it is not a reason to say no."
      },
      title: "Find the reasons the checker says no",
      cue: "Mark the three lamps on the rule-checker box that mean no.",
      why: "The rule checker has a lamp for each reason it can say no. One lamp means the stop button is pressed, and nothing moves until a person resets it. One means somebody is standing too close to the robot. One means the job is not on the list this robot is allowed to do. When any of these lamps is lit, the job waits."
    },
    {
      id: "turn-the-dial-to-set-the",
      kind: "turn",
      target: "rtk-ring-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "RING"
      },
      title: "Turn the dial to set the keep-away ring",
      cue: "Turn the model dial slowly to make the keep-away ring wider around the practice robot.",
      why: "The keep-away ring is the space the robot needs to itself while it works. The rule checker uses the ring to decide whether somebody is too close. Turning the dial shows the ring growing on the floor. In a real lab, trained people set the ring from how fast the robot moves and how quickly it can stop, and they test it before anyone relies on it."
    },
    {
      id: "read-the-speed-on-the-job",
      kind: "gauge",
      target: "rtk-speed-meter",
      gauge: {
        label: "SPEED",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not inside the slow band yet. Read where the marker sits on the meter.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the speed on the job card",
      cue: "Commit when the marker on the speed meter sits inside the slow band the job is allowed.",
      why: "Every job card says how fast the robot may move. The rule checker compares that speed with the limit for this robot and this lab. Reading the meter shows that the OK comes from a measurement that anyone can check, not from a guess. A job that asks for more speed than the band allows gets a no."
    },
    {
      id: "put-the-job-card-in-the",
      kind: "drag",
      target: "rtk-job-card",
      drag: {
        to: "rtk-ok-tray",
        radius: 0.45,
        missNote: "Not in the tray yet. Place the job card on the tray at the OK desk."
      },
      title: "Put the job card in the OK tray",
      cue: "Drag the checked job card from the screen onto the tray on the OK desk.",
      why: "A job that has passed the rule checker is still only an ask until the grown-up in charge has read it. Moving the card to the OK tray is how the lab shows whose turn it is to decide. The card waits in the tray while the supervisor looks at the ring, the lamps and the stop, and then says OK or no."
    },
    {
      id: "follow-the-robot-as-it-works",
      kind: "track",
      target: "rtk-job-track",
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
      title: "Follow the robot as it works",
      cue: "Keep the marker on the practice robot's gripper from the first move to the last.",
      why: "Watching the robot for the whole job is part of the OK. The supervisor follows the gripper and compares what the robot does with what the job card said it would do. If the robot does something the card did not say, the watcher presses stop. Following the gripper from start to finish shows how much attention a watcher gives.",
      holdBreakNote: "The marker lost the gripper. Find it again and follow it to the end of the job."
    },
    {
      id: "write-down-the-decision-and-the",
      kind: "select",
      target: "rtk-ok-log",
      doneLine: "Decision and reason recorded",
      title: "Write down the decision and the reason",
      cue: "Write what the grown-up decided about the job and the reason behind it.",
      why: "Every decision at the OK desk goes in the logbook: what the program asked, what the rule checker showed, what the grown-up said and why. A logbook like this lets anyone check later that the rules were followed. Robot labs keep records of every job for the same reason, so the next person knows what happened."
    },
    {
      id: "swap-a-question-with-a-partner",
      kind: "select",
      target: "rtk-share-board",
      doneLine: "Questions swapped",
      title: "Swap a question with a partner",
      cue: "Ask a partner one question about who may say OK to a robot, then answer one of theirs.",
      why: "Asking and answering questions shows what you understand and what you still wonder about. A good question might be what happens if the program asks again after a no. Robot teams ask each other questions like this before every new job, because asking early is how problems get found while they are still small."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "rtk-checkin",
      doneLine: "Checked in",
      title: "Check in at the OK desk",
      cue: "Who says OK before a robot starts a job a program asked for? What always wins?",
      why: "The supervisor ends the visit by checking what everyone learned. Each learner says who gives the OK and what wins over everything else. If anyone still thinks the program is in charge of the robot, the group talks it through together before leaving the lab."
    }
  ],

  interrupts: [
    {
      id: "the-program-sends-a-faster-job",
      kind: "Rule check",
      after: "keep-a-hand-near-the-stop",
      delay: 3,
      seconds: 12,
      target: "rtk-say-no",
      alert: "The helper program has sent the same job again and asks for the robot to go faster.",
      cue: "Say no: the faster job is over the speed band, so it waits.",
      why: "A program can ask again, and it can ask for more. The rules do not change because it asked. The speed band is the same as before, so the faster job gets a no from the rule checker and from the grown-up. Saying no out loud shows you know the answer comes from the rules.",
      missNote: "The faster job sat on the screen with nobody saying no, and the supervisor turned it down before the class went on.",
      wrongNote: "That does not answer the faster ask. Say no to it. Choose the response that deals with it now."
    },
    {
      id: "a-classmate-steps-inside-the-ring",
      kind: "Robot stop",
      after: "follow-the-robot-as-it-works",
      delay: 3,
      seconds: 12,
      target: "rtk-press-stop",
      alert: "A classmate has stepped inside the keep-away ring while the practice robot is working.",
      cue: "Press the stop and wait on the OK side of the ring while the supervisor clears the space.",
      why: "When a person is inside the ring, the robot stops. The stop button is the fastest way, and the watcher's hand is already near it. After the stop, nobody rushes in to help. Everyone stays outside the ring while the supervisor checks the space, and only then does the job carry on.",
      missNote: "The robot kept working with someone inside the ring until the supervisor pressed stop. The watcher presses stop first.",
      wrongNote: "That moves more people toward the robot. Press stop and wait. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x5ec8d8;
    const CSS = "#5ec8d8";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#646a70", base2: "#565c62", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dfe8ea", base2: "#cbd6d9", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "rtk-screen", "the job screen where the program asks", {});
    bead(-1.42, 1.18, -0.62, "rtk-checker", "the rule-checker box with its lamps", {});
    bead(-1.03, 1.46, -0.71, "rtk-desk", "the OK desk with the supervisor", {});
    bead(-1.08, 0.9, -1.11, "rtk-trolley", "the snack trolley by the door", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "rtk-ord-ask", "1 · the helper program asks for a job", {});
    bead(-0.58, 1.46, -1.44, "rtk-ord-check", "2 · the rule checker looks and lights a lamp", {});
    bead(-0.24, 0.9, -1.23, "rtk-ord-ok", "3 · the grown-up in charge says OK or no", {});
    bead(0, 1.18, -1.55, "rtk-ord-work", "4 · the robot works while a watcher stays near the stop", {});
    bead(0.24, 1.46, -1.23, "rtk-watch-pad", "Watch the job", {});
    bead(0.58, 0.9, -1.44, "rtk-lamp-stop", "the stop lamp", {});
    bead(0.68, 1.18, -1.05, "rtk-lamp-close", "the too-close lamp", {});
    bead(1.08, 1.46, -1.11, "rtk-lamp-list", "the not-on-the-list lamp", {});
    bead(1.03, 0.9, -0.71, "rtk-paint", "the robot's orange paint", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "rtk-say-no", "Say no to the faster job", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "rtk-press-stop", "Press stop and wait for the all-clear", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "rtk-ok-desk", "At the OK desk", "OK\nDESK", { ry: 1.2 });
    dials["rtk-ring-dial"] = dial(-1.89, -1.4, 0.93, "rtk-ring-dial", "Ring dial");
    meters["rtk-speed-meter"] = meter(-1.45, -1.85, 0.67, "rtk-speed-meter", "Job speed");
    tokens["rtk-job-card"] = token(-0.92, -2.16, 0.4, "rtk-job-card", "Job card");
    spots["rtk-ok-tray"] = spot(-0.31, -2.33, 0.13, "rtk-ok-tray", "The OK tray");
    card(0.31, 1.35, -2.33, "rtk-no-card", "The job that gets a no", "THIS ONE\nGETS A NO", { ry: -0.13 });
    meters["rtk-job-track"] = meter(0.92, -2.16, -0.4, "rtk-job-track", "Job followed");
    boards["rtk-ok-log"] = board(1.45, -1.85, -0.67, "rtk-ok-log", "Decision record");
    boards["rtk-share-board"] = board(1.89, -1.4, -0.93, "rtk-share-board", "Swap questions");
    boards["rtk-checkin"] = board(2.19, -0.85, -1.2, "rtk-checkin", "OK desk check-in");
    hazardCard(-1.53, 0.72, -1.21, "press-ok-yourself", "Press the OK button because the program asked nicely?", "PRESS\nOK", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "program-is-the-boss", "Say the program is the boss of the robot?", "PROGRAM\nIS BOSS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "cover-the-stop", "Put a cup over the stop button so nobody bumps it?", "COVER\nSTOP", -0.3);
    hazardCard(1.53, 0.72, -1.21, "start-with-a-friend-inside", "Let the job start while a classmate stands inside the ring?", "FRIEND\nINSIDE", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["At the OK desk with the supervisor."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Robot supervisor", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Robot technician", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-program-sends-a-faster-job"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-program-sends-a-faster-job"].visible = false;
    arrivals["a-classmate-steps-inside-the-ring"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["a-classmate-steps-inside-the-ring"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "put-the-job-card-in-the") { const s = spots["rtk-ok-tray"]; tokens["rtk-job-card"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "write-down-the-decision-and-the") repaint(boards["rtk-ok-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Decision and reason recorded"], "#59c97b"));
        if (step.id === "swap-a-question-with-a-partner") repaint(boards["rtk-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Questions swapped"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["rtk-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "pick-the-job-that-gets-a") paintGuide("A program asks; the checker looks; the grown-up decides; the stop wins.");
      },

      onHazard() {
        paintGuide("Stop. The OK is not yours to give.");
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
        if (it.id === "the-program-sends-a-faster-job") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("The faster job got its no. The lesson carries on."); }
        if (it.id === "a-classmate-steps-inside-the-ring") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("The robot stopped and the ring was cleared. The lesson carries on."); }
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
