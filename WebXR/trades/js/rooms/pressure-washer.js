import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, counter, particles, markInteractive,
} from "../../../shared/kit.js";
import { bottleRack, noticeBoard, racking, sideBench, spillStation, wallReel } from "../shopfit.js";

// Room 08 — Laborer, surface preparation: a pressure-wash of a painted stucco
// wall and its concrete apron, done the way a union laborers' crew is trained
// to do it — wash water contained and recovered, never sent to the storm
// drain, the substrate cleaned rather than cut, and the wand never pointed at
// anything that bites back. Three things are graded, each deterministically:
//
//   coverage     — the sweep pass is a `track` step: hold a steady overlap
//                  inside the band for the full pass; every drop-out costs.
//   damage       — nozzle choice, unloader pressure and standoff distance are
//                  scored steps; the 0° tip and the wand-at-the-outlet are
//                  seeded hazards with the real consequence spelled out.
//   containment  — drain cover, berms and vacuum recovery are ordered steps,
//                  and the breach in the berm has to be found before the job
//                  is signed off.

const PW_STUCCO = 0xd9cbb2, PW_STUCCO_GRIME = 0x8f8574, PW_CONCRETE = 0x9a9a92, PW_STEEL = 0x8a949d;
const PW_BRAND = 0xf2c14b, PW_HOSE = 0x2f2f33, PW_BERM = 0xc48b3f, PW_WATER = 0x6fb4d8, PW_WARN = 0xf2ae14, PW_GOOD = 0x59c97b;

