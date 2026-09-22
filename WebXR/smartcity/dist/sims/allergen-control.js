import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Allergen Control VR — Culinary & Hospitality, station 112.
//
// An allergen order on a working kitchen's hot line, generic rather than any
// one restaurant: the ticket's flag read and called back before anything is
// touched, the dedicated purple board and tools pulled away from the shared
// line, hands washed and gloves changed, the mise checked against the
// recipe's own allergen list, the dish built in a dedicated pan away from
// the shared fryer, and the finished plate marked and carried personally to
// the pass. Nine named allergens, one dish, and every point along the line
// where a shared tool or a missed flag turns a controllable order into an
// emergency.

const ALG_ACCENT = 0x8a5fd8;
const ALG_PURPLE = 0x6a3fb0;

export const SIM_ALLERGEN_CONTROL = {
  id: "allergen-control",
  index: "112",
  domain: "Culinary & Hospitality",
  trade: "UNITE HERE Local 2 line cook",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "FDA major food allergen labelling under FALCPA, with sesame added as the ninth allergen by the FASTER Act; the FDA Food Code as adopted in the California Retail Food Code; ServSafe Allergens training; Cal/OSHA general industry safety orders for the hot line itself; UNITE HERE Local 2, with AFSCME and SEIU food-service members running the same allergen protocol in school and hospital kitchens",
  name: "Allergen Control",
  title: simTitle("Allergen Control"),
  tagline: "An allergen order on the line: the ticket's flag called back, the purple board and dedicated tools pulled, hands washed and gloves changed, the mise checked against the recipe's allergen list, the dish built in the dedicated pan away from the shared fryer, and the plate marked and walked personally to the pass",
  accent: ALG_ACCENT,
  accentCss: "#8a5fd8",
  parSeconds: 260,
  footprint: 2.2,
  badge: { id: "flagged-and-walked", name: "Flagged and Walked", note: "An allergen order called back, built on dedicated tools with no shared contact, and walked to the pass by the cook who made it" },

  game: system({
    name: "Line Discipline",
    currency: "PICK",
    ranks: ["Prep Cook", "Line Cook", "Lead Line", "Sous Chef", "Allergen Certified"],
    badges: [
      { id: "called-back-first", name: "Called Back First", note: "The ticket's flag read and called back before the board ever comes off the rack, first time", test: AWARD.stepClean("callback") },
      { id: "never-shared", name: "Never Shared", note: "Never the shared board, never the shared fryer, never a plate walked by someone else", test: AWARD.safe },
      { id: "clean-mise", name: "Clean Mise", note: "The ingredient check caught what didn't belong", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-plate", name: "Clean Plate", note: "No corrections across the whole ticket", test: AWARD.clean },
      { id: "steady-cook", name: "Steady Cook", note: "Held the dedicated-pan cook without a break", test: AWARD.unbroken },
      { id: "ticket-fast", name: "Ticket Fired Fast", note: "Plate walked inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "shared-fryer": "That's the shared fryer basket — the same oil every other order on the line goes through today, tree nuts and shellfish breading included. Frying an allergen order's own ingredients in shared oil is a contact with every allergen that has gone through that oil this shift, full stop, no matter how clean the ingredients going in are.",
    "shared-board": "That's a shared cutting board off the line rack, not the dedicated purple one. Whatever the last thing cut on it was is now a residue on a board about to touch an allergen order — colour coding only works if the allergen order actually uses the board it's colour-coded for.",
    "skip-callback": "You're about to start cooking without ever calling the ticket back to the expediter. The callback is what catches a flag that got missed reading the ticket the first time — skip it and the only check left is whatever happens to be right the first time through.",
    "shared-garnish-bin": "That garnish bin is the shared one every station on the line dips into, and a shared spoon just went from a plate with tree nuts on it straight into this bin. An allergen order's own plate can be perfect and still pick up a contact from the garnish that goes on last.",
  },

  lateNotes: {
    "hidden-allergen-sauce": "The mise gets checked against the recipe's allergen list once the dedicated board and tools are already in hand — checking it before means checking it against nothing you're actually about to use.",
    "burner-dedicated": "The cook happens on the dedicated pan and burner only, after the move away from the shared line is already complete.",
    "allergen-pick": "The plate gets marked once the dish is actually finished cooking — marking it earlier is a label on a pan, not on the plate that leaves the kitchen.",
  },

  interrupts: [
    {
      id: "shared-spatula",
      kind: "Shared spatula reaching for the allergen pan",
      after: "cook-hold", delay: 3, seconds: 10,
      alert: "The cook next to you, moving fast, reaches for your dedicated pan with the spatula he's been using on the shared line all night.",
      cue: "Get your own dedicated utensil into that pan before his does.",
      target: "swap-utensil",
      why: "A shared spatula carries whatever it last touched into a pan that has been kept clean specifically so nothing from the rest of the line reaches it — the entire point of a dedicated pan collapses the instant a shared tool touches what's in it, and it takes about a second for that to happen if nobody's watching for it.",
      missNote: "The shared spatula went into the dedicated pan before anyone stopped it, and every ingredient the rest of the line has touched tonight is now a contact on this specific plate.",
      wrongNote: "Not that. Getting the dedicated utensil into the pan first is the only thing that keeps the shared spatula out of it.",
    },
    {
      id: "late-flag",
      kind: "A missed allergen flag surfaces after plating",
      after: "walk-plate", delay: 3, seconds: 10,
      alert: "The expediter calls back across the pass — table 12's dish, already plated and sitting under the heat lamp, has a walnut flag on its ticket that nobody caught until now.",
      cue: "Pull that plate before it leaves the pass.",
      target: "recall-plate",
      why: "A flag found after the plate is already sitting under the lamp is the exact failure the callback earlier in this ticket exists to prevent on every other order — the only thing left to do once it happens is stop that specific plate before a server picks it up, because there is no version of catching it at the table that ends well.",
      missNote: "The plate went out to table 12 with an allergen nobody flagged in time to stop it, which is the one outcome every step before this one was built to make impossible.",
      wrongNote: "Not that. Pulling that plate off the pass is the only response that stops it before it reaches the dining room.",
    },
  ],

  steps: [
    {
      id: "ticket-read", kind: "select", target: "ticket-rail",
      title: "Read the ticket's allergen flag",
      cue: "Check the ticket on the rail for the allergen icon before touching anything.",
      why: "The flag on the ticket is the only thing standing between an ordinary dish and one that has to be built completely differently — missing it here means every step after this one is being done for the wrong dish.",
    },
    {
      id: "callback", kind: "select", target: "expo-callback",
      title: "Call the order back to the expediter",
      cue: "Repeat the allergen and the table back to the expo before starting the dish.",
      why: "ServSafe's allergen training calls for a verbal read-back for exactly this order type, because a ticket read silently can be misread silently — saying it out loud and having the expo confirm it catches a wrong table, a wrong allergen or a wrong dish before a single pan gets pulled.",
    },
    {
      id: "purple-board", kind: "select", target: "purple-board",
      title: "Pull the dedicated purple board",
      cue: "Take the purple allergen board off the rack, not any of the coloured line boards.",
      why: "The purple board exists so an allergen order is visually distinct from across the kitchen, not just correctly prepared up close — anyone glancing at the line can see this board is doing different work, which is the whole point of colour coding under pressure.",
    },
    {
      id: "dedicated-tools", kind: "sequence", anyOrder: true,
      targets: ["dedicated-knife", "dedicated-pan"],
      itemNames: { "dedicated-knife": "dedicated knife", "dedicated-pan": "dedicated pan" },
      title: "Pull the dedicated knife and pan",
      cue: "Take the dedicated knife and pan kept separate from the shared line equipment.",
      why: "A knife or pan that has touched the allergen even once today carries it into whatever it touches next — the dedicated set is kept apart from the shared line specifically so this order never has to trust that a shared tool happens to be clean enough.",
    },
    {
      id: "handwash", kind: "hold", target: "hand-sink", seconds: 8,
      title: "Wash hands before touching the order",
      cue: "Wash hands fully before the allergen ingredients come out.",
      why: "Whatever the last thing your hands touched was is now on this dish unless it's washed off first — the handwash resets the one tool you can't swap out for a dedicated one.",
      holdBreakNote: "Cut the wash short. Hands go back under the water until the full wash is done.",
    },
    {
      id: "glove-change", kind: "select", target: "glove-box",
      title: "Change gloves",
      cue: "Pull a fresh pair of gloves after the handwash.",
      why: "Gloves worn on the rest of the line have touched whatever the rest of the line has touched — a fresh pair after the wash is the second half of the same reset, not a redundant one.",
    },
    {
      id: "ingredient-check", kind: "find", noHint: true,
      targets: ["hidden-allergen-sauce", "cross-contact-garnish"],
      itemNames: { "hidden-allergen-sauce": "sauce with sesame in the mise", "cross-contact-garnish": "garnish plated from the shared bin" },
      itemNotes: {
        "hidden-allergen-sauce": "That sauce bottle in the mise has sesame in its own ingredient list — sesame was added as the ninth major allergen under the FASTER Act, and a sauce nobody double-checked against this ticket's flag is exactly how a ninth allergen gets missed by a crew still thinking in eight.",
        "cross-contact-garnish": "That garnish came out of the shared bin instead of a portion set aside for this ticket — right ingredient, wrong path to the plate.",
      },
      title: "Check the mise against the recipe's allergen list",
      cue: "Compare every ingredient staged for this dish against the recipe's own allergen list before cooking starts.",
      why: "FALCPA's eight allergens plus sesame under the FASTER Act cover milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans and sesame — nine names a recipe's own allergen list has to be checked against ingredient by ingredient, because a sauce or a garnish can carry one of them without looking any different from the version that doesn't.",
    },
    {
      id: "cook-station", kind: "drag", target: "dedicated-pan",
      title: "Move to the dedicated station",
      cue: "Carry the dedicated pan to the clean station away from the shared line and the shared fryer.",
      why: "Standing at the shared line to cook a dedicated pan puts it back in splash and steam range of everything the rest of the line is doing — the dedicated station exists so distance, not just dedicated equipment, is doing part of the work.",
      drag: { to: "clean-station", radius: 0.42, missNote: "Not clear of the shared line. Move the pan all the way to the dedicated station before starting to cook." },
    },
    {
      id: "cook-hold", kind: "track", target: "burner-dedicated", seconds: 7,
      title: "Cook on the dedicated burner",
      cue: "Hold a steady cook on the dedicated pan and burner.",
      why: "The dedicated pan only protects the order for as long as it stays on the dedicated burner — set it down on a shared burner for even a minute and whatever that burner's grate has on it is now underneath this dish too.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.5, fall: 0.42, drift: 0.1, label: "DEDICATED COOK", readout: (v) => (v < 0.4 ? "too cool" : v > 0.6 ? "scorching" : "steady") },
      holdBreakNote: "Heat drifted out of band. Bring it back before the pan either undercooks or scorches.",
    },
    {
      id: "plate-mark", kind: "sequence",
      targets: ["allergen-pick", "plate"],
      itemNames: { "allergen-pick": "allergen marker placed", "plate": "dish plated" },
      title: "Mark the plate",
      cue: "Plate the dish, then set the allergen marker on it before it leaves the station.",
      why: "The marker is what tells the expediter and the server, at a glance, that this specific plate needs the care the ticket called for — a correctly built dish with no marker on it is indistinguishable from an ordinary one the moment it leaves your hands.",
      outOfOrderNote: "Plate the dish first, then set the marker — a marker on an empty spot on the pass means nothing.",
    },
    {
      id: "walk-plate", kind: "hold", target: "pass-walk", seconds: 5,
      title: "Walk the plate to the pass yourself",
      cue: "Carry the finished plate to the pass personally rather than handing it to someone else.",
      why: "Handing an allergen plate to somebody else to run is one more point where it can get set down next to the wrong dish or picked up by the wrong runner — the cook who built it walking it to the pass is the last checkpoint the ticket gets before a server ever touches it.",
      holdBreakNote: "Set the plate down before it reached the pass. Pick it back up and walk it the rest of the way yourself.",
    },
    {
      id: "reset", kind: "select", target: "sanitize-station",
      title: "Sanitise and return the dedicated tools",
      cue: "Clean the dedicated board, knife and pan and return them to allergen storage, separate from the line's own tools.",
      why: "The dedicated set only stays trustworthy for the next allergen ticket if it goes back to its own storage clean — left on the line rack even once, it's one more shared tool the next cook has no reason to think is any different.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, ALG_ACCENT);

    // ------------------------------------------------------------- floor patch
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a5a48", base2: "#6b4e3e", seam: "rgba(240,230,215,0.5)" }), { repeat: 5, px: 384 });
    const floor = box(g, 5.0, 0.1, 4.4, 0, 0.05, 0, 0x7a5a48, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.88, metal: 0.05, color: 0x7a5a48 });

    // ------------------------------------------------------------------- shared hot line
    const line = group(g, 1.6, 0.1, -1.4);
    box(line, 2.4, 0.85, 0.8, 0, 0.42, 0, 0x8a939b, { rough: 0.45, metal: 0.5 });
    const fryerGrp = group(line, -0.7, 0, -0.2, 0);
    box(fryerGrp, 0.5, 0.5, 0.3, 0, 0.65, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const fryerOil = slab(fryerGrp, 0.4, 0.03, 0.2, 0, 0.87, 0, 0xc9a24a, { rough: 0.2, opacity: 0.85, transparent: true, cast: false });
    const basket = cyl(fryerGrp, 0.16, 0.16, 0.24, 0.05, 0.95, 0, 0x8a939b, { rough: 0.4, metal: 0.6, seg: 12, open: true });
    holoTag(fryerGrp, "shared fryer", 0, 1.15, 0, { css: "#e8622a", w: 0.32 });
    reg(hits, basket, "shared-fryer");
    void fryerOil;
    const burnersGrp = group(line, 0.6, 0, -0.15, 0);
    for (const dx of [-0.35, 0.35]) { const ring = torus(burnersGrp, 0.14, 0.02, dx, 0.86, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 8, seg2: 16 }); ring.rotation.x = Math.PI / 2; }
    holoTag(burnersGrp, "shared burners", 0, 1.02, 0, { css: "#8a5fd8", w: 0.36 });
    const sharedBoardGrp = group(line, 0.0, 0, 0.25, 0);
    const boardColors = [["red", 0xc0392b], ["green", 0x27904e], ["blue", 0x2d6fb5]];
    for (let i = 0; i < boardColors.length; i++) {
      box(sharedBoardGrp, 0.28, 0.02, 0.4, -0.3 + i * 0.3, 0.87, 0, boardColors[i][1], { rough: 0.6 });
    }
    const sharedBoard = box(sharedBoardGrp, 0.28, 0.02, 0.4, -0.3, 0.87, 0, 0xc0392b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sharedBoard, "shared-board");

    // ------------------------------------------------------------------- ticket rail + expo
    const railGrp = group(g, 1.6, 0.1, -1.95, 0);
    box(railGrp, 1.6, 0.03, 0.03, 0, 0.9, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    for (const [sx] of [[-0.6], [0], [0.6]]) cyl(railGrp, 0.012, 0.012, 0.3, sx, 0.9, 0, 0x8a939b, { rough: 0.4, metal: 0.6, seg: 8 });
    const ticketSheet = decal(railGrp, 0.24, 0.32, -0.6, 0.72, 0.02, paperFace("TICKET — TABLE 6", ["1x SPAGHETTI ALFREDO", "ALLERGEN: TREE NUT", "fire on call"], { scale: 0.75 }));
    reg(hits, ticketSheet, "ticket-rail");
    holoTag(railGrp, "ticket rail", 0, 1.1, 0, { css: "#8a5fd8", w: 0.28 });
    const expoBell = cyl(railGrp, 0.05, 0.05, 0.04, 0.9, 0.85, 0.1, 0xd8232a, { rough: 0.4, metal: 0.6, seg: 14 });
    holoTag(expoBell, "call it back", 0, 0.14, 0, { css: "#8a5fd8", w: 0.3 });
    reg(hits, expoBell, "expo-callback");
    const skipHazard = box(railGrp, 0.4, 0.3, 0.3, -0.9, 1.1, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(railGrp, "just start cooking?", -0.9, 1.35, -0.1, { css: "#e8622a", w: 0.4 });
    reg(hits, skipHazard, "skip-callback");

    // ------------------------------------------------------------------- allergen storage
    const storageGrp = group(g, -1.9, 0.1, -1.4, 0.4);
    box(storageGrp, 0.14, 1.4, 0.7, 0, 0.7, 0, 0x53606b, { rough: 0.55, metal: 0.4 }); // shelving spine
    for (const y of [0.4, 0.85, 1.25]) box(storageGrp, 0.12, 0.02, 0.6, 0, y, 0, 0x6d757b, { rough: 0.55, metal: 0.4 });
    const purpleBoard = box(storageGrp, 0.28, 0.02, 0.4, 0.16, 0.86, 0, ALG_PURPLE, { rough: 0.55 });
    holoTag(storageGrp, "purple allergen board", 0.16, 1.02, 0, { css: "#8a5fd8", w: 0.4 });
    reg(hits, purpleBoard, "purple-board");
    const dedicatedKnife = box(storageGrp, 0.02, 0.02, 0.32, 0.16, 1.27, 0.1, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    reg(hits, dedicatedKnife, "dedicated-knife");
    const dedicatedPanGrp = group(storageGrp, 0.16, 0.42, 0.1);
    cyl(dedicatedPanGrp, 0.14, 0.15, 0.08, 0, 0, 0, ALG_PURPLE, { rough: 0.4, metal: 0.6, seg: 16 });
    holoTag(dedicatedPanGrp, "dedicated pan", 0, 0.2, 0, { css: "#8a5fd8", w: 0.32 });
    reg(hits, dedicatedPanGrp, "dedicated-pan");

    // ------------------------------------------------------------------- handwash + gloves
    const sinkGrp = group(g, -1.4, 0.1, -0.5, 0.2);
    box(sinkGrp, 0.5, 0.75, 0.4, 0, 0.375, 0, 0x9aa2a8, { rough: 0.45, metal: 0.4 });
    const basin = box(sinkGrp, 0.36, 0.1, 0.28, 0, 0.72, 0, 0x7b8288, { rough: 0.4, metal: 0.5 });
    const faucet = cyl(sinkGrp, 0.014, 0.014, 0.2, 0, 0.85, -0.1, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8 });
    void faucet;
    reg(hits, basin, "hand-sink");
    holoTag(sinkGrp, "hand sink", 0, 1.0, 0, { css: "#8a5fd8", w: 0.28 });
    const gloveBoxGrp = group(sinkGrp, 0.4, 0, 0);
    box(gloveBoxGrp, 0.2, 0.14, 0.12, 0, 0.8, 0, 0xdfe4e8, { rough: 0.6 });
    holoTag(gloveBoxGrp, "fresh gloves", 0, 0.96, 0, { css: "#8a5fd8", w: 0.3 });
    reg(hits, gloveBoxGrp, "glove-box");
    const handSpray = particles(sinkGrp, 16, 0xbfe4ff, { size: 0.012, life: 0.3, additive: false, opacity: 0.5 });
    handSpray.position.set(0, 0.78, -0.08);

    // ------------------------------------------------------------------- dedicated station
    const cleanStation = group(g, 0.2, 0.1, 1.2, 0.1);
    box(cleanStation, 1.0, 0.85, 0.7, 0, 0.42, 0, 0xdfe6d8, { rough: 0.45, metal: 0.3 });
    const dedicatedBurner = torus(cleanStation, 0.14, 0.02, 0, 0.86, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 8, seg2: 16 });
    dedicatedBurner.rotation.x = Math.PI / 2;
    reg(hits, dedicatedBurner, "burner-dedicated");
    holoTag(cleanStation, "dedicated station", 0, 1.05, 0, { css: "#8a5fd8", w: 0.36 });
    const cleanSlot = box(cleanStation, 0.4, 0.02, 0.3, 0, 0.87, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["clean-station"] = cleanSlot;
    const cookFlame = particles(cleanStation, 20, 0xf2c14b, { size: 0.02, life: 0.3, additive: true, opacity: 0.6 });
    cookFlame.position.set(0, 0.9, 0);

    // Mise en place tray with the hidden allergen sauce and cross-contact garnish.
    const miseGrp = group(g, -0.5, 0.1, 1.5, -0.2);
    box(miseGrp, 0.8, 0.06, 0.5, 0, 0.4, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    for (const [dx, color] of [[-0.28, 0x8a5fd8], [0.0, 0xd8232a], [0.28, 0x4fb8c9]]) cyl(miseGrp, 0.06, 0.06, 0.08, dx, 0.46, -0.1, color, { rough: 0.4, seg: 12 });
    const sauceBottle = cyl(miseGrp, 0.03, 0.035, 0.14, -0.28, 0.5, 0.15, 0xc9a24a, { rough: 0.3, metal: 0.1, seg: 10 });
    decal(sauceBottle, 0.05, 0.06, 0, 0.02, 0.036, signFace("SESAME", { bg: "#241a08", accent: "#f2c14b", scale: 0.55 }));
    holoTag(sauceBottle, "sauce — check label", 0, 0.14, 0, { css: "#e8622a", w: 0.36 });
    reg(hits, sauceBottle, "hidden-allergen-sauce");
    const garnishBinGrp = group(g, -0.5, 0.1, 1.9, -0.2);
    box(garnishBinGrp, 0.24, 0.1, 0.24, 0, 0.45, 0, 0x2f7d4a, { rough: 0.6 });
    holoTag(garnishBinGrp, "shared garnish bin", 0, 0.6, 0, { css: "#e8622a", w: 0.36 });
    reg(hits, garnishBinGrp, "shared-garnish-bin");
    const spoonHazard = box(garnishBinGrp, 0.1, 0.02, 0.02, 0.1, 0.52, 0, 0xdfe4e8, { rough: 0.4, metal: 0.6 });
    reg(hits, spoonHazard, "cross-contact-garnish");

    // ------------------------------------------------------------------- pass + plate
    const passGrp = group(g, 0.6, 0.1, 2.0, 0);
    box(passGrp, 1.6, 0.85, 0.4, 0, 0.42, 0, 0xb8c1c9, { rough: 0.5, metal: 0.35 });
    const heatLamp = cyl(passGrp, 0.03, 0.03, 0.4, 0.5, 1.1, 0, 0xf2c14b, { rough: 0.4, emissive: 0xf2c14b, ei: 0.6, seg: 8 });
    void heatLamp;
    const plateGrp = group(passGrp, -0.3, 0, 0, 0.1);
    const plate = cyl(plateGrp, 0.16, 0.16, 0.02, 0, 0.86, 0, 0xf4f0e2, { rough: 0.3, seg: 20 });
    reg(hits, plate, "plate");
    const marker = cyl(plateGrp, 0.02, 0.02, 0.1, 0.12, 0.9, 0, ALG_PURPLE, { rough: 0.5, seg: 10 });
    marker.visible = false;
    reg(hits, marker, "allergen-pick");
    holoTag(passGrp, "the pass", 0, 1.05, 0, { css: "#8a5fd8", w: 0.24 });
    const passWalkHit = box(g, 0.6, 0.5, 0.6, 0.4, 0.5, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["pass-walk"] = passWalkHit;
    const recallHit = box(passGrp, 0.4, 0.3, 0.3, 0.5, 1.0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, recallHit, "recall-plate");
    const swapUtensilGrp = group(cleanStation, 0.3, 0.9, 0.2);
    box(swapUtensilGrp, 0.03, 0.02, 0.22, 0, 0, 0, ALG_PURPLE, { rough: 0.5 });
    holoTag(swapUtensilGrp, "dedicated spatula", 0, 0.1, 0, { css: "#8a5fd8", w: 0.32 });
    reg(hits, swapUtensilGrp, "swap-utensil");

    const sanitizeGrp = group(g, -1.9, 0.1, -0.6, 0.4);
    box(sanitizeGrp, 0.4, 0.06, 0.3, 0, 0.44, 0, 0x2b6fd8, { rough: 0.5, opacity: 0.5, transparent: true, cast: false });
    holoTag(sanitizeGrp, "sanitise station", 0, 0.6, 0, { css: "#8a5fd8", w: 0.36 });
    reg(hits, sanitizeGrp, "sanitize-station");

    const chest = toolChest(g, 2.1, 1.7, { ry: -0.6, color: 0x2b3138 });
    void chest;

    // Extra prep shelving behind the storage rack — the rest of the kitchen
    // this dedicated set has to stay visibly apart from.
    const shareShelfGrp = group(g, -1.9, 0.1, 0.6, 0.3);
    box(shareShelfGrp, 0.12, 1.3, 0.6, 0, 0.65, 0, 0x53606b, { rough: 0.55, metal: 0.4 });
    for (const y of [0.35, 0.75, 1.15]) box(shareShelfGrp, 0.1, 0.02, 0.55, 0, y, 0, 0x6d757b, { rough: 0.55, metal: 0.4 });
    for (const [dy, color] of [[0.42, 0xd8232a], [0.82, 0x27904e], [1.22, 0x2d6fb5]]) box(shareShelfGrp, 0.16, 0.02, 0.4, 0.08, dy, 0, color, { rough: 0.6 });
    holoTag(shareShelfGrp, "shared line boards", 0, 1.45, 0, { css: "#8a5fd8", w: 0.42 });

    // A towel dispenser and a menu board over the pass, for a little more of
    // the kitchen the ticket actually moves through.
    const towelGrp = group(g, -1.1, 0.1, -0.7, 0.2);
    box(towelGrp, 0.14, 0.3, 0.1, 0, 1.0, 0, 0xdfe4e8, { rough: 0.5, metal: 0.3 });
    cyl(towelGrp, 0.04, 0.04, 0.24, 0, 0.85, 0.06, 0xf4f0e2, { rough: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(towelGrp, "paper towel", 0, 1.2, 0, { css: "#8a5fd8", w: 0.3 });
    const menuBoard = decal(g, 0.5, 0.22, 0.9, 1.7, -1.98, signFace("HOT LINE — TICKETS FIRE ON CALL", { bg: "#150c22", accent: "#8a5fd8", scale: 0.4 }));
    void menuBoard;

    // A small spice rack by the dedicated station and a second ticket
    // waiting on the rail, so the line reads as a working kitchen rather
    // than a single order frozen in time.
    const spiceRackGrp = group(cleanStation, -0.4, 0.9, -0.2);
    box(spiceRackGrp, 0.02, 0.16, 0.3, 0, 0, 0, 0x53606b, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 4; i++) cyl(spiceRackGrp, 0.018, 0.018, 0.09, 0, 0.09, -0.1 + i * 0.07, 0x8a5fd8, { rough: 0.6, seg: 8 });
    holoTag(spiceRackGrp, "dedicated spices", 0, 0.24, 0, { css: "#8a5fd8", w: 0.36 });
    decal(railGrp, 0.22, 0.3, 0.6, 0.72, 0.02, paperFace("TICKET — TABLE 9", ["2x GRILLED SALMON", "no flags"], { scale: 0.75 }));
    const extinguisherGrp = group(g, -1.9, 0.1, -1.9, 0.15);
    cyl(extinguisherGrp, 0.06, 0.07, 0.32, 0, 0.9, 0, 0xd8232a, { rough: 0.5, metal: 0.3, seg: 12 });
    box(extinguisherGrp, 0.1, 0.02, 0.02, 0, 1.08, 0.03, 0x2b2f34, { rough: 0.5 });
    holoTag(extinguisherGrp, "fire extinguisher", 0, 1.15, 0, { css: "#8a5fd8", w: 0.32 });
    const clockGrp = group(g, 1.2, 0.1, -1.98, 0);
    cyl(clockGrp, 0.14, 0.14, 0.03, 0, 2.1, 0, 0xdfe4e8, { rough: 0.4, seg: 20 });
    box(clockGrp, 0.01, 0.1, 0.01, 0, 2.13, 0.02, 0x1b1e22, { rough: 0.5 });
    holoTag(clockGrp, "line clock", 0, 2.3, 0, { css: "#8a5fd8", w: 0.28 });
    const plan = holoPanel(g, 0.8, 0.55, -2.0, 1.6, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "#150c22"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#8a5fd8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ece5f8"; ctx.fillText("NINE MAJOR ALLERGENS", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#ece5f8";
      ["Milk · Eggs · Fish · Shellfish", "Tree nuts · Peanuts · Wheat", "Soybeans · Sesame (FASTER Act)"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: 0.3, accent: ALG_ACCENT });
    reg(hits, plan, "allergen-board-plan");
    void plan;

    const cook1 = standingFigure(g, 0.2, 0.55, { ry: 0.2, cloth: 0x2b7a5a });
    holoTag(cook1, "line cook — allergen order", 0, 1.9, 0, { css: "#8a5fd8", w: 0.5 });
    const cook2 = standingFigure(g, 1.9, -0.5, { ry: -1.6, cloth: 0x37505f });
    void cook2;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.1, 0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "purple-board") sharedBoardGrp.visible = true;
        if (step.id === "cook-station") { dedicatedPanGrp.visible = false; }
        if (step.id === "ingredient-check") { sauceBottle.material = mat(0x59c97b, { rough: 0.4 }); spoonHazard.material = mat(0x59c97b, { rough: 0.4, metal: 0.6 }); }
        if (step.id === "plate-mark") marker.visible = true;
      },
      onInterrupt(it) {
        if (it.id === "shared-spatula") swapUtensilGrp.position.x = 0.05;
        if (it.id === "late-flag") { marker.material = mat(0xe8622a, { rough: 0.5, emissive: 0xe8622a, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "shared-spatula") swapUtensilGrp.position.x = 0.3;
        if (it.id === "late-flag") marker.material = mat(ALG_PURPLE, { rough: 0.5 });
      },
      onHazard() {},
      animate(t, dt, session) {
        handSpray.visible = session?.step?.id === "handwash" && session.holding;
        if (handSpray.visible) handSpray.userData.step(dt, new THREE.Vector3(0, 0.78, -0.08), 0.03, 0.4, -0.8);
        cookFlame.visible = session?.step?.id === "cook-hold" && session.holding;
        if (cookFlame.visible) cookFlame.userData.step(dt, new THREE.Vector3(0, 0.9, 0), 0.04, 0.3, 1.4);
        const step = session?.step;
        if (step?.id === "cook-hold" && session.track) {
          const v = session.track.v;
          dedicatedBurner.material.emissive = new THREE.Color(v >= 0.4 && v <= 0.6 ? 0x59c97b : 0xe8622a);
          dedicatedBurner.material.emissiveIntensity = 0.6;
        }
        void t;
      },
    };
  },
};
