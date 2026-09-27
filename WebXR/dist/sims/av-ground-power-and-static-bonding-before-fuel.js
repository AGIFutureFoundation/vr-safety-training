import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, hose, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument,
  standingFigure, surfaceTexture, texturedMat, palette, asphaltFace, concreteFace,
  corrugatedFace, gratingFace, safetyStripeFace, reg,
} from "../citykit.js";
import { regionalJet, groundPowerUnit, fuelTruck } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ground Power & Static Bonding Before Fuelling VR — its own
// gamified system: Zero Potential.
//
// The ramp crew's own order of operations before a drop of fuel ever moves:
// ground power connected so the aircraft's own engines and APU can shut down
// clean, the fuel safety zone marked and every ignition source kept out of
// it, the fuel truck brought in at walking pace and stopped short, the
// static bonding cable clamped to the aircraft BEFORE the nozzle ever
// touches it, the transfer held on a steady flow with the deadman control
// never let go, and the bonding cable the very last thing disconnected once
// the nozzle is already off. No fuel grade, quantity or flow rate here is
// one this platform is certain of — those live on the fuel order itself.

const AVGP_ACCENT = 0x59c97b;

export const SIM_AV_GROUND_POWER_AND_STATIC_BONDING_BEFORE_FUEL = {
  id: "av-ground-power-and-static-bonding-before-fuel",
  index: "av-3",
  domain: "Aviation",
  trade: "Ground power and fuelling ramp agent — IAM/TWU ramp crew",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "IAM and TWU ramp training; NFPA 407 aircraft fuel servicing and NFPA 77 static electricity guidance; OSHA 29 CFR 1910.1200 hazard communication and 29 CFR 1910.132 personal protective equipment; FAA 14 CFR Part 139 movement-area operations",
  name: "Ground Power & Static Bonding Before Fuel",
  title: simTitle("Ground Power & Static Bonding Before Fuel"),
  tagline: "Ground power connected before anything else, the fuel safety zone marked and held clear of ignition sources, the fuel truck stopped short, the bonding cable clamped before the nozzle ever touches, the transfer held on a steady flow, and the bonding cable the last thing disconnected once the nozzle is already off",
  accent: AVGP_ACCENT,
  accentCss: "#59c97b",
  parSeconds: 300,
  footprint: 2.9,
  badge: { id: "zero-potential", name: "Zero Potential", note: "Bonded before the nozzle ever touched the aircraft, the deadman never let go, and the bonding cable was the last thing off" },

  game: system({
    name: "Zero Potential",
    currency: "BOND",
    ranks: ["Ramp Hand", "Fuel Qualified", "Bonding Certified", "Lead Fueller", "Zero Potential Certified"],
    badges: [
      { id: "bond-first", name: "Bond First", note: "Never connected the nozzle before the bonding cable was clamped", test: AWARD.stepClean("bond-before-fuel") },
      { id: "zone-held", name: "Zone Held", note: "No ignition source ever entered the fuel safety zone", test: AWARD.safe },
      { id: "steady-flow", name: "Steady Flow", note: "Held the transfer flow near band centre the whole fill", test: AWARD.precise(0.72) },
      { id: "clean-connect", name: "Clean Connect Certified", note: "Connected ground power clean, first time", test: AWARD.stepClean("connect-gpu") },
    ],
    challenges: [
      { id: "quick-fuel", name: "Quick Fuel", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "bond-streak", name: "Bond Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IAM or TWU local's member assistance programme, or the site's employee assistance line if a close call around the fuel truck is what stayed with you",

  hazards: {
    "fuel-before-bond-hazard": "That connects the fuel nozzle before the bonding cable is clamped to the aircraft. Fuel moving through a hose generates static charge as it flows, and without a bonded path for that charge to equalise across, the aircraft and the truck can sit at two different electrical potentials right next to a fuel vapour that only needs one spark to ignite.",
    "smoking-ignition-hazard": "That is an open ignition source inside the fuel safety zone. Fuel vapour does not stay politely at the nozzle — it drifts, and the entire reason the zone is marked and held clear is so nothing that can spark ever shares the air it drifts into.",
    "engine-running-fuel-hazard": "That starts the APU while the fuel transfer is live. An APU exhaust is a heat source and a potential ignition source at once, and the entire reason ground power goes on before fuelling is so nothing on the aircraft that can start a fire has any reason to run while fuel is moving nearby.",
    "spill-kit-missing-hazard": "That starts the transfer without the spill kit staged at the connection point. A fuel connection lets go a little fuel almost every time it is broken, and the difference between a wipe-up and a reportable spill is entirely whether the kit was already there when it happened.",
  },

  lateNotes: {
    "bonding-clamp": "The bonding cable is clamped to the aircraft before the nozzle ever touches it, not connected afterward once fuel is already about to move.",
    "fuel-nozzle": "The bonding cable comes off last, after the nozzle is already disconnected, not before.",
  },

  interrupts: [
    {
      id: "bonding-clamp-slips",
      kind: "Bonding continuity lost",
      after: "monitor-flow", delay: 5, seconds: 12,
      alert: "The bonding clamp has visibly slipped loose from the aircraft skin while fuel is still moving through the hose.",
      cue: "Hit the emergency fuel stop now — the bond is gone and fuel is still flowing.",
      target: "emergency-fuel-stop",
      why: "A slipped clamp means the aircraft and the truck are no longer at the same electrical potential for however long the transfer keeps running, and the flow has to stop the instant that bond is lost rather than wait for someone to reach over and re-clamp it while fuel is still moving.",
      missNote: "Fuel kept flowing with no bonded path between the aircraft and the truck. Every second that continued was a second the static charge building in that fuel had nowhere safe to go.",
      wrongNote: "That doesn't answer it — the lost bond is what stops this transfer, not the other way round.",
    },
    {
      id: "spill-at-connection",
      kind: "Fuel spill",
      after: "hold-deadman", delay: 4, seconds: 12,
      alert: "A small fuel spill has started at the nozzle connection, running toward the drain grating.",
      cue: "Grab the spill kit now and contain it before it reaches the grating.",
      target: "spill-kit-staged",
      why: "A spill that reaches the drain becomes a reportable release into the site's own stormwater system, and the few seconds it takes to reach the staged kit and contain it at the source is the entire difference between a wipe-up and that outcome.",
      missNote: "The spill kept running while the deadman was held through it without anyone reaching for the kit. Fuel that reaches a drain does not stay this station's problem — it becomes the site's.",
      wrongNote: "Off track — the spill at the connection has to be contained before this transfer goes any further.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "fuel-gloves", "face-shield"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "fuel-gloves": "fuel-resistant gloves", "face-shield": "face shield" },
      title: "Suit up before fuelling",
      cue: "Hi-vis vest, fuel-resistant gloves and a face shield before anyone touches a hose.",
      why: "A connection that lets go even a little fuel under pressure does it fast and close to the hands making it, and fuel-resistant gloves with a face shield are what keeps a normal splash from becoming a chemical exposure this crew has to report.",
    },
    {
      id: "brief", kind: "select", target: "fuel-plan-board",
      title: "Read the fuel order",
      cue: "Confirm the fuel grade, the quantity and the ground-power sequence before staging anything.",
      why: "The fuel order is what sets today's quantity and grade, and a crew that has not read it has no way to know before the truck is already connected whether the load it is about to deliver is even the one this aircraft is due.",
    },
    {
      id: "inspect-gpu", kind: "find", noHint: true,
      targets: ["frayed-gpu-cable", "damaged-plug", "cracked-fuel-hose"],
      itemNames: {
        "frayed-gpu-cable": "frayed ground-power cable",
        "damaged-plug": "damaged GPU plug",
        "cracked-fuel-hose": "cracked fuel hose at the truck",
      },
      itemNotes: {
        "frayed-gpu-cable": "A frayed cable this close to a fuelling operation is exactly the kind of exposed conductor a fuel safety zone is built to have none of.",
        "damaged-plug": "A damaged plug can arc on connection, and an arc is an ignition source this crew is about to work fuel next to.",
        "cracked-fuel-hose": "A cracked hose lets go fuel under pressure the moment it is charged, long before the nozzle ever reaches the aircraft.",
      },
      decoyNotes: { "sound-gpu-reel": "The GPU's cable reel is wound clean and shows no damage. Nothing to flag there." },
      title: "Inspect the GPU and the fuel hose",
      cue: "Walk the ground power cart and the truck's hose. Three problems are hiding — find them by looking.",
      why: "Anything with a frayed conductor or a cracked line sitting inside a zone that is about to fill with fuel vapour is a problem this crew wants to find while it is still just a maintenance item, not after it has already met the fuel it was staged next to.",
    },
    {
      id: "connect-gpu", kind: "sequence", anyOrder: true,
      targets: ["gpu-connect", "engines-off-confirm"],
      itemNames: { "gpu-connect": "ground power connected", "engines-off-confirm": "engines and APU confirmed off" },
      title: "Connect ground power",
      cue: "Connect the GPU cable and confirm the engines and APU are off before fuelling starts.",
      why: "Ground power connected first is what lets the aircraft's own engines and APU actually shut down without losing electrics on the flight deck, and nothing that can run hot or spark stays on once the fuel safety zone is about to be established around it.",
    },
    {
      id: "noignition-zone", kind: "sequence", anyOrder: true,
      targets: ["no-smoking-signs", "spill-kit-staged"],
      itemNames: { "no-smoking-signs": "no-ignition signage set", "spill-kit-staged": "spill kit staged" },
      title: "Mark the fuel safety zone",
      cue: "Set the no-ignition signage around the zone and stage the spill kit at the connection point.",
      why: "The zone only means something once it is actually marked — the signage is what tells everyone walking past exactly where the ignition-source rule starts applying, and the spill kit staged now is the kit that is actually there the moment it is needed rather than the one somebody has to go find.",
    },
    {
      id: "position-fuel-truck", kind: "drag", target: "fuel-truck-body",
      title: "Bring the fuel truck in",
      cue: "Drive the truck in at walking pace and stop it short of the aircraft.",
      why: "Every vehicle that approaches a parked aircraft on the ramp does it at walking pace and stops short of the skin — the last distance to the connection point is closed on foot with the hose, never by rolling the truck the rest of the way in.",
      drag: { to: "fuel-connection-point", radius: 0.5, missNote: "Not stopped short — bring the truck in and stop before it reaches the aircraft." },
    },
    {
      id: "bond-before-fuel", kind: "select", target: "bonding-clamp",
      title: "Clamp the bonding cable",
      cue: "Clamp the static bonding cable to the aircraft before the nozzle goes anywhere near it.",
      why: "This is the one step that has to happen before every other part of the transfer: the bonding cable is what puts the aircraft and the truck at the same electrical potential, and nothing about the nozzle, the flow or the deadman means anything for static safety until this clamp is actually on.",
    },
    {
      id: "connect-nozzle", kind: "select", target: "fuel-nozzle",
      title: "Connect the fuel nozzle",
      cue: "Connect the nozzle to the aircraft only now the bond is confirmed.",
      why: "The nozzle goes on second, never first, because everything the bonding cable was just clamped for is exactly the protection this connection needs in place before fuel starts moving through it.",
    },
    {
      id: "hold-deadman", kind: "hold", target: "deadman-control", seconds: 6,
      title: "Hold the deadman control",
      cue: "Hold the deadman control through the fill — releasing it stops the flow instantly.",
      why: "The deadman control is what guarantees fuel only ever moves while someone is actually standing at the connection paying attention to it — the instant that hand comes off for any reason, the flow has to stop rather than keep running unsupervised.",
      holdBreakNote: "Let go of the deadman mid-fill. Hold it through the whole transfer — that is what keeps fuel from moving with nobody actually watching the connection.",
    },
    {
      id: "monitor-flow", kind: "track", target: "flow-gauge", seconds: 7,
      title: "Hold the transfer flow steady",
      cue: "Keep the flow rate inside the band for the whole transfer.",
      why: "A flow that surges and drops is harder to shut off cleanly at the planned quantity, and a steady rate is what keeps the crew actually in control of the transfer instead of chasing a number that is already moving too fast to catch.",
      track: { start: 0.5, green: [0.4, 0.62], rise: 0.45, fall: 0.4, drift: 0.13, label: "FLOW RATE", readout: (v) => (v < 0.4 ? "flow too slow" : v > 0.62 ? "flow surging" : "steady") },
      holdBreakNote: "Flow rate out of band. Bring it back to steady before the quantity overruns the order.",
    },
    {
      id: "check-fuel-quantity", kind: "gauge", target: "fuel-quantity-gauge",
      title: "Stop at the planned quantity",
      cue: "Read the quantity gauge and stop the transfer only once it is inside the ordered band.",
      why: "The fuel order set a quantity for a reason tied to this aircraft's own weight and balance, and stopping short or running past that band hands the flight crew a load that no longer matches what the order actually planned for.",
      gauge: { label: "FUEL LOAD", speed: 0.6, green: [0.46, 0.6], readout: (t) => `${Math.round(t * 100)}% of order`, missNote: "Outside the ordered band — confirm the quantity against the fuel order before stopping." },
    },
    {
      id: "disconnect-sequence", kind: "sequence",
      targets: ["fuel-nozzle", "bonding-clamp"],
      itemNames: { "fuel-nozzle": "nozzle disconnected", "bonding-clamp": "bonding cable disconnected" },
      title: "Disconnect in order",
      cue: "Disconnect the nozzle first, then the bonding cable last.",
      why: "The bonding cable comes off only once the nozzle is already disconnected and no fuel is moving, because reversing that order puts the aircraft and the truck back at two different potentials while there is still fuel and vapour sitting right at the connection.",
      outOfOrderNote: "Nozzle first, then the bonding cable — the bond stays on until fuel has stopped moving entirely.",
    },
    {
      id: "gpu-disconnect-confirm", kind: "select", target: "engine-status",
      title: "Confirm before disconnecting GPU",
      cue: "Confirm the flight deck is ready before disconnecting ground power.",
      why: "Ground power stays connected until the flight deck confirms they are ready to run on their own systems — pulling it early hands them an electrical transition they did not ask for at a moment they were not expecting it.",
    },
    {
      id: "closeout-log", kind: "select", target: "closing-log",
      title: "Log the fuel transfer",
      cue: "Log the quantity delivered, the bonding confirmation and the GPU times before signing off.",
      why: "The fuel log is what the flight crew's own weight and balance and the next shift both read — a transfer that went perfectly but never gets logged against the order leaves nothing behind to prove the aircraft actually got what it was due.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const PAL = palette("aviation");
    stationPad(g, 2.9, AVGP_ACCENT);

    // ------------------------------------------------------------------ apron ground
    const groundMesh = box(g, 8.4, 0.12, 8.2, 0, 0.06, 0, 0xffffff, { rough: 0.94 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#2b2d2f", base2: "#252729" }), { repeat: 7, px: 512 }),
      { rough: 0.94, metal: 0.03, color: 0xb4babe },
    );
    // Fuel safety zone boundary — hazard striping ring approximated as four edges.
    for (const [bx, bz, bw, bd] of [[0, 2.6, 5.6, 0.2], [0, -2.6, 5.6, 0.2], [2.8, 0, 0.2, 5.4], [-2.8, 0, 0.2, 5.4]]) {
      const edge = box(g, bw, 0.005, bd, bx, 0.104, bz, 0xffffff, { rough: 0.85, cast: false });
      edge.material = texturedMat(
        surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 2, px: 256 }),
        { rough: 0.8, metal: 0.02, color: 0xffffff },
      );
    }
    // Concrete fuel-island pad — a second textured surface.
    const padMesh = box(g, 2.6, 0.1, 2.2, 1.8, 0.12, 0.6, 0xffffff, { rough: 0.85, cast: false });
    padMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { tone: "#8b8d89" }), { repeat: 3, px: 256 }),
      { rough: 0.85, metal: 0.02, color: 0xffffff },
    );
    // Drain grating at the connection point — a third textured surface.
    const drainMesh = box(g, 0.8, 0.02, 0.5, 1.8, 0.111, 1.6, 0xffffff, { rough: 0.7, cast: false });
    drainMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }),
      { rough: 0.7, metal: 0.4, color: 0xffffff },
    );

    // ------------------------------------------------------------------ canopy (main structure)
    const canopy = group(g, 2.3, 0, 2.2, -0.3);
    for (const [cx2, cz2] of [[-1.0, -0.8], [1.0, -0.8], [-1.0, 0.8], [1.0, 0.8]]) cyl(canopy, 0.06, 0.06, 2.6, cx2, 1.3, cz2, PAL.trim, { rough: 0.5, metal: 0.4, seg: 10 });
    const roof = box(canopy, 2.6, 0.1, 2.2, 0, 2.62, 0, 0xffffff, { rough: 0.6 });
    roof.material = texturedMat(
      surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: PAL.structure, ribs: 10 }), { repeat: 2, px: 512 }),
      { rough: 0.55, metal: 0.25, color: 0xffffff },
    );
    holoTag(canopy, "fuel island", 0, 3.0, 0, { css: "#59c97b", w: 0.32 });

    // ------------------------------------------------------------------ aircraft, GPU and fuel truck
    const jet = regionalJet(g, 0, 0, -2.5, { livery: { colour: PAL.structure, accent: AVGP_ACCENT, fleetName: "SITE AIR", unitNumber: "N330XA" } });
    holoTag(jet, "aircraft on stand", 0, 3.4, 0, { css: "#59c97b", w: 0.4 });
    const { servicePanel } = jet.userData.parts;

    const gpu = groundPowerUnit(g, -2.6, 0, -0.8, { ry: 0.8, livery: { colour: PAL.accent, fleetName: "GPU", unitNumber: "PWR-2" } });
    reg(hits, gpu, "gpu-connect");
    holoTag(gpu, "ground power unit", 0, 1.0, 0, { css: "#59c97b", w: 0.4 });

    const truck = fuelTruck(g, 2.6, 0, 1.3, { ry: -1.9, livery: { colour: 0xeaf1f5, fleetName: "FUEL", unitNumber: "FT-8" } });
    reg(hits, truck, "fuel-truck-body");
    holoTag(truck, "fuel truck", 0, 2.6, 0, { css: "#59c97b", w: 0.3 });
    const truckHome = { x: 2.6, z: 1.3 };
    const fuelConnectionPoint = group(g, 1.6, 0.3, 0.3);
    hits["fuel-connection-point"] = fuelConnectionPoint;
    const spillPuddle = ball(g, 0.3, 1.6, 0.102, 0.5, 0x3a3226, { rough: 0.25, metal: 0.1, opacity: 0.75, transparent: true, seg: 12, cast: false });
    spillPuddle.scale.y = 0.05;
    spillPuddle.visible = false;

    const frayedCable = group(gpu, 0.4, 0.4, -0.3);
    ball(frayedCable, 0.02, 0, 0, 0, 0xb8402f, { rough: 0.7, seg: 8 });
    reg(hits, frayedCable, "frayed-gpu-cable");
    const damagedPlug = group(gpu, -0.4, 0.5, 0.4);
    box(damagedPlug, 0.05, 0.03, 0.02, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, damagedPlug, "damaged-plug");
    const crackedHose = group(truck, 0.3, 0.4, -1.0);
    box(crackedHose, 0.06, 0.02, 0.1, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, crackedHose, "cracked-fuel-hose");
    const soundGpuReel = group(gpu, 0.53, 0.65, -0.4);
    ball(soundGpuReel, 0.02, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 8 });
    reg(hits, soundGpuReel, "sound-gpu-reel");

    const engineOffConfirm = instrument(g, -2.9, 0, -2.2, { ry: 0.6, idle: "OFF?", color: AVGP_ACCENT });
    holoTag(engineOffConfirm, "engines/APU status", 0, 0.16, 0, { css: "#59c97b", w: 0.4 });
    reg(hits, engineOffConfirm, "engines-off-confirm");
    const apuStartHazard = group(g, -3.3, 0.14, -2.6, 0.4);
    box(apuStartHazard, 0.08, 0.05, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const apuPaddle = box(apuStartHazard, 0.14, 0.1, 0.012, 0, 0.2, 0.008, 0xd2312b, { rough: 0.5 });
    decal(apuPaddle, 0.12, 0.08, 0, 0, 0.009, signFace("APU\nSTART", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.35 }));
    reg(hits, apuPaddle, "engine-running-fuel-hazard");

    const noSmokingSign = group(g, -1.2, 0, 2.6, 0.2);
    cyl(noSmokingSign, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 10 });
    const signFacePanel = box(noSmokingSign, 0.4, 0.3, 0.02, 0, 1.25, 0, 0xffffff, { rough: 0.6 });
    decal(signFacePanel, 0.36, 0.26, 0, 0, 0.011, signFace("NO IGNITION\nSOURCES", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.32 }));
    reg(hits, noSmokingSign, "no-smoking-signs");
    const smokingHazard = group(g, -2.2, 0.14, 2.9, 0.2);
    cyl(smokingHazard, 0.006, 0.006, 0.08, 0, 0.04, 0, 0xd8a63a, { rough: 0.6, seg: 8 });
    ball(smokingHazard, 0.012, 0, 0.09, 0, 0xf2703b, { emissive: 0xf2703b, ei: 1.6, seg: 8 });
    reg(hits, smokingHazard, "smoking-ignition-hazard");

    const spillKit = group(g, 1.9, 0, 1.4, 0.3);
    box(spillKit, 0.4, 0.3, 0.3, 0, 0.15, 0, 0xf2c14b, { rough: 0.7 });
    holoTag(spillKit, "spill kit", 0, 0.42, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, spillKit, "spill-kit-staged");
    const spillKitMissingHazard = group(g, 0.9, 0, 1.4, 0.2);
    box(spillKitMissingHazard, 0.06, 0.04, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const skipSpillPaddle = box(spillKitMissingHazard, 0.12, 0.08, 0.012, 0, 0.2, 0.007, 0xd2312b, { rough: 0.5 });
    decal(skipSpillPaddle, 0.1, 0.06, 0, 0, 0.008, signFace("SKIP KIT", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.35 }));
    reg(hits, skipSpillPaddle, "spill-kit-missing-hazard");

    // Static bonding: a reel near the fuel island, a clamp on the aircraft
    // skin near the service panel, and a visible cable between them.
    const bondingReel = group(g, 1.9, 0, 2.0, 0.3);
    cyl(bondingReel, 0.14, 0.14, 0.08, 0, 0.14, 0, 0x2b2f34, { rough: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(bondingReel, "bonding reel", 0, 0.32, 0, { css: "#59c97b", w: 0.3 });
    const bondingClamp = group(servicePanel ?? g, -0.06, 0, 0, 0);
    ball(bondingClamp, 0.025, 0, 0, 0, 0xc8ced4, { rough: 0.3, metal: 0.7, seg: 10 });
    holoTag(bondingClamp, "bonding clamp", 0, 0.14, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, bondingClamp, "bonding-clamp");
    const bondCable = cyl(g, 0.008, 0.008, 1.0, 1.3, 0.5, 1.4, 0x1a1a1a, { rough: 0.6, seg: 6 });
    bondCable.visible = false;
    const fuelBeforeBondHazard = group(g, 1.4, 0.3, 0.6, 0.4);
    box(fuelBeforeBondHazard, 0.06, 0.04, 0.14, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    holoTag(fuelBeforeBondHazard, "connect nozzle now?", 0, 0.2, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, fuelBeforeBondHazard, "fuel-before-bond-hazard");

    const fuelNozzle = group(g, 1.9, 0.3, 0.6, 0.4);
    box(fuelNozzle, 0.1, 0.1, 0.22, 0, 0, 0, 0x2b2f34, { rough: 0.55 });
    holoTag(fuelNozzle, "fuel nozzle", 0, 0.16, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, fuelNozzle, "fuel-nozzle");
    // A slack fuel hose from the truck's own reel out to the nozzle at the connection point.
    hose(g, [[2.2, 1.0, -0.4], [2.0, 0.5, 0.1], [1.9, 0.32, 0.5]], 0.02, 0x2b2f34, { rough: 0.6, metal: 0.2, steps: 12, cast: false });
    const deadman = group(truck, -0.9, 1.1, -3.05, 0.2);
    box(deadman, 0.1, 0.05, 0.03, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    holoTag(deadman, "deadman control", 0, 0.14, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, deadman, "deadman-control");
    const flowGauge = instrument(g, 2.0, 0, 0.9, { ry: -1.0, idle: "-- gpm", color: AVGP_ACCENT });
    holoTag(flowGauge, "flow rate", 0, 0.16, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, flowGauge, "flow-gauge");
    const fuelQtyGauge = instrument(g, 1.6, 0, 1.3, { ry: -1.0, idle: "--%", color: AVGP_ACCENT });
    holoTag(fuelQtyGauge, "fuel quantity", 0, 0.16, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, fuelQtyGauge, "fuel-quantity-gauge");

    const emergencyStop = group(g, -0.4, 0, 1.5, 0.3);
    cyl(emergencyStop, 0.014, 0.014, 0.6, 0, 0.3, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    const eStopFace = box(emergencyStop, 0.22, 0.22, 0.015, 0, 0.62, 0, 0xd2312b, { rough: 0.5 });
    decal(eStopFace, 0.18, 0.18, 0, 0, 0.011, signFace("STOP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(emergencyStop, "emergency fuel stop", 0, 0.9, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, emergencyStop, "emergency-fuel-stop");

    const engineStatus2 = instrument(g, -2.9, 0, -1.6, { ry: 0.6, idle: "READY?", color: AVGP_ACCENT });
    holoTag(engineStatus2, "flight deck ready", 0, 0.16, 0, { css: "#59c97b", w: 0.38 });
    reg(hits, engineStatus2, "engine-status");

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.62, 0.42, -3.2, 1.5, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("FUEL ORDER · STAND 9", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("BOND BEFORE NOZZLE", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Grade + quantity: per the fuel order", "Ground power before engines shut down",
       "Zone marked before the truck approaches", "Bonding clamped before the nozzle",
       "Bonding cable off last, after the nozzle"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.4, accent: AVGP_ACCENT });
    reg(hits, plan, "fuel-plan-board");

    const ppeRack = group(g, -3.4, 0, 2.8, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, AVGP_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const gloveProp = box(ppeRack, 0.16, 0.05, 0.1, -0.2, 0.6, 0, 0xd8a63a, { rough: 0.7 });
    holoTag(gloveProp, "fuel-resistant gloves", 0, 0.16, 0, { css: "#59c97b", w: 0.38 });
    reg(hits, gloveProp, "fuel-gloves");
    const shieldProp = group(ppeRack, 0.2, 0.62, 0);
    box(shieldProp, 0.14, 0.16, 0.01, 0, 0, 0, 0xdfe6ea, { rough: 0.3, opacity: 0.7, transparent: true });
    holoTag(shieldProp, "face shield", 0, 0.18, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, shieldProp, "face-shield");

    const closingLog = group(g, 3.4, 0, -0.6, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("FUEL LOG\nOPEN", { bg: "#11181f", accent: "#59c97b", scale: 0.3 }), { px: 320 });
    holoTag(closingLog, "fuel log", 0, 1.34, 0, { css: "#59c97b", w: 0.24 });
    reg(hits, closingLog, "closing-log");

    const attendant = standingFigure(g, -1.6, -1.0, { ry: 2.0, cloth: 0x2b3138, vest: AVGP_ACCENT, helmet: 0xf2f2f2 });
    holoTag(attendant, "fuel attendant", 0, 1.95, 0.15, { css: "#59c97b", w: 0.34 });

    const dust = particles(g, 14, 0x9a8a6a, { size: 0.02, life: 0.5, additive: false, opacity: 0.12 });

    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.4),

      onInterrupt(it) {
        if (it.id === "bonding-clamp-slips") { bondingClamp.position.x -= 0.12; }
        if (it.id === "spill-at-connection") {
          spillPuddle.visible = true;
          repaint(flowGauge.userData.screen, signFace("SPILL", { bg: "#2a1610", accent: "#f0645b", fg: "#ffd9d0", scale: 0.5 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bonding-clamp-slips") { bondingClamp.position.x += 0.12; }
        if (it.id === "spill-at-connection") {
          spillPuddle.visible = false;
          repaint(flowGauge.userData.screen, signFace("-- gpm", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
      },
      onStepComplete(step) {
        if (step.id === "inspect-gpu") {
          frayedCable.children[0].material = mat(0x59c97b, { rough: 0.5 });
          damagedPlug.children[0].material = mat(0x59c97b, { rough: 0.6 });
          crackedHose.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "connect-gpu") {
          repaint(engineOffConfirm.userData.screen, signFace("OFF", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (step.id === "bond-before-fuel") { bondCable.visible = true; }
        if (step.id === "gpu-disconnect-confirm") {
          repaint(engineStatus2.userData.screen, signFace("READY", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }));
        }
        if (step.id === "closeout-log") {
          repaint(closingLogFace, signFace("FUEL LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        attendant.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        void truckHome;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-fuel-quantity") {
          repaint(fuelQtyGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(2.0, 0.3, 1.0), 0.15, 0.1, -0.08);
      },
    };
  },
};
