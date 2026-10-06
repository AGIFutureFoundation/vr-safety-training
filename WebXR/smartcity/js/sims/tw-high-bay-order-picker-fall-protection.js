import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { scissorLift } from "../../../shared/equipment.js";
import { palletRackBay, palletStack } from "../../../shared/props.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ High-Bay Order Picker Fall Protection VR — Manufacturing &
// Automation, Teamsters warehouse and logistics automation.
//
// A stand-up order picker raises a person to where the stock actually is,
// which is exactly why the fall-protection habits around it matter more
// than they do at floor level: a gate left propped, a lanyard clipped to
// nothing in particular, or an unclip made while still in the air turns a
// routine pick into a fall from height. This station walks the order
// picker's own fall-protection sequence: the gate closed before the
// platform ever rises, a full-body harness clipped to the platform's own
// anchor rather than to whatever is nearby, the platform proven inside its
// rated height and load before reaching for stock, and the unclip saved
// for after the platform is back on the ground. No picker's rated height,
// load capacity or lift speed is a number this platform is certain of —
// those live on the truck's own data plate and the site's own powered
// industrial truck programme.

const TW3_PAL = palette("warehouse");
const OP_ACCENT = 0x3f9142;

export const SIM_TW_HIGH_BAY_ORDER_PICKER_FALL_PROTECTION = {
  id: "tw-high-bay-order-picker-fall-protection",
  index: "tw-3",
  domain: "Warehousing & Logistics",
  trade: "Teamsters warehouse associate — high-bay order picker operator",
  category: "Manufacturing & Automation",
  indoor: "shop",
  certification: "Teamsters (IBT) warehouse and logistics automation training; OSHA 29 CFR 1910.178 powered industrial trucks, 29 CFR 1910.28 duty to have fall protection and 29 CFR 1910.212 machine guarding; 29 CFR 1910.132 personal protective equipment for the full-body harness; NIOSH findings on falls from elevated order-picker platforms",
  name: "High-Bay Order Picker Fall Protection",
  title: simTitle("High-Bay Order Picker Fall Protection"),
  tagline: "Riding a stand-up order picker into the high bay the way its own fall-protection sequence requires: the gate closed before the platform rises, the harness clipped to the platform's own anchor, the height and load proven before reaching for stock, and the unclip saved for after the platform is back on the ground",
  accent: OP_ACCENT,
  accentCss: "#3f9142",
  parSeconds: 270,
  footprint: 2.8,
  badge: { id: "order-picker-certified", name: "Order Picker Fall Protection Certified", note: "Closed the gate before rising, clipped to the platform's own anchor, proved the height and load, and never unclipped while still in the air" },

  game: system({
    name: "High-Bay Access",
    currency: "ANCHOR",
    ranks: ["Floor Picker", "Bay Aware", "High-Bay Handler", "High-Bay Access Authority", "Order Picker Fall Protection Certified"],
    badges: [
      { id: "gate-first", name: "Gate First", note: "Closed the gate before the platform ever rose", test: AWARD.stepClean("gate-close") },
      { id: "never-unclip-early", name: "Never Unclip Early", note: "Unclipped only after the platform was back down", test: AWARD.stepClean("lanyard-unclip") },
      { id: "steady-transfer", name: "Steady Transfer", note: "Held the load moment near band centre through the transfer", test: AWARD.precise(0.72) },
      { id: "clean-preop", name: "Clean Pre-Op", note: "Never missed a hazard on the pre-use read", test: AWARD.stepClean("preop-hazard-read") },
    ],
    challenges: [
      { id: "quick-pick", name: "Quick Pick", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "anchor-streak", name: "Anchor Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your Teamsters local's member assistance programme, or the site's employee assistance line if a close call at height on an order picker is what stayed with you",

  hazards: {
    "gate-wedge-hazard": "That wedge block is jamming the platform gate open from the last shift's shortcut. A gate that cannot close is a gap in the one rail meant to stop a step backward from becoming a fall off the platform's own open side.",
    "frayed-lanyard-hazard": "That lanyard has a visibly frayed core strand where it runs over the snap hook — hardware that already looks like this has already taken more load than it should have. Clipping into it trades a fall-arrest device for a length of webbing that only looks like one.",
    "missing-pin-hazard": "That pothole-guard pin socket is empty — the retaining pin that keeps the guard from lifting off the platform's own understructure is missing. A guard that can lift free is a guard that stops protecting the exact moment a wheel finds an uneven seam in the floor.",
    "quick-release-hazard": "That is the quick-release lever that unclips the lanyard without lowering the platform first. A lanyard is only doing its job while the platform is still in the air — a lever built to remove it early removes the only thing standing between a stumble and a fall from height.",
  },

  lateNotes: {
    "platform-gate": "The gate gets closed before the platform ever rises, not checked once the associate is already at height.",
    "anchor-point": "The lanyard clips to the platform's own anchor before the platform rises, not to whatever happens to be in reach once it is already up.",
  },

  interrupts: [
    {
      id: "platform-tilt-fault",
      kind: "Platform tilt",
      after: "load-transfer", delay: 3, seconds: 12,
      alert: "The platform has tilted slightly to one side as the case shifted — an uneven load on the fork faces.",
      cue: "Stop the transfer and report the tilt to the picker radio rather than shifting your own weight to level it.",
      target: "picker-radio",
      why: "A platform that tilts under an uneven load is a platform whose fork faces need to be checked before the next lift, and shifting body weight to compensate teaches exactly the wrong reflex — reporting it is what gets the load re-centred by someone looking at the whole picker, not guessed at from inside the harness.",
      missNote: "The tilt was worked around instead of reported. A platform that tilts once under an uneven load will tilt again, and leaning to compensate is how an associate ends up leaning past the rail instead of behind it.",
      wrongNote: "Not that — the tilt goes to the picker radio before this transfer continues.",
    },
    {
      id: "aisle-obstruction-fault",
      kind: "Aisle obstruction below",
      after: "brakes-set", delay: 4, seconds: 12,
      alert: "An associate has walked into the aisle directly beneath the elevated platform.",
      cue: "Sound the horn and hold position. Do not lower the platform until the aisle is clear.",
      target: "horn-control",
      why: "Lowering a platform blind onto an aisle that was clear thirty seconds ago assumes nothing has changed underneath it — the horn is what tells the person below to move, and holding position is what keeps this from being the moment a loaded platform comes down onto someone who never knew it was there.",
      missNote: "The platform was lowered without sounding the horn. An aisle that was clear a moment ago is not the same thing as an aisle that is clear now.",
      wrongNote: "Not that — the horn and holding position come before anything else about this descent.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "harness"],
      itemNames: { "hi-vis-vest": "hi-vis vest", harness: "full-body harness" },
      title: "Suit up before the pre-use check",
      cue: "Hi-vis vest and full-body harness before touching the picker.",
      why: "The harness only protects an associate who is already wearing it correctly before the platform ever leaves the ground — putting it on after the pre-use check, instead of before, is how a fitted strap gets skipped under time pressure.",
    },
    {
      id: "preop-read", kind: "select", target: "preop-tag",
      title: "Read the pre-use inspection tag",
      cue: "Confirm today's pre-use tag on the picker before stepping onto the platform.",
      why: "The tag is the record that somebody already walked this specific truck today — riding the platform up without reading it means trusting a machine on nothing but how it looked from across the aisle.",
    },
    {
      id: "preop-hazard-read", kind: "find", noHint: true,
      targets: ["gate-wedge-hazard", "frayed-lanyard-hazard", "missing-pin-hazard"],
      itemNames: {
        "gate-wedge-hazard": "wedge jamming the gate open",
        "frayed-lanyard-hazard": "frayed lanyard on the mast",
        "missing-pin-hazard": "empty pothole-guard pin socket",
      },
      itemNotes: {
        "gate-wedge-hazard": "The wedge comes out before the gate is trusted to close on its own again.",
        "frayed-lanyard-hazard": "A lanyard with a frayed core strand gets tagged out, not clipped in — it goes to the crib, not onto anyone's harness.",
        "missing-pin-hazard": "An empty pin socket gets a pin before this guard is trusted to stay where it is bolted.",
      },
      decoyNotes: {
        "intact-beacon": "That beacon is mounted, wired and undamaged. Nothing to flag there.",
      },
      title: "Read the picker for what is already wrong with it",
      cue: "Look the picker over before stepping on. Three things are already wrong with it — find them.",
      why: "A picker that looks fine from the aisle is not the same thing as one an associate has actually checked — a wedged gate, a frayed lanyard or a missing pin each quietly removes a fall-protection control, and finding them now costs a tag-out instead of costing someone the one time they needed the control that was not actually there.",
    },
    {
      id: "gate-close", kind: "select", target: "platform-gate",
      title: "Close the platform gate",
      cue: "Close the platform's own gate before the platform ever leaves the ground.",
      why: "The gate is the one side of the platform rail built to open, and it only protects anyone once it is actually closed — checking it now, at ground level, is the last chance to fix it before it is a gap forty feet up.",
    },
    {
      id: "lanyard-anchor", kind: "drag", target: "lanyard-staged",
      title: "Clip the lanyard to the platform anchor",
      cue: "Carry the lanyard's snap hook to the platform's own anchor point and clip it in before rising.",
      why: "The platform's own anchor is engineered to hold a fall-arrest load; a nearby rail or a convenient loop was not — clipping to the anchor specifically, not just to something within reach, is what makes the harness a fall-arrest system instead of a costume.",
      drag: { to: "anchor-point", radius: 0.4, missNote: "Not on the platform's own anchor — the lanyard only does its job clipped to the point built to take the load." },
    },
    {
      id: "raise-hold", kind: "hold", target: "raise-control", seconds: 6,
      title: "Raise the platform to picking height",
      cue: "Hold the raise control until the platform reaches the marked picking height.",
      why: "Holding the raise control the whole way up, rather than bumping it in short presses, is what keeps the ascent smooth and predictable — a platform that lurches in stops and starts is a platform that can catch a foot that was braced for steady motion.",
      holdBreakNote: "Released the raise control before reaching picking height. A platform stopped partway between levels is a platform reaching distance that was never actually planned for.",
    },
    {
      id: "height-load-check", kind: "gauge", target: "load-gauge",
      title: "Confirm height and load within rating",
      cue: "Read the height and load gauge and commit only inside the rated band.",
      why: "A picker's rated capacity changes with how high the platform has gone, and the gauge is the only honest read of where this specific lift stands against that rating — reaching for one more case on the strength of how sturdy the platform feels is exactly the guess the gauge replaces.",
      gauge: {
        label: "HEIGHT / LOAD RATING", speed: 0.55, green: [0.4, 0.68],
        readout: (t) => (t < 0.4 ? "under-rated — safe to proceed" : t > 0.68 ? "over the rated combination" : "within rated combination"),
        missNote: "Committed outside the rated combination. Reduce the load or the height before reaching for the next case.",
      },
    },
    {
      id: "brakes-set", kind: "select", target: "brake-set",
      title: "Set the brakes",
      cue: "Set the picker's brakes before reaching out from the platform.",
      why: "A picker that can creep while an associate is leaning out from the platform turns a stable reach into a moving target — setting the brakes first is what keeps the platform exactly where it was raised.",
    },
    {
      id: "pick-sku", kind: "select", target: "marked-sku",
      title: "Pick the marked case",
      cue: "Select the case marked on today's pick list from the rack.",
      why: "Picking the marked case rather than the nearest one is what keeps the warehouse management system's count honest — a substituted pick looks fine on this platform and shows up as a shortage three moves later, on somebody else's shift.",
    },
    {
      id: "load-transfer", kind: "track", target: "load-moment-gauge", seconds: 8,
      title: "Transfer the case onto the platform",
      cue: "Lower the case onto the platform while keeping the load-moment indicator inside the centred band.",
      why: "Watching the load-moment indicator through the transfer is what catches a case being set down off-centre before it actually tips the platform's balance — a heavy case set down blind is a platform that finds out about the imbalance only once it starts to tilt.",
      track: {
        start: 0.5, green: [0.38, 0.62], rise: 0.38, fall: 0.4, drift: 0.1,
        label: "LOAD MOMENT",
        readout: (v) => (v < 0.38 ? "shifting toward the near edge" : v > 0.62 ? "shifting toward the far edge" : "centred"),
      },
      holdBreakNote: "The load moment drifted out of the centred band. Re-centre the case before continuing the transfer.",
    },
    {
      id: "lower-hold", kind: "hold", target: "lower-control", seconds: 6,
      title: "Lower the platform to the ground",
      cue: "Hold the lower control until the platform is fully back on the ground.",
      why: "Holding the descent all the way down, the same way the ascent was held, is what keeps this from being the platform that stops half-lowered while an associate already believes it is safe to move around on.",
      holdBreakNote: "Released the lower control before the platform was fully down. A platform stopped partway down is still a platform above the ground.",
    },
    {
      id: "lanyard-unclip", kind: "select", target: "anchor-point",
      title: "Unclip the lanyard",
      cue: "Unclip the lanyard from the platform anchor only once the platform is fully on the ground.",
      why: "The lanyard's whole job ends the moment the platform is back at ground level — unclipping any earlier, while the platform is still descending, is trading a fall-arrest connection for the belief that the descent will finish without incident.",
    },
    {
      id: "closing-log", kind: "select", target: "closing-log",
      title: "Sign the pick log",
      cue: "Sign the pick log before moving on to the next aisle.",
      why: "The signed log is the record that this specific pick, on this specific platform, actually followed the fall-protection sequence — not assumed fine because the associate usually does it right.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, OP_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.8, 0.14, 6.2, 0, 0.07, 0, 0xffffff, { rough: 0.85 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#4e5a63", base2: "#434d55", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.85, metal: 0.08, color: TW3_PAL.ground },
    );

    // ------------------------------------------------------------------ high-bay rack
    const rack = palletRackBay(g, 1.9, 0.14, -1.6, { ry: 0 });
    holoTag(rack, "aisle 12 rack", 0, 4.4, 0, { css: "#3f9142", w: 0.36 });
    const markedSku = group(rack, 0, 2.7, 0.6);
    box(markedSku, 0.3, 0.24, 0.3, 0, 0, 0, 0xd8c98a, { rough: 0.7, finish: "brushed" });
    holoTag(markedSku, "marked case", 0, 0.3, 0, { css: "#3f9142", w: 0.3 });
    reg(hits, markedSku, "marked-sku");

    // ------------------------------------------------------------------ order picker
    const picker = scissorLift(g, -0.7, 0.14, 0.2, { ry: 1.7, livery: { colour: OP_ACCENT, fleetName: "PICK FLEET", unitNumber: "OP-9" } });
    const { gate, controls, wheels, beacon, potholeGuards } = picker.userData.parts;
    holoTag(picker, "order picker OP-9", 0, 2.0, 0, { css: "#3f9142", w: 0.34 });
    reg(hits, gate, "platform-gate");
    void wheels;

    const raiseControl = group(controls, -0.12, 0.02, -0.03);
    box(raiseControl, 0.04, 0.03, 0.02, 0, 0, 0, 0x59c97b, { rough: 0.5 });
    reg(hits, raiseControl, "raise-control");
    const lowerControl = group(controls, 0.0, 0.02, -0.03);
    box(lowerControl, 0.04, 0.03, 0.02, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, lowerControl, "lower-control");
    const brakeSwitch = group(controls, 0.12, 0.02, -0.03);
    box(brakeSwitch, 0.04, 0.03, 0.02, 0, 0, 0, 0x2b2f34, { rough: 0.5 });
    reg(hits, brakeSwitch, "brake-set");
    const hornButton = group(controls, 0, 0.06, 0.02);
    ball(hornButton, 0.018, 0, 0, 0, 0xf0b323, { rough: 0.5, seg: 10, seg2: 8 });
    reg(hits, hornButton, "horn-control");
    const quickRelease = box(controls, 0.05, 0.03, 0.02, -0.14, 0.06, 0, 0xd2312b, { rough: 0.5 });
    decal(quickRelease, 0.04, 0.025, 0, 0, 0.011, signFace("REL", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    reg(hits, quickRelease, "quick-release-hazard");

    const anchorPoint = group(controls, 0.14, 0.1, -0.06);
    cyl(anchorPoint, 0.015, 0.015, 0.05, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 10 });
    reg(hits, anchorPoint, "anchor-point");

    // Bad lanyard hazard, hanging loose on the mast.
    const frayedLanyard = group(picker, 0.4, 1.4, -0.3);
    cyl(frayedLanyard, 0.006, 0.006, 0.4, 0, 0, 0, 0xd8c98a, { rough: 0.7, seg: 8 });
    reg(hits, frayedLanyard, "frayed-lanyard-hazard");

    // Empty pin socket near the pothole guard.
    const pinSocket = group(potholeGuards, 0.4, 0.03, 0);
    ball(pinSocket, 0.012, 0, 0, 0, 0x1c1e21, { rough: 0.6, seg: 8, seg2: 6 });
    reg(hits, pinSocket, "missing-pin-hazard");

    // Gate wedge hazard, a separate wood block jamming the gate rail.
    const gateWedge = group(g, -0.7 + 0.2, 0.14, 0.2 - 1.08);
    box(gateWedge, 0.1, 0.08, 0.06, 0, 0, 0, 0xa9835a, { rough: 0.85, finish: "brushed" });
    reg(hits, gateWedge, "gate-wedge-hazard");

    reg(hits, beacon, "intact-beacon");

    // Lanyard staged on a hook near the pre-op tag, ready to be carried up.
    const lanyardHook = group(g, -2.3, 0, 1.2, 0.3);
    box(lanyardHook, 0.04, 0.3, 0.04, 0, 0.6, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const lanyardStaged = group(lanyardHook, 0, 0.6, 0);
    cyl(lanyardStaged, 0.008, 0.008, 0.3, 0, -0.15, 0, 0xf0b323, { rough: 0.6, seg: 8 });
    holoTag(lanyardHook, "harness lanyard", 0, 0.95, 0, { css: "#3f9142", w: 0.32 });
    reg(hits, lanyardStaged, "lanyard-staged");

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.9, 0, 2.1, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, OP_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#3f9142", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const harnessProp = group(ppeRack, 0.2, 0.62, 0);
    box(harnessProp, 0.16, 0.24, 0.03, 0, 0, 0, 0xd8c98a, { rough: 0.75 });
    holoTag(harnessProp, "full-body harness", 0, 0.2, 0, { css: "#3f9142", w: 0.4 });
    reg(hits, harnessProp, "harness");

    // ------------------------------------------------------------------ dressing
    const rack2 = palletRackBay(g, -1.9, 0.14, -1.6, { ry: 0 });
    holoTag(rack2, "aisle 11 rack", 0, 4.4, 0, { css: "#3f9142", w: 0.36 });
    palletStack(g, 2.7, 0, 2.3, { ry: -0.4 });

    // ------------------------------------------------------------------ crew, boards
    const spotter = standingFigure(g, -2.4, -1.05, { ry: 0.9, cloth: 0x2b3138, vest: TW3_PAL.accent, helmet: 0xf2f2f2 });
    holoTag(spotter, "ground spotter", 0, 1.95, 0.15, { css: "#3f9142", w: 0.3 });
    const pickerRadio = group(g, -2.3, 0, -0.4, 0.3);
    box(pickerRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(pickerRadio, "picker radio", 0, 1.35, 0, { css: "#3f9142", w: 0.3 });
    reg(hits, pickerRadio, "picker-radio");

    const preopTag = group(g, -2.3, 0, 1.9, 0.3);
    box(preopTag, 0.12, 0.16, 0.02, 0, 1.0, 0, 0x1b232b, { rough: 0.6 });
    const preopTagFace = decal(preopTag, 0.1, 0.12, 0, 1.0, 0.011,
      signFace("PRE-USE\nTAG", { bg: "#11181f", accent: "#3f9142", scale: 0.4 }), { px: 256 });
    holoTag(preopTag, "pre-use tag", 0, 1.2, 0, { css: "#3f9142", w: 0.3 });
    reg(hits, preopTag, "preop-tag");

    const loadGaugeStand = instrument(g, 2.6, 0, 0.6, { ry: -0.5, idle: "-- rated", color: OP_ACCENT });
    holoTag(loadGaugeStand, "height / load gauge", 0, 0.16, 0, { css: "#3f9142", w: 0.42 });
    reg(hits, loadGaugeStand, "load-gauge");

    const loadMomentStand = instrument(g, 2.6, 0, 1.3, { ry: -0.5, idle: "-- moment", color: OP_ACCENT });
    holoTag(loadMomentStand, "load-moment gauge", 0, 0.16, 0, { css: "#3f9142", w: 0.4 });
    reg(hits, loadMomentStand, "load-moment-gauge");

    const closingLog = group(g, 2.7, 0, 2.2, 0.5);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("PICK LOG\nOPEN", { bg: "#11181f", accent: "#3f9142", scale: 0.3 }), { px: 320 });
    holoTag(closingLog, "pick log", 0, 1.32, 0, { css: "#3f9142", w: 0.28 });
    reg(hits, closingLog, "closing-log");

    // Aisle obstruction, staged hidden until the interrupt fires.
    const obstruction = standingFigure(g, 0.9, 1.3, { ry: -2.0, cloth: 0x37505f, vest: TW3_PAL.accent, helmet: 0xf2c14b });
    obstruction.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "platform-tilt-fault") { picker.userData.parts.platform.rotation.z = 0.06; }
        if (it.id === "aisle-obstruction-fault") { obstruction.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "platform-tilt-fault") { picker.userData.parts.platform.rotation.z = 0; }
        if (it.id === "aisle-obstruction-fault") { obstruction.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "preop-hazard-read") {
          gateWedge.visible = false;
          frayedLanyard.children[0].material = mat(0x59c97b, { rough: 0.7 });
          pinSocket.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "gate-close") { gate.rotation.x = -0.3; }
        if (step.id === "lanyard-anchor") { lanyardStaged.visible = false; }
        if (step.id === "closing-log") {
          repaint(closingLogFace, signFace("PICK LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (obstruction.visible) obstruction.userData.head.rotation.y = Math.sin(t * 0.7) * 0.3;
        if (session?.step?.id === "raise-hold" && session.holding) { beacon.rotation.y = t * 4; }
        void dt;
      },
    };
  },
};
