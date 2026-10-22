import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument,
  standingFigure, surfaceTexture, texturedMat, palette, concreteFace,
  corrugatedFace, safetyStripeFace, gratingFace, reg,
} from "../citykit.js";
import { regionalJet, deicingTruck } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ De-icing Truck Boom Operations VR — its own gamified system:
// Clean Wing.
//
// Working a de-icing truck's boom over a parked jet: the truck and boom
// walked for a defect before the fluid ever runs, the pad cleared of
// everyone who is not part of the spray crew, the fluid mixed to the plan
// rather than guessed at, the pass run top-down and clear of every engine
// intake, the basket held steady through the pass, and the surfaces checked
// clean by eye and by hand before the holdover clock the flight crew is
// timing their own departure against ever starts. No fluid type, mix ratio
// or holdover time here is one this platform is certain of — those live on
// the manufacturer's own holdover chart and the day's deicing plan.

const AVDI_ACCENT = 0x4fd1ff;

export const SIM_AV_DEICING_TRUCK_BOOM_OPERATIONS = {
  id: "av-deicing-truck-boom-operations",
  index: "av-5",
  domain: "Aviation",
  trade: "De-icing truck operator — IAM/TWU ramp crew",
  category: "Mobility & Transit",
  weather: "wind",
  certification: "IAM and TWU ramp training; FAA 14 CFR Part 121 icing and de-icing programme requirements and 14 CFR Part 139 movement-area operations; OSHA 29 CFR 1910.1200 hazard communication, 29 CFR 1910.132 personal protective equipment and 29 CFR 1910.134 respiratory protection",
  name: "De-icing Truck Boom Operations",
  title: simTitle("De-icing Truck Boom Operations"),
  tagline: "A jet cleaned before departure: the boom walked for a defect, the pad cleared of everyone outside the spray crew, the fluid mixed to the plan, the pass run top-down and clear of every intake, the basket held steady, and the surfaces checked clean before the holdover clock starts",
  accent: AVDI_ACCENT,
  accentCss: "#4fd1ff",
  parSeconds: 310,
  footprint: 2.9,
  badge: { id: "clean-wing", name: "Clean Wing", note: "The pad cleared, the pass run top-down clear of every intake, and the surfaces confirmed clean before the holdover clock started" },

  game: system({
    name: "Clean Wing",
    currency: "FROST",
    ranks: ["Ramp Hand", "Boom Qualified", "Fluid Certified", "Lead Operator", "Clean Wing Certified"],
    badges: [
      { id: "clear-pad", name: "Clear Pad", note: "Never sprayed with anyone inside the pad who was not part of the crew", test: AWARD.safe },
      { id: "top-down", name: "Top Down", note: "Ran the pass in the plan's own order, first time", test: AWARD.stepClean("spray-top-down") },
      { id: "steady-basket", name: "Steady Basket", note: "Held the basket steady near band centre through the whole pass", test: AWARD.precise(0.7) },
      { id: "clean-inspection", name: "Clean Inspection Certified", note: "Found every defect on the truck, first pass", test: AWARD.stepClean("inspect-truck") },
    ],
    challenges: [
      { id: "quick-deice", name: "Quick De-ice", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "frost-streak", name: "Frost Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IAM or TWU local's member assistance programme, or the site's employee assistance line if a close call under the boom is what stayed with you",

  hazards: {
    "engine-intake-spray-hazard": "That aims the spray straight into the engine intake. Fluid pulled into a running or soon-to-run engine does not clean anything — it is exactly the kind of contamination the pass is supposed to avoid, on a part of the aircraft this crew has no business spraying at all.",
    "no-ppe-spray-hazard": "You are running the boom without the chemical-resistant suit and respirator on. De-icing fluid drifts as a fine mist the whole time the boom is spraying, and skin contact or breathing it in over a full shift is exactly what that PPE is there to stop happening at all.",
    "ground-personnel-in-spray-hazard": "Somebody who is not part of the spray crew is standing inside the boom's own swing radius. The basket moves through a wide arc at height, and a person under it has nowhere to go the moment that arc swings toward where they are standing.",
    "skip-clean-check-hazard": "That releases the aircraft without checking the surfaces are actually clean. A wing that looks clear from the ground can still be holding frost in a spot the pass did not fully reach, and the only way to know for certain is the check this crew is about to skip.",
  },

  lateNotes: {
    "frost-patch-wing": "The surfaces get checked by eye and by hand before the holdover clock starts, not assumed clean because the pass looked thorough from the truck.",
    "holdover-panel": "The holdover time gets communicated to the flight deck the moment the last fluid application ends, not estimated later from memory.",
  },

  interrupts: [
    {
      id: "wind-gust-blows-spray-back",
      kind: "Spray blowback",
      after: "hold-basket-position", delay: 5, seconds: 12,
      alert: "A gust has pushed the fluid spray back toward the truck cab, well outside the pattern the pass was aimed at.",
      cue: "Hit the boom stop now, before the blowback reaches anyone at the truck.",
      target: "boom-estop",
      why: "A pattern that has drifted this far off target is no longer a controlled pass — it is fluid landing somewhere nobody planned for it to land, and the boom stops the instant that happens rather than continuing on the assumption the wind will settle back down.",
      missNote: "The boom kept running while the blowback reached the truck itself. Fluid that ends up somewhere it was never aimed is exactly the exposure this crew's own PPE cannot fully protect against if it keeps happening.",
      wrongNote: "Not the fix — the blowback reaching the truck is the thing that stops this pass first.",
    },
    {
      id: "coworker-enters-swing-radius",
      kind: "Swing-radius incursion",
      after: "spray-top-down", delay: 4, seconds: 11,
      alert: "A coworker has walked into the boom's own swing radius to check something on the far side of the truck.",
      cue: "Stop the boom now and get them clear before it swings again.",
      target: "boom-estop",
      why: "The swing radius is not a suggestion — it is the space the basket physically occupies at some point in every full pass, and the one defence against a person inside it is a boom that stops moving the instant they are seen there.",
      missNote: "The boom kept swinging while a coworker was inside its own radius. A basket at height does not announce itself before it reaches somewhere a person already is.",
      wrongNote: "Wrong move — somebody is in the swing radius, and that is what stops the boom, not this.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["chem-suit", "face-shield-deice", "respirator"],
      itemNames: { "chem-suit": "chemical-resistant suit", "face-shield-deice": "face shield", "respirator": "respirator" },
      title: "Suit up for the pass",
      cue: "Chemical-resistant suit, face shield and respirator before the boom moves.",
      why: "A de-icing pass puts this crew directly in a fine drifting mist for the length of the whole spray, in a way a normal ramp job does not, and the suit and respirator are matched to that specific exposure rather than borrowed from a general PPE kit.",
    },
    {
      id: "brief", kind: "select", target: "deice-plan-board",
      title: "Read the de-icing plan",
      cue: "Confirm the fluid type, the mix ratio and the holdover chart reference before staging anything.",
      why: "The plan is what ties today's fluid mix to today's actual conditions, and a crew running a pass without reading it first has no way to know whether the holdover time they are about to quote the flight deck even applies to the fluid going on this aircraft.",
    },
    {
      id: "inspect-truck", kind: "find", noHint: true,
      targets: ["boom-hydraulic-leak", "cracked-nozzle", "heater-fault"],
      itemNames: {
        "boom-hydraulic-leak": "hydraulic leak at the boom joint",
        "cracked-nozzle": "cracked spray nozzle",
        "heater-fault": "fault light on the fluid heater",
      },
      itemNotes: {
        "boom-hydraulic-leak": "A leak at a boom joint is control this crew is losing over exactly the arm they are about to swing over a parked aircraft.",
        "cracked-nozzle": "A cracked nozzle sprays an uneven pattern, and an uneven pattern is a wing that reads clean from the truck while still holding frost somewhere the check has to catch.",
        "heater-fault": "Fluid applied at the wrong temperature does not perform the way the holdover chart assumes it does, which makes the fault light this crew's one warning before the chart's own numbers stop meaning anything.",
      },
      decoyNotes: { "sound-fluid-tank": "The fluid tank gauge reads normal with no leak at the fitting. Nothing to flag there." },
      title: "Inspect the truck and boom",
      cue: "Walk the truck and boom. Three problems are hiding — find them by looking.",
      why: "A boom that looks ready from the ground is not the same thing as one a competent person has actually walked before it swings over a parked aircraft — a leak, a cracked nozzle or a heater fault found now costs a repair, and found mid-pass costs a spray this crew cannot trust the coverage of.",
    },
    {
      id: "clear-area", kind: "sequence", anyOrder: true,
      targets: ["pad-clear", "cones-deice"],
      itemNames: { "pad-clear": "pad cleared of other ground equipment", "cones-deice": "cones set at the pad boundary" },
      title: "Clear the pad",
      cue: "Clear every vehicle and person who is not part of the spray crew, then cone the boundary.",
      why: "Everyone and everything inside the pad the moment the boom starts moving is inside the one area this pass is going to put fluid, wind gusts and a swinging basket into, and clearing it first is what keeps that area matching the one the plan actually accounted for.",
    },
    {
      id: "position-truck", kind: "drag", target: "truck-body",
      title: "Position the truck",
      cue: "Drive the truck to the pass position alongside the aircraft.",
      why: "The boom's own reach only covers the pattern the plan calls for from one specific position — a truck parked a little off that mark is a pass that either cannot reach part of the aircraft or has to be run twice to cover what the first position missed.",
      drag: { to: "truck-position", radius: 0.5, missNote: "Not on the pass position — bring the truck fully into position before raising the boom." },
    },
    {
      id: "raise-boom", kind: "turn", target: "boom-raise-lever",
      title: "Raise the boom",
      cue: "Turn the raise lever to bring the boom up to the pass position.",
      why: "The boom has to clear the aircraft's own structure before it ever swings toward it, and raising it fully to the pass height first is what keeps the first swing from being the moment this crew discovers it was not high enough.",
      turn: { turns: 0.45, axis: "z", label: "BOOM HEIGHT" },
    },
    {
      id: "select-fluid-mix", kind: "select", target: "fluid-mix-panel",
      title: "Set the fluid mix",
      cue: "Confirm the fluid type and mix ratio match the plan before the pass starts.",
      why: "The mix ratio is what the holdover chart's own numbers are built around — a pass run on the wrong mix is a holdover time the flight deck is about to be quoted that does not actually apply to the fluid now on the aircraft.",
    },
    {
      id: "spray-top-down", kind: "sequence",
      targets: ["wings-sprayed", "fuselage-sprayed", "tail-sprayed"],
      itemNames: { "wings-sprayed": "wings sprayed", "fuselage-sprayed": "fuselage sprayed", "tail-sprayed": "tail sprayed" },
      title: "Run the pass top-down",
      cue: "Spray the wings first, then the fuselage, then the tail — top-down, clear of every intake.",
      why: "Top-down is the order that lets fluid already applied keep draining clear of surfaces still to be sprayed, rather than running back down over a wing this pass already finished — and every intake on the aircraft stays outside the pattern the whole time.",
      outOfOrderNote: "Wings, then fuselage, then tail — top-down, the order the plan runs the pass in.",
    },
    {
      id: "monitor-mix-ratio", kind: "gauge", target: "mix-ratio-gauge",
      title: "Check the mix ratio",
      cue: "Read the mix ratio gauge and commit only once it is inside the plan's band.",
      why: "The gauge is the one number that tells this crew the tank is actually delivering the mix the plan called for, rather than a ratio that drifted while the pass was already running.",
      gauge: { label: "FLUID MIX", speed: 0.6, green: [0.46, 0.6], readout: (t) => `${Math.round(t * 100)}% concentrate`, missNote: "Outside the plan's band — confirm the mix ratio before continuing the pass." },
    },
    {
      id: "hold-basket-position", kind: "hold", target: "basket-control", seconds: 6,
      title: "Hold the basket steady",
      cue: "Hold the basket control steady through the pass, watching the pattern the whole time.",
      why: "A basket that drifts mid-pass is a pattern that no longer matches the one the plan called for, and holding it steady is what keeps every part of the surface getting the coverage the holdover time is about to be calculated against.",
      holdBreakNote: "Let go of the basket control mid-pass. Hold it steady — that is what keeps the pattern matching the coverage the holdover time assumes.",
    },
    {
      id: "verify-clean-surfaces", kind: "find", noHint: true,
      targets: ["frost-patch-wing", "frost-patch-tail"],
      itemNames: { "frost-patch-wing": "frost patch on the wing", "frost-patch-tail": "frost patch on the tail" },
      itemNotes: {
        "frost-patch-wing": "A patch this small is exactly what a pass can miss and a ground check by eye and by hand is built to catch before it matters.",
        "frost-patch-tail": "The tail's own surfaces get the same check as the wings — contamination anywhere on a lifting or control surface is contamination the flight crew needs to know did not happen.",
      },
      decoyNotes: { "clean-panel": "This panel is clean and dry to the touch. Nothing to flag there." },
      title: "Check the surfaces are clean",
      cue: "Check the wing and tail by eye and by hand — two spots are still holding frost.",
      why: "A wing that reads clean from the truck can still be holding frost in a spot the pass did not fully reach, and the only way this crew actually knows before releasing the aircraft is checking it by eye and by hand rather than trusting how the pass looked going on.",
    },
    {
      id: "start-holdover-clock", kind: "select", target: "holdover-panel",
      title: "Start the holdover clock",
      cue: "Communicate the holdover start time to the flight deck the moment the last application ends.",
      why: "The flight deck is timing their own departure against this exact moment, and a holdover start that is estimated or given late hands them a clock that no longer matches the fluid actually protecting the aircraft.",
    },
    {
      id: "stow-boom", kind: "turn", target: "boom-raise-lever",
      title: "Stow the boom",
      cue: "Turn the lever back to lower and stow the boom before the truck moves.",
      why: "A boom left raised is a truck that cannot move without striking something overhead, so it comes all the way down and stows clean before this truck goes anywhere else on the ramp.",
      turn: { turns: 0.45, axis: "z", label: "BOOM HEIGHT" },
    },
    {
      id: "closeout-log", kind: "select", target: "closing-log",
      title: "Log the de-icing pass",
      cue: "Log the fluid type, the mix ratio and the holdover start time before signing off.",
      why: "The next crew and the flight deck's own dispatch release both read this record rather than ask this crew what happened — a pass that went perfectly but never gets logged leaves the holdover clock with nothing behind it but this crew's memory of when it started.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const PAL = palette("aviation");
    stationPad(g, 2.9, AVDI_ACCENT);

    // ------------------------------------------------------------------ pad ground
    const groundMesh = box(g, 8.6, 0.12, 8.2, 0, 0.06, 0, 0xffffff, { rough: 0.9 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { tone: "#9aa0a2", tone2: "#8b9294" }), { repeat: 6, px: 512 }),
      { rough: 0.88, metal: 0.02, color: 0xc7ccce },
    );
    // Fluid-containment collection channel — a grating strip, a second textured surface.
    const channelMesh = box(g, 6.4, 0.02, 0.4, 0, 0.111, 3.6, 0xffffff, { rough: 0.7, cast: false });
    channelMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 4, px: 256 }),
      { rough: 0.7, metal: 0.4, color: 0xffffff },
    );
    // Pad boundary striping — a third textured surface.
    for (const [bx, bz, bw, bd] of [[0, 2.8, 6.2, 0.15], [0, -2.8, 6.2, 0.15]]) {
      const edge = box(g, bw, 0.005, bd, bx, 0.104, bz, 0xffffff, { rough: 0.85, cast: false });
      edge.material = texturedMat(
        surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 3, px: 256 }),
        { rough: 0.8, metal: 0.02, color: 0xffffff },
      );
    }

    // ------------------------------------------------------------------ crew shelter (main structure)
    const shelter = group(g, -3.2, 0, 2.4, 0.3);
    for (const [cx2, cz2] of [[-0.7, -0.6], [0.7, -0.6], [-0.7, 0.6], [0.7, 0.6]]) cyl(shelter, 0.05, 0.05, 2.1, cx2, 1.05, cz2, PAL.trim, { rough: 0.5, metal: 0.4, seg: 10 });
    const shelterRoof = box(shelter, 1.8, 0.08, 1.6, 0, 2.12, 0, 0xffffff, { rough: 0.6 });
    shelterRoof.material = texturedMat(
      surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: PAL.structure, ribs: 8 }), { repeat: 2, px: 512 }),
      { rough: 0.55, metal: 0.25, color: 0xffffff },
    );
    holoTag(shelter, "PPE staging", 0, 2.5, 0, { css: "#4fd1ff", w: 0.34 });

    // ------------------------------------------------------------------ aircraft & truck
    const jet = regionalJet(g, 0, 0, -2.4, { livery: { colour: PAL.structure, accent: AVDI_ACCENT, fleetName: "SITE AIR", unitNumber: "N550XA" } });
    holoTag(jet, "aircraft on the pad", 0, 3.4, 0, { css: "#4fd1ff", w: 0.4 });
    const { wingL, wingR, tailfin } = jet.userData.parts;

    const truck = deicingTruck(g, 2.6, 0, 1.4, { ry: -1.9, livery: { colour: PAL.accent, fleetName: "DEICE", unitNumber: "DI-6" } });
    reg(hits, truck, "truck-body");
    holoTag(truck, "de-icing truck", 0, 3.0, 0, { css: "#4fd1ff", w: 0.28 });
    const { boomBase, boomArm, basket } = truck.userData.parts;
    const truckPosition = group(g, 1.6, 0.3, -0.4);
    hits["truck-position"] = truckPosition;

    const boomLeak = group(boomArm, 0, 0.2, 1.0);
    ball(boomLeak, 0.02, 0, 0, 0, 0x2b2318, { rough: 0.5, opacity: 0.7, transparent: true, seg: 10 });
    reg(hits, boomLeak, "boom-hydraulic-leak");
    const crackedNozzle = group(basket, 0, -0.1, 0.5);
    box(crackedNozzle, 0.03, 0.02, 0.06, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, crackedNozzle, "cracked-nozzle");
    const heaterFault = group(truck, -0.5, 1.8, -1.0);
    ball(heaterFault, 0.02, 0, 0, 0, 0xb8402f, { emissive: 0xb8402f, ei: 1.2, seg: 8 });
    reg(hits, heaterFault, "heater-fault");
    const soundFluidTank = group(truck, 0.6, 2.0, -1.0);
    ball(soundFluidTank, 0.015, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 8 });
    reg(hits, soundFluidTank, "sound-fluid-tank");

    const padClearPick = box(g, 0.4, 0.3, 0.4, -3.6, 0.15, -0.4, 0x4a5561, { rough: 0.6, metal: 0.3 });
    holoTag(g, "pad clear of equipment", -3.6, 0.42, -0.4, { css: "#4fd1ff", w: 0.44 });
    reg(hits, padClearPick, "pad-clear");
    const conesDeicePick = cone(g, 3.6, -2.2);
    holoTag(g, "pad boundary cones", 3.6, 0.5, -2.2, { css: "#4fd1ff", w: 0.4 });
    reg(hits, conesDeicePick, "cones-deice");

    const boomRaiseLever = group(truck, 0.7, 2.1, -2.9, 0.2);
    box(boomRaiseLever, 0.08, 0.05, 0.04, 0, 0.4, 0, 0x2b2f34, { rough: 0.55 });
    const boomRaiseKnob = cyl(boomRaiseLever, 0.014, 0.014, 0.16, 0.07, 0.4, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.7, rough: 0.4, seg: 10 });
    boomRaiseKnob.rotation.z = Math.PI / 2;
    holoTag(boomRaiseLever, "boom raise lever", 0, 0.56, 0, { css: "#4fd1ff", w: 0.34 });
    reg(hits, boomRaiseKnob, "boom-raise-lever");

    const fluidMixPanel = instrument(truck, -0.7, 2.1, -2.9, { ry: 3.14, idle: "-- %", color: AVDI_ACCENT });
    holoTag(fluidMixPanel, "fluid mix panel", 0, 0.16, 0, { css: "#4fd1ff", w: 0.34 });
    reg(hits, fluidMixPanel, "fluid-mix-panel");

    const wingsSprayedPick = ball(wingL, 0.05, 1.2, 0.08, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.9, seg: 12 });
    holoTag(wingL, "spray wings", 1.2, 0.24, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, wingsSprayedPick, "wings-sprayed");
    const fuselageSprayedPick = ball(jet.userData.parts.fuselage, 0.05, 0, 0.7, -0.2, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.9, seg: 12 });
    holoTag(jet.userData.parts.fuselage, "spray fuselage", 0, 0.84, -0.2, { css: "#4fd1ff", w: 0.32 });
    reg(hits, fuselageSprayedPick, "fuselage-sprayed");
    const tailSprayedPick = ball(tailfin, 0.05, 0, 0.9, -0.1, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.9, seg: 12 });
    holoTag(tailfin, "spray tail", 0, 1.04, -0.1, { css: "#4fd1ff", w: 0.26 });
    reg(hits, tailSprayedPick, "tail-sprayed");
    const engineIntakeHazard = box(g, 0.8, 0.7, 0.8, -1.15, 0.62, -2.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "spray into the intake?", -1.15, 1.1, -2.45, { css: "#d2312b", w: 0.4 });
    reg(hits, engineIntakeHazard, "engine-intake-spray-hazard");

    const mixRatioGauge = instrument(g, -1.4, 0, 0.6, { ry: 0.8, idle: "--%", color: AVDI_ACCENT });
    holoTag(mixRatioGauge, "mix ratio", 0, 0.16, 0, { css: "#4fd1ff", w: 0.3 });
    reg(hits, mixRatioGauge, "mix-ratio-gauge");

    const basketControl = group(basket, 0, 0.3, 0.1);
    ball(basketControl, 0.03, 0, 0, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.8, seg: 12 });
    holoTag(basketControl, "basket control", 0, 0.18, 0, { css: "#4fd1ff", w: 0.32 });
    reg(hits, basketControl, "basket-control");
    const swingRadiusHazard = box(g, 4.0, 1.2, 4.0, 1.6, 1.5, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the swing radius?", 1.6, 2.2, -1.0, { css: "#d2312b", w: 0.46 });
    reg(hits, swingRadiusHazard, "ground-personnel-in-spray-hazard");
    const boomEstop = group(truck, 0, 2.3, -2.9, 0);
    cyl(boomEstop, 0.03, 0.03, 0.05, 0, 0, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 12 });
    const boomEstopCap = ball(boomEstop, 0.035, 0, 0.03, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.7, seg: 12 });
    holoTag(boomEstop, "boom stop", 0, 0.16, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, boomEstopCap, "boom-estop");

    const frostPatchWing = ball(wingR, 0.03, -0.8, 0.06, 0.2, 0xdfe6ea, { rough: 0.4, seg: 10 });
    reg(hits, frostPatchWing, "frost-patch-wing");
    const frostPatchTail = ball(tailfin, 0.025, 0.2, 0.5, -0.2, 0xdfe6ea, { rough: 0.4, seg: 10 });
    reg(hits, frostPatchTail, "frost-patch-tail");
    const cleanPanel = ball(wingL, 0.02, 0.8, 0.06, 0.2, 0x3b4148, { rough: 0.5, seg: 8 });
    reg(hits, cleanPanel, "clean-panel");
    const skipCleanCheckHazard = group(g, 2.0, 0.14, -1.8, 0.3);
    box(skipCleanCheckHazard, 0.08, 0.05, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const releaseAnywayPaddle = box(skipCleanCheckHazard, 0.14, 0.1, 0.012, 0, 0.2, 0.007, 0xd2312b, { rough: 0.5 });
    decal(releaseAnywayPaddle, 0.12, 0.08, 0, 0, 0.008, signFace("RELEASE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.32 }));
    reg(hits, releaseAnywayPaddle, "skip-clean-check-hazard");

    const holdoverPanel = instrument(g, -1.8, 0, -0.6, { ry: 0.8, idle: "--:--", color: AVDI_ACCENT });
    holoTag(holdoverPanel, "holdover clock", 0, 0.16, 0, { css: "#4fd1ff", w: 0.3 });
    reg(hits, holdoverPanel, "holdover-panel");

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.62, 0.42, -3.2, 1.5, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DE-ICING PLAN · PAD 2", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("MIX PER THE PLAN", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Fluid type + mix: per the plan", "Holdover time: per the manufacturer's chart",
       "Pass order: wings, fuselage, tail", "No intake ever inside the pattern",
       "Clean check before the holdover clock starts"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.4, accent: AVDI_ACCENT });
    reg(hits, plan, "deice-plan-board");

    const ppeRack = group(g, -3.6, 0, 1.2, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const suitProp = box(ppeRack, 0.24, 0.4, 0.04, 0, 0.65, 0, AVDI_ACCENT, { rough: 0.7 });
    holoTag(suitProp, "chemical-resistant suit", 0, 0.2, 0, { css: "#4fd1ff", w: 0.42 });
    reg(hits, suitProp, "chem-suit");
    const shieldProp = group(ppeRack, 0.2, 0.62, 0);
    box(shieldProp, 0.14, 0.16, 0.01, 0, 0, 0, 0xdfe6ea, { rough: 0.3, opacity: 0.7, transparent: true });
    holoTag(shieldProp, "face shield", 0, 0.18, 0, { css: "#4fd1ff", w: 0.3 });
    reg(hits, shieldProp, "face-shield-deice");
    const respiratorProp = group(ppeRack, -0.2, 0.62, 0);
    ball(respiratorProp, 0.05, 0, 0, 0, 0x2b2f34, { rough: 0.6, seg: 10 });
    holoTag(respiratorProp, "respirator", 0, 0.16, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, respiratorProp, "respirator");
    const sprayAnywayLever = group(truck, 0.7, 1.9, -2.9, 0.2);
    box(sprayAnywayLever, 0.08, 0.05, 0.03, 0, 0.14, 0, 0x2b2f34, { rough: 0.55 });
    const sprayAnywayPaddle = box(sprayAnywayLever, 0.14, 0.1, 0.012, 0, 0.28, 0.008, 0xd2312b, { rough: 0.5 });
    decal(sprayAnywayPaddle, 0.12, 0.08, 0, 0, 0.009, signFace("SPRAY\nNOW", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.32 }));
    reg(hits, sprayAnywayPaddle, "no-ppe-spray-hazard");

    const closingLog = group(g, 3.3, 0, 2.4, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("DEICE LOG\nOPEN", { bg: "#11181f", accent: "#4fd1ff", scale: 0.28 }), { px: 320 });
    holoTag(closingLog, "de-icing log", 0, 1.34, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, closingLog, "closing-log");

    const snow = particles(g, 40, 0xeaf3f7, { size: 0.02, life: 1.6, additive: false, opacity: 0.35 });
    const mist = particles(g, 24, 0xcfe6ee, { size: 0.03, life: 0.5, additive: false, opacity: 0.2 });

    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.4),

      onInterrupt(it) {
        if (it.id === "wind-gust-blows-spray-back") { basket.position.z -= 0.4; }
        if (it.id === "coworker-enters-swing-radius") { boomArm.rotation.y = 0.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-gust-blows-spray-back") { basket.position.z += 0.4; }
        if (it.id === "coworker-enters-swing-radius") { boomArm.rotation.y = 0; }
      },
      onStepComplete(step) {
        if (step.id === "inspect-truck") {
          boomLeak.children[0].material = mat(0x59c97b, { rough: 0.5, opacity: 0.3, transparent: true });
          crackedNozzle.children[0].material = mat(0x59c97b, { rough: 0.6 });
          heaterFault.children[0].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6, seg: 8 });
        }
        if (step.id === "verify-clean-surfaces") { frostPatchWing.visible = false; frostPatchTail.visible = false; }
        if (step.id === "start-holdover-clock") {
          repaint(holdoverPanel.userData.screen, signFace("00:00", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (step.id === "closeout-log") {
          repaint(closingLogFace, signFace("DEICE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "raise-boom" || step?.id === "stow-boom") boomBase.rotation.y = Math.sin(t * 0.8) * 0.1;
        snow.userData.step(dt, new THREE.Vector3(0, -0.5, 0), 4, 4, -0.1);
        if (step?.id === "spray-top-down" || step?.id === "hold-basket-position") {
          mist.visible = true;
          mist.userData.step(dt, new THREE.Vector3(-0.6, -0.3, 0.2), 0.3, 0.4, -0.15);
        } else if (mist.visible) mist.visible = false;
      },
    };
  },
};
