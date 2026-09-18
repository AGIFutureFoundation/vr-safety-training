import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, hose, group, decal, repaint, signFace, paperFace } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, valveWheel, pipeRun, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bunkering Watch VR — Maritime & Ports, station four.
// A fuel-oil transfer from a bunker barge, run by the person in charge on
// the ship's deck: the plan and the signed declaration of inspection, the
// deck contained before the hose comes aboard, the flange bolted all round,
// comms and the emergency stop proven, the line-up from the tank back to
// the manifold, a slow start while the deck is walked, soundings against
// the plan, topping off at a reduced rate, the manifold closed, and the
// sample sealed and the delivery note signed.

const BW_ACCENT = 0x3fa9d8;

export const SIM_BUNKERING_WATCH = {
  id: "bunkering-watch",
  index: "41",
  domain: "Maritime & Ports",
  trade: "Marine engineer — person in charge of oil transfer",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "MEBA / SIU / MM&P — USCG 33 CFR 155.710 person in charge of oil transfer; 33 CFR 156.150 declaration of inspection; MARPOL Annex VI bunker delivery note and sample (Reg. 18); ISGOTT ship/barge bunkering checklist; STCW A-VI/1",
  name: "Bunkering Watch",
  title: simTitle("Bunkering Watch"),
  tagline: "Fuel-oil transfer: plan and signed DOI, scuppers plugged and drip tray and SOPEP kit set, flange bolted all round, radio and emergency stop tested, line-up tank-first, slow start, soundings, topping off at reduced rate, manifold closed, sample sealed, BDN signed",
  accent: BW_ACCENT,
  accentCss: "#3fa9d8",
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "not-a-drop", name: "Not a Drop", note: "A transfer with the deck contained before the hose, every bolt in, a slow start, and topping off at the reduced rate — first time" },

  game: system({
    name: "Engine Department",
    currency: "TONNE",
    ranks: ["Wiper", "Oiler", "Third Engineer", "Second Engineer", "Chief Engineer Certified"],
    badges: [
      { id: "deck-contained", name: "Deck Contained", note: "Scuppers, tray and kit set before the hose came aboard, first time", test: AWARD.stepClean("containment") },
      { id: "no-spill", name: "No Spill", note: "Never started uncontained, never topped off at full rate, never a phone on the tank deck", test: AWARD.safe },
      { id: "sounded-true", name: "Sounded True", note: "Sounding and topping rate both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-transfer", name: "Clean Transfer", note: "No corrections anywhere in the transfer", test: AWARD.clean },
      { id: "slow-start-held", name: "Slow Start Held", note: "Initial rate held low the whole walk-round", test: AWARD.unbroken },
      { id: "bunkered-fast", name: "Bunkered In Time", note: "Transfer complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "start-uncontained": "You started the transfer with a scupper open. The first thing a hose does when a flange weeps is put oil on the deck, and an open scupper puts that oil in the harbour: a reportable spill, a detained ship and a cleanup bill by the tonne.",
    "no-doi": "You started pumping because the barge said 'go'. The declaration of inspection is the two persons in charge agreeing on the tanks, the quantity, the rate, the signals and the stop — without it, nobody has agreed on anything.",
    "topping-full-rate": "You topped off at full rate. A tank that is 90 percent full takes two minutes to overflow at the transfer rate; the vent goes first, then the deck, then the water. Topping off is done slow, sounding every minute.",
    "phone-on-deck": "You used a phone on the tank deck during transfer. Vents are breathing fuel vapour a few metres from you; only intrinsically safe equipment is allowed in the hazardous zone while bunkering.",
  },

  lateNotes: {
    "transfer-rate": "The transfer starts only after the DOI is signed, the deck is contained, the hose is bolted all round and the emergency stop is proven.",
    "topping-rate": "Topping off comes when the sounding says the tank is near full — not before, and never at the full rate.",
    "manifold-wheel": "The manifold is closed at the end of the transfer, after the barge has stopped and the line has been blown — not while the pump is running.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "bunker-plan",
      title: "Read the bunker plan",
      cue: "Check the tanks, the quantity, the rate, the sequence and the ullages.",
      why: "The plan is how much goes where and in what order so the ship stays in trim and no tank is filled past 90 percent. Everything the barge does is measured against it.",
    },
    {
      id: "doi", kind: "select", target: "doi-form",
      title: "Sign the declaration of inspection",
      cue: "Go through the DOI with the barge person in charge and both sign it.",
      why: "The DOI is the law's checklist: both persons in charge confirm the hose, the connections, the comms, the signals, the emergency stop and the quantity before a drop moves. It is signed, not assumed.",
    },
    {
      id: "containment", kind: "sequence", anyOrder: true,
      targets: ["scupper-plugs", "drip-tray", "sopep-kit"],
      itemNames: { "scupper-plugs": "scupper plugs", "drip-tray": "manifold drip tray", "sopep-kit": "SOPEP kit staged" },
      title: "Contain the deck",
      cue: "Plug every scupper, set the drip tray under the manifold, and stage the SOPEP spill kit — before the hose comes aboard.",
      why: "The deck is the containment. Plugged scuppers keep a spill on board; the tray takes the drips a flange always makes; the kit is what turns a spill into a mop-up instead of a report.",
    },
    {
      id: "hose", kind: "sequence",
      targets: ["hose-flange", "bolt-all", "blank-off"],
      itemNames: { "hose-flange": "hose flange landed", "bolt-all": "every bolt hole filled", "blank-off": "unused manifold blanked" },
      title: "Connect the hose",
      cue: "Land the hose flange on the manifold with a new gasket, fill every bolt hole, and blank the unused manifold connection.",
      why: "Half the bolts hold a flange until the pump surges. The unused manifold is blanked because a valve is not a blank, and a valve left cracked open on an unblanked branch is a spill nobody sees start.",
      outOfOrderNote: "Flange landed, then every bolt, then the blank — the connection is made before the branch is closed off.",
    },
    {
      id: "comms", kind: "sequence", anyOrder: true,
      targets: ["radio-test", "estop-test"],
      itemNames: { "radio-test": "radio check with the barge", "estop-test": "emergency stop tested" },
      title: "Prove comms and the emergency stop",
      cue: "Radio check with the barge on the agreed channel, and test the emergency stop signal end to end.",
      why: "The one thing that must work during a transfer is 'stop'. It is tested before the pump starts, because testing it after is a spill.",
    },
    {
      id: "lineup", kind: "sequence",
      targets: ["tank-valve", "manifold-valve"],
      itemNames: { "tank-valve": "receiving tank valve", "manifold-valve": "manifold valve" },
      title: "Line up tank-first",
      cue: "Open the receiving tank's filling valve first, then the manifold valve last.",
      why: "The line is opened from the tank back to the manifold so there is always somewhere for the oil to go. A manifold opened onto a closed tank valve is a hose at pump pressure with no outlet.",
      outOfOrderNote: "Tank valve first, manifold last — the destination is open before the source.",
    },
    {
      id: "start", kind: "track", target: "transfer-rate", seconds: 6,
      title: "Slow start and walk the deck",
      cue: "Signal the barge to start at minimum rate and hold it there while the hose, the flange and the deck are walked for leaks.",
      why: "The first minutes are at a rate a drip tray can hold. The full rate is agreed only after the whole line has been seen under pressure and is dry.",
      track: { start: 0.1, green: [0.28, 0.48], rise: 0.6, fall: 0.5, drift: 0.12, label: "RATE", readout: (v) => (v < 0.28 ? "no flow" : v > 0.48 ? "too fast for a walk-round" : "minimum rate") },
      holdBreakNote: "Rate out of band during the walk-round — bring it back to minimum and hold.",
    },
    {
      id: "sounding", kind: "gauge", target: "sounding-tape",
      title: "Take a sounding",
      cue: "Sound the receiving tank and commit when the reading matches the plan's expected level.",
      why: "The barge's meter is the barge's number. The ship's number is the sounding, taken by hand, and the two are compared every fifteen minutes. A sounding that does not match the plan is a stop.",
      gauge: { label: "TANK LEVEL", speed: 0.7, green: [0.5, 0.62], readout: (t) => `${Math.round(t * 100)} %`, missNote: "Sounding does not match the plan — stop the transfer and investigate before the next tonne." },
    },
    {
      id: "topping", kind: "gauge", target: "topping-rate",
      title: "Top off at reduced rate",
      cue: "At 85 percent, signal the barge to reduce, and commit at the topping-off rate.",
      why: "Topping off is the overflow hazard. The rate comes down so a sounding every minute stays ahead of the tank, and the tank stops at 90 percent, never full.",
      gauge: { label: "TOPPING RATE", speed: 0.75, green: [0.2, 0.36], readout: (t) => `${Math.round(t * 200)} t/h`, missNote: "Too fast to top off — reduce further before the tank gets ahead of the soundings." },
    },
    {
      id: "close", kind: "turn", target: "manifold-wheel",
      title: "Close the manifold",
      cue: "After the barge stops and blows the line, close the manifold valve.",
      why: "The line is blown clear before the manifold closes so the hose is drained back to the barge and not onto the deck at disconnection.",
      turn: { turns: 1, axis: "y", label: "MANIFOLD" },
    },
    {
      id: "sample", kind: "sequence",
      targets: ["drip-sample", "seal-sample", "sign-bdn"],
      itemNames: { "drip-sample": "continuous drip sample", "seal-sample": "sample sealed and labelled", "sign-bdn": "bunker delivery note signed" },
      title: "Seal the sample and sign the BDN",
      cue: "Take the continuous drip sample from the manifold cock, seal and label it with both signatures, then sign the bunker delivery note.",
      why: "The MARPOL sample is the ship's evidence of what it was sold; the BDN is the receipt. Both are kept aboard for a year and inspected at the next port.",
      outOfOrderNote: "Sample, then seal, then sign — the sample is secured before the paperwork closes the transfer.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["scupper-open"],
      itemNames: { "scupper-open": "dislodged scupper plug" },
      itemNotes: { "scupper-open": "One scupper plug has been knocked out — the deck was open to the harbour for the last part of the transfer." },
      title: "Walk the deck before the hose comes off",
      cue: "Check every scupper, the tray and the flange, and click what is not as it was set.",
      why: "The disconnection is the last chance to spill. The deck is walked again before the flange is broken, because a plug that walked out during the transfer is found now or on the water.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BW_ACCENT);
    box(g, 6.0, 0.1, 5.4, 0, 0.05, 0, 0x3c4a3f, { rough: 0.9 });
    // Ship's side rail at -z with the barge alongside, lower and beyond.
    for (let i = -6; i <= 6; i++) cyl(g, 0.02, 0.02, 1.0, i * 0.5, 0.6, -2.4, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    box(g, 6.2, 0.04, 0.04, 0, 1.1, -2.4, 0x8b98a5, { rough: 0.5, metal: 0.6 });
    const barge = group(g, 0, -1.4, -4.6);
    box(barge, 7.0, 1.2, 3.0, 0, 0.6, 0, 0x2f3a44, { rough: 0.8 });
    box(barge, 1.6, 1.2, 1.4, 2.4, 1.8, 0.4, 0x8a8f96, { rough: 0.7 });
    box(barge, 1.4, 0.4, 1.42, 2.4, 2.2, 0.4, 0xffe9a8, { emissive: 0xffe9a8, ei: 0.8, rough: 0.4, cast: false });
    cyl(barge, 0.5, 0.5, 1.0, -1.5, 1.7, 0, 0x4a5561, { rough: 0.7, seg: 16 });
    holoTag(barge, "bunker barge — PIC on deck", 0, 3.0, 0.6, { css: "#3fa9d8", w: 0.46 });
    // Scuppers along the deck edge with plugs; one gets knocked out for the walk-down.
    const scuppers = [];
    for (const x of [-2.2, -0.8, 0.8, 2.2]) {
      const s = group(g, x, 0.1, -2.1);
      box(s, 0.24, 0.02, 0.16, 0, 0.005, 0, 0x1b1e23, { rough: 0.7 });
      const plug = cyl(s, 0.07, 0.09, 0.05, 0, 0.03, 0, 0xf2c14b, { rough: 0.8, seg: 12 });
      plug.visible = false; scuppers.push(plug);
      reg(hits, s, x === -2.2 ? "scupper-plugs" : `scupper-${x}`);
    }
    holoTag(g, "scuppers — plug all four", -2.2, 0.4, -2.1, { css: "#3fa9d8", w: 0.4 });
    const openHit = box(g, 0.3, 0.2, 0.3, 2.2, 0.15, -2.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, openHit, "scupper-open");
    // Manifold: pipe from the tank deck, two flanges, valves, drip tray, sample cock.
    const manifold = group(g, -0.6, 0.1, -1.4);
    pipeRun(manifold, [[-1.6, 0.7, 0.6], [-0.4, 0.7, 0.6], [0.6, 0.7, 0.2], [0.6, 0.7, -0.5]], 0.09, 0x7b8a86, { flanges: [[0.6, 0.7, -0.5]] });
    const tankValve = valveWheel(manifold, -1.2, 0.95, 0.6, { color: 0xd2312b, body: 0x2b2f34, r: 0.11 });
    holoTag(manifold, "tank filling valve — No. 3 P", -1.2, 1.35, 0.6, { css: "#3fa9d8", w: 0.46 });
    reg(hits, tankValve, "tank-valve");
    const manValve = valveWheel(manifold, 0.6, 0.95, -0.1, { color: 0xd2312b, body: 0x2b2f34, r: 0.11 });
    holoTag(manifold, "manifold valve", 0.6, 1.35, -0.1, { css: "#3fa9d8", w: 0.28 });
    reg(hits, manValve, "manifold-valve");
    const manWheel = valveWheel(manifold, 0.6, 0.95, -0.45, { color: 0x3fa9d8, body: 0x2b2f34, r: 0.09 });
    holoTag(manifold, "manifold — close", 0.6, 1.25, -0.45, { css: "#3fa9d8", w: 0.3 });
    reg(hits, manWheel, "manifold-wheel");
    const flange = cyl(manifold, 0.16, 0.16, 0.06, 0.6, 0.7, -0.62, 0x8b98a5, { rough: 0.4, metal: 0.7, seg: 16 });
    flange.rotation.x = Math.PI / 2;
    reg(hits, flange, "hose-flange");
    holoTag(manifold, "hose flange", 0.6, 0.45, -0.62, { css: "#3fa9d8", w: 0.24 });
    const bolts = [];
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const b = cyl(manifold, 0.014, 0.014, 0.08, 0.6 + Math.cos(a) * 0.12, 0.7 + Math.sin(a) * 0.12, -0.62, 0xdfe6ec, { rough: 0.4, metal: 0.8, seg: 6 }); b.rotation.x = Math.PI / 2; b.visible = i < 4; bolts.push(b); }
    const boltHit = box(manifold, 0.36, 0.36, 0.14, 0.6, 0.7, -0.75, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(manifold, "every bolt hole", 0.6, 1.0, -0.8, { css: "#3fa9d8", w: 0.28 });
    reg(hits, boltHit, "bolt-all");
    const blankBranch = cyl(manifold, 0.09, 0.09, 0.5, 1.1, 0.7, 0.2, 0x7b8a86, { rough: 0.5, metal: 0.6, seg: 14 });
    blankBranch.rotation.z = Math.PI / 2;
    const blank = cyl(manifold, 0.16, 0.16, 0.04, 1.37, 0.7, 0.2, 0xd2312b, { rough: 0.5, metal: 0.6, seg: 16 });
    blank.rotation.z = Math.PI / 2; blank.visible = false;
    const blankPick = cyl(manifold, 0.16, 0.16, 0.04, 1.6, 0.25, 0.8, 0xd2312b, { rough: 0.5, metal: 0.6, seg: 16 });
    holoTag(manifold, "blank flange", 1.6, 0.5, 0.8, { css: "#3fa9d8", w: 0.24 });
    reg(hits, blankPick, "blank-off");
    const bargeHose = hose(g, [[0.0, 0.8, -2.15], [0.2, 0.9, -2.8], [0.6, 0.5, -3.6], [1.2, -0.3, -4.2]], 0.07, 0x1b1e23, { steps: 20, rough: 0.8 });
    bargeHose.visible = false;
    const tray = box(g, 1.2, 0.08, 0.8, 0.0, 0.14, -1.9, 0x2b2f34, { rough: 0.7, metal: 0.4 });
    tray.visible = false;
    const trayPick = box(g, 1.2, 0.08, 0.8, 2.0, 0.14, 0.8, 0x2b2f34, { rough: 0.7, metal: 0.4 });
    holoTag(g, "drip tray", 2.0, 0.4, 0.8, { css: "#3fa9d8", w: 0.2 });
    reg(hits, trayPick, "drip-tray");
    const sopep = group(g, 2.4, 0.1, -0.6);
    box(sopep, 0.7, 0.7, 0.5, 0, 0.35, 0, 0xf2c14b, { rough: 0.6 });
    decal(sopep, 0.5, 0.2, 0, 0.4, 0.251, signFace("SOPEP", { bg: "#1b1608", accent: "#f2c14b", scale: 0.6 }));
    holoTag(sopep, "spill kit — stage at manifold", 0, 0.9, 0, { css: "#3fa9d8", w: 0.46 });
    reg(hits, sopep, "sopep-kit");
    const sampleCock = cyl(manifold, 0.02, 0.02, 0.12, 0.3, 0.6, -0.35, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 8 });
    const bottle = cyl(manifold, 0.035, 0.035, 0.14, 0.3, 0.45, -0.35, 0x8fd8ff, { rough: 0.2, opacity: 0.6, transparent: true, seg: 12 });
    holoTag(manifold, "drip sampler", 0.3, 0.3, -0.35, { css: "#3fa9d8", w: 0.24 });
    reg(hits, bottle, "drip-sample");
    void sampleCock;
    const sealPick = box(g, 0.14, 0.04, 0.1, 1.5, 0.87, 1.4, 0xd2312b, { rough: 0.6 });
    // Console table: DOI, BDN, radio, e-stop, phone, sounding tape, rate readouts, plan.
    const table = group(g, 1.4, 0.1, 1.4, -0.3);
    box(table, 1.6, 0.8, 0.7, 0, 0.4, 0, 0x4a5561, { rough: 0.7, metal: 0.3 });
    const doi = decal(table, 0.36, 0.48, -0.5, 0.815, 0.05, paperFace("DECLARATION OF INSPECTION", ["Vessel / barge PICs", "Product: VLSFO 380", "Quantity: 420 t", "Rate: 150 t/h max", "Emergency stop: radio + horn", "Signed: ______  ______"], { scale: 0.9 }));
    doi.rotation.x = -Math.PI / 2;
    holoTag(table, "DOI — sign with the barge", -0.5, 1.05, 0.05, { css: "#3fa9d8", w: 0.42 });
    reg(hits, doi, "doi-form");
    const bdn = decal(table, 0.36, 0.48, 0.0, 0.815, 0.05, paperFace("BUNKER DELIVERY NOTE", ["Supplier / barge", "Quantity delivered", "Density @ 15 °C", "Sulphur % (MARPOL VI)", "Sample seal no.", "Chief Engineer: ______"], { scale: 0.9 }));
    bdn.rotation.x = -Math.PI / 2;
    holoTag(table, "BDN — sign", 0.0, 1.05, 0.05, { css: "#3fa9d8", w: 0.22 });
    reg(hits, bdn, "sign-bdn");
    holoTag(g, "seal and label", 1.5, 1.05, 1.4, { css: "#3fa9d8", w: 0.26 });
    reg(hits, sealPick, "seal-sample");
    const radio = box(table, 0.07, 0.16, 0.04, 0.55, 0.88, -0.2, 0x1b1e23, { rough: 0.6 });
    holoTag(table, "radio — barge on ch. 12", 0.55, 1.12, -0.2, { css: "#3fa9d8", w: 0.4 });
    reg(hits, radio, "radio-test");
    const estop = group(table, 0.55, 0.8, 0.2);
    box(estop, 0.16, 0.16, 0.08, 0, 0.08, 0, 0xf2c14b, { rough: 0.6 });
    cyl(estop, 0.05, 0.05, 0.05, 0, 0.16, 0, 0xd2312b, { rough: 0.5, seg: 16 });
    holoTag(estop, "emergency stop — test", 0, 0.35, 0, { css: "#3fa9d8", w: 0.4 });
    reg(hits, estop, "estop-test");
    const phone = box(table, 0.07, 0.14, 0.01, -0.2, 0.81, 0.28, 0x1b1e23, { rough: 0.3, metal: 0.4 });
    holoTag(table, "phone on deck?", -0.2, 1.0, 0.28, { css: "#d2312b", w: 0.28 });
    reg(hits, phone, "phone-on-deck");
    const rate = instrument(table, 0.3, 0.82, -0.25, { idle: "0 t/h", color: 0x3fa9d8, w: 0.13, d: 0.2 });
    holoTag(table, "transfer rate — signal barge", 0.3, 1.02, -0.25, { css: "#3fa9d8", w: 0.46 });
    reg(hits, rate, "transfer-rate");
    const topping = instrument(table, 0.3, 0.82, 0.25, { idle: "-- t/h", color: 0x3fa9d8, w: 0.13, d: 0.2 });
    holoTag(table, "topping rate", 0.3, 1.02, 0.25, { css: "#3fa9d8", w: 0.26 });
    reg(hits, topping, "topping-rate");
    const noDoi = box(table, 0.2, 0.2, 0.2, -0.75, 0.95, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "barge says go — start?", -0.75, 1.15, -0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, noDoi, "no-doi");
    const fullRate = box(table, 0.2, 0.2, 0.2, 0.8, 0.95, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "full rate to the top?", 0.8, 1.15, 0.35, { css: "#d2312b", w: 0.38 });
    reg(hits, fullRate, "topping-full-rate");
    const uncontained = box(g, 0.24, 0.24, 0.24, -1.8, 0.95, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "start pumping now?", -1.8, 1.2, -1.6, { css: "#d2312b", w: 0.36 });
    reg(hits, uncontained, "start-uncontained");
    // Sounding pipe and tape.
    const sounding = group(g, -2.2, 0.1, 0.6);
    cyl(sounding, 0.06, 0.06, 0.5, 0, 0.25, 0, 0x7b8a86, { rough: 0.6, metal: 0.5, seg: 12 });
    const tape = instrument(sounding, 0, 0.55, 0, { idle: "-- %", color: 0x3fa9d8, w: 0.13, d: 0.2 });
    holoTag(sounding, "sounding pipe — No. 3 P", 0, 0.85, 0, { css: "#3fa9d8", w: 0.42 });
    reg(hits, tape, "sounding-tape");
    // Plan board and the PIC.
    const board = group(g, -1.6, 0, 2.0, 0.3);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#08161e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#3fa9d8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d6eefb"; ctx.fillText("BUNKER PLAN — VLSFO 420 t", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eaf6fb";
      ["No. 3 P then No. 3 S; stop at 90 %", "Rate: start 30 t/h, max 150 t/h, top 50 t/h", "Sound every 15 min; every 1 min topping", "Scuppers plugged; tray; SOPEP at manifold", "DOI signed by both PICs before start", "Sample: continuous drip, sealed, 2 signatures", "Emergency stop: radio 'STOP STOP STOP' + horn"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: BW_ACCENT });
    reg(hits, board, "bunker-plan");
    const pic = standingFigure(g, 2.4, 1.9, { ry: -2.2, cloth: 0x1f3a52 });
    holoTag(pic, "ship's PIC", 0, 1.9, 0, { css: "#3fa9d8", w: 0.2 });

    let flowing = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 0.9, -1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "containment") { for (const p of scuppers) p.visible = true; tray.visible = true; trayPick.visible = false; }
        if (step.id === "hose") { bargeHose.visible = true; for (const b of bolts) b.visible = true; blank.visible = true; blankPick.visible = false; }
        if (step.id === "start") flowing = true;
        if (step.id === "close") flowing = false;
        if (step.id === "sample") { scuppers[3].visible = false; }
        if (step.id === "walk") { scuppers[3].visible = true; openHit.visible = false; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "containment") { if (session.sequence.includes("scupper-plugs")) for (const p of scuppers) p.visible = true; if (session.sequence.includes("drip-tray")) { tray.visible = true; trayPick.visible = false; } }
        if (step?.id === "hose") { if (session.sequence.includes("hose-flange")) bargeHose.visible = true; if (session.sequence.includes("bolt-all")) for (const b of bolts) b.visible = true; }
        if (step?.id === "lineup") { if (session.sequence.includes("tank-valve")) tankValve.rotation.y = -Math.PI * 2; if (session.sequence.includes("manifold-valve")) manValve.rotation.y = -Math.PI * 2; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "sounding") repaint(tape.userData.screen, signFace(`${Math.round(gg.t * 100)} %`, { bg: "#08161e", accent: gg.t >= 0.5 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#eaf6fb", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "topping") repaint(topping.userData.screen, signFace(`${Math.round(gg.t * 200)} t/h`, { bg: "#08161e", accent: gg.t >= 0.2 && gg.t <= 0.36 ? "#59c97b" : "#f2ae14", fg: "#eaf6fb", scale: 0.62 }));
        if (step?.id === "start" && session.holding) repaint(rate.userData.screen, signFace(`${Math.round(session.track.v * 100)} t/h`, { bg: "#08161e", accent: session.track.v >= 0.28 && session.track.v <= 0.48 ? "#59c97b" : "#f2ae14", fg: "#eaf6fb", scale: 0.62 }));
        if (session?.turn && step?.id === "close") manWheel.rotation.y = -session.turn.amount * Math.PI * 2;
        bargeHose.position.y = flowing ? Math.sin(t * 6) * 0.01 : 0;
      },
    };
  },
};
