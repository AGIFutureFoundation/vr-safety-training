import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Public Speaking at the Hall. Upper-primary and lower-secondary literacy on a theatre's rehearsal stage: planning a short talk with one clear message, a beginning, middle and end, speaking clearly to the back row, handling nerves and questions, with the stage's own safety rules kept.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_PUBLIC_SPEAKING_AT_THE_HALL = {
  id: "k12-public-speaking-at-the-hall",
  index: "826",
  domain: "Education",
  trade: "Literacy class on the theatre's rehearsal stage — learner and stage manager",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Public Speaking at the Hall",
  title: simTitle("Public Speaking at the Hall"),
  tagline: "One clear message, told so the back row hears it — and mind the stage edge",
  accent: 0x9a6ad0,
  accentCss: "#9a6ad0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"back-row","name":"Back Row","note":"A short talk planned around one message, spoken clearly to the back row and questions answered calmly"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Stage Board",
    currency: "CUES",
    ranks: ["Listener","Rehearser","Speaker","Presenter","Orator"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-a-good-talk-needs") },
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
    "read-the-script-word-for-word": "You read every word from the page with your head down. The audience loses your face and your voice goes flat; short prompt cards with key words let you look up, speak naturally and still keep your place.",
    "cram-in-every-point": "You tried to squeeze in every point you could think of. Listeners remember a few things, not many; a talk with one clear message and a few supporting points is remembered, while a crowded one is forgotten by the time you sit down.",
    "step-back-to-the-edge": "You stepped backwards towards the edge of the stage. Stage edges are marked for a reason and the drop is real; speakers stay on the marked area, and the stage manager keeps the edge lit and taped.",
    "nerves-mean-you-are-bad": "You decided your nerves meant you could not do it. Nearly every speaker feels nervous; slow breathing, a planned first line and a friendly face in the audience help, and the nerves usually ease once you start."
  },

  lateNotes: {
    "kpk-talk-log": "The feedback is written once the talk is given — nothing to record yet.",
    "kpk-checkin": "The check-in comes at the very end of the rehearsal."
  },

  steps: [
    {
      id: "find-what-a-good-talk-needs",
      kind: "find",
      noHint: true,
      targets: [
        "kpk-message",
        "kpk-shape",
        "kpk-prompt-cards"
      ],
      itemNames: {
        "kpk-message": "your one clear message",
        "kpk-shape": "a beginning, middle and end",
        "kpk-prompt-cards": "prompt cards with key words"
      },
      itemNotes: {
        "kpk-message": "The single thing you want them to remember.",
        "kpk-shape": "Tell them what, tell them, tell them again.",
        "kpk-prompt-cards": "Enough to keep your place, not a script."
      },
      decoyNotes: {
        "kpk-costume-rail": "Fun to look at, but not what makes a talk work."
      },
      title: "Find what a good talk needs",
      cue: "Mark the three things you need before you step up to speak.",
      why: "A talk that works has one clear message you want the audience to remember, a shape with a beginning, middle and end, and prompt cards with key words rather than a full script. With those three ready, you can concentrate on speaking to people instead of reading at them."
    },
    {
      id: "learn-the-stage-safety-marks",
      kind: "select",
      target: "kpk-stage-card",
      title: "Learn the stage safety marks",
      cue: "Read the stage manager's card: stay inside the taped area, keep clear of the edge.",
      why: "A stage has a real drop at its edge, cables, and lights that can dazzle. Knowing where the taped speaking area is before you start means you can move naturally without thinking about where your feet are, which is exactly why actors walk the stage before a show."
    },
    {
      id: "put-the-talk-plan-in-order",
      kind: "sequence",
      targets: [
        "kpk-ord-message",
        "kpk-ord-opening",
        "kpk-ord-middle",
        "kpk-ord-ending"
      ],
      itemNames: {
        "kpk-ord-message": "1 · choose one clear message",
        "kpk-ord-opening": "2 · plan an opening that grabs attention",
        "kpk-ord-middle": "3 · build a middle with a few points",
        "kpk-ord-ending": "4 · plan an ending that repeats the message"
      },
      title: "Put the talk plan in order",
      cue: "Choose the message, plan the opening, build the middle, then plan the ending.",
      why: "Choosing your message first makes every other choice easier: the opening introduces it, the middle supports it and the ending repeats it. Planning in that order gives a talk a clear line from start to finish, which is what audiences follow and remember.",
      outOfOrderNote: "Out of order. Choose your one message before anything else."
    },
    {
      id: "hold-a-slow-breath-before-you",
      kind: "hold",
      target: "kpk-breath-hold",
      seconds: 6,
      title: "Hold a slow breath before you begin",
      cue: "Stand still and hold a slow, steady breath before your first line.",
      why: "A slow breath before speaking calms your heartbeat and steadies your voice. Standing still for that moment also signals to the audience that you are about to begin, and it gives you time to find your first line instead of rushing into it.",
      holdBreakNote: "You rushed in before the breath was finished. Stand still and take it again."
    },
    {
      id: "turn-to-face-the-whole-audience",
      kind: "turn",
      target: "kpk-face-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "FACE"
      },
      title: "Turn to face the whole audience",
      cue: "Turn so you face the middle of the audience, not the teacher or the wall.",
      why: "Facing the middle of the audience lets your voice carry to everyone and lets them see your face. Turning to one person or the screen shuts out the rest of the room, and it is one of the simplest habits that makes a speaker easy to follow."
    },
    {
      id: "pitch-your-voice-to-the-back",
      kind: "gauge",
      target: "kpk-voice-meter",
      gauge: {
        label: "VOICE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "The back row would not hear that. Speak from your chest, clearly and a little slower."
      },
      title: "Pitch your voice to the back row",
      cue: "Commit when the voice meter shows you would be heard at the back.",
      why: "Speaking to the back row, not the front, makes sure everyone hears without you shouting. It is about projecting from your chest and speaking clearly, and stage managers check it with a friend at the back before every show."
    },
    {
      id: "put-the-prompt-card-in-your",
      kind: "drag",
      target: "kpk-card-token",
      drag: {
        to: "kpk-hand-spot",
        radius: 0.45,
        missNote: "Not in your hand yet. Take the key-word card, not the full script."
      },
      title: "Put the prompt card in your hand",
      cue: "Drag the key-word prompt card to your hand, leaving the full script on the table.",
      why: "A prompt card with a few key words keeps your place while letting you look up. Leaving the full script behind stops the temptation to read, and it is what experienced speakers do so that they talk to people rather than to paper."
    },
    {
      id: "say-why-one-message-beats-many",
      kind: "select",
      target: "kpk-compare-card",
      title: "Say why one message beats many",
      cue: "Say why a talk with one clear message is remembered better than one with many.",
      why: "Listeners cannot flip back a page, so they remember what is clear and repeated. One message, supported and repeated, gives them something to take home; many messages compete and are lost. Saying why is understanding how talks work."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "kpk-tp-no-message",
        "kpk-tp-script",
        "kpk-tp-ending"
      ],
      itemNames: {
        "kpk-tp-no-message": "no clear message",
        "kpk-tp-script": "a full script to read",
        "kpk-tp-ending": "an ending that just stops"
      },
      itemNotes: {
        "kpk-tp-no-message": "Choose one thing to remember.",
        "kpk-tp-script": "Use key-word cards instead.",
        "kpk-tp-ending": "End by repeating the message."
      },
      decoyNotes: {
        "kpk-tp-opening": "A question is a good opening. Keep it."
      },
      title: "Spot the problems in a classmate's talk plan",
      cue: "Look at the draft talk plan and mark each problem.",
      why: "Talk plans go wrong in familiar ways: no clear message, a full script to read and an ending that stops without repeating the point. Spotting them in someone else's plan helps you build a stronger one of your own."
    },
    {
      id: "keep-your-pace-steady-through-the",
      kind: "track",
      target: "kpk-track-meter",
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
        label: "PACE"
      },
      title: "Keep your pace steady through the talk",
      cue: "Keep your speaking pace in the band, not rushing as nerves build.",
      why: "Nerves speed speakers up, and a rushed talk is hard to follow. Keeping a steady pace, with small pauses between points, gives the audience time to take in each idea, and it makes you sound calmer than you might feel.",
      holdBreakNote: "You sped up. Pause, breathe and bring your pace back down."
    },
    {
      id: "record-feedback-on-your-talk",
      kind: "select",
      target: "kpk-talk-log",
      doneLine: "Feedback recorded",
      title: "Record feedback on your talk",
      cue: "Write one thing that went well and one thing to try next time.",
      why: "Writing one strength and one next step turns a talk into practice for the next one. It keeps the focus on getting better rather than on being perfect, and it gives you something clear to work on."
    },
    {
      id: "thank-the-audience-and-invite-questions",
      kind: "select",
      target: "kpk-share-board",
      doneLine: "Questions answered",
      title: "Thank the audience and invite questions",
      cue: "Thank the audience and invite questions, listening fully before you answer.",
      why: "Thanking the audience and inviting questions ends a talk warmly and shows respect. Listening to the whole question before answering, and saying if you do not know, is what makes questions a conversation rather than a test."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kpk-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the rehearsal",
      cue: "How did it feel to speak? What would help you next time?",
      why: "A check-in lets each speaker say how it felt, which matters as much as how it sounded, and lets the teacher support anyone who found it hard. It is not marked, and anyone who felt anxious can talk to the teacher or a trusted adult."
    }
  ],

  interrupts: [
    {
      id: "a-stage-light-flickers-out",
      kind: "Stage fault",
      after: "hold-a-slow-breath-before-you",
      delay: 3,
      seconds: 12,
      target: "kpk-stand-still",
      alert: "A stage light flickers and goes out, leaving part of the stage dim.",
      cue: "Stand still where you are and wait for the stage manager's instruction.",
      why: "In sudden dimness, moving is how people step off an edge or trip on a cable. Standing still and waiting for the stage manager keeps you safe while they fix the light or bring up the working lights.",
      missNote: "You walked towards the wings in the dark and caught a cable, nearly falling off the stage.",
      wrongNote: "That moves you in the dark. Stand still and wait. Choose the response that deals with it now."
    },
    {
      id: "the-stage-manager-asks-your-message",
      kind: "Stage manager question",
      after: "keep-your-pace-steady-through-the",
      delay: 3,
      seconds: 12,
      target: "kpk-say-message",
      alert: "The stage manager asks what the one thing is that you want the audience to remember.",
      cue: "Say your one clear message in a single sentence.",
      why: "If you can say your message in one sentence, the audience can remember it. The stage manager is checking that the talk has a clear centre before you step out.",
      missNote: "You listed several ideas, and the stage manager asked you to choose one before you went on.",
      wrongNote: "That is more than one message. Choose the response that deals with it now."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6e6670", base2: "#625a64", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e6dcea", base2: "#d8ccde", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "kpk-message", "your one clear message", {});
    bead(-1.42, 1.18, -0.62, "kpk-shape", "a beginning, middle and end", {});
    bead(-1.03, 1.46, -0.71, "kpk-prompt-cards", "prompt cards with key words", {});
    bead(-1.08, 0.9, -1.11, "kpk-costume-rail", "the costume rail in the wings", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kpk-ord-message", "1 · choose one clear message", {});
    bead(-0.58, 1.46, -1.44, "kpk-ord-opening", "2 · plan an opening that grabs attention", {});
    bead(-0.24, 0.9, -1.23, "kpk-ord-middle", "3 · build a middle with a few points", {});
    bead(0, 1.18, -1.55, "kpk-ord-ending", "4 · plan an ending that repeats the message", {});
    bead(0.24, 1.46, -1.23, "kpk-breath-hold", "Slow breath first", {});
    bead(0.58, 0.9, -1.44, "kpk-tp-no-message", "no clear message", {});
    bead(0.68, 1.18, -1.05, "kpk-tp-script", "a full script to read", {});
    bead(1.08, 1.46, -1.11, "kpk-tp-ending", "an ending that just stops", {});
    bead(1.03, 0.9, -0.71, "kpk-tp-opening", "a question to open the talk", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kpk-stand-still", "Stand still and wait for the stage manager", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kpk-say-message", "Say your one message", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kpk-stage-card", "Stay inside the tape", "INSIDE\nTHE TAPE", { ry: 1.2 });
    dials["kpk-face-dial"] = dial(-1.89, -1.4, 0.93, "kpk-face-dial", "Face the audience");
    meters["kpk-voice-meter"] = meter(-1.45, -1.85, 0.67, "kpk-voice-meter", "Voice to the back row");
    tokens["kpk-card-token"] = token(-0.92, -2.16, 0.4, "kpk-card-token", "Key-word prompt card");
    spots["kpk-hand-spot"] = spot(-0.31, -2.33, 0.13, "kpk-hand-spot", "In your hand");
    card(0.31, 1.35, -2.33, "kpk-compare-card", "One or many?", "ONE CLEAR\nMESSAGE", { ry: -0.13 });
    meters["kpk-track-meter"] = meter(0.92, -2.16, -0.4, "kpk-track-meter", "Steady pace");
    boards["kpk-talk-log"] = board(1.45, -1.85, -0.67, "kpk-talk-log", "Talk feedback");
    boards["kpk-share-board"] = board(1.89, -1.4, -0.93, "kpk-share-board", "Thanks and questions");
    boards["kpk-checkin"] = board(2.19, -0.85, -1.2, "kpk-checkin", "End-of-rehearsal check-in");
    hazardCard(-1.53, 0.72, -1.21, "read-the-script-word-for-word", "Read the whole talk word for word from the page?", "READ IT\nALL", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "cram-in-every-point", "Squeeze in every point you can think of?", "EVERY\nPOINT", 0.3);
    hazardCard(0.58, 0.72, -1.86, "step-back-to-the-edge", "Step backwards towards the stage edge?", "STAGE\nEDGE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "nerves-mean-you-are-bad", "Decide the nerves mean you cannot speak?", "TOO\nNERVOUS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["One message, to the back row."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "English teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Stage manager", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Lighting technician", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-stage-light-flickers-out"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-stage-light-flickers-out"].visible = false;
    arrivals["the-stage-manager-asks-your-message"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-stage-manager-asks-your-message"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "put-the-prompt-card-in-your") { const s = spots["kpk-hand-spot"]; tokens["kpk-card-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-feedback-on-your-talk") repaint(boards["kpk-talk-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Feedback recorded"], "#59c97b"));
        if (step.id === "thank-the-audience-and-invite-questions") repaint(boards["kpk-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Questions answered"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kpk-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-one-message-beats-many") paintGuide("One message is remembered.");
      },

      onHazard() {
        paintGuide("Stop. Is there one message? Are you clear of the edge?");
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
        if (it.id === "a-stage-light-flickers-out") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Working lights up, stage safe. The rehearsal carries on."); }
        if (it.id === "the-stage-manager-asks-your-message") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Message said in one sentence. You are ready."); }
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
