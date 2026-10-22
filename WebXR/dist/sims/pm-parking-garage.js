import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, cone, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Parking Garage VR — Building Systems & Facilities, property
// management programme, zone eight of twenty.
//
// The enclosed garage under a residential building, patrolled and cleaned
// the way an SEIU porter and patrol crew works it: the patrol card and the
// CO controller log read, the air read with a handheld meter against OSHA's
// limit before anything with an engine runs, the exhaust fans put to purge,
// the level walked, an oil slick absorbed, a lane coned off, the sweeper run
// at a walking pace, the emergency callbox tested, the checkpoint scanned,
// the fans returned to automatic, the stair egress checked and the level
// written into the building log. A generic garage; no real operator,
// charger network or resident is named.

const PMPG_ACCENT = 0xe8a23a;

export const SIM_PM_PARKING_GARAGE = {
  id: "pm-parking-garage",
  index: "308",
  domain: "Property Management",
  trade: "Porter and garage patrol — SEIU building service members, with IUOE Local 39 engineers for the ventilation and CO detection system",
  category: "Building Systems & Facilities",
  indoor: "garage",
  certification: "OSHA's permissible exposure limit for carbon monoxide under 29 CFR 1910.1000, with the lower NIOSH recommended limit as the level a careful crew works to; 29 CFR 1910.22 for a garage floor kept free of oil and trip hazards and 29 CFR 1910.157 for portable extinguishers kept charged and in their cabinets; NFPA 70 for EV charging equipment and its emergency shut-off; NFPA 101 for the stair doors and exit signs of the garage's means of egress; the local building code's enclosed-garage ventilation and CO detection requirements and the storm water rules that keep oil out of the drains; SEIU building service staff and IUOE Local 39 engineers.",
  supportLine: "the SEIU member assistance line or your employer's EAP",
  name: "Parking Garage",
  title: simTitle("Parking Garage"),
  tagline: "An enclosed garage patrolled and cleaned: CO read before an engine runs, fans to purge, the level walked, oil absorbed, a lane coned, the sweeper run at a walking pace, the callbox tested, the fans back to auto and the stairs checked",
  accent: PMPG_ACCENT,
  accentCss: "#e8a23a",
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "clean-air-level", name: "Clean Air Level", note: "A garage level patrolled and swept with the air read, the alarms answered and nothing ignored" },

  game: system({
    name: "Garage Patrol",
    currency: "LEVELS",
    ranks: ["Relief Porter", "Garage Porter", "Patrol Lead", "Garage Supervisor", "Garage Patrol Certified"],
    badges: [
      { id: "alarm-answered", name: "Alarm Answered", note: "No unsafe action anywhere in the patrol", test: AWARD.safe },
      { id: "lane-closed", name: "Lane Closed", note: "The lane coned off cleanly on the first try", test: AWARD.stepClean("lane-closure") },
      { id: "air-true", name: "Air True", note: "CO reading committed near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-patrol", name: "Clean Patrol", note: "No corrections anywhere", test: AWARD.clean },
      { id: "quick-level", name: "Quick Level", note: "Inside 80% of par", test: AWARD.fast(0.8) },
      { id: "nine-checkpoints", name: "Nine Checkpoints", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "co-horn-silence": "You are silencing the CO alarm horn and carrying on with the sweep. The horn means the air on this level has gone past the level the system was set to protect people at — you cannot smell CO and you will not feel it until you are confused. Silencing it without finding the source and confirming the fans is ignoring the one warning the garage has.",
    "propane-in-stair": "You are stowing the sweeper's spare propane cylinder in the stairwell to keep it out of the way. A stair is the garage's way out in a fire; a propane cylinder there is fuel in the escape route, and a leak collects low in a closed shaft. Spare cylinders go back to the outdoor cage the fire code intends for them.",
    "storm-drain-hose": "You are hosing the oil slick towards the storm drain. That drain runs untreated to the nearest creek or bay, and the storm water rules make oil in it the building's discharge. Oil is absorbed, swept up and bagged — never washed away.",
    "gate-reach": "You are reaching through the entry gate to free a stuck ticket while the arm is powered. The arm comes down with enough force to break a forearm, and it is designed to drop the instant its loop sees nothing under it. The gate is cleared from its control box with the arm locked up, not by hand under it.",
  },

  lateNotes: {
    "patrol-wand": "The checkpoint is scanned once the level has actually been walked and swept — not on the way past at the start.",
    "building-log": "The level goes into the log at the end of the patrol.",
    "sweeper-throttle": "The sweeper does not start until the air has been read, the fans are purging and the lane is coned off.",
  },

  steps: [
    {
      id: "patrol-card", kind: "select", target: "patrol-card",
      title: "Read the patrol card and the CO controller log",
      cue: "Read tonight's patrol card and what the CO ventilation controller logged since the last round.",
      why: "The controller log shows when the CO sensors last pushed the exhaust fans to high and which sensor did it — a sensor that alarms every morning at the same time is traffic, one that alarmed at 3 a.m. is a car left running. The patrol card tells you which checkpoints and tasks are yours tonight. Together they turn a walk into a patrol.",
    },
    {
      id: "co-reading", kind: "gauge", target: "co-meter",
      title: "Read the air with the handheld CO meter",
      cue: "Hold the meter at breathing height in the drive aisle and commit only when the reading is well under the action level.",
      why: "Carbon monoxide has no smell and no colour, and an enclosed garage collects it from every car that idled on the way out this morning. OSHA's exposure limit under 29 CFR 1910.1000 is the legal ceiling; NIOSH recommends a lower one, and a careful crew reads the air before starting anything with an engine of its own.",
      gauge: {
        label: "CO — DRIVE AISLE, BREATHING HEIGHT", speed: 0.55, green: [0.05, 0.22],
        readout: (t) => `${Math.round(t * 120)} ppm CO`,
        missNote: "That reading is too high to start work under. Let the fans clear the level and read it again — nothing with an engine runs until the air is well under the limit.",
      },
    },
    {
      id: "fan-to-hand", kind: "turn", target: "fan-hoa-switch",
      title: "Put the exhaust fans on purge",
      cue: "Turn the exhaust fan selector from AUTO to HAND so the level is purging before the sweeper runs.",
      why: "In AUTO the fans wait for a sensor to see CO before they speed up, which means the air gets worse before it gets better. Putting them to HAND before running a propane sweeper purges the level ahead of the exhaust it will add, rather than chasing it — and the selector goes back to AUTO the moment the work is done.",
      turn: { turns: 0.25, axis: "z", label: "EXHAUST FANS", readout: (t) => (t < 0.95 ? "AUTO" : "HAND — PURGE") },
    },
    {
      id: "garage-walk", kind: "find", noHint: true,
      targets: ["empty-extinguisher-cabinet", "stair-light-out", "oil-slick"],
      itemNames: { "empty-extinguisher-cabinet": "extinguisher cabinet empty", "stair-light-out": "light out over the stair door", "oil-slick": "oil slick at the bottom of the ramp" },
      itemNotes: {
        "empty-extinguisher-cabinet": "The extinguisher cabinet by the column is empty. 29 CFR 1910.157 wants an extinguisher where the cabinet says there is one — a car fire in a garage is found with this cabinet.",
        "stair-light-out": "The fixture over the stair door is dark. The way out is the last place a garage can afford a shadow — for egress in a fire and for a resident walking to their car at night.",
        "oil-slick": "Fresh oil is spreading at the foot of the ramp, exactly where drivers brake and pedestrians cross.",
      },
      title: "Walk the level",
      cue: "Three things on this level need attention tonight. Find them.",
      why: "A garage is where residents are most alone and most distracted — keys, bags, children — and its faults are the ones that hurt them: a fire nobody can fight, a dark stair, a slick where they step out of the car. None of them appears on a panel; they are found by somebody walking the level with their eyes open.",
    },
    {
      id: "absorbent", kind: "drag", target: "absorbent-bag",
      title: "Spread absorbent on the oil slick",
      cue: "Carry the bag of absorbent to the slick and cover it from the edges in.",
      why: "Absorbent turns a slick that spreads under every tyre into a granular mess that can be swept up and bagged. Working from the edges in stops it spreading further, and it keeps the oil out of the floor drains — which is the difference between a clean-up and a discharge. 29 CFR 1910.22 asks for the floor to be kept free of exactly this.",
      drag: { to: "oil-slick-socket", radius: 0.6, missNote: "Not on the slick yet. Carry the absorbent right to the oil at the foot of the ramp." },
    },
    {
      id: "lane-closure", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "lane-sign"],
      itemNames: { "cone-a": "first cone placed", "cone-b": "second cone placed", "lane-sign": "LANE CLOSED sign placed" },
      title: "Cone off the lane for the sweeper",
      cue: "Place both cones and the LANE CLOSED sign across the aisle you are about to sweep.",
      why: "A ride-on sweeper is slow, loud and wide, and a driver coming down the ramp does not expect it in the aisle. Two cones and a sign turn the aisle into a work area drivers route around, and they keep residents walking to their cars on the other side of it.",
    },
    {
      id: "sweeper-run", kind: "track", target: "sweeper-throttle", seconds: 6,
      title: "Sweep the aisle at a walking pace",
      cue: "Drive the sweeper down the coned aisle and keep it at walking pace — not creeping, not racing the brush.",
      why: "A sweeper run too fast throws grit, misses the absorbent and cannot stop for a child stepping out between cars; too slow and it idles propane exhaust into the level for twice as long. Walking pace is the speed at which the brush actually picks up, the operator can see around the machine, and the engine spends the least time in the garage.",
      track: {
        start: 0.2, green: [0.38, 0.6], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "SWEEPER — GROUND SPEED",
        readout: (v) => (v < 0.38 ? "creeping — idling exhaust" : v > 0.6 ? "too fast to stop" : "walking pace"),
      },
      holdBreakNote: "The sweeper drifted off walking pace. Bring it back to a speed where the brush picks up and you can stop for anyone stepping out.",
    },
    {
      id: "callbox-check", kind: "hold", target: "garage-callbox", seconds: 5,
      title: "Test the emergency callbox",
      cue: "Press and hold the callbox button until the front desk answers and confirms they can hear you.",
      why: "The callbox is the only guaranteed way for a resident in a garage with no signal to reach help, and it fails quietly — a cut line, a dead speaker, a desk extension that changed. Holding it until a person answers is the only proof it works, and a garage patrol is the round that is supposed to prove it every night.",
      holdBreakNote: "You let go before the desk answered. Hold the button until somebody confirms they can hear you.",
    },
    {
      id: "patrol-scan", kind: "select", target: "patrol-wand",
      title: "Scan the level checkpoint",
      cue: "Scan the patrol checkpoint on the column to record that the level was walked.",
      why: "The checkpoint scan is the record that somebody was physically on this level at this time — which matters to the next shift, to a resident who reports something happened here, and to the patrol itself when a round is questioned. It is scanned after the walk, because it records the walk.",
    },
    {
      id: "fan-to-auto", kind: "turn", target: "fan-hoa-switch",
      title: "Return the exhaust fans to automatic",
      cue: "Turn the fan selector back from HAND to AUTO now the sweeper is off.",
      why: "Fans left in HAND run all night at full speed, which wastes a great deal of energy — and, worse, a selector left in HAND is often switched OFF by the next person who notices the noise, leaving the level with no CO response at all. AUTO is the position the CO sensors can actually control.",
      turn: { turns: 0.25, axis: "z", label: "EXHAUST FANS", reverse: true, readout: (t) => (t < 0.95 ? "HAND — PURGE" : "AUTO") },
    },
    {
      id: "egress-check", kind: "sequence", anyOrder: true,
      targets: ["stair-door-closer", "exit-sign-p1"],
      itemNames: { "stair-door-closer": "stair door closes and latches", "exit-sign-p1": "exit sign lit" },
      title: "Check the level's way out",
      cue: "Let the stair door swing shut to prove it latches, and check the exit sign above it is lit.",
      why: "NFPA 101 wants the stair door to self-close and latch so smoke from a car fire stays out of the stair, and the exit sign lit so the way out can be found. Both fail quietly, and a patrol checking them on the way off the level is the cheapest fire protection the garage has.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Write the level into the building log",
      cue: "Log the CO reading, the extinguisher and stair light, the oil clean-up, the CO alarm, the charger and the callbox result.",
      why: "The building log is where a CO alarm, an EV charger that smoked and an empty extinguisher cabinet become work orders with owners. It is also the record that the garage was patrolled, the air was read and the alarms were answered — which is what anyone asks first after something goes wrong down here.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with your patrol partner",
      cue: "Ask your partner how the CO alarm and the charger fire sat with them, and name the member line.",
      why: "Night patrol in a garage is lonely work, and a real alarm — a smoking charger, a CO horn — leaves adrenaline behind that has nowhere to go at 2 a.m. A short check-in with a partner, with the SEIU member assistance line named, is how a crew keeps a frightening moment from turning into a bad night.",
    },
  ],

  interrupts: [
    {
      id: "co-alarm",
      kind: "CO alarm",
      after: "sweeper-run", delay: 3, seconds: 12,
      alert: "The CO panel horn sounds and the strobe on the column starts flashing: HIGH CO — P1 NORTH. Your own sweeper is idling on propane in the middle of P1.",
      cue: "Shut the sweeper's engine off first — remove the source — then deal with the panel.",
      target: "sweeper-key",
      why: "The one CO source on this level you control is the engine under you. Switching it off stops the exhaust at once; the fans then clear what is already in the air. Anything else — acknowledging the panel, calling it in — can follow, but it should follow an engine that has stopped making the problem worse.",
      missNote: "The sweeper kept idling while the CO alarm sounded. The air on the level is still getting worse, you are still breathing it, and the alarm that was meant to protect you has been treated as background noise.",
      wrongNote: "Not first. The source is your sweeper's engine — turn the key off, then look at the panel.",
    },
    {
      id: "tenant-ev",
      kind: "Resident with an emergency",
      after: "callbox-check", delay: 2, seconds: 12,
      alert: "A resident runs over: the EV charging cable at stall 12 is smoking and smells of burning plastic, with her car still plugged in.",
      cue: "Hit the EV chargers' emergency shut-off, then keep her back from the stall.",
      target: "ev-estop",
      why: "An overheating connector is an electrical fire starting at a car that holds a very large battery. The emergency shut-off that NFPA 70 puts in reach of EV charging equipment cuts power to every charger at once, which is the first thing to do before anyone touches the cable — and then everybody stays back and the fire department is called.",
      missNote: "Nobody cut the power and the charger kept feeding the cable. A smoking connector left energised beside a car battery is how a garage fire begins.",
      wrongNote: "Not that. Cut the power with the EV emergency shut-off on the wall first — nobody touches that cable while it is live.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMPG_ACCENT);

    // ------------------------------------------------------------ slab, stall lines, drive aisle
    const slabTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#6c7278", base2: "#62686e", seam: "rgba(15,18,22,0.35)" }), { repeat: 3, px: 384 });
    const deck = box(g, 6.4, 0.01, 6.0, 0, 0.005, -0.3, 0x6c7278, { rough: 0.85, cast: false });
    deck.material = texturedMat(slabTex, { rough: 0.8, metal: 0.05, color: 0xb8bec4 });
    deck.receiveShadow = true;
    for (let i = 0; i < 4; i++) box(g, 0.08, 0.004, 1.9, -2.6 + i * 1.3, 0.012, -1.9, 0xf4f0e6, { rough: 0.8, cast: false });
    for (let i = 0; i < 6; i++) box(g, 0.5, 0.004, 0.1, -2.5 + i * 1.0, 0.012, 0.2, 0xf2c14b, { rough: 0.8, cast: false });
    decal(g, 3.0, 0.56, 0, 2.9, -6.36, signFace("PARKING LEVEL P1", { bg: "#1e160a", accent: "#e8a23a", fg: "#fbf0dc", scale: 0.48 }), { px: 512 });

    // Columns and the big exhaust duct overhead.
    for (const [x, z] of [[-2.0, -0.4], [2.0, -0.4]]) box(g, 0.5, 5.2, 0.5, x, 2.6, z, 0xa8aeb4, { rough: 0.85, finish: "concrete" });
    const duct = box(g, 6.0, 0.7, 0.9, 0, 4.6, -1.8, 0x8b949d, { rough: 0.5, metal: 0.5 });
    void duct;
    for (let i = 0; i < 3; i++) box(g, 0.6, 0.1, 0.5, -1.8 + i * 1.8, 4.2, -1.8, 0x3a4148, { rough: 0.5, metal: 0.5 });

    // ------------------------------------------------------------ parked cars
    const car = (x, z, colour) => {
      const c = group(g, x, 0, z);
      box(c, 1.1, 0.5, 2.3, 0, 0.45, 0, colour, { rough: 0.35, metal: 0.5 });
      box(c, 0.95, 0.4, 1.2, 0, 0.9, -0.1, colour, { rough: 0.35, metal: 0.5 });
      box(c, 0.9, 0.32, 1.1, 0, 0.92, -0.1, 0x2b3a4a, { rough: 0.1, metal: 0.4, opacity: 0.7, transparent: true });
      for (const sx of [-0.52, 0.52]) for (const sz of [-0.75, 0.75]) cyl(c, 0.2, 0.2, 0.14, sx, 0.2, sz, 0x1b1e22, { rough: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
      return c;
    };
    car(-1.95, -2.0, 0x8a2a2a);
    const evCar = car(0.65, -2.0, 0xdfe4e8);
    void evCar;

    // EV charger pedestal at stall 12 with its cable.
    const ev = group(g, 1.3, 0, -2.9);
    box(ev, 0.3, 1.3, 0.2, 0, 0.65, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const evLamp = box(ev, 0.18, 0.04, 0.02, 0, 1.1, 0.105, 0x59c97b, { rough: 0.4, emissive: 0x59c97b, ei: 1.2 });
    decal(ev, 0.2, 0.08, 0, 0.9, 0.102, signFace("STALL 12", { bg: "#1b1e22", accent: "#e8a23a", scale: 0.5 }), { px: 128 });
    for (let i = 0; i < 4; i++) {
      const seg = cyl(ev, 0.02, 0.02, 0.3, -0.1 - i * 0.12, 0.7 - i * 0.12, 0.2 + i * 0.1, 0x1b1e22, { rough: 0.6, seg: 6 });
      seg.rotation.x = 0.6; seg.rotation.z = 0.4;
    }
    const smoke = particles(ev, 24, 0x6a6a6a, { size: 0.05, life: 0.9, additive: false, opacity: 0.4 });
    smoke.position.set(-0.4, 0.4, 0.5);
    smoke.visible = false;
    const estop = group(g, 2.55, 1.4, -1.9, -Math.PI / 2);
    box(estop, 0.24, 0.3, 0.1, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    cyl(estop, 0.06, 0.06, 0.05, 0, -0.02, 0.07, 0xc8201a, { rough: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    decal(estop, 0.2, 0.05, 0, 0.11, 0.052, signFace("EV EMERGENCY OFF", { bg: "#f2c14b", accent: "#c8201a", fg: "#1b1e22", scale: 0.5 }), { px: 128 });
    holoTag(estop, "EV emergency shut-off", 0, 0.24, 0.05, { css: "#e8a23a", w: 0.4 });
    reg(hits, estop, "ev-estop");

    // ------------------------------------------------------------ CO panel, sensor, fans
    const coPanel = group(g, -2.55, 0, -1.4, Math.PI / 2);
    box(coPanel, 0.5, 0.6, 0.14, 0, 1.5, 0, 0xdfe4e8, { rough: 0.5, metal: 0.3 });
    const coFace = decal(coPanel, 0.4, 0.22, 0, 1.6, 0.072, signFace("CO  P1 N 8 ppm\nCO  P1 S 6 ppm", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.26 }), { glow: true, ei: 0.8, px: 256 });
    const coLamp = ball(coPanel, 0.02, 0.15, 1.35, 0.075, 0x3a1a18, { rough: 0.4, seg: 8 });
    const silenceBtn = box(coPanel, 0.1, 0.05, 0.03, -0.1, 1.33, 0.075, 0xf2c14b, { rough: 0.5 });
    holoTag(coPanel, "Silence CO horn?", -0.1, 1.2, 0.08, { css: "#f0645b", w: 0.32 });
    reg(hits, silenceBtn, "co-horn-silence");
    const hoa = group(coPanel, 0.0, 1.05, 0.08);
    box(hoa, 0.14, 0.14, 0.03, 0, 0, 0, 0x3a4148, { rough: 0.5 });
    const hoaKnob = group(hoa, 0, 0, 0.02);
    box(hoaKnob, 0.02, 0.08, 0.02, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    hoa.userData.wheel = hoaKnob;
    decal(hoa, 0.12, 0.03, 0, -0.09, 0.016, signFace("HAND  OFF  AUTO", { bg: "#3a4148", accent: "#3a4148", fg: "#ffffff", scale: 0.7 }), { px: 128 });
    holoTag(hoa, "Exhaust fan selector", 0, 0.13, 0.02, { css: "#e8a23a", w: 0.36 });
    reg(hits, hoa, "fan-hoa-switch");
    const strobe = group(g, -2.0, 2.4, -0.13);
    box(strobe, 0.14, 0.2, 0.06, 0, 0, 0, 0xc8201a, { rough: 0.5 });
    const strobeLens = box(strobe, 0.1, 0.06, 0.03, 0, 0.04, 0.04, 0x5a4a4a, { rough: 0.3 });
    const sensor = group(g, 2.0, 1.6, -0.13);
    box(sensor, 0.12, 0.16, 0.05, 0, 0, 0, 0xf4f6f8, { rough: 0.5 });
    decal(sensor, 0.08, 0.03, 0, 0.03, 0.027, signFace("CO", { bg: "#0d1c14", accent: "#59c97b", scale: 0.6 }), { glow: true, ei: 0.6, px: 64 });

    // Handheld CO meter on the patrol cart.
    const cart = group(g, -1.1, 0, 0.9);
    box(cart, 0.8, 0.05, 0.5, 0, 0.8, 0, 0x3a4148, { rough: 0.5, metal: 0.4 });
    box(cart, 0.8, 0.05, 0.5, 0, 0.3, 0, 0x3a4148, { rough: 0.5, metal: 0.4 });
    for (const sx of [-0.37, 0.37]) for (const sz of [-0.22, 0.22]) cyl(cart, 0.012, 0.012, 0.8, sx, 0.4, sz, 0x6d7379, { rough: 0.5, metal: 0.5, seg: 6 });
    const meter = group(cart, -0.2, 0.84, 0);
    box(meter, 0.1, 0.04, 0.18, 0, 0, 0, 0xf2c14b, { rough: 0.55 });
    const meterFace = decal(meter, 0.08, 0.06, 0, 0.022, -0.03, signFace("-- ppm", { bg: "#0d1c24", accent: "#e8a23a", fg: "#bfeaf7", scale: 0.45 }), { glow: true, ei: 0.85, px: 128 });
    meterFace.rotation.x = -Math.PI / 2;
    holoTag(meter, "CO meter", 0, 0.14, 0, { css: "#e8a23a", w: 0.2 });
    reg(hits, meter, "co-meter");
    const absorb = group(cart, 0.2, 0.84, 0);
    box(absorb, 0.28, 0.16, 0.2, 0, 0.08, 0, 0x8a6a3a, { rough: 0.85 });
    decal(absorb, 0.2, 0.08, 0, 0.1, 0.102, signFace("ABSORBENT", { bg: "#8a6a3a", accent: "#f2c14b", fg: "#fbf0dc", scale: 0.5 }), { px: 128 });
    holoTag(absorb, "Absorbent", 0, 0.26, 0, { css: "#e8a23a", w: 0.22 });
    reg(hits, absorb, "absorbent-bag");
    const cardFace = decal(cart, 0.2, 0.26, 0.05, 0.83, -0.12, paperFace("PATROL P1", ["CO read · fans", "Walk · sweep", "Callbox · checkpoint", "Egress · log"], { band: "#8a5a1a" }), { px: 192 });
    cardFace.rotation.x = -Math.PI / 2;
    reg(hits, cardFace, "patrol-card");

    // ------------------------------------------------------------ ramp foot, slick, drain, gate
    const ramp = group(g, 1.6, 0, 1.3);
    const rampSlab = box(ramp, 1.6, 0.3, 1.8, 0.4, 0.15, 0.6, 0x7a8086, { rough: 0.85 });
    rampSlab.rotation.x = -0.12;
    const slick = slab(g, 0.9, 0.006, 0.6, 1.3, 0.014, 0.3, 0x14100a, { radius: 0.2, rough: 0.05, metal: 0.5, cast: false });
    const slickMark = box(g, 0.6, 0.04, 0.4, 1.3, 0.03, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Oil", 1.3, 0.2, 0.3, { css: "#e8a23a", w: 0.14 });
    reg(hits, slickMark, "oil-slick");
    const slickSocket = box(g, 0.4, 0.1, 0.4, 1.3, 0.2, 0.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["oil-slick-socket"] = slickSocket;
    const granules = slab(g, 0.95, 0.012, 0.65, 1.3, 0.02, 0.3, 0x9a7a4a, { radius: 0.2, rough: 1.0, cast: false });
    granules.visible = false;
    const drainG = group(g, 0.6, 0.012, 1.1);
    box(drainG, 0.4, 0.006, 0.3, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.5 });
    for (let i = -3; i <= 3; i++) box(drainG, 0.02, 0.008, 0.28, i * 0.05, 0.002, 0, 0x22262b, { rough: 0.5 });
    decal(drainG, 0.3, 0.06, 0, 0.008, 0.2, signFace("DRAINS TO BAY", { bg: "#2f5a9a", accent: "#2f5a9a", fg: "#ffffff", scale: 0.6 }), { px: 128 }).rotation.x = -Math.PI / 2;
    const hose = group(g, 0.2, 0, 1.5);
    torus(hose, 0.2, 0.03, 0, 0.04, 0, 0x2f7d4a, { rough: 0.6, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    cyl(hose, 0.02, 0.02, 0.3, 0.25, 0.04, -0.15, 0x2f7d4a, { rough: 0.6, seg: 6 }).rotation.x = Math.PI / 2;
    holoTag(hose, "Hose the oil to the drain?", 0.1, 0.25, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, hose, "storm-drain-hose");
    const gate = group(g, 2.5, 0, 2.2);
    box(gate, 0.3, 1.0, 0.3, 0, 0.5, 0, 0xe8a23a, { rough: 0.5 });
    const arm = box(gate, 0.06, 0.06, 1.8, 0, 0.95, -0.95, 0xf4f0e6, { rough: 0.4 });
    for (let i = 0; i < 4; i++) box(gate, 0.065, 0.065, 0.2, 0, 0.95, -0.3 - i * 0.45, 0xc8201a, { rough: 0.4 });
    void arm;
    const gateReach = box(gate, 0.2, 0.3, 0.3, 0, 0.7, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(gate, "Reach under the arm?", 0, 1.25, -0.4, { css: "#f0645b", w: 0.36 });
    reg(hits, gateReach, "gate-reach");

    // ------------------------------------------------------------ cones, sign, sweeper
    const coneA = cone(g, -0.6, 1.6);
    reg(hits, coneA, "cone-a");
    const coneB = cone(g, 0.2, 2.2);
    reg(hits, coneB, "cone-b");
    const laneSign = group(g, -1.5, 0, 1.9, 0.3);
    for (const s of [-1, 1]) { const p = box(laneSign, 0.5, 0.7, 0.014, 0, 0.34, s * 0.09, 0xf2c14b, { rough: 0.5 }); p.rotation.x = s * 0.25; }
    decal(laneSign, 0.38, 0.22, 0, 0.42, 0.18, signFace("LANE\nCLOSED", { bg: "#f2c14b", accent: "#1b1e22", fg: "#1b1e22", scale: 0.34 }), { px: 128 });
    reg(hits, laneSign, "lane-sign");
    const sweeper = group(g, -0.3, 0, -0.6, 0.2);
    box(sweeper, 0.8, 0.5, 1.2, 0, 0.4, 0, 0xe8a23a, { rough: 0.5, metal: 0.2 });
    box(sweeper, 0.5, 0.1, 0.4, 0, 0.72, 0.2, 0x1b1e22, { rough: 0.7 });
    box(sweeper, 0.5, 0.4, 0.08, 0, 0.92, 0.38, 0x1b1e22, { rough: 0.7 });
    const wheel = torus(sweeper, 0.12, 0.015, 0, 1.0, -0.2, 0x1b1e22, { rough: 0.6, seg: 6, seg2: 16 });
    wheel.rotation.x = -0.9;
    cyl(sweeper, 0.015, 0.015, 0.4, 0, 0.8, -0.28, 0x3a4148, { rough: 0.5, seg: 6 }).rotation.x = -0.9;
    const brush = cyl(sweeper, 0.14, 0.14, 0.9, 0, 0.14, -0.55, 0x3a2a1a, { rough: 0.9, seg: 12 });
    brush.rotation.z = Math.PI / 2;
    cyl(sweeper, 0.12, 0.12, 0.4, 0.3, 0.72, -0.35, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const throttle = box(sweeper, 0.08, 0.04, 0.12, 0.25, 0.66, -0.1, 0x3a4148, { rough: 0.5 });
    holoTag(sweeper, "Sweeper throttle", 0.25, 1.25, -0.1, { css: "#e8a23a", w: 0.32 });
    reg(hits, throttle, "sweeper-throttle");
    const keySw = box(sweeper, 0.04, 0.04, 0.04, -0.25, 0.68, -0.1, 0xd8b23a, { rough: 0.3, metal: 0.8 });
    holoTag(sweeper, "Engine key", -0.25, 1.05, -0.1, { css: "#e8a23a", w: 0.22 });
    reg(hits, keySw, "sweeper-key");
    const exhaust = particles(sweeper, 16, 0x8a8a8a, { size: 0.04, life: 0.7, additive: false, opacity: 0.3 });
    exhaust.position.set(0.3, 0.72, 0.6);
    exhaust.visible = false;

    // ------------------------------------------------------------ stair door, callbox, extinguisher cabinet, checkpoint
    const stair = group(g, -2.2, 0, 1.6, Math.PI / 2);
    for (const sx of [-0.52, 0.52]) box(stair, 0.08, 2.2, 0.16, sx, 1.1, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    box(stair, 1.12, 0.1, 0.16, 0, 2.2, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    box(stair, 0.96, 2.12, 0.05, 0, 1.06, 0.02, 0x8a5a2a, { rough: 0.5, metal: 0.3 });
    decal(stair, 0.3, 0.16, 0, 1.55, 0.05, signFace("STAIR B", { bg: "#f4efe4", accent: "#b81410", fg: "#1b1e22", scale: 0.45 }), { px: 128 });
    const closer = box(stair, 0.3, 0.05, 0.06, 0.25, 2.05, 0.08, 0x3c444c, { rough: 0.4, metal: 0.6 });
    holoTag(stair, "Door closer", 0.25, 1.92, 0.1, { css: "#e8a23a", w: 0.24 });
    reg(hits, closer, "stair-door-closer");
    const exitFace = decal(stair, 0.34, 0.14, 0, 2.45, 0.09, signFace("EXIT", { bg: "#3a0c0c", accent: "#b81410", fg: "#ff4a3a", scale: 0.7 }), { glow: true, ei: 0.9, px: 128 });
    reg(hits, exitFace, "exit-sign-p1");
    const lamp = group(stair, 0.0, 2.75, 0.2);
    box(lamp, 0.5, 0.08, 0.16, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.4 });
    const lampLens = box(lamp, 0.46, 0.02, 0.12, 0, -0.05, 0, 0x2a2a2a, { rough: 0.4 });
    reg(hits, lampLens, "stair-light-out");
    const propane = group(stair, -0.3, 0, 0.3);
    cyl(propane, 0.14, 0.14, 0.55, 0, 0.3, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 14 });
    torus(propane, 0.08, 0.015, 0, 0.62, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 6, seg2: 12 }).rotation.x = Math.PI / 2;
    holoTag(propane, "Stow the spare propane here?", 0, 0.82, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, propane, "propane-in-stair");
    const callbox = group(g, 2.0, 1.35, 0.13);
    box(callbox, 0.2, 0.3, 0.06, 0, 0, 0, 0x2f5a9a, { rough: 0.5 });
    cyl(callbox, 0.035, 0.035, 0.02, 0, -0.05, 0.035, 0xc8201a, { rough: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    decal(callbox, 0.16, 0.06, 0, 0.09, 0.032, signFace("EMERGENCY", { bg: "#2f5a9a", accent: "#ffffff", fg: "#ffffff", scale: 0.5 }), { px: 128 });
    holoTag(callbox, "Callbox", 0, 0.22, 0.03, { css: "#e8a23a", w: 0.18 });
    reg(hits, callbox, "garage-callbox");
    const extCab = group(g, -2.0, 1.1, -0.13);
    box(extCab, 0.3, 0.6, 0.12, 0, 0, 0.02, 0xc8201a, { rough: 0.5, metal: 0.3 });
    const extInside = box(extCab, 0.24, 0.52, 0.01, 0, 0, 0.085, 0x14171b, { rough: 0.9 });
    holoTag(extCab, "Extinguisher cabinet", 0, 0.4, 0.08, { css: "#e8a23a", w: 0.36 });
    reg(hits, extInside, "empty-extinguisher-cabinet");
    const newExt = cyl(extCab, 0.06, 0.06, 0.4, 0, 0, 0.06, 0xc8201a, { rough: 0.45, metal: 0.3, seg: 12 });
    newExt.visible = false;
    const checkpoint = group(g, 2.0, 1.0, 0.13);
    cyl(checkpoint, 0.04, 0.04, 0.02, 0, 0, 0, 0x1b1e22, { rough: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(checkpoint, "Patrol checkpoint", 0, -0.1, 0.02, { css: "#e8a23a", w: 0.3 });
    reg(hits, checkpoint, "patrol-wand");

    // ------------------------------------------------------------ boards
    const logBoard = holoPanel(g, 0.52, 0.36, -2.4, 1.75, 0.3, (cx, w, h) => {
      cx.fillStyle = "rgba(24,16,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e8a23a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbf0dc"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e6cfa6";
      ["CO read · fans · alarm", "Oil · extinguisher · light", "Charger · callbox"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 1.2, accent: PMPG_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, 2.4, 1.75, 1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Porter · patrol partner", w / 2, h * 0.56);
      cx.fillText("SEIU member assistance line", w / 2, h * 0.74);
    }, { ry: -1.2, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // ------------------------------------------------------------ people
    const partner = standingFigure(g, -1.3, -0.9, { ry: 0.8, cloth: 0x2f4a6a, trousers: 0x22272d, vest: 0xd8e33a });
    const resident = standingFigure(g, 1.0, -0.9, { ry: -2.8, cloth: 0x6a4a7a, trousers: 0x2b3138, atStation: true });
    resident.visible = false;

    let sweeping = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 1.1, -1.4),

      onStep(step) {
        if (step.id === "sweeper-run") { sweeping = true; exhaust.visible = true; }
      },

      onStepComplete(step) {
        if (step.id === "co-reading") repaint(meterFace, signFace("9 ppm", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.45 }));
        if (step.id === "garage-walk") { newExt.visible = true; lampLens.material = mat(0xfff4dc, { emissive: 0xfff4dc, ei: 1.4 }); }
        if (step.id === "absorbent") { granules.visible = true; slick.visible = false; absorb.visible = false; }
        if (step.id === "sweeper-run") { sweeping = false; exhaust.visible = false; granules.visible = false; sweeper.position.set(-0.3, 0, 0.2); }
        if (step.id === "fan-to-auto") repaint(coFace, signFace("CO  P1 N 7 ppm\nFANS AUTO", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.26 }));
        if (step.id === "egress-check") { coneA.visible = false; coneB.visible = false; laneSign.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "co-alarm") {
          coLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2 });
          strobeLens.material = mat(0xffffff, { emissive: 0xffffff, ei: 2.5 });
          repaint(coFace, signFace("HIGH CO\nP1 NORTH 64 ppm", { bg: "#2a0e0c", accent: "#f0645b", fg: "#ffd2ce", scale: 0.28 }));
        }
        if (it.id === "tenant-ev") { resident.visible = true; smoke.visible = true; evLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0 }); }
      },
      onInterruptEnd(it) {
        if (it.id === "co-alarm") {
          if (it.resolved === "answered") { sweeping = false; exhaust.visible = false; }
          strobeLens.material = mat(0x5a4a4a, { rough: 0.3 });
          coLamp.material = mat(0x3a1a18, { rough: 0.4 });
          repaint(coFace, signFace("CO  P1 N 31 ppm\nFANS HIGH", { bg: "#2a2010", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.26 }));
        }
        if (it.id === "tenant-ev") {
          resident.visible = false;
          if (it.resolved === "answered") { smoke.visible = false; evLamp.material = mat(0x3a3a3a, { rough: 0.5 }); }
        }
      },

      animate(t, dt, session) {
        partner.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        if (sweeping) {
          brush.rotation.x = t * 6;
          if (exhaust.userData.step) exhaust.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.02, 0.3, 0.2);
          if (session?.track) sweeper.position.z = -0.6 + session.track.v * 0.5;
        }
        if (smoke.visible && smoke.userData.step) smoke.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.04, 0.5, 0.4);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "co-reading") {
          repaint(meterFace, signFace(`${Math.round(gg.t * 120)} ppm`, { bg: "#0d1c24", accent: gg.t > 0.05 && gg.t < 0.22 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.45 }));
        }
      },
    };
  },
};
