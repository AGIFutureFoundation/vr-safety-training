import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
  gradientFill, noiseTexture, grimeOverlay,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag,
  standingFigure, surfaceTexture, texturedMat, paintedSteelFace, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Car Top Inspection Station and Ride VR — IUEC elevator
// constructors, periodic maintenance. Riding the car top on inspection
// operation is how a mechanic sees the parts of a hoistway a passenger never
// does — the crosshead clearance, the traveling cable, the door hangers from
// above — and it is also the one job on this whole platform where the floor
// under a mechanic's feet is itself the thing moving.

const EWCTR_ACCENT = 0x4fd1ff;

/** Poured epoxy machine-room floor: pale grey-blue with a faint sheen. */
function ewctrEpoxyFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#3a4650"], [1, o.base2 ?? "#313c45"]]);
  noiseTexture(g, w, h, { density: 1600, alpha: 0.05, tone: "220,230,235" });
  noiseTexture(g, w, h, { density: 2200, alpha: 0.06, tone: "0,0,0" });
  const tiles = o.tiles ?? 3, t = w / tiles;
  g.fillStyle = "rgba(0,0,0,0.25)";
  for (let i = 1; i < tiles; i++) { g.fillRect(i * t - 1, 0, 2, h); g.fillRect(0, i * t - 1, w, 2); }
}

