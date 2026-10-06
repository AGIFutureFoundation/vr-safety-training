import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, seatedFigure, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Permit Study and Knowledge-Test Day VR — Pathway Edition,
// wojrc.org.
//
// A study room next to the testing window on the day a Class A permit
// candidate sits the knowledge test: the manual chapter read, a study
// routine worked through in order, a practice quiz held honestly, the
// missing topics in a set of study notes found, test-day documents brought
// to the window, the knowledge test itself sat without rushing, results
// read, the permit filed and the next appointment — behind-the-wheel
// training — booked. Sited generically: no real testing site, DMV or clause
// number the registry is not sure of.

const PST_ACCENT = 0x5fb8f0;
const PST_CSS = "#5fb8f0";

export const SIM_WP_PERMIT_STUDY_AND_KNOWLEDGE_TEST = {
  id: "wp-permit-study-and-knowledge-test",
  index: "712",
  domain: "Commercial Driving",
  trade: "Pathway Edition — a Class A permit study session and knowledge-test day",
  category: "Mobility & Transit",
  indoor: "clinic",
  weather: "clear",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose theory curriculum is exactly what this study session works through before the permit; 49 CFR 383 for the commercial driver's license knowledge and skills tests this day's test is the first of; the state CDL handbook, the actual book the study routine and the practice quiz are built from; CVSA roadside inspection practice, one of the general-knowledge topics the notes board checks for; 29 CFR 1910.151 for the first-aid response a testing room's own stress can turn into a real need; Teamsters (IBT) driver training programmes, which this permit is the first document toward",
  name: "Permit Study and Knowledge-Test Day",
  title: simTitle("Permit Study and Knowledge-Test Day"),
  tagline: "Read the assigned chapter, work the study routine in order, hold the practice quiz honestly, find the gaps in your notes, bring the right documents to the window, sit the knowledge test without rushing, and book behind-the-wheel training next",
  accent: PST_ACCENT,
  accentCss: PST_CSS,
  parSeconds: 330,
  footprint: 2.2,
  supportLine: "the programme's own coaching staff, and 988 or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if test-day nerves have become more than the room can hold",
  badge: { id: "permit-earned", name: "Permit Earned", note: "The chapter read, the study routine held in order, the practice quiz honest, the notes gaps found, the right documents brought, the test sat clean, and behind-the-wheel training booked" },

  game: system({
    name: "Testing Window",
    currency: "CHAPTER",
    ranks: ["Studying", "Practice Passed", "Test Sat", "Permit Filed", "Knowledge Test Certified"],
    badges: [
      { id: "no-gaps", name: "No Gaps", note: "The chapter held through and the notes gaps found clean", test: AWARD.all(AWARD.stepClean("read-chapter"), AWARD.stepClean("find-gaps")) },
      { id: "own-answers", name: "Own Answers", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "held-the-quiz", name: "Held The Quiz", note: "The practice quiz track carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-test-day", name: "Clean Test Day", note: "No corrections anywhere", test: AWARD.clean },
      { id: "steady-nerves", name: "Steady Nerves", note: "The confidence gauge committed near the middle of the band", test: AWARD.precise(0.7) },
      { id: "one-sitting-pass", name: "One-Sitting Pass", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wp-pt-screen-hunch": "You were about to spend the whole study session hunched over the practice-quiz tablet flat on the table. A study session run this way strains the same neck and shoulders a full shift later will, hours before the test even starts — raise the tablet on its stand before you begin, not after your neck already aches.",
    "wp-pt-stuffy-room": "The vent in the study room has been struggling for an hour and the air has gone warm and heavy. A hot, airless room dulls the concentration a knowledge test specifically needs, and it is worth fixing before the test rather than blaming a low score on nerves afterward — crack the door for a cross breeze and get water now.",
    "wp-pt-failed-visitor": "Someone who just failed the test is banging on the results window, raising his voice at the clerk. Space and a level tone come first — step back from the window, let the clerk handle it, and do not let his frustration become the last thing on your mind before you go in to test yourself.",
    "wp-pt-panic-neighbor": "The candidate at the next study table has gone pale and is breathing fast, gripping the edge of the table before their own test. A panic response before a high-stakes test is common and treatable in the moment — get the proctor, help them slow their breathing, and do not just keep studying next to it as if nothing is happening.",
  },

  lateNotes: {
    "wp-pt-permit-card": "Not yet. The permit goes in the folder once the results actually say it passed — not before the window has said so.",
    "wp-pt-permit-log": "The log closes out the day last, with the actual score and the behind-the-wheel date that got booked.",
  },

  steps: [
    {
      id: "sign-in", kind: "select", target: "wp-pt-signin-desk",
      title: "Sign in at the study room desk",
      cue: "Sign the sheet with your name and the appointment time for today's test.",
      why: "The testing window schedules candidates in slots, and signing in confirms you are actually here for the slot booked rather than someone else's — the same habit as every appointment this pathway runs on, and the first thing that keeps a full morning of test-takers from turning into a line nobody can account for.",
    },
    {
      id: "read-chapter", kind: "hold", target: "wp-pt-manual", seconds: 6,
      title: "Read today's assigned chapter",
      cue: "Hold the manual open at the assigned chapter and read it all the way through.",
      why: "The state CDL handbook is the actual source the knowledge test is written from, not a summary of it, and reading the assigned chapter in full — not skimming for the parts that sound testable — is what catches the general-knowledge questions a shortcut study guide leaves out.",
      holdBreakNote: "You closed the manual partway through the chapter. The section you skipped is as likely as any other to be the one the test asks about — open it again and finish it.",
    },
    {
      id: "study-routine", kind: "sequence",
      targets: ["wp-pt-routine-read", "wp-pt-routine-quiz", "wp-pt-routine-review"],
      itemNames: { "wp-pt-routine-read": "read the chapter", "wp-pt-routine-quiz": "take the practice quiz", "wp-pt-routine-review": "review what you missed" },
      outOfOrderNote: "Read, then quiz, then review — a quiz taken before the chapter is read tests nothing, and reviewing what you missed only means something once you have actually been quizzed on it.",
      title: "Work the study routine in order",
      cue: "Read the chapter, take the practice quiz, then review what you got wrong — in that order.",
      why: "A study routine done out of order wastes the one thing a test-day morning does not have much of: time. Reading first gives the quiz something to test, and reviewing what was missed only works once the quiz has actually shown you what that is — skipping straight to review, or reviewing before quizzing, teaches nothing.",
    },
    {
      id: "practice-quiz", kind: "track", target: "wp-pt-quiz-tablet", seconds: 7,
      title: "Hold the practice quiz honestly",
      cue: "Hold the quiz track in the band: reading every question, not guessing and not memorising the practice answers by their position.",
      track: {
        start: 0.5, green: [0.36, 0.66], rise: 0.5, fall: 0.44, drift: 0.14, label: "PACE",
        readout: (v) => (v < 0.36 ? "guessing" : v > 0.66 ? "memorising positions" : "reading it through"),
      },
      holdBreakNote: "The pace slipped — into guessing or into memorising where the right answer sits instead of what it says. Come back to reading each question.",
      why: "A practice quiz answered by memorising which letter came up last time, rather than by actually reading the question, tells you nothing about the real test, which reorders and rewrites every question. Reading each one through, honestly, is the only way the practice quiz actually predicts how test day goes.",
    },
    {
      id: "find-gaps", kind: "find", noHint: true,
      targets: ["wp-pt-gap-airbrake", "wp-pt-gap-hazmat", "wp-pt-gap-cargo"],
      itemNames: { "wp-pt-gap-airbrake": "no notes on air brakes", "wp-pt-gap-hazmat": "no notes on hazmat awareness", "wp-pt-gap-cargo": "no notes on cargo securement" },
      itemNotes: {
        "wp-pt-gap-airbrake": "Air brakes are one of the general-knowledge topics the state CDL handbook covers before a driver ever sees a truck, and a blank page here means the practice quiz just quietly skipped it.",
        "wp-pt-gap-hazmat": "Hazmat awareness is tested even for drivers who never plan to haul it — a blank page here is a guess waiting to happen on test day.",
        "wp-pt-gap-cargo": "Cargo securement general knowledge is its own section of the handbook, and a blank page here is one more topic the practice quiz never actually checked.",
      },
      title: "Find the three gaps in your study notes",
      cue: "Three pages in your notes have nothing written on them. Find all three.",
      why: "A blank page in a set of study notes is a topic the practice quiz quietly never tested, because there was nothing there to review — finding the gaps before test day is the only way to know what you actually do not know yet, instead of finding out from a question you cannot answer.",
    },
    {
      id: "confidence-gauge", kind: "gauge", target: "wp-pt-confidence-dial",
      title: "Rate your test-day confidence honestly",
      cue: "The dial runs one to ten. Commit it where you actually are, not where you want to be walking in.",
      gauge: {
        label: "CONFIDENCE", speed: 0.6, green: [0.4, 0.7],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That number does not match someone who just found three gaps in their own notes. Rate it honestly — the coach reads it before deciding whether today is the day to test or the day to study one more session.",
      },
      why: "This number decides whether the coach encourages you to sit the test today or book one more study session first, and an inflated ten answered by someone who just found three gaps gets no such conversation — the honest number is what makes the coach's advice worth anything at all.",
    },
    {
      id: "bring-documents", kind: "find", noHint: true,
      targets: ["wp-pt-doc-id", "wp-pt-doc-application", "wp-pt-doc-fee"],
      itemNames: { "wp-pt-doc-id": "photo ID", "wp-pt-doc-application": "the completed application", "wp-pt-doc-fee": "the fee receipt" },
      itemNotes: {
        "wp-pt-doc-id": "Photo ID is checked against the application before you are even called to a terminal — no ID, no test today.",
        "wp-pt-doc-application": "A completed application with nothing left blank is what the window actually processes; one filled in at the counter under pressure is where mistakes creep in.",
        "wp-pt-doc-fee": "The fee receipt is proof the test slot is actually paid for — without it, the window has no record that today's appointment was ever confirmed.",
      },
      title: "Bring the right documents to the window",
      cue: "From the folder on the table, find your photo ID, the completed application and the fee receipt.",
      why: "A test-day appointment lost to a document left at home is the most avoidable way to lose a testing slot, and all three of these are checked before anyone is called to a terminal — bringing them the first time is what keeps a morning of studying from ending at the window instead of at a terminal.",
    },
    {
      id: "sit-test", kind: "hold", target: "wp-pt-test-terminal", seconds: 8,
      title: "Sit the knowledge test without rushing",
      cue: "Hold at the terminal and work through the test at a steady pace, reading every question fully.",
      why: "The knowledge test has no clock pressuring a rushed answer, and a candidate who reads every question fully, including the ones that sound familiar from the practice quiz, catches the ones written to look like a familiar question with a changed detail. Rushing to finish early proves nothing to anyone; the score is the only thing that matters.",
      holdBreakNote: "You clicked ahead before finishing the question. Slow back down and read it through before you answer — the test rewards accuracy, not speed.",
    },
    {
      id: "book-roadtest", kind: "turn", target: "wp-pt-calendar-dial",
      title: "Book behind-the-wheel training",
      cue: "Turn the calendar dial to the date your behind-the-wheel training starts, once the permit clears.",
      turn: { turns: 0.6, axis: "y", label: "NEXT: BEHIND-THE-WHEEL" },
      why: "A permit with no training date attached to it is a permit that sits in a drawer while the knowledge that just got tested starts to fade — booking the behind-the-wheel start date today, at the window, is what turns a passed test into the next step of the pathway instead of a certificate framed and forgotten.",
    },
    {
      id: "read-results", kind: "select", target: "wp-pt-results-window",
      title: "Read your results at the window",
      cue: "Go to the window and read the results card the clerk hands you.",
      why: "The results card is the actual record of the score, and reading it at the window — rather than assuming from how the test felt — is what confirms the permit is real before you plan the next step around it. It is also where a clerk answers any question about what the score means for scheduling.",
    },
    {
      id: "file-permit", kind: "drag", target: "wp-pt-permit-card",
      title: "File the permit in your folder",
      cue: "Carry the permit card into your license folder.",
      why: "The permit is the document every step from here forward checks — the behind-the-wheel instructor, the coordinator, eventually the employer — and it goes into the folder now, while it is in your hand, rather than loose in a bag where a testing office sees it get lost every week.",
      drag: { to: "wp-pt-license-folder", radius: 0.4, missNote: "Not in the folder. A permit left on the counter is a permit somebody else picks up by mistake." },
    },
    {
      id: "coach-checkin", kind: "select", target: "wp-pt-coach",
      title: "Check in with the coach",
      cue: "Tell the coach the score, what felt hardest, and how test-day nerves actually went.",
      why: "The coach plans the behind-the-wheel schedule around what you say here — which topics still feel shaky, whether the nerves were manageable or something more. A test-day debrief given honestly is what makes the next block of training start where you actually are, not where the permit score alone suggests.",
    },
    {
      id: "close-log", kind: "select", target: "wp-pt-permit-log",
      title: "Close out the permit log",
      cue: "Log the score, the permit number and the behind-the-wheel start date, then sign it.",
      why: "The permit log is the record the coordinator reads before scheduling behind-the-wheel training, and a score and a date written down today save a phone call next week chasing information that was only ever in your head.",
    },
  ],

  interrupts: [
    {
      id: "wp-pt-cheat-slip",
      kind: "A folded cheat sheet slides under the table",
      after: "practice-quiz", delay: 3, seconds: 12,
      alert: "Someone at the next table slides a folded cheat sheet under yours during the practice quiz, whispering that it has the answers.",
      cue: "Push it back and report it to the proctor's desk — do not open it.",
      target: "wp-pt-report-slip",
      why: "A cheat sheet used on a practice quiz teaches you nothing true about what you know, and used on the real test it is grounds for disqualification that follows a permit application for years — reporting it to the proctor protects your own score and stops it from being used on somebody else's test too.",
      missNote: "You left the folded sheet where it was, and in the version where you glanced at it, the practice score that followed measured a cheat sheet's honesty, not yours — which is exactly the number the coach then planned test day around.",
      wrongNote: "Not the quiz tablet. The proctor's desk is where this gets reported — push the sheet back and go there.",
    },
    {
      id: "wp-pt-system-reboot",
      kind: "Testing system reboot warning",
      after: "sit-test", delay: 3, seconds: 12,
      alert: "A warning flashes on the terminal screen: the testing system is about to reboot for maintenance, mid-test.",
      cue: "Do not keep clicking through questions. Press the proctor call button.",
      target: "wp-pt-proctor-call",
      why: "A reboot mid-test can lose answers the system has not yet saved, and a candidate who keeps racing to finish before it reboots is the one most likely to lose work that a proctor could have paused and protected instead — the call button exists exactly for this, and using it is what keeps a technical glitch from becoming a retest.",
      missNote: "You kept clicking through questions as the warning flashed, and in the version where the system rebooted mid-answer, the last several questions had to be retaken from a shaken, distracted start rather than a calm one.",
      wrongNote: "Not the terminal itself. The proctor call button is what gets a human to pause it properly — press that.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.2, PST_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#727c86", base2: "#69737c", seam: "rgba(0,0,0,0.14)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.05, rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.03, color: 0x9aa4ac });

    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xd6dbe0, { rough: 0.9 });
    box(g, 5.6, 0.1, 0.14, 0, 0.05, -2.28, 0x3a4048, { rough: 0.7 });
    decal(g, 2.2, 0.18, 0, 2.4, -2.29, signFace("PATHWAY EDITION — TESTING OFFICE", { bg: "#1f2a36", accent: PST_CSS, scale: 0.4 }), { px: 512 });

    // Sign-in desk.
    const desk0 = group(g, -1.4, 0, -1.1);
    slab(desk0, 1.0, 0.05, 0.5, 0, 0.72, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    decal(desk0, 0.5, 0.2, 0, 0.75, 0.05, paperFace("STUDY ROOM SIGN-IN", ["Name · slot", "1. ______"], { bg: "#f6f3ea", band: "#2f5f8a" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(desk0, "sign-in", 0, 0.94, 0.05, { css: PST_CSS, w: 0.24 });
    reg2(desk0, "wp-pt-signin-desk");

    // Study desk: manual, tablet, notes board, confidence dial.
    const desk = group(g, 0.3, 0, -1.5);
    slab(desk, 1.6, 0.05, 0.7, 0, 0.74, 0, 0x7a6048, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(desk, 0.06, 0.72, 0.5, sx * 0.75, 0.37, 0, 0x4a3a2a, { rough: 0.6 });
    const manual = decal(desk, 0.4, 0.5, -0.5, 0.775, 0.05, paperFace("STATE CDL HANDBOOK", ["Ch. 6 — Air Brakes"], { bg: "#f6f3ea", band: "#2f5f8a" }), { px: 256 });
    manual.rotation.x = -Math.PI / 2;
    reg2(manual, "wp-pt-manual");
    const tablet = group(desk, -0.1, 0.775, -0.05);
    box(tablet, 0.22, 0.014, 0.16, 0, 0, 0, 0x1c1f23, { rough: 0.3, metal: 0.3 });
    const tabletFace = decal(tablet, 0.19, 0.13, 0, 0.008, 0, signFace("PRACTICE QUIZ", { bg: "#0d1c24", accent: PST_CSS, fg: "#bfeaf7", scale: 0.4 }), { px: 192, glow: true, ei: 0.6 });
    holoTag(desk, "practice quiz", -0.1, 0.16, -0.05, { css: PST_CSS, w: 0.32 });
    reg2(tablet, "wp-pt-quiz-tablet");
    const hunchWarn = box(desk, 0.24, 0.02, 0.18, -0.1, 0.783, -0.05, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(desk, "raise the stand first?", -0.1, 0.86, -0.05, { css: "#f0645b", w: 0.32 });
    reg2(hunchWarn, "wp-pt-screen-hunch");
    const confidenceDial = instrument(desk, 0.6, 0.02, 0.1, { idle: "-/10", color: PST_ACCENT, ry: -0.2 });
    holoTag(confidenceDial, "confidence", 0, 0.18, 0, { css: PST_CSS, w: 0.26 });
    reg2(confidenceDial, "wp-pt-confidence-dial");
    const reportSlip = ownMaterial(box(desk, 0.08, 0.03, 0.06, 0.75, 0.775, -0.2, 0xf2c14b, { rough: 0.5, emissive: 0xf2c14b, ei: 0.3 }));
    holoTag(desk, "proctor's desk — report it", 0.75, 0.86, -0.2, { css: PST_CSS, w: 0.4 });
    reg2(reportSlip, "wp-pt-report-slip");
    const cheatSheet = box(desk, 0.16, 0.006, 0.1, 0.15, 0.78, -0.1, 0xffe9d8, { rough: 0.7 });
    cheatSheet.visible = false;

    // Study routine stand.
    const routine = group(g, -1.5, 0, -0.4);
    cyl(routine, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const ROUTINE = [["wp-pt-routine-read", "1 — read", 0.4], ["wp-pt-routine-quiz", "2 — quiz", 0.68], ["wp-pt-routine-review", "3 — review", 0.96]];
    for (const [id, label, y] of ROUTINE) {
      const bead = box(routine, 0.05, 0.05, 0.05, 0, y, 0, PST_ACCENT, { emissive: PST_ACCENT, ei: 1.2, rough: 0.4 });
      holoTag(routine, label, 0.2, y, 0, { css: PST_CSS, w: 0.3 });
      reg2(bead, id);
    }

    // Notes board with the three gap pages.
    const notes = group(g, -1.9, 1.5, -1.9, 0.5);
    slab(notes, 1.0, 0.9, 0.03, 0, -0.45, 0, 0x2a3036, { radius: 0.02, rough: 0.6 });
    const GAPS = [["wp-pt-gap-airbrake", -0.32, "AIR BRAKES — (blank)"], ["wp-pt-gap-hazmat", 0, "HAZMAT — (blank)"], ["wp-pt-gap-cargo", 0.32, "CARGO SECUREMENT — (blank)"]];
    for (const [id, y, label] of GAPS) {
      const p = decal(notes, 0.9, 0.22, 0, y, 0.02, paperFace(label, [""], { bg: "#f6f3ea", band: "#c0322b" }), { px: 256 });
      reg2(p, id);
    }
    holoTag(notes, "study notes", 0, 0.54, 0.02, { css: PST_CSS, w: 0.26 });

    // Document table.
    const docTable = group(g, -0.3, 0, 0.9);
    slab(docTable, 1.0, 0.05, 0.6, 0, 0.7, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    const DOCS = [["wp-pt-doc-id", -0.3, "PHOTO ID", "#2f5f8a"], ["wp-pt-doc-application", -0.05, "APPLICATION", "#3f7a45"], ["wp-pt-doc-fee", 0.2, "FEE RECEIPT", "#8a6a2a"]];
    for (const [id, x, label, band] of DOCS) {
      const c = group(docTable, x, 0.73, 0.05, (x + 0.3) * 0.4);
      slab(c, 0.16, 0.004, 0.1, 0, 0, 0, 0xf6f4ee, { radius: 0.006, rough: 0.6 });
      decal(c, 0.15, 0.09, 0, 0.004, 0, paperFace(label, ["copy"], { bg: "#f6f4ee", band }), { px: 128 }).rotation.x = -Math.PI / 2;
      reg2(c, id);
    }

    // The testing window, terminal, results and proctor call button.
    const testWindow = group(g, 1.8, 0, -1.8);
    box(testWindow, 0.1, 2.0, 1.6, 0, 1.0, 0, 0x8a7862, { rough: 0.7 });
    box(testWindow, 0.12, 1.0, 1.2, 0, 1.35, 0, 0x7f9aa8, { rough: 0.2, opacity: 0.55, transparent: true });
    decal(testWindow, 0.14, 0.16, 0, 2.1, 0, signFace("TESTING WINDOW", { bg: "#1f2a36", accent: PST_CSS, scale: 0.4 }), { px: 224 }).rotation.y = Math.PI / 2;
    const terminal = group(g, 1.4, 0, -1.5);
    box(terminal, 0.5, 0.7, 0.3, 0, 0.35, 0, 0x5a6a78, { rough: 0.6 });
    const termScreen = ownMaterial(box(terminal, 0.4, 0.3, 0.02, 0, 0.85, 0, 0x0d1c24, { rough: 0.3 }));
    termScreen.material.emissiveIntensity = 0;
    const termFace = decal(terminal, 0.36, 0.26, 0, 0.85, 0.011, signFace("KNOWLEDGE TEST", { bg: "#0d1c24", accent: PST_CSS, fg: "#bfeaf7", scale: 0.32 }), { px: 224, glow: true, ei: 0.6 });
    holoTag(terminal, "test terminal", 0, 1.05, 0, { css: PST_CSS, w: 0.34 });
    reg2(terminal, "wp-pt-test-terminal");
    const proctorCall = box(terminal, 0.06, 0.06, 0.04, 0.28, 0.4, 0.16, 0xd2312b, { rough: 0.5, emissive: 0xd2312b, ei: 0.2 });
    holoTag(terminal, "proctor call button", 0.28, 0.5, 0.16, { css: "#f0645b", w: 0.34 });
    reg2(proctorCall, "wp-pt-proctor-call");
    const resultsCard = decal(testWindow, 0.5, 0.3, 0, 1.35, 0.07, paperFace("RESULTS", ["Score: ____", "PASS"], { bg: "#f6f3ea", band: "#59c97b" }), { px: 224 });
    reg2(resultsCard, "wp-pt-results-window");

    // Calendar dial for behind-the-wheel booking.
    const calendar = group(g, 2.1, 0.9, -0.6, -0.5);
    slab(calendar, 0.6, 0.35, 0.03, 0, -0.18, 0, 0x1f2a36, { radius: 0.02, rough: 0.6 });
    const calFace = decal(calendar, 0.5, 0.2, 0, -0.02, 0.02, signFace("--/--", { bg: "#0d1c24", accent: PST_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 224, glow: true, ei: 0.6 });
    const calDial = group(calendar, 0, -0.3, 0.03);
    cyl(calDial, 0.05, 0.05, 0.03, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(calendar, "calendar dial", 0, -0.4, 0.03, { css: PST_CSS, w: 0.3 });
    reg2(calDial, "wp-pt-calendar-dial");

    // Permit card and license folder.
    const permitCard = group(g, 1.0, 0.75, 0.7, 0.2);
    slab(permitCard, 0.16, 0.006, 0.1, 0, 0, 0, 0xf2c14b, { radius: 0.006, rough: 0.5 });
    decal(permitCard, 0.14, 0.08, 0, 0.005, 0, signFace("PERMIT", { bg: "#f2c14b", accent: "#2a3036", fg: "#2a3036", scale: 0.5 }), { px: 128 }).rotation.x = -Math.PI / 2;
    reg2(permitCard, "wp-pt-permit-card");
    const folder = box(g, 0.3, 0.02, 0.4, 0.4, 0.76, 0.7, 0x3f6f7a, { rough: 0.6 });
    reg2(box(g, 0.3, 0.1, 0.4, 0.4, 0.8, 0.7, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-pt-license-folder");
    holoTag(g, "license folder", 0.4, 0.94, 0.7, { css: PST_CSS, w: 0.3 });
    void folder;

    // Log.
    const logBoard = decal(g, 0.4, 0.2, -0.6, 0.78, 0.9, paperFace("PERMIT LOG", ["Score: ____", "BTW date: ____"], { bg: "#f6f3ea", band: "#2f5f8a" }), { px: 224 });
    logBoard.rotation.x = -Math.PI / 2;
    holoTag(g, "permit log", -0.6, 0.92, 0.9, { css: PST_CSS, w: 0.26 });
    reg2(logBoard, "wp-pt-permit-log");

    // Stuffy vent, failed visitor at the window, panicking neighbor.
    const vent = box(g, 0.4, 0.25, 0.15, 0, 2.5, -2.25, 0xc9ced2, { rough: 0.6, metal: 0.3 });
    holoTag(g, "vent struggling — open the door?", 0, 2.75, -2.25, { css: "#f0645b", w: 0.4 });
    reg2(vent, "wp-pt-stuffy-room");
    const visitor = standingFigure(g, 2.3, -2.0, { ry: Math.PI, cloth: 0x7a3a3a, skin: 0x8a5a3a, atStation: true });
    holoTag(visitor, "banging on the window?", 0, 1.9, 0, { css: "#f0645b", w: 0.38 });
    reg2(box(visitor, 0.6, 1.4, 0.6, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-pt-failed-visitor");
    const panicker = seatedFigure(g, -1.9, 0.46, -0.4, { ry: 0.4, cloth: 0x5a6a3a });
    holoTag(panicker.torso, "panicking — get the proctor?", 0, 1.0, 0.12, { css: "#f0645b", w: 0.44 });
    reg2(box(g, 0.5, 1.1, 0.5, -1.9, 0.9, -0.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-pt-panic-neighbor");

    const coach = seatedFigure(g, 1.0, 0.46, 1.3, { ry: -0.6, cloth: 0x3f6b5a, skin: 0x6b4a33 });
    holoTag(coach.torso, "coach", 0, 1.3, 0.12, { css: PST_CSS, w: 0.2 });
    reg2(box(g, 0.5, 1.2, 0.5, 1.0, 1.0, 1.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-pt-coach");

    let rebootOn = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.3, -0.8),

      onStepComplete(step) {
        if (step.id === "find-gaps") for (const [id, , label] of GAPS) repaint(hits[id], paperFace(label.replace("(blank)", "noted"), [""], { bg: "#f6f3ea", band: "#59c97b" }));
        if (step.id === "book-roadtest") repaint(calFace, signFace("BOOKED", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "read-results") repaint(resultsCard, paperFace("RESULTS", ["Score: 92%", "PASS"], { bg: "#f6f3ea", band: "#59c97b" }));
        if (step.id === "file-permit") permitCard.position.set(0.4, 0.78, 0.7);
        if (step.id === "close-log") repaint(logBoard, paperFace("PERMIT LOG", ["Score: 92%", "BTW date: booked"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "wp-pt-cheat-slip") { cheatSheet.visible = true; reportSlip.material.emissiveIntensity = 1.4; }
        if (it.id === "wp-pt-system-reboot") { rebootOn = true; termScreen.material.emissiveIntensity = 1.4; repaint(termFace, signFace("REBOOT WARNING", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd9d9", scale: 0.3 })); }
      },
      onInterruptEnd(it) {
        if (it.id === "wp-pt-cheat-slip") { cheatSheet.visible = false; reportSlip.material.emissiveIntensity = 0.3; }
        if (it.id === "wp-pt-system-reboot") { rebootOn = false; termScreen.material.emissiveIntensity = 0; repaint(termFace, signFace("KNOWLEDGE TEST", { bg: "#0d1c24", accent: PST_CSS, fg: "#bfeaf7", scale: 0.32 })); }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (rebootOn) termScreen.material.emissiveIntensity = 0.6 + Math.sin(t * 10) * 0.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "confidence-gauge") {
          const ok = gg.t >= 0.4 && gg.t <= 0.7;
          repaint(confidenceDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)}/10`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "practice-quiz") {
          const ok = tr.v >= 0.36 && tr.v <= 0.66;
          repaint(tabletFace, signFace(ok ? "READING" : tr.v < 0.36 ? "GUESSING" : "MEMORISING", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.34 }));
        }
        void t; void dt;
      },
    };
  },
};
