import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, mat, hose } from "../../../shared/kit.js";
import { tractorTrailer, trailer } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Air Brake Test VR — Mobility & Transit, the second of five
// Commercial Class A stations in the Job Readiness Edition's TDL
// pre-apprenticeship block. The in-cab air brake check a Class A driver does
// before the first trip and a skills examiner watches on test day: wheels
// chocked, air built at fast idle and timed, the governor's cut-out read, key
// on and brakes released, the static leak watched for a minute, the applied
// leak held for a minute, the brakes fanned down until the low-air warning
// comes on and the valves pop, the tanks drained, the service brakes felt at
// walking speed, the leaks found by ear, and the numbers written in the
// report.
//
// The figures in the text are the ones commercial driver manuals teach for a
// combination vehicle, and the station says "the manual", not a clause, where
// they come from. The tractor is drawn shorter than a real one so it fits the
// station. Sited generically: no real carrier, no invented clause number.

const ABT_ACCENT = 0xf2c14b;
const ABT_CAB = 0x2f5f9e;

export const SIM_TDL_AIR_BRAKE_TEST = {
  id: "tdl-air-brake-test",
  index: "223",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: the air brake check under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "clear",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A curriculum covers air brakes and the in-cab brake check, delivered by a provider on the Training Provider Registry; 49 CFR 393 brake system requirements, including the low-pressure warning; 49 CFR 396 inspection and the driver vehicle inspection report; the CVSA North American Standard Out-of-Service Criteria for brakes, air loss and adjustment that a roadside inspector applies; the state commercial driver manual's air brake section, which sets the figures a skills examiner checks; Teamsters (IBT) freight locals' driver training",
  name: "Air Brake Test",
  title: simTitle("Air Brake Test"),
  tagline: "The in-cab air brake check: chock, build and time the air, read the governor, release and watch the static leak, hold the applied leak, fan down to the warning and the pop-out, drain the tanks, feel the service brakes, find the leaks and write the numbers down",
  accent: ABT_ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "holds-air", name: "Holds Air", note: "A full in-cab brake check with every leak rate inside the manual's figure, the blown line caught and the numbers in the report — first time" },

  game: system({
    name: "Air Brakes",
    currency: "PSI",
    ranks: ["Permit Holder", "Air Brake Trainee", "Class A Driver", "Lead Driver", "Air Brake Certified"],
    badges: [
      { id: "timed-build", name: "Timed Build", note: "Air build and governor both read clean", test: AWARD.all(AWARD.stepClean("build-air"), AWARD.stepClean("governor")) },
      { id: "no-shortcuts", name: "No Shortcuts", note: "Never released unchocked, touched a spring chamber, hand-adjusted an automatic slack or drove on low air", test: AWARD.safe },
      { id: "steady-foot", name: "Steady Foot", note: "Gauge readings near the centre of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-check", name: "Clean Check", note: "No corrections anywhere in the check", test: AWARD.clean },
      { id: "watched-needle", name: "Watched the Needle", note: "Both timed watches held in band", test: AWARD.unbroken },
      { id: "test-day", name: "Test-Day Pace", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "abt-no-chock-release": "You went to release the parking brakes before the wheels were chocked. The static leak test is done with the brakes released, on a yard that is never quite level; an unchocked truck with its brakes off rolls, and the driver is looking at a gauge, not out of the windshield.",
    "abt-spring-chamber": "You went to open up the spring brake chamber to look at the leak. The spring inside a brake chamber is compressed with enough force to kill; chambers are caged and serviced only by a trained mechanic, and a driver's job is to find the leak and write it up, never to take one apart.",
    "abt-manual-slack": "You went to wind the automatic slack adjuster by hand to shorten a long pushrod stroke. An automatic adjuster that needs manual adjustment is telling you it — or the brake behind it — has failed; winding it in hides the fault until the brake fades on a grade. Out-of-adjustment brakes are written up for a mechanic.",
    "abt-drive-low-air": "You went to pull away with the low-air warning still on. Below the warning the system may not have enough air for a full stop, and at the pop-out pressure the spring brakes apply wherever you are — including a lane of traffic. You move when the air is built and the warning is out.",
  },

  lateNotes: {
    "abt-yellow-knob": "The parking brakes are released for the leak test only after the chock is in and the air is built.",
    "abt-brake-pedal": "The applied leak test comes after the static one, with the brakes released and the air back at governor cut-out.",
    "abt-dvir": "The report is written once the whole check is done, so every number and every leak is on it.",
  },

  steps: [
    {
      id: "test-card", kind: "select", target: "abt-test-card",
      title: "Read the brake check card",
      cue: "Read the order of the check and the figures for a combination vehicle before you start.",
      why: "The in-cab air brake check is a sequence with numbers attached: how fast the air builds, where the governor cuts out, how much air the system may lose in a minute released and applied, when the warning must come on and when the valves must pop. A driver who knows the figures before starting reads each gauge against them, instead of watching a needle move and deciding it looks fine.",
    },
    {
      id: "chock", kind: "drag", target: "abt-wheel-chock",
      title: "Chock the drive wheels",
      cue: "Carry the chock to the drive tandem and set it snug against the tire.",
      why: "The air brake check releases the brakes on purpose. On a yard that is never quite level, a truck with its brakes off and a driver watching a gauge rolls, slowly and quietly, into whatever is behind it. The chock is what lets the brakes be released safely, and it goes in before any valve is touched.",
      drag: { to: "abt-chock-socket", radius: 0.45, missNote: "Not against the tire — set the chock snug to the drive tread, in front of the wheel." },
    },
    {
      id: "build-air", kind: "track", target: "abt-throttle", seconds: 8,
      title: "Build air at fast idle and time it",
      cue: "Hold a fast idle and time the rise on the gauge through the build range.",
      why: "The rate the air builds is the health check for the compressor and the tanks. Driver manuals give a figure for a dual air system: from 85 to 100 psi in about 45 seconds at fast idle. Slower than that and the compressor is worn or the system is leaking faster than it fills — and a system that cannot keep up in the yard will not keep up on a mountain grade.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "FAST IDLE", readout: (v) => (v < 0.4 ? "low idle — slow build" : v > 0.62 ? "over-revving" : "fast idle") },
      holdBreakNote: "Engine speed out of band — hold a steady fast idle so the build time means something.",
    },
    {
      id: "governor", kind: "gauge", target: "abt-governor",
      title: "Read the governor cut-out",
      cue: "Watch the needle climb and commit at the pressure where the compressor cuts out.",
      why: "The governor stops the compressor pumping at a set pressure, commonly around 125 psi on a truck, and starts it again when the pressure falls. A governor that cuts out too low leaves the system short of air for repeated stops; one that never cuts out drives the pressure up until the safety valve blows. You hear the change in the compressor and see the needle stop at the same moment.",
      gauge: { label: "CUT-OUT PSI", speed: 0.7, green: [0.57, 0.79], readout: (t) => `${Math.round(80 + t * 70)} psi`, missNote: "That is not the cut-out point — watch for the needle to stop and the compressor to unload." },
    },
    {
      id: "key-on", kind: "turn", target: "abt-key",
      title: "Engine off, key back on",
      cue: "Shut the engine down, then turn the key back to ON so the gauges and warning stay live.",
      why: "The leak tests are done with the engine off so the compressor cannot hide a leak by topping the tanks up. The key goes back to ON because the low-air warning and the gauges run on it; with the key off, you are watching a dead dash and the warning you are about to test cannot sound.",
      turn: { turns: 0.25, axis: "z", label: "KEY" },
    },
    {
      id: "release", kind: "sequence", anyOrder: true,
      targets: ["abt-yellow-knob", "abt-red-knob"],
      itemNames: { "abt-yellow-knob": "yellow parking brake valve in", "abt-red-knob": "red trailer air supply in" },
      title: "Release the brakes",
      cue: "Push in the yellow parking brake valve and the red trailer air supply valve, so the whole combination is released.",
      why: "The static leak test measures the system with the brakes off and the lines charged, so both valves go in: the yellow releases the parking brakes, the red charges the trailer and releases its spring brakes. Releasing only the tractor tests half the system, and the trailer's lines and chambers are where many leaks live.",
    },
    {
      id: "leak-watch", kind: "track", target: "abt-leak-watch", seconds: 8,
      title: "Watch the static leak for a minute",
      cue: "Brakes released, engine off: watch the gauge for one minute and keep the loss inside the manual's figure.",
      why: "Driver manuals allow a combination vehicle to lose no more than 3 psi in a minute with the brakes released and the engine off. More than that is a leak big enough to matter on the road, where the compressor is also feeding every brake application. The minute is timed, not guessed, because a slow leak looks like a still needle for the first twenty seconds.",
      track: { start: 0.15, green: [0.4, 0.64], rise: 0.52, fall: 0.44, drift: 0.12, label: "PSI LOSS WATCH", readout: (v) => (v < 0.4 ? "not watching" : v > 0.64 ? "lost count" : "within 3 psi") },
      holdBreakNote: "You lost the watch — keep your eyes on the needle and the clock for the whole minute.",
    },
    {
      id: "applied-leak", kind: "hold", target: "abt-brake-pedal", seconds: 8,
      title: "Hold the applied leak for a minute",
      cue: "Build back to cut-out if you need to, then hold the brake pedal fully applied for one minute and watch the gauge.",
      why: "With the pedal held down the air is in every brake chamber, and leaks in the chambers, hoses and valves show up that a released test cannot find. After the first drop as the chambers fill, the manual allows a combination to lose no more than 4 psi in the minute. A foot that eases off partway makes the test meaningless, so the pedal is held firm and still.",
      holdBreakNote: "Your foot came off the pedal. Hold it fully applied for the whole minute.",
    },
    {
      id: "fan-down", kind: "sequence",
      targets: ["abt-warning-lamp", "abt-knob-pop"],
      itemNames: { "abt-warning-lamp": "low-air warning on before 60 psi", "abt-knob-pop": "valves pop out between 20 and 45 psi" },
      title: "Fan down to the warning and the pop-out",
      cue: "Fan the brake pedal to drain the air: the low-air warning must come on before 60 psi, then the valves must pop out.",
      why: "The low-air warning exists to tell a driver there is trouble while there is still air to stop on; the manual expects it to come on before the pressure falls below 60 psi, and 49 CFR 393 requires the truck to have one. Fanning on down, the parking and trailer valves should pop out in the band the manual gives, commonly between 20 and 45 psi, applying the spring brakes on their own. Both are safety systems you only see work when you test them.",
      outOfOrderNote: "Warning first, then the pop-out — the warning has to come on while there is still air to stop with.",
    },
    {
      id: "tank-drains", kind: "find", noHint: true,
      targets: ["abt-sludge-tank", "abt-drain-cable"],
      itemNames: { "abt-sludge-tank": "the oily sludge from the wet tank", "abt-drain-cable": "the broken drain pull cable" },
      itemNotes: {
        "abt-sludge-tank": "The wet tank blew out oily, milky water. Oil in the tanks means the compressor is passing oil — it gums valves and freezes in winter. It goes on the report.",
        "abt-drain-cable": "The pull cable for this tank's drain has snapped at the valve. A tank that cannot be drained fills with water, and water in the air system freezes in the lines.",
      },
      title: "Drain the tanks and read what comes out",
      cue: "Open each tank drain and look at what comes out. Find what needs writing up.",
      why: "Compressed air carries moisture and a trace of oil, and both collect in the tanks. Draining them daily keeps water out of the valves, where it corrodes seals in summer and freezes solid in winter. What comes out tells you about the compressor, and a drain you cannot operate is a tank quietly filling with water.",
    },
    {
      id: "service-check", kind: "select", target: "abt-service-check",
      title: "Feel the service brakes at walking speed",
      cue: "Air back up, chock pulled: move forward slowly and apply the service brake firmly.",
      why: "The last check is the one that matters on the road: does the truck stop, straight, when the pedal goes down. At walking speed a firm application should stop the combination without pulling to one side or a delayed response. A pull or a soft pedal found here costs a work order; found at highway speed it costs the lane.",
    },
    {
      id: "leak-hunt", kind: "find", noHint: true,
      targets: ["abt-leak-gladhand", "abt-leak-chamber", "abt-leak-drain"],
      itemNames: { "abt-leak-gladhand": "the hiss at the glad-hand seal", "abt-leak-chamber": "the hiss at the brake chamber", "abt-leak-drain": "the drain valve left cracked open" },
      itemNotes: {
        "abt-leak-gladhand": "The rubber seal in this glad-hand is cracked and hissing. A few dollars of seal is the difference between a trailer that holds air and one that sets its brakes on a ramp.",
        "abt-leak-chamber": "A steady hiss from this brake chamber with the brakes applied — a leaking diaphragm. It goes to a mechanic; nobody opens a chamber at the roadside.",
        "abt-leak-drain": "This drain valve was left cracked open after draining. It is the cheapest leak to fix and the most embarrassing to be put out of service for.",
      },
      title: "Walk the rig and listen for leaks",
      cue: "With the brakes applied and the engine off, walk the rig and find every leak by ear.",
      why: "A leak the gauge says is within limits still has a location, and it only gets bigger. Walking the rig with the brakes applied and the yard quiet lets you hear leaks at glad-hands, chambers, hoses and valves. The CVSA out-of-service criteria take a truck off the road for audible air leaks at brake components, so an inspector will hear them too.",
    },
    {
      id: "crew-checkin", kind: "select", target: "abt-crew-checkin",
      title: "Check in with the shop and dispatch",
      cue: "Tell the shop about the chamber, the glad-hand and the compressor oil, tell dispatch the truck is held, and say how you are.",
      why: "The shop can only schedule the chamber and the compressor if it hears about them, and dispatch can only find another truck if it knows this one is held. The check-in is also where a new driver says the blown glad-hand rattled them — a close call that is talked through is one that makes the next driver faster and calmer, not one that gets quietly carried.",
    },
    {
      id: "dvir", kind: "select", target: "abt-dvir",
      title: "Write the numbers in the inspection report",
      cue: "Record the build time, cut-out, both leak rates, warning and pop-out pressures and every leak you found, then sign.",
      why: "49 CFR 396 asks a driver to report defects that would affect safe operation, and a brake check without numbers is a claim, not a record. Writing down each figure against the manual's limit means the mechanic knows what to look for, the next driver knows what was found, and a pattern — a leak rate creeping up week by week — can be seen before it becomes a failure.",
    },
  ],

  interrupts: [
    {
      id: "gladhand-blows",
      kind: "Sudden air loss",
      after: "leak-watch", delay: 3, seconds: 10,
      alert: "A loud bang and a roar of air behind the cab: the trailer emergency glad-hand has blown off and the gauge is falling fast, the low-air buzzer sounding.",
      cue: "Set the parking brakes now.",
      target: "abt-yellow-knob",
      why: "A blown line empties the system in seconds. Pulling the parking brake valve applies the spring brakes on purpose, now, instead of letting the falling pressure apply them for you with the truck in an unknown state. Then the test stops and the line is fixed.",
      missNote: "You kept watching the needle while the system emptied. In the yard the spring brakes will eventually slam on by themselves; on the road, the same blown line is a trailer that brakes itself hard in traffic while the driver is still trying to work out what the noise was.",
      wrongNote: "It is the yellow parking brake valve. The air is going, and the brakes should be set by you, not by the pressure running out.",
    },
    {
      id: "worker-between",
      kind: "Person between the units",
      after: "applied-leak", delay: 3, seconds: 10,
      alert: "A yard worker has ducked between the tractor and the trailer to look at the air lines, right where the rig would pinch if it moved.",
      cue: "Warn them and keep your foot where it is.",
      target: "abt-horn",
      why: "The space between tractor and trailer is where people are crushed when a rig moves unexpectedly — a released brake, a truck rolling on a slope, a driver who did not know anyone was there. The horn tells the worker you are in the cab and the rig is live; your foot stays on the brake until they are out.",
      missNote: "You carried on with someone between the units and did not warn them. People working between a tractor and trailer are killed when the rig moves even a foot; the horn and a hand signal are how both of you know where the other is.",
      wrongNote: "It is the horn. Someone is standing in the pinch point between the tractor and trailer.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, ABT_ACCENT);

    // ------------------------------------------------------------ yard surface
    const yardTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#3f4246", base2: "#36393d", seam: "rgba(0,0,0,0.45)" }), { repeat: 5, px: 512 });
    const yard = box(g, 11, 0.12, 8.6, 0, 0.06, -0.9, 0xffffff, { rough: 0.95 });
    // The pup runs past the yard's edge; the slab runs on under it.
    box(g, 3.6, 0.12, 3.2, 7.3, 0.06, -0.9, 0xffffff, { rough: 0.95 }).material = texturedMat(yardTex, { rough: 0.95, metal: 0.02, color: 0xabafb4 });
    yard.material = texturedMat(yardTex, { rough: 0.95, metal: 0.02, color: 0xabafb4 });
    for (const x of [-4.8, 4.8]) box(g, 0.1, 0.006, 6, x, 0.123, -0.6, 0xf2f5f7, { rough: 0.6, cast: false });

    // ------------------------------------------------------------ the rig, side-on, front to the left
    // The kit's day cab coupled to a 28 ft pup (shared/fleet.js), at real
    // size. `tr` is the tractor's own frame: x runs front (-) to back (+),
    // z is the driver's side (+); the tractor's front is at x -3.43 in it.
    const rig = tractorTrailer(g, 2.11, 0.12, -0.9, {
      trailer: "pup", ry: -Math.PI / 2,
      livery: { colour: ABT_CAB, fleetName: "CITY LINEHAUL", unitNumber: "2208" },
      trailerLivery: { colour: 0xe8eef2, fleetName: "CITY LINEHAUL", unitNumber: "P-318" },
    });
    const TP = rig.userData.parts.tractor.userData.parts;
    const tr = group(g, -1.0, 0.12, -0.9);
    TP.doorL.rotation.y = -0.6;
    const chockSocket = box(tr, 0.3, 0.2, 0.3, 0.85, 0.1, 1.0, 0xffffff, { rough: 0.5 });
    chockSocket.visible = false; hits["abt-chock-socket"] = chockSocket;
    // Air tanks slung under the frame, inboard of the fuel tank, with their drains.
    const tanks = [];
    for (const [x, c] of [[-0.9, 0x8b949d], [-0.2, 0x8b949d], [0.35, 0x59636d]]) { const t = cyl(tr, 0.19, 0.19, 0.6, x, 0.46, 0.3, c, { rough: 0.4, metal: 0.6, seg: 14 }); t.rotation.z = Math.PI / 2; tanks.push(t); }
    const sludge = box(tr, 0.14, 0.02, 0.14, -0.9, 0.2, 0.42, 0xc8c0a0, { rough: 0.2, opacity: 0.85 });
    reg2(sludge, "abt-sludge-tank");
    const cable = box(tr, 0.02, 0.02, 0.4, -0.2, 0.3, 0.62, 0xd98a3a, { rough: 0.6 });
    cable.rotation.x = 0.6;
    reg2(cable, "abt-drain-cable");
    const drainValve = box(tr, 0.06, 0.06, 0.06, 0.35, 0.24, 0.42, 0xd2312b, { emissive: 0xd2312b, ei: 0.3, rough: 0.5 });
    reg2(drainValve, "abt-leak-drain");
    // Drive-axle brake chamber and slack adjuster, just ahead of the duals.
    const chamber = group(tr, 1.2, 0.6, 0.48);
    cyl(chamber, 0.13, 0.13, 0.28, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.4, seg: 14 }).rotation.z = Math.PI / 2;
    cyl(chamber, 0.12, 0.12, 0.2, -0.22, 0, 0, 0x3a3f45, { rough: 0.6, metal: 0.4, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(tr, "spring chamber — open it up?", 1.25, 1.2, 1.5, { css: "#d2312b", w: 0.46 });
    reg2(chamber, "abt-spring-chamber");
    const chamberLeak = box(tr, 0.08, 0.08, 0.08, 0.92, 0.6, 0.62, 0x6fc4f0, { emissive: 0x6fc4f0, ei: 0.5, rough: 0.4 });
    reg2(chamberLeak, "abt-leak-chamber");
    const slack = box(tr, 0.05, 0.28, 0.05, 1.42, 0.42, 0.6, 0xd9a13a, { rough: 0.5, metal: 0.5 });
    holoTag(tr, "wind the automatic slack in?", 1.9, 0.2, 1.5, { css: "#d2312b", w: 0.46 });
    reg2(slack, "abt-manual-slack");
    // The kit's glad-hand lines run from the back of the cab to the pup's
    // nose; the emergency (red) line is the one that blows off and hangs.
    const blownLine = hose(tr, [[0.78, 1.95, 0.32], [0.95, 1.2, 0.62], [1.1, 0.45, 0.85]], 0.02, 0xd2312b, { steps: 10, rough: 0.6 });
    blownLine.visible = false;
    const gladhand = box(tr, 0.1, 0.07, 0.1, 1.12, 1.66, 0.57, 0xd2312b, { rough: 0.5, metal: 0.4 });
    reg2(gladhand, "abt-leak-gladhand");

    // ------------------------------------------------------------ the in-cab controls, laid out at the open door
    const dash = group(g, -1.2, 0.12, 1.45, 0.2);
    box(dash, 1.1, 0.9, 0.35, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 1.06, 0.4, 0.05, 0, 1.08, 0.05, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const rim = cyl(dash, 0.2, 0.2, 0.03, -0.1, 1.28, 0.28, 0x1b1e23, { rough: 0.5, seg: 18 });
    rim.rotation.x = 1.1;
    const hornPad = cyl(dash, 0.05, 0.05, 0.02, -0.1, 1.29, 0.29, 0x2b2f34, { rough: 0.6, seg: 12 });
    hornPad.rotation.x = 1.1;
    reg2(hornPad, "abt-horn");
    const airGauge = instrument(dash, -0.36, 1.1, 0.09, { idle: "0 psi", color: ABT_ACCENT, w: 0.18, d: 0.12 });
    reg2(airGauge, "abt-governor");
    holoTag(dash, "air pressure", -0.36, 1.3, 0.09, { css: "#f2c14b", w: 0.22 });
    const watch = box(dash, 0.14, 0.08, 0.03, -0.36, 0.96, 0.1, 0x1b1e23, { rough: 0.5 });
    reg2(watch, "abt-leak-watch");
    const lamp = cyl(dash, 0.03, 0.03, 0.02, 0.1, 1.2, 0.1, 0x5a1a1a, { rough: 0.4, seg: 12 });
    lamp.rotation.x = Math.PI / 2;
    reg2(lamp, "abt-warning-lamp");
    const key = box(dash, 0.04, 0.07, 0.03, 0.24, 1.02, 0.1, 0xd9dde2, { rough: 0.3, metal: 0.8 });
    reg2(key, "abt-key");
    const yellow = box(dash, 0.08, 0.08, 0.08, 0.36, 0.95, 0.12, 0xf2c14b, { rough: 0.5 });
    yellow.rotation.z = Math.PI / 4;
    reg2(yellow, "abt-yellow-knob");
    const red = cyl(dash, 0.045, 0.045, 0.06, 0.46, 0.95, 0.12, 0xd2312b, { rough: 0.5, seg: 8 });
    red.rotation.x = Math.PI / 2;
    reg2(red, "abt-red-knob");
    const popMarker = box(dash, 0.2, 0.05, 0.03, 0.41, 0.86, 0.12, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.3, rough: 0.5, opacity: 0.6 });
    reg2(popMarker, "abt-knob-pop");
    holoTag(dash, "parking · trailer supply", 0.41, 0.78, 0.2, { css: "#f2c14b", w: 0.4 });
    const pedal = box(dash, 0.1, 0.03, 0.16, 0.05, 0.2, 0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    reg2(pedal, "abt-brake-pedal");
    const throttle = box(dash, 0.08, 0.03, 0.18, 0.2, 0.2, 0.3, 0x3a3f45, { rough: 0.5 });
    reg2(throttle, "abt-throttle");
    holoTag(dash, "brake · throttle", 0.12, 0.42, 0.4, { css: "#f2c14b", w: 0.26 });
    const rolling = box(dash, 0.2, 0.06, 0.06, -0.1, 1.45, 0.1, 0x59c97b, { emissive: 0x59c97b, ei: 0.3, rough: 0.5 });
    holoTag(dash, "move forward — brake check", -0.1, 1.58, 0.1, { css: "#f2c14b", w: 0.44 });
    reg2(rolling, "abt-service-check");
    const noChock = slab(g, 0.7, 0.02, 0.45, -2.3, 0.13, 1.7, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "release before the chock?", -2.3, 0.34, 1.7, { css: "#d2312b", w: 0.42 });
    reg2(noChock, "abt-no-chock-release");
    const pullAway = slab(g, 0.9, 0.02, 0.5, -3.6, 0.13, 0.9, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "pull away — warning still on?", -3.6, 0.34, 0.9, { css: "#d2312b", w: 0.48 });
    reg2(pullAway, "abt-drive-low-air");

    // ------------------------------------------------------------ the chock and the boards
    const chock = box(g, 0.28, 0.2, 0.26, 1.2, 0.22, 1.7, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "wheel chock", 1.2, 0.55, 1.7, { css: "#f2c14b", w: 0.22 });
    reg2(chock, "abt-wheel-chock");
    const card = holoPanel(g, 0.84, 0.56, -3.2, 1.55, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "#171204"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fbefc8"; ctx.fillText("IN-CAB AIR BRAKE CHECK — COMBINATION", w * 0.05, h * 0.13);
      ctx.font = `${Math.round(h * 0.074)}px Arial, sans-serif`; ctx.fillStyle = "#fff8e2";
      ["Build 85→100 psi in about 45 s (fast idle)", "Governor cut-out: note the pressure", "Static leak, released: ≤ 3 psi / min", "Applied leak, after drop: ≤ 4 psi / min", "Low-air warning on before 60 psi", "Valves pop out about 20–45 psi"]
        .forEach((l, i) => ctx.fillText(l, w * 0.05, h * (0.28 + i * 0.115)));
    }, { ry: 0.6, accent: ABT_ACCENT });
    reg2(card, "abt-test-card");
    const checkin = holoPanel(g, 0.46, 0.3, 3.0, 1.75, 1.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SHOP + DISPATCH CHECK-IN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Leaks · compressor · how you are", w / 2, h * 0.66);
    }, { ry: -0.6, accent: 0x4fd1ff });
    reg2(checkin, "abt-crew-checkin");
    const dvir = holoPanel(g, 0.5, 0.36, 2.0, 1.55, 2.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,16,4,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbefc8"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DRIVER VEHICLE", w / 2, h * 0.22);
      ctx.fillText("INSPECTION REPORT", w / 2, h * 0.4);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Build · cut-out · leaks · warning", w / 2, h * 0.7);
    }, { ry: -0.3, accent: ABT_ACCENT });
    reg2(dvir, "abt-dvir");
    cone(g, -4.2, 2.0);
    cone(g, 4.4, 1.6);

    // ------------------------------------------------------------ the rest of the yard: a dropped pup, a light mast, the fence
    trailer(g, -1.2, 0.12, -4.0, { kind: "pup", ry: -Math.PI / 2, livery: { colour: 0xdfe4e8, fleetName: "CITY LINEHAUL", unitNumber: "DROP 12" } });
    const mast = group(g, 4.9, 0.12, -3.2);
    cyl(mast, 0.08, 0.1, 6.0, 0, 3.0, 0, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 10 });
    box(mast, 0.9, 0.15, 0.3, 0, 6.0, 0, 0x3a3f45, { rough: 0.5, metal: 0.5 });
    for (const dx of [-0.3, 0, 0.3]) box(mast, 0.22, 0.05, 0.22, dx, 5.9, 0, 0xfff4d8, { emissive: 0xfff4d8, ei: 0.8, rough: 0.3 });
    for (let i = 0; i < 6; i++) cyl(g, 0.03, 0.03, 1.8, -5.2 + i * 2.0, 0.9, -5.4, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    box(g, 10.2, 1.6, 0.02, -0.2, 0.95, -5.4, 0x9aa4ab, { rough: 0.6, metal: 0.4, opacity: 0.4 });

    // ------------------------------------------------------------ the yard worker
    const worker = standingFigure(g, 3.3, 1.35, { ry: -2.4, cloth: 0x2b3138, vest: 0xf2a23b });
    holoTag(worker, "yard worker", 0, 1.95, 0, { css: "#f2c14b", w: 0.22 });

    let psi = 0.2;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.9, 1.1, 0.2),
      onStepComplete(step) {
        if (step.id === "chock") { chock.parent.remove(chock); tr.add(chock); chock.position.set(0.85, 0.1, 1.0); }
        if (step.id === "build-air") psi = 0.7;
        if (step.id === "release") { yellow.position.z = 0.09; red.position.z = 0.09; }
        if (step.id === "fan-down") { lamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.3, rough: 0.4 }); yellow.position.z = 0.14; red.position.z = 0.14; }
        if (step.id === "service-check") { chock.visible = false; lamp.material = mat(0x5a1a1a, { rough: 0.4 }); }
        if (step.id === "dvir") {
          repaint(dvir.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,14,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("REPORT SIGNED", w / 2, h * 0.34);
            ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
            ctx.fillText("Chamber · glad-hand · oil in tank", w / 2, h * 0.64);
          });
        }
      },
      // The glad-hand line really blows off and hangs; the warning lamp really
      // lights. The yard worker really steps in between the units.
      onInterrupt(it) {
        if (it.id === "gladhand-blows") { TP.gladHandEmergency.visible = false; blownLine.visible = true; lamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.3, rough: 0.4 }); }
        if (it.id === "worker-between") { worker.position.set(-0.13, 0, 0.3); worker.rotation.y = Math.PI; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gladhand-blows") { yellow.position.z = 0.14; TP.gladHandEmergency.visible = true; blownLine.visible = false; lamp.material = mat(0x5a1a1a, { rough: 0.4 }); }
        if (it.id === "worker-between") { worker.position.set(3.3, 0, 1.35); worker.rotation.y = -2.4; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "governor") {
          const ok = gg.t >= 0.57 && gg.t <= 0.79;
          repaint(airGauge.userData.screen, signFace(`${Math.round(80 + gg.t * 70)} psi`, { bg: "#171204", accent: ok ? "#59c97b" : "#f2ae14", fg: "#fff8e2", scale: 0.5 }));
        }
        if (step?.id === "build-air" && session.holding) psi = Math.min(0.7, psi + dt / 16);
        if (session?.turn && step?.id === "key-on") key.rotation.z = -session.turn.amount * Math.PI * 2;
        void t; void psi; void tanks;
      },
    };
  },
};
