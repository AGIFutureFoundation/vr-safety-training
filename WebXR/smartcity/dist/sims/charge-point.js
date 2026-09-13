import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, equipmentCabinet, toolChest, cone, lockTag,
  instrument, barrierPanel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Charge Point VR — its own gamified system: Grid Certification.
// DC fast charger fault isolation, where the hazard is not the 400 V AC feed but
// the DC link that stays lethal after the supply is opened.

export const SIM_CHARGE_POINT = {
  id: "charge-point",
  index: "01",
  domain: "Energy",
  trade: "EV service technician",
  name: "Charge Point",
  title: simTitle("Charge Point"),
  tagline: "DC fast-charger fault isolation, capacitor discharge and busbar torque",
  accent: 0x59c97b,
  accentCss: "#59c97b",
  parSeconds: 205,
  badge: { id: "dc-clear", name: "DC Clear", note: "Full isolation with the DC link proven dead" },

  game: system({
    name: "Grid Certification",
    currency: "GRID",
    ranks: ["Bay Apprentice", "Bay Technician", "Commissioning Tech", "Fault Lead", "Grid Certified"],
    badges: [
      { id: "dc-clear", name: "DC Clear", note: "Prove the link dead before the guard comes off", test: AWARD.stepClean("verify") },
      { id: "hands-off", name: "Hands Off", note: "Finish without one unsafe contact", test: AWARD.safe },
      { id: "torque-spec", name: "Torque to Spec", note: "Hold every graded value near centre band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "full-wait", name: "Full Wait", note: "Never break the discharge hold", test: AWARD.unbroken },
      { id: "first-time", name: "First Time Right", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "bay-turnaround", name: "Bay Turnaround", note: "Restore service inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dc-busbar": "That is the DC link busbar. The supply being open means nothing here — the capacitors hold hundreds of volts for minutes after shutdown, and they will not let go once you are across them.",
    "damaged-cable": "That cable has a cut through to the screen. A damaged DC lead on a 350 kW charger is not a cosmetic fault; bin it and tag the unit out of service.",
    "interlock-bypass": "That jumper defeats the door interlock. Every bypass ever fitted 'just for testing' is still fitted. The interlock is the last thing standing between the next technician and the DC link.",
    "live-connector": "The vehicle is still in a charging session. Pulling a CCS connector under load draws a DC arc that will not self-extinguish — stop the session at the vehicle or the charger first.",
  },

  lateNotes: {
    "power-module": "The module comes out after the link is proven dead, not before.",
    "torque-wrench": "Nothing gets torqued while there is stored energy behind the panel.",
  },

  steps: [
    {
      id: "workorder", kind: "select", target: "work-order",
      title: "Read the work order and fault code",
      cue: "Open the job on the tablet: fault code, unit history, isolation plan.",
      why: "The fault code tells you which module and which isolation points. Walking up and opening doors is how you isolate the wrong cabinet.",
    },
    {
      id: "stopsession", kind: "select", target: "vehicle-hmi",
      title: "End the charging session",
      cue: "Stop the session at the vehicle side before touching anything.",
      why: "A controlled stop ramps the current to zero and unlocks the connector. Everything after this assumes no load on the cable.",
    },
    {
      id: "barrier", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "barrier-rail"],
      itemNames: { "cone-a": "cone at the bay entry", "cone-b": "cone at the kerb side", "barrier-rail": "barrier across the bay" },
      title: "Establish the work zone",
      cue: "Close the bay: two cones and the barrier.",
      why: "A charging bay is a live traffic lane. The work zone stops a driver reversing onto you while your head is inside a cabinet.",
    },
    {
      id: "ppe", kind: "select", target: "ppe-case",
      title: "Don class 0 gloves and face shield",
      cue: "Take the insulating gloves and shield from the case.",
      why: "Class 0 rubber gloves with leather protectors and a face shield, before the door opens. The DC link does not care that the AC supply is off.",
    },
    {
      id: "isolate", kind: "select", target: "ac-disconnect",
      title: "Open the upstream AC disconnect",
      cue: "Throw the feeder disconnect on the supply pillar.",
      why: "Isolate at the source, not at the charger's own contactor. A control-level stop is not an isolation.",
    },
    {
      id: "lock", kind: "select", target: "lock-station",
      title: "Lock and tag the disconnect",
      cue: "Apply your padlock and tag to the disconnect handle.",
      why: "Your lock, your key. A charger that reboots itself while your hands are inside is a charger someone else energised.",
    },
    {
      id: "discharge", kind: "hold", target: "discharge-timer", seconds: 12,
      title: "Wait out the DC link discharge",
      cue: "Hold at the discharge timer for the full manufacturer wait.",
      why: "The bleed resistors need their stated time. Counting to ten and opening the panel is how technicians find out what a charged DC link feels like.",
      holdBreakNote: "You broke the wait. The capacitors are still holding charge — start the full discharge period again.",
    },
    {
      id: "verify", kind: "gauge", target: "dc-meter",
      title: "Prove the DC link is dead",
      cue: "Meter across the DC link and commit when the reading is safe.",
      why: "Absence of voltage is measured, not assumed. Below the manufacturer's safe threshold — anything else and you wait longer.",
      gauge: {
        label: "DC LINK — TERMINAL VOLTAGE", speed: 0.65, green: [0.0, 0.1],
        readout: (t) => `${Math.round(t * 820)} V DC`,
        missNote: "Still holding charge. Leave the leads on and let it bleed down — do not open the guard at that voltage.",
      },
    },
    {
      id: "swap", kind: "select", target: "power-module",
      title: "Withdraw the faulty power module",
      cue: "Slide the failed module out of the stack.",
      why: "Modules are hot-swap rated in service, not in fault. With the link proven dead you can handle it without the arc risk.",
    },
    {
      id: "torque", kind: "gauge", target: "torque-wrench",
      title: "Torque the busbar connection",
      cue: "Set the wrench and torque the busbar bolt to specification.",
      why: "Under-torqued busbars run hot and eventually weld themselves; over-torqued ones crack the lug. The number on the label is the number.",
      gauge: {
        label: "BUSBAR TORQUE", speed: 0.8, green: [0.46, 0.6],
        readout: (t) => `${(8 + t * 34).toFixed(1)} N·m`,
        missNote: "Off specification. A joint outside the torque window is a future thermal fault — reset and take it again.",
      },
    },
    {
      id: "restore", kind: "select", target: "commission-tablet",
      title: "Restore and test-charge",
      cue: "Remove the lock, re-energise and run a commissioning session.",
      why: "The job is not finished at the repair. A test session under load is what proves the fix and clears the unit back to service.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 1.95, 0x59c97b);

    // ------------------------------------------------------------- the charger
    const charger = group(g, -0.55, 0, -0.85, 0.28);
    slab(charger, 0.82, 1.95, 0.52, 0, 0.98, 0, 0x27313a, { radius: 0.05, rough: 0.42, metal: 0.45 });
    box(charger, 0.88, 0.06, 0.58, 0, 1.99, 0, 0x1c242b, { rough: 0.5, metal: 0.4 });
    box(charger, 0.9, 0.1, 0.6, 0, 0.05, 0, 0x171d23, { rough: 0.8 });
    // Branding band and status light bar.
    box(charger, 0.84, 0.05, 0.53, 0, 1.72, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
    const statusBar = box(charger, 0.06, 1.2, 0.02, 0.42, 1.05, 0.255, 0x59c97b,
      { emissive: 0x59c97b, ei: 1.9, rough: 0.4 });
    const hmi = decal(charger, 0.46, 0.34, 0, 1.34, 0.262,
      signFace("CHARGING\n62 kW", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }),
      { glow: true, ei: 0.9, px: 448 });
    reg(hits, hmi, "vehicle-hmi");
    holoTag(charger, "Bay 04 · 350 kW", 0, 2.16, 0.1, { css: "#59c97b" });

    // Service door, swung open to the module stack and the DC link behind a guard.
    const door = group(charger, -0.41, 1.0, 0.26);
    box(door, 0.8, 1.5, 0.03, 0.4, 0, 0, 0x2f3a44, { rough: 0.42, metal: 0.5 });
    box(door, 0.03, 0.12, 0.03, 0.74, 0, 0.03, CITY.steel, { rough: 0.3, metal: 0.9 });
    door.rotation.y = 1.05;
    decal(door, 0.3, 0.2, 0.4, 0.4, 0.017,
      signFace("DANGER\n1000 V DC", { bg: "#b81410", accent: "#f2ae14", fg: "#ffffff", scale: 0.3 }));

    const bay = group(charger, 0, 1.0, 0.14);
    box(bay, 0.72, 1.44, 0.05, 0, 0, -0.12, 0x11161b, { rough: 0.9 });
    const modules = [];
    for (let i = 0; i < 4; i++) {
      const m = group(bay, 0, 0.5 - i * 0.32, 0);
      box(m, 0.66, 0.27, 0.3, 0, 0, -0.02, i === 1 ? 0x4a2b2b : 0x232b32, { rough: 0.5, metal: 0.4 });
      for (let v = 0; v < 5; v++) box(m, 0.02, 0.19, 0.01, -0.24 + v * 0.06, 0, 0.13, 0x11161b, { rough: 0.7 });
      ball(m, 0.011, 0.26, 0.09, 0.14, i === 1 ? CITY.alert : CITY.good,
        { emissive: i === 1 ? CITY.alert : CITY.good, ei: 2.4 });
      decal(m, 0.16, 0.05, 0.02, -0.09, 0.14, signFace(`PM-${i + 1}`, { scale: 0.6, accent: "#59c97b" }));
      modules.push(m);
    }
    reg(hits, modules[1], "power-module");

    // DC link busbar behind a clear guard — reachable, which is the point.
    const link = group(bay, 0, -0.62, 0.02);
    for (const sx of [-1, 1]) {
      box(link, 0.05, 0.2, 0.014, sx * 0.14, 0, -0.04, 0xb87333, { rough: 0.3, metal: 0.95 });
      box(link, 0.08, 0.05, 0.03, sx * 0.14, -0.08, -0.02, 0x6d757d, { rough: 0.4, metal: 0.85 });
    }
    box(link, 0.4, 0.03, 0.02, 0, 0.08, -0.04, 0xb87333, { rough: 0.3, metal: 0.95 });
    const guard = box(link, 0.46, 0.26, 0.01, 0, 0, 0.06, 0xbfe4f2,
      { rough: 0.1, opacity: 0.28, metal: 0.1 });
    decal(link, 0.2, 0.05, 0, 0.16, 0.062, signFace("DC LINK", { bg: "#2a1416", accent: "#f0645b", scale: 0.6 }));
    reg(hits, link, "dc-busbar");
    const dcSpark = particles(link, 60, 0xbfe4ff, { size: 0.014, life: 0.3 });

    // Interlock jumper hanging on the door frame — the shortcut.
    const jumper = group(charger, 0.3, 1.55, 0.3);
    hose(jumper, [[0, 0, 0], [0.05, -0.08, 0.03], [0.02, -0.16, 0]], 0.006, 0xf2c14b, { steps: 10 });
    for (const y of [0, -0.16]) box(jumper, 0.02, 0.014, 0.014, y === 0 ? 0 : 0.02, y, 0, 0xb8402f, { rough: 0.5 });
    reg(hits, jumper, "interlock-bypass");

    // ---------------------------------------------------------- the vehicle side
    const vehicle = group(g, 1.35, 0, -0.5, -0.3);
    slab(vehicle, 1.1, 0.5, 2.0, 0, 0.62, 0, 0x33424f, { radius: 0.14, rough: 0.35, metal: 0.5 });
    slab(vehicle, 0.95, 0.34, 1.15, 0, 0.98, -0.1, 0x1b232b, { radius: 0.12, rough: 0.2, metal: 0.3, opacity: 0.85 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const wheel = cyl(vehicle, 0.28, 0.28, 0.17, sx * 0.52, 0.28, sz * 0.66, 0x14171a, { rough: 0.9, seg: 18 });
      wheel.rotation.z = Math.PI / 2;
      const rim = cyl(vehicle, 0.16, 0.16, 0.18, sx * 0.52, 0.28, sz * 0.66, 0x99a3ab, { rough: 0.35, metal: 0.8, seg: 14 });
      rim.rotation.z = Math.PI / 2;
    }
    const inlet = group(vehicle, -0.56, 0.72, 0.5);
    cyl(inlet, 0.07, 0.07, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 16 }).rotation.z = Math.PI / 2;
    const connector = group(inlet, -0.1, 0, 0);
    slab(connector, 0.16, 0.13, 0.13, 0, 0, 0, 0x22272c, { radius: 0.03, rough: 0.5 });
    cyl(connector, 0.055, 0.055, 0.06, 0.08, 0, 0, 0x2b3138, { rough: 0.5, seg: 14 }).rotation.z = Math.PI / 2;
    const cable = hose(g, [[0.78, 0.72, -0.05], [0.4, 0.45, 0.35], [0.05, 0.3, 0.4], [-0.25, 1.1, -0.35]],
      0.026, 0x14171a, { steps: 26, rough: 0.85 });
    reg(hits, connector, "live-connector");

    // A cut spare lead coiled on the ground — the trap.
    const spare = group(g, 0.35, 0, 0.95);
    torus(spare, 0.24, 0.024, 0, 0.026, 0, 0x14171a, { rough: 0.85, seg: 8, seg2: 26 })
      .rotation.x = Math.PI / 2;
    torus(spare, 0.19, 0.024, 0, 0.07, 0.01, 0x14171a, { rough: 0.85, seg: 8, seg2: 26 })
      .rotation.x = Math.PI / 2;
    box(spare, 0.05, 0.02, 0.03, 0.19, 0.08, 0.02, 0xb87333, { rough: 0.35, metal: 0.9 });   // exposed screen
    holoTag(spare, "Spare lead", 0, 0.3, 0, { css: "#f0645b", w: 0.24 });
    reg(hits, spare, "damaged-cable");

    // ------------------------------------------------------ supply pillar + LOTO
    const pillar = equipmentCabinet(g, 0.5, 1.15, 0.32, -1.55, 0.35,
      { ry: 0.9, color: 0x5c666f, metal: 0.55 });
    decal(pillar, 0.3, 0.09, 0, 1.32, 0.17, signFace("FEEDER 12", { accent: "#59c97b", scale: 0.55 }));
    const discBody = group(pillar, 0.16, 0.85, 0.17);
    box(discBody, 0.16, 0.2, 0.05, 0, 0, 0, 0x22272c, { rough: 0.45, metal: 0.6 });
    const handlePivot = group(discBody, 0, 0, 0.04);
    box(handlePivot, 0.045, 0.14, 0.04, 0, 0.06, 0, CITY.hiVis, { rough: 0.5 });
    const hasp = torus(discBody, 0.022, 0.006, -0.07, -0.07, 0.04, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, handlePivot, "ac-disconnect");
    const appliedLock = lockTag(discBody, -0.07, -0.07, 0.06);
    appliedLock.visible = false;

    const lockBoard = group(g, -1.75, 0, -0.55, 1.1);
    box(lockBoard, 0.42, 0.34, 0.04, 0, 1.15, 0, 0xd8232a, { rough: 0.6 });
    decal(lockBoard, 0.38, 0.07, 0, 1.28, 0.025, signFace("LOCKOUT", { bg: "#7d1512", accent: "#f2ae14", scale: 0.6 }));
    for (let i = 0; i < 4; i++) lockTag(lockBoard, -0.14 + i * 0.09, 1.1, 0.03, { color: [0xd8232a, 0x1f7ae0, 0x28a745, 0xf2c14b][i] });
    cyl(lockBoard, 0.03, 0.035, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, lockBoard, "lock-station");

    // ------------------------------------------------------------- technician kit
    const chest = toolChest(g, 1.45, 1.15, { ry: -0.6 });
    const ppe = group(chest, 0, 0.76, 0);
    slab(ppe, 0.4, 0.1, 0.28, 0, 0.05, 0, 0x1f2830, { radius: 0.02, rough: 0.5 });
    for (const sx of [-1, 1]) {
      cyl(ppe, 0.045, 0.05, 0.16, sx * 0.09, 0.16, 0, 0xd4622b, { rough: 0.85, seg: 12 });
      box(ppe, 0.08, 0.09, 0.04, sx * 0.09, 0.26, 0, 0xd4622b, { rough: 0.85 });
    }
    const shield = ball(ppe, 0.09, 0, 0.14, -0.12, 0xffb26b, { rough: 0.12, opacity: 0.5, side: 2 });
    shield.scale.set(1, 0.8, 0.55);
    holoTag(ppe, "Class 0 kit", 0, 0.4, 0, { css: "#59c97b", w: 0.26 });
    reg(hits, ppe, "ppe-case");

    const meter = instrument(chest, -0.1, 0.79, 0.06, { ry: 0.4, idle: "0.0 V" });
    holoTag(meter, "CAT IV meter", 0, 0.16, 0, { css: "#59c97b", w: 0.26 });
    reg(hits, meter, "dc-meter");

    const wrench = group(chest, 0.16, 0.79, -0.06, -0.5);
    box(wrench, 0.035, 0.03, 0.34, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    box(wrench, 0.05, 0.035, 0.07, 0, 0, -0.18, CITY.steel, { rough: 0.3, metal: 0.9 });
    const wrenchScale = decal(wrench, 0.03, 0.12, 0.019, 0.005, 0.06,
      signFace("22", { bg: "#1b2026", accent: "#59c97b", scale: 0.7 }), { px: 128 });
    wrenchScale.rotation.y = Math.PI / 2;
    holoTag(wrench, "Torque wrench", 0, 0.14, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, wrench, "torque-wrench");

    // --------------------------------------------------------- work zone hardware
    reg(hits, cone(g, -0.2, 1.5), "cone-a");
    reg(hits, cone(g, 1.9, 0.45), "cone-b");
    reg(hits, barrierPanel(g, 0.7, 1.75, { ry: 0.1 }), "barrier-rail");

    // ------------------------------------------------------------- holo paperwork
    const order = holoPanel(g, 0.56, 0.4, -1.6, 1.5, -1.35, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER  WO-4471", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("FAULT 0x2E — PM-2 OVERTEMP", w * 0.06, h * 0.32);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Unit: Bay 04 · 350 kW dual CCS", "Isolation: feeder 12 disconnect",
       "DC link bleed: 10 min stated", "Busbar torque: 22 N·m",
       "Return to service: 1 test session"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.48 + i * 0.11));
      });
    }, { ry: 0.65, accent: 0x59c97b });
    reg(hits, order, "work-order");

    const commission = holoPanel(g, 0.44, 0.3, 1.75, 1.35, -1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("COMMISSIONING", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ctx.fillText("Restore · test session · release", w / 2, h * 0.58);
      ctx.fillText("unit to service", w / 2, h * 0.76);
    }, { ry: -0.6, accent: 0x59c97b });
    reg(hits, commission, "commission-tablet");

    // Discharge timer post — the thing you actually stand and wait at.
    const timer = group(g, -1.15, 0, 0.95, 0.6);
    cyl(timer, 0.03, 0.04, 1.05, 0, 0.52, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    box(timer, 0.28, 0.2, 0.05, 0, 1.14, 0, 0x1b232b, { rough: 0.5, metal: 0.3 });
    const timerFace = decal(timer, 0.24, 0.15, 0, 1.14, 0.028,
      signFace("WAIT\n10:00", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.34 }),
      { glow: true, ei: 0.9, px: 320 });
    holoTag(timer, "Discharge timer", 0, 1.34, 0.03, { css: "#f2c14b", w: 0.32 });
    reg(hits, timer, "discharge-timer");

    let energised = true;
    let dcVolts = 780;
    let arcTimer = 0;

    return {
      hits,
      footprint: 1.95,

      onStepComplete(step) {
        if (step.id === "stopsession") {
          repaint(hmi, signFace("SESSION\nENDED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
        if (step.id === "isolate") {
          energised = false;
          handlePivot.rotation.z = -Math.PI / 2.2;
          statusBar.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.2, rough: 0.4 });
          repaint(hmi, signFace("ISOLATED", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.36 }));
        }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "discharge") dcVolts = 6;
        if (step.id === "verify") {
          guard.visible = false;
          repaint(timerFace, signFace("SAFE\n0 V", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.34 }));
        }
        if (step.id === "swap") modules[1].position.x = 0.55;
        if (step.id === "restore") {
          statusBar.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.9, rough: 0.4 });
          repaint(hmi, signFace("READY\n350 kW", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },

      onHazard(hitId) { if (hitId === "dc-busbar" && dcVolts > 60) arcTimer = 0.5; },

      animate(t, dt, session) {
        statusBar.material.emissiveIntensity = 1.5 + Math.sin(t * 2.2) * 0.5;

        // The discharge timer counts down while the learner actually stands there.
        const step = session?.step;
        if (step?.id === "discharge") {
          const left = Math.max(0, step.seconds - (session.holdFor ?? 0));
          const mm = Math.floor((left / step.seconds) * 10);
          const ss = Math.floor(((left / step.seconds) * 600) % 60);
          repaint(timerFace, signFace(`WAIT\n${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`, {
            bg: session.holding ? "#0d1c14" : "#2a1a0d",
            accent: session.holding ? "#59c97b" : "#f2c14b",
            fg: session.holding ? "#bff7d4" : "#ffe3ac", scale: 0.34,
          }));
          dcVolts = 780 * (1 - (session.holdFor ?? 0) / step.seconds);
        }

        if (arcTimer > 0) {
          arcTimer -= dt;
          dcSpark.visible = true;
          dcSpark.userData.step(dt, new THREE.Vector3(0, 0, 0.04), 0.16, 1.8, -3.5);
        } else if (dcSpark.visible) dcSpark.visible = false;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify") {
          const v = Math.round(gg.t * 820);
          repaint(meter.userData.screen, signFace(`${v} V`, {
            bg: "#0d1c24", accent: v < 60 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.62,
          }));
        }
        if (gg && !gg.committed && step?.id === "torque") {
          repaint(wrenchScale, signFace(`${Math.round(8 + gg.t * 34)}`, {
            bg: "#1b2026", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f2c14b", scale: 0.7,
          }));
        }
      },
    };
  },
};
