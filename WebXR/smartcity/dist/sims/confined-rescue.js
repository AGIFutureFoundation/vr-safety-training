import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, paperFace } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, cone, instrument, standingFigure, barrierPanel, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Confined Rescue VR — Emergency Services, station four.
// A rescue from a below-grade valve chamber where a worker is down: the
// size-up that refuses the untrained entry everyone wants to make, the
// space isolated and ventilated, atmosphere monitored top to bottom, a
// tripod and mechanical advantage rigged, an air-supplied entrant on a
// tended line, the patient packaged in a rescue harness, a controlled
// haul, and the handover with the atmosphere log attached.

const CR2_ACCENT = 0xf07a4b;

export const SIM_CONFINED_RESCUE = {
  id: "confined-rescue",
  index: "45",
  domain: "Emergency Services",
  trade: "Technical rescue technician — confined space",
  category: "Emergency Services",
  weather: "overcast",
  certification: "IAFF — NFPA 1006 confined-space rescue technician and NFPA 1670 operations level; OSHA 29 CFR 1910.146(k) permit-space rescue and 1910.134(g)(3) two-in two-out; ANSI Z359 fall-arrest and rescue systems",
  name: "Confined Rescue",
  title: simTitle("Confined Rescue"),
  tagline: "Below-grade rescue: refuse the unprotected entry, isolate and ventilate, monitor top to bottom, tripod and mechanical advantage rigged, air-supplied entrant on a tended line, patient packaged, controlled haul, atmosphere log handed over",
  accent: CR2_ACCENT,
  accentCss: "#f07a4b",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "two-came-out", name: "Two Came Out", note: "A rescue where the rescuer was on air and on a line, the atmosphere was logged, and both people came up — first time" },

  game: system({
    name: "Rescue Company",
    currency: "HAUL",
    ranks: ["Rescue Recruit", "Rescue Technician", "Rigging Lead", "Rescue Officer", "Rescue Company Certified"],
    badges: [
      { id: "held-the-line", name: "Held the Line", note: "The unprotected entry was refused and the space isolated first, first time", test: AWARD.stepClean("isolate") },
      { id: "air-and-line", name: "Air and a Line", note: "Never an entrant without air, never a haul without a belay, never an unmonitored space", test: AWARD.safe },
      { id: "read-the-space", name: "Read the Space", note: "Atmosphere and haul tension both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-rescue", name: "Clean Rescue", note: "No corrections anywhere in the operation", test: AWARD.clean },
      { id: "smooth-haul", name: "Smooth Haul", note: "Haul held steady the whole lift", test: AWARD.unbroken },
      { id: "golden-hour", name: "Inside the Hour", note: "Patient at the surface inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "rush-in-unprotected": "You went in after the patient without air or a line. More than half of the people who die in confined spaces are the would-be rescuers; the atmosphere that put the worker down is still there, and now there are two patients and nobody at the hole.",
    "no-isolation": "You started the rescue with the line into the chamber still live. Whatever filled that space is still being fed into it, and it will fill again behind the entrant and the fan.",
    "vent-into-space": "You pointed the blower so it pulled from beside the exhaust. Ventilating with the discharge of an engine or the plume you just pushed out is how a space gets worse while the meter says the fan is running.",
    "haul-no-belay": "You hauled on the main line with no belay. A single-line haul with a person on it is one jammed pulley or one cut sheath from a drop back into the space with the patient still attached.",
  },

  lateNotes: {
    "entrant-descend": "The entrant goes in after the space is isolated, ventilated, monitored and the system is rigged and belayed.",
    "haul-handle": "The haul starts once the patient is packaged and the entrant calls for the lift.",
    "gas-meter": "Monitoring means top, middle and bottom, and it comes after the space is isolated and the fan has run.",
  },


  // Interruptions: see the interrupt layer in shared/game.js. A confined-space
  // rescue is the textbook case for these — the thing that kills the second
  // person is always something that changed in the space while the team was
  // heads-down on the rigging.
  interrupts: [
    {
      id: "meter-alarms",
      kind: "Atmosphere alarm",
      after: "rig", delay: 6, seconds: 13,
      alert: "The meter on the tended line is alarming. Oxygen at the bottom of the chamber is falling while you rig.",
      cue: "Nobody goes in on that reading. Read the space again.",
      target: "gas-meter",
      why: "A space that was inside the band twenty minutes ago is not inside it now. The entry decision is made on the current worst reading, and the meter on the line exists so that reading is never more than a few seconds old.",
      missNote: "You finished rigging and sent an entrant into a space whose oxygen was still falling. The reason the meter is lowered on a line is that the atmosphere in a chamber is not a fact you establish once — it is a thing you watch, and nobody was watching it.",
      wrongNote: "Read the meter. Nothing else in this rescue is worth doing until you know what the space is doing right now.",
    },
    {
      id: "attendant-pulled",
      kind: "Attendant gone",
      after: "haul", delay: 4, seconds: 12,
      alert: "The attendant has left the opening to help on the rope. There is nobody tending the line or counting who is in the space.",
      cue: "Get somebody back on the hole.",
      target: "tender-station",
      why: "The attendant is not spare labour. They are the only person whose job is the entrant, the only one watching the meter, and the only one who knows how many people are in that space.",
      missNote: "You hauled with nobody tending. The line fouled on the lip and the entrant was hanging with no one at the opening to see it, which is how a rescue becomes two rescues.",
      wrongNote: "The hole is unattended. That is the problem, and it is the only problem, until somebody is back on it.",
    },
  ],

  steps: [
    {
      id: "sizeup", kind: "select", target: "rescue-sizeup",
      title: "Size up the space",
      cue: "Read the permit board: what the space is, what is in it, how far down the patient is.",
      why: "The first decision is whether this is a rescue or a recovery, and whether anyone is going in at all. The permit and the space tell you both before a rope comes off the truck.",
    },
    {
      id: "refuse", kind: "select", target: "hold-the-crew",
      title: "Hold the crew at the hole",
      cue: "Stop the coworker who is climbing in after their partner.",
      why: "The instinct is to go in. The job of the first rescuer on scene is to make sure the second victim is not one of their own, and that means physically holding the line at the opening.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["isolate-valve", "isolate-lock", "isolate-blank"],
      itemNames: { "isolate-valve": "feed valve closed", "isolate-lock": "lock and tag", "isolate-blank": "blank flange in" },
      title: "Isolate the space",
      cue: "Close the feed valve, lock and tag it, then set the blank flange.",
      why: "A closed valve is a valve somebody can open. The lock stops the hand and the blank stops the valve; both, because the entrant will be under that line for twenty minutes.",
      outOfOrderNote: "Valve, then lock, then blank — each step makes the last one permanent.",
    },
    {
      id: "vent", kind: "select", target: "blower-set",
      title: "Set the ventilation",
      cue: "Place the blower with its intake in clean air, upwind, and the duct to the bottom of the space.",
      why: "Ventilation moves air at the bottom where the heavy gas sits, and it has to draw from air that is actually clean. Where the intake sits is most of whether the fan helps at all.",
    },
    {
      id: "monitor", kind: "gauge", target: "gas-meter",
      title: "Monitor top, middle and bottom",
      cue: "Lower the meter through the space and commit when the readings are inside the entry band.",
      why: "Gases stratify: oxygen at the top says nothing about the bottom. The meter goes down in stages, and the entry decision is made on the worst reading, not the first.",
      gauge: { label: "O₂ / LEL", speed: 0.7, green: [0.46, 0.62], readout: (t) => `${(18 + t * 6).toFixed(1)}% O₂`, missNote: "Outside the entry band — keep ventilating and read the space again before anyone goes in." },
    },
    {
      id: "rig", kind: "sequence",
      targets: ["tripod-head", "main-line", "belay-line"],
      itemNames: { "tripod-head": "tripod set and legs chained", "main-line": "main line and mechanical advantage", "belay-line": "belay line on a separate anchor" },
      title: "Rig the system",
      cue: "Set the tripod over the opening with the legs chained, reeve the main line and mechanical advantage, then the belay on its own anchor.",
      why: "Two lines on two anchors, because the whole system has to survive losing any one part of it while a person is hanging on it.",
      outOfOrderNote: "Tripod, then main, then belay — the frame is stable before anything is loaded, and the belay is never an afterthought.",
    },
    {
      id: "air", kind: "sequence", anyOrder: true,
      targets: ["entrant-air", "tender-station", "comms-line"],
      itemNames: { "entrant-air": "entrant on supplied air", "tender-station": "attendant at the opening", "comms-line": "comms to the entrant" },
      title: "Prepare the entrant",
      cue: "Entrant on supplied air with an escape bottle, attendant at the opening with the log, comms tested.",
      why: "The attendant never leaves the hole and never enters. Their whole job is the log, the line and the count of who is in.",
    },
    {
      id: "entrant-descend", kind: "track", target: "entrant-descend", seconds: 6,
      title: "Lower the entrant",
      cue: "Lower on the main line at a steady, controlled rate with the belay tracking.",
      why: "A controlled lower keeps the entrant off the walls and the ladder, and keeps the belay in step. Speed here buys nothing and costs control.",
      track: { start: 0.1, green: [0.36, 0.56], rise: 0.6, fall: 0.5, drift: 0.12, label: "LOWER", readout: (v) => (v < 0.36 ? "stopped" : v > 0.56 ? "too fast" : "controlled") },
      holdBreakNote: "Lowering rate out of band — the belay cannot track that. Bring it back and hold.",
    },
    {
      id: "package", kind: "sequence",
      targets: ["patient-airway", "rescue-harness", "patient-clip"],
      itemNames: { "patient-airway": "airway and air on the patient", "rescue-harness": "rescue harness fitted", "patient-clip": "patient clipped to the main line" },
      title: "Package the patient",
      cue: "Airway first with supplied air, then the rescue harness, then clip to the main line.",
      why: "Air before movement: the patient has been breathing whatever put them down. The harness distributes the lift, and the clip goes on last so nothing is under tension while it is being fitted.",
      outOfOrderNote: "Airway, then harness, then the clip — the patient is breathing before they are lifted.",
    },
    {
      id: "haul", kind: "track", target: "haul-handle", seconds: 7,
      title: "Haul the patient out",
      cue: "Haul on the mechanical advantage at a steady rate while the belay is minded.",
      why: "A steady haul lets the attendant watch the patient clear the opening and the belay stay tight. Jerking a haul line with a person on it is what breaks an edge roller or a shoulder.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "HAUL", readout: (v) => (v < 0.4 ? "stalled" : v > 0.6 ? "snatching" : "steady haul") },
      holdBreakNote: "Haul rate out of band — steady it before the patient hits the edge.",
    },
    {
      id: "handover", kind: "sequence",
      targets: ["patient-ems", "atmosphere-log", "space-secured"],
      itemNames: { "patient-ems": "patient to EMS", "atmosphere-log": "atmosphere log handed over", "space-secured": "space secured and tagged" },
      title: "Hand over and secure",
      cue: "Patient to EMS with what they were breathing, the atmosphere log to the incident commander, and the space tagged closed.",
      why: "The hospital treats what the meter recorded, not what the space looked like. The log goes with the patient, and the space stays closed until the employer's investigation is done.",
      outOfOrderNote: "Patient, then the log, then the space — care first, evidence second, scene last.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CR2_ACCENT);
    box(g, 6.0, 0.1, 5.2, 0, 0.05, 0, 0x4a4d52, { rough: 0.95 });
    // The chamber: a square opening in the deck with a shaft below and a patient at the bottom.
    const hole = group(g, -0.4, 0.1, -0.8);
    for (const [dx, dz, w, d] of [[-0.62, 0, 0.24, 1.5], [0.62, 0, 0.24, 1.5], [0, -0.62, 1.5, 0.24], [0, 0.62, 1.5, 0.24]]) box(hole, w, 0.12, d, dx, 0.06, dz, 0x6b6660, { rough: 0.9 });
    const shaft = box(hole, 1.0, 2.6, 1.0, 0, -1.3, 0, 0x14181c, { rough: 0.95 });
    const lid = box(hole, 1.05, 0.06, 1.05, 1.3, 0.06, 0.4, 0x5b5f64, { rough: 0.8, metal: 0.4 });
    holoTag(hole, "valve chamber — permit space", 0, 0.5, 0.75, { css: "#f07a4b", w: 0.5 });
    void shaft; void lid;
    const patient = standingFigure(hole, 0, 0, { ry: 0.4, cloth: 0xf2c14b });
    patient.position.set(0.1, -2.3, 0.1);
    patient.rotation.z = 1.4;
    patient.scale.setScalar(0.95);
    holoTag(hole, "worker down — 2.4 m", 0.1, -1.4, 0.55, { css: "#d2312b", w: 0.42 });
    const airwayHit = box(hole, 0.4, 0.3, 0.4, 0.1, -2.0, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, airwayHit, "patient-airway");
    const rushHit = box(g, 0.9, 1.2, 0.9, -0.4, 0.7, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb in after them?", -0.4, 1.45, 0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, rushHit, "rush-in-unprotected");
    // The coworker trying to enter.
    const coworker = standingFigure(g, 0.6, -0.1, { ry: -2.4, cloth: 0xf2a23b });
    holoTag(coworker, "coworker — going in!", 0, 1.9, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, coworker, "hold-the-crew");
    // Isolation: feed line into the chamber with a valve, lock point and blank.
    const iso = group(g, -2.3, 0.1, -1.4, 0.3);
    cyl(iso, 0.07, 0.07, 1.6, 0, 0.5, 0, 0x7b8a86, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    const isoValve = cyl(iso, 0.11, 0.11, 0.12, 0.2, 0.5, 0, 0xd2312b, { rough: 0.5, metal: 0.4, seg: 16 });
    isoValve.rotation.x = Math.PI / 2;
    holoTag(iso, "feed valve", 0.2, 0.78, 0, { css: "#f07a4b", w: 0.22 });
    reg(hits, isoValve, "isolate-valve");
    const isoLock = box(iso, 0.05, 0.08, 0.03, 0.2, 0.3, 0.06, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    holoTag(iso, "lock and tag", 0.2, 0.16, 0.1, { css: "#f07a4b", w: 0.26 });
    reg(hits, isoLock, "isolate-lock");
    const blank = cyl(iso, 0.1, 0.1, 0.03, 0.55, 0.5, 0, 0xd2312b, { rough: 0.5, metal: 0.6, seg: 16 });
    blank.rotation.z = Math.PI / 2;
    holoTag(iso, "blank flange", 0.55, 0.78, 0, { css: "#f07a4b", w: 0.24 });
    reg(hits, blank, "isolate-blank");
    const noIso = box(iso, 0.3, 0.3, 0.3, -0.35, 0.75, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(iso, "start without isolating?", -0.35, 1.0, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, noIso, "no-isolation");
    // Blower with duct into the space; the bad placement beside the exhaust.
    const blower = group(g, 1.8, 0.1, 0.7, -0.5);
    box(blower, 0.5, 0.5, 0.5, 0, 0.25, 0, 0xf2a23b, { rough: 0.6 });
    cyl(blower, 0.2, 0.2, 0.06, 0, 0.25, 0.26, 0x2b2f34, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    const duct = hose(g, [[1.6, 0.3, 0.5], [0.8, 0.35, -0.1], [-0.1, 0.3, -0.5], [-0.35, -0.6, -0.8]], 0.11, 0xf2d08a, { steps: 20, rough: 0.8 });
    holoTag(blower, "blower and duct", 0, 0.7, 0, { css: "#f07a4b", w: 0.3 });
    reg(hits, blower, "blower-set");
    const badVent = box(g, 0.5, 0.5, 0.5, 2.7, 0.35, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "intake by the exhaust?", 2.7, 0.75, 0.1, { css: "#d2312b", w: 0.42 });
    reg(hits, badVent, "vent-into-space");
    // Tripod over the opening, main and belay lines, haul handle.
    const tripod = group(g, -0.4, 0.1, -0.8);
    const legs = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      const leg = cyl(tripod, 0.03, 0.04, 2.6, Math.sin(a) * 0.75, 1.3, Math.cos(a) * 0.75, 0xf2c14b, { rough: 0.5, metal: 0.5, seg: 10 });
      leg.rotation.z = -Math.sin(a) * 0.28; leg.rotation.x = Math.cos(a) * 0.28;
      leg.visible = false; legs.push(leg);
    }
    const head = box(tripod, 0.26, 0.1, 0.26, 0, 2.55, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    head.visible = false;
    const headHit = box(tripod, 0.4, 0.4, 0.4, 0, 2.55, 0, 0xf2c14b, { rough: 0.6, opacity: 0.25, transparent: true, cast: false });
    holoTag(tripod, "tripod head", 0, 2.95, 0, { css: "#f07a4b", w: 0.26 });
    reg(hits, headHit, "tripod-head");
    const mainLine = cyl(tripod, 0.012, 0.012, 2.6, 0, 1.2, 0, 0xf2f6fa, { rough: 0.7, seg: 6 });
    mainLine.visible = false;
    const mainHit = box(g, 0.5, 0.5, 0.5, -1.3, 0.55, -1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    const mad = group(g, -1.3, 0.1, -1.5);
    cyl(mad, 0.07, 0.07, 0.05, 0, 0.45, 0, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 14 });
    cyl(mad, 0.07, 0.07, 0.05, 0.16, 0.6, 0, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 14 });
    holoTag(mad, "main line · 3:1", 0, 0.85, 0, { css: "#f07a4b", w: 0.3 });
    reg(hits, mainHit, "main-line");
    const belay = group(g, 0.9, 0.1, -1.9, 0.4);
    cyl(belay, 0.05, 0.06, 0.5, 0, 0.25, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 12 });
    box(belay, 0.16, 0.12, 0.1, 0, 0.55, 0, 0x2f7d4a, { rough: 0.5, metal: 0.4 });
    holoTag(belay, "belay — separate anchor", 0, 0.85, 0, { css: "#f07a4b", w: 0.46 });
    reg(hits, belay, "belay-line");
    const noBelay = box(g, 0.4, 0.4, 0.4, -1.9, 0.6, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "haul on one line?", -1.9, 0.95, -1.0, { css: "#d2312b", w: 0.34 });
    reg(hits, noBelay, "haul-no-belay");
    const haulHandle = cyl(g, 0.03, 0.03, 0.26, -1.55, 0.6, -1.3, 0x1b1e23, { rough: 0.5, seg: 10 });
    haulHandle.rotation.z = 0.6;
    holoTag(g, "haul", -1.55, 0.85, -1.3, { css: "#f07a4b", w: 0.14 });
    reg(hits, haulHandle, "haul-handle");
    // Entrant, air cart, attendant station, comms.
    const entrant = standingFigure(g, -1.5, 0.5, { ry: -0.6, cloth: 0xd2503b });
    holoTag(entrant, "entrant — on air", 0, 1.9, 0, { css: "#f07a4b", w: 0.3 });
    reg(hits, entrant, "entrant-descend");
    const airCart = group(g, -2.4, 0.1, 0.9, 0.5);
    box(airCart, 0.5, 0.2, 0.4, 0, 0.5, 0, 0x2b2f34, { rough: 0.6 });
    for (const dx of [-0.13, 0.13]) cyl(airCart, 0.08, 0.08, 0.7, dx, 0.35, 0, 0x2f7d4a, { rough: 0.5, metal: 0.4, seg: 14 });
    holoTag(airCart, "supplied air cart", 0, 0.9, 0, { css: "#f07a4b", w: 0.36 });
    reg(hits, airCart, "entrant-air");
    const attendant = group(g, 0.5, 0.1, -1.6, -0.4);
    box(attendant, 0.5, 0.75, 0.4, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const logSheet = decal(attendant, 0.3, 0.36, 0, 0.77, 0.02, paperFace("ENTRY / ATMOSPHERE LOG", ["Entrant in: __:__", "O2 / LEL / H2S", "Check every 5 min", "Entrant out: __:__"], { scale: 0.82 }));
    logSheet.rotation.x = -Math.PI / 2;
    holoTag(attendant, "attendant at the opening", 0, 1.0, 0, { css: "#f07a4b", w: 0.48 });
    reg(hits, attendant, "tender-station");
    const logHit = box(attendant, 0.36, 0.1, 0.4, 0, 0.82, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, logHit, "atmosphere-log");
    const radio = box(attendant, 0.07, 0.15, 0.04, 0.3, 0.85, 0, 0x1b1e23, { rough: 0.6 });
    holoTag(attendant, "comms", 0.3, 1.05, 0, { css: "#f07a4b", w: 0.16 });
    reg(hits, radio, "comms-line");
    const meter = instrument(g, 0.2, 0.55, -0.5, { idle: "--.-% O₂", color: 0xf07a4b, w: 0.14, d: 0.22, ry: -0.3 });
    holoTag(g, "4-gas meter on a line", 0.2, 0.8, -0.5, { css: "#f07a4b", w: 0.44 });
    reg(hits, meter, "gas-meter");
    // Harness and clip on the truck side; EMS stretcher; permit board; barriers.
    const kit = group(g, 2.2, 0.1, -1.6, -0.6);
    box(kit, 0.9, 0.5, 0.5, 0, 0.25, 0, 0xd2503b, { rough: 0.6 });
    const harness = box(kit, 0.24, 0.1, 0.2, -0.2, 0.55, 0, 0xf2c14b, { rough: 0.8 });
    holoTag(kit, "rescue harness", -0.2, 0.75, 0, { css: "#f07a4b", w: 0.3 });
    reg(hits, harness, "rescue-harness");
    const clip = cyl(kit, 0.05, 0.012, 0.22, 0.22, 0.55, 0, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 8 });
    holoTag(kit, "patient clip", 0.22, 0.75, 0, { css: "#f07a4b", w: 0.26 });
    reg(hits, clip, "patient-clip");
    const stretcher = group(g, 2.5, 0.1, 1.5, -0.4);
    box(stretcher, 0.6, 0.06, 1.8, 0, 0.6, 0, 0xdfe6ec, { rough: 0.6 });
    for (const [x, z] of [[-0.22, -0.7], [0.22, -0.7], [-0.22, 0.7], [0.22, 0.7]]) cyl(stretcher, 0.02, 0.02, 0.6, x, 0.3, z, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(stretcher, "EMS — patient handover", 0, 0.95, 0, { css: "#f07a4b", w: 0.46 });
    reg(hits, stretcher, "patient-ems");
    const tagBoard = box(g, 0.3, 0.4, 0.03, -0.4, 0.5, 1.3, 0xf2c14b, { rough: 0.7 });
    holoTag(g, "secure and tag the space", -0.4, 0.82, 1.3, { css: "#f07a4b", w: 0.48 });
    reg(hits, tagBoard, "space-secured");
    const board = group(g, -2.0, 0, 2.0, 0.4);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#24110a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f07a4b"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffdcc9"; ctx.fillText("RESCUE SIZE-UP — VALVE CHAMBER", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fff0e8";
      ["Space: 1 m square, 2.6 m deep, one way in", "Patient: 1, unresponsive, at the bottom", "Last reading before entry: 16.2% O₂", "Product line into the chamber: live", "Entry band: 19.5-23.5% O₂, LEL < 10%", "Rescue: tripod, 3:1 main, separate belay", "Entrant on supplied air + escape bottle"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: CR2_ACCENT });
    reg(hits, board, "rescue-sizeup");
    barrierPanel(g, 1.6, 2.2, { ry: 0.1 });
    for (const [x, z] of [[-2.6, -2.0], [2.6, -2.0]]) cone(g, x, z);

    let depth = 0, lifted = 0, isolated = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 0.8, -0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "isolate") { isolated = true; blank.material = blank.material; }
        if (step.id === "rig") { for (const l of legs) l.visible = true; head.visible = true; mainLine.visible = true; headHit.material.opacity = 0.001; }
        if (step.id === "handover") { patient.parent.remove(patient); stretcher.add(patient); patient.position.set(0, 0.66, 0); patient.rotation.set(0, 0, 1.55); }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "rig") { if (session.sequence.includes("tripod-head")) { for (const l of legs) l.visible = true; head.visible = true; } if (session.sequence.includes("main-line")) mainLine.visible = true; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "monitor") repaint(meter.userData.screen, signFace(`${(18 + gg.t * 6).toFixed(1)}%`, { bg: "#24110a", accent: gg.t >= 0.46 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#fff0e8", scale: 0.62 }));
        if (step?.id === "entrant-descend" && session.holding) depth = Math.min(1, depth + dt / 6);
        entrant.position.set(-1.5 + depth * 1.1, -depth * 2.3, 0.5 - depth * 1.3);
        if (step?.id === "haul" && session.holding) lifted = Math.min(1, lifted + dt / 7);
        if (!step || step.id !== "handover") patient.position.y = -2.3 + lifted * 2.5;
        duct.visible = true;
        void isolated;
      },
    };
  },
};
