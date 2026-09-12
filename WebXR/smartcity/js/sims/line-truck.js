import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Line Truck VR — its own gamified system: Storm Command.
// Bucket-truck line work. Rubber goes on before the boom goes near a
// conductor, the truck is bonded before the boom moves at all, and a ground
// clamp only ever meets a line the tester has already proven dead.

export const SIM_LINE_TRUCK = {
  id: "line-truck",
  index: "19",
  domain: "Energy",
  trade: "Outside / overhead lineworker (IBEW)",
  name: "Line Truck",
  title: simTitle("Line Truck"),
  tagline: "Bucket-truck line work: rubber goods testing, isolation and correct grounding order",
  accent: 0xfcee21,
  accentCss: "#fcee21",
  parSeconds: 250,
  badge: { id: "storm-ready", name: "Storm Ready", note: "Full de-energized procedure with rubber proven and grounds applied in order" },

  game: system({
    name: "Storm Command",
    currency: "VOLT",
    ranks: ["Ground Hand", "Apprentice Lineman", "Journeyman Lineman", "Crew Lead", "Storm Certified"],
    badges: [
      { id: "rubber-proven", name: "Rubber Proven", note: "Never approach the conductor unprotected", test: AWARD.safe },
      { id: "dead-line-true", name: "Dead Line True", note: "Hold every test reading near band centre", test: AWARD.precise(0.72) },
      { id: "grounds-clean", name: "Grounds Clean", note: "Apply every ground in the correct order", test: AWARD.stepClean("apply-grounds") },
    ],
    challenges: [
      { id: "storm-window", name: "Storm Window", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-flash", name: "No Flash", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "crew-streak", name: "Crew Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "energized-conductor": "You brought the bucket inside the minimum approach distance without rubber gloves and sleeves donned. Inside that distance the air gap itself is no longer your protection — the rubber is, and it goes on before the boom does.",
    "damaged-glove": "That rubber glove has a puncture that the air test would have caught. Wearing a failed glove is worse than wearing none, because it tells you it's protecting you right up until it doesn't.",
    "ground-point-untested": "You reached for the equipment ground before the tester confirmed the line was actually dead. If that conductor is still live, the ground set becomes the path to ground — through whoever is holding it.",
    "boom-control": "That is the boom lift control. Operating the boom before the truck chassis is bonded and grounded leaves the whole vehicle, and anyone touching it, at line potential the instant the boom contacts an energized conductor.",
  },

  lateNotes: {
    "hotstick-meter": "Zero energy is confirmed with the tester after the switch is open — the switch position alone is never treated as proof by itself.",
    "ground-electrode-clamp": "Grounds go on only after the line has tested dead on the meter — never on the strength of the switch position alone.",
  },

  steps: [
    {
      id: "tailboard", kind: "select", target: "tailboard-board",
      title: "Hold the tailboard briefing",
      cue: "Read the job briefing: hazards, PPE and the minimum approach distance for this voltage class.",
      why: "The minimum approach distance changes with voltage class. Everyone on the crew hears the same number before anyone leaves the ground.",
    },
    {
      id: "outrigger", kind: "select", target: "outriggers",
      title: "Set the outriggers",
      cue: "Extend and set the truck's outriggers before raising the boom.",
      why: "A boom worked from an unstabilized truck can shift the whole vehicle under load — the outriggers are what turn the truck into a fixed base.",
    },
    {
      id: "truck-ground", kind: "select", target: "truck-ground-rod",
      title: "Bond and ground the truck",
      cue: "Drive the ground rod and bond the chassis before any boom work begins.",
      why: "If the boom ever contacts an energized conductor, the bond is what keeps the truck body from becoming the fastest path to ground through a person standing on it.",
    },
    {
      id: "glove-test", kind: "gauge", target: "glove-inflator",
      title: "Air-test the rubber gloves",
      cue: "Inflate the gloves and commit once they hold pressure with no leak.",
      why: "A pinhole in rubber goods is invisible until it's under pressure. The air test finds it before the glove ever gets near a conductor.",
      gauge: {
        label: "GLOVE AIR TEST — HELD PRESSURE", speed: 0.6, green: [0.62, 0.85],
        readout: (t) => `${Math.round(t * 100)}% held`,
        missNote: "Pressure dropping — that's a leak. Pull that pair from service and test the spares.",
      },
    },
    {
      id: "sleeve-check", kind: "select", target: "sleeves",
      title: "Inspect the rubber sleeves",
      cue: "Check the sleeves for cuts, ozone cracking or embedded debris.",
      why: "Sleeves cover the reach between the glove and the shoulder — a cut there is just as live a path as a cut in the glove itself.",
    },
    {
      id: "liner-check", kind: "select", target: "bucket-liner",
      title: "Inspect the bucket liner",
      cue: "Check the fibreglass bucket liner for cracks or contamination.",
      why: "The liner is the insulating barrier between you and the boom's conductive structure. A cracked or dirty liner stops being an insulator exactly when you need it to be one.",
    },
    {
      id: "boom-test", kind: "gauge", target: "boom-tester",
      title: "Dielectric-test the boom",
      cue: "Run the insulation test on the boom and commit inside the passing range.",
      why: "The boom's fibreglass insulation is tested on its own schedule, not assumed sound because it looked fine yesterday.",
      gauge: {
        label: "BOOM DIELECTRIC TEST — INSULATION", speed: 0.65, green: [0.55, 0.75],
        readout: (t) => `${Math.round(t * 150)} MΩ`,
        missNote: "Below the passing resistance. Tag the boom out of service rather than trust it near a conductor.",
      },
    },
    {
      id: "mad-check", kind: "select", target: "mad-marker",
      title: "Confirm the minimum approach distance",
      cue: "Mark and confirm the minimum approach boundary for this voltage class before the boom moves in.",
      why: "The boundary is set before the boom starts moving, not judged by eye once the bucket is already close to the conductor.",
    },
    {
      id: "isolate", kind: "turn", target: "line-switch",
      title: "Open the line switch",
      cue: "Grab the switch handle and pull the upstream switch open.",
      why: "This is the isolation. Everything from here on is checked against the assumption that a switch position can still be wrong.",
      turn: { turns: 0.16, axis: "z", reverse: true, label: "LINE SWITCH" },
    },
    {
      id: "verify-dead", kind: "gauge", target: "hotstick-meter",
      title: "Test the line dead with a hot stick",
      cue: "Phase the line with the hot stick tester and commit when it reads dead.",
      why: "The switch tells you what should be true. The hot stick tester tells you what is actually true on this conductor, right now.",
      gauge: {
        label: "PHASING TESTER — LINE VOLTAGE", speed: 0.6, green: [0.0, 0.08],
        readout: (t) => `${Math.round(t * 14400)} V`,
        missNote: "Still reading live. Recheck the switch and the phasing before any ground goes on.",
      },
    },
    {
      id: "apply-grounds", kind: "sequence",
      targets: ["ground-electrode-clamp", "neutral-clamp", "phase-clamp"],
      itemNames: {
        "ground-electrode-clamp": "ground electrode clamp", "neutral-clamp": "neutral clamp", "phase-clamp": "phase conductor clamp",
      },
      title: "Apply personal protective grounds in order",
      cue: "Clamp to the ground electrode first, then the neutral, then the phase conductor last.",
      why: "Clamping the ground end first means if the phase turns out to be live when you make that last connection, the low-resistance path is already there waiting for the fault current instead of you.",
      outOfOrderNote: "Wrong order — ground electrode first, then neutral, then the phase conductor. Removal happens in the exact reverse.",
    },
    {
      id: "rescue-ready", kind: "select", target: "rescue-hook",
      title: "Confirm rescue readiness",
      cue: "Check the pole-top and bucket rescue hook and line are staged and ready.",
      why: "Rescue equipment staged before work starts is the only version that is actually usable in the first thirty seconds of an emergency.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0xfcee21);

    // ---------------------------------------------------------------------- the truck
    const truck = group(g, -0.9, 0, 0.5, 0.5);
    slab(truck, 1.6, 0.6, 0.9, 0, 0.5, 0, 0xf2c14b, { radius: 0.05, rough: 0.4, metal: 0.5 });
    box(truck, 0.9, 0.5, 0.85, -0.5, 0.9, 0, 0xe8e8e8, { radius: 0.04, rough: 0.35, metal: 0.4 });
    for (const [wx, wz] of [[-0.55, -0.42], [-0.55, 0.42], [0.55, -0.42], [0.55, 0.42]]) {
      cyl(truck, 0.22, 0.22, 0.18, wx, 0.22, wz, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    }
    holoTag(truck, "Bucket truck 12", 0, 1.3, 0.4, { css: "#fcee21", w: 0.34 });

    const outriggerGroup = group(truck, 0, 0.15, -0.5);
    const outriggerPads = [];
    for (const sx of [-1, 1]) {
      const pad = box(outriggerGroup, 0.22, 0.05, 0.22, sx * 0.75, -0.1, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
      box(outriggerGroup, 0.04, 0.15, 0.04, sx * 0.75, -0.02, 0, CITY.steel, { rough: 0.4, metal: 0.8 });
      outriggerPads.push(pad);
    }
    holoTag(outriggerGroup, "Outriggers", 0, 0.1, 0, { css: "#fcee21", w: 0.3 });
    reg(hits, outriggerGroup, "outriggers");

    // Boom, bucket, and lift control.
    const boomBase = group(truck, 0.2, 1.1, 0, -0.3);
    const boomArm = group(boomBase, 0, 0, 0);
    box(boomArm, 0.14, 0.14, 1.6, 0, 0.1, 0.8, 0xf2c14b, { radius: 0.04, rough: 0.55, metal: 0.2 });
    boomArm.rotation.x = -0.5;
    const bucket = group(boomArm, 0, 0.55, 1.55);
    box(bucket, 0.34, 0.5, 0.3, 0, 0, 0, 0xe8e8e8, { radius: 0.04, rough: 0.45 });
    holoTag(bucket, "Bucket", 0, 0.35, 0, { css: "#fcee21", w: 0.24 });
    reg(hits, bucket, "bucket-liner");

    const boomCtrl = group(boomBase, -0.16, -0.05, -0.1);
    box(boomCtrl, 0.1, 0.14, 0.08, 0, 0, 0, 0x22272c, { rough: 0.5, metal: 0.4 });
    const boomLever = box(boomCtrl, 0.02, 0.09, 0.02, 0, 0.08, 0.03, 0xd8232a, { rough: 0.5 });
    holoTag(boomCtrl, "Boom lift control", 0, 0.16, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, boomCtrl, "boom-control");

    // Ground rod and bonding cable for the chassis.
    const groundRod = group(truck, -0.9, -0.5, 0.5);
    cyl(groundRod, 0.012, 0.012, 0.5, 0, 0.25, 0, 0x8b5a2b, { rough: 0.6, seg: 10 });
    hose(truck, [[-0.9, 0.0, 0.5], [-0.7, 0.1, 0.3], [-0.5, 0.5, 0]], 0.008, 0x2b3138, { steps: 12, rough: 0.6 });
    holoTag(groundRod, "Chassis ground", 0, 0.55, 0, { css: "#fcee21", w: 0.3 });
    reg(hits, groundRod, "truck-ground-rod");

    // -------------------------------------------------------------------------- pole
    const pole = group(g, 1.1, 0, -0.9);
    cyl(pole, 0.07, 0.09, 2.6, 0, 1.3, 0, 0x6b4b30, { rough: 0.85, seg: 12 });
    const crossarm = box(pole, 0.9, 0.06, 0.08, 0, 2.3, 0, 0x6b4b30, { rough: 0.85 });
    const phases = [];
    for (const px of [-0.35, 0, 0.35]) {
      const insulator = cyl(pole, 0.02, 0.03, 0.12, px, 2.4, 0, 0x8b929a, { rough: 0.5, metal: 0.4, seg: 10 });
      const wire = hose(pole, [[px, 2.46, 0], [px, 2.46, -1.6]], 0.008, 0x2b3138, { steps: 8, rough: 0.6 });
      phases.push(wire);
    }
    reg(hits, phases[1], "energized-conductor");
    const neutral = hose(pole, [[0, 1.9, 0], [0, 1.9, -1.6]], 0.008, 0x2b3138, { steps: 8, rough: 0.6 });
    const lineSwitchGroup = group(pole, -0.5, 1.6, 0);
    box(lineSwitchGroup, 0.14, 0.24, 0.08, 0, 0, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    const switchHandle = box(lineSwitchGroup, 0.03, 0.14, 0.03, 0, 0.16, 0.05, 0xd8232a, { rough: 0.5 });
    holoTag(lineSwitchGroup, "Line switch", 0, 0.3, 0, { css: "#fcee21", w: 0.28 });
    reg(hits, lineSwitchGroup, "line-switch");
    lineSwitchGroup.userData.wheel = switchHandle; // the part app.js actually spins for the 'turn' step

    // Minimum approach distance boundary marker on the ground beneath the pole.
    const madRing = torus(g, 1.1, 0.02, 1.1, 0.01, -0.9, 0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 40 });
    madRing.rotation.x = Math.PI / 2;
    holoTag(g, "Minimum approach boundary", 1.1, 0.3, -1.9, { css: "#f0645b", w: 0.42 });
    reg(hits, madRing, "mad-marker");

    // Ground clamp set, hanging on the truck bed ready to be applied.
    const groundSet = group(truck, 0.4, -0.15, 0.5);
    const clampFaces = { "ground-electrode-clamp": null, "neutral-clamp": null, "phase-clamp": null };
    const clamps = [
      { id: "ground-electrode-clamp", label: "GND", x: -0.14 },
      { id: "neutral-clamp", label: "NEUT", x: 0 },
      { id: "phase-clamp", label: "PHASE", x: 0.14 },
    ];
    for (const c of clamps) {
      const holder = group(groundSet, c.x, 0, 0);
      cyl(holder, 0.018, 0.018, 0.09, 0, 0, 0, CITY.steel, { rough: 0.35, metal: 0.85, seg: 10 });
      const face = decal(holder, 0.09, 0.03, 0, 0.06, 0, signFace(c.label, { bg: "#2a1a0d", accent: "#fcee21", scale: 0.5 }), { px: 96 });
      clampFaces[c.id] = face;
      reg(hits, holder, c.id);
    }
    holoTag(groundSet, "Protective grounds", 0, 0.14, 0, { css: "#fcee21", w: 0.34 });

    // Untested ground point on the pole — reaching here before the tester is the trap.
    const groundPointTrap = group(pole, 0.5, 1.9, 0);
    cyl(groundPointTrap, 0.02, 0.02, 0.06, 0, 0, 0, 0x8b5a2b, { rough: 0.6, seg: 10 });
    holoTag(groundPointTrap, "Untested ground point", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, groundPointTrap, "ground-point-untested");

    // ------------------------------------------------------------ PPE and instruments
    const chest = toolChest(g, 1.5, 1.4, { ry: -0.7, color: 0xfcee21 });
    const gloveGroup = group(chest, -0.14, 0.79, 0.06, 0.3);
    for (const sx of [-1, 1]) box(gloveGroup, 0.05, 0.14, 0.02, sx * 0.03, 0, 0, 0xd8b23a, { rough: 0.65 });
    holoTag(gloveGroup, "Rubber gloves", 0, 0.16, 0, { css: "#fcee21", w: 0.3 });
    const inflator = instrument(chest, -0.14, 0.79, 0.16, { ry: 0.4, idle: "-- % held", color: 0xfcee21 });
    holoTag(inflator, "Glove inflator", 0, 0.16, 0, { css: "#fcee21", w: 0.3 });
    reg(hits, inflator, "glove-inflator");

    const damagedGlove = group(g, 1.7, 0, 1.1, -0.3);
    box(damagedGlove, 0.05, 0.16, 0.02, 0, 0.16, 0, 0xd8b23a, { rough: 0.65 });
    decal(damagedGlove, 0.03, 0.02, 0.026, 0.14, 0, signFace("X", { bg: "#2a1a0d", accent: "#f0645b", scale: 0.7 }), { px: 64 });
    holoTag(damagedGlove, "Punctured glove", 0, 0.28, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, damagedGlove, "damaged-glove");

    const sleeveGroup = group(chest, 0, 0.79, 0.1, 0.3);
    for (const sx of [-1, 1]) cyl(sleeveGroup, 0.045, 0.045, 0.16, sx * 0.06, 0, 0, 0xd8b23a, { rough: 0.65, seg: 12 });
    holoTag(sleeveGroup, "Rubber sleeves", 0, 0.18, 0, { css: "#fcee21", w: 0.3 });
    reg(hits, sleeveGroup, "sleeves");

    const boomTester = instrument(chest, 0.12, 0.79, 0.02, { ry: -0.4, idle: "-- MΩ", color: 0xfcee21 });
    holoTag(boomTester, "Megger", 0, 0.16, 0, { css: "#fcee21", w: 0.26 });
    reg(hits, boomTester, "boom-tester");

    const hotstick = instrument(chest, -0.02, 0.82, -0.1, { ry: 0.2, idle: "-- V", color: 0xfcee21 });
    holoTag(hotstick, "Hot stick tester", 0, 0.16, 0, { css: "#fcee21", w: 0.32 });
    reg(hits, hotstick, "hotstick-meter");

    const rescueHook = group(g, -1.7, 0, 1.4, 0.3);
    cyl(rescueHook, 0.014, 0.014, 1.1, 0, 0.55, 0, 0xd8b23a, { rough: 0.55, seg: 8 });
    cyl(rescueHook, 0.03, 0.02, 0.1, 0, 1.08, 0.03, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 }).rotation.x = 0.6;
    holoTag(rescueHook, "Rescue hook", 0, 1.2, 0, { css: "#fcee21", w: 0.3 });
    reg(hits, rescueHook, "rescue-hook");

    const tailboard = holoPanel(g, 0.56, 0.4, -1.9, 1.5, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,18,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fcee21"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e0dca0";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TAILBOARD BRIEFING", w * 0.06, h * 0.14);
      ctx.fillStyle = "#fbfbe6";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CIRCUIT 12 — 14.4 kV", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#e0dca0";
      ["Min. approach: 2 ft 2 in", "Rubber gloves + sleeves: class 2",
       "Grounds: ground, neutral, phase", "Truck bonded before boom work",
       "Rescue hook staged"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.6, accent: 0xfcee21 });
    reg(hits, tailboard, "tailboard-board");

    let energized = true;
    let grounded = false;

    return {
      hits,
      footprint: 2.1,

      onStepComplete(step) {
        if (step.id === "outrigger") outriggerPads.forEach((p) => { p.position.y = -0.15; });
        // switchHandle is turned live by the player's drag while this step is active.
        if (step.id === "isolate") energized = false;
        if (step.id === "verify-dead") phases.forEach((p) => { p.material = mat(0x53585e, { rough: 0.6 }); });
        if (step.id === "apply-grounds") { grounded = true; }
        if (step.id === "rescue-ready") holoTag(g, "Ready", -1.7, 1.5, 1.4, { css: "#59c97b", w: 0.2 });
      },

      animate(t, dt, session) {
        boomLever.rotation.x = Math.sin(t * 0.6) * 0.1;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "glove-test") {
            repaint(inflator.userData.screen, signFace(`${Math.round(gg.t * 100)}% held`, {
              bg: "#0d1c24", accent: gg.t > 0.62 && gg.t < 0.85 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.45,
            }));
          }
          if (session.step?.id === "boom-test") {
            repaint(boomTester.userData.screen, signFace(`${Math.round(gg.t * 150)} MΩ`, {
              bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.75 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
            }));
          }
          if (session.step?.id === "verify-dead") {
            repaint(hotstick.userData.screen, signFace(`${Math.round(gg.t * 14400)} V`, {
              bg: "#0d1c24", accent: gg.t < 0.08 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
            }));
          }
        }
      },
    };
  },
};
