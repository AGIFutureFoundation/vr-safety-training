import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Leasing Office and Fair Housing VR — Building Systems &
// Facilities, property management programme, zone two of twenty.
//
// A leasing office run the way the apartment association's CAM course and
// the Fair Housing Act expect it to be run: one written set of selection
// criteria applied to everyone, the notices posted, an ad read for the words
// that steer, an income test applied by the number rather than the eye, an
// accommodation request routed rather than refused, the EPA lead disclosure
// put in every pre-1978 lease packet, a lone-worker check-in before a
// showing, a tour taken at the prospect's pace, a decision letter that gives
// its reasons, applicant files locked, and the day written into the building
// log. A generic office — no real property, applicant or employer is named.

const PMLO_ACCENT = 0x8fb86a;

export const SIM_PM_LEASING_OFFICE_FAIR_HOUSING = {
  id: "pm-leasing-office-fair-housing",
  index: "302",
  domain: "Property Management",
  trade: "Leasing agent and community manager — apartment association CAM credential, working alongside SEIU building service staff",
  category: "Building Systems & Facilities",
  indoor: "hotel",
  certification: "The federal Fair Housing Act and its protected classes, applied through one written tenant selection standard, reasonable accommodations and modifications for residents with disabilities, and advertising free of words that steer; EPA's lead-based paint disclosure rule for target housing under 40 CFR 745, with the Lead Warning Statement and the lead pamphlet in every pre-1978 lease; the state landlord-tenant statute's notice before a unit is entered; OSHA 29 CFR 1910.38 (emergency action plans), 29 CFR 1910.36 (exit routes) and 29 CFR 1910.157 (portable extinguishers) for the office itself, with NFPA 101 for its exit; an injury and illness prevention program under 8 CCR 3203 covering a leasing agent who shows units alone; the apartment association's CAM credential; SEIU building service staff who share the building.",
  supportLine: "your employer's EAP or the SEIU member assistance line — hearing a resident describe harassment in their own home is heavy, and saying so is part of the job",
  name: "Leasing Office and Fair Housing",
  title: simTitle("Leasing Office and Fair Housing"),
  tagline: "One set of criteria for everyone: notices posted, an ad cleaned of steering words, income applied by the number, an accommodation routed, the lead disclosure packed, a lone-worker check-in, a tour at the prospect's pace, reasons in writing and the files locked",
  accent: PMLO_ACCENT,
  accentCss: "#8fb86a",
  parSeconds: 260,
  footprint: 2.4,
  badge: { id: "same-for-everyone", name: "Same for Everyone", note: "Every applicant and resident served by the same written standard, with nothing steered and nothing refused on the spot" },

  game: system({
    name: "Fair Housing",
    currency: "LEASES",
    ranks: ["Leasing Trainee", "Leasing Consultant", "Assistant Manager", "Community Manager", "Fair Housing Certified"],
    badges: [
      { id: "no-steering", name: "No Steering", note: "No unsafe action anywhere in the day", test: AWARD.safe },
      { id: "clean-ad", name: "Clean Copy", note: "Found every steering phrase on the first read", test: AWARD.stepClean("ad-review") },
      { id: "by-the-number", name: "By the Number", note: "Applied the income standard close to its written value", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-day", name: "Clean Day", note: "No corrections anywhere", test: AWARD.clean },
      { id: "prompt-office", name: "Prompt Office", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "steady-seven", name: "Steady Seven", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "steering-map": "You are pointing a family with two children to the building on the site map someone has shaded 'families'. That is steering — offering or describing housing differently because of familial status — and the Fair Housing Act treats it as discrimination whether or not the family would have chosen that building anyway. Every applicant gets the whole availability list.",
    "diagnosis-question": "You are reaching for the form that asks the resident to name their diagnosis. A reasonable accommodation request needs to show a disability-related need for the accommodation, not the medical detail behind it; asking for a diagnosis turns a request the Fair Housing Act protects into an intrusion, and it is the question most often behind a complaint.",
    "applicant-file-copy": "You are photocopying another applicant's file to show a prospect why they were turned down and someone else was not. That file holds a stranger's income, credit report and social security number. The decision letter gives this applicant their own reasons; nobody else's file ever leaves the cabinet to make the point.",
    "occupied-unit-key": "That key opens an occupied unit, and the prospect wants to see one 'just like it'. The state landlord-tenant statute requires written notice to the resident before entry for a showing; walking a stranger into someone's home unannounced is a violation of that tenancy and, for the resident who comes home to find them there, a frightening one.",
  },

  lateNotes: {
    "decision-letter": "The decision letter goes out once the application has actually been decided against the written criteria — not drafted while you are still qualifying it.",
    "file-cabinet-lock": "Lock the cabinet once the day's files are back in it. Locking it now just means unlocking it again for the next applicant.",
    "building-log": "The log is written at the end of the day, once there is a day to write down.",
  },

  steps: [
    {
      id: "selection-criteria", kind: "select", target: "selection-criteria",
      title: "Open with the written selection criteria",
      cue: "Pull up the property's written tenant selection criteria before the first applicant walks in.",
      why: "Fair housing compliance is mostly consistency: the same income standard, the same screening, the same deposit and the same answers for every applicant. The written criteria are what make that possible on a busy day, and they are the document a fair housing investigator asks for first — an office working from memory cannot show it treated two applicants alike.",
    },
    {
      id: "posted-notices", kind: "sequence", anyOrder: true,
      targets: ["fair-housing-poster", "exit-map", "extinguisher-tag"],
      itemNames: { "fair-housing-poster": "fair housing poster posted", "exit-map": "evacuation map posted", "extinguisher-tag": "extinguisher tag current" },
      title: "Check the office's posted notices",
      cue: "Confirm the fair housing poster, the evacuation map and the extinguisher's inspection tag are all in place.",
      why: "Three different rules, one wall. The fair housing poster tells every applicant their rights before they ask; the evacuation map is the office's piece of the building's emergency action plan under 29 CFR 1910.38; and a portable extinguisher is only a control if its monthly check under 29 CFR 1910.157 is current. A missing one is found now or during an audit.",
    },
    {
      id: "ad-review", kind: "find", noHint: true,
      targets: ["ad-adults-only", "ad-english-only", "ad-able-bodied"],
      itemNames: { "ad-adults-only": "\"quiet adult community\"", "ad-english-only": "\"English speakers preferred\"", "ad-able-bodied": "\"ideal for active, able-bodied tenants\"" },
      itemNotes: {
        "ad-adults-only": "\"Adult community\" in a building that is not lawful senior housing says families with children need not apply — familial status is protected.",
        "ad-english-only": "A language preference in an ad is a national-origin preference in everything but name, and it is one of the phrases fair housing testers look for first.",
        "ad-able-bodied": "\"Able-bodied\" describes the tenant, not the unit. Describe the property — stairs, no elevator, a walk-up — and let the reader decide.",
      },
      title: "Read the draft listing for steering words",
      cue: "The new listing goes live today. Three phrases in it say who is wanted rather than what the unit is. Find them.",
      why: "The Fair Housing Act reaches advertising as well as decisions: an ad that indicates a preference is a violation even if no applicant is ever turned away. The fix is always the same — describe the unit and its features, never the kind of person it suits — and the time to make it is before the listing goes out under the property's name.",
    },
    {
      id: "income-ratio", kind: "gauge", target: "income-calculator",
      title: "Apply the income standard by the number",
      cue: "Run the applicant's verified income against the rent and commit only at the multiple the written criteria state.",
      why: "An income standard applied by feel drifts: a little lenient for an applicant who seems like a good fit, a little strict for one who does not. That drift is exactly the pattern disparate-treatment complaints are built from. The criteria state one multiple of the rent; applying that number every time is what makes the decision defensible to the applicant and to anyone who reviews it.",
      gauge: {
        label: "VERIFIED INCOME ÷ MONTHLY RENT", speed: 0.5, green: [0.44, 0.56],
        readout: (t) => `${(1.5 + t * 2).toFixed(2)} × rent`,
        missNote: "That is not the multiple the written criteria state. Commit at the written standard — the same number every applicant is measured against.",
      },
    },
    {
      id: "accommodation-request", kind: "select", target: "accommodation-form",
      title: "Route a reasonable accommodation request",
      cue: "A resident asks in writing for a reserved accessible parking space. Log the request and route it to the manager for the interactive process.",
      why: "A request for an accommodation does not need magic words or a particular form, and it cannot be refused at the counter. Logging it with the date and routing it starts the interactive process the Fair Housing Act expects — a conversation about the need and what would meet it — and the date matters, because delay can itself amount to a denial.",
    },
    {
      id: "lead-disclosure", kind: "drag", target: "lead-pamphlet",
      title: "Put the lead disclosure in the lease packet",
      cue: "The unit is in a building built before 1978. Carry the lead pamphlet and disclosure form into the lease packet.",
      why: "EPA's disclosure rule under 40 CFR 745 applies to leases of housing built before 1978: the Lead Warning Statement, any known lead-based paint or reports, and the lead pamphlet go to the tenant before they are bound by the lease, and the signed disclosure is kept on file. A packet without it is a lease that went out missing a federal requirement.",
      drag: { to: "lease-packet-socket", radius: 0.5, missNote: "Not in the packet yet — the disclosure has to go inside the lease packet the tenant signs, not sit on the desk beside it." },
    },
    {
      id: "lone-worker-checkin", kind: "hold", target: "lone-worker-radio", seconds: 5,
      title: "Check in with the maintenance desk before a showing",
      cue: "Key the radio and hold until the maintenance desk acknowledges: which unit, who with, when you expect to be back.",
      why: "A leasing agent showing a vacant unit to a stranger is working alone behind a closed door, and the property's injury and illness prevention program under 8 CCR 3203 is where the lone-worker rule lives: somebody knows where you are, with whom, and when to come looking. A call that is never acknowledged is not a check-in.",
      holdBreakNote: "You let the key go before the desk acknowledged. Until someone has repeated the unit and the time back, nobody knows where you are — key it again.",
    },
    {
      id: "accessible-tour", kind: "track", target: "tour-pace", seconds: 6,
      title: "Take the tour at the prospect's pace",
      cue: "Walk the accessible route to the model unit beside the prospect who uses a wheelchair — not ahead, not hovering.",
      why: "The tour is the same tour every prospect gets, on the route the building provides for everyone who cannot use the steps. Walking ahead and talking over your shoulder, or hovering and steering the chair, both say this prospect is being handled differently. Beside them, at their pace, is simply the same service — which is the whole standard.",
      track: {
        start: 0.2, green: [0.38, 0.6], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "TOUR — PACE BESIDE THE PROSPECT",
        readout: (v) => (v < 0.38 ? "hovering behind" : v > 0.6 ? "striding ahead" : "side by side"),
      },
      holdBreakNote: "You drifted out of step — either rushing ahead or hanging back. Come back alongside and finish the route at their pace.",
    },
    {
      id: "decision-letter", kind: "select", target: "decision-letter",
      title: "Send the decision with its reasons",
      cue: "Issue the applicant's decision letter, naming the criterion it turned on and the screening report it relied on.",
      why: "An applicant turned down deserves to know why, and the credit-reporting law expects a notice when a screening report was part of the reason. A letter that names the written criterion is also the office's own record that the decision followed the standard — which is the answer to every question anyone later asks about it.",
    },
    {
      id: "lock-files", kind: "turn", target: "file-cabinet-lock",
      title: "Lock the applicant files",
      cue: "Put the day's applications back in the cabinet and turn the lock.",
      why: "Applications hold social security numbers, bank statements, pay stubs and credit reports for people who trusted the office with them. A cabinet left open over lunch is the easiest identity theft there is, and the property's obligation to keep that information private does not stop when the office gets busy.",
      turn: { turns: 0.5, axis: "z", label: "FILE CABINET", readout: (t) => (t < 0.9 ? "UNLOCKED" : "LOCKED") },
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Write the day into the building log",
      cue: "Log the accommodation request, the harassment report, the inspector's visit and the applications decided.",
      why: "The building log is where a manager, a regional supervisor or a fair housing investigator reconstructs what the office did and when. A harassment report with no log entry, or an accommodation request with no date, is exactly the gap that turns a routine inquiry into a finding that the property was told and did nothing.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with your co-worker before close",
      cue: "Ask your co-worker how the harassment report sat with them, and name the EAP line before you lock up.",
      why: "Taking a resident's account of being harassed in their own building, carefully and in their words, is emotionally heavy work, and most of it happens in a short conversation nobody else hears. A deliberate check-in at the end of the day, with the support line named, is how a leasing team keeps that weight from quietly accumulating.",
    },
  ],

  interrupts: [
    {
      id: "tenant-harassment",
      kind: "Resident reports harassment",
      after: "lone-worker-checkin", delay: 2, seconds: 13,
      alert: "A resident comes into the office shaking: a neighbour has been leaving notes with slurs about her religion on her door, and another one was there this morning.",
      cue: "Stop, sit with her, and take the report properly — in her words, dated, on the incident form.",
      target: "harassment-report",
      why: "A housing provider that knows one resident is harassing another because of a protected characteristic, and does nothing, can be liable under the Fair Housing Act. Taking the report in the resident's own words, dated and in writing, is the first step of the response and the record that the property acted the day it was told — not whenever someone got round to it.",
      missNote: "The resident waited and left without a report being taken. The harassment is still happening on her door, and there is now no record the property was ever told — which is the worst position a manager can be in.",
      wrongNote: "Not that. She needs the incident form, taken in her own words and dated, before anything else is decided.",
    },
    {
      id: "housing-inspector",
      kind: "Inspector arrives",
      after: "accessible-tour", delay: 3, seconds: 12,
      alert: "A city housing inspector arrives at the office to follow up a resident's complaint about heat in 3F and asks for the unit's repair history.",
      cue: "Pull the unit's work-order history for the inspector — dates, tickets, what was done.",
      target: "work-order-history",
      why: "A code enforcement follow-up turns on one question: did the owner know, and what did they do about it? The work-order history answers both with dates. Producing it promptly shows the complaint was taken seriously, and if the repair is still open, it is better that the office says so than that the inspector finds it.",
      missNote: "The inspector waited and left with no repair history. A complaint the office cannot document an answer to is written up as unanswered, whatever the engineer actually did in 3F.",
      wrongNote: "That is not what the inspector asked for. Pull the work-order history for 3F — the tickets and their dates.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMLO_ACCENT);

    // ------------------------------------------------------------ office floor
    const lvtTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 10, base: "#b39a7c", base2: "#a88e70", seam: "rgba(60,44,30,0.22)" }), { repeat: 3, px: 384 });
    const lvt = box(g, 6.2, 0.01, 5.8, 0, 0.005, -0.3, 0xb39a7c, { rough: 0.6, cast: false });
    lvt.material = texturedMat(lvtTex, { rough: 0.55, metal: 0.02, color: 0xe6dccd });
    lvt.receiveShadow = true;
    decal(g, 2.8, 0.52, 0, 2.62, -5.36, signFace("LEASING OFFICE", { bg: "#16201a", accent: "#8fb86a", fg: "#eef6e6", scale: 0.48 }), { px: 512 });

    // Street glazing along the right side, with an equal housing mark on it.
    const glaze = group(g, 2.75, 0, -0.4, -Math.PI / 2);
    for (let i = -2; i <= 2; i++) box(glaze, 0.06, 2.6, 0.08, i * 1.1, 1.3, 0, 0x2b3138, { rough: 0.4, metal: 0.6 });
    box(glaze, 4.5, 2.4, 0.02, 0, 1.3, 0.02, 0xcfe3f0, { rough: 0.1, metal: 0.1, opacity: 0.3, transparent: true, cast: false });
    box(glaze, 4.5, 0.08, 0.1, 0, 2.62, 0, 0x2b3138, { rough: 0.4, metal: 0.6 });
    const ehoLogo = decal(glaze, 0.34, 0.34, 1.6, 1.5, -0.03, signFace("EQUAL\nHOUSING", { bg: "#f4f6f8", accent: "#1f3a5a", fg: "#1f3a5a", scale: 0.26 }), { px: 192 });
    void ehoLogo;

    // ------------------------------------------------------------ the leasing desk
    const desk = group(g, -0.6, 0, -1.2);
    slab(desk, 1.8, 0.05, 0.8, 0, 0.76, 0, 0xd9cdb8, { radius: 0.02, rough: 0.4 });
    box(desk, 0.05, 0.74, 0.7, -0.85, 0.37, 0, 0x5a4a3a, { rough: 0.6 });
    box(desk, 0.5, 0.7, 0.7, 0.6, 0.37, 0, 0x5a4a3a, { rough: 0.6 });
    box(desk, 1.7, 0.4, 0.03, 0, 0.5, -0.35, 0x5a4a3a, { rough: 0.6 });
    const monitor = group(desk, -0.35, 0.785, -0.22);
    cyl(monitor, 0.02, 0.02, 0.14, 0, 0.07, 0, 0x2b3138, { rough: 0.5, seg: 8 });
    box(monitor, 0.5, 0.3, 0.03, 0, 0.3, 0, 0x14171b, { rough: 0.4 });
    const criteriaFace = decal(monitor, 0.46, 0.26, 0, 0.3, 0.016, signFace("SELECTION\nCRITERIA v4", { bg: "#101a12", accent: "#8fb86a", fg: "#e6f2dc", scale: 0.3 }), { glow: true, ei: 0.8, px: 320 });
    reg(hits, criteriaFace, "selection-criteria");
    const calc = group(desk, 0.25, 0.785, 0.12);
    box(calc, 0.12, 0.02, 0.17, 0, 0.01, 0, 0x2b3138, { rough: 0.5 });
    const calcFace = decal(calc, 0.1, 0.05, 0, 0.022, -0.05, signFace("2.50×", { bg: "#0d1c14", accent: "#8fb86a", fg: "#c9f5d8", scale: 0.6 }), { glow: true, ei: 0.8, px: 128 });
    calcFace.rotation.x = -Math.PI / 2;
    holoTag(calc, "Income calculator", 0, 0.14, 0, { css: "#8fb86a", w: 0.36 });
    reg(hits, calc, "income-calculator");
    const accForm = decal(desk, 0.2, 0.26, -0.7, 0.788, 0.18,
      paperFace("ACCOMMODATION REQUEST", ["Resident: 2D", "Request: reserved", "accessible space", "Received: today"], { band: "#3a5a2a" }), { px: 224 });
    accForm.rotation.x = -Math.PI / 2;
    reg(hits, accForm, "accommodation-form");
    const harass = decal(desk, 0.2, 0.26, -0.45, 0.788, 0.22,
      paperFace("INCIDENT REPORT", ["Resident's own words", "Date · time · where", "Routed to manager"], { band: "#5a2a2a" }), { px: 224 });
    harass.rotation.x = -Math.PI / 2;
    reg(hits, harass, "harassment-report");
    const decision = decal(desk, 0.2, 0.26, 0.0, 0.788, 0.2,
      paperFace("DECISION LETTER", ["Criterion applied", "Screening report used", "How to dispute it"], { band: "#1f3a5a" }), { px: 224 });
    decision.rotation.x = -Math.PI / 2;
    reg(hits, decision, "decision-letter");
    // The diagnosis form — the trap on the desk corner.
    const diag = decal(desk, 0.18, 0.24, 0.75, 0.788, 0.25,
      paperFace("MEDICAL DETAIL", ["Diagnosis: ______", "Physician: _____", "Medications: ____"], { band: "#8a2a2a" }), { px: 224 });
    diag.rotation.x = -Math.PI / 2;
    holoTag(desk, "Diagnosis form?", 0.75, 0.9, 0.25, { css: "#f0645b", w: 0.32 });
    reg(hits, diag, "diagnosis-question");
    // Radio in its charger.
    const radio = group(desk, 0.72, 0.785, -0.2);
    box(radio, 0.1, 0.04, 0.08, 0, 0.02, 0, 0x2b3138, { rough: 0.5 });
    box(radio, 0.05, 0.14, 0.03, 0, 0.1, 0, 0x1b1e22, { rough: 0.5 });
    cyl(radio, 0.006, 0.006, 0.08, 0.015, 0.2, 0, 0x1b1e22, { rough: 0.5, seg: 6 });
    const radioLamp = ball(radio, 0.008, -0.012, 0.16, 0.016, 0x2a3a2a, { rough: 0.4, seg: 8 });
    holoTag(radio, "Radio to maintenance", 0, 0.32, 0, { css: "#8fb86a", w: 0.4 });
    reg(hits, radio, "lone-worker-radio");
    // Lease packet with its socket, and the lead pamphlet by the printer.
    const packet = group(desk, -0.1, 0.785, 0.28);
    box(packet, 0.24, 0.03, 0.32, 0, 0.015, 0, 0x2f4a6a, { rough: 0.6 });
    holoTag(packet, "Lease packet", 0, 0.1, 0, { css: "#8fb86a", w: 0.28 });
    const packetSocket = box(packet, 0.2, 0.05, 0.2, 0, 0.04, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["lease-packet-socket"] = packetSocket;
    const deskChair = group(g, -0.55, 0, -1.95);
    cyl(deskChair, 0.04, 0.04, 0.45, 0, 0.23, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 8 });
    box(deskChair, 0.46, 0.08, 0.46, 0, 0.5, 0, 0x2f3a2a, { rough: 0.7 });
    box(deskChair, 0.46, 0.5, 0.06, 0, 0.8, -0.22, 0x2f3a2a, { rough: 0.7 });
    for (const sx of [-0.45, 0.45]) {
      const guest = group(g, -0.6 + sx, 0, -0.35, Math.PI);
      box(guest, 0.44, 0.06, 0.44, 0, 0.46, 0, 0x6a5a4a, { rough: 0.7 });
      box(guest, 0.44, 0.44, 0.05, 0, 0.72, -0.2, 0x6a5a4a, { rough: 0.7 });
      for (const lx of [-0.19, 0.19]) for (const lz of [-0.19, 0.19]) cyl(guest, 0.012, 0.012, 0.44, lx, 0.22, lz, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 6 });
    }

    // Printer stand with the lead pamphlet.
    const printer = group(g, 1.05, 0, -1.85);
    box(printer, 0.55, 0.7, 0.45, 0, 0.35, 0, 0x3a4148, { rough: 0.5 });
    box(printer, 0.5, 0.26, 0.4, 0, 0.83, 0, 0xdfe4e8, { rough: 0.4 });
    const pamphlet = group(printer, 0.0, 0.97, 0.05);
    box(pamphlet, 0.16, 0.02, 0.22, 0, 0.01, 0, 0xe6eef4, { rough: 0.6 });
    decal(pamphlet, 0.14, 0.2, 0, 0.022, 0, paperFace("LEAD", ["Warning statement", "Pamphlet", "Disclosure form"], { band: "#1f5a8a" }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(pamphlet, "Lead disclosure", 0, 0.14, 0, { css: "#8fb86a", w: 0.32 });
    reg(hits, pamphlet, "lead-pamphlet");
    // A copier face on the printer — the trap for another applicant's file.
    const copyGlass = box(printer, 0.3, 0.01, 0.22, -0.08, 0.965, -0.08, 0x9fc4e4, { rough: 0.1, metal: 0.3 });
    const otherFile = decal(printer, 0.14, 0.18, -0.08, 0.972, -0.08, paperFace("APPLICANT B", ["SSN ***-**-", "Credit report", "Pay stubs"], { band: "#5a3a2a" }), { px: 128 });
    otherFile.rotation.x = -Math.PI / 2;
    void copyGlass;
    holoTag(printer, "Copy applicant B's file?", -0.08, 1.12, -0.08, { css: "#f0645b", w: 0.46 });
    reg(hits, otherFile, "applicant-file-copy");

    // File cabinet with its lock.
    const cab = group(g, -2.3, 0, -1.9, 0.5);
    box(cab, 0.5, 1.3, 0.6, 0, 0.65, 0, 0x8b929a, { rough: 0.45, metal: 0.55 });
    for (let i = 0; i < 4; i++) {
      box(cab, 0.46, 0.005, 0.01, 0, 0.3 + i * 0.3, 0.305, 0x5a626a, { rough: 0.5 });
      box(cab, 0.14, 0.03, 0.03, 0, 0.42 + i * 0.3, 0.315, CITY.steel, { rough: 0.3, metal: 0.85 });
    }
    const lockCyl = group(cab, 0.16, 1.22, 0.305);
    cyl(lockCyl, 0.022, 0.022, 0.02, 0, 0, 0, 0xd8b23a, { rough: 0.3, metal: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    const lockBar = box(lockCyl, 0.006, 0.03, 0.008, 0, 0, 0.012, 0x2b3138, { rough: 0.4 });
    void lockBar;
    holoTag(cab, "Applicant files", 0, 1.45, 0.3, { css: "#8fb86a", w: 0.32 });
    reg(hits, lockCyl, "file-cabinet-lock");
    // Work-order history binder on the cabinet.
    const woBinder = box(cab, 0.3, 0.06, 0.24, 0, 1.33, 0, 0x2a4a6a, { rough: 0.6 });
    holoTag(cab, "Work-order history", 0, 1.62, 0.1, { css: "#8fb86a", w: 0.38 });
    reg(hits, woBinder, "work-order-history");

    // ------------------------------------------------------------ the notice wall
    const noticeWall = group(g, -2.7, 0, 0.3, Math.PI / 2);
    box(noticeWall, 2.4, 2.2, 0.08, 0, 1.1, 0, 0xe0d8ca, { rough: 0.8 });
    const fhPoster = decal(noticeWall, 0.5, 0.64, -0.7, 1.45, 0.045,
      paperFace("FAIR HOUSING", ["It is illegal to", "discriminate in", "housing because of", "race, color, religion,", "sex, disability,", "familial status or", "national origin"], { band: "#1f3a5a" }), { px: 256 });
    reg(hits, fhPoster, "fair-housing-poster");
    const exitMap = decal(noticeWall, 0.44, 0.34, 0.05, 1.5, 0.045, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b81410"; cx.fillRect(0, 0, w, h * 0.16);
      cx.fillStyle = "#fff"; cx.font = `600 ${Math.round(h * 0.11)}px Arial`; cx.textAlign = "center"; cx.fillText("EVACUATION", w / 2, h * 0.11);
      cx.strokeStyle = "#1d262e"; cx.lineWidth = 4; cx.strokeRect(w * 0.1, h * 0.26, w * 0.8, h * 0.62);
      cx.fillStyle = "#2f7d4a"; cx.beginPath(); cx.moveTo(w * 0.3, h * 0.7); cx.lineTo(w * 0.8, h * 0.7); cx.lineTo(w * 0.72, h * 0.62); cx.fill();
      cx.fillStyle = "#b81410"; cx.beginPath(); cx.arc(w * 0.28, h * 0.5, h * 0.05, 0, Math.PI * 2); cx.fill();
    }, { px: 256 });
    reg(hits, exitMap, "exit-map");
    const ext = group(noticeWall, 0.8, 0, 0.12);
    cyl(ext, 0.07, 0.07, 0.42, 0, 0.55, 0, 0xc8201a, { rough: 0.45, metal: 0.3, seg: 14 });
    cyl(ext, 0.03, 0.03, 0.08, 0, 0.8, 0, 0x2b3138, { rough: 0.4, metal: 0.6, seg: 8 });
    box(ext, 0.2, 0.03, 0.12, 0, 0.3, -0.05, 0x3a4148, { rough: 0.5, metal: 0.4 });
    const extTag = decal(ext, 0.06, 0.09, 0.075, 0.55, 0.04, paperFace("INSP", ["JAN ✓", "FEB ✓", "MAR"], { band: "#8a2a2a" }), { px: 96 });
    reg(hits, extTag, "extinguisher-tag");
    // The draft listing on the notice wall — the find step.
    const listing = group(noticeWall, 0.05, 0.95, 0.05);
    box(listing, 1.1, 0.44, 0.01, 0, 0, 0, 0xf4f0e6, { rough: 0.8 });
    decal(listing, 1.06, 0.1, 0, 0.15, 0.008, signFace("DRAFT LISTING — 2 BR, 1 BA", { bg: "#1f3a2a", accent: "#8fb86a", fg: "#eef6e6", scale: 0.55 }), { px: 384 });
    const adPhrase = (txt, x, y, id) => {
      const d = decal(listing, 0.5, 0.08, x, y, 0.009, signFace(txt, { bg: "#fff4e0", accent: "#f0645b", fg: "#3a2a1a", scale: 0.5 }), { px: 256 });
      reg(hits, d, id);
      return d;
    };
    adPhrase("quiet adult community", -0.27, 0.02, "ad-adults-only");
    adPhrase("English speakers preferred", 0.27, 0.02, "ad-english-only");
    adPhrase("ideal for active, able-bodied tenants", 0, -0.12, "ad-able-bodied");

    // Site map with a shaded 'families' building — the steering trap.
    const siteMap = holoPanel(g, 0.7, 0.44, 1.75, 1.55, -2.4, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fb86a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f2dc"; cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.fillText("SITE MAP — AVAILABILITY", w / 2, h * 0.17);
      const blds = [["A", 0.15], ["B", 0.4], ["C", 0.65]];
      for (const [n, x] of blds) { cx.fillStyle = "#3a5a3a"; cx.fillRect(w * x, h * 0.32, w * 0.2, h * 0.45); cx.fillStyle = "#e6f2dc"; cx.fillText(n, w * (x + 0.1), h * 0.58); }
      cx.fillStyle = "rgba(240,100,91,0.55)"; cx.fillRect(w * 0.65, h * 0.32, w * 0.2, h * 0.45);
      cx.fillStyle = "#ffd2ce"; cx.font = `${Math.round(h * 0.08)}px Arial`; cx.fillText("\"families\"", w * 0.75, h * 0.86);
    }, { ry: -0.2, accent: PMLO_ACCENT });
    reg(hits, siteMap, "steering-map");

    // Key board by the door — the occupied-unit trap.
    const keyBoard = group(g, 2.3, 0, -2.5, -0.4);
    box(keyBoard, 0.5, 0.4, 0.05, 0, 1.4, 0, 0x5a4a3a, { rough: 0.6 });
    for (let i = 0; i < 4; i++) cyl(keyBoard, 0.005, 0.005, 0.04, -0.15 + i * 0.1, 1.45, 0.03, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.x = Math.PI / 2;
    const occKey = box(keyBoard, 0.05, 0.07, 0.01, 0.15, 1.36, 0.045, 0xd8232a, { rough: 0.5 });
    holoTag(keyBoard, "3C key (occupied)", 0.1, 1.68, 0.03, { css: "#f0645b", w: 0.36 });
    reg(hits, occKey, "occupied-unit-key");

    // Accessible route: a marked path to the model-unit door, the tour target.
    const route = group(g, 1.3, 0, 0.6);
    slab(route, 0.9, 0.006, 2.4, 0, 0.012, 0, 0x2f6f8c, { radius: 0.02, rough: 0.9, opacity: 0.5, transparent: true, cast: false });
    decal(route, 0.36, 0.36, 0, 0.02, 0.8, signFace("♿", { bg: "#1f5a8a", accent: "#1f5a8a", fg: "#ffffff", scale: 0.7 }), { px: 128 }).rotation.x = -Math.PI / 2;
    const paceMark = box(route, 0.5, 0.05, 0.5, 0, 0.3, -0.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(route, "Tour route — beside, not ahead", 0, 0.9, -0.6, { css: "#8fb86a", w: 0.5 });
    reg(hits, paceMark, "tour-pace");
    // Prospect in a wheelchair at the head of the route.
    const chair = group(g, 1.8, 0, -0.1, Math.PI);
    for (const sx of [-0.28, 0.28]) {
      const wheel = torus(chair, 0.28, 0.02, sx, 0.3, 0, 0x22262b, { rough: 0.6, seg: 8, seg2: 24 });
      wheel.rotation.y = Math.PI / 2;
      cyl(chair, 0.05, 0.05, 0.03, sx * 0.8, 0.06, -0.3, 0x22262b, { rough: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    }
    box(chair, 0.46, 0.05, 0.44, 0, 0.47, 0, 0x2b3138, { rough: 0.6 });
    box(chair, 0.46, 0.46, 0.04, 0, 0.72, 0.22, 0x2b3138, { rough: 0.6 });
    const prospect = seatedFigure(chair, 0, 0.02, 0.0, { cloth: 0x4a6a8a, ry: Math.PI });
    void prospect;

    // ------------------------------------------------------------ boards
    const logBoard = holoPanel(g, 0.54, 0.36, -2.2, 1.6, 1.9, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fb86a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eef6e6";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#c9dcb8";
      ["Requests · reports · visits", "Applications decided", "Dated, in order"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 1.1, accent: PMLO_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, 0.2, 1.75, -2.55, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Leasing team", w / 2, h * 0.56);
      cx.fillText("EAP · member assistance", w / 2, h * 0.74);
    }, { ry: 0, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // Plant and a coffee station for the waiting area.
    const plant = group(g, 2.4, 0, 2.0);
    cyl(plant, 0.18, 0.15, 0.42, 0, 0.21, 0, 0xd7d0c4, { rough: 0.6, seg: 14 });
    ball(plant, 0.32, 0, 0.75, 0, 0x4a7d44, { rough: 0.85, seg: 10 });
    const coffee = group(g, -2.4, 0, 1.0, Math.PI / 2);
    box(coffee, 0.9, 0.85, 0.45, 0, 0.425, 0, 0x5a4a3a, { rough: 0.6 });
    box(coffee, 0.22, 0.34, 0.26, -0.2, 1.02, 0, 0x2b3138, { rough: 0.4, metal: 0.4 });
    for (let i = 0; i < 3; i++) cyl(coffee, 0.035, 0.03, 0.09, 0.1 + i * 0.1, 0.9, 0.05, 0xf4f0e6, { rough: 0.4, seg: 10 });

    // ------------------------------------------------------------ people
    const coworker = standingFigure(g, 0.8, -1.2, { ry: -0.5, cloth: 0x3a5a3a, trousers: 0x22272d });
    const tenant = standingFigure(g, -1.45, 0.45, { ry: Math.PI - 0.4, cloth: 0x7a4a6a, trousers: 0x2b3138 });
    tenant.visible = false;
    const inspector = standingFigure(g, 1.2, 1.3, { ry: -2.6, cloth: 0x1f2f4a, trousers: 0x1b2230 });
    inspector.visible = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -1.4),

      onStep(step) {
        if (step.id === "lone-worker-checkin") radioLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
      },

      onStepComplete(step) {
        if (step.id === "ad-review") for (const id of ["ad-adults-only", "ad-english-only", "ad-able-bodied"]) hits[id].visible = false;
        if (step.id === "income-ratio") repaint(calcFace, signFace("QUALIFIES", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.45 }));
        if (step.id === "lead-disclosure") { pamphlet.parent.remove(pamphlet); packet.add(pamphlet); pamphlet.position.set(0, 0.03, 0); }
        if (step.id === "lone-worker-checkin") radioLamp.material = mat(0x2a3a2a, { rough: 0.4 });
        if (step.id === "accessible-tour") chair.position.set(1.4, 0, -0.9);
        if (step.id === "lock-files") repaint(criteriaFace, signFace("FILES\nLOCKED", { bg: "#101a12", accent: "#59c97b", fg: "#e6f2dc", scale: 0.32 }));
      },

      onInterrupt(it) {
        if (it.id === "tenant-harassment") tenant.visible = true;
        if (it.id === "housing-inspector") inspector.visible = true;
      },
      onInterruptEnd(it) {
        if (it.id === "tenant-harassment") {
          tenant.visible = false;
          if (it.resolved === "answered") harass.position.y = 0.795;
        }
        if (it.id === "housing-inspector") {
          inspector.visible = false;
          if (it.resolved === "answered") woBinder.visible = false;
        }
      },

      animate(t) {
        coworker.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
      },
    };
  },
};
