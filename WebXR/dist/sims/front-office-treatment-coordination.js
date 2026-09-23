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

// SmartCiti.X~ Front Office & Treatment Coordination VR — Dental & Oral Health.
//
// The dental career that never puts a glove on: the front desk and the
// treatment coordinator's chair. A morning of it — the privacy of an open
// counter, a phone call from somebody who says they are the spouse, a pre-
// authorisation built out of a narrative and the right procedure code rather
// than a guessed one, a treatment plan presented in a room with a door, a
// financial conversation that offers options without leaning on anybody, and
// a records request answered the way the Privacy Rule's right of access says
// it has to be.
//
// The privacy law named is HIPAA, and its Privacy Rule's right of access is
// named as a right with an outer time limit rather than by a clause number.
// The procedure code set is the ADA's Code on Dental Procedures and
// Nomenclature. Who may present a treatment plan and who must obtain the
// informed consent is set by the state dental practice act, which differs by
// state — this station asks the learner to work to theirs.

const FRONTC_ACCENT = 0xe0a463;
const FRONTC_CSS = "#e0a463";
const FRONTC_WOOD = 0x9a744c;
const FRONTC_DESK = 0xe8e2d6;
const FRONTC_UPHOLSTERY = 0x4f6b78;
const FRONTC_CARPET = 0x8a8f87;

