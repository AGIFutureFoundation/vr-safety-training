import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace } from "../../../shared/kit.js";
import { forkliftCounterbalance } from "../../../shared/fleet.js";
import { CITY, stationPad, holoPanel, holoTag, cone, instrument, standingFigure, rackFrame, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Forklift Dock VR — Manufacturing & Automation, station four.
// A dock load-out on a counterbalance forklift: the pre-shift inspection,
// the seatbelt, a trailer that is chocked and dock-locked before the plate
// goes down and before anyone drives in, a load checked against the
// capacity plate, forks under, mast back, low and steady, the ramp in
// reverse with a load, the rack beam height, and a trailer that crept.

const FD_ACCENT = 0xf2a23b;

export const SIM_FORKLIFT_DOCK = {
  id: "forklift-dock",
  index: "39",
  domain: "Manufacturing & Automation",
  trade: "Powered industrial truck operator — warehouse and dock",
  category: "Manufacturing & Automation",
  indoor: "garage",
  certification: "OSHA 29 CFR 1910.178(l) powered industrial truck operator training and evaluation (three-year re-evaluation); ANSI/ITSDF B56.1 counterbalanced trucks; IBT (Teamsters) and UFCW warehouse locals' PIT programmes",
  name: "Forklift Dock",
  title: simTitle("Forklift Dock"),
  tagline: "Dock load-out: pre-shift inspection, belt on, trailer chocked and dock-locked before the plate, load against the capacity plate, forks under and mast back, low and steady, ramp in reverse, rack height, and the trailer that crept",
  accent: FD_ACCENT,
  accentCss: "#f2a23b",
  parSeconds: 240,
  footprint: 2.6,
  badge: { id: "dock-clean", name: "Dock Clean", note: "A load-out with the trailer secured before the plate, the load inside the plate rating, the mast back and low, and the ramp taken in reverse — first time" },

  game: system({
    name: "Dock Operations",
    currency: "LIFT",
    ranks: ["Trainee", "Certified Operator", "Lead Operator", "Dock Supervisor", "Dock Operations Certified"],
    badges: [
      { id: "secured-first", name: "Secured First", note: "Chock and dock lock before the plate, first time", test: AWARD.stepClean("trailer") },
      { id: "nobody-under", name: "Nobody Under", note: "Never a rider, never under a raised load, never forward down a ramp loaded", test: AWARD.safe },
      { id: "on-the-plate", name: "On the Plate", note: "Load and rack height both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-loadout", name: "Clean Load-Out", note: "No corrections anywhere on the dock", test: AWARD.clean },
      { id: "steady-travel", name: "Steady Travel", note: "Travel speed held the whole run", test: AWARD.unbroken },
      { id: "turn-fast", name: "Turned In Time", note: "Trailer loaded inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "ride-forks": "You let a coworker ride on the forks. A forklift has one seat and one belt; a person on the forks has neither, and the mast, the load and the overhead guard are all built on the assumption nobody is there.",
    "ramp-forward-loaded": "You drove forward down the ramp with a load. On a grade the load points downhill and the truck tips over the front axle; loaded, you go up forward and down in reverse.",
    "under-raised-load": "You walked under the raised load. Forks fail, chains stretch, pallets break — nothing that is lifted is ever stood under, and nothing raised is left unattended.",
    "no-chock-entry": "You drove into a trailer that was not chocked or dock-locked. A trailer creeps a few inches every time a truck enters; a driver hooks up and pulls away with you inside; the plate drops and the truck goes four feet to the yard.",
  },

  lateNotes: {
    "throttle": "Travel comes after the load is under, tilted back and low — a raised load on the move is the tip-over.",
    "rack-height": "Rack height is set at the rack, stopped, with the mast vertical — not while travelling.",
    "dock-plate": "The plate goes down only onto a trailer that is chocked and locked; a plate on a loose trailer is the gap you drive into.",
  },

  steps: [
    {
      id: "preshift", kind: "select", target: "preshift-board",
      title: "Read the pre-shift checklist",
      cue: "Check today's truck, the load-out order and the capacity plate.",
      why: "The checklist is the record that the truck was inspected before the shift; the capacity plate is the number every load is measured against.",
    },
    {
      id: "inspect", kind: "sequence", anyOrder: true,
      targets: ["tires", "forks", "mast-chains", "horn-lights"],
      itemNames: { tires: "tires", forks: "forks and heel", "mast-chains": "mast chains", "horn-lights": "horn and lights" },
      title: "Pre-shift inspection",
      cue: "Walk the truck: tires, fork heels and tips, mast chains and hoses, horn and lights.",
      why: "A forklift with a cracked fork heel or a slack chain fails under the load it lifts, not in the yard. A truck that fails inspection is tagged out, not driven gently.",
    },
    {
      id: "belt", kind: "select", target: "seatbelt",
      title: "Belt on",
      cue: "Sit, and fasten the seatbelt before the key turns.",
      why: "In a tip-over the overhead guard protects a belted operator. An unbelted one jumps, and the guard lands on them — the single biggest killer of forklift operators.",
    },
    {
      id: "trailer", kind: "sequence", anyOrder: true,
      targets: ["wheel-chock", "dock-lock"],
      itemNames: { "wheel-chock": "wheel chock", "dock-lock": "dock lock" },
      title: "Secure the trailer",
      cue: "Chock the trailer wheels and engage the dock lock on the rear impact guard — both, before the plate.",
      why: "The chock stops creep; the lock stops a driver pulling away. Either one alone is the accident the other would have prevented.",
    },
    {
      id: "plate", kind: "drag", target: "dock-plate",
      title: "Set the dock plate",
      cue: "Bring the dock plate down and seat its lip on the trailer bed.",
      why: "The plate bridges the gap and the height difference. It sits on the trailer bed by at least four inches of lip, on a trailer that cannot move.",
      drag: { to: "trailer-lip-socket", radius: 0.45, missNote: "The lip is not on the bed — seat it square on the trailer floor." },
    },
    {
      id: "floor", kind: "select", target: "trailer-floor",
      title: "Check the trailer floor and nose",
      cue: "Look down the trailer: floor sound, nose supported, lights on.",
      why: "A trailer floor rots from the inside. The truck weighs three times the load; a soft floor lets it through, and a dropped trailer with no landing-gear support noses down with the truck inside.",
    },
    {
      id: "load", kind: "gauge", target: "capacity-plate",
      title: "Check the load against the plate",
      cue: "Read the pallet weight and load centre against the capacity plate — commit when it is inside the rating.",
      why: "The plate rates the truck at a 24-inch load centre. A long pallet moves the centre out and the rating down; the pallet that is 'about right' is the one that tips.",
      gauge: { label: "LOAD vs RATING", speed: 0.7, green: [0.3, 0.6], readout: (t) => `${Math.round(t * 5000)} lb @ 24 in`, missNote: "Outside the rating at this load centre — split the load or get a bigger truck." },
    },
    {
      id: "lift", kind: "sequence",
      targets: ["forks-under", "tilt-back", "raise-travel"],
      itemNames: { "forks-under": "forks fully under", "tilt-back": "mast tilted back", "raise-travel": "raised to travel height" },
      title: "Pick the load",
      cue: "Forks fully under to the heel, mast tilted back, then raise only to travel height — four to six inches.",
      why: "Under to the heel so the load cannot slide; back so it rests against the carriage; low so the centre of gravity stays inside the wheelbase.",
      outOfOrderNote: "Under, then back, then up — the load is settled before it leaves the floor.",
    },
    {
      id: "travel", kind: "track", target: "throttle", seconds: 6,
      title: "Travel to the trailer",
      cue: "Hold a steady walking-pace speed, horn at the door, load low and back.",
      why: "A forklift stops in its own length only at walking pace. The horn at every door and aisle end is the pedestrian's only warning.",
      track: { start: 0.1, green: [0.38, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "SPEED", readout: (v) => (v < 0.38 ? "stalled" : v > 0.6 ? "too fast" : "walking pace") },
      holdBreakNote: "Speed out of band — settle it to walking pace and hold.",
    },
    {
      id: "ramp", kind: "select", target: "ramp-reverse",
      title: "Take the ramp in reverse",
      cue: "Loaded, descend the yard ramp in reverse — load uphill, looking over your shoulder.",
      why: "Loaded, the load faces uphill: forward up, reverse down. That keeps the weight over the drive axle and the load against the carriage instead of sliding off the tips.",
    },
    {
      id: "rack", kind: "gauge", target: "rack-height",
      title: "Set the forks to the rack beam",
      cue: "Stopped at the rack, mast vertical, raise until the forks clear the beam — commit inside the band.",
      why: "Two inches over the beam clears it; a foot over is a load that drops onto the beam and a pallet that breaks. The height is set stopped, never while the truck is moving.",
      gauge: { label: "FORKS vs BEAM", speed: 0.75, green: [0.5, 0.64], readout: (t) => `${((t - 0.5) * 40).toFixed(0)} in over beam`, missNote: "Under the beam or too far over — adjust before you move in." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["trailer-creep"],
      itemNames: { "trailer-creep": "trailer creep gap" },
      itemNotes: { "trailer-creep": "The trailer has crept away from the dock: there is daylight between the plate lip and the bed — stop, re-chock, re-seat the plate." },
      title: "Walk the dock before the next load",
      cue: "Look at the plate, the chock and the lock, and click what has moved.",
      why: "Every entry pushes the trailer. The dock is checked between loads, not at the end of the shift.",
    },
  ],

  // Two things that happen on a dock while the operator is looking at a load.
  // Both are in the mirrors or the aisle, not in a caption — see shared/game.js.
  interrupts: [
    {
      id: "trailer-creeping",
      kind: "Trailer moving",
      after: "floor", delay: 4, seconds: 12,
      alert: "The trailer has walked forward off the plate. There is daylight opening at the dock lip behind you and you are standing in the box.",
      cue: "Get the trailer locked to the building again.",
      target: "dock-lock",
      why: "Trailers creep a few inches with every pass of a truck, and the gap only has to reach the length of the plate. The restraint is what holds the trailer to the building; chocks alone slide on a wet apron.",
      missNote: "The gap kept opening while you worked. Trailer separation puts the plate into the gap and the truck four feet down onto the yard, upside down, with the operator underneath it — it is the single most common way a dock kills somebody.",
      wrongNote: "It is the dock lock. A trailer moving away from the building while you are inside it is the only thing happening on this dock.",
    },
    {
      id: "pedestrian-in-aisle",
      kind: "Pedestrian in path",
      after: "travel", delay: 3, seconds: 10,
      alert: "A picker has stepped out of the racking into your aisle, on your blind side behind the load.",
      cue: "Warn them before you are any closer.",
      target: "horn-lights",
      why: "A loaded mast blocks the line of sight in exactly the direction of travel, so the operator is the last person to see a pedestrian and the pedestrian assumes they have been seen. The horn is the only part of the truck that works around a load.",
      missNote: "You kept travelling with somebody in the aisle behind the load. Pedestrians struck by forklifts are almost never seen first by the operator — that is the point of the horn at every blind corner, not just the ones with a mirror.",
      wrongNote: "It is the horn. Somebody is in your path on the side you cannot see, and every second of travel closes the distance.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, FD_ACCENT);
    box(g, 6.0, 0.1, 5.4, 0, 0.05, 0, 0x4a4d52, { rough: 0.95 });
    // Dock face at -z: the warehouse floor is the pad; the trailer sits below dock height beyond it.
    box(g, 6.0, 0.6, 0.3, 0, -0.2, -2.0, 0x2b2f34, { rough: 0.8 });
    const bumper = (x) => box(g, 0.3, 0.3, 0.12, x, 0.0, -2.2, 0x1b1e23, { rough: 0.9 });
    bumper(-1.0); bumper(1.0);
    const trailer = group(g, 0, -0.45, -3.9);
    box(trailer, 2.4, 0.12, 3.6, 0, 0.5, 0, 0x8a8f96, { rough: 0.85 });
    for (const sx of [-1, 1]) box(trailer, 0.06, 2.2, 3.6, sx * 1.2, 1.66, 0, 0xd9dde2, { rough: 0.7 });
    box(trailer, 2.4, 0.06, 3.6, 0, 2.75, 0, 0xd9dde2, { rough: 0.7 });
    box(trailer, 2.4, 2.2, 0.06, 0, 1.66, -1.8, 0xd9dde2, { rough: 0.7 });
    for (const sx of [-1, 1]) cyl(trailer, 0.35, 0.35, 0.3, sx * 1.0, 0.1, 1.1, 0x1a1e23, { rough: 0.9, seg: 14 }).rotation.z = Math.PI / 2;
    const rig = box(trailer, 2.2, 0.1, 0.1, 0, 0.2, 1.75, 0x59636d, { rough: 0.6, metal: 0.5 });
    const floorHit = box(trailer, 2.2, 0.02, 3.2, 0, 0.57, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trailer, "trailer floor and nose", 0, 1.0, 0.6, { css: "#f2a23b", w: 0.4 });
    reg(hits, floorHit, "trailer-floor");
    const chock = box(trailer, 0.22, 0.16, 0.2, 1.05, 0.08, 1.55, 0xf2c14b, { rough: 0.8 });
    chock.visible = false;
    const chockPick = box(g, 0.22, 0.16, 0.2, 2.4, 0.18, -1.6, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "wheel chock", 2.4, 0.5, -1.6, { css: "#f2c14b", w: 0.22 });
    reg(hits, chockPick, "wheel-chock");
    const lock = group(g, 0.9, 0.1, -2.05);
    const lockArm = box(lock, 0.14, 0.14, 0.4, 0, -0.35, -0.2, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    lockArm.visible = false;
    const lockBtn = box(lock, 0.16, 0.24, 0.1, 1.2, 1.0, 0.1, 0x2b2f34, { rough: 0.6 });
    box(lock, 0.06, 0.06, 0.04, 1.2, 1.06, 0.16, 0xd2312b, { emissive: 0xd2312b, ei: 0.8, rough: 0.4 });
    holoTag(lock, "dock lock", 1.2, 1.35, 0.1, { css: "#f2a23b", w: 0.2 });
    reg(hits, lockBtn, "dock-lock");
    const noChock = box(g, 1.2, 0.4, 0.5, 0, 0.35, -2.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drive in now?", 0, 0.75, -2.1, { css: "#d2312b", w: 0.26 });
    reg(hits, noChock, "no-chock-entry");
    // Dock plate: stored up, dragged to the trailer lip.
    const plate = group(g, -0.3, 0.1, -1.7);
    box(plate, 1.6, 0.06, 1.0, 0, 0.03, 0, 0x59636d, { rough: 0.5, metal: 0.6 });
    for (let i = -3; i <= 3; i++) box(plate, 0.02, 0.008, 0.9, i * 0.22, 0.065, 0, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(plate, "dock plate", 0, 0.4, 0, { css: "#f2a23b", w: 0.22 });
    reg(hits, plate, "dock-plate");
    const lipSocket = box(g, 1.6, 0.04, 1.0, 0, 0.12, -2.45, 0xffffff, { rough: 0.5 });
    lipSocket.visible = false; hits["trailer-lip-socket"] = lipSocket;
    const creep = box(g, 1.6, 0.06, 0.12, 0, 0.09, -2.9, 0x000000, { rough: 0.9 });
    creep.visible = false;
    const creepHit = box(g, 1.6, 0.14, 0.2, 0, 0.13, -2.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, creepHit, "trailer-creep");
    // Forklift: the kit's 5,000 lb LPG counterbalance truck (shared/fleet.js),
    // forks toward the dock. Its mast tilts, its carriage lifts and the forks
    // ride the carriage; the inspection points sit on those parts.
    const fl = group(g, 1.2, 0.1, 0.9, -0.4);
    const truck = forkliftCounterbalance(fl, 0, 0, -0.6, { ry: Math.PI, livery: { colour: 0xf2a23b, unitNumber: "12" } });
    const TP = truck.userData.parts;
    const seat = TP.seat;
    const belt = box(fl, 0.5, 0.04, 0.06, 0, 1.2, 0.02, 0xd2312b, { rough: 0.7 });
    holoTag(fl, "seatbelt", 0, 1.45, 0.02, { css: "#f2a23b", w: 0.18 });
    reg(hits, belt, "seatbelt");
    const mast = TP.mast;
    const chains = box(mast, 0.02, 1.7, 0.02, 0.16, 0.95, 0.1, 0x8b98a5, { rough: 0.4, metal: 0.8 });
    holoTag(mast, "mast chains and hoses", 0, 2.3, 0, { css: "#f2a23b", w: 0.4 });
    reg(hits, chains, "mast-chains");
    const carriage = TP.carriage;
    const forks = TP.forks;
    holoTag(forks, "forks and heel", 0, -0.1, 0.9, { css: "#f2a23b", w: 0.28 });
    const forkHit = box(forks, 0.9, 0.12, 1.1, 0, -0.02, 0.56, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, forkHit, "forks");
    const rider = standingFigure(forks, 0, 0.75, { ry: Math.PI, cloth: 0x37505f, atStation: true });
    rider.scale.setScalar(0.85);
    holoTag(rider, "ride the forks?", 0, 1.9, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, rider, "ride-forks");
    reg(hits, TP.wheels[0], "tires");
    holoTag(fl, "tires", -0.62, 0.75, -0.93, { css: "#f2a23b", w: 0.14 });
    const horn = cyl(fl, 0.05, 0.05, 0.03, 0, 1.39, -0.68, 0x1b1e23, { rough: 0.6, seg: 12 });
    holoTag(fl, "horn and lights", 0.3, 1.6, -0.68, { css: "#f2a23b", w: 0.28 });
    reg(hits, horn, "horn-lights");
    const throttle = cyl(fl, 0.03, 0.03, 0.2, 0.25, 1.2, -0.45, 0x1b1e23, { rough: 0.5, seg: 10 });
    holoTag(fl, "throttle", 0.25, 1.42, -0.45, { css: "#f2a23b", w: 0.18 });
    reg(hits, throttle, "throttle");
    const liftLever = instrument(fl, -0.3, 1.2, -0.45, { idle: "0 in", color: 0xf2a23b, w: 0.12, d: 0.18 });
    holoTag(fl, "lift / tilt", -0.3, 1.42, -0.45, { css: "#f2a23b", w: 0.2 });
    reg(hits, liftLever, "rack-height");
    // Pallet load in front of the forks, capacity plate, pick markers.
    const pallet = group(g, -0.9, 0.1, 0.6, 0.2);
    box(pallet, 1.0, 0.12, 1.0, 0, 0.06, 0, 0x8a6f5a, { rough: 0.9 });
    box(pallet, 0.9, 0.9, 0.9, 0, 0.57, 0, 0xc8b48a, { rough: 0.9 });
    decal(pallet, 0.5, 0.3, 0, 0.6, 0.451, signFace("2,450 lb\n48 in pallet", { bg: "#3b2f22", accent: "#f2c14b", scale: 0.5 }));
    const underLoad = box(pallet, 0.9, 0.5, 0.9, 0, 1.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pallet, "walk under it?", 0, 1.7, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, underLoad, "under-raised-load");
    for (const [id, dz, label] of [["forks-under", -0.6, "1 · FORKS UNDER"], ["tilt-back", 0, "2 · TILT BACK"], ["raise-travel", 0.6, "3 · RAISE 4–6 in"]]) {
      const m = group(pallet, 0.8, 0, dz);
      slab(m, 0.4, 0.02, 0.4, 0, 0.01, 0, 0xf2a23b, { radius: 0.02, rough: 0.7, opacity: 0.55, transparent: true, cast: false });
      holoTag(m, label, 0, 0.25, 0, { css: "#f2a23b", w: 0.32 });
      reg(hits, m, id);
    }
    const capPlate = instrument(fl, 0.6, 0.85, -0.2, { idle: "-- lb", color: 0xf2a23b, w: 0.13, d: 0.2, ry: Math.PI / 2 });
    holoTag(fl, "capacity plate 4,000 lb @ 24 in", 0.85, 1.1, -0.2, { css: "#f2a23b", w: 0.5 });
    reg(hits, capPlate, "capacity-plate");
    // Ramp choice markers, rack, pedestrian zone, pre-shift board.
    const rampBad = slab(g, 0.8, 0.02, 0.5, -2.2, 0.11, -1.2, 0xd2312b, { radius: 0.02, rough: 0.7, opacity: 0.45, transparent: true, cast: false });
    holoTag(g, "ramp — forward, loaded?", -2.2, 0.4, -1.2, { css: "#d2312b", w: 0.4 });
    reg(hits, rampBad, "ramp-forward-loaded");
    const rampGood = slab(g, 0.8, 0.02, 0.5, -2.2, 0.11, -0.3, 0x59c97b, { radius: 0.02, rough: 0.7, opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "ramp — reverse, load uphill", -2.2, 0.4, -0.3, { css: "#59c97b", w: 0.44 });
    reg(hits, rampGood, "ramp-reverse");
    const rack = rackFrame(g, -2.3, 1.6, { h: 2.0, ry: Math.PI / 2 });
    holoTag(rack, "rack beam 48 in", 0, 2.3, 0, { css: "#f2a23b", w: 0.3 });
    for (let i = -2; i <= 2; i++) box(g, 0.08, 0.005, 1.4, 2.6 + i * 0.16, 0.101, 1.6, 0xf2c14b, { rough: 0.8, cast: false });
    holoTag(g, "pedestrian walkway", 2.6, 0.4, 1.6, { css: "#f2c14b", w: 0.34 });
    cone(g, 2.0, -0.6);
    const board = group(g, 0.4, 0, 2.2, 0);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1a1408"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f2a23b"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe4c2"; ctx.fillText("PRE-SHIFT — TRUCK 12, DOCK 4", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fff5e8";
      ["Inspect: tires, forks, chains, horn, lights", "Belt on before the key", "Trailer: chock + dock lock BEFORE plate", "Capacity: 4,000 lb @ 24 in load centre", "Load: forks under, tilt back, 4–6 in travel", "Loaded on a ramp: forward up, reverse down", "Rack: stopped, mast vertical, 2 in over beam"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: FD_ACCENT });
    reg(hits, board, "preshift-board");
    const operator = standingFigure(g, 2.6, 0.6, { ry: -0.8, cloth: 0x37505f });
    // A picker from the next aisle. Out of the way until they are not — see
    // the interruptions above.
    const pedestrian = standingFigure(g, -3.21, 1.05, { ry: 1.2, cloth: 0x2b3138 });
    reg(hits, pedestrian, "pedestrian");
    holoTag(operator, "operator", 0, 1.9, 0, { css: "#f2a23b", w: 0.18 });

    let lifted = 0, tilt = 0, travelled = 0, rackLift = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "belt") belt.position.y = 1.02;
        if (step.id === "trailer") { chock.visible = true; chockPick.visible = false; lockArm.visible = true; }
        if (step.id === "plate") { plate.parent.remove(plate); g.add(plate); plate.position.set(0, 0.12, -2.45); plate.rotation.set(-0.12, 0, 0); }
        if (step.id === "lift") { pallet.parent.remove(pallet); forks.add(pallet); pallet.position.set(0, 0.0, 0.6); pallet.rotation.set(0, 0, 0); pallet.scale.setScalar(0.9); lifted = 0.12; tilt = 0.08; }
        if (step.id === "walk") { creepHit.visible = false; creep.visible = false; }
        void seat;
      },
      // The trailer really walks off the plate, and the picker really steps
      // into the aisle. Both are visible from the seat.
      onInterrupt(it) {
        if (it.id === "trailer-creeping") { trailer.position.z -= 0.16; creep.visible = true; }
        if (it.id === "pedestrian-in-aisle") { pedestrian.position.set(0.2, pedestrian.position.y, -0.3); pedestrian.rotation.y = -0.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "trailer-creeping") { trailer.position.z += 0.16; creep.visible = false; }
        if (it.id === "pedestrian-in-aisle") { pedestrian.position.set(-2.6, pedestrian.position.y, 1.4); pedestrian.rotation.y = 1.2; }
      },

      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "trailer") { if (session.sequence.includes("wheel-chock")) { chock.visible = true; chockPick.visible = false; } if (session.sequence.includes("dock-lock")) lockArm.visible = true; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "load") repaint(capPlate.userData.screen, signFace(`${Math.round(gg.t * 5000)} lb`, { bg: "#1c1408", accent: gg.t >= 0.3 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "rack") { rackLift = Math.max(0, gg.t - 0.3) * 2.0; repaint(liftLever.userData.screen, signFace(`${((gg.t - 0.5) * 40).toFixed(0)} in`, { bg: "#1c1408", accent: gg.t >= 0.5 && gg.t <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.62 })); }
        if (step?.id === "travel" && session.holding) travelled = Math.min(1, travelled + dt / 6);
        if (step?.id === "walk") creep.visible = true;
        carriage.position.y = 0.1 + lifted + rackLift;
        mast.rotation.x = -tilt;
        fl.position.z = 0.9 - travelled * 1.6;
        rig.position.z = 1.75 + (creep.visible ? 0.3 : 0);
      },
    };
  },
};
