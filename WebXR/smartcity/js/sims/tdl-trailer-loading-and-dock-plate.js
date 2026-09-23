import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Trailer Loading and Dock Plate VR — Mobility & Transit, the
// third of five warehouse stations in the Job Readiness Edition's TDL
// pre-apprenticeship block. A dropped 53-foot van at a door with a portable
// dock plate rather than a powered leveler: the load plan read for stop order
// and weight, the trailer walked for the floor and roof damage that swallows a
// forklift, chocked and jacked at the nose because nothing is holding the
// front of a dropped trailer up except its landing gear, the vehicle restraint
// held until it grips, a plate rated for the truck and the load together and
// seated with its locating legs down, the load run in and built tight, a load
// bar ratcheted across the last row, and the trailer released in the order
// that never leaves a plate on a trailer somebody can pull away.
//
// Sited generically: no real warehouse, no real carrier, no clause number the
// registry is not sure of.

const TLD_ACCENT = 0xe2b33c;
const TLD_WALL = 0xd9dde2;
const TLD_WOOD = 0x9a7a55;

export const SIM_TDL_TRAILER_LOADING_AND_DOCK_PLATE = {
  id: "tdl-trailer-loading-and-dock-plate",
  index: "219",
  domain: "Warehouse & Distribution",
  trade: "Dock loader, TDL pre-apprenticeship — Teamsters warehouse and dock work: trailer loading and dock plate, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
  category: "Mobility & Transit",
  indoor: "garage",
  certification: "OSHA 29 CFR 1910.178 powered industrial trucks, including trailer brakes set, wheel chocks under the rear wheels and fixed jacks under an uncoupled semitrailer while it is boarded by a truck; ANSI B56.1 for the counterbalanced truck; 29 CFR 1910.22 walking-working surfaces and OSHA's dockboard requirements for plates secured against sliding; FMCSA 49 CFR 393 Subpart I, which the carrier's driver answers for at the roadside and the loader builds for at the dock; Teamsters warehouse and freight locals' dock training",
  name: "Trailer Loading and Dock Plate",
  title: simTitle("Trailer Loading and Dock Plate"),
  tagline: "A dropped van at a plate door: load plan, trailer walk, chock and nose jack, restraint held till it grips, a plate rated for truck plus load and seated, the load built tight, a load bar across the last row, and a release that never leaves a plate on a trailer that can move",
  accent: TLD_ACCENT,
  accentCss: "#e2b33c",
  parSeconds: 270,
  footprint: 2.4,
  badge: { id: "tight-and-sealed", name: "Tight and Sealed", note: "A trailer chocked and jacked before the plate, loaded tight with a load bar across the last row and released in order — first time" },

  game: system({
    name: "Dock Loading",
    currency: "LOAD",
    ranks: ["Dock Trainee", "Loader", "Lead Loader", "Dock Lead", "Dock Loading Certified"],
    badges: [
      { id: "nose-supported", name: "Nose Supported", note: "Chock and nose jack in before anything else, first time", test: AWARD.stepClean("secure") },
      { id: "never-unpinned", name: "Never Unpinned", note: "Never drove onto a loose plate, into an unchocked trailer or off the dock edge", test: AWARD.safe },
      { id: "rated-plate", name: "Rated Plate", note: "Plate capacity read near the centre of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-load", name: "Clean Load", note: "No corrections anywhere at the door", test: AWARD.clean },
      { id: "door-time", name: "Door Time", note: "Trailer loaded inside 80% of par", test: AWARD.fast(0.8) },
      { id: "steady-in", name: "Steady In", note: "Travel into the trailer held in band", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "tld-plate-unpinned": "You drove onto the dock plate before its locating legs were down in the gap. A portable plate held only by friction walks with every pass of a truck; it slides off the trailer lip or tips at the dock edge, and the truck on it goes into the gap between the building and the trailer.",
    "tld-unchocked-entry": "You started into the trailer before the wheels were chocked. The impact of a loaded truck crossing the plate pushes a trailer away from the dock a little at a time; an unchocked trailer walks until the plate falls into the gap with the truck on it.",
    "tld-dock-jump": "You went to jump down off the dock edge to the yard. Dock edges are a four-foot drop onto concrete, and jumping is one of the commonest ways dock workers break ankles and knees. The stairs are at the end of the dock.",
    "tld-overhang-tier": "You went to load the pallet whose top tier overhangs the deck and is not wrapped. An unwrapped overhanging tier falls off the forks on the plate slope and falls off the pallet on the first hard stop the driver makes; it gets squared and wrapped at the staging lane.",
  },

  lateNotes: {
    "tld-dock-plate": "The plate goes down only after the trailer is chocked, jacked and held by the restraint — a plate on a free trailer is a bridge to nowhere.",
    "tld-load-bar": "The load bar goes across the last row, after the load is built — it holds a finished load, it does not hold up an unfinished one.",
    "tld-warehouse-log": "The log is written once the trailer is sealed and released, so the seal number and the piece count on it are the final ones.",
  },

  steps: [
    {
      id: "load-plan", kind: "select", target: "tld-load-plan",
      title: "Read the load plan",
      cue: "Read the plan: stops in reverse order, heavy freight on the floor and forward, the piece count and the weight.",
      why: "A trailer is loaded backwards from how it will be unloaded: the last stop goes in first, against the nose, and the first stop goes in last by the doors. Heavy freight goes low and spread along the length so the driver's axle weights come out legal and the trailer does not handle like a pendulum. A load built out of order is unloaded twice, by the driver, at a customer's dock.",
    },
    {
      id: "trailer-walk", kind: "find", noHint: true,
      targets: ["tld-floor-hole", "tld-roof-daylight", "tld-etrack-broken"],
      itemNames: { "tld-floor-hole": "the soft patch in the trailer floor", "tld-roof-daylight": "daylight through the roof", "tld-etrack-broken": "the torn logistic track" },
      itemNotes: {
        "tld-floor-hole": "This floor board is split and soft. A forklift and its load together weigh several tons, and a rotten trailer floor lets a front wheel through — the truck drops, the mast whips forward and the load comes down.",
        "tld-roof-daylight": "There is daylight through the roof. A roof leak soaks the freight in the first rain; the trailer is refused or the freight is protected before anything goes in.",
        "tld-etrack-broken": "The logistic track is torn loose from the wall. A load bar or strap hooked into broken track holds nothing, and the load it was meant to hold is on the doors at the first stop.",
      },
      title: "Walk the trailer before the truck goes in",
      cue: "Walk into the empty trailer with a light. Find what makes it unsafe or unfit to load.",
      why: "OSHA expects trailer floors to be checked for breaks and weakness before a powered truck is driven onto them, and the only way to check is to walk in and look. The same walk finds the roof hole that ruins the freight and the broken track the load bar needs. A trailer that fails the walk is refused at the door, not loaded carefully around the soft spot.",
    },
    {
      id: "secure", kind: "sequence", anyOrder: true,
      targets: ["tld-wheel-chock", "tld-trailer-stand"],
      itemNames: { "tld-wheel-chock": "wheel chock under the rear tandem", "tld-trailer-stand": "trailer stand under the nose" },
      title: "Chock the wheels and jack the nose",
      cue: "Chock the rear tandem and set the trailer stand under the nose of this dropped trailer — both, before anything else.",
      why: "A dropped trailer has nothing holding it but its brakes and its landing gear. The chock stops it creeping away from the dock as the truck crosses the plate; the stand under the nose stops the landing gear buckling or the front tipping down when a loaded truck drives all the way forward. OSHA names both for a semitrailer that is not coupled to a tractor, and neither one covers for the other.",
    },
    {
      id: "restraint", kind: "hold", target: "tld-restraint-button", seconds: 8,
      title: "Hold the vehicle restraint until it grips",
      cue: "Press and hold the restraint's engage button until the hook rises onto the rear impact guard and the inside light turns green.",
      why: "The restraint hooks the trailer's rear impact guard to the building. Holding the button until you see the hook seat and the lights change is how you know it gripped steel rather than air; a restraint engaged on a missing or bent guard shows a fault light, and that trailer is chocked and watched rather than trusted. Outside, the same system turns the driver's light red.",
      holdBreakNote: "You let go before the hook seated. Hold it until the light changes.",
    },
    {
      id: "plate-rating", kind: "gauge", target: "tld-plate-rating",
      title: "Check the plate against the truck and the load",
      cue: "Read the plate's capacity against the forklift's weight plus its heaviest load and commit when it carries both.",
      why: "A dock plate carries the whole truck, not just the pallet: a forklift weighs more than it lifts, because its counterweight is what keeps it from tipping forward. The number that matters is the truck's service weight plus the heaviest load plus the impact of crossing a lip at speed. A plate rated for the pallet alone is a plate that bends under the first loaded pass.",
      gauge: { label: "PLATE vs TRUCK + LOAD", speed: 0.75, green: [0.44, 0.64], readout: (t) => `truck + load ${Math.round(6000 + t * 10000)} of 15,000 lb`, missNote: "Outside the band for this truck and this load — use the heavier plate or a lighter truck." },
    },
    {
      id: "plate", kind: "drag", target: "tld-dock-plate",
      title: "Set the dock plate",
      cue: "Bring the plate across and seat its lip flat on the trailer bed with its full bearing.",
      why: "The plate bridges the gap and the height difference between the dock and the trailer bed, and its lip has to bear flat on the trailer floor across its whole width. A lip resting on the door sill or on the edge of the bed rocks under a wheel, and a plate that rocks is a plate that walks. It goes down with the handholds or a truck's forks, never by a person bent under it.",
      drag: { to: "tld-plate-socket", radius: 0.45, missNote: "The lip is not bearing on the bed — seat it square and flat on the trailer floor." },
    },
    {
      id: "plate-legs", kind: "select", target: "tld-plate-legs",
      title: "Check the locating legs are down",
      cue: "Look at the gap under the plate: both locating legs down between the dock face and the trailer.",
      why: "A portable plate is kept from sliding by the locating legs, or pins, that drop into the gap between the dock and the trailer; OSHA's dockboard requirements ask for exactly that kind of anchoring. Looking at them costs two seconds. Not looking is how a plate that seemed fine on the first pass has walked six inches by the tenth.",
    },
    {
      id: "load-in", kind: "track", target: "tld-throttle", seconds: 8,
      title: "Run the load in",
      cue: "Take each pallet up the plate forks-first, low and tilted back, at a steady crawl, and set it tight to the one before.",
      why: "The plate is a slope and a joint, and both are where loads fall: speed makes the truck bounce as it crosses the lip, and a raised load bounces with it. A steady crawl, the load low and tilted back, keeps the pallet on the forks and the truck in control inside a box with its own walls a hand's width from the mast. Pallets set tight to each other cannot shift in transit.",
      track: { start: 0.1, green: [0.36, 0.58], rise: 0.56, fall: 0.46, drift: 0.12, label: "SPEED", readout: (v) => (v < 0.36 ? "stalling on the slope" : v > 0.58 ? "bouncing the lip" : "steady crawl") },
      holdBreakNote: "Speed out of band on the plate — too fast bounces the load off the lip. Back to a crawl.",
    },
    {
      id: "load-check", kind: "find", noHint: true,
      targets: ["tld-void-gap", "tld-shifted-tier"],
      itemNames: { "tld-void-gap": "the void between the last two rows", "tld-shifted-tier": "the top tier that shifted on the plate" },
      itemNotes: {
        "tld-void-gap": "There is a pallet-width void between the last two rows. Freight fills voids on the first hard stop; the gap is filled with an airbag or dunnage, or closed up, before the load bar goes on.",
        "tld-shifted-tier": "This pallet's top tier slid on the plate slope and is hanging over the side. It is restacked and wrapped now, not left for the driver to find leaning on the doors.",
      },
      title: "Look at the load you built",
      cue: "Stand at the doors and look down the load. Find what will move when the driver brakes.",
      why: "Freight in a van moves forward under braking and sideways in turns, and anything with room to move will use it. FMCSA 49 CFR 393 holds the driver and carrier to a load that cannot shift or fall, but the loader is the one who can still reach it. A void or a shifted tier found at the dock takes a minute; found at the roadside or at the customer's door it is a claim, a refused load or an injury when the doors open.",
    },
    {
      id: "load-bar", kind: "turn", target: "tld-load-bar",
      title: "Ratchet the load bar across the last row",
      cue: "Set the load bar across the trailer behind the last row and ratchet it tight into the logistic track.",
      why: "A load bar across the last row is what stops the rear pallets walking back into the doors — the reason drivers get hit by freight when they open a trailer at a customer. It is ratcheted wall to wall until it cannot be moved by hand, into track that the trailer walk already proved sound. Loose, it is a steel bar waiting to fall on the person who opens the doors.",
      turn: { turns: 1, axis: "x", label: "LOAD BAR RATCHET" },
    },
    {
      id: "release", kind: "sequence",
      targets: ["tld-plate-lift", "tld-seal", "tld-restraint-release", "tld-chock-pull"],
      itemNames: { "tld-plate-lift": "plate pulled back", "tld-seal": "doors closed and sealed", "tld-restraint-release": "restraint released", "tld-chock-pull": "chock pulled" },
      title: "Release the trailer in order",
      cue: "Pull the plate back, close and seal the doors, release the restraint, and only then pull the chock.",
      why: "The order is what keeps anything from being on or under a trailer that can move. The plate comes out first because the doors cannot close on it and because a trailer released with a plate still on it drags the plate into the yard. The seal is applied and its number recorded before the trailer leaves the building's control. The restraint and chock come off last, together, when the trailer is ready for the yard truck.",
      outOfOrderNote: "Plate, seal, restraint, chock — nothing comes off the trailer that holds it until the plate is out and the doors are sealed.",
    },
    {
      id: "crew-checkin", kind: "select", target: "tld-crew-checkin",
      title: "Check in with the dock lead",
      cue: "Report the trailer defects, the restacked pallet and the yard truck that came early, and say how the door went.",
      why: "The dock lead decides which trailers go to which doors and talks to the yard and the carriers; a trailer with a soft floor or a roof hole goes back to the carrier only if the lead hears about it. The early yard truck is the kind of near miss that happens again tomorrow unless somebody says it out loud today, and the check-in is where the loader gets to say how the shift is actually going.",
    },
    {
      id: "warehouse-log", kind: "select", target: "tld-warehouse-log",
      title: "Write the warehouse log",
      cue: "Log the trailer number, seal number, piece count, the trailer walk findings and the restraint fault, then sign it.",
      why: "The seal number and piece count are what the receiver checks against at the other end; a mismatch starts a claim, and the log is the warehouse's side of it. The trailer walk findings are the carrier's evidence that its equipment needs repair. A log written at the door, with the numbers in front of you, is worth more than one written from memory at the end of the shift.",
    },
  ],

  interrupts: [
    {
      id: "yard-truck-early",
      kind: "Trailer about to move",
      after: "restraint", delay: 3, seconds: 12,
      alert: "A yard truck has backed under the nose of your trailer and its driver is climbing down to connect the air lines — while you are loading it.",
      cue: "Stop the yard truck before it hooks your trailer.",
      target: "tld-light-switch",
      why: "A yard driver working from a list can pull the wrong door, and a trailer pulled away with a forklift or a person inside is one of the worst accidents a dock has. Throwing the outside signal to red and calling it on the radio is the building's way of saying this trailer is occupied.",
      missNote: "The yard truck hooked your trailer while it was being loaded. Trailers pulled from docks mid-load drop forklifts into the gap and carry loaders into the yard; the signal light and the call exist so the yard driver is never guessing.",
      wrongNote: "It is the dock signal switch. Someone is about to connect to a trailer you are loading, and only the red light and the call stop them.",
    },
    {
      id: "forklift-behind",
      kind: "Truck crossing behind",
      after: "load-in", delay: 3, seconds: 10,
      alert: "Another forklift is crossing the dock behind the trailer doors just as you are about to back out of the trailer.",
      cue: "Warn it and hold before you back out.",
      target: "tld-horn",
      why: "Backing out of a trailer, you are reversing from a dim box into bright light with a mast in your view, and the dock behind you is the busiest lane in the building. The horn tells the other operator you are there; holding until the lane is clear means neither of you has to guess.",
      missNote: "You backed out into the dock lane with a truck crossing it. Two forklifts meeting at a trailer door is a load dropped at best, and a truck backed into a pedestrian behind it at worst.",
      wrongNote: "It is the horn. Another truck is crossing directly behind you and you are about to reverse into its path.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, TLD_ACCENT);

    // ------------------------------------------------------------ dock floor and face
    const dockTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#6a6e73", base2: "#5d6166", seam: "rgba(0,0,0,0.35)" }), { repeat: 4, px: 512 });
    const dock = box(g, 6.8, 0.1, 4.4, 0, 0.05, 0.6, 0xffffff, { rough: 0.9 });
    dock.material = texturedMat(dockTex, { rough: 0.9, metal: 0.03, color: 0xc4c8cc });
    // Yellow safety edge along the dock face and the bumpers either side of the door.
    box(g, 6.8, 0.012, 0.18, 0, 0.106, -1.52, 0xf2c14b, { rough: 0.6, cast: false });
    for (const x of [-1.25, 1.25]) box(g, 0.3, 0.32, 0.14, x, 0.05, -1.67, 0x1b1e23, { rough: 0.9 });
    const edge = slab(g, 1.4, 0.02, 0.3, -2.4, 0.11, -1.45, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.4, cast: false });
    holoTag(g, "jump down to the yard?", -2.4, 0.36, -1.45, { css: "#d2312b", w: 0.4 });
    reg2(edge, "tld-dock-jump");
    // The dock door frame and the roller door rolled up.
    for (const x of [-1.5, 1.5]) box(g, 0.2, 3.2, 0.2, x, 1.6, -1.7, 0xb3bcc3, { rough: 0.6 });
    box(g, 3.2, 0.5, 0.35, 0, 3.1, -1.7, 0x8b959c, { rough: 0.5, metal: 0.4 });
    // Dock signal lights and the restraint control box on the wall.
    const ctl = group(g, 1.95, 0.1, -1.55);
    box(ctl, 0.34, 0.5, 0.14, 0, 1.25, 0, 0x2b2f34, { rough: 0.6 });
    const redLamp = cyl(ctl, 0.04, 0.04, 0.03, -0.08, 1.4, 0.08, 0x5a1a1a, { rough: 0.4, seg: 14 });
    redLamp.rotation.x = Math.PI / 2;
    const greenLamp = cyl(ctl, 0.04, 0.04, 0.03, 0.08, 1.4, 0.08, 0x1a4a2a, { rough: 0.4, seg: 14 });
    greenLamp.rotation.x = Math.PI / 2;
    const engageBtn = box(ctl, 0.08, 0.06, 0.05, -0.07, 1.2, 0.08, 0x59c97b, { rough: 0.5 });
    reg2(engageBtn, "tld-restraint-button");
    const releaseBtn = box(ctl, 0.08, 0.06, 0.05, 0.07, 1.2, 0.08, 0xd2312b, { rough: 0.5 });
    reg2(releaseBtn, "tld-restraint-release");
    const lightSwitch = box(ctl, 0.06, 0.1, 0.05, 0, 1.05, 0.08, 0xf2c14b, { rough: 0.5 });
    reg2(lightSwitch, "tld-light-switch");
    holoTag(ctl, "restraint · signal", 0, 1.62, 0.05, { css: "#e2b33c", w: 0.32 });

    // ------------------------------------------------------------ the dropped van trailer
    const tr = group(g, 0, 0.3, -4.1);
    const bed = box(tr, 2.5, 0.12, 4.6, 0, 0.06, 0, 0x7d8288, { rough: 0.85 });
    void bed;
    const trFloor = box(tr, 2.4, 0.02, 4.5, 0, 0.13, 0, 0xffffff, { rough: 0.9, cast: false });
    trFloor.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#6b5a44", base2: "#5e4e3a", step: 30 }), { repeat: 3, px: 256 }), { rough: 0.9, color: 0xc8b8a0 });
    for (const sx of [-1, 1]) box(tr, 0.06, 2.6, 4.6, sx * 1.25, 1.42, 0, TLD_WALL, { rough: 0.7 });
    box(tr, 2.56, 0.06, 4.6, 0, 2.74, 0, TLD_WALL, { rough: 0.7 });
    box(tr, 2.5, 2.6, 0.06, 0, 1.42, -2.3, TLD_WALL, { rough: 0.7 });
    for (const sx of [-1, 1]) for (const y of [0.9, 1.7]) box(tr, 0.02, 0.1, 4.4, sx * 1.21, y, 0, 0x8b959c, { rough: 0.5, metal: 0.6 });
    const torn = box(tr, 0.04, 0.1, 0.5, 1.2, 1.62, -0.6, 0xd98a3a, { rough: 0.5, metal: 0.5 });
    torn.rotation.x = 0.2;
    reg2(torn, "tld-etrack-broken");
    const hole = box(tr, 0.4, 0.01, 0.3, -0.5, 0.145, -0.9, 0x1b140c, { rough: 1 });
    reg2(hole, "tld-floor-hole");
    const sky = box(tr, 0.25, 0.02, 0.18, 0.4, 2.7, -1.3, 0xfff6d8, { emissive: 0xfff6d8, ei: 1.6, rough: 0.3 });
    reg2(sky, "tld-roof-daylight");
    // Rear frame, open doors swung back, impact guard, tandem and landing gear.
    for (const sx of [-1, 1]) box(tr, 0.12, 2.7, 0.12, sx * 1.25, 1.42, 2.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    for (const sx of [-1, 1]) { const d = box(tr, 1.2, 2.5, 0.05, sx * 1.9, 1.42, 2.6, TLD_WALL, { rough: 0.7 }); d.rotation.y = sx * 1.4; }
    box(tr, 2.2, 0.12, 0.12, 0, -0.1, 2.25, 0xd2312b, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) for (const dz of [0.9, 1.6]) cyl(tr, 0.4, 0.4, 0.3, sx * 1.0, -0.05, dz, 0x1a1e23, { rough: 0.9, seg: 16 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) box(tr, 0.1, 0.36, 0.1, sx * 0.8, -0.14, -1.6, 0x3a3f45, { rough: 0.5, metal: 0.5 });
    // The chock (on the dock, then under the tandem) and the trailer stand.
    const chockPick = box(g, 0.24, 0.16, 0.22, -1.9, 0.18, -0.9, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "wheel chock", -1.9, 0.5, -0.9, { css: "#e2b33c", w: 0.22 });
    reg2(chockPick, "tld-wheel-chock");
    const chockSet = box(tr, 0.24, 0.16, 0.22, 1.0, -0.2, 2.1, 0xf2c14b, { rough: 0.8 });
    chockSet.visible = false;
    const chockPull = box(tr, 0.3, 0.3, 0.3, 1.35, -0.1, 2.1, 0xffffff, { opacity: 0.001, cast: false });
    reg2(chockPull, "tld-chock-pull");
    const stand = group(g, 1.9, 0.1, -0.6);
    box(stand, 0.3, 0.05, 0.3, 0, 0.03, 0, 0xe2b33c, { rough: 0.6, metal: 0.3 });
    cyl(stand, 0.05, 0.06, 0.7, 0, 0.4, 0, 0xe2b33c, { rough: 0.5, metal: 0.4, seg: 10 });
    box(stand, 0.2, 0.04, 0.2, 0, 0.76, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    holoTag(stand, "trailer stand", 0, 1.0, 0, { css: "#e2b33c", w: 0.24 });
    reg2(stand, "tld-trailer-stand");
    const standSet = cyl(tr, 0.06, 0.07, 0.3, 0, -0.15, -2.1, 0xe2b33c, { rough: 0.5, metal: 0.4, seg: 10 });
    standSet.visible = false;
    const unchocked = box(g, 1.2, 0.3, 0.4, 0, 0.3, -1.25, 0x000000, { opacity: 0.001, cast: false });
    holoTag(g, "go in before the chock?", 0, 0.55, -1.25, { css: "#d2312b", w: 0.42 });
    reg2(unchocked, "tld-unchocked-entry");
    const hook = box(g, 0.2, 0.14, 0.16, 0, -0.05, -1.72, 0xf2c14b, { rough: 0.6, metal: 0.4 });

    // ------------------------------------------------------------ dock plate
    const plate = group(g, -0.6, 0.12, -0.35);
    box(plate, 1.5, 0.05, 1.0, 0, 0.025, 0, 0x8b959c, { rough: 0.45, metal: 0.6 });
    for (let i = -3; i <= 3; i++) box(plate, 0.02, 0.008, 0.9, i * 0.2, 0.054, 0, 0xf2c14b, { rough: 0.6, cast: false });
    for (const sx of [-1, 1]) box(plate, 0.12, 0.05, 0.08, sx * 0.72, 0.06, 0.46, 0x2b2f34, { rough: 0.6 });
    const legs = group(plate, 0, 0, 0);
    for (const sx of [-1, 1]) box(legs, 0.08, 0.2, 0.06, sx * 0.5, -0.1, -0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    holoTag(plate, "dock plate 15,000 lb", 0, 0.32, 0, { css: "#e2b33c", w: 0.36 });
    reg2(plate, "tld-dock-plate");
    const plateSocket = box(g, 1.5, 0.05, 1.0, 0, 0.2, -1.95, 0xffffff, { rough: 0.5 });
    plateSocket.visible = false; hits["tld-plate-socket"] = plateSocket;
    const legsHit = box(g, 1.2, 0.18, 0.2, 0, 0.12, -1.62, 0xffffff, { opacity: 0.001, cast: false });
    holoTag(g, "locating legs", 0.9, 0.45, -1.35, { css: "#e2b33c", w: 0.24 });
    reg2(legsHit, "tld-plate-legs");
    const liftHit = box(g, 0.4, 0.2, 0.3, -0.8, 0.2, -1.85, 0xffffff, { opacity: 0.001, cast: false });
    reg2(liftHit, "tld-plate-lift");
    const plateRating = instrument(g, -1.55, 1.2, -1.45, { idle: "-- lb", color: TLD_ACCENT, w: 0.14, d: 0.18 });
    reg2(plateRating, "tld-plate-rating");
    holoTag(g, "plate vs truck + load", -1.55, 1.42, -1.45, { css: "#e2b33c", w: 0.36 });
    const looseMark = slab(g, 1.2, 0.02, 0.4, 0.2, 0.13, -0.95, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "drive on — legs not seated?", 0.2, 0.34, -0.95, { css: "#d2312b", w: 0.46 });
    reg2(looseMark, "tld-plate-unpinned");

    // ------------------------------------------------------------ loads: in the trailer and staged
    const pal = (parent, x, y, z, h, c) => {
      const p = group(parent, x, y, z);
      box(p, 1.0, 0.13, 1.1, 0, 0.065, 0, TLD_WOOD, { rough: 0.9 });
      box(p, 0.96, h, 1.04, 0, 0.13 + h / 2, 0, c, { rough: 0.85 });
      return p;
    };
    const inside = [pal(tr, -0.55, 0.14, -1.7, 1.2, 0xc9a978), pal(tr, 0.55, 0.14, -1.7, 1.1, 0xb89a6c), pal(tr, -0.55, 0.14, -0.55, 1.0, 0xc2a070)];
    const shifted = pal(tr, 0.55, 0.14, 0.55, 0.9, 0xc9a978);
    const tier = box(shifted, 0.8, 0.3, 0.9, 0.18, 1.2, 0, 0xd4b88a, { rough: 0.85 });
    tier.rotation.y = 0.12;
    reg2(tier, "tld-shifted-tier");
    const voidMark = box(tr, 1.0, 0.8, 0.3, 0.55, 0.55, -0.02, 0xd2312b, { opacity: 0.25, cast: false });
    reg2(voidMark, "tld-void-gap");
    // The trailer is walked empty; the built load appears once it is run in.
    const builtLoad = [...inside, shifted, voidMark];
    for (const o of builtLoad) o.visible = false;
    const staged = pal(g, -2.3, 0.1, 0.9, 1.0, 0xc2a070);
    void staged;
    const overhang = pal(g, -2.3, 0.1, 2.1, 0.8, 0xb89a6c);
    box(overhang, 1.2, 0.35, 0.8, 0.12, 1.1, 0, 0xd4b88a, { rough: 0.85 });
    holoTag(overhang, "overhang, unwrapped — load it?", 0, 1.55, 0, { css: "#d2312b", w: 0.5 });
    reg2(overhang, "tld-overhang-tier");
    // The load bar, stowed on the dock and then across the last row.
    const bar = group(g, 2.25, 0.1, 0.55);
    cyl(bar, 0.03, 0.03, 2.3, 0, 1.2, 0, 0x8b959c, { rough: 0.4, metal: 0.7, seg: 10 });
    const ratchet = box(bar, 0.1, 0.16, 0.08, 0, 1.0, 0.04, 0x2b2f34, { rough: 0.5 });
    holoTag(bar, "load bar", 0, 2.45, 0, { css: "#e2b33c", w: 0.18 });
    reg2(bar, "tld-load-bar");
    const barSet = cyl(tr, 0.03, 0.03, 2.4, 0, 1.0, 1.25, 0x8b959c, { rough: 0.4, metal: 0.7, seg: 10 });
    barSet.rotation.z = Math.PI / 2; barSet.visible = false;
    const seal = group(tr, 0.3, 1.3, 2.45);
    box(seal, 0.06, 0.1, 0.03, 0, 0, 0, 0x2f7fbf, { rough: 0.5 });
    holoTag(tr, "seal", 0.3, 1.52, 2.45, { css: "#e2b33c", w: 0.12 });
    reg2(seal, "tld-seal");

    // ------------------------------------------------------------ the forklift you drive
    const fl = group(g, 0.9, 0.1, 0.9);
    box(fl, 0.95, 0.62, 1.4, 0, 0.47, 0.15, TLD_ACCENT, { rough: 0.5, metal: 0.3 });
    box(fl, 0.9, 0.5, 0.35, 0, 0.6, 0.78, 0x2b2f34, { rough: 0.7 });
    for (const [x, z] of [[-0.42, -0.35], [0.42, -0.35], [-0.42, 0.7], [0.42, 0.7]]) cyl(fl, 0.05, 0.05, 1.15, x, 1.35, z, 0x2b2f34, { rough: 0.6, metal: 0.5, seg: 8 });
    box(fl, 0.95, 0.04, 1.2, 0, 1.93, 0.18, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    for (const sx of [-1, 1]) box(fl, 0.07, 2.1, 0.08, sx * 0.28, 1.05, -0.62, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    for (const sx of [-1, 1]) box(fl, 0.1, 0.04, 1.0, sx * 0.25, 0.1, -1.1, 0x8b98a5, { rough: 0.4, metal: 0.7 });
    for (const [x, z] of [[-0.45, -0.4], [0.45, -0.4], [-0.45, 0.65], [0.45, 0.65]]) cyl(fl, 0.2, 0.2, 0.18, x, 0.2, z, 0x1a1e23, { rough: 0.9, seg: 14 }).rotation.z = Math.PI / 2;
    box(fl, 0.45, 0.12, 0.45, 0, 0.84, 0.25, 0x1b1e23, { rough: 0.9 });
    const horn = box(fl, 0.12, 0.07, 0.08, -0.25, 1.05, -0.05, 0xf2c14b, { rough: 0.5 });
    reg2(horn, "tld-horn");
    const throttle = cyl(fl, 0.03, 0.03, 0.2, 0.25, 1.0, -0.05, 0x1b1e23, { rough: 0.5, seg: 10 });
    reg2(throttle, "tld-throttle");
    holoTag(fl, "horn · throttle", 0, 1.28, -0.05, { css: "#e2b33c", w: 0.28 });

    // A second forklift parked down the dock, and the yard truck in the yard.
    const fl2 = group(g, -3.4, 0.1, -0.5, Math.PI / 2);
    box(fl2, 0.9, 0.6, 1.3, 0, 0.45, 0, 0xd9a13a, { rough: 0.5, metal: 0.3 });
    for (const [x, z] of [[-0.4, -0.35], [0.4, -0.35], [-0.4, 0.5], [0.4, 0.5]]) cyl(fl2, 0.05, 0.05, 1.1, x, 1.3, z, 0x2b2f34, { rough: 0.6, metal: 0.5, seg: 8 });
    box(fl2, 0.9, 0.04, 1.0, 0, 1.86, 0.08, 0x2b2f34, { rough: 0.6 });
    box(fl2, 0.9, 0.8, 0.9, 0, 0.55, -1.2, 0xc9a978, { rough: 0.85 });
    const fl2Lamp = cyl(fl2, 0.05, 0.05, 0.08, 0, 1.94, 0.3, 0x59636d, { rough: 0.4, seg: 12 });
    const yard = group(g, 3.6, 0.1, -6.8, 0);
    box(yard, 1.6, 1.4, 1.2, 0, 1.0, 0, 0xf2f5f7, { rough: 0.5, metal: 0.3 });
    box(yard, 1.4, 0.5, 0.05, 0, 1.35, -0.62, 0x2b3a44, { rough: 0.2, metal: 0.5 });
    box(yard, 1.8, 0.2, 2.2, 0, 0.35, 0.6, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) for (const dz of [-0.2, 1.2]) cyl(yard, 0.42, 0.42, 0.3, sx * 0.85, 0.42, dz, 0x1a1e23, { rough: 0.9, seg: 16 }).rotation.z = Math.PI / 2;
    const yardBeacon = cyl(yard, 0.07, 0.07, 0.12, 0, 1.78, 0, 0x59636d, { rough: 0.4, seg: 12 });

    // ------------------------------------------------------------ boards
    const plan = holoPanel(g, 0.8, 0.52, -2.45, 1.5, -0.05, (ctx, w, h) => {
      ctx.fillStyle = "#1a1606"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e2b33c"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fbeec8"; ctx.fillText("LOAD PLAN — DOOR 6, TRL 53-114", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fff8e4";
      ["Stop 3 at the nose, stop 1 at the doors", "Heavy on the floor, spread the length", "22 pallets · 31,400 lb", "Dropped trailer: chock + nose stand", "Load bar across the last row", "Seal and log the number"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 1.1, accent: TLD_ACCENT });
    reg2(plan, "tld-load-plan");
    const checkin = holoPanel(g, 0.46, 0.3, 2.45, 1.75, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CREW CHECK-IN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Trailer · yard truck · the door", w / 2, h * 0.66);
    }, { ry: -1.2, accent: 0x4fd1ff });
    reg2(checkin, "tld-crew-checkin");
    const log = holoPanel(g, 0.5, 0.34, -0.9, 1.6, 2.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,16,6,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e2b33c"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeec8"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("WAREHOUSE LOG", w / 2, h * 0.28);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Trailer · seal · count · walk", w / 2, h * 0.6);
    }, { ry: 0.5, accent: TLD_ACCENT });
    reg2(log, "tld-warehouse-log");
    decal(g, 0.36, 0.2, 1.5, 2.3, -1.58, paperFace("DOOR 6", ["Plate door", "No leveler"], { bg: "#f6f1e4" }), { px: 160 });

    // ------------------------------------------------------------ people
    standingFigure(g, 2.35, 2.45, { ry: -2.4, cloth: 0x37505f, vest: 0xd8e24a });
    const yardDriver = standingFigure(g, 2.2, -4.9, { ry: 2.8, cloth: 0x2b3138, vest: 0xf2a23b });

    let loaded = 0;
    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.0, -1.4),
      onStepComplete(step) {
        if (step.id === "secure") { chockPick.visible = false; chockSet.visible = true; stand.visible = false; standSet.visible = true; }
        if (step.id === "restraint") { hook.position.y = 0.12; redLamp.material = mat(0x5a1a1a, { rough: 0.4 }); greenLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 }); }
        if (step.id === "plate") { plate.parent.remove(plate); g.add(plate); plate.position.set(0, 0.2, -1.95); plate.rotation.set(-0.12, 0, 0); }
        if (step.id === "plate-legs") legs.position.y = -0.06;
        if (step.id === "load-in") for (const o of builtLoad) o.visible = true;
        if (step.id === "load-bar") { bar.visible = false; barSet.visible = true; }
        if (step.id === "release") { chockSet.visible = false; hook.position.y = -0.05; greenLamp.material = mat(0x1a4a2a, { rough: 0.4 }); plate.position.set(-0.6, 0.12, -0.35); plate.rotation.set(0, 0, 0); }
        if (step.id === "warehouse-log") {
          repaint(log.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,14,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("LOG SIGNED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Seal 0418822 · 22 pcs · floor repair", w / 2, h * 0.66);
          });
        }
      },
      // The yard truck really backs under the nose with its beacon going; the
      // second forklift really crosses behind the doors.
      onInterrupt(it) {
        if (it.id === "yard-truck-early") { yard.position.set(0, 0.1, -7.0); yardBeacon.material = mat(0xf2a23b, { emissive: 0xf2a23b, ei: 1.5, rough: 0.4 }); yardDriver.position.set(1.4, 0, -6.4); }
        if (it.id === "forklift-behind") { fl2.position.set(-0.8, 0.1, 0.1); fl2Lamp.material = mat(0xf2a23b, { emissive: 0xf2a23b, ei: 1.5, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "yard-truck-early") { yard.position.set(3.6, 0.1, -6.8); redLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.5, rough: 0.4 }); yardDriver.position.set(2.2, 0, -4.9); }
        if (it.id === "forklift-behind") { fl2.position.set(-3.4, 0.1, 1.6); fl2Lamp.material = mat(0x59636d, { rough: 0.4 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "load-in" && session.holding) loaded = Math.min(1, loaded + dt / 8);
        fl.position.z = 0.9 - loaded * 1.2;
        if (session?.turn && step?.id === "load-bar") ratchet.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "plate-rating") {
          const ok = gg.t >= 0.44 && gg.t <= 0.64;
          repaint(plateRating.userData.screen, signFace(`${Math.round(6000 + gg.t * 10000)} lb`, { bg: "#1a1606", accent: ok ? "#59c97b" : "#f2ae14", fg: "#fff8e4", scale: 0.5 }));
        }
        void t;
      },
    };
  },
};
