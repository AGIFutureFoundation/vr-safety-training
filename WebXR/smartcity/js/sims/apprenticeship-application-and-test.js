import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Apprenticeship Application & Test VR — Job Readiness Edition,
// apprenticeship navigation block.
//
// The front office and testing room of a generic joint apprenticeship
// training centre: the recruitment notice read for what it actually asks,
// the documents gathered, the application read before it is signed and
// handed in before the deadline, an accommodation asked for in time, and then
// the aptitude test itself — what it covers, a tape measure read to the
// sixteenth, and a timed section held at a steady pace. Every programme sets
// its own minimum qualifications and test in its registered apprenticeship
// standard; the notice, the dates and the sections here are an example, and
// the station says so on every sheet. No real programme, trade test or
// training centre is depicted.

const AAT_ACCENT = 0xf0c05a;
const AAT_CSS = "#f0c05a";

export const SIM_APPRENTICESHIP_APPLICATION_AND_TEST = {
  id: "apprenticeship-application-and-test",
  index: "257",
  domain: "Apprenticeship navigation",
  trade: "Apprenticeship applicant — the application and the aptitude test",
  category: "Community Environmental Justice",
  indoor: "clinic",
  weather: "clear",
  certification: "The selection procedure in the programme's registered apprenticeship standard — the recruitment window, the minimum qualifications, the aptitude test and the ranking — registered with the U.S. Department of Labor or a State Apprenticeship Agency, and the equal-opportunity pledge every registered programme carries; the Americans with Disabilities Act, under which an applicant with a disability may ask for a reasonable accommodation on the test; OSHA 10 through the OSHA Outreach Training Program, which some programmes ask for and many pre-apprenticeship courses give; the training funds of the building-trades unions that sponsor such programmes, LIUNA and IUOE among them; SAMHSA's National Helpline for anyone for whom a pre-indenture drug screen is a worry",
  name: "Apprenticeship Application & Test",
  title: simTitle("Apprenticeship Application & Test"),
  tagline: "Read the recruitment notice, gather the documents, read the application before signing it, hand it in on time, ask for an accommodation early, and sit the aptitude test at a steady pace — past a caller after your Social Security number",
  accent: AAT_ACCENT,
  accentCss: AAT_CSS,
  parSeconds: 290,
  footprint: 2.2,
  supportLine: "the programme's training coordinator for anything about the process, 988 if the waiting has turned into a crisis, or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if drinking or using is part of what worries you about the screen",
  badge: { id: "application-in-on-time", name: "In On Time", note: "The application read, signed and handed in before the window closed, and the test sat without a shortcut" },

  game: system({
    name: "Applicant File",
    currency: "RANK",
    ranks: ["Interested", "Applicant", "Tested", "Ranked", "Application Certified"],
    badges: [
      { id: "read-the-notice", name: "Read The Notice", note: "The minimum qualifications and the test sections both found clean", test: AWARD.all(AWARD.stepClean("minimum-quals"), AWARD.stepClean("test-sections")) },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the application", test: AWARD.safe },
      { id: "to-the-sixteenth", name: "To The Sixteenth", note: "The tape read near the middle of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-application", name: "Clean Application", note: "No corrections anywhere", test: AWARD.clean },
      { id: "steady-pace", name: "Steady Pace", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "early-bird", name: "Early Bird", note: "Finish inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "aat-blank-signature": "Someone offered to 'fill in the rest' if you sign the application now. The application ends with a statement that everything on it is true, and a false or incomplete answer can disqualify an applicant from the whole cycle. A signature on a form somebody else will finish is your name on answers you have never seen — the application is read, filled in by you, and only then signed.",
    "aat-pay-for-spot": "That flyer sells a 'guaranteed apprenticeship spot' for a fee. A registered programme selects apprentices by the procedure written in its apprenticeship standard — minimum qualifications, test, interview, ranking — and nobody outside it can sell a place on that list. Paying buys nothing except the lesson.",
    "aat-ssn-text": "That text says to reply with your Social Security number to 'hold your test seat'. Programmes contact applicants the way their recruitment notice says they will, and nobody holds a seat by text. A Social Security number sent to an unknown number is the start of identity theft, and the application you just filed is exactly the kind of news a scammer watches for.",
    "aat-phone-on-desk": "You reached for your phone on the test desk. Programmes treat a phone out during the aptitude test as grounds to end the test, and an applicant who is removed usually waits for the next recruitment window — often a year. The phone goes in the locker before the test starts, whatever it buzzes about.",
  },

  lateNotes: {
    "aat-application-packet": "Not yet. The packet goes in once the application has been read, filled in and signed — a packet handed in unsigned is a packet that does not count.",
    "aat-closing-log": "The log is written at the end, with the real dates — handed in, test date, next step — not the ones you hope for.",
  },

  steps: [
    {
      id: "read-notice", kind: "select", target: "aat-recruit-notice",
      title: "Read the programme's recruitment notice",
      cue: "Read the posted notice: when the window opens and closes, what the programme asks for, and how it will contact you.",
      why: "A registered programme recruits on the schedule and by the procedure its apprenticeship standard sets, and the recruitment notice is where that is published: the window, the minimum qualifications, the test and how applicants will be contacted. Everything that follows is checked against it. Missing a window usually means waiting for the next one, which can be a year away, so the dates on the notice are the first thing that matters.",
    },
    {
      id: "minimum-quals", kind: "find", noHint: true,
      targets: ["aat-q-age", "aat-q-diploma", "aat-q-license"],
      itemNames: { "aat-q-age": "the minimum age", "aat-q-diploma": "a diploma or equivalency", "aat-q-license": "a driver's licence" },
      itemNotes: {
        "aat-q-age": "The minimum age — commonly eighteen by the time of indenture. Check the notice; it is the programme's own figure that counts.",
        "aat-q-diploma": "A high-school diploma or an equivalency certificate is a common requirement. If yours is missing, the adult school or the pre-apprenticeship programme is the next step, not a reason to give up.",
        "aat-q-license": "Many construction programmes ask for a driver's licence because jobsites move. If yours is suspended, say so and ask what the programme accepts — that is fixable, and lying about it is not.",
      },
      title: "Find the minimum qualifications on the example notice",
      cue: "Find the three minimum qualifications the example notice lists.",
      why: "The minimum qualifications are the part of the selection procedure an applicant can check before spending anything: age, education and sometimes a driver's licence or physical requirements, as the programme's own standard sets them. They differ between programmes and trades, which is why the notice — not a friend's memory of a different programme — is where you read them.",
    },
    {
      id: "gather-documents", kind: "sequence", anyOrder: true,
      targets: ["aat-doc-id", "aat-doc-diploma", "aat-doc-dmv"],
      itemNames: { "aat-doc-id": "photo identification", "aat-doc-diploma": "the diploma or equivalency certificate", "aat-doc-dmv": "the driving record" },
      itemNotes: {
        "aat-doc-id": "Photo identification, current. Check the expiry date now rather than at the counter.",
        "aat-doc-diploma": "The diploma, equivalency certificate or transcript the notice asks for. Official copies can take weeks to request, so they are the thing to start first.",
        "aat-doc-dmv": "Where a licence is required, some programmes ask for a copy of the driving record itself. It comes from the state's motor vehicles office.",
      },
      title: "Gather the documents the notice asks for",
      cue: "Collect the photo ID, the diploma or equivalency certificate and the driving record — order does not matter.",
      why: "Applications fail on paperwork far more often than on ability. The documents the notice asks for — identification, proof of education, sometimes a driving record — often have to be requested from somebody else and take time to arrive. Gathering them before the window opens is what turns 'I meant to apply' into an application that is in on the first day.",
    },
    {
      id: "read-and-sign", kind: "hold", target: "aat-application-form", seconds: 6,
      title: "Read the application through before you sign it",
      cue: "Hold the application open and read every question and the statement above the signature line before signing.",
      why: "The application ends with a statement that everything on it is true and complete, and programmes can disqualify an applicant for a false or missing answer. Reading every question before signing — and answering the hard ones honestly, like a conviction or a suspended licence — is what keeps the application standing, because most of those answers are not automatic disqualifications, while a hidden one often is.",
      holdBreakNote: "You put the application down before the statement above the signature line. That is the part you are signing — read it to the end.",
    },
    {
      id: "hand-in", kind: "drag", target: "aat-application-packet",
      title: "Hand the packet in before the window closes",
      cue: "Carry the signed application and documents to the received tray at the counter and wait for the dated receipt.",
      why: "An application counts from the moment the programme receives it inside the window, and the dated receipt is your proof that it did. Handing it in at the counter, early in the window, leaves time to fix anything the office flags. Posting it on the last day, or leaving it with someone to drop off, is how good applicants miss a year.",
      drag: { to: "aat-received-tray", radius: 0.4, missNote: "Not in the received tray. An application sitting on the counter has not been received — put it where the office logs it and take the receipt." },
    },
    {
      id: "accommodation", kind: "select", target: "aat-accommodation-form",
      title: "Ask for a test accommodation now, not on test day",
      cue: "If you have a documented disability that affects testing, fill in the accommodation request with the application.",
      why: "Under the Americans with Disabilities Act, an applicant with a disability can ask for a reasonable accommodation on an employment test — extra time, a reader, a separate room — and the programme needs the request and the documentation before the test to arrange it. Asked for on test day, it usually cannot be provided; asked for now, it is simply part of the process.",
    },
    {
      id: "test-date", kind: "turn", target: "aat-test-date-dial",
      title: "Put the test date on the calendar",
      cue: "Turn the calendar dial to the test date on your receipt, with the reporting time and what to bring.",
      turn: { turns: 1.0, axis: "y", label: "TEST DATE" },
      why: "The test date, the reporting time and what to bring are on the receipt, and they are not flexible: an applicant who arrives late or without identification is usually not tested. Setting the date now, with the time and the list, is what makes the morning of the test about the test rather than about finding the room.",
    },
    {
      id: "test-sections", kind: "find", noHint: true,
      targets: ["aat-sec-math", "aat-sec-reading", "aat-sec-mechanical"],
      itemNames: { "aat-sec-math": "arithmetic and measurement", "aat-sec-reading": "reading comprehension", "aat-sec-mechanical": "mechanical reasoning" },
      itemNotes: {
        "aat-sec-math": "Arithmetic, fractions, decimals and measurement are the most common section, because they are used every day on a jobsite.",
        "aat-sec-reading": "Reading comprehension checks that you can follow written instructions, specifications and safety material.",
        "aat-sec-mechanical": "Mechanical reasoning — gears, levers, pulleys — appears on some trades' tests and not others. The notice says which.",
      },
      title: "Find the sections the example test covers",
      cue: "On the example test outline, find the three sections the programme lists.",
      why: "Aptitude tests differ by trade and programme, but most cover arithmetic and measurement, reading comprehension and, for some trades, mechanical reasoning. The programme's notice or outline says which, and knowing the sections is what makes preparation specific — practising fractions and a tape measure rather than worrying in general about 'the test'.",
    },
    {
      id: "tape-read", kind: "gauge", target: "aat-tape-gauge",
      title: "Read the tape measure to the sixteenth",
      cue: "Commit the reading when the marker sits on the example mark — fractions of an inch, to the sixteenth.",
      gauge: {
        label: "TAPE READING (EXAMPLE)", speed: 0.55, green: [0.44, 0.56],
        readout: (t) => `${(12 + t * 2).toFixed(3)} in — example`,
        missNote: "That is not the mark. Count the sixteenths from the last whole inch — the long lines are halves and quarters, the shortest are sixteenths.",
      },
      why: "Reading a tape measure to the sixteenth of an inch is the measurement skill construction math is built on, and it is the kind of question that turns up on the arithmetic section. It is also learnable in an afternoon: the long lines are halves and quarters, the shortest are sixteenths, and fractions reduce. Practising it before the test is time better spent than any 'test secrets' course.",
    },
    {
      id: "timed-section", kind: "track", target: "aat-test-clock", seconds: 7,
      title: "Hold a steady pace through the timed section",
      cue: "Work the practice section and keep your pace inside the band until the proctor calls time.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "PACE",
        readout: (v) => (v < 0.4 ? "falling behind the clock" : v > 0.62 ? "rushing — guessing" : "steady"),
      },
      holdBreakNote: "Your pace broke. Skip the question you are stuck on and come back to it — a steady pace through the whole section beats a perfect first page.",
      why: "A timed section rewards pace as much as knowledge: rushing turns into guessing, and stalling on one hard question leaves easy ones unanswered at the end. Holding a steady pace — skipping and coming back — is a skill, and it is practised on timed practice sections before test day. The practice section here is an example; the real one is whatever the programme's outline describes.",
    },
    {
      id: "coordinator-checkin", kind: "select", target: "aat-coordinator",
      title: "Check in with the training coordinator",
      cue: "Ask the coordinator what happens next — interview, ranking list, how long the list lasts — and say how you are holding up.",
      why: "After the test most programmes interview, rank applicants and keep a list for a set time, and the coordinator is the person who can say how long that is and what an applicant can do while waiting — including pre-apprenticeship training or OSHA 10, which some programmes value. Waiting is hard; saying so to the person running the process is part of staying in it.",
    },
    {
      id: "closing-log", kind: "select", target: "aat-closing-log",
      title: "Close out your application log",
      cue: "Log the date handed in, the receipt number, the test date and result, the interview, and how long the ranking list lasts.",
      why: "An application is a months-long process, and the log keeps it straight: the receipt number, the test date, the interview, the ranking and how long the list stays open. It is also what you bring when applying to a second programme, because many applicants apply to more than one trade — and the log shows which windows are still open.",
    },
  ],

  interrupts: [
    {
      id: "aat-seat-caller",
      kind: "Caller claiming to be the programme",
      after: "read-and-sign", delay: 3, seconds: 12,
      alert: "Your phone rings: a caller says she is from the apprenticeship office, that your test seat will be given away unless you confirm your Social Security number and pay a 'processing fee' by card right now.",
      cue: "Do not confirm or pay anything. Check how the programme says it contacts applicants.",
      target: "aat-contact-card",
      why: "The recruitment notice says how the programme contacts applicants and what, if anything, it charges. A call demanding your Social Security number and a card payment to 'hold a seat' matches neither, and the contact card on the counter gives the office's own number to call back. Checking it takes a minute; a scam that gets your number takes years to untangle.",
      missNote: "The call ran on while you read, and in the version where you went along with it a stranger has your Social Security number and a card payment for a seat that was never at risk. The programme never called.",
      wrongNote: "Not that. The answer is the programme's own contact card — call the office back on its published number, and confirm nothing to a caller.",
    },
    {
      id: "aat-neighbour-asks",
      kind: "Asked for answers mid-test",
      after: "timed-section", delay: 3, seconds: 12,
      alert: "The applicant at the next desk leans over and whispers for the answer to question twelve, and slides a note toward your desk.",
      cue: "Do not answer and do not take the note. Raise it with the proctor.",
      target: "aat-proctor-bell",
      why: "Anything passed between desks during a test can end the test for both applicants, whoever started it. Raising your hand for the proctor, without taking the note, is what protects your result — the proctor deals with it, and your test goes on. Ignoring it and hoping is the option that leaves your name next to a note on your desk.",
      missNote: "The note sat on the edge of your desk while you kept working, and in the version where the proctor found it first, both tests were stopped. A year of waiting for the next window started over a note you never asked for.",
      wrongNote: "Not that. The answer is the proctor — hand up, note untouched — not answering, and not trying to handle it yourself.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, AAT_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#8a8c82", base2: "#818379", seam: "rgba(0,0,0,0.14)",
    }), { repeat: 6, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.06, rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.02, color: 0xa2a498 });

    // --------------------------------------------------------- the back wall
    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xe2e0d6, { rough: 0.9 });
    box(g, 5.6, 0.1, 0.14, 0, 0.05, -2.28, 0x4a4c44, { rough: 0.7 });
    decal(g, 2.2, 0.16, 0, 2.35, -2.29, signFace("JOINT APPRENTICESHIP TRAINING CENTRE — APPLICATIONS", { bg: "#2a2c24", accent: AAT_CSS, scale: 0.5 }), { px: 512 });

    // The recruitment notice, with its minimum-qualification lines.
    const notice = group(g, -1.3, 1.5, -2.27);
    slab(notice, 1.1, 1.2, 0.03, 0, -0.6, 0, 0x7a6448, { radius: 0.02, rough: 0.85 });
    const noticePaper = group(notice, 0, 0, 0.02);
    decal(noticePaper, 1.0, 1.1, 0, 0, 0, paperFace("RECRUITMENT NOTICE — EXAMPLE", [
      "Window: opens 1st, closes 30th",
      "Minimum age: 18 by indenture",
      "Diploma or equivalency",
      "Valid driver's licence",
      "Aptitude test + interview",
      "We contact you by mail/email",
      "Equal opportunity programme",
    ], { bg: "#fbf8ee", band: "#8a6a2a" }), { px: 448 });
    holoTag(notice, "recruitment notice", 0, 0.66, 0.02, { css: AAT_CSS, w: 0.4 });
    reg(hits, notice, "aat-recruit-notice");
    const nrow = (i) => 0.55 - (0.26 + 0.1 * i) * 1.1;
    reg(hits, box(noticePaper, 0.9, 0.09, 0.03, 0, nrow(1), 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "aat-q-age");
    reg(hits, box(noticePaper, 0.9, 0.09, 0.03, 0, nrow(2), 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "aat-q-diploma");
    reg(hits, box(noticePaper, 0.9, 0.09, 0.03, 0, nrow(3), 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "aat-q-license");
    const qTicks = [];
    for (const i of [1, 2, 3]) {
      const tk = box(noticePaper, 0.04, 0.04, 0.01, 0.46, nrow(i), 0.015, CITY.good, { emissive: CITY.good, ei: 1.0, cast: false });
      tk.visible = false;
      qTicks.push(tk);
    }

    // The bulletin board with the pay-for-a-spot flyer (hazard).
    const board = group(g, 0.1, 1.55, -2.27);
    slab(board, 0.8, 0.8, 0.03, 0, -0.4, 0, 0x8a6f4d, { radius: 0.02, rough: 0.9 });
    decal(board, 0.32, 0.3, -0.18, 0.18, 0.02, paperFace("PRE-APPRENTICESHIP", ["Free classes", "Ask the office"], { bg: "#eaf4ea", band: "#3f7a45" }), { px: 192 });
    const spot = group(board, 0.18, -0.12, 0.02);
    slab(spot, 0.34, 0.42, 0.01, 0, -0.21, 0, 0xffe9d8, { radius: 0.01, rough: 0.7 });
    decal(spot, 0.3, 0.38, 0, 0, 0.008, paperFace("GUARANTEED SPOT!", ["Skip the list", "$300 today", "Call now"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 224 });
    holoTag(spot, "buy a spot?", 0, 0.27, 0.01, { css: "#f0645b", w: 0.26 });
    reg(hits, spot, "aat-pay-for-spot");

    // The test outline, with the three sections as lines.
    const outline = holoPanel(g, 0.72, 0.56, 1.35, 1.55, -2.2, (cx, w, h) => {
      cx.fillStyle = "rgba(24,20,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = AAT_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbecc8"; cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("APTITUDE TEST OUTLINE — EXAMPLE", w * 0.05, h * 0.12);
      cx.fillStyle = "#fff8e6"; cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ["1. Arithmetic + measurement", "2. Reading comprehension", "3. Mechanical reasoning"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.22)));
    }, { accent: AAT_ACCENT });
    for (const [id, y] of [["aat-sec-math", 0.08], ["aat-sec-reading", -0.04], ["aat-sec-mechanical", -0.16]]) {
      reg(hits, box(outline, 0.64, 0.09, 0.02, 0, y, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), id);
    }

    // The test-date calendar with its dial.
    const cal = group(g, 2.35, 1.5, -1.2, -Math.PI / 2);
    slab(cal, 0.58, 0.68, 0.03, 0, -0.34, 0, 0xf2eee4, { radius: 0.02, rough: 0.8 });
    const calFace = decal(cal, 0.52, 0.24, 0, 0.17, 0.02, paperFace("TEST DAY", ["Date: ____", "Report: ____", "Bring: photo ID"], { bg: "#fbf8f0", band: "#8a6a2a" }), { px: 224 });
    const calDial = group(cal, 0, -0.14, 0.04);
    cyl(calDial, 0.11, 0.11, 0.03, 0, 0, 0, 0x3a4048, { rough: 0.4, metal: 0.5, seg: 20 }).rotation.x = Math.PI / 2;
    box(calDial, 0.02, 0.09, 0.02, 0, 0.05, 0.02, AAT_ACCENT, { emissive: AAT_ACCENT, ei: 0.6, rough: 0.4 });
    holoTag(cal, "test-date dial", 0, 0.42, 0.02, { css: AAT_CSS, w: 0.3 });
    reg(hits, calDial, "aat-test-date-dial");

    // ------------------------------------------------------- the front counter
    const counterG = group(g, -1.15, 0, -0.85, 0.35);
    box(counterG, 1.5, 0.95, 0.5, 0, 0.475, 0, 0x5a5c50, { rough: 0.6, finish: "painted", tile: 2 });
    slab(counterG, 1.6, 0.05, 0.62, 0, 0.98, 0.04, 0xe8e4d8, { radius: 0.015, rough: 0.4 });

    // The received tray (drag socket), with its receipt stamp.
    const tray = group(counterG, -0.5, 1.01, 0.05);
    box(tray, 0.36, 0.05, 0.28, 0, 0.025, 0, 0x2a3036, { rough: 0.5, metal: 0.3 });
    decal(tray, 0.3, 0.05, 0, 0.03, 0.141, signFace("RECEIVED", { bg: "#1b2224", accent: AAT_CSS, scale: 0.6 }), { px: 160 });
    holoTag(tray, "received tray", 0, 0.14, 0, { css: AAT_CSS, w: 0.3 });
    reg(hits, tray, "aat-received-tray");

    // The contact card (first interruption's answer).
    const contact = group(counterG, 0.0, 1.01, 0.15, -0.1);
    slab(contact, 0.2, 0.006, 0.12, 0, 0, 0, 0xfbf8ee, { radius: 0.006, rough: 0.7 });
    const cFace = decal(contact, 0.18, 0.1, 0, 0.005, 0, paperFace("OFFICE CONTACT", ["Call back on this", "number only"], { bg: "#fbf8ee", band: "#8a6a2a" }), { px: 160 });
    cFace.rotation.x = -Math.PI / 2;
    holoTag(contact, "programme contact card", 0, 0.1, 0, { css: AAT_CSS, w: 0.44 });
    reg(hits, contact, "aat-contact-card");
    const contactGlow = box(contact, 0.22, 0.004, 0.14, 0, -0.003, 0, AAT_ACCENT, { emissive: AAT_ACCENT, ei: 0.0, rough: 0.5, cast: false });
    ownMaterial(contactGlow);

    // The accommodation request form.
    const accom = group(counterG, 0.45, 1.01, 0.1, 0.1);
    slab(accom, 0.22, 0.006, 0.28, 0, 0, 0, 0xf2f6fa, { radius: 0.004, rough: 0.85 });
    const aFace = decal(accom, 0.2, 0.26, 0, 0.005, 0, paperFace("ACCOMMODATION", ["Request before", "the test date", "Attach documentation"], { bg: "#f2f6fa", band: "#2f5f8a" }), { px: 192 });
    aFace.rotation.x = -Math.PI / 2;
    holoTag(accom, "accommodation request", 0, 0.1, 0, { css: AAT_CSS, w: 0.42 });
    reg(hits, accom, "aat-accommodation-form");

    // ------------------------------------------------ the application table
    const table = group(g, 0.1, 0, -0.5);
    slab(table, 1.2, 0.05, 0.7, 0, 0.74, 0, 0xc9bfa8, { radius: 0.03, rough: 0.55 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(table, 0.03, 0.03, 0.72, sx * 0.52, 0.36, sz * 0.28, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });

    // The application form on a clipboard (hold target).
    const app = group(table, -0.25, 0.77, 0.05, 0.1);
    box(app, 0.26, 0.012, 0.34, 0, 0.006, 0, 0x7a5a3a, { rough: 0.6 });
    const appFace = decal(app, 0.23, 0.3, 0, 0.014, 0.01, paperFace("APPLICATION", ["Contact details", "Education", "Licence status", "All answers true: ___"], { bg: "#fbfbf6", band: "#8a6a2a" }), { px: 224 });
    appFace.rotation.x = -Math.PI / 2;
    box(app, 0.1, 0.02, 0.03, 0, 0.014, -0.16, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    holoTag(app, "application", 0, 0.12, 0, { css: AAT_CSS, w: 0.26 });
    reg(hits, app, "aat-application-form");

    // The packet (drag), the three documents (sequence).
    const packet = group(table, 0.25, 0.77, 0.15, -0.1);
    slab(packet, 0.24, 0.02, 0.32, 0, 0, 0, 0xd8b878, { radius: 0.006, rough: 0.7 });
    holoTag(packet, "application packet", 0, 0.1, 0, { css: AAT_CSS, w: 0.38 });
    reg(hits, packet, "aat-application-packet");
    const DOCS = [["aat-doc-id", 0.35, -0.2, "PHOTO ID", 0x5a8ab8], ["aat-doc-diploma", 0.05, -0.22, "DIPLOMA / GED", 0x8a6a2a], ["aat-doc-dmv", -0.4, -0.2, "DRIVING RECORD", 0x3f7a45]];
    for (const [id, x, z, label, col] of DOCS) {
      const d = group(table, x, 0.77, z, (x > 0 ? -0.1 : 0.1));
      slab(d, 0.2, 0.006, 0.14, 0, 0, 0, 0xfdfbf4, { radius: 0.004, rough: 0.8 });
      const f = decal(d, 0.18, 0.12, 0, 0.005, 0, paperFace(label, ["copy"], { bg: "#fdfbf4", band: `#${col.toString(16).padStart(6, "0")}` }), { px: 160 });
      f.rotation.x = -Math.PI / 2;
      reg(hits, d, id);
    }

    // The blank-signature offer (hazard): a pen held out on a blank form.
    const blank = group(table, -0.48, 0.77, 0.22, 0.3);
    slab(blank, 0.18, 0.004, 0.24, 0, 0, 0, 0xffe9d8, { radius: 0.004, rough: 0.8 });
    const bFace = decal(blank, 0.16, 0.22, 0, 0.004, 0, paperFace("SIGN HERE", ["'I'll fill in", "the rest'"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 160 });
    bFace.rotation.x = -Math.PI / 2;
    holoTag(blank, "sign it blank?", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, blank, "aat-blank-signature");

    // The phone with the seat-hold text (hazard).
    const mobile = group(table, 0.5, 0.77, -0.05, 0.3);
    slab(mobile, 0.08, 0.01, 0.15, 0, 0, 0, 0x1b1f24, { radius: 0.01, rough: 0.3, metal: 0.4 });
    const mobileFace = decal(mobile, 0.07, 0.13, 0, 0.007, 0, signFace("reply w/\nSSN to hold\nyour seat", { bg: "#2a0f12", accent: "#f0645b", scale: 0.17 }), { px: 128, glow: true, ei: 0.8 });
    mobileFace.rotation.x = -Math.PI / 2;
    holoTag(mobile, "seat-hold text", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, mobile, "aat-ssn-text");

    // ----------------------------------------------------- the testing desks
    const desks = [];
    for (const [dx, dz] of [[1.35, -0.4], [1.35, 0.6]]) {
      const d = group(g, dx, 0, dz, -Math.PI / 2);
      slab(d, 0.9, 0.04, 0.55, 0, 0.74, 0, 0xd8d2c0, { radius: 0.02, rough: 0.55 });
      for (const sx of [-1, 1]) box(d, 0.04, 0.72, 0.5, sx * 0.42, 0.36, 0, 0x5a5c50, { rough: 0.6 });
      desks.push(d);
    }
    // Your desk (the first): the tape, the test clock, the phone left out.
    const myDesk = desks[0];
    const tape = instrument(myDesk, -0.15, 0.78, 0.05, { idle: "--.---", color: AAT_ACCENT, ry: 0 });
    holoTag(tape, "tape reading", 0, 0.14, 0, { css: AAT_CSS, w: 0.28 });
    reg(hits, tape, "aat-tape-gauge");
    const tapeBody = group(myDesk, 0.15, 0.8, 0.12);
    box(tapeBody, 0.08, 0.08, 0.04, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    box(tapeBody, 0.25, 0.005, 0.025, -0.16, -0.035, 0, 0xe8d88a, { rough: 0.5 });
    const clock = group(myDesk, 0.2, 0.77, -0.15);
    box(clock, 0.18, 0.1, 0.06, 0, 0.05, 0, 0x2a3036, { rough: 0.5 });
    const clockFace = decal(clock, 0.16, 0.07, 0, 0.05, 0.031, signFace("PACE", { bg: "#0d1c24", accent: AAT_CSS, fg: "#fbecc8", scale: 0.5 }), { px: 160, glow: true, ei: 0.6 });
    holoTag(clock, "timed section", 0, 0.16, 0, { css: AAT_CSS, w: 0.28 });
    reg(hits, clock, "aat-test-clock");
    const phoneOut = group(myDesk, -0.3, 0.77, -0.15, 0.4);
    slab(phoneOut, 0.08, 0.01, 0.15, 0, 0, 0, 0x1b1f24, { radius: 0.01, rough: 0.3, metal: 0.4 });
    holoTag(phoneOut, "phone out?", 0, 0.08, 0, { css: "#f0645b", w: 0.22 });
    reg(hits, phoneOut, "aat-phone-on-desk");
    // The note the neighbour slides over (shown during the interruption).
    const note = box(myDesk, 0.08, 0.004, 0.06, 0.38, 0.765, 0.2, 0xf7e36b, { rough: 0.8 });
    note.visible = false;

    // The proctor's desk and bell.
    const proctorDesk = group(g, 2.0, 0, -1.6, -0.8);
    slab(proctorDesk, 0.7, 0.04, 0.45, 0, 0.74, 0, 0x6a5a48, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(proctorDesk, 0.04, 0.72, 0.4, sx * 0.32, 0.36, 0, 0x4a3c30, { rough: 0.6 });
    const bell = group(proctorDesk, 0.1, 0.77, 0.05);
    cyl(bell, 0.05, 0.06, 0.04, 0, 0.02, 0, 0xdfae4a, { rough: 0.3, metal: 0.85, seg: 16 });
    cyl(bell, 0.01, 0.01, 0.03, 0, 0.055, 0, 0xdfe4e8, { rough: 0.3, metal: 0.9, seg: 8 });
    holoTag(bell, "hand up — proctor", 0, 0.14, 0, { css: AAT_CSS, w: 0.34 });
    reg(hits, bell, "aat-proctor-bell");
    const proctorLamp = box(proctorDesk, 0.05, 0.05, 0.05, -0.2, 0.8, 0.1, 0x4a4c44, { rough: 0.4 });
    ownMaterial(proctorLamp);

    // The closing log on the proctor's desk... no — on the counter's end.
    const logBook = group(counterG, 0.1, 1.01, -0.15, 0.05);
    box(logBook, 0.22, 0.02, 0.16, 0, 0.01, 0, 0x8a6a2a, { rough: 0.6 });
    const logFace = decal(logBook, 0.19, 0.13, 0, 0.021, 0, paperFace("APPLICATION LOG", ["In: ____", "Test: ____", "List: ____"], { bg: "#f6f3ea", band: "#8a6a2a" }), { px: 192 });
    logFace.rotation.x = -Math.PI / 2;
    holoTag(logBook, "application log", 0, 0.12, 0, { css: AAT_CSS, w: 0.32 });
    reg(hits, logBook, "aat-closing-log");

    // Chairs for the desks and the table.
    for (const [cx, cz, ry] of [[0.85, -0.4, Math.PI / 2], [0.85, 0.6, Math.PI / 2], [0.1, 0.15, Math.PI]]) {
      const chair = group(g, cx, 0, cz, ry);
      slab(chair, 0.4, 0.05, 0.38, 0, 0.45, 0, 0x3a4a5a, { radius: 0.03, rough: 0.6 });
      slab(chair, 0.38, 0.2, 0.05, 0, 0.6, -0.17, 0x3a4a5a, { radius: 0.03, rough: 0.6 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(chair, 0.015, 0.015, 0.44, sx * 0.16, 0.22, sz * 0.15, CITY.darkSteel, { rough: 0.4, metal: 0.65, seg: 8 });
    }
    // Lockers for phones by the door.
    const lockers = group(g, -2.35, 0, 0.8, Math.PI / 2);
    for (let i = 0; i < 3; i++) {
      box(lockers, 0.36, 1.2, 0.36, -0.38 + i * 0.38, 0.6, 0, [0x6a7a5a, 0x62724f, 0x6a7a5a][i], { rough: 0.55, metal: 0.35 });
      box(lockers, 0.12, 0.02, 0.01, -0.38 + i * 0.38, 0.9, 0.19, 0x2a3036, { rough: 0.6 });
    }
    decal(lockers, 0.8, 0.12, 0, 1.3, 0.19, signFace("PHONES IN LOCKERS BEFORE THE TEST", { bg: "#2a2c24", accent: AAT_CSS, scale: 0.45 }), { px: 384 });

    for (const sx of [-1, 1]) {
      box(g, 1.1, 0.05, 0.34, sx * 1.1, 2.62, -0.4, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.0, 0.02, 0.26, sx * 1.1, 2.59, -0.4, 0xfffaf0, { emissive: 0xfffaf0, ei: 0.5, rough: 0.4, cast: false });
    }

    // ------------------------------------------------------------- the people
    const coordinator = standingFigure(g, -1.85, 0.05, { ry: 1.0, cloth: 0x8a6a2a, skin: 0x7a4a30 });
    holoTag(coordinator, "training coordinator", 0, 1.84, 0, { css: AAT_CSS, w: 0.42 });
    reg(hits, box(coordinator, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "aat-coordinator");
    const neighbour = standingFigure(g, 2.0, 1.4, { ry: -2.4, cloth: 0x4a5a6a, skin: 0xd8a880 });
    holoTag(neighbour, "applicant — next desk", 0, 1.8, 0, { css: "#c8d0d8", w: 0.42 });
    const proctor = standingFigure(g, 1.95, -0.85, { ry: -1.2, cloth: 0x3a3a4a, skin: 0xa87050 });
    holoTag(proctor, "proctor", 0, 1.82, 0, { css: AAT_CSS, w: 0.2 });

    let calling = false, whisper = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "minimum-quals") for (const tk of qTicks) tk.visible = true;
        if (step.id === "hand-in") packet.position.set(-0.5, 1.07, -0.9);
        if (step.id === "accommodation") accom.position.set(-0.5, 0.06, 0.05);
        if (step.id === "test-date") repaint(calFace, paperFace("TEST DAY", ["Date: on receipt", "Report: 30 min early", "Bring: photo ID"], { bg: "#fbf8f0", band: "#59c97b" }));
        if (step.id === "tape-read") repaint(tape.userData.screen, signFace("12 1/16", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "timed-section") repaint(clockFace, signFace("TIME", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "coordinator-checkin") coordinator.rotation.y = 1.6;
        if (step.id === "closing-log") repaint(logFace, paperFace("APPLICATION LOG", ["In: receipt kept", "Test: sat", "List: ask in 2 wks"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "aat-seat-caller") {
          calling = true;
          repaint(mobileFace, signFace("\"THE OFFICE\"\ncalling", { bg: "#3a0c10", accent: "#f0645b", scale: 0.2 }));
          mobile.position.y = 0.86;
          contactGlow.material.emissiveIntensity = 0.7;
        }
        if (it.id === "aat-neighbour-asks") {
          whisper = true;
          note.visible = true;
          neighbour.rotation.y = -1.6;
          neighbour.position.x = 1.8;
          proctorLamp.material.emissive.set(AAT_ACCENT);
          proctorLamp.material.emissiveIntensity = 0.8;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "aat-seat-caller") {
          calling = false;
          repaint(mobileFace, signFace("reply w/\nSSN to hold\nyour seat", { bg: "#2a0f12", accent: "#f0645b", scale: 0.17 }));
          mobile.position.y = 0.77;
          contactGlow.material = it.resolved === "answered"
            ? mat(CITY.good, { emissive: CITY.good, ei: 0.6, rough: 0.5 })
            : mat(AAT_ACCENT, { emissive: AAT_ACCENT, ei: 0.0, rough: 0.5 });
        }
        if (it.id === "aat-neighbour-asks") {
          whisper = false;
          if (it.resolved === "answered") { note.visible = false; proctor.position.set(1.95, 0, 0.05); }
          neighbour.rotation.y = -2.4;
          neighbour.position.x = 2.0;
          proctorLamp.material.emissiveIntensity = 0;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (calling) contactGlow.material.emissiveIntensity = 0.5 + Math.sin(t * 9) * 0.4;
        if (whisper) proctorLamp.material.emissiveIntensity = 0.6 + Math.sin(t * 10) * 0.5;
        if (session?.turn && session.step?.id === "test-date") calDial.rotation.z = -session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "tape-read") {
          const ok = gg.t >= 0.44 && gg.t <= 0.56;
          repaint(tape.userData.screen, signFace(`${(12 + gg.t * 2).toFixed(3)}`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.56 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "timed-section") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(clockFace, signFace(ok ? "STEADY" : tr.v < 0.4 ? "BEHIND" : "RUSHING", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fbecc8", scale: 0.44 }));
        }
      },
    };
  },
};
