import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel, pipeRun,
  cylinderTank, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Chiller Plant VR — its own gamified system: Cold Chain Command.
// District cooling plant refrigerant work. Confined mechanical space, pressurised
// refrigerant, and an asphyxiation risk that gives no warning before it drops you.

export const SIM_CHILLER_PLANT = {
  id: "chiller-plant",
  index: "10",
  domain: "Building Systems",
  trade: "HVAC / refrigeration technician",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "UA — EPA Section 608 Universal refrigerant certified",
  name: "Chiller Plant",
  title: simTitle("Chiller Plant"),
  tagline: "District chiller isolation, refrigerant recovery and confined mechanical space entry",
  accent: 0x4fd1ff,
  accentCss: "#4fd1ff",
  parSeconds: 220,
  badge: { id: "cold-chain-clear", name: "Cold Chain Clear", note: "Full isolation and recovery with atmosphere proven safe" },

  game: system({
    name: "Cold Chain Command",
    currency: "COLD",
    ranks: ["Plant Trainee", "Chiller Technician", "Refrigerant Certified", "Plant Lead", "Cold Chain Command"],
    badges: [
      { id: "atmosphere-clear", name: "Atmosphere Clear", note: "Prove oxygen level before entry every time", test: AWARD.stepClean("atmosphere") },
      { id: "zero-leak", name: "Zero Leak", note: "Recover refrigerant with no venting to atmosphere", test: AWARD.safe },
      { id: "pressure-true", name: "Pressure True", note: "Hold every reading near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "shutdown-window", name: "Shutdown Window", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-cycle", name: "Clean Cycle", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "plant-streak", name: "Plant Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "vent-to-air": "You are venting refrigerant straight to atmosphere. It is both a regulatory violation and a physical hazard — refrigerant is heavier than air and pools in the low points of exactly the plant room you are standing in.",
    "low-oxygen-room": "You walked past the oxygen monitor already in alarm. A large refrigerant leak displaces breathable air with no smell and no colour — the monitor is the only warning you get.",
    "pressurized-fitting": "You are about to crack that fitting under full system pressure. High-side refrigerant pressure through a sudden gap is a liquid and gas jet that causes frostbite burns and can eject the fitting itself.",
    "hot-compressor": "That compressor housing is at operating temperature and you have no gloves on. Contact burns from compressor casings are common and completely preventable.",
  },

  lateNotes: {
    "gauge-manifold": "The manifold goes on after lockout, not as a way to check whether lockout is needed.",
  },

  steps: [
    {
      id: "workorder", kind: "select", target: "work-order",
      title: "Read the work order",
      cue: "Confirm the chiller, the refrigerant type and the scope of work.",
      why: "Different refrigerants have different recovery procedures and pressure ranges. Working from memory on the wrong type is how recovery cylinders get over-pressurised.",
    },
    {
      id: "atmosphere", kind: "gauge", target: "oxygen-monitor",
      title: "Check the plant room atmosphere",
      cue: "Read the fixed oxygen monitor and commit only if it is in the safe range.",
      why: "This is checked before you do anything else in the room, every single time you enter — not just when something smells wrong, because a refrigerant leak does not smell like anything.",
      gauge: {
        label: "PLANT ROOM OXYGEN", speed: 0.6, green: [0.46, 0.6],
        readout: (t) => `${(15 + t * 12).toFixed(1)} % O₂`,
        missNote: "Below the safe threshold. Ventilate and leave the room until the monitor clears — this is not a judgment call.",
      },
    },
    {
      id: "estop", kind: "select", target: "chiller-hmi",
      title: "Shut down the chiller from the HMI",
      cue: "Stop the chiller and confirm the compressor has come to a stand.",
      why: "A controlled shutdown lets refrigerant equalise and the compressor spin down safely, instead of isolating a running machine under load.",
    },
    {
      id: "isolate", kind: "turn", target: "disconnect",
      title: "Isolate electrical power",
      cue: "Grab the chiller's main disconnect handle and pull it open.",
      why: "A stopped compressor can restart on a call for cooling if the electrics are still live. Isolation is what makes 'stopped' permanent for the duration of your work.",
      turn: { turns: 0.2, axis: "z", reverse: true, label: "MAIN DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lockout-point",
      title: "Lock the disconnect",
      cue: "Apply your lock and tag to the disconnect.",
      why: "Your lock, your control. A chiller that gets re-energised by a building management system override is still your problem if your hands are inside it.",
    },
    {
      id: "close-valves", kind: "sequence",
      targets: ["valve-liquid", "valve-suction"],
      itemNames: { "valve-liquid": "liquid line service valve", "valve-suction": "suction line service valve" },
      title: "Close the service valves",
      cue: "Close liquid line first, then suction line.",
      why: "Closing liquid first traps the charge on the high side where the recovery machine can pull it efficiently, rather than pushing it all to one side at once.",
      outOfOrderNote: "Wrong order — liquid line closes before suction, so the charge is where recovery expects it.",
    },
    {
      id: "manifold", kind: "select", target: "gauge-manifold",
      title: "Connect the gauge manifold",
      cue: "Attach the manifold hoses to the service ports.",
      why: "The manifold is how you actually see high-side and low-side pressure through the recovery, instead of guessing when it is done.",
    },
    {
      id: "recover", kind: "gauge", target: "recovery-machine",
      title: "Recover the refrigerant",
      cue: "Run the recovery machine and commit once the system reaches vacuum.",
      why: "Recovery to the certified vacuum level is what the regulations require and what actually gets the charge safely into the cylinder instead of into the room.",
      gauge: {
        label: "SYSTEM PRESSURE DURING RECOVERY", speed: 0.55, green: [0.0, 0.12],
        readout: (t) => `${(t * 30 - 5).toFixed(1)} psig`,
        missNote: "Not at recovery vacuum yet. Keep the machine running — stopping early leaves refrigerant in the circuit.",
      },
    },
    {
      id: "weigh", kind: "select", target: "recovery-cylinder",
      title: "Verify the recovery cylinder",
      cue: "Check the cylinder's fill weight against its rated capacity.",
      why: "A recovery cylinder filled past its rated capacity has no vapour space left to absorb pressure change — it becomes a hydraulic hazard as ambient temperature rises.",
    },
    {
      id: "repair", kind: "select", target: "compressor",
      title: "Complete the compressor repair",
      cue: "Replace the failed compressor valve plate.",
      why: "With the circuit fully recovered and pressure at vacuum, the compressor can finally be opened without refrigerant or oil discharge.",
    },
    {
      id: "restore", kind: "select", target: "chiller-hmi",
      title: "Evacuate, recharge and restart",
      cue: "Pull a deep vacuum, recharge to nameplate and restart the chiller.",
      why: "A system with damp air pulled in during the repair will not perform and will corrode from the inside — the vacuum step is not optional even when you are in a hurry.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0x4fd1ff);

    // ------------------------------------------------------------ plant room
    box(g, 4.6, 0.14, 4.6, 0, 0.07, 0, 0x545c63, { rough: 0.9 });
    for (let i = -3; i <= 3; i++) box(g, 4.6, 0.004, 0.014, 0, 0.145, i * 0.7, 0x424951, { cast: false, receive: false });

    // Chiller unit.
    const chiller = group(g, -0.4, 0, -1.0, 0.2);
    slab(chiller, 2.0, 1.1, 0.7, 0, 0.62, 0, 0x8b929a, { radius: 0.05, rough: 0.4, metal: 0.55 });
    box(chiller, 2.06, 0.06, 0.76, 0, 1.2, 0, 0x6b747c, { rough: 0.45, metal: 0.5 });
    const hmi = decal(chiller, 0.4, 0.28, -0.7, 1.0, 0.36,
      signFace("RUNNING\n42°F CHW", { bg: "#0d1c24", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.26 }),
      { glow: true, ei: 0.9, px: 384 });
    reg(hits, hmi, "chiller-hmi");
    holoTag(chiller, "Chiller 2 · 400 ton", 0, 1.35, 0.36, { css: "#4fd1ff", w: 0.4 });

    // Compressor housing.
    const compressor = group(chiller, 0.4, 0.5, 0.0);
    cyl(compressor, 0.28, 0.3, 0.5, 0, 0, 0, 0x3a424a, { rough: 0.55, metal: 0.45, seg: 20 });
    compressor.rotation.z = Math.PI / 2;
    const compHeat = particles(compressor, 30, 0xff9a3c, { size: 0.03, life: 0.9, additive: false, opacity: 0.2 });
    reg(hits, compressor, "hot-compressor");
    const valvePlate = group(compressor, 0, 0, 0.28);
    box(valvePlate, 0.12, 0.12, 0.02, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    holoTag(valvePlate, "Valve plate", 0, 0.14, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, valvePlate, "compressor");

    // Service valves and ports.
    const liquidValve = valveWheel(chiller, -0.65, 0.4, 0.36, { r: 0.06, color: 0xf2c14b, body: 0x2f6f4a });
    reg(hits, liquidValve, "valve-liquid");
    const suctionValve = valveWheel(chiller, -0.4, 0.4, 0.36, { r: 0.06, color: 0x4fd1ff, body: 0x2f6f4a });
    reg(hits, suctionValve, "valve-suction");
    decal(chiller, 0.4, 0.06, -0.55, 0.55, 0.4, signFace("LIQUID", { scale: 0.5 }));
    decal(chiller, 0.4, 0.06, -0.28, 0.55, 0.4, signFace("SUCTION", { scale: 0.5 }));

    // Pressurised fitting — the trap.
    const fitting = group(chiller, 0.15, 0.75, 0.37);
    cyl(fitting, 0.02, 0.02, 0.05, 0, 0, 0, 0xb87333, { rough: 0.3, metal: 0.9, seg: 12 });
    holoTag(fitting, "High side — 280 psi", 0, 0.14, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, fitting, "pressurized-fitting");

    // Vent point where a shortcut would show up.
    const ventPoint = group(chiller, 0.7, 0.9, 0.37);
    cyl(ventPoint, 0.015, 0.015, 0.06, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 10 });
    const ventGas = particles(ventPoint, 30, 0xdfeaf2, { size: 0.03, life: 0.7, additive: false, opacity: 0.25 });
    reg(hits, ventPoint, "vent-to-air");

    // Disconnect and lock.
    const cab = group(g, -2.0, 0, -0.4, 0.6);
    box(cab, 0.5, 1.1, 0.32, 0, 0.55, 0, 0x545e67, { rough: 0.5, metal: 0.5 });
    const discHandle = group(cab, 0.16, 0.8, 0.17);
    box(discHandle, 0.035, 0.14, 0.035, 0, 0.055, 0, 0xf0645b, { rough: 0.5 });
    reg(hits, discHandle, "disconnect");
    const hasp = torus(cab, 0.02, 0.006, -0.1, 0.6, 0.17, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, hasp, "lockout-point");
    const appliedLock = lockTag(cab, -0.1, 0.6, 0.19);
    appliedLock.visible = false;

    // Fixed oxygen monitor on the wall.
    const monitor = group(g, 1.9, 0, -1.5, -0.6);
    box(monitor, 0.24, 0.16, 0.05, 0, 1.5, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const monitorFace = decal(monitor, 0.19, 0.09, 0, 1.52, 0.028,
      signFace("20.9%", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }), { glow: true, ei: 0.9, px: 256 });
    const monitorLamp = ball(monitor, 0.012, 0.09, 1.57, 0.03, CITY.good, { emissive: CITY.good, ei: 2 });
    holoTag(monitor, "Fixed O₂ monitor", 0, 1.68, 0.02, { css: "#4fd1ff", w: 0.32 });
    reg(hits, monitorFace, "oxygen-monitor");
    reg(hits, monitor, "low-oxygen-room");

    // Recovery machine, manifold, cylinder.
    const chest = toolChest(g, 1.6, 1.2, { ry: -0.6, color: 0x2b6f8c });
    const recovery = group(chest, -0.15, 0.79, 0, 0.4);
    slab(recovery, 0.24, 0.16, 0.16, 0, 0, 0, 0x22272c, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const recoveryScreen = decal(recovery, 0.19, 0.09, 0, 0.09, 0.081,
      signFace("STANDBY", { bg: "#0d1c24", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.44 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(recovery, "Recovery machine", 0, 0.18, 0, { css: "#4fd1ff", w: 0.34 });
    reg(hits, recovery, "recovery-machine");

    const manifold = group(chest, 0.14, 0.79, 0.02, -0.4);
    box(manifold, 0.13, 0.1, 0.03, 0, 0.05, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    ball(manifold, 0.02, -0.03, 0.1, 0.016, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.3 });
    ball(manifold, 0.02, 0.03, 0.1, 0.016, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 0.3 });
    holoTag(manifold, "Gauge manifold", 0, 0.2, 0, { css: "#4fd1ff", w: 0.3 });
    reg(hits, manifold, "gauge-manifold");
    reg(hits, hose(g, [[1.5, 0.95, 1.0], [1.0, 0.7, 0.4], [-0.6, 0.6, 0.3]], 0.015, 0xdfe4e8, { steps: 20, rough: 0.5 }),
      "recovery-hose");

    const cylinder = cylinderTank(g, 1.8, 1.3, 0xf2c14b, {});
    const cylScale = decal(cylinder, 0.14, 0.06, 0.13, 0.4, 0,
      signFace("42 / 50 lb", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.4 }), { px: 192, glow: true, ei: 0.7 });
    holoTag(cylinder, "Recovery cylinder", 0, 1.3, 0, { css: "#4fd1ff", w: 0.36 });
    reg(hits, cylinder, "recovery-cylinder");
    reg(hits, cylScale, "recovery-cylinder");

    // Work order.
    const order = holoPanel(g, 0.58, 0.4, -1.9, 1.5, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER WO-6120", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CHILLER 2 — VALVE PLATE FAIL", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Refrigerant: R-134a, 50 lb charge", "Recovery vacuum: ≤ 0 psig",
       "Cylinder capacity: 50 lb, 80% max fill", "O₂ safe range: 19.5–23.5%",
       "Isolation: disconnect DS-2"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0x4fd1ff });
    reg(hits, order, "work-order");

    let running = true;
    let recovering = false;
    let atmosphereOk = true;

    return {
      hits,
      footprint: 2.1,

      onStepComplete(step) {
        if (step.id === "estop") { running = false; repaint(hmi, signFace("STOPPED\n42°F CHW", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.26 })); }
        // discHandle is turned live by the player's drag — app.js drives its
        // rotation from session.turn while the 'isolate' step is active.
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "close-valves") {
          liquidValve.userData.wheel.rotation.z += 1.6;
          suctionValve.userData.wheel.rotation.z += 1.6;
        }
        if (step.id === "recover") { recovering = true; repaint(recoveryScreen, signFace("RECOVERING", { bg: "#0d1c24", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.36 })); }
        if (step.id === "weigh") repaint(cylScale, signFace("48 / 50 lb", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.4 }));
        if (step.id === "restore") {
          running = true; recovering = false; appliedLock.visible = false; discHandle.rotation.z = 0;
          repaint(hmi, signFace("RUNNING\n42°F CHW", { bg: "#0d1c24", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.26 }));
          repaint(recoveryScreen, signFace("STANDBY", { bg: "#0d1c24", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.44 }));
        }
      },

      onHazard(hitId) {
        if (hitId === "vent-to-air") { ventGas.visible = true; }
      },

      animate(t, dt, session) {
        if (running) compHeat.visible = true;
        else if (compHeat.visible) compHeat.visible = false;
        if (running) compHeat.userData.step(dt, new THREE.Vector3(0.4, 0.75, 0), 0.08, 0.2, 0.3);
        monitorLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.6;
        if (ventGas.visible) ventGas.userData.step(dt, new THREE.Vector3(0.15, 0.9, 0.37), 0.05, 0.3, -0.5);

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "atmosphere") {
            const o2 = (15 + gg.t * 12).toFixed(1);
            repaint(monitorFace, signFace(`${o2}%`, {
              bg: "#0d1c14", accent: gg.t > 0.46 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bff7d4", scale: 0.5,
            }));
          }
          if (session.step?.id === "recover") {
            repaint(recoveryScreen, signFace(`${(gg.t * 30 - 5).toFixed(1)} psi`, {
              bg: "#0d1c24", accent: gg.t < 0.12 ? "#59c97b" : "#4fd1ff", fg: "#bfeaf7", scale: 0.4,
            }));
          }
        }
      },
    };
  },
};
