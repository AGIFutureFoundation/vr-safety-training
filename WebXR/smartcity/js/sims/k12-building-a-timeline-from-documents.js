import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Building a Timeline from Documents. Lower- and upper-secondary history method: putting dated documents from the lesson's own fictional archive in order, and telling the date a document was made from the date it describes.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BUILDING_A_TIMELINE_FROM_DOCUMENTS = {
  id: "k12-building-a-timeline-from-documents",
  index: "809",
  domain: "Education",
  trade: "History class at the school archive table — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Building a Timeline from Documents",
  title: simTitle("Building a Timeline from Documents"),
  tagline: "Order the documents by the evidence, not by the story you expect",
  accent: 0xc08a4a,
  accentCss: "#c08a4a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"in-order","name":"In Order","note":"A timeline built from the documents' own evidence, with uncertain dates marked as uncertain"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Timeline Board",
    currency: "DATES",
    ranks: ["Sorter","Reader","Chronicler","Historian","Archivist"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-dating-evidence") },
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
    "order-by-the-story": "You put the documents in the order the story you expected would need. A timeline is built from the evidence on the documents, not from a story in your head; when the evidence and the story disagree, the evidence wins and the story changes.",
    "confuse-made-and-described": "You placed a memoir at the date it was written as if the events happened then. A document has two dates that matter: when it was made and when the things it describes happened. Mixing them puts events in the wrong place on the timeline.",
    "invent-a-missing-date": "You gave the undated letter a date because it fitted. A document with no date is placed as undated, or given a range with the reason stated; inventing a date turns a guess into a false fact.",
    "say-the-archive-is-real": "You told the class the documents were real history. These are the lesson's own fictional archive, labelled as such, made so the method can be practised without any real claim; saying otherwise is exactly the kind of false claim this lesson teaches you to avoid."
  },

  lateNotes: {
    "ktl-timeline-log": "The timeline record is written once every document is placed — nothing to record yet.",
    "ktl-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-the-dating-evidence",
      kind: "find",
      noHint: true,
      targets: [
        "ktl-written-date",
        "ktl-cross-reference",
        "ktl-context-clue"
      ],
      itemNames: {
        "ktl-written-date": "a date written on the page",
        "ktl-cross-reference": "a reference to another dated document",
        "ktl-context-clue": "a clue in the content"
      },
      itemNotes: {
        "ktl-written-date": "The strongest evidence, but check whether it is when it was made or what it describes.",
        "ktl-cross-reference": "Places this document before or after that one.",
        "ktl-context-clue": "A mention of something that came later gives an earliest possible date."
      },
      decoyNotes: {
        "ktl-decorative-border": "A border is decoration, not evidence. Look for dating clues."
      },
      title: "Find the dating evidence",
      cue: "Mark the three kinds of dating evidence on the documents in the lesson's fictional archive.",
      why: "Documents carry dating evidence in different ways: a date written on the document, a reference to another event whose date you know, and clues such as the kind of paper or the name of a shop that opened later. Finding every kind before ordering anything is what makes the timeline rest on evidence. These documents are the lesson's own fictional archive, labelled as such."
    },
    {
      id: "read-the-archive-s-label-first",
      kind: "select",
      target: "ktl-label-card",
      title: "Read the archive's label first",
      cue: "Read the label: these are the lesson's own fictional documents.",
      why: "Knowing what a source is, before using it, is the first step of historical method. These documents were made for the lesson and are labelled as such, so the method can be practised honestly; a historian always states what their sources are and where they come from."
    },
    {
      id: "put-the-method-in-order",
      kind: "sequence",
      targets: [
        "ktl-ord-evidence",
        "ktl-ord-date",
        "ktl-ord-sort",
        "ktl-ord-uncertain"
      ],
      itemNames: {
        "ktl-ord-evidence": "1 · find the evidence",
        "ktl-ord-date": "2 · date each document",
        "ktl-ord-sort": "3 · sort them",
        "ktl-ord-uncertain": "4 · mark what is uncertain"
      },
      title: "Put the method in order",
      cue: "Find the evidence, date each document, sort, then mark what is uncertain.",
      why: "Dating each document from its own evidence before sorting stops the order being bent to fit a story. Marking the uncertain ones last, openly, means the timeline shows where the evidence is strong and where it is weak, which is exactly what the next researcher needs to know.",
      outOfOrderNote: "Out of order. Date each document from its evidence before you sort."
    },
    {
      id: "read-the-memoir-right-through",
      kind: "hold",
      target: "ktl-read-memoir",
      seconds: 6,
      title: "Read the memoir right through",
      cue: "Hold your place and read the whole memoir before placing it.",
      why: "A memoir often tells you when it was written near the end, and when the events happened somewhere in the middle. Reading it all before placing it avoids putting it at the wrong date, the commonest error with this kind of source.",
      holdBreakNote: "You stopped reading and placed it too soon. Read the whole memoir first."
    },
    {
      id: "turn-from-when-it-was-made",
      kind: "turn",
      target: "ktl-date-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "DESCRIBED"
      },
      title: "Turn from when it was made to when it describes",
      cue: "Turn the dial from the memoir's writing date to the date of the events it describes.",
      why: "Separating the date a document was made from the date of what it describes is the key skill of this lesson. A memoir written long after is still evidence about the earlier events, but it is placed on the timeline where the events happened, with a note of when it was written."
    },
    {
      id: "judge-how-confident-each-date-is",
      kind: "gauge",
      target: "ktl-confidence-meter",
      gauge: {
        label: "CONFIDENCE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too sure and a guess becomes a fact; too doubtful and good evidence is wasted. Weigh it again."
      },
      title: "Judge how confident each date is",
      cue: "Commit when your confidence matches the evidence for the undated letter's range.",
      why: "Some dates are certain, some are ranges, and some are guesses. Matching your confidence to the evidence, and saying so on the timeline, is what makes a timeline honest rather than tidy."
    },
    {
      id: "place-the-undated-letter-as-a",
      kind: "drag",
      target: "ktl-letter-token",
      drag: {
        to: "ktl-range-spot",
        radius: 0.45
      },
      title: "Place the undated letter as a range",
      cue: "Drag the undated letter onto the timeline as a range between the two documents it mentions.",
      why: "An undated letter that mentions two dated events can be placed between them as a range. Placing it that way, rather than at a single invented date, uses exactly what the evidence supports and no more."
    },
    {
      id: "mark-the-gaps-on-the-timeline",
      kind: "select",
      target: "ktl-gap-card",
      title: "Mark the gaps on the timeline",
      cue: "Where no document covers a stretch of time, mark it as a gap.",
      why: "A gap on a timeline is information: it tells the next researcher where to look. Marking gaps openly, rather than smoothing them over with a likely story, is honest history and often the most useful thing on the page."
    },
    {
      id: "spot-the-problems-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "ktl-tl-memoir",
        "ktl-tl-invented",
        "ktl-tl-story"
      ],
      itemNames: {
        "ktl-tl-memoir": "a memoir placed at its writing date",
        "ktl-tl-invented": "an undated item with an exact date",
        "ktl-tl-story": "the order bent to fit a story"
      },
      itemNotes: {
        "ktl-tl-memoir": "Place it where the events happened, noting when it was written.",
        "ktl-tl-invented": "Use a range and give the reason, or mark it undated.",
        "ktl-tl-story": "The evidence decides the order."
      },
      decoyNotes: {
        "ktl-tl-labelled": "Saying what the sources are is right. Keep it."
      },
      title: "Spot the problems in a classmate's timeline",
      cue: "Look at the draft timeline and mark each problem.",
      why: "Timelines go wrong in predictable ways: a document placed at its writing date instead of its event date, an undated item given an exact date and the order bent to fit a story. Spotting these in a draft teaches you to check your own."
    },
    {
      id: "keep-the-timeline-led-by-the",
      kind: "track",
      target: "ktl-track-meter",
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
        label: "EVIDENCE"
      },
      title: "Keep the timeline led by the evidence",
      cue: "Hold the timeline in band with the evidence as you add the last documents.",
      why: "As a timeline fills up, it starts to suggest a story, and the last documents are tempting to force into it. Keeping every placement tied to its own evidence is the discipline that stops a timeline becoming a work of fiction.",
      holdBreakNote: "The timeline drifted towards the story. Check the last placements against their evidence."
    },
    {
      id: "record-the-timeline-and-its-evidence",
      kind: "select",
      target: "ktl-timeline-log",
      doneLine: "Timeline and evidence recorded",
      title: "Record the timeline and its evidence",
      cue: "Write each document's placement and the evidence that put it there.",
      why: "Recording the evidence behind each placement lets anyone check the timeline and change it if new evidence appears. That is how historical timelines are built and improved over time."
    },
    {
      id: "show-the-class-how-you-placed",
      kind: "select",
      target: "ktl-share-board",
      doneLine: "Method shared",
      title: "Show the class how you placed the memoir",
      cue: "Explain how you separated when the memoir was written from when its events happened.",
      why: "Explaining the memoir's two dates to the class teaches the skill most people miss. Sharing the method, not just the finished timeline, lets classmates check their own and fix the same mistake."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "ktl-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the timeline go? What question do you still have?",
      why: "A short check-in lets the teacher hear what made sense and what did not, and gives each learner a moment to name one question they still have. Nobody is graded here, and a teacher or trusted adult is there for anyone who wants to talk more."
    }
  ],

  interrupts: [
    {
      id: "documents-slide-off-the-table",
      kind: "Falling documents",
      after: "read-the-memoir-right-through",
      delay: 3,
      seconds: 12,
      target: "ktl-stop-and-gather",
      alert: "A stack of the archive's fragile documents slides towards the edge of the table.",
      cue: "Stop, steady the stack and lay the papers flat, then call the archivist.",
      why: "Fragile papers damaged in a fall cannot be undamaged. Stopping, steadying them and laying them flat protects the archive, and calling the archivist means anything creased is handled by someone who knows how.",
      missNote: "Nobody stopped, the stack fell and two documents creased across their dates.",
      wrongNote: "That does not protect the papers. Stop and lay them flat."
    },
    {
      id: "the-teacher-asks-why-there",
      kind: "Teacher question",
      after: "keep-the-timeline-led-by-the",
      delay: 3,
      seconds: 12,
      target: "ktl-give-the-evidence",
      alert: "The teacher points at a document on your timeline and asks why it is there.",
      cue: "Name the evidence on the document that placed it, or say that it is a range and why.",
      why: "Why is it there is the historian's check on every timeline. Answering with the evidence, not with how it fits the story, shows the timeline was built the right way round.",
      missNote: "You said it fitted there, with no evidence, and the placement stayed unchecked.",
      wrongNote: "That is the story, not the evidence. Name what on the document placed it."
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a6a58", base2: "#6c5e4e", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e6dcc8", base2: "#d8ceba", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
      box(desk, 0.9, 0.04, 0.55, 0, 0.74, 0, 10119738, { rough: 0.6 });
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
    bead(-1.22, 0.9, -0.27, "ktl-written-date", "a date written on the page", {});
    bead(-1.42, 1.18, -0.62, "ktl-cross-reference", "a reference to another dated document", {});
    bead(-1.03, 1.46, -0.71, "ktl-context-clue", "a clue in the content", {});
    bead(-1.08, 0.9, -1.11, "ktl-decorative-border", "a decorative border", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "ktl-ord-evidence", "1 · find the evidence", {});
    bead(-0.58, 1.46, -1.44, "ktl-ord-date", "2 · date each document", {});
    bead(-0.24, 0.9, -1.23, "ktl-ord-sort", "3 · sort them", {});
    bead(0, 1.18, -1.55, "ktl-ord-uncertain", "4 · mark what is uncertain", {});
    bead(0.24, 1.46, -1.23, "ktl-read-memoir", "Reading the memoir carefully", {});
    bead(0.58, 0.9, -1.44, "ktl-tl-memoir", "a memoir placed at its writing date", {});
    bead(0.68, 1.18, -1.05, "ktl-tl-invented", "an undated item with an exact date", {});
    bead(1.08, 1.46, -1.11, "ktl-tl-story", "the order bent to fit a story", {});
    bead(1.03, 0.9, -0.71, "ktl-tl-labelled", "the archive labelled as fictional", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "ktl-stop-and-gather", "Stop and gather them flat", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "ktl-give-the-evidence", "Give the evidence for the placement", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "ktl-label-card", "Label it as the lesson's archive", "FICTIONAL\nARCHIVE", { ry: 1.2 });
    dials["ktl-date-dial"] = dial(-1.89, -1.4, 0.93, "ktl-date-dial", "Made to described");
    meters["ktl-confidence-meter"] = meter(-1.45, -1.85, 0.67, "ktl-confidence-meter", "Confidence in the date");
    tokens["ktl-letter-token"] = token(-0.92, -2.16, 0.4, "ktl-letter-token", "The undated letter");
    spots["ktl-range-spot"] = spot(-0.31, -2.33, 0.13, "ktl-range-spot", "On the timeline as a range");
    card(0.31, 1.35, -2.33, "ktl-gap-card", "Mark the gaps honestly", "GAPS\nMARKED", { ry: -0.13 });
    meters["ktl-track-meter"] = meter(0.92, -2.16, -0.4, "ktl-track-meter", "Evidence over story");
    boards["ktl-timeline-log"] = board(1.45, -1.85, -0.67, "ktl-timeline-log", "Timeline record");
    boards["ktl-share-board"] = board(1.89, -1.4, -0.93, "ktl-share-board", "Share with the class");
    boards["ktl-checkin"] = board(2.19, -0.85, -1.2, "ktl-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "order-by-the-story", "Order the documents by the story you expect?", "ORDER BY\nTHE STORY", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "confuse-made-and-described", "Treat a later memoir's date as the event's date?", "WRITTEN =\nHAPPENED", 0.3);
    hazardCard(0.58, 0.72, -1.86, "invent-a-missing-date", "Give the undated letter a date that fits?", "MAKE UP\nA DATE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "say-the-archive-is-real", "Tell the class these are real historical documents?", "THESE ARE\nREAL", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Made when? About when?"], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "School archivist", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["documents-slide-off-the-table"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["documents-slide-off-the-table"].visible = false;
    arrivals["the-teacher-asks-why-there"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-teacher-asks-why-there"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-undated-letter-as-a") { const s = spots["ktl-range-spot"]; tokens["ktl-letter-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-timeline-and-its-evidence") repaint(boards["ktl-timeline-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Timeline and evidence recorded"], "#59c97b"));
        if (step.id === "show-the-class-how-you-placed") repaint(boards["ktl-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Method shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["ktl-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "mark-the-gaps-on-the-timeline") paintGuide("Evidence first, then the order.");
      },

      onHazard() {
        paintGuide("Stop. Is that the date it was made, or the date it describes?");
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
        if (it.id === "documents-slide-off-the-table") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Gathered flat and the archivist called. Nothing was lost."); }
        if (it.id === "the-teacher-asks-why-there") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Evidence given. The placement can be checked by anyone."); }
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