export const SIM_FRONT_OFFICE_TREATMENT_COORDINATION = {
  id: "front-office-treatment-coordination",
  index: "214",
  domain: "Dental & Oral Health",
  trade: "Dental front office treatment coordinator",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "HIPAA's Privacy Rule and Security Rule, including the minimum-necessary standard, the requirement for reasonable safeguards at an open counter, and the right of access that sets an outer limit on answering a patient's own records request; the ADA's Code on Dental Procedures and Nomenclature (CDT) as the only source for the procedure code that goes on a claim; the state dental practice act on who may present a treatment plan and who must obtain the informed consent behind it; the American Dental Assistants Association (ADAA) for the administrative and chairside credential path; the federal Truth in Lending Act's disclosure requirements for any in-office financing agreement; OSHA 29 CFR 1910.1030 bloodborne pathogens, which covers front-office staff who handle a contaminated chart or a specimen hand-off; SEIU and UFCW as the unions representing clinic and front-office staff in organised practices",
  name: "Front Office & Treatment Coordination",
  title: simTitle("Front Office & Treatment Coordination"),
  tagline: "Privacy at an open counter and on the phone, a pre-authorisation built on a real code, a plan presented behind a door, payment options without pressure, and a records request answered right",
  accent: FRONTC_ACCENT,
  accentCss: FRONTC_CSS,
  parSeconds: 280,
  footprint: 2.3,
  badge: { id: "desk-discipline", name: "Desk Discipline", note: "A morning at the desk with nothing disclosed that did not have to be and nothing coded from memory" },

  game: system({
    name: "Front Office Practice",
    currency: "LEDGER",
    ranks: ["Front Desk Trainee", "Scheduling Coordinator", "Insurance Coordinator", "Treatment Coordinator", "Business Office Lead"],
    badges: [
      { id: "minimum-necessary", name: "Minimum Necessary", note: "Nothing disclosed beyond what the caller was entitled to", test: AWARD.stepClean("phone-privacy") },
      { id: "nothing-guessed", name: "Nothing Guessed", note: "No unsafe action anywhere in the morning", test: AWARD.safe },
      { id: "honest-estimate", name: "Honest Estimate", note: "The estimate committed inside what the breakdown actually supports", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-morning", name: "Clean Morning", note: "No corrections anywhere in the morning", test: AWARD.clean },
      { id: "held-the-room", name: "Held The Room", note: "Every timed hold carried to full duration first time", test: AWARD.unbroken },
      { id: "before-the-hygienist", name: "Before The Hygienist", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "lobby-screen": "That second workstation is still logged in with the day's schedule on it, angled straight at the waiting room. Every name, every procedure and every balance on that screen is protected health information, and HIPAA's requirement for reasonable safeguards is exactly about a screen like this one — a terminal facing the lobby discloses to everyone who sits down, all day, without anybody choosing to disclose anything.",
    "lobby-chair": "That is the waiting room, and a treatment plan cannot be discussed there. The people either side of that chair will hear the tooth, the diagnosis and the number, and nothing about a quiet voice changes the fact that the conversation had somewhere private to go and did not go there.",
    "guessed-code": "That sticky note is a procedure code somebody wrote down from memory. A code that was not looked up in the ADA's CDT set is a guess submitted on a claim under the practice's own name — it gets the claim denied at best, and at worst it is a misrepresentation of what was done to a patient, which is a fraud exposure rather than a paperwork error.",
    "pressure-card": "That is the same-day discount card, and it does not belong in this conversation. A financial presentation offers options and a written estimate; an offer that expires if the patient leaves the room is pressure applied to somebody deciding about their own body, and consent given under that is not the informed consent the practice act asks for.",
  },

  lateNotes: {
    "consent-signature": "Not yet. Nothing is signed until the plan has actually been presented and the alternatives — including doing nothing — have been laid out and understood.",
    "records-envelope": "Hold off. Nothing goes in an envelope until the requester's authorisation has been checked and the request has been logged.",
    "day-sheet": "The morning is not finished. The day sheet is reconciled against what actually happened, at the end, not filled in ahead of it.",
  },

  steps: [
    {
      id: "privacy-sweep", kind: "find", noHint: true,
      targets: ["counter-chart", "sign-in-sheet", "desk-speakerphone"],
      itemNames: {
        "counter-chart": "the open chart on the counter",
        "sign-in-sheet": "the sign-in sheet listing names",
        "desk-speakerphone": "the phone left on speaker",
      },
      itemNotes: {
        "counter-chart": "An open chart on a counter faces whoever is standing at it. Turned face-down or closed, it discloses nothing; left open it discloses a diagnosis and a balance to the next person who leans on the counter to sign something.",
        "sign-in-sheet": "A sign-in sheet that accumulates a column of names is a disclosure to every patient who signs below them. A single-line slip, or a sheet with the earlier names covered, gives the practice the same information without handing the morning's patient list to the room.",
        "desk-speakerphone": "A phone on speaker at an open counter puts the caller's half of the conversation into the waiting room as well as yours. HIPAA's minimum-necessary standard is about what is said; the speaker setting is about how far it carries, and the lobby is well inside that range.",
      },
      title: "Sweep the counter for what it is disclosing",
      cue: "Before the first patient arrives: three things at this desk are telling the waiting room something.",
      why: "A front desk discloses protected health information by default rather than by decision, because it is an open counter in a room full of strangers and everything on it faces outward. HIPAA's requirement is for reasonable safeguards rather than perfection, and the reasonable ones here cost nothing: a chart turned over, a sign-in sheet that does not accumulate, a handset instead of a speaker. Finding them before the morning starts is the only time it is cheap.",
    },
    {
      id: "screen-swivel", kind: "turn", target: "monitor-arm",
      title: "Turn the screen off the lobby sightline",
      cue: "Swivel the monitor on its arm until nothing on it can be read from the waiting room.",
      why: "The schedule on this screen is the whole morning's protected health information in one view — names, procedures, balances — and the only thing between it and the waiting room is the angle it is sitting at. A privacy filter helps and an angle helps more; either way this is the safeguard that has to be re-made every time somebody moves the monitor to see it better, which is daily.",
      turn: { turns: 1, axis: "y", label: "SCREEN ANGLE" },
    },
    {
      id: "identity-verify", kind: "select", target: "id-verify-panel",
      title: "Verify who you are talking to",
      cue: "Confirm the patient's identity on two identifiers before anything about their care is discussed.",
      why: "Two identifiers is the floor because names repeat, families share them, and the wrong chart opened confidently is how one patient's history ends up attached to another patient's treatment. It also protects the disclosure itself: everything you are about to say is only allowed to be said to the person it is about, and the verification is the step that establishes that is who is standing there.",
    },
    {
      id: "phone-privacy", kind: "hold", target: "private-phone", seconds: 7,
      title: "Take the call away from the counter",
      cue: "Move the call to the handset in the back office and keep it to the minimum necessary.",
      why: "A call at an open counter is a broadcast, and the caller cannot tell you are in a lobby. Moving it to a handset in a room with a door is what makes the minimum-necessary standard achievable at all — and holding the call there for its whole length matters, because the part that carries is always the part at the end where somebody reads a balance out loud to be helpful.",
      holdBreakNote: "You came back out to the counter mid-call. Whatever is said from there is said to the waiting room as well, and the most sensitive part of a call is almost never the beginning.",
    },
    {
      id: "schedule-block", kind: "drag", target: "appointment-card",
      title: "Block the appointment in the right column",
      cue: "Put the appointment in the provider and operatory column that can actually deliver it.",
      why: "A scheduled appointment is a promise about a specific chair, a specific provider and a specific length, and one dropped into the wrong column produces a patient sitting in a waiting room while the only person licensed to do their procedure is two rooms away with somebody else. Scheduling is the front office's real clinical function: everything downstream of it inherits whatever it got wrong.",
      drag: { to: "schedule-slot", radius: 0.36, missNote: "Not in a column that works. An appointment parked in the wrong provider's column is a patient who will arrive on time to nothing." },
    },
    {
      id: "preauth-packet", kind: "sequence",
      targets: ["narrative-form", "radiograph-attachment", "perio-chart-copy", "claim-form"],
      itemNames: {
        "narrative-form": "the clinical narrative",
        "radiograph-attachment": "the radiographs",
        "perio-chart-copy": "the periodontal chart",
        "claim-form": "the pre-authorisation form",
      },
      title: "Build the pre-authorisation",
      cue: "Narrative first, then the radiographs and the periodontal chart, and the form last.",
      why: "A pre-authorisation is decided by a reviewer who has never seen this patient, so it lives or dies on the narrative explaining why, the images showing it and the chart measuring it — assembled in that order, because the form is filled in from the evidence rather than the evidence gathered to match a form already written. Sending it thin is how a plan the patient has already agreed to comes back denied.",
      outOfOrderNote: "Out of order. The narrative frames what the attachments are evidence of, and the form is completed from both — starting at the form means writing the claim before knowing what supports it.",
    },
    {
      id: "code-lookup", kind: "select", target: "cdt-code-book",
      title: "Look the procedure code up",
      cue: "Find the code in the ADA's CDT set for exactly the procedure that was recorded — no more, no less.",
      why: "Every code on a claim is a statement about what was done to a person, made by the practice, under its own name. The ADA's Code on Dental Procedures and Nomenclature exists so that statement means the same thing to the reviewer as it does to the dentist, and it changes year to year — which is why a code recalled from memory is not a shortcut but a different claim from the one the chart supports.",
    },
    {
      id: "benefit-estimate", kind: "gauge", target: "benefit-calculator",
      title: "Estimate the patient's portion honestly",
      cue: "Work the breakdown — annual maximum, frequency limits, waiting periods — and commit the estimate it supports.",
      why: "An estimate is the number the patient plans their month around, so the temptation is to quote it low and let the statement correct it later. It cannot be corrected later: the patient made a decision on the number you gave them. Committing inside what the benefit breakdown actually supports — and saying out loud that it is an estimate rather than a guarantee — is the only version of this that survives the explanation of benefits arriving.",
      gauge: {
        label: "PATIENT PORTION", speed: 0.5, green: [0.44, 0.64],
        readout: (t) => `${Math.round(t * 100)}% of fee to patient`,
        missNote: "Outside what the breakdown supports. Quoted low, this is the call in six weeks where a patient who trusted the number finds out it was optimistic.",
      },
    },
    {
      id: "plan-presentation", kind: "track", target: "plan-board", seconds: 8,
      title: "Present the plan at the patient's pace",
      cue: "In the consultation room, with the door closed — work through the findings, the options and the sequence, and let them keep up.",
      why: "A treatment plan presented too fast is a plan that was announced rather than explained, and one delivered too slowly turns into a sales meeting; the band between those is where a patient actually understands what is wrong, what the choices are and what each one involves. What the state dental practice act reserves to the dentist — the diagnosis and the informed consent behind it — is the part the coordinator presents rather than decides.",
      track: {
        start: 0.14, green: [0.38, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "PATIENT'S PACE",
        readout: (v) => (v < 0.38 ? "racing ahead of them" : v > 0.62 ? "stalling — it reads as a pitch" : "with them"),
      },
      holdBreakNote: "You lost the patient's pace. A plan explained past somebody's understanding produces a nod rather than a decision, and a nod is not the consent anybody needs here.",
    },
    {
      id: "informed-consent", kind: "select", target: "consent-signature",
      title: "Take the informed consent",
      cue: "Confirm the risks, the alternatives and the cost have all been covered — then take the signature.",
      why: "Informed consent is the conversation, and the signature is only the evidence that it happened: risks, alternatives including doing nothing, and what it will cost. The state dental practice act decides which parts of that the dentist must deliver personally, and a coordinator's job is to make sure the patient has actually had them rather than to substitute for them.",
    },
    {
      id: "payment-options", kind: "find", noHint: true,
      targets: ["written-estimate", "financing-disclosure", "no-treatment-option"],
      itemNames: {
        "written-estimate": "the written estimate",
        "financing-disclosure": "the financing disclosure",
        "no-treatment-option": "the option of not treating today",
      },
      itemNotes: {
        "written-estimate": "The estimate goes home in writing, with the codes and the fees on it, because a number said out loud in a consultation room is a number that will be remembered differently by both people in a fortnight.",
        "financing-disclosure": "Any in-office financing agreement carries the federal Truth in Lending Act's disclosure requirements — what the terms are, what it costs — and those are given before signing rather than summarised as monthly payments.",
        "no-treatment-option": "Declining or deferring treatment is one of the options, and it is presented as one. A patient who leaves knowing what happens if they wait has actually been informed; one who leaves feeling they had no choice has been sold to.",
      },
      title: "Lay out the financial options without leaning on anybody",
      cue: "Three things make this a presentation of options rather than a close. Find all three.",
      why: "A financial conversation in a dental office happens minutes after somebody has been told they need work done, which is exactly when they are least able to push back on pressure. Written figures rather than spoken ones, real disclosure on any credit arrangement, and the deferral option offered out loud are what keep this a decision the patient makes — and they are also what the practice will want on record if the decision is ever questioned.",
    },
    {
      id: "records-request", kind: "sequence",
      targets: ["authorization-check", "records-log", "records-envelope"],
      itemNames: {
        "authorization-check": "the requester's authorisation",
        "records-log": "the disclosure log",
        "records-envelope": "the records, sent",
      },
      title: "Answer the records request properly",
      cue: "Check who is entitled to it, log the disclosure, then send it inside the time the right of access allows.",
      why: "A records request is answered in that order because the middle step is the one nobody remembers: a disclosure that was not logged cannot be accounted for afterwards, and an accounting is exactly what a patient is entitled to ask for. HIPAA's right of access also puts an outer limit on how long the practice may take, so a request that sits in a tray until somebody has time is a request that is already running late.",
      outOfOrderNote: "Out of order. Entitlement is established before anything is copied, the disclosure is logged as it goes out rather than afterwards, and only then does anything leave the building.",
    },
    {
      id: "daysheet-log", kind: "select", target: "day-sheet",
      title: "Reconcile the day sheet",
      cue: "Close the morning out: consents taken, the pre-authorisation sent, the records disclosure logged, payments balanced.",
      why: "The day sheet is what makes a front office auditable — every consent, every claim, every disclosure and every payment against what actually happened rather than what was meant to. It is also the handover: the coordinator on the afternoon shift picks up exactly what this reconciliation leaves them, and the items it quietly omits are the ones that surface a month later with nobody's name on them.",
    },
    {
      id: "team-huddle", kind: "select", target: "huddle-board",
      title: "Huddle with the clinical team",
      cue: "Walk the afternoon's schedule with the assistants and the hygienist, and check in on how the front of the house is holding up.",
      why: "The clinical team cannot see the waiting room and the front desk cannot see the operatories, so the huddle is the only point at which either finds out what the other is about to walk into. It is also the moment to say out loud that the desk has taken three angry calls before ten o'clock — front-office staff absorb that on their own all day, and a huddle that only covers the schedule has decided that part is not work.",
    },
  ],

  interrupts: [
    {
      id: "caller-claims-spouse",
      kind: "Unverified caller",
      after: "phone-privacy", delay: 3, seconds: 13,
      alert: "The caller now wants their wife's appointment time and what she is having done — they say they are her husband and they booked it.",
      cue: "Check whether there is anything on file that lets you tell them.",
      target: "authorization-check",
      why: "A family relationship is not by itself authority over somebody else's protected health information, and a voice on a phone is not evidence of a relationship either. What decides it is what is on file — an authorisation, or a personal representative recorded on the chart — and checking that is the whole answer, whether it comes back yes or no.",
      missNote: "The appointment and the procedure went down the phone to somebody whose entitlement was never checked. If the caller was who they said, nothing happened; if they were not, the practice disclosed a diagnosis to a stranger and will never know which of the two it was.",
      wrongNote: "It is the authorisation on file. Not the schedule, not the chart — the question is whether this caller is allowed to be told, and only the file answers it.",
    },
    {
      id: "second-patient-in-doorway",
      kind: "Privacy breach in progress",
      after: "plan-presentation", delay: 4, seconds: 12,
      alert: "Another patient has followed you in and is standing in the consultation room doorway, well inside earshot of the plan and the balance.",
      cue: "Close the door before another word of this is said.",
      target: "consult-door",
      why: "This conversation has a tooth, a diagnosis and a number in it, and the room was chosen so that none of those left it. A door standing open makes the private room exactly as private as the counter, and the fix takes two seconds — lowering your voice and carrying on is choosing to keep disclosing while sounding discreet about it.",
      missNote: "The plan, the diagnosis and the balance were all said with somebody else standing in the doorway. The patient in the chair now knows their neighbours heard it, which is the part that follows them, and the practice has no record of a disclosure it never meant to make.",
      wrongNote: "It is the door. The presentation is not the problem — the problem is that the room has stopped being a room, and nothing else you reach for fixes that.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, FRONTC_ACCENT);

    const carpetTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#8f948c", base2: "#868b83", seam: "rgba(0,0,0,0.12)",
    }), { repeat: 6, px: 256 });
    const deskTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#efe9dc", base2: "#e4ddce", seam: "rgba(0,0,0,0.06)",
    }), { repeat: 3, px: 256 });
    const floor = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xffffff, { radius: 0.06, rough: 0.92, cast: false });
    floor.material = texturedMat(carpetTex, { rough: 0.92, metal: 0.02, color: FRONTC_CARPET });

    // ------------------------------------------------------------- the counter
    const counter = group(g, 0, 0, -1.15, 0.05);
    box(counter, 2.6, 0.72, 0.56, 0, 0.36, 0, FRONTC_WOOD, { rough: 0.62, finish: "painted", tile: 2 });
    const worktop = slab(counter, 2.68, 0.05, 0.62, 0, 0.74, 0, 0xffffff, { radius: 0.012, rough: 0.4 });
    worktop.material = texturedMat(deskTex, { rough: 0.4, metal: 0.05, color: 0xffffff });
    // The raised transaction ledge on the lobby side — the thing that makes the
    // desk an open counter.
    box(counter, 2.68, 0.26, 0.14, 0, 0.98, 0.3, FRONTC_WOOD, { rough: 0.6, finish: "painted", tile: 2 });
    const ledge = slab(counter, 2.72, 0.04, 0.2, 0, 1.12, 0.3, 0xf2ece0, { radius: 0.01, rough: 0.4 });
    void ledge;
    for (let i = 0; i < 2; i++) {
      box(counter, 1.2, 0.6, 0.02, -0.64 + i * 1.28, 0.38, -0.28, 0xd8d2c4, { rough: 0.55 });
      box(counter, 0.28, 0.018, 0.026, -0.64 + i * 1.28, 0.6, -0.295, 0x8e8a80, { rough: 0.4, metal: 0.55 });
    }

    // The coordinator's monitor, on a swivel arm.
    const monitorBase = group(counter, -0.55, 0.76, -0.1);
    cyl(monitorBase, 0.09, 0.11, 0.02, 0, 0.01, 0, 0x2f343a, { rough: 0.45, metal: 0.4, seg: 16 });
    const monitorArm = group(monitorBase, 0, 0.02, 0);
    cyl(monitorArm, 0.016, 0.016, 0.24, 0, 0.12, 0, 0x3c4249, { rough: 0.4, metal: 0.6, seg: 10 });
    const monitorHead = group(monitorArm, 0, 0.36, 0);
    box(monitorHead, 0.46, 0.28, 0.025, 0, 0, 0, 0x24292e, { rough: 0.45, metal: 0.2 });
    const monitorFace = decal(monitorHead, 0.42, 0.24, 0, 0, 0.015,
      paperFace("TODAY'S SCHEDULE", ["08:20  crown prep", "09:00  recall + BW", "10:15  consult"], { bg: "#e8f0f6", band: "#2f6f86" }), { px: 320 });
    holoTag(monitorArm, "Screen angle", 0, 0.58, 0, { css: FRONTC_CSS, w: 0.34 });
    reg(hits, monitorArm, "monitor-arm");

    const keyboard = box(counter, 0.4, 0.02, 0.14, -0.55, 0.77, 0.08, 0x2b3036, { rough: 0.6 });
    for (let c = 0; c < 4; c++) {
      box(counter, 0.07, 0.008, 0.09, -0.68 + c * 0.08, 0.785, 0.06, 0x3c4249, { rough: 0.7 });
    }
    void keyboard;

    // The open chart, the sign-in sheet and the speakerphone — the sweep.
    const counterChart = group(counter, 0.35, 0.76, 0.06, -0.2);
    box(counterChart, 0.24, 0.006, 0.3, 0, 0, 0, 0xb4643c, { rough: 0.75 });
    box(counterChart, 0.22, 0.004, 0.28, 0, 0.006, 0, 0xf8f4e8, { rough: 0.9 });
    decal(counterChart, 0.2, 0.25, 0, 0.009, 0, paperFace("PATIENT CHART", [
      "Dx: caries UR6 distal", "Plan: crown, build-up", "Balance: open",
    ], { bg: "#f8f4e8", band: "#b4643c" }), { px: 256 }).rotation.x = -Math.PI / 2;
    holoTag(counterChart, "Chart open", 0, 0.12, 0, { css: "#f0b86e", w: 0.32 });
    reg(hits, counterChart, "counter-chart");

    const signIn = group(counter, 0.98, 1.14, 0.3, 0.1);
    box(signIn, 0.2, 0.004, 0.14, 0, 0, 0, 0xf6f2e6, { rough: 0.9 });
    decal(signIn, 0.18, 0.12, 0, 0.004, 0, paperFace("SIGN IN", [
      "1. J. R.", "2. M. T.", "3. ______",
    ], { bg: "#fbf8ee", band: "#8e8a80" }), { px: 192 }).rotation.x = -Math.PI / 2;
    box(signIn, 0.02, 0.012, 0.11, 0.12, 0.006, 0, 0x2f5f7c, { rough: 0.5 });
    holoTag(signIn, "Sign-in sheet", 0, 0.12, 0, { css: "#f0b86e", w: 0.38 });
    reg(hits, signIn, "sign-in-sheet");

    const speakerphone = group(counter, -1.06, 0.76, 0.04, 0.3);
    box(speakerphone, 0.16, 0.05, 0.19, 0, 0.025, 0, 0x2b3036, { rough: 0.5 });
    box(speakerphone, 0.13, 0.035, 0.06, 0, 0.065, -0.05, 0x3c4249, { rough: 0.5 });
    for (let i = 0; i < 3; i++) {
      box(speakerphone, 0.024, 0.008, 0.05, -0.05 + i * 0.05, 0.052, 0.01, 0x51585f, { rough: 0.6 });
    }
    const speakerLamp = box(speakerphone, 0.04, 0.008, 0.02, 0.05, 0.052, -0.06, 0x8fd6a0, { emissive: 0x8fd6a0, ei: 0.9, rough: 0.4, cast: false });
    ownMaterial(speakerLamp);
    holoTag(speakerphone, "On speaker", 0, 0.14, 0, { css: "#f0b86e", w: 0.32 });
    reg(hits, speakerphone, "desk-speakerphone");

    // The identity check, as a small terminal panel on the desk.
    const idPanel = holoPanel(g, 0.42, 0.26, 0.95, 1.36, -1.3, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = FRONTC_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffdcb0";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("VERIFY IDENTITY", w * 0.07, h * 0.2);
      cx.fillStyle = "#fff2e2";
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      ["Full name", "Date of birth", "Two identifiers, both"].forEach((l, i) => cx.fillText(l, w * 0.07, h * (0.46 + i * 0.19)));
    }, { accent: FRONTC_ACCENT, ry: -0.3 });
    reg(hits, idPanel, "id-verify-panel");

    // The unattended, logged-in terminal at the far end — the hazard.
    const lobbyTerminal = group(counter, 1.05, 0.76, -0.08, 0.5);
    cyl(lobbyTerminal, 0.08, 0.1, 0.02, 0, 0.01, 0, 0x2f343a, { rough: 0.45, metal: 0.4, seg: 14 });
    cyl(lobbyTerminal, 0.014, 0.014, 0.2, 0, 0.12, 0, 0x3c4249, { rough: 0.4, metal: 0.6, seg: 10 });
    const lobbyScreen = box(lobbyTerminal, 0.38, 0.24, 0.022, 0, 0.32, 0, 0x24292e, { rough: 0.45, metal: 0.2 });
    decal(lobbyTerminal, 0.34, 0.2, 0, 0.32, 0.013, paperFace("LOGGED IN", [
      "J. RIVERA  crown", "M. TAN  perio", "Balances shown",
    ], { bg: "#dfe9f2", band: "#a5261e" }), { px: 256 });
    holoTag(lobbyTerminal, "Facing the lobby", 0, 0.52, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, lobbyScreen, "lobby-screen");

    // The guessed code on a sticky note — the hazard.
    const guessedCode = group(counter, -0.2, 1.14, 0.3, -0.1);
    box(guessedCode, 0.07, 0.003, 0.07, 0, 0, 0, 0xf2e07a, { rough: 0.9 });
    decal(guessedCode, 0.065, 0.065, 0, 0.003, 0, signFace("D2740?", { bg: "#f6e68e", accent: "#a5261e", scale: 0.42 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(guessedCode, "From memory", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, guessedCode, "guessed-code");

    // ---------------------------------------------------- back office / phone
    const backOffice = group(g, -2.25, 0, -0.5, 0.9);
    box(backOffice, 0.08, 2.2, 1.9, 0, 1.1, 0, 0xe6e2d8, { rough: 0.7 });
    box(backOffice, 0.1, 1.05, 0.08, 0.02, 1.4, 0.62, 0xbfb8aa, { rough: 0.6 });
    const backDesk = group(backOffice, 0.42, 0, -0.35);
    box(backDesk, 0.7, 0.7, 0.5, 0, 0.35, 0, FRONTC_DESK, { rough: 0.55 });
    const backTop = slab(backDesk, 0.76, 0.04, 0.54, 0, 0.72, 0, 0xffffff, { radius: 0.01, rough: 0.4 });
    backTop.material = texturedMat(deskTex, { rough: 0.4, metal: 0.05, color: 0xffffff });
    const privatePhone = group(backDesk, 0, 0.74, 0);
    box(privatePhone, 0.15, 0.05, 0.18, 0, 0.025, 0, 0x33393f, { rough: 0.5 });
    const handset = box(privatePhone, 0.055, 0.045, 0.18, -0.06, 0.06, 0, 0x2b3036, { rough: 0.5 });
    handset.rotation.z = 0.06;
    for (let i = 0; i < 4; i++) {
      box(privatePhone, 0.022, 0.007, 0.018, 0.0 + (i % 2) * 0.032, 0.052, -0.04 + Math.floor(i / 2) * 0.03, 0x4a5157, { rough: 0.6 });
    }
    holoTag(privatePhone, "Back office handset", 0, 0.18, 0, { css: FRONTC_CSS, w: 0.5 });
    reg(hits, privatePhone, "private-phone");

    // The caller panel the interruption raises.
    const callerPanel = holoPanel(g, 0.5, 0.3, -1.85, 1.5, 0.35, (cx, w, h) => {
      cx.fillStyle = "rgba(28,10,10,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffd8d4";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("CALLER ON LINE 1", w * 0.07, h * 0.2);
      cx.fillStyle = "#ffeceb";
      cx.font = `${Math.round(h * 0.115)}px Arial, sans-serif`;
      ["\"I'm her husband\"", "Wants time + procedure", "Nothing on file yet"].forEach((l, i) => cx.fillText(l, w * 0.07, h * (0.46 + i * 0.19)));
    }, { accent: 0xf0645b, ry: 0.7 });
    callerPanel.visible = false;

    // The authorisation binder.
    const authBinder = group(backDesk, 0.0, 0.74, 0.3, -0.2);
    box(authBinder, 0.2, 0.06, 0.26, 0, 0.03, 0, 0x3f6f7c, { rough: 0.7 });
    box(authBinder, 0.19, 0.045, 0.25, 0, 0.035, 0.005, 0xf6f2e6, { rough: 0.9 });
    decal(authBinder, 0.16, 0.2, 0, 0.061, 0.005, paperFace("AUTHORISATIONS", [
      "Personal reps on file", "Release forms", "Signed + dated",
    ], { bg: "#f8f5ea", band: "#2f6f86" }), { px: 256 }).rotation.x = -Math.PI / 2;
    holoTag(authBinder, "Authorisation on file", 0, 0.16, 0, { css: FRONTC_CSS, w: 0.54 });
    reg(hits, authBinder, "authorization-check");

    // ------------------------------------------------------------- scheduling
    const scheduleBoard = holoPanel(g, 0.76, 0.5, -0.9, 1.56, -2.4, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = FRONTC_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffdcb0";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SCHEDULE — OP 1 / OP 2 / HYG", w * 0.05, h * 0.13);
      for (let c = 0; c < 3; c++) {
        cx.strokeStyle = "rgba(224,164,99,0.5)";
        cx.strokeRect(w * (0.06 + c * 0.31), h * 0.22, w * 0.28, h * 0.68);
      }
      cx.fillStyle = "rgba(143,214,160,0.35)";
      cx.fillRect(w * 0.375, h * 0.3, w * 0.26, h * 0.16);
      cx.fillStyle = "#fff2e2";
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillText("OPEN 10:15", w * 0.39, h * 0.38);
    }, { accent: FRONTC_ACCENT });
    const scheduleSlot = box(g, 0.22, 0.14, 0.02, -0.82, 1.62, -2.36, 0x8fd6a0, { emissive: 0x8fd6a0, ei: 0.2, rough: 0.4, opacity: 0.3, transparent: true });
    hits["schedule-slot"] = scheduleSlot;
    void scheduleBoard;

    const appointmentCard = group(counter, -0.2, 0.77, -0.16, 0.25);
    box(appointmentCard, 0.12, 0.004, 0.08, 0, 0, 0, 0xf6f2e6, { rough: 0.85 });
    decal(appointmentCard, 0.11, 0.07, 0, 0.004, 0, signFace("10:15 CONSULT", { bg: "#fbf8ee", accent: "#2f6f86", scale: 0.3 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(appointmentCard, "Appointment", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.34 });
    reg(hits, appointmentCard, "appointment-card");

    // ------------------------------------------------- insurance / pre-auth bay
    const insuranceDesk = group(g, 2.1, 0, -1.2, -0.85);
    box(insuranceDesk, 1.0, 0.7, 0.54, 0, 0.35, 0, FRONTC_DESK, { rough: 0.55 });
    const insTop = slab(insuranceDesk, 1.06, 0.04, 0.58, 0, 0.72, 0, 0xffffff, { radius: 0.01, rough: 0.4 });
    insTop.material = texturedMat(deskTex, { rough: 0.4, metal: 0.05, color: 0xffffff });
    box(insuranceDesk, 0.94, 0.58, 0.02, 0, 0.36, 0.27, 0xd8d2c4, { rough: 0.55 });
    box(insuranceDesk, 0.24, 0.016, 0.024, 0, 0.56, 0.285, 0x8e8a80, { rough: 0.4, metal: 0.55 });

    const narrative = group(insuranceDesk, -0.34, 0.74, -0.06);
    box(narrative, 0.15, 0.004, 0.2, 0, 0, 0, 0xf8f5ea, { rough: 0.9 });
    decal(narrative, 0.14, 0.18, 0, 0.004, 0, paperFace("NARRATIVE", [
      "Distal caries to pulp", "Restoration failed x2", "Crown indicated",
    ], { bg: "#f8f5ea", band: "#2f6f86" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(narrative, "Narrative", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.3 });
    reg(hits, narrative, "narrative-form");

    const radiographAttachment = group(insuranceDesk, -0.1, 0.74, -0.06);
    box(radiographAttachment, 0.13, 0.004, 0.1, 0, 0, 0, 0x101820, { rough: 0.5 });
    for (let i = 0; i < 3; i++) {
      box(radiographAttachment, 0.024, 0.003, 0.055, -0.036 + i * 0.036, 0.004, 0, 0xcdd8dc, { rough: 0.35 });
    }
    holoTag(radiographAttachment, "Radiographs", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.36 });
    reg(hits, radiographAttachment, "radiograph-attachment");

    const perioCopy = group(insuranceDesk, 0.14, 0.74, -0.06);
    box(perioCopy, 0.15, 0.004, 0.19, 0, 0, 0, 0xf4f6f0, { rough: 0.9 });
    decal(perioCopy, 0.14, 0.17, 0, 0.004, 0, paperFace("PERIO CHART", [
      "Probing depths", "Recession, mobility", "Dated today",
    ], { bg: "#f4f8f0", band: "#4f7f6f" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(perioCopy, "Perio chart", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.34 });
    reg(hits, perioCopy, "perio-chart-copy");

    const claimForm = group(insuranceDesk, 0.38, 0.74, -0.06, 0.1);
    box(claimForm, 0.16, 0.004, 0.21, 0, 0, 0, 0xeef2f6, { rough: 0.9 });
    decal(claimForm, 0.15, 0.19, 0, 0.004, 0, paperFace("PRE-AUTH", [
      "Procedure code: ____", "Attachments: ____", "Provider signature",
    ], { bg: "#eff4f8", band: "#a5261e" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(claimForm, "Pre-auth form", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.38 });
    reg(hits, claimForm, "claim-form");

    const codeBook = group(insuranceDesk, 0.38, 0.74, 0.16, -0.25);
    box(codeBook, 0.17, 0.05, 0.23, 0, 0.025, 0, 0x8a2f34, { rough: 0.7 });
    box(codeBook, 0.16, 0.04, 0.22, 0, 0.03, 0.004, 0xf8f5ea, { rough: 0.9 });
    decal(codeBook, 0.14, 0.18, 0, 0.051, 0.004, paperFace("CDT CODE SET", [
      "Current year", "ADA nomenclature", "Look it up, every time",
    ], { bg: "#f8f5ea", band: "#8a2f34" }), { px: 256 }).rotation.x = -Math.PI / 2;
    holoTag(codeBook, "CDT code set", 0, 0.16, 0, { css: FRONTC_CSS, w: 0.4 });
    reg(hits, codeBook, "cdt-code-book");

    const calculator = group(insuranceDesk, -0.34, 0.74, 0.18, 0.2);
    box(calculator, 0.11, 0.02, 0.16, 0, 0.01, 0, 0x2f343a, { rough: 0.5 });
    const calcFace = decal(calculator, 0.09, 0.04, 0, 0.021, -0.05,
      signFace("BREAKDOWN", { bg: "#101a1e", accent: FRONTC_CSS, fg: "#ffe4c4", scale: 0.4 }), { glow: true, ei: 0.8, px: 192 });
    calcFace.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      box(calculator, 0.022, 0.006, 0.022, -0.03 + (i % 3) * 0.03, 0.022, -0.01 + Math.floor(i / 3) * 0.03, 0x4a5157, { rough: 0.6 });
    }
    holoTag(calculator, "Benefit breakdown", 0, 0.12, 0, { css: FRONTC_CSS, w: 0.5 });
    reg(hits, calculator, "benefit-calculator");

    // ------------------------------------------------------- consultation room
    const consultRoom = group(g, 2.7, 0, 1.85, -1.25);
    box(consultRoom, 2.0, 2.2, 0.08, 0, 1.1, 0.55, 0xe6e2d8, { rough: 0.7 });
    box(consultRoom, 0.08, 2.2, 1.2, -0.96, 1.1, 0, 0xe6e2d8, { rough: 0.7 });
    const consultDoor = group(consultRoom, 0.62, 0, -0.02);
    const doorLeaf = box(consultDoor, 0.78, 2.02, 0.05, 0.39, 1.01, 0, 0xc4a171, { rough: 0.6, finish: "painted", tile: 2 });
    doorLeaf.rotation.y = -1.1;
    ball(consultDoor, 0.03, 0.72, 1.0, 0.06, 0xb9a06a, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(consultDoor, "Consult door", 0.3, 1.8, 0, { css: FRONTC_CSS, w: 0.36 });
    reg(hits, consultDoor, "consult-door");

    const consultTable = group(consultRoom, -0.2, 0, -0.35);
    box(consultTable, 0.9, 0.06, 0.6, 0, 0.72, 0, FRONTC_WOOD, { rough: 0.55, finish: "painted", tile: 2 });
    for (const dx of [-0.38, 0.38]) {
      box(consultTable, 0.05, 0.7, 0.5, dx, 0.35, 0, 0x6f5a3c, { rough: 0.6 });
    }
    const consultChair = group(consultRoom, -0.2, 0, 0.18);
    box(consultChair, 0.42, 0.06, 0.42, 0, 0.44, 0, FRONTC_UPHOLSTERY, { rough: 0.85 });
    box(consultChair, 0.42, 0.5, 0.06, 0, 0.7, -0.18, FRONTC_UPHOLSTERY, { rough: 0.85 });
    for (const dx of [-0.17, 0.17]) {
      box(consultChair, 0.04, 0.42, 0.38, dx, 0.21, 0, 0x4a5157, { rough: 0.5, metal: 0.4 });
    }
    const consultPatient = seatedFigure(consultChair, 0, 0.44, 0.02, { skin: 0x7a4f30, cloth: 0xbcc4cc, seed: 21 });
    void consultPatient;

    const planBoard = holoPanel(consultRoom, 0.7, 0.46, -0.2, 1.42, 0.48, (cx, w, h) => {
      cx.fillStyle = "rgba(12,20,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = FRONTC_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffdcb0";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("TREATMENT PLAN — PHASED", w * 0.06, h * 0.13);
      cx.fillStyle = "#fff2e2";
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["1. Build-up + crown UR6", "2. Perio maintenance", "3. Review in six months",
        "Alternatives + doing nothing"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.16)));
    }, { accent: FRONTC_ACCENT });
    reg(hits, planBoard, "plan-board");

    const consentSheet = group(consultTable, 0.22, 0.76, 0.06, 0.15);
    box(consentSheet, 0.17, 0.004, 0.22, 0, 0, 0, 0xf8f5ea, { rough: 0.9 });
    decal(consentSheet, 0.16, 0.2, 0, 0.004, 0, paperFace("INFORMED CONSENT", [
      "Risks discussed", "Alternatives discussed", "Cost discussed", "Signature",
    ], { bg: "#f8f5ea", band: "#2f6f86" }), { px: 256 }).rotation.x = -Math.PI / 2;
    box(consentSheet, 0.015, 0.01, 0.1, 0.11, 0.006, 0, 0x2f343a, { rough: 0.5 });
    holoTag(consentSheet, "Consent", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.28 });
    reg(hits, consentSheet, "consent-signature");

    const writtenEstimate = group(consultTable, -0.28, 0.76, 0.0, -0.1);
    box(writtenEstimate, 0.15, 0.004, 0.2, 0, 0, 0, 0xeff4f8, { rough: 0.9 });
    decal(writtenEstimate, 0.14, 0.18, 0, 0.004, 0, paperFace("WRITTEN ESTIMATE", [
      "Codes + fees listed", "Plan estimate, not a quote", "Take it home",
    ], { bg: "#eff4f8", band: "#4f7f6f" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(writtenEstimate, "Written estimate", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.44 });
    reg(hits, writtenEstimate, "written-estimate");

    const financing = group(consultTable, -0.05, 0.76, -0.16, 0.05);
    box(financing, 0.14, 0.004, 0.18, 0, 0, 0, 0xf6f0e2, { rough: 0.9 });
    decal(financing, 0.13, 0.16, 0, 0.004, 0, paperFace("FINANCING TERMS", [
      "Amount financed", "Cost of credit", "Signed before starting",
    ], { bg: "#f8f2e4", band: "#8a2f34" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(financing, "Financing disclosure", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.52 });
    reg(hits, financing, "financing-disclosure");

    const deferOption = group(consultTable, 0.3, 0.76, -0.18, -0.2);
    box(deferOption, 0.13, 0.004, 0.16, 0, 0, 0, 0xeef2ea, { rough: 0.9 });
    decal(deferOption, 0.12, 0.15, 0, 0.004, 0, paperFace("IF YOU WAIT", [
      "What may change", "What it may cost", "Your choice to defer",
    ], { bg: "#eef4ea", band: "#6f7f4f" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(deferOption, "Deferral option", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.42 });
    reg(hits, deferOption, "no-treatment-option");

    // The same-day pressure card — the hazard.
    const pressureCard = group(consultTable, 0.34, 0.76, 0.24, 0.3);
    box(pressureCard, 0.1, 0.004, 0.06, 0, 0, 0, 0xf0645b, { rough: 0.8 });
    decal(pressureCard, 0.095, 0.055, 0, 0.004, 0, signFace("TODAY ONLY", { bg: "#f8837a", accent: "#5a1410", scale: 0.3 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(pressureCard, "Expires if you leave", 0, 0.1, 0, { css: "#f0645b", w: 0.52 });
    reg(hits, pressureCard, "pressure-card");

    // ---------------------------------------------------------- waiting room
    const lobby = group(g, -1.5, 0, 2.05, -0.35);
    for (let i = 0; i < 2; i++) {
      const seat = group(lobby, -0.32 + i * 0.64, 0, 0);
      box(seat, 0.5, 0.06, 0.48, 0, 0.44, 0, FRONTC_UPHOLSTERY, { rough: 0.85 });
      box(seat, 0.5, 0.5, 0.07, 0, 0.7, -0.2, FRONTC_UPHOLSTERY, { rough: 0.85 });
      for (const dx of [-0.2, 0.2]) {
        box(seat, 0.04, 0.42, 0.44, dx, 0.21, 0, 0x4a5157, { rough: 0.5, metal: 0.4 });
      }
      if (i === 1) reg(hits, seat, "lobby-chair");
    }
    const lobbyTable = group(lobby, 0, 0, 0.62);
    cyl(lobbyTable, 0.28, 0.28, 0.04, 0, 0.42, 0, FRONTC_WOOD, { rough: 0.55, seg: 20, finish: "painted", tile: 2 });
    cyl(lobbyTable, 0.05, 0.05, 0.42, 0, 0.21, 0, 0x6f5a3c, { rough: 0.6, seg: 12 });
    box(lobbyTable, 0.16, 0.006, 0.22, -0.03, 0.446, 0.02, 0xdfe4ea, { rough: 0.9 });
    holoTag(lobby, "Waiting room", 0.6, 1.2, 0, { css: "#f0645b", w: 0.38 });

    // The second patient who follows you in.
    const strayPatient = standingFigure(g, 1.55, 0.6, { ry: -2.2, cloth: 0x7c6f5f, skin: 0xd9a985, seed: 25 });
    strayPatient.visible = false;

    // ------------------------------------------------------- records and log
    const recordsCabinet = group(g, -2.2, 0, 1.75, 0.6);
    box(recordsCabinet, 0.6, 1.3, 0.5, 0, 0.65, 0, 0x6f7a80, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 2; i++) {
      box(recordsCabinet, 0.54, 0.56, 0.02, 0, 0.32 + i * 0.6, 0.26, 0x8c979d, { rough: 0.45, metal: 0.5 });
      box(recordsCabinet, 0.14, 0.03, 0.03, 0, 0.32 + i * 0.6, 0.28, 0x3c4249, { rough: 0.4, metal: 0.6 });
    }
    const recordsLog = group(recordsCabinet, 0, 1.32, 0.02);
    box(recordsLog, 0.24, 0.05, 0.3, 0, 0.025, 0, 0x2f6f86, { rough: 0.7 });
    box(recordsLog, 0.23, 0.04, 0.29, 0, 0.03, 0.004, 0xf8f5ea, { rough: 0.9 });
    decal(recordsLog, 0.2, 0.24, 0, 0.052, 0.004, paperFace("DISCLOSURE LOG", [
      "Who asked", "What went", "When it went",
    ], { bg: "#f8f5ea", band: "#2f6f86" }), { px: 256 }).rotation.x = -Math.PI / 2;
    holoTag(recordsLog, "Disclosure log", 0, 0.16, 0, { css: FRONTC_CSS, w: 0.42 });
    reg(hits, recordsLog, "records-log");

    const recordsEnvelope = group(g, -1.7, 0.78, 1.15, -0.4);
    box(recordsEnvelope, 0.24, 0.02, 0.17, 0, 0, 0, 0xe4d8b8, { rough: 0.9 });
    box(recordsEnvelope, 0.1, 0.006, 0.07, 0.05, 0.013, 0.03, 0xf6f2e6, { rough: 0.9 });
    decal(recordsEnvelope, 0.14, 0.06, -0.04, 0.012, 0, signFace("RECORDS", { bg: "#efe6c8", accent: "#2f6f86", scale: 0.4 }), { px: 192 }).rotation.x = -Math.PI / 2;
    holoTag(recordsEnvelope, "Records out", 0, 0.1, 0, { css: FRONTC_CSS, w: 0.34 });
    reg(hits, recordsEnvelope, "records-envelope");
    // A small stand under the envelope so it is not floating.
    box(g, 0.34, 0.76, 0.28, -1.7, 0.38, 1.15, FRONTC_DESK, { rough: 0.55 });

    const daySheet = holoPanel(g, 0.6, 0.42, -2.3, 1.42, 0.8, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fd6a0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#cfeedd";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("DAY SHEET", w * 0.06, h * 0.15);
      cx.fillStyle = "#eaf6f0";
      cx.font = `${Math.round(h * 0.086)}px Arial, sans-serif`;
      ["Consents taken", "Pre-auth sent", "Disclosure logged",
        "Payments balanced"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { accent: 0x8fd6a0, ry: 1.2 });
    reg(hits, daySheet, "day-sheet");

    const huddleBoard = holoPanel(g, 0.56, 0.36, -2.5, 1.46, 1.65, (cx, w, h) => {
      cx.fillStyle = "rgba(14,12,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b490e0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e4d8ff";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("MORNING HUDDLE", w * 0.06, h * 0.16);
      cx.fillStyle = "#f2ecff";
      cx.font = `${Math.round(h * 0.095)}px Arial, sans-serif`;
      ["Afternoon walked through", "Three hard calls before 10",
        "How is the desk holding?"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.19)));
    }, { accent: 0xb490e0, ry: 1.45 });
    reg(hits, huddleBoard, "huddle-board");

    // ------------------------------------------------------------- room dress
    const printer = group(g, 1.05, 0, -2.3, 0.2);
    box(printer, 0.4, 0.28, 0.36, 0, 0.88, 0, 0x4a5157, { rough: 0.55 });
    box(printer, 0.36, 0.03, 0.3, 0, 1.03, 0.02, 0x2f343a, { rough: 0.5 });
    box(printer, 0.44, 0.74, 0.4, 0, 0.37, 0, FRONTC_DESK, { rough: 0.55 });

    const plant = group(g, 2.55, 0, 2.3, 0);
    cyl(plant, 0.16, 0.13, 0.28, 0, 0.14, 0, 0xa8734a, { rough: 0.8, seg: 14 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leaf = box(plant, 0.06, 0.4, 0.02, Math.sin(a) * 0.07, 0.48, Math.cos(a) * 0.07, 0x4f7f4a, { rough: 0.8 });
      leaf.rotation.z = Math.sin(a) * 0.4;
      leaf.rotation.x = Math.cos(a) * 0.4;
    }

    const wallArt = decal(g, 0.7, 0.44, 2.7, 1.55, 0.4, paperFace("WELCOME", [
      "Notice of Privacy Practices", "Ask us for a copy", "Your rights to your records",
    ], { bg: "#f6f1e6", band: "#2f6f86" }), { px: 320 });
    wallArt.rotation.y = -Math.PI / 2;

    // Ceiling downlights over the counter.
    for (let i = 0; i < 2; i++) {
      const can = group(g, -0.6 + i * 1.2, 2.3, -1.1);
      cyl(can, 0.09, 0.09, 0.05, 0, 0, 0, 0xd8d2c4, { rough: 0.4, metal: 0.3, seg: 14 });
      cyl(can, 0.075, 0.075, 0.012, 0, -0.03, 0, 0xfff4dc, { emissive: 0xfff4dc, ei: 0.85, rough: 0.3, seg: 14, cast: false });
    }

    // Crew: the hygienist at the huddle board and a dental assistant passing.
    standingFigure(g, -2.6, 0.05, { ry: 1.1, cloth: 0x4f7f78, skin: 0xb98a63, seed: 29 });
    const assistant = standingFigure(g, 2.75, -0.35, { ry: -1.6, cloth: 0x2f6f86, skin: 0xe0b38a, seed: 33 });

    let presenting = false, callerActive = false, doorwayActive = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.15, -1.2),

      onStep(step) { presenting = step.id === "plan-presentation"; },

      onStepComplete(step) {
        if (step.id === "privacy-sweep") {
          counterChart.visible = false;
          signIn.visible = false;
          speakerLamp.material = mat(0x8e979f, { rough: 0.6 });
        }
        if (step.id === "screen-swivel") {
          monitorArm.rotation.y = -1.25;
          repaint(monitorFace, paperFace("SCHEDULE — TURNED IN", [
            "Angled off the lobby", "Filter fitted", "Locks on idle",
          ], { bg: "#e8f0f6", band: "#4f7f6f" }));
        }
        if (step.id === "schedule-block") {
          appointmentCard.parent.remove(appointmentCard);
          g.add(appointmentCard);
          appointmentCard.position.set(-0.82, 1.62, -2.33);
          appointmentCard.rotation.set(Math.PI / 2, 0, 0);
        }
        if (step.id === "code-lookup") guessedCode.visible = false;
        if (step.id === "payment-options") pressureCard.visible = false;
        if (step.id === "records-request") {
          recordsEnvelope.position.set(-1.7, 0.86, 1.3);
          recordsEnvelope.rotation.y = -1.1;
        }
        if (step.id === "daysheet-log") {
          repaint(daySheet.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,28,20,0.92)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#8fd6a0"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#d8f4e4";
            cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillText("DAY SHEET — RECONCILED", w * 0.06, h * 0.15);
            cx.fillStyle = "#eaf6f0";
            cx.font = `${Math.round(h * 0.086)}px Arial, sans-serif`;
            ["1 consent, signed", "Pre-auth sent with 3 attachments",
              "Records disclosure logged", "Drawer balanced"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "caller-claims-spouse") { callerPanel.visible = true; callerActive = true; }
        if (it.id === "second-patient-in-doorway") {
          strayPatient.visible = true;
          doorwayActive = true;
          doorLeaf.rotation.y = -1.45;
        }
      },

      onInterruptEnd(it) {
        if (it.id === "caller-claims-spouse") {
          callerActive = false;
          if (it.resolved === "answered") {
            callerPanel.visible = false;
            authBinder.rotation.x = -0.35;
          }
        }
        if (it.id === "second-patient-in-doorway") {
          doorwayActive = false;
          if (it.resolved === "answered") {
            strayPatient.visible = false;
            doorLeaf.rotation.y = -0.05;
          }
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (callerActive) speakerLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 7) * 0.4;
        if (doorwayActive) strayPatient.position.x = 2.2 - Math.abs(Math.sin(t * 1.2)) * 0.2;
        if (presenting && session?.track) assistant.rotation.y = -1.6 + Math.sin(t * 0.7) * 0.1;
      },
    };
  },
};
