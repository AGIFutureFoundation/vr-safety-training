import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Patient Intake Screening VR — Dental & Oral Health, station one.
// The hygienist's first ten minutes with a patient, before an instrument ever
// touches a mouth: the medical history reviewed and updated out loud, vitals
// taken and read against the threshold that defers elective care, a chief
// complaint recorded in the patient's own words, a systematic extraoral and
// intraoral exam, findings charted, and today's consent explained and signed.

const PIS_ACCENT = 0x5fb8e0;

export const SIM_PATIENT_INTAKE_SCREENING = {
  id: "patient-intake-screening",
  index: "119",
  domain: "Dental",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "SEIU and UFCW dental and clinic support staff; the ADHA's standards for clinical dental hygiene practice; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens; the Dental Hygiene Board of California and the state's dental practice act; the ADA's Health History form",
  name: "Patient Intake Screening",
  title: simTitle("Patient Intake Screening"),
  tagline: "History reviewed and flagged, vitals read against the deferral threshold, a systematic exam, findings charted, and today's consent explained and signed",
  accent: PIS_ACCENT,
  accentCss: "#5fb8e0",
  parSeconds: 260,
  footprint: 2.3,
  badge: { id: "cleared-to-treat", name: "Cleared to Treat", note: "History read and flagged, vitals in range, a complete exam charted, and consent signed before anything else began" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or the ADHA's member resources, whichever you would actually pick up the phone to",

  game: system({
    name: "Chairside Readiness",
    currency: "INTAKE",
    ranks: ["Intake Trainee", "Screening Assistant", "Registered Hygienist", "Lead Hygienist", "Chairside Certified"],
    badges: [
      { id: "history-first", name: "History First", note: "Every plan-changing flag caught before the chair reclined", test: AWARD.stepClean("history-flags") },
      { id: "never-unread", name: "Never Unread", note: "No shortcut past the history, the vitals or the consent", test: AWARD.safe },
      { id: "systematic-exam", name: "Systematic Exam", note: "Extraoral and intraoral exam completed in the taught order", test: AWARD.stepClean("extraoral") },
    ],
    challenges: [
      { id: "clean-intake", name: "Clean Intake", note: "No corrections anywhere in the visit", test: AWARD.clean },
      { id: "steady-scan", name: "Steady Scan", note: "The intraoral scan held clean without a break", test: AWARD.unbroken },
      { id: "on-schedule", name: "On Schedule", note: "Intake complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-exam-start": "You reached for \"begin treatment\" before the history was ever opened. Every plan this chair runs — anaesthetic, instrumentation, even how hard to polish — depends on what is on that form; treating on an unread history is how a well-meaning hygienist finds out about a bleeding disorder from the bleeding.",
    "latex-box": "You reached for the latex exam gloves. This patient's chart carries a latex allergy, and latex is not only gloves — it is the dam, some polishing cups and the prophy angle nozzle. A reaction in this chair ranges from a rash to anaphylaxis, and the fix costs nothing: the nitrile box is right next to it.",
    "vitals-skip": "You skipped straight past vitals to the exam. Blood pressure is the one number on this form that can change in the ten minutes since the patient sat down, and it is the only check standing between an undiagnosed hypertensive patient and a chair reclined for a procedure they should not be having today.",
    "handpiece-early": "You picked up the ultrasonic scaler before the consent was signed. Nothing in this chair starts until the patient has heard today's plan and agreed to it in writing — an instrument in hand before that is treatment without consent, whatever it was about to be used for.",
  },

  lateNotes: {
    "signature-pad": "There is nothing to sign yet — walk the patient through today's plan on the consent panel first.",
    "finalize-button": "The chart locks once the consent is actually signed, not before — hold the signature pad for the full count first.",
  },

  steps: [
    {
      id: "gloves", kind: "select", target: "glove-station",
      title: "Hand hygiene and gloves",
      cue: "Sanitise and glove before you touch the patient or the chart.",
      why: "Hand hygiene comes before gloving, never instead of it, and both happen before the first contact with this patient — the CDC's Guidelines for Infection Control in Dental Health-Care Settings and OSHA's bloodborne pathogens standard both start the visit here, because whatever this patient is carrying is what the next patient in the chair is protected from.",
    },
    {
      id: "history-form", kind: "select", target: "history-panel",
      title: "Open the medical history",
      cue: "Pull up the patient's ADA Health History form and ask what has changed.",
      why: "A form on file is only as current as the last visit it was signed at. Asking the patient to confirm it out loud, today, in this chair, is what surfaces the new prescription or the diagnosis nobody thought to call the office about — the form is where the visit starts, not a formality before it.",
    },
    {
      id: "history-flags", kind: "find", noHint: true,
      targets: ["flag-anticoagulant", "flag-latex", "flag-pregnant"],
      itemNames: {
        "flag-anticoagulant": "a blood thinner started since the last visit",
        "flag-latex": "a latex allergy",
        "flag-pregnant": "a pregnancy this trimester",
      },
      itemNotes: {
        "flag-anticoagulant": "An anticoagulant changes how today's periodontal instrumentation is planned and what a prolonged bleed at a site means later in the visit — flag it before the probe ever goes in.",
        "flag-latex": "Every glove, dam and polishing cup in this room has a latex and a latex-free version. This is the flag that decides which tray gets opened.",
        "flag-pregnant": "Pregnancy changes elective radiographs, positioning and which medications are safe to recommend — it belongs on the plan before the chair reclines.",
      },
      decoyNotes: {
        "flag-seasonal": "Seasonal pollen allergy is charted and left alone — it does not change a single thing about today's plan.",
      },
      title: "Flag what changes today's plan",
      cue: "Read down the history and click every entry that changes today's plan.",
      why: "The form lists more than it warns about. Sorting the entries that actually change what happens in this chair — from the ones that are just charted and true — is the whole skill of a history review, and it happens once, out loud, before anything else does.",
    },
    {
      id: "chief-complaint", kind: "select", target: "complaint-note",
      title: "Record the chief complaint",
      cue: "Write down what the patient says is wrong, in the patient's own words.",
      why: "\"My back tooth throbs when I drink anything cold\" and \"sensitivity, upper left\" are not the same record — the patient's own words are what the dentist reads first, and they carry detail a clinical paraphrase quietly drops.",
    },
    {
      id: "chair-lever", kind: "turn", target: "chair-lever",
      forceClass: "firm",
      robotNote: "The chair carries the patient's weight, so the robot may drive it — firm ceiling, reclining speed.",
      title: "Recline the chair for the exam",
      cue: "Bring the chair back to a clear working position.",
      turn: { turns: 0.4, axis: "y", label: "CHAIR RECLINE" },
      why: "A patient upright is a patient you are examining at an angle, straining both your back and your view. The chair comes back before the light goes on and before a single question about vitals or the exam, so the position is right for everything that follows it.",
    },
    {
      id: "bp-cuff", kind: "drag", target: "bp-cuff",
      forceClass: "firm",
      robotNote: "A cuff has to sit snug on the arm: the one place on this patient a robot is allowed to press.",
      title: "Wrap the cuff on the patient's arm",
      cue: "Position the blood pressure cuff on the upper arm before you read it.",
      drag: { to: "cuff-arm", radius: 0.4, missNote: "Not seated on the arm — the cuff has to sit above the elbow, snug, before the reading means anything." },
      why: "A cuff over a sleeve, too loose, or too low on the forearm reads a number that is not this patient's blood pressure. Positioning it correctly is not preamble to the reading, it is most of what makes the reading trustworthy.",
    },
    {
      id: "bp-monitor", kind: "gauge", target: "bp-monitor",
      title: "Take and chart the blood pressure",
      cue: "Read the cuff and commit the reading once the cuff has settled.",
      gauge: { label: "SYSTOLIC / DIASTOLIC", speed: 0.66, green: [0.32, 0.58], readout: (t) => `${Math.round(100 + t * 90)} / ${Math.round(64 + t * 46)}`, missNote: "Committed too early or too late — let the cuff settle to a steady reading before you chart it." },
      why: "Vitals are read against the threshold at which elective treatment is deferred, not just written down for the file. A reading taken off a cuff that has not settled, or charted from memory instead of the display, is a number nobody downstream can actually trust.",
    },
    {
      id: "extraoral", kind: "sequence",
      noRobot: true, forceClass: "light",
      robotNote: "Palpating nodes, the TMJ and the lips is an examination of a person, done by the hygienist's hands.",
      targets: ["nodes", "tmj", "lips"],
      itemNames: { nodes: "lymph nodes", tmj: "TMJ", lips: "lips" },
      title: "Extraoral exam, in order",
      cue: "Palpate the nodes, then the TMJ, then check the lips — in that order.",
      why: "Extraoral before intraoral is the taught sequence for a reason: a swollen node or a clicking joint found before the mouth is even open changes how carefully you read what comes next, and finding it after means going back to recheck a patient who is already leaning back with a mirror in their mouth.",
      outOfOrderNote: "Nodes, then the TMJ, then the lips — extraoral findings are meant to inform what you look for once you're intraoral, not follow it.",
    },
    {
      id: "intraoral-scan", kind: "hold", target: "mirror-retractor", seconds: 6,
      noRobot: true, forceClass: "light",
      robotNote: "Intraoral. Nothing the robot holds goes into a live patient's mouth.",
      title: "Systematic intraoral scan",
      cue: "Hold the mirror and retraction steady while you scan mucosa, tongue, floor of the mouth and palate.",
      why: "A systematic path — buccal mucosa, tongue, floor of the mouth, palate, in the same order every time — is how a hygienist finds the lesion that a quick look around would miss. It is held steady rather than rushed because a retractor that keeps slipping is a exam that keeps restarting from wherever it slipped.",
      holdBreakNote: "The retraction slipped before the scan was through. A partial pass through the mouth is not a completed exam — reset and hold it the full path.",
    },
    {
      id: "chart-findings", kind: "select", target: "chart-panel",
      title: "Chart the findings",
      cue: "Enter what the extraoral and intraoral exam actually found.",
      why: "A finding that lives only in memory is a finding that does not exist for the next hygienist, the dentist reading the chart cold, or the insurer asking why a treatment was billed. It goes in the chart the same visit it was found.",
    },
    {
      id: "explain-plan", kind: "select", target: "consent-panel",
      title: "Explain today's plan",
      cue: "Walk the patient through what is about to happen and why.",
      why: "Consent is not a form somebody signs, it is a conversation that ends in a form being signed. A patient who understands what a periodontal probe does and why today's cleaning includes it is a patient who is actually consenting, not just complying.",
    },
    {
      id: "signature-pad", kind: "hold", target: "signature-pad", seconds: 5,
      title: "Get the consent signed",
      cue: "Hold the pad steady while the patient signs today's consent.",
      why: "The state's dental practice act treats today's consent as a condition of today's treatment, not paperwork trailing behind it — nothing after this step happens on the strength of a plan the patient only heard about.",
      holdBreakNote: "The pad moved before the signature was complete — steady it and let the patient finish signing.",
    },
    {
      id: "finalize-chart", kind: "hold", target: "finalize-button", seconds: 4,
      title: "Lock today's chart entry",
      cue: "Hold to finalise the intake record and today's signed plan.",
      why: "Finalising locks the history, the vitals and the signed consent together as the record this visit was actually run on — it is deliberately a hold rather than a tap, because a record that locks by accident is as much a problem as one that never locks at all.",
      holdBreakNote: "Released before the record locked — hold it the full count or the chart stays open and unsigned.",
    },
  ],

  interrupts: [
    {
      id: "bp-recheck-high",
      kind: "Vital sign alarm",
      after: "intraoral-scan", delay: 3, seconds: 12,
      alert: "The BP monitor across the room finishes its automatic recheck and flashes red — 184 over 110 — while you still have the mirror and retractor in the patient's mouth.",
      cue: "That is above the threshold this practice defers elective care at.",
      target: "defer-panel",
      why: "The monitor's recheck exists precisely because a single borderline reading is not a verdict. A second reading that comes back this high, arriving while your hands and eyes are already committed to the exam, is exactly the moment the deferral protocol is built to catch — break off, notify the dentist, and do not let the exam finish on momentum alone.",
      missNote: "You finished the intraoral scan with an unaddressed hypertensive reading sitting on the monitor. Elective dental treatment on an unmanaged blood pressure this high risks a cardiovascular event in the chair — the recheck existed to stop exactly that, and it was ignored.",
      wrongNote: "It is the defer panel. Nothing else in this room changes what that monitor is telling you.",
    },
    {
      id: "late-med-disclosure",
      kind: "Disclosure after consent",
      after: "finalize-chart", delay: 2, seconds: 12,
      alert: "As you go to lock the chart, the patient adds — \"oh, I forgot to say, I started a blood thinner last week\" — after already signing today's consent.",
      cue: "That consent was signed against a history that is now out of date.",
      target: "history-panel",
      why: "A consent signed on an incomplete history is not fully informed, whatever the signature says — reopening the history and updating the flag before anything locks is what keeps the plan honest, because the periodontal instrumentation later in the visit is a different risk on an anticoagulant than it was two minutes ago.",
      missNote: "You locked the chart with a new anticoagulant undisclosed on the signed record. The plan that goes to the rest of the visit is now built on a history that was known to be wrong the moment it was finalised.",
      wrongNote: "It is the history form. Reopen it and add the flag before anything about today's plan gets locked in.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, PIS_ACCENT);

    // -------------------------------------------------------------- the chair
    const chair = group(g, 0, 0, -1.7);
    cyl(chair, 0.22, 0.28, 0.42, 0, 0.21, 0, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 20, finish: "brushed" });
    cyl(chair, 0.09, 0.09, 0.18, 0, 0.46, 0, 0x5a636b, { rough: 0.4, metal: 0.6, seg: 14 });
    const seat = slab(chair, 0.62, 0.14, 0.72, 0, 0.56, -0.1, 0x3f6f86, { radius: 0.06, rough: 0.6 });
    const back = slab(chair, 0.6, 0.85, 0.16, 0, 0.94, -0.62, 0x3f6f86, { radius: 0.08, rough: 0.6 });
    back.rotation.x = -0.42;
    const headrest = slab(chair, 0.34, 0.24, 0.1, 0, 1.34, -1.02, 0x3f6f86, { radius: 0.05, rough: 0.6 });
    headrest.rotation.x = -0.42;
    const footrest = slab(chair, 0.56, 0.12, 0.6, 0, 0.42, 0.55, 0x3f6f86, { radius: 0.06, rough: 0.6 });
    footrest.rotation.x = 0.3;
    for (const sx of [-1, 1]) {
      box(chair, 0.08, 0.05, 0.5, sx * 0.34, 0.68, -0.1, 0x2f5768, { rough: 0.65 });
    }
    // Recline lever at the base, on the hygienist's side of the chair.
    const leverBase = box(chair, 0.09, 0.05, 0.12, 0.4, 0.3, 0.2, 0x2b3138, { rough: 0.55, metal: 0.4 });
    const leverArm = box(chair, 0.14, 0.03, 0.03, 0.4, 0.33, 0.24, PIS_ACCENT, { rough: 0.4, metal: 0.5 });
    reg(hits, leverArm, "chair-lever");
    void leverBase;

    // Swing-arm instrument tray beside the chair.
    const trayArm = group(chair, 0.55, 0.9, -0.2, -0.6);
    cyl(trayArm, 0.025, 0.025, 0.55, 0, -0.28, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const trayTop = slab(trayArm, 0.42, 0.03, 0.26, 0.2, -0.02, 0, 0x2b3138, { radius: 0.02, rough: 0.45, metal: 0.4 });
    void trayTop;

    // Cuspidor bowl and rinse cup filler on the far side.
    const cuspidor = group(chair, -0.6, 0.5, 0.05, 0.3);
    cyl(cuspidor, 0.03, 0.03, 0.55, 0, 0.1, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    cyl(cuspidor, 0.14, 0.1, 0.1, 0, 0.42, 0, 0xdfe8ee, { rough: 0.3, metal: 0.1, seg: 20, open: true, side: 2 });

    // -------------------------------------------------------------- the patient
    // The chair reclines; the patient's head tilts back with it rather than
    // the whole rigid figure pivoting, which would swing the legs up off the
    // footrest and read as a cross rather than a reclined person.
    const patient = seatedFigure(chair, 0, 0.6, -0.36, { skin: 0xd9a985, cloth: 0x8fb9c9 });
    // Robot training: this is a person, so the head and the torso are
    // keep-out volumes an embodied trainee never enters unless the step it
    // is working declares patient contact. See shared/robot-embodiment.js.
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    patient.head.rotation.x = -0.34;
    patient.arms[0].shoulder.rotation.set(-0.18, 0, -0.16);
    // Nodes, TMJ and lips markers for the extraoral exam.
    const nodes = ball(patient.torso, 0.03, -0.14, 0.9, 0.08, 0x4a6f9a, { rough: 0.7, seg: 10 });
    reg(hits, nodes, "nodes");
    const tmj = ball(patient.head, 0.025, 0.11, -0.02, 0.02, 0x4a6f9a, { rough: 0.7, seg: 10 });
    reg(hits, tmj, "tmj");
    const lips = box(patient.head, 0.09, 0.02, 0.03, 0, -0.09, 0.11, 0xb9695f, { rough: 0.6 });
    reg(hits, lips, "lips");
    // BP cuff site on the presented arm.
    const cuffArm = patient.arms[1];
    cuffArm.shoulder.rotation.set(-0.3, 0, -0.3);
    const cuffSite = group(cuffArm.shoulder, 0, -0.14, 0.02);
    const cuffSocket = box(cuffSite, 0.09, 0.02, 0.09, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cuffSocket, "cuff-arm");

    // Mirror / retractor prop on the tray, used for the intraoral scan hold.
    const mirrorTool = group(trayArm, 0.28, 0.02, -0.06, 0.4);
    cyl(mirrorTool, 0.007, 0.007, 0.16, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 });
    torus(mirrorTool, 0.022, 0.005, 0, 0.09, 0, 0xdfe8ee, { rough: 0.2, metal: 0.5, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(trayArm, "mirror + retractor", 0.28, 0.16, -0.06, { css: "#5fb8e0", w: 0.34 });
    reg(hits, mirrorTool, "mirror-retractor");

    // Ultrasonic scaler on the tray — the pick-up-too-early trap.
    const scaler = group(trayArm, 0.05, 0.02, 0.06, -0.2);
    cyl(scaler, 0.015, 0.018, 0.18, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 10 });
    cyl(scaler, 0.006, 0.006, 0.06, 0, 0.11, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 8 });
    holoTag(trayArm, "ultrasonic scaler", 0.05, 0.16, 0.06, { css: "#f0645b", w: 0.34 });
    reg(hits, scaler, "handpiece-early");

    // "Begin treatment" shortcut on the tray — the unread-history trap.
    const shortcutBtn = box(trayArm, 0.08, 0.02, 0.06, -0.16, 0.02, -0.08, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(trayArm, "begin treatment?", -0.16, 0.14, -0.08, { css: "#f0645b", w: 0.36 });
    reg(hits, shortcutBtn, "skip-exam-start");

    // BP monitor and cuff on the side table.
    const bpTable = group(g, 1.35, 0, -1.15);
    box(bpTable, 0.4, 0.55, 0.32, 0, 0.275, 0, 0x8b929a, { rough: 0.55, metal: 0.3 });
    const bpMonitor = instrument(bpTable, 0, 0.58, 0, { idle: "--/-- mmHg", color: PIS_ACCENT, w: 0.16, d: 0.24, ry: 0 });
    bpMonitor.rotation.x = -Math.PI / 2;
    holoTag(bpTable, "BP monitor", 0, 0.86, 0, { css: "#5fb8e0", w: 0.3 });
    reg(hits, bpMonitor, "bp-monitor");
    const cuffPick = group(bpTable, -0.1, 0.6, 0.1);
    torus(cuffPick, 0.05, 0.014, 0, 0, 0, 0x9fb8c4, { rough: 0.65, seg: 6, seg2: 18 });
    holoTag(bpTable, "BP cuff", -0.1, 0.72, 0.1, { css: "#5fb8e0", w: 0.24 });
    reg(hits, cuffPick, "bp-cuff");
    hose(bpTable, [[-0.1, 0.6, 0.1], [0.05, 0.5, 0.2], [0.18, 0.42, 0.28]], 0.008, 0x22262b, { steps: 12, rough: 0.6 });
    // Vitals-skip shortcut on the same table.
    const vitalsSkip = box(bpTable, 0.1, 0.02, 0.08, 0.15, 0.58, -0.08, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(bpTable, "skip vitals?", 0.15, 0.7, -0.08, { css: "#f0645b", w: 0.32 });
    reg(hits, vitalsSkip, "vitals-skip");

    // Dental light on an overhead articulated arm.
    const lightPole = group(g, 0, 0, -2.3);
    cyl(lightPole, 0.05, 0.06, 2.4, 0, 1.2, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 14 });
    const lightArm = group(lightPole, 0, 2.3, 0);
    cyl(lightArm, 0.03, 0.03, 0.9, 0.45, 0.05, 0.35, CITY.steel, { rough: 0.35, metal: 0.7, seg: 10 }).rotation.set(0, 0.6, -1.1);
    const lightHead = cyl(lightArm, 0.16, 0.18, 0.1, 0.75, 0.32, 0.62, 0xeaf4fb, { rough: 0.3, metal: 0.2, seg: 20, emissive: 0xeaf4fb, ei: 0.6 });
    void lightHead;

    // ---------------------------------------------------------- hygienist crew
    const hygienist = standingFigure(g, -1.2, -1.45, { ry: 1.0, cloth: 0x2f6f86, skin: 0xb98a63 });
    holoTag(hygienist, "hygienist", 0, 1.9, 0, { css: "#5fb8e0", w: 0.3 });

    // ---------------------------------------------------------------- back wall
    const wall = group(g, 0, 0, -4.55);
    const historyPanel = holoPanel(wall, 1.05, 0.7, -2.4, 1.55, 0, (cx, w, h) => {
      cx.fillStyle = "rgba(8,16,22,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5fb8e0"; cx.fillRect(0, 0, w, 6);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#dff1f8"; cx.fillText("ADA HEALTH HISTORY FORM", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#bcdcec";
      ["Medications: reviewed with patient", "Allergies: reviewed with patient",
       "Conditions: cardiac / joint / pregnancy", "Anticoagulant — see flag",
       "Latex allergy — see flag", "Pregnancy, this trimester — see flag"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * 0.28 + i * h * 0.115));
    }, { accent: 0x5fb8e0 });
    reg(hits, historyPanel, "history-panel");
    const historyAlert = box(wall, 0.16, 0.16, 0.03, -2.4, 2.05, 0.02, 0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.4, cast: false });
    historyAlert.visible = false;

    const flagRow = group(wall, -2.4, 0.85, 0.02);
    const flagDefs = [
      ["flag-anticoagulant", "ANTICOAGULANT", -0.36],
      ["flag-latex", "LATEX ALLERGY", 0],
      ["flag-pregnant", "PREGNANCY — T?", 0.36],
      ["flag-seasonal", "SEASONAL ALLERGY", 0.72],
    ];
    for (const [id, label, dx] of flagDefs) {
      const card = decal(flagRow, 0.3, 0.14, dx, 0, 0,
        paperFace(label, ["tap to flag"], { bg: "#fbf3df", band: id === "flag-seasonal" ? "#8fae74" : "#c99a2b" }), { px: 220 });
      reg(hits, card, id);
    }

    const chartPanel = holoPanel(wall, 1.0, 0.66, -0.9, 1.55, 0, (cx, w, h) => {
      cx.fillStyle = "rgba(8,16,22,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5fb8e0"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dff1f8";
      cx.fillText("CHAIRSIDE CHART", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bcdcec";
      ["Chief complaint: ______", "Nodes / TMJ / lips: ______", "Mucosa / tongue / floor / palate: ______"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * 0.34 + i * h * 0.16));
    }, { accent: 0x5fb8e0 });
    reg(hits, chartPanel, "chart-panel");
    const complaintNote = decal(wall, 0.34, 0.16, -0.9, 1.08, 0.02,
      paperFace("CHIEF COMPLAINT", ["in patient's words"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 220 });
    reg(hits, complaintNote, "complaint-note");

    const consentPanel = holoPanel(wall, 1.05, 0.72, 0.6, 1.55, 0, (cx, w, h) => {
      cx.fillStyle = "rgba(8,16,22,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5fb8e0"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dff1f8";
      cx.fillText("TODAY'S CONSENT", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bcdcec";
      ["Prophylaxis + periodontal charting", "Bitewing radiographs, if indicated",
       "Risks explained; questions answered"].forEach((l, i) => cx.fillText(l, w * 0.05, h * 0.34 + i * h * 0.16));
    }, { accent: 0x5fb8e0 });
    reg(hits, consentPanel, "consent-panel");

    const padTable = group(g, 0.75, 0, -3.55);
    box(padTable, 0.3, 0.02, 0.2, 0, 0.72, 0, 0x2b3138, { rough: 0.4, metal: 0.4 });
    const sigScreen = decal(padTable, 0.24, 0.04, 0, 0.735, 0,
      signFace("sign here", { bg: "#0d1c24", accent: "#5fb8e0", fg: "#bfeaf7", scale: 0.55 }), { glow: true, ei: 0.7 });
    sigScreen.rotation.x = -Math.PI / 2;
    reg(hits, padTable, "signature-pad");

    const finalizeBtn = group(g, 1.5, 0, -3.55);
    cyl(finalizeBtn, 0.05, 0.05, 0.03, 0, 0.78, 0, 0x59c97b, { rough: 0.45, emissive: 0x59c97b, ei: 0.4, seg: 16 });
    box(finalizeBtn, 0.14, 0.75, 0.1, 0, 0.38, 0, 0x2b3138, { rough: 0.5 });
    holoTag(finalizeBtn, "finalize chart", 0, 0.92, 0, { css: "#59c97b", w: 0.36 });
    reg(hits, finalizeBtn, "finalize-button");

    // Notify / defer intercom, apart from the everyday controls.
    const deferPanel = group(g, 2.5, 0, -3.0, -0.5);
    box(deferPanel, 0.22, 0.28, 0.08, 0, 1.3, 0, 0x2b3138, { rough: 0.5 });
    const deferLamp = ball(deferPanel, 0.02, 0, 1.4, 0.05, 0xf0645b, { emissive: 0xf0645b, ei: 1.2, seg: 10 });
    holoTag(deferPanel, "notify dentist", 0, 1.5, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, deferPanel, "defer-panel");

    // ------------------------------------------------------- glove / PPE wall
    const ppeWall = group(g, -2.6, 0, -3.4, 0.5);
    box(ppeWall, 0.24, 0.14, 0.1, -0.3, 1.3, 0, 0x9fd6e8, { rough: 0.65 });
    holoTag(ppeWall, "NITRILE", -0.3, 1.43, 0, { css: "#5fb8e0", w: 0.28 });
    reg(hits, ppeWall, "glove-station");
    const latexBox = box(ppeWall, 0.24, 0.14, 0.1, 0.05, 1.3, 0, 0xe8c99f, { rough: 0.65 });
    holoTag(ppeWall, "LATEX", 0.05, 1.43, 0, { css: "#f0645b", w: 0.22 });
    reg(hits, latexBox, "latex-box");
    const dispenser = group(ppeWall, -0.1, 0.95, 0.06);
    box(dispenser, 0.12, 0.24, 0.09, 0, 0, 0, 0xf0f4f6, { rough: 0.4 });
    box(dispenser, 0.07, 0.03, 0.06, 0, -0.15, 0.02, 0x2b3138, { rough: 0.5 });

    // Cabinet + sink for depth along the side wall.
    const cabinet = group(g, -2.9, 0, -0.6, 0.5);
    box(cabinet, 1.1, 0.85, 0.5, 0, 0.425, 0, 0xdfe4e8, { rough: 0.55, metal: 0.15 });
    box(cabinet, 0.9, 0.06, 0.4, 0, 0.86, 0, 0xc7ccd1, { rough: 0.5 });
    cyl(cabinet, 0.16, 0.16, 0.08, 0, 0.9, 0, 0xb9c4c9, { rough: 0.4, metal: 0.2, seg: 20 });
    cyl(cabinet, 0.012, 0.012, 0.24, 0, 1.05, -0.08, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });

    let bpLive = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.7),

      onStepComplete(step) {
        if (step.id === "chair-lever") back.rotation.x = -0.62;
        if (step.id === "bp-cuff") { cuffPick.parent.remove(cuffPick); cuffSite.add(cuffPick); cuffPick.position.set(0, 0, 0.01); bpLive = true; }
        if (step.id === "bp-monitor") {
          repaint(bpMonitor.userData.screen, signFace("128 / 82", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (step.id === "signature-pad") {
          repaint(sigScreen, signFace("signed", { bg: "#0d2418", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        }
        if (step.id === "finalize-chart") { deferLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
      },

      onInterrupt(it) {
        if (it.id === "bp-recheck-high") {
          repaint(bpMonitor.userData.screen, signFace("184/110!", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.55 }));
          deferLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.9 });
        }
        if (it.id === "late-med-disclosure") {
          historyAlert.visible = true;
          repaint(historyPanel.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(42,20,22,0.94)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffd2ce";
            cx.fillText("NEW: ANTICOAGULANT — UNFLAGGED", w * 0.05, h * 0.18);
            cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
            cx.fillText("Disclosed after consent was signed", w * 0.05, h * 0.4);
          });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bp-recheck-high") {
          repaint(bpMonitor.userData.screen, signFace("128 / 82", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
          deferLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        }
        if (it.id === "late-med-disclosure") {
          historyAlert.visible = false;
          repaint(historyPanel.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,16,22,0.92)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#5fb8e0"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dff1f8";
            cx.fillText("ADA HEALTH HISTORY FORM — UPDATED", w * 0.05, h * 0.12);
            cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#bcdcec";
            ["Anticoagulant — flagged", "Latex allergy — see flag", "Pregnancy, this trimester — see flag"]
              .forEach((l, i) => cx.fillText(l, w * 0.05, h * 0.3 + i * h * 0.14));
          });
        }
      },

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "bp-monitor") {
          repaint(bpMonitor.userData.screen, signFace(`${Math.round(100 + gg.t * 90)}/${Math.round(64 + gg.t * 46)}`, {
            bg: "#0d1c24", accent: gg.t >= 0.32 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (session?.turn && session.step?.id === "chair-lever") back.rotation.x = -0.42 - session.turn.amount * 0.5;
        void bpLive; void t;
      },
    };
  },
};
