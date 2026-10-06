import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, seatedFigure, ownMaterial, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Medical History & Medication Review VR — Dental & Oral Health.
//
// The ten minutes before a hygiene appointment and a planned extraction, in a
// small consult room: the door closed, the history confirmed as today's, the
// bag of bottles the patient brought checked against the form, every medicine
// written down with its reason and its prescriber, the allergies read, the
// dental implications of a blood thinner and a bone medicine looked up, the
// patient heard, the list read back, and the flagged history carried to the
// dentist — whose decision on a medical consult is recorded as theirs.
//
// Nothing here is medical advice to a patient. Whether a medicine is paused,
// whether a physician is consulted and what is prescribed are the dentist's
// and the prescriber's calls under the state dental board's practice act; the
// station teaches the assistant or hygienist to find, record and flag, never
// to decide. The Unspoken Smiles programme is named only as the programme
// this platform is built for.

const MHR_ACCENT = 0x9f8fe0;
const MHR_CSS = "#9f8fe0";
const MHR_ALERT = "#f0645b";

export const SIM_DN_MEDICAL_HISTORY_AND_MEDICATION_REVIEW = {
  id: "dn-medical-history-and-medication-review",
  index: "320",
  domain: "Dental",
  trade: "Dental hygienist or assistant — medical history and medication review (RDH, DANB Certified Dental Assistant), SEIU and UFCW clinic and dental staff",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "The state dental board's practice act, under which the decision to consult a physician, change a plan or prescribe is the dentist's, and the history is taken and recorded by the team; the ADHA's standards for clinical dental hygiene practice on assessment; the ADA's guidance on patients taking anticoagulants and antiresorptive bone medicines, and the ADA's CDT code set for the evaluation the dentist records; HIPAA's privacy rule and its minimum-necessary standard for a medication list; OSHA 29 CFR 1910.1030 for a used lancet; the CDC's dental infection-control guidelines for a latex-free setup; SEIU and UFCW clinic and dental staff; Unspoken Smiles, the programme this platform is built for",
  name: "Medical History & Medication Review",
  title: simTitle("Medical History & Medication Review"),
  tagline: "A history reviewed before anybody picks up an instrument: the door closed, the bottles checked against the form, a blood thinner and a bone medicine flagged, the allergies read, and the consult decision recorded — per the dentist",
  accent: MHR_ACCENT,
  accentCss: MHR_CSS,
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "nothing-missed", name: "Nothing Missed", note: "Every medicine in the bag on the list, every flag in front of the dentist, and nothing decided that was the dentist's to decide" },
  supportLine: "your clinic's employee assistance line, or the hygiene lead you debrief with — holding a patient's health worries all day is real work",

  game: system({
    name: "History First",
    currency: "HIST",
    ranks: ["Clinical Student", "History Taker", "Clinical Reviewer", "Hygiene Lead", "History First Certified"],
    badges: [
      { id: "bag-checked", name: "Bag Checked", note: "Both missing medicines found in the bag first time", test: AWARD.stepClean("mhr-brown-bag") },
      { id: "within-scope", name: "Within Scope", note: "No unsafe action anywhere in the review", test: AWARD.safe },
      { id: "heard-them", name: "Heard Them", note: "The listening and the read-back carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-review", name: "Clean Review", note: "No corrections anywhere in the review", test: AWARD.clean },
      { id: "alert-right", name: "Alert Right", note: "The chart alert set near the middle of its band", test: AWARD.precise(0.72) },
      { id: "on-time", name: "On Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "mhr-stop-thinner-note": "That is a pre-printed slip telling the patient to stop their blood thinner three days before the extraction. Stopping an anticoagulant can cause a stroke or a clot, and it is never the dental team's instruction to give: whether anything changes is decided by the dentist together with the physician who prescribed it, and most of the time the answer is to keep taking it and manage bleeding locally.",
    "mhr-antibiotic-sample": "That is a sample pack of penicillin-family antibiotic from the cupboard, offered 'just in case' — to a patient whose chart says penicillin gives them hives. Handing out a medicine is prescribing, which is the dentist's under the practice act, and handing out this one to this patient is how a mild allergy becomes an anaphylaxis in the car park.",
    "mhr-open-screen": "That is the patient's full record open on the monitor that faces the corridor. A medication list tells anybody walking past about a heart rhythm, a bone condition and a diagnosis the patient may never have mentioned to their own family; HIPAA's minimum-necessary standard means the screen shows what the person using it needs, and it faces away from the door.",
    "mhr-used-lancet": "That is the used lancet from the patient's glucose check, left uncapped on the desk. A used lancet carries blood, and a sharp on a desk is found by a hand reaching for paperwork; under 29 CFR 1910.1030 it goes straight into the sharps container, not onto the nearest flat surface.",
  },

  lateNotes: {
    "mhr-consult-form": "Not yet. The consult decision is the dentist's, and the dentist has not seen the flagged history — carry it to them first.",
    "mhr-team-checkin": "The team check-in comes once the dentist's decision is recorded, so the huddle hears the plan rather than the questions.",
    "mhr-history-log": "The review is not finished. The history log is signed at the end, from what was actually confirmed.",
  },

  steps: [
    {
      id: "mhr-door-close", kind: "turn", target: "mhr-door-handle", noRobot: false,
      turn: { turns: 0.5, axis: "z", label: "DOOR HANDLE" },
      title: "Close the consult room door before a word about health is said",
      cue: "Turn the handle and close the door so the conversation stays in the room.",
      why: "A medical history is the most sensitive conversation in a dental visit: heart conditions, pregnancy, mental health, medicines a patient may not want anybody else to know about. HIPAA does not ask a practice to whisper, but it does expect reasonable safeguards, and a closed door is the cheapest one there is. Patients tell a closed room things they will not say in an open bay, which is exactly why the history-taker who closes it gets the full story — and why that habit leads toward treatment-coordinator and hygiene roles.",
    },
    {
      id: "mhr-form-check", kind: "sequence", noRobot: false,
      targets: ["mhr-two-identifiers", "mhr-update-date", "mhr-signature-line"],
      itemNames: {
        "mhr-two-identifiers": "two identifiers — name and date of birth",
        "mhr-update-date": "today's date on the update",
        "mhr-signature-line": "the patient's signature",
      },
      outOfOrderNote: "Out of order. Confirm whose history it is before checking how recent it is, and sign it off only once both are right — a signature on the wrong person's form proves nothing.",
      title: "Confirm whose history this is, that it is today's, and that it is signed",
      cue: "Two identifiers first, then the update date, then the patient's signature.",
      why: "The most dangerous history is the right history for the wrong patient, or the right patient's history from two years ago. Two identifiers make sure the form belongs to the person in the chair; the update date shows it reflects what they take now; the signature records that they confirmed it. The ADHA's practice standards treat this assessment as the foundation of hygiene care, and getting it right every time is what earns a clinician trust with complex patients.",
    },
    {
      id: "mhr-brown-bag", kind: "find", noHint: true, noRobot: false,
      targets: ["mhr-bottle-thinner", "mhr-bottle-bone"],
      itemNames: { "mhr-bottle-thinner": "an anticoagulant from cardiology", "mhr-bottle-bone": "a weekly bone-density tablet" },
      itemNotes: {
        "mhr-bottle-thinner": "An anticoagulant, prescribed by a cardiologist, that the form does not mention. It changes how the socket will bleed after an extraction, and it is the kind of medicine a patient leaves off because they think of it as a heart pill, not a dental matter.",
        "mhr-bottle-bone": "A weekly antiresorptive tablet for osteoporosis, also missing from the form. Medicines in this family carry a risk of the jaw bone failing to heal after an extraction, and the dentist needs to know before anything is planned.",
      },
      title: "Find the two medicines in the bag that are not on the form",
      cue: "The patient brought every bottle they take. Two of them are missing from the written history.",
      why: "Patients leave medicines off forms all the time — not to hide them, but because they do not see what a heart pill or a weekly bone tablet has to do with teeth. Asking them to bring every bottle and checking the bag against the form is the most reliable way to close that gap, and the two missing here are exactly the ones that change an extraction. A clinician who reconciles medicines this carefully is the one a practice trusts with its medically complex patients.",
    },
    {
      id: "mhr-reconcile", kind: "sequence", anyOrder: true, noRobot: false,
      targets: ["mhr-field-drug", "mhr-field-reason", "mhr-field-prescriber"],
      itemNames: {
        "mhr-field-drug": "drug and dose",
        "mhr-field-reason": "what it is for",
        "mhr-field-prescriber": "who prescribes it",
      },
      itemNotes: {
        "mhr-field-drug": "The name and the dose exactly as the label reads, not as the patient remembers it.",
        "mhr-field-reason": "Why they take it, in their words — the reason often tells the dentist more than the drug name.",
        "mhr-field-prescriber": "Who prescribes it, because that is the person the dentist would consult.",
      },
      title: "Write every medicine onto the list with its dose, reason and prescriber",
      cue: "For each bottle, fill in the drug and dose, what it is for, and who prescribes it — in any order.",
      why: "A medication list is only useful if each line answers three questions: what exactly the patient takes, why, and who prescribed it. The drug and dose tell the dentist the risk; the reason explains the condition behind it; the prescriber is the person who would be consulted if anything needed to change. A list of names alone answers none of the questions that matter. Accurate reconciliation is a transferable clinical skill that opens doors well beyond dentistry.",
    },
    {
      id: "mhr-allergy-find", kind: "find", noHint: true, noRobot: false,
      targets: ["mhr-allergy-penicillin", "mhr-allergy-latex"],
      itemNames: { "mhr-allergy-penicillin": "penicillin — hives", "mhr-allergy-latex": "latex — lip swelling" },
      itemNotes: {
        "mhr-allergy-penicillin": "Penicillin, with hives as the reaction. If the dentist decides an antibiotic is needed, this line decides which one it cannot be.",
        "mhr-allergy-latex": "Latex, with lip swelling as the reaction. That rules out latex gloves, a latex dam and any latex-containing item on the tray for this patient, from the moment they walk in.",
      },
      title: "Find the two allergies that change today's appointment",
      cue: "Read the allergy section and the reactions. Two entries change what can be used today.",
      why: "An allergy entry is only half useful without the reaction beside it: hives and lip swelling tell the dentist how seriously to take it, and both of these change the room. A penicillin allergy narrows what can be prescribed; a latex allergy changes the gloves, the dam and anything else on the tray. Reading allergies with their reactions, and acting on them before the patient is seated, is the kind of vigilance that makes an assistant safe to leave in charge of a setup.",
    },
    {
      id: "mhr-drug-reference", kind: "select", target: "mhr-drug-reference", noRobot: false,
      title: "Look up the dental implications of each medicine",
      cue: "Check the practice's drug reference for what each medicine means for dental treatment, and note it for the dentist.",
      why: "A clinician is not expected to know every drug, but is expected to look each one up. The practice's drug reference says what matters for dentistry: that an anticoagulant means more bleeding and local measures to control it, that an antiresorptive bone medicine raises the risk of the jaw failing to heal after surgery, and that many common drugs cause dry mouth. The ADA's guidance covers both of the medicines here. Knowing where to look, and doing it every time, is a professional habit that separates a clinician from a helper.",
    },
    {
      id: "mhr-listen", kind: "hold", target: "mhr-listen-point", seconds: 7,
      noRobot: true,
      robotNote: "Hearing a patient explain their own medicines is a conversation whose whole content is a person; it stays with the clinician.",
      title: "Let the patient explain their medicines in their own words",
      cue: "Ask what each new medicine is for and how long they have taken it — then listen without interrupting.",
      holdBreakNote: "You cut in. The patient was about to say why the blood thinner was started — let them finish; that detail is often the one the dentist needs.",
      why: "The bottle tells you the drug; the patient tells you the story — the heart rhythm problem that led to the blood thinner, the fracture that led to the bone tablet, the week they stopped it on their own. People give that story to someone who listens without rushing them. Open questions and silence are clinical tools, and a hygienist who can use them finds out what a form never shows, which is exactly the skill that leads into public-health and care-coordination work.",
    },
    {
      id: "mhr-read-back", kind: "track", target: "mhr-med-list", seconds: 8, noRobot: false,
      title: "Read the finished list back at the patient's pace",
      cue: "Read each line back and let the patient confirm it — steady enough for them to follow, not so slow they drift.",
      track: {
        start: 0.2, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "READ-BACK PACE",
        readout: (v) => (v < 0.38 ? "dragging — attention drifting" : v > 0.62 ? "rushing — nodding without hearing" : "line by line, confirmed"),
      },
      holdBreakNote: "The read-back lost the patient. Go back to the last line they confirmed and carry on from there.",
      why: "A read-back is where errors get caught: a dose written wrong, a medicine stopped last month, an allergy that turns out to be a side effect. It only works at a pace the patient can actually follow — rushed, they nod along; dragged out, they drift. Line by line, with a real confirmation for each, turns the list into something both of you have agreed. Closed-loop communication like this is the standard across healthcare, and learning it here carries into every clinical career.",
    },
    {
      id: "mhr-flag-dentist", kind: "drag", target: "mhr-flag-folder", noRobot: false,
      drag: { to: "mhr-dentist-tray", radius: 0.4, missNote: "That is not the dentist's review tray. Carry the flagged history to the tray on the dentist's desk, flags facing up." },
      title: "Carry the flagged history to the dentist before anything is planned",
      cue: "Put the history in the dentist's review tray with the anticoagulant, the bone medicine and the allergies flagged.",
      why: "The whole point of finding these things is that the dentist sees them before the plan is final. A flagged history on the dentist's tray, with the anticoagulant, the antiresorptive medicine and both allergies clearly marked, puts the decision where the state dental board says it belongs. A history that stays with the person who took it is a history that never changed anything. Moving information to the right decision-maker on time is the core skill of every coordination role in a practice.",
    },
    {
      id: "mhr-consult-decision", kind: "select", target: "mhr-consult-form", noRobot: false,
      title: "Record the consult decision — per the dentist",
      cue: "Write down what the dentist decided about consulting the patient's physician, attributed to the dentist.",
      why: "The dentist decides whether to consult the physician who prescribes the anticoagulant or the bone medicine, and whether today's plan changes. What the team records is that decision, attributed to the dentist — 'medical consult requested before the extraction, per the dentist' — and never a decision of its own. Getting the attribution right protects the patient, the practice and the person writing it, and it is the discipline expected of anyone who hopes to coordinate treatment or manage a practice.",
    },
    {
      id: "mhr-alert-level", kind: "gauge", target: "mhr-alert-dial", noRobot: false,
      title: "Set the chart alert so it shows at every visit without drowning the record",
      cue: "Set the record's medical alert so the anticoagulant, the bone medicine and both allergies appear on the header — and nothing else.",
      gauge: {
        label: "CHART ALERT", speed: 0.58, green: [0.38, 0.6],
        readout: (t) => (t < 0.38 ? "buried in a note — nobody will see it" : t > 0.6 ? "everything flagged red — alarm fatigue" : "header alert: 4 flags"),
        missNote: "Outside the band. Buried in the notes, nobody sees it next visit; flag everything in red and people stop reading the red.",
      },
      why: "A flag nobody sees is useless, and so is a record where every line is red. The right alert puts exactly the items that change treatment — here the anticoagulant, the bone medicine, penicillin and latex — at the top of the record, where everyone opening it will see them without scrolling. Alarm fatigue is a real hazard in every clinical system, and setting alerts that people actually read is a small skill that shows real clinical judgement.",
    },
    {
      id: "mhr-team-checkin", kind: "select", target: "mhr-team-checkin", noRobot: false,
      title: "Check in with the dentist and the hygiene team",
      cue: "Share the four flags and the dentist's decision at the huddle, and ask how everyone's day is going.",
      why: "The dentist has decided; now the whole team needs to know before the patient is seated — the assistant who sets the tray, the front desk who books the consult, the hygienist who treats. The huddle is where a latex allergy stops being one person's knowledge and becomes the room's. Asking how everybody is doing at the same time keeps a busy clinic honest about its own capacity, and the clinician who runs that huddle well is on the way to leading one.",
    },
    {
      id: "mhr-history-log", kind: "select", target: "mhr-history-log", noRobot: false,
      title: "Sign the history log",
      cue: "Record the review date, the reconciled list, the flags, the consult decision per the dentist, and your signature.",
      why: "The signed log is the record that this review happened, what it found, and who did it: the date, a reconciled list, the four flags, and the consult decision attributed to the dentist. If there is ever a question about the extraction, this is what shows the team found and flagged what mattered. It also supports what the dentist records under the ADA's CDT code set. Careful clinical records are the foundation of every dental career beyond the chair.",
    },
  ],

  interrupts: [
    {
      id: "mhr-latex-setup",
      kind: "Latex allergy",
      after: "mhr-listen", delay: 3, seconds: 12,
      alert: "Through the open operatory door you can see the assistant laying a box of latex gloves and a latex dam onto this patient's tray.",
      cue: "Hang the latex-alert card on the operatory door so the room is reset before this patient is seated.",
      target: "mhr-latex-card",
      why: "A latex-allergic patient reacts to what touches them and to what is handled around them, so the room has to be latex-free before they are seated, not corrected after. The alert card on the door stops the setup where it is and tells everyone who walks in; the latex items come off the tray and non-latex ones go on.",
      missNote: "The latex tray went ahead. This patient, whose chart records lip swelling from latex, would have been seated in front of latex gloves and a latex dam — a reaction the whole review existed to prevent.",
      wrongNote: "It is the latex-alert card. The problem is in the operatory, so the operatory is what gets stopped and reset.",
    },
    {
      id: "mhr-printer-leak",
      kind: "Privacy breach",
      after: "mhr-read-back", delay: 3, seconds: 11,
      alert: "The medication list you sent to print has come out face up on the shared corridor printer, beside the waiting-room door.",
      cue: "Fetch the printout from the corridor tray now — the read-back can pause for that.",
      target: "mhr-printer-tray",
      why: "A printed medication list sitting face up by a waiting room is a disclosure waiting for somebody to glance down. Picking it up at once ends it; the read-back takes ten seconds to resume. Printing clinical documents to a shared corridor printer at all is worth raising at the next huddle.",
      missNote: "The list stayed on the corridor printer. Anyone passing could read the patient's anticoagulant, bone medicine and allergies — a disclosure HIPAA's safeguards exist to prevent, and one that took seconds to stop.",
      wrongNote: "It is the corridor printer tray. The disclosure is on paper out there, so that is where you go.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, MHR_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#d6d2dc", base2: "#cbc6d2", seam: "rgba(0,0,0,0.08)",
    }), { repeat: 4, px: 256 });
    const deskTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#e9e2d6", base2: "#ded6c8", seam: "rgba(0,0,0,0.05)",
    }), { repeat: 2, px: 256 });
    const floor = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xd6d2dc, { radius: 0.05, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.76, metal: 0.04, color: 0xdedae3 });

    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.frame ?? 0x2e2a3a, { rough: 0.5 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 384 });
      return b;
    };
    const lines = (title, rows, accent = MHR_CSS) => (cx, w, h) => {
      cx.fillStyle = "#14121c"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#efeaf8"; cx.font = `600 ${Math.round(h * 0.14)}px Arial, sans-serif`;
      cx.fillText(title, w * 0.05, h * 0.26);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.5 + i * 0.2)));
    };

    // ------------------------------------------------------------ the desk
    const desk = group(g, 0.35, 0, -1.0);
    const deskTop = slab(desk, 1.5, 0.04, 0.7, 0, 0.76, 0, 0xe9e2d6, { radius: 0.01, rough: 0.5 });
    deskTop.material = texturedMat(deskTex, { rough: 0.5, metal: 0.04, color: 0xffffff });
    for (const sx of [-1, 1]) box(desk, 0.04, 0.74, 0.64, sx * 0.72, 0.37, 0, 0x6f6a78, { rough: 0.5, metal: 0.3 });
    box(desk, 0.4, 0.5, 0.6, 0.5, 0.49, 0, 0xcfc8bb, { rough: 0.55 });
    for (let i = 0; i < 3; i++) box(desk, 0.34, 0.12, 0.01, 0.5, 0.34 + i * 0.15, 0.305, 0xbdb5a6, { rough: 0.5 });

    // The monitor, turned toward the corridor at first — a hazard — with the
    // alert dial on its base.
    const monitor = group(desk, -0.35, 0.78, -0.2, 0.9);
    box(monitor, 0.05, 0.22, 0.05, 0, 0.11, 0, 0x2b3138, { rough: 0.5 });
    box(monitor, 0.52, 0.32, 0.03, 0, 0.38, 0, 0x15181b, { rough: 0.4 });
    decal(monitor, 0.48, 0.28, 0, 0.38, 0.017, lines("PATIENT RECORD", ["Meds · allergies · history", "Consult: pending"]), { px: 320 });
    holoTag(monitor, "screen facing the corridor", 0, 0.6, 0, { css: MHR_ALERT, w: 0.48 });
    reg(hits, monitor, "mhr-open-screen");
    const alertDial = group(desk, -0.05, 0.8, 0.12);
    cyl(alertDial, 0.045, 0.045, 0.025, 0, 0, 0, MHR_ACCENT, { rough: 0.5, seg: 16 });
    box(alertDial, 0.008, 0.01, 0.04, 0, 0.015, 0.012, 0x1b1f24, { rough: 0.5 });
    holoTag(alertDial, "chart alert", 0, 0.08, 0, { css: MHR_CSS, w: 0.26 });
    reg(hits, alertDial, "mhr-alert-dial");

    // The brown bag of bottles.
    const bag = group(desk, 0.2, 0.78, 0.05);
    box(bag, 0.22, 0.18, 0.14, 0, 0.09, -0.12, 0xb08a5a, { rough: 0.95 });
    const BOTTLES = [
      ["mhr-bottle-thinner", -0.14, 0xf2a83c, "anticoagulant"],
      ["mhr-bottle-bone", 0.0, 0xf2f2f2, "weekly bone tablet"],
    ];
    for (const [id, x, colour, label] of BOTTLES) {
      const b = group(bag, x, 0, 0.08);
      cyl(b, 0.025, 0.025, 0.08, 0, 0.04, 0, colour, { rough: 0.4, seg: 12, opacity: 0.85, transparent: true });
      cyl(b, 0.027, 0.027, 0.02, 0, 0.09, 0, 0xffffff, { rough: 0.5, seg: 12 });
      holoTag(b, label, 0, 0.14, 0, { css: MHR_CSS, w: 0.3 });
      reg(hits, b, id);
    }
    for (let i = 0; i < 2; i++) {
      cyl(bag, 0.022, 0.022, 0.07, 0.12 + i * 0.06, 0.035, 0.06, [0xf2a83c, 0x5aa0d8][i], { rough: 0.4, seg: 10, opacity: 0.85, transparent: true });
    }

    // The written history and the medication list.
    const history = group(desk, -0.4, 0.785, 0.15);
    const historySheet = decal(history, 0.24, 0.3, 0, 0, 0, paperFace("HEALTH HISTORY", ["Name · DOB", "Updated: ____", "Signature: ____"], { band: MHR_CSS }), { px: 256 });
    historySheet.rotation.x = -Math.PI / 2;
    const FORM = [["mhr-two-identifiers", 0.08, "1 · two identifiers"], ["mhr-update-date", 0.0, "2 · today's date"], ["mhr-signature-line", -0.08, "3 · signature"]];
    for (const [id, dz, label] of FORM) {
      const f = group(history, 0.19, 0.01, -dz);
      box(f, 0.1, 0.012, 0.05, 0, 0, 0, 0x3a3450, { rough: 0.5 });
      holoTag(f, label, 0, 0.05, 0, { css: MHR_CSS, w: 0.26 });
      reg(hits, f, id);
    }
    const medList = group(desk, 0.02, 0.785, 0.2);
    box(medList, 0.24, 0.012, 0.32, 0, 0, 0, 0x6f5a3a, { rough: 0.6 });
    const medFace = decal(medList, 0.22, 0.3, 0, 0.008, 0, paperFace("MEDICATION LIST", ["Drug · dose", "Reason", "Prescriber"], { band: MHR_CSS }), { px: 256 });
    medFace.rotation.x = -Math.PI / 2;
    holoTag(medList, "medication list", 0, 0.08, -0.12, { css: MHR_CSS, w: 0.32 });
    reg(hits, medList, "mhr-med-list");
    const FIELDS = [["mhr-field-drug", -0.1, "drug · dose"], ["mhr-field-reason", 0.0, "reason"], ["mhr-field-prescriber", 0.1, "prescriber"]];
    for (const [id, dx, label] of FIELDS) {
      const f = group(desk, 0.02 + dx, 0.8, 0.42);
      box(f, 0.08, 0.012, 0.05, 0, 0, 0, 0x4a4466, { rough: 0.5 });
      holoTag(f, label, 0, 0.05, 0, { css: MHR_CSS, w: 0.2 });
      reg(hits, f, id);
    }
    // The allergy section, pinned to the side of the monitor.
    const allergy = board(0.36, 0.26, -0.75, 1.5, -1.35, lines("ALLERGIES", ["", ""]), { ry: 0.5 });
    const ALLERGIES = [["mhr-allergy-penicillin", 0.0, "Penicillin — hives"], ["mhr-allergy-latex", -0.08, "Latex — lip swelling"]];
    for (const [id, y, label] of ALLERGIES) {
      const a = group(allergy, 0, y, 0.014);
      box(a, 0.32, 0.06, 0.008, 0, 0, 0, 0x3a1f24, { rough: 0.5 });
      decal(a, 0.3, 0.05, 0, 0, 0.005, signFace(label, { bg: "#3a1f24", accent: MHR_ALERT, fg: "#f8e8e8", scale: 0.42 }), { px: 192 });
      reg(hits, a, id);
    }
    // The drug reference and the listening marker between you and the patient.
    const reference = group(desk, 0.55, 0.79, 0.15, -0.2);
    box(reference, 0.2, 0.05, 0.26, 0, 0, 0, 0x2f4a6a, { rough: 0.6 });
    box(reference, 0.19, 0.04, 0.005, 0, 0, 0.13, 0xf2efe6, { rough: 0.8 });
    holoTag(reference, "drug reference", 0, 0.08, 0, { css: MHR_CSS, w: 0.3 });
    reg(hits, reference, "mhr-drug-reference");
    const listen = group(g, -0.3, 1.05, -0.35);
    const listenRing = cyl(listen, 0.07, 0.07, 0.006, 0, 0, 0, MHR_ACCENT, { emissive: MHR_ACCENT, ei: 0.6, rough: 0.4, seg: 20 });
    ownMaterial(listenRing);
    listenRing.rotation.x = Math.PI / 2;
    holoTag(listen, "listen", 0, 0.12, 0, { css: MHR_CSS, w: 0.18 });
    reg(hits, listen, "mhr-listen-point");
    // Hazards on the desk: the stop-your-thinner slip, the antibiotic sample
    // and the used lancet.
    const slip = group(desk, 0.35, 0.785, 0.28, 0.3);
    const slipFace = decal(slip, 0.14, 0.1, 0, 0, 0, paperFace("PRE-OP", ["STOP blood thinner", "3 days before"], { band: MHR_ALERT }), { px: 160 });
    slipFace.rotation.x = -Math.PI / 2;
    holoTag(slip, "'stop your thinner' slip", 0, 0.06, 0, { css: MHR_ALERT, w: 0.42 });
    reg(hits, slip, "mhr-stop-thinner-note");
    const lancet = group(desk, -0.62, 0.79, 0.25);
    cyl(lancet, 0.006, 0.006, 0.04, 0, 0, 0, 0x5aa0d8, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    cyl(lancet, 0.0012, 0.0012, 0.012, 0.026, 0, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(lancet, "used lancet", 0, 0.05, 0, { css: MHR_ALERT, w: 0.24 });
    reg(hits, lancet, "mhr-used-lancet");

    // --------------------------------------------------- the patient's chair
    const pChair = group(g, -0.95, 0, -0.85, Math.PI / 2);
    slab(pChair, 0.5, 0.08, 0.48, 0, 0.44, 0, 0x5a4a7a, { radius: 0.03, rough: 0.7 });
    slab(pChair, 0.5, 0.5, 0.08, 0, 0.72, -0.22, 0x5a4a7a, { radius: 0.03, rough: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(pChair, 0.015, 0.015, 0.42, sx * 0.21, 0.21, sz * 0.2, 0x3a3f46, { rough: 0.4, metal: 0.6, seg: 8 });
    const patient = seatedFigure(pChair, 0, 0.44, -0.02, { cloth: 0x8a5a4a, legs: 0x3a3f46 });
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    // Your own chair, on the desk side.
    const myChair = group(g, 0.4, 0, -0.15, Math.PI);
    slab(myChair, 0.46, 0.08, 0.44, 0, 0.46, 0, 0x2e3a4a, { radius: 0.03, rough: 0.7 });
    cyl(myChair, 0.03, 0.03, 0.4, 0, 0.23, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    cyl(myChair, 0.22, 0.24, 0.03, 0, 0.02, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 14 });

    // ------------------------------------------------ door, card and printer
    const doorFrame = group(g, 2.3, 0, -0.2, -Math.PI / 2);
    box(doorFrame, 0.06, 2.1, 0.08, -0.48, 1.05, 0, 0x8b8494, { rough: 0.5 });
    box(doorFrame, 0.06, 2.1, 0.08, 0.48, 1.05, 0, 0x8b8494, { rough: 0.5 });
    box(doorFrame, 1.02, 0.06, 0.08, 0, 2.1, 0, 0x8b8494, { rough: 0.5 });
    const doorLeaf = group(doorFrame, -0.45, 0, 0.02);
    const leaf = box(doorLeaf, 0.88, 2.02, 0.04, 0.44, 1.02, 0, 0xc9b99a, { rough: 0.6 });
    ownMaterial(leaf);
    doorLeaf.rotation.y = -1.1;
    const handle = group(doorLeaf, 0.8, 1.02, 0.04);
    cyl(handle, 0.02, 0.02, 0.03, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = Math.PI / 2;
    box(handle, 0.1, 0.016, 0.016, 0.04, 0, 0.02, CITY.steel, { rough: 0.3, metal: 0.85 });
    holoTag(handle, "door handle", 0, 0.1, 0, { css: MHR_CSS, w: 0.26 });
    reg(hits, handle, "mhr-door-handle");

    const printer = group(g, 1.95, 0, 1.25, -2.2);
    box(printer, 0.5, 0.7, 0.4, 0, 0.35, 0, 0x6f6a78, { rough: 0.5 });
    box(printer, 0.46, 0.22, 0.36, 0, 0.82, 0, 0xdedbe4, { rough: 0.45 });
    const tray = group(printer, 0, 0.95, 0.1);
    box(tray, 0.3, 0.012, 0.18, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const printout = box(tray, 0.2, 0.004, 0.28, 0, 0.01, 0.02, 0xfafafa, { rough: 0.9 });
    printout.visible = false;
    holoTag(tray, "corridor printer", 0, 0.12, 0, { css: MHR_CSS, w: 0.32 });
    reg(hits, tray, "mhr-printer-tray");

    // The operatory beyond, with the tray being set and the alert card.
    const opTray = group(g, -1.95, 0, -1.75, 0.6);
    cyl(opTray, 0.025, 0.025, 0.84, 0, 0.42, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    slab(opTray, 0.46, 0.03, 0.32, 0, 0.86, 0, 0xc9d1d6, { radius: 0.01, rough: 0.4, metal: 0.4 });
    const latexBox = box(opTray, 0.18, 0.08, 0.1, -0.1, 0.92, 0, 0xe8d8a8, { rough: 0.6 });
    ownMaterial(latexBox);
    latexBox.visible = false;
    const nitrileBox = box(opTray, 0.18, 0.08, 0.1, 0.1, 0.92, 0, 0x5a7fd0, { rough: 0.6 });
    nitrileBox.visible = false;
    holoTag(opTray, "operatory tray", 0, 1.05, 0, { css: MHR_CSS, w: 0.3 });
    const card = group(g, -1.55, 1.3, -0.25, 0.9);
    box(card, 0.2, 0.26, 0.01, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    decal(card, 0.18, 0.22, 0, 0, 0.006, signFace("LATEX ALERT", { bg: "#f2c14b", accent: "#1b1f24", fg: "#1b1f24", scale: 0.36 }), { px: 128 });
    holoTag(card, "latex-alert card", 0, 0.2, 0, { css: MHR_CSS, w: 0.32 });
    reg(hits, card, "mhr-latex-card");
    const cardHome = card.position.clone();
    const assistant = standingFigure(g, -2.25, -1.0, { ry: 1.2, cloth: 0x4a7f7a });
    holoTag(assistant, "assistant", 0, 1.86, 0, { css: MHR_CSS, w: 0.24 }).rotation.y = -1.2;

    // A sample cupboard with the antibiotic sample on its shelf.
    const cupboard = group(g, 1.35, 0, -2.05, -0.2);
    box(cupboard, 0.7, 1.4, 0.36, 0, 0.7, 0, 0xdedbe4, { rough: 0.55 });
    for (let i = 0; i < 3; i++) box(cupboard, 0.66, 0.02, 0.32, 0, 0.35 + i * 0.4, 0.01, 0xbdb8c6, { rough: 0.5 });
    const sample = group(cupboard, 0.15, 1.17, 0.12);
    box(sample, 0.12, 0.07, 0.04, 0, 0, 0, 0xf2f6f8, { rough: 0.6 });
    box(sample, 0.12, 0.02, 0.041, 0, 0.02, 0, 0xd8342a, { rough: 0.6 });
    holoTag(sample, "antibiotic sample", 0, 0.1, 0, { css: MHR_ALERT, w: 0.34 });
    reg(hits, sample, "mhr-antibiotic-sample");
    const sharps = group(cupboard, -0.2, 1.52, 0.02);
    box(sharps, 0.22, 0.26, 0.16, 0, 0, 0, 0xd8342a, { rough: 0.6 });
    decal(sharps, 0.18, 0.1, 0, 0, 0.082, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.4 }), { px: 128 });

    // Binders on the cupboard's middle shelf: the practice's own policies.
    for (let i = 0; i < 5; i++) box(cupboard, 0.06, 0.26, 0.22, -0.26 + i * 0.07, 0.9, 0.02, [0x2f4a6a, 0x5a4a7a, 0x2f6f5a, 0x7a4f3a, 0x3a3f46][i], { rough: 0.7 });

    // ------------------------------------ dentist's tray, consult form, boards
    const dentistDesk = group(g, 1.75, 0, -0.95, -1.2);
    slab(dentistDesk, 0.8, 0.04, 0.5, 0, 0.76, 0, 0x6f5a3a, { radius: 0.01, rough: 0.6 });
    for (const sx of [-1, 1]) box(dentistDesk, 0.04, 0.74, 0.46, sx * 0.38, 0.37, 0, 0x4a3a2a, { rough: 0.6 });
    const inTray = group(dentistDesk, -0.2, 0.8, 0.02);
    box(inTray, 0.28, 0.04, 0.34, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    decal(inTray, 0.2, 0.05, 0, 0.05, 0.17, signFace("DENTIST — REVIEW", { bg: "#1b1f24", accent: MHR_CSS, scale: 0.4 }), { px: 128 });
    hits["mhr-dentist-tray"] = inTray;
    const consult = group(dentistDesk, 0.18, 0.785, 0.02);
    const consultFace = decal(consult, 0.22, 0.28, 0, 0, 0, paperFace("CONSULT DECISION", ["Physician consult:", "____ per the dentist"], { band: MHR_CSS }), { px: 256 });
    consultFace.rotation.x = -Math.PI / 2;
    holoTag(consult, "consult form", 0, 0.07, 0, { css: MHR_CSS, w: 0.28 });
    reg(hits, consult, "mhr-consult-form");
    const folder = group(desk, -0.15, 0.79, 0.3);
    box(folder, 0.24, 0.02, 0.3, 0, 0, 0, 0xc9a34a, { rough: 0.7 });
    for (let i = 0; i < 4; i++) box(folder, 0.03, 0.022, 0.04, -0.09 + i * 0.06, 0.004, -0.15, [0xf0645b, 0xf2a83c, 0xf2c14b, 0x9f8fe0][i], { rough: 0.6 });
    holoTag(folder, "flagged history", 0, 0.07, 0, { css: MHR_CSS, w: 0.3 });
    reg(hits, folder, "mhr-flag-folder");

    const checkin = board(0.44, 0.28, -0.2, 1.72, -2.35, lines("TEAM CHECK-IN", ["Four flags · the decision", "How is everyone doing?"], "#7fc4d8"), { frame: 0x22323a });
    reg(hits, checkin.userData.face, "mhr-team-checkin");
    const log = board(0.4, 0.3, 0.4, 1.72, -2.35, paperFace("HISTORY LOG", ["Reviewed · reconciled", "Flags · consult per dentist", "Signed"], { band: MHR_CSS }));
    reg(hits, log.userData.face, "mhr-history-log");

    const dentist = standingFigure(g, 2.55, 0.9, { ry: -1.9, cloth: 0x2f5f70 });
    holoTag(dentist, "the dentist", 0, 1.86, 0, { css: MHR_CSS, w: 0.28 }).rotation.y = 1.9;

    const panel = holoPanel(g, 0.8, 0.5, -1.2, 1.98, -2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(16,12,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = MHR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#d8cff8"; cx.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("BEFORE THE EXTRACTION", w * 0.06, h * 0.16);
      cx.fillStyle = "#f3effb"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Every bottle on the list", "Thinner · bone medicine · allergies", "Find, record, flag — never decide", "Consult decision: per the dentist"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: MHR_ACCENT });
    void panel;

    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.2, 0.06, 0.34, i * 1.1, 2.62, -0.9, 0xe8e4ee, { rough: 0.4, cast: false });
      box(g, 1.08, 0.02, 0.26, i * 1.1, 2.585, -0.9, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.55, rough: 0.4, cast: false });
    }
    const key = new THREE.DirectionalLight(0xfff4e8, 0.85);
    key.position.set(-2.4, 4.6, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xf6f2ff, 0x5d6a72, 0.9));

    const tickMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.5, rough: 0.5 });

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.0, -0.9),

      onStepComplete(step) {
        if (step.id === "mhr-door-close") doorLeaf.rotation.y = 0;
        if (step.id === "mhr-reconcile") repaint(medFace, paperFace("MEDICATION LIST", ["Anticoagulant · cardiology", "Bone tablet weekly · GP", "+ 2 others"], { band: MHR_CSS }));
        if (step.id === "mhr-flag-dentist") { folder.parent.remove(folder); inTray.add(folder); folder.position.set(0, 0.03, 0); }
        if (step.id === "mhr-consult-decision") repaint(consultFace, paperFace("CONSULT DECISION", ["Physician consult before", "extraction — per the dentist"], { band: "#59c97b" }));
        if (step.id === "mhr-alert-level") alertDial.children[0].material = tickMat;
        if (step.id === "mhr-history-log") repaint(log.userData.face, paperFace("HISTORY LOG", ["Reviewed today", "4 flags · consult per dentist", "Signed"], { band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "mhr-latex-setup") {
          latexBox.visible = true;
          latexBox.material.emissive.set(0xd8342a);
          latexBox.material.emissiveIntensity = 0.6;
          assistant.rotation.y = 0.4;
        }
        if (it.id === "mhr-printer-leak") printout.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "mhr-latex-setup") {
          latexBox.visible = false;
          nitrileBox.visible = true;
          card.position.set(cardHome.x - 0.35, cardHome.y + 0.3, cardHome.z - 0.9);
        }
        if (it.id === "mhr-printer-leak") {
          printout.visible = false;
          box(folder, 0.2, 0.004, 0.26, 0, 0.014, 0, 0xfafafa, { rough: 0.9 });
        }
      },

      onHazard() {},

      animate(t) {
        patient.head.rotation.y = Math.sin(t * 0.5) * 0.06;
        listenRing.material.emissiveIntensity = 0.4 + Math.abs(Math.sin(t * 1.6)) * 0.5;
      },
    };
  },
};
