import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, group, decal, repaint, signFace, paperFace,
  seatedFigure, standingPerson, mat, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ RBS Service Capstone VR — Culinary & Hospitality, the last
// station in the bartending series. One busy pass down the rail: five
// customers, five different right answers, and the pour itself still has to
// go out to spec while all of it is happening. Nothing here is a new rule —
// every one of the fifteen steps is something an earlier station in this
// series already taught on its own. What is new is doing all of it, in
// order, at the speed a real rail actually runs at.

const RBS_ACCENT = 0x4fb8c9;

export const SIM_RBS_SERVICE_CAPSTONE = {
  id: "rbs-service-capstone",
  index: "145",
  domain: "Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "The California ABC Responsible Beverage Service Training Program Act — Business and Professions Code §25658 (sale to a minor), §25602 (sale to an obviously intoxicated person) and §25631 (hours of sale); the California Retail Food Code (CalCode) for glassware and ice; the UNITE HERE Local 2 contract's service standards; the county Environmental Health department and the local police non-emergency line as the numbers behind the bar",
  name: "RBS Service Capstone",
  title: simTitle("RBS Service Capstone"),
  tagline: "One pass down the rail — an ID check, a cut-off, a carry-out refused, a round poured to spec, and a drink nobody should ever hand back",
  accent: RBS_ACCENT,
  accentCss: "#4fb8c9",
  parSeconds: 340,
  footprint: 2.3,
  badge: { id: "rail-certified", name: "Rail Certified", note: "Five customers down the rail, every call right, the round poured to spec and the count logged" },

  game: system({
    name: "Rail Standing",
    currency: "POUR",
    ranks: ["Barback", "Rail Trained", "Service Certified", "Shift Lead", "RBS Certified"],
    badges: [
      { id: "carded-clean", name: "Carded Clean", note: "The ID check answered without a correction", test: AWARD.stepClean("verify-id") },
      { id: "no-over-service", name: "No Over-Service", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "to-spec", name: "To Spec", note: "The jigger pour scored inside the top band", test: AWARD.precise(0.75) },
    ],
    challenges: [
      { id: "clean-rail", name: "Clean Rail", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "fast-rail", name: "Fast Rail", note: "The whole rail closed inside 80% of par", test: AWARD.fast(0.8) },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "serve-the-minor": "You poured alcohol for a patron whose own ID puts them under 21. Business and Professions Code §25658 makes furnishing alcohol to a minor a crime and a licence violation regardless of how confident, well-dressed or insistent they are — the ID's birthdate decides this, not your read of the room.",
    "pour-fourth-anyway": "You poured a fourth round for a patron already showing the signs of intoxication. §25602 makes it unlawful to sell or furnish alcohol to a person who is obviously intoxicated — the fourth pour does not wait for a fall or a slurred word to become the wrong call, the third round's own signs already were it.",
    "send-drink-out-the-door": "You sent a poured drink out the front door for someone who was never at the bar to be carded or read. An on-sale licence covers alcohol served to a patron you can actually see, and handing a drink off to someone waiting outside is exactly the gap §25658 and §25602 exist to close — you have no idea how old they are or how many they have already had elsewhere.",
    "reserve-the-unattended-drink": "You picked the unattended drink back up and served it to its owner. A drink that sat on the rail out of anyone's sight, even for a minute, is a drink you can no longer vouch for — pouring it out and starting over costs one drink; handing back a possibly tampered one risks a great deal more.",
  },

  lateNotes: {
    "draft-tap": "The order gets taken before the tap gets touched — you cannot pour what nobody has ordered yet.",
    "jigger": "The tequila gets measured after the tap pour is running clean, not before — one drink at a time down the rail.",
    "shaker": "The shake comes after the jigger is poured to the line — shaking an empty tin proves nothing.",
    "fresh-pour-5": "The old glass goes in the dump sink before a fresh one gets poured — pouring a replacement next to the original doesn't answer the hazard.",
  },

  steps: [
    {
      id: "card-the-rail", kind: "select", target: "patron-id-1",
      title: "Card the first seat before pouring anything",
      cue: "Ask for ID before this order goes any further.",
      why: "An RBS-trained bartender cards on the way to the first pour, not after a drink is already in front of someone — asking is free, and it is the only thing standing between a normal Tuesday and a citation under §25658.",
    },
    {
      id: "verify-id", kind: "find", noHint: true,
      targets: ["id-birthdate", "id-hologram"],
      itemNames: { "id-birthdate": "a birthdate that doesn't clear 21", "id-hologram": "a security hologram that doesn't sit right" },
      itemNotes: {
        "id-birthdate": "The math is the whole check — today's date against the birthdate on the card, not the photo, not the confidence of the person holding it.",
        "id-hologram": "A real state ID's security hologram shifts and layers under light in a specific way; a card where it doesn't is worth a second look before anything else about the ID is trusted.",
      },
      title: "Check the ID itself, not just the face on it",
      cue: "Two things about this ID are worth a second look before you decide.",
      why: "RBS training exists because a confident patron and a bad ID look exactly like a confident patron and a good one — the birthdate and the card's own security features are what the decision is actually built on, not how sure they sound asking.",
    },
    {
      id: "refuse-minor-soda", kind: "select", target: "pour-soda-1",
      title: "Refuse the pour and offer a soda instead",
      cue: "The birthdate doesn't clear 21 — pour the soda, not the drink they ordered.",
      why: "Once the ID says under 21, the only lawful pour for that seat is something without alcohol in it — §25658 does not carve out an exception for a patron who is polite about being refused, and a soda on the house costs a great deal less than what a citation does.",
    },
    {
      id: "cut-off-fourth", kind: "select", target: "refuse-fourth",
      title: "Cut off the fourth round at the next seat",
      cue: "Three drinks in and slower on the fourth order — decline it and offer water instead.",
      why: "§25602 puts the line at obviously intoxicated, not falling down — slowed speech, a flat hand steadying against the bar and a fourth order arriving is already past that line, and the lawful response is water and a straight answer, not a fourth pour.",
    },
    {
      id: "refuse-carryout", kind: "select", target: "refuse-takeout",
      title: "Decline the drink for the friend outside",
      cue: "The seat next to the door wants a drink carried out to someone waiting in the lot — decline it.",
      why: "A patron you have carded and can watch is the only person an on-sale licence covers — a drink carried out the door to somebody waiting outside is served to an age and a sobriety you cannot verify at all, which is exactly the gap RBS training is built to close.",
    },
    {
      id: "take-round-order", kind: "sequence",
      targets: ["order-lager", "order-cabernet", "order-margarita"],
      itemNames: { "order-lager": "a draft lager", "order-cabernet": "a glass of cabernet", "order-margarita": "a margarita" },
      title: "Take the round for the seat that's just fine",
      cue: "Ring in the three drinks in the order the table asked for them.",
      why: "A round taken in the order it was asked for is what keeps three drinks going out to three right people instead of a guess at the end — the easiest seat on the rail is still worth getting exactly right.",
      outOfOrderNote: "Ring the round in the order it was asked — a beer, a wine, a margarita, in that order, not whichever one comes to mind first.",
    },
    {
      id: "open-draft-tap", kind: "turn",
      title: "Open the draft tap for the lager",
      cue: "Turn the tap handle open a smooth quarter turn.",
      why: "A tap opened in one smooth motion pours a clean glass; one bumped open in stages pours mostly foam — the turn is the whole technique, not a formality before the real work starts.",
      target: "draft-tap",
      turn: { turns: 0.5, axis: "x", label: "DRAFT TAP" },
    },
    {
      id: "pour-the-draft", kind: "track", target: "tap-handle", seconds: 6,
      title: "Hold the pour steady down the glass wall",
      cue: "Keep the glass tilted against the flow and hold the fill inside the band as the foam settles.",
      why: "A lager poured straight down the middle is mostly head by the time it settles; held against the wall of a tilted glass at a steady rate, the same tap pours a full glass with a finger of foam on top — the technique is entirely in holding it steady.",
      track: { start: 0.15, green: [0.42, 0.62], rise: 0.5, fall: 0.4, drift: 0.08, label: "FILL LEVEL",
        readout: (v) => (v < 0.42 ? "too slow" : v > 0.62 ? "overflowing" : "good pour") },
      holdBreakNote: "The fill drifted out of band. Too slow and it's mostly foam, too fast and it's over the rim — bring it back into the band and hold it there.",
    },
    {
      id: "jigger-tequila", kind: "gauge", target: "jigger",
      title: "Measure the tequila to the line",
      cue: "Watch the pour climb the jigger and commit the instant it reaches the marked line.",
      why: "A margarita poured to spec is a jigger's worth of tequila, not a four-count free pour — the measured line is what keeps the drink the same glass to glass and keeps the bar's own pour cost where it is supposed to be.",
      gauge: { label: "TEQUILA oz", speed: 0.7, green: [0.36, 0.46], readout: (t) => `${(t * 2.5).toFixed(2)} oz`, missNote: "Off the line. Reset the jigger and commit only when the pour reaches the marked measure." },
    },
    {
      id: "shake-margarita", kind: "hold", target: "shaker", seconds: 4,
      title: "Shake the margarita over ice",
      cue: "Seal the tin and hold a hard shake for the full count.",
      why: "A margarita shaken hard for a full count chills, dilutes and aerates the drink all at once — a short shake leaves it warm and flat, which is a worse drink for the same three ingredients and the same jigger of tequila.",
      holdBreakNote: "You broke the seal early. An unfinished shake is a warm, undiluted drink — reseal the tin and shake it through the full count.",
    },
    {
      id: "pour-the-cabernet", kind: "select", target: "pour-wine",
      title: "Pour the cabernet to the standard line",
      cue: "Pour the glass of cabernet to the line etched on the glass.",
      why: "A wine pour to the etched line is the same five ounces every time, which is what makes the round's price and the bar's pour cost both mean something — eyeballing it drink to drink is how both start drifting without anyone deciding they should.",
    },
    {
      id: "spot-unattended", kind: "find", noHint: true,
      targets: ["unattended-glass", "stranger-hand"],
      itemNames: { "unattended-glass": "a drink left alone on the rail", "stranger-hand": "someone's hand lingering near a glass that isn't theirs" },
      itemNotes: {
        "unattended-glass": "A full drink sitting alone while its owner is away from the seat is exactly the drink you cannot vouch for a minute from now.",
        "stranger-hand": "A hand resting near a glass that belongs to somebody else, at a bar this busy, is worth noticing before it becomes the reason the glass can't be trusted.",
      },
      title: "Watch the rail, not just the ticket in front of you",
      cue: "Something at the far end of the rail needs a second look before that seat's owner comes back.",
      why: "Responsible service does not stop at the pour — a rail watched the whole length of the bar is what catches a drink that has gone unattended before its owner ever has to ask whether it is still safe to drink.",
    },
    {
      id: "dump-unattended", kind: "drag", target: "unattended-glass",
      title: "Dump the unattended drink",
      cue: "Carry the glass to the dump sink rather than setting it back down.",
      why: "Once a full drink has been out of its owner's sight, the only responsible move is pouring it out — there is no way to inspect a glass for what might have been added to it, so the house absorbs the cost of the pour instead of the patron absorbing the risk.",
      drag: { to: "dump-sink", radius: 0.4, missNote: "Not over the sink — carry it fully to the drain before letting go." },
    },
    {
      id: "fresh-pour-5", kind: "select", target: "fresh-pour-5",
      title: "Pour their replacement",
      cue: "Pour a fresh glass of the same drink once the old one is gone.",
      why: "A fresh pour, poured and handed over in view of the seat it belongs to, is what turns an uncomfortable moment into routine good service — the patron loses nothing but the wait, and never has to know how close the alternative came to their glass.",
    },
    {
      id: "close-round-log", kind: "select", target: "close-round-log",
      title: "Log the round and close it out",
      cue: "Enter tonight's pour count and close the round on the POS.",
      why: "A logged pour count is what the bar's own inventory control and the county's ABC records both run on — a round closed out honestly, drink for drink, is the last step of the same responsible-service habit that carded the first seat.",
    },
  ],

  interrupts: [
    {
      id: "slide-to-minor",
      kind: "Customer passing a drink to a minor",
      after: "pour-the-draft", delay: 3, seconds: 12,
      alert: "The fourth-drink customer just slid their glass three seats down to the kid you carded and refused twenty minutes ago.",
      cue: "Reclaim the glass. Do not restart the pour you're holding.",
      target: "reclaim-glass",
      why: "A refused sale does not end at your side of the bar if the glass can just be passed down the rail — reclaiming it in the moment is the only thing that actually keeps the minor from drinking it, and it is worth breaking off a pour for.",
      missNote: "The glass sat in front of the minor the whole time and nobody took it back. Carding someone means nothing if the same drink reaches them anyway, three seats and one slide later.",
      wrongNote: "Not the tap — the pour in your hands isn't the problem. Reclaim the glass that's now sitting in front of a minor.",
    },
    {
      id: "friend-at-door",
      kind: "Carry-out already in hand",
      after: "shake-margarita", delay: 2, seconds: 12,
      alert: "The friend from outside just walked up to the door with the carried-out drink already in hand, about to head back out with it.",
      cue: "Stop the hand-off at the door. Do not pour anything new.",
      target: "door-intercept",
      why: "The refusal upstream already answered whether that drink should exist — the only thing left to do is stop it from actually leaving the building, at the door, before it is out of your sight and anyone's control for good.",
      missNote: "The drink went out the door anyway. Refusing the pour at the bar means nothing if the glass leaves the building five minutes later regardless.",
      wrongNote: "Pouring another drink does not undo this one leaving. Stop the hand-off at the door — that is the only response that still matters here.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RBS_ACCENT);

    // ---------------------------------------------------------------- rail
    // Five seats along the bar top (room-built, z≈-2.4..-1.7), left to right:
    // the minor, the fourth-drink patron, the carry-out patron, the round,
    // and the unattended glass.
    const SEATS_X = [-4.0, -2.4, -0.8, 1.2, 3.2];
    for (const x of SEATS_X) {
      const stool = group(g, x, 0, -1.15);
      cyl(stool, 0.16, 0.16, 0.05, 0, 0.62, 0, 0x3c2c22, { rough: 0.6, seg: 14 });
      cyl(stool, 0.03, 0.03, 0.6, 0, 0.31, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
      cyl(stool, 0.17, 0.17, 0.03, 0, 0.02, 0, 0x2b3138, { rough: 0.5, seg: 14 });
    }

    // Seat 1 — the minor.
    const minor = seatedFigure(g, SEATS_X[0], 0.66, -1.05, { cloth: 0x6b7a5a, ry: Math.PI, skin: 0xd9b48f });
    const idCard = decal(g, 0.14, 0.09, SEATS_X[0] + 0.3, 1.15, -1.7,
      paperFace("ID CARD", ["DOB 03/14 — under 21", "Hologram: irregular"], { bg: "#e8e2d0", band: "#22303c" }), { px: 128 });
    reg(hits, idCard, "patron-id-1");
    const idBirth = decal(g, 0.09, 0.03, SEATS_X[0] + 0.26, 1.19, -1.69, signFace("DOB", { bg: "#2a1416", accent: "#f0645b", scale: 0.5 }), { px: 96 });
    reg(hits, idBirth, "id-birthdate");
    const idHolo = decal(g, 0.09, 0.03, SEATS_X[0] + 0.34, 1.19, -1.69, signFace("HOLO", { bg: "#2a1416", accent: "#f0645b", scale: 0.5 }), { px: 96 });
    reg(hits, idHolo, "id-hologram");
    const sodaGlass = group(g, SEATS_X[0], 1.12, -1.9);
    cyl(sodaGlass, 0.03, 0.025, 0.1, 0, 0.05, 0, 0xdfe9ea, { rough: 0.1, opacity: 0.3, transparent: true });
    reg(hits, sodaGlass, "pour-soda-1");
    const aleGlass = group(g, SEATS_X[0], 1.12, -1.75);
    const aleCup = cyl(aleGlass, 0.035, 0.03, 0.11, 0, 0.055, 0, 0xdfae4a, { rough: 0.1, opacity: 0.35, transparent: true });
    reg(hits, aleGlass, "serve-the-minor");
    void aleCup;

    // Seat 2 — the fourth-drink patron, glass and a tally already in front.
    const fourth = seatedFigure(g, SEATS_X[1], 0.66, -1.05, { cloth: 0x6b4a4a, ry: Math.PI, skin: 0xc7a17e });
    const tally = decal(g, 0.16, 0.1, SEATS_X[1] + 0.3, 1.15, -1.7, paperFace("TAB", ["Drink 1  Drink 2", "Drink 3  Drink 4?"], { bg: "#e8e2d0", band: "#22303c" }), { px: 128 });
    void tally;
    const refuseFourthSign = decal(g, 0.24, 0.14, SEATS_X[1], 1.35, -1.7, signFace("WATER INSTEAD?", { bg: "#22303c", accent: "#59c97b", scale: 0.4 }), { px: 160 });
    reg(hits, refuseFourthSign, "refuse-fourth");
    const fourthGlass = group(g, SEATS_X[1], 1.12, -1.85);
    cyl(fourthGlass, 0.03, 0.026, 0.11, 0, 0.055, 0, 0xd8a23b, { rough: 0.1, opacity: 0.4, transparent: true });
    const fourthPour = decal(g, 0.2, 0.12, SEATS_X[1], 1.45, -1.7, signFace("POUR #4?", { bg: "#2a1416", accent: "#f0645b", scale: 0.42 }), { px: 128 });
    reg(hits, fourthPour, "pour-fourth-anyway");

    // Seat 3 — the carry-out request, phone in hand toward the door.
    const carryout = seatedFigure(g, SEATS_X[2], 0.66, -1.05, { cloth: 0x4a5f6b, ry: Math.PI, skin: 0xc99878 });
    const refuseTakeoutSign = decal(g, 0.26, 0.14, SEATS_X[2], 1.35, -1.7, signFace("NOT WHILE THEY WAIT OUTSIDE", { bg: "#22303c", accent: "#59c97b", scale: 0.3 }), { px: 200 });
    reg(hits, refuseTakeoutSign, "refuse-takeout");
    const carryoutCup = group(g, SEATS_X[2], 1.12, -1.85, 0.3);
    box(carryoutCup, 0.05, 0.09, 0.05, 0, 0.045, 0, 0x2b3138, { rough: 0.5 });
    holoTag(carryoutCup, "To go?", 0, 0.13, 0, { css: "#f0645b", w: 0.24 });
    const sendOutSign = decal(g, 0.2, 0.12, SEATS_X[2], 1.5, -1.7, signFace("SEND IT OUT?", { bg: "#2a1416", accent: "#f0645b", scale: 0.4 }), { px: 128 });
    reg(hits, sendOutSign, "send-drink-out-the-door");

    // Seat 4 — the round, and the pour mechanics behind it.
    const roundGuest = seatedFigure(g, SEATS_X[3], 0.66, -1.05, { cloth: 0x5a6b4a, ry: Math.PI, skin: 0xb98868 });
    void roundGuest;
    const orderBoard = decal(g, 0.28, 0.16, SEATS_X[3], 1.35, -1.7, paperFace("ROUND", ["1 Lager  2 Cabernet  3 Margarita"], { bg: "#e8e2d0", band: "#22303c" }), { px: 200 });
    const ORDERS = [
      ["order-lager", -0.09], ["order-cabernet", 0], ["order-margarita", 0.09],
    ];
    for (const [id, dx] of ORDERS) {
      const tick = decal(orderBoard, 0.08, 0.08, dx, -0.01, 0.001, signFace("•", { bg: "#e8e2d0", accent: "#22303c", scale: 0.8 }), { px: 64 });
      reg(hits, tick, id);
    }

    // Draft tap, jigger and shaker behind the bar.
    const draftTower = group(g, 1.0, 1.12, -2.15);
    box(draftTower, 0.06, 0.35, 0.06, 0, 0.18, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    const tapHandle = box(draftTower, 0.03, 0.14, 0.05, 0, 0.42, 0.03, 0xd8232a, { rough: 0.4 });
    holoTag(draftTower, "Draft tap", 0, 0.55, 0, { css: "#4fb8c9", w: 0.26 });
    reg(hits, draftTower, "draft-tap");
    reg(hits, tapHandle, "tap-handle");
    const pourGlass = group(g, 1.0, 1.12, -1.95);
    const pourFill = cyl(pourGlass, 0.033, 0.028, 0.12, 0, 0.06, 0, 0xd8a23b, { rough: 0.15, opacity: 0.5, transparent: true });
    void pourFill;

    const jigger = instrument(g, 1.55, 1.12, -2.1, { idle: "0.00 oz", color: RBS_ACCENT, w: 0.1, d: 0.14 });
    holoTag(jigger, "Jigger", 0, 0.15, 0, { css: "#4fb8c9", w: 0.22 });
    reg(hits, jigger, "jigger");

    const shaker = group(g, 1.9, 1.12, -2.0);
    cyl(shaker, 0.045, 0.045, 0.16, 0, 0.08, 0, 0xdfe4e8, { rough: 0.25, metal: 0.75, seg: 16 });
    cyl(shaker, 0.045, 0.038, 0.06, 0, 0.19, 0, 0xdfe4e8, { rough: 0.25, metal: 0.75, seg: 16 });
    holoTag(shaker, "Shaker", 0, 0.28, 0, { css: "#4fb8c9", w: 0.24 });
    reg(hits, shaker, "shaker");

    const wineBottle = group(g, 2.3, 1.12, -2.1);
    lathe(wineBottle, [[0.001, 0], [0.05, 0.01], [0.05, 0.28], [0.032, 0.32], [0.016, 0.36], [0.016, 0.42], [0.001, 0.425]], 0, 0.02, 0, 0x2c5a3a, { rough: 0.3, metal: 0.05, seg: 14 });
    holoTag(wineBottle, "Cabernet", 0, 0.46, 0, { css: "#4fb8c9", w: 0.24 });
    const wineGlassStem = group(g, SEATS_X[3], 1.12, -1.8);
    cyl(wineGlassStem, 0.028, 0.024, 0.08, 0, 0.04, 0, 0xdfe9ea, { rough: 0.1, opacity: 0.3, transparent: true });
    reg(hits, wineGlassStem, "pour-wine");

    // Seat 5 — the unattended drink, empty stool, and a lingering hand.
    const unattendedGlass = group(g, SEATS_X[4], 1.12, -1.85);
    cyl(unattendedGlass, 0.03, 0.026, 0.11, 0, 0.055, 0, 0xd8a23b, { rough: 0.1, opacity: 0.4, transparent: true });
    holoTag(unattendedGlass, "Unattended", 0, 0.13, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, unattendedGlass, "unattended-glass");
    const strangerHand = ball(g, 0.035, SEATS_X[4] + 0.22, 1.14, -1.82, 0xc99878, { rough: 0.7 });
    reg(hits, strangerHand, "stranger-hand");
    const handBackSign = decal(g, 0.22, 0.12, SEATS_X[4], 1.35, -1.7, signFace("JUST HAND IT BACK?", { bg: "#2a1416", accent: "#f0645b", scale: 0.34 }), { px: 160 });
    reg(hits, handBackSign, "reserve-the-unattended-drink");
    const dumpSink = group(g, 3.2, 0, -3.5);
    box(dumpSink, 0.4, 0.12, 0.3, 0, 1.0, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    holoTag(dumpSink, "Dump sink", 0, 1.1, 0, { css: "#4fb8c9", w: 0.26 });
    hits["dump-sink"] = dumpSink;
    const freshGlass = group(g, 3.05, 1.12, -2.0);
    cyl(freshGlass, 0.03, 0.026, 0.11, 0, 0.055, 0, 0xd8a23b, { rough: 0.1, opacity: 0.15, transparent: true });
    reg(hits, freshGlass, "fresh-pour-5");
    const reclaimTray = group(g, 4.4, 1.12, -2.1);
    box(reclaimTray, 0.24, 0.02, 0.16, 0, 0.01, 0, 0x2b3138, { rough: 0.6 });
    holoTag(reclaimTray, "Reclaimed", 0, 0.08, 0, { css: "#f0645b", w: 0.28 });
    void reclaimTray;

    // ------------------------------------------------------------ the door
    const door = group(g, 0.5, 0, 4.3);
    box(door, 1.0, 2.1, 0.1, 0, 1.05, 0, 0x2a2b31, { rough: 0.6 });
    const doorSign = decal(door, 0.4, 0.16, 0, 1.9, 0.06, signFace("ENTRANCE", { bg: "#101820", accent: "#4fb8c9", scale: 0.5 }), { px: 200 });
    void doorSign;
    const friend = standingFigure(g, 0.5, 3.9, { ry: Math.PI, cloth: 0x4a5f6b, atStation: true, skin: 0xb98868 });
    friend.visible = false;
    const friendGlass = group(friend, 0.25, 0, -0.35);
    cyl(friendGlass, 0.03, 0.026, 0.11, 0, 1.0, 0, 0x2c5a3a, { rough: 0.15, opacity: 0.5, transparent: true });
    const intercept = group(g, 0.5, 0, 3.7);
    ball(intercept, 0.01, 0, 1.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(intercept, "Stop at the door", 0, 1.3, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, intercept, "door-intercept");
    const reclaimGlassCtl = group(g, SEATS_X[0], 1.4, -1.6);
    ball(reclaimGlassCtl, 0.01, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(reclaimGlassCtl, "Reclaim glass", 0, 0.1, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, reclaimGlassCtl, "reclaim-glass");

    // Closing paperwork: the POS and the pour-count log.
    const pos = instrument(g, 4.0, 1.12, -2.1, { idle: "TAB $--", color: RBS_ACCENT, ry: -0.5 });
    holoTag(pos, "POS", 0, 0.17, 0, { css: "#4fb8c9", w: 0.2 });
    const logPanel = holoPanel(g, 0.5, 0.36, 4.2, 1.75, -1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(6,20,24,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fb8c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("POUR COUNT", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillText("5 poured · 1 refused · 1 replaced", w / 2, h * 0.62);
      cx.fillText("Round closed", w / 2, h * 0.82);
    }, { ry: -0.6 });
    reg(hits, logPanel, "close-round-log");

    standingFigure(g, -4.9, 3.2, { ry: 0.6, cloth: 0x37505f, vest: RBS_ACCENT });

    let sliding = false, slideT = 0;
    let handingOff = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.3, -1.2),

      onStepComplete(step) {
        if (step.id === "refuse-minor-soda") { aleGlass.visible = false; sodaGlass.visible = true; }
        if (step.id === "open-draft-tap") { tapHandle.rotation.x = -0.7; }
        if (step.id === "pour-the-draft") { pourFill.scale.y = 3.2; pourFill.position.y = 0.18; }
        if (step.id === "jigger-tequila") repaint(jigger.userData.screen, signFace("1.50 oz", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.55 }));
        if (step.id === "pour-the-cabernet") {
          wineGlassStem.children[0].scale.y = 2.6;
          wineGlassStem.children[0].material = mat(0x8b1a2b, { rough: 0.15, opacity: 0.7 });
        }
        if (step.id === "dump-unattended") { unattendedGlass.position.set(3.2, 1.0, -3.5); unattendedGlass.visible = false; }
        if (step.id === "fresh-pour-5") { freshGlass.children[0].material = mat(0xd8a23b, { rough: 0.1, opacity: 0.7 }); }
        if (step.id === "close-round-log") repaint(pos.userData.screen, signFace("CLOSED", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.55 }));
      },

      onInterrupt(it) {
        if (it.id === "slide-to-minor") {
          sliding = true;
          slideT = 0;
          fourth.arms[0].shoulder.rotation.z = 0.7;
          fourthGlass.visible = true;
        }
        if (it.id === "friend-at-door") {
          handingOff = true;
          friend.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "slide-to-minor") {
          sliding = false;
          fourth.arms[0].shoulder.rotation.z = 0;
          fourthGlass.visible = false;
          fourthGlass.position.set(SEATS_X[1], 1.12, -1.85);
        }
        if (it.id === "friend-at-door") {
          handingOff = false;
          friend.visible = false;
        }
      },

      onHazard(hitId) {
        if (hitId === "reserve-the-unattended-drink") unattendedGlass.visible = true;
      },

      animate(t, dt) {
        if (sliding) {
          slideT = Math.min(1, slideT + dt / 2);
          fourthGlass.position.x = SEATS_X[1] + (SEATS_X[0] - SEATS_X[1]) * slideT;
        }
        if (handingOff) friendGlass.position.y = 1.0 + Math.sin(t * 3) * 0.01;
      },
    };
  },
};
