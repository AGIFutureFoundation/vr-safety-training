import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — How a Local Council Meeting Works. Lower- and upper-secondary civics, generic: how a public council meeting runs, how a resident gets heard in public comment, and how a decision is recorded — no real council, place or person.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_HOW_A_LOCAL_COUNCIL_MEETING_WORKS = {
  id: "k12-how-a-local-council-meeting-works",
  index: "810",
  domain: "Education",
  trade: "Civics class at the civic centre's meeting chamber — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "How a Local Council Meeting Works",
  title: simTitle("How a Local Council Meeting Works"),
  tagline: "Read the agenda, sign up to speak, keep to your point, and check what the minutes record",
  accent: 0xc08a4a,
  accentCss: "#c08a4a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"heard-in-public","name":"Heard in Public","note":"An agenda read, a clear public comment given and the decision checked in the minutes"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Chamber Board",
    currency: "VOICES",
    ranks: ["Observer","Resident","Speaker","Organiser","Civic Leader"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-the-meeting") },
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
    "speak-without-signing-up": "You stood up to speak without signing up. Public meetings run public comment by their own procedure, usually a sign-up with the clerk, so everyone gets a fair turn; speaking out of turn usually means not being heard at all.",
    "attack-a-person": "You attacked a council member personally. Public comment is most effective when it is about the issue and what you want done; a personal attack gives people a reason to stop listening and often breaks the meeting's own conduct rules.",
    "claim-a-figure-you-cannot-source": "You quoted a figure you could not source. In public comment, a claim you cannot back up weakens everything else you say; say what you have seen yourself, or say where the information comes from.",
    "rely-on-memory-for-the-decision": "You relied on what you remembered was decided. The official record of a meeting is its minutes; checking them is how residents confirm what was actually agreed and hold the council to it."
  },

  lateNotes: {
    "kcm-minutes-log": "The minutes are checked after they are published — nothing to check yet.",
    "kcm-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-the-parts-of-the-meeting",
      kind: "find",
      noHint: true,
      targets: [
        "kcm-agenda",
        "kcm-signup",
        "kcm-minutes"
      ],
      itemNames: {
        "kcm-agenda": "the published agenda",
        "kcm-signup": "the public comment sign-up",
        "kcm-minutes": "the minutes of the last meeting"
      },
      itemNotes: {
        "kcm-agenda": "What will be discussed, in order. Read it before the meeting.",
        "kcm-signup": "How a resident gets a turn to speak.",
        "kcm-minutes": "The official record of what was decided."
      },
      decoyNotes: {
        "kcm-portrait": "Part of the room, not part of taking part. Look for the agenda, sign-up and minutes."
      },
      title: "Find the parts of the meeting",
      cue: "Mark the three documents and stations every public meeting in this lesson uses.",
      why: "A public meeting runs on three things residents can use: the agenda that lists what will be discussed, the sign-up sheet for public comment and the minutes that record what was decided. Knowing where each is lets anyone take part, not just people who have been before. The council here is generic, not any real one."
    },
    {
      id: "read-the-agenda-before-the-meeting",
      kind: "select",
      target: "kcm-agenda-card",
      title: "Read the agenda before the meeting",
      cue: "Find the item you care about on the agenda and when it comes up.",
      why: "Reading the agenda tells you whether the issue you care about is being discussed and roughly when. Public comment on the item under discussion is heard at the right moment; turning up without reading it means missing your chance."
    },
    {
      id: "put-the-public-comment-in-order",
      kind: "sequence",
      targets: [
        "kcm-ord-name",
        "kcm-ord-item",
        "kcm-ord-point",
        "kcm-ord-ask"
      ],
      itemNames: {
        "kcm-ord-name": "1 · your name and neighbourhood",
        "kcm-ord-item": "2 · the agenda item",
        "kcm-ord-point": "3 · your point",
        "kcm-ord-ask": "4 · what you ask for"
      },
      title: "Put the public comment in order",
      cue: "Your name and where you live, the item, your point, what you ask for.",
      why: "An effective public comment is short and in a clear order: who you are, which item you are speaking on, the point you want to make and what you are asking the council to do. The order helps the council, the clerk and the other residents follow you.",
      outOfOrderNote: "Out of order. Say who you are and which item before your point, so people know what you are talking about."
    },
    {
      id: "listen-to-the-discussion-before-you",
      kind: "hold",
      target: "kcm-listen-debate",
      seconds: 6,
      title: "Listen to the discussion before you speak",
      cue: "Hold still and listen to the council's discussion of the item.",
      why: "Listening to the discussion first tells you what has already been said and what the council is unsure about. A comment that answers a real question in the room is far more useful than one that repeats what everyone has heard.",
      holdBreakNote: "You stopped listening and started rehearsing. Listen to what is actually being said."
    },
    {
      id: "turn-from-observer-to-speaker",
      kind: "turn",
      target: "kcm-role-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SPEAKER"
      },
      title: "Turn from observer to speaker",
      cue: "Your name is called. Turn from listening to speaking.",
      why: "Moving from observer to speaker is the step most residents never take. Doing it calmly, when your name is called and not before, is what the procedure is for: it gives every resident the same fair turn. Signing up in advance also lets the chair plan the time so that nobody who came to speak is left out."
    },
    {
      id: "speak-at-a-clear-steady-pace",
      kind: "gauge",
      target: "kcm-pace-meter",
      gauge: {
        label: "PACE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too fast and nobody catches your point; too slow and you run out of turn. Try again."
      },
      title: "Speak at a clear, steady pace",
      cue: "Commit when your pace is clear enough to follow — not rushed, not dragging.",
      why: "Public comment is usually short, which tempts people to rush. A clear, steady pace makes sure the council and the clerk actually catch your point; a rushed one loses it. Practising the comment aloud beforehand is the easiest way to find the pace that fits the time allowed."
    },
    {
      id: "hand-your-written-comment-to-the",
      kind: "drag",
      target: "kcm-comment-token",
      drag: {
        to: "kcm-clerk-spot",
        radius: 0.45,
        missNote: "Not in place yet. Take it all the way to with the clerk."
      },
      title: "Hand your written comment to the clerk",
      cue: "Drag your written comment to the clerk so it can be entered in the record.",
      why: "Handing a written version to the clerk means your point is recorded accurately, even if the minutes summarise the spoken comments. It is a simple step that makes a public comment last beyond the meeting. A written copy also helps the clerk record your point accurately in the minutes."
    },
    {
      id: "keep-it-about-the-issue",
      kind: "select",
      target: "kcm-respect-card",
      title: "Keep it about the issue",
      cue: "Make your point about the issue and what should be done, not about a person.",
      why: "Comments about the issue are heard; comments about a person are resisted. Keeping to the issue and what you want done is both more respectful and more effective, and it is what most meetings' conduct rules ask for. Speaking to the chair keeps the exchange about the issue rather than about the people in the room."
    },
    {
      id: "spot-the-problems-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kcm-pc-no-ask",
        "kcm-pc-personal",
        "kcm-pc-unsourced"
      ],
      itemNames: {
        "kcm-pc-no-ask": "no clear ask",
        "kcm-pc-personal": "a personal attack",
        "kcm-pc-unsourced": "a claim with no source"
      },
      itemNotes: {
        "kcm-pc-no-ask": "What do you want the council to do? Say it.",
        "kcm-pc-personal": "Keep to the issue. Attacks stop people listening.",
        "kcm-pc-unsourced": "Say what you saw yourself or where it comes from."
      },
      decoyNotes: {
        "kcm-pc-item-named": "Naming the item helps everyone follow. Keep it."
      },
      title: "Spot the problems in a classmate's comment",
      cue: "Look at the draft public comment and mark each problem.",
      why: "Public comments go wrong in predictable ways: no clear ask, a personal attack and a claim with no source. Spotting them in a draft is how you learn to write a comment that gets heard. The usual problems are the same every time: wandering off the item, running long and leaving out the ask."
    },
    {
      id: "stay-calm-while-others-disagree",
      kind: "track",
      target: "kcm-track-meter",
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
        label: "CALM"
      },
      title: "Stay calm while others disagree",
      cue: "Hold your composure in band as another resident speaks against your point.",
      why: "Hearing someone disagree in public is uncomfortable. Staying calm, listening and not interrupting is what lets the meeting work for everyone, including you, the next time you speak. Meetings run on everyone following the same rules, and a resident who does is listened to more readily.",
      holdBreakNote: "You lost your composure. Breathe, listen and let them finish."
    },
    {
      id: "check-the-decision-in-the-minutes",
      kind: "select",
      target: "kcm-minutes-log",
      doneLine: "Decision checked in the minutes",
      title: "Check the decision in the minutes",
      cue: "When the minutes are published, check what was recorded as decided.",
      why: "The minutes are the official record. Checking them confirms what was actually decided and whether your comment was noted, and it is how residents follow up and hold a council to its decisions. Without checking the minutes, a resident can leave believing something was agreed that never actually was."
    },
    {
      id: "explain-the-process-to-the-class",
      kind: "select",
      target: "kcm-share-board",
      doneLine: "Process shared",
      title: "Explain the process to the class",
      cue: "Explain how a resident gets heard, from the agenda to the minutes.",
      why: "Explaining the process from agenda to minutes turns a single visit into something the whole class can use. Many adults never learn it; knowing it is a real civic skill. Knowing how the meeting works means you can take part in decisions about your own street, school or park."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kcm-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the meeting go? What question do you still have?",
      why: "A short check-in lets the teacher hear what made sense and what did not, and gives each learner a moment to name one question they still have. Nobody is graded here, and a teacher or trusted adult is there for anyone who wants to talk more."
    }
  ],

  interrupts: [
    {
      id: "a-resident-feels-faint",
      kind: "Unwell resident",
      after: "listen-to-the-discussion-before-you",
      delay: 3,
      seconds: 12,
      target: "kcm-tell-the-clerk",
      alert: "A resident near you says they feel faint and sits down heavily.",
      cue: "Tell the clerk straight away so help is called; do not try to treat them yourself.",
      why: "When someone is unwell at a meeting, the right response is to get help quickly: tell the clerk, who can pause the meeting and call for help. It is never a learner's job to treat anyone.",
      missNote: "Nobody told the clerk, and help was called late. Next time, stop the lesson and deal with it first.",
      wrongNote: "That does not get help. Tell the clerk. Choose the response that deals with it now."
    },
    {
      id: "the-clerk-asks-which-item",
      kind: "Clerk question",
      after: "stay-calm-while-others-disagree",
      delay: 3,
      seconds: 12,
      target: "kcm-name-the-item",
      alert: "The clerk asks which agenda item you signed up to speak on.",
      cue: "Name the item from the agenda.",
      why: "The clerk runs public comment item by item. Naming your item means you are called at the right moment and your comment is recorded against the right decision.",
      missNote: "You could not name the item, and your turn passed. Next time, stop the lesson and deal with it first.",
      wrongNote: "That does not name the item. Give the agenda item. Choose the response that deals with it now."
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
    bead(-1.22, 0.9, -0.27, "kcm-agenda", "the published agenda", {});
    bead(-1.42, 1.18, -0.62, "kcm-signup", "the public comment sign-up", {});
    bead(-1.03, 1.46, -0.71, "kcm-minutes", "the minutes of the last meeting", {});
    bead(-1.08, 0.9, -1.11, "kcm-portrait", "the portrait on the wall", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kcm-ord-name", "1 · your name and neighbourhood", {});
    bead(-0.58, 1.46, -1.44, "kcm-ord-item", "2 · the agenda item", {});
    bead(-0.24, 0.9, -1.23, "kcm-ord-point", "3 · your point", {});
    bead(0, 1.18, -1.55, "kcm-ord-ask", "4 · what you ask for", {});
    bead(0.24, 1.46, -1.23, "kcm-listen-debate", "Listening to the debate", {});
    bead(0.58, 0.9, -1.44, "kcm-pc-no-ask", "no clear ask", {});
    bead(0.68, 1.18, -1.05, "kcm-pc-personal", "a personal attack", {});
    bead(1.08, 1.46, -1.11, "kcm-pc-unsourced", "a claim with no source", {});
    bead(1.03, 0.9, -0.71, "kcm-pc-item-named", "the agenda item named", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kcm-tell-the-clerk", "Tell the clerk and call for help", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kcm-name-the-item", "Name the agenda item", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kcm-agenda-card", "Read the agenda first", "READ THE\nAGENDA", { ry: 1.2 });
    dials["kcm-role-dial"] = dial(-1.89, -1.4, 0.93, "kcm-role-dial", "Observer to speaker");
    meters["kcm-pace-meter"] = meter(-1.45, -1.85, 0.67, "kcm-pace-meter", "Speaking pace");
    tokens["kcm-comment-token"] = token(-0.92, -2.16, 0.4, "kcm-comment-token", "Your written comment");
    spots["kcm-clerk-spot"] = spot(-0.31, -2.33, 0.13, "kcm-clerk-spot", "With the clerk");
    card(0.31, 1.35, -2.33, "kcm-respect-card", "The issue, not the person", "THE ISSUE,\nNOT THE PERSON", { ry: -0.13 });
    meters["kcm-track-meter"] = meter(0.92, -2.16, -0.4, "kcm-track-meter", "Calm in the chamber");
    boards["kcm-minutes-log"] = board(1.45, -1.85, -0.67, "kcm-minutes-log", "Check the minutes");
    boards["kcm-share-board"] = board(1.89, -1.4, -0.93, "kcm-share-board", "Share with the class");
    boards["kcm-checkin"] = board(2.19, -0.85, -1.2, "kcm-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "speak-without-signing-up", "Stand up and speak without signing up?", "JUST\nSTAND UP", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "attack-a-person", "Criticise a council member personally?", "YOU'RE\nUSELESS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "claim-a-figure-you-cannot-source", "Quote a figure you heard somewhere?", "EVERYONE\nKNOWS THAT", -0.3);
    hazardCard(1.53, 0.72, -1.21, "rely-on-memory-for-the-decision", "Rely on what you remember was decided?", "I THINK\nTHEY SAID", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Agenda, public comment, minutes."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Civics teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Meeting clerk", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-resident-feels-faint"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-resident-feels-faint"].visible = false;
    arrivals["the-clerk-asks-which-item"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-clerk-asks-which-item"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "hand-your-written-comment-to-the") { const s = spots["kcm-clerk-spot"]; tokens["kcm-comment-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "check-the-decision-in-the-minutes") repaint(boards["kcm-minutes-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Decision checked in the minutes"], "#59c97b"));
        if (step.id === "explain-the-process-to-the-class") repaint(boards["kcm-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Process shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kcm-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "keep-it-about-the-issue") paintGuide("Clear, respectful, on the item.");
      },

      onHazard() {
        paintGuide("Stop. Check how this meeting's own rules say it is done.");
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
        if (it.id === "a-resident-feels-faint") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Clerk told and help called. The meeting paused, then resumed."); }
        if (it.id === "the-clerk-asks-which-item") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Item named. You will be called when it comes up."); }
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
