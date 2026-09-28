import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Reading Instructions and Safety Labels. Early-primary to lower-secondary literacy for life: reading a set of instructions right through, and reading a safety label before using the product it is on.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_READING_INSTRUCTIONS_AND_SAFETY_LABELS = {
  id: "k12-reading-instructions-and-safety-labels",
  index: "804",
  domain: "Education",
  trade: "Literacy class in the school workshop — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Reading Instructions and Safety Labels",
  title: simTitle("Reading Instructions and Safety Labels"),
  tagline: "Read it all before you start, and read the label before you open anything",
  accent: 0x9a6ad0,
  accentCss: "#9a6ad0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"read-first","name":"Read First","note":"Instructions read right through and every label read before use"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Reading Board",
    currency: "PAGES",
    ranks: ["Reader","Checker","Follower","Explainer","Guide"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-the-label") },
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
    "start-before-reading-to-the-end": "You started on step one before reading to the end. Instructions often put an important warning or a thing you need later near the bottom, and discovering it halfway through a task is how people get stuck or hurt. Reading the whole set first is the single most useful reading habit for life.",
    "guess-the-symbol": "You guessed what the picture on the label meant. Safety pictures are chosen to be understood quickly, but a guess can be wrong, and the words beside the picture say exactly what it means; when you are unsure, you read the words or ask, you do not guess.",
    "pour-into-an-unlabelled-bottle": "You poured some of the product into an empty drinks bottle. A product separated from its label has lost its warnings and its first-aid instructions, and a drinks bottle invites someone to drink from it; products stay in their own labelled containers.",
    "skip-the-if-it-goes-wrong": "You skipped the section on what to do if something goes wrong. That section is written for the moment when there is no time to read, which is exactly why it has to be read beforehand; knowing it already is what lets you act calmly and get an adult quickly."
  },

  lateNotes: {
    "kri-reading-log": "The reading record is written once the task is finished — nothing to record yet.",
    "kri-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      "id": "find-the-parts-of-the-label",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kri-signal-word",
        "kri-pictogram",
        "kri-first-aid"
      ],
      "itemNames": {
        "kri-signal-word": "the signal word",
        "kri-pictogram": "the warning picture",
        "kri-first-aid": "what to do if it goes wrong"
      },
      "itemNotes": {
        "kri-signal-word": "The signal word tells you how serious the warning is. Read it first.",
        "kri-pictogram": "The picture shows the kind of danger at a glance. The words beside it say exactly what it means.",
        "kri-first-aid": "The part you hope never to need, and so the part to read before you start."
      },
      "decoyNotes": {
        "kri-brand-logo": "The logo tells you who made it, not how to use it safely. Look for the safety parts."
      },
      "title": "Find the parts of the label",
      "cue": "Mark the three parts of the safety label you must read before using the product.",
      "why": "A safety label is organised so the most important information is easy to find: a signal word that says how serious the warning is, a picture that shows the kind of danger, and the instructions for what to do and what to do if something goes wrong. Knowing where each part is means you can read any label quickly and completely, whatever the product."
    },
    {
      "id": "read-the-instructions-all-the-way",
      "kind": "select",
      "target": "kri-read-all",
      "title": "Read the instructions all the way through",
      "cue": "Before you touch anything, read every step to the end.",
      "why": "Reading instructions all the way through before starting shows you what you will need, how long it will take and where the warnings are. It is the habit that separates people who finish a task smoothly from people who stop halfway to find something they needed at the start, and it applies to a recipe, a game or a form."
    },
    {
      "id": "put-the-reading-routine-in-order",
      "kind": "sequence",
      "targets": [
        "kri-ord-title",
        "kri-ord-need",
        "kri-ord-steps",
        "kri-ord-warn"
      ],
      "itemNames": {
        "kri-ord-title": "1 · the title: what is it for?",
        "kri-ord-need": "2 · what you need",
        "kri-ord-steps": "3 · the steps",
        "kri-ord-warn": "4 · warnings and what to do if it goes wrong"
      },
      "title": "Put the reading routine in order",
      "cue": "Title, what you need, the steps, then the warnings and what to do if it goes wrong.",
      "why": "Reading in a fixed routine makes any set of instructions manageable: the title says what it is for, the list of what you need lets you gather it first, the steps say what to do and the warnings say what to avoid. Following the same routine every time means nothing important gets missed, however long or unfamiliar the instructions are.",
      "outOfOrderNote": "Out of order. Start with what the instructions are for, then gather what you need."
    },
    {
      "id": "keep-your-place-as-you-read",
      "kind": "hold",
      "target": "kri-finger-trace",
      "seconds": 6,
      "title": "Keep your place as you read the steps",
      "cue": "Trace each line as you read so you do not skip a step.",
      "why": "Keeping your place, with a finger or a ruler under the line, stops the eye jumping ahead and missing a step that looks like the one before it. Careful readers of instructions do this with anything that matters, because a skipped step is often the one that makes the rest work.",
      "holdBreakNote": "You lost your place and skipped ahead. Go back to the last step you are sure of."
    },
    {
      "id": "look-up-the-word-you-do",
      "kind": "turn",
      "target": "kri-meaning-dial",
      "turn": {
        "turns": 0.5,
        "axis": "y",
        "label": "MEANING"
      },
      "title": "Look up the word you do not know",
      "cue": "One word in step four is new. Turn the dial from the word to its meaning before going on.",
      "why": "An unfamiliar word in an instruction is a signal to stop, not to guess. Looking it up, in a glossary, a dictionary or by asking, means you follow the instruction that was written rather than the one you imagined; in safety instructions especially, one misunderstood word can change what you do."
    },
    {
      "id": "read-at-a-pace-that-lets",
      "kind": "gauge",
      "target": "kri-pace-meter",
      "gauge": {
        "label": "PACE",
        "speed": 0.6,
        "green": [
          0.4,
          0.58
        ],
        "missNote": "Outside the band. Too fast and you skim the warnings; too slow and you lose the thread. Settle into a steady pace."
      },
      "title": "Read at a pace that lets you understand",
      "cue": "Commit when your reading pace is steady — not rushing, not stopping on every word.",
      "why": "Reading too fast skims over the details that matter; reading too slowly loses the thread of what the steps are building towards. A steady pace, slowing down only for warnings and new words, is how skilled readers take in instructions accurately."
    },
    {
      "id": "return-the-product-to-its-labelled",
      "kind": "drag",
      "target": "kri-bottle-token",
      "drag": {
        "to": "kri-shelf-spot",
        "radius": 0.45,
        "missNote": "It is not back in its place yet. Take it all the way to the labelled shelf."
      },
      "title": "Return the product to its labelled place",
      "cue": "Drag the bottle back to its labelled shelf, still in its own container, when you are done.",
      "why": "A product kept in its own labelled container, in its labelled place, can always be read by the next person who uses it. Putting it back properly finishes the task and protects everyone who comes after you, which is the reason labels exist in the first place."
    },
    {
      "id": "ask-the-teacher-about-the-part",
      "kind": "select",
      "target": "kri-ask-card",
      "title": "Ask the teacher about the part you are unsure of",
      "cue": "One instruction could be read two ways. Ask the teacher which it means.",
      "why": "When an instruction can be read two ways, asking is the skilled thing to do, not a sign of weakness. Adults at work ask the same question every day, and the person who wrote the instruction would always rather be asked than have it done wrongly."
    },
    {
      "id": "spot-the-problems-in-badly-written",
      "kind": "find",
      "noHint": true,
      "targets": [
        "kri-draft-order",
        "kri-draft-jargon",
        "kri-draft-no-help"
      ],
      "itemNames": {
        "kri-draft-order": "two steps in the wrong order",
        "kri-draft-jargon": "a word the reader will not know",
        "kri-draft-no-help": "nothing on what to do if it goes wrong"
      },
      "itemNotes": {
        "kri-draft-order": "A reader follows steps in the order written. Out of order means done wrong.",
        "kri-draft-jargon": "Explain it or use a plainer word. A reader cannot follow what they cannot understand.",
        "kri-draft-no-help": "Every set of instructions needs this part, even if it is only 'stop and get an adult'."
      },
      "decoyNotes": {
        "kri-draft-numbered": "Numbered steps help the reader keep their place. Keep them."
      },
      "title": "Spot the problems in badly written instructions",
      "cue": "Look at the classmate's draft instructions and mark each problem.",
      "why": "Writing instructions is the best way to learn to read them. Badly written instructions usually give steps out of order, use a word the reader will not know without explaining it, and leave out what to do if something goes wrong. Spotting these in a draft teaches you to notice them in real instructions, and to ask about them."
    },
    {
      "id": "keep-your-focus-while-you-follow",
      "kind": "track",
      "target": "kri-focus-meter",
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
        "label": "FOCUS"
      },
      "title": "Keep your focus while you follow the steps",
      "cue": "Hold your attention in band as you carry out each step, checking back to the page.",
      "why": "Following instructions well means looking back at the page between steps rather than working from memory after the first read. Keeping your focus on the page and the task together is what stops small slips turning into a finished job that does not work.",
      "holdBreakNote": "Your attention drifted from the page. Look back at the step you are on before you carry on."
    },
    {
      "id": "record-what-you-read-and-what",
      "kind": "select",
      "target": "kri-reading-log",
      "doneLine": "Reading and questions recorded",
      "title": "Record what you read and what you asked",
      "cue": "Write down the label parts, the new word and the question you asked.",
      "why": "Recording what you read, the word you looked up and the question you asked shows your teacher how you worked, not just whether you finished. It also gives you a record to look back on the next time you meet a label or a set of instructions like it."
    },
    {
      "id": "share-one-reading-tip-with-the",
      "kind": "select",
      "target": "kri-share-board",
      "doneLine": "Reading tips shared",
      "title": "Share one reading tip with the class",
      "cue": "Tell the class one thing that helped you read the instructions well.",
      "why": "Sharing a reading tip with classmates helps the ones who found it hard and fixes the habit in your own memory. The best tips are simple, read it all first, keep your place, ask when unsure, and everyone in the class can use them tomorrow."
    },
    {
      "id": "crew-check-in",
      "kind": "select",
      "target": "kri-checkin",
      "doneLine": "Checked in",
      "title": "Check in at the end of the lesson",
      "cue": "How did that go? Which part of reading the label was hardest?",
      "why": "A short check-in at the end tells the teacher who is confident and who needs another go, and it gives each learner a moment to notice what they can now do. Nobody is marked here, and a teacher or trusted adult is there for anyone who wants to talk more."
    }
  ],

  interrupts: [
    {
      "id": "a-bottle-is-knocked-over",
      "kind": "Spill",
      "after": "keep-your-place-as-you-read",
      "delay": 3,
      "seconds": 12,
      "target": "kri-step-back-and-tell",
      "alert": "A classmate knocks over an open bottle and it starts to spill across the bench.",
      "cue": "Step back, keep others back, and tell the teacher — the label says what to do next.",
      "why": "A spill is exactly the moment the label's what-to-do section was written for, but acting on it is the adult's job in a classroom. Stepping back, keeping others away and telling the teacher at once, so they can read the label and deal with it, keeps everyone safe.",
      "missNote": "Nobody told the teacher, and a classmate wiped it up with bare hands before anyone read the label.",
      "wrongNote": "That does not get help. Step back and tell the teacher."
    },
    {
      "id": "the-technician-asks-what-the-signal-word-means",
      "kind": "Technician question",
      "after": "keep-your-focus-while-you-follow",
      "delay": 3,
      "seconds": 12,
      "target": "kri-explain-signal-word",
      "alert": "The workshop technician points at the label and asks what its signal word tells you.",
      "cue": "Say what the signal word shows about how serious the warning is, in your own words.",
      "why": "Being able to explain a label in your own words is the proof that you have read it rather than looked at it. The technician asks because in a real workshop the people who can explain the label are the ones trusted to use the product.",
      "missNote": "You could not say what it meant, so the technician kept the product off your bench.",
      "wrongNote": "That does not explain the signal word. Say what it tells you about how serious the warning is."
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
    bead(-1.22, 0.9, -0.27, "kri-signal-word", "the signal word", {});
    bead(-1.42, 1.18, -0.62, "kri-pictogram", "the warning picture", {});
    bead(-1.03, 1.46, -0.71, "kri-first-aid", "what to do if it goes wrong", {});
    bead(-1.08, 0.9, -1.11, "kri-brand-logo", "the brand logo", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kri-ord-title", "1 · the title: what is it for?", {});
    bead(-0.58, 1.46, -1.44, "kri-ord-need", "2 · what you need", {});
    bead(-0.24, 0.9, -1.23, "kri-ord-steps", "3 · the steps", {});
    bead(0, 1.18, -1.55, "kri-ord-warn", "4 · warnings and what to do if it goes wrong", {});
    bead(0.24, 1.46, -1.23, "kri-finger-trace", "Tracing each line with a finger", {});
    bead(0.58, 0.9, -1.44, "kri-draft-order", "two steps in the wrong order", {});
    bead(0.68, 1.18, -1.05, "kri-draft-jargon", "a word the reader will not know", {});
    bead(1.08, 1.46, -1.11, "kri-draft-no-help", "nothing on what to do if it goes wrong", {});
    bead(1.03, 0.9, -0.71, "kri-draft-numbered", "clearly numbered steps", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kri-step-back-and-tell", "Step back and tell the teacher", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kri-explain-signal-word", "Explain what the signal word tells you", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kri-read-all", "Read the whole thing first", "READ IT\nALL FIRST", { ry: 1.2 });
    dials["kri-meaning-dial"] = dial(-1.89, -1.4, 0.93, "kri-meaning-dial", "Word to meaning");
    meters["kri-pace-meter"] = meter(-1.45, -1.85, 0.67, "kri-pace-meter", "Reading pace");
    tokens["kri-bottle-token"] = token(-0.92, -2.16, 0.4, "kri-bottle-token", "The product bottle");
    spots["kri-shelf-spot"] = spot(-0.31, -2.33, 0.13, "kri-shelf-spot", "Back on its labelled shelf");
    card(0.31, 1.35, -2.33, "kri-ask-card", "Ask when unsure", "NOT SURE?\nASK", { ry: -0.13 });
    meters["kri-focus-meter"] = meter(0.92, -2.16, -0.4, "kri-focus-meter", "Focus on the task");
    boards["kri-reading-log"] = board(1.45, -1.85, -0.67, "kri-reading-log", "Reading record");
    boards["kri-share-board"] = board(1.89, -1.4, -0.93, "kri-share-board", "Share with the class");
    boards["kri-checkin"] = board(2.19, -0.85, -1.2, "kri-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "start-before-reading-to-the-end", "Start step one before reading to the end?", "START NOW,\nREAD LATER", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "guess-the-symbol", "Guess what the pictogram means?", "PROBABLY\nFINE", 0.3);
    hazardCard(0.58, 0.72, -1.86, "pour-into-an-unlabelled-bottle", "Pour some into an unlabelled drinks bottle?", "IN A DRINKS\nBOTTLE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "skip-the-if-it-goes-wrong", "Skip the part about what to do if something goes wrong?", "WON'T\nNEED IT", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Read it all first."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Workshop technician", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-bottle-is-knocked-over"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-bottle-is-knocked-over"].visible = false;
    arrivals["the-technician-asks-what-the-signal-word-means"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-technician-asks-what-the-signal-word-means"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "return-the-product-to-its-labelled") { const s = spots["kri-shelf-spot"]; tokens["kri-bottle-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-what-you-read-and-what") repaint(boards["kri-reading-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Reading and questions recorded"], "#59c97b"));
        if (step.id === "share-one-reading-tip-with-the") repaint(boards["kri-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Reading tips shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kri-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "ask-the-teacher-about-the-part") paintGuide("Signal word, picture, what to do, what to do if it goes wrong.");
      },

      onHazard() {
        paintGuide("Stop. Go back and read that part again before you act.");
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
        if (it.id === "a-bottle-is-knocked-over") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Everyone stepped back and the teacher read the label before cleaning up."); }
        if (it.id === "the-technician-asks-what-the-signal-word-means") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Explained in your own words. That is reading, not just looking."); }
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