export const ROOM_PRESSURE_WASHER = {
  id: "pressure-washer",
  trade: "Laborer — surface prep",
  title: "Wash-Down Yard",
  tagline: "Contained pressure-wash of a painted wall and apron: nozzle, pressure, standoff, coverage, recovery",
  category: "Surface Prep & Coatings",
  union: "LIUNA — Laborers' International Union of North America",
  certification: "LIUNA — laborers' surface-prep & pressure-washing training; stormwater pollution-prevention BMPs (Clean Water Act NPDES, local stormwater ordinance)",
  accent: PW_BRAND,
  accentCss: "#f2c14b",
  parSeconds: 255,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 16.2, d: 14.6 },
  spawn: { x: 0.0, z: 5.5, ry: 0 },
  badge: { id: "clean-recovery", name: "Clean Recovery", note: "Every litre of wash water contained and recovered, the substrate cleaned and not cut" },

  hazards: {
    "nozzle-0": "That's the red 0° tip. On stucco and painted trim it doesn't clean, it cuts — a pencil jet at 3,000 psi scores the surface and blows the finish off in strips. It also injects water through skin. It stays on the rack for this job.",
    "outlet-box": "You just swept the wand across the exterior outlet box. A weatherproof cover is rated for rain, not a pressure jet — water driven into the box makes a live path back up the wand to your hands.",
    "downstream-drain": "That drain is outside your berms and it goes to the Bay untreated. Wash water is paint chips, detergent, oil and grit — sending it to a storm drain is a discharge violation, and it's the whole reason the containment gets set before the pump starts.",
    "ladder-wand": "Running the wand off a ladder. The trigger kicks back at the moment you pull it, and the reaction on a ladder pushes you off the wall. Pressure washing is done from the ground or a platform, never from rungs.",
  },

  lateNotes: {
    "unloader-valve": "Not yet — the containment, PPE and the walk-around come before the pump is set.",
    "wand-sweep": "Set the nozzle, pressure and standoff before you start the pass — a pass at the wrong settings is damage you have to explain.",
    "vac-recovery": "Nothing to recover yet. The wash pass comes first; the vac picks up what it leaves.",
  },

  steps: [
    {
      id: "workorder", kind: "select", target: "job-board",
      title: "Read the job sheet",
      cue: "Check substrate, pressure limits and where the wash water is allowed to go.",
      why: "The sheet says stucco and painted trim, a 1,500 psi ceiling, and zero discharge to the storm system. Every setting on the machine follows from those three lines — you read them before you touch the pump.",
    },
    {
      id: "draincover", kind: "drag", target: "drain-mat",
      title: "Seal the storm drain",
      cue: "Carry the drain mat from the truck to the storm drain inside the work area.",
      why: "The drain inside the apron takes everything that runs across it straight to the Bay. It gets sealed before the first drop of water hits the wall — not after you notice the runoff heading for it.",
      drag: { to: "storm-drain", radius: 0.4, missNote: "Not over the grate — the mat has to sit square on the drain to seal it." },
    },
    {
      id: "berms", kind: "sequence",
      targets: ["berm-upstream", "berm-downstream"],
      itemNames: { "berm-upstream": "upstream berm", "berm-downstream": "downstream berm" },
      title: "Set the containment berms",
      cue: "Roll out the upstream berm first, then the downstream berm to close the pool.",
      why: "Upstream first stops clean runoff from the slope joining your wash water and doubling what you have to recover. Downstream closes the box. Set the low side first and the water walks around it while you're still rolling out the high side.",
      outOfOrderNote: "Wrong order — set the upstream berm first, then close the box on the downstream side.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["face-shield", "rubber-boots"],
      itemNames: { "face-shield": "face shield", "rubber-boots": "rubber boots" },
      title: "Put on face shield and boots",
      cue: "Face shield against blow-back, non-slip boots for a wet apron.",
      why: "Blow-back off stucco carries grit and paint flake at eye height, and the apron is going to be a sheet of water. Both are on before the pump is, every time.",
    },
    {
      id: "walkaround", kind: "sequence",
      targets: ["hose-couplings", "trigger-lock", "nozzle-rack"],
      itemNames: { "hose-couplings": "hose couplings", "trigger-lock": "trigger safety lock", "nozzle-rack": "nozzle rack" },
      title: "Walk around the machine",
      cue: "Check the couplings are seated, the trigger lock works, then pick a tip from the rack.",
      why: "A coupling that lets go under pressure whips a hose; a trigger without a working lock fires when the wand's set down. Both are a ten-second check that the whole job depends on.",
      outOfOrderNote: "Couplings and trigger lock before the nozzle — check the machine before you decide how to point it.",
    },
    {
      id: "nozzle", kind: "select", target: "nozzle-25",
      title: "Fit the green 25° tip",
      cue: "Take the 25° fan tip for stucco and painted trim.",
      why: "A 25° fan spreads the same flow across a stripe wide enough to clean without cutting. The 15° yellow is for bare concrete; the 0° red is on the rack as a trap, and it stays there.",
    },
    {
      id: "pressure", kind: "gauge", target: "unloader-valve",
      title: "Set the unloader",
      cue: "Dial the pressure into the band for painted stucco.",
      why: "The machine will make 3,000 psi. The wall is rated for half that — the unloader is where you decide the surface gets cleaned rather than stripped.",
      gauge: {
        label: "UNLOADER", speed: 0.75, green: [0.36, 0.52],
        readout: (t) => `${Math.round(600 + t * 2400)} psi`,
        missNote: "Off the band for stucco — too low won't lift the grime, too high strips the paint. Reset and dial it in.",
      },
    },
    {
      id: "standoff", kind: "gauge", target: "wand-standoff",
      title: "Set your standoff",
      cue: "Bring the tip in to the working distance for this surface and hold it there.",
      why: "Distance is the other half of pressure. The same tip at six inches etches stucco and at three feet just wets it — the graded band is the distance that cleans.",
      gauge: {
        label: "STANDOFF", speed: 0.7, green: [0.4, 0.58],
        readout: (t) => `${Math.round(4 + t * 32)} in`,
        missNote: "Wrong distance — closer than the band scores the surface, further and you're just rinsing. Reset and find the working range.",
      },
    },
    {
      id: "coverage", kind: "track", target: "wand-sweep", seconds: 8,
      title: "Make the wash pass",
      cue: "Hold the trigger and keep a steady 50% overlap, top to bottom, the full pass.",
      why: "Coverage is a rhythm: each stripe half over the last, at a speed the tip can actually lift the grime. Rush and it tiger-stripes; dwell and the fan starts cutting. The gauge reads your overlap — hold it in the band.",
      track: { start: 0.1, green: [0.42, 0.62], rise: 0.6, fall: 0.5, drift: 0.12, label: "OVERLAP", readout: (v) => `${Math.round(v * 100)}%` },
      holdBreakNote: "Trigger released mid-pass — the overlap collapses and the stripe shows. Pick the pass back up.",
    },
    {
      id: "recovery", kind: "hold", target: "vac-recovery", seconds: 5,
      title: "Recover the wash water",
      cue: "Run the vac along the low berm until the pool is gone.",
      why: "Contained water still isn't disposed of. It goes into the recovery tank for the sanitary connection or the hauler — not left to evaporate the grit onto the apron, and not lifted over the berm.",
      holdBreakNote: "Vac lifted early — there's still a pool against the berm. Run it until the apron's dry.",
    },
    {
      id: "berm-check", kind: "find", noHint: true,
      targets: ["berm-gap"],
      itemNames: { "berm-gap": "gap in the downstream berm" },
      itemNotes: { "berm-gap": "The downstream berm has lifted at the joint and water's been walking under it toward the outside drain. That's the breach the sign-off exists to catch." },
      title: "Walk the berms before sign-off",
      cue: "Check the containment line and click where it failed.",
      why: "A dry apron inside the box doesn't prove the box held. You walk the berms and look for the track where water got out — that's what's on the discharge log, not what you assumed.",
    },
  ],

  build(root) {
    const hits = {};
    const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };

    // An open-sided yard: concrete apron, painted stucco wall at the back,
    // daylight from a high roof.
    shell(root, {
      w: 16.2, d: 14.6, h: 4.7,
      floor: PW_CONCRETE, wall: 0x6b6f74, ceiling: 0x3a3f45,
      floorRough: 0.98, skirtColor: 0x4a4e52, backWall: false,
          walkway: { lane: 0x3f9ad0, hatch: 0x9aa0a6 },
      trim: 0x2f7fb0, structure: "trusses", door: "dock", doorDaylight: false,
});

    // ------------------------------------------------------- the stucco wall
    const wallGrp = group(root, 0, 0, -4.4);
    box(wallGrp, 8.4, 3.4, 0.2, 0, 1.7, 0, PW_STUCCO, { rough: 0.98 });
    // A grime band the wash pass lifts — painted on a decal so it can be
    // repainted cleaner as the coverage step progresses.
    const grimeFace = decal(wallGrp, 8.0, 2.2, 0, 1.35, 0.12, (g, w, h) => {
      g.fillStyle = "#8f8574"; g.fillRect(0, 0, w, h);
    }, { px: 512 });
    let cleanFrac = 0;
    function paintGrime(frac) {
      cleanFrac = frac;
      repaint(grimeFace, (g, w, h) => {
        g.fillStyle = "#8f8574"; g.fillRect(0, 0, w, h);
        g.fillStyle = "#d9cbb2"; g.fillRect(0, 0, w, h * frac);
        if (frac > 0 && frac < 1) {
          g.fillStyle = "rgba(111,180,216,0.55)"; g.fillRect(0, h * frac - 4, w, 8);
        }
      });
    }
    paintGrime(0);
    // Painted trim and a window — the things the wrong tip would strip.
    box(wallGrp, 1.5, 1.1, 0.06, 2.4, 2.0, 0.13, 0x3e5a72, { rough: 0.6 });
    box(wallGrp, 1.3, 0.9, 0.02, 2.4, 2.0, 0.17, 0x9fc3d8, { rough: 0.2, metal: 0.2 });
    // Exterior outlet box at knee height — the hazard.
    const outlet = box(wallGrp, 0.14, 0.2, 0.1, -3.3, 0.5, 0.15, 0x6b7076, { rough: 0.5, metal: 0.4 });
    decal(wallGrp, 0.12, 0.05, -3.3, 0.66, 0.21, signFace("GFCI", { bg: "#1b1e22", accent: "#f2ae14", scale: 0.6 }));
    reg(outlet, "outlet-box");

    // The wand-sweep target: an invisible pane in front of the wall the
    // learner holds the trigger on for the coverage pass.
    const sweepPane = box(root, 7.6, 2.2, 0.2, 0, 1.35, -4.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(sweepPane, "wand-sweep");
    // Standoff target: a marker on the apron at the working distance.
    const standoffGrp = group(root, 0, 0, -3.5);
    cyl(standoffGrp, 0.28, 0.28, 0.01, 0, 0.008, 0, PW_BRAND, { rough: 0.6, emissive: PW_BRAND, ei: 0.4, seg: 24 });
    const standoffFace = decal(standoffGrp, 0.44, 0.14, 0, 0.02, 0, signFace("STANDOFF", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.5 }));
    standoffFace.rotation.x = -Math.PI / 2;
    reg(standoffGrp, "wand-standoff");

    // ------------------------------------------------------------ job board
    // Beside the work wall, so facing the first task also shows the wall the job is about.
    const board = group(root, -3.6, 0, -3.7, 0.35);
    box(board, 0.06, 1.6, 0.06, 0, 0.8, 0, PW_STEEL, { rough: 0.5, metal: 0.5 });
    decal(board, 0.62, 0.52, 0, 1.45, 0.04, paperFace("JOB SHEET — WASH-DOWN", [
      "Substrate: painted stucco + trim", "Apron: broom-finish concrete",
      "Max 1,500 psi at the wall", "Tip: 25° fan, 12–18 in standoff",
      "Discharge: ZERO to storm drain", "Recover to tank — hauler pickup",
    ]));
    reg(board, "job-board");

    // ------------------------------------------------------ the machine
    const machine = group(root, 3.4, 0, 2.6, -0.5);
    box(machine, 0.9, 0.5, 0.6, 0, 0.35, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    box(machine, 0.8, 0.3, 0.5, 0, 0.75, 0, PW_BRAND, { rough: 0.5, metal: 0.3 });
    cyl(machine, 0.16, 0.16, 0.2, 0.32, 0.55, 0.1, 0x1b1e22, { rough: 0.7, seg: 16 });
    for (const sx of [-1, 1]) cyl(machine, 0.12, 0.12, 0.08, sx * 0.4, 0.12, 0, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.z = Math.PI / 2;
    decal(machine, 0.5, 0.12, 0, 0.9, 0.26, signFace("3000 PSI · 4 GPM", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.55 }));
    // Unloader valve with a pressure gauge.
    const unloaderGrp = group(machine, -0.35, 0.95, 0.1);
    cyl(unloaderGrp, 0.05, 0.05, 0.08, 0, 0, 0, PW_STEEL, { rough: 0.35, metal: 0.8, seg: 14 });
    const unloaderKnob = cyl(unloaderGrp, 0.045, 0.05, 0.05, 0, 0.06, 0, 0xb81410, { rough: 0.45, metal: 0.3, seg: 12 });
    const gaugeFace = decal(unloaderGrp, 0.18, 0.18, 0.18, 0.02, 0.06,
      signFace("0 psi", { bg: "#12191f", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.55 }), { glow: true, ei: 0.6 });
    const gaugeNeedle = box(unloaderGrp, 0.008, 0.06, 0.004, 0.18, 0.02, 0.07, 0xffffff, { rough: 0.5 });
    reg(unloaderGrp, "unloader-valve");
    // Couplings and hose.
    const couplings = group(machine, 0.45, 0.42, 0.25);
    cyl(couplings, 0.03, 0.03, 0.08, 0, 0, 0, 0xc9a227, { rough: 0.35, metal: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    cyl(couplings, 0.03, 0.03, 0.08, 0.1, 0, 0, 0xc9a227, { rough: 0.35, metal: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    reg(couplings, "hose-couplings");
    hose(root, [[3.8, 0.42, 2.9], [3.0, 0.1, 1.6], [1.6, 0.05, 0.4], [0.6, 0.6, -1.2], [0.3, 1.0, -2.6]], 0.02, PW_HOSE, { steps: 28 });
    // Wand with trigger lock.
    const wandGrp = group(root, 0.3, 1.0, -2.6, -0.4);
    cyl(wandGrp, 0.014, 0.014, 0.9, 0, 0, -0.45, PW_STEEL, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = Math.PI / 2;
    box(wandGrp, 0.05, 0.12, 0.08, 0, -0.08, 0.02, 0x1b1e22, { rough: 0.6 });
    const trigLock = box(wandGrp, 0.02, 0.04, 0.03, 0.03, -0.02, 0.05, 0xb81410, { rough: 0.5 });
    reg(trigLock, "trigger-lock");
    const spray = particles(root, 90, PW_WATER, { size: 0.02, life: 0.35, additive: false, opacity: 0.75 });
    const blowback = particles(root, 40, 0xbfb6a6, { size: 0.015, life: 0.5, additive: false, opacity: 0.6 });

    // Nozzle rack: green 25° is the answer, yellow 15° is wrong, red 0° is the hazard.
    const rack = group(machine, -0.1, 0.95, -0.28);
    box(rack, 0.5, 0.06, 0.08, 0, 0, 0, PW_STEEL, { rough: 0.5, metal: 0.5 });
    reg(rack, "nozzle-rack");
    const tips = [["nozzle-0", -0.17, 0xd2312b, "0°"], ["nozzle-15", 0, 0xf2c14b, "15°"], ["nozzle-25", 0.17, 0x59c97b, "25°"]];
    const tipMeshes = {};
    for (const [id, dx, color, label] of tips) {
      const t = group(rack, dx, 0.07, 0);
      cyl(t, 0.018, 0.024, 0.06, 0, 0, 0, color, { rough: 0.4, metal: 0.5, seg: 10 });
      decal(t, 0.06, 0.03, 0, 0.06, 0, signFace(label, { bg: "#1b1e22", accent: "#ffffff", scale: 0.6 }));
      reg(t, id);
      tipMeshes[id] = t;
    }

    // ----------------------------------------------------- PPE on the truck
    const truck = counter(root, 1.6, 0.7, -3.4, 3.2, 0x3a4048, { height: 0.9 });
    decal(truck, 1.2, 0.16, 0, 0.55, 0.36, signFace("CREW TRUCK · TAILGATE", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.5 }));
    const shield = group(truck, -0.45, 1.0, 0);
    box(shield, 0.22, 0.16, 0.02, 0, 0, 0, 0x9fc3d8, { rough: 0.2, opacity: 0.6, transparent: true });
    box(shield, 0.24, 0.04, 0.06, 0, 0.1, 0, 0x1b1e22, { rough: 0.6 });
    reg(shield, "face-shield");
    const boots = group(truck, 0.1, 0.95, 0);
    for (const dx of [-0.07, 0.07]) {
      box(boots, 0.09, 0.3, 0.12, dx, 0.15, 0, 0x1f4d3a, { rough: 0.6 });
      box(boots, 0.09, 0.06, 0.2, dx, 0.03, 0.04, 0x1b1e22, { rough: 0.7 });
    }
    reg(boots, "rubber-boots");
    // Drain mat rolled up on the tailgate — dragged to the drain.
    const drainMat = group(truck, 0.55, 0.95, 0);
    cyl(drainMat, 0.08, 0.08, 0.5, 0, 0.08, 0, 0x2f7d4a, { rough: 0.85, seg: 14 }).rotation.z = Math.PI / 2;
    reg(drainMat, "drain-mat");

    // ---------------------------------------------------- drains and berms
    // Storm drain inside the apron — the socket the mat snaps onto.
    const drainGrp = group(root, -1.6, 0, -1.4);
    box(drainGrp, 0.5, 0.02, 0.5, 0, 0.005, 0, 0x2b2f34, { rough: 0.7, metal: 0.4 });
    for (let i = -2; i <= 2; i++) box(drainGrp, 0.44, 0.012, 0.03, 0, 0.018, i * 0.09, 0x4a4e52, { rough: 0.6, metal: 0.4 });
    reg(drainGrp, "storm-drain");
    // Second drain outside the containment line — the discharge hazard.
    const outsideDrain = group(root, 3.6, 0, -0.4);
    box(outsideDrain, 0.5, 0.02, 0.5, 0, 0.005, 0, 0x2b2f34, { rough: 0.7, metal: 0.4 });
    for (let i = -2; i <= 2; i++) box(outsideDrain, 0.44, 0.012, 0.03, 0, 0.018, i * 0.09, 0x4a4e52, { rough: 0.6, metal: 0.4 });
    decal(outsideDrain, 0.5, 0.12, 0, 0.03, 0.4, signFace("TO BAY", { bg: "#1b1e22", accent: "#4fa3ff", scale: 0.5 })).rotation.x = -Math.PI / 2;
    reg(outsideDrain, "downstream-drain");
    // Berms: two rolled wattles, laid across the apron up- and downstream.
    const bermUp = group(root, 0, 0, -3.0);
    cyl(bermUp, 0.09, 0.09, 6.0, 0, 0.09, 0, PW_BERM, { rough: 0.95, seg: 12 }).rotation.z = Math.PI / 2;
    reg(bermUp, "berm-upstream");
    const bermDown = group(root, 0, 0, 0.6);
    cyl(bermDown, 0.09, 0.09, 4.0, -1.0, 0.09, 0, PW_BERM, { rough: 0.95, seg: 12 }).rotation.z = Math.PI / 2;
    // The joint where the downstream berm lifts — the find target.
    const gapGrp = group(bermDown, 1.4, 0, 0);
    const gapSeg = cyl(gapGrp, 0.09, 0.09, 0.8, 0, 0.12, 0.06, PW_BERM, { rough: 0.95, seg: 12 });
    gapSeg.rotation.z = Math.PI / 2; gapSeg.rotation.y = 0.18;
    reg(gapSeg, "berm-gap");
    reg(bermDown, "berm-downstream");
    for (const sx of [-1, 1]) {
      const side = cyl(root, 0.09, 0.09, 3.6, sx * 3.0, 0.09, -1.2, PW_BERM, { rough: 0.95, seg: 12 });
      side.rotation.x = Math.PI / 2;
    }
    // The wash-water pool that forms against the downstream berm.
    const pool = slab(root, 5.2, 0.012, 1.2, -0.2, 0.006, -0.1, PW_WATER, { rough: 0.15, metal: 0.2, opacity: 0.55, transparent: true, cast: false });
    pool.visible = false;
    // Track under the gap toward the outside drain — appears once the pool has drained.
    const leakTrack = slab(root, 0.3, 0.008, 1.6, 1.4, 0.004, 1.4, PW_WATER, { rough: 0.2, opacity: 0.5, transparent: true, cast: false });
    leakTrack.visible = false;

    // Vac recovery unit on the low side.
    const vac = group(root, -2.6, 0, 1.6, 0.4);
    cyl(vac, 0.22, 0.24, 0.6, 0, 0.3, 0, 0x3a4048, { rough: 0.6, metal: 0.3, seg: 18 });
    cyl(vac, 0.24, 0.24, 0.1, 0, 0.65, 0, PW_BRAND, { rough: 0.5, seg: 18 });
    hose(vac, [[0.2, 0.55, 0], [0.6, 0.3, -0.3], [1.0, 0.06, -0.8]], 0.03, 0x1b1e22, { steps: 16 });
    decal(vac, 0.3, 0.1, 0, 0.35, 0.25, signFace("RECOVERY", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.5 }));
    reg(vac, "vac-recovery");

    // Ladder leaning on the wall — the kickback hazard.
    const ladder = group(root, -2.9, 0, -4.0, 0.15);
    for (const sx of [-0.2, 0.2]) box(ladder, 0.05, 3.0, 0.05, sx, 1.5, 0.35, 0xb9bec4, { rough: 0.4, metal: 0.6 }).rotation.x = -0.22;
    for (let i = 0; i < 7; i++) box(ladder, 0.4, 0.03, 0.03, 0, 0.35 + i * 0.4, 0.42 - i * 0.055, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    reg(ladder, "ladder-wand");

    const key = new THREE.DirectionalLight(0xfff2dc, 1.15);
    key.position.set(-3, 6.5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -7; key.shadow.camera.right = 7;
    key.shadow.camera.top = 7; key.shadow.camera.bottom = -7;
    root.add(key);
    root.add(new THREE.HemisphereLight(0xdfe6ee, 0x4a4e52, 1.2));

    let spraying = false, vacRunning = false, tipFitted = false;

    // The bay is 16.2m by 14.6m now. Push the workstations out to match, so
    // the extra floor is distance between jobs rather than empty ring.
    spreadLayout(root, 1.62);

    const W = 16.2, D = 14.6;
    // ------------------------------------------------- the rest of the bay
    // A wash-down yard's kit: the hose reels, the chemistry chained upright,
    // the recovery drums and the spill station that makes containment real.
    wallReel(root, -W / 2 + 0.25, -1.4, Math.PI / 2, { color: 0x2f7fb0, hose: 0x1b2a33, y: 2.4 });
    wallReel(root, -W / 2 + 0.25, 0.4, Math.PI / 2, { color: 0x3f9ad0, hose: 0x1b2a33, y: 2.4 });
    bottleRack(root, -W / 2 + 1.4, 4.6, 0.5, { count: 4, colors: [0x2f7fb0, 0xb0902f, 0x2f5d3a, 0x8a3a2f] });
    racking(root, W / 2 - 0.55, -2.4, -Math.PI / 2, { w: 2.8, h: 2.2, frame: 0x7a848c, stock: [0x4d6b7a, 0x6b7480, 0x8a7a5e] });
    spillStation(root, W / 2 - 1.3, 3.6, -0.8);
    sideBench(root, 3.2, 5.0, Math.PI, { w: 2.4, top: 0x6f7780 });
    noticeBoard(root, -0.6, D / 2 - 0.25, Math.PI, { w: 1.7 });

    // Fittings on a grid sized to this floor, plus the bounce a real room
    // has and this one did not: see ceilingGrid in shared/kit.js.
    ceilingGrid(root, 16.2, 14.6, { color: 0xf4f0e6, ei: 1.35, lamp: 1.6, y: 4.54 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -4.0),

      onStep(step) {
        spraying = false; vacRunning = false;
      },

      onStepComplete(step) {
        if (step.id === "draincover") {
          drainMat.parent.remove(drainMat);
          drainGrp.add(drainMat);
          drainMat.position.set(0, 0.02, 0);
          drainMat.rotation.set(0, 0, 0);
          drainMat.children[0].rotation.set(0, 0, 0);
          drainMat.children[0].scale.set(1, 0.15, 1);
        }
        if (step.id === "nozzle") {
          tipFitted = true;
          const tip = tipMeshes["nozzle-25"];
          tip.parent.remove(tip);
          wandGrp.add(tip);
          tip.position.set(0, 0, -0.92);
          tip.rotation.set(Math.PI / 2, 0, 0);
        }
        if (step.id === "coverage") { paintGrime(1); pool.visible = true; }
        if (step.id === "recovery") { pool.visible = false; leakTrack.visible = true; }
        if (step.id === "berm-check") { leakTrack.visible = false; }
      },

      onHazard(hitId) {
        if (hitId === "nozzle-0") {
          repaint(grimeFace, (g, w, h) => {
            g.fillStyle = "#8f8574"; g.fillRect(0, 0, w, h);
            g.fillStyle = "#d9cbb2"; g.fillRect(0, 0, w, h * cleanFrac);
            g.strokeStyle = "#5a4e40"; g.lineWidth = 6;
            for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(w * 0.3 + i * 30, h * 0.2); g.lineTo(w * 0.34 + i * 30, h * 0.8); g.stroke(); }
          });
        }
      },

      animate(t, dt, session) {
        const step = session?.step;
        spraying = !!(step && (step.id === "coverage") && session.holding);
        vacRunning = !!(step && step.id === "recovery" && session.holding);

        if (spraying) {
          spray.visible = true; blowback.visible = true;
          const tr = session.track;
          const y = 2.4 - (tr ? Math.min(1, tr.inBand / (step.seconds || 8)) : 0) * 2.0;
          spray.userData.step(dt, new THREE.Vector3(Math.sin(t * 3.1) * 2.6, y, -3.9), 0.15, 1.6, -4.0);
          blowback.userData.step(dt, new THREE.Vector3(Math.sin(t * 3.1) * 2.6, y - 0.1, -3.7), 0.3, 0.8, -1.5);
          if (tr) paintGrime(Math.min(1, tr.inBand / (step.seconds || 8)));
        } else if (spray.visible) { spray.visible = false; blowback.visible = false; }

        if (vacRunning) {
          const k = session.holdFor / (step.seconds || 5);
          pool.scale.z = Math.max(0.05, 1 - k);
          pool.position.z = -0.1 + k * 0.5;
        }

        const g = session?.gauge;
        if (g && !g.committed) {
          if (step?.id === "pressure") {
            const psi = Math.round(600 + g.t * 2400);
            unloaderKnob.rotation.y = g.t * Math.PI * 2;
            gaugeNeedle.rotation.z = 1.4 - g.t * 2.8;
            repaint(gaugeFace, signFace(`${psi} psi`, {
              bg: "#12191f", accent: g.t >= 0.36 && g.t <= 0.52 ? "#59c97b" : "#f2ae14", fg: "#ffe9b0", scale: 0.55,
            }));
          }
          if (step?.id === "standoff") {
            const inches = Math.round(4 + g.t * 32);
            wandGrp.position.z = -2.2 - (1 - g.t) * 1.2;
            repaint(standoffFace, signFace(`${inches} in`, {
              bg: "#1b1e22", accent: g.t >= 0.4 && g.t <= 0.58 ? "#59c97b" : "#f2c14b", scale: 0.5,
            }));
          }
        }
      },
    };
  },
};
