import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, asphaltFace, gratingFace, plasterFace, gravelFace, grassFace, concreteFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Green Roof & Overburden Placement VR — Construction &
// Structural Trades, the Roofers and Waterproofers pack.
//
// A finished waterproofing membrane being built up into a green roof: root
// barrier heat-welded over the membrane, a drainage board strip, filter
// fabric ready for growing media, and a finished vegetated strip at the far
// end showing where the whole build-up ends up. The learner runs the root
// barrier, the fabric, the media and the irrigation check. A generic
// building, a generic system; no manufacturer or contractor is named.

const GROP_PAL = palette("construction");
const GROP_ACCENT = GROP_PAL.accent;
const GROP_CSS = "#f2c14b";

export const SIM_RF_GREEN_ROOF_AND_OVERBURDEN_PLACEMENT = {
  id: "rf-green-roof-and-overburden-placement",
  index: "rf8",
  domain: "Construction & Structural Trades",
  trade: "Roofer building up a green roof over finished waterproofing: root barrier, drainage layer, filter fabric, growing media and irrigation",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OSHA 29 CFR 1926.501 and 29 CFR 1926.502 fall protection at the roof edge, and 29 CFR 1926 Subpart M Fall protection generally; ANSI Z359 for the harness and anchor; 29 CFR 1926.1153 for dust from pouring lightweight growing media; NRCA and URW green-roof build-up practice; Roofers Local 40 apprenticeship and training",
  name: "Green Roof & Overburden Placement",
  title: simTitle("Green Roof & Overburden Placement"),
  tagline: "The build-up plan read, harness clipped, a puncture risk and a torn root barrier found, the structural load checked, the heat-weld area cleared, the root barrier rolled and welded, filter fabric rolled out, the irrigation line tested, growing media spread at a steady rate and its depth checked, an unweighted fabric edge and a missed leak found on the walk-round, and the day logged, with a gust lifting the fabric before it is weighted and a coworker downstream calling out a leak in the irrigation line along the way",
  accent: GROP_ACCENT,
  accentCss: GROP_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "build-up-weighted-clean", name: "Build-Up Weighted Clean", note: "Every layer welded, weighted and checked against the load plan before the media went down" },

  supportLine: "Roofers Local 40's member assistance programme, or your contractor's employee assistance line",

  game: system({
    name: "Overburden Run",
    currency: "LAYER",
    ranks: ["Apprentice", "Layer Hand", "Media Runner", "Lead Green-Roofer", "Green-Roof Certified"],
    badges: [
      { id: "plan-first", name: "Plan First", note: "The build-up plan read before the first layer went down", test: AWARD.stepClean("green-roof-plan") },
      { id: "steady-spread", name: "Steady Spread", note: "The media spread ran the whole strip without a break in pace", test: AWARD.unbroken },
      { id: "never-left-unweighted", name: "Never Left Unweighted", note: "No fabric left loose, no heat gun left hot, no load left unchecked", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-build", name: "Clean Build", note: "No corrections anywhere on this run", test: AWARD.clean },
      { id: "on-the-depth", name: "On The Depth", note: "The media depth reading committed inside band first time", test: AWARD.precise(0.7) },
      { id: "strip-closed", name: "Strip Closed", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "edge-no-tieback": "You are spreading growing media right up to the unprotected edge with your lanyard not clipped to anything. A green roof's edge does not become less of a fall hazard because there is soil and a sedum mat on it instead of bare membrane — the drop on the other side of it is exactly the same.",
    "heat-gun-idle-near-mulch": "The heat gun used to weld the root barrier seams is switched on and lying against the stack of dry coir erosion mats. Dry coir and mulch catch from a running heat gun the same way any dry fibrous material does, and the gun does not need to touch anything directly — sitting close for long enough is what it takes.",
    "media-dust-no-respirator": "You are pouring a bag of lightweight growing media without wetting it down or wearing a respirator, and the dust is billowing across the whole strip. Expanded shale and perlite blends throw a fine dust that behaves like any other nuisance and crystalline dust once it is airborne — wetted down or filtered through a respirator, it never gets the chance to.",
    "fabric-catch-wind": "The filter fabric you just rolled out is starting to lift at its free edge with nothing holding it down yet. Unweighted fabric on an open roof catches wind exactly the way an unclipped membrane sheet does, and a strip that lifts and folds back on itself has to be rolled out and aligned all over again — assuming it does not go over the edge first.",
  },

  lateNotes: {
    "seam-weld": "The seam is welded once the root barrier is actually rolled out and aligned — there is nothing to weld yet.",
    "media-depth-check": "Depth is checked once the media has actually been spread across that stretch — there is nothing to measure yet.",
    "log-board": "The log is written once the walk-round has found what it is going to find, not before.",
  },

  steps: [
    {
      id: "green-roof-plan", kind: "select", target: "plan-board",
      title: "Read the green roof build-up plan",
      cue: "Read the plan: the layer order, the growing media depth, the saturated load the structure is rated for, and the irrigation layout.",
      why: "A green roof's saturated weight is the heaviest this roof will ever carry, and the structural engineer has already worked out exactly how deep the media can go and where — the plan is what keeps 'looks like enough soil' from becoming a live load the roof was never designed to hold.",
    },
    {
      id: "harness-on", kind: "sequence",
      targets: ["harness", "anchor-clip"],
      itemNames: { harness: "full-body harness on and snugged", "anchor-clip": "lanyard clipped to the roof anchor" },
      outOfOrderNote: "Harness first — the lanyard clips to the back D-ring of a harness that is already on, not to one still on the rack.",
      title: "Harness on, then clipped to the roof anchor",
      cue: "Put the harness on and snug it, then clip the lanyard to the certified roof anchor before working toward the open edge.",
      why: "A green roof's edge is still an edge, soil and sedum on top of it or not, and 29 CFR 1926.502 makes the anchor, harness and connection one rated system rather than three pieces of gear that get treated as optional once the roof starts looking like a garden.",
    },
    {
      id: "membrane-inspect", kind: "find", noHint: true,
      targets: ["membrane-puncture-risk", "torn-root-barrier"],
      itemNames: { "membrane-puncture-risk": "sharp debris left on the finished membrane", "torn-root-barrier": "a torn root barrier roll" },
      itemNotes: {
        "membrane-puncture-risk": "A scrap of cut fastener wire is sitting on the finished membrane exactly where the root barrier is about to be rolled over it — buried under every layer above it, that scrap becomes a puncture nobody can find again until the roof leaks.",
        "torn-root-barrier": "One roll of root barrier has a split near its core. Rolled out anyway, that split is a gap in the one layer whose whole job is keeping roots from reaching the waterproofing underneath it.",
      },
      title: "Inspect the membrane and the root barrier stock before rolling anything out",
      cue: "Sweep the finished membrane for anything sharp, and check the root barrier rolls for damage before either goes down.",
      why: "Once the root barrier, drainage layer, fabric and media are all down, the membrane underneath them is not visible again for the life of the roof — which makes this the only point in the whole build-up where a sharp scrap or a torn roll can still be caught before it is buried under everything else.",
    },
    {
      id: "structural-load-check", kind: "gauge", target: "load-gauge",
      title: "Check the saturated load against the structural plan",
      cue: "Read the load gauge for this bay and commit once it sits inside the structural engineer's rated band for saturated media.",
      why: "A green roof's media weighs far more saturated than it does dry, and the structural rating in the plan already accounts for that worst case — reading the gauge before media goes down is what confirms this bay is actually built for the load about to go on it, not just close enough by eye.",
      gauge: {
        label: "SATURATED LOAD — STRUCTURAL BAND", speed: 0.55, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "under-loaded — check the plan" : t > 0.6 ? "over the rated band" : "within structural rating"),
        missNote: "Off the structural engineer's rated band. Check the plan for this bay again before media goes down.",
      },
    },
    {
      id: "mulch-clearance-check", kind: "select", target: "heat-gun",
      title: "Clear the heat-weld area before lighting the gun",
      cue: "Move the coir erosion mats and any dry mulch clear of the heat gun before it is switched on to weld the root barrier seams.",
      why: "The heat gun does the same job at the scale of a seam that a torch does at the scale of a whole roll, and it earns the same respect — combustible material clear of it before it is powered on, not noticed and moved after the first mat starts smouldering.",
    },
    {
      id: "root-barrier-roll", kind: "drag", target: "root-barrier-stack",
      title: "Roll the root barrier out over the membrane",
      cue: "Carry the root barrier roll out to the layout line and unroll it flat over the inspected membrane.",
      why: "The root barrier goes down first because everything above it depends on it being continuous — a gap left here is a gap every layer after it gets built directly on top of, with no way back down to fix it once the drainage board and media are in.",
      drag: { to: "layout-line", radius: 0.55, missNote: "Not on the layout line. Carry the roll all the way out and unroll it flat before letting go." },
    },
    {
      id: "seam-weld", kind: "hold", target: "seam-weld", seconds: 4,
      title: "Heat-weld the root barrier seam",
      cue: "Hold the heat gun steady over the seam until it has fused the full width of the overlap.",
      why: "A root barrier seam that is only lightly tacked looks welded from above and opens the first time a root or a settling load puts any tension across it — holding the gun steady until the whole overlap has actually fused is what makes the barrier one continuous sheet instead of two sheets resting against each other.",
      holdBreakNote: "The gun came off before the seam had fully fused — hold it steady a little longer over the overlap.",
    },
    {
      id: "fabric-roll", kind: "drag", target: "fabric-stack",
      title: "Roll the filter fabric out over the drainage layer",
      cue: "Carry the filter fabric out over the drainage board and unroll it flat, overlapping the previous strip.",
      why: "The filter fabric is what keeps the growing media from washing down into the drainage layer and clogging it, and it only does that job laid flat and fully overlapped — a gap or a fold here is fine sediment finding its way into the drains the very first time it rains.",
      drag: { to: "layout-line", radius: 0.55, missNote: "Not on the layout line. Carry the fabric all the way out and unroll it flat before letting go." },
    },
    {
      id: "irrigation-valve", kind: "turn", target: "irrigation-valve",
      title: "Open the irrigation test valve",
      cue: "Open the irrigation line's test valve and watch for a clean, even flow before it gets buried under media.",
      why: "The irrigation line is tested with the joint still visible because a leak found now is a fitting tightened in five minutes — the same leak found after the media is down is a line dug back out through however deep the growing media has already gone.",
      turn: { turns: 0.4, axis: "z", label: "IRRIGATION TEST VALVE", readout: (t) => (t < 0.5 ? "closed" : "flowing") },
    },
    {
      id: "media-spread", kind: "track", target: "media-spreader", seconds: 6,
      title: "Spread the growing media at a steady rate",
      cue: "Spread the growing media across the fabric at a steady rate — too slow leaves thin, uneven coverage, too fast raises dust and skips low spots.",
      why: "The plan's specified depth only comes out even if the media goes down at a steady rate — poured too slowly it piles unevenly and leaves thin patches that plants struggle in, poured too fast it throws dust across the whole strip and misses low spots that pool water the first time it rains.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, label: "MEDIA SPREAD RATE", readout: (v) => (v < 0.4 ? "too slow — uneven" : v > 0.62 ? "too fast — dusting" : "even depth") },
      holdBreakNote: "The spread rate broke out of the steady band. Bring it back to a steady rate before the depth goes uneven.",
    },
    {
      id: "media-depth-check", kind: "gauge", target: "media-depth-check",
      title: "Check the placed media depth",
      cue: "Push the depth probe into the spread media and commit once the reading sits inside the plan's specified depth band.",
      why: "A strip that looks evenly covered from standing height can still be running shallow in patches, and a shallow patch of growing media is exactly where the plants specified for this roof will be the first to struggle or die — the probe is what turns 'looks about right' into the depth the plan actually specifies.",
      gauge: {
        label: "GROWING MEDIA DEPTH", speed: 0.55, green: [0.42, 0.6],
        readout: (t) => `${Math.round(t * 12)} in`,
        missNote: "Off the plan's specified depth. Spread the thin patch again before it is covered by the next strip.",
      },
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["unweighted-fabric-edge", "missed-irrigation-leak"],
      itemNames: { "unweighted-fabric-edge": "a fabric edge left unweighted", "missed-irrigation-leak": "a small leak in the irrigation line" },
      itemNotes: {
        "unweighted-fabric-edge": "This stretch of fabric edge never got its weight or its media cover — left like this overnight, it is exactly what the next gust finds first.",
        "missed-irrigation-leak": "A fitting on the irrigation line is weeping slowly where it was tested — small enough to miss from a glance, and exactly the kind of leak that saturates one patch of media long before anyone notices from above.",
      },
      title: "Walk the whole build-up before it gets covered for good",
      cue: "Walk the finished strip against the plan: find the fabric edge left unweighted and the irrigation fitting still weeping.",
      why: "Once the vegetated layer goes down, nothing under it is visible again without tearing the roof back apart, which makes this walk-round the last real chance to catch an unweighted edge or a weeping fitting while either one is still a five-minute fix instead of a full excavation.",
    },
    {
      id: "log-board", kind: "select", target: "log-board",
      title: "Log the build-up, the finds and the readings",
      cue: "Write the puncture risk removed, the torn roll replaced, the load and depth readings, and the irrigation fix into the log.",
      why: "This build-up disappears under growing media and plants within days, so the log is the only record anyone will ever have of what the layers underneath the finished green roof actually looked like — the next person to dig into this roof reads this log before they ever put a shovel near it.",
    },
    {
      id: "crew-checkin", kind: "select", target: "radio",
      title: "Check in with the crew and the ground",
      cue: "Radio the crew working the next bay: this strip is welded, weighted, planted and logged, and name the support line.",
      why: "A green-roof crew works bay by bay across a whole roof, and a short check-in at the end of a strip is what confirms the load, the weighting and the irrigation on it are actually done before anyone treats it as finished ground to walk or stage material on.",
    },
  ],

  interrupts: [
    {
      id: "gust-lifts-fabric",
      kind: "Gust lifts the unweighted fabric",
      after: "fabric-roll", delay: 2, seconds: 14,
      alert: "A gust catches the free edge of the fabric you just rolled out, and it starts lifting and folding back on itself.",
      cue: "Get a weight bag on the fabric's edge before the gust folds the whole strip back.",
      target: "weight-bag",
      why: "Filter fabric with nothing holding it down is exactly as vulnerable to wind as an unclipped membrane sheet, and a strip that folds back on itself has to be unrolled, cleaned of whatever grit it picked up, and laid flat all over again — weighting the edge the moment it is down is what a rolled-out strip actually needs to survive the first gust.",
      missNote: "The fabric folded back on itself before the weight went on, dragging grit from the drainage board into a fold that will need re-laying before the media can go down on it.",
      wrongNote: "That does not hold lifting fabric down. Get the weight bag on the edge before it folds any further.",
    },
    {
      id: "irrigation-leak-downstream",
      kind: "Coworker radios a leak downstream",
      after: "media-spread", delay: 2, seconds: 14,
      alert: "A coworker working the next bay downstream radios that water is pooling at a fitting on the irrigation line, right where it is about to be buried under media.",
      cue: "Check the irrigation valve and shut it down before that fitting gets covered.",
      target: "irrigation-valve",
      why: "A leaking fitting buried under growing media does not announce itself again until the media above it is waterlogged and the plants in it are drowning, which is exactly why a leak reported anywhere on the line gets the valve checked immediately, before another wheelbarrow of media goes over the top of it.",
      missNote: "The fitting kept weeping while the media crew kept spreading, and the leak went under a fresh strip of growing media with nobody the wiser.",
      wrongNote: "Not that. Check the irrigation valve and shut it down before the leaking fitting is buried.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, GROP_ACCENT);

    // ------------------------------------------------------------ roof build-up, zone by zone
    const memTex = surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#2c2621", base2: "#241f1b", lanes: 0 }), { repeat: 2, px: 384 });
    const membraneZone = box(g, 1.7, 0.24, 5.6, -2.3, 0.12, 0, 0xffffff);
    membraneZone.material = texturedMat(memTex, { rough: 0.9, metal: 0.03, color: 0xb0a294 });
    const drainTex = surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 320 });
    const drainZone = box(g, 1.6, 0.02, 5.6, -0.6, 0.251, 0, 0xffffff);
    drainZone.material = texturedMat(drainTex, { rough: 0.5, metal: 0.4, color: 0x8a9096 });
    const fabricTex = surfaceTexture((cx, w, h) => plasterFace(cx, w, h, { base: "#d8d0b8", base2: "#cbc2a8" }), { repeat: 2, px: 320 });
    const fabricZone = box(g, 1.6, 0.015, 5.6, 1.0, 0.259, 0, 0xffffff);
    fabricZone.material = texturedMat(fabricTex, { rough: 0.9, metal: 0.0, color: 0xd8d0b8 });
    const mediaTex = surfaceTexture((cx, w, h) => gravelFace(cx, w, h, { base: "#5a4c38", base2: "#4c4030" }), { repeat: 2, px: 320 });
    const mediaZone = box(g, 1.6, 0.06, 5.6, 2.6, 0.28, 0, 0xffffff);
    mediaZone.material = texturedMat(mediaTex, { rough: 0.95, metal: 0.0, color: 0x6a5a44 });
    const grassTex = surfaceTexture((cx, w, h) => grassFace(cx, w, h, {}), { repeat: 3, px: 320 });
    const grassZone = box(g, 1.5, 0.02, 5.4, 2.6, 0.312, 0, 0xffffff);
    grassZone.material = texturedMat(grassTex, { rough: 0.9, metal: 0.0, color: 0x5a9a5a });
    grassZone.visible = false;
    for (const [px, pz, pw, pd] of [[0, -2.7, 6.4, 0.18], [-3.1, 0, 0.18, 5.6]]) {
      const wall = box(g, pw, 0.6, pd, px, 0.54, pz, 0xffffff);
      wall.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#a99c8b", tone2: "#988c7c" }), { repeat: 2, px: 256 }), { rough: 0.85, metal: 0.02, color: 0xc6bcae });
      box(g, pw + 0.06, 0.05, pd + 0.06, px, 0.87, pz, 0x8b949d, { rough: 0.5, metal: 0.5 });
    }
    const edgeHit = box(g, 0.4, 0.15, 5.4, 3.3, 0.32, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unprotected edge — tied off?", 3.3, 0.55, 0.5, { css: "#d2312b", w: 0.5 });
    reg(hits, edgeHit, "edge-no-tieback");

    const layoutMark = box(g, 1.4, 0.012, 0.9, -0.6, 0.246, 1.6, 0xd8c88a, { opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "layout line", -0.6, 0.4, 1.6, { css: GROP_CSS, w: 0.22 });
    reg(hits, layoutMark, "layout-line");

    // ------------------------------------------------------------ membrane inspect
    const sharpScrap = box(membraneZone, 0.04, 0.006, 0.02, 0.4, 0.126, -1.5, 0xc0c6cc, { rough: 0.4, metal: 0.7 });
    reg(hits, sharpScrap, "membrane-puncture-risk");

    // ------------------------------------------------------------ root barrier and heat gun
    const rbStack = group(g, -2.6, 0.24, 1.8);
    for (let i = 0; i < 2; i++) { const r = cyl(rbStack, 0.13, 0.13, 0.8, i * 0.28, 0.13, 0, 0x1c1e22, { rough: 0.6, metal: 0.2, seg: 14 }); r.rotation.z = Math.PI / 2; }
    holoTag(rbStack, "root barrier rolls", 0.14, 0.4, 0, { css: GROP_CSS, w: 0.32 });
    reg(hits, rbStack, "root-barrier-stack");
    const tornRoll = box(rbStack, 0.03, 0.02, 0.06, 0.28, 0.24, 0, 0x8a4a2a, { rough: 0.9 });
    reg(hits, tornRoll, "torn-root-barrier");
    const rbLaid = box(g, 1.6, 0.01, 5.6, -0.6, 0.246, 0, 0x1c1e22, { rough: 0.6, metal: 0.2 });
    rbLaid.visible = false;

    const heatGun = group(g, -1.9, 0.3, -2.0, 0.4);
    box(heatGun, 0.14, 0.06, 0.06, 0, 0.03, 0, 0x2b2b30, { rough: 0.5 });
    cyl(heatGun, 0.02, 0.025, 0.12, 0.1, 0.03, 0, 0x8a8f95, { rough: 0.4, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(heatGun, "heat gun", 0, 0.2, 0, { css: GROP_CSS, w: 0.2 });
    reg(hits, heatGun, "heat-gun");
    const mulchStack = group(g, -1.5, 0.24, -2.1);
    for (let i = 0; i < 3; i++) box(mulchStack, 0.4, 0.08, 0.3, 0, 0.04 + i * 0.1, 0, 0x6a5230, { rough: 0.95 });
    holoTag(mulchStack, "dry coir mats — clear of the gun?", 0, 0.4, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, mulchStack, "heat-gun-idle-near-mulch");
    const seamWeldMark = box(g, 1.5, 0.01, 0.1, -0.6, 0.247, 0.2, 0x1c1e22, { rough: 0.5 });
    holoTag(g, "root barrier seam", -0.6, 0.35, 0.2, { css: GROP_CSS, w: 0.28 });
    reg(hits, seamWeldMark, "seam-weld");
    const weldGlow = ball(g, 0.05, -0.6, 0.26, 0.2, 0xff8a4a, { emissive: 0xff8a4a, ei: 1.5, seg: 8 });
    weldGlow.visible = false;

    // ------------------------------------------------------------ fabric, irrigation, media
    const fabricStack = group(g, 1.0, 0.24, 1.8);
    for (let i = 0; i < 2; i++) { const r = cyl(fabricStack, 0.14, 0.14, 0.8, i * 0.3, 0.14, 0, 0xd8d0b8, { rough: 0.9, seg: 14 }); r.rotation.z = Math.PI / 2; }
    holoTag(fabricStack, "filter fabric rolls", 0.15, 0.4, 0, { css: GROP_CSS, w: 0.3 });
    reg(hits, fabricStack, "fabric-stack");
    const fabricLaid = box(g, 1.6, 0.01, 5.6, 1.0, 0.259, 0, 0xd8d0b8, { rough: 0.9 });
    fabricLaid.visible = false;
    const looseFabric = box(g, 0.6, 0.01, 0.8, -0.6, 0.26, -1.8, 0xd8d0b8, { rough: 0.9 });
    looseFabric.visible = false;

    const irrigation = group(g, 1.2, 0.28, -1.2, 0.4);
    hose(irrigation, [[-0.6, 0, 0], [0, 0.01, 0.05], [0.6, 0, 0]], 0.012, 0x2f6fd0, { steps: 12, rough: 0.6 });
    const valveHandle = box(irrigation, 0.03, 0.08, 0.02, 0, 0.05, 0, GROP_PAL.accent, { rough: 0.5 });
    holoTag(irrigation, "irrigation test valve", 0, 0.2, 0, { css: GROP_CSS, w: 0.32 });
    irrigation.userData.wheel = valveHandle;
    reg(hits, irrigation, "irrigation-valve");
    const leakPuddle = box(g, 0.4, 0.006, 0.4, 1.2, 0.248, -1.2, 0x3a5a6a, { opacity: 0.5, transparent: true, rough: 0.1, cast: false });
    leakPuddle.visible = false;

    const spreader = group(g, 2.2, 0.3, -0.9, -0.3);
    box(spreader, 0.5, 0.04, 0.35, 0, 0.02, 0, GROP_PAL.trim, { rough: 0.6, metal: 0.4 });
    holoTag(spreader, "media spreader", 0, 0.2, 0, { css: GROP_CSS, w: 0.28 });
    reg(hits, spreader, "media-spreader");
    const mediaBags = group(g, 2.7, 0.24, -2.2);
    for (let i = 0; i < 4; i++) box(mediaBags, 0.3, 0.16, 0.2, (i % 2) * 0.18, 0.08 + Math.floor(i / 2) * 0.17, (i % 2) * 0.06, 0x6a5a44, { rough: 0.9 });
    holoTag(mediaBags, "media dust — respirator on?", 0.15, 0.5, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, mediaBags, "media-dust-no-respirator");
    const dust = particles(g, 40, 0x9a8a70, { size: 0.045, life: 1.0, opacity: 0.4 });
    dust.position.set(2.7, 0.35, -2.2);
    const depthProbe = group(g, 2.6, 0.3, 1.2, 0.3);
    cyl(depthProbe, 0.012, 0.012, 0.3, 0, 0.15, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 8 });
    const depthFace = decal(depthProbe, 0.1, 0.05, 0, 0.32, 0, signFace("-- in", { bg: "#0d1c24", accent: GROP_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 128 });
    holoTag(depthProbe, "depth gauge", 0, 0.42, 0, { css: GROP_CSS, w: 0.24 });
    reg(hits, depthFace, "media-depth-check");
    const loadFace = decal(g, 0.14, 0.06, -2.3, 0.7, 0.6, signFace("--", { bg: "#0d1c24", accent: GROP_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 128 });
    holoTag(g, "load gauge", -2.3, 0.8, 0.6, { css: GROP_CSS, w: 0.24 });
    reg(hits, loadFace, "load-gauge");

    // ------------------------------------------------------------ wind hazard, weight bags, walk-round finds
    const windFabricEdge = box(g, 0.5, 0.012, 0.6, 1.7, 0.26, 2.4, 0xd8d0b8, { rough: 0.9 });
    holoTag(windFabricEdge, "fabric lifting?", 0, 0.3, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, windFabricEdge, "fabric-catch-wind");
    const flapFabric = box(g, 0.5, 0.012, 0.6, 1.7, 0.3, 2.6, 0xd8d0b8, { rough: 0.9 });
    flapFabric.visible = false;
    const weightBagPile = group(g, 0.3, 0.24, 2.2);
    for (let i = 0; i < 3; i++) box(weightBagPile, 0.22, 0.08, 0.14, i * 0.12, 0.04, 0, 0x3a4148, { rough: 0.8 });
    holoTag(weightBagPile, "weight bags", 0, 0.3, 0, { css: GROP_CSS, w: 0.24 });
    reg(hits, weightBagPile, "weight-bag");
    const bagOnFabric = box(g, 0.22, 0.09, 0.14, 1.7, 0.27, 2.6, 0x3a4148, { rough: 0.8 });
    bagOnFabric.visible = false;

    const unweightedMark = box(g, 0.5, 0.02, 0.5, -1.3, 0.26, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unweighted edge", -1.3, 0.42, -1.9, { css: GROP_CSS, w: 0.26 });
    reg(hits, unweightedMark, "unweighted-fabric-edge");
    const missedLeakMark = box(g, 0.3, 0.02, 0.3, 0.9, 0.28, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "weeping fitting", 0.9, 0.42, -1.6, { css: GROP_CSS, w: 0.28 });
    reg(hits, missedLeakMark, "missed-irrigation-leak");

    // ------------------------------------------------------------ crew, chest, boards
    const nextBayCrew = standingFigure(g, -0.4, -2.4, { ry: 0.6, vest: 0xd8f23a, helmet: GROP_PAL.accent, gloves: true });
    holoTag(nextBayCrew, "next-bay crew", 0, 2.0, 0, { css: GROP_CSS, w: 0.3 });
    const plantingCrew = standingFigure(g, 3.0, -1.6, { ry: -1.6, vest: 0xd8f23a, gloves: true, harness: true });
    holoTag(plantingCrew, "planting crew", 0, 2.0, 0, { css: GROP_CSS, w: 0.28 });
    const plantFlats = group(g, 2.6, 0.24, -2.6);
    for (let i = 0; i < 6; i++) box(plantFlats, 0.18, 0.05, 0.13, (i % 3) * 0.2, 0.025, Math.floor(i / 3) * 0.16, 0x3f6b3f, { rough: 0.9 });
    holoTag(plantFlats, "sedum flats", 0, 0.3, 0, { css: GROP_CSS, w: 0.24 });
    const chest = toolChest(g, -0.4, -1.5, { ry: 2.0, color: GROP_PAL.structure });
    chest.position.y = 0.24;
    const harnessRack = group(chest, -0.1, 0.79, 0, 0.3);
    box(harnessRack, 0.05, 0.5, 0.02, -0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.05, 0.5, 0.02, 0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.2, 0.05, 0.02, 0, -0.14, 0, 0xe07a3f, { rough: 0.8 });
    holoTag(harnessRack, "harness", 0, 0.35, 0, { css: GROP_CSS, w: 0.2 });
    reg(hits, harnessRack, "harness");
    const anchor = group(g, 0.4, 0.24, -0.6);
    cyl(anchor, 0.05, 0.07, 0.45, 0, 0.22, 0, GROP_PAL.accent, { rough: 0.5, metal: 0.4, seg: 10 });
    torus(anchor, 0.05, 0.012, 0, 0.48, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    holoTag(anchor, "anchor clip", 0, 0.65, 0, { css: GROP_CSS, w: 0.26 });
    reg(hits, anchor, "anchor-clip");
    const radio = instrument(chest, -0.14, 0.79, -0.04, { ry: -0.3, idle: "CH 3 · ROOF", color: GROP_PAL.accent, w: 0.1, d: 0.16 });
    holoTag(radio, "radio", 0, 0.16, 0, { css: GROP_CSS, w: 0.2 });
    reg(hits, radio, "radio");

    const plan = holoPanel(g, 0.95, 0.64, -2.5, 1.6, -1.0, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = GROP_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("GREEN ROOF BUILD-UP PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Root barrier + drainage + fabric + media", "Saturated load: per the structural engineer",
       "Media depth: per the plan", "Irrigation tested before burial",
       "NRCA + URW green-roof practice"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.7, accent: GROP_ACCENT });
    reg(hits, plan, "plan-board");
    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.35, 0.0, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = GROP_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("BUILD-UP LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Strip: —", "Finds: —", "Load + depth: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.1, accent: GROP_ACCENT });
    reg(hits, log, "log-board");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "membrane-inspect") { sharpScrap.material = mat(0x59c97b); tornRoll.material = mat(0x59c97b); }
        if (step.id === "root-barrier-roll") rbLaid.visible = true;
        if (step.id === "seam-weld") weldGlow.visible = true;
        if (step.id === "fabric-roll") fabricLaid.visible = true;
        if (step.id === "final-walk") { unweightedMark.material = mat(0x59c97b); missedLeakMark.material = mat(0x59c97b); }
        if (step.id === "log-board") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf0c8"; cx.fillText("BUILD-UP LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Strip: welded + weighted", "Finds: scrap + roll + edge + leak", "Load + depth: on the plan"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") { repaint(radio.userData.screen, signFace("STRIP PLANTED", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.36 })); grassZone.visible = true; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-lifts-fabric") flapFabric.visible = true;
        if (it.id === "irrigation-leak-downstream") leakPuddle.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-lifts-fabric") { flapFabric.visible = false; bagOnFabric.visible = true; }
        if (it.id === "irrigation-leak-downstream") leakPuddle.visible = false;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "irrigation-valve") valveHandle.rotation.x = session.turn.amount * Math.PI * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "structural-load-check") {
          repaint(loadFace, signFace(gg.t >= 0.42 && gg.t <= 0.6 ? "IN BAND" : gg.t < 0.42 ? "UNDER" : "OVER", { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (gg && !gg.committed && step?.id === "media-depth-check") {
          repaint(depthFace, signFace(`${Math.round(gg.t * 12)} in`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (weldGlow.visible) weldGlow.scale.setScalar(0.8 + 0.3 * Math.abs(Math.sin(t * 18)));
        if (flapFabric.visible) flapFabric.rotation.z = Math.sin(t * 5) * 0.2;
        dust.userData.step(dt ?? 0.016, new THREE.Vector3(0, 0, 0), 0.05, 0.3, -0.3);
        void paperFace;
      },
    };
  },
};
