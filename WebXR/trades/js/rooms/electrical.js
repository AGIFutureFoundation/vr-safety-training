import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingPanel, counter, cabinet, particles, markInteractive, mat, HUD,
} from "../../../shared/kit.js";

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
  parSeconds: 165,
  spawn: { x: 0, z: 3.0, ry: 0 },
  badge: { id: "zero-energy", name: "Zero Energy Verified", note: "Perfect live-dead-live on the first run" },

  hazards: {
    "live-bus": "You reached into an energised enclosure. Exposed bus at 480 V will not warn you first — nothing enters that cabinet until the disconnect is open, locked, and proven dead.",
    "foreign-lock": "That padlock belongs to another worker. You never remove someone else's lock or tag: their life is on the other end of it. Each worker applies and removes their own.",
    "damaged-leads": "Those test leads have cracked insulation at the strain relief. Damaged leads put your hand at line potential — bin them and draw a rated set.",
  },

  lateNotes: {
    "test-l1": "Nothing gets touched inside that enclosure until the disconnect is open and your lock is on it.",
    "test-l2": "Nothing gets touched inside that enclosure until the disconnect is open and your lock is on it.",
    "test-l3": "Nothing gets touched inside that enclosure until the disconnect is open and your lock is on it.",
    "ground-cluster": "Grounds go on after the circuit is proven dead, not before — applying them to a live conductor is a bolted fault.",
  },

  steps: [
    {
      id: "ppe", kind: "select", target: "ppe-cart",
      title: "Don arc-rated PPE",
      cue: "Take arc-rated PPE from the cart before you approach the panel.",
      why: "Shock and arc-flash protection go on before you enter the approach boundary, not once the door is open.",
    },
    {
      id: "schedule", kind: "select", target: "panel-schedule",
      title: "Identify the circuit",
      cue: "Read the panel schedule and confirm which circuit you are isolating.",
      why: "The schedule tells you what the breaker feeds — and what else goes dark when you open it.",
    },
    {
      id: "notify", kind: "select", target: "notice-board",
      title: "Notify affected workers",
      cue: "Post the work notice so everyone downstream knows the feeder is coming out.",
      why: "Affected employees must be told before and after isolation. An unannounced outage is how someone re-energises your circuit.",
    },
    {
      id: "open", kind: "select", target: "disconnect-handle",
      title: "Open the disconnect",
      cue: "Rotate the disconnect handle to OFF.",
      why: "Opening the disconnect is the isolation itself. Everything after this verifies and protects it.",
    },
    {
      id: "lock", kind: "select", target: "lock-station",
      title: "Apply your lock and tag",
      cue: "Take your personal padlock and tag from the station and apply them to the hasp.",
      why: "Your lock, your key, your control. The tag names who applied it and why, so nobody guesses.",
    },
    {
      id: "prove-live", kind: "gauge", target: "proving-unit",
      title: "Prove the meter — live",
      cue: "Test the meter on the known-live proving unit. Commit inside the nominal band.",
      why: "A meter that reads zero because it is broken looks exactly like a dead circuit. Prove it works first.",
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
      why: "Absence of voltage means every conductor you could contact, not the one you expect to be dead.",
      outOfOrderNote: "Test each conductor once; you still have phases left to verify.",
    },
    {
      id: "prove-again", kind: "gauge", target: "proving-unit",
      title: "Re-prove the meter — live",
      cue: "Return to the proving unit and confirm the meter still reads correctly.",
      why: "The meter can fail between the dead test and now. Live-dead-live is one instrument check, not two halves.",
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
      why: "Grounds hold the conductors at earth potential if the circuit is ever back-fed while you are inside it.",
    },
  ],

  build(root) {
    const hits = {};
    const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };

    shell(root, {
      w: 8.4, d: 8.4, h: 3.1,
      floor: 0x4a5057, wall: 0x6d7681, ceiling: 0x2a3037,
      floorRough: 0.9, skirtColor: 0x2b3138,
    });

    // Floor: arc-flash approach boundary painted in front of the panel bank.
    for (let i = -4; i <= 4; i++) {
      box(root, 0.26, 0.006, 0.1, i * 0.44, 0.004, -1.5, HAZARD, { cast: false, rough: 0.7 });
    }
    decal(root, 1.5, 0.34, 0, 0.006, -1.05, signFace("ARC FLASH BOUNDARY", { bg: "#4a5057", accent: "#f2ae14", scale: 0.5 }))
      .rotation.x = -Math.PI / 2;

    for (const x of [-2.4, 0, 2.4]) ceilingPanel(root, x, -1.4, { w: 1.5, ei: 1.2 });
    ceilingPanel(root, 0, 1.8, { w: 1.5, ei: 0.9 });

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

      onHazard(hitId) {
        if (hitId === "live-bus" && energised) arcTimer = 0.55;
      },

      animate(t, dt, session) {
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
      },
    };
  },
};
