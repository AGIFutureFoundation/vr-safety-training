import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  seatedFigure, mat, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Chairside Emergency VR — Dental & Oral Health.
// A medical emergency in the chair, escalating the way a real one can: a
// vasovagal syncope that does not resolve, then an anaphylactic reaction to
// the local anaesthetic, then a pulseless patient needing CPR and the AED.
// The office emergency kit, the American Heart Association's Basic Life
// Support sequence and the ADA's own guidance on medical emergencies in the
// dental office are the spine — a hygienist is often the only other person
// chairside when this starts, and the response has to be automatic.

const CE_ACCENT = 0xf0a35b;

export const SIM_CHAIRSIDE_EMERGENCY = {
  id: "chairside-emergency",
  index: "126",
  domain: "Dental & Oral Health",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "The American Heart Association's Basic Life Support for Healthcare Providers; the ADA's guidance on the recognition and management of medical emergencies in the dental office, including the office emergency kit; the ADHA's Standards for Clinical Dental Hygiene Practice, which put recognising and responding to a medical emergency inside the hygienist's own assessment duty; NFPA 99 for the office's medical gas and emergency oxygen; the state dental board's practice act for first response before EMS arrival; OSHA 29 CFR 1910.1030 bloodborne pathogens for rescue breaths and any blood or saliva exposure",
  name: "Chairside Emergency",
  title: simTitle("Chairside Emergency"),
  tagline: "Syncope, escalating to anaphylaxis and a pulseless patient — the office emergency kit, BLS and the AED",
  accent: CE_ACCENT,
  accentCss: "#f0a35b",
  parSeconds: 270,
  footprint: 2.3,
  badge: { id: "chair-to-code", name: "Chair to Code", note: "The full escalation answered clean — syncope, anaphylaxis and the AED" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, and the ADHA's member resources — an emergency in your own chair is exactly the run people carry home",

  game: system({
    name: "Emergency Response",
    currency: "BLS",
    ranks: ["First on Scene", "Kit Trained", "Code Lead", "Team Captain", "Response Certified"],
    badges: [
      { id: "kit-known", name: "Kit Known", note: "Every item in the emergency kit identified before it is needed", test: AWARD.stepClean("kit-check") },
      { id: "no-hesitation", name: "No Hesitation", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-compressions", name: "Steady Compressions", note: "Held compression depth in band the whole cycle", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "fast-response", name: "Fast Response", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-code", name: "Clean Code", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "six-straight", name: "Six Straight", note: "Six correct actions in a row", test: AWARD.streak(6) },
    ],
  }),

  hazards: {
    "chair-upright-shortcut": "You sat the patient upright right after they came round. A syncope patient who is stood or sat up too soon drops their blood pressure again and faints a second time — supine with the legs raised is held until they are genuinely steady, not until they open their eyes.",
    "expired-o2-tank": "That cylinder's inspection date is years past due and the gauge sits on empty. An emergency oxygen supply is checked on a schedule for exactly this reason — the one time it is needed is the one time a dead or out-of-date tank cannot be discovered for the first time.",
    "mouth-to-mouth": "You went for direct mouth-to-mouth instead of the pocket mask in the kit. Bloodborne pathogen exposure runs through saliva and vomitus as well as blood, and a barrier device is in every kit for exactly this moment — it is reached for before rescue breaths, not after.",
    "sharps-in-trash": "The used auto-injector needle went into the general waste bin. A fired epinephrine auto-injector is a used sharp like any other and goes into the sharps container — dropping it in the trash puts the next person to touch that bag at risk for no reason at all.",
  },

  lateNotes: {
    "o2-mask": "The cylinder valve is not open yet — a mask with no flow behind it does nothing for a patient who is not breathing well.",
    "aed-analyze": "CPR has to be running and the pads have to be placed before the AED analyses anything — pressing analyse now reads no rhythm off a patient with nothing attached yet.",
    "call-911": "Epinephrine goes first. The call matters, but it does not treat the airway closing while you dial.",
  },

  steps: [
    {
      id: "kit-check", kind: "find", noHint: true,
      targets: ["kit-o2", "kit-epi", "kit-glucose", "kit-aspirin", "kit-nitro", "kit-aed"],
      itemNames: {
        "kit-o2": "oxygen", "kit-epi": "epinephrine auto-injector", "kit-glucose": "oral glucose",
        "kit-aspirin": "aspirin", "kit-nitro": "nitroglycerin", "kit-aed": "the AED",
      },
      itemNotes: {
        "kit-o2": "Oxygen treats more emergencies in this kit than any other single item — syncope, chest pain and anaphylaxis all start with it.",
        "kit-epi": "The first-line drug for anaphylaxis, and the only one in this kit given by auto-injector rather than by mouth.",
        "kit-glucose": "For a conscious hypoglycaemic patient who can still swallow — not for one who cannot protect their own airway.",
        "kit-aspirin": "Chewed and swallowed for suspected cardiac chest pain, once the patient can confirm no allergy or contraindication.",
        "kit-nitro": "For a patient's own prescribed angina pain, given from their own supply where the office kit carries it as a backup.",
        "kit-aed": "Automated external defibrillator — voice-prompted, and the ADA's emergency guidance expects one in every office reachable inside minutes.",
      },
      title: "Know the emergency kit before you need it",
      cue: "Open the kit and confirm each item is present and in date.",
      why: "The ADA's guidance on office emergencies names this exact list — oxygen, an epinephrine auto-injector, glucose, aspirin, nitroglycerin and an AED — because a kit checked cold, during an actual emergency, costs the minutes that decide the outcome. The ADHA's practice standards put that check on the hygienist rather than on whoever happens to be free: knowing the kit before the chair needs it is the whole point of keeping one.",
    },
    {
      id: "recognize", kind: "find", noHint: true,
      noRobot: true, forceClass: "light",
      robotNote: "Reading pallor, sweat and a pulse is hands on a collapsing patient.",
      targets: ["sign-pallor", "sign-sweat", "sign-pulse"],
      itemNames: { "sign-pallor": "pale skin", "sign-sweat": "cold sweat", "sign-pulse": "weak, slow pulse" },
      itemNotes: {
        "sign-pallor": "Blood pooling away from the skin and toward the core is one of the earliest visible signs a vasovagal episode is starting.",
        "sign-sweat": "A sudden cold sweat with no exertion behind it is autonomic, not incidental — it belongs on the same list as the pallor.",
        "sign-pulse": "A pulse that has gone slow and thin, rather than fast and thin, points toward vasovagal syncope rather than a bleed.",
      },
      title: "Recognise syncope in the chair",
      cue: "Look at your patient. Three signs say this is more than nerves before a procedure.",
      why: "Pale, sweating and a pulse gone slow and weak together are the recognisable shape of vasovagal syncope, and naming it correctly in the first seconds is what sends the response toward reclining the chair rather than toward reassurance that does nothing for a patient about to lose consciousness.",
    },
    {
      id: "position", kind: "sequence",
      noRobot: true, forceClass: "firm",
      robotNote: "Reclining the chair and raising the legs of somebody who has just lost consciousness.",
      targets: ["chair-supine", "legs-raised"],
      itemNames: { "chair-supine": "chair to supine", "legs-raised": "legs raised" },
      title: "Recline the chair and raise the legs",
      cue: "Lay the chair fully back, then raise the patient's legs above heart level.",
      why: "Supine with the legs raised restores blood flow to the brain by gravity alone, before any drug or device is involved, and it is the single most effective first action for ordinary vasovagal syncope. The legs go up after the chair is flat, because raising them on a half-reclined chair mostly just folds the patient in half.",
      outOfOrderNote: "The chair goes fully supine before the legs come up — raising the legs on a half-reclined chair does not restore circulation the way flat does.",
    },
    {
      id: "airway", kind: "hold", target: "patient-airway", seconds: 6,
      noRobot: true, forceClass: "light",
      robotNote: "The airway. Never the robot's, at any skill.",
      title: "Open the airway and check breathing",
      cue: "Hold the head-tilt chin-lift and confirm breathing.",
      why: "An unconscious or semi-conscious patient's own tongue is the most common airway obstruction in the chair, and the head-tilt chin-lift clears it in the same motion that lets you watch for breathing. This is checked before oxygen goes on, because oxygen delivered to a closed airway does not reach anywhere that matters.",
      holdBreakNote: "You let go before confirming breathing. A partially open airway can look clear for a second and close again — the check is held for the full count, not sampled.",
    },
    {
      id: "o2-valve", kind: "turn", target: "o2-valve",
      title: "Open the emergency oxygen cylinder",
      cue: "Turn the cylinder valve open before reaching for the mask.",
      why: "The valve opens first because a mask placed on a closed line delivers nothing and costs the seconds it takes someone to notice. Confirming flow at the cylinder is the difference between administering oxygen and going through the motions of administering oxygen — and it is the reason NFPA 99 has the office check and secure this cylinder on a schedule rather than the morning it is finally needed.",
      turn: { turns: 1, axis: "y", label: "O2 CYLINDER" },
    },
    {
      id: "o2-mask", kind: "select", target: "o2-mask",
      noRobot: true, forceClass: "light",
      robotNote: "Oxygen onto a patient's face.",
      title: "Apply oxygen",
      cue: "Place the mask once flow is confirmed.",
      why: "Oxygen is the single item in this kit that helps almost every emergency it might be reached for, which is why it is applied early and kept running rather than held back to see whether the patient needs it after all.",
    },
    {
      id: "vitals", kind: "sequence",
      forceClass: "light",
      robotNote: "Cuff and oximeter placement is assistant work the robot may do while the clinician holds the airway.",
      targets: ["bp-cuff", "pulse-ox", "vitals-record"],
      itemNames: { "bp-cuff": "blood pressure", "pulse-ox": "pulse oximeter", "vitals-record": "record vitals" },
      title: "Take and record vitals",
      cue: "Blood pressure, then pulse oximetry, then record both.",
      why: "Vitals taken and written down are what turns 'the patient looked better' into something the responding paramedics can actually use when they walk in — a trend across two or three readings tells them more than any one number does on its own.",
      outOfOrderNote: "Blood pressure first, then the pulse oximeter, then the record — writing down a number you have not taken yet is not a record of anything.",
    },
    {
      id: "anaphylaxis", kind: "sequence",
      noRobot: true, forceClass: "firm",
      robotNote: "An injection into a patient's thigh, and the call that has to follow it.",
      targets: ["epi-autoinjector", "call-911"],
      itemNames: { "epi-autoinjector": "epinephrine auto-injector", "call-911": "call 911" },
      title: "Anaphylaxis to the local anaesthetic — epinephrine, then the call",
      cue: "The patient's throat is tightening and hives are spreading — give epinephrine, then call 911.",
      why: "Epinephrine is the first-line treatment for anaphylaxis and the one intervention that can reverse a closing airway in the minutes before EMS arrives, so it is given immediately rather than after the call is placed. The 911 call follows straight after, because a patient who responds to one dose can still deteriorate again on the way to the hospital.",
      outOfOrderNote: "Epinephrine before the call — a closing airway does not wait for EMS to be notified.",
    },
    {
      id: "cpr", kind: "track", target: "cpr-point", seconds: 8,
      noRobot: true, forceClass: "firm",
      robotNote: "Compressions on a human chest.",
      title: "Start chest compressions — no pulse",
      cue: "Compress at the correct depth and hold it steady — too shallow does nothing, too hard risks injury.",
      why: "The American Heart Association's Basic Life Support sequence calls for compressions the instant a pulse cannot be found, at a depth and rate that actually generates circulation — a compression that never reaches full depth moves no blood, and this is the one part of the whole response where doing it approximately is the same as not doing it.",
      track: {
        start: 0.1, green: [0.4, 0.62], rise: 0.55, fall: 0.42, drift: 0.09, label: "COMPRESSION DEPTH",
        readout: (v) => (v < 0.4 ? "too shallow" : v > 0.62 ? "too hard" : "good depth"),
      },
      holdBreakNote: "Depth drifted out of band. Shallow compressions do not circulate blood, and compressions that are too hard risk rib injury — bring it back into the band and hold it.",
    },
    {
      id: "aed-pads", kind: "drag", target: "backup-pads",
      noRobot: true, forceClass: "light",
      robotNote: "Pads onto a bare chest, positioned by eye.",
      title: "Attach the AED pads",
      cue: "Place the pads on the bare chest, upper right and lower left, without stopping compressions longer than necessary.",
      why: "Pad placement follows the diagram on the pack — upper right of the sternum, lower left ribs — because a pad placed by guesswork can read the rhythm wrong or fail to deliver a shock through the heart at all. Compressions pause only for the seconds the AED actually needs to analyse.",
      drag: { to: "patient-chest", radius: 0.4, missNote: "Not placed on the chest. A pad set down anywhere else reads nothing and shocks nothing." },
    },
    {
      id: "aed-shock", kind: "select", target: "aed-analyze",
      noRobot: true, forceClass: "none",
      robotNote: "The decision to shock a person stays with the person who can be held to it.",
      title: "Analyse and shock as prompted",
      cue: "Stand clear and follow the AED's voice prompts.",
      why: "The AED decides whether a shock is indicated from the rhythm it reads — the operator's job is staying clear during analysis and delivering the shock the device calls for, not second-guessing the prompt. Voice-prompted devices exist so that this step needs no judgement call under pressure.",
    },
    {
      id: "log", kind: "select", target: "incident-log",
      title: "Record the incident",
      cue: "Log the timeline, the interventions given and the outcome once EMS has the patient.",
      why: "A written timeline — when the emergency was recognised, what was given and when, when EMS arrived — is what the receiving hospital, the state dental board and the office's own review of the response all rely on afterward. None of that exists if it is only remembered.",
    },
  ],

  interrupts: [
    {
      id: "syncope-not-recovering",
      kind: "Patient deteriorating",
      after: "airway", delay: 3, seconds: 11,
      alert: "A full minute has passed and the patient has not come round — this is no longer ordinary syncope.",
      cue: "Escalate now. Call for help.",
      target: "call-911",
      why: "Ordinary vasovagal syncope resolves within roughly a minute of the legs going up; a patient who does not come round in that time has stopped being a simple faint and needs EMS on the way while the rest of the assessment continues, not after it.",
      missNote: "The patient stayed down while the routine syncope response continued unchanged. A minute without recovery is the threshold this protocol uses to call for help — past it, waiting to see costs the time EMS needed to already be moving.",
      wrongNote: "Escalate — call 911. Continuing the same steps that have not worked for a full minute is not the same as reassessing.",
    },
    {
      id: "aed-pads-expired",
      kind: "Equipment fault",
      after: "cpr", delay: 3, seconds: 11,
      alert: "The AED pads pack you grabbed is past its expiry date — the gel has likely dried and the connection cannot be trusted.",
      cue: "Grab the backup pack, not the expired one.",
      target: "backup-pads",
      why: "Dried gel on an expired pad set breaks skin contact and can stop the AED from reading a rhythm or delivering a shock at all — the fix is switching to the backup pack immediately, not attaching the expired one because a patient is already down.",
      missNote: "The expired pads went on anyway. A poor connection at the one moment a shock might be needed is exactly what a kit-check schedule for the AED pads exists to prevent — checking dates only after they have already failed defeats the point.",
      wrongNote: "It is the pads pack. An expired set stays out of the kit precisely because failure shows up only when it is finally used.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, CE_ACCENT);

    // ------------------------------------------------------------- dental chair
    const chair = group(g, -0.5, 0, -0.9, 0.3);
    slab(chair, 0.62, 0.5, 1.5, 0, 0.45, 0, 0x3c5a66, { radius: 0.08, rough: 0.6 });
    const back = slab(chair, 0.6, 0.9, 0.5, 0, 0.85, -0.75, 0x3c5a66, { radius: 0.07, rough: 0.6 });
    back.rotation.x = -0.55;
    cyl(chair, 0.26, 0.32, 0.42, 0, 0.22, 0, 0x4a545a, { rough: 0.4, metal: 0.5, seg: 16 });
    cyl(chair, 0.34, 0.34, 0.05, 0, 0.02, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });

    // Cuspidor bowl and overhead operatory light — standard dental chair furniture.
    const cuspidorArm = group(chair, -0.5, 0, 0.15, 0.5);
    cyl(cuspidorArm, 0.02, 0.02, 0.55, 0, 0.5, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    cyl(cuspidorArm, 0.02, 0.02, 0.3, 0, 0.76, 0.15, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = 0.5;
    cyl(cuspidorArm, 0.12, 0.06, 0.1, 0, 0.9, 0.28, 0xe8ecef, { rough: 0.25, seg: 18 });
    cyl(cuspidorArm, 0.03, 0.03, 0.12, 0.1, 1.0, 0.2, 0xdfe4e8, { rough: 0.3, seg: 10 });
    const opLightArm = group(chair, 0.1, 0, 0.5, -0.3);
    cyl(opLightArm, 0.02, 0.02, 0.9, 0, 1.0, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    cyl(opLightArm, 0.02, 0.02, 0.4, 0, 1.4, 0.2, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = 0.9;
    slab(opLightArm, 0.28, 0.08, 0.16, 0, 1.6, 0.4, 0xe8ecef, { radius: 0.03, rough: 0.4, metal: 0.2 });
    ball(opLightArm, 0.02, 0, 1.56, 0.48, 0xfff6dc, { emissive: 0xfff6dc, ei: 1.0 });

    const patient = seatedFigure(chair, 0, 1.02, -0.42, { skin: 0xd9a985, cloth: 0x6b7f8c, ry: -0.15 });
    // Robot training: this is a person, so the head and the torso are
    // keep-out volumes an embodied trainee never enters unless the step it
    // is working declares patient contact. See shared/robot-embodiment.js.
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    patient.torso.rotation.x = -0.6;
    patient.head.rotation.set(0.4, 0, -0.15);
    reg(hits, patient.head, "patient-airway");
    const chestPoint = group(patient.torso, 0, 0.7, 0.16);
    ball(chestPoint, 0.02, 0, 0, 0, CE_ACCENT, { emissive: CE_ACCENT, ei: 1.3 });
    reg(hits, chestPoint, "cpr-point");
    // A separate, non-raycast marker for the AED drop socket — sharing the
    // same hitId-bearing object as "cpr-point" would let the second reg()
    // overwrite the first (markInteractive only carries one id per object),
    // silently breaking the CPR hold in real play even though the headless
    // checker drives sessions directly and would never notice.
    const chestSocket = group(patient.torso, 0, 0.7, 0.16);
    hits["patient-chest"] = chestSocket;

    // The three visible signs of syncope, tagged on and beside the patient.
    const pallorTag = holoTag(patient.head, "Pale skin", 0.16, 0.02, 0.08, { css: "#f0645b", w: 0.26 });
    reg(hits, pallorTag, "sign-pallor");
    const sweatTag = holoTag(patient.head, "Cold sweat", -0.16, 0.02, 0.08, { css: "#f0645b", w: 0.28 });
    reg(hits, sweatTag, "sign-sweat");
    const pulseTag = group(patient.torso, 0.2, 0.9, 0.05);
    ball(pulseTag, 0.012, 0, 0, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.1 });
    holoTag(pulseTag, "Weak, slow pulse", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, pulseTag, "sign-pulse");

    // Recline lever and leg-raise wedge, both physical props on the chair.
    const lever = group(chair, 0.34, 0.5, 0.2, -0.2);
    cyl(lever, 0.014, 0.014, 0.16, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 10 });
    ball(lever, 0.024, 0, 0.09, 0, 0x2b3138, { rough: 0.5 });
    reg(hits, lever, "chair-supine");
    const wedge = group(chair, 0, 0.5, -1.2);
    box(wedge, 0.5, 0.14, 0.36, 0, 0, 0, 0xdfe4e8, { rough: 0.7 });
    reg(hits, wedge, "legs-raised");
    holoTag(wedge, "Leg-raise wedge", 0, 0.16, 0, { css: "#f0a35b", w: 0.32 });

    // Unsafe shortcut: a control that sits the chair back upright at once.
    const uprightSwitch = group(chair, -0.34, 0.5, 0.2, 0.2);
    cyl(uprightSwitch, 0.014, 0.014, 0.16, 0, 0, 0, 0xf0645b, { rough: 0.3, metal: 0.9, seg: 10 });
    ball(uprightSwitch, 0.024, 0, 0.09, 0, 0xf0645b, { rough: 0.5 });
    holoTag(uprightSwitch, "Sit up now?", 0, 0.16, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, uprightSwitch, "chair-upright-shortcut");

    // ------------------------------------------------------------- emergency kit
    const kit = toolChest(g, 1.5, -1.1, { ry: -0.6, color: 0xd8342a });
    decal(kit, 0.5, 0.16, 0, 0.76, 0.201, signFace("EMERGENCY KIT", { bg: "#2a1008", accent: "#f2c14b", scale: 0.5 }));
    const KIT_ITEMS = [
      ["kit-o2", "O2", 0x59c97b, -0.24, 0.28],
      ["kit-epi", "EPI", 0xf0645b, -0.08, 0.28],
      ["kit-glucose", "GLU", 0xf2c14b, 0.08, 0.28],
      ["kit-aspirin", "ASA", 0xdfe4e8, 0.24, 0.28],
      ["kit-nitro", "NTG", 0xa079ff, -0.16, 0.44],
      ["kit-aed", "AED", 0x4fd1ff, 0.16, 0.44],
    ];
    for (const [id, label, color, x, y] of KIT_ITEMS) {
      const item = group(kit, x, y, 0.22);
      box(item, 0.1, 0.06, 0.03, 0, 0, 0, color, { rough: 0.5 });
      decal(item, 0.08, 0.04, 0, 0, 0.016, signFace(label, { bg: "#1b1e22", accent: "#f2c14b", scale: 0.5 }), { px: 96 });
      reg(hits, item, id);
    }
    const epiUsed = group(kit, -0.08, 0.62, 0.22);
    ball(epiUsed, 0.014, 0, 0, 0, 0xf0645b, { emissive: 0xf0645b, ei: 0.6 });
    reg(hits, epiUsed, "epi-autoinjector");

    // A general trash bin beside the kit — the wrong destination for a used
    // auto-injector, which is a fired sharp like any other.
    const trashBin = group(g, 1.0, 0, -1.65, -0.3);
    cyl(trashBin, 0.14, 0.16, 0.32, 0, 0.16, 0, 0x4a545a, { rough: 0.7, seg: 14 });
    const usedEpi = cyl(trashBin, 0.008, 0.008, 0.09, 0.03, 0.3, 0.02, 0xf0645b, { rough: 0.5, seg: 8 });
    usedEpi.rotation.z = 0.6;
    holoTag(trashBin, "Used epi — general trash?", 0, 0.4, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, usedEpi, "sharps-in-trash");

    // O2 cylinder and mask beside the kit.
    const o2 = group(g, 2.05, 0, -1.3);
    cyl(o2, 0.09, 0.1, 0.7, 0, 0.35, 0, 0x59c97b, { rough: 0.4, metal: 0.5, seg: 16 });
    cyl(o2, 0.045, 0.05, 0.1, 0, 0.75, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 12 });
    const valve = group(o2, 0, 0.78, 0);
    cyl(valve, 0.018, 0.018, 0.05, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 10 });
    reg(hits, valve, "o2-valve");
    const o2Hose = hose(o2, [[0, 0.75, 0], [-0.4, 0.85, 0.4], [-0.9, 0.9, 0.7]], 0.014, 0xdfe4e8, { steps: 14, rough: 0.5 });
    void o2Hose;
    const oxMask = group(o2, -0.9, 0.9, 0.7);
    torus(oxMask, 0.05, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.5, seg: 8, seg2: 16 });
    reg(hits, oxMask, "o2-mask");

    // Expired backup O2 tank against the wall — the wrong one to grab.
    const expiredO2 = group(g, 2.3, 0, -0.4, 0.3);
    cyl(expiredO2, 0.09, 0.1, 0.7, 0, 0.35, 0, 0x8a8f94, { rough: 0.7, metal: 0.3, seg: 16 });
    holoTag(expiredO2, "O2 — inspection overdue", 0, 0.78, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, expiredO2, "expired-o2-tank");

    // Pocket-mask barrier device vs. the unprotected-breath trap.
    const pocketMask = group(g, 1.55, 0, -0.45, -0.3);
    box(pocketMask, 0.1, 0.03, 0.14, 0, 0.86, 0, 0x2b3138, { rough: 0.5 });
    holoTag(pocketMask, "Pocket mask", 0, 0.92, 0, { css: "#f0a35b", w: 0.28 });
    const mouthTrap = group(g, -0.1, 0, -0.55, 0.2);
    ball(mouthTrap, 0.02, 0, 1.15, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.2 });
    holoTag(mouthTrap, "Direct — no barrier", 0, 1.24, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, mouthTrap, "mouth-to-mouth");

    // Vitals cart.
    const cart = group(g, 1.2, 0, 0.9, -0.4);
    box(cart, 0.5, 0.85, 0.34, 0, 0.42, 0, 0x3a4148, { rough: 0.5, metal: 0.3 });
    const bpCuff = instrument(cart, 0.1, 0.9, 0.05, { idle: "-- / --", color: CE_ACCENT, ry: 0.3 });
    reg(hits, bpCuff, "bp-cuff");
    const pulseOx = instrument(cart, -0.12, 0.7, 0.14, { idle: "-- %", color: CE_ACCENT, w: 0.11, d: 0.16, ry: -0.2 });
    reg(hits, pulseOx, "pulse-ox");
    const vitalsChart = decal(cart, 0.24, 0.18, 0, 0.9, -0.17,
      signFace("RECORD", { bg: "#241a10", accent: "#f0a35b", scale: 0.5 }));
    vitalsChart.rotation.x = -Math.PI / 2;
    reg(hits, vitalsChart, "vitals-record");

    // Phone for 911.
    const phone = group(g, -1.9, 0, 0.4, 0.6);
    box(phone, 0.1, 0.16, 0.04, 0, 1.1, 0, 0x2b3138, { rough: 0.5 });
    holoTag(phone, "Call 911", 0, 1.22, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, phone, "call-911");

    // AED unit and a fresh backup pads pack; the expired pack sits open on the kit.
    const aedUnit = group(g, -1.6, 0, -1.1, 0.5);
    box(aedUnit, 0.24, 0.3, 0.08, 0, 0.5, 0, 0xf2c14b, { rough: 0.45, metal: 0.2 });
    const aedScreen = decal(aedUnit, 0.18, 0.1, 0, 0.58, 0.041,
      signFace("READY", { bg: "#241a10", accent: "#59c97b", scale: 0.5 }), { glow: true, ei: 0.6 });
    reg(hits, aedUnit, "aed-analyze");
    const backupPads = group(aedUnit, 0.16, 0.3, 0.05);
    box(backupPads, 0.08, 0.1, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.5 });
    holoTag(backupPads, "Backup pads — sealed", 0, 0.09, 0, { css: "#59c97b", w: 0.38 });
    reg(hits, backupPads, "backup-pads");
    const expiredPads = group(kit, 0.2, 0.62, 0.22);
    box(expiredPads, 0.08, 0.1, 0.02, 0, 0, 0, 0x8a8f94, { rough: 0.6 });
    holoTag(expiredPads, "Pads — expired", 0, 0.09, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, expiredPads, "aed-pads-expired");

    // Incident log clipboard, and an assistant standing clear of the chair.
    const logBoard = holoPanel(g, 0.5, 0.36, -1.9, 1.5, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0a35b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fde9d2";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("INCIDENT LOG", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Time · intervention · outcome", w / 2, h * 0.62);
      ctx.fillText("Sign once EMS has the patient", w / 2, h * 0.8);
    }, { ry: 0.6, accent: CE_ACCENT });
    reg(hits, logBoard, "incident-log");

    // Sink counter and supply cabinet against the back wall.
    const sinkCounter = counter(g, 1.1, 0.5, -2.0, -2.0, 0xdfe4e8, { ry: 0 });
    box(sinkCounter, 0.32, 0.1, 0.3, 0, 0.97, 0, 0xc7d0d6, { radius: 0.02, rough: 0.3, metal: 0.2 });
    cyl(sinkCounter, 0.012, 0.012, 0.16, 0, 1.1, -0.1, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    for (let i = 0; i < 3; i++) {
      cyl(sinkCounter, 0.012, 0.012, 0.05 + i * 0.01, -0.3 + i * 0.28, 0.98, 0.12, 0xdfe4e8, { rough: 0.5, seg: 10 });
    }
    cabinet(g, 1.0, 0.5, 0.3, -2.0, 1.65, -2.0, 0xdfe4e8, { doorColor: 0xcfd8de });
    const stool = group(g, -0.3, 0, -1.9, -0.4);
    cyl(stool, 0.18, 0.2, 0.05, 0, 0.48, 0, 0x3c5a66, { rough: 0.6, seg: 16 });
    cyl(stool, 0.03, 0.03, 0.45, 0, 0.24, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 12 });
    cyl(stool, 0.2, 0.2, 0.03, 0, 0.02, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 16 });

    const assistant = standingFigure(g, 1.85, 0.7, { ry: -2.4, cloth: 0x4aa6a0 });
    void assistant;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -0.5),

      onStepComplete(step) {
        if (step.id === "position") { wedge.position.y += 0.02; }
        if (step.id === "o2-valve") repaint(bpCuff.userData.screen, signFace("READY", { bg: "#0d1c24", accent: "#f0a35b", fg: "#ffe6c9", scale: 0.55 }));
        if (step.id === "o2-mask") { oxMask.position.set(0.02, 0.02, 0.08); patient.head.add(oxMask); }
        if (step.id === "vitals") repaint(vitalsChart, signFace("LOGGED", { bg: "#241a10", accent: "#59c97b", scale: 0.5 }));
        if (step.id === "aed-shock") repaint(aedScreen, signFace("SHOCK DELIVERED", { bg: "#241a10", accent: "#59c97b", scale: 0.4 }));
      },

      onInterrupt(it) {
        if (it.id === "syncope-not-recovering") { patient.head.rotation.z = 0.3; }
        if (it.id === "aed-pads-expired") { expiredPads.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.3, rough: 0.5 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "syncope-not-recovering") { patient.head.rotation.z = 0; }
        if (it.id === "aed-pads-expired") { expiredPads.children[0].material = mat(0x8a8f94, { rough: 0.6 }); }
      },

      animate(t, dt, session) {
        if (session?.turn && session.step?.id === "o2-valve") valve.rotation.y = session.turn.amount * Math.PI * 2;
        patient.head.rotation.y = -0.1 + Math.sin(t * 0.4) * 0.04;
        patient.torso.position.y = Math.sin(t * 1.1) * 0.004;

        const tr = session?.track;
        if (session?.step?.id === "cpr" && tr) {
          chestPoint.material = mat(tr.v >= 0.4 && tr.v <= 0.62 ? 0x59c97b : 0xf0645b, {
            emissive: tr.v >= 0.4 && tr.v <= 0.62 ? 0x59c97b : 0xf0645b, ei: 1.3,
          });
          patient.torso.position.y = -tr.v * 0.02;
        }
      },
    };
  },
};
