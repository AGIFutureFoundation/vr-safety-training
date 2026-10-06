import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dish Pit VR — Culinary & Hospitality, station 110.
//
// A working commercial kitchen's dish machine and three-compartment sink,
// generic rather than any one restaurant, run the way a UNITE HERE Local 2
// dishwasher runs it: the chemical dispenser's own lines checked before
// anything is trusted to it, the sanitiser proven with a test strip rather
// than assumed from the dispenser's setting, the machine's own gauge read
// against the number the Food Code actually asks for, and an eyewash proven
// to run clear before the first jug of concentrate is ever opened.

const DPT_ACCENT = 0x4fd18c;
const DPT_STEEL = 0xc7cdd2;

export const SIM_DISH_PIT = {
  id: "dish-pit",
  index: "110",
  domain: "Culinary & Hospitality",
  trade: "UNITE HERE Local 2 dishwasher / kitchen steward",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "The FDA Food Code as adopted in the California Retail Food Code; OSHA 29 CFR 1910.1200 hazard communication and the safety data sheet for every chemical on the line; ANSI/ISEA Z358.1 emergency eyewash and shower equipment; Cal/OSHA general industry safety orders; UNITE HERE Local 2, with AFSCME and SEIU food-service members held to the same warewashing standard in school and hospital kitchens",
  name: "Dish Pit",
  title: simTitle("Dish Pit"),
  tagline: "The dish machine and the three-compartment sink: concentrate lines checked, sanitiser strip-tested and logged, the machine's final rinse read against the gauge, wash-rinse-sanitise held for its contact time, the eyewash proven clear, and a splash to the eye drilled",
  accent: DPT_ACCENT,
  accentCss: "#4fd18c",
  parSeconds: 260,
  footprint: 2.3,
  badge: { id: "clear-rinse", name: "Clear Rinse", note: "Lines checked, strip tested and logged, gauge read, contact time held, eyewash proven clear — no shortcuts" },

  game: system({
    name: "Warewashing",
    currency: "PPM",
    ranks: ["Pot Runner", "Steward", "Lead Steward", "Kitchen Safety Rep", "Warewashing Certified"],
    badges: [
      { id: "lines-first", name: "Lines First", note: "Dispenser lines checked before the first jug is opened, first time", test: AWARD.stepClean("lines") },
      { id: "never-eyeballed", name: "Never Eyeballed", note: "Never a sanitiser trusted unread, never a chemical bare-handed, never the eyewash blocked", test: AWARD.safe },
      { id: "true-ppm", name: "True PPM", note: "The strip reading and the rinse gauge both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-pit", name: "Clean Pit", note: "No corrections across the whole shift", test: AWARD.clean },
      { id: "steady-contact", name: "Steady Contact", note: "Held the sanitise contact time without breaking it", test: AWARD.unbroken },
      { id: "pit-fast", name: "Pit Ready Fast", note: "Racks running inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-connected-chemicals": "That concentrate line is plumbed into the wrong inlet on the dispenser — the chlorine sanitiser and an acid-based delimer sharing one draw line. The SDS for both is explicit about this: chlorine plus an acid gives off chlorine gas, and it does that inside a closed dispenser cabinet a foot from where somebody is standing.",
    "bare-hand-chemical": "You reached into the concentrate jug with a bare hand. Warewashing chemicals are the reason gloves and an apron are staged at this station specifically, not a general kitchen rule — a splash off a jug lip is concentrate, not the diluted solution in the sink.",
    "blocked-eyewash": "Somebody parked the mop bucket in front of the eyewash. ANSI/ISEA Z358.1 calls for that station to be reachable in about ten seconds with nothing in the way, because a person flushing a chemical splash cannot see well enough to step around a bucket first.",
    "arm-length-carry": "You stacked that rack higher than your own sightline and carried it at arm's length across a wet floor instead of loading it on the cart. A dropped stack on quarry tile is a laceration and a burn in the same fall; the cart exists so nobody's hands are the thing balancing a hundred pounds of hot glassware over a slick floor.",
  },

  lateNotes: {
    "test-strip-station": "The strip is read after the sink is set up wash-rinse-sanitise, against a sanitiser solution that actually exists.",
    "sani-compartment": "The contact time is held after the strip has already proven the concentration — there is nothing honest to time a chemical that has not been tested.",
    "sds-copy": "The SDS goes to the clinic with the injured worker after the full flush, not instead of it.",
  },

  interrupts: [
    {
      id: "sanitizer-empty",
      kind: "Dispenser jug ran dry",
      after: "contact-time", delay: 3, seconds: 12,
      alert: "The strip you just dipped mid-shift comes back with no colour change at all — the dispenser is pulling nothing but water.",
      cue: "The sanitiser jug behind the dispenser is empty. Swap it before another rack goes through that compartment.",
      target: "dispenser-jug-swap",
      why: "A dispenser with an empty jug still runs and still smells faintly of sanitiser from the line, which is exactly why the strip exists rather than a nose — every rack that went through since the jug ran dry was rinsed in plain water and reported as sanitised on nobody's log.",
      missNote: "Racks kept moving through a sanitise compartment that had stopped sanitising an unknown number of cycles ago, and nothing on the floor caught it because nobody looked at the jug.",
      wrongNote: "Not that. The jug swap is the only thing that puts sanitiser back in the line — everything else on this station is downstream of it being empty.",
    },
    {
      id: "coworker-splash",
      kind: "Chemical splash to a co-worker",
      after: "eyewash-check", delay: 3, seconds: 12,
      alert: "The prep cook refilling the delimer bottle at the dispenser just took a faceful off the spout and is calling out — eyes shut, hands over her face.",
      cue: "Get her onto the second eyewash head now — don't wait for her to find it herself.",
      target: "coworker-eyewash",
      why: "A chemical in the eye is not something the injured person can reliably act on themselves — the instinct is to press the eyes shut, which is the opposite of what a flush needs. Whoever is nearest gets them into the stream and holds their lids open; that fifteen minutes does not start until somebody does that.",
      missNote: "She stood there with her eyes shut for the whole window instead of being walked to the second head, and every second of that is chlorine sitting on the cornea instead of being flushed off it.",
      wrongNote: "Not that. Getting her onto the working eyewash head is the one response that actually gets the chemical off her eyes right now.",
    },
  ],

  steps: [
    {
      id: "sds", kind: "select", target: "sds-binder",
      title: "Read the SDS for the dish machine chemicals",
      cue: "Open the binder and check the sanitiser and detergent sheets before the shift starts.",
      why: "The safety data sheet is where the incompatibility warning actually lives — OSHA's hazard communication standard puts it on the shelf specifically so nobody has to guess which chemicals can and cannot share a line, a bucket or a spill.",
    },
    {
      id: "lines", kind: "find", noHint: true,
      targets: ["crossed-line", "cracked-suction"],
      itemNames: { "crossed-line": "concentrate line into the wrong inlet", "cracked-suction": "cracked suction line" },
      itemNotes: {
        "crossed-line": "This line is drawing from the sanitiser jug into what should be the detergent inlet. Swapped like this, the dispenser meters chlorine sanitiser everywhere the wash cycle expects detergent — and pours detergent into the sanitise rinse.",
        "cracked-suction": "This suction line has a hairline split just above the jug cap, drawing air with every stroke. It reads as sanitiser flowing on the dispenser's own counter while the strip in the sink comes back weak or blank.",
      },
      title: "Check the dispenser's concentrate lines",
      cue: "Trace both concentrate lines from their jugs to the dispenser before trusting either one.",
      why: "The dispenser cabinet is the one place in the pit where the chemicals are still full strength and where two lines running an inch apart are simple to cross by mistake. A line checked here is the difference between the machine actually working and a proportioner confidently metering the wrong chemical all shift.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["chem-gloves", "chem-apron"],
      itemNames: { "chem-gloves": "chemical-resistant gloves", "chem-apron": "rubber apron" },
      title: "Glove and apron up for the chemicals",
      cue: "Pull on the chemical-resistant gloves and the rubber apron before touching the dispenser or the sink.",
      why: "Everything at this station — concentrate, sanitiser solution, hot rinse water — is something dish soap and a t-shirt were never rated for. The gloves and apron are staged here rather than at the line because this is the one job in the kitchen where a splash is concentrated rather than diluted.",
    },
    {
      id: "rinse-temp", kind: "gauge", target: "machine-gauge",
      title: "Read the dish machine's final-rinse gauge",
      cue: "Watch the final-rinse temperature climb through a cycle and commit once it holds in the Food Code's range for a high-temperature machine.",
      why: "A high-temperature machine sanitises with heat instead of chemical, and the Food Code's final-rinse number is the only proof that happened — a machine that sounds right and smells like hot water can still be running a rinse ten degrees short, which is a load of dishes that only ever got washed.",
      gauge: { label: "FINAL RINSE", speed: 0.65, green: [0.55, 0.78], readout: (t) => `${Math.round(150 + t * 60)}°F`, missNote: "Short of the required final-rinse temperature — that load washed clean and left unsanitised. Hold the machine until the gauge is in range." },
    },
    {
      id: "sink-setup", kind: "sequence",
      targets: ["sink-wash", "sink-rinse", "sink-sanitize"],
      itemNames: { "sink-wash": "wash compartment filled", "sink-rinse": "rinse compartment filled", "sink-sanitize": "sanitise compartment filled" },
      title: "Set up the three-compartment sink",
      cue: "Fill wash, then rinse, then sanitise — in that order, left to right.",
      why: "Each compartment undoes what the last one left behind: wash lifts the soil, rinse clears the detergent, sanitise is the last thing touching the item before it drains dry. Filled out of order, detergent or food soil ends up carried into the sanitiser and neutralises it before the first item ever goes in.",
      outOfOrderNote: "Wash, then rinse, then sanitise — the order the item itself is going to travel through the sink.",
    },
    {
      id: "strip-test", kind: "gauge", target: "test-strip-station",
      title: "Test the sanitiser with a strip",
      cue: "Dip the strip in the sanitise compartment, read it against the colour chart, and commit the concentration.",
      why: "A dispenser set correctly and a dispenser actually delivering that setting are two different claims, and the strip is the only one of them that is measured rather than assumed. Chlorine sanitiser has to land in the 50 to 100 ppm band — a quaternary sanitiser is read against its own label — and nothing on the machine's dial can substitute for that colour change.",
      gauge: { label: "SANITISER — CHLORINE", speed: 0.7, green: [0.42, 0.62], readout: (t) => `${Math.round(t * 160)} ppm`, missNote: "Outside 50 to 100 ppm. Too weak does not sanitise; too strong is itself a hazard and a waste of chemical. Adjust the dispenser and strip-test again." },
    },
    {
      id: "log-reading", kind: "select", target: "log-sheet",
      title: "Log the sanitiser reading",
      cue: "Write the ppm reading and the time on the concentration log before the first rack goes in.",
      why: "A verified reading nobody wrote down is a fact only for as long as it stays in your head. The log is what turns this shift's test into something a health inspector, the next shift or a steward can actually check without redoing the test themselves.",
    },
    {
      id: "contact-time", kind: "hold", target: "sani-compartment", seconds: 6,
      title: "Hold the sanitise contact time",
      cue: "Submerge the item in the sanitise compartment and hold it for the full contact time the concentration and water temperature call for.",
      why: "Sanitiser kills on a curve, not on contact — pull an item the instant it touches the solution and it has been wetted, not sanitised. The Food Code's contact time exists because that curve needs seconds to finish, and a rushed dip is a load that looks identical to a properly sanitised one until somebody gets sick.",
      holdBreakNote: "Pulled early — the item was wet, not sanitised. Put it back and hold the full contact time.",
    },
    {
      id: "eyewash-check", kind: "hold", target: "eyewash-paddle", seconds: 5,
      title: "Prove the eyewash runs clear",
      cue: "Push the paddle valve and hold it open until the flow runs clear of any standing water or rust.",
      why: "ANSI/ISEA Z358.1 calls for a weekly activation test for exactly this reason: the header pipe on an eyewash sits full of stagnant water between uses, and a station nobody has tested delivers a faceful of rust and bacteria to somebody who is already having the worst minute of their shift.",
      holdBreakNote: "You let go before the flow ran clear. Hold it open until the water coming out is the water you'd actually want in an eye.",
    },
    {
      id: "splash-response", kind: "hold", target: "eyewash-drench", seconds: 8,
      title: "Drill the fifteen-minute flush",
      cue: "Hold your own eyes in the stream and don't stop early — a real splash gets the full flush, not a quick rinse.",
      why: "ANSI/ISEA Z358.1 calls for a continuous fifteen-minute flush for a chemical splash to the eye, timed from the moment the water starts, because a sanitiser or delimer concentrate keeps reacting with tissue for as long as any of it is still on the surface — stopping at the two-minute mark most people's instinct hits leaves the reaction still running.",
      holdBreakNote: "Stopped short. A chemical splash gets the full fifteen minutes every time, not until it feels better.",
    },
    {
      id: "sds-to-clinic", kind: "select", target: "sds-copy",
      title: "Take the SDS to the clinic",
      cue: "Pull the copy of the sanitiser's SDS off the binder to send with the injured worker.",
      why: "Whoever treats a chemical exposure needs to know exactly what was in the eye, not a guess at the brand name — the SDS is what tells a clinic or an ER the pH, the concentration and the first-aid measures the manufacturer actually tested, in the time it takes to hand over a sheet of paper.",
    },
    {
      id: "rack-stage", kind: "drag", target: "clean-rack",
      title: "Stage the clean rack on the cart",
      cue: "Carry the stacked rack to the rolling cart rather than across the floor by hand.",
      why: "A stacked rack carried at arm's length blocks the one hand that would otherwise catch a slip, on the one floor in the kitchen that is reliably wet. The cart carries the weight and the height instead of your wrists and your sightline.",
      drag: { to: "cart-slot", radius: 0.42, missNote: "Not on the cart — set the rack down and load it onto the cart properly, not balanced on the drainboard." },
    },
    {
      id: "walk-close", kind: "find", noHint: true,
      targets: ["floor-puddle", "open-jug-cap"],
      itemNames: { "floor-puddle": "puddle with no wet-floor sign", "open-jug-cap": "concentrate jug left uncapped" },
      itemNotes: {
        "floor-puddle": "Standing water with no cone or sign next to it — the exact combination Cal/OSHA's walking-surface rule is written to catch before somebody's foot finds it first.",
        "open-jug-cap": "That sanitiser jug has been sitting open on the shelf since the last swap. An open concentrate jug in a kitchen this humid is both a fume source and a spill waiting on the next person who bumps the shelf.",
      },
      title: "Walk the pit before you leave it",
      cue: "Check the floor and the chemical shelf before handing the station to the next shift.",
      why: "The pit is about to run unattended between shifts or during a break, and a puddle or an open jug does not wait politely for somebody to notice — the walk-through is the last chance to catch either one before it becomes the next person's surprise.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, DPT_ACCENT);

    // ------------------------------------------------------------- floor patch
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a5a48", base2: "#6b4e3e", seam: "rgba(240,230,215,0.55)" }), { repeat: 5, px: 384 });
    const floor = box(g, 5.4, 0.1, 4.6, 0, 0.05, 0, 0x7a5a48, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.88, metal: 0.05, color: 0x7a5a48 });

    // ------------------------------------------------------------------ dish machine
    const machine = group(g, -1.7, 0.1, -1.5);
    box(machine, 1.1, 1.5, 1.0, 0, 0.75, 0, DPT_STEEL, { rough: 0.4, metal: 0.6 });
    const doorHatch = box(machine, 0.9, 1.0, 0.05, 0, 0.85, 0.5, 0xaab1b7, { rough: 0.35, metal: 0.6 });
    void doorHatch;
    box(machine, 1.3, 0.1, 1.2, 0, 1.52, 0, 0x9aa2a8, { rough: 0.5, metal: 0.5 }); // hood lip
    for (let i = 0; i < 3; i++) cyl(machine, 0.02, 0.02, 0.9, -0.3 + i * 0.3, 1.0, 0.52, 0x2b6fd8, { rough: 0.4, metal: 0.4, seg: 8 }); // rinse manifold jets
    const gaugeReadout = instrument(machine, 0.62, 1.1, 0.3, { idle: "--°F", color: DPT_ACCENT, w: 0.14, d: 0.2, ry: -0.5 });
    holoTag(machine, "final-rinse gauge", 0.62, 1.34, 0.3, { css: "#4fd18c", w: 0.4 });
    reg(hits, gaugeReadout, "machine-gauge");
    holoTag(machine, "dish machine — high temp", 0, 1.7, 0, { css: "#4fd18c", w: 0.48 });
    const steam = particles(machine, 30, 0xe8f4ff, { size: 0.03, life: 0.6, additive: false, opacity: 0.4 });
    steam.position.set(0, 1.55, 0);

    // Cart with a staged clean rack.
    const cart = group(g, -1.7, 0.1, -0.15, 0.1);
    box(cart, 0.7, 0.06, 0.7, 0, 0.42, 0, 0x2b2f34, { rough: 0.55, metal: 0.5 });
    for (const [sx, sz] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) cyl(cart, 0.05, 0.05, 0.06, sx, 0.06, sz, 0x1b1e22, { rough: 0.6, metal: 0.3, seg: 10 });
    for (const y of [0.12, 0.42]) box(cart, 0.03, 0.36, 0.03, -0.32, y, -0.32, 0x8a939b, { rough: 0.5, metal: 0.6 });
    const cartSlot = box(cart, 0.6, 0.02, 0.6, 0, 0.45, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["cart-slot"] = cartSlot;
    holoTag(cart, "dish cart", 0, 0.66, 0, { css: "#4fd18c", w: 0.3 });

    // Rack of glassware staged near the machine, dragged onto the cart.
    const rackGrp = group(machine, 0.9, -0.65, 0.6, -0.2);
    const rackBase = box(rackGrp, 0.5, 0.06, 0.5, 0, 0.65, 0, 0xd8232a, { rough: 0.6 });
    for (let i = 0; i < 9; i++) cyl(rackGrp, 0.03, 0.035, 0.14, (-1 + (i % 3)) * 0.16, 0.75, (-1 + Math.floor(i / 3)) * 0.16, 0xdfe6ec, { rough: 0.2, metal: 0.1, opacity: 0.55, transparent: true, seg: 10 });
    void rackBase;
    reg(hits, rackGrp, "clean-rack");

    // ------------------------------------------------------------------ three-comp sink
    const sink = group(g, 0.5, 0.1, -1.6, -0.1);
    box(sink, 3.0, 0.75, 0.6, 0, 0.375, 0, 0x9aa2a8, { rough: 0.4, metal: 0.55 }); // counter body
    const basins = {};
    for (const [id, dx, label] of [["sink-wash", -0.9, "WASH"], ["sink-rinse", 0.0, "RINSE"], ["sink-sanitize", 0.9, "SANITISE"]]) {
      const b = group(sink, dx, 0, 0);
      box(b, 0.75, 0.5, 0.5, 0, 0.55, 0, 0x7b8288, { rough: 0.4, metal: 0.5 });
      const water = slab(b, 0.66, 0.03, 0.42, 0, 0.78, 0, id === "sink-sanitize" ? 0x6fd8b0 : 0x6fb4d8, { rough: 0.15, metal: 0.1, opacity: 0.65, transparent: true, cast: false });
      water.visible = false; basins[id] = water;
      holoTag(b, label, 0, 0.95, 0.28, { css: "#4fd18c", w: 0.3 });
      reg(hits, b, id);
    }
    for (const dx of [-0.45, 0.45]) cyl(sink, 0.02, 0.02, 0.4, dx, 0.9, -0.24, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 10 }); // faucets
    const testStripGrp = group(sink, 0.0, 0, -0.35, 0.3);
    box(testStripGrp, 0.16, 0.02, 0.05, 0, 0.82, 0, 0xdfe6a8, { rough: 0.6 });
    const stripReadout = instrument(testStripGrp, 0.2, 0.95, 0, { idle: "-- ppm", color: DPT_ACCENT, w: 0.13, d: 0.18 });
    holoTag(testStripGrp, "test strip station", 0.2, 1.14, 0, { css: "#4fd18c", w: 0.4 });
    reg(hits, stripReadout, "test-strip-station");
    const saniHold = box(sink, 0.4, 0.3, 0.3, 0.9, 0.62, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, saniHold, "sani-compartment");

    // ------------------------------------------------------------------ chemical dispenser
    const dispenser = group(g, 1.9, 0.1, -1.7, 0.2);
    box(dispenser, 0.4, 0.55, 0.25, 0, 0.4, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const jugSan = cyl(dispenser, 0.13, 0.13, 0.4, -0.4, 0.2, 0.3, 0xf2c14b, { rough: 0.5, metal: 0.1, seg: 14 });
    const jugDet = cyl(dispenser, 0.13, 0.13, 0.4, 0.4, 0.2, 0.3, 0x4fb8c9, { rough: 0.5, metal: 0.1, seg: 14 });
    decal(jugSan, 0.18, 0.1, 0, 0.22, 0.132, signFace("SANITISER", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.5 }));
    decal(jugDet, 0.18, 0.1, 0, 0.22, 0.132, signFace("DETERGENT", { bg: "#1b1e22", accent: "#4fb8c9", scale: 0.5 }));
    hose(dispenser, [[-0.4, 0.42, 0.29], [-0.2, 0.5, 0.15], [-0.05, 0.4, 0]], 0.012, 0xf2c14b, { steps: 12, rough: 0.6 });
    const crossedHose = hose(dispenser, [[0.4, 0.42, 0.29], [0.15, 0.55, 0.1], [-0.15, 0.42, -0.05], [0.05, 0.4, 0]], 0.012, 0x4fb8c9, { steps: 14, rough: 0.6 });
    reg(hits, crossedHose, "crossed-line");
    const crackedHose = cyl(dispenser, 0.014, 0.014, 0.18, -0.4, 0.42, 0.29, 0xe8622a, { rough: 0.6, seg: 8 });
    holoTag(crackedHose, "hairline crack", 0, 0.14, 0, { css: "#e8622a", w: 0.32 });
    reg(hits, crackedHose, "cracked-suction");
    holoTag(dispenser, "chemical dispenser", 0, 0.72, 0, { css: "#4fd18c", w: 0.4 });
    const openCap = ball(dispenser, 0.04, 0.4, 0.44, 0.44, 0xf2c14b, { rough: 0.5, seg: 12 });
    reg(hits, openCap, "open-jug-cap");
    const jugSwap = box(dispenser, 0.3, 0.3, 0.3, -0.4, 0.6, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(dispenser, "swap the jug", -0.4, 0.9, 0.1, { css: "#f2c14b", w: 0.3 });
    reg(hits, jugSwap, "dispenser-jug-swap");

    // Bare-hand-chemical hazard: reaching into an open concentrate jug.
    const bareHandHazard = box(dispenser, 0.3, 0.2, 0.3, 0.4, 0.55, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(dispenser, "reach in bare-handed?", 0.4, 0.78, 0.35, { css: "#e8622a", w: 0.42 });
    reg(hits, bareHandHazard, "bare-hand-chemical");
    const coworkerSplashHazard = box(dispenser, 0.3, 0.2, 0.3, 0.15, 0.55, -0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void coworkerSplashHazard;
    const mixThemHazard = box(dispenser, 0.3, 0.2, 0.3, -0.15, 0.55, -0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(dispenser, "run it crossed anyway?", -0.15, 0.78, -0.25, { css: "#e8622a", w: 0.48 });
    reg(hits, mixThemHazard, "cross-connected-chemicals");

    // ------------------------------------------------------------------ PPE hooks
    const ppeStand = group(g, 2.0, 0.1, 0.1, -0.3);
    slab(ppeStand, 0.1, 1.2, 0.4, 0, 0.6, 0, 0x53606b, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const apronMesh = box(ppeStand, 0.35, 0.5, 0.03, 0.15, 0.85, 0, 0xf2c14b, { rough: 0.7 });
    reg(hits, apronMesh, "chem-apron");
    const glovesMesh = group(ppeStand, 0.15, 0.55, 0);
    box(glovesMesh, 0.16, 0.05, 0.09, -0.06, 0, 0, 0xd8232a, { rough: 0.6 });
    box(glovesMesh, 0.16, 0.05, 0.09, 0.06, 0, 0, 0xd8232a, { rough: 0.6 });
    reg(hits, glovesMesh, "chem-gloves");
    holoTag(ppeStand, "chemical PPE", 0.15, 1.15, 0, { css: "#4fd18c", w: 0.32 });

    // ------------------------------------------------------------------ eyewash pedestal
    const eyewash = group(g, 1.6, 0.1, 1.5, 0.3);
    cyl(eyewash, 0.04, 0.045, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 12 });
    const paddle = box(eyewash, 0.22, 0.05, 0.06, 0, 0.75, 0.1, 0xd8232a, { rough: 0.55 });
    reg(hits, paddle, "eyewash-paddle");
    for (const sx of [-1, 1]) {
      const bowl = torus(eyewash, 0.07, 0.018, sx * 0.09, 1.0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.5, seg: 8, seg2: 18 });
      bowl.rotation.x = Math.PI / 2;
    }
    const eyewashSpray = particles(eyewash, 28, 0xbfe4ff, { size: 0.016, life: 0.4, additive: false, opacity: 0.55 });
    eyewashSpray.position.set(0, 1.0, 0);
    holoTag(eyewash, "eyewash station", 0, 1.25, 0, { css: "#4fd18c", w: 0.36 });
    const mopBucket = box(eyewash, 0.3, 0.3, 0.3, 0.35, 0.15, 0.35, 0x2f6f8c, { rough: 0.6, metal: 0.2 });
    holoTag(mopBucket, "block the path?", 0, 0.32, 0, { css: "#e8622a", w: 0.34 });
    reg(hits, mopBucket, "blocked-eyewash");

    // Second head, used for the co-worker interrupt and the emergency drench.
    const eyewash2 = group(g, 1.9, 0.1, 1.65, -0.4);
    cyl(eyewash2, 0.035, 0.04, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    const drenchHandle = box(eyewash2, 0.18, 0.04, 0.05, 0, 0.7, 0.08, 0xd8232a, { rough: 0.55 });
    reg(hits, drenchHandle, "eyewash-drench");
    for (const sx of [-1, 1]) torus(eyewash2, 0.06, 0.015, sx * 0.08, 0.9, 0, 0xdfe4e8, { rough: 0.3, metal: 0.5, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    const eyewash2Spray = particles(eyewash2, 20, 0xbfe4ff, { size: 0.014, life: 0.35, additive: false, opacity: 0.5 });
    eyewash2Spray.position.set(0, 0.9, 0);
    holoTag(eyewash2, "second head", 0, 1.1, 0, { css: "#4fd18c", w: 0.3 });
    const coworkerHit = box(eyewash2, 0.35, 0.4, 0.35, -0.4, 0.6, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, coworkerHit, "coworker-eyewash");

    // ------------------------------------------------------------------ paperwork
    const chest = toolChest(g, -2.0, 1.4, { ry: 0.6, color: 0x2b3138 });
    void chest;
    const binder = box(g, 0.26, 0.32, 0.06, -1.85, 0.86, 1.55, 0xd8232a, { rough: 0.6 });
    decal(binder, 0.22, 0.1, 0, 0.08, 0.032, signFace("SDS", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.6 }));
    reg(hits, binder, "sds-binder");
    const sdsCopy = box(binder, 0.22, 0.02, 0.05, 0, 0.16, 0.031, 0xf4f0e2, { rough: 0.7 });
    reg(hits, sdsCopy, "sds-copy");

    const logDesk = group(g, -1.0, 0.1, 1.7, -0.2);
    box(logDesk, 0.6, 0.72, 0.4, 0, 0.36, 0, 0x53606b, { rough: 0.65, metal: 0.3 });
    const logSheet = decal(logDesk, 0.32, 0.4, 0, 0.735, 0, paperFace("SANITISER LOG", ["Time ___  PPM ___", "Time ___  PPM ___", "Time ___  PPM ___"], { scale: 0.8 }));
    logSheet.rotation.x = -Math.PI / 2;
    holoTag(logDesk, "concentration log", 0, 1.0, 0, { css: "#4fd18c", w: 0.4 });
    reg(hits, logSheet, "log-sheet");

    const plan = holoPanel(g, 0.9, 0.6, -2.0, 1.6, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "#0a1a12"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#4fd18c"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e2f7ea"; ctx.fillText("DISH PIT — WAREWASHING", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#e8fbef";
      ["Check dispenser lines before opening a jug", "Chlorine sanitiser: 50-100 ppm by strip", "High-temp final rinse per Food Code", "Wash, rinse, sanitise — never reversed", "Eyewash clear and unobstructed, always"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.3, accent: DPT_ACCENT });
    reg(hits, plan, "service-plan");
    void plan;

    // Wet-floor puddle hazard for the closing walk.
    const puddle = slab(g, 0.6, 0.006, 0.5, 0.3, 0.106, -0.1, 0x6fb4d8, { rough: 0.2, opacity: 0.4, transparent: true, cast: false });
    reg(hits, puddle, "floor-puddle");
    const armLengthHit = box(g, 0.5, 0.4, 0.4, -0.9, 0.4, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "carry it stacked, by hand?", -0.9, 0.7, -0.6, { css: "#e8622a", w: 0.5 });
    reg(hits, armLengthHit, "arm-length-carry");

    const dishwasher = standingFigure(g, -0.2, -0.8, { ry: 0.4, cloth: 0x2b7a5a });
    holoTag(dishwasher, "dishwasher", 0, 1.9, 0, { css: "#4fd18c", w: 0.3 });
    const cowokerHome = new THREE.Vector3(2.1, 0, -0.75);
    const cowoker = standingFigure(g, cowokerHome.x, cowokerHome.z, { ry: -1.4, cloth: 0x37505f });

    let bled = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.1, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lines") { crossedHose.visible = false; crackedHose.visible = false; }
        if (step.id === "sink-setup") for (const w of Object.values(basins)) w.visible = true;
        if (step.id === "strip-test") { bled = true; repaint(stripReadout.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 })); }
        if (step.id === "rinse-temp") repaint(gaugeReadout.userData.screen, signFace("READ", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.58 }));
        if (step.id === "rack-stage") rackGrp.visible = false;
        if (step.id === "walk-close") { puddle.visible = false; openCap.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "sanitizer-empty") { jugSan.material = mat(0x8a8a8a, { rough: 0.7 }); }
        if (it.id === "coworker-splash") { cowoker.position.set(1.75, 0, 1.45); eyewash2Spray.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sanitizer-empty") jugSan.material = mat(0xf2c14b, { rough: 0.5, metal: 0.1 });
        if (it.id === "coworker-splash") { eyewash2Spray.visible = false; cowoker.position.set(cowokerHome.x, 0, cowokerHome.z); }
      },
      onHazard() {},
      animate(t, dt, session) {
        steam.userData?.step?.(dt, new THREE.Vector3(0, 1.55, 0), 0.25, 0.4, 0.6);
        const step = session?.step;
        eyewashSpray.visible = step?.id === "eyewash-check" && session.holding;
        if (eyewashSpray.visible) eyewashSpray.userData.step(dt, new THREE.Vector3(0, 1.0, 0), 0.06, 0.6, -1.2);
        if (step?.id === "splash-response" && session.holding) eyewash2Spray.userData.step(dt, new THREE.Vector3(0, 0.9, 0), 0.06, 0.6, -1.2);
        else if (!session?.activeInterrupt) eyewash2Spray.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "rinse-temp") repaint(gaugeReadout.userData.screen, signFace(`${Math.round(150 + gg.t * 60)}°F`, { bg: "#0d1c24", accent: gg.t >= 0.55 && gg.t <= 0.78 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
          if (step?.id === "strip-test") repaint(stripReadout.userData.screen, signFace(`${Math.round(gg.t * 160)} ppm`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        void bled;
      },
    };
  },
};
