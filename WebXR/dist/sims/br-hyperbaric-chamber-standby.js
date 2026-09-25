import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, instrument, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { workboat } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hyperbaric Chamber Standby VR — SF Bay Restoration & Cleanup,
// maritime and underwater, pack A (underwater work and dive safety).
//
// The deck of a dive support workboat on the Bay during a decompression dive:
// a double-lock deck decompression chamber on its skid, with its inner and
// outer doors, viewports, medical lock, built-in breathing masks and their
// overboard dump, and beside it the chamber console with its depth gauge,
// air supply, blow-down, exhaust and ventilation valves, oxygen analyser,
// stopwatches and the phone to the diving physician. The crew boat (the
// fleet kit's workboat) lies alongside. The learner is the chamber operator,
// a Pile Drivers Local 34 commercial diver, standing by the chamber while the
// diver works below, with the supervisor at the dive panel, the tender at the
// ladder and the standby diver dressed on the bench. Every figure on deck
// wears a PFD. Pressures, depths, times and treatment schedules are never
// written as numbers: they are per the tables the supervisor holds, the
// chamber's operating manual and the diving physician.

const BRHC_ACCENT = 0x9d8cf0;
const BRHC_CSS = "#9d8cf0";

function brhcSheet(title, rows, band = "#6a5ac8", bg = "#f1eff8") {
  return paperFace(title, rows, { bg, band });
}

