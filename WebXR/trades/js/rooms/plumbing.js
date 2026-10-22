import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, mergeStatic, counter, particles, markInteractive,
} from "../../../shared/kit.js";
import { bottleRack, noticeBoard, racking, shadowBoard, shopFan, sideBench, spillStation, wasteBin , bayCrew, breatheCrew } from "../shopfit.js";
import { plantHardHat } from "../../../shared/eggs.js";

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
  certification: "UA journeyman plumber and state plumbing licence; IPC/UPC drain-waste-vent code; ANSI/ASSE 5110 backflow prevention assembly tester and ANSI/ASSE 1020 pressure vacuum breakers; NSF/ANSI 61 and 372 for wetted drinking-water components; ASME B31.9 building services piping; OSHA 29 CFR 1910.252 welding, cutting and brazing with NFPA 51B hot work",
  accent: PIPE_COPPER,
  accentCss: "#cf8b3c",
  parSeconds: 235,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 14.6, d: 13.6 },
  spawn: { x: -1.6, z: 3.5, ry: -0.43 },
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
      why: "Fixture units, vent size and where the wet vent picks up all get confirmed before a saw touches the framing. An undersized vent shows up as a trap siphoning itself dry six months later, venting sewer gas into a finished bathroom through a wall that is by then boarded and tiled.",
    },
    {
      id: "shutoff", kind: "turn", target: "main-shutoff",
      title: "Close the main shutoff",
      cue: "Turn the main off before opening any line downstream.",
      why: "Assume street pressure on every fixture downstream. The branch valve you believe isolates this run may be a fifteen-year-old gate that no longer seats, and you would only learn that at the first cut. Take the main round to its stop instead of trusting a valve nobody has ever proved.",
      turn: { turns: 0.75, axis: "y", label: "MAIN SUPPLY" },
    },
    {
      id: "bleed", kind: "hold", target: "bleed-valve", seconds: 5,
      title: "Bleed the line",
      cue: "Hold the bleeder open until the line runs dry.",
      why: "A closed main does not empty a riser. The column hangs on its own vacuum until something admits air, so the first fitting cracked becomes the vent and the whole standing head lands at once — on the floor, the tools and anything open below. Bleed it down and watch the flow die.",
      holdBreakNote: "Let go too soon — there's still water standing in the line. Hold the bleeder open the full run.",
    },
    {
      id: "dwv", kind: "sequence",
      targets: ["stack-vent", "closet-bend", "p-trap"],
      itemNames: { "stack-vent": "vent stack", "closet-bend": "closet bend", "p-trap": "P-trap" },
      title: "Dry-fit the DWV run",
      cue: "Set the vent stack, then the closet bend, then the trap — in that order.",
      why: "Drain, waste and vent assembles top down: the vent tie-in and the fall are the datum everything under them is set from. The trap goes last because its weir height and arm slope decide whether the seal holds or siphons out, and neither can be adjusted once the stack and bend are welded in.",
      outOfOrderNote: "Wrong order — the stack and bend are what the trap's slope depends on. Set them first.",
    },
    {
      id: "backflow", kind: "drag", target: "backflow-preventer",
      title: "Fit the backflow preventer",
      cue: "Carry the backflow preventer from the bench to the hose bib supply.",
      why: "A hose bib is the classic cross-connection — the one outlet a garden hose, a bucket and a momentary pressure drop can turn into a feed running backwards into potable supply. A vacuum breaker severs that path mechanically, which is why code names this fitting specifically rather than trusting the pressure.",
      drag: { to: "hose-bib-socket", radius: 0.35, missNote: "Not lined up with the bib — set it square onto the supply fitting." },
    },
    {
      id: "cement", kind: "hold", target: "pvc-joint", seconds: 4,
      title: "Solvent-weld the PVC joint",
      cue: "Prime, cement, then hold the joint together while it sets.",
      why: "Solvent cement does not glue PVC — it softens both faces so they fuse as the solvent flashes off. Hold the joint bottomed out while that happens, because the pipe's own spring-back backs it a few millimetres out of the socket and leaves a void the cement never closes. That is the joint that tests fine and weeps in service.",
      holdBreakNote: "Released early — the joint pulled apart microscopically before the weld set. Hold the full cure.",
    },
    {
      id: "torch", kind: "gauge", target: "torch-valve",
      title: "Dial a neutral flame",
      cue: "Adjust the oxy-acetylene mix until the flame reads neutral.",
      why: "Neutral means exactly enough oxygen to consume the fuel, with nothing spare at the tip. Carburising soots the fitting so flux cannot wet it; oxidising strips the flux ahead of the solder and grows an oxide film that solder simply refuses to bond to.",
      gauge: {
        label: "FLAME MIX", speed: 0.8, green: [0.44, 0.6],
        readout: (t) => (t < 0.44 ? "carburizing" : t > 0.6 ? "oxidizing" : "neutral"),
        missNote: "Not a neutral flame — reset the mix before you bring it to the joint.",
      },
    },
    {
      id: "sweat", kind: "gauge", target: "copper-joint",
      title: "Sweat the copper joint",
      cue: "Feed solder into the joint once the flux sizzles and the heat draws it in.",
      why: "Capillary action drags molten solder right round a properly heated fitting unaided — heat the copper, not the solder, and the joint draws when it is ready. Chase it with the flame and you get a tidy fillet at the mouth, voids behind it, and a weep that surfaces either at test or inside a finished wall.",
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
      why: "Code names a test pressure and a duration, and the duration is the half that catches anything — everything looks tight for ten seconds. A fitting shedding a pound over fifteen minutes will drip for years behind drywall, and the callback to chase it costs more than this rough-in earned.",
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
      why: "A falling needle says the system is shedding air and says nothing whatever about where. Locating it stays a fitting-by-fitting visual, and this is the last opportunity anyone has: after the board goes up, the same defect is diagnosed from a stain on a ceiling below, through somebody else's finishes.",
    },
  ],

  // Two things that happen behind a plumber's back on a live rough-in: the
  // isolation being undone by somebody else, and hot work that did not stop
  // when the torch did. See shared/game.js.
  interrupts: [
    {
      id: "main-reopened",
      kind: "Isolation breach",
      after: "backflow", delay: 3, seconds: 12,
      alert: "The main wheel has turned. Somebody down the floor has cracked your supply back open to fill a bucket and walked off.",
      cue: "You are across the bay with both hands full and the system behind you is live.",
      target: "main-shutoff",
      why: "An isolation nobody can see is not an isolation. The main goes back off before anything else happens and then you find out who opened it, because the next thing this job has is an open pipe end — and there is no warning between street pressure arriving and it arriving everywhere at once.",
      missNote: "The main stayed open while you worked. Pressure came back up behind a rough-in that is not made up yet, and the first open fitting anyone touches becomes the outlet — on a three-quarter-inch service that is roughly ten gallons a minute into an unfinished floor before somebody gets back to the valve.",
      wrongNote: "It is the main shutoff. Nothing else on this job is worth a second while the supply is live behind an open pipe end.",
    },
    {
      id: "hot-work-smoulder",
      kind: "Hot work fire",
      after: "sweat", delay: 4, seconds: 13,
      alert: "A thread of smoke is rising out of the stud bay behind the fitting you just sweated. There was no heat shield in there.",
      cue: "That is inside the wall now, not on the face of it.",
      target: "fire-extinguisher",
      why: "NFPA 51B requires extinguishing equipment within reach and a fire watch kept through the work and well after it, precisely because torch heat conducts along a fitting into framing and starts a smoulder that shows nothing for hours. You put it out now, while it is still a thread of smoke and still somewhere you can reach.",
      missNote: "Nobody went back to it. Hot work fires are almost always found long after the crew has packed up: that smoulder had the rest of the afternoon inside a closed stud bay with insulation for fuel, and the first anybody knew of it was the building alarm that night.",
      wrongNote: "It is the extinguisher racked on the stud wall. NFPA 51B puts one within reach of hot work so that the answer is three steps away and not down in the truck.",
    },
  ],

  build(root) {
    plantHardHat(root, THREE, "plumbing", [-3.4, 1.2, 3.0]); // Hard Hat Hunt — docs/easter-egg.md
    // The shell, the fittings and the shop furniture never move and are
    // never clicked, so they go in one group that is baked into a handful
    // of meshes at the end of the build. See mergeStatic in shared/kit.js.
    const fixed = group(root);
    const hits = {};
    const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };

    shell(fixed, {
      w: 14.6, d: 13.6, h: 3.9,
      floor: 0x4a4038, wall: 0xc9c0ac, ceiling: 0x2f2b26,
      floorRough: 0.95, skirtColor: 0x35302a,
          walkway: { lane: 0xe08a2c, hatch: 0x8a8272 },
      trim: 0xc4711f, structure: "pipes", structureColor: 0x7d8288, door: "shutter",
});
    // Bare-stud framing along the back wall — this is a rough-in, no drywall yet.
    const studWall = group(root, 0, 0, -4.15);
    for (let i = -5; i <= 5; i++) box(studWall, 0.09, 2.9, 0.09, i * 0.7, 1.45, 0.03, WOOD, { rough: 0.92 });
    box(studWall, 7.3, 0.09, 0.09, 0, 0.09, 0.03, WOOD, { rough: 0.92 });
    box(studWall, 7.3, 0.09, 0.09, 0, 2.86, 0.03, WOOD, { rough: 0.92 });

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
    // Hung on the valve the moment it is closed, and gone again the moment
    // somebody else opens it — the one readable sign that the isolation holds.
    const supplyOffTag = decal(supply, 0.2, 0.07, 0, 1.06, 0.06,
      signFace("SUPPLY OFF", { bg: "#0d2b22", accent: "#59c97b", fg: "#8ef0c0", scale: 0.55 }));
    supplyOffTag.visible = false;
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
    // What NFPA 51B calls extinguishing equipment within reach: an ABC unit
    // bracketed to the framing a few steps from where the torch is lit.
    const ext = group(root, -2.7, 0, -3.95);
    cyl(ext, 0.075, 0.075, 0.42, 0, 0.95, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 16 });
    cyl(ext, 0.05, 0.075, 0.08, 0, 1.2, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 16 });
    box(ext, 0.12, 0.035, 0.045, 0, 1.26, 0, 0x2b2f34, { rough: 0.5 });
    hose(ext, [[0.04, 1.23, 0], [0.13, 1.06, 0.05], [0.08, 0.86, 0.02]], 0.011, 0x1b1e22, { steps: 10 });
    box(ext, 0.14, 0.03, 0.09, 0, 0.78, 0.01, 0x8a949d, { rough: 0.45, metal: 0.6 });
    decal(ext, 0.13, 0.1, 0, 0.99, 0.079, signFace("ABC", { bg: "#f2c14b", fg: "#1b1e22", accent: "#b81410", scale: 0.7 }));
    decal(ext, 0.36, 0.09, 0, 1.46, 0.02, signFace("HOT WORK — FIRE WATCH", { bg: "#2f2b26", accent: "#f2c14b", scale: 0.45 }));
    reg(ext, "fire-extinguisher");
    // The stud bay that catches, once the heat has had time to travel.
    const smoulder = group(root, -1.9, 0, -2.78);
    const char = box(smoulder, 0.11, 0.34, 0.02, 0, 1.0, 0.04, 0x231a12, { rough: 0.95 });
    char.visible = false;
    const smoulderSmoke = particles(smoulder, 34, 0x9aa0a6,
      { size: 0.035, life: 1.5, additive: false, opacity: 0.4 });

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

    // The bay is 14.6m by 13.6m now. Push the workstations out to match, so
    // the extra floor is distance between jobs rather than empty ring.
    spreadLayout(root, 1.62);

    const W = 14.6, D = 13.6;
    // ------------------------------------------------- the rest of the bay
    // A rough-in bay's stock: copper and PVC on racking, fittings on a bench,
    // the torch bottles chained, the wet-vac and the drain kit.
    racking(fixed, -W / 2 + 0.55, -2.0, Math.PI / 2, { w: 3.2, h: 2.3, frame: 0x8a6a3a, stock: [0xb0762f, 0xd8dde3, 0x6b7480, 0xb0762f] });
    shadowBoard(fixed, W / 2 - 0.3, -2.6, -Math.PI / 2, { label: "Press tool · cutters · reamers · gauges", color: 0x3a4a3c });
    sideBench(fixed, 3.0, 4.4, Math.PI - 0.15, { w: 2.6, top: 0x6b6255 });
    bottleRack(fixed, -W / 2 + 1.1, 4.6, 0.6, { count: 3, colors: [0x2f5d3a, 0xb0902f, 0x8a3a2f] });
    spillStation(fixed, W / 2 - 1.2, 4.4, -0.8);
    wasteBin(fixed, -3.6, 5.0, 0.2, { color: 0x8a6a2f, lid: 0x6d5324, label: "Copper scrap" });
    noticeBoard(fixed, 0.2, D / 2 - 0.25, Math.PI, { w: 1.6 });
    shopFan(fixed, 4.2, 1.6, -1.1, { tilt: 0.2 });

    // A mate on the copper racking and an apprentice at the side bench.
    const crew = [
      bayCrew(root, -5.7, 0.4, 1.64, { task: "overhead", cloth: 0x4a6b52, hat: 0xdd7a2f, vis: 0xd8e33a }),
      bayCrew(root, 3.9, 3.2, -2.26, { task: "bench", cloth: 0x6b6255, hat: 0xf2c14b, vis: 0xd8e33a }),
    ];

    // Fittings on a grid sized to this floor, plus the bounce a real room
    // has and this one did not: see ceilingGrid in shared/kit.js.
    ceilingGrid(fixed, 14.6, 13.6, { color: 0xfff0dc, ei: 1.3, lamp: 1.5, y: 3.74 });

    mergeStatic(fixed);

    return {
      hits,
      spawnLook: new THREE.Vector3(-1.5, 1.0, -2.5),

      onStep(step) {
        bleeding = false;
        torchLit = step.id === "torch" || step.id === "sweat";
      },

      onStepComplete(step) {
        if (step.id === "shutoff") supplyOffTag.visible = true;
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
        if (step.id === "sweat") {
          torchLit = false;
          copperFitting.material = copperFitting.material.clone();
          copperFitting.material.color.set(0xb87333);
          copperFitting.material.emissive?.set?.(0x000000);
        }
        if (step.id === "pressuretest") { pressurized = true; weep.visible = true; }
        if (step.id === "leakcheck") { weep.visible = false; }
      },

      // Both of these are visible from where the learner is standing the
      // moment they fire: a valve wheel that has moved with its tag gone, and
      // smoke coming out of a stud bay that was fine a minute ago.
      onInterrupt(it) {
        if (it.id === "main-reopened") {
          supplyOffTag.visible = false;
          wheelGrp.rotation.y = 1.9;
          drip.visible = true;
        }
        if (it.id === "hot-work-smoulder") {
          char.visible = true;
          smoulderSmoke.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "main-reopened") {
          supplyOffTag.visible = true;
          wheelGrp.rotation.y = 0;
          drip.visible = false;
        }
        if (it.id === "hot-work-smoulder") smoulderSmoke.visible = false;
      },

      onHazard(hitId) {
        if (hitId === "hose-bucket" || hitId === "torch-stud" || hitId === "pressurized-union" || hitId === "solvent-torch") {
          drip.visible = true;
        }
      },

      animate(t, dt, session) {

        breatheCrew(crew, t);
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

        if (smoulderSmoke.visible) {
          smoulderSmoke.userData.step(dt, new THREE.Vector3(0, 1.18, 0.04), 0.06, 0.3, 0.1);
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
