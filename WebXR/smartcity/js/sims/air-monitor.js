import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, equipmentCabinet, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Perimeter Air VR — Environmental Monitoring, station two.
// A real-time particulate monitoring line around an excavation on a
// contaminated site: the fence-line instruments are the neighbourhood's only
// live protection from what the dig lifts, and the technician's job is to
// place them where the wind says, prove they read true, and act on an
// exceedance the way the Air Monitoring Plan requires — stop, wet, notify —
// never mute it.

const AM_ACCENT = 0x9fd8c0;

export const SIM_AIR_MONITOR = {
  id: "air-monitor",
  index: "22",
  domain: "Environmental",
  trade: "Environmental monitoring technician",
  category: "Environmental Monitoring",
  weather: "wind",
  certification: "LIUNA hazmat & environmental laborer — OSHA HAZWOPER 40-hour (29 CFR 1910.120); perimeter air monitoring under a site-specific Air Monitoring Plan required by the EPA / state cleanup order",
  name: "Perimeter Air",
  title: simTitle("Perimeter Air"),
  tagline: "Real-time PM10 fence-line monitoring: wind, placement, flow calibration, zero check, and the exceedance response",
  accent: AM_ACCENT,
  accentCss: "#9fd8c0",
  parSeconds: 235,
  footprint: 2.4,
  badge: { id: "fence-line-true", name: "Fence Line True", note: "Monitors placed by the wind, proven at zero and flow, and an exceedance answered by the plan" },

  game: system({
    name: "Air Watch",
    currency: "READING",
    ranks: ["Monitor Tech", "Line Lead", "Plan Holder", "Exceedance Ready", "Air Watch Certified"],
    badges: [
      { id: "by-the-wind", name: "By the Wind", note: "Placed upwind before downwind, first time", test: AWARD.stepClean("placement") },
      { id: "never-muted", name: "Never Muted", note: "Never bypassed or muted a monitor alarm", test: AWARD.safe },
      { id: "flow-true", name: "Flow True", note: "Held flow and zero inside spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-line", name: "Clean Line", note: "No corrections anywhere on the line", test: AWARD.clean },
      { id: "zero-held", name: "Zero Held", note: "Never broke the zero check", test: AWARD.unbroken },
      { id: "shift-ready", name: "Shift Ready", note: "Line up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "alarm-mute": "You muted the monitor. The alarm is the plan's trigger — mute it and the excavator keeps lifting dust across a fence line with houses on the other side, and the record shows a technician chose that. Stop, wet, notify; the mute button is not a response.",
    "monitor-in-exhaust": "You set the monitor beside the generator exhaust. It will read the engine, not the site — a false high shuts the job for nothing, and worse, a monitor you learn to distrust is one nobody acts on when it is right.",
    "zone-no-respirator": "You walked into the exclusion zone without your respirator on. The perimeter instruments are for the neighbours; inside the fence, the protection is what is on your face, and the monitors will not warn you in time.",
    "refuel-running": "You went to refuel the generator while it was running. Fuel on a hot engine beside the instruments is a fire, and the plume of a fire is the one exceedance the plan cannot answer.",
  },

  lateNotes: {
    "flow-cal": "The sampler is not placed yet — read the plan and the wind, set the monitors, then calibrate them where they stand.",
    "data-logger": "Nothing to log until the monitors are calibrated and zeroed; a logger recording an unproven instrument is a record of nothing.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "amp-board",
      title: "Read the Air Monitoring Plan",
      cue: "Check the action level, the monitor count and the placement rule before you touch an instrument.",
      why: "The plan sets the monitor count, the placement rule relative to the wind, the PM10 level that triggers action and exactly what that action is. A crew that starts placing before reading it is defending numbers it never agreed were the trigger, and a regulator does not accept 'we thought' as the standard when the exceedance record gets pulled.",
    },
    {
      id: "wind", kind: "select", target: "wind-vane",
      title: "Check the wind",
      cue: "Read the vane and the anemometer — direction and speed decide where the monitors go.",
      why: "Upwind gives you the neighbourhood's background dust; downwind gives you everything the dig adds on top of it. Get the direction wrong and the unit you call downwind is reading the wrong side of the fence, so a real exceedance can pass unflagged while a clean reading gets logged as a violation.",
    },
    {
      id: "placement", kind: "sequence",
      targets: ["monitor-upwind", "monitor-downwind"],
      itemNames: { "monitor-upwind": "upwind monitor", "monitor-downwind": "downwind monitor" },
      title: "Place the monitors by the wind",
      cue: "Upwind first, for background — then the downwind monitor on the fence line.",
      why: "The upwind reading is the number every downwind reading gets compared against, so it has to be logging first. A downwind unit powered up alone has nothing to subtract from and no way to prove the dust it reads came from the site rather than the street — placing them out of order breaks that pairing for the whole shift.",
      outOfOrderNote: "Upwind first — the background is what makes the downwind reading mean anything.",
    },
    {
      id: "flow", kind: "gauge", target: "flow-cal",
      title: "Calibrate the sampler flow",
      cue: "Set the sampler to its rated flow against the calibrator and commit inside the band.",
      why: "A PM10 inlet only cuts particles at ten microns when it is pulling air at its rated flow. Run it high or low and the size cut moves with it, so the number the plan compares to the action level is measuring a different, uncalibrated slice of the dust — an exceedance call built on it will not hold up.",
      gauge: {
        label: "FLOW", speed: 0.75, green: [0.45, 0.6],
        readout: (t) => `${(1.4 + t * 1.2).toFixed(2)} L/min`,
        missNote: "Off the rated flow — the size cut is wrong. Reset and bring it into the band.",
      },
    },
    {
      id: "zero", kind: "hold", target: "zero-filter", seconds: 5,
      title: "Run the zero check",
      cue: "Hold the HEPA zero filter on the inlet until the reading settles at zero.",
      why: "A monitor that will not settle at zero on filtered air is reading something about itself, not the site, and every number it produces afterward carries that same offset. The zero check is the only proof that what climbs above the action level later is dust off the dig, not drift in the instrument.",
      holdBreakNote: "Filter lifted early — the reading never settled. Hold it on until it reads zero.",
    },
    {
      id: "logger", kind: "select", target: "data-logger",
      title: "Start the logger with synced time",
      cue: "Sync the clock, then start logging on both monitors.",
      why: "An exceedance is a reading, a wind direction and a time stamped together, and two loggers running a minute apart turn that into two different stories neither one can settle by itself. Syncing the clocks before logging starts is what lets the regulator, and the next shift, trust the record as one account of the event.",
    },
    {
      id: "telemetry", kind: "turn", target: "antenna-mast",
      title: "Raise and lock the telemetry mast",
      cue: "Wind the mast up until it locks — the readings go to the site trailer live.",
      why: "A fence-line monitor that alarms with nobody watching it has done nothing for however long it takes someone to walk by. Telemetry puts the live reading in the site trailer and on the health and safety officer's phone the instant it climbs, which is the only way an exceedance gets a response inside the window the plan assumes.",
      turn: { turns: 0.75, axis: "y", label: "MAST" },
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["inlet-clog"],
      itemNames: { "inlet-clog": "blocked inlet" },
      itemNotes: { "inlet-clog": "The downwind inlet screen is packed with dust from yesterday. Blocked, it reads low — the one direction a fence-line monitor must never be wrong." },
      title: "Walk the line and find the fault",
      cue: "Inspect each inlet and click the one that is not sampling true.",
      why: "Calibration only proves the flow through a clean inlet; it says nothing about the inlet an hour later. A packed screen fails quietly and low, and low is the one direction a fence-line monitor can never be wrong in — it is the difference between an exceedance the plan catches and one that reaches the houses unlogged.",
    },
    {
      id: "exceedance", kind: "sequence",
      targets: ["stop-excavator", "wet-down", "notify-hso"],
      itemNames: { "stop-excavator": "stop the excavator", "wet-down": "wet the work face", "notify-hso": "notify the health and safety officer" },
      title: "Answer the exceedance",
      cue: "The downwind monitor alarms above the action level: stop the dig, wet the face, notify — in that order.",
      why: "Stopping removes the source, wetting holds down what is already loose, and the notification starts the clock on the decision to restart — in that order, because nothing else in the response helps while the excavator is still lifting dust into the same wind that carries it across the fence. The mute button is not a step in this sequence.",
      outOfOrderNote: "Stop the source first — nothing else in the response helps while the excavator is still lifting dust.",
    },
    {
      id: "log", kind: "select", target: "field-log",
      title: "Log the exceedance",
      cue: "Record the time, wind, reading, and the actions taken.",
      why: "The regulators, the neighbours and the next shift all read the same entry, so what was measured, what was done about it and when has to go in while it is still true, not reconstructed from memory at the end of the day. A page of numbers with no narrative around it proves nothing to anyone who asks later.",
    },
  ],

  // Two things that happen while the technician is heads-down on the line:
  // a colleague about to refuel a live generator, and a visitor drifting
  // toward the exclusion zone with no respirator. See shared/game.js.
  interrupts: [
    {
      id: "hot-refuel",
      kind: "Hot refuel",
      after: "logger", delay: 4, seconds: 12,
      alert: "A labourer has walked up with a fuel can and is about to top off the generator while the engine is still running.",
      cue: "The engine beside the instruments is live and someone is about to pour fuel next to it.",
      target: "gen-cutoff",
      why: "A generator's fuel tank sits inches from a hot engine block and an exposed exhaust, and pouring fuel onto or near either one is how a splash becomes a flash fire — the plume from that fire is the one exceedance the Air Monitoring Plan has no response for, because it cannot be stopped, wetted or waited out like dust. Killing the engine before the can is opened is the whole difference between a routine refuel and a site fire next to a set of instruments nobody can then get near.",
      missNote: "The engine kept running while the fuel can was open beside it. Nothing caught this time, but the exposure was real: a hot-refuel fire at a monitoring line burns the instruments the neighbourhood depends on along with whoever is standing there.",
      wrongNote: "It is the generator's cutoff switch. Kill the engine before that fuel can opens anywhere near it.",
    },
    {
      id: "unauthorized-entry",
      kind: "Unescorted visitor",
      after: "telemetry", delay: 3, seconds: 12,
      alert: "A subcontractor from another crew is walking toward the exclusion zone gap with no respirator on.",
      cue: "Someone with no protection on their face is closing on the fence.",
      target: "warn-horn",
      why: "Inside the fence, the perimeter monitors are not protection for anyone standing there — they exist for the houses beyond it, and the only thing standing between a worker's lungs and the site's air is what is on their face. The horn is loud enough to be heard over site noise and is the one way to stop somebody before they cross a line the monitors were never built to warn them about in time.",
      missNote: "They walked into the exclusion zone with no respirator and nobody called it. The perimeter line was reading the neighbourhood's exposure while a worker took the site's exposure straight, with no warning at all.",
      wrongNote: "Sound the horn. That is the only thing that reaches someone already walking toward the gap.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, AM_ACCENT);

    // Excavation with a fence line across the pad: the dig on the left, the
    // neighbourhood side on the right.
    box(g, 5.6, 0.14, 5.0, 0, 0.07, 0, 0x6b6558, { rough: 0.98 });
    const pit = box(g, 2.0, 0.6, 1.6, -1.5, -0.2, -0.6, 0x3d3830, { rough: 0.98 });
    const dust = particles(g, 80, 0xc9b99a, { size: 0.03, life: 1.2, additive: false, opacity: 0.45 });
    // Excavator silhouette at the pit.
    const excav = group(g, -1.5, 0.14, -1.5, 0.4);
    box(excav, 0.9, 0.5, 0.7, 0, 0.45, 0, 0xe8b02e, { rough: 0.6 });
    box(excav, 1.2, 0.16, 0.16, 0.8, 0.9, 0, 0xe8b02e, { rough: 0.6 }).rotation.z = 0.5;
    for (const sx of [-0.35, 0.35]) box(excav, 1.0, 0.24, 0.16, 0, 0.12, sx, 0x2b2f34, { rough: 0.8 });
    reg(hits, excav, "stop-excavator");
    // Fence line with a barrier panel run.
    for (const z of [-1.6, -0.3, 1.0]) barrierPanel(g, 0.9, z, { ry: Math.PI / 2, color: 0xe4622a });
    // Houses beyond the fence — the point of the whole line.
    for (const [z, c] of [[-1.4, 0xd9cbb2], [0.2, 0xc9c0ac], [1.6, 0xd4c2a8]]) {
      const h = group(g, 2.4, 0.14, z);
      box(h, 0.7, 0.6, 0.6, 0, 0.3, 0, c, { rough: 0.95 });
      box(h, 0.8, 0.02, 0.7, 0, 0.62, 0, 0x5a4a3c, { rough: 0.9 });
    }

    // ---------------------------------------------------------- plan board
    const boardPost = group(g, 0.2, 0, 1.9, -0.5);
    holoPanel(boardPost, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0b1a16"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9fd8c0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("AIR MONITORING PLAN — PARCEL 7 DIG", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#dff3ea";
      ["PM10, real-time, 15-min average", "Action level: 50 µg/m³ above upwind", "Monitors: 1 upwind, 1 downwind",
       "Flow: 2.0 L/min, zero check each shift", "Exceedance: STOP · WET · NOTIFY HSO", "Log every event, synced time"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.3 + i * 0.11));
      });
    }, { accent: AM_ACCENT });
    reg(hits, boardPost, "amp-board");

    // ------------------------------------------------------------ wind vane
    const vane = group(g, 1.4, 0, 1.6);
    cyl(vane, 0.02, 0.02, 2.0, 0, 1.0, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 10 });
    const arrow = group(vane, 0, 2.05, 0, 0.9);
    box(arrow, 0.34, 0.02, 0.02, 0, 0, 0, 0xffffff, { rough: 0.5 });
    box(arrow, 0.1, 0.1, 0.01, 0.15, 0, 0, 0xd2312b, { rough: 0.5 });
    const cups = group(vane, 0, 1.75, 0);
    for (let i = 0; i < 3; i++) { const c = group(cups, 0, 0, 0, (i * Math.PI * 2) / 3); box(c, 0.16, 0.01, 0.01, 0.08, 0, 0, CITY.steel, { rough: 0.5, metal: 0.6 }); ball(c, 0.03, 0.16, 0, 0, 0x22262b, { rough: 0.6 }); }
    holoTag(vane, "wind: from the west, 3 m/s", 0, 1.4, 0.05, { css: "#9fd8c0", w: 0.4 });
    reg(hits, vane, "wind-vane");

    // ------------------------------------------------------- monitors
    function monitor(x, z, id, label) {
      const m = group(g, x, 0.14, z);
      box(m, 0.36, 0.5, 0.3, 0, 0.45, 0, 0xe8eef2, { rough: 0.5, metal: 0.2 });
      for (const [sx, sz] of [[-0.14, -0.1], [0.14, -0.1], [-0.14, 0.1], [0.14, 0.1]]) cyl(m, 0.015, 0.015, 0.2, sx, 0.1, sz, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
      cyl(m, 0.03, 0.03, 0.4, 0, 0.9, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 12 });
      const inlet = cyl(m, 0.07, 0.05, 0.12, 0, 1.15, 0, 0x2b2f34, { rough: 0.6, seg: 16 });
      const screen = decal(m, 0.28, 0.12, 0, 0.55, 0.152, signFace("-- µg/m³", { bg: "#0d1c24", accent: "#9fd8c0", fg: "#bfeaf7", scale: 0.6 }), { glow: true, ei: 0.8 });
      holoTag(m, label, 0, 0.8, 0.16, { css: "#9fd8c0", w: 0.3 });
      return { m, inlet, screen };
    }
    const up = monitor(-2.2, 1.6, "monitor-upwind", "UPWIND · background");
    reg(hits, up.m, "monitor-upwind");
    const down = monitor(0.6, -1.4, "monitor-downwind", "DOWNWIND · fence line");
    reg(hits, down.m, "monitor-downwind");
    // The clogged inlet is the downwind one — registered separately so the
    // find step can single it out from the monitor body.
    const clog = cyl(down.m, 0.072, 0.052, 0.04, 0, 1.2, 0, 0xc9b99a, { rough: 0.95, seg: 16 });
    reg(hits, clog, "inlet-clog");
    // Alarm strobe + mute button on the downwind unit.
    const strobe = ball(down.m, 0.04, 0.12, 0.98, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.2, rough: 0.4 });
    const mute = box(down.m, 0.06, 0.03, 0.02, 0.12, 0.3, 0.16, 0x22262b, { rough: 0.6 });
    decal(mute, 0.055, 0.02, 0, 0, 0.011, signFace("MUTE", { bg: "#22262b", accent: "#d2312b", scale: 0.6 }));
    reg(hits, mute, "alarm-mute");

    // ---------------------------------------------------- calibration kit
    const chest = toolChest(g, 1.6, 0.4, { ry: -0.8, color: 0x2f6f5a });
    const flowCal = instrument(chest, -0.06, 0.79, 0, { ry: 0.3, idle: "-- L/min", color: 0x9fd8c0, w: 0.12, d: 0.19 });
    holoTag(flowCal, "flow calibrator", 0, 0.16, 0, { css: "#9fd8c0", w: 0.3 });
    reg(hits, flowCal, "flow-cal");
    const zeroFilter = group(chest, 0.18, 0.72, 0.05);
    cyl(zeroFilter, 0.05, 0.05, 0.06, 0, 0, 0, 0xffffff, { rough: 0.8, seg: 16 });
    decal(zeroFilter, 0.08, 0.03, 0, 0.031, 0, signFace("HEPA ZERO", { bg: "#ffffff", accent: "#0d1c24", scale: 0.5 })).rotation.x = -Math.PI / 2;
    reg(hits, zeroFilter, "zero-filter");

    // ------------------------------------------------ logger + telemetry
    const cab = equipmentCabinet(g, 0.6, 0.9, 0.4, -0.6, 1.9, { ry: 0.2, color: 0x6f7a83 });
    const logger = instrument(cab, 0, 1.06, 0.05, { idle: "LOG: OFF", color: 0x9fd8c0, w: 0.16, d: 0.2 });
    reg(hits, logger, "data-logger");
    const mast = group(cab, 0.25, 1.05, -0.1);
    const mastPole = cyl(mast, 0.015, 0.015, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    const mastCrank = torus(mast, 0.05, 0.01, 0, 0.02, 0.06, 0xb8402f, { rough: 0.5, metal: 0.4 });
    mastCrank.rotation.x = Math.PI / 2;
    ball(mast, 0.04, 0, 0.92, 0, 0x22262b, { rough: 0.6 });
    reg(hits, mast, "antenna-mast");
    // Generator beside the cabinet — exhaust hazard and refuel hazard.
    const gen = group(g, -1.9, 0.14, 1.0, 0.3);
    box(gen, 0.6, 0.45, 0.4, 0, 0.225, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const exhaust = cyl(gen, 0.03, 0.03, 0.2, 0.25, 0.55, 0, 0x4a4e52, { rough: 0.5, metal: 0.6, seg: 10 });
    const smoke = particles(gen, 30, 0x7a7f84, { size: 0.03, life: 1.0, additive: false, opacity: 0.4 });
    const genSpot = cyl(gen, 0.3, 0.3, 0.01, 0.5, 0.005, 0.3, 0xd2312b, { rough: 0.6, opacity: 0.4, transparent: true, cast: false });
    reg(hits, genSpot, "monitor-in-exhaust");
    const fuelCan = group(gen, -0.45, 0, 0.1);
    box(fuelCan, 0.16, 0.22, 0.1, 0, 0.11, 0, 0xd2312b, { rough: 0.6 });
    reg(hits, fuelCan, "refuel-running");
    // Engine cutoff switch on the generator's side — the interrupt response,
    // separate from the fuel can it stands beside (footgun: never reg the
    // same mesh under two hit ids).
    const cutoff = group(gen, 0.25, 0.32, 0.21);
    box(cutoff, 0.08, 0.05, 0.03, 0, 0, 0, 0x22262b, { rough: 0.6 });
    const cutoffToggle = box(cutoff, 0.02, 0.03, 0.02, 0, 0.01, 0.02, 0x59c97b, { rough: 0.5 });
    cutoffToggle.material = cutoffToggle.material.clone();
    decal(cutoff, 0.07, 0.02, 0, -0.035, 0.02, signFace("ENGINE STOP", { bg: "#22262b", accent: "#d2312b", scale: 0.45 }));
    reg(hits, cutoff, "gen-cutoff");
    // A second labourer, only visible once the hot-refuel interrupt fires.
    const refueler = standingFigure(g, -2.55, 1.05, { ry: 1.0, cloth: 0xe4622a });
    refueler.visible = false;

    // ---------------------------------------------- exceedance response
    const hose = group(g, -0.6, 0.14, -0.9, 0.5);
    cyl(hose, 0.03, 0.03, 0.5, 0, 0.03, 0, 0x2f7d4a, { rough: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    cyl(hose, 0.02, 0.03, 0.12, 0.3, 0.04, 0, 0xb8b0a0, { rough: 0.5, metal: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(hose, "water — wet down", 0, 0.2, 0, { css: "#9fd8c0", w: 0.3 });
    reg(hits, hose, "wet-down");
    const spray = particles(hose, 50, 0x6fb4d8, { size: 0.02, life: 0.5, additive: false, opacity: 0.7 });
    const hso = standingFigure(g, 0.3, 1.2, { ry: -0.6, cloth: 0xe4622a });
    holoTag(hso, "health & safety officer", 0, 1.9, 0, { css: "#9fd8c0", w: 0.36 });
    reg(hits, hso, "notify-hso");
    // Field log on the cabinet's side.
    const log = group(cab, -0.35, 0.9, 0.22, 0.4);
    box(log, 0.2, 0.26, 0.02, 0, 0, 0, 0x1b1e22, { rough: 0.6 });
    decal(log, 0.18, 0.24, 0, 0, 0.011, signFace("FIELD LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.5 }));
    reg(hits, log, "field-log");
    // Exclusion-zone entry point without PPE — hazard.
    const gap = group(g, 0.9, 0.14, 0.4);
    cone(gap, 0, -0.3); cone(gap, 0, 0.3);
    const gapSpot = cyl(gap, 0.25, 0.25, 0.01, 0, 0.005, 0, 0xd2312b, { rough: 0.6, opacity: 0.35, transparent: true, cast: false });
    holoTag(gap, "EXCLUSION ZONE — respirator required", 0, 0.7, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, gapSpot, "zone-no-respirator");
    // Warning horn mounted on the gate post — the unauthorized-entry
    // interrupt's answer, distinct from the hazard marker above.
    const horn = group(gap, 0, 0.9, -0.32);
    cyl(horn, 0.05, 0.08, 0.12, 0, 0, 0, 0xd9a441, { rough: 0.5, metal: 0.4, seg: 12 });
    const hornLight = ball(horn, 0.04, 0, 0.08, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.3, rough: 0.4 });
    hornLight.material = hornLight.material.clone();
    reg(hits, horn, "warn-horn");
    // The unescorted visitor, only visible once that interrupt fires.
    const visitor = standingFigure(g, 2.2, 0.95, { ry: -2.1, cloth: 0xc9a227 });
    visitor.visible = false;

    let alarming = false, logging = false, placed = 0;
    let unauthorized = false, engineOff = false;
    const strobeOn = (on) => { strobe.material.emissiveIntensity = on ? 2.4 : 0.2; };

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -0.4),
      onStep(step) {
        if (step.id === "exceedance") { alarming = true; repaint(down.screen, signFace("184 µg/m³ !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.6 })); }
      },
      onStepComplete(step) {
        if (step.id === "placement") { placed = 2; repaint(up.screen, signFace("21 µg/m³", { bg: "#0d1c24", accent: "#9fd8c0", fg: "#bfeaf7", scale: 0.6 })); repaint(down.screen, signFace("24 µg/m³", { bg: "#0d1c24", accent: "#9fd8c0", fg: "#bfeaf7", scale: 0.6 })); }
        if (step.id === "zero") repaint(down.screen, signFace("0 µg/m³ ✓", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "logger") { logging = true; repaint(logger.userData.screen, signFace("LOG: ON 08:04:00", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 })); }
        if (step.id === "inspect") clog.visible = false;
        if (step.id === "exceedance") { alarming = false; strobeOn(false); repaint(down.screen, signFace("31 µg/m³", { bg: "#0d1c24", accent: "#9fd8c0", fg: "#bfeaf7", scale: 0.6 })); }
      },
      onHazard() {},
      // The refueler really steps up to the generator, and the visitor
      // really appears at the fence gap — both are scene changes an
      // animate()-only flicker could not produce.
      onInterrupt(it) {
        if (it.id === "hot-refuel") refueler.visible = true;
        if (it.id === "unauthorized-entry") { unauthorized = true; visitor.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hot-refuel") { engineOff = true; refueler.visible = false; cutoffToggle.material = cutoffToggle.material.clone(); cutoffToggle.material.color.set(0xd2312b); }
        if (it.id === "unauthorized-entry") { unauthorized = false; visitor.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (alarming) { strobeOn(Math.floor(t * 4) % 2 === 0); dust.visible = true; dust.userData.step(dt, new THREE.Vector3(-1.5, 0.3, -0.6), 1.2, 0.5, 0.15); }
        else if (dust.visible && step?.id !== "exceedance") dust.visible = false;
        if (step?.id === "exceedance" && session.sequence.includes("wet-down")) { spray.visible = true; spray.userData.step(dt, new THREE.Vector3(-0.3, 0.2, -0.9), 0.2, 1.4, -3); }
        else if (spray.visible) spray.visible = false;
        smoke.visible = !engineOff;
        if (!engineOff) smoke.userData.step(dt, new THREE.Vector3(-1.65, 0.8, 1.0), 0.05, 0.4, 0.3);
        cups.rotation.y += dt * 2.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "flow") {
          repaint(flowCal.userData.screen, signFace(`${(1.4 + gg.t * 1.2).toFixed(2)} L/min`, { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.62 }));
        }
        if (step?.id === "zero" && session.holding) zeroFilter.position.set(0.18 - (0.6 * Math.min(1, session.holdFor)), 0.72 + 0.3 * Math.min(1, session.holdFor), 0.05);
        if (session?.turn && step?.id === "telemetry") { mastPole.scale.y = 1 + session.turn.amount / session.turn.required * 0.8; mastPole.position.y = 0.45 * mastPole.scale.y; mastCrank.rotation.z = session.turn.amount * Math.PI * 2; }
        if (unauthorized) hornLight.material.emissiveIntensity = 1.5 + Math.sin(t * 10) * 1.2;
        else hornLight.material.emissiveIntensity = 0.3;
      },
    };
  },
};
