import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg, surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Crane Boom Hoist Brake Service VR — Maritime & Ports, the
// port maintenance pack.
//
// The machinery house of a ship-to-shore container crane, with the boom
// latched at stow: the boom hoist drum, its motor and gearbox, and the disc
// brake that holds the boom when nothing else does. The learner is the IUOE
// crane maintenance mechanic working with the ILWU maintenance and repair
// crew. A boom hoist brake is the one brake on the crane whose failure has
// nowhere to go but down, which is why the latch is proven before the drive
// is touched and why the gap is a measured number rather than a feel.

const PTB_ACCENT = 0xd9903a;

export const SIM_PT_CRANE_BOOM_HOIST_BRAKE_SERVICE = {
  id: "pt-crane-boom-hoist-brake-service",
  index: "218",
  domain: "Maritime & Ports",
  trade: "IUOE crane maintenance mechanic with the ILWU maintenance and repair crew, PMA training programme",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "wind",
  certification: "IUOE crane maintenance; ILWU maintenance and repair with the PMA training programme; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.147 control of hazardous energy; ASME B30.2 overhead and gantry cranes for the brake, drum and limit requirements; ASME B30.20 for the headblock and spreader below the hook",
  name: "Crane Boom Hoist Brake Service",
  title: simTitle("Crane Boom Hoist Brake Service"),
  tagline: "Machinery house, boom at stow: the latch proven before the drive is isolated and locked, the lining found glazed, the gap measured and set, a new lining fitted, the release pressure held under test while a storm cell and a gantrying neighbour both call for attention, the stroke watched through three cycles, and the brake logged back",
  accent: PTB_ACCENT,
  accentCss: "#d9903a",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "brake-set-true", name: "Brake Set True", note: "Latch proven, drive locked, the gap a measured number, the release pressure held, and both calls from outside the house answered" },

  supportLine: "your IUOE local's member assistance programme, with the ILWU-PMA benefit plan's counselling line for the M&R crew alongside you",

  game: system({
    name: "Machinery House",
    currency: "GAP",
    ranks: ["Oiler", "Crane Mechanic", "Brake Technician", "Lead Mechanic", "Boom Hoist Certified"],
    badges: [
      { id: "latch-first", name: "Latch First", note: "The boom latch proven before the hoist drive was isolated", test: AWARD.stepClean("isolate-drive") },
      { id: "gap-by-number", name: "Gap By Number", note: "The brake gap committed inside the band on the feeler gauge", test: AWARD.precise(0.7) },
      { id: "house-discipline", name: "House Discipline", note: "Never a hand in the drum, never a pin pulled under load, never a limit jumpered", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-service", name: "Clean Service", note: "No corrections anywhere in the brake service", test: AWARD.clean },
      { id: "held-the-pressure", name: "Held The Pressure", note: "Release pressure held in band for the whole test", test: AWARD.unbroken },
      { id: "house-turnaround", name: "House Turnaround", note: "Brake logged back inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unlocked-drum-reach": "You reached into the boom hoist drum with the drive still live. The drum turns on a signal from a cab three storeys below the house and it turns without warning — 29 CFR 1910.147 puts the isolator open and your lock on it before any part of you goes past the guard, because the drum does not know you are there.",
    "latch-pin-under-load": "You pulled the boom latch pin with the boom still hanging on the hoist ropes rather than resting on the latch. The pin is the only thing that holds the boom if the brake you are about to open lets go; pulled while the ropes carry the load, it leaves the whole boom on a brake with its calipers off. The latch is proven seated and carrying the boom before anything else in this house is touched.",
    "drum-guard-step": "You stepped over the drum guard to reach the far caliper. The guard is there because a rope drum under tension, even stationary, is a pinch point the length of the house — the far caliper is reached from the far side, around the guard, or not at all until the drive is locked and the ropes are proven slack on the latch.",
    "limit-jumper": "You jumpered the boom hoist upper limit switch to finish the test. That limit is the last thing between a boom being raised and a boom two-blocking into the apex; ASME B30.2 has it there precisely because an operator's attention is not a safety device, and a jumper left in after a test is how the next operator finds out.",
  },

  lateNotes: {
    "restore-switch": "The locks come off and the breaker closes only once the lining is fitted and the adjuster set — there is nothing to test yet.",
    "pressure-test-valve": "The release pressure test needs the drive restored for test and the brake fully assembled — not yet.",
    "brake-service-log": "The brake is logged back once the stroke has been watched through its cycles, not before the test is finished.",
  },

  steps: [
    {
      id: "house-permit", kind: "select", target: "out-of-service-board",
      title: "Confirm the crane is out of service and the boom is at stow",
      cue: "Check the terminal's out-of-service notice for this crane, the operator off the cab, and the boom raised to stow.",
      why: "A boom hoist brake is serviced with the boom where its weight is carried by something other than the brake, which means raised to stow with the latch engaged, and the crane out of service to the terminal so nobody dispatches it mid-job. 29 CFR 1917 puts the out-of-service marking on the crane itself and the notice with the terminal, because a crane that looks parked from the quay and a crane that is actually released to maintenance are two different machines to the operator walking toward it.",
    },
    {
      id: "isolate-drive", kind: "sequence",
      targets: ["boom-latch", "hoist-breaker", "breaker-hasp"],
      itemNames: { "boom-latch": "boom latch engaged and carrying", "hoist-breaker": "boom hoist drive breaker open", "breaker-hasp": "your lock on the hasp" },
      title: "Prove the latch is carrying, then isolate and lock the hoist drive",
      cue: "Prove the boom latch is seated and the ropes have gone slack onto it, then open the boom hoist breaker and hang your lock.",
      why: "The order is the whole safety case. The latch carrying the boom is what makes it safe to open a brake at all; the breaker open takes the drive out of the picture so the drum cannot turn while calipers are off; the lock keeps it that way against anyone in the electrical room below. 29 CFR 1910.147 wants isolate, lock and try — and in this house the try is the latch itself, because a breaker opened while the ropes still carry the boom is an isolation that has taken away the only thing that could lift the boom back onto the latch.",
      outOfOrderNote: "Latch first — prove the boom is resting on it — then the breaker, then your lock. Isolating a drive that is still holding the boom up is the wrong way round.",
    },
    {
      id: "try-start", kind: "hold", target: "maintenance-station", seconds: 4,
      title: "Try the boom hoist from the maintenance station",
      cue: "Hold the boom hoist control at the maintenance station and watch the drum: nothing moves, nothing hums, no fault code.",
      why: "The try is the only proof the isolation is real: the breaker that was opened is the one that feeds this drive and not the trolley's or the main hoist's, which sit in the same room and look the same from the front. Holding the control for the full try, rather than tapping it, is what gives a soft-start drive or a delayed contactor time to show itself, and the drum, not the panel light, is the thing being watched.",
      holdBreakNote: "Released before the try was complete — a drive with a soft start needs the full hold to prove it is dead. Try again.",
    },
    {
      id: "lining-inspect", kind: "find", noHint: true,
      targets: ["glazed-lining"],
      itemNames: { "glazed-lining": "glazed and oil-contaminated lining on the inboard caliper" },
      itemNotes: { "glazed-lining": "The inboard caliper's lining has glazed to a mirror and darkened at one edge where gearbox oil has been reaching it — it will hold a static boom and fade the moment it gets hot under a lowering." },
      title: "Inspect the brake disc and both linings",
      cue: "Look at the disc face for scoring and heat checking, and each lining for glazing, oil, cracks and thickness against the mark.",
      why: "A boom hoist brake is used hard and rarely: it holds the boom for hours and then has to arrest it over a few seconds, and a lining that has glazed or picked up oil will do the first and fail the second. ASME B30.2 makes the brake an inspection item with the crane's other holding parts because the fault shows as a shiny surface on a part that looks intact — and it is found by looking at the lining, not at whether the brake set last time.",
    },
    {
      id: "gap-measure", kind: "gauge", target: "feeler-gauge",
      title: "Measure the brake gap with the feeler gauge",
      cue: "Slide the feeler between lining and disc on the released brake and commit the reading inside the manufacturer's band.",
      why: "The gap between lining and disc on a released brake is what sets the stroke the thruster has to make to set it, and the stroke is what sets how fast the brake comes on when the drive drops out. Too tight and the lining drags and heats; too wide and the thruster runs out of travel before the brake is fully set, so a boom being lowered keeps lowering. The manufacturer states the gap as a number for that reason, and the feeler is how a mechanic gets that number rather than an impression of it.",
      gauge: { label: "BRAKE GAP", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${(t * 2.5).toFixed(2)} mm`, missNote: "Outside the band — the feeler has to sit flat between lining and disc across the full face, not on a high spot at the edge." },
    },
    {
      id: "set-adjuster", kind: "turn", target: "adjuster-nut",
      title: "Set the gap on the adjuster",
      cue: "Turn the adjuster in to bring the gap to the figure, then re-check with the feeler before locking it.",
      why: "The adjuster moves the caliper body toward the disc and every fraction of a turn is a change in the gap on both linings at once, so it is turned by a known amount and re-measured rather than turned until it feels right. Locking the adjuster afterwards matters as much as setting it: a boom hoist brake cycles thousands of times between services and an adjuster that walks under vibration takes the gap with it.",
      turn: { turns: 1.0, label: "ADJUSTER", readout: (t) => (t < 0.4 ? "gap wide" : t < 0.9 ? "closing" : "at figure") },
    },
    {
      id: "fit-lining", kind: "drag", target: "new-lining",
      title: "Fit the replacement lining to the inboard caliper",
      cue: "Carry the new lining from the bench and seat it in the inboard caliper carrier, backing plate to the carrier face.",
      why: "The lining seats against the carrier on its backing plate and locates on the carrier's pins, and a lining that is fitted a few degrees off will bed on one edge and glaze there within a week. It goes in with the disc face already checked and the oil source dealt with, because a new lining on an oily disc is the same fault a month later, and it goes in before the adjuster is finally set because the new thickness is what the gap is measured against.",
      drag: { to: "caliper-carrier", radius: 0.5, missNote: "Not seated — the lining has to sit flat on the carrier face with its pins located, or it will bed on one edge." },
    },
    {
      id: "thruster-check", kind: "select", target: "thruster-unit",
      title: "Check the thruster's fluid, seals and stroke rod",
      cue: "Check the thruster's fluid level, its seals for weeping and the stroke rod for scoring before it is asked to work again.",
      why: "The thruster is what releases the brake against its springs, and the springs are what set it: a thruster low on fluid or with a scored rod releases slowly or not fully, so the lining drags, and a seal that lets go under a lowering drops the release altogether and slams the brake on with the boom moving. The check is made here, before the test, because a thruster fault found during the release pressure test is a fault found with the brake half-released.",
    },
    {
      id: "restore-for-test", kind: "select", target: "restore-switch",
      title: "Clear the house, remove your lock and restore the drive for the test",
      cue: "Everyone clear of the drum, the guards back on, your lock off the hasp, the breaker closed — the drive is live for the test only.",
      why: "The tests that follow need the drive powered and the brake operating, and from this moment the drum can turn on a signal. 29 CFR 1910.147 has the head count and the guard check before the lock comes off for exactly the same reason it had the lock go on: the person most likely to be in the machine when it wakes is the mechanic who was inside it a minute ago, and a guard left off for the lining work is a drum with nothing between it and a sleeve.",
    },
    {
      id: "release-pressure", kind: "track", target: "pressure-test-valve", seconds: 6,
      title: "Hold the brake release pressure under test",
      cue: "Bring the thruster's release pressure up to the test figure and hold it there — watch for bleed-down and hold the needle steady.",
      why: "A hydraulic release held at the test figure for a full interval is what proves the thruster's seals, the lines and the release cylinder under the load they actually carry in service: a slow bleed-down here is a brake that will start to drag mid-shift, and a needle that will not settle is air in the release circuit that will make the brake grab. The pressure is held rather than peaked because the faults being looked for are the ones that take a few seconds to show.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.48, drift: 0.12, label: "RELEASE PRESSURE", readout: (v) => (v < 0.4 ? "bleeding down — seal?" : v > 0.6 ? "over test figure" : "holding at test") },
      holdBreakNote: "The pressure fell out of band — that is the bleed-down or the surge the test exists to find. Bring it back to the test figure and hold.",
    },
    {
      id: "stroke-cycles", kind: "hold", target: "stroke-indicator", seconds: 5,
      title: "Watch the set-and-release stroke through three cycles",
      cue: "Cycle the brake from the maintenance station and hold your watch on the stroke indicator: full set, full release, three times, no drag.",
      why: "The stroke indicator is the one place the whole brake shows itself at once: the gap that was set, the thruster that was checked and the lining that was fitted all come together in how far the actuator travels and how cleanly it returns. Three cycles rather than one is what catches a brake that sets on the first stroke and drags on the third as the thruster warms, and the watch is held for all three because the fault is in the pattern and not in any single stroke.",
      holdBreakNote: "The watch broke before the third cycle — a brake that drags on the third stroke is not found in the first two. Watch all three.",
    },
    {
      id: "brake-log", kind: "select", target: "brake-service-log",
      title: "Log the brake service and return the crane to the terminal",
      cue: "Record the gap as found and as set, the lining replaced, the release pressure held, and clear the out-of-service notice with the terminal.",
      why: "ASME B30.2 wants the brake's inspection and adjustment recorded so the next service is a comparison against a known figure rather than a fresh guess, and the terminal needs the out-of-service notice cleared by the person who did the work rather than inferred from a crane that looks ready. The gap as found is the number that says how fast the lining is wearing; the gap as set is the number the next mechanic measures against; the log is the only place either survives the shift.",
    },
    {
      id: "crew-checkin", kind: "select", target: "house-radio",
      title: "Check in with the operator and the M&R crew on the handback",
      cue: "Call the crane operator and the M&R lead: what was found, what was set, and how the crew is after a shift in the house with a storm cell through it.",
      why: "The operator taking the crane back is the person who will feel the brake first, and deserves to know the lining was glazed rather than to learn it from the way the boom now stops. The call is also the crew's own check-in — a shift in the machinery house with a lightning call on the radio and a neighbour gantrying toward you is a shift with a couple of moments in it, and the IUOE and ILWU practice is to say them out loud, and name the support that exists, before the climb down.",
    },
  ],

  interrupts: [
    {
      id: "storm-cell",
      kind: "Storm cell called on the terminal radio",
      after: "try-start", delay: 2, seconds: 14,
      alert: "The terminal radio calls a storm cell with lightning inside the terminal's radius — all cranes to storm stow, tie-downs proven, everyone off the boom.",
      cue: "Break off and prove the crane's storm pins are set at the sill before anything else in the house continues.",
      target: "storm-pins",
      why: "A container crane in a storm is a sail on rails, and the storm pins and tie-downs at the sill are the only thing that keeps it on them; 29 CFR 1917 has the terminal's storm procedure exist for exactly this call, and the mechanic in the house is the one person on the crane who can prove the pins are actually set rather than assumed set from the ground. Proving them is done the moment the call comes, because the gust front arrives before the rain does.",
      missNote: "The storm cell crossed the terminal with this crane's storm pins unproven and the house crew still working the try. The gust front hit a crane that was, as far as anyone had checked, held to its rails by its brakes alone.",
      wrongNote: "The storm pins at the sill — the call is about the crane staying on its rails, and the pins are the only thing in this house that answers it.",
    },
    {
      id: "neighbour-gantry",
      kind: "Neighbouring crane gantrying toward this one",
      after: "release-pressure", delay: 2, seconds: 12,
      alert: "The gantry travel alarm on the next crane has started — it is gantrying along the rail toward this one with nobody having called the house.",
      cue: "Set the gantry lockout flag at the rail now — this crane is not to be closed on while the house is manned.",
      target: "gantry-stop-flag",
      why: "Two cranes on one rail close on each other at the gantry drive's pace, and the buffers between them are for a crane that is empty and expected, not one with a mechanic in the house and a brake half-tested. The gantry lockout flag is the signal both operators are trained to stop on, and it is set by the person on the crane being closed on, because the operator moving toward you cannot see the house is manned and the radio may be busy with the storm.",
      missNote: "The neighbouring crane closed to its buffers against this one with the house manned and the release test running — the whole house took the buffer strike, and the mechanic on the caliper found out about the gantry from the floor.",
      wrongNote: "The gantry lockout flag at the rail — the crane moving toward you answers to the flag, and nothing else in the house reaches its operator in time.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PTB_ACCENT);

    // ------------------------------------------------------ house deck and walls
    const deck = box(g, 6.2, 0.1, 5.4, 0, 0.05, 0, 0xffffff, { rough: 0.6, metal: 0.3 });
    deck.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 8, px: 256 }),
      { rough: 0.55, metal: 0.4, color: 0xb6bcc2 },
    );
    box(g, 6.2, 2.6, 0.12, 0, 1.4, -2.7, 0x5b6771, { rough: 0.7, metal: 0.3, cast: false });
    box(g, 0.12, 2.6, 5.4, -3.1, 1.4, 0, 0x5b6771, { rough: 0.7, metal: 0.3, cast: false });
    for (let i = 0; i < 5; i++) box(g, 0.12, 2.6, 0.1, -3.1 + 1.55 * i, 1.4, -2.65, 0x3a4148, { rough: 0.6, metal: 0.5, cast: false });
    for (let i = 0; i < 4; i++) box(g, 0.14, 0.14, 5.4, -2.4 + i * 1.6, 2.75, 0, 0x3a4148, { rough: 0.6, metal: 0.5, cast: false });
    // Window on the back wall — darkens when the storm cell arrives.
    const window_ = box(g, 1.4, 0.7, 0.04, 1.4, 1.8, -2.62, 0x8fb8d0, { rough: 0.2, metal: 0.1, emissive: 0x8fb8d0, ei: 0.5, cast: false });
    // Door opening to the walkway on the east, and the neighbouring crane beyond it.
    box(g, 0.1, 2.4, 1.0, 3.0, 1.3, 1.8, 0x3a4148, { rough: 0.6, metal: 0.5, cast: false });
    box(g, 0.1, 2.4, 1.0, 3.0, 1.3, -1.6, 0x3a4148, { rough: 0.6, metal: 0.5, cast: false });
    const neighbour = group(g, 14, 0, 0.2);
    box(neighbour, 1.2, 9.0, 1.2, 0, 4.5, 0, 0xd8dde2, { rough: 0.6, metal: 0.3, cast: false, receive: false });
    box(neighbour, 1.2, 9.0, 1.2, 0, 4.5, -6.0, 0xd8dde2, { rough: 0.6, metal: 0.3, cast: false, receive: false });
    box(neighbour, 1.4, 1.2, 8.0, 0, 9.4, -3.0, 0xd2312b, { rough: 0.6, metal: 0.3, cast: false, receive: false });
    const gantryBeacon = ball(neighbour, 0.25, 0, 10.2, 0, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 10, cast: false });

    // ------------------------------------------------------ boom hoist drum
    const drumBase = group(g, -0.6, 0.1, -1.2);
    for (const sx of [-1.1, 1.1]) box(drumBase, 0.3, 0.7, 0.5, sx, 0.35, 0, 0x2f3a44, { rough: 0.55, metal: 0.5 });
    const drum = cyl(drumBase, 0.42, 0.42, 1.9, 0, 0.75, 0, 0x6b7680, { rough: 0.5, metal: 0.6, seg: 20 });
    drum.rotation.z = Math.PI / 2;
    for (let i = 0; i < 9; i++) torus(drumBase, 0.43, 0.012, -0.8 + i * 0.2, 0.75, 0, 0x3a4148, { rough: 0.5, metal: 0.7, seg: 6, seg2: 28 }).rotation.y = Math.PI / 2;
    // Guard rail across the drum front, and the hazard of stepping over it.
    for (const sx of [-1.0, 1.0]) cyl(drumBase, 0.02, 0.02, 1.1, sx, 0.55, 0.7, 0xf2c14b, { rough: 0.6, metal: 0.4, seg: 8 });
    box(drumBase, 2.1, 0.04, 0.04, 0, 1.08, 0.7, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    box(drumBase, 2.1, 0.04, 0.04, 0, 0.6, 0.7, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    const guardStep = box(drumBase, 0.6, 0.3, 0.1, 0.6, 1.1, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(drumBase, "step over the guard?", 0.6, 1.4, 0.7, { css: "#d2312b", w: 0.44 });
    reg(hits, guardStep, "drum-guard-step");
    const drumReach = box(drumBase, 0.5, 0.4, 0.3, -0.5, 0.75, 0.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(drumBase, "hand in the drum?", -0.5, 1.35, 0.5, { css: "#d2312b", w: 0.4 });
    reg(hits, drumReach, "unlocked-drum-reach");
    // Ropes off the drum to the wall (toward the boom).
    for (const sx of [-0.4, 0.4]) { const r = cyl(drumBase, 0.015, 0.015, 1.6, sx, 1.1, -0.8, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 }); r.rotation.x = Math.PI / 2; }

    // ------------------------------------------- motor, gearbox and the brake disc
    const drive = group(g, 1.6, 0.1, -1.2);
    const motor = cyl(drive, 0.32, 0.32, 0.9, 0.5, 0.65, 0, 0x2f6f4a, { rough: 0.5, metal: 0.5, seg: 18 });
    motor.rotation.z = Math.PI / 2;
    box(drive, 0.7, 0.7, 0.7, -0.4, 0.5, 0, 0x3a4148, { rough: 0.55, metal: 0.5 });
    for (let i = 0; i < 5; i++) box(drive, 0.95, 0.03, 0.62, 0.5, 0.36 + i * 0.13, 0, 0x2f6f4a, { rough: 0.5, metal: 0.5, cast: false });
    const disc = cyl(drive, 0.45, 0.45, 0.05, 1.05, 0.65, 0, 0x8a949d, { rough: 0.35, metal: 0.8, seg: 28 });
    disc.rotation.z = Math.PI / 2;
    // Two calipers: inboard (fault) at the top, outboard below.
    const calIn = group(drive, 1.05, 1.12, 0);
    box(calIn, 0.14, 0.2, 0.34, 0, 0, 0, 0xd2312b, { rough: 0.55, metal: 0.4 });
    const glazed = box(calIn, 0.03, 0.12, 0.26, -0.085, -0.1, 0, 0x5b4a3a, { rough: 0.15, metal: 0.4 });
    reg(hits, glazed, "glazed-lining");
    const carrierSocket = torus(calIn, 0.1, 0.008, -0.085, -0.1, 0, PTB_ACCENT, { emissive: PTB_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    carrierSocket.rotation.y = Math.PI / 2;
    reg(hits, carrierSocket, "caliper-carrier");
    const adjuster = group(calIn, 0, 0.16, 0);
    cyl(adjuster, 0.05, 0.05, 0.05, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 });
    box(adjuster, 0.12, 0.02, 0.02, 0, 0.03, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    holoTag(calIn, "adjuster — turn", 0, 0.34, 0, { css: "#d9903a", w: 0.3 });
    reg(hits, adjuster, "adjuster-nut");
    const calOut = group(drive, 1.05, 0.18, 0);
    box(calOut, 0.14, 0.2, 0.34, 0, 0, 0, 0xd2312b, { rough: 0.55, metal: 0.4 });
    box(calOut, 0.03, 0.12, 0.26, -0.085, 0.1, 0, 0x2b2f34, { rough: 0.8 });
    // Thruster on the caliper yoke.
    const thruster = group(drive, 1.35, 0.8, 0.3);
    cyl(thruster, 0.09, 0.09, 0.5, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 14 });
    cyl(thruster, 0.02, 0.02, 0.3, 0, 0.35, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    ball(thruster, 0.04, 0, -0.28, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 10 });
    holoTag(thruster, "thruster", 0, 0.62, 0, { css: "#d9903a", w: 0.22 });
    reg(hits, thruster, "thruster-unit");
    const strokeInd = group(drive, 1.35, 1.32, 0.3);
    box(strokeInd, 0.12, 0.2, 0.04, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    const strokeNeedle = box(strokeInd, 0.02, 0.14, 0.01, 0, 0, 0.025, 0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
    holoTag(drive, "stroke indicator — hold", 1.35, 1.6, 0.3, { css: "#d9903a", w: 0.46 });
    reg(hits, strokeInd, "stroke-indicator");
    // The upper limit switch with a jumper across it.
    const limit = group(drive, -0.4, 0.95, 0.36);
    box(limit, 0.12, 0.1, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const jumper = hose(limit, [[-0.05, -0.04, 0.03], [0, -0.1, 0.07], [0.05, -0.04, 0.03]], 0.008, 0xd2312b, { steps: 8, rough: 0.6 });
    holoTag(limit, "jumper the limit?", 0, -0.2, 0.03, { css: "#d2312b", w: 0.38 });
    reg(hits, jumper, "limit-jumper");

    // ------------------------------------------------------- boom latch model
    // The latch and its pin, on the wall where the boom's tie-back comes in.
    const latch = group(g, -2.2, 1.5, -2.55);
    box(latch, 0.5, 0.3, 0.12, 0, 0, 0, 0x3a4148, { rough: 0.55, metal: 0.5 });
    box(latch, 0.12, 0.5, 0.1, -0.15, 0.3, 0.02, 0xd2312b, { rough: 0.55, metal: 0.4 });
    const latchLamp = ball(latch, 0.03, 0.18, 0.1, 0.08, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 10 });
    holoTag(latch, "boom latch — prove", 0, -0.28, 0.08, { css: "#d9903a", w: 0.38 });
    reg(hits, latch, "boom-latch");
    const latchPin = cyl(latch, 0.03, 0.03, 0.3, -0.15, 0.1, 0.1, 0xe8b02e, { rough: 0.4, metal: 0.7, seg: 8 });
    latchPin.rotation.x = Math.PI / 2;
    holoTag(latch, "pull the latch pin?", -0.15, 0.7, 0.1, { css: "#d2312b", w: 0.42 });
    reg(hits, latchPin, "latch-pin-under-load");

    // ------------------------------------------------------ breaker and locks
    const cab = group(g, -2.5, 0.1, 0.4);
    box(cab, 0.6, 1.3, 0.36, 0, 0.65, 0, 0xd7dde2, { rough: 0.5, metal: 0.3 });
    box(cab, 0.5, 0.05, 0.3, 0, 1.32, 0, 0xb8402f, { rough: 0.5 });
    const breaker = box(cab, 0.14, 0.16, 0.06, 0, 1.0, 0.2, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const breakerHandle = box(cab, 0.04, 0.2, 0.04, 0, 1.0, 0.24, 0xd2312b, { rough: 0.5 });
    holoTag(cab, "boom hoist breaker", 0, 1.22, 0.22, { css: "#d9903a", w: 0.4 });
    reg(hits, breaker, "hoist-breaker");
    const hasp = group(cab, 0, 0.72, 0.2);
    box(hasp, 0.1, 0.04, 0.03, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.8 });
    const lock = lockTag(hasp, 0, -0.05, 0.02, { lines: ["CRANE M&R", "DO NOT CLOSE"] });
    lock.visible = false;
    holoTag(cab, "hasp — your lock", 0, 0.56, 0.22, { css: "#d9903a", w: 0.32 });
    reg(hits, hasp, "breaker-hasp");
    const restore = cyl(cab, 0.03, 0.03, 0.02, 0.2, 0.86, 0.19, 0x59c97b, { rough: 0.4, seg: 12 });
    restore.rotation.x = Math.PI / 2;
    holoTag(cab, "restore for test", 0.2, 0.44, 0.2, { css: "#d9903a", w: 0.34 });
    reg(hits, restore, "restore-switch");

    // ------------------------------------------------- maintenance station
    const mstation = group(g, 0.4, 0.1, 1.3, 0.2);
    cyl(mstation, 0.04, 0.05, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 10 });
    const mbox = box(mstation, 0.4, 0.26, 0.2, 0, 1.1, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 3; i++) cyl(mstation, 0.025, 0.025, 0.02, -0.12 + i * 0.12, 1.14, 0.11, [0x59c97b, 0xd2312b, 0xe8b02e][i], { rough: 0.4, seg: 10 }).rotation.x = Math.PI / 2;
    const mScreen = instrument(mstation, 0, 1.25, -0.02, { idle: "BOOM HOIST · OFF", color: 0xd9903a, w: 0.14, d: 0.1 });
    holoTag(mstation, "maintenance station — hold", 0, 1.5, 0, { css: "#d9903a", w: 0.5 });
    reg(hits, mbox, "maintenance-station");
    const valve = group(mstation, 0.35, 0.95, 0);
    cyl(valve, 0.03, 0.03, 0.12, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.6, seg: 10 });
    const valveHandle = box(valve, 0.14, 0.02, 0.03, 0, 0.07, 0, 0xd2312b, { rough: 0.5 });
    holoTag(mstation, "release test — hold", 0.35, 0.78, 0, { css: "#d9903a", w: 0.38 });
    reg(hits, valve, "pressure-test-valve");
    const pressureGauge = instrument(mstation, 0.35, 1.2, 0, { idle: "-- bar", color: 0xd9903a, w: 0.1, d: 0.1 });
    void valveHandle;

    // ------------------------------------------------- bench, tools and lining
    const chest = toolChest(g, 2.1, 1.7, { ry: -0.6, color: 0x2f4f6f });
    const feeler = instrument(chest, -0.1, 0.79, 0.02, { ry: 0.2, idle: "-- mm", color: 0xd9903a, w: 0.1, d: 0.16 });
    holoTag(feeler, "feeler gauge", 0, 0.15, 0, { css: "#d9903a", w: 0.28 });
    reg(hits, feeler, "feeler-gauge");
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 2 · HOUSE", color: 0xd9903a, w: 0.1, d: 0.16 });
    holoTag(radio, "house radio", 0, 0.15, 0, { css: "#d9903a", w: 0.28 });
    reg(hits, radio, "house-radio");
    const lining = group(chest, 0.02, 0.8, -0.14);
    box(lining, 0.26, 0.03, 0.12, 0, 0, 0, 0x2b2f34, { rough: 0.85 });
    box(lining, 0.26, 0.01, 0.12, 0, 0.02, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    holoTag(chest, "new lining", 0.02, 1.05, -0.14, { css: "#d9903a", w: 0.26 });
    reg(hits, lining, "new-lining");

    // --------------------------------------------- storm pins and gantry flag
    const sill = group(g, 2.4, 0.1, -0.3);
    box(sill, 0.5, 0.2, 0.5, 0, 0.1, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    const pinA = cyl(sill, 0.04, 0.04, 0.5, -0.12, 0.55, 0, 0xe8b02e, { rough: 0.4, metal: 0.7, seg: 10 });
    const pinB = cyl(sill, 0.04, 0.04, 0.5, 0.12, 0.55, 0, 0xe8b02e, { rough: 0.4, metal: 0.7, seg: 10 });
    const pinLamp = ball(sill, 0.03, 0, 0.3, 0.27, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 10 });
    holoTag(sill, "storm pins", 0, 0.95, 0, { css: "#d9903a", w: 0.26 });
    reg(hits, sill, "storm-pins");
    const flagPost = group(g, 2.7, 0.1, -2.0);
    cyl(flagPost, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const flag = box(flagPost, 0.3, 0.2, 0.02, 0.17, 1.3, 0, 0xf2c14b, { rough: 0.7 });
    holoTag(flagPost, "gantry lockout flag", 0, 1.62, 0, { css: "#d9903a", w: 0.4 });
    reg(hits, flagPost, "gantry-stop-flag");

    // ------------------------------------------------------------ paperwork
    const board = holoPanel(g, 0.95, 0.62, -1.4, 1.5, 1.9, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d9903a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbe6c8"; cx.fillText("OUT OF SERVICE — CRANE 4 · BOOM AT STOW", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Released to M&R: boom hoist brake, inboard caliper", "Operator off cab · boom latched at stow", "Latch proven carrying before the drive is isolated",
       "Gap: measured, set, re-measured — figure on sheet", "Release pressure held at test figure", "Storm procedure: pins proven on the call"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: 2.6, accent: PTB_ACCENT });
    reg(hits, board, "out-of-service-board");
    const logBoard = holoPanel(g, 0.6, 0.42, 1.2, 1.3, 2.2, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d9903a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbe6c8"; cx.fillText("BRAKE SERVICE LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Gap as found: —", "Lining: —", "Release test: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 3.0, accent: PTB_ACCENT });
    reg(hits, logBoard, "brake-service-log");

    // ---------------------------------------------------------------- crew
    const mechanic = standingFigure(g, -1.5, 1.0, { ry: 2.4, cloth: 0x1f3a52, vest: 0xf2c14b, helmet: 0xe8b02e, gloves: true });
    holoTag(mechanic, "crane mechanic", 0, 1.9, 0, { css: "#d9903a", w: 0.32 });
    const electrician = standingFigure(g, 2.5, 0.9, { ry: -2.2, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    holoTag(electrician, "M&R electrician", 0, 1.9, 0, { css: "#d9903a", w: 0.34 });
    cone(g, -0.3, 2.4); cone(g, 1.8, 2.4);
    barrierPanel(g, 0.7, 2.5, { color: 0xf2c14b, ry: 0 });

    const okMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
    const alarmMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
    const windowClear = window_.material;
    const windowStorm = mat(0x2a3540, { rough: 0.3, metal: 0.1, emissive: 0x1a2230, ei: 0.4 });
    const flagUpMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.6 });
    const neighbourHome = neighbour.position.clone();

    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 0.9, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "isolate-drive") { latchLamp.material = okMat; breakerHandle.rotation.z = Math.PI / 2; lock.visible = true; }
        if (step.id === "try-start") repaint(mScreen.userData.screen, signFace("DEAD · NO MOVE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "lining-inspect") glazed.material = mat(0x3a2a1a, { rough: 0.15, metal: 0.4 });
        if (step.id === "fit-lining") { lining.visible = false; glazed.material = mat(0x2b2f34, { rough: 0.85 }); }
        if (step.id === "restore-for-test") { breakerHandle.rotation.z = 0; lock.visible = false; repaint(mScreen.userData.screen, signFace("BOOM HOIST · TEST", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.5 })); }
        if (step.id === "release-pressure") repaint(pressureGauge.userData.screen, signFace("HELD", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "brake-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbe6c8"; cx.fillText("BRAKE SERVICE LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Gap: as found / as set recorded", "Lining: inboard replaced, oil source noted", "Release test: held · crane returned"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("HANDED BACK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      // The storm really darkens the house; the neighbour really closes in.
      onInterrupt(it) {
        if (it.id === "storm-cell") { window_.material = windowStorm; pinLamp.material = alarmMat; pinA.position.y = 0.75; pinB.position.y = 0.75; }
        if (it.id === "neighbour-gantry") { neighbour.position.x = 7.5; gantryBeacon.material = alarmMat; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "storm-cell") { pinA.position.y = 0.45; pinB.position.y = 0.45; pinLamp.material = okMat; }
        if (it.id === "neighbour-gantry") { neighbour.position.copy(neighbourHome); gantryBeacon.material = mat(0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6 }); flag.material = flagUpMat; flag.position.y = 1.5; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "set-adjuster") adjuster.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "gap-measure") repaint(feeler.userData.screen, signFace(`${(gg.t * 2.5).toFixed(2)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "release-pressure" && session.holding) {
          const v = session.track.v;
          repaint(pressureGauge.userData.screen, signFace(`${Math.round(v * 120)} bar`, { bg: "#0d1c24", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (step?.id === "stroke-cycles" && session.holding) {
          const frac = session.holdFor / (step.seconds ?? 5);
          strokeNeedle.position.y = -0.06 + Math.abs(Math.sin(frac * Math.PI * 3)) * 0.12;
        }
        if (window_.material === windowStorm) window_.material.emissiveIntensity = 0.3 + Math.max(0, Math.sin(t * 7)) * 0.9;
        void windowClear; void dt; void CITY;
      },
    };
  },
};
