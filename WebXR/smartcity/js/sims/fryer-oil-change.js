import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fryer Oil Change VR — its own gamified system: Line Certified.
// A deep fryer's scheduled oil change in a working commercial kitchen under
// UNITE HERE Local 2: the vat drained cold into a caddy, boiled out, hauled to
// the rendering bin, and refilled with the element covered before the heat
// ever comes back on. Nothing here is exotic — it is a job every fry cook
// does on a schedule, and it is also the single most common way a kitchen
// hands somebody a scald.

const FOC_AMBER = 0xf2ae14;

export const SIM_FRYER_OIL_CHANGE = {
  id: "fryer-oil-change",
  index: "104",
  domain: "Culinary",
  trade: "Line cook — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  weather: "clear",
  certification: "UNITE HERE Local 2 kitchen safety training; the California Retail Food Code (used-oil handling and equipment cleaning as adopted from the FDA Food Code); Cal/OSHA General Industry Safety Orders on personal protective equipment and slip hazards, and OSHA 29 CFR 1910.132/1910.22; NSF/ANSI 4 commercial cooking equipment; the fryer manufacturer's cool-down and boil-out procedure",
  name: "Fryer Oil Change",
  title: simTitle("Fryer Oil Change"),
  tagline: "Cold vat, caddy not a bucket, boil-out, the dry route to the rendering bin, and a covered element before the heat goes back on",
  accent: FOC_AMBER,
  accentCss: "#f2ae14",
  parSeconds: 260,
  footprint: 2.2,
  badge: { id: "line-certified", name: "Line Certified", note: "A full oil change with the vat cold, the caddy used, the route dry and the element covered before power" },

  game: system({
    name: "Line Certified",
    currency: "FRY",
    ranks: ["Prep Cook", "Line Cook", "Station Lead", "Sous Chef", "Line Certified"],
    badges: [
      { id: "cold-vat", name: "Cold Vat", note: "Never touched the drain before the oil read safe", test: AWARD.safe },
      { id: "dry-route", name: "Dry Route", note: "Held the drain and the mop pass clean, no corrections", test: AWARD.clean },
      { id: "element-covered", name: "Element Covered", note: "Covered the element before the heat went back on, every time", test: AWARD.stepClean("cover-element") },
    ],
    challenges: [
      { id: "shift-change", name: "Shift Change", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "steady-hand", name: "Steady Hand", note: "Held the fill line and the mop pass without a single dropout", test: AWARD.unbroken },
      { id: "line-streak", name: "Line Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "bucket-decoy": "That is a mop bucket, not the wheeled oil caddy. Oil off this drain is still within a few degrees of scalding when the plan calls it safe to move, and a bucket has no lid, no wheel and nothing stopping it tipping the moment a boot catches its rim — the caddy is a sealed, wheeled tank built to take that heat between the fryer and the rendering bin, and it is the only container this job uses.",
    "carried-bucket": "That bucket is full and somebody is about to carry it by hand across the line. Hot oil in an open container held at arm's length has no lid holding it level and no wheels absorbing a stumble, and a spill from carrying height lands on feet, not floor. Cal/OSHA's walking-working-surface rules exist for exactly this kind of load — wheel it, never carry it.",
    "wet-floor-hazard": "That slick by the fryer is still wet. Quarry tile with a film of fryer oil on it has close to the grip of wet ice, and the next person through here is carrying either hot oil or a full basket. The floor gets dried before the station is called finished, not left for whoever crosses it next to discover.",
    "exposed-element": "The heating element is still bare — no oil covering it and no guard over it. Energizing a fryer element with nothing over it dry-fires the coil toward burnout in seconds and, with any residual oil vapor still in the vat, gives that vapor an ignition source it would not otherwise have. The element gets covered by fresh oil before the switch is touched, not after.",
  },

  lateNotes: {
    "fryer-power": "The power switch matters twice in this job: it goes off before anything else moves, and it does not go back on until the element is covered and the vat is full to the line.",
    "oil-caddy": "The caddy only matters once the vat has actually read cold on the thermometer — position it against a fryer that is still confirmed hot and you are lining up a scald for the moment the valve opens.",
  },

  steps: [
    {
      id: "odor-call", kind: "select", target: "service-plan",
      title: "Read the service ticket",
      cue: "Confirm which fryer, which oil grade, and which boil-out chemical the ticket calls for.",
      why: "Two fryers on the same line can run different oils and different boil-out chemicals, and the ticket is what tells you which is which — working from memory on a busy line is how the wrong chemical ends up soaking a stainless vat it was never rated for.",
    },
    {
      id: "power-off", kind: "select", target: "fryer-power",
      title: "Shut the fryer off",
      cue: "Kill the fryer at its power switch before anything else moves.",
      why: "Nothing about this job — not the drain, not the caddy, not the boil-out — happens with the fryer still calling for heat. Shutting it off first is what makes every reading you take after this point actually mean something, instead of chasing a temperature the burner is still adding to.",
    },
    {
      id: "cooldown", kind: "gauge", target: "oil-thermometer",
      title: "Confirm the oil has cooled",
      cue: "Watch the vat thermometer and commit once it reads inside the plan's safe-to-drain band.",
      why: "Fryer oil at cooking temperature is close to 350°F, and oil at that heat splashes through a sleeve and blisters skin on contact — the plan's cool-down band exists because the drain valve and the caddy are both rated for a specific temperature ceiling, not for whatever the vat happens to read when somebody feels like starting.",
      gauge: {
        label: "FRYER VAT — OIL TEMPERATURE", speed: 0.55, green: [0.0, 0.16],
        readout: (t) => `${Math.round(90 + t * 300)}°F`,
        missNote: "Still too hot to drain. Give it more time on the cooldown — the drain valve and the caddy are not rated for oil at this temperature.",
      },
    },
    {
      id: "ppe", kind: "sequence",
      targets: ["burn-apron", "burn-sleeves", "face-shield", "thermal-gloves"],
      itemNames: { "burn-apron": "heat-resistant apron", "burn-sleeves": "sleeve guards", "face-shield": "face shield", "thermal-gloves": "thermal gloves" },
      title: "Don the burn PPE",
      cue: "Apron, then sleeve guards, then face shield, then the thermal gloves last.",
      why: "The gloves go on last because everything before them needs bare fingers to fasten straps and buckles, and putting them on first just means peeling them off again for the apron ties. Every piece is on before the drain valve is touched — a splash you did not expect is the whole reason this order exists.",
      outOfOrderNote: "Wrong order — apron, sleeves and face shield go on first while your hands are still free to fasten them, and the thermal gloves go on last.",
    },
    {
      id: "caddy-position", kind: "select", target: "oil-caddy",
      title: "Roll the oil caddy into place",
      cue: "Position the wheeled caddy directly under the drain, not a bucket.",
      why: "The caddy is a sealed, wheeled tank sized for exactly this vat, and it is the only container this drain ever runs into. A bucket set under the same valve holds the same oil at the same temperature with none of the caddy's lid, wheels or capacity margin.",
    },
    {
      id: "open-drain", kind: "turn", target: "drain-valve",
      title: "Open the drain valve",
      cue: "Turn the drain valve handle to fully open and let the vat empty into the caddy.",
      turn: { turns: 0.6, axis: "z", label: "FRYER DRAIN VALVE" },
      why: "A drain valve stopped part way still passes oil, just slower and less predictably, and a slow stream is exactly what lets it wander off the caddy's inlet. Take the handle all the way to its stop so the flow is a straight line into the tank you positioned for it.",
    },
    {
      id: "drain-hold", kind: "hold", target: "oil-caddy", seconds: 7,
      title: "Hold the caddy under the flow",
      cue: "Stay at the caddy while the vat empties completely — do not walk away mid-drain.",
      why: "Oil coming off a full vat does not run at a constant rate — it surges as pockets of sediment and breading debris clear the strainer, and a caddy left unattended under a surging drain is how oil ends up on the floor around it instead of inside the tank. Staying at the caddy is what catches that the moment it happens.",
      holdBreakNote: "You stepped away before the vat finished draining. Get back to the caddy — an unattended drain is exactly when a surge overshoots the tank.",
    },
    {
      id: "boilout-chem", kind: "find", noHint: true,
      targets: ["boilout-correct"],
      itemNames: { "boilout-correct": "the fryer boil-out solution" },
      itemNotes: { "boilout-correct": "This is the boil-out chemical the ticket named — formulated to lift carbonized oil off stainless without pitting it." },
      decoyNotes: {
        "shelf-degreaser": "That's the floor degreaser. It is not rated for a stainless vat and the ticket did not call for it — leave it on the shelf.",
        "shelf-bleach": "That's chlorine bleach. Mixed with the wrong residue on a vat wall it can generate a chlorine gas hazard, and it has no business anywhere near this boil-out — leave it exactly where it is.",
      },
      title: "Find the correct boil-out chemical",
      cue: "Three bottles are on the shelf. Take the one the ticket actually called for.",
      why: "A boil-out chemical is matched to the vat's metal and to the specific baked-on residue it is meant to lift, and the shelf next to it holds two other chemicals that are wrong for entirely different reasons — reading the label against the ticket is the only step between the right bottle and a ruined vat.",
    },
    {
      id: "vat-scrub", kind: "hold", target: "vat-scrub", seconds: 6,
      title: "Boil out the vat",
      cue: "Work the brush over the vat walls and hold through the chemical's full contact time.",
      why: "A boil-out only lifts carbonized oil off the vat wall if the chemical stays in contact long enough to do its job, and pulling the brush away early just spreads a half-dissolved film around instead of removing it — the vat gets scrubbed for the full time the label calls for, not until it looks close enough.",
      holdBreakNote: "You stopped scrubbing before the boil-out finished working. A vat wiped down early still carries the carbonized film the fresh oil would have to burn through again — hold the full contact time.",
    },
    {
      id: "caddy-haul", kind: "drag", target: "oil-caddy",
      title: "Wheel the caddy to the rendering bin",
      cue: "Roll the caddy along the dry route to the rendering bin — do not cross the anti-fatigue mats.",
      drag: { to: "rendering-bin", radius: 0.55, missNote: "Not lined up with the rendering bin yet — keep the caddy on the dry route and bring it in against the intake." },
      why: "A loaded caddy rolling over the seam of a raised anti-fatigue mat can catch a wheel and tip, which is exactly the failure this whole procedure has been built to avoid since the vat was drained — the dry route around the mats exists because used oil at rest is still hot enough to matter for a good while after it leaves the vat.",
    },
    {
      id: "fill-line", kind: "gauge", target: "oil-jug",
      title: "Fill fresh oil to the line",
      cue: "Pour the fresh oil and commit once the level sits at the fill mark.",
      gauge: {
        label: "FRESH OIL — FILL LEVEL", speed: 0.5, green: [0.46, 0.6],
        readout: (t) => `${Math.round(t * 100)}% of vat`,
        missNote: "Not at the fill line. Underfilled oil overheats fast around exposed heating surfaces; overfilled oil displaces and spills the moment a basket goes in.",
      },
      why: "The fill line is not a suggestion — the manufacturer set it to the volume that keeps oil circulating past the heating element instead of scorching against it, and it is also the margin that keeps a lowered basket from displacing oil over the rim onto a hot cabinet.",
    },
    {
      id: "cover-element", kind: "select", target: "element-cover",
      title: "Confirm the element is covered",
      cue: "Check that the fresh oil fully covers the heating element before power goes back on.",
      why: "An element sitting above the oil line dry-fires the instant it is energized, and it does that in seconds, not minutes — NSF-listed fryers put the fill mark exactly at the depth the element needs, and confirming the cover before the switch is touched is what keeps that mark meaningful.",
    },
    {
      id: "power-on", kind: "select", target: "fryer-power",
      title: "Power the fryer back on",
      cue: "Return the fryer to service now that the element is covered and the vat is filled.",
      why: "This is the one point in the whole job where the fryer is allowed to call for heat again, and it is allowed only because every step ahead of it — cooldown, drain, boil-out, refill, covered element — is already done. Reaching the switch any earlier turns one of those into an assumption instead of a confirmed fact.",
    },
    {
      id: "floor-dry", kind: "track", target: "floor-mop", seconds: 5,
      title: "Mop the floor around the fryer dry",
      cue: "Sweep the mop steadily across the marked area until it reads dry.",
      track: {
        start: 0.1, green: [0.4, 0.62], rise: 0.48, fall: 0.42, drift: 0.1, label: "FLOOR — DRYNESS PASS",
        readout: (v) => (v < 0.4 ? "still wet" : v > 0.62 ? "pushing water toward the line" : "drying evenly"),
      },
      holdBreakNote: "Pass broke off before the floor came dry. A film of oily water left at the base of the fryer is the last hazard this whole job was supposed to remove — finish the pass.",
      why: "Every step before this one put oil, boil-out runoff or rinse water on this floor at some point, and none of it counts as finished until the tile is actually dry under foot — a fry cook, a food runner or the closer doing inventory is the next person to stand exactly here.",
    },
  ],

  interrupts: [
    {
      id: "hose-kick",
      kind: "Drain hose failure",
      after: "drain-hold", delay: 3, seconds: 12,
      alert: "The caddy's drain hose has kicked loose off the fitting. Oil is running down the front of the tank onto the floor instead of into it.",
      cue: "Secure the hose before that stream reaches the walkway.",
      target: "hose-clamp",
      why: "A drain hose is only a closed path while its fitting is actually seated, and a jarred caddy or a kinked hose backing off the barb turns a controlled drain into oil running straight down the outside of the tank — reseating the clamp is the one action that puts the flow back where it belongs.",
      missNote: "The hose stayed loose and oil kept running down the caddy onto the tile. That puddle sits directly on the route the caddy itself is about to be wheeled over, and it is still close to hot.",
      wrongNote: "It's the hose clamp on the caddy. Nothing else here is where that oil is actually escaping from.",
    },
    {
      id: "early-power",
      kind: "Premature power-up",
      after: "vat-scrub", delay: 4, seconds: 12,
      alert: "A co-worker has walked up to the fryer's power switch, thinking the boil-out is finished, with the element still sitting bare inside an empty vat.",
      cue: "Stop that switch before the bare element gets power.",
      target: "fryer-power",
      why: "An empty vat with the element uncovered is one flip of a switch away from a dry-fired coil, and the person reaching for it has no way to know from across the kitchen that the vat is still empty — getting to the switch first is the only thing standing between a bare element and a burnout.",
      missNote: "The switch got flipped with the element bare in an empty vat. A dry-fired element heats unopposed by any oil to carry the heat away, and it fails — or ignites whatever film is left in the vat — inside seconds.",
      wrongNote: "It's the power switch, not the vat or the caddy. Get to it before the element takes a live current with nothing covering it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, FOC_AMBER);

    const SS = 0xb4bcc3, SS_DARK = 0x767e86;

    // ------------------------------------------------------------ the fryer
    const fryer = group(g, -1.1, 0, -1.6);
    box(fryer, 0.62, 0.86, 0.72, 0, 0.43, 0, SS_DARK, { rough: 0.35, metal: 0.7 });
    box(fryer, 0.66, 0.06, 0.76, 0, 0.87, 0, 0x2f3439, { rough: 0.5, metal: 0.5 });
    // The vat: open top, oil surface plane that changes with the job.
    const vatInner = box(fryer, 0.5, 0.5, 0.56, 0, 0.6, 0, 0x1b1e22, { rough: 0.6, metal: 0.4, cast: false });
    const oilSurface = box(fryer, 0.46, 0.02, 0.52, 0, 0.82, 0, 0xc98a2e, { rough: 0.2, metal: 0.05 });
    // Heating element bar low in the vat — the exposed-element hazard while the vat is empty.
    const element = box(fryer, 0.4, 0.03, 0.03, 0, 0.62, 0.1, 0x8b929a, { rough: 0.35, metal: 0.8 });
    reg(hits, element, "exposed-element");
    holoTag(fryer, "Heating element", 0, 0.5, 0.16, { css: "#f0645b", w: 0.36 });
    // Drain valve, front-bottom.
    const drain = group(fryer, 0, 0.14, 0.37);
    box(drain, 0.1, 0.06, 0.06, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.75 });
    const drainHandle = cyl(drain, 0.012, 0.012, 0.16, 0, 0.02, 0.05, 0xd8232a, { rough: 0.4, seg: 10 });
    reg(hits, drain, "drain-valve");
    holoTag(fryer, "Drain valve", 0, 0.05, 0.42, { css: FOC_AMBER, w: 0.3 });
    // Thermometer dial on the side.
    const thermo = decal(fryer, 0.14, 0.14, 0.33, 0.6, 0, signFace("340°F", { bg: "#12191f", accent: "#f2ae14", fg: "#ffe3ac", scale: 0.55 }), { glow: true, ei: 0.7, px: 200 });
    thermo.rotation.y = Math.PI / 2;
    reg(hits, thermo, "oil-thermometer");
    // Power switch panel.
    const powerPanel = group(fryer, -0.35, 0.6, 0.37);
    box(powerPanel, 0.1, 0.14, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5 });
    const powerLamp = ball(powerPanel, 0.014, 0, 0.04, 0.018, 0x59c97b, { emissive: 0x59c97b, ei: 2.0 });
    decal(powerPanel, 0.08, 0.05, 0, -0.03, 0.017, signFace("POWER", { bg: "#22262b", accent: "#f2ae14", scale: 0.55 }));
    reg(hits, powerPanel, "fryer-power");
    // Basket, hooked on the rail — set-dressing.
    const basket = group(fryer, 0.2, 0.9, 0);
    for (let i = 0; i < 6; i++) box(basket, 0.24, 0.002, 0.002, 0, -i * 0.03, 0, CITY.steel, { rough: 0.4, metal: 0.8, cast: false });
    cyl(basket, 0.004, 0.004, 0.22, 0, 0.02, 0.12, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2.4;

    // ------------------------------------------------------------ oil caddy
    const caddy = group(g, -1.1, 0, -0.3);
    box(caddy, 0.44, 0.5, 0.34, 0, 0.28, 0, 0x59c97b, { rough: 0.4, metal: 0.35 });
    decal(caddy, 0.4, 0.14, 0, 0.36, 0.18, signFace("USED OIL", { bg: "#0f1b14", accent: "#59c97b", scale: 0.5 }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(caddy, 0.05, 0.05, 0.04, sx * 0.17, 0.05, sz * 0.13, 0x1b1e22, { rough: 0.7, seg: 12 }).rotation.x = Math.PI / 2;
    }
    box(caddy, 0.1, 0.3, 0.03, 0, 0.7, -0.17, 0x2f3439, { rough: 0.5, metal: 0.5 }); // handle post
    box(caddy, 0.2, 0.03, 0.03, 0, 0.85, -0.17, 0x2f3439, { rough: 0.5, metal: 0.5 });
    const caddyHose = hose(caddy, [[0, 0.42, 0.17], [0.1, 0.35, 0.35], [0.05, 0.3, 0.5]], 0.02, 0xdfe4e8, { steps: 10, rough: 0.6 });
    reg(hits, caddy, "oil-caddy");
    // The hose clamp at the fryer end — the interrupt's target.
    const hoseClamp = cyl(caddy, 0.028, 0.028, 0.03, 0.05, 0.29, 0.5, 0xc9a227, { rough: 0.4, metal: 0.7, seg: 12 });
    reg(hits, hoseClamp, "hose-clamp");
    // A puddle that appears under the caddy only once the hose kicks loose.
    const hoseSpill = slab(caddy, 0.3, 0.004, 0.2, 0.15, 0.008, 0.45, 0x6e5a28, { radius: 0.08, rough: 0.15, metal: 0.2, cast: false });
    hoseSpill.visible = false;
    holoTag(caddy, "Oil caddy", 0, 0.9, 0, { css: "#59c97b", w: 0.3 });

    // Decoy bucket at the drain — the hot-drain-bucket hazard.
    const bucketDecoy = group(g, -1.5, 0, -0.15, 0.3);
    lathe(bucketDecoy, [[0.001, 0], [0.14, 0.01], [0.16, 0.25], [0.14, 0.28], [0.001, 0.282]], 0, 0, 0, 0x9aa1a8, { rough: 0.6, seg: 16 });
    cyl(bucketDecoy, 0.012, 0.012, 0.24, 0, 0.29, 0, 0x2b2f34, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2.2;
    holoTag(bucketDecoy, "Bucket — not the caddy", 0, 0.4, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, bucketDecoy, "bucket-decoy");

    // A full bucket somewhere along the floor — the carried-bucket hazard.
    const carriedBucket = group(g, 0.4, 0, -1.9, -0.6);
    lathe(carriedBucket, [[0.001, 0], [0.13, 0.01], [0.15, 0.24], [0.13, 0.27], [0.001, 0.272]], 0, 0, 0, 0xdfe4e8, { rough: 0.4, seg: 16 });
    box(carriedBucket, 0.24, 0.02, 0.22, 0, 0.24, 0, 0xc98a2e, { rough: 0.2 });
    cyl(carriedBucket, 0.01, 0.01, 0.3, 0, 0.34, 0, 0x2b2f34, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2.4;
    holoTag(carriedBucket, "Full — do not carry", 0, 0.42, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, carriedBucket, "carried-bucket");

    // Wet patch at the base of the fryer — dries only at the end.
    const wetSlick = slab(g, 1.0, 0.004, 0.7, -1.1, 0.008, -1.15, 0x3a3d40, { radius: 0.15, rough: 0.1, metal: 0.15, opacity: 0.55, transparent: true, cast: false });
    reg(hits, wetSlick, "wet-floor-hazard");

    // --------------------------------------------------------------- PPE rack
    const ppe = group(g, 1.5, 0, -1.6, -0.5);
    slab(ppe, 0.5, 1.6, 0.1, 0, 0.8, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const apron = group(ppe, -0.14, 1.0, 0.07);
    box(apron, 0.18, 0.4, 0.02, 0, -0.1, 0, 0x2b2f34, { rough: 0.8 });
    reg(hits, apron, "burn-apron");
    holoTag(apron, "Apron", 0, 0.14, 0, { css: FOC_AMBER, w: 0.24 });
    const sleeves = group(ppe, 0.14, 1.05, 0.08);
    cyl(sleeves, 0.05, 0.05, 0.22, 0, 0, 0, 0x3a4048, { rough: 0.75, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, sleeves, "burn-sleeves");
    holoTag(sleeves, "Sleeve guards", 0, 0.16, 0, { css: FOC_AMBER, w: 0.32 });
    const faceShield = group(ppe, 0, 1.35, 0.07);
    box(faceShield, 0.22, 0.14, 0.01, 0, 0, 0, 0xdfe4e8, { rough: 0.2, opacity: 0.5, transparent: true });
    box(faceShield, 0.24, 0.03, 0.02, 0, 0.08, 0, 0x2b2f34, { rough: 0.6 });
    reg(hits, faceShield, "face-shield");
    holoTag(faceShield, "Face shield", 0, 0.16, 0, { css: FOC_AMBER, w: 0.3 });
    const gloves = group(ppe, 0, 0.62, 0.08);
    box(gloves, 0.14, 0.06, 0.08, -0.08, 0, 0, 0x8b6a42, { rough: 0.7 });
    box(gloves, 0.14, 0.06, 0.08, 0.08, 0, 0, 0x8b6a42, { rough: 0.7 });
    reg(hits, gloves, "thermal-gloves");
    holoTag(gloves, "Thermal gloves", 0, 0.12, 0, { css: FOC_AMBER, w: 0.34 });

    // --------------------------------------------------------- boil-out shelf
    const shelf = group(g, 2.0, 0, -0.3, -0.9);
    box(shelf, 0.7, 0.03, 0.24, 0, 0.9, 0, 0x9aa1a8, { rough: 0.5, metal: 0.5 });
    box(shelf, 0.7, 0.03, 0.02, 0, 0.9, 0.11, 0x9aa1a8, { rough: 0.5, metal: 0.5, cast: false });
    const bottles = [
      { id: "boilout-correct", x: -0.2, label: "BOIL-OUT", bg: "#0f1b14", accent: "#59c97b" },
      { id: "shelf-degreaser", x: 0, label: "FLOOR DEGREASER", bg: "#2a1a0d", accent: "#f2ae14" },
      { id: "shelf-bleach", x: 0.2, label: "BLEACH", bg: "#1d1420", accent: "#c9a9ff" },
    ];
    for (const b of bottles) {
      const bot = group(shelf, b.x, 0.92, 0);
      cyl(bot, 0.05, 0.055, 0.2, 0, 0.1, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.7, seg: 14 });
      decal(bot, 0.09, 0.06, 0, 0.11, 0.052, signFace(b.label, { bg: b.bg, accent: b.accent, scale: 0.4 }), { px: 160 });
      reg(hits, bot, b.id);
    }
    holoTag(shelf, "Chemical shelf", 0, 1.06, 0, { css: FOC_AMBER, w: 0.34 });

    // Scrub brush hanging by the fryer — the vat-scrub hold target.
    const brush = group(g, -0.55, 0, -1.55, 0.4);
    cyl(brush, 0.014, 0.014, 0.32, 0, 0.5, 0, 0x8b6a42, { rough: 0.7, seg: 10 });
    box(brush, 0.1, 0.05, 0.04, 0, 0.32, 0, 0x2b2f34, { rough: 0.75 });
    reg(hits, brush, "vat-scrub");
    holoTag(brush, "Boil-out brush", 0, 0.58, 0, { css: FOC_AMBER, w: 0.32 });

    // Fresh oil jug and the fill-line reference on the vat.
    const oilJug = group(g, -0.5, 0, -0.95, -0.3);
    lathe(oilJug, [[0.001, 0], [0.09, 0.008], [0.1, 0.05], [0.1, 0.3], [0.07, 0.34], [0.05, 0.35], [0.05, 0.38], [0.001, 0.382]], 0, 0, 0, 0xf2c14b, { rough: 0.35, seg: 18 });
    reg(hits, oilJug, "oil-jug");
    holoTag(oilJug, "Fresh oil", 0, 0.5, 0, { css: FOC_AMBER, w: 0.3 });
    const fillLine = box(fryer, 0.5, 0.006, 0.58, 0, 0.75, 0, FOC_AMBER, { emissive: FOC_AMBER, ei: 0.9, rough: 0.5, cast: false, opacity: 0.7, transparent: true });
    const elementCover = box(fryer, 0.42, 0.02, 0.48, 0, 0.7, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, elementCover, "element-cover");

    // Rendering bin against the back wall — the drag destination.
    const renderingBin = group(g, 2.3, 0, -3.6, 0.5);
    cyl(renderingBin, 0.32, 0.34, 0.62, 0, 0.31, 0, 0x5a5f66, { rough: 0.6, metal: 0.4, seg: 18 });
    box(renderingBin, 0.66, 0.04, 0.66, 0, 0.63, 0, 0x3a4048, { rough: 0.6, metal: 0.4 });
    decal(renderingBin, 0.5, 0.14, 0, 0.75, 0.34, signFace("RENDERING", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.45 }));
    reg(hits, renderingBin, "rendering-bin");
    holoTag(renderingBin, "Rendering bin", 0, 0.88, 0, { css: FOC_AMBER, w: 0.36 });

    // Anti-fatigue mats between the fryer and the caddy route — the thing not to cross.
    for (const mz of [-0.9, -0.5]) {
      box(g, 1.0, 0.02, 0.32, -0.1, 0.012, mz, 0x22262b, { rough: 0.9, cast: false });
    }

    // Mop cart for the closing floor pass.
    const mopCart = group(g, -0.15, 0, -0.6, -0.4);
    cyl(mopCart, 0.2, 0.2, 0.5, 0, 0.25, 0, 0xdfe4e8, { rough: 0.4, opacity: 0.6, seg: 16 });
    cyl(mopCart, 0.014, 0.014, 0.6, 0, 0.6, 0.05, 0x8b6a42, { rough: 0.7, seg: 8 });
    reg(hits, mopCart, "floor-mop");
    holoTag(mopCart, "Mop", 0, 0.85, 0, { css: FOC_AMBER, w: 0.24 });

    // ------------------------------------------------------------- paperwork
    const chest = toolChest(g, 2.0, 1.4, { ry: -0.6, color: FOC_AMBER });
    const plan = holoPanel(g, 0.56, 0.4, 2.0, 1.9, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2ae14"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e0c98a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SERVICE TICKET — FRYER 2", w * 0.06, h * 0.14);
      ctx.fillStyle = "#fff4d8";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SCHEDULED OIL CHANGE", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#e0c98a";
      ["Oil: canola blend", "Boil-out: green-label only", "Drain temp: below 100°F",
       "Route: dry lane to rendering", "Element covered before power"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.48 + i * 0.11)));
    }, { ry: -0.6, accent: FOC_AMBER });
    reg(hits, plan, "service-plan");

    // A second cook, clear of every control, prepping at the far counter.
    const crew = standingFigure(g, -2.1, -1.85, { ry: 1.0, cloth: 0xdfe6ec, trousers: 0x2b3138 });

    let draining = false, drained = false, scrubbed = false, filled = false, oilOut = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-1.1, 1.0, -1.6),

      onStep(step) {
        if (step.id === "open-drain") draining = true;
      },

      onStepComplete(step) {
        if (step.id === "power-off") powerLamp.material = mat(0x8b929a, { emissive: 0x8b929a, ei: 0.4 });
        if (step.id === "open-drain") drainHandle.rotation.z += 1.3;
        if (step.id === "drain-hold") { drained = true; oilOut = true; oilSurface.visible = false; draining = false; }
        if (step.id === "vat-scrub") scrubbed = true;
        if (step.id === "fill-line") {
          filled = true; oilSurface.visible = true; oilSurface.position.y = 0.75;
          oilSurface.material = mat(0xf2c14b, { rough: 0.2 });
        }
        if (step.id === "power-on") powerLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0 });
        if (step.id === "floor-dry") { wetSlick.visible = false; hoseSpill.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "hose-kick") { hoseSpill.visible = true; caddyHose.rotation.x = 0.3; }
        if (it.id === "early-power") powerLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hose-kick") { hoseSpill.visible = false; caddyHose.rotation.x = 0; }
        if (it.id === "early-power") powerLamp.material = mat(drained && !filled ? 0x8b929a : 0x59c97b, { emissive: 0x8b929a, ei: 0.4 });
      },

      onHazard(hitId) {
        if (hitId === "exposed-element" && !filled) fillLine.material.emissiveIntensity = 1.6;
      },

      animate(t, dt, session) {
        void dt;
        fillLine.visible = !filled;
        if (draining) oilSurface.position.y = Math.max(0.68, oilSurface.position.y - 0.002);
        if (oilOut && !filled) oilSurface.visible = false;
        if (scrubbed) brush.rotation.z = Math.sin(t * 5) * 0.2;
        const track = session?.track;
        if (track && session.step?.id === "floor-dry") mopCart.rotation.y = Math.sin(t * 4) * 0.4;
      },
    };
  },
};
