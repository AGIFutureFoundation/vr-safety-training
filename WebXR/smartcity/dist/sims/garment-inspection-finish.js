import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Garment Inspection & Finish VR — Sewing & Garment Trades,
// station three. The last bench a finished piece crosses before it's boxed:
// the light box that shows a defect a bench light hides, the spec sheet that
// says what "in tolerance" actually means, the guarded snips for the loose
// threads a bare pair of scissors would take a fingertip along with, the
// needle detector that runs over every single piece because a broken needle
// tip sewn into a garment is a hazard that leaves the building with it, and
// the solvent spot-cleaner that only gets touched once the SDS says what it
// actually is.

const GIN_ACCENT = 0x6bd6b8;

export const SIM_GARMENT_INSPECTION_FINISH = {
  id: "garment-inspection-finish",
  index: "181",
  domain: "Apparel manufacturing",
  trade: "Industrial sewing machine operator — Workers United (SEIU)",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "Workers United (SEIU) industrial sewing machine operator apprenticeship standards; OSHA 29 CFR 1910.1200 hazard communication for the spot-cleaning solvent; OSHA 29 CFR 1910.132 personal protective equipment for the gloves; NIOSH ergonomics guidance for standing inspection-table work",
  name: "Garment Inspection & Finish",
  title: simTitle("Garment Inspection & Finish"),
  tagline: "Light box, spec sheet, defects found and tagged, guarded snips, the needle detector on every piece, and solvent under the SDS",
  accent: GIN_ACCENT,
  accentCss: "#6bd6b8",
  parSeconds: 260,
  footprint: 2.3,
  badge: { id: "clean-pack", name: "Clean Pack", note: "Every defect found and tagged, every piece swept for needles, and nothing packed that hadn't cleared both" },

  game: system({
    name: "Finish Authority",
    currency: "TAG",
    ranks: ["Sorter", "Inspector", "Lead Inspector", "Finish Hand", "Finish Authority Certified"],
    badges: [
      { id: "gloved-solvent", name: "Gloved Solvent", note: "Never touched the spot cleaner bare-handed", test: AWARD.safe },
      { id: "steady-sweep", name: "Steady Sweep", note: "Held the needle detector sweep without a break", test: AWARD.unbroken },
      { id: "to-spec", name: "To Spec", note: "The measured dimension close to the spec sheet's tolerance", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-inspection", name: "Clean Inspection", note: "No corrections through the whole run", test: AWARD.clean },
      { id: "needle-caught", name: "Needle Caught", note: "Pulled the boxed bundle the moment the detector alarmed", test: AWARD.stepClean("spot-clean") },
      { id: "pack-fast", name: "Pack Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-snip-reach": "You reached for the bare scissors in the bin instead of the guarded thread snips. Open scissors blades held close to a garment on the table catch more than thread the moment they slip — the spring-loaded snips close on themselves the instant you let go, and the bare pair doesn't.",
    "solvent-no-glove": "You dipped bare fingers straight into the solvent tray. OSHA's hazard communication rule exists so the SDS tells you what a spot cleaner actually does to skin before you find out by touching it — the gloves the SDS calls for go on before the tray, not after the stain starts to lift.",
    "needle-in-scrap": "There's a broken needle tip sitting in the ordinary thread-scrap bin instead of the sharps container. A needle fragment in with the scrap thread is a puncture waiting for whoever bags that scrap next, and it's exactly the risk the needle detector on every piece is there to keep out of the finished garment in the first place.",
    "solvent-mix-tray": "Two different spot-cleaning solvents have been poured together in one open tray. The SDS for each one covers what it does alone; mixing them is exactly the combination the incompatibility section warns against, and finding out which reaction you got is not a test to run over an open tray at an inspection table.",
  },

  lateNotes: {
    "needle-detector": "The garment gets measured and checked for defects first — a piece swept for needles before the spec check just gets handled twice.",
    "solvent-tray": "Not yet. The SDS gets read and the gloves go on before the solvent touches anything.",
  },

  steps: [
    {
      id: "spec-sheet", kind: "select", target: "spec-sheet",
      title: "Read the spec sheet",
      cue: "Check the measurements and the defect tolerances for this style before the first piece goes on the table.",
      why: "The spec sheet is what turns 'looks about right' into an actual pass or fail — a seam allowance, a stitch count, a tolerance band that's written down instead of remembered from the last batch. An inspector working from memory drifts a little every batch; one working from the sheet in front of them doesn't.",
    },
    {
      id: "light-box", kind: "select", target: "light-box",
      title: "Lay the piece on the light box",
      cue: "Switch on the light box and spread the garment flat across it, seam side up.",
      why: "A seam held up to the room's overhead light hides exactly the flaw a light box shows: backlit, a skipped stitch or a pulled thread throws a shadow a bench light never catches. The light box isn't extra care for a hard case, it's how every seam on this bench actually gets looked at.",
    },
    {
      id: "seam-defects", kind: "find", noHint: true,
      targets: ["skipped-stitch", "puckered-seam"],
      itemNames: { "skipped-stitch": "skipped stitch", "puckered-seam": "puckered side seam" },
      itemNotes: {
        "skipped-stitch": "A skipped stitch is a gap in the seam's own strength — one thread's worth of hold missing exactly where the seam will be pulled on hardest.",
        "puckered-seam": "A puckered seam sewn under uneven tension looks fine folded on a rack and shows the moment the garment is worn and the fabric relaxes around it.",
      },
      title: "Find the seam defects",
      cue: "Two things are wrong with this seam under the light. Find and tag them.",
      why: "The light box only does its job if somebody's actually looking for something specific — a spec sheet's tolerance in one hand and a reason to doubt every inch of stitching in front of you. A defect that passes this bench doesn't get caught again until a customer finds it, and by then it's a return, not a tag.",
    },
    {
      id: "spec-measure", kind: "gauge", target: "tape-gauge",
      title: "Measure against the spec",
      cue: "Check the seam allowance against the spec sheet and commit inside its tolerance.",
      why: "A seam allowance narrower than spec fails the first hard wash; wider, it changes the garment's finished size out of the run's own tolerance. The number on the spec sheet is what this measurement is checked against — not how the allowance compares to the piece sitting next to it on the table.",
      gauge: { label: "SEAM ALLOWANCE", speed: 0.8, green: [0.44, 0.6], readout: (t) => `${(0.4 + t * 0.6).toFixed(2)} in`, missNote: "Off the spec sheet's tolerance — remeasure the allowance against the sheet, not by eye." },
    },
    {
      id: "glove-up", kind: "select", target: "gloves",
      title: "Glove up before the solvent",
      cue: "Pull on the SDS-specified gloves before the spot-cleaning tray gets touched.",
      why: "OSHA's PPE standard exists to put the barrier on before the exposure, not after somebody notices their skin reacting. The SDS names the glove material this particular solvent needs — putting them on here is what makes the spot-clean step later a controlled task instead of a bare-handed guess.",
    },
    {
      id: "read-sds", kind: "select", target: "sds-board",
      title: "Check the SDS before using the solvent",
      cue: "Confirm the spot-cleaner's container matches the label the SDS binder describes.",
      why: "Hazard communication only works if the container in your hand is checked against the sheet, not assumed from the shelf it came off. A bottle that doesn't match what the SDS describes for that product is a bottle nobody should be dabbing onto a customer's garment, no matter how familiar the shelf spot is.",
    },
    {
      id: "trim-threads", kind: "select", target: "thread-snips",
      title: "Trim the loose threads",
      cue: "Take the guarded spring snips and trim every loose thread the light box showed.",
      why: "A loose thread left on a finished garment is the first thing a customer's finger finds and pulls, sometimes taking a few inches of the seam with it. Trimmed flush with the guarded snips — blades that close themselves the instant they're released — the finish is what the spec sheet actually describes, and the hand holding them stays clear of an open edge.",
    },
    {
      id: "needle-scan", kind: "track", target: "needle-detector", seconds: 6,
      title: "Sweep the needle detector",
      cue: "Pass the wand over the piece at a steady sweep rate — not so fast it skips a zone, not so slow it stalls the line.",
      why: "A needle detector sweep run too fast crosses a broken-tip zone before the coil has time to react, and one run too slow backs up every piece behind it on the same bench. A steady, held sweep rate is the only way the wand actually covers every square inch of the piece the way the recall procedure assumes it did.",
      track: {
        start: 0.15, green: [0.4, 0.6], rise: 0.5, fall: 0.4, drift: 0.12, label: "SWEEP RATE",
        readout: (v) => (v < 0.4 ? "too slow — backing up the line" : v > 0.6 ? "too fast — skipping zones" : "steady"),
      },
      holdBreakNote: "Sweep rate broke the band. A wand moved unevenly leaves gaps the coil never actually passed over — bring it back to a steady rate and sweep the piece again.",
    },
    {
      id: "spot-clean", kind: "hold", target: "solvent-tray", seconds: 5,
      title: "Spot-clean the stain",
      cue: "Dab the solvent-dampened cloth on the mark and hold it for the SDS's dwell time.",
      why: "The SDS gives a dwell time because the solvent needs that long sitting on the fibre to actually lift the stain — wiped away early, it's just spread the mark thinner across more of the fabric. Held the full time in the gloved hand, it does the job the sheet describes instead of a rushed version of it.",
      holdBreakNote: "Lifted the cloth before the dwell time was up. The stain's still there under a thinner layer — press it back down and hold it for the full count.",
    },
    {
      id: "fold-pack", kind: "drag", target: "finished-garment",
      title: "Fold the piece to spec",
      cue: "Fold the finished garment to the spec sheet's fold pattern and place it in the shipping box.",
      why: "A garment folded to the spec sheet's own pattern packs flat and consistent, box after box, on a line that ships thousands of them the same way; folded 'close enough,' it packs uneven and the box either doesn't close right or ships lighter than the count on the label says.",
      drag: { to: "ship-box", radius: 0.3, missNote: "Not in the box — fold to the spec pattern and place it square before letting go." },
    },
    {
      id: "pack-checklist", kind: "sequence",
      targets: ["tissue-liner", "size-sticker", "box-seal"],
      itemNames: { "tissue-liner": "tissue liner", "size-sticker": "size sticker", "box-seal": "box seal" },
      itemNotes: { "tissue-liner": "The liner goes in before the folded garment, not laid on top after — it's there to keep the fold from marking against the box." },
      title: "Pack in order",
      cue: "Liner, sticker, then seal the box — in that order, not sealed first and labelled after.",
      why: "A box sealed before the size sticker goes on gets opened again to fix it, which is exactly the extra handling the sequence exists to avoid — liner protects the fold, the sticker has to be checked against the piece while the box is still open to compare, and the seal is what actually closes the job out.",
      outOfOrderNote: "Liner first, then the size sticker while the box is still open to check against the piece, then the seal.",
    },
    {
      id: "log-count", kind: "select", target: "count-log",
      title: "Log the piece count",
      cue: "Record the lot number and the piece count on the pack log before it leaves the bench.",
      why: "The lot number on the log is what lets a defect found downstream, or a needle-detector miss found later, be traced back to this exact bundle instead of every box that shipped that week. A pack log skipped at the bench is a recall with no way to narrow which boxes it actually has to open.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["needle-in-scrap", "solvent-mix-tray"],
      itemNames: { "needle-in-scrap": "needle tip in the scrap bin", "solvent-mix-tray": "two solvents mixed in one tray" },
      itemNotes: {
        "needle-in-scrap": "A broken needle tip belongs in the sharps container, never the ordinary scrap-thread bin the next hand reaches into without looking.",
        "solvent-mix-tray": "Two spot cleaners poured together in one tray is exactly the combination the SDS incompatibility section exists to warn against — it gets tipped out and the tray rinsed, not used as-is.",
      },
      title: "Walk the bench before the next lot",
      cue: "Two things at this bench are wrong. Find them by looking.",
      why: "The pack log closes the piece that just left the bench, not the bench itself — a needle tip in the wrong bin or two solvents mixed in one tray sits there for the next inspector to find the hard way unless this bench gets the same look every lot gets before it closes out.",
    },
  ],

  // A detector alarming on work that's already sealed, and a bottle nobody
  // can identify sitting where the labelled one belongs. See shared/game.js.
  interrupts: [
    {
      id: "needle-alarm-boxed",
      kind: "Detector alarm on sealed work",
      after: "spot-clean", delay: 3, seconds: 11,
      alert: "The line detector alarms on a bundle two benches down — one that's already boxed and sealed, ready to ship.",
      cue: "That's a needle alarm on work that's already left this bench's checks.",
      target: "boxed-bundle",
      why: "A needle fragment sealed inside a shipped box is a hazard that's now somebody else's problem to find, most likely a customer's hand — the alarm on a boxed bundle outranks whatever's in front of you, because the piece you're inspecting is still on the bench where it can be fixed and that one isn't.",
      missNote: "The alarming box shipped anyway. A needle fragment sewn into a garment doesn't announce itself again once it's out the door — the whole point of scanning every piece is that this was the last chance to catch it before it became someone else's injury.",
      wrongNote: "It's the alarm on the boxed bundle. Pull that box and open it before anything else on this bench.",
    },
    {
      id: "unlabeled-solvent",
      kind: "Unlabelled container",
      after: "needle-scan", delay: 3, seconds: 11,
      alert: "A second spray bottle has turned up on the bench, decanted from somewhere, with no label at all.",
      cue: "That bottle isn't the one the SDS describes for this station.",
      target: "sds-board",
      why: "Hazard communication runs on the label matching the sheet — an unlabelled bottle could be the same solvent decanted for convenience or something else entirely, and there is no way to tell which from the outside. It gets checked against the SDS binder before it touches a garment, not used because it's sitting where the labelled one usually is.",
      missNote: "The unlabelled bottle got used anyway. Whatever was actually in it went onto a customer's garment with nobody having checked it against a single sheet — hazard communication exists precisely to stop that guess.",
      wrongNote: "It's the bottle with no label. Check it against the SDS binder before it goes anywhere near a garment.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, GIN_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#2c3138", base2: "#252a30", tiles: 5 }), { repeat: 4, px: 256 });
    const floor = box(g, 5.4, 0.08, 5.4, 0, -0.04, 0, 0x2c3138, { rough: 0.92 });
    floor.material = texturedMat(floorTex, { rough: 0.92, color: 0x2c3138 });

    // -------------------------------------------------------------- light box
    const lightBoxGroup = group(g, 0, 0, -0.85);
    box(lightBoxGroup, 1.1, 0.78, 0.6, 0, 0.39, 0, 0x3a4048, { rough: 0.5, metal: 0.5 });
    const lbSurface = box(lightBoxGroup, 1.0, 0.03, 0.5, 0, 0.795, 0, 0xdfe9ee, { rough: 0.15, opacity: 0.4, transparent: true, emissive: 0xdfe9ee, ei: 0.6 });
    reg(hits, lbSurface, "light-box");
    const garment = box(lightBoxGroup, 0.7, 0.01, 0.4, 0, 0.81, 0, 0xdad4c8, { rough: 0.8, opacity: 0.92, transparent: true });
    reg(hits, garment, "finished-garment");
    // Defect markers on the garment, visible once the light box is on.
    const skippedStitch = box(lightBoxGroup, 0.06, 0.005, 0.02, -0.2, 0.815, 0.05, 0xd2312b, { opacity: 0, transparent: true, cast: false });
    reg(hits, skippedStitch, "skipped-stitch");
    const puckeredSeam = box(lightBoxGroup, 0.1, 0.008, 0.03, 0.18, 0.815, -0.08, 0xd2312b, { opacity: 0, transparent: true, cast: false });
    reg(hits, puckeredSeam, "puckered-seam");
    // A few stray loose threads the light box shows.
    for (const p of [[-0.1, 0.816, 0.1], [0.05, 0.816, -0.14], [0.22, 0.816, 0.06]]) {
      cyl(lightBoxGroup, 0.002, 0.002, 0.03, p[0], p[1], p[2], 0xe8e0c8, { rough: 0.6, seg: 4, cast: false });
    }

    // -------------------------------------------------------------- spec sheet
    const spec = holoPanel(g, 0.5, 0.34, -1.35, 1.5, -0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,14,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6bd6b8"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#dcf4ec";
      ctx.fillText("SPEC SHEET — STYLE 8842", w * 0.06, h * 0.16);
      ctx.fillStyle = "#f0fbf6"; ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Seam allowance: 0.6 in ± 0.1", "Stitch count: 10–12 spi", "Fold: half, collar out"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0.55, accent: GIN_ACCENT });
    reg(hits, spec, "spec-sheet");

    // -------------------------------------------------------------- tape gauge / instrument
    const inspTable = group(g, 1.0, 0, -0.2, -0.3);
    box(inspTable, 0.9, 0.05, 0.5, 0, 0.78, 0, 0x8b929a, { rough: 0.35, metal: 0.7 });
    for (const sx of [-0.4, 0.4]) box(inspTable, 0.05, 0.76, 0.42, sx, 0.39, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, cast: false });
    const tapeGauge = instrument(inspTable, -0.2, 0.83, 0, { ry: 0.3, idle: "-- in", color: GIN_ACCENT, w: 0.11, d: 0.17 });
    holoTag(tapeGauge, "seam gauge", 0, 0.15, 0, { css: "#6bd6b8", w: 0.28 });
    reg(hits, tapeGauge, "tape-gauge");

    // -------------------------------------------------------------- gloves / SDS / snips
    const glovesHook = group(inspTable, 0.25, 0.9, -0.05);
    box(glovesHook, 0.015, 0.1, 0.015, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    ball(glovesHook, 0.05, 0, -0.08, 0, 0xcfe0dc, { rough: 0.75, seg: 12 });
    for (let i = 0; i < 3; i++) cyl(glovesHook, 0.009, 0.009, 0.045, -0.025 + i * 0.02, -0.13, 0, 0xcfe0dc, { rough: 0.75, seg: 8 });
    holoTag(glovesHook, "gloves — SDS spec", 0, 0.06, 0, { css: "#6bd6b8", w: 0.4 });
    reg(hits, glovesHook, "gloves");

    const sdsBoard = group(g, -1.6, 0, -0.4, 0.3);
    box(sdsBoard, 0.32, 0.4, 0.03, 0, 1.2, 0, 0x1b2026, { rough: 0.6 });
    decal(sdsBoard, 0.28, 0.34, 0, 1.2, 0.018, paperFace("SDS", ["Spot cleaner, mixed", "solvent — see label", "Gloves: nitrile"], { bg: "#eef0e8", band: "#1a6b52" }), { px: 220 });
    reg(hits, sdsBoard, "sds-board");

    const snipsTray = group(inspTable, 0.15, 0.81, 0.14);
    box(snipsTray, 0.14, 0.015, 0.08, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6, cast: false });
    const snips = group(snipsTray, 0, 0.015, 0);
    cyl(snips, 0.006, 0.006, 0.08, -0.02, 0.04, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 6 });
    cyl(snips, 0.006, 0.006, 0.08, 0.02, 0.04, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 6 });
    torus(snips, 0.012, 0.004, 0, 0, 0, 0xe8b02e, { rough: 0.5, seg: 6, seg2: 10 });
    reg(hits, snips, "thread-snips");

    // Bare scissors decoy in a bin nearby — hazard.
    const scissorsBin = group(g, 0.7, 0, 0.4, -0.2);
    box(scissorsBin, 0.16, 0.06, 0.1, 0, 0.8, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    const bareScissors = group(scissorsBin, 0, 0.84, 0, 0.4);
    box(bareScissors, 0.14, 0.006, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8 });
    box(bareScissors, 0.02, 0.05, 0.02, -0.06, -0.02, 0, 0x22262b, { rough: 0.6 });
    reg(hits, bareScissors, "bare-snip-reach");

    // -------------------------------------------------------------- needle detector
    const detector = group(g, -0.9, 0, 1.1, 0.4);
    box(detector, 0.9, 0.05, 0.55, 0, 0.78, 0, 0x3a4048, { rough: 0.45, metal: 0.5 });
    box(detector, 0.06, 0.5, 0.06, -0.4, 1.03, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const wand = group(detector, -0.4, 1.28, 0, 0.3);
    box(wand, 0.5, 0.04, 0.1, 0.25, 0, 0, 0xe8b02e, { rough: 0.55 });
    ball(wand, 0.02, 0.5, 0, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4, seg: 10 });
    const detectorHit = box(detector, 0.9, 0.4, 0.55, 0, 0.98, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, detectorHit, "needle-detector");
    const detectPiece = box(detector, 0.6, 0.01, 0.35, 0, 0.805, 0, 0xdad4c8, { rough: 0.8, opacity: 0.9, transparent: true });
    void detectPiece;

    // -------------------------------------------------------------- solvent tray
    const solventBench = group(g, 1.6, 0, 1.0, -0.5);
    box(solventBench, 0.7, 0.05, 0.45, 0, 0.78, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (const sx of [-0.3, 0.3]) box(solventBench, 0.05, 0.76, 0.38, sx, 0.39, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, cast: false });
    const tray = box(solventBench, 0.24, 0.02, 0.16, 0, 0.8, 0, 0x9aa1a8, { rough: 0.3, metal: 0.75 });
    reg(hits, tray, "solvent-tray");
    // A dish of solvent-soaked cotton sitting open beside the tray, bare
    // fingers away — hazard. A second, invisible marker over the same dish:
    // reg() already claimed the tray for "solvent-tray".
    const bareDish = cyl(solventBench, 0.04, 0.045, 0.012, 0.16, 0.805, 0.08, 0x9aa1a8, { rough: 0.3, metal: 0.7, seg: 14 });
    reg(hits, bareDish, "solvent-no-glove");
    const solventBottle = group(solventBench, 0.28, 0.83, -0.08);
    cyl(solventBottle, 0.028, 0.028, 0.12, 0, 0.06, 0, 0xdfe4e8, { rough: 0.2, opacity: 0.75, transparent: true, seg: 12 });
    decal(solventBottle, 0.05, 0.05, 0, 0.06, 0.03, signFace("SDS #4", { bg: "#0d1c24", accent: "#6bd6b8", scale: 0.55 }));
    box(solventBottle, 0.016, 0.03, 0.016, 0, 0.135, 0, 0x2b6f6a, { rough: 0.6 });

    // Second, unlabelled bottle — used for the interrupt.
    const unlabeledBottle = group(solventBench, -0.24, 0.83, -0.05);
    cyl(unlabeledBottle, 0.026, 0.026, 0.11, 0, 0.055, 0, 0xe8e4dc, { rough: 0.3, opacity: 0.6, transparent: true, seg: 12 });
    box(unlabeledBottle, 0.014, 0.028, 0.014, 0, 0.125, 0, 0x2b2f34, { rough: 0.6 });
    unlabeledBottle.visible = false;

    // Two solvents mixed in one open tray, off to the side — hazard.
    const mixTray = group(g, 1.7, 0, 0.55, -0.5);
    box(mixTray, 0.2, 0.015, 0.14, 0, 0.79, 0, 0x9aa1a8, { rough: 0.3, metal: 0.75 });
    box(mixTray, 0.16, 0.008, 0.1, 0, 0.798, 0, 0x7fae9c, { rough: 0.2, opacity: 0.75, transparent: true });
    holoTag(mixTray, "two solvents, one tray", 0, 0.9, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, mixTray, "solvent-mix-tray");

    // -------------------------------------------------------------- pack / box / log
    const boxGroup = group(g, -0.3, 0, 1.55, 0.3);
    box(boxGroup, 0.5, 0.3, 0.36, 0, 0.15, 0, 0xc9a878, { rough: 0.8 });
    const shipBoxTarget = box(boxGroup, 0.44, 0.02, 0.3, 0, 0.31, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, shipBoxTarget, "ship-box");
    const tissue = box(boxGroup, 0.42, 0.01, 0.28, 0, 0.32, 0, 0xf4efe0, { rough: 0.7, opacity: 0, transparent: true, cast: false });
    reg(hits, tissue, "tissue-liner");
    const sticker = box(boxGroup, 0.1, 0.005, 0.06, 0.15, 0.33, 0.1, 0xffffff, { opacity: 0, transparent: true, cast: false });
    reg(hits, sticker, "size-sticker");
    const sealTape = box(boxGroup, 0.5, 0.02, 0.06, 0, 0.31, 0, 0xe8e0c8, { opacity: 0, transparent: true, cast: false });
    reg(hits, sealTape, "box-seal");

    // The already-sealed bundle two benches down, for the needle-alarm interrupt.
    const boxedBundle = group(g, -1.7, 0, 1.6, 0.2);
    box(boxedBundle, 0.42, 0.3, 0.3, 0, 0.15, 0, 0xc9a878, { rough: 0.8 });
    box(boxedBundle, 0.44, 0.02, 0.32, 0, 0.3, 0, 0xe8e0c8, { rough: 0.6 });
    reg(hits, boxedBundle, "boxed-bundle");

    const countLog = group(g, 1.5, 0, 1.4, -0.5);
    box(countLog, 0.28, 0.22, 0.02, 0, 1.15, 0, 0x1b2026, { rough: 0.6 });
    decal(countLog, 0.24, 0.16, 0, 1.15, 0.012, signFace("LOT / COUNT", { bg: "#0d1c24", accent: "#59c97b", fg: "#fff3d6", scale: 0.42 }));
    reg(hits, countLog, "count-log");

    // -------------------------------------------------------------- needle-in-scrap hazard
    const scrapBin = group(g, 0.6, 0, 1.7, 0.3);
    box(scrapBin, 0.3, 0.24, 0.24, 0, 0.12, 0, 0x2f6f8c, { rough: 0.8, metal: 0.3 });
    for (let i = 0; i < 6; i++) cyl(scrapBin, 0.002, 0.002, 0.06, -0.08 + (i % 3) * 0.08, 0.24, -0.05 + Math.floor(i / 3) * 0.08, 0xdfe4e8, { rough: 0.6, seg: 4, cast: false });
    const needleTip = cyl(scrapBin, 0.002, 0.002, 0.03, 0.02, 0.25, 0.03, 0xd8d8d8, { rough: 0.2, metal: 0.9, seg: 6 });
    reg(hits, needleTip, "needle-in-scrap");
    // Sharps container beside it, where the tip belongs.
    const sharps = cyl(g, 0.06, 0.07, 0.14, 0.85, 0.07, 1.75, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 14 });
    holoTag(g, "sharps", 0.85, 0.16, 1.75, { css: "#d2312b", w: 0.24 });
    void sharps;

    // ------------------------------------------------------------------- dressing
    // A thread rack, bolts of cloth, staged inspected bundles, a fire
    // extinguisher, and two more inspectors working their own benches, well
    // clear of every control this station registers.
    const threadRack = group(g, 1.9, 0, -1.3, -0.4);
    box(threadRack, 0.06, 1.2, 0.5, 0, 0.75, 0, 0x8b6a42, { rough: 0.7 });
    for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
      const c = [0xd6567a, 0xe8b02e, 0x59c97b, 0x4fd1ff, 0x6bd6b8, 0xdfe4e8, 0xf0645b, 0x8fbf5a][(row * 3 + col) % 8];
      cyl(threadRack, 0.02, 0.02, 0.09, 0.05, 0.35 + row * 0.24, -0.18 + col * 0.18, c, { rough: 0.6, seg: 10 });
    }
    holoTag(threadRack, "Thread rack", 0, 1.42, 0, { css: "#6bd6b8", w: 0.32 });

    const bolts = group(g, -1.9, 0, 0.4, 0.5);
    const boltColors = [0x3a5a7a, 0x7a3a3a, 0x3a7a5a];
    boltColors.forEach((c, i) => {
      const bolt = cyl(bolts, 0.11, 0.11, 0.7, -0.28 + i * 0.28, 0.35, 0, c, { rough: 0.85, seg: 16 });
      bolt.rotation.x = Math.PI / 2;
    });
    holoTag(bolts, "Cloth bolts", 0, 0.7, 0, { css: "#6bd6b8", w: 0.32 });

    const stagedBundles = group(g, -1.4, 0, -1.6, 0.5);
    for (let i = 0; i < 3; i++) box(stagedBundles, 0.3, 0.13, 0.24, 0, 0.07 + i * 0.15, 0, 0xdad4c8, { rough: 0.75, opacity: 0.92, transparent: true });
    holoTag(stagedBundles, "Inspected bundles", 0, 0.65, 0, { css: "#6bd6b8", w: 0.4 });

    const ext = group(g, 2.0, 0, 1.6, -0.7);
    cyl(ext, 0.055, 0.065, 0.4, 0, 0.32, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.022, 0.022, 0.08, 0, 0.56, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.68, 0, { css: "#d2312b", w: 0.3 });

    const crewA = standingFigure(g, -2.55, -0.9, { ry: 0.6, cloth: 0x3a5a52, trousers: 0x2b3138, vest: false });
    const crewB = standingFigure(g, 2.5, -1.2, { ry: -0.8, cloth: 0x5a4a44, trousers: 0x2b3138, vest: false });
    void crewA; void crewB;

    for (const zx of [-1.2, 0, 1.2]) box(g, 1.0, 0.04, 0.16, zx, 2.5, -0.6, 0xdfe4e8, { rough: 0.3, emissive: 0xf4f7fa, ei: 0.5, cast: false });

    let lightOn = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.85),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "light-box") { lightOn = true; lbSurface.material.emissiveIntensity = 1.4; skippedStitch.material.opacity = 0.9; puckeredSeam.material.opacity = 0.6; }
        if (step.id === "seam-defects") { skippedStitch.visible = false; puckeredSeam.visible = false; }
        if (step.id === "glove-up") { glovesHook.position.y -= 0.3; }
        if (step.id === "trim-threads") { /* threads trimmed */ }
        if (step.id === "fold-pack") {
          garment.parent.remove(garment);
          boxGroup.add(garment);
          garment.position.set(0, 0.28, 0);
          garment.scale.set(0.7, 1, 0.7);
        }
        if (step.id === "pack-checklist") { tissue.material.opacity = 0.9; sticker.material.opacity = 1; sealTape.material.opacity = 0.95; }
        if (step.id === "final-walk") { needleTip.visible = false; mixTray.visible = false; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "needle-alarm-boxed") { boxedBundle.position.x += 0.02; }
        if (it.id === "unlabeled-solvent") { unlabeledBottle.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "needle-alarm-boxed") { boxedBundle.position.x -= 0.02; }
        if (it.id === "unlabeled-solvent") { unlabeledBottle.visible = false; }
      },
      animate(t, dt, session) {
        void lightOn;
        const step = session?.step;
        if (step?.kind === "track" && step.id === "needle-scan" && session.holding) {
          wand.rotation.y = 0.3 + Math.sin(t * 3) * 0.5;
          wand.position.x = -0.4 + Math.sin(t * 3) * 0.35;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "spec-measure") {
          repaint(tapeGauge.userData.screen, signFace(`${(0.4 + gg.t * 0.6).toFixed(2)} in`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
      },
    };
  },
};
