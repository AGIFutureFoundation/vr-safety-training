import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, roadwayFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Crossing Signal Maintenance & Flagging VR — Mobility & Transit.
//
// A highway-rail grade crossing taken out of automatic protection long
// enough to test it: the dispatcher told before the signal goes quiet, the
// road itself protected by hand while the automatic warning can't be
// trusted, the island circuit proven dead before a probe goes near it, a
// test shunt used to prove the gates and lights still answer a train the way
// they are supposed to, and every bit of it restored and confirmed before
// the crossing is handed back to drivers who have no idea any of this
// happened. Generic freight territory; no railroad, milepost or crossing
// number named.

const RA_CSF_ACCENT = 0xd63b3b;
const RA_CSF_CSS = "#d63b3b";

export const SIM_RA_CROSSING_SIGNAL_MAINTENANCE_AND_FLAGGING = {
  id: "ra-crossing-signal-maintenance-and-flagging",
  index: "427",
  domain: "Track",
  trade: "Signal maintainer",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "BMWED-qualified signal maintenance, working a crossing whose automatic protection is out of service under FRA 49 CFR Part 214 roadway worker protection, with the dispatcher's own record of the outage the only thing standing between this crossing and a movement a BLET engineer or a SMART-TD conductor would otherwise expect it to warn for",
  name: "Crossing Signal Maintenance & Flagging",
  title: simTitle("Crossing Signal Maintenance & Flagging"),
  tagline: "The dispatcher told before the automatic warning goes quiet, the road protected by hand while it's out, the island circuit proven dead, the gates and lights proven against a test shunt, and every bit of it restored and confirmed before the crossing goes back to drivers who never knew it was down",
  accent: RA_CSF_ACCENT,
  accentCss: RA_CSF_CSS,
  parSeconds: 330,
  footprint: 2.4,
  supportLine: "your signal supervisor or your BMWED local if a close call with traffic at the crossing is still sitting with you after shift",
  badge: { id: "crossing-proven", name: "Crossing Proven", note: "Every gate, light and circuit tested against a real shunt, and the road never once left unprotected while the automatic warning was down" },

  game: system({
    name: "Crossing Authority",
    currency: "SIGNAL",
    ranks: ["Signal Helper", "Qualified Signal Maintainer", "Lead Maintainer", "Signal Supervisor", "Crossing Authority Certified"],
    badges: [
      { id: "never-live", name: "Never Live", note: "Never once touched a circuit before proving it dead", test: AWARD.safe },
      { id: "timing-true", name: "Timing True", note: "Every gauge reading near band centre", test: AWARD.precise(0.72) },
      { id: "restore-clean", name: "Clean Restore", note: "Shunt test and restoration steps worked with no correction", test: AWARD.all(AWARD.stepClean("activation-check"), AWARD.stepClean("restore-auto")) },
    ],
    challenges: [
      { id: "crossing-time", name: "Crossing Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-crossing", name: "First Crossing", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ten-clear", name: "Ten Clear", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "island-circuit-shock": "You put the probe on the island circuit terminal before proving it dead. A track circuit reads low compared to what killed the roadway worker on the third rail somewhere else in this network, but low is not the same as none, and per the manufacturer's manual it is tested, never assumed, before a bare hand or a bare probe goes anywhere near the terminals.",
    "gate-arm-strike": "You are standing under the gate arm's swing while it is being tested. A gate arm under motor power comes down at the same speed and the same force whether or not somebody is underneath it, and a test run is exactly when it moves without warning to anyone who has stopped expecting it to.",
    "unprotected-roadway": "You are standing in the roadway before the temporary signs are actually posted. A driver approaching a crossing with no gates down and no flags visible has no reason to expect a person standing in the lane, because as far as that driver can tell, nothing about this crossing is unusual yet.",
    "fouled-track-crossing": "You stepped onto the rails at the crossing surface without checking both directions first. A crossing surface is still a crossing while the automatic warning is down — it is down for maintenance, not because the possibility of a train has gone anywhere.",
  },

  lateNotes: {
    "left-flag": "Nothing gets logged clear until the walk is actually done.",
    "left-sign": "A sign left standing after the crossing is restored tells the next driver something that is no longer true.",
  },

  interrupts: [
    {
      id: "vehicle-runs-signal",
      kind: "A driver does not stop for the flag",
      after: "flag-traffic", delay: 4, seconds: 11,
      alert: "A pickup has slowed but not stopped, and it is rolling toward the crossing while the test shunt is still active.",
      cue: "That vehicle is not going to stop on its own.",
      target: "warning-whistle",
      why: "A hand signal only works on a driver who is actually watching for it, and a driver who has already decided to roll through needs something louder and more immediate than a raised paddle to actually register — the whistle is built for exactly the moment a hand signal alone has stopped being enough.",
      missNote: "You kept the paddle up and said nothing else. The truck kept rolling, because a raised hand means nothing to a driver who was never going to stop for it in the first place, and by the time that became obvious there was nothing left to reach for but noise, and you didn't reach for it.",
      wrongNote: "That will not get a driver's attention who has already decided to keep rolling. The whistle is built to be heard over an engine and a closed window.",
    },
    {
      id: "train-approaching-during-test",
      kind: "An actual movement approaches during the shunt test",
      after: "restore-auto", delay: 4, seconds: 12,
      alert: "The approach signal has lit up on its own, ahead of your test shunt. Something real is coming, not the shunt you placed.",
      cue: "That reading is not coming from your own test equipment.",
      target: "safety-zone",
      why: "A test shunt and an actual approaching train can both light the same approach circuit, and the only safe assumption the instant that happens is that the reading is real — everything else, including whatever equipment is still in your hands, gets left where it is while you get clear of the crossing surface and the gate's own swing.",
      missNote: "You kept working the restoration with an approach circuit lit that your own test did not explain. Whatever that circuit was telling you, it was not asking to be double-checked from where you were standing — it was asking you to already be somewhere else.",
      wrongNote: "That does not answer an approach signal you cannot explain. Get clear of the crossing first.",
    },
  ],

  steps: [
    {
      id: "briefing", kind: "select", target: "job-order-board",
      title: "Read the job order",
      cue: "Check which crossing, what the automatic protection covers, and what today's test requires.",
      why: "Taking a crossing's automatic protection out of service changes what every driver approaching it can safely assume, and the gang, the dispatcher and anyone flagging traffic all need to start from the same understanding of exactly what is about to stop working.",
    },
    {
      id: "notify-dispatcher", kind: "hold", target: "radio-handset", seconds: 5,
      title: "Notify the dispatcher the crossing is out of service",
      cue: "Call the dispatcher and hold the radio for the acknowledgement before touching anything.",
      why: "The dispatcher's own record of this crossing's automatic protection is what every approaching train crew relies on, and that record does not change until you have said so and had it read back — starting work before the acknowledgement comes back is starting work the dispatcher does not yet know is happening.",
      holdBreakNote: "You let go before the acknowledgement came back. The dispatcher's record does not change until they have said so in your own hearing.",
    },
    {
      id: "temp-protection", kind: "sequence",
      targets: ["temp-sign", "cone-position"],
      itemNames: { "temp-sign": "post the temporary warning sign", "cone-position": "set the traffic cones" },
      title: "Set up temporary road protection",
      cue: "Post the warning sign first, then set the cones behind it.",
      why: "The sign is what tells an approaching driver something has changed before they are close enough for it to matter, and cones set before the sign is up are protection nobody has actually been warned to look for yet.",
      outOfOrderNote: "Wrong order — the sign goes up first. Cones with no sign ahead of them are a surprise, not a warning.",
    },
    {
      id: "gate-access", kind: "turn", target: "gate-arm",
      title: "Raise the gate arm for access",
      cue: "Turn the manual release and raise the gate arm clear of the roadway.",
      why: "The gate has to be clear of the roadway and locked there before anyone works on the mechanism above it — a gate that can still drop on its own timer while someone is reaching into the housing is a hazard the maintenance itself just created.",
      turn: { turns: 0.5, axis: "x", label: "GATE RELEASE" },
    },
    {
      id: "circuit-gauge", kind: "gauge", target: "circuit-tester",
      title: "Prove the island circuit dead",
      cue: "Test the island circuit terminals and commit once the reading is at zero.",
      why: "The same rule as any other isolation: proven with an approved tester, never assumed from a switch position or a relay that looks de-energised. A track circuit carries enough current to injure, and a reading near zero is the only thing that makes the terminals safe to handle.",
      gauge: {
        label: "ISLAND CIRCUIT", speed: 0.66, green: [0.0, 0.12],
        readout: (t) => `${(t * 12).toFixed(1)} V`,
        missNote: "Still live. Confirm the isolation point before touching the terminals.",
      },
    },
    {
      id: "gate-lights", kind: "select", target: "gate-lights",
      title: "Inspect the gate lights and skirt",
      cue: "Check both lamps and the skirt for cracking or water intrusion.",
      why: "A gate lamp that has failed or a skirt that has let water into the housing does not show up on any circuit test run from the bungalow — it only shows up to somebody who has actually looked at the gate itself, up close, with the arm raised.",
    },
    {
      id: "cwt-gauge", kind: "gauge", target: "cwt-cabinet",
      title: "Test the constant warning time device",
      cue: "Read the device's timing against a passing test movement and commit the value.",
      why: "The whole promise of a constant warning time device is that a fast train and a slow train both get the same warning time before they reach the crossing — a device that has drifted out of its window gives drivers either too little warning on a fast movement or an unnecessarily long wait on a slow one.",
      gauge: {
        label: "WARNING TIME", speed: 0.68, green: [0.42, 0.62],
        readout: (t) => `${Math.round(20 + t * 15)} s`,
        missNote: "Outside the device's timing window. Log the defect before restoring service.",
      },
    },
    {
      id: "place-shunt", kind: "drag", target: "test-shunt",
      title: "Place the test shunt",
      cue: "Carry the shunt wire to the rails and clip it across both running rails.",
      why: "A test shunt is how this crossing gets proven against something that behaves like a train without an actual train having to be scheduled for the test — clipped across both rails, it puts exactly the same signal into the circuit that a real axle would.",
      drag: { to: "shunt-point", radius: 0.3, missNote: "Not clipped across both rails — carry it the rest of the way and clip both leads." },
    },
    {
      id: "activation-check", kind: "select", target: "activation-check",
      title: "Confirm the crossing activates",
      cue: "Watch the gates lower and the lights flash in response to the shunt.",
      why: "The shunt only proves anything if the whole chain actually answers it — lights flashing, gates lowering, timed the way the constant warning device was just tested to — and the only way to know that chain works end to end is to watch it happen, not to trust that each piece passed on its own.",
    },
    {
      id: "flag-traffic", kind: "track", target: "stop-paddle", seconds: 6,
      track: { readout: (v) => (v < 0.42 ? "below the band" : v > 0.62 ? "above the band" : "in the band") }, // the engine's default band, in words
      title: "Flag traffic while the shunt is active",
      cue: "Hold the stop paddle steady and visible in the green band while the gates are down for the test.",
      why: "A test that lowers real gates over a real road needs a real person making sure no driver treats a lowered gate as a suggestion, and holding the paddle steady and visible is what actually gets seen from a windshield well before anyone is close enough to need the whistle instead.",
      holdBreakNote: "The paddle dropped out of view during the test. A stop signal nobody can see is not protecting the road, whatever the gates themselves are doing.",
    },
    {
      id: "restore-auto", kind: "hold", target: "test-shunt", seconds: 5,
      title: "Remove the shunt and restore automatic operation",
      cue: "Remove the test shunt and hold to confirm the gates raise and the circuit returns to normal.",
      why: "The shunt comes off only once the test result is actually logged, and the restoration is watched through to the gate raising and the circuit reading normal again — walking away the instant the shunt is off is how a crossing gets left in an unconfirmed state nobody actually checked.",
      holdBreakNote: "You let go before the gate finished raising and the circuit read normal. An unconfirmed restoration is not a restoration.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["left-flag", "left-sign"],
      itemNames: { "left-flag": "flag left on the shoulder", "left-sign": "spare warning sign left leaning against the bungalow" },
      itemNotes: {
        "left-flag": "Caught before the tally closed — a flag left behind is a flag the next crew has to go looking for.",
        "left-sign": "A spare sign left standing near the crossing looks like it is still telling drivers something, even after the work is done.",
      },
      title: "Walk the crossing before you leave it",
      cue: "Scan the crossing and clear anything that didn't make it back into the truck.",
      why: "A crossing job leaves signs, cones, flags and test gear scattered across both sides of the road, and the only check that catches what did not make it back is somebody actually walking the ground before signing off.",
    },
    {
      id: "pack-signs", kind: "select", target: "temp-sign",
      title: "Remove the temporary signs",
      cue: "Take down the warning sign and cones now that automatic protection is confirmed restored.",
      why: "A temporary sign left up after the crossing is back in automatic service tells drivers something that is no longer true, which is its own kind of hazard once the actual gates and lights are doing their job again.",
    },
    {
      id: "confirm-restore", kind: "hold", target: "radio-handset", seconds: 4,
      title: "Confirm the crossing is back in service",
      cue: "Call the dispatcher and hold the radio for the read-back confirming automatic protection is restored.",
      why: "The crossing is not back in the dispatcher's own record until you have said so and had it read back — a crew relying on that record before the call is relying on a fact that, as far as the dispatcher knows, is still false.",
      holdBreakNote: "You let go before the read-back came back. The record does not change until the dispatcher has said so in your own hearing.",
    },
    {
      id: "close-log", kind: "select", target: "closing-log",
      title: "Close the maintenance log",
      cue: "Log the warning time reading, the shunt test result and the time service was restored.",
      why: "The next scheduled inspection only knows what this entry tells it — the readings taken today are the baseline the next test compares against, and a warning time drifting slowly out of tolerance is only visible across two logged readings, never one.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, RA_CSF_ACCENT);

    // ------------------------------------------------------------- textures
    const ballastTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#57534b"); grad.addColorStop(1, "#3b3831");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 700; i++) {
        const x = (i * 61.9) % w, y = (i * 91.1) % h, r = 1.4 + ((i * 13) % 5) * 0.5;
        cx.fillStyle = i % 4 === 0 ? "rgba(150,140,122,0.55)" : "rgba(30,26,20,0.45)";
        cx.beginPath(); cx.ellipse(x, y, r, r * 0.7, (i % 6) * 0.5, 0, 7); cx.fill();
      }
    }, { repeat: 5 });
    const ballastMat = texturedMat(ballastTex, { rough: 0.96, color: 0x8d8577 });

    const railTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#c7ccd1"); grad.addColorStop(0.5, "#8a9096"); grad.addColorStop(1, "#5b6167");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
    }, { repeat: 3 });
    const railMat = texturedMat(railTex, { rough: 0.32, metal: 0.75, color: 0xaab0b6 });

    const roadTex = surfaceTexture((cx, w, h) => roadwayFace(cx, w, h, { lanes: 2 }), { repeat: 2 });
    const roadMat = texturedMat(roadTex, { rough: 0.92, color: 0x9aa0a6 });

    const tieTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#3a2c20"); grad.addColorStop(0.5, "#2c2117"); grad.addColorStop(1, "#382a1e");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "rgba(0,0,0,0.35)"; cx.lineWidth = 2;
      for (let i = 0; i < 10; i++) { cx.beginPath(); cx.moveTo(0, (i / 10) * h + 4); cx.bezierCurveTo(w * 0.3, (i / 10) * h - 3, w * 0.7, (i / 10) * h + 6, w, (i / 10) * h); cx.stroke(); }
    }, { repeat: 1 });
    const tieMat = texturedMat(tieTex, { rough: 0.9, color: 0x8a7a68 });

    const platformTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#5a3230", base2: "#492926", seam: "rgba(0,0,0,0.5)",
    }), { repeat: 3 });
    const platformMat = texturedMat(platformTex, { rough: 0.9, color: 0xd9a89e });

    // ------------------------------------------------------------- crossing
    // Track running north-south, roadway crossing east-west.
    const ballast = box(g, 1.6, 0.16, 6.0, 0, 0.08, 0, 0x8d8577, { rough: 0.98 });
    ballast.material = ballastMat;
    for (const sx of [-1, 1]) {
      const rail = box(g, 1.6, 0.1, 0.06, 0, 0.21, 0, 0xaab0b6, { rough: 0.32, metal: 0.75 });
      rail.rotation.y = Math.PI / 2;
      rail.position.x = sx * 0.36;
      rail.material = railMat;
    }
    const roadway = box(g, 5.6, 0.12, 1.9, 0, 0.06, 0, 0x9aa0a6, { rough: 0.92 });
    roadway.material = roadMat;
    reg(hits, box(g, 1.9, 1.6, 1.9, 0, 0.8, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "fouled-track-crossing");
    reg(hits, box(g, 5.6, 1.6, 1.0, 0, 0.8, 2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "unprotected-roadway");

    // ------------------------------------------------------------- gate & mast
    const gateBase = group(g, -2.2, 0, 1.1, -0.3);
    box(gateBase, 0.3, 1.6, 0.3, 0, 0.8, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    const gateArm = group(gateBase, 0, 1.5, 0);
    box(gateArm, 2.4, 0.1, 0.06, 1.2, 0, 0, RA_CSF_ACCENT, { rough: 0.6, finish: "painted" });
    for (let i = 0; i < 4; i++) box(gateArm, 0.2, 0.11, 0.062, 0.5 + i * 0.5, 0, 0, 0xf2f2f2, { rough: 0.6 });
    reg(hits, gateArm, "gate-arm");
    reg(hits, box(gateArm, 0.4, 0.6, 0.4, 1.2, -0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "gate-arm-strike");
    const gateLampL = ball(gateBase, 0.045, -0.14, 1.58, 0.16, 0xf0645b, { emissive: 0xf0645b, ei: 1.6 });
    const gateLampR = ball(gateBase, 0.045, 0.14, 1.58, 0.16, 0xf0645b, { emissive: 0xf0645b, ei: 1.6 });
    const gateSkirt = box(gateBase, 0.5, 0.3, 0.02, 0, 1.55, 0.2, 0xf2f2f2, { rough: 0.7 });
    holoTag(gateBase, "Gate lights", 0, 1.85, 0, { css: RA_CSF_CSS, w: 0.28 });
    reg(hits, gateSkirt, "gate-lights");

    // Signal bungalow with the CWT cabinet.
    const bungalow = group(g, -2.6, 0, -1.6, -0.4);
    box(bungalow, 1.0, 1.2, 0.9, 0, 0.6, 0, 0x6b5a52, { rough: 0.8, metal: 0.1 });
    box(bungalow, 1.06, 0.14, 0.96, 0, 1.27, 0, 0x3a3a3a, { rough: 0.6 });
    const cwtDoor = box(bungalow, 0.4, 0.8, 0.04, -0.2, 0.55, 0.47, 0x3a4048, { rough: 0.65, metal: 0.3 });
    const cwtScreen = decal(cwtDoor, 0.3, 0.16, 0, 0.1, 0.03, signFace("-- s", { bg: "#0d1c24", accent: RA_CSF_CSS, scale: 0.5 }), { glow: true, ei: 0.7, px: 200 });
    holoTag(bungalow, "CWT cabinet", -0.2, 1.05, 0.47, { css: RA_CSF_CSS, w: 0.3 });
    reg(hits, cwtDoor, "cwt-cabinet");

    const circuitTerminal = group(bungalow, 0.25, 0.55, 0.47, 0.2);
    box(circuitTerminal, 0.16, 0.2, 0.03, 0, 0, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 4; i++) cyl(circuitTerminal, 0.012, 0.012, 0.03, -0.05 + (i % 2) * 0.1, 0.06 - Math.floor(i / 2) * 0.12, 0.02, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(circuitTerminal, "Island circuit", 0, 0.15, 0, { css: RA_CSF_CSS, w: 0.28 });
    reg(hits, circuitTerminal, "circuit-tester");
    reg(hits, box(circuitTerminal, 0.3, 0.3, 0.3, 0, 0, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "island-circuit-shock");

    // Test shunt, coiled on the ballast until placed.
    const shuntCoil = group(g, -1.7, 0, -1.0, 0.3);
    torus(shuntCoil, 0.1, 0.012, 0, 0.1, 0, 0x2f2f2f, { rough: 0.7, seg: 6, seg2: 16 });
    holoTag(shuntCoil, "Test shunt", 0, 0.22, 0, { css: RA_CSF_CSS, w: 0.26 });
    reg(hits, shuntCoil, "test-shunt");
    hits["shunt-point"] = box(g, 1.6, 0.2, 0.3, 0, 0.1, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    const activationLamp = ball(g, 0.05, 0.5, 0.4, -1.0, 0x59636d, { emissive: 0x59636d, ei: 0.3 });
    reg(hits, activationLamp, "activation-check");

    // The vehicle that does not stop, hidden until the interrupt drives it in.
    const runawayVehicle = group(g, 4.4, 0, 2.1, 3.14);
    box(runawayVehicle, 0.5, 0.3, 1.1, 0, 0.3, 0, 0x2f6fd8, { rough: 0.6, metal: 0.3 });
    box(runawayVehicle, 0.42, 0.24, 0.5, 0, 0.5, -0.15, 0x1f3a6b, { rough: 0.6, metal: 0.3 });
    runawayVehicle.visible = false;

    // ------------------------------------------------------------- signs, cones
    const signCart = group(g, -2.9, 0, 0.4, 0.4);
    box(signCart, 0.3, 0.4, 0.2, 0, 0.2, 0, 0x3a4048, { rough: 0.7, metal: 0.3 });
    const tempSign = group(signCart, 0, 0.55, 0);
    cyl(tempSign, 0.02, 0.02, 0.5, 0, 0, 0, 0x50575e, { rough: 0.6, metal: 0.4, seg: 8 });
    const signFace1 = decal(tempSign, 0.3, 0.3, 0, 0.4, 0.01, signFace("CROSSING\nCLOSED", { bg: "#ffd100", fg: "#1b1e22", scale: 0.3 }), { px: 220 });
    holoTag(signCart, "Warning sign", 0, 0.85, 0, { css: RA_CSF_CSS, w: 0.3 });
    reg(hits, tempSign, "temp-sign");

    function trafficCone(x, z) {
      const c = group(g, x, 0, z);
      cyl(c, 0.005, 0.14, 0.4, 0, 0.2, 0, 0xf2894b, { rough: 0.6, seg: 12 });
      box(c, 0.28, 0.02, 0.28, 0, 0.02, 0, 0x2b2b2b, { rough: 0.7 });
      return c;
    }
    const coneA = trafficCone(2.6, 0.9);
    const coneB = trafficCone(2.6, -0.9);
    reg(hits, coneA, "cone-position");

    // ------------------------------------------------------------- flagger, whistle, safety zone
    const flagger = standingFigure(g, 2.9, 0.1, { ry: -1.57, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    const paddle = group(flagger, 0.3, 1.2, 0.1, -0.4);
    box(paddle, 0.24, 0.24, 0.02, 0, 0, 0, 0xd63b3b, { rough: 0.6 });
    holoTag(flagger, "Stop paddle", 0.3, 1.45, 0.1, { css: RA_CSF_CSS, w: 0.28 });
    reg(hits, paddle, "stop-paddle");
    const whistle = ball(flagger, 0.025, 0.1, 1.55, 0.2, 0xf2f2f2, { rough: 0.5 });
    reg(hits, whistle, "warning-whistle");

    const safetyZone = group(g, -3.3, 0, 2.0);
    for (let i = 0; i < 3; i++) box(safetyZone, 0.22, 0.006, 0.06, 0, 0.01, -0.25 + i * 0.25, RA_CSF_ACCENT, { emissive: RA_CSF_ACCENT, ei: 0.3, cast: false });
    holoTag(safetyZone, "Safety zone", 0, 0.3, 0, { css: RA_CSF_CSS, w: 0.28 });
    reg(hits, safetyZone, "safety-zone");

    // Left tools.
    const leftFlag = group(g, 2.2, 0.13, 2.0, 0.4);
    cyl(leftFlag, 0.01, 0.012, 0.4, 0, 0.2, 0, 0x8b929a, { rough: 0.6, seg: 6 });
    box(leftFlag, 0.16, 0.1, 0.005, 0.08, 0.35, 0, 0xf0645b, { rough: 0.7 });
    reg(hits, leftFlag, "left-flag");
    const leftSign = group(bungalow, 0.4, 0, -0.4, 0.3);
    box(leftSign, 0.2, 0.24, 0.01, 0, 0.4, 0, 0xffd100, { rough: 0.7 });
    reg(hits, leftSign, "left-sign");

    // Radio and closing log.
    const radio = group(g, -2.9, 0, 1.4, -0.3);
    slab(radio, 0.5, 0.16, 0.16, 0, 0.85, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const radioScreen = decal(radio, 0.4, 0.1, 0, 0.87, 0.09,
      signFace("STANDBY", { bg: "#0d1c24", accent: RA_CSF_CSS, fg: "#ffd6d0", scale: 0.5 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(radio, "Dispatcher line", 0, 1.05, 0.08, { css: RA_CSF_CSS, w: 0.32 });
    reg(hits, radio, "radio-handset");

    const closeLog = group(g, -2.9, 0, -0.6, -0.3);
    slab(closeLog, 0.4, 0.05, 0.3, 0, 0.86, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const closeScreen = decal(closeLog, 0.32, 0.16, 0, 0.89, 0.0, signFace("OPEN", { bg: "#0d1c24", accent: RA_CSF_CSS, fg: "#ffd6d0", scale: 0.4 }), { glow: true, ei: 0.8, px: 220 });
    closeScreen.rotation.x = -Math.PI / 2;
    holoTag(closeLog, "Maintenance log", 0, 1.0, 0, { css: RA_CSF_CSS, w: 0.32 });
    reg(hits, closeLog, "closing-log");

    const jobBoard = holoPanel(g, 0.6, 0.42, -3.2, 1.55, -0.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_CSF_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6b0ac";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("JOB ORDER · CROSSING 4", w * 0.06, h * 0.14);
      cx.fillStyle = "#faeceb";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("QUARTERLY TEST & SHUNT", w * 0.06, h * 0.32);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = "#e0b6b2";
      ["Notify dispatcher before signal goes quiet", "Warning time tolerance: per the standard", "Flag traffic the whole time gates are down"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.5 + i * 0.12)));
    }, { ry: 0.5, accent: RA_CSF_ACCENT });
    reg(hits, jobBoard, "job-order-board");

    const platform = box(g, 1.2, 0.1, 1.0, -3.3, 0.05, 0.6, 0xd9a89e, { rough: 0.9 });
    platform.material = platformMat;

    cone(g, -3.5, 1.0, { color: RA_CSF_ACCENT });
    cone(g, 3.5, 1.0, { color: RA_CSF_ACCENT });

    // A second gate mast on the far approach, mirroring the near one — real
    // crossings protect both directions of the road.
    const gateBase2 = group(g, 2.2, 0, -1.1, 2.84);
    box(gateBase2, 0.3, 1.6, 0.3, 0, 0.8, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    const gateArm2 = group(gateBase2, 0, 1.5, 0);
    box(gateArm2, 2.4, 0.1, 0.06, 1.2, 0, 0, RA_CSF_ACCENT, { rough: 0.6, finish: "painted" });
    for (let i = 0; i < 4; i++) box(gateArm2, 0.2, 0.11, 0.062, 0.5 + i * 0.5, 0, 0, 0xf2f2f2, { rough: 0.6 });
    const gateLamp2L = ball(gateBase2, 0.045, -0.14, 1.58, 0.16, 0xf0645b, { emissive: 0xf0645b, ei: 1.6 });
    const gateLamp2R = ball(gateBase2, 0.045, 0.14, 1.58, 0.16, 0xf0645b, { emissive: 0xf0645b, ei: 1.6 });

    // Extra ballast ties either side of the crossing surface.
    for (let i = -6; i <= 6; i++) {
      if (Math.abs(i) < 2) continue;
      box(g, 0.16, 0.06, 1.6, 0, 0.11, i * 0.28, 0x8a7a68, { rough: 0.9 });
    }

    // A crossbuck sign on each approach.
    function crossbuck(x, z, ry) {
      const cb = group(g, x, 0, z, ry);
      cyl(cb, 0.025, 0.03, 2.0, 0, 1.0, 0, 0x50575e, { rough: 0.6, metal: 0.4, seg: 8 });
      box(cb, 0.9, 0.14, 0.02, 0, 1.7, 0, 0xf2f2f2, { rough: 0.7 });
      box(cb, 0.9, 0.14, 0.02, 0, 1.7, 0.01, 0xf2f2f2, { rough: 0.7 }).rotation.z = Math.PI / 2;
      return cb;
    }
    crossbuck(0, 2.6, 0);
    crossbuck(0, -2.6, Math.PI);

    // Cable conduit run from the bungalow to the gate mast, and a relay
    // cabinet beside it — more of the plant this crew is actually testing.
    for (let i = 0; i < 4; i++) {
      cyl(g, 0.02, 0.02, 0.35, -2.6 + i * 0.35, 0.05, -1.5, 0x3a4048, { rough: 0.6, metal: 0.4, seg: 8 }).rotation.z = Math.PI / 2;
    }
    const relayCab = group(g, -1.4, 0, -2.1, -0.3);
    box(relayCab, 0.34, 0.5, 0.28, 0, 0.25, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    box(relayCab, 0.3, 0.44, 0.02, 0, 0.25, 0.14, 0x3a4048, { rough: 0.65, metal: 0.3 });
    for (let i = 0; i < 3; i++) cyl(relayCab, 0.014, 0.014, 0.05, 0, 0.4 - i * 0.14, 0.16, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 8 });

    // A second maintainer at the truck, and a parked service pickup.
    const secondMaintainer = standingFigure(g, -3.6, -1.7, { ry: 1.2, cloth: 0x2b3138, vest: 0xf2894b, helmet: 0xf2f2f2 });
    const truck = group(g, -3.9, 0, -2.4, 0.4);
    box(truck, 0.6, 0.3, 1.2, 0, 0.3, 0, 0xb0453f, { rough: 0.6, metal: 0.3 });
    box(truck, 0.5, 0.3, 0.5, 0, 0.5, -0.3, 0x8b2f28, { rough: 0.6, metal: 0.3 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(truck, 0.14, 0.14, 0.1, sx * 0.32, 0.14, sz * 0.4, 0x22262b, { rough: 0.7, seg: 12 }).rotation.x = Math.PI / 2;
    }

    return {
      hits,
      footprint: 2.4,

      onInterrupt(it) {
        if (it.id === "vehicle-runs-signal") {
          runawayVehicle.visible = true;
          repaint(radioScreen, signFace("VEHICLE\nAT GATE", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.3 }));
        }
        if (it.id === "train-approaching-during-test") {
          activationLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vehicle-runs-signal") {
          runawayVehicle.visible = false;
          repaint(radioScreen, signFace("VEHICLE\nSTOPPED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
        if (it.id === "train-approaching-during-test") {
          activationLamp.material = mat(0x59636d, { emissive: 0x59636d, ei: 0.3 });
        }
      },

      onStepComplete(step) {
        if (step.id === "notify-dispatcher") repaint(radioScreen, signFace("CROSSING\nOUT", { bg: "#0d1c14", accent: RA_CSF_CSS, fg: "#ffd6d0", scale: 0.3 }));
        if (step.id === "temp-protection") { /* sign and cone already visible */ }
        if (step.id === "gate-access") gateArm.rotation.z = -1.1;
        if (step.id === "circuit-gauge") circuitTerminal.children.forEach((c) => { c.material = mat(0x59c97b, { rough: 0.5 }); });
        if (step.id === "gate-lights") { gateLampL.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); gateLampR.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
        if (step.id === "cwt-gauge") repaint(cwtScreen, signFace("28 s", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 }));
        if (step.id === "place-shunt") activationLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.4 });
        if (step.id === "activation-check") { activationLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0 }); gateArm.rotation.z = 0; }
        if (step.id === "restore-auto") { gateArm.rotation.z = -1.1; activationLamp.material = mat(0x59636d, { emissive: 0x59636d, ei: 0.3 }); }
        if (step.id === "walk") { leftFlag.visible = false; leftSign.visible = false; }
        if (step.id === "pack-signs") { tempSign.visible = false; coneA.visible = false; coneB.visible = false; }
        if (step.id === "confirm-restore") repaint(radioScreen, signFace("CROSSING\nRESTORED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        if (step.id === "close-log") repaint(closeScreen, signFace("CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
      },

      animate(t, dt, session) {
        flagger.userData.head.rotation.y = Math.sin(t * 0.6) * 0.5;
        secondMaintainer.userData.head.rotation.y = Math.sin(t * 0.45 + 1.1) * 0.4;
        gateLampL.material.emissiveIntensity = 1.2 + Math.max(0, Math.sin(t * 3)) * 1.2;
        gateLampR.material.emissiveIntensity = 1.2 + Math.max(0, Math.sin(t * 3 + Math.PI)) * 1.2;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "circuit-gauge") { /* readout on panel handled by gauge label */ }
          if (session.step?.id === "cwt-gauge") {
            repaint(cwtScreen, signFace(`${Math.round(20 + gg.t * 15)} s`, {
              bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.62 ? "#59c97b" : "#f2c14b", scale: 0.5,
            }));
          }
        }
      },
    };
  },
};
