import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel, pipeRun,
  lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Boiler Room VR — its own gamified system: Steam Certified.
// Boiler lockout and firebox entry. Stored energy here is pressure and heat, not
// electricity, and it does not discharge the instant a switch is thrown — it
// has to actually cool and bleed down before the boiler is safe to open.

export const SIM_BOILER_ROOM = {
  id: "boiler-room",
  index: "15",
  domain: "Facilities",
  trade: "Stationary engineer / steamfitter",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "IUOE — state-licensed Stationary Engineer, boiler operation",
  name: "Boiler Room",
  title: simTitle("Boiler Room"),
  tagline: "Boiler lockout, confined-space firebox entry and a controlled re-light",
  accent: 0xd83a2a,
  accentCss: "#d83a2a",
  parSeconds: 245,
  badge: { id: "steam-certified", name: "Steam Certified", note: "Isolated, cooled, tested and relit with nothing skipped" },

  game: system({
    name: "Steam Certified",
    currency: "STEAM",
    ranks: ["Fireman", "Boiler Operator", "Stationary Engineer", "Plant Lead", "Steam Certified"],
    badges: [
      { id: "cold-and-clear", name: "Cold and Clear", note: "Never open the port before pressure and atmosphere are proven safe", test: AWARD.safe },
      { id: "double-block", name: "Double Block Certified", note: "Isolate the fuel train in the correct order every time", test: AWARD.stepClean("isolate-fuel-train") },
      { id: "steam-precise", name: "Steam Precise", note: "Hold every reading near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "fast-relight", name: "Fast Relight", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "steam-streak", name: "Steam Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "hot-inspection-port": "You are opening the inspection port before pressure and temperature are confirmed safe. Flash steam and superheated water erupting from a pressurised drum cause burns before you can pull your hand back.",
    "live-fuel-valve": "That fuel valve is not actually isolated. Working on the burner train with a live gas or oil supply behind it means one dropped spark or one hot surface away from an explosion.",
    "firebox-no-test": "You are entering the firebox before the atmosphere has been tested. Residual combustion gases in an unventilated firebox displace oxygen with no smell to warn you before you are already affected.",
    "relight-not-clear": "You are relighting the burner without confirming the isolation locks are removed and everyone is clear. A relight with a lock still in place or a person still inside the firebox can ignite trapped fuel or catch someone in the burner path.",
  },

  lateNotes: {
    "inspection-port": "The port only gets opened once the drum has cooled into the safe band and the firebox atmosphere has tested clear — not to check on progress along the way.",
    "lockout-point": "Both isolation locks go on before anyone reaches toward the firebox, and neither comes off until the repair is actually finished and the space is clear.",
  },

  steps: [
    {
      id: "workorder", kind: "select", target: "work-order",
      title: "Read the work order",
      cue: "Confirm the boiler, the refractory repair task and the required isolations.",
      why: "The work order names exactly which fuel and steam lines this repair needs isolated. Working from memory on a multi-boiler plant is how the wrong line gets left live.",
    },
    {
      id: "shutdown", kind: "select", target: "boiler-hmi",
      title: "Shut the boiler down",
      cue: "Stop the burner from the control panel and confirm flame-out.",
      why: "A controlled shutdown lets the burner cycle down cleanly instead of isolating fuel and steam lines on a boiler that is still firing.",
    },
    {
      id: "cooldown", kind: "gauge", target: "pressure-gauge",
      title: "Confirm the drum has cooled and depressurised",
      cue: "Watch the drum pressure and temperature fall, and commit once it is inside the safe band.",
      why: "A boiler drum holds stored heat and pressure long after the burner stops. The safe band is what actually makes the inspection port and the firebox approachable, not the elapsed time since shutdown.",
      gauge: {
        label: "DRUM PRESSURE / TEMPERATURE", speed: 0.5, green: [0.0, 0.15],
        readout: (t) => `${Math.round(t * 180)} psig · ${Math.round(100 + t * 280)}°F`,
        missNote: "Still hot and pressurised. Keep bleeding down — the port and firebox stay closed until this reads inside the safe band.",
      },
    },
    {
      id: "isolate-fuel-train", kind: "sequence",
      targets: ["fuel-valve", "fuel-block-valve", "bleed-valve"],
      itemNames: { "fuel-valve": "upstream fuel block valve", "fuel-block-valve": "downstream fuel block valve", "bleed-valve": "bleed valve" },
      title: "Isolate the fuel train — double block and bleed",
      cue: "Close the upstream block, close the downstream block, then open the bleed valve between them.",
      why: "Two closed valves with a vented bleed point between them is what proves the fuel train is actually isolated — the bleed valve venting nothing is your confirmation, not a guess based on two closed handles.",
      outOfOrderNote: "Wrong order — both blocks close before the bleed valve opens, so the vent is confirming isolation rather than releasing line pressure.",
    },
    {
      id: "isolate-steam", kind: "turn", target: "steam-valve",
      title: "Isolate the main steam stop valve",
      cue: "Grab the handwheel and turn it closed — a full turn and a half.",
      why: "The steam side gets isolated independently of the fuel side — a firebox repair with the steam header still connected leaves a pressurised path back into the drum you are working next to.",
      turn: { turns: 1.5, axis: "z", label: "MAIN STEAM STOP", readout: (t) => `${Math.round(t * 100)}% CLOSED` },
    },
    {
      id: "lock-all", kind: "select", target: "lockout-point",
      title: "Lock out the isolation points",
      cue: "Apply lockout tags to the fuel train and the steam stop valve.",
      why: "The locks are what stop the fuel or steam isolation from being reversed by someone else on shift while you are standing in the firebox.",
    },
    {
      id: "atmosphere-test", kind: "gauge", target: "gas-meter",
      title: "Test the firebox atmosphere",
      cue: "Sample the firebox air and commit only inside the safe oxygen range.",
      why: "A firebox that has just been fired holds residual combustion gases that do not clear on their own timeline you can guess at — the meter is what actually proves it is breathable.",
      gauge: {
        label: "FIREBOX ATMOSPHERE — OXYGEN", speed: 0.6, green: [0.46, 0.6],
        readout: (t) => `${(15 + t * 12).toFixed(1)} % O₂`,
        missNote: "Outside the safe range. Ventilate the firebox and re-test before anyone's head goes near that opening.",
      },
    },
    {
      id: "entry-permit", kind: "select", target: "csp-permit",
      title: "Open the confined-space entry permit",
      cue: "Sign the permit for firebox entry: attendant posted, retrieval plan named.",
      why: "The firebox is a confined space in its own right, separate from the boiler lockout. It gets its own permit and its own attendant before anyone's shoulders go through that port.",
    },
    {
      id: "open-port", kind: "select", target: "inspection-port",
      title: "Open the inspection port",
      cue: "Unbolt and swing open the inspection port now that pressure and atmosphere are confirmed safe.",
      why: "This is the point where every control before it pays off — cooled, depressurised, isolated, tested. Open it any earlier and at least one of those is still unresolved.",
    },
    {
      id: "firebox-entry", kind: "select", target: "firebox-repair",
      title: "Complete the refractory repair",
      cue: "Enter the firebox and repair the damaged refractory lining.",
      why: "The repair only happens once the space is confirmed cold, isolated and breathable — that is the entire reason the steps ahead of this one exist.",
    },
    {
      id: "remove-locks", kind: "select", target: "lockout-point",
      title: "Remove the isolation locks",
      cue: "Confirm the repair is complete and everyone is clear, then remove the fuel and steam locks.",
      why: "Locks come off only once the firebox is confirmed empty and the port is closed — removing isolation while anyone could still be inside defeats the reason the locks went on.",
    },
    {
      id: "relight", kind: "select", target: "boiler-hmi",
      title: "Run the controlled re-light",
      cue: "Purge the firebox, then ignite the burner and bring the boiler back to pressure.",
      why: "A purge cycle clears any fuel vapour that collected during the work before the igniter ever fires — skipping straight to ignition is how a re-light becomes a firebox explosion.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0xd83a2a);

    // ------------------------------------------------------------- plant room
    box(g, 4.6, 0.14, 4.6, 0, 0.07, 0, 0x545c63, { rough: 0.9 });
    for (let i = -3; i <= 3; i++) box(g, 4.6, 0.004, 0.014, 0, 0.145, i * 0.7, 0x424951, { cast: false, receive: false });

    // ------------------------------------------------------------- the boiler
    const boiler = group(g, -0.5, 0, -1.0, 0.2);
    cyl(boiler, 0.55, 0.55, 1.6, 0, 0.85, 0, 0x6b747c, { rough: 0.5, metal: 0.5, seg: 22 });
    lathe(boiler, [[0.001, 0], [0.35, 0.05], [0.5, 0.18], [0.55, 0.5]], 0, 1.6, 0, 0x6b747c, { rough: 0.5, metal: 0.5, seg: 22 });
    const hmi = decal(boiler, 0.4, 0.28, 0.5, 1.0, 0.2,
      signFace("RUNNING\n120 psig", { bg: "#0d1c24", accent: "#d83a2a", fg: "#ffc9bf", scale: 0.26 }),
      { glow: true, ei: 0.9, px: 384 });
    hmi.rotation.y = Math.PI / 2;
    reg(hits, hmi, "boiler-hmi");
    holoTag(boiler, "Boiler 1 · 150 HP", 0, 1.85, 0, { css: "#d83a2a", w: 0.4 });

    // Manual igniter switch — the trap for relighting before locks are off and the space is clear.
    const igniter = group(boiler, 0.55, 0.7, 0.1);
    box(igniter, 0.05, 0.03, 0.03, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    holoTag(igniter, "Igniter", 0, 0.07, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, igniter, "relight-not-clear");

    const pressureFace = decal(boiler, 0.28, 0.16, -0.5, 1.3, 0.2,
      signFace("140 psig\n410°F", { bg: "#0d1c24", accent: "#d83a2a", fg: "#ffc9bf", scale: 0.28 }), { glow: true, ei: 0.85, px: 256 });
    pressureFace.rotation.y = -Math.PI / 2;
    reg(hits, pressureFace, "pressure-gauge");

    // Inspection port on the shell — the flash-hazard trap.
    const port = group(boiler, 0.5, 0.55, 0.3);
    cyl(port, 0.11, 0.11, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 18 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(port, 0.012, 0.012, 0.03, Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 })
        .rotation.x = Math.PI / 2;
    }
    port.rotation.y = 0.6;
    holoTag(port, "Inspection port", 0, 0.18, 0, { css: "#d83a2a", w: 0.32 });
    reg(hits, port, "inspection-port");
    const flashSteam = particles(port, 40, 0xdfeaf2, { size: 0.03, life: 0.5, additive: false, opacity: 0.35 });

    // Port dogging bolts — the trap for reaching to unbolt the port before it is confirmed safe.
    const portBolts = group(port, 0.14, 0, 0);
    cyl(portBolts, 0.014, 0.014, 0.03, 0, 0, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 10 });
    holoTag(portBolts, "Dogging bolts", 0, 0.08, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, portBolts, "hot-inspection-port");

    // Firebox opening below the shell, dark until the port is opened.
    const firebox = group(boiler, 0, 0.15, 0.35);
    box(firebox, 0.5, 0.3, 0.3, 0, 0, 0, 0x11151a, { rough: 0.95, cast: false });
    const refractory = box(firebox, 0.4, 0.2, 0.02, 0.1, 0, 0.12, 0xb8402f, { rough: 0.85 });
    holoTag(firebox, "Firebox", 0, 0.22, 0.16, { css: "#d83a2a", w: 0.28 });
    reg(hits, refractory, "firebox-repair");

    const fireboxDoor = box(firebox, 0.5, 0.3, 0.02, 0, 0, -0.14, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(fireboxDoor, "Firebox door", 0, 0.2, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, fireboxDoor, "firebox-no-test");

    const burnGlow = ball(firebox, 0.06, 0, -0.02, 0.1, 0xff8a3c, { emissive: 0xff8a3c, ei: 2.0 });

    // ------------------------------------------------------------- fuel train
    const fuelSkid = group(g, -1.9, 0, -0.2, 0.5);
    pipeRun(fuelSkid, [[-0.5, 0.4, 0], [0, 0.4, 0], [0.5, 0.4, 0]], 0.05, 0x2f6f4a,
      { steps: 14, flanges: [[-0.3, 0.4, 0], [0.3, 0.4, 0]], flangeAxis: "x" });
    const fuelValve = valveWheel(fuelSkid, -0.3, 0.5, 0, { r: 0.09, color: 0xf2c14b, body: 0x2f6f4a });
    reg(hits, fuelValve, "fuel-valve");
    const fuelBlockValve = valveWheel(fuelSkid, 0.3, 0.5, 0, { r: 0.09, color: 0xf2c14b, body: 0x2f6f4a });
    reg(hits, fuelBlockValve, "fuel-block-valve");
    const bleedValve = valveWheel(fuelSkid, 0, 0.62, 0.12, { r: 0.05, color: 0x4fd1ff, body: 0x2f6f4a });
    reg(hits, bleedValve, "bleed-valve");
    const bleedMist = particles(bleedValve, 20, 0xdfeaf2, { size: 0.015, life: 0.3, additive: false, opacity: 0.3 });
    holoTag(fuelSkid, "Fuel train", 0, 0.85, 0.12, { css: "#d83a2a", w: 0.3 });

    const liveFuelIndicator = group(fuelSkid, 0.6, 0.4, 0.15);
    ball(liveFuelIndicator, 0.02, 0, 0, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
    holoTag(liveFuelIndicator, "Fuel supply", 0, 0.1, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, liveFuelIndicator, "live-fuel-valve");

    const steamValve = valveWheel(g, 0.6, 0.75, -1.3, { r: 0.1, color: 0xd8232a, body: 0x2f6f4a, ry: 0.4 });
    holoTag(steamValve, "Main steam stop", 0, 0.28, 0, { css: "#d83a2a", w: 0.32 });
    reg(hits, steamValve, "steam-valve");

    const lockCab = group(g, -1.85, 0, -1.5, 0.4);
    box(lockCab, 0.4, 0.6, 0.16, 0, 0.4, 0, 0x545e67, { rough: 0.5, metal: 0.5 });
    const hasp = torus(lockCab, 0.02, 0.006, 0, 0.5, 0.09, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, hasp, "lockout-point");
    const fuelLock = lockTag(lockCab, -0.06, 0.5, 0.1, { color: 0xd8232a });
    const steamLock = lockTag(lockCab, 0.06, 0.5, 0.1, { color: 0x1f7ae0 });
    fuelLock.visible = false; steamLock.visible = false;

    // ------------------------------------------------------------- paperwork + gear
    const order = holoPanel(g, 0.58, 0.4, -1.9, 1.5, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d83a2a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER WO-4410", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("BOILER 1 — REFRACTORY REPAIR", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Safe entry: ≤ 25 psig, ≤ 130°F", "Fuel: double block and bleed",
       "Steam: main stop isolated and tagged", "O₂ safe range: 19.5–23.5%",
       "Firebox: separate confined-space permit"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0xd83a2a });
    reg(hits, order, "work-order");

    const chest = toolChest(g, 1.7, 1.2, { ry: -0.6, color: 0xd83a2a });
    const meter = instrument(chest, -0.08, 0.79, 0.05, { ry: 0.3, idle: "-- %", color: 0xd83a2a });
    holoTag(meter, "4-gas meter", 0, 0.16, 0, { css: "#d83a2a", w: 0.28 });
    reg(hits, meter, "gas-meter");

    const permitBoard = group(chest, 0.14, 0.79, 0.02, -0.4);
    slab(permitBoard, 0.2, 0.16, 0.02, 0, 0.09, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const permitFace = decal(permitBoard, 0.18, 0.14, 0, 0.09, 0.012,
      signFace("CSP\nPENDING", { bg: "#11181f", accent: "#d83a2a", scale: 0.3 }), { px: 220 });
    holoTag(permitBoard, "Confined-space permit", 0, 0.2, 0, { css: "#d83a2a", w: 0.34 });
    reg(hits, permitBoard, "csp-permit");

    let running = true;
    let fuelIsolated = false;
    let firing = 0;

    return {
      hits,
      footprint: 2.1,

      onStepComplete(step) {
        if (step.id === "shutdown") {
          running = false;
          repaint(hmi, signFace("STOPPED\n120 psig", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.26 }));
        }
        if (step.id === "isolate-fuel-train") {
          fuelIsolated = true;
          fuelValve.userData.wheel.rotation.z += 1.6;
          fuelBlockValve.userData.wheel.rotation.z += 1.6;
          bleedValve.userData.wheel.rotation.z += 1.6;
          liveFuelIndicator.children[0].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
        }
        // The steam stop valve's handwheel is turned live by the player's drag —
        // app.js drives its rotation directly from session.turn while the
        // 'isolate-steam' step is active, so there is nothing to do here.
        if (step.id === "lock-all") { fuelLock.visible = true; steamLock.visible = true; }
        if (step.id === "entry-permit") {
          repaint(permitFace, signFace("CSP\nSIGNED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
        if (step.id === "open-port") { port.rotation.y = 1.7; }
        if (step.id === "firebox-entry") refractory.material = mat(0x8b929a, { rough: 0.6, metal: 0.3 });
        if (step.id === "remove-locks") { fuelLock.visible = false; steamLock.visible = false; }
        if (step.id === "relight") {
          running = true; fuelIsolated = false; port.rotation.y = 0.6; firing = 1;
          repaint(hmi, signFace("RUNNING\n120 psig", { bg: "#0d1c24", accent: "#d83a2a", fg: "#ffc9bf", scale: 0.26 }));
        }
      },

      onHazard(hitId) {
        if (hitId === "hot-inspection-port") flashSteam.visible = true;
        if (hitId === "live-fuel-valve" && !fuelIsolated) bleedMist.visible = true;
      },

      animate(t, dt, session) {
        burnGlow.material.emissiveIntensity = running ? 1.6 + Math.sin(t * 6) * 0.6 : 0.1;
        if (flashSteam.visible) flashSteam.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 0.5, 0.3);
        if (bleedMist.visible) bleedMist.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.03, 0.2, 0.2);
        if (firing > 0) firing -= dt;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "cooldown") {
            const psi = Math.round(gg.t * 180), degf = Math.round(100 + gg.t * 280);
            repaint(pressureFace, signFace(`${psi} psig\n${degf}°F`, {
              bg: "#0d1c24", accent: gg.t < 0.15 ? "#59c97b" : "#d83a2a", fg: "#ffc9bf", scale: 0.28,
            }));
          }
          if (session.step?.id === "atmosphere-test") {
            const o2 = (15 + gg.t * 12).toFixed(1);
            repaint(meter.userData.screen, signFace(`${o2}%`, {
              bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
            }));
          }
        }
      },
    };
  },
};
