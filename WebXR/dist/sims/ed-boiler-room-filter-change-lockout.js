import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg, lockTag,
  surfaceTexture, texturedMat, deckPlateFace, concreteFace,
} from "../citykit.js";
import { flashlight } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Boiler Room & HVAC Filter Change with Lockout VR — Building
// Systems & Facilities, the education-support-staff programme.
//
// The school's boiler room on a maintenance morning: the gauges read before
// anything is touched, the room walked for what's not right, the air
// handler locked out and proven dead before the access panel ever comes
// off, the filter matched to the unit's own label rather than whatever's on
// the shelf, the panel latched back down, the lockout removed in the
// district's own order, and a short observed restart watched steady before
// the ticket is closed. The learner is the AFT- or CSEA-represented school
// maintenance technician. The school, the boiler's make and every reading
// on a gauge are generic; the room's own procedure and the manufacturer's
// manual are named as governing documents, never a clause nobody is certain of.

const BR_ACCENT = 0xe8762b;
const BR_CSS = "#e8762b";

export const SIM_ED_BOILER_ROOM_FILTER_CHANGE_LOCKOUT = {
  id: "ed-boiler-room-filter-change-lockout",
  index: "627",
  domain: "Building Systems & Facilities",
  trade: "AFT- or CSEA-represented school maintenance technician running a boiler-room walk and an air-handler filter change under lockout",
  category: "Building Systems & Facilities",
  indoor: "plant",
  weather: "overcast",
  certification: "AFT and CSEA facilities training; OSHA's control of hazardous energy standard (29 CFR 1910.147) for the air handler's lockout and the proof of zero energy; NFPA 85 for the boiler-room hazards named on the walk; the ASME Boiler and Pressure Vessel Code and the National Board Inspection Code for the boiler's own pressure equipment; the district's maintenance procedure and the equipment manufacturer's manual for the filter's rating and the restart sequence",
  name: "Boiler Room & HVAC Filter Change with Lockout",
  title: simTitle("Boiler Room & HVAC Filter Change with Lockout"),
  tagline: "The ticket read, the boiler's gauges checked, the room walked for a leaking relief valve, a corroded flue and a blocked combustion-air louver, the air handler locked, tagged and proven dead, the filter matched to the unit's own label, the panel latched, the lockout removed in order, and a short observed restart watched steady before sign-off",
  accent: BR_ACCENT,
  accentCss: BR_CSS,
  parSeconds: 340,
  footprint: 2.8,
  badge: { id: "proven-dead-first", name: "Proven Dead First", note: "The air handler locked, tagged and proven dead before the panel ever came off, the right filter fitted, and the restart watched steady before the ticket closed" },

  supportLine: "your AFT or CSEA chapter's member assistance line, or the district's employee assistance programme",

  game: system({
    name: "Boiler Room",
    currency: "PSI",
    ranks: ["Maintenance Aide", "Maintenance Tech", "Lead Tech", "Building Engineer", "Facilities Certified"],
    badges: [
      { id: "never-skipped-lockout", name: "Never Skipped Lockout", note: "The panel never opened before the unit was locked, tagged and proven dead", test: AWARD.safe },
      { id: "clean-walk", name: "Clean Walk", note: "No corrections across the whole room", test: AWARD.clean },
      { id: "steady-restart", name: "Steady Restart", note: "The observed restart held in band without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "ticket-closed-on-time", name: "Ticket Closed on Time", note: "Whole job finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-room-walk", name: "One-Pass Room Walk", note: "Boiler-room walk clean on the first pass", test: AWARD.stepClean("boiler-room-walk") },
      { id: "nine-in-a-row", name: "Nine in a Row", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "skip-lockout-quick-fix": "That's reaching for the access panel before the air handler has been locked out at all. A unit that's merely switched off can still be started from another switch or a schedule nobody in this room knows about — the panel doesn't come off until the lock, the tag and a proven-dead check are all done first.",
    "ignore-relief-valve-leak": "That's walking past a pressure-relief valve that's actively weeping instead of reporting it. A relief valve is the boiler's last line of defence against overpressure — one that's already leaking under normal conditions is one nobody can trust to seat properly if it's ever actually called on.",
    "block-combustion-air": "That's stacking supplies in front of the combustion-air louver. A boiler starves for air exactly where that louver feeds it, and blocking it risks incomplete combustion and carbon monoxide building up in a room somebody works in every day.",
    "wrong-filter-rating": "That's a filter off the shelf that doesn't match this unit's rated size or rating. A filter that merely fits the slot but isn't rated for the unit either restricts airflow the fan wasn't sized for or lets past exactly what the correct filter is supposed to catch.",
  },

  lateNotes: {
    "boiler-gauge": "Not yet — the gauges get read once today's ticket has actually been read, not before.",
    "try-operate-button": "The zero-energy check happens once the lock and tag are actually on — that's the next step.",
  },

  steps: [
    {
      id: "read-ticket", kind: "select", target: "ticket-board",
      title: "Read today's maintenance ticket",
      cue: "Read the ticket for the filter change and the boiler-room walk it calls for.",
      why: "The ticket names which air handler needs its filter changed today and what else the walk should specifically look at — reading it first is what keeps a maintenance tech from locking out the wrong unit or missing what the last shift already flagged.",
    },
    {
      id: "boiler-gauge-check", kind: "gauge", target: "boiler-gauge",
      title: "Read the boiler's pressure and temperature",
      cue: "Read the boiler's gauge and commit the reading against its normal operating range.",
      why: "A boiler running outside its normal range is telling the room something before a single tool comes out — reading the gauge first is what separates a routine filter change from a boiler that needs its own attention before anything else happens in this room today.",
      gauge: { label: "BOILER PRESSURE", speed: 0.6, green: [0.38, 0.62], readout: (t) => (t < 0.38 ? "low — check the feed" : t > 0.62 ? "high — flag it" : "normal range"), missNote: "Not in the normal range. A boiler reading outside it gets flagged before the rest of today's job continues." },
    },
    {
      id: "boiler-room-walk", kind: "find", noHint: true,
      targets: ["leaking-relief-valve", "corroded-flue", "blocked-louver"],
      itemNames: { "leaking-relief-valve": "the weeping pressure-relief valve", "corroded-flue": "the corroded flue connection", "blocked-louver": "the blocked combustion-air louver" },
      itemNotes: {
        "leaking-relief-valve": "This relief valve is weeping under normal pressure. A valve that leaks before it's ever actually called on to relieve overpressure is one nobody can trust to seat correctly when it matters.",
        "corroded-flue": "This flue connection has corroded through part of its wall. A flue that's lost its own integrity can let combustion gases into the room instead of carrying them outside where they belong.",
        "blocked-louver": "Supplies have been stacked in front of the combustion-air louver. The boiler draws its combustion air through that opening, and blocking it risks starving the flame and building up carbon monoxide in the room.",
      },
      title: "Walk the boiler room before touching the air handler",
      cue: "Three things about this room are not right. Find them before the panel comes off.",
      why: "The boiler itself and the air handler share the same room and the same air, and a walk that only looks at the unit on today's ticket misses exactly the kind of problem that turns a routine filter change into a room nobody should have been standing in.",
    },
    {
      id: "lockout-sequence", kind: "sequence", anyOrder: false,
      targets: ["notify-occupants", "disconnect-off", "lock-and-tag"],
      itemNames: { "notify-occupants": "occupants notified", "disconnect-off": "disconnect switched off", "lock-and-tag": "lock and tag applied" },
      title: "Lock out the air handler",
      cue: "Notify anyone who might be affected, switch the disconnect off, then apply your own lock and tag, in that order.",
      why: "29 CFR 1910.147 puts notification before the switch and the switch before the lock for a reason: whoever else uses this air handler's space needs warning before it goes dark, and the lock only means something once the one source of power to it has actually been cut.",
      outOfOrderNote: "Notify, then the disconnect, then the lock and tag — the lock protects nobody until the power it's locking out has already been switched off.",
    },
    {
      id: "try-operate-check", kind: "hold", target: "try-operate-button", seconds: 5,
      title: "Prove the unit is dead",
      cue: "Hold the try-operate button and confirm nothing happens.",
      why: "A lock on the disconnect is only as good as the proof that it actually worked — holding the try-operate button and getting nothing is what turns 'should be locked out' into 'confirmed dead', and it happens before a single tool touches the access panel.",
      holdBreakNote: "You let go before holding long enough to be sure. The try-operate check has to run its full hold to actually prove the unit won't start.",
    },
    {
      id: "open-access-panel", kind: "turn", target: "panel-latch",
      title: "Open the filter access panel",
      cue: "Turn the latches and open the access panel.",
      why: "The panel only opens after the unit is proven dead, which is the whole point of the sequence up to here — opening it any earlier would put a hand inside a unit nobody has actually confirmed can't start.",
      turn: { turns: 0.4, label: "PANEL LATCH", readout: (t) => (t < 0.85 ? "unlatching" : "open") },
    },
    {
      id: "remove-old-filter", kind: "drag", target: "old-filter",
      title: "Remove the old filter",
      cue: "Carry the old filter out and set it aside for disposal.",
      why: "The old filter comes all the way out before a new one goes in, checked on the way out for how loaded it was — a filter that was nearly opaque with dust says something about how overdue this change actually was.",
      drag: { to: "disposal-spot", radius: 0.5, missNote: "Not clear of the unit yet. Carry the old filter all the way to the disposal spot before reaching for the new one." },
    },
    {
      id: "match-filter-rating", kind: "select", target: "correct-filter",
      title: "Match the new filter to the unit's label",
      cue: "Read the unit's label and take the matching filter from the shelf.",
      why: "The unit's own label states the exact size and rating the fan and the ductwork were designed around — a filter that merely fits the slot but isn't rated the same either starves the fan with too much resistance or lets past exactly what the correct filter is built to catch.",
    },
    {
      id: "seat-new-filter", kind: "select", target: "new-filter-slot",
      title: "Seat the new filter",
      cue: "Slide the new filter into its slot with the airflow arrow pointing the right way.",
      why: "A filter seated backwards restricts airflow and wastes its own media on the wrong side of the direction it was built for — the airflow arrow on its frame is what confirms it before the panel ever goes back on.",
    },
    {
      id: "close-access-panel", kind: "turn", target: "panel-latch",
      title: "Close and latch the access panel",
      cue: "Close the panel and turn the latches back down.",
      why: "The panel is latched fully closed before any lockout comes off, because an open panel and a live air handler are never supposed to exist in the room at the same moment for any reason.",
      turn: { turns: 0.4, label: "PANEL LATCH", readout: (t) => (t < 0.85 ? "latching" : "closed") },
    },
    {
      id: "remove-lockout", kind: "sequence", anyOrder: false,
      targets: ["area-clear-check", "lock-removed", "power-restored"],
      itemNames: { "area-clear-check": "area confirmed clear", "lock-removed": "lock and tag removed", "power-restored": "power restored" },
      title: "Remove the lockout in order",
      cue: "Confirm the area is clear, remove your own lock and tag, then restore power, in that order.",
      why: "The area gets confirmed clear before the lock comes off because the whole point of the lockout was keeping the unit from starting while someone might still be near it — restoring power is the very last action, only once nothing else about the job is still in progress.",
      outOfOrderNote: "Clear the area, then remove the lock, then restore power — power comes back only once nothing else is still exposed.",
    },
    {
      id: "observed-restart", kind: "track", target: "burner-flame", seconds: 6,
      title: "Watch a short observed restart",
      cue: "Watch the burner and keep its reading steady in the normal band through the restart.",
      why: "A restart watched for a few minutes catches a flame that sputters or a pressure that spikes right when the unit is most likely to show a new problem — walking away the moment power is restored means finding out about a bad restart from someone else's complaint instead of right here.",
      track: {
        start: 0.2, green: [0.4, 0.62], rise: 0.4, fall: 0.38, drift: 0.1, label: "BURNER",
        readout: (v) => (v < 0.4 ? "flame low — watch it" : v > 0.62 ? "pressure climbing" : "steady burn"),
      },
      holdBreakNote: "Reading out of band during the restart — a flame or pressure that won't settle gets watched until it does, not signed off in the moment it wanders.",
    },
    {
      id: "log-maintenance", kind: "select", target: "maintenance-log",
      title: "Log the filter change and boiler readings",
      cue: "Record the filter change, the flagged relief valve and today's boiler readings on the maintenance log.",
      why: "The log is what tells the next tech, or whoever schedules the relief valve's repair, exactly what was found and fixed today — a boiler room walked and a filter changed with nothing written down leaves the flagged relief valve nobody's problem until it fails.",
    },
  ],

  interrupts: [
    {
      id: "office-flips-breaker",
      kind: "Office about to reset an unrelated breaker",
      after: "try-operate-check", delay: 2, seconds: 10,
      alert: "The front office radios that they're about to reset breakers for an unrelated outage upstairs, not realizing one of them feeds this air handler.",
      cue: "Answer the radio now — tell them which breaker is locked out.",
      target: "radio",
      why: "A breaker reset by someone who doesn't know about today's lockout can undo it without ever touching the lock itself if the panels aren't clearly matched — answering immediately and naming the exact breaker is what keeps someone else's unrelated fix from re-energizing a unit this job is depending on staying dead.",
      missNote: "The office reset breakers without knowing which one was locked out — a lockout that another panel can undo without breaking the lock is exactly the gap this call was supposed to close.",
      wrongNote: "The radio — answer it now and name the locked-out breaker before anything gets reset.",
    },
    {
      id: "flame-rollout",
      kind: "Burner flame sputters during the restart",
      after: "observed-restart", delay: 2, seconds: 9,
      alert: "During the observed restart, the burner flame sputters and starts to roll out of the combustion chamber.",
      cue: "Hit the emergency shutoff.",
      target: "emergency-shutoff",
      why: "A flame rolling out of its chamber is combustion happening somewhere it isn't supposed to, and the only correct response is cutting fuel to the burner immediately — the emergency shutoff is answered the instant it's seen, not after trying to see if the flame settles on its own.",
      missNote: "The flame kept rolling out while the restart continued — a rollout is not a condition that improves by waiting to see what it does next.",
      wrongNote: "The emergency shutoff — that cuts fuel to the burner right now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, BR_ACCENT);

    // ------------------------------------------------------------- plant-room floor
    const floor = box(g, 6.2, 0.06, 5.0, 0, 0.03, 0, 0xffffff, { rough: 0.7 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h)), { repeat: 4, px: 384, rough: 0.7, color: 0x8f948e });
    const plinthMat = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h)), { repeat: 2, px: 384, color: 0xb8b8b0 });

    // ------------------------------------------------------------- boiler
    const boiler = group(g, -2.2, 0, -1.8);
    const boilerBody = cyl(boiler, 0.6, 0.6, 1.6, 0, 1.0, 0, 0xc9432c, { rough: 0.45, metal: 0.4, seg: 20 });
    void boilerBody;
    const plinth = box(boiler, 1.4, 0.18, 1.4, 0, 0.09, 0, 0xb8b8b0, { rough: 0.85 });
    plinth.material = plinthMat;
    const boilerGaugeObj = instrument(boiler, 0.65, 1.5, 0, { idle: "-- psi", color: BR_ACCENT, w: 0.12, d: 0.16, ry: 0 });
    holoTag(boilerGaugeObj, "boiler gauge", 0, 0.16, 0, { css: BR_CSS, w: 0.3 });
    reg(hits, boilerGaugeObj, "boiler-gauge");
    const reliefValve = group(boiler, -0.6, 1.7, 0.2);
    cyl(reliefValve, 0.04, 0.045, 0.14, 0, 0, 0, 0x8a929a, { rough: 0.4, metal: 0.7, seg: 12 });
    const leak = particles(reliefValve, 18, 0xbfe0f2, { size: 0.008, life: 0.4, additive: false, opacity: 0.4 });
    void leak;
    holoTag(reliefValve, "relief valve weeping", 0, 0.2, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, reliefValve, "leaking-relief-valve");
    const ignoreValveSpot = ball(boiler, 0.03, -0.6, 1.85, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(boiler, "tighten it by hand and move on?", -0.6, 2.0, 0.2, { css: "#f0645b", w: 0.58 });
    reg(hits, ignoreValveSpot, "ignore-relief-valve-leak");
    const flue = cyl(boiler, 0.16, 0.16, 1.4, 0.5, 2.2, -0.3, 0x6b7278, { rough: 0.55, metal: 0.4, seg: 14 });
    const flueCorrosion = box(boiler, 0.1, 0.08, 0.1, 0.5, 1.9, -0.3, 0xb87a3a, { rough: 0.85 });
    void flue;
    holoTag(boiler, "corroded flue wall", 0.5, 2.05, -0.3, { css: "#f0645b", w: 0.4 });
    reg(hits, flueCorrosion, "corroded-flue");

    // Combustion-air louver, blocked with stacked supplies.
    const louver = group(g, -3.6, 0, -0.5);
    box(louver, 0.5, 0.5, 0.05, 0, 0.8, 0, 0x6b7278, { rough: 0.6, metal: 0.4 });
    const blockingBoxes = group(louver, 0.1, 0.3, 0.2);
    for (let i = 0; i < 3; i++) box(blockingBoxes, 0.3, 0.2, 0.3, 0, i * 0.21, 0, 0xc9a86a, { rough: 0.7 });
    holoTag(louver, "supplies blocking the louver", 0, 1.1, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, blockingBoxes, "blocked-louver");
    const stackMoreSpot = box(louver, 0.3, 0.2, 0.3, 0.1, 0.75, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(louver, "stack more here?", 0.1, 1.0, 0.35, { css: "#f0645b", w: 0.36 });
    reg(hits, stackMoreSpot, "block-combustion-air");

    // ------------------------------------------------------------- air handler and lockout
    const handler = group(g, 0.8, 0, -1.6);
    box(handler, 1.2, 1.4, 0.9, 0, 0.7, 0, 0xd8dde2, { rough: 0.4, metal: 0.4 });
    const panel = group(handler, -0.6, 0.7, 0, 0);
    box(panel, 0.03, 1.2, 0.8, 0, 0, 0, 0xc4cbd1, { rough: 0.4, metal: 0.5 });
    holoTag(panel, "filter access panel", 0, 0.7, 0, { css: BR_CSS, w: 0.4 });
    const latchHandle = box(panel, 0.02, 0.1, 0.02, 0.015, 0, 0.3, 0xc0c6cc, { rough: 0.4, metal: 0.6 });
    reg(hits, latchHandle, "panel-latch");
    const disconnect = group(handler, 0.5, 1.0, 0.46);
    box(disconnect, 0.14, 0.2, 0.06, 0, 0, 0, 0xe8b02e, { rough: 0.5 });
    const disconnectLever = box(disconnect, 0.03, 0.08, 0.03, 0, -0.02, 0.04, 0x1a1d20, { rough: 0.5 });
    holoTag(disconnect, "disconnect switch", 0, 0.24, 0, { css: BR_CSS, w: 0.32 });
    reg(hits, disconnectLever, "disconnect-off");
    const lockSpot = group(disconnect, 0, -0.14, 0.05);
    lockSpot.visible = false;
    const lockTagObj = lockTag(disconnect, 0, -0.16, 0.06, { color: 0xd8232a });
    lockTagObj.visible = false;
    reg(hits, lockSpot, "lock-and-tag");
    const tryOperate = cyl(handler, 0.05, 0.05, 0.03, 0.5, 0.6, 0.46, 0x59c97b, { rough: 0.4, seg: 14 });
    holoTag(handler, "try-operate button — hold", 0.5, 0.8, 0.46, { css: BR_CSS, w: 0.5 });
    reg(hits, tryOperate, "try-operate-button");
    const skipLockoutSpot = box(g, 0.2, 0.3, 0.2, 0.2, 0.7, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "open the panel now?", 0.2, 1.0, -1.2, { css: "#f0645b", w: 0.4 });
    reg(hits, skipLockoutSpot, "skip-lockout-quick-fix");

    // Filters: old one in the unit, disposal spot, shelf with correct/wrong ratings.
    const oldFilter = box(handler, 0.5, 0.02, 0.5, -0.3, 0.7, 0, 0x5b5346, { rough: 0.75 });
    holoTag(handler, "old filter", -0.3, 0.9, 0, { css: BR_CSS, w: 0.26 });
    reg(hits, oldFilter, "old-filter");
    const disposalSpot = torus(g, 0.2, 0.012, 1.8, 0.03, -1.9, BR_ACCENT, { emissive: BR_ACCENT, ei: 1.3, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    disposalSpot.rotation.x = Math.PI / 2;
    reg(hits, disposalSpot, "disposal-spot");
    const filterShelf = group(g, 2.4, 0, -0.8);
    box(filterShelf, 0.8, 0.03, 0.3, 0, 1.0, 0, 0xb8bcc0, { rough: 0.4, metal: 0.6 });
    const correctFilter = box(filterShelf, 0.4, 0.03, 0.4, -0.2, 1.05, 0, 0xe4ece8, { rough: 0.6 });
    holoTag(filterShelf, "matching filter", -0.2, 1.2, 0, { css: BR_CSS, w: 0.3 });
    reg(hits, correctFilter, "correct-filter");
    const wrongFilter = box(filterShelf, 0.44, 0.03, 0.44, 0.25, 1.05, 0, 0xc9cfd0, { rough: 0.6 });
    holoTag(filterShelf, "wrong rating for this unit", 0.25, 1.2, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, wrongFilter, "wrong-filter-rating");
    const newFilterSlot = box(handler, 0.5, 0.02, 0.5, -0.3, 0.7, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, newFilterSlot, "new-filter-slot");

    // Radio and e-stop for the interrupts.
    const radioObj = instrument(g, 2.7, 0.9, 1.4, { idle: "CH 1 · PLANT", color: BR_ACCENT, w: 0.11, d: 0.15 });
    holoTag(radioObj, "office radio", 0, 0.16, 0, { css: BR_CSS, w: 0.3 });
    reg(hits, radioObj, "radio");
    const estop = cyl(boiler, 0.06, 0.06, 0.03, 0.6, 0.5, 0.5, 0xd2312b, { rough: 0.4, seg: 14 });
    holoTag(boiler, "emergency shutoff", 0.6, 0.7, 0.5, { css: BR_CSS, w: 0.4 });
    reg(hits, estop, "emergency-shutoff");
    const flameLamp = ball(boiler, 0.05, 0.4, 1.1, 0.5, 0xff8a3a, { emissive: 0xff8a00, ei: 1.4, rough: 0.4 });
    reg(hits, flameLamp, "burner-flame");
    const breakerWarnLamp = ball(disconnect, 0.03, 0, 0.16, 0.05, 0x2a2a2a, { rough: 0.5 });
    breakerWarnLamp.visible = false;
    const rolloutFlare = ball(boiler, 0.09, 0.4, 0.9, 0.62, 0xff5a2a, { emissive: 0xff3a00, ei: 2.0, rough: 0.4 });
    rolloutFlare.visible = false;

    // Maintenance log board.
    const maintLog = holoPanel(g, 0.46, 0.3, -2.9, 1.3, 1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = BR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f5e8da"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("MAINTENANCE LOG", w / 2, h * 0.4);
    }, { ry: 0.6, accent: BR_ACCENT });
    reg(hits, maintLog, "maintenance-log");
    const ticketBoard = holoPanel(g, 0.6, 0.4, -2.9, 1.4, -0.6, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = BR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f5e8da"; cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("TICKET #4471", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#e0c8b0";
      cx.fillText("AHU-2 filter change", w / 2, h * 0.6);
    }, { ry: 0.5, accent: BR_ACCENT });
    reg(hits, ticketBoard, "ticket-board");

    // Sequence markers for lockout / occupant notice / area clear / power restore.
    const notifyMarker = box(g, 0.1, 0.1, 0.1, 1.0, 1.3, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, notifyMarker, "notify-occupants");
    const areaClearMarker = box(g, 1.4, 0.05, 1.4, 0.8, 0.03, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, areaClearMarker, "area-clear-check");
    const lockRemovedMarker = box(disconnect, 0.1, 0.1, 0.1, 0, -0.14, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, lockRemovedMarker, "lock-removed");
    const powerRestoredMarker = box(disconnect, 0.1, 0.1, 0.1, 0, 0.14, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, powerRestoredMarker, "power-restored");

    // A flashlight on the tech's cart, for scene texture.
    const cartLight = flashlight(g, 2.2, 0.4, 1.9, { ry: 0.3 });
    void cartLight;

    // Crew: a building engineer checking in, clear of every control.
    const engineer = standingFigure(g, 2.9, 2.3, { ry: -2.3, cloth: 0x2b3138, vest: 0xd8f23a });
    holoTag(engineer, "building engineer", 0, 1.95, 0, { css: BR_CSS, w: 0.34 });

    let locked = false;

    return {
      hits,
      footprint: 2.8,

      onStepComplete(step) {
        if (step.id === "boiler-gauge-check") repaint(boilerGaugeObj.userData.screen, signFace("NORMAL", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.5 }));
        if (step.id === "boiler-room-walk") { flueCorrosion.material = mat(0x8a6a3c, { rough: 0.8 }); blockingBoxes.visible = false; }
        if (step.id === "lockout-sequence") { locked = true; disconnectLever.rotation.x = -0.7; lockTagObj.visible = true; }
        if (step.id === "open-access-panel") panel.rotation.y = -1.2;
        if (step.id === "remove-old-filter") oldFilter.visible = false;
        if (step.id === "seat-new-filter") { const nf = box(handler, 0.5, 0.02, 0.5, -0.3, 0.7, -0.08, 0xe4ece8, { rough: 0.6 }); void nf; }
        if (step.id === "close-access-panel") panel.rotation.y = 0;
        if (step.id === "remove-lockout") { locked = false; disconnectLever.rotation.x = 0; lockTagObj.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "office-flips-breaker") { breakerWarnLamp.visible = true; breakerWarnLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.8 }); }
        if (it.id === "flame-rollout") rolloutFlare.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "office-flips-breaker") breakerWarnLamp.visible = false;
        if (it.id === "flame-rollout") rolloutFlare.visible = false;
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "boiler-gauge-check") {
          repaint(boilerGaugeObj.userData.screen, signFace(gg.t > 0.38 && gg.t < 0.62 ? "NORMAL" : "CHECK", {
            bg: "#0d1c24", accent: gg.t > 0.38 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#f5e8da", scale: 0.5,
          }));
        }
        if (session?.step?.id === "open-access-panel" && session.turn) panel.rotation.y = -1.2 * session.turn.amount;
        if (session?.step?.id === "close-access-panel" && session.turn) panel.rotation.y = -1.2 * (1 - session.turn.amount);
        const tr = session?.track;
        flameLamp.visible = session?.step?.id === "observed-restart";
        if (tr && session.step?.id === "observed-restart") flameLamp.scale.setScalar(0.8 + tr.v * 0.6);
        engineer.userData.head.rotation.y = Math.sin(t * 0.35) * 0.3;
        void dt; void CITY; void locked;
      },
    };
  },
};
