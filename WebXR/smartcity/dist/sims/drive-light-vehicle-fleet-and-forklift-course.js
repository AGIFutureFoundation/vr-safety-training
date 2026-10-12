import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import { sedan, forkliftCounterbalance } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Light Vehicle Fleet and Forklift Course VR — Mobility &
// Transit, the sixth deep driving station in the Job Readiness Edition. Two
// check-rides a new hire at a freight terminal is given before the keys: a
// pool car driven round the lot with a supervisor — walk-round, pull out,
// full stop, and backed into its space so it leaves forward — and a sit-down
// counterbalance forklift on the warehouse course — pre-use check, forks low
// and tilted back, the horn at the aisle end, and travel in reverse when the
// load blocks the view, the way OSHA 29 CFR 1910.178 requires.
//
// A pool car under ten thousand pounds is not a commercial motor vehicle, so
// the car half is the employer's fleet policy built on the same habits the
// state CDL handbook and 49 CFR 392 teach commercial drivers; the station
// says so rather than claiming a rule that does not apply. The course is
// drawn at a reduced scale; speeds are "per the posted limit" or the site's
// own limit. Sited generically: no real terminal, carrier or dealer.

const DRL_ACCENT = 0x5fd0c4;
const DRL_CSS = "#5fd0c4";
const DRL_SCALE = 0.6;

