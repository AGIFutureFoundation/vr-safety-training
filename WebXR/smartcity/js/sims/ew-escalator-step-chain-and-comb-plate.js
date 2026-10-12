import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
  gradientFill, noiseTexture, grimeOverlay,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag,
  standingFigure, surfaceTexture, texturedMat, paintedSteelFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Escalator Step Chain and Comb Plate VR — IUEC elevator
// constructors, escalator maintenance. An escalator's step chain, comb plate
// and safety switches are all built around the same fact: a step meshing
// correctly with a comb plate is a machine; a step meshing incorrectly with
// it is an entrapment point running at walking speed with the public
// standing on it. This station tests every device built to catch that before
// a passenger ever does.

const EWESC_ACCENT = 0xf2c14b;

/** Mall concourse tile floor: warm stone-look tile with a wide grout grid. */
function ewescTileFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#8f8270"], [1, o.base2 ?? "#7d715f"]]);
  noiseTexture(g, w, h, { density: 1400, alpha: 0.05, tone: "255,250,235" });
  const tiles = o.tiles ?? 4, t = w / tiles;
  g.fillStyle = "rgba(40,32,20,0.3)";
  for (let i = 0; i <= tiles; i++) { g.fillRect(i * t - 1, 0, 2, h); g.fillRect(0, i * t - 1, w, 2); }
  grimeOverlay(g, w, h, { blotches: 2, streaks: 1, tone: "30,24,14", alpha: 0.07 });
}

