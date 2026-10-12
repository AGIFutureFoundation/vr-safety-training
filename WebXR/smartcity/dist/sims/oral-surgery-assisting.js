import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  particles, seatedFigure, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, cylinderTank, standingFigure, instrument,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Oral Surgery Assisting VR — Dental & Oral Health.
//
// A surgical extraction under intravenous sedation, assisted from the far
// side of the chair: the time-out worked before anything is opened, surgical
// hand antisepsis and a draped field, suction and retraction held where the
// surgeon can actually see, the sedation monitor read back out loud instead
// of glanced at, the specimen labelled at the chair, the sharps counted and
// contained, and the post-operative instructions given in writing to somebody
// who will not remember being told.
//
// The credential named is DANB's Certified Oral and Maxillofacial Surgery
// Assistant, and the anaesthesia-monitoring side of the role is AAOMS's own
// Dental Anesthesia Assistant National Certification Examination. Which of
// these duties an assistant may perform, and under what supervision, is set
// by the state dental practice act's allowable-duties list — this station
// asks the learner to read theirs rather than asserting one.

const ORSURG_ACCENT = 0x7fc9b6;
const ORSURG_CSS = "#7fc9b6";
const ORSURG_STEEL = 0xb6c0c8;
const ORSURG_DRAPE = 0x4f7f8f;
const ORSURG_CABINET = 0xdfe6ea;
const ORSURG_BLOOD = 0x8f2430;

