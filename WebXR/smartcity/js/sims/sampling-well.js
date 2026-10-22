import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { plantHardHat } from "../../../shared/eggs.js";

// SmartCiti.X~ Sampling Well VR — Environmental Monitoring, station three.
// Low-flow groundwater sampling at a monitoring well on a contaminated site.
// The number that comes out of this well decides whether a plume is moving
// toward somebody's tap; the procedure exists so that number is the aquifer,
// not the technician: minimal drawdown, parameters stabilised before a bottle
// is filled, volatiles first, and a chain of custody that ties every bottle
// to this well, this hour, this person.

const SW_ACCENT = 0x6fc3d1;

export const SIM_SAMPLING_WELL = {
  id: "sampling-well",
  index: "23",
  domain: "Environmental",
  trade: "Environmental sampling technician",
  category: "Environmental Monitoring",
  weather: "overcast",
  certification: "LIUNA hazmat & environmental laborer — OSHA HAZWOPER 40-hour (29 CFR 1910.120); low-flow groundwater sampling per the EPA Region 4 SESD operating procedure; chain of custody under the site QAPP (EPA QA/G-5)",
  name: "Sampling Well",
  title: simTitle("Sampling Well"),
  tagline: "Low-flow groundwater sampling: water level, pump set, stabilised purge, volatiles first, chain of custody",
  accent: SW_ACCENT,
  accentCss: "#6fc3d1",
  parSeconds: 245,
  footprint: 2.2,
  badge: { id: "chain-unbroken", name: "Chain Unbroken", note: "A stabilised low-flow sample, bottles in order, custody signed, nothing agitated and nothing dumped" },

  game: system({
    name: "Sample Integrity",
    currency: "ALIQUOT",
    ranks: ["Sampler", "Purge Lead", "Field Chemist", "Custody Holder", "Integrity Certified"],
    badges: [
      { id: "volatiles-first", name: "Volatiles First", note: "Bottles filled in the required order, first time", test: AWARD.stepClean("bottles") },
      { id: "no-agitation", name: "No Agitation", note: "Never bailed, never dumped, never leaned in", test: AWARD.safe },
      { id: "steady-purge", name: "Steady Purge", note: "Held the purge flow steady in the low-flow band", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-draw", name: "Clean Draw", note: "No corrections anywhere in the sampling event", test: AWARD.clean },
      { id: "level-true", name: "Level True", note: "Water level and flow read inside spec", test: AWARD.precise(0.7) },
      { id: "holding-time", name: "Holding Time", note: "Sample on ice inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bailer": "You reached for the bailer. Dropping a bailer down the well agitates the column, strips volatiles and stirs sediment — the sample would be of the disturbance, not the aquifer. Low-flow means the pump, set in the screen, at a rate the well can give.",
    "purge-to-ground": "You dumped the purge water on the ground. It is groundwater from a contaminated site: it goes into the labelled purge drum for characterisation and disposal, not back into the soil beside the well you are trying to characterise.",
    "head-over-well": "You leaned your head over the open casing. A well on this site can carry hydrogen sulfide or VOC vapour at the casing; you read the meter at the opening before your face is anywhere near it.",
    "truck-idling": "The truck is idling upwind of the open bottles. Engine exhaust is a volatile organic source — it can put a detection in a VOC vial that the aquifer never had, and a false detection here is a false plume.",
  },

  lateNotes: {
    "bladder-pump": "The pump is set after the water level is measured — the level tells you where the screen and the intake belong.",
    "coc-form": "Nothing to sign yet. Custody starts when the bottles are filled, labelled and in your hand.",
  },

  // Two things that happen while the sampler is holding a control steady and
  // watching the flow cell, not the casing or the truck. See shared/game.js.
  interrupts: [
    {
      id: "vapor-alarm-purge",
      kind: "Vapor alarm mid-purge",
      after: "purge", delay: 3, seconds: 12,
      alert: "The PID left running on the tailgate starts chirping again — it's picking up something on the wind, coming off the casing you opened ten minutes ago.",
      cue: "The PID's alarming again, mid-purge.",
      target: "pid-meter",
      why: "A rising PID reading partway through the purge means the vapor at the casing has changed since the headspace screen at the start — a different slug of the plume moving through the screen at low flow can bring up something the opening reading never saw, and a stale number is not what tells you whether to mask up.",
      missNote: "The alarm went unanswered for the rest of the purge. The reading the crew went by for respiratory protection was ten minutes and one changed vapor reading out of date, and nobody at the casing knew it.",
      wrongNote: "That's not the flow reading — the PID is what's telling you what's coming off the casing right now.",
    },
    {
      id: "cap-rolls-cooler",
      kind: "Open casing",
      after: "cooler", delay: 2, seconds: 12,
      alert: "A gust catches the well cap where you set it down and starts rolling it toward the drum — the casing behind you is still open.",
      cue: "The cap's rolling away and the casing's still open.",
      target: "well-cap",
      why: "An open casing on a contaminated-site well is a path for surface water, insects and anything airborne to get into the screened interval you just spent half an hour purging clean, and it stays open exactly as long as nobody has walked back to seat it — easy to forget once your hands are full of bottles and a cooler lid.",
      missNote: "The cap sat off the casing for the drive back to the truck. Rain that afternoon put runoff straight down a well that was supposed to be sealed, and the next round of samples from this location came back with a signature nobody could explain until someone remembered the cap.",
      wrongNote: "That's not the casing — the cap that needs to go back on is the one rolling toward the drum.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "sampling-plan",
      title: "Read the sampling plan",
      cue: "Check the well, the analytes, the bottle order and the holding times before the cap comes off.",
      why: "The plan names the well, what the lab will analyse, which bottle fills first and how long each analyte has before its holding time makes the result worthless. You read it here, at the truck with the casing still capped, not at the cooler with three open bottles already waiting on you.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["nitrile-gloves", "safety-glasses"],
      itemNames: { "nitrile-gloves": "nitrile gloves", "safety-glasses": "safety glasses" },
      title: "Gloves and glasses",
      cue: "Fresh nitrile gloves for every well, glasses before the cap comes off.",
      why: "The gloves protect you from the water and, just as much, the water from you — a fingerprint of hand lotion or yesterday's well is cross-contamination the lab will report as if the aquifer put it there. A fresh pair every well is what keeps that possibility off the chain of custody entirely.",
    },
    {
      id: "headspace", kind: "select", target: "pid-meter",
      title: "Screen the casing headspace",
      cue: "Open the cap and read the PID at the casing before your face is near it.",
      why: "The casing can hold vapour that has been sitting sealed under the cap since the last visit, at a concentration nothing at ground level would predict. The meter goes to the opening first, before a face does, and the reading it gives is what decides whether this is a routine well or one that gets worked in a respirator.",
    },
    {
      id: "level", kind: "gauge", target: "level-meter",
      title: "Measure the water level",
      cue: "Lower the probe until it tones, then commit the depth to water.",
      why: "Depth to water sets where the pump's intake belongs relative to the screen, and it is the baseline every drawdown reading for the rest of the purge gets measured against. It is the first number on the field sheet because the pump placement, the purge rate and the stabilisation call all depend on it being right.",
      gauge: {
        label: "DEPTH", speed: 0.7, green: [0.46, 0.6],
        readout: (t) => `${(10 + t * 6).toFixed(2)} m`,
        missNote: "That is not the water surface — lower it until the tone, then commit. A wrong level puts the intake in the wrong place.",
      },
    },
    {
      id: "pump", kind: "drag", target: "bladder-pump",
      title: "Set the pump in the screen",
      cue: "Carry the bladder pump from the truck and lower it to the middle of the screened interval.",
      why: "The intake sits in the screen, mid-interval, so what comes up the tubing is formation water moving through that specific depth — not the stagnant casing water sitting above the screen, and not sediment stirred off the bottom by an intake set too low.",
      drag: { to: "well-socket", radius: 0.35, missNote: "Not at the casing — set the pump down the well, intake in the screen." },
    },
    {
      id: "purge", kind: "track", target: "flow-cell", seconds: 8,
      title: "Purge at low flow",
      cue: "Hold the pump rate steady in the low-flow band — enough to move water, not enough to draw the level down.",
      why: "Low flow is the whole method: a rate the well can supply without drawdown, so the sample is the aquifer moving through the screen. Too fast pulls the column down and stirs it; too slow and the parameters never stabilise.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "FLOW", readout: (v) => `${(v * 0.8).toFixed(2)} L/min` },
      holdBreakNote: "Flow dropped out of the band — the drawdown starts again. Bring it back and hold.",
    },
    {
      id: "stabilise", kind: "sequence", anyOrder: true,
      targets: ["param-ph", "param-cond", "param-do"],
      itemNames: { "param-ph": "pH", "param-cond": "conductivity", "param-do": "dissolved oxygen" },
      title: "Confirm the parameters have stabilised",
      cue: "Read pH, conductivity and dissolved oxygen off the flow cell — three consecutive readings inside the criteria.",
      why: "Stable parameters are the evidence the stagnant casing water is gone and formation water is at the pump. The bottles wait for it; a sample filled before stabilisation is a sample of the well, not the aquifer.",
    },
    {
      id: "bottles", kind: "sequence",
      targets: ["bottle-voc", "bottle-metals", "bottle-general"],
      itemNames: { "bottle-voc": "VOC vials", "bottle-metals": "metals bottle", "bottle-general": "general chemistry bottle" },
      title: "Fill the bottles in order",
      cue: "Volatiles first, zero headspace — then metals, then general chemistry.",
      why: "Volatiles leave the water every second it is exposed, so they are captured first, gently, with no air in the vial. The order is the analytes' order of fragility, not the label order.",
      outOfOrderNote: "Volatiles first — every minute the water is open, they are leaving it. The VOC vials fill before anything else.",
    },
    {
      id: "custody", kind: "select", target: "coc-form",
      title: "Sign the chain of custody",
      cue: "Label each bottle — well, date, time, sampler — and sign the form.",
      why: "From here the bottle is evidence, not just a water sample. The custody form is the unbroken line from this casing to the lab bench — well, date, time and sampler on every label, and every hand the cooler passes through afterward signs its own line on the form.",
    },
    {
      id: "cooler", kind: "hold", target: "cooler", seconds: 3,
      title: "Pack on ice",
      cue: "Bottles into the cooler, ice on top, hold the lid down until it seals.",
      why: "Most holding times are set on the assumption the sample is at 4 °C from the minute it leaves the well. Left warm on the tailgate for even an hour, the metals bottle is unaffected and the volatiles are already off-gassing out of the vial — the two analyte groups fail at completely different rates, and ice is what stops both.",
      holdBreakNote: "Lid up early — the cooler never sealed. Hold it shut.",
    },
    {
      id: "check", kind: "find", noHint: true,
      targets: ["label-mismatch"],
      itemNames: { "label-mismatch": "mislabelled bottle" },
      itemNotes: { "label-mismatch": "That vial is labelled for the next well. A wrong label is a sample that gets attributed to the wrong place — a plume that appears where it isn't and hides where it is." },
      title: "Check the labels before the truck moves",
      cue: "Read every label against the form and click the one that is wrong.",
      why: "The lab trusts the label completely — it has no other way to know which well a bottle came from. A mismatch caught here against the form is a pen stroke and a relabel; caught at the bench weeks later, it is a resample, a broken trend line and a report nobody can stand behind.",
    },
  ],

  build(root) {
    plantHardHat(root, THREE, "sampling-well", [-2.6, 1.15, 2.6]); // Hard Hat Hunt — docs/easter-egg.md
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SW_ACCENT);

    // Gravel pad with the well head at centre.
    box(g, 4.6, 0.12, 4.6, 0, 0.06, 0, 0x7a7466, { rough: 0.98 });
    const wellGrp = group(g, 0, 0.12, -0.4);
    box(wellGrp, 0.9, 0.12, 0.9, 0, 0.06, 0, 0x9a9a92, { rough: 0.95 });
    const casing = cyl(wellGrp, 0.06, 0.06, 0.6, 0, 0.42, 0, 0xe4e1d6, { rough: 0.5, seg: 16 });
    const cap = cyl(wellGrp, 0.075, 0.075, 0.05, 0, 0.74, 0, 0x2b2f34, { rough: 0.6, metal: 0.4, seg: 16 });
    // Protective steel surround with a lockable lid.
    for (const [sx, sz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) cyl(wellGrp, 0.03, 0.03, 0.9, sx, 0.57, sz, 0xe8b02e, { rough: 0.6, metal: 0.3, seg: 10 });
    holoTag(wellGrp, "MW-14 · screen 12–15 m", 0, 1.0, 0.1, { css: "#6fc3d1", w: 0.34 });
    reg(hits, cap, "well-cap");
    // Invisible drop socket at the casing mouth for the pump.
    const socket = cyl(wellGrp, 0.06, 0.06, 0.02, 0, 0.72, 0, 0xffffff, { rough: 0.5 });
    socket.visible = false;
    hits["well-socket"] = socket;
    // Leaning-over-the-casing hazard zone just above the mouth.
    const headZone = box(wellGrp, 0.3, 0.2, 0.3, 0, 1.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, headZone, "head-over-well");

    // ---------------------------------------------------------- plan board
    const boardPost = group(g, -1.5, 0, 1.5, 0.6);
    holoPanel(boardPost, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#081a1e"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6fc3d1"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SAMPLING PLAN — MW-14, EVENT 3", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#dff3f6";
      ["Method: low-flow, bladder pump", "Flow 0.3–0.5 L/min, drawdown < 0.1 m", "Stabilise: pH ±0.1, cond ±3%, DO ±10%",
       "Bottles: VOC (zero headspace) → metals → general", "Holding: VOCs 14 d @ 4 °C", "Custody: label, sign, cooler, ice"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.3 + i * 0.11));
      });
    }, { accent: SW_ACCENT });
    reg(hits, boardPost, "sampling-plan");

    // ---------------------------------------------------------- truck tailgate
    const truck = group(g, 1.7, 0.12, 1.2, -0.6);
    box(truck, 1.4, 0.7, 0.9, 0, 0.6, 0, 0xe8eef2, { rough: 0.5, metal: 0.3 });
    box(truck, 1.0, 0.06, 0.9, -0.1, 0.98, 0, 0x2b2f34, { rough: 0.7 });
    for (const sx of [-0.5, 0.5]) cyl(truck, 0.18, 0.18, 0.2, sx, 0.18, 0.4, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    const exhaust = cyl(truck, 0.02, 0.02, 0.1, 0.65, 0.2, -0.3, 0x4a4e52, { rough: 0.5, metal: 0.6, seg: 8 });
    exhaust.rotation.z = Math.PI / 2;
    const idle = particles(truck, 30, 0x7a7f84, { size: 0.03, life: 1.0, additive: false, opacity: 0.35 });
    const idleSpot = box(truck, 0.3, 0.1, 0.2, 0.55, 0.55, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    decal(truck, 0.2, 0.06, 0.55, 0.62, 0.41, signFace("IGNITION: ON", { bg: "#2a0c0c", accent: "#d2312b", scale: 0.5 }));
    reg(hits, idleSpot, "truck-idling");
    // PPE and kit on the tailgate.
    const gloves = group(truck, -0.45, 1.03, 0.2);
    box(gloves, 0.14, 0.03, 0.1, 0, 0, 0, 0x4a5aa8, { rough: 0.8 });
    reg(hits, gloves, "nitrile-gloves");
    const glasses = group(truck, -0.25, 1.03, 0.25);
    box(glasses, 0.14, 0.02, 0.05, 0, 0, 0, 0x9fc3d8, { rough: 0.2, opacity: 0.6, transparent: true });
    reg(hits, glasses, "safety-glasses");
    const pid = instrument(truck, 0.05, 1.03, 0.2, { ry: 0.3, idle: "-- ppm", color: 0x6fc3d1, w: 0.11, d: 0.18 });
    holoTag(pid, "PID meter", 0, 0.15, 0, { css: "#6fc3d1", w: 0.24 });
    reg(hits, pid, "pid-meter");
    const pidAlarmLamp = ball(pid, 0.014, 0.05, 0.03, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.6, seg: 10, seg2: 8 });
    pidAlarmLamp.visible = false;
    const level = instrument(truck, 0.3, 1.03, 0.15, { ry: -0.2, idle: "-- m", color: 0x6fc3d1, w: 0.12, d: 0.19 });
    holoTag(level, "water level meter", 0, 0.15, 0, { css: "#6fc3d1", w: 0.3 });
    reg(hits, level, "level-meter");
    // Bladder pump staged on the tailgate — dragged to the well.
    const pump = group(truck, -0.1, 1.03, -0.25);
    cyl(pump, 0.03, 0.03, 0.4, 0, 0.03, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    hose(pump, [[0.2, 0.03, 0], [0.35, 0.08, 0.1], [0.5, 0.05, 0.2]], 0.008, 0x2f7d4a, { steps: 10 });
    holoTag(pump, "bladder pump", 0, 0.14, 0, { css: "#6fc3d1", w: 0.26 });
    reg(hits, pump, "bladder-pump");
    // Bailer hanging on the rack — the agitation hazard.
    const bailer = group(truck, 0.6, 0.9, -0.5);
    cyl(bailer, 0.02, 0.02, 0.5, 0, 0, 0, 0xe4e1d6, { rough: 0.4, opacity: 0.8, transparent: true, seg: 10 });
    holoTag(bailer, "bailer", 0, 0.32, 0, { css: "#d2312b", w: 0.18 });
    reg(hits, bailer, "bailer");

    // ------------------------------------------------- flow cell + params
    const cell = group(g, 0.9, 0.12, -0.9, -0.4);
    box(cell, 0.3, 0.3, 0.2, 0, 0.15, 0, 0x2b2f34, { rough: 0.6 });
    cyl(cell, 0.06, 0.06, 0.28, 0, 0.16, 0.12, 0x9fc3d8, { rough: 0.2, opacity: 0.7, transparent: true, seg: 16 });
    const flowScreen = decal(cell, 0.26, 0.1, 0, 0.24, 0.101, signFace("-- L/min", { bg: "#0d1c24", accent: "#6fc3d1", fg: "#bfeaf7", scale: 0.6 }), { glow: true, ei: 0.8 });
    reg(hits, cell, "flow-cell");
    hose(g, [[0.05, 0.75, -0.4], [0.4, 0.5, -0.6], [0.8, 0.3, -0.85]], 0.01, 0x2f7d4a, { steps: 12 });
    const params = [["param-ph", -0.12, "pH 6.8"], ["param-cond", 0, "412 µS"], ["param-do", 0.12, "DO 1.9"]];
    const paramFaces = {};
    for (const [id, dx, label] of params) {
      const p = group(cell, dx, 0.36, 0);
      box(p, 0.1, 0.06, 0.02, 0, 0, 0, 0x11181f, { rough: 0.6 });
      paramFaces[id] = decal(p, 0.09, 0.05, 0, 0, 0.011, signFace(label, { bg: "#11181f", accent: "#f2ae14", scale: 0.5 }));
      reg(hits, p, id);
    }
    // Purge drum beside the cell — and the bare ground beside it, the hazard.
    const drum = group(g, 1.5, 0.12, -0.3);
    cyl(drum, 0.2, 0.2, 0.6, 0, 0.3, 0, 0x2f6f8c, { rough: 0.6, metal: 0.3, seg: 18 });
    decal(drum, 0.3, 0.1, 0, 0.35, 0.201, signFace("PURGE WATER", { bg: "#2f6f8c", accent: "#ffffff", scale: 0.5 }));
    const groundSpot = cyl(g, 0.3, 0.3, 0.01, 1.0, 0.125, 0.4, 0xd2312b, { rough: 0.6, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "bare ground", 1.0, 0.4, 0.4, { css: "#d2312b", w: 0.24 });
    reg(hits, groundSpot, "purge-to-ground");

    // --------------------------------------------------- bottles + custody
    const bench = group(g, -1.2, 0.12, -1.2, 0.5);
    box(bench, 1.0, 0.04, 0.5, 0, 0.7, 0, 0xb8b0a0, { rough: 0.7 });
    for (const sx of [-0.45, 0.45]) box(bench, 0.04, 0.7, 0.04, sx, 0.35, 0, 0x8a949d, { rough: 0.5, metal: 0.5 });
    const bottleSpecs = [["bottle-voc", -0.32, 0x7fa7c9, "VOC"], ["bottle-metals", -0.05, 0xe8eef2, "METALS"], ["bottle-general", 0.22, 0xd9cbb2, "GEN"]];
    for (const [id, dx, color, label] of bottleSpecs) {
      const b = group(bench, dx, 0.72, 0);
      cyl(b, 0.035, 0.035, 0.12, 0, 0.06, 0, color, { rough: 0.3, opacity: 0.85, transparent: true, seg: 14 });
      cyl(b, 0.02, 0.02, 0.03, 0, 0.135, 0, 0x1b1e22, { rough: 0.6, seg: 12 });
      decal(b, 0.06, 0.03, 0, 0.06, 0.036, signFace(label, { bg: "#ffffff", accent: "#1b1e22", scale: 0.55 }));
      reg(hits, b, id);
    }
    // The mislabelled vial — reads MW-15 — beside the VOC vials.
    const wrong = group(bench, -0.42, 0.72, 0.12);
    cyl(wrong, 0.025, 0.025, 0.1, 0, 0.05, 0, 0x7fa7c9, { rough: 0.3, opacity: 0.85, transparent: true, seg: 12 });
    decal(wrong, 0.05, 0.025, 0, 0.05, 0.026, signFace("MW-15", { bg: "#ffffff", accent: "#d2312b", scale: 0.5 }));
    reg(hits, wrong, "label-mismatch");
    const coc = group(bench, 0.45, 0.72, 0.1, -0.3);
    box(coc, 0.18, 0.005, 0.24, 0, 0, 0, 0xf3efe4, { rough: 0.9 });
    decal(coc, 0.16, 0.22, 0, 0.004, 0, signFace("CHAIN OF CUSTODY", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.4 })).rotation.x = -Math.PI / 2;
    reg(hits, coc, "coc-form");
    const cooler = group(g, -0.2, 0.12, 1.5, 0.2);
    box(cooler, 0.6, 0.4, 0.4, 0, 0.2, 0, 0x2f6f8c, { rough: 0.6 });
    const lid = box(cooler, 0.62, 0.06, 0.42, 0, 0.43, 0, 0xe8eef2, { rough: 0.6 });
    decal(cooler, 0.3, 0.08, 0, 0.2, 0.201, signFace("4 °C · ICE", { bg: "#2f6f8c", accent: "#ffffff", scale: 0.5 }));
    reg(hits, cooler, "cooler");
    cone(g, 1.6, -1.6); cone(g, -1.7, -0.2); cone(g, 1.9, -0.6); cone(g, -1.5, 1.8);
    standingFigure(g, -1.9, 0.6, { ry: 1.2, cloth: 0x37505f });

    // ---------------------------------------------------------- site dressing
    // Exclusion barrier around the well pad, the site's health-and-safety
    // officer keeping the buddy-system watch HAZWOPER requires, a second
    // field kit and site-ID stakes — a working monitoring event has more of
    // this around it than one well and one truck.
    barrierPanel(g, 0.75, -1.3, { ry: 0.5, w: 1.1 });
    barrierPanel(g, -0.75, -1.3, { ry: -0.5, w: 1.1 });
    const officer = standingFigure(g, 1.4, 2.2, { ry: -2.3, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    holoTag(officer, "site safety officer", 0, 1.95, 0.15, { css: "#6fc3d1", w: 0.4 });
    toolChest(g, -2.0, -1.4, { ry: 0.8, color: 0x6fc3d1 });
    for (const [sx, sz] of [[2.2, -1.7], [2.4, -1.3], [2.15, -1.0]]) {
      cyl(g, 0.012, 0.012, 0.5, sx, 0.25, sz, 0xe4622a, { rough: 0.6, seg: 8 });
      decal(g, 0.1, 0.06, sx, 0.5, sz, signFace("MW", { bg: "#e4622a", accent: "#1b1e22", scale: 0.5 }));
    }
    const decon = group(g, 2.1, 0.12, 0.9, -0.3);
    cyl(decon, 0.16, 0.18, 0.28, 0, 0.14, 0, 0x2b2f34, { rough: 0.7, seg: 16 });
    cyl(decon, 0.03, 0.03, 0.22, 0.1, 0.32, 0.06, 0xdfe6ec, { rough: 0.4, metal: 0.5, seg: 8 });
    holoTag(decon, "decon rinse", 0, 0.45, 0, { css: "#6fc3d1", w: 0.28 });
    const spareBottles = group(g, -1.0, 0.12, 1.7, 0.3);
    for (const dx of [-0.12, 0.12]) box(spareBottles, 0.2, 0.16, 0.16, dx, 0.08, 0, 0xe8eef2, { rough: 0.6 });
    holoTag(spareBottles, "spare bottle case", 0, 0.22, 0, { css: "#6fc3d1", w: 0.34 });

    let purging = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "headspace") { repaint(pid.userData.screen, signFace("0.4 ppm", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.62 })); cap.position.set(0.3, 0.06, 0.3); }
        if (step.id === "pump") { pump.parent.remove(pump); wellGrp.add(pump); pump.position.set(0, 0.7, 0); pump.rotation.set(0, 0, 0); pump.children[0].rotation.set(0, 0, 0); }
        if (step.id === "stabilise") for (const id of Object.keys(paramFaces)) repaint(paramFaces[id], signFace(params.find((p) => p[0] === id)[2], { bg: "#11181f", accent: "#59c97b", scale: 0.5 }));
        if (step.id === "cooler") lid.position.y = 0.43;
        if (step.id === "check") wrong.visible = false;
      },
      onHazard() {},
      // The PID really spikes and settles, and the cap really rolls off and
      // gets seated back on the casing when the learner answers.
      onInterrupt(it) {
        if (it.id === "vapor-alarm-purge") { repaint(pid.userData.screen, signFace("12.6 ppm", { bg: "#240d0d", accent: "#f0645b", fg: "#ffd9d9", scale: 0.62 })); pidAlarmLamp.visible = true; }
        if (it.id === "cap-rolls-cooler") { cap.position.set(0.7, 0.04, 0.55); cap.rotation.x = 1.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vapor-alarm-purge") { repaint(pid.userData.screen, signFace("0.4 ppm", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.62 })); pidAlarmLamp.visible = false; }
        if (it.id === "cap-rolls-cooler") { cap.position.set(0, 0.74, 0); cap.rotation.x = 0; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        idle.visible = true; idle.userData.step(dt, new THREE.Vector3(0.7, 0.2, -0.3), 0.04, 0.3, 0.2);
        purging = !!(step?.id === "purge" && session.holding);
        if (session?.track && step?.id === "purge") {
          const v = session.track.v;
          repaint(flowScreen, signFace(`${(v * 0.8).toFixed(2)} L/min`, { bg: "#0d1c24", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "level") {
          repaint(level.userData.screen, signFace(`${(10 + gg.t * 6).toFixed(2)} m`, { bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.62 }));
        }
        if (step?.id === "cooler") lid.position.y = session.holding ? 0.43 : 0.6;
      },
    };
  },
};
