import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, lathe, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel, pipeRun,
  lockTag, cylinderTank, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Steam Trap Survey & Condensate Return VR — Building Systems &
// Facilities, the stationary engineer building plant block.
//
// A mechanical room steam main with three trap stations along it, a
// condensate receiver and its return pump against the far wall, and a
// bypass valve that should never be opened without the permit. The learner
// is the IUOE stationary engineer running the annual trap survey, with a
// second engineer logging the results. The site is generic.

const SES_ACCENT = 0x6fc9e8;
const SES_CSS = "#6fc9e8";

export const SIM_SE_STEAM_TRAP_SURVEY_AND_CONDENSATE_RETURN = {
  id: "se-steam-trap-survey-and-condensate-return",
  index: "344",
  domain: "Facilities",
  trade: "IUOE stationary engineer running the annual steam trap survey, with a second engineer logging results at the condensate skid",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "ASME Boiler and Pressure Vessel Code practice for the steam side of this plant, the National Board Inspection Code for the vessels it feeds, ASME B31.9 building services piping for the trap and return lines, 29 CFR 1910.147 control of hazardous energy for isolating a trap before it is opened, and IUOE local training fund stationary engineer curricula",
  name: "Steam Trap Survey & Condensate Return",
  title: simTitle("Steam Trap Survey & Condensate Return VR"),
  tagline: "The annual survey down the steam main: the work order read, gloves and a face shield on, the trap under test locked and tagged out, its differential read across the trap, the acoustic reading held to catch a blow-through, a weeping union found down the line before it is stepped past, the failed trap tagged, swapped and its isolation reopened in order, the condensate tank level and the sight glass read, the return pump primed and held to catch, the crew checked in, and the survey logged",
  accent: SES_ACCENT,
  accentCss: SES_CSS,
  parSeconds: 330,
  footprint: 2.8,
  badge: { id: "trap-line-certified", name: "Trap Line Certified", note: "Every trap isolated before it was opened, the swap made in order, and the bypass valve never touched without the permit" },

  supportLine: "your IUOE local's member assistance programme",

  game: system({
    name: "Trap Survey",
    currency: "TAG",
    ranks: ["Plant Hand", "Survey Crew", "Trap Line Lead", "Condensate Certified", "Stationary Engineer Certified"],
    badges: [
      { id: "isolated-before-open", name: "Isolated Before Open", note: "The trap under test locked and tagged before the swap began", test: AWARD.stepClean("lockout-trap-line") },
      { id: "pump-primed-clean", name: "Pump Primed Clean", note: "The return pump held to a full catch on the first try", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never the bypass valve touched without a permit, never a bare hand on live steam, never the cutout overridden", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-survey", name: "Clean Survey", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "differential-on-the-band", name: "Differential On The Band", note: "Temperature differential committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "survey-logged-fast", name: "Survey Logged Fast", note: "Survey log closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bypass-without-permit": "You opened the manual bypass valve around the stuck trap without a permit or a call to the plant supervisor. The bypass routes live steam straight past the trap that is supposed to be controlling it, and opening it on your own authority — rather than under a written bypass permit everyone on shift can see — is how a temporary workaround becomes the reason nobody downstream knows there is uncontrolled steam in a line they think is trapped.",
    "bare-hand-steam-line": "You put a bare hand on the uninsulated steam line instead of keeping the heat-resistant glove on. A line carrying saturated steam is well past the temperature a bare hand can touch for even a moment without a burn, and the glove exists specifically for the sections of this survey — like reading a trap body by feel — where an instrument alone will not tell you what your hand can.",
    "stand-in-vent-path": "You stood directly in line with the vent stack's discharge instead of stepping to the side before it fired. A condensate vent can discharge flash steam without warning the moment a trap cycles, and standing in its path is choosing to find out how hot that discharge is by standing in it rather than by reading the plant's own diagram of where it points.",
    "override-pump-cutout": "You forced the condensate pump's low-level cutout switch to keep it running instead of letting it stop on its own. The cutout exists to stop the pump before it runs dry and burns out its seals, and overriding it to squeeze one more cycle out of a low tank is how a pump that would have restarted fine in ten minutes becomes a pump that needs to be pulled and rebuilt.",
  },

  lateNotes: {
    "new-trap": "There is no trap to swap yet — the line under test has to be locked out first.",
    "isolation-valve": "Nothing to reopen yet — the new trap goes in before the isolation valve is turned back open.",
    "pump-switch": "Nothing to prime yet — check the receiver tank's level before starting the pump.",
  },

  steps: [
    {
      id: "read-work-order", kind: "select", target: "survey-board",
      title: "Read the survey work order",
      cue: "Read the work order: which trap is under test, the differential band that counts as passing, and the bypass permit rule.",
      why: "The work order is what turns a walk down the steam main into a survey with a pass criterion, rather than a guess at which of three traps actually needs attention — it names the trap, the differential band a healthy trap should read, and the one rule that never changes: the bypass valve does not open without its own permit.",
    },
    {
      id: "don-ppe", kind: "sequence", anyOrder: true,
      targets: ["heat-gloves", "face-shield"],
      itemNames: { "heat-gloves": "heat-resistant gloves", "face-shield": "face shield" },
      title: "Heat-resistant gloves and face shield on before touching the main",
      cue: "Heat-resistant gloves and a face shield on before reading any trap by hand or cracking a fitting.",
      why: "A steam main runs hot enough to burn skin on contact and can vent without warning the moment a trap or a union lets go, and the gloves and face shield are what let this survey involve actually touching pipe rather than reading everything from three feet back.",
    },
    {
      id: "lockout-trap-line", kind: "select", target: "trap-lockout",
      title: "Lock and tag the trap under test before opening it",
      cue: "Close the trap's isolation valve, lock it and hang your tag before doing anything else to this trap.",
      why: "29 CFR 1910.147 exists because a trap that looks isolated and a trap that is actually locked out are not the same thing to the hand about to open it — the lock and tag are what keep someone else on shift from opening that valve back up while this trap is apart on the bench.",
    },
    {
      id: "temp-differential", kind: "gauge", target: "ir-thermometer",
      title: "Read the temperature differential across the trap",
      cue: "Read the inlet and outlet temperatures with the infrared thermometer and commit the differential once it settles inside the band.",
      why: "A healthy trap runs measurably hotter on the inlet side than the outlet, and a differential outside that band is the trap telling you which way it has failed — stuck open and blowing steam straight through, or stuck shut and backing condensate up into the main. Reading it now, before the trap comes apart, is what tells you whether this is even the trap the work order sent you to.",
      gauge: { label: "Δ TEMP", speed: 0.65, green: [0.4, 0.62], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the band — hold the thermometer on both sides of the trap until the reading stops moving before you commit it." },
    },
    {
      id: "listen-for-blow-through", kind: "track", target: "acoustic-detector", seconds: 6,
      title: "Hold the acoustic reading on the trap, listening for blow-through",
      cue: "Hold the acoustic detector against the trap body, keeping the reading inside the band the whole listen.",
      why: "A trap that is blowing through sounds different under an acoustic probe than one cycling normally, and holding the listen for the full interval — rather than a quick touch — is what catches a trap that only blows through intermittently instead of passing it on a lucky half-second.",
      track: { start: 0.3, green: [0.2, 0.42], rise: 0.4, fall: 0.3, drift: 0.14, label: "ACOUSTIC", readout: (v) => (v < 0.2 ? "quiet" : v > 0.42 ? "blowing through" : "normal cycling") },
      holdBreakNote: "The listen broke off before the interval finished — an intermittent blow-through is exactly what a short listen misses.",
    },
    {
      id: "find-hidden-leak", kind: "find", noHint: true,
      targets: ["leaking-union"],
      itemNames: { "leaking-union": "weeping union fitting down the line" },
      itemNotes: { "leaking-union": "A union fitting further down the steam main is weeping a thin plume — small enough to miss from a distance, big enough to tag for the next maintenance window before it grows." },
      title: "Walk the rest of the main before moving to the trap swap",
      cue: "Look down the length of the steam main for anything venting that should not be — a weeping union, a hissing gasket.",
      why: "A survey that stops at the one trap on the work order misses everything else on the main that is failing quietly in the background, and walking the rest of the line with your eyes up — rather than heading straight for the trap under test — is what catches a small leak while it is still small enough to schedule instead of emergency work.",
    },
    {
      id: "tag-failed-trap", kind: "select", target: "failed-trap-tag",
      title: "Tag the failed trap for replacement",
      cue: "Hang a failed-equipment tag on the trap once the differential and the acoustic reading both confirm it has failed.",
      why: "A trap pulled without a tag on the record is a trap the next engineer has no way of knowing was ever tested, and tagging it now — while the readings that condemned it are still fresh — is what makes the swap traceable back to the actual survey rather than a guess made later from memory.",
    },
    {
      id: "swap-trap", kind: "drag", target: "new-trap",
      title: "Set the replacement trap into the isolated body",
      cue: "Carry the new trap from the bench and seat it into the isolated trap body's socket.",
      why: "The replacement only does its job seated fully into the body the old trap came out of, and doing this with the line already locked out is what makes the swap a maintenance task instead of a race against live steam on the other side of a valve someone forgot to close.",
      drag: { to: "trap-socket", radius: 0.5, missNote: "Not seated in the trap body — the replacement has to go fully into the socket the old trap came out of, not rest against the outside of it." },
    },
    {
      id: "restore-isolation", kind: "turn", target: "isolation-valve",
      title: "Reopen the trap's isolation valve",
      cue: "Turn the isolation valve back open slowly, watching for a clean cycle rather than counting turns.",
      why: "Reopening the valve too fast slams live steam into a trap that has been sitting cold, which is exactly the thermal shock that shortens the life of the replacement you just installed — opening it slowly, watching the trap take up steam evenly, is what makes this swap last until the next scheduled survey instead of failing again in a month.",
      turn: { turns: 1.0, label: "VALVE", readout: (t) => (t < 0.3 ? "cracked" : t < 0.85 ? "opening" : "full open") },
    },
    {
      id: "condensate-level-gauge", kind: "gauge", target: "tank-level-gauge",
      title: "Read the condensate receiver's level",
      cue: "Read the receiver tank's level gauge and commit the reading once it settles inside the band before starting the pump.",
      why: "The return pump is sized to run against a tank that is actually holding condensate, and starting it against a tank reading near empty is exactly the situation its own low-level cutout exists to prevent — reading the level first is what tells you whether this is a normal cycle or a pump about to run dry.",
      gauge: { label: "TANK LEVEL", speed: 0.65, green: [0.35, 0.6], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the band — hold the gauge until the level stops moving before you commit it." },
    },
    {
      id: "prime-pump", kind: "hold", target: "pump-switch", seconds: 5,
      title: "Hold the pump switch through the prime",
      cue: "Hold the return pump's start switch until it catches and settles to a steady run.",
      why: "A condensate pump released before it actually primes can cycle its motor on and off against a column of steam instead of water, which is exactly the kind of short-cycling that burns out a starter well before its rated life. Holding the switch through the full prime, watching it settle rather than assuming the first click worked, is what makes the start reliable.",
      holdBreakNote: "The switch let go before the pump caught — it cycled straight back off. Hold it again through the full prime.",
    },
    {
      id: "read-sight-glass", kind: "select", target: "sight-glass",
      title: "Read the return line's sight glass",
      cue: "Check the sight glass on the return line for flash steam or a solid column of condensate.",
      why: "A sight glass full of flash steam instead of a solid liquid column is telling you the return line is running hotter than the system was designed for, and reading it now, right after the pump comes up to speed, is how that gets caught on the survey instead of showing up later as a return line that keeps losing pressure.",
    },
    {
      id: "crew-checkin", kind: "select", target: "plant-radio",
      title: "Check in with the engineer at the condensate skid",
      cue: "Call the second engineer: the trap swapped, isolation restored, tank level and the pump both good.",
      why: "The second engineer's own log at the skid is only as good as what actually gets radioed up from the trap line, and calling it in now — rather than assuming the readings will still be remembered at the end of the shift — is what keeps the two halves of this survey matching.",
    },
    {
      id: "close-survey-log", kind: "select", target: "survey-log-board",
      title: "Close the survey log",
      cue: "Record the failed trap, the swap, the weeping union found down the line, and the condensate readings before signing off.",
      why: "The survey log is the plant's own record of which trap failed and when, and a weeping union found on today's walk that never makes the log is a leak the next survey finds by luck instead of by the page that was supposed to already know about it.",
    },
  ],

  interrupts: [
    {
      id: "relief-valve-lift",
      kind: "A pressure relief valve lifts nearby mid-survey",
      after: "temp-differential", delay: 2, seconds: 14,
      alert: "A pressure relief valve on a nearby vessel has just lifted with a loud, sustained discharge.",
      cue: "Break off the trap reading and move to the muster point until the discharge is confirmed clear.",
      target: "muster-point",
      why: "A relief valve lifting is the vessel telling the whole room it is at its set pressure, and standing near a trap reading while that discharge is still running is standing near a plant that just told you it is working outside its normal band. The muster point is where the survey waits until someone confirms the vessel is back under control.",
      missNote: "The trap reading continued through the discharge; nobody moved to the muster point until the supervisor came looking for the crew still standing at the trap line.",
      wrongNote: "The muster point — a relief valve lift is answered by clearing the area, not by finishing the reading you were already taking.",
    },
    {
      id: "pump-cavitation-alarm",
      kind: "The condensate pump alarms for cavitation mid-prime",
      after: "prime-pump", delay: 2, seconds: 12,
      alert: "The condensate pump's alarm is sounding for cavitation — a knocking sound has started at the pump casing.",
      cue: "Hit the pump's emergency stop now — the sight glass reading waits.",
      target: "pump-estop",
      why: "A cavitating pump is already damaging its own impeller with every second it keeps turning, and the emergency stop is what ends that before a knocking sound becomes a pump that needs new internals — reading the sight glass can wait the few seconds the e-stop takes to reach.",
      missNote: "The pump kept running while the sight glass was checked first; the knocking continued the whole time until someone finally reached the e-stop.",
      wrongNote: "The pump's emergency stop — a cavitation alarm is answered immediately, not after finishing the reading already underway.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, SES_ACCENT);

    // -------------------------------------------------------------- floor
    box(g, 6.4, 0.06, 5.4, 0, 0.03, 0, 0x2b2f34, { rough: 0.92, finish: "concrete", tile: 3 });

    // ------------------------------------------------------------ steam main
    pipeRun(g, [[-3.0, 1.1, -1.4], [2.6, 1.1, -1.4]], 0.07, 0xb8402f, { flanges: [[-1.6, 1.1, -1.4], [0.6, 1.1, -1.4]], flangeAxis: "x" });

    // The trap under test, with its isolation valve, socket and lockout point.
    const trapArea = group(g, -0.6, 0, -1.4);
    const isolation = valveWheel(trapArea, -0.35, 1.1, 0, { color: 0xb8402f });
    holoTag(isolation, "isolation valve", 0, 0.4, 0, { css: SES_CSS, w: 0.36 });
    reg(hits, isolation.userData.wheel, "isolation-valve");
    const lock = lockTag(trapArea, -0.35, 1.35, 0.12, { lines: ["TRAP", "LOCKED OUT"] });
    reg(hits, lock, "trap-lockout");
    const trapSocket = box(trapArea, 0.16, 0.2, 0.16, 0, 0.85, 0, 0x2b2f34, { rough: 0.7, metal: 0.3 });
    holoTag(trapSocket, "trap socket", 0, 0.28, 0, { css: SES_CSS, w: 0.3 });
    reg(hits, trapSocket, "trap-socket");
    const oldTrap = cyl(trapArea, 0.07, 0.07, 0.22, 0, 0.85, 0, 0x8a6a2a, { rough: 0.6, metal: 0.4, seg: 12 });
    holoTag(oldTrap, "failed trap", 0.2, 1.0, 0, { css: "#f2ae14", w: 0.3 });
    reg(hits, oldTrap, "failed-trap-tag");

    // Bare-pipe hazard beside the trap.
    const barePipe = cyl(trapArea, 0.05, 0.05, 0.5, 0.5, 1.1, 0, 0xb8402f, { rough: 0.4, metal: 0.5, seg: 12 });
    barePipe.rotation.z = Math.PI / 2;
    holoTag(trapArea, "bare hand it?", 0.5, 1.35, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, barePipe, "bare-hand-steam-line");

    // The bypass valve, off to the side, never touched without a permit.
    const bypass = valveWheel(g, 1.6, 1.1, -1.4, { color: 0xe8b02e, ry: -0.4 });
    holoTag(bypass, "bypass valve — permit only", 0, 0.4, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, bypass.userData.wheel, "bypass-without-permit");

    // The weeping union, further down the main.
    const union = group(g, 2.0, 1.1, -1.4);
    const weep = box(union, 0.1, 0.02, 0.08, 0, -0.1, 0.09, 0x14100a, { rough: 0.15, metal: 0.2, emissive: 0x0a0806, ei: 0.2 });
    holoTag(union, "steam main", 0, 0.28, 0, { css: SES_CSS, w: 0.3 });
    reg(hits, weep, "leaking-union");

    // ------------------------------------------------------------- instruments
    const chest = toolChest(g, -2.6, 1.6, { ry: 0.4, color: 0x2b3138 });
    const irThermo = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "-- °F", color: SES_ACCENT, w: 0.1, d: 0.16 });
    holoTag(irThermo, "IR thermometer", 0, 0.16, 0, { css: SES_CSS, w: 0.36 });
    reg(hits, irThermo, "ir-thermometer");
    const acoustic = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "-- dB", color: SES_ACCENT, w: 0.1, d: 0.16 });
    holoTag(acoustic, "acoustic detector", 0, 0.16, 0, { css: SES_CSS, w: 0.38 });
    reg(hits, acoustic, "acoustic-detector");
    const radio = instrument(chest, -0.2, 0.79, -0.14, { ry: 0.4, idle: "CH 6 · SKID", color: SES_ACCENT, w: 0.08, d: 0.12 });
    holoTag(radio, "plant radio", 0, 0.16, 0, { css: SES_CSS, w: 0.28 });
    reg(hits, radio, "plant-radio");

    // -------------------------------------------------------------- PPE rack
    const rack = group(g, -2.9, 0, 0.6, 0.3);
    cyl(rack, 0.02, 0.02, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.4, 0.03, 0.03, 0, 1.25, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const gloveProp = group(rack, -0.1, 0.9, 0);
    box(gloveProp, 0.16, 0.22, 0.02, 0, 0, 0, 0xe8b02e, { rough: 0.8 });
    holoTag(rack, "heat gloves", -0.1, 1.1, 0, { css: SES_CSS, w: 0.28 });
    reg(hits, gloveProp, "heat-gloves");
    const shieldProp = group(rack, 0.14, 0.9, 0);
    box(shieldProp, 0.2, 0.24, 0.01, 0, 0, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.6, transparent: true });
    holoTag(rack, "face shield", 0.14, 1.1, 0, { css: SES_CSS, w: 0.28 });
    reg(hits, shieldProp, "face-shield");

    // The new trap, staged on the bench.
    const newTrap = cyl(g, 0.07, 0.07, 0.22, -1.6, 0.9, 1.6, 0xc0c6cc, { rough: 0.4, metal: 0.6, seg: 12 });
    holoTag(newTrap, "replacement trap", 0, 0.22, 0, { css: SES_CSS, w: 0.34 });
    reg(hits, newTrap, "new-trap");

    // ------------------------------------------------------- condensate skid
    const tank = cylinderTank(g, 2.2, 1.4, 0x8fa8b4, { plateLabel: "CONDENSATE", plateLines: ["RECEIVER TANK"] });
    const tankLevel = instrument(g, 2.6, 1.0, 1.4, { ry: -0.5, idle: "-- %", color: SES_ACCENT, w: 0.1, d: 0.14 });
    holoTag(tankLevel, "tank level gauge", 0, 0.18, 0, { css: SES_CSS, w: 0.36 });
    reg(hits, tankLevel, "tank-level-gauge");
    const pumpBody = group(g, 1.7, 0, 1.8);
    box(pumpBody, 0.4, 0.3, 0.3, 0, 0.15, 0, 0x3c444c, { rough: 0.5, metal: 0.5 });
    const pumpSwitch = box(pumpBody, 0.05, 0.03, 0.02, 0.15, 0.34, 0.1, 0x59c97b, { rough: 0.4 });
    holoTag(pumpBody, "pump start — hold", 0, 0.55, 0, { css: SES_CSS, w: 0.4 });
    reg(hits, pumpSwitch, "pump-switch");
    const pumpEStop = ball(pumpBody, 0.04, -0.15, 0.34, 0.1, 0xd2312b, { rough: 0.4 });
    holoTag(pumpBody, "pump e-stop", -0.15, 0.6, 0.1, { css: SES_CSS, w: 0.3 });
    reg(hits, pumpEStop, "pump-estop");
    const overrideHit = box(g, 0.2, 0.15, 0.05, 1.9, 0.4, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "override the cutout?", 1.9, 0.65, 1.9, { css: "#d2312b", w: 0.44 });
    reg(hits, overrideHit, "override-pump-cutout");
    const sightGlass = cyl(g, 0.02, 0.02, 0.3, 2.6, 0.5, 1.4, 0xdfe4e8, { rough: 0.2, opacity: 0.6, transparent: true, seg: 10 });
    holoTag(sightGlass, "sight glass", 0, 0.25, 0, { css: SES_CSS, w: 0.28 });
    reg(hits, sightGlass, "sight-glass");

    // ---------------------------------------------------------------- vent
    const vent = group(g, -1.2, 0, 2.2);
    cyl(vent, 0.05, 0.05, 1.4, 0, 0.7, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 10 });
    holoTag(vent, "vent stack", 0, 1.5, 0, { css: SES_CSS, w: 0.3 });
    const ventPathHit = box(g, 0.4, 0.3, 0.4, -1.2, 0.5, 1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the vent path?", -1.2, 0.85, 1.5, { css: "#d2312b", w: 0.5 });
    reg(hits, ventPathHit, "stand-in-vent-path");

    // ------------------------------------------------------------- paperwork
    const board = holoPanel(g, 0.95, 0.66, -3.2, 1.35, 0.6, (cx, w, h) => {
      cx.fillStyle = "#0b1a1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = SES_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff5fb"; cx.fillText("SURVEY WORK ORDER", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eefaff";
      ["Trap under test: main line, station 2", "Differential band: on the gauge",
        "Bypass valve: permit only, no exceptions", "Isolate before opening any trap",
        "Log every reading before sign-off", "Condensate tank checked before the pump starts"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.4, accent: SES_ACCENT });
    reg(hits, board, "survey-board");

    const log = holoPanel(g, 0.6, 0.42, -2.4, 1.3, 2.2, (cx, w, h) => {
      cx.fillStyle = "#0b1a1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = SES_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff5fb"; cx.fillText("SURVEY LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eefaff";
      ["Trap: —", "Union: —", "Condensate: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: SES_ACCENT });
    reg(hits, log, "survey-log-board");

    // ------------------------------------------------------------ muster point
    const muster = group(g, 3.0, 0, 2.2);
    const musterRing = torus(muster, 0.3, 0.012, 0, 0.02, 0, SES_ACCENT, { emissive: SES_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    musterRing.rotation.x = Math.PI / 2;
    holoTag(muster, "muster point", 0, 0.32, 0, { css: SES_CSS, w: 0.34 });
    reg(hits, musterRing, "muster-point");

    // ------------------------------------------------------------------ crew
    const supervisor = standingFigure(g, 2.1, 0.5, { ry: -1.2, cloth: 0x2b3138, vest: SES_ACCENT, helmet: 0xf2f2f2 });
    holoTag(supervisor, "engineer — condensate skid", 0, 1.95, 0, { css: SES_CSS, w: 0.5 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.9, -0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout-trap-line") lock.material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "temp-differential") repaint(irThermo.userData.screen, signFace("Δ OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "tag-failed-trap") oldTrap.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.6, rough: 0.6 });
        if (step.id === "swap-trap") { newTrap.visible = false; oldTrap.visible = false; }
        if (step.id === "restore-isolation") { /* handled in animate via turn */ }
        if (step.id === "condensate-level-gauge") repaint(tankLevel.userData.screen, signFace("IN BAND", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "prime-pump") pumpSwitch.material = mat(0x59c97b, { emissive: 0x1a5a2a, ei: 0.6, rough: 0.4 });
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("SURVEY OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
        if (step.id === "close-survey-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0b1a1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dff5fb"; cx.fillText("SURVEY LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Trap: swapped", "Union: tagged for repair", "Condensate: in band"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "relief-valve-lift") musterRing.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
        if (it.id === "pump-cavitation-alarm") pumpEStop.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "relief-valve-lift") musterRing.material = mat(SES_ACCENT, { emissive: SES_ACCENT, ei: 1.4, rough: 0.4 });
        if (it.id === "pump-cavitation-alarm") pumpEStop.material = mat(0xd2312b, { rough: 0.4 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "restore-isolation") isolation.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "temp-differential") repaint(irThermo.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (gg && !gg.committed && step?.id === "condensate-level-gauge") repaint(tankLevel.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.35 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "listen-for-blow-through" && session.holding) repaint(acoustic.userData.screen, signFace(`${Math.round(session.track.v * 100)}`, { bg: "#0d1c24", accent: session.track.v <= 0.42 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        void dt; void t; void CITY; void weep;
      },
    };
  },
};

function standingFigure2() {
  throw new Error("unreachable");
}
