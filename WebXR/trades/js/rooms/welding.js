import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, mergeStatic, counter, particles, markInteractive, mat, clamp,
} from "../../../shared/kit.js";
import { bottleRack, noticeBoard, racking, shadowBoard, shopFan, sideBench, wallReel, wasteBin , bayCrew, breatheCrew } from "../shopfit.js";

// Room 05 — Welder / fabricator: hot work permit, fume control, arc-eye
// protection and a shielded metal arc bead, ending with the fire watch that
// most hot-work incidents are traced back to skipping.

const SHOP_STEEL = 0x767e86, DARK = 0x24282d, HOT = 0xff8a3c;

export const ROOM_WELDING = {
  id: "welding",
  trade: "Welder / fabricator",
  title: "Weld Bay",
  tagline: "Hot work permit, fume extraction, lens shade, bead control and fire watch",
  union: "Boilermakers (IBB), Ironworkers and UA welders; AWS Certified Welder programme",
  certification: "AWS D1.1 welder performance qualification; OSHA 29 CFR 1910.252 welding, cutting and brazing; NFPA 51B hot work permit and fire watch; ANSI Z49.1 fume control and lens shade",
  accent: 0xf2c14b,
  accentCss: "#f2c14b",
  parSeconds: 230,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 14.6, d: 13.9 },
  spawn: { x: 0.6, z: 5.0, ry: -0.1 },
  badge: { id: "fire-watch", name: "Fire Watch Held", note: "Permit to fire watch with no hot-work shortcut" },

  hazards: {
    "solvent-drum": "There is an open solvent drum inside the hot work radius. Sparks travel further than people think and vapour ignites well below the flash you can see — it leaves the area or the work does.",
    "cylinder-loose": "That cylinder is lying unsecured with the cap off. A knocked-over cylinder with a sheared valve becomes a projectile — upright, chained, capped when not in use.",
    "wet-gloves": "Those gloves are damp. Wet leather conducts, and SMAW open-circuit voltage does not need much help to find a path through you.",
    "grinder-noguard": "The guard is off that grinder. A disc that lets go at full speed goes straight into whatever is in line with it, and that is usually your hand or your face.",
    "arc-bare": "You looked at the arc without the helmet down. Arc eye is a burn to the cornea and it does not announce itself for hours — the hood goes down before the arc is struck.",
  },

  lateNotes: {
    "stinger": "Put the arc down. Nothing gets struck before the area is cleared, the extraction is running and the kit is on.",
    "welder-dial": "Set the machine after the work is earthed — a live return path through the bench is not a return path.",
    "fire-extinguisher": "The watch starts when the arc stops. There is still work in front of you.",
  },


  // Interruptions: things that happen to the welder while they are busy, and
  // have to be noticed and answered on their own clock. See the interrupt
  // layer in shared/game.js — they are not steps and they do not change the
  // procedure, they test whether you were paying attention while running it.
  interrupts: [
    {
      id: "extraction-trips",
      kind: "Plant alarm",
      after: "amps", delay: 5, seconds: 14,
      alert: "The fume extraction has tripped out. The hood is dead and the fan noise has stopped.",
      cue: "The arc is not lit yet. Put it right before it is.",
      target: "fume-arm",
      why: "Extraction goes back on before the arc does. Manganese and hexavalent chromium do their damage over a career and a hood that is off looks exactly like a hood that is on.",
      missNote: "You set the machine and welded with dead extraction. The fume goes straight up inside your hood for the whole bead, and that is the exposure nobody notices happening.",
      wrongNote: "That is not what tripped. The extraction is off, and nothing else on this bench matters until the fan is running again.",
    },
    {
      id: "blanket-slipped",
      kind: "Fire watch",
      after: "bead", delay: 6, seconds: 12,
      alert: "The fire blanket has slipped off the conduit run and sparks are landing on bare cable.",
      cue: "Put the arc down and re-cover it.",
      target: "fire-blanket",
      why: "Anything that cannot leave the radius stays covered for the whole job, not just at the start. Re-covering it costs ten seconds.",
      missNote: "You welded on with the run uncovered. A spark lodged in the insulation and smouldered; the fire started hours after everyone had gone home, which is the exact thing the fire watch exists to prevent.",
      wrongNote: "The sparks are landing on the conduit run. Cover it — everything else on this job can wait ten seconds.",
    },
  ],

  steps: [
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Check the hot work permit",
      cue: "Read the permit: area, time window and who holds the fire watch.",
      why: "The permit is the agreement that this area was surveyed and someone owns the watch. No permit, no arc.",
    },
    {
      id: "clear", kind: "select", target: "combustibles",
      title: "Clear combustibles from the radius",
      cue: "Move the stacked packaging out of the hot work area.",
      why: "Combustibles go out to the required radius, or get covered. Sparks roll a long way across a shop floor.",
    },
    {
      id: "blanket", kind: "select", target: "fire-blanket",
      title: "Cover what cannot be moved",
      cue: "Drape the fire blanket over the fixed conduit run.",
      why: "Anything that cannot leave gets shielded. A blanket over the run is what stops a spark lodging in it unnoticed.",
    },
    {
      id: "vent", kind: "select", target: "fume-arm",
      title: "Position the fume extraction",
      cue: "Bring the extraction hood over the weld and switch it on.",
      why: "Extraction is positioned at the fume, not near it. Manganese and hexavalent chromium do their damage over a career, quietly.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["helmet", "jacket", "gloves"],
      itemNames: { helmet: "welding helmet", jacket: "leather jacket", gloves: "welding gloves" },
      title: "Put on the full kit",
      cue: "Helmet, leathers and gloves — all three before the arc.",
      why: "Arc burns skin like sun at close range and spatter goes everywhere. Partial PPE is the burn you explain later.",
      outOfOrderNote: "Still missing a piece of kit — every item goes on before you strike.",
    },
    {
      id: "lens", kind: "gauge", target: "helmet-lens",
      title: "Set the lens shade",
      cue: "Dial the auto-darkening lens to the right shade for this process and current.",
      why: "Too light and the arc reaches your eyes; too dark and you cannot see the puddle, so you chase it and ruin the bead.",
      gauge: {
        label: "LENS SHADE", speed: 0.75, green: [0.5, 0.68],
        readout: (t) => `shade ${Math.round(5 + t * 10)}`,
        missNote: "Wrong shade for this current. Match the shade to the process and amperage before the hood goes down.",
      },
    },
    {
      id: "ground", kind: "select", target: "work-clamp",
      title: "Attach the work clamp",
      cue: "Clamp the return lead directly to the workpiece.",
      why: "The return path goes on the work, close to the weld. Letting the current find its own way through the bench and the building is how bearings and hinges get destroyed.",
    },
    {
      id: "amps", kind: "gauge", target: "welder-dial",
      title: "Set the amperage",
      cue: "Set current for a 3.2 mm electrode on 6 mm plate.",
      why: "Amperage follows electrode diameter and plate thickness. Too low and it sticks; too high and you burn through and undercut the toes.",
      gauge: {
        label: "WELDING CURRENT", speed: 0.7, green: [0.44, 0.6],
        readout: (t) => `${Math.round(40 + t * 220)} A`,
        missNote: "Off the working range for this electrode. Reset the dial before you strike.",
      },
    },
    {
      id: "bead", kind: "gauge", target: "stinger",
      title: "Run the bead",
      cue: "Strike the arc and hold your travel speed inside the band.",
      why: "Steady travel and a short arc length build an even bead. Racing gives you a thin ropey cap; crawling piles it up and traps slag.",
      gauge: {
        label: "TRAVEL SPEED", speed: 1.15, green: [0.4, 0.56],
        readout: (t) => `${(1.5 + t * 5).toFixed(1)} mm/s`,
        missNote: "Travel speed off band — the puddle tells you. Reset and run it again.",
      },
    },
    {
      id: "firewatch", kind: "hold", target: "fire-extinguisher", seconds: 14,
      title: "Hold the fire watch",
      cue: "Stay on the fire watch with the extinguisher until the timer clears.",
      why: "The watch continues after the arc stops, because that is when smouldering finds its way into something. Walking away at the last bead is how a shop burns down at 2 am.",
      holdBreakNote: "You broke the watch early. Smouldering takes time to show — hold the full period.",
    },
  ],

  build(root) {
    // The shell, the fittings and the shop furniture never move and are
    // never clicked, so they go in one group that is baked into a handful
    // of meshes at the end of the build. See mergeStatic in shared/kit.js.
    const fixed = group(root);
    const hits = {};
    const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };

    shell(fixed, {
      w: 14.6, d: 13.9, h: 4.4,
      floor: 0x4d5157, wall: 0x6c757e, ceiling: 0x2a2f34,
      floorRough: 0.95, skirtColor: 0x353a40,
          walkway: { lane: 0xf2c14b, hatch: 0x9aa2aa },
      trim: 0xd8a33a, structure: "trusses", door: "shutter",
});
    // Scorched concrete and spatter around the bay.
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2, r = 0.4 + Math.random() * 2.4;
      box(root, 0.03 + Math.random() * 0.05, 0.002, 0.03 + Math.random() * 0.05,
        -0.6 + Math.cos(a) * r, 0.004, -2.2 + Math.sin(a) * r * 0.7, 0x22262a,
        { cast: false, receive: false, rough: 0.98 });
    }
    // Bay floor marking.
    for (let i = -6; i <= 6; i++) box(root, 0.2, 0.006, 0.08, i * 0.36, 0.005, 0.4, 0xf2c14b, { cast: false, rough: 0.8 });

    // ------------------------------------------------------- welding screens
    const screens = group(root, -0.6, 0, -2.2);
    for (const [sx, sz, ry] of [[-1.7, 0, Math.PI / 2], [1.7, 0, Math.PI / 2], [0, -1.5, 0]]) {
      const panel = group(screens, sx, 0, sz, ry);
      for (const px of [-0.7, 0.7]) cyl(panel, 0.025, 0.025, 2.2, px, 1.1, 0, SHOP_STEEL, { rough: 0.5, metal: 0.7, seg: 10 });
      const curtain = box(panel, 1.4, 1.7, 0.02, 0, 1.25, 0, 0xd8562a,
        { rough: 0.6, opacity: 0.55, side: 2 });
      curtain.userData.sway = Math.random() * 6;
      box(panel, 1.5, 0.05, 0.06, 0, 2.12, 0, SHOP_STEEL, { rough: 0.5, metal: 0.7 });
    }

    // ---------------------------------------------------------- welding table
    const table = group(root, -0.6, 0, -2.4);
    slab(table, 1.7, 0.06, 1.0, 0, 0.88, 0, 0x4e545b, { radius: 0.02, rough: 0.72, metal: 0.55 });
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
      cyl(table, 0.022, 0.022, 0.07, -0.6 + i * 0.3, 0.88, -0.3 + j * 0.3, 0x2f3439,
        { rough: 0.8, metal: 0.4, seg: 8, cast: false });                      // fixture holes
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      box(table, 0.07, 0.85, 0.07, sx * 0.76, 0.43, sz * 0.42, 0x3f454b, { rough: 0.7, metal: 0.5 });
    }
    box(table, 1.6, 0.05, 0.06, 0, 0.2, 0, 0x3f454b, { rough: 0.7, metal: 0.5 });

    // Workpiece: two plates set up for a fillet, with the bead that will appear.
    const workpiece = group(table, 0.05, 0.91, -0.05);
    box(workpiece, 0.6, 0.012, 0.3, 0, 0.006, 0.06, 0x6b7076, { rough: 0.55, metal: 0.75 });
    const upright = box(workpiece, 0.6, 0.16, 0.012, 0, 0.086, -0.09, 0x6b7076, { rough: 0.55, metal: 0.75 });
    const bead = cyl(workpiece, 0.008, 0.008, 0.56, 0, 0.016, -0.078, 0x8a6a44,
      { rough: 0.5, metal: 0.6, seg: 10, emissive: 0x000000 });
    bead.rotation.z = Math.PI / 2;
    bead.visible = false;
    // Toggle clamps holding the plates down.
    for (const cx of [-0.34, 0.34]) {
      const c = group(workpiece, cx, 0.01, 0.16);
      box(c, 0.05, 0.05, 0.09, 0, 0.02, 0, 0xb8402f, { rough: 0.5, metal: 0.3 });
      box(c, 0.02, 0.02, 0.16, 0, 0.06, -0.05, SHOP_STEEL, { rough: 0.35, metal: 0.85 });
    }
    const sparks = particles(workpiece, 160, 0xffd08a, { size: 0.02, life: 0.5 });
    const arcLight = new THREE.PointLight(0xdcefff, 0, 9, 2);
    arcLight.position.set(-0.55, 1.05, -2.45);
    root.add(arcLight);
    const arcFlash = ball(workpiece, 0.03, 0, 0.03, -0.078, 0xffffff, { emissive: 0xffffff, ei: 6, rough: 0.1 });
    arcFlash.visible = false;
    reg(arcFlash, "arc-bare");

    // ------------------------------------------------------- welding machine
    const machine = group(root, -2.55, 0, -3.4, 0.25);
    slab(machine, 0.6, 0.72, 0.5, 0, 0.5, 0, 0x2f5a8c, { radius: 0.03, rough: 0.45, metal: 0.35 });
    box(machine, 0.64, 0.05, 0.54, 0, 0.88, 0, 0x24486e, { rough: 0.45, metal: 0.35 });
    for (const sx of [-1, 1]) {
      const wheel = cyl(machine, 0.07, 0.07, 0.04, sx * 0.24, 0.08, -0.18, 0x1b1e22, { rough: 0.85, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    box(machine, 0.5, 0.03, 0.03, 0, 0.95, -0.2, SHOP_STEEL, { rough: 0.4, metal: 0.8 });      // push handle
    const face = group(machine, 0, 0.6, 0.26);
    const ampScreen = decal(face, 0.22, 0.11, 0, 0.1, 0.005,
      signFace("--- A", { bg: "#0e1b28", accent: "#f2c14b", fg: "#ffe6a8", scale: 0.62 }), { glow: true, ei: 0.8 });
    const dial = group(face, 0, -0.08, 0.01);
    cyl(dial, 0.06, 0.062, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 20 }).rotation.x = Math.PI / 2;
    const dialMark = box(dial, 0.008, 0.05, 0.032, 0, 0.022, 0.001, 0xf2c14b, { rough: 0.5 });
    for (let i = 0; i < 9; i++) {
      const a = -2.2 + i * 0.55;
      box(face, 0.006, 0.012, 0.004, Math.sin(a) * 0.082, -0.08 + Math.cos(a) * 0.082, 0.005, 0xdfe4e8, { rough: 0.6 });
    }
    reg(dial, "welder-dial");
    reg(ampScreen, "welder-dial");

    // Stinger and return lead running to the table.
    const stinger = group(root, -1.5, 0, -1.75, 0.4);
    box(stinger, 0.045, 0.045, 0.2, 0, 0.95, 0, 0x1b1e22, { rough: 0.6 });
    box(stinger, 0.03, 0.03, 0.08, 0, 0.99, 0.12, 0xb8402f, { rough: 0.5 });
    cyl(stinger, 0.004, 0.004, 0.22, 0, 1.0, 0.24, 0x2b2f34, { rough: 0.4, metal: 0.7, seg: 8 })
      .rotation.x = Math.PI / 2;
    hose(stinger, [[0, 0.93, -0.1], [-0.4, 0.5, -0.5], [-0.9, 0.12, -1.3], [-1.05, 0.4, -1.65]], 0.018, 0x1b1e22,
      { steps: 26, rough: 0.85 });
    reg(stinger, "stinger");

    const clampGrp = group(root, 0.55, 0, -1.6, -0.3);
    box(clampGrp, 0.06, 0.05, 0.11, 0, 0.92, 0, 0xb8402f, { rough: 0.5, metal: 0.3 });
    box(clampGrp, 0.05, 0.02, 0.09, 0.01, 0.96, 0.06, SHOP_STEEL, { rough: 0.3, metal: 0.9 });
    hose(clampGrp, [[0, 0.9, -0.05], [0.4, 0.4, -0.6], [-0.4, 0.12, -1.4], [-1.9, 0.4, -1.8]], 0.018, 0x2f3439,
      { steps: 26, rough: 0.85 });
    reg(clampGrp, "work-clamp");
    const attachedClamp = group(table, 0.72, 0.9, 0.3);
    box(attachedClamp, 0.06, 0.05, 0.11, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.3 });
    attachedClamp.visible = false;

    // ------------------------------------------------------ fume extraction
    const fume = group(root, 1.9, 0, -3.5);
    cyl(fume, 0.09, 0.11, 2.3, 0, 1.15, 0, SHOP_STEEL, { rough: 0.5, metal: 0.6, seg: 16 });
    const armA = group(fume, 0, 2.25, 0);
    cyl(armA, 0.07, 0.07, 1.2, 0, 0, -0.6, 0x8d959d, { rough: 0.5, metal: 0.6, seg: 14 }).rotation.x = Math.PI / 2;
    const armB = group(armA, 0, 0, -1.2);
    cyl(armB, 0.065, 0.065, 1.0, 0, -0.2, -0.45, 0x8d959d, { rough: 0.5, metal: 0.6, seg: 14 }).rotation.x = 1.15;
    const hoodGrp = group(armB, 0, -0.6, -0.85);
    lathe(hoodGrp, [[0.001, 0], [0.1, 0.02], [0.22, 0.2], [0.24, 0.22], [0.22, 0.21], [0.1, 0.03], [0.001, 0.01]],
      0, 0, 0, 0x9aa1a8, { rough: 0.45, metal: 0.6, seg: 20, side: 2 });
    hoodGrp.rotation.x = -0.9;
    const fumeFan = group(fume, 0, 2.5, 0);
    for (let i = 0; i < 4; i++) {
      const blade = box(fumeFan, 0.16, 0.006, 0.05, 0, 0, 0, 0x6f767d, { rough: 0.4, metal: 0.7, cast: false });
      blade.rotation.y = (i * Math.PI) / 2;
      blade.rotation.z = 0.35;
    }
    const fumeLamp = ball(fume, 0.02, 0.09, 1.5, 0.02, 0xf0645b, { emissive: 0xf0645b, ei: 2 });
    decal(fume, 0.3, 0.09, 0, 1.32, 0.115, signFace("EXTRACTION", { bg: "#1f2429", accent: "#f2c14b", scale: 0.5 }));
    reg(fume, "fume-arm");
    const fumeSmoke = particles(root, 60, 0xb8bec4, { size: 0.06, life: 1.3, additive: false, opacity: 0.24 });

    // ------------------------------------------------------------- PPE stand
    const ppeStand = group(root, 2.9, 0, -1.0, -0.5);
    cyl(ppeStand, 0.26, 0.3, 0.04, 0, 0.02, 0, DARK, { rough: 0.6, metal: 0.4, seg: 18 });
    cyl(ppeStand, 0.025, 0.025, 1.7, 0, 0.85, 0, SHOP_STEEL, { rough: 0.4, metal: 0.8, seg: 12 });
    box(ppeStand, 0.5, 0.03, 0.03, 0, 1.68, 0, SHOP_STEEL, { rough: 0.4, metal: 0.8 });

    const helmet = group(ppeStand, 0, 1.42, 0.06);
    lathe(helmet, [[0.001, 0], [0.12, 0.02], [0.145, 0.12], [0.14, 0.26], [0.09, 0.31], [0.001, 0.315]],
      0, 0, 0, 0x2b2f34, { rough: 0.55, seg: 20, side: 2 });
    const helmetLens = box(helmet, 0.11, 0.055, 0.02, 0, 0.19, 0.125, 0x1b2a1e,
      { rough: 0.25, opacity: 0.85, emissive: 0x0a1a10, ei: 0.4 });
    box(helmet, 0.13, 0.012, 0.02, 0, 0.225, 0.126, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    const shadeKnob = group(helmet, 0.14, 0.17, 0.02);
    cyl(shadeKnob, 0.026, 0.028, 0.022, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 14 }).rotation.z = Math.PI / 2;
    const shadePointer = box(shadeKnob, 0.024, 0.007, 0.02, 0.014, 0.012, 0, 0xf2c14b, { rough: 0.5 });
    decal(shadeKnob, 0.05, 0.03, 0.016, -0.05, 0, signFace("SHADE", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.6 }))
      .rotation.y = Math.PI / 2;
    reg(helmet, "helmet");
    reg(shadeKnob, "helmet-lens");
    const wornTicks = [];

    const jacket = group(ppeStand, -0.28, 1.15, 0);
    box(jacket, 0.34, 0.5, 0.16, 0, 0, 0, 0x8a6a44, { rough: 0.9 });
    for (const sx of [-1, 1]) cyl(jacket, 0.055, 0.05, 0.4, sx * 0.21, -0.06, 0, 0x8a6a44, { rough: 0.9, seg: 10 });
    box(jacket, 0.3, 0.06, 0.17, 0, 0.26, 0, 0x74562f, { rough: 0.9 });
    reg(jacket, "jacket");

    const gloves = group(ppeStand, 0.3, 1.2, 0);
    for (const sx of [-1, 1]) {
      const gl = group(gloves, sx * 0.07, 0, 0);
      cyl(gl, 0.05, 0.055, 0.22, 0, 0, 0, 0x9c7a4e, { rough: 0.92, seg: 12 });
      box(gl, 0.085, 0.11, 0.045, 0, 0.15, 0, 0x9c7a4e, { rough: 0.92 });
      box(gl, 0.03, 0.06, 0.04, sx * 0.05, 0.12, 0, 0x9c7a4e, { rough: 0.92 });
    }
    reg(gloves, "gloves");

    // Green ticks appear on each item once the kit is on.
    for (const [obj, tx, ty] of [[helmet, 0, 0.34], [jacket, 0, 0.32], [gloves, 0, 0.28]]) {
      const tick = decal(obj, 0.09, 0.09, tx, ty, 0.1,
        signFace("✓", { bg: "#14301f", accent: "#59c97b", fg: "#8ef0c0", scale: 0.8 }));
      tick.visible = false;
      wornTicks.push(tick);
    }

    // Damp gloves left on the machine — the trap.
    const wetGloves = group(machine, 0.1, 0.93, 0.1, 0.6);
    for (const sx of [-1, 1]) {
      const gl = box(wetGloves, 0.08, 0.05, 0.2, sx * 0.06, 0, 0, 0x6b5533, { rough: 0.65 });
      gl.rotation.z = sx * 0.2;
    }
    reg(wetGloves, "wet-gloves");

    // --------------------------------------------------- permit & fire watch
    const permit = group(root, 4.35, 0, -2.2, -Math.PI / 2);
    box(permit, 0.75, 0.6, 0.05, 0, 1.6, 0, 0x2b2f34, { rough: 0.7 });
    decal(permit, 0.66, 0.5, 0, 1.62, 0.03, paperFace("HOT WORK PERMIT", [
      "Area: Weld bay 2", "Window: 09:00 – 12:00", "Fire watch: K. Ellis",
      "Post-work watch: 30 min", "Extinguisher: verified",
    ]));
    reg(permit, "permit-board");

    const extinguisher = group(root, 4.3, 0, -0.9, -Math.PI / 2);
    cyl(extinguisher, 0.095, 0.095, 0.56, 0, 0.62, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 18 });
    cyl(extinguisher, 0.06, 0.095, 0.1, 0, 0.94, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 18 });
    box(extinguisher, 0.15, 0.04, 0.05, 0, 1.0, 0, 0x22262b, { rough: 0.5 });
    hose(extinguisher, [[0.06, 0.96, 0], [0.18, 0.75, 0.05], [0.12, 0.5, 0.02]], 0.013, 0x1b1e22, { steps: 12 });
    decal(extinguisher, 0.16, 0.11, 0, 0.66, 0.1, signFace("ABC", { bg: "#f2ae14", fg: "#1b1e22", accent: "#b81410", scale: 0.7 }));
    box(extinguisher, 0.16, 0.06, 0.1, 0, 0.3, 0, 0x2b2f34, { rough: 0.6 });     // bracket
    decal(extinguisher, 0.5, 0.11, 0, 1.42, 0.02, signFace("FIRE WATCH STATION", { bg: "#2b1a12", accent: "#f2ae14", scale: 0.45 }));
    reg(extinguisher, "fire-extinguisher");

    const blanket = group(root, 3.4, 0, 0.8, -0.4);
    counter(blanket, 0.6, 0.5, 0, 0, 0x4e545b, { height: 0.8, metal: 0.5, rough: 0.5, undershelf: false });
    slab(blanket, 0.42, 0.1, 0.3, 0, 0.86, 0, 0x6f6a55, { radius: 0.02, rough: 0.95 });
    slab(blanket, 0.4, 0.06, 0.28, 0, 0.94, 0, 0x7d7860, { radius: 0.02, rough: 0.95 });
    decal(blanket, 0.3, 0.07, 0, 0.99, 0, signFace("FIRE BLANKET", { bg: "#4a442f", accent: "#f2c14b", scale: 0.5 }))
      .rotation.x = -Math.PI / 2;
    reg(blanket, "fire-blanket");
    // Where the blanket ends up: over the fixed conduit run.
    const conduitRun = group(root, -3.2, 0, -1.0);
    for (const cz of [-0.2, 0, 0.2]) hose(conduitRun, [[0, 0.35, cz - 1.2], [0, 0.4, cz], [0, 0.35, cz + 1.2]], 0.035, 0x5b636b, { steps: 12 });
    box(conduitRun, 0.4, 0.1, 2.6, 0, 0.14, 0, 0x4e545b, { rough: 0.7, metal: 0.4 });
    const draped = slab(conduitRun, 0.7, 0.05, 2.4, 0, 0.45, 0, 0x6f6a55, { radius: 0.03, rough: 0.95 });
    draped.visible = false;

    // ---------------------------------------------------------------- traps
    const drum = group(root, -3.3, 0, -3.4);
    lathe(drum, [[0.001, 0], [0.28, 0.01], [0.3, 0.06], [0.3, 0.82], [0.28, 0.87], [0.26, 0.88], [0.26, 0.86], [0.001, 0.855]],
      0, 0, 0, 0x2f6f4a, { rough: 0.6, metal: 0.35, seg: 24 });
    for (const y of [0.28, 0.58]) torus(drum, 0.302, 0.016, 0, y, 0, 0x27603f, { rough: 0.6, metal: 0.35 });
    cyl(drum, 0.07, 0.07, 0.04, 0.14, 0.89, 0, 0x9aa1a8, { rough: 0.35, metal: 0.85, seg: 14 });   // open bung
    decal(drum, 0.3, 0.2, 0, 0.55, 0.302, signFace("FLAMMABLE\nSOLVENT", { bg: "#b81410", accent: "#f2ae14", fg: "#ffffff", scale: 0.34 }));
    reg(drum, "solvent-drum");

    const cylinder = group(root, 3.5, 0, 2.6, 0.9);
    const tank = lathe(cylinder, [[0.001, 0], [0.11, 0.01], [0.115, 0.06], [0.115, 1.0], [0.09, 1.1], [0.045, 1.14], [0.045, 1.22], [0.001, 1.225]],
      0, 0.115, 0, 0x2b6f8c, { rough: 0.45, metal: 0.5, seg: 20 });
    cylinder.rotation.z = Math.PI / 2;                                  // lying down, unsecured
    cyl(cylinder, 0.02, 0.02, 0.06, 0, 1.28, 0, 0x9aa1a8, { rough: 0.3, metal: 0.9, seg: 12 });
    reg(cylinder, "cylinder-loose");
    // The safe rack, chained, for contrast.
    const rack = group(root, -4.3, 0, 2.2, Math.PI / 2);
    box(rack, 1.0, 0.1, 0.4, 0, 0.05, 0, 0x4e545b, { rough: 0.7, metal: 0.4 });
    for (let i = 0; i < 2; i++) {
      lathe(rack, [[0.001, 0], [0.11, 0.01], [0.115, 0.06], [0.115, 1.0], [0.09, 1.1], [0.05, 1.14], [0.05, 1.3], [0.001, 1.305]],
        -0.25 + i * 0.5, 0.1, 0, [0x8c6a2f, 0x2b6f8c][i], { rough: 0.45, metal: 0.5, seg: 18 });
      cyl(rack, 0.055, 0.06, 0.09, -0.25 + i * 0.5, 1.44, 0, 0x9aa1a8, { rough: 0.35, metal: 0.8, seg: 14 });
    }
    box(rack, 1.0, 0.03, 0.03, 0, 0.9, 0.12, 0x8d959d, { rough: 0.6, metal: 0.7 });     // securing chain

    const grinderBench = counter(root, 1.3, 0.6, -3.3, 1.9, 0x4e545b, { height: 0.88, metal: 0.5, rough: 0.55, ry: 0.3 });
    const grinder = group(grinderBench, 0.2, 0.93, 0, 0.6);
    cyl(grinder, 0.045, 0.05, 0.24, 0, 0.05, 0, 0x1f6f5a, { rough: 0.5, seg: 14 }).rotation.z = Math.PI / 2;
    cyl(grinder, 0.075, 0.075, 0.006, 0.17, 0.05, 0, 0x4a4a4a, { rough: 0.85, seg: 20 });
    box(grinder, 0.04, 0.03, 0.06, -0.12, 0.06, 0, 0x14171a, { rough: 0.6 });
    reg(grinder, "grinder-noguard");

    const combustibles = group(root, 2.4, 0, -2.4);
    for (let i = 0; i < 3; i++) {
      slab(combustibles, 0.5, 0.32, 0.4, (i % 2) * 0.06, 0.16 + i * 0.33, 0, 0xb08a55, { radius: 0.01, rough: 0.95 });
      box(combustibles, 0.5, 0.02, 0.02, (i % 2) * 0.06, 0.32 + i * 0.33, 0.2, 0xd8c8a8, { rough: 0.9 });
    }
    box(combustibles, 0.62, 0.1, 0.52, 0, 0.05, 0, 0x8a6244, { rough: 0.95 });
    decal(combustibles, 0.34, 0.1, 0, 0.5, 0.205, signFace("PACKAGING", { bg: "#7a5c38", accent: "#f2c14b", scale: 0.5 }));
    reg(combustibles, "combustibles");

    // Chipping hammer and brush on the table edge.
    const tools = group(table, -0.6, 0.93, 0.28, 0.4);
    box(tools, 0.02, 0.02, 0.24, 0, 0.01, 0, 0x8a6244, { rough: 0.85 });
    box(tools, 0.02, 0.06, 0.02, 0, 0.04, -0.11, 0x6f767d, { rough: 0.4, metal: 0.85 });
    box(tools, 0.05, 0.02, 0.13, 0.1, 0.01, 0.02, 0x8a6244, { rough: 0.85 });
    for (let i = 0; i < 5; i++) box(tools, 0.04, 0.02, 0.006, 0.1, -0.005, -0.03 + i * 0.015, 0x9aa1a8, { rough: 0.6, metal: 0.7 });

    const key = new THREE.DirectionalLight(0xc8d8e8, 1.0);
    key.position.set(3, 5.5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
    root.add(key);
    root.add(new THREE.HemisphereLight(0x9db0c4, 0x2f353b, 1.3));

    let arcOn = false;
    let extractionOn = false;
    let welded = false;

    // The bay is 14.6m by 13.9m now. Push the workstations out to match, so
    // the extra floor is distance between jobs rather than empty ring.
    spreadLayout(root, 1.62);

    const W = 14.6, D = 13.9;
    // ------------------------------------------------- the rest of the bay
    // A weld shop keeps its consumables, its gas and its second bench where
    // they are not in the arc, and a fan pointed at the welder, not the work.
    shadowBoard(fixed, -W / 2 + 0.3, -1.2, Math.PI / 2, { label: "Weld tooling — clamps, chipping, brushes", color: 0x3b4a52 });
    racking(fixed, -W / 2 + 0.55, 3.2, Math.PI / 2, { w: 3.0, h: 2.3, frame: 0x7a5a32, stock: [0x6b7480, 0x8a7a5e, 0x57606a] });
    bottleRack(fixed, W / 2 - 0.7, -4.6, -Math.PI / 2, { count: 4, colors: [0x2f5d3a, 0x8a3a2f, 0x2f5d3a, 0x4a535d] });
    sideBench(fixed, 2.6, 4.4, Math.PI, { w: 2.6, top: 0x5a5245 });
    shopFan(fixed, -3.8, 2.6, -0.8, { tilt: 0.25 });
    wasteBin(fixed, W / 2 - 1.4, 3.6, -1.2, { color: 0x55606b, lid: 0x424c56, label: "Scrap steel" });
    noticeBoard(fixed, 0.4, D / 2 - 0.25, Math.PI, { w: 1.6, sheets: undefined });
    wallReel(fixed, W / 2 - 0.25, 1.0, -Math.PI / 2, { color: 0x2f5d3a, hose: 0x1d3a26, y: 2.3 });

    // Another welder screened off in the next bay, and a fitter at the side
    // bench. You are not the only person in this shop.
    const crew = [
      bayCrew(root, 3.9, -0.5, -1.43, { task: "bench", cloth: 0x3d4a52, hat: 0xf2c14b, vis: 0xd8e33a }),
      bayCrew(root, 5.1, -3.7, -0.94, { task: "bench", cloth: 0x5a5245, hat: 0xdd7a2f, vis: 0xd8e33a }),
    ];

    // Fittings on a grid sized to this floor, plus the bounce a real room
    // has and this one did not: see ceilingGrid in shared/kit.js.
    ceilingGrid(fixed, 14.6, 13.9, { color: 0xdfe9f4, ei: 1.25, lamp: 1.45, y: 4.24 });

    mergeStatic(fixed);

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.6, 1.1, -2.4),

      onStep(step) {
        arcOn = step.id === "bead";
        arcFlash.visible = arcOn;
      },

      // An interruption the learner can see: the fan stops, the lamp goes red
      // and the plume stops being carried off. A banner alone is a caption.
      onInterrupt(it) {
        if (it.id === "extraction-trips") {
          extractionOn = false;
          fumeLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2 });
        }
        if (it.id === "blanket-slipped") { draped.visible = false; }
      },
      onInterruptEnd(it) {
        // Only put it right if it was actually answered.
        if (it.resolved !== "answered") return;
        if (it.id === "extraction-trips") {
          extractionOn = true;
          fumeLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2 });
        }
        if (it.id === "blanket-slipped") { draped.visible = true; }
      },
      onStepComplete(step) {
        if (step.id === "clear") { combustibles.position.set(3.9, 0, 3.4); }
        if (step.id === "blanket") { draped.visible = true; }
        if (step.id === "vent") {
          extractionOn = true;
          fumeLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2 });
          armA.rotation.y = -0.55;
          armB.rotation.y = 0.5;
        }
        if (step.id === "ppe") wornTicks.forEach((tick) => { tick.visible = true; });
        if (step.id === "ground") { clampGrp.visible = false; attachedClamp.visible = true; }
        if (step.id === "bead") {
          welded = true;
          arcOn = false;
          arcFlash.visible = false;
          bead.visible = true;
          bead.material = mat(0xffb35c, { rough: 0.4, metal: 0.5, emissive: 0xff7a2c, ei: 1.6 });
        }
      },

      animate(t, dt, session) {

        breatheCrew(crew, t);
        if (extractionOn) fumeFan.rotation.y += dt * 7;
        fumeLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 3) * 0.5;

        // Curtains breathe with the extraction airflow.
        screens.children.forEach((panel, i) => {
          const curtain = panel.children.find((c) => c.isMesh && c.userData.sway !== undefined);
          if (curtain) curtain.rotation.y = Math.sin(t * 0.7 + curtain.userData.sway) * 0.02;
        });

        if (arcOn) {
          sparks.visible = true;
          sparks.userData.step(dt, new THREE.Vector3(0, 0.02, -0.07), 0.06, 2.2, -5.5);
          const flicker = 0.6 + Math.random() * 0.4;
          arcLight.intensity = 12 * flicker;
          arcFlash.scale.setScalar(0.7 + Math.random() * 0.6);
          if (extractionOn) fumeSmoke.userData.step(dt, new THREE.Vector3(-0.55, 1.0, -2.5), 0.1, 0.5, 0.9);
          fumeSmoke.visible = extractionOn;
        } else {
          if (sparks.visible) sparks.visible = false;
          arcLight.intensity = 0;
          if (fumeSmoke.visible && !welded) fumeSmoke.visible = false;
        }

        // The bead cools from orange back to grey after the run.
        if (welded && bead.material.emissiveIntensity > 0) {
          bead.material.emissiveIntensity = Math.max(0, bead.material.emissiveIntensity - dt * 0.22);
        }

        const g = session?.gauge;
        if (g && !g.committed) {
          if (session.step?.id === "amps") {
            const a = Math.round(40 + g.t * 220);
            dialMark.parent.rotation.z = -2.2 + g.t * 4.4;
            repaint(ampScreen, signFace(`${a} A`, {
              bg: "#0e1b28", accent: a >= 130 && a <= 175 ? "#59c97b" : "#f2c14b", fg: "#ffe6a8", scale: 0.62,
            }));
          }
          if (session.step?.id === "lens") {
            const shade = Math.round(5 + g.t * 10);
            shadeKnob.rotation.x = -1.6 + g.t * 3.2;
            helmetLens.material = mat(0x1b2a1e, { rough: 0.25, opacity: clamp(0.3 + shade * 0.05, 0.3, 0.95),
              emissive: 0x0a1a10, ei: 0.4 });
          }
        }
      },
    };
  },
};
