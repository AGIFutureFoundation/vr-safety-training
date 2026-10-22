import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, growthFace, siltFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pier Pile Inspection Dive VR — Maritime & Ports, the marine and
// water pack of the Bay Area Union Edition, on the bay-underwater district.
//
// On the bottom under a pier, among two of its piles: one pile's concrete
// spalled back to its rebar at the band the diver scrapes clean, a second
// pile wrapped in a jacket with a split and a broken lead to its anode, a
// crossbrace between them, a loose timber hanging from the deck above, the
// downline to its clump weight, and the diver's umbilical running back to the
// dive stage the district stands at (−4.3, 2.8). The learner is the diver, a
// Pile Drivers commercial diver; the supervisor is on the comms. Depth, gas
// and decompression limits are never written as numbers: the pneumo reads
// "per the dive plan" and the HUD chip carries the plan's own bottom time.

const MWPP_ACCENT = 0x5fd0c0;

/** A pile with its growth, mussel clumps and rings, standing on the silt. */
function mwppPile(parent, x, z, tex) {
  const p = group(parent, x, 0, z);
  const shaft = cyl(p, 0.34, 0.36, 6.4, 0, 3.2, 0, 0xffffff, { seg: 18 });
  shaft.material = tex;
  for (const [y, h] of [[0.28, 0.4], [2.7, 0.3], [3.9, 0.24]]) cyl(p, 0.42, 0.44, h, 0, y, 0, 0x56613f, { rough: 1, seg: 16 });
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + x;
    ball(p, 0.1 + (i % 2) * 0.04, Math.cos(a) * 0.4, 0.12 + (i % 3) * 0.14, Math.sin(a) * 0.4, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1);
  }
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + z;
    const frond = box(p, 0.03, 0.6, 0.12, Math.cos(a) * 0.46, 3.2 + i * 0.2, Math.sin(a) * 0.46, 0x5a7a3a, { rough: 0.9, cast: false });
    frond.rotation.z = 0.3 * (i - 1);
  }
  return p;
}

