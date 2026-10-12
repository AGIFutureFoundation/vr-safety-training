import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Intake and Pathway Planning VR — Pathway Edition, wojrc.org.
//
// The first appointment of the Pathway Edition: a coach's office where an
// applicant is signed in, brings the documents the intake needs, reads the
// warehouse-versus-Class-A comparison board through before choosing, rates
// their own readiness honestly, sits an aptitude quiz without rushing or
// copying, has a track confirmed, moves their name card to it, works through
// the intake paperwork in the order that keeps it valid, names the barriers
// that could derail attendance, books the next appointment and signs the
// plan. Sited generically: no real coach, applicant or clause number the
// registry is not sure of.

const IPP_ACCENT = 0x7fa8d8;
const IPP_CSS = "#7fa8d8";

export const SIM_WP_INTAKE_AND_PATHWAY_PLANNING = {
  id: "wp-intake-and-pathway-planning",
  index: "708",
  domain: "Workforce readiness",
  trade: "Pathway Edition intake — choosing between the warehouse and Commercial Class A tracks with a coach",
  category: "Community Environmental Justice",
  indoor: "clinic",
  weather: "clear",
  certification: "Registered apprenticeship standards as a category — the written apprenticeship standard a sponsor registers with the U.S. Department of Labor or a State Apprenticeship Agency, which the coach explains as one of the tracks intake can lead toward; the OSHA Outreach Training Program's OSHA 10 course, named on the comparison board as part of what each track eventually asks for; the Consumer Financial Protection Bureau's (CFPB) consumer guidance, cited on the intake packet's benefits page; 29 CFR 1910.22 for the walking-working surfaces every office and every warehouse floor shares; 29 CFR 1910.151 for the medical-services context the dizzy applicant in the waiting area is handled inside; SAMHSA's guidance on help-seeking, for the coach's own check-in",
  name: "Intake and Pathway Planning",
  title: simTitle("Intake and Pathway Planning"),
  tagline: "Sign in, bring the documents, read both tracks through, rate your own readiness honestly, sit the quiz without copying, confirm the track, and leave with a plan, an appointment and a signature",
  accent: IPP_ACCENT,
  accentCss: IPP_CSS,
  parSeconds: 310,
  footprint: 2.2,
  supportLine: "the programme's own coaching staff, and 988 or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if today's news is heavier than paperwork can hold",
  badge: { id: "pathway-set", name: "Pathway Set", note: "Signed in under your own name, both tracks read and compared, the assessment honest, the track confirmed, and a plan signed with an appointment booked" },

  game: system({
    name: "Intake Desk",
    currency: "STEP",
    ranks: ["Walk-In", "Assessed", "Track Confirmed", "Plan Signed", "Intake Certified"],
    badges: [
      { id: "read-both", name: "Read Both Tracks", note: "The comparison board held through and the documents found clean", test: AWARD.all(AWARD.stepClean("bring-documents"), AWARD.stepClean("compare-tracks")) },
      { id: "no-shortcuts", name: "No Shortcuts", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "own-words", name: "Own Words", note: "The readiness gauge committed near the middle of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-intake", name: "Clean Intake", note: "No corrections anywhere", test: AWARD.clean },
      { id: "steady-quiz", name: "Steady Quiz", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "one-visit", name: "One Visit", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wp-ip-trip-cable": "You were about to step over the laptop charger where it runs across the walkway instead of along the wall. A cable across a floor people cross all day is a trip waiting on the busiest morning of the week, and this office sees more foot traffic than most under 29 CFR 1910.22 — the charger gets taped down along the baseboard, not left where feet land.",
    "wp-ip-screen-height": "You were about to start a morning of intake typing with the laptop flat on the desk and your neck bent down at it. A screen set low is a neck and shoulder strain that builds across a shift of back-to-back intakes, not a single bad moment — raise it on the stand before the first appointment, not after the ache starts.",
    "wp-ip-heated-visitor": "A man turned away because this cycle's warehouse cohort is full has stepped inside your circle, raising his voice at the front desk. Space and a level voice come before the explanation: step back to arm's length, let him finish, and bring the coach over rather than arguing the waitlist yourself with him this close.",
    "wp-ip-dizzy-applicant": "The applicant in the waiting chairs has gone pale and unsteady, and says she has not eaten since yesterday. A dizzy, shaking visitor with nothing in her since the day before is treated as a possible low-blood-sugar event, not embarrassment to wait out — sit her down, get her something with sugar in it, and stay with her rather than sending her back to the line.",
  },

  lateNotes: {
    "wp-ip-name-card": "Not yet. The card moves to a track's folder once the track is actually confirmed on the board — not before the assessment is read.",
    "wp-ip-intake-log": "The log is closed out last, with the track, the barriers named and the appointment date that actually got booked.",
  },

  steps: [
    {
      id: "sign-in", kind: "select", target: "wp-ip-signin-sheet",
      title: "Sign in under your own name",
      cue: "Sign the intake sheet at the front desk with your name, the date and the time — yourself.",
      why: "Everything the coach builds this session on — the plan, the appointment, the documents on file — is filed under the name on this sheet, so it starts with your own signature rather than somebody signing you in on their way past. It is also the record the front desk uses to call names in the order people actually arrived.",
    },
    {
      id: "bring-documents", kind: "find", noHint: true,
      targets: ["wp-ip-photo-id", "wp-ip-address-proof", "wp-ip-income-proof"],
      itemNames: { "wp-ip-photo-id": "photo ID", "wp-ip-address-proof": "proof of address", "wp-ip-income-proof": "proof of income" },
      itemNotes: {
        "wp-ip-photo-id": "A photo ID is the first thing intake checks against the sign-in sheet, and it is also what the warehouse or the testing site will ask for later — carrying it every visit saves a second trip.",
        "wp-ip-address-proof": "Proof of address is how the coach confirms you live in the area the programme serves. A recent bill or a lease page both work; an old one does not.",
        "wp-ip-income-proof": "Proof of income decides which programme services you qualify for. A pay stub, a benefits letter or a signed statement of no income all count — bringing none just means another appointment before intake can finish.",
      },
      title: "Find the three documents on the table",
      cue: "From the folder on the table, find your photo ID, proof of address and proof of income.",
      why: "An intake that stalls on a missing document is the single most common reason a first appointment turns into three, and each of these three answers a question the coach has to file an answer to before the assessment can start. Bringing all three the first time is what turns intake into one visit instead of a return trip nobody had budgeted for.",
    },
    {
      id: "compare-tracks", kind: "hold", target: "wp-ip-comparison-board", seconds: 6,
      title: "Read both tracks through, side by side",
      cue: "Hold at the comparison board and read warehouse and Commercial Class A all the way down, not just the headline.",
      why: "Warehouse work starts sooner and stays local; Commercial Class A takes longer to reach — a permit, a knowledge test, behind-the-wheel hours — and can mean nights away. Reading both all the way down, including the parts that are less exciting than the pay line, is what keeps the choice from being made on the first sentence and regretted by the third week.",
      holdBreakNote: "You left the board before the schedule line. That is the part people skip and then discover the hard way — read it through.",
    },
    {
      id: "readiness-gauge", kind: "gauge", target: "wp-ip-readiness-dial",
      title: "Rate your own readiness honestly",
      cue: "The dial runs one to ten. Commit it where you actually are today, not where you want to be.",
      gauge: {
        label: "READINESS", speed: 0.6, green: [0.4, 0.7],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That number does not sound like the person who just read the transportation line on the board twice. Rate it honestly — the coach plans around the real number, not the flattering one.",
      },
      why: "The coach uses this number to decide how much support to schedule alongside the training, not to gatekeep the programme. A ten from someone who has not driven since a permit lapsed years ago gets no extra help booked; an honest six gets a coach who checks in more often in the first weeks, which is the whole point of asking before the pathway starts rather than after it stalls.",
    },
    {
      id: "aptitude-quiz", kind: "track", target: "wp-ip-quiz-tablet", seconds: 7,
      title: "Sit the aptitude quiz at your own pace",
      cue: "Hold the quiz track in the band: reading each question, not rushing and not guessing.",
      track: {
        start: 0.5, green: [0.36, 0.66], rise: 0.5, fall: 0.44, drift: 0.14, label: "PACE",
        readout: (v) => (v < 0.36 ? "guessing" : v > 0.66 ? "rushing" : "reading it through"),
      },
      holdBreakNote: "The pace got away from you — into guessing or into rushing. Come back to reading each question before you answer it.",
      why: "The aptitude quiz is not a pass-fail gate; it is one more piece of information the coach uses to place you well. Rushed answers and guessed answers both feed the coach bad information about what to build support around, which is a worse outcome for you than taking the extra two minutes the quiz actually allows.",
    },
    {
      id: "choose-track", kind: "select", target: "wp-ip-warehouse-door",
      title: "Confirm the track the assessment points to",
      cue: "Between the two folder doors, the readiness number and the quiz both point to warehouse this cycle — select that door to confirm it.",
      why: "The comparison board, the readiness number and the quiz together are what the coach reads before naming a track, and warehouse is what today's answers point to: a schedule you can hold from week one and training that does not wait on a permit and a knowledge test first. Confirming it here is what tells the front desk which folder your paperwork goes into.",
    },
    {
      id: "move-name-card", kind: "drag", target: "wp-ip-name-card",
      title: "Move your name card to the warehouse folder",
      cue: "Carry your name card from the intake tray to the warehouse folder slot on the board.",
      why: "The folder board is how the front desk and the coach both know which track's paperwork to pull for you without asking twice. A card left in the intake tray reads as somebody still being assessed, and a card in the wrong folder sends a caseworker looking for a Class A file that does not exist yet.",
      drag: { to: "wp-ip-warehouse-slot", radius: 0.4, missNote: "Not in the warehouse folder. A card outside the slot tells the front desk the intake is still open." },
    },
    {
      id: "intake-paperwork", kind: "sequence",
      targets: ["wp-ip-id-copy", "wp-ip-release-form", "wp-ip-goals-worksheet"],
      itemNames: { "wp-ip-id-copy": "a copy of your ID made", "wp-ip-release-form": "the information-release form signed", "wp-ip-goals-worksheet": "the goals worksheet filled in" },
      outOfOrderNote: "Out of order. The ID is copied first so the file has it on record, the release form comes next so the coach can actually talk to the employer or the training provider it names, and the goals worksheet is what that conversation is then built around.",
      title: "Work through the intake paperwork in order",
      cue: "Copy your ID, sign the release form, then fill in the goals worksheet — in that order.",
      why: "The release form only means something once your ID copy is already on file to match it against, and the goals worksheet is written knowing the coach can actually follow up with the employer or provider the release names. Doing it in this order is what makes each document mean something to the one after it instead of three papers filed independently of each other.",
    },
    {
      id: "emergency-contact", kind: "select", target: "wp-ip-emergency-card",
      title: "Fill in an emergency contact",
      cue: "Write a name and a phone number the coach can call if something happens on a training day.",
      why: "A ride-along day, a testing site or a jobsite orientation are all places something can go wrong fast enough that the coach needs a real number, not a blank field discovered after the fact. Filling it in now, at a desk, is easier than being asked for it from a hallway phone on a day that is already going badly.",
    },
    {
      id: "barriers-checkin", kind: "select", target: "wp-ip-coach",
      title: "Name the barriers that could keep you from showing up",
      cue: "Tell the coach what could actually get in the way — transportation, childcare, a schedule conflict — before it does.",
      why: "A programme cannot fix a barrier it does not know exists, and the coach's whole job in this room is to plan around the ones you name now rather than discover them the week attendance drops. Saying the real barrier — a bus that does not run early enough, nobody to watch a child before school — is what gets an actual answer instead of a form that assumes none of that is true.",
    },
    {
      id: "book-appointment", kind: "turn", target: "wp-ip-calendar-dial",
      title: "Book the next appointment",
      cue: "Turn the calendar dial to the date of your next scheduled step on the warehouse track.",
      turn: { turns: 0.75, axis: "y", label: "NEXT APPOINTMENT" },
      why: "An intake that ends with 'we'll call you' is an intake that quietly stalls; one that ends with a date on the calendar is one both sides can hold each other to. Booking it here, before you leave the desk, is what turns today's assessment into a pathway instead of a folder that sits until somebody remembers to open it.",
    },
    {
      id: "sign-plan", kind: "select", target: "wp-ip-pathway-plan",
      title: "Sign the pathway plan",
      cue: "Read the plan back — track, appointment, barriers noted — then sign it.",
      why: "The plan is the one page that says, in your own hand, what was actually decided today: which track, when you are back, and what the coach agreed to help with. Reading it back before signing is what catches a wrong date or a barrier the form missed while it is still easy to fix, rather than finding the error at the next visit.",
    },
    {
      id: "close-log", kind: "select", target: "wp-ip-intake-log",
      title: "Close out the intake log",
      cue: "Log the track, the barriers named and the appointment date, then sign it.",
      why: "The intake log is what the next person who opens your file reads before they see you — the coach on your next visit, the caseworker covering an absence. A track and a date written down travel with the file; a conversation nobody logged has to be had all over again from nothing.",
    },
  ],

  interrupts: [
    {
      id: "wp-ip-quick-pick",
      kind: "Pressure to skip the comparison",
      after: "compare-tracks", delay: 3, seconds: 12,
      alert: "A staff member leans in: the next intake slot starts in ten minutes, and it would be quicker to just pick warehouse now and move on.",
      cue: "Do not let the clock decide it. Press the take-your-time badge on the coach's desk.",
      target: "wp-ip-take-time",
      why: "A pathway chosen to clear a waiting room is a pathway chosen for the wrong reason, and the ten minutes on that clock is not longer than the years the choice affects. The take-your-time badge is there because a coach's office runs behind schedule on purpose sometimes, and pressing it tells the front desk this appointment is one of them.",
      missNote: "You let the clock make the call, and in the version where you did, the track got picked before the schedule line was even read — the same line that turns out to matter most in week three.",
      wrongNote: "Not the board itself. The badge on the coach's desk is what tells the front desk to hold the next slot — press that, not the thing you have not finished reading.",
    },
    {
      id: "wp-ip-copy-answers",
      kind: "Another applicant leans in to copy",
      after: "aptitude-quiz", delay: 3, seconds: 12,
      alert: "The applicant at the next chair leans over toward your tablet, trying to read your answers off the screen.",
      cue: "Cover the screen. Do not let your answers travel to somebody else's quiz.",
      target: "wp-ip-privacy-shield",
      why: "A copied answer tells the coach nothing true about either applicant, and the person copying is the one it actually harms — they get placed against answers that were never theirs. The privacy shield folds up from the desk for exactly this reason, and using it protects both quizzes rather than starting an argument over one.",
      missNote: "You kept typing with the screen open, and in the version where the answers were copied, one placement got built on a false quiz and the honest one lost the chance to be checked against it.",
      wrongNote: "Not the tablet. The shield on the desk is what stops the screen being read — put that up, then finish your own answers.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.2, IPP_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#727c86", base2: "#69737c", seam: "rgba(0,0,0,0.14)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.05, rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.03, color: 0x9aa4ac });

    // ------------------------------------------------------------ the back wall
    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xd6dbe0, { rough: 0.9 });
    box(g, 5.6, 0.1, 0.14, 0, 0.05, -2.28, 0x3a4048, { rough: 0.7 });
    decal(g, 2.2, 0.18, 0, 2.4, -2.29, signFace("PATHWAY EDITION — INTAKE", { bg: "#1f2a36", accent: IPP_CSS, scale: 0.5 }), { px: 512 });

    // The comparison board.
    const board = holoPanel(g, 1.5, 1.0, -1.55, 1.55, -2.25, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,28,0.93)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = IPP_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e8f2fb"; cx.font = `600 ${Math.round(h * 0.08)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("WAREHOUSE", w * 0.05, h * 0.09);
      cx.fillText("CLASS A", w * 0.55, h * 0.09);
      cx.font = `${Math.round(h * 0.05)}px Arial, sans-serif`; cx.fillStyle = "#cfe0ee";
      ["Starts sooner", "Local schedule", "Forklift + pallet jack", "OSHA 10 along the way"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.22 + i * 0.13)));
      ["Permit + knowledge test", "Behind-the-wheel hours", "49 CFR 380 Subpart F", "Can mean nights away"].forEach((l, i) => cx.fillText(l, w * 0.55, h * (0.22 + i * 0.13)));
    }, { accent: IPP_ACCENT });
    reg2(board, "wp-ip-comparison-board");

    // Sign-in stand.
    const stand = group(g, -1.3, 0, -1.1, 0.3);
    cyl(stand, 0.2, 0.24, 0.04, 0, 0.02, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(stand, 0.03, 0.03, 1.0, 0, 0.52, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const lectern = group(stand, 0, 1.05, 0);
    lectern.rotation.x = -0.35;
    slab(lectern, 0.5, 0.04, 0.36, 0, 0, 0, 0x5a4a3a, { radius: 0.01, rough: 0.6 });
    const signFaceDecal = decal(lectern, 0.44, 0.3, 0, 0.022, 0, paperFace("INTAKE SIGN-IN", ["Name · date · time", "1. ______"], { bg: "#fbf8f0", band: "#2f4f6f" }), { px: 256 });
    signFaceDecal.rotation.x = -Math.PI / 2;
    holoTag(stand, "sign-in sheet", 0, 1.3, 0, { css: IPP_CSS, w: 0.32 });
    reg2(lectern, "wp-ip-signin-sheet");

    // The charger cable trip hazard, crossing the walkway toward the stand.
    const cable = cyl(g, 0.015, 0.015, 1.6, -0.55, 0.01, -1.0, 0x1c1f23, { rough: 0.6, seg: 8 });
    cable.rotation.z = Math.PI / 2;
    holoTag(g, "charger across the walkway?", -0.55, 0.15, -1.0, { css: "#f0645b", w: 0.4 });
    reg2(cable, "wp-ip-trip-cable");

    // The desk with laptop, tablet and readiness dial.
    const desk = group(g, 0.4, 0, -1.5);
    slab(desk, 1.5, 0.05, 0.7, 0, 0.74, 0, 0x7a6048, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(desk, 0.06, 0.72, 0.5, sx * 0.7, 0.37, 0, 0x4a3a2a, { rough: 0.6 });
    const laptop = group(desk, -0.35, 0.77, 0.1);
    box(laptop, 0.32, 0.02, 0.22, 0, 0, 0, 0x2b2f34, { rough: 0.4, metal: 0.3 });
    const screen = box(laptop, 0.3, 0.2, 0.015, 0, 0.1, -0.1, 0x1c1f23, { rough: 0.3 });
    screen.rotation.x = -0.25;
    holoTag(laptop, "laptop screen — set the stand first?", 0, 0.3, -0.1, { css: "#f0645b", w: 0.5 });
    reg2(laptop, "wp-ip-screen-height");
    const tablet = group(desk, 0.15, 0.775, 0.05);
    box(tablet, 0.22, 0.014, 0.16, 0, 0, 0, 0x1c1f23, { rough: 0.3, metal: 0.3 });
    const tabletFace = decal(tablet, 0.19, 0.13, 0, 0.008, 0, signFace("APTITUDE QUIZ", { bg: "#0d1c24", accent: IPP_CSS, fg: "#bfeaf7", scale: 0.4 }), { px: 192, glow: true, ei: 0.6 });
    holoTag(desk, "quiz tablet", 0.15, 0.16, 0.05, { css: IPP_CSS, w: 0.3 });
    reg2(tablet, "wp-ip-quiz-tablet");
    const shield = box(desk, 0.24, 0.16, 0.01, 0.15, 0.86, 0.11, 0xdfe4e8, { rough: 0.4, opacity: 0.001, transparent: true, cast: false });
    reg2(shield, "wp-ip-privacy-shield");
    const readinessDial = instrument(desk, 0.55, 0.02, 0.1, { idle: "-/10", color: IPP_ACCENT, ry: -0.2 });
    holoTag(readinessDial, "readiness", 0, 0.18, 0, { css: IPP_CSS, w: 0.24 });
    reg2(readinessDial, "wp-ip-readiness-dial");
    const takeTime = box(desk, 0.1, 0.03, 0.08, 0.68, 0.775, -0.22, 0xf2c14b, { rough: 0.5, emissive: 0xf2c14b, ei: 0.4 });
    holoTag(desk, "take-your-time badge", 0.68, 0.86, -0.22, { css: "#f2c14b", w: 0.36 });
    reg2(takeTime, "wp-ip-take-time");

    // The document table.
    const table = group(g, -1.6, 0, 0.4);
    slab(table, 1.0, 0.05, 0.7, 0, 0.7, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(table, 0.05, 0.68, 0.5, sx * 0.45, 0.35, 0, 0x3a2a1e, { rough: 0.6 });
    const DOCS = [["wp-ip-photo-id", -0.3, "PHOTO ID", "#2f5f8a"], ["wp-ip-address-proof", -0.05, "ADDRESS PROOF", "#3f7a45"], ["wp-ip-income-proof", 0.2, "INCOME PROOF", "#8a6a2a"]];
    for (const [id, x, label, band] of DOCS) {
      const c = group(table, x, 0.73, 0.05, (x + 0.3) * 0.4);
      slab(c, 0.16, 0.004, 0.1, 0, 0, 0, 0xf6f4ee, { radius: 0.006, rough: 0.6 });
      const f = decal(c, 0.15, 0.09, 0, 0.004, 0, paperFace(label, ["copy"], { bg: "#f6f4ee", band }), { px: 128 });
      f.rotation.x = -Math.PI / 2;
      reg2(c, id);
    }
    const emergency = group(table, 0.42, 0.73, -0.18, 0.2);
    slab(emergency, 0.15, 0.004, 0.1, 0, 0, 0, 0xffe9d8, { radius: 0.004, rough: 0.8 });
    decal(emergency, 0.14, 0.09, 0, 0.004, 0, paperFace("EMERGENCY CONTACT", ["Name: ____", "Phone: ____"], { bg: "#ffe9d8", band: "#b8602f" }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(emergency, "emergency contact card", 0, 0.1, 0, { css: IPP_CSS, w: 0.4 });
    reg2(emergency, "wp-ip-emergency-card");

    // Paperwork sequence: ID copy, release form, goals worksheet.
    const paperwork = group(g, -1.6, 0, -0.8);
    slab(paperwork, 1.0, 0.03, 0.4, 0, 0.72, 0, 0x8a7862, { radius: 0.02, rough: 0.7 });
    const PAPERS = [["wp-ip-id-copy", -0.32, "ID COPY"], ["wp-ip-release-form", 0, "RELEASE FORM"], ["wp-ip-goals-worksheet", 0.32, "GOALS WORKSHEET"]];
    for (const [id, x, label] of PAPERS) {
      const p = decal(paperwork, 0.26, 0.16, x, 0.735, 0, paperFace(label, ["sign · date"], { bg: "#f6f3ea", band: "#3f6f7a" }), { px: 160 });
      p.rotation.x = -Math.PI / 2;
      reg2(p, id);
    }
    holoTag(paperwork, "intake paperwork", 0, 0.94, 0, { css: IPP_CSS, w: 0.4 });

    // The folder board: warehouse and Class A, with the name-card tray.
    const folders = group(g, 2.15, 1.4, -1.3, -Math.PI / 2);
    slab(folders, 1.1, 0.9, 0.03, 0, -0.45, 0, 0x2a3036, { radius: 0.02, rough: 0.6 });
    const warehouseDoor = decal(folders, 0.5, 0.14, -0.27, 0.34, 0.02, signFace("WAREHOUSE", { bg: "#2a3036", accent: "#59c97b", scale: 0.55 }), { px: 192 });
    reg2(warehouseDoor, "wp-ip-warehouse-door");
    decal(folders, 0.5, 0.14, 0.27, 0.34, 0.02, signFace("CLASS A", { bg: "#2a3036", accent: "#5fb8f0", scale: 0.6 }), { px: 192 });
    const nameCard = group(folders, 0, 0.05, 0.04);
    box(nameCard, 0.4, 0.09, 0.01, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    decal(nameCard, 0.36, 0.07, 0, 0, 0.008, signFace("YOU — APPLICANT", { bg: "#f2c14b", accent: "#2a3036", fg: "#2a3036", scale: 0.55 }), { px: 192 });
    reg2(nameCard, "wp-ip-name-card");
    reg2(box(folders, 0.44, 0.12, 0.04, -0.27, -0.14, 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-ip-warehouse-slot");
    holoTag(folders, "folder board", 0, 0.54, 0.02, { css: IPP_CSS, w: 0.3 });

    // The appointment calendar with its dial.
    const calendar = group(g, 2.15, 0.72, -1.3, -Math.PI / 2);
    slab(calendar, 0.7, 0.4, 0.03, 0, -0.2, 0, 0x1f2a36, { radius: 0.02, rough: 0.6 });
    const calFace = decal(calendar, 0.6, 0.24, 0, -0.04, 0.02, signFace("--/--", { bg: "#0d1c24", accent: IPP_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 256, glow: true, ei: 0.6 });
    const calDial = group(calendar, 0, -0.34, 0.03);
    cyl(calDial, 0.06, 0.06, 0.03, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(calendar, "calendar dial", 0, -0.42, 0.03, { css: IPP_CSS, w: 0.28 });
    reg2(calDial, "wp-ip-calendar-dial");

    // The pathway plan and the intake log, near the coach.
    const planTable = group(g, 1.2, 0, 1.0);
    slab(planTable, 0.9, 0.05, 0.5, 0, 0.72, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    const planFace = decal(planTable, 0.6, 0.28, 0, 0.735, 0, paperFace("PATHWAY PLAN", ["Track: ______", "Next: ______", "Barriers: ______"], { bg: "#f6f3ea", band: "#3f6f7a" }), { px: 256 });
    planFace.rotation.x = -Math.PI / 2;
    holoTag(planTable, "pathway plan", 0, 0.9, 0, { css: IPP_CSS, w: 0.32 });
    reg2(planFace, "wp-ip-pathway-plan");
    const logBoard = decal(planTable, 0.4, 0.2, -0.3, 0.736, -0.12, paperFace("INTAKE LOG", ["Track: ____", "Barriers: ____", "Appt: ____"], { bg: "#f6f3ea", band: "#2f4f6f" }), { px: 192 });
    logBoard.rotation.x = -Math.PI / 2;
    holoTag(planTable, "intake log", -0.3, 0.9, -0.12, { css: IPP_CSS, w: 0.24 });
    reg2(logBoard, "wp-ip-intake-log");

    // Waiting area, the heated visitor and the dizzy applicant.
    for (const [bx, bz] of [[-2.0, 1.8], [-0.9, 1.9]]) {
      const seat = group(g, bx, 0, bz);
      slab(seat, 1.0, 0.05, 0.4, 0, 0.45, 0, 0x5a4a3a, { radius: 0.02, rough: 0.7 });
      for (const sx of [-1, 1]) box(seat, 0.05, 0.43, 0.36, sx * 0.45, 0.22, 0, 0x3a2a1e, { rough: 0.7 });
    }
    const dizzy = seatedFigure(g, -0.9, 0.5, 1.9, { cloth: 0x5a6a3a, ry: 0.6 });
    holoTag(dizzy.torso ?? dizzy, "unsteady — low blood sugar?", 0, 1.0, 0, { css: "#f0645b", w: 0.4 });
    reg2(box(g, 0.5, 1.1, 0.5, -0.9, 0.9, 1.9, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-ip-dizzy-applicant");

    const visitor = standingFigure(g, 1.9, -2.0, { ry: Math.PI, cloth: 0x7a3a3a, skin: 0x8a5a3a, atStation: true });
    holoTag(visitor, "raising his voice — step back?", 0, 1.9, 0, { css: "#f0645b", w: 0.44 });
    reg2(box(visitor, 0.6, 1.4, 0.6, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-ip-heated-visitor");

    const coach = standingFigure(g, 1.7, 0.6, { ry: -1.6, cloth: 0x2f5f8a, vest: 0xf2c14b, skin: 0x6b4a33, atStation: true });
    holoTag(coach, "coach", 0, 1.84, 0, { css: IPP_CSS, w: 0.2 });
    reg2(box(coach, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-ip-coach");

    let quickPickOn = false, copyOn = false;
    const nextClass = box(g, 0.36, 0.16, 0.04, -0.55, 1.35, -2.1, 0x2b2f34, { rough: 0.5 });
    const nextClassFace = decal(nextClass, 0.3, 0.12, 0, 0, 0.021, signFace("NEXT CLASS", { bg: "#0d1c24", accent: IPP_CSS, fg: "#bfeaf7", scale: 0.4 }), { px: 192 });
    const copyFigure = standingFigure(g, -0.35, -1.7, { ry: 2.0, cloth: 0x4a4a5a, skin: 0xbc8f68, atStation: true });
    copyFigure.visible = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.3, -1.6),

      onStepComplete(step) {
        if (step.id === "sign-in") repaint(signFaceDecal, paperFace("INTAKE SIGN-IN", ["Name · date · time", "1. YOU — signed"], { bg: "#fbf8f0", band: "#59c97b" }));
        if (step.id === "readiness-gauge") repaint(readinessDial.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "move-name-card") nameCard.position.set(-0.27, -0.14, 0.04);
        if (step.id === "book-appointment") repaint(calFace, signFace("BOOKED", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "close-log") repaint(logBoard, paperFace("INTAKE LOG", ["Track: warehouse", "Barriers: noted", "Appt: booked"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "wp-ip-quick-pick") {
          quickPickOn = true;
          nextClass.material.emissive?.set?.(0xf0645b);
          nextClass.material.emissiveIntensity = 1.2;
          repaint(nextClassFace, signFace("NEXT CLASS\n10 MIN", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd9d9", scale: 0.3 }));
        }
        if (it.id === "wp-ip-copy-answers") { copyOn = true; copyFigure.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "wp-ip-quick-pick") {
          quickPickOn = false;
          nextClass.material.emissive?.set?.(0x000000);
          nextClass.material.emissiveIntensity = 0;
          repaint(nextClassFace, signFace("NEXT CLASS", { bg: "#0d1c24", accent: IPP_CSS, fg: "#bfeaf7", scale: 0.4 }));
        }
        if (it.id === "wp-ip-copy-answers") { copyOn = false; copyFigure.visible = false; }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (quickPickOn) nextClass.material.emissive?.set?.(0xf0645b);
        void copyOn;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "readiness-gauge") {
          const ok = gg.t >= 0.4 && gg.t <= 0.7;
          repaint(readinessDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)}/10`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "aptitude-quiz") {
          const ok = tr.v >= 0.36 && tr.v <= 0.66;
          repaint(tabletFace, signFace(ok ? "READING" : tr.v < 0.36 ? "GUESSING" : "RUSHING", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.4 }));
        }
        void t; void dt;
      },
    };
  },
};
