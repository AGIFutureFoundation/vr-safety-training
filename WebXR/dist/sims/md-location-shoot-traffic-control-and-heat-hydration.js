import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, asphaltFace, safetyStripeFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { cargoVan, sedan } from "../../../shared/fleet.js";
import { coneCluster, waterBarrier, siteOffice } from "../../../shared/props.js";

// SmartCiti.X~ Location Shoot Traffic Control & Heat/Hydration VR — Screen &
// Media Crafts.
//
// A live city block closed for a location shoot: the closure permit read,
// hi-vis and paddle on, the block swept for a car that never moved and a
// blocked curb ramp, the heat index checked against the production's own
// plan, the hydration cooler proven full, the paddle turned to STOP before a
// take rolls, the all-clear held until both ends of the block read clear,
// the AD's rolling call confirmed, the paddle held steady facing traffic
// through the take, the production van repositioned a short distance behind
// base camp, a full water jug carried to the cooler, the scheduled heat
// break called, and the block's reopening logged — with a resident's car
// turning onto the block and an early heat-illness sign at the shade tent
// both needing an answer that is not the control the learner is already
// holding. The production, the street and the city are generic.

const LOC_ACCENT = 0xff7043;
const LOC_CSS = "#ff7043";

export const SIM_MD_LOCATION_SHOOT_TRAFFIC_CONTROL_AND_HEAT_HYDRATION = {
  id: "md-location-shoot-traffic-control-and-heat-hydration",
  index: "710",
  domain: "Screen & Media Crafts",
  trade: "Location department traffic control coordinator, managing a live-street closure, the production van's reposition move, and the crew's heat and hydration break",
  category: "Entertainment & Live Events",
  weather: "heat-haze",
  certification: "IATSE location department training; ANSI/ISEA 107 high-visibility apparel for the traffic control crew; OSHA 29 CFR 1910.132 general personal protective equipment requirements; Cal/OSHA 8 CCR 3203 injury and illness prevention programme requirement, applied here to the production's own written traffic and heat safety plans; NFPA 101 Life Safety Code requirements for keeping the marked emergency-vehicle lane open through the closure",
  name: "Location Shoot Traffic Control & Heat/Hydration",
  title: simTitle("Location Shoot Traffic Control & Heat/Hydration"),
  tagline: "A closed city block before the take: the permit read, hi-vis and paddle on, the block swept for a car that never moved and a blocked curb ramp, the heat index checked and the cooler proven full, the paddle turned to STOP, the all-clear held until both ends read clear, the AD's rolling call confirmed, the paddle held steady through the take, the production van repositioned behind base camp, a jug carried to the cooler, the scheduled heat break called, and the reopening logged — a resident's car and an early heat-illness sign both answered off a control that isn't the one already in the learner's hand",
  accent: LOC_ACCENT,
  accentCss: LOC_CSS,
  parSeconds: 340,
  footprint: 3.0,
  badge: { id: "block-held-crew-cool", name: "Block Held, Crew Cool", note: "The block swept clean, the cooler proven full before the first take, the resident's car turned back off the paddle, and the heat sign caught and answered before it became something worse" },

  supportLine: "your IATSE local's member assistance contact, or the production's own employee assistance programme",

  game: system({
    name: "Location Control",
    currency: "BLOCK",
    ranks: ["Set PA", "Lock-Up PA", "Traffic Control Trainee", "Location Coordinator", "Location Manager Certified"],
    badges: [
      { id: "cooler-proven", name: "Cooler Proven", note: "Never called the heat break before the cooler read full", test: AWARD.stepClean("hydration-cooler-check") },
      { id: "car-turned-back", name: "Car Turned Back", note: "The resident's car was turned back on the paddle, not the all-clear call", test: AWARD.unbroken },
      { id: "never-in-the-lane", name: "Never in the Lane", note: "Never stood in a blind corner, never crossed behind the reversing van, never blocked the fire lane, never skipped the cable ramp", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-closure", name: "Clean Closure", note: "No corrections from the permit to the closing log", test: AWARD.clean },
      { id: "steady-paddle", name: "Steady Paddle", note: "The paddle held its band facing traffic the whole take", test: AWARD.precise(0.7) },
      { id: "rolling-on-time", name: "Rolling On Time", note: "Cleared for the take inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "stand-in-blind-corner": "You stood in the roadway at the block's blind corner, where a driver coming around it has no sightline to you until they are already on top of you. A flagger's whole job depends on being seen before a car has to react, and the one place that fails is exactly the corner nobody can see around.",
    "cross-behind-reversing-van": "You crossed behind the production van while it was backing up. A van's driver has almost no view of the ground directly behind the rear bumper, and the last few feet of any backing move are exactly the distance a driver cannot confirm clear from the mirrors alone — that is what a spotter is for, not a shortcut across.",
    "block-fire-lane": "You set a gear cart down in the marked fire lane the permit requires stay open the whole time the block is closed. That lane is not a suggestion — it is the one path a real emergency response still has through a closed set, and anything parked in it is the reason a truck cannot get through the one day it actually needs to.",
    "skip-cable-ramp": "You ran a cable across the roadway with no rubber ramp over it. A cable lying bare across a lane is a trip hazard for anyone still crossing on foot and a crush hazard for the cable itself the moment a vehicle's tyre finds it, and the ramp is what turns a bare cable crossing into one that survives the day.",
  },

  lateNotes: {
    "all-clear-radio": "The all-clear only gets called once the paddle has already turned traffic — calling it first just tells everyone the block is clear when it still has a car in it.",
    "production-van": "The van repositions after the take is struck — moving it mid-take is its own hazard on a live take.",
    "heat-break-radio": "The break gets called once the cooler is proven full — calling it on an empty cooler is calling a break nobody can actually take.",
  },

  steps: [
    {
      id: "read-permit", kind: "select", target: "permit-board",
      title: "Read the location closure permit",
      cue: "Read the permit board: the closure window, the block limits, and the fire lane the permit requires stay open.",
      why: "The permit is the one document that actually says what today's closure is allowed to be — which hours, which block, and which lane has to stay open no matter what the shot needs. A traffic plan built from memory instead of the permit is a plan that drifts a little further from what was actually approved every time it's used.",
    },
    {
      id: "ppe-donning", kind: "sequence", anyOrder: true,
      targets: ["hivis-vest", "stop-slow-paddle"],
      itemNames: { "hivis-vest": "hi-vis vest", "stop-slow-paddle": "STOP/SLOW paddle" },
      title: "Hi-vis and paddle on before stepping into the roadway",
      cue: "Put on the hi-vis vest and pick up the STOP/SLOW paddle before stepping past the curb.",
      why: "A flagger is only as safe as being seen, and the vest goes on before the first step into the roadway, not once a car is already approaching. The paddle is what turns a person standing in a street into a traffic control device a driver is trained to recognise and obey.",
    },
    {
      id: "street-sweep", kind: "find", noHint: true,
      targets: ["unmarked-parked-car", "missing-cone", "blocked-crosswalk-ramp"],
      itemNames: { "unmarked-parked-car": "car left on the block", "missing-cone": "gap in the cone line", "blocked-crosswalk-ramp": "cart blocking the curb ramp" },
      itemNotes: {
        "unmarked-parked-car": "A car is still parked on the block despite the posted closure notice. It has to be moved or worked around before a single take rolls, because a background vehicle nobody accounted for is a continuity problem at best and a real obstruction at worst.",
        "missing-cone": "There's a gap in the cone line where a cone has been knocked over or never set. A closure that reads solid from one end and has a hole in the middle is a closure a driver finds by accident rather than by reading it correctly.",
        "blocked-crosswalk-ramp": "A gear cart is sitting square across the accessible curb ramp. Anyone using that ramp has nowhere else to go, and a location closure that blocks the one accessible path off the crosswalk is not a closure the permit allows.",
      },
      title: "Sweep the block before the first take",
      cue: "Walk the closure and click the three things wrong with how it was set.",
      why: "A closure looks the same whether it's actually solid or has a gap in it, and the three finds here are the ones a driver, a pedestrian or the next department all discover the hard way if nobody walks the block first.",
    },
    {
      id: "heat-index-check", kind: "select", target: "heat-index-board",
      title: "Check the heat index against the production's plan",
      cue: "Read the heat index board and check today's category against the break schedule in the production's own heat plan.",
      why: "The production's heat plan sets break frequency and hydration requirements by category, not by how anyone happens to feel at the moment — a heat index that has climbed into the next category changes the schedule whether or not the crew has noticed yet.",
    },
    {
      id: "hydration-cooler-check", kind: "gauge", target: "hydration-gauge",
      title: "Prove the hydration cooler is full before the first take",
      cue: "Read the cooler's fill gauge and commit inside the band the crew size calls for.",
      why: "A cooler that reads full at wrap yesterday is not the same cooler today, and a heat break called on a cooler nobody actually checked is a break that runs out of water halfway through the crew. Proving the level here, before the first take, is what makes the break schedule mean something later.",
      gauge: { label: "COOLER", speed: 0.6, green: [0.55, 0.85], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not full enough for the crew size — top it off before calling any break on it." },
    },
    {
      id: "paddle-to-stop", kind: "turn", target: "stop-slow-paddle",
      title: "Turn the paddle to STOP before the take rolls",
      cue: "Turn the paddle face from SLOW to STOP before traffic is held for the take.",
      why: "STOP and SLOW are two different instructions to a driver, and the paddle only says one of them at a time — turning it to STOP is the one action that actually holds traffic rather than just slowing it past a live take.",
      turn: { turns: 1.0, label: "PADDLE", readout: (t) => (t < 0.5 ? "SLOW" : t < 0.95 ? "turning" : "STOP") },
    },
    {
      id: "all-clear-hold", kind: "hold", target: "all-clear-radio", seconds: 4,
      title: "Hold the all-clear until both ends read clear",
      cue: "Hold the ALL CLEAR call until the flagger at the far end confirms clear too.",
      why: "A block has two ends, and 'clear' only means anything once both flaggers agree on it at the same time — releasing the call the instant your own end looks clear is how a take rolls with a car still approaching from the end nobody was watching.",
      holdBreakNote: "You let go before the far end confirmed. Your own end reading clear says nothing about the end you can't see.",
    },
    {
      id: "ad-rolling-call", kind: "select", target: "ad-radio-loc",
      title: "Confirm the AD's rolling call",
      cue: "Confirm the assistant director's 'rolling' call before traffic stays held for the take.",
      why: "Traffic is only held for an actual take, not for a rehearsal or a reset — confirming the AD's own call is what keeps a block closed for exactly as long as a take is really running, rather than however long it takes someone to notice it wasn't.",
    },
    {
      id: "paddle-hold-steady", kind: "track", target: "paddle-hold", seconds: 5,
      title: "Hold the paddle steady facing traffic through the take",
      cue: "Keep the paddle's STOP face square to oncoming traffic for the whole take — a paddle that drops or turns away stops meaning anything to the driver who is still watching it.",
      why: "A driver who has already stopped for a paddle is still reading it the whole time they're stopped, and a paddle that droops or turns away mid-take reads as 'clear to go' to someone who was never told otherwise. Holding it square is what keeps the hold actually holding.",
      track: { start: 0.5, green: [0.42, 0.58], rise: 0.5, fall: 0.5, drift: 0.12, label: "PADDLE FACE", readout: (v) => (v < 0.42 ? "drooping" : v > 0.58 ? "turned away" : "square") },
      holdBreakNote: "The paddle drooped or turned off-square — bring it back to facing traffic rather than snapping it back up.",
    },
    {
      id: "van-reposition", kind: "drive", target: "production-van",
      title: "Reposition the production van behind base camp",
      cue: "Drive the production van a short distance to reposition it clear of the shot, checking your mirrors through the move.",
      why: "A van repositioned on a closed block still shares that block with a walking crew, and the short move is driven the same way any move is — mirrors checked, not just assumed clear because the block is closed to outside traffic. A closure keeps strangers out; it does not make everyone already inside it visible from the driver's seat.",
      holdBreakNote: "Out of the lane or the band on the reposition — a short move on a closed block is still a move a walking crew shares the street with.",
      drive: {
        path: [[-2.4, -2.0], [-2.4, -3.1], [-2.1, -4.2]],
        speedBand: [2, 6], laneWidth: 1.6, graceSeconds: 1.6, checkWindow: 1.6, sceneRate: 0.2,
        bandLabel: "walking pace, per the location's own limit",
        checks: [
          { at: 0, kind: "mirror-right", note: "Right mirror before the van moves — crew and gear cluster on that side near base camp." },
          { at: 1, kind: "horn", note: "A short tap on the horn tells anyone behind the van it's about to move, before they're relying on you to have seen them." },
          { at: 2, kind: "mirror-left", note: "Left mirror as the van settles into its new spot — the lane beside it needs checking before anyone treats it as parked." },
        ],
      },
    },
    {
      id: "water-jug-refill", kind: "drag", target: "water-jug",
      title: "Carry a full jug to the hydration cooler",
      cue: "Carry the full water jug from the gear line to the hydration cooler's fill slot.",
      why: "The cooler only stays proven full if somebody actually refills it before it runs low, and carrying the jug here — before the break is called, not during it — is what keeps the break from being the moment the crew finds out the cooler was already empty.",
      drag: { to: "hydration-cooler-slot", radius: 0.5, missNote: "Not on the cooler's fill slot — the jug has to seat there, not sit next to it." },
    },
    {
      id: "heat-break-call", kind: "select", target: "heat-break-radio",
      title: "Call the scheduled heat and hydration break",
      cue: "Call the heat and hydration break over the location radio, per the schedule the heat index set.",
      why: "The break is called on the schedule the heat plan set, not on how the crew looks in the moment — heat illness shows up after the point a break would have still helped, so the call is made on the clock and the index, not on waiting for someone to visibly struggle.",
    },
    {
      id: "wrap-log", kind: "select", target: "wrap-log",
      title: "Log the closure, the finds and the break",
      cue: "Log the closure times, the parked car and blocked ramp found, and the heat break taken before reopening the block.",
      why: "The log is what the next location department reads before they take this same block — a car that had to be worked around and a ramp that was blocked are exactly what the next crew needs to plan for before they're standing in the same spot finding it out again.",
    },
  ],

  interrupts: [
    {
      id: "resident-car-turns-in",
      kind: "Resident car turns onto the closed block",
      after: "all-clear-hold", delay: 2, seconds: 12,
      alert: "A car has turned onto the closed block from the far end and is heading toward the marked take zone.",
      cue: "Turn the paddle to STOP and wave them off before they reach the zone.",
      target: "stop-slow-paddle",
      why: "A driver who does not know the block is closed is not reading anyone's radio call — the paddle is the one thing in the whole closure built to be understood at a glance by someone who has no other context, and it's what actually stops the car before it reaches the zone.",
      missNote: "The car kept coming and rolled into the edge of the take zone before anyone turned the paddle on it.",
      wrongNote: "Not the all-clear radio — the driver can't hear that. The paddle is what a driver with no other context is built to read.",
    },
    {
      id: "heat-illness-sign",
      kind: "Early heat-illness sign at the shade tent",
      after: "paddle-hold-steady", delay: 2, seconds: 12,
      alert: "A crew member near the shade tent looks flushed and unsteady on their feet — the heat index just ticked up a category.",
      cue: "Send them to the medic tent and call it in over the location radio.",
      target: "medic-radio-loc",
      why: "An early heat-illness sign is the moment the plan is actually for, and calling it in over the radio — rather than just walking them to shade and hoping — is what gets a medic looking at them before it becomes the emergency the plan was trying to prevent in the first place.",
      missNote: "Nobody called it in. The crew member sat down in the shade and nobody with medical training ever actually looked at them.",
      wrongNote: "Not the paddle — that answers traffic, not a person. The location radio is what reaches the medic.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, LOC_ACCENT);

    // ------------------------------------------------------------ the street
    const floor = box(g, 8.2, 0.05, 7.0, 0, 0.025, 0, 0xffffff, { rough: 0.95 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#2c2e30", base2: "#242628", lanes: 2, tarLines: 3 }), { repeat: 5, px: 512 }), { rough: 0.95, metal: 0.02, color: 0xb0b6bc });
    const closureLine = decal(g, 1.2, 1.2, 0.4, 0.011, -2.6, (cx, w, h) => safetyStripeFace(cx, w, h, { a: "#ff7043", b: "#1c1a17", stripes: 8 }), { px: 192 });
    closureLine.rotation.x = -Math.PI / 2;

    // ------------------------------------------------------------------ crew
    const flagger = standingFigure(g, 0.4, 0.9, { ry: -2.4, vest: LOC_ACCENT, helmet: false, cap: 0x2b2f34 });
    holoTag(flagger, "traffic control", 0, 2.0, 0, { css: LOC_CSS, w: 0.4 });
    void flagger;

    // ---------------------------------------------------------------- paddle
    const paddleRig = group(g, 0.9, 0, 0.6, -0.3);
    cyl(paddleRig, 0.02, 0.02, 1.1, 0, 0.55, 0, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 8 });
    const paddleFace = group(paddleRig, 0, 1.05, 0);
    box(paddleFace, 0.35, 0.35, 0.02, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    holoTag(paddleRig, "STOP/SLOW paddle", 0, 1.3, 0, { css: LOC_CSS, w: 0.36 });
    reg(hits, paddleRig, "stop-slow-paddle");
    const paddleHoldHit = box(paddleRig, 0.05, 0.3, 0.05, 0, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(paddleRig, "hold steady", 0, 0.75, 0, { css: LOC_CSS, w: 0.28 });
    reg(hits, paddleHoldHit, "paddle-hold");

    // ------------------------------------------------------------ blind corner
    const blindCorner = box(g, 0.5, 0.05, 0.5, -3.2, 0.03, -2.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "blind corner — stand here?", -3.2, 0.2, -2.6, { css: "#d2312b", w: 0.44 });
    reg(hits, blindCorner, "stand-in-blind-corner");

    // ---------------------------------------------------------------- cones
    coneCluster(g, 2.2, 0, -2.8, { count: 3 });
    coneCluster(g, -1.6, 0, -3.0, { count: 2 });
    waterBarrier(g, 3.0, 0, -1.0, { colour: LOC_ACCENT });
    const missingConeGap = box(g, 0.4, 0.05, 0.4, 0.4, 0.03, -3.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "gap in the cone line?", 0.4, 0.2, -3.0, { css: "#d2312b", w: 0.4 });
    reg(hits, missingConeGap, "missing-cone");

    // ------------------------------------------------------------ curb ramp
    const cart = toolChest(g, -2.6, -0.6, { ry: 0.4, color: 0x2b2b30 });
    const rampBlock = box(g, 0.4, 0.05, 0.4, -2.6, 0.03, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cart on the ramp?", -2.6, 0.2, -0.9, { css: "#d2312b", w: 0.4 });
    reg(hits, rampBlock, "blocked-crosswalk-ramp");
    void cart;

    // ---------------------------------------------------------- parked car
    const parkedCar = sedan(g, 3.2, 0, -3.6, { ry: 1.5, livery: { colour: 0x8fa9c4 } });
    holoTag(parkedCar, "car left on the block?", 0, 1.4, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, parkedCar, "unmarked-parked-car");

    // ------------------------------------------------------ fire lane hazard
    const fireLaneGear = box(g, 0.4, 0.2, 0.3, 1.3, 0.1, 2.8, 0x2b3138, { rough: 0.6 });
    holoTag(g, "fire lane — clear it?", 1.3, 0.4, 2.8, { css: "#d2312b", w: 0.4 });
    reg(hits, fireLaneGear, "block-fire-lane");

    // ------------------------------------------------------- cable crossing
    const cableCrossHit = box(g, 0.6, 0.04, 0.1, -0.6, 0.02, 2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "bare cable — no ramp?", -0.6, 0.2, 2.4, { css: "#d2312b", w: 0.42 });
    reg(hits, cableCrossHit, "skip-cable-ramp");

    // ------------------------------------------------------------------ van
    const van = cargoVan(g, -2.4, 0, -2.0, { ry: 0, livery: { colour: 0xdfe4e8, fleetName: "PRODUCTION", unitNumber: "VAN 2" } });
    reg(hits, van, "production-van");
    holoTag(van, "production van", 0, 2.2, 0, { css: LOC_CSS, w: 0.36 });
    const reverseHit = box(g, 0.5, 0.3, 0.4, -2.4, 0.2, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cross behind reversing?", -2.4, 0.5, -1.1, { css: "#d2312b", w: 0.44 });
    reg(hits, reverseHit, "cross-behind-reversing-van");

    // A second, hidden resident's car for the interruption.
    const residentCar = sedan(g, -0.4, 0, -4.6, { ry: 3.14159, livery: { colour: 0x6b6f74 } });
    residentCar.visible = false;

    // -------------------------------------------------------------- base camp
    siteOffice(g, 3.4, 0, 2.6, {});
    const tent = group(g, 2.2, 0, 1.6, 0.3);
    box(tent, 1.4, 0.02, 1.0, 0, 1.7, 0, 0xdfe4e8, { rough: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(tent, 0.02, 0.02, 1.68, sx * 0.65, 0.84, sz * 0.45, 0xdfe4e8, { rough: 0.5, seg: 8 });
    holoTag(tent, "shade tent", 0, 1.9, 0, { css: LOC_CSS, w: 0.28 });
    const heatWarnLamp = box(tent, 0.05, 0.05, 0.02, 0, 1.3, 0.5, 0xd2312b, { rough: 0.4, emissive: 0xd2312b, ei: 0, cast: false });

    const cooler = group(g, 1.7, 0, 0.9, 0.4);
    box(cooler, 0.36, 0.36, 0.28, 0, 0.18, 0, 0xf2c14b, { rough: 0.6 });
    const coolerGauge = instrument(cooler, 0, 0.4, 0, { idle: "-- %", color: LOC_ACCENT, w: 0.12, d: 0.1 });
    holoTag(cooler, "hydration cooler", 0, 0.6, 0, { css: LOC_CSS, w: 0.34 });
    reg(hits, coolerGauge, "hydration-gauge");
    const fillSlot = box(cooler, 0.1, 0.03, 0.1, 0, 0.37, 0.16, 0x8b949d, { rough: 0.5, metal: 0.5 });
    holoTag(cooler, "fill slot", 0, 0.5, 0.16, { css: LOC_CSS, w: 0.24 });
    reg(hits, fillSlot, "hydration-cooler-slot");
    const jug = group(g, 1.3, 0, 1.6, 0.2);
    cyl(jug, 0.1, 0.12, 0.3, 0, 0.15, 0, 0x9fd3ea, { rough: 0.4, metal: 0.1, seg: 12, transparent: true, opacity: 0.85 });
    holoTag(jug, "water jug", 0, 0.36, 0, { css: LOC_CSS, w: 0.24 });
    reg(hits, jug, "water-jug");

    const heatBoard = instrument(g, 2.6, 0.9, 0.8, { ry: -0.4, idle: "HEAT: --", color: LOC_ACCENT, w: 0.14, d: 0.16 });
    holoTag(heatBoard, "heat index board", 0, 0.18, 0, { css: LOC_CSS, w: 0.36 });
    reg(hits, heatBoard, "heat-index-board");

    const adRadioProp = instrument(g, -0.6, 0.9, 1.9, { ry: 0.4, idle: "AD — CH 1", color: LOC_ACCENT, w: 0.1, d: 0.16 });
    holoTag(adRadioProp, "AD channel", 0, 0.16, 0, { css: LOC_CSS, w: 0.3 });
    reg(hits, adRadioProp, "ad-radio-loc");
    const allClearRadioProp = instrument(g, -1.5, 0.9, 1.1, { ry: 0.6, idle: "ALL CLEAR", color: LOC_ACCENT, w: 0.12, d: 0.16 });
    holoTag(allClearRadioProp, "all-clear call", 0, 0.16, 0, { css: LOC_CSS, w: 0.34 });
    reg(hits, allClearRadioProp, "all-clear-radio");
    const heatBreakRadioProp = instrument(g, 0.6, 0.9, 2.5, { ry: -0.7, idle: "BREAK — CH 3", color: LOC_ACCENT, w: 0.12, d: 0.16 });
    holoTag(heatBreakRadioProp, "heat break call", 0, 0.16, 0, { css: LOC_CSS, w: 0.36 });
    reg(hits, heatBreakRadioProp, "heat-break-radio");
    const medicRadioProp = instrument(g, 3.0, 0.9, 1.0, { ry: -1.0, idle: "MEDIC — CH 9", color: LOC_ACCENT, w: 0.12, d: 0.16 });
    holoTag(medicRadioProp, "medic call", 0, 0.16, 0, { css: LOC_CSS, w: 0.32 });
    reg(hits, medicRadioProp, "medic-radio-loc");

    // ------------------------------------------------------------------ ppe
    const rack = group(g, -3.4, 0, 0.6, 0.3);
    cyl(rack, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.18, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vest = box(rack, 0.3, 0.3, 0.06, 0, 1.0, 0, LOC_ACCENT, { rough: 0.7 });
    holoTag(rack, "hi-vis vest", 0, 1.25, 0, { css: LOC_CSS, w: 0.28 });
    reg(hits, vest, "hivis-vest");

    // -------------------------------------------------------------- paperwork
    const permit = holoPanel(g, 1.0, 0.7, -3.6, 1.35, 0.4, (cx, w, h) => {
      cx.fillStyle = "#241608"; cx.fillRect(0, 0, w, h); cx.fillStyle = LOC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fde9d8"; cx.fillText("LOCATION PERMIT", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#f7ecd8";
      ["Closure window: per the permit's own hours", "Block limits: this street only", "Fire lane: stays open the whole closure",
       "Heat plan: breaks per the index category", "Reopen on time — the next block's permit starts after"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.125)));
    }, { ry: 0.7, accent: LOC_ACCENT });
    reg(hits, permit, "permit-board");

    const log = holoPanel(g, 0.6, 0.42, -3.6, 1.3, -1.6, (cx, w, h) => {
      cx.fillStyle = "#241608"; cx.fillRect(0, 0, w, h); cx.fillStyle = LOC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fde9d8"; cx.fillText("WRAP LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f7ecd8";
      ["Closure: —", "Finds: —", "Heat break: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.3, accent: LOC_ACCENT });
    reg(hits, log, "wrap-log");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ppe-donning") vest.visible = false;
        if (step.id === "street-sweep") { /* finds stay visible as evidence */ }
        if (step.id === "paddle-to-stop") paddleFace.rotation.y = Math.PI;
        if (step.id === "water-jug-refill") jug.visible = false;
        if (step.id === "heat-break-call") repaint(heatBoard.userData.screen, signFace("BREAK CALLED", { bg: "#0d2b16", accent: "#59c97b", fg: "#d8f5e0", scale: 0.4 }));
        if (step.id === "wrap-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#241608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fde9d8"; cx.fillText("WRAP LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Closure: reopened on time", "Finds: car moved, ramp cleared", "Heat break: taken, cooler refilled"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "resident-car-turns-in") { residentCar.visible = true; }
        if (it.id === "heat-illness-sign") {
          heatWarnLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4, rough: 0.4 });
          repaint(heatBoard.userData.screen, signFace("HEAT UP", { bg: "#2b0d0d", accent: "#d2312b", fg: "#ffd8d8", scale: 0.5 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "resident-car-turns-in") { residentCar.visible = false; }
        if (it.id === "heat-illness-sign") {
          heatWarnLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 0, rough: 0.4 });
          repaint(heatBoard.userData.screen, signFace("MONITORED", { bg: "#0d2b16", accent: "#59c97b", fg: "#d8f5e0", scale: 0.45 }));
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "paddle-to-stop") paddleFace.rotation.y = session.turn.amount * Math.PI;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "hydration-cooler-check") repaint(coolerGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}`, { bg: "#0d1c24", accent: gg.t >= 0.55 && gg.t <= 0.85 ? "#59c97b" : "#f2ae14", fg: "#f7ecd8", scale: 0.6 }));
        if (step?.id === "paddle-hold-steady" && session.holding) paddleFace.rotation.x = (session.track.v - 0.5) * 0.4;
        void dt; void t; void CITY;
      },
    };
  },
};