export const SIM_MW_PIER_PILE_INSPECTION_DIVE = {
  id: "mw-pier-pile-inspection-dive",
  index: "234",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters commercial diver on a surface-supplied pier inspection dive, with the dive supervisor, the tender and the standby diver at the surface",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 600,
  },
  certification: "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations; ADCI consensus standards for commercial diving and underwater inspection; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas and decompression per the dive plan and the tables the supervisor holds",
  name: "Pier Pile Inspection Dive",
  title: simTitle("Pier Pile Inspection Dive"),
  tagline: "On the bottom under the pier: on-bottom report to the supervisor, the umbilical checked hand over hand while the comms go dead, the scraper passed off the stage, the first pile's spall and section loss found, the pneumo read, the faceplate cleared, the section measured, the second pile's band cleaned at a breathing pace the supply can hold through a current shift, the jacket and anode lead found, the defects photographed against a scale, the tools sent up and the findings read up for the dive log",
  accent: MWPP_ACCENT,
  accentCss: "#5fd0c0",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "every-pile-read", name: "Every Pile Read", note: "Both piles inspected, every defect photographed against a scale, the umbilical never fouled and never a free ascent" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters — with the employer's employee assistance line behind it",

  game: system({
    name: "Pile Inspection",
    currency: "BENT",
    ranks: ["Diver Trainee", "Diver", "Inspection Diver", "Lead Inspection Diver", "Pile Inspection Certified"],
    badges: [
      { id: "umbilical-proven", name: "Umbilical Proven", note: "The umbilical checked hand over hand before the work started", test: AWARD.stepClean("umbilical-check") },
      { id: "measured-true", name: "Measured True", note: "Pneumo committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "clear-of-the-brace", name: "Clear Of The Brace", note: "Never through the brace, never bare-handed on the growth, never under the timber, never a free ascent", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-inspection-dive", name: "Clean Dive", note: "No corrections from the on-bottom report to the log", test: AWARD.clean },
      { id: "paced-breathing", name: "Paced Breathing", note: "Breathing held on the supply the whole band clean", test: AWARD.unbroken },
      { id: "inside-the-plan", name: "Inside The Plan", note: "Findings read up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "through-the-brace": "You went through the gap between the crossbrace and the pile to reach the far side. Your umbilical follows your path, and a diver who passes inside a brace and comes back round the other way has tied their gas, comms and lifting line round the pier's structure — the tender cannot pull you clear and the standby has to come and untangle you. You work round the outside and come back the way you went.",
    "free-ascent": "You started up the pile toward the surface on your own. The ascent is the supervisor's call: it is run on the umbilical or the stage at the rate and with the stops the tables the supervisor holds give for this dive, and a diver who leaves the bottom alone skips both — an uncontrolled ascent is how divers are bent or embolised.",
    "bare-hand-growth": "You pulled a glove off to feel the edge of the spall. Barnacle, mussel and exposed rebar edges open a hand in a moment, the water under a pier carries whatever the harbour carries, and a cut hand is a diver who cannot grip the umbilical or the downline. You feel with the glove on and let the caliper and the camera do the measuring.",
    "under-timber": "You moved in under the loose timber hanging from the pier deck. Something that has come loose from the structure above can come the rest of the way down with the next swell or the next truck on the deck, and a diver under it has nowhere to go fast. You report it to the supervisor and stay clear of the fall line.",
  },

  lateNotes: {
    "caliper": "The section is measured once the pile has been inspected and the pneumo read — find the loss before you put a caliper on it.",
    "band-two": "The second pile's band is cleaned once the first pile has been read and measured — one pile at a time.",
    "diver-slate": "The findings are read up for the dive log once the defects are photographed and the tools are back on the stage.",
  },

  steps: [
    {
      id: "on-bottom", kind: "select", target: "diver-comms",
      title: "Report on the bottom to the supervisor",
      cue: "Call the supervisor: on the bottom, off the stage, feeling good, visibility and current as you find them, starting on the first pile.",
      why: "The supervisor at the panel sees your gas and your depth but not you, and your voice is how the surface knows you arrived where the plan put you, that you are breathing easily and that you can see. The on-bottom report also starts the clock the decompression obligation will be read against, so it is made the moment you leave the stage, in plain words, and repeated back.",
    },
    {
      id: "umbilical-check", kind: "hold", target: "umbilical-harness", seconds: 4,
      title: "Check your umbilical hand over hand to the harness",
      cue: "Run a hand down the umbilical from the helmet to the harness: strain relief clipped to the harness ring, no turns round the stage bridle, slack enough to reach the work and no more.",
      why: "The umbilical is the dive — gas, comms, pneumo and the line the tender recovers you on — and the strain relief on the harness is what makes a pull on it a pull on you rather than on the helmet's fittings. The check is done by hand on the bottom because the path it took from the stage is only visible to the diver who made it, and a turn round the stage bridle found now is a foul that never happens.",
      holdBreakNote: "Let go before the check reached the harness — the part you skipped is the part that fouls. Start again from the helmet.",
    },
    {
      id: "scraper-down", kind: "drag", target: "scraper",
      title: "Take the scraper off the stage to the pile",
      cue: "Unclip the scraper from the stage rail on its lanyard and bring it to the band on the first pile.",
      why: "Tools go down on the stage and come off it on a lanyard, because a tool dropped on the bottom under a pier is lost in the silt and a tool swinging free is a weight on the umbilical. Taken to the band on its lanyard, the scraper stays attached to you and to the work — and the stage stays where the plan put it, as the place you come back to.",
      drag: { to: "pile-band", radius: 0.5, missNote: "Not at the band — take the scraper to the marked band on the first pile, on its lanyard." },
    },
    {
      id: "pile-one", kind: "find", noHint: true,
      targets: ["spall-rebar", "section-loss"],
      itemNames: { "spall-rebar": "spall at the band with rebar exposed", "section-loss": "section loss at the mudline" },
      itemNotes: {
        "spall-rebar": "The concrete cover at the scraped band has spalled off in a patch with two bars of reinforcing steel exposed and rust-coloured — steel in seawater expands as it corrodes and pushes more cover off, so a spall grows.",
        "section-loss": "Just above the silt the pile has necked in where it meets the mudline — the zone where scour and abrasion take concrete away fastest, and where the pile's section is the one the engineer needs measured.",
      },
      title: "Inspect the first pile at the band and the mudline",
      cue: "Look along the scraped band and down to the mudline: cracks, spalls, exposed rebar, rust staining, and any loss of section where the pile meets the silt.",
      why: "A pier pile is inspected where it fails: in the splash and tidal zone where the cover spalls and the steel starts to rust, and at the mudline where scour and abrasion take the section away. Marine growth hides both, which is why a band is scraped clean; the inspection is what the engineer's rating of the pier is built on, so what the diver does not see is what the engineer does not know.",
    },
    {
      id: "pneumo-depth", kind: "gauge", target: "pneumo-end",
      title: "Hold the pneumo at the defect and let the supervisor read it",
      cue: "Hold the pneumo hose's end at the spall while the supervisor bleeds it, and commit the reading against the depth the dive plan gives for this bent.",
      why: "The defect's depth is recorded so the engineer can place it on the pile and so the next inspection can find it, and it is read on the pneumo at the defect rather than guessed from where the stage is. It also tells the supervisor where you are against the plan: working deeper than planned puts you on a different line of the tables the supervisor holds, and the surface needs to know that as it happens.",
      gauge: { label: "PNEUMO AT DEFECT", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "shallower than the plan" : t <= 0.58 ? "per the dive plan" : "deeper than planned — tell topside"), missNote: "Outside the band — hold the pneumo's end still at the defect while the supervisor bleeds and reads it against the plan." },
    },
    {
      id: "clear-faceplate", kind: "turn", target: "free-flow-valve",
      title: "Crack the free-flow to clear the faceplate",
      cue: "Open the helmet's free-flow valve a part turn to clear the fogging off the faceplate for the close look, then close it back.",
      why: "A fogged faceplate is a diver working by feel beside exposed rebar, and the free-flow is how a demand helmet clears it: a part turn sends gas across the inside of the faceplate. It is opened only as far as needed and closed again, because the free-flow uses the supply much faster than breathing does, and the supervisor sees it on the panel as gas the dive plan did not count on.",
      turn: { turns: 0.5, label: "FREE-FLOW", readout: (t) => (t < 0.3 ? "closed — faceplate fogged" : t < 0.9 ? "flowing — clearing" : "clear — close it back") },
    },
    {
      id: "measure-section", kind: "select", target: "caliper",
      title: "Measure the remaining section with the caliper",
      cue: "Set the caliper across the pile at the mudline necking and read the measurement up to the supervisor for the record.",
      why: "A description of section loss is not something an engineer can rate a pier on; a measurement is. The caliper across the pile at the worst section gives the number the engineer compares to the design, and reading it up to the supervisor immediately puts it in the record while you are still holding the caliper, rather than trusting it to memory through the rest of the dive.",
    },
    {
      id: "clean-band", kind: "track", target: "band-two", seconds: 6,
      title: "Clean the second pile's band at a pace your supply holds",
      cue: "Scrape the band on the second pile steadily, pacing your breathing so the supervisor sees you steady on the supply — not racing the growth.",
      why: "Scraping marine growth is heavy work, and a diver working hard breathes more gas than the supply was set for at rest: overbreathing a demand helmet feels like not getting a breath, which makes a diver work harder still. Pacing the work to the breathing keeps the gas within what the dive plan and the supervisor's panel allow, and a diver who is breathing hard tells the supervisor and stops rather than pushing through.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "BREATHING ON THE SUPPLY", readout: (v) => (v < 0.42 ? "slow — band not clearing" : v > 0.6 ? "breathing hard — ease off" : "steady on the supply") },
      holdBreakNote: "The pace broke out of band — either racing and overbreathing, or stopped. Settle your breathing and take it up again steadily.",
    },
    {
      id: "pile-two", kind: "find", noHint: true,
      targets: ["jacket-split", "anode-lead-broken"],
      itemNames: { "jacket-split": "split in the second pile's jacket", "anode-lead-broken": "broken lead between the pile and its anode" },
      itemNotes: {
        "jacket-split": "The fibreglass jacket round the second pile has split along a seam and the grout behind it is washing out — a jacket is protection only while it is whole.",
        "anode-lead-broken": "The lead from the pile's steel to the sacrificial anode on the silt has parted: the anode is no longer protecting anything, and the pile's steel is corroding in its place.",
      },
      title: "Inspect the second pile's jacket and its anode lead",
      cue: "Look along the jacket for splits and washed-out grout, and follow the cathodic protection lead from the pile to its anode on the silt.",
      why: "A pile jacket and a sacrificial anode are both repairs that protect the pile only while they work, and they fail quietly: a split jacket lets the grout wash out and seawater back in, and a broken lead leaves the anode sitting on the silt protecting nothing. The inspection follows each to its end, because a repair that has failed looks, at a glance, exactly like one that is working.",
    },
    {
      id: "photograph", kind: "sequence",
      targets: ["scale-bar", "uw-camera"],
      itemNames: { "scale-bar": "scale bar placed against the defect", "uw-camera": "photograph taken" },
      title: "Photograph each defect against a scale",
      cue: "Place the scale bar flat against the spall first, then take the photograph square to it with the strobe.",
      why: "A photograph without a scale in it cannot be measured, and the engineer reading the inspection needs to know whether the spall is the size of a hand or a door. The scale bar goes on first so every photograph has one, and the camera is held square to the surface so the scale reads true — the photographs are the part of the dive the engineer actually sees.",
      outOfOrderNote: "Out of order — the scale bar goes against the defect first, so the photograph has something to measure it by.",
    },
    {
      id: "tools-up", kind: "drag", target: "tool-bag",
      title: "Send the tools back up on the stage",
      cue: "Clip the tool bag back onto the stage rail so it goes up with you, nothing left on the bottom.",
      why: "Tools go back on the stage for the same reason they came down on it: nothing loose in the water column, nothing left on the bottom to foul the next diver's umbilical. A tool bag clipped to the stage comes up with the diver on the supervisor's ascent, and the tender does not have to haul a separate line past a diver doing decompression stops.",
      drag: { to: "stage-rail", radius: 0.5, missNote: "Not on the stage — clip the bag to the stage rail so it comes up with you." },
    },
    {
      id: "findings-up", kind: "select", target: "diver-slate",
      title: "Read your findings up for the dive log",
      cue: "Read your slate to the supervisor: pile, depth, the spall and the rebar, the section measured, the jacket split and the broken anode lead, the loose timber.",
      why: "The supervisor writes the dive log and the inspection record from what you read up, and it is read from the slate while you are still at the piles so anything unclear can be looked at again before you leave the bottom. The loose timber goes in as well, because the next diver on this pier will be working under it.",
    },
    {
      id: "leave-bottom", kind: "select", target: "diver-comms",
      title: "Check in and leave the bottom on the supervisor's call",
      cue: "Tell the supervisor you are on the stage and ready to leave the bottom, how you feel after the band and the current, and wait for the call.",
      why: "The ascent is the supervisor's: they read the obligation from the tables they hold and call the stage up and the stops. Your check-in tells them you are on the stage, clipped on and well — and it is also the diver's own chance to say how the dive was, the dead comms and the current included, which is what the member assistance line exists to hear if the debrief does not.",
    },
  ],

  interrupts: [
    {
      id: "comms-dead-bottom",
      kind: "Comms lost with the surface",
      after: "umbilical-check", delay: 2, seconds: 14,
      alert: "The supervisor's voice has gone — nothing in the helmet speaker, and no answer to your call.",
      cue: "Give line-pull signals on your umbilical to the tender and stay where you are.",
      target: "umbilical-signal",
      why: "When the comms fail, the umbilical is the line back: the diver gives the agreed line-pull signals and the tender answers the same way, so both ends know the diver is well and staying put. Staying where you are, on the umbilical, keeps you where the surface expects you while they sort the comms, rather than moving off and making the team guess.",
      missNote: "You carried on with the umbilical check in silence; the surface, hearing nothing, did not know whether your comms had failed or you had, and the standby started to dress.",
      wrongNote: "Line-pull signals on the umbilical — with the comms dead, that is how the tender knows you are all right.",
    },
    {
      id: "current-shift-piles",
      kind: "Current shift on the bottom",
      after: "clean-band", delay: 2, seconds: 14,
      alert: "The current has picked up hard across the bottom — silt is streaming past the piles and your umbilical is bellying away down-current.",
      cue: "Stop the work and take hold of the downline, then tell the supervisor what the current is doing.",
      target: "downline",
      why: "A current shift carries the umbilical off in a belly that pulls the diver with it, and a diver swept off the work under a pier is a diver dragged into the structure. The downline is fixed and it is where the surface expects the diver to be; holding it stops you being carried while the supervisor decides, per the dive plan, whether the dive goes on.",
      missNote: "You kept scraping while the current bellied your umbilical round the second pile; by the time you stopped, it had taken a turn round the brace.",
      wrongNote: "The downline — hold the fixed line first so the current cannot carry you, then report.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------ the piles and brace
    const growthTex = surfaceTexture((cx, w, h) => growthFace(cx, w, h), { px: 512 });
    growthTex.repeat?.set?.(2, 3);
    const pileMat = texturedMat(growthTex, { rough: 0.95, metal: 0.02, color: 0xe6ece0 });
    const pileA = mwppPile(g, -0.8, -0.7, pileMat);
    const pileB = mwppPile(g, 1.2, -1.2, pileMat);
    // A scour mound of silt round the pier's feet.
    const moundTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 3 });
    const mound = cyl(g, 2.4, 2.8, 0.12, 0.2, 0.04, -0.9, 0xffffff, { seg: 28, cast: false });
    mound.material = texturedMat(moundTex, { rough: 1, metal: 0, color: 0xb8c2b0 });
    // Scraped band, spall and rebar on pile A.
    const band = cyl(pileA, 0.35, 0.35, 0.5, 0, 1.15, 0, 0x9aa29c, { rough: 0.9, seg: 18 });
    void band;
    const spall = box(pileA, 0.22, 0.24, 0.08, 0, 1.15, 0.31, 0x6b5a48, { rough: 0.95 });
    for (const dy of [-0.05, 0.06]) cyl(pileA, 0.012, 0.012, 0.22, 0, 1.15 + dy, 0.35, 0xa0502a, { rough: 0.8, metal: 0.4, seg: 6 }).rotation.z = Math.PI / 2;
    reg(hits, spall, "spall-rebar");
    const neck = cyl(pileA, 0.29, 0.31, 0.18, 0, 0.55, 0, 0x5a5f58, { rough: 0.95, emissive: 0x1a1a10, ei: 0.3, seg: 18 });
    reg(hits, neck, "section-loss");
    const bandRing = torus(pileA, 0.44, 0.012, 0, 1.15, 0, MWPP_ACCENT, { emissive: MWPP_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    bandRing.rotation.x = Math.PI / 2;
    holoTag(pileA, "band — scrape here", 0.2, 1.55, 0.4, { css: "#5fd0c0", w: 0.36 });
    reg(hits, bandRing, "pile-band");
    const bareHit = box(pileA, 0.4, 0.3, 0.3, 0.3, 0.85, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pileA, "glove off to feel it?", 0.45, 0.75, 0.45, { css: "#d2312b", w: 0.4 });
    reg(hits, bareHit, "bare-hand-growth");
    // Jacket, split, anode and lead on pile B; the band below the jacket.
    const jacket = cyl(pileB, 0.39, 0.39, 1.6, 0, 2.2, 0, 0xc9c2a8, { rough: 0.6, seg: 18 });
    void jacket;
    const split = box(pileB, 0.04, 0.7, 0.05, -0.2, 2.1, 0.33, 0x2b2b20, { rough: 0.9, emissive: 0x1a1406, ei: 0.3 });
    split.rotation.y = 0.5;
    reg(hits, split, "jacket-split");
    const band2 = group(pileB, 0, 1.0, 0);
    const band2Body = cyl(band2, 0.37, 0.37, 0.35, 0, 0, 0, 0x6f7a62, { rough: 0.95, seg: 18 });
    holoTag(band2, "second band — clean it", 0.1, 0.35, 0.45, { css: "#5fd0c0", w: 0.42 });
    reg(hits, band2, "band-two");
    const anode = group(g, 2.2, 0, -0.4);
    box(anode, 0.5, 0.14, 0.2, 0, 0.07, 0, 0xa3a9ad, { rough: 0.5, metal: 0.65 });
    hose(g, [[1.45, 0.6, -0.95], [1.7, 0.2, -0.7], [1.85, 0.08, -0.55]], 0.012, 0x1b1e22, { steps: 8, rough: 0.7 });
    hose(g, [[2.0, 0.08, -0.48], [2.1, 0.1, -0.42]], 0.012, 0x1b1e22, { steps: 4, rough: 0.7 });
    const leadGap = ball(g, 0.05, 1.92, 0.09, -0.52, 0xc05a2a, { rough: 0.8, emissive: 0x5a1a06, ei: 0.5, seg: 8, seg2: 6 });
    reg(hits, leadGap, "anode-lead-broken");
    // The crossbrace, and the gap inside it a diver must not pass through.
    const brace = cyl(g, 0.12, 0.12, 2.3, 0.2, 2.4, -0.95, 0x3e3a30, { rough: 0.95, seg: 10 });
    brace.rotation.z = Math.PI / 2 - 0.25;
    brace.rotation.y = 0.24;
    const braceHit = box(g, 0.8, 0.9, 0.5, 0.2, 1.7, -0.95, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "through the brace?", 0.2, 1.9, -0.6, { css: "#d2312b", w: 0.38 });
    reg(hits, braceHit, "through-the-brace");
    // A loose timber hanging from the pier deck above.
    const timber = group(g, 2.3, 3.6, 0.4);
    const plank = box(timber, 0.24, 1.8, 0.12, 0, -0.9, 0, 0x4a3a28, { rough: 0.95 });
    void plank;
    cyl(timber, 0.008, 0.008, 0.6, 0, 0.1, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    timber.rotation.z = 0.25;
    const timberHit = box(g, 0.7, 1.0, 0.7, 2.0, 0.9, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "under the loose timber?", 2.0, 1.55, 0.5, { css: "#d2312b", w: 0.44 });
    reg(hits, timberHit, "under-timber");
    const ascentHit = box(g, 0.5, 0.8, 0.5, -1.5, 2.2, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "swim up the pile on your own?", -1.5, 2.7, -0.1, { css: "#d2312b", w: 0.54 });
    reg(hits, ascentHit, "free-ascent");

    // --------------------------------------------- downline and debris
    const downline = group(g, -1.9, 0, 1.0);
    box(downline, 0.4, 0.2, 0.4, 0, 0.1, 0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    cyl(downline, 0.012, 0.012, 8, 0, 4.1, 0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    holoTag(downline, "downline", 0, 1.6, 0, { css: "#5fd0c0", w: 0.22 });
    reg(hits, downline, "downline");
    const tyre = torus(g, 0.3, 0.1, 1.6, 0.08, 1.4, 0x15181c, { rough: 0.9, seg: 8, seg2: 18 });
    tyre.rotation.x = Math.PI / 2 - 0.2;
    for (const [x, z, r] of [[-2.2, -1.6, 0.18], [2.6, 1.2, 0.14], [0.5, 1.8, 0.1], [-1.2, 2.2, 0.16]]) ball(g, r, x, r * 0.4, z, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1, 0.5, 0.8);
    const pallet = group(g, -2.6, 0.05, -0.1, 0.4);
    for (let i = 0; i < 4; i++) box(pallet, 0.9, 0.03, 0.12, 0, 0.06, -0.3 + i * 0.2, 0x5a4a34, { rough: 0.95 });
    for (const x of [-0.35, 0.35]) box(pallet, 0.1, 0.08, 0.8, x, 0.02, 0, 0x4a3a28, { rough: 0.95 });
    // A third pile back in the murk, a crab trap and a run of lost chain.
    const pileC = mwppPile(g, -2.7, -2.4, pileMat);
    void pileC;
    const trap = group(g, 2.4, 0, 1.9, 0.5);
    for (const [w, h, d, x, y, z] of [[0.6, 0.02, 0.02, 0, 0.02, -0.2], [0.6, 0.02, 0.02, 0, 0.02, 0.2], [0.6, 0.02, 0.02, 0, 0.3, -0.2], [0.6, 0.02, 0.02, 0, 0.3, 0.2],
      [0.02, 0.3, 0.02, -0.3, 0.16, -0.2], [0.02, 0.3, 0.02, 0.3, 0.16, -0.2], [0.02, 0.3, 0.02, -0.3, 0.16, 0.2], [0.02, 0.3, 0.02, 0.3, 0.16, 0.2]]) box(trap, w, h, d, x, y, z, 0x6a7a5a, { rough: 0.8, metal: 0.3 });
    box(trap, 0.58, 0.28, 0.38, 0, 0.16, 0, 0x3a4a32, { rough: 0.9, opacity: 0.35, transparent: true, cast: false });
    for (let i = 0; i < 7; i++) {
      const link = torus(g, 0.06, 0.018, -2.2 + i * 0.13, 0.03, 1.9 - i * 0.05, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    // A few fish holding station in the lee of the piles.
    const school = group(g, 0.4, 2.2, -2.2);
    for (let i = 0; i < 8; i++) {
      const f = group(school, (i % 4) * 0.35 - 0.5, Math.floor(i / 4) * 0.25, (i % 3) * 0.2);
      ball(f, 0.06, 0, 0, 0, 0x8aa0a8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
      box(f, 0.05, 0.06, 0.01, -0.14, 0, 0, 0x6a8088, { rough: 0.5 });
    }
    // Mussel beds along the scour mound.
    for (let i = 0; i < 10; i++) {
      const a = i * 0.63;
      ball(g, 0.07 + (i % 3) * 0.02, 0.2 + Math.cos(a) * 1.9, 0.08, -0.9 + Math.sin(a) * 1.9, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.4, 0.6, 1);
    }
    // Anemones and starfish on the pile feet.
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3;
      cyl(g, 0.05, 0.03, 0.08, -0.8 + Math.cos(a) * 0.55, 0.04, -0.7 + Math.sin(a) * 0.55, [0xe86a8a, 0xf2a03d, 0xe8e2d0][i % 3], { rough: 0.7, seg: 8 });
    }

    // ------------------------------------------ umbilical, pneumo, stage
    const umb = hose(g, [[-3.6, 1.2, 2.5], [-2.8, 0.25, 2.0], [-1.2, 0.2, 1.5], [0.1, 0.25, 1.0], [0.45, 0.9, 0.7]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    void umb;
    const harness = group(g, 0.45, 0.95, 0.68);
    torus(harness, 0.06, 0.014, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 14 });
    box(harness, 0.05, 0.12, 0.03, 0, -0.1, 0, 0x2b3138, { rough: 0.6 });
    const harnessClip = box(harness, 0.04, 0.05, 0.03, 0.05, 0.05, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(harness, "umbilical to harness", 0, 0.2, 0, { css: "#5fd0c0", w: 0.38 });
    reg(hits, harness, "umbilical-harness");
    const signal = group(g, -1.3, 0.25, 1.52);
    const sigSlack = hose(signal, [[-0.3, 0, 0], [0, 0.15, 0.05], [0.3, 0, 0]], 0.03, 0xf2c14b, { steps: 6, rough: 0.8 });
    const sigTaut = hose(signal, [[-0.3, 0, 0], [0, 0.02, 0], [0.3, 0, 0]], 0.03, 0xe8b02e, { steps: 6, rough: 0.8 });
    sigTaut.visible = false;
    holoTag(signal, "line-pull signals", 0, 0.3, 0, { css: "#5fd0c0", w: 0.32 });
    reg(hits, signal, "umbilical-signal");
    const pneumo = group(g, 0.1, 1.15, -0.25);
    cyl(pneumo, 0.012, 0.012, 0.3, 0, 0, 0, 0x2b5aa8, { rough: 0.6, seg: 6 }).rotation.z = 1.2;
    const pneumoTip = cyl(pneumo, 0.02, 0.02, 0.05, 0.14, 0.05, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    void pneumoTip;
    holoTag(pneumo, "pneumo end", 0, 0.16, 0, { css: "#5fd0c0", w: 0.24 });
    reg(hits, pneumo, "pneumo-end");
    hose(g, [[0.45, 0.9, 0.7], [0.3, 1.1, 0.2], [0.1, 1.15, -0.25]], 0.01, 0x2b5aa8, { steps: 8, rough: 0.6 });
    // The scraper and the tool bag hang on the district's stage rail.
    const scraper = group(g, -3.45, 1.05, 2.45);
    box(scraper, 0.04, 0.4, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    box(scraper, 0.14, 0.05, 0.02, 0, -0.22, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    cyl(scraper, 0.005, 0.005, 0.3, 0, 0.35, 0, 0xe8b02e, { rough: 0.7, seg: 4 });
    holoTag(scraper, "scraper — on the stage", 0, 0.34, 0.05, { css: "#5fd0c0", w: 0.42 });
    reg(hits, scraper, "scraper");
    const toolBag = group(g, -0.3, 0.1, 0.4);
    box(toolBag, 0.3, 0.2, 0.18, 0, 0.1, 0, 0x2f4f6f, { rough: 0.85 });
    box(toolBag, 0.26, 0.03, 0.03, 0, 0.24, 0, 0x15181c, { rough: 0.7 });
    holoTag(toolBag, "tool bag", 0, 0.42, 0, { css: "#5fd0c0", w: 0.22 });
    reg(hits, toolBag, "tool-bag");
    const rail = group(g, -3.5, 1.4, 2.0);
    const railRing = torus(rail, 0.2, 0.01, 0, 0, 0, MWPP_ACCENT, { emissive: MWPP_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    void railRing;
    holoTag(rail, "stage rail", 0, 0.3, 0, { css: "#5fd0c0", w: 0.22 });
    reg(hits, rail, "stage-rail");

    // ------------------------------------------------- inspection kit
    const caliper = group(g, -0.3, 0.7, -0.35);
    box(caliper, 0.5, 0.03, 0.02, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    for (const x of [-0.24, 0.24]) box(caliper, 0.02, 0.2, 0.02, x, -0.1, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    holoTag(caliper, "caliper", 0, 0.14, 0, { css: "#5fd0c0", w: 0.2 });
    reg(hits, caliper, "caliper");
    const scale = group(g, -0.45, 1.5, -0.25, 0.4);
    for (let i = 0; i < 6; i++) box(scale, 0.05, 0.04, 0.01, -0.125 + i * 0.05, 0, 0, i % 2 ? 0x1b1e22 : 0xf1f3f4, { rough: 0.5 });
    holoTag(scale, "scale bar", 0, 0.12, 0, { css: "#5fd0c0", w: 0.22 });
    reg(hits, scale, "scale-bar");
    const camera = group(g, 0.6, 1.35, 0.3, -0.5);
    box(camera, 0.2, 0.14, 0.12, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const lens = cyl(camera, 0.05, 0.05, 0.06, 0, 0, -0.08, 0x274a5f, { rough: 0.1, metal: 0.5, seg: 12 });
    lens.rotation.x = Math.PI / 2;
    const strobe = ball(camera, 0.04, 0.14, 0.08, -0.04, 0xeaf6fb, { rough: 0.3, emissive: 0x4a5a60, ei: 0.3, seg: 8, seg2: 6 });
    holoTag(camera, "camera", 0, 0.18, 0, { css: "#5fd0c0", w: 0.2 });
    reg(hits, camera, "uw-camera");
    const slate = decal(g, 0.26, 0.2, 1.1, 1.05, 0.55, paperFace("SLATE", ["Pile A: spall, section", "Pile B: jacket, anode", "Timber overhead"], { bg: "#e8eef0", band: "#5fd0c0" }), { px: 192 });
    slate.rotation.y = -0.4;
    holoTag(g, "your slate", 1.1, 1.24, 0.55, { css: "#5fd0c0", w: 0.22 });
    reg(hits, slate, "diver-slate");

    // --------------------------------------------- the diver's helmet HUD
    const comms = holoPanel(g, 0.5, 0.3, 1.55, 1.6, 1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(6,20,22,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5fd0c0"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f6f2"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.24);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`; cx.fillStyle = "#eaf8f6";
      ["Supervisor · topside", "Press to talk"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.55 + i * 0.22)));
    }, { ry: -0.5, accent: MWPP_ACCENT });
    reg(hits, comms, "diver-comms");
    const commsLamp = ball(g, 0.03, 1.82, 1.72, 1.35, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    const noComms = holoTag(g, "no comms", 1.55, 1.85, 1.22, { css: "#d2312b", w: 0.24 });
    noComms.visible = false;
    const sideBlock = group(g, 1.95, 1.2, 0.95, -0.6);
    box(sideBlock, 0.16, 0.12, 0.08, 0, 0, 0, 0xc8a24a, { rough: 0.35, metal: 0.6 });
    const ffKnob = group(sideBlock, 0.1, 0, 0);
    cyl(ffKnob, 0.04, 0.04, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(ffKnob, 0.01, 0.06, 0.012, 0.018, 0, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(sideBlock, "helmet free-flow", 0, 0.16, 0, { css: "#5fd0c0", w: 0.32 });
    reg(hits, sideBlock, "free-flow-valve");
    const fog = box(g, 0.5, 0.3, 0.01, 1.55, 1.6, 1.26, 0xdfe8ee, { rough: 0.3, opacity: 0.35, transparent: true, cast: false });
    fog.rotation.y = -0.5;

    // ------------------------------------------ the current, for the shift
    const streamers = group(g, 0, 0.4, 0);
    for (let i = 0; i < 7; i++) { const s = box(streamers, 1.2, 0.01, 0.04, -2.4 + (i % 4) * 1.4, (i % 3) * 0.5, -1.6 + i * 0.5, 0xb8e0d8, { rough: 0.4, emissive: 0x6aa8a0, ei: 0.5, cast: false }); s.rotation.y = 0.2; }
    streamers.visible = false;

    const bandRingHome = bandRing.material;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.2, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "umbilical-check") harnessClip.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "scraper-down") { scraper.position.set(-0.4, 1.15, -0.25); scraper.rotation.z = 0.6; }
        if (step.id === "pile-one") spall.material = mat(0x8a3a1a, { rough: 0.95, emissive: 0x3a1206, ei: 0.4 });
        if (step.id === "clear-faceplate") fog.visible = false;
        if (step.id === "clean-band") band2Body.material = mat(0x9aa29c, { rough: 0.9 });
        if (step.id === "photograph") strobe.material = mat(0xffffff, { emissive: 0xffffff, ei: 1.5 });
        if (step.id === "tools-up") { toolBag.position.set(-3.5, 1.1, 2.0); scraper.position.set(-3.45, 1.05, 2.45); scraper.rotation.z = 0; bandRing.material = bandRingHome; }
        if (step.id === "findings-up") repaint(slate, paperFace("SLATE — READ UP", ["Pile A: spall, section measured", "Pile B: jacket split, lead parted", "Timber overhead — reported"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "comms-dead-bottom") { noComms.visible = true; commsLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 }); }
        if (it.id === "current-shift-piles") { streamers.visible = true; timber.rotation.z = 0.5; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "comms-dead-bottom") { noComms.visible = false; sigSlack.visible = false; sigTaut.visible = true; commsLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (it.id === "current-shift-piles") { timber.rotation.z = 0.25; streamers.rotation.y = 0.15; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "clear-faceplate") ffKnob.rotation.x = session.turn.amount * Math.PI * 2;
        if (streamers.visible) streamers.position.x = ((t * 0.5) % 1.4) - 0.7;
        timber.rotation.x = Math.sin(t * 0.7) * 0.04;
        if (step?.id === "clean-band" && session.holding) band2.rotation.y += (dt ?? 0.016) * 1.5 * (session.track?.v ?? 0);
        void CITY; void pileB; void signFace; void repaint;
        school.position.x = 0.4 + Math.sin(t * 0.3) * 0.3;
      },
    };
  },
};
