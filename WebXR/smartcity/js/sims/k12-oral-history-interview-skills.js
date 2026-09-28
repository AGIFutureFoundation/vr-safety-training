import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Oral History Interview Skills. Lower-secondary history at a union hall's meeting room: how to record an oral history interview with a retired worker, from consent and open questions to listening, checking and archiving, with the interviewee invented for the lesson and memory treated as a source to be weighed like any other.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ORAL_HISTORY_INTERVIEW_SKILLS = {
  id: "k12-oral-history-interview-skills",
  index: "823",
  domain: "Education",
  trade: "History class in the union hall's meeting room — learner and oral history volunteer",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Oral History Interview Skills",
  title: simTitle("Oral History Interview Skills"),
  tagline: "Ask consent, ask open questions, then listen — a memory is a source, not a verdict",
  accent: 0xc08a4a,
  accentCss: "#c08a4a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"careful-listener","name":"Careful Listener","note":"An interview recorded with consent, open questions and follow-ups, and the memory weighed as a source"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Archive Board",
    currency: "STORIES",
    ranks: ["Listener","Interviewer","Recorder","Archivist","Historian"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-you-need-before-the") },
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
    "record-without-asking": "You started recording before asking permission. An oral history belongs to the person telling it; they decide whether they are recorded, what is kept and who may hear it. Consent comes first, every time, and it can be withdrawn.",
    "lead-the-answer": "You asked a question that suggested its own answer. A leading question puts your idea into their memory and makes the recording less trustworthy; open questions like how, what and tell me about let them say what they actually remember.",
    "memory-is-a-fact": "You wrote the memory down as a proved fact. Memories are precious evidence of how things felt and what mattered, but they change over time; a historian checks them against other sources, just as they would a document.",
    "share-without-permission": "You wanted to post a clip online without asking. The interviewee agreed to a class archive, not the internet; sharing beyond what they agreed breaks their trust and their consent. Ask first, and respect the answer."
  },

  lateNotes: {
    "koh-archive-log": "The archive notes are written once the interview is over — nothing to record yet.",
    "koh-checkin": "The check-in comes at the very end of the session."
  },

  steps: [
    {
      id: "find-what-you-need-before-the",
      kind: "find",
      noHint: true,
      targets: [
        "koh-consent-form",
        "koh-question-list",
        "koh-recorder"
      ],
      itemNames: {
        "koh-consent-form": "the consent form",
        "koh-question-list": "a short list of open questions",
        "koh-recorder": "a tested recorder"
      },
      itemNotes: {
        "koh-consent-form": "It records what the interviewee agrees to.",
        "koh-question-list": "Open questions let them tell it their way.",
        "koh-recorder": "Check it works before, not during."
      },
      decoyNotes: {
        "koh-union-banner": "A striking thing to ask about later, but not something you need ready to start."
      },
      title: "Find what you need before the interview",
      cue: "Mark the three things you need ready before the interview begins.",
      why: "A good interview is prepared. A consent form sets out what will be recorded and who may hear it, a short list of open questions keeps the conversation focused without controlling it, and a working recorder means the words are kept. With those three ready, you can give your full attention to listening."
    },
    {
      id: "put-the-interview-in-order",
      kind: "sequence",
      targets: [
        "koh-ord-consent",
        "koh-ord-opening",
        "koh-ord-open",
        "koh-ord-thank"
      ],
      itemNames: {
        "koh-ord-consent": "1 · ask for consent",
        "koh-ord-opening": "2 · start with an easy opening question",
        "koh-ord-open": "3 · ask open questions and follow up",
        "koh-ord-thank": "4 · thank them and check what may be shared"
      },
      title: "Put the interview in order",
      cue: "Consent, an easy opening, open questions with follow-ups, then thank and check.",
      why: "Consent first makes the interview possible. An easy opening, such as asking where they grew up, helps the interviewee relax. Open questions and follow-ups draw out detail, and a thank-you with a check of what they are happy to share closes it respectfully.",
      outOfOrderNote: "Out of order. Consent comes before anything is recorded."
    },
    {
      id: "ask-for-consent-before-recording",
      kind: "select",
      target: "koh-consent-card",
      title: "Ask for consent before recording",
      cue: "Explain what the recording is for and ask the interviewee to agree before you press record.",
      why: "Consent is the foundation of oral history. Explaining clearly what the recording is for, who will hear it and that they can stop at any time lets the interviewee make a real choice, and it is how every responsible archive works."
    },
    {
      id: "turn-the-recorders-level-to-their",
      kind: "turn",
      target: "koh-level-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "LEVEL"
      },
      title: "Turn the recorder's level to their voice",
      cue: "Turn the recording level so their voice is clear without distorting.",
      why: "A recording that is too quiet loses words, and one that is too loud distorts them. Setting the level to the interviewee's voice before the main questions means their words will be heard clearly by everyone who listens later."
    },
    {
      id: "check-the-voice-level-is-in",
      kind: "gauge",
      target: "koh-voice-meter",
      gauge: {
        label: "VOICE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Adjust the level before the main questions."
      },
      title: "Check the voice level is in the band",
      cue: "Commit when the level meter sits in the band as they speak.",
      why: "A level meter shows whether the voice is being recorded well. Checking it while they speak, not only in silence, catches a quiet speaker or a noisy room before the whole interview is spoiled."
    },
    {
      id: "hold-the-pause-while-they-think",
      kind: "hold",
      target: "koh-hold-pause",
      seconds: 6,
      title: "Hold the pause while they think",
      cue: "Stay quiet and hold the pause while the interviewee gathers their thoughts.",
      why: "The best part of an answer often comes after a pause. Staying quiet and letting the silence sit gives the interviewee time to remember, instead of jumping in with another question that cuts off what they were about to say.",
      holdBreakNote: "You filled the silence too soon. Let them think, and hold the pause again."
    },
    {
      id: "choose-an-open-follow-up-question",
      kind: "drag",
      target: "koh-followup-token",
      drag: {
        to: "koh-question-spot",
        radius: 0.45,
        missNote: "Not in the slot yet. Put the open follow-up in the next question."
      },
      title: "Choose an open follow-up question",
      cue: "Drag the open follow-up card into the question slot.",
      why: "A follow-up like tell me more about that invites detail in the interviewee's own words. Choosing it over a yes or no question keeps the story theirs, and it is the single most useful habit of a good interviewer."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "koh-ip-consent",
        "koh-ip-leading",
        "koh-ip-share"
      ],
      itemNames: {
        "koh-ip-consent": "no consent step",
        "koh-ip-leading": "a question that suggests its answer",
        "koh-ip-share": "a plan to post clips online"
      },
      itemNotes: {
        "koh-ip-consent": "Consent comes first.",
        "koh-ip-leading": "Ask open questions.",
        "koh-ip-share": "Share only as agreed."
      },
      decoyNotes: {
        "koh-ip-thanks": "Thanking the interviewee is good practice. Keep it."
      },
      title: "Spot the problems in a classmate's interview plan",
      cue: "Look at the draft interview plan and mark each problem.",
      why: "Interview plans go wrong in familiar ways: no consent step, leading questions and a plan to share recordings more widely than agreed. Spotting them helps you plan an interview that is both good history and respectful of the person."
    },
    {
      id: "say-how-a-memory-is-a",
      kind: "select",
      target: "koh-compare-card",
      title: "Say how a memory is a source",
      cue: "Say what a memory can tell a historian, and what it needs checking against.",
      why: "A memory tells you how something felt and what mattered to the person who lived it, which documents often miss. But memories change, so a historian checks the details against records and other accounts, weighing the memory as they would any source."
    },
    {
      id: "keep-listening-through-a-long-answer",
      kind: "track",
      target: "koh-track-meter",
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
        label: "LISTENING"
      },
      title: "Keep listening through a long answer",
      cue: "Keep your attention on the speaker through a long answer, noting follow-ups quietly.",
      why: "Long answers are where the richest stories are, and staying attentive through them shows respect as well as catching details worth asking about. Noting follow-ups quietly lets you return to them without interrupting the flow.",
      holdBreakNote: "Your attention wandered. Bring it back to the speaker."
    },
    {
      id: "record-the-archive-notes",
      kind: "select",
      target: "koh-archive-log",
      doneLine: "Archive notes written",
      title: "Record the archive notes",
      cue: "Write who was interviewed, when, what they agreed to and a summary.",
      why: "An archive note tells future listeners what the recording is and what they may do with it. Writing the consent terms beside the summary protects the interviewee and makes the recording useful for years."
    },
    {
      id: "thank-the-interviewee-and-check-the",
      kind: "select",
      target: "koh-share-board",
      doneLine: "Thanked and sharing confirmed",
      title: "Thank the interviewee and check the sharing",
      cue: "Thank them and confirm what they are happy for the class archive to keep.",
      why: "Closing with thanks and a check of what may be kept respects the gift of their story. It gives them the last word on how it is used, which is at the heart of every ethical oral history project."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "koh-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the session",
      cue: "What did the interview teach you that a book could not? What was hard?",
      why: "Interviewers debrief after every recording, so the class does too: each learner says what their question drew out and what they would ask differently. Speaking about consent and listening in front of the group is practice for the real interviews, and it shows the archivist who is ready to lead one."
    }
  ],

  interrupts: [
    {
      id: "the-interviewee-becomes-upset",
      kind: "Upset interviewee",
      after: "hold-the-pause-while-they-think",
      delay: 3,
      seconds: 12,
      target: "koh-pause-offer",
      alert: "The interviewee's voice catches while describing a hard time at work, and they look upset.",
      cue: "Pause the recording and gently offer to stop or take a break.",
      why: "An interviewee's wellbeing matters more than the recording. Pausing and offering a break or an end gives them control, and it is what every oral history guide asks interviewers to do.",
      missNote: "You pressed on with the next question, and the interviewee ended the session upset.",
      wrongNote: "That carries on regardless. Pause and offer to stop. Choose the response that deals with it now."
    },
    {
      id: "the-volunteer-asks-about-consent",
      kind: "Volunteer question",
      after: "keep-listening-through-a-long-answer",
      delay: 3,
      seconds: 12,
      target: "koh-say-consent",
      alert: "The oral history volunteer asks what the interviewee agreed to and who may hear the recording.",
      cue: "Say what the consent form covers and who may hear it.",
      why: "The volunteer is checking you know the limits of consent. Saying exactly what was agreed shows the recording will be used only as the interviewee wished.",
      missNote: "You were not sure, and the volunteer had to check the form before anything could be kept.",
      wrongNote: "That does not say what was agreed. Choose the response that deals with it now."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7e746a", base2: "#70675e", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#eadfce", base2: "#dcd0be", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "koh-consent-form", "the consent form", {});
    bead(-1.42, 1.18, -0.62, "koh-question-list", "a short list of open questions", {});
    bead(-1.03, 1.46, -0.71, "koh-recorder", "a tested recorder", {});
    bead(-1.08, 0.9, -1.11, "koh-union-banner", "the banner on the wall", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "koh-ord-consent", "1 · ask for consent", {});
    bead(-0.58, 1.46, -1.44, "koh-ord-opening", "2 · start with an easy opening question", {});
    bead(-0.24, 0.9, -1.23, "koh-ord-open", "3 · ask open questions and follow up", {});
    bead(0, 1.18, -1.55, "koh-ord-thank", "4 · thank them and check what may be shared", {});
    bead(0.24, 1.46, -1.23, "koh-hold-pause", "Hold the pause", {});
    bead(0.58, 0.9, -1.44, "koh-ip-consent", "no consent step", {});
    bead(0.68, 1.18, -1.05, "koh-ip-leading", "a question that suggests its answer", {});
    bead(1.08, 1.46, -1.11, "koh-ip-share", "a plan to post clips online", {});
    bead(1.03, 0.9, -0.71, "koh-ip-thanks", "a thank-you at the end", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "koh-pause-offer", "Pause and offer to stop", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "koh-say-consent", "Say what the consent covers", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "koh-consent-card", "Ask for consent first", "MAY WE\nRECORD?", { ry: 1.2 });
    dials["koh-level-dial"] = dial(-1.89, -1.4, 0.93, "koh-level-dial", "Recording level");
    meters["koh-voice-meter"] = meter(-1.45, -1.85, 0.67, "koh-voice-meter", "Voice level");
    tokens["koh-followup-token"] = token(-0.92, -2.16, 0.4, "koh-followup-token", "Tell me more about that");
    spots["koh-question-spot"] = spot(-0.31, -2.33, 0.13, "koh-question-spot", "Next question");
    card(0.31, 1.35, -2.33, "koh-compare-card", "Memory as evidence", "FEELING AND\nCHECKING", { ry: -0.13 });
    meters["koh-track-meter"] = meter(0.92, -2.16, -0.4, "koh-track-meter", "Listening held");
    boards["koh-archive-log"] = board(1.45, -1.85, -0.67, "koh-archive-log", "Archive notes");
    boards["koh-share-board"] = board(1.89, -1.4, -0.93, "koh-share-board", "Thank and check");
    boards["koh-checkin"] = board(2.19, -0.85, -1.2, "koh-checkin", "End-of-session check-in");
    hazardCard(-1.53, 0.72, -1.21, "record-without-asking", "Start recording before asking permission?", "NO\nCONSENT", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "lead-the-answer", "Ask a question that tells them what to say?", "LEADING\nQUESTION", 0.3);
    hazardCard(0.58, 0.72, -1.86, "memory-is-a-fact", "Treat the memory as proved fact?", "MEMORY =\nFACT", -0.3);
    hazardCard(1.53, 0.72, -1.21, "share-without-permission", "Post a clip online without asking?", "POST IT\nONLINE", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Consent first, then listen."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Oral history volunteer", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Retired worker (invented)", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-interviewee-becomes-upset"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-interviewee-becomes-upset"].visible = false;
    arrivals["the-volunteer-asks-about-consent"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-volunteer-asks-about-consent"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "choose-an-open-follow-up-question") { const s = spots["koh-question-spot"]; tokens["koh-followup-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-archive-notes") repaint(boards["koh-archive-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Archive notes written"], "#59c97b"));
        if (step.id === "thank-the-interviewee-and-check-the") repaint(boards["koh-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Thanked and sharing confirmed"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["koh-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-how-a-memory-is-a") paintGuide("A memory is a source to weigh.");
      },

      onHazard() {
        paintGuide("Stop. Did they consent? Is the question open?");
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
        if (it.id === "the-interviewee-becomes-upset") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Recording paused, a break taken. The interviewee chose to carry on."); }
        if (it.id === "the-volunteer-asks-about-consent") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Consent terms stated. The volunteer files the recording."); }
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
