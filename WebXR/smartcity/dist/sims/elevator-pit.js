import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Elevator Pit VR — its own gamified system: Shaftway Authority.
// Pit and car-top entry. The machine room disconnect stops the drive; it does
// not stop the discussion about whether the car can still move. That is what
// the two independent stop switches — pit and car-top — are actually for.

export const SIM_ELEVATOR_PIT = {
  id: "elevator-pit",
  index: "16",
  domain: "Facilities",
  trade: "Elevator constructor / mechanic",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "IUEC — NAESA QEI-qualified elevator mechanic",
  name: "Elevator Pit",
  title: simTitle("Elevator Pit"),
  tagline: "Pit and car-top entry: main line lockout, dual stop switches and governor inspection",
  accent: 0x2dd4bf,
  accentCss: "#2dd4bf",
  parSeconds: 235,
  badge: { id: "pit-certified", name: "Pit Certified", note: "Pit and car-top entry with both stop switches confirmed" },

  game: system({
    name: "Shaftway Authority",
    currency: "SHAFT",
    ranks: ["Pit Hand", "Car Mechanic", "Adjuster", "Inspector Lead", "Shaftway Certified"],
    badges: [
      { id: "dual-switch", name: "Dual Switch Certified", note: "Never enter the pit or car top unconfirmed", test: AWARD.safe },
      { id: "governor-sharp", name: "Governor Sharp", note: "Hold every reading near band centre", test: AWARD.precise(0.7) },
      { id: "clean-restore", name: "Clean Restore", note: "Restore power in the correct order, no correction", test: AWARD.stepClean("restore") },
    ],
    challenges: [
      { id: "shift-turnaround", name: "Shift Turnaround", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "pit-streak", name: "Pit Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "counterweight-zone": "You stepped into the counterweight runby without the pit stop-switch confirmed engaged. If the switch is not truly holding the drive, an arriving car or counterweight gives no warning and no time to get clear — crush and shear injuries here are almost always fatal.",
    "cartop-edge": "You leaned past the car-top rail with the car-top stop switch not yet engaged. The pit switch does not protect someone standing on the car itself — an unswitched car can still answer a call and carry you into the overhead clearance.",
    "frayed-governor-rope": "That governor rope has visibly broken wires that were ignored during inspection. A frayed rope can slip or part before it ever pulls the safeties, which is exactly the failure the governor exists to catch.",
    "quick-restore-switch": "That is a shortcut restore switch, not the proper sequence. Closing it re-energises the car before anyone has confirmed the pit and car top are clear of people and the locks have come off in order.",
  },

  lateNotes: {
    "cartop-stop-switch": "The car-top switch is only reachable once you are already standing on the car — it is not operated from the pit floor below.",
    "governor-instrument": "Governor rope condition is only checked once both stop switches are confirmed and the car top is safe to stand on.",
  },

  steps: [
    {
      id: "permit", kind: "select", target: "work-order",
      title: "Open the work permit and post out-of-service",
      cue: "Read the permit and confirm the car-out-of-service signage is posted at every landing.",
      why: "The signage is what keeps a passenger from calling a car that a mechanic is standing inside. It goes up before the disconnect comes down.",
    },
    {
      id: "disconnect", kind: "turn", target: "main-disconnect",
      title: "Open the main line disconnect",
      cue: "Grab the machine room's main line disconnect handle and pull it open.",
      why: "The disconnect is the isolation. Nothing in the pit or on the car top is approached before the drive has no source of power.",
      turn: { turns: 0.2, axis: "z", reverse: true, label: "MAIN LINE DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lockout-hasp",
      title: "Lock and tag the disconnect",
      cue: "Apply your padlock and tag to the disconnect.",
      why: "Your lock says the isolation belongs to you specifically. Nobody re-energises this car while your lock is still on the switch.",
    },
    {
      id: "verify-zero", kind: "gauge", target: "panel-meter",
      title: "Verify zero energy at the controller",
      cue: "Meter the drive input and commit when it reads dead.",
      why: "The disconnect being open is not proof by itself. You confirm zero energy the same way for every isolation, every time, before anyone goes near the shaft.",
      gauge: {
        label: "DRIVE INPUT — VOLTAGE", speed: 0.65, green: [0.0, 0.08],
        readout: (t) => `${Math.round(t * 480)} V`,
        missNote: "Still reading live. Recheck the disconnect before anyone goes near the pit or the car top.",
      },
    },
    {
      id: "pit-switch", kind: "select", target: "pit-stop-switch",
      title: "Engage the pit stop switch",
      cue: "Confirm the pit stop switch is ON before you set foot on the ladder.",
      why: "The machine room disconnect and the pit switch are two independent controls. The pit switch is the one you can see holding from inside the pit itself.",
    },
    {
      id: "pit-entry", kind: "select", target: "pit-ladder",
      title: "Descend into the pit",
      cue: "Climb down the fixed pit ladder now that the switch is confirmed.",
      why: "Entry happens after the switch is confirmed engaged, never on the assumption that the machine room disconnect alone is enough.",
    },
    {
      id: "buffer-check", kind: "find", noHint: true,
      targets: ["worn-buffer", "loose-rung", "sump-overflow"],
      itemNames: {
        "worn-buffer": "cracked buffer", "loose-rung": "corroded ladder rung", "sump-overflow": "flooded sump pit",
      },
      itemNotes: {
        "worn-buffer": "A cracked spring buffer cannot absorb an over-travel the way it is rated to — tag it out and replace it before the car runs again.",
        "loose-rung": "A corroded rung fails exactly when someone puts their full weight on it climbing out in a hurry.",
        "sump-overflow": "Standing water in the pit is both a slip hazard and a shock hazard around any pit lighting or wiring.",
      },
      decoyNotes: {
        "sound-buffer": "That buffer is sound — no action needed.",
        "secure-rung": "That rung is solid and correctly fastened.",
      },
      title: "Inspect the buffers and pit ladder",
      cue: "Walk the pit. Three things are wrong — find them by looking.",
      why: "A pit inspection is a search for what has quietly failed since the last visit, not a checklist tick from the doorway.",
    },
    {
      id: "cartop-switch", kind: "select", target: "cartop-stop-switch",
      title: "Engage the car-top stop switch",
      cue: "Climb to the car top and confirm the car-top stop switch is ON.",
      why: "This is the second independent switch. The pit switch protects the pit; this one protects whoever is standing on the car itself.",
    },
    {
      id: "cartop-access", kind: "select", target: "car-top-hatch",
      title: "Open the car-top access and enter inspection mode",
      cue: "Open the hatch and set the car to car-top inspection mode.",
      why: "Inspection mode caps the car's speed and puts operation under your hand at the car-top station, not under a passenger call.",
    },
    {
      id: "governor-check", kind: "gauge", target: "governor-instrument",
      title: "Check the governor rope tension",
      cue: "Read the governor rope tension and commit inside the rated band.",
      why: "A governor that cannot pull free at the right tension will not trip the safeties at overspeed — this is checked on its own, not assumed from the rope looking fine.",
      gauge: {
        label: "GOVERNOR ROPE — TENSION", speed: 0.6, green: [0.42, 0.58],
        readout: (t) => `${Math.round(t * 220)} N`,
        missNote: "Outside the rated tension. Adjust and recheck before the car goes back in service.",
      },
    },
    {
      id: "restore", kind: "sequence",
      targets: ["cartop-stop-switch", "pit-stop-switch", "main-disconnect"],
      itemNames: {
        "cartop-stop-switch": "car-top stop switch", "pit-stop-switch": "pit stop switch", "main-disconnect": "main line disconnect",
      },
      title: "Restore in the correct order",
      cue: "Release the car-top switch, then the pit switch, then close the main disconnect.",
      why: "Release from the top down: you confirm the car top clear before the pit, and the pit clear before power goes back to the drive.",
      outOfOrderNote: "Wrong order — release the car-top switch first, then the pit switch, and close the main disconnect last.",
    },
    {
      id: "test-run", kind: "select", target: "controller-panel",
      title: "Run a test operation before release",
      cue: "Remove the lock, close the disconnect and run the car on a test trip.",
      why: "The car is not returned to service on the assumption the work went well — it is proven with an actual run first.",
    },
  ],

  // Two things that happen while a mechanic is down a hole or standing on a
  // car, with their back to the rest of the building. Both are visible from
  // where the learner is standing — see shared/game.js.
  interrupts: [
    {
      id: "hall-call",
      kind: "Call registered",
      after: "buffer-check", delay: 5, seconds: 12,
      alert: "A hall call has registered upstairs. Somebody is standing at a landing pressing the button, and you are in the pit.",
      cue: "Prove the switch is still holding the car.",
      target: "pit-stop-switch",
      why: "A registered call is the building telling you it still thinks this car is in service. The pit switch is the only thing between that call and the car coming down on top of you, so it gets confirmed, not assumed.",
      missNote: "You stayed in the runby with a live call registered and an unconfirmed switch. If that switch had been knocked off its detent on the way in — and they do get knocked — the first warning would have been the counterweight passing your head.",
      wrongNote: "It is the pit stop switch. While you are standing in the runby with a call registered, nothing else in this shaft is worth looking at.",
    },
    {
      id: "lock-tampered",
      kind: "Lock interfered with",
      after: "governor-check", delay: 4, seconds: 11,
      alert: "Somebody at the machine room end has started working your lock off the hasp to run the car for another job.",
      cue: "That is your lock and your life on the end of it.",
      target: "lockout-hasp",
      why: "One lock, one person, one key, removed by the person who fitted it and nobody else. A lock coming off while you are standing on the car is the exact sequence that the whole procedure exists to make impossible.",
      missNote: "The lock came off while you were on the car top. Everything after that depended on the other mechanic deciding not to press the button — which is not a control, it is a hope.",
      wrongNote: "It is the hasp with your lock on it. Stop what you are doing and go to the lock.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.0, 0x2dd4bf);

    // ------------------------------------------------------------- machine room floor
    box(g, 4.2, 0.16, 4.2, 0, 0.08, 0, 0x555c63, { rough: 0.9 });
    for (let i = -2; i <= 2; i++) {
      box(g, 4.2, 0.004, 0.02, 0, 0.165, i * 0.85, 0x434a52, { cast: false, receive: false });
    }

    // --------------------------------------------------------------------- the shaft
    const shaftX = -0.35, shaftZ = -0.3, shaftR = 0.52;
    const shaft = group(g, shaftX, 0, shaftZ);
    cyl(shaft, shaftR, shaftR, 1.95, 0, -0.98, 0, 0x14181e, { rough: 0.98, seg: 26, open: true, side: 2, cast: false });
    const pitFloor = cyl(shaft, shaftR, shaftR, 0.03, 0, -1.94, 0, 0x101318, { rough: 0.95, seg: 24, cast: false });

    // Fixed pit ladder along the shaft wall.
    const ladder = group(shaft, 0, 0, -shaftR + 0.06);
    for (const sx of [-1, 1]) cyl(ladder, 0.015, 0.015, 1.85, sx * 0.15, -0.98, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 });
    const rungs = [];
    for (let i = 0; i < 6; i++) {
      const r = cyl(ladder, 0.011, 0.011, 0.3, 0, -0.16 - i * 0.3, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 });
      r.rotation.z = Math.PI / 2;
      rungs.push(r);
    }
    reg(hits, ladder, "pit-ladder");
    rungs[3].material = mat(0x7a5a3a, { rough: 0.85, metal: 0.3 });
    decal(ladder, 0.1, 0.03, 0.02, -1.06, 0, signFace("CORRODED", { bg: "#2a1a0d", accent: "#f0645b", scale: 0.5 }), { px: 128 });
    reg(hits, rungs[3], "loose-rung");

    // Buffers on the pit floor — one under the car, one under the counterweight.
    const carBuffer = cyl(shaft, 0.055, 0.06, 0.32, 0.16, -1.78, 0.1, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 14 });
    decal(shaft, 0.09, 0.03, 0.16, -1.6, 0.16, signFace("CRACKED", { bg: "#2a1a0d", accent: "#f0645b", scale: 0.5 }), { px: 128 });
    reg(hits, carBuffer, "worn-buffer");
    cyl(shaft, 0.055, 0.06, 0.32, -0.2, -1.78, -0.22, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 14 });

    // Flooded sump in the far corner of the pit floor.
    const sump = group(shaft, -0.28, -1.9, 0.22);
    cyl(sump, 0.14, 0.14, 0.06, 0, 0.02, 0, 0x1b2126, { rough: 0.6, metal: 0.3, seg: 16 });
    const sumpWater = particles(sump, 20, 0x4fa3ff, { size: 0.014, life: 0.5, additive: false, opacity: 0.5 });
    holoTag(sump, "Sump", 0, 0.16, 0, { css: "#f0645b", w: 0.24 });
    reg(hits, sump, "sump-overflow");

    // Counterweight, parked low in the runby with a marked hazard zone at its base.
    const cwt = group(shaft, 0.05, 0, -0.24);
    for (const sx of [-1, 1]) cyl(cwt, 0.01, 0.01, 1.7, sx * 0.09, -1.05, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 });
    for (let i = 0; i < 5; i++) {
      box(cwt, 0.2, 0.09, 0.14, 0, -1.85 + i * 0.1, 0, 0x545e67, { rough: 0.55, metal: 0.4 });
    }
    torus(shaft, 0.22, 0.014, 0.05, -1.93, -0.24, 0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 28 })
      .rotation.x = Math.PI / 2;
    reg(hits, cwt, "counterweight-zone");

    // ------------------------------------------------------------------------ the car
    const car = group(g, shaftX, 0, shaftZ);
    box(car, 0.86, 1.0, 0.86, 0, 0.5, 0, 0x36414b, { rough: 0.55, metal: 0.3 });
    const carTop = group(car, 0, 1.0, 0);
    box(carTop, 0.9, 0.03, 0.9, 0, 0, 0, 0x2b3339, { rough: 0.55, metal: 0.4 });
    const rail = group(carTop, 0, 0.28, 0);
    for (const [rx, rz, ry] of [[0, -0.42, 0], [-0.42, 0, Math.PI / 2], [0.42, 0, Math.PI / 2]]) {
      box(rail, 0.86, 0.03, 0.02, rx, 0, rz, 0xd8b23a, { rough: 0.6 }).rotation.y = ry;
    }
    holoTag(rail, "Open edge — no rail", 0.42, 0, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, box(carTop, 0.02, 0.3, 0.9, 0.43, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }),
      "cartop-edge");

    const hatch = group(carTop, -0.15, 0.02, 0.1, 0.15);
    box(hatch, 0.36, 0.02, 0.34, 0, 0, 0, 0x3c4650, { rough: 0.5, metal: 0.4 });
    box(hatch, 0.06, 0.03, 0.02, 0.12, 0.02, 0.16, CITY.steel, { rough: 0.35, metal: 0.85 });
    holoTag(hatch, "Car-top hatch", 0, 0.12, 0, { css: "#2dd4bf", w: 0.3 });
    reg(hits, hatch, "car-top-hatch");

    const cartopSwitch = group(carTop, 0.24, 0.02, -0.28, -0.3);
    box(cartopSwitch, 0.12, 0.14, 0.06, 0, 0.07, 0, 0x22272c, { rough: 0.5, metal: 0.4 });
    const cartopLever = box(cartopSwitch, 0.03, 0.08, 0.03, 0, 0.15, 0.02, 0xd8232a, { rough: 0.5 });
    const cartopLamp = ball(cartopSwitch, 0.014, 0, 0.13, 0.035, 0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
    holoTag(cartopSwitch, "Car-top stop", 0, 0.24, 0, { css: "#2dd4bf", w: 0.3 });
    reg(hits, cartopSwitch, "cartop-stop-switch");

    // -------------------------------------------------------------- governor + rope
    const governor = group(g, 0.55, 0, -1.6, -0.4);
    cyl(governor, 0.16, 0.16, 0.08, 0, 1.55, 0, 0x53585e, { rough: 0.5, metal: 0.5, seg: 18 });
    cyl(governor, 0.05, 0.05, 0.1, 0, 1.55, 0.1, 0x22272c, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(governor, "Governor", 0, 1.75, 0.05, { css: "#2dd4bf", w: 0.26 });
    const govInstrument = instrument(governor, 0, 1.35, 0.14, { ry: 0, idle: "-- N", color: 0x2dd4bf });
    reg(hits, govInstrument, "governor-instrument");

    const ropePts = [[0.55, 1.5, -1.55], [0.4, 0.6, -0.85], [0.15, -0.6, -0.4], [-0.1, -1.5, -0.32], [-0.23, -1.9, -0.24]];
    hose(g, ropePts, 0.01, 0xdfe4e8, { steps: 20, rough: 0.6, metal: 0.5 });
    const frayGroup = group(g, 0.2, -0.4, -0.5, 0.3);
    for (let i = 0; i < 5; i++) {
      hose(frayGroup, [[0, -0.06 + i * 0.03, 0], [(Math.random() - 0.5) * 0.09, 0.06 + i * 0.03, (Math.random() - 0.5) * 0.06]],
        0.003, 0xc0c6cc, { steps: 4, rough: 0.6 });
    }
    holoTag(frayGroup, "Broken wires", 0, 0.14, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, frayGroup, "frayed-governor-rope");

    // ------------------------------------------------------------------ machine room
    const wall = group(g, 1.55, 0, -0.6, -0.5);
    slab(wall, 0.44, 1.1, 0.26, 0, 0.75, 0, 0x545e67, { radius: 0.03, rough: 0.5, metal: 0.5 });
    const discHandle = group(wall, 0, 1.0, 0.14);
    box(discHandle, 0.05, 0.16, 0.05, 0, 0, 0, 0xf0645b, { rough: 0.5 });
    decal(wall, 0.36, 0.06, 0, 1.24, 0.135, signFace("MAIN LINE DISCONNECT", { accent: "#2dd4bf", scale: 0.4 }));
    reg(hits, discHandle, "main-disconnect");

    const hasp = torus(wall, 0.022, 0.006, 0.13, 0.62, 0.14, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, hasp, "lockout-hasp");
    const appliedLock = lockTag(wall, 0.13, 0.62, 0.16);
    appliedLock.visible = false;

    const restoreBtn = group(wall, -0.13, 0.5, 0.14);
    cyl(restoreBtn, 0.045, 0.045, 0.04, 0, 0, 0.02, 0xf2c14b, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    decal(restoreBtn, 0.08, 0.025, 0, -0.05, 0.02, signFace("RESTORE", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.5 }), { px: 96 });
    holoTag(restoreBtn, "Bypass — do not use", 0, 0.08, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, restoreBtn, "quick-restore-switch");

    const controller = group(g, 1.7, 0, 0.6, -0.9);
    slab(controller, 0.3, 0.4, 0.1, 0, 0.95, 0, 0x2b3138, { radius: 0.03, rough: 0.5, metal: 0.4 });
    const controllerScreen = decal(controller, 0.24, 0.16, 0, 1.05, 0.052,
      signFace("ARMED", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.4 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(controller, "Car controller", 0, 1.2, 0.06, { css: "#2dd4bf", w: 0.3 });
    // The landing-call lamp. Dark all run, until somebody upstairs presses a
    // button while the learner is standing in the runby.
    const callLamp = ball(controller, 0.022, 0.1, 1.16, 0.05, 0xf2c14b, { emissive: 0xf2c14b, ei: 2.4 });
    callLamp.visible = false;
    reg(hits, controller, "controller-panel");

    const pitSwitch = group(g, -0.35, 0, 0.28, 0.2);
    box(pitSwitch, 0.14, 0.18, 0.08, 0, 0.65, 0, 0x22272c, { rough: 0.5, metal: 0.4 });
    const pitLever = box(pitSwitch, 0.035, 0.09, 0.035, 0, 0.73, 0.03, 0xd8232a, { rough: 0.5 });
    const pitLamp = ball(pitSwitch, 0.016, 0, 0.79, 0.05, 0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
    decal(pitSwitch, 0.11, 0.04, 0, 0.55, 0.041, signFace("PIT STOP", { accent: "#2dd4bf", scale: 0.5 }), { px: 128 });
    holoTag(pitSwitch, "Pit stop switch", 0, 0.85, 0, { css: "#2dd4bf", w: 0.32 });
    reg(hits, pitSwitch, "pit-stop-switch");

    // ------------------------------------------------------------------- tool + docs
    const chest = toolChest(g, 1.5, 1.55, { ry: -0.7, color: 0x2dd4bf });
    const meter = instrument(chest, -0.06, 0.79, 0.02, { ry: 0.3, idle: "-- V", color: 0x2dd4bf });
    holoTag(meter, "CAT III meter", 0, 0.16, 0, { css: "#2dd4bf", w: 0.28 });
    reg(hits, meter, "panel-meter");

    const workOrder = holoPanel(g, 0.56, 0.4, -1.85, 1.5, 1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2dd4bf"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fc4bc";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK PERMIT EL-441", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eafffb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CAR 3 — PIT + CAR-TOP", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9d6ce";
      ["Isolation: machine room DS-3", "Pit switch + car-top switch, both", "Governor tension: 190-210 N",
       "Signage: all landings out-of-service", "Test run before release"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0x2dd4bf });
    reg(hits, workOrder, "work-order");

    let live = true;
    let pitOn = false;
    let cartopOn = false;

    return {
      hits,
      footprint: 2.0,

      onStepComplete(step) {
        // discHandle is turned live by the player's drag while this step is active.
        if (step.id === "disconnect") { live = false; repaint(controllerScreen, signFace("ISOLATED", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.38 })); }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "verify-zero") repaint(controllerScreen, signFace("DE-ENERGISED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        if (step.id === "pit-switch") { pitOn = true; pitLever.rotation.x = -1.0; pitLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 }); }
        if (step.id === "cartop-switch") { cartopOn = true; cartopLever.rotation.x = -1.0; cartopLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 }); }
        if (step.id === "cartop-access") hatch.rotation.x = -1.1;
        if (step.id === "restore") {
          pitOn = false; cartopOn = false;
          pitLever.rotation.x = 0; cartopLever.rotation.x = 0;
          pitLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
          cartopLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
          appliedLock.visible = false; discHandle.rotation.z = 0; live = true;
          repaint(controllerScreen, signFace("READY", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
        }
        if (step.id === "test-run") repaint(controllerScreen, signFace("TEST\nTRIP OK", { bg: "#0d1c14", accent: "#2dd4bf", fg: "#bfeaf7", scale: 0.32 }));
      },

      // The call really registers on the controller, and the lock really moves
      // on the hasp. A learner who looks up sees what the alert describes.
      onInterrupt(it) {
        if (it.id === "hall-call") {
          callLamp.visible = true;
          repaint(controllerScreen, signFace("HALL CALL\nLANDING 3", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.3 }));
        }
        if (it.id === "lock-tampered") { appliedLock.rotation.z += 0.9; appliedLock.position.y += 0.04; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hall-call") {
          callLamp.visible = false;
          repaint(controllerScreen, signFace("DE-ENERGISED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
        if (it.id === "lock-tampered") { appliedLock.rotation.z -= 0.9; appliedLock.position.y -= 0.04; }
      },

      animate(t, dt, session) {
        sumpWater.visible = true;
        sumpWater.userData.step(dt, new THREE.Vector3(0, 0.04, 0), 0.1, 0.08, -0.6);
        if (live) controllerScreen.material.emissiveIntensity = 0.7 + Math.sin(t * 2) * 0.15;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "verify-zero") {
            const v = Math.round(gg.t * 480);
            repaint(meter.userData.screen, signFace(`${v} V`, {
              bg: "#0d1c24", accent: v < 38 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
            }));
          }
          if (session.step?.id === "governor-check") {
            const n = Math.round(gg.t * 220);
            repaint(govInstrument.userData.screen, signFace(`${n} N`, {
              bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.58 ? "#59c97b" : "#f2c14b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
