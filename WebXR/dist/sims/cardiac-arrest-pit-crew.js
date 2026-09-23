import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  standingPerson, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cardiac Arrest — Pit Crew VR — Emergency Services.
// An out-of-hospital cardiac arrest run the way high-performance EMS crews
// actually run it: roles called out and taken the instant the second unit
// walks in, compressions that never really stop, and every other task —
// the airway, the pads, the line, the drugs, the family in the hallway —
// fitted into that one continuous rhythm rather than interrupting it. The
// American Heart Association's own pit-crew CPR model is the spine, and the
// two things that actually cost a save are modelled as the two things a
// crew has to catch in real time: a compressor's depth going shallow before
// anyone calls it, and a family member who does not wait in the hallway.

const CAP_ACCENT = 0xe0524a;

export const SIM_CARDIAC_ARREST_PIT_CREW = {
  id: "cardiac-arrest-pit-crew",
  index: "200",
  domain: "Emergency Services",
  trade: "Paramedic — IAFF EMS",
  category: "Emergency Services",
  indoor: "hotel",
  certification: "The American Heart Association's high-performance pit-crew CPR model and its Basic and Advanced Life Support sequence; NFPA 1584 on rehabilitation and the scheduled physical rotation it is built to protect against; the county EMS agency's medical control protocol governing drug timing and the termination-of-resuscitation call, following the National Association of EMS Physicians' position statement on the subject; OSHA 29 CFR 1910.1030 bloodborne pathogens for every hands-on contact and every used sharp; IAFF and IAEP fire-based EMS crews as the workforce; NIMS/ICS through FEMA IS-100 for the incident structure a second-arriving unit steps into.",
  name: "Cardiac Arrest — Pit Crew",
  title: simTitle("Cardiac Arrest — Pit Crew"),
  tagline: "High-performance pit-crew CPR: roles on arrival, compressions that never stop, the swap called on time, and the family met at the door",
  accent: CAP_ACCENT,
  accentCss: "#e0524a",
  parSeconds: 300,
  footprint: 2.7,
  badge: { id: "pit-crew-clean", name: "Pit Crew Clean", note: "A full arrest run with the roles held, the depth never allowed to drift uncaught, and the family met calmly at the door" },

  game: system({
    name: "Resuscitation Command",
    currency: "ROSC",
    ranks: ["EMT Basic", "Paramedic Trainee", "Pit Crew Certified", "Code Commander", "ROSC Certified"],
    badges: [
      { id: "roles-locked", name: "Roles Locked", note: "Every role assigned in the pit-crew's own order, no reshuffling", test: AWARD.stepClean("assign-roles") },
      { id: "no-hands-off", name: "No Unnecessary Hands-Off", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "depth-held", name: "Depth Held", note: "Compression depth held in band the whole cycle", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "fast-code", name: "Fast Code", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "hands-on-during-analysis": "You kept a hand on the chest while the monitor read the rhythm. A rhythm read with anybody still touching the patient can pick up motion artifact and call a shockable rhythm something it is not — 'everybody clear' means everybody, for the few seconds the analysis actually takes.",
    "pause-for-iv": "You stopped compressions so the line could go in cleanly. IV and IO access is built to be started without a pause at all — coronary perfusion pressure a compressor spent thirty seconds building collapses in the first few seconds hands come off the chest, and it takes far longer than that pause to rebuild.",
    "epi-too-soon": "You reached for a second dose of epinephrine before the interval on the clock had run. Medical control's dosing interval is not a suggestion to round down when the room feels urgent — a second dose pushed early does not help the rhythm and it does complicate the pharmacology of everything given after it.",
    "sharps-in-trash": "The used IO needle went into the general waste rather than the sharps container. A fired IO needle is a contaminated sharp exactly like a used syringe, and it goes into a puncture-proof container immediately — not set down on a counter to be dealt with once the code is over.",
  },

  lateNotes: {
    "io-drill": "There is no confirmed rhythm to push a drug into yet — the airway and the first analysis come first.",
    "epi-clock": "No line is running yet. Epinephrine needs a route before it needs a clock.",
    "swap-called": "The two-minute mark has not come round yet, and depth is still holding — calling a swap early costs a hands-off gap this crew does not need yet.",
    "prepare-for-transport": "There is no pulse check on the board yet — confirm what the rhythm and the pulse actually show before committing to transport or termination.",
  },

  steps: [
    {
      id: "recognize-arrest", kind: "find", noHint: true,
      targets: ["sign-unresponsive", "sign-no-breathing", "sign-no-pulse"],
      itemNames: { "sign-unresponsive": "no response to voice or touch", "sign-no-breathing": "no normal breathing", "sign-no-pulse": "no palpable pulse" },
      itemNotes: {
        "sign-unresponsive": "No response to a loud voice or a sternal rub — the first check, and the fastest one to do wrong by assuming instead of testing.",
        "sign-no-breathing": "Watch the chest for ten seconds. Occasional gasping is agonal breathing, not breathing — it still means start compressions.",
        "sign-no-pulse": "No pulse felt at the carotid inside ten seconds of checking. Past ten seconds, stop checking and start compressing.",
      },
      title: "Confirm the arrest before anything else",
      cue: "Check the patient: response, breathing, pulse. All three say cardiac arrest.",
      why: "Every second spent here is a second compressions have not started, so the check is fast on purpose: unresponsive, not breathing normally, no pulse. Agonal gasps are the trap in the middle one — they look like breathing to somebody who has never been taught they are actually a sign of arrest, and treating them as breathing is the single most common reason compressions start late.",
    },
    {
      id: "assign-roles", kind: "sequence",
      targets: ["role-compressor", "role-airway", "role-iv-drugs", "role-recorder", "role-family-liaison"],
      itemNames: {
        "role-compressor": "compressor", "role-airway": "airway", "role-iv-drugs": "IV/drugs",
        "role-recorder": "recorder/timer", "role-family-liaison": "family liaison",
      },
      title: "Call the roles in the pit crew's own order",
      cue: "As the crew comes through the door, call each position in order: compressor, airway, IV/drugs, recorder, family liaison.",
      why: "A pit crew works because nobody arrives and asks what to do — the order the positions are called in is itself part of the protocol, compressions and airway locked down before anyone is spared to start a line, and a family liaison named before anyone actually needs one rather than improvised once a relative is already standing in the doorway.",
      outOfOrderNote: "Compressor and airway first, then IV/drugs, then the recorder, then the family liaison — the positions that keep the patient alive are called before the ones that support the record and the room.",
    },
    {
      id: "start-compressions", kind: "track", target: "compressor-point", seconds: 10,
      title: "Compressions, in time with the metronome",
      cue: "Follow the metronome: at least two inches deep, full recoil, no leaning between beats.",
      track: {
        start: 0.15, green: [0.42, 0.64], rise: 0.6, fall: 0.46, drift: 0.11, label: "COMPRESSION DEPTH",
        readout: (v) => (v < 0.42 ? "too shallow" : v > 0.64 ? "too hard" : "good depth"),
      },
      why: "The metronome sets the rate; the depth is on the compressor to hold, beat after beat, because a compression that never reaches full depth moves no blood no matter how fast it is delivered, and one that never fully recoils never lets the heart refill between beats. This is the one part of the whole call where doing it approximately is the same as not doing it.",
      holdBreakNote: "Depth drifted out of band. Shallow compressions generate no meaningful coronary perfusion pressure — bring it back into the band and hold it there.",
    },
    {
      id: "open-o2", kind: "turn", target: "o2-valve",
      title: "Open the oxygen cylinder for the bag",
      cue: "Turn the cylinder valve open before the bag-mask goes anywhere near the airway.",
      turn: { turns: 1, axis: "y", label: "O2 CYLINDER" },
      why: "A bag-valve-mask on a closed line moves room air and nothing else, and the seconds it takes somebody to notice the gauge never moved are seconds the airway person spent thinking oxygen was going in when it was not. Confirming flow at the cylinder first is what makes every ventilation after it actually count.",
    },
    {
      id: "pads-placement", kind: "drag", target: "defib-pads",
      title: "Place the defibrillator pads without stopping compressions",
      cue: "Carry the pads to the bare chest — upper right, lower left — while the compressor keeps working.",
      drag: { to: "patient-chest-pads", radius: 0.4, missNote: "Not placed on the chest. A pad set down anywhere else reads nothing and shocks nothing when the rhythm is checked." },
      why: "Pad placement follows the diagram printed on the pack, upper right of the sternum and lower left ribs, because a pad placed by guesswork can read the rhythm wrong or fail to deliver a shock through the heart at all. The whole point of doing it now, mid-compression, is that the pads are ready the instant the first rhythm check comes due, instead of costing a hands-off pause of their own.",
    },
    {
      id: "rhythm-check", kind: "hold", target: "rhythm-check-point", seconds: 5,
      title: "Hands off for the rhythm check",
      cue: "Call 'clear' and hold everybody off the patient while the monitor analyses.",
      why: "The rhythm check is the one moment in the whole cycle where compressions are supposed to stop, and the discipline is making it as short as it can be — call it, get every hand off at once, read the rhythm, and get compressions moving again the instant the analysis is done. A hands-off pause that runs long for no reason costs exactly the perfusion the last two minutes of compressions just built.",
      holdBreakNote: "A hand came back onto the patient before the analysis finished. The check has to run its full window with nobody touching the patient, or the reading cannot be trusted.",
    },
    {
      id: "airway-ventilation", kind: "sequence",
      targets: ["airway-adjunct", "bvm-connect", "vent-rate-dial"],
      itemNames: { "airway-adjunct": "supraglottic airway", "bvm-connect": "bag connected", "vent-rate-dial": "ventilation rate set" },
      title: "Secure the airway and set the ventilation rate",
      cue: "Insert the supraglottic airway, connect the bag, then set one breath roughly every six seconds.",
      why: "Once an advanced airway is in, ventilation stops being tied to the compression cycle at all — one breath about every six seconds, delivered on its own clock, without pausing compressions for it and without matching it to any particular beat. Ventilating faster than that raises intrathoracic pressure and drives venous return down, which is the opposite of what compressions are trying to build.",
      outOfOrderNote: "The airway goes in, then the bag connects to it, then the rate is set — a rate dialled in with nothing to breathe through yet is a number with nothing behind it.",
    },
    {
      id: "iv-io-access", kind: "select", target: "io-drill",
      title: "Establish IV or IO access without pausing compressions",
      cue: "Start the line — IV or IO — around the compressor, not through a pause in them.",
      why: "Vascular access on this call is built to happen in parallel with everything else, which is the entire reason a dedicated IV/drugs position exists rather than folding the job into whoever is free — a line started without ever asking compressions to stop is the difference between this position supporting the code and this position costing it perfusion time.",
    },
    {
      id: "epi-timing", kind: "gauge", target: "epi-clock",
      title: "The recorder calls the drug interval",
      cue: "Watch the interval clock and call epinephrine the instant it lands in the dosing window medical control sets.",
      gauge: { label: "EPI INTERVAL", speed: 0.55, green: [0.42, 0.62], readout: (t) => `${(t * 6).toFixed(1)} min since last dose`, missNote: "Off the interval medical control set for this call — hold for the window rather than guessing at the clock." },
      why: "The recorder's whole job during the drug cycle is protecting this interval, because from inside a code every minute feels like it has been longer than it has, and a dose called early or late off someone's gut sense is a dose called off the wrong clock. A recorder who is watching the interval and nothing else is what keeps the interval honest.",
    },
    {
      id: "family-update", kind: "select", target: "family-brief-board",
      title: "The family liaison steps out with a plain update",
      cue: "Give the family a short, plain-language update in the hallway — what is happening, not a prognosis.",
      why: "A family liaison exists so somebody is doing this on purpose instead of it happening by accident when a relative wanders in — a short, honest sentence in plain words, delivered calmly by the one person whose whole job right now is that hallway, is what keeps the family informed without pulling anybody off the patient to manage them.",
    },
    {
      id: "compressor-swap", kind: "sequence",
      targets: ["swap-called", "new-compressor-ready", "resume-compressions"],
      itemNames: { "swap-called": "swap called", "new-compressor-ready": "new compressor in position", "resume-compressions": "compressions resumed" },
      title: "Swap compressors at the two-minute mark",
      cue: "Call the swap, get the fresh compressor into position, and resume — the gap should be seconds, not a pause.",
      why: "Compression quality measurably degrades after about two minutes even from somebody who started strong, which is exactly why the swap is scheduled rather than left to whoever notices they are tired — calling it on the clock, having the next compressor already staged, and resuming inside a few seconds is what keeps the depth this crew has been holding from ever actually lapsing.",
      outOfOrderNote: "Call the swap, then bring the new compressor in, then resume — resuming before the swap is actually made is not a swap, it is a compressor working through fatigue nobody has addressed.",
    },
    {
      id: "termination-or-transport", kind: "sequence",
      targets: ["confirm-pulse-quality", "prepare-for-transport"],
      itemNames: { "confirm-pulse-quality": "confirm pulse and rhythm", "prepare-for-transport": "prepare for transport" },
      title: "Confirm the rhythm, then commit to transport",
      cue: "Confirm a strong, organised pulse and rhythm, then move to package the patient for transport.",
      why: "The decision to keep working a code or to move to transport is made off what the monitor and the pulse check actually show, not off how the run has felt — a confirmed pulse and organised rhythm is what turns 'we might have gotten him back' into an actual decision to package and move, made on the same evidence medical control would ask for if you called it in right now.",
      outOfOrderNote: "Confirm the pulse and rhythm before moving to prepare for transport — packaging a patient up before that confirmation is a decision made on hope rather than on what the monitor shows.",
    },
    {
      id: "operational-log", kind: "select", target: "incident-log-board",
      title: "Log the timeline",
      cue: "Log the arrest time, every intervention with its clock time, and the outcome, before the memory of the exact order fades.",
      why: "The receiving hospital, medical control's own review of the call and this crew's own quality assurance all run off this timeline afterward, not off what anybody remembers a day later — the epi times, the rhythm checks, the swap times all belong on the record while the clock times are still in front of the recorder rather than reconstructed from memory.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the crew before the next call",
      cue: "Ask the crew how they are, and name the peer-support line before anybody gets back in the truck.",
      why: "A cardiac arrest call, worked or lost, is exactly the kind of call NFPA 1584's rehabilitation principle and this department's own critical-incident stress protocol both exist for — a short check-in naming the peer-support line, said out loud before the next call rather than assumed, is what keeps one hard call from becoming the one nobody mentioned until it was a pattern.",
    },
  ],

  interrupts: [
    {
      id: "compressor-fatigue",
      kind: "Compression quality degrading",
      after: "start-compressions", delay: 4, seconds: 12,
      alert: "The compressor's chest recoil has gone shallow for the last several beats — barely half the needed depth.",
      cue: "The depth has drifted and nobody has called it. Call the swap now, do not wait for the two-minute mark.",
      target: "early-swap-call",
      why: "Compression fatigue does not wait politely for the scheduled two-minute mark, and the recorder's real-time depth feedback exists precisely so a drift like this gets caught inside a few beats rather than discovered afterward on the strip — a swap called the moment depth degrades protects the patient; a swap held for the clock protects nothing but the schedule.",
      missNote: "The depth stayed shallow for the rest of that cycle before anybody called the swap. Coronary perfusion pressure was quietly falling the whole time, and it does not rebuild instantly just because the next compressor eventually takes over — this is exactly the gap real-time depth feedback exists to close.",
      wrongNote: "Call the swap — that control, not the one you are already holding. A shallow compressor does not fix themselves by being watched for longer.",
    },
    {
      id: "family-in-distress",
      kind: "Family member entering the room",
      after: "rhythm-check", delay: 3, seconds: 12,
      alert: "A family member has pushed past the hallway and is standing in the doorway, visibly distressed, trying to see the patient.",
      cue: "The family liaison meets them at the door — calmly, and without anybody else breaking off the patient.",
      target: "family-liaison-point",
      why: "The family liaison role exists for exactly this moment: a relative who cannot wait in the hallway needs one calm person meeting them at the door, in plain words, without pulling the compressor, the airway or the recorder off what they are doing — the whole design of the pit crew is that this does not have to become everybody's problem at once.",
      missNote: "Nobody moved toward the doorway, and the family member came further into the room while the code kept running in full view. Left unmet, that moment gets worse rather than better, and it is exactly the kind of distraction a named family-liaison role is supposed to absorb before it reaches the patient.",
      wrongNote: "It is the doorway, not the monitor or the drugs. The family liaison is the one who moves — everybody else keeps doing exactly what they were doing.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, CAP_ACCENT);

    // ---------------------------------------------------------------- room
    const rug = slab(g, 2.6, 0.02, 2.0, 0.1, 0.01, -0.2, 0x6b4a4a, { radius: 0.05, rough: 0.85 });
    void rug;
    const couch = group(g, -1.7, 0, -1.5, 0.5);
    box(couch, 1.5, 0.4, 0.7, 0, 0.2, 0, 0x3d4b55, { rough: 0.8 });
    box(couch, 1.5, 0.5, 0.18, 0, 0.5, -0.26, 0x3d4b55, { rough: 0.8 });
    for (const sx of [-1, 1]) box(couch, 0.18, 0.4, 0.7, sx * 0.66, 0.35, 0, 0x33404a, { rough: 0.8 });
    const coffeeTable = group(g, -1.0, 0, -0.5);
    slab(coffeeTable, 0.7, 0.03, 0.42, 0, 0.36, 0, 0x5c4230, { radius: 0.02, rough: 0.5 });
    for (const [tx, tz] of [[-0.3, -0.17], [0.3, -0.17], [-0.3, 0.17], [0.3, 0.17]]) {
      cyl(coffeeTable, 0.015, 0.015, 0.36, tx, 0.18, tz, 0x2b211c, { rough: 0.6, seg: 8 });
    }
    const tv = group(g, -1.85, 0, -0.4, 0.5);
    box(tv, 0.06, 0.6, 0.9, 0, 0.7, 0, 0x14171a, { rough: 0.3 });
    cyl(tv, 0.03, 0.03, 0.36, -0.06, 0.35, 0, 0x1b1e22, { rough: 0.5, seg: 8 });
    box(tv, 0.02, 0.06, 0.3, -0.06, 0.55, 0, 0x1b1e22, { rough: 0.5 });
    const lamp = group(g, 1.9, 0, -1.6);
    cyl(lamp, 0.14, 0.16, 0.03, 0, 0.015, 0, 0x2b3138, { rough: 0.5, seg: 14 });
    cyl(lamp, 0.015, 0.015, 1.2, 0, 0.62, 0, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    cyl(lamp, 0.16, 0.2, 0.3, 0, 1.34, 0, 0xf0e6d0, { rough: 0.6, emissive: 0xfff2d8, ei: 0.5, seg: 16 });

    // ---------------------------------------------------------------- patient
    const patient = standingFigure(g, 0.15, -0.15, { lying: true, ry: 1.55, cloth: 0x5a5248, skin: 0xc79a72 });
    holoTag(g, "Patient — arrest", 0.15, 0.32, -0.35, { css: "#e0524a", w: 0.36 });
    reg(hits, patient, "sign-unresponsive");
    const noBreathTag = group(g, 0.55, 0.14, -0.15);
    ball(noBreathTag, 0.012, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 1.1 });
    reg(hits, noBreathTag, "sign-no-breathing");
    const noPulseTag = group(g, -0.15, 0.1, 0.15);
    ball(noPulseTag, 0.012, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 1.1 });
    reg(hits, noPulseTag, "sign-no-pulse");

    const chestPoint = group(g, 0.35, 0.16, -0.15);
    ball(chestPoint, 0.03, 0, 0, 0, CAP_ACCENT, { emissive: CAP_ACCENT, ei: 1.3 });
    reg(hits, chestPoint, "compressor-point");
    const chestPadsPoint = group(g, 0.15, 0.15, -0.05);
    ball(chestPadsPoint, 0.006, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["patient-chest-pads"] = chestPadsPoint;
    const rhythmPoint = group(g, 0.0, 0.16, -0.3);
    ball(rhythmPoint, 0.02, 0, 0, 0, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.0 });
    reg(hits, rhythmPoint, "rhythm-check-point");
    const airwayMarker = group(g, 0.35, 0.22, -0.42);
    ball(airwayMarker, 0.014, 0, 0, 0, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.0 });
    reg(hits, airwayMarker, "airway-adjunct");

    // Hands-on-during-analysis decoy, right beside the rhythm point.
    const handsOnDecoy = group(g, -0.3, 0.16, -0.4);
    ball(handsOnDecoy, 0.016, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 1.0 });
    holoTag(g, "Keep a hand on for the analysis?", -0.3, 0.32, -0.55, { css: "#e0524a", w: 0.52 });
    reg(hits, handsOnDecoy, "hands-on-during-analysis");

    // -------------------------------------------------------------- crew figures
    function crew(x, z, ry, o) {
      const p = standingPerson(g, x, z, { ry, ...o });
      p.root.userData.crew = true;
      return p;
    }
    const compressor = crew(0, -1.1, 0.2, { cloth: 0x2b5a45, hiVis: false, skin: 0xc79a72 });
    holoTag(compressor.root, "Compressor", 0, 1.85, 0, { css: "#e0524a", w: 0.3 });
    compressor.torso.rotation.x = 0.5;
    const airway = crew(-0.6, 0, 1.8, { cloth: 0x3d4b8c, hiVis: false, skin: 0xb98868 });
    holoTag(airway.root, "Airway", 0, 1.85, 0, { css: "#e0524a", w: 0.26 });
    airway.torso.rotation.x = 0.35;
    const ivDrugs = crew(0.85, 0.9, -2.5, { cloth: 0x7a5a2b, hiVis: false, skin: 0xd9a985 });
    holoTag(ivDrugs.root, "IV / drugs", 0, 1.85, 0, { css: "#e0524a", w: 0.32 });
    const recorder = crew(2.5, 0, -2.0, { cloth: 0x555b60, hiVis: false, skin: 0xc79a72 });
    holoTag(recorder.root, "Recorder", 0, 1.85, 0, { css: "#e0524a", w: 0.3 });
    const liaison = crew(-1.7, 0.85, 0.6, { cloth: 0x4a6a5a, hiVis: false, skin: 0xb98868 });
    holoTag(liaison.root, "Family liaison", 0, 1.85, 0, { css: "#e0524a", w: 0.4 });

    // Role call cards, near the doorway the crew "arrives" through.
    const roleBoard = group(g, -1.8, 0, 1.5, 0.5);
    const ROLE_SPEC = [
      ["role-compressor", "COMPRESSOR", 0.0], ["role-airway", "AIRWAY", 0.12],
      ["role-iv-drugs", "IV / DRUGS", 0.24], ["role-recorder", "RECORDER", 0.36],
      ["role-family-liaison", "FAMILY LIAISON", 0.48],
    ];
    for (const [id, label, y] of ROLE_SPEC) {
      const tile = decal(roleBoard, 0.34, 0.09, 0, 0.9 + y, 0, signFace(label, { bg: "#1b0d0c", accent: "#e0524a", scale: 0.42 }), { px: 160 });
      reg(hits, tile, id);
    }
    holoTag(roleBoard, "Roles called on arrival", 0, 1.5, 0, { css: "#e0524a", w: 0.46 });

    // -------------------------------------------------------------- equipment
    const monitor = group(g, 1.1, 0, -0.7, -0.4);
    box(monitor, 0.34, 0.28, 0.05, 0, 0.72, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    const monitorScreen = decal(monitor, 0.28, 0.2, 0, 0.72, 0.026, signFace("ANALYZE", { bg: "#0d1c24", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.7 });
    cyl(monitor, 0.09, 0.11, 0.55, 0, 0.28, 0, 0x1b1e22, { rough: 0.5, seg: 14 });
    const pads = group(monitor, 0.15, 0.55, 0.05);
    const padsMesh = box(pads, 0.1, 0.08, 0.015, 0, 0, 0, 0xdfe4e8, { rough: 0.5 });
    reg(hits, pads, "defib-pads");
    const padsCable = hose(monitor, [[0.15, 0.55, 0.05], [0.1, 0.35, 0.3], [0.0, 0.2, 0.55]], 0.008, 0x2b3138, { steps: 10, rough: 0.6 });
    void padsCable;

    const o2Tank = group(g, -1.1, 0, -0.85);
    cyl(o2Tank, 0.075, 0.08, 0.55, 0, 0.28, 0, 0x59c97b, { rough: 0.4, metal: 0.5, seg: 14 });
    const o2ValveGroup = group(o2Tank, 0, 0.58, 0);
    cyl(o2ValveGroup, 0.016, 0.016, 0.04, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 10 });
    reg(hits, o2ValveGroup, "o2-valve");
    const o2Hose = hose(o2Tank, [[0, 0.58, 0], [-0.3, 0.65, 0.3], [-0.55, 0.5, 0.55]], 0.012, 0xdfe4e8, { steps: 12, rough: 0.5 });
    void o2Hose;
    const bvm = group(o2Tank, -0.55, 0.5, 0.55);
    ball(bvm, 0.06, 0, 0, 0, 0x59c97b, { rough: 0.5 });
    torus(bvm, 0.05, 0.018, -0.1, -0.02, 0, 0xdfe4e8, { rough: 0.5, seg: 12 });
    reg(hits, bvm, "bvm-connect");
    const ventDial = group(o2Tank, -0.2, 0.66, 0.35);
    cyl(ventDial, 0.03, 0.03, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.4, seg: 12 });
    reg(hits, ventDial, "vent-rate-dial");

    // IV / IO kit and the epi clock, at the drugs position.
    const ivKit = toolChest(g, 1.6, 0.75, { ry: -0.6, color: CAP_ACCENT });
    const ioDrill = group(ivKit, -0.1, 0.85, 0.1);
    cyl(ioDrill, 0.03, 0.03, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 10 }).rotation.z = Math.PI / 2;
    box(ioDrill, 0.08, 0.03, 0.02, 0.08, 0, 0, 0xdfe4e8, { rough: 0.4 });
    holoTag(ivKit, "IV / IO kit", 0, 1.05, 0, { css: "#e0524a", w: 0.3 });
    reg(hits, ioDrill, "io-drill");

    const epiTray = group(g, 1.7, 0, 0.35);
    box(epiTray, 0.3, 0.02, 0.18, 0, 0.7, 0, 0xdfe4e8, { rough: 0.5 });
    for (let i = 0; i < 3; i++) {
      cyl(epiTray, 0.012, 0.012, 0.09, -0.1 + i * 0.09, 0.75, 0, 0xf2c14b, { rough: 0.35, seg: 8 });
    }
    holoTag(epiTray, "Epinephrine tray", 0, 0.82, 0, { css: "#e0524a", w: 0.36 });
    // Second-dose temptation, sitting right beside the tray.
    const epiEarly = group(epiTray, 0.22, 0.78, 0);
    cyl(epiEarly, 0.012, 0.012, 0.09, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 0.9, rough: 0.35, seg: 8 });
    holoTag(epiTray, "Second dose already?", 0.22, 0.92, 0, { css: "#e0524a", w: 0.44 });
    reg(hits, epiEarly, "epi-too-soon");

    const epiClock = instrument(g, 1.9, 1.02, -0.3, { ry: -0.6, idle: "-- : --", color: CAP_ACCENT });
    holoTag(epiClock, "Drug interval", 0, 0.2, 0, { css: "#e0524a", w: 0.32 });
    reg(hits, epiClock, "epi-clock");

    // Pulse/rhythm confirmation and the transport decision, at the monitor.
    const pulseCheck = group(monitor, -0.2, 0.55, 0.03);
    ball(pulseCheck, 0.014, 0, 0, 0, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.1 });
    reg(hits, pulseCheck, "confirm-pulse-quality");
    const transportBoard = decal(g, 0.3, 0.14, 1.55, 0.7, -1.1, signFace("TRANSPORT", { bg: "#0d1c14", accent: "#59c97b", scale: 0.5 }), { px: 160 });
    holoTag(g, "Prepare for transport", 1.55, 0.84, -1.1, { css: "#e0524a", w: 0.4 });
    reg(hits, transportBoard, "prepare-for-transport");

    // IO/IV pause temptation, a control right beside the compressor point that
    // reads as "stop and hold still for the line".
    const pauseForIv = group(g, 0.55, 0.16, 0.15);
    ball(pauseForIv, 0.016, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 0.9 });
    holoTag(g, "Hold compressions for the line?", 0.55, 0.32, 0.3, { css: "#e0524a", w: 0.5 });
    reg(hits, pauseForIv, "pause-for-iv");

    // General trash bin — wrong destination for the used IO needle.
    const trashBin = group(g, 1.9, 0, 1.0, -0.3);
    cyl(trashBin, 0.14, 0.16, 0.3, 0, 0.15, 0, 0x4a545a, { rough: 0.7, seg: 14 });
    const usedIo = cyl(trashBin, 0.008, 0.008, 0.08, 0.03, 0.28, 0.02, 0xdfe4e8, { rough: 0.5, seg: 8 });
    usedIo.rotation.z = 0.5;
    holoTag(trashBin, "Used IO needle — general trash?", 0, 0.36, 0, { css: "#e0524a", w: 0.5 });
    reg(hits, usedIo, "sharps-in-trash");

    // Compressor swap trio.
    const swapBoard = group(g, 0.75, 0, -1.15, 0.4);
    const swapCall = decal(swapBoard, 0.2, 0.08, -0.14, 1.05, 0, signFace("SWAP", { bg: "#1b0d0c", accent: "#e0524a", scale: 0.5 }), { px: 128 });
    reg(hits, swapCall, "swap-called");
    const newCompressorReady = decal(swapBoard, 0.2, 0.08, 0.0, 1.05, 0, signFace("READY", { bg: "#1b0d0c", accent: "#f2c14b", scale: 0.5 }), { px: 128 });
    reg(hits, newCompressorReady, "new-compressor-ready");
    const resumeCompressions = decal(swapBoard, 0.2, 0.08, 0.14, 1.05, 0, signFace("RESUME", { bg: "#1b0d0c", accent: "#59c97b", scale: 0.5 }), { px: 128 });
    reg(hits, resumeCompressions, "resume-compressions");
    holoTag(swapBoard, "Two-minute swap", 0, 1.2, 0, { css: "#e0524a", w: 0.36 });

    // Early-swap call — the interrupt's own control, distinct from the board.
    const earlySwap = group(g, 1.0, 0, -0.9);
    box(earlySwap, 0.09, 0.09, 0.03, 0, 0.75, 0, 0xf2c14b, { rough: 0.4, metal: 0.3 });
    holoTag(earlySwap, "Call the swap now", 0, 0.86, 0, { css: "#e0524a", w: 0.4 });
    reg(hits, earlySwap, "early-swap-call");

    // Family liaison's brief board, in the hallway direction.
    const familyBoard = holoPanel(g, 0.5, 0.32, -1.55, 1.6, 1.55, (cx, w, h) => {
      cx.fillStyle = "rgba(18,6,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e0524a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde3e0";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("FAMILY UPDATE", w / 2, h * 0.36);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#f2c2ba";
      cx.fillText("Plain words. What, not a prognosis.", w / 2, h * 0.68);
    }, { ry: 0.5, accent: CAP_ACCENT });
    reg(hits, familyBoard, "family-brief-board");

    // Family-liaison point at the doorway, and the family member who appears.
    const doorway = group(g, -2.1, 0, 1.9, 0.5);
    box(doorway, 0.08, 2.0, 0.9, 0, 1.0, 0, 0x2a2b31, { rough: 0.7 });
    const liaisonPoint = group(g, -1.8, 0, 1.75);
    ball(liaisonPoint, 0.02, 0, 1.3, 0, CAP_ACCENT, { emissive: CAP_ACCENT, ei: 1.2 });
    holoTag(liaisonPoint, "Meet them here, calmly", 0, 1.5, 0, { css: "#e0524a", w: 0.44 });
    reg(hits, liaisonPoint, "family-liaison-point");
    const familyMember = crew(-2.5, 2.5, -0.6, { cloth: 0x6b4a5a, hiVis: false, skin: 0xc99878 });
    familyMember.root.visible = false;

    // Incident log and crew check-in boards.
    const logBoard = holoPanel(g, 0.56, 0.4, 1.9, 1.7, 1.55, (cx, w, h) => {
      cx.fillStyle = "rgba(18,6,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e0524a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde3e0";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("INCIDENT LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#f2c2ba";
      cx.fillText("Arrest time · every drug · every check", w / 2, h * 0.6);
      cx.fillText("Signed off before the truck leaves", w / 2, h * 0.78);
    }, { ry: -0.5, accent: CAP_ACCENT });
    reg(hits, logBoard, "incident-log-board");

    const checkinBoard = holoPanel(g, 0.5, 0.34, -0.4, 1.7, -1.95, (cx, w, h) => {
      cx.fillStyle = "rgba(18,6,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e0524a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde3e0";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.36);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#f2c2ba";
      cx.fillText("How's everybody · peer-support line named", w / 2, h * 0.68);
    }, { ry: 0.3, accent: CAP_ACCENT });
    reg(hits, checkinBoard, "crew-checkin-board");

    let familyIn = false;

    return {
      hits,
      footprint: 2.7,
      spawnLook: new THREE.Vector3(0.4, 1.1, -0.2),

      onStepComplete(step) {
        if (step.id === "open-o2") o2ValveGroup.rotation.y = Math.PI / 2;
        if (step.id === "pads-placement") { padsMesh.material = mat(0x59c97b, { rough: 0.4 }); }
        if (step.id === "airway-ventilation") repaint(monitorScreen, signFace("VENTILATING", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
        if (step.id === "termination-or-transport") repaint(monitorScreen, signFace("ROSC", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "operational-log") repaint(logBoard.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(18,6,6,0.9)"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
          cx.fillStyle = "#eafbf1";
          cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle";
          cx.fillText("LOGGED", w / 2, h * 0.4);
          cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
          cx.fillStyle = "#b7e6c8";
          cx.fillText("Timeline complete", w / 2, h * 0.68);
        });
      },

      onInterrupt(it) {
        if (it.id === "compressor-fatigue") {
          compressor.arms[0].shoulder.rotation.x = -0.2;
          earlySwap.children[0].material = mat(0xffb020, { emissive: 0xffb020, ei: 1.8, rough: 0.4 });
        }
        if (it.id === "family-in-distress") {
          familyIn = true;
          familyMember.root.visible = true;
          familyMember.root.position.set(-1.95, 0, 1.85);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "compressor-fatigue") {
          compressor.arms[0].shoulder.rotation.x = 0;
          earlySwap.children[0].material = mat(0xf2c14b, { rough: 0.4, metal: 0.3 });
        }
        if (it.id === "family-in-distress") {
          familyIn = false;
          familyMember.root.position.set(-2.5, 0, 2.5);
          familyMember.root.visible = false;
        }
      },

      animate(t, dt, session) {
        const tr = session?.track;
        if (session?.step?.id === "start-compressions") {
          const inBand = tr ? tr.v >= 0.42 && tr.v <= 0.64 : true;
          chestPoint.material = mat(inBand ? 0x59c97b : 0xe0524a, { emissive: inBand ? 0x59c97b : 0xe0524a, ei: 1.3 });
          compressor.arms[0].shoulder.rotation.x = -0.3 + Math.sin(t * 8) * 0.25;
          compressor.arms[1].shoulder.rotation.x = -0.3 + Math.sin(t * 8) * 0.25;
        }
        recorder.head.rotation.y = Math.sin(t * 0.5) * 0.2;
        void familyIn; void handsOnDecoy; void pauseForIv; void ivDrugs; void airway;
      },
    };
  },
};
