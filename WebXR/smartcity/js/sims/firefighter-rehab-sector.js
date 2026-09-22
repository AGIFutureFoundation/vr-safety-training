import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
  seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel,
  standingFigure, pavingFace, reg, surfaceTexture, texturedMat,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Firefighter Rehab Sector VR — Emergency Services, station 198.
// The rehab sector set up behind a working fire under NFPA 1584: crews
// rotated in once their second cylinder is spent, PPE broken down so cooling
// can actually reach skin, vitals read and logged against a release
// criterion rather than a guess, a member whose heat stress does not clear
// held back and re-evaluated instead of sent back out because the line is
// short-handed, and the two-part close every station in this series
// carries — the operational log, and the question asked out loud.

const FRS_ACCENT = 0x2e9e77;

export const SIM_FIREFIGHTER_REHAB_SECTOR = {
  id: "firefighter-rehab-sector",
  index: "198",
  domain: "Emergency Services",
  trade: "Firefighter — IAFF",
  category: "Emergency Services",
  weather: "smoke",
  certification: "IAFF — NFPA 1584 rehabilitation process for members during emergency operations, NFPA 1500 fire department occupational safety and health, OSHA 29 CFR 1910.134 respiratory protection governing SCBA cylinder rotation, and NIOSH heat-stress monitoring criteria the rehab vitals are read against",
  name: "Firefighter Rehab Sector",
  title: simTitle("Firefighter Rehab Sector"),
  tagline: "Rehab sector at a working fire under NFPA 1584: cylinder rotation, PPE broken down, vitals read against the release criteria, cooling and hydration, a heat-stressed member held back, and the crew's own check-in",
  accent: FRS_ACCENT,
  accentCss: "#2e9e77",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "release-earned", name: "Release Earned", note: "Every crew through rehab met its release criteria before going back to the line, with nobody pushed through early" },

  game: system({
    name: "Rehab Group",
    currency: "REHAB",
    ranks: ["Rehab Support", "Rehab Technician", "Rehab Manager", "Medical Group Supervisor", "Rehab Certified"],
    badges: [
      { id: "criteria-held", name: "Criteria Held", note: "Nobody released before meeting the vitals criteria, first time", test: AWARD.stepClean("hold-for-reeval") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "vitals-precise", name: "Vitals Precise", note: "Every reading committed inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-sector", name: "Clean Sector", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "cooling-held", name: "Cooling Held", note: "The cooling period held its full duration, no early step-out", test: AWARD.unbroken },
      { id: "sector-fast", name: "Sector Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bypass-rehab-gate": "A crew walked around the rehab entry point instead of checking in through it. Rehab only works as a system if every crew that has been through a second cylinder is actually logged, monitored and timed — a crew that bypasses the gate is a crew command believes is rested that was never actually assessed.",
    "energy-drink": "You handed a member a caffeinated energy drink instead of water or an electrolyte mix. Caffeine is a diuretic and a cardiac stimulant, which is the opposite of what a body already dehydrated and tachycardic from working a structure fire needs — NFPA 1584's rehab guidance calls specifically for water and electrolyte replacement, not stimulants, for exactly this reason.",
    "premature-release": "You released the flagged member back to the line before his heart rate and mental status met the criteria. A crew chief needing bodies on the fireground is real pressure, and it is also exactly the pressure NFPA 1584's release criteria exist to stand up against — a member sent back before he clears them is a second patient waiting to happen, on a crew that is now one person short of knowing it.",
    "smoking-in-rehab": "A member lit a cigarette in the rehab area, next to open SCBA cylinders and while still recovering from heat and carbon monoxide exposure. Nicotine narrows blood vessels at the exact moment the body is trying to cool and recover, and an open flame next to compressed-air cylinders is its own hazard rehab exists to keep away from the crew resting inside it.",
  },

  steps: [
    {
      id: "site-select", kind: "select", target: "rehab-site-board",
      title: "Site the rehab sector",
      cue: "Read the sector board: upwind and uphill of the fire, clear of apparatus exhaust, with EMS staged alongside.",
      why: "Rehab does nothing for a crew's lungs if it is sited downwind of the smoke plume or parked behind an idling engine's exhaust, and it does nothing for their timeline if EMS is not already staged there to escalate a member who does not clear the vitals criteria. Siting it right, before the first crew arrives, is what makes every step after this one actually mean recovery instead of just a different place to stand.",
    },
    {
      id: "entry-criteria", kind: "gauge", target: "cylinder-gauge",
      title: "Confirm the entry criterion",
      cue: "Read the crew's SCBA cylinder gauge and confirm it is on its second bottle before waving them into rehab.",
      why: "NFPA 1584 ties rehab entry to a specific, checkable threshold rather than to how a crew looks from across the yard — a second cylinder spent, or a set working time, or visible exhaustion — because 'they look fine' is exactly the judgment call rehab exists to take out of the loop. Reading the gauge is what turns rotation into a system instead of a guess made from a distance.",
      gauge: { label: "CYLINDER", speed: 0.7, green: [0.02, 0.14], readout: (t) => `${Math.round(t * 100)}% remaining`, missNote: "That is not a second-cylinder reading — check the gauge again before this crew is logged into rehab." },
    },
    {
      id: "break-down-ppe", kind: "sequence",
      targets: ["helmet-off", "coat-open", "scba-off"],
      itemNames: { "helmet-off": "helmet off", "coat-open": "coat opened", "scba-off": "SCBA harness off" },
      itemNotes: { "helmet-off": "Most of the body's heat is lost through the head — the helmet comes off first for exactly that reason." },
      title: "Break down the PPE before cooling starts",
      cue: "Helmet off, then coat opened, then the SCBA harness off — in that order.",
      why: "Cooling and hydration cannot do anything through a sealed turnout coat and a harness still cinched down, and the order matters because the head sheds heat fastest, the open coat lets air reach the torso next, and the harness is heaviest to remove and least urgent to lose first. Skipped or done out of order, a member can sit under a misting fan for five minutes and still be wearing the insulation that is keeping the heat in.",
      outOfOrderNote: "Helmet, then coat, then SCBA — taking the harness off before the coat is opened wastes the minutes the cooling period is supposed to spend actually cooling somebody.",
    },
    {
      id: "mister-on", kind: "turn", target: "mister-valve",
      title: "Open the misting fan",
      cue: "Turn the hose-bib feeding the misting fan fully open.",
      why: "A misting fan run on a trickle barely wets the air it is blowing, and evaporative cooling only works as fast as the water it has to evaporate — opened fully, the fan is actually pulling heat off skin at the rate rehab's timeline assumes it is.",
      turn: { turns: 1.0, axis: "y", label: "MISTER" },
    },
    {
      id: "cooling-hold", kind: "hold", target: "cooling-spot", seconds: 8,
      title: "Hold the cooling period",
      cue: "Keep the member standing in the mist for the full cooling interval before vitals are read.",
      why: "A body that has been working inside turnout gear at a structure fire does not cool the moment the gear comes off — core temperature keeps rising for several minutes after exertion stops, which is exactly why a vitals reading taken too early looks worse than the member actually is. The hold is timed to let the cooling actually catch up before anything gets measured.",
      holdBreakNote: "The member stepped out of the mist before the interval was up. Cutting the cooling period short means the vitals about to be read are measuring a body that has not finished coming down yet.",
    },
    {
      id: "hydration", kind: "select", target: "hydration-water",
      title: "Hydrate with water or electrolyte replacement",
      cue: "Hand the member water or the electrolyte mix from the rehab table — not the energy drinks in the cooler beside it.",
      why: "Sweat lost at a structure fire is water and electrolytes both, and replacing only one leaves the body still short — which is the whole reason rehab tables carry an electrolyte option next to plain water rather than either alone. What is not on this table, on purpose, is a stimulant.",
    },
    {
      id: "vitals-hr", kind: "gauge", target: "hr-monitor",
      title: "Read heart rate",
      cue: "Clip the pulse oximeter on and commit the heart-rate reading.",
      why: "Heart rate is the first and fastest-moving number rehab reads, because it tracks recovery in real time — a rate still climbing after the cooling hold is the earliest sign that a member is not actually coming down, well before temperature or mental status would show it.",
      gauge: { label: "HEART RATE", speed: 0.7, green: [0.3, 0.55], readout: (t) => `${Math.round(70 + t * 110)} bpm`, missNote: "That heart rate is outside the recovery band NFPA 1584 reads against — hold the member in rehab and read it again rather than logging a number that does not clear." },
    },
    {
      id: "vitals-temp", kind: "gauge", target: "temp-monitor",
      title: "Read temperature",
      cue: "Take the tympanic temperature and commit the reading.",
      why: "Temperature confirms what the cooling period was actually doing — a heart rate coming down while temperature is still climbing means the body is still shedding the heat load from the interior, and that member is not the same case as one where both numbers have already turned around together.",
      gauge: { label: "TEMPERATURE", speed: 0.72, green: [0.15, 0.4], readout: (t) => `${(97.5 + t * 4).toFixed(1)} °F`, missNote: "That temperature is still in the range NIOSH's heat-stress criteria flag — keep the member in rehab rather than logging a release-ready reading that is not one yet." },
    },
    {
      id: "co-reading", kind: "gauge", target: "co-monitor",
      title: "Read carbon monoxide",
      cue: "Run the CO-oximetry check and commit the reading.",
      why: "A structure fire loads every member working it with carbon monoxide whether or not their SCBA face piece ever came off, and CO is invisible to every other vital sign on this table — a member can have a clean heart rate and a normal temperature and still be carrying a CO load that needs treatment the rehab tent cannot give them.",
      gauge: { label: "CO LEVEL", speed: 0.72, green: [0.04, 0.22], readout: (t) => `${Math.round(t * 25)}% COHb`, missNote: "That CO reading is outside what rehab can clear on its own — this is an EMS transport, not a number to log and move past." },
    },
    {
      id: "spot-heat-stress", kind: "find", noHint: true,
      targets: ["member-heat-stress"],
      itemNames: { "member-heat-stress": "member showing heat-stress signs" },
      itemNotes: { "member-heat-stress": "He has stopped sweating and is answering questions a beat slow — the body running out of its own cooling mechanism, not simple fatigue." },
      decoyNotes: {
        "member-resting-a": "She is winded and drinking water like everyone else in this row — tired is not the finding here.",
        "member-resting-b": "He is sweating heavily and breathing hard, which is a body cooling itself the way it is supposed to — that is the opposite of the finding.",
      },
      title: "Scan the row for the one who is not just tired",
      cue: "Three members are resting. One of them has stopped sweating and is slow to answer — find him.",
      why: "Ordinary fatigue and heat exhaustion look similar from a glance across the tent, and the distinguishing sign is usually the quiet one — sweating that has stopped rather than increased, and a response time that has slowed rather than just gone quiet from being tired. Missing that member in a row of people who all look like they just came off a fire is exactly how heat exhaustion gets logged as somebody catching their breath.",
    },
    {
      id: "hold-for-reeval", kind: "select", target: "reeval-hold-button",
      title: "Hold him back for re-evaluation",
      cue: "The crew chief wants him back on the line. Keep him in rehab until his vitals actually clear.",
      why: "A crew chief asking for a member back is asking in good faith — the line is short and the job still needs doing — and the rehab manager's job is to hold the criteria anyway, because the chief cannot see the vitals from across the fireground and the criteria exist precisely for the moment when the pressure to release someone and the medical case for releasing them point in different directions.",
    },
    {
      id: "reassess", kind: "gauge", target: "reassess-monitor",
      title: "Re-check vitals before release",
      cue: "After the extra rest, read heart rate again and commit only if it clears the release band.",
      why: "The second reading is not a formality after the first one flagged — it is the actual release decision, and it has to clear the same band the first reading missed rather than a looser one applied because time has now passed. Time alone does not clear a member; a vitals reading inside the band does.",
      gauge: { label: "RE-CHECK HR", speed: 0.7, green: [0.15, 0.4], readout: (t) => `${Math.round(70 + t * 110)} bpm`, missNote: "Still outside the release band — another rest cycle, not a release, is what this reading calls for." },
    },
    {
      id: "log-rehab", kind: "select", target: "rehab-log-board",
      title: "Log the rehab record",
      cue: "Write the entry time, the vitals, and the release time into the rehab log.",
      why: "The rehab log is what lets the safety officer, and anybody reviewing the incident afterward, see that every crew's time in rehab actually matched a released set of vitals rather than a clock running out — without it, a well-run rehab sector and a rushed one look identical on paper.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Ask how the crew is doing",
      cue: "Ask the question out loud, not just the vitals — and note the answer.",
      why: "A member can clear every number on this table and still be carrying something the vitals do not measure — what they saw inside, what almost happened, who they could not get to in time — and the department's peer-support and critical-incident stress line exists for exactly that gap. Asking the question and writing down the answer is what keeps rehab from being only a physiology check.",
    },
  ],

  interrupts: [
    {
      id: "co-spike",
      kind: "CO reading comes back high",
      after: "co-reading", delay: 3, seconds: 13,
      alert: "The CO monitor on the member at the second chair just alarmed — his reading has climbed well past what rehab clears on its own.",
      cue: "That member goes to EMS now, not back toward the line.",
      target: "ems-transport",
      why: "A carbon monoxide level this high is a medical transport, not a rehab finding — cooling, water and rest do nothing for a CO load already bound to haemoglobin, and the only thing that clears it faster is oxygen and monitoring rehab is not equipped to give. Sending him toward the line, or even just leaving him resting in the tent, both look the same on the outside and are both the wrong call.",
      missNote: "He stayed in the rehab chair while the reading held high. Rehab's cooling and hydration were doing nothing for a CO load that only oxygen and EMS monitoring actually clears, and every minute in that chair instead of on a stretcher was a minute spent not treating it.",
      wrongNote: "It is the CO reading, not the vitals table in front of you — that member needs EMS transport, not another round of monitoring in the tent.",
    },
    {
      id: "ic-wants-crew-early",
      kind: "IC calls for the crew early",
      after: "vitals-hr", delay: 3, seconds: 12,
      alert: "Command is on the radio asking for this crew back at staging — their rehab clock has not run out yet.",
      cue: "Tell command they are not released — the rehab minimum has not been met.",
      target: "radio-defer-ic",
      why: "The rehab manager is the one person on this fireground whose job is to say not yet to the incident commander, because NFPA 1584 sets a minimum rehab period for a reason command is trusting rehab to hold even under pressure to get bodies moving again — the crew is worth more to the incident rested than they are worth to it fifteen minutes into a cooling period they never finished.",
      missNote: "The crew went back to staging with time still owed on the clock. Whatever the rehab period was catching up on when the radio call came in, it is still uncaught, and this crew is now back near the fireground carrying it.",
      wrongNote: "It is the radio call from command, not the reading in front of you — tell them the crew's rehab minimum has not been met yet.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, FRS_ACCENT);

    // ------------------------------------------------------------ the apron
    const apron = box(g, 6.2, 0.02, 5.2, 0, 0.005, 0, 0x3a3f45, { rough: 0.94, cast: false });
    apron.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#3a3f45", base2: "#30353b", seam: "rgba(0,0,0,0.45)" }), { repeat: 5, px: 384 }),
      { rough: 0.92, metal: 0.05, color: 0x3a3f45 },
    );
    const smokePlume = particles(g, 40, 0x4a4a4e, { size: 0.06, life: 1.6, additive: false, opacity: 0.28 });
    smokePlume.position.set(-3.4, 1.2, -3.2);

    // ---------------------------------------------------------- rehab tent
    const tent = group(g, 0, 0, -1.5);
    for (const [tx, tz] of [[-1.5, -1.1], [1.5, -1.1], [-1.5, 1.1], [1.5, 1.1]]) {
      cyl(tent, 0.03, 0.03, 2.0, tx, 1.0, tz, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 10 });
    }
    slab(tent, 3.3, 0.06, 2.5, 0, 2.05, 0, FRS_ACCENT, { radius: 0.05, rough: 0.75, opacity: 0.92, transparent: true });
    holoTag(tent, "REHAB", 0, 2.25, 0, { css: "#2e9e77", w: 0.3 });

    // Entry gate: cylinder gauge check, with the bypass path around it.
    const gate = group(g, -2.15, 0, -0.2, 0.3);
    for (const gx of [-0.45, 0.45]) cyl(gate, 0.025, 0.025, 1.1, gx, 0.55, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8 });
    box(gate, 1.0, 0.03, 0.02, 0, 1.0, 0, FRS_ACCENT, { rough: 0.6 });
    const siteBoard = holoPanel(gate, 0.5, 0.36, 0, 1.35, 0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,16,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2e9e77"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#dffbf0";
      ctx.fillText("REHAB SECTOR", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#bfeedd";
      ["Upwind, uphill of the fire", "Clear of apparatus exhaust", "EMS staged alongside"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { accent: FRS_ACCENT });
    reg(hits, siteBoard, "rehab-site-board");
    const cylGaugeObj = instrument(gate, 0.0, 0.7, 0.05, { idle: "-- %", color: FRS_ACCENT, w: 0.13 });
    reg(hits, cylGaugeObj, "cylinder-gauge");
    const bypassGate = group(g, -1.3, 0, -0.2);
    box(bypassGate, 0.5, 0.02, 0.5, 0, 0.011, 0, 0xf0645b, { rough: 0.7, emissive: 0xf0645b, ei: 0.3 });
    holoTag(bypassGate, "Skip the gate?", 0, 0.16, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, bypassGate, "bypass-rehab-gate");

    // PPE doffing racks.
    const racks = group(g, -1.4, 0, -1.3);
    const helmetRack = box(racks, 0.5, 0.05, 0.2, 0, 0.9, 0, 0x2b3138, { rough: 0.6 });
    for (let i = 0; i < 3; i++) ball(helmetRack, 0.09, -0.16 + i * 0.16, 0.08, 0, [0xd8b23a, 0x8a1f1f, 0x2b3138][i], { rough: 0.4 });
    holoTag(racks, "Helmets off", 0, 1.1, 0, { css: "#2e9e77", w: 0.3 });
    reg(hits, helmetRack, "helmet-off");
    const coatRack = box(racks, 0.5, 0.05, 0.2, 0, 0.5, 0.5, 0x2b3138, { rough: 0.6 });
    for (let i = 0; i < 2; i++) box(coatRack, 0.25, 0.4, 0.1, -0.12 + i * 0.24, -0.24, 0, 0xd8b23a, { rough: 0.7 });
    holoTag(racks, "Coats opened", 0, 0.72, 0.5, { css: "#2e9e77", w: 0.34 });
    reg(hits, coatRack, "coat-open");
    const scbaRack = box(racks, 0.4, 0.6, 0.24, 0.6, 0.4, 0.1, 0x8a929a, { rough: 0.55, metal: 0.3 });
    cyl(scbaRack, 0.09, 0.09, 0.5, 0, 0.3, -0.05, 0x2b3138, { rough: 0.6, seg: 12 });
    holoTag(racks, "SCBA off", 0.6, 0.75, 0.1, { css: "#2e9e77", w: 0.28 });
    reg(hits, scbaRack, "scba-off");

    // Misting station.
    const mister = group(g, 0.9, 0, -2.4);
    box(mister, 0.35, 0.05, 0.35, 0, 0.025, 0, 0x2b2f34, { rough: 0.6 });
    cyl(mister, 0.05, 0.05, 1.1, 0, 0.58, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 10 });
    cyl(mister, 0.16, 0.16, 0.08, 0, 1.18, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 14 });
    for (let i = 0; i < 6; i++) { const bl = box(mister, 0.14, 0.02, 0.02, 0, 1.18, 0, 0x8a929a, { rough: 0.4, metal: 0.5 }); bl.rotation.y = (i * Math.PI) / 3; }
    const misterHose = hose(mister, [[0, 0.05, 0.2], [-0.3, 0.05, 0.4], [-0.3, 0.05, 0.7]], 0.02, 0x2b3138, { steps: 8, seg: 6 });
    void misterHose;
    const misterValve = valveWheel(mister, -0.3, 0.05, 0.85, { color: FRS_ACCENT, body: 0x1f6f4f, r: 0.08 });
    reg(hits, misterValve, "mister-valve");
    holoTag(mister, "Misting fan", 0, 1.4, 0, { css: "#2e9e77", w: 0.3 });
    const coolingSpot = box(mister, 0.5, 0.02, 0.5, 0, 0.011, -0.7, 0x2e9e77, { rough: 0.6, emissive: FRS_ACCENT, ei: 0.25 });
    reg(hits, coolingSpot, "cooling-spot");
    const mist = particles(mister, 50, 0x9fd3f0, { size: 0.025, life: 0.7, additive: false, opacity: 0.5 });
    mist.position.set(0, 1.1, 0);

    // Hydration table.
    const hydroTable = group(g, 2.0, 0, -1.9);
    box(hydroTable, 0.9, 0.05, 0.5, 0, 0.7, 0, 0x8a929a, { rough: 0.5, metal: 0.3 });
    for (const lx of [-0.35, 0.35]) box(hydroTable, 0.03, 0.68, 0.03, lx, 0.34, 0.2, 0x8a929a, { rough: 0.5, metal: 0.3 });
    const waterJug = cyl(hydroTable, 0.09, 0.11, 0.28, -0.2, 0.86, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.65, transparent: true, seg: 12 });
    decal(hydroTable, 0.14, 0.1, -0.2, 0.9, 0.09, signFace("WATER / ELECTROLYTE", { bg: "#0d1c14", accent: "#2e9e77", scale: 0.4 }), { px: 128 });
    reg(hits, waterJug, "hydration-water");
    const energyCan = cyl(hydroTable, 0.035, 0.035, 0.12, 0.28, 0.79, 0, 0xe8542f, { rough: 0.4, metal: 0.4, seg: 12 });
    holoTag(hydroTable, "Energy drinks", 0.28, 0.92, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, energyCan, "energy-drink");

    // Vitals station.
    const vitalsTable = group(g, 2.2, 0, -0.5);
    box(vitalsTable, 0.7, 0.05, 0.45, 0, 0.7, 0, 0x8a929a, { rough: 0.5, metal: 0.3 });
    const hrMon = instrument(vitalsTable, -0.2, 0.79, 0, { ry: 0.2, idle: "-- bpm", color: FRS_ACCENT, w: 0.14 });
    reg(hits, hrMon, "hr-monitor");
    const tempMon = instrument(vitalsTable, 0.0, 0.79, 0.1, { ry: 0.1, idle: "-- °F", color: FRS_ACCENT, w: 0.14 });
    reg(hits, tempMon, "temp-monitor");
    const coMon = instrument(vitalsTable, 0.22, 0.79, -0.05, { ry: -0.1, idle: "-- %COHb", color: 0xf0645b, w: 0.16 });
    reg(hits, coMon, "co-monitor");
    const reassessMon = instrument(vitalsTable, -0.1, 0.79, -0.15, { ry: 0.35, idle: "RE-CHECK", color: FRS_ACCENT, w: 0.15 });
    reg(hits, reassessMon, "reassess-monitor");
    const coAlert = ball(vitalsTable, 0.035, 0.22, 1.02, -0.05, 0xf0645b, { emissive: 0xf0645b, ei: 2.2, rough: 0.4 });
    coAlert.visible = false;

    // Resting crew: three seated figures, one showing heat stress.
    const chairSpec = [
      ["member-heat-stress", -0.9, -3.0, 0x445566, true],
      ["member-resting-a", 0.0, -3.15, 0x3d4b55, false],
      ["member-resting-b", 0.9, -3.0, 0x37505f, false],
    ];
    for (const [id, cx, cz, cloth, stressed] of chairSpec) {
      const chair = group(g, cx, 0, cz);
      box(chair, 0.42, 0.35, 0.42, 0, 0.175, 0, 0x2b2f34, { rough: 0.6 });
      const sitter = seatedFigure(chair, 0, 0.35, 0, { cloth, ry: Math.PI });
      if (stressed) sitter.head.rotation.x = 0.25;
      holoTag(chair, stressed ? "Not sweating — slow to answer" : "Resting", 0, 1.4, 0, { css: stressed ? "#f0645b" : "#2e9e77", w: stressed ? 0.5 : 0.28 });
      reg(hits, sitter.root, id);
    }

    // Smoking-in-rehab trap, near the chairs.
    const smokeSpot = group(g, 1.6, 0, -3.1);
    box(smokeSpot, 0.1, 0.02, 0.06, 0, 0.01, 0, 0xe8e2d6, { rough: 0.7 });
    cyl(smokeSpot, 0.008, 0.008, 0.06, 0.04, 0.04, 0, 0x8a1f1f, { rough: 0.5, seg: 8 });
    holoTag(smokeSpot, "Lighting up here?", 0, 0.2, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, smokeSpot, "smoking-in-rehab");

    // Rehab officer and the crew-chief pressure panel.
    const officer = standingFigure(g, 2.7, 0.55, { ry: -1.6, cloth: 0x2b3138, helmet: 0x1b1e22, vest: FRS_ACCENT });
    void officer;
    const chiefPanel = group(g, -0.9, 0, -3.15);
    box(chiefPanel, 0.5, 0.35, 0.05, 0, 1.1, 0, 0x2b3138, { rough: 0.6 });
    const reevalBtn = box(chiefPanel, 0.22, 0.1, 0.02, -0.12, 1.1, 0.03, 0x2e9e77, { emissive: FRS_ACCENT, ei: 0.6, rough: 0.5 });
    decal(chiefPanel, 0.2, 0.08, -0.12, 1.1, 0.045, signFace("HOLD — RE-EVAL", { bg: "#0d1c14", accent: "#2e9e77", scale: 0.4 }), { px: 128 });
    reg(hits, reevalBtn, "reeval-hold-button");
    const releaseBtn = box(chiefPanel, 0.22, 0.1, 0.02, 0.12, 1.1, 0.03, 0xf0645b, { emissive: 0xf0645b, ei: 0.5, rough: 0.5 });
    decal(chiefPanel, 0.2, 0.08, 0.12, 1.1, 0.045, signFace("RELEASE — NOW", { bg: "#1b0d0d", accent: "#f0645b", scale: 0.4 }), { px: 128 });
    reg(hits, releaseBtn, "premature-release");
    const chief = standingFigure(g, -1.7, 2.6, { ry: 1.0, cloth: 0x3a2f2f, helmet: 0x8a1f1f, vest: 0xf2c14b });
    holoTag(chief, "Crew chief", 0, 1.9, 0, { css: "#f2c14b", w: 0.3 });
    void chief;

    // EMS marker and the deferral radio.
    const ems = group(g, -2.6, 0, 2.3);
    box(ems, 1.3, 0.9, 0.7, 0, 0.55, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3 });
    box(ems, 0.6, 0.06, 0.7, 0, 1.03, 0, 0xf0645b, { emissive: 0xf0645b, ei: 0.4, rough: 0.5, cast: false });
    for (const wx of [-0.5, 0.5]) { const wheel = cyl(ems, 0.18, 0.18, 0.16, wx, 0.18, 0.3, 0x1a1e23, { rough: 0.9, seg: 12 }); wheel.rotation.x = Math.PI / 2; }
    holoTag(ems, "EMS transport", 0, 1.2, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, ems, "ems-transport");
    const deferRadio = group(g, 2.7, 0, 1.6);
    box(deferRadio, 0.08, 0.15, 0.05, 0, 0.9, 0, 0x2b3138, { rough: 0.5 });
    holoTag(deferRadio, "Tell command — not released", 0, 1.05, 0, { css: "#2e9e77", w: 0.5 });
    reg(hits, deferRadio, "radio-defer-ic");

    // Log board and crew check-in board.
    const logBoard = holoPanel(g, 0.5, 0.36, 2.1, 1.35, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,18,14,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2e9e77"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#dffbf0";
      ctx.fillText("REHAB LOG", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#bfeedd";
      ["Entry time / cylinder count", "Vitals at entry and release", "Release time, signed off"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: -0.6, accent: FRS_ACCENT });
    reg(hits, logBoard, "rehab-log-board");

    const checkinBoard = holoPanel(g, 0.5, 0.36, -2.2, 1.35, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,18,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e2f6ff";
      ctx.fillText("CREW CHECK-IN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#cfeaf7";
      ["\"How are you doing?\" — ask it", "Peer-support / CISM line posted", "Answer logged, not assumed"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: 0.6, accent: 0x4fd1ff });
    reg(hits, checkinBoard, "crew-checkin-board");

    let cooled = false;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0.4, 1.2, -1.5),

      onStepComplete(step) {
        if (step.id === "mister-on") mist.visible = true;
        if (step.id === "cooling-hold") cooled = true;
        if (step.id === "hold-for-reeval") reevalBtn.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.9, rough: 0.5 });
        if (step.id === "log-rehab") repaint(logBoard.userData.face, (ctx, w, h) => {
          ctx.fillStyle = "rgba(10,18,14,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
          ctx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#eafbf1";
          ctx.fillText("LOGGED — RELEASED", w / 2, h * 0.5);
        });
      },

      onInterrupt(it) {
        if (it.id === "co-spike") { coAlert.visible = true; repaint(coMon.userData.screen, signFace("HIGH", { bg: "#1b0d0d", accent: "#f0645b", fg: "#ffd9d9", scale: 0.6 })); }
        if (it.id === "ic-wants-crew-early") deferRadio.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "co-spike") { coAlert.visible = false; repaint(coMon.userData.screen, signFace("-- %COHb", { bg: "#0d1c24", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.62 })); }
        if (it.id === "ic-wants-crew-early") deferRadio.children[0].material = mat(0x2b3138, { rough: 0.5 });
      },

      animate(t, dt) {
        smokePlume.visible = true; smokePlume.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.2, 0.3, 0.5);
        if (mist.visible) mist.userData.step(dt, new THREE.Vector3(0, 0, -0.15), 0.35, 0.6, -0.4);
        if (cooled) { /* member has cooled; nothing further to animate */ void cooled; }
      },
    };
  },
};
