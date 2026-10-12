import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pick, Pack and Scan VR — Mobility & Transit, the second of five
// warehouse stations in the Job Readiness Edition's TDL pre-apprenticeship
// block. An order picker's shift in one wave: a scanner signed in and a tote
// scanned to the order, a slot that does not match its label, a cart pushed
// down an aisle a forklift also uses, a unit picked into the right compartment,
// a takeaway conveyor that jams and is stopped, isolated and locked before a
// hand goes near it, a carton packed, weighed against what the order says it
// should weigh, and a shipping label read before it leaves the bench.
//
// Sited generically: no real warehouse, no real carrier, no clause number the
// registry is not sure of.

const PPS_ACCENT = 0x4fb8c9;
const PPS_SHELF = 0x3f6f8f;
const PPS_BIN = [0x2f7fbf, 0xd9a13a, 0x5aa36a, 0xc0503a];

export const SIM_TDL_PICK_PACK_AND_SCAN = {
  id: "tdl-pick-pack-and-scan",
  index: "218",
  domain: "Warehouse & Distribution",
  trade: "Order picker and packer, TDL pre-apprenticeship — Teamsters warehouse work: pick, pack and scan, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
  category: "Mobility & Transit",
  indoor: "garage",
  certification: "OSHA 29 CFR 1910.147 control of hazardous energy for conveyor jam clearing; 29 CFR 1910.178 for the forklift traffic the pick aisles share; 29 CFR 1910.22 walking-working surfaces; the Revised NIOSH Lifting Equation for repetitive picking; PHMSA 49 CFR 172 hazard communication marks, including the limited-quantity mark, on packages that pass through a pick face; Teamsters warehouse locals' safety committees and training",
  name: "Pick, Pack and Scan",
  title: simTitle("Pick, Pack and Scan"),
  tagline: "One pick wave: scanner and tote, a slot that does not match its label, a cart in a forklift aisle, the right compartment, a jammed conveyor stopped, isolated and locked, a carton weighed against the order and a label read before it ships",
  accent: PPS_ACCENT,
  accentCss: "#4fb8c9",
  parSeconds: 250,
  footprint: 2.4,
  badge: { id: "zero-touch-jam", name: "Zero-Touch Jam", note: "A wave picked and packed with the conveyor locked out before the jam was touched, the forklift yielded to and the mis-pick caught on the scale — first time" },

  game: system({
    name: "Order Fulfilment",
    currency: "SCAN",
    ranks: ["New Picker", "Picker", "Packer", "Wave Lead", "Fulfilment Certified"],
    badges: [
      { id: "locked-first", name: "Locked First", note: "Stopped, isolated and locked before the jam was cleared, first time", test: AWARD.all(AWARD.stepClean("belt-stop"), AWARD.stepClean("lockout")) },
      { id: "no-climbing", name: "No Climbing", note: "Never climbed a shelf, reached into a running belt or left a blade open", test: AWARD.safe },
      { id: "on-weight", name: "On Weight", note: "The carton weight read near the centre of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-wave", name: "Clean Wave", note: "No corrections anywhere in the wave", test: AWARD.clean },
      { id: "cutoff", name: "Made the Cutoff", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "scan-streak", name: "Scan Streak", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "pps-climb-shelf": "You started to climb the shelving to reach the top slot. Shelving is built to carry product, not a person's weight on its front edge; it racks forward, the shelf clips pop, and a fall from the third shelf lands you on the cart you left in the aisle. The rolling ladder with the locking step is two metres away.",
    "pps-reach-running-belt": "You reached into the conveyor while the belt was still running to pull the jammed carton. A jam is stored energy: the moment it clears, the belt takes whatever is holding it, and the nip point where a belt meets a roller pulls a glove and the hand in it in faster than you can let go.",
    "pps-open-blade": "You picked up the box cutter with the blade still out and your other hand on the carton in its path. An open blade left on a bench is how most packing-line cuts happen: the knife slips off a taped seam toward the free hand or gets picked up by the wrong end. Retract it every time it leaves your hand.",
    "pps-overload-shelf": "You went to put the returns bin on the top shelf, which is already at its posted load. A shelf over its rating bows, the clips let go and the load comes down on whoever is picking the shelf below. The posted load is a limit, not a suggestion, and a full bin goes on the floor pallet instead.",
  },

  lateNotes: {
    "pps-disconnect": "The disconnect is turned off after the belt has been stopped at the jam station, not while the belt is still carrying product.",
    "pps-clear-jam": "The jam is cleared once the belt is stopped and the disconnect is locked off — never before.",
    "pps-scale": "The carton is weighed once it is packed and sealed, so the reading is the carton that ships.",
  },

  steps: [
    {
      id: "wave", kind: "select", target: "pps-wave-board",
      title: "Read the pick wave",
      cue: "Read the wave: how many orders, the pick path, the carrier cutoff and anything flagged hazmat.",
      why: "A wave board is the plan for the next hour: the orders grouped so one walk down the aisles picks them all, the cutoff the trailer leaves at, and the lines flagged for special handling. Reading it first is what stops a picker chasing single orders back and forth, which is where the rushing, the shortcuts and the collisions come from.",
    },
    {
      id: "scanner", kind: "sequence",
      targets: ["pps-scanner", "pps-cart-tag", "pps-slot-label"],
      itemNames: { "pps-scanner": "scanner signed in", "pps-cart-tag": "tote scanned to the order", "pps-slot-label": "slot label scanned" },
      title: "Sign in, scan the tote, scan the slot",
      cue: "Sign in on the scanner, scan the tote to the first order, then scan the slot label before you touch the product.",
      why: "Every scan ties a physical thing to a record: your sign-in to the work, the tote to the order, the slot to the item the system thinks is in it. Scanning the slot before you pick is what catches a picker at the wrong location, and it is far cheaper to catch at the shelf than as a wrong item in a customer's box two days later.",
      outOfOrderNote: "Sign in, then the tote, then the slot — the tote has to be tied to an order before anything goes into it.",
    },
    {
      id: "slot-check", kind: "find", noHint: true,
      targets: ["pps-wrong-sku", "pps-crushed-unit", "pps-lq-unmarked"],
      itemNames: { "pps-wrong-sku": "the unit that does not match the slot label", "pps-crushed-unit": "the crushed unit", "pps-lq-unmarked": "the aerosol carton with no limited-quantity mark" },
      itemNotes: {
        "pps-wrong-sku": "The label says a blue case; this unit is a different part number. Mixed product in a slot is how a whole wave ships wrong — it goes to the problem-solve desk, not into the tote.",
        "pps-crushed-unit": "This unit is crushed at one corner. Damage found at the pick face is logged and replaced here; damage found by the customer is a return, a claim and a second shipment.",
        "pps-lq-unmarked": "This carton of aerosol cans has no limited-quantity mark on it. Packages of regulated goods travel with the marks 49 CFR 172 requires; one without goes to the hazmat desk, not into a parcel tote.",
      },
      title: "Check the slot before you pick",
      cue: "Three things in this pick face should not go into a tote as they are. Find them.",
      why: "A scanner confirms the slot, not what is physically sitting in it. Mis-slotted product, damage and missing hazard marks are all things only a person looking at the shelf can see, and the pick face is the last point in the building where catching them costs a minute rather than a claim. A package of aerosols or batteries without its marks is also a package a driver and a sorter have no warning about.",
    },
    {
      id: "cart-push", kind: "track", target: "pps-cart-handle", seconds: 8,
      title: "Push the cart down the aisle",
      cue: "Push, do not pull, at a steady walking pace, and stop at the painted line where the aisle meets the forklift lane.",
      why: "Pushing a loaded cart keeps you behind it with your legs doing the work and your eyes on the path; pulling twists the back and puts the cart where you cannot see it. A steady pace means the cart stops when you do. The painted line at the aisle end exists because a forklift in the cross lane has a blind side and right of way, and you do not.",
      track: { start: 0.1, green: [0.36, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "PACE", readout: (v) => (v < 0.36 ? "stalled" : v > 0.6 ? "rushing" : "steady") },
      holdBreakNote: "Pace out of band — rushing a loaded cart means it will not stop when you do. Settle it.",
    },
    {
      id: "pick", kind: "drag", target: "pps-item",
      title: "Pick the unit into its compartment",
      cue: "Carry the unit from the slot into the tote compartment the scanner lit, close to your body.",
      why: "A multi-order tote has a compartment per order, and the scanner lights the one this unit belongs in; a unit in the next compartment over is a wrong shipment with a correct pick record. Carrying it close to your body keeps the load inside the reach the lifting guidance assumes, which matters on the six-hundredth pick of the shift far more than on the first.",
      drag: { to: "pps-tote-socket", radius: 0.4, missNote: "Not in the lit compartment — the unit goes where the scanner says, or the order ships short." },
    },
    {
      id: "belt-stop", kind: "hold", target: "pps-belt-stop", seconds: 8,
      title: "Stop the takeaway belt at the jam",
      cue: "A carton has jammed at the merge. Press and hold the jam station stop until the belt has come to rest.",
      why: "A conveyor keeps moving for a moment after a stop is pressed, and the cartons behind a jam keep pushing. Holding the stop until the belt is actually at rest, and watching it happen, is how you know the energy you can see has gone — before you move on to the energy you cannot see, which is the motor that restarts when someone else presses go.",
      holdBreakNote: "You let go before the belt came to rest. Hold the stop and watch it stop.",
    },
    {
      id: "lockout", kind: "turn", target: "pps-disconnect",
      title: "Turn the disconnect off and lock it",
      cue: "Turn the conveyor's disconnect handle to OFF and hang your own lock and tag on it.",
      why: "A stop button can be pressed again by somebody down the line who cannot see you; a disconnect with your lock on it cannot be switched back on by anyone but you. Clearing a jam puts a hand where the belt's energy is, and 29 CFR 1910.147 treats that as servicing: the energy is isolated and locked, not merely stopped, and the lock is personal to the person whose hands are in the machine.",
      turn: { turns: 0.25, axis: "z", label: "DISCONNECT" },
    },
    {
      id: "clear-jam", kind: "select", target: "pps-clear-jam",
      title: "Clear the jam with the belt locked out",
      cue: "Lift the jammed carton off the merge, check the rollers are clear, then take your lock off and restart.",
      why: "With the lock on, the jam is just a stuck box: lifted out by hand, the rollers looked at for the torn flap or strap that caused it, the guard back on. The lock comes off only when every hand is clear and the belt has been looked along, because the restart is the moment the belt is most likely to catch someone who thought it was still off.",
    },
    {
      id: "pack-out", kind: "sequence",
      targets: ["pps-void-fill", "pps-tape", "pps-ship-label"],
      itemNames: { "pps-void-fill": "void fill", "pps-tape": "seal with tape", "pps-ship-label": "shipping label" },
      title: "Pack out the carton",
      cue: "Fill the void so nothing moves, seal the carton, then apply the shipping label flat on the top.",
      why: "A carton with space inside is a carton that crushes when another one is stacked on it, and a product that moves in transit breaks. Void fill first, then the seal, then the label on a flat top face where the sorter's scanner and the driver can read it. A label put on before the seal is a label that ends up across a seam, torn when the box is opened or unreadable when it is not.",
      outOfOrderNote: "Void fill, then tape, then the label — the label goes on a sealed carton, flat, where it will be read.",
    },
    {
      id: "weigh", kind: "gauge", target: "pps-scale",
      title: "Weigh the carton against the order",
      cue: "Set the carton on the scale and commit when the reading matches the order's expected weight.",
      why: "The order knows what its items weigh; the scale knows what is actually in the box. A carton that weighs more or less than it should has a missing item, an extra item or the wrong item in it, and the scale catches it before the tape is cut by a customer. The same weight goes on the label and the manifest, and a driver's axle weights start from numbers like this.",
      gauge: { label: "WEIGHT vs ORDER", speed: 0.8, green: [0.42, 0.6], readout: (t) => `${(4 + t * 8).toFixed(1)} lb`, missNote: "The carton is off its expected weight — open it and check the pick before it ships." },
    },
    {
      id: "label-audit", kind: "find", noHint: true,
      targets: ["pps-smudged-barcode", "pps-address-mismatch"],
      itemNames: { "pps-smudged-barcode": "the smudged barcode", "pps-address-mismatch": "the address that does not match the packing slip" },
      itemNotes: {
        "pps-smudged-barcode": "The printer head has streaked the barcode. A barcode the sorter cannot read goes to a manual lane and misses the trailer; reprint it now.",
        "pps-address-mismatch": "The label's address is not the packing slip's. Two orders' labels have been swapped at the printer — and the other carton is wrong too.",
      },
      title: "Read the label before it leaves the bench",
      cue: "Compare the label with the packing slip and look at the barcode. Find what would stop this carton arriving.",
      why: "Everything downstream of this bench trusts the label: the sorter reads the barcode, the loader reads the route, the driver reads the address. A streaked barcode or a swapped label is invisible once the carton is on a belt with a thousand others, and a swapped label always means a second wrong carton somewhere behind it.",
    },
    {
      id: "crew-checkin", kind: "select", target: "pps-crew-checkin",
      title: "Check in with the wave lead",
      cue: "Tell the lead about the jam, the slot problems and the label printer, and say how your hands and back are doing.",
      why: "The lead can only fix what they hear about: a printer that streaks, a merge that jams every hour, a slot that keeps getting mis-stocked. Picking and packing is repetitive work, and soreness in the wrists or lower back that is mentioned early gets a job rotation or a change to the bench; soreness that is kept quiet becomes an injury that keeps a person off work.",
    },
    {
      id: "warehouse-log", kind: "select", target: "pps-warehouse-log",
      title: "Write the warehouse log",
      cue: "Log the jam and your lockout, the problem slots and the damaged unit, then sign it.",
      why: "A jam cleared and never written down is a merge that nobody fixes; a lockout recorded with a name and a time is the evidence the procedure is being followed rather than skipped. The log is also where the problem slots reach inventory control, so the next picker does not find the same mis-stocked shelf tomorrow.",
    },
  ],

  interrupts: [
    {
      id: "forklift-crossing",
      kind: "Forklift in the cross lane",
      after: "cart-push", delay: 3, seconds: 10,
      alert: "A forklift is coming across the end of your aisle in the cross lane, reversing, its load blocking the operator's view of you.",
      cue: "Stop the cart before the painted line.",
      target: "pps-cart-brake",
      why: "A reversing forklift's operator is looking over a shoulder past a mast and a load; a picker and a cart at an aisle end are exactly what they cannot see. Stopping short of the line and letting the truck pass is the only move that does not depend on being seen.",
      missNote: "You pushed on into the cross lane with a reversing forklift in it. Forklift-pedestrian collisions at aisle ends are among the most common serious warehouse injuries, and the pedestrian is almost always the one who assumed the truck would stop.",
      wrongNote: "It is the cart brake. A reversing forklift is crossing your path and nothing else matters until it has gone by.",
    },
    {
      id: "coworker-reaches-in",
      kind: "Hand toward the belt",
      after: "belt-stop", delay: 3, seconds: 12,
      alert: "A coworker is reaching past you into the merge to pull the jammed carton out while the belt is still coasting.",
      cue: "Stop them and call the lead.",
      target: "pps-andon",
      why: "The person reaching in has not locked anything and believes the stop is enough. Pulling the andon cord stops the line upstream and brings the lead, and saying out loud why nobody touches the belt until it is locked is the whole of the lesson.",
      missNote: "Your coworker reached into a belt that was still coasting and had not been locked. Conveyor nip points take fingers and hands in the half second after a jam frees itself — the exact moment someone reaching in is pulling hardest.",
      wrongNote: "It is the andon cord. Somebody's hand is heading into a belt that is not locked out; stop the line and get the lead.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, PPS_ACCENT);

    // ------------------------------------------------------------ floor
    const floor = box(g, 6.8, 0.1, 6.2, 0, 0.05, -0.1, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#707479", base2: "#63676c", seam: "rgba(0,0,0,0.3)",
    }), { repeat: 4, px: 512 }), { rough: 0.9, metal: 0.03, color: 0xc8ccd0 });
    // The cross lane at the aisle end: a painted stop line and hatching.
    box(g, 2.6, 0.006, 0.1, -1.2, 0.103, 1.25, 0xf2f5f7, { rough: 0.6, cast: false });
    for (let i = 0; i < 6; i++) box(g, 0.1, 0.005, 0.7, -2.4 + i * 0.45, 0.103, 1.75, 0xf2c14b, { rough: 0.7, cast: false });
    holoTag(g, "stop line — forklift lane", -1.2, 0.3, 1.25, { css: "#f2c14b", w: 0.44 });

    // ------------------------------------------------------------ static shelving, three sections
    const shelf = group(g, 0, 0.1, -2.05);
    const postX = [-2.6, -1.6, -0.6, 0.4];
    for (const x of postX) for (const z of [-0.25, 0.25]) box(shelf, 0.05, 2.2, 0.05, x, 1.1, z, PPS_SHELF, { rough: 0.5, metal: 0.4 });
    const levels = [0.15, 0.7, 1.25, 1.8];
    let n = 0;
    for (let s = 0; s < 3; s++) {
      const cx = (postX[s] + postX[s + 1]) / 2;
      for (const y of levels) {
        box(shelf, 0.98, 0.03, 0.52, cx, y, 0, 0x8b98a5, { rough: 0.5, metal: 0.3 });
        for (const dx of [-0.24, 0.24]) {
          if (s === 1 && y === 0.7 && dx < 0) continue; // the pick slot, built below
          box(shelf, 0.4, 0.26, 0.44, cx + dx, y + 0.145, 0, PPS_BIN[n++ % PPS_BIN.length], { rough: 0.7 });
        }
      }
    }
    // The pick slot (middle section, second shelf) with its label and the product.
    const slotLabel = decal(shelf, 0.22, 0.07, -1.34, 0.64, 0.27, signFace("B-14-2", { bg: "#f2f5f7", fg: "#1b2a34", accent: "#4fb8c9", scale: 0.5 }), { px: 128 });
    reg2(slotLabel, "pps-slot-label");
    const item = group(shelf, -1.34, 0.72, 0.05);
    box(item, 0.22, 0.16, 0.2, 0, 0.08, 0, 0x2f7fbf, { rough: 0.6 });
    decal(item, 0.14, 0.06, 0, 0.1, 0.101, signFace("BLUE CASE", { bg: "#2f7fbf", accent: "#ffffff", scale: 0.45 }), { px: 96 });
    reg2(item, "pps-item");
    const wrongSku = box(shelf, 0.2, 0.16, 0.18, -1.08, 0.8, 0.05, 0x5aa36a, { rough: 0.6 });
    holoTag(shelf, "same slot?", -1.08, 1.02, 0.2, { css: "#4fb8c9", w: 0.2 });
    reg2(wrongSku, "pps-wrong-sku");
    const crushed = box(shelf, 0.26, 0.12, 0.2, -1.95, 0.91, 0.12, 0xa8906a, { rough: 0.9 });
    crushed.rotation.z = 0.2;
    reg2(crushed, "pps-crushed-unit");
    const lq = group(shelf, -0.3, 1.28, 0.12);
    box(lq, 0.3, 0.2, 0.22, 0, 0.1, 0, 0xd8c9a8, { rough: 0.8 });
    decal(lq, 0.18, 0.08, 0, 0.12, 0.111, signFace("AEROSOLS", { bg: "#d8c9a8", fg: "#3a2a14", accent: "#c0503a", scale: 0.42 }), { px: 96 });
    reg2(lq, "pps-lq-unmarked");
    // The full top shelf and a returns bin someone wants to put on it.
    decal(shelf, 0.34, 0.08, -2.1, 1.74, 0.27, signFace("MAX 150 LB — FULL", { bg: "#c0503a", accent: "#ffffff", scale: 0.4 }), { px: 160 });
    const returnsBin = group(g, -2.55, 0.1, -0.9);
    box(returnsBin, 0.5, 0.36, 0.4, 0, 0.18, 0, 0x6a7a88, { rough: 0.7 });
    holoTag(returnsBin, "returns bin — top shelf?", 0, 0.62, 0, { css: "#c0503a", w: 0.42 });
    reg2(returnsBin, "pps-overload-shelf");
    const climbMark = slab(shelf, 0.9, 0.02, 0.12, -2.1, 1.0, 0.3, 0xc0503a, { radius: 0.01, rough: 0.6, opacity: 0.45, cast: false });
    holoTag(shelf, "climb up for it?", -2.1, 1.15, 0.34, { css: "#c0503a", w: 0.3 });
    reg2(climbMark, "pps-climb-shelf");
    // The rolling ladder that should have been used.
    const ladder = group(g, 0.85, 0.1, -1.6, -0.3);
    for (const sx of [-1, 1]) box(ladder, 0.04, 1.2, 0.04, sx * 0.25, 0.6, 0.3, 0xf2c14b, { rough: 0.5, metal: 0.3 });
    for (let i = 0; i < 4; i++) box(ladder, 0.5, 0.03, 0.2, 0, 0.25 + i * 0.28, 0.3 - i * 0.1, 0x8b98a5, { rough: 0.6, metal: 0.4 });

    // ------------------------------------------------------------ pick cart with totes and scanner
    const cart = group(g, -1.05, 0.1, 0.35);
    for (const [x, z] of [[-0.45, -0.3], [0.45, -0.3], [-0.45, 0.3], [0.45, 0.3]]) {
      box(cart, 0.03, 0.9, 0.03, x, 0.5, z, 0x59636d, { rough: 0.5, metal: 0.5 });
      cyl(cart, 0.05, 0.05, 0.04, x, 0.05, z, 0x1c1f23, { rough: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    }
    for (const y of [0.25, 0.8]) box(cart, 0.95, 0.03, 0.66, 0, y, 0, 0x8b98a5, { rough: 0.5, metal: 0.4 });
    const handle = box(cart, 0.03, 0.03, 0.66, 0.5, 1.05, 0, 0x2b2f34, { rough: 0.5 });
    reg2(handle, "pps-cart-handle");
    const brake = box(cart, 0.1, 0.03, 0.1, 0.45, 0.1, 0.36, 0xd2312b, { rough: 0.5 });
    holoTag(cart, "cart brake", 0.45, 0.28, 0.45, { css: "#4fb8c9", w: 0.2 });
    reg2(brake, "pps-cart-brake");
    const tote = group(cart, 0, 0.82, 0);
    for (const [dx, c] of [[-0.3, 0x2f7fbf], [0, 0x2f7fbf], [0.3, 0x2f7fbf]]) box(tote, 0.28, 0.2, 0.55, dx, 0.1, 0, c, { rough: 0.7 });
    const lit = box(tote, 0.24, 0.02, 0.5, 0, 0.21, 0, 0x59c97b, { emissive: 0x59c97b, ei: 0.9, rough: 0.4, opacity: 0.7, cast: false });
    const toteSocket = box(tote, 0.24, 0.1, 0.5, 0, 0.12, 0, 0xffffff, { rough: 0.5 });
    toteSocket.visible = false; hits["pps-tote-socket"] = toteSocket;
    const toteTag = decal(tote, 0.14, 0.05, 0, 0.14, 0.281, signFace("ORD 3", { bg: "#f2f5f7", fg: "#1b2a34", accent: "#4fb8c9", scale: 0.45 }), { px: 96 });
    reg2(toteTag, "pps-cart-tag");
    const scanner = instrument(cart, 0.35, 1.1, 0.25, { idle: "SIGN IN", color: PPS_ACCENT, w: 0.1, d: 0.14 });
    reg2(scanner, "pps-scanner");
    holoTag(cart, "scanner", 0.35, 1.3, 0.25, { css: "#4fb8c9", w: 0.18 });

    // ------------------------------------------------------------ takeaway conveyor down the right side
    const conv = group(g, 2.25, 0.1, -0.4);
    for (const sx of [-1, 1]) box(conv, 0.05, 0.12, 4.0, sx * 0.3, 0.78, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    for (const z of [-1.8, -0.6, 0.6, 1.8]) for (const sx of [-1, 1]) box(conv, 0.05, 0.72, 0.05, sx * 0.3, 0.36, z, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const belt = box(conv, 0.55, 0.03, 4.0, 0, 0.8, 0, 0x2b2f34, { rough: 0.9 });
    for (let i = 0; i < 6; i++) box(conv, 0.26, 0.2, 0.3, 0, 0.92, -1.7 + i * 0.55, i % 2 ? 0xc9a978 : 0xb89a6c, { rough: 0.85 });
    const jam = group(conv, 0, 0.82, 1.35, 0.5);
    box(jam, 0.34, 0.24, 0.3, 0, 0.12, 0, 0xc9a978, { rough: 0.85 });
    const flap = box(jam, 0.3, 0.02, 0.14, 0, 0.25, 0.14, 0xb89a6c, { rough: 0.85 });
    flap.rotation.x = -0.6;
    reg2(jam, "pps-clear-jam");
    const runningNip = box(conv, 0.55, 0.12, 0.3, 0, 0.9, 0.7, 0xc0503a, { rough: 0.6, opacity: 0.25, cast: false });
    holoTag(conv, "reach in while it runs?", 0, 1.2, 0.7, { css: "#c0503a", w: 0.4 });
    reg2(runningNip, "pps-reach-running-belt");
    // Jam station: the stop button and the andon cord along the belt.
    const stopStation = group(conv, -0.45, 0, 1.2);
    box(stopStation, 0.06, 1.1, 0.06, 0, 0.55, 0, 0xf2c14b, { rough: 0.5 });
    box(stopStation, 0.16, 0.16, 0.1, 0, 1.12, 0, 0xf2c14b, { rough: 0.5 });
    const stopBtn = cyl(stopStation, 0.045, 0.045, 0.04, 0, 1.12, 0.06, 0xd2312b, { rough: 0.4, seg: 14 });
    stopBtn.rotation.x = Math.PI / 2;
    reg2(stopBtn, "pps-belt-stop");
    holoTag(stopStation, "jam stop", 0, 1.36, 0, { css: "#4fb8c9", w: 0.18 });
    const andon = box(conv, 0.015, 0.015, 3.6, 0.34, 1.05, 0, 0xd2312b, { rough: 0.6 });
    const andonPull = box(conv, 0.06, 0.1, 0.06, 0.34, 0.98, -0.4, 0xd2312b, { rough: 0.5 });
    holoTag(conv, "andon cord", 0.34, 1.22, -0.4, { css: "#4fb8c9", w: 0.2 });
    reg2(andonPull, "pps-andon");
    const beacon = cyl(conv, 0.05, 0.05, 0.12, 0.3, 1.3, -1.9, 0x59636d, { rough: 0.4, seg: 12 });
    // The disconnect on its post by the drive end.
    const disc = group(g, 1.65, 0.1, 1.9);
    box(disc, 0.08, 1.3, 0.08, 0, 0.65, 0, 0x59636d, { rough: 0.5, metal: 0.4 });
    box(disc, 0.26, 0.34, 0.14, 0, 1.2, 0.05, 0x8b98a5, { rough: 0.5, metal: 0.3 });
    const discHandle = box(disc, 0.04, 0.16, 0.04, 0.08, 1.2, 0.14, 0xd2312b, { rough: 0.5 });
    reg2(discHandle, "pps-disconnect");
    const lock = box(disc, 0.05, 0.07, 0.03, -0.06, 1.1, 0.14, 0xd2312b, { rough: 0.4 });
    lock.visible = false;
    decal(disc, 0.2, 0.08, 0, 1.44, 0.05, signFace("CONVEYOR DISC.", { bg: "#1b2a34", accent: "#4fb8c9", scale: 0.4 }), { px: 128 });

    // ------------------------------------------------------------ pack bench
    const bench = group(g, 1.0, 0.1, -0.7, -0.35);
    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 2, base: "#c9b48e", base2: "#bca781", seam: "rgba(0,0,0,0.12)" }), { repeat: 2, px: 256 });
    const top = box(bench, 1.3, 0.05, 0.7, 0, 0.9, 0, 0xffffff, { rough: 0.7 });
    top.material = texturedMat(topTex, { rough: 0.7, color: 0xffffff });
    for (const [x, z] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) box(bench, 0.05, 0.88, 0.05, x, 0.44, z, 0x59636d, { rough: 0.5, metal: 0.4 });
    const carton = group(bench, -0.2, 0.93, 0.02);
    box(carton, 0.4, 0.3, 0.32, 0, 0.15, 0, 0xc9a978, { rough: 0.85 });
    const fill = box(carton, 0.36, 0.06, 0.28, 0, 0.26, 0, 0xeef2f4, { rough: 0.9 });
    reg2(fill, "pps-void-fill");
    const tapeLine = box(carton, 0.42, 0.005, 0.06, 0, 0.302, 0, 0x8a6a3a, { rough: 0.3 });
    tapeLine.visible = false;
    const label = decal(carton, 0.2, 0.14, 0.06, 0.304, 0, paperFace("SHIP TO", ["ORD 3 · 2 of 2", "| ||| || |||"], { bg: "#f6f1e4" }), { px: 128 });
    label.rotation.x = -Math.PI / 2;
    reg2(label, "pps-ship-label");
    const tapeGun = group(bench, 0.2, 0.93, 0.2);
    cyl(tapeGun, 0.06, 0.06, 0.05, 0, 0.06, 0, 0x8a6a3a, { rough: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    box(tapeGun, 0.04, 0.12, 0.04, 0.05, 0.02, 0, 0x2b2f34, { rough: 0.6 });
    reg2(tapeGun, "pps-tape");
    const scaleUnit = instrument(bench, 0.4, 0.93, -0.1, { idle: "0.0 lb", color: PPS_ACCENT, w: 0.22, d: 0.2 });
    reg2(scaleUnit, "pps-scale");
    holoTag(bench, "pack scale", 0.4, 1.15, -0.1, { css: "#4fb8c9", w: 0.2 });
    const printer = group(bench, -0.52, 0.93, -0.18);
    box(printer, 0.2, 0.16, 0.22, 0, 0.08, 0, 0x2b2f34, { rough: 0.6 });
    const smudged = decal(printer, 0.12, 0.08, 0, 0.1, 0.111, paperFace("", ["|| ▒▒ |||"], { bg: "#f6f1e4" }), { px: 96 });
    reg2(smudged, "pps-smudged-barcode");
    const slip = decal(bench, 0.16, 0.2, -0.45, 0.93, 0.18, paperFace("SLIP", ["ORD 3", "Oakland 946…", "Label: 947…"], { bg: "#f6f1e4" }), { px: 128 });
    slip.rotation.x = -Math.PI / 2;
    reg2(slip, "pps-address-mismatch");
    const cutter = group(bench, 0.1, 0.93, -0.22, 0.6);
    box(cutter, 0.14, 0.02, 0.03, 0, 0.01, 0, 0xf2c14b, { rough: 0.5 });
    box(cutter, 0.04, 0.005, 0.02, 0.09, 0.012, 0, 0xd9dde2, { rough: 0.2, metal: 0.9 });
    holoTag(bench, "blade out", 0.1, 1.06, -0.22, { css: "#c0503a", w: 0.18 });
    reg2(cutter, "pps-open-blade");

    // ------------------------------------------------------------ the forklift in the cross lane
    const fl = group(g, -3.3, 0.1, 1.8, Math.PI / 2);
    box(fl, 0.9, 0.6, 1.3, 0, 0.45, 0, 0xf2a23b, { rough: 0.5, metal: 0.3 });
    for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.5], [0.4, 0.5]]) cyl(fl, 0.05, 0.05, 1.1, x, 1.3, z, 0x2b2f34, { rough: 0.6, metal: 0.5, seg: 8 });
    box(fl, 0.9, 0.04, 1.0, 0, 1.86, 0.05, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    for (const sx of [-1, 1]) box(fl, 0.07, 1.9, 0.08, sx * 0.25, 0.95, -0.72, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    box(fl, 0.9, 0.7, 0.9, 0, 0.5, -1.25, 0xb89a6c, { rough: 0.85 });
    const flBeacon = cyl(fl, 0.05, 0.05, 0.08, 0, 1.94, 0.3, 0x59636d, { rough: 0.4, seg: 12 });

    // ------------------------------------------------------------ boards
    const wave = holoPanel(g, 0.78, 0.5, -2.35, 1.5, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "#08171b"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fb8c9"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d8f1f5"; ctx.fillText("WAVE 14 — 11 ORDERS", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eefafc";
      ["Path: aisle B, B-10 to B-20", "Carrier cutoff 15:30", "Line 7: aerosols — hazmat desk", "Stop at the line, forklifts cross", "Jam? stop, disconnect, lock", "Rolling ladder for top shelf"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 1.2, accent: PPS_ACCENT });
    reg2(wave, "pps-wave-board");
    const checkin = holoPanel(g, 0.46, 0.3, 2.45, 1.75, 1.95, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CREW CHECK-IN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Jams · slots · hands and back", w / 2, h * 0.66);
    }, { ry: -1.2, accent: 0x4fd1ff });
    reg2(checkin, "pps-crew-checkin");
    const log = holoPanel(g, 0.5, 0.34, 0.2, 1.6, 2.35, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fb8c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d8f1f5"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("WAREHOUSE LOG", w / 2, h * 0.28);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Jam · lockout · slots · damage", w / 2, h * 0.6);
    }, { ry: -0.1, accent: PPS_ACCENT });
    reg2(log, "pps-warehouse-log");

    // ------------------------------------------------------------ people
    const coworker = standingFigure(g, 1.25, 1.05, { ry: -0.9, cloth: 0x37505f, vest: 0xd8e24a });
    standingFigure(g, -0.3, -0.75, { ry: 2.6, cloth: 0x2b3138, vest: 0xf2a23b });

    let pushed = 0, beltOn = true;
    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 0.95, -0.8),
      onStepComplete(step) {
        if (step.id === "scanner") repaint(scanner.userData.screen, signFace("B-14-2", { bg: "#08171b", accent: "#59c97b", fg: "#e0f6f9", scale: 0.5 }));
        if (step.id === "pick") { item.parent.remove(item); tote.add(item); item.position.set(0, 0.08, 0); item.scale.setScalar(0.8); lit.visible = false; }
        if (step.id === "belt-stop") { beltOn = false; beacon.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4 }); }
        if (step.id === "lockout") { lock.visible = true; discHandle.rotation.z = Math.PI / 2; }
        if (step.id === "clear-jam") { jam.position.set(-0.55, -0.72, 1.35); lock.visible = false; discHandle.rotation.z = 0; beltOn = true; beacon.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0, rough: 0.4 }); }
        if (step.id === "pack-out") tapeLine.visible = true;
        if (step.id === "warehouse-log") {
          repaint(log.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,14,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("LOG SIGNED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Merge jam 14:10 · locked out", w / 2, h * 0.66);
          });
        }
      },
      // The forklift really backs across the aisle end, and the coworker
      // really leans into the merge.
      onInterrupt(it) {
        if (it.id === "forklift-crossing") { fl.position.set(-1.4, 0.1, 1.8); flBeacon.material = mat(0xf2a23b, { emissive: 0xf2a23b, ei: 1.4, rough: 0.4 }); }
        if (it.id === "coworker-reaches-in") { coworker.position.set(1.85, 0, 0.95); coworker.rotation.y = -1.6; coworker.userData.body.rotation.x = 0.35; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "forklift-crossing") { fl.position.set(1.0, 0.1, 1.8); brake.material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "coworker-reaches-in") { coworker.position.set(1.25, 0, 1.05); coworker.rotation.y = -0.9; coworker.userData.body.rotation.x = 0; andon.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, rough: 0.5 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "cart-push" && session.holding) pushed = Math.min(1, pushed + dt / 8);
        cart.position.z = 0.35 + pushed * 0.5;
        if (belt.material?.map?.offset && beltOn) belt.material.map.offset.y -= dt * 0.2;
        if (session?.turn && step?.id === "lockout") discHandle.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "weigh") {
          const ok = gg.t >= 0.42 && gg.t <= 0.6;
          repaint(scaleUnit.userData.screen, signFace(`${(4 + gg.t * 8).toFixed(1)} lb`, { bg: "#08171b", accent: ok ? "#59c97b" : "#f2ae14", fg: "#e0f6f9", scale: 0.55 }));
        }
        void t;
      },
    };
  },
};
