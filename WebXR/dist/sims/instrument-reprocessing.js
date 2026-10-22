import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Instrument Reprocessing VR — Dental & Oral Health, station two.
// The sterilization centre a hygienist's cassette passes through between
// patients: mechanical cleaning in the ultrasonic rather than a hand scrub,
// inspection under magnification, packaging with its own chemical indicator,
// an autoclave cycle read from its own printout rather than trusted on faith,
// and the weekly biological indicator that is the only proof any of it
// actually worked.

const IR_ACCENT = 0x6fc9a0;

export const SIM_INSTRUMENT_REPROCESSING = {
  id: "instrument-reprocessing",
  index: "117",
  domain: "Dental Hygiene",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "The CDC's Guidelines for Infection Control in Dental Health-Care Settings (2003) and its 2016 Summary; ANSI/AAMI ST79 for steam sterilization in health care facilities; the FDA-cleared reprocessing instructions that ship with a reusable dental device; OSHA 29 CFR 1910.1030 bloodborne pathogens; the Dental Hygiene Board of California practice act",
  name: "Instrument Reprocessing",
  title: simTitle("Instrument Reprocessing"),
  tagline: "Sterilization centre: mechanical cleaning, inspection, chemical-indicator packaging, an autoclave cycle read from its own printout, and the weekly spore test that proves it worked",
  accent: IR_ACCENT,
  accentCss: "#6fc9a0",
  parSeconds: 260,
  footprint: 2.2,
  badge: { id: "cycle-verified", name: "Cycle Verified", note: "A load cleaned, packaged, run and biologically verified end to end with no shortcut" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "the ADHA's member resources, or your employer's employee assistance program if a failed load has you doubting every tray you packaged this month",

  game: system({
    name: "Sterile Processing",
    currency: "CYCLE",
    ranks: ["New Processor", "Sterile Tech", "Lead Processor", "Sterilization Supervisor", "Sterile Processing Certified"],
    badges: [
      { id: "never-hand-scrubbed", name: "Never Hand-Scrubbed", note: "Instruments cleaned mechanically, never by hand", test: AWARD.stepClean("ultrasonic") },
      { id: "spore-tested", name: "Spore Tested", note: "The weekly biological indicator run and read with its control", test: AWARD.stepClean("spore-test") },
      { id: "pack-precise", name: "Pack Precise", note: "Every gauge reading held inside spec", test: AWARD.precise(0.75) },
    ],
    challenges: [
      { id: "clean-cycle", name: "Clean Cycle", note: "No corrections anywhere in the load", test: AWARD.clean },
      { id: "loaded-right", name: "Loaded Right", note: "Held the ultrasonic and the cycle wait the whole time, first try", test: AWARD.unbroken },
      { id: "fast-turnaround", name: "Fast Turnaround", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hand-scrub-brush": "That brush is for hand-scrubbing wet, contaminated instruments — the CDC's own guidelines prefer mechanical cleaning precisely to get hands away from that. A hand around a wet scaler at a sink is a puncture risk on every stroke, and the ultrasonic does the same job without a hand anywhere near the blade.",
    "overlapped-pouches": "Those two pouches are stacked flat against each other on the tray. Steam has to reach every surface of every pack to sterilize it, and a pouch shadowed by the one lying on top of it never gets full contact — it comes out of a passed cycle no more sterile than it went in.",
    "unlabeled-pack": "That pouch has no load number or date on it. An unlabeled pack cannot be traced to the cycle that ran it, which means it cannot be pulled if that cycle's biological indicator later comes back positive — it is untraceable the moment it leaves this room.",
    "blank-printout": "That is last cycle's printout, and it never got read — it's sitting torn off and face-down. The cycle counter tells you a cycle happened; the printed time, temperature and pressure are the only record that it happened correctly, and nobody reads them off a strip on the floor.",
  },

  lateNotes: {
    "packaged-cassette": "Not yet. Instruments packaged wet just steam themselves inside a sealed pouch and never fully sterilize — dry them first.",
    "sterile-storage": "Hold that. The log for this load isn't closed — storage rotation comes after the cycle and the biological check are both recorded, not before.",
    "printout-reading": "There's no cycle running yet to read a printout from.",
  },

  steps: [
    {
      id: "don-gloves", kind: "select", target: "utility-gloves-repro",
      title: "Don utility gloves for the dirty zone",
      cue: "Heavy utility gloves before you touch anything that came off a patient.",
      why: "The dirty side of this room handles instruments that have not been cleaned yet, sharp edges included — a utility glove is bought to a cut level under ANSI/ISEA 105 in a way an exam glove never is, and OSHA 29 CFR 1910.1030 treats reprocessing staff as exposed the same as chairside staff. The glove that is thin enough to feel a calculus ledge through is the wrong glove for a tray of used curettes.",
    },
    {
      id: "receive-dirty", kind: "select", target: "dirty-intake",
      title: "Receive the cassette in the dirty zone",
      cue: "Log the cassette in at the dirty-side bench before it moves any further.",
      why: "The dirty zone and the clean zone are kept physically separate for one reason: nothing contaminated ever crosses back over a clean surface. Everything that arrives here is treated as contaminated until it has been through the whole line, cassette included.",
    },
    {
      id: "ultrasonic", kind: "hold", target: "ultrasonic-basket", seconds: 6,
      title: "Clean instruments in the ultrasonic",
      cue: "Lower the basket and hold it through the full ultrasonic cycle.",
      why: "The CDC's guidelines favour mechanical cleaning — ultrasonic or an instrument washer — over hand-scrubbing precisely because cavitation reaches into box locks and serrations a hand and a brush cannot, and does it without a hand wrapped around a wet, contaminated blade.",
      holdBreakNote: "You pulled the basket before the cycle finished. A short ultrasonic run leaves debris in the joints the cavitation never had time to reach.",
    },
    {
      id: "rinse", kind: "select", target: "rinse-station",
      title: "Rinse the cleaned instruments",
      cue: "Rinse the ultrasonic detergent off before inspection.",
      why: "Detergent residue left on an instrument reads as debris under magnification and can react with steam sterilization — the rinse is what leaves you looking at the instrument itself, not at what cleaned it.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["debris-spot", "damaged-tip"],
      itemNames: { "debris-spot": "residual debris in a box lock", "damaged-tip": "a bent scaler tip" },
      itemNotes: {
        "debris-spot": "Dried debris still sitting in the hinge of this instrument. Sterilization does not clean — it kills what a load carries into the chamber, and organic material can shield microorganisms from steam that would otherwise reach them.",
        "damaged-tip": "This tip is bent past its working angle. A damaged instrument that gets packaged and sterilized anyway is still a damaged instrument on the next patient — sterility does not repair it.",
      },
      title: "Inspect every instrument under magnification",
      cue: "Two things on this tray should not go into a pouch. Find them under the lamp.",
      why: "The naked eye misses what the magnifier catches, which is the entire reason a lighted magnifier sits at this bench rather than the tray being packaged straight off the rinse. Debris and damage are both invisible from arm's length and both defeat the point of everything that happens after this step.",
    },
    {
      id: "dry", kind: "select", target: "drying-rack",
      title: "Dry instruments completely before packaging",
      cue: "Instruments go on the drying rack before anything is wrapped.",
      why: "Moisture sealed inside a pouch either wet-packs the load — a pack is considered contaminated the moment it is found wet — or it turns to steam inside its own wrapper during the cycle and can compromise the seal. Dry goes into the pouch, not wet.",
    },
    {
      id: "package", kind: "sequence", anyOrder: true,
      targets: ["cassette-wrap", "chemical-indicator", "seal-date"],
      itemNames: { "cassette-wrap": "wrap the cassette", "chemical-indicator": "internal chemical indicator", "seal-date": "seal and date the pouch" },
      title: "Package with an internal indicator, then seal and date",
      cue: "Wrap the cassette, drop in the internal chemical indicator, then seal the pouch and write the date and load number on it.",
      why: "The internal indicator only proves anything if it is inside the pack where steam has to reach it to change colour, and the date and load number are what let this exact pack be pulled later if this exact cycle's biological indicator ever comes back positive.",
    },
    {
      id: "load-autoclave", kind: "drag", target: "packaged-cassette",
      title: "Load the autoclave without overlapping packs",
      cue: "Set the packaged cassette in the chamber on its own, not stacked against another pouch.",
      why: "Steam sterilizes by direct contact — a pouch has to have exposed surface on every side for the cycle to actually reach it, which is why AAMI ST79 calls for packs loaded on edge and clear of each other rather than stacked flat.",
      drag: { to: "autoclave-slot", radius: 0.4, missNote: "Not flat against the other pack — space it so steam reaches every side." },
    },
    {
      id: "run-cycle", kind: "hold", target: "autoclave-panel", seconds: 7,
      title: "Run the cycle",
      cue: "Start the cycle and hold the door closed until it completes on its own.",
      why: "A steam sterilization cycle is a specific combination of time, temperature and pressure sustained for its full length — opening the chamber early or cutting the cycle short means none of the three parameters was actually held for as long as the load needed.",
      holdBreakNote: "The cycle was interrupted before it finished. A partial cycle is an unsterilized load whatever the timer showed when it stopped.",
    },
    {
      id: "read-printout", kind: "gauge", target: "printout-reading",
      title: "Read the printout",
      cue: "Check the cycle's printed time, temperature and pressure against spec and commit.",
      why: "The printout is the cycle's actual physical record — time at temperature, the peak pressure — not the light that comes on when the door unlocks. AAMI ST79 treats reading it as a required release check, because a light can come on at the end of a cycle that never reached temperature at all.",
      gauge: { label: "CHAMBER TEMP", speed: 0.7, green: [0.5, 0.7], readout: (t) => `${Math.round(230 + t * 40)}°F`, missNote: "That reading is outside spec — the load did not see what the cycle needed. Hold it for reprocessing, not release." },
    },
    {
      id: "external-indicator", kind: "select", target: "external-indicator-check",
      title: "Check the external indicator",
      cue: "Confirm the tape or strip on the outside of the pack changed colour.",
      why: "The external indicator only tells you the pack was exposed to a sterilization process, never that sterilization was actually achieved — it is a quick sort between processed and unprocessed, not a release check on its own, which is exactly why it comes after the printout and not instead of it.",
    },
    {
      id: "spore-test", kind: "sequence",
      targets: ["bio-indicator", "control-indicator", "incubator"],
      itemNames: { "bio-indicator": "biological indicator", "control-indicator": "unincubated control", "incubator": "incubator" },
      title: "Run the weekly biological indicator with its control",
      cue: "Run a spore test alongside a matched control, and incubate both.",
      why: "A biological indicator is the only test that challenges the cycle with something alive — bacterial spores far hardier than anything on a real instrument — and the unincubated control is what proves the indicator itself was viable to begin with, so a negative result actually means the cycle worked rather than that the test was dead on arrival.",
      outOfOrderNote: "Run the challenge indicator with its control, then incubate both together — a spore test without its control proves nothing.",
    },
    {
      id: "log-result", kind: "select", target: "sterilization-log",
      title: "Log the cycle and the spore test result",
      cue: "Record the cycle parameters and the biological indicator result in the sterilization log.",
      why: "The log is what lets this exact load be traced back to this exact cycle and this exact spore test months later, which is the only way a recall can name the patients a failed load reached instead of every patient seen that week. A record with a gap in it is indistinguishable from a load that was never verified at all.",
    },
    {
      id: "storage-fifo", kind: "select", target: "sterile-storage",
      title: "Rotate sterile storage first-in-first-out",
      cue: "Shelve the finished pack behind what's already there, and pull from the front.",
      why: "Even a correctly sterilized pack has a shelf-life tied to event-related sterility — how it's handled and stored, not a fixed calendar date — and FIFO rotation is what keeps the oldest stock moving instead of sitting at the back until its packaging integrity is the question.",
    },
  ],

  interrupts: [
    {
      id: "spore-positive",
      kind: "Lab result",
      after: "ultrasonic", delay: 4, seconds: 12,
      alert: "The lab just called back: last week's biological indicator came back positive, and you're mid-cycle on today's load.",
      cue: "A positive spore test means every load since the last negative result needs to be recalled.",
      target: "sterilization-log",
      why: "The CDC's guidance treats a positive biological indicator as a signal about the sterilizer, not the one pack it happened to be riding in — every load run since the last confirmed negative is suspect until it is pulled and the cause is found, whatever else is on your bench right now.",
      missNote: "Today's cycle finished before the recall was opened. Every load that shipped between the last clean spore test and this call is still out there, unaccounted for, and the longer it takes to open that recall the further those packs travel.",
      wrongNote: "It is the sterilization log — a positive spore test opens a recall of every load since the last negative, and that starts here.",
    },
    {
      id: "cycle-abort",
      kind: "Equipment fault",
      after: "run-cycle", delay: 3, seconds: 11,
      alert: "The autoclave has thrown a fault code and stopped mid-cycle. The door is still locked.",
      cue: "The cycle stopped before it reached the end — the load inside is not sterile.",
      target: "restart-button",
      why: "A cycle that aborts partway through has not held time, temperature and pressure for as long as the load needed at any point in the run — the fault is acknowledged and the load is treated as unprocessed and re-run, not pulled out and used because it got most of the way there.",
      missNote: "The load sat in a stopped, unacknowledged cycle for the rest of the shift. An aborted cycle that nobody clears just looks like a finished one to whoever opens that door next.",
      wrongNote: "It is the restart control — acknowledge the fault and requeue the load for a full cycle, not a partial one.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, IR_ACCENT);

    // Stainless work-surface texture for the reprocessing benches, from
    // citykit's tiling canvases rather than a flat colour.
    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 6, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.4, metal: 0.55, color: 0xc7cdd2 });

    // ---------------------------------------------------------------- dirty zone
    const dirtyBench = group(g, -2.2, 0, -1.6);
    box(dirtyBench, 1.1, 0.86, 0.55, 0, 0.43, 0, 0xb03a2f, { rough: 0.55, metal: 0.1 });
    const dirtyTop = slab(dirtyBench, 1.1, 0.04, 0.55, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    dirtyTop.material = steelMat();
    const ppeStub = box(dirtyBench, 0.16, 0.1, 0.06, -0.3, 0.93, 0.1, 0xf2c14b, { rough: 0.75 });
    holoTag(dirtyBench, "Utility gloves", -0.3, 1.05, 0.1, { css: IR_ACCENT, w: 0.36 });
    reg(hits, ppeStub, "utility-gloves-repro");

    const dirtyCassette = group(dirtyBench, 0.15, 0.9, 0);
    box(dirtyCassette, 0.24, 0.03, 0.14, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.5 });
    for (let i = 0; i < 5; i++) box(dirtyCassette, 0.01, 0.02, 0.1, -0.09 + i * 0.045, 0.02, 0, CITY.steel, { rough: 0.3, metal: 0.7 });
    holoTag(dirtyCassette, "Dirty cassette in", 0, 0.09, 0, { css: IR_ACCENT, w: 0.4 });
    reg(hits, dirtyCassette, "dirty-intake");

    // ---------------------------------------------------------------- ultrasonic
    const ultra = group(g, -2.2, 0, -0.4);
    box(ultra, 0.5, 0.4, 0.36, 0, 0.5, 0, 0x53585e, { rough: 0.4, metal: 0.5 });
    const tank = box(ultra, 0.42, 0.16, 0.28, 0, 0.72, 0, 0x8fb3c4, { rough: 0.2, metal: 0.2, opacity: 0.55, transparent: true });
    const basket = group(ultra, 0, 0.7, 0);
    box(basket, 0.36, 0.02, 0.22, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8 });
    for (let i = 0; i < 6; i++) box(basket, 0.006, 0.05, 0.22, -0.15 + i * 0.06, 0.03, 0, CITY.steel, { rough: 0.3, metal: 0.8, cast: false });
    holoTag(ultra, "Ultrasonic", 0, 0.9, 0, { css: IR_ACCENT, w: 0.32 });
    reg(hits, basket, "ultrasonic-basket");
    const bubbles = particles(ultra, 26, 0xbfe4f2, { size: 0.01, life: 0.5, additive: false, opacity: 0.55 });
    void tank;

    // The scrub brush by the ultrasonic — the hand-scrub temptation.
    const brush = group(ultra, 0.35, 0.55, 0.16);
    cyl(brush, 0.012, 0.014, 0.14, 0, 0, 0, 0xdfe4e8, { rough: 0.4, seg: 8 }).rotation.z = Math.PI / 2.4;
    box(brush, 0.05, 0.02, 0.02, 0.08, 0.03, 0, 0xd8342a, { rough: 0.6 });
    holoTag(brush, "Scrub brush", 0, 0.08, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, brush, "hand-scrub-brush");

    // ---------------------------------------------------------------------- rinse
    const rinse = group(g, -2.2, 0, 0.8);
    box(rinse, 1.0, 0.86, 0.55, 0, 0.43, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const rinseTop = slab(rinse, 1.0, 0.04, 0.55, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    rinseTop.material = steelMat();
    cyl(rinse, 0.16, 0.16, 0.14, -0.28, 0.86, 0, 0xdfe4e8, { rough: 0.3, metal: 0.2, seg: 16, open: true, side: 2 });
    reg(hits, rinse, "rinse-station");

    // ------------------------------------------------------------------- inspect
    const inspect = group(g, -0.7, 0, 1.9, 0.4);
    box(inspect, 0.9, 0.86, 0.5, 0, 0.43, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const inspectTop = slab(inspect, 0.9, 0.04, 0.5, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    inspectTop.material = steelMat();
    const lampArm = group(inspect, -0.2, 0.9, 0);
    cyl(lampArm, 0.012, 0.012, 0.5, 0, 0.25, 0, CITY.darkSteel, { rough: 0.4, metal: 0.7, seg: 8 });
    const lens = torus(lampArm, 0.09, 0.014, 0, 0.5, 0.1, 0xbfe4f2, { rough: 0.2, opacity: 0.5, transparent: true, seg: 6, seg2: 20 });
    lens.rotation.x = Math.PI / 2;

    const instrTray = group(inspect, 0.15, 0.9, 0);
    box(instrTray, 0.4, 0.02, 0.28, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    const debrisSpot = ball(instrTray, 0.01, -0.08, 0.02, 0.04, 0x6b4a2a, { rough: 0.8, seg: 8 });
    holoTag(instrTray, "Box lock", -0.08, 0.06, 0.04, { css: "#f0645b", w: 0.28 });
    reg(hits, debrisSpot, "debris-spot");
    const bentTip = cyl(instrTray, 0.004, 0.004, 0.1, 0.1, 0.03, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 6 });
    bentTip.rotation.set(0, 0, 0.9);
    holoTag(instrTray, "Bent tip", 0.1, 0.07, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, bentTip, "damaged-tip");

    // -------------------------------------------------------------- drying rack
    const drying = group(g, 0.5, 0, 1.9);
    box(drying, 0.4, 0.05, 0.28, 0, 0.6, 0, 0xdfe4e8, { rough: 0.6, metal: 0.3, opacity: 0.001, transparent: true });
    for (let i = 0; i < 5; i++) box(drying, 0.006, 0.05, 0.28, -0.16 + i * 0.08, 0.63, 0, CITY.steel, { rough: 0.3, metal: 0.75, cast: false });
    holoTag(drying, "Drying rack", 0, 0.72, 0, { css: IR_ACCENT, w: 0.32 });
    reg(hits, drying, "drying-rack");

    // ----------------------------------------------------------------- packaging
    const pack = group(g, 1.7, 0, 1.4, -0.3);
    box(pack, 0.9, 0.86, 0.5, 0, 0.43, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const packTop = slab(pack, 0.9, 0.04, 0.5, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    packTop.material = steelMat();
    const wrapRoll = cyl(pack, 0.08, 0.08, 0.3, -0.28, 1.02, 0, 0xf4f8fa, { rough: 0.5, opacity: 0.7, transparent: true, seg: 14 });
    wrapRoll.rotation.z = Math.PI / 2;
    reg(hits, wrapRoll, "cassette-wrap");
    const indicatorStrip = box(pack, 0.06, 0.01, 0.03, 0, 0.9, 0.1, 0xf2c14b, { rough: 0.5 });
    holoTag(pack, "Chemical indicator", 0, 0.98, 0.1, { css: IR_ACCENT, w: 0.4 });
    reg(hits, indicatorStrip, "chemical-indicator");
    const sealer = box(pack, 0.24, 0.08, 0.1, 0.24, 0.92, -0.1, 0x53585e, { rough: 0.4, metal: 0.5 });
    reg(hits, sealer, "seal-date");

    // Overlapping pouches on a corner of the pack bench — the decoy.
    const overlap = group(pack, 0.05, 0.9, 0.16);
    box(overlap, 0.16, 0.012, 0.1, 0, 0, 0, 0xf4f8fa, { rough: 0.5, opacity: 0.65, transparent: true });
    box(overlap, 0.16, 0.012, 0.1, 0.03, 0.014, 0.02, 0xf4f8fa, { rough: 0.5, opacity: 0.65, transparent: true });
    holoTag(overlap, "Stacked pouches", 0, 0.06, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, overlap, "overlapped-pouches");

    // An unlabeled pouch sitting apart from the sealer.
    const unlabeled = group(pack, -0.3, 0.9, -0.15);
    box(unlabeled, 0.16, 0.012, 0.1, 0, 0, 0, 0xeef2f4, { rough: 0.5, opacity: 0.65, transparent: true });
    holoTag(unlabeled, "No load label", 0, 0.05, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, unlabeled, "unlabeled-pack");

    // The travelling packaged cassette, moved by the drag step.
    const packagedCassette = group(g, 1.6, 0.9, 1.55);
    box(packagedCassette, 0.24, 0.03, 0.16, 0, 0, 0, 0xf4f8fa, { rough: 0.5, opacity: 0.75, transparent: true });
    holoTag(packagedCassette, "Packaged cassette", 0, 0.06, 0, { css: IR_ACCENT, w: 0.4 });
    reg(hits, packagedCassette, "packaged-cassette");

    // ---------------------------------------------------------------- autoclave
    const auto = group(g, 2.4, 0, -0.3, -0.5);
    box(auto, 0.62, 0.9, 0.55, 0, 0.5, 0, 0xc7cdd2, { rough: 0.4, metal: 0.4 });
    const door = box(auto, 0.4, 0.4, 0.03, 0, 0.55, 0.28, 0x8b929a, { rough: 0.3, metal: 0.6 });
    const lamp = ball(auto, 0.012, 0.24, 0.75, 0.29, 0xd8232a, { emissive: 0xd8232a, ei: 1.4, cast: false, seg: 8, seg2: 6 });
    const autoSlot = box(auto, 0.32, 0.3, 0.02, 0, 0.55, 0.27, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["autoclave-slot"] = autoSlot;
    const panel = instrument(auto, 0.26, 0.75, 0.3, { ry: 0, idle: "READY", color: IR_ACCENT });
    reg(hits, panel, "autoclave-panel");
    const restart = box(auto, 0.06, 0.04, 0.02, 0.26, 0.62, 0.3, 0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.4 });
    holoTag(auto, "Restart", 0.26, 0.68, 0.3, { css: IR_ACCENT, w: 0.24 });
    reg(hits, restart, "restart-button");
    void door;

    // Printer readout beside the autoclave.
    const printerPanel = holoPanel(g, 0.4, 0.28, 2.75, 1.0, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,12,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6fc9a0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eafaf1";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("-- °F", w * 0.08, h * 0.34);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("-- min  •  -- psi", w * 0.08, h * 0.68);
    }, { accent: IR_ACCENT });
    reg(hits, printerPanel, "printout-reading");

    // A torn-off, unread printout on the floor beside the unit — the decoy.
    const blankPrint = group(g, 2.7, 0, -0.05);
    decal(blankPrint, 0.1, 0.16, 0, 0.02, 0, paperFace("", ["— unread —"], { bg: "#f4f6f8" }), { px: 96 }).rotation.x = -Math.PI / 2;
    holoTag(blankPrint, "Unread printout", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, blankPrint, "blank-printout");

    const extIndicator = box(auto, 0.05, 0.02, 0.05, -0.24, 0.75, 0.29, 0xf2c14b, { rough: 0.5 });
    holoTag(auto, "External indicator", -0.24, 0.82, 0.29, { css: IR_ACCENT, w: 0.36 });
    reg(hits, extIndicator, "external-indicator-check");

    // ------------------------------------------------------------- spore testing
    const spore = group(g, 0.5, 0, -1.8);
    box(spore, 0.7, 0.86, 0.5, 0, 0.43, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const sporeTop = slab(spore, 0.7, 0.04, 0.5, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    sporeTop.material = steelMat();
    const bioVial = cyl(spore, 0.018, 0.018, 0.06, -0.18, 0.92, 0, 0xf2c14b, { rough: 0.4, seg: 10 });
    reg(hits, bioVial, "bio-indicator");
    const controlVial = cyl(spore, 0.018, 0.018, 0.06, -0.05, 0.92, 0, 0x8fb3c4, { rough: 0.4, seg: 10 });
    reg(hits, controlVial, "control-indicator");
    const incu = box(spore, 0.22, 0.2, 0.16, 0.18, 0.99, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const incuLamp = ball(incu, 0.01, 0, 0.11, 0.081, 0x59c97b, { emissive: 0x59c97b, ei: 0.001, cast: false, seg: 8, seg2: 6 });
    reg(hits, incu, "incubator");

    // ------------------------------------------------------------ log & storage
    const logPanel = holoPanel(g, 0.5, 0.36, -0.3, 1.4, -1.55, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,12,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6fc9a0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eafaf1";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("STERILIZATION LOG", w * 0.06, h * 0.2);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Load: — · BI: —", w * 0.06, h * 0.55);
    }, { accent: IR_ACCENT, ry: 0.4 });
    reg(hits, logPanel, "sterilization-log");

    const storage = toolChest(g, -1.1, 2.2, { ry: 0.6, color: IR_ACCENT });
    reg(hits, storage, "sterile-storage");

    const tech = standingFigure(g, 1.1, 0.5, { ry: -1.0, cloth: 0x4aa6a0, skin: 0xb98a63 });

    // Consumables shelving against the back wall: pouches, wrap and a spare
    // box of the ultrasonic detergent this line runs through every load.
    const shelfA = group(g, -3.7, 0, -3.0);
    box(shelfA, 0.06, 1.5, 0.7, -0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelfA, 0.06, 1.5, 0.7, 0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "POUCHES", 0xf4f8fa], [0.75, "WRAP", 0xdfe4e8], [1.2, "CI STRIPS", 0xf2c14b],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelfA, 0.82, 0.02, 0.68, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelfA, 0.24, 0.16, 0.2, i * 0.28, y + 0.09, 0, c, { rough: 0.7 });
        decal(shelfA, 0.18, 0.06, i * 0.28, y + 0.09, 0.101, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#eafaf1"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelfA, "Consumables", 0, 1.55, 0, { css: IR_ACCENT, w: 0.4 });

    const shelfB = group(g, 3.7, 0, 1.5);
    box(shelfB, 0.06, 1.0, 0.6, -0.36, 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelfB, 0.06, 1.0, 0.6, 0.36, 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelfB, 0.72, 0.02, 0.58, 0, 0.6, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
    box(shelfB, 0.22, 0.14, 0.18, -0.2, 0.68, 0, 0x59c97b, { rough: 0.75 });
    decal(shelfB, 0.16, 0.05, -0.2, 0.68, 0.091, signFace("DETERGENT", { bg: "#22272c", accent: "#59c97b", scale: 0.32 }), { px: 96 });
    box(shelfB, 0.22, 0.1, 0.18, 0.2, 0.66, 0, 0xf4f8fa, { rough: 0.6 });
    decal(shelfB, 0.16, 0.04, 0.2, 0.66, 0.091, signFace("SPARE BASKETS", { bg: "#22272c", accent: "#6fc9a0", scale: 0.3 }), { px: 96 });

    // A lidded step-bin and a floor mat under the wet line.
    const bin = group(g, -0.6, 0, 2.6);
    cyl(bin, 0.13, 0.11, 0.32, 0, 0.16, 0, 0x53585e, { rough: 0.55, metal: 0.3, seg: 14 });
    cyl(bin, 0.14, 0.14, 0.03, 0, 0.33, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 14 });
    slab(g, 3.0, 0.006, 0.9, -2.2, 0.001, 0.2, 0x2b3138, { radius: 0.05, rough: 0.9, opacity: 0.5, transparent: true, cast: false });

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0.5, 1.1, -0.4),

      onStepComplete(step) {
        if (step.id === "receive-dirty") dirtyCassette.visible = false;
        if (step.id === "inspect") { debrisSpot.visible = false; bentTip.visible = false; }
        if (step.id === "package") { overlap.visible = true; }
        if (step.id === "load-autoclave") {
          packagedCassette.parent.remove(packagedCassette);
          auto.add(packagedCassette);
          packagedCassette.position.set(0, 0.55, 0.2);
        }
        if (step.id === "run-cycle") { lamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
        if (step.id === "read-printout") {
          repaint(printerPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,16,12,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#6fc9a0"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#eafaf1";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("250°F", w * 0.08, h * 0.34);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("15 min  •  15 psi", w * 0.08, h * 0.68);
          });
        }
        if (step.id === "external-indicator") extIndicator.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "spore-test") incuLamp.material.emissiveIntensity = 1.6;
      },

      onInterrupt(it) {
        if (it.id === "spore-positive") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,6,6,0.92)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#f0645b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#ffd2ce";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("BI POSITIVE — RECALL", w * 0.06, h * 0.5);
          });
          incuLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.8 });
        }
        if (it.id === "cycle-abort") { lamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "spore-positive") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,16,12,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#6fc9a0"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#eafaf1";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("STERILIZATION LOG", w * 0.06, h * 0.2);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Recall opened — logged", w * 0.06, h * 0.55);
          });
          incuLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
        }
        if (it.id === "cycle-abort") lamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.4 });
      },

      onHazard() {},

      animate(t, dt, session) {
        bubbles.visible = session?.step?.id === "ultrasonic" && !!session.holding;
        if (bubbles.visible) bubbles.userData.step(dt, new THREE.Vector3(-2.2, 0.72, -0.4), 0.12, 0.3, 0.4);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-printout") {
          repaint(printerPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,16,12,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = gg.t >= 0.5 && gg.t <= 0.7 ? "#59c97b" : "#f0645b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#eafaf1";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText(`${Math.round(230 + gg.t * 40)}°F`, w * 0.08, h * 0.34);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("15 min  •  15 psi", w * 0.08, h * 0.68);
          });
        }
      },
    };
  },
};
