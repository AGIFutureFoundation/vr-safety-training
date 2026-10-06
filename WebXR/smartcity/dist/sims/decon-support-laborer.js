import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Decon Support Laborer VR — Hunters Point Edition, Community
// Environmental Justice, the trained-worker pathway.
//
// A hazmat and environmental laborer working the decon corridor from the
// clean side, as the support role rather than the entrant: stocking the wash
// and rinse stations, keeping the water inside the containment pool, washing
// down the entrants who come through, wiping tools in the order they come
// out, bagging outer suits, drumming and labelling the wastewater, and
// logging the corridor. No real site, crew or incident is depicted — the
// parcel and the corridor are generic, the way every station in this edition
// is. Station decon-line covers running a corridor at an emergency; this is
// the routine, unhurried version a cleanup crew runs every shift.

const DSL_ACCENT = 0x7fd4b0;

export const SIM_DECON_SUPPORT_LABORER = {
  id: "decon-support-laborer",
  index: "168",
  domain: "Environmental",
  trade: "Hazmat and environmental laborer — LIUNA",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  certification: "LIUNA hazmat and environmental laborer, decon-line support role; OSHA 29 CFR 1910.120 HAZWOPER decontamination procedures; 29 CFR 1910.134 respiratory and PPE selection for the decon crew's own protection; EPA hazardous-waste labeling and manifesting requirements for drummed wastewater; the Regional Water Quality Control Board's (RWQCB) discharge prohibitions on containment water leaving the corridor",
  name: "Decon Support Laborer",
  title: simTitle("Decon Support Laborer"),
  tagline: "Working the decon corridor from the clean side: stations stocked, the pool contained, entrants washed and tools wiped in order, suits bagged, wastewater drummed and labelled, the corridor logged",
  accent: DSL_ACCENT,
  accentCss: "#7fd4b0",
  parSeconds: 270,
  footprint: 2.4,
  badge: { id: "corridor-supported", name: "Corridor Supported", note: "The line stocked, contained and logged, with every entrant washed clean and every drum labelled before it moved" },

  game: system({
    name: "Decon Support",
    currency: "RINSE",
    ranks: ["Ground Hand", "Wash Station Hand", "Corridor Support Lead", "Decon Support Authority", "Decon Support Certified"],
    badges: [
      { id: "contained-it", name: "Contained It", note: "Never let wash water or a drum leave this corridor uncontrolled", test: AWARD.safe },
      { id: "clean-line", name: "Clean Line", note: "No corrections anywhere on the corridor", test: AWARD.clean },
      { id: "steady-hand", name: "Steady Hand", note: "Held the pool level and the rinse rate close to band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "line-up-fast", name: "Line Up Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "nine-straight", name: "Nine Straight", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "bare-hands-wash": "You reached for the entrant's boots without your own gloves and apron on. Whatever this corridor is washing off someone else's suit and boots does not stop being a hazard just because it is now in the wash water on your hands — the support laborer works this line in the same level of protection the water itself calls for, every time, not only when the entrant looks obviously dirty.",
    "runoff-to-drain": "You ran a hose past the berm and let wash water head for the storm drain instead of the containment pool. This corridor's whole purpose is keeping whatever came off the entrant's PPE inside a system somebody can test and dispose of correctly — a hose aimed outside the berm turns a controlled decon line into an uncontrolled discharge with your name on the log.",
    "reuse-dirty-rag": "You wiped the next tool down with the rag that's already black from the last one. A wipe that just spread contamination from one tool to the next hasn't decontaminated anything — it has only moved whatever was on the dirty tool onto a tool that was supposed to leave this line clean.",
    "roll-unlabeled-drum": "You started rolling a full drum toward the load-out truck without checking it was labeled and sealed. A drum of decon wastewater with nothing written on it is a drum nobody downstream can legally accept, characterize or dispose of — once it is on the truck, whatever chance there was to fix that is gone.",
  },

  lateNotes: {
    "wash-station": "Nothing to wash yet — the pool has to actually be charged and holding water before anyone stands in it.",
    "waste-drum": "Nothing to drum until the wash and rinse stations have actually been run for the shift.",
  },

  interrupts: [
    {
      id: "entrant-steps-out",
      kind: "Entrant left the corridor early",
      after: "boots-wash", delay: 3, seconds: 12,
      alert: "The entrant you just started on climbs out of the boot-wash pool and starts walking toward the tool crib, still in a suit that hasn't been rinsed.",
      cue: "They just left the corridor before the rinse. Call them back.",
      target: "recall-point",
      why: "The corridor only works as a sequence — wash, then rinse — and a suit that stops after the wash is a suit that still has whatever the wash loosened sitting on its surface, not removed from it. Calling the entrant back to the recall point the instant they step out is the support laborer's job precisely because the entrant, tired and half-decontaminated, is the person least likely to notice they skipped a stage.",
      missNote: "They kept walking toward the tool crib and the rest of the site in a suit that was only half washed, carrying whatever the first pool loosened onto everything they touched next — the crib, the door handle, the next person who shook their hand.",
      wrongNote: "Not another pass at the boots — the entrant already left the pool. Call them back to the corridor before anything else here.",
    },
    {
      id: "pool-overflow",
      kind: "Containment pool rising",
      after: "glove-rinse", delay: 3, seconds: 13,
      alert: "The containment pool behind you has climbed almost to the top of the berm while your attention was on the rinse, and the next wash pass will put it over.",
      cue: "That pool is about to go over the berm.",
      target: "sump-pump",
      why: "A berm only contains water up to its own height, and a pool this close to the top is one more wash pass away from doing exactly what the berm was built to prevent — running out across the ground instead of staying somewhere a drum can capture it. The sump pump draws it down into the wastewater drum before that happens, which is the one response that actually solves the problem rather than just pausing the next task until it does anyway.",
      missNote: "The next wash pass put the pool over the berm, and the wastewater that was supposed to stay inside this corridor's containment went out across the ground instead — the exact uncontrolled discharge the whole berm-and-pool setup exists to prevent.",
      wrongNote: "Not the wash station — the water already in the pool is the problem. The sump pump is what draws it down before it goes over.",
    },
  ],

  steps: [
    {
      id: "read-plan", kind: "select", target: "decon-plan",
      title: "Read today's decon corridor plan",
      cue: "Check the plan for what's coming through today, the wash method, and where the wastewater goes.",
      why: "The plan is what tells the support laborer whether today's corridor is washing off soil, sediment or something the containment pool has to be sized differently for, and it sets the wastewater's destination before the first entrant is even suited up — a corridor set up from habit instead of today's plan is a corridor built for yesterday's job.",
    },
    {
      id: "stock-stations", kind: "sequence", anyOrder: true,
      targets: ["wash-brushes", "rinse-supply", "tool-wipes"],
      itemNames: { "wash-brushes": "wash brushes", "rinse-supply": "rinse water supply", "tool-wipes": "tool wipes" },
      title: "Stock the wash and rinse stations",
      cue: "Set out the wash brushes, confirm the rinse water supply, and stock the tool wipes.",
      why: "A corridor that runs out of brushes or wipes halfway through the shift doesn't stop the entrants coming through it — it just means somebody starts improvising with whatever's on hand, which is exactly how a wash station stops doing what it's actually there to do. Stocking it before the first entrant arrives is what keeps the line running the same way for the tenth person as it did for the first.",
    },
    {
      id: "check-containment", kind: "find", noHint: true,
      targets: ["berm-seal", "pool-liner"],
      itemNames: { "berm-seal": "a gap in the berm", "pool-liner": "a tear in the pool liner" },
      itemNotes: {
        "berm-seal": "A low spot in the berm where it never quite closed against the ground. Water finds exactly this kind of gap before it finds anywhere else.",
        "pool-liner": "A small tear in the liner at the seam. A pool that leaks from underneath fails just as completely as one that overflows from the top, and it fails somewhere nobody's watching.",
      },
      title: "Walk the containment before the water goes in",
      cue: "Check the berm and the pool liner for anything that would let water out before you charge the line.",
      why: "Everything this corridor does depends on the containment actually holding the water it's about to be given, and a gap in the berm or a tear in the liner is far easier to fix on a dry pool than a wet one — checking for both before the valve opens is the only point in the shift where a leak is still a five-minute repair instead of a puddle already on its way to the storm drain.",
    },
    {
      id: "charge-water", kind: "turn", target: "water-valve",
      title: "Charge the wash and rinse pools",
      cue: "Open the supply valve and fill the pools to their working level.",
      why: "Charging the pools before anyone is suited up means the water is already at temperature and level by the time the first entrant needs it, rather than the corridor starting cold and low while somebody stands in a contaminated suit waiting for it to catch up — the valve opens on the support laborer's schedule, not the entrant's.",
      turn: { turns: 1, axis: "y", label: "WATER SUPPLY" },
    },
    {
      id: "pool-level", kind: "gauge", target: "level-gauge",
      title: "Read the containment pool level",
      cue: "Read the level gauge and commit once it holds in the working band — not so low it can't wash, not so high it risks the berm.",
      why: "Too low and the pool can't actually submerge a boot or a glove, which means the wash isn't reaching what it's supposed to reach; too high and every additional pass of runoff pushes it closer to the berm's own limit — the working band is the only range where the corridor can keep running all shift without needing a mid-shift rescue.",
      gauge: {
        label: "POOL LEVEL", speed: 0.65, green: [0.38, 0.6],
        readout: (t) => `${Math.round(t * 40)} cm`,
        missNote: "Outside the working band — too low to wash properly, or high enough to be one pass from the berm. Adjust the supply before the first entrant comes through.",
      },
    },
    {
      id: "boots-wash", kind: "hold", target: "wash-station", seconds: 5,
      title: "Wash the entrant's boots and gloves",
      cue: "Hold the scrub brush against the entrant's boots and gloves until the wash is actually done, not just started.",
      why: "A scrub that's cut short leaves exactly the same problem a scrub that never happened does, just with less of it — the point of holding it for the full count is that the boots and gloves are the two surfaces that touched the ground and the material directly, and they're worth doing completely rather than quickly.",
      holdBreakNote: "You let go before the wash was actually finished. A boot half-scrubbed still carries whatever the ground put on it into the rinse pool next.",
    },
    {
      id: "glove-rinse", kind: "track", target: "rinse-wand", seconds: 6,
      title: "Rinse at a steady rate",
      cue: "Hold the rinse wand's flow steady — enough to carry the wash off, not so much it splashes back over the berm.",
      why: "Too light a rinse leaves wash residue sitting on the suit instead of carrying it away, and too hard a stream is exactly what sends water splashing back out over the berm you just checked — the steady band in the middle is the rate that actually moves contamination into the pool instead of moving water out of it.",
      track: {
        start: 0.12, green: [0.36, 0.58], rise: 0.5, fall: 0.44, drift: 0.12, label: "RINSE RATE",
        readout: (v) => (v < 0.36 ? "too light — residue left" : v > 0.58 ? "too hard — splashing the berm" : "steady"),
      },
      holdBreakNote: "Rinse rate out of band — bring it back before you finish this pass, or the suit leaves this pool either dirty or the berm gets water it shouldn't have.",
    },
    {
      id: "wipe-tools", kind: "sequence",
      targets: ["wipe-tool-1", "wipe-tool-2", "wipe-tool-3"],
      itemNames: { "wipe-tool-1": "hand tool", "wipe-tool-2": "sampling rod", "wipe-tool-3": "meter probe" },
      title: "Wipe the tools down in order",
      cue: "Wipe the hand tool, then the sampling rod, then the meter probe — a fresh section of wipe for each.",
      why: "Wiping the least sensitive tool first and the meter probe last means the probe — the one instrument whose reading actually depends on a clean, undamaged surface — gets the wipe before it has spent the longest sitting contaminated, and it's also the one worth handling last because a scratched or fouled probe reads wrong the next time somebody trusts it.",
      outOfOrderNote: "Hand tool, then the sampling rod, then the meter probe — the most sensitive instrument gets wiped last, with the cleanest attention, not first out of habit.",
    },
    {
      id: "bag-suit", kind: "drag", target: "outer-suit",
      title: "Bag the entrant's outer suit",
      cue: "Carry the removed outer suit to the suit-bag bin once the entrant has stepped clear of it.",
      why: "The outer suit is the one item on this corridor that was never meant to be reused, and bagging it the moment it comes off — rather than setting it down on the deck to deal with later — is what keeps a decon line from quietly turning into a pile of contaminated Tyvek that somebody has to sort out at the end of the day.",
      drag: { to: "suit-bag-bin", radius: 0.45, missNote: "Not in the bin — a suit left on the deck is a suit somebody else has to pick up before the next entrant comes through." },
    },
    {
      id: "drum-wastewater", kind: "select", target: "waste-drum",
      title: "Transfer wastewater to the drum",
      cue: "Pump the pool's wastewater into the labeled drum before it's due for changeout.",
      why: "The pool is containment, not disposal — it holds the water only until it can be moved somewhere it can actually be characterized and hauled away, and transferring it to the drum on a schedule, rather than waiting until the pool is nearly full, is what keeps the corridor from ever being one bad shift away from a containment that's already at capacity.",
    },
    {
      id: "label-drum", kind: "sequence",
      targets: ["drum-fill-check", "drum-label", "drum-seal"],
      itemNames: { "drum-fill-check": "check the fill level", "drum-label": "label the drum", "drum-seal": "seal the drum" },
      title: "Check, label and seal the drum in order",
      cue: "Check the fill level is within limits, apply the label, then seal the bung — in that order.",
      why: "Checking the fill level before sealing catches an overfilled drum while the bung is still open to fix it; labeling before sealing means the label goes on a drum somebody can still confirm is the one it describes, rather than being applied to a sealed drum from memory — reverse either step and the paperwork stops matching the drum it's supposed to describe.",
      outOfOrderNote: "Check the fill level, then label, then seal — sealing first leaves you labeling a closed drum you're trusting yourself to remember correctly.",
    },
    {
      id: "log-corridor", kind: "select", target: "corridor-log",
      title: "Log the corridor for the shift",
      cue: "Record how many entrants went through, the drums filled, and the pool and berm checks.",
      why: "The corridor log is the only record that this decon line actually ran the way the plan called for — entrants washed, water contained, drums accounted for — and it is what the next shift's support laborer reads before they trust the pool they're about to stand next to.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, DSL_ACCENT);

    const groundMesh = box(g, 6.2, 0.1, 5.2, 0, -0.05, -0.4, 0x545a4c, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#48493c", base2: "#3c3d32", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.95 },
    );

    // -------------------------------------------------------------- containment pool
    const poolGroup = group(g, -0.5, 0, -0.9);
    const bermOuter = torus(poolGroup, 0.95, 0.05, 0, 0.05, 0, 0x53585e, { rough: 0.8, seg: 10, seg2: 32, cast: false });
    bermOuter.rotation.x = Math.PI / 2;
    const poolWater = slab(poolGroup, 1.7, 0.05, 1.7, 0, 0.06, 0, 0x4fa8b8, { radius: 0.3, rough: 0.15, metal: 0.1, opacity: 0.75, transparent: true, cast: false });
    holoTag(poolGroup, "containment pool", 0, 0.5, 0.9, { css: "#7fd4b0", w: 0.44 });

    const bermGap = box(poolGroup, 0.22, 0.1, 0.1, 0.75, 0.05, 0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bermGap, "berm-seal");
    const linerTear = box(poolGroup, 0.1, 0.02, 0.1, -0.5, 0.03, -0.4, 0x1b1e22, { rough: 0.9 });
    reg(hits, linerTear, "pool-liner");

    // Wash and rinse stations sit inside the pool, in sequence toward the tool crib.
    const washStation = group(poolGroup, -0.5, 0, 0);
    box(washStation, 0.4, 0.06, 0.4, 0, 0.09, 0, 0x2b3138, { rough: 0.7 });
    const brush = cyl(washStation, 0.04, 0.04, 0.24, 0, 0.2, 0, 0xe8b64a, { rough: 0.6, seg: 12 });
    holoTag(washStation, "boot / glove wash", 0, 0.34, 0, { css: "#7fd4b0", w: 0.42 });
    reg(hits, washStation, "wash-station");

    const rinseStation = group(poolGroup, 0.4, 0, 0.1);
    const rinseWand = group(rinseStation, 0, 0, 0);
    cyl(rinseWand, 0.015, 0.015, 0.5, 0, 0.4, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.x = Math.PI / 2.4;
    box(rinseWand, 0.06, 0.1, 0.06, 0, 0.15, 0, 0x2b3138, { rough: 0.6 });
    holoTag(rinseStation, "rinse wand", 0, 0.55, 0, { css: "#7fd4b0", w: 0.3 });
    reg(hits, rinseWand, "rinse-wand");
    const rinseSpray = particles(rinseStation, 26, 0xbfeaf7, { size: 0.018, life: 0.4, additive: false, opacity: 0.55 });

    const supplyValve = group(poolGroup, -0.2, 0, -0.7);
    cyl(supplyValve, 0.05, 0.05, 0.4, 0, 0.2, 0, CITY.steel, { rough: 0.5, metal: 0.5, seg: 12 });
    const vw = valveWheel(supplyValve, 0, 0.45, 0, { color: 0x4fb8c9, body: 0x2b5a63, r: 0.09 });
    hose(poolGroup, [[-0.2, 0.42, -0.7], [-0.3, 0.15, -0.4], [-0.4, 0.1, -0.1]], 0.02, 0x4fb8c9, { steps: 12 });
    holoTag(supplyValve, "water supply", 0, 0.65, 0, { css: "#4fb8c9", w: 0.34 });
    reg(hits, vw, "water-valve");

    const levelInstrument = instrument(poolGroup, 0.75, 0.5, -0.5, { ry: -0.4, idle: "-- cm", color: DSL_ACCENT });
    holoTag(levelInstrument, "pool level", 0, 0.17, 0, { css: "#7fd4b0", w: 0.3 });
    reg(hits, levelInstrument, "level-gauge");

    // Sump pump used to draw the pool down for the overflow interrupt.
    const sump = group(poolGroup, 0.85, 0, 0.7, -0.4);
    box(sump, 0.22, 0.2, 0.16, 0, 0.1, 0, 0x3a4048, { rough: 0.6, metal: 0.4 });
    const sumpLamp = ball(sump, 0.02, 0.08, 0.2, 0.05, 0x8b929a, { emissive: 0x8b929a, ei: 0.4, rough: 0.4 });
    holoTag(sump, "sump pump", 0, 0.34, 0, { css: "#7fd4b0", w: 0.28 });
    reg(hits, sump, "sump-pump");

    // Recall point at the corridor's far end, where the entrant would exit toward the tool crib.
    const recallPoint = box(g, 0.5, 0.3, 0.4, 0.6, 0.3, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "call them back", 0.6, 0.6, 0.6, { css: "#f0645b", w: 0.34 });
    reg(hits, recallPoint, "recall-point");

    // Storm drain outside the berm — the runoff trap.
    const drain = group(g, -1.9, 0, -1.5);
    box(drain, 0.4, 0.02, 0.4, 0, 0.011, 0, 0x2b2f34, { rough: 0.7, metal: 0.4, cast: false });
    for (let i = -2; i <= 2; i++) box(drain, 0.34, 0.01, 0.025, 0, 0.017, i * 0.07, 0x4a4e52, { rough: 0.6, metal: 0.4, cast: false });
    holoTag(drain, "storm drain — outside the berm", 0, 0.24, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, drain, "runoff-to-drain");

    // ------------------------------------------------------------ tool crib
    const crib = group(g, 1.6, 0, -0.6, -0.3);
    box(crib, 0.9, 0.05, 0.4, 0, 0.6, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    for (const [id, dx, label] of [["wipe-tool-1", -0.3, "hand tool"], ["wipe-tool-2", 0, "sampling rod"], ["wipe-tool-3", 0.3, "meter probe"]]) {
      const t = group(crib, dx, 0.6, 0);
      cyl(t, 0.015, 0.015, 0.3, 0, 0.18, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
      holoTag(t, label, 0, 0.36, 0, { css: "#7fd4b0", w: 0.28 });
      reg(hits, t, id);
    }
    const wipeBox = box(crib, 0.2, 0.08, 0.14, -0.5, 0.64, 0.14, 0xdfe4e8, { rough: 0.7 });
    holoTag(crib, "tool wipes", -0.5, 0.75, 0.14, { css: "#7fd4b0", w: 0.28 });
    reg(hits, wipeBox, "tool-wipes");
    const dirtyRag = group(crib, 0.5, 0.62, 0.14);
    box(dirtyRag, 0.14, 0.02, 0.1, 0, 0, 0, 0x2b2418, { rough: 0.9 });
    holoTag(dirtyRag, "already-dirty rag — reuse it?", 0, 0.14, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, dirtyRag, "reuse-dirty-rag");

    const brushRack = group(g, -1.7, 0, 0.3, 0.5);
    box(brushRack, 0.5, 0.05, 0.2, 0, 0.5, 0, 0x53585e, { rough: 0.6 });
    for (let i = 0; i < 3; i++) cyl(brushRack, 0.02, 0.02, 0.28, -0.15 + i * 0.15, 0.66, 0, 0xe8b64a, { rough: 0.6, seg: 10 });
    holoTag(brushRack, "wash brushes", 0, 0.85, 0, { css: "#7fd4b0", w: 0.32 });
    reg(hits, brushRack, "wash-brushes");
    const rinseTank = cyl(g, 0.22, 0.22, 0.5, -1.2, 0.25, 0.4, 0x4fb8c9, { rough: 0.5, metal: 0.3, seg: 16 });
    holoTag(rinseTank, "rinse water supply", 0, 0.4, 0, { css: "#7fd4b0", w: 0.4 });
    reg(hits, rinseTank, "rinse-supply");

    // -------------------------------------------------------------- suit bagging
    const suitStand = group(g, 1.3, 0, 0.7, -0.6);
    box(suitStand, 0.05, 1.4, 0.05, 0, 0.7, 0, CITY.steel, { rough: 0.5, metal: 0.5 });
    const outerSuit = group(suitStand, 0, 1.05, 0);
    box(outerSuit, 0.34, 0.55, 0.1, 0, 0, 0, 0xdfe6a8, { rough: 0.8 });
    holoTag(outerSuit, "outer suit", 0, 0.36, 0, { css: "#7fd4b0", w: 0.3 });
    reg(hits, outerSuit, "outer-suit");
    const suitBin = group(g, 1.9, 0, 1.1, -0.3);
    box(suitBin, 0.5, 0.5, 0.5, 0, 0.25, 0, 0x2b3138, { rough: 0.7 });
    decal(suitBin, 0.3, 0.08, 0, 0.501, 0, signFace("SUIT BAG BIN", { bg: "#0f1b14", accent: "#59c97b", scale: 0.45 }), { px: 140 }).rotation.x = -Math.PI / 2;
    holoTag(suitBin, "suit-bag bin", 0, 0.6, 0, { css: "#7fd4b0", w: 0.34 });
    hits["suit-bag-bin"] = suitBin;

    // -------------------------------------------------------------- drums
    const drumStand = group(g, 2.2, 0, -0.1, -0.4);
    const wasteDrum = cyl(drumStand, 0.24, 0.24, 0.65, 0, 0.33, 0, 0x2f6f4a, { rough: 0.6, metal: 0.3, seg: 20, finish: "painted" });
    holoTag(drumStand, "wastewater drum", 0, 0.72, 0, { css: "#7fd4b0", w: 0.4 });
    reg(hits, wasteDrum, "waste-drum");
    const fillCheck = box(drumStand, 0.18, 0.05, 0.05, 0, 0.5, 0.24, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, fillCheck, "drum-fill-check");
    const drumLabel = decal(drumStand, 0.2, 0.16, 0.25, 0.4, 0, signFace("DECON WASTEWATER", { bg: "#0f2c1c", accent: "#f2ae14", scale: 0.34 }), { px: 140 });
    drumLabel.rotation.y = Math.PI / 2;
    drumLabel.material.opacity = 0.001;
    drumLabel.material.transparent = true;
    reg(hits, drumLabel, "drum-label");
    const bung = cyl(drumStand, 0.04, 0.04, 0.03, 0, 0.66, 0.15, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 12 });
    reg(hits, bung, "drum-seal");

    const drumFull = group(g, 2.6, 0, 0.9, -0.4);
    cyl(drumFull, 0.24, 0.24, 0.65, 0, 0.33, 0, 0x7a7a7a, { rough: 0.7, metal: 0.2, seg: 20 });
    holoTag(drumFull, "roll it out?", 0, 0.72, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, drumFull, "roll-unlabeled-drum");

    // -------------------------------------------------------------- paperwork
    const chest = toolChest(g, -2.2, 1.0, { ry: 0.7, color: DSL_ACCENT });
    void chest;
    const plan = holoPanel(g, 0.56, 0.4, -2.2, 1.55, 0.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,14,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fd4b0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#bfe8d4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DECON CORRIDOR PLAN — SHIFT 2", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eafcf2";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SOIL / SEDIMENT DECON", w * 0.06, h * 0.32);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#bfe8d4";
      ["Wash, then rinse — in order", "Wastewater to labeled drums", "Pool level: working band only",
       "Outer suits bagged, not reused", "Nothing to the storm drain"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.48 + i * 0.1)));
    }, { ry: 0.5, accent: DSL_ACCENT });
    reg(hits, plan, "decon-plan");

    const logBoard = group(g, -1.5, 0, 1.4, 0.5);
    box(logBoard, 0.4, 0.005, 0.3, 0, 0.9, 0, 0xf3efe4, { rough: 0.9 });
    decal(logBoard, 0.34, 0.24, 0, 0.903, 0, signFace("CORRIDOR LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.36 })).rotation.x = -Math.PI / 2;
    holoTag(logBoard, "corridor log", 0, 1.05, 0, { css: "#7fd4b0", w: 0.34 });
    reg(hits, logBoard, "corridor-log");

    // -------------------------------------------------------------- bare-hands trap
    const bareHandsSupport = standingFigure(g, -0.1, -1.7, { ry: 1.6, cloth: 0x37505f, atStation: true });
    const bareHandsTrap = box(bareHandsSupport, 0.22, 0.2, 0.2, 0.25, 1.0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bareHandsSupport, "bare hands — no gloves", 0.3, 1.3, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, bareHandsTrap, "bare-hands-wash");

    // Entrant coming through the corridor.
    const entrant = standingFigure(g, -0.5, -1.15, { ry: 3.05, cloth: 0xe8b64a, atStation: true });
    holoTag(entrant, "entrant", 0, 1.9, 0, { css: "#e8b64a", w: 0.22 });

    for (let i = 0; i < 2; i++) barrierPanel(g, -0.5 + i * 2.0, -2.2, { color: DSL_ACCENT });
    cone(g, -2.3, -2.0, { color: DSL_ACCENT });

    let poolFilled = false, entrantOut = false, overflowActive = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.2, -1.0),
      footprint: 2.4,

      onStepComplete(step) {
        if (step.id === "charge-water") { poolFilled = true; poolWater.material = mat(0x4fa8b8, { rough: 0.15, metal: 0.1, opacity: 0.85 }); }
        if (step.id === "check-containment") { linerTear.visible = false; }
        if (step.id === "bag-suit") { outerSuit.visible = false; }
        if (step.id === "drum-wastewater") { poolWater.scale.y = 0.4; }
        if (step.id === "drum-label") { drumLabel.material.opacity = 1; drumLabel.material.transparent = false; }
        if (step.id === "wipe-tools") { entrant.position.set(0.4, 0, -0.4); }
      },

      onInterrupt(it) {
        if (it.id === "entrant-steps-out") { entrantOut = true; entrant.position.set(0.6, 0, 0.5); }
        if (it.id === "pool-overflow") { overflowActive = true; sumpLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4 }); poolWater.scale.set(1.06, 1, 1.06); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "entrant-steps-out") { entrantOut = false; entrant.position.set(-0.2, 0, -0.9); }
        if (it.id === "pool-overflow") { overflowActive = false; sumpLamp.material = mat(0x8b929a, { emissive: 0x8b929a, ei: 0.4 }); poolWater.scale.set(1, 1, 1); }
      },

      animate(t, dt, session) {
        const step = session?.step;
        rinseSpray.visible = step?.id === "glove-rinse" && session.holding;
        if (rinseSpray.visible) rinseSpray.userData.step(dt, new THREE.Vector3(0, -0.4, 0), 0.06, 0.6, -1.4);
        if (session?.turn && step?.id === "charge-water") vw.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "pool-level") {
          repaint(levelInstrument.userData.screen, signFace(`${Math.round(gg.t * 40)} cm`, {
            bg: "#0d1c24", accent: gg.t > 0.38 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#d8f5ea", scale: 0.55,
          }));
        }
        void poolFilled; void entrantOut; void overflowActive;
      },
    };
  },
};
