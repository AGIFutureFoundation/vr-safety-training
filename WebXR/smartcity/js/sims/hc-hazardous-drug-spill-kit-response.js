import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hazardous Drug Spill Kit Response VR — Healthcare Support,
// station eight. A hazardous-drug spill outside a controlled pharmacy area —
// in a hallway, a patient room, wherever one actually happens — met with the
// kit built for exactly this rather than whatever's closest: the area
// restricted before anyone gets near it, PPE donned in the order that
// actually protects, the spill's size read against the kit's own rated
// capacity, absorbed and collected with the kit's own tools, every trace of
// secondary contamination found, sealed into the hazardous-drug stream and
// nowhere else, the surface decontaminated to the label's own contact time,
// and the whole incident logged before the kit is restocked for the next one.

const HDS_ACCENT = 0x9f5fd6;

export const SIM_HC_HAZARDOUS_DRUG_SPILL_KIT_RESPONSE = {
  id: "hc-hazardous-drug-spill-kit-response",
  index: "359",
  domain: "Healthcare Support",
  trade: "Environmental services technician",
  category: "Healthcare Support",
  indoor: "clinic",
  certification: "USP General Chapter <800> for handling hazardous drugs outside a controlled pharmacy area; OSHA 29 CFR 1910.1200 hazard communication for the spilled substance's own safety data sheet; OSHA 29 CFR 1910.134 respiratory protection where the spill calls for it; the CDC's general infection-prevention guidance for contaminated surfaces; SEIU-UHW and NUHW as the training bodies for environmental services staff",
  name: "Hazardous Drug Spill Kit Response",
  title: simTitle("Hazardous Drug Spill Kit Response"),
  tagline: "The area restricted first, PPE donned in order, the spill sized against the kit's own rated capacity, absorbed and collected with the kit's own tools, sealed into the hazardous-drug stream, decontaminated to the label's contact time, and logged",
  accent: HDS_ACCENT,
  accentCss: "#9f5fd6",
  parSeconds: 320,
  footprint: 2.5,
  badge: { id: "spill-contained", name: "Spill Contained", note: "A hazardous drug spill restricted, absorbed, sealed into its own waste stream and decontaminated start to finish" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or SEIU-UHW's member resources if a spill like this one has you more rattled than the shift usually is",

  game: system({
    name: "Spill Response Standard",
    currency: "SPILL",
    ranks: ["New Tech", "Spill Certified", "Lead Tech", "EVS Supervisor", "Hazardous Drug Certified"],
    badges: [
      { id: "area-restricted-first", name: "Area Restricted First", note: "Nobody near the spill before the area was actually cordoned", test: AWARD.stepClean("restrict-area") },
      { id: "right-stream", name: "Right Stream", note: "Every bit of contaminated waste sealed into the hazardous-drug stream and nowhere else", test: AWARD.stepClean("bag-waste") },
      { id: "logged-clean", name: "Logged Clean", note: "The incident logged and the kit restocked before the shift moved on", test: AWARD.stepClean("log-incident") },
    ],
    challenges: [
      { id: "clean-response", name: "Clean Response", note: "No corrections anywhere in the response", test: AWARD.clean },
      { id: "steady-wipe", name: "Steady Wipe", note: "Held the final decon wipe the whole time, first try", test: AWARD.unbroken },
      { id: "fast-response", name: "Fast Response", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "paper-towel-decoy": "That's an ordinary roll of paper towels sitting right by the spill. Paper towels don't absorb a hazardous drug spill the way the kit's own pads do, and pushing a spill around with the wrong material just spreads the contaminated area wider.",
    "wrong-glove-grade-decoy": "Those are ordinary exam gloves, not the kit's chemo-rated pair. A hazardous drug can permeate an exam glove in a way it can't get through the glove this kit was actually stocked with — the right pair is right next to the wrong one for a reason.",
    "regular-trash-decoy": "That's the regular trash bin, sitting closer than the hazardous-drug waste container. Anything that touched this spill goes into the dedicated stream — dropping it in whatever bin happens to be nearest turns ordinary trash into hazardous waste nobody downstream is expecting.",
    "food-drink-in-zone-decoy": "That coffee cup is sitting inside the restricted area. Nothing gets eaten, drunk, or set down open inside a zone that might still carry contamination — it comes out of the area before the response continues, not after someone almost picks it back up.",
  },

  lateNotes: {
    "spill-waste-bag": "Nothing sealed and ready yet — the waste has to actually be bagged first.",
    "restock-spill-kit": "Hold that. The final decon wipe hasn't been done yet.",
    "log-incident": "Not yet — the kit gets restocked before this incident is ready to close out.",
  },

  steps: [
    {
      id: "identify-spill", kind: "select", target: "identify-spill-per-sds",
      title: "Identify the spill against its own SDS",
      cue: "Check the spilled item's safety data sheet before doing anything else.",
      why: "The SDS is what tells you this is actually a hazardous drug and not something else that happens to look similar — responding to a spill without checking what it actually is means guessing at every decision that follows, from what PPE this calls for to which waste stream it eventually goes in.",
    },
    {
      id: "restrict-area", kind: "select", target: "restrict-area",
      title: "Restrict the area before anyone gets close",
      cue: "Set up barriers and keep everyone clear of the spill before PPE even comes out.",
      why: "A spill nobody's cordoned off is a spill anyone can walk through, touch, or track further down the hallway without ever knowing it happened — the barrier goes up before the response starts, not once someone's already wandered through the area and carried part of it somewhere else.",
    },
    {
      id: "ppe-don", kind: "sequence", anyOrder: false,
      targets: ["gown-don", "double-glove", "respirator-don"],
      itemNames: { "gown-don": "don the chemo-rated gown", "double-glove": "double-glove", "respirator-don": "don respiratory protection" },
      title: "Don PPE in the order that protects you",
      cue: "Gown first, then double-glove over the cuffs, then respiratory protection if the spill calls for it.",
      why: "USP <800> treats hazardous-drug PPE as a set donned in a specific order for a reason — a gown after gloves leaves a gap at the wrist, and respiratory protection last means it's the one thing you're not tempted to touch again once your gloved hands have already been near the spill.",
      outOfOrderNote: "Gown, then gloves over the cuffs, then respiratory protection — that order is what keeps the gap at your wrist from ever opening.",
    },
    {
      id: "size-check", kind: "gauge", target: "spill-size-assessment",
      title: "Read the spill against the kit's rated capacity",
      cue: "Assess the spill's size and confirm it's within what this kit is actually rated to handle.",
      why: "Every spill kit is rated for a maximum size in its own instructions — committing to clean up a spill bigger than that rating with a kit that isn't built for it just means running out of absorbent mid-response with contamination still spreading.",
      gauge: { label: "SPILL SIZE", speed: 0.6, green: [0.1, 0.55], readout: (t) => (t > 0.55 ? "past this kit's rating" : "within this kit's rating"), missNote: "Committed on a spill you never actually confirmed was within this kit's rating. A spill that size needs the larger response, not a guess that this kit will stretch to cover it." },
    },
    {
      id: "absorb-spill", kind: "select", target: "absorb-spill",
      title: "Absorb the spill with the kit's own pads",
      cue: "Lay the kit's absorbent pads over the spill from the outside edge in.",
      why: "Working from the outside edge in is what keeps the contaminated area from spreading further while it's being absorbed — the kit's own pads are rated for this exact chemistry in a way a generic paper product never is.",
    },
    {
      id: "collect-fragments", kind: "select", target: "sharps-from-spill",
      title: "Collect any fragments with the kit's scoop",
      cue: "Use the kit's small scoop and forceps to collect broken glass or vial fragments — never by hand.",
      why: "A hazardous drug spill that includes broken glass is two hazards stacked in the same footprint — the scoop and forceps in the kit exist so no bare or gloved hand ever has to close around a fragment that's both sharp and contaminated at the same time, in the same motion.",
    },
    {
      id: "secondary-scan", kind: "find", noHint: true,
      targets: ["contaminated-linen", "satellite-droplets"],
      itemNames: { "contaminated-linen": "linen that caught part of the spill", "satellite-droplets": "a trail of smaller droplets leading away from the spill" },
      itemNotes: {
        "contaminated-linen": "That linen caught part of the spill before you even got here — it goes into the same hazardous-drug stream as everything else this response collects, not the regular laundry bin.",
        "satellite-droplets": "A trail of smaller droplets means this spill travelled further than the main puddle shows — the response isn't done until every one of them is found and absorbed, not just the part that was obvious from the doorway.",
      },
      title: "Scan for where the spill actually reached",
      cue: "Two things near this spill are still contaminated and easy to miss. Find them.",
      why: "A spill's visible edge is rarely its actual edge — this scan is what catches the linen it soaked into and the trail it left, because a response that stops at the obvious puddle can still leave real contamination sitting a few feet away, waiting for the next person who walks through unaware.",
    },
    {
      id: "bag-waste", kind: "select", target: "double-bag-waste",
      title: "Seal everything into the hazardous-drug stream",
      cue: "Place every absorbent pad, glove, and contaminated item into the hazardous-drug waste bag and seal it.",
      why: "Every item this spill touched — pads, gloves, linen, the gown itself — belongs in one dedicated stream, sealed, because a hazardous-drug waste bag with a gap in what it actually contains isn't a contained spill, it's a contained puddle with contaminated items still sitting around it.",
    },
    {
      id: "clean-surface", kind: "select", target: "clean-with-detergent",
      title: "Clean the surface with detergent and water",
      cue: "Wash the affected surface with detergent solution after the spill itself is fully absorbed.",
      why: "Absorbing the spill removes the bulk of it; the detergent wash is what actually breaks down whatever residue is left behind on the surface itself, which is a genuinely separate step from soaking up the liquid, not a shortcut that happens automatically once the puddle itself is gone.",
    },
    {
      id: "final-decon", kind: "track", target: "final-decon-wipe", seconds: 6,
      title: "Hold the final decon wipe to its contact time",
      cue: "Wipe the surface and keep steady, even pressure — not too light, not scrubbing hard enough to spread anything — for the label's full contact time.",
      why: "The decontaminating solution's own label sets how long it has to stay in contact with the surface to actually work, and pressure matters too — too light and it barely touches the surface, too hard and you risk spreading residue instead of lifting it.",
      track: {
        start: 0.15, green: [0.3, 0.6], rise: 0.45, fall: 0.35, drift: 0.1, label: "WIPE PRESSURE",
        readout: (v) => (v < 0.3 ? "too light — residue stays put" : v > 0.6 ? "too hard — you're spreading it" : "even pressure, per the label"),
      },
      holdBreakNote: "The wipe came off pressure before the label's contact time was up. A decon pass that stops early hasn't actually broken down what's left on the surface.",
    },
    {
      id: "waste-transport", kind: "drag", target: "spill-waste-bag",
      title: "Move the sealed bag to the hazardous-drug bin",
      cue: "Carry the sealed waste bag to the dedicated hazardous-drug waste container, not the general or regulated one.",
      why: "The hazardous-drug bin is tracked and disposed of under its own rule, kept entirely separate from general and regulated medical waste — a bag that ends up in the wrong container is waste that gets handled under a rule that was never written for what it actually contains.",
      drag: { to: "haz-drug-waste-bin", radius: 0.4, missNote: "Not in the hazardous-drug bin — this waste doesn't belong in general or regulated streams, only its own." },
    },
    {
      id: "restock-kit", kind: "turn", target: "restock-spill-kit",
      title: "Restock the spill kit",
      cue: "Turn the kit's restock indicator once every component is replaced.",
      turn: { turns: 0.4, axis: "y", label: "KIT RESTOCK" },
      why: "A spill kit that's been used and never restocked is a kit that looks perfectly ready sitting on its shelf and isn't — turning it back to ready is what makes sure the next spill, whenever and wherever it happens, finds a full kit waiting instead of an empty box with the label still facing out.",
    },
    {
      id: "doff-ppe-hd", kind: "sequence",
      targets: ["outer-gloves-off", "gown-off-hd", "respirator-off", "inner-gloves-off"],
      itemNames: { "outer-gloves-off": "remove the outer gloves", "gown-off-hd": "remove the gown", "respirator-off": "remove respiratory protection", "inner-gloves-off": "remove the inner gloves" },
      title: "Doff PPE in the order that keeps you clean",
      cue: "Outer gloves first, then the gown, then respiratory protection, then the inner gloves last.",
      why: "The most contaminated layer comes off first and the layer closest to your bare skin comes off last — reverse that order and a hand that just touched the outside of a contaminated gown is the hand about to touch your own face on the way to removing a respirator.",
      outOfOrderNote: "Outer gloves, then gown, then respirator, then inner gloves last — that sequence is what keeps the most contaminated layer away from your skin the longest.",
    },
    {
      id: "log-incident", kind: "select", target: "log-incident",
      title: "Log the spill incident",
      cue: "Record what happened, the response taken, and that the area is cleared.",
      why: "The log is what turns this response into something the facility can actually review — a pattern of spills in the same spot, a kit that keeps running short, a training gap — none of that is visible to anyone if this incident only exists as something you remember handling.",
    },
  ],

  interrupts: [
    {
      id: "spill-larger-than-expected",
      kind: "Spill exceeds kit rating",
      after: "size-check", delay: 3, seconds: 12,
      alert: "Once you start absorbing, the spill turns out to have spread further than it first looked — past what this kit is actually rated for.",
      cue: "This kit doesn't stretch to cover a bigger spill than it's built for.",
      target: "call-large-spill-response",
      why: "A kit rated for a certain size doesn't get pushed past that rating by using more of it than it's supposed to hold — a spill that turns out to be bigger gets escalated to the larger response this facility has for exactly that situation, not absorbed with a kit that's already running short.",
      missNote: "The response kept going with an undersized kit stretched past its rating. Whatever the kit ran out of partway through is still sitting there, uncontained.",
      wrongNote: "Call for the larger response — this kit was never rated to cover a spill this size.",
    },
    {
      id: "bystander-approaches-zone",
      kind: "Someone approaches the restricted area",
      after: "clean-surface", delay: 3, seconds: 11,
      alert: "A coworker walks up and leans on the counter right at the edge of the restricted zone, unaware anything happened here.",
      cue: "The barrier only works if it's actually enforced.",
      target: "restrict-area",
      why: "A restricted zone that people wander up to unchallenged isn't actually restricted — reinforcing the barrier the moment someone gets close is what keeps the whole response's containment meaningful all the way through, not just at the moment it was first set up.",
      missNote: "The coworker stayed leaned against the counter, right at the edge of a zone that was supposed to be kept clear. The barrier existed on the floor but not in practice.",
      wrongNote: "Reinforce the barrier — a restricted zone nobody enforces isn't actually restricted.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, HDS_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#d8cfe0", base2: "#ccc3d6", seam: "rgba(0,0,0,0.12)",
    }), { repeat: 4, px: 256 });
    const floorMat = () => texturedMat(floorTex, { rough: 0.55, metal: 0.03, color: 0xe1d8ec });
    const floorPatch = slab(g, 3.6, 0.006, 3.4, 0, 0.001, 0, 0xe1d8ec, { radius: 0.05, cast: false });
    floorPatch.material = floorMat();

    // ------------------------------------------------------------------ the spill
    const spillZone = group(g, 0, 0, -1.4);
    const spillPuddle = box(spillZone, 0.5, 0.005, 0.5, 0, 0.003, 0, 0x6b3f8a, { rough: 0.3, opacity: 0.6, transparent: true, cast: false });
    holoTag(spillZone, "Hazardous drug spill", 0, 0.2, 0, { css: HDS_ACCENT, w: 0.5 });
    const sdsCard = decal(g, 0.3, 0.4, -1.2, 1.3, -2.7,
      paperFace("SAFETY DATA SHEET", ["Hazardous drug", "See label for handling"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 220 });
    reg(hits, sdsCard, "identify-spill-per-sds");

    // Barrier stand for the restricted area.
    const barrier = group(g, -1.4, 0, -1.4);
    cyl(barrier, 0.03, 0.03, 0.9, 0, 0.45, 0, 0xf2c14b, { rough: 0.5, seg: 10 });
    box(barrier, 0.4, 0.06, 0.02, 0.2, 0.8, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(barrier, "Restrict area", 0, 1.0, 0, { css: HDS_ACCENT, w: 0.4 });
    reg(hits, barrier, "restrict-area");

    // Coffee cup decoy inside the restricted zone.
    const coffeeCup = cyl(g, 0.03, 0.025, 0.08, 0.6, 0.86, -1.8, 0xf4f8fa, { rough: 0.5, seg: 12 });
    holoTag(coffeeCup, "Coffee in the zone", 0, 0.08, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, coffeeCup, "food-drink-in-zone-decoy");

    // ------------------------------------------------------------------- PPE cart
    const ppeCart = group(g, -2.6, 0, -2.4);
    box(ppeCart, 0.5, 0.06, 0.4, 0, 0.86, 0, 0x53585e, { rough: 0.55, metal: 0.35 });
    const gownStack = box(ppeCart, 0.2, 0.1, 0.3, -0.1, 0.92, 0, 0x9f5fd6, { rough: 0.7, opacity: 0.8, transparent: true });
    reg(hits, gownStack, "gown-don");
    const gloveBoxOuter = box(ppeCart, 0.16, 0.08, 0.14, 0.14, 0.9, 0.1, 0x59c9a0, { rough: 0.7 });
    holoTag(gloveBoxOuter, "Chemo gloves", 0, 0.06, 0, { css: HDS_ACCENT, w: 0.32 });
    reg(hits, gloveBoxOuter, "double-glove");
    const respirator = box(ppeCart, 0.14, 0.1, 0.1, 0.14, 1.02, -0.05, 0x2b3138, { rough: 0.5, metal: 0.3 });
    reg(hits, respirator, "respirator-don");

    // Wrong-grade gloves decoy right beside the correct pair.
    const wrongGloves = box(ppeCart, 0.16, 0.08, 0.14, -0.15, 0.9, 0.1, 0xf4e08a, { rough: 0.7 });
    holoTag(wrongGloves, "Exam gloves only", 0, 0.06, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, wrongGloves, "wrong-glove-grade-decoy");

    // ------------------------------------------------------------------- gauges
    const sizeGauge = instrument(g, -0.9, 0.9, -2.6, { idle: "-- %", color: HDS_ACCENT, w: 0.16, d: 0.2, ry: 0.3 });
    reg(hits, sizeGauge, "spill-size-assessment");

    // Absorbent pads and scoop kit beside the spill.
    const kitBox = group(g, 1.1, 0, -2.0);
    box(kitBox, 0.5, 0.2, 0.35, 0, 0.1, 0, 0x9f5fd6, { rough: 0.5, metal: 0.2 });
    const absorbentPads = box(kitBox, 0.4, 0.02, 0.28, 0, 0.21, 0, 0xf4f8fa, { rough: 0.7 });
    reg(hits, absorbentPads, "absorb-spill");
    const scoopTool = group(kitBox, 0.2, 0.22, 0.1);
    cyl(scoopTool, 0.006, 0.006, 0.14, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    reg(hits, scoopTool, "sharps-from-spill");

    // Paper towel roll decoy right by the spill.
    const paperTowels = cyl(g, 0.06, 0.06, 0.24, 0.7, 0.12, -1.2, 0xf4f8fa, { rough: 0.6, seg: 12 });
    holoTag(paperTowels, "Wrong absorbent", 0, 0.16, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, paperTowels, "paper-towel-decoy");

    // Contaminated linen and satellite droplets near the spill.
    const linen = box(spillZone, 0.3, 0.02, 0.2, -0.4, 0.01, 0.3, 0xe4e9ea, { rough: 0.75 });
    holoTag(linen, "Caught the spill", 0, 0.05, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, linen, "contaminated-linen");
    const droplets = group(spillZone, 0.5, 0, 0.4);
    for (let i = 0; i < 4; i++) ball(droplets, 0.012, i * 0.12, 0.002, 0, 0x6b3f8a, { rough: 0.4, opacity: 0.6, transparent: true, seg: 8 });
    holoTag(droplets, "Droplet trail", 0, 0.06, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, droplets, "satellite-droplets");

    // ------------------------------------------------------------------ waste bins
    const hazBin = group(g, 2.4, 0, -1.6);
    cyl(hazBin, 0.2, 0.18, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.55, seg: 14 });
    decal(hazBin, 0.26, 0.1, 0, 0.42, 0.181, signFace("HAZARDOUS DRUG", { bg: "#3a1a4a", accent: "#c99aff", scale: 0.32 }));
    const hazBinSlot = box(hazBin, 0.3, 0.3, 0.3, 0, 0.4, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["haz-drug-waste-bin"] = hazBinSlot;

    const regularTrash = group(g, 1.8, 0, -2.6);
    cyl(regularTrash, 0.18, 0.16, 0.45, 0, 0.22, 0, 0x8b929a, { rough: 0.55, seg: 14 });
    holoTag(regularTrash, "General trash", 0, 0.48, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, regularTrash, "regular-trash-decoy");

    const wasteBag = group(g, 1.1, 0, -1.0);
    box(wasteBag, 0.3, 0.35, 0.06, 0, 0.2, 0, 0xf2c14b, { rough: 0.6, opacity: 0.85, transparent: true });
    reg(hits, wasteBag, "double-bag-waste");
    const wasteBagMove = wasteBag;
    reg(hits, wasteBagMove, "spill-waste-bag");

    // ------------------------------------------------------------------ decon
    const detergentBottle = cyl(g, 0.035, 0.04, 0.16, -0.6, 0.12, -0.9, 0x59c97b, { rough: 0.4, seg: 10 });
    reg(hits, detergentBottle, "clean-with-detergent");
    const deconPanel = holoPanel(g, 0.5, 0.34, -1.4, 1.6, -3.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9f5fd6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eee0ff";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("-- sec wipe", w * 0.08, h * 0.4);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("per the label", w * 0.08, h * 0.72);
    }, { accent: HDS_ACCENT });
    reg(hits, deconPanel, "final-decon-wipe");

    const restockLever = group(g, -2.4, 0, -0.2);
    box(restockLever, 0.14, 0.3, 0.12, 0, 0.15, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    const restockDial = cyl(restockLever, 0.05, 0.05, 0.03, 0, 0.32, 0, 0xf2c14b, { rough: 0.5, seg: 12 });
    holoTag(restockLever, "Restock kit", 0, 0.4, 0, { css: HDS_ACCENT, w: 0.36 });
    reg(hits, restockDial, "restock-spill-kit");

    // ------------------------------------------------------------------ doffing
    const doffZone = group(g, 2.4, 0, 1.0, 0.4);
    box(doffZone, 0.4, 0.02, 0.4, 0, 0.001, 0, 0x2b3138, { rough: 0.6, opacity: 0.4, transparent: true, cast: false });
    const outerGloveOff = box(doffZone, 0.1, 0.02, 0.1, -0.12, 0.02, 0, 0x59c9a0, { rough: 0.7 });
    reg(hits, outerGloveOff, "outer-gloves-off");
    const gownOff = box(doffZone, 0.16, 0.02, 0.1, -0.12, 0.02, 0.16, 0x9f5fd6, { rough: 0.7, opacity: 0.8, transparent: true });
    reg(hits, gownOff, "gown-off-hd");
    const respiratorOff = box(doffZone, 0.1, 0.02, 0.08, 0.12, 0.02, 0, 0x2b3138, { rough: 0.7 });
    reg(hits, respiratorOff, "respirator-off");
    const innerGloveOff = box(doffZone, 0.08, 0.02, 0.08, 0.12, 0.02, 0.16, 0x9fd6c0, { rough: 0.7 });
    reg(hits, innerGloveOff, "inner-gloves-off");
    holoTag(doffZone, "Doffing station", 0, 0.3, 0, { css: HDS_ACCENT, w: 0.4 });

    const logPanel = holoPanel(g, 0.5, 0.34, -2.7, 1.4, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9f5fd6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eee0ff";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SPILL LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: in progress", w * 0.06, h * 0.6);
    }, { accent: HDS_ACCENT, ry: 0.6 });
    reg(hits, logPanel, "log-incident");

    // Large-spill escalation and reinforced-barrier interrupt targets.
    const escalatePanel = group(g, -3.0, 0, 1.4);
    box(escalatePanel, 0.1, 0.02, 0.16, 0, 1.0, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    const escalateLamp = ball(escalatePanel, 0.012, 0, 1.05, 0.01, 0x59c97b, { emissive: 0x59c97b, ei: 0.4, cast: false, seg: 8, seg2: 6 });
    holoTag(escalatePanel, "Large-spill response", 0, 1.1, 0, { css: HDS_ACCENT, w: 0.46 });
    reg(hits, escalatePanel, "call-large-spill-response");

    const tech = standingFigure(g, -0.6, 1.4, { ry: -0.6, cloth: 0x6a3f8a, skin: 0xb98a63 });
    void tech;

    // Eyewash station and first-aid cabinet along the wall — the room this
    // spill happened in, not just the kit named in the steps.
    const eyewash = group(g, 3.3, 0, -0.4);
    cyl(eyewash, 0.02, 0.02, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    ball(eyewash, 0.05, 0, 0.92, 0.1, 0xdfe8ee, { rough: 0.3, opacity: 0.6, transparent: true, seg: 10, seg2: 10 });
    ball(eyewash, 0.05, 0, 0.92, -0.1, 0xdfe8ee, { rough: 0.3, opacity: 0.6, transparent: true, seg: 10, seg2: 10 });
    decal(eyewash, 0.16, 0.06, 0, 0.7, 0.02, signFace("EYEWASH", { bg: "#123a1e", accent: "#59c97b", scale: 0.5 }), { px: 96 });
    holoTag(eyewash, "Eyewash station", 0, 1.0, 0, { css: HDS_ACCENT, w: 0.42 });

    const firstAid = group(g, 3.3, 0, 1.6);
    box(firstAid, 0.32, 0.4, 0.14, 0, 1.1, 0, 0xd8342a, { rough: 0.55 });
    box(firstAid, 0.28, 0.36, 0.02, 0, 1.1, 0.071, 0xf2e9c9, { rough: 0.5 });
    decal(firstAid, 0.2, 0.14, 0, 1.14, 0.081, signFace("FIRST AID", { bg: "#7d1512", accent: "#f2ae14", scale: 0.4 }), { px: 96 });
    box(firstAid, 0.24, 0.03, 0.1, 0, 0.9, 0.05, 0xf2e9c9, { rough: 0.5 });
    box(firstAid, 0.06, 0.02, 0.06, -0.06, 0.94, 0.08, 0xf0645b, { rough: 0.6 });
    box(firstAid, 0.06, 0.02, 0.06, 0.06, 0.94, 0.08, 0xdfe4e5, { rough: 0.6 });

    // A second EVS crew figure and a rolling equipment cart for depth.
    const secondTech = standingFigure(g, -1.5, 2.6, { ry: 0.8, cloth: 0x3f6fa0, skin: 0xd9a985 });
    void secondTech;
    const rollingCart = group(g, 2.5, 0, 2.3);
    box(rollingCart, 0.5, 0.03, 0.32, 0, 0.5, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    box(rollingCart, 0.5, 0.03, 0.32, 0, 0.78, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(rollingCart, 0.03, 0.03, 0.03, sx * 0.22, 0.03, sz * 0.14, 0x14171a, { rough: 0.7, seg: 10 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(rollingCart, 0.008, 0.008, 0.44, sx * 0.22, 0.28, sz * 0.14, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 6 });
    holoTag(rollingCart, "Equipment cart", 0, 1.0, 0, { css: HDS_ACCENT, w: 0.4 });

    // Supply shelving for depth.
    const shelf = group(g, -3.7, 0, 2.0);
    box(shelf, 0.06, 1.4, 0.6, -0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelf, 0.06, 1.4, 0.6, 0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "SPILL KITS", 0x9f5fd6], [0.7, "GOWNS", 0xdfe4e5], [1.1, "SDS BINDERS", 0xf2c14b],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelf, 0.74, 0.02, 0.58, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelf, 0.2, 0.14, 0.18, i * 0.24, y + 0.08, 0, c, { rough: 0.7 });
        decal(shelf, 0.16, 0.05, i * 0.24, y + 0.08, 0.091, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#eee0ff"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelf, "Spill supplies", 0, 1.45, 0, { css: HDS_ACCENT, w: 0.42 });

    const decontaminationBubbles = particles(g, 12, 0xc99aff, { size: 0.01, life: 0.4, additive: false, opacity: 0.4 });

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -1.8),

      onStepComplete(step) {
        if (step.id === "absorb-spill") spillPuddle.visible = false;
        if (step.id === "secondary-scan") { linen.visible = false; droplets.visible = false; }
        if (step.id === "bag-waste") { absorbentPads.visible = false; wasteBag.material = mat(0xf2c14b, { rough: 0.6 }); }
        if (step.id === "waste-transport") {
          wasteBag.parent.remove(wasteBag);
          hazBin.add(wasteBag);
          wasteBag.position.set(0, 0.35, 0);
        }
        if (step.id === "restock-kit") restockDial.rotation.y = Math.PI;
        if (step.id === "log-incident") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,6,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#9f5fd6"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#eee0ff";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("SPILL LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: closed · area cleared", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "spill-larger-than-expected") escalateLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
        if (it.id === "bystander-approaches-zone") barrier.rotation.y = 0.5;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "spill-larger-than-expected") escalateLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.4 });
        if (it.id === "bystander-approaches-zone") barrier.rotation.y = 0;
      },

      onHazard() {},

      animate(t, dt, session) {
        decontaminationBubbles.visible = session?.step?.id === "final-decon" && !!session.holding;
        if (decontaminationBubbles.visible) decontaminationBubbles.userData.step(dt, new THREE.Vector3(0, 0.5, -1.4), 0.1, 0.2, 0.3);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "size-check") {
          repaint(sizeGauge.userData.screen, signFace(gg.t > 0.55 ? "OVER" : "OK", {
            bg: "#0d1c24", accent: gg.t > 0.55 ? "#f0645b" : "#59c97b", fg: "#eee0ff", scale: 0.6,
          }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "final-decon") {
          repaint(deconPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,6,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = tr.v >= 0.3 && tr.v <= 0.6 ? "#59c97b" : "#f2ae14"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#eee0ff";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText(`${(tr.v * 40).toFixed(0)} sec wipe`, w * 0.08, h * 0.4);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("per the label", w * 0.08, h * 0.72);
          });
        }
        void t;
      },
    };
  },
};
