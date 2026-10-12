import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles,
  seatedFigure, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Four-Handed Dentistry VR — Dental & Oral Health.
//
// The dental assistant's own trade at the chair, which is a career and not an
// errand: the operator and assistant zones laid out by the clock face, the
// assistant's stool set above the operator's so both see the same field, the
// tray laid out in order of use, instruments transferred in the transfer zone
// below the patient's chin with a grip that is taken before the other is
// given, high-volume evacuation placed on hard tissue rather than sucked onto
// the floor of the mouth, and retraction that holds a field open without
// blanching anything.
//
// Nothing here invents a duty. What an assistant may do at the chair is set by
// the state dental practice act's allowable-duties list and, where the state
// requires it, a separate permit; the assisting credential named is DANB's,
// the professional body is the ADAA, and the clinic staff in most organised
// offices are SEIU or UFCW members.

const FHD_ACCENT = 0x58b7e0;
const FHD_ZONE = 0x3f7f96;
const FHD_TRAY = 0x99a4ac;

export const SIM_FOUR_HANDED_DENTISTRY = {
  id: "four-handed-dentistry",
  index: "213",
  domain: "Dental",
  trade: "Dental assistant — chairside (DANB CDA)",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "DANB's Certified Dental Assistant (CDA) credential and its general chairside assisting component; the American Dental Assistants Association (ADAA) as the profession's body; the state dental practice act's allowable-duties list for assistants and any separate state permit above it; the ADA's guidance on the dental team; the CDC's Guidelines for Infection Control in Dental Health-Care Settings for instrument handling at the chair; OSHA 29 CFR 1910.1030 bloodborne pathogens and NIOSH's dental ergonomics guidance; SEIU and UFCW clinic staff agreements",
  name: "Four-Handed Dentistry",
  title: simTitle("Four-Handed Dentistry"),
  tagline: "Chairside assisting as a trade: clock zones, stool heights, a tray in order of use, transfers below the chin, evacuation on hard tissue and retraction that holds a field without blanching it",
  accent: FHD_ACCENT,
  accentCss: "#58b7e0",
  parSeconds: 300,
  footprint: 2.2,
  badge: { id: "second-pair-of-hands", name: "Second Pair Of Hands", note: "A full restorative appointment assisted from the assistant's zone with every transfer made below the patient's chin" },

  game: system({
    name: "Chairside Craft",
    currency: "PASS",
    ranks: ["Assisting Student", "Chairside Assistant", "Certified Dental Assistant", "Lead Assistant", "Chairside Craft Certified"],
    badges: [
      { id: "zones-held", name: "Zones Held", note: "The clock zones read correctly and the static zone left clear", test: AWARD.stepClean("clock-zones") },
      { id: "nothing-over-the-face", name: "Nothing Over The Face", note: "No unsafe action anywhere in the appointment", test: AWARD.safe },
      { id: "rhythm-kept", name: "Rhythm Kept", note: "Both timed passages carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-assist", name: "Clean Assist", note: "No corrections anywhere in the appointment", test: AWARD.clean },
      { id: "steady-field", name: "Steady Field", note: "Retraction committed inside the narrow band", test: AWARD.precise(0.74) },
      { id: "on-the-operator", name: "On The Operator", note: "Complete inside 80% of par — the operator never waited", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "fhd-pass-over-face": "That transfer went across the patient's eyes. An instrument carried over a face is a dropped bur or a scaler point landing on a cornea, and there is no recovery from it — every pass in four-handed work travels in the transfer zone under the chin, over the patient's chest, where a dropped instrument lands on a bib and nothing else.",
    "fhd-tip-on-tissue": "The evacuator tip is pulled down onto the floor of the mouth. High-volume suction sealed against soft tissue draws the mucosa into the tip and leaves a bruise or a haematoma the patient discovers hours later; the bevel rides against enamel or the retracted cheek with the tissue held clear, never parked in the sublingual fold.",
    "fhd-unsupported-pass": "That instrument was released before the operator's fingers closed on it. A transfer is a two-part move — the receiving hand takes a grip, and only then does the giving hand let go — because an instrument let go early falls point-down between two people who are both looking into a mouth.",
    "fhd-blocked-static-zone": "The mobile stand has been parked across the static zone behind the patient's head. That zone is deliberately kept empty so nothing has to be lifted across the patient to reach it; blocked, every handpiece and every cord change becomes a reach over a face that the whole layout exists to prevent.",
  },

  lateNotes: {
    "fhd-transfer-rhythm": "Not yet — there is nothing to pass. The tray is not laid out in order of use, so the next instrument is still a guess rather than the one already in your fingers.",
    "fhd-cure-shield": "Hold that. Nothing has been placed to cure, and the shield is there for a light that is about to be switched on, not for a light that is still parked.",
    "fhd-chairside-log": "The appointment is not finished. The record is written from what actually happened, at the end, not opened early and filled in from the plan.",
  },

  steps: [
    {
      id: "operator-seat", kind: "select", target: "fhd-operator-stool",
      title: "Set the operator's seat before anyone sits down",
      cue: "Bring the operator's stool to the height that puts the patient's mouth at the operator's elbow.",
      why: "Everything downstream of this is decided here. With the patient's mouth level with the operator's elbows and the operator's forearms roughly horizontal, the field can be worked without a bent neck or a lifted shoulder; set too low, the operator hunches into the mouth for an hour, and NIOSH's dental ergonomics guidance ties exactly that posture to the neck and shoulder injuries that end assisting and hygiene careers early.",
    },
    {
      id: "clock-zones", kind: "sequence", anyOrder: true,
      targets: ["fhd-zone-operator", "fhd-zone-assistant", "fhd-zone-transfer", "fhd-zone-static"],
      itemNames: {
        "fhd-zone-operator": "operator's zone", "fhd-zone-assistant": "assistant's zone",
        "fhd-zone-transfer": "transfer zone", "fhd-zone-static": "static zone",
      },
      itemNotes: {
        "fhd-zone-operator": "For a right-handed operator this is roughly seven to twelve o'clock around the patient's head — the arc the operator moves through without ever leaving the field.",
        "fhd-zone-assistant": "Roughly two to four o'clock, on the other side, close enough that a hand reaches the mouth without the shoulder travelling.",
        "fhd-zone-transfer": "Roughly four to seven o'clock, low, over the patient's chest — the only place an instrument changes hands.",
        "fhd-zone-static": "Twelve to two o'clock, behind the patient's head, kept empty so nothing is ever reached for across a face.",
      },
      title: "Read the four clock zones off the floor",
      cue: "Identify the operator, assistant, transfer and static zones marked around the chair — order doesn't matter.",
      why: "Four-handed dentistry is a geometry before it is a skill. The clock face around the patient's head divides the room into where the operator works, where the assistant works, where instruments change hands and where nothing is allowed to be, and a team that shares that map stops narrating: the assistant already knows what is wanted and where to put it without a word being said.",
    },
    {
      id: "stool-height", kind: "turn", target: "fhd-stool-dial",
      title: "Raise the assistant's stool above the operator's",
      cue: "Wind the assistant's stool up until you are looking down into the same field the operator sees.",
      turn: { turns: 1.5, axis: "y", label: "ASSISTANT STOOL" },
      why: "The assistant sits four to six inches higher than the operator for one reason: from that height the same field is visible over the operator's hands, so suction and retraction can be placed where the work actually is instead of where it was a moment ago. Level with the operator, the assistant is guessing at a mouth they cannot see into, and every placement becomes a correction.",
    },
    {
      id: "tray-order", kind: "sequence",
      targets: ["fhd-tray-first", "fhd-tray-second", "fhd-tray-third"],
      itemNames: {
        "fhd-tray-first": "examination instruments first", "fhd-tray-second": "the anaesthetic set next",
        "fhd-tray-third": "the restorative instruments last",
      },
      outOfOrderNote: "Out of order. The tray is laid left to right in the order the operator will ask for things — mirror and explorer, then the anaesthetic set, then the restorative instruments — so reset and lay it in sequence of use.",
      title: "Lay the tray out in order of use",
      cue: "Set the cassette out left to right in the order the operator will ask for each group.",
      why: "A tray laid out in the order of the procedure means the next instrument is always the next one along, so it can be picked up while the operator is still working rather than searched for after they ask. Laid out by shape or by habit instead, every transfer begins with a hunt, the operator's eyes leave the field to watch you find it, and the appointment lengthens by the sum of all those small pauses.",
    },
    {
      id: "fulcrum", kind: "select", target: "fhd-fulcrum",
      title: "Establish a finger rest before anything enters the mouth",
      cue: "Set your fulcrum on a tooth surface or the chin, not on a moving cheek.",
      why: "A fulcrum is what turns a hand into an instrument you can control. Resting on solid structure means the mirror, the tip and the retractor all move in millimetres under intention rather than in centimetres when the patient swallows; without one, a sudden movement of the head becomes a sudden movement of whatever you were holding, and it is holding sharp metal inside a mouth.",
    },
    {
      id: "retraction", kind: "gauge", target: "fhd-mirror-retraction",
      title: "Retract to a clear field without blanching the tissue",
      cue: "Hold the cheek clear with the mirror and commit inside the band.",
      gauge: {
        label: "RETRACTION", speed: 0.6, green: [0.38, 0.58],
        readout: (t) => (t < 0.38 ? "cheek falling back over the field" : t > 0.58 ? "blanching — too much pressure" : "clear field, colour normal"),
        missNote: "Outside the band. Too little and the cheek closes over the very surface the operator is cutting; too much and the tissue goes white, which is capillary blood being squeezed out of it — and the ache from that lasts longer than the appointment.",
      },
      why: "Retraction is a pressure, not a position. Enough to hold the cheek and tongue clear of the working field, and no more: blanched tissue is tissue whose blood supply you are pinching off, and the bruise and soreness a patient remembers from a filling is far more often the retraction than the drilling. The colour of the tissue under the mirror is the readout that matters.",
    },
    {
      id: "hve-position", kind: "hold", target: "fhd-hve-tip", seconds: 6,
      title: "Hold high-volume evacuation on the working side",
      cue: "Place the bevel against hard tissue near the prep and hold it there while the operator cuts.",
      why: "The high-volume evacuator is what keeps the field dry enough to see and captures the aerosol the handpiece throws before it reaches anyone's face. Held with the bevel flat to the tooth surface and the tissue retracted clear, it lifts water and spray away from the prep; let it drift into the floor of the mouth and it seals onto mucosa, drags tissue into the tip and stops evacuating anything at all.",
      holdBreakNote: "The tip came off the field. The moment evacuation stops the mirror fogs and the prep floods, and the operator is cutting into water they cannot see through.",
    },
    {
      id: "transfer-pass", kind: "drag", target: "fhd-explorer",
      title: "Pass the next instrument in the transfer zone",
      cue: "Carry the instrument low, over the patient's chest, into the operator's waiting fingers.",
      why: "The transfer zone sits over the patient's chest and below the chin precisely so nothing ever travels across a face. Carried there, the instrument arrives in the operator's hand already in working orientation, the operator's eyes never leave the mouth, and if it is dropped it lands on the bib rather than on the patient.",
      drag: { to: "fhd-transfer-slot", radius: 0.4, missNote: "That path went high. Bring it low across the chest into the transfer zone — over the face is never a route, however short it looks." },
    },
    {
      id: "transfer-rhythm", kind: "track", target: "fhd-transfer-rhythm", seconds: 7,
      title: "Hold the transfer rhythm through the restoration",
      cue: "Keep the exchanges in rhythm — take a grip before you let go, and stay with the operator's pace.",
      why: "A transfer is a handshake with an interlock: the receiving fingers close, then the giving fingers open, and the used instrument comes back along the same line. Rushed, instruments are released into air and land point-first; hesitant, the operator stops working and waits with a hand out of the mouth. The band is the operator's own pace, and holding it is what the second pair of hands is for.",
      track: {
        start: 0.16, green: [0.36, 0.6], rise: 0.52, fall: 0.44, drift: 0.13, label: "TRANSFER RHYTHM",
        readout: (v) => (v < 0.36 ? "hesitating — the operator is waiting" : v > 0.6 ? "snatching — grip not taken yet" : "in rhythm"),
      },
      holdBreakNote: "The rhythm broke. Reset to the operator's pace: grip taken, then released, along the same line every time.",
    },
    {
      id: "tray-faults", kind: "find", noHint: true,
      targets: ["fhd-empty-carpule", "fhd-bent-band"],
      itemNames: { "fhd-empty-carpule": "a spent anaesthetic carpule", "fhd-bent-band": "a buckled matrix band" },
      itemNotes: {
        "fhd-empty-carpule": "This carpule is already discharged — the plunger is at the far end of the glass. Loaded into the syringe mid-appointment, the operator injects nothing, the patient feels the needle for no reason, and the whole sequence restarts.",
        "fhd-bent-band": "This matrix band is buckled along its contour. A band that will not seat against the adjacent tooth leaves an open margin the restoration is built against, and that margin is where the next cavity starts.",
      },
      title: "Find the two things on this tray that would stop the restoration",
      cue: "Two items here will fail in the operator's hand. Find them before they are asked for.",
      why: "The assistant is the last person to look at any instrument before it is used, which makes checking the tray part of the job rather than tidiness. A spent carpule or a deformed band discovered mid-procedure means the operator waits with an open tooth and an anaesthetised patient while somebody fetches a replacement — and it is always visible beforehand to whoever actually looks.",
    },
    {
      id: "rinse-and-dry", kind: "select", target: "fhd-air-water",
      title: "Rinse and dry the preparation",
      cue: "Wash the debris clear and dry with a gentle stream, not a blast.",
      why: "The preparation has to be clean and dry for a bonded restoration to hold, but a dentine surface dried too hard is dentine whose tubules have been desiccated, and that is one of the reliable causes of post-operative sensitivity. A short rinse and a controlled dry give the operator a visible, bondable surface without drying the tooth out from the inside.",
    },
    {
      id: "cure-hold", kind: "hold", target: "fhd-cure-shield", seconds: 5,
      title: "Hold the shield through the full cure",
      cue: "Bring the shield between the curing light and everyone's eyes, and hold it for the whole cure time.",
      why: "A curing light is an intense narrow-band source aimed into a mouth for the manufacturer's full stated time, and that time is not negotiable — a short cure leaves resin soft under a hard surface. The shield is what lets the light run its whole cycle without the operator, the assistant and the patient all taking the reflection, because this happens dozens of times a day, every day, for a career.",
      holdBreakNote: "The shield dropped mid-cure. Either the cure was cut short or everyone in the room took the light — usually both.",
    },
    {
      id: "operator-checkin", kind: "select", target: "fhd-dentist-checkin",
      title: "Check in with the operator before the patient is released",
      cue: "Confirm with the dentist that the restoration is finished and the occlusion has been checked.",
      why: "The assistant does not decide that an appointment is over. Checking the occlusion and declaring the restoration finished is the dentist's call under every state practice act, and the check-in is where the assistant hands back what they saw — how much anaesthetic was used, what the patient said, what the tray shows — before anyone sits the patient up and opens the door.",
    },
    {
      id: "chairside-log", kind: "select", target: "fhd-chairside-log",
      title: "Write the chairside record and hand the chair over",
      cue: "Record the instruments, the materials and their lot numbers, and hand the operatory on.",
      why: "The chairside record is what makes this appointment traceable: which lot of bonding agent and composite went into this tooth, how much anaesthetic and of what, what the patient was told afterwards. If a material is recalled or a restoration fails, that record is the only way back to what was actually used — and the next person to work in this room reads the handover to know what state the chair is in.",
    },
  ],

  interrupts: [
    {
      id: "fhd-gag-reflex",
      kind: "Patient distress",
      after: "hve-position", delay: 3, seconds: 12,
      alert: "The patient has started to gag and is reaching up toward your hand with the handpiece still running.",
      cue: "Get the water out of the throat before anything else — the operator can stop cutting.",
      target: "fhd-chair-back",
      why: "A gagging supine patient is at risk of aspirating pooled water and debris, and the fastest safe answer is the chair: bring the back up so the throat is above the floor of the mouth and gravity is working with you instead of against you. Talking a gag down while the pool stays where it is only teaches the patient to fear the chair.",
      missNote: "The gag ran its course with the patient flat, water pooling at the back of the throat and both operators' hands still in the mouth. That is how debris is aspirated, and it is also how a patient decides never to come back — an entirely avoidable outcome that cost a few seconds of chair control.",
      wrongNote: "It is the chair back. Sit the patient up enough to clear the throat first; the suction and the reassurance both work better from there.",
    },
    {
      id: "fhd-cord-across-face",
      kind: "Layout failure",
      after: "transfer-rhythm", delay: 3, seconds: 11,
      alert: "The handpiece cord has been dragged across the patient's face because the mobile stand is parked in the static zone.",
      cue: "The static zone behind the patient's head has to come clear before another cord is moved.",
      target: "fhd-mobile-stand",
      why: "A cord lying across a face is the layout failing, not a one-off. Behind the patient's head is the static zone, kept empty so nothing is ever reached for or routed across the patient; once something is parked there, every cord and every handpiece change goes over the face until it is moved out.",
      missNote: "The cord stayed across the patient's face for the rest of the restoration. A cord that catches on a chin or an ear pulls a running handpiece sideways in the operator's hand, and the patient spent the appointment with a tube resting over their eyes for no reason at all.",
      wrongNote: "It is the mobile stand. Move it out of the static zone and the cord route stops crossing the patient.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, FHD_ACCENT);

    // A vinyl clinic floor and a solid-surface counter top, both from
    // citykit's tiling canvases rather than one flat colour.
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#c8d2d6", base2: "#bfc9ce", seam: "rgba(0,0,0,0.10)",
    }), { repeat: 4, px: 256 });
    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#eef3f5", base2: "#e2e8ec", seam: "rgba(0,0,0,0.07)",
    }), { repeat: 3, px: 256 });

    const floorPlate = slab(g, 5.4, 0.008, 5.4, 0, 0.002, 0, 0xc8d2d6, { radius: 0.05, cast: false });
    floorPlate.material = texturedMat(floorTex, { rough: 0.72, metal: 0.04, color: 0xd6dee2 });

    // ------------------------------------------------------- clock-zone markings
    // The four zones painted on the floor around the patient's head, each its
    // own registered pad so the learner reads the map off the room.
    const ZONES = [
      ["fhd-zone-operator", -1.0, -0.35, "OPERATOR 7–12", FHD_ZONE],
      ["fhd-zone-assistant", 1.0, -0.35, "ASSISTANT 2–4", FHD_ZONE],
      ["fhd-zone-transfer", 0.0, 0.55, "TRANSFER 4–7", FHD_ACCENT],
      ["fhd-zone-static", 0.0, -1.55, "STATIC 12–2", 0x8a94a0],
    ];
    for (const [id, x, z, label, colour] of ZONES) {
      const pad = group(g, x, 0, z);
      const disc = cyl(pad, 0.42, 0.42, 0.006, 0, 0.012, 0, colour, { rough: 0.8, seg: 24, cast: false });
      torus(pad, 0.42, 0.012, 0, 0.016, 0, colour, { emissive: colour, ei: 0.35, rough: 0.6, seg: 6, seg2: 28, cast: false })
        .rotation.x = Math.PI / 2;
      const face = decal(pad, 0.52, 0.12, 0, 0.02, 0.16, signFace(label, { bg: "#1b2a31", accent: "#bfe9f7", scale: 0.42 }), { px: 192 });
      face.rotation.x = -Math.PI / 2;
      holoTag(pad, label, 0, 0.32, 0, { css: "#58b7e0", w: 0.42 });
      reg(hits, disc, id);
    }

    // ------------------------------------------------------------- dental chair
    const chair = group(g, 0, 0, -0.75);
    cyl(chair, 0.22, 0.26, 0.12, 0, 0.06, 0.3, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 18 });
    cyl(chair, 0.07, 0.07, 0.42, 0, 0.3, 0.3, CITY.steel, { rough: 0.3, metal: 0.85, seg: 14 });
    const seatPan = slab(chair, 0.56, 0.13, 1.1, 0, 0.56, 0.05, 0x39505c, { radius: 0.07, rough: 0.6 });
    const chairBack = group(chair, 0, 0.62, -0.62);
    const backPad = slab(chairBack, 0.54, 0.86, 0.16, 0, 0.3, 0, 0x39505c, { radius: 0.07, rough: 0.6 });
    ownMaterial(backPad);
    const headrest = ball(chairBack, 0.13, 0, 0.78, 0.02, 0x39505c, { rough: 0.6, seg: 14 });
    headrest.scale.set(1.45, 0.66, 0.95);
    chairBack.rotation.x = -0.92;
    holoTag(chairBack, "chair back", 0, 0.95, 0, { css: "#58b7e0", w: 0.32 });
    reg(hits, chairBack, "fhd-chair-back");
    for (const sx of [-1, 1]) {
      box(chair, 0.06, 0.05, 0.5, sx * 0.31, 0.63, 0.1, 0x2c3d47, { rough: 0.55 });
    }
    // Bib on the patient's chest, which is what a dropped instrument lands on.
    const bib = slab(chair, 0.38, 0.008, 0.36, 0, 0.72, -0.24, 0xbfe4f2, { radius: 0.02, rough: 0.8, cast: false });
    void bib;

    // The patient, supine in the chair.
    const patient = seatedFigure(chair, 0, 0.58, -0.1, { ry: 0, cloth: 0x6f7f8c, legs: 0x4f5a63 });
    patient.root.rotation.x = -1.02;
    patient.root.position.set(0, 0.62, -0.02);

    // Overhead light on a jointed arm, reaching in from the static side.
    const lightArm = group(g, 0, 0, -1.95);
    cyl(lightArm, 0.05, 0.06, 1.9, 0, 0.95, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 14 });
    const arm1 = cyl(lightArm, 0.025, 0.025, 0.9, 0, 1.88, 0.42, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    arm1.rotation.x = Math.PI / 2;
    const lampHead = group(lightArm, 0, 1.72, 0.88);
    box(lampHead, 0.4, 0.1, 0.24, 0, 0, 0, 0xe8edf0, { rough: 0.3, metal: 0.3 });
    const lampFace = box(lampHead, 0.34, 0.02, 0.2, 0, -0.06, 0, 0xfff6e6, { emissive: 0xfff6e6, ei: 1.1, rough: 0.4, cast: false });
    ownMaterial(lampFace);
    lampHead.rotation.x = 0.45;

    // ----------------------------------------------------------------- stools
    const opStool = group(g, -1.05, 0, -0.3);
    cyl(opStool, 0.24, 0.26, 0.04, 0, 0.03, 0, CITY.darkSteel, { rough: 0.45, metal: 0.55, seg: 18 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      cyl(opStool, 0.022, 0.022, 0.05, Math.cos(a) * 0.2, 0.025, Math.sin(a) * 0.2, 0x16191d, { rough: 0.8, seg: 8 })
        .rotation.z = Math.PI / 2;
    }
    cyl(opStool, 0.035, 0.035, 0.42, 0, 0.25, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 12 });
    const opSeat = cyl(opStool, 0.21, 0.21, 0.09, 0, 0.5, 0, 0x2f6f8c, { rough: 0.7, seg: 20 });
    torus(opStool, 0.16, 0.022, 0, 0.66, -0.16, 0x2f6f8c, { rough: 0.7, seg: 6, seg2: 18 }).rotation.x = 0.4;
    holoTag(opStool, "operator stool", 0, 0.8, 0, { css: "#58b7e0", w: 0.38 });
    reg(hits, opSeat, "fhd-operator-stool");

    const asstStool = group(g, 1.05, 0, -0.3);
    cyl(asstStool, 0.24, 0.26, 0.04, 0, 0.03, 0, CITY.darkSteel, { rough: 0.45, metal: 0.55, seg: 18 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      cyl(asstStool, 0.022, 0.022, 0.05, Math.cos(a) * 0.2, 0.025, Math.sin(a) * 0.2, 0x16191d, { rough: 0.8, seg: 8 })
        .rotation.z = Math.PI / 2;
    }
    const asstColumn = cyl(asstStool, 0.035, 0.035, 0.46, 0, 0.27, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 12 });
    const asstSeatGroup = group(asstStool, 0, 0.54, 0);
    cyl(asstSeatGroup, 0.2, 0.2, 0.09, 0, 0, 0, 0x2f8f8a, { rough: 0.7, seg: 20 });
    torus(asstSeatGroup, 0.17, 0.02, 0, 0.2, 0.06, 0x2f8f8a, { rough: 0.7, seg: 6, seg2: 20 }).rotation.x = 1.15;
    const stoolDial = group(asstStool, 0.17, 0.42, 0.06);
    cyl(stoolDial, 0.055, 0.055, 0.03, 0, 0, 0, CITY.hiVis, { rough: 0.5, metal: 0.3, seg: 16 }).rotation.x = Math.PI / 2;
    box(stoolDial, 0.012, 0.012, 0.09, 0, 0, 0.02, 0x2b3138, { rough: 0.6 });
    holoTag(asstStool, "assistant stool — raise", 0, 0.92, 0, { css: "#58b7e0", w: 0.46 });
    reg(hits, stoolDial, "fhd-stool-dial");
    void asstColumn;

    // --------------------------------------------------------- assistant's cart
    const cart = toolChest(g, 1.5, 0.35, { ry: -0.6, color: FHD_ACCENT });
    const cassette = group(cart, 0, 0.8, 0);
    slab(cassette, 0.44, 0.02, 0.2, 0, 0, 0, FHD_TRAY, { radius: 0.01, rough: 0.4, metal: 0.5 });
    // Three labelled groups on the tray, laid left to right in order of use.
    const TRAY_GROUPS = [
      ["fhd-tray-first", -0.15, "EXAM", 0xdfe8ee],
      ["fhd-tray-second", 0.0, "ANAESTH", 0xf2c14b],
      ["fhd-tray-third", 0.15, "RESTORE", 0x9fd6a8],
    ];
    for (const [id, x, label, colour] of TRAY_GROUPS) {
      const slot = group(cassette, x, 0.02, 0);
      for (let i = 0; i < 3; i++) {
        const shaft = cyl(slot, 0.005, 0.005, 0.15, -0.03 + i * 0.03, 0.008, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 8 });
        shaft.rotation.x = Math.PI / 2;
        ball(slot, 0.008, -0.03 + i * 0.03, 0.01, -0.075, colour, { rough: 0.5, seg: 10 });
      }
      const tag = decal(slot, 0.1, 0.03, 0, 0.002, 0.085, signFace(label, { bg: "#1b2a31", accent: "#bfe9f7", scale: 0.5 }), { px: 96 });
      tag.rotation.x = -Math.PI / 2;
      reg(hits, slot, id);
    }
    holoTag(cassette, "tray — order of use", 0, 0.16, 0, { css: "#58b7e0", w: 0.46 });

    // Mouth mirror used for retraction, with its own registered handle.
    const mirror = group(cart, -0.2, 0.82, 0.14, 0.35);
    const mirrorShaft = cyl(mirror, 0.008, 0.008, 0.15, 0, 0, 0, CITY.steel, { rough: 0.22, metal: 0.9, seg: 8 });
    mirrorShaft.rotation.z = Math.PI / 2;
    const mirrorHead = cyl(mirror, 0.024, 0.024, 0.005, 0.085, 0, 0, 0xdfe8ee, { rough: 0.08, metal: 0.95, seg: 18 });
    mirrorHead.rotation.z = Math.PI / 2;
    holoTag(mirror, "mirror — retraction", 0, 0.1, 0, { css: "#58b7e0", w: 0.42 });
    reg(hits, mirror, "fhd-mirror-retraction");

    // The explorer that gets transferred, and the invisible socket in the
    // transfer zone it has to arrive at.
    const explorer = group(cart, -0.06, 0.82, 0.16, 0.2);
    const explorerShaft = cyl(explorer, 0.006, 0.006, 0.16, 0, 0, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 8 });
    explorerShaft.rotation.z = Math.PI / 2;
    cyl(explorer, 0.001, 0.004, 0.02, 0.09, 0.006, 0, CITY.steel, { rough: 0.15, metal: 0.95, seg: 6 }).rotation.z = 1.1;
    holoTag(explorer, "explorer — to pass", 0, 0.09, 0, { css: "#58b7e0", w: 0.44 });
    reg(hits, explorer, "fhd-explorer");

    const transferSlot = box(g, 0.34, 0.2, 0.3, 0.0, 0.85, -0.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["fhd-transfer-slot"] = transferSlot;

    // The rhythm control on the cart's rail — the pace the pair works to.
    const rhythmRail = group(cart, 0.22, 0.8, -0.1);
    box(rhythmRail, 0.1, 0.03, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const rhythmLamp = box(rhythmRail, 0.07, 0.012, 0.1, 0, 0.022, 0, FHD_ACCENT, { emissive: FHD_ACCENT, ei: 0.4, rough: 0.4, cast: false });
    ownMaterial(rhythmLamp);
    holoTag(rhythmRail, "transfer rhythm", 0, 0.12, 0, { css: "#58b7e0", w: 0.4 });
    reg(hits, rhythmRail, "fhd-transfer-rhythm");

    // A spent carpule and a buckled matrix band, both on the tray.
    const carpule = group(cart, 0.1, 0.82, 0.18, 0.5);
    cyl(carpule, 0.009, 0.009, 0.06, 0, 0, 0, 0xdfe8ee, { rough: 0.15, metal: 0.1, opacity: 0.65, transparent: true, seg: 12 })
      .rotation.z = Math.PI / 2;
    cyl(carpule, 0.008, 0.008, 0.008, 0.024, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.4, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(carpule, "carpule", 0, 0.07, 0, { css: "#58b7e0", w: 0.26 });
    reg(hits, carpule, "fhd-empty-carpule");

    const band = group(cart, 0.2, 0.82, 0.2, -0.3);
    const bandStrip = box(band, 0.05, 0.002, 0.012, 0, 0, 0, 0xcfd6db, { rough: 0.3, metal: 0.7 });
    bandStrip.rotation.z = 0.35;
    box(band, 0.02, 0.002, 0.012, 0.03, 0.006, 0, 0xcfd6db, { rough: 0.3, metal: 0.7 }).rotation.z = -0.7;
    holoTag(band, "matrix band", 0, 0.07, 0, { css: "#58b7e0", w: 0.32 });
    reg(hits, band, "fhd-bent-band");

    // ------------------------------------------------------ suction and syringe
    const deliveryArm = group(g, 1.28, 0, -1.15, -0.5);
    box(deliveryArm, 0.34, 0.1, 0.3, 0, 0.86, 0, 0x53585e, { rough: 0.45, metal: 0.4 });
    cyl(deliveryArm, 0.04, 0.045, 0.86, 0, 0.43, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 12 });
    const hveHolder = box(deliveryArm, 0.1, 0.06, 0.08, -0.13, 0.94, 0.06, 0x3a4048, { rough: 0.5 });
    void hveHolder;
    hose(deliveryArm, [[-0.13, 0.95, 0.06], [-0.5, 0.86, 0.12], [-0.85, 0.82, -0.05]], 0.014, 0xd7dce1, { steps: 12, rough: 0.5 });
    const hveTip = group(g, 0.42, 0.83, -0.62, 0.6);
    cyl(hveTip, 0.011, 0.013, 0.14, 0, 0, 0, 0xe8edf0, { rough: 0.3, metal: 0.2, seg: 12 }).rotation.z = 1.0;
    cyl(hveTip, 0.011, 0.011, 0.03, 0.07, 0.045, 0, 0xbfe4f2, { rough: 0.2, metal: 0.1, opacity: 0.7, transparent: true, seg: 12 })
      .rotation.z = 1.0;
    holoTag(hveTip, "HVE tip", 0, 0.14, 0, { css: "#58b7e0", w: 0.28 });
    reg(hits, hveTip, "fhd-hve-tip");

    const airWater = group(deliveryArm, 0.13, 0.96, 0.05, 0.3);
    cyl(airWater, 0.012, 0.012, 0.2, 0, 0.05, 0, 0xdfe4e8, { rough: 0.3, metal: 0.3, seg: 10 }).rotation.x = 0.6;
    box(airWater, 0.03, 0.03, 0.05, 0, -0.03, -0.02, 0x8b929a, { rough: 0.4, metal: 0.4 });
    holoTag(airWater, "air-water syringe", 0, 0.2, 0, { css: "#58b7e0", w: 0.44 });
    reg(hits, airWater, "fhd-air-water");

    // Curing light and the shield that goes with it.
    const cureLight = instrument(deliveryArm, -0.02, 0.98, -0.1, { ry: 0.4, idle: "CURE", color: FHD_ACCENT });
    void cureLight;
    const shield = group(g, 0.85, 0, 0.1, -0.4);
    cyl(shield, 0.012, 0.012, 0.5, 0, 0.55, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 10 });
    const shieldPane = slab(shield, 0.26, 0.2, 0.006, 0, 0.84, 0, 0xf2a83c, { radius: 0.02, rough: 0.25, opacity: 0.55, transparent: true });
    ownMaterial(shieldPane);
    holoTag(shield, "cure shield", 0, 1.0, 0, { css: "#58b7e0", w: 0.32 });
    reg(hits, shield, "fhd-cure-shield");

    // ---------------------------------------------------------- fulcrum marker
    const fulcrum = group(g, -0.42, 0.8, -0.58);
    torus(fulcrum, 0.05, 0.008, 0, 0, 0, CITY.good, { emissive: CITY.good, ei: 0.5, rough: 0.5, seg: 6, seg2: 18, cast: false })
      .rotation.x = -0.9;
    ball(fulcrum, 0.014, 0, 0, 0, CITY.good, { emissive: CITY.good, ei: 0.4, rough: 0.5, seg: 10, cast: false });
    holoTag(fulcrum, "finger rest", 0, 0.14, 0, { css: "#59c97b", w: 0.32 });
    reg(hits, fulcrum, "fhd-fulcrum");

    // ---------------------------------------------------------------- hazards
    // An instrument caught mid-pass across the patient's face.
    const overFace = group(g, 0, 1.12, -1.2);
    const strayShaft = cyl(overFace, 0.005, 0.005, 0.14, 0, 0, 0, CITY.alert, { rough: 0.3, metal: 0.6, seg: 8 });
    strayShaft.rotation.z = Math.PI / 2.2;
    holoTag(overFace, "pass over the face", 0, 0.12, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, overFace, "fhd-pass-over-face");

    // The tip pulled down into the floor of the mouth.
    const tipOnTissue = group(g, -0.16, 0.78, -1.02);
    ball(tipOnTissue, 0.022, 0, 0, 0, 0xc0655f, { rough: 0.7, seg: 12 });
    holoTag(tipOnTissue, "tip on soft tissue", 0, 0.1, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, tipOnTissue, "fhd-tip-on-tissue");

    // A scaler balanced on the tray edge — released before a grip was taken.
    const looseInstrument = group(cart, 0.26, 0.81, 0.02, 0.8);
    const looseShaft = cyl(looseInstrument, 0.006, 0.006, 0.15, 0, 0, 0, CITY.alert, { rough: 0.3, metal: 0.7, seg: 8 });
    looseShaft.rotation.z = Math.PI / 2;
    looseShaft.rotation.x = 0.3;
    holoTag(looseInstrument, "released early", 0, 0.08, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, looseInstrument, "fhd-unsupported-pass");

    // The mobile stand parked in the static zone, and the cord it drags.
    const mobileStand = group(g, 0.18, 0, -1.62, 0.3);
    cyl(mobileStand, 0.2, 0.22, 0.04, 0, 0.03, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 16 });
    cyl(mobileStand, 0.026, 0.026, 0.82, 0, 0.44, 0, CITY.steel, { rough: 0.35, metal: 0.85, seg: 12 });
    const standTop = slab(mobileStand, 0.34, 0.025, 0.26, 0, 0.88, 0, 0x8d959d, { radius: 0.01, rough: 0.45, metal: 0.4 });
    for (let i = 0; i < 3; i++) box(mobileStand, 0.05, 0.03, 0.18, -0.1 + i * 0.1, 0.91, 0, 0xdfe4e8, { rough: 0.6 });
    const standCord = hose(mobileStand, [[0, 0.88, 0.1], [-0.2, 0.95, 0.5], [-0.05, 1.0, 0.95]], 0.011, 0xe0655f, { steps: 12, rough: 0.6 });
    holoTag(mobileStand, "stand in the static zone", 0, 1.06, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, mobileStand, "fhd-blocked-static-zone");
    void standTop;

    // The stand's own hit id is taken by the hazard, so the interruption's
    // answer gets its own invisible marker beside it.
    const standMove = box(g, 0.4, 0.5, 0.36, 0.18, 0.5, -1.62, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, standMove, "fhd-mobile-stand");

    // --------------------------------------------------------- counter and sink
    const counterRun = group(g, -2.3, 0, -1.3, 0.25);
    box(counterRun, 1.5, 0.86, 0.58, 0, 0.43, 0, 0xd2d8dd, { rough: 0.55, metal: 0.1 });
    const counterTop = slab(counterRun, 1.56, 0.045, 0.62, 0, 0.88, 0, 0xffffff, { radius: 0.012, rough: 0.5 });
    counterTop.material = texturedMat(topTex, { rough: 0.48, metal: 0.05, color: 0xffffff });
    for (let i = 0; i < 3; i++) {
      box(counterRun, 0.46, 0.24, 0.02, -0.5 + i * 0.5, 0.62, 0.3, 0xc4ccd2, { rough: 0.5 });
      box(counterRun, 0.14, 0.02, 0.02, -0.5 + i * 0.5, 0.62, 0.32, 0x8d959d, { rough: 0.3, metal: 0.8 });
    }
    cyl(counterRun, 0.16, 0.16, 0.14, -0.52, 0.86, 0, 0xdfe4e8, { rough: 0.25, metal: 0.3, seg: 18, open: true, side: 2 });
    cyl(counterRun, 0.018, 0.018, 0.3, -0.52, 1.03, -0.16, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = -0.35;

    const chairsideLog = decal(counterRun, 0.3, 0.36, 0.42, 0.905, 0.02,
      paperFace("CHAIRSIDE RECORD", ["Materials + lot numbers", "Anaesthetic: agent / amount", "Post-op instructions given"], { band: "#58b7e0" }), { px: 256 });
    chairsideLog.rotation.x = -Math.PI / 2;
    holoTag(counterRun, "chairside record", 0.42, 1.05, 0.02, { css: "#58b7e0", w: 0.44 });
    reg(hits, chairsideLog, "fhd-chairside-log");

    // Wall cabinets over the counter, and consumables on open shelving.
    for (let i = 0; i < 3; i++) {
      box(counterRun, 0.5, 0.6, 0.32, -0.5 + i * 0.5, 1.7, -0.14, 0xe4e9ec, { rough: 0.55 });
      box(counterRun, 0.46, 0.54, 0.02, -0.5 + i * 0.5, 1.7, 0.03, 0xd2d8dd, { rough: 0.45 });
      box(counterRun, 0.12, 0.018, 0.018, -0.5 + i * 0.5, 1.46, 0.045, 0x8d959d, { rough: 0.3, metal: 0.8 });
    }
    const shelfUnit = group(g, 2.5, 0, -1.5, -0.5);
    for (const sx of [-1, 1]) box(shelfUnit, 0.05, 1.7, 0.6, sx * 0.48, 0.85, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_ROWS = [[0.42, "GLOVES", 0x2f7d4a], [0.86, "BIBS", 0xbfe4f2], [1.3, "MATRIX", 0xf2c14b]];
    for (const [y, label, colour] of SHELF_ROWS) {
      box(shelfUnit, 1.0, 0.025, 0.56, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelfUnit, 0.26, 0.15, 0.22, i * 0.33, y + 0.09, 0, colour, { rough: 0.7 });
        decal(shelfUnit, 0.2, 0.05, i * 0.33, y + 0.09, 0.115, signFace(label, { bg: "#1f262b", accent: "#bfe9f7", scale: 0.42 }), { px: 96 });
      }
    }
    holoTag(shelfUnit, "Consumables", 0, 1.76, 0, { css: "#58b7e0", w: 0.4 });

    // A lidded waste bin and a sharps unit on the wall, part of the room.
    const bin = group(g, -2.4, 0, 0.6);
    cyl(bin, 0.15, 0.13, 0.36, 0, 0.18, 0, 0x53585e, { rough: 0.55, metal: 0.3, seg: 16 });
    cyl(bin, 0.16, 0.16, 0.03, 0, 0.37, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 16 });
    box(bin, 0.09, 0.015, 0.06, 0, 0.386, 0.02, 0x2b2e33, { rough: 0.6 });

    const sharps = group(g, 2.45, 0, 0.35, -0.7);
    box(sharps, 0.28, 0.34, 0.22, 0, 1.06, 0, 0xd8342a, { rough: 0.6 });
    box(sharps, 0.3, 0.05, 0.24, 0, 1.26, 0, 0xf2e9c9, { rough: 0.55 });
    decal(sharps, 0.24, 0.13, 0, 1.08, 0.112, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.4 }), { px: 160 });

    // --------------------------------------------------------- the dentist and
    // the assisting student, both standing clear of every control.
    const dentist = standingFigure(g, -2.15, 1.55, { ry: 1.4, cloth: 0x2f5f70, skin: 0xd3a37d });
    holoTag(dentist, "the dentist", 0, 1.8, 0, { css: "#58b7e0", w: 0.34 });
    // The figure's own group is already registered as scenery, so the check-in
    // target is a marker parented to it: a second reg() on the figure would
    // overwrite its first hit id, and a marker standing beside it would read as
    // furniture the figure is standing inside.
    const dentistMark = box(dentist, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, dentistMark, "fhd-dentist-checkin");

    const student = standingFigure(g, 2.35, 1.45, { ry: -2.3, cloth: 0x4a7f7a, skin: 0xa26d48 });
    holoTag(student, "assisting student", 0, 1.78, 0, { css: "#58b7e0", w: 0.42 });

    // The zone diagram on the wall, so the map is in the room as well as on
    // the floor.
    const panel = holoPanel(g, 0.72, 0.5, -1.2, 1.55, -2.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,20,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#58b7e0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#bfe9f7";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("OPERATORY 2 — FOUR-HANDED", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Operator 7–12 · Assistant 2–4", "Transfer 4–7 · Static 12–2 (clear)",
       "Assistant stool 4–6 in above operator", "Every pass below the chin"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.34 + i * 0.16));
      });
    }, { accent: FHD_ACCENT });
    void panel;

    // Ceiling fittings, so the room has a top to it.
    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.2, 0.06, 0.34, i * 1.1, 2.62, -1.0, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.08, 0.02, 0.26, i * 1.1, 2.585, -1.0, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.55, rough: 0.4, cast: false });
    }

    const key = new THREE.DirectionalLight(0xfff4e8, 0.85);
    key.position.set(-2.4, 4.6, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xf4fbff, 0x5d6a72, 0.9));

    const spray = particles(g, 24, 0xd7ecf5, { size: 0.01, life: 0.4, additive: false, opacity: 0.45 });
    let suctionOn = false, curing = false, gagging = false, cordAcross = true;
    const standHome = mobileStand.position.clone();
    const backHome = chairBack.rotation.x;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.0, -0.7),

      onStep(step) {
        suctionOn = step.id === "hve-position";
        curing = step.id === "cure-hold";
      },

      onStepComplete(step) {
        if (step.id === "stool-height") asstSeatGroup.position.y = 0.68;
        if (step.id === "tray-order") {
          repaint(chairsideLog, paperFace("CHAIRSIDE RECORD", ["Tray: exam / anaesth / restore", "Materials + lot numbers", "Post-op instructions given"], { band: "#58b7e0" }));
        }
        if (step.id === "transfer-pass") {
          explorer.parent.remove(explorer);
          chair.add(explorer);
          explorer.position.set(0, 0.8, -0.28);
          explorer.rotation.set(0, 0.4, 0);
        }
        if (step.id === "tray-faults") { carpule.visible = false; band.visible = false; }
        if (step.id === "cure-hold") shieldPane.material.emissiveIntensity = 0.0;
        if (step.id === "operator-checkin") dentist.rotation.y = 0.9;
      },

      onInterrupt(it) {
        if (it.id === "fhd-gag-reflex") {
          gagging = true;
          patient.head.rotation.x = -0.22;
          backPad.material.emissive.set(CITY.alert);
          backPad.material.emissiveIntensity = 0.8;
        }
        if (it.id === "fhd-cord-across-face") {
          cordAcross = true;
          standCord.visible = true;
          standCord.position.y = 0.06;
          mobileStand.position.set(standHome.x - 0.1, standHome.y, standHome.z + 0.18);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fhd-gag-reflex") {
          gagging = false;
          patient.head.rotation.x = 0;
          backPad.material.emissiveIntensity = 0;
          chairBack.rotation.x = backHome + 0.38;
        }
        if (it.id === "fhd-cord-across-face") {
          cordAcross = false;
          standCord.visible = false;
          mobileStand.position.set(standHome.x + 0.95, standHome.y, standHome.z + 0.45);
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (!gagging) patient.head.rotation.y = Math.sin(t * 0.7) * 0.05;
        lampFace.material.emissiveIntensity = 1.0 + Math.sin(t * 0.8) * 0.06;
        spray.visible = suctionOn && !!session?.holding;
        if (spray.visible) spray.userData.step(dt, new THREE.Vector3(0.3, 0.85, -0.7), 0.08, 0.5, -1.2);
        if (curing) shieldPane.material.emissiveIntensity = 0.3 + Math.sin(t * 5) * 0.2;
        const tr = session?.track;
        if (tr && session.step?.id === "transfer-rhythm") {
          const inBand = tr.v >= 0.36 && tr.v <= 0.6;
          rhythmLamp.material.emissive.set(inBand ? CITY.good : CITY.alert);
          rhythmLamp.material.emissiveIntensity = 0.5 + (inBand ? 0.5 : 1.0) * Math.abs(Math.sin(t * 3));
        }
        void cordAcross;
      },
    };
  },
};
