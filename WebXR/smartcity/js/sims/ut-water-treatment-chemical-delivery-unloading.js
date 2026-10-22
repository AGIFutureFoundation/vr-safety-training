import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, lockTag, reg,
  surfaceTexture, texturedMat, concreteFace, gratingFace, safetyStripeFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Water Treatment Chemical Delivery Unloading VR — Water &
// Environmental, UWUA water treatment operator.
//
// A tanker at the plant fence is a few thousand gallons of exactly one
// chemical, and the entire job is proving that before anything connects: the
// shipping papers, the safety data sheet and the tank's own label all have
// to agree, because the plant sits on more than one storage tank and the
// hose reaches all of them. Two incompatible chemicals meeting at a fitting
// do not wait for a lab to find out they should not have been connected —
// the reaction is immediate, and it does not stay contained to the hose. The
// rest of the job is what keeps a correct connection from becoming its own
// problem: grounded before anything flows, watched at the coupling the
// moment it starts, and stopped well short of a tank this crew already
// checked has room for it.
// Sited generically: no real chemical volume, tank capacity or plant name is
// invented — every number is what today's delivery and today's gauge read.

const UT7_ACCENT = 0x4fc78a;
const UT7_CSS = "#4fc78a";
const UT7_PAL = palette("utility");

export const SIM_UT_WATER_TREATMENT_CHEMICAL_DELIVERY_UNLOADING = {
  id: "ut-water-treatment-chemical-delivery-unloading",
  index: "ut-07",
  domain: "Water",
  trade: "UWUA water treatment operator — chemical delivery unloading",
  category: "Water & Environmental",
  weather: "overcast",
  certification: "UWUA water treatment operator training; OSHA 29 CFR 1910.1200 hazard communication for the safety data sheet check before any connection is made; 49 CFR Part 172 (PHMSA) hazardous materials communications for the delivery driver's shipping papers and placard; OSHA 29 CFR 1910.132 personal protective equipment for the unloading itself",
  name: "Water Treatment Chemical Delivery Unloading",
  title: simTitle("Water Treatment Chemical Delivery Unloading"),
  tagline: "The shipping papers, the safety data sheet and the tank's own label all proven to agree before a single hose connects, the tanker grounded and watched from the first moment it flows, and the transfer stopped well short of a tank already checked for room",
  accent: UT7_ACCENT,
  accentCss: UT7_CSS,
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "delivery-proven", name: "Delivery Proven", note: "A chemical delivery checked against its papers, its SDS and the tank's own label, grounded, watched at the connection, stopped inside the tank's capacity, and logged before the driver left" },

  game: system({
    name: "Water Treatment Authority",
    currency: "GAL",
    ranks: ["Apprentice", "Plant Operator Trainee", "Water Treatment Operator", "Shift Lead", "Water Treatment Authority Certified"],
    badges: [
      { id: "papers-before-hose", name: "Papers Before Hose", note: "The manifest, SDS and tank label were all checked before the hose ever connected", test: AWARD.stepClean("verify-placards") },
      { id: "right-tank-every-time", name: "Right Tank Every Time", note: "No unsafe action was recorded through the whole delivery", test: AWARD.safe },
      { id: "steady-level-watch", name: "Steady Level Watch", note: "Held the tank level watch inside the band the whole transfer", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-delivery", name: "Clean Delivery", note: "No corrections from the manifest to the log", test: AWARD.clean },
      { id: "unbroken-level-watch", name: "Unbroken Level Watch", note: "The tank level watch ran to completion without a break", test: AWARD.unbroken },
      { id: "driver-gone-fast", name: "Driver Gone Fast", note: "Logged and released inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-sds-check": "You went to connect the hose without ever reading the safety data sheet for this chemical. The SDS is where an incompatibility, a specific PPE requirement or a reaction hazard this exact chemical carries is actually written down — connecting first and checking later finds out what the sheet would have said the hard way.",
    "cross-connect-wrong-tank": "You went to connect the fill hose to the wrong storage tank. Two incompatible chemicals meeting at a fitting do not wait for anybody to notice — the reaction starts the instant they touch, and it does not stay contained to the hose or the fitting that caused it.",
    "skip-grounding": "You went to start the transfer without grounding the tanker to the plant's grounding lug first. A tank truck and a storage tank can build up a static charge neither one intends to, and grounding them together before anything flows is what gives that charge somewhere to go besides through the chemical itself.",
    "overfill-tank": "You went to keep the transfer running past the point the level gauge showed this tank was nearly full. This tank's own capacity was checked before the delivery started for exactly this reason — running past it now turns a delivery into an overflow that has nowhere to go but the containment this crew is about to need.",
  },

  lateNotes: {
    "transfer-valve": "The transfer valve opens only once the hose is connected to the correct tank and the tanker is grounded — not before either of those.",
    "fill-hose": "The fill hose connects to the tank this delivery's manifest actually names, not to whichever tank happens to be closer.",
  },

  // Two things that happen to an operator whose hands are on a hose coupling
  // or watching a tank level. See shared/game.js.
  interrupts: [
    {
      id: "forklift-near-hose",
      kind: "A forklift starts moving toward the hose run",
      after: "watch-connection-start", delay: 3, seconds: 11,
      alert: "A forklift elsewhere on site has started moving toward the walkway this delivery hose is stretched across, with no idea it is there.",
      cue: "Radio the forklift operator before they reach the hose.",
      target: "forklift-radio",
      why: "A forklift running over a live chemical delivery hose does not just damage the hose — it can pull the coupling loose at the tank end while the transfer is still running, and the radio is what stops that before the forklift is anywhere near close enough to find out.",
      missNote: "The forklift kept coming with nobody warning the operator. A hose that gets run over while a chemical transfer is live is a hose that can fail at the exact connection this crew is supposed to be watching.",
      wrongNote: "It is the radio, to the forklift operator. The coupling itself has not changed — the hose in the forklift's path is the actual problem.",
    },
    {
      id: "confirm-correct-tank-call",
      kind: "The plant operator radios to confirm the tank",
      after: "watch-tank-level", delay: 3, seconds: 12,
      alert: "The plant operator is calling from the control room to confirm which tank this delivery is actually filling, before the SCADA system logs it against the wrong one.",
      cue: "Answer the radio and confirm the tank before the level watch continues.",
      target: "plant-radio",
      why: "The control room's own record of which tank received this delivery matters as much as the physical connection itself, and confirming it over the radio now is what keeps this delivery from being logged against a tank it never actually went into.",
      missNote: "The call went unanswered while the level watch continued. The control room's own record of this delivery was never confirmed against what is actually happening at the tank.",
      wrongNote: "It is the plant operator's call, about which tank this is. The level gauge in front of you already knows which tank it is reading.",
    },
  ],

  supportLine: "your utility's employee assistance programme, or your UWUA steward if you are not sure how to reach it",

  steps: [
    {
      id: "read-manifest", kind: "select", target: "delivery-manifest",
      title: "Read the delivery manifest",
      cue: "Check the manifest: the chemical, the quantity, and that this is today's ordered delivery.",
      why: "The manifest is what should match everything else on this delivery — the driver's papers, the tanker's placard and the tank's own label — and reading it first is what gives this crew something to check the rest of the delivery against.",
    },
    {
      id: "check-sds", kind: "select", target: "sds-binder",
      title: "Review the safety data sheet",
      cue: "Check the SDS for this exact chemical before anything connects.",
      why: "The SDS is where this chemical's specific incompatibilities, PPE requirements and reaction hazards are actually written down — read now, it tells this crew what to watch for before the delivery starts, not after something has already gone wrong.",
    },
    {
      id: "verify-placards", kind: "find", noHint: true,
      targets: ["truck-placard", "tank-label"],
      itemNames: { "truck-placard": "the tanker's hazard placard", "tank-label": "the storage tank's own label" },
      itemNotes: {
        "truck-placard": "The tanker's placard names the chemical on board — this is checked against the manifest and against the tank label before either one is trusted alone.",
        "tank-label": "The storage tank's label names what belongs in it. If this does not match the placard on the tanker, nothing connects until that is resolved.",
      },
      title: "Verify the placard against the tank label",
      cue: "Find and compare the tanker's placard and the storage tank's own label.",
      why: "A manifest can be misread and a driver can be at the wrong address, but the placard and the label are what is physically in front of this crew right now — the two of them agreeing is the actual proof this delivery is going where it is supposed to.",
    },
    {
      id: "spill-kit-staged", kind: "select", target: "spill-kit",
      title: "Stage the spill kit before the transfer",
      cue: "Confirm the spill kit and containment are staged at the connection point before anything flows.",
      why: "A spill kit found after a release has started is a spill kit that is already behind — staged here, at the connection, before the transfer begins, it is ready for the one moment it might actually be needed instead of being fetched while chemical is still running.",
    },
    {
      id: "ppe-and-ground", kind: "sequence",
      targets: ["don-ppe", "ground-tanker"],
      itemNames: { "don-ppe": "PPE donned", "ground-tanker": "tanker grounded" },
      title: "Don PPE and ground the tanker",
      cue: "Put on the PPE this chemical's SDS calls for, then ground the tanker to the plant's lug.",
      why: "The ground cable is what gives a static charge somewhere to go besides through the chemical itself, and it goes on before the hose does — a tanker connected and flowing before it is grounded has already skipped the one step that exists for exactly this moment.",
      outOfOrderNote: "PPE first, then the ground cable — grounding the tanker is not a substitute for the protection this chemical's SDS actually calls for.",
    },
    {
      id: "connect-fill-hose", kind: "drag", target: "fill-hose",
      title: "Connect the fill hose to the correct tank",
      cue: "Carry the fill hose to the tank this delivery's manifest actually names.",
      why: "This hose reaches every tank in this yard, and the only thing that makes it safe to connect anywhere is connecting it to the one tank this specific delivery is actually for — checked against the manifest and the label, not against which tank happens to be closest to the truck.",
      drag: { to: "correct-tank-socket", radius: 0.45, missNote: "Not on the tank this delivery is for — check the manifest and the label again before this hose connects anywhere." },
    },
    {
      id: "check-tank-capacity", kind: "gauge", target: "tank-level-gauge",
      title: "Check the tank's available capacity",
      cue: "Bring the level reading up to where the tank actually sits, then commit.",
      why: "This tank's available room decides how much of this delivery it can actually take, and checking it before the transfer starts is what turns 'the truck holds this much' into 'this tank can actually hold what the truck is about to send it.'",
      gauge: { label: "TANK LEVEL", speed: 0.6, green: [0.2, 0.45], readout: (t) => `${Math.round(t * 100)}% full`, missNote: "That reading does not leave enough room for this delivery — confirm the tank's actual level before the transfer starts." },
    },
    {
      id: "open-transfer-valve", kind: "turn", target: "transfer-valve",
      title: "Open the transfer valve slowly",
      cue: "Wind the transfer valve open slowly, watching the coupling as flow begins.",
      why: "Opened slowly, any weep at the coupling shows itself at low flow and low pressure, where it is easy to stop — opened fast, the same weak connection is already under full flow before anyone has had a chance to look at it.",
      turn: { turns: 0.5, axis: "y", label: "TRANSFER VALVE" },
    },
    {
      id: "watch-connection-start", kind: "hold", target: "hose-coupling", seconds: 5,
      title: "Watch the coupling as flow begins",
      cue: "Hold your attention on the coupling for the full watch as the transfer gets going.",
      why: "The first moments of flow are when a coupling that was not fully seated shows it — held under watch through that window rather than glanced at once, a weep at the fitting is caught before the transfer has been running long enough to call it normal.",
      holdBreakNote: "Attention came off the coupling before the watch finished — hold again, a weep that starts in the first moments of flow does not announce itself twice.",
    },
    {
      id: "watch-tank-level", kind: "track", target: "tank-level-gauge", seconds: 7,
      title: "Watch the tank level through the transfer",
      cue: "Watch the level rise and stay under the high-level band for the whole transfer.",
      why: "A tank filling faster than expected, or a level gauge that stops tracking the actual flow, both show up here — watched through the whole transfer rather than checked once at the start, either problem is caught with the valve still in this crew's hand instead of after the tank is already full.",
      track: { start: 0.3, green: [0.2, 0.7], rise: 0.06, fall: -0.01, drift: 0.08, label: "TANK LEVEL", readout: (v) => (v > 0.7 ? "approaching capacity — slow the transfer" : "within capacity") },
      holdBreakNote: "That level pushed past the safe band during the transfer — slow the valve and recheck the tank's actual capacity before this delivery goes any further.",
    },
    {
      id: "leak-inspection-walk", kind: "find",
      targets: ["hose-weep", "coupling-drip"],
      itemNames: { "hose-weep": "a weep along the hose", "coupling-drip": "a drip at a second coupling" },
      itemNotes: {
        "hose-weep": "This section of hose is weeping under pressure — a slow leak here becomes a fast one the longer the transfer keeps running at full flow.",
        "coupling-drip": "This coupling is dripping at the threads — snugged or remade now, while the transfer can still be paused to deal with it.",
      },
      title: "Walk the hose run mid-transfer",
      cue: "Walk the full length of the hose and find what the watch at the tank end cannot see.",
      why: "The coupling watch covers one end of this hose; the rest of the run is only checked by actually walking it — a weep partway along, or a second coupling nobody has looked at since it was made up, both need eyes on them while the transfer is still live enough to act on what is found.",
    },
    {
      id: "close-transfer-valve", kind: "turn", target: "transfer-valve",
      title: "Close the transfer valve slowly",
      cue: "Wind the valve shut slowly once the delivery is complete.",
      why: "Closed the same way it opened, the column of chemical still moving in the hose slows gradually instead of slamming to a stop against a shut valve — a valve closed too fast can drive a pressure spike back through a hose that has been running at full flow the whole delivery.",
      turn: { turns: 0.5, axis: "y", reverse: true, label: "TRANSFER VALVE" },
    },
    {
      id: "disconnect-and-cap", kind: "sequence",
      targets: ["drain-hose-residual", "cap-hose-ends"],
      itemNames: { "drain-hose-residual": "residual drained to containment", "cap-hose-ends": "both ends capped" },
      title: "Drain and cap the hose",
      cue: "Drain the hose's residual chemical to containment, then cap both ends.",
      why: "Whatever chemical is still sitting in this hose after the valve closes has to go somewhere controlled rather than onto the ground the moment the coupling comes apart — drained to containment first, then capped, the hose leaves this connection clean for whoever uses it next.",
      outOfOrderNote: "Drain to containment, then cap both ends — capping a hose that still has residual in it just moves the spill to wherever it gets uncapped next.",
    },
    {
      id: "complete-log", kind: "select", target: "delivery-log",
      title: "Complete the delivery log",
      cue: "Log the quantity received, the tank's level after the delivery, and the chemical's lot number.",
      why: "This log is what lets the plant trace this exact delivery back to a specific lot if a water quality question ever comes up later, and a delivery that is never logged is a delivery this plant can never actually account for months from now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, UT7_ACCENT);

    // ---------------------------------------------------------------- ground
    const groundTex = surfaceTexture((ctx, w, h) => concreteFace(ctx, w, h, { tone: "#8b8d89", finish: "broom" }), { repeat: 4, px: 320 });
    const groundPlane = box(g, 5.0, 0.06, 4.2, 0, 0.03, 0, 0xffffff, { rough: 0.9 });
    groundPlane.material = texturedMat(groundTex, { rough: 0.9, metal: 0.02, color: UT7_PAL.ground });
    const bermTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#4a4f53", base2: "#3c4145" }), { repeat: 2, px: 220 });
    const berm = box(g, 3.2, 0.12, 2.4, 0.6, 0.06, -0.5, 0xffffff, { rough: 0.85 });
    berm.material = texturedMat(bermTex, { rough: 0.85, metal: 0.2 });
    holoTag(g, "secondary containment", 0.6, 0.3, -0.5, { css: UT7_CSS, w: 0.44 });

    // Two bulk storage tanks: the correct one and a different chemical's
    // tank, built to a bulk-tank scale rather than the small gas-cylinder
    // proportions of citykit's small gas-cylinder helper.
    const correctTank = group(g, 1.4, 0, -1.2);
    cyl(correctTank, 0.42, 0.42, 1.3, 0, 0.65, 0, 0x4fc78a, { rough: 0.5, metal: 0.2, seg: 20, finish: "galvanised" });
    cyl(correctTank, 0.44, 0.44, 0.08, 0, 1.3, 0, 0x3a9068, { rough: 0.5, metal: 0.3, seg: 20 });
    holoTag(correctTank, "sodium hypochlorite tank", 0, 1.6, 0, { css: UT7_CSS, w: 0.5 });
    const tankGaugeInst = instrument(correctTank, 0.46, 0.9, 0, { idle: "-- %", color: 0x2b2f34, w: 0.14, d: 0.12 });
    reg(hits, tankGaugeInst, "tank-level-gauge");
    const tankLabel = decal(correctTank, 0.3, 0.14, 0.44, 0.5, 0, signFace("NaOCl TANK", { bg: "#0a2418", accent: UT7_CSS, scale: 0.44 }), { px: 160 });
    tankLabel.rotation.y = Math.PI / 2;
    reg(hits, tankLabel, "tank-label");
    const correctSocket = group(correctTank, -0.42, 0.3, 0);
    hits["correct-tank-socket"] = correctSocket;

    const otherTank = group(g, 2.3, 0, -1.5);
    cyl(otherTank, 0.34, 0.34, 1.05, 0, 0.53, 0, 0xd85c9e, { rough: 0.5, metal: 0.2, seg: 18, finish: "galvanised" });
    cyl(otherTank, 0.36, 0.36, 0.06, 0, 1.06, 0, 0xb04a80, { rough: 0.5, metal: 0.3, seg: 18 });
    holoTag(g, "ferric chloride tank — do not connect", 2.3, 1.4, -1.5, { css: "#d85c9e", w: 0.66 });
    const wrongTankSocket = group(otherTank, -0.34, 0.25, 0);
    const wrongConnect = box(g, 0.2, 0.2, 0.2, 2.0, 0.6, -1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "connect here instead?", 2.0, 0.85, -1.5, { css: "#d2312b", w: 0.4 });
    reg(hits, wrongConnect, "cross-connect-wrong-tank");
    void wrongTankSocket;

    // The tanker.
    const tanker = group(g, -1.6, 0, 0.8, 0.5);
    cyl(tanker, 0.32, 0.32, 1.6, 0, 0.5, 0, 0xdfe6ec, { rough: 0.5, metal: 0.4, seg: 18 });
    for (const dx of [-0.5, 0.5]) cyl(tanker, 0.22, 0.22, 0.15, dx, 0.22, 0, 0x2b2f34, { rough: 0.6, seg: 14 });
    decal(tanker, 0.3, 0.24, 0, 0.5, 0.331, signFace("HAZMAT 8", { bg: "#f2c14b", accent: "#1a1a1a", fg: "#1a1a1a", scale: 0.5 }), { px: 160 });
    holoTag(tanker, "delivery tanker", 0, 0.9, 0, { css: UT7_CSS, w: 0.32 });
    const placard = decal(tanker, 0.24, 0.24, 0, 0.5, 0.335, signFace("NaOCl", { bg: "#f2c14b", accent: "#1a1a1a", fg: "#1a1a1a", scale: 0.5 }), { px: 128 });
    reg(hits, placard, "truck-placard");
    const groundLug = ball(tanker, 0.02, -0.3, 0.05, 0.3, 0xd8b23a, { rough: 0.4, metal: 0.6 });
    holoTag(tanker, "ground lug", -0.3, 0.16, 0.3, { css: "#f2c14b", w: 0.28 });
    reg(hits, groundLug, "ground-tanker");

    // Fill hose, staged and connected between tanker and tank.
    const hoseStart = new THREE.Vector3(-1.6, 0.4, 0.9);
    const hose = cyl(g, 0.025, 0.025, 1.2, -0.6, 0.35, -0.1, 0x2b2f33, { rough: 0.7, seg: 12 });
    hose.rotation.z = 0.9;
    holoTag(g, "fill hose", -0.6, 0.6, -0.1, { css: UT7_CSS, w: 0.26 });
    reg(hits, hose, "fill-hose");
    const coupling = torus(g, 0.04, 0.012, 0.94, 0.3, -1.15, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8, seg2: 14 });
    holoTag(g, "hose coupling", 0.94, 0.5, -1.15, { css: UT7_CSS, w: 0.3 });
    reg(hits, coupling, "hose-coupling");
    const weep = ball(g, 0.018, -0.6, 0.35, -0.1, 0xbfe6f5, { rough: 0.2, opacity: 0.7, transparent: true });
    reg(hits, weep, "hose-weep");
    const dripCoupling = ball(g, 0.018, 0.3, 0.4, -0.7, 0xbfe6f5, { rough: 0.2, opacity: 0.7, transparent: true });
    reg(hits, dripCoupling, "coupling-drip");
    void hoseStart;

    // Transfer valve.
    const transferValve = valveWheel(g, 0.94, 0.6, -1.15, { color: 0xd8232a, body: 0x2b2f34, r: 0.07 });
    holoTag(g, "transfer valve", 0.94, 0.84, -1.15, { css: UT7_CSS, w: 0.32 });
    reg(hits, transferValve.userData.wheel, "transfer-valve");

    // Overfill hazard marker near the correct tank.
    const overfill = box(g, 0.2, 0.2, 0.2, 1.7, 1.3, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep it running past full?", 1.75, 1.55, -1.0, { css: "#d2312b", w: 0.5 });
    reg(hits, overfill, "overfill-tank");
    const skipGround = box(g, 0.2, 0.2, 0.2, -1.3, 0.5, 1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just open the valve?", -1.3, 0.75, 1.3, { css: "#d2312b", w: 0.42 });
    reg(hits, skipGround, "skip-grounding");
    const skipSds = box(g, 0.2, 0.2, 0.2, -2.3, 0.5, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "connect first, read later?", -2.35, 0.75, -0.3, { css: "#d2312b", w: 0.46 });
    reg(hits, skipSds, "skip-sds-check");

    // Boards and props.
    const manifestBoard = group(g, -2.3, 0, 1.7, 0.4);
    box(manifestBoard, 0.5, 0.7, 0.04, 0, 0.35, 0, UT7_PAL.structure, { rough: 0.7 });
    const manifestPanel = decal(manifestBoard, 0.44, 0.32, 0, 0.68, 0.03, paperFace("DELIVERY MANIFEST", ["Chemical / quantity ordered", "Confirm against today's order", "Lot number on the papers"], { scale: 0.72 }));
    holoTag(manifestBoard, "delivery manifest", 0, 0.9, 0, { css: UT7_CSS, w: 0.4 });
    reg(hits, manifestPanel, "delivery-manifest");

    const sdsBinder = group(g, -2.3, 0, 0.9, 0.3);
    box(sdsBinder, 0.24, 0.32, 0.06, 0, 0.5, 0, 0x2b3138, { rough: 0.6 });
    decal(sdsBinder, 0.2, 0.12, 0, 0.56, 0.031, signFace("SDS", { bg: "#0a1e28", accent: UT7_CSS, scale: 0.5 }));
    holoTag(sdsBinder, "SDS binder", 0, 0.72, 0, { css: UT7_CSS, w: 0.3 });
    reg(hits, sdsBinder, "sds-binder");

    const spillKit = box(g, 0.36, 0.3, 0.24, -0.4, 0.15, 0.6, 0xd2312b, { rough: 0.6 });
    holoTag(g, "spill kit", -0.4, 0.35, 0.6, { css: "#d2312b", w: 0.28 });
    reg(hits, spillKit, "spill-kit");

    const ppeRack = box(g, 0.4, 0.5, 0.12, -1.0, 0.25, 1.6, 0x2b3138, { rough: 0.6 });
    holoTag(g, "PPE rack", -1.0, 0.55, 1.6, { css: UT7_CSS, w: 0.28 });
    reg(hits, ppeRack, "don-ppe");

    const forkliftRadio = box(g, 0.09, 0.16, 0.05, 2.2, 0.9, 1.6, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "forklift radio", 2.2, 1.14, 1.6, { css: UT7_CSS, w: 0.32 });
    reg(hits, forkliftRadio, "forklift-radio");
    const plantRadio = box(g, 0.09, 0.16, 0.05, 2.2, 0.9, 0.4, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "plant radio", 2.2, 1.14, 0.4, { css: UT7_CSS, w: 0.28 });
    reg(hits, plantRadio, "plant-radio");

    const drainPoint = box(g, 0.16, 0.06, 0.16, 0.4, 0.03, -1.5, 0x2b3138, { rough: 0.7 });
    reg(hits, drainPoint, "drain-hose-residual");
    const hoseCaps = group(g, -0.9, 0.1, -0.3);
    ball(hoseCaps, 0.03, 0, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.6 });
    reg(hits, hoseCaps, "cap-hose-ends");

    const logBench = group(g, -2.3, 0, -1.5);
    box(logBench, 0.9, 0.72, 0.5, 0, 0.36, 0, UT7_PAL.structure, { rough: 0.7, metal: 0.2 });
    const logPanel = decal(logBench, 0.3, 0.36, 0, 0.73, 0, paperFace("DELIVERY LOG", ["Quantity received ___ gal", "Tank level after ___ %", "Lot number ___"], { scale: 0.76 }));
    logPanel.rotation.x = -Math.PI / 2;
    holoTag(logBench, "delivery log", 0, 0.94, 0, { css: UT7_CSS, w: 0.3 });
    reg(hits, logPanel, "delivery-log");

    toolChest(g, 2.4, -1.0);
    const operator = standingFigure(g, -0.5, -1.9, { ry: 1.7, cloth: 0x2b6f8f, vest: 0xf2c14b });
    void operator;

    holoPanel(g, 0.95, 0.6, 2.3, 0, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "#08221a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = UT7_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e3fdf0"; ctx.fillText("CHEMICAL DELIVERY", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f4fff9";
      ["Papers, SDS and label all agree", "Ground before anything flows", "Right tank, checked against the label", "Watch the coupling and the level"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { ry: -0.5, accent: UT7_ACCENT });

    let watchingCoupling = false, transferring = false, forkliftAlert = false, radioAlert = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "check-tank-capacity") repaint(tankGaugeInst.userData.screen, signFace("38", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "open-transfer-valve") transferring = true;
        if (step.id === "watch-connection-start") watchingCoupling = false;
        if (step.id === "leak-inspection-walk") { weep.visible = false; dripCoupling.visible = false; }
        if (step.id === "close-transfer-valve") transferring = false;
      },
      onInterrupt(it) {
        if (it.id === "forklift-near-hose") { forkliftAlert = true; forkliftRadio.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 }); }
        if (it.id === "confirm-correct-tank-call") { radioAlert = true; plantRadio.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "forklift-near-hose") { forkliftAlert = false; forkliftRadio.material = mat(0x1b1e23, { rough: 0.5 }); }
        if (it.id === "confirm-correct-tank-call") { radioAlert = false; plantRadio.material = mat(0x1b1e23, { rough: 0.5 }); }
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.step?.id === "watch-connection-start") watchingCoupling = true;
        if (watchingCoupling) coupling.rotation.z = Math.sin(t * 3) * 0.03;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "check-tank-capacity") repaint(tankGaugeInst.userData.screen, signFace(`${Math.round(gg.t * 100)}`, { bg: "#0d1c24", accent: gg.t > 0.2 && gg.t < 0.45 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        if (session?.turn && (session.step?.id === "open-transfer-valve" || session.step?.id === "close-transfer-valve")) transferValve.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        void dt; void transferring; void forkliftAlert; void radioAlert;
      },
    };
  },
};
