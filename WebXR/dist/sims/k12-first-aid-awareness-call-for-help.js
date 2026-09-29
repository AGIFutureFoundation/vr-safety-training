import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — First Aid Awareness: Call for Help. Early-primary to upper-secondary life skills: noticing someone is hurt, keeping yourself safe, calling for help and giving clear information — never a clinical step.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_FIRST_AID_AWARENESS_CALL_FOR_HELP = {
  id: "k12-first-aid-awareness-call-for-help",
  index: "812",
  domain: "Education",
  trade: "Life skills class at the fire station's open day — learner and firefighter",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "First Aid Awareness: Call for Help",
  title: simTitle("First Aid Awareness: Call for Help"),
  tagline: "Stay safe, get an adult, call for help, say clearly where you are",
  accent: 0x9a6ad0,
  accentCss: "#9a6ad0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"help-called","name":"Help Called","note":"Danger checked, an adult fetched, help called and the location given clearly"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Help Board",
    currency: "CALLS",
    ranks: ["Noticer","Helper","Caller","Guide","Responder"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("notice-what-you-need-to-know") },
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
    "rush-into-danger": "You ran straight towards the person without checking for danger. The first rule is to keep yourself safe, because a second person hurt means help has two people to reach; you look for traffic or other dangers first and get an adult.",
    "try-a-treatment": "You tried to treat the injury yourself. This lesson is about calling for help, not treating; trained people will know what to do, and trying a treatment you have not been trained in can make things worse.",
    "hang-up-early": "You hung up as soon as you had said what happened. The person on the phone may need to ask more questions or tell you what to do next; you stay on the line until they say you can go.",
    "vague-location": "You gave a vague location. Help can only arrive where you tell it to; look for a street sign, a building name or a landmark and say it clearly, because a vague answer costs time."
  },

  lateNotes: {
    "kfa-help-log": "You tell the adult what happened once help has arrived — not yet.",
    "kfa-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "notice-what-you-need-to-know",
      kind: "find",
      noHint: true,
      targets: [
        "kfa-danger",
        "kfa-responding",
        "kfa-where"
      ],
      itemNames: {
        "kfa-danger": "any danger nearby, like traffic",
        "kfa-responding": "whether the person is responding",
        "kfa-where": "a street sign or landmark"
      },
      itemNotes: {
        "kfa-danger": "Keep yourself safe first. Do not go into danger.",
        "kfa-responding": "You can tell the adult and the caller this. You do not need to do anything else.",
        "kfa-where": "Help needs to know exactly where you are."
      },
      decoyNotes: {
        "kfa-balloon": "Not important right now. Notice what matters."
      },
      title: "Notice what you need to know",
      cue: "Mark the three things to notice before you do anything else.",
      why: "Before acting, notice three things: whether there is any danger to you, whether the person is responding, and where exactly you are. Noticing these first keeps you safe and gives you what the person on the phone will ask for."
    },
    {
      id: "put-the-call-in-order",
      kind: "sequence",
      targets: [
        "kfa-ord-where",
        "kfa-ord-what",
        "kfa-ord-many",
        "kfa-ord-stay"
      ],
      itemNames: {
        "kfa-ord-where": "1 · where you are",
        "kfa-ord-what": "2 · what happened",
        "kfa-ord-many": "3 · how many people",
        "kfa-ord-stay": "4 · stay on the line"
      },
      title: "Put the call in order",
      cue: "Where you are, what happened, how many people, then stay on the line.",
      why: "The person answering needs to know where to send help first, because that is what gets people moving. Then what happened and how many people are hurt help them send the right help; staying on the line lets them guide you until it arrives.",
      outOfOrderNote: "Out of order. Say where you are first, so help can start moving."
    },
    {
      id: "get-a-trusted-adult-straight-away",
      kind: "select",
      target: "kfa-adult-card",
      title: "Get a trusted adult straight away",
      cue: "Shout for, or run to, the nearest trusted adult.",
      why: "Getting an adult is almost always the fastest route to help, and it is the right first move for a young person. An adult can call, keep others back and take charge, so you are never left dealing with it alone."
    },
    {
      id: "put-the-phone-on-speaker",
      kind: "turn",
      target: "kfa-phone-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SPEAKER"
      },
      title: "Put the phone on speaker",
      cue: "Turn the phone to speaker so your hands are free and the adult can hear.",
      why: "Putting the phone on speaker lets the adult beside you hear the questions and answer too, and leaves your hands free to wave to arriving help. It is a small step that makes the call work better for everyone. Every detail you can give calmly is one less question the call-taker has to ask while help is on its way."
    },
    {
      id: "speak-calmly-and-clearly",
      kind: "gauge",
      target: "kfa-calm-meter",
      gauge: {
        label: "CALM",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too rushed and you have to repeat yourself. Take a breath and try again.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Speak calmly and clearly",
      cue: "Commit when your voice is calm and clear enough to be understood first time.",
      why: "A calm, clear voice gets information across first time; a rushed or shouted one has to be repeated, which costs time. Taking a breath before speaking is the simplest way to be understood in an emergency. Saying where you are first, before anything else, means help can start moving even if the call is cut short."
    },
    {
      id: "stay-on-the-line",
      kind: "hold",
      target: "kfa-stay-line",
      seconds: 6,
      title: "Stay on the line",
      cue: "Hold the phone and listen until they say you can hang up.",
      why: "Staying on the line means the person answering can ask more questions and tell you what to do next, such as keeping the person still or waving at the arriving help. Hanging up early cuts that help off. If you are not sure what to say, the person answering will guide you with questions, so stay with them.",
      holdBreakNote: "You hung up too early. Stay on the line until they tell you it is fine to go."
    },
    {
      id: "show-help-where-to-come",
      kind: "drag",
      target: "kfa-wave-token",
      drag: {
        to: "kfa-arrival-spot",
        radius: 0.45,
        missNote: "Not in place yet. Take it all the way to at the road edge, safely."
      },
      title: "Show help where to come",
      cue: "Drag the waving arm to the safe spot by the road where help will arrive.",
      why: "Showing arriving help exactly where to go saves time. Standing safely at the road edge, with an adult, and waving is a useful job a young person can do while trained people take over. Responders arriving at a busy place lose time finding the right spot, so a clear signal from a safe place gets them there sooner."
    },
    {
      id: "spot-the-problems-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kfa-hp-danger",
        "kfa-hp-treat",
        "kfa-hp-vague"
      ],
      itemNames: {
        "kfa-hp-danger": "running in without checking",
        "kfa-hp-treat": "trying a treatment",
        "kfa-hp-vague": "a vague location"
      },
      itemNotes: {
        "kfa-hp-danger": "Check for danger first. Keep yourself safe.",
        "kfa-hp-treat": "Call, do not treat. Trained people will know what to do.",
        "kfa-hp-vague": "Look for a sign or landmark and say it clearly."
      },
      decoyNotes: {
        "kfa-hp-adult": "Right first move. Keep it."
      },
      title: "Spot the problems in a classmate's plan",
      cue: "Look at the classmate's help plan and mark each problem.",
      why: "Help plans go wrong in predictable ways: running into danger, trying a treatment and giving a vague location. Spotting them in someone else's plan helps you remember the right order when it matters. The right order is always the same: stay safe, fetch an adult, call for help and say exactly where you are."
    },
    {
      id: "say-what-you-will-not-do",
      kind: "select",
      target: "kfa-clinical-card",
      title: "Say what you will not do",
      cue: "Say why you will not try to treat the injury yourself.",
      why: "Knowing what not to do is part of being helpful. Leaving treatment to trained people, and doing the things you can do well, staying safe, calling and guiding, is what actually helps the person most. Trying a treatment you have not been trained in can make things worse, and it takes an adult's attention away from calling for help."
    },
    {
      id: "stay-steady-until-help-arrives",
      kind: "track",
      target: "kfa-track-meter",
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
        label: "STEADY",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Stay steady until help arrives",
      cue: "Hold yourself in band — calm and near the adult — until help arrives.",
      why: "Waiting for help is hard, and it is tempting to do something, anything. Staying calm, close to the adult and ready to answer questions is the most useful thing to do until trained people take over. Moving about or crowding round only adds to the confusion that responders then have to sort out.",
      holdBreakNote: "You drifted from calm. Take a breath and stay beside the adult."
    },
    {
      id: "tell-the-adult-what-happened",
      kind: "select",
      target: "kfa-help-log",
      doneLine: "Account given",
      title: "Tell the adult what happened",
      cue: "When help has arrived, tell the adult what you saw.",
      why: "Afterwards, telling the adult clearly what you saw helps them and the responders. Keep it to what you saw, in order, the same way a clear report is written. Guesses about what caused it can wait; the responders need what you actually saw first."
    },
    {
      id: "share-the-steps-with-the-class",
      kind: "select",
      target: "kfa-share-board",
      doneLine: "Steps shared",
      title: "Share the steps with the class",
      cue: "Tell the class the steps: safe, adult, call, where.",
      why: "Sharing the steps helps classmates remember them, and saying them out loud fixes them in your own memory. Short steps that everyone knows are exactly what helps in a real emergency. In a frightening moment people fall back on what they have practised, so the practice is the preparation."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kfa-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the lesson go? Which part was hardest?",
      why: "A short check-in at the end tells the teacher who is confident and who needs another go, and gives each learner a moment to notice what they can now do. Nobody is marked here, and a teacher or trusted adult is there for anyone who wants to talk more."
    }
  ],

  interrupts: [
    {
      id: "a-car-pulls-up-fast",
      kind: "Traffic",
      after: "stay-on-the-line",
      delay: 3,
      seconds: 12,
      target: "kfa-step-back-to-kerb",
      alert: "A car pulls up fast close to where you are standing near the road.",
      cue: "Step back onto the pavement with the adult; do not go into the road.",
      why: "Traffic is the danger you checked for at the start, and it can arrive at any moment. Stepping back to the pavement with the adult keeps you safe; you are no help to anyone if you are hurt too.",
      missNote: "Nobody stepped back, and a classmate was nearly clipped by the car door. Next time, stop the lesson and deal with it first.",
      wrongNote: "That does not keep you safe. Step back onto the pavement. Choose the response that deals with it now."
    },
    {
      id: "the-firefighter-asks-where-you-are",
      kind: "Firefighter question",
      after: "stay-steady-until-help-arrives",
      delay: 3,
      seconds: 12,
      target: "kfa-give-the-landmark",
      alert: "The firefighter, playing the call handler, asks exactly where you are.",
      cue: "Give the street sign or landmark you noticed, clearly.",
      why: "A clear location is the single most useful thing a caller gives. The firefighter asks because that is the first thing a real call handler needs, and noticing a sign at the start makes it easy to answer.",
      missNote: "You said 'near the park', and the practice responders went to the wrong side of it.",
      wrongNote: "That is too vague. Give the sign or landmark you noticed. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x9a6ad0;
    const CSS = "#9a6ad0";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6f6a78", base2: "#625e6c", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e4dfe8", base2: "#d6d0dc", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a hall's stage behind the station: risers, a curtain, footlights and rows of seats at the sides
    void wallMat;
    const stage = group(g, 0, 0, -4.4);
    box(stage, 6.6, 0.5, 1.6, 0, 0.25, 0, 0x4a3a30, { rough: 0.7 });
    box(stage, 6.8, 0.05, 1.7, 0, 0.52, 0, 0x6b4a2e, { rough: 0.6 });
    box(stage, 6.6, 2.6, 0.1, 0, 1.85, -0.75, 0x7a2a2a, { rough: 0.95 });
    for (let i = 0; i < 7; i++) box(stage, 0.12, 2.5, 0.06, -2.7 + i * 0.9, 1.85, -0.68, 0x8a3232, { rough: 0.95 });
    for (let i = 0; i < 6; i++) ball(stage, 0.05, -2.5 + i * 1.0, 0.56, 0.8, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.2, rough: 0.4, seg: 8 });
    for (const side of [-1, 1]) for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const seat = group(g, side * (2.9 + c * 0.55), 0, -3.2 + r * 0.7, side * 0.35);
      box(seat, 0.45, 0.06, 0.45, 0, 0.45, 0, 0x2a5a8a, { rough: 0.8 });
      box(seat, 0.45, 0.5, 0.06, 0, 0.72, -0.2, 0x2a5a8a, { rough: 0.8 });
      for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) box(seat, 0.03, 0.42, 0.03, lx, 0.21, lz, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    }

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "kfa-danger", "any danger nearby, like traffic", {});
    bead(-1.42, 1.18, -0.62, "kfa-responding", "whether the person is responding", {});
    bead(-1.03, 1.46, -0.71, "kfa-where", "a street sign or landmark", {});
    bead(-1.08, 0.9, -1.11, "kfa-balloon", "a balloon from the open day", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kfa-ord-where", "1 · where you are", {});
    bead(-0.58, 1.46, -1.44, "kfa-ord-what", "2 · what happened", {});
    bead(-0.24, 0.9, -1.23, "kfa-ord-many", "3 · how many people", {});
    bead(0, 1.18, -1.55, "kfa-ord-stay", "4 · stay on the line", {});
    bead(0.24, 1.46, -1.23, "kfa-stay-line", "Staying on the line", {});
    bead(0.58, 0.9, -1.44, "kfa-hp-danger", "running in without checking", {});
    bead(0.68, 1.18, -1.05, "kfa-hp-treat", "trying a treatment", {});
    bead(1.08, 1.46, -1.11, "kfa-hp-vague", "a vague location", {});
    bead(1.03, 0.9, -0.71, "kfa-hp-adult", "getting an adult first", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kfa-step-back-to-kerb", "Step back from the road", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kfa-give-the-landmark", "Give a clear location", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kfa-adult-card", "Get an adult", "GET AN\nADULT", { ry: 1.2 });
    dials["kfa-phone-dial"] = dial(-1.89, -1.4, 0.93, "kfa-phone-dial", "Phone to speaker");
    meters["kfa-calm-meter"] = meter(-1.45, -1.85, 0.67, "kfa-calm-meter", "Calm voice");
    tokens["kfa-wave-token"] = token(-0.92, -2.16, 0.4, "kfa-wave-token", "Arm raised");
    spots["kfa-arrival-spot"] = spot(-0.31, -2.33, 0.13, "kfa-arrival-spot", "At the road edge, safely");
    card(0.31, 1.35, -2.33, "kfa-clinical-card", "Not a clinical step", "CALL, DON'T\nTREAT", { ry: -0.13 });
    meters["kfa-track-meter"] = meter(0.92, -2.16, -0.4, "kfa-track-meter", "Steady until help arrives");
    boards["kfa-help-log"] = board(1.45, -1.85, -0.67, "kfa-help-log", "What happened, told");
    boards["kfa-share-board"] = board(1.89, -1.4, -0.93, "kfa-share-board", "Share with the class");
    boards["kfa-checkin"] = board(2.19, -0.85, -1.2, "kfa-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "rush-into-danger", "Run straight to them across the road?", "RUN\nSTRAIGHT IN", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "try-a-treatment", "Try to fix their arm yourself?", "FIX IT\nMYSELF", 0.3);
    hazardCard(0.58, 0.72, -1.86, "hang-up-early", "Hang up as soon as you have said what happened?", "HANG UP\nQUICK", -0.3);
    hazardCard(1.53, 0.72, -1.21, "vague-location", "Say 'near the park' when asked where you are?", "NEAR THE\nPARK", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Safe. Adult. Call. Where."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Class teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Firefighter", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-car-pulls-up-fast"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-car-pulls-up-fast"].visible = false;
    arrivals["the-firefighter-asks-where-you-are"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-firefighter-asks-where-you-are"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "show-help-where-to-come") { const s = spots["kfa-arrival-spot"]; tokens["kfa-wave-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "tell-the-adult-what-happened") repaint(boards["kfa-help-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Account given"], "#59c97b"));
        if (step.id === "share-the-steps-with-the-class") repaint(boards["kfa-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Steps shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kfa-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-you-will-not-do") paintGuide("Say where you are, what happened, and stay on the line.");
      },

      onHazard() {
        paintGuide("Stop. Keep yourself safe and get an adult first.");
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
        if (it.id === "a-car-pulls-up-fast") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Back on the pavement with the adult. Safe first, then help."); }
        if (it.id === "the-firefighter-asks-where-you-are") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Clear location given. Help knows exactly where to come."); }
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
