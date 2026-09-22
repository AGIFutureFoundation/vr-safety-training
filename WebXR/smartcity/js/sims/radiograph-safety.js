import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Radiograph Safety VR — Dental & Oral Health, station two.
// A bitewing series taken under ALARA: the selection criteria checked before
// the tubehead ever moves, the pregnancy question asked, the patient shielded,
// the sensor and positioning device set for each view, the operator behind
// the barrier at the distance and angle the state's radiation control
// regulations require, the exposure made only with the room clear, the image
// checked before the next, and every exposure logged.

const RGS_ACCENT = 0xf2b34a;

export const SIM_RADIOGRAPH_SAFETY = {
  id: "radiograph-safety",
  index: "120",
  domain: "Dental",
  trade: "Dental hygienist — radiographer",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "SEIU and UFCW dental and clinic staff; the ADHA's standards for clinical dental hygiene practice; the ADA/FDA's Dental Radiographic Examinations recommendations (selection criteria); the ALARA principle and California's Title 17 radiation control regulations; the Dental Hygiene Board of California's radiography permit; OSHA 29 CFR 1910.1030 and the CDC's Guidelines for Infection Control in Dental Health-Care Settings for the sensor barrier",
  name: "Radiograph Safety",
  title: simTitle("Radiograph Safety"),
  tagline: "A bitewing series under ALARA: selection criteria, shielding, positioning, the operator behind the barrier, exposure only with the room clear, and every image logged",
  accent: RGS_ACCENT,
  accentCss: "#f2b34a",
  parSeconds: 280,
  footprint: 2.3,
  badge: { id: "alara-certified", name: "ALARA Certified", note: "A full bitewing series taken with the selection criteria checked, the patient shielded, every exposure made from behind the barrier, and the log complete" },

  game: system({
    name: "Beam Discipline",
    currency: "mAs",
    ranks: ["Radiography Trainee", "Registered Operator", "Series Lead", "Radiation Safety Officer", "Beam Discipline Certified"],
    badges: [
      { id: "criteria-first", name: "Criteria First", note: "Selection criteria and the pregnancy question both answered clean", test: AWARD.all(AWARD.stepClean("criteria-panel"), AWARD.stepClean("pregnancy-panel")) },
      { id: "never-in-the-beam", name: "Never in the Beam", note: "Every exposure made from behind the barrier, nothing skipped", test: AWARD.safe },
      { id: "diagnostic-first-try", name: "Diagnostic First Try", note: "Exposure settings inside the tight band every time", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-series", name: "Clean Series", note: "No corrections anywhere in the series", test: AWARD.clean },
      { id: "steady-hand", name: "Steady Hand", note: "Both timed holds carried clean without a break", test: AWARD.unbroken },
      { id: "series-in-time", name: "Series in Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unshielded-exposure": "You reached for the exposure switch before the lead apron and thyroid collar were on the patient. Shielding is not optional weight on the chest — it is the difference between scatter absorbed by lead and scatter absorbed by thyroid tissue, and ALARA means every exposure the patient is not shielded for is one that was avoidable.",
    "reused-barrier": "That barrier sleeve already has a peeled tab — it was used on the last patient. A torn or reused barrier defeats the entire point of covering the sensor: it is there so the sensor that just sat in one patient's mouth is not the same surface that goes into the next one's.",
    "fire-from-chairside": "You reached to trigger the exposure from beside the chair instead of from behind the barrier. Standing in the room during an exposure puts you in the scatter field on every image of every patient all day — the regulation's distance and angle exist because the dose that is trivial once is not trivial repeated hundreds of times a year.",
    "skip-log": "You moved to the next view without logging the one you just took. California's Title 17 radiation control regulations require an exposure record for a reason: it is how an unusually high dose, a faulty timer or a pattern across patients ever gets noticed instead of disappearing into images nobody can trace back to a setting.",
  },

  lateNotes: {
    "exposure-switch": "Nothing is ready to expose yet — the settings and the positioning come first, or this switch has nothing to fire correctly.",
    "log-panel": "There is nothing to log until the exposure has actually been made.",
  },

  steps: [
    {
      id: "criteria-panel", kind: "select", target: "criteria-panel",
      title: "Check the selection criteria",
      cue: "Confirm why these images are needed now, against the chart and the last exposure date.",
      why: "The ADA/FDA's selection criteria exist so radiographs are ordered by clinical need and the interval since the last series, not by habit or by the calendar. A bitewing taken because it is \"time for x-rays\" rather than because something on the chart calls for it is a dose with no diagnostic question behind it.",
    },
    {
      id: "pregnancy-panel", kind: "select", target: "pregnancy-panel",
      title: "Ask and record the pregnancy question",
      cue: "Ask the patient directly and record the answer before anything else proceeds.",
      why: "The question is asked every time, out loud, regardless of what an old chart says, because a status can change between visits and nobody downstream can act on an answer that was never recorded.",
    },
    {
      id: "barrier-sleeve", kind: "drag", target: "barrier-sleeve",
      title: "Fit a fresh barrier on the sensor",
      cue: "Take a sealed barrier sleeve and cover the sensor before it touches this patient.",
      drag: { to: "sensor-body", radius: 0.35, missNote: "Not seated on the sensor — the sleeve has to cover the whole body and the cable boot before it goes anywhere near a mouth." },
      why: "The sensor is reused patient after patient; the barrier is the only thing that changes between them. A fresh, intact sleeve on this sensor for this patient is the whole of the infection-control claim the practice can make about digital sensors.",
    },
    {
      id: "shielding", kind: "sequence", anyOrder: true,
      forceClass: "light",
      robotNote: "The apron and collar are laid on the patient rather than pressed, which is contact a robot may make.",
      targets: ["lead-apron", "thyroid-collar"],
      itemNames: { "lead-apron": "lead apron", "thyroid-collar": "thyroid collar" },
      title: "Shield the patient",
      cue: "Drape the lead apron and the thyroid collar before the tubehead is aimed at anyone.",
      why: "The apron and collar are both worn on every patient for every exposure — the collar because the thyroid is one of the more radiosensitive tissues anywhere near the beam, and the apron because scatter does not stop at the collarbone.",
    },
    {
      id: "positioning-device", kind: "drag", target: "positioning-device",
      title: "Attach the positioning device",
      cue: "Fit the bitewing holder to the sensor and seat it against the teeth for this view.",
      drag: { to: "bite-block-socket", radius: 0.4, missNote: "Not seated in the holder socket — the sensor has to sit square in the bite block before the tubehead is aimed at it." },
      why: "A positioning device holds the sensor parallel to the tooth and aims the beam through a fixed ring rather than through wherever the patient happens to be biting. Free-handing the sensor is how a series comes back needing to be retaken — another exposure that ALARA says should never have been necessary.",
    },
    {
      id: "tube-head-align", kind: "turn", target: "tube-head-align",
      forceClass: "light",
      robotNote: "The tubehead swings past the patient's face — inside the keep-out volume, under a light ceiling.",
      title: "Align the tubehead to the aiming ring",
      cue: "Bring the cone square onto the positioning device's aiming ring.",
      turn: { turns: 0.3, axis: "y", label: "TUBEHEAD ANGLE" },
      why: "The aiming ring on the positioning device is the target the cone has to be square to — off by even a few degrees and the beam either cone-cuts the image or elongates the teeth on it, and either one is a retake and another exposure.",
    },
    {
      id: "exposure-settings", kind: "gauge", target: "exposure-settings",
      title: "Set the exposure for this patient's size",
      cue: "Dial the kV, mA and time to this patient's size and commit inside the band.",
      gauge: { label: "kVp / mA / TIME", speed: 0.62, green: [0.4, 0.62], readout: (t) => `${Math.round(60 + t * 10)} kVp`, missNote: "Off the setting for this patient's size — too little underexposes and forces a retake, too much is dose with nothing gained." },
      why: "A child and a large adult do not take the same exposure, and the machine does not know which one is in the chair unless it is told. The right setting the first time is the one that produces a diagnostic image without a second exposure to get there.",
    },
    {
      id: "operator-position", kind: "hold", target: "exposure-switch", seconds: 5,
      title: "Expose from behind the barrier",
      cue: "From behind the barrier, hold the exposure switch until the cycle completes.",
      why: "The exposure switch is a dead-man control on purpose — it fires only while held, and it is held from behind a barrier or at the distance and angle the regulation sets, because the operator taking this same exposure hundreds of times a year is the one ALARA is actually protecting.",
      holdBreakNote: "The switch was released before the cycle finished — the exposure is incomplete and the image will need retaking from the start.",
    },
    {
      id: "image-check", kind: "select", target: "image-check",
      title: "Check the image for diagnostic quality",
      cue: "Review the image on the monitor before moving to the next view.",
      why: "An image checked now, with the patient still positioned and the holder still in place, can be retaken in seconds. The same problem found after the patient has left the chair means calling them back for another exposure that a few seconds of review would have caught.",
    },
    {
      id: "remaining-views", kind: "sequence", anyOrder: true,
      noRobot: true, forceClass: "light",
      robotNote: "Every further view means the sensor was moved inside the mouth again.",
      targets: ["view-molar-r", "view-pm-l", "view-molar-l"],
      itemNames: { "view-molar-r": "right molar bitewing", "view-pm-l": "left premolar bitewing", "view-molar-l": "left molar bitewing" },
      title: "Complete the remaining views",
      cue: "Take the right molar, left premolar and left molar bitewings — order doesn't matter.",
      why: "A bitewing series is four views because no single image shows every interproximal contact in the mouth; skipping one to save an exposure just moves the missed decay past the point this series exists to catch it.",
    },
    {
      id: "reseat-sensor", kind: "hold", target: "reseat-sensor", seconds: 5,
      noRobot: true, forceClass: "light",
      robotNote: "Intraoral: the sensor is seated in the mouth, between the teeth and the tongue.",
      title: "Reposition the sensor for the next view",
      cue: "Hold the holder steady while you reseat the sensor against the next arch.",
      why: "A sensor that moves while it is being reseated is a retake in the making — holding the holder steady until it is genuinely seated is what keeps the next exposure diagnostic on the first try instead of the second.",
      holdBreakNote: "The holder slipped before the sensor was properly seated — steady it fully before the next exposure.",
    },
    {
      id: "log-exposure", kind: "select", target: "log-panel",
      title: "Log the exposure",
      cue: "Record the view, the settings and the count on the exposure log.",
      why: "The log is the only record that ties a dose to a patient, a date and a setting. Without it, a machine drifting out of calibration or a pattern of repeat exposures on one operator has nothing for anyone to notice it in.",
    },
    {
      id: "close-out", kind: "find", noHint: true,
      forceClass: "light",
      robotNote: "Lifting the apron back off the patient is the last contact of the appointment.",
      targets: ["apron-removed", "sensor-removed", "tube-parked"],
      itemNames: { "apron-removed": "lead apron and collar off and hung", "sensor-removed": "sensor out of the patient's mouth", "tube-parked": "tubehead returned to its parked position" },
      itemNotes: {
        "apron-removed": "Left on the patient, the apron becomes dead weight on someone about to be reclined for the rest of the visit.",
        "sensor-removed": "A sensor still seated after the last exposure is a cable and a holder the patient is now sitting on, not a finished series.",
        "tube-parked": "A tubehead left extended over the chair is the next hygienist's forehead — it is parked the same way every time for exactly that reason.",
      },
      decoyNotes: {
        "spare-barrier-box": "The spare barrier box is exactly where it should be — leave it stocked for the next patient.",
      },
      title: "Walk the room before releasing the patient",
      cue: "Three things need to be true before this patient leaves the chair — find them.",
      why: "A series that scores as complete but leaves the sensor in the patient's mouth or the tubehead parked over their face is not actually finished — the room is left the way the next exposure, on the next patient, needs it to be.",
    },
  ],

  interrupts: [
    {
      id: "parent-enters",
      kind: "Room breach during exposure",
      after: "operator-position", delay: 3, seconds: 10,
      alert: "The door opens and a parent walks straight toward the chair to comfort their child, crossing into the room while the exposure switch is still held down.",
      cue: "Somebody just walked into the field mid-exposure.",
      target: "abort-exposure",
      why: "The barrier and the distance protect the operator, not a parent who did not know to stay out. The moment anyone else crosses into the room during an exposure, the correct response is to release the switch and stop the cycle, not to keep holding it because the count is almost done.",
      missNote: "You let the exposure run to completion with the parent standing in the room. Whatever the image came out like, an unplanned person just took scatter dose that ALARA exists specifically to prevent — the fix is stopping the exposure the instant it happens, not finishing it.",
      wrongNote: "It is the exposure switch. Release it and stop the cycle before anything else happens.",
    },
    {
      id: "torn-barrier-found",
      kind: "Equipment defect",
      after: "reseat-sensor", delay: 3, seconds: 10,
      alert: "As you reseat the sensor for the next view, you notice the disposable barrier has a tear right over the cable boot.",
      cue: "That barrier is compromised, mid-series.",
      target: "barrier-box",
      why: "A tear at the cable boot means the sensor underneath is no longer actually covered, whatever the rest of the sleeve looks like. The series pauses, a fresh barrier goes on, and the exposure continues — a torn barrier is not something to note for later.",
      missNote: "You kept going with a torn barrier over the sensor. The whole reason the sleeve exists is to keep the sensor's actual surface off the next thing it touches, and a tear at the exact point the sensor sees the most contact defeats that immediately.",
      wrongNote: "It is the spare barrier box. Replace the torn sleeve before the next exposure, not after it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RGS_ACCENT);

    // -------------------------------------------------------------- the chair
    const chair = group(g, 0, 0, -1.7);
    cyl(chair, 0.22, 0.28, 0.42, 0, 0.21, 0, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 20, finish: "brushed" });
    cyl(chair, 0.09, 0.09, 0.18, 0, 0.46, 0, 0x5a636b, { rough: 0.4, metal: 0.6, seg: 14 });
    slab(chair, 0.62, 0.14, 0.72, 0, 0.56, -0.1, 0x3f6f86, { radius: 0.06, rough: 0.6 });
    const back = slab(chair, 0.6, 0.85, 0.16, 0, 0.94, -0.62, 0x3f6f86, { radius: 0.08, rough: 0.6 });
    back.rotation.x = -0.42;
    const headrest = slab(chair, 0.34, 0.24, 0.1, 0, 1.34, -1.02, 0x3f6f86, { radius: 0.05, rough: 0.6 });
    headrest.rotation.x = -0.42;
    const footrest = slab(chair, 0.56, 0.12, 0.6, 0, 0.42, 0.55, 0x3f6f86, { radius: 0.06, rough: 0.6 });
    footrest.rotation.x = 0.3;
    for (const sx of [-1, 1]) box(chair, 0.08, 0.05, 0.5, sx * 0.34, 0.68, -0.1, 0x2f5768, { rough: 0.65 });

    // The chair reclines; the patient's head tilts back with it rather than
    // the whole rigid figure pivoting, which would swing the legs up off the
    // footrest and read as a cross rather than a reclined person. The arms
    // rest angled in rather than straight down at the sides, which is what
    // was reading as a stark cross against the pale gown fabric.
    const patient = seatedFigure(chair, 0, 0.6, -0.36, { skin: 0xc99878, cloth: 0xb9c4c9 });
    // Robot training: this is a person, so the head and the torso are
    // keep-out volumes an embodied trainee never enters unless the step it
    // is working declares patient contact. See shared/robot-embodiment.js.
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    patient.head.rotation.x = -0.34;
    for (const [arm, sx] of [[patient.arms[0], -1], [patient.arms[1], 1]]) {
      arm.shoulder.rotation.set(-0.18, 0, sx * 0.16);
    }
    const mouthSite = group(patient.head, 0, -0.08, 0.1);

    // Lead apron and thyroid collar, draped once earned.
    const apron = slab(chair, 0.5, 0.7, 0.06, 0, 0.78, -0.28, 0x3a3f45, { radius: 0.03, rough: 0.75 });
    apron.visible = false;
    const collar = torus(chair, 0.14, 0.045, 0, 1.08, -0.42, 0x3a3f45, { rough: 0.75, seg: 8, seg2: 18 });
    collar.rotation.x = Math.PI / 2 - 0.4;
    collar.visible = false;
    const apronPick = group(g, 1.7, 0, -1.55);
    box(apronPick, 0.4, 0.55, 0.05, 0, 0.5, 0, 0x3a3f45, { rough: 0.7 });
    holoTag(apronPick, "lead apron", 0, 0.82, 0, { css: "#f2b34a", w: 0.3 });
    reg(hits, apronPick, "lead-apron");
    const collarPick = group(g, 1.7, 0, -1.3);
    torus(collarPick, 0.09, 0.03, 0, 0.7, 0, 0x3a3f45, { rough: 0.7, seg: 8, seg2: 16 });
    holoTag(collarPick, "thyroid collar", 0, 0.82, 0, { css: "#f2b34a", w: 0.34 });
    reg(hits, collarPick, "thyroid-collar");

    // Two chairside traps: firing before the patient is shielded, and firing
    // from beside the chair instead of from behind the barrier.
    const noShieldBtn = box(g, 0.1, 0.1, 0.05, 1.05, 0.95, -1.4, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(g, "expose — not shielded?", 1.05, 1.1, -1.4, { css: "#f0645b", w: 0.44 });
    reg(hits, noShieldBtn, "unshielded-exposure");
    const chairsideBtn = box(g, 0.1, 0.1, 0.05, 1.25, 0.75, -1.7, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(g, "fire from here?", 1.25, 0.9, -1.7, { css: "#f0645b", w: 0.34 });
    reg(hits, chairsideBtn, "fire-from-chairside");

    // -------------------------------------------------------- sensor + barrier
    const sensorTable = group(g, -1.5, 0, -1.5);
    box(sensorTable, 0.4, 0.55, 0.32, 0, 0.275, 0, 0x8b929a, { rough: 0.55, metal: 0.3 });
    const sensorBody = box(sensorTable, 0.09, 0.012, 0.13, 0, 0.58, 0, 0xdfe4e8, { rough: 0.35, metal: 0.4 });
    reg(hits, sensorBody, "sensor-body");
    const barrierSleevePick = box(sensorTable, 0.1, 0.002, 0.15, 0, 0.6, -0.1, 0xeaf6ff, { rough: 0.25, opacity: 0.55, transparent: true });
    holoTag(sensorTable, "barrier sleeve", 0, 0.72, -0.1, { css: "#f2b34a", w: 0.3 });
    reg(hits, barrierSleevePick, "barrier-sleeve");
    const barrierFitted = box(sensorTable, 0.11, 0.014, 0.15, 0, 0.6, 0, 0xeaf6ff, { rough: 0.25, opacity: 0.5, transparent: true });
    barrierFitted.visible = false;
    // Fresh-barrier supply box — also the interrupt's response target.
    const barrierBox = box(g, 0.24, 0.14, 0.18, -2.1, 0.8, -1.7, 0xeaf6ff, { rough: 0.4, opacity: 0.75, transparent: true });
    holoTag(g, "spare barriers", -2.1, 0.93, -1.7, { css: "#f2b34a", w: 0.32 });
    reg(hits, barrierBox, "barrier-box");
    // A used, already-peeled sleeve nearby — the reuse trap.
    const usedBarrier = box(g, 0.1, 0.002, 0.15, -1.9, 0.42, -1.85, 0xd8d0c0, { rough: 0.6, opacity: 0.6, transparent: true });
    holoTag(g, "used sleeve", -1.9, 0.5, -1.85, { css: "#f0645b", w: 0.26 });
    reg(hits, usedBarrier, "reused-barrier");

    // Positioning device / bite block, on the tray until fitted.
    const posDevicePick = group(sensorTable, 0.12, 0.58, 0.14);
    cyl(posDevicePick, 0.006, 0.006, 0.14, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    torus(posDevicePick, 0.045, 0.006, 0, 0.09, 0, 0xdfe4e8, { rough: 0.3, metal: 0.4, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(sensorTable, "positioning device", 0.12, 0.78, 0.14, { css: "#f2b34a", w: 0.36 });
    reg(hits, posDevicePick, "positioning-device");
    const biteBlockSocket = group(mouthSite, 0, 0, 0.02);
    const socketMark = ball(biteBlockSocket, 0.015, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, socketMark, "bite-block-socket");
    const seatedDevice = group(mouthSite, 0, 0, 0.03);
    cyl(seatedDevice, 0.006, 0.006, 0.14, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    seatedDevice.visible = false;

    // -------------------------------------------------------------- tubehead
    const tubeArm = group(g, 1.1, 0, -2.3);
    cyl(tubeArm, 0.045, 0.05, 2.2, 0, 1.1, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 14 });
    const cone = group(tubeArm, -0.6, 1.5, 0.6, -0.6);
    box(cone, 0.3, 0.3, 0.3, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.5 });
    cyl(cone, 0.08, 0.1, 0.4, 0, -0.1, 0.32, 0xdfe4e8, { rough: 0.35, metal: 0.4, seg: 18 }).rotation.x = Math.PI / 2;
    reg(hits, cone, "tube-head-align");
    // Aiming ring, mounted on the positioning device by the mouth.
    torus(mouthSite, 0.05, 0.006, 0, 0, 0.16, RGS_ACCENT, { emissive: RGS_ACCENT, ei: 0.6, rough: 0.4, seg: 6, seg2: 18 });

    // Exposure control panel with the setting dial.
    const expPanel = instrument(g, -0.6, 1.1, -3.6, { idle: "-- kVp", color: RGS_ACCENT, w: 0.16, d: 0.24 });
    holoTag(expPanel, "exposure settings", 0, 0.17, 0, { css: "#f2b34a", w: 0.36 });
    reg(hits, expPanel, "exposure-settings");

    // ------------------------------------------------------------- the barrier
    const shield = group(g, 1.55, 0, -3.3, -0.35);
    slab(shield, 0.05, 1.5, 1.0, 0, 0.9, 0, 0x9fa8ae, { radius: 0.02, rough: 0.35, metal: 0.5, opacity: 0.85, transparent: true });
    box(shield, 0.06, 0.15, 0.15, 0.03, 0.8, -0.3, 0xf2b34a, { rough: 0.45 });
    const exposureBtn = cyl(shield, 0.035, 0.035, 0.02, 0.05, 0.8, -0.3, 0x59c97b, { rough: 0.4, seg: 16 });
    holoTag(shield, "exposure switch", 0.05, 0.95, -0.3, { css: "#f2b34a", w: 0.34 });
    reg(hits, exposureBtn, "exposure-switch");
    // A separate panic/abort button on the shield — the correct response to
    // someone crossing into the room mid-exposure, distinct from the switch
    // the operator is already holding down.
    box(shield, 0.06, 0.12, 0.12, 0.03, 0.55, -0.3, 0x2b3138, { rough: 0.5 });
    const abortBtn = cyl(shield, 0.03, 0.03, 0.02, 0.055, 0.55, -0.3, 0xd8232a, { rough: 0.4, seg: 16 });
    holoTag(shield, "abort exposure", 0.05, 0.68, -0.3, { css: "#f0645b", w: 0.36 });
    reg(hits, abortBtn, "abort-exposure");
    const operator = standingFigure(g, 1.55, -4.3, { ry: 2.7, cloth: 0x8a6f2f, skin: 0xb98a63 });
    holoTag(operator, "operator", 0, 1.9, 0, { css: "#f2b34a", w: 0.3 });

    // The image monitor.
    const monitor = holoPanel(g, 0.85, 0.65, -2.2, 1.55, -3.9, (cx, w, h) => {
      cx.fillStyle = "#08111a"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b34a"; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#3a4048"; cx.fillRect(w * 0.12, h * 0.2, w * 0.76, h * 0.65);
      cx.fillStyle = "#dfe6ec"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.textAlign = "center"; cx.fillText("BITEWING — R PM", w / 2, h * 0.14);
    }, { accent: 0xf2b34a });
    reg(hits, monitor, "image-check");

    // Selection-criteria and pregnancy panels on the back wall.
    const criteriaPanel = holoPanel(g, 1.0, 0.7, -2.4, 1.55, -4.55, (cx, w, h) => {
      cx.fillStyle = "rgba(10,16,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b34a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#fbeecb";
      cx.fillText("SELECTION CRITERIA", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#e6d3a0";
      ["Clinical indication: proximal caries risk", "Last bitewings: 14 months ago",
       "Interval meets ADA/FDA guidance"].forEach((l, i) => cx.fillText(l, w * 0.05, h * 0.34 + i * h * 0.16));
    }, { accent: 0xf2b34a });
    reg(hits, criteriaPanel, "criteria-panel");

    const pregnancyPanel = holoPanel(g, 0.85, 0.55, -0.9, 1.5, -4.55, (cx, w, h) => {
      cx.fillStyle = "rgba(10,16,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b34a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#fbeecb";
      cx.fillText("PREGNANCY STATUS", w * 0.05, h * 0.2);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#e6d3a0";
      cx.fillText("Ask directly · record the answer", w * 0.05, h * 0.5);
    }, { accent: 0xf2b34a });
    reg(hits, pregnancyPanel, "pregnancy-panel");

    // Exposure log clipboard.
    const logPanel = decal(g, 0.34, 0.44, 0.5, 1.15, -4.5,
      paperFace("EXPOSURE LOG", ["View · kV · mA · s", "____________"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 240 });
    reg(hits, logPanel, "log-panel");
    // The unlogged-exit trap, beside the log clipboard.
    const skipLogBtn = box(g, 0.1, 0.1, 0.04, 0.9, 1.15, -4.5, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(g, "next view, skip the log?", 0.9, 1.28, -4.5, { css: "#f0645b", w: 0.46 });
    reg(hits, skipLogBtn, "skip-log");

    // The four bitewing views, as small markers around the mouth site.
    const viewR = ball(mouthSite, 0.02, -0.08, 0, 0.02, 0x59c97b, { rough: 0.6, seg: 10 });
    void viewR;
    const viewMolarR = ball(mouthSite, 0.02, -0.08, 0, -0.02, RGS_ACCENT, { rough: 0.6, seg: 10 });
    reg(hits, viewMolarR, "view-molar-r");
    const viewPmL = ball(mouthSite, 0.02, 0.08, 0, 0.02, RGS_ACCENT, { rough: 0.6, seg: 10 });
    reg(hits, viewPmL, "view-pm-l");
    const viewMolarL = ball(mouthSite, 0.02, 0.08, 0, -0.02, RGS_ACCENT, { rough: 0.6, seg: 10 });
    reg(hits, viewMolarL, "view-molar-l");

    // Reseat control for the next view.
    const reseatMark = ball(mouthSite, 0.018, 0, 0.02, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reseatMark, "reseat-sensor");

    // ------------------------------------------------------------ end-of-visit
    const aproneOff = box(chair, 0.1, 0.02, 0.08, 0.4, 0.9, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, aproneOff, "apron-removed");
    const sensorOffMark = ball(mouthSite, 0.016, 0, -0.02, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sensorOffMark, "sensor-removed");
    const tubeParkedMark = box(tubeArm, 0.1, 0.1, 0.1, 0, 2.0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tubeParkedMark, "tube-parked");
    const spareBox = box(g, 0.2, 0.12, 0.16, -2.4, 0.42, -1.4, 0xeaf6ff, { rough: 0.5, opacity: 0.6, transparent: true });
    holoTag(g, "spare barrier box", -2.4, 0.53, -1.4, { css: "#8fb3c4", w: 0.34 });
    reg(hits, spareBox, "spare-barrier-box");

    // Cabinet for depth along the side wall.
    const cabinet = group(g, -2.9, 0, -0.4, 0.5);
    box(cabinet, 1.0, 0.85, 0.5, 0, 0.425, 0, 0xdfe4e8, { rough: 0.55, metal: 0.15 });
    box(cabinet, 0.85, 0.06, 0.4, 0, 0.86, 0, 0xc7ccd1, { rough: 0.5 });

    // Parent, waiting outside the door until the interruption moves them in.
    const parent = standingFigure(g, 5.2, 2.0, { ry: -1.9, cloth: 0x6f5a86, skin: 0xc9a479, atStation: true });
    parent.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.7),

      onStepComplete(step) {
        if (step.id === "barrier-sleeve") { barrierSleevePick.visible = false; barrierFitted.visible = true; }
        if (step.id === "shielding") { apron.visible = true; collar.visible = true; apronPick.visible = false; collarPick.visible = false; }
        if (step.id === "positioning-device") { posDevicePick.visible = false; seatedDevice.visible = true; }
        if (step.id === "exposure-settings") {
          repaint(expPanel.userData.screen, signFace("68 kVp", { bg: "#0d1c24", accent: "#59c97b", fg: "#ffe9c2", scale: 0.55 }));
        }
        if (step.id === "image-check") {
          repaint(monitor.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08111a"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.fillStyle = "#3a4048"; cx.fillRect(w * 0.12, h * 0.2, w * 0.76, h * 0.65);
            cx.fillStyle = "#dfe6ec"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
            cx.textAlign = "center"; cx.fillText("DIAGNOSTIC — ACCEPTED", w / 2, h * 0.14);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "parent-enters") {
          parent.visible = true;
          parent.position.set(0.9, 0, -2.4);
        }
        if (it.id === "torn-barrier-found") {
          barrierFitted.material = mat(0xd8c0a8, { rough: 0.7, opacity: 0.7, transparent: true });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "parent-enters") parent.visible = false;
        if (it.id === "torn-barrier-found") {
          barrierFitted.material = mat(0xeaf6ff, { rough: 0.25, opacity: 0.5, transparent: true });
        }
      },

      animate(t, dt, session) {
        void dt; void t;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "exposure-settings") {
          repaint(expPanel.userData.screen, signFace(`${Math.round(60 + gg.t * 10)} kVp`, {
            bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.62 ? "#59c97b" : "#f0645b", fg: "#ffe9c2", scale: 0.55,
          }));
        }
        if (session?.turn && session.step?.id === "tube-head-align") tubeArm.rotation.y = -session.turn.amount * 1.6;
      },
    };
  },
};
