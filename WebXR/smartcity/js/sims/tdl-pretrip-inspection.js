import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat, particles } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pre-Trip Inspection VR — Mobility & Transit, the first of five
// Commercial Class A stations in the Job Readiness Edition's TDL
// pre-apprenticeship block. A tractor-trailer in a carrier's yard before the
// first dispatch: the last driver vehicle inspection report read and its
// defects checked as repaired, the rig secured before anyone opens the hood,
// the engine compartment walked with the engine off, tread measured against
// the federal minimums, the key on for the lamps, every light walked, the
// brake lights held, the mirrors set, the triangles stowed where they can be
// reached, the engine started and watched, the tires and air lines walked,
// and the report written — including the defects — before the truck moves.
//
// The tractor is drawn shorter than a real one so it fits the station; the
// procedure is full length. Sited generically: no real carrier, no clause
// number the registry is not sure of.

const PTI_ACCENT = 0x58a6e8;
const PTI_CAB = 0xb8322c;
const PTI_TIRE = 0x1a1d21;

export const SIM_TDL_PRETRIP_INSPECTION = {
  id: "tdl-pretrip-inspection",
  index: "222",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: pre-trip inspection under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "overcast",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A theory and range curriculum includes vehicle inspection, delivered by a provider on the Training Provider Registry; 49 CFR 396 inspection, repair and maintenance, including reviewing the last driver vehicle inspection report and writing your own; 49 CFR 393 parts and accessories, including tread depth and the emergency equipment a truck carries; 49 CFR 395 hours of service, which logs inspection time as on duty; the CVSA North American Standard Out-of-Service Criteria a roadside inspector applies; Teamsters (IBT) freight locals' driver training",
  name: "Pre-Trip Inspection",
  title: simTitle("Pre-Trip Inspection"),
  tagline: "A tractor-trailer before the first dispatch: the last report read, the rig secured, the engine bay walked cold, tread measured, lamps and lights walked, brake lights held, mirrors set, triangles stowed, the engine started and watched, tires and air lines walked, and the defects written down",
  accent: PTI_ACCENT,
  accentCss: "#58a6e8",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "written-up", name: "Written Up", note: "A full pre-trip with every defect found, the engine shut down on the overheat and the report written honestly — first time" },

  game: system({
    name: "Vehicle Inspection",
    currency: "CHECK",
    ranks: ["Permit Holder", "Driver Trainee", "Class A Driver", "Lead Driver", "Inspection Certified"],
    badges: [
      { id: "cold-engine-bay", name: "Cold Engine Bay", note: "Every engine-compartment defect found without a hint", test: AWARD.stepClean("engine-bay") },
      { id: "three-points", name: "Three Points", note: "Never went under a running truck, jumped from the cab, opened a hot cap or signed a clean report on a defect", test: AWARD.safe },
      { id: "tire-reader", name: "Tire Reader", note: "Tread gauge and tire walk both done clean", test: AWARD.all(AWARD.stepClean("tread"), AWARD.stepClean("tire-walk")) },
    ],
    challenges: [
      { id: "clean-pretrip", name: "Clean Pre-Trip", note: "No corrections anywhere around the truck", test: AWARD.clean },
      { id: "steady-idle", name: "Steady Idle", note: "The warm-up idle held in band", test: AWARD.unbroken },
      { id: "on-the-clock", name: "On the Clock", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "pti-under-running": "You went to crawl under the tractor with the engine idling and nobody else knowing you were there. A running truck can be put in gear by someone climbing in, and the fan, belts and exhaust are live. Under-vehicle checks are done with the engine off, the brakes set, the wheels chocked and the key in your pocket.",
    "pti-jump-cab": "You went to jump down from the cab. Jumping from a cab step is one of the commonest ways drivers are injured — ankles, knees and backs on uneven yard ground. Climb down facing the truck with three points of contact on the handholds and steps.",
    "pti-hot-radiator": "You went to open the radiator cap on a hot engine. A pressurised cooling system is well above boiling; open it hot and the coolant flashes to steam and sprays out over your face and arms. Coolant is checked at the sight glass, or with the engine cold.",
    "pti-sign-clean": "You went to sign the report 'no defects' with the defects you just found. A driver vehicle inspection report is the carrier's legal record of the truck's condition; a clean report on a known defect sends the next driver out on it and makes the defect yours when it fails at the roadside or on the highway.",
  },

  lateNotes: {
    "pti-throttle": "The engine is started once the lamps and lights have been walked with the key on — starting first hides the bulb check behind the warm-up.",
    "pti-triangles": "The triangles are stowed once the mirrors are set and before the engine is started, so the cab is ready before the truck is running.",
    "pti-dvir-submit": "The report is written last, after the tire walk and the check-in, so every defect you found is on it.",
  },

  steps: [
    {
      id: "last-dvir", kind: "select", target: "pti-last-dvir",
      title: "Read the last inspection report",
      cue: "Read the last driver's report: what defects were written up, and whether the mechanic has signed them off as repaired.",
      why: "Under 49 CFR 396 the last driver's report is the first thing a driver reads, because it says what somebody else found wrong with this truck. A defect written up and signed as repaired is one you still check; a defect written up and not signed off is one the truck may not have been fixed for, and you sign the report yourself to say you have seen it.",
    },
    {
      id: "secure", kind: "sequence",
      targets: ["pti-park-brake", "pti-chock", "pti-hood-latch"],
      itemNames: { "pti-park-brake": "parking brakes set", "pti-chock": "wheels chocked", "pti-hood-latch": "hood unlatched, engine off" },
      title: "Secure the rig before the hood opens",
      cue: "Parking brakes set, the drive wheels chocked, then open the hood with the engine off.",
      why: "The engine compartment is where the belts, the fan and the hot surfaces are, and a pre-trip starts with all of them stopped. Brakes and chocks first means the truck cannot roll while you have your head under the hood or your hands on a tire; the engine off means the fan and belts are not moving while you look at them.",
      outOfOrderNote: "Brakes, chocks, then the hood — the truck is made immovable before anyone puts a hand into it.",
    },
    {
      id: "engine-bay", kind: "find", noHint: true,
      targets: ["pti-belt-crack", "pti-hose-leak", "pti-oil-low"],
      itemNames: { "pti-belt-crack": "the cracked alternator belt", "pti-hose-leak": "the weeping coolant hose", "pti-oil-low": "the dipstick below the add mark" },
      itemNotes: {
        "pti-belt-crack": "Cracks across the ribs of this belt. A belt that lets go takes the alternator and often the water pump with it, miles from the yard.",
        "pti-hose-leak": "Dried coolant crust at the clamp and a fresh wet line under it. A weeping hose is a hose that bursts under pressure on the first long grade.",
        "pti-oil-low": "The dipstick reads below the add mark. Low oil starves the bearings, and the pressure gauge will not warn you until the damage is already done.",
      },
      title: "Walk the engine compartment",
      cue: "Engine off, hood open: look at the belts, the hoses and the oil. Find the three defects.",
      why: "Every item in the engine compartment fails with a warning first: a belt cracks before it snaps, a hose weeps before it bursts, oil runs low before the bearings go. The pre-trip is when those warnings are still cheap. Each of these three becomes a roadside breakdown, a tow and a missed delivery if it is found on the highway instead of in the yard.",
    },
    {
      id: "tread", kind: "gauge", target: "pti-tread-gauge",
      title: "Measure the steer tire tread",
      cue: "Seat the tread gauge in a major groove of the steer tire and commit when it reads at or above the legal minimum.",
      why: "49 CFR 393 sets a minimum tread depth for steer tires higher than for the other positions, because a steer tire that loses grip or blows out takes the steering with it. Measuring in a major groove, not guessing from the shoulder, is the difference between knowing the tire is legal and hoping it is. A steer tire below the line does not leave the yard.",
      gauge: { label: "STEER TREAD", speed: 0.7, green: [0.3, 0.6], readout: (t) => `${Math.max(1, Math.round(t * 14))}/32 in`, missNote: "That reading is not seated in a major groove or is below the steer minimum — measure again." },
    },
    {
      id: "key-on", kind: "turn", target: "pti-ignition",
      title: "Key on, engine off",
      cue: "Turn the key to ON without starting: watch the warning lamps and gauges come up and the low-air buzzer sound.",
      why: "Key on with the engine off is the bulb check for the dash: every warning lamp should light and go through its test, the gauges should sweep, and the low-air warning should sound if the tanks are down. A lamp that never lights is a warning you will never get, and this is the only moment in the day you can tell a dead bulb from a healthy system.",
      turn: { turns: 0.25, axis: "z", label: "KEY" },
    },
    {
      id: "lights", kind: "sequence", anyOrder: true,
      targets: ["pti-headlight", "pti-turn-signal", "pti-clearance-light", "pti-four-way"],
      itemNames: { "pti-headlight": "headlights, low and high", "pti-turn-signal": "turn signals", "pti-clearance-light": "clearance and marker lights", "pti-four-way": "four-way flashers" },
      title: "Walk the lights",
      cue: "Headlights low and high, both turn signals, clearance and marker lights, and the four-ways.",
      why: "A tractor-trailer is seen at night by its lights, and it signals every lane change and every stop through them. 49 CFR 393 sets out what lamps a combination must carry; a dead clearance light hides the corner of a trailer from a car at night, and dead four-ways mean a stopped truck on a shoulder that nobody sees until too late.",
    },
    {
      id: "brake-lights", kind: "hold", target: "pti-brake-pedal", seconds: 8,
      title: "Hold the brake lights on",
      cue: "Hold the service brake applied while the brake lights are checked from the rear.",
      why: "Brake lights are the one light you cannot see from the driver's seat, and a following driver has only them to tell a slowing truck from a moving one. Holding the pedal steady for the whole check — with a helper, a mirror or a pedal stick — is how both the tractor and trailer lamps are confirmed rather than assumed.",
      holdBreakNote: "The pedal came up before the check was done. Hold it applied until both lamps are seen.",
    },
    {
      id: "mirrors", kind: "select", target: "pti-mirrors",
      title: "Set the mirrors from the seat",
      cue: "From the driver's seat, set both mirrors so the side of the trailer is just in view and the lane beside it fills the rest.",
      why: "A tractor-trailer has no rear window; the mirrors are how the driver sees the trailer, the lanes beside it and anyone walking along it. Set from the driving position, not from the ground, each mirror shows a sliver of trailer for reference and as much of the adjacent lane as possible, which shrinks the blind spots that cars and pedestrians disappear into.",
    },
    {
      id: "triangles", kind: "drag", target: "pti-triangles",
      title: "Check and stow the emergency equipment",
      cue: "Count the three warning triangles and carry the kit to its bracket behind the seat, beside the charged extinguisher.",
      why: "49 CFR 393 requires a truck to carry warning devices and a charged, secured fire extinguisher, and both are for the worst ten minutes of a driver's day: stopped on a shoulder with traffic going past, or with a fire under the hood. Equipment that is missing, discharged or buried under a bag is equipment you do not have when you need it.",
      drag: { to: "pti-kit-bracket", radius: 0.45, missNote: "Not on its bracket — the kit rides where you can reach it without unloading the cab." },
    },
    {
      id: "warm-up", kind: "track", target: "pti-throttle", seconds: 8,
      title: "Start and watch the gauges",
      cue: "Start the engine and hold a steady idle while oil pressure comes up and the air builds.",
      why: "The first minute after a start tells you whether the engine is healthy: oil pressure should rise within seconds, the charging gauge should show the alternator working, and the air should begin to build. A steady idle is what lets you read those needles; revving a cold engine hides a slow oil rise and wears the engine for nothing.",
      track: { start: 0.1, green: [0.34, 0.56], rise: 0.54, fall: 0.44, drift: 0.12, label: "IDLE", readout: (v) => (v < 0.34 ? "stalling" : v > 0.56 ? "revving cold" : "steady idle") },
      holdBreakNote: "Idle out of band — hold it steady so you can read the gauges.",
    },
    {
      id: "tire-walk", kind: "find", noHint: true,
      targets: ["pti-sidewall-bulge", "pti-lug-rust", "pti-chafed-line"],
      itemNames: { "pti-sidewall-bulge": "the bulge in the drive tire sidewall", "pti-lug-rust": "the rust streak from a lug nut", "pti-chafed-line": "the chafed trailer air line" },
      itemNotes: {
        "pti-sidewall-bulge": "A bulge in the sidewall is a broken cord underneath; this tire can fail at any speed. It is the kind of defect the CVSA out-of-service criteria take a truck off the road for.",
        "pti-lug-rust": "A rust streak running from a lug nut means the nut has been moving. Loose lug nuts are how wheels come off trucks on the highway.",
        "pti-chafed-line": "The trailer air line is chafed through its cover where it rubs the catwalk. A line that wears through dumps the trailer's air and sets its brakes wherever you are.",
      },
      title: "Walk the tires, wheels and air lines",
      cue: "Walk both sides: tires, wheels and lug nuts, and the air lines between the tractor and trailer.",
      why: "Tires, wheels and air lines are the defects that end up in the news: a blowout at speed, a wheel off on the highway, trailer brakes locking on a ramp. Each gives a visible warning in the yard, and each is on the list a roadside inspector works through. The walk-around is the driver's chance to find them first.",
    },
    {
      id: "crew-checkin", kind: "select", target: "pti-crew-checkin",
      title: "Check in with dispatch",
      cue: "Tell dispatch the truck is down for the defects, confirm your hours left, and say whether you are fit to drive today.",
      why: "Dispatch plans loads on the trucks and drivers it thinks it has; a truck held for a tire and a hose changes that plan, and dispatch needs to hear it before promising the load. The same call is where a driver says honestly if they slept badly or are unwell — fatigue and illness are reasons not to drive, and saying so now is far better than finding out at the wheel.",
    },
    {
      id: "dvir-submit", kind: "select", target: "pti-dvir-submit",
      title: "Write the driver vehicle inspection report",
      cue: "Write up every defect you found, mark the truck not fit to dispatch until repaired, and sign it.",
      why: "The report is how a defect gets from the driver who found it to the mechanic who fixes it and the next driver who reads it; 49 CFR 396 asks for exactly that trail. A defect written down with its location is a work order; a defect mentioned to someone in the yard is a defect the next driver finds on the highway.",
    },
  ],

  interrupts: [
    {
      id: "yard-tractor-backing",
      kind: "Vehicle backing toward you",
      after: "brake-lights", delay: 3, seconds: 10,
      alert: "A yard tractor has started backing into the next slot with its reverse alarm going, straight toward the gap you are about to walk through.",
      cue: "Warn the yard driver before you step into the gap.",
      target: "pti-horn",
      why: "A yard is full of trucks backing on mirrors, and the gap between two parked trucks is the worst blind spot in it. A tap of the horn tells the yard driver someone is there, and staying out of the gap until they stop is what keeps the walk-around from ending between two bumpers.",
      missNote: "You stayed on course into the gap with a truck backing into it. Drivers are crushed between trucks in yards every year, almost always while walking a truck that was parked and safe a moment before.",
      wrongNote: "It is the horn. A truck is backing into the gap you are about to walk into.",
    },
    {
      id: "coolant-steam",
      kind: "Engine overheating",
      after: "warm-up", delay: 3, seconds: 12,
      alert: "Steam is curling out from under the hood edge and the coolant temperature needle is climbing fast.",
      cue: "Shut the engine down.",
      target: "pti-shutdown",
      why: "Steam from under the hood at idle is coolant escaping — here, the weeping hose you found has let go. Shutting the engine down stops the pump pushing coolant out and stops the engine cooking itself; the cap stays shut until everything is cold.",
      missNote: "You let the engine run on while it lost its coolant. An engine run hot for a few minutes warps heads and blows gaskets, and a driver who opens the hood on a steaming engine is standing over a pressurised spray.",
      wrongNote: "It is the engine stop. Coolant is escaping and every second of running makes it worse.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, PTI_ACCENT);

    // ------------------------------------------------------------ yard surface
    const yardTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#3c3f43", base2: "#34373b", seam: "rgba(0,0,0,0.45)" }), { repeat: 5, px: 512 });
    const yard = box(g, 11, 0.12, 8, 0, 0.06, -0.6, 0xffffff, { rough: 0.95 });
    yard.material = texturedMat(yardTex, { rough: 0.95, metal: 0.02, color: 0xa9adb2 });
    for (const z of [-3.1, 1.9]) box(g, 11, 0.006, 0.1, 0, 0.123, z, 0xf2f5f7, { rough: 0.6, cast: false });

    // ------------------------------------------------------------ the tractor, side-on, front to the left
    const tr = group(g, -0.6, 0.12, -0.6);
    for (const sz of [-0.45, 0.45]) box(tr, 4.4, 0.24, 0.1, 0.4, 0.78, sz, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const cab = box(tr, 1.6, 1.8, 2.4, -0.8, 2.0, 0, PTI_CAB, { rough: 0.4, metal: 0.4 });
    void cab;
    box(tr, 0.05, 0.75, 2.2, -1.62, 2.45, 0, 0x22303a, { rough: 0.15, metal: 0.6 });
    for (const sz of [-1, 1]) box(tr, 1.0, 0.7, 0.05, -0.8, 2.35, sz * 1.21, 0x22303a, { rough: 0.15, metal: 0.6 });
    // A conventional hood hinges at the front bumper and tilts forward.
    const hood = group(tr, -3.15, 0.95, 0);
    box(hood, 1.5, 0.9, 2.0, 0.75, 0.45, 0, PTI_CAB, { rough: 0.4, metal: 0.4 });
    box(hood, 0.05, 0.75, 1.3, -0.02, 0.42, 0, 0x8b949d, { rough: 0.4, metal: 0.7 });
    hood.rotation.z = 1.9;
    const latch = box(tr, 0.08, 0.1, 0.12, -3.05, 1.05, 1.02, 0x2b2f34, { rough: 0.5 });
    reg2(latch, "pti-hood-latch");
    box(tr, 0.22, 0.3, 2.5, -3.25, 0.7, 0, 0xc9ced2, { rough: 0.3, metal: 0.8 });
    const headlight = box(tr, 0.06, 0.16, 0.3, -3.16, 1.1, 0.85, 0xfff4d8, { emissive: 0xfff4d8, ei: 0.6, rough: 0.3 });
    reg2(headlight, "pti-headlight");
    box(tr, 0.06, 0.16, 0.3, -3.16, 1.1, -0.85, 0xfff4d8, { emissive: 0xfff4d8, ei: 0.6, rough: 0.3 });
    const signal = box(tr, 0.06, 0.1, 0.14, -3.16, 1.1, 1.12, 0xf2a23b, { emissive: 0xf2a23b, ei: 0.5, rough: 0.3 });
    reg2(signal, "pti-turn-signal");
    // Engine compartment, visible under the tipped hood.
    const engine = group(tr, -2.4, 0.9, 0);
    box(engine, 1.1, 0.7, 0.9, 0, 0.35, 0, 0x3a3f45, { rough: 0.6, metal: 0.5 });
    const belt = box(engine, 0.04, 0.4, 0.3, -0.58, 0.45, 0.25, 0x1b1e23, { rough: 0.8 });
    const crack = box(engine, 0.05, 0.08, 0.1, -0.6, 0.55, 0.3, 0xd98a3a, { emissive: 0xd98a3a, ei: 0.4, rough: 0.6 });
    void belt;
    reg2(crack, "pti-belt-crack");
    const hose = cyl(engine, 0.05, 0.05, 0.6, -0.3, 0.8, 0.4, 0x1b1e23, { rough: 0.7, seg: 10 });
    hose.rotation.z = Math.PI / 2;
    const weep = box(engine, 0.1, 0.1, 0.1, -0.05, 0.8, 0.42, 0x6fc4a8, { emissive: 0x6fc4a8, ei: 0.4, rough: 0.3 });
    reg2(weep, "pti-hose-leak");
    const dip = group(engine, 0.3, 0.7, 0.5);
    cyl(dip, 0.012, 0.012, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.4, metal: 0.6, seg: 8 });
    box(dip, 0.06, 0.04, 0.02, 0, 0.52, 0, 0xf2c14b, { rough: 0.5 });
    reg2(dip, "pti-oil-low");
    const radCap = cyl(engine, 0.07, 0.07, 0.05, -0.4, 0.75, -0.2, 0xd9dde2, { rough: 0.3, metal: 0.8, seg: 12 });
    holoTag(tr, "radiator cap — open it hot?", -2.8, 2.05, -0.2, { css: "#d2312b", w: 0.46 });
    reg2(radCap, "pti-hot-radiator");
    const steam = particles(tr, 18, 0xeef2f4, { size: 0.06, life: 0.8, additive: false, opacity: 0.5 });
    steam.visible = false;
    // Wheels: steer and two drive axles, fuel tank, steps, stack, mirrors.
    const wheel = (x, z, w) => { const c = cyl(tr, 0.5, 0.5, w, x, 0.5, z, PTI_TIRE, { rough: 0.9, seg: 20 }); c.rotation.x = Math.PI / 2; cyl(tr, 0.24, 0.24, w + 0.02, x, 0.5, z, 0x8b949d, { rough: 0.3, metal: 0.8, seg: 14 }).rotation.x = Math.PI / 2; return c; };
    const steerL = wheel(-2.3, 1.1, 0.32);
    wheel(-2.3, -1.1, 0.32);
    const driveA = wheel(0.9, 1.05, 0.55);
    wheel(0.9, -1.05, 0.55);
    wheel(2.1, 1.05, 0.55);
    wheel(2.1, -1.05, 0.55);
    const treadGauge = instrument(tr, -2.3, 1.2, 1.35, { idle: "--/32", color: PTI_ACCENT, w: 0.12, d: 0.14 });
    reg2(treadGauge, "pti-tread-gauge");
    holoTag(tr, "steer tire tread", -2.3, 1.42, 1.35, { css: "#58a6e8", w: 0.3 });
    void steerL;
    const bulge = box(tr, 0.2, 0.2, 0.08, 0.9, 0.55, 1.35, 0x2b2f34, { rough: 0.9 });
    reg2(bulge, "pti-sidewall-bulge");
    const rust = box(tr, 0.03, 0.14, 0.02, 2.2, 0.4, 1.34, 0xa0522d, { rough: 0.9 });
    reg2(rust, "pti-lug-rust");
    const tank = cyl(tr, 0.33, 0.33, 1.2, -0.4, 0.75, 1.0, 0xc9ced2, { rough: 0.25, metal: 0.8, seg: 18 });
    tank.rotation.z = Math.PI / 2;
    for (const y of [0.45, 0.85]) box(tr, 0.4, 0.05, 0.25, -1.3, y, 1.25, 0x8b949d, { rough: 0.4, metal: 0.7 });
    const jumpMark = slab(g, 0.8, 0.02, 0.5, -1.9, 0.13, 1.25, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "jump down from the cab?", -1.9, 0.34, 1.25, { css: "#d2312b", w: 0.42 });
    reg2(jumpMark, "pti-jump-cab");
    cyl(tr, 0.08, 0.08, 1.8, 0.05, 2.6, 1.15, 0xc9ced2, { rough: 0.3, metal: 0.8, seg: 12 });
    for (const sz of [-1, 1]) {
      box(tr, 0.06, 0.5, 0.2, -1.8, 2.4, sz * 1.4, 0x2b2f34, { rough: 0.4, metal: 0.4 });
      box(tr, 0.3, 0.03, 0.03, -1.7, 2.4, sz * 1.3, 0x2b2f34, { rough: 0.5 });
    }
    const mirrorHit = box(tr, 0.2, 0.55, 0.25, -1.8, 2.4, 1.4, 0xffffff, { opacity: 0.001, cast: false });
    reg2(mirrorHit, "pti-mirrors");
    const clearance = box(tr, 0.06, 0.06, 0.1, -1.66, 2.95, 0.9, 0xf2a23b, { emissive: 0xf2a23b, ei: 0.6, rough: 0.3 });
    reg2(clearance, "pti-clearance-light");
    for (const sz of [0, -0.9]) box(tr, 0.06, 0.06, 0.1, -1.66, 2.95, sz, 0xf2a23b, { emissive: 0xf2a23b, ei: 0.6, rough: 0.3 });
    // Fifth wheel, catwalk, and the air lines to the trailer.
    box(tr, 1.2, 0.12, 1.4, 1.6, 1.08, 0, 0x2b2f34, { rough: 0.5, metal: 0.6 });
    box(tr, 0.8, 0.04, 1.2, 0.35, 1.0, 0, 0x59636d, { rough: 0.6, metal: 0.5 });
    const redLine = cyl(tr, 0.02, 0.02, 1.4, 0.6, 1.4, 0.25, 0xd2312b, { rough: 0.6, seg: 8 });
    redLine.rotation.z = 1.2;
    cyl(tr, 0.02, 0.02, 1.4, 0.6, 1.4, -0.25, 0x2f7fbf, { rough: 0.6, seg: 8 }).rotation.z = 1.2;
    const chafe = box(tr, 0.12, 0.08, 0.08, 0.45, 1.12, 0.25, 0xd98a3a, { emissive: 0xd98a3a, ei: 0.3, rough: 0.6 });
    reg2(chafe, "pti-chafed-line");
    const underMark = box(tr, 1.8, 0.35, 0.8, 0.3, 0.3, 0, 0xd2312b, { opacity: 0.25, cast: false });
    holoTag(tr, "crawl under — engine running?", 0.3, 0.72, 0.9, { css: "#d2312b", w: 0.48 });
    reg2(underMark, "pti-under-running");

    // ------------------------------------------------------------ the trailer, coupled, running off to the right
    const van = group(g, 3.8, 0.12, -0.6);
    box(van, 5.0, 2.6, 2.55, 0.9, 2.55, 0, 0xe8eef2, { rough: 0.6, metal: 0.2 });
    box(van, 5.0, 0.12, 2.3, 0.9, 1.2, 0, 0x59636d, { rough: 0.6, metal: 0.4 });
    for (const sz of [-1, 1]) box(van, 0.1, 0.9, 0.1, -1.2, 0.7, sz * 0.8, 0x3a3f45, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 4; i++) box(van, 0.06, 0.06, 0.1, -1.4 + i * 1.5, 3.8, 1.28, 0xf2a23b, { emissive: 0xf2a23b, ei: 0.5, rough: 0.3 });
    decal(van, 2.2, 0.5, 0.9, 2.7, 1.28, signFace("FREIGHT", { bg: "#e8eef2", fg: "#2b3a48", accent: "#58a6e8", scale: 0.6 }), { px: 256 });

    // ------------------------------------------------------------ the in-cab controls, laid out at the open door
    const dash = group(g, -1.35, 0.12, 1.55, 0.25);
    box(dash, 0.9, 0.9, 0.35, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    const dashFace = slab(dash, 0.86, 0.35, 0.05, 0, 1.05, 0.05, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    void dashFace;
    const wheelRim = cyl(dash, 0.2, 0.2, 0.03, 0, 1.25, 0.28, 0x1b1e23, { rough: 0.5, seg: 18 });
    wheelRim.rotation.x = 1.1;
    const gauges = instrument(dash, -0.24, 1.08, 0.09, { idle: "OIL --", color: PTI_ACCENT, w: 0.16, d: 0.12 });
    const key = box(dash, 0.04, 0.07, 0.03, 0.2, 1.02, 0.1, 0xd9dde2, { rough: 0.3, metal: 0.8 });
    reg2(key, "pti-ignition");
    const parkValve = box(dash, 0.07, 0.07, 0.07, 0.34, 0.95, 0.12, 0xf2c14b, { rough: 0.5 });
    reg2(parkValve, "pti-park-brake");
    const fourWay = box(dash, 0.06, 0.04, 0.04, 0.06, 1.18, 0.1, 0xd2312b, { rough: 0.5 });
    reg2(fourWay, "pti-four-way");
    const hornPad = cyl(dash, 0.05, 0.05, 0.02, 0, 1.26, 0.29, 0x2b2f34, { rough: 0.6, seg: 12 });
    hornPad.rotation.x = 1.1;
    reg2(hornPad, "pti-horn");
    const pedal = box(dash, 0.1, 0.03, 0.16, 0.12, 0.2, 0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    reg2(pedal, "pti-brake-pedal");
    const throttle = box(dash, 0.08, 0.03, 0.18, 0.28, 0.2, 0.3, 0x3a3f45, { rough: 0.5 });
    reg2(throttle, "pti-throttle");
    const stop = box(dash, 0.06, 0.04, 0.04, 0.34, 1.12, 0.1, 0xf2f5f7, { rough: 0.5 });
    reg2(stop, "pti-shutdown");
    holoTag(dash, "cab: key · brakes · horn · stop", 0, 1.5, 0.1, { css: "#58a6e8", w: 0.5 });
    const bracket = box(dash, 0.3, 0.2, 0.12, -0.35, 0.5, 0.22, 0x59636d, { rough: 0.6 });
    bracket.visible = false; hits["pti-kit-bracket"] = bracket;
    cyl(dash, 0.07, 0.07, 0.35, 0.35, 0.3, 0.24, 0xc0322b, { rough: 0.4, seg: 12 });

    // ------------------------------------------------------------ the triangles, the chock, the boards
    const kit = group(g, 1.5, 0.12, 1.9, -0.3);
    box(kit, 0.5, 0.12, 0.18, 0, 0.06, 0, 0xd2312b, { rough: 0.5 });
    for (let i = 0; i < 3; i++) { const t = box(kit, 0.34, 0.02, 0.3, 0, 0.14 + i * 0.025, 0, 0xf25c2b, { rough: 0.4 }); t.rotation.y = i * 0.2; }
    holoTag(kit, "warning triangles x3", 0, 0.45, 0, { css: "#58a6e8", w: 0.34 });
    reg2(kit, "pti-triangles");
    const chock = box(g, 0.28, 0.2, 0.26, 0.2, 0.22, 0.95, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "wheel chock", 0.2, 0.55, 0.95, { css: "#58a6e8", w: 0.22 });
    reg2(chock, "pti-chock");
    const lastReport = holoPanel(g, 0.8, 0.52, -3.1, 1.5, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "#07121c"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#58a6e8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dcecfa"; ctx.fillText("LAST REPORT — TRACTOR 4417", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f0f7fd";
      ["Driver: R/S clearance lamp out", "Mechanic: lamp replaced — signed", "Driver: coolant smell at idle", "Mechanic: — not signed —", "Review, then sign below", "Inspection time: on duty"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.6, accent: PTI_ACCENT });
    reg2(lastReport, "pti-last-dvir");
    const checkin = holoPanel(g, 0.46, 0.3, 3.0, 1.75, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DISPATCH CHECK-IN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Truck down · hours · fit to drive", w / 2, h * 0.66);
    }, { ry: -0.6, accent: 0x4fd1ff });
    reg2(checkin, "pti-crew-checkin");
    const dvir = holoPanel(g, 0.5, 0.36, 2.0, 1.55, 2.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,14,24,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#58a6e8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dcecfa"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DRIVER VEHICLE", w / 2, h * 0.22);
      ctx.fillText("INSPECTION REPORT", w / 2, h * 0.4);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Defects · not fit until repaired", w / 2, h * 0.7);
    }, { ry: -0.3, accent: PTI_ACCENT });
    reg2(dvir, "pti-dvir-submit");
    const cleanBox = decal(g, 0.26, 0.12, 2.55, 1.2, 2.5, signFace("NO DEFECTS ✓", { bg: "#1b2a18", accent: "#59c97b", scale: 0.45 }), { px: 128 });
    cleanBox.rotation.y = -0.3;
    holoTag(g, "sign it clean?", 2.55, 1.02, 2.52, { css: "#d2312b", w: 0.24 });
    reg2(cleanBox, "pti-sign-clean");
    cone(g, -3.9, 1.0);
    cone(g, 4.6, 1.2);

    // ------------------------------------------------------------ the yard tractor that backs in
    const yt = group(g, -4.6, 0.12, -3.9, 0);
    box(yt, 1.3, 1.4, 1.6, 0, 1.1, 0, 0xf2f5f7, { rough: 0.5, metal: 0.3 });
    box(yt, 2.4, 0.3, 1.8, 0.6, 0.55, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    for (const sx of [-0.4, 1.4]) for (const sz of [-1, 1]) cyl(yt, 0.42, 0.42, 0.3, sx, 0.42, sz * 0.85, PTI_TIRE, { rough: 0.9, seg: 16 }).rotation.x = Math.PI / 2;
    const ytBeacon = cyl(yt, 0.08, 0.08, 0.14, 0, 1.9, 0, 0x59636d, { rough: 0.4, seg: 12 });
    const yardDriver = standingFigure(g, -4.3, 2.3, { ry: 0.8, cloth: 0x2b3138, vest: 0xf2a23b });
    void yardDriver;

    let warm = 0;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.6, 1.2, -0.6),
      onStepComplete(step) {
        if (step.id === "secure") { chock.position.set(1.5, 0.22, 0.5); }
        if (step.id === "key-on") repaint(gauges.userData.screen, signFace("LAMPS OK", { bg: "#07121c", accent: "#59c97b", fg: "#f0f7fd", scale: 0.42 }));
        if (step.id === "triangles") { kit.parent.remove(kit); dash.add(kit); kit.position.set(-0.35, 0.45, 0.22); kit.rotation.set(0, 0, 0); kit.scale.setScalar(0.5); }
        if (step.id === "dvir-submit") {
          repaint(dvir.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,14,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("REPORT SIGNED", w / 2, h * 0.34);
            ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
            ctx.fillText("Belt · hose · oil · tire · lug · line", w / 2, h * 0.64);
          });
        }
      },
      // The yard tractor really backs toward the gap with its beacon on; the
      // steam really comes out from under the hood.
      onInterrupt(it) {
        if (it.id === "yard-tractor-backing") { yt.position.set(-4.6, 0.12, -2.4); ytBeacon.material = mat(0xf2a23b, { emissive: 0xf2a23b, ei: 1.5, rough: 0.4 }); }
        if (it.id === "coolant-steam") { steam.visible = true; weep.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.3 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "yard-tractor-backing") { yt.position.set(-4.6, 0.12, -3.9); ytBeacon.material = mat(0x59636d, { rough: 0.4 }); }
        if (it.id === "coolant-steam") { steam.visible = false; repaint(gauges.userData.screen, signFace("ENGINE OFF", { bg: "#1c0e0e", accent: "#f0645b", fg: "#fbe4e4", scale: 0.4 })); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "tread") {
          const ok = gg.t >= 0.3 && gg.t <= 0.6;
          repaint(treadGauge.userData.screen, signFace(`${Math.max(1, Math.round(gg.t * 14))}/32`, { bg: "#07121c", accent: ok ? "#59c97b" : "#f2ae14", fg: "#f0f7fd", scale: 0.5 }));
        }
        if (session?.turn && step?.id === "key-on") key.rotation.z = -session.turn.amount * Math.PI * 2;
        if (step?.id === "warm-up" && session.holding) warm = Math.min(1, warm + dt / 8);
        if (steam.visible) steam.userData.step?.(dt, new THREE.Vector3(-2.4, 1.9, 0.3), 0.15, 0.5, 0.6);
        driveA.rotation.y = 0;
        void t; void warm;
      },
    };
  },
};