export const SIM_DRIVE_LIGHT_VEHICLE_FLEET_AND_FORKLIFT_COURSE = {
  id: "drive-light-vehicle-fleet-and-forklift-course",
  index: "323",
  domain: "Commercial Driving",
  trade: "Freight terminal new hire, Job Readiness Edition deep driving — a Teamsters terminal's fleet check-ride and forklift course, building on the habits the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) teaches",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "clear",
  certification: "OSHA 29 CFR 1910.178 powered industrial truck operator training, with formal instruction, practical training and an evaluation of the operator in the workplace, and a truck examined before use; ANSI B56.1 for the counterbalance truck's safe operation; ANSI/ISEA 107 high-visibility apparel on the warehouse floor; the employer's fleet policy for a pool car, built on the state CDL handbook's space-management habits and the same conduct 49 CFR 392 asks of commercial drivers; FMCSA 49 CFR 380 Subpart F entry-level driver training as the Class A path this job leads to; Teamsters (IBT) terminal locals' training",
  name: "Light Vehicle Fleet and Forklift Course",
  title: simTitle("Light Vehicle Fleet and Forklift Course"),
  tagline: "Two check-rides before the keys: a pool car walked round, pulled out, stopped fully and backed into its space, then a forklift checked, forks low and tilted back, horn at the aisle end and in reverse behind a tall load",
  accent: DRL_ACCENT,
  accentCss: DRL_CSS,
  parSeconds: 340,
  footprint: 2.6,
  apron: false,
  badge: { id: "keys-earned", name: "Keys Earned", note: "Both check-rides clean: the car backed into its space and the forklift driven load-low, horn at every corner and trailing its tall load — first time" },

  game: system({
    name: "Check-ride",
    currency: "LAP",
    ranks: ["New Hire", "Yard Trainee", "Fleet Driver", "Terminal Operator", "Course Certified"],
    badges: [
      { id: "two-rides", name: "Two Rides", note: "Car and forklift drives all finished with every check on time", test: AWARD.all(AWARD.stepClean("drl-pull-out"), AWARD.stepClean("drl-lift-forward"), AWARD.stepClean("drl-lift-reverse")) },
      { id: "no-riders", name: "No Riders", note: "Never used the phone, gave a ride on the forks, travelled with the load high or jumped from the truck", test: AWARD.safe },
      { id: "smooth-course", name: "Smooth Course", note: "Every drive and the mast tilt in band with no excursion", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-rides", name: "Clean Rides", note: "No corrections anywhere", test: AWARD.clean },
      { id: "just-clear", name: "Just Clear", note: "Fork height and drives near the centre of their bands", test: AWARD.precise(0.8) },
      { id: "on-time", name: "On Time", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "drl-phone": "You went to pick up the phone while driving the pool car round the lot. Car parks are full of people walking between vehicles and children who are hard to see, and a hand-held phone takes a hand and your eyes from both; the fleet policy — like 49 CFR 392 for commercial drivers — rules it out while the wheels are turning.",
    "drl-fork-rider": "You went to give a coworker a lift on the forks. Nobody rides on the forks or the load of a forklift: there is nothing to hold, the operator cannot see them, and a sudden stop or a mast movement throws them off or catches them in the mast. OSHA's forklift rule prohibits riders unless there is a proper seat for them.",
    "drl-high-travel": "You went to travel with the load raised high. A forklift's stability depends on keeping the load low and tilted back; carried high, a turn or a bump moves the combined centre of gravity outside the stability triangle and the truck tips sideways.",
    "drl-jump-clear": "You went to jump clear of a tipping forklift. The overhead guard is there to protect a belted operator who stays in the seat; people who jump are the ones caught under the guard as the truck goes over. Stay in, hold on, brace your feet and lean away from the fall.",
  },

  lateNotes: {
    "drl-fork-gauge": "The fork height is set once the forklift has passed its pre-use check and you are about to lift the load.",
    "drl-forklift-key": "The key comes out once the forks are down and the truck is parked at the end of the course.",
    "drl-fleet-log": "The log is filled in at the end, once both check-rides are done.",
  },

  steps: [
    {
      id: "drl-card", kind: "select", target: "drl-checkride-card",
      title: "Read the check-ride sheet",
      cue: "Read the sheet: the pool-car lap round the lot, then the forklift course through the warehouse aisle.",
      why: "A check-ride is an assessment with a sheet, and reading it first tells you what the supervisor will be watching: the walk-round, full stops, backing into the space, then the forklift's pre-use check, fork height, the horn at the aisle end and travelling in reverse with a tall load. Knowing the standard before you are measured against it is not cheating; it is the point.",
    },
    {
      id: "drl-walk-round", kind: "find", noHint: true,
      targets: ["drl-soft-tyre", "drl-cracked-lamp", "drl-loose-mirror"],
      itemNames: { "drl-soft-tyre": "the soft rear tyre", "drl-cracked-lamp": "the cracked tail lamp", "drl-loose-mirror": "the loose door mirror" },
      itemNotes: {
        "drl-soft-tyre": "A rear tyre visibly low. A pool car with a soft tyre handles badly and runs hot; it is reported, and pumped or changed, before the lap.",
        "drl-cracked-lamp": "A cracked tail lamp lens. It still lights, but water gets in and it fails; the next driver needs to know, and so does the fleet desk.",
        "drl-loose-mirror": "A door mirror that droops when touched. It will not hold its setting on the first bump, and a mirror you cannot trust is one you stop using.",
      },
      title: "Walk round the pool car",
      cue: "Walk round the car before you get in. Find what the last driver left for you.",
      why: "A pool car is driven by a different person every day, and nobody owns its problems unless the walk-round finds them. Tyres, lamps and mirrors take a minute to check, and every one of them is something the last driver noticed and did not report — or did not notice at all. You are the one signing for it now.",
    },
    {
      id: "drl-pull-out", kind: "drive", target: "drl-pool-car",
      title: "Pull out and round the lot",
      cue: "Check your mirror before you pull out, signal right into the aisle, check right, and hold the lot speed.",
      why: "A car park is where slow-speed crashes and pedestrian injuries cluster, because everyone is distracted and the sightlines are short between parked vehicles. A mirror and a look before pulling out, a signal at the turn into the aisle, and a speed at which you can stop for someone stepping out from between cars are the habits the check-ride is looking for.",
      holdBreakNote: "Out of the lane or out of the band in the lot — slow down; the lot speed is walking pace with room to stop.",
      drive: {
        path: [[-5.2, -2.4], [-5.2, -4.4], [-4.4, -5.6], [-2.6, -6.0], [0, -6.0]],
        speedBand: [3, 10], laneWidth: 1.2, graceSeconds: 1.8, checkWindow: 1.4, sceneRate: 0.18,
        bandLabel: "lot speed, per the posted limit",
        checks: [
          { at: 0, kind: "mirror-left", note: "Mirror and a look over the shoulder before you pull out of the space." },
          { at: 1, kind: "signal-right", note: "Signal right into the aisle — the people walking there need to know too." },
          { at: 3, kind: "mirror-right", note: "Right mirror past the parked cars: anyone stepping out from between them." },
        ],
        controls: { brake: "drl-brake-pedal" },
      },
    },
    {
      id: "drl-stop-sign", kind: "hold", target: "drl-brake-pedal", seconds: 3,
      title: "Full stop at the lot's stop sign",
      cue: "Hold a full stop at the stop sign, look both ways along the service road, then go.",
      why: "The lot's exit onto the service road carries trucks as well as cars, and a truck driver in a high cab may not see a small car at all. A full stop — wheels still, not a roll — with a look each way is what gives you time to see a tractor coming, and it is the single thing a fleet check-ride most often fails people on.",
      holdBreakNote: "The car rolled before the look was done — a full stop means wheels still until you have checked both ways.",
    },
    {
      id: "drl-back-in", kind: "drive", target: "drl-pool-car",
      title: "Back into the space",
      cue: "Back the car into the marked space, checking both mirrors, so it can leave forward.",
      why: "Backing into a space when you arrive means leaving forward later, when the lot is busier and you are in more of a hurry — the reverse is done at the quiet moment with a clear view of the space. Most fleet policies ask for it for exactly that reason. Slow, with both mirrors and a look over the shoulder, is the whole technique.",
      holdBreakNote: "Out of the space's lane or too fast in reverse — creep it in.",
      drive: {
        path: [[0, -6.0], [1.0, -6.1], [1.7, -6.6], [1.9, -7.6], [1.9, -8.4]],
        speedBand: [1, 4], laneWidth: 1.1, graceSeconds: 2.0, checkWindow: 1.3, sceneRate: 0.26, reverse: true,
        bandLabel: "creep, in reverse",
        checks: [
          { at: 0, kind: "mirror-left", note: "Left mirror and over your shoulder: the aisle behind you is clear to reverse into." },
          { at: 2, kind: "mirror-right", note: "Right mirror: the car in the next space is clear of your front corner as you swing." },
          { at: 4, kind: "mirror-left", note: "Left mirror: square in the lines, and stop." },
        ],
        controls: { brake: "drl-brake-pedal" },
      },
    },
    {
      id: "drl-pre-use", kind: "sequence",
      targets: ["drl-lift-chains", "drl-lift-horn", "drl-lift-lpg"],
      itemNames: { "drl-lift-chains": "mast chains and forks — no cracks, even tension", "drl-lift-horn": "horn sounds", "drl-lift-lpg": "LPG tank secure, no smell at the coupling" },
      title: "Forklift pre-use check",
      cue: "Check the forklift before you use it: forks and mast chains, then the horn, then the LPG tank and its coupling.",
      why: "OSHA's forklift rule has a truck examined before it is placed in service, and a truck with a defect taken out of service until it is fixed. The forks and chains carry the load over your head, the horn is how you are heard at every blind corner, and a leaking LPG coupling is a fire source under your seat — each checked in a minute, every shift.",
      outOfOrderNote: "Forks and chains first — the load hangs from them — then the horn, then the tank.",
    },
    {
      id: "drl-fork-height", kind: "gauge", target: "drl-fork-gauge",
      title: "Set the forks for travel",
      cue: "Lower the loaded forks to travel height — just clear of the floor — and commit.",
      why: "A load carried low keeps the truck's centre of gravity inside its stability triangle, so a turn or a bump rocks it rather than tips it. Too low and the fork tips catch a floor joint or a dock plate; too high and the truck is top-heavy. Just clear of the floor, with the mast tilted back, is how the course wants it carried.",
      gauge: { label: "FORK HEIGHT", speed: 0.7, green: [0.3, 0.52], readout: (t) => (t < 0.3 ? "dragging the floor" : t > 0.52 ? "too high — tip risk" : "just clear"), missNote: "That height is wrong for travel — set the forks just clear of the floor before you move." },
    },
    {
      id: "drl-lift-forward", kind: "drive", target: "drl-forklift",
      title: "Down the aisle, horn at the end",
      cue: "Beacon on, drive the aisle at the site speed, and sound the horn at the aisle end before you turn.",
      why: "A warehouse aisle is a corridor with blind ends, and the people walking across the end of it cannot see a forklift coming. The beacon lights the floor ahead of you, a steady speed within the site limit keeps you able to stop, and the horn at the end of the aisle tells anyone crossing that a truck is about to appear — before it does.",
      holdBreakNote: "Out of the aisle's lane or over the site speed — slow down and keep the load centred.",
      drive: {
        path: [[4.6, -3.6], [4.6, -6.0], [4.6, -8.0], [3.8, -9.0], [2.6, -9.2]],
        speedBand: [2, 6], laneWidth: 1.2, graceSeconds: 1.8, checkWindow: 1.4, sceneRate: 0.28,
        bandLabel: "site speed limit",
        checks: [
          { at: 0, kind: "lights", note: "Beacon and blue spot on before you move — they announce the truck before anyone sees it." },
          { at: 2, kind: "horn", note: "Horn at the aisle end, before you turn — anyone crossing needs the warning first." },
          { at: 4, kind: "mirror-left", note: "Look along the cross aisle as you come round: the path is clear before the forks swing into it." },
        ],
        controls: { brake: "drl-brake-pedal", horn: "drl-horn" },
      },
    },
    {
      id: "drl-tilt", kind: "track", target: "drl-tilt-lever", seconds: 5,
      title: "Cradle the load with the mast tilt",
      cue: "Hold the mast tilted back just enough to cradle the tall load while you pick it up.",
      why: "Tilting the mast back cradles the load against the carriage so it cannot slide forward off the forks when the truck brakes. Too little tilt and the load rides out on the tips; too much and a tall load leans back toward the operator. Holding it steady in the band while you take the load is what makes the next leg — in reverse — safe.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.12, label: "MAST TILT", readout: (v) => (v < 0.4 ? "load riding forward" : v > 0.62 ? "leaning back" : "cradled") },
      holdBreakNote: "The tilt drifted out of band — steady the load back against the carriage.",
    },
    {
      id: "drl-lift-reverse", kind: "drive", target: "drl-forklift",
      title: "Reverse out behind the tall load",
      cue: "The load blocks your view forward, so travel in reverse: horn first, look where you are going over each shoulder.",
      why: "OSHA's forklift rule is plain: when the load blocks the view forward, the operator travels with the load trailing — in reverse — looking in the direction of travel. Sounding the horn before you move and turning to look over each shoulder, rather than trusting a mirror, is how you see the person or the rack upright behind you.",
      holdBreakNote: "Out of the aisle's lane or too fast in reverse — slow, and look where you are going.",
      drive: {
        path: [[2.6, -9.2], [3.8, -9.0], [4.6, -8.0], [4.6, -5.6]],
        speedBand: [1, 4], laneWidth: 1.2, graceSeconds: 2.0, checkWindow: 1.3, sceneRate: 0.3, reverse: true,
        bandLabel: "site speed, in reverse",
        checks: [
          { at: 0, kind: "horn", note: "Horn before you reverse — the aisle behind you is where people walk." },
          { at: 1, kind: "mirror-left", note: "Over your left shoulder as you come round the corner." },
          { at: 3, kind: "mirror-right", note: "Over your right shoulder down the straight: the aisle is clear to the parking bay." },
        ],
        controls: { brake: "drl-brake-pedal" },
      },
    },
    {
      id: "drl-park-lift", kind: "drag", target: "drl-forklift-key",
      title: "Park it: forks down, key out",
      cue: "Forks flat on the floor, brake set, then take the key and hang it on the key board.",
      why: "A parked forklift with its forks raised is a shin and head strike waiting for someone walking past, and one with the key left in it is one anybody can drive — trained or not. Forks flat on the floor, the parking brake set and the key on the board means the truck is harmless where it stands and only an authorised operator takes it out next.",
      drag: { to: "drl-key-board", radius: 0.45, missNote: "Not on the board — hang the key on its hook where the next operator signs it out." },
    },
    {
      id: "drl-debrief", kind: "select", target: "drl-crew-checkin",
      title: "Debrief with the supervisor",
      cue: "Go over both rides with the supervisor: the child in the lot, the pedestrian at the aisle end, and how it felt.",
      why: "A check-ride's debrief is where the supervisor explains what they saw and why it matters, and where a new hire can say what felt shaky — the child who ran out, the person who stepped into the aisle. Saying it out loud to the person who decides whether you get the keys is uncomfortable, and it is how the training actually lands.",
    },
    {
      id: "drl-log", kind: "select", target: "drl-fleet-log",
      title: "Fill in the vehicle logs",
      cue: "Write the pool car's mileage and defects, and sign the forklift's pre-use checklist.",
      why: "The pool car's log and the forklift's checklist are how the next person learns what you found: the soft tyre, the cracked lamp, the mirror that will not hold. An unrecorded defect is one the fleet desk cannot fix and the next driver inherits, and the forklift's signed checklist is the record the employer keeps that the truck was examined before use.",
    },
  ],

  interrupts: [
    {
      id: "drl-child",
      kind: "Child between cars",
      after: "drl-pull-out", delay: 3, seconds: 10,
      alert: "A small child has run out from between two parked cars after a ball, straight into the aisle ahead of you.",
      cue: "Stop.",
      target: "drl-brake-pedal",
      why: "A child between parked cars is invisible until they are in front of you, which is why the lot speed is walking pace. Braking at once is the only answer; the parent, the ball and the rest of it come after the car has stopped.",
      missNote: "You kept driving with a child running into the aisle. Children are below the bonnet line and the sightlines between parked cars are measured in feet — this is how car-park injuries happen.",
      wrongNote: "It is the brake. A child has run out in front of you.",
    },
    {
      id: "drl-walker",
      kind: "Pedestrian at the aisle end",
      after: "drl-lift-forward", delay: 3, seconds: 10,
      alert: "A picker has stepped out from behind the rack end into the cross aisle ahead, reading a scanner, not looking your way.",
      cue: "Warn them.",
      target: "drl-horn",
      why: "Someone reading a scanner has not seen or heard a forklift. The horn gets their eyes up before the forks reach them, and you hold at a crawl until they are clear — pedestrians on a warehouse floor are the reason the site speed and the horn at every blind end exist.",
      missNote: "You drove on toward a picker in the aisle with no warning. Forklift strikes on pedestrians happen at aisle ends, at low speed, when neither person expected the other.",
      wrongNote: "It is the horn. A picker is in the cross aisle reading a scanner.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root, 0, 0.06, 0);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, DRL_ACCENT);

    // ------------------------------------------------------------ the lot (west) and the warehouse floor (east)
    const lotTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#46484b", base2: "#3f4144", seam: "rgba(0,0,0,0.4)" }), { repeat: 5, px: 256 });
    const lotG = box(g, 12, 0.06, 14, -3.5, -0.03, -4.5, 0xffffff, { rough: 0.95 });
    lotG.material = texturedMat(lotTex, { rough: 0.95, metal: 0.02, color: 0xb0b0ad });
    const floorTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 5, px: 256 });
    const floor = box(g, 8, 0.06, 14, 6.5, -0.03, -4.5, 0xffffff, { rough: 0.7 });
    floor.material = texturedMat(floorTex, { rough: 0.7, metal: 0.2, color: 0xc8ccd0 });
    // Space lines and the parked cars of the lot.
    for (const x of [-6.2, -4.2, 1.0, 2.8]) box(g, 0.05, 0.012, 1.8, x, 0.006, x < 0 ? -2.4 : -8.2, 0xeeeeea, { rough: 0.7, cast: false });
    for (const [x, z, c] of [[-3.2, -2.4, 0x8f2d2d], [-7.2, -2.4, 0xd9dcdf], [3.8, -8.2, 0x2d4f8f], [-0.1, -8.2, 0x3a6b3a]]) box(g, 1.1, 0.8, 2.6, x, 0.45, z, c, { rough: 0.4, metal: 0.4 });
    const stopSign = group(g, 0.4, 0, -4.8);
    cyl(stopSign, 0.03, 0.03, 1.4, 0, 0.7, 0, 0x9aa1a7, { rough: 0.4, metal: 0.6, seg: 8 });
    decal(stopSign, 0.34, 0.34, 0, 1.45, 0.02, signFace("STOP", { bg: "#b3261e", fg: "#ffffff", accent: "#ffffff", scale: 0.55 }), { px: 128 });
    // Racking along the warehouse aisle, with a walkway stripe.
    for (const [x, z] of [[6.4, -5.2], [6.4, -8.4], [3.1, -5.0]]) {
      const r = group(g, x, 0, z);
      box(r, 0.9, 2.4, 2.6, 0, 1.2, 0, 0x2f5f9e, { rough: 0.6, metal: 0.4 });
      box(r, 0.8, 0.5, 2.2, 0, 1.55, 0, 0xc9a26b, { rough: 0.85 });
    }
    box(g, 0.14, 0.012, 7, 5.6, 0.006, -6.0, 0xf2c14b, { rough: 0.6, cast: false });

    // ------------------------------------------------------------ the pool car and the forklift
    const car = sedan(g, -5.2, 0, -2.4, { ry: Math.PI, livery: { colour: 0x5a6f86, fleetName: "SMARTCITI POOL", unitNumber: "P-12" } });
    car.scale.setScalar(DRL_SCALE);
    reg2(car, "drl-pool-car");
    const lift = forkliftCounterbalance(g, 4.6, 0, -3.6, { ry: Math.PI });
    lift.scale.setScalar(DRL_SCALE);
    reg2(lift, "drl-forklift");
    const child = standingFigure(g, -9.4, -5.4, { ry: Math.PI / 2, cloth: 0xd84a3a, atStation: true });
    child.scale.setScalar(0.5);
    const picker = standingFigure(g, 8.6, -9.6, { ry: -Math.PI / 2, cloth: 0x37505f, vest: 0xd8e24a, atStation: true });
    picker.scale.setScalar(DRL_SCALE);

    // ------------------------------------------------------------ the pool car's walk-round, brought to the pad
    const tyre = cyl(g, 0.3, 0.3, 0.18, 2.6, 0.22, -1.2, 0x1b1e23, { rough: 0.9, seg: 16 });
    tyre.rotation.z = Math.PI / 2; tyre.scale.set(1, 1, 0.8);
    holoTag(g, "rear tyre", 2.6, 0.72, -1.2, { css: DRL_CSS, w: 0.2 });
    reg2(tyre, "drl-soft-tyre");
    const lamp = box(g, 0.3, 0.14, 0.06, 3.0, 0.8, -0.2, 0xd8322c, { emissive: 0x801010, ei: 0.8, rough: 0.35 });
    reg2(lamp, "drl-cracked-lamp");
    const mirror = box(g, 0.2, 0.14, 0.06, 2.9, 1.0, 0.7, 0x2b2f34, { rough: 0.3, metal: 0.5 });
    mirror.rotation.z = 0.5;
    reg2(mirror, "drl-loose-mirror");

    // ------------------------------------------------------------ the unsafe choices
    const redSlab = (x, z, w, d, id, text, tw) => {
      const s = slab(g, w, 0.02, d, x, 0.03, z, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
      holoTag(g, text, x, 0.28, z, { css: "#d2312b", w: tw });
      reg2(s, id);
      return s;
    };
    redSlab(3.6, -2.6, 1.0, 0.6, "drl-fork-rider", "give them a ride on the forks?", 0.48);
    redSlab(5.0, -1.6, 1.0, 0.6, "drl-high-travel", "carry it up high?", 0.32);
    redSlab(1.6, -3.1, 1.0, 0.6, "drl-jump-clear", "jump clear if it tips?", 0.38);

    // ------------------------------------------------------------ the controls, brought to the pad
    const dash = group(g, -1.7, 0, 1.1, 0.5);
    box(dash, 1.1, 0.9, 0.36, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 1.06, 0.34, 0.05, 0, 1.06, 0.06, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const pedal = box(dash, 0.1, 0.03, 0.16, 0.05, 0.2, 0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    reg2(pedal, "drl-brake-pedal");
    const horn = box(dash, 0.08, 0.05, 0.05, 0.22, 1.2, 0.12, 0x2b2f34, { rough: 0.6 });
    reg2(horn, "drl-horn");
    const chains = box(dash, 0.06, 0.1, 0.04, -0.3, 1.14, 0.1, 0x7d858d, { rough: 0.4, metal: 0.6 });
    reg2(chains, "drl-lift-chains");
    const liftHorn = box(dash, 0.07, 0.05, 0.05, -0.12, 1.12, 0.1, 0xf2b21b, { rough: 0.5 });
    reg2(liftHorn, "drl-lift-horn");
    const lpg = cyl(dash, 0.05, 0.05, 0.16, 0.05, 1.14, 0.1, 0xdfe3e6, { rough: 0.4, metal: 0.4, seg: 10 });
    lpg.rotation.z = Math.PI / 2;
    reg2(lpg, "drl-lift-lpg");
    const tilt = box(dash, 0.03, 0.14, 0.03, 0.38, 1.16, 0.12, 0x1b1e23, { rough: 0.5 });
    reg2(tilt, "drl-tilt-lever");
    const phone = box(dash, 0.07, 0.12, 0.01, 0.44, 0.96, 0.18, 0x1b1e23, { rough: 0.3 });
    holoTag(dash, "text from a friend — reply?", 0.44, 0.8, 0.2, { css: "#d2312b", w: 0.42 });
    reg2(phone, "drl-phone");
    const key = box(g, 0.06, 0.02, 0.14, -0.6, 0.93, 1.35, 0xf2c14b, { rough: 0.4, metal: 0.6 });
    reg2(key, "drl-forklift-key");
    const keyBoard = box(g, 0.4, 0.3, 0.04, -2.7, 1.4, 1.2, 0x3a3f45, { rough: 0.7 });
    holoTag(g, "key board", -2.7, 1.66, 1.2, { css: DRL_CSS, w: 0.2 });
    hits["drl-key-board"] = keyBoard;

    // ------------------------------------------------------------ fork gauge, boards, supervisor
    const forkPost = group(g, 2.3, 0, 1.5, -0.5);
    box(forkPost, 0.06, 1.1, 0.06, 0, 0.55, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    const forkFace = decal(forkPost, 0.34, 0.2, 0, 1.22, 0.04, signFace("FORKS", { bg: "#0a1a18", accent: DRL_CSS, fg: "#e4f7f5", scale: 0.42 }), { px: 256, glow: true, ei: 0.8 });
    reg2(forkPost, "drl-fork-gauge");
    const card = holoPanel(g, 0.84, 0.54, 1.9, 1.5, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "#0a1a18"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = DRL_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e4f7f5"; ctx.fillText("CHECK-RIDE — CAR + FORKLIFT", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#f2fbfa";
      ["Walk round the pool car", "Lot lap: full stop, back into the space", "Forklift: pre-use check, forks low", "Horn at every aisle end", "Tall load: travel in reverse", "Speed: posted and site limits"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.6, accent: DRL_ACCENT });
    reg2(card, "drl-checkride-card");
    const checkin = holoPanel(g, 0.46, 0.3, 0.2, 1.75, 2.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SUPERVISOR DEBRIEF", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("The child · the picker · how it felt", w / 2, h * 0.66);
    }, { ry: 0.2, accent: 0x4fd1ff });
    reg2(checkin, "drl-crew-checkin");
    const log = holoPanel(g, 0.5, 0.36, -2.8, 1.5, -0.5, (ctx, w, h) => {
      ctx.fillStyle = "#0a1a18"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = DRL_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e4f7f5"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("VEHICLE LOGS", w * 0.07, h * 0.22);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("P-12 miles / defects ____", w * 0.07, h * 0.5);
      ctx.fillText("FL-3 pre-use: signed ____", w * 0.07, h * 0.72);
    }, { ry: 1.0, accent: DRL_ACCENT });
    reg2(log, "drl-fleet-log");
    standingFigure(g, -2.95, 0.3, { ry: 1.4, cloth: 0x2b4a48, vest: 0xd8e24a });

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.0, -5.0),
      onStepComplete(step) {
        if (step.id === "drl-walk-round") { tyre.scale.set(1, 1, 1); lamp.material = mat(0xd8322c, { emissive: 0xc01810, ei: 1.2, rough: 0.35 }); mirror.rotation.z = 0; }
        if (step.id === "drl-fork-height") repaint(forkFace, signFace("JUST CLEAR", { bg: "#0a1a18", accent: "#59c97b", fg: "#e4f7f5", scale: 0.4 }));
        if (step.id === "drl-park-lift") key.position.set(-2.7, 1.3, 1.24);
      },
      // The child really runs out between the parked cars; the picker really
      // steps into the cross aisle ahead of the forks.
      onInterrupt(it) {
        if (it.id === "drl-child") { child.position.set(-3.6, 0, -6.0); child.rotation.y = Math.PI / 2; }
        if (it.id === "drl-walker") { picker.position.set(4.0, 0, -9.6); picker.rotation.y = -Math.PI / 2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "drl-child") child.position.set(-3.6, 0, -8.8);
        if (it.id === "drl-walker") { picker.position.set(1.6, 0, -9.8); horn.material = mat(0x59c97b, { rough: 0.6 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "drl-fork-height") {
          const ok = gg.t >= 0.3 && gg.t <= 0.52;
          repaint(forkFace, signFace(ok ? "JUST CLEAR" : gg.t < 0.3 ? "DRAGGING" : "TOO HIGH", { bg: "#0a1a18", accent: ok ? "#59c97b" : "#f2ae14", fg: "#e4f7f5", scale: 0.4 }));
        }
        if (session?.track && step?.id === "drl-tilt") tilt.rotation.x = -0.6 + session.track.v * 1.2;
        void t; void dt;
      },
    };
  },
};
