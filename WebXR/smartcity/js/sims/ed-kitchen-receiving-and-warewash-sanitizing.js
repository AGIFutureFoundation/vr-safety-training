import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, tileFace, stainlessFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Kitchen Receiving & Warewash Sanitizing VR — Culinary &
// Hospitality, the education-support-staff programme.
//
// The school kitchen's loading dock and dish room, a shift apart from the
// serving line: a delivery checked at the dock before it ever reaches the
// walk-in, damaged and pest-signed cases turned away, stock rotated oldest
// first, the sanitizer mixed and tested rather than guessed at, dishes
// timed through their contact time, and the room closed down with the
// chemicals locked away from the food they're never allowed to touch. The
// learner is the AFT- or CSEA-represented school nutrition worker running
// receiving and the dish room. The district, the supplier and every reading
// on a gauge are generic.

const KR_ACCENT = 0x4fb0c9;
const KR_CSS = "#4fb0c9";

export const SIM_ED_KITCHEN_RECEIVING_AND_WAREWASH_SANITIZING = {
  id: "ed-kitchen-receiving-and-warewash-sanitizing",
  index: "626",
  domain: "Culinary & Hospitality",
  trade: "AFT- or CSEA-represented school nutrition worker receiving deliveries and running the dish room",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  weather: "overcast",
  certification: "AFT and CSEA school nutrition training; the California Retail Food Code (the FDA Food Code as adopted) for receiving temperatures, date marking and warewashing; ServSafe Food Protection Manager practice for the sanitizer contact time and concentration; OSHA's Hazard Communication standard (29 CFR 1910.1200) for the sanitizer's own SDS and label; NSF/ANSI 2 for the food-contact equipment in the dish room",
  name: "Kitchen Receiving & Warewash Sanitizing",
  title: simTitle("Kitchen Receiving & Warewash Sanitizing"),
  tagline: "The dock before the walk-in: the delivery's temperature probed, damage and pest signs caught before a case is accepted, stock dated and rotated oldest first, a damaged case turned away, the sanitizer mixed to the test strip rather than by eye, dishes timed through contact, the rack fed at a steady pace, and the room closed with the chemicals locked away from the food",
  accent: KR_ACCENT,
  accentCss: KR_CSS,
  parSeconds: 320,
  footprint: 2.8,
  badge: { id: "tested-not-guessed", name: "Tested, Not Guessed", note: "Every delivery temperature probed, the sanitizer tested to the strip, and nothing left holding at a strength nobody actually checked" },

  supportLine: "your AFT or CSEA chapter's member assistance line, or the district's employee assistance programme",

  game: system({
    name: "Dock to Dish Room",
    currency: "PPM",
    ranks: ["Kitchen Aide", "Nutrition Worker", "Lead Nutrition Worker", "Kitchen Manager", "Food Safety Certified"],
    badges: [
      { id: "never-accepted-blind", name: "Never Accepted Blind", note: "Every delivery temperature-checked and inspected before signing for it", test: AWARD.safe },
      { id: "clean-shift", name: "Clean Shift", note: "No corrections across the whole shift", test: AWARD.clean },
      { id: "steady-rack-feed", name: "Steady Rack Feed", note: "The dish rack feed rate held in band without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "dock-cleared-on-time", name: "Dock Cleared on Time", note: "Whole receiving and dish-room run finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-delivery-check", name: "One-Pass Delivery Check", note: "Delivery inspection clean on the first pass", test: AWARD.stepClean("delivery-inspect") },
      { id: "nine-in-a-row", name: "Nine in a Row", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "accept-damaged-can-without-check": "That can is swollen at both ends and it's headed for the shelf anyway. A swollen can is a sign of gas from bacterial growth inside it, and it gets rejected on sight — not opened, not tasted, not shelved next to cans that are fine.",
    "sanitizer-bypass-eyeball": "That's mixing the sanitizer by eye instead of reading the test strip. A solution too weak doesn't actually sanitize anything sitting in it for the full contact time, and one too strong is its own hazard on food-contact surfaces — the strip is what turns a guess into a known concentration.",
    "mixed-chemical-storage-near-food": "That's a shelf of cleaning chemicals sitting directly above open food product. Anything that leaks or gets knocked off that shelf lands in the food below it — chemicals are stored below and away from food, never over it.",
    "bare-hand-in-dish-water": "That's a bare hand going into the hot sanitizer basin instead of the tongs or the rack. The basin runs hot enough to scald and concentrated enough to irritate skin on prolonged contact — hands stay out of it, full stop.",
  },

  lateNotes: {
    "test-strip-reader": "Not yet — the sanitizer gets tested once the sink or machine is actually filled and dialled in, not before.",
    "dish-basket": "The dishes go in for contact time once the sanitizer has actually tested at the right concentration, not before.",
  },

  steps: [
    {
      id: "read-manifest", kind: "select", target: "manifest-board",
      title: "Read today's delivery manifest",
      cue: "Read the manifest for what's arriving and what temperature each item should hold.",
      why: "The manifest is what tells the receiving worker whether a pallet of frozen goods is actually supposed to be frozen solid or partly thawed by design — without reading it first, a temperature reading at the dock means nothing to compare it against.",
    },
    {
      id: "probe-delivery-temp", kind: "gauge", target: "delivery-thermometer",
      title: "Probe the delivery truck's temperature",
      cue: "Probe a case from the reefer and commit the reading against the manifest's expected range.",
      why: "A reefer unit's own dial says where the truck's controls are set, not what the product inside actually reached over the whole trip — probing the food itself is the only way to know it never left the safe range between the supplier's dock and this one.",
      gauge: { label: "DELIVERY TEMP", speed: 0.6, green: [0.3, 0.5], readout: (t) => `${Math.round(20 + t * 40)} °F`, missNote: "Outside the expected range for this item. A delivery that's climbed out of range on the way here doesn't get accepted on the strength of the manifest alone." },
    },
    {
      id: "delivery-inspect", kind: "find", noHint: true,
      targets: ["torn-packaging", "pest-droppings", "swollen-can"],
      itemNames: { "torn-packaging": "the torn case packaging", "pest-droppings": "signs of pests on the pallet", "swollen-can": "the swollen can" },
      itemNotes: {
        "torn-packaging": "This case's packaging is torn open on one corner. Torn packaging means the product inside was exposed somewhere between the supplier and this dock, and it doesn't get shelved without a closer look at what's actually inside.",
        "pest-droppings": "There are pest droppings on this pallet's wrapping. A delivery that arrives with pest signs already on it gets refused at the dock, not brought inside to deal with later.",
        "swollen-can": "This can is swollen at both ends. That's gas from bacterial activity inside a sealed can, and it's pulled and rejected before it ever reaches a shelf.",
      },
      title: "Inspect the delivery before it comes off the dock",
      cue: "Three things about this delivery are not right. Find them before it comes inside.",
      why: "The dock is the one point in the whole chain where a bad case can be turned around and sent back rather than becoming this kitchen's problem — every one of these three signs is easy to miss once the pallet is already broken down and shelved among cases that are fine.",
    },
    {
      id: "reject-damaged-case", kind: "drag", target: "damaged-case",
      title: "Set the damaged case aside for return",
      cue: "Carry the case with the swollen can to the return pallet, separate from accepted stock.",
      why: "A rejected case has to physically leave the path to the shelves, not just get a note written about it — the return pallet is where it goes so nobody restocking later mistakes it for something already cleared.",
      drag: { to: "return-pallet-spot", radius: 0.5, missNote: "Not on the return pallet yet. A rejected case stays separate from accepted stock until it's actually off this dock." },
    },
    {
      id: "date-and-rotate", kind: "sequence", anyOrder: false,
      targets: ["date-label-applied", "oldest-moved-front", "new-stock-placed-back"],
      itemNames: { "date-label-applied": "date label applied", "oldest-moved-front": "oldest stock moved to the front", "new-stock-placed-back": "new stock placed behind it" },
      title: "Date and rotate the stock",
      cue: "Date-label the new delivery, move the oldest stock to the front, then place the new stock behind it, in that order.",
      why: "First-in-first-out only works if the oldest stock is actually in front of the newest, and it stays that way only if new stock always goes in behind — dating comes first because a shelf full of undated cases has no way to know which one is oldest at all.",
      outOfOrderNote: "Date it, then move the old stock forward, then place the new stock behind — the shelf can't be rotated correctly until today's delivery is actually dated.",
    },
    {
      id: "sanitizer-mix", kind: "turn", target: "sanitizer-dispenser",
      title: "Dial in the sanitizer dispenser",
      cue: "Turn the dispenser's selector to the sanitizer's labelled concentration.",
      why: "The dispenser is built to hit one specific concentration reliably, the same way the dilution station in the supply closet is — turning the selector to the label's own setting is what makes the test strip step that follows a confirmation instead of a guess.",
      turn: { turns: 0.5, label: "SANITIZER DIAL", readout: (t) => (t < 0.85 ? "adjusting" : "set") },
    },
    {
      id: "sanitizer-concentration-gauge", kind: "gauge", target: "test-strip-reader",
      title: "Test the sanitizer concentration",
      cue: "Dip the test strip and commit the reading against the label's required band.",
      why: "The dispenser's dial says where it's set, not what actually came out of it today — the test strip is the only proof the basin or the machine is actually sanitizing at the concentration the label calls for, checked fresh at the start of the shift.",
      gauge: { label: "SANITIZER PPM", speed: 0.6, green: [0.4, 0.62], readout: (t) => (t < 0.4 ? "too weak — add more" : t > 0.62 ? "too strong — dilute" : "at label strength"), missNote: "Off the label's band. Adjust the dispenser and test again before anything goes into the basin." },
    },
    {
      id: "dish-contact-time", kind: "hold", target: "dish-basket", seconds: 6,
      title: "Hold dishes through the sanitizer's contact time",
      cue: "Hold the basket submerged for the full contact time before pulling it out.",
      why: "A dish pulled early has been in the sanitizer without actually reaching the exposure time the label's concentration is built around — the basket stays down for the whole hold, not until it looks clean, because looking clean and being sanitized are two different things.",
      holdBreakNote: "The basket came out before contact time finished. A short dip at the right concentration still isn't the same as the full time the label calls for.",
    },
    {
      id: "feed-dish-rack", kind: "track", target: "dish-machine", seconds: 6,
      title: "Feed the dish machine at a steady rate",
      cue: "Keep the rack feed rate steady as the machine runs.",
      why: "A rack fed too fast doesn't give the machine's own wash-rinse-sanitize cycle time to finish on each load, and one fed too slow backs up everything behind it — a steady feed rate is what keeps every rack getting the full cycle it needs.",
      track: {
        start: 0.2, green: [0.38, 0.6], rise: 0.4, fall: 0.38, drift: 0.1, label: "FEED RATE",
        readout: (v) => (v < 0.38 ? "backing up behind" : v > 0.6 ? "outrunning the cycle" : "steady feed"),
      },
      holdBreakNote: "Feed rate out of band — too slow backs up the line, too fast outruns the machine's own cycle. Bring it back to steady.",
    },
    {
      id: "move-clean-rack", kind: "drag", target: "clean-rack",
      title: "Move the clean rack to storage",
      cue: "Carry the finished rack of clean dishes to the drying and storage shelf.",
      why: "A clean rack left sitting at the machine's outfeed is a clean rack at risk of getting splashed by the next dirty load coming through — moving it straight to storage keeps sanitized dishes sanitized until they're actually needed.",
      drag: { to: "storage-shelf-spot", radius: 0.5, missNote: "Not at the storage shelf yet. Carry the rack all the way clear of the machine's splash zone." },
    },
    {
      id: "log-receiving-and-sanitizer", kind: "select", target: "kitchen-log",
      title: "Log receiving temps and sanitizer readings",
      cue: "Record the delivery temperature, the rejected case and today's sanitizer concentration.",
      why: "The log is the kitchen's own proof, if a health inspector or the district ever asks, that the delivery was actually checked and the sanitizer actually tested today — a clean dish room with no record behind it can't answer that question.",
    },
    {
      id: "close-down-kitchen", kind: "sequence", anyOrder: false,
      targets: ["drains-covered", "chemicals-locked", "lights-off"],
      itemNames: { "drains-covered": "floor drains covered", "chemicals-locked": "chemicals locked away", "lights-off": "lights off" },
      title: "Close down the kitchen",
      cue: "Cover the floor drains, lock the chemicals away, then turn off the lights, in that order.",
      why: "Chemicals get locked away before the lights go off because that's the one closing task that keeps food and cleaning chemicals apart overnight — the drains and the lights matter, but a chemical cabinet left unlocked overnight is the one mistake that's still a problem when the doors open again tomorrow.",
      outOfOrderNote: "Drains, then chemicals locked, then the lights — the chemicals get secured before the room goes dark, not as an afterthought on the way out.",
    },
  ],

  interrupts: [
    {
      id: "plates-pulled-early",
      kind: "A server grabs plates before contact time finishes",
      after: "dish-contact-time", delay: 2, seconds: 10,
      alert: "A server has grabbed a stack of plates straight off the rack, before the sanitizer's contact time actually finished.",
      cue: "Ring the pass-through bell and call them back now.",
      target: "expo-bell",
      why: "Plates pulled before contact time are plates that were in the sanitizer without ever actually reaching the exposure the label's concentration depends on — the fix is calling the server back before they clear the pass-through, not letting them go and noting it for later.",
      missNote: "The plates left the dish room before contact time finished — sanitizer at the right concentration still needs its full time to work, and a shortened dip is the same as skipping it.",
      wrongNote: "The pass-through bell — ring it now, before the server carries those plates any further.",
    },
    {
      id: "machine-jam",
      kind: "The dish machine jams on a stack of trays",
      after: "feed-dish-rack", delay: 2, seconds: 9,
      alert: "A stack of trays has jammed sideways in the dish machine, and the belt is grinding against them.",
      cue: "Hit the emergency stop.",
      target: "machine-estop",
      why: "A jammed machine still under power is stressing both the belt and whatever's jammed against it — the emergency stop cuts power immediately, before anyone reaches in to clear the jam by hand while the belt is still trying to move.",
      missNote: "The belt kept grinding against the jam — a machine that stays powered while jammed is one more turn away from damaging the belt or catching a hand reaching in to clear it.",
      wrongNote: "The emergency stop — that cuts the belt before anyone reaches toward the jam.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, KR_ACCENT);

    // ------------------------------------------------------------- kitchen floor
    const floor = box(g, 6.4, 0.06, 5.4, 0, 0.03, 0, 0xffffff, { rough: 0.7 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 6, tile: 0xd8dcd6, grout: "#8f948e" })), { repeat: 5, px: 448, rough: 0.6, color: 0xdfe3dd });

    // ------------------------------------------------------------- receiving dock
    const dock = group(g, -2.6, 0, -1.8);
    box(dock, 1.6, 0.06, 1.4, 0, 0.03, 0, 0x9a8f7a, { rough: 0.8 });
    const manifestBoard = holoPanel(g, 0.6, 0.4, -2.9, 1.4, -2.6, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = KR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf7fb"; cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("DELIVERY MANIFEST", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfe0e8";
      cx.fillText("Frozen: 0°F or below", w / 2, h * 0.6);
    }, { ry: 0.6, accent: KR_ACCENT });
    reg(hits, manifestBoard, "manifest-board");

    const pallet = group(dock, 0, 0, 0);
    for (let i = 0; i < 4; i++) {
      const cx2 = (i % 2) * 0.5 - 0.25, cz2 = Math.floor(i / 2) * 0.5 - 0.25;
      box(pallet, 0.42, 0.34, 0.42, cx2, 0.2, cz2, 0xc9a86a, { rough: 0.7 });
    }
    const thermo = instrument(dock, 0.6, 0.5, 0, { idle: "-- °F", color: KR_ACCENT, w: 0.1, d: 0.14 });
    holoTag(thermo, "delivery thermometer", 0, 0.16, 0, { css: KR_CSS, w: 0.36 });
    reg(hits, thermo, "delivery-thermometer");
    const tornCase = box(dock, 0.4, 0.3, 0.4, -0.5, 0.18, 0.3, 0xc9a86a, { rough: 0.75 });
    const tornFlap = box(dock, 0.15, 0.02, 0.1, -0.55, 0.34, 0.5, 0xb08a55, { rough: 0.8 });
    void tornCase;
    holoTag(dock, "torn packaging", -0.5, 0.4, 0.3, { css: "#f0645b", w: 0.36 });
    reg(hits, tornFlap, "torn-packaging");
    const droppings = ball(dock, 0.015, -0.1, 0.35, 0.5, 0x2a221a, { rough: 0.9 });
    holoTag(dock, "pest droppings", -0.1, 0.45, 0.5, { css: "#f0645b", w: 0.36 });
    reg(hits, droppings, "pest-droppings");
    const swollenCan = cyl(dock, 0.045, 0.05, 0.13, 0.4, 0.27, 0.3, 0xc0c6cc, { rough: 0.4, metal: 0.5, seg: 14 });
    holoTag(dock, "swollen can", 0.4, 0.45, 0.3, { css: "#f0645b", w: 0.3 });
    reg(hits, swollenCan, "swollen-can");
    const shelfSwollenCan = cyl(g, 0.045, 0.05, 0.13, -0.2, 1.15, -2.6, 0xc0c6cc, { rough: 0.4, metal: 0.5, seg: 14 });
    holoTag(g, "swollen — shelve it anyway?", -0.2, 1.35, -2.6, { css: "#f0645b", w: 0.54 });
    reg(hits, shelfSwollenCan, "accept-damaged-can-without-check");
    const damagedCase = group(g, -3.0, 0, -1.3);
    box(damagedCase, 0.4, 0.3, 0.4, 0, 0.15, 0, 0xb08a55, { rough: 0.75 });
    holoTag(damagedCase, "damaged case — reject?", 0, 0.4, 0, { css: KR_CSS, w: 0.42 });
    reg(hits, damagedCase, "damaged-case");
    const returnPalletSpot = torus(g, 0.2, 0.012, -3.6, 0.06, -0.6, KR_ACCENT, { emissive: KR_ACCENT, ei: 1.3, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    returnPalletSpot.rotation.x = Math.PI / 2;
    reg(hits, returnPalletSpot, "return-pallet-spot");

    // Shelving for date-and-rotate.
    const shelf = group(g, -1.0, 0, -2.4);
    box(shelf, 1.6, 0.04, 0.4, 0, 1.0, 0, 0xb8bcc0, { rough: 0.4, metal: 0.6 });
    const oldStock = box(shelf, 0.3, 0.2, 0.3, -0.5, 1.12, 0.1, 0xc9a86a, { rough: 0.7 });
    reg(hits, oldStock, "oldest-moved-front");
    const dateLabel = decal(shelf, 0.14, 0.1, 0.5, 1.15, 0.22, paperFace("DATED", [], { bg: "#f4e9d8" }));
    dateLabel.visible = false;
    const newStockMarker = box(shelf, 0.3, 0.2, 0.3, 0.5, 1.12, -0.1, 0xd4b878, { rough: 0.7 });
    reg(hits, newStockMarker, "new-stock-placed-back");
    const dateSpot = box(shelf, 0.3, 0.2, 0.3, 0.5, 1.12, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, dateSpot, "date-label-applied");

    // Chemical shelf above food — hazard.
    const chemShelfAboveFood = group(g, 0.6, 0, -2.5);
    box(chemShelfAboveFood, 0.8, 0.03, 0.3, 0, 1.5, 0, 0xb8bcc0, { rough: 0.4, metal: 0.5 });
    cyl(chemShelfAboveFood, 0.05, 0.05, 0.18, -0.2, 1.62, 0, 0xf2c14b, { rough: 0.4, seg: 12 });
    box(chemShelfAboveFood, 0.6, 0.3, 0.3, 0, 0.6, 0, 0xc9a86a, { rough: 0.7 });
    holoTag(chemShelfAboveFood, "chemicals over open food", 0, 1.85, 0, { css: "#f0645b", w: 0.52 });
    reg(hits, chemShelfAboveFood, "mixed-chemical-storage-near-food");

    // ------------------------------------------------------------- dish room
    const sink = group(g, 1.8, 0, 1.0);
    const sinkMat = texturedMat(surfaceTexture((cx, w, h) => stainlessFace(cx, w, h)), { repeat: 2, px: 256, color: 0xc4cbd1, metal: 0.7, rough: 0.3 });
    const sinkBody = box(sink, 1.6, 0.9, 0.6, 0, 0.45, 0, 0xc4cbd1, { rough: 0.3, metal: 0.7 });
    sinkBody.material = sinkMat;
    const dispenser = group(sink, -0.6, 0.9, 0);
    box(dispenser, 0.16, 0.3, 0.12, 0, 0.15, 0, 0x2f6fd0, { rough: 0.5 });
    const dispenserDial = cyl(dispenser, 0.03, 0.03, 0.02, 0, 0.32, 0.06, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 12 });
    dispenserDial.rotation.x = Math.PI / 2;
    holoTag(dispenser, "sanitizer dispenser", 0, 0.5, 0, { css: KR_CSS, w: 0.4 });
    reg(hits, dispenserDial, "sanitizer-dispenser");
    const eyeballBottle = cyl(sink, 0.04, 0.045, 0.14, -0.55, 1.05, 0.2, 0xf2c14b, { rough: 0.4, opacity: 0.6, transparent: true, seg: 12 });
    holoTag(sink, "mixing sanitizer by eye?", -0.55, 1.25, 0.2, { css: "#f0645b", w: 0.5 });
    reg(hits, eyeballBottle, "sanitizer-bypass-eyeball");
    const testStrip = instrument(sink, 0.4, 1.0, 0.25, { idle: "-- ppm", color: KR_ACCENT, w: 0.11, d: 0.15 });
    holoTag(testStrip, "test strip reader", 0, 0.16, 0, { css: KR_CSS, w: 0.4 });
    reg(hits, testStrip, "test-strip-reader");
    const basket = group(sink, 0, 0.95, 0);
    box(basket, 0.5, 0.1, 0.4, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, opacity: 0.5, transparent: true });
    for (let i = 0; i < 4; i++) cyl(basket, 0.04, 0.045, 0.1, -0.18 + i * 0.12, 0.08, 0, 0xf2f4f6, { rough: 0.4, seg: 10 });
    holoTag(basket, "dish basket", 0, 0.3, 0, { css: KR_CSS, w: 0.3 });
    reg(hits, basket, "dish-basket");
    const bareHandSpot = ball(sink, 0.06, 0.5, 0.7, 0.2, 0xd9a985, { rough: 0.75 });
    holoTag(sink, "bare hand in the basin?", 0.5, 0.9, 0.2, { css: "#f0645b", w: 0.5 });
    reg(hits, bareHandSpot, "bare-hand-in-dish-water");
    const water = particles(sink, 30, 0xbfe0f2, { size: 0.011, life: 0.3, additive: false, opacity: 0.5 });
    void water;
    const expoBell = cyl(sink, 0.045, 0.05, 0.04, 0.75, 0.98, -0.05, 0xdfe4e8, { rough: 0.35, metal: 0.6, seg: 14 });
    holoTag(sink, "pass-through bell", 0.75, 1.12, -0.05, { css: KR_CSS, w: 0.36 });
    reg(hits, expoBell, "expo-bell");
    const earlyPlates = box(g, 0.3, 0.03, 0.3, 3.0, 1.05, -0.4, 0xf2f4f6, { rough: 0.4 });
    earlyPlates.visible = false;

    // Dish machine.
    const dishMachine = group(g, 3.0, 0, 1.6);
    box(dishMachine, 1.2, 1.1, 0.8, 0, 0.55, 0, 0xc4cbd1, { rough: 0.35, metal: 0.6 });
    const beltIn = box(dishMachine, 0.4, 0.05, 0.5, -0.9, 0.8, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    void beltIn;
    holoTag(dishMachine, "dish machine", 0, 1.25, 0, { css: KR_CSS, w: 0.3 });
    reg(hits, dishMachine, "dish-machine");
    const estop = cyl(dishMachine, 0.05, 0.05, 0.03, 0.5, 0.9, 0.42, 0xd2312b, { rough: 0.4, seg: 14 });
    holoTag(dishMachine, "emergency stop", 0.5, 1.1, 0.42, { css: KR_CSS, w: 0.3 });
    reg(hits, estop, "machine-estop");
    const jamTrays = box(dishMachine, 0.3, 0.02, 0.4, -0.3, 0.82, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4 });
    jamTrays.visible = false;

    const cleanRack = group(g, 3.6, 0, 0.9);
    box(cleanRack, 0.5, 0.1, 0.4, 0, 0.4, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(cleanRack, "clean rack", 0, 0.55, 0, { css: KR_CSS, w: 0.26 });
    reg(hits, cleanRack, "clean-rack");
    const storageShelfSpot = torus(g, 0.2, 0.012, 4.3, 0.44, 1.7, KR_ACCENT, { emissive: KR_ACCENT, ei: 1.3, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    reg(hits, storageShelfSpot, "storage-shelf-spot");

    // Logs and closing tasks.
    const kitchenLog = holoPanel(g, 0.46, 0.3, -2.9, 1.3, 1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = KR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf7fb"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("KITCHEN LOG", w / 2, h * 0.4);
    }, { ry: 0.6, accent: KR_ACCENT });
    reg(hits, kitchenLog, "kitchen-log");
    const drainCover = cyl(g, 0.16, 0.16, 0.02, 0.5, 0.02, 2.2, 0x3a3f44, { rough: 0.6, metal: 0.4, seg: 14 });
    reg(hits, drainCover, "drains-covered");
    const chemCabinet = group(g, -2.6, 0, 2.2);
    box(chemCabinet, 0.5, 0.7, 0.3, 0, 0.35, 0, 0xd8dde2, { rough: 0.5 });
    holoTag(chemCabinet, "chemical cabinet", 0, 0.8, 0, { css: KR_CSS, w: 0.36 });
    reg(hits, chemCabinet, "chemicals-locked");
    const lightSwitchObj = box(g, 0.04, 0.06, 0.02, -2.9, 1.3, 2.6, 0xdfe4e8, { rough: 0.5 });
    reg(hits, lightSwitchObj, "lights-off");

    // Crew: a kitchen manager checking in, clear of every control.
    const manager = standingFigure(g, 2.9, 2.4, { ry: -2.3, cloth: 0xdfe6ec, trousers: 0x2b3138 });
    holoTag(manager, "kitchen manager", 0, 1.95, 0, { css: KR_CSS, w: 0.34 });

    return {
      hits,
      footprint: 2.8,

      onStepComplete(step) {
        if (step.id === "probe-delivery-temp") repaint(thermo.userData.screen, signFace("-2 °F", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (step.id === "delivery-inspect") { tornFlap.visible = false; droppings.visible = false; swollenCan.material = mat(0x8a929a, { rough: 0.5 }); }
        if (step.id === "date-and-rotate") dateLabel.visible = true;
        if (step.id === "sanitizer-mix") repaint(testStrip.userData.screen, signFace("READY", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.5 }));
        if (step.id === "sanitizer-concentration-gauge") repaint(testStrip.userData.screen, signFace("200 ppm", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.5 }));
        if (step.id === "move-clean-rack") storageShelfSpot.visible = false;
      },

      onInterrupt(it) {
        if (it.id === "machine-jam") jamTrays.visible = true;
        if (it.id === "plates-pulled-early") earlyPlates.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "machine-jam") jamTrays.visible = false;
        if (it.id === "plates-pulled-early") { earlyPlates.position.set(0, 0.95, 0); earlyPlates.visible = false; }
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "probe-delivery-temp") repaint(thermo.userData.screen, signFace(`${Math.round(20 + gg.t * 40)} °F`, {
            bg: "#0d1c24", accent: gg.t > 0.3 && gg.t < 0.5 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
          if (session.step?.id === "sanitizer-concentration-gauge") repaint(testStrip.userData.screen, signFace(`${Math.round(gg.t * 400)} ppm`, {
            bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
        manager.userData.head.rotation.y = Math.sin(t * 0.35) * 0.3;
        void dt; void CITY;
      },
    };
  },
};
