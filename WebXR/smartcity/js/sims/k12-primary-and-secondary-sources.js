import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Primary and Secondary Sources. Lower- and upper-secondary history taught as method: reading a primary source against a secondary one, from the lesson's own fictional archive, labelled as such.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_PRIMARY_AND_SECONDARY_SOURCES = {
  id: "k12-primary-and-secondary-sources",
  index: "803",
  domain: "Education",
  trade: "History class in the community archive room — learner and archivist",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Primary and Secondary Sources",
  title: simTitle("Primary and Secondary Sources"),
  tagline: "Ask who made it, when, why and for whom — then check the story against the evidence",
  accent: 0xc08a4a,
  accentCss: "#c08a4a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"source-checked","name":"Source Checked","note":"A primary and a secondary source read against each other, with every claim traced to evidence"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Archive Board",
    currency: "SOURCES",
    ranks: ["Reader","Questioner","Researcher","Historian","Archivist"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("sort-what-is-on-the-table") },
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
    "trust-it-because-it-is-old": "You accepted the letter as true because it is old. Age makes a source a primary source, not a reliable one: the writer may have been mistaken, may have wanted to persuade someone, or may have seen only part of what happened. Every source, old or new, is questioned for who made it and why.",
    "copy-the-textbook-claim": "You copied the secondary account's claim straight into your answer. A secondary source is someone else's interpretation, and a good historian checks its claims against the primary evidence it rests on; when you cannot find that evidence, you say so rather than repeat the claim.",
    "fill-the-gap-with-a-guess": "You filled the gap in the diary with what probably happened and wrote it as fact. When the evidence runs out, a historian says the evidence runs out; a guess written as fact is invention, and it is how false stories about the past get started.",
    "handle-without-washing": "You picked up the fragile papers without clean, dry hands. Archive papers are damaged by grease and moisture, which is why archivists ask for clean hands and a support under the page; the archive's own rules protect the evidence for every class that comes after yours."
  },

  lateNotes: {
    "kps-research-log": "The research log is written once the claims are traced — nothing to record yet.",
    "kps-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      "id": "sort-what-is-on-the-table",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kps-letter",
        "kps-notice",
        "kps-photo"
      ],
      "itemNames": {
        "kps-letter": "a letter written at the time",
        "kps-notice": "a notice posted at the time",
        "kps-photo": "a photograph taken at the time"
      },
      "itemNotes": {
        "kps-letter": "Made by someone who was there, at the time. Primary — but still a point of view.",
        "kps-notice": "An official notice from the time. Primary, and written for a purpose.",
        "kps-photo": "A photograph is primary, but someone chose what to put in the frame."
      },
      "decoyNotes": {
        "kps-later-book": "Written later, about the events. That is a secondary source — set it aside for now."
      },
      "title": "Sort what is on the table",
      "cue": "Mark each item on the table that was made at the time of the events — the primary sources.",
      "why": "The first question a historian asks of any item is when it was made and by whom. A letter written at the time, a notice posted at the time and a photograph taken at the time are primary sources; a book written later about those events is secondary. Everything on this table belongs to the lesson's own fictional archive, labelled as such, so the method can be practised without any real claim being made."
    },
    {
      "id": "follow-the-archive-s-handling-rules",
      "kind": "select",
      "target": "kps-clean-hands",
      "title": "Follow the archive's handling rules",
      "cue": "Clean, dry hands, and a support under every page before you touch anything.",
      "why": "An archive exists so that evidence survives for every reader who comes later. Following its handling rules, clean dry hands and a support under fragile pages, is part of the historian's method, not a separate rule: damaged evidence cannot be checked again, and history depends on evidence that can be checked."
    },
    {
      "id": "question-the-source-in-order",
      "kind": "sequence",
      "targets": [
        "kps-ord-who",
        "kps-ord-when",
        "kps-ord-why",
        "kps-ord-whom"
      ],
      "itemNames": {
        "kps-ord-who": "1 · who made it",
        "kps-ord-when": "2 · when",
        "kps-ord-why": "3 · why",
        "kps-ord-whom": "4 · for whom"
      },
      "title": "Question the source in order",
      "cue": "Who made it, when, why, and for whom.",
      "why": "Asking who made a source, when, why and for whom tells you what kind of evidence it is before you trust what it says. A letter to a friend and a notice to the public can describe the same day very differently. Asking in this order, author first and audience last, builds a picture of the source's purpose, which is the thing most likely to shape what it leaves out.",
      "outOfOrderNote": "Out of order. Start with who made it — you cannot judge why until you know who."
    },
    {
      "id": "read-the-letter-slowly-line-by",
      "kind": "hold",
      "target": "kps-read-slowly",
      "seconds": 6,
      "title": "Read the letter slowly, line by line",
      "cue": "Hold your place and read the whole letter before you decide anything about it.",
      "why": "Reading a source all the way through before judging it stops you seizing on the first line that fits what you expected. Historians read slowly because the detail that changes the meaning is often late in a document: a date, a condition, a sentence that undercuts the rest.",
      "holdBreakNote": "You stopped reading and jumped to a conclusion. Go back and read the whole letter first."
    },
    {
      "id": "turn-from-the-primary-to-the",
      "kind": "turn",
      "target": "kps-lens-dial",
      "turn": {
        "turns": 0.5,
        "axis": "y",
        "label": "SECONDARY"
      },
      "title": "Turn from the primary to the secondary source",
      "cue": "Now turn the lens from the letter to the later book that tells the same story.",
      "why": "Once you know what the primary source says, you can read the secondary account critically: which evidence it uses, where it agrees with the letter, and where it goes further than the letter can support. Turning deliberately from one to the other is the core skill of this lesson, and of history."
    },
    {
      "id": "judge-how-certain-the-book-s",
      "kind": "gauge",
      "target": "kps-certainty-meter",
      "gauge": {
        "label": "CERTAINTY",
        "speed": 0.6,
        "green": [
          0.4,
          0.58
        ],
        "missNote": "Outside the band. Too sure and one letter is doing too much; too doubtful and you ignore real evidence. Weigh it again."
      },
      "title": "Judge how certain the book's claim is",
      "cue": "Commit when your certainty matches the evidence: supported by the letter, but not proven by it alone.",
      "why": "Historians rarely say certainly or never; they say how strongly the evidence supports a claim. One letter agreeing with a book makes a claim more likely, not proven, because a single witness can be wrong. Judging certainty to match the evidence is what separates careful history from a confident story."
    },
    {
      "id": "link-the-claim-to-its-evidence",
      "kind": "drag",
      "target": "kps-claim-token",
      "drag": {
        "to": "kps-evidence-spot",
        "radius": 0.45,
        "missNote": "The claim is not linked to its evidence yet. Put it beside the source that supports it."
      },
      "title": "Link the claim to its evidence",
      "cue": "Drag the book's main claim onto the primary source that supports it.",
      "why": "Tracing a claim to the evidence behind it is how historians check each other's work. Placing the book's claim beside the letter that supports it shows the reader exactly where the claim comes from, and it reveals at once any claim with nothing beneath it, which is the claim to be most careful about."
    },
    {
      "id": "say-where-the-evidence-runs-out",
      "kind": "select",
      "target": "kps-gap-card",
      "title": "Say where the evidence runs out",
      "cue": "The diary has a missing page. Say what the evidence cannot tell us.",
      "why": "Saying where the evidence runs out is honest history, and it is often the most useful thing a historian writes. A missing page is a question for further research, not a space to fill with a likely story; naming the gap tells the next researcher exactly where to look."
    },
    {
      "id": "spot-the-problems-in-a-classmate",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kps-ess-no-source",
        "kps-ess-book-as-witness",
        "kps-ess-guess-fact"
      ],
      "itemNames": {
        "kps-ess-no-source": "a claim with no source",
        "kps-ess-book-as-witness": "the book quoted as if it were there",
        "kps-ess-guess-fact": "a guess written as fact"
      },
      "itemNotes": {
        "kps-ess-no-source": "Every claim needs evidence behind it. Where is it from?",
        "kps-ess-book-as-witness": "The book was written later. It is an interpretation, not a witness.",
        "kps-ess-guess-fact": "Where the evidence stops, say so. A guess must be labelled as one."
      },
      "decoyNotes": {
        "kps-ess-question": "Naming an open question is good history. Keep it."
      },
      "title": "Spot the problems in a classmate's essay",
      "cue": "Look at the draft essay and mark each problem before it is handed in.",
      "why": "A history essay makes claims and backs each with evidence. The usual problems are a claim with no source, a secondary account treated as if it were a witness, and a guess written as fact. Spotting them in someone else's draft is how you learn to see them in your own, and it is exactly what a teacher will look for."
    },
    {
      "id": "keep-the-argument-balanced-as-you",
      "kind": "track",
      "target": "kps-balance-meter",
      "seconds": 8,
      "track": {
        "start": 0.3,
        "green": [
          0.4,
          0.62
        ],
        "rise": 0.46,
        "fall": 0.38,
        "drift": 0.14,
        "label": "BALANCE"
      },
      "title": "Keep the argument balanced as you write",
      "cue": "Hold your conclusion in band — weighing both sources, not leaning on one.",
      "why": "A balanced argument gives each source its due weight: what the letter shows, what the book adds and where they differ. Leaning on one source because it says what you hoped is the easiest trap in history, and holding the balance while you write is what makes the conclusion trustworthy.",
      "holdBreakNote": "The argument tipped to one side. Bring the other source back in before you conclude."
    },
    {
      "id": "record-the-sources-the-links-and",
      "kind": "select",
      "target": "kps-research-log",
      "doneLine": "Sources and gaps recorded",
      "title": "Record the sources, the links and the gaps",
      "cue": "Write down each source, which claim it supports, and where the evidence runs out.",
      "why": "A research log lets anyone follow your reasoning back to the sources and check it for themselves. Recording the gaps as carefully as the findings tells the next researcher where the questions are, which is how historical knowledge actually grows: by one careful reader building on another."
    },
    {
      "id": "show-the-class-how-you-checked",
      "kind": "select",
      "target": "kps-share-board",
      "doneLine": "Method shared",
      "title": "Show the class how you checked the claim",
      "cue": "Explain how you traced the book's claim to the letter and where the evidence ran out.",
      "why": "Showing classmates how a claim was traced to its evidence teaches the method, not just the answer, and it lets them test your reading against theirs. Historians publish their sources for exactly this reason: so that anyone can check the claim."
    },
    {
      "id": "crew-check-in",
      "kind": "select",
      "target": "kps-checkin",
      "doneLine": "Checked in",
      "title": "Check in at the end of the lesson",
      "cue": "How did that go? What was difficult about questioning a source?",
      "why": "A short check-in lets the teacher hear what made sense and what did not, and it gives each learner a moment to name one question they still have. Nobody is graded here, and a teacher or trusted adult is there for anyone who wants to talk more."
    }
  ],

  interrupts: [
    {
      "id": "a-page-starts-to-tear",
      "kind": "Fragile page",
      "after": "read-the-letter-slowly-line-by",
      "delay": 3,
      "seconds": 12,
      "target": "kps-support-the-page",
      "alert": "A classmate lifts a fragile page by one corner and it starts to tear.",
      "cue": "Tell them to stop, lay the page flat on its support, and call the archivist.",
      "why": "A tear in an archive document is permanent damage to evidence that exists nowhere else. Stopping, laying the page flat on its support and calling the archivist, who knows how to handle it, protects the source for every reader who comes after this class.",
      "missNote": "Nobody stopped them, and the page tore across the date line — the one detail the lesson needed.",
      "wrongNote": "That does not protect the page. Stop, lay it flat and call the archivist."
    },
    {
      "id": "the-teacher-asks-how-you-know",
      "kind": "Teacher question",
      "after": "keep-the-argument-balanced-as-you",
      "delay": 3,
      "seconds": 12,
      "target": "kps-name-the-source",
      "alert": "The teacher points to a sentence in your notes and asks how you know it.",
      "cue": "Name the source the claim comes from, or say plainly that you do not yet have one.",
      "why": "How do you know is the historian's question. Naming the source behind a claim, or admitting that there is not one yet, shows you understand that history is built from evidence rather than from what sounds right.",
      "missNote": "You had no source and defended the claim anyway, so it stayed in your notes as if it were fact.",
      "wrongNote": "That does not name a source. Say where the claim comes from, or that you do not know yet."
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
    bead(-1.22, 0.9, -0.27, "kps-letter", "a letter written at the time", {});
    bead(-1.42, 1.18, -0.62, "kps-notice", "a notice posted at the time", {});
    bead(-1.03, 1.46, -0.71, "kps-photo", "a photograph taken at the time", {});
    bead(-1.08, 0.9, -1.11, "kps-later-book", "a history book written later", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kps-ord-who", "1 · who made it", {});
    bead(-0.58, 1.46, -1.44, "kps-ord-when", "2 · when", {});
    bead(-0.24, 0.9, -1.23, "kps-ord-why", "3 · why", {});
    bead(0, 1.18, -1.55, "kps-ord-whom", "4 · for whom", {});
    bead(0.24, 1.46, -1.23, "kps-read-slowly", "Reading the letter line by line", {});
    bead(0.58, 0.9, -1.44, "kps-ess-no-source", "a claim with no source", {});
    bead(0.68, 1.18, -1.05, "kps-ess-book-as-witness", "the book quoted as if it were there", {});
    bead(1.08, 1.46, -1.11, "kps-ess-guess-fact", "a guess written as fact", {});
    bead(1.03, 0.9, -0.71, "kps-ess-question", "a question for further research", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kps-support-the-page", "Stop and support the page", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kps-name-the-source", "Name the source behind the claim", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kps-clean-hands", "Clean, dry hands and a page support", "CLEAN\nHANDS", { ry: 1.2 });
    dials["kps-lens-dial"] = dial(-1.89, -1.4, 0.93, "kps-lens-dial", "Primary to secondary");
    meters["kps-certainty-meter"] = meter(-1.45, -1.85, 0.67, "kps-certainty-meter", "How certain is the claim?");
    tokens["kps-claim-token"] = token(-0.92, -2.16, 0.4, "kps-claim-token", "The book's claim");
    spots["kps-evidence-spot"] = spot(-0.31, -2.33, 0.13, "kps-evidence-spot", "Next to its evidence");
    card(0.31, 1.35, -2.33, "kps-gap-card", "Say where the evidence runs out", "EVIDENCE\nRUNS OUT", { ry: -0.13 });
    meters["kps-balance-meter"] = meter(0.92, -2.16, -0.4, "kps-balance-meter", "Balance of the argument");
    boards["kps-research-log"] = board(1.45, -1.85, -0.67, "kps-research-log", "Research log");
    boards["kps-share-board"] = board(1.89, -1.4, -0.93, "kps-share-board", "Share the method");
    boards["kps-checkin"] = board(2.19, -0.85, -1.2, "kps-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "trust-it-because-it-is-old", "Trust the letter because it is old?", "OLD MEANS\nTRUE", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "copy-the-textbook-claim", "Copy the secondary account's claim without checking?", "THE BOOK\nSAYS SO", 0.3);
    hazardCard(0.58, 0.72, -1.86, "fill-the-gap-with-a-guess", "Fill the missing page with what probably happened?", "PROBABLY\nHAPPENED", -0.3);
    hazardCard(1.53, 0.72, -1.21, "handle-without-washing", "Handle the fragile papers straight after lunch?", "STRAIGHT\nFROM LUNCH", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Who made it? When? Why?"], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Archivist", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Librarian", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-page-starts-to-tear"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-page-starts-to-tear"].visible = false;
    arrivals["the-teacher-asks-how-you-know"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-teacher-asks-how-you-know"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "link-the-claim-to-its-evidence") { const s = spots["kps-evidence-spot"]; tokens["kps-claim-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-sources-the-links-and") repaint(boards["kps-research-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Sources and gaps recorded"], "#59c97b"));
        if (step.id === "show-the-class-how-you-checked") repaint(boards["kps-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Method shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kps-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-where-the-evidence-runs-out") paintGuide("Primary: made at the time. Secondary: made later, about it.");
      },

      onHazard() {
        paintGuide("Stop. A claim needs a source — trace it before you accept it.");
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
        if (it.id === "a-page-starts-to-tear") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Page laid flat and the archivist called. The evidence survives for the next reader."); }
        if (it.id === "the-teacher-asks-how-you-know") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Source named. That sentence can now be checked by anyone."); }
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
