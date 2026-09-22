import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Laundry Plant Chemicals VR — Culinary & Hospitality, hotel
// housekeeping series, station 195.
//
// The hotel's own laundry plant, back of house from the rooms it launders
// for: the dosing system's SDS and injector lines checked before a drum is
// loaded, the washer-extractor loaded to the scale rather than by eye, the
// dryer's lint screen and the fire risk behind it, the flatwork ironer's
// finger guard and its emergency pull-cord, soiled linen sorted under the
// bloodborne pathogens rule, the heat and hydration the floor itself
// demands, and a folding station worked at a pace instead of a rush.
// Generic plant, not a real property — only the standard, the union
// contract and the code are named with a number.

const LPC_ACCENT = 0x7fb3c9;

export const SIM_LAUNDRY_PLANT_CHEMICALS = {
  id: "laundry-plant-chemicals",
  index: "195",
  domain: "Culinary & Hospitality",
  trade: "Hotel laundry attendant — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "hotel",
  certification: "OSHA's hazard communication standard, 29 CFR 1910.1200, and the SDS for every chemical the dosing system injects; OSHA's bloodborne pathogens standard, 29 CFR 1910.1030, for linen sorted off the soiled table; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR 3203, and the heat-related hazard assessment a washer, a dryer and an ironer all running together put on this floor; the IWC's Wage Order 5, the Public Housekeeping Industry order, on rest breaks in a hot workroom; UNITE HERE's hotel laundry contract language on machine loads and the folding station; NFPA 96 fire protection wherever this laundry plant shares ductwork with the hotel's kitchen block.",
  name: "Laundry Plant Chemicals",
  title: simTitle("Laundry Plant Chemicals"),
  tagline: "The hotel laundry plant: dosing lines checked against the SDS, the washer loaded to the scale, the ironer's guard and pull-cord proven, soiled linen sorted under the bloodborne rule, and the floor's own heat kept in check",
  accent: LPC_ACCENT,
  accentCss: "#7fb3c9",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "clean-plant", name: "Clean Plant", note: "Lines checked, the washer loaded to weight, the ironer's guard proven, and nothing sorted bare-handed" },

  game: system({
    name: "Laundry Floor",
    currency: "LOADS",
    ranks: ["Sorter", "Machine Operator", "Lead Operator", "Floor Trainer", "Laundry Plant Certified"],
    badges: [
      { id: "lines-first", name: "Lines First", note: "Dosing lines checked before the first drum was loaded", test: AWARD.stepClean("injector-lines") },
      { id: "never-bare", name: "Never Bare-Handed", note: "Never a chemical, a sharp or soiled linen touched without the right glove", test: AWARD.safe },
      { id: "guard-proven", name: "Guard Proven", note: "The ironer's finger guard tested and held clean", test: AWARD.stepClean("finger-guard-test") },
    ],
    challenges: [
      { id: "clean-floor", name: "Clean Floor", note: "No corrections across the whole shift", test: AWARD.clean },
      { id: "steady-pace", name: "Steady Pace", note: "Held the folding pace without breaking it", test: AWARD.unbroken },
      { id: "loads-fast", name: "Loads Ready Fast", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "chem-mix-drums": "The chlorine-based bleach drum and the acid-based sour drum are standing capped together with both draw lines loose against each other. Their SDS sheets say the same thing this plant's dosing system exists to prevent — mixed directly rather than metered separately through the injector, chlorine bleach and an acid sour give off chlorine gas on a laundry floor with people standing right next to it.",
    "overloaded-washer": "That drum is stuffed well past the load line printed on the door — linen packed in by eye instead of against the scale. An unbalanced overload throws the shell off-centre at speed, and what fails first is usually the bearing or the drive belt, on a machine that costs the plant days, not the one load that was in a hurry.",
    "lint-clogged-duct": "The dryer's exhaust duct past the screen is packed solid with lint nobody has pulled in a long time. The screen catches what's easy to see; the fire risk NFPA fire codes are written around lives in the duct behind it, where a spark from a worn bearing has fuel with nowhere to go but back through the machine.",
    "bare-hand-soiled": "You reached into the soiled sort bin bare-handed. OSHA's bloodborne pathogens standard treats every piece of linen on this table as though it could be contaminated, because there is no way to tell by looking — the sorting gloves staged at the table exist so a torn sheet with something sharp folded into it meets a glove first, not a hand.",
  },

  lateNotes: {
    "load-scale": "Not yet — the scale is read once the drum is actually loaded, not before, or the number means nothing.",
    "finger-guard": "The guard is tested on its own step, held through to the rollers actually stopping, not brushed on the way past.",
  },

  steps: [
    {
      id: "sds-read", kind: "select", target: "sds-binder",
      title: "Read the SDS for the dosing chemicals",
      cue: "Open the binder and check the bleach and sour sheets before the shift starts.",
      why: "The safety data sheet is where the incompatibility between this plant's own chemicals actually lives — OSHA's hazard communication standard puts it on the shelf specifically so nobody on the floor has to guess which drums can share a corner of the room and which ones cannot.",
    },
    {
      id: "injector-lines", kind: "find", noHint: true,
      targets: ["crossed-injector-line", "cracked-injector-line"],
      itemNames: { "crossed-injector-line": "bleach line into the sour inlet", "cracked-injector-line": "cracked suction line on the sour draw" },
      itemNotes: {
        "crossed-injector-line": "This line is drawing bleach into what should be the sour inlet. Crossed like this, the dosing system meters chlorine everywhere the formula expects acid sour, and doses acid sour into the bleach cycle — the two chemicals never touch directly, but the wash comes out ruined and the drums empty at the wrong rate either way.",
        "cracked-injector-line": "This suction line has split just above the drum cap, pulling air on every stroke. It reads as chemical flowing on the dosing panel's own gauge while the wash itself comes out under-treated, load after load, until somebody actually traces the line.",
      },
      title: "Check the dosing system's injector lines",
      cue: "Trace both draw lines from their drums to the injector panel before trusting either one.",
      why: "The injector panel is the one place on this floor where the plant's chemicals are still full strength and where two lines running side by side are simple to cross by mistake — a line checked here is the difference between the dosing system actually working and a panel confidently metering the wrong drum into every load for a whole shift.",
    },
    {
      id: "load-weight", kind: "gauge", target: "load-scale",
      title: "Load the washer-extractor to the scale",
      cue: "Watch the load-weight scale climb as the linen goes in and commit once it holds in the machine's rated band.",
      why: "A washer-extractor's rated capacity is a real number on the door for a real reason — packed in by eye, an overloaded drum runs unbalanced at extraction speed, and a machine that fails at speed fails toward whoever is standing closest to it, not just toward the linen inside it.",
      gauge: { label: "LOAD WEIGHT", speed: 0.6, green: [0.42, 0.64], readout: (t) => `${Math.round(t * 400)} lb`, missNote: "Over the rated line or under a worthwhile load — bring it back into the machine's own weight band before closing the door." },
    },
    {
      id: "washer-load", kind: "sequence",
      targets: ["load-linens", "close-door", "select-cycle"],
      itemNames: { "load-linens": "linen into the drum", "close-door": "door closed and locked", "select-cycle": "wash cycle selected" },
      title: "Load, lock and select the cycle",
      cue: "Load the linen, close and lock the door, then select the wash cycle — in that order.",
      why: "The door interlock is what keeps this drum from being selected into a spin cycle while it's still open, and the order exists precisely so that sequence can't be skipped — a cycle selected before the door locks is a cycle the machine's own safety interlock is supposed to refuse, not something a rushed operator should be finding a way around.",
      outOfOrderNote: "Linen in, door locked, then the cycle — in that order. Selecting a cycle before the door is locked is exactly the interlock this sequence exists to respect.",
    },
    {
      id: "dosing-dial", kind: "turn", target: "dosing-selector",
      title: "Set the dosing system to this load's programme",
      cue: "Turn the injector's programme dial to match the wash cycle just selected.",
      why: "The dosing system doses by programme number, not by guessing what's in the drum — a dial left on the previous load's setting means this load gets someone else's chemical formula, at someone else's concentration, metered in with total confidence and no warning that it's wrong.",
      turn: { turns: 0.8, axis: "z", label: "DOSING PROGRAMME" },
    },
    {
      id: "lint-screen", kind: "select", target: "lint-screen",
      title: "Clean the dryer's lint screen",
      cue: "Pull the lint screen and clear it before starting the next dryer load.",
      why: "A loaded lint screen is the single biggest thing standing between a dryer and a duct fire — every load leaves lint behind, and clearing the screen before the next one starts is what keeps that fuel from ever building up to where the duct behind it becomes the problem.",
    },
    {
      id: "finger-guard-test", kind: "hold", target: "finger-guard", seconds: 4,
      title: "Test the flatwork ironer's finger guard",
      cue: "Press the finger guard bar and hold until the feed rollers actually stop turning.",
      why: "The finger guard bar is the one thing standing between a feeding hand and rollers running hot enough to press a sheet dry — proving it actually stops the rollers before the first piece of linen goes in is what makes it a working control rather than a bar somebody assumes still does its job.",
      holdBreakNote: "You let go before the rollers actually stopped. A guard that hasn't been proven to stop the machine is a guess about whether it works at all — hold it until the rollers are actually still.",
    },
    {
      id: "sort-gloves", kind: "sequence",
      targets: ["sort-gloves-on", "sort-linen-bag"],
      itemNames: { "sort-gloves-on": "cut-resistant sorting gloves", "sort-linen-bag": "soiled linen bagged by colour" },
      title: "Glove up and sort the soiled linen",
      cue: "Pull on the sorting gloves before touching the soiled table, then bag the linen by colour.",
      why: "Every piece on this table came off a room nobody has inspected, and the bloodborne pathogens standard treats it all as a possible exposure until it's through the wash — the gloves go on before the first sheet is touched, not after the first thing that draws blood turns up folded inside one.",
      outOfOrderNote: "Gloves first, then the sort — touching soiled linen before the gloves are on is the exposure this sequence exists to prevent.",
    },
    {
      id: "heat-check", kind: "gauge", target: "heat-monitor",
      title: "Read the floor's heat index before continuing",
      cue: "Watch the heat monitor's sweep and commit once it settles in the safe-to-continue band.",
      why: "A washer, a dryer bank and an ironer running together push this floor's heat well past the rest of the building, and Cal/OSHA's heat-illness hazard assessment exists because that heat doesn't announce itself the way an alarm does — the monitor is what tells you to take the water break the label on your own body won't ask for in time.",
      gauge: { label: "HEAT INDEX", speed: 0.6, green: [0.2, 0.42], readout: (t) => `${Math.round(78 + t * 45)}°F`, missNote: "Into the range where a mandatory water break applies — read it again after the break, don't push through on this reading." },
    },
    {
      id: "fold-pace", kind: "track", target: "fold-table", seconds: 7,
      title: "Hold a steady folding pace",
      cue: "Keep the fold rate in the steady band — rushed reaching strains the same shoulder every time, and stalling backs up the whole line.",
      why: "The folding station is where a laundry shift's repetitive-motion injuries actually show up, one identical fold at a time — a pace that stays in the steady band is the ergonomic answer the contract's own language on the folding station is built around, not a speed record nobody asked for.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.42, fall: 0.38, drift: 0.08, label: "FOLD PACE",
        readout: (v) => (v < 0.4 ? "backed up" : v > 0.62 ? "rushed reach" : "steady"),
      },
      holdBreakNote: "Pace drifted out of the steady band. Rushed reaching across the table strains the same shoulder on every fold — bring the pace back to steady rather than pushing through it.",
    },
    {
      id: "stack-cart", kind: "drag", target: "folded-stack",
      title: "Stage the folded stack on the linen cart",
      cue: "Carry the folded stack from the table to the rolling cart.",
      why: "A folded stack carried at arm's length across a wet section of floor blocks the one hand that would otherwise catch a slip — the cart carries the height and the weight instead of your wrists and your sightline, on the one floor in the plant that runs hot and occasionally damp underfoot.",
      drag: { to: "linen-cart-slot", radius: 0.45, missNote: "Not on the cart — set the stack down and load it onto the cart properly, not balanced on the folding table's edge." },
    },
    {
      id: "floor-walk", kind: "find", noHint: true,
      targets: ["open-drum-cap", "blocked-exit"],
      itemNames: { "open-drum-cap": "chemical drum left uncapped", "blocked-exit": "exit route blocked by a cart" },
      itemNotes: {
        "open-drum-cap": "That bleach drum has been sitting open since the last dose. An open drum on a floor already running hot is both a fume source and a spill waiting on the next person who brushes past the shelf.",
        "blocked-exit": "A cart parked square across the floor's marked exit route is the one thing standing between this plant and the door if the fire risk behind the dryer's duct ever becomes a real one.",
      },
      title: "Walk the floor before you leave it",
      cue: "Check the chemical shelf and the exit route before handing the plant to the next shift.",
      why: "The plant runs unattended between shifts, and an open drum or a blocked exit does not wait politely for somebody to notice — the walk-through is the last chance to catch either one before it becomes the next shift's surprise, or worse, the reason the exit route wasn't clear when it mattered.",
    },
    {
      id: "hours-log", kind: "select", target: "hours-sheet",
      title: "Log the shift's loads and hours",
      cue: "Write down the loads run and the hours worked before clocking out.",
      why: "The hours sheet is what the Wage Order's rest-break and premium-pay protections actually run on in a plant this hot — a shift logged honestly, load by load, is the record that proves the day's workload when a supervisor or a steward has to check it against the standard.",
    },
  ],

  interrupts: [
    {
      id: "dosing-leak",
      kind: "Chemical line leak",
      after: "fold-pace", delay: 3, seconds: 12,
      alert: "While your hands are full at the folding table, one of the dosing lines has split at the pump fitting — chemical is spraying across the injector panel and pooling on the floor beneath it.",
      cue: "Shut the isolation valve at the pump now. Don't reach into the spray to catch the line.",
      target: "isolation-valve",
      why: "A split line under pump pressure keeps discharging chemical for as long as the pump keeps running, and reaching into the spray to pinch or catch the line puts concentrate directly on bare skin — the isolation valve is what actually stops the flow, and it's the control this plant's dosing system was built around for exactly this failure.",
      missNote: "The line kept spraying the whole window with nobody at the valve. Chemical pooling under a pump that's still running is not a mess to mop later, it's a spill that's still getting bigger.",
      wrongNote: "That doesn't stop the leak. The isolation valve at the pump is the one control that actually cuts the flow — everything else on this panel is downstream of it.",
    },
    {
      id: "coworker-reach",
      kind: "Coworker reaching toward the feed rollers",
      after: "finger-guard-test", delay: 3, seconds: 11,
      alert: "A coworker is clearing a jammed sheet by reaching directly toward the ironer's feed rollers instead of stopping the machine first.",
      cue: "Pull the emergency stop cord now. Don't call out and wait — pull it.",
      target: "ironer-estop",
      why: "A hand reaching toward feed rollers that are still turning is seconds from being caught in them, and a shout takes longer to register and act on than a hand already reaching for a cord that stops the machine instantly — the estop pull-cord is there precisely so anyone standing nearby can end this before it becomes an injury report.",
      missNote: "The reach continued the whole window with the rollers still turning. A jam cleared by hand on a running ironer is exactly the injury this machine's emergency stop exists to prevent, and it did nothing because nobody pulled it.",
      wrongNote: "That doesn't stop the rollers. The estop pull-cord is what actually kills power to the feed — pull it before saying anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, LPC_ACCENT);

    // ------------------------------------------------------------- utility floor patch
    // A sealed utility floor set into the hotel's carpeted back-of-house run,
    // the way a laundry plant's own wet floor actually breaks from the
    // corridor finish around it.
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#5b6268", base2: "#4f565c", seam: "rgba(230,238,244,0.3)" }), { repeat: 6, px: 384 });
    const floor = box(g, 4.6, 0.02, 4.0, 0, 0.011, -0.2, 0x5b6268, { rough: 0.85 });
    floor.material = texturedMat(floorTex, { rough: 0.82, metal: 0.08, color: 0x5b6268 });

    // ------------------------------------------------------------------ washer-extractor
    const washer = group(g, -1.9, 0, -1.3);
    box(washer, 1.1, 1.3, 1.0, 0, 0.65, 0, 0xc7cdd2, { rough: 0.4, metal: 0.55 });
    const drumRim = torus(washer, 0.34, 0.05, 0, 0.75, 0.51, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 10, seg2: 24 });
    void drumRim;
    const washerDoor = cyl(washer, 0.3, 0.3, 0.04, 0, 0.75, 0.53, 0x22262b, { rough: 0.2, metal: 0.1, opacity: 0.55, transparent: true, seg: 24 });
    void washerDoor;
    box(washer, 1.3, 0.1, 1.1, 0, 1.32, 0, 0x9aa2a8, { rough: 0.5, metal: 0.5 });
    const scaleReadout = instrument(washer, 0.62, 1.1, 0.4, { idle: "-- lb", color: LPC_ACCENT, w: 0.14, d: 0.2, ry: -0.5 });
    holoTag(washer, "load-weight scale", 0.62, 1.34, 0.4, { css: "#7fb3c9", w: 0.4 });
    reg(hits, scaleReadout, "load-scale");
    const linenPile = group(washer, -0.7, 0, 0.7, 0.3);
    box(linenPile, 0.5, 0.3, 0.4, 0, 0.15, 0, 0xece3d0, { rough: 0.75 });
    reg(hits, linenPile, "load-linens");
    const doorLatch = box(washer, 0.06, 0.14, 0.03, 0.28, 0.75, 0.55, CITY.steel, { rough: 0.3, metal: 0.8 });
    reg(hits, doorLatch, "close-door");
    const cyclePad = group(washer, -0.45, 1.0, 0.51);
    for (let i = 0; i < 4; i++) box(cyclePad, 0.1, 0.05, 0.01, 0, i * 0.07, 0, 0x22262b, { rough: 0.5 });
    holoTag(washer, "cycle select", -0.45, 1.28, 0.51, { css: "#7fb3c9", w: 0.32 });
    reg(hits, cyclePad, "select-cycle");
    const dosingDial = group(washer, 0.5, 1.0, 0.53);
    cyl(dosingDial, 0.045, 0.045, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    const dialPointer = box(dosingDial, 0.007, 0.03, 0.006, 0, 0.018, 0.017, 0x7fb3c9, { emissive: 0x7fb3c9, ei: 1.2, rough: 0.4 });
    holoTag(washer, "dosing programme", 0.5, 1.24, 0.53, { css: "#7fb3c9", w: 0.4 });
    reg(hits, dosingDial, "dosing-selector");

    // ------------------------------------------------------------------ chemical dosing panel
    const dosing = group(g, -3.0, 0, -0.2, 0.3);
    box(dosing, 0.4, 0.55, 0.25, 0, 0.4, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const drumBleach = cyl(dosing, 0.14, 0.14, 0.42, -0.42, 0.21, 0.32, 0xdfe4e8, { rough: 0.5, metal: 0.1, seg: 14 });
    decal(drumBleach, 0.18, 0.1, 0, 0.22, 0.142, signFace("BLEACH", { bg: "#1b1e22", accent: "#7fb3c9", scale: 0.5 }));
    const drumSour = cyl(dosing, 0.14, 0.14, 0.42, 0.42, 0.21, 0.32, 0xf2c14b, { rough: 0.5, metal: 0.1, seg: 14 });
    decal(drumSour, 0.18, 0.1, 0, 0.22, 0.142, signFace("SOUR", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.5 }));
    hose(dosing, [[-0.42, 0.42, 0.31], [-0.2, 0.5, 0.15], [-0.05, 0.4, 0]], 0.012, 0xdfe4e8, { steps: 12, rough: 0.6 });
    const crossedLine = hose(dosing, [[0.42, 0.42, 0.31], [0.15, 0.55, 0.1], [-0.15, 0.42, -0.05], [0.05, 0.4, 0]], 0.012, 0xf2c14b, { steps: 14, rough: 0.6 });
    reg(hits, crossedLine, "crossed-injector-line");
    const crackedLine = cyl(dosing, 0.014, 0.014, 0.18, 0.42, 0.42, 0.31, 0xe8622a, { rough: 0.6, seg: 8 });
    holoTag(crackedLine, "hairline crack", 0, 0.14, 0, { css: "#e8622a", w: 0.32 });
    reg(hits, crackedLine, "cracked-injector-line");
    holoTag(dosing, "chemical dosing panel", 0, 0.72, 0, { css: "#7fb3c9", w: 0.44 });
    const isoValve = cyl(dosing, 0.03, 0.03, 0.1, 0, 0.62, 0.1, CITY.steel, { rough: 0.35, metal: 0.8, seg: 12 });
    isoValve.rotation.z = Math.PI / 2;
    holoTag(dosing, "isolation valve", 0, 0.78, 0.1, { css: "#f0645b", w: 0.36 });
    reg(hits, isoValve, "isolation-valve");
    // The two drums stored capped together, draw lines loose against each other.
    const chemMix = box(dosing, 0.2, 0.05, 0.1, 0, 0.44, 0.32, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(dosing, "capped together?", 0, 0.5, 0.34, { css: "#f0645b", w: 0.4 });
    reg(hits, chemMix, "chem-mix-drums");
    const openCap = ball(dosing, 0.045, -0.42, 0.44, 0.32, 0xdfe4e8, { rough: 0.5, seg: 12 });
    holoTag(dosing, "drum left open?", -0.42, 0.56, 0.32, { css: "#f0645b", w: 0.4 });
    reg(hits, openCap, "open-drum-cap");
    const sdsBinder = box(g, 0.26, 0.32, 0.06, -3.0, 0.86, 1.0, 0xd8232a, { rough: 0.6 });
    decal(sdsBinder, 0.22, 0.1, 0, 0.08, 0.032, signFace("SDS", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.6 }));
    reg(hits, sdsBinder, "sds-binder");
    // A shelf under the dosing panel for spare drums and a spill kit, and an
    // eyewash pedestal beside it — the fixtures a chemical corner like this
    // one actually carries.
    const chemShelf = box(g, 0.7, 0.04, 0.35, -3.0, 0.5, -0.6, 0x53606b, { rough: 0.6, metal: 0.3 });
    for (const sx of [-1, 1]) box(g, 0.02, 0.5, 0.35, -3.0 + sx * 0.34, 0.25, -0.6, 0x53606b, { rough: 0.6, metal: 0.3 });
    cyl(g, 0.1, 0.11, 0.3, -3.15, 0.65, -0.6, 0x8b929a, { rough: 0.5, metal: 0.3, seg: 12 });
    box(g, 0.24, 0.14, 0.28, -2.85, 0.6, -0.6, 0xf2c14b, { rough: 0.55 });
    void chemShelf;
    const eyewash = group(g, -2.55, 0, -0.65, 0.3);
    cyl(eyewash, 0.035, 0.04, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 12 });
    for (const sx of [-1, 1]) torus(eyewash, 0.06, 0.015, sx * 0.08, 0.9, 0, 0xdfe4e8, { rough: 0.3, metal: 0.5, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(eyewash, "eyewash station", 0, 1.1, 0, { css: "#7fb3c9", w: 0.36 });

    // ------------------------------------------------------------------ dryer bank
    const dryer = group(g, 0.4, 0, -1.7);
    box(dryer, 1.4, 1.3, 0.9, 0, 0.65, 0, 0xc7cdd2, { rough: 0.4, metal: 0.5 });
    torus(dryer, 0.32, 0.05, -0.35, 0.75, 0.46, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 10, seg2: 22 });
    torus(dryer, 0.32, 0.05, 0.35, 0.75, 0.46, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 10, seg2: 22 });
    box(dryer, 1.6, 0.1, 1.0, 0, 1.32, 0, 0x9aa2a8, { rough: 0.5, metal: 0.5 });
    const lintDoor = group(dryer, 0, 1.0, 0.46);
    box(lintDoor, 0.5, 0.16, 0.03, 0, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.6 });
    const lintScreen = box(lintDoor, 0.42, 0.1, 0.02, 0, 0.06, 0.02, 0x9a8a5a, { rough: 0.7 });
    holoTag(dryer, "lint screen", 0, 1.24, 0.46, { css: "#7fb3c9", w: 0.32 });
    reg(hits, lintScreen, "lint-screen");
    const duct = cyl(dryer, 0.16, 0.16, 1.1, 0.7, 1.7, -0.3, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 14 });
    duct.rotation.z = Math.PI / 2;
    const lintClog = cyl(dryer, 0.14, 0.14, 0.3, 0.4, 1.7, -0.3, 0x6b5a3c, { rough: 0.85, seg: 14 });
    holoTag(dryer, "duct packed with lint", 0.4, 1.9, -0.3, { css: "#f0645b", w: 0.46 });
    reg(hits, lintClog, "lint-clogged-duct");
    void duct;

    // ------------------------------------------------------------------ flatwork ironer
    const ironer = group(g, 2.1, 0, -1.1, -0.5);
    box(ironer, 2.4, 0.9, 0.7, 0, 0.55, 0, 0xc7cdd2, { rough: 0.4, metal: 0.5 });
    cyl(ironer, 0.28, 0.28, 2.2, 0, 0.9, 0, 0xb8862b, { rough: 0.35, metal: 0.6, seg: 20 }).rotation.z = Math.PI / 2;
    const guardBar = box(ironer, 2.3, 0.06, 0.05, 0, 0.5, 0.38, 0xd8232a, { rough: 0.5 });
    holoTag(ironer, "finger guard bar", 0, 0.64, 0.38, { css: "#7fb3c9", w: 0.4 });
    reg(hits, guardBar, "finger-guard");
    const estopCord = cyl(ironer, 0.008, 0.008, 2.3, 0, 1.16, 0.4, 0xd8232a, { rough: 0.5, seg: 6 });
    estopCord.rotation.z = Math.PI / 2;
    holoTag(ironer, "e-stop pull-cord", 0, 1.28, 0.4, { css: "#f0645b", w: 0.4 });
    reg(hits, estopCord, "ironer-estop");
    const feedShelf = slab(ironer, 2.3, 0.04, 0.4, 0, 0.72, 0.3, 0x9aa2a8, { radius: 0.02, rough: 0.4, metal: 0.5 });
    void feedShelf;
    const overloadHint = box(washer, 0.62, 0.5, 0.5, 0, 0.75, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(washer, "stuff it past the line?", 0, 1.05, 0.15, { css: "#f0645b", w: 0.5 });
    reg(hits, overloadHint, "overloaded-washer");

    // ------------------------------------------------------------------ soiled sort table
    const sortTable = group(g, -2.3, 0, 1.5, 0.3);
    box(sortTable, 1.3, 0.75, 0.7, 0, 0.375, 0, 0x9aa2a8, { rough: 0.45, metal: 0.4 });
    const soiledPile = box(sortTable, 0.7, 0.2, 0.5, 0, 0.86, 0, 0xb99a7a, { rough: 0.8 });
    void soiledPile;
    const sortGloves = group(sortTable, -0.5, 0.86, 0.25);
    box(sortGloves, 0.14, 0.045, 0.08, -0.05, 0, 0, 0xf2c14b, { rough: 0.6 });
    box(sortGloves, 0.14, 0.045, 0.08, 0.05, 0, 0, 0xf2c14b, { rough: 0.6 });
    reg(hits, sortGloves, "sort-gloves-on");
    const colorBag = cyl(sortTable, 0.16, 0.18, 0.3, 0.45, 0.24, 0, 0xdfe4e8, { rough: 0.7, seg: 14 });
    reg(hits, colorBag, "sort-linen-bag");
    const bareHandSort = box(sortTable, 0.7, 0.2, 0.5, 0, 0.86, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(sortTable, "reach in bare-handed?", 0, 1.02, 0.1, { css: "#f0645b", w: 0.5 });
    reg(hits, bareHandSort, "bare-hand-soiled");

    // ------------------------------------------------------------------ folding station
    const foldTable = group(g, 1.4, 0, 1.5, 0.2);
    box(foldTable, 1.6, 0.72, 0.7, 0, 0.36, 0, 0xece3d0, { rough: 0.6 });
    const foldedSheet = box(foldTable, 0.5, 0.06, 0.36, -0.4, 0.75, 0, 0xf4f0e6, { rough: 0.7 });
    reg(hits, foldTable, "fold-table");
    const foldedStack = box(foldTable, 0.45, 0.16, 0.32, 0.3, 0.8, 0, 0xf4f0e6, { rough: 0.7 });
    reg(hits, foldedStack, "folded-stack");
    void foldedSheet;

    // Linen cart for the folded stack and the exit-blocking hazard.
    const linenCart = group(g, 2.6, 0, 1.7, -0.4);
    box(linenCart, 0.8, 0.05, 0.6, 0, 0.65, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(linenCart, 0.04, 0.04, 0.06, sx * 0.34, 0.04, sz * 0.24, 0x22262b, { rough: 0.7, seg: 10 });
    const cartSlot = box(linenCart, 0.6, 0.05, 0.4, 0, 0.7, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["linen-cart-slot"] = cartSlot;
    holoTag(linenCart, "linen cart", 0, 0.85, 0, { css: "#7fb3c9", w: 0.3 });
    const blockedExit = group(g, 3.6, 0, 3.0, -0.4);
    box(blockedExit, 0.9, 0.05, 0.7, 0, 0.4, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    holoTag(blockedExit, "blocks the exit?", 0, 0.6, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, blockedExit, "blocked-exit");
    const exitSign = decal(g, 0.3, 0.14, 3.6, 1.9, 3.4, signFace("EXIT", { bg: "#0d1c14", accent: "#59c97b", scale: 0.55 }), { glow: true, ei: 0.7, px: 128 });
    void exitSign;

    // ------------------------------------------------------------------ heat monitor + hydration
    const heatPanel = group(g, -0.4, 0, 2.4, 0);
    const heatMonitor = instrument(heatPanel, 0, 1.3, 0, { idle: "-- °F", color: LPC_ACCENT, w: 0.14, d: 0.2 });
    holoTag(heatPanel, "floor heat index", 0, 1.5, 0, { css: "#7fb3c9", w: 0.4 });
    reg(hits, heatMonitor, "heat-monitor");
    const waterJug = cyl(heatPanel, 0.09, 0.09, 0.3, 0.3, 0.15, 0, 0x8fd1ff, { rough: 0.2, opacity: 0.6, transparent: true, seg: 14 });
    void waterJug;
    for (let i = 0; i < 6; i++) cyl(heatPanel, 0.03, 0.03, 0.14, -0.1 + (i % 3) * 0.09, 0.07 + Math.floor(i / 3) * 0.15, 0.3, 0xf0f4f6, { rough: 0.15, opacity: 0.5, transparent: true, seg: 10 }); // stacked paper cups
    const shadeFan = group(g, -0.4, 0, 3.2, 0);
    box(shadeFan, 0.5, 0.5, 0.08, 0, 2.6, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 4; i++) box(shadeFan, 0.42, 0.03, 0.02, 0, 2.6, 0.04, 0x22262b, { rough: 0.6 }).rotation.z = (i / 4) * Math.PI;

    // A second, idle washer along the back wall — a plant this size runs
    // more than one machine, and the extra silhouette reads that way.
    const washer2 = group(g, -1.9, 0, -2.6);
    box(washer2, 1.0, 1.2, 0.9, 0, 0.6, 0, 0xb9c0c6, { rough: 0.45, metal: 0.5 });
    torus(washer2, 0.3, 0.045, 0, 0.68, 0.46, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 10, seg2: 20 });
    box(washer2, 1.2, 0.08, 1.0, 0, 1.22, 0, 0x9aa2a8, { rough: 0.5, metal: 0.5 });

    // ------------------------------------------------------------------ hours log
    const logBoard = holoPanel(g, 0.5, 0.34, -2.9, 1.5, 2.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fb3c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("HOURS & LOADS", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillStyle = "#cfe6ee";
      ctx.fillText("Loads · hours · Wage Order 5", w / 2, h * 0.6);
      ctx.fillText("rest breaks logged", w / 2, h * 0.76);
    }, { ry: 0.5, accent: LPC_ACCENT });
    reg(hits, logBoard, "hours-sheet");

    // Steam off the washer, and dust motes near the dryer bank.
    const steam = particles(washer, 20, 0xe8f4ff, { size: 0.03, life: 0.6, additive: false, opacity: 0.3 });
    steam.position.set(0, 1.35, 0);

    // Crew: the laundry attendant at the fold table, clear of every machine.
    const attendant = standingFigure(g, 1.4, 2.5, { ry: 3.0, cloth: 0x37505f, trousers: 0x2b3138, skin: 0xc99878 });
    // Coworker, staged near the ironer for the reach-toward-rollers interrupt.
    const coworker = standingPerson(g, 2.0, -0.4, { ry: 1.2, cloth: 0x5a4a3a, hiVis: false, skin: 0xb98868 });

    let coworkerReaching = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.1, -0.5),

      onStepComplete(step) {
        if (step.id === "injector-lines") { crossedLine.visible = false; crackedLine.visible = false; }
        if (step.id === "load-weight") repaint(scaleReadout.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "washer-load") linenPile.visible = false;
        if (step.id === "dosing-dial") dialPointer.rotation.z = -1.1;
        if (step.id === "lint-screen") lintScreen.material = mat(0xdfe4e8, { rough: 0.4, metal: 0.3 });
        if (step.id === "finger-guard-test") guardBar.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "sort-gloves") soiledPile.visible = false;
        if (step.id === "heat-check") repaint(heatMonitor.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "stack-cart") foldedStack.visible = false;
        if (step.id === "floor-walk") { openCap.visible = false; blockedExit.position.set(6, -2, 6); }
      },

      onInterrupt(it) {
        if (it.id === "dosing-leak") { particles(dosing, 16, 0xf2c14b, { size: 0.02, life: 0.4, additive: false, opacity: 0.6 }).position.set(0.15, 0.45, 0.1); isoValve.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.4, metal: 0.8 }); }
        if (it.id === "coworker-reach") { coworkerReaching = true; coworker.arms[0].shoulder.rotation.z = -1.0; coworker.arms[0].shoulder.rotation.x = -0.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dosing-leak") isoValve.material = mat(CITY.steel, { rough: 0.35, metal: 0.8 });
        if (it.id === "coworker-reach") { coworkerReaching = false; coworker.arms[0].shoulder.rotation.z = 0; coworker.arms[0].shoulder.rotation.x = 0; }
      },

      animate(t, dt, session) {
        steam.userData?.step?.(dt, new THREE.Vector3(0, 1.35, 0), 0.25, 0.35, 0.5);
        attendant.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        if (coworkerReaching) coworker.arms[0].fore.rotation.x = Math.sin(t * 4) * 0.1 - 0.3;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "load-weight") repaint(scaleReadout.userData.screen, signFace(`${Math.round(gg.t * 400)} lb`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
          if (session.step?.id === "heat-check") repaint(heatMonitor.userData.screen, signFace(`${Math.round(78 + gg.t * 45)}°F`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.42 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
    };
  },
};