export const SIM_EW_ESCALATOR_STEP_CHAIN_AND_COMB_PLATE = {
  id: "ew-escalator-step-chain-and-comb-plate",
  index: "357",
  domain: "Facilities",
  trade: "Elevator constructor / mechanic — IUEC",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "IUEC elevator constructors; NEIEP apprenticeship curriculum for escalator maintenance; ASME A17.1 the safety code for elevators and escalators, whose escalator step, comb plate and safety-device provisions this station follows; OSHA 29 CFR 1910.147 control of hazardous energy for the drive machine isolation",
  name: "Escalator Step Chain and Comb Plate",
  title: simTitle("Escalator Step Chain and Comb Plate"),
  tagline: "Isolating the drive, inspecting the step chain and comb teeth, gauging chain tension and skirt clearance, and proving the comb, skirt and handrail safety switches before reopening",
  accent: EWESC_ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 260,
  footprint: 2.4,
  badge: { id: "escalator-proven", name: "Escalator Proven", note: "Step chain, comb plate and every safety switch proven before the barricades came down" },

  game: system({
    name: "Comb Plate Authority",
    currency: "MESH",
    ranks: ["Helper", "Escalator Mechanic", "Adjuster", "Lead Mechanic", "Comb Plate Authority Certified"],
    badges: [
      { id: "isolated-first", name: "Isolated First", note: "Never worked the step band before the drive was isolated and locked", test: AWARD.stepClean("lock") },
      { id: "true-mesh", name: "True Mesh", note: "Held chain tension, skirt clearance and handrail speed all near band centre", test: AWARD.precise(0.7) },
      { id: "clean-restore", name: "Clean Restore", note: "Restored in the correct order, no correction", test: AWARD.stepClean("restore") },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "switch-tests-clean", name: "Switch Tests Clean", note: "Every safety switch test answered without a correction", test: AWARD.unbroken },
      { id: "escalator-fast", name: "Escalator Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "step-chain-pinch": "You reached toward the step chain and sprocket before the drive was proven dead. The chain runs at a shear point between the sprocket teeth and the chain itself, and that point does not care whether the reason a hand is there is curiosity or a wrench that slipped.",
    "comb-plate-entrapment": "You tested the comb plate switch with your fingers in the meshing line instead of a test object. The comb teeth are built to mesh with the step's own cleats at a fine tolerance, and that same tolerance is exactly what makes it an entrapment point for anything thinner than a step tread — a shoelace, a glove, a finger.",
    "skirt-panel-gap": "You put a hand into the gap between the step and the skirt panel while checking clearance. That gap is supposed to be too narrow for anything to enter it while the step is moving, and a hand that finds a wider spot than it should has found the exact defect this inspection exists to catch — from the inspector's own hand, if the switch it should be testing is bypassed instead.",
    "handrail-pinch-point": "You reached into the handrail's entry point at the newel while it was still capable of moving. That is the one place on the handrail loop where the belt disappears into the balustrade, and a hand that follows it in does not come back out at newel speed.",
  },

  lateNotes: {
    "step-chain-tension": "Chain tension is only measured once the drive is proven dead and the step band is not moving.",
    "comb-impact-switch": "The comb switch is only tested with a proper test object, once the chain and skirt readings are already logged.",
  },

  supportLine: "your IUEC local's member assistance programme, or the NEIEP training coordinator for anything about the certification record",

  steps: [
    {
      id: "checkin", kind: "select", target: "job-ticket",
      title: "Check in at the escalator",
      cue: "Read the job ticket and confirm which unit this service call is for.",
      why: "A concourse can run two or three escalators side by side, and the ticket names the specific unit — up or down run, the landing it serves — before a lock goes on any disconnect, so the unit taken out of service is the one actually due.",
    },
    {
      id: "permit", kind: "select", target: "escalator-permit",
      title: "Barricade both landings",
      cue: "Read the work order and confirm barricades are up at the top and bottom landings before the drive is touched.",
      why: "An escalator with people still able to step onto it is an escalator this job cannot safely isolate — the barricades go up at both ends first, because a passenger who starts up a stalled unit while a mechanic is at the step chain has no way of knowing what they have just stepped onto.",
    },
    {
      id: "disconnect", kind: "turn", target: "main-disconnect",
      title: "Open the drive machine disconnect",
      cue: "Pull the escalator drive's main disconnect handle firmly to its open stop.",
      why: "The disconnect is pulled fully open rather than eased over, because a switch left between positions can leave the drive motor able to creep — and a step band that creeps while a mechanic is reaching into the chain is the exact failure this isolation exists to prevent.",
      turn: { turns: 0.2, axis: "z", reverse: true, label: "DRIVE DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lockout-hasp",
      title: "Lock and tag the disconnect",
      cue: "Apply your padlock and tag to the disconnect before touching the step band.",
      why: "The chain and comb work ahead of this step both put hands inside a mechanism built to mesh things together at speed, and the lock is what keeps that mechanism from being anyone else's to restart while those hands are in it.",
    },
    {
      id: "verify-zero", kind: "gauge", target: "drive-meter",
      title: "Verify zero energy at the drive",
      cue: "Meter the drive motor's input and commit when it reads dead.",
      why: "A locked disconnect describes the switch; the meter is the only proof about the motor itself, read live-dead-live so a blown fuse in the meter cannot hand back a comfortable false dead before anyone's hands go near the chain.",
      gauge: {
        label: "DRIVE INPUT — VOLTAGE", speed: 0.6, green: [0.0, 0.08],
        readout: (t) => `${Math.round(t * 480)} V`,
        missNote: "Still reading live. Recheck the disconnect before the step band is touched.",
      },
    },
    {
      id: "comb-inspect", kind: "find", noHint: true,
      targets: ["cracked-comb-tooth", "worn-skirt-brush", "missing-cleat"],
      itemNames: { "cracked-comb-tooth": "a cracked comb plate tooth", "worn-skirt-brush": "a worn skirt brush", "missing-cleat": "a step with a missing cleat" },
      itemNotes: {
        "cracked-comb-tooth": "A cracked comb tooth can shed a fragment into the mechanism below it, and a comb plate missing teeth stops doing the one thing it is there for — clearing debris out of the mesh point before it gets carried under with a passenger's foot.",
        "worn-skirt-brush": "A worn skirt brush stops discouraging feet and loose clothing away from the skirt panel gap, which is exactly the gap this service is about to measure and prove is not an entrapment risk on its own.",
        "missing-cleat": "A step with a missing cleat cannot mesh correctly with the comb plate no matter how well that comb plate is adjusted — the fault has to be found on the step, not chased on the comb.",
      },
      title: "Walk the step band before running anything",
      cue: "Look over the comb teeth, the skirt brushes and a few steps. Three things need fixing before this unit is tested.",
      why: "A stalled step band is inspected the same way a hoistway is — a careful look while nothing is moving, because half of what matters here disappears from view the moment the unit is running again.",
    },
    {
      id: "chain-tension", kind: "gauge", target: "step-chain-tension",
      title: "Measure the step chain tension",
      cue: "Set the tension gauge on the step chain and commit the reading inside the manufacturer's band.",
      why: "A chain too slack rides rough over the sprockets and can jump teeth under load; a chain over-tensioned wears its own pins and bushings faster than the schedule accounts for. Neither fault is visible standing still — it is read off the gauge against the number the manufacturer rated this chain to.",
      gauge: {
        label: "CHAIN TENSION", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => `${Math.round(t * 400)} N`,
        missNote: "Outside the rated band. Adjust the take-up and measure again before this unit runs.",
      },
    },
    {
      id: "skirt-gap", kind: "gauge", target: "skirt-clearance",
      title: "Measure the skirt-to-step clearance",
      cue: "Set the feeler gauge in the skirt-to-step gap and commit the reading inside spec.",
      why: "The gap between a moving step and the fixed skirt panel beside it is the whole of what stands between a shoe and an entrapment, and it is measured with a gauge against a number, not judged by whether a shoe happens to fit through it comfortably today.",
      gauge: {
        label: "SKIRT CLEARANCE", speed: 0.55, green: [0.4, 0.6],
        readout: (t) => `${(2 + t * 3).toFixed(1)} mm`,
        missNote: "Outside spec. Adjust the skirt panel and measure again before this unit is trusted with passengers against it.",
      },
    },
    {
      id: "comb-switch-test", kind: "select", target: "comb-impact-switch",
      title: "Test the comb impact switch",
      cue: "Press a test object against the comb plate and confirm the impact switch trips the drive.",
      why: "The comb switch is what stops this unit the instant something meets the comb plate that should not be there, and it is proven with an actual test object pressed against it — not assumed to work because the comb looks undamaged sitting still.",
    },
    {
      id: "skirt-switch-test", kind: "select", target: "skirt-obstruction-switch",
      title: "Test the skirt obstruction switch",
      cue: "Press the skirt panel's test point and confirm the obstruction switch trips the drive.",
      why: "This switch is the skirt panel's own version of the comb switch — it stops the unit the moment something presses against the skirt hard enough to suggest an entrapment starting, and it only earns trust from an actual trip, tested today.",
    },
    {
      id: "handrail-sync", kind: "gauge", target: "handrail-speed",
      title: "Check handrail-to-step speed synchronization",
      cue: "Run the drive on test and commit the handrail speed reading against the step band's own speed.",
      why: "A handrail running faster or slower than the steps beneath it is a small, constant drag on every passenger's hand for the whole ride, and it is exactly the kind of fault that a rider notices and a mechanic standing at the landing does not — unless it is actually measured against the step speed.",
      gauge: {
        label: "HANDRAIL SYNC", speed: 0.55, green: [0.44, 0.56],
        readout: (t) => `${(t * 200 - 100).toFixed(0)}% of step speed`,
        missNote: "Out of sync. Adjust the handrail drive and measure again before this unit is signed off.",
      },
    },
    {
      id: "lubrication", kind: "drag", target: "oil-can",
      title: "Lubricate the step chain",
      cue: "Carry the chain oil to the lubrication point and apply it along the chain.",
      why: "The chain is lubricated last, after its tension is already measured and logged, so the reading on file is the chain's true tension and not one skewed by oil that was never accounted for.",
      drag: { to: "chain-lube-point", radius: 0.4, missNote: "Not at the lubrication point. Oil applied anywhere else on the chain run does nothing for the pins and bushings it is meant to reach." },
    },
    {
      id: "restore", kind: "sequence",
      targets: ["lockout-hasp", "main-disconnect"],
      itemNames: { "lockout-hasp": "your lock off the hasp", "main-disconnect": "drive disconnect" },
      title: "Restore power in the correct order",
      cue: "Take your lock off the hasp, then close the drive disconnect.",
      why: "The lock is the last thing off before power, because it is what has kept this drive somebody else's to restart for the whole time it has been isolated — and closing the disconnect only happens once every hand that has been in the step chain is actually clear of it.",
      outOfOrderNote: "Wrong order — your lock off first, and the disconnect closed last.",
    },
    {
      id: "log", kind: "select", target: "escalator-log",
      title: "Log the service",
      cue: "Write the chain tension, skirt clearance, handrail sync and today's findings on the escalator log.",
      why: "The next mechanic who opens this unit reads this log before they read the chain itself, and a tension or clearance number left unwritten today is a number somebody else has to remeasure from zero the next time this unit is due.",
    },
  ],

  interrupts: [
    {
      id: "passenger-climbs-barricade",
      kind: "Barricade breached",
      after: "comb-inspect", delay: 4, seconds: 12,
      alert: "A passenger has just stepped over the barricade at the bottom landing and is walking toward the stalled step band.",
      cue: "Get to the barricade before they reach the steps.",
      target: "top-barricade",
      why: "A stalled escalator with its barricades breached is a passenger about to stand on a step band with a mechanic's hands somewhere in the chain below it — the barricade gets re-secured, and the passenger turned back, before anything about the inspection continues.",
      missNote: "The passenger reached the steps with the barricade left open behind them. A stalled unit gives no visible sign of the isolation holding it there, and a passenger standing on it has no way to know what is happening underneath.",
      wrongNote: "It is the barricade. Whoever just walked past it needs to be stopped before they reach the steps.",
    },
    {
      id: "second-mechanic-restart",
      kind: "Disconnect interfered with",
      after: "chain-tension", delay: 4, seconds: 11,
      alert: "A second mechanic has arrived to help and is reaching for the main disconnect to restore power early.",
      cue: "Stop them — the chain and comb work is not finished.",
      target: "main-disconnect",
      why: "Two mechanics on one job means two people who can each be sure the other one has finished — which is exactly how a disconnect gets closed while a hand is still in the step chain. It gets stopped here, with a word, not discovered after the fact.",
      missNote: "The disconnect started to close with the step chain work still underway. Good intentions from a second mechanic are not a substitute for both of you agreeing, out loud, that this unit is actually ready for power.",
      wrongNote: "It is the main disconnect. Whatever help is arriving, this unit is not ready for power yet.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, EWESC_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => ewescTileFace(cx, w, h, {}), { repeat: 3, px: 320 });
    const floor = box(g, 5.0, 0.1, 4.4, 0, 0.05, 0, 0x8f8270, { rough: 0.55, metal: 0.05 });
    floor.material = texturedMat(floorTex, { rough: 0.5, metal: 0.05, color: 0x8f8270 });

    // ------------------------------------------------------------- the truss
    const trussTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#6b5a2c", base2: "#5a4b24" }), { repeat: 1, px: 320 });
    const escalator = group(g, 0, 0, -0.9, 0.15);
    const truss = box(escalator, 3.4, 0.5, 1.1, 0, 0.6, 0, 0x6b5a2c, { rough: 0.5, metal: 0.4 });
    truss.rotation.x = -0.35;
    truss.material = trussTex ? texturedMat(trussTex, { rough: 0.45, metal: 0.4, color: 0x6b5a2c }) : truss.material;

    // Balustrade and handrail loop.
    for (const sz of [-1, 1]) {
      const balustrade = box(escalator, 3.3, 0.9, 0.04, 0, 1.0, sz * 0.52, 0xdfe6ea, { rough: 0.3, metal: 0.1, opacity: 0.5, transparent: true, cast: false });
      balustrade.rotation.x = -0.2;
    }
    const handrailBelt = torus(escalator, 1.7, 0.03, 0, 1.45, 0.55, 0x1b1e22, { rough: 0.6, seg: 10, seg2: 40 });
    handrailBelt.rotation.x = Math.PI / 2;
    reg(hits, handrailBelt, "handrail-pinch-point");
    const handrailNewel = group(escalator, -1.65, 0.3, 0.55);
    cyl(handrailNewel, 0.06, 0.08, 0.3, 0, 0.15, 0, 0x53585e, { rough: 0.5, metal: 0.5, seg: 14 });
    holoTag(handrailNewel, "Handrail entry — hands clear", 0, 0.32, 0, { css: "#f0645b", w: 0.44 });

    // Step band: a row of steps with cleats and one missing cleat.
    const steps = group(escalator, 0, 0.35, 0);
    let missingCleatStep = null;
    for (let i = 0; i < 8; i++) {
      const s = box(steps, 0.4, 0.08, 0.45, -1.4 + i * 0.4, i * 0.03, 0, 0x53585e, { rough: 0.55, metal: 0.4 });
      for (let c = 0; c < 3; c++) {
        const cleat = box(s, 0.04, 0.01, 0.02, -0.15 + c * 0.15, 0.045, 0.2, 0x3c444c, { rough: 0.6, cast: false });
        if (i === 3 && c === 1) missingCleatStep = cleat;
      }
    }
    missingCleatStep.visible = false;
    reg(hits, box(steps, 0.4, 0.02, 0.45, -1.4 + 3 * 0.4, 0.09 + 3 * 0.03, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "missing-cleat");

    // Step chain along the truss, with sprockets top and bottom.
    const chainLine = box(escalator, 3.0, 0.02, 0.03, 0, 0.42, 0.3, 0x22262b, { rough: 0.5, metal: 0.6 });
    void chainLine;
    for (const sx of [-1.5, 1.5]) {
      cyl(escalator, 0.16, 0.16, 0.12, sx, 0.42, 0.3, CITY.darkSteel, { rough: 0.4, metal: 0.7, seg: 18 }).rotation.z = Math.PI / 2;
    }
    const chainPinchZone = box(escalator, 0.2, 0.2, 0.15, 1.5, 0.42, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(chainPinchZone, "Sprocket — pinch point", 0, 0.16, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, chainPinchZone, "step-chain-pinch");
    const tensionGauge = instrument(escalator, 1.9, 0.65, 0.35, { ry: 0.3, idle: "-- N", color: 0xf2c14b });
    holoTag(tensionGauge, "Chain tension gauge", 0, 0.16, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, tensionGauge, "step-chain-tension");

    // Comb plate at the top landing.
    const comb = group(escalator, 1.65, 0.75, 0.3);
    box(comb, 0.3, 0.03, 0.3, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    for (let i = 0; i < 8; i++) box(comb, 0.02, 0.015, 0.06, -0.13 + i * 0.037, 0.02, 0.16, 0x1b1e22, { rough: 0.5 });
    const crackedTooth = box(comb, 0.018, 0.012, 0.05, -0.02, 0.02, 0.16, 0xd8232a, { rough: 0.5 });
    holoTag(comb, "Comb plate", 0, 0.16, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, crackedTooth, "cracked-comb-tooth");
    const combSwitch = box(comb, 0.06, 0.03, 0.03, 0, 0.05, -0.1, 0x22272c, { rough: 0.5, metal: 0.4 });
    reg(hits, combSwitch, "comb-impact-switch");
    const combEntrapZone = box(comb, 0.34, 0.05, 0.05, 0, 0.02, 0.16, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(combEntrapZone, "Meshing line — test object only", 0, 0.1, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, combEntrapZone, "comb-plate-entrapment");

    // Skirt panels either side of the step band, with a brush and a gap gauge.
    for (const sz of [-1, 1]) {
      const skirt = box(escalator, 3.2, 0.35, 0.03, 0, 0.32, sz * 0.24, 0xdfe4e8, { rough: 0.4, metal: 0.4 });
      void skirt;
    }
    const skirtBrush = box(escalator, 0.3, 0.02, 0.01, 0.3, 0.36, 0.235, 0x2b2f34, { rough: 0.8 });
    reg(hits, skirtBrush, "worn-skirt-brush");
    const skirtGapZone = box(escalator, 0.1, 0.06, 0.06, -0.3, 0.36, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(skirtGapZone, "Skirt gap — gauge only", 0, 0.1, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, skirtGapZone, "skirt-panel-gap");
    const skirtGauge = instrument(escalator, -0.3, 0.55, 0.3, { ry: -0.3, idle: "-- mm", color: 0xf2c14b });
    holoTag(skirtGauge, "Skirt clearance gauge", 0, 0.16, 0, { css: "#f2c14b", w: 0.36 });
    reg(hits, skirtGauge, "skirt-clearance");
    const skirtSwitch = box(escalator, 0.05, 0.03, 0.03, -0.3, 0.4, 0.22, 0x22272c, { rough: 0.5, metal: 0.4 });
    reg(hits, skirtSwitch, "skirt-obstruction-switch");

    const handrailGauge = instrument(escalator, 0.4, 1.5, 0.5, { ry: 0.2, idle: "-- %", color: 0xf2c14b });
    holoTag(handrailGauge, "Handrail sync gauge", 0, 0.16, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, handrailGauge, "handrail-speed");

    const lubePoint = ball(escalator, 0.02, -1.6, 0.42, 0.32, 0xd8b23a, { emissive: 0xd8b23a, ei: 0.6 });
    holoTag(lubePoint, "Chain lubrication point", 0, 0.1, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, lubePoint, "chain-lube-point");

    const oilCan = group(g, -2.0, 0.1, 1.2);
    cyl(oilCan, 0.045, 0.05, 0.16, 0, 0.08, 0, 0xe0a93a, { rough: 0.5, metal: 0.3, seg: 12 });
    holoTag(oilCan, "Chain oil", 0, 0.2, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, oilCan, "oil-can");

    // ------------------------------------------------------------- controls
    const wall = group(g, 2.2, 0, -1.4, -0.5);
    slab(wall, 0.4, 1.0, 0.24, 0, 0.7, 0, 0x545e67, { radius: 0.03, rough: 0.5, metal: 0.5 });
    const discHandle = group(wall, 0, 0.95, 0.13);
    box(discHandle, 0.045, 0.14, 0.045, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    decal(wall, 0.32, 0.05, 0, 1.16, 0.125, signFace("DRIVE DISCONNECT", { accent: "#f2c14b", scale: 0.4 }));
    reg(hits, discHandle, "main-disconnect");
    const hasp = torus(wall, 0.02, 0.006, 0.12, 0.58, 0.13, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, hasp, "lockout-hasp");
    const appliedLock = lockTag(wall, 0.12, 0.58, 0.15);
    appliedLock.visible = false;

    const driveMeter = instrument(g, 2.2, 0.5, -0.9, { ry: -0.4, idle: "-- V", color: 0xf2c14b });
    holoTag(driveMeter, "CAT III meter", 0, 0.16, 0, { css: "#f2c14b", w: 0.28 });
    reg(hits, driveMeter, "drive-meter");

    // Barricades at top and bottom landings.
    const topBarricade = group(g, 1.9, 0, 1.6, 0);
    box(topBarricade, 1.1, 0.9, 0.04, 0, 0.45, 0, 0xf2c14b, { rough: 0.6 });
    for (let i = 0; i < 4; i++) box(topBarricade, 0.03, 0.9, 0.03, -0.5 + i * 0.33, 0.45, 0.02, 0x1b1e22, { rough: 0.6, cast: false });
    holoTag(topBarricade, "Landing barricade", 0, 0.95, 0, { css: "#f2c14b", w: 0.38 });
    reg(hits, topBarricade, "top-barricade");

    // -------------------------------------------------------------- docs + tools
    const chest = toolChest(g, -1.9, -1.3, { ry: 0.6, color: 0xf2c14b });
    void chest;

    const ticket = holoPanel(g, 0.5, 0.36, -2.1, 1.4, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbe8bf"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JOB TICKET — ESC 1 UP", w * 0.06, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#f0dcae";
      ["Chain, comb, skirt, handrail", "Barricade before disconnect", "Log before sign-off"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: 0.5, accent: 0xf2c14b });
    reg(hits, ticket, "job-ticket");

    const permitPanel = holoPanel(g, 0.56, 0.4, -1.0, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbe8bf"; ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SERVICE PERMIT EW-33", w * 0.06, h * 0.14);
      ctx.fillStyle = "#fdf0d0"; ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ESCALATOR 1 — UP RUN", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#f2e2b8";
      ["Barricades: both landings", "Chain, skirt + handrail to spec", "All safety switches proven", "Log before sign-off"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.3, accent: 0xf2c14b });
    reg(hits, permitPanel, "escalator-permit");

    const logPanel = holoPanel(g, 0.5, 0.34, 2.2, 1.4, 0.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fdf0d0"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("ESCALATOR LOG — ESC 1", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f2e2b8";
      cx.fillText("Tension, clearance, sync", w * 0.06, h * 0.48);
      cx.fillText("and findings, this visit", w * 0.06, h * 0.68);
    }, { ry: -0.6, accent: 0xf2c14b });
    reg(hits, logPanel, "escalator-log");

    // A second mechanic near the bottom landing.
    const secondHand = standingFigure(g, -1.9, 1.7, { ry: 2.4, cloth: 0x37505f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(secondHand, "second mechanic", 0, 1.95, 0, { css: "#f2c14b", w: 0.36 });
    const secondHome = secondHand.position.clone();

    let live = true;

    return {
      hits,
      footprint: 2.4,

      onStepComplete(step) {
        if (step.id === "disconnect") { live = false; discHandle.rotation.z = Math.PI / 2; }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "comb-switch-test") combSwitch.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
        if (step.id === "skirt-switch-test") skirtSwitch.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
        if (step.id === "restore") { appliedLock.visible = false; discHandle.rotation.z = 0; live = true; }
      },

      onHazard(hitId) {
        if (hitId === "cracked-comb-tooth") crackedTooth.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.8 });
      },

      onInterrupt(it) {
        if (it.id === "passenger-climbs-barricade") topBarricade.rotation.y = -0.6;
        if (it.id === "second-mechanic-restart") secondHand.position.set(1.6, secondHome.y, -1.1);
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "passenger-climbs-barricade") topBarricade.rotation.y = 0;
        if (it.id === "second-mechanic-restart") secondHand.position.copy(secondHome);
      },

      animate(t, dt, session) {
        void live;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "verify-zero") {
            const v = Math.round(gg.t * 480);
            repaint(driveMeter.userData.screen, signFace(`${v} V`, { bg: "#0d1c24", accent: v < 38 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
          }
          if (session.step?.id === "chain-tension") {
            const n = Math.round(gg.t * 400);
            repaint(tensionGauge.userData.screen, signFace(`${n} N`, { bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
          }
          if (session.step?.id === "skirt-gap") {
            const mm = (2 + gg.t * 3).toFixed(1);
            repaint(skirtGauge.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
          }
          if (session.step?.id === "handrail-sync") {
            const pct = Math.round(gg.t * 200 - 100);
            repaint(handrailGauge.userData.screen, signFace(`${pct}%`, { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.56 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
          }
        }
      },
    };
  },
};
