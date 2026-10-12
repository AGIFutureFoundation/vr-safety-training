import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  seatedFigure, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ School Screening Outreach VR — Dental & Oral Health.
//
// A screening day in a school's multipurpose hall, worked as a community
// dental health worker: consent forms sorted before anybody is called in, the
// stations laid out so a child's mouth is not examined in front of the queue,
// a basic screening done with a light and a mirror in a fixed order, fluoride
// varnish applied under the standing order the practice act allows in a
// public-health setting, findings triaged into urgent, early and routine, a
// sealant day booked, and the whole thing handled so that the frightened
// six-year-old is not the one who leaves worse than they arrived.
//
// The screening instrument named is the ASTDD Basic Screening Survey, which
// is what state oral health programmes actually report against, and the
// sealant programme is the CDC's school sealant guidance. Whether a community
// dental health worker or a hygienist applies the varnish, and under whose
// standing order, is set by the state dental practice act — this station asks
// the learner to work to the one that covers them.

const SCHSCR_ACCENT = 0x8ed07f;
const SCHSCR_CSS = "#8ed07f";
const SCHSCR_FLOOR = 0xc9a978;
const SCHSCR_TABLE = 0xdfe4e6;
const SCHSCR_BLEACHER = 0x7b8a94;
const SCHSCR_VARNISH = 0xe8c86a;

