import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, asphaltFace, concreteFace, safetyStripeFace, palette,
} from "../citykit.js";
import { fireHydrant } from "../../../shared/props.js";
import { sedan } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hydrant Flow Test & Flushing With Traffic Control VR — Water &
// Environmental, UWUA water distribution crew.
//
// A flow test asks the main a question a valve position never answers on its
// own: how much water can this section actually deliver, and at what
// pressure, when it is really moving. That question is answered by cracking
// one hydrant open slowly enough that the main is never shocked, reading a
// pitot gauge in the stream itself, and watching a second hydrant's residual
// pressure the whole time the first one flows — because a residual reading
// taken once, at the start, tells a crew nothing about what happens to this
// block's pressure once the flow is sustained. None of it happens in the
// open street without cones and a sign ahead of the taper first, and none of
// the discharge goes to a storm drain without the utility's own
// dechlorination step, because a hydrant full of finished drinking water is
// still a few hundred gallons a minute the receiving water never asked for.
// Sited generically: no real street, main size or flow number is invented.

const UT2_ACCENT = 0x2f9ed1;
const UT2_CSS = "#2f9ed1";
const UT2_PAL = palette("utility");

export const SIM_UT_HYDRANT_FLOW_TEST_AND_FLUSHING_WITH_TRAFFIC_CONTROL = {
  id: "ut-hydrant-flow-test-and-flushing-with-traffic-control",
  index: "ut-02",
  domain: "Water",
  trade: "UWUA water distribution crew — hydrant flow testing and flushing",
  category: "Water & Environmental",
  weather: "overcast",
  certification: "UWUA water distribution operator training; state water distribution operator certification for the flow test itself; AWWA C651 disinfecting water mains for the flushing residual and the section it clears; the state Manual on Uniform Traffic Control Devices (MUTCD) for the work-zone traffic control plan; ANSI Z535.4 for the warning signage on the taper",
  name: "Hydrant Flow Test & Flushing With Traffic Control",
  title: simTitle("Hydrant Flow Test & Flushing"),
  tagline: "One hydrant cracked open slowly and read on a pitot gauge, a second hydrant's residual watched the whole time it flows, and none of it done in the open street before the cones and the sign are ahead of the taper",
  accent: UT2_ACCENT,
  accentCss: UT2_CSS,
  parSeconds: 290,
  footprint: 2.5,
  badge: { id: "flow-proven", name: "Flow Proven", note: "A flow test read on the pitot gauge with the residual watched steady, the discharge dechlorinated, and every hydrant capped and chained before the crew left the block" },

  game: system({
    name: "Distribution Authority",
    currency: "GPM",
    ranks: ["Apprentice", "Service Crew", "Distribution Operator", "Crew Lead", "Distribution Authority Certified"],
    badges: [
      { id: "critical-users-checked", name: "Critical Users Checked", note: "The block was checked for critical water users before the hydrant opened", test: AWARD.stepClean("critical-user-check") },
      { id: "cracked-not-slammed", name: "Cracked, Not Slammed", note: "The flow hydrant was cracked open rather than opened full without an unsafe action", test: AWARD.safe },
      { id: "steady-residual", name: "Steady Residual", note: "Held the residual watch inside the band for the whole test", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-test", name: "Clean Test", note: "No corrections anywhere in the test", test: AWARD.clean },
      { id: "unbroken-watch", name: "Unbroken Watch", note: "The residual watch ran to completion without a break", test: AWARD.unbroken },
      { id: "block-clear-fast", name: "Block Clear Fast", note: "Capped, chained and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-critical-check": "You went to open the flow hydrant without checking this block for a critical water user first. A flow test can pull this section's pressure down hard enough to matter to a dialysis clinic or a commercial laundry running mid-cycle, and the only way to know one is on this block is to check before the water starts moving, not after somebody calls in.",
    "no-traffic-control-hydrant": "You went to open the hydrant into the street before the cones and the sign were set ahead of the taper. A flowing hydrant throws a spray and a hose across part of the lane, and a driver who has not been warned has no reason to expect either one before they are already on top of it.",
    "full-open-without-crack": "You went to open the flow hydrant straight to full instead of cracking it first. A gate valve slammed open lets a full column of standing water go from still to moving all at once, and the surge that creates travels back up the main looking for the next weak joint — which is exactly the failure this crew is not out here to cause today.",
    "skip-dechlorination-check": "You went to let the discharge run to the storm drain without checking it against the utility's own dechlorination step first. This is finished drinking water at full chlorine residual until it is treated down, and a few hundred gallons a minute of it reaching a storm drain untreated is a receiving-water problem the utility's own procedure exists to prevent.",
  },

  lateNotes: {
    "flow-hydrant-nut": "The flow hydrant cracks open only after the diffuser is on the outlet and the residual hydrant's static reading has been taken — not before either of those.",
    "pitot-gauge": "The pitot reading is taken once the flow has settled at the cracked-open rate, not in the first surge as the hydrant first opens.",
  },

  // Two things that happen to a crew whose hands are on a diffuser or
  // watching a residual gauge. See shared/game.js.
  interrupts: [
    {
      id: "low-pressure-complaint-call",
      kind: "Dispatch relays a low-pressure complaint",
      after: "residual-watch", delay: 3, seconds: 13,
      alert: "Dispatch is relaying a low-pressure complaint from an address on this exact block, called in right as the flow test is running.",
      cue: "Acknowledge the call and confirm it is this test before the residual watch continues.",
      target: "test-radio",
      why: "A low-pressure complaint that lands during a scheduled flow test is very likely this test and not a separate problem, but the only way to close that call out correctly — rather than leaving a resident thinking their water pressure failed on its own — is to acknowledge it and tie it to the test that is actually running right now.",
      missNote: "The complaint call went unanswered while the residual watch continued. Whoever called in still thinks their water pressure failed on its own, with no idea a scheduled test caused it.",
      wrongNote: "It is the radio call. Nothing about the residual gauge itself has changed — this is about closing the loop with the address that called in.",
    },
    {
      id: "car-approaches-taper",
      kind: "A car drives up on the taper",
      after: "hold-diffuser", delay: 3, seconds: 11,
      alert: "A car has come around the corner too fast for the cone taper and is closing on it without slowing down.",
      cue: "Wave it off with the paddle before it reaches the taper.",
      target: "stop-paddle",
      why: "A cone taper only works on a driver who sees it in time to react, and a car already closing fast needs a person with a stop paddle to be the thing that actually gets their attention — the diffuser in your hands is not what stops a car that missed the sign.",
      missNote: "The car kept closing on the taper with nobody out front to wave it off. Cones alone do not stop a vehicle that is already past the point of reacting to them.",
      wrongNote: "It is the paddle, out where the driver can see it. The diffuser has nothing to do with a car that missed the sign.",
    },
  ],

  supportLine: "your utility's employee assistance programme, or your UWUA steward if you are not sure how to reach it",

  steps: [
    {
      id: "test-plan", kind: "select", target: "test-plan",
      title: "Read the flow test plan",
      cue: "Check the test plan: which hydrant flows, which one reads residual, and the target flow for this section.",
      why: "The plan names which hydrant is flowed and which one is only watched, because reading residual on the wrong hydrant reports a number for a section of main this test never actually stressed — the two roles are fixed before either cap comes off.",
    },
    {
      id: "traffic-control", kind: "sequence",
      targets: ["set-cone-a", "set-cone-b", "set-warning-sign"],
      itemNames: { "set-cone-a": "first cone of the taper", "set-cone-b": "second cone of the taper", "set-warning-sign": "advance warning sign" },
      title: "Set the taper and the warning sign",
      cue: "Place both cones of the taper, then set the advance warning sign ahead of them, per the traffic control plan.",
      why: "The warning sign is what gives a driver time to see the taper coming rather than finding it at the last cone, and the plan sets it ahead of the taper for exactly that reason — a taper with no advance warning is a surprise, not a work zone.",
      outOfOrderNote: "Both cones first, then the sign ahead of them — a sign with no taper behind it yet warns drivers about a work zone that is not actually there.",
    },
    {
      id: "critical-user-check", kind: "find", noHint: true,
      targets: ["hospital-pin", "laundry-pin"],
      itemNames: { "hospital-pin": "the dialysis clinic marked on the block map", "laundry-pin": "the commercial laundry marked on the block map" },
      itemNotes: {
        "hospital-pin": "A dialysis clinic is marked on this block. A flow test that drops this section's pressure mid-cycle is exactly the kind of thing that gets called ahead of time, not discovered afterward.",
        "laundry-pin": "A commercial laundry is marked here too — a heavy, steady water user whose own equipment can read a pressure drop as a fault before anyone connects it to the test outside.",
      },
      title: "Check the block map for critical users",
      cue: "Find the critical water users marked on this block's map before the hydrant opens.",
      why: "A flow test pulls this section's pressure down on purpose, and the only way that does not turn into an unplanned outage complaint for somebody who genuinely needed the pressure is to know who is on this block before the water starts moving, not after a call comes in.",
    },
    {
      id: "inspect-hydrant", kind: "find",
      targets: ["damaged-outlet-thread", "blocked-hydrant-access"],
      itemNames: { "damaged-outlet-thread": "damaged threads on the flow outlet", "blocked-hydrant-access": "a parked car blocking hydrant access" },
      itemNotes: {
        "damaged-outlet-thread": "The outlet threads on this hydrant are damaged enough that the diffuser will not seat square — flowed like this, the stream goes where the bad seat points it, not where the diffuser is aimed.",
        "blocked-hydrant-access": "A car is parked close enough to this hydrant that swinging the diffuser into place fouls the bumper — it has to be dealt with before the diffuser goes on, not worked around with it half on.",
      },
      title: "Inspect the flow hydrant before rigging it",
      cue: "Walk the flow hydrant and find what has to be fixed before the diffuser goes on.",
      why: "A hydrant that looks fine from the sidewalk can have damaged outlet threads or no real clearance to work in, and both change what happens the moment water actually starts moving through it — caught now, before the diffuser is fought into place around either problem.",
    },
    {
      id: "attach-diffuser", kind: "drag", target: "diffuser",
      title: "Attach the diffuser to the flow outlet",
      cue: "Bring the diffuser to the flow hydrant's outlet and seat it square.",
      why: "The diffuser is what turns a raw stream into a controlled spray aimed away from the taper and the traffic beyond it — seated square on the outlet, not just resting against it, because a diffuser that is not fully seated is thrown off the outlet the moment real flow hits it.",
      drag: { to: "flow-outlet", radius: 0.42, missNote: "Not seated on the outlet — a diffuser resting against the threads instead of screwed home comes off the moment the hydrant is cracked." },
    },
    {
      id: "static-pressure", kind: "gauge", target: "residual-gauge",
      title: "Read the static pressure before flow starts",
      cue: "Bring the residual hydrant's static reading up to the plan's baseline, then commit.",
      why: "The static reading, taken before the flow hydrant moves at all, is the number every residual reading during the test is compared against — a test with no honest baseline cannot say how far this section's pressure actually dropped under real flow.",
      gauge: { label: "STATIC PRESSURE", speed: 0.7, green: [0.55, 0.72], readout: (t) => `${Math.round(t * 90)} psi`, missNote: "That is not a believable static reading for this section — read it again before the flow hydrant moves." },
    },
    {
      id: "crack-open-valve", kind: "turn", target: "flow-hydrant-nut",
      title: "Crack the flow hydrant open",
      cue: "Turn the operating nut slowly to crack the hydrant open — not straight to full.",
      why: "Cracked open, the standing water in this section starts moving gradually instead of all at once — a hydrant opened straight to full sends a surge back up the main looking for the next joint that cannot take it, on a system this crew still has to trust after the test is over.",
      turn: { turns: 0.4, axis: "y", label: "FLOW HYDRANT NUT" },
    },
    {
      id: "hold-diffuser", kind: "hold", target: "diffuser", seconds: 5,
      title: "Hold the diffuser on target through the surge",
      cue: "Hold the diffuser aimed clear of the taper and the traffic beyond it while the flow settles.",
      why: "The first few seconds of flow are the least predictable part of this test — held steady and aimed away from the taper, the diffuser keeps that spray off the traffic lane while the stream finds its settled rate instead of kicking loose the moment it is left to itself.",
      holdBreakNote: "The diffuser came off target during the surge — hold it again, a stream that swings loose here reaches the taper and whatever is past it.",
    },
    {
      id: "pitot-reading", kind: "gauge", target: "pitot-gauge",
      title: "Read the pitot gauge in the stream",
      cue: "Hold the pitot tip in the settled stream and bring the reading to where the plan expects, then commit.",
      why: "The pitot gauge, held in the stream itself, is the only instrument on this job that reads what the main is actually delivering right now — a flow number taken from a table instead of the pitot is a guess dressed up as a measurement.",
      gauge: { label: "PITOT — VELOCITY PRESSURE", speed: 0.65, green: [0.5, 0.7], readout: (t) => `${(t * 60).toFixed(1)} psi`, missNote: "That reading is outside what the plan expects for this outlet — reseat the pitot tip in the centre of the stream and read it again." },
    },
    {
      id: "residual-watch", kind: "track", target: "residual-gauge", seconds: 7,
      title: "Hold the residual watch",
      cue: "Watch the residual hydrant's pressure hold in the band for the whole test window, not just at the start.",
      why: "A residual reading taken once, at the moment flow begins, says nothing about what happens to this block's pressure once the flow is sustained — held for a full watch, a residual that keeps dropping is this section telling the crew it cannot actually deliver at the rate the flow hydrant is asking for.",
      track: { start: 0.6, green: [0.42, 0.6], rise: 0.04, fall: 0.32, drift: 0.12, label: "RESIDUAL PRESSURE", readout: (v) => (v < 0.42 ? "dropping — section under-delivering" : v > 0.6 ? "barely loaded" : "holding in band") },
      holdBreakNote: "That residual dropped out of band during the watch — this section is not delivering what the flow hydrant is asking of it, and that is the actual result of this test.",
    },
    {
      id: "dechlorination-check", kind: "select", target: "chlorine-meter",
      title: "Check the discharge before it reaches the storm drain",
      cue: "Read the dechlorination meter on the discharge per the utility's own procedure before the flow keeps running to the drain.",
      why: "This is finished drinking water at full chlorine residual leaving the hydrant, and the utility's own dechlorination step is what keeps a flow test from becoming an untreated discharge to the storm system — checked here, while the flow is still running and can still be corrected.",
    },
    {
      id: "close-flow-hydrant", kind: "turn", target: "flow-hydrant-nut",
      title: "Close the flow hydrant slowly",
      cue: "Wind the operating nut shut the same way it opened — slowly, not slammed.",
      why: "Closed the same way it opened, the column of moving water in this section slows gradually instead of stopping dead against a shut gate — a hydrant slammed shut on a full flow is water hammer from the other direction, and the main does not care which direction put it there.",
      turn: { turns: 0.4, axis: "y", reverse: true, label: "FLOW HYDRANT NUT" },
    },
    {
      id: "drain-and-cap", kind: "sequence",
      targets: ["drain-barrel", "cap-threads", "chain-cap"],
      itemNames: { "drain-barrel": "barrel drained", "cap-threads": "outlet threads greased", "chain-cap": "cap chained" },
      title: "Drain, cap and chain both hydrants",
      cue: "Drain the barrel, grease the outlet threads, then chain the cap back on.",
      why: "Standing water left in a drained hydrant's barrel freezes and cracks the shell in the first hard freeze this block sees, and a cap that is not chained is a cap that walks off this hydrant before the next crew that actually needs it ever gets here.",
      outOfOrderNote: "Drain first, then grease the threads, then chain the cap — greasing threads that are still wet from the barrel does nothing for the next crew that has to break them loose.",
    },
    {
      id: "test-log", kind: "select", target: "test-log",
      title: "Complete the flow test log",
      cue: "Fill in the test log: static and residual readings, the pitot reading, and the available flow per the utility's own worksheet.",
      why: "The number this block actually delivers at a usable residual is what a fire pre-plan or a developer's water study depends on later, and a test with no written record is a number nobody can ever go back and check — the log is what turns this test into something the utility can actually use.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, UT2_ACCENT);

    // ---------------------------------------------------------------- ground
    const streetTex = surfaceTexture((ctx, w, h) => asphaltFace(ctx, w, h, { base: "#2c2e30", base2: "#26282a", lanes: 2 }), { repeat: 3, px: 384 });
    const street = box(g, 6.0, 0.06, 4.4, 0, 0.03, 0.4, 0xffffff, { rough: 0.95 });
    street.material = texturedMat(streetTex, { rough: 0.95, metal: 0.02, color: UT2_PAL.ground });
    const walkTex = surfaceTexture((ctx, w, h) => concreteFace(ctx, w, h, { tone: "#8b8d89", finish: "broom" }), { repeat: 4, px: 320 });
    const walkA = box(g, 1.2, 0.08, 4.4, -2.7, 0.04, 0.4, 0xffffff, { rough: 0.9 });
    walkA.material = texturedMat(walkTex, { rough: 0.9, metal: 0.02 });
    const walkB = box(g, 1.2, 0.08, 4.4, 2.7, 0.04, 0.4, 0xffffff, { rough: 0.9 });
    walkB.material = texturedMat(walkTex, { rough: 0.9, metal: 0.02 });

    // -------------------------------------------------------------- hydrants
    const flowRig = fireHydrant(g, -1.6, 0, 1.3, { color: 0xc8201c, ry: 0.4 });
    holoTag(g, "flow hydrant", -1.6, 0.95, 1.3, { css: UT2_CSS, w: 0.32 });
    const flowNut = valveWheel(flowRig, 0, 0.62, 0.16, { color: 0xd8232a, body: 0x2b2f34, r: 0.06 });
    reg(hits, flowNut.userData.wheel, "flow-hydrant-nut");
    const flowOutlet = group(flowRig, 0.16, 0.42, 0, Math.PI / 2);
    hits["flow-outlet"] = flowOutlet;
    const damagedThread = cyl(flowRig, 0.052, 0.052, 0.03, -0.16, 0.42, 0, 0x8a3020, { rough: 0.8, metal: 0.5, seg: 12 });
    reg(hits, damagedThread, "damaged-outlet-thread");

    const residualRig = fireHydrant(g, 1.7, 0, -1.4, { color: 0xc8201c, ry: -0.5 });
    holoTag(g, "residual hydrant", 1.7, 0.95, -1.4, { css: UT2_CSS, w: 0.36 });
    const residualGauge = instrument(residualRig, 0.2, 0.75, 0, { idle: "-- psi", color: 0x2b2f34, w: 0.15, d: 0.13 });
    holoTag(residualRig, "residual gauge", 0.2, 0.98, 0, { css: UT2_CSS, w: 0.32 });
    reg(hits, residualGauge, "residual-gauge");

    // Parked car crowding hydrant access, and the taper's oncoming car.
    const parkedCar = sedan(g, -0.05, 0, 2.35, { ry: 0.2, livery: { colour: 0x8f2d2d } });
    reg(hits, parkedCar, "blocked-hydrant-access");
    const approachingCar = sedan(g, 5.4, 0, 3.0, { ry: -Math.PI / 2, livery: { colour: 0xc9a227 } });

    // ----------------------------------------------------------- diffuser
    const diffuser = group(g, -2.4, 0, 0.6, 0.4);
    cyl(diffuser, 0.09, 0.09, 0.14, 0, 0.42, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 14 });
    cyl(diffuser, 0.03, 0.14, 0.22, 0, 0.55, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 14 });
    holoTag(diffuser, "diffuser", 0, 0.78, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, diffuser, "diffuser");

    // ------------------------------------------------------- pitot & meters
    const pitotPost = group(g, -1.0, 0, 1.9, -0.3);
    box(pitotPost, 0.04, 0.5, 0.04, 0, 0.25, 0, CITY.darkSteel, { rough: 0.6, metal: 0.4 });
    const pitotGauge = instrument(pitotPost, 0, 0.56, 0, { idle: "-- psi", color: 0x2b2f34, w: 0.15, d: 0.13 });
    holoTag(pitotPost, "pitot gauge", 0, 0.78, 0, { css: UT2_CSS, w: 0.3 });
    reg(hits, pitotGauge, "pitot-gauge");

    const chlorMeter = group(g, 0.1, 0, 2.3, 0.2);
    box(chlorMeter, 0.16, 0.24, 0.06, 0, 0.5, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    decal(chlorMeter, 0.13, 0.09, 0, 0.55, 0.031, signFace("Cl2", { bg: "#0a1e28", accent: "#f2c14b", scale: 0.55 }));
    holoTag(chlorMeter, "dechlorination meter", 0, 0.7, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, chlorMeter, "chlorine-meter");
    const skipDechlor = box(g, 0.2, 0.2, 0.2, 0.5, 0.5, 2.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let it run to the drain?", 0.55, 0.75, 2.7, { css: "#d2312b", w: 0.5 });
    reg(hits, skipDechlor, "skip-dechlorination-check");

    // ------------------------------------------------------------ test plan
    const planBoard = group(g, -2.5, 0, -1.2, 0.4);
    box(planBoard, 0.5, 0.7, 0.04, 0, 0.35, 0, UT2_PAL.structure, { rough: 0.7 });
    const planPanel = decal(planBoard, 0.44, 0.32, 0, 0.68, 0.03, paperFace("FLOW TEST PLAN", ["Flow hydrant / residual hydrant", "Target flow per plan", "Static baseline first"], { scale: 0.78 }));
    holoTag(planBoard, "flow test plan", 0, 0.9, 0, { css: UT2_CSS, w: 0.4 });
    reg(hits, planPanel, "test-plan");

    // Block map with critical-user pins.
    const mapBoard = group(g, -2.5, 0, -0.1, 0.2);
    box(mapBoard, 0.5, 0.4, 0.03, 0, 0.5, 0, 0x2b3138, { rough: 0.7 });
    decal(mapBoard, 0.44, 0.34, 0, 0.5, 0.02, signFace("BLOCK MAP", { bg: "#0a1e28", accent: UT2_CSS, scale: 0.4 }));
    const hospitalPin = ball(mapBoard, 0.02, -0.12, 0.42, 0.02, 0xd2312b, { rough: 0.4, seg: 10, seg2: 8 });
    reg(hits, hospitalPin, "hospital-pin");
    const laundryPin = ball(mapBoard, 0.02, 0.1, 0.58, 0.02, 0xf2c14b, { rough: 0.4, seg: 10, seg2: 8 });
    reg(hits, laundryPin, "laundry-pin");

    // ----------------------------------------------------- traffic control
    const coneA = cone(g, 2.4, 1.7, { color: 0xe4622a });
    reg(hits, coneA, "set-cone-a");
    const coneB = cone(g, 2.9, 1.1, { color: 0xe4622a });
    reg(hits, coneB, "set-cone-b");
    const signPost = group(g, 3.6, 0, 2.0, -0.3);
    box(signPost, 0.04, 1.1, 0.04, 0, 0.55, 0, CITY.darkSteel, { rough: 0.6, metal: 0.4 });
    const signTex = surfaceTexture((ctx, w, h) => safetyStripeFace(ctx, w, h, { a: "#f2c14b", b: "#1a1a1a", stripes: 6 }), { repeat: 1, px: 160 });
    const signFacePanel = box(signPost, 0.6, 0.6, 0.03, 0, 1.15, 0, 0xffffff, { rough: 0.5 });
    signFacePanel.material = texturedMat(signTex, { rough: 0.5 });
    decal(signPost, 0.5, 0.2, 0, 1.15, 0.02, signFace("HYDRANT TEST AHEAD", { bg: "#1a1a1a", accent: "#f2c14b", scale: 0.4 }));
    holoTag(signPost, "advance warning sign", 0, 1.5, 0, { css: "#f2c14b", w: 0.5 });
    reg(hits, signPost, "set-warning-sign");
    const barrier = barrierPanel(g, 3.1, 0.4, { color: 0xe4622a });
    void barrier;

    // Stop/slow paddle, held near the taper.
    const paddle = group(g, 3.2, 0, 1.4, -0.4);
    cyl(paddle, 0.02, 0.02, 0.55, 0, 0.4, 0, 0x5b4636, { rough: 0.8, seg: 8 });
    cyl(paddle, 0.16, 0.16, 0.02, 0, 0.68, 0, 0xd2312b, { rough: 0.5, seg: 18 });
    decal(paddle, 0.22, 0.06, 0, 0.68, 0.011, signFace("STOP", { bg: "#7a1512", accent: "#ffffff", fg: "#ffffff", scale: 0.6 }));
    holoTag(paddle, "stop paddle", 0, 0.9, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, paddle, "stop-paddle");

    const noTraffic = box(g, 0.2, 0.2, 0.2, -1.6, 0.5, 2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "crack it before the cones?", -1.6, 0.75, 2.0, { css: "#d2312b", w: 0.5 });
    reg(hits, noTraffic, "no-traffic-control-hydrant");
    const fullOpen = box(g, 0.2, 0.2, 0.2, -1.9, 0.9, 1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just crank it full open?", -1.95, 1.15, 1.0, { css: "#d2312b", w: 0.5 });
    reg(hits, fullOpen, "full-open-without-crack");
    const skipCritical = box(g, 0.2, 0.2, 0.2, -2.5, 0.5, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip the block check?", -2.55, 0.75, -0.7, { css: "#d2312b", w: 0.44 });
    reg(hits, skipCritical, "skip-critical-check");

    // Radio, drain valve, cap chain, tool chest, log.
    const radio = box(g, 0.1, 0.16, 0.05, 2.2, 0.9, -2.3, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "test radio", 2.2, 1.14, -2.3, { css: UT2_CSS, w: 0.3 });
    reg(hits, radio, "test-radio");
    const drainCap = cyl(flowRig, 0.03, 0.03, 0.02, 0, 0.05, 0, 0x3a3f45, { rough: 0.7, metal: 0.4, seg: 10 });
    reg(hits, drainCap, "drain-barrel");
    const threadPatch = torus(flowRig ?? g, 0.04, 0.012, 0, 0.42, 0.17, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8, seg2: 12 });
    reg(hits, threadPatch, "cap-threads");
    const capChain = torus(residualRig, 0.03, 0.008, 0.14, 0.38, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8, seg2: 12 });
    reg(hits, capChain, "chain-cap");

    const logBench = group(g, 2.4, 0, 1.8);
    box(logBench, 0.9, 0.72, 0.5, 0, 0.36, 0, UT2_PAL.structure, { rough: 0.7, metal: 0.2 });
    const logPanel = decal(logBench, 0.3, 0.36, 0, 0.73, 0, paperFace("FLOW TEST LOG", ["Static ___ psi", "Residual ___ psi", "Pitot ___ psi", "Available flow per worksheet"], { scale: 0.78 }));
    logPanel.rotation.x = -Math.PI / 2;
    holoTag(logBench, "test log", 0, 0.94, 0, { css: UT2_CSS, w: 0.28 });
    reg(hits, logPanel, "test-log");

    toolChest(g, -2.7, 2.2);
    const operator = standingFigure(g, -0.4, 1.65, { ry: -2.0, cloth: 0x2b6f8f, vest: 0xf2c14b });
    void operator;

    holoPanel(g, 0.95, 0.6, -2.5, 0, 1.55, (ctx, w, h) => {
      ctx.fillStyle = "#0a1e28"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = UT2_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e3f2fd"; ctx.fillText("FLOW TEST — TWO HYDRANTS", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f4f9fd";
      ["Crack the flow hydrant, never slam it", "Read the pitot in the settled stream", "Watch the residual the whole window", "Dechlorinate before the storm drain"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { ry: 0.5, accent: UT2_ACCENT });

    // -------------------------------------------------------------- state
    let flowing = false, radioAlert = false, carClosing = false;
    const spray = particles(g, 24, 0xbfe6f5, { size: 0.03, life: 0.6, additive: false, opacity: 0.55 });
    spray.position.set(-2.55, 0.55, 0.6);
    spray.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.6, 1.0, 0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-hydrant") { damagedThread.visible = false; parkedCar.position.set(-0.05, 0, 3.6); }
        if (step.id === "static-pressure") repaint(residualGauge.userData.screen, signFace("62", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "crack-open-valve") { flowing = true; spray.visible = true; }
        if (step.id === "pitot-reading") repaint(pitotGauge.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "residual-watch") repaint(residualGauge.userData.screen, signFace("HELD", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "dechlorination-check") chlorMeter.rotation.y = 0.15;
        if (step.id === "close-flow-hydrant") { flowing = false; spray.visible = false; }
        if (step.id === "drain-and-cap") { drainCap.material = mat(0x2b3138, { rough: 0.6, metal: 0.4 }); }
      },
      onInterrupt(it) {
        if (it.id === "low-pressure-complaint-call") { radioAlert = true; radio.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 }); }
        if (it.id === "car-approaches-taper") { carClosing = true; approachingCar.position.set(4.0, 0, 2.6); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "low-pressure-complaint-call") { radioAlert = false; radio.material = mat(0x1b1e23, { rough: 0.5 }); }
        if (it.id === "car-approaches-taper") { carClosing = false; approachingCar.position.set(5.4, 0, 3.0); }
      },
      onHazard() {},
      animate(t, dt, session) {
        if (flowing) spray.userData.step(dt, new THREE.Vector3(0.15, 0.1, -0.2), 0.05, 0.5, -0.4);
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          const step = session?.step;
          if (step?.id === "static-pressure") repaint(residualGauge.userData.screen, signFace(`${Math.round(gg.t * 90)}`, { bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.72 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
          if (step?.id === "pitot-reading") repaint(pitotGauge.userData.screen, signFace(`${(gg.t * 60).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t > 0.5 && gg.t < 0.7 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.turn && (session.step?.id === "crack-open-valve" || session.step?.id === "close-flow-hydrant")) flowNut.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        if (carClosing) approachingCar.position.x -= dt * 0.4;
        void t; void radioAlert;
      },
    };
  },
};
