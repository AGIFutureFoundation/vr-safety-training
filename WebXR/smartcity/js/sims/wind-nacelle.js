import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet,
  standingFigure, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Wind Nacelle VR — Energy & Power, station seven.
// A gearbox oil change and yaw brake inspection ninety metres up, inside the
// nacelle of a utility-scale turbine. The rotor is locked, the yaw is locked,
// the converter is isolated, and every one of those is a separate lock with a
// separate reason — a turbine that starts turning while somebody is inside the
// nacelle does not stop because they shout.

const WN_ACCENT = 0x6ee7b7;

export const SIM_WIND_NACELLE = {
  id: "wind-nacelle",
  index: "52",
  domain: "Renewable generation",
  trade: "Wind turbine technician",
  category: "Energy & Power",
  weather: "wind",
  certification: "IBEW / IUOE — utility-scale wind technician; GWO Basic Safety Training (working at height, first aid, manual handling, fire awareness); OSHA 29 CFR 1910.147 for the rotor, yaw and converter locks; 1910.269 for the electrical isolation",
  name: "Wind Nacelle",
  title: simTitle("Wind Nacelle"),
  tagline: "Gearbox service ninety metres up: rotor lock, yaw lock, converter isolation, oil sampled hot, brake pads gauged, hatch closed",
  accent: WN_ACCENT,
  accentCss: "#6ee7b7",
  parSeconds: 270,
  footprint: 2.2,
  badge: { id: "nacelle-certified", name: "Nacelle Certified", note: "A gearbox serviced with all three locks proven, sampled hot, and the nacelle left closed and clear" },

  game: system({
    name: "Nacelle Authority",
    currency: "MWH",
    ranks: ["Trainee Tech", "Wind Tech", "Lead Tech", "Site Lead", "Nacelle Authority Certified"],
    badges: [
      { id: "three-locks", name: "Three Locks", note: "Rotor, yaw and converter all locked before the hatch opened", test: AWARD.stepClean("locks") },
      { id: "always-anchored", name: "Always Anchored", note: "Never unclipped inside the nacelle", test: AWARD.safe },
      { id: "sampled-hot", name: "Sampled Hot", note: "Oil drawn inside the temperature window", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-service", name: "Clean Service", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "torque-held", name: "Torque Held", note: "Held the drain plug torque the full count", test: AWARD.unbroken },
      { id: "down-before-dark", name: "Down Before Dark", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unlocked-rotor": "You opened the gearbox with the rotor lock pin not seated. A parked rotor still creeps in gusting wind, and a turning low-speed shaft inside a nacelle takes an arm before anyone can react. The pin goes in and is confirmed visually, every time.",
    "yaw-free": "You are working with the yaw drive free. The nacelle will hunt into a wind shift with you standing in it, and the tower cable below you twists with it — a yaw event with the hatch open throws tools out and drops them ninety metres.",
    "unclipped": "You moved inside the nacelle without transferring your lanyard. There is an open hatch in this floor and an eighty-five metre drop under it; the twin lanyard exists so that one end is always attached during the transfer.",
    "hot-oil": "You cracked the drain at full operating temperature with no shield. Gear oil at ninety degrees under head pressure comes out as a jet, not a trickle, and it goes straight through a coverall.",
  },

  lateNotes: {
    "rotor-pin": "The rotor lock goes in before any cover comes off — not after.",
    "drain-plug": "The oil comes out after the locks are proven and the shield is up.",
  },

  steps: [
    {
      id: "wtg-permit", kind: "select", target: "work-order",
      title: "Take the turbine work order and the wind limit",
      cue: "Check the service task, the lock points, and the wind speed the order stops work at.",
      why: "Every turbine task carries a wind limit, because above it the nacelle moves, the hatch cannot be controlled and rescue from height stops being possible. The number is on the order and it is checked against the anemometer, not the sky.",
    },
    {
      id: "wind-check", kind: "gauge", target: "anemometer",
      title: "Read the nacelle anemometer",
      cue: "Confirm the wind is inside the working limit before anything else happens.",
      why: "Ninety metres up, the wind is not the wind at the base. The nacelle's own anemometer is the one the limit is written against, and it is read at the top before the work starts and again if it freshens.",
      gauge: { label: "WIND m/s", speed: 0.75, green: [0.18, 0.42], readout: (t) => `${(t * 28).toFixed(1)} m/s`, missNote: "Above the working limit — the task stops and the nacelle gets closed up." },
    },
    {
      id: "locks", kind: "sequence",
      targets: ["rotor-pin", "yaw-lock", "converter-lock"],
      itemNames: { "rotor-pin": "rotor lock pin", "yaw-lock": "yaw brake lock", "converter-lock": "converter isolation" },
      title: "Three locks: rotor, yaw, converter",
      cue: "Pin the rotor, lock the yaw brake, isolate the converter — in that order, each confirmed.",
      why: "Three different things can move or energise in here and they are stopped three different ways. The rotor is mechanical, the yaw is hydraulic, the converter is electrical, and one lock does not do the job of the others.",
    },
    {
      id: "tag", kind: "select", target: "lock-box",
      title: "Your lock on the group lock box",
      cue: "Personal lock onto the box that holds the three isolation keys.",
      why: "The keys to those three locks live in a box that cannot open while your padlock is on it. That is the difference between an isolation somebody else is maintaining and an isolation you control.",
    },
    {
      id: "anchor", kind: "sequence", anyOrder: true,
      targets: ["harness", "twin-lanyard", "anchor-point"],
      itemNames: { harness: "full-body harness", "twin-lanyard": "twin lanyard", "anchor-point": "rated anchor" },
      title: "Harness, twin lanyard, rated anchor",
      cue: "Inspect the harness, clip both tails, and take the rated anchor inside the nacelle.",
      why: "Inside a nacelle there is an open hoist hatch and no floor over it. The twin lanyard is so that moving past the hatch never requires being unattached, and the anchor is the one the manufacturer rated, not the nearest pipe.",
    },
    {
      id: "hatch", kind: "select", target: "hoist-hatch",
      title: "Open and guard the hoist hatch",
      cue: "Open the hatch for the oil hose and set its guard rail before anything goes through it.",
      why: "The hatch is how the oil and the tools come up, and it is an eighty-five metre hole in the floor for as long as it is open. It gets a rail and it never gets left open unattended.",
    },
    {
      id: "oil-temp", kind: "gauge", target: "oil-thermo",
      title: "Check the gearbox oil temperature",
      cue: "The oil drains warm, not hot — read the sump before cracking anything.",
      why: "Cold oil will not carry the wear particles out and the drain takes an hour. Hot oil comes out as a jet. There is a window between those, and the thermometer says whether you are in it.",
      gauge: { label: "OIL °C", speed: 0.7, green: [0.4, 0.58], readout: (t) => `${Math.round(20 + t * 90)} °C`, missNote: "Outside the drain window — let it cool, or run it up, but do not crack it here." },
    },
    {
      id: "shield", kind: "select", target: "splash-shield",
      title: "Set the splash shield",
      cue: "Shield across the drain before the plug moves.",
      why: "Even inside the window the first of it comes out under head pressure. The shield is between the plug and the person turning it, and it takes two seconds to set.",
    },
    {
      id: "drain", kind: "turn", target: "drain-plug",
      title: "Crack the drain plug",
      cue: "Back the plug off slowly and let the sump down into the hose.",
      why: "Slowly, because a plug that comes out in one turn comes out with the oil behind it. The hose is already connected to the down-tower tank before the plug moves.",
      turn: { turns: 1.5, axis: "y", label: "DRAIN" },
    },
    {
      id: "sample", kind: "select", target: "sample-bottle",
      title: "Draw the oil sample mid-stream",
      cue: "Bottle into the stream once it is running clean, not the first of it and not the last.",
      why: "The first of the flow carries whatever settled in the drain and the last carries the sump floor. The mid-stream sample is the one that represents the oil the gearbox has actually been running on.",
    },
    {
      id: "brake-pads", kind: "gauge", target: "pad-gauge",
      title: "Gauge the yaw brake pads",
      cue: "Measure each pad and commit inside the wear limit.",
      why: "The yaw brake is what holds the nacelle against a wind shift. Pads below the limit let the nacelle walk under load, and a nacelle that walks tears the tower cable loop it is hanging on.",
      gauge: { label: "PAD mm", speed: 0.75, green: [0.46, 0.64], readout: (t) => `${(2 + t * 16).toFixed(1)} mm`, missNote: "Under the wear limit — that pad set is a replacement, not a sign-off." },
    },
    {
      id: "torque", kind: "hold", target: "torque-wrench", seconds: 4,
      title: "Refit and torque the drain plug",
      cue: "New sealing washer, plug in, and hold the wrench to the click.",
      why: "A gearbox drain plug backing out is eight hundred litres of oil down a tower and a machine destroyed. New washer, right figure, held to the click.",
      holdBreakNote: "Came off before the click — that plug is not to torque. Set it again.",
    },
    {
      id: "close", kind: "find", noHint: true,
      targets: ["chafed-cable", "loose-guard"],
      itemNames: { "chafed-cable": "chafed converter cable", "loose-guard": "loose coupling guard" },
      itemNotes: {
        "chafed-cable": "A converter cable is rubbing on the frame where the nacelle flexes. Chafed through, that is an arc inside a fibreglass box full of oil mist.",
        "loose-guard": "The high-speed coupling guard has two of its four fasteners. The coupling behind it turns at fifteen hundred rpm the moment the rotor is released.",
      },
      title: "Walk the nacelle before you close it",
      cue: "Look over the converter, the couplings and the frame before the hatch shuts; click what needs reporting.",
      why: "The next person up this tower might be six months away. What gets written down today is what gets fixed before the machine finds it.",
    },
  ],

  // Two things that happen inside a nacelle while the tech's head is in the
  // gearbox and the wind is doing what wind does.
  interrupts: [
    {
      id: "wind-freshening",
      kind: "Wind rising",
      after: "drain", delay: 4, seconds: 12,
      alert: "The nacelle has started to buffet and the anemometer readout on the controller has climbed hard.",
      cue: "You have an open hatch and a wind limit.",
      target: "anemometer",
      why: "The limit is not a formality — above it the hatch cannot be controlled, tools go out of it, and rescue from height stops being available. The anemometer is read again the moment the nacelle starts to move, not at the end of the task.",
      missNote: "You worked through it with the hatch open. Nothing went out of it this time. The wind decided that, not you — and the rescue plan you were relying on had already stopped being valid.",
      wrongNote: "It is the anemometer. When the nacelle starts buffeting, the first thing you do is find out what the wind is actually doing.",
    },
    {
      id: "hatch-open",
      kind: "Open hatch unguarded",
      after: "sample", delay: 3, seconds: 11,
      alert: "The hoist hatch guard has been knocked back off its catch. The hatch is open and unguarded behind you.",
      cue: "There is an eighty-five metre hole in this floor.",
      target: "hoist-hatch",
      why: "An open hatch is only safe while it is guarded and attended. The guard exists because the nacelle is cramped, the floor is oily, and the thing behind you is not a hazard you can keep in your head while your hands are in a gearbox.",
      missNote: "The hatch stayed open and unguarded for the rest of the service. A dropped wrench through it reaches the ground at over forty metres a second, and the crew at the tower base had no reason to expect anything coming down.",
      wrongNote: "It is the hatch. Guard it or close it before you touch anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, WN_ACCENT);

    // ------------------------------------------------------- nacelle interior
    // A fibreglass tube with a floor, ribs and the drive train down one side,
    // opened up so the learner can stand in it rather than crawl.
    const NW = 2.5, ND = 4.2, NH = 2.0;
    const shellG = group(g, 0, 0, -0.3);
    box(shellG, NW, 0.14, ND, 0, -0.07, 0, 0x4a5157,
      { rough: 0.9, finish: "grating", tile: [3, 5], cast: false });                 // floor grating
    for (const sx of [-1, 1]) {
      box(shellG, 0.12, NH, ND, sx * NW / 2, NH / 2, 0, 0xd9dde2,
        { rough: 0.82, finish: "painted", tile: [4, 2], cast: false });
    }
    box(shellG, NW, 0.12, ND, 0, NH, 0, 0xc6ccd2, { rough: 0.85, finish: "painted", tile: [3, 4], cast: false });
    box(shellG, NW, NH, 0.12, 0, NH / 2, -ND / 2, 0xd0d5da, { rough: 0.82, finish: "painted", tile: [3, 2], cast: false });
    // Ribs, which is what a nacelle actually looks like from the inside.
    for (let i = -2; i <= 2; i++) {
      for (const sx of [-1, 1]) {
        box(shellG, 0.06, NH - 0.2, 0.09, sx * (NW / 2 - 0.08), (NH - 0.2) / 2, i * 0.8, 0x9aa3ab,
          { rough: 0.7, metal: 0.3, cast: false });
      }
    }

    // ------------------------------------------------------------ drive train
    const train = group(shellG, -0.55, 0, -0.5);
    // Low-speed shaft coming in from the rotor, gearbox, high-speed coupling.
    const lss = cyl(train, 0.19, 0.19, 1.1, 0, 0.62, -1.15, 0x59636d,
      { rough: 0.5, metal: 0.6, seg: 20, finish: "brushed" });
    lss.rotation.x = Math.PI / 2;
    const gearbox = box(train, 0.84, 0.86, 1.15, 0, 0.6, 0, 0x2f6f5f,
      { rough: 0.55, metal: 0.35, finish: "painted", tile: [2, 2] });
    holoTag(train, "Gearbox", 0, 1.2, 0, { css: "#6ee7b7", w: 0.26 });
    for (let i = 0; i < 5; i++) {                                                   // cooling ribs
      box(train, 0.88, 0.04, 0.07, 0, 0.28 + i * 0.16, 0.6, 0x28604f, { rough: 0.6, metal: 0.35, cast: false });
    }
    const hss = cyl(train, 0.075, 0.075, 0.7, 0, 0.6, 0.9, 0x8b929a,
      { rough: 0.4, metal: 0.8, seg: 16, finish: "brushed" });
    hss.rotation.x = Math.PI / 2;
    const coupGuard = box(train, 0.3, 0.3, 0.34, 0, 0.6, 1.05, 0xf2a23b, { rough: 0.6, finish: "painted", tile: [1, 1] });
    holoTag(train, "Coupling guard", 0, 0.92, 1.05, { css: "#f2a23b", w: 0.28 });
    reg(hits, coupGuard, "loose-guard");

    // Drain plug, sump thermometer and the hose that takes the oil down-tower.
    const drainPlug = group(train, 0.44, 0.18, 0.1);
    cyl(drainPlug, 0.045, 0.045, 0.06, 0, 0, 0, 0xd8b23a, { rough: 0.45, metal: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    box(drainPlug, 0.03, 0.07, 0.07, 0.04, 0, 0, 0xd8b23a, { rough: 0.45, metal: 0.7 });
    holoTag(train, "Drain plug", 0.5, 0.36, 0.1, { css: "#d8b23a", w: 0.24 });
    reg(hits, drainPlug, "drain-plug");
    const oilJet = particles(drainPlug, 30, 0x8a6a2a, { size: 0.016, life: 0.4, additive: false, opacity: 0.75 });
    const hose = cyl(shellG, 0.04, 0.04, 1.5, 0.1, 0.1, 0.9, 0x2b3138, { rough: 0.85, seg: 10, finish: "rubber", cast: false });
    hose.rotation.z = 0.5;

    const thermo = instrument(train, 0.46, 0.85, -0.3, { ry: 1.2, idle: "-- °C", color: 0x6ee7b7 });
    holoTag(train, "Sump temperature", 0.46, 1.0, -0.3, { css: "#6ee7b7", w: 0.3 });
    reg(hits, thermo, "oil-thermo");

    const shield = box(shellG, 0.5, 0.42, 0.03, -0.05, 0.3, -0.34, 0x4fd1ff,
      { rough: 0.3, metal: 0.1, opacity: 0.4, transparent: true });
    shield.visible = false;
    const shieldStow = box(shellG, 0.46, 0.05, 0.4, 0.85, 0.06, -1.3, 0x4fd1ff,
      { rough: 0.3, opacity: 0.55, transparent: true });
    holoTag(shellG, "Splash shield", 0.85, 0.3, -1.3, { css: "#4fd1ff", w: 0.28 });
    reg(hits, shieldStow, "splash-shield");

    // ------------------------------------------------------------ the locks
    const rotorPin = group(shellG, -0.9, 0, -1.85);
    cyl(rotorPin, 0.035, 0.035, 0.5, 0, 0.62, 0, 0xd8232a, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(rotorPin, 0.07, 0.11, 0.07, -0.28, 0.62, 0, 0xd8232a, { rough: 0.5 });
    holoTag(shellG, "Rotor lock pin", -0.9, 0.94, -1.85, { css: "#f0645b", w: 0.3 });
    reg(hits, rotorPin, "rotor-pin");

    const yawLock = group(shellG, 0.8, 0, -1.7);
    box(yawLock, 0.26, 0.2, 0.22, 0, 0.1, 0, 0x59636d, { rough: 0.55, metal: 0.5, finish: "painted", tile: [1, 1] });
    const yawLever = box(yawLock, 0.05, 0.22, 0.05, 0, 0.28, 0.04, 0xf2c14b, { rough: 0.5 });
    holoTag(yawLock, "Yaw brake lock", 0, 0.48, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, yawLock, "yaw-lock");

    const conv = equipmentCabinet(shellG, 0.55, 1.1, 0.35, 0.92, 0.9, { ry: -0.35, color: 0x5d6873 });
    holoTag(conv, "Converter", 0, 1.35, 0, { css: "#6ee7b7", w: 0.24 });
    const convHandle = box(conv, 0.06, 0.16, 0.05, 0.16, 0.8, 0.2, 0xd8232a, { rough: 0.5 });
    reg(hits, convHandle, "converter-lock");
    const chafed = cyl(conv, 0.022, 0.022, 0.5, -0.2, 0.5, 0.2, 0x8a3f33, { rough: 0.8, seg: 8 });
    chafed.rotation.z = 0.3;
    reg(hits, chafed, "chafed-cable");

    const lockBox = group(shellG, -1.0, 0, 0.5);
    box(lockBox, 0.3, 0.36, 0.14, 0, 0.95, 0, 0xd8232a, { rough: 0.6, finish: "painted", tile: [1, 1] });
    for (let i = 0; i < 3; i++) lockTag(lockBox, -0.08 + i * 0.08, 1.16, 0.08, { color: [0xd8232a, 0x1f7ae0, 0xf2c14b][i] });
    box(lockBox, 0.07, 0.9, 0.07, 0, 0.45, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    holoTag(lockBox, "Group lock box", 0, 1.32, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, lockBox, "lock-box");

    // -------------------------------------------------------- hatch + access
    const hatch = group(shellG, 0.6, 0, 1.5);
    const hatchLid = box(hatch, 0.62, 0.05, 0.62, 0, 0.02, 0, 0x6b737b,
      { rough: 0.7, metal: 0.4, finish: "grating", tile: [2, 2] });
    const hatchHole = box(hatch, 0.58, 0.02, 0.58, 0, -0.06, 0, 0x05070a, { rough: 1, cast: false });
    hatchHole.visible = false;
    const hatchRail = group(hatch, 0, 0, 0);
    for (const [dx, dz] of [[-0.34, 0], [0.34, 0], [0, -0.34], [0, 0.34]]) {
      box(hatchRail, dx ? 0.04 : 0.7, 0.9, dz ? 0.04 : 0.7, dx, 0.45, dz, 0xf2c14b, { rough: 0.6, cast: false });
    }
    hatchRail.visible = false;
    holoTag(hatch, "Hoist hatch", 0, 0.3, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, hatchLid, "hoist-hatch");

    // -------------------------------------------------------- fall protection
    const gearRack = group(shellG, -1.0, 0, 1.55);
    box(gearRack, 0.08, 1.7, 0.08, 0, 0.85, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const harness = box(gearRack, 0.3, 0.44, 0.12, 0.1, 1.1, 0.06, 0x2f6f8c, { rough: 0.85 });
    holoTag(gearRack, "Harness", 0.1, 1.4, 0.06, { css: "#2f6f8c", w: 0.22 });
    reg(hits, harness, "harness");
    const lanyard = group(gearRack, -0.16, 0.8, 0.05);
    for (const dx of [-0.04, 0.04]) cyl(lanyard, 0.012, 0.012, 0.44, dx, 0, 0, 0xf2c14b, { rough: 0.8, seg: 8 });
    holoTag(gearRack, "Twin lanyard", -0.16, 1.08, 0.05, { css: "#f2c14b", w: 0.26 });
    reg(hits, lanyard, "twin-lanyard");
    const anchor = torus(shellG, 0.07, 0.014, 0.1, 1.82, -0.4, 0x59c97b,
      { rough: 0.45, metal: 0.7, seg: 8, seg2: 18 });
    anchor.rotation.x = Math.PI / 2;
    holoTag(shellG, "Rated anchor", 0.1, 1.96, -0.4, { css: "#59c97b", w: 0.26 });
    reg(hits, anchor, "anchor-point");
    // The trap: moving across the nacelle without transferring.
    const walkway = box(shellG, 0.5, 0.03, 1.2, 0.55, 0.02, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(shellG, "Step across?", 0.55, 0.36, 0.3, { css: "#f0645b", w: 0.26 });
    reg(hits, walkway, "unclipped");

    // ----------------------------------------------------------- instruments
    const anem = instrument(shellG, -0.95, 1.45, -1.2, { ry: 0.6, idle: "-- m/s", color: 0x6ee7b7 });
    // The controller's over-speed lamp. Dark all run, until the wind makes the
    // decision for you.
    const windLamp = ball(shellG, 0.03, -0.78, 1.58, -1.18, 0xf0645b, { emissive: 0xf0645b, ei: 2.6 });
    windLamp.visible = false;
    holoTag(shellG, "Nacelle anemometer", -0.95, 1.62, -1.2, { css: "#6ee7b7", w: 0.34 });
    reg(hits, anem, "anemometer");
    const padGauge = instrument(shellG, 1.0, 0.95, -0.9, { ry: -0.8, idle: "-- mm", color: 0xf2c14b });
    holoTag(shellG, "Pad gauge", 1.0, 1.12, -0.9, { css: "#f2c14b", w: 0.24 });
    reg(hits, padGauge, "pad-gauge");
    // Yaw brake calipers on the ring below, visible through the floor grating.
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      box(shellG, 0.14, 0.12, 0.2, Math.sin(a) * 0.75, -0.14, Math.cos(a) * 0.75 - 1.4, 0x59636d,
        { rough: 0.6, metal: 0.45, cast: false });
    }

    const chest = toolChest(shellG, -0.95, -1.0, { ry: 0.6, color: 0x6ee7b7 });
    const wrench = box(chest, 0.05, 0.05, 0.4, 0.02, 0.8, 0.04, 0xdfe4e8, { rough: 0.35, metal: 0.75, finish: "brushed", tile: [1, 2] });
    holoTag(chest, "Torque wrench", 0.02, 0.96, 0.04, { css: "#dfe4e8", w: 0.28 });
    reg(hits, wrench, "torque-wrench");
    const bottle = cyl(chest, 0.035, 0.035, 0.11, -0.16, 0.82, 0.04, 0xdfe8ee, { rough: 0.2, opacity: 0.7, transparent: true, seg: 14 });
    holoTag(chest, "Sample bottle", -0.16, 0.96, 0.04, { css: "#bfeaf7", w: 0.26 });
    reg(hits, bottle, "sample-bottle");
    // A hot-crack trap: the drain with no shield up.
    const hotTrap = box(train, 0.2, 0.2, 0.2, 0.52, 0.18, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hotTrap, "hot-oil");
    // Rotor free trap, at the shaft rather than the pin.
    reg(hits, lss, "unlocked-rotor");
    // Yaw free trap, on the yaw ring below the grating.
    const yawRing = torus(shellG, 0.8, 0.05, 0, -0.16, -1.4, 0x3a4048, { rough: 0.7, metal: 0.4, seg: 8, seg2: 28, cast: false });
    yawRing.rotation.x = Math.PI / 2;
    reg(hits, yawRing, "yaw-free");

    const order = holoPanel(shellG, 0.56, 0.4, -1.05, 1.5, 0.05, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#6ee7b7"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("WORK ORDER · WTG-14 NACELLE", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("GEARBOX OIL + YAW BRAKE", w * 0.06, h * 0.32);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Wind limit for this task: 12 m/s", "Locks: rotor pin, yaw brake, converter",
       "Group lock box — personal lock required", "Oil drain window 55-75 °C",
       "Yaw pad wear limit 9 mm", "Drain plug 95 Nm, new washer"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: 0.5 });
    reg(hits, order, "work-order");

    standingFigure(shellG, -0.2, 2.6, { ry: 3.0, cloth: 0x2b3138, vest: 0x6ee7b7, helmet: 0xf2f2f2 });

    let buffet = 0, drained = 0, shieldUp = false, windAlarm = false;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "locks") {
          rotorPin.position.x += 0.14;
          yawLever.rotation.z = -1.0;
          convHandle.rotation.z = -1.0;
        }
        if (step.id === "shield") { shieldUp = true; shield.visible = true; shieldStow.visible = false; }
        if (step.id === "hatch") { hatchLid.rotation.x = -1.2; hatchHole.visible = true; hatchRail.visible = true; }
        if (step.id === "drain") { drained = 1; }
        if (step.id === "torque") { drained = 0; }
        if (step.id === "close") { hatchLid.rotation.x = 0; hatchHole.visible = false; hatchRail.visible = false; }
      },

      // The nacelle really buffets, and the hatch guard really falls away.
      onInterrupt(it) {
        if (it.id === "wind-freshening") {
          buffet = 1; windAlarm = true;
          windLamp.visible = true;
          // Tilt now rather than waiting for the next animate frame, so the
          // nacelle has visibly moved the instant the alert lands.
          shellG.rotation.z = 0.013;
        }
        if (it.id === "hatch-open") { hatchRail.visible = false; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-freshening") { buffet = 0; windAlarm = false; windLamp.visible = false; shellG.rotation.z = 0; }
        if (it.id === "hatch-open") { hatchRail.visible = true; }
      },

      onHazard(hitId) {
        if (hitId === "hot-oil" && !shieldUp) { oilJet.visible = true; drained = 1; }
      },

      animate(t, dt, session) {
        // A nacelle at ninety metres is never quite still; when the wind
        // freshens it stops being subtle.
        shellG.rotation.z = Math.sin(t * 1.1) * (0.0015 + buffet * 0.012);
        if (drained) {
          oilJet.visible = true;
          oilJet.userData.step(dt, new THREE.Vector3(0.6, -0.4, 0), 0.03, 0.5, -2.2);
        } else if (oilJet.visible) oilJet.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "wind-check") {
          repaint(anem.userData.screen, signFace(`${(gg.t * 28).toFixed(1)}`, {
            bg: "#0d1c14", accent: gg.t > 0.16 && gg.t < 0.44 ? "#59c97b" : "#f0645b", fg: "#bff7d4", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "oil-temp") {
          repaint(thermo.userData.screen, signFace(`${Math.round(20 + gg.t * 90)}C`, {
            bg: "#1c1408", accent: gg.t > 0.38 && gg.t < 0.6 ? "#59c97b" : "#f2c14b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "brake-pads") {
          repaint(padGauge.userData.screen, signFace(`${(2 + gg.t * 16).toFixed(1)}`, {
            bg: "#1c1408", accent: gg.t > 0.44 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
        if (windAlarm) anem.userData.screen.material.emissiveIntensity = 1.2 + Math.sin(t * 8) * 0.6;
      },
    };
  },
};
