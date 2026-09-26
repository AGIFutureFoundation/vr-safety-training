import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { backhoe } from "../../../shared/equipment.js";
import { chock } from "../../../shared/toolkit.js";
import { fuelTank, dumpster } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Equipment Daily Walkaround & Fluids VR — its own gamified
// system: Fleet Readiness.
//
// The IUOE operator's own pre-op procedure, run on the loader backhoe before
// the first bucket of the day: the checklist read before the walkaround
// starts, the machine walked for a leak or a worn tyre, every fluid checked
// against its own gauge or sight glass, a chock set before anyone works
// underneath it, the stabilizer transport lock confirmed, the seatbelt
// buckled, the brakes tested, and the hydraulics cycled through their full
// range before the machine is trusted with a real load. No fluid level,
// pressure or torque number here is one this platform is certain of —
// those live on the machine's own manual and the shift's inspection form.

const OPWA_ACCENT = 0x4f8fa0;

export const SIM_OP_EQUIPMENT_DAILY_WALKAROUND_AND_FLUIDS = {
  id: "op-equipment-daily-walkaround-and-fluids",
  index: "op-8",
  domain: "Construction",
  trade: "Heavy equipment operator — IUOE Local 3 operating engineer",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "IUOE Local 3 operating engineer training; OSHA 29 CFR 1926 Subpart O Motor vehicles, mechanized equipment, and marine operations and 29 CFR 1926.602 Material handling equipment; 29 CFR 1926.21 safety training and education; NIOSH fatality-investigation findings on struck-by and caught-in incidents during equipment servicing",
  name: "Equipment Daily Walkaround & Fluids",
  title: simTitle("Equipment Daily Walkaround & Fluids"),
  tagline: "Daily pre-op walkaround on a loader backhoe: the checklist read, the machine walked for a leak or a defect, every fluid checked against its own gauge, a chock set before working underneath it, and the brakes and hydraulics proved before the first bucket of the day",
  accent: OPWA_ACCENT,
  accentCss: "#4f8fa0",
  parSeconds: 255,
  footprint: 2.5,
  badge: { id: "fleet-readiness", name: "Fleet Readiness", note: "Walked, fluids checked, chocked before working underneath, and the brakes and hydraulics proved before the first bucket" },

  game: system({
    name: "Fleet Readiness",
    currency: "READY",
    ranks: ["Ground Hand", "Equipment Hand", "Walkaround Certified", "Readiness Authority", "Fleet Readiness Certified"],
    badges: [
      { id: "never-skip-a-fluid", name: "Never Skip a Fluid", note: "Check every fluid level clean, first try", test: AWARD.stepClean("engine-oil-check") },
      { id: "chocked-before-under", name: "Chocked Before Under", note: "Never worked near the undercarriage before chocking", test: AWARD.stepClean("chock-place") },
      { id: "steady-checks", name: "Steady Checks", note: "Held the gauge readings near band centre all shift", test: AWARD.precise(0.72) },
      { id: "clean-walkaround", name: "Clean Walkaround", note: "Never missed a defect on the walk-around", test: AWARD.stepClean("walk-around-defects") },
    ],
    challenges: [
      { id: "quick-walkaround", name: "Quick Walkaround", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ready-streak", name: "Ready Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IUOE local's member assistance programme, or the site's employee assistance line if a close call during a pre-op inspection is what stayed with you",

  hazards: {
    "hydraulic-leak-ignore": "That presses on past a hydraulic leak instead of logging it. Hydraulic fluid escaping under system pressure can penetrate skin at a range most people never expect, and a leak that keeps a machine running one more day without repair is a leak that gets worse under exactly the loads the machine is about to be asked to carry.",
    "no-chock-hazard": "You are working near the undercarriage without a chock set. A machine on even a slight grade, or one whose parking brake is not what it should be, can roll enough to catch a hand or a foot the instant nobody is watching for it — the chock is what removes that possibility before anyone goes near the tracks or wheels.",
    "defect-bypass-hazard": "That starts the machine before the defect just found was actually logged. A defect written down after the fact is a defect that never stopped anyone from operating around it — logging it before start-up is what gives a lead the chance to red-tag the machine while it still can.",
    "guard-open-hazard": "That starts the engine with an access panel still open. A panel left open exposes belts, fans and linkages that do not stop moving just because a hand is nearby, and closing it before start-up is the one step between an inspection and an injury.",
  },

  lateNotes: {
    "chock-roll": "The chock goes under the wheel before anyone works near the undercarriage, not after someone is already down there and the machine is discovered to be unchocked.",
    "defect-tag": "The defect gets logged the moment it is found on the walkaround, not reconstructed from memory once the shift is already underway.",
  },

  interrupts: [
    {
      id: "brake-pedal-soft",
      kind: "Brake feel changes",
      after: "brake-test", delay: 4, seconds: 12,
      alert: "The brake pedal has gone noticeably softer partway through the test, with more travel before it bites.",
      cue: "Call it in to the shift lead before trusting this brake system for the day.",
      target: "shift-lead",
      why: "A pedal that changes feel mid-test is the brake system telling you something before it fails outright — reporting it now, while the machine is still in the yard and not loaded on a grade somewhere, is what turns a caught defect into a scheduled repair instead of an emergency.",
      missNote: "The test was called clean despite the pedal going soft. A brake system that already changed feel once during a test at idle is not a system to trust with a loaded bucket on a grade.",
      wrongNote: "Not that — the soft pedal is what has to be reported before this machine goes anywhere on today's brakes.",
    },
    {
      id: "hydraulic-pressure-spike",
      kind: "Pressure spike",
      after: "hydraulic-cycle-test", delay: 4, seconds: 11,
      alert: "The hydraulic pressure gauge has spiked into the red as the boom cycles through its range.",
      cue: "Stop the cycle test now, before the spike repeats on a real load.",
      target: "hydraulic-stop-flag",
      why: "A pressure spike during an empty cycle test is the system showing a problem under the easiest conditions it will ever see — the same spike under an actual load is exactly the kind of event that ruptures a hose or fails a cylinder seal without warning.",
      missNote: "The cycle test continued through the pressure spike. A hydraulic failure under load does not give the operator time to react the way a spike on an empty test just did.",
      wrongNote: "Not that — the pressure spike is what has to stop this cycle test before anything else about it matters.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the walkaround",
      cue: "Hi-vis vest and hard hat before stepping into the yard.",
      why: "A walkaround happens in a yard with other equipment moving around it, and the vest and hard hat are what make the person doing the inspection visible to every other operator in that yard, not just to the machine being checked.",
    },
    {
      id: "checklist-board", kind: "select", target: "checklist-board",
      title: "Read the pre-op checklist",
      cue: "Confirm today's inspection form before starting the walkaround.",
      why: "The checklist is what turns a walkaround into a repeatable inspection instead of whatever the operator happens to remember to look at — reading it first is what makes sure nothing on today's form gets skipped because the walkaround felt routine.",
    },
    {
      id: "walk-around-defects", kind: "find", noHint: true,
      targets: ["hydraulic-hose-leak", "worn-tyre", "cracked-mirror"],
      itemNames: {
        "hydraulic-hose-leak": "hydraulic hose weeping fluid",
        "worn-tyre": "worn tyre tread",
        "cracked-mirror": "cracked mirror",
      },
      itemNotes: {
        "hydraulic-hose-leak": "A hose weeping fluid under pressure is a hose that fails suddenly, not gradually — better to find the weep now than the failure later.",
        "worn-tyre": "Tread worn below where it should be changes how this machine actually handles on the grades and the wet ground it works on every day.",
        "cracked-mirror": "A cracked mirror is a blind spot the operator does not know they have until the one time it actually matters.",
      },
      decoyNotes: {
        "sound-panel": "That access panel is intact, seated and shows no damage. Nothing to flag there.",
      },
      title: "Walk around the machine before starting it",
      cue: "Walk the full machine. Three defects are hiding on it — find them by looking.",
      why: "A machine that looks fine parked in the yard is not the same thing as one a competent person has actually walked around — a leak, a worn tyre or a cracked mirror found now costs a repair ticket, and found once the machine is already working costs a breakdown or a blind spot nobody knew to compensate for.",
    },
    {
      id: "engine-oil-check", kind: "gauge", target: "oil-dipstick",
      title: "Check the engine oil level",
      cue: "Read the dipstick and commit only inside the safe fill range.",
      why: "Running the engine low on oil accelerates wear on every bearing surface it is supposed to be protecting, and the dipstick is the only honest reading of that level — not a guess based on how the machine sounded yesterday.",
      gauge: {
        label: "ENGINE OIL LEVEL", speed: 0.6, green: [0.46, 0.62],
        readout: (t) => (t < 0.46 ? "below the safe fill line" : t > 0.62 ? "above the full mark" : "in the safe fill range"),
        missNote: "Outside the safe fill range. Correct the level before starting this engine.",
      },
    },
    {
      id: "hydraulic-fluid-check", kind: "gauge", target: "hydraulic-sight-glass",
      title: "Check the hydraulic fluid level",
      cue: "Read the sight glass and commit only inside the safe fill range.",
      why: "Low hydraulic fluid lets the pump draw air, and air in a hydraulic system shows up later as spongy, unpredictable movement in the boom and bucket — exactly the moment an operator does not want to discover it.",
      gauge: {
        label: "HYDRAULIC FLUID LEVEL", speed: 0.55, green: [0.48, 0.65],
        readout: (t) => (t < 0.48 ? "below the sight glass mark" : t > 0.65 ? "above the full mark" : "in the safe fill range"),
        missNote: "Outside the safe fill range. Correct the level before cycling any hydraulic function.",
      },
    },
    {
      id: "coolant-check", kind: "select", target: "coolant-reservoir",
      title: "Check the coolant level",
      cue: "Confirm the coolant reservoir is between the marked lines before starting the engine.",
      why: "An engine that runs hot because the coolant was never checked is an engine that can warp or crack under the exact loads a normal day's work puts on it — the reservoir marks exist so this is a visual confirmation, not a guess.",
    },
    {
      id: "extinguisher-check", kind: "select", target: "fire-extinguisher",
      title: "Confirm the fire extinguisher",
      cue: "Confirm the extinguisher is mounted, charged and within its inspection date.",
      why: "A fire extinguisher that is not actually charged is a fire extinguisher in name only — confirming the gauge and the inspection tag now is what makes it a real control instead of a mounting bracket that looks reassuring from a distance.",
    },
    {
      id: "chock-place", kind: "drag", target: "chock-roll",
      title: "Chock the machine",
      cue: "Carry the chock to the wheel before anyone works near the undercarriage.",
      why: "A machine parked on even a slight grade, with a parking brake that is not everything it should be, can roll enough to catch a hand or a foot near the wheels — the chock is what removes that possibility before the inspection goes anywhere near the undercarriage.",
      drag: { to: "chock-socket", radius: 0.4, missNote: "Not against the wheel — set the chock so it actually blocks it, not beside it." },
    },
    {
      id: "stabilizer-lock", kind: "turn", target: "stabilizer-lock-lever",
      title: "Confirm the stabilizer transport lock",
      cue: "Turn the lock lever to confirm both stabilizers are secured for travel.",
      why: "A stabilizer that is not locked for transport can drop or swing on rough ground, and confirming the lock now is what keeps that from becoming a surprise the first time the machine hits a pothole on the way to the job.",
      turn: { turns: 0.5, axis: "y", label: "STABILIZER LOCK" },
    },
    {
      id: "seatbelt-buckle", kind: "select", target: "seatbelt",
      title: "Buckle the seatbelt",
      cue: "Buckle in before starting the engine, every day, not just the days that feel like they need it.",
      why: "The ROPS structure over this seat only protects an operator who stays inside its zone of protection, and the seatbelt is the only thing that keeps a body there through whatever the day's work turns out to include.",
    },
    {
      id: "brake-test", kind: "hold", target: "brake-pedal", seconds: 6,
      title: "Test the brakes",
      cue: "Hold steady pressure on the brake pedal and feel for consistent resistance the whole time.",
      why: "A brake test at idle, before the machine is loaded or on a grade, is the cheapest possible place to catch a problem — a pedal that feels wrong here is a warning the yard can act on, not a discovery made halfway down a haul road.",
      holdBreakNote: "Released the pedal before the test finished. Hold it through the whole check — that is the only way to catch a brake problem developing under steady pressure.",
    },
    {
      id: "hydraulic-cycle-test", kind: "track", target: "hydraulic-pressure-gauge", seconds: 8,
      title: "Cycle the hydraulics through their range",
      cue: "Cycle the boom through its full range, keeping the pressure needle inside the safe band the whole time.",
      why: "Cycling every hydraulic function through its complete range before the first real use is what catches a slow leak, a soft spot or a pressure spike while the machine is still empty and stationary — exactly the conditions in which a problem is easiest to see and safest to have.",
      track: {
        start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12,
        label: "HYDRAULIC PRESSURE",
        readout: (v) => (v < 0.4 ? "pressure low — check for a leak" : v > 0.62 ? "pressure spiking" : "in the safe band"),
      },
      holdBreakNote: "The pressure drifted out of the safe band. Bring the cycle back under control before continuing.",
    },
    {
      id: "defect-log", kind: "select", target: "defect-tag",
      title: "Log any defects found",
      cue: "Log every defect from the walkaround before the machine is released for work.",
      why: "A defect log is what gives the shift lead the chance to red-tag a machine that should not be working today — a defect that was noticed but never written down is a defect the next person to touch this machine has no way of knowing about.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the pre-op inspection",
      cue: "Sign off the inspection form before releasing the machine for the day's work.",
      why: "The signed inspection form is the record that this specific machine, on this specific day, was actually checked — not assumed fine because it looked the same as it did yesterday.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, OPWA_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.2, 0.14, 5.8, 0, 0.07, 0, 0xffffff, { rough: 0.88 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#3d4145", base2: "#34383c", seam: "rgba(0,0,0,0.5)" }), { repeat: 7, px: 512 }),
      { rough: 0.88, metal: 0.06, color: 0xa9b0b6 },
    );

    // ------------------------------------------------------------------ the backhoe
    const bh = backhoe(g, -0.6, 0.14, -0.4, { ry: 1.9, livery: { colour: OPWA_ACCENT, fleetName: "SITE PLANT", unitNumber: "BH-4" } });
    const { door, wheels, stabilizers, boom } = bh.userData.parts;
    holoTag(bh, "backhoe BH-4", 0, 3.4, 0, { css: "#4f8fa0", w: 0.32 });
    reg(hits, door, "seatbelt-mount");

    const seatbelt = group(bh, 0.1, 1.9, -0.3, 0.3);
    box(seatbelt, 0.03, 0.3, 0.02, 0, 0, 0, 0xd8b23a, { rough: 0.7 });
    box(seatbelt, 0.06, 0.03, 0.02, 0, -0.15, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    reg(hits, seatbelt, "seatbelt");

    const soundPanel = group(bh, 0.7, 0.9, 0.3);
    box(soundPanel, 0.2, 0.15, 0.02, 0, 0, 0, 0x59c97b, { rough: 0.5 });
    reg(hits, soundPanel, "sound-panel");
    const hoseLeak = group(bh, -0.7, 0.7, -1.2);
    ball(hoseLeak, 0.03, 0, 0, 0, 0x2b2318, { rough: 0.5, opacity: 0.7, transparent: true, seg: 10 });
    reg(hits, hoseLeak, "hydraulic-hose-leak");
    const wornTyre = group(wheels?.[0] ?? bh, 0, 0, 0.4);
    box(wornTyre, 0.1, 0.02, 0.1, 0, 0, 0, 0x1c1c1c, { rough: 0.9 });
    reg(hits, wornTyre, "worn-tyre");
    const crackedMirror = group(bh, 0.9, 1.7, 0.9);
    box(crackedMirror, 0.1, 0.08, 0.01, 0, 0, 0, 0xb8402f, { rough: 0.5, opacity: 0.6, transparent: true });
    reg(hits, crackedMirror, "cracked-mirror");

    // ------------------------------------------------------------------ fluids
    const dipstick = instrument(g, 1.3, 0, -0.6, { ry: -0.3, idle: "-- level", color: OPWA_ACCENT });
    holoTag(dipstick, "oil dipstick", 0, 0.16, 0, { css: "#4f8fa0", w: 0.3 });
    reg(hits, dipstick, "oil-dipstick");
    const sightGlass = instrument(g, 1.3, 0, -1.4, { ry: -0.3, idle: "-- level", color: OPWA_ACCENT });
    holoTag(sightGlass, "hydraulic sight glass", 0, 0.16, 0, { css: "#4f8fa0", w: 0.4 });
    reg(hits, sightGlass, "hydraulic-sight-glass");
    const coolant = group(bh, 0.6, 1.0, 1.1);
    box(coolant, 0.14, 0.12, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.2 });
    holoTag(coolant, "coolant reservoir", 0, 0.16, 0, { css: "#4f8fa0", w: 0.36 });
    reg(hits, coolant, "coolant-reservoir");
    const pressureGauge = instrument(g, 1.9, 0, -1.0, { ry: -0.4, idle: "-- psi", color: OPWA_ACCENT });
    holoTag(pressureGauge, "hydraulic pressure gauge", 0, 0.16, 0, { css: "#4f8fa0", w: 0.44 });
    reg(hits, pressureGauge, "hydraulic-pressure-gauge");

    // ------------------------------------------------------------------ safety devices
    const extinguisher = group(bh, -0.9, 0.9, 0.6, 0.3);
    cyl(extinguisher, 0.05, 0.06, 0.3, 0, 0.15, 0, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 12 });
    holoTag(extinguisher, "fire extinguisher", 0, 0.36, 0, { css: "#4f8fa0", w: 0.36 });
    reg(hits, extinguisher, "fire-extinguisher");
    const bypassLever = box(extinguisher, 0.06, 0.04, 0.02, 0.1, 0.2, 0, 0xd2312b, { rough: 0.5 });
    decal(bypassLever, 0.05, 0.035, 0, 0, 0.011, signFace("SKIP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    reg(hits, bypassLever, "guard-open-hazard");

    const stabLockLever = group(g, -1.6, 0.14, 1.2, 0.3);
    box(stabLockLever, 0.08, 0.04, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.55 });
    const stabKnob = cyl(stabLockLever, 0.018, 0.018, 0.16, 0.06, 0.5, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.6, rough: 0.4, seg: 12 });
    stabKnob.rotation.x = Math.PI / 2;
    holoTag(stabLockLever, "stabilizer lock", 0, 0.66, 0, { css: "#4f8fa0", w: 0.36 });
    reg(hits, stabKnob, "stabilizer-lock-lever");
    const startAnywayLever = box(stabLockLever, 0.08, 0.06, 0.02, -0.14, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(startAnywayLever, 0.07, 0.05, 0, 0, 0.011, signFace("START", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    reg(hits, startAnywayLever, "defect-bypass-hazard");
    const ignoreLeakLever = box(stabLockLever, 0.08, 0.06, 0.02, 0.14, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(ignoreLeakLever, 0.07, 0.05, 0, 0, 0.011, signFace("IGNORE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.45 }));
    reg(hits, ignoreLeakLever, "hydraulic-leak-ignore");

    const brakePedal = group(bh, -0.15, 0.55, 1.7);
    box(brakePedal, 0.12, 0.03, 0.16, 0, 0, 0, 0x2b2f34, { rough: 0.55 });
    reg(hits, brakePedal, "brake-pedal");

    // Chock, staged until carried to the wheel.
    const chockRoll = chock(g, 0.4, 0.14, 1.9, { ry: 0.4 });
    holoTag(chockRoll, "wheel chock", 0, 0.4, 0, { css: "#4f8fa0", w: 0.3 });
    reg(hits, chockRoll, "chock-roll");
    const chockSocket = group(g, 0.4, 0.14, 0.9);
    hits["chock-socket"] = chockSocket;
    const noChockHazard = group(g, 0.4, 0.14, 0.9);
    reg(hits, noChockHazard, "no-chock-hazard");

    // Hydraulic stop flag the pressure-spike interrupt is answered with.
    const hydraulicStopFlag = group(g, 2.2, 0.14, 1.4, 0.3);
    cyl(hydraulicStopFlag, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(hydraulicStopFlag, 0.16, 0.11, 0.01, 0, 0.62, 0.02, 0xd2312b, { rough: 0.55 });
    decal(hydraulicStopFlag, 0.14, 0.09, 0, 0.62, 0.026, signFace("STOP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(hydraulicStopFlag, "hydraulic stop", 0, 0.78, 0, { css: "#4f8fa0", w: 0.36 });
    reg(hits, hydraulicStopFlag, "hydraulic-stop-flag");

    // ------------------------------------------------------------------ crew
    const mechanic = standingFigure(g, -2.9, -2.6, { ry: 0.9, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(mechanic, "mechanic", 0, 1.95, 0.15, { css: "#4f8fa0", w: 0.28 });

    const shiftLead = standingFigure(g, 3.0, 2.3, { ry: -2.1, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });
    holoTag(shiftLead, "shift lead", 0, 1.95, 0.15, { css: "#4f8fa0", w: 0.28 });
    reg(hits, shiftLead, "shift-lead");
    const shiftLeadSafe = { x: 3.0, z: 2.3 };

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.58, 0.4, -2.5, 1.5, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4f8fa0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PRE-OP CHECKLIST · BH-4", w * 0.06, h * 0.12);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("INSPECT BEFORE START", w * 0.06, h * 0.3);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Fluids: per the manual's fill marks", "Chock: set before working underneath",
       "Defects: logged before the machine starts", "Brakes + hydraulics: proved before the first bucket"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.5, accent: OPWA_ACCENT });
    reg(hits, plan, "checklist-board");

    const ppeRack = group(g, -2.8, 0, 2.3, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, OPWA_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#4f8fa0", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#4f8fa0", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    const defectBoard = group(g, 2.3, 0, 0.6, -0.3);
    slab(defectBoard, 0.4, 0.3, 0.03, 0, 1.05, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const defectFace = decal(defectBoard, 0.36, 0.26, 0, 1.05, 0.02,
      signFace("DEFECT LOG\nOPEN", { bg: "#11181f", accent: "#4f8fa0", scale: 0.3 }), { px: 320 });
    holoTag(defectBoard, "defect log", 0, 1.28, 0, { css: "#4f8fa0", w: 0.3 });
    reg(hits, defectBoard, "defect-tag");

    const closingLog = group(g, 2.5, 0, 2.3, 0.4);
    slab(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("PRE-OP LOG\nOPEN", { bg: "#11181f", accent: "#4f8fa0", scale: 0.28 }), { px: 320 });
    holoTag(closingLog, "pre-op log", 0, 1.34, 0, { css: "#4f8fa0", w: 0.3 });
    reg(hits, closingLog, "closing-log");

    // Site dressing from the shared props kit.
    fuelTank(g, -1.0, 0, 2.6, { ry: 0.4 });
    dumpster(g, 1.0, 0, -2.6, { ry: -0.4 });

    const dust = particles(bh, 16, 0x9a8a6a, { size: 0.02, life: 0.6, additive: false, opacity: 0.16 });

    return {
      hits,
      footprint: 2.5,

      onInterrupt(it) {
        if (it.id === "brake-pedal-soft") { brakePedal.rotation.x = 0.15; }
        if (it.id === "hydraulic-pressure-spike") { boom.rotation.x += 0.08; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "brake-pedal-soft") { brakePedal.rotation.x = 0; }
        if (it.id === "hydraulic-pressure-spike") { boom.rotation.x -= 0.08; }
      },
      onStepComplete(step) {
        if (step.id === "walk-around-defects") {
          hoseLeak.children[0].material = mat(0x59c97b, { rough: 0.5, opacity: 0.3, transparent: true });
          wornTyre.children[0].material = mat(0x59c97b, { rough: 0.6 });
          crackedMirror.children[0].material = mat(0x59c97b, { rough: 0.5, opacity: 0.4, transparent: true });
        }
        if (step.id === "chock-place") { dust.visible = false; }
        if (step.id === "defect-log") {
          repaint(defectFace, signFace("DEFECT LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("PRE-OP LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        }
      },
      onHazard(hitId) { if (hitId === "no-chock-hazard") { dust.visible = true; } },

      animate(t, dt, session) {
        mechanic.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        shiftLead.userData.head.rotation.y = Math.sin(t * 0.6 + 1) * 0.4;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.4, 0), 0.15, 0.15, -0.1);
        if (!session?.finished && session?.step?.id !== "hydraulic-cycle-test") {
          boom.rotation.x = Math.sin(t * 0.2) * 0.005;
        }
        void stabilizers;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "engine-oil-check") {
            const lo = 0.46, hi = 0.62;
            repaint(dipstick.userData.screen, signFace(gg.t < lo ? "LOW" : gg.t > hi ? "HIGH" : "FULL", {
              bg: "#0d1c24", accent: gg.t >= lo && gg.t <= hi ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (session.step?.id === "hydraulic-fluid-check") {
            const lo = 0.48, hi = 0.65;
            repaint(sightGlass.userData.screen, signFace(gg.t < lo ? "LOW" : gg.t > hi ? "HIGH" : "FULL", {
              bg: "#0d1c24", accent: gg.t >= lo && gg.t <= hi ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
            }));
          }
        }
        if (session?.step?.id === "hydraulic-cycle-test" && session.holding) {
          const p = session.track?.v ?? 0.5;
          repaint(pressureGauge.userData.screen, signFace(`${Math.round(1200 + p * 1600)} psi`, {
            bg: "#0d1c24", accent: p > 0.4 && p < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
        void shiftLeadSafe;
      },
    };
  },
};