export const SIM_ORAL_SURGERY_ASSISTING = {
  id: "oral-surgery-assisting",
  index: "213",
  domain: "Dental & Oral Health",
  trade: "Oral and maxillofacial surgery assistant",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "DANB's Certified Oral and Maxillofacial Surgery Assistant (COMSA) credential, and AAOMS's Dental Anesthesia Assistant National Certification Examination (DAANCE) for the monitoring role; the American Association of Oral and Maxillofacial Surgeons' office anesthesia guidance and its office anesthesia evaluation; the state dental practice act's allowable-duties list for surgical and anesthesia assistants; the American Dental Assistants Association (ADAA) as the profession's body; the CDC's Guidelines for Infection Control in Dental Health-Care Settings and its 2016 Summary for surgical asepsis; OSHA 29 CFR 1910.1030 bloodborne pathogens, including its sharps and specimen-labelling provisions; HIPAA's Privacy Rule for the operative record; SEIU and UFCW as the unions representing clinic staff in organised practices",
  name: "Oral Surgery Assisting",
  title: simTitle("Oral Surgery Assisting"),
  tagline: "Time-out, surgical asepsis and draping, suction and retraction, a sedation readback, specimen and sharps handling, and post-op instructions that survive the sedation",
  accent: ORSURG_ACCENT,
  accentCss: ORSURG_CSS,
  parSeconds: 290,
  footprint: 2.3,
  badge: { id: "field-held", name: "Field Held", note: "A sedated surgical extraction assisted with the field sterile, the airway watched and every sharp accounted for" },

  game: system({
    name: "Surgical Assisting",
    currency: "SUTURE",
    ranks: ["Surgical Trainee", "Surgery Assistant", "Lead Surgical Assistant", "Anesthesia Assistant", "Certified Surgery Assistant"],
    badges: [
      { id: "read-it-back", name: "Read It Back", note: "Vital signs read back inside the band the record actually supports", test: AWARD.precise(0.7) },
      { id: "sterile-throughout", name: "Sterile Throughout", note: "No unsafe action anywhere in the case", test: AWARD.safe },
      { id: "counted-out", name: "Counted Out", note: "Every sharp on the field accounted for before the drape came off", test: AWARD.stepClean("sharps-count") },
    ],
    challenges: [
      { id: "clean-case", name: "Clean Case", note: "No corrections anywhere in the case", test: AWARD.clean },
      { id: "never-let-go", name: "Never Let Go", note: "Every timed hold carried to full duration first time", test: AWARD.unbroken },
      { id: "on-schedule", name: "On Schedule", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-blade": "That scalpel blade is loose on the drape instead of in the neutral zone. On a surgical field nobody hands a blade hand-to-hand and nobody leaves one lying where an elbow finds it — it goes into the designated neutral zone every single time, which is the one engineering control that makes a sharp on a crowded field survivable.",
    "unlabelled-specimen": "That specimen container has no patient label on it at all. A specimen labelled later, at the bench, from memory, is a specimen whose identity rests on somebody's recollection of a busy afternoon — OSHA's bloodborne pathogens standard requires the biohazard label, and the pathology answer is worthless attached to the wrong name.",
    "reused-suction-tip": "That surgical suction tip is from the previous case and went back into the tray. A surgical tip that has been inside one patient's socket is single-use or it is reprocessed through sterilisation — nothing in between, and nothing about a rinsed tip tells you which of the two happened to it.",
    "ringing-phone": "You reached for the ringing phone with a sedated patient on the chair. A patient under intravenous sedation is monitored continuously by somebody whose only job is that, because the airway obstruction and the respiratory depression this monitoring exists to catch develop inside the minute nobody was looking at the chest rise.",
  },

  lateNotes: {
    "gauze-pack": "Not yet. Pressure goes on a socket the surgeon has finished with — packing over an open field while instruments are still working in it achieves nothing except getting in the way.",
    "instruction-sheet": "Hold off. The instructions are given when the patient is awake enough to be given anything, and after the socket has stopped needing your hands.",
    "anesthesia-record": "The case is not finished. The record is written from what actually happened, at the end, not filled in ahead of the events it is supposed to document.",
  },

  steps: [
    {
      id: "surgical-timeout", kind: "find", noHint: true,
      targets: ["consent-form", "site-radiograph", "allergy-alert"],
      itemNames: {
        "consent-form": "the signed surgical consent",
        "site-radiograph": "the radiograph showing the tooth",
        "allergy-alert": "the allergy alert on the chart",
      },
      itemNotes: {
        "consent-form": "The consent names the procedure, the tooth and the anaesthesia plan, and it is signed before sedation begins rather than during it — a sedated patient cannot consent to anything, which is precisely why the signature has to already be there.",
        "site-radiograph": "The radiograph is what turns 'the lower left wisdom tooth' into a specific root anatomy next to a specific nerve. Wrong-site extraction is the error a time-out exists to prevent, and the image on the screen is what the time-out checks the consent against.",
        "allergy-alert": "The allergy alert decides which local anaesthetic, which antibiotic and which analgesic leave this room with the patient. Finding it after the injection is finding it too late, and the chart flag is deliberately the loudest thing on the record.",
      },
      title: "Work the surgical time-out",
      cue: "Before anything is opened: consent, the right tooth on the radiograph, and the allergy flag.",
      why: "A time-out is a deliberate stop with everybody's hands still, because every part of it is cheap now and expensive later: a wrong-site extraction is permanent, a consent signed after sedation is not a consent, and an allergy found after the injection is an emergency instead of a note. AAOMS's office anaesthesia guidance builds the whole case on this happening before the first thing is unwrapped.",
    },
    {
      id: "hand-antisepsis", kind: "hold", target: "scrub-sink", seconds: 7,
      title: "Surgical hand antisepsis",
      cue: "Hold the surgical scrub for the full time the product's own instructions set before you gown.",
      why: "This is not the hand hygiene between routine patients — a surgical extraction breaks mucosa and bone, so the CDC's dental guidance calls for surgical hand antisepsis with an agent held for the time its own label states, and that time is longer than anyone's instinct. Cutting it short leaves resident flora on hands that are about to be inside an open socket, and nothing about clean-looking hands distinguishes the two.",
      holdBreakNote: "You broke the scrub early. The label's contact time is the tested time; hands that got half of it are not surgically clean, and they are about to go into sterile gloves that will be trusted completely.",
    },
    {
      id: "gown-drape", kind: "sequence",
      targets: ["sterile-gown", "sterile-gloves", "patient-drape"],
      itemNames: { "sterile-gown": "sterile gown", "sterile-gloves": "sterile gloves", "patient-drape": "patient drape" },
      title: "Gown, glove and drape the field",
      cue: "Gown first, then sterile gloves, then drape the patient — and keep your hands above the waist after that.",
      why: "The order is what keeps the sterile surfaces sterile: gloves go on over a gowned wrist so the cuff is covered, and the patient is draped by hands that are already sterile rather than the reverse. Draping first and gloving afterwards puts bare hands over the field that everything else in this case depends on being clean.",
      outOfOrderNote: "Out of order. Gown, then gloves over the gown cuff, then the drape placed by sterile hands — reversing any two of those contaminates the thing you did first.",
    },
    {
      id: "surgical-tray", kind: "sequence", anyOrder: true,
      targets: ["surgical-elevator", "extraction-forceps", "periosteal-elevator", "surgical-curette"],
      itemNames: {
        "surgical-elevator": "straight elevator",
        "extraction-forceps": "extraction forceps",
        "periosteal-elevator": "periosteal elevator",
        "surgical-curette": "surgical curette",
      },
      title: "Set the extraction tray",
      cue: "Periosteal elevator, straight elevator, forceps and curette laid out where the surgeon's hand will land.",
      why: "The extraction sequence is reflect, luxate, deliver, debride, and the tray is laid out so each of those is a hand movement rather than a search. An instrument that has to be asked for twice is a socket held open longer, more bleeding to manage and a sedated patient spending more time under than the plan allowed for.",
    },
    {
      id: "sedation-readback", kind: "gauge", target: "vitals-monitor",
      title: "Read the sedation monitor back out loud",
      cue: "Read the oxygen saturation, the pulse and the blood pressure off the monitor and commit the number you are calling.",
      why: "A readback is said out loud, to the surgeon, in numbers, because a monitor glanced at silently means nobody else in the room knows what it said and there is no record of when it said it. AAOMS's office anaesthesia guidance puts continuous monitoring with documented vital signs at the centre of office sedation, and the assistant calling the number is how the surgeon — whose hands and eyes are in the mouth — actually finds out.",
      gauge: {
        label: "OXYGEN SATURATION", speed: 0.52, green: [0.46, 0.66],
        readout: (t) => `SpO2 ${Math.round(88 + t * 12)}%`,
        missNote: "That is not what the monitor is showing. A readback that rounds toward the number you expected is worse than no readback, because now the record says somebody checked.",
      },
    },
    {
      id: "suction-position", kind: "track", target: "surgical-suction", seconds: 8,
      title: "Hold suction where the surgeon can see",
      cue: "Keep the tip clearing the field without lifting the flap or blocking the view — steady.",
      why: "Suction on a surgical field is a visibility tool before it is a fluid tool: too shallow and blood pools over the bone the surgeon is cutting, too deep and the tip strips the clot off the socket wall or catches the flap and tears it. Holding it in the narrow band between those two, for as long as the bur is running, is most of what an assistant actually contributes to the speed of a case.",
      track: {
        start: 0.14, green: [0.38, 0.62], rise: 0.52, fall: 0.44, drift: 0.14, label: "FIELD VISIBILITY",
        readout: (v) => (v < 0.38 ? "field flooding — field lost" : v > 0.62 ? "too deep — stripping the socket" : "field clear"),
      },
      holdBreakNote: "Suction drifted out of band. A flooded field means the surgeon is cutting where they cannot see; a tip driven into the socket takes the clot with it when it comes out.",
    },
    {
      id: "flap-retract", kind: "hold", target: "tissue-retractor", seconds: 7,
      title: "Hold the flap retracted",
      cue: "Hold the retractor steady against bone — no pressure on the flap edge, and do not let it drift.",
      why: "A retractor rests on bone and holds soft tissue out of the way; one that slips onto the flap margin crushes exactly the tissue that has to heal over this socket, and one that drifts mid-cut puts a rotating bur next to a cheek. Holding it still for minutes at a time is unglamorous and it is the difference between a socket that heals over in a week and one that breaks down.",
      holdBreakNote: "You let the retractor go before the surgeon was out. A flap that falls back into the field while a bur is turning is how a soft-tissue injury happens in an otherwise routine extraction.",
    },
    {
      id: "specimen-jar", kind: "drag", target: "extracted-tooth",
      title: "Label the specimen at the chair",
      cue: "Put the delivered tooth straight into the labelled container — patient, site and date, written here.",
      why: "A specimen is labelled at the chair, by the person who watched it come out, because every step it travels unlabelled is a step where it becomes indistinguishable from the next one. OSHA's bloodborne pathogens standard requires the biohazard label on the container, and the pathology report on a mislabelled specimen is a confident answer about the wrong person.",
      drag: { to: "specimen-container", radius: 0.34, missNote: "Not in the container. A specimen set down on a drape to be dealt with later is a specimen whose identity now depends on what somebody remembers." },
    },
    {
      id: "sharps-count", kind: "find", noHint: true,
      targets: ["scalpel-tally", "needle-tally", "suture-tally"],
      itemNames: {
        "scalpel-tally": "the scalpel blade on the count",
        "needle-tally": "the anaesthetic needle on the count",
        "suture-tally": "the suture needle on the count",
      },
      itemNotes: {
        "scalpel-tally": "The blade is counted off the field and into the sharps container while the drape is still down. A blade found afterwards, in a bundle of drapes on its way to the laundry, is a needlestick waiting for whoever unfolds it.",
        "needle-tally": "The local anaesthetic needle is a safety-shielded device and it is activated one-handed and discarded here, at the chair. Two-handed recapping across a surgical field is how an assistant's own thumb ends up in the exposure log.",
        "suture-tally": "The suture needle is the one that gets lost, because it is small, curved and the same colour as everything around it. Counting it off the field is the only thing standing between it and the inside of a glove.",
      },
      title: "Count the sharps off the field",
      cue: "Three sharps went onto this field. Find all three and account for them before the drape moves.",
      why: "A sharps count happens with the drape still in place, because a sharp that is unaccounted for is either in the drapes, in the waste, in the patient or in somebody's hand, and the only one of those four that is discoverable later is the one nobody wants. OSHA's bloodborne pathogens standard is what puts the container at the point of use; the count is what decides whether everything actually reached it.",
    },
    {
      id: "o2-titrate", kind: "turn", target: "o2-flowmeter",
      title: "Set supplemental oxygen to the prescribed flow",
      cue: "Turn the flowmeter to the litres per minute the anaesthesia plan sets for this patient.",
      why: "Supplemental oxygen through a nasal cannula is the standing margin under an office sedation, and it is set to a specific flow on the plan rather than turned to whatever looks generous. The flowmeter is also the thing that tells you the cylinder is actually delivering — a plan that assumes oxygen and a regulator that is closed look identical from where the assistant is standing until it matters.",
      turn: { turns: 1, axis: "y", label: "O2 FLOW" },
    },
    {
      id: "hemostasis-hold", kind: "hold", target: "gauze-pack", seconds: 8,
      title: "Hold firm pressure on the socket",
      cue: "Firm, continuous pressure on folded gauze over the socket — no peeking to see how it is doing.",
      why: "A clot forms under continuous pressure and is pulled straight back off by anyone who lifts the gauze to check, which is why the instruction is a span of minutes rather than a look. This is also the period in which a bleed that is not going to stop announces itself, and the assistant holding the pressure is the person placed to notice the gauze soaking through faster than it should.",
      holdBreakNote: "You lifted the pack early. Every check takes the forming clot with it, and the socket starts again from nothing — the hold is long precisely because it cannot be sampled.",
    },
    {
      id: "postop-sheet", kind: "drag", target: "instruction-sheet",
      title: "Give the post-operative instructions in writing",
      cue: "Put the written instructions in the escort's hands and say the first three out loud as well.",
      why: "A patient who has been under intravenous sedation will not reliably remember being told anything, which is why the instructions go to the escort in writing as well as being said: what to do about bleeding, what not to do to the clot, which analgesic and when, and the number to ring tonight. The sheet is also the record that the warning about a dry socket was actually given rather than intended.",
      drag: { to: "escort-hand", radius: 0.36, missNote: "Not handed over. Instructions left on the counter beside a sedated patient are instructions nobody will read, and the call at ten tonight will be about the part that was on them." },
    },
    {
      id: "surgical-log", kind: "select", target: "anesthesia-record",
      title: "Complete the anaesthesia and operative record",
      cue: "Write the vital signs at their timepoints, the drugs and doses, the specimen, the sharps count and the discharge criteria.",
      why: "The anaesthesia record is the timeline of this sedation — what was given, when, and what the patient's numbers were doing at each point — and it is written from the case rather than reconstructed from it. AAOMS's office anaesthesia evaluation reads exactly this record, and it is also the only document that can answer, months later, whether the response to a desaturation was as quick as everybody remembers.",
    },
    {
      id: "team-debrief", kind: "select", target: "debrief-board",
      title: "Debrief the team before the room is turned over",
      cue: "Name what nearly went wrong, confirm the recovery handover, and ask the other assistant how they are doing.",
      why: "A case with a desaturation in it does not end when the patient sits up: the next room runs better if what happened is said out loud while everyone still remembers it, and the assistant who was holding retraction when the alarm sounded is carrying that whether or not anybody asks. A debrief that only covers equipment is a debrief that has decided the people in the room are not part of the system.",
    },
  ],

  interrupts: [
    {
      id: "spo2-drop",
      kind: "Desaturation",
      after: "suction-position", delay: 4, seconds: 12,
      alert: "The monitor is alarming — oxygen saturation has fallen into the eighties and the chest rise has gone shallow.",
      cue: "Open the airway. Chin lift, now — before anything else.",
      target: "chin-lift",
      why: "The commonest cause of desaturation under office sedation is an obstructed airway from a tongue that has fallen back, and the first response is a manoeuvre rather than a dial: head tilt and chin lift, then look at whether the saturation follows. AAOMS's office anaesthesia guidance sequences it that way because oxygen turned up into an obstructed airway reaches nothing.",
      missNote: "The saturation kept falling while the case carried on. A patient who obstructs under sedation does not recover on their own, and every additional minute of hypoxia is spent somewhere the assistant could have ended in about two seconds with one hand.",
      wrongNote: "It is the airway. A chin lift comes before the flowmeter, before suction and before the record — oxygen cannot get past an obstruction, however much of it you turn on.",
    },
    {
      id: "bleeding-not-controlled",
      kind: "Uncontrolled bleeding",
      after: "hemostasis-hold", delay: 3, seconds: 13,
      alert: "The gauze has soaked through and blood is welling up out of the socket faster than pressure is holding it.",
      cue: "This one needs more than gauze — get the haemostatic agent into the socket.",
      target: "hemostatic-agent",
      why: "Pressure alone stops most sockets and does not stop all of them, and a socket that is still welling through a soaked pack needs a local haemostatic placed in it before pressure is reapplied. Repacking the same way harder is choosing to test the same thing that already failed, on a patient whose sedation is wearing off.",
      missNote: "The socket kept bleeding through repeated packs. A patient discharged on a bleed that was never actually controlled is the patient ringing at midnight, and the escalation available now — a haemostatic in the socket, sutures, the surgeon's hands back in the field — is not available from a car park.",
      wrongNote: "It is the haemostatic agent. Gauze has already had its turn; a socket still welling through a soaked pack needs something placed in it, not the same pressure applied again.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, ORSURG_ACCENT);

    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#eef3f4", base2: "#e2e9ea", seam: "rgba(0,0,0,0.07)",
    }), { repeat: 3, px: 256 });
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#c6d1d3", base2: "#bcc7ca", seam: "rgba(0,0,0,0.1)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.4, 0.008, 5.4, 0, 0.002, 0, 0xffffff, { radius: 0.06, rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.85, metal: 0.03, color: 0xffffff });

    // ------------------------------------------------------------ surgical chair
    const chair = group(g, 0, 0, -0.95, 0.1);
    slab(chair, 0.62, 0.14, 1.5, 0, 0.55, 0, 0x3b4d5a, { radius: 0.07, rough: 0.6 });
    const chairBack = slab(chair, 0.58, 0.9, 0.6, 0, 0.9, -0.56, 0x3b4d5a, { radius: 0.07, rough: 0.6 });
    chairBack.rotation.x = -1.05;
    const headrest = ball(chair, 0.13, 0, 1.08, -1.02, 0x3b4d5a, { rough: 0.6, seg: 14 });
    headrest.scale.set(1.5, 0.66, 1.1);
    cyl(chair, 0.055, 0.08, 0.72, 0, 0.26, 0, CITY.darkSteel, { rough: 0.3, metal: 0.85, seg: 14 });
    cyl(chair, 0.24, 0.28, 0.07, 0, 0.035, 0, 0x2d333a, { rough: 0.45, metal: 0.5, seg: 18 });
    slab(chair, 0.68, 0.05, 0.9, 0, 0.6, 0.02, 0x2f3d49, { radius: 0.04, rough: 0.45, metal: 0.3 });
    slab(chair, 0.08, 0.05, 0.46, 0.32, 0.68, 0.12, 0x2f3d49, { radius: 0.02, rough: 0.5 });
    slab(chair, 0.08, 0.05, 0.46, -0.32, 0.68, 0.12, 0x2f3d49, { radius: 0.02, rough: 0.5 });

    const patient = seatedFigure(chair, 0, 0.62, -0.42, { skin: 0xb5804f, cloth: 0xdfe8ec, seed: 5 });
    patient.root.rotation.x = -0.6;

    // The sterile drape over the patient's chest, and the marker that stands
    // for placing it.
    const patientDrape = slab(chair, 0.46, 0.012, 0.62, 0, 0.78, -0.16, ORSURG_DRAPE, { radius: 0.03, rough: 0.8 });
    patientDrape.rotation.x = -0.42;
    holoTag(chair, "Patient drape", 0, 0.98, 0.1, { css: ORSURG_CSS, w: 0.36 });
    reg(hits, patientDrape, "patient-drape");

    // The surgical field at the mouth: a socket, a flap edge and somewhere for
    // the blood, the pack and the haemostatic to live.
    const field = group(chair, 0, 1.06, -0.9);
    const arch = torus(field, 0.055, 0.008, 0, 0, 0, 0xf0e3d6, { rough: 0.5, seg: 8, seg2: 22 });
    arch.rotation.x = Math.PI / 2;
    const socket = cyl(field, 0.011, 0.009, 0.014, 0.046, 0.002, 0.03, 0x7a4a45, { rough: 0.7, seg: 10 });
    const flapEdge = box(field, 0.024, 0.004, 0.016, 0.034, 0.006, 0.042, 0xe0928f, { rough: 0.7 });
    flapEdge.rotation.y = 0.5;
    const bleed = ball(field, 0.012, 0.046, 0.006, 0.03, ORSURG_BLOOD, { emissive: ORSURG_BLOOD, ei: 0.2, rough: 0.35, seg: 10 });
    ownMaterial(bleed);
    bleed.visible = false;
    void socket;

    const gauzePack = group(field, 0.046, 0.012, 0.03);
    box(gauzePack, 0.024, 0.008, 0.02, 0, 0, 0, 0xf6f3ea, { rough: 0.95 });
    box(gauzePack, 0.02, 0.006, 0.016, 0.002, 0.007, 0.002, 0xeeeade, { rough: 0.95 });
    holoTag(gauzePack, "Gauze pack", 0.03, 0.06, 0, { css: ORSURG_CSS, w: 0.32 });
    reg(hits, gauzePack, "gauze-pack");

    const hemostatic = group(g, 1.06, 0.98, 0.46, -0.3);
    box(hemostatic, 0.07, 0.03, 0.05, 0, 0, 0, 0xf2ead6, { rough: 0.9 });
    box(hemostatic, 0.05, 0.012, 0.035, 0, 0.02, 0, 0xfdf8e8, { rough: 0.9 });
    decal(hemostatic, 0.06, 0.02, 0, 0.032, 0.001, signFace("HAEMOSTAT", { bg: "#fdf8e8", accent: "#a8302c", scale: 0.42 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(hemostatic, "Haemostatic agent", 0, 0.1, 0, { css: ORSURG_CSS, w: 0.46 });
    reg(hits, hemostatic, "hemostatic-agent");

    // The airway manoeuvre: a marker at the chin, which moves the head when the
    // desaturation is answered.
    const chinLift = box(field, 0.05, 0.03, 0.04, 0, -0.05, 0.05, 0x8fd6c9, { emissive: 0x8fd6c9, ei: 0.12, rough: 0.4, opacity: 0.35, transparent: true });
    holoTag(field, "Chin lift", 0, -0.1, 0.06, { css: ORSURG_CSS, w: 0.28 });
    reg(hits, chinLift, "chin-lift");

    const extractedTooth = group(g, -0.5, 0.99, 0.12, 0.4);
    cyl(extractedTooth, 0.009, 0.007, 0.018, 0, 0.012, 0, 0xf4ecdc, { rough: 0.45, seg: 10 });
    cyl(extractedTooth, 0.004, 0.002, 0.016, 0.003, -0.004, 0, 0xe4d6bc, { rough: 0.5, seg: 8 }).rotation.z = 0.3;
    cyl(extractedTooth, 0.004, 0.002, 0.016, -0.003, -0.004, 0, 0xe4d6bc, { rough: 0.5, seg: 8 }).rotation.z = -0.3;
    holoTag(extractedTooth, "Delivered tooth", 0, 0.07, 0, { css: ORSURG_CSS, w: 0.42 });
    reg(hits, extractedTooth, "extracted-tooth");

    // ------------------------------------------------------- monitor and oxygen
    const monitorStand = group(g, 1.5, 0, -1.6, -0.7);
    cyl(monitorStand, 0.16, 0.19, 0.04, 0, 0.02, 0, 0x2d333a, { rough: 0.45, metal: 0.5, seg: 16 });
    cyl(monitorStand, 0.026, 0.026, 1.1, 0, 0.56, 0, CITY.darkSteel, { rough: 0.3, metal: 0.85, seg: 12 });
    box(monitorStand, 0.4, 0.3, 0.1, 0, 1.24, 0, 0x22282e, { rough: 0.45, metal: 0.3 });
    const monitorFace = decal(monitorStand, 0.34, 0.24, 0, 1.24, 0.052,
      signFace("SpO2 98", { bg: "#06161c", accent: ORSURG_CSS, fg: "#c8f0e6", scale: 0.6 }), { glow: true, ei: 0.9, px: 320 });
    const alarmLamp = box(monitorStand, 0.36, 0.03, 0.03, 0, 1.42, 0.02, 0xf0645b, { emissive: 0xf0645b, ei: 0.04, rough: 0.4, cast: false });
    ownMaterial(alarmLamp);
    holoTag(monitorStand, "Sedation monitor", 0, 1.55, 0, { css: ORSURG_CSS, w: 0.46 });
    reg(hits, monitorStand, "vitals-monitor");
    // Cuff and probe leads running back toward the chair.
    hose(monitorStand, [[-0.16, 1.1, 0.04], [-0.5, 0.8, 0.3], [-0.8, 0.7, 0.5]], 0.008, 0x3c4a54, { steps: 10, rough: 0.6 });
    hose(monitorStand, [[0.16, 1.1, 0.04], [0.42, 0.8, 0.32], [0.6, 0.66, 0.6]], 0.007, 0x8f5f7a, { steps: 10, rough: 0.6 });

    const o2Tank = cylinderTank(g, 2.0, -0.6, 0x2f7d8c, { ry: -0.9 });
    const o2Flowmeter = group(g, 1.86, 1.22, -0.5, -0.9);
    cyl(o2Flowmeter, 0.03, 0.03, 0.12, 0, 0, 0, 0xd7dee3, { rough: 0.35, metal: 0.5, seg: 14 });
    ball(o2Flowmeter, 0.012, 0, 0.0, 0.028, 0x8fd6c9, { emissive: 0x8fd6c9, ei: 0.4, rough: 0.4, seg: 10 });
    const flowKnob = torus(o2Flowmeter, 0.028, 0.008, 0, -0.09, 0, 0x2f7d4a, { rough: 0.5, seg: 6, seg2: 16 });
    flowKnob.rotation.x = Math.PI / 2;
    decal(o2Flowmeter, 0.05, 0.03, 0, 0.09, 0.03, signFace("L/MIN", { bg: "#1c2b30", accent: ORSURG_CSS, scale: 0.42 }), { px: 128 });
    holoTag(o2Flowmeter, "O2 flowmeter", 0, 0.16, 0, { css: ORSURG_CSS, w: 0.4 });
    reg(hits, o2Flowmeter, "o2-flowmeter");
    void o2Tank;

    // ------------------------------------------------------------- scrub sink
    const scrub = group(g, -2.15, 0, -1.5, -0.85);
    box(scrub, 0.8, 0.86, 0.5, 0, 0.43, 0, ORSURG_CABINET, { rough: 0.5, metal: 0.12 });
    const scrubTop = slab(scrub, 0.86, 0.04, 0.54, 0, 0.88, 0, 0xffffff, { radius: 0.01, rough: 0.45 });
    scrubTop.material = texturedMat(topTex, { rough: 0.45, metal: 0.05, color: 0xffffff });
    const basin = cyl(scrub, 0.2, 0.2, 0.16, 0, 0.84, 0, 0xdde5e9, { rough: 0.3, metal: 0.25, seg: 18, open: true, side: 2 });
    cyl(scrub, 0.022, 0.022, 0.34, 0, 1.04, -0.18, ORSURG_STEEL, { rough: 0.28, metal: 0.9, seg: 10 });
    cyl(scrub, 0.015, 0.015, 0.2, 0, 1.2, -0.09, ORSURG_STEEL, { rough: 0.28, metal: 0.9, seg: 10 }).rotation.x = 1.15;
    box(scrub, 0.1, 0.05, 0.14, -0.22, 0.88, -0.16, 0x4f6d7c, { rough: 0.5, metal: 0.3 });
    const scrubBottle = group(scrub, 0.28, 0.9, -0.12);
    cyl(scrubBottle, 0.045, 0.05, 0.2, 0, 0.1, 0, 0x2f7d8c, { rough: 0.4, seg: 14 });
    decal(scrubBottle, 0.07, 0.08, 0, 0.11, 0.051, paperFace("", ["SURGICAL", "SCRUB", "SEE LABEL"], { bg: "#e8f4f6" }), { px: 160 });
    holoTag(scrub, "Surgical scrub", 0.05, 1.18, -0.1, { css: ORSURG_CSS, w: 0.4 });
    reg(hits, basin, "scrub-sink");

    // ------------------------------------------------------------ sterile stack
    const gownTable = group(g, -2.2, 0, 0.55, 0.95);
    cyl(gownTable, 0.15, 0.17, 0.04, -0.34, 0.02, 0, 0x2d333a, { rough: 0.45, metal: 0.5, seg: 14 });
    cyl(gownTable, 0.15, 0.17, 0.04, 0.34, 0.02, 0, 0x2d333a, { rough: 0.45, metal: 0.5, seg: 14 });
    cyl(gownTable, 0.026, 0.026, 0.84, -0.34, 0.44, 0, CITY.darkSteel, { rough: 0.3, metal: 0.8, seg: 10 });
    cyl(gownTable, 0.026, 0.026, 0.84, 0.34, 0.44, 0, CITY.darkSteel, { rough: 0.3, metal: 0.8, seg: 10 });
    const gownTop = slab(gownTable, 0.86, 0.03, 0.46, 0, 0.88, 0, 0xe8eef0, { radius: 0.01, rough: 0.4, metal: 0.2 });
    slab(gownTable, 0.84, 0.008, 0.44, 0, 0.9, 0, ORSURG_DRAPE, { radius: 0.01, rough: 0.85 });
    void gownTop;

    const sterileGown = group(gownTable, -0.24, 0.93, 0);
    slab(sterileGown, 0.2, 0.05, 0.16, 0, 0.02, 0, 0xcfe4e2, { radius: 0.02, rough: 0.85 });
    slab(sterileGown, 0.17, 0.03, 0.13, 0, 0.055, 0, 0xdcefec, { radius: 0.02, rough: 0.85 });
    decal(sterileGown, 0.13, 0.04, 0, 0.073, 0.001, signFace("STERILE", { bg: "#e8f6f4", accent: "#2f7d4a", scale: 0.5 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(sterileGown, "Sterile gown", 0, 0.14, 0, { css: ORSURG_CSS, w: 0.34 });
    reg(hits, sterileGown, "sterile-gown");

    const sterileGloves = group(gownTable, 0.02, 0.93, 0);
    box(sterileGloves, 0.13, 0.03, 0.1, 0, 0.015, 0, 0xf2f7f8, { rough: 0.55, opacity: 0.85, transparent: true });
    box(sterileGloves, 0.11, 0.012, 0.085, 0, 0.035, 0, 0xe4eff0, { rough: 0.6 });
    decal(sterileGloves, 0.1, 0.03, 0, 0.043, 0.001, signFace("7 1/2", { bg: "#eef7f8", accent: ORSURG_CSS, scale: 0.5 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(sterileGloves, "Sterile gloves", 0, 0.13, 0, { css: ORSURG_CSS, w: 0.38 });
    reg(hits, sterileGloves, "sterile-gloves");

    // The specimen container with its label — the drag socket.
    const specimenContainer = group(gownTable, 0.3, 0.92, 0.02);
    cyl(specimenContainer, 0.03, 0.028, 0.06, 0, 0.03, 0, 0xe4eef2, { rough: 0.25, metal: 0.05, seg: 14, opacity: 0.6, transparent: true });
    cyl(specimenContainer, 0.032, 0.032, 0.012, 0, 0.065, 0, 0xf0645b, { rough: 0.5, seg: 14 });
    decal(specimenContainer, 0.05, 0.03, 0, 0.03, 0.031, signFace("LL8 / DATE", { bg: "#f4f8f9", accent: "#a8302c", scale: 0.36 }), { px: 160 });
    holoTag(specimenContainer, "Labelled container", 0, 0.14, 0, { css: ORSURG_CSS, w: 0.5 });
    reg(hits, specimenContainer, "specimen-container");

    // The unlabelled jar beside it — the hazard.
    const unlabelled = group(gownTable, 0.3, 0.92, -0.16);
    cyl(unlabelled, 0.03, 0.028, 0.06, 0, 0.03, 0, 0xe4eef2, { rough: 0.25, metal: 0.05, seg: 14, opacity: 0.6, transparent: true });
    cyl(unlabelled, 0.032, 0.032, 0.012, 0, 0.065, 0, 0xc6ced4, { rough: 0.5, seg: 14 });
    holoTag(unlabelled, "No label", 0, 0.13, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, unlabelled, "unlabelled-specimen");

    // ------------------------------------------------------------ instrument tray
    const trayStand = group(g, -1.3, 0, -0.35, 0.65);
    cyl(trayStand, 0.16, 0.19, 0.04, 0, 0.02, 0, 0x2d333a, { rough: 0.45, metal: 0.5, seg: 16 });
    cyl(trayStand, 0.028, 0.028, 0.9, 0, 0.47, 0, CITY.darkSteel, { rough: 0.3, metal: 0.85, seg: 12 });
    const tray = group(trayStand, 0, 0.94, 0.06);
    slab(tray, 0.58, 0.022, 0.36, 0, 0, 0, 0xe4ebee, { radius: 0.012, rough: 0.4, metal: 0.25 });
    slab(tray, 0.56, 0.008, 0.34, 0, 0.016, 0, ORSURG_DRAPE, { radius: 0.01, rough: 0.85 });

    const periosteal = group(tray, -0.2, 0.03, -0.09, 0.15);
    cyl(periosteal, 0.005, 0.005, 0.15, 0, 0, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92, seg: 8 }).rotation.z = Math.PI / 2;
    box(periosteal, 0.024, 0.004, 0.008, 0.08, 0, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92 });
    holoTag(periosteal, "Periosteal", 0, 0.08, 0, { css: ORSURG_CSS, w: 0.3 });
    reg(hits, periosteal, "periosteal-elevator");

    const elevator = group(tray, -0.06, 0.03, -0.09, -0.1);
    cyl(elevator, 0.006, 0.006, 0.14, 0, 0, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92, seg: 8 }).rotation.z = Math.PI / 2;
    box(elevator, 0.018, 0.005, 0.01, 0.075, 0.001, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92 });
    holoTag(elevator, "Straight elevator", 0, 0.08, 0, { css: ORSURG_CSS, w: 0.44 });
    reg(hits, elevator, "surgical-elevator");

    const forceps = group(tray, 0.1, 0.03, -0.09, 0.3);
    for (const sx of [-1, 1]) {
      const arm = cyl(forceps, 0.0045, 0.0045, 0.14, 0, sx * 0.006, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92, seg: 8 });
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = sx * 0.05;
    }
    box(forceps, 0.024, 0.014, 0.012, 0.075, 0, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92 });
    holoTag(forceps, "Forceps", 0, 0.08, 0, { css: ORSURG_CSS, w: 0.26 });
    reg(hits, forceps, "extraction-forceps");

    const curette = group(tray, 0.23, 0.03, -0.09, -0.25);
    cyl(curette, 0.0045, 0.0045, 0.13, 0, 0, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92, seg: 8 }).rotation.z = Math.PI / 2;
    ball(curette, 0.006, 0.07, 0.002, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92, seg: 8 });
    holoTag(curette, "Curette", 0, 0.08, 0, { css: ORSURG_CSS, w: 0.26 });
    reg(hits, curette, "surgical-curette");

    // Surgical suction, on its own hanger off the tray stand.
    const suction = group(trayStand, 0.3, 0.86, 0.02, -0.5);
    cyl(suction, 0.012, 0.009, 0.16, 0, 0.04, 0, 0xe4ebee, { rough: 0.3, metal: 0.2, seg: 12 }).rotation.x = -0.5;
    cyl(suction, 0.016, 0.016, 0.03, 0, 0.14, -0.06, 0x4f6d7c, { rough: 0.4, metal: 0.3, seg: 12 }).rotation.x = -0.5;
    holoTag(suction, "Surgical suction", 0, 0.22, 0, { css: ORSURG_CSS, w: 0.44 });
    reg(hits, suction, "surgical-suction");
    hose(trayStand, [[0.3, 0.82, 0.0], [0.45, 0.5, 0.15], [0.55, 0.2, 0.25]], 0.012, 0xc6d0d6, { steps: 10, rough: 0.5 });

    // The previous case's tip, back in the tray — the hazard.
    const reusedTip = group(tray, 0.23, 0.03, 0.1, 0.4);
    cyl(reusedTip, 0.01, 0.008, 0.11, 0, 0, 0, 0xcbd4d8, { rough: 0.45, metal: 0.1, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(reusedTip, "Last case's tip", 0, 0.07, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, reusedTip, "reused-suction-tip");

    // Tissue retractor, on the near edge where the assistant's hand is.
    const retractor = group(tray, -0.2, 0.03, 0.1, -0.35);
    cyl(retractor, 0.005, 0.005, 0.13, 0, 0, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92, seg: 8 }).rotation.z = Math.PI / 2;
    box(retractor, 0.028, 0.004, 0.018, 0.072, 0.002, 0, ORSURG_STEEL, { rough: 0.22, metal: 0.92 });
    holoTag(retractor, "Tissue retractor", 0, 0.08, 0, { css: ORSURG_CSS, w: 0.44 });
    reg(hits, retractor, "tissue-retractor");

    // ---------------------------------------------------- sharps and the count
    const sharpsUnit = group(g, 1.42, 0, 0.9, -1.2);
    box(sharpsUnit, 0.3, 0.38, 0.24, 0, 1.06, 0, 0xd8342a, { rough: 0.6 });
    box(sharpsUnit, 0.32, 0.05, 0.26, 0, 1.28, 0, 0xf2e9c9, { rough: 0.55 });
    box(sharpsUnit, 0.14, 0.02, 0.09, 0, 1.305, 0.02, 0x2b2e33, { rough: 0.6 });
    cyl(sharpsUnit, 0.03, 0.03, 0.9, -0.2, 0.55, 0, 0x8d959d, { rough: 0.5, metal: 0.4, seg: 10 });
    box(sharpsUnit, 0.2, 0.04, 0.2, -0.1, 0.9, 0, 0x8d959d, { rough: 0.5, metal: 0.4 });
    decal(sharpsUnit, 0.26, 0.14, 0, 1.08, 0.122, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.4 }));

    // The count board, with the three sharps tallied against it.
    const countBoard = group(g, 2.5, 0, 1.0, -1.75);
    cyl(countBoard, 0.02, 0.02, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.35, metal: 0.7, seg: 10 });
    box(countBoard, 0.46, 0.34, 0.03, 0, 1.3, 0, 0x22282e, { rough: 0.5, metal: 0.2 });
    decal(countBoard, 0.4, 0.28, 0, 1.3, 0.017, paperFace("SHARPS COUNT", [
      "Scalpel blade  1", "Anaesthetic needle  1", "Suture needle  1",
    ], { bg: "#f2f6f7", band: "#a5261e" }), { px: 256 });
    const scalpelTally = box(countBoard, 0.06, 0.03, 0.01, -0.15, 1.35, 0.02, 0xcbd6da, { rough: 0.3, metal: 0.6 });
    holoTag(countBoard, "Blade", -0.15, 1.44, 0.02, { css: ORSURG_CSS, w: 0.22 });
    reg(hits, scalpelTally, "scalpel-tally");
    const needleTally = box(countBoard, 0.06, 0.03, 0.01, 0.0, 1.35, 0.02, 0xd8dee2, { rough: 0.3, metal: 0.6 });
    holoTag(countBoard, "Needle", 0.0, 1.44, 0.02, { css: ORSURG_CSS, w: 0.24 });
    reg(hits, needleTally, "needle-tally");
    const sutureTally = box(countBoard, 0.06, 0.03, 0.01, 0.15, 1.35, 0.02, 0xc4ccd2, { rough: 0.3, metal: 0.6 });
    holoTag(countBoard, "Suture", 0.15, 1.44, 0.02, { css: ORSURG_CSS, w: 0.24 });
    reg(hits, sutureTally, "suture-tally");

    // The loose blade on the drape — the hazard.
    const bareBlade = group(tray, 0.1, 0.035, 0.12, 0.2);
    box(bareBlade, 0.024, 0.002, 0.008, 0, 0, 0, 0xe4ecf0, { rough: 0.15, metal: 0.9 });
    holoTag(bareBlade, "Blade loose", 0, 0.06, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, bareBlade, "bare-blade");

    // -------------------------------------------------- consent, images, record
    const consentBoard = holoPanel(g, 0.62, 0.44, -1.5, 1.5, -2.3, (cx, w, h) => {
      cx.fillStyle = "rgba(6,20,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = ORSURG_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c8ede2";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SURGICAL CONSENT", w * 0.06, h * 0.15);
      cx.fillStyle = "#eaf7f3";
      cx.font = `${Math.round(h * 0.088)}px Arial, sans-serif`;
      ["Procedure: surgical extraction", "Tooth: lower left third molar",
        "Anaesthesia: IV sedation", "Signed before sedation"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { accent: ORSURG_ACCENT });
    reg(hits, consentBoard, "consent-form");

    const radiographPanel = holoPanel(g, 0.5, 0.36, -0.6, 1.52, -2.35, (cx, w, h) => {
      cx.fillStyle = "#0a1014"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1e2a30"; cx.fillRect(w * 0.05, h * 0.2, w * 0.9, h * 0.68);
      cx.fillStyle = "#cfe0e4";
      for (let i = 0; i < 5; i++) {
        cx.beginPath();
        cx.ellipse(w * (0.2 + i * 0.15), h * 0.48, w * 0.05, h * 0.16, 0, 0, Math.PI * 2);
        cx.fill();
      }
      cx.fillStyle = "#f0645b";
      cx.fillRect(w * 0.68, h * 0.26, w * 0.16, 3);
      cx.fillStyle = "#9fdcd0";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("LL8 — MARKED", w * 0.06, h * 0.11);
    }, { accent: ORSURG_ACCENT });
    reg(hits, radiographPanel, "site-radiograph");

    const allergyAlert = group(g, 0.35, 0, -2.4, 0.15);
    cyl(allergyAlert, 0.018, 0.018, 1.3, 0, 0.65, 0, CITY.darkSteel, { rough: 0.35, metal: 0.7, seg: 10 });
    const allergyPlate = box(allergyAlert, 0.3, 0.2, 0.02, 0, 1.4, 0, 0xf0b86e, { rough: 0.5 });
    decal(allergyAlert, 0.26, 0.16, 0, 1.4, 0.013, paperFace("ALLERGY", ["Penicillin", "Flag on chart"], { bg: "#fff1d6", band: "#c4762a" }), { px: 192 });
    holoTag(allergyAlert, "Allergy alert", 0, 1.56, 0, { css: "#f0b86e", w: 0.36 });
    reg(hits, allergyPlate, "allergy-alert");

    const anesthesiaRecord = holoPanel(g, 0.6, 0.42, 2.2, 1.4, 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,18,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fd6a0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#cfeedd";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ANAESTHESIA RECORD", w * 0.06, h * 0.15);
      cx.fillStyle = "#eaf6f0";
      cx.font = `${Math.round(h * 0.086)}px Arial, sans-serif`;
      ["Vitals at each timepoint", "Drugs, doses, times", "Specimen to pathology",
        "Sharps count reconciled"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { accent: 0x8fd6a0, ry: -1.3 });
    reg(hits, anesthesiaRecord, "anesthesia-record");

    const debriefBoard = holoPanel(g, 0.54, 0.34, -2.3, 1.38, 1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(14,12,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0b86e"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe2bd";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("CASE DEBRIEF", w * 0.06, h * 0.16);
      cx.fillStyle = "#fff3e4";
      cx.font = `${Math.round(h * 0.095)}px Arial, sans-serif`;
      ["Desaturation at 14:08", "Recovery handover given", "Are you alright?"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.19)));
    }, { accent: 0xf0b86e, ry: 1.2 });
    reg(hits, debriefBoard, "debrief-board");

    // -------------------------------------------------- escort and instructions
    const escort = standingFigure(g, 2.35, 2.25, { ry: -2.3, cloth: 0x6b5f7c, skin: 0xd9a985, seed: 9 });
    const escortHand = box(g, 0.14, 0.12, 0.12, 1.95, 1.0, 1.7, 0x8fd6c9, { emissive: 0x8fd6c9, ei: 0.1, rough: 0.4, opacity: 0.3, transparent: true });
    holoTag(g, "Escort", 1.95, 1.16, 1.7, { css: ORSURG_CSS, w: 0.26 });
    hits["escort-hand"] = escortHand;

    const instructionSheet = group(g, 1.85, 0.96, 0.9, -0.9);
    box(instructionSheet, 0.16, 0.004, 0.22, 0, 0, 0, 0xf6f4ec, { rough: 0.9 });
    decal(instructionSheet, 0.14, 0.19, 0, 0.004, 0, paperFace("AFTER YOUR SURGERY", [
      "Pressure on the gauze", "No rinsing, no straws", "Ice, then warm salt water", "Ring us if bleeding returns",
    ], { bg: "#f8f5ec", band: "#2f7d8c" }), { px: 256 }).rotation.x = -Math.PI / 2;
    holoTag(instructionSheet, "Post-op instructions", 0, 0.1, 0, { css: ORSURG_CSS, w: 0.52 });
    reg(hits, instructionSheet, "instruction-sheet");

    // The ringing phone on the counter — the hazard.
    const counterRun = group(g, -0.3, 0, 2.3, Math.PI);
    box(counterRun, 2.1, 0.86, 0.5, 0, 0.43, 0, ORSURG_CABINET, { rough: 0.5, metal: 0.12 });
    const counterTop = slab(counterRun, 2.16, 0.04, 0.54, 0, 0.88, 0, 0xffffff, { radius: 0.01, rough: 0.45 });
    counterTop.material = texturedMat(topTex, { rough: 0.45, metal: 0.05, color: 0xffffff });
    for (let i = 0; i < 3; i++) {
      box(counterRun, 0.66, 0.7, 0.02, -0.7 + i * 0.7, 0.45, 0.26, 0xd0d8dd, { rough: 0.5, metal: 0.2 });
      box(counterRun, 0.2, 0.018, 0.028, -0.7 + i * 0.7, 0.66, 0.276, 0x8e979f, { rough: 0.4, metal: 0.6 });
    }
    // No overhead cupboards on this run: the learner arrives looking straight
    // over it at the chair, and a wall of doors at head height is a screen.
    box(counterRun, 2.1, 0.06, 0.1, 0, 1.12, 0.2, ORSURG_CABINET, { rough: 0.5, metal: 0.12 });
    for (let i = 0; i < 3; i++) {
      box(counterRun, 0.2, 0.14, 0.14, -0.6 + i * 0.6, 1.22, 0.2, 0xdfe6ea, { rough: 0.6 });
    }
    const phone = group(counterRun, 0.78, 0.9, 0.1, Math.PI);
    box(phone, 0.11, 0.04, 0.14, 0, 0.02, 0, 0x2b3138, { rough: 0.5 });
    box(phone, 0.09, 0.03, 0.05, 0, 0.055, -0.03, 0x3a4249, { rough: 0.5 });
    const phoneLamp = box(phone, 0.03, 0.01, 0.02, 0.03, 0.045, 0.05, 0xf0645b, { emissive: 0xf0645b, ei: 0.8, rough: 0.4, cast: false });
    holoTag(phone, "Phone ringing", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, phone, "ringing-phone");
    void phoneLamp;

    // ------------------------------------------------------------- overhead rig
    const opLight = group(g, 0, 0, -0.95);
    cyl(opLight, 0.022, 0.022, 0.46, 0, 2.16, 0, CITY.darkSteel, { rough: 0.35, metal: 0.8, seg: 10 });
    const lightArm = group(opLight, 0, 1.9, 0);
    cyl(lightArm, 0.02, 0.02, 0.86, 0, 0, 0, CITY.darkSteel, { rough: 0.35, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2.5;
    const lightHead = group(lightArm, 0.58, -0.3, -0.12);
    cyl(lightHead, 0.2, 0.22, 0.09, 0, 0, 0, 0xeaf0f2, { rough: 0.3, metal: 0.3, seg: 20 });
    cyl(lightHead, 0.18, 0.18, 0.02, 0, -0.055, 0, 0xfff6de, { emissive: 0xfff6de, ei: 1.0, rough: 0.3, seg: 20, cast: false });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      cyl(lightHead, 0.02, 0.02, 0.02, Math.sin(a) * 0.1, -0.05, Math.cos(a) * 0.1, 0xfff0c8, { emissive: 0xfff0c8, ei: 1.4, rough: 0.3, seg: 10, cast: false });
    }

    // Wall rail: glove boxes, a waste bin and a biohazard bag stand.
    const gloveRail = group(g, -2.4, 0, 2.05, 1.3);
    box(gloveRail, 0.06, 0.4, 0.9, 0, 1.35, 0, 0x8d959d, { rough: 0.5, metal: 0.4 });
    const GLOVE_TONES = [0x6fa8d6, 0x8fd6a0, 0xe2b0c4];
    for (let i = 0; i < 3; i++) {
      box(gloveRail, 0.14, 0.24, 0.24, 0.06, 1.35, -0.3 + i * 0.3, GLOVE_TONES[i], { rough: 0.6 });
      decal(gloveRail, 0.1, 0.06, 0.135, 1.35, -0.3 + i * 0.3, signFace("GLOVES", { bg: "#22282e", accent: ORSURG_CSS, scale: 0.4 }), { px: 128 }).rotation.y = Math.PI / 2;
    }

    const biohazardStand = group(g, 2.3, 0, 1.6, -1.6);
    for (const sx of [-1, 1]) {
      cyl(biohazardStand, 0.012, 0.012, 0.6, sx * 0.14, 0.3, 0, 0x8d959d, { rough: 0.5, metal: 0.5, seg: 8 });
    }
    torus(biohazardStand, 0.16, 0.012, 0, 0.62, 0, 0x8d959d, { rough: 0.5, metal: 0.5, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    cyl(biohazardStand, 0.16, 0.1, 0.36, 0, 0.44, 0, 0xd8342a, { rough: 0.7, seg: 16, opacity: 0.8, transparent: true });
    decal(biohazardStand, 0.12, 0.08, 0, 0.5, 0.165, signFace("BIOHAZARD", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.34 }), { px: 160 });

    // The surgeon, opposite.
    standingFigure(g, -0.95, -1.7, { ry: 2.7, cloth: 0x2f6f7c, skin: 0x6b4630, seed: 13 });
    const recoveryNurse = standingFigure(g, 2.8, 0.0, { ry: -1.7, cloth: 0x4f7f6f, skin: 0xe0b38a, seed: 17 });

    const mist = particles(g, 24, 0xdff0f8, { size: 0.009, life: 0.32, additive: false, opacity: 0.45 });
    let suctioning = false, alarmActive = false, bleedActive = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.08, -1.0),

      onStep(step) { suctioning = step.id === "suction-position"; },

      onStepComplete(step) {
        if (step.id === "surgical-timeout") {
          allergyPlate.material = mat(0x8fd6a0, { rough: 0.5 });
        }
        if (step.id === "gown-drape") {
          patientDrape.material = mat(0x6fa89b, { rough: 0.8 });
        }
        if (step.id === "sedation-readback") {
          repaint(monitorFace, signFace("SpO2 98", { bg: "#06161c", accent: ORSURG_CSS, fg: "#c8f0e6", scale: 0.6 }));
        }
        if (step.id === "specimen-jar") {
          extractedTooth.parent.remove(extractedTooth);
          specimenContainer.add(extractedTooth);
          extractedTooth.position.set(0, 0.02, 0);
          extractedTooth.rotation.set(0, 0, 0);
          unlabelled.visible = false;
        }
        if (step.id === "sharps-count") {
          bareBlade.visible = false;
          for (const t of [scalpelTally, needleTally, sutureTally]) t.material = mat(0x8fd6a0, { rough: 0.4, metal: 0.3 });
        }
        if (step.id === "hemostasis-hold") bleed.visible = false;
        if (step.id === "postop-sheet") {
          instructionSheet.parent.remove(instructionSheet);
          g.add(instructionSheet);
          instructionSheet.position.set(1.95, 1.02, 1.7);
          instructionSheet.rotation.set(0, -2.3, 0);
        }
        if (step.id === "surgical-log") {
          repaint(anesthesiaRecord.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,26,20,0.92)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#8fd6a0"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#d8f4e4";
            cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillText("RECORD — COMPLETE", w * 0.06, h * 0.15);
            cx.fillStyle = "#eaf6f0";
            cx.font = `${Math.round(h * 0.086)}px Arial, sans-serif`;
            ["SpO2 low 88% at 14:08", "Airway opened, recovered",
              "LL8 to pathology, labelled", "Sharps 3/3 accounted"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "spo2-drop") {
          alarmActive = true;
          repaint(monitorFace, signFace("SpO2 86", { bg: "#2a0a0e", accent: "#f0645b", fg: "#ffd8d8", scale: 0.6 }));
          recoveryNurse.position.set(1.3, 0, -0.15);
        }
        if (it.id === "bleeding-not-controlled") {
          bleedActive = true;
          bleed.visible = true;
          gauzePack.children[0].material = mat(ORSURG_BLOOD, { rough: 0.9 });
        }
      },

      onInterruptEnd(it) {
        if (it.id === "spo2-drop") {
          alarmActive = false;
          alarmLamp.material.emissiveIntensity = 0.04;
          if (it.resolved === "answered") {
            headrest.position.y = 1.14;
            patient.head.rotation.x = -0.28;
            repaint(monitorFace, signFace("SpO2 97", { bg: "#06161c", accent: ORSURG_CSS, fg: "#c8f0e6", scale: 0.6 }));
            recoveryNurse.position.set(2.8, 0, 0.0);
          }
        }
        if (it.id === "bleeding-not-controlled") {
          bleedActive = false;
          if (it.resolved === "answered") {
            bleed.visible = false;
            hemostatic.parent.remove(hemostatic);
            field.add(hemostatic);
            hemostatic.position.set(0.046, 0.016, 0.03);
            hemostatic.scale.set(0.35, 0.35, 0.35);
            gauzePack.children[0].material = mat(0xf6f3ea, { rough: 0.95 });
          }
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        mist.visible = suctioning && !!session?.track;
        if (mist.visible) mist.userData.step(dt, new THREE.Vector3(0, 1.1, -1.82), 0.05, 0.28, -0.5);
        alarmLamp.material.emissiveIntensity = alarmActive ? 1.6 + Math.sin(t * 8) * 0.5 : 0.04;
        if (bleedActive) bleed.material.emissiveIntensity = 0.5 + Math.sin(t * 6) * 0.3;
      },
    };
  },
};
