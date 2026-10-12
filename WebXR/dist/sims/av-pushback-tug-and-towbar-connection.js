import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument,
  standingFigure, surfaceTexture, texturedMat, palette, asphaltFace, concreteFace,
  gratingFace, safetyStripeFace, reg,
} from "../citykit.js";
import { regionalJet, pushbackTug } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pushback Tug & Towbar Connection VR — its own gamified
// system: Push Authority.
//
// The ramp crew's own procedure for pushing a jet off the gate: the towbar
// inspected before it ever touches the nose gear, the steering bypass pin
// seated so the tug's own force never reaches the nosewheel's hydraulics,
// headset comms confirmed with the flight deck before a single chock comes
// off, the parking brake released only on the flight deck's own word, the
// push held on line and the nosewheel steered straight the whole way, and
// the brake set and confirmed again before anything is disconnected. No
// shear-pin rating, tow speed limit or aircraft weight here is one this
// platform is certain of — those live on the pushback plan itself.

const AVPB_ACCENT = 0x2f8fdb;

export const SIM_AV_PUSHBACK_TUG_AND_TOWBAR_CONNECTION = {
  id: "av-pushback-tug-and-towbar-connection",
  index: "av-2",
  domain: "Aviation",
  trade: "Pushback tug operator and headset agent — IAM/TWU ramp crew",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "IAM and TWU ramp training; FAA 14 CFR Part 121 air carrier ground-handling operations and 14 CFR Part 139 movement-area operations; OSHA 29 CFR 1910.178 powered industrial trucks and 29 CFR 1910.132 personal protective equipment",
  name: "Pushback Tug & Towbar Connection",
  title: simTitle("Pushback Tug & Towbar Connection"),
  tagline: "A jet pushed off the gate: the towbar inspected and connected, the steering bypass pin seated, headset comms confirmed with the flight deck before a chock moves, the brake released only on their word, the push held on line, and the brake set and confirmed again before anything is disconnected",
  accent: AVPB_ACCENT,
  accentCss: "#2f8fdb",
  parSeconds: 310,
  footprint: 2.9,
  badge: { id: "push-authority", name: "Push Authority", note: "Bypass pin seated, brakes released and set only on the flight deck's own word, and the headset never disconnected before the final signal" },

  game: system({
    name: "Push Authority",
    currency: "PUSH",
    ranks: ["Ramp Hand", "Tug Qualified", "Headset Agent", "Lead Pushback", "Push Authority Certified"],
    badges: [
      { id: "pin-first", name: "Pin First", note: "Never pushed without the steering bypass pin seated", test: AWARD.stepClean("install-bypass-pin") },
      { id: "brake-word", name: "Brake on Their Word", note: "Never moved the aircraft without the flight deck's own confirmation", test: AWARD.safe },
      { id: "steady-push", name: "Steady Push", note: "Held the tow speed and the steering near band centre the whole push", test: AWARD.precise(0.72) },
      { id: "clean-connect", name: "Clean Connect Certified", note: "Connected the towbar clean, first time", test: AWARD.stepClean("attach-towbar") },
    ],
    challenges: [
      { id: "quick-push", name: "Quick Push", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "push-streak", name: "Push Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IAM or TWU local's member assistance programme, or the site's employee assistance line if a close call under the nose gear is what stayed with you",

  hazards: {
    "push-blind-hazard": "That pushes the aircraft before the flight deck confirmed the parking brake is released. A brake that is still set fights the tug's own force straight through the towbar and the nose gear, and the crew has no way to feel that resistance from the tug's own seat before something in that load path gives.",
    "skip-bypass-pin-hazard": "That skips the steering bypass pin. Without it, the tug's own force is fed straight into the nosewheel's steering linkage every time the tow turns, and that is exactly the load path that bends a steering collar or tears a hydraulic line the crew will not find until the aircraft's own steering fails on a taxi it should never have failed on.",
    "tow-path-stand-hazard": "You are standing in the tow path while the aircraft is moving. A jet under tow does not stop for a person the way it would for an obstacle a driver could see coming — the tug operator's own view down the fuselage is already partly blocked, and the tow path is kept clear so that blind spot never has to matter.",
    "early-disconnect-hazard": "That disconnects the headset before the final brakes-set signal was given. The headset is the only open line to the flight deck for the entire push, and cutting it before the last confirmation means nobody has a way to tell the crew if something is wrong with the aircraft in the last few seconds before the tug actually clears it.",
  },

  lateNotes: {
    "bypass-pin": "The bypass pin goes in before the tug ever takes a load, not fitted afterward once the tow is already under way.",
    "engine-status": "The flight deck sets and confirms the parking brake before the towbar is disconnected, not after.",
  },

  interrupts: [
    {
      id: "vehicle-enters-tow-path",
      kind: "Tow-path incursion",
      after: "push-back", delay: 5, seconds: 12,
      alert: "A catering truck has turned into the tow path just ahead of the tail, well inside the aircraft's own swept path under tow.",
      cue: "Stop the tug now — nothing crosses the tow path while the aircraft is moving.",
      target: "tow-path-stop",
      why: "The tug operator's own view down the fuselage cannot cover the ground the tail is about to sweep, and the only real defence against a vehicle that wanders into that path is a crew that stops the push the instant it is no longer clear, not one that trusts the vehicle to notice first.",
      missNote: "The push kept going while the truck was still in the tail's own swept path. A jet under tow takes far longer to stop than the tug itself does, which is the entire reason the tow path is kept clear rather than trusted to a driver's own judgement.",
      wrongNote: "Wrong call for this moment — the vehicle sitting in the tow path is the thing that needs this push stopped right now.",
    },
    {
      id: "unclear-brake-confirmation",
      kind: "Brake confirmation unclear",
      after: "stop-on-mark", delay: 3, seconds: 12,
      alert: "The flight deck's brake-set call came through broken on the headset — the crew cannot actually confirm whether the parking brake is set.",
      cue: "Get the chocks back under the wheels right now, before anything else happens.",
      target: "chock-nose",
      why: "An unclear confirmation is the same as no confirmation at all, and the one thing that holds this aircraft regardless of what the brake is actually doing is a chock physically under the wheel — that goes back on immediately rather than waiting for a clearer radio call.",
      missNote: "The crew moved on without ever actually confirming the brake, and nothing physical was holding the aircraft in the meantime. An aircraft nobody can confirm is braked is an aircraft that is, as far as this crew actually knows, still free to roll.",
      wrongNote: "Wrong call for this moment — getting the chocks back under this aircraft is what needs to happen before the disconnect goes any further.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "headset-gear", "work-gloves"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "headset-gear": "headset", "work-gloves": "work gloves" },
      title: "Suit up for the push",
      cue: "Hi-vis vest, headset and gloves before anyone touches the towbar.",
      why: "The headset is the only open line to the flight deck for the entire push, and it goes on with the rest of the gear before the towbar is even inspected, because every step from here on assumes that line is already live and every crew member already has it on.",
    },
    {
      id: "brief", kind: "select", target: "push-plan-board",
      title: "Read the pushback plan",
      cue: "Confirm the aircraft type, the push path and the towbar rating before rigging up.",
      why: "The pushback plan is what sets the towbar and shear-pin rating for this specific aircraft, and a crew that has not read it has no way to know before the tug is already connected whether the towbar in front of them is even rated for what they are about to push.",
    },
    {
      id: "inspect-towbar", kind: "find", noHint: true,
      targets: ["worn-shear-pin", "cracked-towbar-head", "hydraulic-leak-tug"],
      itemNames: {
        "worn-shear-pin": "worn shear pin",
        "cracked-towbar-head": "cracked towbar head",
        "hydraulic-leak-tug": "hydraulic leak on the tug",
      },
      itemNotes: {
        "worn-shear-pin": "A shear pin worn thinner than its rating shears at a load well under the one it is there to protect the nose gear from.",
        "cracked-towbar-head": "A cracked towbar head can let go of the nose gear under load exactly when the tow needs it holding hardest.",
        "hydraulic-leak-tug": "A leak on the tug's own hydraulics is steering or braking pressure this rig is losing before the push has even started.",
      },
      decoyNotes: { "sound-tow-bar-jaw": "The towbar jaw is clean, dry and shows no wear. Nothing to flag there." },
      title: "Inspect the tug and towbar",
      cue: "Walk the tug and towbar. Three problems are hiding on it — find them by looking.",
      why: "A towbar that looks fine from a distance is not the same thing as one a competent person has actually walked before it ever touches the nose gear — a worn shear pin, a cracked head or a hydraulic leak found now costs a swap, and found once the tug is already under load costs a nose gear this crew cannot easily replace on the ramp.",
    },
    {
      id: "position-tug", kind: "drag", target: "tug-body",
      title: "Position the tug",
      cue: "Drive the tug in and line the towbar up square with the nose gear.",
      why: "The towbar only seats cleanly on the nose gear if the tug is actually squared up to it first — a tug brought in at an angle is a towbar head that goes on crooked, and a crooked connection is the first thing to fail once real load goes through it.",
      drag: { to: "nose-gear-socket", radius: 0.45, missNote: "Not squared up to the nose gear — bring the tug in straight before the towbar goes anywhere near it." },
    },
    {
      id: "attach-towbar", kind: "sequence", anyOrder: true,
      targets: ["towbar-head-seat", "towbar-retain-pin"],
      itemNames: { "towbar-head-seat": "towbar head seated", "towbar-retain-pin": "retaining pin secured" },
      title: "Connect the towbar",
      cue: "Seat the towbar head on the nose gear and secure the retaining pin.",
      why: "The towbar is the entire load path between the tug and the aircraft for the whole push, and a head that is seated but not pinned is a connection that looks finished from a few feet away right up until the first turn puts a side load on it that a seated-but-unpinned head was never going to hold.",
    },
    {
      id: "install-bypass-pin", kind: "select", target: "bypass-pin",
      title: "Seat the steering bypass pin",
      cue: "Install the bypass pin in the nosewheel steering before the tug takes any load.",
      why: "The bypass pin is what disconnects the nosewheel's own hydraulic steering from the tug's force, so the tug can turn the wheel without fighting a steering system built to be driven by the flight deck, not shoved by a tug on the ramp.",
    },
    {
      id: "headset-connect", kind: "select", target: "headset-jack",
      title: "Connect the headset",
      cue: "Plug the headset into the nose interphone and confirm comms with the flight deck.",
      why: "Everything from here — the brake release, the push itself, the final brake-set confirmation — is coordinated over this one line, and it gets tested now, before the chocks come off, rather than assumed live the first time it is actually needed.",
    },
    {
      id: "brake-release-confirm", kind: "hold", target: "headset-jack", seconds: 6,
      title: "Wait for the brake-release call",
      cue: "Hold at the headset and wait for the flight deck's own confirmation before anything moves.",
      why: "The parking brake only comes off on the flight deck's own word, because they are the one crew that can actually see it release from inside the cockpit — a tug operator who assumes it is already off is betting the whole push on a guess.",
      holdBreakNote: "Let go of the headset before the confirmation came through. Hold at it — the brake only comes off once the flight deck actually says so.",
    },
    {
      id: "stage-for-push", kind: "sequence", anyOrder: true,
      targets: ["chock-nose", "chock-main", "path-cones"],
      itemNames: { "chock-nose": "nose chocks", "chock-main": "main chocks", "path-cones": "tow path cones" },
      title: "Clear the chocks and the path",
      cue: "Pull the chocks now the brake is confirmed released, and cone the tow path clear.",
      why: "The chocks only come off once the brake is confirmed released, in that order, because until that confirmation the chocks are the only thing definitely holding this aircraft — and the path gets coned the same moment so nothing rolls into a lane the tow is about to sweep.",
    },
    {
      id: "push-back", kind: "track", target: "tug-controls", seconds: 8,
      title: "Push the aircraft back",
      cue: "Hold the tow speed steady down the push line, watching the tail clearance the whole way.",
      why: "A push that speeds up and slows down is a push the tug operator is reacting to rather than controlling, and a steady speed is what keeps the tail's own swing predictable to everyone watching it, including whoever is walking the wingtip.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.5, fall: 0.45, drift: 0.12, label: "TOW SPEED", readout: (v) => (v < 0.4 ? "too slow to steer" : v > 0.6 ? "pushing too fast" : "steady") },
      holdBreakNote: "Tow speed out of band. Bring it back to a steady push before the tail swings any further.",
    },
    {
      id: "steer-nosewheel", kind: "turn", target: "steer-tiller",
      title: "Steer the nosewheel straight",
      cue: "Turn the tiller to keep the nosewheel tracking the push line with the bypass pin engaged.",
      why: "With the bypass pin seated, the tiller is the only thing actually steering the nosewheel for the whole push — letting it wander off the line is exactly the side load the bypass pin exists to keep off the nose gear's own hydraulics.",
      turn: { turns: 0.4, axis: "y", label: "NOSEWHEEL" },
    },
    {
      id: "stop-on-mark", kind: "gauge", target: "stop-bar",
      title: "Stop on the mark",
      cue: "Stop the push when the nosewheel reaches the mark — commit inside the band.",
      why: "The mark is set for where this aircraft's own turn onto the taxiway actually starts clean, and stopping short or long of it hands the flight deck a first turn that does not match the one the plan was built around, on a taxiway this crew is not the one steering through it.",
      gauge: { label: "NOSEWHEEL", speed: 0.68, green: [0.46, 0.58], readout: (t) => `${((t - 0.52) * 400).toFixed(0)} cm`, missNote: "Off the mark — the aircraft's own first turn onto the taxiway will not match the plan." },
    },
    {
      id: "brake-set-confirm", kind: "select", target: "engine-status",
      title: "Confirm the brake is set",
      cue: "Confirm the flight deck has set and reported the parking brake before disconnecting anything.",
      why: "Nothing gets disconnected from this aircraft until the flight deck's own brake is confirmed set, because until that exact confirmation comes through over the headset, the tug and the towbar are the only thing standing between this aircraft and rolling on its own.",
    },
    {
      id: "disconnect-sequence", kind: "sequence",
      targets: ["chock-nose-2", "bypass-pin-out", "towbar-disconnect"],
      itemNames: { "chock-nose-2": "chocks placed", "bypass-pin-out": "bypass pin removed", "towbar-disconnect": "towbar disconnected" },
      title: "Disconnect in order",
      cue: "Chocks on first, then the bypass pin out, then the towbar disconnected last.",
      why: "The chocks go on before anything else comes off so the aircraft is never for a moment held only by a brake this crew cannot actually see or feel — the bypass pin and the towbar come off only once something physical, right there under the wheels, is already holding it.",
      outOfOrderNote: "Chocks, then the bypass pin, then the towbar — the aircraft is held before anything is disconnected from it.",
    },
    {
      id: "final-signal", kind: "select", target: "final-signal-paddle",
      title: "Give the final signal and clear",
      cue: "Give the brakes-set hand signal to the flight deck, then disconnect the headset last.",
      why: "The hand signal is the flight deck's own visual confirmation, from a cockpit that cannot see the towbar or the chocks, that the ramp crew is fully clear — and the headset stays live until that signal is given, not a moment before.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const PAL = palette("aviation");
    stationPad(g, 2.9, AVPB_ACCENT);

    // ------------------------------------------------------------------ apron ground
    const groundMesh = box(g, 8.6, 0.12, 8.2, 0, 0.06, 0, 0xffffff, { rough: 0.94 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#2a2c2e", base2: "#242628" }), { repeat: 7, px: 512 }),
      { rough: 0.94, metal: 0.03, color: 0xb4babe },
    );
    // Push-line paint down the centre.
    for (let i = 0; i < 12; i++) box(g, 0.1, 0.006, 0.3, 0, 0.121, -3.3 + i * 0.42, PAL.trim, { rough: 0.9, cast: false });
    // Concrete apron edge — a second textured surface.
    const edgeMesh = box(g, 8.6, 0.08, 0.5, 0, 0.14, 3.9, 0xffffff, { rough: 0.85, cast: false });
    edgeMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { tone: "#8b8d89" }), { repeat: 3, px: 256 }),
      { rough: 0.85, metal: 0.02, color: 0xffffff },
    );
    // Drain grating at the gate edge — a third textured surface.
    const drainMesh = box(g, 1.0, 0.02, 0.5, -3.0, 0.111, 3.6, 0xffffff, { rough: 0.7, cast: false });
    drainMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }),
      { rough: 0.7, metal: 0.4, color: 0xffffff },
    );
    // Hazard striping along the tow path edge — a fourth textured surface.
    for (const sx of [-1, 1]) {
      const stripe = box(g, 0.28, 0.005, 5.2, sx * 3.9, 0.104, -0.6, 0xffffff, { rough: 0.85, cast: false });
      stripe.material = texturedMat(
        surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 3, px: 256 }),
        { rough: 0.8, metal: 0.02, color: 0xffffff },
      );
    }

    // ------------------------------------------------------------------ the aircraft & tug
    const jet = regionalJet(g, 0, 0, -2.6, { livery: { colour: PAL.structure, accent: AVPB_ACCENT, fleetName: "SITE AIR", unitNumber: "N204XA" } });
    holoTag(jet, "aircraft on the gate", 0, 3.4, 0, { css: "#2f8fdb", w: 0.42 });
    const { noseGear } = jet.userData.parts;
    void noseGear;

    const tug = pushbackTug(g, 0, 0, 2.0, { ry: Math.PI, livery: { colour: PAL.accent, fleetName: "RAMP", unitNumber: "TUG-4" } });
    const { cabDoor, towbarArm } = tug.userData.parts;
    void cabDoor;
    reg(hits, tug, "tug-body");
    holoTag(tug, "pushback tug", 0, 2.1, 0, { css: "#2f8fdb", w: 0.3 });
    const noseSocket = group(g, 0, 0.3, 1.3);
    hits["nose-gear-socket"] = noseSocket;
    reg(hits, towbarArm, "tug-controls");

    const wornShearPin = group(towbarArm, 0, 0.05, 0.7);
    cyl(wornShearPin, 0.018, 0.018, 0.1, 0, 0, 0, 0xb8402f, { rough: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    reg(hits, wornShearPin, "worn-shear-pin");
    const crackedHead = group(towbarArm, 0.08, 0.02, 1.0);
    box(crackedHead, 0.05, 0.015, 0.1, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, crackedHead, "cracked-towbar-head");
    const hydraulicLeakTug = group(tug, -0.6, 0.3, -0.7);
    ball(hydraulicLeakTug, 0.03, 0, 0, 0, 0x2b2318, { rough: 0.5, opacity: 0.7, transparent: true, seg: 10 });
    reg(hits, hydraulicLeakTug, "hydraulic-leak-tug");
    const soundTowBarJaw = group(towbarArm, -0.08, 0.02, 1.0);
    ball(soundTowBarJaw, 0.02, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 8 });
    reg(hits, soundTowBarJaw, "sound-tow-bar-jaw");

    const towbarHeadSeat = group(towbarArm, 0, 0, 1.05);
    box(towbarHeadSeat, 0.28, 0.1, 0.14, 0, 0, 0, 0x8b98a5, { rough: 0.5, metal: 0.5 });
    reg(hits, towbarHeadSeat, "towbar-head-seat");
    const retainPin = group(towbarArm, 0.14, 0.06, 1.05);
    cyl(retainPin, 0.014, 0.014, 0.12, 0, 0, 0, 0xc8ced4, { rough: 0.3, metal: 0.7, seg: 10 });
    reg(hits, retainPin, "towbar-retain-pin");

    const bypassPin = group(g, 0.18, 0.14, 1.55, 0.2);
    cyl(bypassPin, 0.02, 0.02, 0.22, 0, 0.11, 0, 0xffd23b, { rough: 0.4, metal: 0.5, seg: 10 });
    holoTag(bypassPin, "bypass pin", 0, 0.32, 0, { css: "#2f8fdb", w: 0.28 });
    reg(hits, bypassPin, "bypass-pin");
    const skipBypassLever = group(g, -0.5, 0.14, 1.55, 0.2);
    box(skipBypassLever, 0.08, 0.05, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const skipBypassPaddle = box(skipBypassLever, 0.16, 0.12, 0.015, 0, 0.2, 0.01, 0xd2312b, { rough: 0.5 });
    decal(skipBypassPaddle, 0.14, 0.1, 0, 0, 0.009, signFace("SKIP\nPIN", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.4 }));
    reg(hits, skipBypassPaddle, "skip-bypass-pin-hazard");

    const headsetJack = box(jet.userData.parts.doorFwd, 0.06, 0.08, 0.04, -0.02, -0.3, 0, 0x1b1e23, { rough: 0.6 });
    holoTag(g, "nose interphone", 0.5, 1.5, 1.0, { css: "#2f8fdb", w: 0.34 });
    reg(hits, headsetJack, "headset-jack");
    const earlyDisconnectHazard = group(g, 0.7, 0.14, 1.9, 0.2);
    box(earlyDisconnectHazard, 0.05, 0.04, 0.1, 0, 0.1, 0, 0x2b2f34, { rough: 0.6 });
    const unplugPaddle = box(earlyDisconnectHazard, 0.09, 0.06, 0.02, 0, 0.2, 0.05, 0xd2312b, { rough: 0.5 });
    decal(unplugPaddle, 0.08, 0.05, 0, 0, 0.011, signFace("UNPLUG", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.45 }));
    reg(hits, earlyDisconnectHazard, "early-disconnect-hazard");

    const pushAnywayLever = group(g, -1.1, 0.14, 2.6, 0.2);
    box(pushAnywayLever, 0.1, 0.06, 0.03, 0, 0.14, 0, 0x2b2f34, { rough: 0.55 });
    const pushAnywayPaddle = box(pushAnywayLever, 0.2, 0.14, 0.02, 0, 0.28, 0.01, 0xd2312b, { rough: 0.5 });
    decal(pushAnywayPaddle, 0.17, 0.12, 0, 0, 0.011, signFace("PUSH", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    reg(hits, pushAnywayPaddle, "push-blind-hazard");

    const towPathHit = box(g, 1.6, 1.2, 4.2, 0, 0.7, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the tow path?", 0, 1.4, -0.6, { css: "#d2312b", w: 0.42 });
    reg(hits, towPathHit, "tow-path-stand-hazard");
    const towPathStop = group(g, 2.6, 0, 0.4, 0.3);
    cyl(towPathStop, 0.012, 0.012, 0.6, 0, 0.3, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    const stopPaddleFace = box(towPathStop, 0.22, 0.22, 0.015, 0, 0.6, 0, 0xd2312b, { rough: 0.5 });
    decal(stopPaddleFace, 0.18, 0.18, 0, 0, 0.011, signFace("STOP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(towPathStop, "tow path stop", 0, 0.9, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, towPathStop, "tow-path-stop");

    // ------------------------------------------------------------------ gear + gauges
    const stopBar = box(g, 1.2, 0.006, 0.1, 0, 0.102, -3.0, PAL.trim, { rough: 0.9, cast: false });
    holoTag(g, "stop mark", 0.85, 0.3, -3.0, { css: "#d2312b", w: 0.28 });
    reg(hits, stopBar, "stop-bar");
    const noseChockPick = box(g, 0.3, 0.12, 0.16, 1.9, 0.16, 1.5, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "nose chocks", 1.9, 0.42, 1.5, { css: "#2f8fdb", w: 0.26 });
    reg(hits, noseChockPick, "chock-nose");
    const mainChockPick = box(g, 0.34, 0.14, 0.18, 2.3, 0.17, 1.5, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "main chocks", 2.3, 0.44, 1.5, { css: "#2f8fdb", w: 0.26 });
    reg(hits, mainChockPick, "chock-main");
    const chockNose2 = box(g, 0.3, 0.12, 0.16, 1.9, 0.16, -1.9, 0xf2c14b, { rough: 0.8 });
    chockNose2.visible = false;
    reg(hits, chockNose2, "chock-nose-2");
    const pathConesPick = cone(g, 2.9, 2.0);
    holoTag(g, "tow path cones", 2.9, 0.5, 2.0, { css: "#2f8fdb", w: 0.34 });
    reg(hits, pathConesPick, "path-cones");
    const bypassPinOutMarker = group(g, 0.18, 0.14, -2.2);
    cyl(bypassPinOutMarker, 0.02, 0.02, 0.22, 0, 0.11, 0, 0xffd23b, { rough: 0.4, metal: 0.5, seg: 10 });
    holoTag(bypassPinOutMarker, "bypass pin", 0, 0.32, 0, { css: "#2f8fdb", w: 0.28 });
    reg(hits, bypassPinOutMarker, "bypass-pin-out");
    const towbarDisconnectMarker = group(g, 0, 0.14, -2.5);
    box(towbarDisconnectMarker, 0.28, 0.1, 0.14, 0, 0, 0, 0x8b98a5, { rough: 0.5, metal: 0.5 });
    holoTag(towbarDisconnectMarker, "towbar", 0, 0.24, 0, { css: "#2f8fdb", w: 0.24 });
    reg(hits, towbarDisconnectMarker, "towbar-disconnect");

    const steerTiller = group(tug, 0.5, 1.0, -0.2, 0.3);
    cyl(steerTiller, 0.014, 0.014, 0.3, 0, 0.15, 0, 0x2b2f34, { rough: 0.55, seg: 10 });
    const tillerKnob = ball(steerTiller, 0.03, 0, 0.3, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.8, seg: 10 });
    holoTag(steerTiller, "steering tiller", 0, 0.44, 0, { css: "#2f8fdb", w: 0.32 });
    reg(hits, tillerKnob, "steer-tiller");

    const engineStatus = instrument(g, 2.9, 0, -2.2, { ry: -0.4, idle: "SET?", color: AVPB_ACCENT });
    holoTag(engineStatus, "brake status", 0, 0.16, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, engineStatus, "engine-status");
    const unclearBeacon = ball(engineStatus, 0.02, 0.06, 0.04, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.8, seg: 10 });
    unclearBeacon.visible = false;

    const finalSignal = group(g, -2.6, 0, 0.4, 0.3);
    cyl(finalSignal, 0.012, 0.012, 0.55, 0, 0.28, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    const finalPaddle = box(finalSignal, 0.2, 0.16, 0.012, 0, 0.56, 0, 0x59c97b, { rough: 0.5 });
    decal(finalPaddle, 0.17, 0.13, 0, 0, 0.009, signFace("CLEAR", { bg: "#0f1b14", accent: "#bff7d4", scale: 0.5 }));
    holoTag(finalSignal, "brakes-set signal", 0, 0.82, 0, { css: "#2f8fdb", w: 0.38 });
    reg(hits, finalPaddle, "final-signal-paddle");

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.62, 0.42, -3.4, 1.5, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f8fdb"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PUSHBACK PLAN · GATE 9", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SHEAR PIN PER THE PLAN", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Aircraft type: per the plan", "Towbar rating: matched to type",
       "Brake released only on flight deck's word", "Bypass pin before any load",
       "Brake set + confirmed before disconnect"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.4, accent: AVPB_ACCENT });
    reg(hits, plan, "push-plan-board");

    const ppeRack = group(g, -3.4, 0, 3.0, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, AVPB_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const headsetProp = group(ppeRack, 0.2, 0.62, 0);
    ball(headsetProp, 0.07, 0, 0, 0, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(headsetProp, "headset", 0, 0.18, 0, { css: "#2f8fdb", w: 0.26 });
    reg(hits, headsetProp, "headset-gear");
    const gloveProp = box(ppeRack, 0.16, 0.05, 0.1, -0.2, 0.6, 0, 0xd8a63a, { rough: 0.7 });
    holoTag(gloveProp, "work gloves", 0, 0.16, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, gloveProp, "work-gloves");

    const closingLog = group(g, 3.3, 0, 2.4, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("PUSH LOG\nOPEN", { bg: "#11181f", accent: "#2f8fdb", scale: 0.3 }), { px: 320 });
    holoTag(closingLog, "push log", 0, 1.34, 0, { css: "#2f8fdb", w: 0.26 });

    // A vehicle that crosses the tow path for the incursion interrupt,
    // parked clear the rest of the run.
    const cateringTruck = group(g, -4.6, 0, -1.6, 0.5);
    box(cateringTruck, 0.9, 1.0, 1.8, 0, 0.7, 0, 0xdfe6ea, { rough: 0.5, metal: 0.2 });
    for (const [cx2, cz2] of [[-0.35, -0.6], [0.35, -0.6], [-0.35, 0.6], [0.35, 0.6]]) cyl(cateringTruck, 0.14, 0.14, 0.1, cx2, 0.14, cz2, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    const truckHome = { x: -4.6, z: -1.6 };
    const truckBlock = { x: -0.3, z: -1.6 };

    const dust = particles(g, 16, 0x9a8a6a, { size: 0.02, life: 0.5, additive: false, opacity: 0.14 });

    let pushProgress = 0;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.4),

      onInterrupt(it) {
        if (it.id === "vehicle-enters-tow-path") { cateringTruck.position.set(truckBlock.x, 0, truckBlock.z); }
        if (it.id === "unclear-brake-confirmation") {
          unclearBeacon.visible = true;
          repaint(engineStatus.userData.screen, signFace("UNCLEAR", { bg: "#2a1610", accent: "#f0645b", fg: "#ffd9d0", scale: 0.42 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vehicle-enters-tow-path") { cateringTruck.position.set(truckHome.x, 0, truckHome.z); }
        if (it.id === "unclear-brake-confirmation") {
          unclearBeacon.visible = false;
          repaint(engineStatus.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
      },
      onStepComplete(step) {
        if (step.id === "inspect-towbar") {
          wornShearPin.children[0].material = mat(0x59c97b, { rough: 0.5 });
          crackedHead.children[0].material = mat(0x59c97b, { rough: 0.6 });
          hydraulicLeakTug.children[0].material = mat(0x59c97b, { rough: 0.5, opacity: 0.3, transparent: true });
        }
        if (step.id === "brake-release-confirm") {
          repaint(engineStatus.userData.screen, signFace("RELEASED", { bg: "#0d1c24", accent: "#f2c14b", fg: "#bfeaf7", scale: 0.4 }));
        }
        if (step.id === "brake-set-confirm") {
          repaint(engineStatus.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (step.id === "final-signal") {
          repaint(closingLogFace, signFace("PUSH LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "push-back" && session.holding) pushProgress = Math.min(1, pushProgress + dt / 8);
        jet.position.z = -2.6 - pushProgress * 3.4;
        tug.position.z = 2.0 - pushProgress * 3.4;
        if (step?.id === "steer-nosewheel") tillerKnob.parent.rotation.y = Math.sin(t * 1.4) * 0.2;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.3, -1.5), 0.2, 0.15, -0.1);
      },
    };
  },
};
