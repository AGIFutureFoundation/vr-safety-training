import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, waterFace, lockTag,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pool & Spa Chemistry VR — Building Systems & Facilities,
// property management zone thirteen.
//
// The residents' pool and spa in the courtyard, and the small equipment room
// behind them: the water tested and dosed to the state pool code's bands, the
// recirculation pump locked out before its strainer is opened, the filter
// backwashed against its gauge, the chemical room stored so two oxidisers
// never meet, the spa held under its temperature ceiling and its emergency
// shutoff proven. A residential pool has no lifeguard, which is why the gate,
// the drain covers and the staff on deck carry so much. Generic building —
// only the codes, the standards and the unions are named.

const PMPS_ACCENT = 0x3fb6d8;
const PMPS_CSS = "#3fb6d8";
const PMPS_WARN = "#f0645b";

export const SIM_PM_POOL_AND_SPA_CHEMISTRY = {
  id: "pm-pool-and-spa-chemistry",
  index: "229",
  domain: "Building Systems & Facilities",
  trade: "Pool operator and building engineer — IUOE Local 39 stationary engineers and SEIU building staff, UNITE HERE residential amenity staff on deck, and the apartment association's CAM and CAMT credentials",
  category: "Building Systems & Facilities",
  weather: "overcast",
  certification: "The state pool code's disinfectant, pH and water-temperature limits and the rescue equipment a residential pool keeps on deck; the Virginia Graeme Baker Pool and Spa Safety Act's anti-entrapment drain covers; CDC guidance on recreational water illness and pool chemical storage; OSHA 29 CFR 1910.1200 hazard communication, 29 CFR 1910.133 eye protection and ANSI Z358.1 eyewash in the chemical room; 29 CFR 1910.147 lockout on the recirculation pump; IUOE stationary engineer training for the pool plant, UNITE HERE for the amenity staff on deck, and the apartment association's CAM and CAMT credentials",
  name: "Pool & Spa Chemistry",
  title: simTitle("Pool & Spa Chemistry"),
  tagline: "The courtyard pool and spa: water tested and dosed to code, the pump locked out for its strainer, the filter backwashed to its gauge, the chemicals stored apart, and the spa held under its ceiling",
  accent: PMPS_ACCENT,
  accentCss: PMPS_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "clear-water", name: "Clear Water", note: "Tested to code, dosed by the feeder, two oxidisers kept apart, and the gate latched behind every child" },

  supportLine: "your union steward or member-assistance contact, or your employer's employee assistance program — a near-drowning is a call worth making afterwards",

  game: system({
    name: "Pool Deck",
    currency: "PPM",
    ranks: ["Deck Attendant", "Pool Tech", "Pool Operator", "Aquatics Lead", "Pool Plant Certified"],
    badges: [
      { id: "true-reading", name: "True Reading", note: "Free chlorine read inside the band first time", test: AWARD.stepClean("test-chlorine") },
      { id: "kept-apart", name: "Kept Apart", note: "No unsafe act anywhere on deck or in the chemical room", test: AWARD.safe },
      { id: "clean-backwash", name: "Clean Backwash", note: "Held the filter pressure in the band through the backwash", test: AWARD.stepClean("backwash-filter") },
    ],
    challenges: [
      { id: "clean-deck", name: "Clean Deck", note: "No corrections across the whole round", test: AWARD.clean },
      { id: "steady-gauge", name: "Steady Gauge", note: "Held the backwash without breaking the band", test: AWARD.unbroken },
      { id: "open-on-time", name: "Open On Time", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cal-hypo-into-trichlor": "You started scooping calcium hypochlorite shock into the trichlor erosion feeder. Those are two different chlorine chemistries, and together in a closed feeder they react violently — heat, chlorine gas and, in pool rooms, explosions that have put operators in hospital. Each goes only where its own label says, with its own scoop.",
    "water-into-acid": "You went to pour water into the bucket of muriatic acid. Water added to acid can boil at the surface and spit concentrated acid out of the bucket; acid goes slowly into water, never the other way, with goggles and gloves on and the eyewash in reach.",
    "filter-clamp-band": "You reached to loosen the filter tank's clamp band with the system still under pressure. A filter lid released under pressure leaves the tank with enough force to kill — the pump is off, the air relief valve open and the gauge at zero before that band is touched.",
    "shock-with-swimmers": "You went to broadcast granular shock across the pool with a resident still in the water. Undissolved shock and a spike of chlorine burn skin and eyes, and pool codes and good practice agree: superchlorination waits until the pool is closed and empty, and residents come back only after the level has fallen into the band.",
  },

  lateNotes: {
    "strainer-basket": "Not yet — the basket comes out only after the pump is locked out and the strainer lid is off.",
    "spa-thermometer": "Read the spa once the pool's own chemistry is in hand — the spa is next on the round, not before the test.",
  },

  steps: [
    {
      id: "read-pool-log", kind: "select", target: "pool-log",
      title: "Read the pool log and the posted rules",
      cue: "Check yesterday's readings, doses and bather load in the log before opening the deck.",
      why: "The chemistry of a pool this size moves with the weather and the number of residents who used it, and yesterday's readings and doses are what tell you whether this morning's number is normal or a problem. The state pool code asks for a written log because a trend — chlorine demand climbing every afternoon — shows up on paper long before it shows up as a sick resident.",
    },
    {
      id: "walk-the-deck", kind: "find", noHint: true,
      targets: ["gate-prop-chair", "drain-cover-cracked"],
      itemNames: { "gate-prop-chair": "chair propping the self-closing gate", "drain-cover-cracked": "cracked main drain cover" },
      itemNotes: {
        "gate-prop-chair": "A deck chair is holding the self-closing gate open. That gate is the only barrier between a toddler in the courtyard and deep water with nobody watching it.",
        "drain-cover-cracked": "The main drain cover has a crack across one corner. A damaged cover is exactly the entrapment hazard the federal drain-cover law was written about — the pool stays closed until it is replaced.",
      },
      title: "Walk the deck before it opens",
      cue: "Find what would let a child into the water or trap a swimmer at the bottom.",
      why: "A residential pool runs without a lifeguard, so the physical barriers are doing the watching: a self-closing, self-latching gate and a drain cover that cannot hold a body against the suction. A small child's drowning at a residential pool very often begins with a gate that did not close behind somebody, and an entrapment begins with a cover that was cracked or missing.",
    },
    {
      id: "test-chlorine", kind: "gauge", target: "fc-comparator",
      title: "Test free chlorine with the DPD kit",
      cue: "Match the comparator colour and commit when the reading sits inside the code's band.",
      why: "Free chlorine is what actually kills the germs residents bring in, and below the code's minimum a pool can spread diarrhoeal illness within a day. The DPD test reads the free fraction separately from the chlorine already used up, which is why it is read to a colour standard rather than eyeballed from a test strip on a sunny deck.",
      gauge: { label: "FREE CHLORINE", speed: 0.55, green: [0.3, 0.55], readout: (t) => `${(t * 6).toFixed(1)} ppm`, missNote: "Outside the code's band — too low and the pool stays closed until it's dosed, too high and residents' eyes and skin pay for it. Read the comparator again." },
    },
    {
      id: "set-feeder", kind: "turn", target: "feeder-dial",
      title: "Adjust the chlorinator feed rate",
      cue: "Turn the erosion feeder's dial to bring the dose in line with the reading.",
      why: "The feeder doses continuously through the recirculation line, so the dial — not a bucket over the edge — is how chlorine gets into the water evenly and without a resident ever meeting concentrated chemical. Adjusting the rate to the reading is also what keeps the level from swinging between a bleach bath at noon and nothing by evening.",
      turn: { turns: 0.5, axis: "z", label: "FEED RATE" },
    },
    {
      id: "lockout-pump", kind: "sequence",
      targets: ["pump-breaker", "pump-lock-hasp", "strainer-lid"],
      itemNames: { "pump-breaker": "pump breaker off", "pump-lock-hasp": "your lock and tag on it", "strainer-lid": "strainer lid off" },
      title: "Lock out the recirculation pump for its strainer",
      cue: "Breaker off, your lock and tag on, and only then take the strainer lid off.",
      why: "A pump's timer can restart it at any moment, and a strainer opened on a running pump sprays water and debris and can draw a hand towards a spinning impeller. Your lock on the breaker is what stops the timer, the resident who presses the spa button and the coworker who thinks the pool should be running.",
      outOfOrderNote: "Breaker, lock, then the lid — opening the strainer with the pump still able to start is exactly what the lock is for.",
    },
    {
      id: "empty-basket", kind: "drag", target: "strainer-basket",
      title: "Empty the strainer basket in the debris bin",
      cue: "Carry the strainer basket to the debris bin and empty it.",
      why: "A packed basket starves the pump of flow, and a starved pump turns over less water through the filter and the chlorinator — the chemistry you just set stops reaching the far end of the pool. Emptied into the bin rather than onto the deck, the leaves and hair stay out of the water and out from under residents' feet.",
      drag: { to: "debris-bin-slot", radius: 0.5, missNote: "Not in the bin — debris tipped on the deck ends up back in the gutter and the pool by lunchtime." },
    },
    {
      id: "backwash-filter", kind: "track", target: "filter-gauge", seconds: 7,
      title: "Backwash the filter and watch its gauge",
      cue: "Run the backwash and keep the filter pressure in the band until the sight glass runs clear.",
      why: "A filter's pressure rises as it loads with dirt, and the gauge's climb above its clean reading is what says it is time to backwash. Run too hard, the backwash lifts sand or tears the grids; stopped too early, the filter goes back on line half-clean and the water goes cloudy — a cloudy pool is one where nobody can see a swimmer on the bottom.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.44, fall: 0.38, drift: 0.1, label: "FILTER PRESSURE", readout: (v) => (v < 0.4 ? "starved" : v > 0.62 ? "over pressure" : "backwashing") },
      holdBreakNote: "The pressure left the band. Over pressure strains the tank and the clamp; starved means the valve isn't where it should be — bring it back.",
    },
    {
      id: "walk-chem-room", kind: "find", noHint: true,
      targets: ["acid-above-hypo", "eyewash-expired"],
      itemNames: { "acid-above-hypo": "acid jug on the shelf above the cal-hypo", "eyewash-expired": "eyewash bottles past their date" },
      itemNotes: {
        "acid-above-hypo": "The muriatic acid is stored on the shelf directly above the calcium hypochlorite. One leak or one knocked jug and acid drips onto an oxidiser — chlorine gas in a room with the door shut.",
        "eyewash-expired": "The sealed eyewash bottles are past their printed date. The emergency eyewash standard is about flushing within seconds of a splash, and a bottle nobody trusts is a bottle nobody uses.",
      },
      title: "Walk the chemical room",
      cue: "Find what turns a splash or a leak into an emergency.",
      why: "Pool chemical injuries are mostly storage and handling injuries: incompatible products shelved together, a splash with no working eyewash in reach. CDC's pool chemical guidance and the hazard communication standard both come back to the same point — the room has to be arranged so that the one bad day stays a small one.",
    },
    {
      id: "read-spa", kind: "gauge", target: "spa-thermometer",
      title: "Read the spa temperature",
      cue: "Watch the spa thermometer and commit when it holds under the code's ceiling.",
      why: "Hot water raises heart rate and drops blood pressure, and above the 104°F ceiling most state pool codes set, a resident with a heart condition, a pregnancy or a drink in them can faint in the water. The spa is read every round because its heater has no idea who is about to sit in it.",
      gauge: { label: "SPA TEMP", speed: 0.55, green: [0.4, 0.66], readout: (t) => `${Math.round(92 + t * 16)}°F`, missNote: "Over the ceiling or well under it — hot enough to faint in, or cold enough that residents crank it. Read it again." },
    },
    {
      id: "prove-spa-estop", kind: "hold", target: "spa-estop", seconds: 4,
      title: "Prove the spa's emergency shutoff",
      cue: "Press and hold the spa emergency shutoff until the jets and the heater both stop.",
      why: "The spa's emergency shutoff exists for a single moment — a child's hair drawn into a suction fitting — and in that moment the resident reaching for it has to find it and have it work. Holding it until the jets actually stop proves the switch, the relay and the pump all obey it, which a switch that has never been pressed cannot promise.",
      holdBreakNote: "You let go before the jets stopped. A shutoff that has not been proven to stop the pump is a switch nobody should trust in the moment it matters.",
    },
    {
      id: "adjust-gate-closer", kind: "turn", target: "gate-closer",
      title: "Set the gate closer so it self-closes and latches",
      cue: "Turn the closer's tension until the gate swings shut and latches on its own from full open.",
      why: "A gate that closes most of the way is a gate that stands open an inch, which is all a three-year-old needs. The state pool code asks for self-closing and self-latching for exactly that reason, and the closer is adjusted until the latch catches every time from full open with nobody's hand on it.",
      turn: { turns: 0.6, axis: "y", label: "CLOSER TENSION" },
    },
    {
      id: "crew-checkin", kind: "select", target: "attendant-checkin",
      title: "Check in with the amenity attendant",
      cue: "Hand over the drain cover closure and the gate, and ask how the attendant is doing after the morning.",
      why: "The UNITE HERE amenity attendant is the one on the deck all afternoon, answering residents who want to know why the pool is closed and watching the gate you just fixed. A handover in person gives them the words to explain the drain cover, and a morning that included a child at the water's edge is worth asking about, not just logging.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Enter the round in the building log",
      cue: "Log the readings, the feed rate, the backwash, the chemical room findings and the closure.",
      why: "The pool log is a record the health inspector reads, the next operator relies on and the building's insurer asks for after an incident. Readings with times, doses with amounts and a closure with its reason are what make it a record rather than a column of ticks, and IUOE practice treats an unlogged test as an untested pool.",
    },
  ],

  interrupts: [
    {
      id: "child-at-edge",
      kind: "Child alone at the pool edge",
      after: "backwash-filter", delay: 3, seconds: 12,
      alert: "While you run the backwash, a small child has come through the gate on her own and is standing at the deep-end edge.",
      cue: "Walk her back out and latch the gate behind her. Let the backwash valve sit — the child comes first.",
      target: "gate-latch",
      why: "Drowning is silent and fast, and a small child alone at the edge of deep water is seconds from it — nothing on the filter is worth those seconds. Walking her back out and latching the gate also finds her parent, and it tells you the gate still is not doing its job.",
      missNote: "She stood at the edge the whole window while the backwash ran. Nobody on the deck moved, and the gate she came through is still open behind her.",
      wrongNote: "That doesn't get her away from the water. Walk her back through the gate and latch it behind her.",
    },
    {
      id: "thunder-clear",
      kind: "Thunder — clear the pool",
      after: "prove-spa-estop", delay: 2, seconds: 12,
      alert: "Thunder rolls over the courtyard while you hold the spa shutoff — and a resident is still swimming laps.",
      cue: "Clear the pool: hang the pool-closed sign and call the swimmer out. Don't wait to see the lightning.",
      target: "pool-closed-sign",
      why: "Water and a metal-railed deck are the worst place to be in a thunderstorm, and if you can hear thunder you are within striking distance. The property's lightning policy clears the pool at the first rumble and keeps it closed until the storm has passed — waiting for a flash to be sure is how swimmers get caught in the water.",
      missNote: "The resident kept swimming through the thunder the whole window. The pool stayed open in a storm because nobody closed it.",
      wrongNote: "That doesn't clear the water. Hang the pool-closed sign and call the swimmer out — the storm won't wait.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PMPS_ACCENT);

    // ------------------------------------------------------------ deck paving
    const deckTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#d9cfbd", base2: "#cdc2ae", seam: "rgba(80,70,50,0.3)" }), { repeat: 5, px: 384 });
    const deck = box(g, 7.0, 0.04, 5.6, 0, 0.02, -0.4, 0xd9cfbd, { rough: 0.8 });
    deck.material = texturedMat(deckTex, { rough: 0.8, metal: 0.02, color: 0xe0d6c4 });

    // ------------------------------------------------------------ the pool
    const pool = group(g, -1.2, 0, -1.5);
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#1f8fb0", mid: "#27a4c4", base2: "#1a7f9f" }), { repeat: 3, px: 256 });
    const water = box(pool, 3.2, 0.02, 1.8, 0, 0.045, 0, 0x2aa3c4, { rough: 0.1 });
    water.material = texturedMat(waterTex, { rough: 0.08, metal: 0.1, color: 0xbfeaf5 });
    // Coping stones around the edge.
    for (const sz of [-1, 1]) box(pool, 3.5, 0.08, 0.15, 0, 0.06, sz * 0.975, 0xefe8da, { rough: 0.7 });
    for (const sx of [-1, 1]) box(pool, 0.15, 0.08, 1.8, sx * 1.675, 0.06, 0, 0xefe8da, { rough: 0.7 });
    // Tile band and lane line under the surface.
    box(pool, 3.1, 0.004, 0.04, 0, 0.038, 0, 0x1b4f7a, { rough: 0.5, cast: false });
    // Depth markers on the coping.
    decal(pool, 0.22, 0.08, -1.3, 0.105, 0.98, signFace("3 FT", { bg: "#efe8da", accent: "#1b4f7a", fg: "#1b4f7a", scale: 0.6 }), { px: 96 }).rotation.x = -Math.PI / 2;
    decal(pool, 0.22, 0.08, 1.3, 0.105, 0.98, signFace("6 FT", { bg: "#efe8da", accent: "#1b4f7a", fg: "#1b4f7a", scale: 0.6 }), { px: 96 }).rotation.x = -Math.PI / 2;
    // Ladder rails at the deep end.
    for (const sx of [-0.2, 0.2]) torus(pool, 0.16, 0.015, 1.2 + sx, 0.25, -0.84, CITY.steel, { rough: 0.25, metal: 0.9, seg: 6, seg2: 16 }).rotation.y = Math.PI / 2;
    // Main drain cover, seen through the water, with the crack.
    const drainCover = group(pool, 1.0, 0.05, 0.0);
    box(drainCover, 0.34, 0.006, 0.34, 0, 0, 0, 0x2c3a44, { rough: 0.6 });
    box(drainCover, 0.2, 0.008, 0.012, 0.08, 0.002, 0.08, 0xdfe4e8, { rough: 0.6 }).rotation.y = 0.7;
    reg(hits, drainCover, "drain-cover-cracked");
    holoTag(pool, "main drain", 1.0, 0.24, 0.0, { css: PMPS_CSS, w: 0.22 });
    // The swimmer doing laps.
    const swimmer = standingPerson(pool, -0.4, 0.3, { ry: Math.PI / 2, cloth: 0xc84a4a, hiVis: false });
    swimmer.root.position.y = -1.05;
    // Shock bag at the edge (hazard with a swimmer in).
    const shockBag = group(g, 0.55, 0, -0.45);
    box(shockBag, 0.26, 0.34, 0.12, 0, 0.17, 0, 0xe8e2d0, { rough: 0.8 });
    decal(shockBag, 0.2, 0.1, 0, 0.22, 0.062, signFace("SHOCK", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.5 }), { px: 128 });
    holoTag(shockBag, "broadcast it now?", 0, 0.5, 0, { css: PMPS_WARN, w: 0.34 });
    reg(hits, shockBag, "shock-with-swimmers");

    // ------------------------------------------------------------ spa
    const spa = group(g, 1.6, 0, -1.9);
    cyl(spa, 0.75, 0.75, 0.1, 0, 0.05, 0, 0xefe8da, { rough: 0.7, seg: 28 });
    const spaWater = cyl(spa, 0.62, 0.62, 0.02, 0, 0.1, 0, 0x5cc8e0, { rough: 0.1, opacity: 0.85, transparent: true, seg: 28 });
    void spaWater;
    const bubbles = particles(spa, 24, 0xeaf8ff, { size: 0.03, life: 0.5, additive: false, opacity: 0.6 });
    const spaThermo = decal(spa, 0.2, 0.1, 0, 0.35, 0.78, signFace("-- °F", { bg: "#0d1c24", accent: PMPS_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.8, px: 192 });
    reg(hits, spaThermo, "spa-thermometer");
    box(spa, 0.06, 0.3, 0.04, 0, 0.15, 0.77, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const estopPost = group(g, 2.55, 0, -1.1);
    cyl(estopPost, 0.035, 0.035, 1.2, 0, 0.6, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 10 });
    const estop = group(estopPost, 0, 1.25, 0.03);
    box(estop, 0.16, 0.16, 0.06, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const estopBtn = cyl(estop, 0.05, 0.05, 0.04, 0, 0, 0.04, 0xd8232a, { rough: 0.4, seg: 16 });
    estopBtn.rotation.x = Math.PI / 2;
    reg(hits, estop, "spa-estop");
    holoTag(estopPost, "spa emergency shutoff", 0, 1.48, 0.04, { css: PMPS_CSS, w: 0.4 });

    // ------------------------------------------------------------ fence and gate
    const fence = group(g, 0, 0, 0.35);
    box(fence, 5.6, 0.04, 0.04, -0.6, 1.2, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    box(fence, 5.6, 0.04, 0.04, -0.6, 0.1, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 29; i++) {
      const x = -3.4 + i * 0.2;
      if (x > -1.0 && x < -0.1) continue;       // the gate opening
      box(fence, 0.02, 1.1, 0.02, x, 0.65, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    }
    const gate = group(fence, -1.0, 0, 0);
    const gateLeaf = group(gate, 0, 0, 0);
    box(gateLeaf, 0.9, 0.04, 0.04, 0.45, 1.2, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    box(gateLeaf, 0.9, 0.04, 0.04, 0.45, 0.1, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    for (let i = 1; i < 5; i++) box(gateLeaf, 0.02, 1.1, 0.02, i * 0.18, 0.65, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    gateLeaf.rotation.y = -1.2;                     // propped open
    const latch = group(fence, -0.08, 1.12, 0.03);
    box(latch, 0.08, 0.12, 0.05, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    reg(hits, latch, "gate-latch");
    holoTag(fence, "self-latching gate", -0.55, 1.42, 0.03, { css: PMPS_CSS, w: 0.34 });
    const closer = group(gate, 0.05, 1.0, 0.04);
    cyl(closer, 0.025, 0.025, 0.2, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 10 });
    const closerCap = box(closer, 0.04, 0.02, 0.04, 0, 0.11, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, closer, "gate-closer");
    const chair = group(g, -0.95, 0, 0.6, 0.4);
    box(chair, 0.5, 0.05, 0.6, 0, 0.35, 0, 0xf4f4f0, { rough: 0.6 });
    box(chair, 0.5, 0.5, 0.05, 0, 0.6, -0.28, 0xf4f4f0, { rough: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(chair, 0.03, 0.35, 0.03, sx * 0.22, 0.17, sz * 0.26, 0xdfe4e8, { rough: 0.6 });
    reg(hits, chair, "gate-prop-chair");
    const closedSign = decal(fence, 0.5, 0.3, -2.2, 0.9, 0.04, paperFace("POOL CLOSED", ["Lightning policy", "Reopens 30 min", "after last thunder"], { bg: "#fff2d6", band: "#b8402f" }), { px: 256 });
    closedSign.visible = false;
    const closedSignHook = group(fence, -2.2, 0.9, 0.05);
    box(closedSignHook, 0.52, 0.32, 0.01, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, closedSignHook, "pool-closed-sign");
    holoTag(fence, "pool-closed sign hook", -2.2, 1.14, 0.04, { css: PMPS_CSS, w: 0.34 });
    const rules = decal(fence, 0.55, 0.42, 1.4, 0.8, 0.04, paperFace("POOL RULES", ["No lifeguard on duty", "Swim at your own risk", "Spa max 104°F · 15 min", "Emergency: 911 · phone"], { bg: "#eef6fa", band: "#1b4f7a" }), { px: 256 });
    void rules;
    const warnBeacon = ball(g, 0.07, 2.55, 1.46, -1.1, 0x3a4450, { rough: 0.4, seg: 12 });
    const warnOn = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 1.8, rough: 0.3 });
    const warnIdle = warnBeacon.material;

    // Rescue post: ring buoy and shepherd's crook.
    const rescue = group(g, -3.0, 0, -0.35);
    cyl(rescue, 0.03, 0.03, 1.8, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    torus(rescue, 0.2, 0.05, 0, 1.4, 0.06, 0xf06a3a, { rough: 0.6, seg: 10, seg2: 22 });
    cyl(rescue, 0.015, 0.015, 1.7, 0.1, 0.9, 0.04, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 6 });

    // ------------------------------------------------------------ equipment and chemical room
    const room = group(g, 2.6, 0, 0.9, -0.5);
    box(room, 1.6, 0.05, 1.3, 0, 0.03, 0, 0x6a7075, { rough: 0.8 });
    box(room, 1.6, 2.2, 0.06, 0, 1.1, -0.65, 0xbfc6cb, { rough: 0.8 });
    box(room, 0.06, 2.2, 1.3, 0.8, 1.1, 0, 0xbfc6cb, { rough: 0.8 });
    // Pump with strainer pot and lid.
    const pump = group(room, -0.45, 0, -0.3);
    cyl(pump, 0.14, 0.14, 0.4, 0, 0.3, 0, 0x2f6fb0, { rough: 0.4, metal: 0.4, seg: 16 }).rotation.z = Math.PI / 2;
    cyl(pump, 0.13, 0.13, 0.24, -0.3, 0.32, 0, 0x3a4450, { rough: 0.5, seg: 16 });
    const strainerLid = cyl(pump, 0.14, 0.14, 0.04, -0.3, 0.46, 0, 0x9fc8e6, { rough: 0.2, opacity: 0.8, transparent: true, seg: 16 });
    reg(hits, strainerLid, "strainer-lid");
    const basket = group(pump, -0.3, 0.52, 0.28);
    cyl(basket, 0.1, 0.09, 0.14, 0, 0, 0, 0x3a4450, { rough: 0.6, seg: 12, open: true });
    ball(basket, 0.06, 0, 0.03, 0, 0x6b7a3a, { rough: 0.9, seg: 8 });
    reg(hits, basket, "strainer-basket");
    // Filter tank with gauge and clamp band.
    const filter = group(room, 0.25, 0, -0.3);
    cyl(filter, 0.24, 0.24, 0.9, 0, 0.5, 0, 0x2b5a7a, { rough: 0.4, metal: 0.3, seg: 18 });
    const clamp = torus(filter, 0.245, 0.02, 0, 0.8, 0, 0x8b929a, { rough: 0.4, metal: 0.8, seg: 8, seg2: 24 });
    clamp.rotation.x = Math.PI / 2;
    reg(hits, clamp, "filter-clamp-band");
    holoTag(filter, "loosen the clamp?", 0, 1.06, 0.26, { css: PMPS_WARN, w: 0.32 });
    const fGauge = group(filter, 0, 1.0, 0.1);
    cyl(fGauge, 0.06, 0.06, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.3, seg: 16 }).rotation.x = Math.PI / 2;
    const fNeedle = box(fGauge, 0.005, 0.05, 0.004, 0, 0.015, 0.018, 0xd8232a, { rough: 0.4 });
    reg(hits, fGauge, "filter-gauge");
    // Erosion feeder (trichlor) with dial.
    const feeder = group(room, 0.6, 0, 0.15);
    cyl(feeder, 0.1, 0.1, 0.5, 0, 0.25, 0, 0xe6e6de, { rough: 0.4, seg: 14 });
    const dial = group(feeder, 0, 0.52, 0);
    cyl(dial, 0.06, 0.06, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 14 });
    const dialPtr = box(dial, 0.008, 0.01, 0.05, 0, 0.02, 0.02, 0xf2c14b, { rough: 0.4 });
    reg(hits, dial, "feeder-dial");
    holoTag(feeder, "trichlor feeder", 0, 0.72, 0.1, { css: PMPS_CSS, w: 0.28 });
    hose(room, [[-0.25, 0.3, -0.3], [0.1, 0.2, -0.1], [0.6, 0.15, 0.15]], 0.025, 0x9aa2a8, { steps: 12 });
    // Breaker and lock hasp on the side wall.
    const bpanel = group(room, 0.76, 1.3, 0.3, -Math.PI / 2);
    box(bpanel, 0.3, 0.4, 0.08, 0, 0, 0, 0x7a838c, { rough: 0.5, metal: 0.4 });
    const pBreaker = box(bpanel, 0.06, 0.04, 0.03, 0, 0.08, 0.05, 0x2b3138, { rough: 0.5 });
    reg(hits, pBreaker, "pump-breaker");
    const pHasp = torus(bpanel, 0.018, 0.005, 0, -0.04, 0.05, CITY.steel, { rough: 0.3, metal: 0.9 });
    reg(hits, pHasp, "pump-lock-hasp");
    const pLock = lockTag(bpanel, 0, -0.04, 0.07);
    pLock.visible = false;
    // Chemical shelf: acid above cal-hypo (find), trichlor bucket and the scoop.
    const shelf = group(room, -0.35, 0, 0.45);
    for (const y of [0.4, 0.95]) box(shelf, 0.7, 0.03, 0.3, 0, y, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) box(shelf, 0.03, 1.0, 0.3, sx * 0.34, 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const acid = group(shelf, -0.15, 0.97, 0);
    cyl(acid, 0.07, 0.07, 0.28, 0, 0.14, 0, 0xf2e27a, { rough: 0.4, seg: 12 });
    decal(acid, 0.1, 0.06, 0, 0.14, 0.072, signFace("ACID", { bg: "#1b1e22", accent: "#f0645b", scale: 0.5 }), { px: 96 });
    reg(hits, acid, "acid-above-hypo");
    const calhypo = cyl(shelf, 0.12, 0.12, 0.3, -0.12, 0.57, 0, 0xf4f4f0, { rough: 0.5, seg: 14 });
    decal(calhypo, 0.14, 0.07, 0, 0.05, 0.122, signFace("CAL-HYPO", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.42 }), { px: 128 });
    const scoop = group(shelf, 0.18, 0.43, 0.05);
    box(scoop, 0.12, 0.04, 0.08, 0, 0.02, 0, 0xf2c14b, { rough: 0.5 });
    box(scoop, 0.02, 0.02, 0.14, 0, 0.03, -0.1, 0xf2c14b, { rough: 0.5 });
    holoTag(shelf, "scoop into the feeder?", 0.18, 0.62, 0.1, { css: PMPS_WARN, w: 0.4 });
    reg(hits, scoop, "cal-hypo-into-trichlor");
    const acidBucket = group(room, -0.7, 0, 0.3);
    cyl(acidBucket, 0.13, 0.11, 0.26, 0, 0.13, 0, 0xdfe4e8, { rough: 0.5, seg: 12 });
    box(acidBucket, 0.08, 0.14, 0.05, 0.2, 0.3, 0, 0x8fd1ff, { rough: 0.3, opacity: 0.7, transparent: true });
    holoTag(acidBucket, "water into the acid?", 0, 0.46, 0.05, { css: PMPS_WARN, w: 0.36 });
    reg(hits, acidBucket, "water-into-acid");
    const eyewash = group(room, 0.76, 1.0, -0.2, -Math.PI / 2);
    box(eyewash, 0.28, 0.3, 0.1, 0, 0, 0, 0x2f8a3c, { rough: 0.5 });
    for (const sx of [-1, 1]) cyl(eyewash, 0.04, 0.04, 0.2, sx * 0.07, 0, 0.08, 0xeef3f6, { rough: 0.3, seg: 10 });
    reg(hits, eyewash, "eyewash-expired");
    holoTag(eyewash, "eyewash bottles", 0, 0.22, 0.06, { css: PMPS_CSS, w: 0.28 });
    // Debris bin just outside the room.
    const bin = group(g, 1.25, 0, 1.25);
    cyl(bin, 0.22, 0.2, 0.6, 0, 0.3, 0, 0x3a5a3a, { rough: 0.6, seg: 14 });
    const binSlot = box(bin, 0.3, 0.05, 0.3, 0, 0.62, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["debris-bin-slot"] = binSlot;
    holoTag(bin, "debris bin", 0, 0.8, 0, { css: PMPS_CSS, w: 0.2 });

    // ------------------------------------------------------------ test kit table and log
    const table = group(g, -2.3, 0, 1.2);
    cyl(table, 0.4, 0.4, 0.04, 0, 0.72, 0, 0xf4f4f0, { rough: 0.5, seg: 20 });
    cyl(table, 0.03, 0.03, 0.72, 0, 0.36, 0, 0xdfe4e8, { rough: 0.5, seg: 8 });
    const comparator = group(table, 0.05, 0.75, 0);
    box(comparator, 0.2, 0.12, 0.06, 0, 0.06, 0, 0xf4f8fb, { rough: 0.3, opacity: 0.9, transparent: true });
    const fcVial = cyl(comparator, 0.02, 0.02, 0.1, -0.05, 0.06, 0.035, 0xf2b8c8, { rough: 0.2, opacity: 0.85, transparent: true, seg: 10 });
    cyl(comparator, 0.02, 0.02, 0.1, 0.05, 0.06, 0.035, 0xf2d8a0, { rough: 0.2, opacity: 0.85, transparent: true, seg: 10 });
    const fcReadout = decal(comparator, 0.18, 0.06, 0, 0.17, 0.03, signFace("FC --", { bg: "#0d1c24", accent: PMPS_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.8, px: 192 });
    reg(hits, comparator, "fc-comparator");
    holoTag(table, "DPD test kit", 0, 1.08, 0, { css: PMPS_CSS, w: 0.26 });
    const poolLog = decal(table, 0.2, 0.26, -0.18, 0.75, 0.1, paperFace("POOL LOG", ["Yest. FC 2.4 · pH 7.5", "Bathers 31", "Dose 2 lb trichlor", "Backwash due"], { bg: "#f4efe0", band: "#1b4f7a" }), { px: 192 });
    poolLog.rotation.x = -Math.PI / 2;
    reg(hits, poolLog, "pool-log");
    const logBoard = holoPanel(g, 0.56, 0.38, -2.9, 1.6, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMPS_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e6f6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · POOL & SPA", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#c4e4ee";
      ["FC · pH · spa °F · times", "feed rate · backwash", "chem room findings", "closure: drain cover"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: 0.6, accent: PMPS_ACCENT });
    reg(hits, logBoard, "building-log");

    // Lounge chairs and an umbrella for the deck.
    for (let i = 0; i < 2; i++) {
      const lc = group(g, 0.2 + i * 0.8, 0, 1.55, 0.1);
      box(lc, 0.55, 0.06, 1.4, 0, 0.3, 0, 0xf4f4f0, { rough: 0.6 });
      box(lc, 0.55, 0.06, 0.5, 0, 0.5, -0.6, 0xf4f4f0, { rough: 0.6 }).rotation.x = 0.8;
    }
    const umbrella = group(g, -2.3, 0, 1.2);
    cyl(umbrella, 0.02, 0.02, 2.1, 0, 1.05, 0, 0xdfe4e8, { rough: 0.5, seg: 6 });
    cyl(umbrella, 0.01, 1.0, 0.3, 0, 2.2, 0, 0x2f6f8c, { rough: 0.8, seg: 10 });

    // ------------------------------------------------------------ crew
    const attendant = standingFigure(g, -1.7, 1.95, { ry: 2.8, cloth: 0x2f6f8c, trousers: 0x2b3138, cap: 0xf4f4f0 });
    reg(hits, attendant, "attendant-checkin");
    // The child for the interruption — hidden until it fires.
    const child = standingPerson(g, 0.1, -0.5, { ry: Math.PI, cloth: 0xf2a0c0, hiVis: false });
    child.root.scale.set(0.55, 0.55, 0.55);
    child.root.visible = false;

    let storm = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.4, 0.6, -1.2),

      onStepComplete(step) {
        if (step.id === "walk-the-deck") { chair.position.set(-2.4, 0, 1.9); gateLeaf.rotation.y = 0; }
        if (step.id === "test-chlorine") repaint(fcReadout, signFace("FC OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "set-feeder") dialPtr.rotation.y = 0.9;
        if (step.id === "lockout-pump") { pLock.visible = true; strainerLid.visible = false; }
        if (step.id === "empty-basket") basket.visible = false;
        if (step.id === "backwash-filter") { fNeedle.rotation.z = 0.3; basket.visible = true; strainerLid.visible = true; pLock.visible = false; }
        if (step.id === "walk-chem-room") acid.position.set(-0.15, 0.02, 0.5);
        if (step.id === "read-spa") repaint(spaThermo, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "adjust-gate-closer") closerCap.rotation.y = 1.2;
      },

      onInterrupt(it) {
        if (it.id === "child-at-edge") { child.root.visible = true; gateLeaf.rotation.y = -1.0; }
        if (it.id === "thunder-clear") { storm = true; warnBeacon.material = warnOn; }
      },
      onInterruptEnd(it) {
        if (it.id === "child-at-edge" && it.resolved === "answered") { child.root.position.set(-1.2, 0, 1.2); gateLeaf.rotation.y = 0; }
        if (it.id === "child-at-edge" && it.resolved !== "answered") child.root.visible = false;
        if (it.id === "thunder-clear") {
          storm = false; warnBeacon.material = warnIdle;
          if (it.resolved === "answered") { closedSign.visible = true; swimmer.root.visible = false; }
        }
      },

      animate(t, dt, session) {
        if (waterTex.offset) waterTex.offset.x = (t * 0.01) % 1;
        bubbles.visible = true;
        bubbles.userData?.step?.(dt, new THREE.Vector3(0, 0.1, 0), 0.9, 0.2, 0.1);
        if (swimmer.root.visible) swimmer.root.position.x = -0.4 + Math.sin(t * 0.3) * 0.9;
        if (storm) warnBeacon.visible = Math.sin(t * 9) > -0.2; else warnBeacon.visible = true;
        attendant.userData.head.rotation.y = Math.sin(t * 0.4) * 0.35;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "test-chlorine") { repaint(fcReadout, signFace(`FC ${(gg.t * 6).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t >= 0.3 && gg.t <= 0.55 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 })); fcVial.scale.y = 0.6 + gg.t * 0.6; }
          if (session.step?.id === "read-spa") repaint(spaThermo, signFace(`${Math.round(92 + gg.t * 16)}°F`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.66 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (session?.track && session.step?.id === "backwash-filter") fNeedle.rotation.z = 0.9 - session.track.v * 1.8;
      },
    };
  },
};
