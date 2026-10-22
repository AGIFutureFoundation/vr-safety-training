import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, corrugatedFace, woodGrainFace, safetyStripeFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Produce Receiving, Cold Chain & Pallet Jack VR — Culinary &
// Hospitality, grocery pack (gr-), station three. A grocery backroom dock
// where a produce delivery is checked in, the ethylene-sensitive load kept
// away from what ripens it early, a failed case pulled before it ever
// reaches the floor, and the accepted pallet driven on an electric pallet
// jack across the backroom to the walk-in — the one leg of this job with a
// real drive kind under it. Real trade, sited generically; no clause
// invented, no temperature stated as fact beyond the store's own posted
// range, the union named only as the training body it is.

const GR3_ACCENT = 0x2f9ed1;

export const SIM_GR_PRODUCE_RECEIVING_COLD_CHAIN_AND_PALLET_JACK = {
  id: "gr-produce-receiving-cold-chain-and-pallet-jack",
  index: "gr-3",
  domain: "Grocery receiving / produce",
  trade: "Receiving clerk / produce clerk",
  category: "Culinary & Hospitality",
  indoor: "garage",
  certification: "UFCW member training for retail food work; FDA Food Code; California Retail Food Code; OSHA 29 CFR 1910.178 powered industrial trucks; ANSI/ITSDF B56.1 low and high lift trucks; OSHA 29 CFR 1910.22 walking-working surfaces; USDA inspection and grading marks on produce",
  name: "Produce Receiving, Cold Chain & Pallet Jack",
  title: simTitle("Produce Receiving, Cold Chain & Pallet Jack"),
  tagline: "A produce delivery checked, culled and segregated at the dock, then driven on the pallet jack to the walk-in without ever breaking the cold chain",
  accent: GR3_ACCENT,
  accentCss: "#2f9ed1",
  parSeconds: 290,
  footprint: 2.8,
  badge: { id: "chain-unbroken", name: "Chain Unbroken", note: "A delivery received, culled and segregated correctly, and driven to the walk-in without a single stop along the way" },

  game: system({
    name: "Receiving Line",
    currency: "DOCK",
    ranks: ["Porter", "Receiving Clerk", "Lead Receiver", "Produce Manager", "Receiving Certified"],
    badges: [
      { id: "chocks-first", name: "Chocks First", note: "Confirmed the wheel chocks before the truck was ever trusted still", test: AWARD.stepClean("chock-confirm") },
      { id: "nothing-mixed", name: "Nothing Mixed", note: "Never let an ethylene producer sit against a sensitive case", test: AWARD.safe },
      { id: "steady-jack", name: "Steady Jack", note: "Drove the pallet jack in lane and in band the whole route", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-delivery", name: "Clean Delivery", note: "No corrections anywhere on the receipt", test: AWARD.clean },
      { id: "unbroken-drive", name: "Unbroken Drive", note: "Reached the walk-in without ever leaving the lane or the band", test: AWARD.unbroken },
      { id: "receive-fast", name: "Received In Time", note: "Delivery closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "accept-warm-load": "You waved the truck off without reading the reefer display. A trailer that has been running warm on the road has already started this delivery behind, and produce that spent the trip too warm does not recover once it is inside a cold walk-in.",
    "ethylene-mix": "That banana case is stacked flush against the leafy greens. Bananas are one of the produce department's own heaviest ethylene producers, and stacking one against an ethylene-sensitive case starts ripening — and yellowing — the case next to it before it ever reaches the floor.",
    "wet-dock-crossing": "You drove the loaded jack straight across the wet, icy patch on the apron instead of matting or clearing it first. A dock apron gets wet from every reefer that runs and every case that drips, and OSHA's walking-working-surfaces rule exists because that surface takes a loaded pallet jack down as easily as it takes a person.",
    "prop-cooler-door": "You propped the walk-in door open with the pallet instead of closing it behind you. A propped cooler door is a slow, continuous temperature excursion for every case already inside it, not just the one you are wheeling through.",
  },

  lateNotes: {
    "damaged-case": "The reject zone is where this case goes the moment you decide it fails — not back on the pallet, not into the walk-in.",
    "pallet-jack": "The walk-in is the last stop, not a stop along the way — nothing gets set down between the dock and the cooler door once it has passed inspection.",
  },

  steps: [
    {
      id: "po-check", kind: "select", target: "invoice-board",
      title: "Check the invoice against the order",
      cue: "Compare the delivery invoice to today's produce order before the truck is unloaded.",
      why: "The invoice is the only record of what was supposed to arrive, at what count. Catching a shortage or a substitution here is a phone call to the supplier; catching it after the truck has left is a credit dispute nobody can prove.",
    },
    {
      id: "reefer-read", kind: "gauge", target: "reefer-display",
      title: "Read the truck's reefer display",
      cue: "Read the truck's own reefer temperature through the window and commit once it shows the load has held cold the whole trip.",
      why: "The reefer display is the truck's own record of the whole trip, not just the last few minutes at your dock. A trailer reading warm before the door is even open has already failed the delivery, whatever the first case you probe happens to read.",
      gauge: { label: "REEFER BOX TEMP", speed: 0.65, green: [0.08, 0.32], readout: (t) => `${Math.round(52 - t * 24)} °F`, missNote: "Reefer is reading warm — do not break the seal on this load yet; get it re-checked before anything comes off the truck." },
    },
    {
      id: "open-dock", kind: "sequence",
      targets: ["truck-doors", "dock-leveler"],
      itemNames: { "truck-doors": "truck doors", "dock-leveler": "dock leveler" },
      title: "Open the truck and bridge the dock",
      cue: "Open the truck doors, then bridge the gap with the dock leveler — in that order.",
      why: "The doors open onto a load that has been sealed and refrigerated for hours; the leveler only bridges a gap you can actually see once the doors are open. Dropping the leveler onto closed doors tells you nothing about the load behind them.",
      outOfOrderNote: "Wrong order — the doors open first so you can see the load, then the leveler bridges the gap you can now see.",
    },
    {
      id: "chock-confirm", kind: "select", target: "wheel-chock",
      title: "Confirm the trailer's wheel chocks",
      cue: "Check that both wheel chocks are seated against the trailer's tires before anyone works the dock plate.",
      why: "A trailer with no tractor still attached can creep away from the dock under its own weight, and the gap that opens between the trailer and the leveler is exactly where a loaded pallet jack goes down. The chocks are what keep that gap from ever opening while the dock is in use.",
    },
    {
      id: "probe-produce", kind: "gauge", target: "leafy-case",
      title: "Probe the leafy greens case",
      cue: "Probe between two heads in the leafy greens case and commit once the reading is inside the store's posted cold range.",
      why: "Leafy greens show field heat and cold-chain gaps faster than almost anything else on this pallet, so probing between two heads — not the outside of the case where the trailer's air has been blowing on it — is what actually tells you whether this delivery held its temperature the whole trip.",
      gauge: { label: "LEAFY GREENS — TEMP", speed: 0.65, green: [0.1, 0.34], readout: (t) => `${Math.round(50 - t * 20)} °F`, missNote: "Outside the posted cold range — this case is refused, not re-probed until it happens to pass." },
    },
    {
      id: "walk-pallet", kind: "find", noHint: true,
      targets: ["crushed-berries", "moldy-bag"],
      itemNames: { "crushed-berries": "a crushed, leaking berry flat", "moldy-bag": "a produce bag showing mold through the film" },
      itemNotes: {
        "crushed-berries": "This berry flat is crushed and leaking through the bottom of its case. Juice from one crushed flat wicks into every case stacked beneath it on the same pallet.",
        "moldy-bag": "Mold is visible through this bag's film. One spoiled bag left on an otherwise good pallet is what a cull is for — separating the one thing already gone from everything that is still fine.",
      },
      decoyNotes: { "clean-crate": "This crate is intact and dry, nothing seeping through the slats. Leave it." },
      title: "Walk the pallet for damage before it's accepted",
      cue: "Two things on this pallet are not sound. Find them before anything is accepted.",
      why: "Produce is checked with your hands and your eyes on every case, not sampled on a few — a crushed flat or a spoiled bag left in place keeps doing damage to everything stacked around it for as long as it sits there.",
    },
    {
      id: "ethylene-check", kind: "select", target: "ethylene-chart",
      title: "Check the ethylene segregation chart",
      cue: "Check the chart before the pallet is broken down, to see what has to be kept apart from what.",
      why: "Ethylene-producing produce and ethylene-sensitive produce riding the same pallet face to face is a fast way to have half a delivery ripening before it reaches the case — the chart is what tells you which is which before the segregation happens, not after a customer notices.",
    },
    {
      id: "cull-damaged", kind: "drag", target: "damaged-case",
      title: "Cull the failed case",
      cue: "Pull the crushed berry flat and move it to the reject zone.",
      why: "A culled case leaves the delivery physically, right away — set beside the accepted pallet, it is one distracted moment away from riding to the walk-in with everything else.",
      drag: { to: "reject-zone", radius: 0.45, missNote: "Not in the reject zone — a culled case anywhere else on the dock is one more thing somebody has to remember not to stock." },
    },
    {
      id: "log-refusal", kind: "select", target: "refusal-clipboard",
      title: "Log the cull",
      cue: "Write the item, the reason and the quantity culled on the refusal log.",
      why: "The refusal log is what gets a credit from the supplier and tells the next shift why a case on the invoice never made it to the floor. Without it, a cull is just missing inventory nobody can explain.",
    },
    {
      id: "strap-load", kind: "turn", target: "ratchet-strap",
      title: "Strap the pallet jack's load",
      cue: "Ratchet the strap down over the stacked accepted cases before the jack ever moves.",
      why: "A stack that shifts on a moving pallet jack comes down on whoever is driving it, not on the floor first. The strap is what turns a stack of separate cases into one load that goes exactly where the jack points it.",
      turn: { turns: 1, axis: "z", label: "LOAD STRAP" },
    },
    {
      id: "jack-to-cooler", kind: "drive", target: "pallet-jack",
      title: "Drive the load to the walk-in",
      cue: "Sound the horn at both blind corners and hold a steady, balanced pace the whole way to the walk-in door.",
      why: "The backroom aisle to the walk-in runs past two blind corners a stock clerk could step around at any moment, and a pallet jack loaded to eye height cannot be stopped the way a person on foot can. The horn is what buys the half-second a corner does not give you any other way.",
      holdBreakNote: "Out of the lane or out of the load's speed band — settle the jack and hold a steady, balanced pace the rest of the way.",
      drive: {
        path: [[0, -1.6], [0.35, -0.6], [0.85, 0.35], [1.3, 1.3], [1.5, 2.0]],
        speedBand: [1, 4], laneWidth: 1.0, graceSeconds: 1.8, checkWindow: 1.3, sceneRate: 0.2,
        bandLabel: "walking pace, load balanced",
        checks: [
          { at: 1, kind: "horn", note: "Blind corner past the empty-pallet rack — horn before you round it." },
          { at: 3, kind: "horn", note: "Blind corner into the walk-in alcove — horn again before the door swings your way." },
        ],
      },
    },
    {
      id: "cooler-check", kind: "gauge", target: "cooler-thermometer",
      title: "Read the walk-in's own thermometer",
      cue: "Read the walk-in cooler's posted thermometer and commit once it shows the room is inside its own range.",
      why: "The delivery's cold chain is not actually unbroken until the room it lands in is proven cold too — a probe that passed at the dock means nothing if the pallet is about to sit inside a walk-in that has been running warm all shift.",
      gauge: { label: "WALK-IN TEMP", speed: 0.6, green: [0.1, 0.3], readout: (t) => `${Math.round(48 - t * 16)} °F`, missNote: "The walk-in itself is reading outside its posted range — flag it before this pallet goes inside, not after." },
    },
    {
      id: "rotate-stock", kind: "select", target: "fifo-card",
      title: "Rotate the stock by date",
      cue: "Check the FIFO card and place the new pallet behind whatever produce is already in the walk-in.",
      why: "First in, first out only works if the newest pallet actually goes behind the oldest one every single time — put it in front because it's closer to the door, and the case in back is what a clerk finds spoiled next week.",
    },
    {
      id: "sign-log", kind: "select", target: "receiving-log-sign",
      title: "Sign the receiving log",
      cue: "Sign the receiving log to close out the delivery.",
      why: "The signature is the clerk taking responsibility for every reading on this delivery — what was accepted, what was culled and why, and what the walk-in itself read when the pallet went inside.",
    },
  ],

  interrupts: [
    {
      id: "driver-pressing-early",
      kind: "Driver pressing to leave",
      after: "reefer-read", delay: 4, seconds: 12,
      alert: "The driver has climbed back into the cab and is revving the engine — two more stops on the route, and the chocks haven't even been checked yet.",
      cue: "This trailer does not get treated as parked until the chocks are actually confirmed.",
      target: "wheel-chock",
      why: "A driver's schedule is not a reason to skip the one check that keeps this trailer from creeping while somebody is standing on the dock plate — confirm the chocks before anything else about the driver's hurry matters.",
      missNote: "You let the driver's hurry carry the moment and never confirmed the chocks. If that trailer had crept even a few inches with a hand truck on the plate, the schedule that pressured you would not have been the thing anyone remembered.",
      wrongNote: "It's the wheel chocks — confirm them before the driver's schedule decides anything else about this delivery.",
    },
    {
      id: "helper-wheeling-reject",
      kind: "Wrong case moving",
      after: "strap-load", delay: 4, seconds: 12,
      alert: "A stock clerk has grabbed the culled berry flat off the reject zone by mistake and is wheeling it toward the walk-in with the rest of the order.",
      cue: "Stop that case before it reaches the walk-in — it already failed inspection.",
      target: "reject-zone",
      why: "A culled case that reaches the walk-in stops being a cull and starts being inventory — the next clerk who opens that door has no way to know it already failed. Catching it here, on the dock, is the last easy chance.",
      missNote: "The culled case went into the walk-in with everything else. It now reads, to every clerk who opens that door, exactly like every other case on the shelf — the refusal log sitting back on the dock is the only thing that ever said otherwise.",
      wrongNote: "It's the reject zone — redirect that case back to it before the clerk reaches the walk-in door.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GR3_ACCENT);

    const floorTex = surfaceTexture((cx, cw, ch) => pavingFace(cx, cw, ch, { tiles: 4, base: "#6a7176", base2: "#5d6469", seam: "rgba(20,26,30,0.35)" }), { repeat: 6, px: 512 });
    const floor = box(g, 6.8, 0.1, 6.0, 0, 0.05, 0, 0x646b70, { rough: 0.85, metal: 0.08 });
    floor.material = texturedMat(floorTex, { rough: 0.82, metal: 0.08, color: 0x646b70 });

    const wallTex = surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: 0x8b929a, ribs: 10 }), { repeat: 3, px: 512 });
    const backWall = box(g, 6.8, 2.8, 0.12, 0, 1.4, -2.3, 0x8b929a, { rough: 0.5, metal: 0.5 });
    backWall.material = texturedMat(wallTex, { rough: 0.5, metal: 0.5, color: 0x8b929a });

    const stripeTex = surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 2, px: 256 });
    const laneStripe = slab(g, 0.4, 0.005, 3.8, 1.0, 0.006, 0.2, 0xf2c14b, { rough: 0.7, cast: false });
    laneStripe.material = texturedMat(stripeTex, { rough: 0.75, color: 0xf2c14b });

    // Dock face and truck.
    box(g, 6.2, 0.7, 0.3, 0, -0.15, -2.0, 0x3a4048, { rough: 0.8 });
    const truck = group(g, -1.1, -0.35, -3.6);
    box(truck, 2.6, 0.1, 3.8, 0, 0.5, 0, 0x8a8f96, { rough: 0.85 });
    for (const sx of [-1, 1]) box(truck, 0.06, 2.1, 3.8, sx * 1.3, 1.55, 0, 0xd9dde2, { rough: 0.7 });
    box(truck, 2.6, 0.06, 3.8, 0, 2.6, 0, 0xd9dde2, { rough: 0.7 });
    const doorsGroup = group(truck, 0, 0, 1.9);
    for (const sx of [-1, 1]) box(doorsGroup, 1.3, 2.1, 0.05, sx * 0.65, 1.55, 0, 0xc7ced1, { rough: 0.6, metal: 0.3 });
    holoTag(doorsGroup, "truck doors", 0, 2.7, 0, { css: "#2f9ed1", w: 0.3 });
    reg(hits, doorsGroup, "truck-doors");
    const reeferUnit = group(truck, 0, 2.0, -2.0);
    box(reeferUnit, 2.2, 0.9, 0.3, 0, 0, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    const reeferPanel = instrument(reeferUnit, 0, -0.1, 0.16, { idle: "-- °F", color: GR3_ACCENT, w: 0.16, d: 0.1, ry: 0 });
    holoTag(reeferUnit, "reefer display", 0, 0.55, 0.16, { css: "#2f9ed1", w: 0.32 });
    reg(hits, reeferPanel, "reefer-display");
    const acceptWarm = box(reeferUnit, 0.4, 0.3, 0.1, 0.9, -0.1, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(reeferUnit, "wave it through?", 0.9, 0.2, 0.2, { css: "#f0645b", w: 0.4 });
    reg(hits, acceptWarm, "accept-warm-load");
    const driverCab = group(truck, 0, 0.2, -2.35);
    box(driverCab, 1.9, 1.3, 0.9, 0, 1.1, 0, 0x3a4a56, { rough: 0.5, metal: 0.4 });
    void driverCab;

    // Wheel chocks at both rear tires.
    const chocks = group(g, -1.1, 0, -2.05);
    const chockA = box(chocks, 0.14, 0.1, 0.1, -0.9, 0.05, 0, 0xf2c14b, { rough: 0.7 });
    const chockB = box(chocks, 0.14, 0.1, 0.1, 0.9, 0.05, 0, 0xf2c14b, { rough: 0.7 });
    reg(hits, chocks, "wheel-chock");
    void chockA; void chockB;

    // Dock leveler.
    const leveler = group(g, -0.4, 0.1, -1.55);
    box(leveler, 1.6, 0.06, 1.0, 0, 0.03, 0, 0x59636d, { rough: 0.5, metal: 0.6 });
    for (let i = -3; i <= 3; i++) box(leveler, 0.02, 0.008, 0.9, i * 0.22, 0.065, 0, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(leveler, "dock leveler", 0, 0.4, 0, { css: "#2f9ed1", w: 0.28 });
    reg(hits, leveler, "dock-leveler");

    const wetApron = slab(g, 1.0, 0.01, 0.7, -1.5, 0.011, -0.9, 0xbfe4f2, { radius: 0.1, rough: 0.15, opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "cross it loaded?", -1.5, 0.2, -0.9, { css: "#f0645b", w: 0.36 });
    reg(hits, wetApron, "wet-dock-crossing");

    // Produce pallet — leafy greens, berries, bananas.
    const woodTex = surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, {}), { repeat: 2, px: 256 });
    const pallet = group(g, 0.2, 0.1, -1.2);
    const palletWood = box(pallet, 1.2, 0.12, 1.2, 0, 0.06, 0, 0x8a6f5a, { rough: 0.9 });
    palletWood.material = texturedMat(woodTex, { rough: 0.85, color: 0x8a6f5a });
    const leafy = group(pallet, -0.3, 0.12, -0.3);
    box(leafy, 0.4, 0.3, 0.4, 0, 0.15, 0, 0x3f8a44, { rough: 0.8 });
    decal(leafy, 0.3, 0.08, 0, 0.32, 0.201, signFace("LEAFY GREENS", { bg: "#0d3a1a", accent: "#6fd6c9", scale: 0.4 }));
    holoTag(leafy, "leafy greens", 0, 0.36, 0, { css: "#2f9ed1", w: 0.32 });
    reg(hits, leafy, "leafy-case");
    const berries = group(pallet, 0.3, 0.12, -0.3);
    box(berries, 0.38, 0.2, 0.38, 0, 0.1, 0, 0xd9524a, { rough: 0.7 });
    holoTag(berries, "failed case", 0, 0.26, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, berries, "damaged-case");
    const bananas = group(pallet, -0.3, 0.12, 0.35);
    box(bananas, 0.4, 0.24, 0.3, 0, 0.12, 0, 0xe8c93a, { rough: 0.75 });
    decal(bananas, 0.3, 0.06, 0, 0.24, 0.151, signFace("BANANAS", { bg: "#3a2c08", accent: "#f2c14b", scale: 0.45 }));
    reg(hits, bananas, "ethylene-mix");
    const cleanCrate = group(pallet, 0.3, 0.12, 0.35);
    box(cleanCrate, 0.36, 0.26, 0.3, 0, 0.13, 0, 0xc9a86a, { rough: 0.6 });
    reg(hits, cleanCrate, "clean-crate");
    const moldyBag = group(pallet, 0, 0.12, 0.35);
    box(moldyBag, 0.3, 0.2, 0.26, 0, 0.1, 0, 0xd8dbc8, { rough: 0.85 });
    box(moldyBag, 0.1, 0.03, 0.06, 0.06, 0.16, 0.1, 0x4a5a3a, { rough: 0.9 });
    reg(hits, moldyBag, "moldy-bag");
    const crushedBerries = group(pallet, -0.35, 0.12, -0.05);
    box(crushedBerries, 0.3, 0.14, 0.26, 0, 0.07, 0, 0xb8402f, { rough: 0.8 });
    reg(hits, crushedBerries, "crushed-berries");

    // Receiving table: invoice, ethylene chart, refusal log.
    const table = group(g, 2.0, 0, -1.9);
    box(table, 1.6, 0.06, 0.6, 0, 0.9, 0, 0x9aa4ad, { radius: 0.01, rough: 0.4, metal: 0.6 });
    for (const lx of [-0.7, 0.7]) box(table, 0.05, 0.86, 0.5, lx, 0.47, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const invoiceBoard = holoPanel(table, 0.5, 0.36, -0.5, 0.5, 0, (ctx, w, h) => {
      ctx.fillStyle = "#081c24"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#2f9ed1"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#c8ecfa"; ctx.fillText("INVOICE #5521", w * 0.08, h * 0.18);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; ctx.fillStyle = "#eaf8ff";
      ["Leafy greens ×8", "Berries ×6", "Bananas ×5"].forEach((l, i) => ctx.fillText(l, w * 0.08, h * (0.36 + i * 0.15)));
    }, { accent: GR3_ACCENT });
    reg(hits, invoiceBoard, "invoice-board");
    const ethyleneChart = holoPanel(table, 0.5, 0.36, 0.5, 0.5, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0d2410"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d8f7e2"; ctx.fillText("ETHYLENE CHART", w * 0.08, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#e8fbee";
      ["Producers: bananas, apples", "Sensitive: greens, herbs", "Keep separated on pallet"].forEach((l, i) => ctx.fillText(l, w * 0.08, h * (0.36 + i * 0.15)));
    }, { accent: 0x59c97b });
    reg(hits, ethyleneChart, "ethylene-chart");
    const refusalClip = group(table, 0, 0.94, 0.2);
    slab(refusalClip, 0.24, 0.02, 0.32, 0, 0.01, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(refusalClip, 0.2, 0.26, 0, 0.02, 0.161, signFace("REFUSAL LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#b8402f", scale: 0.5 })).rotation.x = -Math.PI / 2;
    holoTag(refusalClip, "refusal log", 0, 0.2, 0, { css: "#2f9ed1", w: 0.3 });
    reg(hits, refusalClip, "refusal-clipboard");

    const rejectZone = slab(g, 1.0, 0.01, 0.8, 2.6, 0.011, -1.9, 0xf0645b, { radius: 0.05, rough: 0.7, opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "reject zone", 2.6, 0.2, -1.9, { css: "#f0645b", w: 0.28 });
    reg(hits, rejectZone, "reject-zone");

    // Electric pallet jack ("walkie") with forks, tiller and horn.
    const jack = group(g, 0, 0, -1.6);
    box(jack, 0.5, 0.14, 0.22, 0, 0.1, -0.55, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    for (const sx of [-0.14, 0.14]) box(jack, 0.1, 0.06, 1.0, sx, 0.06, 0.15, 0x2b2f34, { rough: 0.5, metal: 0.55 });
    for (const sx of [-0.14, 0.14]) cyl(jack, 0.05, 0.05, 0.05, sx, 0.05, 0.62, 0x1a1e23, { rough: 0.85, seg: 12 }).rotation.z = Math.PI / 2;
    const tiller = group(jack, 0, 0.4, -0.75, -0.3);
    cyl(tiller, 0.02, 0.02, 0.7, 0, 0.35, 0, 0x3c444c, { rough: 0.5, metal: 0.5, seg: 8 });
    box(tiller, 0.24, 0.1, 0.06, 0, 0.72, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const hornBtn = box(tiller, 0.03, 0.03, 0.02, 0.08, 0.72, 0.035, 0xd8232a, { rough: 0.5 });
    reg(hits, hornBtn, "jack-horn");
    holoTag(jack, "pallet jack", 0, 1.0, -0.75, { css: "#2f9ed1", w: 0.3 });
    reg(hits, jack, "pallet-jack");
    const stackedCases = group(jack, 0, 0.3, 0.3);
    for (let i = 0; i < 3; i++) box(stackedCases, 0.42, 0.26, 0.5, 0, 0.13 + i * 0.27, 0, [0x3f8a44, 0xe8c93a, 0xd8dbc8][i], { rough: 0.7 });
    const strap = box(stackedCases, 0.46, 0.03, 0.54, 0, 0.72, 0, 0x2b2f34, { rough: 0.7 });
    holoTag(stackedCases, "load strap", 0, 0.95, 0, { css: "#2f9ed1", w: 0.26 });
    reg(hits, strap, "ratchet-strap");

    // Walk-in cooler door and FIFO / thermometer at the end of the path.
    const coolerDoor = group(g, 1.5, 0, 2.1);
    box(coolerDoor, 1.3, 2.1, 0.12, 0, 1.05, 0, 0xeef2f3, { rough: 0.5, metal: 0.15 });
    holoTag(coolerDoor, "walk-in cooler", 0, 2.3, 0, { css: "#6fd6c9", w: 0.36 });
    reg(hits, coolerDoor, "cooler-door");
    const coolerTherm = instrument(coolerDoor, 0.75, 1.1, 0.08, { idle: "-- °F", color: GR3_ACCENT, w: 0.14, d: 0.1 });
    holoTag(coolerTherm, "walk-in thermometer", 0, 0.16, 0, { css: "#2f9ed1", w: 0.4 });
    reg(hits, coolerTherm, "cooler-thermometer");
    const fifoCard = group(coolerDoor, -0.75, 0.9, 0.08);
    slab(fifoCard, 0.2, 0.02, 0.26, 0, 0, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(fifoCard, 0.16, 0.2, 0, 0.011, 0.13, signFace("FIFO", { bg: "#0d3a2a", accent: "#59c97b", scale: 0.55 }));
    holoTag(fifoCard, "FIFO card", 0, 0.18, 0, { css: "#59c97b", w: 0.26 });
    reg(hits, fifoCard, "fifo-card");
    const propWedge = box(coolerDoor, 0.16, 0.06, 0.1, 0.3, 0.03, 0.5, 0xf2c14b, { rough: 0.6 });
    holoTag(coolerDoor, "prop it open?", 0.3, 0.16, 0.5, { css: "#f0645b", w: 0.32 });
    reg(hits, propWedge, "prop-cooler-door");

    const receivingLog = group(g, 2.6, 0, -0.6);
    slab(receivingLog, 0.24, 0.02, 0.32, 0, 0.92, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(receivingLog, 0.2, 0.26, 0, 0.93, 0.161, signFace("RECEIVING LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#2f6f8c", scale: 0.42 })).rotation.x = -Math.PI / 2;
    holoTag(receivingLog, "receiving log", 0, 1.1, 0, { css: "#2f9ed1", w: 0.34 });
    reg(hits, receivingLog, "receiving-log-sign");

    // Empty-pallet rack near the first blind corner.
    const rack = group(g, 0.4, 0, -0.2);
    for (let i = 0; i < 4; i++) {
      const p = box(rack, 1.0, 0.1, 1.0, 0, 0.06 + i * 0.02, 0, 0x8a6f5a, { rough: 0.9 });
      p.material = texturedMat(woodTex, { rough: 0.85, color: 0x8a6f5a });
    }
    holoTag(rack, "empty pallets", 0, 0.4, 0, { css: "#2f9ed1", w: 0.32 });

    const clerk = standingFigure(g, -2.0, -0.5, { ry: 2.0, outfit: "kitchen" });
    const stockClerk = group(g, 3.2, 0, 0.9);
    standingFigure(stockClerk, 0, 0, { ry: -1.2, outfit: "kitchen" });
    stockClerk.visible = false;
    void clerk;

    let travelled = 0, strapped = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 1.0, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "open-dock") doorsGroup.rotation.y = 0;
        if (step.id === "cull-damaged") { berries.parent.remove(berries); g.add(berries); berries.position.set(2.6, 0.12, -1.9); }
        if (step.id === "strap-load") { strapped = true; strap.material = mat(0x2b2f34, { rough: 0.5, metal: 0.3 }); }
        if (step.id === "walk-pallet") { crushedBerries.material = mat(0x2f9ed1, { rough: 0.6 }); moldyBag.material = mat(0x2f9ed1, { rough: 0.6 }); }
      },
      onInterrupt(it) {
        if (it.id === "driver-pressing-early") driverCab.position.z -= 0.08;
        if (it.id === "helper-wheeling-reject") { stockClerk.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "driver-pressing-early") driverCab.position.z += 0.08;
        if (it.id === "helper-wheeling-reject") stockClerk.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "reefer-read") repaint(reeferPanel.userData.screen, signFace(`${Math.round(52 - gg.t * 24)} °F`, { bg: "#1c1408", accent: gg.t >= 0.08 && gg.t <= 0.32 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.55 }));
        if (gg && !gg.committed && step?.id === "probe-produce") repaint(reeferPanel.userData.screen, signFace(`${Math.round(50 - gg.t * 20)} °F`, { bg: "#1c1408", accent: gg.t >= 0.1 && gg.t <= 0.34 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.55 }));
        if (gg && !gg.committed && step?.id === "cooler-check") repaint(coolerTherm.userData.screen, signFace(`${Math.round(48 - gg.t * 16)} °F`, { bg: "#1c1408", accent: gg.t >= 0.1 && gg.t <= 0.3 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.55 }));
        if (session?.turn && step?.id === "strap-load") strap.position.y = 0.72 - session.turn.amount * 0.04;
        if (session?.drive?.pose && step?.id === "jack-to-cooler") {
          void session.drive.pose;
        }
        void t; void dt; void travelled; void strapped;
      },
    };
  },
};
