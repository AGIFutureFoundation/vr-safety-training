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

// SmartCiti.X~ Implant Surgery Assisting VR — Dental & Oral Health, station two
// hundred and twelve. The surgical assistant's side of a single-fixture implant
// placement: the field laid sterile and kept that way, the drill kit handed up
// in the sequence the manufacturer published, chilled irrigant reaching the bur
// every second it is cutting, the seating torque read off the wrench rather than
// guessed at, graft material handled once, and the patient sent home able to
// recognise the early signs that an implant is failing around its neck.
//
// Sited generically. Nothing here names a real surgeon, a real practice or a
// clause number the registry is not sure of.

const ISA_ACCENT = 0x58c0a8;
const ISA_STEEL = 0x9aa6ac;
const ISA_DRAPE = 0x2f7f8c;
const ISA_CABINET = 0xeaf0f2;
const ISA_TRAY = 0x1f5d68;

export const SIM_IMPLANT_SURGERY_ASSISTING = {
  id: "implant-surgery-assisting",
  index: "212",
  domain: "Oral and maxillofacial surgery",
  trade: "Dental assistant — surgical assisting (DANB Certified Oral and Maxillofacial Surgery Assistant), SEIU and UFCW clinic and dental staff",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "DANB's Certified Oral and Maxillofacial Surgery Assistant credential and the general chairside and infection-control components behind it; AAOMS guidance on the office-based surgical and anaesthesia team; the state dental practice act, which sets what a surgical assistant may place, cut or record and what only the operating dentist may; SEIU and UFCW clinic and dental staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings on surgical asepsis, sterile irrigant and instrument sterilisation; OSHA 29 CFR 1910.1030 bloodborne pathogens and 29 CFR 1910.132 personal protective equipment; NFPA 99 for the medical gas and surgical vacuum this operatory runs on",
  name: "Implant Surgery Assisting",
  title: simTitle("Implant Surgery Assisting"),
  tagline: "A single-fixture implant placement from the assistant's side: sterile field, kit sequence, chilled irrigation, a torque you can read, graft handled once, and a patient who leaves knowing what failure looks like",
  accent: ISA_ACCENT,
  accentCss: "#58c0a8",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "sterile-placement", name: "Sterile Placement", note: "A fixture placed with the field unbroken, the kit in sequence and the seating torque read off the wrench" },

  game: system({
    name: "Surgical Field",
    currency: "TORQ",
    ranks: ["Chairside Assistant", "Surgical Assistant", "Sterile Field Lead", "Implant Coordinator", "Surgery Certified"],
    badges: [
      { id: "field-unbroken", name: "Field Unbroken", note: "Nothing unsterile reached for across the whole placement", test: AWARD.safe },
      { id: "torque-read", name: "Torque Read", note: "Irrigation and seating torque both held near band centre", test: AWARD.precise(0.72) },
      { id: "kit-in-order", name: "Kit In Order", note: "The drill sequence handed up in the published order, first time", test: AWARD.stepClean("drill-sequence") },
    ],
    challenges: [
      { id: "theatre-pace", name: "Theatre Pace", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-corrections", name: "No Corrections", note: "A placement with no corrections at all", test: AWARD.clean },
      { id: "scrubbed-streak", name: "Scrubbed Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "unwrapped-abutment": "That healing abutment is lying on the open counter with its wrapper already off and nothing over it. An implant component is a sterile item until the moment its package is opened onto a sterile field, and one that has sat in room air beside a sink is going into a surgical wound carrying whatever settled on it — the CDC's dental infection-control guidance treats surgical items as a separate class from everything else in the operatory for exactly this reason.",
    "reused-drill": "That is the drill from the case before this one, back in the tray with its wear marks on it. Implant drills are cutting instruments with a manufacturer-stated number of osteotomies in them, and a dull drill does not fail cleanly: it burnishes and heats bone instead of cutting it, and overheated bone at the fixture wall is exactly the tissue that fails to integrate months later.",
    "tap-water-bottle": "That bottle is ordinary operatory water, not sterile irrigant. Bone cutting is irrigated with sterile saline because the osteotomy is an open surgical wound, and dental unit water — held to a bacterial ceiling for routine treatment, not to sterility — has no business inside one. Reaching for it turns an implant site into an inoculation site.",
    "uncapped-syringe": "The local anaesthetic syringe is lying on the bracket with the needle bare. An uncapped needle on a tray somebody is reaching across all appointment is the commonest percutaneous injury in dentistry, and it is the injury OSHA 29 CFR 1910.1030 asks employers to engineer out rather than train around — the sheath goes back on with a one-handed technique the moment the injection is finished.",
  },

  lateNotes: {
    "torque-ratchet": "The ratchet comes up when the osteotomy is finished and the fixture is ready to seat, not while the drills are still cutting.",
    "graft-packet": "Graft material is opened after the fixture is seated and the defect is actually visible — opened early, it sits drying on the field.",
    "postop-card": "Post-operative instructions are given once the surgery is finished, to a patient who can listen to them.",
  },

  steps: [
    {
      id: "case-plan", kind: "select", target: "case-plan",
      title: "Read the surgical plan and the consent before anything is opened",
      cue: "Read the planned site, the fixture size and the medical history off the plan, and check the consent is signed.",
      why: "The plan is where the fixture diameter, the length and the planned drill sequence live, and the history beside it is where an antiresorptive drug, an anticoagulant or uncontrolled diabetes shows up — all three change what happens at this chair rather than what happens afterwards. Opening a sterile kit before anyone has read which fixture the surgeon intends to place means opening a second one when the plan turns out to say something else, and the consent is what makes the whole appointment lawful in the first place.",
    },
    {
      id: "setup-check", kind: "find", noHint: true,
      targets: ["pouch-breach", "expired-graft", "dull-drill"],
      itemNames: {
        "pouch-breach": "the sterilisation pouch with a broken seal",
        "expired-graft": "the graft packet past its expiry",
        "dull-drill": "the drill past its stated osteotomy count",
      },
      itemNotes: {
        "pouch-breach": "The seal on this pouch has lifted along one edge. A pouch that is not intact is not sterile, whatever the indicator strip inside it turned, and it goes back through reprocessing rather than onto the field.",
        "expired-graft": "This graft packet's date has passed. Expiry on a bone substitute is a statement about the material and its packaging, not a formality — past it nobody can say what is in the vial or whether the barrier held.",
        "dull-drill": "The wear marks on this drill say it has already cut its stated number of osteotomies. Manufacturers count them because cutting efficiency falls off a cliff, and the heat that replaces cutting is what kills bone at the fixture wall.",
      },
      title: "Walk the setup before the first package is opened",
      cue: "Three items on this setup cannot go on a surgical field. Find them by looking.",
      why: "None of these three announce themselves once the case has started: a lifted pouch seal looks like a sealed pouch from a metre away, an out-of-date graft vial looks exactly like an in-date one, and a worn drill still spins. Every one of them is cheap to catch now and expensive to catch later, because the moment the field is laid and the surgeon is gloved, the only way to replace a contaminated or wrong item is to break the field and start that part again.",
    },
    {
      id: "scrub-sequence", kind: "sequence",
      targets: ["cap-mask", "scrub-sink", "sterile-gloves"],
      itemNames: { "cap-mask": "surgical cap and mask", "scrub-sink": "the surgical hand scrub", "sterile-gloves": "the sterile glove pack" },
      title: "Cap and mask, surgical scrub, then sterile gloves",
      cue: "Cap and mask on first, then the surgical hand scrub, and only then open the sterile gloves.",
      why: "The order is the whole point. Cap and mask go on before the hands are clean because putting them on afterwards means touching your own face and hair with scrubbed hands; the surgical scrub is longer and reaches higher than a routine hand wash because this is a surgical procedure rather than a restorative one; and the sterile gloves are opened last, onto hands that have nothing left on them, so the outside of the glove is the barrier the CDC's surgical-asepsis guidance assumes it is.",
      outOfOrderNote: "Wrong order — cap and mask before the scrub, and the sterile gloves last of all. Gloving before scrubbing puts a sterile barrier over hands that were never prepared.",
    },
    {
      id: "drape-field", kind: "select", target: "sterile-drape",
      title: "Lay the sterile field and set the tray in reach",
      cue: "Lay the sterile drape over the tray and set the kit out where the surgeon's hand will go.",
      why: "A sterile field is a defined area, not a general intention: the drape marks where sterile items may sit, and anything that leaves it or hangs below the table edge has left it for good. Laying it out so the instruments sit under the surgeon's own hand is what stops the pass turning into a reach across the field, and a reach across a field is how most avoidable breaks in asepsis actually happen in a small operatory.",
    },
    {
      id: "irrigation-set", kind: "gauge", target: "irrigation-dial",
      title: "Set the chilled sterile irrigant flow",
      cue: "Set the irrigation flow for this drill sequence, then commit the reading.",
      why: "Irrigation is not a courtesy here — it is the only thing carrying the heat of a cutting bur out of the osteotomy, and bone begins to die irreversibly a few degrees above body temperature. Too little flow and the fixture wall is cooked before the drill is withdrawn; too much and the surgeon is working in a flooded site they cannot see into. Chilled sterile saline at the published rate is what lets a drill cut bone that will still be alive to integrate with the implant.",
      gauge: {
        label: "IRRIGANT FLOW", speed: 0.8, green: [0.34, 0.58],
        readout: (t) => (t < 0.34 ? "too little — bone will heat" : t > 0.58 ? "flooded — no view" : `${Math.round(40 + t * 60)} mL/min`),
        missNote: "Outside the flow this sequence calls for. Read the drill manufacturer's own figure off the kit lid rather than setting it by the sound of the pump.",
      },
    },
    {
      id: "retract-hold", kind: "hold", target: "retractor", seconds: 9,
      title: "Hold retraction and suction clear of the osteotomy",
      cue: "Hold the retractor steady and keep the suction tip off the bone while the surgeon cuts.",
      why: "Two jobs at once, and both of them are about what the surgeon can see. The retractor holds the flap and the cheek out of a line of sight a few millimetres wide, and the suction tip stays near the site but never on it, because suction placed on cut bone strips away the blood clot and the bone chips that the site needs. Let the retraction drift and the flap falls into a spinning bur; park the suction on the crest and the osteotomy dries out under it.",
      holdBreakNote: "The retraction dropped while the bur was still turning. Reseat it and hold — soft tissue falling into a cutting drill is a laceration the patient feels for weeks.",
    },
    {
      id: "drill-sequence", kind: "sequence",
      targets: ["pilot-drill", "drill-32", "drill-38"],
      itemNames: { "pilot-drill": "the pilot drill", "drill-32": "the 3.2 mm twist drill", "drill-38": "the 3.8 mm final drill" },
      title: "Hand up the drill sequence in the published order",
      cue: "Pilot drill first, then the intermediate, then the final drill for this fixture diameter.",
      why: "An osteotomy is widened in small published steps because each drill only has to remove a thin ring of bone: skip a diameter and the next drill takes a bite it was never designed for, which chatters, over-widens the site and leaves the fixture without the primary stability it needs to stay still while it integrates. The sequence on the kit lid belongs to the implant system in front of you, and it is the manufacturer's labelled instruction for an FDA-cleared device rather than a suggestion the room may improve on.",
      outOfOrderNote: "Out of sequence — pilot, then intermediate, then final. Jumping a diameter over-widens the osteotomy and costs the fixture its primary stability.",
    },
    {
      id: "seat-fixture", kind: "turn", target: "torque-ratchet",
      title: "Seat the fixture with the ratchet",
      cue: "Turn the ratchet to carry the fixture down into the osteotomy under the surgeon's hand.",
      why: "The fixture is threaded into bone slowly and by hand, because the feel of the thread engaging is the only live information anybody has about the quality of the bone it is cutting into. Driving it fast with a motor removes that feedback and can strip the thread in soft bone, and a stripped osteotomy has no way of holding the implant still. The ratchet's job is to turn the fixture, never to force it: resistance that suddenly climbs means the site needs reassessing, not a longer lever.",
      turn: { turns: 1.5, axis: "y", label: "SEATING RATCHET" },
    },
    {
      id: "torque-read", kind: "track", target: "torque-wrench", seconds: 10,
      title: "Read the seating torque back to the surgeon",
      cue: "Hold the wrench in the band and read the seating torque back out loud as it climbs.",
      why: "Seating torque is the number that goes in the record and the number that decides what happens next: too little and the fixture is not stable enough to be loaded or to carry a healing abutment, too much and the bone at the fixture wall is being crushed rather than compressed, which shows up as crestal bone loss months afterwards. The assistant reading the wrench aloud is how the value actually reaches the operator's ears while their eyes are still in the field, and it is the reading that gets written down rather than an impression of how tight it felt.",
      track: {
        start: 0.1, green: [0.36, 0.6], rise: 0.52, fall: 0.44, drift: 0.12, label: "SEATING TORQUE",
        readout: (v) => (v < 0.36 ? "under — not stable" : v > 0.6 ? "over — crushing bone" : `${Math.round(20 + v * 40)} Ncm`),
      },
      holdBreakNote: "The wrench went outside the band. Bring it back and read it again — a torque figure nobody held steady is a figure nobody can put in the record.",
    },
    {
      id: "graft-place", kind: "drag", target: "graft-packet",
      title: "Take the graft to the mixing well",
      cue: "Carry the graft packet to the sterile mixing well and open it there, not over the tray.",
      why: "Particulate graft is opened into a well on the sterile field and hydrated there, so that the material stays contained and the surgeon can pick it up in one motion instead of chasing granules across a drape. Opened anywhere else it scatters, and scattered graft is both waste and a contamination route — every granule that lands off the field is one somebody is tempted to pick up again. The packet is handled once, by one pair of gloves, and what comes out of it goes straight into the defect.",
      drag: { to: "graft-well", radius: 0.45, missNote: "Not in the well. Graft opened over the tray scatters, and granules off the field cannot go into the wound." },
    },
    {
      id: "postop-brief", kind: "select", target: "postop-card",
      title: "Give the post-operative instructions",
      cue: "Go through the written post-operative instructions with the patient before they get up.",
      why: "Most of what decides whether this site heals happens in the next seventy-two hours, at home, with nobody watching: firm pressure rather than repeated peeking at the gauze, cold on the outside for the first day, no rinsing or spitting hard enough to disturb the clot, no smoking and no drinking through a straw, and the analgesic and any antimicrobial taken as written. Instructions given in writing as well as out loud are the ones a patient can still follow that evening, when the local has worn off and they cannot remember what was said.",
    },
    {
      id: "warning-signs", kind: "find", noHint: true,
      targets: ["sign-swelling", "sign-bleeding", "sign-mobility"],
      itemNames: {
        "sign-swelling": "swelling and discharge around the implant neck",
        "sign-bleeding": "bleeding on gentle probing at the collar",
        "sign-mobility": "any movement of the implant itself",
      },
      itemNotes: {
        "sign-swelling": "Puffy, red tissue around the collar with pus coming from it is the picture of peri-implantitis rather than ordinary post-operative soreness — it is a reason to be seen, not a reason to wait and see.",
        "sign-bleeding": "An implant collar that bleeds when it is touched gently is inflamed. Bleeding on probing is the earliest sign anybody can teach a patient to notice at home with a soft brush.",
        "sign-mobility": "An integrated implant does not move at all. Any movement the patient can feel is a failure of integration and needs the surgeon the same week, not at the next recall.",
      },
      title: "Teach the peri-implantitis warning signs off the chart",
      cue: "Point out the three things on the chart that mean this patient calls the practice rather than waiting.",
      why: "An implant does not ache the way a tooth does, and that is the problem: disease around the collar can progress a long way with very little pain, so the patient's own eyes and a soft brush are the early warning system. Swelling with discharge, bleeding when the collar is touched and any movement at all are the three findings worth teaching, because each of them means the tissue or the bone around the fixture is being lost and every week of waiting costs bone that does not come back.",
    },
    {
      id: "team-checkin", kind: "select", target: "team-checkin",
      title: "Check in with the surgical team before breaking down",
      cue: "Check in with the surgeon and the circulating assistant: counts, specimen, anything that felt off.",
      why: "A surgical case ends with a conversation, not with the last suture. The sharps and instrument counts get said out loud, the fixture and graft lot numbers get confirmed by two people rather than one, and anybody who saw something they were not happy about — a glove that brushed a light handle, a drill that sounded wrong — says it now while it can still be written down and acted on. A team that only debriefs after a bad outcome never learns from the cases that nearly went wrong.",
    },
    {
      id: "implant-log", kind: "select", target: "implant-log",
      title: "Write the implant record and hand over",
      cue: "Log the fixture lot and size, the seating torque, the graft lot and the sterilisation load, then hand over.",
      why: "This record is what anybody treating this implant in ten years has to work from, and half of it cannot be reconstructed later: the fixture's manufacturer, diameter, length and lot number, the torque it actually seated at, the graft lot in the defect and the sterilisation load number for the kit used. Lot numbers are what make a manufacturer's recall reach the handful of patients it concerns, and the handover to whoever is watching this patient in recovery is what stops a bleeding point being noticed by nobody.",
    },
  ],

  interrupts: [
    {
      id: "irrigant-dry",
      kind: "Equipment fault",
      after: "retract-hold", delay: 3, seconds: 12,
      alert: "The irrigation line has stopped running clear and the reservoir has emptied — the bur is cutting bone with nothing cooling it.",
      cue: "No irrigant reaching the bur — the reservoir is empty.",
      target: "saline-reservoir",
      why: "A cutting bur with no irrigant turns into a heater within seconds, and bone a few degrees above body temperature dies whether or not it looks any different when the drill comes out. The reservoir is the fix, and it has to be a fresh sterile bag rather than a top-up from whatever is nearest.",
      missNote: "The drill kept cutting dry. Nothing visible happens at the time, which is the trap — the damage is a ring of dead bone at the fixture wall that shows up months later as an implant that never integrated.",
      wrongNote: "It is the sterile irrigant reservoir. Restoring the coolant is the only thing that stops bone being heated, and no adjustment at the pump makes an empty bag deliver.",
    },
    {
      id: "suction-overflow",
      kind: "Contamination risk",
      after: "torque-read", delay: 3, seconds: 12,
      alert: "The surgical suction canister is full to its float and has stopped pulling — fluid is backing up the line toward the field.",
      cue: "The suction canister is full and the line is backing up.",
      target: "suction-canister",
      why: "A full canister does not simply stop working: the float shuts the vacuum off and what is already in the line has somewhere to go, which is back down the tubing toward the tip lying on a sterile field. Changing the canister is a two-second job and the only one that restores suction without carrying contaminated fluid across the drape.",
      missNote: "The canister was left on its float. Fluid backing out of a suction line onto the field contaminates it, and a field that has been contaminated has to be re-laid mid-case with an open wound waiting on it.",
      wrongNote: "It is the suction canister. Nothing at the chair restores vacuum while the float is up, and the longer it sits the further back up the line the fluid travels.",
    },
  ],

  supportLine: "If a case leaves you shaken, your union's member assistance programme — SEIU and UFCW both run confidential counselling lines for clinic staff — will talk it through with you, and the call is not reported to the practice.",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.3, ISA_ACCENT);

    // A solid-surface worktop texture for the two large flat surfaces in the
    // room — the back table and the sterilisation counter.
    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#e9eff1", base2: "#dee5e8", seam: "rgba(0,0,0,0.07)",
    }), { repeat: 3, px: 256 });

    // ----------------------------------------------------------- surgical chair
    const chairBase = group(g, 0, 0, -1.05);
    cyl(chairBase, 0.24, 0.28, 0.1, 0, 0.05, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    cyl(chairBase, 0.09, 0.1, 0.4, 0, 0.3, 0, ISA_STEEL, { rough: 0.35, metal: 0.75, seg: 16 });
    const seatGroup = group(chairBase, 0, 0.5, 0);
    slab(seatGroup, 0.62, 0.14, 0.68, 0, 0, 0.3, ISA_TRAY, { radius: 0.07, rough: 0.6 });
    const chairBack = group(seatGroup, 0, 0.05, -0.2);
    slab(chairBack, 0.6, 0.92, 0.14, 0, 0.42, 0, ISA_TRAY, { radius: 0.07, rough: 0.6 });
    chairBack.rotation.x = 0.46;
    slab(chairBack, 0.34, 0.24, 0.1, 0, 1.0, 0.02, ISA_TRAY, { radius: 0.06, rough: 0.6 });
    for (const sx of [-1, 1]) {
      slab(seatGroup, 0.1, 0.06, 0.6, sx * 0.34, 0.09, 0.3, ISA_STEEL, { radius: 0.02, rough: 0.4, metal: 0.6 });
    }
    const patient = seatedFigure(seatGroup, 0, 0.08, 0.44, { skin: 0xc48a63, cloth: 0x86a2ad });
    patient.root.rotation.x = 0.46;
    patient.torso.rotation.x = -0.02;

    // The draped surgical site over the patient's chest and face, with the
    // osteotomy marked on the working end.
    const drapeSheet = slab(seatGroup, 0.56, 0.02, 0.5, 0, 0.2, 0.26, ISA_DRAPE, { radius: 0.03, rough: 0.7 });
    const boneSite = ball(patient.head, 0.026, 0.02, -0.02, 0.1, 0xe8d9c0, { rough: 0.5 });
    holoTag(patient.head, "Site 36", 0.02, 0.14, 0.08, { css: "#58c0a8", w: 0.22 });

    // ------------------------------------------------------------- back table
    const backTable = group(g, 1.35, 0, -0.5, -0.5);
    cyl(backTable, 0.05, 0.06, 0.78, 0, 0.39, 0, ISA_STEEL, { rough: 0.3, metal: 0.75, seg: 12 });
    const tableTop = slab(backTable, 0.66, 0.04, 0.44, 0, 0.8, 0, 0xf2f5f7, { radius: 0.02, rough: 0.35, metal: 0.1 });
    tableTop.material = texturedMat(topTex, { rough: 0.45, metal: 0.05, color: 0xffffff });
    const drapeFold = group(backTable, -0.18, 0.84, 0.06);
    slab(drapeFold, 0.26, 0.02, 0.2, 0, 0, 0, ISA_DRAPE, { radius: 0.02, rough: 0.7 });
    slab(drapeFold, 0.24, 0.02, 0.18, 0.01, 0.022, -0.01, 0x3a8d99, { radius: 0.02, rough: 0.7 });
    reg2(drapeFold, "sterile-drape");

    // The implant kit: three drills in ascending diameter, the fixture vial,
    // the ratchet and the torque wrench.
    const kitBlock = group(backTable, 0.14, 0.84, -0.04);
    box(kitBlock, 0.3, 0.03, 0.16, 0, 0, 0, 0x2f4a52, { rough: 0.6 });
    decal(kitBlock, 0.26, 0.05, 0, 0.018, 0.05,
      signFace("KIT SEQUENCE", { bg: "#123037", accent: "#58c0a8", fg: "#e6f6f2", scale: 0.45 }), { px: 192 });
    const pilotDrill = group(kitBlock, -0.1, 0.05, -0.03);
    cyl(pilotDrill, 0.0035, 0.002, 0.11, 0, 0, 0, ISA_STEEL, { rough: 0.15, metal: 0.9, seg: 8 });
    cyl(pilotDrill, 0.008, 0.008, 0.03, 0, -0.07, 0, 0x59c97b, { rough: 0.5, seg: 8 });
    reg2(pilotDrill, "pilot-drill");
    const drill32 = group(kitBlock, -0.02, 0.05, -0.03);
    cyl(drill32, 0.005, 0.003, 0.11, 0, 0, 0, ISA_STEEL, { rough: 0.15, metal: 0.9, seg: 8 });
    cyl(drill32, 0.008, 0.008, 0.03, 0, -0.07, 0, 0x4fd1ff, { rough: 0.5, seg: 8 });
    reg2(drill32, "drill-32");
    const drill38 = group(kitBlock, 0.06, 0.05, -0.03);
    cyl(drill38, 0.0065, 0.004, 0.11, 0, 0, 0, ISA_STEEL, { rough: 0.15, metal: 0.9, seg: 8 });
    cyl(drill38, 0.008, 0.008, 0.03, 0, -0.07, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    reg2(drill38, "drill-38");
    const fixtureVial = group(backTable, 0.26, 0.86, 0.1);
    cyl(fixtureVial, 0.016, 0.016, 0.06, 0, 0, 0, 0xdfe8ee, { rough: 0.12, opacity: 0.55, seg: 14 });
    cyl(fixtureVial, 0.005, 0.003, 0.035, 0, 0, 0, ISA_STEEL, { rough: 0.2, metal: 0.95, seg: 8 });
    const ratchet = group(backTable, -0.24, 0.85, -0.1, 0.4);
    cyl(ratchet, 0.012, 0.012, 0.13, 0, 0, 0, ISA_STEEL, { rough: 0.25, metal: 0.9, seg: 10 });
    ratchet.rotation.z = Math.PI / 2;
    box(ratchet, 0.03, 0.03, 0.02, 0.07, 0, 0, 0x8d979c, { rough: 0.3, metal: 0.8 });
    reg2(ratchet, "torque-ratchet");
    const torqueWrench = instrument(backTable, 0.02, 0.86, 0.14, { w: 0.13, d: 0.18, idle: "-- Ncm", color: ISA_ACCENT, ry: 0.2 });
    reg2(torqueWrench, "torque-wrench");
    // The sterile mixing well the graft is opened into.
    const graftWell = group(backTable, 0.3, 0.84, -0.12);
    cyl(graftWell, 0.03, 0.026, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.25, metal: 0.3, seg: 14 });
    torus(graftWell, 0.03, 0.004, 0, 0.011, 0, ISA_ACCENT, { emissive: ISA_ACCENT, ei: 1.2, rough: 0.4, seg: 6, seg2: 20, cast: false });
    reg2(graftWell, "graft-well");

    // ------------------------------------------------------- irrigation stand
    const pole = group(g, -1.45, 0, -0.7);
    cyl(pole, 0.02, 0.022, 1.5, 0, 0.75, 0, ISA_STEEL, { rough: 0.3, metal: 0.85, seg: 12 });
    cyl(pole, 0.2, 0.22, 0.03, 0, 0.015, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 18 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      cyl(pole, 0.012, 0.012, 0.2, Math.sin(a) * 0.1, 0.02, Math.cos(a) * 0.1, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 8 }).rotation.z = Math.PI / 2;
    }
    const salineBag = group(pole, 0.03, 1.28, 0);
    const salineBody = slab(salineBag, 0.16, 0.26, 0.06, 0, 0, 0, 0xcfe8ef, { radius: 0.03, rough: 0.2, opacity: 0.72 });
    decal(salineBag, 0.11, 0.07, 0, 0.04, 0.035,
      paperFace("STERILE", ["0.9% NaCl", "Chilled"], { bg: "#eef6f8" }), { px: 192 });
    reg2(salineBag, "saline-reservoir");
    hose(pole, [[0.03, 1.15, 0], [0.2, 0.9, 0.1], [0.5, 0.75, 0.2], [0.8, 0.7, 0.1]], 0.008, 0xdfe8ee, { steps: 14, rough: 0.5 });
    const irrigSpray = particles(g, 16, 0xbfe8f2, { size: 0.01, life: 0.3, additive: false, opacity: 0.5 });

    // The pump head with the flow dial on it.
    const pumpHead = group(pole, 0, 0.95, 0.04);
    slab(pumpHead, 0.22, 0.16, 0.12, 0, 0, 0, ISA_CABINET, { radius: 0.02, rough: 0.4, metal: 0.15 });
    const irrigDial = instrument(pumpHead, 0, 0.02, 0.07, { w: 0.12, d: 0.12, idle: "--", color: ISA_ACCENT, ry: 0 });
    reg2(irrigDial, "irrigation-dial");

    // ------------------------------------------------------- suction canister
    const suctionStand = group(g, 1.55, 0, 0.75, -0.4);
    box(suctionStand, 0.34, 0.68, 0.3, 0, 0.34, 0, 0x3a4148, { rough: 0.5, metal: 0.25 });
    const canister = group(suctionStand, 0, 0.82, 0);
    cyl(canister, 0.09, 0.09, 0.26, 0, 0, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.55, seg: 16 });
    const canisterFill = cyl(canister, 0.082, 0.082, 0.2, 0, -0.01, 0, 0xb14a3a, { rough: 0.4, opacity: 0.8, seg: 16 });
    cyl(canister, 0.092, 0.092, 0.02, 0, 0.14, 0, 0x2b3138, { rough: 0.5, seg: 16 });
    reg2(canister, "suction-canister");
    const suctionWand = group(suctionStand, 0.1, 0.72, 0.16, 0.5);
    cyl(suctionWand, 0.009, 0.012, 0.2, 0, 0, 0, 0xdfe4e8, { rough: 0.3, seg: 10 });
    suctionWand.rotation.z = 0.5;
    hose(suctionStand, [[0, 0.95, 0], [-0.3, 0.9, 0.2], [-0.6, 0.85, 0.1]], 0.012, 0x2b3138, { steps: 12, rough: 0.7 });

    // --------------------------------------------------------- bracket tray
    const bracket = group(g, -0.7, 0, -0.55, 0.35);
    cyl(bracket, 0.05, 0.06, 0.72, 0, 0.36, 0, ISA_STEEL, { rough: 0.3, metal: 0.75, seg: 12 });
    slab(bracket, 0.44, 0.03, 0.3, 0.08, 0.73, 0, 0xf2f5f7, { radius: 0.02, rough: 0.35, metal: 0.1 });
    const retractor = group(bracket, -0.02, 0.76, -0.04);
    box(retractor, 0.012, 0.006, 0.12, 0, 0, 0, ISA_STEEL, { rough: 0.2, metal: 0.9 });
    box(retractor, 0.03, 0.005, 0.03, 0, 0, 0.08, ISA_STEEL, { rough: 0.2, metal: 0.9 });
    reg2(retractor, "retractor");
    const anaesSyringe = group(bracket, 0.18, 0.76, 0.06, 0.6);
    cyl(anaesSyringe, 0.008, 0.008, 0.11, 0, 0, 0, 0xb8c0c6, { rough: 0.3, metal: 0.7, seg: 10 });
    anaesSyringe.rotation.z = Math.PI / 2;
    cyl(anaesSyringe, 0.001, 0.001, 0.035, 0.07, 0, 0, 0xf0645b, { rough: 0.3, metal: 0.8, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(anaesSyringe, "Needle bare", 0, 0.07, 0, { css: "#f0645b", w: 0.28 });
    reg2(anaesSyringe, "uncapped-syringe");

    // ------------------------------------------------------ sterilisation bay
    const sterileCounter = counter(g, 1.9, 0.55, -1.15, -1.95, 0xdfe4e8, { ry: 0.25 });
    sterileCounter.children[0].material = texturedMat(topTex, { rough: 0.5, metal: 0.06, color: 0xffffff });
    const pouchRow = group(sterileCounter, -0.5, 0.96, 0);
    for (let i = 0; i < 4; i++) {
      box(pouchRow, 0.18, 0.02, 0.1, i * 0.04, i * 0.022, 0, 0xdfe8ee, { rough: 0.3, opacity: 0.6, cast: false });
    }
    const breachedPouch = group(sterileCounter, 0.05, 0.98, 0.08, 0.3);
    box(breachedPouch, 0.2, 0.02, 0.11, 0, 0, 0, 0xe4ecef, { rough: 0.35 });
    box(breachedPouch, 0.06, 0.012, 0.11, 0.1, 0.014, 0.01, 0xf0645b, { rough: 0.4 });
    holoTag(breachedPouch, "Seal lifted", 0, 0.08, 0, { css: "#f0645b", w: 0.28 });
    reg2(breachedPouch, "pouch-breach");
    const graftShelf = group(sterileCounter, 0.5, 0.98, -0.04);
    const graftPacket = group(graftShelf, 0, 0, 0);
    box(graftPacket, 0.09, 0.03, 0.06, 0, 0, 0, 0xf2ede0, { rough: 0.45 });
    decal(graftPacket, 0.07, 0.02, 0, 0.017, 0, signFace("GRAFT", { bg: "#f2ede0", fg: "#2f4a52", accent: "#58c0a8", scale: 0.45 }), { px: 128 });
    reg2(graftPacket, "graft-packet");
    const expiredGraft = group(graftShelf, 0.12, 0, 0.08, 0.4);
    box(expiredGraft, 0.09, 0.03, 0.06, 0, 0, 0, 0xd8cfb8, { rough: 0.6 });
    holoTag(expiredGraft, "Expired", 0, 0.06, 0, { css: "#f0645b", w: 0.22 });
    reg2(expiredGraft, "expired-graft");
    const usedTray = group(sterileCounter, -0.1, 0.97, -0.14, -0.2);
    box(usedTray, 0.22, 0.02, 0.14, 0, 0, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    const dullDrill = cyl(usedTray, 0.005, 0.003, 0.1, -0.04, 0.02, 0.02, 0x8b929a, { rough: 0.65, metal: 0.4, seg: 8 });
    dullDrill.rotation.z = Math.PI / 2;
    reg2(dullDrill, "dull-drill");
    const reusedDrill = cyl(usedTray, 0.006, 0.004, 0.1, 0.04, 0.02, -0.02, 0x7d848a, { rough: 0.7, metal: 0.35, seg: 8 });
    reusedDrill.rotation.z = Math.PI / 2;
    holoTag(usedTray, "Last case — used", 0, 0.08, 0, { css: "#f0a35b", w: 0.4 });
    reg2(reusedDrill, "reused-drill");
    const looseAbutment = group(sterileCounter, 0.72, 0.98, 0.1);
    cyl(looseAbutment, 0.007, 0.009, 0.02, 0, 0, 0, 0xd8c98f, { rough: 0.25, metal: 0.8, seg: 10 });
    box(looseAbutment, 0.05, 0.002, 0.04, 0, -0.011, 0, 0xe4ecef, { rough: 0.5, cast: false });
    holoTag(looseAbutment, "Unwrapped", 0, 0.06, 0, { css: "#f0645b", w: 0.24 });
    reg2(looseAbutment, "unwrapped-abutment");

    // Scrub sink and the operatory water bottle beside it.
    const scrubSink = group(g, -2.15, 0, -1.4, 0.5);
    slab(scrubSink, 0.56, 0.16, 0.42, 0, 0.88, 0, 0xd8dde0, { radius: 0.03, rough: 0.35, metal: 0.15 });
    box(scrubSink, 0.46, 0.12, 0.32, 0, 0.83, 0, 0xc4ccd2, { rough: 0.3, metal: 0.1 });
    cyl(scrubSink, 0.013, 0.013, 0.24, 0, 1.06, -0.14, ISA_STEEL, { rough: 0.2, metal: 0.9, seg: 10 });
    cyl(scrubSink, 0.013, 0.013, 0.12, 0, 1.16, -0.05, ISA_STEEL, { rough: 0.2, metal: 0.9, seg: 10 }).rotation.x = Math.PI / 2.4;
    for (const sx of [-1, 1]) {
      box(scrubSink, 0.04, 0.16, 0.05, sx * 0.14, 1.0, -0.16, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    }
    const brushBox = box(scrubSink, 0.14, 0.07, 0.1, 0.22, 0.99, 0.02, 0x4aa6a0, { rough: 0.5 });
    decal(brushBox, 0.11, 0.04, 0, 0.038, 0, signFace("SCRUB", { bg: "#125a55", accent: "#8fe6d8", scale: 0.45 }), { px: 128 });
    reg2(brushBox, "scrub-sink");
    const tapBottle = group(g, -1.95, 0, -0.85, -0.3);
    cyl(tapBottle, 0.045, 0.05, 0.2, 0, 0.98, 0, 0xcfd8de, { rough: 0.2, opacity: 0.6, seg: 14 });
    cyl(tapBottle, 0.02, 0.02, 0.04, 0, 1.1, 0, 0x4a545a, { rough: 0.5, seg: 10 });
    box(tapBottle, 0.2, 0.68, 0.2, 0, 0.44, 0, 0xc9d0d4, { rough: 0.55 });
    holoTag(tapBottle, "Operatory water", 0, 1.18, 0, { css: "#f0645b", w: 0.4 });
    reg2(tapBottle, "tap-water-bottle");

    // ------------------------------------------------------------- PPE stand
    const ppe = group(g, 2.35, 0, 0.1, -1.25);
    slab(ppe, 0.36, 0.9, 0.08, 0, 0.48, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.4 });
    box(ppe, 0.38, 0.03, 0.1, 0, 0.94, 0, ISA_ACCENT, { emissive: ISA_ACCENT, ei: 0.3, rough: 0.5, cast: false });
    const capMask = group(ppe, 0, 0.74, 0.06);
    box(capMask, 0.2, 0.08, 0.05, 0, 0, 0, 0x4aa6a0, { rough: 0.5 });
    decal(capMask, 0.16, 0.05, 0, 0, 0.026, signFace("CAP + MASK", { bg: "#125a55", accent: "#8fe6d8", scale: 0.4 }), { px: 160 });
    reg2(capMask, "cap-mask");
    const gloveShelf = group(ppe, 0, 0.5, 0.06);
    box(gloveShelf, 0.18, 0.08, 0.09, 0, 0, 0, 0xeaf2f4, { rough: 0.55 });
    decal(gloveShelf, 0.15, 0.05, 0, 0, 0.046, signFace("STERILE", { bg: "#eaf2f4", fg: "#12484a", accent: "#58c0a8", scale: 0.4 }), { px: 160 });
    reg2(gloveShelf, "sterile-gloves");
    const gownStack = group(ppe, 0, 0.26, 0.06);
    for (let i = 0; i < 3; i++) box(gownStack, 0.17, 0.025, 0.09, 0, i * 0.03, 0, ISA_DRAPE, { rough: 0.6, cast: false });

    // --------------------------------------------------------- wall paperwork
    const casePlan = holoPanel(g, 0.56, 0.4, -2.3, 1.5, -1.75, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,22,24,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#58c0a8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d4f2ea";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SURGICAL PLAN — SITE 36", w * 0.06, h * 0.15);
      ctx.fillStyle = "#eefaf7";
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Fixture 3.8 x 10 mm", "Drills: pilot / 3.2 / 3.8", "Graft: particulate, buccal defect",
        "History: no antiresorptives", "Anticoagulant: none noted", "Consent: signed today"]
        .forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.32 + i * h * 0.12));
    }, { ry: 0.55, accent: ISA_ACCENT });
    reg2(casePlan, "case-plan");

    const signChart = holoPanel(g, 0.6, 0.42, 2.05, 1.52, -1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,14,6,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0a35b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbe8d0";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CALL US IF YOU SEE", w / 2, h * 0.17);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Swelling with discharge", "Bleeding at the collar", "Any movement"]
        .forEach((line, i) => ctx.fillText(line, w / 2, h * 0.42 + i * h * 0.18));
    }, { ry: -0.5, accent: 0xf0a35b });
    const signSwelling = decal(signChart, 0.16, 0.07, -0.2, -0.03, 0.01,
      signFace("SWELLING", { bg: "#2a1a08", accent: "#f0645b", scale: 0.4 }), { px: 160 });
    reg2(signSwelling, "sign-swelling");
    const signBleeding = decal(signChart, 0.16, 0.07, 0.0, -0.03, 0.01,
      signFace("BLEEDING", { bg: "#2a1a08", accent: "#f0a35b", scale: 0.4 }), { px: 160 });
    reg2(signBleeding, "sign-bleeding");
    const signMobility = decal(signChart, 0.16, 0.07, 0.2, -0.03, 0.01,
      signFace("MOVEMENT", { bg: "#2a1a08", accent: "#f2c14b", scale: 0.4 }), { px: 160 });
    reg2(signMobility, "sign-mobility");

    const postopCard = group(g, -1.15, 0, 0.95, 0.5);
    box(postopCard, 0.02, 0.2, 0.15, 0, 1.0, 0, 0xf2ede0, { rough: 0.6 });
    cyl(postopCard, 0.02, 0.024, 1.0, 0, 0.5, 0, ISA_STEEL, { rough: 0.35, metal: 0.7, seg: 10 });
    decal(postopCard, 0.17, 0.13, 0.012, 1.0, 0,
      paperFace("AFTER SURGERY", ["Pressure, not peeking", "Cold outside, day one", "No rinsing, no straws", "Take what is written"], { bg: "#f6f1e4" }), { px: 256 }).rotation.y = Math.PI / 2;
    reg2(postopCard, "postop-card");

    const logPanel = holoPanel(g, 0.54, 0.38, -1.6, 1.78, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,20,22,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#58c0a8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d4f2ea";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("IMPLANT RECORD", w / 2, h * 0.24);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Fixture lot · size · torque", w / 2, h * 0.52);
      ctx.fillText("Graft lot · load number", w / 2, h * 0.72);
    }, { ry: 0.3, accent: ISA_ACCENT });
    reg2(logPanel, "implant-log");

    // -------------------------------------------------------------- furniture
    const supplyCab = equipmentCabinet(g, 0.85, 0.95, 0.46, -2.5, 0.55, { ry: 0.8, color: ISA_CABINET, doorColor: ISA_CABINET, rough: 0.4, metal: 0.1, weathered: false, lines: ["STERILE", "STOCK"] });
    void supplyCab;
    cabinet(g, 0.95, 0.5, 0.3, 2.15, 1.7, -1.9, ISA_CABINET, { doorColor: 0xd6dee2 });
    const drawerUnit = group(g, -0.35, 0, 1.75, -0.2);
    slab(drawerUnit, 0.66, 0.52, 0.4, 0, 0.26, 0, ISA_CABINET, { radius: 0.02, rough: 0.5, metal: 0.1 });
    for (let i = 0; i < 3; i++) {
      box(drawerUnit, 0.6, 0.14, 0.02, 0, 0.1 + i * 0.16, 0.21, 0xd8dde0, { rough: 0.4 });
      cyl(drawerUnit, 0.006, 0.006, 0.1, 0, 0.1 + i * 0.16, 0.23, 0x8b929a, { rough: 0.3, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    }
    const jarRow = group(drawerUnit, 0, 0.53, 0);
    ["GAUZE", "SUTURE", "BURS"].forEach((label, i) => {
      const jx = -0.18 + i * 0.18;
      cyl(jarRow, 0.042, 0.042, 0.11, jx, 0.055, 0, 0xdfe8ee, { rough: 0.12, opacity: 0.5, seg: 14 });
      cyl(jarRow, 0.043, 0.043, 0.014, jx, 0.118, 0, 0x2b3138, { rough: 0.5, seg: 14 });
      decal(jarRow, 0.065, 0.028, jx, 0.055, 0.0425, signFace(label, { bg: "#dfe8ee", fg: "#14454a", accent: "#58c0a8", scale: 0.45 }), { px: 96 });
    });

    // Surgical light over the chair, and the team.
    const lightHead = group(g, 0, 0, -1.05);
    cyl(lightHead, 0.02, 0.02, 0.95, 0.55, 1.95, 0, ISA_STEEL, { rough: 0.3, metal: 0.8, seg: 10 });
    const lampArm = group(lightHead, 0.3, 2.05, 0);
    cyl(lampArm, 0.016, 0.016, 0.6, 0, 0, 0, ISA_STEEL, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    const lampBody = group(lightHead, 0.02, 1.85, 0.05);
    cyl(lampBody, 0.16, 0.13, 0.07, 0, 0, 0, 0xe4ecef, { rough: 0.3, metal: 0.4, seg: 18 });
    const lampFace = cyl(lampBody, 0.13, 0.13, 0.01, 0, -0.04, 0, 0xfff6e0, { emissive: 0xfff6e0, ei: 1.5, rough: 0.2, seg: 18, cast: false });
    const teamBoard = holoPanel(g, 0.44, 0.3, 1.5, 1.82, 1.65, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("TEAM CHECK-IN", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Counts · lots · anything off", w / 2, h * 0.66);
    }, { ry: -0.3, accent: 0x4fd1ff });
    reg2(teamBoard, "team-checkin");

    standingFigure(g, -0.8, -1.3, { ry: 0.5, cloth: 0x2f7f8c, skin: 0xb98a63 });
    standingFigure(g, 1.25, 2.2, { ry: -2.7, cloth: 0x4aa6a0 });

    const key = new THREE.DirectionalLight(0xf6fbff, 0.85);
    key.position.set(-2.2, 4.5, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xeaf6fa, 0x445058, 0.95));

    let irrigating = true;
    let fixtureIn = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.1, -0.8),

      onStepComplete(step) {
        if (step.id === "drape-field") {
          drapeFold.position.set(-0.02, 0.83, 0.02);
          drapeFold.rotation.z = 0.02;
        }
        if (step.id === "irrigation-set") {
          repaint(irrigDial.userData.screen, signFace("SET", { bg: "#0d2224", accent: "#59c97b", fg: "#cdf3ea", scale: 0.55 }));
        }
        if (step.id === "drill-sequence") {
          pilotDrill.rotation.z = 0.5; drill32.rotation.z = 0.5; drill38.rotation.z = 0.5;
        }
        if (step.id === "seat-fixture") { fixtureIn = true; fixtureVial.visible = false; }
        if (step.id === "graft-place") { graftPacket.position.set(0.3, 0.86, -0.12); backTable.add(graftPacket); }
        if (step.id === "implant-log") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,22,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("RECORD SIGNED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("Handed over to recovery", w / 2, h * 0.68);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "irrigant-dry") {
          irrigating = false;
          salineBody.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.1, rough: 0.3, opacity: 0.75 });
          boneSite.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.3, rough: 0.5 });
          repaint(irrigDial.userData.screen, signFace("DRY", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.55 }));
        }
        if (it.id === "suction-overflow") {
          canisterFill.scale.y = 1.25;
          canisterFill.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.8, rough: 0.4, opacity: 0.85 });
          suctionWand.rotation.z = 1.2;
        }
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "irrigant-dry") {
          irrigating = true;
          salineBody.material = mat(0xcfe8ef, { rough: 0.2, opacity: 0.72 });
          boneSite.material = mat(0xe8d9c0, { rough: 0.5 });
          repaint(irrigDial.userData.screen, signFace("FLOW OK", { bg: "#0d2224", accent: "#59c97b", fg: "#cdf3ea", scale: 0.45 }));
        }
        if (it.id === "suction-overflow") {
          canisterFill.scale.y = 0.35;
          canisterFill.material = mat(0x9aa6ac, { rough: 0.4, opacity: 0.6 });
          suctionWand.rotation.z = 0.5;
        }
      },

      animate(t, dt, session) {
        void dt;
        patient.head.rotation.y = -0.05 + Math.sin(t * 0.35) * 0.03;
        patient.torso.position.y = Math.sin(t * 1.05) * 0.003;
        lampFace.material.emissiveIntensity = 1.4 + Math.sin(t * 0.8) * 0.05;
        if (fixtureIn) drapeSheet.position.y = 0.2 + Math.sin(t * 0.6) * 0.002;

        if (session?.step?.id === "retract-hold" && session.holding && irrigating) {
          irrigSpray.visible = true;
          irrigSpray.userData.step(dt, new THREE.Vector3(0, 1.0, -0.85), 0.02, 0.3, -1.1);
        } else if (irrigSpray.visible) irrigSpray.visible = false;

        if (session?.turn && session.step?.id === "seat-fixture") {
          ratchet.rotation.x = session.turn.amount * Math.PI * 2;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "irrigation-set") {
          repaint(irrigDial.userData.screen, signFace(`${Math.round(40 + gg.t * 60)}`, {
            bg: "#0d2224", accent: gg.t >= 0.34 && gg.t <= 0.58 ? "#59c97b" : "#f0645b", fg: "#cdf3ea", scale: 0.6,
          }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "torque-read") {
          const good = tr.v >= 0.36 && tr.v <= 0.6;
          repaint(torqueWrench.userData.screen, signFace(`${Math.round(20 + tr.v * 40)} Ncm`, {
            bg: "#0d2224", accent: good ? "#59c97b" : "#f0645b", fg: "#cdf3ea", scale: 0.42,
          }));
        }
      },
    };
  },
};
