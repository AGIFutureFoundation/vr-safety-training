import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, barrierPanel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Robot Cell VR — its own gamified system: Cell Lockout.
// Industrial robot cell isolation. A robot that looks stopped can be waiting on
// a signal, not powered down — the arm has no idea a person just walked in.

export const SIM_ROBOT_CELL = {
  id: "robot-cell",
  index: "09",
  domain: "Manufacturing",
  trade: "Automation / robotics technician",
  name: "Robot Cell",
  title: simTitle("Robot Cell"),
  tagline: "Six-axis robot cell lockout, light-curtain integrity and teach-pendant safety",
  accent: 0xa079ff,
  accentCss: "#a079ff",
  parSeconds: 210,
  badge: { id: "cell-locked", name: "Cell Locked", note: "Full lockout with the light curtain never defeated" },

  game: system({
    name: "Cell Lockout",
    currency: "CELL",
    ranks: ["Cell Trainee", "Cell Technician", "Automation Lead", "Cell Auditor", "Cell Certified"],
    badges: [
      { id: "curtain-intact", name: "Curtain Intact", note: "Never bypass the light curtain", test: AWARD.safe },
      { id: "teach-safe", name: "Teach Safe", note: "Every teach-mode move inside the reduced-speed band", test: AWARD.precise(0.72) },
      { id: "energy-zero", name: "Energy Zero", note: "Verify zero energy before the guard opens", test: AWARD.stepClean("verify-zero") },
    ],
    challenges: [
      { id: "line-down", name: "Line Down Window", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-pass", name: "First Pass", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "cell-streak", name: "Cell Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "curtain-bypass": "That jumper defeats the light curtain. The curtain is the only thing that stops the arm the instant a body crosses the plane — bypassing it to 'just check something quickly' is exactly how reach-in injuries happen.",
    "arm-envelope": "You stepped inside the robot's reach envelope with the controller still in automatic. The arm does not know you are there and it does not slow down for you.",
    "pinch-point": "That is the gripper's closing pinch point. Even in manual jog mode a six-axis end effector closes with enough force to crush a hand.",
    "residual-air": "That pneumatic line is still charged. Electrical lockout does not bleed stored air — a charged actuator can still fire the gripper with the power off.",
  },

  lateNotes: {
    "gripper": "The gripper is only touched after the arm is proven at zero energy, air included.",
    "teach-pendant": "The pendant does not come off the hook until the cell is confirmed safe to jog.",
  },

  steps: [
    {
      id: "workorder", kind: "select", target: "work-order",
      title: "Read the maintenance work order",
      cue: "Confirm the cell, the task and the isolation points listed.",
      why: "Cells share safety zones on some lines. The work order tells you which arm is yours and which isolation actually covers it.",
    },
    {
      id: "estop", kind: "select", target: "estop-button",
      title: "Hit the cell emergency stop",
      cue: "Press the e-stop at the cell HMI before opening anything.",
      why: "E-stop takes the program out of automatic immediately. It is the first move, and it buys you the moment you need to isolate properly.",
    },
    {
      id: "isolate", kind: "turn", target: "disconnect-switch",
      title: "Open the main disconnect",
      cue: "Grab the cell's main power disconnect and rotate it to off.",
      why: "The e-stop is a control-level stop; the disconnect is the isolation. A cell that only e-stopped can still be reset from the HMI by someone who does not know you are inside.",
      turn: { turns: 0.2, axis: "z", reverse: true, label: "CELL MAIN DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lockout-hasp",
      title: "Lock the disconnect",
      cue: "Apply your padlock to the disconnect hasp.",
      why: "Your lock says the isolation belongs to you specifically. Nobody re-energises a cell with your lock still on it.",
    },
    {
      id: "bleed", kind: "select", target: "air-bleed",
      title: "Bleed the pneumatic system",
      cue: "Vent the air receiver and confirm the gauge reads zero.",
      why: "Stored compressed air moves an actuator with the electrics dead. Zero energy means every energy source, not just the one with a switch.",
    },
    {
      id: "verify-zero", kind: "gauge", target: "energy-meter",
      title: "Verify zero energy at the controller",
      cue: "Meter the controller's drive input and commit when it reads dead.",
      why: "The disconnect being open is not proof by itself — a fault or a miswired feed can leave a path live. You confirm it the same way for every isolation.",
      gauge: {
        label: "DRIVE INPUT — VOLTAGE", speed: 0.65, green: [0.0, 0.1],
        readout: (t) => `${Math.round(t * 480)} V`,
        missNote: "Still reading live. Recheck the disconnect and the isolation point before the guard comes open.",
      },
    },
    {
      id: "guard", kind: "select", target: "cell-gate",
      title: "Open the cell gate",
      cue: "Open the interlocked gate now that the cell is proven dead.",
      why: "The gate interlock exists to stop this exact step happening before isolation. With power confirmed off, it is finally the right moment.",
    },
    {
      id: "service", kind: "select", target: "gripper",
      title: "Service the end effector",
      cue: "Clear the jammed part from the gripper.",
      why: "With the arm at zero energy and the air bled, the gripper is finally just a mechanism, not a hazard.",
    },
    {
      id: "restore", kind: "select", target: "disconnect-switch",
      title: "Restore power and unlock",
      cue: "Remove your lock and close the disconnect once you are clear of the envelope.",
      why: "Your lock, your call — nobody removes it but you, and you confirm you are the last one out before it comes off.",
    },
    {
      id: "teach", kind: "gauge", target: "teach-pendant",
      title: "Jog the arm in teach mode",
      cue: "Jog the arm and keep speed inside the reduced-speed limit.",
      why: "Teach mode is deliberately capped well below production speed, because a person is physically present at the pendant with a dead-man switch, not behind a guard.",
      gauge: {
        label: "TEACH MODE — JOG SPEED", speed: 0.75, green: [0.0, 0.3],
        readout: (t) => `${Math.round(t * 100)}% speed`,
        missNote: "Over the teach-mode speed cap. That limit is what keeps a reflex reaction fast enough to matter.",
      },
    },
    {
      id: "close", kind: "select", target: "cell-gate",
      title: "Close and verify the guard",
      cue: "Close the gate and confirm the interlock re-engages.",
      why: "A gate that looks closed but has not re-engaged the interlock will run the cell in automatic with the guard effectively open.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.0, 0xa079ff);

    // ------------------------------------------------------------ cell fence
    const fenceR = 1.7;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      if (i === 0) continue; // gap for the gate
      const panel = group(g, Math.sin(a) * fenceR, 0, Math.cos(a) * fenceR, a);
      box(panel, 0.9, 1.5, 0.03, 0, 0.75, 0, 0x3a424a, { rough: 0.6, metal: 0.5, cast: false });
      for (let r = 0; r < 3; r++) box(panel, 0.86, 0.02, 0.02, 0, 0.3 + r * 0.5, 0.01, 0x2b3138, { rough: 0.6, cast: false });
    }
    // Light curtain across the gate opening.
    const gateGroup = group(g, 0, 0, fenceR);
    const curtainA = cyl(gateGroup, 0.03, 0.03, 1.5, -0.5, 0.75, 0, 0xa079ff, { rough: 0.4, metal: 0.6, seg: 10 });
    const curtainB = cyl(gateGroup, 0.03, 0.03, 1.5, 0.5, 0.75, 0, 0xa079ff, { rough: 0.4, metal: 0.6, seg: 10 });
    const beams = [];
    for (let i = 0; i < 6; i++) {
      const beam = box(gateGroup, 1.0, 0.006, 0.006, 0, 0.2 + i * 0.22, 0, 0xa079ff,
        { emissive: 0xa079ff, ei: 1.8, rough: 0.4, cast: false });
      beams.push(beam);
    }
    holoTag(gateGroup, "Light curtain", 0, 1.65, 0, { css: "#a079ff", w: 0.32 });
    // The gate itself, hinged.
    const gate = group(gateGroup, 0, 0, 0);
    box(gate, 0.9, 1.4, 0.03, -0.45, 0.7, 0, 0x545e67, { rough: 0.5, metal: 0.5 });
    reg(hits, gate, "cell-gate");

    // Bypass jumper hanging off the curtain box — the trap.
    const bypass = group(gateGroup, 0.55, 1.4, 0.05);
    hose(bypass, [[0, 0, 0], [0.04, -0.08, 0.02], [0, -0.15, 0]], 0.006, 0xf0645b, { steps: 10 });
    holoTag(bypass, "Bypass jumper", 0, 0.05, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, bypass, "curtain-bypass");

    // ------------------------------------------------------------- the robot
    const robot = group(g, 0, 0, -0.3);
    cyl(robot, 0.32, 0.36, 0.16, 0, 0.08, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 20 });
    const base = group(robot, 0, 0.16, 0);
    cyl(base, 0.24, 0.26, 0.3, 0, 0.15, 0, 0xa079ff, { rough: 0.35, metal: 0.4, seg: 20 });
    const shoulder = group(base, 0, 0.32, 0);
    const link1 = box(shoulder, 0.16, 0.5, 0.16, 0, 0.25, 0, 0xdfe4e8, { radius: 0.06, rough: 0.3, metal: 0.3 });
    const elbow = group(shoulder, 0, 0.5, 0);
    elbow.rotation.x = -0.6;
    const link2 = box(elbow, 0.13, 0.45, 0.13, 0, 0.22, 0, 0xa079ff, { rough: 0.35, metal: 0.4 });
    const wrist = group(elbow, 0, 0.45, 0);
    wrist.rotation.x = 0.9;
    const link3 = box(wrist, 0.1, 0.3, 0.1, 0, 0.15, 0, 0xdfe4e8, { rough: 0.3, metal: 0.3 });
    const gripperGroup = group(wrist, 0, 0.3, 0);
    box(gripperGroup, 0.14, 0.08, 0.08, 0, 0.04, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    for (const s of [-1, 1]) {
      const jaw = box(gripperGroup, 0.03, 0.1, 0.03, s * 0.05, 0.11, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
      if (s === 1) reg(hits, jaw, "pinch-point");
    }
    reg(hits, gripperGroup, "gripper");
    holoTag(robot, "Cell 7 · KR-90", 0, 1.6, 0.2, { css: "#a079ff", w: 0.36 });

    // Reach envelope marked on the floor.
    torus(g, 1.1, 0.02, 0, 0.015, -0.3, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 0.6, rough: 0.4, cast: false, seg: 6, seg2: 48 });
    reg(hits, cyl(g, 1.1, 1.1, 0.02, 0, 0.02, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false, seg: 24 }),
      "arm-envelope");

    // ----------------------------------------------------------- power side
    const cab = group(g, -1.5, 0, -1.0, 0.6);
    box(cab, 0.6, 1.5, 0.4, 0, 0.75, 0, 0x545e67, { rough: 0.5, metal: 0.5 });
    const discHandle = group(cab, 0.2, 1.1, 0.21);
    box(discHandle, 0.04, 0.16, 0.04, 0, 0.06, 0, 0xf0645b, { rough: 0.5 });
    reg(hits, discHandle, "disconnect-switch");
    const hasp = torus(cab, 0.02, 0.006, -0.12, 0.9, 0.21, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, hasp, "lockout-hasp");
    const appliedLock = lockTag(cab, -0.12, 0.9, 0.23);
    appliedLock.visible = false;

    const estop = group(g, 1.3, 0, -1.15, -0.4);
    cyl(estop, 0.04, 0.045, 0.9, 0, 0.45, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    box(estop, 0.22, 0.2, 0.1, 0, 0.95, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const estopButton = cyl(estop, 0.07, 0.07, 0.06, 0, 0.95, 0.08, 0xd8232a, { rough: 0.5, seg: 18 });
    estopButton.rotation.x = Math.PI / 2;
    const hmiScreen = decal(estop, 0.16, 0.09, 0, 1.12, 0.06,
      signFace("AUTO", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(estop, "Cell HMI", 0, 1.3, 0.05, { css: "#a079ff", w: 0.26 });
    reg(hits, estopButton, "estop-button");

    // Pneumatic bleed valve and gauge.
    const air = group(g, -1.6, 0, 0.6, 0.4);
    cyl(air, 0.14, 0.14, 0.5, 0, 0.35, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 16 });
    const airGauge = decal(air, 0.12, 0.08, 0.16, 0.55, 0, signFace("6.2 bar", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.5 }), { px: 192, glow: true, ei: 0.7 });
    const bleedValve = cyl(air, 0.03, 0.035, 0.1, -0.16, 0.6, 0, 0xd8232a, { rough: 0.5, seg: 12 });
    bleedValve.rotation.z = Math.PI / 2;
    const bleedHiss = particles(air, 30, 0xdfeaf2, { size: 0.02, life: 0.4, additive: false, opacity: 0.4 });
    holoTag(air, "Air receiver", 0, 0.72, 0, { css: "#a079ff", w: 0.3 });
    reg(hits, bleedValve, "air-bleed");
    reg(hits, hose(g, [[-1.6, 0.6, 0.6], [-1.0, 0.4, 0.1], [0, 0.2, -0.15]], 0.02, 0x6f767d, { steps: 16, rough: 0.5, metal: 0.6 }),
      "residual-air");

    // Teach pendant on its hook.
    const pendant = group(cab, -0.2, 0.5, 0.22, 0.3);
    slab(pendant, 0.14, 0.24, 0.03, 0, 0, 0, 0xf2c14b, { radius: 0.02, rough: 0.55 });
    const pendantScreen = decal(pendant, 0.1, 0.09, 0, 0.06, 0.017,
      signFace("TEACH", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.55 }), { glow: true, ei: 0.85, px: 192 });
    holoTag(pendant, "Teach pendant", 0, 0.16, 0, { css: "#a079ff", w: 0.3 });
    reg(hits, pendant, "teach-pendant");

    // Meter, work order, on the tool chest.
    const chest = toolChest(g, 1.7, 0.9, { ry: -0.6, color: 0xa079ff });
    const meter = instrument(chest, -0.08, 0.79, 0, { ry: 0.3, idle: "-- V", color: 0xa079ff });
    holoTag(meter, "CAT III meter", 0, 0.16, 0, { css: "#a079ff", w: 0.28 });
    reg(hits, meter, "energy-meter");

    const workOrder = holoPanel(g, 0.56, 0.4, -1.9, 1.5, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,8,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a079ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#a99ecb";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER WO-8834", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f0ecff";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CELL 7 — GRIPPER JAM", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#bdb2dd";
      ["Isolation: main disconnect DS-7", "Pneumatic: bleed to 0 bar",
       "Teach speed limit: 30%", "Guard: light curtain LC-7",
       "Line down window: 25 min"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0xa079ff });
    reg(hits, workOrder, "work-order");

    let cellPowered = true;
    let curtainActive = true;
    let armMoving = true;
    let bleeding = false;

    return {
      hits,
      footprint: 2.0,

      onStepComplete(step) {
        if (step.id === "estop") { armMoving = false; repaint(hmiScreen, signFace("E-STOP", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.5 })); }
        // discHandle is turned live by the player's drag while this step is active.
        if (step.id === "isolate") cellPowered = false;
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "bleed") { bleeding = true; }
        if (step.id === "verify-zero") repaint(hmiScreen, signFace("DE-ENERGISED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.36 }));
        if (step.id === "guard") { gate.rotation.y = 1.4; curtainActive = false; }
        if (step.id === "restore") {
          appliedLock.visible = false; discHandle.rotation.z = 0; cellPowered = true;
          repaint(hmiScreen, signFace("READY", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.45 }));
        }
        if (step.id === "close") { gate.rotation.y = 0; curtainActive = true; }
      },

      onHazard(hitId) {
        if (hitId === "arm-envelope" && armMoving) { /* the arm keeps moving to make the point */ }
      },

      animate(t, dt, session) {
        if (armMoving) {
          shoulder.rotation.y = Math.sin(t * 0.6) * 0.4;
          elbow.rotation.x = -0.6 + Math.sin(t * 0.8) * 0.3;
          wrist.rotation.z = Math.sin(t * 1.1) * 0.4;
        }
        beams.forEach((b, i) => { b.material.emissiveIntensity = curtainActive ? 1.6 + Math.sin(t * 3 + i) * 0.6 : 0.1; });
        if (bleeding) {
          bleedHiss.visible = true;
          bleedHiss.userData.step(dt, new THREE.Vector3(-1.72, 0.6, 0.6), 0.03, 0.3, 0.1);
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "verify-zero") {
            const v = Math.round(gg.t * 480);
            repaint(meter.userData.screen, signFace(`${v} V`, {
              bg: "#0d1c24", accent: v < 48 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
            }));
          }
          if (session.step?.id === "teach") {
            repaint(pendantScreen, signFace(`${Math.round(gg.t * 100)}%`, {
              bg: "#2a1a0d", accent: gg.t < 0.3 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
