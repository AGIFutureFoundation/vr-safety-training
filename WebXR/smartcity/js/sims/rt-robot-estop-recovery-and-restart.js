import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  pavingFace, blockFace, deckPlateFace, lockTag, reg,
} from "../citykit.js";
import { robotCell } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bringing a Robot Back After an E-stop — its own gamified system: Reason First.
//
// ROBOTRAIN (docs/consoles/ROBOTRAIN.md): the third ROBOPROG gap station. A robot operator finds a fenced cell stopped on its
// emergency stop and brings it back the slow way: nobody resets anything until the reason for the stop is known, everyone who
// was near the cell is accounted for, the obstruction is cleared under lockout, the stop is reset from outside, and the first
// cycle runs at reduced speed with a hand on the stop. The lockout follows OSHA 29 CFR 1910.147 by name; ISO 10218 and ANSI R15.06
// are named for the restart from outside the safeguarded space. No clause text is quoted. ?fault=sensor-fault puts the cause
// on the light-curtain receiver rather than a dropped part, so the find reads the scene.

const RTER_ACCENT = 0xe0634a;

export const SIM_RT_ROBOT_ESTOP_RECOVERY_AND_RESTART = {
  id: "rt-robot-estop-recovery-and-restart",
  index: "rt-3",
  domain: "Robotics",
  trade: "Robot operator, recovering a fenced cell after an emergency stop — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-factory",
  weather: "clear",
  certification: "UAW and IAM skilled-trades training as bodies; ANSI R15.06 and ISO 10218 for industrial robot systems, including restart from outside the safeguarded space; OSHA 29 CFR 1910.147 the control of hazardous energy for the entry to clear the cell, 29 CFR 1910.212 general requirements for machines and 29 CFR 1910.132 personal protective equipment; the cell's written risk assessment, its restart procedure and the manufacturer's manual",
  name: "Bringing a Robot Back After an E-stop",
  title: simTitle("Bringing a Robot Back After an E-stop"),
  tagline: "Recovering a stopped robot cell without making it a second incident: the reason found before anything is reset, every person near the cell accounted for, the obstruction cleared under your own lock, the e-stop and the safety circuit reset from outside, the first cycle at reduced speed with a hand on the stop, and the event written down",
  accent: RTER_ACCENT,
  accentCss: "#e0634a",
  parSeconds: 350,
  footprint: 2.9,
  badge: { id: "reason-first", name: "Reason First", note: "Found why the cell stopped and who was near it before touching a reset" },

  game: system({
    name: "Reason First",
    currency: "RP",
    ranks: ["Bystander", "Reporter", "Recoverer", "Restart Lead", "Reason First"],
    badges: [
      { id: "no-blind-reset", name: "No Blind Reset", note: "Read the stop log before any reset", test: AWARD.stepClean("read-log") },
      { id: "headcount", name: "Headcount", note: "Accounted for everyone before entering", test: AWARD.stepClean("account-people") },
      { id: "slow-first", name: "Slow First Cycle", note: "Ran the first cycle at reduced speed with a hand on the stop", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-recover", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-recover", name: "Clean Recovery", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UAW or IAM local's safety representative, or the employee assistance line, if an e-stop you had to press is still on your mind",

  faults: [{ id: "sensor-fault", label: "Stop cause: CHECK", step: "find-cause", target: "curtain-receiver", note: "Today the stop log points at the light curtain itself, not at anything in the beam. Find the cause on the safeguard.", from: "dropped-part", cue: "Find what caused the stop." }],

  hazards: {
    "blind-reset-hazard": "That resets the e-stop and presses start because the line is waiting. A stop that nobody understands is a stop that will happen again, or worse, one that will not: an e-stop pressed because someone was inside is cleared without knowing where they are now.",
    "reach-through-hazard": "That reaches through the light curtain to flick the dropped part out of the beam. The curtain stopped the arm once; a hand through it while the stop is being reset is a hand inside the cell at the moment power comes back.",
    "bypass-curtain-hazard": "That holds a key in the muting switch so the curtain stops tripping while the cell is cleared. Muting a safeguard to get past it is working without the safeguard, and the person who muted it is the one standing in the beam.",
    "reset-inside-hazard": "That resets the stop from the pendant while still inside the fence to save a walk. Reset and restart happen from outside the safeguarded space because the first thing a restarted cell does is move, and the person resetting it must not be where it moves.",
  },

  lateNotes: {
    "stop-log": "The controller's stop log is read first, before any reset: which stop fired, from which device, at what step of the programme.",
    "operator-lock": "The clearing entry is made under your own lock on the disconnect, with the key in your pocket, not under the e-stop alone.",
  },

  interrupts: [
    { id: "helper-reset", kind: "Reset attempted", after: "clear-hold", delay: 3, seconds: 11, alert: "A coworker outside is reaching for the e-stop reset to get the line going while you are still inside the cell.", cue: "Press the pendant e-stop you carry.", target: "pendant-estop", why: "Your lock keeps the disconnect open, so the arm cannot power up, but a reset attempt with a person inside is a failure of the restart procedure in progress; the stop in your hand holds the cell in a known state and ends the attempt without anyone shouting over a fence.", missNote: "You kept working inside while someone reached for the reset. A reset attempted with you inside is answered with the pendant e-stop you carry.", wrongNote: "Not that — a reset attempt while you are inside is answered with the pendant e-stop." },
    { id: "wrong-path", kind: "Unexpected motion", after: "first-cycle-track", delay: 3, seconds: 11, alert: "On the first cycle the arm has swung toward the gate instead of toward the fixture.", cue: "Press the outside e-stop.", target: "outside-estop", why: "A restarted programme can resume from the wrong step or with a lost position, and the first cycle is watched at reduced speed with a hand on the stop for exactly this; the arm heading somewhere it was never taught is answered by stopping it, then finding out why from the controller, not by watching to see where it goes.", missNote: "The arm kept swinging toward the gate. An unexpected path on the first cycle is answered with the e-stop under your hand.", wrongNote: "Not that — unexpected motion on restart is answered at the outside e-stop." },
  ],

  steps: [
    { id: "read-log", kind: "select", target: "stop-log", title: "Read the stop log before touching anything", cue: "Read the controller's stop log: which stop fired, from where, at which step of the programme.", why: "The controller knows which device opened the safety circuit and when, and that is the difference between a dropped part in a light curtain, a pressed button with a person behind it and a fault in the safeguard itself; each of those is recovered differently, and resetting before reading treats them all as the same inconvenience." },
    { id: "ppe-recover", kind: "sequence", anyOrder: true, targets: ["glasses-recover", "gloves-recover", "boots-recover"], itemNames: { "glasses-recover": "safety glasses", "gloves-recover": "cut-resistant gloves", "boots-recover": "safety boots" }, title: "Dress to enter the cell", cue: "Safety glasses, cut-resistant gloves, safety boots.", why: "Clearing a stopped cell means handling the part the arm dropped, which may have sharp edges where the gripper let go of it, and walking a floor with cable tracks and a fixture base; the gloves are for the part, the boots for the floor, the glasses for whatever springs when the part is freed." },
    { id: "account-people", kind: "sequence", anyOrder: false, targets: ["call-out", "headcount-board", "pendant-holder"], itemNames: { "call-out": "call out to the cell", "headcount-board": "check the names on the headcount board", "pendant-holder": "find who holds the pendant" }, outOfOrderNote: "Out of order — call out first, then the board, then find who holds the pendant.", title: "Account for everyone who was near the cell", cue: "Call out, check the headcount board against who is here, and find out who holds the pendant.", why: "An e-stop is pressed by a person for a reason, and the first question is whether a person is inside or hurt: a call into the cell, the names on the board against the people standing here, and the pendant, because whoever holds it either pressed the stop or was inside when someone else did." },
    { id: "find-cause", kind: "find", noHint: true, targets: ["dropped-part"], target: "dropped-part", itemNames: { "dropped-part": "a part dropped into the light curtain's beam" }, itemNotes: { "dropped-part": "A part in the beam opened the curtain and stopped the arm; it is cleared from inside under lockout, never through the beam." }, decoyNotes: { "curtain-receiver": "The light-curtain receiver's indicator shows the curtain is healthy and simply interrupted. Nothing to repair there today.", "coolant-drip": "A coolant drip under the fixture is a housekeeping job for after the restart, not the cause of the stop." }, title: "Find what caused the stop", cue: "Find what caused the stop.", why: "The log says the light curtain opened, and the floor says why: a part the gripper dropped is lying in the beam. Seeing the cause with your own eyes is what separates a stop you understand from a stop you are guessing about, and it decides whether the recovery is a clearing entry or a maintenance call." },
    { id: "lockout", kind: "select", target: "disconnect-lock", title: "Lock out the cell to enter", cue: "Open the robot disconnect and hang your own lock and tag on it.", why: "An e-stop removes power from the drives but leaves the controller live and anyone outside able to reset it, and a clearing entry is an entry into the arm's reach; the disconnect under your own lock is what makes the cell yours while you are inside, whatever anyone outside presses." },
    { id: "verify-zero", kind: "gauge", target: "verify-meter", title: "Verify zero energy", cue: "Try to jog the arm from the pendant and confirm the drives show no power before entering.", why: "A lock on a disconnect proves you turned a handle, not that the drives are dead; trying to move the arm and reading the drive status is the test that catches a wrong disconnect, a second feed or a controller still holding a charged axis, and it happens before the gate opens.", gauge: { label: "DRIVES", speed: 0.6, green: [0.0, 0.18], readout: (t) => (t < 0.18 ? "no power" : "live"), missNote: "The drives still show power. Do not enter — find the energy source you missed." } },
    { id: "escape-mark", kind: "drag", target: "wedge-marker", drag: { to: "gate-stop", radius: 0.4, missNote: "Not placed — the gate hold goes at the gate so it cannot swing shut behind you." }, title: "Hold the gate open behind you", cue: "Set the gate hold so the gate stays open while you are inside.", why: "A gate that swings shut behind you closes the interlock, which is the controller's one signal that nobody is inside; the hold keeps the gate open and the route out clear, and it is placed before you step through rather than wished for from inside." },
    { id: "clear-hold", kind: "hold", target: "dropped-part", seconds: 5, title: "Clear the part from the beam", cue: "Lift the dropped part out of the curtain's beam and carry it out of the cell.", why: "The part is picked up from inside, with the arm dead and your lock on the disconnect, and carried out so nothing is left in the beam or on the floor for the next cycle; it is done steadily because a second drop under the fixture is a second entry.", holdBreakNote: "The part slipped before it was clear of the beam. Set it down safely and lift again." },
    { id: "exit-unlock", kind: "sequence", anyOrder: false, targets: ["step-outside", "remove-hold", "remove-lock"], itemNames: { "step-outside": "step outside and close the gate", "remove-hold": "take the gate hold away", "remove-lock": "remove your lock from the disconnect" }, outOfOrderNote: "Out of order — step out and close the gate, remove the hold, then and only then remove your lock.", title: "Leave the cell and remove your lock last", cue: "Step outside, close the gate, remove the hold, then take your lock off the disconnect.", why: "The lock comes off last because it is the one thing that keeps power away from the arm while a person could still be inside; the order puts the body outside and the gate closed before the energy is given back, every time, so there is never a moment with power available and the gate open." },
    { id: "reset-circuit", kind: "turn", target: "estop-reset", title: "Reset the e-stop and the safety circuit from outside", cue: "Twist the e-stop to release it, then press the safety-circuit reset on the panel outside.", why: "Releasing the mushroom button does nothing by itself; the safety circuit has to be reset from the panel, and both happen outside the fence with the gate closed, because the arm can move the moment the circuit is made and the person making it must not be where it moves.", turn: { turns: 1, label: "RELEASE", readout: (n) => (n >= 1 ? "released · reset" : "still latched") } },
    { id: "reduced-restart", kind: "gauge", target: "speed-dial", title: "Select reduced speed for the first cycle", cue: "Set the override to reduced speed and commit when the pendant reads it back.", why: "A programme resuming after a stop may be at the wrong step or have lost its position, and the first cycle is where that shows; at reduced speed a wrong move can be stopped before it reaches anything, and the readback confirms the controller took the setting rather than the dial sitting on a number.", gauge: { label: "SPEED", speed: 0.6, green: [0.3, 0.48], readout: (t) => (t > 0.3 && t < 0.48 ? "reduced" : "check override"), missNote: "The pendant does not read reduced speed. The first cycle waits until it does." } },
    { id: "first-cycle-track", kind: "track", target: "cycle-meter", seconds: 8, title: "Watch the first cycle with a hand on the stop", cue: "Start the cycle and keep your hand on the outside e-stop, watching the arm's path match the programme.", why: "The first cycle after a stop is a test, not production: the operator stands at the stop and watches the arm go where the programme says, ready to end it the instant it does not; a cycle that completes under this watch is the proof that the cell is back, and a cycle that does not is caught before it costs more than a part.", track: { start: 0.5, green: [0.36, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "PATH", readout: (v) => (v < 0.36 ? "lagging" : v > 0.62 ? "off path" : "on path") }, holdBreakNote: "The arm left its programmed path. Stop, re-read the programme step and run the cycle again." },
    { id: "log-event", kind: "select", target: "event-log", title: "Write the event down", cue: "Record the stop: the cause, who was near, what was cleared and how the restart went.", why: "A dropped part in a beam once is a part; three times is a gripper, a fixture or a programme problem, and the only way anyone sees the pattern is a written record of each stop with its cause and its recovery, read by the people who can change the cell rather than remembered by the one who cleared it." },
  ],

  build(root) {
    const ACC = RTER_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floor = box(g, 9.4, 0.12, 9.4, 0, 0.06, 0, 0xffffff, { rough: 0.7 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#5f676e", line: "#454c52" }), { repeat: 5, px: 512 }), { rough: 0.7, metal: 0.05, color: 0xffffff });
    const wall = box(g, 9.4, 4.4, 0.2, 0, 2.2, -7.3, 0xffffff, { rough: 0.75 });
    wall.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 6, cols: 9, block: 0x7c858c }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const plate = box(g, 2.0, 0.03, 1.0, 3.4, 0.13, 3.2, 0xffffff, { rough: 0.6, cast: false });
    plate.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.6, metal: 0.5, color: 0xffffff });
    holoTag(g, "stopped cell — procedural, generic industrial arm", -3.4, 3.9, -7.15, { css: "#e0634a", w: 0.66 });
    const cell = robotCell(g, 0, 0, -4.3, { colour: 0xd8a63a });
    const P = cell.userData.parts ?? {};
    // the control panel outside: stop log screen, reset, stack light held red
    box(g, 0.7, 1.7, 0.5, 3.0, 0.85, -4.6, 0x9aa2a8, { rough: 0.5, metal: 0.4 });
    const stack = []; for (let i = 0; i < 3; i++) stack.push(cyl(g, 0.05, 0.05, 0.08, 3.0, 1.82 + i * 0.09, -4.6, [0x3fc26a, 0xffab2e, 0xd8322c][i], { emissive: [0x000000, 0x000000, 0xd8322c][i], ei: 1.0, seg: 12 }));
    const pendant = box(g, 0.22, 0.3, 0.06, 2.1, 1.25, -2.0, 0x2b2f34, { rough: 0.5 });
    box(g, 0.16, 0.12, 0.012, 2.1, 1.3, -1.965, 0x1d2329, { rough: 0.3, emissive: 0x301010, ei: 0.4 });
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#e0634a", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("stop-log", "controller stop log", -1.68, 1.47, "box", 0x3a78c9);
    put("glasses-recover", "safety glasses", -2.09, 0.9, "box", 0x2b2f34);
    put("gloves-recover", "cut-resistant gloves", -2.25, 0.24, "ball", 0x8a6a3a);
    put("boots-recover", "safety boots", -2.13, -0.42, "cyl", 0x3a3a3a);
    put("call-out", "call out", -1.74, -1.01, "ball", 0xf0b323);
    put("headcount-board", "headcount board", -1.14, -1.45, "box", 0xeaeaea);
    put("pendant-holder", "who holds the pendant", -0.4, -1.68, "cyl", 0x59637a);
    put("disconnect-lock", "disconnect + your lock", 0.4, -1.68, "box", 0xd2312b);
    put("verify-meter", "drive status", 1.14, -1.45, "meter");
    put("step-outside", "step outside, close gate", 1.74, -1.01, "cyl", 0x59c97b);
    put("remove-hold", "remove the gate hold", 2.13, -0.42, "ball", 0xf0b323);
    put("remove-lock", "remove your lock", 2.25, 0.24, "box", 0xd2312b);
    put("speed-dial", "speed override", 2.09, 0.9, "meter");
    put("cycle-meter", "cycle path", 1.68, 1.47, "meter");
    put("event-log", "event log", 2.9, 1.9, "box", 0x2f6fb0);
    put("outside-estop", "outside e-stop", -2.9, 1.9, "cyl", 0xd2312b);
    put("pendant-estop", "pendant e-stop (carried)", -3.3, 1.2, "cyl", 0xd2312b);
    // the e-stop reset (turn): a mushroom button on the panel post
    post(3.3, 1.2, 0.95);
    cap["estop-reset"] = group(g, 3.3, 1.02, 1.2);
    cyl(cap["estop-reset"], 0.06, 0.06, 0.05, 0, 0, 0, 0xf0b323, { rough: 0.5, seg: 14 }); cyl(cap["estop-reset"], 0.045, 0.05, 0.05, 0, 0.05, 0, 0xd2312b, { rough: 0.4, seg: 14 }); box(cap["estop-reset"], 0.012, 0.012, 0.08, 0, 0.08, 0, 0xeaeaea, { rough: 0.4 });
    holoTag(g, "e-stop release + circuit reset", 3.3, 1.3, 1.2, { css: "#e0634a", w: 0.5 }); reg(hits, cap["estop-reset"], "estop-reset");
    // the gate hold (drag) and its spot at the gate
    cap["wedge-marker"] = box(g, 0.14, 0.08, 0.2, -0.9, 0.97, -2.3, 0xf0b323, { rough: 0.6 });
    reg(hits, cap["wedge-marker"], "wedge-marker");
    cap["gate-stop"] = group(g, 1.75, 0.05, -2.3);
    box(cap["gate-stop"], 0.3, 0.01, 0.3, 0, 0, 0, 0x2b2f34, { rough: 0.6, cast: false }); box(cap["gate-stop"], 0.22, 0.012, 0.22, 0, 0.004, 0, ACC, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "gate hold goes here", 1.75, 1.4, -2.3, { css: "#e0634a", w: 0.36 }); reg(hits, cap["gate-stop"], "gate-stop");
    // the find targets: the dropped part in the beam, the curtain receiver, a coolant drip
    const part = box(g, 0.16, 0.1, 0.12, -0.6, 0.17, -2.4, 0xd8a63a, { rough: 0.5 });
    part.rotation.y = 0.5; cap["dropped-part"] = part; reg(hits, part, "dropped-part");
    cap["curtain-receiver"] = box(g, 0.07, 0.16, 0.07, 0.2, 1.7, -2.35, 0xf0b323, { rough: 0.5 }); reg(hits, cap["curtain-receiver"], "curtain-receiver");
    const recvLamp = ball(g, 0.025, 0.2, 1.8, -2.3, 0x59c97b, { emissive: 0x59c97b, ei: 0.9, seg: 8 });
    cap["coolant-drip"] = cyl(g, 0.22, 0.22, 0.006, 0.9, 0.125, -5.6, 0x3a6a7a, { rough: 0.3, seg: 14, cast: false }); reg(hits, cap["coolant-drip"], "coolant-drip");
    // the stop-log panel
    const logPanel = holoPanel(g, 0.72, 0.48, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(22,10,8,0.92)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#e0634a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbe6e0"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("STOP LOG · LAST EVENT", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#e9b7ab";
      ["Safety stop: light curtain opened", "Programme step: place to fixture", "Drives: off · controller: live", "Reset: from outside only"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, logPanel, "log-panel");
    // hazard boards
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("blind-reset-hazard", "RESET\nBLIND", -1.22, 2.96, 2.75);
    hazard("reach-through-hazard", "REACH\nTHROUGH", 1.22, 2.96, -2.75);
    hazard("bypass-curtain-hazard", "MUTE THE\nCURTAIN", -3.04, -1.01, 1.25);
    hazard("reset-inside-hazard", "RESET FROM\nINSIDE", 3.04, -1.01, -1.25);
    // status board
    const statSign = group(g, 2.9, 0, 0.4, -0.9);
    box(statSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const statFace = decal(statSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("CELL\nSTOPPED", { bg: "#2a0f0b", accent: "#e0634a", scale: 0.26 }), { px: 320 });
    // finished-parts racks along the wall, a bin of dropped parts
    for (let i = 0; i < 18; i++) box(g, 0.5, 0.3, 0.35, -4.0 + (i % 6) * 0.6, 0.3 + Math.floor(i / 6) * 0.45, -6.8, [0x6d767e, 0xd8a63a, 0x53585e][i % 3], { rough: 0.8 });
    for (const y of [0.14, 0.59, 1.04]) box(g, 3.8, 0.04, 0.45, -2.5, y, -6.8, 0x53585e, { rough: 0.6, metal: 0.4 });
    box(g, 0.6, 0.4, 0.5, 2.6, 0.2, -6.6, 0x2f6f5e, { rough: 0.7 });
    for (let i = 0; i < 5; i++) box(g, 0.14, 0.08, 0.1, 2.4 + (i % 3) * 0.16, 0.44, -6.7 + Math.floor(i / 3) * 0.14, 0xd8a63a, { rough: 0.5 });
    const lock = lockTag(g, 0.4, 1.12, -1.6, {});
    lock.visible = false;
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const lead = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(lead, "line lead", 0, 1.95, 0.15, { css: "#e0634a", w: 0.26 });
    const coworker = standingFigure(g, 3.9, -2.4, { ry: -1.4, cloth: 0x5a6b7a, helmet: 0x5a6b7a });
    holoTag(coworker, "coworker", 0, 1.95, 0.15, { css: "#e0634a", w: 0.26 });
    const faultOn = new URLSearchParams(globalThis.location?.search ?? "").get("fault") === "sensor-fault";
    const fStep = SIM_RT_ROBOT_ESTOP_RECOVERY_AND_RESTART.steps.find((s) => s.id === "find-cause");
    const fDecl = SIM_RT_ROBOT_ESTOP_RECOVERY_AND_RESTART.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.target = fStep.targets[0]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { part.position.set(2.5, 0.48, -6.6); recvLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.2 }); holoTag(g, "Stop cause: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 }); }
    faultLamp.visible = faultOn;
    let running = false, armPhase = 0, resetTwist = 0;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "helper-reset") { faultLamp.visible = true; coworker.position.set(3.0, 0, -3.6); cap["estop-reset"].children[1].material = mat(0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 0.8 }); }
        if (it.id === "wrong-path") { cap["cycle-meter"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 }); if (P.base) P.base.rotation.y = 1.3; running = false; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "helper-reset") { faultLamp.visible = false; coworker.position.set(3.9, 0, -2.4); cap["estop-reset"].children[1].material = mat(0xd2312b, { rough: 0.4 }); cap["pendant-estop"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); }
        if (it.id === "wrong-path") { cap["cycle-meter"].material = mat(0x59c97b, { rough: 0.5 }); cap["outside-estop"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.4 }); stack[2].material = mat(0xd8322c, { emissive: 0xd8322c, ei: 1.0 }); }
      },
      onStepComplete(step) {
        if (step.id === "lockout") lock.visible = true;
        if (step.id === "verify-zero") repaint(cap["verify-meter"].userData.screen, signFace("0", { bg: "#1c0e0a", accent: "#59c97b", fg: "#fbe6e0", scale: 0.55 }));
        if (step.id === "clear-hold") part.position.set(2.5, 0.48, -6.6);
        if (step.id === "exit-unlock") { lock.visible = false; cap["wedge-marker"].position.set(-0.9, 0.97, -2.3); }
        if (step.id === "reset-circuit") { resetTwist = 1; stack[2].material = mat(0xd8322c, { rough: 0.5 }); stack[1].material = mat(0xffab2e, { emissive: 0xffab2e, ei: 0.9 }); }
        if (step.id === "reduced-restart") repaint(cap["speed-dial"].userData.screen, signFace("T1", { bg: "#1c0e0a", accent: "#59c97b", fg: "#fbe6e0", scale: 0.5 }));
        if (step.id === "first-cycle-track") { running = true; stack[1].material = mat(0xffab2e, { rough: 0.5 }); stack[0].material = mat(0x3fc26a, { emissive: 0x16b04a, ei: 0.9 }); }
        if (step.id === "log-event") repaint(statFace, signFace("CELL\nRECOVERED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        lead.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (running) { armPhase += dt * 0.3; if (P.base) P.base.rotation.y = Math.sin(armPhase) * 0.6; if (P.upperArm) P.upperArm.rotation.x = Math.sin(armPhase * 0.7) * 0.25; }
        cap["estop-reset"].children[1].rotation.y = resetTwist * Math.PI / 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "verify-zero") repaint(cap["verify-meter"].userData.screen, signFace(gg.t < 0.18 ? "0" : "LIVE", { bg: "#1c0e0a", accent: gg.t < 0.18 ? "#59c97b" : "#f0645b", fg: "#fbe6e0", scale: 0.55 }));
        if (gg && !gg.committed && session?.step?.id === "reduced-restart") repaint(cap["speed-dial"].userData.screen, signFace(gg.t > 0.3 && gg.t < 0.48 ? "T1" : "FULL?", { bg: "#1c0e0a", accent: gg.t > 0.3 && gg.t < 0.48 ? "#59c97b" : "#f0645b", fg: "#fbe6e0", scale: 0.5 }));
      },
    };
  },
};
