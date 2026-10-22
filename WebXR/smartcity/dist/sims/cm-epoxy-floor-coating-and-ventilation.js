import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  reg, surfaceTexture, texturedMat, concreteFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Epoxy Floor Coating & Ventilation VR — Cement masons and
// plasterers, station seven.
//
// A cement mason crew coating a warehouse slab with a two-part epoxy in a
// space with limited natural airflow: the SDS read, the substrate walked for
// moisture and an ignition source before a can opens, mechanical ventilation
// running and confirmed before mixing, the two parts batched to the ratio
// on the can, rolled on in the working time the pot life allows, and the
// space kept clear of anyone without the respiratory protection the SDS
// calls for until it has off-gassed. Mix ratio, working time, ventilation
// rate and re-entry time are the manufacturer's data sheet's, never a number
// this file invents.

const CMEP_ACCENT = 0xf2c14b;
const CMEP_CSS = "#f2c14b";
const CMEP_PAL = palette("construction");

export const SIM_CM_EPOXY_FLOOR_COATING_AND_VENTILATION = {
  id: "cm-epoxy-floor-coating-and-ventilation",
  index: "706",
  domain: "Construction & Structural Trades",
  trade: "Cement mason — OPCMIA Local 300, floor coating crew",
  category: "Construction & Structural Trades",
  weather: "clear",
  indoor: "plant",
  certification: "OPCMIA Local 300 cement mason apprenticeship as a training body; OSHA 29 CFR 1926.55 gases, vapors, fumes, dusts and mists, as applied to epoxy solvent vapor; OSHA 29 CFR 1926.57 ventilation; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction for the slab preparation; ANSI/ASSP A10.9 concrete and masonry construction safety requirements; the epoxy manufacturer's safety data sheet for mix ratio, working time and re-entry",
  name: "Epoxy Floor Coating & Ventilation",
  title: simTitle("Epoxy Floor Coating & Ventilation"),
  tagline: "A warehouse floor coated safely: the SDS read, the slab walked for moisture and an ignition source, ventilation running and confirmed before a can opens, the two parts batched to ratio, rolled on inside the pot life, the space kept clear until it has off-gassed, and the day logged",
  accent: CMEP_ACCENT,
  accentCss: CMEP_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "ventilated-every-pour", name: "Ventilated Every Pour", note: "A floor coated with the fan running, the ratio to the can and nobody in the space without respiratory protection until it off-gassed — first time" },

  supportLine: "your OPCMIA Local 300 member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Coating Crew",
    currency: "BAY",
    ranks: ["Laborer", "Roller Hand", "Cement Mason", "Lead Finisher", "Coating Crew Certified"],
    badges: [
      { id: "read-the-sds", name: "Read The SDS First", note: "The SDS and the substrate walk both happened before a can was ever opened, first time", test: AWARD.stepClean("substrate-walk") },
      { id: "never-without-the-fan", name: "Never Without The Fan", note: "Never mixed with the fan off, never an open flame near the cans, never skipped the respirator, never let someone back in before the re-entry time", test: AWARD.safe },
      { id: "on-the-ratio", name: "On The Ratio", note: "The mix ratio and the coating thickness both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-coat", name: "Clean Coat", note: "No corrections through the whole bay", test: AWARD.clean },
      { id: "held-the-roll", name: "Held The Roll", note: "The rolling pass held for the whole bay before the pot life ran out", test: AWARD.unbroken },
      { id: "bay-by-break", name: "Bay By Break", note: "Mixed, rolled and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "mix-fan-off": "You went to mix the two parts with the ventilation fan off. Epoxy resin and hardener release solvent vapor as they mix and cure, and in a space with limited natural airflow that vapor concentrates fast — the fan is running and confirmed moving air before the cans are ever opened, not switched on afterward if the smell gets strong.",
    "flame-near-cans": "You went to run the torch cutter near the open epoxy cans. Epoxy solvent vapor is flammable, and an open flame or a spark near cans that are open or recently opened is exactly the ignition source the SDS's precautions exist to keep away from the work area.",
    "skip-respirator": "You went to roll the coat without the respirator the SDS calls for. Epoxy vapor at the concentrations mixing and rolling produce is an inhalation hazard the manufacturer's data sheet specifically names a respirator for, and skin contact with the uncured resin is its own chemical burn risk that gloves are there to prevent.",
    "early-reentry": "You let someone back into the bay before the SDS's re-entry time had passed. Freshly coated epoxy keeps off-gassing solvent vapor well after it looks dry to the eye, and the re-entry time on the data sheet is the point the manufacturer has tested the air to actually be safe to breathe without protection, not a guess.",
  },

  lateNotes: {
    "mixer-paddle": "The two parts only get mixed once the fan is confirmed moving air — mixing before that just fills a still room with solvent vapor.",
    "roller": "Rolling starts once the mix is actually batched to ratio; rolling a mix that has not been proportioned right cures wrong no matter how even the pass is.",
    "close-log": "The bay is logged once the coat is down and the space is marked off for its full re-entry time.",
  },

  steps: [
    {
      id: "sds-read", kind: "select", target: "sds-board",
      title: "Read the epoxy safety data sheet",
      cue: "Read the mix ratio, the pot life, the ventilation requirement, the respirator called for, and the re-entry time before opening a can.",
      why: "A two-part epoxy is a different hazard from anything else a cement mason mixes on a slab — it is a chemical reaction with a fixed working time, not a cement product that waits patiently while the crew gets organized. The data sheet sets the ratio, the ventilation and the respirator together because none of them work as a substitute for the others.",
    },
    {
      id: "substrate-walk", kind: "find", noHint: true,
      targets: ["moisture-spot", "open-flame-source", "fan-not-running"],
      itemNames: { "moisture-spot": "a damp patch in the slab", "open-flame-source": "an open flame source near the work area", "fan-not-running": "the ventilation fan sitting off" },
      itemNotes: {
        "moisture-spot": "A patch of the slab reads damp to the hand — epoxy applied over moisture blisters and delaminates within weeks no matter how well it was mixed.",
        "open-flame-source": "A torch cutter is staged and lit near where the epoxy cans are about to be opened.",
        "fan-not-running": "The ventilation fan for the bay is sitting switched off, with nothing moving air through the space yet.",
      },
      title: "Walk the slab and the space before a can opens",
      cue: "Walk the slab for moisture, the area for an ignition source, and check the fan, then click every defect you find.",
      why: "Before any epoxy chemistry has actually started, every one of these is simple to correct. Discover them instead after the cans are already open and a damp slab becomes a coating that fails months from now, an open flame near curing vapor becomes an unplanned fire risk, and a fan that was never on becomes a room full of vapor with nowhere for it to go.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["dry-the-spot", "clear-flame-source", "start-fan"],
      itemNames: { "dry-the-spot": "damp spot dried and re-tested", "clear-flame-source": "flame source cleared from the area", "start-fan": "ventilation fan started" },
      title: "Correct what the walk found",
      cue: "Dry the damp spot and re-test it, clear the flame source from the work area, and start the ventilation fan.",
      why: "Noting the moisture, the flame source or the dead fan and moving on anyway is worse than not having checked, because the crew now treats the slab and the space as ready on the strength of a note rather than an actual correction. The spot has to actually dry, the flame source actually has to leave, and the fan actually has to be moving air before either can opens.",
    },
    {
      id: "confirm-vent", kind: "select", target: "fan-check",
      title: "Confirm the fan is actually moving air",
      cue: "Check the fan is running and actually moving air through the bay before opening either can.",
      why: "A fan switched on is not the same thing as a fan actually exchanging the air in a bay with limited natural airflow — a blocked intake or a fan aimed the wrong way can run for an hour and do almost nothing. Confirming moving air, not just a spinning blade, is what the SDS's ventilation requirement actually means.",
    },
    {
      id: "don-ppe", kind: "select", target: "respirator-station",
      title: "Don the respirator and gloves",
      cue: "Put on the respirator the SDS calls for and the chemical-resistant gloves before either can is opened.",
      why: "The respirator and gloves are fitted before mixing starts because the vapor concentration and the risk of skin contact are both highest in the first few minutes after the two parts meet, not sometime later once somebody notices a smell. Putting them on after the smell is already strong means the highest-exposure minutes already happened unprotected.",
    },
    {
      id: "mix-ratio", kind: "gauge", target: "ratio-gauge",
      title: "Batch the two parts to the can's ratio",
      cue: "Measure resin and hardener against the can's ratio and commit inside the manufacturer's band before mixing.",
      why: "Epoxy cures by a chemical reaction between its two parts, and off-ratio mix does not just cure a little weaker the way an off-proportion mortar does — it can stay tacky indefinitely or cure brittle and crack under the first forklift that crosses it. The can's ratio is fixed by the manufacturer's chemistry, not adjustable by feel.",
      gauge: { label: "MIX RATIO", speed: 0.68, green: [0.44, 0.58], readout: (t) => (t < 0.44 ? "hardener-lean — may not cure" : t <= 0.58 ? "on the can's ratio" : "hardener-rich — cures brittle"), missNote: "Off the can's ratio — remeasure resin and hardener against the label and check the gauge again." },
    },
    {
      id: "mix-epoxy", kind: "hold", target: "mixer-paddle", seconds: 5,
      title: "Mix the batch within the pot life",
      cue: "Hold the paddle mixer in the batch at low speed until the two parts are fully blended, watching the pot life clock.",
      why: "A slow, low-speed mix blends the two parts fully without whipping air bubbles into the batch that would otherwise show up as pinholes in the cured floor, and it has to finish and get rolled out before the pot life on the can runs out — a batch mixed too long or started too early loses its working time before it is even on the floor.",
      holdBreakNote: "The paddle came up before the batch was fully blended. Put it back down and finish the mix before the pot life runs further.",
    },
    {
      id: "cut-in-edges", kind: "turn", target: "cut-in-brush",
      title: "Cut in the edges before rolling the field",
      cue: "Work the brush along the wall lines and the drain first, while the batch is at its freshest.",
      why: "A roller cannot reach tight against a wall or a drain ring without leaving a starved strip, so the edges are cut in by brush from the same batch before the roller ever starts the open field — cut in after the field is rolled, the two applications meet at different ages and the seam between them reads as a visible line once the floor is finished.",
      turn: { turns: 1, label: "CUT-IN" },
    },
    {
      id: "roll-coat", kind: "track", target: "roller", seconds: 6,
      title: "Roll the coat to an even thickness across the bay",
      cue: "Work the roller in overlapping passes, keeping the wet-film thickness inside the manufacturer's band before the pot life runs out.",
      why: "Rolled too thin, the coat wears through to bare concrete at the first heavy traffic; rolled too thick, it can trap solvent as it skins over and stays soft underneath for weeks. An even pass across the whole bay, finished inside the pot life, is what keeps the floor performing the same everywhere it was coated.",
      track: { start: 0.2, green: [0.4, 0.6], rise: 0.5, fall: 0.46, drift: 0.12, label: "FILM THICKNESS", readout: (v) => (v < 0.4 ? "too thin — will wear through" : v > 0.6 ? "too thick — may trap solvent" : "on the manufacturer's band") },
      holdBreakNote: "The film thickness left the band while the roll kept going. Even it out before the batch runs past its pot life.",
    },
    {
      id: "clean-tools", kind: "drag", target: "used-roller",
      title: "Bag the cured-solvent tools for disposal",
      cue: "Carry the used roller and tray to the hazardous-waste bin the SDS calls for, not the ordinary trash.",
      why: "A roller and tray full of curing two-part epoxy keep reacting and off-gassing solvent right where they were set down, and thrown in an ordinary trash can they do that in a space nobody is ventilating on purpose. The SDS's disposal section treats them as the same hazardous waste as the uncured resin, and the hazardous-waste bin is what actually matches that.",
      drag: { to: "waste-bin", radius: 0.6, missNote: "Not in the hazardous-waste bin — cured epoxy tools go where the SDS's disposal section sends them, not in the ordinary trash." },
    },
    {
      id: "mark-reentry", kind: "select", target: "reentry-sign",
      title: "Mark the bay for its re-entry time",
      cue: "Post the re-entry sign at the bay entrance with the time the SDS sets before anyone comes back in without protection.",
      why: "A coated floor that looks dry is not the same as a floor that has actually off-gassed to a safe concentration, and the only way anyone walking up to the bay knows that is a sign that actually says so with a time on it. Posted before the crew leaves, it is what keeps the next person through the door from finding out the hard way.",
    },
    {
      id: "close-out", kind: "select", target: "close-log",
      title: "Log the coating",
      cue: "Record the ratio batched, the ventilation run, and the re-entry time posted.",
      why: "The coating log is how the foreman and the next trade in behind the cement masons both know this floor was mixed to ratio and given its full off-gas time rather than opened up early because the schedule was tight — it is also where the damp spot and the flame source get written down so the next bay's walk starts from what this one already found.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: bay coated, re-entry posted. Then check in with the crew about the fan and the respirator.",
      why: "The next bay's coating and its re-entry check both get scheduled off this call, which only works if the call is honest about how the last one went. A fan needed restarting mid-mix and a respirator seal gave somebody trouble — both worth saying, along with the fact that the OPCMIA member assistance line is there for anyone the shift left on edge.",
    },
  ],

  interrupts: [
    {
      id: "fan-stalls",
      kind: "Ventilation fan stalls mid-mix",
      after: "mix-epoxy", delay: 2, seconds: 12,
      alert: "The ventilation fan has stalled and the solvent smell in the bay is building fast while the batch is still being worked.",
      cue: "Stop mixing and get everyone out until the fan is running again.",
      target: "evacuate-signal",
      why: "A stalled fan in a space with limited natural airflow means the vapor concentration keeps climbing with nothing carrying it out, and continuing to mix or roll while that happens raises everyone's exposure by the minute. Clearing the bay first is what actually protects the crew; restarting the fan matters, but not before the people are already out of the vapor.",
      missNote: "The crew kept working the batch through the stall while the smell built up in the bay; nobody left until the fan finally caught again on its own.",
      wrongNote: "The evacuate signal — a stalled fan with vapor building means the crew leaves the bay first, and the fan gets fixed after.",
    },
    {
      id: "coworker-enters-early",
      kind: "Coworker walks into the bay before re-entry time",
      after: "roll-coat", delay: 2, seconds: 12,
      alert: "A coworker from another trade has walked into the coated bay without a respirator, well before the re-entry time on the sign.",
      cue: "Call him out over the radio before he breathes any more of it.",
      target: "crew-radio",
      why: "Somebody from outside this crew has no reason to know the floor was coated an hour ago or what the re-entry sign means, and the vapor concentration in a freshly coated bay does not care whether he read the sign or not. Calling him out immediately over the radio reaches him faster than crossing the bay after him through the same air.",
      missNote: "He walked halfway across the bay before anyone said anything over the radio; he was breathing the vapor the whole way in and the whole way back out.",
      wrongNote: "The radio — somebody is already inside the bay without protection, and the fastest way to reach him is calling him out, not walking in after him.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CMEP_ACCENT);
    const ground = box(g, 8.4, 0.04, 6.4, 0, 0.02, -0.3, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#a29e92", tone2: "#948f82" }), { repeat: 4, px: 512 }), { rough: 0.6, color: 0xece7d8 });
    const wallMat = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#9a968c", tone2: "#8e8a80" }), { repeat: 2, px: 256 }), { rough: 0.9, color: 0xe4dfd0 });
    for (const [x, z, w, d] of [[-4.0, -0.3, 0.2, 6.0], [0, -3.2, 8.0, 0.2]]) { const wl = box(g, w, 2.8, d, x, 1.4, z, 0xffffff); wl.material = wallMat; }

    // ------------------------------------------------------------- the bay and coating
    const bay = group(g, 0.6, 0.02, 0.8);
    const bayFloorHit = box(bay, 4.6, 0.02, 3.2, 0, 0.01, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["bay-floor"] = bayFloorHit;
    const moistureSpot = box(bay, 0.6, 0.004, 0.5, -1.6, 0.022, -0.8, 0x2b5a6a, { rough: 0.2, opacity: 0.45, transparent: true, cast: false });
    reg(hits, moistureSpot, "moisture-spot");
    holoTag(bay, "damp patch in the slab", -1.6, 0.24, -0.8, { css: CMEP_CSS, w: 0.34 });
    const dryToolSupply = group(bay, -1.0, 0.02, -0.6, 0.2);
    box(dryToolSupply, 0.2, 0.03, 0.2, 0, 0.015, 0, CMEP_PAL.trim, { rough: 0.6, metal: 0.4 });
    holoTag(dryToolSupply, "dry the spot", 0, 0.2, 0, { css: CMEP_CSS, w: 0.24 });
    reg(hits, dryToolSupply, "dry-the-spot");

    const coatTex = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#3a4550", tone2: "#2e3740" }), { repeat: 2, px: 512 }), { rough: 0.25, metal: 0.1, color: 0x59c9d8 });
    const coatLayer = box(bay, 4.5, 0.01, 3.1, 0, 0.015, 0, 0xffffff);
    coatLayer.material = coatTex;
    coatLayer.scale.x = 0.02;
    coatLayer.visible = false;
    const rollerHit = box(bay, 4.6, 0.3, 3.2, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bay, "roller — thickness pass", 0, 0.4, -1.4, { css: CMEP_CSS, w: 0.4 });
    reg(hits, rollerHit, "roller");

    // ------------------------------------------------------------- fan, flame source
    const fan = group(g, -3.6, 0.02, 0.6, 0.2);
    cyl(fan, 0.32, 0.32, 0.16, 0, 1.3, 0, CMEP_PAL.trim, { rough: 0.5, metal: 0.5, seg: 16 });
    const fanBlades = cyl(fan, 0.27, 0.27, 0.02, 0, 1.3, 0.09, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 8 });
    reg(hits, fan, "fan-not-running");
    holoTag(fan, "ventilation fan — off", 0, 1.55, 0, { css: CMEP_CSS, w: 0.36 });
    const startFanSupply = group(g, -3.2, 0.02, 1.0, 0.2);
    box(startFanSupply, 0.1, 0.14, 0.03, 0, 0.7, 0, CMEP_PAL.accent, { rough: 0.5, metal: 0.4 });
    holoTag(startFanSupply, "start the fan", 0, 0.85, 0, { css: CMEP_CSS, w: 0.26 });
    reg(hits, startFanSupply, "start-fan");
    const fanCheckHit = box(g, 0.5, 0.4, 0.5, -3.6, 1.6, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "confirm air is moving", -3.6, 2.0, 0.6, { css: CMEP_CSS, w: 0.32 });
    reg(hits, fanCheckHit, "fan-check");

    const torch = group(g, -1.6, 0.02, -1.8, 0.3);
    cyl(torch, 0.04, 0.04, 0.4, 0, 0.2, 0, 0xd2312b, { rough: 0.6, seg: 10 });
    ball(torch, 0.03, 0, 0.42, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.6, seg: 10, seg2: 8 });
    reg(hits, torch, "open-flame-source");
    holoTag(torch, "open flame near the cans", 0, 0.6, 0, { css: CMEP_CSS, w: 0.4 });
    const flameNearCansHit = box(g, 0.5, 0.4, 0.5, -1.6, 0.3, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "run the torch here now?", -1.6, 0.6, -1.3, { css: "#d2312b", w: 0.42 });
    reg(hits, flameNearCansHit, "flame-near-cans");
    const clearFlameSupply = group(g, -1.0, 0.02, -2.1, 0.2);
    box(clearFlameSupply, 0.2, 0.15, 0.2, 0, 0.08, 0, CMEP_PAL.trim, { rough: 0.6, metal: 0.4 });
    holoTag(clearFlameSupply, "clear the flame source", 0, 0.24, 0, { css: CMEP_CSS, w: 0.34 });
    reg(hits, clearFlameSupply, "clear-flame-source");

    // ------------------------------------------------------------- cans, mixer, gauge
    const canA = cyl(g, 0.16, 0.16, 0.3, 2.4, 0.15, 2.2, 0x59c9d8, { rough: 0.5, metal: 0.3, seg: 16 });
    const canB = cyl(g, 0.14, 0.14, 0.26, 2.7, 0.13, 2.2, 0xf2c14b, { rough: 0.5, metal: 0.3, seg: 16 });
    void canA; void canB;
    const ratioGauge = instrument(g, 2.55, 0.5, 2.2, { idle: "--", color: CMEP_CSS, w: 0.16, d: 0.2 });
    holoTag(g, "ratio gauge", 2.55, 0.74, 2.2, { css: CMEP_CSS, w: 0.24 });
    reg(hits, ratioGauge, "ratio-gauge");
    const mixerBucket = group(g, 3.2, 0.02, 2.0, 0.2);
    cyl(mixerBucket, 0.22, 0.2, 0.35, 0, 0.18, 0, 0x2b2f34, { rough: 0.7, seg: 16 });
    const mixerPaddle = cyl(mixerBucket, 0.03, 0.14, 0.02, 0, 0.15, 0, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(mixerBucket, "mixer paddle — hold", 0, 0.5, 0, { css: CMEP_CSS, w: 0.32 });
    reg(hits, mixerPaddle, "mixer-paddle");
    const mixFanOffHit = box(mixerBucket, 0.3, 0.2, 0.3, 0, 0.3, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mixerBucket, "mix it with the fan off?", 0, 0.55, 0.2, { css: "#d2312b", w: 0.44 });
    reg(hits, mixFanOffHit, "mix-fan-off");
    const roller = group(g, 2.0, 0.02, 1.4, -0.2);
    box(roller, 0.4, 0.03, 0.12, 0, 0.08, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    box(roller, 0.03, 0.5, 0.03, 0, 0.32, -0.15, 0x8a6a42, { rough: 0.85 });
    void roller;
    const respiratorSupply = group(g, 1.4, 0.02, 1.8, 0.2);
    box(respiratorSupply, 0.16, 0.1, 0.14, 0, 0.08, 0, 0x3a4550, { rough: 0.6 });
    holoTag(respiratorSupply, "respirator", 0, 0.2, 0, { css: CMEP_CSS, w: 0.24 });
    reg(hits, respiratorSupply, "respirator-station");
    const skipRespiratorHit = box(g, 0.4, 0.3, 0.4, 1.4, 1.3, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "roll it without the respirator?", 1.4, 1.6, 1.2, { css: "#d2312b", w: 0.46 });
    reg(hits, skipRespiratorHit, "skip-respirator");
    const vapor = particles(g, 40, 0xbcdce6, { size: 0.03, life: 1.0, additive: true, opacity: 0.25 });
    const cutInBrush = group(g, 2.6, 0.02, 0.8, 0.2);
    box(cutInBrush, 0.14, 0.02, 0.05, 0, 0.03, 0, 0x8a6a42, { rough: 0.85 });
    box(cutInBrush, 0.02, 0.16, 0.02, 0, 0.11, 0, 0x8a6a42, { rough: 0.85 });
    holoTag(cutInBrush, "cut-in brush", 0, 0.24, 0, { css: CMEP_CSS, w: 0.26 });
    reg(hits, cutInBrush, "cut-in-brush");
    const usedTools = group(g, 3.0, 0.02, 1.0, 0.2);
    box(usedTools, 0.4, 0.03, 0.12, 0, 0.08, 0, 0xb9bec4, { rough: 0.5, metal: 0.4 });
    holoTag(usedTools, "used roller and tray", 0, 0.24, 0, { css: CMEP_CSS, w: 0.32 });
    reg(hits, usedTools, "used-roller");
    const wasteBin = box(g, 0.5, 0.5, 0.5, -3.6, 0.27, 1.2, 0xd2312b, { rough: 0.7 });
    hits["waste-bin"] = wasteBin;
    holoTag(g, "hazardous-waste bin", -3.6, 0.6, 1.2, { css: CMEP_CSS, w: 0.34 });

    // ------------------------------------------------------------- re-entry sign, coworker
    const reentrySign = group(g, 0.6, 0.02, 3.3, 0.1);
    box(reentrySign, 0.5, 0.35, 0.03, 0, 0.6, 0, 0x3a4550, { rough: 0.7 });
    const reentryFace = decal(reentrySign, 0.44, 0.3, 0, 0.6, 0.017, signFace("RE-ENTRY —\nPER THE SDS", { bg: "#171108", accent: CMEP_CSS, fg: "#efeade", scale: 0.3 }), { px: 256 });
    void reentryFace;
    cyl(reentrySign, 0.02, 0.02, 1.2, 0, 0.4, 0, CMEP_PAL.trim, { rough: 0.5, metal: 0.5, seg: 8 });
    reg(hits, reentrySign, "reentry-sign");
    const earlyReentryHit = box(g, 0.4, 0.3, 0.4, 1.4, 0.5, 3.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let him in before the time's up?", 1.4, 0.8, 3.3, { css: "#d2312b", w: 0.5 });
    reg(hits, earlyReentryHit, "early-reentry");
    const coworker = standingFigure(g, 2.6, 3.6, { ry: 3.0, cloth: 0x5a4a3a, vest: 0xd8f23a, helmet: 0xf2f2f2, atStation: true });
    coworker.visible = false;

    const evacHit = box(g, 0.3, 0.4, 0.3, -3.0, 1.2, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "evacuate signal", -3.0, 1.5, -0.4, { css: CMEP_CSS, w: 0.32 });
    reg(hits, evacHit, "evacuate-signal");

    // ------------------------------------------------------------- cards, log, radio, crew
    const board = group(g, -2.6, 0.02, 3.0, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = CMEP_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("EPOXY SDS — BAY 6", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Mix ratio and pot life: per the SDS", "Ventilation: mechanical, confirmed running", "Respirator: per the SDS's PPE section", "Re-entry time: per the SDS"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: CMEP_ACCENT });
    reg(hits, board, "sds-board");

    const log = group(g, -1.9, 0.02, 3.0, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, signFace("COATING LOG —\nBAY 6", { bg: "#171108", accent: CMEP_CSS, fg: "#efeade", scale: 0.3 }), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "coating log", 0, 1.62, 0, { css: CMEP_CSS, w: 0.24 });
    reg(hits, log, "close-log");
    const crewRadio = group(g, -1.3, 0.02, 3.2, -0.2);
    box(crewRadio, 0.1, 0.18, 0.06, 0, 0.09, 0, 0x2b2f34, { rough: 0.6 });
    crewRadio.userData.screen = decal(crewRadio, 0.08, 0.05, 0, 0.15, 0.031, signFace("—", { bg: "#0d1c24", accent: CMEP_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.6 });
    holoTag(crewRadio, "crew radio", 0, 0.3, 0, { css: CMEP_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    const mason = standingFigure(g, 1.6, -0.6, { ry: 2.6, cloth: 0x4a4038, vest: CMEP_PAL.accent, helmet: 0xf2f2f2, gloves: true });
    holoTag(mason, "cement mason", 0, 1.9, 0, { css: CMEP_CSS, w: 0.22 });
    for (const [x, z] of [[3.6, 3.0], [-3.6, -2.4]]) cone(g, x, z);

    // ------------------------------------------------------------- yard dressing
    // A stack of spare epoxy cans, a spare-parts rack and a coil of extra
    // hose — ordinary storage a coating crew keeps at hand.
    const yard = group(g, 3.6, 0.02, 3.0, 0.3);
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) box(yard, 0.14, 0.1, 0.14, -0.6 + c * 0.18, 0.06 + r * 0.01, -0.6 + r * 0.18, r % 2 ? 0x59c9d8 : 0xf2c14b, { rough: 0.6, metal: 0.2 });
    const partsRack = group(g, -3.8, 0.02, -1.0, -0.3);
    box(partsRack, 0.7, 0.05, 0.35, 0, 0.9, 0, CMEP_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 5; i++) cyl(partsRack, 0.02, 0.02, 0.55, -0.28 + i * 0.14, 0.55, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const hoseCoil = group(g, -3.4, 0.02, -0.2, 0.2);
    for (let i = 0; i < 6; i++) cyl(hoseCoil, 0.16 + i * 0.02, 0.16 + i * 0.02, 0.02, 0, 0.02 + i * 0.022, 0, 0x3a4550, { rough: 0.7, seg: 16, open: true });

    let mixing = false, coating = false, coatProgress = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 1.3, 0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { moistureSpot.material.opacity = 0.05; torch.visible = false; fanBlades.userData.spin = true; }
        if (step.id === "mix-epoxy") mixing = false;
        if (step.id === "roll-coat") { coatLayer.visible = true; coatLayer.scale.x = 1; coating = false; }
        if (step.id === "clean-tools") usedTools.position.set(-3.6, 0, 1.2);
        if (step.id === "close-out") repaint(log.userData.face, signFace("COATING LOG —\nCOATED + POSTED", { bg: "#171108", accent: "#59c97b", fg: "#d8f5e0", scale: 0.26 }));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("BAY 6 DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "fan-stalls") { fanBlades.userData.spin = false; vapor.visible = true; }
        if (it.id === "coworker-enters-early") { coworker.visible = true; coworker.userData.t = 0; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fan-stalls") { fanBlades.userData.spin = true; vapor.visible = false; }
        if (it.id === "coworker-enters-early") coworker.visible = false;
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "mix-ratio") repaint(ratioGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#22201a", accent: "#f2ae14", fg: "#f7f4ec", scale: 0.6 }));
        if (step?.id === "mix-epoxy" && session.holding) { mixing = true; mixerPaddle.rotation.y = t * 14; }
        if (step?.id === "roll-coat" && session.holding) { coating = true; coatProgress = Math.min(1, coatProgress + dt / 6); coatLayer.visible = true; coatLayer.scale.x = coatProgress; }
        if (session?.turn && step?.id === "cut-in-edges") cutInBrush.rotation.y = session.turn.amount * Math.PI * 2;
        if (fanBlades.userData.spin !== false) fanBlades.rotation.z += dt * 5;
        if (vapor.visible) vapor.userData.step(dt, new THREE.Vector3(3.2, 0.5, 2.0), 0.3, 0.4, 0.2);
        if (coworker.visible) { coworker.userData.t = (coworker.userData.t ?? 0) + dt; coworker.position.z = 3.6 - Math.min(1, coworker.userData.t / 8) * 2.0; }
        void mixing; void coating; void CITY;
      },
    };
  },
};
