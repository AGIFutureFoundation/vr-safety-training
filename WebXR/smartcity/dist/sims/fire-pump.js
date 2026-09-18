import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel, pipeRun, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fire Pump VR — Building Systems & Facilities, station four.
// The annual flow test of a building's electric fire pump: the alarm company
// is told before the pump runs, the test header is opened to a safe discharge,
// the pump is brought to churn, 100% and 150% flow, and the pressures and
// currents are read and compared to the nameplate curve. A fire pump that
// has never been flowed is a pump nobody knows will work.

const FP_ACCENT = 0xe25c5c;

export const SIM_FIRE_PUMP = {
  id: "fire-pump",
  index: "35",
  domain: "Building Systems",
  trade: "Fire sprinkler fitter / fire pump technician",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "UA — journeyman sprinkler fitter; NFPA 25 (inspection, testing and maintenance of water-based systems) annual fire pump flow test; NICET Inspection & Testing of Water-Based Systems",
  name: "Fire Pump",
  title: simTitle("Fire Pump"),
  tagline: "Annual pump flow test: alarm notification, controller to manual, test header to safe discharge, churn / 100% / 150% points, curve compared, system restored",
  accent: FP_ACCENT,
  accentCss: "#e25c5c",
  parSeconds: 245,
  footprint: 2.4,
  badge: { id: "curve-met", name: "Curve Met", note: "A pump flowed at three points, read against its nameplate curve, with the alarm company told and the system restored" },

  game: system({
    name: "Pump Authority",
    currency: "GPM",
    ranks: ["Apprentice Fitter", "Journeyman Fitter", "Inspector", "Senior Inspector", "Pump Authority Certified"],
    badges: [
      { id: "alarm-told", name: "Alarm Told", note: "Alarm company notified before the pump ran, first time", test: AWARD.stepClean("notify") },
      { id: "discharge-safe", name: "Discharge Safe", note: "Never flowed into a room, never ran the pump dry", test: AWARD.safe },
      { id: "points-true", name: "Points True", note: "Flow points held inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-test", name: "Clean Test", note: "No corrections through the whole test", test: AWARD.clean },
      { id: "flow-held", name: "Flow Held", note: "Held the 150% point the full reading", test: AWARD.unbroken },
      { id: "test-window", name: "Test Window", note: "Test complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "no-notify-run": "You started the pump without notifying the alarm company. A fire pump running trips the waterflow and pump-running signals — the fire department rolls to a building with no fire, and the next real signal from this building gets a slower response.",
    "flow-indoors": "You opened the test header with the discharge pointed into the pump room. Two thousand gallons a minute at 100 psi fills the room, floods the controller and knocks a person off their feet; the hose lines go to the outside discharge.",
    "suction-closed": "You started the pump with the suction control valve closed. A centrifugal pump with no water at the suction cavitates and destroys its impeller and seal in minutes — the suction gauge is read before the pump is called.",
    "bypass-controller": "You jumpered the controller to force the pump on. The controller is the listed device that starts, runs and protects the pump; jumpered, it has no overload, no phase protection and no record of the run.",
  },

  lateNotes: {
    "controller-start": "The alarm company is told, the discharge is laid and the suction is proven before the pump is called.",
    "restore-auto": "The test points are done and the header closed before the controller goes back to automatic.",
  },


  // Interruptions: see shared/game.js. The hazard in an annual fire pump test
  // is not the pump — it is that the building's fire protection is offline
  // while you run it, and everybody else has forgotten.
  interrupts: [
    {
      id: "hot-work-started",
      kind: "System impaired",
      after: "churn", delay: 5, seconds: 14,
      alert: "The alarm panel is reporting a hot work permit opened on the third floor. The sprinkler system is still impaired for your test.",
      cue: "Nobody strikes an arc in a building with the pump on test.",
      target: "alarm-phone",
      why: "An impairment is a window during which the building has no fire protection, and the only thing managing that window is the person on the phone to the monitoring company and the permit desk. Hot work inside it is the one combination that has burned buildings down.",
      missNote: "You ran the test to completion with hot work live in an unprotected building. Impairment plus ignition source is the specific sequence behind most total-loss fires in sprinklered buildings, and it is always two teams who each thought the other knew.",
      wrongNote: "Get on the phone. The impairment is the emergency, not the pump reading.",
    },
    {
      id: "packing-runaway",
      kind: "Packing failure",
      after: "flow100", delay: 5, seconds: 12,
      alert: "The packing gland has opened up. It has gone from a drip to a stream and the floor drain is not keeping up.",
      cue: "Look at the gland before the room floods.",
      target: "packing-leak",
      why: "Packing is meant to weep — a stream is not weeping, it is a gland that has backed off under vibration, and it will take the shaft sleeve with it if it runs like that at flow.",
      missNote: "You ran the pump at rated flow with the gland streaming. The sleeve scored, the room took an inch of water, and the pump that is supposed to protect the building is now the thing that is out of service.",
      wrongNote: "It is the gland. Nothing about the flow test is worth a wrecked shaft sleeve and a flooded pump room.",
    },
  ],

  steps: [
    {
      id: "itm", kind: "select", target: "itm-sheet",
      title: "Read the test record and the nameplate curve",
      cue: "Check the pump's rated flow and pressure, last year's test points, and the test-header size.",
      why: "The nameplate says what the pump is supposed to do; last year's record says what it did. This year's test is judged against both.",
    },
    {
      id: "notify", kind: "select", target: "alarm-phone",
      title: "Notify the alarm company and the building",
      cue: "Call the monitoring company to put the account on test, and tell building management.",
      why: "The pump running sends signals. The monitoring company holds the dispatch for the test window, and takes the account off test when you call back.",
    },
    {
      id: "suction", kind: "gauge", target: "suction-gauge",
      title: "Confirm suction and the supply valve open",
      cue: "Read the suction gauge with the supply control valve open and commit inside the positive band.",
      why: "The pump needs water at its suction before it is called. A closed valve or a dropped supply shows here first, not after the impeller is gone.",
      gauge: { label: "SUCTION", speed: 0.75, green: [0.45, 0.62], readout: (t) => `${Math.round(t * 100)} psi`, missNote: "Suction not in the band — check the supply control valve before calling the pump." },
    },
    {
      id: "hoses", kind: "sequence",
      targets: ["hose-lay", "hose-outside", "playpipe"],
      itemNames: { "hose-lay": "hose lines from the test header", "hose-outside": "discharge to the outside", "playpipe": "playpipe nozzles with pitot access" },
      title: "Lay the test hoses to a safe discharge",
      cue: "Hose lines off the test header, run outside to a safe discharge, playpipes secured for the pitot readings.",
      why: "The test flows the pump's full capacity. Where that water goes is decided before the header opens — outside, secured, away from people and drains that cannot take it.",
      outOfOrderNote: "Lay the lines, run them outside, then secure the nozzles — in that order.",
    },
    {
      id: "manual", kind: "turn", target: "controller-selector",
      title: "Controller to manual test",
      cue: "Turn the controller selector from automatic to manual for the test.",
      why: "In manual, the pump runs on your command and stops on it. In automatic, a pressure drop starts it before you are ready and a timer stops it mid-reading.",
      turn: { turns: 0.5, axis: "z", label: "SELECTOR" },
    },
    {
      id: "start", kind: "select", target: "controller-start",
      title: "Start the pump at churn",
      cue: "Start the pump with the test header closed and read the churn pressure.",
      why: "Churn — no flow — is the first point on the curve. It also proves the pump starts, comes to speed and holds pressure before any water moves.",
    },
    {
      id: "churn", kind: "gauge", target: "discharge-gauge",
      title: "Read the churn pressure",
      cue: "Read the discharge gauge at churn and commit inside the nameplate band.",
      why: "Churn pressure above nameplate means the relief valve is doing its job; well below means a worn impeller or the wrong speed. It is the first number on the sheet.",
      gauge: { label: "CHURN", speed: 0.75, green: [0.5, 0.66], readout: (t) => `${Math.round(60 + t * 120)} psi`, missNote: "Churn pressure off the nameplate — record it and investigate before flowing." },
    },
    {
      id: "flow100", kind: "gauge", target: "header-valve",
      title: "Open the header to 100% flow",
      cue: "Open the test header valves until the pitot readings total rated flow, and commit the discharge pressure.",
      why: "Rated flow at rated pressure is the pump's nameplate point. This is the reading that says the pump is still the pump it was sold as.",
      gauge: { label: "100% FLOW", speed: 0.75, green: [0.44, 0.6], readout: (t) => `${Math.round(t * 2000)} gpm`, missNote: "Not at rated flow — adjust the header valves and read the pitots again." },
    },
    {
      id: "flow150", kind: "hold", target: "playpipe-hold", seconds: 5,
      title: "Hold the 150% flow point",
      cue: "Open to 150% of rated flow and hold while the pressure, current and speed are read.",
      why: "At 150% the pump must still make 65% of rated pressure. The readings are taken with the flow held steady, not on the way past it.",
      holdBreakNote: "Flow dropped before the readings were done — reopen and hold the 150% point.",
    },
    {
      id: "readings", kind: "sequence", anyOrder: true,
      targets: ["read-amps", "read-rpm"],
      itemNames: { "read-amps": "motor current", "read-rpm": "pump speed" },
      title: "Read current and speed",
      cue: "Motor amps on each phase and pump rpm with the tachometer, recorded against each flow point.",
      why: "Pressure alone can hide a slipping motor or a pump running slow. Amps and speed are what tie the pressure to the curve.",
    },
    {
      id: "restore", kind: "select", target: "restore-auto",
      title: "Close the header, controller to automatic, call the alarm company back",
      cue: "Header closed, pump stopped, selector to automatic, supply valve confirmed open, alarm company off test.",
      why: "A fire pump left in manual will not start for a fire. The restoration is the last step of the test and the most important one.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["packing-leak"],
      itemNames: { "packing-leak": "packing gland running dry" },
      itemNotes: { "packing-leak": "The packing gland is running dry and hot — no drip. Packing needs a steady drip to cool it; dry, it scores the shaft. Adjusted and written up before the room is locked." },
      title: "Walk the pump room before locking up",
      cue: "Inspect the pump, driver, controller and valves after the test and click the defect.",
      why: "The test heats everything up and shows what the room hides. The walk after the run is where a small fault gets caught before it is a failed pump.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, FP_ACCENT);
    box(g, 5.6, 0.1, 5.0, 0, 0.05, 0, 0x5a5e62, { rough: 0.9 });
    // Pump skid: motor, pump, suction and discharge piping with control valves, test header.
    const skid = group(g, 0, 0.1, -0.8);
    box(skid, 2.6, 0.2, 1.0, 0, 0.1, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const motor = cyl(skid, 0.3, 0.3, 0.9, -0.6, 0.55, 0, 0x2f4f8c, { rough: 0.5, metal: 0.4, seg: 18 });
    motor.rotation.z = Math.PI / 2;
    const pump = cyl(skid, 0.32, 0.32, 0.4, 0.5, 0.55, 0, 0xd2312b, { rough: 0.5, metal: 0.4, seg: 18 });
    pump.rotation.x = Math.PI / 2;
    const packing = cyl(skid, 0.08, 0.08, 0.1, 0.2, 0.55, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 12 });
    packing.rotation.z = Math.PI / 2;
    reg(hits, packing, "packing-leak");
    pipeRun(skid, [[0.5, 0.55, -0.6], [0.5, 0.55, -1.4], [0.5, -0.05, -1.4]], 0.12, 0xd2312b, { steps: 12, flanges: [[0.5, 0.55, -0.9]], flangeAxis: "z" });
    const suctionValve = valveWheel(skid, 0.5, 0.95, -1.1, { color: 0xd2312b, body: 0x8a1f1f, r: 0.14 });
    holoTag(skid, "suction control valve", 0.5, 1.3, -1.1, { css: "#e25c5c", w: 0.38 });
    const suctionClosed = box(skid, 0.4, 0.4, 0.4, 0.5, 0.95, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, suctionClosed, "suction-closed");
    const suctionGauge = decal(skid, 0.2, 0.2, 0.75, 0.9, -0.7, signFace("-- psi", { bg: "#12191f", accent: "#e25c5c", fg: "#ffd9d9", scale: 0.55 }), { glow: true, ei: 0.6 });
    reg(hits, suctionGauge, "suction-gauge");
    pipeRun(skid, [[0.5, 0.55, 0.6], [0.5, 0.55, 1.4], [1.6, 0.55, 1.4]], 0.12, 0xd2312b, { steps: 12, flanges: [[0.5, 0.55, 0.9]], flangeAxis: "z" });
    const dischargeGauge = decal(skid, 0.2, 0.2, 0.75, 0.9, 0.7, signFace("-- psi", { bg: "#12191f", accent: "#e25c5c", fg: "#ffd9d9", scale: 0.55 }), { glow: true, ei: 0.6 });
    reg(hits, dischargeGauge, "discharge-gauge");
    // Test header on the wall with four hose valves; hoses laid outside through the door.
    const header = group(g, 2.2, 0.1, 0.4, -Math.PI / 2);
    box(header, 1.2, 0.16, 0.16, 0, 0.9, 0, 0xd2312b, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 4; i++) { cyl(header, 0.05, 0.05, 0.16, -0.45 + i * 0.3, 0.8, 0.08, 0xc9a227, { rough: 0.4, metal: 0.7, seg: 12 }).rotation.x = Math.PI / 2; }
    const headerValve = valveWheel(header, 0, 1.2, 0.05, { color: 0xd2312b, body: 0x8a1f1f, r: 0.1 });
    holoTag(header, "test header", 0, 1.5, 0, { css: "#e25c5c", w: 0.24 });
    reg(hits, headerValve, "header-valve");
    const hoseLay = group(header, 0, 0.6, 0.3);
    for (let i = 0; i < 4; i++) cyl(hoseLay, 0.04, 0.04, 0.5, -0.45 + i * 0.3, 0, 0, 0xe8e2d6, { rough: 0.8, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(hoseLay, "hose lines", 0, 0.2, 0, { css: "#e25c5c", w: 0.22 });
    reg(hits, hoseLay, "hose-lay");
    const door = group(g, 0, 0.1, 2.4);
    box(door, 1.2, 2.2, 0.1, 0, 1.1, 0, 0x8b6a42, { rough: 0.8 });
    holoTag(door, "OUTSIDE — safe discharge", 0, 2.35, 0, { css: "#59c97b", w: 0.42 });
    const outside = box(door, 1.2, 1.0, 0.4, 0, 0.5, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, outside, "hose-outside");
    const playpipe = group(g, 0.9, 0.1, 1.9);
    cyl(playpipe, 0.03, 0.05, 0.4, 0, 0.1, 0, 0xc9a227, { rough: 0.4, metal: 0.7, seg: 12 }).rotation.x = Math.PI / 2 + 0.3;
    box(playpipe, 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.6 });
    holoTag(playpipe, "playpipe — pitot", 0, 0.35, 0, { css: "#e25c5c", w: 0.3 });
    reg(hits, playpipe, "playpipe");
    const playpipeHold = box(playpipe, 0.4, 0.3, 0.4, 0, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, playpipeHold, "playpipe-hold");
    const indoors = box(g, 0.6, 0.4, 0.6, -1.2, 0.5, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "flow it in here?", -1.2, 0.9, 0.9, { css: "#d2312b", w: 0.3 });
    reg(hits, indoors, "flow-indoors");
    // Controller cabinet.
    const ctrl = group(g, -2.3, 0.1, -0.6, 0.9);
    box(ctrl, 0.8, 1.8, 0.4, 0, 0.9, 0, 0xd2312b, { rough: 0.5, metal: 0.4 });
    decal(ctrl, 0.7, 0.14, 0, 1.75, 0.21, signFace("FIRE PUMP CONTROLLER", { bg: "#1b1e22", accent: "#e25c5c", scale: 0.5 }));
    const selector = group(ctrl, -0.2, 1.3, 0.21);
    cyl(selector, 0.05, 0.05, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const selHandle = box(selector, 0.02, 0.08, 0.02, 0, 0.02, 0.02, 0xffffff, { rough: 0.5 });
    decal(selector, 0.18, 0.04, 0, 0.1, 0.01, signFace("AUTO · MANUAL", { bg: "#22262b", accent: "#e25c5c", scale: 0.5 }));
    reg(hits, selector, "controller-selector");
    const start = box(ctrl, 0.12, 0.06, 0.03, 0.15, 1.3, 0.21, 0x59c97b, { rough: 0.5 });
    decal(ctrl, 0.12, 0.04, 0.15, 1.38, 0.21, signFace("START", { bg: "#22262b", accent: "#59c97b", scale: 0.55 }));
    reg(hits, start, "controller-start");
    const restore = box(ctrl, 0.2, 0.06, 0.03, 0, 0.95, 0.21, 0x22262b, { rough: 0.5 });
    decal(ctrl, 0.2, 0.04, 0, 1.03, 0.21, signFace("STOP · RESTORE AUTO", { bg: "#22262b", accent: "#e25c5c", scale: 0.42 }));
    reg(hits, restore, "restore-auto");
    const jumper = box(ctrl, 0.2, 0.06, 0.03, 0, 0.6, 0.21, 0x22262b, { rough: 0.5 });
    decal(ctrl, 0.2, 0.04, 0, 0.68, 0.21, signFace("JUMPER CONTACTOR", { bg: "#22262b", accent: "#d2312b", scale: 0.42 }));
    reg(hits, jumper, "bypass-controller");
    const noNotify = box(ctrl, 0.2, 0.06, 0.03, 0, 0.35, 0.21, 0x22262b, { rough: 0.5 });
    decal(ctrl, 0.2, 0.04, 0, 0.43, 0.21, signFace("START — NO CALL", { bg: "#22262b", accent: "#d2312b", scale: 0.42 }));
    reg(hits, noNotify, "no-notify-run");
    const amps = decal(ctrl, 0.24, 0.1, 0.1, 1.55, 0.21, signFace("-- A", { bg: "#12191f", accent: "#e25c5c", fg: "#ffd9d9", scale: 0.55 }), { glow: true, ei: 0.6 });
    reg(hits, amps, "read-amps");
    const chest = toolChest(g, -1.6, 1.6, { ry: 0.6, color: 0x6a2a2a });
    const tach = instrument(chest, 0, 0.79, 0, { ry: 0.3, idle: "-- rpm", color: 0xe25c5c, w: 0.11, d: 0.17 });
    holoTag(tach, "tachometer", 0, 0.15, 0, { css: "#e25c5c", w: 0.24 });
    reg(hits, tach, "read-rpm");
    const phone = instrument(chest, 0.22, 0.79, 0.1, { ry: 0, idle: "ALARM CO", color: 0xe25c5c, w: 0.1, d: 0.16 });
    holoTag(phone, "monitoring company", 0, 0.15, 0, { css: "#e25c5c", w: 0.34 });
    reg(hits, phone, "alarm-phone");
    holoPanel(chest, 0.6, 0.42, -0.6, 1.3, 0.1, (ctx, w, h) => {
      ctx.fillStyle = "#200a0a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#e25c5c"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("NFPA 25 ANNUAL — PUMP FP-1", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#ffe4e4";
      ["Rated: 1000 gpm @ 100 psi, 1770 rpm", "Churn ≤ 140% rated; 150% ≥ 65% rated", "Header: 4 × 2½\", playpipes outside", "Alarm co. on test before start", "Restore: AUTO, supply open, off test"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: FP_ACCENT });
    const itm = box(chest, 0.6, 0.42, 0.04, -0.6, 1.3, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, itm, "itm-sheet");
    const spray = particles(g, 60, 0x9fd3f0, { size: 0.02, life: 0.5, additive: false, opacity: 0.6 });

    let running = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, -0.8),
      onStep() {},
      // The alarm phone lights up, and the packing gland opens from a drip
      // into a stream you can see on the floor. See shared/game.js.
      onInterrupt(it) {
        if (it.id === "hot-work-started") { phone.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.9, rough: 0.5 }); }
        if (it.id === "packing-runaway") { packing.scale.set(1.6, 1, 1.6); packing.material = mat(0x4a7f9c, { rough: 0.2, metal: 0.5 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hot-work-started") { phone.material = mat(0x2f3740, { rough: 0.6 }); }
        if (it.id === "packing-runaway") { packing.scale.set(1, 1, 1); packing.material = mat(0x8a949d, { rough: 0.4, metal: 0.7 }); }
      },
      onStepComplete(step) {
        if (step.id === "manual") selHandle.rotation.z = Math.PI / 2;
        if (step.id === "start") { running = true; repaint(amps, signFace("142 A", { bg: "#12191f", accent: "#e25c5c", fg: "#ffd9d9", scale: 0.55 })); repaint(tach.userData.screen, signFace("1770 rpm", { bg: "#0d1c24", accent: "#e25c5c", fg: "#ffd9d9", scale: 0.55 })); }
        if (step.id === "restore") { running = false; selHandle.rotation.z = 0; }
        if (step.id === "walk") packing.material.color.set(0x59c97b);
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (running) motor.rotation.x += dt * 20;
        const flowing = running && (step?.id === "flow100" || step?.id === "flow150" || step?.id === "readings");
        if (flowing) { spray.visible = true; spray.userData.step(dt, new THREE.Vector3(0.9, 0.3, 2.4), 0.1, 2.0, -3); } else if (spray.visible) spray.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "suction") repaint(suctionGauge, signFace(`${Math.round(gg.t * 100)} psi`, { bg: "#12191f", accent: gg.t >= 0.45 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#ffd9d9", scale: 0.55 }));
          if (step?.id === "churn") repaint(dischargeGauge, signFace(`${Math.round(60 + gg.t * 120)} psi`, { bg: "#12191f", accent: gg.t >= 0.5 && gg.t <= 0.66 ? "#59c97b" : "#f2ae14", fg: "#ffd9d9", scale: 0.55 }));
          if (step?.id === "flow100") { headerValve.rotation.y = gg.t * Math.PI * 2; repaint(dischargeGauge, signFace(`${Math.round(gg.t * 2000)} gpm`, { bg: "#12191f", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#ffd9d9", scale: 0.55 })); }
        }
      },
    };
  },
};