export const SIM_EW_CAR_TOP_INSPECTION_STATION_AND_RIDE = {
  id: "ew-car-top-inspection-station-and-ride",
  index: "355",
  domain: "Facilities",
  trade: "Elevator constructor / mechanic — IUEC",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "IUEC elevator constructors; NEIEP apprenticeship curriculum for car-top inspection procedure; ASME A17.1 the safety code for elevators and escalators, whose inspection-operation and clearance provisions this station follows; OSHA 29 CFR 1910.147 control of hazardous energy for the car-top station's own stop switch",
  name: "Car Top Inspection Station and Ride",
  title: simTitle("Car Top Inspection Station and Ride"),
  tagline: "Riding the car top on inspection operation: enable, stop switch, direction, crosshead clearance, traveling cable and door hangers checked from above",
  accent: EWCTR_ACCENT,
  accentCss: "#4fd1ff",
  parSeconds: 255,
  footprint: 2.2,
  badge: { id: "cartop-certified", name: "Car Top Certified", note: "A full inspection ride with the stop switch never unconfirmed and clearance checked at every stop" },

  game: system({
    name: "Car Top Authority",
    currency: "CLEARANCE",
    ranks: ["Helper", "Car Top Mechanic", "Adjuster", "Lead Mechanic", "Car Top Authority Certified"],
    badges: [
      { id: "switch-before-ride", name: "Switch Before Ride", note: "Never rode the car top before the stop switch was confirmed", test: AWARD.stepClean("stop-switch") },
      { id: "steady-ride", name: "Steady Ride", note: "Held both the ride speed and the clearance reading near band centre", test: AWARD.precise(0.7) },
      { id: "clean-exit", name: "Clean Exit", note: "Restored in the correct order, no correction", test: AWARD.stepClean("exit-restore") },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ride-held", name: "Ride Held", note: "Never dropped out of the inspection speed band", test: AWARD.unbroken },
      { id: "ride-fast", name: "Ride Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cartop-edge-unrailed": "You leaned past the car-top rail before the car-top stop switch was confirmed engaged. The rail marks the edge; it does not stop the car, and a car that can still answer a call can carry you into the overhead the instant you are not braced for it.",
    "traveling-cable-snag": "You put a hand near the traveling cable loop while the car was moving. That loop flexes against the hoistway wall on every trip it makes, and a hand caught between the cable and the wall at running speed does not have time to let go before it is pinned.",
    "crosshead-clearance-zone": "You stood directly under the crosshead before confirming the car was on inspection operation at reduced speed. Full clearance above the car assumes a car that stops the instant a button is released — at normal speed that assumption is not one a mechanic standing here gets to rely on.",
    "unattended-direction-switch": "You stepped away from the inspection station with the direction switch still engaged. A car that is still commanded to move the moment nobody's hand is on the switch is a car that can creep on its own, which is the exact failure inspection operation's constant-pressure controls exist to prevent.",
  },

  lateNotes: {
    "ride-control": "The ride only runs once the stop switch, the enable and a direction have all been confirmed in that order.",
    "clearance-gauge": "Clearance is only read once the car has actually stopped, not while it is still moving.",
  },

  supportLine: "your IUEC local's member assistance programme, or the NEIEP training coordinator for anything about the certification record",

  steps: [
    {
      id: "checkin", kind: "select", target: "job-ticket",
      title: "Check in at the machine room",
      cue: "Read the job ticket and confirm which car this inspection ride is for.",
      why: "A building can run several cars from machine rooms close enough together that a mechanic can lose track of which one they isolated, and the ticket is read here so the car actually ridden is the car actually taken out of service for everyone else.",
    },
    {
      id: "permit", kind: "select", target: "inspection-permit",
      title: "Post the inspection work order",
      cue: "Read the work order and confirm landing signage is posted before the hatch opens.",
      why: "Every landing this car serves gets signage before the hatch opens, because a passenger who presses a call button during this ride has no way of knowing there is a mechanic standing on the roof of the car that would have answered it.",
    },
    {
      id: "level-check", kind: "gauge", target: "landing-zone-gauge",
      title: "Confirm the car is level with the landing",
      cue: "Read the landing-zone indicator and commit once the car sits inside the level band.",
      why: "Stepping across a threshold onto a car top assumes that threshold and the car are actually level with each other, and a car parked a little off from re-leveling is a step down or up nobody is expecting with their hands full of tools. It is checked on the indicator, not guessed from how the sill looks.",
      gauge: {
        label: "LANDING ZONE", speed: 0.6, green: [0.44, 0.56],
        readout: (t) => (t > 0.44 && t < 0.56 ? "LEVEL" : t < 0.44 ? "LOW" : "HIGH"),
        missNote: "Not level. Bring the car back into the zone before anyone steps across onto it.",
      },
    },
    {
      id: "cartop-access", kind: "select", target: "car-top-hatch",
      title: "Open the car-top access",
      cue: "Open the hatch and step onto the car top.",
      why: "The hatch is opened from the landing with the car already at that floor, never climbed through while the car is between floors. Once it is open, everything about this car's next move is decided from the station standing on its roof, not from a button in the lobby.",
    },
    {
      id: "crosshead-inspect", kind: "find", noHint: true,
      targets: ["narrow-crosshead-gap", "damaged-traveling-cable", "loose-door-hanger"],
      itemNames: {
        "narrow-crosshead-gap": "a crosshead clearance that looks tight", "damaged-traveling-cable": "traveling cable jacket with visible wear", "loose-door-hanger": "a door hanger roller riding loose",
      },
      itemNotes: {
        "narrow-crosshead-gap": "A crosshead clearance that reads tight against the car's own data plate gets measured properly and written up before the car rides through it again — not eyeballed and left for the next visit.",
        "damaged-traveling-cable": "A worn traveling cable jacket exposes the conductors inside it to exactly the flexing and chafing the jacket was there to absorb, and that wear only gets worse with every trip the car makes.",
        "loose-door-hanger": "A hanger roller riding loose in its track is how a door starts binding, and it is far easier to see from the roof of the car than from inside the cab.",
      },
      title: "Walk the car top before riding it",
      cue: "Look over the crosshead, the traveling cable and the door hangers. Three things need fixing before this car moves.",
      why: "Everything on this car top is inspected standing still, before it is trusted while moving — a defect that is easy to catch with the car parked is much harder to catch on a ride that is also asking a mechanic to watch overhead clearance and mind their footing.",
    },
    {
      id: "inspection-enable", kind: "select", target: "enable-switch",
      title: "Arm the inspection station",
      cue: "Confirm the car-top inspection station's enable switch is ON.",
      why: "Enable is what hands control of this car to the station under the mechanic's own hand, cutting out the automatic calls and the door operator along with it. Nothing about this car answers the lobby again until this same station releases it.",
    },
    {
      id: "stop-switch", kind: "select", target: "cartop-stop-switch",
      title: "Confirm the car-top stop switch",
      cue: "Confirm the car-top stop switch is ON before anyone commits weight to the car top rail.",
      why: "This switch is independent of the enable switch and of anything in the machine room, and it protects the one person standing where a machine room isolation cannot reach — on top of the car itself, where the only control that matters is the one within arm's reach.",
    },
    {
      id: "direction-select", kind: "turn", target: "direction-selector",
      title: "Select a direction",
      cue: "Turn the direction selector to UP before touching the run control.",
      why: "The selector is set deliberately, watching which way it is pointed, rather than nudged and corrected once the car starts moving — a car that starts moving the wrong direction on inspection operation is still moving, and the crosshead clearance above it is not designed around a mechanic's surprise.",
      turn: { turns: 0.2, axis: "z", label: "DIRECTION" },
    },
    {
      id: "ride-up", kind: "track", target: "ride-control", seconds: 8,
      title: "Ride up on inspection speed",
      cue: "Hold the run control and keep the car's speed inside the inspection speed band as it climbs.",
      why: "Inspection speed is slow enough that the car top's own momentum is never the danger; what is dangerous is a mechanic who lets the speed creep toward normal operation because the ride feels routine by the fourth floor. The band is watched the whole way, not just at the start.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "INSPECTION SPEED", readout: (v) => (v < 0.4 ? "too slow — losing control feel" : v > 0.6 ? "too fast — over inspection speed" : "in band") },
      holdBreakNote: "You let go and the car stopped, which is exactly what constant pressure is for. Take the control again and hold the speed in band for the rest of the climb.",
    },
    {
      id: "overhead-clearance", kind: "gauge", target: "clearance-gauge",
      title: "Measure the crosshead clearance",
      cue: "Stop level with the tight spot and commit the clearance reading against the car's data plate minimum.",
      why: "A clearance that looked tight from below is measured properly now that the car is actually stopped there — a number against the data plate's own minimum, not an impression carried up from the crosshead-inspect walk.",
      gauge: {
        label: "CROSSHEAD CLEARANCE", speed: 0.55, green: [0.42, 0.62],
        readout: (t) => `${Math.round(400 + t * 400)} mm`,
        missNote: "Below the data plate minimum. This gets written up and escalated before the car goes back to normal operation, not adjusted from the car top.",
      },
    },
    {
      id: "cable-inspect", kind: "select", target: "traveling-cable",
      title: "Check the traveling cable loop",
      cue: "Look over the traveling cable's loop and hitch point now that the car is stopped beside it.",
      why: "The loop is checked stopped, at a point in the travel most inspections never pause at, because a cable that chafes against the hoistway wall does it at a handful of specific points in the run and a routine ride from the lobby never stops there to look.",
    },
    {
      id: "ride-down", kind: "track", target: "ride-control", seconds: 7,
      title: "Ride back down on inspection speed",
      cue: "Turn the direction selector to DOWN, then hold the run control and keep the speed in band on the way back.",
      why: "The return trip gets the same discipline as the climb — the inspection speed band watched the whole way — because the car top does not know the difference between a mechanic paying attention on the way up and one who has relaxed on the way down.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "INSPECTION SPEED", readout: (v) => (v < 0.4 ? "too slow — losing control feel" : v > 0.6 ? "too fast — over inspection speed" : "in band") },
      holdBreakNote: "You let go and the car stopped, which is exactly what constant pressure is for. Take the control again and hold the speed in band for the rest of the descent.",
    },
    {
      id: "exit-restore", kind: "sequence",
      targets: ["direction-selector", "cartop-stop-switch", "enable-switch"],
      itemNames: { "direction-selector": "direction selector", "cartop-stop-switch": "car-top stop switch", "enable-switch": "enable switch" },
      title: "Stand the car top down in the correct order",
      cue: "Neutral the direction selector, release the car-top stop switch, then release the enable switch.",
      why: "Direction comes off first so the car cannot be commanded to move by anything left engaged; the stop switch is released only once the mechanic is already at the hatch and clear; the enable switch is released last because it is what has been keeping this car answering to the roof and nowhere else.",
      outOfOrderNote: "Wrong order — direction to neutral first, then the stop switch once you are clear, and the enable switch released last.",
    },
    {
      id: "log", kind: "select", target: "cartop-log",
      title: "Log the inspection ride",
      cue: "Write the clearance reading and today's findings on the car-top log.",
      why: "The next mechanic who rides this car top reads this log before they ride it themselves, and a clearance number that goes unwritten today is a number somebody else has to remeasure from a standing start.",
    },
  ],

  interrupts: [
    {
      id: "call-during-ride",
      kind: "Call registered",
      after: "ride-up", delay: 4, seconds: 12,
      alert: "A hall call has just registered downstairs while you are still on top of the car mid-ride.",
      cue: "Prove the car-top stop switch is still holding before anything else.",
      target: "cartop-stop-switch",
      why: "A registered call on a car that is supposed to be under inspection control means either the enable has failed or the switch was knocked off its detent somewhere in the ride — either way, nothing continues until the stop switch is confirmed still holding, with the mechanic's own hand on it.",
      missNote: "The call sat there registered with the switch unconfirmed. If that switch had actually failed, the first sign would have been the car answering the call with a mechanic still standing on top of it.",
      wrongNote: "It is the car-top stop switch. A call registering on a car that should not be answering anything is the only thing worth checking right now.",
    },
    {
      id: "normal-op-attempt",
      kind: "Normal operation attempted",
      after: "cable-inspect", delay: 4, seconds: 11,
      alert: "Someone at the controller has just tried to switch this car back to normal operation while you are still on the roof.",
      cue: "Reassert the enable switch before this car answers anything but you.",
      target: "enable-switch",
      why: "Inspection operation only holds this car to the roof station as long as the enable switch says so, and somebody at the controller who does not know a mechanic is still up here has just tried to hand control back to the lobby. The enable switch gets reasserted before anything else happens.",
      missNote: "The attempt to switch back to normal operation went unanswered. A car that starts taking lobby calls with a mechanic still on its roof is exactly the failure inspection operation exists to prevent.",
      wrongNote: "It is the enable switch. Whoever is at the controller needs this car to stay yours until you are off it, not theirs.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, EWCTR_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => ewctrEpoxyFace(cx, w, h, {}), { repeat: 3, px: 320 });
    const floor = box(g, 4.6, 0.1, 4.2, 0, 0.05, 0, 0x3a4650, { rough: 0.6, metal: 0.15 });
    floor.material = texturedMat(floorTex, { rough: 0.55, metal: 0.15, color: 0x3a4650 });

    // ---------------------------------------------------------- hoistway shell
    const wallTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#3d5a6b", base2: "#33495a" }), { repeat: 2, px: 320 });
    const wallMat = () => texturedMat(wallTex, { rough: 0.6, metal: 0.35, color: 0x3d5a6b });
    const shaft = group(g, 0, 0, -1.4);
    const back = box(shaft, 2.4, 3.2, 0.2, 0, 1.6, -0.9, 0x3d5a6b, { rough: 0.6 });
    back.material = wallMat();
    const sideL = box(shaft, 0.2, 3.2, 1.8, -1.2, 1.6, 0, 0x3d5a6b, { rough: 0.6 });
    sideL.material = wallMat();
    const sideR = box(shaft, 0.2, 3.2, 1.8, 1.2, 1.6, 0, 0x3d5a6b, { rough: 0.6 });
    sideR.material = wallMat();

    // The car and its top, riding a visible rail up and down the shaft.
    const car = group(shaft, 0, 0.05, -0.15);
    box(car, 0.86, 1.0, 0.86, 0, 0.5, 0, 0x36414b, { rough: 0.55, metal: 0.3 });
    const carTop = group(car, 0, 1.0, 0);
    const deckTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#2b3339", base2: "#232a2f", step: 22 }), { repeat: 1, px: 256 });
    const deck = box(carTop, 0.9, 0.03, 0.9, 0, 0, 0, 0x2b3339, { rough: 0.55, metal: 0.4 });
    deck.material = texturedMat(deckTex, { rough: 0.5, metal: 0.45, color: 0x2b3339 });
    const rail = group(carTop, 0, 0.28, 0);
    for (const [rx, rz, ry] of [[0, -0.42, 0], [-0.42, 0, Math.PI / 2], [0.42, 0, Math.PI / 2]]) {
      box(rail, 0.86, 0.03, 0.02, rx, 0, rz, 0xd8b23a, { rough: 0.6 }).rotation.y = ry;
    }
    reg(hits, box(carTop, 0.02, 0.3, 0.9, 0.43, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "cartop-edge-unrailed");

    const hatch = group(carTop, -0.15, 0.02, 0.1, 0.15);
    box(hatch, 0.36, 0.02, 0.34, 0, 0, 0, 0x3c4650, { rough: 0.5, metal: 0.4 });
    box(hatch, 0.06, 0.03, 0.02, 0.12, 0.02, 0.16, CITY.steel, { rough: 0.35, metal: 0.85 });
    holoTag(hatch, "Car-top hatch", 0, 0.12, 0, { css: "#4fd1ff", w: 0.3 });
    reg(hits, hatch, "car-top-hatch");

    const levelGauge = instrument(shaft, -0.7, 1.55, 0.2, { ry: 0.3, idle: "-- ", color: 0x4fd1ff });
    holoTag(levelGauge, "Landing-zone indicator", 0, 0.16, 0, { css: "#4fd1ff", w: 0.36 });
    reg(hits, levelGauge, "landing-zone-gauge");

    // Inspection station: enable, stop switch, direction selector, run control.
    const inspStation = group(carTop, -0.3, 0.02, -0.3, 0.25);
    box(inspStation, 0.24, 0.1, 0.14, 0, 0.05, 0, 0x2b3339, { rough: 0.5, metal: 0.4 });
    decal(inspStation, 0.2, 0.05, 0, 0.101, 0, signFace("INSPECTION", { accent: "#4fd1ff", scale: 0.42 }), { px: 128 }).rotation.x = -Math.PI / 2;
    const enableBtn = cyl(inspStation, 0.026, 0.026, 0.02, -0.07, 0.105, 0.02, 0xd8b23a, { emissive: 0xd8b23a, ei: 0.8, rough: 0.4, seg: 14 });
    enableBtn.rotation.x = Math.PI / 2;
    holoTag(inspStation, "Enable switch", 0, 0.24, 0, { css: "#4fd1ff", w: 0.32 });
    reg(hits, enableBtn, "enable-switch");

    const dirSelector = group(inspStation, 0.05, 0.06, 0.04, 0.2);
    cyl(dirSelector, 0.02, 0.02, 0.02, 0, 0, 0, 0x22272c, { rough: 0.5, metal: 0.5, seg: 12 });
    const dirLever = box(dirSelector, 0.05, 0.012, 0.012, 0.02, 0.014, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, dirSelector, "direction-selector");
    const dirUnattendedZone = box(dirSelector, 0.06, 0.03, 0.03, 0, 0.02, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, dirUnattendedZone, "unattended-direction-switch");

    const runControl = cyl(inspStation, 0.026, 0.026, 0.02, 0.07, 0.105, 0.02, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.0, rough: 0.4, seg: 14 });
    runControl.rotation.x = Math.PI / 2;
    holoTag(runControl, "Run control", 0, 0.14, 0, { css: "#4fd1ff", w: 0.3 });
    reg(hits, runControl, "ride-control");

    const cartopSwitch = group(carTop, 0.24, 0.02, -0.28, -0.3);
    box(cartopSwitch, 0.12, 0.14, 0.06, 0, 0.07, 0, 0x22272c, { rough: 0.5, metal: 0.4 });
    const cartopLever = box(cartopSwitch, 0.03, 0.08, 0.03, 0, 0.15, 0.02, 0xd8232a, { rough: 0.5 });
    const cartopLamp = ball(cartopSwitch, 0.014, 0, 0.13, 0.035, 0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
    holoTag(cartopSwitch, "Car-top stop", 0, 0.24, 0, { css: "#4fd1ff", w: 0.3 });
    reg(hits, cartopSwitch, "cartop-stop-switch");

    // Traveling cable, hitched to the car and running down the shaft wall.
    const cablePts = [[0.4, 1.0, -0.85], [0.35, 0.4, -0.6], [0.2, -0.4, -0.4], [0.1, -1.2, -0.3]];
    const cable = hose(shaft, cablePts, 0.02, 0x22262b, { steps: 16, rough: 0.7 });
    void cable;
    const chafedCable = box(shaft, 0.03, 0.1, 0.03, 0.3, 0.1, -0.5, 0x8a5a34, { rough: 0.8 });
    reg(hits, chafedCable, "damaged-traveling-cable");

    // Crosshead beam at the top of the shaft, with the clearance marker.
    const crosshead = box(shaft, 2.2, 0.14, 0.5, 0, 2.9, -0.6, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    void crosshead;
    const clearanceZone = box(shaft, 0.4, 0.3, 0.4, 0, 2.2, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(clearanceZone, "Crosshead clearance zone", 0, 0.2, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, clearanceZone, "crosshead-clearance-zone");
    const tightGap = box(shaft, 0.3, 0.06, 0.3, -0.3, 2.75, -0.6, 0x8a5a34, { rough: 0.7 });
    reg(hits, tightGap, "narrow-crosshead-gap");
    const clearanceGauge = instrument(shaft, 0.6, 1.9, -0.4, { ry: 0.4, idle: "-- mm", color: 0x4fd1ff });
    holoTag(clearanceGauge, "Clearance gauge", 0, 0.16, 0, { css: "#4fd1ff", w: 0.32 });
    reg(hits, clearanceGauge, "clearance-gauge");

    // Door hangers at a landing opening, viewed from the car top side.
    const doorHangers = group(shaft, -0.5, 1.7, -0.55);
    box(doorHangers, 0.5, 0.05, 0.04, 0, 0, 0, 0x53585e, { rough: 0.5, metal: 0.5 });
    const looseHanger = cyl(doorHangers, 0.02, 0.02, 0.04, 0.15, -0.03, 0.02, 0xd8b23a, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, looseHanger, "loose-door-hanger");

    const travelCableMount = group(shaft, 0.5, 0.5, -0.8);
    box(travelCableMount, 0.08, 0.06, 0.04, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    holoTag(travelCableMount, "Traveling cable hitch", 0, 0.12, 0, { css: "#4fd1ff", w: 0.34 });
    reg(hits, travelCableMount, "traveling-cable");
    const cableSnagZone = box(shaft, 0.1, 0.5, 0.1, 0.32, 0.4, -0.58, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cableSnagZone, "cable runs here — hands clear", 0, 0.3, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, cableSnagZone, "traveling-cable-snag");

    // ------------------------------------------------------------- docs + tools
    const chest = toolChest(g, 1.7, 1.4, { ry: -0.6, color: 0x4fd1ff });
    void chest;

    const ticket = holoPanel(g, 0.5, 0.36, -1.9, 1.4, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c9eeff"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JOB TICKET — CAR 4 RIDE", w * 0.06, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#bfe4f2";
      ["Full-travel inspection ride", "Clearance + cable + hangers", "Inspection speed only"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: 0.5, accent: 0x4fd1ff });
    reg(hits, ticket, "job-ticket");

    const permitPanel = holoPanel(g, 0.56, 0.4, -0.7, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c9eeff"; ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("INSPECTION WORK ORDER EW-24", w * 0.06, h * 0.14);
      ctx.fillStyle = "#e2f6ff"; ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CAR 4 — FULL RIDE", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#cbe9f5";
      ["Signage: all landings", "Clearance vs data plate", "Speed: inspection band only", "Log before sign-off"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.3, accent: 0x4fd1ff });
    reg(hits, permitPanel, "inspection-permit");

    const logPanel = holoPanel(g, 0.5, 0.34, 1.9, 1.4, -0.8, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd1ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e2f6ff"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("CAR TOP LOG — CAR 4", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cbe9f5";
      cx.fillText("Clearance and findings", w * 0.06, h * 0.48);
      cx.fillText("from this ride", w * 0.06, h * 0.68);
    }, { ry: -0.6, accent: 0x4fd1ff });
    reg(hits, logPanel, "cartop-log");

    // A second mechanic at the controller, off to the side of the shaft.
    // ---------------------------------------------------------- room dressing
    // Overhead cable tray and conduit, clear of the ride path.
    const tray = group(g, 0, 2.9, 1.0);
    box(tray, 3.6, 0.06, 0.3, 0, 0, 0, 0x596069, { rough: 0.6, metal: 0.4, cast: false });
    for (let i = 0; i < 8; i++) box(tray, 0.02, 0.05, 0.3, -1.7 + i * 0.48, -0.03, 0, 0x3c444c, { cast: false, receive: false });
    for (let i = 0; i < 3; i++) {
      const cable = cyl(g, 0.014, 0.014, 0.5, -1.5 + i * 0.6, 2.6, 1.0, 0x1b1e22, { rough: 0.85, seg: 8, cast: false });
      cable.rotation.x = Math.PI / 2;
    }

    // Spare parts shelf: door hangers, a spare interlock, a coil of cable.
    const shelf = group(g, -2.0, 0, 1.2, 0.4);
    box(shelf, 0.5, 0.03, 0.3, 0, 0.55, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    box(shelf, 0.5, 0.03, 0.3, 0, 0.9, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const [sx, sy] of [[-0.14, 0.58], [0.05, 0.58], [-0.05, 0.93], [0.12, 0.93]]) {
      box(shelf, 0.13, 0.05, 0.18, sx, sy, 0, 0x2b3138, { rough: 0.55, metal: 0.4 });
    }
    holoTag(shelf, "Spare parts", 0, 1.02, 0, { css: "#4fd1ff", w: 0.3 });

    // Ventilation louvre bank and a wall-mounted fire extinguisher.
    const vent = group(g, -2.0, 1.5, -1.55, 0.3);
    box(vent, 0.5, 0.4, 0.05, 0, 0, 0, 0x3d5a6b, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 6; i++) box(vent, 0.42, 0.045, 0.02, 0, -0.15 + i * 0.06, 0.03, 0x2b3138, { rough: 0.55, metal: 0.4 });
    const extinguisher = group(g, 2.0, 0, -1.6, -0.2);
    cyl(extinguisher, 0.05, 0.06, 0.28, 0, 0.5, 0, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 12 });
    cyl(extinguisher, 0.015, 0.02, 0.06, 0, 0.67, 0, 0x22272c, { rough: 0.4, metal: 0.6, seg: 10 });

    // A second landing frame further along the shaft wall, for scale.
    const farLanding = group(g, 1.8, 0, -1.7);
    box(farLanding, 0.8, 2.0, 0.08, 0, 1.0, 0, 0x53585e, { rough: 0.55, metal: 0.4 });
    box(farLanding, 0.7, 1.9, 0.02, 0, 1.0, 0.05, 0x6f7a83, { rough: 0.45, metal: 0.35 });
    decal(farLanding, 0.3, 0.08, 0, 1.85, 0.06, signFace("5", { accent: "#4fd1ff", scale: 0.6 }), { px: 96 });

    const controllerHand = standingFigure(g, 2.2, 0.3, { ry: -2.4, cloth: 0x37505f, helmet: 0x4fd1ff, vest: 0xe4dc3a });
    holoTag(controllerHand, "controller room hand", 0, 1.95, 0, { css: "#4fd1ff", w: 0.4 });

    let enabled = false, stopped = false, dir = 1;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "inspection-enable") enabled = true;
        if (step.id === "stop-switch") { stopped = true; cartopLever.rotation.x = -1.0; cartopLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 }); }
        if (step.id === "direction-select") dirLever.rotation.z = 0.6;
        if (step.id === "cartop-access") hatch.rotation.x = -1.1;
        if (step.id === "ride-down") { dir = -1; dirLever.rotation.z = -0.6; }
        if (step.id === "exit-restore") {
          dirLever.rotation.z = 0; stopped = false; enabled = false;
          cartopLever.rotation.x = 0; cartopLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
        }
      },

      onInterrupt(it) {
        if (it.id === "call-during-ride") cartopLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 2.2 });
        if (it.id === "normal-op-attempt") { controllerHand.position.z += 0.3; enableBtn.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "call-during-ride") cartopLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
        if (it.id === "normal-op-attempt") { controllerHand.position.z -= 0.3; enableBtn.material = mat(0xd8b23a, { emissive: 0xd8b23a, ei: 0.8 }); }
      },

      animate(t, dt, session) {
        void enabled;
        const tk = session?.track;
        if (stopped && tk && (session.step?.id === "ride-up" || session.step?.id === "ride-down")) {
          car.position.y += dir * tk.v * dt * 0.4;
          car.position.y = Math.max(0.05, Math.min(1.9, car.position.y));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "overhead-clearance") {
          const mm = Math.round(400 + gg.t * 400);
          repaint(clearanceGauge.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (gg && !gg.committed && session.step?.id === "level-check") {
          const label = gg.t > 0.44 && gg.t < 0.56 ? "LEVEL" : gg.t < 0.44 ? "LOW" : "HIGH";
          repaint(levelGauge.userData.screen, signFace(label, { bg: "#0d1c24", accent: label === "LEVEL" ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
    };
  },
};
