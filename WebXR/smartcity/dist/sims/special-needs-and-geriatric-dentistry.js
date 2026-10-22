import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  seatedFigure, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, equipmentCabinet, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Special Needs & Geriatric Dentistry VR — Dental & Oral Health,
// station two hundred and fifteen. An appointment for a patient who arrives in
// a wheelchair with the person who cares for them: the bay made reachable
// before they get to it, a transfer done with equipment rather than with
// somebody's back, consent taken from the patient rather than around them, a
// position that respects a swallow that no longer protects itself, a pace that
// stops when the patient says stop, and a dry mouth treated as the disease
// driver it is.
//
// Sited generically. No real patient, no real facility, no invented clause.

const SNG_ACCENT = 0x7fb4e8;
const SNG_STEEL = 0x9aa6ac;
const SNG_CHAIR = 0x3f5a6b;
const SNG_CABINET = 0xe7ecef;
const SNG_WARM = 0xe0c9a6;

export const SIM_SPECIAL_NEEDS_AND_GERIATRIC_DENTISTRY = {
  id: "special-needs-and-geriatric-dentistry",
  index: "215",
  domain: "Special care and geriatric dentistry",
  trade: "Dental assistant and hygienist — special care and geriatric dentistry (DANB Certified Dental Assistant), SEIU and UFCW clinic and dental staff",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "DANB's Certified Dental Assistant credential and the state dental practice act on what may be delegated during a supported appointment; Title II of the Americans with Disabilities Act on making a service reachable and on reasonable accommodation; SAMHSA's principles of trauma-informed care; SEIU and UFCW clinic and dental staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens; 8 CCR 5110 on repetitive motion and the lifting injuries that end clinic careers; NIOSH guidance on moving a person with equipment rather than by hand",
  name: "Special Needs & Geriatric Dentistry",
  title: simTitle("Special Needs & Geriatric Dentistry"),
  tagline: "A supported appointment: the bay reachable, the transfer done with equipment, consent taken from the patient, a swallow-safe position, a pace that stops when they say stop, and a dry mouth treated seriously",
  accent: SNG_ACCENT,
  accentCss: "#7fb4e8",
  parSeconds: 315,
  footprint: 2.4,
  badge: { id: "supported-visit", name: "Supported Visit", note: "A whole appointment completed at the patient's pace, with the transfer and the airway both handled properly" },

  game: system({
    name: "Supported Care",
    currency: "CARE",
    ranks: ["Clinic Aide", "Special Care Assistant", "Access Lead", "Geriatric Care Coordinator", "Special Care Certified"],
    badges: [
      { id: "equipment-not-backs", name: "Equipment, Not Backs", note: "The transfer done with the board and the belt, brakes first", test: AWARD.stepClean("transfer-order") },
      { id: "their-pace", name: "Their Pace", note: "The stop signal answered every time it was raised", test: AWARD.safe },
      { id: "airway-held", name: "Airway Held", note: "Position and suction both held near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "unhurried", name: "Unhurried", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-missteps", name: "No Missteps", note: "A visit with no corrections", test: AWARD.clean },
      { id: "patient-streak", name: "Patient Streak", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "wheelchair-push-handles": "Those are the chair's push handles, not a lifting point. Hauling somebody upright by the back of their own wheelchair tips the chair, loads your lumbar spine at full stretch and takes all control of the movement away from the person being moved — it is the mechanism behind the patient-handling injuries 8 CCR 5110 and NIOSH both ask employers to design out with equipment and a second pair of hands.",
    "full-recline-preset": "That preset lays the chair flat. A patient whose swallow no longer protects itself — after a stroke, with advanced Parkinson's, with reflux — is at real risk of aspirating water, saliva or debris the moment their airway sits below their stomach, and they may not be able to cough it back. Flat is a position you choose for a reason, not a default you press on the way past.",
    "alcohol-mouthrinse": "That is an alcohol-based mouthrinse. Handing it to somebody whose mouth is already dry from their medication makes the dryness worse and stings mucosa that has lost the saliva protecting it — patients with xerostomia often stop using any rinse at all after one experience like that. Alcohol-free is the only sensible bottle on this counter.",
    "sugary-supplement": "That is a sweetened nutritional supplement drink, left within reach as though it were water. Sipped slowly through a dry-mouthed afternoon, it bathes every root surface in sugar for hours at a time, and root caries in an older patient runs fast and shows late. The drink may well be medically necessary — which is exactly why it is taken at a meal with water afterwards, not nursed all day.",
  },

  lateNotes: {
    "mouth-prop": "The prop goes in once the patient has agreed to it and the chair is positioned — not before either.",
    "xero-kit": "The dry-mouth kit is handed over at the end, with the instructions, so it leaves with whoever will actually use it.",
    "suction-tip": "Suction comes up when there is something to clear, and after the position is set — not while the transfer is still happening.",
  },

  steps: [
    {
      id: "care-plan", kind: "select", target: "care-plan-board",
      title: "Read the care plan and the accommodation asked for",
      cue: "Read the pre-visit notes: how this patient communicates, what was asked for, and who is coming with them.",
      why: "Almost everything that makes this appointment work was decided before the patient arrived: whether they use words, a board or a phone to communicate, whether they need the first slot of the day when the waiting room is quiet, whether a hoist and two people are needed for the transfer, and who holds the authority to consent. Reading it first is also what Title II of the Americans with Disabilities Act asks of a service in practice — a reasonable accommodation only happens if somebody has arranged it in advance rather than improvised it at the door.",
    },
    {
      id: "access-check", kind: "find", noHint: true,
      targets: ["cart-in-turning-space", "high-only-counter", "flickering-light"],
      itemNames: {
        "cart-in-turning-space": "the supply cart parked in the turning space",
        "high-only-counter": "the counter that is only reachable standing",
        "flickering-light": "the flickering overhead tube",
      },
      itemNotes: {
        "cart-in-turning-space": "A cart parked where the wheelchair has to turn. A bay that a chair cannot turn around in forces a reversing manoeuvre nobody planned, usually with somebody's foot in the way.",
        "high-only-counter": "The only surface to sign a form on is at standing height. Nothing about that is unavoidable — a clipboard or a lower surface makes the same task possible, and having to ask for one is its own small indignity.",
        "flickering-light": "A flickering tube overhead. For a patient with a sensory processing difference, a seizure history or a migraine pattern, that flicker is not a minor annoyance — it can end the appointment before it starts.",
      },
      title: "Walk the bay before the patient comes in",
      cue: "Three things in this bay will make the visit harder. Find them while there is still time to move them.",
      why: "Access is physical and specific. A wheelchair needs roughly a metre and a half of clear floor to turn, a form needs a surface somebody seated can write on, and a flickering fluorescent tube is a genuine barrier for a patient with a sensory difference or a seizure history. All three are free to fix ten minutes before the appointment and impossible to fix gracefully once the patient is in the doorway watching you move furniture.",
    },
    {
      id: "transfer-plan", kind: "select", target: "slide-board",
      title: "Choose the transfer method with the patient",
      cue: "Agree the transfer with the patient and pick up the slide board rather than planning to lift.",
      why: "The patient is the person who knows how their own transfers go — which side is stronger, what hurts, whether they can take weight for a moment, what went wrong last time. Asking takes fifteen seconds and prevents most of what goes wrong. The board is chosen because a sliding transfer keeps them supported the whole way across instead of relying on somebody's grip, and because a lift by hand is the one method that injures both people at once when it fails.",
    },
    {
      id: "transfer-order", kind: "sequence",
      targets: ["wheel-brakes", "transfer-belt", "transfer-count"],
      itemNames: { "wheel-brakes": "both wheelchair brakes", "transfer-belt": "the transfer belt", "transfer-count": "the count before you move" },
      title: "Brakes, belt, then the count",
      cue: "Set both brakes, fit the transfer belt, then move only on an out-loud count.",
      why: "Each part of that order stops a specific accident. Brakes on both wheels stop the chair rolling out from under somebody mid-transfer, which is the classic fall in a dental bay. A transfer belt gives you and your colleague a handhold designed for it instead of an armpit or a waistband, which is where shoulder injuries to patients come from. And the count means two staff and the patient all move on the same beat — a transfer where one person starts early is a transfer that becomes a catch.",
      outOfOrderNote: "Wrong order — brakes first, then the belt, then the count. Fitting a belt to a patient in an unbraked chair means the chair is free to roll the moment anybody leans.",
    },
    {
      id: "consent-with-patient", kind: "select", target: "patient-face",
      title: "Talk to the patient, with the caregiver alongside",
      cue: "Explain the plan to the patient directly, at eye level, and check they agree before you start.",
      why: "The commonest failure in a supported appointment is talking over somebody's head to the person pushing their chair. A patient who needs help with movement or speech has not delegated their decisions: the explanation goes to them, at their eye level, in the time they need to answer, and the caregiver is there to support that conversation rather than to replace it. Where somebody genuinely cannot decide for themselves, who may decide instead is a legal question with a documented answer — and it is still their appointment.",
    },
    {
      id: "medication-review", kind: "select", target: "med-list",
      title: "Go through the medication list with whoever brought it",
      cue: "Read the list out loud with the caregiver and flag the ones that change today's plan.",
      why: "Polypharmacy is the normal state of an older patient's medicine cabinet, and three groups on this list change the appointment: anticoagulants change how bleeding is managed, antiresorptives change how any extraction is considered, and the long list of drugs that dry the mouth — antidepressants, antihistamines, diuretics, inhalers — explain the caries you are about to find. What the list says and what is actually being taken often differ, which is why it is read out loud with the person who fills the box rather than copied off a screen.",
    },
    {
      id: "position-set", kind: "gauge", target: "recline-control",
      title: "Set a position the patient can still swallow in",
      cue: "Set the chair back to a swallow-safe angle rather than flat, then commit the reading.",
      why: "For a patient with dysphagia, position is airway protection. Sat too upright and you cannot see or reach the upper arch at all; laid flat and water, saliva and debris collect at the back of a throat that may no longer reliably cough them out, and a silent aspiration today is a chest infection in a week. A part-reclined position with the head supported and slightly turned lets fluid pool where suction can reach it, and it is the single most useful thing done at this chair before any instrument appears.",
      gauge: {
        label: "CHAIR ANGLE", speed: 0.75, green: [0.36, 0.6],
        readout: (t) => (t < 0.36 ? "too upright — no access" : t > 0.6 ? "too flat — airway at risk" : `${Math.round(20 + t * 45)}° reclined`),
        missNote: "Not a swallow-safe angle. Come back to a part-reclined position with the head supported, and ask the patient how it feels rather than trusting the scale.",
      },
    },
    {
      id: "dim-light", kind: "turn", target: "light-dimmer",
      title: "Turn the overhead down to what the patient can tolerate",
      cue: "Turn the room dimmer down, keep the task light on the mouth, and check with the patient.",
      why: "Sensory load is part of the clinical picture: a bright overhead, a radio and a suction running at once is enough to end an appointment for a patient with autism, dementia or a migraine pattern, and none of it is necessary. The task light on the mouth is the light that matters; everything above it can come down. Turning it down and asking is also the first small thing in this appointment the patient gets to decide, which changes the tone of everything after it.",
      turn: { turns: 0.5, axis: "z", label: "ROOM DIMMER" },
    },
    {
      id: "prop-choice", kind: "select", target: "mouth-prop",
      title: "Choose the right tethered mouth prop",
      cue: "Pick the prop that fits this mouth, with its tether attached.",
      why: "A mouth prop supports a jaw that cannot hold itself open, which protects both the patient's jaw muscles and your fingers — and for a patient who may bite involuntarily, it is the difference between a safe appointment and a bitten hand. Size matters: too large and the joint is strained, too small and it does nothing. The tether matters more: anything placed at the back of a mouth is tied to something outside it, so that if the jaw closes or the patient coughs, the prop comes out with the string rather than going the other way.",
    },
    {
      id: "prop-hold", kind: "hold", target: "mouth-prop", seconds: 9,
      title: "Hold the prop and keep the airway clear",
      cue: "Hold the prop steady and keep the mouth's floor clear while the examination starts.",
      why: "Holding the prop is an active job, not a parking place: it stays seated where it was placed, the lips and cheek stay clear of it, and your eyes stay on the throat rather than on the tooth. For a patient who cannot reliably clear their own mouth, everything that goes in — water, debris, a piece of calculus — has to come back out through your suction, and the moment to notice pooling is before it reaches the back of the tongue rather than after the first cough.",
      holdBreakNote: "The prop shifted out of place. Reseat it and hold — a prop that has slipped is either doing nothing or pressing somewhere it should not.",
    },
    {
      id: "suction-track", kind: "track", target: "suction-tip", seconds: 10,
      title: "Keep the suction where a dysphagic patient needs it",
      cue: "Keep the tip low in the floor of the mouth, clearing continuously, without touching the soft palate.",
      why: "Dysphagia-aware suction means the tip lives at the lowest point of the mouth, working continuously rather than in bursts, so that nothing ever accumulates deep enough to be inhaled. Two mistakes matter: suction used only occasionally, which lets a pool build while your attention is elsewhere, and a tip pressed against the soft palate, which triggers gagging and can drive exactly the aspiration you were trying to prevent. Low, steady and away from the palate is the whole technique.",
      track: {
        start: 0.12, green: [0.34, 0.58], rise: 0.5, fall: 0.44, drift: 0.12, label: "SUCTION POSITION",
        readout: (v) => (v < 0.34 ? "not clearing — fluid pooling" : v > 0.58 ? "too deep — touching the palate" : "low and clearing"),
      },
      holdBreakNote: "The tip drifted out of position. Bring it back to the floor of the mouth — pooling here is the beginning of an aspiration, and there may be no cough to warn you.",
    },
    {
      id: "xero-signs", kind: "find", noHint: true,
      targets: ["dry-tongue", "mirror-stick", "root-caries"],
      itemNames: {
        "dry-tongue": "the dry, fissured tongue",
        "mirror-stick": "the mirror sticking to the mucosa",
        "root-caries": "the soft cavity at the gum line",
      },
      itemNotes: {
        "dry-tongue": "A tongue with deep fissures and no film of saliva on it. This is what a dry mouth looks like before the patient thinks to mention it, because they have adapted to it over years.",
        "mirror-stick": "The mirror drags on the cheek instead of gliding. That is the simplest chairside test for xerostomia there is, and it takes a second.",
        "root-caries": "A soft, brown cavity right at the gum line where the root is exposed. Root caries is the signature lesion of a dry mouth in an older patient, and it progresses much faster than the enamel decay most people picture.",
      },
      title: "Find the signs of a dry mouth",
      cue: "Three findings in this mouth all point the same way. Find them.",
      why: "Xerostomia is usually a side effect of medication rather than of age, and it is the reason an older patient who brushed the same way for fifty years suddenly has cavities at every gum line: without saliva there is no buffering, no washing and no remineralising. A fissured tongue, a mirror that sticks and root caries are three findings that together make the diagnosis at the chair, and naming it is what turns an endless run of fillings into a problem somebody can actually manage.",
    },
    {
      id: "xero-handover", kind: "drag", target: "xero-kit",
      title: "Hand the dry-mouth kit to whoever manages it at home",
      cue: "Carry the dry-mouth kit over to the caregiver's bag and go through what is in it.",
      why: "The kit is the treatment: high-fluoride toothpaste to slow the root caries, a saliva substitute or gel for comfort and for sleeping, an alcohol-free rinse, sugar-free gum where the patient can chew it, and water rather than sweetened drinks for sipping. It is handed to the person who will actually open it — often the caregiver rather than the patient — with each item explained once, because a bag of unfamiliar products with no explanation stays in a cupboard until the next appointment.",
      drag: { to: "caregiver-bag", radius: 0.5, missNote: "Not in the bag. A kit left on the counter is a kit that goes home with nobody — it leaves with the person who does the brushing." },
    },
    {
      id: "team-checkin", kind: "select", target: "team-checkin",
      title: "Check in with your colleague before the room turns over",
      cue: "Debrief the transfer and the appointment with the colleague who worked it with you.",
      why: "Two-person work needs two-person feedback, and the honest version of this conversation is short: did the transfer feel controlled, did either of us take a load we should not have, did the patient stop us at any point and did we notice quickly enough. Near misses in patient handling do not leave a mark — nobody falls, nobody reports it, and the same technique gets used again next week on a heavier patient. Saying it out loud, and writing down what needs equipment next time, is the whole of what prevention amounts to here.",
    },
    {
      id: "visit-log", kind: "select", target: "visit-log",
      title: "Write the visit record and the handover for home",
      cue: "Record the accommodations used, the transfer method, the position, the findings and what goes back to the caregiver.",
      why: "This record does two jobs. Clinically it carries the findings, the dry-mouth diagnosis and the plan; practically it carries what made the visit work — the quiet first slot, the two-person slide transfer, the part-reclined position, the stop signal — so the next appointment starts where this one finished instead of relearning it. The handover to the caregiver or the residential facility is the other half: what to watch for, what the kit is for, and when to come back.",
    },
  ],

  interrupts: [
    {
      id: "cough-and-pool",
      kind: "Airway event",
      after: "prop-hold", delay: 3, seconds: 13,
      alert: "The patient has started coughing hard and wetly — fluid has reached the back of the throat and they cannot clear it lying like this.",
      cue: "They are coughing on pooled fluid — get them up.",
      target: "chair-upright-lever",
      why: "A wet cough in a part-reclined patient with dysphagia means fluid is already where it should not be, and the first thing that helps is gravity: the chair comes up and the head turns so that what is in the throat can come forward rather than down. Suction follows; position comes first, because suction into a flat throat chases the problem instead of solving it.",
      missNote: "You stayed at the tooth through the coughing. Aspirated fluid in a patient who cannot clear it is how a routine check-up turns into an aspiration pneumonia admission a week later, and the link is rarely made.",
      wrongNote: "It is the chair. Bringing them upright and turning the head is what lets the fluid come forward — nothing on the bracket does that.",
    },
    {
      id: "distress-signal",
      kind: "Patient distress",
      after: "suction-track", delay: 3, seconds: 12,
      alert: "The patient's hand has come up and they are pressing back into the headrest, breathing fast — this is distress, not discomfort.",
      cue: "Their hand is up — they are asking you to stop.",
      target: "pause-card",
      why: "A raised hand is the stop signal this appointment agreed on, and answering it every single time is what makes it worth anything: the instruments come away, the pace drops, and the patient is asked what they need. In trauma-informed care the point is not gentleness in general but control — a patient who knows the signal works can tolerate far more than one who has learned it will be ignored.",
      missNote: "You carried on through the signal. The lesson the patient takes away is that their stop signal means nothing here, and the next appointment starts from a much worse place than this one did.",
      wrongNote: "The answer is the stop signal itself — acknowledge it and pause. Adjusting anything else while their hand is still up tells them you did not see it.",
    },
  ],

  supportLine: "Patient-handling strains are reportable injuries, not part of the job: your union's health and safety representative will arrange an assessment and a lift plan, and SEIU and UFCW both fund that training for clinic members.",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, SNG_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#dfe6ea", base2: "#d3dbe0", seam: "rgba(0,0,0,0.06)",
    }), { repeat: 4, px: 256 });

    // A quiet, matte floor panel marking the clear turning circle in this bay.
    const turnCircle = cyl(g, 1.6, 1.6, 0.012, 0, 0.007, 0.1, 0xdfe6ea, { rough: 0.7, seg: 40, cast: false });
    turnCircle.material = texturedMat(floorTex, { rough: 0.75, metal: 0.02, color: 0xffffff });

    // -------------------------------------------------------- the dental chair
    const chairBase = group(g, 0.55, 0, -1.15, -0.35);
    cyl(chairBase, 0.24, 0.28, 0.09, 0, 0.045, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    cyl(chairBase, 0.09, 0.1, 0.36, 0, 0.28, 0, SNG_STEEL, { rough: 0.35, metal: 0.75, seg: 16 });
    const seatGroup = group(chairBase, 0, 0.46, 0);
    slab(seatGroup, 0.62, 0.14, 0.66, 0, 0, 0.28, SNG_CHAIR, { radius: 0.07, rough: 0.6 });
    const chairBack = group(seatGroup, 0, 0.05, -0.22);
    slab(chairBack, 0.6, 0.9, 0.14, 0, 0.4, 0, SNG_CHAIR, { radius: 0.07, rough: 0.6 });
    chairBack.rotation.x = 0.34;
    const headrest = slab(chairBack, 0.34, 0.26, 0.11, 0, 0.98, 0.02, SNG_CHAIR, { radius: 0.06, rough: 0.6 });
    for (const sx of [-1, 1]) slab(seatGroup, 0.1, 0.06, 0.6, sx * 0.34, 0.09, 0.28, SNG_STEEL, { radius: 0.02, rough: 0.4, metal: 0.6 });
    // The patient, transferred across into the chair part-reclined.
    const patient = seatedFigure(seatGroup, 0, 0.08, 0.38, { skin: 0xd8b48c, cloth: 0x6f7f96 });
    patient.root.rotation.x = 0.34;
    patient.torso.rotation.x = -0.03;
    reg2(patient.head, "patient-face");
    const mouthProp = group(patient.head, 0.01, -0.015, 0.075);
    box(mouthProp, 0.016, 0.02, 0.016, 0, 0, 0, 0xe8a0b4, { rough: 0.7 });
    const propTether = cyl(mouthProp, 0.001, 0.001, 0.09, 0, -0.045, 0.01, 0xf2f5f7, { rough: 0.8, seg: 6 });
    reg2(mouthProp, "mouth-prop");
    const dryTongue = box(patient.head, 0.018, 0.004, 0.02, 0, -0.022, 0.07, 0xd88a8a, { rough: 0.8 });
    reg2(dryTongue, "dry-tongue");
    const rootCaries = ball(patient.head, 0.005, -0.02, -0.012, 0.072, 0x6b4a2a, { rough: 0.85 });
    reg2(rootCaries, "root-caries");

    // The chair controls: a graded recline control, an upright lever, and the
    // flat preset nobody should press on a dysphagic patient.
    const controlPad = group(chairBase, 0.33, 0.5, 0.18, -0.2);
    slab(controlPad, 0.16, 0.12, 0.05, 0, 0, 0, SNG_CABINET, { radius: 0.02, rough: 0.4, metal: 0.15 });
    const reclineControl = instrument(controlPad, 0, 0.02, 0.0, { w: 0.11, d: 0.11, idle: "--°", color: SNG_ACCENT, ry: 0 });
    reg2(reclineControl, "recline-control");
    const uprightLever = group(chairBase, 0.36, 0.52, -0.1, 0.2);
    cyl(uprightLever, 0.013, 0.013, 0.15, 0, 0, 0, 0x59c97b, { rough: 0.3, metal: 0.7, seg: 10 });
    ball(uprightLever, 0.022, 0, 0.085, 0, 0x59c97b, { rough: 0.45 });
    holoTag(uprightLever, "Sit up / head turn", 0, 0.14, 0, { css: "#59c97b", w: 0.4 });
    reg2(uprightLever, "chair-upright-lever");
    const flatPreset = group(chairBase, 0.36, 0.52, 0.34, -0.4);
    box(flatPreset, 0.06, 0.03, 0.05, 0, 0, 0, 0xf0645b, { rough: 0.5 });
    decal(flatPreset, 0.05, 0.02, 0, 0.017, 0, signFace("FLAT", { bg: "#5a1210", accent: "#ffd2ce", scale: 0.4 }), { px: 96 }).rotation.x = -Math.PI / 2;
    reg2(flatPreset, "full-recline-preset");

    // ---------------------------------------------------------- the wheelchair
    const wheelchair = group(g, -1.05, 0, 0.15, 0.6);
    slab(wheelchair, 0.44, 0.06, 0.42, 0, 0.48, 0, 0x3a4148, { radius: 0.03, rough: 0.6 });
    const wcBack = slab(wheelchair, 0.44, 0.44, 0.06, 0, 0.72, -0.2, 0x3a4148, { radius: 0.03, rough: 0.6 });
    void wcBack;
    for (const sx of [-1, 1]) {
      const wheel = torus(wheelchair, 0.16, 0.018, sx * 0.25, 0.3, 0, 0x22262b, { rough: 0.7, seg: 8, seg2: 22 });
      wheel.rotation.y = Math.PI / 2;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI;
        const spoke = cyl(wheelchair, 0.003, 0.003, 0.3, sx * 0.25, 0.3, 0, 0xb8c0c6, { rough: 0.4, metal: 0.7, seg: 6 });
        spoke.rotation.z = a; spoke.rotation.y = Math.PI / 2;
      }
      const caster = torus(wheelchair, 0.06, 0.012, sx * 0.17, 0.07, 0.26, 0x22262b, { rough: 0.7, seg: 6, seg2: 16 });
      caster.rotation.y = Math.PI / 2;
      slab(wheelchair, 0.07, 0.04, 0.24, sx * 0.24, 0.62, 0.12, 0x2f3740, { radius: 0.015, rough: 0.6 });
      cyl(wheelchair, 0.015, 0.015, 0.34, sx * 0.24, 0.3, 0.2, SNG_STEEL, { rough: 0.35, metal: 0.7, seg: 8 });
      box(wheelchair, 0.1, 0.02, 0.14, sx * 0.24, 0.12, 0.26, 0x2f3740, { rough: 0.6 });
    }
    const pushHandles = group(wheelchair, 0, 1.0, -0.22);
    for (const sx of [-1, 1]) {
      const handle = cyl(pushHandles, 0.016, 0.016, 0.12, sx * 0.2, 0, 0, 0x22262b, { rough: 0.8, seg: 10 });
      handle.rotation.x = Math.PI / 2;
      cyl(pushHandles, 0.012, 0.012, 0.22, sx * 0.2, -0.13, 0.02, SNG_STEEL, { rough: 0.35, metal: 0.7, seg: 8 });
    }
    holoTag(pushHandles, "Not a lifting point", 0, 0.12, 0, { css: "#f0645b", w: 0.42 });
    reg2(pushHandles, "wheelchair-push-handles");
    const brakeLevers = group(wheelchair, 0, 0.42, 0.05);
    for (const sx of [-1, 1]) {
      const lever = cyl(brakeLevers, 0.008, 0.008, 0.13, sx * 0.2, 0, 0, 0xf2c14b, { rough: 0.45, metal: 0.4, seg: 8 });
      lever.rotation.z = sx * 0.5;
    }
    reg2(brakeLevers, "wheel-brakes");
    const slideBoard = group(g, -0.45, 0, 0.75, 0.3);
    slab(slideBoard, 0.6, 0.02, 0.24, 0, 0.6, 0, 0xe8c98f, { radius: 0.06, rough: 0.35 });
    cyl(slideBoard, 0.03, 0.035, 0.6, 0, 0.3, 0, SNG_STEEL, { rough: 0.4, metal: 0.6, seg: 10 });
    holoTag(slideBoard, "Slide board", 0, 0.7, 0, { css: "#7fb4e8", w: 0.28 });
    reg2(slideBoard, "slide-board");
    const transferBelt = group(g, -0.2, 0, 1.05, -0.2);
    torus(transferBelt, 0.11, 0.016, 0, 0.92, 0, 0x4a7f8c, { rough: 0.7, seg: 8, seg2: 20 });
    box(transferBelt, 0.05, 0.03, 0.02, 0.11, 0.92, 0, 0xb8c0c6, { rough: 0.4, metal: 0.6 });
    cyl(transferBelt, 0.02, 0.024, 0.9, 0, 0.45, 0, SNG_STEEL, { rough: 0.4, metal: 0.6, seg: 10 });
    reg2(transferBelt, "transfer-belt");
    const countMark = group(g, -0.75, 0, -0.55, 0.4);
    box(countMark, 0.02, 0.16, 0.12, 0, 1.0, 0, 0xf2f5f7, { rough: 0.6 });
    cyl(countMark, 0.02, 0.024, 1.0, 0, 0.5, 0, SNG_STEEL, { rough: 0.4, metal: 0.6, seg: 10 });
    decal(countMark, 0.14, 0.1, 0.012, 1.0, 0,
      paperFace("ON THREE", ["Both staff ready", "Patient ready", "Move on the count"], { bg: "#eef4f8" }), { px: 224 }).rotation.y = Math.PI / 2;
    reg2(countMark, "transfer-count");

    // ---------------------------------------------------------- delivery side
    const unit = group(g, 1.55, 0, -0.35, -0.5);
    box(unit, 0.12, 0.1, 0.12, 0, 0.05, 0, 0x2b3138, { rough: 0.7, cast: false });
    cyl(unit, 0.06, 0.07, 1.05, 0, 0.57, 0, SNG_STEEL, { rough: 0.3, metal: 0.7, seg: 16 });
    const unitHead = group(unit, 0, 1.12, 0);
    slab(unitHead, 0.4, 0.26, 0.16, 0, 0, 0, SNG_CABINET, { radius: 0.02, rough: 0.4, metal: 0.15 });
    const suctionTip = group(unit, -0.16, 0.92, 0.12, 0.3);
    cyl(suctionTip, 0.011, 0.014, 0.2, 0, 0, 0, 0xdfe4e8, { rough: 0.3, seg: 12 });
    suctionTip.rotation.z = 0.4;
    hose(unit, [[-0.16, 0.92, 0.12], [-0.06, 0.78, 0.16], [0, 0.62, 0.1]], 0.012, 0x2b3138, { steps: 12, rough: 0.7 });
    reg2(suctionTip, "suction-tip");
    const suctionMist = particles(unit, 14, 0xcfe8f2, { size: 0.01, life: 0.35, additive: false, opacity: 0.45 });
    const propTray = group(unitHead, 0, 0.02, 0.1);
    box(propTray, 0.3, 0.02, 0.09, 0, 0, 0, 0x2f3740, { rough: 0.6 });
    const PROPS = [["S", -0.1, 0.012], ["M", 0, 0.016], ["L", 0.1, 0.02]];
    for (const [label, px, ph] of PROPS) {
      box(propTray, ph, ph, ph, px, 0.02, 0, 0xe8a0b4, { rough: 0.7 });
      decal(propTray, 0.03, 0.02, px, 0.012, 0.046, signFace(label, { bg: "#2f3740", accent: "#f2c14b", scale: 0.45 }), { px: 64 });
    }
    const untethered = box(propTray, 0.018, 0.018, 0.018, 0.14, 0.02, -0.03, 0xb85a74, { rough: 0.7 });
    holoTag(propTray, "One has no tether", 0, 0.1, 0, { css: "#f0a35b", w: 0.4 });
    void untethered;
    const dimmer = cyl(unitHead, 0.025, 0.025, 0.02, -0.15, 0.0, 0.09, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 16 });
    dimmer.rotation.x = Math.PI / 2;
    holoTag(unitHead, "Room dimmer", -0.15, 0.09, 0.09, { css: "#7fb4e8", w: 0.3 });
    reg2(dimmer, "light-dimmer");
    const mirrorTool = group(unitHead, 0.14, 0.02, 0.14, 0.3);
    cyl(mirrorTool, 0.026, 0.026, 0.004, 0, 0, 0, 0xdfe8ee, { rough: 0.1, metal: 0.85, seg: 16 });
    cyl(mirrorTool, 0.005, 0.005, 0.13, 0, -0.07, 0, SNG_STEEL, { rough: 0.2, metal: 0.9, seg: 8 });
    reg2(mirrorTool, "mirror-stick");

    // Ceiling task light and the flickering tube beside it.
    const taskLight = group(g, 0.55, 0, -1.15);
    cyl(taskLight, 0.02, 0.02, 0.9, -0.55, 1.98, 0, SNG_STEEL, { rough: 0.3, metal: 0.8, seg: 10 });
    cyl(taskLight, 0.016, 0.016, 0.55, -0.28, 2.06, 0, SNG_STEEL, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    const lampBody = group(taskLight, -0.04, 1.9, 0.04);
    cyl(lampBody, 0.15, 0.12, 0.07, 0, 0, 0, 0xe4ecef, { rough: 0.3, metal: 0.4, seg: 18 });
    const lampFace = cyl(lampBody, 0.12, 0.12, 0.01, 0, -0.04, 0, 0xfff6e0, { emissive: 0xfff6e0, ei: 1.3, rough: 0.2, seg: 18, cast: false });
    const flickerTube = group(g, -1.2, 0, -1.35, 0.2);
    box(flickerTube, 0.7, 0.06, 0.16, 0, 2.15, 0, 0xdfe4e8, { rough: 0.5 });
    const tubeGlow = box(flickerTube, 0.62, 0.02, 0.1, 0, 2.11, 0, 0xf8f8e8, { emissive: 0xf8f8e8, ei: 1.6, rough: 0.4, cast: false });
    holoTag(flickerTube, "Flickering", 0, 2.26, 0, { css: "#f0a35b", w: 0.28 });
    reg2(flickerTube, "flickering-light");

    // ------------------------------------------------------------- the counter
    const bayCounter = counter(g, 1.7, 0.5, -1.35, 1.35, 0xdfe4e8, { ry: 1.9 });
    const highOnly = decal(bayCounter, 0.24, 0.1, 0.5, 0.98, 0.0,
      paperFace("SIGN HERE", ["Counter height", "1.05 m"], { bg: "#eef2f4" }), { px: 224 });
    highOnly.rotation.x = -Math.PI / 2;
    holoTag(bayCounter, "Standing height only", 0.5, 1.12, 0, { css: "#f0a35b", w: 0.46 });
    reg2(highOnly, "high-only-counter");
    const xeroKit = group(bayCounter, -0.3, 0.98, 0.04);
    box(xeroKit, 0.2, 0.09, 0.14, 0, 0.045, 0, 0x4a8f9c, { rough: 0.5 });
    decal(xeroKit, 0.16, 0.05, 0, 0.09, 0, signFace("DRY MOUTH KIT", { bg: "#12484a", accent: "#8fe6d8", scale: 0.3 }), { px: 192 }).rotation.x = -Math.PI / 2;
    for (let i = 0; i < 3; i++) cyl(xeroKit, 0.016, 0.016, 0.07, -0.05 + i * 0.05, 0.12, 0, 0xdfe8ee, { rough: 0.25, opacity: 0.7, seg: 12 });
    reg2(xeroKit, "xero-kit");
    const alcoholRinse = group(bayCounter, 0.05, 0.98, 0.1);
    cyl(alcoholRinse, 0.035, 0.035, 0.16, 0, 0.08, 0, 0x3f8fd8, { rough: 0.25, opacity: 0.8, seg: 14 });
    cyl(alcoholRinse, 0.02, 0.02, 0.03, 0, 0.175, 0, 0xf2f5f7, { rough: 0.5, seg: 10 });
    holoTag(alcoholRinse, "Contains alcohol", 0, 0.24, 0, { css: "#f0645b", w: 0.4 });
    reg2(alcoholRinse, "alcohol-mouthrinse");
    const supplement = group(bayCounter, 0.22, 0.98, 0.02);
    cyl(supplement, 0.028, 0.028, 0.12, 0, 0.06, 0, 0xe8b4c8, { rough: 0.4, seg: 14 });
    cyl(supplement, 0.004, 0.004, 0.14, 0.02, 0.12, 0, 0xf2f5f7, { rough: 0.5, seg: 6 });
    holoTag(supplement, "Sweetened — sipped all day", 0, 0.2, 0, { css: "#f0645b", w: 0.5 });
    reg2(supplement, "sugary-supplement");

    // The caregiver's bag on a low chair, and the supply cart in the turning space.
    const lowChair = group(g, 1.35, 0, 1.15, -1.2);
    slab(lowChair, 0.4, 0.06, 0.4, 0, 0.44, 0, 0x6f7f96, { radius: 0.03, rough: 0.7 });
    slab(lowChair, 0.4, 0.4, 0.06, 0, 0.66, -0.17, 0x6f7f96, { radius: 0.03, rough: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(lowChair, 0.014, 0.014, 0.42, sx * 0.16, 0.21, sz * 0.16, SNG_STEEL, { rough: 0.4, metal: 0.6, seg: 8 });
    }
    const caregiverBag = group(lowChair, 0, 0.56, 0.02);
    slab(caregiverBag, 0.22, 0.16, 0.12, 0, 0, 0, 0x8c6a4a, { radius: 0.03, rough: 0.8 });
    torus(caregiverBag, 0.06, 0.008, 0, 0.1, 0, 0x6f5238, { rough: 0.8, seg: 6, seg2: 16 });
    reg2(caregiverBag, "caregiver-bag");
    const supplyCart = group(g, -0.15, 0, 0.55, 0.2);
    for (const y of [0.3, 0.56, 0.82]) slab(supplyCart, 0.44, 0.026, 0.34, 0, y, 0, 0x8c949c, { radius: 0.015, rough: 0.45, metal: 0.3 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(supplyCart, 0.012, 0.012, 0.82, sx * 0.2, 0.42, sz * 0.15, 0x8d959d, { rough: 0.3, metal: 0.85, seg: 8 });
      const castor = cyl(supplyCart, 0.03, 0.03, 0.016, sx * 0.2, 0.03, sz * 0.15, 0x16191d, { rough: 0.8, seg: 10 });
      castor.rotation.z = Math.PI / 2;
    }
    for (let i = 0; i < 3; i++) box(supplyCart, 0.14, 0.05, 0.1, -0.12 + i * 0.13, 0.86, 0, 0xdfe8ee, { rough: 0.5 });
    holoTag(supplyCart, "Parked in the turning space", 0, 1.0, 0, { css: "#f0a35b", w: 0.52 });
    reg2(supplyCart, "cart-in-turning-space");

    // The agreed stop signal, on a stand where the patient can see it.
    const pauseStand = group(g, 0.95, 0, 0.55, -0.8);
    cyl(pauseStand, 0.02, 0.024, 1.05, 0, 0.52, 0, SNG_STEEL, { rough: 0.4, metal: 0.6, seg: 10 });
    const pauseCard = box(pauseStand, 0.2, 0.15, 0.015, 0, 1.06, 0, 0xf2c14b, { rough: 0.5 });
    decal(pauseCard, 0.17, 0.12, 0, 0, 0.01, paperFace("STOP", ["Hand up = stop", "We stop every time"], { bg: "#fff3d6" }), { px: 224 });
    reg2(pauseCard, "pause-card");

    // ---------------------------------------------------------- wall paperwork
    const carePlan = holoPanel(g, 0.58, 0.42, -2.25, 1.5, -0.45, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,18,28,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fb4e8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d8e8f8";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CARE PLAN — SUPPORTED VISIT", w * 0.06, h * 0.15);
      ctx.fillStyle = "#eef6fd";
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Arrives: own wheelchair", "Transfer: board, two staff", "Communication: short sentences",
        "Stop signal: hand up", "Dysphagia: yes, thickened fluids", "First slot requested"]
        .forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.32 + i * h * 0.12));
    }, { ry: 0.45, accent: SNG_ACCENT });
    reg2(carePlan, "care-plan-board");

    const medList = holoPanel(g, 0.5, 0.4, 2.3, 1.48, 0.55, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,14,24,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c89ae0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eddcf6";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("MEDICATION LIST", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Anticoagulant: yes", "Antiresorptive: yes", "Diuretic: yes", "Antidepressant: yes",
        "Inhaler: twice daily", "Dry mouth: expected"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.32 + i * h * 0.115));
    }, { ry: -0.9, accent: 0xc89ae0 });
    reg2(medList, "med-list");

    const teamBoard = holoPanel(g, 0.46, 0.3, -1.6, 1.84, 1.75, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,20,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dcf6e4";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("TRANSFER DEBRIEF", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Loads · near misses · equipment", w / 2, h * 0.66);
    }, { ry: 0.3, accent: 0x59c97b });
    reg2(teamBoard, "team-checkin");

    const visitLog = holoPanel(g, 0.54, 0.36, 1.45, 1.8, 1.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,18,26,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fb4e8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d8e8f8";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("VISIT RECORD", w / 2, h * 0.24);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Accommodations · transfer · position", w / 2, h * 0.52);
      ctx.fillText("Findings · kit · handover", w / 2, h * 0.72);
    }, { ry: -0.3, accent: SNG_ACCENT });
    reg2(visitLog, "visit-log");

    // ------------------------------------------------------------- furniture
    cabinet(g, 0.95, 0.5, 0.3, -1.95, 1.7, -1.55, SNG_CABINET, { doorColor: 0xd6dee2 });
    const stockCab = equipmentCabinet(g, 0.8, 0.9, 0.44, 2.35, -0.95, { ry: -0.8, color: SNG_CABINET, doorColor: SNG_CABINET, rough: 0.45, metal: 0.08, weathered: false, lines: ["CLINIC", "STOCK"] });
    void stockCab;
    const opStool = group(g, 1.55, 0, -1.55, -0.4);
    cyl(opStool, 0.19, 0.2, 0.05, 0, 0.03, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(opStool, 0.03, 0.035, 0.5, 0, 0.29, 0, SNG_STEEL, { rough: 0.3, metal: 0.8, seg: 12 });
    slab(opStool, 0.36, 0.09, 0.34, 0, 0.58, 0, 0x3f6f7c, { radius: 0.1, rough: 0.65 });
    const handRail = group(g, -2.3, 0, 0.9, 0.5);
    cyl(handRail, 0.022, 0.022, 1.2, 0, 0.9, 0, SNG_WARM, { rough: 0.5, metal: 0.3, seg: 12 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(handRail, 0.016, 0.016, 0.1, sx * 0.55, 0.85, 0, SNG_STEEL, { rough: 0.4, metal: 0.7, seg: 8 });

    standingFigure(g, -2.5, 0.3, { ry: 1.5, cloth: 0x8c6a4a, skin: 0xa8784f });
    standingFigure(g, 2.2, 1.45, { ry: -2.3, cloth: 0x4a7f8c });

    const key = new THREE.DirectionalLight(0xf6fbff, 0.8);
    key.position.set(-2.0, 4.6, 3.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xeef6fc, 0x48505a, 0.92));

    let dimmed = false;
    let flickering = true;
    let clearing = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0.3, 1.1, -0.8),

      onStepComplete(step) {
        if (step.id === "transfer-order") {
          brakeLevers.rotation.z = 0.4;
          slideBoard.rotation.z = 0.08;
        }
        if (step.id === "position-set") {
          repaint(reclineControl.userData.screen, signFace("42°", { bg: "#0c1e2a", accent: "#59c97b", fg: "#d6ecfa", scale: 0.55 }));
        }
        if (step.id === "dim-light") {
          dimmed = true;
          tubeGlow.material = mat(0x5a6b74, { emissive: 0x5a6b74, ei: 0.3, rough: 0.4 });
          flickering = false;
        }
        if (step.id === "prop-choice") mouthProp.rotation.z = 0.15;
        if (step.id === "suction-track") clearing = true;
        if (step.id === "xero-signs") {
          dryTongue.material = mat(0xf0a35b, { emissive: 0xf0a35b, ei: 0.6, rough: 0.7 });
          rootCaries.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.7, rough: 0.8 });
        }
        if (step.id === "xero-handover") { xeroKit.position.set(0, 0.62, 0.06); lowChair.add(xeroKit); }
        if (step.id === "visit-log") {
          repaint(visitLog.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(10,28,22,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcf6e4";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("RECORD SIGNED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("Handover written for home", w / 2, h * 0.68);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "cough-and-pool") {
          patient.head.rotation.x = 0.3;
          patient.torso.rotation.x = 0.14;
          headrest.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.5, rough: 0.6 });
        }
        if (it.id === "distress-signal") {
          patient.torso.rotation.x = -0.18;
          pauseCard.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.5 });
          pauseCard.rotation.z = 0.25;
        }
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cough-and-pool") {
          chairBack.rotation.x = 0.16;
          patient.head.rotation.x = 0.06;
          patient.head.rotation.y = 0.3;
          patient.torso.rotation.x = -0.03;
          headrest.material = mat(SNG_CHAIR, { radius: 0.06, rough: 0.6 });
        }
        if (it.id === "distress-signal") {
          patient.torso.rotation.x = -0.03;
          pauseCard.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.5 });
          pauseCard.rotation.z = 0;
          suctionTip.rotation.z = 0.9;
        }
      },

      animate(t, dt, session) {
        patient.head.rotation.y = 0.04 + Math.sin(t * 0.28) * 0.03;
        patient.torso.position.y = Math.sin(t * 0.85) * 0.003;
        lampFace.material.emissiveIntensity = dimmed ? 1.5 : 1.25 + Math.sin(t * 0.8) * 0.05;
        if (flickering) {
          const f = Math.sin(t * 17) > 0.72 ? 0.35 : 1.7;
          tubeGlow.material.emissiveIntensity = f;
        }
        if (clearing && session?.step?.id === "suction-track" && session.holding) {
          suctionMist.visible = true;
          suctionMist.userData.step(dt, new THREE.Vector3(-0.16, 0.9, 0.12), 0.02, 0.2, -0.8);
        } else if (suctionMist.visible) suctionMist.visible = false;

        if (session?.turn && session.step?.id === "dim-light") {
          dimmer.rotation.y = session.turn.amount * Math.PI * 2;
          tubeGlow.material.emissiveIntensity = Math.max(0.3, 1.6 - session.turn.amount * 2.4);
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "position-set") {
          repaint(reclineControl.userData.screen, signFace(`${Math.round(20 + gg.t * 45)}°`, {
            bg: "#0c1e2a", accent: gg.t >= 0.36 && gg.t <= 0.6 ? "#59c97b" : "#f0645b", fg: "#d6ecfa", scale: 0.55,
          }));
          chairBack.rotation.x = 0.16 + gg.t * 0.5;
        }
        const tr = session?.track;
        if (tr && session.step?.id === "suction-track") {
          const good = tr.v >= 0.34 && tr.v <= 0.58;
          suctionTip.rotation.z = 0.4 - tr.v * 0.2;
          suctionTip.children[0].material = mat(good ? 0xcfe8f2 : 0xf0b8b0, { rough: 0.3 });
        }
      },
    };
  },
};
