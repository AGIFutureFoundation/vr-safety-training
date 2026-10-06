import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  tileFace, blockFace, gratingFace, reg,
} from "../citykit.js";
import { cobotBench } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Collecting a Robot Demonstration Safely — its own gamified system: Clean Demo.
//
// ROBOPROG (docs/consoles/ROBOPROG.md, docs/robotics-programme.md): the AI-training specialist's first station. An adult
// learner records teleoperation demonstrations of a pick-and-place on a generic cobot bench so a robot policy can be trained
// from them (behaviour cloning, COLEARN's col-learn.js). The station teaches two things at once: the robot is still a machine
// with a safeguarded space while you drive it, and the data is a person's — opt-in, adults only, kept on the device, and
// deleted when consent is revoked (DATAWORKS). No speed, force or distance is stated; those are the cell's risk assessment's
// and the manufacturer's manual's. ?fault=badge-in-frame moves the coworker's badge into the camera view so the right answer
// is read, not remembered.

const RPTD_ACCENT = 0x8fd17a;

export const SIM_RP_TELEOP_DEMONSTRATION_COLLECTION = {
  id: "rp-teleop-demonstration-collection",
  index: "rp-1",
  domain: "Robotics",
  trade: "AI-training specialist, teleoperation demonstrations on a cobot bench — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-training-centre",
  weather: "overcast",
  certification: "UAW and IAM skilled-trades training as bodies; ANSI R15.06 and ISO 10218 industrial robot safety, with ISO/TS 15066 named for collaborative operation; OSHA 29 CFR 1910.212 general requirements for machines, 29 CFR 1910.147 the control of hazardous energy and 29 CFR 1910.132 personal protective equipment; the bench's written risk assessment, the manufacturer's manual and the platform's own consent rules for training data",
  name: "Collecting a Robot Demonstration Safely",
  title: simTitle("Collecting a Robot Demonstration Safely"),
  tagline: "Recording teleoperation demonstrations a robot will learn from: your own consent given and readable, the cell's risk assessment and reduced-speed mode checked, the scanner proven, nobody else in the camera's frame, the gripper driven inside its force band, every failed attempt labelled as failed, and the data kept on this device where revoking deletes it",
  accent: RPTD_ACCENT,
  accentCss: "#8fd17a",
  parSeconds: 330,
  footprint: 2.9,
  badge: { id: "clean-demo", name: "Clean Demo", note: "Gave consent knowingly, drove the cobot inside its safeguards, kept bystanders out of frame and labelled every attempt honestly" },

  game: system({
    name: "Clean Demo",
    currency: "EP",
    ranks: ["Observer", "Consented", "Demonstrator", "Data Steward", "Clean Demo Lead"],
    badges: [
      { id: "consent-first", name: "Consent First", note: "Read the consent screen before the first recording", test: AWARD.stepClean("consent-read") },
      { id: "honest-label", name: "Honest Label", note: "Labelled the failed attempt as failed", test: AWARD.stepClean("label-failed") },
      { id: "steady-hand", name: "Steady Hand", note: "Held the grip force near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-session", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-session", name: "Clean Session", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UAW or IAM local's member assistance programme, or the employee assistance line, if being recorded at work is something you want to talk through",

  faults: [{ id: "badge-in-frame", label: "Camera frame: CHECK", step: "find-frame", target: "badge-on-bench", note: "Today the coworker's badge is lying on the bench inside the camera's view, not on the coworker. Find what must not be recorded.", from: "coworker-in-frame", cue: "Find what in the camera's view must not be recorded." }],

  hazards: {
    "reach-in-hazard": "That reaches across the bench to straighten a part while the cobot is enabled for teleoperation. Driving the arm from a controller does not make the space around it safe; a hand inside the reach of a moving arm is exactly what the risk assessment and the scanner zones are there to prevent.",
    "record-coworker-hazard": "That starts recording with a coworker standing in the camera's view. Consent covers the person who gave it, nobody else: a face, a badge or a voice in the frame turns somebody's working day into training data they never agreed to.",
    "full-speed-hazard": "That switches teleoperation to full production speed to finish the demonstrations faster. Demonstrations are recorded in the reduced-speed mode the risk assessment names, because a person learning to drive an arm makes mistakes and the speed decides how much a mistake costs.",
    "upload-hazard": "That copies the session to a personal cloud folder to work on at home. The recordings stay on this device: there is no upload, and a copy somewhere else is a copy that revoking consent can no longer reach.",
  },

  lateNotes: {
    "consent-panel": "Consent is read before anything is recorded, by the person who will be recorded, and it can be revoked later from the same screen.",
    "reduced-speed-key": "Reduced-speed mode is selected and confirmed on the pendant before the first demonstration, every session, not assumed from yesterday.",
  },

  interrupts: [
    { id: "visitor-zone", kind: "Person in zone", after: "scanner-hold", delay: 3, seconds: 11, alert: "A visitor has stepped over the floor tape into the cobot's warning zone to watch the demonstration.", cue: "Press the bench e-stop now.", target: "bench-estop", why: "The scanner slows the arm for a person in the warning zone, but someone who does not know the cell can keep walking into the protective zone and toward the gripper; stopping the demonstration and the arm before they get there costs one attempt, and an attempt is the cheapest thing in the room.", missNote: "You kept driving with a visitor inside the warning zone. A person who does not know the cell is answered with the e-stop first and a conversation second.", wrongNote: "Not that — a visitor walking into the zone is answered with the bench e-stop." },
    { id: "force-alarm", kind: "Over-force", after: "drive-track", delay: 3, seconds: 11, alert: "The grip force readout has flashed red: the gripper is squeezing the part harder than the band on the task card.", cue: "Release the gripper.", target: "release-button", why: "An over-force grip can crack a part, drop it or teach a policy that crushing is normal, and releasing at once is what keeps the recorded attempt from becoming the example the robot copies; the attempt is then labelled failed rather than quietly kept.", missNote: "The gripper kept squeezing past its band. Over-force is answered by releasing, then labelling the attempt failed.", wrongNote: "Not that — over-force is answered by releasing the gripper." },
  ],

  steps: [
    { id: "consent-read", kind: "select", target: "consent-panel", title: "Read the consent screen", cue: "Read the consent screen yourself: what is recorded, where it stays, how to revoke it.", why: "A demonstration is a recording of you working, and it can only become training data if you understood what you agreed to: what is captured, that it stays on this device, that it is never collected from minors or demo sessions, and that revoking deletes it. Consent you did not read is a signature, not a choice." },
    { id: "risk-sheet", kind: "select", target: "risk-sheet", title: "Read the bench's risk assessment", cue: "Read the risk assessment for teleoperation on this bench: the zones, the mode and who may enable the arm.", why: "Teleoperation is a task the cell's risk assessment has to cover like any other: it decides which mode the arm runs in, where the person driving it stands and which safeguards stay active, and a demonstrator who has not read it is improvising around a machine." },
    { id: "ppe-demo", kind: "sequence", anyOrder: true, targets: ["glasses-demo", "hair-demo", "sleeves-demo"], itemNames: { "glasses-demo": "safety glasses", "hair-demo": "long hair tied back", "sleeves-demo": "sleeves fitted, no lanyard" }, title: "Dress for the bench", cue: "Safety glasses, long hair tied back, fitted sleeves and no lanyard.", why: "A cobot's joints and gripper close on whatever is near them, and the things that get caught first are the loose ones — a lanyard, a cuff, a ponytail — while a dropped or flicked part is what the glasses are for; dressing for the bench is part of the demonstration, not before it." },
    { id: "reduced-speed", kind: "gauge", target: "reduced-speed-key", title: "Select reduced-speed mode", cue: "Turn the mode key to reduced speed and commit only when the pendant confirms it.", why: "A person learning to drive an arm will overshoot, misjudge depth and jab the wrong axis, and reduced-speed mode is what turns those mistakes into slow, recoverable ones; it is confirmed on the pendant screen because the key position alone has been wrong before.", gauge: { label: "MODE", speed: 0.6, green: [0.42, 0.6], readout: (t) => (t > 0.42 && t < 0.6 ? "reduced speed" : "check mode"), missNote: "Not confirmed — the pendant does not show reduced speed. Do not record until it does." } },
    { id: "estop-test", kind: "select", target: "bench-estop", title: "Test the bench e-stop", cue: "Press and reset the bench e-stop once and watch the arm hold.", why: "The e-stop is the one control every person near the bench may use, and the only way to know it stops this arm today is to press it while nothing depends on it; a stop that has not been proven is a hope, and demonstrations are a long session of hands near a moving arm." },
    { id: "scanner-hold", kind: "hold", target: "scanner-pad", seconds: 5, title: "Prove the scanner's warning zone", cue: "Stand on the warning-zone tape and hold while the arm slows.", why: "Speed-and-separation monitoring is only a safeguard if it reacts to a real body at the real boundary, so the demonstrator steps onto the tape and watches the arm slow before trusting the zone to protect them for an hour of recording.", holdBreakNote: "Stepped off before the arm settled at its slowed speed. Hold until it does." },
    { id: "find-frame", kind: "find", noHint: true, targets: ["coworker-in-frame"], target: "coworker-in-frame", itemNames: { "coworker-in-frame": "coworker standing in the camera's view" }, itemNotes: { "coworker-in-frame": "Only the person who consented is recorded: ask the coworker to step out of the frame, or move the camera, before recording starts." }, decoyNotes: { "badge-on-bench": "A badge face-down in a tray outside the camera's view. Nothing to fix there today.", "parts-tray": "The parts tray for the task. It belongs in the frame." }, title: "Find what must not be recorded", cue: "Find what in the camera's view must not be recorded.", why: "Consent belongs to one person, and a camera does not know where that person ends; a coworker's face, a badge with a name on it or a screen with someone's details turns a demonstration into a record of people who never agreed, so the frame is cleared before the red light comes on." },
    { id: "tray-place", kind: "drag", target: "parts-tray", drag: { to: "tray-fixture", radius: 0.4, missNote: "Not seated — set the parts tray in its marked fixture outside the protective zone." }, title: "Seat the parts tray", cue: "Carry the parts tray to its marked fixture so you never reach in during a take.", why: "Every take starts with the parts where the task card says, so the demonstrator never has to reach into the arm's space to reset between attempts; a tray that wanders is the reason people lean across benches with the arm enabled." },
    { id: "drive-track", kind: "track", target: "force-meter", seconds: 8, title: "Drive the pick inside the force band", cue: "Drive the gripper through the pick, keeping the grip force inside the band.", why: "The policy will copy what the demonstration does, including how hard it grips, so a pick that crushes or nearly drops the part is a lesson in the wrong thing; holding the force inside the band is both the safe grip and the good example.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "GRIP", readout: (v) => (v < 0.4 ? "slipping" : v > 0.62 ? "over-force" : "in band") }, holdBreakNote: "The grip left the band. Release, reset the part and try the take again." },
    { id: "label-failed", kind: "select", target: "label-failed-tag", title: "Label the failed take as failed", cue: "Mark the take where the part slipped as failed, with the reason.", why: "A dataset that keeps only the successes hides how often the task goes wrong, and one that calls a failure a success teaches the robot the failure; an honest label with the reason is what lets the training filter it and the evaluation count it." },
    { id: "label-order", kind: "sequence", anyOrder: false, targets: ["label-outcome", "label-rule", "label-note"], itemNames: { "label-outcome": "outcome marked", "label-rule": "safe-practice rule noted", "label-note": "plain note written" }, outOfOrderNote: "Out of order — outcome first, then the rule that was broken, then the note in plain words.", title: "Label the session", cue: "Mark each take's outcome, note any safe-practice rule broken, then write a plain note.", why: "Labels are read by people who were not there: the outcome first so a filter can sort takes, the safe-practice rule so an unsafe take is never used as an example, and a plain note so the next person knows what actually happened rather than guessing from numbers." },
    { id: "local-store", kind: "select", target: "local-store", title: "Check where the data lives", cue: "Open the local store and confirm the session is on this device only.", why: "Data that stays on the device it was recorded on can be seen, counted and deleted by the person it belongs to; there is no upload here, and checking the store before leaving is how a demonstrator knows that what they consented to is what happened." },
    { id: "revoke-check", kind: "select", target: "revoke-button", title: "Find the revoke control", cue: "Find the revoke control and read what it does: it deletes the recordings.", why: "Consent that cannot be taken back is not consent, and the revoke control is the proof: it deletes the recordings from this device and marks any policy trained on them as stale, so a learner who changes their mind next week is not stuck with a decision they made today." },
  ],

  build(root) {
    const ACC = RPTD_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floor = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc7cdd1, grout: "#899095" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wall = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wall.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7f8a92 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const deck = box(g, 1.4, 0.03, 0.8, 3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "robot-learning bench — procedural, generic cobot", -3.6, 3.7, -7.05, { css: "#8fd17a", w: 0.62 });
    const rig = cobotBench(g, 0, 0, -3.6, {});
    const P = rig.userData.parts ?? {};
    // the teleoperation station: a controller desk, a camera on a mast, the recording light
    const desk = box(g, 1.1, 0.06, 0.6, -2.6, 0.82, -2.4, 0x3b4148, { rough: 0.6 });
    for (const sx of [-0.5, 0.5]) for (const sz of [-0.25, 0.25]) box(g, 0.04, 0.8, 0.04, -2.6 + sx, 0.4, -2.4 + sz, 0x2b2f34, { rough: 0.6 });
    box(g, 0.32, 0.06, 0.2, -2.6, 0.88, -2.4, 0x1d2329, { rough: 0.5 });
    cyl(g, 0.02, 0.02, 0.14, -2.68, 0.98, -2.4, 0x2b2f34, { rough: 0.5, seg: 8 });
    ball(g, 0.03, -2.68, 1.06, -2.4, 0xd2312b, { rough: 0.4, seg: 10 });
    cyl(g, 0.03, 0.04, 2.4, 1.8, 1.2, -4.6, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const cam = box(g, 0.22, 0.14, 0.16, 1.8, 2.45, -4.6, 0x1d2329, { rough: 0.5 });
    cam.rotation.y = 0.6;
    const recLamp = ball(g, 0.04, 1.9, 2.55, -4.5, 0x5a2020, { rough: 0.4, seg: 10 });
    // a screen showing the camera's view cone on the floor
    const cone = box(g, 2.4, 0.004, 1.6, 0.6, 0.125, -3.2, 0x8fd17a, { rough: 0.7, opacity: 0.18, transparent: true, cast: false });
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#8fd17a", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("risk-sheet", "risk assessment: teleoperation", -1.68, 1.47, "box", 0xd8a63a);
    put("glasses-demo", "safety glasses", -2.09, 0.9, "box", 0x2b2f34);
    put("hair-demo", "long hair tied back", -2.25, 0.24, "cyl", 0x3a78c9);
    put("sleeves-demo", "fitted sleeves, no lanyard", -2.13, -0.42, "ball", 0x4b5561);
    put("reduced-speed-key", "mode key", -1.74, -1.01, "meter");
    put("bench-estop", "bench e-stop", -1.14, -1.45, "cyl", 0xd2312b);
    put("scanner-pad", "warning-zone tape", -0.4, -1.68, "ball", 0xf0b323);
    cap["tray-fixture"] = group(g, 0.4, 0.95, -1.68); post(0.4, -1.68, 0.95);
    box(cap["tray-fixture"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["tray-fixture"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "tray fixture", 0.4, 1.3, -1.68, { css: "#8fd17a", w: 0.34 }); reg(hits, cap["tray-fixture"], "tray-fixture");
    put("force-meter", "grip force", 1.14, -1.45, "meter");
    put("release-button", "release gripper", 1.74, -1.01, "cyl", 0x59c97b);
    put("label-failed-tag", "label: failed take", 2.13, -0.42, "box", 0xf0645b);
    put("label-outcome", "outcome", 2.25, 0.24, "ball", 0x59c97b);
    put("label-rule", "safe-practice rule", 2.09, 0.9, "box", 0xf0b323);
    put("label-note", "plain note", 1.68, 1.47, "cyl", 0x59637a);
    put("local-store", "local store: this device", 2.9, 1.9, "box", 0x2f6fb0);
    put("revoke-button", "revoke: deletes recordings", -2.9, 1.9, "box", 0xd2312b);
    // the parts tray (drag) and the bench parts
    cap["parts-tray"] = box(g, 0.34, 0.06, 0.24, -0.9, 0.95, -2.3, 0x2f6f5e, { rough: 0.6 });
    reg(hits, cap["parts-tray"], "parts-tray");
    for (let i = 0; i < 6; i++) box(g, 0.05, 0.05, 0.05, 0.4 + (i % 3) * 0.08, 0.98, -3.5 + Math.floor(i / 3) * 0.08, [0xd8a63a, 0x3a78c9][i % 2], { rough: 0.5 });
    // the find targets: a coworker in frame, a badge on the bench
    const coworker = standingFigure(g, 1.2, -2.7, { ry: -0.4, cloth: 0x5a6b7a, helmet: 0x5a6b7a });
    cap["coworker-in-frame"] = coworker; reg(hits, coworker, "coworker-in-frame");
    holoTag(coworker, "coworker", 0, 1.95, 0.15, { css: "#8fd17a", w: 0.26 });
    cap["badge-on-bench"] = box(g, 0.09, 0.012, 0.06, -3.1, 0.86, -2.25, 0xeaeaea, { rough: 0.5 });
    reg(hits, cap["badge-on-bench"], "badge-on-bench");
    // the consent panel
    const consent = holoPanel(g, 0.72, 0.48, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,18,10,0.92)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#8fd17a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eef8ea"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CONSENT · TRAINING DATA", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#b9d6ae";
      ["Adults only, signed in, opt-in", "Recorded: controller moves, outcome", "Stays on this device; no upload", "Revoke any time: recordings deleted"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, consent, "consent-panel");
    // hazard boards
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("reach-in-hazard", "REACH\nIN", -1.22, 2.96, 2.75);
    hazard("record-coworker-hazard", "RECORD\nCOWORKER", 1.22, 2.96, -2.75);
    hazard("full-speed-hazard", "FULL\nSPEED", -3.04, -1.01, 1.25);
    hazard("upload-hazard", "COPY TO\nCLOUD", 3.04, -1.01, -1.25);
    // session board (repainted as the session closes)
    const sessSign = group(g, 2.9, 0, 0.4, -0.9);
    box(sessSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const sessFace = decal(sessSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("SESSION\nOPEN", { bg: "#11181f", accent: "#8fd17a", scale: 0.26 }), { px: 320 });
    // shelving and boxes along the wall
    for (let i = 0; i < 18; i++) box(g, 0.5, 0.3, 0.35, -4.0 + (i % 6) * 0.6, 0.3 + Math.floor(i / 6) * 0.45, -6.7, [0x6d767e, 0xb08a4a, 0x3a78c9][i % 3], { rough: 0.8 });
    for (const y of [0.14, 0.59, 1.04]) box(g, 3.8, 0.04, 0.45, -2.5, y, -6.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const lead = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(lead, "data steward", 0, 1.95, 0.15, { css: "#8fd17a", w: 0.3 });
    const faultOn = /[?&]fault=badge-in-frame(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_RP_TELEOP_DEMONSTRATION_COLLECTION.steps.find((s) => s.id === "find-frame");
    const fDecl = SIM_RP_TELEOP_DEMONSTRATION_COLLECTION.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.target = fStep.targets[0]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { cap["badge-on-bench"].position.set(0.6, 0.96, -3.0); coworker.position.x = -4.2; holoTag(g, "Camera frame: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 }); }
    faultLamp.visible = faultOn;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "visitor-zone") { faultLamp.visible = true; cap["scanner-pad"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "force-alarm") { cap["release-button"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 }); recLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "visitor-zone") { faultLamp.visible = false; cap["bench-estop"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); }
        if (it.id === "force-alarm") { cap["release-button"].material = mat(0x59c97b, { rough: 0.5 }); recLamp.material = mat(0x5a2020, { rough: 0.4 }); if (P.gripper) P.gripper.position.y += 0.02; }
      },
      onStepComplete(step) {
        if (step.id === "reduced-speed") repaint(cap["reduced-speed-key"].userData.screen, signFace("T1", { bg: "#0d1c12", accent: "#59c97b", fg: "#cff7c4", scale: 0.5 }));
        if (step.id === "find-frame") cone.material = mat(0x59c97b, { rough: 0.7, opacity: 0.25, transparent: true });
        if (step.id === "drive-track") recLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.0 });
        if (step.id === "revoke-check") repaint(sessFace, signFace("SESSION\nON DEVICE", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        lead.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (P.arm) P.arm.rotation.y = Math.sin(t * 0.4) * 0.5;
        if (P.elbow) P.elbow.rotation.x = Math.sin(t * 0.6) * 0.2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "reduced-speed") repaint(cap["reduced-speed-key"].userData.screen, signFace(gg.t > 0.42 && gg.t < 0.6 ? "T1" : "CHECK", { bg: "#0d1c12", accent: gg.t > 0.42 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#cff7c4", scale: 0.5 }));
      },
    };
  },
};
