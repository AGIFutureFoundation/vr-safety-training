import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, mergeStatic, counter, cabinet, particles, markInteractive, mat, HUD,
} from "../../../shared/kit.js";
import { noticeBoard, racking, shadowBoard, sideBench, spillStation, wasteBin , bayCrew, breatheCrew } from "../shopfit.js";

// Room 01 — Electrical worker: energy isolation and absence-of-voltage verification.
// Upgraded from the Unity project's Electrical Maintenance site (open panel,
// lockout staging, protected cable crossing) into a full ordered procedure with
// a live/dead/live proving sequence.

const STEEL = 0x8a949d, DARKSTEEL = 0x3a4148, PANEL_GREY = 0x59636d;
const COPPER = 0xb87333, HAZARD = 0xf2ae14;

export const ROOM_ELECTRICAL = {
  id: "electrical",
  trade: "Electrical worker",
  title: "Isolation Bay",
  tagline: "Lockout/tagout and absence-of-voltage verification on a 480 V distribution panel",
  union: "IBEW — International Brotherhood of Electrical Workers (inside wireman JATC)",
  certification: "NFPA 70E electrical safety in the workplace; OSHA 29 CFR 1910.147 control of hazardous energy (lockout/tagout) and 1910.333 work practices; IBEW/NECA JATC electrical safety training",
  accent: 0x5aa9ff,
  accentCss: "#5aa9ff",
  parSeconds: 180,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 13.6, d: 13.6 },
  spawn: { x: 0.0, z: 4.9, ry: 0 },
  badge: { id: "zero-energy", name: "Zero Energy Verified", note: "Perfect live-dead-live on the first run" },

  hazards: {
    "live-bus": "You reached into an energised enclosure. Exposed bus at 480 V will not warn you first — nothing enters that cabinet until the disconnect is open, locked, and proven dead.",
    "foreign-lock": "That padlock belongs to another worker. You never remove someone else's lock or tag: their life is on the other end of it. Each worker applies and removes their own.",
    "damaged-leads": "Those test leads have cracked insulation at the strain relief. Damaged leads put your hand at line potential — bin them and draw a rated set.",
    "meter-cat2": "That handheld is a CAT II instrument — its 300 V transient rating was set for testing at a branch-circuit outlet, not for standing in front of an open 480 V service panel. IEC 61010 grades a meter by where a fault can actually reach it, and a CAT II case and lead set have no fusing or arc rating for a bolted fault behind that deadfront. Draw the CAT III/CAT IV meter instead; the wrong instrument here fails the same way a bad breaker does, in your hand.",
  },

  lateNotes: {
    "test-l1": "Nothing gets touched inside that enclosure until the disconnect is open and your lock is on it.",
    "test-l2": "Nothing gets touched inside that enclosure until the disconnect is open and your lock is on it.",
    "test-l3": "Nothing gets touched inside that enclosure until the disconnect is open and your lock is on it.",
    "ground-cluster": "Grounds go on after the circuit is proven dead, not before — applying them to a live conductor is a bolted fault.",
    "meter-cat3": "You already have the right meter staged — check the circuit before you go drawing another instrument.",
    "boundary-cone": "The boundary goes down before the panel is opened, not after.",
    "continuity-tester": "Nothing to bond yet — the grounding cluster goes on before you prove the bond.",
  },


  // Interruptions: see shared/game.js. Neither of these is a step you can get
  // wrong on your own — one is a condition that changes behind you while your
  // hands and eyes are on the meter, the other is somebody else's hand
  // reaching for a handle they have no way of knowing is locked for a reason.
  interrupts: [
    {
      id: "reclose-attempt",
      kind: "Reclose attempt",
      after: "lock", delay: 4, seconds: 13,
      alert: "The clipboard supervisor from the spares racking is walking straight for the disconnect. They think Feeder 3B tripped on its own and are about to close it back in.",
      cue: "Stop them before that handle moves. Your lock does not mean anything if somebody closes the disconnect around it.",
      target: "disconnect-handle",
      why: "A hasp with your lock on it stops the handle from moving, but nothing stops a hand from reaching for it before somebody has actually looked at what is hanging there. The notice board and the tag on the hasp exist so that anyone tempted to restore power reads whose name is on the isolation first — but a supervisor mid-stride toward a tripped-looking breaker is exactly the moment that reading does not happen. You get there and stop the attempt before the mechanism, not the paperwork, is what is tested.",
      missNote: "Somebody else's hand reached the handle before you did. Whether the lock actually held the mechanism open under that kind of force was never the plan — the plan was that nobody with a reason to close it ever got the chance to try, and that depended on you being between them and the panel, not on the hardware.",
      wrongNote: "That is not what stops them. The supervisor is headed for the disconnect handle — get between them and it.",
    },
    {
      id: "lock-missing",
      kind: "Isolation breach",
      after: "test-dead", delay: 4, seconds: 13,
      alert: "Your lock is off the handle. Somebody has taken it off the hasp while you were testing.",
      cue: "Stop testing. That isolation is not yours until your lock is back on it.",
      target: "lock-station",
      why: "A personal lock is the one thing between you and somebody else's hand on that handle. It goes back on first, and then you find out who took it off and why.",
      missNote: "You carried on working inside a panel you no longer had locked out. That is the sequence behind most re-energisation fatalities: the isolation was correct once, and nobody looked at it again.",
      wrongNote: "The lock is the problem. Nothing else in this room is worth touching while that hasp is open.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "select", target: "ppe-cart",
      title: "Don arc-rated PPE",
      cue: "Take arc-rated PPE from the cart before you approach the panel.",
      why: "Arc-rated clothing goes on outside the boundary, before anything is opened. NFPA 70E rates it against incident energy in calories per square centimetre, and the boundary is simply where an arc would deliver about 1.2 cal/cm² — the onset of a second-degree burn on bare skin. Synthetics worn underneath melt into that burn.",
    },
    {
      id: "meter-check", kind: "find", noHint: true,
      targets: ["meter-cat3"],
      itemNames: { "meter-cat3": "CAT III/IV rated meter" },
      itemNotes: { "meter-cat3": "This is the rated instrument for a 480 V panel — draw it, not the one sitting next to it." },
      title: "Draw a correctly rated meter",
      cue: "Two meters are staged on the bench. Take the one actually rated for this panel.",
      why: "IEC 61010's measurement categories are not a quality grade, they are a statement about where in the system a fault can reach the meter and what the instrument is built to survive when it does. A meter bought for a branch-circuit outlet at home is a CAT II instrument; a 480 V service panel with unlimited available fault current behind the bus needs CAT III or CAT IV. Picking up the wrong one because it was closer is exactly the decision this room is built to catch before you learn it the hard way.",
    },
    {
      id: "schedule", kind: "select", target: "panel-schedule",
      title: "Identify the circuit",
      cue: "Read the panel schedule and confirm which circuit you are isolating.",
      why: "The schedule names what this breaker feeds and what else drops with it — the sump pump, the lab freezer, the fire pump controller. Pull the wrong feeder and somebody two floors away starts hunting for whatever just died on them, and the only handle they find in the off position is yours.",
    },
    {
      id: "notify", kind: "select", target: "notice-board",
      title: "Notify affected workers",
      cue: "Post the work notice so everyone downstream knows the feeder is coming out.",
      why: "OSHA 1910.147 requires affected employees to be told before the lockout goes on and again after it comes off. An unannounced outage is an invitation: a handle sitting off with no name against it and nothing to say whether the work is done reads, to somebody under pressure, as a thing to put back.",
    },
    {
      id: "boundary", kind: "drag", target: "boundary-cone",
      title: "Set the arc-flash boundary",
      cue: "Carry a boundary cone out to the marked line before the panel comes open.",
      why: "The restricted approach boundary is not a courtesy line — NFPA 70E draws it at the distance an unqualified bystander has to stay outside of while the enclosure in front of you is open and could still fault. It goes down before the door swings open, because the whole point is that anyone walking the aisle sees the line before they see a reason to ignore it, and a boundary set after the fact has already failed at the one moment it existed to cover.",
      drag: { to: "boundary-spot", radius: 0.4, missNote: "Short of the marked line — carry it out to the boundary and set it square on the mark." },
    },
    {
      // A turn, not a click: the cue has always said "rotate the handle", and
      // every other disconnect in the network is a turn. This one was missed
      // when the rest were converted, so the canonical isolation action in the
      // whole curriculum was the one place you isolated a 480 V supply by
      // tapping it once.
      id: "open", kind: "turn", target: "disconnect-handle",
      title: "Open the disconnect",
      cue: "Take the handle and rotate it all the way to OFF.",
      why: "Opening the disconnect is the isolation itself; everything after this only verifies and protects it. A rotary handle stopped part way has not broken the contacts — it can leave one phase made up, or the mechanism parked between positions where a knock drops it back in. Drive it to its stop and watch the indicator flip.",
      turn: { turns: 0.23, axis: "z", reverse: true, label: "MAIN DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lock-station",
      title: "Apply your lock and tag",
      cue: "Take your personal padlock and tag from the station and apply them to the hasp.",
      why: "Your lock, your key, nobody else's. One worker one lock is what turns lockout from paperwork into a personal guarantee, and the tag beside it carries the name, the time and the work — so nobody else has to decide on their own whether this is finished or the fitter is simply at lunch.",
    },
    {
      id: "prove-live", kind: "gauge", target: "proving-unit",
      title: "Prove the meter — live",
      cue: "Test the meter on the known-live proving unit. Commit inside the nominal band.",
      why: "A meter reading zero on a blown fuse, an open lead or a flat battery looks precisely like a dead circuit. Proving it against a known live source is the only thing that separates the two, and it is the half of live-dead-live people skip because the instrument was fine this morning.",
      gauge: {
        label: "PROVING UNIT — LINE VOLTAGE", unit: "V", speed: 0.75, green: [0.46, 0.64],
        readout: (t) => `${Math.round(t * 720)} V`,
        missNote: "That is not the proving unit's nominal output. Hold the leads steady and commit in the green band.",
      },
    },
    {
      id: "test-dead", kind: "sequence", target: null, anyOrder: true,
      targets: ["test-l1", "test-l2", "test-l3"],
      itemNames: { "test-l1": "L1 phase conductor", "test-l2": "L2 phase conductor", "test-l3": "L3 phase conductor" },
      title: "Test for absence of voltage",
      cue: "Test every phase conductor at the work point — all three, in any order.",
      why: "Absence of voltage means every conductor a hand could reach, phase to phase and phase to ground — not only the one you expect to be dead. A backfeed from a UPS, a control transformer or a mis-landed neighbour sits at 277 V to earth inside a panel already called safe, and says nothing about it.",
      outOfOrderNote: "Test each conductor once; you still have phases left to verify.",
    },
    {
      id: "prove-again", kind: "gauge", target: "proving-unit",
      title: "Re-prove the meter — live",
      cue: "Return to the proving unit and confirm the meter still reads correctly.",
      why: "The instrument can die between the dead test and this moment — a lead works half out of its socket, a fuse opens on a transient. Live-dead-live is one continuous instrument check with the dead reading in the middle, so a meter that can no longer read a known source has just voided everything you measured in that enclosure.",
      gauge: {
        label: "PROVING UNIT — CONFIRM", unit: "V", speed: 0.95, green: [0.46, 0.64],
        readout: (t) => `${Math.round(t * 720)} V`,
        missNote: "Off the nominal band. Steady the leads and commit inside the green zone.",
      },
    },
    {
      id: "ground", kind: "select", target: "ground-cluster",
      title: "Apply temporary protective grounds",
      cue: "Install the grounding cluster on the isolated conductors.",
      why: "Temporary protective grounds bond the conductors to earth, so a back-feed arriving while your hands are inside goes down the cluster and trips the source rather than through you. They also bleed off the capacitive charge a long feeder keeps after opening — easily enough to put somebody off a ladder.",
    },
    {
      id: "bond-check", kind: "hold", target: "continuity-tester", seconds: 4,
      title: "Prove the grounds are bonded",
      cue: "Hold the continuity tester on the cluster until it confirms a solid bond to earth.",
      why: "A clamp that looks seated is not the same thing as a clamp that is actually making metal-to-metal contact — paint, corrosion or a burr under the jaw can leave a ground cluster sitting on the conductor rather than bonded to it, and that failure is invisible until fault current needs the path and does not find one. Proving continuity at every clamp is the last check standing between a ground set that protects you and one that only looks like it does.",
      holdBreakNote: "Released before the tester confirmed the bond. Hold it on the clamp the full duration — a bond you didn't stay to prove is a bond you're assuming.",
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
      w: 13.6, d: 13.6, h: 4.0,
      floor: 0x4a5057, wall: 0x6d7681, ceiling: 0x2a3037,
      floorRough: 0.9, skirtColor: 0x2b3138,
          walkway: { lane: 0xf2c14b, hatch: 0x9aa4ae },
      trim: 0xd8a33a, structure: "pipes", door: "personnel",
});

    // Floor: arc-flash approach boundary painted in front of the panel bank.
    for (let i = -4; i <= 4; i++) {
      box(root, 0.26, 0.006, 0.1, i * 0.44, 0.004, -1.5, HAZARD, { cast: false, rough: 0.7 });
    }
    decal(root, 1.5, 0.34, 0, 0.006, -1.05, signFace("ARC FLASH BOUNDARY", { bg: "#4a5057", accent: "#f2ae14", scale: 0.5 }))
      .rotation.x = -Math.PI / 2;

    // Boundary marker post — where the cone actually has to land, at the end
    // of the painted line, and invisible so it never competes with the cone
    // itself for the learner's eye.
    const boundarySpot = box(root, 0.02, 0.02, 0.02, 2.35, 0.01, -1.5, 0x000000,
      { opacity: 0.001, transparent: true, cast: false, receive: false });
    reg(boundarySpot, "boundary-spot");

    // Boundary cone, staged by the PPE cart until it is carried out to the line.
    const boundaryCone = group(root, -1.95, 0, 1.45, 0.6);
    box(boundaryCone, 0.28, 0.02, 0.28, 0, 0.01, 0, 0x22262b, { rough: 0.9 });
    cyl(boundaryCone, 0.03, 0.12, 0.5, 0, 0.26, 0, HAZARD, { rough: 0.75, seg: 14 });
    cyl(boundaryCone, 0.07, 0.09, 0.06, 0, 0.3, 0, 0xe8eef2, { rough: 0.5, seg: 14 });
    reg(boundaryCone, "boundary-cone");

    // ------------------------------------------------------------- panel bank
    const bank = group(root, 0, 0, -3.55);
    box(bank, 3.9, 0.14, 0.72, 0, 0.07, 0, 0x30363c, { rough: 0.8 });            // housekeeping pad
    for (let i = -1; i <= 1; i++) {
      const cab = group(bank, i * 1.28, 0, 0);
      box(cab, 1.2, 2.05, 0.52, 0, 1.16, 0, PANEL_GREY, { rough: 0.42, metal: 0.65 });
      box(cab, 1.24, 0.06, 0.56, 0, 2.22, 0, PANEL_GREY, { rough: 0.42, metal: 0.65 });   // drip cap
      box(cab, 1.1, 0.04, 0.02, 0, 0.2, 0.27, 0x2c3238, { rough: 0.6 });                  // door seam
    }

    // Centre cabinet: door swung open, deadfront off, live bus exposed.
    const centre = group(bank, 0, 0, 0);
    const door = group(centre, -0.6, 1.16, 0.26);
    box(door, 1.14, 1.9, 0.035, 0.57, 0, 0, PANEL_GREY, { rough: 0.4, metal: 0.7 });
    box(door, 0.05, 0.22, 0.045, 1.06, 0, 0.03, STEEL, { rough: 0.3, metal: 0.9 });
    decal(door, 0.52, 0.3, 0.6, 0.62, 0.021,
      signFace("DANGER\nARC FLASH", { bg: "#b81410", accent: "#f2ae14", fg: "#ffffff", scale: 0.32 }));
    door.rotation.y = 1.15;

    const interior = group(centre, 0, 1.16, 0.14);
    box(interior, 1.06, 1.82, 0.06, 0, 0, -0.16, 0x1b2026, { rough: 0.9 });               // back pan
    // Vertical bus with three phase conductors, each individually testable.
    const phases = [
      { id: "test-l1", x: -0.3, colour: 0x2d2f33, tag: "L1" },
      { id: "test-l2", x: 0.0, colour: 0x9b1d18, tag: "L2" },
      { id: "test-l3", x: 0.3, colour: 0x1b3f86, tag: "L3" },
    ];
    const phaseMeshes = {};
    for (const p of phases) {
      const run = group(interior, p.x, 0, -0.06);
      const bar = box(run, 0.07, 1.5, 0.02, 0, 0.06, 0, COPPER, { rough: 0.32, metal: 0.95 });
      box(run, 0.1, 0.16, 0.05, 0, 0.68, 0.01, p.colour, { rough: 0.7 });                 // insulator boot
      box(run, 0.1, 0.16, 0.05, 0, -0.6, 0.01, p.colour, { rough: 0.7 });
      const lug = box(run, 0.11, 0.09, 0.06, 0, -0.2, 0.03, 0x6d757d, { rough: 0.35, metal: 0.9 });
      decal(run, 0.09, 0.06, 0, 0.86, 0.02, signFace(p.tag, { bg: "#20262c", accent: "#5aa9ff", scale: 0.7 }));
      reg(lug, p.id);
      phaseMeshes[p.id] = { bar, lug, run };
    }
    // Breaker rows flanking the bus.
    for (const sx of [-1, 1]) {
      for (let r = 0; r < 6; r++) {
        box(interior, 0.16, 0.1, 0.09, sx * 0.44, 0.62 - r * 0.16, 0.02, 0x22272c, { rough: 0.7 });
        box(interior, 0.05, 0.05, 0.04, sx * 0.44, 0.62 - r * 0.16, 0.08, r === 1 ? HAZARD : 0x0e1215, { rough: 0.6 });
      }
    }
    reg(box(interior, 0.94, 1.72, 0.02, 0, 0, -0.12, 0x141a20, { rough: 0.92, cast: false }), "live-bus");

    // Rotary disconnect handle on the right cabinet face.
    const discBody = group(bank, 1.28, 1.5, 0.27);
    box(discBody, 0.3, 0.34, 0.06, 0, 0, 0, 0x2c3238, { rough: 0.45, metal: 0.6 });
    decal(discBody, 0.26, 0.1, 0, 0.13, 0.035, signFace("MAIN DISCONNECT", { scale: 0.55 }));
    const handlePivot = group(discBody, 0, -0.03, 0.04);
    const handle = box(handlePivot, 0.06, 0.2, 0.05, 0, 0.08, 0, HAZARD, { rough: 0.5 });
    cyl(handlePivot, 0.035, 0.035, 0.05, 0, 0, 0.01, STEEL, { rough: 0.3, metal: 0.9, seg: 14 })
      .rotation.x = Math.PI / 2;
    const hasp = torus(discBody, 0.028, 0.008, -0.11, -0.1, 0.05, STEEL, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(handlePivot, "disconnect-handle");
    const stateLamp = ball(discBody, 0.022, 0.11, 0.11, 0.04, 0xff3b30,
      { emissive: 0xff3b30, ei: 2.4, rough: 0.3 });
    decal(bank, 0.62, 0.2, 1.28, 1.86, 0.28, signFace("ENERGISED", { bg: "#2a1416", accent: "#f0645b", scale: 0.55 }));

    // Applied lock and tag — hidden until the learner applies them.
    const appliedLock = group(discBody, -0.11, -0.1, 0.06);
    torus(appliedLock, 0.026, 0.007, 0, 0.026, 0, 0xc0c6cc, { rough: 0.25, metal: 0.95 }).rotation.y = Math.PI / 2;
    box(appliedLock, 0.032, 0.042, 0.018, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    const tag = decal(appliedLock, 0.09, 0.12, 0.005, -0.09, 0.01,
      paperFace("DANGER", ["DO NOT OPERATE", "A. Rivera", "Feeder 3B"], { bg: "#f4e9d8", band: "#b81410" }));
    tag.rotation.z = 0.08;
    appliedLock.visible = false;

    // -------------------------------------------------------- panel schedule
    const sched = decal(root, 0.6, 0.78, -1.9, 1.55, -4.27,
      paperFace("PANEL 3B — SCHEDULE", [
        "01  Bay lighting        20A",
        "03  Conveyor drive      60A",
        "05  Compressor          40A",
        "07  FEEDER 3B  ← WORK   100A",
        "09  Spare",
        "11  Weld receptacles    50A",
      ]));
    box(root, 0.66, 0.84, 0.02, -1.9, 1.55, -4.29, 0x20262c, { rough: 0.6 });
    reg(sched, "panel-schedule");

    // ----------------------------------------------------------- lock station
    const lockWall = group(root, -4.1, 0, -1.2, Math.PI / 2);
    box(lockWall, 0.9, 0.7, 0.06, 0, 1.5, 0, 0xd8232a, { rough: 0.6 });
    decal(lockWall, 0.84, 0.16, 0, 1.78, 0.035, signFace("GROUP LOCKOUT STATION", { bg: "#7d1512", accent: "#f2ae14", scale: 0.55 }));
    const hooks = group(lockWall, 0, 1.44, 0.04);
    const lockColours = [0xd8232a, 0x1f7ae0, 0x28a745, 0xf2ae14, 0x8e44ad];
    lockColours.forEach((c, i) => {
      const lx = -0.32 + i * 0.16;
      cyl(hooks, 0.006, 0.006, 0.05, lx, 0.14, 0.02, STEEL, { rough: 0.3, metal: 0.9, seg: 8 }).rotation.x = Math.PI / 2;
      const lock = group(hooks, lx, 0.06, 0.04);
      torus(lock, 0.022, 0.006, 0, 0.024, 0, 0xc0c6cc, { rough: 0.25, metal: 0.95 }).rotation.y = Math.PI / 2;
      box(lock, 0.03, 0.038, 0.016, 0, 0, 0, c, { rough: 0.5 });
    });
    for (let i = 0; i < 4; i++) {
      const t = decal(hooks, 0.075, 0.1, -0.26 + i * 0.16, -0.12, 0.03,
        paperFace("DANGER", ["DO NOT", "OPERATE"], { bg: "#f4e9d8", band: "#b81410" }));
      t.rotation.z = (i % 2 ? 1 : -1) * 0.06;
    }
    reg(lockWall, "lock-station");

    // A second worker's lock already on the board — removing it is the hazard.
    const foreign = group(lockWall, 0.36, 1.22, 0.06);
    torus(foreign, 0.024, 0.007, 0, 0.026, 0, 0xc0c6cc, { rough: 0.25, metal: 0.95 }).rotation.y = Math.PI / 2;
    box(foreign, 0.034, 0.044, 0.018, 0, 0, 0, 0x28a745, { rough: 0.5 });
    decal(foreign, 0.08, 0.1, 0, -0.09, 0.012,
      paperFace("IN USE", ["M. OKONKWO", "SHIFT 2"], { bg: "#f4e9d8", band: "#1d6b34" }));
    reg(foreign, "foreign-lock");

    // --------------------------------------------------------------- PPE cart
    const ppe = group(root, -2.85, 0, 0.55, 0.95);
    const cartBody = counter(ppe, 0.9, 0.5, 0, 0, 0x39424b, { height: 0.86, metal: 0.4, rough: 0.5 });
    // Face shield on a stand.
    const shieldStand = group(ppe, -0.24, 0.91, 0);
    cyl(shieldStand, 0.03, 0.05, 0.12, 0, 0.06, 0, 0x2c3238, { rough: 0.6, seg: 12 });
    ball(shieldStand, 0.1, 0, 0.24, 0, 0xe8e2d6, { rough: 0.5 });
    const visor = ball(shieldStand, 0.115, 0, 0.24, 0.02, 0xffb26b,
      { rough: 0.12, metal: 0.1, opacity: 0.55, side: 2 });
    visor.scale.set(1, 0.86, 0.7);
    box(shieldStand, 0.24, 0.05, 0.2, 0, 0.35, 0, 0x2c3238, { rough: 0.6 });
    // Rubber insulating gloves with leather protectors, cuffs up.
    for (const sx of [-1, 1]) {
      const glove = group(ppe, 0.14 + (sx > 0 ? 0.17 : 0), 0.9, sx * 0.06);
      cyl(glove, 0.055, 0.06, 0.26, 0, 0.13, 0, 0xd4622b, { rough: 0.85, seg: 12 });
      box(glove, 0.1, 0.12, 0.05, 0, 0.3, 0, 0xd4622b, { rough: 0.85 });
      cyl(glove, 0.062, 0.062, 0.06, 0, 0.03, 0, 0x8a5a3a, { rough: 0.9, seg: 12 });
    }
    // FR jacket folded on the shelf.
    box(ppe, 0.34, 0.1, 0.28, 0.06, 0.3, 0, 0x2f4c7a, { rough: 0.95 });
    box(ppe, 0.3, 0.03, 0.24, 0.06, 0.36, 0, 0x35558a, { rough: 0.95 });
    decal(ppe, 0.42, 0.1, 0, 0.62, 0.26, signFace("ARC-RATED PPE  CAT 2", { scale: 0.6 }));
    reg(ppe, "ppe-cart");

    // ---------------------------------------------------------- notice board
    const notice = group(root, 4.1, 0, -1.0, -Math.PI / 2);
    box(notice, 0.8, 0.6, 0.05, 0, 1.55, 0, 0x2c3238, { rough: 0.7 });
    decal(notice, 0.72, 0.52, 0, 1.55, 0.03, paperFace("WORK NOTICE", [
      "Feeder 3B out of service", "Crew: A. Rivera", "Start 09:15", "Affected: line 4 conveyor", "Restore: on release only",
    ]));
    reg(notice, "notice-board");

    // ---------------------------------------------------------- proving unit
    const proving = group(root, 4.1, 0, 0.6, -Math.PI / 2);
    box(proving, 0.34, 0.44, 0.14, 0, 1.35, 0, 0x1f262c, { rough: 0.5, metal: 0.3 });
    decal(proving, 0.3, 0.12, 0, 1.52, 0.075, signFace("PROVING UNIT", { accent: "#5aa9ff", scale: 0.55 }));
    for (const sx of [-1, 1]) {
      cyl(proving, 0.016, 0.016, 0.03, sx * 0.07, 1.28, 0.08, sx < 0 ? 0x1b1e22 : 0xb81410, { rough: 0.5, seg: 10 })
        .rotation.x = Math.PI / 2;
    }
    const provingLamp = ball(proving, 0.018, 0, 1.19, 0.08, 0x59c97b, { emissive: 0x59c97b, ei: 2.2 });
    reg(proving, "proving-unit");

    // ------------------------------------------------------------- workbench
    const bench = counter(root, 1.9, 0.7, 2.5, -2.2, 0x6f767d, { height: 0.9, metal: 0.5, rough: 0.45, ry: -0.25 });
    // Digital multimeter with a live canvas display.
    const dmmRoot = group(bench, -0.45, 0.94, 0.02, 0.4);
    slab(dmmRoot, 0.15, 0.045, 0.24, 0, 0.02, 0, 0xf2ae14, { rough: 0.6, radius: 0.012 });
    const dmmScreen = decal(dmmRoot, 0.11, 0.06, 0, 0.046, -0.05,
      signFace("0.0 V", { bg: "#0d2b22", accent: "#59c97b", fg: "#8ef0c0", scale: 0.6 }), { glow: true, ei: 0.8 });
    dmmScreen.rotation.x = -Math.PI / 2;
    cyl(dmmRoot, 0.024, 0.024, 0.006, 0, 0.048, 0.05, 0x22262b, { rough: 0.5, seg: 14 });
    hose(dmmRoot, [[-0.04, 0.03, 0.1], [-0.2, 0.02, 0.22], [-0.34, 0.01, 0.1]], 0.006, 0x1b1e22, { steps: 14 });
    hose(dmmRoot, [[0.04, 0.03, 0.1], [0.22, 0.02, 0.24], [0.36, 0.01, 0.12]], 0.006, 0xb81410, { steps: 14 });
    decal(dmmRoot, 0.1, 0.03, 0, 0.024, 0.09, signFace("CAT III 600V", { bg: "#f2ae14", scale: 0.55 }));
    reg(dmmRoot, "meter-cat3");

    // A second, smaller meter beside it — a consumer-grade CAT II unit
    // somebody left in the same drawer. Nothing marks it as wrong from across
    // the room; the category rating is the only thing that does.
    const cheapMeter = group(bench, -0.72, 0.93, 0.14, -0.2);
    slab(cheapMeter, 0.1, 0.03, 0.16, 0, 0.015, 0, 0x2b2f33, { rough: 0.7, radius: 0.008 });
    decal(cheapMeter, 0.07, 0.03, 0, 0.031, -0.03,
      signFace("300V", { bg: "#1b1e22", accent: "#8a949d", fg: "#c7ccd1", scale: 0.6 }), { px: 96 });
    cyl(cheapMeter, 0.014, 0.014, 0.004, 0, 0.032, 0.03, 0x14171a, { rough: 0.6, seg: 10 });
    hose(cheapMeter, [[-0.02, 0.02, 0.06], [-0.1, 0.01, 0.12], [-0.16, 0.0, 0.06]], 0.004, 0x1b1e22, { steps: 10 });
    hose(cheapMeter, [[0.02, 0.02, 0.06], [0.1, 0.01, 0.12], [0.16, 0.0, 0.06]], 0.004, 0xb81410, { steps: 10 });
    reg(cheapMeter, "meter-cat2");

    // Damaged leads coiled at the far end — the trap.
    const damaged = group(bench, 0.62, 0.93, 0.06);
    torus(damaged, 0.09, 0.008, 0, 0.01, 0, 0x1b1e22, { rough: 0.8 });
    torus(damaged, 0.07, 0.008, 0.01, 0.022, 0.01, 0xb81410, { rough: 0.8 });
    box(damaged, 0.02, 0.012, 0.02, 0.06, 0.03, 0.05, COPPER, { rough: 0.3, metal: 0.9 });  // exposed conductor
    decal(damaged, 0.14, 0.05, 0, 0.06, -0.09, signFace("SPARE LEADS", { scale: 0.6 }));
    reg(damaged, "damaged-leads");

    // Grounding cluster: three clamps on braided cable, waiting on the bench.
    const grounds = group(bench, 0.12, 0.95, -0.06, 0.2);
    const clampPts = [[-0.18, 0, 0], [0, 0.02, 0.05], [0.18, 0, 0]];
    for (const [gx, gy, gz] of clampPts) {
      box(grounds, 0.05, 0.05, 0.03, gx, gy + 0.02, gz, 0x9aa1a8, { rough: 0.35, metal: 0.85 });
      cyl(grounds, 0.008, 0.008, 0.07, gx, gy + 0.06, gz, 0x9aa1a8, { rough: 0.35, metal: 0.85, seg: 8 });
    }
    hose(grounds, [[-0.18, 0.01, 0], [-0.06, -0.01, 0.12], [0.06, -0.01, 0.12], [0.18, 0.01, 0]], 0.011, 0x2f6f3f,
      { steps: 20, rough: 0.8 });
    decal(grounds, 0.2, 0.05, 0, 0.02, -0.14, signFace("TEMPORARY GROUNDS", { accent: "#59c97b", scale: 0.5 }));
    reg(grounds, "ground-cluster");

    // Continuity tester — proves each clamp is actually bonded, not just seated.
    const contTester = group(bench, 0.42, 0.94, -0.16, -0.15);
    slab(contTester, 0.1, 0.035, 0.15, 0, 0.018, 0, 0x2c3238, { rough: 0.55, radius: 0.01 });
    const contLamp = ball(contTester, 0.012, 0.03, 0.036, 0.04, 0x59c97b, { emissive: 0x59c97b, ei: 0.5 });
    decal(contTester, 0.07, 0.024, 0, 0.037, -0.02,
      signFace("CONTINUITY", { bg: "#0d2b22", accent: "#59c97b", fg: "#8ef0c0", scale: 0.55 }), { px: 96 });
    hose(contTester, [[-0.03, 0.02, 0.05], [-0.09, 0.0, 0.09], [-0.13, 0.0, 0.04]], 0.005, 0x1b1e22, { steps: 10 });
    reg(contTester, "continuity-tester");

    // Installed grounds — revealed on the final step.
    const installedGrounds = group(interior, 0, -0.55, 0.06);
    for (const p of phases) {
      box(installedGrounds, 0.05, 0.05, 0.04, p.x, 0.06, 0.02, 0x9aa1a8, { rough: 0.35, metal: 0.85 });
    }
    hose(installedGrounds, [[-0.3, 0.02, 0.03], [-0.15, -0.14, 0.1], [0.15, -0.14, 0.1], [0.3, 0.02, 0.03]],
      0.01, 0x2f6f3f, { steps: 18, rough: 0.8 });
    installedGrounds.visible = false;

    // ------------------------------------------------------ ambience & motion
    const tray = group(root, 0, 2.72, -1.0);
    for (let i = -3; i <= 3; i++) box(tray, 0.06, 0.05, 6.4, i * 0.14, 0, 0, 0x6a737b, { rough: 0.5, metal: 0.7, cast: false });
    for (const z of [-2.6, 0, 2.6]) box(tray, 1.0, 0.1, 0.05, 0, 0.08, z, 0x6a737b, { rough: 0.5, metal: 0.7, cast: false });
    for (const [cx, cz] of [[-1.1, -3.5], [1.1, -3.5]]) {
      hose(root, [[cx, 2.68, cz], [cx, 2.2, cz + 0.05], [cx * 1.02, 1.4, -3.9]], 0.035, 0x5b636b, { steps: 12, rough: 0.6 });
    }

    const sparks = particles(interior, 90, 0xffd08a, { size: 0.026, life: 0.35 });
    const arcLight = new THREE.PointLight(0xbfd8ff, 0, 6, 2);
    arcLight.position.set(0, 1.3, -3.2);
    root.add(arcLight);

    const keyLight = new THREE.DirectionalLight(0xdce8f5, 1.35);
    keyLight.position.set(2.5, 5.2, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -6; keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6; keyLight.shadow.camera.bottom = -6;
    root.add(keyLight);
    root.add(new THREE.HemisphereLight(0x9db2c6, 0x2b3037, 1.25));

    let energised = true;
    let arcTimer = 0;

    // The bay is 13.6m by 13.6m now. Push the workstations out to match, so
    // the extra floor is distance between jobs rather than empty ring.
    spreadLayout(root, 1.62);

    const W = 13.6, D = 13.6;
    // ------------------------------------------------- the rest of the bay
    // A switch room's own stores: spares on racking, a tool board, the
    // insulating mats and rescue hook that live on the wall by the door.
    shadowBoard(fixed, -W / 2 + 0.3, 1.4, Math.PI / 2, { label: "Insulated tools — 1000V rated, inspected", color: 0x2f4a63 });
    racking(fixed, W / 2 - 0.55, -3.4, -Math.PI / 2, { w: 2.8, h: 2.3, frame: 0x8a6a3a, stock: [0x4d6b7a, 0x6b7480, 0x8a7a5e] });
    sideBench(fixed, -3.2, 4.2, 0.25, { w: 2.4, top: 0x5f6b74 });
    noticeBoard(fixed, 2.2, D / 2 - 0.25, Math.PI, { w: 1.7 });
    spillStation(fixed, W / 2 - 1.3, 4.0, -0.9);
    wasteBin(fixed, -W / 2 + 1.3, 4.3, 0.7, { color: 0x2f5d3a, lid: 0x24462c, label: "Cable offcuts" });

    // A second sparks at the spares racking and a supervisor holding the
    // switching order — the person whose lock is the other one on the hasp.
    const crew = [
      bayCrew(root, 5.2, -1.2, -1.34, { task: "overhead", cloth: 0x2f4a63, hat: 0xf2f2f2, vis: 0xd8e33a }),
      bayCrew(root, 4.4, 4.4, -2.36, { task: "clipboard", cloth: 0x37505f, hat: 0xdd7a2f, vis: 0xd8e33a }),
    ];

    // Fittings on a grid sized to this floor, plus the bounce a real room
    // has and this one did not: see ceilingGrid in shared/kit.js.
    ceilingGrid(fixed, 13.6, 13.6, { color: 0xeaf2fb, ei: 1.3, lamp: 1.45, y: 3.84 });

    mergeStatic(fixed);

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -3.4),

      onStepComplete(step) {
        if (step.id === "open") {
          energised = false;
          handlePivot.rotation.z = -Math.PI / 2.2;
          stateLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.4, rough: 0.3 });
          for (const p of phases) phaseMeshes[p.id].bar.material = mat(0x7a6a52, { rough: 0.5, metal: 0.7 });
        }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "ground") installedGrounds.visible = true;
      },

      // An interruption the learner can see: the lock is simply gone off the
      // hasp. Look up from the meter and the hasp is bare, which is the whole
      // thing this is teaching you to notice. The other one is a person
      // visibly closing distance on the disconnect.
      onInterrupt(it) {
        if (it.id === "lock-missing") appliedLock.visible = false;
        if (it.id === "reclose-attempt") { crew[1].position.set(1.6, 0, -3.6); crew[1].userData.home = 2.4; }
      },
      onInterruptEnd(it) {
        if (it.id === "lock-missing" && it.resolved === "answered") appliedLock.visible = true;
        if (it.id === "reclose-attempt" && it.resolved === "answered") {
          crew[1].position.set(4.4, 0, 4.4); crew[1].userData.home = -2.36;
        }
      },

      onHazard(hitId) {
        if (hitId === "live-bus" && energised) arcTimer = 0.55;
      },

      animate(t, dt, session) {

        breatheCrew(crew, t);
        // Energised bus hums with a faint emissive pulse until it is opened.
        const pulse = energised ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
        stateLamp.material.emissiveIntensity = energised ? 1.6 + pulse * 1.4 : 2.2;
        provingLamp.material.emissiveIntensity = 1.6 + 0.8 * Math.sin(t * 2.4);

        if (arcTimer > 0) {
          arcTimer -= dt;
          sparks.visible = true;
          sparks.userData.step(dt, new THREE.Vector3(0, 0.1, 0.05), 0.35, 2.6, -4.2);
          arcLight.intensity = arcTimer > 0 ? 14 * Math.random() : 0;
        } else if (sparks.visible) {
          sparks.visible = false;
          arcLight.intensity = 0;
        }

        // Meter display follows the live gauge so the instrument reads the run.
        const g = session?.gauge;
        if (g && !g.committed) {
          const v = Math.round(g.t * 720);
          repaint(dmmScreen, signFace(`${v} V`, {
            bg: "#0d2b22", accent: v > 330 && v < 460 ? "#59c97b" : "#f2ae14", fg: "#8ef0c0", scale: 0.6,
          }));
        }

        // Continuity tester lamp climbs steadily while it is held on the
        // clamp, so the learner watches the bond being proven rather than
        // just waiting out a timer.
        if (session?.step?.id === "bond-check" && session.holding) {
          const p = Math.min(1, session.holdFor / (session.step.seconds ?? 4));
          contLamp.material.emissiveIntensity = 0.5 + p * 2.2;
        } else {
          contLamp.material.emissiveIntensity = 0.5;
        }
      },
    };
  },
};