export const SIM_SCHOOL_SCREENING_OUTREACH = {
  id: "school-screening-outreach",
  index: "216",
  domain: "Dental & Oral Health",
  trade: "Community dental health worker",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "The state dental practice act's public-health-setting provisions — the standing order or protocol under which a community dental health worker or hygienist may screen and apply fluoride varnish away from a dental office, and the supervision level it requires; the ADA's Community Dental Health Coordinator programme as the role's own training route; the CDC's school sealant programme guidance and its oral health surveillance work; the ASTDD (Association of State and Territorial Dental Directors) Basic Screening Survey, which is the instrument state oral health programmes report against; the AAPD's caries-risk assessment guidance for the triage; FERPA for the school's education records and HIPAA's Privacy Rule for the clinical record the screening creates; OSHA 29 CFR 1910.1030 bloodborne pathogens, which applies in a gym exactly as it does in an operatory; AFSCME and SEIU as the unions representing public-health dental staff",
  name: "School Screening Outreach",
  title: simTitle("School Screening Outreach"),
  tagline: "A school screening day: consent sorted first, stations laid out private, a basic screening by light and mirror, varnish under standing order, referrals triaged and a sealant day booked",
  accent: SCHSCR_ACCENT,
  accentCss: SCHSCR_CSS,
  parSeconds: 285,
  footprint: 2.4,
  badge: { id: "hall-run-right", name: "Hall Run Right", note: "A whole screening day with consent honoured, privacy held and every referral triaged and followed up" },

  game: system({
    name: "Community Oral Health",
    currency: "REACH",
    ranks: ["Outreach Volunteer", "Community Health Worker", "Screening Lead", "Programme Coordinator", "Oral Health Programme Lead"],
    badges: [
      { id: "consent-first", name: "Consent First", note: "Nobody screened who was not consented for", test: AWARD.stepClean("consent-audit") },
      { id: "nobody-held-down", name: "Nobody Held Down", note: "No unsafe action anywhere in the day", test: AWARD.safe },
      { id: "triaged-true", name: "Triaged True", note: "Urgency committed where the findings actually put it", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-day", name: "Clean Day", note: "No corrections anywhere in the day", test: AWARD.clean },
      { id: "held-the-set", name: "Held The Set", note: "Every timed hold carried to full duration first time", test: AWARD.unbroken },
      { id: "before-the-bell", name: "Before The Bell", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unreturned-consent": "That name card is in the not-returned tray, which means this child's family has not consented to anything. No consent is not the same as no objection: a child screened on the strength of being in the queue has been examined without permission, and the finding cannot be used, shared or followed up — so there was no point doing it and real harm in having done it.",
    "bulk-varnish-tube": "That is a multi-use tube of varnish being squeezed out for one child after another. A unit-dose package exists so the dose is known and nothing goes back into a shared container after touching a mouth — the tube gives you neither, and in a gym with no sink it is the single most direct cross-contamination route on the table.",
    "floor-tray": "That instrument tray is sitting on the gym floor. A gym floor is not a clean surface and a tray set on one is contaminated for the rest of the day; instruments here go on a barrier-covered table, because OSHA's bloodborne pathogens standard does not relax because the room has basketball lines painted on it.",
    "open-referral-list": "That referral list is face-up on the table with children's names and findings on it, and the queue is reading it. Those are education records and clinical findings at once — FERPA and HIPAA both land on this — and the child who is named on it as needing urgent care is about to hear about it from the line behind them.",
  },

  lateNotes: {
    "varnish-applicator": "Not yet. Nothing is painted on a tooth before the screening has actually found what is there and the triage has decided this child is a varnish candidate today.",
    "screening-log": "The day is not finished. The log is written from the screenings that happened, at the end, rather than filled in from the list of children who were booked.",
    "sealant-roster": "Hold off. The sealant day is built from the triage, so the roster goes on the calendar once the referrals have actually been sorted.",
  },

  steps: [
    {
      id: "consent-audit", kind: "find", noHint: true,
      targets: ["unsigned-form", "no-guardian-name", "language-mismatch"],
      itemNames: {
        "unsigned-form": "the form with no signature",
        "no-guardian-name": "the form with no guardian named",
        "language-mismatch": "the form sent home in the wrong language",
      },
      itemNotes: {
        "unsigned-form": "A form that came back with the boxes ticked and no signature is not a consent. It is very tempting to treat it as one because somebody clearly filled it in on purpose — and it still cannot authorise anybody to look in a child's mouth.",
        "no-guardian-name": "A signature with no printed guardian name cannot be matched to anybody with authority over this child. Foster placements, split custody and grandparents raising grandchildren all make this a real question rather than a formality.",
        "language-mismatch": "This form went home in a language the family does not read, and came back signed. A signature on a document somebody could not read is not informed consent to anything, and the fix is an interpreter and a form in their language rather than a signature on file.",
      },
      title: "Sort the consent forms before anybody is called in",
      cue: "Three of these consents will not hold up. Find them before the first class comes down.",
      why: "Consent is the whole legal basis for a screening day, and it is the one part that cannot be repaired afterwards: a child screened without it has been examined without permission, and the finding cannot be recorded, shared with the school nurse or followed up. Doing this sort before the first class arrives is also the only time it is possible — once forty children are queueing, every doubtful form becomes a decision made under pressure with a teacher waiting.",
    },
    {
      id: "station-layout", kind: "drag", target: "screening-chair",
      title: "Set the screening chair where the queue cannot see it",
      cue: "Put the chair on the marked spot — facing away from the line, with the light behind you.",
      why: "A screening station in the middle of a hall turns every child's mouth into a performance for the queue, and the ones with the worst teeth are the ones who have already learned to expect that. Turning the chair away from the line costs nothing and changes what the day feels like for exactly the children this programme exists for — it is also what makes the findings a private matter rather than something the hall overheard.",
      drag: { to: "layout-mark", radius: 0.4, missNote: "Not on the mark. A chair facing the queue means every child is examined in front of an audience, which is the part they will remember about dentistry." },
    },
    {
      id: "privacy-screen", kind: "turn", target: "privacy-screen",
      title: "Angle the privacy screen",
      cue: "Turn the folding screen to close the sightline between the chair and the waiting line.",
      why: "The screen is the difference between a screening station and a table in a gym, and it works only at the angle that actually blocks the line rather than the angle it happened to be unfolded at. It also gives the child in the chair somewhere to be upset without forty classmates watching, which is worth more on a day like this than any instrument on the table.",
      turn: { turns: 1, axis: "y", label: "SCREEN ANGLE" },
    },
    {
      id: "ppe-hands", kind: "sequence", anyOrder: true,
      targets: ["outreach-gloves", "outreach-mask", "hand-rub"],
      itemNames: { "outreach-gloves": "gloves", "outreach-mask": "mask", "hand-rub": "alcohol hand rub" },
      title: "Set up PPE and hand hygiene without a sink",
      cue: "Gloves, mask, and the alcohol rub that is standing in for the sink this hall does not have.",
      why: "OSHA's bloodborne pathogens standard applies in a school hall exactly as it does in an operatory, and the thing a hall does not have is a sink — so the alcohol rub, positioned at the chair rather than across the room, is what makes hand hygiene between children actually happen. Gloves change between every child regardless of how brief the look was, because a screening is still a mouth.",
    },
    {
      id: "trauma-informed", kind: "find", noHint: true,
      targets: ["knee-level-stool", "show-tell-mirror", "agreed-signal"],
      itemNames: {
        "knee-level-stool": "the low stool that puts you at their eye level",
        "show-tell-mirror": "the spare mirror they can hold themselves",
        "agreed-signal": "the stop signal agreed before you start",
      },
      itemNotes: {
        "knee-level-stool": "Standing over a seated six-year-old with a light is the posture of something being done to them. Sitting down to their eye level first changes the encounter into a conversation, and it costs one second.",
        "show-tell-mirror": "Letting a child hold and look at the mirror before it goes near their mouth is tell-show-do, and it works because the thing they are afraid of is the unknown instrument rather than the examination. A child who has handled the mirror usually opens their mouth.",
        "agreed-signal": "A stop signal agreed out loud before you begin — a raised hand, and you stop — gives the child the one thing they do not otherwise have, which is a way out. Honouring it the first time they use it is what makes it real for every child behind them in the queue.",
      },
      title: "Find what makes this safe for a frightened child",
      cue: "Three things on this table are what turn a screening into something a scared child can consent to. Find them.",
      why: "A child who is frightened of a dental examination at six is frequently still frightened of one at thirty, and a school screening is where a great many people form that opinion. Getting to their eye level, letting them hold the mirror and agreeing a stop signal are not softenings of the procedure — they are how the procedure actually gets done on a child who would otherwise clamp shut, and they are what a trauma-informed programme means in practice.",
    },
    {
      id: "screening-order", kind: "sequence",
      targets: ["extraoral-look", "soft-tissue-check", "tooth-survey"],
      itemNames: {
        "extraoral-look": "the extraoral look",
        "soft-tissue-check": "the soft tissues",
        "tooth-survey": "the teeth",
      },
      title: "Work the screening in its fixed order",
      cue: "Outside the mouth first, then the soft tissues, then the teeth.",
      why: "The order is fixed because the things that get missed are the ones nobody was looking for: facial swelling and a draining sinus are visible from outside and say more about urgency than any cavity, and the soft tissues get skipped entirely by anybody who starts counting teeth. The ASTDD Basic Screening Survey is built on the same sequence, which is what makes one worker's findings comparable with another's.",
      outOfOrderNote: "Out of order. Starting at the teeth is how a swollen face and an ulcer both get missed — outside the mouth, then the tissues, then the teeth, every time.",
    },
    {
      id: "mirror-survey", kind: "track", target: "mouth-mirror", seconds: 8,
      title: "Survey the teeth with light and mirror",
      cue: "Hold the light and mirror where you can actually see the occlusal surfaces — steady, and watch the child's face.",
      why: "A screening is a visual examination with a light and a mirror and nothing else, so what you can see is entirely decided by where the light is and how the mirror is angled — held badly, the biting surfaces of the back teeth, where most of the decay is, never come into view at all. Holding it steady on a child who is nervous also means watching their face rather than only the mouth, because the first sign this is going wrong is up there.",
      track: {
        start: 0.14, green: [0.38, 0.62], rise: 0.5, fall: 0.44, drift: 0.14, label: "FIELD OF VIEW",
        readout: (v) => (v < 0.38 ? "cannot see the back teeth" : v > 0.62 ? "mirror against the palate — they will gag" : "occlusal surfaces in view"),
      },
      holdBreakNote: "You lost the view. A screening that never saw the biting surfaces of the molars has looked at the part of the mouth where decay mostly is not.",
    },
    {
      id: "risk-triage", kind: "gauge", target: "triage-board",
      title: "Assign the urgency the findings support",
      cue: "Routine, early, or urgent — commit where what you actually saw puts this child.",
      why: "Triage is the one judgement on this table that changes what happens to a child, and it is wrong in both directions: everybody marked urgent means the genuinely urgent child waits behind forty others, and a child with a draining abscess marked routine gets a letter home about a check-up in six months. The AAPD's caries-risk framework is what turns a look in a mouth into a category somebody downstream can act on.",
      gauge: {
        label: "URGENCY", speed: 0.5, green: [0.42, 0.62],
        readout: (t) => (t < 0.42 ? "routine — next recall" : t > 0.62 ? "urgent — today" : "early care — weeks"),
        missNote: "Not where these findings sit. Over-triaging buries the child who genuinely needs today; under-triaging sends a child in pain home with a leaflet.",
      },
    },
    {
      id: "varnish-dose", kind: "select", target: "unit-dose-varnish",
      title: "Take the unit dose for this child's age",
      cue: "Pick the single-use package sized for this age — not a squeeze from a shared tube.",
      why: "Fluoride varnish is applied here under the standing order the state dental practice act allows in a public-health setting, and that order specifies a dose by age. A unit-dose package is what makes that dose real: it is the amount, it is for one child, and whatever is left goes in the waste — which is also the only way to have no shared container on a table with no sink behind it.",
    },
    {
      id: "varnish-set", kind: "hold", target: "varnish-applicator", seconds: 7,
      title: "Apply the varnish and let it set",
      cue: "Paint all surfaces, then keep the mouth dry while it sets — and keep talking to them.",
      why: "Varnish sets on contact with saliva and needs the seconds afterwards undisturbed to stay where it was painted, which is why this is a hold rather than a stroke. It is also the longest the child has had to sit still, so the talking matters: a child who gets through the set because somebody was telling them what was happening leaves with a different idea of dentistry than one who got through it because they were held there.",
      holdBreakNote: "The set was cut short. Varnish that has not set comes off with the next swallow, which means the fluoride this child was brought down here for went down their throat rather than onto their teeth.",
    },
    {
      id: "referral-triage", kind: "sequence",
      targets: ["urgent-pile", "early-pile", "routine-pile"],
      itemNames: {
        "urgent-pile": "the urgent referrals",
        "early-pile": "the early-care referrals",
        "routine-pile": "the routine recalls",
      },
      title: "Sort the referrals and build the follow-up list",
      cue: "Urgent first with a call today, then early care, then the routine recalls.",
      why: "A referral list is worth exactly as much as the follow-up behind it, and the follow-up is finite — so the urgent ones are worked first, by phone, today, while the routine ones go home as letters. Sorting in this order is also what stops the day's genuinely urgent children disappearing into a stack of forty envelopes that somebody will get to next week.",
      outOfOrderNote: "Out of order. The urgent referrals are the ones that need a person on a phone today; sorting the routine pile first is spending the day's follow-up capacity on the children who need it least.",
    },
    {
      id: "sealant-day", kind: "drag", target: "sealant-roster",
      title: "Book the sealant day",
      cue: "Put the roster on the school calendar with the children the triage identified.",
      why: "School sealant programmes are one of the few oral health interventions with a real evidence base behind them, and the CDC's guidance is built on the programme returning to the same school to place them rather than referring children out and hoping. Booking the date now, on the school's own calendar, with a named list, is what turns a screening day into a course of treatment rather than a survey.",
      drag: { to: "school-calendar", radius: 0.4, missNote: "Not on the calendar. A sealant day that exists only as an intention gets displaced by the first thing the school books over it." },
    },
    {
      id: "outreach-log", kind: "select", target: "screening-log",
      title: "Write the day up",
      cue: "Log the children screened, the varnish applied, the referrals by urgency, and what goes to the state survey.",
      why: "This log is three documents at once: a clinical record for each child, the school's own record of what happened in its hall, and the data the state oral health programme reports against the Basic Screening Survey. Writing it at the end from what actually happened — rather than from the list of who was booked — is what makes all three true, and it is the only version that will still be defensible when a parent rings in a fortnight.",
    },
    {
      id: "nurse-handover", kind: "select", target: "nurse-board",
      title: "Hand over to the school nurse and check on your volunteer",
      cue: "Walk the urgent list with the nurse, and ask the parent volunteer how they found the morning.",
      why: "The school nurse is the only person who will still be here tomorrow, so the urgent list is handed to them in person rather than posted — they are the one who can catch the child whose family never opens the envelope. The volunteer needs asking too: somebody who spent the morning holding a crying child's hand has had a harder day than the paperwork records, and they are the reason a day like this is possible at all.",
    },
  ],

  interrupts: [
    {
      id: "child-without-consent",
      kind: "No consent on file",
      after: "mirror-survey", delay: 4, seconds: 12,
      alert: "A teacher has walked another child over and asked you to 'just take a quick look' — they are not on your consent list.",
      cue: "Check the consent binder before anything else happens.",
      target: "consent-binder",
      why: "A teacher's request is not consent and neither is a child's willingness, because neither of them holds the authority a guardian does. The binder is what answers it, and the answer being no is not a refusal of care — it is a form that goes home tonight so this child can be screened properly next week instead of unlawfully today.",
      missNote: "The child was screened with nothing on file. Whatever was found cannot be recorded, cannot be sent home and cannot be followed up, so a child who may genuinely need care has now been examined for no benefit at all — and their family was never asked.",
      wrongNote: "It is the consent binder. The question is not whether this child needs looking at; it is whether anybody has authorised you to look.",
    },
    {
      id: "volunteer-holds-child",
      kind: "Unconsented restraint",
      after: "varnish-set", delay: 3, seconds: 12,
      alert: "The child has started to cry and wipe at their mouth, and the parent volunteer has stepped in and is holding their hands down.",
      cue: "Get the volunteer back. Nobody is held down here.",
      target: "volunteer-mark",
      why: "Protective stabilisation of a child is a clinical decision requiring specific consent and training, and neither exists in a school hall with a volunteer. A child held down for a fluoride varnish learns something about dental care that will outlast the varnish by decades, and the correct response is to stop, let them sit up and finish another day if they will not have it now.",
      missNote: "The child was held through the rest of the application. The varnish is on, and so is a memory of being pinned by an adult in a school hall while somebody worked in their mouth — which is the thing this programme spends the rest of its existence trying to undo.",
      wrongNote: "It is the volunteer's step-back mark. The varnish is not what needs attention in the next five seconds; the hands on the child are.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, SCHSCR_ACCENT);

    // A sprung maple hall floor with the court lines painted on it.
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#cfae7e", base2: "#c6a474", seam: "rgba(90,60,20,0.16)",
    }), { repeat: 4, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.04, rough: 0.55, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.55, metal: 0.02, color: SCHSCR_FLOOR });
    slab(g, 5.6, 0.004, 0.06, 0, 0.005, 1.7, 0xf2f4f2, { radius: 0.01, rough: 0.6, cast: false });
    slab(g, 0.06, 0.004, 3.4, -2.2, 0.005, 0.0, 0xd8a24a, { radius: 0.01, rough: 0.6, cast: false });
    const centreCircle = torus(g, 0.9, 0.022, 0.4, 0.005, -0.4, 0xf2f4f2, { rough: 0.6, seg: 4, seg2: 40, cast: false });
    centreCircle.rotation.x = Math.PI / 2;

    // -------------------------------------------------------- screening station
    const layoutMark = box(g, 0.7, 0.01, 0.7, -0.8, 0.008, -0.65, SCHSCR_ACCENT, { emissive: SCHSCR_ACCENT, ei: 0.5, rough: 0.5, opacity: 0.45, transparent: true, cast: false });
    holoTag(g, "Chair goes here", -0.8, 0.28, -0.65, { css: SCHSCR_CSS, w: 0.44 });
    hits["layout-mark"] = layoutMark;

    const chairPark = group(g, 0.55, 0, 0.35, -0.5);
    const screeningChair = group(chairPark, 0, 0, 0);
    box(screeningChair, 0.44, 0.06, 0.44, 0, 0.44, 0, 0x4f7f8c, { rough: 0.8 });
    box(screeningChair, 0.44, 0.5, 0.06, 0, 0.7, -0.19, 0x4f7f8c, { rough: 0.8 });
    for (const dx of [-0.18, 0.18]) {
      box(screeningChair, 0.04, 0.44, 0.4, dx, 0.22, 0, 0x8e979f, { rough: 0.5, metal: 0.4 });
    }
    box(screeningChair, 0.2, 0.1, 0.06, 0, 0.96, -0.2, 0x4f7f8c, { rough: 0.8 });
    holoTag(screeningChair, "Screening chair", 0, 1.16, 0, { css: SCHSCR_CSS, w: 0.44 });
    reg(hits, screeningChair, "screening-chair");

    // The privacy screen, folded at the wrong angle to start with.
    const privacyScreen = group(g, -1.85, 0, -0.35, 0.25);
    for (let i = 0; i < 3; i++) {
      const panel = group(privacyScreen, -0.5 + i * 0.5, 0, 0);
      box(panel, 0.48, 1.6, 0.03, 0, 0.8, 0, 0xdfe6e2, { rough: 0.75 });
      box(panel, 0.5, 0.06, 0.06, 0, 0.02, 0, 0x8e979f, { rough: 0.5, metal: 0.4 });
      panel.rotation.y = (i - 1) * 0.35;
    }
    holoTag(privacyScreen, "Privacy screen", 0, 1.74, 0, { css: SCHSCR_CSS, w: 0.42 });
    reg(hits, privacyScreen, "privacy-screen");

    // The child in the chair, and the parts of the screening.
    const child = seatedFigure(g, -0.8, 0.44, -0.55, { skin: 0x8d5a3b, cloth: 0xe8b06a, seed: 51 });
    child.root.scale.set(0.82, 0.82, 0.82);
    const childFace = group(g, -0.8, 1.16, -0.7);
    const extraoral = box(childFace, 0.1, 0.09, 0.03, -0.12, 0.05, 0.04, 0x8fd6c9, { emissive: 0x8fd6c9, ei: 0.1, rough: 0.4, opacity: 0.35, transparent: true });
    holoTag(childFace, "Extraoral", -0.12, 0.14, 0.04, { css: SCHSCR_CSS, w: 0.28 });
    reg(hits, extraoral, "extraoral-look");
    const softTissue = box(childFace, 0.07, 0.05, 0.03, 0.0, -0.02, 0.05, 0xe8a0b0, { emissive: 0xe8a0b0, ei: 0.1, rough: 0.4, opacity: 0.4, transparent: true });
    holoTag(childFace, "Soft tissues", 0.02, -0.1, 0.05, { css: SCHSCR_CSS, w: 0.34 });
    reg(hits, softTissue, "soft-tissue-check");
    const toothSurvey = group(childFace, 0.14, 0.0, 0.05);
    for (let i = 0; i < 4; i++) {
      box(toothSurvey, 0.014, 0.016, 0.012, -0.022 + i * 0.015, 0, 0, 0xf4ecdc, { rough: 0.45 });
    }
    holoTag(childFace, "Teeth", 0.16, 0.1, 0.05, { css: SCHSCR_CSS, w: 0.22 });
    reg(hits, toothSurvey, "tooth-survey");

    // ------------------------------------------------------------ the table
    const table = group(g, 0.9, 0, -1.55, -0.35);
    const tableTop = slab(table, 1.7, 0.04, 0.7, 0, 0.74, 0, 0xffffff, { radius: 0.01, rough: 0.5 });
    const tableTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#eef2f4", base2: "#e4e9ec", seam: "rgba(0,0,0,0.05)",
    }), { repeat: 3, px: 256 });
    tableTop.material = texturedMat(tableTex, { rough: 0.5, metal: 0.05, color: 0xffffff });
    // The barrier film over it — what makes a folding table a clean surface.
    slab(table, 1.64, 0.006, 0.64, 0, 0.765, 0, 0xdfeef4, { radius: 0.01, rough: 0.6, opacity: 0.8, transparent: true });
    for (const dx of [-0.72, 0.72]) {
      box(table, 0.05, 0.72, 0.6, dx, 0.37, 0, SCHSCR_TABLE, { rough: 0.5, metal: 0.3 });
    }
    box(table, 1.4, 0.04, 0.08, 0, 0.2, 0, SCHSCR_TABLE, { rough: 0.5, metal: 0.3 });

    const glovesBox = box(table, 0.2, 0.12, 0.16, -0.62, 0.83, -0.2, 0x6fa8d6, { rough: 0.65 });
    decal(table, 0.15, 0.05, -0.62, 0.9, -0.12, signFace("GLOVES", { bg: "#22303c", accent: SCHSCR_CSS, scale: 0.4 }), { px: 128 });
    holoTag(table, "Gloves", -0.62, 0.96, -0.2, { css: SCHSCR_CSS, w: 0.24 });
    reg(hits, glovesBox, "outreach-gloves");

    const maskBox = box(table, 0.17, 0.1, 0.14, -0.38, 0.82, -0.2, 0xe6eef4, { rough: 0.7 });
    holoTag(table, "Masks", -0.38, 0.94, -0.2, { css: SCHSCR_CSS, w: 0.22 });
    reg(hits, maskBox, "outreach-mask");

    const handRub = group(table, -0.14, 0.77, -0.2);
    cyl(handRub, 0.035, 0.04, 0.16, 0, 0.08, 0, 0xeff6f8, { rough: 0.4, seg: 14, opacity: 0.8, transparent: true });
    box(handRub, 0.05, 0.03, 0.04, 0, 0.17, 0.02, 0x3c4249, { rough: 0.5 });
    decal(handRub, 0.06, 0.05, 0, 0.09, 0.041, signFace("RUB", { bg: "#eff6f8", fg: "#2f6f86", accent: SCHSCR_CSS, scale: 0.5 }), { px: 128 });
    holoTag(handRub, "Hand rub", 0, 0.26, 0, { css: SCHSCR_CSS, w: 0.3 });
    reg(hits, handRub, "hand-rub");

    const mouthMirror = group(table, 0.12, 0.79, -0.12, 0.3);
    cyl(mouthMirror, 0.004, 0.004, 0.13, 0, 0, 0, 0xcfd8de, { rough: 0.25, metal: 0.85, seg: 8 }).rotation.z = Math.PI / 2;
    const mirrorHead = cyl(mouthMirror, 0.012, 0.012, 0.003, 0.072, 0.002, 0, 0xe4f2f8, { rough: 0.08, metal: 0.9, seg: 14 });
    mirrorHead.rotation.x = Math.PI / 2;
    cyl(mouthMirror, 0.01, 0.014, 0.05, -0.085, 0, 0, 0x2f6f86, { rough: 0.4, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(mouthMirror, "Mirror + light", 0, 0.08, 0, { css: SCHSCR_CSS, w: 0.4 });
    reg(hits, mouthMirror, "mouth-mirror");

    const showTellMirror = group(table, 0.12, 0.79, 0.14, -0.4);
    cyl(showTellMirror, 0.004, 0.004, 0.12, 0, 0, 0, 0xd8e4ea, { rough: 0.3, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    cyl(showTellMirror, 0.014, 0.014, 0.003, 0.066, 0.002, 0, 0xeaf6fa, { rough: 0.08, metal: 0.9, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(showTellMirror, "Theirs to hold", 0, 0.08, 0, { css: SCHSCR_CSS, w: 0.4 });
    reg(hits, showTellMirror, "show-tell-mirror");

    const agreedSignal = group(table, 0.4, 0.78, 0.16, 0.1);
    box(agreedSignal, 0.13, 0.004, 0.09, 0, 0, 0, 0xf6f4ea, { rough: 0.9 });
    decal(agreedSignal, 0.12, 0.08, 0, 0.004, 0, signFace("HAND UP = STOP", { bg: "#fbf8ee", accent: "#2f7d4a", scale: 0.24 }), { px: 192 }).rotation.x = -Math.PI / 2;
    holoTag(agreedSignal, "Stop signal", 0, 0.1, 0, { css: SCHSCR_CSS, w: 0.34 });
    reg(hits, agreedSignal, "agreed-signal");

    const unitDose = group(table, 0.66, 0.79, -0.12, -0.2);
    box(unitDose, 0.07, 0.02, 0.05, 0, 0, 0, 0xf6f2e2, { rough: 0.8 });
    cyl(unitDose, 0.012, 0.012, 0.012, 0, 0.014, 0, SCHSCR_VARNISH, { rough: 0.5, seg: 12 });
    decal(unitDose, 0.06, 0.02, 0, 0.011, 0.026, signFace("UNIT DOSE", { bg: "#f8f4e4", accent: "#8a6a10", scale: 0.3 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(unitDose, "Unit dose", 0, 0.1, 0, { css: SCHSCR_CSS, w: 0.3 });
    reg(hits, unitDose, "unit-dose-varnish");

    const varnishApplicator = group(table, 0.66, 0.79, 0.14, 0.35);
    cyl(varnishApplicator, 0.0035, 0.0035, 0.1, 0, 0, 0, 0xe8dfc8, { rough: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    ball(varnishApplicator, 0.007, 0.055, 0.002, 0, SCHSCR_VARNISH, { rough: 0.5, seg: 10 });
    holoTag(varnishApplicator, "Applicator", 0, 0.08, 0, { css: SCHSCR_CSS, w: 0.32 });
    reg(hits, varnishApplicator, "varnish-applicator");

    // The multi-use tube — the hazard.
    const bulkTube = group(table, 0.4, 0.79, -0.2, 0.2);
    cyl(bulkTube, 0.016, 0.014, 0.09, 0, 0, 0, SCHSCR_VARNISH, { rough: 0.45, seg: 12 }).rotation.z = Math.PI / 2;
    cyl(bulkTube, 0.008, 0.008, 0.02, 0.055, 0, 0, 0xd8a24a, { rough: 0.4, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(bulkTube, "Shared tube", 0, 0.08, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, bulkTube, "bulk-varnish-tube");

    // The tray on the gym floor — the hazard.
    const floorTray = group(g, 1.55, 0, -0.65, 0.4);
    slab(floorTray, 0.28, 0.02, 0.18, 0, 0.02, 0, 0xdfe6ea, { radius: 0.01, rough: 0.45, metal: 0.25 });
    for (let i = 0; i < 3; i++) {
      cyl(floorTray, 0.004, 0.004, 0.11, -0.06 + i * 0.06, 0.035, 0, 0xcfd8de, { rough: 0.25, metal: 0.85, seg: 8 }).rotation.z = Math.PI / 2;
    }
    holoTag(floorTray, "Tray on the floor", 0, 0.14, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, floorTray, "floor-tray");

    // The low stool.
    const kneeStool = group(g, -1.35, 0, -0.95, 0.3);
    cyl(kneeStool, 0.16, 0.16, 0.04, 0, 0.36, 0, 0x4f7f8c, { rough: 0.7, seg: 16 });
    cyl(kneeStool, 0.03, 0.03, 0.34, 0, 0.17, 0, 0x8e979f, { rough: 0.5, metal: 0.4, seg: 10 });
    cyl(kneeStool, 0.15, 0.17, 0.02, 0, 0.01, 0, 0x2d333a, { rough: 0.5, metal: 0.4, seg: 16 });
    holoTag(kneeStool, "Their eye level", 0, 0.52, 0, { css: SCHSCR_CSS, w: 0.42 });
    reg(hits, kneeStool, "knee-level-stool");

    // ------------------------------------------------------------ consent desk
    const consentDesk = group(g, -2.45, 0, 1.1, 1.35);
    const consentTop = slab(consentDesk, 1.5, 0.04, 0.66, 0, 0.74, 0, 0xffffff, { radius: 0.01, rough: 0.5 });
    consentTop.material = texturedMat(tableTex, { rough: 0.5, metal: 0.05, color: 0xffffff });
    for (const dx of [-0.62, 0.62]) {
      box(consentDesk, 0.05, 0.72, 0.56, dx, 0.37, 0, SCHSCR_TABLE, { rough: 0.5, metal: 0.3 });
    }
    box(consentDesk, 1.2, 0.04, 0.08, 0, 0.2, 0, SCHSCR_TABLE, { rough: 0.5, metal: 0.3 });

    const unsignedForm = group(consentDesk, -0.46, 0.77, -0.1, 0.12);
    box(unsignedForm, 0.16, 0.004, 0.21, 0, 0, 0, 0xf8f5ea, { rough: 0.9 });
    decal(unsignedForm, 0.15, 0.19, 0, 0.004, 0, paperFace("CONSENT", [
      "Boxes ticked", "Signature: ______", "Date: 12 Oct",
    ], { bg: "#f8f5ea", band: "#a5261e" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(unsignedForm, "Not signed", 0, 0.1, 0, { css: "#f0b86e", w: 0.32 });
    reg(hits, unsignedForm, "unsigned-form");

    const noGuardian = group(consentDesk, -0.16, 0.77, -0.1, -0.1);
    box(noGuardian, 0.16, 0.004, 0.21, 0, 0, 0, 0xf6f2e6, { rough: 0.9 });
    decal(noGuardian, 0.15, 0.19, 0, 0.004, 0, paperFace("CONSENT", [
      "Signed", "Guardian name: ______", "Relationship: ______",
    ], { bg: "#faf6ec", band: "#a5661e" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(noGuardian, "No guardian named", 0, 0.1, 0, { css: "#f0b86e", w: 0.5 });
    reg(hits, noGuardian, "no-guardian-name");

    const languageMismatch = group(consentDesk, 0.14, 0.77, -0.1, 0.2);
    box(languageMismatch, 0.16, 0.004, 0.21, 0, 0, 0, 0xf2eee2, { rough: 0.9 });
    decal(languageMismatch, 0.15, 0.19, 0, 0.004, 0, paperFace("CONSENT", [
      "Signed", "Sent in English only", "Family reads Spanish",
    ], { bg: "#f6f2e6", band: "#2f6f86" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(languageMismatch, "Wrong language", 0, 0.1, 0, { css: "#f0b86e", w: 0.44 });
    reg(hits, languageMismatch, "language-mismatch");

    const consentBinder = group(consentDesk, 0.48, 0.76, -0.08, -0.2);
    box(consentBinder, 0.21, 0.06, 0.27, 0, 0.03, 0, 0x2f7d4a, { rough: 0.7 });
    box(consentBinder, 0.2, 0.045, 0.26, 0, 0.035, 0.004, 0xf8f5ea, { rough: 0.9 });
    decal(consentBinder, 0.17, 0.22, 0, 0.062, 0.004, paperFace("CONSENT BINDER", [
      "Returned + valid", "By class", "Checked at the chair",
    ], { bg: "#f8f5ea", band: "#2f7d4a" }), { px: 256 }).rotation.x = -Math.PI / 2;
    holoTag(consentBinder, "Consent binder", 0, 0.18, 0, { css: SCHSCR_CSS, w: 0.44 });
    reg(hits, consentBinder, "consent-binder");

    // The not-returned tray — the hazard.
    const notReturned = group(consentDesk, 0.48, 0.76, 0.2, 0.15);
    slab(notReturned, 0.22, 0.03, 0.16, 0, 0, 0, 0xb4643c, { radius: 0.01, rough: 0.7 });
    box(notReturned, 0.08, 0.004, 0.05, 0, 0.02, 0, 0xf8f5ea, { rough: 0.9 });
    decal(notReturned, 0.18, 0.05, 0, 0.018, -0.05, signFace("NOT RETURNED", { bg: "#c4724a", accent: "#5a2410", fg: "#ffffff", scale: 0.28 }), { px: 192 }).rotation.x = -Math.PI / 2;
    holoTag(notReturned, "No consent on file", 0, 0.12, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, notReturned, "unreturned-consent");

    // ------------------------------------------------------- triage / referrals
    const triageBoard = holoPanel(g, 0.62, 0.42, 2.1, 1.44, -0.9, (cx, w, h) => {
      cx.fillStyle = "rgba(10,22,16,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = SCHSCR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#d8f2cc";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("URGENCY TRIAGE", w * 0.06, h * 0.15);
      cx.fillStyle = "#eef8e8";
      cx.font = `${Math.round(h * 0.086)}px Arial, sans-serif`;
      ["Urgent — pain, swelling, today", "Early — weeks, not months",
        "Routine — next recall", "Caries risk recorded"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { accent: SCHSCR_ACCENT, ry: -1.2 });
    reg(hits, triageBoard, "triage-board");

    const referralTable = group(g, 1.85, 0, 1.2, -0.9);
    const refTop = slab(referralTable, 1.3, 0.04, 0.6, 0, 0.74, 0, 0xffffff, { radius: 0.01, rough: 0.5 });
    refTop.material = texturedMat(tableTex, { rough: 0.5, metal: 0.05, color: 0xffffff });
    for (const dx of [-0.52, 0.52]) {
      box(referralTable, 0.05, 0.72, 0.5, dx, 0.37, 0, SCHSCR_TABLE, { rough: 0.5, metal: 0.3 });
    }

    const PILES = [
      ["urgent-pile", -0.4, "URGENT", "#f0645b", 0xf0645b],
      ["early-pile", 0.0, "EARLY", "#f0b86e", 0xf0b86e],
      ["routine-pile", 0.4, "ROUTINE", "#8ed07f", 0x8ed07f],
    ];
    const pileGroups = {};
    for (const [id, dx, label, css, tone] of PILES) {
      const pile = group(referralTable, dx, 0.77, -0.08);
      for (let i = 0; i < 3; i++) {
        box(pile, 0.16, 0.004, 0.2, i * 0.006, i * 0.005, i * 0.004, 0xf8f5ea, { rough: 0.9 });
      }
      decal(pile, 0.14, 0.05, 0, 0.02, 0.06, signFace(label, { bg: "#f8f5ea", accent: css, scale: 0.4 }), { px: 160 }).rotation.x = -Math.PI / 2;
      box(pile, 0.16, 0.006, 0.02, 0, 0.022, -0.09, tone, { rough: 0.6 });
      holoTag(pile, label, 0, 0.1, 0, { css, w: 0.26 });
      reg(hits, pile, id);
      pileGroups[id] = pile;
    }

    // The referral list left face-up — the hazard.
    const openList = group(referralTable, 0.0, 0.77, 0.2, 0.1);
    box(openList, 0.3, 0.004, 0.19, 0, 0, 0, 0xf8f5ea, { rough: 0.9 });
    decal(openList, 0.29, 0.18, 0, 0.004, 0, paperFace("REFERRALS — NAMES", [
      "A. Okafor  urgent", "L. Nguyen  early", "D. Castro  urgent",
    ], { bg: "#faf7ee", band: "#a5261e" }), { px: 288 }).rotation.x = -Math.PI / 2;
    holoTag(openList, "Names face-up", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, openList, "open-referral-list");

    const sealantRoster = group(referralTable, 0.42, 0.78, 0.18, -0.25);
    box(sealantRoster, 0.17, 0.006, 0.12, 0, 0, 0, 0xdff0e4, { rough: 0.9 });
    decal(sealantRoster, 0.16, 0.11, 0, 0.005, 0, paperFace("SEALANT DAY", [
      "14 children named", "Two sessions",
    ], { bg: "#e4f4e8", band: "#2f7d4a" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(sealantRoster, "Sealant roster", 0, 0.1, 0, { css: SCHSCR_CSS, w: 0.42 });
    reg(hits, sealantRoster, "sealant-roster");

    const schoolCalendar = holoPanel(g, 0.64, 0.44, 2.5, 1.46, 1.35, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,24,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#72c4e0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c8e8f4";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SCHOOL CALENDAR — NOVEMBER", w * 0.05, h * 0.13);
      cx.strokeStyle = "rgba(114,196,224,0.45)";
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
          cx.strokeRect(w * (0.06 + c * 0.18), h * (0.24 + r * 0.24), w * 0.16, h * 0.2);
        }
      }
      cx.fillStyle = "rgba(142,208,127,0.4)";
      cx.fillRect(w * 0.42, h * 0.48, w * 0.16, h * 0.2);
    }, { accent: 0x72c4e0, ry: -1.45 });
    const calendarSlot = box(g, 0.14, 0.1, 0.02, 2.46, 1.42, 1.3, SCHSCR_ACCENT, { emissive: SCHSCR_ACCENT, ei: 0.25, rough: 0.4, opacity: 0.3, transparent: true });
    hits["school-calendar"] = calendarSlot;
    void schoolCalendar;

    const screeningLog = holoPanel(g, 0.6, 0.42, -2.45, 1.44, 0.85, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fd6a0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#cfeedd";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SCREENING LOG", w * 0.06, h * 0.15);
      cx.fillStyle = "#eaf6f0";
      cx.font = `${Math.round(h * 0.086)}px Arial, sans-serif`;
      ["Children screened", "Varnish applied, by dose",
        "Referrals by urgency", "To the state survey"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { accent: 0x8fd6a0, ry: 1.4 });
    reg(hits, screeningLog, "screening-log");

    const nurseBoard = holoPanel(g, 0.58, 0.36, -2.45, 1.42, -1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(14,12,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0b86e"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe2bd";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("NURSE HANDOVER", w * 0.06, h * 0.16);
      cx.fillStyle = "#fff3e4";
      cx.font = `${Math.round(h * 0.095)}px Arial, sans-serif`;
      ["Three urgent, walked in person", "Volunteer: how was it?",
        "Sealant day on the calendar"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.19)));
    }, { accent: 0xf0b86e, ry: 1.4 });
    reg(hits, nurseBoard, "nurse-board");

    // ---------------------------------------------------------- hall furniture
    // Bleachers folded against the wall, and the queue line taped on the floor.
    const bleachers = group(g, 0, 0, -2.65, 0);
    for (let i = 0; i < 3; i++) {
      box(bleachers, 4.4, 0.06, 0.34, 0, 0.2 + i * 0.22, -i * 0.3, SCHSCR_BLEACHER, { rough: 0.7 });
      box(bleachers, 4.4, 0.2, 0.05, 0, 0.1 + i * 0.22, -i * 0.3 - 0.15, 0x5f6a72, { rough: 0.6 });
    }
    box(bleachers, 0.08, 0.9, 1.0, -2.2, 0.45, -0.3, 0x5f6a72, { rough: 0.6, metal: 0.3 });
    box(bleachers, 0.08, 0.9, 1.0, 2.2, 0.45, -0.3, 0x5f6a72, { rough: 0.6, metal: 0.3 });

    const queueTape = group(g, -2.6, 0, 0.9, 0);
    for (let i = 0; i < 4; i++) {
      slab(queueTape, 0.3, 0.004, 0.06, i * 0.45, 0.005, 0, 0xf2c14b, { radius: 0.01, rough: 0.7, cast: false });
    }
    holoTag(g, "Queue", -2.1, 0.3, 0.9, { css: SCHSCR_CSS, w: 0.22 });

    // The volunteer's step-back mark on the floor.
    const volunteerMark = box(g, 0.4, 0.01, 0.4, 1.5, 0.008, 0.55, 0xf0b86e, { emissive: 0xf0b86e, ei: 0.35, rough: 0.5, opacity: 0.4, transparent: true, cast: false });
    ownMaterial(volunteerMark);
    holoTag(g, "Volunteer stands here", 1.5, 0.3, 0.55, { css: SCHSCR_CSS, w: 0.56 });
    reg(hits, volunteerMark, "volunteer-mark");

    // A wall clock and a school notice board, as dress.
    const clock = group(g, 2.5, 0, -2.0, -Math.PI / 2);
    cyl(clock, 0.16, 0.16, 0.04, 0, 1.9, 0, 0xdfe4e6, { rough: 0.5, seg: 20 }).rotation.x = Math.PI / 2;
    cyl(clock, 0.14, 0.14, 0.01, 0, 1.9, 0.026, 0xf8fafb, { rough: 0.3, seg: 20 }).rotation.x = Math.PI / 2;
    box(clock, 0.01, 0.1, 0.006, 0, 1.94, 0.032, 0x2b3138, { rough: 0.5 });
    box(clock, 0.07, 0.01, 0.006, 0.03, 1.9, 0.032, 0x2b3138, { rough: 0.5 });

    const noticeBoard = group(g, -2.5, 0, 2.2, Math.PI / 2);
    box(noticeBoard, 1.2, 0.8, 0.04, 0, 1.5, 0, 0x8a6a42, { rough: 0.8 });
    box(noticeBoard, 1.1, 0.7, 0.02, 0, 1.5, 0.025, 0x4f7f4a, { rough: 0.9 });
    for (let i = 0; i < 3; i++) {
      box(noticeBoard, 0.24, 0.3, 0.004, -0.34 + i * 0.34, 1.5, 0.037, [0xf8f5ea, 0xdfeef4, 0xf6e8d8][i], { rough: 0.9 });
    }

    // ------------------------------------------------------------------- people
    const nurse = standingFigure(g, -2.0, -1.55, { ry: 0.9, cloth: 0x4f7f6f, skin: 0xb98a63, seed: 55 });
    const volunteer = standingFigure(g, 1.5, 0.15, { ry: -2.2, cloth: 0xb08a5a, skin: 0xe0b38a, seed: 59 });
    const teacher = standingFigure(g, 2.7, 0.45, { ry: -2.4, cloth: 0x6b5f7c, skin: 0x8d5a3b, seed: 63 });
    teacher.visible = false;
    const extraChild = standingFigure(g, 1.4, 1.9, { ry: -2.4, cloth: 0xe8b06a, skin: 0xd9a985, seed: 67 });
    extraChild.scale.set(0.8, 0.8, 0.8);
    extraChild.visible = false;
    void nurse;

    let surveying = false, teacherActive = false, restraintActive = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.8, 1.05, -0.6),

      onStep(step) { surveying = step.id === "mirror-survey"; },

      onStepComplete(step) {
        if (step.id === "consent-audit") {
          for (const f of [unsignedForm, noGuardian, languageMismatch]) f.position.y = 0.9;
          notReturned.position.set(0.48, 0.76, 0.36);
        }
        if (step.id === "station-layout") {
          screeningChair.parent.remove(screeningChair);
          g.add(screeningChair);
          screeningChair.position.set(-0.8, 0, -0.65);
          screeningChair.rotation.y = Math.PI;
          layoutMark.material = mat(SCHSCR_ACCENT, { emissive: SCHSCR_ACCENT, ei: 0.12, rough: 0.5, opacity: 0.25 });
        }
        if (step.id === "privacy-screen") {
          privacyScreen.rotation.y = 1.35;
          privacyScreen.position.set(-1.9, 0, 0.35);
        }
        if (step.id === "trauma-informed") {
          kneeStool.position.set(-1.2, 0, -0.75);
          showTellMirror.position.set(0.12, 0.83, 0.2);
        }
        if (step.id === "varnish-dose") bulkTube.visible = false;
        if (step.id === "varnish-set") {
          for (const t of toothSurvey.children) t.material = mat(SCHSCR_VARNISH, { rough: 0.4 });
        }
        if (step.id === "referral-triage") {
          openList.visible = false;
          pileGroups["urgent-pile"].position.y = 0.83;
        }
        if (step.id === "sealant-day") {
          sealantRoster.parent.remove(sealantRoster);
          g.add(sealantRoster);
          sealantRoster.position.set(2.44, 1.42, 1.3);
          sealantRoster.rotation.set(Math.PI / 2, 0, 0);
        }
        if (step.id === "outreach-log") {
          repaint(screeningLog.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,28,20,0.92)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#8fd6a0"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#d8f4e4";
            cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillText("SCREENING LOG — CLOSED", w * 0.06, h * 0.15);
            cx.fillStyle = "#eaf6f0";
            cx.font = `${Math.round(h * 0.086)}px Arial, sans-serif`;
            ["62 screened, 3 declined", "48 varnish, age-dosed",
              "3 urgent / 9 early / 50 routine", "Survey data filed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "child-without-consent") {
          teacherActive = true;
          teacher.visible = true;
          extraChild.visible = true;
          teacher.position.set(0.9, 0, 1.15);
          extraChild.position.set(0.45, 0, 1.2);
        }
        if (it.id === "volunteer-holds-child") {
          restraintActive = true;
          volunteer.position.set(-0.5, 0, -0.1);
          volunteer.rotation.y = -0.6;
        }
      },

      onInterruptEnd(it) {
        if (it.id === "child-without-consent") {
          teacherActive = false;
          if (it.resolved === "answered") {
            teacher.visible = false;
            extraChild.visible = false;
            consentBinder.rotation.x = -0.3;
          }
        }
        if (it.id === "volunteer-holds-child") {
          restraintActive = false;
          volunteerMark.material.emissiveIntensity = 0.35;
          if (it.resolved === "answered") {
            volunteer.position.set(1.5, 0, 0.15);
            volunteer.rotation.y = -2.6;
          }
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (surveying && session?.track) mirrorHead.rotation.z = Math.sin(t * 2.2) * 0.2;
        if (teacherActive) extraChild.position.x = 0.45 + Math.sin(t * 1.6) * 0.06;
        volunteerMark.material.emissiveIntensity = restraintActive ? 1.2 + Math.sin(t * 7) * 0.4 : 0.35;
      },
    };
  },
};