export const SIM_BR_HYPERBARIC_CHAMBER_STANDBY = {
  id: "br-hyperbaric-chamber-standby",
  index: "323",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver as chamber operator standing by a deck decompression chamber during a Bay restoration dive, with the dive supervisor, the tender and the standby diver",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.430 diving equipment (decompression chambers), 29 CFR 1910.423 post-dive procedures (the recompression chamber and the diver's condition) and 29 CFR 1910.440 the dive record; ASME PVHO-1 pressure vessels for human occupancy; ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; pressures, times and treatment per the tables the supervisor holds, the chamber manual and the diving physician",
  name: "Hyperbaric Chamber Standby",
  title: simTitle("Hyperbaric Chamber Standby"),
  tagline: "The chamber ready before the diver needs it: the standby brief taken, the door seal and the lighter found, the air lined up, the chamber taken to test pressure and held for leaks while the oxygen climbs, the breathing masks checked, vented to surface before the door opens, the medical kit locked in, the stopwatches set, the diver blown down at the tables' rate while they report a painful shoulder, the viewport watched, and the chamber log written — every step in a PFD",
  accent: BRHC_ACCENT,
  accentCss: BRHC_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "chamber-ready", name: "Chamber Ready", note: "The chamber tested, clean of fire load and manned at the console for every minute the diver was in it, and never a door opened under pressure" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Chamber Standby",
    currency: "LOCK",
    ranks: ["Outside Tender", "Inside Tender", "Chamber Operator", "Lead Chamber Operator", "Chamber Standby Certified"],
    badges: [
      { id: "brief-first", name: "Brief First", note: "The standby brief taken before the chamber was touched", test: AWARD.stepClean("standby-brief") },
      { id: "test-true", name: "Test True", note: "The test pressure committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "no-fire-load", name: "No Fire Load", note: "No hydrocarbon on the door, no phone into the chamber, never off the console, never a door under pressure", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-standby", name: "Clean Standby", note: "No corrections from the brief to the chamber log", test: AWARD.clean },
      { id: "steady-blowdown", name: "Steady Blow-down", note: "The chamber pressed down in band the whole way", test: AWARD.unbroken },
      { id: "logged-in-time", name: "Logged In Time", note: "Chamber log written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "spray-door-hinge": "You reached for the aerosol lubricant to free the chamber door's hinge. A petroleum lubricant inside a chamber that will be breathing oxygen is fuel in an atmosphere that makes everything burn faster and hotter, and chamber fires have killed everyone inside them in seconds. Only the lubricants the chamber's manual approves for oxygen service go anywhere near it.",
    "leave-console": "You started to leave the chamber console to help the tender at the ladder. The console is the chamber's pressure, its gas and its occupants' voice all at once, and a chamber with someone in it and nobody at the console is a pressure vessel nobody is watching. The operator stays at the console for every minute the chamber is occupied or pressurised.",
    "undog-door": "You went to undog the inner door to pass something in while the chamber was under pressure. A door opened under pressure blows out with the full force of the chamber behind it, and the occupants are decompressed in an instant — a catastrophic injury for them and for you. Anything that has to go in while the chamber is pressed goes through the medical lock.",
    "phone-into-chamber": "You were about to pass your phone in through the medical lock so the diver could call home. A phone's battery and circuits are an ignition source in an atmosphere that may be oxygen-enriched, and a battery can fail under pressure. Nothing electrical goes into the chamber that the chamber's manual has not approved for it.",
  },

  lateNotes: {
    "leak-check": "The chamber is held for leaks once it is at test pressure — read the gauge first.",
    "blowdown-valve": "The diver is blown down once the stopwatches are set and the medical kit is inside.",
    "chamber-log": "The chamber log is written once the viewport check is done.",
  },

  steps: [
    {
      id: "standby-brief", kind: "select", target: "standby-brief",
      title: "Take the chamber standby brief from the supervisor",
      cue: "At the chamber, in your PFD: the dive's decompression plan, whether it includes surface decompression, the treatment tables the supervisor holds, the diving physician's number and the chamber's operating manual.",
      why: "A chamber standing by a decompression dive is part of the dive plan, not an afterthought on the deck. 29 CFR 1910.423 has a chamber ready for the dives that need one, and the operator has to know before the diver leaves the surface whether the plan uses it for surface decompression, which treatment tables the supervisor would call if the diver surfaced with symptoms, and who the diving physician is — because none of that can be looked up calmly once the diver is on the ladder.",
    },
    {
      id: "chamber-check", kind: "find", noHint: true,
      targets: ["door-seal", "lighter-inside"],
      itemNames: { "door-seal": "grit and a nick on the inner door's seal", "lighter-inside": "a lighter left on the bench inside the main lock" },
      itemNotes: {
        "door-seal": "The inner door's seal has grit on it and a small nick at the bottom; under pressure a seal like that leaks, and a leaking door is a chamber that cannot hold the depth a treatment needs.",
        "lighter-inside": "Someone's lighter is lying on the bench inside the main lock. A lighter is an ignition source and its fuel is a fire load — in a chamber that may breathe oxygen, it is the most dangerous thing on the deck.",
      },
      title: "Check the chamber for leaks and fire load before it is needed",
      cue: "Walk the chamber inside and out: the door seals and dogs, the viewports, the penetrators, and anything inside that could burn or ignite.",
      why: "A chamber has two ways to fail the diver who needs it: it cannot hold pressure, or it catches fire. The seals, viewports and penetrators are what hold the pressure, and 29 CFR 1910.430 and ASME PVHO-1 hold the chamber to being inspected and maintained for that; the fire load is everything that was carried in and forgotten, found and taken out now, because once the door is shut on a diver breathing oxygen nothing inside can be removed.",
    },
    {
      id: "line-up-air", kind: "turn", target: "air-supply",
      title: "Line up the chamber's air supply",
      cue: "Open the chamber's primary air supply valve at the console steadily, with the secondary supply lined up on its own valve.",
      why: "A chamber is pressed with air from its own supply, and that supply is lined up by hand before it is needed so the operator knows it is open and flowing. The secondary is ready on its own valve because a chamber that loses its only supply in the middle of a treatment cannot hold its occupants at the depth the tables call for, and the switch has to take seconds, not a search.",
      turn: { turns: 1.0, label: "CHAMBER AIR SUPPLY", readout: (t) => (t < 0.3 ? "closed" : t < 0.9 ? "opening" : "primary open · secondary ready") },
    },
    {
      id: "test-pressure", kind: "gauge", target: "chamber-gauge",
      title: "Take the chamber to its test pressure",
      cue: "Press the empty chamber and commit the depth gauge at the test pressure the chamber's manual gives for the pre-dive check.",
      why: "The pre-dive test proves the chamber holds pressure before a diver's life depends on it holding pressure. It is pressed empty, to the test pressure its own operating manual sets, and the gauge is read as it settles, because a chamber that will not come up to its test, or creeps past it while the supply is shut, has a fault that must be found now rather than with a diver inside.",
      gauge: { label: "CHAMBER DEPTH", speed: 0.66, green: [0.44, 0.6], readout: (t) => (t < 0.44 ? "short of the test pressure" : t <= 0.6 ? "at test pressure per the manual" : "past the test pressure — ease off"), missNote: "Outside the band — let the gauge settle and commit it at the test pressure the chamber's manual gives." },
    },
    {
      id: "leak-check", kind: "hold", target: "leak-check", seconds: 5,
      title: "Hold the test and watch for leaks",
      cue: "With the supply shut, hold the chamber at test pressure and watch the gauge, listening at the door and the penetrators, until the manual's hold time has passed without a drop.",
      why: "A small leak shows as a gauge that creeps down while nobody is adding gas, and as a hiss at a seal or a penetrator. Holding the test long enough to see it is what separates a chamber that holds from one that only seemed to on the way up. A leak found now is a seal cleaned or changed; a leak found in a treatment is a diver who cannot be held at the depth their symptoms need.",
      holdBreakNote: "You let the test go before the hold time had passed — a slow leak would not have shown yet. Take the chamber back to test pressure and hold it.",
    },
    {
      id: "bibs-check", kind: "select", target: "bibs-masks",
      title: "Check the built-in breathing masks and their dump",
      cue: "Check each built-in breathing mask inside the chamber: its seal and strap, oxygen flowing on demand, and the exhaled gas going out through the overboard dump rather than into the chamber.",
      why: "Divers in the chamber breathe oxygen through the built-in masks, and the overboard dump carries what they exhale out of the chamber instead of letting it build up inside. A mask that leaks, or a dump that does not flow, raises the oxygen in the chamber's own air, and every step up in oxygen makes a fire more likely and more violent. The masks and the dump are checked before anyone breathes from them.",
    },
    {
      id: "vent-and-open", kind: "sequence",
      targets: ["exhaust-valve", "chamber-door"],
      itemNames: { "exhaust-valve": "chamber vented to surface on the exhaust valve", "chamber-door": "inner door opened once the gauge reads surface" },
      title: "Vent the chamber to surface, then open the door",
      cue: "Open the exhaust valve and bring the chamber back to surface, watch the gauge reach zero, and only then undog and open the inner door.",
      why: "A door opens only when the chamber on both sides of it is at the same pressure: at surface, the door swings free; under pressure, it is held shut by a force no one can overcome by hand — or, if the dogs are forced, blown open with a violence that kills. The chamber is vented and the gauge seen at surface before a hand goes to the dogs, every time, including after a test.",
      outOfOrderNote: "Out of order — vent the chamber to surface and see the gauge at zero before you touch the door.",
    },
    {
      id: "kit-inside", kind: "drag", target: "medical-kit",
      title: "Put the medical kit into the main lock",
      cue: "Carry the chamber's medical kit — first aid, the diagnostic kit, water and the diver's warm clothes — inside the main lock, on the bench where the inside tender will find it.",
      why: "Once a diver is being treated, anything the inside tender needs must be in the chamber or come through the medical lock, and the kit that will be needed is known before the dive: first aid, the diagnostic kit, water and dry clothes. Putting it inside now, while the door is open, means the inside tender is not waiting on the lock during the minutes that matter.",
      drag: { to: "main-lock-bench", radius: 0.5, missNote: "Not on the bench inside the main lock — the kit goes where the inside tender will reach it." },
    },
    {
      id: "set-timers", kind: "select", target: "stopwatches",
      title: "Set the stopwatches for the surface interval",
      cue: "Set the two stopwatches at the console and agree with the supervisor who starts them when the diver leaves the last water stop.",
      why: "In surface decompression the time between the diver leaving the last water stop and reaching depth in the chamber is limited by the tables the supervisor holds, and it is the operator's job to know that time as it runs. Two stopwatches mean one failure does not lose the interval, and agreeing who starts them means nobody assumes the other did — the diver undressing on deck is working against that clock.",
    },
    {
      id: "press-down", kind: "track", target: "blowdown-valve", seconds: 6,
      title: "Blow the diver down at the rate the tables allow",
      cue: "With the diver and the inside tender in and the door dogged, work the blow-down valve to press the chamber at the rate the tables allow, watching the diver clear their ears through the viewport.",
      why: "The chamber is pressed down fast enough to meet the tables' surface interval and slowly enough that the diver and the inside tender can clear their ears; a rate that is too slow eats the interval, and a rate that is too fast ruptures an eardrum. The operator watches the occupants through the viewport while holding the rate, because a diver who cannot clear signals it with their hands, not the gauge.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "BLOW-DOWN RATE", readout: (v) => (v < 0.42 ? "too slow — interval running" : v > 0.6 ? "too fast — ears" : "at the tables' rate") },
      holdBreakNote: "The rate went out of band — too slow for the interval or too fast for the ears. Bring the valve back to the tables' rate and hold it.",
    },
    {
      id: "viewport-watch", kind: "find", noHint: true,
      targets: ["diver-shoulder", "dump-kink"],
      itemNames: { "diver-shoulder": "the diver rubbing their right shoulder", "dump-kink": "a kink in the overboard dump line outside the chamber" },
      itemNotes: {
        "diver-shoulder": "Through the viewport the diver keeps rubbing and flexing their right shoulder — a joint ache after a decompression dive is a symptom until the physician says otherwise.",
        "dump-kink": "The overboard dump line has been stepped on and kinked where it runs across the deck; with the dump restricted, exhaled oxygen spills into the chamber instead of going overboard.",
      },
      title: "Watch the occupants and the chamber's lines",
      cue: "Through the viewport, watch the diver and the inside tender for anything they are not saying, and look along the chamber's lines on deck.",
      why: "Decompression sickness often starts quietly: a diver rubbing a shoulder, going quiet, or getting clumsy with a mask, and the operator watching through the viewport sees it before the diver admits it. The lines outside the chamber matter as much: an overboard dump kinked on deck turns every exhaled breath of oxygen into oxygen in the chamber's air, and the operator is the one person positioned to see both.",
    },
    {
      id: "chamber-log", kind: "select", target: "chamber-log",
      title: "Write the chamber log",
      cue: "Record the pre-dive test, the time the diver left the last water stop and reached depth, the blow-down, the oxygen periods, the shoulder, the physician's advice and the kinked dump line.",
      why: "The chamber log is part of the dive record 29 CFR 1910.440 has the employer keep, and for a diver with symptoms it is also the medical record the physician will treat from: exact times, depths from the gauge, what the diver said and when. It is written as the treatment goes, because a log reconstructed afterwards from memory is the one the physician cannot trust.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Debrief and check in with the team",
      cue: "At the team board once the diver is settled: what happened and when, who watches the diver afterwards and for how long the physician advised, the dump line, and how everyone is.",
      why: "A diver who has been treated is watched afterwards, and the team is told who is watching, what to look for and who to call. A diver in the chamber with symptoms is a hard hour for everyone on the deck — the diver most of all — and the debrief is where it is said out loud; the Pile Drivers Local 34 member assistance line is there for what a deck conversation does not settle.",
    },
  ],

  interrupts: [
    {
      id: "oxygen-rising",
      kind: "Oxygen rising in the chamber",
      after: "leak-check", delay: 2, seconds: 14,
      alert: "The chamber's oxygen analyser has alarmed — the oxygen in the chamber's air is climbing, and the built-in masks are still connected from the last check.",
      cue: "Open the ventilation valve to flush the chamber with air, then find the source.",
      target: "ventilation-valve",
      why: "Oxygen above the chamber's limit makes a fire far more likely and far more violent, and the first answer is always to ventilate: flush the chamber through with air so the oxygen comes back down, then find where it came from — a leaking mask, a dump not flowing, a valve left cracked. Ventilation is quick and it is the operator's to do, while the search can wait until the atmosphere is safe.",
      missNote: "The analyser kept climbing while the leak check carried on; by the time anyone ventilated, the chamber's air was well past the limit the manual sets for a chamber anyone should be inside.",
      wrongNote: "The ventilation valve — flush the chamber with air first, then look for the source.",
    },
    {
      id: "diver-symptoms",
      kind: "Diver reports symptoms in the chamber",
      after: "press-down", delay: 2, seconds: 14,
      alert: "The inside tender calls over the intercom: the diver has a deep ache in the right shoulder that started on the ladder and is getting worse.",
      cue: "Call the diving physician on the console phone while the supervisor decides the treatment from the tables they hold.",
      target: "physician-phone",
      why: "Pain after a decompression dive is treated as decompression sickness until a physician says otherwise, and the diving physician on the emergency list is called at once — they advise the supervisor, who chooses the treatment from the tables they hold. The operator makes the call because the supervisor is working the tables and the inside tender is with the diver; every minute of delay is a minute of the bubble doing its damage.",
      missNote: "The blow-down carried on with nobody calling the physician; the supervisor had to leave the tables to make the call, and the treatment started late.",
      wrongNote: "The physician's phone on the console — the diving physician needs to hear about the shoulder now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BRHC_ACCENT);

    // ------------------------------------------------------- water and deck
    const water = box(g, 8.4, 0.02, 8.0, 0, 0.012, -1.0, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0d2830", mid: "#12323a" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x86aab4 });
    const deck = box(g, 6.2, 0.14, 3.8, 0, 0.4, 0.2, 0xffffff, { rough: 0.8 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3f464c", base2: "#353b41", step: 21 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc4cad0 });
    box(g, 6.2, 0.4, 3.8, 0, 0.16, 0.2, 0xe4e7ea, { rough: 0.5, metal: 0.3, cast: false });
    box(g, 6.2, 0.1, 0.08, 0, 0.52, -1.66, CITY.hiVis, { rough: 0.6 });
    box(g, 6.0, 0.04, 0.04, 0, 1.45, -1.62, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    for (const x of [-2.9, -0.9, 0.9, 2.9]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, -1.62, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });

    // ------------------------------------------------------- the chamber
    const ch = group(g, -1.3, 0.47, -0.75);
    for (const x of [-1.1, 1.1]) box(ch, 0.2, 0.5, 1.2, x, 0.25, 0, 0x3a4148, { rough: 0.6, metal: 0.4 });
    const shell = cyl(ch, 0.62, 0.62, 2.8, 0, 1.1, 0, 0xe8e6de, { rough: 0.45, metal: 0.35, seg: 24 });
    shell.rotation.z = Math.PI / 2;
    for (const x of [-1.4, 1.4]) { const end = ball(ch, 0.62, x, 1.1, 0, 0xe8e6de, { rough: 0.45, metal: 0.35, seg: 20, seg2: 10 }); end.scale.set(0.35, 1, 1); }
    const bulk = cyl(ch, 0.64, 0.64, 0.08, -0.55, 1.1, 0, 0xc9c6bc, { rough: 0.5, metal: 0.4, seg: 24 });
    bulk.rotation.z = Math.PI / 2;
    // Inner door (between the locks' seen end) and its dogs, on the +x end.
    const door = group(ch, 1.62, 1.1, 0);
    const doorPlate = cyl(door, 0.42, 0.42, 0.06, 0, 0, 0, 0xd8d4c8, { rough: 0.45, metal: 0.4, seg: 20 });
    doorPlate.rotation.z = Math.PI / 2;
    const seal = torus(door, 0.4, 0.02, -0.04, 0, 0, 0x2b2b2b, { rough: 0.8, seg: 6, seg2: 24 });
    seal.rotation.y = Math.PI / 2;
    const grit = box(door, 0.02, 0.05, 0.08, -0.05, -0.38, 0, 0x8a6a3a, { rough: 1, emissive: 0x3a2a0a, ei: 0.4 });
    reg(hits, grit, "door-seal");
    holoTag(door, "inner door", 0.05, 0.55, 0, { css: BRHC_CSS, w: 0.2 });
    reg(hits, doorPlate, "chamber-door");
    const dogs = group(door, 0.05, 0, 0);
    for (let i = 0; i < 4; i++) { const d = box(dogs, 0.04, 0.12, 0.04, 0, Math.cos(i * 1.57) * 0.36, Math.sin(i * 1.57) * 0.36, 0x5b6771, { rough: 0.4, metal: 0.7 }); d.rotation.x = i * 1.57; }
    const dogHit = box(door, 0.2, 0.3, 0.3, 0.12, 0.2, 0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(door, "undog it to pass this in?", 0.14, -0.55, 0.2, { css: "#d2312b", w: 0.46 });
    reg(hits, dogHit, "undog-door");
    // Viewports, medical lock, penetrator plate, BIBS and dump.
    for (const x of [-1.0, 0.2, 0.9]) { const vp = cyl(ch, 0.09, 0.09, 0.06, x, 1.2, 0.6, 0x274a5f, { rough: 0.1, metal: 0.5, seg: 16 }); vp.rotation.x = Math.PI / 2; }
    const medLock = group(ch, 0.4, 1.72, 0.1);
    cyl(medLock, 0.14, 0.14, 0.35, 0, 0, 0, 0xd8d4c8, { rough: 0.45, metal: 0.4, seg: 16 });
    holoTag(medLock, "medical lock", 0, 0.3, 0, { css: BRHC_CSS, w: 0.24 });
    const lighter = group(ch, 0.7, 0.72, 0.2);
    box(lighter, 0.03, 0.07, 0.015, 0, 0, 0, 0xd2312b, { rough: 0.4 });
    holoTag(lighter, "on the bench inside", 0, 0.12, 0.05, { css: BRHC_CSS, w: 0.34 });
    reg(hits, lighter, "lighter-inside");
    const bench = group(ch, 0.6, 0.62, -0.1);
    box(bench, 1.2, 0.05, 0.4, 0, 0, 0, 0x5b4a3a, { rough: 0.8 });
    const benchRing = torus(bench, 0.16, 0.008, -0.3, 0.05, 0, BRHC_ACCENT, { emissive: BRHC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    benchRing.rotation.x = Math.PI / 2;
    holoTag(bench, "main lock bench", -0.3, 0.2, 0.25, { css: BRHC_CSS, w: 0.3 });
    reg(hits, bench, "main-lock-bench");
    const bibs = group(ch, -0.2, 1.3, 0.66);
    for (const x of [-0.12, 0.12]) { ball(bibs, 0.05, x, 0, 0.02, 0x2f8f5a, { rough: 0.5, seg: 10, seg2: 8 }).scale.set(1, 1.2, 0.6); }
    holoTag(bibs, "built-in breathing masks", 0, 0.14, 0.04, { css: BRHC_CSS, w: 0.44 });
    reg(hits, bibs, "bibs-masks");
    const dumpLine = hose(g, [[-1.5, 1.2, -0.1], [-1.7, 0.6, 0.3], [-1.5, 0.5, 0.9], [-0.8, 0.5, 1.2], [-0.2, 0.9, -1.55]], 0.02, 0x2b5aa8, { steps: 16, rough: 0.6 });
    void dumpLine;
    const kink = box(g, 0.1, 0.05, 0.08, -1.1, 0.5, 1.15, 0x2b5aa8, { rough: 0.6, emissive: 0x0a1a3a, ei: 0.4 });
    holoTag(g, "overboard dump line", -1.1, 0.7, 1.15, { css: BRHC_CSS, w: 0.36 });
    reg(hits, kink, "dump-kink");
    // The diver inside, seen through the viewport once they are in.
    const inside = group(ch, -0.2, 0.64, 0.0);
    const diverFig = standingFigure(inside, 0, 0, { atStation: true, ry: Math.PI / 2, cloth: 0x2b5aa8, trousers: 0x1b1e22 });
    diverFig.scale.set(0.75, 0.75, 0.75);
    const shoulder = ball(inside, 0.07, 0.05, 0.95, 0.12, 0xf0645b, { rough: 0.6, emissive: 0x5a1a1a, ei: 0.5, opacity: 0.6, transparent: true, seg: 8, seg2: 6 });
    reg(hits, shoulder, "diver-shoulder");
    inside.visible = false;
    const callLamp = ball(ch, 0.04, 1.2, 1.78, 0.2, 0x3a4148, { rough: 0.5, seg: 10, seg2: 8 });
    const sprayCan = group(g, -2.6, 0.47, 0.35);
    cyl(sprayCan, 0.04, 0.04, 0.2, 0, 0.1, 0, 0xe8b02e, { rough: 0.4, metal: 0.4, seg: 10 });
    holoTag(sprayCan, "spray the door hinge?", 0, 0.34, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, sprayCan, "spray-door-hinge");
    const phoneG = group(g, -0.5, 1.2, 0.15);
    box(phoneG, 0.07, 0.14, 0.01, 0, 0, 0, 0x15181c, { rough: 0.3 });
    box(phoneG, 0.06, 0.12, 0.005, 0, 0, 0.007, 0x4fb3e8, { rough: 0.2, emissive: 0x2a6a8a, ei: 0.6 });
    holoTag(phoneG, "pass your phone in?", 0, 0.14, 0, { css: "#d2312b", w: 0.38 });
    reg(hits, phoneG, "phone-into-chamber");

    // ------------------------------------------------------- the console
    const con = group(g, 1.05, 0.47, -0.95);
    box(con, 1.2, 0.85, 0.45, 0, 0.42, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const cFace = box(con, 1.1, 0.6, 0.05, 0, 1.12, -0.1, 0x3a4148, { rough: 0.5, metal: 0.5 });
    cFace.rotation.x = -0.3;
    const gaugeG = group(con, -0.35, 1.18, -0.02);
    const gFace = cyl(gaugeG, 0.1, 0.1, 0.03, 0, 0, 0, 0xf1f3f4, { rough: 0.4, seg: 20 });
    gFace.rotation.x = Math.PI / 2;
    const gNeedle = box(gaugeG, 0.008, 0.08, 0.006, 0, 0.03, 0.02, 0xd2312b, { rough: 0.4 });
    holoTag(gaugeG, "chamber depth gauge", 0, 0.16, 0, { css: BRHC_CSS, w: 0.38 });
    reg(hits, gaugeG, "chamber-gauge");
    const leakG = group(con, 0.0, 1.35, -0.1);
    const leakRing = torus(leakG, 0.08, 0.008, 0, 0, 0, BRHC_ACCENT, { emissive: BRHC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    void leakRing;
    holoTag(leakG, "hold the test — watch", 0, 0.14, 0, { css: BRHC_CSS, w: 0.4 });
    reg(hits, leakG, "leak-check");
    const analyser = instrument(con, 0.35, 1.2, -0.02, { ry: 0, idle: "O2 · NORMAL", color: 0x9d8cf0, w: 0.12, d: 0.16 });
    analyser.rotation.x = Math.PI / 2 - 0.3;
    const alarmLamp = ball(con, 0.03, 0.52, 1.36, -0.05, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 10, seg2: 8 });
    const airV = valveWheel(con, -0.4, 0.86, -0.28, { r: 0.07, color: 0x2f8f5a, body: 0x2f4f6f });
    airV.scale.set(0.6, 0.6, 0.6);
    holoTag(airV, "air supply", 0, 0.62, 0, { css: BRHC_CSS, w: 0.22 });
    reg(hits, airV, "air-supply");
    const blowV = valveWheel(con, -0.13, 0.86, -0.28, { r: 0.07, color: 0xf2b33d, body: 0x2f4f6f });
    blowV.scale.set(0.6, 0.6, 0.6);
    holoTag(blowV, "blow-down", 0, 0.62, 0, { css: BRHC_CSS, w: 0.22 });
    reg(hits, blowV, "blowdown-valve");
    const exhV = valveWheel(con, 0.14, 0.86, -0.28, { r: 0.07, color: 0xd2312b, body: 0x2f4f6f });
    exhV.scale.set(0.6, 0.6, 0.6);
    holoTag(exhV, "exhaust", 0, 0.62, 0, { css: BRHC_CSS, w: 0.18 });
    reg(hits, exhV, "exhaust-valve");
    const ventV = valveWheel(con, 0.41, 0.86, -0.28, { r: 0.07, color: 0x6fb7e8, body: 0x2f4f6f });
    ventV.scale.set(0.6, 0.6, 0.6);
    holoTag(ventV, "ventilation", 0, 0.62, 0, { css: BRHC_CSS, w: 0.22 });
    reg(hits, ventV, "ventilation-valve");
    const watches = group(con, 0.3, 0.9, 0.25);
    for (const x of [-0.06, 0.06]) { const w = cyl(watches, 0.04, 0.04, 0.015, x, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.7, seg: 14 }); w.rotation.x = Math.PI / 2; }
    holoTag(watches, "stopwatches", 0, 0.1, 0.02, { css: BRHC_CSS, w: 0.22 });
    reg(hits, watches, "stopwatches");
    const phys = group(con, -0.45, 0.9, 0.25);
    box(phys, 0.16, 0.06, 0.1, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const handset = box(phys, 0.14, 0.03, 0.04, 0, 0.045, 0, 0xd2312b, { rough: 0.5 });
    const physCard = decal(phys, 0.14, 0.08, 0, 0.1, 0.06, paperFace("PHYSICIAN", ["diving physician", "on the list"], { bg: "#f1eff8", band: "#c8102e" }), { px: 96 });
    physCard.visible = false;
    holoTag(phys, "diving physician phone", 0, 0.18, 0, { css: BRHC_CSS, w: 0.42 });
    reg(hits, phys, "physician-phone");
    const leaveHit = box(g, 0.5, 0.4, 0.5, 1.8, 0.8, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "leave the console to help?", 1.8, 1.15, -0.2, { css: "#d2312b", w: 0.48 });
    reg(hits, leaveHit, "leave-console");

    // ------------------------------------------------------- the medical kit, brief, log, team board
    const kit = group(g, 0.9, 0.47, 0.55);
    box(kit, 0.44, 0.28, 0.28, 0, 0.14, 0, 0xf1f3f4, { rough: 0.5 });
    box(kit, 0.44, 0.05, 0.29, 0, 0.19, 0, 0xc8102e, { rough: 0.5 });
    holoTag(kit, "chamber medical kit", 0, 0.44, 0, { css: BRHC_CSS, w: 0.36 });
    reg(hits, kit, "medical-kit");
    const table = group(g, 2.2, 0.47, 0.8);
    box(table, 0.8, 0.06, 0.5, 0, 0.8, 0, 0x5b4a3a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) cyl(table, 0.022, 0.022, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const brief = decal(table, 0.3, 0.22, -0.18, 0.84, 0, brhcSheet("STANDBY BRIEF", ["Decompression: per the tables", "Treatment: the supervisor's", "Physician: on the list"]), { px: 160 });
    brief.rotation.x = -Math.PI / 2;
    holoTag(table, "standby brief · chamber log", 0, 1.1, 0, { css: BRHC_CSS, w: 0.5 });
    reg(hits, brief, "standby-brief");
    const log = decal(table, 0.3, 0.22, 0.2, 0.84, 0, brhcSheet("CHAMBER LOG", ["Test ____", "Left stop ____ At depth ____", "O2 periods ____"], "#9d8cf0", "#f6f4fb"), { px: 160 });
    log.rotation.x = -Math.PI / 2;
    reg(hits, log, "chamber-log");
    const team = decal(g, 0.6, 0.4, 2.7, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Diver · Tender", "Standby · Chamber operator", "PFDs on deck: all"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = -Math.PI / 2;
    box(g, 0.04, 0.46, 0.66, 2.73, 1.35, -0.6, 0x2b3138, { rough: 0.6 });
    reg(hits, team, "team-board");

    // ------------------------------------------------------- crew in PFDs
    const supervisor = standingFigure(g, 2.2, -1.0, { ry: -1.2, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    supervisor.position.y = 0.47;
    holoTag(supervisor, "supervisor", 0, 1.95, 0, { css: BRHC_CSS, w: 0.22 });
    const tender = standingFigure(g, -0.2, 1.75, { ry: 2.9, cloth: 0x1f3a52, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true });
    tender.position.y = 0.47;
    holoTag(tender, "tender", 0, 1.95, 0, { css: BRHC_CSS, w: 0.18 });
    const standby = standingFigure(g, 1.25, 1.75, { ry: -2.9, cloth: 0x1b1e22, trousers: 0x1b1e22, vest: 0xf06a2b, gloves: 0x2b2b2b });
    standby.position.y = 0.47;
    holoTag(standby, "standby diver", 0, 1.95, 0, { css: BRHC_CSS, w: 0.28 });

    // ------------------------------------------------------- the crew boat alongside
    const crewBoat = workboat(g, 0.4, -0.45, -4.4, { ry: Math.PI / 2, livery: { colour: 0xd9dde0, fleetName: "BAY WORKS", unitNumber: "WB-5" } });
    void crewBoat;

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.0, -0.8),
      onStep(step) {
        if (step?.id === "press-down") inside.visible = true;
      },
      onStepComplete(step) {
        if (step.id === "chamber-check") { grit.visible = false; lighter.visible = false; }
        if (step.id === "test-pressure") gNeedle.rotation.z = 0.2;
        if (step.id === "vent-and-open") { door.rotation.y = -1.2; gNeedle.rotation.z = 1.2; }
        if (step.id === "kit-inside") { kit.position.set(-0.7, 1.09, -0.85); benchRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "set-timers") repaint(analyser.userData.screen, signFace("TIMERS SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "press-down") { door.rotation.y = 0; inside.visible = true; }
        if (step.id === "viewport-watch") kink.scale.set(1, 0.5, 1);
        if (step.id === "chamber-log") repaint(log, brhcSheet("CHAMBER LOG", ["Test held · O2 flushed", "Interval kept · blow-down steady", "Shoulder — physician called"], "#59c97b", "#e6f6ea"));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "oxygen-rising") alarmLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6 });
        if (it.id === "diver-symptoms") { inside.visible = true; callLamp.material = mat(0xf2b33d, { emissive: 0xf2b33d, ei: 1.6 }); }
      },
      onInterruptEnd(it) {
        if (it.id === "oxygen-rising") { alarmLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); if (it.resolved === "answered") ventV.userData.wheel.rotation.y = Math.PI; }
        if (it.id === "diver-symptoms" && it.resolved === "answered") { handset.position.set(0.1, 0.2, 0.08); handset.rotation.z = 0.8; physCard.visible = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "line-up-air") airV.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "test-pressure") gNeedle.rotation.z = 1.2 - gg.t * 2.4;
        if (step?.id === "press-down" && session.holding) { blowV.userData.wheel.rotation.y += (dt ?? 0.016) * 2 * (session.track?.v ?? 0); gNeedle.rotation.z = 1.2 - Math.min(2.0, (session.track?.inBand ?? 0) * 0.4); }
        if (session?.activeInterrupt?.id === "oxygen-rising") alarmLamp.visible = Math.sin(t * 10) > 0; else alarmLamp.visible = true;
        void shoulder;
      },
    };
  },
};
