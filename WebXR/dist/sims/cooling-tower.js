import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, cone, instrument, standingFigure, valveWheel, lockTag, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { plantHardHat } from "../../../shared/eggs.js";

// SmartCiti.X~ Cooling Tower VR — Building Systems & Facilities, station five.
// A quarterly clean and Legionella control task on a rooftop tower: the
// water management plan and the last culture read first, the tower shut
// down and the fan locked out so nobody drifts aerosol over the intake,
// respiratory protection before the basin is disturbed, the basin drained
// and the biofilm physically removed, the drift eliminator checked, a
// biocide shock dosed to the plan, conductivity and free halogen brought
// back into range, and the log signed with the next culture booked.

const CT2_ACCENT = 0x6fc9e8;

export const SIM_COOLING_TOWER = {
  id: "cooling-tower",
  index: "47",
  domain: "Building Systems & Facilities",
  trade: "Stationary engineer — water treatment and cooling towers",
  category: "Building Systems & Facilities",
  weather: "wind",
  certification: "IUOE Local stationary engineer; ASHRAE 188 building water management program and Guideline 12 Legionella control; CDC / OSHA Legionella toolkit for cooling towers; OSHA 29 CFR 1910.134 respiratory protection and 1910.147 lockout/tagout; EPA FIFRA-registered biocide label compliance",
  name: "Cooling Tower",
  title: simTitle("Cooling Tower"),
  tagline: "Quarterly clean and Legionella control: plan and last culture read, tower down and fan locked, respirator before the basin, biofilm physically removed, drift eliminator checked, biocide shock to the label, conductivity and halogen back in range, log signed",
  accent: CT2_ACCENT,
  accentCss: "#6fc9e8",
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "no-aerosol", name: "No Aerosol", note: "Fan locked before the basin was touched, respirator on, biofilm removed and the shock dosed to the label — first time" },

  game: system({
    name: "Water Management",
    currency: "PPM",
    ranks: ["Oiler", "Stationary Engineer", "Water Treatment Lead", "Chief Engineer", "Water Management Certified"],
    badges: [
      { id: "fan-locked", name: "Fan Locked", note: "Tower down and fan locked out before the basin was disturbed, first time", test: AWARD.stepClean("lockout") },
      { id: "no-shortcut-clean", name: "No Shortcut", note: "Never a hose on dry biofilm, never the basin open with the fan live, never a dose off the label", test: AWARD.safe },
      { id: "in-range", name: "In Range", note: "Halogen and conductivity both brought inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-quarter", name: "Clean Quarter", note: "No corrections anywhere in the service", test: AWARD.clean },
      { id: "full-contact", name: "Full Contact Time", note: "The biocide contact time held for its whole duration", test: AWARD.unbroken },
      { id: "quarter-fast", name: "Serviced In Time", note: "Tower back in service inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "fan-live-basin": "You opened the basin with the fan running. A disturbed basin aerosolises everything in it, and the fan puts that plume over the roof, the intake and the street — this is exactly how a building outbreak starts.",
    "dry-brush-biofilm": "You dry-brushed the biofilm. Dry scale and biofilm go airborne as respirable dust carrying the organism; the surfaces are kept wet through the whole clean for that reason.",
    "no-respirator": "You went into the basin with no respiratory protection. A cooling tower basin at cleaning is the highest-exposure task in the building, and a surgical mask is not respiratory protection.",
    "dose-off-label": "You dosed the biocide off the label rate. The label is enforceable law under FIFRA: under-dose and the shock does nothing to the biofilm, over-dose and the discharge is a permit violation and a corrosion event.",
  },

  lateNotes: {
    "wet-wash": "The basin is opened and washed after the tower is off, the fan is locked out, the crew is in respiratory protection and the basin is drained.",
    "biocide-pump": "The shock is dosed after the basin is physically clean — a biocide on top of biofilm never reaches the organism.",
    "halogen-test": "Free halogen is read after the shock has had its contact time.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "wmp-board",
      title: "Read the water management plan",
      cue: "Check the control limits, the last culture result and the quarterly task list.",
      why: "ASHRAE 188 makes this plan the single document the building is judged against, by a health department or by an outbreak investigator, whichever comes first. Every control limit, every dose calculation and every entry in today's log traces back to a number written on this board, not to what worked on a previous tower or what feels safe by habit.",
    },
    {
      id: "culture", kind: "select", target: "culture-report",
      title: "Read the last culture",
      cue: "Look at the last Legionella culture and the trend behind it.",
      why: "A rising culture count changes what this visit actually is: a routine clean and a disinfection are different tasks with different dose rates and different documentation, and the number on this report decides which one you are doing today. It also decides whether the building's risk group — the people most likely to get sick from an aerosol release — has to be notified before the basin is even opened.",
    },
    {
      id: "lockout", kind: "sequence",
      targets: ["tower-off", "fan-breaker", "fan-lock"],
      itemNames: { "tower-off": "tower off at the panel", "fan-breaker": "fan breaker open", "fan-lock": "lock and tag" },
      title: "Shut down and lock out the fan",
      cue: "Take the tower off at the control panel, open the fan breaker, then lock and tag.",
      why: "Taking the tower off at the control panel only silences the automation's normal call to run — it does not stop a scheduled restart, an override, or somebody two floors down who has no idea you are up here. A fan that turns over while you are in the basin is both a direct mechanical hazard and an aerosol release over the roof and the intake below it. The lock on the breaker is the one thing here that makes the shutdown physically impossible to undo rather than just administratively likely.",
      outOfOrderNote: "Off at the panel, then the breaker, then the lock — the load is removed before the power and the lock goes on last.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["respirator", "tyvek-gloves", "eyewash-check"],
      itemNames: { respirator: "half-face respirator with P100", "tyvek-gloves": "coveralls and chemical gloves", "eyewash-check": "eyewash station checked" },
      title: "Put on respiratory and chemical protection",
      cue: "P100 respirator fitted, coveralls and chemical gloves on, eyewash checked before the biocide comes out.",
      why: "This task carries two separate exposures that need different protection: the aerosol coming off a disturbed basin, which the P100 respirator is rated to filter, and the concentrated biocide handled at full strength before it is diluted into the tower, which the chemical gloves and a working eyewash station exist for. Skipping either one leaves exactly one of those exposures completely uncovered.",
    },
    {
      id: "drain", kind: "turn", target: "basin-drain",
      title: "Drain the basin",
      cue: "Open the basin drain to the sanitary connection and let the tower empty.",
      why: "The basin drains to the sanitary connection and never to storm, because what comes out of it is treated water carrying a biocide residual and whatever biological load has been growing in the system — exactly the kind of discharge storm drains are built to carry straight into a waterway untreated.",
      turn: { turns: 1, axis: "y", label: "BASIN DRAIN" },
    },
    {
      id: "clean", kind: "hold", target: "wet-wash", seconds: 6,
      title: "Wet-wash the basin and fill",
      cue: "Hold a low-pressure wet wash over the basin floor, the fill and the sump screen — keep every surface wet.",
      why: "The clean has to be physical, not chemical: biofilm is a structure the organism builds specifically to protect itself, and a biocide poured over an intact layer never reaches what is living underneath it. Low pressure and wet surfaces keep whatever comes off from turning into the exact airborne dust this entire procedure exists to prevent.",
      holdBreakNote: "The surfaces dried out — wet them again before you carry on, or this becomes a dust exposure.",
    },
    {
      id: "drift", kind: "find", noHint: true,
      targets: ["drift-gap", "sump-debris"],
      itemNames: { "drift-gap": "gap in the drift eliminator", "sump-debris": "debris in the sump screen" },
      itemNotes: {
        "drift-gap": "A panel of the drift eliminator has slipped and left a gap — the tower is throwing untreated droplets straight out of the top.",
        "sump-debris": "The sump screen is packed with leaf litter and sludge, which is both a nutrient source and a pump problem.",
      },
      title: "Inspect the drift eliminator and sump",
      cue: "Look over the eliminator panels and the sump screen and click what you find.",
      why: "The drift eliminator is arguably the single most important piece of Legionella control hardware on this whole tower, because it is the one component whose entire job is stopping aerosol from leaving the unit at all. Every dose, every control limit and every culture result in the plan assumes that barrier is intact — a gap in it lets untreated droplets past all of that chemistry and out over the roof.",
    },
    {
      id: "shock", kind: "gauge", target: "biocide-pump",
      title: "Dose the biocide shock",
      cue: "Set the shock dose to the label rate for this basin volume and commit inside the band.",
      why: "The label rate is calculated specifically against this basin's own volume, and under FIFRA it is not a guideline, it is enforceable law. Dose under it and the shock does close to nothing to the biofilm you just cleaned off; dose over it and the excess goes out with the discharge as a permit violation while also accelerating corrosion on every metal surface the water touches.",
      gauge: { label: "SHOCK DOSE", speed: 0.7, green: [0.44, 0.58], readout: (t) => `${(t * 50).toFixed(1)} ppm`, missNote: "Off the label rate — recalculate against the basin volume before you dose." },
    },
    {
      id: "contact", kind: "track", target: "contact-timer", seconds: 7,
      title: "Hold the contact time",
      cue: "Circulate at the shock concentration and hold it through the required contact period.",
      why: "Microbial kill is concentration multiplied by time, not concentration alone — a strong dose held for half the required period does roughly the same nothing as a weak dose held for the full one. Letting the residual drop mid-contact hands the advantage straight back to whatever organism survived in the biofilm just scraped off, and it recolonises from there.",
      track: { start: 0.1, green: [0.42, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "RESIDUAL", readout: (v) => (v < 0.42 ? "residual falling" : v > 0.6 ? "over-dosed" : "holding") },
      holdBreakNote: "The residual dropped out of the band — the contact time restarts from there.",
    },
    {
      id: "halogen", kind: "gauge", target: "halogen-test",
      title: "Test free halogen",
      cue: "Take the free halogen reading after contact and commit inside the operating band.",
      why: "The tower returns to service running at the operating residual, not at the shock concentration just used to kill the biofilm — those are two different numbers doing two different jobs. The operating band is what the plan's control limit is actually written against, and it is the number that goes in the log for the next inspection to check the tower against.",
      gauge: { label: "FREE HALOGEN", speed: 0.75, green: [0.34, 0.5], readout: (t) => `${(t * 6).toFixed(2)} ppm`, missNote: "Outside the control limit — bleed or dose until it is in range before restart." },
    },
    {
      id: "restart", kind: "sequence",
      targets: ["lock-off", "fan-on", "log-signed"],
      itemNames: { "lock-off": "lock removed", "fan-on": "tower back in service", "log-signed": "log signed and next culture booked" },
      title: "Return to service and sign the log",
      cue: "Remove the lock, bring the tower back on, then sign the log and book the next culture.",
      why: "The signed log is both the building's institutional memory and its defence: it is the record that this exact service happened, on this date, to this specification. The first time a health department or an outbreak investigator asks for it, an unsigned entry reads exactly like a service that was never performed at all, regardless of what actually happened up here.",
      outOfOrderNote: "Lock off, then the tower on, then the log — the person who locked it out is the person who releases it.",
    },
  ],

  // Interruptions: see shared/game.js. Both are the two ways a locked-out
  // tower actually gets threatened mid-task — a system that does not know
  // the lock is on, and a person who does not know the basin is live with
  // shock residual.
  interrupts: [
    {
      id: "bas-restart",
      kind: "Automation call",
      after: "clean", delay: 4, seconds: 12,
      alert: "The building automation system is issuing a scheduled restart command to the tower fan, straight through the lockout relay it does not know is engaged.",
      cue: "The fan is about to get a call it should never receive mid-clean — go re-confirm the lock before it lands.",
      target: "fan-lock",
      why: "A software schedule has no idea a technician is standing over an open, wet basin. If that restart command reaches a fan that is only administratively off, the lock and tag on the breaker are the one thing standing between a scheduled economiser cycle and blades turning over open water — go re-seat the lock so the command has nothing left to act on.",
      missNote: "The restart command went unanswered and the lock was never reconfirmed. On a tower without a positively verified lockout, that command turns the fan over an open, wet basin.",
      wrongNote: "That does not stop a scheduling system. The lock and tag on the fan breaker is what stops it — go confirm that.",
    },
    {
      id: "tech-at-hatch",
      kind: "Unplanned entry",
      after: "contact", delay: 4, seconds: 12,
      alert: "An HVAC technician has climbed up to the tower looking for the hatch, with no idea the basin is mid-shock at full biocide contact concentration.",
      cue: "Stop them before that hatch opens — wave them off from here.",
      target: "basin-hatch",
      why: "Contact time only works if the shock concentration stays sealed in the basin for its full duration, and the hatch is also the single highest-exposure point on this whole task — concentrated biocide, not the diluted operating dose it will be once the tower restarts. Somebody opening that hatch now breaks the contact time and walks straight into the strongest chemical on this roof with no idea it is there.",
      missNote: "The hatch came open mid-contact. The contact time is broken and has to restart from zero, and the technician just took a breath of concentrated shock residual they had no reason to expect.",
      wrongNote: "That will not reach them in time. Get to the hatch and stop them physically before they lift it.",
    },
  ],

  build(root) {
    plantHardHat(root, THREE, "cooling-tower", [2.6, 1.15, -2.6]); // Hard Hat Hunt — docs/easter-egg.md
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CT2_ACCENT);
    box(g, 6.0, 0.1, 5.2, 0, 0.05, 0, 0x6f6a64, { rough: 0.95 });
    for (let i = -3; i <= 3; i++) box(g, 0.04, 0.004, 5.0, i * 0.85, 0.101, 0, 0x5f5a55, { rough: 0.95, cast: false });
    // The tower: a cased crossflow unit with a fan stack, louvres, basin and an access hatch.
    const tower = group(g, -0.5, 0.1, -1.4);
    box(tower, 3.4, 0.55, 2.0, 0, 0.28, 0, 0x8b949d, { rough: 0.6, metal: 0.35 });
    box(tower, 3.4, 1.9, 2.0, 0, 1.5, 0, 0xa7b1ba, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 7; i++) { const lv = box(tower, 3.3, 0.1, 0.06, 0, 0.8 + i * 0.22, 1.02, 0x93a0a8, { rough: 0.7, metal: 0.3 }); lv.rotation.x = 0.4; }
    cyl(tower, 1.0, 1.15, 0.7, 0, 2.8, 0, 0x93a0a8, { rough: 0.6, metal: 0.35, seg: 24, open: true });
    const fanRing = cyl(tower, 1.05, 1.05, 0.06, 0, 3.15, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 24 });
    const blades = group(tower, 0, 3.12, 0);
    for (let i = 0; i < 4; i++) { const b = box(blades, 1.9, 0.05, 0.24, 0, 0, 0, 0x6b7885, { rough: 0.5, metal: 0.6 }); b.rotation.y = (i / 4) * Math.PI; b.rotation.z = 0.2; }
    decal(tower, 1.2, 0.22, 0, 2.2, 1.01, signFace("CT-1 · ASHRAE 188 WMP", { bg: "#0a2028", accent: "#6fc9e8", scale: 0.5 }));
    void fanRing;
    // Basin hatch on the near face.
    const hatch = box(tower, 0.8, 0.45, 0.05, -0.9, 0.3, 1.02, 0x7d8890, { rough: 0.6, metal: 0.4 });
    holoTag(tower, "basin access hatch", -0.9, 0.68, 1.06, { css: "#6fc9e8", w: 0.4 });
    reg(hits, hatch, "basin-hatch");
    const basinWater = slab(tower, 3.0, 0.02, 1.7, 0, 0.42, 0, 0x3f7f96, { rough: 0.15, metal: 0.5, opacity: 0.8, transparent: true, cast: false });
    const biofilm = slab(tower, 2.8, 0.01, 1.5, 0, 0.16, 0, 0x5a6b3a, { rough: 0.95, opacity: 0.9, transparent: true, cast: false });
    biofilm.visible = false;
    const sumpScreen = box(tower, 0.5, 0.04, 0.5, 1.1, 0.2, 0.4, 0x59636d, { rough: 0.7, metal: 0.4 });
    const debris = box(tower, 0.4, 0.07, 0.4, 1.1, 0.26, 0.4, 0x4a3f2a, { rough: 0.95 });
    debris.visible = false;
    reg(hits, debris, "sump-debris");
    void sumpScreen;
    const eliminator = group(tower, 0, 2.5, 0);
    for (let i = 0; i < 6; i++) box(eliminator, 3.0, 0.05, 0.22, 0, 0, -0.6 + i * 0.24, 0xdfe6ec, { rough: 0.7, cast: false });
    const gap = box(eliminator, 0.5, 0.06, 0.24, 0.9, 0, 0.12, 0x14181c, { rough: 0.9 });
    gap.visible = false;
    reg(hits, gap, "drift-gap");
    const plume = particles(g, 50, 0xdfeaf2, { size: 0.045, life: 1.5, additive: false, opacity: 0.3 });
    const fanLiveHit = box(tower, 0.9, 0.7, 0.4, -0.9, 0.35, 1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tower, "open it with the fan on?", -0.9, 1.05, 1.3, { css: "#d2312b", w: 0.46 });
    reg(hits, fanLiveHit, "fan-live-basin");
    // Control panel: tower off, breaker, lock, timers.
    const panel = group(g, 2.2, 0.1, -0.9, -0.6);
    box(panel, 0.85, 1.6, 0.4, 0, 0.9, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    decal(panel, 0.55, 0.16, 0, 1.55, 0.21, signFace("TOWER CT-1 CONTROL", { bg: "#0a2028", accent: "#6fc9e8", scale: 0.5 }));
    const towerOff = instrument(panel, -0.2, 1.1, 0.21, { idle: "RUN", color: 0x59c97b, w: 0.13, d: 0.2 });
    holoTag(panel, "tower off", -0.2, 1.3, 0.23, { css: "#6fc9e8", w: 0.2 });
    reg(hits, towerOff, "tower-off");
    const breaker = box(panel, 0.12, 0.2, 0.06, 0.16, 1.1, 0.21, 0xf2c14b, { rough: 0.5, metal: 0.35 });
    holoTag(panel, "fan breaker", 0.16, 1.3, 0.23, { css: "#6fc9e8", w: 0.24 });
    reg(hits, breaker, "fan-breaker");
    const lock = lockTag(panel, 0.16, 0.85, 0.22, {});
    holoTag(panel, "lock and tag", 0.16, 0.66, 0.24, { css: "#6fc9e8", w: 0.26 });
    reg(hits, lock, "fan-lock");
    const lockOff = box(panel, 0.14, 0.14, 0.1, -0.2, 0.85, 0.22, 0x2f7d4a, { rough: 0.5, metal: 0.4 });
    holoTag(panel, "remove the lock", -0.2, 0.66, 0.24, { css: "#6fc9e8", w: 0.3 });
    reg(hits, lockOff, "lock-off");
    const fanOn = instrument(panel, 0.0, 0.5, 0.21, { idle: "OFF", color: 0x6fc9e8, w: 0.13, d: 0.2 });
    holoTag(panel, "back in service", 0.0, 0.3, 0.23, { css: "#6fc9e8", w: 0.3 });
    reg(hits, fanOn, "fan-on");
    // Basin drain valve and sanitary connection.
    const drain = group(g, -2.1, 0.1, -0.5);
    cyl(drain, 0.06, 0.06, 0.9, 0, 0.3, 0, 0x7b8a86, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    const drainWheel = valveWheel(drain, 0.1, 0.55, 0, { color: 0x6fc9e8, body: 0x2b2f34, r: 0.1 });
    holoTag(drain, "basin drain — to sanitary", 0.1, 0.85, 0, { css: "#6fc9e8", w: 0.48 });
    reg(hits, drainWheel, "basin-drain");
    // Wash wand and hose; the dry brush hazard beside it.
    const wandGroup = group(g, -1.9, 0.1, 0.9, 0.3);
    cyl(wandGroup, 0.015, 0.015, 0.9, 0, 0.5, 0, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.x = 0.5;
    hose(g, [[-2.3, 0.2, 1.4], [-1.9, 0.25, 0.9], [-1.4, 0.3, 0.2], [-0.9, 0.35, -0.5]], 0.025, 0x3a7f96, { steps: 16 });
    holoTag(wandGroup, "low-pressure wet wash", 0, 0.95, 0, { css: "#6fc9e8", w: 0.46 });
    reg(hits, wandGroup, "wet-wash");
    const spray = particles(g, 60, 0x9fd8e8, { size: 0.02, life: 0.5, additive: false, opacity: 0.6 });
    const dryBrush = box(g, 0.24, 0.06, 0.08, -2.5, 0.16, 0.5, 0xb8853a, { rough: 0.9 });
    holoTag(g, "dry-brush it?", -2.5, 0.38, 0.5, { css: "#d2312b", w: 0.26 });
    reg(hits, dryBrush, "dry-brush-biofilm");
    // PPE station: respirator, coveralls, eyewash.
    const ppe = group(g, 2.5, 0.1, 1.1, -0.8);
    box(ppe, 0.7, 1.4, 0.35, 0, 0.75, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const resp = box(ppe, 0.2, 0.15, 0.12, -0.16, 1.2, 0.2, 0x2b2f34, { rough: 0.7 });
    for (const sx of [-1, 1]) cyl(ppe, 0.05, 0.05, 0.05, -0.16 + sx * 0.11, 1.18, 0.24, 0xe4629b, { rough: 0.7, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(ppe, "P100 respirator", -0.16, 1.42, 0.22, { css: "#6fc9e8", w: 0.34 });
    reg(hits, resp, "respirator");
    const suit = box(ppe, 0.22, 0.4, 0.1, 0.16, 1.0, 0.2, 0xdfe6ec, { rough: 0.8 });
    holoTag(ppe, "coveralls and gloves", 0.16, 1.28, 0.22, { css: "#6fc9e8", w: 0.42 });
    reg(hits, suit, "tyvek-gloves");
    const eyewash = group(g, 1.6, 0.1, 1.9, -0.3);
    cyl(eyewash, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x2f7d4a, { rough: 0.5, metal: 0.5, seg: 8 });
    box(eyewash, 0.3, 0.1, 0.22, 0, 1.0, 0, 0x2f7d4a, { rough: 0.6 });
    for (const sx of [-1, 1]) ball(eyewash, 0.04, sx * 0.09, 1.08, 0, 0xdfe6ec, { rough: 0.5, seg: 10, seg2: 8 });
    holoTag(eyewash, "eyewash station", 0, 1.32, 0, { css: "#6fc9e8", w: 0.32 });
    reg(hits, eyewash, "eyewash-check");
    const noResp = box(g, 0.4, 0.5, 0.4, -1.1, 0.4, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "go in without a respirator?", -1.1, 0.85, 0.4, { css: "#d2312b", w: 0.5 });
    reg(hits, noResp, "no-respirator");
    // Chemical skid: biocide drum, dosing pump, contact timer, test kit.
    const skid = group(g, 0.9, 0.1, 1.7, -0.2);
    box(skid, 1.5, 0.15, 0.8, 0, 0.08, 0, 0x2b2f34, { rough: 0.7 });
    cyl(skid, 0.24, 0.24, 0.8, -0.4, 0.55, 0, 0x2b6fd8, { rough: 0.5, seg: 18 });
    decal(skid, 0.3, 0.16, -0.4, 0.62, 0.245, signFace("BIOCIDE — EPA REG", { bg: "#0a1a2a", accent: "#6fc9e8", scale: 0.45 }));
    const pump = instrument(skid, 0.15, 0.4, 0.2, { idle: "-.- ppm", color: 0x6fc9e8, w: 0.13, d: 0.2 });
    holoTag(skid, "dosing pump", 0.15, 0.62, 0.22, { css: "#6fc9e8", w: 0.26 });
    reg(hits, pump, "biocide-pump");
    const timer = instrument(skid, 0.5, 0.4, 0.2, { idle: "--:--", color: 0xf2c14b, w: 0.13, d: 0.2 });
    holoTag(skid, "contact timer", 0.5, 0.62, 0.22, { css: "#6fc9e8", w: 0.28 });
    reg(hits, timer, "contact-timer");
    const testKit = box(skid, 0.22, 0.12, 0.16, 0.62, 0.22, -0.2, 0xdfe6ec, { rough: 0.7 });
    holoTag(skid, "halogen test kit", 0.62, 0.42, -0.24, { css: "#6fc9e8", w: 0.34 });
    reg(hits, testKit, "halogen-test");
    const offLabel = box(skid, 0.3, 0.3, 0.3, -0.85, 0.5, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(skid, "eyeball the dose?", -0.85, 0.82, 0.3, { css: "#d2312b", w: 0.34 });
    reg(hits, offLabel, "dose-off-label");
    // Plan board, culture report, log book, engineer.
    const board = group(g, -2.4, 0, 1.9, 0.5);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#07202a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#6fc9e8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d3eefa"; ctx.fillText("WATER MANAGEMENT PLAN — CT-1", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eaf7fd";
      ["Basin volume: 1,900 L", "Shock: per label, 25 ppm, 2 h contact", "Operating free halogen: 0.5-2.0 ppm", "Conductivity: 1,800-2,400 µS/cm", "Quarterly: drain, wet clean, eliminator", "Culture: quarterly, act at 10 CFU/mL", "Fan locked out before basin access"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: CT2_ACCENT });
    reg(hits, board, "wmp-board");
    const culture = group(g, -1.3, 0.1, 2.2, 0.2);
    box(culture, 0.5, 0.75, 0.35, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const report = decal(culture, 0.3, 0.38, 0, 0.77, 0, signFace("CULTURE Q2\n6 CFU/mL\nTREND: RISING", { bg: "#f2efe6", accent: "#2b6fd8", fg: "#1b1e22", scale: 0.4 }));
    report.rotation.x = -Math.PI / 2;
    holoTag(culture, "last Legionella culture", 0, 1.0, 0, { css: "#6fc9e8", w: 0.46 });
    reg(hits, culture, "culture-report");
    const logBook = box(g, 0.3, 0.05, 0.22, -1.3, 0.8, 1.85, 0xf2efe6, { rough: 0.8 });
    holoTag(g, "service log", -1.3, 0.98, 1.85, { css: "#6fc9e8", w: 0.22 });
    reg(hits, logBook, "log-signed");
    const eng = standingFigure(g, 1.9, 2.4, { ry: 3.0, cloth: 0x2b6f88 });
    holoTag(eng, "stationary engineer", 0, 1.9, 0, { css: "#6fc9e8", w: 0.38 });
    for (const [x, z] of [[-2.7, -2.0], [2.7, -2.0]]) cone(g, x, z);
    // The HVAC technician who wanders up during the contact-time interrupt —
    // parked well clear of the tower and every control until then.
    const tech = standingFigure(g, 2.3, 2.5, { ry: -2.4, cloth: 0x5a6b7a, helmet: 0xf2c14b, vest: 0xe4dc3a });
    const techHome = tech.position.clone();

    let running = true, drained = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.6, 1.0, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout") { running = false; repaint(towerOff.userData.screen, signFace("OFF", { bg: "#2a0d0d", accent: "#d2312b", fg: "#ffd9d6", scale: 0.62 })); }
        if (step.id === "drain") { drained = true; basinWater.visible = false; biofilm.visible = true; debris.visible = true; gap.visible = true; }
        if (step.id === "clean") biofilm.visible = false;
        if (step.id === "drift") { debris.visible = false; gap.visible = false; }
        if (step.id === "restart") { running = true; basinWater.visible = true; repaint(fanOn.userData.screen, signFace("RUN", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.62 })); }
      },
      // The BAS call flashes the panel like it is about to take the fan back;
      // the tech walks in on the hatch. Both really move the scene rather
      // than only a hint panel — see tools/interrupt_react.mjs.
      onInterrupt(it) {
        if (it.id === "bas-restart") {
          repaint(towerOff.userData.screen, signFace("RESTART CALL", { bg: "#3a0d0d", accent: "#f0645b", fg: "#ffd9d6", scale: 0.5 }));
          breaker.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.4, metal: 0.35 });
        }
        if (it.id === "tech-at-hatch") { tech.position.set(-1.3, 0.1, -0.05); tech.rotation.y = 1.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bas-restart") {
          repaint(towerOff.userData.screen, signFace("OFF", { bg: "#2a0d0d", accent: "#d2312b", fg: "#ffd9d6", scale: 0.62 }));
          breaker.material = mat(0xf2c14b, { rough: 0.5, metal: 0.35 });
        }
        if (it.id === "tech-at-hatch") { tech.position.copy(techHome); tech.rotation.y = -2.4; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (running) {
          blades.rotation.y = t * 2.2;
          plume.visible = true; plume.userData.step(dt, new THREE.Vector3(-0.5, 3.4, -1.4), 0.5, 0.5, 0.1);
        } else if (plume.visible) plume.visible = false;
        if (session?.turn && step?.id === "drain") drainWheel.rotation.y = -session.turn.amount * Math.PI * 2;
        if (step?.id === "clean" && session.holding) { spray.visible = true; spray.userData.step(dt, new THREE.Vector3(-1.2, 0.5, -0.9), 0.2, 1.0, -2); }
        else if (spray.visible) spray.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "shock") repaint(pump.userData.screen, signFace(`${(gg.t * 50).toFixed(1)} ppm`, { bg: "#07202a", accent: gg.t >= 0.44 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#eaf7fd", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "halogen") repaint(testKit.material ? timer.userData.screen : timer.userData.screen, signFace(`${(gg.t * 6).toFixed(2)} ppm`, { bg: "#07202a", accent: gg.t >= 0.34 && gg.t <= 0.5 ? "#59c97b" : "#f2ae14", fg: "#eaf7fd", scale: 0.62 }));
        if (step?.id === "contact" && session.holding) repaint(timer.userData.screen, signFace(`${Math.floor(session.track.inBand)}:${String(Math.floor((session.track.inBand % 1) * 60)).padStart(2, "0")}`, { bg: "#3a2a06", accent: "#f2c14b", fg: "#fff0d6", scale: 0.62 }));
        void drained;
      },
    };
  },
};
