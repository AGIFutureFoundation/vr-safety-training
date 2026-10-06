import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  seatedFigure, mat, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Biomonitoring Consent VR — Community Environmental Justice,
// Hunters Point Edition, station one of four in the biomonitoring line.
//
// Enrolling a resident in a community biomonitoring initiative: the study
// explained in plain language with an interpreter offered rather than
// assumed unnecessary, the consent form's own rights read out loud, the
// signature witnessed, a participant ID assigned so the sample that follows
// never carries a name, a short exposure questionnaire, and the sample
// collection visit scheduled. Nothing is drawn from anyone until every one
// of those has happened — 45 CFR 46 makes consent the floor a biomonitoring
// programme stands on, not a form filed after the fact.
//
// Sited generically in a community clinic intake room; no real programme,
// partner or participant is named or implied.

const BC_ACCENT = 0xe0a23c;

export const SIM_BIOMONITORING_CONSENT = {
  id: "biomonitoring-consent",
  index: "151",
  domain: "Environmental",
  trade: "Biomonitoring field coordinator",
  category: "Community Environmental Justice",
  indoor: "clinic",
  certification: "45 CFR 46 informed consent for human subjects; HIPAA protections for a participant's own health information; CDC biomonitoring and specimen-handling guidance; SEIU community health worker practice standards",
  name: "Biomonitoring Consent",
  title: simTitle("Biomonitoring Consent"),
  tagline: "The study explained with an interpreter offered, the consent form's rights read out loud, the signature witnessed, a participant ID assigned before any sample exists, the questionnaire, and the collection visit scheduled",
  accent: BC_ACCENT,
  accentCss: "#e0a23c",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "consented-first", name: "Consented First", note: "Every right explained, the signature witnessed, and the participant ID on the record before a single sample existed" },

  game: system({
    name: "Community Biomonitoring",
    currency: "CONSENT",
    ranks: ["Outreach Trainee", "Intake Coordinator", "Field Coordinator", "Lead Coordinator", "Consent Certified"],
    badges: [
      { id: "rights-read", name: "Rights Read", note: "Every consent right named before the pen ever moved", test: AWARD.stepClean("consent-rights") },
      { id: "never-unconsented", name: "Never Unconsented", note: "No shortcut past consent, language access or confidentiality", test: AWARD.safe },
      { id: "id-before-sample", name: "ID Before Sample", note: "The participant ID existed before anything about the visit turned toward a specimen", test: AWARD.stepClean("assign-id") },
    ],
    challenges: [
      { id: "clean-enrollment", name: "Clean Enrollment", note: "No corrections across the whole visit", test: AWARD.clean },
      { id: "steady-signature", name: "Steady Signature", note: "The signature and the explanation both held without a break", test: AWARD.unbroken },
      { id: "on-time-intake", name: "On-Time Intake", note: "Enrollment complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "collect-before-consent": "You reached for the specimen kit before the consent was ever signed. A person's urine, hair or dust-wipe sample belongs to them until they have agreed in writing to give it — collecting first and explaining afterward is exactly the failure 45 CFR 46 exists to stop, and it does not matter that the resident seemed willing.",
    "skip-interpreter": "You pushed past the language question rather than actually offering the interpreter line. A consent explained in a language the participant does not fully follow is not informed consent, whatever they sign — the interpreter is offered before the study is explained, not skipped because the visit is running long.",
    "landlord-fax": "You queued the results to go out to the property manager's fax line. Nothing about this participant's biomonitoring results goes anywhere but to them without their own separate authorization — sending a health result to a landlord is exactly the kind of disclosure that costs a community programme the trust it took years to build.",
    "presign-stack": "You reached for a form from the stack of pre-signed consents instead of walking this participant through their own. A signature collected before the explanation happened is not consent, it is paperwork with a name on it — every participant gets the study, the rights and the questions answered before the pen is theirs to use.",
  },

  lateNotes: {
    "signature-pad": "There is nothing to witness yet — the rights on the consent form have to be read and the participant's questions answered first.",
    "id-console": "No ID to assign yet — the consent has to be signed, and the participant handed their own copy, before the record exists to attach an ID to.",
    "label-printer": "The console has not issued a participant ID yet — there is nothing for the printer to put on a label.",
    "schedule-board": "Nothing to schedule yet — the collection visit is booked against a participant ID that does not exist until the consent and the ID assignment are both done.",
  },

  steps: [
    {
      id: "greet", kind: "select", target: "reception-desk",
      title: "Greet the participant and confirm they're expected",
      cue: "Check the resident against today's outreach list before anything else starts.",
      why: "Community biomonitoring runs on a scheduled list built from door-to-door outreach, and starting from that list — not from whoever happens to be in the room — is what keeps the day's visits matched to the people who actually agreed to be contacted about the study.",
    },
    {
      id: "interpreter-offer", kind: "select", target: "interpreter-panel",
      title: "Ask a language preference and offer the interpreter",
      cue: "Offer the interpreter line before saying a word about the study itself.",
      why: "The interpreter is offered, not held in reserve for whoever asks for it — a participant who has to request accommodation in a language they are still explaining themselves in has already had the offer made too late to matter.",
    },
    {
      id: "explain-study", kind: "hold", target: "study-panel", seconds: 5,
      title: "Explain the study in plain language",
      cue: "Hold the plain-language study sheet up and walk through what the biomonitoring initiative actually does.",
      why: "Plain language means what samples are collected, what they are tested for, who sees the results and why the study exists — said out loud, to the participant, not handed over as a page to read alone. This is held for the full explanation rather than clicked through, because a study summarized in ten seconds is not the study this participant is being asked to join.",
      holdBreakNote: "The explanation broke off before it was through — a participant who only heard half of what this study does cannot meaningfully agree to it. Start the explanation again and hold it to the end.",
    },
    {
      id: "consent-rights", kind: "find", noHint: true,
      targets: ["right-decline", "right-withdraw", "right-results"],
      itemNames: {
        "right-decline": "the right to decline any part of the study",
        "right-withdraw": "the right to withdraw at any time",
        "right-results": "the right to get their own results back",
      },
      itemNotes: {
        "right-decline": "Declining is not the same as failing to finish signing — a participant can say no to a specific test, or all of them, and still be treated the same as anyone else who came through the door.",
        "right-withdraw": "Withdrawal does not require a reason, and it does not undo the visit they've already had — it only stops what happens next.",
        "right-results": "This is the right the whole initiative exists to honour: a resident's own biomonitoring result belongs to them, not just to the study's aggregate data set.",
      },
      decoyNotes: {
        "right-payment": "A modest participation stipend is real and stated on the form, but it is not one of the three rights 45 CFR 46 requires this visit to name out loud — it is a thank-you, not a protection.",
      },
      title: "Read the consent form's own rights aloud",
      cue: "Find and read out every right this consent form actually grants — the right to decline, to withdraw, and to get their own results.",
      why: "These three rights are what makes this a consent form rather than a release — a participant who has not heard them said aloud, in this room, before they sign has not been given the choice the form claims to be recording. Reading them is the whole reason the visit happens before the sample does.",
    },
    {
      id: "answer-questions", kind: "select", target: "qa-panel",
      title: "Invite and answer questions",
      cue: "Open the floor for questions before moving toward the signature.",
      why: "A question asked and answered before signing is what turns a form the participant heard read at them into a decision they actually understand — skipping straight to the pen because nobody raised a hand yet treats silence as agreement, which it is not.",
    },
    {
      id: "consent-sign", kind: "hold", target: "signature-pad", seconds: 5,
      title: "Witness the signature",
      cue: "Hold the pad steady while the participant signs their own consent.",
      why: "A witnessed signature is what the record can actually stand behind later — held for the participant's own hand to finish the signature, not for the coordinator's hand to hurry it, because a signature interrupted partway through is neither refused nor given.",
      holdBreakNote: "The pad moved before the signature was complete — steady it and let the participant finish signing in their own time.",
    },
    {
      id: "hand-copy", kind: "drag", target: "consent-copy",
      title: "Hand the participant their own signed copy",
      cue: "Give the participant a copy of what they just signed before the folder closes.",
      drag: { to: "participant-hands", radius: 0.45, missNote: "Not into the participant's own hands. A copy left on the desk after they've walked out is not a copy they were given." },
      why: "The right to a copy is not written on the form as a courtesy — a participant who leaves without their own record of what they agreed to has no way to check it later against what actually happens with their sample, which is exactly the gap community biomonitoring is built to close.",
    },
    {
      id: "assign-id", kind: "select", target: "id-console",
      title: "Assign the participant ID",
      cue: "Assign this participant a study ID number in the registry now that consent is on file.",
      why: "The whole point of the participant ID is that it exists before a sample does — a tube, a hair sample or a dust wipe travels under a number, never a name, and the only way that holds is if the ID is issued from the signed consent, not attached to a specimen after the fact as an afterthought.",
    },
    {
      id: "print-label", kind: "turn", target: "label-printer",
      title: "Print the participant ID label",
      cue: "Crank the label printer to issue the ID label for the intake folder and the specimen kit.",
      turn: { turns: 0.8, axis: "y", label: "ID LABEL PRINTER" },
      why: "A label printed straight from the console is a label that matches the registry exactly — one copied out by hand later is one more chance for a digit to be transposed and a sample to end up answering for the wrong person's exposure.",
    },
    {
      id: "attach-labels", kind: "sequence", anyOrder: true,
      targets: ["label-folder", "label-kit"],
      itemNames: { "label-folder": "intake folder labelled", "label-kit": "specimen kit tagged" },
      title: "Attach the ID label to the folder and the kit",
      cue: "Put the printed ID label on the intake folder and on the specimen kit tag — either order.",
      why: "Both the paper record and the physical kit carry the same number from this point forward, which is what lets the sample-kit-shipping stage that follows this visit match a label to a manifest instead of guessing which folder a tube belongs to.",
    },
    {
      id: "questionnaire", kind: "sequence",
      targets: ["quest-health", "quest-exposure", "quest-occupation"],
      itemNames: { "quest-health": "general health history", "quest-exposure": "home and neighbourhood exposure history", "quest-occupation": "occupational history" },
      title: "Work through the exposure questionnaire, in order",
      cue: "General health history first, then home and neighbourhood exposure, then occupational history.",
      why: "The questionnaire is read in this order because each section narrows the one before it — a general health history that surfaces a relevant condition changes what the exposure questions actually need to ask, and occupational history is asked last because it is the most specific and the easiest to answer once the broader picture is already on the page.",
      outOfOrderNote: "General health first, then home and neighbourhood exposure, then occupational history — asking the narrowest questions before the broad ones means missing the context that makes the narrow answers useful.",
    },
    {
      id: "schedule-collection", kind: "select", target: "schedule-board",
      title: "Schedule the sample collection visit",
      cue: "Book the collection appointment now that consent and the participant ID both exist.",
      why: "Scheduling is the last thing that happens, not the first, because a collection date on the calendar for someone who has not yet consented is a date for a visit that should not happen — the appointment is the outcome of everything before it, not a placeholder set in advance.",
    },
    {
      id: "record-consent", kind: "select", target: "registry-board",
      title: "Log the enrollment in the consent registry",
      cue: "Record today's enrollment — consent signed, ID assigned, questionnaire complete — before closing the visit.",
      why: "The registry is what lets the sample collection team, days from now, confirm a participant ID is actually attached to a signed, witnessed consent before anyone touches a tube — a visit that is not logged the day it happened is a visit nobody downstream can verify actually occurred this way.",
    },
  ],

  interrupts: [
    {
      id: "family-answers-for-participant",
      kind: "Third party answering for the participant",
      after: "explain-study", delay: 2, seconds: 12,
      alert: "The participant's adult son, sitting in on the visit, starts answering the study questions on their behalf before the participant has said a word.",
      cue: "Redirect the explanation back to the participant themselves.",
      target: "redirect-participant",
      why: "Consent belongs to the participant named on the form, not to whoever in the room is most comfortable speaking — a family member's understanding does not stand in for the participant's own, and a coordinator who lets the explanation continue toward the son is building a consent record for the wrong person's agreement.",
      missNote: "The explanation kept going with the son answering and the participant listening. A consent conversation that never actually reaches the participant produces a signature that does not mean what a signature is supposed to mean.",
      wrongNote: "Redirect to the participant directly — nothing else in this room fixes who the explanation is actually for.",
    },
    {
      id: "landlord-question",
      kind: "Confidentiality question mid-signature",
      after: "consent-sign", delay: 2, seconds: 12,
      alert: "Pen still on the pad, the participant asks quietly — \"this doesn't go to my landlord, does it? I don't want trouble with my building.\"",
      cue: "Answer the confidentiality question before the signature goes any further.",
      target: "confidentiality-panel",
      why: "A participant who is worried about housing retaliation is asking exactly the right question, and a coordinator who waves it off to keep the signature moving is asking someone to sign under a fear that was never actually answered — the confidentiality panel exists to say, clearly, who does and does not see this result before the pen finishes.",
      missNote: "The signature finished with the question left hanging in the air. A consent signed over an unanswered fear about housing retaliation is not the free choice 45 CFR 46 is asking this visit to record.",
      wrongNote: "It's the confidentiality panel. Nothing else in this room actually tells this participant who sees their result.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, BC_ACCENT);

    // ------------------------------------------------------------ reception
    const desk = counter(g, 1.5, 0.7, 0, -1.9, 0xd8dde0, { ry: 0 });
    holoTag(desk, "reception desk", 0, 1.1, 0, { css: "#e0a23c", w: 0.4 });
    reg(hits, desk, "reception-desk");
    cabinet(g, 1.1, 0.7, 0.3, -1.9, 0.55, -2.6, 0xdfe4e8, { doorColor: 0xcfd8de });

    // Waiting chairs, for the room to read as an intake area rather than a stage.
    for (let i = 0; i < 3; i++) {
      const chair = group(g, -2.6, 0, -1.2 + i * 0.65, 0.4);
      box(chair, 0.42, 0.05, 0.42, 0, 0.44, 0, 0x3c5a66, { radius: 0.03, rough: 0.6 });
      box(chair, 0.42, 0.5, 0.05, 0, 0.68, -0.19, 0x3c5a66, { radius: 0.03, rough: 0.6 });
      for (const [sx, sz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
        cyl(chair, 0.02, 0.02, 0.42, sx, 0.21, sz, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 8 });
      }
    }

    // ------------------------------------------------------------ interpreter
    const interpPost = group(g, -1.9, 0, -2.6, 0.35);
    const interpPanel = holoPanel(interpPost, 0.72, 0.5, 0, 1.35, 0, (cx, w, h) => {
      cx.fillStyle = "#241a08"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e0a23c"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#fbe6c0";
      cx.fillText("INTERPRETER LINE", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#fdf1da";
      ["Preferred language: ______", "Interpreter offered before", "the study is explained"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { accent: BC_ACCENT });
    reg(hits, interpPanel, "interpreter-panel");
    cyl(interpPost, 0.018, 0.018, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const interpHandset = group(interpPost, 0.32, 0.9, 0.05);
    box(interpHandset, 0.05, 0.16, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    ball(interpHandset, 0.03, 0, 0.1, 0, 0x2b3138, { rough: 0.5, seg: 10 });
    const skipInterpBtn = box(interpPost, 0.14, 0.05, 0.03, 0, 0.55, 0.02, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(interpPost, "proceed without interpreter?", 0, 0.66, 0.02, { css: "#f0645b", w: 0.5 });
    reg(hits, skipInterpBtn, "skip-interpreter");

    // ------------------------------------------------------------ study panel
    const studyPost = group(g, -0.6, 0, -2.7, 0.15);
    const studyPanel = holoPanel(studyPost, 0.9, 0.62, 0, 1.5, 0, (cx, w, h) => {
      cx.fillStyle = "#241a08"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e0a23c"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#fbe6c0";
      cx.fillText("BIOMONITORING STUDY — PLAIN LANGUAGE", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#fdf1da";
      ["What is collected: urine, hair, dust wipe", "What it's tested for: named exposures",
       "Who sees results: you, then the study team", "Why: a community's own exposure record"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.3 + i * 0.15)));
    }, { accent: BC_ACCENT });
    reg(hits, studyPanel, "study-panel");
    cyl(studyPost, 0.02, 0.022, 1.1, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });

    // -------------------------------------------------------- consent rights
    const rightsTable = group(g, 0.9, 0, -2.4, -0.2);
    box(rightsTable, 0.9, 0.7, 0.5, 0, 0.35, 0, 0x4a5561, { rough: 0.65, metal: 0.2 });
    const rightsBoard = decal(rightsTable, 0.5, 0.7, 0, 0.72, 0.05, paperFace("CONSENT — YOUR RIGHTS", [
      "You may decline any part", "You may withdraw at any time", "You get your own results",
    ], { scale: 0.9 }));
    rightsBoard.rotation.x = -Math.PI / 2;
    holoTag(rightsTable, "consent rights", 0, 0.98, 0.05, { css: "#e0a23c", w: 0.36 });
    const RIGHT_CARDS = [
      ["right-decline", "DECLINE", -0.28],
      ["right-withdraw", "WITHDRAW", -0.05],
      ["right-results", "OWN RESULTS", 0.2],
      ["right-payment", "STIPEND", 0.42],
    ];
    for (const [id, label, dx] of RIGHT_CARDS) {
      const card = decal(rightsTable, 0.19, 0.11, dx, 0.72, -0.16,
        paperFace(label, ["tap to read"], { bg: "#fbf3df", band: id === "right-payment" ? "#8fae74" : "#c99a2b" }), { px: 200 });
      card.rotation.x = -Math.PI / 2;
      reg(hits, card, id);
    }

    // ------------------------------------------------------------ Q&A panel
    const qaPanel = holoPanel(g, 0.7, 0.44, 1.9, 1.5, -2.1, (cx, w, h) => {
      cx.fillStyle = "#241a08"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e0a23c"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillStyle = "#fbe6c0";
      cx.fillText("QUESTIONS?", w / 2, h * 0.35);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fdf1da";
      cx.fillText("Answered before the signature", w / 2, h * 0.65);
    }, { ry: -0.4, accent: BC_ACCENT });
    reg(hits, qaPanel, "qa-panel");

    // ------------------------------------------------------------ signature
    const sigTable = group(g, 0.4, 0, -0.9, -0.3);
    box(sigTable, 0.36, 0.02, 0.24, 0, 0.72, 0, 0x2b3138, { rough: 0.4, metal: 0.4 });
    const sigScreen = decal(sigTable, 0.3, 0.05, 0, 0.735, 0,
      signFace("sign here", { bg: "#0d1c1c", accent: "#e0a23c", fg: "#fbe6c0", scale: 0.55 }), { glow: true, ei: 0.7 });
    sigScreen.rotation.x = -Math.PI / 2;
    reg(hits, sigTable, "signature-pad");
    const confidentialityPanel = decal(sigTable, 0.3, 0.16, 0.3, 0.85, 0,
      paperFace("CONFIDENTIALITY", ["Results go only to you", "Never to landlords or employers"], { bg: "#fbf3df", band: "#3c8f6f" }), { px: 220 });
    reg(hits, confidentialityPanel, "confidentiality-panel");

    // Pre-signed stack trap, sitting on the same table as a tempting shortcut.
    const presignStack = group(sigTable, -0.32, 0.73, 0.05);
    for (let i = 0; i < 4; i++) box(presignStack, 0.18, 0.006, 0.24, 0, i * 0.008, 0, 0xece2c8, { rough: 0.7 });
    holoTag(presignStack, "use pre-signed form?", 0, 0.1, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, presignStack, "presign-stack");

    // ------------------------------------------------------------ participant
    const participant = seatedFigure(g, -0.15, 0, -0.55, { skin: 0xc99878, cloth: 0x5c7a8f, ry: 2.6 });
    holoTag(participant.root, "participant", 0, 1.7, 0, { css: "#e0a23c", w: 0.3 });
    const participantHands = group(participant.torso, 0, 0.55, 0.28);
    hits["participant-hands"] = participantHands;
    const consentCopy = decal(sigTable, 0.24, 0.16, 0, 0.75, -0.24,
      paperFace("YOUR COPY", ["signed consent"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 200 });
    reg(hits, consentCopy, "consent-copy");
    const redirectTag = group(participant.root, 0, 1.85, 0);
    ball(redirectTag, 0.015, 0, 0, 0, BC_ACCENT, { emissive: BC_ACCENT, ei: 1.1, seg: 10 });
    holoTag(redirectTag, "speak with the participant directly", 0, 0.14, 0, { css: "#e0a23c", w: 0.56 });
    reg(hits, redirectTag, "redirect-participant");

    // A family member, seated to the side, who leans in during the interrupt.
    const familyHome = { x: -1.35, z: -0.35, ry: 2.9 };
    const family = standingFigure(g, familyHome.x, familyHome.z, { ry: familyHome.ry, cloth: 0x445560, skin: 0xb98a63 });
    holoTag(family, "participant's son", 0, 1.9, 0, { css: "#8fa2af", w: 0.4 });

    // The field coordinator, standing clear of the desk and the signature table.
    const coordinator = standingFigure(g, 0.85, -0.2, { ry: -2.3, cloth: 0x3c5a66, vest: BC_ACCENT });
    holoTag(coordinator, "field coordinator", 0, 1.95, 0, { css: "#e0a23c", w: 0.4 });

    // ------------------------------------------------------------ ID console
    const idConsole = instrument(g, 1.7, 0.9, -1.4, { ry: -0.5, idle: "ID: ----", color: BC_ACCENT, w: 0.18, d: 0.24 });
    const idBase = box(g, 0.4, 0.9, 0.32, 1.7, 0.45, -1.4, 0x4a5561, { rough: 0.6, metal: 0.2 });
    void idBase;
    holoTag(g, "assign participant ID", 1.7, 1.12, -1.4, { css: "#e0a23c", w: 0.48 });
    reg(hits, idConsole, "id-console");

    // Label printer with a hand crank, beside the console.
    const printer = group(g, 2.25, 0, -1.05, -0.5);
    box(printer, 0.28, 0.2, 0.2, 0, 0.86, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const printerCrank = group(printer, 0.16, 0.86, 0);
    cyl(printerCrank, 0.012, 0.012, 0.08, 0, 0, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const crankBall = ball(printerCrank, 0.022, 0.08, 0, 0, 0xb8402f, { rough: 0.5, seg: 10 });
    void crankBall;
    holoTag(printer, "label printer", 0, 1.02, 0, { css: "#e0a23c", w: 0.36 });
    reg(hits, printerCrank, "label-printer");
    const labelSlot = decal(printer, 0.16, 0.03, 0, 0.75, 0.11, signFace("ID-----", { bg: "#0d1c1c", accent: "#e0a23c", fg: "#fbe6c0", scale: 0.55 }), { glow: true, ei: 0.5 });
    labelSlot.visible = false;

    // ------------------------------------------------------------ labels
    const folder = group(g, 1.35, 0, -0.6, -0.4);
    box(folder, 0.28, 0.02, 0.36, 0, 0.75, 0, 0xd6c99a, { rough: 0.75 });
    const folderLabel = decal(folder, 0.22, 0.08, 0, 0.762, -0.1, signFace("----", { bg: "#0d1c1c", accent: "#e0a23c", fg: "#fbe6c0", scale: 0.55 }));
    folderLabel.rotation.x = -Math.PI / 2;
    holoTag(folder, "intake folder", 0, 0.86, -0.1, { css: "#e0a23c", w: 0.34 });
    reg(hits, folder, "label-folder");

    // ------------------------------------------------------------ specimen kit
    const kitTray = group(g, 2.4, 0, 0.5, -0.3);
    box(kitTray, 0.7, 0.06, 0.4, 0, 0.72, 0, 0x8b929a, { rough: 0.5, metal: 0.3 });
    const kitUrine = cyl(kitTray, 0.035, 0.035, 0.09, -0.22, 0.79, 0, 0xe8dca0, { rough: 0.3, opacity: 0.7, transparent: true, seg: 12 });
    const kitHair = box(kitTray, 0.1, 0.03, 0.06, 0, 0.755, 0, 0xece2c8, { rough: 0.7 });
    const kitDust = box(kitTray, 0.1, 0.03, 0.06, 0.22, 0.755, 0, 0xd7dde0, { rough: 0.6 });
    void kitUrine; void kitHair; void kitDust;
    const kitTag = decal(kitTray, 0.14, 0.06, 0, 0.755, 0.16, signFace("----", { bg: "#0d1c1c", accent: "#e0a23c", fg: "#fbe6c0", scale: 0.55 }));
    kitTag.rotation.x = -Math.PI / 2;
    holoTag(kitTray, "specimen kit", 0, 0.92, 0, { css: "#e0a23c", w: 0.32 });
    reg(hits, kitTag, "label-kit");

    const collectBtn = box(kitTray, 0.14, 0.05, 0.08, -0.22, 0.85, 0.14, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(kitTray, "start collection now?", -0.22, 0.98, 0.14, { css: "#f0645b", w: 0.48 });
    reg(hits, collectBtn, "collect-before-consent");

    // ------------------------------------------------------------ questionnaire
    const questTable = group(g, -1.2, 0, 0.7, 0.4);
    box(questTable, 0.7, 0.65, 0.4, 0, 0.325, 0, 0x4a5561, { rough: 0.65, metal: 0.2 });
    const questBoard = decal(questTable, 0.34, 0.44, 0, 0.66, 0, paperFace("EXPOSURE QUESTIONNAIRE", [
      "General health history", "Home & neighbourhood exposure", "Occupational history",
    ], { scale: 0.85 }));
    questBoard.rotation.x = -Math.PI / 2;
    holoTag(questTable, "questionnaire", 0, 0.9, 0, { css: "#e0a23c", w: 0.36 });
    const QUEST_ROWS = [["quest-health", -0.2], ["quest-exposure", 0], ["quest-occupation", 0.2]];
    for (const [id, dz] of QUEST_ROWS) {
      const row = box(questTable, 0.3, 0.01, 0.1, 0, 0.671, dz, 0xece2c8, { rough: 0.7 });
      reg(hits, row, id);
    }

    // ------------------------------------------------------------ schedule / registry
    const schedulePanel = holoPanel(g, 0.7, 0.46, -2.3, 1.5, 1.3, (cx, w, h) => {
      cx.fillStyle = "#241a08"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e0a23c"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#fbe6c0";
      cx.fillText("SCHEDULE COLLECTION", w * 0.06, h * 0.18);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#fdf1da";
      cx.fillText("Booked against participant ID", w * 0.06, h * 0.55);
    }, { ry: 0.6, accent: BC_ACCENT });
    reg(hits, schedulePanel, "schedule-board");

    const registryPanel = holoPanel(g, 0.7, 0.46, -0.3, 1.5, 2.0, (cx, w, h) => {
      cx.fillStyle = "#241a08"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e0a23c"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#fbe6c0";
      cx.fillText("CONSENT REGISTRY", w * 0.06, h * 0.18);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#fdf1da";
      cx.fillText("Consent + ID + questionnaire logged", w * 0.06, h * 0.55);
    }, { accent: BC_ACCENT });
    reg(hits, registryPanel, "registry-board");

    // Landlord fax trap, apart from the honest paperwork.
    const faxMachine = group(g, -2.5, 0, 1.6, 0.3);
    box(faxMachine, 0.32, 0.24, 0.26, 0, 0.5, 0, 0xdfe4e8, { rough: 0.55 });
    box(faxMachine, 0.28, 0.02, 0.2, 0, 0.63, 0, 0xb9c0c4, { rough: 0.4 });
    holoTag(faxMachine, "send results to landlord?", 0, 0.78, 0, { css: "#f0645b", w: 0.5 });
    const faxBtn = box(faxMachine, 0.08, 0.03, 0.05, 0.1, 0.635, 0.06, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    reg(hits, faxBtn, "landlord-fax");

    let idAssigned = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.6),

      onStepComplete(step) {
        if (step.id === "consent-sign") {
          repaint(sigScreen, signFace("signed", { bg: "#0d2418", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        }
        if (step.id === "assign-id") {
          idAssigned = true;
          repaint(idConsole.userData.screen, signFace("ID: 0417-B", { bg: "#0d1c1c", accent: "#59c97b", fg: "#fbe6c0", scale: 0.55 }));
        }
        if (step.id === "print-label") { labelSlot.visible = true; }
        if (step.id === "attach-labels") {
          repaint(folderLabel, signFace("0417-B", { bg: "#0d1c1c", accent: "#59c97b", fg: "#fbe6c0", scale: 0.55 }));
          repaint(kitTag, signFace("0417-B", { bg: "#0d1c1c", accent: "#59c97b", fg: "#fbe6c0", scale: 0.55 }));
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "family-answers-for-participant") {
          family.position.set(-0.55, 0, -0.35);
          family.rotation.y = 2.3;
        }
        if (it.id === "landlord-question") {
          confidentialityPanel.material.emissiveIntensity = 1.6;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "family-answers-for-participant") {
          family.position.set(familyHome.x, 0, familyHome.z);
          family.rotation.y = familyHome.ry;
        }
        if (it.id === "landlord-question") {
          confidentialityPanel.material.emissiveIntensity = 0.85;
        }
      },
      animate(t, dt, session) {
        void dt;
        if (session?.turn && session.step?.id === "print-label") {
          printerCrank.rotation.z = session.turn.amount * Math.PI * 2;
        }
        participant.head.rotation.y = Math.sin(t * 0.5) * 0.05;
        void idAssigned;
      },
    };
  },
};
