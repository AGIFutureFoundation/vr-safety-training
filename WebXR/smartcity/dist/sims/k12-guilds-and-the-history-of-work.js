import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Guilds and the History of Work. Lower-secondary history at a union hall's library corner: trade guilds and the history of work told only through widely established general facts (craft guilds organised people of one trade, trained apprentices and set standards) and framed as research prompts for everything else, with every claim traced to a source the learner finds.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_GUILDS_AND_THE_HISTORY_OF_WORK = {
  id: "k12-guilds-and-the-history-of-work",
  index: "824",
  domain: "Education",
  trade: "History class in the union hall's library corner — learner and hall librarian",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Guilds and the History of Work",
  title: simTitle("Guilds and the History of Work"),
  tagline: "Say only what is widely established, turn the rest into questions — and cite where you found it",
  accent: 0xc08a4a,
  accentCss: "#c08a4a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"research-prompt","name":"Research Prompt","note":"General facts about guilds kept apart from open questions, each claim traced to a source and a research question written"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Research Board",
    currency: "SOURCES",
    ranks: ["Reader","Note-taker","Researcher","Writer","Historian"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-three-kinds-of-card") },
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
    "guild-equals-union": "You said a medieval guild was the same as a modern union. Guilds often included the masters who ran workshops, while unions organise workers; there are links and differences worth researching, and treating them as the same skips the history.",
    "invent-a-date": "You filled a gap with a date that sounded right. A historian never invents evidence; if you do not know when something happened, you write it as a question to research and find a source, not a guess dressed as a fact.",
    "one-website-is-enough": "You trusted the first website you found. Check who wrote a source, what it is based on and whether other reliable sources agree; the librarian can help you find books and archives that say where their information comes from.",
    "everyone-was-the-same": "You said everyone in the past worked the same way. Work varied hugely by place, trade and time, and many workers were never in any guild; general statements need care, and the differences are often the most interesting research questions."
  },

  lateNotes: {
    "kgu-research-log": "The research record is written once the sources are checked — nothing to record yet.",
    "kgu-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-the-three-kinds-of-card",
      kind: "find",
      noHint: true,
      targets: [
        "kgu-fact-card",
        "kgu-question-card",
        "kgu-source-card"
      ],
      itemNames: {
        "kgu-fact-card": "a general fact card",
        "kgu-question-card": "a research question card",
        "kgu-source-card": "a source card"
      },
      itemNotes: {
        "kgu-fact-card": "Something widely established, stated generally.",
        "kgu-question-card": "Something to find out, not to guess.",
        "kgu-source-card": "Where the information came from."
      },
      decoyNotes: {
        "kgu-poster": "Interesting to look at, but check what it is based on before using it."
      },
      title: "Find the three kinds of card on the table",
      cue: "Mark a general fact card, a research question card and a source card.",
      why: "This lesson keeps three things apart. A general fact card holds something widely established, like craft guilds training apprentices; a research question card holds something to find out; and a source card records where information came from. Keeping them separate is the historian's habit that stops guesses becoming facts."
    },
    {
      id: "put-the-research-method-in-order",
      kind: "sequence",
      targets: [
        "kgu-ord-question",
        "kgu-ord-find",
        "kgu-ord-check",
        "kgu-ord-write"
      ],
      itemNames: {
        "kgu-ord-question": "1 · ask a research question",
        "kgu-ord-find": "2 · find sources",
        "kgu-ord-check": "3 · check who made them and if they agree",
        "kgu-ord-write": "4 · write what the sources show"
      },
      title: "Put the research method in order",
      cue: "Ask a question, find sources, check them, then write what they show.",
      why: "A clear question tells you what to look for. Finding sources, checking who made them and whether they agree, and only then writing what they show keeps your account honest and lets a reader follow your trail back to the evidence. Skipping the checking step is how a confident but unsupported claim slips into a finished piece of work.",
      outOfOrderNote: "Out of order. Check your sources before you write what they show."
    },
    {
      id: "read-the-librarys-handling-rules",
      kind: "select",
      target: "kgu-handling-card",
      title: "Read the library's handling rules",
      cue: "Read the card: clean dry hands, pencils only near old papers, and ask before copying.",
      why: "Old documents and books are fragile and often irreplaceable. Clean dry hands, pencils instead of pens, and asking before copying keep them safe for the next reader, and they are the rules every archive and library follows. A torn page or an ink mark cannot be undone, so the rules protect evidence nobody can replace."
    },
    {
      id: "turn-the-card-from-fact-to",
      kind: "turn",
      target: "kgu-flip-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "QUESTION"
      },
      title: "Turn the card from fact to question",
      cue: "Turn the card over: this claim is not widely established, so make it a question.",
      why: "When a claim is not widely established, the honest move is to turn it into a question to research. Doing it physically with the card builds the habit of asking whether you really know something before you write it as fact. A question written down is still progress: it tells the next reader exactly what is not yet known."
    },
    {
      id: "judge-how-reliable-the-source-is",
      kind: "gauge",
      target: "kgu-reliability-meter",
      gauge: {
        label: "RELIABILITY",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not where the evidence puts it. Check who made the source and what it cites."
      },
      title: "Judge how reliable the source is",
      cue: "Commit when the reliability bar sits where the source's evidence puts it.",
      why: "Sources vary in reliability: a book that cites its evidence is stronger than an unsigned post that cites nothing. Judging each one, rather than trusting or rejecting everything, is how historians build an account that stands up. A weak source is not useless; it may point you to a stronger one that it failed to cite."
    },
    {
      id: "hold-the-old-book-open-gently",
      kind: "hold",
      target: "kgu-book-hold",
      seconds: 6,
      title: "Hold the old book open gently",
      cue: "Support the old book's cover gently on the rest while you read.",
      why: "Forcing an old book flat can crack its spine. Supporting the cover gently on a rest, and holding it still while you read, protects it; the care you take with a source is part of respecting the evidence. Handling a source with care is also a way of respecting the people whose work and lives it records.",
      holdBreakNote: "The book slipped and pressed flat. Support the cover again gently."
    },
    {
      id: "place-the-apprentice-card-in-the",
      kind: "drag",
      target: "kgu-apprentice-token",
      drag: {
        to: "kgu-sequence-spot",
        radius: 0.45,
        missNote: "Not at the start yet. Apprentices come first in the training sequence."
      },
      title: "Place the apprentice card in the sequence",
      cue: "Drag the apprentice card to the start of the craft training sequence.",
      why: "It is widely established that craft guilds trained newcomers as apprentices, who learned from experienced workers before working more independently. Placing the apprentice at the start of the sequence reflects that general fact; the details for any one place or trade are research questions."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "kgu-nt-date",
        "kgu-nt-no-source",
        "kgu-nt-all-same"
      ],
      itemNames: {
        "kgu-nt-date": "a date with no source",
        "kgu-nt-no-source": "a claim with no source card",
        "kgu-nt-all-same": "a claim that everyone worked the same way"
      },
      itemNotes: {
        "kgu-nt-date": "Find a source or make it a question.",
        "kgu-nt-no-source": "Every claim needs its source.",
        "kgu-nt-all-same": "Work varied by place, trade and time."
      },
      decoyNotes: {
        "kgu-nt-question": "A clear question is good practice. Keep it."
      },
      title: "Spot the problems in a classmate's notes",
      cue: "Look at the draft research notes and mark each problem.",
      why: "Research notes go wrong in familiar ways: an invented date, a claim with no source and a statement that everyone worked the same way. Spotting them in someone else's notes trains you to keep your own honest."
    },
    {
      id: "say-how-a-guild-and-a",
      kind: "select",
      target: "kgu-compare-card",
      title: "Say how a guild and a union differ",
      cue: "Say one way guilds and modern unions differ, as a question to research further.",
      why: "Guilds often included workshop owners, while unions organise workers; that general difference opens questions worth researching. Saying it carefully, and turning the rest into questions, is how you handle a topic where easy comparisons mislead. Keeping the comparison careful stops you from reading today's world back into the past."
    },
    {
      id: "follow-the-source-trail-through-the",
      kind: "track",
      target: "kgu-track-meter",
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
        label: "TRAIL"
      },
      title: "Follow the source trail through the notes",
      cue: "Keep the marker on the trail from each claim back to its source.",
      why: "Every claim in a good account can be traced back to a source. Following the trail through your notes, claim by claim, is how you find the ones that have lost their source before anyone else does.",
      holdBreakNote: "The trail broke at a claim with no source. Find its source or turn it into a question."
    },
    {
      id: "record-the-facts-questions-and-sources",
      kind: "select",
      target: "kgu-research-log",
      doneLine: "Facts, questions and sources recorded",
      title: "Record the facts, questions and sources",
      cue: "Write the general facts, the research questions and the source for each.",
      why: "A record that keeps facts, questions and sources apart shows exactly what you know, what you do not and where your information came from. It is what lets a teacher, or you next week, pick up the research where it stopped. It also shows your teacher the thinking behind the research, not only the finished answer."
    },
    {
      id: "ask-the-librarian-for-a-further",
      kind: "select",
      target: "kgu-share-board",
      doneLine: "Further source found",
      title: "Ask the librarian for a further source",
      cue: "Show the librarian a research question and ask where to look next.",
      why: "Librarians know which books, archives and collections hold reliable information. Asking for help with a specific question is what skilled researchers do, and it leads to sources you would not find alone."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kgu-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "Which research question would you most like to answer? What was tricky?",
      why: "Research ends with a list of open questions, not a list of answers, so the visit closes with each learner reading one question they wrote and the source they would try first. That habit, unknowns turned into questions, is what the hall's own historians want the class to carry away."
    }
  ],

  interrupts: [
    {
      id: "a-page-starts-to-tear",
      kind: "Fragile source",
      after: "hold-the-old-book-open-gently",
      delay: 3,
      seconds: 12,
      target: "kgu-stop-tell",
      alert: "A page in the old book begins to tear at the edge as a classmate turns it.",
      cue: "Stop turning and tell the librarian at once; do not try to fix it.",
      why: "A torn page can be repaired properly by someone trained, but tape or pulling can ruin it. Stopping and telling the librarian straight away protects the source for everyone who reads it after you.",
      missNote: "The page was pressed back with tape, and the librarian said the repair would now be much harder.",
      wrongNote: "That tries to fix it yourself. Stop and tell the librarian. Choose the response that deals with it now."
    },
    {
      id: "the-librarian-asks-where-from",
      kind: "Librarian question",
      after: "follow-the-source-trail-through-the",
      delay: 3,
      seconds: 12,
      target: "kgu-say-source",
      alert: "The hall librarian points at one of your claims and asks where it came from.",
      cue: "Name the source, or say it is a question you have not answered yet.",
      why: "The librarian is checking your claim has evidence behind it. Naming the source, or honestly calling it an open question, is exactly the discipline history depends on.",
      missNote: "You said you just knew it, and the librarian asked you to find a source before keeping it.",
      wrongNote: "That gives no source. Choose the response that deals with it now."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a7064", base2: "#6c6358", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e8dccb", base2: "#d8ccba", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "kgu-fact-card", "a general fact card", {});
    bead(-1.42, 1.18, -0.62, "kgu-question-card", "a research question card", {});
    bead(-1.03, 1.46, -0.71, "kgu-source-card", "a source card", {});
    bead(-1.08, 0.9, -1.11, "kgu-poster", "a poster on the library wall", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kgu-ord-question", "1 · ask a research question", {});
    bead(-0.58, 1.46, -1.44, "kgu-ord-find", "2 · find sources", {});
    bead(-0.24, 0.9, -1.23, "kgu-ord-check", "3 · check who made them and if they agree", {});
    bead(0, 1.18, -1.55, "kgu-ord-write", "4 · write what the sources show", {});
    bead(0.24, 1.46, -1.23, "kgu-book-hold", "Book held on the rest", {});
    bead(0.58, 0.9, -1.44, "kgu-nt-date", "a date with no source", {});
    bead(0.68, 1.18, -1.05, "kgu-nt-no-source", "a claim with no source card", {});
    bead(1.08, 1.46, -1.11, "kgu-nt-all-same", "a claim that everyone worked the same way", {});
    bead(1.03, 0.9, -0.71, "kgu-nt-question", "a clear research question at the top", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kgu-stop-tell", "Stop and tell the librarian", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kgu-say-source", "Say where the claim came from", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kgu-handling-card", "Library handling rules", "PENCILS\nONLY", { ry: 1.2 });
    dials["kgu-flip-dial"] = dial(-1.89, -1.4, 0.93, "kgu-flip-dial", "Fact or question card");
    meters["kgu-reliability-meter"] = meter(-1.45, -1.85, 0.67, "kgu-reliability-meter", "Source reliability");
    tokens["kgu-apprentice-token"] = token(-0.92, -2.16, 0.4, "kgu-apprentice-token", "Apprentice card");
    spots["kgu-sequence-spot"] = spot(-0.31, -2.33, 0.13, "kgu-sequence-spot", "Start of training");
    card(0.31, 1.35, -2.33, "kgu-compare-card", "Guild or union?", "SAME OR\nDIFFERENT?", { ry: -0.13 });
    meters["kgu-track-meter"] = meter(0.92, -2.16, -0.4, "kgu-track-meter", "Source trail followed");
    boards["kgu-research-log"] = board(1.45, -1.85, -0.67, "kgu-research-log", "Research record");
    boards["kgu-share-board"] = board(1.89, -1.4, -0.93, "kgu-share-board", "Ask the librarian");
    boards["kgu-checkin"] = board(2.19, -0.85, -1.2, "kgu-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "guild-equals-union", "Say a guild was the same thing as a modern union?", "GUILD =\nUNION", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "invent-a-date", "Fill the gap with a date that sounds right?", "SOUNDS\nRIGHT", 0.3);
    hazardCard(0.58, 0.72, -1.86, "one-website-is-enough", "Trust the first website you find?", "FIRST\nRESULT", -0.3);
    hazardCard(1.53, 0.72, -1.21, "everyone-was-the-same", "Say everyone in the past worked the same way?", "ALL THE\nSAME", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Facts, questions, sources."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Hall librarian", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Union hall volunteer", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-page-starts-to-tear"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-page-starts-to-tear"].visible = false;
    arrivals["the-librarian-asks-where-from"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-librarian-asks-where-from"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-apprentice-card-in-the") { const s = spots["kgu-sequence-spot"]; tokens["kgu-apprentice-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-facts-questions-and-sources") repaint(boards["kgu-research-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Facts, questions and sources recorded"], "#59c97b"));
        if (step.id === "ask-the-librarian-for-a-further") repaint(boards["kgu-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Further source found"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kgu-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-how-a-guild-and-a") paintGuide("Unsure? Make it a question.");
      },

      onHazard() {
        paintGuide("Stop. Is that widely established, and where did it come from?");
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
        if (it.id === "a-page-starts-to-tear") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Librarian told, book set aside for repair. The lesson carries on."); }
        if (it.id === "the-librarian-asks-where-from") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Source named. The librarian adds it to the class list."); }
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
