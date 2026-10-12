import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Nutrient Reduction Chemical Feed and Aeration VR — Bay Program
// projects (console BAYKEEPER, docs/consoles/BAYKEEPER.md).
//
// A wastewater treatment plant's nutrient-removal process: a chemical feed
// skid dosing the process, and the aeration basin whose blowers keep the
// microbes that take nitrogen out of the water supplied with air. The learner
// is the plant operator on the day's rounds: the work order and the safety
// data sheet read, the splash gear on, the feed area walked, the eyewash
// flushed, the metering pump locked out, the line bled, the drip tray set, the
// pump calibrated on the draw-down column while a fitting sprays, the dose
// read, the basin walkway walked, the dissolved-oxygen probe pulled for
// cleaning while a coworker leans for a dropped hard hat, the oxygen read,
// logged and the crew checked in. Nothing here is a real plant, no chemical
// is named and no dose, setpoint or limit is stated as a number — those live
// in the plant's own operating procedures and the chemical's own SDS.

const BKNF_ACCENT = 0xb07ad8;

export const SIM_BK_WASTEWATER_NUTRIENT_CHEMICAL_FEED = {
  id: "bk-wastewater-nutrient-chemical-feed",
  index: "BK-3",
  domain: "Environmental",
  trade: "Wastewater treatment plant operator on the nutrient-removal rounds: the chemical feed skid and the aeration basin",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "California State Water Resources Control Board wastewater treatment plant operator certification practice; OSHA 29 CFR 1910.1200 hazard communication and the chemical's safety data sheet; 29 CFR 1910.132 and 1910.133 for the splash protection; ANSI Z358.1 for the eyewash and safety shower; 29 CFR 1910.147 control of hazardous energy for the metering pump; 29 CFR 1910.22 and 1910.23 walking-working surfaces and guardrails on the basin walkway; NFPA 820 for the plant's classified areas; NIOSH findings on drownings in aerated tanks",
  name: "Nutrient Reduction Chemical Feed and Aeration",
  title: simTitle("Nutrient Reduction Chemical Feed and Aeration"),
  tagline: "A treatment plant's nutrient-removal rounds: the order and the SDS read, splash gear on, the feed area walked, the eyewash flushed, the metering pump locked out, the line bled, the drip tray set, the pump calibrated while a fitting sprays, the dose read, the basin walkway walked, the oxygen probe pulled while a coworker leans for a hard hat, the oxygen read, logged and the crew checked in",
  accent: BKNF_ACCENT,
  accentCss: "#b07ad8",
  parSeconds: 300,
  footprint: 3.0, // a street lane or a plant floor: the layout reaches past the usual pad
  badge: { id: "dose-and-air", name: "Dose And Air", note: "The feed calibrated and the basin read without a splash on skin or a hand over the rail" },

  supportLine: "your union's member assistance programme, with the employer's employee assistance line behind it",

  game: system({
    name: "Nutrient Rounds",
    currency: "DOSE",
    ranks: ["Rounds Trainee", "Feed Hand", "Process Operator", "Shift Operator", "Nutrient Rounds Certified"],
    badges: [
      { id: "sds-first", name: "SDS First", note: "The order and the safety data sheet read and the feed area walked before a fitting was touched", test: AWARD.all(AWARD.stepClean("work-order"), AWARD.stepClean("feed-walk")) },
      { id: "no-splash", name: "No Splash", note: "Never over the rail, never a line broken live, never chemicals mixed, never a drum poured overhead", test: AWARD.safe },
      { id: "true-reads", name: "True Reads", note: "Dose and oxygen both committed inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-rounds", name: "Clean Rounds", note: "No corrections from the order to the check-in", test: AWARD.clean },
      { id: "steady-draw", name: "Steady Draw", note: "Held the calibration draw in band throughout", test: AWARD.unbroken },
      { id: "on-shift", name: "On Shift", note: "Rounds logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-over-rail": "You leaned out over the basin's guardrail to see the diffusers. Aerated water is full of air bubbles and will not hold a person up the way still water does, and NIOSH has investigated operators who went into aeration tanks and could not stay afloat. The basin is read from the walkway behind the rail, with the probe pole doing the reaching.",
    "mix-chemicals": "You went to tip the last of one tote into a drum of a different chemical to save space. Treatment chemicals that are safe apart can react together — heat, gas or spatter — and 29 CFR 1910.1200 is why each container stays labelled with only what its SDS describes. Leftovers go back to their own container or to the plant's waste procedure.",
    "open-line-live": "You started to loosen the pump's discharge fitting with the pump still running. A metering pump holds pressure in its discharge line, and a fitting opened under pressure sprays chemical straight at the hands and face working on it. The pump is locked out and the line is bled before any fitting is turned.",
    "pour-overhead": "You lifted a drum to top up the day tank by pouring over its lip. Pouring a corrosive chemical from a drum held above chest height is the classic way to take a splash in the face, and the day tank is filled through its transfer pump and hose, not by hand.",
  },

  lateNotes: {
    "bleed-valve": "Bleed the line only once the pump is locked out — bleeding a line the pump is still charging just sprays from the bleed.",
    "drip-tray": "The drip tray goes under the fitting once the line is bled and before it is opened — its job is the last few drops, not a live line.",
    "do-meter": "Read the oxygen once the probe has been cleaned and put back in the basin — a probe hanging in the air reads the air.",
    "rounds-log": "The log is written after the basin reads — it records the whole round.",
  },

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order",
      title: "Read the work order and the chemical's safety data sheet",
      cue: "At the board: the calibration due on the feed pump, the chemical's SDS — its hazards, the PPE it calls for, first aid and what it must never contact — and the lockout for the pump.",
      why: "The safety data sheet is the chemical's own instructions for surviving contact with it, and 29 CFR 1910.1200 puts it in front of every worker who handles it. Reading it before the job tells the operator which gloves and face protection this chemical actually needs, what the first aid is, and what it must never be mixed with — none of which is safe to remember from a different chemical at a different plant.",
    },
    {
      id: "gear", kind: "sequence", anyOrder: true,
      targets: ["ppe-goggles", "ppe-shield", "ppe-gloves", "ppe-apron"],
      itemNames: { "ppe-goggles": "chemical splash goggles", "ppe-shield": "face shield over them", "ppe-gloves": "chemical-resistant gloves the SDS names", "ppe-apron": "chemical-resistant apron" },
      title: "Put on the splash protection the SDS calls for",
      cue: "Splash goggles, the face shield over them, the chemical-resistant gloves, and the apron.",
      why: "A splash from a pressurised feed line travels sideways and upward as easily as down, so goggles sealed round the eyes come first and the face shield goes over them — a shield alone lets spray in underneath. Gloves are chosen by the chemical, because a glove material that stops one chemical can be permeated by the next, which is why the SDS names it.",
    },
    {
      id: "feed-walk", kind: "find", noHint: true,
      targets: ["eyewash-blocked", "containment-crack"],
      itemNames: { "eyewash-blocked": "drums stacked in front of the eyewash", "containment-crack": "a crack in the skid's containment berm" },
      itemNotes: {
        "eyewash-blocked": "Two empty drums have been stacked in the path to the eyewash. ANSI Z358.1 wants the path clear so a person who cannot see can reach it in seconds; the drums are moved before the job starts.",
        "containment-crack": "The containment berm under the feed skid has a crack at one corner. A leak would run out through it to the floor drain; it is reported and a temporary berm set before any line is opened.",
      },
      title: "Walk the feed area before touching the skid",
      cue: "Look along the route to the eyewash and shower, and round the containment berm under the tanks and pump.",
      why: "The eyewash and the containment are the two things that make a chemical feed job survivable when it goes wrong, and both are checked before the job, when a blocked path or a cracked berm costs a few minutes. Found after a splash, a blocked eyewash is seconds lost that the eye cannot spare.",
    },
    {
      id: "eyewash-flush", kind: "hold", target: "eyewash",
      seconds: 5,
      title: "Flush the eyewash to prove it runs clean",
      cue: "Push the eyewash paddle and hold it until the water runs clear and even from both heads.",
      why: "An eyewash that sits unused collects rust, sediment and bacteria in its line, and the first water out is exactly what a damaged eye must not receive. Activating it on the plant's schedule, as ANSI Z358.1 expects, clears the line and proves the flow before anyone depends on it today.",
      holdBreakNote: "The paddle came off before the water ran clear. Hold it until both heads run clean and even.",
    },
    {
      id: "lockout", kind: "sequence",
      targets: ["pump-disconnect", "valves-closed", "lock-applied"],
      itemNames: { "pump-disconnect": "pump disconnect off", "valves-closed": "suction and discharge valves closed", "lock-applied": "personal lock and tag on the disconnect" },
      title: "Lock out the metering pump",
      cue: "Disconnect off, the suction and discharge valves closed, then your own lock and tag on the disconnect.",
      why: "A metering pump can start on its controller at any moment, and it moves chemical, not just motion, so both its power and its liquid path are isolated before a fitting is touched. The operator's own lock on the disconnect is what 29 CFR 1910.147 relies on — a switch someone else turned off can be turned back on by someone who does not know you are there.",
      outOfOrderNote: "Out of order — the disconnect goes off first, then the valves are closed, and your lock and tag go on last.",
    },
    {
      id: "bleed", kind: "turn", target: "bleed-valve",
      title: "Bleed the trapped pressure from the discharge line",
      cue: "Turn the bleed valve slowly, aimed into the containment, until the discharge gauge falls to zero.",
      why: "Closing the valves traps pressure in the line between them, and that pressure is still there after the lockout. Bleeding it slowly through the valve built for it, pointed into the containment, empties it in a controlled trickle instead of a spray from whichever fitting is loosened first.",
      turn: { turns: 1.25, label: "BLEED VALVE", readout: (t) => (t < 0.3 ? "line under pressure" : t < 0.9 ? "bleeding into containment" : "gauge at zero") },
    },
    {
      id: "drip-tray", kind: "drag", target: "drip-tray",
      title: "Set the drip tray under the fitting",
      cue: "Carry the drip tray to the mark under the discharge fitting before it is opened.",
      why: "Even a bled line holds a little chemical that runs out when the fitting opens, and a tray under it keeps those drops off the floor, boots and the drain. It goes on the mark directly under the fitting because a tray to one side catches nothing and leaves a puddle the next person walks through.",
      drag: { to: "tray-mark", radius: 0.5, missNote: "Not on the mark — the tray sits directly under the discharge fitting." },
    },
    {
      id: "calibrate", kind: "track", target: "cal-column", seconds: 7,
      title: "Calibrate the pump on the draw-down column",
      cue: "With the pump back in service drawing from the calibration column, keep the column's draw steady so the timed drop is true.",
      why: "The pump is calibrated by timing how fast it draws the level down in the graduated column, which is the only honest check that the dose the controller asks for is the dose going into the process. An unsteady draw — valves half-open, air in the suction — gives a number that is wrong in a way no one notices until the process drifts.",
      track: { start: 0.2, green: [0.4, 0.6], rise: 0.53, fall: 0.45, drift: 0.13, label: "CALIBRATION DRAW", readout: (v) => (v < 0.4 ? "air in the suction — stalling" : v > 0.6 ? "surging — valve not seated" : "steady draw on the column") },
      holdBreakNote: "The draw stalled or surged and the timing was lost. Bring the column back to a steady draw.",
    },
    {
      id: "dose-read", kind: "gauge", target: "dose-gauge",
      title: "Read the dose against the controller's setpoint",
      cue: "Read the timed draw-down on the column against the controller's setpoint band and commit it.",
      why: "Nutrient removal depends on the dose matching what the process needs: too little and the nitrogen or phosphorus stays in the effluent; too much wastes chemical and can upset the next stage. The column reading against the setpoint is what the controller's adjustment is based on, so it is read level and committed, not rounded to what it usually is.",
      gauge: { label: "DOSE vs SETPOINT", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "reading the meniscus edge" : t <= 0.6 ? "inside the setpoint band" : "column still settling"), missNote: "Outside the band — read the column level at the meniscus against the setpoint again." },
    },
    {
      id: "basin-walk", kind: "find", noHint: true,
      targets: ["grating-gap", "ring-missing"],
      itemNames: { "grating-gap": "a grating panel lifted out of the walkway", "ring-missing": "the ring buoy gone from its post" },
      itemNotes: {
        "grating-gap": "A grating panel has been lifted for access and left out, leaving a hole in the walkway beside the basin. It is barricaded and put back before the round continues.",
        "ring-missing": "The ring buoy's post is empty. It is reported and replaced from the spare — though in aerated water a ring may not keep a person up, it is the first thing thrown while the blowers are shut off.",
      },
      title: "Walk the aeration basin's walkway",
      cue: "Look along the walkway's grating and rail, and at the rescue equipment on its posts.",
      why: "The basin walkway is where operators spend much of their day beside deep, moving water, and 29 CFR 1910.22 and 1910.23 expect its surface whole and its rail continuous. The rescue gear is checked on the same walk, because the plant's plan for a person in an aerated tank — shut off the air, throw the ring, never go in after them — only works if the gear is on its post.",
    },
    {
      id: "probe-pull", kind: "hold", target: "probe-pole",
      seconds: 5,
      title: "Lift the dissolved-oxygen probe for cleaning",
      cue: "From behind the rail, hold the probe pole steady as you lift the probe clear of the basin.",
      why: "A dissolved-oxygen probe fouls with biological growth and starts reading low, which makes the blowers run harder than the process needs. It is lifted on its pole from behind the rail so the operator's body never crosses it, and held steady so the probe does not swing into the rail and crack its membrane.",
      holdBreakNote: "The pole dipped and the probe swung back into the basin. Hold it steady until it is clear of the water.",
    },
    {
      id: "do-read", kind: "gauge", target: "do-meter",
      title: "Read the basin's dissolved oxygen after cleaning",
      cue: "With the cleaned probe back in the basin, read the dissolved oxygen against the process band on the meter.",
      why: "The blowers are the biggest energy user at most treatment plants and the microbes that remove nitrogen depend on the oxygen they supply, so the reading after cleaning tells the operator whether the air control is doing its job. A reading taken before the probe has settled describes the air, not the basin.",
      gauge: { label: "DISSOLVED OXYGEN", speed: 0.72, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "probe still settling" : t <= 0.58 ? "inside the process band" : "bubble on the membrane — wait"), missNote: "Outside the band — let the probe settle and read the dissolved oxygen again." },
    },
    {
      id: "rounds-log", kind: "select", target: "rounds-log",
      title: "Write the rounds log",
      cue: "Log the blocked eyewash cleared and the cracked berm, the lockout and the bleed, the calibration and the dose, the spraying fitting, the grating and the ring buoy, the oxygen read and the coworker at the rail.",
      why: "The rounds log is how the next shift inherits the plant: a cracked berm, a fitting that sprayed and a missing ring are repairs someone has to know about, and the calibration and oxygen reads are the record the process decisions are made from. Near misses go in plainly, because they are the cheapest warnings a plant ever gets.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the shift",
      cue: "On the radio: the pump calibrated and back in service, the repairs reported, and how your coworker is after a spray at the skid and a lean over the rail.",
      why: "A spray of chemical and a lean over an aeration basin are both near misses, and the check-in names them while the shift is still together, including how the people involved are doing. The member assistance line is there for anything still with someone after the radio goes quiet.",
    },
  ],

  interrupts: [
    {
      id: "fitting-spray",
      kind: "Fitting spraying",
      after: "calibrate", delay: 3, seconds: 12,
      alert: "A hose fitting on the calibration column has let go and sprayed your coworker across the forearm and the side of his face shield.",
      cue: "Get him to the safety shower and start the flush.",
      target: "safety-shower",
      why: "Chemical on skin is washed off with a lot of water for a long time, and the minutes it takes to decide are minutes the chemical is working. The safety shower is there for exactly this, sited near the hazard as ANSI Z358.1 expects, and the flush starts before anyone reads the rest of the SDS or calls anyone.",
      missNote: "The spray went unattended while the calibration ran; the coworker wiped his arm on his sleeve and kept working, and the chemical kept working on his skin under the wet cloth.",
      wrongNote: "The safety shower — get him under it and start the flush now.",
    },
    {
      id: "hat-in-basin",
      kind: "Coworker reaching over the rail",
      after: "probe-pull", delay: 2, seconds: 12,
      alert: "A coworker's hard hat has blown into the basin and he is leaning over the rail to grab it.",
      cue: "Call him back and hook the hat out with the reach pole from behind the rail.",
      target: "reach-pole",
      why: "Nothing in an aeration basin is worth leaning over the rail for, and a hard hat least of all. The reach pole is racked on the walkway so that anything that falls in is fetched from behind the rail — a person who follows it in is in water that may not hold them up, which is why the plant's rule is that nobody reaches and nobody goes in.",
      missNote: "He kept leaning, his boot slipped on the wet grating and only the rail across his hips stopped him going over into the bubbling water.",
      wrongNote: "The reach pole — call him back and fetch the hat from behind the rail.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BKNF_ACCENT);

    // ------------------------------------------------------- slab and basin
    const slab = box(g, 16, 0.04, 12, 0, 0.02, 0, 0xffffff, { rough: 0.9 });
    slab.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#8e8a80", base2: "#848076", seam: "rgba(0,0,0,0.3)" }), { repeat: 5, px: 512 }), { rough: 0.9, color: 0xdcd8ce });
    const basin = group(g, 0, 0, -4.2);
    for (const [w, d, x, z] of [[10, 0.3, 0, -1.8], [10, 0.3, 0, 1.8], [0.3, 3.9, -5, 0], [0.3, 3.9, 5, 0]]) box(basin, w, 1.0, d, x, 0.5, z, 0x9a968e, { rough: 0.95 });
    const water = box(basin, 9.7, 0.02, 3.3, 0, 0.8, 0, 0xffffff, { rough: 0.3, metal: 0.2, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#5a5a3a", mid: "#6a6a44" }), { repeat: 3, px: 256 }), { rough: 0.3, metal: 0.2, color: 0xc8c4a0 });
    const bubbles = group(basin, 0, 0.82, 0);
    for (let i = 0; i < 18; i++) ball(bubbles, 0.05, -4.2 + (i % 9) * 1.05, 0, (i < 9 ? -0.7 : 0.7), 0xf2f2e6, { rough: 0.2, seg: 6, seg2: 4 });
    // Walkway along the near side with rail and grating.
    const walkway = box(g, 10, 0.08, 1.0, 0, 1.0, -2.0, 0x6f767d, { rough: 0.6, metal: 0.5 });
    void walkway;
    for (let i = -4.5; i <= 4.5; i += 1.5) cyl(g, 0.025, 0.025, 1.05, i, 1.55, -2.45, 0xf2c14b, { rough: 0.5, seg: 8 });
    box(g, 10, 0.05, 0.05, 0, 2.05, -2.45, 0xf2c14b, { rough: 0.5 });
    box(g, 10, 0.04, 0.04, 0, 1.55, -2.45, 0xf2c14b, { rough: 0.5 });
    for (const x of [-4.8, 4.8]) { const st = group(g, x, 0, -1.2); for (let i = 0; i < 4; i++) box(st, 0.8, 0.05, 0.25, 0, 0.2 + i * 0.25, -i * 0.2, 0x6f767d, { rough: 0.6, metal: 0.5 }); }
    const gap = box(g, 0.8, 0.02, 0.8, 1.6, 1.05, -2.0, 0x1b1e22, { rough: 1 });
    reg(hits, gap, "grating-gap");
    const panelOut = box(g, 0.8, 0.04, 0.8, 2.6, 1.08, -1.9, 0x6f767d, { rough: 0.6, metal: 0.5 });
    const ringPost = group(g, -2.6, 1.04, -2.1);
    cyl(ringPost, 0.03, 0.03, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    box(ringPost, 0.2, 0.06, 0.06, 0, 1.1, 0, 0x8a949d, { rough: 0.5 });
    reg(hits, ringPost, "ring-missing");
    const ring = torus(g, 0.25, 0.06, -2.6, 2.0, -2.0, 0xf06a2b, { rough: 0.6, seg: 8, seg2: 18 });
    ring.visible = false;
    const reachPole = group(g, -3.6, 1.04, -1.7);
    cyl(reachPole, 0.02, 0.02, 2.2, 0, 1.0, 0, 0xe0a040, { rough: 0.5, seg: 6 }).rotation.z = 0.15;
    holoTag(reachPole, "reach pole", 0, 2.3, 0, { css: "#b07ad8", w: 0.2 });
    reg(hits, reachPole, "reach-pole");
    const probePole = group(g, 0.4, 1.04, -2.2);
    const probeShaft = cyl(probePole, 0.02, 0.02, 1.8, 0, 0.5, -0.4, 0x2f4d5f, { rough: 0.5, seg: 6 });
    probeShaft.rotation.x = -0.5;
    const probeHead = cyl(probePole, 0.05, 0.05, 0.2, 0, -0.2, -0.9, 0x1b1e22, { rough: 0.5, seg: 8 });
    holoTag(probePole, "DO probe pole", 0, 1.6, 0, { css: "#b07ad8", w: 0.28 });
    reg(hits, probePole, "probe-pole");
    const doMeter = decal(g, 0.3, 0.22, -0.6, 1.9, -2.42, (cx, w, h) => { cx.fillStyle = "#1b1e22"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.font = "bold 36px monospace"; cx.fillText("DO --", 10, h / 2 + 12); }, { px: 128 });
    holoTag(g, "DO meter", -0.6, 2.2, -2.42, { css: "#b07ad8", w: 0.2 });
    reg(hits, doMeter, "do-meter");
    const railHit = box(g, 0.6, 0.4, 0.4, 3.4, 1.9, -2.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean over the rail to look?", 3.4, 2.35, -2.4, { css: "#e8622a", w: 0.5 });
    reg(hits, railHit, "reach-over-rail");
    const mate = standingFigure(g, -1.6, -2.0, { ry: Math.PI, cloth: 0x2f4d5f, vest: 0xf2c14b, helmet: 0xf2f2ee });
    mate.position.y = 1.04;
    const mateHome = mate.position.clone();
    const floatHat = ball(g, 0.14, -1.6, 0.86, -3.4, 0xf2f2ee, { rough: 0.5, seg: 8, seg2: 6 });
    floatHat.visible = false;

    // ----------------------------------------------- chemical feed skid
    const skid = group(g, 3.2, 0.04, 2.0);
    const berm = box(skid, 3.4, 0.2, 2.4, 0, 0.1, 0, 0xb8b4aa, { rough: 0.9 });
    void berm;
    box(skid, 3.2, 0.02, 2.2, 0, 0.21, 0, 0x6a6a74, { rough: 0.7 });
    const crack = box(skid, 0.04, 0.22, 0.5, 1.7, 0.1, 0.9, 0x1b1e22, { rough: 1 });
    reg(hits, crack, "containment-crack");
    const tank = cyl(skid, 0.55, 0.55, 1.4, -0.8, 0.92, -0.3, 0xe8e4d8, { rough: 0.5, seg: 18 });
    decal(skid, 0.5, 0.35, -0.8, 1.1, 0.26, signFace("DAY TANK\nSEE SDS", { bg: "#f2f2ee", accent: "#b07ad8", fg: "#1b1e22", scale: 0.28 }), { px: 128 });
    void tank;
    const pump = group(skid, 0.6, 0.22, -0.2);
    box(pump, 0.5, 0.35, 0.35, 0, 0.18, 0, 0x2f4d5f, { rough: 0.5, metal: 0.4 });
    cyl(pump, 0.12, 0.12, 0.2, 0.3, 0.2, 0, 0x6f767d, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(pump, "metering pump", 0, 0.6, 0, { css: "#b07ad8", w: 0.28 });
    const disc = group(skid, 1.5, 0.22, -0.9);
    box(disc, 0.25, 0.35, 0.12, 0, 0.9, 0, 0x6f767d, { rough: 0.5, metal: 0.5 });
    cyl(disc, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x8a949d, { rough: 0.5, seg: 6 });
    const discHandle = box(disc, 0.04, 0.14, 0.04, 0.14, 0.95, 0, 0xd2312b, { rough: 0.5 });
    holoTag(disc, "pump disconnect", 0, 1.3, 0, { css: "#b07ad8", w: 0.3 });
    reg(hits, disc, "pump-disconnect");
    const valves = group(skid, 0.0, 0.3, 0.4);
    for (const x of [-0.25, 0.25]) { cyl(valves, 0.04, 0.04, 0.12, x, 0.1, 0, 0x6f767d, { rough: 0.5, metal: 0.6, seg: 8 }); box(valves, 0.12, 0.02, 0.02, x, 0.18, 0, 0xd2312b, { rough: 0.5 }); }
    holoTag(valves, "suction + discharge valves", 0, 0.45, 0, { css: "#b07ad8", w: 0.44 });
    reg(hits, valves, "valves-closed");
    const lock = group(disc, 0, 0.72, 0.08);
    const lockBody = box(lock, 0.06, 0.08, 0.03, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    lockBody.visible = false;
    box(lock, 0.14, 0.14, 0.02, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, lock, "lock-applied");
    const bleed = group(skid, 1.0, 0.5, 0.3);
    cyl(bleed, 0.03, 0.03, 0.1, 0, 0, 0, 0x6f767d, { rough: 0.5, metal: 0.6, seg: 8 });
    const bleedKnob = box(bleed, 0.1, 0.02, 0.02, 0, 0.06, 0, 0xe0a040, { rough: 0.5 });
    holoTag(bleed, "bleed valve", 0, 0.25, 0, { css: "#b07ad8", w: 0.22 });
    reg(hits, bleed, "bleed-valve");
    const trayMark = group(skid, 1.0, 0.23, 0.6);
    const trayRing = torus(trayMark, 0.3, 0.012, 0, 0.01, 0, BKNF_ACCENT, { emissive: BKNF_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    trayRing.rotation.x = Math.PI / 2;
    hits["tray-mark"] = trayMark;
    const tray = group(g, 6.0, 0.04, 3.6);
    box(tray, 0.5, 0.06, 0.35, 0, 0.03, 0, 0x2a2e33, { rough: 0.6 });
    holoTag(tray, "drip tray", 0, 0.3, 0, { css: "#b07ad8", w: 0.2 });
    reg(hits, tray, "drip-tray");
    const col = group(skid, -0.2, 0.22, 0.8);
    const colTube = cyl(col, 0.06, 0.06, 1.0, 0, 0.5, 0, 0xdce8f0, { rough: 0.1, opacity: 0.6, transparent: true, seg: 12 });
    void colTube;
    const colFluid = cyl(col, 0.05, 0.05, 0.7, 0, 0.36, 0, 0xb07ad8, { rough: 0.3, seg: 12 });
    holoTag(col, "calibration column", 0, 1.2, 0, { css: "#b07ad8", w: 0.36 });
    reg(hits, col, "cal-column");
    const doseGauge = decal(skid, 0.3, 0.22, -1.5, 1.2, 0.2, (cx, w, h) => { cx.fillStyle = "#1b1e22"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#b07ad8"; cx.font = "bold 30px monospace"; cx.fillText("SET --", 8, h / 2 + 10); }, { px: 128 });
    holoTag(skid, "dose controller", -1.5, 1.5, 0.2, { css: "#b07ad8", w: 0.3 });
    reg(hits, doseGauge, "dose-gauge");
    const liveHit = box(g, 0.4, 0.4, 0.4, 4.2, 0.6, 2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "loosen the fitting with it running?", 4.2, 1.0, 2.6, { css: "#e8622a", w: 0.6 });
    reg(hits, liveHit, "open-line-live");
    const drums = group(g, 6.4, 0.04, 0.8);
    for (const [x, c] of [[0, 0x2f6fb8], [0.7, 0xe8e4d8]]) cyl(drums, 0.28, 0.28, 0.85, x, 0.43, 0, c, { rough: 0.6, seg: 14 });
    const mixHit = box(g, 0.5, 0.4, 0.5, 6.7, 1.1, 0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "tip one tote into the other drum?", 6.7, 1.45, 0.8, { css: "#e8622a", w: 0.58 });
    reg(hits, mixHit, "mix-chemicals");
    const pourHit = box(g, 0.5, 0.4, 0.5, 2.0, 1.9, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pour a drum into the day tank?", 2.0, 2.3, 1.6, { css: "#e8622a", w: 0.54 });
    reg(hits, pourHit, "pour-overhead");

    // Eyewash, shower and the drums in its path.
    const eye = group(g, -0.6, 0.04, 3.0);
    cyl(eye, 0.04, 0.04, 1.0, 0, 0.5, 0, 0x2f9a4a, { rough: 0.5, seg: 8 });
    cyl(eye, 0.2, 0.15, 0.08, 0, 1.02, 0, 0x2f9a4a, { rough: 0.5, seg: 12 });
    const eyePaddle = box(eye, 0.2, 0.04, 0.06, 0, 0.9, 0.2, 0xe8e21e, { rough: 0.5 });
    holoTag(eye, "eyewash", 0, 1.35, 0, { css: "#b07ad8", w: 0.2 });
    reg(hits, eye, "eyewash");
    const eyeFlow = cyl(eye, 0.02, 0.05, 0.2, 0, 1.15, 0, 0xbfe0f0, { rough: 0.1, opacity: 0.6, transparent: true, cast: false, seg: 8 });
    eyeFlow.visible = false;
    const blockDrums = group(g, -0.2, 0.04, 2.2);
    for (const x of [0, 0.5]) cyl(blockDrums, 0.25, 0.25, 0.8, x, 0.4, 0, 0x3a3f45, { rough: 0.6, seg: 12 });
    reg(hits, blockDrums, "eyewash-blocked");
    const shower = group(g, -1.8, 0.04, 3.2);
    cyl(shower, 0.04, 0.04, 2.3, 0, 1.15, 0, 0x2f9a4a, { rough: 0.5, seg: 8 });
    cyl(shower, 0.25, 0.25, 0.05, 0.25, 2.3, 0, 0x2f9a4a, { rough: 0.5, seg: 12 });
    box(shower, 0.03, 0.4, 0.03, 0.35, 1.9, 0, 0xe8e21e, { rough: 0.5 });
    holoTag(shower, "safety shower", 0, 2.6, 0, { css: "#b07ad8", w: 0.28 });
    reg(hits, shower, "safety-shower");
    const showerFlow = cyl(shower, 0.05, 0.25, 1.9, 0.25, 1.3, 0, 0xbfe0f0, { rough: 0.1, opacity: 0.4, transparent: true, cast: false, seg: 10 });
    showerFlow.visible = false;
    const coworker = standingFigure(g, 1.2, 3.2, { ry: -1.2, cloth: 0x3f4a55, vest: 0xf2c14b, helmet: 0xf2f2ee, gloves: true });
    holoTag(coworker, "second operator", 0, 1.95, 0, { css: "#b07ad8", w: 0.3 });
    const sprayJet = cyl(g, 0.01, 0.06, 0.5, 2.9, 0.9, 2.8, 0xb07ad8, { rough: 0.2, opacity: 0.6, transparent: true, cast: false, seg: 8 });
    sprayJet.rotation.z = 1.2; sprayJet.visible = false;

    // ------------------------------------------- boards, gear, radio
    const gear = group(g, -4.6, 0.04, 2.6, 0.4);
    box(gear, 1.1, 0.05, 0.4, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(gear, 1.0, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["ppe-goggles", -0.39, 0x2a2e33, "GOGGLES"], ["ppe-shield", -0.13, 0xdce8f0, "SHIELD"], ["ppe-gloves", 0.13, 0x2f6f3a, "GLOVES"], ["ppe-apron", 0.39, 0xe8e21e, "APRON"]]) {
      const it = group(gear, dx, 0.8, 0);
      box(it, 0.2, 0.08, 0.16, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.18, 0.05, 0, 0.041, 0, signFace(label, { bg: "#1b1e22", accent: "#b07ad8", scale: 0.45 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const order = decal(g, 0.56, 0.4, -3.0, 1.25, 4.2, paperFace("WORK ORDER — FEED PUMP CALIBRATION", ["SDS: read · PPE as it names", "Lockout: disconnect + valves", "Bleed into containment", "Calibrate on the column", "Rounds: basin walkway, DO probe"], { bg: "#f4ecdc", band: "#b07ad8" }), { px: 320 });
    cyl(g, 0.03, 0.035, 1.0, -3.0, 0.5, 4.18, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, order, "work-order");
    const logBoard = decal(g, 0.46, 0.34, -1.2, 1.2, 4.3, paperFace("ROUNDS LOG", ["Feed: —", "Dose: —", "Basin: —", "Remarks: —"], { bg: "#f4ecdc", band: "#6b7178" }), { px: 256 });
    cyl(g, 0.03, 0.035, 1.0, -1.2, 0.5, 4.28, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "rounds-log");
    const radioPost = group(g, 0.6, 0.04, 4.4);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "shift radio", 0, 1.3, 0, { css: "#b07ad8", w: 0.24 });
    reg(hits, radioBody, "crew-radio");
    const blower = group(g, -6.4, 0.04, -0.2);
    box(blower, 1.4, 1.0, 1.0, 0, 0.5, 0, 0x2f4d5f, { rough: 0.5, metal: 0.4 });
    cyl(blower, 0.2, 0.2, 1.6, 0.9, 0.7, 0, 0x6f767d, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(blower, "aeration blower", 0, 1.4, 0, { css: "#b07ad8", w: 0.3 });
    void CITY; void panelOut;

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(1.5, 0.8, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "feed-walk") { blockDrums.position.set(-3.2, 0.04, 1.6); crack.material = mat(0xf2c14b, { rough: 0.6 }); }
        if (step.id === "eyewash-flush") eyeFlow.visible = false;
        if (step.id === "lockout") { lockBody.visible = true; discHandle.rotation.z = Math.PI / 2; }
        if (step.id === "bleed") bleedKnob.rotation.y = Math.PI / 2;
        if (step.id === "drip-tray") { tray.position.set(4.2, 0.27, 2.6); trayRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); lockBody.visible = false; }
        if (step.id === "dose-read") repaint(doseGauge, (cx, w, h) => { cx.fillStyle = "#1b1e22"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.font = "bold 30px monospace"; cx.fillText("SET OK", 8, h / 2 + 10); });
        if (step.id === "basin-walk") { gap.visible = false; panelOut.position.set(1.6, 1.04, -2.0); ring.visible = true; }
        if (step.id === "do-read") repaint(doMeter, (cx, w, h) => { cx.fillStyle = "#1b1e22"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.font = "bold 36px monospace"; cx.fillText("DO OK", 10, h / 2 + 12); });
        if (step.id === "rounds-log") repaint(logBoard, paperFace("ROUNDS LOG", ["Feed: eyewash cleared · berm reported", "Dose: calibrated · in band", "Basin: grating back · ring replaced", "Spray: flushed · hat fetched by pole"], { bg: "#f4ecdc", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "fitting-spray") sprayJet.visible = true;
        if (it.id === "hat-in-basin") { floatHat.visible = true; mate.rotation.x = -0.35; mate.position.z = mateHome.z - 0.3; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fitting-spray") { sprayJet.visible = false; showerFlow.visible = true; coworker.position.set(-1.55, 0, 3.2); }
        if (it.id === "hat-in-basin") { floatHat.position.set(-3.4, 1.9, -2.0); mate.rotation.x = 0; mate.position.z = mateHome.z; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.01; waterTex.offset.y = Math.sin(t * 0.5) * 0.01; }
        if (session?.turn && step?.id === "bleed") bleedKnob.rotation.y = session.turn.amount * Math.PI;
        if (step?.id === "eyewash-flush") { eyeFlow.visible = true; eyePaddle.rotation.x = 0.4; }
        if (step?.id === "calibrate") colFluid.scale.y = 0.5 + (session.track?.v ?? 0.5) * 0.5;
        if (step?.id === "probe-pull") probeHead.position.y = -0.2 + (session.hold?.progress ?? 0) * 0.6;
        void dt;
      },
    };
  },
};
