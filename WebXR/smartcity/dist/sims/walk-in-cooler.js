import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Walk-In Cooler VR — Culinary & Hospitality, station one.
// The opening check and a stocking run on a commercial walk-in cooler: the
// inside release proved before the door is trusted, the light proven from
// inside, the thermometer read against 41 °F, the gasket and floor checked,
// stock put away raw-below-ready in the order the Food Code sets, FIFO
// rotation and date labels, a heavy case lifted with the knees, and the
// compressor's own alarm read rather than guessed at.

const WIC_ACCENT = 0x6fd6c9;

export const SIM_WALK_IN_COOLER = {
  id: "walk-in-cooler",
  index: "107",
  domain: "Culinary & Hospitality",
  trade: "Line cook / kitchen worker — cold storage",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "California Retail Food Code / FDA Food Code §3-501.16 cold holding at 41 °F or below, §3-302.11 raw-to-ready storage order and §3-501.17 date marking; California Food Handler card and ServSafe Food Protection Manager; the means-of-egress principle behind OSHA 29 CFR 1910.36 — nobody works in a room they cannot get out of, which is why a walk-in has an inside release; NSF/ANSI 7 commercial refrigeration equipment; Cal/OSHA Title 8 General Industry Safety Orders on manual lifting; UNITE HERE Local 2",
  name: "Walk-In Cooler",
  title: simTitle("Walk-In Cooler"),
  tagline: "Opening check and a stocking run: inside release and light proven before the door closes, 41 °F confirmed, gasket and floor checked, raw-below-ready stocking, FIFO dates, a case lifted right, and the compressor alarm read",
  accent: WIC_ACCENT,
  accentCss: "#6fd6c9",
  parSeconds: 260,
  footprint: 2.6,
  badge: { id: "cold-and-clear", name: "Cold and Clear", note: "A stocking run with the release proven, 41 °F confirmed, nothing raw over ready and every case dated — first time" },

  game: system({
    name: "Cold Storage",
    currency: "CHILL",
    ranks: ["Prep Cook", "Line Cook", "Lead Cook", "Kitchen Supervisor", "Cold Storage Certified"],
    badges: [
      { id: "release-proven", name: "Release Proven", note: "Inside release held and cleared before the door was ever trusted, first time", test: AWARD.stepClean("release-check") },
      { id: "never-trapped", name: "Never Trapped", note: "Never a blocked release, never raw over ready, never an unlabelled pan", test: AWARD.safe },
      { id: "on-temp", name: "On Temp", note: "Thermometer and compressor readings both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-stock", name: "Clean Stock", note: "No corrections anywhere on the run", test: AWARD.clean },
      { id: "steady-wheel", name: "Steady Wheel", note: "Cart held a steady pace the whole way", test: AWARD.unbroken },
      { id: "stock-fast", name: "Stocked In Time", note: "Run complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "blocked-release": "You left a stack of empty crates wedged against the inside release. The release is what a walk-in has instead of a window: block it and the next person in here — maybe you, in ten minutes — is sealed into a refrigerated room with no way to signal anyone and no way out.",
    "case-on-floor": "That case is sitting straight on the floor instead of a shelf or a dunnage rack. Food stored on the floor picks up splash, mop water and anything that runs across a walk-in floor, and the Retail Food Code requires it up off the floor for exactly that reason.",
    "raw-over-ready": "That shelf has raw product sitting above ready-to-eat food. Ready-to-eat gets no further cook step to kill anything that drips onto it, so the Food Code's storage order puts it on top and raw meat — poultry lowest of all — below everything it could contaminate on the way down.",
    "unlabelled-pan": "That pan has no date label. Without a date nobody downstream — the next shift, the person doing inventory, an inspector — can tell how long it has been in this cooler, and FIFO rotation is just a guess once the dates are gone.",
  },

  lateNotes: {
    "poultry-shelf": "Stock only goes on the shelf once you know which tier it belongs on — ready-to-eat above, raw below it, poultry on the bottom of the raw side.",
    "old-case": "Rotation happens after the new case is dated, not before — you need to be able to read both dates to know which one moves to the front.",
  },

  steps: [
    {
      id: "log", kind: "select", target: "stock-log",
      title: "Read the cold-storage log",
      cue: "Check today's delivery, the shelf plan and the last logged temperature.",
      why: "The log is the record an inspector or a shift lead reads first: the last-known temperature, what came in and where it goes. It also tells you whether this cooler was already running warm before you opened the door on it.",
    },
    {
      id: "release-check", kind: "hold", target: "inside-release", seconds: 5,
      title: "Prove the inside release",
      cue: "Push and hold the inside release bar until it clears the latch, before you trust the door behind you.",
      why: "A walk-in's spring-loaded latch can hold from outside; the inside release is the only thing that lets it hold from outside and still open from inside. You prove it every time you go in, not the day the door was installed.",
      holdBreakNote: "You let go before the latch cleared. A release that almost works is a release that fails the one time you actually need it.",
    },
    {
      id: "light-check", kind: "select", target: "light-switch",
      title: "Confirm the light from inside",
      cue: "Turn on the interior light and confirm it before the door is allowed to swing shut behind you.",
      why: "You read a thermometer, a date label and a gasket by that light, and it is the only light there is once the door closes. A cooler you enter dark is a cooler you are stocking by feel.",
    },
    {
      id: "thermometer", kind: "gauge", target: "wall-thermometer",
      title: "Read the wall thermometer",
      cue: "Read the thermometer and commit once it holds at or below 41 °F.",
      why: "41 °F is the Food Code's own line for cold holding — above it, time/temperature-control-for-safety food starts sliding into the danger zone the moment the door closes again, and that clock does not reset because nobody was watching.",
      gauge: { label: "COOLER TEMP", speed: 0.6, green: [0.08, 0.32], readout: (t) => `${Math.round(50 - t * 20)} °F`, missNote: "Above 41 °F — do not stock it yet. Log it and get the unit checked before product goes in warm." },
    },
    {
      id: "walk-check", kind: "find", noHint: true,
      targets: ["gasket-gap", "floor-ice"],
      itemNames: { "gasket-gap": "the lifted door gasket", "floor-ice": "the ice building up on the floor" },
      itemNotes: {
        "gasket-gap": "The gasket has pulled away from the frame along this edge. A gap here is warm kitchen air leaking in continuously, which is why the unit is working harder than the thermometer explains.",
        "floor-ice": "Ice on the floor means moist air is getting in and freezing where it lands — usually the same gasket or a door left open too long — and it is also a slip hazard the moment somebody wheels a loaded cart across it.",
      },
      title: "Walk the door and the floor",
      cue: "Two things about this cooler are not as they should be. Find them before you stock it.",
      why: "A gasket and a floor are checked with your eyes and a hand on the seal, not read off a gauge. Catching a soft gasket here is cheaper than the compressor running flat out against a leak all week and still losing the fight.",
    },
    {
      id: "cart-select", kind: "select", target: "cart",
      title: "Get the cart",
      cue: "Take the wheeled cart for the heavy case rather than carrying it by hand.",
      why: "A case at or past the two-person lifting guideline goes on wheels, not on your spine. The cart exists so that decision is made once, before the case is off the truck, instead of negotiated case by case under time pressure.",
    },
    {
      id: "lift-form", kind: "hold", target: "case-heavy", seconds: 5,
      title: "Lift the case correctly",
      cue: "Feet set, knees bent, case held close — hold the lift under control before you stand.",
      why: "The load moves with your legs, not your lower back, and it stays close to your body the whole way up. Cal/OSHA's own injury data on kitchen and warehouse work names the same lift, done the same wrong way, as the single most common cause of a cook's career-ending back injury.",
      holdBreakNote: "You stood up before the lift settled. Reset your feet and knees and take the weight under control, not on the way up.",
    },
    {
      id: "shelf-order", kind: "sequence",
      targets: ["ready-to-eat-shelf", "raw-beef-shelf", "poultry-shelf"],
      itemNames: { "ready-to-eat-shelf": "top shelf — ready-to-eat", "raw-beef-shelf": "middle shelf — whole cuts", "poultry-shelf": "bottom shelf — poultry" },
      title: "Shelve the delivery top to bottom",
      cue: "Ready-to-eat on top, whole cuts of raw meat in the middle, poultry on the bottom shelf — in that order.",
      why: "The Food Code orders raw storage by the cook temperature that kills its own pathogens: poultry needs the highest internal temperature, so it goes lowest, where a drip can only fall on the floor and never onto something that will not be cooked again.",
      outOfOrderNote: "Wrong tier for this case. Ready-to-eat stays above every raw product, and poultry sits below the other raw meat, not beside it.",
    },
    {
      id: "label-new", kind: "select", target: "date-label-new",
      title: "Date the new case",
      cue: "Apply a date label to the new case as it goes onto the shelf.",
      why: "A date written the moment product is put away is a date you can trust; one added later is a guess. Every rotation decision after this point depends on this label being right now, not at the end of the shift.",
    },
    {
      id: "rotate-fifo", kind: "drag", target: "old-case",
      title: "Rotate stock to the front",
      cue: "Move the older-dated case to the front of the shelf, in front of the case you just put away.",
      why: "First in, first out only works if the oldest date is also the easiest one to reach. A newer case parked in front buries the one that needs to move first, and it sits there getting older until somebody finds it by smell.",
      drag: { to: "front-shelf-socket", radius: 0.4, missNote: "Not at the front — the oldest date has to be the first thing a hand meets on this shelf, not buried behind the new case." },
    },
    {
      id: "compressor-check", kind: "gauge", target: "compressor-panel",
      title: "Read the compressor panel",
      cue: "Read the unit's status panel and commit once it shows normal run, no alarm latched.",
      why: "The compressor's own alarm is the earliest warning this cooler is losing the fight — before the thermometer drifts far enough to be obvious, before product is at risk. Reading it is part of leaving the room, not something that only matters if it happens to be beeping.",
      gauge: { label: "COMPRESSOR STATUS", speed: 0.65, green: [0.1, 0.34], readout: (t) => (t < 0.34 ? "RUN — NORMAL" : t < 0.62 ? "HIGH HEAD PRESSURE" : "ALARM LATCHED"), missNote: "Not a clean run — do not walk away from an alarm you have not read." },
    },
    {
      id: "cart-travel", kind: "track", target: "cart-handle", seconds: 6,
      title: "Wheel the cart out",
      cue: "Hold a steady walking pace through the doorway — no sprinting the threshold, no stalling in it.",
      why: "The doorway is the narrowest, most heavily used part of this room, shared with whoever opens the door next. A cart taken through at a steady pace is one that does not clip the frame or block the release path for the person behind you.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "CART SPEED", readout: (v) => (v < 0.4 ? "too slow — blocking the door" : v > 0.6 ? "too fast — through the frame" : "steady") },
      holdBreakNote: "Speed out of band in the doorway — settle it and hold a steady pace through.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["door-latch-check", "cart-parked-clear"],
      itemNames: { "door-latch-check": "the door latch", "cart-parked-clear": "the parked cart" },
      itemNotes: {
        "door-latch-check": "The door has latched fully — not resting against the frame, actually caught — which is what keeps this cooler at temperature until the next person opens it.",
        "cart-parked-clear": "The cart is parked clear of the doorway and the release, not left where the next person has to climb around it to reach either one.",
      },
      title: "Walk the room before you leave",
      cue: "Check the door and the cart before you go.",
      why: "The room is left the way the next person needs it: latched, clear doorway, release reachable. That habit is what makes the release-check at the start of this run someone else's easy five seconds instead of their emergency.",
    },
  ],

  // Two things that happen while your hands are already full. See shared/game.js.
  interrupts: [
    {
      id: "door-swinging-shut",
      kind: "Door closing",
      after: "cart-travel", delay: 4, seconds: 12,
      alert: "The door has caught the spring hinge and is swinging shut on the loaded cart wedged in the frame — with you still on the inside of it.",
      cue: "Do not shove the cart. Clear the latch from in here.",
      target: "inside-release",
      why: "A door closing on a cart in the threshold is exactly the situation the inside release exists for: the latch does not know or care that the frame is jammed, and shoving the cart harder only wedges it tighter against a door that is trying to close.",
      missNote: "You kept wrestling the cart instead of clearing the latch. If that door had shut and caught, you would have been on the wrong side of a walk-in with a jammed release and nothing in the room to signal anyone with — which is the entire, ordinary way people get trapped in a cold room.",
      wrongNote: "It is the inside release. Clear the latch first — the cart is not going anywhere until the door stops fighting it.",
    },
    {
      id: "temp-alarm-mid-stock",
      kind: "Temperature alarm",
      after: "lift-form", delay: 4, seconds: 12,
      alert: "The compressor's high-temperature alarm has started sounding while your hands are full with the case.",
      cue: "Set the case down and read the panel before you do anything else.",
      target: "compressor-panel",
      why: "An alarm mid-stock is real until the panel says otherwise, and what it says decides whether you keep stocking or stop and call it in. Guessing which one it is because your hands are full is how a cooler runs warm for an extra hour nobody notices.",
      missNote: "You kept stocking with the alarm still sounding. Every minute this cooler runs above temperature is a minute every case already on these shelves is losing the safety margin the Food Code built into 41 °F — the alarm is the one thing telling you that in real time, not at the next log check.",
      wrongNote: "It is the compressor panel. Whatever this case can wait, an alarm on a running cooler cannot.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WIC_ACCENT);

    // Floor: the cooler's own quarry-tile pad, textured rather than flat, so
    // the ice patch and the cart's wheels read against real grain.
    const floorTex = surfaceTexture(
      (cx, cw, ch) => pavingFace(cx, cw, ch, { tiles: 5, base: "#8a9296", base2: "#7c848a", seam: "rgba(20,26,30,0.4)" }),
      { repeat: 6, px: 512 });
    const floor = box(g, 6.2, 0.1, 5.4, 0, 0.05, 0, 0x82898e, { rough: 0.85, metal: 0.08 });
    floor.material = texturedMat(floorTex, { rough: 0.82, metal: 0.08, color: 0x82898e });

    // The cooler box itself: insulated panel walls with a rounded interior,
    // set back from the pad so the learner spawns just outside the open door.
    const cooler = group(g, 0, 0, -1.1);
    const wallMat = { rough: 0.55, metal: 0.15 };
    box(cooler, 4.4, 2.6, 0.12, 0, 1.3, -1.9, 0xeef2f3, wallMat);
    box(cooler, 0.12, 2.6, 3.8, -2.2, 1.3, 0, 0xeef2f3, wallMat);
    box(cooler, 0.12, 2.6, 3.8, 2.2, 1.3, 0, 0xeef2f3, wallMat);
    box(cooler, 4.4, 0.12, 3.8, 0, 2.62, 0, 0xdfe4e5, wallMat);
    // Door frame at +z, hinged panel swung open against the right wall.
    const doorFrame = group(cooler, 0, 0, 1.9);
    box(doorFrame, 4.4, 0.16, 0.16, 0, 2.6, 0, 0xc7ced1, { rough: 0.5, metal: 0.3 });
    const doorPanel = group(doorFrame, 1.9, 0, 0.1, -1.25);
    box(doorPanel, 1.3, 2.5, 0.1, -0.63, 1.28, 0, 0xf4f7f7, { rough: 0.45, metal: 0.2 });
    // Gasket strip around the door opening — one edge deliberately lifted.
    const gasketGood = box(doorPanel, 1.28, 0.02, 0.03, -0.63, 2.5, 0.06, 0x2b2f34, { rough: 0.7 });
    void gasketGood;
    const gasketBad = group(doorPanel, -0.63, 0.05, 0.06);
    box(gasketBad, 1.28, 0.02, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.7 }).rotation.x = 0.28;
    holoTag(gasketBad, "door gasket", 0, 0.16, 0, { css: "#6fd6c9", w: 0.24 });
    reg(hits, gasketBad, "gasket-gap");
    // Inside release: a bright bar mounted at hand height on the swung-open
    // door's inside face, plus the interior light switch beside it.
    const releaseGroup = group(doorPanel, -1.2, 1.05, 0.09);
    box(releaseGroup, 0.05, 0.32, 0.07, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const releaseBar = box(releaseGroup, 0.22, 0.05, 0.05, 0.09, 0.05, 0.02, 0xf2c14b, { rough: 0.4, metal: 0.3, emissive: 0xf2c14b, ei: 0.5 });
    holoTag(releaseGroup, "inside release", 0, 0.34, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, releaseBar, "inside-release");
    const lightSwitch = box(doorPanel, 0.06, 0.1, 0.03, -0.63, 1.65, 0.09, 0xdfe4e5, { rough: 0.4 });
    holoTag(doorPanel, "light switch", -0.63, 1.8, 0.09, { css: "#6fd6c9", w: 0.24 });
    reg(hits, lightSwitch, "light-switch");
    const latch = box(doorFrame, 0.06, 0.1, 0.06, -1.98, 1.05, 0.06, 0x8b939b, { rough: 0.4, metal: 0.6 });
    reg(hits, latch, "door-latch-check");
    const doorBlocker = group(doorFrame, -1.9, 0.28, 0.12);
    for (let i = 0; i < 3; i++) box(doorBlocker, 0.34, 0.24, 0.3, 0, i * 0.26, 0, 0xc9a86a, { rough: 0.8 });
    holoTag(doorBlocker, "crates against the release?", 0, 0.9, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, doorBlocker, "blocked-release");

    // Interior ceiling lamp, thermometer and compressor panel on the back wall.
    const lamp = ball(cooler, 0.05, 0, 2.4, -1.85, 0xf8fbff, { emissive: 0xf8fbff, ei: 0, rough: 0.4 });
    const thermo = instrument(cooler, -1.7, 1.7, -1.82, { idle: "-- °F", color: 0x6fd6c9, w: 0.14, d: 0.22 });
    holoTag(thermo, "wall thermometer", 0, 0.16, 0, { css: "#6fd6c9", w: 0.3 });
    reg(hits, thermo, "wall-thermometer");
    const compUnit = group(cooler, 1.6, 2.2, -1.82);
    box(compUnit, 0.8, 0.4, 0.28, 0, 0, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    const compFan = group(compUnit, 0, 0, 0.15);
    for (let i = 0; i < 4; i++) { const bl = box(compFan, 0.16, 0.02, 0.03, 0, 0, 0, 0x7b8a86, { rough: 0.5, metal: 0.5, cast: false }); bl.rotation.z = (i * Math.PI) / 2; }
    const compPanel = instrument(compUnit, 0, -0.3, 0.15, { idle: "RUN", color: 0x6fd6c9, w: 0.16, d: 0.1, ry: 0 });
    holoTag(compUnit, "compressor panel", 0, 0.36, 0.15, { css: "#6fd6c9", w: 0.32 });
    reg(hits, compPanel, "compressor-panel");
    const alarmLamp = ball(compUnit, 0.03, 0.3, 0.16, 0.16, 0x59c97b, { emissive: 0x59c97b, ei: 1.4 });

    // Ice patch on the floor near the door — the second walk-check target.
    const icePatch = slab(cooler, 0.6, 0.01, 0.5, -1.5, 0.01, 1.6, 0xdcf3f7, { radius: 0.1, rough: 0.15, opacity: 0.55, transparent: true, cast: false });
    holoTag(cooler, "ice on the floor", -1.5, 0.2, 1.6, { css: "#f0645b", w: 0.3 });
    reg(hits, icePatch, "floor-ice");

    // Shelving: four corner posts and three wire-rack tiers along the left
    // wall, top to bottom.
    const shelf = group(cooler, -1.55, 0, -0.7);
    for (const sx of [-0.75, 0.75]) for (const sz of [-1.55, 1.55]) box(shelf, 0.03, 2.1, 0.03, sx, 1.05, sz, 0x8b939b, { rough: 0.4, metal: 0.6, cast: false });
    const tierY = [1.85, 1.15, 0.45];
    for (const y of tierY) box(shelf, 1.6, 0.03, 3.2, 0, y, 0, 0xa8b0b6, { rough: 0.35, metal: 0.55, cast: false });
    // Top tier — ready-to-eat.
    const rteTier = group(shelf, 0, tierY[0] + 0.06, -0.6);
    for (let i = 0; i < 3; i++) box(rteTier, 0.4, 0.14, 0.3, -0.5 + i * 0.5, 0.07, 0, [0x9fd88a, 0xdfe4e5, 0xf2c14b][i], { rough: 0.6 });
    holoTag(rteTier, "top — ready-to-eat", 0, 0.3, 0, { css: "#59c97b", w: 0.42 });
    reg(hits, rteTier, "ready-to-eat-shelf");
    // Middle tier — whole cuts of raw beef/pork.
    const beefTier = group(shelf, 0, tierY[1] + 0.06, -0.6);
    for (let i = 0; i < 2; i++) box(beefTier, 0.5, 0.18, 0.34, -0.35 + i * 0.7, 0.09, 0, 0xb0473a, { rough: 0.7 });
    holoTag(beefTier, "middle — whole cuts", 0, 0.34, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, beefTier, "raw-beef-shelf");
    // Bottom tier — poultry, lowest of all.
    const poultryTier = group(shelf, 0, tierY[2] + 0.06, -0.6);
    for (let i = 0; i < 2; i++) box(poultryTier, 0.5, 0.16, 0.34, -0.35 + i * 0.7, 0.08, 0, 0xe8c9a0, { rough: 0.75 });
    holoTag(poultryTier, "bottom — poultry", 0, 0.3, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, poultryTier, "poultry-shelf");
    // A decoy tier where raw sits above ready-to-eat — the hazard.
    const badTier = group(shelf, 0, tierY[0] + 0.06, 0.9);
    box(badTier, 0.4, 0.16, 0.3, 0, 0.08, 0, 0xd98a6a, { rough: 0.7 });
    holoTag(badTier, "raw over ready?", 0, 0.3, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, badTier, "raw-over-ready");
    // An unlabelled pan on the shelf edge.
    const unlabelledPan = box(shelf, 0.34, 0.08, 0.24, 0.7, tierY[1] + 0.1, 0.9, 0xb9bec4, { rough: 0.35, metal: 0.6 });
    holoTag(unlabelledPan, "no date label", 0.7, tierY[1] + 0.26, 0.9, { css: "#f0645b", w: 0.34 });
    reg(hits, unlabelledPan, "unlabelled-pan");
    // A case sitting straight on the floor — the hazard.
    const floorCase = box(cooler, 0.5, 0.4, 0.4, -1.5, 0.2, -1.2, 0xc9a86a, { rough: 0.8 });
    holoTag(floorCase, "case on the floor", -1.5, 0.5, -1.2, { css: "#f0645b", w: 0.36 });
    reg(hits, floorCase, "case-on-floor");

    // Front shelf socket the FIFO drag targets, plus the two cases involved.
    const frontSocket = box(shelf, 0.5, 0.02, 0.3, -0.55, tierY[1] + 0.1, 1.35, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["front-shelf-socket"] = frontSocket;
    const oldCase = group(shelf, 0.55, tierY[1] + 0.1, 0.55);
    box(oldCase, 0.42, 0.28, 0.3, 0, 0.14, 0, 0xc9a86a, { rough: 0.75 });
    decal(oldCase, 0.34, 0.1, 0, 0.28, 0.151, signFace("USE 3/1", { bg: "#7a5a2a", accent: "#f2c14b", scale: 0.55 }));
    holoTag(oldCase, "older case", 0, 0.36, 0, { css: "#6fd6c9", w: 0.26 });
    reg(hits, oldCase, "old-case");

    // Delivery cart with the heavy case, near the pad's edge outside the door.
    const cartGroup = group(g, 1.6, 0, 1.3);
    box(cartGroup, 0.5, 0.04, 0.7, 0, 0.32, 0, 0x8b939b, { rough: 0.4, metal: 0.6 });
    for (const [cx, cz] of [[-0.2, -0.3], [0.2, -0.3], [-0.2, 0.3], [0.2, 0.3]]) { const w = cyl(cartGroup, 0.06, 0.06, 0.06, cx, 0.06, cz, 0x1a1e23, { rough: 0.85, seg: 12 }); w.rotation.z = Math.PI / 2; }
    const handle = box(cartGroup, 0.05, 0.5, 0.05, 0, 0.6, -0.34, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    holoTag(cartGroup, "cart", 0, 0.9, -0.34, { css: "#6fd6c9", w: 0.16 });
    reg(hits, cartGroup, "cart");
    reg(hits, cartGroup, "cart-parked-clear");
    reg(hits, handle, "cart-handle");
    const heavyCase = group(cartGroup, 0, 0.34, 0.05);
    box(heavyCase, 0.42, 0.36, 0.4, 0, 0.18, 0, 0xc9a86a, { rough: 0.8 });
    decal(heavyCase, 0.3, 0.09, 0, 0.36, 0.201, signFace("40 LB", { bg: "#5a4326", accent: "#f2c14b", scale: 0.55 }));
    holoTag(heavyCase, "heavy case", 0, 0.42, 0, { css: "#6fd6c9", w: 0.24 });
    reg(hits, heavyCase, "case-heavy");
    const dateLabelNew = box(cartGroup, 0.1, 0.02, 0.06, 0.32, 0.53, 0.05, 0xf2f6fa, { rough: 0.4 });
    holoTag(cartGroup, "date label", 0.32, 0.58, 0.05, { css: "#6fd6c9", w: 0.22 });
    reg(hits, dateLabelNew, "date-label-new");

    // Extra stock on the shelf's unused depth and a second wire shelf against
    // the back wall, so the room reads as a working cooler rather than a
    // diagram of one — sacks, jugs and produce crates, all decorative.
    for (const [dx, dy, dz, w, h, d, c] of [
      [0.55, tierY[0] + 0.05, -0.9, 0.3, 0.1, 0.22, 0xe8eef0], [0.9, tierY[0] + 0.05, -0.4, 0.28, 0.24, 0.22, 0x8fae5f],
      [-0.7, tierY[1] + 0.05, 0.0, 0.24, 0.1, 0.3, 0xf2f6fa], [0.2, tierY[2] + 0.05, -1.1, 0.3, 0.14, 0.22, 0xe8c9a0],
      [-0.2, tierY[2] + 0.05, 0.4, 0.26, 0.14, 0.3, 0xe8c9a0],
    ]) box(shelf, w, h, d, dx, dy + h / 2, dz, c, { rough: 0.8 });
    const backShelf = group(cooler, 0, 0, -1.75);
    for (const sx of [-1.9, -0.4, 0.4, 1.9]) box(backShelf, 0.03, 2.1, 0.03, sx, 1.05, 0, 0x8b939b, { rough: 0.4, metal: 0.6, cast: false });
    for (const y of [0.5, 1.2, 1.9]) box(backShelf, 4.1, 0.03, 0.45, 0, y, 0, 0xa8b0b6, { rough: 0.35, metal: 0.55, cast: false });
    for (const [dx, y] of [[-1.4, 0.58], [-0.7, 0.58], [0.6, 0.58], [1.3, 0.58], [-1.2, 1.28], [0.2, 1.28], [1.0, 1.28]]) {
      cyl(backShelf, 0.09, 0.09, 0.18, dx, y, 0, [0xdfe4e5, 0x8fae5f, 0xe4d27a][Math.floor(Math.random() * 3)], { rough: 0.6, seg: 12 });
    }
    // Mop bucket and a wet-floor sign near the ice patch — the room's own
    // ordinary housekeeping, not a hazard in itself.
    const mopGroup = group(cooler, -1.9, 0, 1.5);
    cyl(mopGroup, 0.16, 0.14, 0.3, 0, 0.15, 0, 0xd8232a, { rough: 0.6, seg: 16 });
    cyl(mopGroup, 0.015, 0.015, 0.9, 0.05, 0.75, 0, 0xc9a86a, { rough: 0.7, seg: 8 });
    slab(mopGroup, 0.28, 0.4, 0.02, 0.3, 0.4, 0.2, 0xf2c14b, { radius: 0.01, rough: 0.7, cast: false }).rotation.y = 0.6;
    // Fire extinguisher on the exterior wall by the door.
    const extinguisher = group(g, -2.15, 0, 0.6);
    cyl(extinguisher, 0.08, 0.09, 0.42, 0, 1.15, 0, 0xd8232a, { rough: 0.55, seg: 14 });
    cyl(extinguisher, 0.03, 0.03, 0.08, 0, 1.4, 0, 0x2b2f34, { rough: 0.6, seg: 10 });
    // Rooftop condenser unit on the cooler exterior — the machine the
    // compressor panel is reading.
    const condenser = group(cooler, 0.4, 2.72, -0.6);
    box(condenser, 1.5, 0.5, 1.0, 0, 0.25, 0, 0xb9bec4, { rough: 0.45, metal: 0.6 });
    for (let i = 0; i < 5; i++) box(condenser, 1.3, 0.35, 0.02, 0, 0.25, -0.48 + i * 0.24, 0x8b939b, { rough: 0.4, metal: 0.65, cast: false });
    const rooftopFan = cyl(condenser, 0.22, 0.22, 0.03, 0, 0.52, 0, 0x2b2f34, { rough: 0.5, seg: 18 });
    void rooftopFan;

    // Log board just outside the cooler.
    const board = group(g, -1.9, 0, 1.6);
    holoPanel(board, 0.95, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0d1a18"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#6fd6c9"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d7f5ef"; ctx.fillText("COLD STORAGE LOG — WALK-IN 1", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eefaf6";
      ["Hold at 41 °F or below, always", "Ready-to-eat top, raw below, poultry bottom", "Date every case as it goes in — FIFO to the front", "Prove the inside release before you trust the door", "Alarm sounding: read the panel before anything else"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.12)));
    }, { accent: WIC_ACCENT });
    reg(hits, board, "stock-log");

    const cook = standingFigure(g, 2.15, -1.75, { ry: -2.3, cloth: 0x37505f });
    holoTag(cook, "cook", 0, 1.9, 0, { css: "#6fd6c9", w: 0.16 });

    const cold = particles(cooler, 40, 0xdcf3f7, { size: 0.03, life: 0.9, additive: false, opacity: 0.3 });

    let held = 0, alarmLatched = false, travelled = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.2, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "light-check") { lamp.material = mat(0xf8fbff, { emissive: 0xf8fbff, ei: 2.0, rough: 0.4 }); }
        if (step.id === "lift-form") { heavyCase.position.y = 0.9; heavyCase.position.z = -0.2; }
        if (step.id === "shelf-order") { heavyCase.visible = false; }
        if (step.id === "rotate-fifo") { oldCase.parent.remove(oldCase); shelf.add(oldCase); oldCase.position.set(-0.55, tierY[1] + 0.1, 1.35); }
        if (step.id === "compressor-check") { alarmLatched = false; alarmLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 }); }
        if (step.id === "final-walk") { doorBlocker.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "door-swinging-shut") { doorPanel.rotation.y = -0.6; }
        if (it.id === "temp-alarm-mid-stock") { alarmLatched = true; alarmLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "door-swinging-shut") { doorPanel.rotation.y = -1.25; }
        if (it.id === "temp-alarm-mid-stock") { alarmLatched = false; alarmLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 }); }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "release-check" && session.holding) held = Math.min(1, held + dt / 5);
        releaseBar.position.x = 0.09 + held * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "thermometer") repaint(thermo.userData.screen, signFace(`${Math.round(50 - gg.t * 20)} °F`, { bg: "#0d1c1a", accent: gg.t >= 0.08 && gg.t <= 0.32 ? "#59c97b" : "#f2ae14", fg: "#e9fff9", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "compressor-check") repaint(compPanel.userData.screen, signFace(gg.t < 0.34 ? "RUN" : gg.t < 0.62 ? "HIGH HEAD" : "ALARM", { bg: "#0d1c1a", accent: gg.t < 0.34 ? "#59c97b" : "#f0645b", fg: "#e9fff9", scale: 0.55 }));
        if (step?.id === "cart-travel" && session.holding) travelled = Math.min(1, travelled + dt / 6);
        cartGroup.position.z = 1.3 - travelled * 2.6;
        compFan.rotation.z += dt * (alarmLatched ? 0 : 3.2);
        if (cold.userData.step) { cold.visible = true; cold.userData.step(dt, new THREE.Vector3(0, 1.6, -1.0), 1.6, 0.05, -0.02); }
      },
    };
  },
};
