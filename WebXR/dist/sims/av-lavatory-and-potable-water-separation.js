import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument,
  standingFigure, surfaceTexture, texturedMat, palette, asphaltFace,
  concreteFace, tileFace, reg,
} from "../citykit.js";
import { regionalJet, serviceCart } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Lavatory & Potable Water Separation VR — its own gamified
// system: Never Crossed.
//
// Two services that must never share a hose, a nozzle or a cart: the
// lavatory service worked entirely on its own dedicated blue-coded
// equipment, the potable water service worked entirely on its own separate
// equipment, and the one rule that governs the whole job is that nothing
// from one system ever touches the other — not the hose, not the nozzle,
// not even a hand that has not been re-gloved in between. No waste volume,
// potable fill quantity or rinse cycle time here is one this platform is
// certain of — those live on the service plan and the equipment manufacturer's
// own manual.

const AVLP_ACCENT = 0x4fd6a5;

export const SIM_AV_LAVATORY_AND_POTABLE_WATER_SEPARATION = {
  id: "av-lavatory-and-potable-water-separation",
  index: "av-8",
  domain: "Aviation",
  trade: "Lavatory and potable water service agent — IAM/TWU ramp crew",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "IAM and TWU ramp training; FAA 14 CFR Part 121 air carrier servicing requirements; OSHA 29 CFR 1910.1200 hazard communication and 29 CFR 1910.132 personal protective equipment",
  name: "Lavatory & Potable Water Separation",
  title: simTitle("Lavatory & Potable Water Separation"),
  tagline: "Two services worked on two completely separate carts: the lavatory panel drained and rinsed on its own dedicated equipment, the potable panel filled on its own separate equipment, and neither hose, nozzle or cap ever crossing from one system to the other",
  accent: AVLP_ACCENT,
  accentCss: "#4fd6a5",
  parSeconds: 310,
  footprint: 2.9,
  badge: { id: "never-crossed", name: "Never Crossed", note: "The lavatory and potable services never shared a hose, a nozzle or a cap, start to finish" },

  game: system({
    name: "Never Crossed",
    currency: "SEP",
    ranks: ["Ramp Hand", "Lav Qualified", "Potable Qualified", "Lead Service Agent", "Never Crossed Certified"],
    badges: [
      { id: "colour-true", name: "Colour True", note: "Never connected a hose to the panel it was not colour-coded for", test: AWARD.safe },
      { id: "vented-first", name: "Vented First", note: "Never drained the lav tank without the vent open", test: AWARD.stepClean("drain-waste") },
      { id: "steady-fill", name: "Steady Fill Certified", note: "Held the rinse flow near band centre through the whole rinse", test: AWARD.precise(0.7) },
      { id: "clean-inspection", name: "Clean Inspection Certified", note: "Found every defect on both carts, first pass", test: AWARD.stepClean("inspect-carts") },
    ],
    challenges: [
      { id: "quick-service", name: "Quick Service", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "sep-streak", name: "Separation Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IAM or TWU local's member assistance programme, or the site's employee assistance line if a close call around the lav cart is what stayed with you",

  hazards: {
    "cross-connection-hazard": "That connects the lavatory hose to the potable water panel. A hose that has carried waste has no business anywhere near a system this aircraft's own crew and passengers are going to drink from, and there is no rinse this crew can do in the field that makes that connection acceptable to have happened at all.",
    "nozzle-ground-contact-hazard": "That lets the nozzle tip touch the ground before connecting it to the panel. Whatever the nozzle picks up off the apron goes straight into the panel it connects to next, and a potable connection has no tolerance at all for what a dropped nozzle can pick up.",
    "vent-closed-drain-hazard": "That drains the lav tank with the vent valve still closed. A closed vent turns the drain into a sealed system fighting its own pressure, and that pressure has to go somewhere — usually back out through the fitting this crew's hands are right next to.",
    "no-ppe-lav-hazard": "You are working the lavatory side without gloves, a face shield and an apron on. This side of the job is a biological and chemical exposure this crew's PPE is specifically matched to, not a generic mess a normal glove is enough for.",
  },

  lateNotes: {
    "lav-cart-body": "The lavatory and potable services are worked as two completely separate jobs on two separate carts, never interleaved with each other's equipment at any point.",
    "vent-valve": "The vent goes open before the drain valve, not sometime after the tank is already under pressure.",
  },

  interrupts: [
    {
      id: "fitting-leaks-waste",
      kind: "Waste leak",
      after: "drain-waste", delay: 5, seconds: 12,
      alert: "The lav hose fitting has started leaking waste at the connection point.",
      cue: "Hit the lav stop now, before the leak reaches the apron.",
      target: "lav-estop",
      why: "A leaking fitting under an active drain only gets worse the longer the transfer keeps running, and the flow stops the instant a leak is seen at that fitting rather than waiting to see whether it seals itself back up on its own once the pressure changes.",
      missNote: "The drain kept running while waste leaked at the fitting. A leak that reaches the apron is a biological spill this crew is now cleaning up in addition to the job they were already doing.",
      wrongNote: "Wrong call for this moment — the fitting leaking waste at the connection is the one thing that needs this drain stopped right now.",
    },
    {
      id: "coworker-offers-wrong-hose",
      kind: "Cross-connection offered",
      after: "connect-potable-hose", delay: 4, seconds: 12,
      alert: "A coworker has walked over holding the lavatory hose, offering to help finish the potable fill with it.",
      cue: "Stop and check the hose colour coding before anything connects to this panel.",
      target: "hose-colour-check",
      why: "The whole separation this job depends on lives entirely in never once connecting the wrong hose to the wrong panel, and the one defence against a well-meaning mistake is checking the colour coding out loud before anything touches the potable connection, every single time.",
      missNote: "The wrong hose almost went onto the potable panel because nobody stopped to check the colour first. A coworker's confidence that a hose is the right one is not the same fact as it actually being the right one.",
      wrongNote: "Wrong call for this moment — the offered hose is the thing that needs checking and refusing before this fill goes anywhere further.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["service-gloves", "face-shield-lav", "service-apron"],
      itemNames: { "service-gloves": "gloves", "face-shield-lav": "face shield", "service-apron": "apron" },
      title: "Suit up before either service",
      cue: "Gloves, face shield and apron before touching the lav side of this job.",
      why: "The lav side of this job is a biological and chemical exposure the potable side simply is not, and this crew suits up for the more demanding half of the job before starting either one, rather than starting light and switching gear partway through once the harder half is already underway.",
    },
    {
      id: "brief", kind: "select", target: "service-plan-board",
      title: "Read the service plan",
      cue: "Confirm the waste estimate, the potable fill quantity and which panel is which before staging anything.",
      why: "The plan is what tells this crew which panel on this specific aircraft is the lav and which is potable before either cart ever gets near it — a crew guessing at that from memory is one assumption away from the entire hazard this job exists to prevent.",
    },
    {
      id: "inspect-carts", kind: "find", noHint: true,
      targets: ["cracked-lav-hose", "potable-valve-leak", "damaged-nozzle-cap"],
      itemNames: {
        "cracked-lav-hose": "cracked lavatory hose",
        "potable-valve-leak": "leak at the potable valve",
        "damaged-nozzle-cap": "damaged nozzle cap",
      },
      itemNotes: {
        "cracked-lav-hose": "A cracked lav hose is a waste leak waiting for the first time this crew charges it under load.",
        "potable-valve-leak": "A leaking potable valve loses clean water pressure before it ever reaches the aircraft, and a leak on this side of the job gets fixed rather than worked around.",
        "damaged-nozzle-cap": "A cap that will not seat is a nozzle tip this crew cannot actually keep clean between connections, which defeats the entire point of capping it at all.",
      },
      decoyNotes: { "sound-potable-hose": "The potable hose is intact with no cracking or wear. Nothing to flag there." },
      title: "Inspect both carts",
      cue: "Walk the lav cart and the potable cart. Three problems are hiding — find them by looking.",
      why: "A hose or a cap that looks fine coiled on the cart is not the same thing as one a competent person has actually checked before it connects to an aircraft — a crack, a leak or a bad cap found now costs a swap, and found mid-service costs exactly the kind of contamination this whole job is built to prevent.",
    },
    {
      id: "position-lav-cart", kind: "drag", target: "lav-cart-body",
      title: "Position the lav cart",
      cue: "Bring the lav cart in to the lavatory panel.",
      why: "The lav cart only ever works the lavatory panel — bringing it to that panel specifically, and nowhere near the potable side of the aircraft, is the first physical step in a separation this whole job depends on keeping true from the very first move this crew makes.",
      drag: { to: "lav-panel-position", radius: 0.5, missNote: "Not at the lav panel — bring the cart fully into position before connecting anything." },
    },
    {
      id: "verify-lav-panel", kind: "select", target: "lav-panel",
      title: "Verify the lavatory panel",
      cue: "Confirm this panel is labelled for lavatory service before connecting anything to it.",
      why: "The panel's own label is what this crew is actually trusting, not which side of the aircraft it happens to be on or which panel serviced the last aircraft on this stand — checking it every time is what catches the one aircraft where the layout is not the one this crew was already expecting from memory.",
    },
    {
      id: "connect-lav-hose", kind: "select", target: "lav-nozzle",
      title: "Connect the lav hose",
      cue: "Connect the dedicated lavatory nozzle to the verified lav panel.",
      why: "This nozzle has never touched anything but lavatory panels on any aircraft this cart has ever serviced, and keeping that true for one more connection is the entire reason it gets its own dedicated colour and its own dedicated storage rather than being treated as a fitting any hose on this ramp could stand in for.",
    },
    {
      id: "open-vent-valve", kind: "turn", target: "vent-valve",
      title: "Open the vent valve",
      cue: "Turn the vent valve open before the drain valve moves at all.",
      why: "The vent is what gives the tank's own pressure somewhere to go as waste leaves it — opened after the drain instead of before, that pressure has already had a chance to push back through the fitting this crew's own hands are right next to, at the exact moment they are least expecting it to move.",
      turn: { turns: 0.35, axis: "z", label: "VENT" },
    },
    {
      id: "drain-waste", kind: "hold", target: "drain-valve", seconds: 6,
      title: "Drain the lav tank",
      cue: "Hold the drain valve open through the full transfer to the cart's holding tank.",
      why: "A drain valve let go partway through is a transfer this crew now has to restart from a tank that is neither empty nor full, and holding it open through the whole cycle is what keeps this job from turning into two incomplete ones stacked on top of each other before the rinse can even start.",
      holdBreakNote: "Released the drain valve mid-transfer. Hold it open through the whole drain — that is what keeps this from becoming two partial transfers instead of one complete one.",
    },
    {
      id: "rinse-lav-tank", kind: "track", target: "rinse-control", seconds: 7,
      title: "Rinse the tank",
      cue: "Keep the rinse flow inside the band for the whole rinse cycle.",
      why: "A rinse that surges and drops does not clean the tank evenly, missing whatever sits in the slow spots between surges, and a steady flow is what this crew actually trusts to leave the tank in the state the next flight's own service is expecting to find it in rather than a guess about how thorough the cycle actually was.",
      track: { start: 0.5, green: [0.4, 0.62], rise: 0.42, fall: 0.4, drift: 0.13, label: "RINSE FLOW", readout: (v) => (v < 0.4 ? "flow too slow" : v > 0.62 ? "flow surging" : "steady") },
      holdBreakNote: "Rinse flow out of band. Bring it back to steady before finishing the cycle.",
    },
    {
      id: "cap-lav-panel", kind: "select", target: "lav-nozzle",
      title: "Disconnect and cap the lav side",
      cue: "Disconnect the lav nozzle without letting it touch the ground, then cap it and close the panel.",
      why: "The nozzle gets capped the instant it is disconnected because a lav nozzle sitting uncapped on the cart between jobs is exactly the kind of exposed tip that ends up touching something it should not — the cart's own frame, the apron, a hand that has not been re-gloved — before its next connection.",
    },
    {
      id: "verify-potable-panel", kind: "select", target: "potable-panel",
      title: "Verify the potable panel",
      cue: "Confirm this separate panel is labelled for potable service before the potable cart connects to anything.",
      why: "This is a different panel on a different part of the aircraft, checked the same deliberate way the lav panel was a few minutes ago — the two services never share a verification step any more than they share a hose, a nozzle or a cart.",
    },
    {
      id: "connect-potable-hose", kind: "drag", target: "potable-nozzle",
      title: "Connect the potable hose",
      cue: "Carry the dedicated potable nozzle to the verified panel without letting the tip touch anything on the way.",
      why: "This nozzle has never touched anything but potable panels, and carrying it deliberately by hand rather than swinging it in loose on the hose is what keeps that true for one more connection, on one more aircraft, without a single exception this crew is willing to make for convenience.",
      drag: { to: "potable-connection-point", radius: 0.4, missNote: "Not seated on the potable panel — carry the nozzle fully to the verified connection before releasing it." },
    },
    {
      id: "fill-potable-tank", kind: "gauge", target: "potable-fill-gauge",
      title: "Fill to the planned quantity",
      cue: "Read the fill gauge and stop only once it is inside the plan's band.",
      why: "The fill quantity is set by the plan for a reason tied to this flight's own passenger load and its own weight and balance, and stopping short or overfilling both hand the aircraft a potable quantity that no longer matches what the plan actually called for on this specific rotation.",
      gauge: { label: "POTABLE FILL", speed: 0.6, green: [0.46, 0.6], readout: (t) => `${Math.round(t * 100)}% of plan`, missNote: "Outside the plan's band — confirm the fill quantity before disconnecting." },
    },
    {
      id: "cap-potable-panel", kind: "select", target: "potable-nozzle",
      title: "Disconnect and cap the potable side",
      cue: "Disconnect the potable nozzle without letting it touch the ground, then cap it and close the panel.",
      why: "The same discipline that protected this nozzle on the way in protects it on the way out — capped the instant it disconnects, so the next aircraft it services somewhere else on this ramp gets a tip that has stayed exactly as clean as this one required, with nothing in between the two jobs to change that.",
    },
    {
      id: "closeout-log", kind: "select", target: "closing-log",
      title: "Log both services",
      cue: "Log the waste volume, the potable fill quantity and both cart checks before signing off.",
      why: "The service log is what the next crew and the aircraft's own turnaround record both read — two services that went perfectly but never get logged as the two separate jobs they actually were leaves nothing behind to prove to anyone reading it afterward that the separation actually held the whole way through.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const PAL = palette("aviation");
    stationPad(g, 2.9, AVLP_ACCENT);

    // ------------------------------------------------------------------ apron ground
    const groundMesh = box(g, 8.4, 0.12, 8.2, 0, 0.06, 0, 0xffffff, { rough: 0.94 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#2b2d2f", base2: "#252729" }), { repeat: 7, px: 512 }),
      { rough: 0.94, metal: 0.03, color: 0xb4babe },
    );
    // Concrete service pads under each cart — a second textured surface.
    for (const [px, pz] of [[-2.4, 1.4], [2.4, 1.4]]) {
      const pad = box(g, 1.8, 0.1, 1.8, px, 0.12, pz, 0xffffff, { rough: 0.85, cast: false });
      pad.material = texturedMat(
        surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { tone: "#8b8d89" }), { repeat: 2, px: 256 }),
        { rough: 0.85, metal: 0.02, color: 0xffffff },
      );
    }
    // Tiled catch mat under the lav connection — a third textured surface.
    const catchMat = box(g, 1.0, 0.02, 1.0, -1.4, 0.111, -0.4, 0xffffff, { rough: 0.6, cast: false });
    catchMat.material = texturedMat(
      surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 4, tile: 0xd0d5d8, grout: "#93999b" }), { repeat: 2, px: 256 }),
      { rough: 0.55, metal: 0.02, color: 0xffffff },
    );

    // ------------------------------------------------------------------ aircraft & carts
    const jet = regionalJet(g, 0, 0, -1.8, { livery: { colour: PAL.structure, accent: AVLP_ACCENT, fleetName: "SITE AIR", unitNumber: "N880XA" } });
    holoTag(jet, "aircraft on stand", 0, 3.4, 0, { css: "#4fd6a5", w: 0.4 });
    const { servicePanel, fuselage } = jet.userData.parts;
    reg(hits, servicePanel, "lav-panel");
    holoTag(servicePanel, "lavatory panel", 0, 0.2, 0, { css: "#2f6f9e", w: 0.32 });

    // A second, physically separate service panel for potable — never the same fitting as the lav panel.
    const potablePanel = group(fuselage, 0.5, -0.1, 1.4);
    box(potablePanel, 0.04, 0.28, 0.3, 0, 0, 0, 0x1c3a52, { rough: 0.45, metal: 0.15 });
    holoTag(potablePanel, "potable water panel", 0, 0.2, 0, { css: "#4fd6a5", w: 0.38 });
    reg(hits, potablePanel, "potable-panel");

    const lavCart = serviceCart(g, -2.4, 0, 1.4, { kind: "lav", ry: 1.9 });
    reg(hits, lavCart, "lav-cart-body");
    holoTag(lavCart, "lavatory service cart", 0, 2.1, 0, { css: "#2f6f9e", w: 0.4 });
    const { hoseReel: lavReel } = lavCart.userData.parts;
    const lavPanelPosition = group(g, -0.7, 0.3, -0.5);
    hits["lav-panel-position"] = lavPanelPosition;

    const potableCart = serviceCart(g, 2.4, 0, 1.4, { kind: "potable", ry: -1.9 });
    reg(hits, potableCart, "potable-cart-body");
    holoTag(potableCart, "potable water cart", 0, 2.1, 0, { css: "#4fd6a5", w: 0.36 });
    const { hoseReel: potableReel } = potableCart.userData.parts;

    const crackedLavHose = group(lavReel, 0.1, 0.1, 0);
    box(crackedLavHose, 0.03, 0.015, 0.02, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, crackedLavHose, "cracked-lav-hose");
    const potableValveLeak = group(potableCart, 0, 0.3, -0.4);
    ball(potableValveLeak, 0.02, 0, 0, 0, 0x2b2318, { rough: 0.5, opacity: 0.7, transparent: true, seg: 10 });
    reg(hits, potableValveLeak, "potable-valve-leak");
    const damagedCap = group(lavCart, 0.4, 0.3, -0.6);
    box(damagedCap, 0.02, 0.02, 0.02, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, damagedCap, "damaged-nozzle-cap");
    const soundPotableHose = group(potableReel, 0.1, 0.1, 0);
    ball(soundPotableHose, 0.015, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 8 });
    reg(hits, soundPotableHose, "sound-potable-hose");

    const lavNozzle = group(lavReel, 0, -0.1, -0.25);
    cyl(lavNozzle, 0.03, 0.03, 0.14, 0, 0, 0, 0x2f6f9e, { rough: 0.5, metal: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(lavNozzle, "lav nozzle", 0, 0.14, 0, { css: "#2f6f9e", w: 0.24 });
    reg(hits, lavNozzle, "lav-nozzle");
    const potableNozzle = group(potableReel, 0, -0.1, -0.25);
    cyl(potableNozzle, 0.03, 0.03, 0.14, 0, 0, 0, 0x4fd6a5, { rough: 0.5, metal: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(potableNozzle, "potable nozzle", 0, 0.14, 0, { css: "#4fd6a5", w: 0.3 });
    reg(hits, potableNozzle, "potable-nozzle");
    const potableConnectionPoint = group(fuselage, 0.5, -0.1, 1.35);
    hits["potable-connection-point"] = potableConnectionPoint;

    const crossConnectHazard = box(g, 0.4, 0.3, 0.4, 0.2, 0.3, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "connect the lav hose here?", 0.2, 0.55, 0.9, { css: "#d2312b", w: 0.46 });
    reg(hits, crossConnectHazard, "cross-connection-hazard");
    const groundContactHazard = box(g, 0.3, 0.1, 0.3, -1.6, 0.05, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drop the nozzle here?", -1.6, 0.2, 0.6, { css: "#d2312b", w: 0.42 });
    reg(hits, groundContactHazard, "nozzle-ground-contact-hazard");

    const ventValve = group(lavCart, -0.4, 0.9, -0.5, 0.2);
    cyl(ventValve, 0.012, 0.012, 0.14, 0, 0, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.5, rough: 0.4, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(ventValve, "vent valve", 0, 0.14, 0, { css: "#2f6f9e", w: 0.24 });
    reg(hits, ventValve, "vent-valve");
    const ventClosedHazard = group(g, -2.9, 0.14, 0.9, 0.3);
    box(ventClosedHazard, 0.07, 0.05, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const drainAnywayPaddle = box(ventClosedHazard, 0.13, 0.09, 0.012, 0, 0.2, 0.007, 0xd2312b, { rough: 0.5 });
    decal(drainAnywayPaddle, 0.11, 0.07, 0, 0, 0.008, signFace("DRAIN\nNOW", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 }));
    reg(hits, drainAnywayPaddle, "vent-closed-drain-hazard");

    const drainValve = group(lavCart, 0.4, 0.9, -0.5, 0.2);
    const drainKnob = ball(drainValve, 0.025, 0, 0, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.5, seg: 10 });
    holoTag(drainValve, "drain valve", 0, 0.14, 0, { css: "#2f6f9e", w: 0.26 });
    reg(hits, drainKnob, "drain-valve");
    const lavEstop = group(lavCart, 0, 1.4, -0.5, 0);
    cyl(lavEstop, 0.03, 0.03, 0.05, 0, 0, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 12 });
    const lavEstopCap = ball(lavEstop, 0.035, 0, 0.03, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.7, seg: 12 });
    holoTag(lavEstop, "lav stop", 0, 0.16, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, lavEstopCap, "lav-estop");

    const rinseControl = group(lavCart, -0.4, 0.9, -0.7, 0.2);
    const rinseKnob = ball(rinseControl, 0.025, 0, 0, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.7, seg: 10 });
    holoTag(rinseControl, "rinse control", 0, 0.14, 0, { css: "#2f6f9e", w: 0.28 });
    reg(hits, rinseKnob, "rinse-control");

    const potableFillGauge = instrument(g, 2.9, 0, 0.6, { ry: -0.6, idle: "--%", color: AVLP_ACCENT });
    holoTag(potableFillGauge, "potable fill", 0, 0.16, 0, { css: "#4fd6a5", w: 0.3 });
    reg(hits, potableFillGauge, "potable-fill-gauge");

    const hoseColourCheck = group(g, 0, 0, 1.9, 0.3);
    box(hoseColourCheck, 0.3, 0.2, 0.02, 0, 0.9, 0, 0x2b2f34, { rough: 0.6 });
    const swatchL = box(hoseColourCheck, 0.1, 0.08, 0.01, -0.07, 0.9, 0.011, 0x2f6f9e, { rough: 0.5 });
    const swatchR = box(hoseColourCheck, 0.1, 0.08, 0.01, 0.07, 0.9, 0.011, 0x4fd6a5, { rough: 0.5 });
    void swatchL; void swatchR;
    holoTag(hoseColourCheck, "hose colour code", 0, 1.06, 0, { css: "#4fd6a5", w: 0.36 });
    reg(hits, hoseColourCheck, "hose-colour-check");

    const noPpeHazard = group(g, -3.0, 0.14, 2.0, 0.3);
    box(noPpeHazard, 0.07, 0.05, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const skipPpePaddle = box(noPpeHazard, 0.13, 0.09, 0.012, 0, 0.2, 0.007, 0xd2312b, { rough: 0.5 });
    decal(skipPpePaddle, 0.11, 0.07, 0, 0, 0.008, signFace("SKIP\nPPE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 }));
    reg(hits, skipPpePaddle, "no-ppe-lav-hazard");

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.62, 0.42, -3.2, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd6a5"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SERVICE PLAN · STAND 6", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("NEVER CROSS THE HOSES", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Waste + fill quantities: per the plan", "Lav and potable: separate carts always",
       "Vent open before the drain valve", "Nozzles capped the instant disconnected",
       "Panel label checked before every connection"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.4, accent: AVLP_ACCENT });
    reg(hits, plan, "service-plan-board");

    const ppeRack = group(g, -3.6, 0, 2.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const gloveProp = box(ppeRack, 0.16, 0.05, 0.1, -0.2, 0.55, 0, 0xd8a63a, { rough: 0.7 });
    holoTag(gloveProp, "gloves", 0, 0.16, 0, { css: "#4fd6a5", w: 0.24 });
    reg(hits, gloveProp, "service-gloves");
    const shieldProp = group(ppeRack, 0.2, 0.62, 0);
    box(shieldProp, 0.14, 0.16, 0.01, 0, 0, 0, 0xdfe6ea, { rough: 0.3, opacity: 0.7, transparent: true });
    holoTag(shieldProp, "face shield", 0, 0.18, 0, { css: "#4fd6a5", w: 0.3 });
    reg(hits, shieldProp, "face-shield-lav");
    const apronProp = box(ppeRack, 0.2, 0.3, 0.02, 0, 0.5, 0.06, 0x2f6f9e, { rough: 0.7 });
    holoTag(apronProp, "apron", 0, 0.2, 0, { css: "#4fd6a5", w: 0.24 });
    reg(hits, apronProp, "service-apron");

    const closingLog = group(g, 3.4, 0, 2.4, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("SERVICE LOG\nOPEN", { bg: "#11181f", accent: "#4fd6a5", scale: 0.26 }), { px: 320 });
    holoTag(closingLog, "service log", 0, 1.34, 0, { css: "#4fd6a5", w: 0.26 });
    reg(hits, closingLog, "closing-log");

    const attendant = standingFigure(g, -0.5, -0.8, { ry: 2.2, cloth: 0x2b3138, vest: AVLP_ACCENT, helmet: 0xf2f2f2 });
    holoTag(attendant, "service agent", 0, 1.95, 0.15, { css: "#4fd6a5", w: 0.32 });

    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),

      onInterrupt(it) {
        if (it.id === "fitting-leaks-waste") { lavNozzle.position.z -= 0.05; }
        if (it.id === "coworker-offers-wrong-hose") {
          lavCart.position.x += 0.5;
          repaint(potableFillGauge.userData.screen, signFace("CHECK HOSE", { bg: "#2a1610", accent: "#f0645b", fg: "#ffd9d0", scale: 0.3 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fitting-leaks-waste") { lavNozzle.position.z += 0.05; }
        if (it.id === "coworker-offers-wrong-hose") {
          lavCart.position.x -= 0.5;
          repaint(potableFillGauge.userData.screen, signFace("--%", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
      onStepComplete(step) {
        if (step.id === "inspect-carts") {
          crackedLavHose.children[0].material = mat(0x59c97b, { rough: 0.6 });
          potableValveLeak.children[0].material = mat(0x59c97b, { rough: 0.5, opacity: 0.3, transparent: true });
          damagedCap.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "closeout-log") {
          repaint(closingLogFace, signFace("SERVICE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        attendant.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (session?.step?.id === "rinse-lav-tank") rinseKnob.position.x = Math.sin(t * 3) * 0.02;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "fill-potable-tank") {
          repaint(potableFillGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
