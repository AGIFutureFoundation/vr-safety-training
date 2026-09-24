import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, ownMaterial, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dental Coding, Billing & Pre-authorisation VR — Dental & Oral
// Health.
//
// The billing office behind the front desk, where a crown for a patient with
// two dental plans becomes a claim: eligibility verified before anything is
// coded, the clinical note checked for what it actually supports, a gap in it
// sent back to the dentist rather than filled in, the procedure looked up in
// the current CDT, the payers put in the right order, a pre-authorisation
// narrative written to the length a reviewer needs, the packet sent through
// the payer's secure portal, the explanation of benefits read for what it
// got wrong, an appeal made calmly, the payment posted to the contract, and
// the records locked away.
//
// CDT is cited as the ADA's code set and never by a code number: the codes
// change every year and a number quoted in a training station is a number
// somebody copies. No real payer, plan or clearinghouse is named. The Unspoken
// Smiles programme is named only as the programme this platform is built for.

const CBP_ACCENT = 0xd9b85a;
const CBP_CSS = "#d9b85a";
const CBP_ALERT = "#f0645b";

export const SIM_DN_DENTAL_CODING_BILLING_AND_PREAUTHORISATION = {
  id: "dn-dental-coding-billing-and-preauthorisation",
  index: "322",
  domain: "Dental",
  trade: "Dental billing and insurance coordinator — coding, claims and pre-authorisation, SEIU and UFCW clinic and front-office staff",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "The ADA's Code on Dental Procedures and Nomenclature (CDT), cited as the code set and never by a number, and the ADA's dental claim form; the state dental board's rules that the dentist's signed clinical record is what every claim must be supported by; HIPAA's privacy and security rules, including access controls, the minimum-necessary standard and the standard electronic transactions a claim travels in; OSHA 29 CFR 1910.1030 for the front-office staff named in the exposure control plan who help when a patient collapses; SEIU and UFCW clinic and front-office staff; Unspoken Smiles, the programme this platform is built for",
  name: "Dental Coding, Billing & Pre-authorisation",
  title: simTitle("Dental Coding, Billing & Pre-authorisation"),
  tagline: "A crown and two dental plans turned into an honest claim: eligibility first, the note read for what it supports, a gap sent back to the dentist, the current CDT, payers in order, a portal rather than a fax, and an appeal made on the facts",
  accent: CBP_ACCENT,
  accentCss: CBP_CSS,
  parSeconds: 310,
  footprint: 2.3,
  badge: { id: "clean-claim", name: "Clean Claim", note: "A claim and a pre-authorisation built only on what the signed record supports, sent securely and paid to the contract" },
  supportLine: "your clinic's employee assistance line, or the office manager you debrief with — a day of denials and difficult calls wears people down",

  game: system({
    name: "Clean Claim",
    currency: "CLAIM",
    ranks: ["Front-Office Trainee", "Insurance Clerk", "Billing Coordinator", "Revenue Lead", "Clean Claim Certified"],
    badges: [
      { id: "note-first", name: "Note First", note: "Both documentation gaps found before a code was looked up", test: AWARD.stepClean("cbp-note-gaps") },
      { id: "honest-books", name: "Honest Books", note: "No unsafe action anywhere in the claim", test: AWARD.safe },
      { id: "steady-call", name: "Steady Call", note: "The shredder and the appeal call carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "zero-rework", name: "Zero Rework", note: "No corrections anywhere in the claim", test: AWARD.clean },
      { id: "right-length", name: "Right Length", note: "The narrative set near the middle of its band", test: AWARD.precise(0.72) },
      { id: "same-day", name: "Same Day", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cbp-shared-login": "That is the office's shared billing login, written on a sticky note on the monitor. Access to patient records is meant to be individual, so that every look and every change can be traced to a person; HIPAA's security rule expects exactly that. A shared password means nothing in the billing system can be attributed, audited or trusted — including the claims you are about to send.",
    "cbp-upcode-sheet": "That is a cheat sheet mapping procedures to the codes 'that pay better'. Billing a code for a more extensive procedure than the record shows is upcoding, and it is fraud against the plan however the sheet describes it. The CDT code on a claim is a statement that this procedure was done; it has to match the signed note exactly, whatever it pays.",
    "cbp-fax-sticky": "That is the fax machine, with a number scribbled on a sticky note beside it 'for that insurer'. A pre-authorisation packet carries radiographs, a chart and a narrative about a named person, and a misdialled or outdated fax number sends all of it to a stranger. Claims and attachments go through the payer's secure portal, to a destination the practice has verified.",
    "cbp-waive-stamp": "That is a 'copay waived' stamp used on every statement. Routinely waiving a patient's share while billing the plan as though it was charged misrepresents the fee to the payer, which is why plans treat routine waivers as a form of insurance fraud. Hardship adjustments exist, case by case and documented; a stamp that makes it the default does not.",
  },

  lateNotes: {
    "cbp-cdt-book": "Not yet. The code is looked up once the note is complete and signed — code from the record, not from what the plan was expected to be.",
    "cbp-ledger": "Nothing to post yet. The ledger is updated from the explanation of benefits once it has been read and any error appealed.",
    "cbp-billing-log": "The work is not finished. The billing log records what was sent, paid and appealed, at the end.",
  },

  steps: [
    {
      id: "cbp-eligibility", kind: "sequence", noRobot: false,
      targets: ["cbp-elig-identity", "cbp-elig-active", "cbp-elig-limits"],
      itemNames: {
        "cbp-elig-identity": "subscriber and patient identity",
        "cbp-elig-active": "coverage active on the date of service",
        "cbp-elig-limits": "frequency limits and waiting periods",
      },
      outOfOrderNote: "Out of order. Confirm whose coverage it is first, then that it is active on the date, and only then read its limits — a plan's limits mean nothing if the plan is someone else's or has lapsed.",
      title: "Verify eligibility before anything is coded",
      cue: "Confirm the subscriber and patient, that coverage is active on the date of service, then the frequency limits and waiting periods.",
      why: "Most claim denials are decided before any code is chosen: the wrong subscriber, a plan that lapsed last month, a crown inside a replacement-frequency limit. Verifying identity, then active coverage, then the plan's limits, in that order, catches all three while the patient can still be told. It is the unglamorous first habit of every good insurance coordinator, and it is the one practices look for when they hire into billing and revenue-cycle roles.",
    },
    {
      id: "cbp-note-gaps", kind: "find", noHint: true, noRobot: false,
      targets: ["cbp-note-unsigned", "cbp-note-no-surfaces"],
      itemNames: { "cbp-note-unsigned": "the note is not signed by the dentist", "cbp-note-no-surfaces": "the tooth and surfaces are missing" },
      itemNotes: {
        "cbp-note-unsigned": "The clinical note has no signature. A claim is supported by the dentist's signed record, and an unsigned note supports nothing — including this claim.",
        "cbp-note-no-surfaces": "The note says 'crown prep' but never records which tooth or why. A reviewer asks exactly those two questions, and the record has to answer them.",
      },
      title: "Find the two gaps in the clinical note before anything is coded",
      cue: "Read the dentist's note for this visit. Two things are missing that the claim cannot go without.",
      why: "A claim is only ever as good as the record under it. An unsigned note and a note that never says which tooth or why are the two gaps that turn a legitimate claim into a denial — or, worse, into a claim nobody could defend in an audit. Reading the note before the code book is what separates a coder from somebody who types numbers, and it is the skill that carries into auditing and compliance careers.",
    },
    {
      id: "cbp-query-dentist", kind: "select", target: "cbp-query-tray", noRobot: false,
      title: "Send the documentation query back to the dentist",
      cue: "Put a query in the dentist's tray asking for the tooth, the reason and a signature — never fill the gap in yourself.",
      why: "When the record is incomplete, the only person who can complete it is the one who did the work. A query asks the dentist to add the tooth, the reason and a signature to their own note, as an amendment that shows when it was made; it never suggests an answer and never gets filled in by the billing office from memory. The state dental board treats the clinical record as the dentist's. Knowing where your job stops is what makes a billing professional trustworthy.",
    },
    {
      id: "cbp-cdt-lookup", kind: "select", target: "cbp-cdt-book", noRobot: false,
      title: "Look the procedure up in this year's CDT, matching the note exactly",
      cue: "Find the procedure in the current year's CDT whose nomenclature and descriptor match the amended note — no more, no less.",
      why: "The ADA publishes CDT and updates it every year, adding, revising and retiring codes, so the right code is the one in this year's book whose descriptor matches what the signed note records — not the one remembered from last year and not the one the plan pays best. A code is a factual statement about a person's treatment. Coding precisely from the current set is the core technical skill of dental billing, and it is what certification and advancement in the field are built on.",
    },
    {
      id: "cbp-payer-order", kind: "sequence", noRobot: false,
      targets: ["cbp-payer-own", "cbp-payer-spouse", "cbp-payer-her-share"],
      itemNames: {
        "cbp-payer-own": "the patient's own employer plan",
        "cbp-payer-spouse": "the spouse's plan, where she is a dependent",
        "cbp-payer-her-share": "the patient's remaining share",
      },
      outOfOrderNote: "Out of order. The plan that covers her as the employee pays first, the plan that covers her as a dependent pays second, and she is billed only for what is left.",
      title: "Put the two plans and the patient in the right order",
      cue: "Primary first — her own employer plan — then her spouse's plan, then her remaining share.",
      why: "When a patient has two dental plans, coordination of benefits decides who pays first, and billing them in the wrong order produces denials, overpayments that have to be refunded and statements that make no sense to the patient. The plan covering her as the employee is primary; the plan covering her as a dependent is secondary and needs the primary's explanation of benefits; the patient pays what is left. Getting coordination right is a skill employers specifically hire billing staff for.",
    },
    {
      id: "cbp-narrative", kind: "gauge", target: "cbp-narrative-dial", noRobot: false,
      title: "Write the pre-authorisation narrative to the length a reviewer needs",
      cue: "Say which tooth, what is wrong with it and why a crown — specifically — and commit the narrative inside the band.",
      gauge: {
        label: "NARRATIVE DETAIL", speed: 0.6, green: [0.38, 0.6],
        readout: (t) => (t < 0.38 ? "'crown needed' — tells the reviewer nothing" : t > 0.6 ? "a page of history — the point is buried" : "tooth · fracture · why a crown"),
        missNote: "Outside the band. Too thin and the reviewer has nothing to approve; too long and the one sentence that matters is lost in a page nobody reads.",
      },
      why: "A reviewer who has never seen the patient decides from the narrative and its attachments. 'Crown needed' gives them nothing to approve; a page of dental history buries the reason. What works is short and specific, taken from the dentist's note: the tooth, the fracture or failing restoration, and why a crown rather than a filling. Writing clearly for a reader who is looking for a reason to say no is a skill that transfers to every administrative career in healthcare.",
    },
    {
      id: "cbp-send-portal", kind: "drag", target: "cbp-preauth-packet", noRobot: false,
      drag: { to: "cbp-portal-scanner", radius: 0.4, missNote: "That is not the portal upload. The packet goes through the payer's secure portal scanner — not the fax, not an email." },
      title: "Send the pre-authorisation through the payer's secure portal",
      cue: "Carry the packet — narrative, radiograph and chart — to the portal scanner and upload it to the payer's secure site.",
      why: "The packet contains radiographs, a chart and a narrative about a named person, which makes where it goes as important as what it says. The payer's secure portal sends it encrypted to a verified destination and returns a tracking reference; a fax to a number on a sticky note or an email attachment does neither. HIPAA's security rule expects the practice to choose the safe route. Handling protected information properly is a baseline expectation of every healthcare office job.",
    },
    {
      id: "cbp-shred-hold", kind: "hold", target: "cbp-shredder", seconds: 6, noRobot: false,
      title: "Hold the misprinted claim in the cross-cut shredder until it is through",
      cue: "Feed the misprinted claim into the cross-cut shredder and hold it until the whole sheet has gone.",
      holdBreakNote: "You let go with half the sheet still in the throat. The name and the plan number are sitting in the slot — feed it back and hold it until it is gone.",
      why: "A misprinted claim still carries a name, a date of birth, a plan number and a procedure. It goes into a cross-cut shredder and is held there until the whole sheet is through, not dropped in a recycling box or left half-fed in the slot. It is a small, physical piece of privacy practice that offices get wrong constantly. Being the person who does it properly every time is part of being trusted with a practice's records.",
    },
    {
      id: "cbp-eob-find", kind: "find", noHint: true, noRobot: false,
      targets: ["cbp-eob-fee", "cbp-eob-alternate"],
      itemNames: { "cbp-eob-fee": "paid at last year's fee schedule", "cbp-eob-alternate": "an alternate benefit applied without the narrative being read" },
      itemNotes: {
        "cbp-eob-fee": "The payment was calculated on last year's contracted fee. It is an underpayment the practice is entitled to have corrected.",
        "cbp-eob-alternate": "The plan applied an alternate benefit, paying for a cheaper filling instead of the crown, with no sign the narrative about the fracture was considered. That is appealable on the record.",
      },
      title: "Find the two things the explanation of benefits got wrong",
      cue: "Read the explanation of benefits line by line against the claim and the contract. Two lines are wrong.",
      why: "An explanation of benefits is the payer's account of what it decided, and payers make mistakes: an out-of-date fee schedule, an alternate benefit applied without reading the narrative. Posting whatever arrives means accepting both. Reading each line against the claim and the contract is how a billing coordinator protects both the practice and the patient, who would otherwise be billed for the payer's error. It is the analytical core of revenue-cycle work.",
    },
    {
      id: "cbp-appeal-call", kind: "track", target: "cbp-headset", seconds: 8, noRobot: false,
      title: "Keep the appeal call calm, factual and on the record",
      cue: "Stay steady with the payer's representative: the claim, the contract fee, the narrative, and a reference number for the appeal.",
      track: {
        start: 0.2, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "CALL TONE",
        readout: (v) => (v < 0.38 ? "giving up — 'fine, whatever it pays'" : v > 0.62 ? "heated — the representative has stopped helping" : "calm, factual, reference noted"),
      },
      holdBreakNote: "The call slipped. Take a breath, go back to the facts — the claim, the fee, the narrative — and ask again for the reference.",
      why: "An appeal is won on facts, delivered calmly: the claim number, the contracted fee, the narrative the reviewer did not consider, and a request for a reference number and a written reconsideration. Getting heated loses the representative; giving up loses the money and leaves the patient with a bill they should not have. Steady, professional persistence on the phone is the skill that separates good billing staff from great ones, and it leads into office-management roles.",
    },
    {
      id: "cbp-post-ledger", kind: "select", target: "cbp-ledger", noRobot: false,
      title: "Post the payment and the adjustment to the contract",
      cue: "Post what was paid, write off only what the participation contract requires, and show the appeal as pending.",
      why: "The ledger is where the patient's bill is decided, so it has to follow the contract exactly: the payment posted as received, the contractual adjustment written off, the appealed difference held as pending rather than billed to the patient, and nothing waived that the contract does not allow. A ledger posted this carefully means the statement the patient receives is one the office can explain line by line. Accurate posting is the backbone of every accounts role in healthcare.",
    },
    {
      id: "cbp-cabinet-lock", kind: "turn", target: "cbp-cabinet-key", noRobot: false,
      turn: { turns: 0.75, axis: "z", label: "CABINET KEY" },
      title: "Lock the records cabinet before leaving the desk",
      cue: "Put the paper claims and the query copies back and turn the key.",
      why: "Paper still exists in every dental office: printed explanations of benefits, attachment copies, signed financial agreements. A records cabinet left unlocked while the billing coordinator steps away is an open file for anybody who walks behind the desk. Locking it every time you leave is the physical half of HIPAA's safeguards, and it is exactly the kind of routine that shows a practice you can be trusted with more responsibility.",
    },
    {
      id: "cbp-team-checkin", kind: "select", target: "cbp-team-checkin", noRobot: false,
      title: "Check in with the office manager and the dentist",
      cue: "Report the query, the pre-authorisation reference and the pending appeal, and ask how the front office is holding up after the collapse.",
      why: "Billing decisions touch everyone: the dentist needs to answer the documentation query, the office manager needs to know an appeal is pending, and the front desk needs to know what to tell the patient. The check-in is also where the team talks about the patient who collapsed at the counter — a frightening event for staff who do not usually see emergencies. Offices that talk it through recover faster, and coordinators who start that conversation become leads.",
    },
    {
      id: "cbp-billing-log", kind: "select", target: "cbp-billing-log", noRobot: false,
      title: "Write the billing log",
      cue: "Record the eligibility check, the query, the pre-authorisation reference, the appeal reference and what was posted.",
      why: "The billing log is the trail an auditor, a payer or a new colleague follows: when eligibility was checked, why the note was queried, which reference the pre-authorisation and the appeal carry, and what was posted. Without it, an appeal that comes back in six weeks cannot be matched to anything. Documented, traceable billing work is what makes a practice audit-ready, and it is the foundation of a career in dental practice management.",
    },
  ],

  interrupts: [
    {
      id: "cbp-counter-collapse",
      kind: "Medical emergency",
      after: "cbp-shred-hold", delay: 3, seconds: 12,
      alert: "The patient paying at the front counter has slumped to the floor and is not answering — you are the nearest person.",
      cue: "Hit the emergency call to bring the clinical team with the kit and the AED, and stay with her.",
      target: "cbp-emergency-call",
      why: "A person who collapses and does not respond needs the clinical team and the emergency equipment immediately, and the billing office is often closest to the waiting room. The emergency call brings the dentist, the kit and the AED at once; staying with her and reporting what you saw is the front office's part of the office emergency plan.",
      missNote: "She stayed on the floor while the shredder ran. An unresponsive person's chances fall with every minute before the team and the AED arrive — the emergency call was on the wall beside you.",
      wrongNote: "It is the emergency call button. The clinical team and the AED have to be summoned before anything else.",
    },
    {
      id: "cbp-eob-counter",
      kind: "Privacy breach",
      after: "cbp-appeal-call", delay: 3, seconds: 11,
      alert: "A colleague has left a stack of explanations of benefits, names face up, on the front counter where the next patient is standing.",
      cue: "Move the stack into the locked tray — the call can hold for a moment.",
      target: "cbp-locked-tray",
      why: "Explanations of benefits show names, plan numbers, procedures and amounts owed. Face up on a counter, they are readable by whoever is waiting. Moving them to the locked tray ends the exposure; asking the representative to hold for a moment costs nothing.",
      missNote: "The stack stayed on the counter. The next patient could read other people's names, procedures and balances — a disclosure the office had every chance to prevent.",
      wrongNote: "It is the locked tray. The papers are the problem, so they are what gets moved out of sight.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, CBP_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#d8d2c6", base2: "#ccc5b8", seam: "rgba(0,0,0,0.08)",
    }), { repeat: 4, px: 256 });
    const deskTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#8a7458", base2: "#7e6a50", seam: "rgba(0,0,0,0.08)",
    }), { repeat: 2, px: 256 });
    const floor = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xd8d2c6, { radius: 0.05, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.78, metal: 0.04, color: 0xe0dace });

    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.frame ?? 0x3a3428, { rough: 0.5 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 384 });
      return b;
    };
    const lines = (title, rows, accent = CBP_CSS) => (cx, w, h) => {
      cx.fillStyle = "#16130c"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#f8f0dc"; cx.font = `600 ${Math.round(h * 0.14)}px Arial, sans-serif`;
      cx.fillText(title, w * 0.05, h * 0.26);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.5 + i * 0.2)));
    };
    const screen = (parent, w, h, x, y, z, draw, ry = 0) => {
      const s = group(parent, x, y, z, ry);
      box(s, 0.05, 0.2, 0.05, 0, -h / 2 - 0.08, -0.03, 0x2b3138, { rough: 0.5 });
      box(s, w + 0.03, h + 0.03, 0.03, 0, 0, 0, 0x15181b, { rough: 0.4 });
      s.userData.face = decal(s, w, h, 0, 0, 0.017, draw, { px: 384, glow: true, ei: 0.8 });
      return s;
    };

    // ------------------------------------------------------------ the desk
    const desk = group(g, 0, 0, -1.05);
    const deskTop = slab(desk, 2.0, 0.04, 0.75, 0, 0.76, 0, 0x8a7458, { radius: 0.01, rough: 0.5 });
    deskTop.material = texturedMat(deskTex, { rough: 0.5, metal: 0.04, color: 0xffffff });
    for (const sx of [-1, 1]) box(desk, 0.04, 0.74, 0.7, sx * 0.97, 0.37, 0, 0x5a4a38, { rough: 0.5 });
    box(desk, 1.9, 0.3, 0.02, 0, 0.55, -0.34, 0x5a4a38, { rough: 0.55 });

    // Eligibility portal, left monitor.
    const elig = screen(desk, 0.5, 0.3, -0.55, 1.08, -0.18, lines("ELIGIBILITY PORTAL", ["", "", ""]), 0.2);
    const ELIG = [["cbp-elig-identity", 0.04, "1 SUBSCRIBER + PATIENT"], ["cbp-elig-active", -0.04, "2 ACTIVE ON DATE"], ["cbp-elig-limits", -0.12, "3 LIMITS · WAITING"]];
    for (const [id, y, label] of ELIG) {
      const e = group(elig, 0, y, 0.022);
      box(e, 0.44, 0.065, 0.006, 0, 0, 0, 0x2a2419, { rough: 0.5 });
      decal(e, 0.42, 0.055, 0, 0, 0.004, signFace(label, { bg: "#2a2419", accent: CBP_CSS, fg: "#f8f0dc", scale: 0.42 }), { px: 256 });
      reg(hits, e, id);
    }
    // Clinical note, right monitor, with the two gaps marked.
    const note = screen(desk, 0.5, 0.3, 0.15, 1.08, -0.22, (cx, w, h) => {
      cx.fillStyle = "#f6f3ea"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = CBP_CSS; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#2a2419"; cx.font = `600 ${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("CLINICAL NOTE — TODAY", w * 0.05, h * 0.2);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Crown prep. Impression taken.", "Tooth: ____   Reason: ____", "Signed: ____"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.42 + i * 0.18)));
    });
    const gapSurf = group(note, 0.0, -0.02, 0.024);
    torus(gapSurf, 0.03, 0.005, 0, 0, 0, CBP_ALERT, { emissive: CBP_ALERT, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, gapSurf, "cbp-note-no-surfaces");
    const gapSig = group(note, -0.12, -0.09, 0.024);
    torus(gapSig, 0.03, 0.005, 0, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, gapSig, "cbp-note-unsigned");
    const sticky = group(note, 0.24, 0.12, 0.02);
    box(sticky, 0.06, 0.06, 0.004, 0, 0, 0, 0xf2e36a, { rough: 0.9 });
    holoTag(sticky, "shared login note", 0, 0.06, 0, { css: CBP_ALERT, w: 0.32 });
    reg(hits, sticky, "cbp-shared-login");
    // Ledger screen, far right.
    const ledger = screen(desk, 0.4, 0.26, 0.75, 1.06, -0.15, lines("LEDGER", ["Paid · adjusted · pending"]), -0.25);
    holoTag(ledger, "ledger", 0, 0.2, 0, { css: CBP_CSS, w: 0.2 });
    reg(hits, ledger, "cbp-ledger");

    // On the desk: CDT book, payer cards, narrative dial, packet, headset.
    const cdt = group(desk, -0.8, 0.8, 0.12, 0.2);
    box(cdt, 0.2, 0.05, 0.27, 0, 0, 0, 0x2f5a8a, { rough: 0.6 });
    box(cdt, 0.19, 0.04, 0.005, 0, 0, 0.135, 0xf2efe6, { rough: 0.8 });
    decal(cdt, 0.16, 0.08, 0, 0.026, 0, signFace("CDT — THIS YEAR", { bg: "#2f5a8a", accent: "#f8f0dc", scale: 0.4 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(cdt, "CDT code set", 0, 0.1, 0, { css: CBP_CSS, w: 0.26 });
    reg(hits, cdt, "cbp-cdt-book");
    const PAYERS = [["cbp-payer-own", -0.42, 0x3f7fb0, "her own plan"], ["cbp-payer-spouse", -0.26, 0x6f5aa0, "spouse's plan"], ["cbp-payer-her-share", -0.1, 0xd9b85a, "her share"]];
    for (const [id, x, colour, label] of PAYERS) {
      const p = group(desk, x, 0.785, 0.25);
      box(p, 0.12, 0.006, 0.075, 0, 0, 0, colour, { rough: 0.5 });
      holoTag(p, label, 0, 0.05, 0, { css: CBP_CSS, w: 0.24 });
      reg(hits, p, id);
    }
    const dial = group(desk, 0.1, 0.8, 0.22);
    cyl(dial, 0.045, 0.045, 0.025, 0, 0, 0, CBP_ACCENT, { rough: 0.5, seg: 16 });
    box(dial, 0.008, 0.01, 0.04, 0, 0.015, 0.012, 0x1b1f24, { rough: 0.5 });
    holoTag(dial, "narrative detail", 0, 0.08, 0, { css: CBP_CSS, w: 0.3 });
    reg(hits, dial, "cbp-narrative-dial");
    const packet = group(desk, 0.35, 0.79, 0.22, -0.2);
    box(packet, 0.22, 0.02, 0.3, 0, 0, 0, 0xc9a34a, { rough: 0.7 });
    box(packet, 0.08, 0.022, 0.06, 0.05, 0.002, -0.08, 0x2b3138, { rough: 0.4 });
    holoTag(packet, "pre-auth packet", 0, 0.07, 0, { css: CBP_CSS, w: 0.3 });
    reg(hits, packet, "cbp-preauth-packet");
    const headset = group(desk, 0.62, 0.8, 0.22);
    torus(headset, 0.06, 0.008, 0, 0.06, 0, 0x2b3138, { rough: 0.5, seg: 6, seg2: 18 });
    ball(headset, 0.025, -0.06, 0.03, 0, 0x2b3138, { rough: 0.5, seg: 10 });
    ball(headset, 0.025, 0.06, 0.03, 0, 0x2b3138, { rough: 0.5, seg: 10 });
    holoTag(headset, "appeal call", 0, 0.16, 0, { css: CBP_CSS, w: 0.24 });
    reg(hits, headset, "cbp-headset");
    const upcode = group(g, -0.5, 1.55, -1.5);
    decal(upcode, 0.22, 0.16, 0, 0, 0, paperFace("PAYS BETTER", ["Bill the bigger one", "Nobody checks"], { band: CBP_ALERT }), { px: 192 });
    holoTag(upcode, "'pays better' sheet", 0, 0.12, 0, { css: CBP_ALERT, w: 0.34 });
    reg(hits, upcode, "cbp-upcode-sheet");

    // ------------------------------------------ side counter: portal, fax, shredder
    const side = group(g, 1.75, 0, -0.55, -Math.PI / 2);
    box(side, 1.4, 0.8, 0.55, 0, 0.4, 0, 0x6f6a5e, { rough: 0.55 });
    slab(side, 1.44, 0.04, 0.58, 0, 0.82, 0, 0xd8d2c6, { radius: 0.01, rough: 0.5 });
    const portal = group(side, -0.45, 0.84, 0);
    box(portal, 0.34, 0.08, 0.26, 0, 0.04, 0, 0x3a3f46, { rough: 0.45 });
    box(portal, 0.3, 0.01, 0.2, 0, 0.085, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 0.4, rough: 0.3 });
    holoTag(portal, "secure portal scanner", 0, 0.18, 0, { css: CBP_CSS, w: 0.4 });
    reg(hits, portal, "cbp-portal-scanner");
    const fax = group(side, 0.0, 0.84, 0);
    box(fax, 0.3, 0.12, 0.26, 0, 0.06, 0, 0xdedbd2, { rough: 0.5 });
    box(fax, 0.06, 0.06, 0.004, 0.1, 0.16, 0.1, 0xf2e36a, { rough: 0.9 });
    holoTag(fax, "fax — number on a sticky", 0, 0.22, 0, { css: CBP_ALERT, w: 0.44 });
    reg(hits, fax, "cbp-fax-sticky");
    const shredder = group(side, 0.45, 0, 0.05);
    box(shredder, 0.34, 0.6, 0.3, 0, 0.3, 0, 0x2b3138, { rough: 0.5 });
    box(shredder, 0.3, 0.02, 0.04, 0, 0.61, 0, 0x15181b, { rough: 0.5 });
    const misprint = box(shredder, 0.2, 0.14, 0.004, 0, 0.7, 0, 0xfafafa, { rough: 0.9 });
    holoTag(shredder, "cross-cut shredder", 0, 0.85, 0, { css: CBP_CSS, w: 0.36 });
    reg(hits, shredder, "cbp-shredder");
    const stamp = group(side, 0.2, 0.86, -0.18);
    cyl(stamp, 0.025, 0.03, 0.06, 0, 0.03, 0, 0x2b3138, { rough: 0.5, seg: 10 });
    box(stamp, 0.08, 0.02, 0.05, 0, 0, 0, CBP_ALERT, { rough: 0.6 });
    holoTag(stamp, "'copay waived' stamp", 0, 0.1, 0, { css: CBP_ALERT, w: 0.36 });
    reg(hits, stamp, "cbp-waive-stamp");

    // --------------------------------------- records cabinet and query tray
    const cabinet = group(g, -1.85, 0, -1.2, 0.7);
    box(cabinet, 0.5, 1.3, 0.6, 0, 0.65, 0, 0x7a8088, { rough: 0.45, metal: 0.4 });
    for (let i = 0; i < 4; i++) {
      box(cabinet, 0.46, 0.28, 0.01, 0, 0.2 + i * 0.31, 0.305, 0x6a7078, { rough: 0.45, metal: 0.4 });
      box(cabinet, 0.12, 0.02, 0.02, 0, 0.3 + i * 0.31, 0.315, CITY.steel, { rough: 0.3, metal: 0.85 });
    }
    const keyCyl = group(cabinet, 0.16, 1.24, 0.31);
    cyl(keyCyl, 0.02, 0.02, 0.02, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = Math.PI / 2;
    box(keyCyl, 0.012, 0.04, 0.008, 0, 0, 0.015, CBP_ACCENT, { rough: 0.4, metal: 0.6 });
    holoTag(keyCyl, "cabinet key", 0, 0.08, 0, { css: CBP_CSS, w: 0.24 });
    reg(hits, keyCyl, "cbp-cabinet-key");
    const queryTray = group(g, -1.35, 0.8, -0.35, 0.4);
    box(queryTray, 0.3, 0.05, 0.36, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    box(queryTray, 0.2, 0.004, 0.28, 0, 0.03, 0, 0xfafafa, { rough: 0.9 });
    cyl(queryTray, 0.02, 0.02, 0.78, 0, -0.4, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 8 });
    decal(queryTray, 0.24, 0.05, 0, 0.04, 0.19, signFace("DENTIST — QUERIES", { bg: "#1b1f24", accent: CBP_CSS, scale: 0.4 }), { px: 128 });
    reg(hits, queryTray, "cbp-query-tray");

    // --------------------------- the front counter, through the glass behind
    const counter = group(g, -0.6, 0, 1.45);
    box(counter, 1.5, 1.05, 0.4, 0, 0.525, 0, 0x5a4a38, { rough: 0.55 });
    slab(counter, 1.56, 0.04, 0.46, 0, 1.07, 0, 0xd8d2c6, { radius: 0.01, rough: 0.5 });
    box(counter, 1.5, 0.5, 0.01, 0, 1.35, -0.12, 0xbfe4f2, { opacity: 0.3, transparent: true, rough: 0.1 });
    const eobStack = box(counter, 0.22, 0.03, 0.28, 0.4, 1.1, 0.05, 0xfafafa, { rough: 0.9 });
    eobStack.visible = false;
    const locked = group(counter, -0.5, 1.09, 0.02);
    box(locked, 0.3, 0.08, 0.34, 0, 0, 0, 0x3a3f46, { rough: 0.45, metal: 0.4 });
    box(locked, 0.05, 0.03, 0.02, 0, 0.02, 0.18, CBP_ACCENT, { rough: 0.4, metal: 0.6 });
    holoTag(locked, "locked tray", 0, 0.12, 0, { css: CBP_CSS, w: 0.24 });
    reg(hits, locked, "cbp-locked-tray");
    const payer = standingFigure(g, 0.55, 1.95, { ry: Math.PI, cloth: 0x8a5a6a });
    holoTag(payer, "patient at the counter", 0, 1.86, 0, { css: CBP_CSS, w: 0.4 }).rotation.y = Math.PI;
    const payerHome = payer.position.clone();
    const emCall = group(g, 0.35, 1.35, -1.6);
    box(emCall, 0.14, 0.14, 0.04, 0, 0, 0, 0xeef2f4, { rough: 0.5 });
    const emButton = cyl(emCall, 0.04, 0.04, 0.03, 0, 0, 0.025, 0xd8342a, { emissive: 0xd8342a, ei: 0.5, rough: 0.5, seg: 14 });
    emButton.rotation.x = Math.PI / 2;
    ownMaterial(emButton);
    holoTag(emCall, "emergency call", 0, 0.12, 0, { css: CBP_CSS, w: 0.3 });
    reg(hits, emCall, "cbp-emergency-call");
    const aed = group(g, 2.25, 1.2, 0.8, -Math.PI / 2);
    box(aed, 0.3, 0.3, 0.12, 0, 0, 0, 0x2f8f5a, { rough: 0.5 });
    decal(aed, 0.24, 0.1, 0, 0, 0.062, signFace("AED", { bg: "#2f8f5a", accent: "#ffffff", fg: "#ffffff", scale: 0.6 }), { px: 128 });
    const aedHome = aed.position.clone();
    const aedRot = aed.rotation.y;

    // The coordinator's chair, and a shelf of plan manuals and fee schedules.
    const chair = group(g, 0.1, 0, -0.35);
    cyl(chair, 0.24, 0.26, 0.03, 0, 0.03, 0, CITY.darkSteel, { rough: 0.45, metal: 0.55, seg: 16 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      cyl(chair, 0.02, 0.02, 0.05, Math.cos(a) * 0.2, 0.025, Math.sin(a) * 0.2, 0x16191d, { rough: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    }
    cyl(chair, 0.03, 0.03, 0.4, 0, 0.24, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    slab(chair, 0.46, 0.08, 0.44, 0, 0.47, 0, 0x2e3a4a, { radius: 0.03, rough: 0.7 });
    slab(chair, 0.44, 0.5, 0.07, 0, 0.8, 0.2, 0x2e3a4a, { radius: 0.03, rough: 0.7 });
    const shelf = group(g, -2.3, 0, 0.1, Math.PI / 2);
    for (const sx of [-1, 1]) box(shelf, 0.04, 1.8, 0.32, sx * 0.5, 0.9, 0, 0x5a4a38, { rough: 0.6 });
    for (let r = 0; r < 3; r++) {
      box(shelf, 1.0, 0.03, 0.3, 0, 0.5 + r * 0.5, 0, 0x5a4a38, { rough: 0.6 });
      for (let i = 0; i < 6; i++) box(shelf, 0.07, 0.3, 0.24, -0.38 + i * 0.15, 0.67 + r * 0.5, 0, [0x2f4a6a, 0x6f5aa0, 0x2f6f5a, 0x8a5a3a, 0x3a3f46, 0xc9a34a][(i + r) % 6], { rough: 0.7 });
    }
    decal(shelf, 0.5, 0.08, 0, 1.86, 0.16, signFace("PLAN MANUALS · FEE SCHEDULES", { bg: "#2a2419", accent: CBP_CSS, scale: 0.36 }), { px: 256 });

    // ------------------------------------------------ explanation of benefits
    const eob = board(0.5, 0.36, -1.1, 1.55, -1.95, lines("EXPLANATION OF BENEFITS", ["Fee: ____", "Benefit: ____"]), { ry: 0.3 });
    const eobFee = group(eob, 0.1, 0.0, 0.016);
    torus(eobFee, 0.03, 0.005, 0, 0, 0, CBP_ALERT, { emissive: CBP_ALERT, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, eobFee, "cbp-eob-fee");
    const eobAlt = group(eob, 0.1, -0.08, 0.016);
    torus(eobAlt, 0.03, 0.005, 0, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, eobAlt, "cbp-eob-alternate");

    const checkin = board(0.44, 0.28, 0.4, 1.95, -2.35, lines("TEAM CHECK-IN", ["Query · refs · appeal", "How is the front desk?"], "#7fc4d8"), { frame: 0x22323a });
    reg(hits, checkin.userData.face, "cbp-team-checkin");
    const log = board(0.4, 0.3, 0.95, 1.95, -2.35, paperFace("BILLING LOG", ["Eligibility · query", "Pre-auth ref · appeal ref", "Posted"], { band: CBP_CSS }));
    reg(hits, log.userData.face, "cbp-billing-log");

    const manager = standingFigure(g, -2.3, 0.55, { ry: 1.8, cloth: 0x3a4a5a });
    holoTag(manager, "office manager", 0, 1.86, 0, { css: CBP_CSS, w: 0.32 }).rotation.y = -1.8;

    const panel = holoPanel(g, 0.8, 0.5, -0.4, 2.2, -2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(22,18,10,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = CBP_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f6e6b8"; cx.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("CODE FROM THE RECORD", w * 0.06, h * 0.16);
      cx.fillStyle = "#fbf5e6"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Eligibility before codes", "Gaps go back to the dentist", "This year's CDT · payers in order", "Portal, not fax · appeal on facts"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: CBP_ACCENT });
    void panel;

    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.2, 0.06, 0.34, i * 1.1, 2.62, -0.9, 0xe8e2d4, { rough: 0.4, cast: false });
      box(g, 1.08, 0.02, 0.26, i * 1.1, 2.585, -0.9, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.55, rough: 0.4, cast: false });
    }
    const key = new THREE.DirectionalLight(0xfff4e8, 0.85);
    key.position.set(-2.4, 4.6, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xfbf6ea, 0x5d6a72, 0.9));

    const tickMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.5, rough: 0.5 });

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.05, -1.0),

      onStepComplete(step) {
        if (step.id === "cbp-eligibility") for (const c of elig.children) if (c.children?.[0] && c !== elig.userData.face) c.children[0].material = tickMat;
        if (step.id === "cbp-note-gaps") { gapSurf.visible = false; gapSig.visible = false; }
        if (step.id === "cbp-query-dentist") repaint(note.userData.face, lines("CLINICAL NOTE — AMENDED", ["Tooth + reason added", "Signed by the dentist"], "#59c97b"));
        if (step.id === "cbp-send-portal") { packet.parent.remove(packet); portal.add(packet); packet.position.set(0, 0.1, 0); }
        if (step.id === "cbp-shred-hold") misprint.visible = false;
        if (step.id === "cbp-eob-find") { eobFee.visible = false; eobAlt.visible = false; }
        if (step.id === "cbp-post-ledger") repaint(ledger.userData.face, lines("LEDGER", ["Paid · contract adj.", "Appeal: pending"], "#59c97b"));
        if (step.id === "cbp-cabinet-lock") keyCyl.rotation.z = Math.PI / 2;
        if (step.id === "cbp-billing-log") repaint(log.userData.face, paperFace("BILLING LOG", ["Eligibility ✓ · query ✓", "Refs recorded", "Posted to contract"], { band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "cbp-counter-collapse") {
          payer.rotation.x = -Math.PI / 2;
          payer.position.set(payerHome.x, 0.16, payerHome.z - 0.2);
          emButton.material.emissiveIntensity = 1.2;
        }
        if (it.id === "cbp-eob-counter") eobStack.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cbp-counter-collapse") {
          aed.position.set(payerHome.x + 0.45, 0.15, payerHome.z - 0.4);
          aed.rotation.y = aedRot + 0.4;
          emButton.material.emissiveIntensity = 0.3;
          void aedHome;
        }
        if (it.id === "cbp-eob-counter") {
          eobStack.visible = false;
          box(locked, 0.2, 0.02, 0.26, 0, 0.05, 0, 0xfafafa, { rough: 0.9 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (session?.step?.id === "cbp-shred-hold" && session.holding) misprint.position.y = 0.7 - ((t * 0.05) % 0.1);
      },
    };
  },
};
