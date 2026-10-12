import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dietary Tray Line and Allergy Flags VR — Healthcare Support,
// station four. A hospital tray line rather than a restaurant hot line: the
// ticket read and matched to the room before a plate is touched, the flags
// that actually change this tray sorted from the ones that are just charted,
// the right texture and the right thickener for the order that called for
// them, the tray built with a dedicated utensil and married to its own
// ticket so the two never separate, held at a safe temperature for the
// delivery window, and the last check at the bedside — the patient's own ID
// band against the ticket — before the tray is ever left on the table.

const DTL_ACCENT = 0xe0a23f;

export const SIM_HC_DIETARY_TRAY_LINE_AND_ALLERGY_FLAGS = {
  id: "hc-dietary-tray-line-and-allergy-flags",
  index: "355",
  domain: "Healthcare Support",
  trade: "Dietary aide",
  category: "Healthcare Support",
  indoor: "kitchen",
  certification: "The FDA Food Code as adopted by the state's retail food code for the tray line's own food-safety practice; ServSafe food-handler training; HIPAA's privacy rule for a ticket carrying a patient's name and room number in a shared line; the CDC's general infection-prevention guidance; SEIU-UHW and NUHW as the training bodies for hospital dietary staff",
  name: "Dietary Tray Line & Allergy Flags",
  title: simTitle("Dietary Tray Line & Allergy Flags"),
  tagline: "The ticket matched to the room, the flags that change this tray sorted from the ones that don't, the right texture and thickener, a dedicated utensil, and a bedside ID check before the tray is ever left behind",
  accent: DTL_ACCENT,
  accentCss: "#e0a23f",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "tray-cleared", name: "Tray Cleared", note: "A tray built to its ticket, held safe, and checked against the patient's own ID band before delivery" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or SEIU-UHW's member resources if a near-miss on an allergy tray has you rattled",

  game: system({
    name: "Tray Line Standard",
    currency: "TRAY",
    ranks: ["New Aide", "Tray Line Certified", "Lead Aide", "Dietary Supervisor", "Tray Line Certified Trainer"],
    badges: [
      { id: "flags-caught", name: "Flags Caught", note: "Every flag that changes the tray found before it was built", test: AWARD.stepClean("read-flags") },
      { id: "dedicated-utensil", name: "Dedicated Utensil", note: "The allergy tray never touched by a shared serving tool", test: AWARD.stepClean("allergen-utensil-swap") },
      { id: "bedside-verified", name: "Bedside Verified", note: "The ID band checked against the ticket before the tray was left", test: AWARD.stepClean("bedside-id-check") },
    ],
    challenges: [
      { id: "clean-tray", name: "Clean Tray", note: "No corrections anywhere in the build", test: AWARD.clean },
      { id: "steady-hold", name: "Steady Hold", note: "Held the cart at temperature the whole window, first try", test: AWARD.unbroken },
      { id: "fast-tray", name: "Fast Tray", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "shared-allergen-utensil-decoy": "That serving spoon just came out of a dish with a tree-nut ingredient in it, and it's sitting on this ticket's tray. A shared utensil carries whatever it last touched onto the next thing it touches — an allergy ticket gets its own tool, not whatever's closest.",
    "npo-tray-built-decoy": "That tray is fully built and sitting ready for a room the ticket already marks NPO. A patient held off food and drink for a procedure doesn't get a tray sent up anyway because it happened to already be made — it gets held, not delivered.",
    "wrong-texture-plate-decoy": "That's a regular-texture plate sitting where a pureed order needs to go. Sending regular texture to an order written for pureed is exactly the mismatch a texture-modified diet exists to prevent — a swallowing risk, not a garnish choice.",
    "expired-thickener-decoy": "That thickener packet is past its date. A thickener that doesn't perform to spec doesn't announce itself in the cup — it just leaves a liquid thinner than the order called for, and that's the only warning anyone gets before it's already been swallowed.",
  },

  lateNotes: {
    "bedside-id-check": "Not yet — this tray hasn't left the cart.",
    "log-delivery": "Hold that. The ID has to be checked at the bedside before this delivery closes out.",
  },

  steps: [
    {
      id: "hand-hygiene-dtl", kind: "select", target: "hand-hygiene-dtl",
      title: "Hand hygiene before the line",
      cue: "Wash hands and glove before touching a ticket or a plate.",
      why: "Every tray on this line goes to someone whose immune system may already be working overtime — hand hygiene at the start of the shift is the one habit that protects every ticket that follows it, not just the first one.",
    },
    {
      id: "pull-ticket", kind: "select", target: "pull-ticket",
      title: "Pull the ticket and match the room",
      cue: "Read the tray ticket and confirm the patient's name and room number before assembling anything.",
      why: "The ticket is what tells this line which tray is which — building from memory or from where a cart happens to be parked is how a cardiac diet and a regular tray change places without anyone actually deciding it should happen, and the room number on the ticket is the only thing standing between that quiet swap and a tray that reaches the wrong bed looking perfectly correct.",
    },
    {
      id: "read-flags", kind: "find", noHint: true,
      targets: ["allergy-flag", "npo-flag"],
      itemNames: { "allergy-flag": "a food allergy flag", "npo-flag": "an NPO hold" },
      itemNotes: {
        "allergy-flag": "This flag changes which plate, which utensil and which ingredients this tray can touch — it gets caught here, before the plate is chosen, not after the tray's already built the ordinary way.",
        "npo-flag": "NPO means nothing by mouth, full stop — this ticket doesn't get a tray built at all until that hold is lifted, whatever else is written on it.",
      },
      decoyNotes: {
        "flag-low-sodium": "Charted and true, but the standard low-sodium menu already covers it — nothing about how this tray gets built changes.",
      },
      title: "Read the ticket for what changes this tray",
      cue: "Two things on this ticket change what happens next. Find them before you reach for a plate.",
      why: "A ticket carries more than what actually changes the build — sorting the flag that redirects this tray from the one that's just charted and routine is the actual skill of reading it, and it happens once, before the first plate comes off the rack.",
    },
    {
      id: "texture-select", kind: "select", target: "texture-select",
      title: "Choose the texture the order calls for",
      cue: "Match the plate to the ticket's texture order — regular, mechanical soft, or pureed.",
      why: "A texture order isn't a preference on the ticket, it's the reason this patient can safely swallow what's on the plate — the wrong texture doesn't taste different or look obviously off, it's a swallowing hazard shaped exactly like an ordinary plate of food, which is exactly why the plate gets matched to the order before anything is served rather than corrected after someone notices.",
    },
    {
      id: "thicken-drink", kind: "sequence",
      targets: ["thicken-liquid", "cap-cup"],
      itemNames: { "thicken-liquid": "thicken the beverage to spec", "cap-cup": "cap the cup" },
      title: "Thicken and cap the ordered beverage",
      cue: "Mix the thickener to the ticket's consistency, then cap the cup.",
      why: "A thickened-liquids order exists because thin liquid moves faster than this patient can safely manage — capping the cup after mixing is what keeps that consistency from being diluted or spilled before it ever reaches the tray.",
      outOfOrderNote: "Thicken first, then cap — a capped cup of liquid that was never actually thickened just travels to the room looking finished.",
    },
    {
      id: "portion-check", kind: "gauge", target: "portion-scale",
      title: "Weigh the portion to the diet order's spec",
      cue: "Portion the entree and read the scale before it goes on the tray.",
      why: "A restricted diet's whole point can be undone by a portion that's simply too large — a renal or cardiac order is written around a specific amount, not a general direction, and the scale is what makes portioning an actual measurement instead of a guess by eye that happens to land close enough most days.",
      gauge: { label: "PORTION WEIGHT", speed: 0.6, green: [0.4, 0.68], readout: (t) => (t < 0.4 ? "under portion" : t > 0.68 ? "over portion" : "matches the order"), missNote: "Committed outside the order's portion spec. Re-plate to the ticket's amount before this tray moves on." },
    },
    {
      id: "line-scan", kind: "find", noHint: true,
      targets: ["cross-contact-utensil", "expired-item"],
      itemNames: { "cross-contact-utensil": "a utensil that touched a shared allergen", "expired-item": "an item past its use-by date" },
      itemNotes: {
        "cross-contact-utensil": "That utensil was in a shared pan a minute ago — it doesn't touch this tray, allergy order or not, until it's been through the wash.",
        "expired-item": "That item is past its date sitting right on the line — it goes back to the cooler for disposal, not onto a tray because it's within reach.",
      },
      title: "Scan the line before you plate",
      cue: "Two things sitting on this line right now shouldn't go anywhere near a tray. Find them.",
      why: "A tray line moves fast enough that a bad utensil or an expired item can end up on a plate simply because it was the closest thing to hand — a quick scan before plating is what catches it while it's still just sitting on the counter, instead of after it's already part of a tray someone is about to eat from.",
    },
    {
      id: "allergen-utensil-swap", kind: "select", target: "allergen-utensil-swap",
      title: "Switch to a dedicated utensil for the allergy tray",
      cue: "Pick up the clean, dedicated serving tool before touching this ticket's food.",
      why: "Once a tray is flagged for an allergy, every tool that touches it has to be one that's never touched the allergen — a shared spoon reused out of convenience is how a flagged tray causes the exact reaction the flag existed to prevent.",
    },
    {
      id: "marry-ticket", kind: "drag", target: "tray-ticket",
      title: "Marry the ticket to the tray",
      cue: "Attach the printed ticket to the tray it belongs to before it leaves the line.",
      why: "A tray and its ticket separated anywhere between here and the room is a tray nobody downstream can actually verify against anything — clipping them together now, at the one point they're both still in the same hands, is what keeps that verification possible all the way to the bedside instead of just to the cart.",
      drag: { to: "tray-slot", radius: 0.4, missNote: "Not on this tray — a ticket sitting loose on the counter verifies nothing once the tray moves." },
    },
    {
      id: "lid-cover", kind: "select", target: "lid-cover",
      title: "Cover the tray for transport",
      cue: "Lid or cover every plate before the tray goes on the cart.",
      why: "A covered plate holds its temperature and stays clear of anything it might pass on its way through the hallway — an elevator, a cart bumped against a doorframe, a cough from someone passing — an uncovered tray is losing both from the moment it leaves the line, not from whenever someone happens to notice.",
    },
    {
      id: "manifest-check", kind: "select", target: "cart-manifest",
      title: "Verify the cart manifest before rolling",
      cue: "Match every tray's slot to the cart's own manifest before it leaves the kitchen.",
      why: "The manifest is what lets the whole cart be trusted at once instead of every tray being checked over again room by room — a tray slotted into the wrong compartment is a tray that reads as delivered correctly right up until the wrong patient actually opens it and finds someone else's diet order on their table.",
    },
    {
      id: "hot-hold", kind: "hold", target: "hot-holding-cart", seconds: 6,
      title: "Hold the cart at a safe temperature",
      cue: "Keep the cart closed and at temperature through the full delivery window.",
      why: "A hot-holding cart only protects a tray for as long as it actually stays closed and powered — propped open or unplugged even briefly, the food inside starts sliding out of the range the whole system was built to hold it in.",
      holdBreakNote: "The cart came open before the window closed. Every tray inside just spent that time outside the temperature it was supposed to be held at.",
    },
    {
      id: "cart-latch", kind: "turn", target: "cart-latch",
      title: "Latch the cart compartment",
      cue: "Rotate the latch fully closed before moving the cart.",
      turn: { turns: 0.4, axis: "y", label: "CART LATCH" },
      why: "A latch left half-closed pops open over the first door threshold or elevator gap this cart crosses, and a cart that spills partway down a hallway is a fall hazard as much as it is a ruined delivery — closed and confirmed is what keeps every tray inside where the manifest says it is until it's actually delivered.",
    },
    {
      id: "bedside-id-check", kind: "select", target: "bedside-id-check",
      title: "Check the ID band at the bedside",
      cue: "Read the patient's ID band against the tray ticket before leaving the tray.",
      why: "Everything upstream — the flag, the texture, the thickener, the manifest — was built on the assumption that this tray reaches the right person. The bedside check is the one place that assumption actually gets tested, on the one person it was all built for.",
    },
    {
      id: "log-delivery", kind: "select", target: "log-delivery",
      title: "Log the delivery",
      cue: "Record the tray as delivered, refused, or held.",
      why: "A tray that's delivered, refused or held all look the same from the kitchen unless someone logs which one happened — that record is what tells the next shift whether this patient actually ate, not just whether a tray left the line.",
    },
  ],

  interrupts: [
    {
      id: "verbal-diet-request",
      kind: "Off-order request",
      after: "read-flags", delay: 3, seconds: 12,
      alert: "Someone from the floor calls down asking you to add extra salt packets to this cardiac-diet tray because the patient prefers it that way.",
      cue: "That request goes back to the order, not straight onto the tray.",
      target: "verify-diet-order",
      why: "A standing diet order isn't this line's to adjust on a phone call, whatever the reason given — a request like this gets routed back to confirm whether the order itself has actually changed, because building the tray to a preference instead of the order is how a cardiac diet quietly stops being one.",
      missNote: "Extra salt went on a cardiac-diet tray on a verbal request nobody with authority to change the order actually approved. The tray now contradicts the order it was supposedly built from.",
      wrongNote: "Route it back to verify the order first — a phone request doesn't rewrite what the ticket says.",
    },
    {
      id: "cart-heater-fault",
      kind: "Equipment fault",
      after: "hot-hold", delay: 3, seconds: 11,
      alert: "The delivery cart's heating element alarms mid-hold — the temperature is dropping.",
      cue: "Every tray in that cart needs a working cart, not this one.",
      target: "swap-hot-cart",
      why: "A cart that can't hold its own temperature isn't a delivery risk for one tray, it's a delivery risk for everything loaded in it — the trays move to a cart that's actually working before this delivery continues, not out the door on a unit that's already failing.",
      missNote: "The delivery went out on a cart that was already alarming. Every tray riding in it spent the trip sliding further out of a safe holding temperature.",
      wrongNote: "Swap to the working cart — nothing leaves on a unit that's already alarming.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, DTL_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#d8cdb2", base2: "#cdc2a7", seam: "rgba(0,0,0,0.14)",
    }), { repeat: 4, px: 256 });
    const floorMat = () => texturedMat(floorTex, { rough: 0.6, metal: 0.02, color: 0xdfd5ba });
    const floorPatch = slab(g, 3.6, 0.006, 3.2, 0, 0.001, 0, 0xdfd5ba, { radius: 0.05, cast: false });
    floorPatch.material = floorMat();

    const steelTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#b7bec3"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 10; i++) cx.fillRect(0, (i * h) / 10, w, 1);
    }, { repeat: 5, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.35, metal: 0.6, color: 0xc7cdd2 });

    // ------------------------------------------------------------ hygiene station
    const sink = group(g, -3.0, 0, -2.6);
    box(sink, 0.7, 0.86, 0.5, 0, 0.43, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const sinkTop = slab(sink, 0.7, 0.04, 0.5, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    sinkTop.material = steelMat();
    const soapStub = box(sink, 0.06, 0.14, 0.06, 0.2, 1.0, 0, 0xdfa23b, { rough: 0.5 });
    holoTag(sink, "Hand hygiene", 0, 1.1, 0, { css: DTL_ACCENT, w: 0.4 });
    reg(hits, soapStub, "hand-hygiene-dtl");

    // -------------------------------------------------------------------- ticket rail
    const ticketRail = group(g, -1.6, 0, -2.8);
    box(ticketRail, 0.8, 0.03, 0.03, 0, 1.1, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    const ticket = decal(ticketRail, 0.26, 0.34, 0, 1.05, 0.02,
      paperFace("TRAY TICKET", ["Room: — · Diet: —", "Allergy: — · NPO: —"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 220 });
    reg(hits, ticket, "pull-ticket");

    // Flag row — allergy, NPO, and a low-sodium decoy that changes nothing.
    const flagRow = group(g, -1.6, 0, -2.3);
    const flagDefs = [
      ["allergy-flag", "ALLERGY", -0.3], ["npo-flag", "NPO", 0], ["flag-low-sodium", "LOW SODIUM", 0.3],
    ];
    for (const [id, label, dx] of flagDefs) {
      const card = decal(flagRow, 0.26, 0.12, dx, 1.4, 0,
        paperFace(label, ["tap to flag"], { bg: "#fbf3df", band: id === "flag-low-sodium" ? "#8fae74" : "#c9302b" }), { px: 220 });
      reg(hits, card, id);
    }

    // ------------------------------------------------------------------ tray line
    const line = group(g, 0.3, 0, -1.4);
    box(line, 2.2, 0.86, 0.6, 0, 0.43, 0, 0xd7dce1, { rough: 0.5, metal: 0.15 });
    const lineTop = slab(line, 2.2, 0.04, 0.6, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    lineTop.material = steelMat();

    const platePlain = box(line, 0.2, 0.02, 0.2, -0.8, 0.9, 0, 0xf4f8fa, { rough: 0.4 });
    reg(hits, platePlain, "texture-select");
    const wrongTexturePlate = box(line, 0.2, 0.02, 0.2, -0.6, 0.9, 0.15, 0xeceff1, { rough: 0.4 });
    holoTag(wrongTexturePlate, "Regular — pureed order", 0, 0.05, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, wrongTexturePlate, "wrong-texture-plate-decoy");

    const cup = cyl(line, 0.03, 0.03, 0.08, -0.3, 0.92, 0, 0xdfe4e5, { rough: 0.5, seg: 12 });
    reg(hits, cup, "thicken-liquid");
    const cupLid = cyl(line, 0.03, 0.03, 0.01, -0.3, 0.965, 0, 0x53585e, { rough: 0.5, seg: 12, opacity: 0.001, transparent: true, cast: false });
    reg(hits, cupLid, "cap-cup");
    const thickenerPacket = box(line, 0.04, 0.005, 0.03, -0.15, 0.9, -0.15, 0xdfa23b, { rough: 0.6 });
    holoTag(thickenerPacket, "Expired thickener", 0, 0.04, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, thickenerPacket, "expired-thickener-decoy");

    const scalePanel = instrument(line, 0.1, 0.9, 0.15, { idle: "-- g", color: DTL_ACCENT, w: 0.14, d: 0.2, ry: 0 });
    reg(hits, scalePanel, "portion-scale");

    // Line-scan decoys: a cross-contact utensil and an expired item.
    const badUtensil = group(line, 0.5, 0.92, -0.1);
    cyl(badUtensil, 0.006, 0.006, 0.14, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(badUtensil, "Touched shared allergen", 0, 0.06, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, badUtensil, "cross-contact-utensil");
    const expiredItem = box(line, 0.1, 0.06, 0.08, 0.7, 0.93, 0.1, 0xdfa23b, { rough: 0.6 });
    holoTag(expiredItem, "Past use-by date", 0, 0.06, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, expiredItem, "expired-item");

    // Dedicated allergy utensil stand, away from the shared line.
    const dedicatedStand = group(g, 1.4, 0, -2.4);
    box(dedicatedStand, 0.2, 0.3, 0.14, 0, 0.15, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const dedicatedUtensil = cyl(dedicatedStand, 0.007, 0.007, 0.2, 0, 0.38, 0, 0x9fd6c0, { rough: 0.3, seg: 8 });
    holoTag(dedicatedStand, "Dedicated utensil", 0, 0.48, 0, { css: DTL_ACCENT, w: 0.4 });
    reg(hits, dedicatedUtensil, "allergen-utensil-swap");

    // Shared-allergen utensil sitting in a pan on the line — the hazard.
    const sharedPan = group(line, 0.9, 0.9, 0.15);
    box(sharedPan, 0.24, 0.05, 0.18, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.5 });
    const sharedUtensil = cyl(sharedPan, 0.006, 0.006, 0.16, 0, 0.05, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    sharedUtensil.rotation.set(0, 0, 0.6);
    holoTag(sharedUtensil, "Shared allergen spoon", 0, 0.1, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, sharedUtensil, "shared-allergen-utensil-decoy");

    // ---------------------------------------------------------------- assembled tray
    const assembledTray = group(g, 1.6, 0, -0.6);
    box(assembledTray, 0.5, 0.86, 0.5, 0, 0.43, 0, 0xd7dce1, { rough: 0.5, metal: 0.1 });
    const trayTop = slab(assembledTray, 0.5, 0.04, 0.5, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    trayTop.material = steelMat();
    const trayPlate = box(assembledTray, 0.42, 0.03, 0.3, 0, 0.9, 0, 0xf4f8fa, { rough: 0.4 });
    void trayPlate;
    const trayTicketSlot = box(assembledTray, 0.16, 0.01, 0.1, -0.14, 0.905, 0.16, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["tray-slot"] = trayTicketSlot;

    const travellingTicket = decal(g, 0.16, 0.2, 0.6, 0.9, -1.35,
      paperFace("TICKET", ["Room 4B"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 160 });
    reg(hits, travellingTicket, "tray-ticket");

    const lidMarker = box(assembledTray, 0.44, 0.06, 0.32, 0, 0.94, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, lidMarker, "lid-cover");

    // NPO tray decoy, already built and sitting ready.
    const npoTray = group(g, 2.3, 0, -0.6);
    box(npoTray, 0.42, 0.02, 0.3, 0, 0.9, 0, 0xf4f8fa, { rough: 0.4 });
    holoTag(npoTray, "NPO — built anyway?", 0, 0.98, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, npoTray, "npo-tray-built-decoy");

    // ------------------------------------------------------------------- delivery cart
    const cart = group(g, 0.4, 0, 1.6);
    box(cart, 0.9, 1.2, 0.6, 0, 0.6, 0, 0xdfe4e5, { rough: 0.5, metal: 0.2 });
    for (let i = 0; i < 3; i++) box(cart, 0.86, 0.02, 0.56, 0, 0.3 + i * 0.35, 0, 0xc7cdd2, { rough: 0.5, metal: 0.2 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(cart, 0.05, 0.05, 0.04, sx * 0.4, 0.05, sz * 0.26, 0x14171a, { rough: 0.7, seg: 12 });
    const cartLamp = ball(cart, 0.014, 0.35, 1.1, 0.28, 0x59c97b, { emissive: 0x59c97b, ei: 0.6, cast: false, seg: 8, seg2: 6 });
    reg(hits, cartLamp, "hot-holding-cart");
    const manifestPanel = holoPanel(g, 0.5, 0.34, 0.9, 1.5, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,18,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0a23f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeccb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CART MANIFEST", w * 0.06, h * 0.2);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Slot 1: — · Slot 2: —", w * 0.06, h * 0.55);
    }, { accent: DTL_ACCENT, ry: -0.5 });
    reg(hits, manifestPanel, "cart-manifest");
    const latch = box(cart, 0.05, 0.1, 0.02, 0.44, 0.6, 0.3, 0x2b3138, { rough: 0.5, metal: 0.4 });
    reg(hits, latch, "cart-latch");
    const backupCart = group(g, -0.6, 0, 2.4);
    box(backupCart, 0.9, 1.2, 0.6, 0, 0.6, 0, 0xdfe4e5, { rough: 0.5, metal: 0.2 });
    holoTag(backupCart, "Backup cart", 0, 1.3, 0, { css: DTL_ACCENT, w: 0.4 });
    reg(hits, backupCart, "swap-hot-cart");

    // ------------------------------------------------------------ bedside + logging
    const bedside = group(g, 3.0, 0, 0.4);
    box(bedside, 0.5, 0.5, 1.2, 0, 0.25, 0, 0x8b929a, { rough: 0.45, metal: 0.5 });
    const idBand = torus(bedside, 0.03, 0.007, 0.1, 0.55, -0.4, 0xeaf0f2, { rough: 0.4, seg: 6, seg2: 12 });
    reg(hits, idBand, "bedside-id-check");

    const orderPanel = holoPanel(g, 0.5, 0.34, -3.0, 1.5, 0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,18,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0a23f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeccb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("VERIFY ORDER", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Diet order: cardiac", w * 0.06, h * 0.6);
    }, { accent: DTL_ACCENT });
    reg(hits, orderPanel, "verify-diet-order");
    const orderAlertLamp = ball(orderPanel, 0.02, 0.22, 0.13, 0.01, 0x59c97b, { emissive: 0x59c97b, ei: 0.3, cast: false, seg: 8, seg2: 6 });

    const logPanel = holoPanel(g, 0.5, 0.34, 3.0, 1.6, 1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,18,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0a23f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeccb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DELIVERY LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: pending", w * 0.06, h * 0.6);
    }, { accent: DTL_ACCENT, ry: -0.4 });
    reg(hits, logPanel, "log-delivery");

    const aide = standingFigure(g, 0.3, -0.6, { ry: 0.4, cloth: 0xb98042, skin: 0xb98a63 });
    void aide;

    // A second dietary aide at the far end of the line, and a rolling
    // beverage station for depth.
    const secondAide = standingFigure(g, -2.3, 2.4, { ry: -0.4, cloth: 0x3f6fa0, skin: 0xd9a985 });
    void secondAide;
    const beverageStation = group(g, 2.6, 0, 2.0);
    box(beverageStation, 0.5, 0.86, 0.4, 0, 0.43, 0, 0xd7dce1, { rough: 0.5, metal: 0.15 });
    box(beverageStation, 0.5, 0.04, 0.4, 0, 0.87, 0, 0xc7cdd2, { rough: 0.5 });
    cyl(beverageStation, 0.1, 0.1, 0.3, -0.1, 1.02, 0, 0xf4f8fa, { rough: 0.4, opacity: 0.7, transparent: true, seg: 12 });
    cyl(beverageStation, 0.1, 0.1, 0.3, 0.1, 1.02, 0, 0xdfa23b, { rough: 0.4, opacity: 0.7, transparent: true, seg: 12 });
    holoTag(beverageStation, "Beverage station", 0, 1.2, 0, { css: DTL_ACCENT, w: 0.44 });

    // Supply shelving for depth.
    const shelf = group(g, -3.7, 0, 1.0);
    box(shelf, 0.06, 1.4, 0.6, -0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelf, 0.06, 1.4, 0.6, 0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "THICKENER", 0xdfa23b], [0.7, "TRAY LINERS", 0xf4f8fa], [1.1, "ALLERGY KITS", 0xf2c14b],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelf, 0.74, 0.02, 0.58, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelf, 0.2, 0.14, 0.18, i * 0.24, y + 0.08, 0, c, { rough: 0.7 });
        decal(shelf, 0.16, 0.05, i * 0.24, y + 0.08, 0.091, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#fbeccb"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelf, "Dietary stock", 0, 1.45, 0, { css: DTL_ACCENT, w: 0.44 });

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0.3, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "read-flags") { /* flags remain visible as chart reference */ }
        if (step.id === "line-scan") { badUtensil.visible = false; expiredItem.visible = false; }
        if (step.id === "marry-ticket") {
          travellingTicket.parent.remove(travellingTicket);
          assembledTray.add(travellingTicket);
          travellingTicket.position.set(-0.14, 0.95, 0.16);
          travellingTicket.rotation.set(-Math.PI / 2, 0, 0);
        }
        if (step.id === "manifest-check") {
          repaint(manifestPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(24,18,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#e0a23f"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#fbeccb";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("CART MANIFEST", w * 0.06, h * 0.2);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Slot 1: matched · Slot 2: matched", w * 0.06, h * 0.55);
          });
        }
        if (step.id === "log-delivery") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(24,18,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#e0a23f"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#fbeccb";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("DELIVERY LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: delivered", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "verbal-diet-request") {
          repaint(orderPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(42,20,4,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#f0645b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#ffd2ce";
            ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("SALT REQUEST — VERIFY", w * 0.06, h * 0.3);
            ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
            ctx.fillText("Order still reads: cardiac", w * 0.06, h * 0.6);
          });
          orderAlertLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
        }
        if (it.id === "cart-heater-fault") cartLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.8 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "verbal-diet-request") {
          repaint(orderPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(24,18,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#e0a23f"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#fbeccb";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("VERIFY ORDER", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Order confirmed unchanged", w * 0.06, h * 0.6);
          });
          orderAlertLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.3 });
        }
        if (it.id === "cart-heater-fault") cartLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6 });
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "portion-check") {
          repaint(scalePanel.userData.screen, signFace(gg.t < 0.4 ? "UNDER" : gg.t > 0.68 ? "OVER" : "MATCH", {
            bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.68 ? "#59c97b" : "#f0645b", fg: "#fbeccb", scale: 0.55,
          }));
        }
        void t;
      },
    };
  },
};
