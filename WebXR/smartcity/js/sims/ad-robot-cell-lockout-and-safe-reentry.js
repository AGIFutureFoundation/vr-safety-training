import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  blockFace, tileFace, gratingFace, reg,
} from "../citykit.js";
import { robotCell } from "../../../shared/equipment.js";
import { teachPendant } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Robot Cell Lockout & Safe Re-entry — its own gamified system:
// Own Lock, Own Life.
// 
// A generic fenced robot cell: stopped, isolated with a personal lock,
// stored energy proven gone, a raised axis blocked, any jog in reduced
// speed, and a head count before the lock comes off. No speed, distance
// or stopping time is stated; those are the manufacturer's manual's and
// the risk assessment's. ?fault=light-curtain-fault makes the curtain
// untrustworthy and the first answer the cell stop.

const ORB2_ACCENT = 0xff8a3d;

export const SIM_AD_ROBOT_CELL_LOCKOUT_AND_SAFE_REENTRY = {
  id: "ad-robot-cell-lockout-and-safe-reentry",
  index: "ad-2",
  domain: "Robotics",
  trade: "Robot technician, cell lockout and re-entry — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-factory",
  weather: "overcast",
  certification: "UAW and IAM skilled-trades training as bodies; OSHA 29 CFR 1910.147 the control of hazardous energy and 29 CFR 1910.212 machine guarding; ANSI R15.06 and ISO 10218 industrial robot safety; the manufacturer's manual and the site's written lockout procedure",
  name: "Robot Cell Lockout & Safe Re-entry",
  title: simTitle("Robot Cell Lockout & Safe Re-entry"),
  tagline: "A fenced robot cell entered the only way that keeps a person out of the arm's reach: stopped, isolated at the disconnect with your own lock, stored energy proven gone, the pendant in reduced speed if anything must move, and the cell restored only after a head count and a clear floor",
  accent: ORB2_ACCENT,
  accentCss: "#ff8a3d",
  parSeconds: 320,
  footprint: 2.9,
  badge: {"id": "own-lock-own-life", "name": "Own Lock, Own Life", "note": "Locked the cell out with a personal lock, proved zero energy and never crossed the curtain with the arm live"},

  game: system({
    name: "Own Lock, Own Life",
    currency: "LOCK",
    ranks: ["Operator", "Authorised Employee", "Cell Technician", "Robot Lead", "Own Lock Certified"],
    badges: [
      { id: "proved-zero", name: "Proved Zero", note: "Tried the start after isolating, before anyone went in", test: AWARD.stepClean("try-start") },
      { id: "curtain-respected", name: "Curtain Respected", note: "Never crossed the light curtain with the arm live", test: AWARD.safe },
      { id: "slow-and-steady", name: "Slow and Steady", note: "Held the jog in reduced speed near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-lock", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-entry", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UAW or IAM local's member assistance programme, or the site's employee assistance line if a close call inside a cell is what stayed with you",

  faults: [{"id": "light-curtain-fault", "label": "Light curtain: FAULT", "step": "stop-cell", "target": "cell-stop", "note": "The light curtain is showing a fault and cannot be trusted to stop the arm. Hit the cell stop first, before anything else, then lock out.", "from": "cycle-stop", "cue": "Use the cycle stop to end the program at a safe point."}],

  hazards: {"reach-through-hazard": "That reaches over the light curtain to clear the part with the arm in automatic. A curtain stops the arm when it sees a body break the beam; a hand reaching over the top may never break it at all.", "borrowed-lock-hazard": "That hangs a coworker's lock on the disconnect for you. A lock only protects the person who holds its key; if somebody else can take it off, it is protecting them, not you.", "gate-bypass-hazard": "That jumpers the gate interlock so the cell keeps running with the gate open. An interlock defeated for convenience is a guard that is not there, and it is the one piece of the cell designed for the day somebody forgets.", "gravity-axis-hazard": "That walks under the raised arm without blocking it. An axis held up by its brake can drop when the brake is released or fails, and the arm does not need power to move downward."},

  lateNotes: {"disconnect-lock": "Your own lock goes on the disconnect before anyone crosses the curtain, every entry.", "try-start-button": "The start is tried after isolation and before entry, so zero energy is proven, not assumed."},

  interrupts: [{"id": "arm-creeps", "kind": "Unexpected motion", "after": "jog-reduced", "delay": 4, "seconds": 11, "alert": "The arm has started creeping on its own while the pendant is in your hand.", "cue": "Let go of the enabling switch and hit the cell stop now.", "target": "cell-stop", "why": "Motion nobody commanded is the robot telling you its program or its brake is not doing what you believe, and the only safe answer is to take its energy away at once — the enabling switch released and the stop pressed — before trying to work out why.", "missNote": "The arm kept creeping with a person inside the cell. Unexpected motion is answered with a stop, not watched to see where it goes.", "wrongNote": "Not that — unexpected motion is answered with the stop, first."}, {"id": "shift-change-unlock", "kind": "Lockout challenge", "after": "bleed-air", "delay": 4, "seconds": 11, "alert": "The incoming shift's operator is reaching for the disconnect to restart the cell, not knowing you are still inside.", "cue": "Point to your personal lock on the disconnect and stop the restart.", "target": "disconnect-lock", "why": "A shift change is exactly when a lockout gets misread, and a personal lock only protects you if the person reaching past it understands it is yours and that you are still in the cell — pointing it out is how that becomes certain rather than hoped.", "missNote": "Nobody stopped the restart while you were still in the cell. A lock no one pointed to is a lock the next person may try to work around.", "wrongNote": "That's not it — the restart at the disconnect is what needs stopping."}],

  steps: [
    {"id": "ppe", "kind": "sequence", "anyOrder": true, "targets": ["safety-glasses-rc", "safety-shoes-rc", "cut-gloves-rc"], "itemNames": {"safety-glasses-rc": "safety glasses", "safety-shoes-rc": "safety shoes", "cut-gloves-rc": "cut-resistant gloves"}, "title": "Suit up for the cell", "cue": "Safety glasses, safety shoes and cut-resistant gloves before the gate.", "why": "The inside of a robot cell is full of fixtures, sheet edges and parts at hand height, and the gloves and glasses are there for the ordinary cuts and flying clips of clearing a jam, not for the arm, which only isolation protects you from."},
    {"id": "brief", "kind": "select", "target": "loto-procedure", "title": "Read the lockout procedure", "cue": "Confirm every energy source the cell's written procedure lists before touching anything.", "why": "A robot cell usually carries more than one energy source — electrical, pneumatic, sometimes a gravity-loaded axis — and the written procedure is what lists them all, so none is missed because it was not the one you were thinking about."},
    {"id": "stop-cell", "kind": "select", "target": "cycle-stop", "title": "Bring the cell to a normal stop", "cue": "Use the cycle stop to end the program at a safe point.", "why": "A normal cycle stop parks the arm at the end of its motion instead of freezing it mid-path with a part in the gripper, which is what makes the isolation that follows a controlled one rather than a scramble."},
    {"id": "isolate", "kind": "sequence", "anyOrder": false, "targets": ["disconnect-open", "disconnect-lock", "air-dump"], "itemNames": {"disconnect-open": "disconnect opened", "disconnect-lock": "personal lock and tag on", "air-dump": "air supply dumped"}, "outOfOrderNote": "Out of order — the disconnect opens first, then your own lock and tag go on it, then the air is dumped.", "title": "Isolate and lock out", "cue": "Open the disconnect, hang your own lock and tag, then dump the air.", "why": "Opening the disconnect removes the power, your own lock makes sure only you can restore it, and dumping the air removes the second source that could still close a gripper or push a slide — in that order, so no step relies on one that has not happened yet."},
    {"id": "try-start", "kind": "select", "target": "try-start-button", "title": "Try the start", "cue": "Press the cell start to prove it will not run.", "why": "The try-start is the test that turns 'I opened the disconnect' into 'this cell cannot move' — a wrong breaker, a second feed or a bypassed circuit shows up here, harmlessly, instead of when someone is inside."},
    {"id": "zero-energy", "kind": "gauge", "target": "energy-meter", "title": "Verify zero energy", "cue": "Read the cell's energy check and commit only once it reads zero.", "why": "Stored energy outlives the switch — a capacitor bank, trapped air in a line, a spring-loaded clamp — and the meter reading is what shows that the energy the procedure listed is actually gone rather than merely disconnected.", "gauge": { label: "ZERO ENERGY", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "zero" : "energy present"), missNote: "Not zero — recheck the isolation before anyone crosses the curtain." }},
    {"id": "block-axis", "kind": "drag", "target": "axis-block", "drag": {"to": "arm-rest", "radius": 0.4, "missNote": "Not seated — set the block under the raised axis before anyone works beneath it."}, "title": "Block the raised axis", "cue": "Carry the block to the arm's rest point and seat it under the raised axis.", "why": "An axis held up only by its brake can drop without any power at all, and a mechanical block under it is what makes working beneath the arm safe even if that brake is released or fails."},
    {"id": "jog-reduced", "kind": "track", "target": "jog-speed", "seconds": 8, "title": "Jog in reduced speed", "cue": "With the pendant in reduced speed, keep the jog inside the band while the arm moves clear.", "why": "Teaching or jogging inside the cell is done in the reduced-speed mode the manufacturer's manual sets, with the enabling switch held, so that a person close to the arm always has time to react and a single release stops it.", "track": { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "REDUCED SPEED", readout: (v) => (v < 0.4 ? "stalled" : v > 0.62 ? "too fast" : "in band") }, "holdBreakNote": "The jog left the reduced-speed band. Bring it back before the arm moves any further."},
    {"id": "find-damage", "kind": "find", "noHint": true, "targets": ["frayed-cable"], "itemNames": {"frayed-cable": "frayed dress-pack cable"}, "itemNotes": {"frayed-cable": "A frayed dress-pack cable is the jam's cause and a shock hazard; it is logged for replacement before restart."}, "decoyNotes": {"clean-hose": "A clean air hose, properly clipped. Nothing to flag there."}, "title": "Find the cause", "cue": "Look along the shelf for what caused the jam.", "why": "Clearing a jam without finding its cause means the cell will jam again, probably on the next shift, and the frayed cable found now is also a live electrical hazard the moment power comes back."},
    {"id": "bleed-air", "kind": "hold", "target": "bleed-valve", "seconds": 5, "title": "Bleed the trapped air", "cue": "Hold the bleed valve open until the line gauge falls to nothing.", "why": "The dump valve empties the supply, but air trapped between a closed valve and a cylinder can still move a clamp when a fitting is loosened, and holding the bleed open is how that last pocket is let out on purpose.", "holdBreakNote": "Released the bleed early. Hold it until the line reads empty."},
    {"id": "remove-block", "kind": "select", "target": "axis-block", "title": "Remove the block", "cue": "Take the axis block out once the work under the arm is done.", "why": "The block comes out before restart because an arm driven into its own block can damage itself or throw the block, and every tool and block brought into the cell has to come back out with the person who brought it."},
    {"id": "clear-cell", "kind": "sequence", "anyOrder": true, "targets": ["head-count", "floor-clear"], "itemNames": {"head-count": "head count done", "floor-clear": "floor clear of tools"}, "title": "Clear the cell", "cue": "Count everyone out and check the floor for tools before the lock comes off.", "why": "Restoring energy is only safe once every person is outside the fence and nothing is left inside for the arm to hit, and the head count is the one check that makes the first of those a fact."},
    {"id": "find-open-gate", "kind": "find", "noHint": true, "targets": ["unlatched-gate"], "itemNames": {"unlatched-gate": "gate interlock not made"}, "itemNotes": {"unlatched-gate": "The gate is closed but the interlock is not made; the cell will refuse to start, and it should."}, "decoyNotes": {"latched-panel": "A fence panel bolted and latched. Nothing to flag there."}, "title": "Check the guarding", "cue": "Before restart, find the guard that is not doing its job.", "why": "Guards and interlocks are checked before restart, not assumed, because a gate that looks shut but has not made its interlock is a gate that will not stop the arm the next time somebody opens it."},
    {"id": "closeout", "kind": "select", "target": "loto-log", "title": "Remove your lock and log it", "cue": "Remove your own lock, restore energy per the procedure and log the entry.", "why": "The lock comes off only by the hand that put it on, after the head count and the guard check, and the log is what tells the next shift what was done inside their cell and what still needs parts."},
  ],

  build(root) {
    const ACC = ORB2_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floorMesh = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floorMesh.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc9ced2, grout: "#8a9094" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wallMesh = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wallMesh.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7d8790 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const trayMesh = box(g, 1.4, 0.03, 0.8, 3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    trayMesh.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "robot hall, cell 2", -3.8, 3.7, -7.05, { css: "#ff8a3d", w: 0.5 });
    const rig = robotCell(g, 0, 0, -4.4, {});
    const P = rig.userData.parts;
    const pendant = teachPendant(g, 1.6, 0.93, 1.9, { ry: -0.6 }); cyl(g, 0.2, 0.2, 0.93, 1.6, 0.465, 1.9, 0x3b4148, { rough: 0.5, metal: 0.4, seg: 12 }); reg(hits, pendant, "pendant-mode");
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    post(-1.68, 1.47, 0.95);
    cap["safety-glasses-rc"] = box(g, 0.18, 0.14, 0.12, -1.68, 1.02, 1.47, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "safety glasses", -1.68, 1.3, 1.47, { css: "#ff8a3d", w: 0.372 });
    reg(hits, cap["safety-glasses-rc"], "safety-glasses-rc");
    post(-2.05, 0.98, 0.95);
    cap["safety-shoes-rc"] = ball(g, 0.075, -2.05, 1.03, 0.98, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "safety shoes", -2.05, 1.3, 0.98, { css: "#ff8a3d", w: 0.33599999999999997 });
    reg(hits, cap["safety-shoes-rc"], "safety-shoes-rc");
    post(-2.23, 0.42, 0.95);
    cap["cut-gloves-rc"] = cyl(g, 0.07, 0.07, 0.12, -2.23, 1.01, 0.42, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "cut-resistant gloves", -2.23, 1.3, 0.42, { css: "#ff8a3d", w: 0.48 });
    reg(hits, cap["cut-gloves-rc"], "cut-gloves-rc");
    post(-2.21, -0.16, 0.95);
    cap["cycle-stop"] = box(g, 0.18, 0.14, 0.12, -2.21, 1.02, -0.16, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "cycle stop", -2.21, 1.3, -0.16, { css: "#ff8a3d", w: 0.3 });
    reg(hits, cap["cycle-stop"], "cycle-stop");
    post(-1.98, -0.71, 0.95);
    cap["disconnect-open"] = ball(g, 0.075, -1.98, 1.03, -0.71, 0x59637a, { rough: 0.45, seg: 12 });
    holoTag(g, "disconnect opened", -1.98, 1.3, -0.71, { css: "#ff8a3d", w: 0.426 });
    reg(hits, cap["disconnect-open"], "disconnect-open");
    post(-1.56, -1.18, 0.95);
    cap["disconnect-lock"] = cyl(g, 0.07, 0.07, 0.12, -1.56, 1.01, -1.18, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(g, "personal lock", -1.56, 1.3, -1.18, { css: "#ff8a3d", w: 0.354 });
    reg(hits, cap["disconnect-lock"], "disconnect-lock");
    post(-1.0, -1.51, 0.95);
    cap["air-dump"] = box(g, 0.18, 0.14, 0.12, -1.0, 1.02, -1.51, 0xf0b323, { rough: 0.5 });
    holoTag(g, "air dump valve", -1.0, 1.3, -1.51, { css: "#ff8a3d", w: 0.372 });
    reg(hits, cap["air-dump"], "air-dump");
    post(-0.34, -1.69, 0.95);
    cap["try-start-button"] = ball(g, 0.075, -0.34, 1.03, -1.69, 0x3a78c9, { rough: 0.45, seg: 12 });
    holoTag(g, "try start button", -0.34, 1.3, -1.69, { css: "#ff8a3d", w: 0.408 });
    reg(hits, cap["try-start-button"], "try-start-button");
    post(0.34, -1.69, 0.95);
    cap["energy-meter"] = instrument(g, 0.34, 0.97, -1.69, { ry: -0.15, idle: "--", color: ACC });
    holoTag(g, "energy meter", 0.34, 1.3, -1.69, { css: "#ff8a3d", w: 0.33599999999999997 });
    reg(hits, cap["energy-meter"], "energy-meter");
    post(1.0, -1.51, 0.95);
    cap["axis-block"] = box(g, 0.18, 0.14, 0.12, 1.0, 1.02, -1.51, 0x59637a, { rough: 0.5 });
    holoTag(g, "axis block", 1.0, 1.3, -1.51, { css: "#ff8a3d", w: 0.3 });
    reg(hits, cap["axis-block"], "axis-block");
    post(1.56, -1.18, 0.95);
    cap["arm-rest"] = group(g, 1.56, 0.95, -1.18); box(cap["arm-rest"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["arm-rest"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "arm rest", 1.56, 1.3, -1.18, { css: "#ff8a3d", w: 0.264 });
    reg(hits, cap["arm-rest"], "arm-rest");
    post(1.98, -0.71, 0.95);
    cap["jog-speed"] = instrument(g, 1.98, 0.97, -0.71, { ry: -1.07, idle: "--", color: ACC });
    holoTag(g, "jog speed", 1.98, 1.3, -0.71, { css: "#ff8a3d", w: 0.282 });
    reg(hits, cap["jog-speed"], "jog-speed");
    post(2.21, -0.16, 0.95);
    cap["bleed-valve"] = box(g, 0.18, 0.14, 0.12, 2.21, 1.02, -0.16, 0x3a78c9, { rough: 0.5 });
    holoTag(g, "bleed valve", 2.21, 1.3, -0.16, { css: "#ff8a3d", w: 0.31799999999999995 });
    reg(hits, cap["bleed-valve"], "bleed-valve");
    post(2.23, 0.42, 0.95);
    cap["head-count"] = ball(g, 0.075, 2.23, 1.03, 0.42, 0xd8a63a, { rough: 0.45, seg: 12 });
    holoTag(g, "head count done", 2.23, 1.3, 0.42, { css: "#ff8a3d", w: 0.38999999999999996 });
    reg(hits, cap["head-count"], "head-count");
    post(2.05, 0.98, 0.95);
    cap["floor-clear"] = cyl(g, 0.07, 0.07, 0.12, 2.05, 1.01, 0.98, 0x59637a, { rough: 0.5, seg: 12 });
    holoTag(g, "floor clear of tools", 2.05, 1.3, 0.98, { css: "#ff8a3d", w: 0.48 });
    reg(hits, cap["floor-clear"], "floor-clear");
    post(1.68, 1.47, 0.95);
    cap["cell-stop"] = box(g, 0.18, 0.14, 0.12, 1.68, 1.02, 1.47, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "cell stop", 1.68, 1.3, 1.47, { css: "#ff8a3d", w: 0.282 });
    reg(hits, cap["cell-stop"], "cell-stop");
    cap["frayed-cable"] = ball(g, 0.06, -1.6, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["frayed-cable"], "frayed-cable");
    cap["clean-hose"] = ball(g, 0.06, -0.53, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["clean-hose"], "clean-hose");
    cap["unlatched-gate"] = ball(g, 0.06, 0.53, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["unlatched-gate"], "unlatched-gate");
    cap["latched-panel"] = ball(g, 0.06, 1.6, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["latched-panel"], "latched-panel");
    box(g, 3.8, 0.05, 0.4, 0, 0.55, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.55, 0.36, sx, 0.275, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    { const hz = group(g, -1.22, 0, 2.96, 2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("REACH\nOVER", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "reach-through-hazard"); }
    { const hz = group(g, 1.22, 0, 2.96, -2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("USE\nHIS", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "borrowed-lock-hazard"); }
    { const hz = group(g, -3.04, 0, -1.01, 1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("JUMP\nGATE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "gate-bypass-hazard"); }
    { const hz = group(g, 3.04, 0, -1.01, -1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("WALK\nUNDER", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "gravity-axis-hazard"); }
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#ff8a3d"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LOCKOUT PROCEDURE · CELL 2", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Energy sources: per the cell's procedure", "Personal lock on the disconnect", "Try-start before entry", "Reduced speed for any teaching"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "loto-procedure");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("LOTO LOG\nOPEN", { bg: "#11181f", accent: "#ff8a3d", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "lockout log", 0, 1.46, 0, { css: "#ff8a3d", w: 0.34 });
    reg(hits, logSign, "loto-log");
    for (let i = 0; i < 36; i++) { const side = i % 2 ? 1 : -1; const k = Math.floor(i / 2); box(g, 0.34, 0.2, 0.3, side * 4.3, 0.3 + (k % 4) * 0.42, -5.6 + Math.floor(k / 4) * 0.42, [0x3a78c9, 0xf0b323, 0x59637a][i % 3], { rough: 0.7 }); }
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) box(g, 0.4, 0.03, 2.4, side * 4.3, 0.18 + k * 0.42, -4.6, 0x53585e, { rough: 0.6, metal: 0.4 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.8, 0.6, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(crew, "cell operator", 0, 1.95, 0.15, { css: "#ff8a3d", w: 0.34 });
    const faultOn = /[?&]fault=light-curtain-fault(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_AD_ROBOT_CELL_LOCKOUT_AND_SAFE_REENTRY.steps.find((s) => s.id === "stop-cell");
    const fDecl = SIM_AD_ROBOT_CELL_LOCKOUT_AND_SAFE_REENTRY.faults[0];
    if (fStep) { fStep.target = faultOn ? fDecl.target : fDecl.from; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    faultLamp.visible = faultOn;
    if (faultOn) holoTag(g, "Light curtain: FAULT", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 });
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "arm-creeps") { faultLamp.visible = true; cap["cell-stop"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "shift-change-unlock") { cap["disconnect-lock"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "arm-creeps") { faultLamp.visible = false; cap["cell-stop"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "shift-change-unlock") { cap["disconnect-lock"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "zero-energy") repaint(cap["energy-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "closeout") repaint(logFace, signFace("LOTO LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        P.upperArm.rotation.x = Math.sin(t * 0.3) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "zero-energy") repaint(cap["energy-meter"].userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
