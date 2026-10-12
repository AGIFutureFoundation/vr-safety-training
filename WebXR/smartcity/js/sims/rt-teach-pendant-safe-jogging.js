import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  pavingFace, blockFace, gratingFace, lockTag, reg,
} from "../citykit.js";
import { robotCell } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Teaching a Robot from the Pendant — its own gamified system: Enabled Hand.
//
// ROBOTRAIN (docs/consoles/ROBOTRAIN.md): the first of the remaining ROBOPROG gap stations. A robot programmer teaches a new
// path from inside a fenced cell under teach-mode rules: the mode selector in manual reduced speed, the enabling device held in
// its middle position for every motion, the pendant e-stop proven, a second person at the outside e-stop, an escape route kept
// open, and the mode returned to automatic only from outside with the gate closed. Standards are named (ISO 10218, ANSI R15.06)
// and no clause or speed figure is quoted; the cell's own risk assessment and the manufacturer's manual carry those.
// ?fault=pendant-cable moves the pendant cable across the escape route so the walk-through finds a different snag.

const RTTP_ACCENT = 0xf0a63a;

export const SIM_RT_TEACH_PENDANT_SAFE_JOGGING = {
  id: "rt-teach-pendant-safe-jogging",
  index: "rt-1",
  domain: "Robotics",
  trade: "Robot programmer, teaching points inside a fenced industrial cell — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-factory",
  weather: "clear",
  certification: "UAW and IAM skilled-trades training as bodies; ANSI R15.06 and ISO 10218 for industrial robots and their integration, with the manual reduced-speed mode and the enabling device described in the manufacturer's manual; OSHA 29 CFR 1910.212 general requirements for machines, 29 CFR 1910.147 the control of hazardous energy and 29 CFR 1910.132 personal protective equipment; the cell's written risk assessment and the site's teach-mode procedure",
  name: "Teaching a Robot from the Pendant",
  title: simTitle("Teaching a Robot from the Pendant"),
  tagline: "Jogging an industrial arm from inside its cell to teach a path: manual reduced speed selected and read back, the pendant e-stop proven, the enabling device held in the middle for every move, a second person on the outside stop, an escape route that stays open, and automatic mode restored only from outside with the gate shut",
  accent: RTTP_ACCENT,
  accentCss: "#f0a63a",
  parSeconds: 340,
  footprint: 2.9,
  badge: { id: "enabled-hand", name: "Enabled Hand", note: "Taught a path at reduced speed with the enabling device held, the pendant stop proven and the escape route open" },

  game: system({
    name: "Enabled Hand",
    currency: "TP",
    ranks: ["Visitor", "Pendant Holder", "Teacher", "Cell Lead", "Enabled Hand"],
    badges: [
      { id: "mode-first", name: "Mode First", note: "Read back manual reduced speed before touching a jog key", test: AWARD.stepClean("mode-select") },
      { id: "three-position", name: "Three Positions", note: "Proved the enabling device releases and panics", test: AWARD.stepClean("enable-test") },
      { id: "outside-auto", name: "Outside Only", note: "Restored automatic mode from outside the gate", test: AWARD.stepClean("auto-restore") },
    ],
    challenges: [
      { id: "quick-teach", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-teach", name: "Clean Teach", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UAW or IAM local's apprenticeship coordinator, or the employee assistance line, if a near-miss inside a cell is still with you",

  faults: [{ id: "pendant-cable", label: "Escape route: CHECK", step: "find-route", target: "pendant-cable-loop", note: "Today the pendant cable has been looped across the escape route behind you. Find what blocks the way out.", from: "part-cart-in-route", cue: "Find what blocks the escape route inside the cell." }],

  hazards: {
    "auto-mode-hazard": "That leaves the mode selector in automatic while someone steps through the gate with the pendant. In automatic the arm runs its programme at full speed on the first signal it gets; teaching happens in manual reduced speed, chosen and read back on the pendant before the gate opens.",
    "tape-enable-hazard": "That tapes the enabling device down so both hands are free for the jog keys. The enabling device is the only thing that stops the arm the instant your hand flinches or lets go, and a taped switch turns a three-position safeguard into a piece of tape.",
    "second-pendant-hazard": "That hands a second person a pendant so two people can teach faster. One pendant has motion control at a time; a second enabled pendant means a move can come from someone who cannot see where your body is.",
    "gate-prop-hazard": "That props the cell gate open with a wedge so it is quicker to go in and out while teaching. The gate interlock is what keeps the arm from running automatically with a person inside; wedging it open is choosing to work without it.",
  },

  lateNotes: {
    "mode-selector": "Manual reduced speed is selected and read back on the pendant screen before the gate opens, not after the first jog surprises you.",
    "pendant-estop": "The pendant's own e-stop is pressed and reset once before teaching so you know the stop in your hand works today.",
  },

  interrupts: [
    { id: "coworker-reaches", kind: "Person in cell", after: "jog-track", delay: 3, seconds: 11, alert: "A coworker has opened the gate and is walking in to steady the part you are teaching to.", cue: "Press the pendant e-stop now.", target: "pendant-estop", why: "A second person inside a cell under manual control is a body the person holding the pendant cannot watch while watching the tool; the pendant e-stop drops the arm's power before the next jog key does anything, and the conversation about the gate happens with the arm stopped.", missNote: "You kept jogging with a coworker inside the fence. A second person entering the cell is answered with the pendant e-stop first.", wrongNote: "Not that — someone walking into the cell is answered with the e-stop in your hand." },
    { id: "speed-jump", kind: "Unexpected speed", after: "enable-hold", delay: 3, seconds: 11, alert: "The arm has started moving faster than the reduced speed on the pendant readout.", cue: "Release the enabling device.", target: "enable-release", why: "A speed the readout did not promise means the mode, the override or the controller is not in the state you checked, and the enabling device is built so that opening your hand stops motion at once; releasing it costs nothing and investigating with the arm still moving costs the arm's reach.", missNote: "The arm kept moving faster than reduced speed. An unexpected speed is answered by letting go of the enabling device.", wrongNote: "Not that — unexpected motion under manual control is answered by releasing the enabling device." },
  ],

  steps: [
    { id: "teach-plan", kind: "select", target: "teach-plan-sheet", title: "Read the teach plan and risk assessment", cue: "Read the teach plan: which points change, who is the second person, where the escape route runs.", why: "Teaching inside a cell is the one time a person stands within the arm's reach while it can move, so the risk assessment names the mode, the second person at the outside stop and the route out, and a programmer who starts without reading it is relying on how yesterday's cell was set up rather than how this one is." },
    { id: "ppe-teach", kind: "sequence", anyOrder: true, targets: ["glasses-teach", "gloves-teach", "boots-teach"], itemNames: { "glasses-teach": "safety glasses", "gloves-teach": "snug gloves, no cuffs", "boots-teach": "safety boots" }, title: "Dress for the cell", cue: "Safety glasses, snug gloves without loose cuffs, safety boots.", why: "Inside a cell the floor carries fixtures, cable tracks and the base of the arm, and the tool can carry a part with edges; glasses for the part, boots for the fixtures, and gloves that fit so a cuff cannot be caught between the tool and the work while you lean in to see a point." },
    { id: "mode-select", kind: "gauge", target: "mode-selector", title: "Select manual reduced speed", cue: "Turn the mode selector to manual reduced speed and commit when the pendant reads it back.", why: "Reduced speed is what makes a jog mistake inside the cell survivable: the arm moves slowly enough to let go, step back or stop it, and the setting is confirmed on the pendant screen because a selector can sit in a detent that the controller did not accept.", gauge: { label: "MODE", speed: 0.6, green: [0.4, 0.58], readout: (t) => (t > 0.4 && t < 0.58 ? "manual reduced" : "check mode"), missNote: "The pendant does not read manual reduced speed. Nobody enters until it does." } },
    { id: "pendant-estop-test", kind: "select", target: "pendant-estop", title: "Prove the pendant e-stop", cue: "Press the pendant e-stop, watch the stack light drop to red, then reset it.", why: "The stop in your hand is the one you will reach for inside the cell, and the only way to know that today's pendant, cable and safety circuit stop this arm is to press it once while nothing is at stake; a stop that has not been tried is a guess." },
    { id: "enable-test", kind: "sequence", anyOrder: false, targets: ["enable-mid", "enable-release", "enable-panic"], itemNames: { "enable-mid": "middle position: motion allowed", "enable-release": "released: motion stops", "enable-panic": "squeezed through: motion stops" }, outOfOrderNote: "Out of order — prove the middle position first, then that releasing stops, then that squeezing through stops.", title: "Test the enabling device's three positions", cue: "Prove the enabling device: motion only in the middle, stopped when released, stopped when squeezed through.", why: "The three-position enabling device protects against two reflexes at once — letting go and clenching — and both are tested before teaching because a switch that only stops on release leaves the clench, which is the reflex a startled hand actually makes, unprotected." },
    { id: "second-person", kind: "select", target: "outside-estop-post", title: "Station the second person at the outside e-stop", cue: "Have the second person stand at the outside e-stop with a clear view of you and the arm.", why: "The person inside watches the tool and the point; the person outside watches the person. A second person at a stop they can reach without stepping through the gate is how a slip, a snag or a collapse inside the cell gets a stop pressed by someone who is not the one in trouble." },
    { id: "find-route", kind: "find", noHint: true, targets: ["part-cart-in-route"], target: "part-cart-in-route", itemNames: { "part-cart-in-route": "part cart parked across the escape route" }, itemNotes: { "part-cart-in-route": "Roll the cart outside the fence before anyone enters; the route out is kept clear for the whole teach session." }, decoyNotes: { "pendant-cable-loop": "The pendant cable hangs on its hook clear of the floor. Nothing to move there today.", "fixture-stand": "The fixture stand is where it is bolted and the route runs past it. It stays." }, title: "Find what blocks the escape route", cue: "Find what blocks the escape route inside the cell.", why: "An escape route inside a cell is the path you take when the arm does something you did not teach it, and it has to be walkable without looking down; a cart, a cable or a crate across it turns a step back into a fall under a moving arm." },
    { id: "position-mark", kind: "drag", target: "stand-marker", drag: { to: "stand-spot", radius: 0.4, missNote: "Not placed — the standing mark goes where you can see the tool and still step back out of reach." }, title: "Set your standing mark", cue: "Place the standing mark where you can see the tool centre point and step back out of the arm's reach.", why: "Where you stand decides whether a wrong jog comes toward you or past you; the mark goes where the tool is visible, the arm cannot trap you against the fence or the fixture, and one step back takes you out of reach — chosen before the first move, not improvised during it." },
    { id: "enable-hold", kind: "hold", target: "enable-mid", seconds: 5, title: "Hold the enabling device in the middle", cue: "Hold the enabling device in its middle position and watch the pendant show motion allowed.", why: "Every jog inside the cell happens only while the enabling device sits in its middle position, so the hand learns the grip before the arm moves: light enough not to squeeze through, firm enough not to drop, and watched on the readout rather than felt.", holdBreakNote: "The enabling device left its middle position. Settle the grip before the arm moves." },
    { id: "jog-track", kind: "track", target: "speed-readout", seconds: 8, title: "Jog to the new point inside reduced speed", cue: "Jog the tool toward the new point, keeping the readout inside the reduced-speed band.", why: "The override and the jog increment both change how far the arm travels per key press, and a programmer watching the point can creep the speed up without noticing; keeping the readout inside the band is how a teach move stays a move you can stop with your hand.", track: { start: 0.45, green: [0.32, 0.56], rise: 0.4, fall: 0.45, drift: 0.13, label: "SPEED", readout: (v) => (v < 0.32 ? "creeping" : v > 0.56 ? "over reduced" : "reduced") }, holdBreakNote: "The speed left the reduced band. Release, re-check the override and jog again." },
    { id: "record-point", kind: "select", target: "record-key", title: "Record the point", cue: "Record the taught point and read its label back on the pendant.", why: "A point recorded under the wrong label is a path the arm will run to the wrong place at full speed in automatic; reading the label back while you are still inside and slow is the cheapest moment to catch it." },
    { id: "exit-order", kind: "sequence", anyOrder: false, targets: ["step-out", "close-gate", "auto-restore"], itemNames: { "step-out": "step out through the gate", "close-gate": "close and latch the gate", "auto-restore": "return the mode to automatic from outside" }, outOfOrderNote: "Out of order — step out, latch the gate, then select automatic from outside.", title: "Leave the cell before restoring automatic", cue: "Step out, latch the gate, then and only then turn the mode selector back to automatic.", why: "Automatic mode is the arm running its programme at its programmed speed, and the order exists so that the first automatic cycle can never start with the person who taught the path still inside: out, gate latched and interlock made, then the selector." },
    { id: "pendant-hook", kind: "select", target: "pendant-hook", title: "Hang the pendant on its hook", cue: "Hang the pendant on its hook outside the fence with the cable off the floor.", why: "A pendant left on a fixture inside the cell is a reason for the next person to open the gate in automatic to fetch it, and a cable on the floor is the snag the escape route check just removed; the hook outside is where the pendant lives between teach sessions." },
  ],

  build(root) {
    const ACC = RTTP_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floor = box(g, 9.4, 0.12, 9.4, 0, 0.06, 0, 0xffffff, { rough: 0.7 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#6b747b", line: "#4f575d" }), { repeat: 5, px: 512 }), { rough: 0.7, metal: 0.05, color: 0xffffff });
    const wall = box(g, 9.4, 4.4, 0.2, 0, 2.2, -7.3, 0xffffff, { rough: 0.75 });
    wall.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 6, cols: 9, block: 0x8a949c }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const walk = box(g, 2.2, 0.03, 1.0, -3.4, 0.13, 3.2, 0xffffff, { rough: 0.7, cast: false });
    walk.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "teach cell — procedural, generic industrial arm", -3.4, 3.9, -7.15, { css: "#f0a63a", w: 0.66 });
    const cell = robotCell(g, 0, 0, -4.3, {});
    const P = cell.userData.parts ?? {};
    // the controller cabinet beside the cell, the mode selector and the pendant hook on its door
    box(g, 0.7, 1.7, 0.5, 3.0, 0.85, -4.6, 0x9aa2a8, { rough: 0.5, metal: 0.4 });
    box(g, 0.6, 1.5, 0.02, 3.0, 0.85, -4.34, 0x7f8a92, { rough: 0.5, metal: 0.3 });
    const stack = []; for (let i = 0; i < 3; i++) stack.push(cyl(g, 0.05, 0.05, 0.08, 3.0, 1.82 + i * 0.09, -4.6, [0x3fc26a, 0xffab2e, 0xd8322c][i], { emissive: [0x16b04a, 0x000000, 0x000000][i], ei: 0.9, seg: 12 }));
    // the pendant on a cable near the gate
    const pendant = box(g, 0.22, 0.3, 0.06, 2.1, 1.25, -2.0, 0x2b2f34, { rough: 0.5 });
    box(g, 0.16, 0.12, 0.012, 2.1, 1.3, -1.965, 0x1d2329, { rough: 0.3, emissive: 0x16303a, ei: 0.4 });
    const cableLoop = cyl(g, 0.012, 0.012, 1.4, 2.4, 0.9, -2.3, 0x1d2329, { rough: 0.6, seg: 6 });
    cableLoop.rotation.z = 0.5;
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#f0a63a", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("teach-plan-sheet", "teach plan + risk assessment", -1.68, 1.47, "box", 0xd8a63a);
    put("glasses-teach", "safety glasses", -2.09, 0.9, "box", 0x2b2f34);
    put("gloves-teach", "snug gloves", -2.25, 0.24, "ball", 0x8a6a3a);
    put("boots-teach", "safety boots", -2.13, -0.42, "cyl", 0x3a3a3a);
    put("mode-selector", "mode selector", -1.74, -1.01, "meter");
    put("pendant-estop", "pendant e-stop", -1.14, -1.45, "cyl", 0xd2312b);
    put("enable-mid", "enabling: middle", -0.4, -1.68, "ball", 0x59c97b);
    put("enable-release", "enabling: released", 0.4, -1.68, "ball", 0xf0b323);
    put("enable-panic", "enabling: squeezed through", 1.14, -1.45, "ball", 0xf0645b);
    put("speed-readout", "speed readout", 1.74, -1.01, "meter");
    put("record-key", "record point", 2.13, -0.42, "box", 0x3a78c9);
    put("step-out", "step out", 2.25, 0.24, "cyl", 0x59c97b);
    put("close-gate", "latch the gate", 2.09, 0.9, "box", 0xf0b323);
    put("auto-restore", "automatic: from outside", 1.68, 1.47, "cyl", 0x2f6fb0);
    put("pendant-hook", "pendant hook", 2.9, 1.9, "box", 0x53585e);
    put("outside-estop-post", "outside e-stop + second person", -2.9, 1.9, "cyl", 0xd2312b);
    // the standing mark (drag) and its spot inside the cell, just inside the gate
    cap["stand-marker"] = cyl(g, 0.16, 0.16, 0.02, -0.9, 0.96, -2.6, 0xf0a63a, { rough: 0.6, emissive: 0xf0a63a, ei: 0.3 });
    reg(hits, cap["stand-marker"], "stand-marker");
    cap["stand-spot"] = group(g, 0.5, 0.05, -3.0);
    box(cap["stand-spot"], 0.4, 0.01, 0.4, 0, 0, 0, 0x2b2f34, { rough: 0.6, cast: false }); box(cap["stand-spot"], 0.3, 0.012, 0.3, 0, 0.004, 0, 0x59c97b, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "stand here: tool visible, one step out of reach", 0.5, 1.4, -3.0, { css: "#f0a63a", w: 0.6 }); reg(hits, cap["stand-spot"], "stand-spot");
    // the find targets: a part cart in the route, the hanging cable loop, the fixture stand
    const cart = group(g, -1.2, 0, -2.9);
    box(cart, 0.6, 0.05, 0.4, 0, 0.75, 0, 0x6f7a83, { rough: 0.5, metal: 0.4 }); for (const sx of [-0.27, 0.27]) for (const sz of [-0.17, 0.17]) { box(cart, 0.03, 0.7, 0.03, sx, 0.38, sz, 0x53585e, { rough: 0.5 }); cyl(cart, 0.05, 0.05, 0.03, sx, 0.03, sz, 0x1d2329, { rough: 0.6, seg: 10 }); }
    for (let i = 0; i < 4; i++) box(cart, 0.1, 0.08, 0.1, -0.2 + i * 0.13, 0.82, 0, [0xd8a63a, 0x3a78c9][i % 2], { rough: 0.5 });
    cap["part-cart-in-route"] = cart; reg(hits, cart, "part-cart-in-route");
    cap["pendant-cable-loop"] = cableLoop; reg(hits, cableLoop, "pendant-cable-loop");
    cap["fixture-stand"] = box(g, 0.3, 0.6, 0.3, 1.0, 0.3, -3.5, 0x53585e, { rough: 0.5, metal: 0.4 }); reg(hits, cap["fixture-stand"], "fixture-stand");
    // the pendant readout panel
    const readout = holoPanel(g, 0.72, 0.48, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,14,6,0.92)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f0a63a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbefdc"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PENDANT · TEACH MODE RULES", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#e3c89a";
      ["Manual reduced speed, read back", "Enabling device: middle = move", "One pendant has motion control", "Automatic only from outside"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, readout, "readout-panel");
    // hazard boards
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("auto-mode-hazard", "ENTER IN\nAUTO", -1.22, 2.96, 2.75);
    hazard("tape-enable-hazard", "TAPE THE\nENABLE", 1.22, 2.96, -2.75);
    hazard("second-pendant-hazard", "SECOND\nPENDANT", -3.04, -1.01, 1.25);
    hazard("gate-prop-hazard", "PROP THE\nGATE", 3.04, -1.01, -1.25);
    // teach-session board
    const sessSign = group(g, 2.9, 0, 0.4, -0.9);
    box(sessSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const sessFace = decal(sessSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("TEACH\nIN PROGRESS", { bg: "#11181f", accent: "#f0a63a", scale: 0.24 }), { px: 320 });
    // tool crib along the wall
    for (let i = 0; i < 18; i++) box(g, 0.5, 0.3, 0.35, -4.0 + (i % 6) * 0.6, 0.3 + Math.floor(i / 6) * 0.45, -6.8, [0x6d767e, 0xb08a4a, 0xf0a63a][i % 3], { rough: 0.8 });
    for (const y of [0.14, 0.59, 1.04]) box(g, 3.8, 0.04, 0.45, -2.5, y, -6.8, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 6; i++) cyl(g, 0.12, 0.12, 0.5, 2.4 + (i % 3) * 0.3, 0.25, -6.6 - Math.floor(i / 3) * 0.3, 0x3a78c9, { rough: 0.5, seg: 12 });
    lockTag(g, 3.2, 1.0, -4.33, {});
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const second = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(second, "second person", 0, 1.95, 0.15, { css: "#f0a63a", w: 0.34 });
    const coworker = standingFigure(g, 3.9, -2.4, { ry: -1.4, cloth: 0x5a6b7a, helmet: 0x5a6b7a });
    holoTag(coworker, "coworker", 0, 1.95, 0.15, { css: "#f0a63a", w: 0.26 });
    const faultOn = new URLSearchParams(globalThis.location?.search ?? "").get("fault") === "pendant-cable";
    const fStep = SIM_RT_TEACH_PENDANT_SAFE_JOGGING.steps.find((s) => s.id === "find-route");
    const fDecl = SIM_RT_TEACH_PENDANT_SAFE_JOGGING.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.target = fStep.targets[0]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { cableLoop.position.set(-0.6, 0.3, -2.7); cableLoop.rotation.z = 1.5; cart.position.set(-3.6, 0, -3.0); holoTag(g, "Escape route: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 }); }
    faultLamp.visible = faultOn;
    let auto = true, armPhase = 0;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "coworker-reaches") { faultLamp.visible = true; coworker.position.set(1.6, 0, -2.0); P.gate && (P.gate.rotation.y = 1.2); }
        if (it.id === "speed-jump") { cap["speed-readout"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 }); stack[1].material = mat(0xffab2e, { emissive: 0xffab2e, ei: 1.2 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coworker-reaches") { faultLamp.visible = false; coworker.position.set(3.9, 0, -2.4); P.gate && (P.gate.rotation.y = 0); cap["pendant-estop"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); }
        if (it.id === "speed-jump") { cap["speed-readout"].material = mat(0x59c97b, { rough: 0.5 }); stack[1].material = mat(0xffab2e, { rough: 0.5 }); cap["enable-release"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "mode-select") { auto = false; repaint(cap["mode-selector"].userData.screen, signFace("T1", { bg: "#1c140a", accent: "#f0a63a", fg: "#fbefdc", scale: 0.5 })); stack[0].material = mat(0x3fc26a, { rough: 0.5 }); stack[1].material = mat(0xffab2e, { emissive: 0xffab2e, ei: 0.9 }); }
        if (step.id === "pendant-estop-test") stack[2].material = mat(0xd8322c, { emissive: 0xd8322c, ei: 0.9 });
        if (step.id === "find-route") cart.position.set(-3.6, 0, -1.6);
        if (step.id === "record-point") repaint(sessFace, signFace("POINT\nRECORDED", { bg: "#11181f", accent: "#59c97b", fg: "#bff7d4", scale: 0.24 }));
        if (step.id === "exit-order") { auto = true; stack[0].material = mat(0x3fc26a, { emissive: 0x16b04a, ei: 0.9 }); stack[1].material = mat(0xffab2e, { rough: 0.5 }); stack[2].material = mat(0xd8322c, { rough: 0.5 }); }
        if (step.id === "pendant-hook") pendant.position.set(2.9, 1.15, 1.9);
      },
      onHazard() {},
      animate(t, dt, session) {
        second.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        armPhase += dt * (auto ? 0.8 : 0.25);
        if (P.base) P.base.rotation.y = Math.sin(armPhase) * 0.6;
        if (P.upperArm) P.upperArm.rotation.x = Math.sin(armPhase * 0.7) * 0.25;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "mode-select") repaint(cap["mode-selector"].userData.screen, signFace(gg.t > 0.4 && gg.t < 0.58 ? "T1" : "AUTO?", { bg: "#1c140a", accent: gg.t > 0.4 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#fbefdc", scale: 0.5 }));
      },
    };
  },
};
