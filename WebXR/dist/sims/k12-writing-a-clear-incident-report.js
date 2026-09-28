import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Writing a Clear Incident Report. Lower- and upper-secondary writing for life: a clear, factual report of something that happened in the scene, in order, separating what was seen from what was guessed.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_WRITING_A_CLEAR_INCIDENT_REPORT = {
  id: "k12-writing-a-clear-incident-report",
  index: "811",
  domain: "Education",
  trade: "Literacy class in the school hall after a practice incident — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Writing a Clear Incident Report",
  title: simTitle("Writing a Clear Incident Report"),
  tagline: "What happened, when, where, who, what was done — facts first, guesses labelled",
  accent: 0x9a6ad0,
  accentCss: "#9a6ad0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"just-the-facts","name":"Just the Facts","note":"A report written in order, facts kept apart from guesses and read back for clarity"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Report Board",
    currency: "LINES",
    ranks: ["Noticer","Note-taker","Reporter","Editor","Writer"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-the-report-needs") },
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
    "write-a-guess-as-fact": "You wrote why the pupil tripped as if you had seen it. A report states what you saw; anything you think but did not see is labelled as what you think, or left out. Guesses written as facts can blame the wrong person and hide the real cause.",
    "blame-in-the-report": "You wrote who was to blame. An incident report describes what happened so it can be put right; deciding blame is someone else's job, and a report that blames gets argued with instead of acted on.",
    "wait-until-tomorrow": "You decided to write the report tomorrow. Memory fades and changes quickly, and a report written the same day is far more accurate; writing it while it is fresh is part of doing it properly.",
    "name-people-carelessly": "You put classmates' details into a report that others would read. Reports go to the people who need them and include only the details they need; care with other people's information is part of writing responsibly."
  },

  lateNotes: {
    "kir-report-log": "The report is filed once it is written and read back — nothing to file yet.",
    "kir-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-what-the-report-needs",
      kind: "find",
      noHint: true,
      targets: [
        "kir-strap",
        "kir-fall",
        "kir-called"
      ],
      itemNames: {
        "kir-strap": "the bag strap across the walkway",
        "kir-fall": "the pupil falling and holding their wrist",
        "kir-called": "the supervisor being called"
      },
      itemNotes: {
        "kir-strap": "Something you saw. It may explain the fall — write it as what you saw.",
        "kir-fall": "What happened, as seen. No guesses about why.",
        "kir-called": "What was done. Reports include the response."
      },
      decoyNotes: {
        "kir-poster": "Not part of what happened. Stick to what matters."
      },
      title: "Find what the report needs",
      cue: "Mark the three things you saw that belong in the report.",
      why: "A good report starts with what you actually observed. Here that is the bag strap across the walkway, the pupil falling and holding their wrist, and the supervisor being called. Picking out the facts you saw, before writing a word, keeps the report accurate and useful."
    },
    {
      id: "write-the-report-while-it-is",
      kind: "select",
      target: "kir-fresh-card",
      title: "Write the report while it is fresh",
      cue: "Start the report now, while you remember clearly.",
      why: "Memory is most accurate straight after something happens and changes quickly afterwards. Writing the report the same day, while details are fresh, is what makes it trustworthy, and it is what any workplace or school will ask for."
    },
    {
      id: "put-the-report-in-order",
      kind: "sequence",
      targets: [
        "kir-ord-what",
        "kir-ord-when",
        "kir-ord-who",
        "kir-ord-done"
      ],
      itemNames: {
        "kir-ord-what": "1 · what happened",
        "kir-ord-when": "2 · when and where",
        "kir-ord-who": "3 · who was involved",
        "kir-ord-done": "4 · what was done"
      },
      title: "Put the report in order",
      cue: "What happened, when and where, who was involved, what was done.",
      why: "A report in a fixed order is easy to read and hard to misunderstand. Saying what happened first gives the reader the point; when and where set the scene; who was involved says who to ask; what was done shows the response. Readers find what they need without searching.",
      outOfOrderNote: "Out of order. Start with what happened, so the reader knows the point."
    },
    {
      id: "recall-exactly-what-you-saw",
      kind: "hold",
      target: "kir-recall-hold",
      seconds: 6,
      title: "Recall exactly what you saw",
      cue: "Hold still and picture the moment before you write.",
      why: "Taking a moment to picture exactly what you saw, before writing, separates memory from assumption. It is often in that pause that you notice you did not actually see the pupil's foot catch, only the fall. Being honest about what you did not see is as important as reporting what you did.",
      holdBreakNote: "You rushed into writing and mixed in a guess. Stop and picture what you actually saw."
    },
    {
      id: "read-the-report-back-before-handing",
      kind: "select",
      target: "kir-readback-card",
      title: "Read the report back before handing it in",
      cue: "Read your report back as if you were someone who was not there.",
      why: "Reading a report back as a stranger would shows at once where it is unclear or where a guess slipped in. Every good writer rereads before handing over; for a report, it is where most mistakes are caught. Reading aloud slows you down enough to hear a missing word, a muddled order or a guess that crept in."
    },
    {
      id: "spot-the-problems-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kir-ir-guess",
        "kir-ir-blame",
        "kir-ir-no-response"
      ],
      itemNames: {
        "kir-ir-guess": "a guess written as fact",
        "kir-ir-blame": "blame instead of description",
        "kir-ir-no-response": "nothing on what was done"
      },
      itemNotes: {
        "kir-ir-guess": "Did they see it? Label it or leave it out.",
        "kir-ir-blame": "Describe what happened; blame is not the report's job.",
        "kir-ir-no-response": "The response belongs in every report."
      },
      decoyNotes: {
        "kir-ir-time": "When and where are exactly right. Keep them."
      },
      title: "Spot the problems in a classmate's report",
      cue: "Look at the draft report and mark each problem.",
      why: "Reports go wrong in predictable ways: a guess written as fact, blame instead of description and a missing 'what was done'. Spotting them in someone else's draft trains you to see them in your own. Reading someone else's draft with fresh eyes is easier than reading your own, which is why checking in pairs works so well."
    },
    {
      id: "turn-a-guess-into-a-statement",
      kind: "turn",
      target: "kir-fact-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "FACT"
      },
      title: "Turn a guess into a statement of what you saw",
      cue: "Turn the dial from 'they weren't looking' to what you actually saw.",
      why: "Rewriting a guess as an observation is the core skill of report writing. 'They weren't looking' becomes 'I saw them fall near the strap'. The second can be checked; the first cannot, and could be unfair. Keeping to what you saw also protects the people involved from being judged on a guess."
    },
    {
      id: "keep-sentences-clear-and-short",
      kind: "gauge",
      target: "kir-clarity-meter",
      gauge: {
        label: "CLEAR",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too long and the facts get lost; too clipped and they stop making sense. Try again."
      },
      title: "Keep sentences clear and short",
      cue: "Commit when your sentences are short enough to read at a glance but still complete.",
      why: "Long sentences hide facts and short fragments lose them. Clear, complete sentences of moderate length are what make a report readable by someone in a hurry, which is who usually reads them. The same fixed order also makes it easy to spot a part that has been left out before the report is handed in."
    },
    {
      id: "hand-the-report-to-the-right",
      kind: "drag",
      target: "kir-report-token",
      drag: {
        to: "kir-supervisor-spot",
        radius: 0.45,
        missNote: "Not in place yet. Take it all the way to with the hall supervisor."
      },
      title: "Hand the report to the right person",
      cue: "Drag your report to the hall supervisor, who needs it.",
      why: "A report only helps once it reaches the person who can act on it. Handing it to the supervisor, rather than leaving it on a desk or sharing it around, means it gets acted on and other people's details stay private. A report left in a bag or shared around the class helps nobody and can hurt the people named in it."
    },
    {
      id: "keep-the-report-factual-to-the",
      kind: "track",
      target: "kir-track-meter",
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
        label: "FACTUAL"
      },
      title: "Keep the report factual to the end",
      cue: "Hold the report in band with what you saw as you finish the last lines.",
      why: "The end of a report is where opinions creep in: a summary, a judgement, a suggestion of fault. Keeping the last lines as factual as the first is what makes the whole report trustworthy. A single guess stated as fact can make a reader doubt every other line, even the lines that are true.",
      holdBreakNote: "The report drifted into opinion. Bring the last lines back to what you saw."
    },
    {
      id: "file-the-report",
      kind: "select",
      target: "kir-report-log",
      doneLine: "Report filed",
      title: "File the report",
      cue: "File the finished report where the school keeps them.",
      why: "Filing the report means it can be found later if the incident needs following up, and it helps the school spot patterns, like a walkway where bags are always left. A filed report does more good than a remembered one."
    },
    {
      id: "share-one-report-writing-tip",
      kind: "select",
      target: "kir-share-board",
      doneLine: "Tips shared",
      title: "Share one report-writing tip",
      cue: "Tell the class one thing that made your report clearer.",
      why: "Sharing a tip helps classmates and fixes it in your own memory. The best tips are simple: write it today, facts first, read it back. Sharing them with classmates means a whole class knows how to report clearly, which helps the school when something does go wrong."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kir-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the report go? Which part was hardest?",
      why: "A short check-in at the end tells the teacher who is confident and who needs another go, and gives each learner a moment to notice what they can now do. Nobody is marked here, and a teacher or trusted adult is there for anyone who wants to talk more."
    }
  ],

  interrupts: [
    {
      id: "the-pupil-looks-pale",
      kind: "Pupil unwell",
      after: "recall-exactly-what-you-saw",
      delay: 3,
      seconds: 12,
      target: "kir-call-the-supervisor",
      alert: "While you write, the pupil who fell says they feel sick and looks pale.",
      cue: "Stop writing and call the supervisor straight away; the report can wait.",
      why: "A report is never more important than a person. When someone looks unwell, the right thing is to stop and get an adult at once; the report can be finished afterwards.",
      missNote: "Nobody called the supervisor, and the pupil was left alone while the reports were finished.",
      wrongNote: "That does not get help. Call the supervisor. Choose the response that deals with it now."
    },
    {
      id: "the-supervisor-asks-did-you-see-it",
      kind: "Supervisor question",
      after: "keep-the-report-factual-to-the",
      delay: 3,
      seconds: 12,
      target: "kir-say-what-you-saw",
      alert: "The supervisor asks whether you saw the pupil trip on the strap.",
      cue: "Say exactly what you saw, and say plainly what you did not see.",
      why: "Saying what you did not see is as important as what you did. It stops a guess becoming the official version, and it is what makes your report trustworthy to the supervisor.",
      missNote: "You said yes to be helpful, though you only saw the fall, and the report now states it as fact.",
      wrongNote: "That goes beyond what you saw. Say what you saw and what you did not."
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
      box(desk, 0.9, 0.04, 0.55, 0, 0.74, 0, 9067184, { rough: 0.6 });
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
    bead(-1.22, 0.9, -0.27, "kir-strap", "the bag strap across the walkway", {});
    bead(-1.42, 1.18, -0.62, "kir-fall", "the pupil falling and holding their wrist", {});
    bead(-1.03, 1.46, -0.71, "kir-called", "the supervisor being called", {});
    bead(-1.08, 0.9, -1.11, "kir-poster", "a poster on the wall", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kir-ord-what", "1 · what happened", {});
    bead(-0.58, 1.46, -1.44, "kir-ord-when", "2 · when and where", {});
    bead(-0.24, 0.9, -1.23, "kir-ord-who", "3 · who was involved", {});
    bead(0, 1.18, -1.55, "kir-ord-done", "4 · what was done", {});
    bead(0.24, 1.46, -1.23, "kir-recall-hold", "Recalling what you saw", {});
    bead(0.58, 0.9, -1.44, "kir-ir-guess", "a guess written as fact", {});
    bead(0.68, 1.18, -1.05, "kir-ir-blame", "blame instead of description", {});
    bead(1.08, 1.46, -1.11, "kir-ir-no-response", "nothing on what was done", {});
    bead(1.03, 0.9, -0.71, "kir-ir-time", "the time and place given", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kir-call-the-supervisor", "Call the supervisor at once", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kir-say-what-you-saw", "Say what you saw and what you did not", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kir-fresh-card", "Write it the same day", "WRITE IT\nTODAY", { ry: 1.2 });
    dials["kir-fact-dial"] = dial(-1.89, -1.4, 0.93, "kir-fact-dial", "Guess to fact");
    meters["kir-clarity-meter"] = meter(-1.45, -1.85, 0.67, "kir-clarity-meter", "Sentence length");
    tokens["kir-report-token"] = token(-0.92, -2.16, 0.4, "kir-report-token", "Your report");
    spots["kir-supervisor-spot"] = spot(-0.31, -2.33, 0.13, "kir-supervisor-spot", "With the hall supervisor");
    card(0.31, 1.35, -2.33, "kir-readback-card", "Read it back", "READ IT\nBACK", { ry: -0.13 });
    meters["kir-track-meter"] = meter(0.92, -2.16, -0.4, "kir-track-meter", "Staying factual");
    boards["kir-report-log"] = board(1.45, -1.85, -0.67, "kir-report-log", "Report record");
    boards["kir-share-board"] = board(1.89, -1.4, -0.93, "kir-share-board", "Share with the class");
    boards["kir-checkin"] = board(2.19, -0.85, -1.2, "kir-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "write-a-guess-as-fact", "Write down why they tripped as if you saw it?", "THEY WEREN'T\nLOOKING", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "blame-in-the-report", "Write who was to blame?", "IT WAS\nTHEIR FAULT", 0.3);
    hazardCard(0.58, 0.72, -1.86, "wait-until-tomorrow", "Leave the report until tomorrow?", "DO IT\nTOMORROW", -0.3);
    hazardCard(1.53, 0.72, -1.21, "name-people-carelessly", "Put classmates' full details in a report others will see?", "EVERYONE'S\nDETAILS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Seen, not guessed."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Literacy teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Hall supervisor", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-pupil-looks-pale"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-pupil-looks-pale"].visible = false;
    arrivals["the-supervisor-asks-did-you-see-it"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-supervisor-asks-did-you-see-it"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "hand-the-report-to-the-right") { const s = spots["kir-supervisor-spot"]; tokens["kir-report-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "file-the-report") repaint(boards["kir-report-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Report filed"], "#59c97b"));
        if (step.id === "share-one-report-writing-tip") repaint(boards["kir-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Tips shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kir-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "read-the-report-back-before-handing") paintGuide("What, when, where, who, what was done.");
      },

      onHazard() {
        paintGuide("Stop. Did you see that, or are you guessing?");
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
        if (it.id === "the-pupil-looks-pale") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Supervisor called at once. The report was finished afterwards."); }
        if (it.id === "the-supervisor-asks-did-you-see-it") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Seen and not seen, both stated. The supervisor can rely on the report."); }
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
