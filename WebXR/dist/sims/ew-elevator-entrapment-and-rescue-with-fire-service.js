import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
  gradientFill, noiseTexture, grimeOverlay,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag,
  standingFigure, surfaceTexture, texturedMat, paintedSteelFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Elevator Entrapment and Rescue with Fire Service VR — IUEC
// elevator constructors, coordinated with a responding fire company. A
// stalled car with passengers inside is answered in a fixed order for one
// reason: every faster-looking shortcut in this job assumes something about
// where the car actually is, and the one thing an entrapment call never
// gives a mechanic for free is where the car actually is.

const EWENT_ACCENT = 0xd8232a;

/** Dark lobby tile: near-black stone with a faint warm undertone. */
function ewentTileFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#2a2624"], [1, o.base2 ?? "#221f1d"]]);
  noiseTexture(g, w, h, { density: 1400, alpha: 0.06, tone: "255,240,220" });
  const tiles = o.tiles ?? 4, t = w / tiles;
  g.fillStyle = "rgba(0,0,0,0.4)";
  for (let i = 0; i <= tiles; i++) { g.fillRect(i * t - 1, 0, 2, h); g.fillRect(0, i * t - 1, w, 2); }
}

export const SIM_EW_ELEVATOR_ENTRAPMENT_AND_RESCUE_WITH_FIRE_SERVICE = {
  id: "ew-elevator-entrapment-and-rescue-with-fire-service",
  index: "359",
  domain: "Facilities",
  trade: "Elevator constructor / mechanic — IUEC",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "IUEC elevator constructors coordinating with a responding fire company; NEIEP apprenticeship curriculum for entrapment and rescue procedure; ASME A17.1 the safety code for elevators and escalators, whose emergency operation and manual lowering provisions this station follows; OSHA 29 CFR 1910.147 control of hazardous energy for the drive isolation during manual lowering",
  name: "Elevator Entrapment and Rescue with Fire Service",
  title: simTitle("Elevator Entrapment and Rescue with Fire Service"),
  tagline: "Confirming the car's true position before anything else, then a controlled hand-crank lowering, a level check, a bridge across the sill gap and a coordinated release of the passengers",
  accent: EWENT_ACCENT,
  accentCss: "#d8232a",
  parSeconds: 270,
  footprint: 2.2,
  badge: { id: "rescue-certified", name: "Rescue Certified", note: "A passenger rescue completed with the car's position confirmed before every door opened and the brake never released uncontrolled" },

  game: system({
    name: "Rescue Authority",
    currency: "LEVEL",
    ranks: ["Helper", "Rescue Mechanic", "Adjuster", "Lead Mechanic", "Rescue Authority Certified"],
    badges: [
      { id: "position-first", name: "Position First", note: "Never opened a landing door before the car's position was confirmed", test: AWARD.stepClean("door-unlock") },
      { id: "steady-lower", name: "Steady Lower", note: "Held the hand-crank descent and the level reading near band centre", test: AWARD.precise(0.7) },
      { id: "clean-restore", name: "Clean Restore", note: "Restored in the correct order, no correction", test: AWARD.stepClean("restore") },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "crank-held", name: "Crank Held", note: "Never let the hand crank slip out of the controlled speed band", test: AWARD.unbroken },
      { id: "rescue-fast", name: "Rescue Fast", note: "Passengers clear inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "premature-door-open": "You unlocked the landing door before the car's position was confirmed. A hoistway door opens onto whatever is actually behind it, and if that is bare shaft instead of a car sill, the person standing in the doorway has no floor at all — passengers included.",
    "uncontrolled-brake-release": "You released the machine brake without the hand crank already under control. The brake is the one thing holding this car and its counterweight still with no power available, and letting it go with nothing else managing the descent turns a controlled rescue into a free-falling one.",
    "self-evacuation-gap": "A passenger climbed toward a partly open door before the bridge was in place. The gap between an unlevel car and the landing sill is exactly wide enough to swallow a foot or a leg, and it is there for as long as the car sits anywhere other than dead level with the floor.",
    "residual-drift-zone": "You stood under the crosshead while the car still had residual movement from the hand-crank lowering. A car brought down by hand does not stop the instant the crank stops turning, and standing under it on that assumption is trusting a machine that nobody has yet proven fully at rest.",
  },

  lateNotes: {
    "hand-crank-wheel": "The crank is only turned once the drive is proven dead and the brake guard is confirmed with both rescuers ready.",
    "emergency-door-release": "The landing door is only unlocked once the car is confirmed level and the sill gap is bridged.",
  },

  supportLine: "your IUEC local's member assistance programme, or the NEIEP training coordinator for anything about the certification record — and 988, or the department's own peer support line, for anyone who found this call harder to shake than expected",

  steps: [
    {
      id: "checkin", kind: "select", target: "job-ticket",
      title: "Check in with the responding company",
      cue: "Read the dispatch ticket and confirm the car and floor range with the fire company on scene.",
      why: "An entrapment call often reaches the mechanic and the fire company from two different dispatchers, and the two accounts do not always agree on which car or which floor — the ticket is read together, out loud, before either side commits to a plan for a car neither of them has actually seen yet.",
    },
    {
      id: "intercom", kind: "select", target: "passenger-intercom",
      title: "Talk to the passengers",
      cue: "Open the car's intercom and confirm how many people are inside and whether anyone needs medical attention.",
      why: "Everything about how urgent this rescue actually is comes from what the passengers say on this intercom, not from how long the call has been open. A calm, uninjured group waiting for a scheduled rescue is a different job than one person reporting chest pain, and the plan only starts once that difference is known.",
    },
    {
      id: "hazard-scan", kind: "find", noHint: true,
      targets: ["smoke-odor", "water-in-shaft", "heat-at-door"],
      itemNames: { "smoke-odor": "a trace of smoke odor at the landing", "water-in-shaft": "water pooling at the base of the hoistway", "heat-at-door": "a landing door warm to the back of the hand" },
      itemNotes: {
        "smoke-odor": "Smoke at the landing changes this from a mechanical entrapment into a fire response, and everything after this point — whether anyone approaches the shaft at all — is decided by the fire company first, not by the rescue plan already in mind.",
        "water-in-shaft": "Standing water at the base of a hoistway with a stalled car in it is a shock hazard next to every piece of electrical equipment down there, and it gets called out before anyone's hands go near a disconnect that might be sitting in it.",
        "heat-at-door": "A landing door that is warm to the back of a bare hand is a door with something burning on the other side of it, and it does not get opened on a rescue plan built for an ordinary mechanical stall.",
      },
      title: "Scan for fire and water hazards before anything else",
      cue: "Check the landing and the shaft base for smoke, standing water and heat. Three signs change this whole plan if any of them are present.",
      why: "A mechanical entrapment and a fire behind the same door look identical from the lobby side, and the plan this station teaches only applies to the first one — so the first real decision on every call is confirming which one this actually is, before a single tool comes out.",
    },
    {
      id: "attempt-recall", kind: "select", target: "recall-panel",
      title: "Attempt normal recall first",
      cue: "Try to bring the car to a floor on normal power before anything else is attempted.",
      why: "If this car can still be moved to a floor under its own power, that is the fastest and least hazardous rescue available, and it is always tried first — manual lowering is the answer to a car that recall has already failed to move, not a shortcut around trying recall at all.",
    },
    {
      id: "position-check", kind: "gauge", target: "car-position-indicator",
      title: "Confirm the car's actual position",
      cue: "Read the position indicator and commit once the car's location relative to the nearest floor is confirmed.",
      why: "Every step after this one assumes a specific answer to where the car actually is, and that answer comes off the position indicator, not off which floor the passengers say they think they are near. A car resting a metre below a landing looks, from inside, very much like a car resting at one.",
      gauge: {
        label: "CAR POSITION", speed: 0.55, green: [0.44, 0.56],
        readout: (t) => (t > 0.44 && t < 0.56 ? "NEAR LANDING 4" : t < 0.44 ? "BELOW LANDING 4" : "ABOVE LANDING 4"),
        missNote: "Position not confirmed. Read the indicator again before anyone touches a door or a disconnect.",
      },
    },
    {
      id: "disconnect", kind: "turn", target: "main-disconnect",
      title: "Isolate the drive for manual lowering",
      cue: "Pull the machine room's main disconnect firmly to its open stop.",
      why: "Manual lowering only works, and only stays predictable, on a machine with no power available to it at all — a drive that could receive power partway through a hand-crank lowering is a car that could suddenly answer to something other than the crank in a rescuer's hands.",
      turn: { turns: 0.2, axis: "z", reverse: true, label: "MAIN LINE DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lockout-hasp",
      title: "Lock and tag the disconnect",
      cue: "Apply your padlock and tag before the brake guard comes off.",
      why: "The lock is what keeps this car's isolation from being anyone else's decision to end while the crank and the brake are both actively being managed by hand a few feet away from a hoistway with passengers still inside it.",
    },
    {
      id: "verify-zero", kind: "gauge", target: "drive-meter",
      title: "Verify zero energy at the drive",
      cue: "Meter the drive input and commit when it reads dead.",
      why: "A locked disconnect is a claim about the switch; the meter is the only proof about the motor itself, read against a known-live source first so a failed meter cannot hand back a comfortable false dead right before the brake is touched.",
      gauge: {
        label: "DRIVE INPUT — VOLTAGE", speed: 0.6, green: [0.0, 0.08],
        readout: (t) => `${Math.round(t * 480)} V`,
        missNote: "Still reading live. Recheck the disconnect before the brake guard comes off.",
      },
    },
    {
      id: "brake-guard", kind: "select", target: "brake-release-lever-guard",
      title: "Confirm both rescuers are in position",
      cue: "Confirm the fire service partner is at the hand crank before the brake release guard comes off.",
      why: "Manual lowering is a two-person operation by design — one hand on the brake release, one hand on the crank — and the guard does not come off until both of those hands are actually where the procedure needs them, not on the assumption that the other person is ready.",
    },
    {
      id: "hand-crank", kind: "track", target: "hand-crank-wheel", seconds: 8,
      title: "Lower the car on the hand crank",
      cue: "Turn the crank and hold the descent speed inside the controlled band as the brake eases open.",
      why: "The crank and the brake move together on purpose — the brake easing open is what lets the car move at all, and the crank is what keeps that movement slow enough for a rescuer to stop it the instant something looks wrong. Losing that band even briefly is losing the one thing distinguishing a lowering from a drop.",
      track: { start: 0.2, green: [0.4, 0.6], rise: 0.5, fall: 0.45, drift: 0.1, label: "LOWERING SPEED", readout: (v) => (v < 0.4 ? "too slow — brake dragging" : v > 0.6 ? "too fast — losing control" : "controlled") },
      holdBreakNote: "The crank slipped out of the controlled band. Take it again and bring the descent back inside the band before continuing.",
    },
    {
      id: "level-check", kind: "gauge", target: "landing-level-gauge",
      title: "Confirm the car is level with the landing",
      cue: "Read the level indicator and commit once the car sits inside the level band.",
      why: "A car brought down by hand is stopped by feel, and feel is not accurate enough on its own to trust a door to. The level indicator is what actually confirms the car sill and the landing sill line up close enough for someone to step across safely.",
      gauge: {
        label: "LANDING LEVEL", speed: 0.55, green: [0.44, 0.56],
        readout: (t) => (t > 0.44 && t < 0.56 ? "LEVEL" : t < 0.44 ? "LOW" : "HIGH"),
        missNote: "Not level. Take the crank again and bring the car back into the level band before anyone approaches the door.",
      },
    },
    {
      id: "bridge-gap", kind: "drag", target: "step-bridge",
      title: "Bridge the sill gap",
      cue: "Carry the bridge plate across from the car sill to the landing sill before the door is unlocked.",
      why: "Even a car confirmed level can leave a small gap at the sill, and the bridge plate closes that gap before it becomes something a frightened passenger steps into on their way out rather than across.",
      drag: { to: "landing-sill", radius: 0.4, missNote: "Not seated across the sill. A bridge plate resting anywhere else still leaves the actual gap open underneath it." },
    },
    {
      id: "door-unlock", kind: "select", target: "emergency-door-release",
      title: "Unlock the landing door",
      cue: "Use the emergency release to unlock the landing door now that the car is level and bridged.",
      why: "This is the door a passenger is about to walk through with their eyes on the lobby, not on the sill, and it is only unlocked once every check ahead of it — position, level, bridge — has actually been satisfied rather than assumed to be close enough.",
    },
    {
      id: "restore", kind: "sequence",
      targets: ["lockout-hasp", "main-disconnect"],
      itemNames: { "lockout-hasp": "your lock off the hasp", "main-disconnect": "main line disconnect" },
      title: "Close out the isolation in the correct order",
      cue: "Take your lock off the hasp once everyone is clear of the car, then close the main disconnect.",
      why: "The lock comes off only once every passenger and every rescuer is clear of the hoistway, and the disconnect is closed last because it is the one thing that turns this car back into a machine capable of moving on its own again.",
      outOfOrderNote: "Wrong order — your lock off first, once everyone is clear, and the disconnect closed last.",
    },
    {
      id: "log", kind: "select", target: "rescue-log",
      title: "Log the rescue",
      cue: "Write the car's position, the lowering method and the time passengers cleared on the rescue log.",
      why: "This log is what the building's next inspection and the fire company's own incident report both draw from, and a rescue that goes unwritten in detail is one nobody can learn anything from the next time a car stalls with people inside it.",
    },
  ],

  interrupts: [
    {
      id: "passenger-forces-door",
      kind: "Passenger forcing the door",
      after: "attempt-recall", delay: 4, seconds: 12,
      alert: "A passenger inside the car has started prying at the door, trying to force it open from inside before the position is confirmed.",
      cue: "Get back on the intercom and get them to stop.",
      target: "passenger-intercom",
      why: "A door forced open from inside a car whose position nobody has confirmed yet is exactly the premature-opening hazard this whole procedure is built to prevent, except from the one side nobody outside the car can physically stop by hand. The intercom is the only tool that reaches them in time.",
      missNote: "The prying continued with no word from the intercom. A passenger who forces a car door open onto an unconfirmed position finds out what is actually on the other side of it the same way anyone else would — by stepping into it.",
      wrongNote: "It is the intercom. Whatever else this rescue needs, the passenger trying to force the door needs to hear a voice telling them to stop right now.",
    },
    {
      id: "partner-rushes-brake",
      kind: "Brake guard interfered with",
      after: "hand-crank", delay: 4, seconds: 11,
      alert: "The fire service partner at the crank has started to ease the brake further open on their own, ahead of your signal.",
      cue: "Stop them — the descent is only controlled if it is controlled together.",
      target: "brake-release-lever-guard",
      why: "Manual lowering only stays predictable when the brake and the crank move on one shared signal, and a partner who eases the brake open without that signal has just taken the one variable that was supposed to be jointly controlled and made it theirs alone.",
      missNote: "The brake kept easing open without a shared signal. A lowering that only one of two rescuers is actually controlling is not a controlled lowering — it is a controlled crank attached to an uncontrolled brake.",
      wrongNote: "It is the brake release guard. Whatever the partner intends, this only works if the brake and the crank move together.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, EWENT_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => ewentTileFace(cx, w, h, {}), { repeat: 3, px: 320 });
    const floor = box(g, 4.6, 0.1, 4.2, 0, 0.05, 0, 0x2a2624, { rough: 0.6, metal: 0.05 });
    floor.material = texturedMat(floorTex, { rough: 0.55, metal: 0.05, color: 0x2a2624 });

    // -------------------------------------------------------------- hoistway
    const wallTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#5a4646", base2: "#4a3939" }), { repeat: 2, px: 320 });
    const wallMat = () => texturedMat(wallTex, { rough: 0.6, metal: 0.3, color: 0x5a4646 });
    const shaft = group(g, 0, 0, -1.4);
    const back = box(shaft, 2.4, 3.0, 0.2, 0, 1.5, -0.9, 0x5a4646, { rough: 0.6 });
    back.material = wallMat();
    const sideL = box(shaft, 0.2, 3.0, 1.8, -1.2, 1.5, 0, 0x5a4646, { rough: 0.6 });
    sideL.material = wallMat();
    const sideR = box(shaft, 0.2, 3.0, 1.8, 1.2, 1.5, 0, 0x5a4646, { rough: 0.6 });
    sideR.material = wallMat();

    // The stalled car, resting slightly below the landing.
    const car = group(shaft, 0, 0.65, -0.15);
    box(car, 0.9, 1.1, 0.86, 0, 0.55, 0, 0x36414b, { rough: 0.55, metal: 0.3 });
    const carRoof = box(car, 0.9, 0.03, 0.86, 0, 1.1, 0, 0x2b3339, { rough: 0.55, metal: 0.4 });
    void carRoof;
    holoTag(car, "Car — position unconfirmed", -0.5, 1.2, 0, { css: "#d8232a", w: 0.5 });

    const crosshead = box(shaft, 2.2, 0.14, 0.5, 0, 2.9, -0.6, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    void crosshead;
    const driftZone = box(shaft, 0.5, 0.4, 0.5, 0, 2.1, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(driftZone, "Residual movement — stand clear", 0, 0.2, 0, { css: "#f0645b", w: 0.55 });
    reg(hits, driftZone, "residual-drift-zone");

    // Landing at the top with the door, sill and emergency release.
    const landing = group(g, 0, 0, -0.55);
    box(landing, 1.0, 2.2, 0.1, 0, 1.1, -0.9, 0x6f7a83, { rough: 0.5, metal: 0.4 });
    const landingDoor = group(landing, -0.44, 1.1, -0.85);
    box(landingDoor, 0.86, 2.1, 0.03, 0.43, 0, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    const doorGapZone = box(landing, 0.9, 0.3, 0.06, 0, 0.1, -0.83, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(doorGapZone, "Sill gap — bridge first", 0, 0.16, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, doorGapZone, "premature-door-open");
    const selfEvacZone = box(landing, 0.4, 0.2, 0.1, 0.2, 0.05, -0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(selfEvacZone, "no self-evacuation", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, selfEvacZone, "self-evacuation-gap");
    const releaseBox = group(landing, 0.4, 1.3, -0.83);
    box(releaseBox, 0.1, 0.12, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(releaseBox, "Emergency door release", 0, 0.12, 0, { css: "#d8232a", w: 0.36 });
    reg(hits, releaseBox, "emergency-door-release");
    const landingSill = box(landing, 0.9, 0.03, 0.06, 0, 0.02, -0.83, 0x53585e, { rough: 0.5, metal: 0.5 });
    reg(hits, landingSill, "landing-sill");

    const bridgePlate = group(g, 1.6, 0.05, 1.4);
    box(bridgePlate, 0.6, 0.02, 0.3, 0, 0.01, 0, 0xd8b23a, { rough: 0.5, metal: 0.4 });
    holoTag(bridgePlate, "Sill bridge plate", 0, 0.12, 0, { css: "#d8232a", w: 0.32 });
    reg(hits, bridgePlate, "step-bridge");

    // Intercom and recall panel on the car front.
    const intercom = group(car, 0.3, 0.4, 0.44, 0.2);
    box(intercom, 0.1, 0.14, 0.03, 0, 0, 0, 0x22272c, { rough: 0.5, metal: 0.4 });
    ball(intercom, 0.012, 0, 0.04, 0.02, 0xd8232a, { emissive: 0xd8232a, ei: 1.2 });
    holoTag(intercom, "Passenger intercom", 0, 0.14, 0, { css: "#d8232a", w: 0.32 });
    reg(hits, intercom, "passenger-intercom");

    const recallPanel = group(g, 1.7, 0, 0.5, -0.4);
    slab(recallPanel, 0.24, 0.3, 0.08, 0, 0.9, 0, 0x2b3138, { radius: 0.03, rough: 0.5, metal: 0.4 });
    decal(recallPanel, 0.18, 0.1, 0, 0.95, 0.041, signFace("RECALL", { accent: "#d8232a", scale: 0.5 }), { px: 128 });
    holoTag(recallPanel, "Recall panel", 0, 1.1, 0.06, { css: "#d8232a", w: 0.3 });
    reg(hits, recallPanel, "recall-panel");

    const positionIndicator = instrument(shaft, 0.9, 1.5, -0.4, { ry: 0.4, idle: "-- ", color: 0xd8232a });
    holoTag(positionIndicator, "Position indicator", 0, 0.16, 0, { css: "#d8232a", w: 0.36 });
    reg(hits, positionIndicator, "car-position-indicator");
    const levelGauge = instrument(shaft, -0.9, 1.0, -0.3, { ry: -0.4, idle: "-- ", color: 0xd8232a });
    holoTag(levelGauge, "Level indicator", 0, 0.16, 0, { css: "#d8232a", w: 0.32 });
    reg(hits, levelGauge, "landing-level-gauge");

    // Machine bed with the hand crank and the brake release guard.
    const bed = box(g, 1.6, 0.28, 1.0, 1.7, 0.14, -1.5, 0x53585e, { rough: 0.6, metal: 0.4 });
    void bed;
    const crankWheel = group(g, 1.7, 0.45, -1.5, 0.3);
    torus(crankWheel, 0.1, 0.016, 0, 0, 0, 0xd8232a, { rough: 0.5, seg: 10, seg2: 24 }).rotation.x = Math.PI / 2;
    holoTag(crankWheel, "Hand crank", 0, 0.16, 0, { css: "#d8232a", w: 0.3 });
    reg(hits, crankWheel, "hand-crank-wheel");
    const brakeGuard = group(g, 1.4, 0.5, -1.7, 0.2);
    box(brakeGuard, 0.1, 0.12, 0.05, 0, 0, 0, 0x22272c, { rough: 0.5, metal: 0.4 });
    const guardPin = cyl(brakeGuard, 0.012, 0.012, 0.08, 0.05, 0.04, 0, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 10 });
    guardPin.rotation.z = Math.PI / 2;
    holoTag(brakeGuard, "Brake release guard", 0, 0.14, 0, { css: "#d8232a", w: 0.36 });
    reg(hits, brakeGuard, "brake-release-lever-guard");
    const brakeReleaseZone = box(g, 0.15, 0.15, 0.1, 1.4, 0.5, -1.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(brakeReleaseZone, "controlled release only", 0, 0.12, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, brakeReleaseZone, "uncontrolled-brake-release");

    // ------------------------------------------------------------- controls
    const wall = group(g, -1.7, 0, -1.6, 0.5);
    slab(wall, 0.4, 1.0, 0.24, 0, 0.7, 0, 0x545e67, { radius: 0.03, rough: 0.5, metal: 0.5 });
    const discHandle = group(wall, 0, 0.95, 0.13);
    box(discHandle, 0.045, 0.14, 0.045, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    decal(wall, 0.32, 0.05, 0, 1.16, 0.125, signFace("MAIN LINE DISCONNECT", { accent: "#d8232a", scale: 0.4 }));
    reg(hits, discHandle, "main-disconnect");
    const hasp = torus(wall, 0.02, 0.006, 0.12, 0.58, 0.13, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, hasp, "lockout-hasp");
    const appliedLock = lockTag(wall, 0.12, 0.58, 0.15);
    appliedLock.visible = false;

    const driveMeter = instrument(g, -1.7, 0.5, -0.9, { ry: 0.4, idle: "-- V", color: 0xd8232a });
    holoTag(driveMeter, "CAT III meter", 0, 0.16, 0, { css: "#d8232a", w: 0.28 });
    reg(hits, driveMeter, "drive-meter");

    // ------------------------------------------------------------- docs
    const chest = toolChest(g, -1.7, 1.3, { ry: 0.6, color: 0xd8232a });
    void chest;

    const ticket = holoPanel(g, 0.5, 0.36, -1.9, 1.4, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f7c9c9"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DISPATCH — ENTRAPMENT", w * 0.06, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#eab8b8";
      ["Car 3, near landing 4", "Fire company on scene", "Confirm passenger count"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: 0.5, accent: 0xd8232a });
    reg(hits, ticket, "job-ticket");

    const logPanel = holoPanel(g, 0.5, 0.34, 1.9, 1.4, 1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d8232a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f7c9c9"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("RESCUE LOG — CAR 3", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#eab8b8";
      cx.fillText("Position, method and", w * 0.06, h * 0.48);
      cx.fillText("clear time, this call", w * 0.06, h * 0.68);
    }, { ry: -0.6, accent: 0xd8232a });
    reg(hits, logPanel, "rescue-log");

    // The fire service partner at the crank, and passengers waiting inside.
    // ---------------------------------------------------------- hazard scan
    const smokeWisp = particles(g, 14, 0x8a8478, { size: 0.02, life: 0.8, additive: false, opacity: 0.4 });
    const smokeMarker = box(landing, 0.06, 0.06, 0.06, 0.3, 1.8, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(smokeMarker, "Smoke odor", 0, 0.12, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, smokeMarker, "smoke-odor");
    const shaftWater = cyl(shaft, 0.3, 0.3, 0.01, 0, 0.01, -0.6, 0x1b2126, { rough: 0.3, metal: 0.1, seg: 18, opacity: 0.5, transparent: true, cast: false });
    reg(hits, shaftWater, "water-in-shaft");
    const doorHeatMarker = box(landing, 0.5, 0.4, 0.02, -0.3, 1.4, -0.86, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(doorHeatMarker, "Warm to the touch", 0, 0.12, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, doorHeatMarker, "heat-at-door");

    // ---------------------------------------------------------- room dressing
    const tray = group(g, 0, 2.7, 1.2);
    box(tray, 3.6, 0.06, 0.3, 0, 0, 0, 0x596069, { rough: 0.6, metal: 0.4, cast: false });
    for (let i = 0; i < 8; i++) box(tray, 0.02, 0.05, 0.3, -1.7 + i * 0.48, -0.03, 0, 0x3c444c, { cast: false, receive: false });
    for (let i = 0; i < 3; i++) {
      const cable = cyl(g, 0.014, 0.014, 0.5, -1.5 + i * 0.6, 2.4, 1.2, 0x1b1e22, { rough: 0.85, seg: 8, cast: false });
      cable.rotation.x = Math.PI / 2;
    }
    const shelf = group(g, -2.0, 0, -1.6, 0.4);
    box(shelf, 0.5, 0.03, 0.3, 0, 0.55, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    box(shelf, 0.5, 0.03, 0.3, 0, 0.9, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const [sx, sy] of [[-0.14, 0.58], [0.05, 0.58], [-0.05, 0.93], [0.12, 0.93]]) {
      box(shelf, 0.13, 0.05, 0.18, sx, sy, 0, 0x2b3138, { rough: 0.55, metal: 0.4 });
    }
    holoTag(shelf, "Rescue kit", 0, 1.02, 0, { css: "#d8232a", w: 0.3 });
    const extinguisher = group(g, 2.1, 0, 1.9, -0.2);
    cyl(extinguisher, 0.05, 0.06, 0.28, 0, 0.5, 0, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 12 });
    cyl(extinguisher, 0.015, 0.02, 0.06, 0, 0.67, 0, 0x22272c, { rough: 0.4, metal: 0.6, seg: 10 });
    const radio = group(g, -1.5, 0.3, 1.6, 0.3);
    box(radio, 0.06, 0.1, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5 });
    holoTag(radio, "Incident radio", 0, 0.1, 0, { css: "#d8232a", w: 0.3 });

    const partner = standingFigure(g, 0.2, 2.0, { ry: 3.0, cloth: 0x8a2f2f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(partner, "fire service partner", 0, 1.95, 0, { css: "#d8232a", w: 0.4 });
    const partnerHome = partner.position.clone();

    const passenger = standingFigure(car, 0, -0.15, { ry: 0, cloth: 0x3a4a55, atStation: true });
    void passenger;

    let live = true, lowering = false;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "disconnect") { live = false; discHandle.rotation.z = Math.PI / 2; }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "brake-guard") guardPin.rotation.x = 0.8;
        if (step.id === "bridge-gap") bridgePlate.position.set(0, 0.02, -0.83);
        if (step.id === "door-unlock") landingDoor.rotation.y = 1.1;
        if (step.id === "restore") {
          appliedLock.visible = false; discHandle.rotation.z = 0; live = true; lowering = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "passenger-forces-door") landingDoor.position.x += 0.03;
        if (it.id === "partner-rushes-brake") { partner.position.set(1.8, partnerHome.y, -1.3); guardPin.rotation.x = 0.3; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "passenger-forces-door") landingDoor.position.x -= 0.03;
        if (it.id === "partner-rushes-brake") { partner.position.copy(partnerHome); guardPin.rotation.x = 0.8; }
      },

      animate(t, dt, session) {
        void live;
        const tk = session?.track;
        if (session?.step?.id === "hand-crank" && tk) {
          lowering = true;
          crankWheel.rotation.z += dt * 3;
          car.position.y = Math.max(0.1, car.position.y - tk.v * dt * 0.1);
        }
        void lowering;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "position-check") {
            const label = gg.t > 0.44 && gg.t < 0.56 ? "NEAR LANDING 4" : gg.t < 0.44 ? "BELOW LANDING 4" : "ABOVE LANDING 4";
            repaint(positionIndicator.userData.screen, signFace(label, { bg: "#0d1c24", accent: label === "NEAR LANDING 4" ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.32 }));
          }
          if (session.step?.id === "verify-zero") {
            const v = Math.round(gg.t * 480);
            repaint(driveMeter.userData.screen, signFace(`${v} V`, { bg: "#0d1c24", accent: v < 38 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
          }
          if (session.step?.id === "level-check") {
            const label = gg.t > 0.44 && gg.t < 0.56 ? "LEVEL" : gg.t < 0.44 ? "LOW" : "HIGH";
            repaint(levelGauge.userData.screen, signFace(label, { bg: "#0d1c24", accent: label === "LEVEL" ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
          }
        }
      },
    };
  },
};
