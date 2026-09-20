import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, pipeRun, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Landfill Gas VR — Environmental Monitoring, station five.
// Tuning a gas extraction well on the wellfield of a municipal landfill.
//
// The counterintuitive part is the whole lesson. Everywhere else on a
// collection system, more vacuum sounds like more gas collected and therefore
// better. On a landfill well it is the opposite: pull too hard and the well
// stops drawing landfill gas and starts drawing air in through the cover, and
// oxygen in a warm anaerobic waste mass is how a subsurface fire starts —
// something that burns for months underground and cannot be put out from the
// surface. So the operator tunes by watching what comes out, not by opening
// the valve: methane holding up, oxygen staying near nothing, and the
// wellhead temperature where the operating plan says it belongs.
//
// The second half of the job happens at the fence. Methane migrates through
// soil, and the rule is about where it ends up rather than where it came
// from: 40 CFR 258.23 caps methane at the lower explosive limit at the
// facility property boundary, and at a quarter of it inside site buildings.

const LFG_ACCENT = 0xa3b83c;

export const SIM_LANDFILL_GAS = {
  id: "landfill-gas",
  index: "62",
  domain: "Environmental",
  trade: "Landfill gas technician / wellfield operator",
  category: "Environmental Monitoring",
  weather: "wind",
  certification: "LIUNA and IUOE landfill and wellfield crews; SWANA Manager of Landfill Operations; 40 CFR 258.23 methane monitoring at the property boundary and in site structures; the NSPS gas collection and control requirements for landfills at 40 CFR 60, including the 55 °C wellhead operating temperature those standards have used; OSHA 29 CFR 1910.146 where a knockout or manhole is entered",
  name: "Landfill Gas",
  title: simTitle("Landfill Gas"),
  tagline: "Tuning an extraction well: knockout drained, analyser proven, methane and oxygen and temperature read before the valve is touched, and a perimeter probe that decides whether any of it was enough",
  accent: LFG_ACCENT,
  accentCss: "#a3b83c",
  parSeconds: 270,
  footprint: 2.2,
  badge: { id: "field-balanced", name: "Field Balanced", note: "A well tuned on what comes out of it rather than on how far the valve was opened" },

  game: system({
    name: "Wellfield Authority",
    currency: "SCFM",
    ranks: ["Field Hand", "Wellfield Technician", "Lead Technician", "Gas System Supervisor", "Wellfield Authority Certified"],
    badges: [
      { id: "no-air-in", name: "No Air Drawn In", note: "Oxygen held down: the well was never opened past what the gas quality would carry", test: AWARD.stepClean("tune") },
      { id: "proven-meter", name: "Proven Meter", note: "Never took a reading on an analyser that had not been proven that morning", test: AWARD.safe },
      { id: "read-twice", name: "Read Twice", note: "Re-read the well after tuning instead of writing down the number they wanted", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-round", name: "Clean Round", note: "No corrections through the whole well round", test: AWARD.clean },
      { id: "held-the-vacuum", name: "Held The Vacuum", note: "Held the applied vacuum steady while the well settled", test: AWARD.unbroken },
      { id: "round-on-time", name: "Round On Time", note: "Well tuned and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "crank-open": "You opened the wellhead valve wide to pull more gas. That is the one move this job is about not making. Past the point the waste mass can supply, the extra vacuum stops pulling landfill gas and starts pulling air down through the cover — and oxygen in warm anaerobic waste starts a subsurface fire, which burns underground for months, cannot be extinguished from the surface, and ends with the cover excavated and the field shut down.",
    "spark-tool": "You brought a non-rated tool to an open wellhead. What comes out of that port is about half methane and it is coming out under vacuum at the sample line and under pressure the moment the vacuum drops. A wellfield is a classified area at the wellhead for the same reason a gas main is.",
    "sniff-port": "You leaned over the open sample port. Landfill gas is roughly half methane and half carbon dioxide and it displaces the air it meets: there is no oxygen in the plume coming out of that port, and a lungful of it puts you on the ground beside a well nobody is watching.",
    "skip-cal": "You took the readings on an analyser that had not been proven that morning. Every number in this job is a decision — open the valve, close the valve, call the engineer — and an uncalibrated meter makes all three of them for you, wrongly, and writes them in a log the regulator reads.",
  },

  lateNotes: {
    "wellhead-valve": "The valve is adjusted after the gas is read, not before — the reading is what says which way to turn it.",
    "gem-analyser": "The analyser is proven against the calibration gas before it is believed.",
    "field-log": "The log is written after the re-read, with the number the well actually settled at.",
  },

  // Interruptions: see shared/game.js. Both are the wellfield-wide events an
  // operator meets while head-down at a single wellhead.
  interrupts: [
    {
      id: "flare-out",
      kind: "Flare lost",
      after: "tune", delay: 4, seconds: 13,
      alert: "The flare has gone out and the blower has tripped. Every well on the field is losing vacuum at once.",
      cue: "The thing that was pulling on this well has stopped pulling.",
      target: "flare-station",
      why: "The field has one set of lungs. With the blower down, every wellhead goes from vacuum toward positive pressure, and gas that was being collected starts coming out of the cover and moving sideways through the soil instead. Tuning a single well against a dead field is measuring nothing — the flare comes first.",
      missNote: "You went on adjusting a well with no vacuum on it. Every number taken in that window described a field that was venting to atmosphere, and they all went in the log as if they meant something.",
      wrongNote: "Not that. The blower and the flare are the field's vacuum, and nothing at this wellhead means anything until they are back.",
    },
    {
      id: "probe-alarm",
      kind: "Perimeter methane",
      after: "recheck", delay: 4, seconds: 12,
      alert: "The perimeter probe on the west boundary has gone into alarm. There is methane at the fence line.",
      cue: "Something is at the property boundary, and the boundary is where the limit is.",
      target: "boundary-probe",
      why: "258.23 is written about the property boundary, not about the waste. Methane at the fence means it has travelled through soil to somewhere the rule says it must not be, and the reading at the probe is what decides whether this is a tuning problem or an evacuation and a notification. It gets read before anything else is touched.",
      missNote: "The alarm stood unanswered while you finished the well. Methane at a boundary probe moves toward whatever is on the other side of that fence, which on this site is a row of houses with basements.",
      wrongNote: "That is not the probe. A boundary alarm is read at the boundary, and it is read now.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "wellfield-map",
      title: "Read the well's history",
      cue: "Take the map and last month's readings for this well: methane, oxygen, temperature, and where the valve was left.",
      why: "A wellfield is tuned against its own history. One reading says almost nothing; the same well trending down in methane and up in oxygen over three rounds says the cover is leaking near it, and that is a different job from turning a valve.",
    },
    {
      id: "knockout", kind: "turn", target: "knockout-drain",
      title: "Drain the condensate knockout",
      cue: "Open the drain on the knockout and let the leg clear.",
      why: "Condensate collects at the low points of every lateral and a flooded leg puts a water seal across the pipe. Downstream of it the vacuum reads fine at the blower and is worth nothing at the wellhead, and the well you are about to tune is the one at the far end of it.",
      turn: { turns: 0.4, axis: "y", label: "KNOCKOUT DRAIN" },
    },
    {
      id: "calibrate", kind: "select", target: "cal-gas",
      title: "Prove the analyser",
      cue: "Run the calibration gas through the analyser and confirm it reads what is on the bottle.",
      why: "The analyser is the instrument every decision on this round is made with, and it drifts. Proven against a known bottle at the start of the round, it is evidence; unproven, it is a number that will be in a log a regulator reads.",
    },
    {
      id: "open-port", kind: "select", target: "sample-port",
      title: "Open the sample port and purge the line",
      cue: "Connect at the port, purge the sample line, and stand out of the plume.",
      why: "The first thing through a sample line is whatever was in the line, not whatever is in the well. Purged first, and read from beside the wellhead rather than over it — what comes out of that port has no oxygen in it at all.",
    },
    {
      id: "methane", kind: "gauge", target: "gem-analyser",
      title: "Read the methane",
      cue: "Commit on the methane percentage the analyser settles at.",
      why: "Around half methane is a well drawing what the waste is making. A number well below that, with the oxygen up, is a well drawing air rather than gas — and the fix for that is closing the valve, not opening it.",
      gauge: {
        label: "CH4", speed: 0.7, green: [0.42, 0.62],
        readout: (t) => `${(t * 80).toFixed(1)} %`,
        missNote: "That is not a well producing. Low methane with the oxygen up means air is coming in, and the valve closes rather than opens.",
      },
    },
    {
      id: "oxygen", kind: "gauge", target: "o2-readout",
      title: "Read the oxygen",
      cue: "Commit on the oxygen. Lower is the whole point.",
      why: "Oxygen is the number that decides whether this well is safe to keep pulling on. There is no oxygen in landfill gas, so any of it in the sample came in through the cover or a bad seal, and it is going into a warm waste mass that will use it.",
      gauge: {
        label: "O2", speed: 0.72, green: [0.0, 0.12],
        readout: (t) => `${(t * 18).toFixed(1)} %`,
        missNote: "That is air coming into the well. Close it in, find where it is getting in, and do not leave it pulling overnight at that reading.",
      },
    },
    {
      id: "temperature", kind: "gauge", target: "temp-probe",
      title: "Read the wellhead temperature",
      cue: "Commit on the wellhead temperature against the limit in the operating plan.",
      why: "Waste decomposing anaerobically runs warm and steady. A wellhead climbing past the limit the plan works to — the federal standards have used 55 °C — is the signature of a reaction that is no longer just decomposition, and it is reported rather than tuned around.",
      gauge: {
        label: "WELLHEAD", speed: 0.7, green: [0.2, 0.55],
        readout: (t) => `${Math.round(20 + t * 60)} °C`,
        missNote: "Above what the operating plan allows at a wellhead. That is not a tuning problem — it is reported, and the well gets closed in while somebody works out what is happening under it.",
      },
    },
    {
      id: "tune", kind: "turn", target: "wellhead-valve",
      title: "Set the valve on what you read",
      cue: "Turn the wellhead valve to the setting the readings call for.",
      why: "The valve is the last thing touched and it is turned to a number, not to a feeling. Methane holding and oxygen near nothing means the well can take a little more; methane down with oxygen up means it comes back, however much the field wants the flow.",
      turn: { turns: 0.35, axis: "y", label: "WELLHEAD VALVE" },
    },
    {
      id: "settle", kind: "track", target: "vacuum-gauge", seconds: 6,
      title: "Hold the applied vacuum while it settles",
      cue: "Hold the applied vacuum steady in the band and let the well come to it.",
      why: "A well does not answer immediately. Held steady, the reading walks to where the waste can actually supply; chased up and down, it never settles and the operator ends up tuning against their own hand.",
      track: {
        start: 0.12, green: [0.34, 0.56], rise: 0.5, fall: 0.45, drift: 0.12, label: "APPLIED VACUUM",
        readout: (v) => (v < 0.34 ? "barely on the well" : v > 0.56 ? "pulling hard enough to draw air" : "steady on the well"),
      },
      holdBreakNote: "Vacuum out of band — too little and the well is not collecting, too much and it is drawing through the cover. Bring it back and hold it.",
    },
    {
      id: "recheck", kind: "gauge", target: "gem-analyser",
      title: "Read it again after the change",
      cue: "Take the gas again at the new setting and commit on what the well actually settled at.",
      why: "A tune is not finished when the valve moves, it is finished when the well is re-read. The number that goes in the log is the one the well settled at, not the one the adjustment was aiming for.",
      gauge: {
        label: "CH4 AFTER", speed: 0.7, green: [0.44, 0.64],
        readout: (t) => `${(t * 80).toFixed(1)} %`,
        missNote: "The well did not come back to where the tune intended. Back the valve off and let it recover before it is left like that.",
      },
    },
    {
      id: "log", kind: "select", target: "field-log",
      title: "Log the well",
      cue: "Methane, oxygen, temperature, vacuum, valve position and the time.",
      why: "The log is the site's evidence that the field is operated the way the permit says. It is also the history the next technician tunes this well against, which is the reason the valve position goes in it and not just the gas.",
    },
    {
      id: "perimeter", kind: "gauge", target: "boundary-probe",
      title: "Read the perimeter probe",
      cue: "Take the west boundary probe and commit on the methane at the fence.",
      why: "Everything upstream of this is about collecting gas; this is the number that says whether the collection is working. 258.23 sets the limit at the lower explosive limit at the property boundary, because what matters is not how much gas the field made but whether any of it reached somewhere it must not be.",
      gauge: {
        label: "BOUNDARY CH4", speed: 0.75, green: [0.0, 0.14],
        readout: (t) => `${Math.round(t * 100)} % LEL`,
        missNote: "Methane at the fence above what the rule allows. That is a notification and an investigation, not a line in a log.",
      },
    },
    {
      id: "walk", kind: "find",
      targets: ["cracked-boot", "settled-cover", "surface-crack"],
      itemNames: { "cracked-boot": "split wellhead boot", "settled-cover": "settled cover", "surface-crack": "crack in the cap" },
      itemNotes: {
        "cracked-boot": "The rubber boot where the pipe leaves the cover has split. That is a direct path for air into the well, and it explains an oxygen reading better than anything the valve is doing.",
        "settled-cover": "The cover has settled into a dish around the wellhead, so it ponds. Standing water on a cap finds every crack in it and a settled cap is a cap that has been stretched.",
        "surface-crack": "There is a crack running off the side of the cap. Gas leaves through it and, under vacuum, air comes in through it — the same crack does both depending on which way the well is pulling.",
      },
      title: "Walk the cover around the well",
      cue: "Click the three things on this cap that decide the next reading.",
      why: "The cover is half the well. Almost every oxygen problem on a wellfield is a cover problem, so the walk-round is not a courtesy at the end of the job — it is the explanation for the numbers that were just written down.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, LFG_ACCENT);

    // -------------------------------------------------------------- the cap
    // A landfill cap: a low mound of cover soil with the wellhead coming out
    // of it, laterals running off to the header, and the fence beyond.
    const mound = cyl(g, 2.9, 3.3, 0.24, -0.1, 0.12, -0.5, 0x5f5a3a,
      { rough: 0.98, seg: 26, finish: "concrete", tile: [3, 3] });
    void mound;
    const grass = cyl(g, 2.86, 2.86, 0.02, -0.1, 0.25, -0.5, 0x6f7a3c, { rough: 1.0, seg: 26, cast: false });
    void grass;

    // ------------------------------------------------------------ the wellhead
    const well = group(g, -0.25, 0.24, -0.9, 0.3);
    // Casing out of the cap, the flexible boot at the surface, the tee above.
    cyl(well, 0.13, 0.15, 0.3, 0, 0.15, 0, 0x3c4450, { rough: 0.7, metal: 0.4, seg: 18 });
    const boot = cyl(well, 0.17, 0.2, 0.12, 0, 0.06, 0, 0x22262b, { rough: 0.95, seg: 18 });
    holoTag(well, "wellhead boot", 0, -0.12, 0.24, { css: "#8fa9c4", w: 0.3 });
    reg(hits, boot, "cracked-boot");
    cyl(well, 0.055, 0.055, 0.75, 0, 0.66, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 16 });
    box(well, 0.2, 0.14, 0.14, 0, 1.06, 0, 0x8a939b, { rough: 0.5, metal: 0.6 });
    const wellValve = valveWheel(well, 0.0, 1.28, 0, { color: 0xd8232a, body: 0x3c4450, r: 0.12 });
    holoTag(well, "Wellhead valve", 0, 1.66, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, wellValve.userData.wheel, "wellhead-valve");
    const port = cyl(well, 0.022, 0.022, 0.1, 0.16, 1.06, 0, 0xc9a227, { rough: 0.4, metal: 0.8, seg: 12 });
    port.rotation.z = Math.PI / 2;
    holoTag(well, "Sample port", 0.3, 1.18, 0, { css: "#f2c14b", w: 0.28 });
    reg(hits, port, "sample-port");
    const vacGauge = instrument(well, -0.24, 1.1, 0.02, { idle: '-- in H2O', color: 0x2b3138, w: 0.16, d: 0.14 });
    holoTag(well, "Applied vacuum", -0.24, 1.3, 0.02, { css: "#8fa9c4", w: 0.34 });
    reg(hits, vacGauge, "vacuum-gauge");
    const tempProbe = instrument(well, 0.22, 0.82, 0.08, { idle: "-- C", color: 0xf2894b, w: 0.14, d: 0.12 });
    holoTag(well, "Wellhead temperature", 0.34, 0.66, 0.08, { css: "#f2894b", w: 0.42 });
    reg(hits, tempProbe, "temp-probe");

    // The trap: a plain steel wrench on the cap, and the cap damage itself.
    const wrench = box(g, 0.28, 0.035, 0.055, 0.35, 0.28, -0.55, 0x9aa4ad, { rough: 0.45, metal: 0.8 });
    holoTag(g, "reach for the steel wrench?", 0.35, 0.52, -0.55, { css: "#d2312b", w: 0.52 });
    reg(hits, wrench, "spark-tool");
    const sniffSpot = box(g, 0.3, 0.3, 0.3, -0.05, 1.3, -0.74, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean over and smell it?", -0.05, 1.56, -0.74, { css: "#d2312b", w: 0.46 });
    reg(hits, sniffSpot, "sniff-port");
    const crankSpot = box(g, 0.26, 0.26, 0.26, -0.55, 1.52, -0.9, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "open it right up for more flow?", -0.62, 1.78, -0.9, { css: "#d2312b", w: 0.6 });
    reg(hits, crankSpot, "crank-open");

    const dish = cyl(g, 0.55, 0.62, 0.03, 0.55, 0.255, -1.35, 0x4c4a2e, { rough: 1.0, seg: 20, cast: false });
    holoTag(g, "settled, and it ponds", 0.55, 0.46, -1.35, { css: "#8fa9c4", w: 0.4 });
    reg(hits, dish, "settled-cover");
    const crack = box(g, 0.9, 0.012, 0.06, -1.2, 0.262, -1.5, 0x2b2118, { rough: 1.0, cast: false });
    crack.rotation.y = 0.5;
    holoTag(g, "crack off the cap", -1.2, 0.46, -1.5, { css: "#8fa9c4", w: 0.34 });
    reg(hits, crack, "surface-crack");

    // ------------------------------------------------- lateral, knockout, header
    pipeRun(g, [[-0.25, 0.9, -0.9], [-0.25, 0.9, 0.3], [1.5, 0.9, 0.3]], 0.05, 0x3c4450,
      { rough: 0.6, metal: 0.5 });
    const knockout = group(g, 1.5, 0, 0.55, -0.3);
    cyl(knockout, 0.22, 0.22, 0.85, 0, 0.45, 0, 0x4a5560, { rough: 0.6, metal: 0.45, seg: 20 });
    decal(knockout, 0.28, 0.1, 0, 0.72, 0.225, signFace("KNOCKOUT", { bg: "#1b2a12", accent: "#a3b83c", scale: 0.5 }));
    const drain = valveWheel(knockout, 0, 0.14, 0.2, { color: 0x1f7ae0, body: 0x2f3740, r: 0.09 });
    holoTag(knockout, "Condensate drain", 0, -0.08, 0.28, { css: "#4fd1ff", w: 0.38 });
    reg(hits, drain.userData.wheel, "knockout-drain");
    const puddle = cyl(g, 0.3, 0.3, 0.008, 1.5, 0.014, 0.92, 0x2f3a2a,
      { rough: 0.2, opacity: 0.75, transparent: true, seg: 18, cast: false });
    puddle.visible = false;

    // ----------------------------------------------------------- flare station
    const flare = group(g, 2.35, 0, -1.9, -0.5);
    cyl(flare, 0.16, 0.2, 2.6, 0, 1.3, 0, 0x5d656d, { rough: 0.65, metal: 0.5, seg: 18, finish: "galvanised" });
    for (const sx of [-1, 1]) cyl(flare, 0.02, 0.02, 1.7, sx * 0.55, 0.85, 0, CITY.darkSteel, { rough: 0.6, metal: 0.6, seg: 8 })
      .rotation.z = sx * 0.3;
    const blower = box(flare, 0.5, 0.42, 0.42, -0.85, 0.28, 0.2, 0x3c454e, { rough: 0.6, metal: 0.45 });
    void blower;
    const flareFace = decal(flare, 0.34, 0.12, -0.85, 0.56, 0.42, signFace("BLOWER — RUN", {
      bg: "#0d1c14", accent: "#59c97b", scale: 0.5,
    }), { px: 256, glow: true, ei: 0.8 });
    const blowerLamp = ball(flare, 0.03, -0.85, 0.56, 0.24, 0x59c97b, { emissive: 0x59c97b, ei: 2.2 });
    holoTag(flare, "Flare and blower", 0, 2.85, 0, { css: "#f2894b", w: 0.4 });
    reg(hits, flare, "flare-station");
    const flame = particles(g, 26, 0xffb04d, { size: 0.08, life: 0.7, additive: true, opacity: 0.8 });
    flame.position.set(2.35, 2.75, -1.9);

    // ------------------------------------------------- perimeter probe at the fence
    const probe = group(g, -2.55, 0, 1.15, 0.9);
    cyl(probe, 0.045, 0.05, 1.2, 0, 0.6, 0, 0xa3b83c, { rough: 0.6, metal: 0.4, seg: 14 });
    box(probe, 0.22, 0.26, 0.16, 0, 1.32, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const probeLamp = ball(probe, 0.028, 0, 1.5, 0.05, 0x59c97b, { emissive: 0x59c97b, ei: 2.0 });
    decal(probe, 0.2, 0.08, 0, 1.12, 0.09, signFace("PROBE W-4", { bg: "#1b2a12", accent: "#a3b83c", scale: 0.5 }));
    holoTag(probe, "Perimeter probe — west boundary", 0, 1.68, 0, { css: "#a3b83c", w: 0.66 });
    reg(hits, probe, "boundary-probe");
    for (let i = -3; i <= 3; i++) {
      box(g, 0.05, 1.5, 0.05, -3.0 + i * 0.05, 0.75, 1.15 + i * 0.55, 0x5d656d, { rough: 0.8, metal: 0.4, cast: false });
    }

    // ------------------------------------------------------- truck, kit, boards
    const kit = group(g, 1.35, 0, 1.5, -1.0);
    box(kit, 0.72, 0.62, 0.46, 0, 0.66, 0, 0x2b3138, { rough: 0.65, metal: 0.35 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(kit, 0.02, 0.02, 0.35, sx * 0.3, 0.18, sz * 0.18, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    const gem = instrument(kit, -0.16, 1.0, 0, { idle: "-- % CH4", color: 0xf2c14b, w: 0.2, d: 0.26 });
    holoTag(kit, "Gas analyser", -0.16, 1.2, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, gem, "gem-analyser");
    const o2 = instrument(kit, 0.18, 1.0, 0, { idle: "-- % O2", color: 0x4fd1ff, w: 0.18, d: 0.22 });
    holoTag(kit, "Oxygen channel", 0.18, 1.2, 0, { css: "#4fd1ff", w: 0.34 });
    reg(hits, o2, "o2-readout");
    const calBottle = cyl(kit, 0.06, 0.06, 0.42, 0.42, 0.21, 0, 0x2f7d4a, { rough: 0.5, metal: 0.4, seg: 16 });
    decal(kit, 0.1, 0.05, 0.42, 0.3, 0.061, signFace("CAL GAS", { bg: "#0d1c14", accent: "#59c97b", scale: 0.55 }));
    holoTag(kit, "Calibration gas", 0.42, 0.52, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, calBottle, "cal-gas");
    const skipCal = box(kit, 0.2, 0.2, 0.2, 0.42, 0.9, 0.2, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(kit, "it read fine yesterday?", 0.42, 1.14, 0.24, { css: "#d2312b", w: 0.48 });
    reg(hits, skipCal, "skip-cal");

    const boards = group(g, -1.95, 0, 1.6, 1.1);
    const mapPanel = holoPanel(boards, 0.78, 0.54, 0, 1.4, 0, (cx, w, h) => {
      cx.fillStyle = "#141b0c"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#a3b83c"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dbe9a8";
      cx.fillText("WELLFIELD — GW-118, LAST 3 ROUNDS", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = "#eef5d8";
      ["MAR  CH4 52.1  O2 0.4  T 41 C  -18 in", "APR  CH4 48.6  O2 1.9  T 44 C  -22 in",
        "MAY  CH4 44.2  O2 3.6  T 46 C  -26 in", "TREND: METHANE DOWN, OXYGEN UP",
        "BOUNDARY LIMIT: LEL AT THE FENCE"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.33 + i * 0.13)));
    }, { accent: LFG_ACCENT });
    cyl(boards, 0.03, 0.035, 1.15, 0, 0.57, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, mapPanel, "wellfield-map");

    const logBook = slab(g, 0.22, 0.03, 0.28, 1.35, 1.0, 1.85, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Field log", 1.35, 1.2, 1.85, { css: "#8fa9c4", w: 0.24 });
    reg(hits, logBook, "field-log");

    barrierPanel(g, -1.05, 2.0, { color: 0xa3b83c });
    cone(g, 0.85, 2.0, { color: 0xa3b83c });
    toolChest(g, 2.1, 1.35);
    standingFigure(g, 2.05, 0.55, { ry: -2.4, cloth: 0x5a6b2c, helmet: 0xf2c14b });

    // -------------------------------------------------------------- live state
    let blowerOn = true, probeAlarm = false, draining = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 1.3, -1.2),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "knockout") { draining = true; puddle.visible = true; }
        if (step.id === "calibrate") {
          repaint(gem.userData.screen, signFace("CAL OK", {
            bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55,
          }));
        }
        // wellValve and the knockout drain are turned live by the player's
        // drag — app.js drives their rotation from session.turn while each
        // turn step is active.
      },

      // Both interruptions really happen on the field: the flare goes out and
      // the blower panel goes red, and the boundary probe lamp turns.
      onInterrupt(it) {
        if (it.id === "flare-out") {
          blowerOn = false; flame.visible = false;
          // The lamp swap is what a learner sees from across the field, and
          // it is a material change rather than a texture repaint so the
          // reaction probe in tools/interrupt_react.mjs can see it too.
          blowerLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.8, rough: 0.4 });
          repaint(flareFace, signFace("BLOWER — TRIPPED", { bg: "#2a1a0d", accent: "#f0645b", scale: 0.5 }));
        }
        if (it.id === "probe-alarm") {
          probeAlarm = true;
          probeLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.8, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "flare-out") {
          blowerOn = true;
          blowerLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.2, rough: 0.4 });
          repaint(flareFace, signFace("BLOWER — RUN", { bg: "#0d1c14", accent: "#59c97b", scale: 0.5 }));
        }
        if (it.id === "probe-alarm") {
          probeAlarm = false;
          probeLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
        }
      },

      onHazard(hitId) {
        if (hitId === "crank-open") { probeAlarm = true; probeLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.6, rough: 0.4 }); }
      },

      animate(t, dt, session) {
        const step = session?.step;

        // The flare burns while the blower runs, and stops when it does not.
        flame.visible = blowerOn;
        if (blowerOn) flame.userData.step(dt, new THREE.Vector3(0.15, 1.4, 0), 0.1, 0.7, 0.9);
        if (probeAlarm) probeLamp.material.emissiveIntensity = 2.0 + Math.sin(t * 9) * 1.2;
        if (draining) puddle.scale.setScalar(Math.min(1.6, 0.4 + (t % 6) * 0.22));

        if (step?.id === "settle" && session.track) {
          repaint(vacGauge.userData.screen, signFace(`${(session.track.v * 60).toFixed(0)}`, {
            bg: "#0d1c24", accent: session.track.v > 0.34 && session.track.v < 0.56 ? "#59c97b" : "#f0645b",
            fg: "#bfeaf7", scale: 0.55,
          }));
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "methane" || step?.id === "recheck") {
            repaint(gem.userData.screen, signFace(`${(gg.t * 80).toFixed(1)}`, {
              bg: "#141b0c", accent: gg.t > 0.4 && gg.t < 0.66 ? "#59c97b" : "#f0645b", fg: "#eef5d8", scale: 0.55,
            }));
          }
          if (step?.id === "oxygen") {
            repaint(o2.userData.screen, signFace(`${(gg.t * 18).toFixed(1)}`, {
              bg: "#0d1c24", accent: gg.t < 0.14 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (step?.id === "temperature") {
            repaint(tempProbe.userData.screen, signFace(`${Math.round(20 + gg.t * 60)}`, {
              bg: "#1c1408", accent: gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
