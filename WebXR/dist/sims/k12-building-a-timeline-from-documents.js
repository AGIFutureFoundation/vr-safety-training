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
    "order-by-the-story": "You shuffled the sleeves into the order the tale in your head wanted. A line at the archive table is pinned by the postmarks, letterheads and pencilled years on the sheets, not by a plot; when the tells and the tale disagree, the tells win and the tale is rewritten.",
    "confuse-made-and-described": "You pinned the memoir to the year it was typed as though the happenings it recalls took place then. Every sheet has two years that matter: when it was made and when the things it recalls happened. Muddling them drops a sleeve decades from where it belongs on the line.",
    "invent-a-missing-date": "You pencilled a year onto the undated letter because it suited the line. A sheet with no year stays sleeved as undated, or is given a span with the reasoning pencilled beside it; inventing a year turns a hunch into a false fact that the next reader will trust.",
    "say-the-archive-is-real": "You told the table these sheets were genuine history. The folder is the lesson's own fictional archive, and its sleeve says so; it was made so the sorting could be practised without any real claim, and calling it genuine is exactly the kind of false claim this table teaches you to avoid."
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
      cue: "Tap the three kinds of dating clue on the papers in the folder: a year penned on the sheet, a mention of a known happening, and a physical tell such as a postmark or a letterhead.",
      why: "Papers in an archive folder tell their age three ways. Some carry a year in ink; some mention a happening whose year the ledger already gives; some betray it by a postmark, a letterhead or a shop that did not yet exist. Gathering every tell before sorting a single sheet is what lets the finished line rest on the papers rather than on a hunch. The folder is the lesson's own fictional archive, labelled as such."
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
      cue: "Gather the tells, pencil a year on each sheet's sleeve, sort the sleeves, then flag the doubtful ones.",
      why: "Pencilling a year onto each sleeve from that sheet's own tells, before sorting, stops the line being bent to suit a tale already in mind. Flagging the doubtful sleeves last and in plain sight leaves the finished line showing where the papers speak firmly and where they only murmur, which is precisely what the next reader at this table needs.",
      outOfOrderNote: "Not that way round. Pencil each sheet's year from its own tells before you sort the sleeves."
    },
    {
      id: "read-the-archive-s-label-first",
      kind: "select",
      target: "ktl-label-card",
      title: "Read the archive's label first",
      cue: "Turn the folder's label to the light and read it: these sheets were made for the lesson.",
      why: "Knowing what sits in the folder, before a glove touches it, is the archivist's opening habit. These sheets were written for the lesson and their sleeve says so, which lets the sorting be practised honestly; an archivist always states where a folder came from and what is known of it before anyone builds on it."
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
      cue: "Turn the dial from the year the memoir was typed to the year of the happenings it recalls.",
      why: "Telling apart the year a sheet was made from the year it recalls is the skill this table teaches. A memoir typed decades on is still testimony about the earlier happenings, and it goes on the line where those happenings sit, with a pencilled note on its sleeve of when it was typed."
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
        missNote: "Outside the band. Too sure and a hunch hardens into a fact; too doubtful and a good postmark is thrown away. Weigh the tells again.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Judge how confident each date is",
      cue: "Commit when your confidence matches what the undated letter's tells will actually bear.",
      why: "Some sleeves carry a firm year, some a span, some no more than a hunch. Matching how sure you feel to what the paper itself will bear, and pencilling that onto the sleeve, is what makes the finished line honest rather than neat. A span left open invites the next reader to close it with a paper, not a guess."
    },
    {
      id: "read-the-memoir-right-through",
      kind: "hold",
      target: "ktl-read-memoir",
      seconds: 6,
      title: "Read the memoir right through",
      cue: "Keep your finger on the memoir's line and read the whole typescript to its last page before it goes on the line.",
      why: "A memoir usually admits near its final page when it was typed, while the happenings it recalls sit in the middle chapters. Reading it right through before it is sleeved avoids pinning it to the wrong year, the commonest slip with a memoir. A moment spent finding which year is which saves the whole line from sliding.",
      holdBreakNote: "You broke off and sleeved it too soon. Read the typescript through to its last page first."
    },
    {
      id: "place-the-undated-letter-as-a",
      kind: "drag",
      target: "ktl-letter-token",
      drag: {
        to: "ktl-range-spot",
        radius: 0.45,
        missNote: "Not in place yet. Carry it all the way onto the line as a span."
      },
      title: "Place the undated letter as a range",
      cue: "Drag the undated letter onto the line as a span between the two sheets it mentions.",
      why: "An undated letter that names two happenings the ledger already dates can be sleeved between them as a span. Placing it as a span, rather than at one invented year, uses exactly what its tells will bear and nothing more. A span between those two sheets is a perfectly good answer when that is all the paper allows."
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
      cue: "Look over the draft line a classmate left in the tray and tap each slip before the archivist collects it.",
      why: "Draft lines go astray in a few predictable ways: a memoir pinned to the year it was typed, an undated letter given one exact year, and sleeves shuffled to suit the tale someone wanted. Catching those on a classmate's draft trains the eye to catch them on your own before the folder goes back on the shelf."
    },
    {
      id: "mark-the-gaps-on-the-timeline",
      kind: "select",
      target: "ktl-gap-card",
      title: "Mark the gaps on the timeline",
      cue: "Where no sheet in the folder covers a stretch of years, flag it as a blank on the line.",
      why: "A blank stretch on the line is itself a finding: it tells the next reader which shelf to search. Flagging blanks openly, rather than papering over them with a plausible tale, is honest work at the archive table and often the most useful pencil mark on the page."
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
        label: "EVIDENCE",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep the timeline led by the evidence",
      cue: "Keep the line answering to the sleeves' tells as the last sheets from the folder go on.",
      why: "As a line fills, a tale starts to suggest itself, and the last sheets out of the folder are tempting to force into it. Keeping every sleeve pinned by its own postmark, letterhead or pencilled year is the discipline that stops a line at the archive table turning into fiction. Every pin should lead back to a sheet.",
      holdBreakNote: "The line has drifted towards the tale. Hold the last sleeves against their own tells again."
    },
    {
      id: "record-the-timeline-and-its-evidence",
      kind: "select",
      target: "ktl-timeline-log",
      doneLine: "Timeline and evidence recorded",
      title: "Record the timeline and its evidence",
      cue: "Pencil each sheet's place on the line and the tell that put it there into the reading-room ledger.",
      why: "Pencilling the tell behind every pin into the ledger lets anyone at this table retrace the line and shift a sleeve when a new sheet turns up. That is how lines at an archive are built and mended over years. A line is never finished; each sheet found later can firm up a pin or move it."
    },
    {
      id: "show-the-class-how-you-placed",
      kind: "select",
      target: "ktl-share-board",
      doneLine: "Method shared",
      title: "Show the class how you placed the memoir",
      cue: "Explain to the table how you kept the memoir's typing year apart from the year it recalls.",
      why: "Walking the table through the memoir's two years teaches the skill most readers miss. Handing over the method rather than only the finished line lets classmates re-sleeve their own drafts and mend the same slip. Saying why each sheet sits where it does is the part that shows the line was built the right way round."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "ktl-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "Before the folder goes back on the shelf: how did the sorting go, and which sheet still puzzles you?",
      why: "A short round at the table before the folder is boxed lets the teacher hear which tells made sense and which did not, and gives every learner a moment to name the one sheet still puzzling them. Nobody is graded at the table, and the teacher or a trusted adult is there for anyone who wants to talk more afterwards."
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
      alert: "A tray of the folder's brittle sheets tips towards the edge of the reading-room table.",
      cue: "Stop, steady the tray, lay the sheets flat in their sleeves, then call the archivist over.",
      why: "Brittle paper creased in a fall stays creased. Stopping, steadying the tray and laying the sheets flat protects the folder, and calling the archivist means anything torn is handled by someone with the gloves and the training for it.",
      missNote: "Nobody stopped; the tray tipped and two sheets creased straight across their postmarks. Next time, stop the sorting and deal with it first.",
      wrongNote: "That does not save the sheets. Stop and lay them flat. Choose the response that deals with it now."
    },
    {
      id: "the-teacher-asks-why-there",
      kind: "Teacher question",
      after: "keep-the-timeline-led-by-the",
      delay: 3,
      seconds: 12,
      target: "ktl-give-the-evidence",
      alert: "The teacher taps a sleeve on your line and asks what put it there.",
      cue: "Name the tell on that sheet that pinned it, or say it is a span and what its two ends are.",
      why: "What put it there is the archivist's question for every pin on a line. Answering with the sheet's own postmark, letterhead or pencilled year, rather than with how it suits the tale, shows the line was built from the folder outwards.",
      missNote: "You said it suited the line, named no tell, and the pin went unchecked. Next time, stop the sorting and deal with it first.",
      wrongNote: "That is the tale, not the tell. Name what on the sheet pinned it."
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
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Typed when? Recalls when? Two years, two pencil marks."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
        if (step.id === "mark-the-gaps-on-the-timeline") paintGuide("Tells first, sleeves second, tale last.");
      },

      onHazard() {
        paintGuide("Stop. Is that the year it was typed, or the year it recalls?");
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
        if (it.id === "documents-slide-off-the-table") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Sheets gathered flat and the archivist called over. Nothing in the folder was lost."); }
        if (it.id === "the-teacher-asks-why-there") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Tell named. Anyone at the table can now retrace the pin."); }
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
