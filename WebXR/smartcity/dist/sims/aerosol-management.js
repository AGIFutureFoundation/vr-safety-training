import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, instrument,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Aerosol Management VR — Dental & Oral Health, station one
// hundred and twenty-three. Turning an ordinary operatory over for an
// aerosol-generating procedure: the room's own ventilation is part of the
// control plan here, not scenery behind it, because the tip and the drill do
// not know or care whether the air around them is actually being changed.

const AER_ACCENT = 0x5fc9a0;
const AER_STEEL = 0x9aa6ac;
const AER_UPHOLSTERY = 0x2f6f5e;
const AER_CABINET = 0xe8edf0;

export const SIM_AEROSOL_MANAGEMENT = {
  id: "aerosol-management",
  index: "123",
  domain: "Healthcare",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "SEIU and UFCW dental and clinic staff, and the ADHA as the hygiene profession's own body; the CDC's Guidelines for Infection Control in Dental Health-Care Settings on pre-procedural rinses, dental dams and instrument selection for aerosol-generating procedures; OSHA 29 CFR 1910.134 respiratory protection and its user seal check requirement; the Dental Hygiene Board of California and the state dental practice act",
  name: "Aerosol Management",
  title: simTitle("Aerosol Management"),
  tagline: "Turning an operatory over for an aerosol-generating procedure: the room's own air changes and a portable HEPA unit sized to them, HVE and pre-procedural rinse, an N95 seal-checked every time it goes on, the dam where it fits, and the room left to settle its own fallow time before the next patient sits down",
  accent: AER_ACCENT,
  accentCss: "#5fc9a0",
  parSeconds: 270,
  footprint: 2.4,
  badge: { id: "operatory-cleared", name: "Operatory Cleared", note: "A full aerosol-generating appointment set up, worked and turned over on the room's own fallow time" },

  game: system({
    name: "Air Control",
    currency: "CADR",
    ranks: ["Room Setup Tech", "Registered Hygienist", "Infection Control Lead", "Clinical Lead", "Air Control Certified"],
    badges: [
      { id: "seal-checked", name: "Seal Checked", note: "The N95 held its user seal check the full count", test: AWARD.stepClean("fit-check") },
      { id: "capture-held", name: "Capture Held", note: "The evacuator's capture distance held near band centre", test: AWARD.precise(0.72) },
      { id: "no-shortcuts", name: "No Shortcuts", note: "No unsafe action across the whole turnover", test: AWARD.safe },
    ],
    challenges: [
      { id: "on-schedule", name: "On Schedule", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-run", name: "Clean Run", note: "No corrections the whole appointment", test: AWARD.clean },
      { id: "steady-streak", name: "Steady Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "door-propped": "The operatory door is wedged open into the hallway. Whatever this room's air changes are doing to clear an aerosol, they are doing it against an open door pulling that same air — and whoever is sitting in the hallway — straight past the barrier the room was supposed to be.",
    "surgical-mask-decoy": "That is a surgical mask, not a respirator. A surgical mask is built to stop droplets leaving your mouth; it is not fit-tested and does not filter the smaller aerosol particles an ultrasonic scaler or a handpiece throws — OSHA's respiratory protection standard exists precisely because the two are not interchangeable.",
    "keyboard-uncovered": "The keyboard at the counter is outside the barrier covers and inside this room's splash zone. Aerosol settles on whatever it reaches, and a keyboard's gaps are exactly the surface that gets missed at terminal cleaning and gets touched again before the next patient.",
    "hve-idle": "The evacuator is sitting propped in open air instead of at the site. Running but not capturing anything, it looks like it is doing its job from across the room and is doing none of it where the aerosol is actually being generated.",
  },

  lateNotes: {
    "rubber-dam": "Not yet. Whether a dam is even indicated for this procedure has not been decided, and the room itself is not ready for aerosol-generating work.",
    "hand-scaler": "The instrument choice comes after the room and the PPE are ready, not before — picking it up now changes nothing about whether this room can handle what it is about to generate.",
    "room-clock": "The fallow time is read once the procedure is actually finished. There is nothing to time yet.",
  },

  steps: [
    {
      id: "room-assess", kind: "select", target: "room-plan",
      title: "Read this operatory's air-change rating",
      cue: "Check how many air changes per hour this room is rated for before you set anything up.",
      why: "Air changes per hour, multiplied against this room's own volume, is what determines how long an aerosol actually takes to clear once the handpiece stops — and it is different in every room in the building. Treating a small interior operatory the same as a large window bay is how a room gets reopened while it is still carrying what the last patient generated.",
    },
    {
      id: "pre-walk", kind: "find", noHint: true,
      targets: ["door-ajar", "vent-blocked", "barrier-gap"],
      itemNames: {
        "door-ajar": "the door not fully latched",
        "vent-blocked": "the return-air grille blocked by a cart",
        "barrier-gap": "the light handle with no surface barrier",
      },
      itemNotes: {
        "door-ajar": "A door that is closed but not latched drifts open on its own, and a room's air changes assume a closed envelope. Latch it before anything else moves.",
        "vent-blocked": "A supply cart parked in front of the return grille is quietly halving this room's effective air changes, whatever the rating on the plan says. Move it clear before you trust that number.",
        "barrier-gap": "The overhead light handle has no barrier on it. It gets touched with a gloved hand mid-procedure whether or not it is covered — the barrier is what makes that touch safe to repeat.",
      },
      title: "Walk the room before you bring the patient in",
      cue: "Three things about this room are not ready. Find them by looking.",
      why: "A room's ventilation and its barriers only work the way the plan assumes if the room actually matches the plan, and none of these three failures are visible from the doorway. Catching them now costs a look; catching them after the handpiece has been running costs the whole appointment's worth of aerosol control.",
    },
    {
      id: "hepa-place", kind: "select", target: "hepa-unit",
      title: "Position the portable HEPA unit",
      cue: "Place the HEPA unit so it pulls air away from the door, not toward it.",
      why: "A portable HEPA unit's clean-air delivery rate only helps if it is actually moving air through the zone where the aerosol is generated — set facing the wrong way, a unit rated for this room's volume still leaves a dead pocket right over the patient's chest while it scrubs air nobody is breathing.",
    },
    {
      id: "hepa-power", kind: "gauge", target: "hepa-dial",
      title: "Set the fan speed for this room's volume",
      cue: "Set the fan speed to the delivery rate this room's volume calls for, then commit.",
      why: "A HEPA unit's clean-air delivery rate is only meaningful matched against the room it is running in — too low and a big operatory never gets the extra air changes it was brought in for; too high in a small one and it is loud enough that staff start turning it down themselves by the second patient.",
      gauge: {
        label: "FAN SPEED", speed: 0.7, green: [0.42, 0.64],
        readout: (t) => (t < 0.42 ? "under-delivering for this room" : t > 0.64 ? "louder than staff will tolerate" : `${Math.round(t * 100)}%`),
        missNote: "Not matched to this room's volume. Recheck the unit's rated delivery against the room-plan figure rather than guessing at the dial.",
      },
    },
    {
      id: "rinse", kind: "select", target: "prerinse-cup",
      forceClass: "light",
      robotNote: "Handing the rinse cup up to the patient: contact with the person, no force in it.",
      title: "Give the pre-procedural rinse",
      cue: "Have the patient rinse with the antimicrobial pre-procedural rinse.",
      why: "An antimicrobial pre-procedural rinse cuts the microbial load in the mouth before the aerosol-generating instrument ever starts, which is the one control in this whole setup that acts on the aerosol at its source rather than after it is already in the air.",
    },
    {
      id: "hve-ready", kind: "select", target: "hve-mount",
      forceClass: "light",
      robotNote: "The evacuator is seated at the mouth's edge, outside it — assistant work a robot may do.",
      title: "Seat the evacuator at the site",
      cue: "Seat the high-volume evacuator at the site before anything aerosol-generating starts.",
      why: "High-volume evacuation captures aerosol at the point it is created, which is a fundamentally different job from a HEPA unit clearing whatever escaped capture — one is source control, the other is cleanup. Skipping straight to the room's ventilation and treating it as sufficient on its own is how a well-ventilated room still has a contaminated chair.",
    },
    {
      id: "don-ppe", kind: "sequence",
      targets: ["gown", "n95-mask", "face-shield"],
      itemNames: { gown: "protective gown", "n95-mask": "N95 respirator", "face-shield": "face shield" },
      title: "Don gown, then N95, then face shield",
      cue: "Gown first, then the N95, then the face shield over it.",
      why: "The gown goes on before anything touches your face, the N95 seats directly against skin and has to go on before the shield, and the shield goes on last because it is what keeps splatter off a respirator you cannot simply wipe down and re-wear. Reverse the last two and the shield is fighting the mask straps for the same real estate on your head.",
      outOfOrderNote: "Wrong order — gown first, the N95 seated against your face second, and the face shield over the top last.",
    },
    {
      id: "fit-check", kind: "hold", target: "n95-mask", seconds: 6,
      title: "Hold the user seal check",
      cue: "Block the surface, inhale, and hold the mask collapsed against your face for the full check.",
      why: "OSHA's respiratory protection standard calls for a user seal check every single time an N95 goes on, not once at the annual fit test — cup both hands over it, inhale, and the mask has to stay drawn against your face for the whole count with no air sneaking in at the edges. A respirator that leaks slowly passes a quick squeeze and fails the appointment.",
      holdBreakNote: "You released before the check was over. A facepiece that leaks slowly passes a rushed check and fails when it actually matters — hold the full count.",
    },
    {
      id: "dam-placement", kind: "select", target: "rubber-dam",
      noRobot: true, forceClass: "light",
      robotNote: "A dam is placed on the tooth and clamped: intraoral.",
      title: "Place the dam where this procedure calls for one",
      cue: "Place the dam — this procedure is one where it is indicated.",
      why: "A rubber dam isolates the field and is one of the single largest aerosol reductions available for the procedures it fits, but it is not universal — indicated here because the planned work calls for isolation, not reached for by habit. Placing it where it belongs is what actually earns the reduction; a dam is not doing anything from the drawer.",
    },
    {
      id: "surface-barriers", kind: "select", target: "barrier-covers",
      forceClass: "light",
      robotNote: "The chair-control cover goes on a pad beside the patient's hip — inside the keep-out volume, laid on rather than pressed.",
      title: "Cover the surfaces inside the splash zone",
      cue: "Cover the light handle, chair controls and tubing runs before the handpiece starts.",
      why: "Everything within reach of the spray gets a barrier that comes off and gets thrown away rather than wiped and reused, because aerosol settles on switches and handles exactly as readily as it settles on the tray, and those are the surfaces a gloved hand returns to mid-procedure without thinking about it.",
    },
    {
      id: "instrument-choice", kind: "select", target: "hand-scaler",
      title: "Choose hand instrumentation where it will do the job",
      cue: "Reach for the hand scaler for this surface rather than the ultrasonic by default.",
      why: "An ultrasonic tip and a high-speed handpiece are the two biggest aerosol generators on this tray, and neither is required for every surface on this chart. Choosing hand instrumentation wherever it will actually finish the job is aerosol reduction that costs nothing extra in PPE or ventilation — it is simply not generating the aerosol in the first place.",
    },
    {
      id: "procedure-monitor", kind: "track", target: "hve-mount", seconds: 10,
      forceClass: "light",
      robotNote: "Holding capture distance keeps the tip beside the patient's face for the whole procedure.",
      title: "Hold the evacuator's capture distance",
      cue: "Keep the evacuator close enough to the site to actually capture the spray, and hold it there.",
      why: "High-volume evacuation only captures what stays inside its zone, and that zone is a few centimetres wide — set the tip back to keep it out of the way and the aerosol simply passes it on the way to the room instead of into it. The whole point of positioning it earlier was to hold it here, not to have positioned it once and moved on.",
      track: {
        start: 0.15, green: [0.35, 0.6], rise: 0.48, fall: 0.4, drift: 0.12, label: "CAPTURE DISTANCE",
        readout: (v) => (v < 0.35 ? "too close — blocking the field" : v > 0.6 ? "too far — aerosol escaping capture" : "capturing at the site"),
      },
      holdBreakNote: "The capture distance drifted out of band. Bring the tip back to the site — aerosol that misses the evacuator by a few centimetres is aerosol in the room instead of the trap.",
    },
    {
      id: "fallow-time", kind: "gauge", target: "room-clock",
      title: "Read the room's fallow time",
      cue: "Read the settle time this room's air changes actually call for, then commit.",
      why: "Fallow time is the room's own air changes doing the clearing, and a room rated for fewer changes per hour needs longer with nobody in it than one with better ventilation — there is no single number that fits every operatory in the building. Walking back in early because the chair looks empty treats a visual impression as if it were the air itself.",
      gauge: {
        label: "FALLOW TIME", speed: 0.66, green: [0.4, 0.62],
        readout: (t) => `${Math.round(t * 30)} min`,
        missNote: "Not long enough for this room's own air-change rate. Recheck the figure from the room plan rather than the clock on the wall.",
      },
    },
    {
      id: "sequence-rooms", kind: "select", target: "room-schedule",
      title: "Book the next aerosol appointment around the fallow time",
      cue: "Schedule the next aerosol-generating appointment in this room after the settle time, not back to back.",
      why: "A schedule that books aerosol-generating appointments back to back in the same room is asking the fallow time to happen on somebody else's clock. Sequencing rooms so one has time to settle while another is in use is what actually protects the next patient — a clean-looking chair with an unmet fallow time is not a clean chair.",
    },
    {
      id: "terminal-clean", kind: "select", target: "cleaning-cart",
      title: "Clean and disinfect beyond the splash zone",
      cue: "Disinfect the surfaces beyond the immediate splash zone once the fallow time has passed.",
      why: "Terminal cleaning happens after the room has actually settled, and it covers more than the tray and the chair — anything the aerosol reached during the appointment is due the same disinfection, on the schedule the product label sets, not a quick wipe timed to how long it takes to seat the next patient.",
    },
  ],

  interrupts: [
    {
      id: "hepa-filter-alarm",
      kind: "Equipment fault",
      after: "procedure-monitor", delay: 4, seconds: 12,
      alert: "The HEPA unit's filter alarm starts chirping. Its clean-air delivery is dropping right as the handpiece is generating the most aerosol it will all appointment.",
      cue: "The HEPA unit is alarming — check it now.",
      target: "hepa-unit",
      why: "A loaded filter still runs and still sounds like it is working, but the clean-air delivery behind that sound falls off well before the unit stops moving air entirely. The alarm is the only thing telling you the number on the room plan no longer describes what this unit is actually doing.",
      missNote: "You kept working through the alarm. The unit kept running on a failing filter for the rest of the procedure, which means every minute after the alarm sounded delivered less clean air than the room plan assumed — and nobody could tell by looking.",
      wrongNote: "It is the HEPA unit. The alarm is reporting on itself; nothing else at this chair explains a falling delivery rate.",
    },
    {
      id: "mask-lot-fail",
      kind: "PPE fault",
      after: "fit-check", delay: 3, seconds: 11,
      alert: "Someone calls over that a colleague's respirator from this same new box just failed its seal check twice in a row.",
      cue: "That new box may be a bad lot — switch to the trusted supply.",
      target: "n95-box-trusted",
      why: "A respirator model failing its seal check on more than one face in a row is a lot problem, not a fit problem, and the response is to stop drawing from that box rather than keep re-checking the same mask against the same face. The trusted, previously verified supply is the one to reach for while that lot gets pulled.",
      missNote: "You kept the mask from the questionable lot on. If the lot really was bad, every minute in it was a respirator doing less filtering than its rating promised, on a procedure built around trusting that rating.",
      wrongNote: "It is the trusted supply box. A lot problem is not solved by re-checking the same failing mask again.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, AER_ACCENT);

    // ---------------------------------------------------------- dental chair
    const chairBase = group(g, 0, 0, -0.5);
    cyl(chairBase, 0.22, 0.26, 0.1, 0, 0.05, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    cyl(chairBase, 0.09, 0.1, 0.42, 0, 0.31, 0, AER_STEEL, { rough: 0.35, metal: 0.75, seg: 16 });
    const chairSeatGroup = group(chairBase, 0, 0.52, 0);
    slab(chairSeatGroup, 0.62, 0.14, 0.66, 0, 0, 0.28, AER_UPHOLSTERY, { radius: 0.07, rough: 0.6 });
    const chairBack = group(chairSeatGroup, 0, 0.05, -0.22);
    slab(chairBack, 0.6, 0.9, 0.14, 0, 0.4, 0, AER_UPHOLSTERY, { radius: 0.07, rough: 0.6 });
    chairBack.rotation.x = 0.42;
    slab(chairBack, 0.34, 0.24, 0.1, 0, 0.98, 0.02, AER_UPHOLSTERY, { radius: 0.06, rough: 0.6 });
    for (const sx of [-1, 1]) {
      slab(chairSeatGroup, 0.1, 0.06, 0.62, sx * 0.34, 0.09, 0.28, AER_STEEL, { radius: 0.02, rough: 0.4, metal: 0.6 });
    }
    const patient = seatedFigure(chairSeatGroup, 0, 0.08, 0.42, { skin: 0xb98a63, cloth: 0x8fa3ad });
    // Robot training: this is a person, so the head and the torso are
    // keep-out volumes an embodied trainee never enters unless the step it
    // is working declares patient contact. See shared/robot-embodiment.js.
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    patient.root.rotation.x = 0.42;
    patient.torso.rotation.x = -0.02;

    // Overhead operatory light on its own swing arm.
    const lightArm = group(g, -0.35, 0, -1.55);
    cyl(lightArm, 0.05, 0.06, 1.9, 0, 0.95, 0, AER_STEEL, { rough: 0.3, metal: 0.7, seg: 14 });
    const lightHead = group(lightArm, 0.55, 1.85, 0.3);
    slab(lightHead, 0.4, 0.1, 0.24, 0, 0, 0, 0xdfe4e8, { radius: 0.03, rough: 0.3, metal: 0.3 });
    ball(lightHead, 0.14, 0, -0.05, 0, 0xfdf6e3, { emissive: 0xfdf6e3, ei: 1.1, rough: 0.3 });

    // ---------------------------------------------------------- bracket table
    const bracket = group(g, -0.62, 0, -0.55, 0.3);
    cyl(bracket, 0.05, 0.06, 0.7, 0, 0.35, 0, AER_STEEL, { rough: 0.3, metal: 0.75, seg: 12 });
    slab(bracket, 0.46, 0.03, 0.3, 0.1, 0.71, 0, 0xf2f5f7, { radius: 0.02, rough: 0.35, metal: 0.1 });
    const damKit = group(bracket, -0.06, 0.735, -0.03);
    torus(damKit, 0.045, 0.008, 0, 0, 0, 0x3a4048, { rough: 0.5, metal: 0.4 });
    box(damKit, 0.09, 0.005, 0.09, 0.08, 0, 0, 0xe6d9c3, { rough: 0.7, opacity: 0.85 });
    reg2(damKit, "rubber-dam");
    const scaler = group(bracket, 0.14, 0.735, -0.06);
    cyl(scaler, 0.004, 0.001, 0.12, 0, 0, 0, AER_STEEL, { rough: 0.15, metal: 0.9, seg: 8 });
    cyl(scaler, 0.006, 0.006, 0.09, 0, -0.1, 0, 0x2b3138, { rough: 0.5, seg: 8 });
    reg2(scaler, "hand-scaler");
    const ultrasonicDecoy = group(bracket, 0.05, 0.735, 0.08, -0.3);
    cyl(ultrasonicDecoy, 0.017, 0.02, 0.14, 0, 0, 0, 0x3a4048, { rough: 0.4, metal: 0.4, seg: 12 });
    const prerinse = cyl(bracket, 0.035, 0.03, 0.06, -0.16, 0.745, 0.06, 0xdfe8ee, { rough: 0.15, opacity: 0.6, seg: 14 });
    reg2(prerinse, "prerinse-cup");

    // Barrier covers: the light handle and the chair control pad, each
    // registered under the same id so either one answers the step.
    const handleCover = box(lightHead, 0.06, 0.04, 0.06, 0, -0.02, 0.12, 0xdfe8ee, { rough: 0.4, opacity: 0.55, cast: false });
    reg2(handleCover, "barrier-covers");
    box(chairBase, 0.14, 0.02, 0.1, 0, 0.5, 0.2, 0x2b3138, { rough: 0.5 });
    const padCover = box(chairBase, 0.15, 0.004, 0.11, 0, 0.512, 0.2, 0xdfe8ee, { rough: 0.4, opacity: 0.5, cast: false });
    reg2(padCover, "barrier-covers");

    // ------------------------------------------------------------ operator area
    const hveHolder = group(g, 0.75, 0, -0.7);
    box(hveHolder, 0.05, 0.1, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.6, cast: false });
    const hveWand = group(hveHolder, 0, 0.14, 0);
    cyl(hveWand, 0.016, 0.02, 0.22, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.3, seg: 12 });
    hveWand.rotation.z = 0.25;
    hose(g, [[0.75, 0.14, -0.7], [0.7, 0.3, -0.55], [0.6, 0.5, -0.3]], 0.015, 0x3a4048, { steps: 10, rough: 0.6 });
    reg2(hveHolder, "hve-mount");

    // The evacuator left idle in open air — the trap.
    const hveIdle = group(g, 1.3, 0, 0.1, -0.4);
    cyl(hveIdle, 0.016, 0.02, 0.2, 0, 0.4, 0, 0xdfe4e8, { rough: 0.3, metal: 0.3, seg: 12 });
    reg2(hveIdle, "hve-idle");

    // ---------------------------------------------------------------- HEPA unit
    const hepa = group(g, 1.7, 0, -1.6, -0.5);
    box(hepa, 0.46, 0.1, 0.4, 0, 0.05, 0, 0x2b3138, { rough: 0.6, cast: false });
    slab(hepa, 0.4, 0.9, 0.34, 0, 0.55, 0, 0xdfe4e8, { radius: 0.03, rough: 0.4, metal: 0.15 });
    for (let i = 0; i < 6; i++) box(hepa, 0.3, 0.015, 0.02, 0, 0.3 + i * 0.09, 0.175, 0x3a4048, { rough: 0.6, cast: false });
    const hepaDial = instrument(hepa, 0, 0.85, 0.18, { w: 0.12, d: 0.1, idle: "--", color: AER_ACCENT, ry: 0 });
    reg2(hepaDial, "hepa-dial");
    const fanTop = cyl(hepa, 0.16, 0.16, 0.03, 0, 1.02, 0, 0x1f2a30, { rough: 0.6, seg: 18 });
    reg2(hepa, "hepa-unit");
    const hepaGlow = ball(hepa, 0.01, 0.16, 0.85, 0.19, 0x59c97b, { emissive: 0x59c97b, ei: 1.4 });

    // Room-plan holoPanel with the air-change rating.
    const roomPlan = holoPanel(g, 0.52, 0.36, -1.9, 1.5, -2.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,16,14,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5fc9a0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#cdeadd";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("OPERATORY 3 — ROOM PLAN", w * 0.06, h * 0.16);
      ctx.fillStyle = "#eafaf1";
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Volume: 34 m3", "Rated: 6 ACH", "HEPA target: matched to volume"]
        .forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.38 + i * h * 0.16));
    }, { ry: 0.4, accent: AER_ACCENT });
    reg2(roomPlan, "room-plan");

    // Fallow-time clock, its own panel with a live readout.
    const clockPanel = instrument(g, -2.0, 1.1, -1.5, { w: 0.2, d: 0.14, idle: "--", color: AER_ACCENT, ry: 0.5 });
    reg2(clockPanel, "room-clock");

    // Room schedule board and cleaning cart.
    const scheduleBoard = decal(g, 0.5, 0.34, -3.9, 1.5, -1.0,
      paperFace("ROOM 3 SCHEDULE", ["9:00 — this appointment", "9:45 — fallow", "10:00 — next patient"]));
    scheduleBoard.rotation.y = Math.PI / 2;
    reg2(scheduleBoard, "room-schedule");
    const cleaningCart = group(g, 2.3, 0, 0.6, -0.6);
    box(cleaningCart, 0.5, 0.5, 0.35, 0, 0.35, 0, 0x2f7d4f, { rough: 0.6, metal: 0.1 });
    for (const dx of [-0.14, 0.14]) cyl(cleaningCart, 0.035, 0.035, 0.14, dx, 0.68, 0, 0xdfe4e8, { rough: 0.15, opacity: 0.5, seg: 10 });
    reg2(cleaningCart, "cleaning-cart");

    // ------------------------------------------------------------- PPE stand
    const ppe = group(g, 2.0, 0, 0.9, -1.0);
    slab(ppe, 0.4, 1.3, 0.08, 0, 0.65, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const gownHook = box(ppe, 0.16, 0.5, 0.05, 0, 0.9, 0.06, 0xdfe6d8, { rough: 0.85 });
    reg2(gownHook, "gown");
    const maskShape = group(ppe, -0.02, 0.55, 0.06);
    box(maskShape, 0.1, 0.06, 0.03, 0, 0, 0, 0x8fa3ad, { rough: 0.7 });
    for (const sx of [-1, 1]) cyl(maskShape, 0.002, 0.002, 0.12, sx * 0.08, 0, 0, 0x5a6570, { rough: 0.6, seg: 6 }).rotation.z = Math.PI / 2;
    reg2(maskShape, "n95-mask");
    const shield = group(ppe, 0.14, 0.9, 0.05);
    box(shield, 0.16, 0.16, 0.005, 0, 0, 0, 0xdfeef2, { rough: 0.15, opacity: 0.35 });
    box(shield, 0.16, 0.03, 0.02, 0, 0.09, 0.01, 0x2b3138, { rough: 0.5 });
    reg2(shield, "face-shield");

    // The trusted N95 supply box, and the questionable new-lot decoy.
    const trustedBox = box(ppe, 0.16, 0.09, 0.1, -0.04, 1.16, 0.06, 0xeaf2f4, { rough: 0.55 });
    decal(trustedBox, 0.13, 0.05, 0, 0.051, 0, signFace("N95 — LOT A", { bg: "#eaf2f4", fg: "#0f4257", accent: "#5fc9a0", scale: 0.42 })).rotation.x = -Math.PI / 2;
    reg2(trustedBox, "n95-box-trusted");
    const lotBBox = box(ppe, 0.16, 0.09, 0.1, 0.15, 1.16, 0.06, 0xeaf2f4, { rough: 0.55 });
    decal(lotBBox, 0.13, 0.05, 0, 0.051, 0, signFace("N95 — LOT B", { bg: "#eaf2f4", fg: "#0f4257", accent: "#f2ae14", scale: 0.42 })).rotation.x = -Math.PI / 2;

    // A surgical mask left on the counter — the decoy respirator.
    const surgicalMask = group(g, -1.0, 0, 1.0, 0.5);
    box(surgicalMask, 0.12, 0.001, 0.07, 0, 0.9, 0, 0x8fd6e8, { rough: 0.8, cast: false });
    for (const dz of [-0.05, 0.05]) cyl(surgicalMask, 0.001, 0.001, 0.16, 0, 0.9, dz, 0xdfe4e8, { rough: 0.6, seg: 6 }).rotation.x = Math.PI / 2;
    reg2(surgicalMask, "surgical-mask-decoy");

    // Counter with a computer and keyboard just outside the barrier plan.
    const counter = group(g, -1.9, 0, -1.9, 0.3);
    slab(counter, 0.9, 0.78, 0.5, 0, 0.39, 0, AER_CABINET, { radius: 0.02, rough: 0.45, metal: 0.1 });
    box(counter, 0.92, 0.06, 0.52, 0, 0.78, 0, AER_ACCENT, { rough: 0.4, cast: false });   // countertop trim
    box(counter, 0.9, 0.1, 0.5, 0, 0.05, 0, 0x2b3138, { rough: 0.6 });                      // plinth
    box(counter, 0.35, 0.24, 0.02, -0.15, 0.94, -0.12, 0x2b3138, { rough: 0.4 });
    const keyboard = box(counter, 0.28, 0.02, 0.11, -0.15, 0.82, 0.08, 0x3a4048, { rough: 0.5 });
    reg2(keyboard, "keyboard-uncovered");

    // Door with a wedge propping it open — the hazard.
    const door = group(g, 4.2, 0, -2.5, -0.4);
    box(door, 0.05, 2.0, 0.9, 0, 1.0, 0, 0xd8dde0, { rough: 0.5, cast: false });
    const wedge = box(door, 0.06, 0.04, 0.04, 0.05, 0.02, 0.42, 0xb8402f, { rough: 0.7 });
    reg2(wedge, "door-propped");

    // Objects for the pre-walk find step: a door not latched, a blocked
    // return grille, and a light handle poster showing no barrier yet.
    const doorAjar = group(g, 4.0, 0, -1.4, -0.2);
    box(doorAjar, 0.04, 1.9, 0.8, 0, 0.95, 0, 0xd8dde0, { rough: 0.5, cast: false });
    reg2(doorAjar, "door-ajar");
    const returnGrille = group(g, -4.6, 0, -2.6);
    box(returnGrille, 0.4, 0.3, 0.04, 0, 2.4, 0, 0x8b929a, { rough: 0.5, metal: 0.3, cast: false });
    const blockingCart = box(returnGrille, 0.4, 0.6, 0.3, 0, 0.3, 0.2, 0x53585e, { rough: 0.5, metal: 0.3 });
    reg2(returnGrille, "vent-blocked");
    const barrierGapDemo = group(lightArm, 0.55, 1.7, 0.42);
    ball(barrierGapDemo, 0.02, 0, 0, 0, 0xd8232a, { emissive: 0xd8232a, ei: 1.2 });
    reg2(barrierGapDemo, "barrier-gap");

    // A bank of labelled PPE drawers under the counter, and stacked
    // consumable jars — the ordinary furniture of a working bay.
    const drawerUnit = group(g, -3.2, 0, -1.3, 0.3);
    slab(drawerUnit, 0.7, 0.5, 0.4, 0, 0.25, 0, 0xc9d0d4, { radius: 0.02, rough: 0.5, metal: 0.1 });
    for (let i = 0; i < 4; i++) {
      const dz = -0.26 + i * 0.17;
      box(drawerUnit, 0.62, 0.13, 0.02, 0, 0.25, 0.21, 0xd8dde0, { rough: 0.4 });
      cyl(drawerUnit, 0.006, 0.006, 0.08, dz, 0.25, 0.225, 0x8b929a, { rough: 0.3, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    }
    const jars = group(drawerUnit, 0, 0.51, 0);
    const JAR_LABELS = ["GOWNS", "N95", "SHIELDS", "WIPES", "TAPE"];
    JAR_LABELS.forEach((label, i) => {
      const jx = -0.26 + i * 0.13;
      cyl(jars, 0.045, 0.045, 0.12, jx, 0.06, 0, 0xdfe8ee, { rough: 0.1, opacity: 0.5, seg: 14 });
      cyl(jars, 0.046, 0.046, 0.015, jx, 0.128, 0, 0x2b3138, { rough: 0.5, seg: 14 });
      decal(jars, 0.07, 0.03, jx, 0.06, 0.0451, signFace(label, { bg: "#dfe8ee", fg: "#1d3b4a", accent: "#5fc9a0", scale: 0.42 }), { px: 96 });
    });

    // Wall clock, and a wall-mounted sink for hand hygiene.
    const clock = group(g, -3.2, 1.9, -1.51, 0);
    cyl(clock, 0.09, 0.09, 0.02, 0, 0, 0, 0xf2f5f7, { rough: 0.4, seg: 20 }).rotation.x = Math.PI / 2;
    box(clock, 0.005, 0.06, 0.006, 0, 0.02, 0.011, 0x2b3138, { rough: 0.5 });
    box(clock, 0.04, 0.005, 0.006, 0.015, 0, 0.011, 0x2b3138, { rough: 0.5 });
    const sink = group(g, 3.1, 0, -1.9, -Math.PI / 2);
    slab(sink, 0.5, 0.15, 0.4, 0, 0.85, 0, 0xd8dde0, { radius: 0.03, rough: 0.35, metal: 0.15 });
    box(sink, 0.42, 0.12, 0.32, 0, 0.8, 0, 0xc4ccd2, { rough: 0.3, metal: 0.1 });
    cyl(sink, 0.012, 0.012, 0.2, 0, 1.0, -0.12, AER_STEEL, { rough: 0.2, metal: 0.9, seg: 10 });
    cyl(sink, 0.012, 0.012, 0.1, 0, 1.09, -0.03, AER_STEEL, { rough: 0.2, metal: 0.9, seg: 10 }).rotation.x = Math.PI / 2.4;
    for (const sx of [-1, 1]) cyl(sink, 0.012, 0.014, 0.05, sx * 0.06, 0.99, -0.13, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 10 });

    const assistant = standingFigure(g, -3.6, -0.5, { ry: -1.1, cloth: 0x2f6f7c, skin: 0xcd9a72 });

    const key = new THREE.DirectionalLight(0xf6fbff, 0.8);
    key.position.set(-2, 4.5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xeaf6fa, 0x445058, 0.9));

    let capturing = false;
    const spray = particles(g, 24, 0xdfe9ea, { size: 0.014, life: 0.4, additive: false, opacity: 0.4 });

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -0.6),

      onStepComplete(step) {
        if (step.id === "hepa-power") repaint(hepaDial.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "dam-placement") damKit.children[1].material = mat(0xf2e6cf, { rough: 0.6 });
        if (step.id === "hve-ready") capturing = true;
        if (step.id === "fallow-time") repaint(clockPanel.userData.screen, signFace("READY", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
      },

      onInterrupt(it) {
        if (it.id === "hepa-filter-alarm") {
          hepaGlow.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
          repaint(hepaDial.userData.screen, signFace("FILTER", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.5 }));
        }
        if (it.id === "mask-lot-fail") {
          lotBBox.material = mat(0xf0645b, { rough: 0.5 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hepa-filter-alarm") {
          hepaGlow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
          repaint(hepaDial.userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (it.id === "mask-lot-fail") lotBBox.material = mat(0xeaf2f4, { rough: 0.55 });
      },

      animate(t, dt, session) {
        if (capturing && session?.step?.id === "procedure-monitor") {
          spray.visible = true;
          spray.userData.step(dt, new THREE.Vector3(0, 1.1, -0.9), 0.03, 0.25, -0.6);
        } else if (spray.visible) spray.visible = false;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "hepa-power") {
          const pct = Math.round(gg.t * 100);
          repaint(hepaDial.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.64 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "fallow-time") {
          const mins = Math.round(gg.t * 30);
          repaint(clockPanel.userData.screen, signFace(`${mins}m`, {
            bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
      },
    };
  },
};
