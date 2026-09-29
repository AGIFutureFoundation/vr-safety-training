import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Locomotive Cab Startup & Alerter VR — Mobility & Transit.
//
// Everything an engineer proves before a locomotive is trusted to move: the
// walk-around done before the cab, the reverser handle carried to the stand
// and seated rather than assumed to already be there, the independent and
// automatic brakes tested from the cab, movement authority confirmed over
// the radio before the throttle means anything, and the alerter answered on
// its own schedule for the whole trip because it is the one device built to
// notice an engineer who has stopped noticing anything else. Generic
// freight territory; no railroad, milepost or timetable named.

const RA_LCS_ACCENT = 0x3d6fae;
const RA_LCS_CSS = "#3d6fae";

export const SIM_RA_LOCOMOTIVE_CAB_STARTUP_AND_ALERTER = {
  id: "ra-locomotive-cab-startup-and-alerter",
  index: "428",
  domain: "Rail",
  trade: "Locomotive engineer",
  category: "Mobility & Transit",
  weather: "clear",
  certification: "BLET-qualified locomotive engineer working to FRA 49 CFR Part 232 brake system standards for the independent and automatic brake tests, movement authority confirmed over the radio the way the dispatcher and a SMART-TD-qualified conductor both expect it worked, with roadway worker protection under FRA 49 CFR Part 214 respected the whole time the walk-around is underway",
  name: "Locomotive Cab Startup & Alerter",
  title: simTitle("Locomotive Cab Startup & Alerter"),
  tagline: "The walk-around done on foot, the reverser handle carried and seated, both brakes tested from the cab, movement authority confirmed over the radio, and the alerter answered on its own schedule the whole way to highball",
  accent: RA_LCS_ACCENT,
  accentCss: RA_LCS_CSS,
  parSeconds: 330,
  footprint: 2.4,
  supportLine: "your road foreman or your BLET local if fatigue on a long tour of duty is making the alerter feel like the only thing keeping you awake",
  badge: { id: "highball-clean", name: "Clean Highball", note: "Startup, both brake tests and every alerter cycle answered with nothing skipped" },

  game: system({
    name: "Cab Authority",
    currency: "THROTTLE",
    ranks: ["Hostler", "Qualified Engineer", "Road Engineer", "Road Foreman", "Cab Authority Certified"],
    badges: [
      { id: "never-early", name: "Never Early", note: "Never touched the throttle or reverser before movement authority was confirmed", test: AWARD.safe },
      { id: "gauge-true", name: "Gauge True", note: "Every gauge reading near band centre", test: AWARD.precise(0.72) },
      { id: "brakes-clean", name: "Clean Brakes", note: "Independent and automatic brake tests worked with no correction", test: AWARD.all(AWARD.stepClean("independent-brake"), AWARD.stepClean("automatic-brake")) },
    ],
    challenges: [
      { id: "highball-time", name: "Highball Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-highball", name: "First Highball", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ten-clear", name: "Ten Clear", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "unsecured-walkway": "You stepped up without taking the handhold. Boarding a locomotive is a three-point job — two hands and a foot, or two feet and a hand — and skipping the handhold to save a second is exactly how an engineer goes down the steps backward instead of up them.",
    "moving-under-loco": "You reached toward the coupler during the walk-around before confirming the engine is shut down. A locomotive that can still move does not announce it before the coupler closes on whatever is reaching into it, and a walk-around is not the time to find out the hard way which state it was actually in.",
    "unauthorized-movement": "You put a hand on the throttle before movement authority was confirmed. However ready the brakes and the engine are, a locomotive with no confirmed authority is a locomotive that, as far as the dispatcher and every other crew in this territory know, has no reason to be moving yet.",
    "open-engine-door": "You left the engine compartment access door open near the running gear. A door swinging loose at speed is a door that can catch a hand reaching past it or come open further than anyone expected, and it is closed and latched before the engine ever turns over.",
  },

  lateNotes: {
    "reverser-handle": "The handle goes into the stand only once the reverser itself is confirmed in neutral — never before.",
    "left-tool-cab": "Nothing gets tallied against the closing count until the walk is actually done.",
  },

  interrupts: [
    {
      id: "emergency-message",
      kind: "The dispatcher reports something ahead",
      after: "automatic-brake", delay: 4, seconds: 12,
      alert: "The radio breaks in mid-test: the dispatcher is reporting equipment fouling the track ahead of your authorized limits.",
      cue: "That is not a routine call, and it is not asking you to finish the brake test first.",
      target: "emergency-brake",
      why: "A report of equipment fouling the track ahead outranks anything else in progress in the cab, including a brake test that was already going to prove the same valve works — the emergency brake is the one control that gets the train stopped in the shortest distance this equipment can manage, and it is reached for immediately, not after the current step is wrapped up.",
      missNote: "You kept working the automatic brake test through the whole call. The report did not need you to finish testing a valve you were already about to prove works — it needed that valve applied in emergency, now, and nothing about finishing the test first got the train stopped any sooner.",
      wrongNote: "That does not answer a report of fouled track ahead. The emergency brake is the control built for exactly this call.",
    },
    {
      id: "alerter-timeout",
      kind: "The alerter reaches the end of its countdown",
      after: "task-focus", delay: 4, seconds: 11,
      alert: "The alerter chime has started and the countdown light is flashing. It has not been reset in the interval this trip requires.",
      cue: "That chime is not background noise — it is the countdown to a penalty brake application.",
      target: "alerter-reset",
      why: "The alerter is built on one assumption: an engineer who has stopped responding to anything has also stopped responding to the alerter, so the test it runs is deliberately simple — press the reset within the interval, or the equipment assumes the worst and applies the brakes itself. Answering it here is not paperwork, it is the actual thing the device exists to check.",
      missNote: "You let the alerter run out. The penalty brake application that follows is not a malfunction — it is the system doing exactly what it is built to do the moment it stops getting an answer, on the assumption that no answer means nobody capable of giving one is at the controls.",
      wrongNote: "That does not answer the alerter. Reset it directly, before the countdown reaches zero.",
    },
  ],

  steps: [
    {
      id: "briefing", kind: "select", target: "train-order-board",
      title: "Read the train order",
      cue: "Check the consist, the initial movement authority and the track speed for this territory.",
      why: "Everything the rest of this trip depends on is set before the engine ever turns over — what this consist weighs, what authority has been granted, and what speed this territory allows are facts the whole trip is planned against, not things worked out after the wheels are already turning.",
    },
    {
      id: "walk-around", kind: "sequence", anyOrder: true,
      targets: ["journal-box", "coupler-check", "brake-hose-check"],
      itemNames: { "journal-box": "journal box — oil level and seal", "coupler-check": "coupler and knuckle", "brake-hose-check": "brake hose and glad hand" },
      title: "Walk around the locomotive",
      cue: "Check the journal boxes, the coupler and the brake hoses before boarding.",
      why: "The walk-around is the one inspection this locomotive gets from a person actually looking at it today, and every item on it is something that fails quietly from the cab — a hot journal, a worn knuckle, a cracked hose all read completely normal on every gauge until the moment they don't.",
    },
    {
      id: "board", kind: "select", target: "mount-point",
      title: "Board using the handhold",
      cue: "Take the handhold and the steps together, three points of contact the whole way up.",
      why: "The steps into a locomotive cab are steel, often wet or greasy, and set at a height that makes skipping the handhold feel faster right up until a boot slips — three points of contact is what turns that slip into a recovered step instead of a fall.",
    },
    {
      id: "reverser-handle", kind: "drag", target: "reverser-handle",
      title: "Seat the reverser handle",
      cue: "Carry the reverser handle from its hook to the control stand and seat it, only once the reverser reads neutral.",
      why: "The handle is kept separate from the stand for exactly this reason — a locomotive with no handle seated cannot be put into gear by a hand brushing the reverser by accident, and seating it is the one deliberate action that changes that.",
      drag: { to: "reverser-slot", radius: 0.3, missNote: "Not seated in the stand — carry the handle the rest of the way and set it into the slot." },
    },
    {
      id: "engine-start", kind: "turn", target: "engine-start-switch",
      title: "Start the prime mover",
      cue: "Turn the start switch and hold until the engine catches.",
      why: "The prime mover is what the rest of this startup depends on — the air compressor, the main generator and every gauge in this cab reads off a system that has to actually be running before any of the tests that follow mean anything.",
      turn: { turns: 0.3, axis: "z", label: "ENGINE START" },
    },
    {
      id: "air-gauge", kind: "gauge", target: "main-reservoir-gauge",
      title: "Build main reservoir pressure",
      cue: "Watch the main reservoir gauge and commit once it reads full charge.",
      why: "Every brake on this consist is fed from the main reservoir, and a test run before it is fully charged tells you nothing about how those brakes behave once they actually are — the gauge is what says the system is ready to be tested, not the clock since the engine started.",
      gauge: {
        label: "MAIN RESERVOIR", speed: 0.66, green: [0.82, 1.0],
        readout: (t) => `${Math.round(t * 140)} psi`,
        missNote: "Not fully charged. Give the compressor more time before testing.",
      },
    },
    {
      id: "independent-brake", kind: "select", target: "independent-brake",
      title: "Test the independent brake",
      cue: "Apply and release the independent brake and confirm the locomotive's own wheels respond.",
      why: "The independent brake is the locomotive's own, separate from the train line, and it is tested on its own first because a locomotive that cannot hold itself is not a locomotive that should be trusted to help hold anything else.",
    },
    {
      id: "automatic-brake", kind: "hold", target: "automatic-brake-valve", seconds: 5,
      title: "Test the automatic brake",
      cue: "Hold the automatic brake valve in a service application and confirm the whole train line responds.",
      why: "The automatic brake is what the whole consist answers to, and a service application tested now, at a stop, is what confirms that valve does what it is supposed to before it is ever needed at speed, where a brake that does not answer is a very different kind of problem.",
      holdBreakNote: "You let go before the application was confirmed. An automatic brake test that is not held long enough to actually read a response proves nothing.",
    },
    {
      id: "alerter-test", kind: "select", target: "alerter-reset",
      title: "Test the alerter",
      cue: "Press the alerter reset once to confirm the device itself is live before departure.",
      why: "The alerter that will police the whole trip only helps if it is actually working, and the one moment to confirm that cheaply is a deliberate test at a stop — not the first time it should have caught something and didn't.",
    },
    {
      id: "call-authority", kind: "select", target: "radio-handset",
      title: "Confirm movement authority",
      cue: "Call the dispatcher and confirm the authority and track speed for this territory.",
      why: "A signal indication or a track warrant read from a piece of paper is not the same as having it confirmed by the one person who can also see every other movement in this territory — the call is what makes sure both sides are working from the same authority before the first wheel turns.",
    },
    {
      id: "task-focus", kind: "track", target: "paperwork-clipboard", seconds: 6,
      track: { readout: (v) => (v < 0.42 ? "below the band" : v > 0.62 ? "above the band" : "in the band") }, // the engine's default band, in words
      title: "Complete the trip paperwork",
      cue: "Keep your attention in the green band while you finish the paperwork before departure.",
      why: "A cab has real paperwork that has to get done, and doing it is not itself unsafe — what matters is that attention on the page does not become attention nowhere else, which is exactly the gap the alerter is built to close if it runs longer than it should.",
      holdBreakNote: "Attention dropped out of band while the paperwork was in front of you. That is exactly the gap the alerter is built to notice, whether or not it happens to catch it this time.",
    },
    {
      id: "horn-sequence", kind: "select", target: "horn-sequence",
      title: "Sound the horn sequence",
      cue: "Sound the standard horn sequence for the crossing ahead before departure.",
      why: "The horn sequence is what warns a driver at a crossing this locomotive is coming, sounded early and held long enough to actually be heard over a closed window and an engine — a horn sounded late or clipped short gives a driver less warning than the crossing was designed around.",
    },
    {
      id: "cab-walk", kind: "find", noHint: true,
      targets: ["left-tool-cab", "loose-item"],
      itemNames: { "left-tool-cab": "wrench left on the control stand", "loose-item": "loose fire extinguisher bracket" },
      itemNotes: {
        "left-tool-cab": "A tool left on the stand becomes a projectile the first time this cab takes a hard jolt.",
        "loose-item": "Anything not actually secured in a moving cab eventually ends up on the floor at the worst possible moment.",
      },
      title: "Walk the cab before highball",
      cue: "Scan the cab for anything left loose before the train starts moving.",
      why: "A cab in motion turns anything unsecured into something that moves on its own the first time the train brakes or takes a curve, and the only check that catches it is somebody actually looking before the wheels turn.",
    },
    {
      id: "close-log", kind: "select", target: "closing-log",
      title: "Log the departure",
      cue: "Log the brake test results, the authority confirmed and the departure time.",
      why: "The next crew and the dispatcher's own record both rely on this entry — the tests that were run, the authority that was confirmed, and the exact minute this consist actually started moving.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, RA_LCS_ACCENT);

    // ------------------------------------------------------------- textures
    const ballastTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#54524a"); grad.addColorStop(1, "#39372f");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 800; i++) {
        const x = (i * 53.1) % w, y = (i * 89.7) % h, r = 1.4 + ((i * 17) % 5) * 0.5;
        cx.fillStyle = i % 4 === 0 ? "rgba(150,140,122,0.55)" : "rgba(30,26,20,0.45)";
        cx.beginPath(); cx.ellipse(x, y, r, r * 0.7, (i % 6) * 0.5, 0, 7); cx.fill();
      }
    }, { repeat: 6 });
    const ballastMat = texturedMat(ballastTex, { rough: 0.96, color: 0x8a8477 });

    const railTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#c7ccd1"); grad.addColorStop(0.5, "#8a9096"); grad.addColorStop(1, "#5b6167");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
    }, { repeat: 3 });
    const railMat = texturedMat(railTex, { rough: 0.32, metal: 0.75, color: 0xaab0b6 });

    const tieTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#3a2c20"); grad.addColorStop(0.5, "#2c2117"); grad.addColorStop(1, "#382a1e");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "rgba(0,0,0,0.35)"; cx.lineWidth = 2;
      for (let i = 0; i < 10; i++) { cx.beginPath(); cx.moveTo(0, (i / 10) * h + 4); cx.bezierCurveTo(w * 0.3, (i / 10) * h - 3, w * 0.7, (i / 10) * h + 6, w, (i / 10) * h); cx.stroke(); }
    }, { repeat: 1 });
    const tieMat = texturedMat(tieTex, { rough: 0.9, color: 0x8a7a68 });

    const platformTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#33445a", base2: "#2a384a", seam: "rgba(0,0,0,0.5)",
    }), { repeat: 3 });
    const platformMat = texturedMat(platformTex, { rough: 0.9, color: 0xa9c1d9 });

    const steelTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#28313d"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 14; i++) {
        cx.fillStyle = i % 2 ? "rgba(0,0,0,0.24)" : "rgba(255,255,255,0.08)";
        cx.fillRect((i / 14) * w, 0, w / 28, h);
      }
    }, { repeat: 2 });
    const locoSteelMat = texturedMat(steelTex, { rough: 0.6, metal: 0.4, color: 0x2f3841 });

    // ------------------------------------------------------------- track
    const ballast = box(g, 6.4, 0.16, 1.6, 0, 0.08, 0, 0x8a8477, { rough: 0.98 });
    ballast.material = ballastMat;
    for (const sx of [-1, 1]) {
      const rail = box(g, 6.4, 0.1, 0.06, 0, 0.21, sx * 0.36, 0xaab0b6, { rough: 0.32, metal: 0.75 });
      rail.material = railMat;
    }
    for (let i = -12; i <= 12; i++) {
      const tie = box(g, 0.16, 0.06, 0.9, i * 0.26, 0.11, 0, 0x8a7a68, { rough: 0.9 });
      tie.material = tieMat;
    }

    // ------------------------------------------------------------- locomotive
    const loco = group(g, 0, 0, 0);
    const locoBody = box(loco, 3.2, 0.24, 1.56, 0, 0.58, 0, 0x2b3138, { rough: 0.7, metal: 0.45 });
    locoBody.material = locoSteelMat;
    box(loco, 1.8, 1.1, 1.2, -0.5, 1.28, 0, 0x2f3841, { rough: 0.6, metal: 0.4 });
    box(loco, 1.0, 1.3, 1.36, 0.9, 1.38, 0, 0x2f3841, { rough: 0.6, metal: 0.4 });
    const engineDoor = box(loco, 0.6, 0.9, 0.03, 0.9, 1.3, 0.69, 0x3a4048, { rough: 0.65, metal: 0.3 });
    reg(hits, engineDoor, "open-engine-door");

    // Steps and handhold.
    const steps = group(loco, -1.4, 0, -0.78, -0.3);
    for (let i = 0; i < 3; i++) box(steps, 0.4, 0.03, 0.2, 0, 0.2 + i * 0.2, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    const handhold = cyl(steps, 0.015, 0.015, 0.6, 0.22, 0.9, 0, 0xd8dce0, { rough: 0.5, metal: 0.7, seg: 8 });
    reg(hits, handhold, "mount-point");
    reg(hits, box(steps, 0.5, 1.0, 0.4, 0, 0.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "unsecured-walkway");

    // Coupler and journal boxes.
    const coupler = box(loco, 0.34, 0.2, 0.19, -1.65, 0.6, 0, 0x6b7279, { rough: 0.7, metal: 0.5, finish: "rust" });
    reg(hits, coupler, "coupler-check");
    reg(hits, box(loco, 0.6, 0.6, 0.6, -1.7, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "moving-under-loco");
    const journal = box(loco, 0.3, 0.3, 0.3, -0.9, 0.28, -0.55, 0x3a3a3a, { rough: 0.75, metal: 0.4 });
    reg(hits, journal, "journal-box");
    const brakeHose = cyl(loco, 0.02, 0.02, 0.3, -1.6, 0.4, 0.5, 0x1b1e22, { rough: 0.8, seg: 8 });
    brakeHose.rotation.x = 0.6;
    reg(hits, brakeHose, "brake-hose-check");

    // ------------------------------------------------------------- cab controls
    const standGroup = group(loco, 0.4, 1.0, -0.4, -0.4);
    box(standGroup, 0.36, 0.5, 0.24, 0, 0.25, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });

    const reverserHook = group(loco, -0.6, 1.2, 0.4, 0.3);
    box(reverserHook, 0.05, 0.16, 0.05, 0, 0, 0, RA_LCS_CSS, { rough: 0.5, metal: 0.4 });
    holoTag(reverserHook, "Reverser handle", 0, 0.24, 0, { css: RA_LCS_CSS, w: 0.3 });
    reg(hits, reverserHook, "reverser-handle");
    hits["reverser-slot"] = box(standGroup, 0.06, 0.1, 0.06, 0.1, 0.52, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });

    const startSwitch = cyl(standGroup, 0.03, 0.03, 0.05, -0.1, 0.52, 0.03, 0xf2c14b, { rough: 0.5, seg: 10 });
    holoTag(standGroup, "Engine start", -0.1, 0.6, 0.03, { css: RA_LCS_CSS, w: 0.3 });
    reg(hits, startSwitch, "engine-start-switch");

    const resGauge = instrument(standGroup, 0, 0.42, 0.13, { ry: 0, idle: "-- psi", color: RA_LCS_ACCENT });
    holoTag(resGauge, "Main reservoir", 0, 0.1, 0, { css: RA_LCS_CSS, w: 0.32 });
    reg(hits, resGauge, "main-reservoir-gauge");

    const indBrake = box(standGroup, 0.06, 0.03, 0.04, 0.12, 0.3, 0.1, 0x59636d, { rough: 0.5, metal: 0.4 });
    holoTag(standGroup, "Independent brake", 0.12, 0.4, 0.1, { css: RA_LCS_CSS, w: 0.34 });
    reg(hits, indBrake, "independent-brake");
    const autoBrakeValve = box(standGroup, 0.09, 0.05, 0.04, -0.12, 0.3, 0.1, 0x50575e, { rough: 0.5, metal: 0.5 });
    holoTag(standGroup, "Automatic brake", -0.12, 0.4, 0.1, { css: RA_LCS_CSS, w: 0.34 });
    reg(hits, autoBrakeValve, "automatic-brake-valve");
    const emergencyBrake = box(standGroup, 0.11, 0.05, 0.04, -0.12, 0.2, 0.1, 0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 0.5 });
    holoTag(standGroup, "Emergency", -0.12, 0.1, 0.1, { css: "#f0645b", w: 0.24 });
    reg(hits, emergencyBrake, "emergency-brake");

    const alerterLamp = ball(standGroup, 0.018, 0.05, 0.55, -0.05, 0x59636d, { emissive: 0x59636d, ei: 0.3 });
    const alerterButton = cyl(standGroup, 0.03, 0.03, 0.03, 0.05, 0.5, -0.08, 0x2f6fd8, { rough: 0.5, seg: 10 });
    holoTag(standGroup, "Alerter", 0.05, 0.62, -0.08, { css: "#4a90e2", w: 0.24 });
    reg(hits, alerterButton, "alerter-reset");
    reg(hits, box(standGroup, 0.14, 0.1, 0.1, 0.14, 0.5, -0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "unauthorized-movement");

    const radio = group(loco, 0.9, 1.0, -0.55, -0.3);
    slab(radio, 0.36, 0.14, 0.13, 0, 0, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const radioScreen = decal(radio, 0.28, 0.08, 0, 0.02, 0.07,
      signFace("STANDBY", { bg: "#0d1c24", accent: RA_LCS_CSS, fg: "#cfe6ff", scale: 0.5 }), { glow: true, ei: 0.85, px: 220 });
    holoTag(radio, "RTC line", 0, 0.14, 0, { css: RA_LCS_CSS, w: 0.28 });
    reg(hits, radio, "radio-handset");

    const clipboard = group(loco, -0.2, 1.0, 0.5, -0.5);
    slab(clipboard, 0.2, 0.28, 0.02, 0, 0, 0, 0xd9d3c4, { rough: 0.6 });
    holoTag(clipboard, "Trip paperwork", 0, 0.2, 0, { css: RA_LCS_CSS, w: 0.3 });
    reg(hits, clipboard, "paperwork-clipboard");

    const hornButton = cyl(standGroup, 0.025, 0.025, 0.04, 0.1, 0.3, -0.08, 0xf2c14b, { rough: 0.5, seg: 10 });
    holoTag(standGroup, "Horn", 0.1, 0.4, -0.08, { css: RA_LCS_CSS, w: 0.2 });
    reg(hits, hornButton, "horn-sequence");

    // Cab findables.
    const leftToolCab = group(loco, 0.5, 1.0, 0.2, 0.4);
    box(leftToolCab, 0.14, 0.02, 0.03, 0, 0, 0, 0x53585e, { rough: 0.45, metal: 0.6 });
    reg(hits, leftToolCab, "left-tool-cab");
    const looseItem = group(loco, -0.3, 1.0, -0.3);
    box(looseItem, 0.1, 0.2, 0.06, 0, 0, 0, 0xb0453f, { rough: 0.6 });
    reg(hits, looseItem, "loose-item");

    // ------------------------------------------------------------- board, crew, log
    const trainOrderBoard = holoPanel(g, 0.62, 0.42, -3.2, 1.55, 1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_LCS_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#b7cbe6";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("TRAIN ORDER · JOB 4", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf1fb";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("DEPART SIDING — HIGHBALL", w * 0.06, h * 0.32);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = "#c1d3ec";
      ["Track speed: per the timetable", "Movement authority confirmed by radio", "Alerter interval: per the manufacturer's manual"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.5 + i * 0.12)));
    }, { ry: 0.5, accent: RA_LCS_ACCENT });
    reg(hits, trainOrderBoard, "train-order-board");

    const closeLog = group(g, -3.0, 0, 2.2, -0.3);
    slab(closeLog, 0.4, 0.05, 0.3, 0, 0.86, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const closeScreen = decal(closeLog, 0.32, 0.16, 0, 0.89, 0.0, signFace("OPEN", { bg: "#0d1c24", accent: RA_LCS_CSS, fg: "#cfe6ff", scale: 0.4 }), { glow: true, ei: 0.8, px: 220 });
    closeScreen.rotation.x = -Math.PI / 2;
    holoTag(closeLog, "Cab log", 0, 1.0, 0, { css: RA_LCS_CSS, w: 0.3 });
    reg(hits, closeLog, "closing-log");

    const conductorFig = standingFigure(g, 3.0, -1.7, { ry: 2.2, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    const carInspector = standingFigure(g, -1.9, -1.3, { ry: 1.3, cloth: 0x2b3138, vest: 0xf2894b, helmet: 0xf2f2f2 });

    // Fuel tank and trucks under the locomotive.
    cyl(loco, 0.32, 0.32, 2.2, 0, 0.18, 0.55, 0x3a3a3a, { rough: 0.6, metal: 0.4, seg: 14 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) {
      const truck = group(loco, sx * 1.1, 0, 0);
      box(truck, 0.7, 0.3, 1.1, 0, 0.25, 0, 0x22262b, { rough: 0.7, metal: 0.4 });
      for (const sz of [-1, 1]) {
        cyl(truck, 0.26, 0.26, 0.1, 0, 0.26, sz * 0.42, 0x4c4340, { rough: 0.5, metal: 0.7, seg: 14 }).rotation.x = Math.PI / 2;
      }
    }
    // Number boards and headlight.
    for (const sx of [-1, 1]) {
      decal(loco, 0.3, 0.16, sx * 0.3, 1.9, 0.7, signFace("2214", { bg: "#101820", accent: RA_LCS_CSS, fg: "#cfe6ff", scale: 0.6 }), { px: 160, glow: true, ei: 0.6 });
    }
    ball(loco, 0.09, 0, 1.36, 0.71, 0xfff2c8, { emissive: 0xfff2c8, ei: 1.8, rough: 0.3 });
    // Grab irons along the walkway.
    for (let i = 0; i < 4; i++) {
      box(loco, 0.02, 0.5, 0.02, -1.3 + i * 0.5, 0.85, 0.78, 0xd8dce0, { rough: 0.5, metal: 0.7 });
    }
    // Cab seat.
    box(standGroup, 0.32, 0.06, 0.32, 0, 0.2, -0.3, 0x22262b, { rough: 0.8, finish: "rubber" });
    box(standGroup, 0.32, 0.4, 0.06, 0, 0.4, -0.46, 0x22262b, { rough: 0.8, finish: "rubber" });
    cyl(standGroup, 0.03, 0.03, 0.4, 0, 0.2, -0.3, 0x50575e, { rough: 0.5, metal: 0.5, seg: 8 });

    const platform = box(g, 1.4, 0.1, 1.0, -3.0, 0.05, 1.3, 0xa9c1d9, { rough: 0.9 });
    platform.material = platformMat;

    cone(g, -3.4, 1.0, { color: RA_LCS_ACCENT });
    cone(g, 3.4, 1.0, { color: RA_LCS_ACCENT });

    return {
      hits,
      footprint: 2.4,

      onInterrupt(it) {
        if (it.id === "emergency-message") { autoBrakeValve.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6 }); repaint(radioScreen, signFace("TRACK\nFOULED", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.3 })); }
        if (it.id === "alerter-timeout") alerterLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "emergency-message") { autoBrakeValve.material = mat(0x59c97b, { rough: 0.5, metal: 0.5 }); repaint(radioScreen, signFace("BRAKES\nAPPLIED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 })); }
        if (it.id === "alerter-timeout") alerterLamp.material = mat(0x59636d, { emissive: 0x59636d, ei: 0.3 });
      },

      onStepComplete(step) {
        if (step.id === "reverser-handle") { reverserHook.position.set(0.1, 1.52, -0.4); loco.add(reverserHook); }
        if (step.id === "engine-start") startSwitch.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "air-gauge") repaint(resGauge.userData.screen, signFace("140 psi", { bg: "#0d1c24", accent: "#59c97b", scale: 0.6 }));
        if (step.id === "independent-brake") indBrake.material = mat(0x59c97b, { rough: 0.5, metal: 0.4 });
        if (step.id === "automatic-brake") autoBrakeValve.material = mat(0x59c97b, { rough: 0.5, metal: 0.5 });
        if (step.id === "alerter-test") alerterLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
        if (step.id === "call-authority") repaint(radioScreen, signFace("AUTHORITY\nCONFIRMED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        if (step.id === "horn-sequence") hornButton.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "cab-walk") { leftToolCab.visible = false; looseItem.visible = false; }
        if (step.id === "close-log") repaint(closeScreen, signFace("CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
      },

      animate(t, dt, session) {
        conductorFig.userData.head.rotation.y = Math.sin(t * 0.5) * 0.4;
        carInspector.userData.head.rotation.y = Math.sin(t * 0.4 + 0.9) * 0.4;
        if (session?.step?.id === "task-focus") {
          alerterLamp.material.emissiveIntensity = 0.6 + Math.max(0, Math.sin(t * 2)) * 0.6;
        }
      },
    };
  },
};
