import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Apprenticeship Enrollment Day VR — Pathway Edition, wojrc.org.
//
// The coordinator's office on the day an apprenticeship offer becomes actual
// enrollment: documents gathered, the apprentice agreement, the drug-test
// consent and the medical-information release signed in the order that
// makes each one mean something, the coordinator's checklist read in full,
// what a drug-test consent actually authorises understood before it is
// signed, a short physical sat through without fidgeting, the checklist's
// own gaps found, the packet filed and the coordinator's sign-off given.
// Every requirement here is stated only as "per the programme's
// requirements" or "per the apprenticeship standard" — no clause number,
// drug panel or physical standard is invented. Sited generically: no real
// coordinator, programme or clause number the registry is not sure of.

const AED_ACCENT = 0x8a6fd8;
const AED_CSS = "#8a6fd8";

export const SIM_WP_APPRENTICESHIP_ENROLLMENT_DAY = {
  id: "wp-apprenticeship-enrollment-day",
  index: "713",
  domain: "Apprenticeship navigation",
  trade: "Pathway Edition — the apprenticeship enrolment paperwork day: documents, drug-test consent, the physical and the coordinator's checklist",
  category: "Community Environmental Justice",
  indoor: "clinic",
  weather: "clear",
  certification: "Registered apprenticeship standards as a category — the enrolment paperwork this whole day exists to complete, per the apprenticeship standard the applicant is being indentured under; the OSHA Outreach Training Program's OSHA 10 card, one of the documents the coordinator's checklist checks for; HIPAA's Privacy Rule, for what the physical's results may and may not be shared with anyone outside the clinician who performs it; 29 CFR 1910.151 for the medical-services context a workplace physical sits inside; 29 CFR 1910.22 for the walking-working surfaces every office and clinic waiting room shares; Teamsters (IBT) apprenticeship and training programmes, named on the coordinator's own checklist as the body running today's enrollment",
  name: "Apprenticeship Enrollment Day",
  title: simTitle("Apprenticeship Enrollment Day"),
  tagline: "Gather the documents, sign the forms in the order that makes each one mean something, read the coordinator's checklist, understand the drug-test consent before you sign it, sit the physical without fidgeting, and file a complete packet",
  accent: AED_ACCENT,
  accentCss: AED_CSS,
  parSeconds: 340,
  footprint: 2.2,
  supportLine: "your training coordinator or your Teamsters steward, and 988 or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if enrollment day's paperwork brings up more than the room can hold",
  badge: { id: "enrolled", name: "Enrolled", note: "Documents gathered, every form signed in order, the checklist read, the consent understood before it was signed, the physical sat through steadily, and a complete packet filed" },

  game: system({
    name: "Coordinator's Office",
    currency: "FORM",
    ranks: ["Offer Made", "Documents Gathered", "Forms Signed", "Physical Sat", "Enrollment Certified"],
    badges: [
      { id: "full-folder", name: "Full Folder", note: "Every document gathered and the checklist's own gaps found clean", test: AWARD.all(AWARD.stepClean("gather-documents"), AWARD.stepClean("checklist-gaps")) },
      { id: "signed-informed", name: "Signed Informed", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "held-steady", name: "Held Steady", note: "The physical stillness track carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-enrollment", name: "Clean Enrollment", note: "No corrections anywhere", test: AWARD.clean },
      { id: "honest-concerns", name: "Honest Concerns", note: "The concerns gauge committed near the middle of the band", test: AWARD.precise(0.7) },
      { id: "one-visit-enrolled", name: "One-Visit Enrolled", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wp-ae-clipboard-hunch": "You were about to fill out a stack of forms hunched over a clipboard balanced on your knee instead of at the desk. An enrollment packet this thick takes real time to complete properly, and doing it hunched over for that long strains a back that has not even started the apprenticeship yet — sit at the desk and use its surface, not your knee.",
    "wp-ae-stuffy-waiting": "The waiting area outside the coordinator's office has gone warm with the door closed all morning. A hot, airless room before a physical is exactly the wrong condition to sit in — crack the door for a cross breeze and get water before your name is called, not after you are already lightheaded.",
    "wp-ae-consent-visitor": "An applicant in the waiting chairs is arguing loudly that the drug-test consent should not be required at all, and is getting into the coordinator's assistant's space about it. Space and a level tone come first — step back, let the coordinator's staff handle the disagreement, and do not let his volume become the reason you rush your own reading of the same form.",
    "wp-ae-lightheaded-physical": "The applicant ahead of you at the physical has gone pale and unsteady right after a finger-stick, and is swaying where they stand. A brief lightheaded spell right after a blood draw is common and usually passes quickly with the person seated and their head down — get them into a chair, tell the clinician, and stay with them rather than stepping past to keep the line moving.",
  },

  lateNotes: {
    "wp-ae-consent-form": "Not yet. The consent is signed once you can say back what it actually authorises — not before you have read what it means.",
    "wp-ae-enrollment-log": "The log closes out enrollment day last, with the checklist's own sign-off already on it.",
  },

  steps: [
    {
      id: "sign-in", kind: "select", target: "wp-ae-signin-desk",
      title: "Sign in at the coordinator's office",
      cue: "Sign the sheet with your name and the enrollment appointment time.",
      why: "Enrollment day is scheduled around the coordinator's own calendar of appointments back to back, and signing in confirms you are here for the slot booked rather than another applicant's — the same habit every appointment on this pathway runs on.",
    },
    {
      id: "gather-documents", kind: "find", noHint: true,
      targets: ["wp-ae-doc-id", "wp-ae-doc-agreement-copy", "wp-ae-doc-osha10"],
      itemNames: { "wp-ae-doc-id": "photo ID", "wp-ae-doc-agreement-copy": "your copy of the apprentice agreement", "wp-ae-doc-osha10": "your OSHA 10 card" },
      itemNotes: {
        "wp-ae-doc-id": "Photo ID is checked against the enrollment file before any form is signed under it.",
        "wp-ae-doc-agreement-copy": "Bringing your own copy of the apprentice agreement means you can check today's paperwork against what you were actually offered.",
        "wp-ae-doc-osha10": "The OSHA 10 card is one of the first items on the coordinator's checklist — bringing it saves a return trip to prove something you already have.",
      },
      title: "Find the three documents on the table",
      cue: "From the folder on the table, find your photo ID, your copy of the apprentice agreement and your OSHA 10 card.",
      why: "An enrollment appointment that stalls on a missing document is the most avoidable way to turn one visit into two, and each of these three is checked before the coordinator moves on to the forms that actually enroll you.",
    },
    {
      id: "sign-forms-order", kind: "sequence",
      targets: ["wp-ae-form-agreement", "wp-ae-form-consent", "wp-ae-form-release"],
      itemNames: { "wp-ae-form-agreement": "the apprentice agreement", "wp-ae-form-consent": "the drug-test consent", "wp-ae-form-release": "the medical-information release" },
      outOfOrderNote: "The agreement first, because it is what makes you an apprentice the rest of the paperwork is about; the drug-test consent next, since it is a condition of that agreement per the programme's requirements; and the medical-information release last, because it only means something once there is a physical and a consent for it to attach to.",
      title: "Sign the forms in the order that makes each one mean something",
      cue: "Sign the apprentice agreement, then the drug-test consent, then the medical-information release — in that order.",
      why: "Each of these forms only makes sense once the one before it exists: the drug-test consent is a condition of the agreement, and the medical release only has something to release once the physical it is attached to is actually about to happen. Signing them in this order is what keeps you from signing a release for a physical the agreement has not even required yet.",
    },
    {
      id: "read-checklist", kind: "hold", target: "wp-ae-checklist-board", seconds: 6,
      title: "Read the coordinator's checklist in full",
      cue: "Hold at the checklist board and read everything enrollment day requires, per the programme's own list.",
      why: "The coordinator's checklist is the actual list of what this specific programme requires for enrollment, and it is not the same list every programme uses — reading it in full, rather than assuming from a friend's experience elsewhere, is what keeps you from missing a requirement this programme states and another one does not.",
      holdBreakNote: "You left the board before the physical requirement line. That is the one most people assume they already know — read it through.",
    },
    {
      id: "understand-consent", kind: "select", target: "wp-ae-consent-explain-correct",
      title: "Understand what the drug-test consent actually authorises",
      cue: "Among the explanation cards, choose the one that matches what the coordinator's own form actually says — not the rumor.",
      why: "A consent form should never be signed on the strength of what someone else said it means, and the coordinator's own form states, per the programme's requirements, exactly what is tested, who reviews the result and what the employer is told. Reading the correct explanation before signing is what makes the signature an informed one rather than a guess.",
    },
    {
      id: "concerns-gauge", kind: "gauge", target: "wp-ae-concerns-dial",
      title: "Rate any concerns about the physical honestly",
      cue: "The dial runs one to ten. Commit it where your actual concerns are, not where you think the coordinator wants to hear.",
      gauge: {
        label: "CONCERNS", speed: 0.6, green: [0.3, 0.6],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That number does not sound like someone with a real question about a medication or a condition. Rate it honestly — the coordinator can only address a concern that is actually named.",
      },
      why: "A physical goes smoother when a real concern — a medication, a past injury, a fear of needles — is named to the coordinator or the clinician beforehand rather than discovered mid-appointment. This number is not a pass-fail test; it is what tells the coordinator whether today's physical needs anything arranged ahead of it.",
    },
    {
      id: "physical-stillness", kind: "track", target: "wp-ae-vision-screen", seconds: 7,
      title: "Hold still through the vision and hearing screening",
      cue: "Hold the stillness track in the band: steady and attentive, not fidgeting and not frozen stiff.",
      track: {
        start: 0.5, green: [0.36, 0.66], rise: 0.5, fall: 0.44, drift: 0.14, label: "STEADY",
        readout: (v) => (v < 0.36 ? "fidgeting" : v > 0.66 ? "rigid" : "steady"),
      },
      holdBreakNote: "You drifted out of steady — into fidgeting or into going rigid. Settle back to holding still and paying attention to the screen.",
      why: "A basic vision and hearing screening only reads accurately when the person taking it is neither moving around nor so tensed up that a normal response reads as a problem. Holding steady is a small skill with a real payoff: a screening result that actually reflects you rather than how nervous the room made you.",
    },
    {
      id: "checklist-gaps", kind: "find", noHint: true,
      targets: ["wp-ae-gap-emergency", "wp-ae-gap-toollist", "wp-ae-gap-directdeposit"],
      itemNames: { "wp-ae-gap-emergency": "emergency contact not updated", "wp-ae-gap-toollist": "tool list not signed", "wp-ae-gap-directdeposit": "no direct deposit form" },
      itemNotes: {
        "wp-ae-gap-emergency": "An emergency contact left over from intake, weeks ago, may not be current — the coordinator's checklist asks you to confirm it again on enrollment day specifically.",
        "wp-ae-gap-toollist": "The tool list you packed for the union hall does not count as signed until it is signed here, on the programme's own copy.",
        "wp-ae-gap-directdeposit": "No direct deposit form on file means a first paycheck arrives as a paper check mailed out, days later than it would with the form filed today.",
      },
      title: "Find what the checklist still needs from your folder",
      cue: "Three items on the coordinator's checklist are still unchecked in your folder. Find all three.",
      why: "A checklist exists because enrollment day generates more paperwork than any one person reliably remembers unprompted, and finding these three gaps here — while the coordinator is still in the room to fix them — is what keeps a first paycheck or an emergency contact from being wrong for weeks before anyone notices.",
    },
    {
      id: "sign-consent", kind: "select", target: "wp-ae-consent-form",
      title: "Sign the drug-test consent",
      cue: "Now that you can say back what it authorises, sign the consent form.",
      why: "Signing now, after actually reading and understanding the correct explanation, is what makes this an informed consent rather than a formality initialed on the way past — the same form, signed with the same understanding it would take to explain it to somebody else.",
    },
    {
      id: "book-report-date", kind: "turn", target: "wp-ae-calendar-dial",
      title: "Book your first report date",
      cue: "Turn the calendar dial to the date the coordinator gives you for orientation.",
      turn: { turns: 0.6, axis: "y", label: "FIRST REPORT DATE" },
      why: "Enrollment is not finished until there is an actual date to show up to next — booking it here, at the desk, with the coordinator confirming it, is what turns a signed packet into a date on your own calendar instead of a promise to call you later.",
    },
    {
      id: "file-packet", kind: "drag", target: "wp-ae-enrollment-packet",
      title: "File the complete packet",
      cue: "Carry the completed packet into the coordinator's file cabinet.",
      why: "A completed enrollment packet filed today is what the programme's records show as enrolled; one left on the desk to be filed later is a packet that can go missing between now and the first day, when it actually gets asked for.",
      drag: { to: "wp-ae-file-cabinet", radius: 0.4, missNote: "Not in the cabinet. A packet left on the desk is a packet somebody else's paperwork gets stacked on top of." },
    },
    {
      id: "coordinator-signoff", kind: "select", target: "wp-ae-coordinator",
      title: "Get the coordinator's sign-off",
      cue: "Have the coordinator review the checklist and sign off that enrollment is complete.",
      why: "The coordinator's own signature on the checklist is what makes enrollment official in the programme's own records, not just complete in your own folder — it is the one signature on this whole day that neither of you can substitute for the other's.",
    },
    {
      id: "close-log", kind: "select", target: "wp-ae-enrollment-log",
      title: "Close out the enrollment log",
      cue: "Log the forms signed, the checklist's sign-off and the first report date, then sign it.",
      why: "The enrollment log is the record the programme's own file and your training coordinator both read before your first day — a report date and a completed checklist written down today are what make that first morning start without a paperwork question holding it up.",
    },
  ],

  interrupts: [
    {
      id: "wp-ae-form-mixup",
      kind: "Coordinator hands you the wrong form",
      after: "sign-forms-order", delay: 3, seconds: 12,
      alert: "The coordinator's assistant hands you a form for a different applicant's file by mistake, already partly filled in with somebody else's name.",
      cue: "Do not sign it. Hand it back and say whose name is on it.",
      target: "wp-ae-assistant-desk",
      why: "Signing a form under somebody else's name, even by accident, puts a wrong document in two different apprentices' files at once — the assistant's desk is where a mix-up like this gets caught and fixed in seconds, before it becomes two records that both need correcting later.",
      missNote: "You started filling it in anyway, and in the version where it got filed, your signature ended up on another apprentice's paperwork while your own enrollment was still missing that same form.",
      wrongNote: "Not the checklist board, and not the form itself. Hand it back to the assistant's desk and say whose name it actually has on it.",
    },
    {
      id: "wp-ae-blood-draw-faint",
      kind: "The applicant ahead faints at the blood draw",
      after: "physical-stillness", delay: 3, seconds: 12,
      alert: "The applicant just ahead of you at the physical has gone white and starts to slide sideways off the chair right after their finger-stick.",
      cue: "Help lower them safely and call for the clinician — do not just watch.",
      target: "wp-ae-clinician-call",
      why: "A brief faint right after a finger-stick is common, and the person is at more risk from an uncontrolled fall than from the faint itself — helping ease them down and calling the clinician over immediately is what turns a routine vasovagal moment into a non-event instead of a fall injury on top of it.",
      missNote: "You stayed in your seat and watched, and in the version where nobody helped, they went down hard against the chair on the way to the floor instead of being eased down by someone standing right there.",
      wrongNote: "Not the vision screen. The clinician call button is what gets trained help there fast — press that while you steady them.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.2, AED_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#77738a", base2: "#6e6a80", seam: "rgba(0,0,0,0.14)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.05, rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.03, color: 0xa8a4b8 });

    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xdad6e4, { rough: 0.9 });
    box(g, 5.6, 0.1, 0.14, 0, 0.05, -2.28, 0x3a4048, { rough: 0.7 });
    decal(g, 2.2, 0.18, 0, 2.4, -2.29, signFace("PATHWAY EDITION — ENROLLMENT", { bg: "#1f2a36", accent: AED_CSS, scale: 0.42 }), { px: 512 });

    const stand = group(g, -1.3, 0, -1.1, 0.3);
    cyl(stand, 0.2, 0.24, 0.04, 0, 0.02, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(stand, 0.03, 0.03, 1.0, 0, 0.52, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const lectern = group(stand, 0, 1.05, 0);
    lectern.rotation.x = -0.35;
    slab(lectern, 0.5, 0.04, 0.36, 0, 0, 0, 0x5a4a3a, { radius: 0.01, rough: 0.6 });
    decal(lectern, 0.44, 0.3, 0, 0.022, 0, paperFace("ENROLLMENT SIGN-IN", ["Name · time", "1. ______"], { bg: "#fbf8f0", band: "#5a4a8a" }), { px: 256 }).rotation.x = -Math.PI / 2;
    holoTag(stand, "sign-in sheet", 0, 1.3, 0, { css: AED_CSS, w: 0.34 });
    reg2(lectern, "wp-ae-signin-desk");

    // Document table.
    const table = group(g, -1.6, 0, 0.4);
    slab(table, 1.0, 0.05, 0.7, 0, 0.7, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(table, 0.05, 0.68, 0.5, sx * 0.45, 0.35, 0, 0x3a2a1e, { rough: 0.6 });
    const DOCS = [["wp-ae-doc-id", -0.3, "PHOTO ID", "#2f5f8a"], ["wp-ae-doc-agreement-copy", -0.05, "AGREEMENT COPY", "#3f7a45"], ["wp-ae-doc-osha10", 0.2, "OSHA 10", "#8a6a2a"]];
    for (const [id, x, label, band] of DOCS) {
      const c = group(table, x, 0.73, 0.05, (x + 0.3) * 0.4);
      slab(c, 0.16, 0.004, 0.1, 0, 0, 0, 0xf6f4ee, { radius: 0.006, rough: 0.6 });
      decal(c, 0.15, 0.09, 0, 0.004, 0, paperFace(label, ["copy"], { bg: "#f6f4ee", band }), { px: 128 }).rotation.x = -Math.PI / 2;
      reg2(c, id);
    }
    const clipHunch = box(table, 0.3, 0.02, 0.2, 0.35, 0.75, -0.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "clipboard on your knee?", 0.35, 0.9, -0.2, { css: "#f0645b", w: 0.4 });
    reg2(clipHunch, "wp-ae-clipboard-hunch");

    // The desk with the three forms in order.
    const desk = group(g, 0.3, 0, -1.5);
    slab(desk, 1.5, 0.05, 0.7, 0, 0.74, 0, 0x7a6048, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(desk, 0.06, 0.72, 0.5, sx * 0.7, 0.37, 0, 0x4a3a2a, { rough: 0.6 });
    const FORMS = [["wp-ae-form-agreement", -0.4, "APPRENTICE AGREEMENT"], ["wp-ae-form-consent", -0.05, "DRUG-TEST CONSENT"], ["wp-ae-form-release", 0.3, "MEDICAL RELEASE"]];
    for (const [id, x, label] of FORMS) {
      const p = decal(desk, 0.28, 0.18, x, 0.775, 0.05, paperFace(label, ["sign · date"], { bg: "#f6f3ea", band: "#5a4a8a" }), { px: 176 });
      p.rotation.x = -Math.PI / 2;
      reg2(p, id);
    }
    const consentForm = decal(desk, 0.3, 0.2, -0.05, 0.776, -0.15, paperFace("DRUG-TEST CONSENT", ["sign here"], { bg: "#f6f3ea", band: "#5a4a8a" }), { px: 192 });
    consentForm.rotation.x = -Math.PI / 2;
    reg2(consentForm, "wp-ae-consent-form");
    const concernsDial = instrument(desk, 0.65, 0.02, 0.1, { idle: "-/10", color: AED_ACCENT, ry: -0.2 });
    holoTag(concernsDial, "concerns", 0, 0.18, 0, { css: AED_CSS, w: 0.26 });
    reg2(concernsDial, "wp-ae-concerns-dial");

    // Checklist board.
    const checklist = holoPanel(g, 1.2, 0.9, -1.9, 1.6, -2.25, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,28,0.93)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = AED_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ece6fa"; cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ENROLLMENT CHECKLIST", w * 0.05, h * 0.1);
      cx.font = `${Math.round(h * 0.06)}px Arial, sans-serif`; cx.fillStyle = "#ddd4f0";
      ["Documents on file", "Forms signed in order", "Physical — per programme reqs.", "Tool list + direct deposit"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.16)));
    }, { accent: AED_ACCENT });
    reg2(checklist, "wp-ae-checklist-board");

    // Consent explanation cards: one correct, two wrong.
    const explain = group(g, 1.7, 0.9, -1.6, -0.4);
    const explainCard = (id, y, label, css) => {
      const c = decal(explain, 0.6, 0.16, 0, y, 0, signFace(label, { bg: "#0c1a24", accent: css, scale: 0.24 }), { px: 256, glow: true, ei: 0.6, transparent: true });
      reg2(c, id);
    };
    explainCard("wp-ae-consent-explain-correct", 0.16, "TESTED · REVIEWED BY MRO · EMPLOYER TOLD FIT/NOT FIT", AED_CSS);
    explainCard("wp-ae-consent-explain-wrong-1", -0.02, "EMPLOYER SEES EVERY RESULT IN FULL", "#f0645b");
    explainCard("wp-ae-consent-explain-wrong-2", -0.2, "NOTHING IS ACTUALLY TESTED, IT'S A FORMALITY", "#f0645b");
    holoTag(explain, "what does the consent authorise?", 0, 0.34, 0, { css: AED_CSS, w: 0.6 });

    // Vision/hearing screening stand.
    const screen = instrument(g, 1.2, 0.9, -0.5, { idle: "STEADY", color: AED_ACCENT, w: 0.2, d: 0.24, ry: -0.4 });
    holoTag(screen, "vision + hearing screen", 0, 0.2, 0, { css: AED_CSS, w: 0.4 });
    reg2(screen, "wp-ae-vision-screen");
    const clinicianCall = box(g, 0.07, 0.06, 0.04, 1.35, 1.1, -0.55, 0xd2312b, { rough: 0.5, emissive: 0xd2312b, ei: 0.2 });
    holoTag(g, "clinician call button", 1.35, 1.22, -0.55, { css: "#f0645b", w: 0.34 });
    reg2(clinicianCall, "wp-ae-clinician-call");

    // Checklist-gaps board.
    const gaps = group(g, -1.9, 1.5, -1.6, 0.5);
    slab(gaps, 1.0, 0.7, 0.03, 0, -0.35, 0, 0x2a3036, { radius: 0.02, rough: 0.6 });
    const GAPS = [["wp-ae-gap-emergency", -0.24, "EMERGENCY CONTACT — unconfirmed"], ["wp-ae-gap-toollist", 0, "TOOL LIST — unsigned"], ["wp-ae-gap-directdeposit", 0.24, "DIRECT DEPOSIT — missing"]];
    for (const [id, y, label] of GAPS) {
      const p = decal(gaps, 0.9, 0.2, 0, y, 0.02, paperFace(label, [""], { bg: "#f6f3ea", band: "#c0322b" }), { px: 256 });
      reg2(p, id);
    }
    holoTag(gaps, "checklist gaps", 0, 0.4, 0.02, { css: AED_CSS, w: 0.26 });

    // Calendar dial for the first report date.
    const calendar = group(g, 2.1, 0.9, -0.6, -0.5);
    slab(calendar, 0.6, 0.35, 0.03, 0, -0.18, 0, 0x1f2a36, { radius: 0.02, rough: 0.6 });
    const calFace = decal(calendar, 0.5, 0.2, 0, -0.02, 0.02, signFace("--/--", { bg: "#0d1c24", accent: AED_CSS, fg: "#e6dcfa", scale: 0.5 }), { px: 224, glow: true, ei: 0.6 });
    const calDial = group(calendar, 0, -0.3, 0.03);
    cyl(calDial, 0.05, 0.05, 0.03, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(calendar, "calendar dial", 0, -0.4, 0.03, { css: AED_CSS, w: 0.3 });
    reg2(calDial, "wp-ae-calendar-dial");

    // Enrollment packet and file cabinet.
    const packet = group(g, 1.0, 0.75, 0.7, 0.2);
    slab(packet, 0.3, 0.02, 0.4, 0, 0, 0, 0xf6f3ea, { radius: 0.006, rough: 0.6 });
    decal(packet, 0.26, 0.34, 0, 0.011, 0, signFace("ENROLLMENT\nPACKET", { bg: "#f6f3ea", accent: "#5a4a8a", fg: "#2a3036", scale: 0.3 }), { px: 192 }).rotation.x = -Math.PI / 2;
    reg2(packet, "wp-ae-enrollment-packet");
    const cabinet = box(g, 0.4, 0.9, 0.4, 0.4, 0.45, 1.2, 0x4f5860, { rough: 0.6 });
    reg2(box(g, 0.4, 0.3, 0.4, 0.4, 0.85, 1.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-ae-file-cabinet");
    holoTag(g, "file cabinet", 0.4, 1.0, 1.2, { css: AED_CSS, w: 0.26 });
    void cabinet;

    // Assistant's desk (form-mixup interrupt answer).
    const assistantDesk = box(g, 0.5, 0.72, 0.4, -0.6, 0.36, 1.5, 0x6b5a48, { rough: 0.6 });
    holoTag(g, "assistant's desk", -0.6, 0.8, 1.5, { css: AED_CSS, w: 0.3 });
    reg2(assistantDesk, "wp-ae-assistant-desk");
    const mixupForm = box(g, 0.16, 0.012, 0.1, -0.6, 0.73, 1.4, 0xffe9d8, { rough: 0.7 });
    mixupForm.visible = false;

    // Log.
    const logBoard = decal(g, 0.4, 0.2, -0.6, 0.78, 0.9, paperFace("ENROLLMENT LOG", ["Forms: ____", "Report date: ____"], { bg: "#f6f3ea", band: "#5a4a8a" }), { px: 224 });
    logBoard.rotation.x = -Math.PI / 2;
    holoTag(g, "enrollment log", -0.6, 0.92, 0.9, { css: AED_CSS, w: 0.26 });
    reg2(logBoard, "wp-ae-enrollment-log");

    // Stuffy waiting area, the consent visitor, and the fainting applicant.
    const ventBox = box(g, 0.4, 0.25, 0.15, -2.4, 2.5, 1.6, 0xc9ced2, { rough: 0.6, metal: 0.3 });
    holoTag(g, "waiting room warm — open the door?", -2.4, 2.75, 1.6, { css: "#f0645b", w: 0.44 });
    reg2(ventBox, "wp-ae-stuffy-waiting");
    const visitor = standingFigure(g, 2.3, 1.7, { ry: Math.PI, cloth: 0x7a3a3a, skin: 0x8a5a3a, atStation: true });
    holoTag(visitor, "arguing about the consent?", 0, 1.9, 0, { css: "#f0645b", w: 0.42 });
    reg2(box(visitor, 0.6, 1.4, 0.6, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-ae-consent-visitor");
    const fainting = seatedFigure(g, 1.5, 0.46, -0.55, { ry: -0.4, cloth: 0x5a6a3a });
    holoTag(fainting.torso, "swaying — help them down?", 0, 1.0, 0.12, { css: "#f0645b", w: 0.4 });
    reg2(box(g, 0.5, 1.1, 0.5, 1.5, 0.9, -0.55, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-ae-lightheaded-physical");

    const coordinator = seatedFigure(g, -0.2, 0.46, 0.7, { ry: 0.4, cloth: 0x3f6b5a, skin: 0x6b4a33 });
    holoTag(coordinator.torso, "coordinator", 0, 1.3, 0.12, { css: AED_CSS, w: 0.24 });
    reg2(box(g, 0.5, 1.2, 0.5, -0.2, 1.0, 0.7, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-ae-coordinator");

    let mixupOn = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.3, -1.0),

      onStepComplete(step) {
        if (step.id === "sign-consent") repaint(consentForm, paperFace("DRUG-TEST CONSENT", ["signed"], { bg: "#f6f3ea", band: "#59c97b" }));
        if (step.id === "book-report-date") repaint(calFace, signFace("BOOKED", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "file-packet") packet.position.set(0.4, 0.85, 1.2);
        if (step.id === "close-log") repaint(logBoard, paperFace("ENROLLMENT LOG", ["Forms: all signed", "Report date: booked"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "wp-ae-form-mixup") { mixupOn = true; mixupForm.visible = true; }
        if (it.id === "wp-ae-blood-draw-faint") { fainting.root.position.set(1.5, 0.2, -0.4); clinicianCall.material.emissiveIntensity = 1.4; }
      },
      onInterruptEnd(it) {
        if (it.id === "wp-ae-form-mixup") { mixupOn = false; mixupForm.visible = false; }
        if (it.id === "wp-ae-blood-draw-faint") { fainting.root.position.set(1.5, 0.46, -0.55); clinicianCall.material.emissiveIntensity = 0.2; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void mixupOn;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "concerns-gauge") {
          const ok = gg.t >= 0.3 && gg.t <= 0.6;
          repaint(concernsDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)}/10`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "physical-stillness") {
          const ok = tr.v >= 0.36 && tr.v <= 0.66;
          repaint(screen.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.36 ? "FIDGETING" : "RIGID", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.4 }));
        }
        void t; void dt;
      },
    };
  },
};
