import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingPanel, counter, particles, markInteractive,
} from "../../../shared/kit.js";

// Room 07 — Plumber / pipefitter: a DWV rough-in behind open studs, backflow
// protection on the one fixture that actually needs it, a solvent-welded PVC
// joint, a torch-sweated copper joint, and the pressure test that catches a
// weeping joint before the drywall closes over it.

const WOOD = 0xa9814f, PVC = 0xe4e1d6, PIPE_COPPER = 0xcf8b3c, BRASS = 0xc9a227, PIPE_STEEL = 0x8a949d;
const PIPE_GOOD = 0x59c97b, PIPE_WARN = 0xf2ae14;

export const ROOM_PLUMBING = {
  id: "plumbing",
  trade: "Plumber / Pipefitter",
  title: "Rough-In Bay",
  tagline: "DWV rough-in, backflow prevention, torch brazing and a pressure test with no shortcuts",
  union: "UA — United Association of Plumbers, Pipefitters and Service Technicians",
  certification: "UA journeyman plumber and state plumbing licence; IPC/UPC drain-waste-vent code; ASSE 5110 backflow prevention assembly tester; NFPA 51B hot work for torch brazing",
  accent: PIPE_COPPER,
  accentCss: "#cf8b3c",
  parSeconds: 215,
  spawn: { x: 0, z: 3.2, ry: 0 },
  badge: { id: "zero-leaks", name: "Zero Leaks", note: "A pressure-tested rough-in with backflow protection intact and every joint torch-safe" },

  hazards: {
    "hose-bucket": "That garden hose runs from the hose bib straight into the mop bucket, submerged. Let street pressure drop for a second and that bucket water siphons back into the supply — an air gap or a backflow preventer is what stops it, not hoping the pressure never drops.",
    "torch-stud": "That torch tip is inches from a bare wood stud with no heat shield behind the joint. Sweating a fitting against dry framing is exactly how a slow smoulder starts inside a wall — one nobody notices until hours after you've packed up.",
    "pressurized-union": "That union is still showing line pressure on the gauge. Crack a fitting under pressure and whatever's behind it — water, or a still-hot line — comes out at whoever's hands are on the wrench.",
    "solvent-torch": "The primer and cement are open right next to a lit torch. Both are flammable solvents sitting open — vapour finding that flame is not a maybe, it's a when.",
  },

  lateNotes: {
    "backflow-preventer": "Not yet — get the DWV rough-in dry-fit before you're back on supply-side hardware.",
    "torch-valve": "Wrong point in the job. The PVC and backflow work come before the torch comes out.",
    "test-gauge": "Nothing to test yet — every joint gets made before the system gets pressurized.",
  },

  steps: [
    {
      id: "workorder", kind: "select", target: "work-order",
      title: "Read the rough-in work order",
      cue: "Check the plans: fixture count, vent sizing, and the DWV layout.",
      why: "You confirm what's supposed to be behind this wall before you cut into it — a vent sized wrong is a sewer-gas complaint six months from now, not something you catch by eye today.",
    },
    {
      id: "shutoff", kind: "turn", target: "main-shutoff",
      title: "Close the main shutoff",
      cue: "Turn the main off before opening any line downstream.",
      why: "Every fixture on this run can still be under pressure. The main goes off first — not just the branch you think you're isolating.",
      turn: { turns: 0.75, axis: "y", label: "MAIN SUPPLY" },
    },
    {
      id: "bleed", kind: "hold", target: "bleed-valve", seconds: 5,
      title: "Bleed the line",
      cue: "Hold the bleeder open until the line runs dry.",
      why: "Closing the main doesn't empty the pipe. Whatever's still standing in the line comes out at the first cut unless you bleed it here.",
      holdBreakNote: "Let go too soon — there's still water standing in the line. Hold the bleeder open the full run.",
    },
    {
      id: "dwv", kind: "sequence",
      targets: ["stack-vent", "closet-bend", "p-trap"],
      itemNames: { "stack-vent": "vent stack", "closet-bend": "closet bend", "p-trap": "P-trap" },
      title: "Dry-fit the DWV run",
      cue: "Set the vent stack, then the closet bend, then the trap — in that order.",
      why: "DWV assembles top-down: the vent connection and slope have to be right before you commit a trap that depends on both.",
      outOfOrderNote: "Wrong order — the stack and bend are what the trap's slope depends on. Set them first.",
    },
    {
      id: "backflow", kind: "drag", target: "backflow-preventer",
      title: "Fit the backflow preventer",
      cue: "Carry the backflow preventer from the bench to the hose bib supply.",
      why: "A hose bib is exactly the connection code requires backflow protection on — anything that could ever sit in a bucket needs an assembly that stops the flow from reversing.",
      drag: { to: "hose-bib-socket", radius: 0.35, missNote: "Not lined up with the bib — set it square onto the supply fitting." },
    },
    {
      id: "cement", kind: "hold", target: "pvc-joint", seconds: 4,
      title: "Solvent-weld the PVC joint",
      cue: "Prime, cement, then hold the joint together while it sets.",
      why: "The solvent weld needs sustained pressure to fuse. Let go early and the pipe's own spring-back opens a gap the cement never fills.",
      holdBreakNote: "Released early — the joint pulled apart microscopically before the weld set. Hold the full cure.",
    },
    {
      id: "torch", kind: "gauge", target: "torch-valve",
      title: "Dial a neutral flame",
      cue: "Adjust the oxy-acetylene mix until the flame reads neutral.",
      why: "A neutral flame gives a clean, even heat for sweating copper — too rich soots the joint, too lean burns the flux before the solder can wet the fitting.",
      gauge: {
        label: "FLAME MIX", speed: 0.8, green: [0.44, 0.6],
        readout: (t) => (t < 0.44 ? "carburizing" : t > 0.6 ? "oxidizing" : "neutral"),
        missNote: "Not a neutral flame — reset the mix before you bring it to the joint.",
      },
    },
    {
      id: "braze", kind: "gauge", target: "copper-joint",
      title: "Sweat the copper joint",
      cue: "Feed solder into the joint once the flux sizzles and the heat draws it in.",
      why: "Capillary action pulls molten solder through a properly heated joint on its own — chasing it into a cold or overheated fitting is how you get a joint that looks sound and weeps at the first pressure test.",
      gauge: {
        label: "JOINT TEMP", speed: 1.0, green: [0.5, 0.68],
        readout: (t) => `${Math.round(250 + t * 500)}°F`,
        missNote: "Wrong heat for the solder to draw — reset and feed it again once the flux sizzles.",
      },
    },
    {
      id: "pressuretest", kind: "gauge", target: "test-gauge",
      title: "Hold the test pressure",
      cue: "Pump to test pressure and hold inside the band for the full test.",
      why: "Code requires the system to hold a defined test pressure for a set duration — a slow bleed that isn't caught here becomes a warranty callback after the drywall's up.",
      gauge: {
        label: "TEST PRESSURE", speed: 0.6, green: [0.55, 0.72],
        readout: (t) => `${Math.round(t * 150)} psi`,
        missNote: "Off the required test band — reset and pump it back into range.",
      },
    },
    {
      id: "leakcheck", kind: "find", noHint: true,
      targets: ["leaking-joint"],
      itemNames: { "leaking-joint": "weeping joint" },
      itemNotes: { "leaking-joint": "That joint is weeping under test pressure — a slow leak here is exactly what the test exists to catch before the wall closes over it." },
      title: "Find the weeping joint",
      cue: "Look over every joint under pressure and click the one that's failing.",
      why: "A pressure drop tells you something's wrong somewhere on the run — it doesn't tell you which joint. That's still a visual check, every time.",
    },
  ],

  build(root) {
    const hits = {};
    const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };

    shell(root, {
      w: 9, d: 8.4, h: 3.0,
      floor: 0x4a4038, wall: 0xc9c0ac, ceiling: 0x2f2b26,
      floorRough: 0.95, skirtColor: 0x35302a,
    });
    // Bare-stud framing along the back wall — this is a rough-in, no drywall yet.
    const studWall = group(root, 0, 0, -4.15);
    for (let i = -5; i <= 5; i++) box(studWall, 0.09, 2.9, 0.09, i * 0.7, 1.45, 0.03, WOOD, { rough: 0.92 });
    box(studWall, 7.3, 0.09, 0.09, 0, 0.09, 0.03, WOOD, { rough: 0.92 });
    box(studWall, 7.3, 0.09, 0.09, 0, 2.86, 0.03, WOOD, { rough: 0.92 });
    ceilingPanel(root, -2.2, 1.4, { w: 1.6, color: 0xfff0dc, ei: 1.3, y: 2.94, lamp: 2.2, range: 11 });
    ceilingPanel(root, 2.2, 1.4, { w: 1.6, color: 0xfff0dc, ei: 1.3, y: 2.94, lamp: 2.2, range: 11 });
    ceilingPanel(root, 0, -2.6, { w: 1.6, color: 0xfff0dc, ei: 1.1, y: 2.94, lamp: 2.0, range: 11 });

    // ------------------------------------------------------------ work order
    const plans = group(root, -3.9, 0, 1.6, Math.PI / 2 + 0.1);
    box(plans, 0.06, 1.5, 0.06, 0, 0.75, 0, WOOD, { rough: 0.92 });
    decal(plans, 0.6, 0.5, 0, 1.4, 0.04, paperFace("ROUGH-IN WORK ORDER", [
      "Lot 14 — half bath", "Fixtures: lav, WC, tub", "Vent: 2\" stack, wet-vented",
      "DWV: 3\" main to 2\" branch", "Test: 5 psi air, 15 min hold",
    ]));
    reg(plans, "work-order");

    // ------------------------------------------------------------ main supply
    const supply = group(root, -3.4, 0, 3.0);
    cyl(supply, 0.03, 0.03, 1.0, 0, 0.5, 0, PIPE_COPPER, { rough: 0.35, metal: 0.75, seg: 12 });
    const valveBody = cyl(supply, 0.06, 0.06, 0.16, 0, 0.85, 0, BRASS, { rough: 0.35, metal: 0.8, seg: 14 });
    const wheelGrp = group(supply, 0, 0.95, 0);
    torus(wheelGrp, 0.09, 0.014, 0, 0, 0, BRASS, { rough: 0.4, metal: 0.75 }).rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const spoke = box(wheelGrp, 0.16, 0.012, 0.012, 0, 0, 0, BRASS, { rough: 0.4, metal: 0.75 });
      spoke.rotation.y = (i * Math.PI) / 4;
    }
    decal(supply, 0.2, 0.07, 0, 1.15, 0.06, signFace("MAIN SUPPLY", { bg: "#2f2b26", accent: "#cf8b3c", scale: 0.55 }));
    reg(wheelGrp, "main-shutoff");

    // Bleed valve just downstream of the main.
    const bleed = group(root, -3.4, 0, 2.5, 0.3);
    cyl(bleed, 0.018, 0.018, 0.14, 0, 0.62, 0, BRASS, { rough: 0.35, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    const bleedHandle = cyl(bleed, 0.035, 0.035, 0.05, 0.09, 0.62, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 10 });
    bleedHandle.rotation.z = Math.PI / 2;
    const drip = particles(bleed, 40, 0x6fb4d8, { size: 0.014, life: 0.4, additive: false, opacity: 0.7 });
    reg(bleed, "bleed-valve");

    // ---------------------------------------------------------------- DWV run
    const dwv = group(root, -1.1, 0, -3.2);
    const stack = cyl(dwv, 0.06, 0.06, 2.6, 0, 1.9, 0, PVC, { rough: 0.5, seg: 16 });
    reg(stack, "stack-vent");
    const bendGrp = group(dwv, 0, 0.5, 0);
    torus(bendGrp, 0.13, 0.06, 0, 0, 0, PVC, { rough: 0.5, seg: 10, seg2: 16 }).rotation.set(Math.PI / 2, 0, 0);
    reg(bendGrp, "closet-bend");
    const trapGrp = group(dwv, 0.5, 0.14, 0);
    cyl(trapGrp, 0.06, 0.06, 0.5, 0, 0, 0, PVC, { rough: 0.5, seg: 14 }).rotation.z = Math.PI / 2;
    torus(trapGrp, 0.09, 0.06, 0.25, -0.06, 0, PVC, { rough: 0.5, seg: 10, seg2: 16 });
    cyl(trapGrp, 0.06, 0.06, 0.3, 0.25, -0.1, 0, PVC, { rough: 0.5, seg: 14 });
    reg(trapGrp, "p-trap");
    decal(dwv, 0.3, 0.09, 0, 3.1, 0.07, signFace("DWV — 2\" VENT", { bg: "#2f2b26", accent: "#cf8b3c", scale: 0.5 }));

    // -------------------------------------------------------- backflow bench
    const bench = counter(root, 1.1, 0.55, 3.0, -3.4, 0x5b6672, { height: 0.86 });
    const backflowGrp = group(bench, 0, 0.9, 0, 0.2);
    cyl(backflowGrp, 0.045, 0.045, 0.22, 0, 0, 0, BRASS, { rough: 0.35, metal: 0.8, seg: 14 }).rotation.z = Math.PI / 2;
    box(backflowGrp, 0.09, 0.09, 0.09, 0, 0.06, 0, BRASS, { rough: 0.35, metal: 0.8 });
    decal(backflowGrp, 0.09, 0.05, 0, 0.13, 0.046, signFace("PVB", { bg: "#2f2b26", accent: "#c9a227", scale: 0.6 }));
    reg(backflowGrp, "backflow-preventer");

    // Hose bib on the exterior-facing wall — where the preventer belongs.
    const bibGrp = group(root, 3.9, 0, -1.0, -Math.PI / 2);
    cyl(bibGrp, 0.025, 0.025, 0.18, 0, 0.6, 0, BRASS, { rough: 0.35, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    const bibHandle = cyl(bibGrp, 0.05, 0.05, 0.03, 0.1, 0.6, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 12 });
    bibHandle.rotation.z = Math.PI / 2;
    // Invisible marker at the exact spot the preventer snaps onto once carried over.
    const bibSocket = cyl(bibGrp, 0.045, 0.045, 0.02, -0.14, 0.6, 0, 0xffffff, { rough: 0.5 });
    bibSocket.visible = false;
    reg(bibSocket, "hose-bib-socket");
    decal(bibGrp, 0.2, 0.07, 0, 0.78, 0.03, signFace("HOSE BIB", { bg: "#2f2b26", accent: "#cf8b3c", scale: 0.55 }));

    // Hazard: garden hose siphoning from the bib into a mop bucket.
    const hoseBucket = group(root, 3.5, 0, -0.3);
    cyl(hoseBucket, 0.16, 0.13, 0.32, 0, 0.16, 0, 0x3a4048, { rough: 0.7, seg: 16 });
    box(hoseBucket, 0.02, 0.02, 0.34, 0, 0.34, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    hose(hoseBucket, [[0.4, 0.62, -0.7], [0.3, 0.3, -0.4], [0.1, 0.1, -0.1], [0, 0.15, 0]], 0.016, 0x2f7d4a, { steps: 20 });
    reg(hoseBucket, "hose-bucket");

    // -------------------------------------------------------------- PVC joint
    const pvcJoint = group(root, 1.0, 0, -3.6);
    cyl(pvcJoint, 0.045, 0.045, 0.5, -0.25, 0.9, 0, PVC, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    const teeBody = ball(pvcJoint, 0.065, 0, 0.9, 0, PVC, { rough: 0.5, seg: 14 });
    cyl(pvcJoint, 0.045, 0.045, 0.4, 0.22, 0.9, 0, PVC, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    reg(teeBody, "pvc-joint");
    // Primer and cement cans on the sill beside the joint.
    const cementCans = group(root, 1.4, 0, -3.85);
    for (const [dx, color, label] of [[-0.1, 0x6b3fa0, "PRIMER"], [0.1, 0x2b6f8c, "CEMENT"]]) {
      cyl(cementCans, 0.045, 0.045, 0.09, dx, 0.045, 0, color, { rough: 0.5, metal: 0.2, seg: 12 });
      decal(cementCans, 0.07, 0.03, dx, 0.09, 0.046, signFace(label, { bg: "#1b1e22", accent: "#cf8b3c", scale: 0.55 }));
    }

    // ------------------------------------------------------------ torch cart
    const cart = group(root, -3.0, 0, -1.6, 0.3);
    box(cart, 0.5, 0.04, 0.36, 0, 0.02, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    for (const [dx, color] of [[-0.12, 0x2f8c5a], [0.12, 0x8c2f2f]]) {
      cyl(cart, 0.09, 0.1, 0.85, dx, 0.46, 0, color, { rough: 0.45, metal: 0.35, seg: 16 });
      cyl(cart, 0.045, 0.05, 0.1, dx, 0.94, 0, 0x9aa1a8, { rough: 0.3, metal: 0.85, seg: 12 });
    }
    const torchValveGrp = group(cart, 0, 0.85, 0.14);
    box(torchValveGrp, 0.08, 0.06, 0.05, 0, 0, 0, 0x9aa1a8, { rough: 0.35, metal: 0.8 });
    const flameDial = cyl(torchValveGrp, 0.03, 0.032, 0.03, 0, 0.05, 0, PIPE_WARN, { rough: 0.4, seg: 12 });
    reg(torchValveGrp, "torch-valve");
    const torchHandle = group(root, -2.2, 0.92, -2.2, 0.5);
    box(torchHandle, 0.28, 0.03, 0.03, 0, 0, 0, 0x9aa1a8, { rough: 0.3, metal: 0.85 });
    cyl(torchHandle, 0.012, 0.008, 0.14, 0.16, 0, 0, 0x2b2f34, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    hose(cart, [[-0.12, 0.9, 0], [-0.4, 0.7, -0.5], [-0.9, 0.6, -1.0]], 0.014, 0x2f8c5a, { steps: 16 });
    hose(cart, [[0.12, 0.9, 0], [0.4, 0.7, -0.5], [0.9, 0.6, -1.0]], 0.014, 0x8c2f2f, { steps: 16 });
    const flame = particles(root, 30, 0xffb35c, { size: 0.02, life: 0.3 });

    // Copper joint being sweated, just past the torch's reach.
    const copperGrp = group(root, -1.9, 0, -2.3);
    cyl(copperGrp, 0.02, 0.02, 0.4, 0, 0.9, -0.25, PIPE_COPPER, { rough: 0.3, metal: 0.75, seg: 10 }).rotation.x = Math.PI / 2;
    const copperFitting = ball(copperGrp, 0.032, 0, 0.9, -0.02, PIPE_COPPER, { rough: 0.3, metal: 0.75, seg: 12 });
    cyl(copperGrp, 0.02, 0.02, 0.3, 0, 0.9, 0.18, PIPE_COPPER, { rough: 0.3, metal: 0.75, seg: 10 }).rotation.x = Math.PI / 2;
    reg(copperFitting, "copper-joint");
    // Bare stud directly behind the torch work — no heat shield.
    const bareStud = box(root, 0.09, 2.6, 0.09, -1.9, 1.3, -2.7, WOOD, { rough: 0.92 });
    reg(bareStud, "torch-stud");

    // --------------------------------------------------------- test manifold
    const manifold = group(root, 0.4, 0, 2.6);
    box(manifold, 0.3, 0.24, 0.12, 0, 0.85, 0, PIPE_STEEL, { rough: 0.45, metal: 0.6 });
    const gaugeFace = decal(manifold, 0.16, 0.16, 0, 0.94, 0.062,
      signFace("0 psi", { bg: "#12191f", accent: "#cf8b3c", fg: "#ffd9a0", scale: 0.6 }), { glow: true, ei: 0.7 });
    const gaugeNeedle = box(manifold, 0.008, 0.055, 0.004, 0, 0.94, 0.07, 0xffffff, { rough: 0.5 });
    reg(manifold, "test-gauge");
    // A second union in the supply run, still pressurised — the trap for
    // anyone tempted to break into it before the bleeder's been run.
    const pressurizedUnion = group(root, 0.4, 0, 3.1);
    cyl(pressurizedUnion, 0.03, 0.03, 0.3, 0, 0.85, 0, BRASS, { rough: 0.35, metal: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    const unionNut = cyl(pressurizedUnion, 0.045, 0.045, 0.05, 0.1, 0.85, 0, BRASS, { rough: 0.35, metal: 0.8, seg: 14 });
    unionNut.rotation.z = Math.PI / 2;
    reg(pressurizedUnion, "pressurized-union");
    // Solvent cans left open right beside the torch cart — the flammable-vapour trap.
    const solventTorch = group(root, -2.5, 0, -1.1);
    cyl(solventTorch, 0.045, 0.045, 0.09, 0, 0.045, 0, 0x2b6f8c, { rough: 0.5, metal: 0.2, seg: 12 });
    decal(solventTorch, 0.07, 0.03, 0, 0.09, 0.046, signFace("CEMENT", { bg: "#1b1e22", accent: "#cf8b3c", scale: 0.55 }));
    reg(solventTorch, "solvent-torch");

    // Three joints under test — one weeping, two dry. Visually near-identical,
    // exactly the point: the pressure gauge tells you *something* is wrong,
    // not *which* joint, so every one gets looked at.
    const joints = group(root, 1.7, 0, 2.2);
    const leakGrp = group(joints, 0, 0.7, 0);
    cyl(leakGrp, 0.028, 0.028, 0.3, 0, 0, 0, PIPE_COPPER, { rough: 0.35, metal: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
    const leakFitting = ball(leakGrp, 0.04, 0, 0, 0, PIPE_COPPER, { rough: 0.35, metal: 0.7, seg: 12 });
    const weep = particles(leakGrp, 40, 0x6fb4d8, { size: 0.012, life: 0.35, additive: false, opacity: 0.75 });
    reg(leakFitting, "leaking-joint");
    for (const dz of [-0.5, 0.5]) {
      const dryGrp = group(joints, 0, 0.7, dz);
      cyl(dryGrp, 0.028, 0.028, 0.3, 0, 0, 0, PIPE_COPPER, { rough: 0.35, metal: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
      const dryFitting = ball(dryGrp, 0.04, 0, 0, 0, PIPE_COPPER, { rough: 0.35, metal: 0.7, seg: 12 });
      reg(dryFitting, dz < 0 ? "dry-joint-a" : "dry-joint-b");
    }

    const key = new THREE.DirectionalLight(0xf0e4cc, 1.0);
    key.position.set(3, 5.4, 2.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
    root.add(key);
    root.add(new THREE.HemisphereLight(0xd8ccb0, 0x3a342c, 1.25));

    let bleeding = false, torchLit = false, pressurized = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-1.5, 1.0, -2.5),

      onStep(step) {
        bleeding = false;
        torchLit = step.id === "torch" || step.id === "braze";
      },

      onStepComplete(step) {
        if (step.id === "shutoff") {
          decal(supply, 0.2, 0.07, 0, 1.15, 0.06, signFace("SUPPLY OFF", { bg: "#0d2b22", accent: "#59c97b", fg: "#8ef0c0", scale: 0.55 }));
        }
        if (step.id === "backflow") {
          backflowGrp.position.set(0, 0, 0);
          backflowGrp.parent.remove(backflowGrp);
          bibGrp.add(backflowGrp);
          backflowGrp.position.set(-0.14, 0.6, 0);
          backflowGrp.rotation.set(0, 0, 0);
        }
        if (step.id === "cement") {
          teeBody.material = teeBody.material.clone();
          teeBody.material.color.set(0xd8d4c4);
        }
        if (step.id === "braze") {
          torchLit = false;
          copperFitting.material = copperFitting.material.clone();
          copperFitting.material.color.set(0xb87333);
          copperFitting.material.emissive?.set?.(0x000000);
        }
        if (step.id === "pressuretest") { pressurized = true; weep.visible = true; }
        if (step.id === "leakcheck") { weep.visible = false; }
      },

      onHazard(hitId) {
        if (hitId === "hose-bucket" || hitId === "torch-stud" || hitId === "pressurized-union" || hitId === "solvent-torch") {
          drip.visible = true;
        }
      },

      animate(t, dt, session) {
        if (session?.step?.id === "bleed") {
          bleeding = true;
          drip.visible = true;
          drip.userData.step(dt, new THREE.Vector3(0, 0.55, 0), 0.03, 0.6, -3.5);
        } else if (drip.visible && !weep.visible) {
          drip.visible = false;
        }

        if (torchLit) {
          flame.visible = true;
          flame.userData.step(dt, new THREE.Vector3(-2.06, 0.92, -2.06), 0.02, 1.4, 0.4);
        } else if (flame.visible) {
          flame.visible = false;
        }

        if (weep.visible) {
          weep.userData.step(dt, new THREE.Vector3(1.7, 0.68, 2.2), 0.02, 0.35, -2.8);
        }

        const g = session?.gauge;
        if (g && !g.committed) {
          if (session.step?.id === "torch") {
            flameDial.rotation.y = g.t * Math.PI * 1.5;
            const label = g.t < 0.44 ? "RICH" : g.t > 0.6 ? "LEAN" : "NEUTRAL";
            flameDial.material = flameDial.material.clone();
            flameDial.material.color.set(g.t >= 0.44 && g.t <= 0.6 ? PIPE_GOOD : PIPE_WARN);
          }
          if (session.step?.id === "pressuretest") {
            const psi = Math.round(g.t * 150);
            gaugeNeedle.rotation.z = -1.6 + g.t * 3.2;
            repaint(gaugeFace, signFace(`${psi} psi`, {
              bg: "#12191f", accent: g.t >= 0.55 && g.t <= 0.72 ? "#59c97b" : "#f2ae14", fg: "#ffd9a0", scale: 0.6,
            }));
          }
        }
      },
    };
  },
};
