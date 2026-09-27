import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { dockLevelerBay } from "../../../shared/equipment.js";
import { forkliftCounterbalance } from "../../../shared/fleet.js";
import { chock } from "../../../shared/toolkit.js";
import { palletRackBay, palletStack } from "../../../shared/props.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dock Leveler & Trailer Restraint Check VR — Manufacturing &
// Automation, Teamsters warehouse and logistics automation.
//
// A forklift crossing onto a trailer that is not actually held in place is
// trusting a gap it cannot see from the seat — the leveler bridges the gap
// between the dock and the trailer bed, and it does that job convincingly
// whether or not the trailer underneath it can move. This station walks the
// dock's own restraint sequence before any forklift crosses: the trailer
// backed fully to the bumpers, the ICC bar restraint engaged, the wheels
// chocked as the backup the restraint alone was never meant to be, the
// green light actually confirmed rather than assumed, and the leveler
// extended and proven before the first pallet crosses. No trailer's brake
// rating, the leveler's rated capacity or the dock light's wiring is a
// fact this platform is certain of — those live on the trailer's own
// placard and the dock's own maintenance manual.

const TW4_PAL = palette("warehouse");
const TWDL_ACCENT = 0xc8531b;

export const SIM_TW_DOCK_LEVELER_AND_TRAILER_RESTRAINT_CHECK = {
  id: "tw-dock-leveler-and-trailer-restraint-check",
  index: "tw-4",
  domain: "Warehousing & Logistics",
  trade: "Teamsters warehouse associate — dock leveler and trailer restraint",
  category: "Manufacturing & Automation",
  indoor: "garage",
  certification: "Teamsters (IBT) warehouse and logistics automation training; OSHA 29 CFR 1910.178 powered industrial trucks, 29 CFR 1910.147 the control of hazardous energy for the leveler's own power and 29 CFR 1910.36 design and construction requirements for exit routes at the dock door; OSHA 29 CFR 1926.602 material handling equipment; NIOSH findings on trailer-creep incidents at loading docks",
  name: "Dock Leveler & Trailer Restraint Check",
  title: simTitle("Dock Leveler & Trailer Restraint Check"),
  tagline: "Proving a trailer is actually held at the dock before the first forklift crosses it: backed fully to the bumpers, the ICC bar restraint engaged, the wheels chocked as the backup the restraint was never meant to be alone, the green light confirmed rather than assumed, and the leveler extended and proven before the crossing starts",
  accent: TWDL_ACCENT,
  accentCss: "#c8531b",
  parSeconds: 270,
  footprint: 2.7,
  badge: { id: "dock-restraint-certified", name: "Dock Restraint Certified", note: "Confirmed the restraint and the chocks before crossing, read the light instead of assuming it, and proved the leveler before trusting it with a load" },

  game: system({
    name: "Dock Restraint Control",
    currency: "RESTRAINT",
    ranks: ["Dock Hand", "Restraint Aware", "Dock Restraint Handler", "Dock Restraint Authority", "Dock Restraint Certified"],
    badges: [
      { id: "restraint-before-crossing", name: "Restraint Before Crossing", note: "Engaged the restraint and chocks before the first crossing", test: AWARD.stepClean("restraint-engage") },
      { id: "never-trust-a-taped-light", name: "Never Trust a Taped Light", note: "Never missed a hazard on the dock read", test: AWARD.stepClean("dock-hazard-read") },
      { id: "steady-crossing", name: "Steady Crossing", note: "Held the crossing speed near band centre every time", test: AWARD.precise(0.72) },
      { id: "clean-release", name: "Clean Release", note: "Released the restraint sequence in order, first try", test: AWARD.stepClean("release-sequence") },
    ],
    challenges: [
      { id: "quick-dock", name: "Quick Dock", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "restraint-streak", name: "Restraint Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your Teamsters local's member assistance programme, or the site's employee assistance line if a close call with a moving trailer at the dock is what stayed with you",

  hazards: {
    "gap-at-bumpers-hazard": "That gap between the trailer's rear frame and the dock bumpers means the trailer never actually backed in flush. A leveler resting its lip across a gap like that is bridging a trailer that still has room to roll before the restraint ever takes up the slack.",
    "restraint-not-engaged-hazard": "That restraint arm is hanging clear of the ICC bar instead of hooked under it. An arm that looks like it is in position from across the dock is not holding anything until it is actually engaged — this one is not.",
    "green-light-taped-hazard": "That dock light has been taped so it always shows green, restraint engaged or not. A light that cannot ever show red is not a safety control any more — it is a light that has been told to lie.",
    "skip-restraint-hazard": "That is the shortcut lever that waves a forklift across without waiting for the restraint to actually confirm. A dock light skipped once becomes a habit skipped every time, and the one trailer that was never really restrained looks exactly like every other one right up until it moves.",
  },

  lateNotes: {
    "restraint-arm": "The restraint arm gets engaged before the first forklift ever crosses, not checked after the trailer has already started to creep.",
    "leveler-control": "The leveler only extends once the trailer is confirmed backed in and restrained, not as the first move at a trailer that just pulled up.",
  },

  interrupts: [
    {
      id: "trailer-creep-fault",
      kind: "Trailer creep",
      after: "restraint-engage", delay: 4, seconds: 12,
      alert: "The trailer has visibly crept forward a few centimetres away from the dock bumpers.",
      cue: "Stop any crossing immediately and call the driver on the dock radio — do not send the forklift across on a trailer that is moving.",
      target: "driver-radio",
      why: "A trailer that creeps even a little after the restraint was engaged is a trailer whose brakes or restraint connection cannot be fully trusted, and the gap it opens up is exactly the gap a leveler's lip can silently drop into under a loaded forklift — calling the driver is what gets the trailer reset and re-confirmed before anyone crosses it again.",
      missNote: "The creeping trailer was crossed anyway. A trailer that has already moved once with a load on the dock will move again, and the next time may be while a forklift is on the leveler.",
      wrongNote: "Not that — a creeping trailer goes to the driver on the radio before any crossing continues.",
    },
    {
      id: "leveler-drop-fault",
      kind: "Leveler lip drop",
      after: "crossing-track", delay: 3, seconds: 12,
      alert: "The leveler's lip has dropped and is vibrating mid-crossing — a loss of hydraulic hold.",
      cue: "Stop the forklift immediately and back it off the leveler. Report it to dock maintenance.",
      target: "maintenance-radio",
      why: "A leveler that loses its hydraulic hold mid-crossing can drop further without warning, and the safest place for a loaded forklift the instant that happens is off the leveler entirely — reporting it is what gets the leveler locked out and inspected instead of trusted for the next load across it.",
      missNote: "The crossing continued through the drop. A leveler already losing its hold is not a leveler to finish trusting with the same load.",
      wrongNote: "Not that — a dropping leveler gets the forklift off it and dock maintenance called, before anything else.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before stepping onto the dock",
      cue: "Hi-vis vest and hard hat before approaching the dock door.",
      why: "A dock door is where a forklift, a trailer and foot traffic all share the same few metres, and the vest is what makes an associate visible to a driver whose mirrors do not cover the space directly behind the trailer.",
    },
    {
      id: "paperwork-read", kind: "select", target: "dock-board",
      title: "Read the dock assignment and paperwork",
      cue: "Confirm today's dock assignment and the trailer's paperwork before approaching it.",
      why: "The dock board is what confirms this is actually the trailer assigned to this door — crossing onto the wrong trailer because it happened to be backed in when the shift started is how a load ends up on the wrong route entirely.",
    },
    {
      id: "dock-hazard-read", kind: "find", noHint: true,
      targets: ["gap-at-bumpers-hazard", "restraint-not-engaged-hazard", "green-light-taped-hazard"],
      itemNames: {
        "gap-at-bumpers-hazard": "gap between the trailer and the bumpers",
        "restraint-not-engaged-hazard": "restraint arm hanging free",
        "green-light-taped-hazard": "dock light taped to green",
      },
      itemNotes: {
        "gap-at-bumpers-hazard": "A trailer sitting short of the bumpers gets called back in before anything else about this dock is trusted.",
        "restraint-not-engaged-hazard": "An unengaged restraint arm gets engaged properly, not assumed close enough from a glance.",
        "green-light-taped-hazard": "A taped-green light gets the tape pulled and the bulb tested — a light that cannot show red is worse than no light.",
      },
      decoyNotes: {
        "intact-bumper": "That dock bumper is mounted solid, showing no damage. Nothing to flag there.",
      },
      title: "Read the dock for what is already wrong with it",
      cue: "Look the dock over before anything crosses it. Three things are already wrong with it — find them.",
      why: "A dock that looks routine from the aisle is not the same thing as one an associate has actually checked — a gap at the bumpers, an unengaged restraint or a taped light each quietly removes a control the crossing depends on, and finding them now costs a callback to the driver instead of costing someone the moment a trailer moves under a loaded forklift.",
    },
    {
      id: "driver-checkin", kind: "select", target: "driver-checkin-point",
      title: "Confirm with the driver",
      cue: "Confirm with the driver that the trailer's own parking brake is set and the trailer is in gear or blocked.",
      why: "The restraint arm and the chocks back up the trailer's own brake — they were never designed to be the only thing holding it, so confirming the brake is actually set is the first control, not a formality before the real ones.",
    },
    {
      id: "restraint-engage", kind: "turn", target: "restraint-arm",
      title: "Engage the ICC bar restraint",
      cue: "Turn the restraint control to hook the arm under the trailer's ICC bar.",
      why: "The restraint arm is what keeps the trailer from pulling away from the dock while a forklift is on the leveler — engaging it now, before any crossing, is what turns a trailer that happens to be sitting still into one that is actually held.",
      turn: { turns: 0.5, axis: "x", label: "RESTRAINT ARM" },
    },
    {
      id: "chock-place", kind: "drag", target: "chock-roll",
      title: "Chock the trailer wheels",
      cue: "Carry the wheel chocks to the trailer's rear wheels as the restraint's own backup.",
      why: "The chocks are what the restraint arm depends on when the ICC bar's own condition is anything less than perfect — carrying them into place now is what keeps a bent or worn bar from being the only thing between this trailer and the dock.",
      drag: { to: "chock-socket", radius: 0.4, missNote: "Not against the wheel — set the chock so it actually blocks it, not beside it." },
    },
    {
      id: "light-confirm", kind: "select", target: "dock-light",
      title: "Confirm the dock light",
      cue: "Confirm the dock light reads green — engaged — before anything crosses.",
      why: "The dock light is the one signal visible to every forklift operator approaching the door, and reading it honestly, after the tape hazard was already dealt with, is what makes it worth trusting instead of just another light on the wall.",
    },
    {
      id: "leveler-gauge-check", kind: "gauge", target: "leveler-angle-gauge",
      title: "Check the leveler's deck angle",
      cue: "Read the leveler's deck-angle gauge and commit only inside the safe crossing range.",
      why: "A leveler extended at too steep an angle changes how a loaded forklift handles the instant its wheels cross onto it — the gauge is the only honest read of that angle, not how level the lip happens to look from the dock.",
      gauge: {
        label: "LEVELER DECK ANGLE", speed: 0.55, green: [0.38, 0.62],
        readout: (t) => (t < 0.38 ? "too steep — trailer riding low" : t > 0.62 ? "too steep — trailer riding high" : "within safe crossing range"),
        missNote: "Committed outside the safe crossing range. Adjust the leveler before trusting it with a crossing.",
      },
    },
    {
      id: "leveler-extend", kind: "hold", target: "leveler-control", seconds: 6,
      title: "Extend the leveler",
      cue: "Hold the leveler control until the lip fully seats on the trailer bed.",
      why: "Holding the control the whole way through the extension, rather than bumping it in short presses, is what lets the lip find its seat smoothly on the trailer bed instead of dropping the last few centimetres onto it under its own weight.",
      holdBreakNote: "Released the leveler control before the lip fully seated. A lip resting short of its seat is a leveler that has not actually bridged the gap yet.",
    },
    {
      id: "crossing-track", kind: "track", target: "forklift-crossing", seconds: 8,
      title: "Cross the leveler",
      cue: "Drive the forklift across while keeping the crossing speed indicator inside the safe band.",
      why: "Crossing a leveler too fast bounces a loaded fork exactly where the gap between the dock and the trailer used to be, and watching the speed indicator through the crossing is what keeps that bounce from ever happening in the first place.",
      track: {
        start: 0.5, green: [0.35, 0.65], rise: 0.4, fall: 0.42, drift: 0.1,
        label: "CROSSING SPEED",
        readout: (v) => (v < 0.35 ? "too slow — losing momentum on the lip" : v > 0.65 ? "too fast — bouncing the load" : "safe crossing speed"),
      },
      holdBreakNote: "The crossing speed left the safe band. Bring it back under control before continuing across the leveler.",
    },
    {
      id: "leveler-retract", kind: "select", target: "leveler-control",
      title: "Retract the leveler",
      cue: "Retract the leveler once the trailer is unloaded and the last crossing is complete.",
      why: "A leveler left extended after the last crossing is a trip hazard sitting in the doorway and a lip with nothing supporting its far end — retracting it is what returns the dock to a state the next trailer, or the next associate walking through, can actually trust.",
    },
    {
      id: "release-sequence", kind: "sequence", anyOrder: false,
      targets: ["restraint-release", "chock-remove", "driver-clear"],
      itemNames: { "restraint-release": "release the restraint", "chock-remove": "remove the chocks", "driver-clear": "clear the driver to pull out" },
      title: "Release the trailer",
      cue: "Release the restraint, remove the chocks, then clear the driver to pull out — in that order.",
      why: "Releasing the restraint before the chocks are out risks nothing by itself, but clearing the driver before both are actually clear of the trailer is how a chock gets run over or a restraint arm gets caught as the trailer pulls away — the order exists so the last person near the wheels is always the one confirming it, not the driver guessing from the cab.",
      outOfOrderNote: "Restraint, then chocks, then the driver cleared — clearing the driver before the chocks are physically clear risks running them over on the way out.",
    },
    {
      id: "closing-log", kind: "select", target: "dock-log",
      title: "Sign the dock log",
      cue: "Sign the dock log before moving on to the next trailer.",
      why: "The signed log is the record that this specific trailer, at this specific door, was actually restrained and checked before anything crossed it — not assumed fine because the last one usually is.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, TWDL_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.8, 0.14, 6.2, 0, 0.07, 0, 0xffffff, { rough: 0.86 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5f656b", base2: "#54595f", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.86, metal: 0.07, color: TW4_PAL.ground },
    );

    // ------------------------------------------------------------------ dock + trailer
    const dock = dockLevelerBay(g, 0, 0.14, -2.0, { ry: 0 });
    holoTag(dock, "dock door 6", 0, 3.0, 0, { css: "#c8531b", w: 0.32 });
    const { leverPlate, restraintArm, dockLightRed, dockLightGreen, restraintLightRed, restraintLightGreen } = dock.userData.parts;
    reg(hits, restraintArm, "restraint-arm");
    reg(hits, leverPlate, "leveler-control");
    reg(hits, dockLightGreen, "dock-light");

    // A simplified trailer-rear mock-up, backed up to the dock.
    const trailerRear = group(g, 0, 0.14, -4.4);
    box(trailerRear, 2.5, 2.6, 1.0, 0, 1.5, 0, 0xe4e9ec, { rough: 0.5, finish: "painted" });
    box(trailerRear, 2.5, 0.15, 0.1, 0, 0.75, 0.5, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const iccBar = box(trailerRear, 2.2, 0.1, 0.08, 0, 0.55, 0.52, 0x2b2f34, { rough: 0.55, metal: 0.5 });
    void iccBar;
    for (const sx of [-0.9, 0.9]) cyl(trailerRear, 0.32, 0.32, 0.24, sx, 0.32, 0.4, 0x1c1e21, { rough: 0.85, finish: "rubber", seg: 16 });
    holoTag(trailerRear, "trailer 4471", 0, 2.9, 0, { css: "#c8531b", w: 0.34 });

    // Gap hazard: the trailer parked short of the bumpers.
    const gapHazard = group(g, 0, 0.14, -3.9);
    box(gapHazard, 2.0, 0.02, 0.4, 0, 0.01, 0, TW4_PAL.accent, { rough: 0.7, opacity: 0.35, transparent: true, cast: false });
    reg(hits, gapHazard, "gap-at-bumpers-hazard");

    // Restraint hazard: a second, unengaged arm hanging free nearby.
    const restraintHazard = group(g, 0.6, 0.4, -2.2);
    box(restraintHazard, 0.12, 0.4, 0.1, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    reg(hits, restraintHazard, "restraint-not-engaged-hazard");

    // Taped dock light hazard, next to the real one.
    const tapedLight = group(g, -0.5, 2.6, -1.4);
    ball(tapedLight, 0.06, 0, 0, 0, 0xd8c98a, { rough: 0.6, opacity: 0.7, transparent: true, seg: 12, seg2: 10 });
    reg(hits, tapedLight, "green-light-taped-hazard");
    void dockLightRed;

    const skipLever = box(g, 0.09, 0.06, 0.02, 1.0, 0.9, -1.3, 0xd2312b, { rough: 0.5 });
    decal(skipLever, 0.08, 0.05, 0, 0, 0.011, signFace("SKIP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    reg(hits, skipLever, "skip-restraint-hazard");

    const bumperCheck = group(g, -0.95, 0.4, -1.9);
    box(bumperCheck, 0.18, 0.5, 0.18, 0, 0, 0, 0x1c1e21, { rough: 0.85, finish: "rubber" });
    reg(hits, bumperCheck, "intact-bumper");

    // ------------------------------------------------------------------ leveler gauge, forklift
    const angleGauge = group(g, 1.6, 0, -1.0, -0.4);
    box(angleGauge, 0.14, 0.1, 0.03, 0, 0.9, 0, 0x0d1c24, { rough: 0.5 });
    holoTag(angleGauge, "deck angle gauge", 0, 1.0, 0, { css: "#c8531b", w: 0.34 });
    reg(hits, angleGauge, "leveler-angle-gauge");

    const forklift = forkliftCounterbalance(g, 2.2, 0.14, 0.6, { ry: -1.6, livery: { colour: TWDL_ACCENT, fleetName: "DOCK FLEET", unitNumber: "FL-3" } });
    const { forks } = forklift.userData.parts;
    holoTag(forklift, "forklift FL-3", 0, 2.4, 0, { css: "#c8531b", w: 0.3 });
    reg(hits, forklift, "forklift-crossing");
    void forks;

    // ------------------------------------------------------------------ chocks
    const chockRoll = chock(g, -2.2, 0.14, 0.4, { ry: 0.4 });
    holoTag(chockRoll, "wheel chocks", 0, 0.4, 0, { css: "#c8531b", w: 0.3 });
    reg(hits, chockRoll, "chock-roll");
    const chockSocket = group(g, 0.9, 0.14, -4.0);
    hits["chock-socket"] = chockSocket;

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.8, 0, 1.7, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, TWDL_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#c8531b", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#c8531b", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    // ------------------------------------------------------------------ dressing
    const rack = palletRackBay(g, 2.9, 0.14, -3.0, { ry: Math.PI / 2 });
    holoTag(rack, "staging rack", 0, 4.4, 0, { css: "#c8531b", w: 0.34 });
    palletStack(g, -2.7, 0, 2.2, { ry: 0.4 });

    // ------------------------------------------------------------------ crew, boards
    const driver = standingFigure(g, -1.4, -2.4, { ry: 0.9, cloth: 0x37505f, vest: TW4_PAL.accent, helmet: null });
    holoTag(driver, "driver", 0, 1.9, 0.15, { css: "#c8531b", w: 0.24 });
    const driverCheckin = group(g, -2.1, 0, -2.4, 0.3);
    box(driverCheckin, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(driverCheckin, "driver check-in", 0, 1.35, 0, { css: "#c8531b", w: 0.34 });
    reg(hits, driverCheckin, "driver-checkin-point");
    const driverRadio = group(g, -2.1, 0, -1.7, 0.3);
    box(driverRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(driverRadio, "driver radio", 0, 1.35, 0, { css: "#c8531b", w: 0.3 });
    reg(hits, driverRadio, "driver-radio");
    const driverClearFlag = group(g, -2.1, 0, -2.7, 0.3);
    box(driverClearFlag, 0.1, 0.16, 0.03, 0, 1.1, 0, 0x2f7d4a, { rough: 0.5, finish: "painted" });
    holoTag(driverClearFlag, "clear to pull out", 0, 1.35, 0, { css: "#c8531b", w: 0.36 });
    reg(hits, driverClearFlag, "driver-clear");

    const associate = standingFigure(g, 2.45, -1.35, { ry: -1.7, cloth: 0x2b3138, vest: TW4_PAL.accent, helmet: 0xf2f2f2 });
    holoTag(associate, "warehouse associate", 0, 1.95, 0.15, { css: "#c8531b", w: 0.36 });
    const maintRadio = group(g, 2.1, 0, -1.9, -0.3);
    box(maintRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(maintRadio, "dock maintenance", 0, 1.35, 0, { css: "#c8531b", w: 0.36 });
    reg(hits, maintRadio, "maintenance-radio");

    const dockBoard = holoPanel(g, 0.58, 0.4, -2.7, 1.5, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c8531b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d1ab8f";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DOCK 6 · TRAILER 4471", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CONFIRM BEFORE CROSSING", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Restraint: per the dock's own check", "Chocks: backup, not optional"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.58 + i * 0.15)));
    }, { ry: 0.5, accent: TWDL_ACCENT });
    reg(hits, dockBoard, "dock-board");

    const dockLog = group(g, 2.7, 0, 1.6, 0.5);
    box(dockLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const dockLogFace = decal(dockLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("DOCK LOG\nOPEN", { bg: "#11181f", accent: "#c8531b", scale: 0.3 }), { px: 320 });
    holoTag(dockLog, "dock log", 0, 1.32, 0, { css: "#c8531b", w: 0.26 });
    reg(hits, dockLog, "dock-log");

    const restraintReleaseSwitch = group(g, 0.4, 0.4, -2.2);
    box(restraintReleaseSwitch, 0.1, 0.08, 0.04, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    reg(hits, restraintReleaseSwitch, "restraint-release");
    const chockRemoveSpot = group(g, 0.9, 0.14, -4.0);
    box(chockRemoveSpot, 0.14, 0.1, 0.16, 0, 0.05, 0, 0xe4622a, { rough: 0.6, finish: "rubber" });
    reg(hits, chockRemoveSpot, "chock-remove");

    return {
      hits,
      footprint: 2.7,

      onInterrupt(it) {
        if (it.id === "trailer-creep-fault") {
          trailerRear.position.z -= 0.12;
          restraintLightGreen.material = mat(0x000000, { emissive: 0x000000, ei: 0, rough: 0.4 });
          restraintLightRed.material = mat(0xd2312b, { emissive: 0xc01810, ei: 1.4, rough: 0.4 });
        }
        if (it.id === "leveler-drop-fault") { leverPlate.rotation.x = 0.12; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "trailer-creep-fault") {
          trailerRear.position.z += 0.12;
          restraintLightRed.material = mat(0x8a2020, { emissive: 0x000000, ei: 1, rough: 0.4 });
          restraintLightGreen.material = mat(0x2f7d4a, { emissive: 0x2f7d4a, ei: 1.4, rough: 0.4 });
        }
        if (it.id === "leveler-drop-fault") { leverPlate.rotation.x = 0; }
      },
      onStepComplete(step) {
        if (step.id === "dock-hazard-read") {
          gapHazard.children[0].material = mat(0x59c97b, { rough: 0.7, opacity: 0.2, transparent: true, cast: false });
          restraintHazard.children[0].material = mat(0x59c97b, { rough: 0.6 });
          tapedLight.children[0].visible = false;
        }
        if (step.id === "restraint-engage") { restraintArm.rotation.x = -0.5; }
        if (step.id === "leveler-extend") { leverPlate.position.z = 0.35; }
        if (step.id === "leveler-retract") { leverPlate.position.z = 0; }
        if (step.id === "release-sequence") { restraintArm.rotation.x = 0; }
        if (step.id === "closing-log") {
          repaint(dockLogFace, signFace("DOCK LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },

      animate(t, dt, session) {
        driver.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        associate.userData.head.rotation.y = Math.sin(t * 0.6 + 1) * 0.4;
        if (session?.step?.id === "crossing-track" && session.holding) {
          const v = session.track?.v ?? 0.5;
          forklift.position.z = 0.6 - (0.5 - v) * 0.4 - Math.sin(t * 3) * 0.02;
        }
        void dt;
      },
    };
  },
};
