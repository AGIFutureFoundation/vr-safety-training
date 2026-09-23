import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sample Kit Shipping VR — Community Environmental Justice,
// Hunters Point Edition, station two of four in the biomonitoring line.
//
// Packing a day's urine, hair and dust-wipe samples for the lab: every label
// matched against the shipping manifest before anything goes in a box, the
// cold chain built and running before the lid closes, the specimens packed
// to UN3373 exempt-specimen requirements, the chain-of-custody form signed
// at the hand-off, the courier's manifest completed, and the temperature
// logger read one last time before the cooler leaves the building. A sample
// that travels without all of that proves nothing about the person it came
// from — it is a tube with a story nobody can vouch for.
//
// Sited generically in a community programme's sample-processing room; no
// real courier, laboratory or participant is named or implied.

const SKS_ACCENT = 0x4fb0a8;

export const SIM_SAMPLE_KIT_SHIPPING = {
  id: "sample-kit-shipping",
  index: "152",
  domain: "Environmental",
  trade: "Biomonitoring field coordinator",
  category: "Community Environmental Justice",
  indoor: "service",
  certification: "OSHA 29 CFR 1910.1030 bloodborne pathogens for handling human biological specimens; EPA QA/QC and chain-of-custody guidance; CDC biological substance, Category B packing and shipping guidance; 45 CFR 46 informed consent underlying every specimen in the cooler",
  name: "Sample Kit Shipping",
  title: simTitle("Sample Kit Shipping"),
  tagline: "Labels matched to the manifest, the cold chain running before the lid closes, UN3373 exempt-specimen packing, the chain of custody signed at the hand-off, the courier's manifest, and the logger read one last time",
  accent: SKS_ACCENT,
  accentCss: "#4fb0a8",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "chain-unbroken", name: "Chain Unbroken", note: "Every label matched, the cold chain running, and the custody form signed before the courier ever touched the box" },

  game: system({
    name: "Sample Shipping",
    currency: "CUSTODY",
    ranks: ["Packing Trainee", "Kit Handler", "Field Coordinator", "Lead Coordinator", "Custody Certified"],
    badges: [
      { id: "labels-matched", name: "Labels Matched", note: "Every label cross-checked against the manifest before packing", test: AWARD.stepClean("verify-labels") },
      { id: "never-unsigned", name: "Never Unsigned", note: "No sample left the room without its custody form signed", test: AWARD.safe },
      { id: "temp-true", name: "Temp True", note: "The scale and the logger both read inside their working band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-pack", name: "Clean Pack", note: "No corrections across the whole packing run", test: AWARD.clean },
      { id: "cold-chain-held", name: "Cold Chain Held", note: "The temperature watch held steady without a break", test: AWARD.unbroken },
      { id: "ready-fast", name: "Ready Fast", note: "Packed and handed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "ship-unlabeled": "You reached for the ship-it-now shortcut on a tube that was never cross-checked against the manifest. A sample without a label anyone can verify against a participant ID is a sample the lab cannot honestly attach to anyone's result — it either gets sent back or, worse, gets attached to the wrong person's file.",
    "skip-cold-chain": "You packed the cooler without the ice packs. Urine, hair and dust-wipe samples all degrade differently once they warm past the range the lab validated its methods against, and a result run on a sample that spent transit at room temperature is a number describing decay, not exposure.",
    "release-unsigned": "You handed the box to the courier without the chain-of-custody form signed. From the moment it leaves this room, a sample with no signed record of who packed it and when is a sample that cannot be defended if its result is ever challenged — the signature is what makes the chain a chain instead of a claim.",
    "skip-secondary-pack": "You reached for the skip-the-outer-packaging shortcut and put a bare tube straight in the shipping box. UN3373's absorbent material and rigid outer packaging exist because a primary tube does crack in transit sometimes, and the secondary layer is what keeps that leak inside the box instead of on a courier's hands.",
  },

  lateNotes: {
    "coc-form": "There's nothing to sign yet — the package has to be weighed and its manifest started before the chain-of-custody form has anything on it to witness.",
    "manifest-board": "The manifest is filled out after the chain of custody is signed, not before — it records what was already witnessed, not what is about to be.",
    "courier-desk": "The courier isn't taking this package yet — the manifest still has to be completed first.",
    "field-log": "Nothing to log yet — the shipment has to actually leave with the courier before there's a shipment to record.",
  },

  steps: [
    {
      id: "gather-kit", kind: "select", target: "sample-fridge",
      title: "Retrieve today's specimens",
      cue: "Pull today's urine, hair and dust-wipe samples from the secure fridge before anything else.",
      why: "Every sample in this fridge has been sitting under refrigeration since collection, and the packing clock effectively starts the moment it comes out — the fewer minutes between the fridge and the cooler, the less of the cold chain gets spent before the cooler even has ice in it.",
    },
    {
      id: "verify-labels", kind: "sequence", anyOrder: true,
      targets: ["label-urine", "label-hair", "label-dust"],
      itemNames: { "label-urine": "urine sample ID checked", "label-hair": "hair sample ID checked", "label-dust": "dust-wipe ID checked" },
      title: "Match every label to the manifest",
      cue: "Cross-check the ID on each tube and envelope against today's shipping manifest — any order.",
      why: "The label is the only thing connecting a tube back to a consented, ID-assigned participant, and the manifest is the only outside record that can catch a label that was misread or mis-stuck at intake — cross-checking both, before packing, is the last point where a mismatch is cheap to fix instead of impossible to trace.",
    },
    {
      id: "cold-chain", kind: "sequence",
      targets: ["logger-start", "ice-packs-in"],
      itemNames: { "logger-start": "temperature logger started", "ice-packs-in": "ice packs loaded" },
      title: "Start the logger, then load the ice",
      cue: "Start the temperature logger first, then load the conditioned ice packs into the cooler.",
      why: "The logger starts before the ice goes in so the record covers the packing itself, not just the transit that follows — a cold chain that is only proven from the moment the lid closes says nothing about whether the samples were already warming on the bench while they waited to be packed.",
      outOfOrderNote: "Logger first, then the ice — a logger started after the packs are already in has no record of whatever temperature the samples sat at before it was turned on.",
    },
    {
      id: "pack-un3373", kind: "sequence",
      targets: ["un-primary", "un-absorbent", "un-outer"],
      itemNames: { "un-primary": "primary receptacle sealed", "un-absorbent": "absorbent material added", "un-outer": "rigid outer packaging closed" },
      title: "Pack to UN3373 exempt-specimen requirements",
      cue: "Seal the primary tube, add the absorbent material, then close the rigid outer packaging — in that order.",
      why: "UN3373's three layers each answer a different failure: the sealed primary receptacle is the sample's own container, the absorbent material catches whatever gets past it, and the rigid outer box is what a courier's van and belt sorter are actually allowed to handle roughly. Skipping the order — closing the outer box before the absorbent is in — leaves the one layer that matters most in a leak sitting empty.",
      outOfOrderNote: "Primary receptacle, then absorbent material, then the rigid outer box — closing the outer packaging before the absorbent is inside defeats the layer that is supposed to catch a leak.",
    },
    {
      id: "watch-temp", kind: "track", target: "logger-display", seconds: 6,
      title: "Watch the logger while you finish packing",
      cue: "Keep the temperature reading in the cold-chain band while the rest of the cooler is loaded around it.",
      track: { start: 0.3, green: [0.15, 0.4], rise: 0.5, fall: 0.42, drift: 0.11, label: "COOLER TEMP", readout: (v) => (v < 0.15 ? "too cold — check the packs" : v > 0.4 ? "warming — reseat the ice" : "in range") },
      why: "A logger that drifts warm for even a few minutes while the cooler sits open on the bench is a gap in the record the lab will eventually ask about — watching it through the rest of the packing is what catches a pack that settled wrong before the lid ever closes on it.",
      holdBreakNote: "The reading drifted out of the cold-chain band while attention was elsewhere — bring it back into range and keep watching until the packing is actually done.",
    },
    {
      id: "seal-cooler", kind: "hold", target: "cooler-latch", seconds: 4,
      title: "Seal the cooler",
      cue: "Hold the latch down until the cooler seats and locks.",
      why: "A cooler that is closed but not actually latched can pop open under its own jostling in a courier's van, and a latch held only halfway looks sealed right up until the moment it isn't — holding it the full count is what confirms it actually caught.",
      holdBreakNote: "The latch let go before it seated — a cooler that looks closed but isn't latched is one bump from opening in transit.",
    },
    {
      id: "weigh", kind: "drag", target: "package-box",
      title: "Place the package on the courier scale",
      cue: "Move the sealed package onto the scale before reading its weight.",
      drag: { to: "scale-plate", radius: 0.45, missNote: "Not centred on the scale plate. A package hanging off the edge reads a weight the courier's own manifest cannot rely on." },
      why: "The courier's own paperwork needs a real weight, not an estimate written from memory — and a box that isn't actually sitting on the plate reads a number that belongs to nothing.",
    },
    {
      id: "read-scale", kind: "gauge", target: "scale-display",
      title: "Read and commit the package weight",
      cue: "Let the scale settle, then commit the weight for the manifest.",
      gauge: { label: "PACKAGE WEIGHT", speed: 0.68, green: [0.28, 0.55], readout: (t) => `${(1.2 + t * 3.4).toFixed(1)} kg`, missNote: "Committed off the settled reading — a weight taken before the scale steadies is not the package's actual weight, and the courier's manifest will not match what they end up handling." },
      why: "A declared weight that does not match what the courier actually lifts is the kind of small mismatch that gets a Category B shipment flagged and delayed at the depot — reading the settled number is what keeps the paperwork and the box telling the same story.",
    },
    {
      id: "coc-sign", kind: "hold", target: "coc-form", seconds: 5,
      title: "Sign the chain of custody at the hand-off",
      cue: "Hold the form steady while the chain-of-custody hand-off is completed and signed.",
      why: "A chain of custody is a chain precisely because every hand-off gets its own signature, time and name — this is the point where the samples leave the coordinator who packed them, and the signature here is what a lab or a hearing later can actually trace back to a real person's account of the hand-off.",
      holdBreakNote: "The form was set down before the signature was complete — an unfinished signature at a hand-off is the same as no signature once the box is out the door.",
    },
    {
      id: "manifest", kind: "select", target: "manifest-board",
      title: "Complete the courier's manifest",
      cue: "Fill in the tracking number, the Category B biological substance declaration and the lab's contact information.",
      why: "The manifest is what the courier and the receiving lab both read before anyone there has seen the actual box — a manifest that is incomplete or wrong is what gets a legitimate, correctly packed shipment held at a depot for hours while someone tries to reach the sender.",
    },
    {
      id: "hand-to-courier", kind: "select", target: "courier-desk",
      title: "Hand the package to the courier",
      cue: "Release the package to the courier now that the manifest and the custody form are both complete.",
      why: "The hand-off is the last moment the coordinator has any control over the samples until the lab signs for them — releasing it only once the paperwork is actually done is what keeps that gap in control from also being a gap in the record.",
    },
    {
      id: "final-check", kind: "find", noHint: true,
      targets: ["loose-lid-latch", "unlabeled-spare-tube"],
      itemNames: { "loose-lid-latch": "a second cooler's lid latch left loose", "unlabeled-spare-tube": "an unlabeled spare tube left on the bench" },
      itemNotes: {
        "loose-lid-latch": "A second cooler staged for tomorrow's run has its latch sitting unlatched — left this way overnight, whatever is inside it rides on nothing but the lid's own weight.",
        "unlabeled-spare-tube": "A spare tube from the kit is sitting on the bench with no ID on it at all. Anyone finding it tomorrow has no way to tell whether it's an unused spare or a sample that was never labelled.",
      },
      title: "Walk the packing bench before it's left for the night",
      cue: "Check the bench and the other coolers, and click anything left the way it should not be.",
      why: "This bench runs more than one shipment a day, and what gets left wrong here is what the next coordinator in the room inherits without warning — the walk-round exists to catch it while the person who can still explain it is standing there.",
    },
    {
      id: "log-shipment", kind: "select", target: "field-log",
      title: "Log the shipment",
      cue: "Record who packed it, the logger's readings, the custody signatures and the courier's tracking number.",
      why: "The log is the coordinator's own account of a shipment that has already left the building — without it, everything about how this specific box was packed exists only in memory, which is exactly the kind of gap a lab's own QA review will eventually ask someone to fill in from nothing.",
    },
  ],

  interrupts: [
    {
      id: "label-peels",
      kind: "Label failure mid-pack",
      after: "watch-temp", delay: 2, seconds: 12,
      alert: "One of the hair-sample envelope's labels has come loose in the cold and condensation, and it's sitting half-peeled at the bottom of the cooler.",
      cue: "Fix the label before it separates completely and the tube goes anonymous.",
      target: "relabel-tube",
      why: "A label that fails inside a sealed cooler does not announce itself again until somebody at the lab opens a bag and finds a tube with no ID on it — catching the peel now, while the tube is still identifiable by its position and the day's manifest, is the only point in the chain where it is still cheap to fix.",
      missNote: "The cooler was sealed with the label still peeling loose inside it. Once that label fully separates in transit, the tube it belonged to has no way back to a participant ID, and the sample is unusable for anything the study needed it for.",
      wrongNote: "It's the loose label in the cooler. Nothing else on this bench puts that tube's ID back where it belongs.",
    },
    {
      id: "courier-early",
      kind: "Early pickup",
      after: "seal-cooler", delay: 2, seconds: 12,
      alert: "The courier is already at the desk asking for today's pickup — the chain-of-custody form hasn't been signed yet.",
      cue: "Have the courier wait. Nothing leaves this room unsigned.",
      target: "courier-wait",
      why: "A courier's own schedule is not a reason to skip a signature that exists precisely to say who had the samples and when — asking them to wait the few minutes it takes to finish the custody form costs nothing next to what an unsigned hand-off costs if this shipment's results are ever questioned.",
      missNote: "The package went out the door with the courier before the custody form was signed. From this point forward there is no record of who actually handed these samples off, which is the one thing a chain of custody exists to prove.",
      wrongNote: "Ask the courier to wait. The chain-of-custody form is what has to be finished before anything about this hand-off is real.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, SKS_ACCENT);

    // ------------------------------------------------------------- fridge
    const fridge = group(g, -2.2, 0, -2.2, 0.4);
    box(fridge, 0.6, 1.5, 0.55, 0, 0.75, 0, 0xdfe4e8, { rough: 0.4, metal: 0.15 });
    box(fridge, 0.56, 0.7, 0.02, 0, 1.0, 0.276, 0xc7d0d6, { rough: 0.35, metal: 0.2 });
    box(fridge, 0.02, 0.16, 0.02, 0.22, 1.0, 0.3, 0x8d959d, { rough: 0.3, metal: 0.8 });
    holoTag(fridge, "sample fridge", 0, 1.6, 0, { css: "#4fb0a8", w: 0.4 });
    reg(hits, fridge, "sample-fridge");

    // Tube rack visible through the fridge door, three specimen types.
    const rack = group(g, -2.2, 0, -1.75, 0.4);
    box(rack, 0.4, 0.03, 0.16, 0, 0.85, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const urineTube = cyl(rack, 0.028, 0.028, 0.08, -0.13, 0.905, 0, 0xe8dca0, { rough: 0.3, opacity: 0.7, transparent: true, seg: 10 });
    const urineLabel = decal(rack, 0.06, 0.03, -0.13, 0.95, 0.05, signFace("0417-B", { bg: "#0d1c1c", accent: "#59c97b", fg: "#eafaf4", scale: 0.55 }));
    void urineLabel;
    reg(hits, urineTube, "label-urine");
    const hairEnv = box(rack, 0.08, 0.02, 0.05, 0, 0.87, 0, 0xece2c8, { rough: 0.7 });
    reg(hits, hairEnv, "label-hair");
    const dustWipe = box(rack, 0.08, 0.02, 0.05, 0.13, 0.87, 0, 0xd7dde0, { rough: 0.6 });
    reg(hits, dustWipe, "label-dust");

    // A mismatched, unlabeled tube sitting apart from the rack — the trap.
    const badTube = cyl(g, 0.028, 0.028, 0.08, -1.75, 0.9, -2.35, 0xe8dca0, { rough: 0.3, opacity: 0.6, transparent: true, seg: 10 });
    holoTag(g, "ship it now?", -1.75, 1.02, -2.35, { css: "#f0645b", w: 0.34 });
    reg(hits, badTube, "ship-unlabeled");

    // ------------------------------------------------------------- packing bench
    const bench = group(g, -0.2, 0, -1.9, 0);
    box(bench, 1.6, 0.72, 0.7, 0, 0.36, 0, 0x4a5561, { rough: 0.65, metal: 0.25 });
    const cooler = group(bench, -0.4, 0.72, 0);
    box(cooler, 0.5, 0.32, 0.36, 0, 0.16, 0, 0xe0eef0, { rough: 0.5 });
    const coolerLid = box(cooler, 0.52, 0.05, 0.38, 0, 0.35, 0, 0xc9dfe0, { rough: 0.5 });
    void coolerLid;
    holoTag(cooler, "cooler", 0, 0.5, 0, { css: "#4fb0a8", w: 0.26 });
    const iceHome = group(cooler, 0, 0.2, 0);
    const icePack1 = box(iceHome, 0.14, 0.04, 0.28, -0.13, 0, 0, 0xbfe9f2, { rough: 0.3, opacity: 0.75, transparent: true });
    const icePack2 = box(iceHome, 0.14, 0.04, 0.28, 0.13, 0, 0, 0xbfe9f2, { rough: 0.3, opacity: 0.75, transparent: true });
    icePack1.visible = false; icePack2.visible = false;
    reg(hits, iceHome, "ice-packs-in");
    const loggerProbe = instrument(cooler, 0, 0.42, 0.22, { idle: "--.- C", color: SKS_ACCENT, w: 0.14, d: 0.2 });
    holoTag(cooler, "logger", 0, 0.58, 0.22, { css: "#4fb0a8", w: 0.24 });
    reg(hits, loggerProbe, "logger-start");
    reg(hits, loggerProbe.userData.screen, "logger-display");
    const latch = box(cooler, 0.06, 0.06, 0.05, 0, 0.36, 0.19, 0xb8402f, { rough: 0.5, metal: 0.4 });
    reg(hits, latch, "cooler-latch");

    const noIceBtn = box(cooler, 0.12, 0.04, 0.06, 0, 0.36, -0.2, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(cooler, "pack without ice?", 0, 0.46, -0.2, { css: "#f0645b", w: 0.4 });
    reg(hits, noIceBtn, "skip-cold-chain");

    // UN3373 layered packing, on the other side of the bench.
    const packStation = group(bench, 0.45, 0.72, 0);
    const primaryTube = cyl(packStation, 0.03, 0.03, 0.09, -0.15, 0.14, 0, 0xe8dca0, { rough: 0.3, opacity: 0.75, transparent: true, seg: 10 });
    holoTag(packStation, "primary receptacle", -0.15, 0.24, 0, { css: "#4fb0a8", w: 0.4 });
    reg(hits, primaryTube, "un-primary");
    const absorbentPad = box(packStation, 0.14, 0.02, 0.14, 0.05, 0.11, 0, 0xf2ecd8, { rough: 0.8 });
    holoTag(packStation, "absorbent material", 0.05, 0.2, 0, { css: "#4fb0a8", w: 0.4 });
    reg(hits, absorbentPad, "un-absorbent");
    const outerBox = box(packStation, 0.22, 0.16, 0.18, 0.22, 0.18, 0, 0xd6c99a, { rough: 0.7 });
    holoTag(packStation, "rigid outer box", 0.22, 0.28, 0, { css: "#4fb0a8", w: 0.36 });
    reg(hits, outerBox, "un-outer");
    const skipSecondaryBtn = box(packStation, 0.14, 0.04, 0.06, 0.22, 0.32, 0, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(packStation, "skip the layers?", 0.22, 0.4, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, skipSecondaryBtn, "skip-secondary-pack");

    // Relabel station for the peeling-label interrupt.
    const relabelPen = group(bench, -0.6, 0.75, -0.28);
    cyl(relabelPen, 0.008, 0.008, 0.12, 0, 0.06, 0, 0x2b3138, { rough: 0.5, seg: 8 });
    holoTag(relabelPen, "relabel the tube", 0, 0.16, 0, { css: "#4fb0a8", w: 0.36 });
    reg(hits, relabelPen, "relabel-tube");

    // ------------------------------------------------------------- scale
    const scaleTable = group(g, 1.6, 0, -1.4, -0.4);
    box(scaleTable, 0.6, 0.7, 0.45, 0, 0.35, 0, 0x4a5561, { rough: 0.65, metal: 0.2 });
    const scaleBase = box(scaleTable, 0.34, 0.03, 0.34, 0, 0.72, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    void scaleBase;
    const scalePlate = box(scaleTable, 0.3, 0.015, 0.3, 0, 0.74, 0, 0xdfe4e8, { rough: 0.35, metal: 0.3 });
    hits["scale-plate"] = scalePlate;
    const scaleReadout = instrument(scaleTable, 0, 0.95, -0.14, { idle: "--.- kg", color: SKS_ACCENT, w: 0.15, d: 0.2 });
    reg(hits, scaleReadout, "scale-display");
    const packageBox = box(bench, 0.24, 0.16, 0.2, -0.7, 0.9, 0.15, 0xc9bd94, { rough: 0.65 });
    reg(hits, packageBox, "package-box");

    // ------------------------------------------------------------- CoC + manifest
    const cocTable = group(g, 1.5, 0, 0.4, -0.3);
    box(cocTable, 0.7, 0.65, 0.45, 0, 0.325, 0, 0x4a5561, { rough: 0.65, metal: 0.2 });
    const cocDecal = decal(cocTable, 0.36, 0.42, 0, 0.66, 0, paperFace("CHAIN OF CUSTODY", [
      "Sample IDs / manifest no.", "Packed by / witnessed by", "Time, temperature, cold-chain start",
      "Custody transferred to:", "Coordinator signature: ______",
    ], { scale: 0.85 }));
    cocDecal.rotation.x = -Math.PI / 2;
    holoTag(cocTable, "chain of custody", 0, 0.9, 0, { css: "#4fb0a8", w: 0.42 });
    reg(hits, cocDecal, "coc-form");
    const releaseUnsignedBtn = box(cocTable, 0.16, 0.04, 0.08, -0.3, 0.68, 0.18, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(cocTable, "hand off now, unsigned?", -0.3, 0.78, 0.18, { css: "#f0645b", w: 0.5 });
    reg(hits, releaseUnsignedBtn, "release-unsigned");

    const manifestBoard = holoPanel(g, 0.7, 0.5, 2.3, 1.5, 0.4, (cx, w, h) => {
      cx.fillStyle = "#0a201d"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#4fb0a8"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dff5f2";
      cx.fillText("COURIER MANIFEST", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eafaf6";
      ["Tracking no.: ______", "Category B — biological substance", "Lab contact: ______"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: -0.5, accent: SKS_ACCENT });
    reg(hits, manifestBoard, "manifest-board");

    // ------------------------------------------------------------- courier desk
    const courierDesk = group(g, 2.4, 0, 1.4, -0.6);
    box(courierDesk, 0.6, 0.72, 0.4, 0, 0.36, 0, 0x4a5561, { rough: 0.6, metal: 0.2 });
    holoTag(courierDesk, "hand off here", 0, 0.9, 0, { css: "#4fb0a8", w: 0.34 });
    reg(hits, courierDesk, "courier-desk");
    const waitBell = group(courierDesk, 0.24, 0.72, 0.1);
    cyl(waitBell, 0.05, 0.06, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.45, metal: 0.4, seg: 14 });
    holoTag(waitBell, "ask them to wait", 0, 0.14, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, waitBell, "courier-wait");
    const courier = standingFigure(g, 2.0, 1.95, { ry: -0.7, cloth: 0x2b3138, vest: 0xf2c14b });
    holoTag(courier, "courier", 0, 1.9, 0, { css: "#f2c14b", w: 0.24 });

    // ------------------------------------------------------------- walk-round
    const spareCooler = group(g, -2.3, 0, 1.2, 0.4);
    box(spareCooler, 0.48, 0.3, 0.34, 0, 0.15, 0, 0xe0eef0, { rough: 0.5 });
    const spareLid = box(spareCooler, 0.5, 0.04, 0.36, 0, 0.32, 0, 0xc9dfe0, { rough: 0.5 });
    spareLid.rotation.z = 0.12;
    const spareLatch = box(spareCooler, 0.05, 0.05, 0.04, 0, 0.34, 0.17, 0xb8402f, { rough: 0.5, metal: 0.4 });
    reg(hits, spareLatch, "loose-lid-latch");
    const spareTube = cyl(g, 0.028, 0.028, 0.08, -1.8, 0.75, 1.3, 0xece2c8, { rough: 0.6, seg: 10 });
    reg(hits, spareTube, "unlabeled-spare-tube");

    // ------------------------------------------------------------- log
    const logBoard = holoPanel(g, 0.6, 0.42, 0.4, 1.5, 1.9, (cx, w, h) => {
      cx.fillStyle = "#0a201d"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#4fb0a8"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillStyle = "#dff5f2";
      cx.fillText("SHIPMENT LOG", w / 2, h * 0.35);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eafaf6";
      cx.fillText("Packed by · logger · custody · tracking", w / 2, h * 0.68);
    }, { accent: SKS_ACCENT });
    reg(hits, logBoard, "field-log");

    // Supply shelf of spare UN3373 kits, for the room to read as a working
    // shipping bench rather than three props on a bare floor.
    const shelf = group(g, -0.3, 0, 2.2, 0);
    box(shelf, 1.4, 0.03, 0.4, 0, 1.1, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelf, 1.4, 0.03, 0.4, 0, 0.6, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (const sx of [-0.66, 0.66]) cyl(shelf, 0.02, 0.02, 1.15, sx, 0.55, -0.17, CITY.darkSteel, { rough: 0.45, metal: 0.6, seg: 8 });
    for (let i = 0; i < 6; i++) {
      const bx = -0.55 + (i % 3) * 0.45;
      const by = i < 3 ? 1.18 : 0.68;
      box(shelf, 0.36, 0.16, 0.3, bx, by, 0, 0xd6c99a, { rough: 0.7 });
      decal(shelf, 0.28, 0.09, bx, by + 0.001, 0.151, signFace("UN3373", { bg: "#0d1c1c", accent: "#4fb0a8", fg: "#dff5f2", scale: 0.55 }), { px: 128 });
    }
    holoTag(shelf, "spare kit shelf", 0, 1.35, 0, { css: "#4fb0a8", w: 0.4 });
    box(shelf, 1.4, 0.03, 0.4, 0, 0.1, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 3; i++) {
      box(shelf, 0.36, 0.18, 0.3, -0.55 + i * 0.45, 0.28, 0, 0xece2c8, { rough: 0.75 });
    }
    const clock = group(g, 1.9, 0, -2.7, 0);
    cyl(clock, 0.09, 0.09, 0.02, 0, 1.65, 0, 0xf2f4f5, { rough: 0.4, seg: 20 });
    box(clock, 0.005, 0.06, 0.006, 0, 1.66, 0.011, 0x2b3138, { rough: 0.4 });

    // Glove and hand-hygiene station beside the packing bench.
    const ppeWall = group(g, 0.9, 0, -2.6, 0);
    box(ppeWall, 0.24, 0.14, 0.08, 0, 1.15, 0, 0x9fd6e8, { rough: 0.65 });
    holoTag(ppeWall, "NITRILE", 0, 1.28, 0, { css: "#4fb0a8", w: 0.24 });
    const dispenser = group(ppeWall, 0.3, 1.0, 0.02);
    box(dispenser, 0.1, 0.2, 0.08, 0, 0, 0, 0xf0f4f6, { rough: 0.4 });
    box(dispenser, 0.06, 0.03, 0.05, 0, -0.12, 0.02, 0x2b3138, { rough: 0.5 });

    // A small courier waiting bench, apart from the desk itself.
    const waitBench = group(g, 2.6, 0, 0.5, -0.6);
    box(waitBench, 0.5, 0.05, 0.4, 0, 0.42, 0, 0x3c5a66, { radius: 0.03, rough: 0.6 });
    for (const [sx, sz] of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]]) {
      cyl(waitBench, 0.02, 0.02, 0.4, sx, 0.21, sz, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 8 });
    }

    // Coordinator standing clear of the bench and the fridge.
    const coordinator = standingFigure(g, -0.1, -0.4, { ry: -2.6, cloth: 0x3c5a66, vest: SKS_ACCENT });
    holoTag(coordinator, "field coordinator", 0, 1.95, 0, { css: "#4fb0a8", w: 0.4 });

    let cocSigned = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.0),

      onStepComplete(step) {
        if (step.id === "cold-chain") { icePack1.visible = true; icePack2.visible = true; }
        if (step.id === "coc-sign") {
          cocSigned = true;
          repaint(cocDecal, paperFace("CHAIN OF CUSTODY — SIGNED", [
            "Sample IDs / manifest no.", "Packed by / witnessed by", "Time, temperature, cold-chain start",
            "Custody transferred to: courier", "Coordinator signature: on file",
          ], { scale: 0.85 }));
        }
        if (step.id === "read-scale") repaint(scaleReadout.userData.screen, signFace("2.8 kg", { bg: "#0d1c1c", accent: "#59c97b", fg: "#eafaf6", scale: 0.55 }));
        if (step.id === "final-check") { spareLatch.material = mat(0x59c97b, { rough: 0.5, metal: 0.4 }); spareTube.visible = false; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "label-peels") {
          relabelPen.children.forEach((c) => { c.material && (c.material.emissiveIntensity = 1.2); });
          holoTag(relabelPen, "!", 0, 0.3, 0, { css: "#f0645b", w: 0.14 });
        }
        if (it.id === "courier-early") {
          courier.position.set(1.9, 0, 1.6);
          courier.rotation.y = -0.2;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "courier-early") {
          courier.position.set(2.7, 0, 2.0);
          courier.rotation.y = -0.7;
        }
      },
      animate(t, dt, session) {
        void dt;
        if (session?.track && session.step?.id === "watch-temp") {
          const v = session.track.v;
          repaint(loggerProbe.userData.screen, signFace(`${(2 + v * 8).toFixed(1)} C`, {
            bg: "#0d1c1c", accent: v >= 0.15 && v <= 0.4 ? "#59c97b" : "#f0645b", fg: "#eafaf6", scale: 0.6,
          }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-scale") {
          repaint(scaleReadout.userData.screen, signFace(`${(1.2 + gg.t * 3.4).toFixed(1)} kg`, {
            bg: "#0d1c1c", accent: gg.t >= 0.28 && gg.t <= 0.55 ? "#59c97b" : "#f2ae14", fg: "#eafaf6", scale: 0.6,
          }));
        }
        void t; void cocSigned;
      },
    };
  },
};
