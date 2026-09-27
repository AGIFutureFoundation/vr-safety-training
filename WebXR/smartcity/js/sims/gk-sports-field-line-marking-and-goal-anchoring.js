import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, grassFace, palette, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sports-Field Line Marking & Goal Anchoring VR — Grounds &
// Landscaping.
//
// A youth sports field striped and its goals anchored before the first
// practice: the field walked for a sprinkler head and a divot before the
// liner ever rolls, the paint label read and the hopper filled and
// calibrated, the lines run along a staged string line at a steady rate, and
// the goal anchored to the manufacturer's own instructions — every stake and
// every ground sleeve the label actually calls for, never skipped because
// the goal looks stable standing on its own. No field dimension, paint
// coverage rate or anchoring spec this platform is not certain of appears
// here — only "per the field's own layout diagram" and "per the goal
// manufacturer's instructions".

const GKF_ACCENT = 0xf2c14b;
const GKF_PAL = palette("grounds");

export const SIM_GK_SPORTS_FIELD_LINE_MARKING_AND_GOAL_ANCHORING = {
  id: "gk-sports-field-line-marking-and-goal-anchoring",
  index: "gk-09",
  domain: "Grounds & Landscaping",
  trade: "Grounds sports-turf crew member — AFSCME parks and grounds crew",
  category: "Grounds & Landscaping",
  district: "open-range",
  weather: "clear",
  certification: "CPSC guidance on movable soccer goal safety — anchoring before use and never climbing or hanging on a goal; OSHA 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.133 eye and face protection and 29 CFR 1910.1200 hazard communication; NIOSH guidance on manual material handling; AFSCME parks and grounds member training",
  name: "Sports-Field Line Marking & Goal Anchoring",
  title: simTitle("Sports-Field Line Marking & Goal Anchoring"),
  tagline: "A youth sports field striped and its goals anchored: the field walked before the liner rolls, the paint label read and the hopper calibrated, the lines run along a staged string at a steady rate, and every stake and sleeve the goal's own instructions call for actually set",
  accent: GKF_ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "field-ready", name: "Field Ready", note: "Field walked, paint label read, lines run straight and steady, and the goal anchored to the manufacturer's own instructions" },

  supportLine: "your union steward or the parks department's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Field Crew", "Field Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "anchored-fully", name: "Fully Anchored", note: "Never skipped a stake or a ground sleeve the instructions called for", test: AWARD.stepClean("anchor-the-goal") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-line", name: "Steady Line", note: "Held the paint flow gauge and the marking pass near band centre", test: AWARD.precise(0.7) },
      { id: "field-walked", name: "Field Walked", note: "Found every hazard on the pre-marking walk", test: AWARD.stepClean("walk-the-field") },
    ],
    challenges: [
      { id: "quick-field", name: "Quick Field", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "climb-on-unanchored-goal": "You climbed on the goal before it was anchored. CPSC's own guidance on movable soccer goals exists because an unanchored goal can tip forward onto anyone hanging from the crossbar, and the goal is not safe to touch that way until every stake and sleeve the instructions call for is actually in the ground.",
    "reach-into-hopper-running": "You reached into the paint hopper while the agitator was still turning. The mechanism that keeps striping paint mixed and flowing evenly does not stop just because a hand is near it, and clearing a clog by feel instead of shutting the machine down first is how that hand finds out the hard way.",
    "spray-toward-bystander": "You aimed the marking wand toward a bystander instead of the turf. Striping paint is meant to mark grass, not people, and the operator choosing where the wand points is the only thing keeping a passer-by from walking away with paint on their clothes or in their eyes.",
    "anchor-skip-sleeve": "You skipped one of the ground sleeves the goal's own instructions call for. A goal anchored at some but not all of its rated points is not a goal that has actually met the manufacturer's own stability spec — it is one that looks anchored right up until the point nobody set is the one that gives way.",
  },

  lateNotes: {
    "sprinkler-head-in-path": "A sprinkler head sitting in the planned line path is exactly what a striping machine's wheel catches and damages if the field is not walked before the first pass.",
    "ground-sleeve-check": "The goal's own instructions set how many stakes or sleeves this specific model actually needs — a goal that looks stable on two anchors is not the same as one built and rated for four.",
  },

  interrupts: [
    {
      id: "wind-blows-spray-off-line",
      kind: "Drift risk",
      after: "mark-the-goal-arc", delay: 3, seconds: 10,
      alert: "A gust has caught the marking wand's spray and is carrying it off-line toward the sideline where spectators will stand.",
      cue: "Shut the paint flow off at the hopper before the drift reaches the sideline.",
      target: "flow-shutoff",
      why: "Paint drifting toward where spectators will stand is not a line anyone asked for, and shutting the flow off at the hopper the moment the gust catches it is what stops the mess before it reaches clothing, shoes or a folding chair someone set up early.",
      missNote: "The spray kept drifting toward the sideline while the flow stayed on. Wind-carried paint does not stay inside the field the way a straight line would.",
      wrongNote: "Not that — the flow shutoff is what this gust needs, before the drift reaches the sideline.",
    },
    {
      id: "child-runs-onto-field",
      kind: "Bystander incursion",
      after: "run-the-marking-lines", delay: 4, seconds: 11,
      alert: "A child has run onto the field chasing a loose ball, straight toward the marking machine's path.",
      cue: "Hit the emergency stop before the machine reaches them.",
      target: "emergency-stop-lever",
      why: "A child chasing a ball is watching the ball, not the marking machine, and the emergency stop is the one control that actually removes the risk immediately — waiting to see if they notice the machine on their own is not a plan a moving liner can afford to run.",
      missNote: "The marking machine kept moving toward the child. A machine that size does not stop the instant someone notices it should.",
      wrongNote: "Not that — the emergency stop is what this moment needs, before the machine continues.",
    },
  ],

  steps: [
    {
      id: "read-field-layout", kind: "select", target: "layout-board",
      title: "Read the field layout diagram",
      cue: "Check the field's own layout diagram for the line pattern and goal placement before marking anything.",
      why: "The layout diagram is where the field's own dimensions and goal placement are set for this sport and this site — reading it before the first line is marked is what keeps the field consistent with what the league or the school actually needs, not an approximation from memory.",
    },
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["eye-protection", "work-gloves"],
      itemNames: { "eye-protection": "eye protection", "work-gloves": "work gloves" },
      title: "Suit up before handling the paint",
      cue: "Eye protection and work gloves before the paint hopper is opened.",
      why: "Striping paint splashes when a hopper is filled and mists slightly at the wand, and eye protection and gloves are what keep that contact off skin and out of eyes during the one part of the job where the paint is not yet safely contained in the machine.",
    },
    {
      id: "walk-the-field", kind: "find", noHint: true,
      targets: ["sprinkler-head-in-path", "turf-divot", "old-line-residue"],
      itemNames: { "sprinkler-head-in-path": "the sprinkler head in the planned line path", "turf-divot": "the uneven divot in the turf", "old-line-residue": "the old line residue that will bleed through" },
      itemNotes: {
        "sprinkler-head-in-path": "A sprinkler head in the line path is exactly what a striping machine's wheel catches and damages if it is not found first.",
        "turf-divot": "A divot along the planned line throws the machine's wheel off level and leaves a crooked stretch in an otherwise straight line.",
        "old-line-residue": "Old paint residue bleeding through a fresh line reads as a double line to anyone trying to follow it during play.",
      },
      decoyNotes: { "clear-turf-strip": "That stretch of turf is level, clean and ready for a straight line. Nothing to flag there." },
      title: "Walk the field before marking anything",
      cue: "Three things along this field change the marking plan — find them before the liner ever rolls.",
      why: "A field that looks ready from the sideline is not the same thing as a field someone has actually walked, and a sprinkler head, a divot or old paint bleeding through are exactly what a walk-down catches before the striping machine finds them the hard way.",
    },
    {
      id: "stage-line-marker", kind: "sequence", anyOrder: true,
      targets: ["hopper-fill", "wheel-calibration-check"],
      itemNames: { "hopper-fill": "fill the hopper per the label", "wheel-calibration-check": "check the wheel calibration" },
      title: "Stage the line marking machine",
      cue: "Fill the hopper to the label's own level and confirm the wheel calibration before the first pass.",
      why: "A hopper filled past the label's own level splatters on the first bump, and a wheel that has not been checked for calibration lays a line width nobody asked for — confirming both before the first pass is what makes the whole field consistent from the first line to the last.",
    },
    {
      id: "read-paint-label", kind: "select", target: "paint-label",
      title: "Read the paint label",
      cue: "Check the paint's own label and safety data sheet before filling the hopper.",
      why: "The paint label sets the fill level, the flow setting and the ventilation the manufacturer actually calls for — reading it before the hopper is filled is what keeps this step following the label rather than habit from a different product used last season.",
    },
    {
      id: "stage-string-line", kind: "drag", target: "string-line",
      title: "Stage the reference string line",
      cue: "Carry the string line from the reel to the corner marker before the first pass.",
      why: "A string line staged from a fixed reference point before the machine ever starts is what keeps the first pass straight — chasing a straight line by eye alone is how a field ends up with a stripe that wanders exactly where the layout diagram did not intend it to.",
      drag: { to: "corner-marker-socket", radius: 0.4, missNote: "Not at the corner marker — carry the string line to where the reference point actually is." },
    },
    {
      id: "run-the-marking-lines", kind: "drive", target: "marker-rig",
      title: "Run the marking lines along the string",
      cue: "Follow the staged string line at a steady pace, watching for anyone stepping onto the field.",
      why: "The string line is the reference the whole field's geometry depends on, and a steady pace along it — with regular checks for anyone approaching — is what keeps the line straight and even while still catching a bystander in time to stop before they are in the machine's path.",
      holdBreakNote: "Off the string line or outside the pace band. Settle back onto the reference line before continuing the pass.",
      drive: {
        path: [[-1.6, 1.4], [-0.8, 1.4], [0, 1.4], [0.8, 1.4], [1.6, 1.4]],
        speedBand: [2, 5], laneWidth: 0.5, graceSeconds: 1.6, checkWindow: 1.0, sceneRate: 0.2,
        bandLabel: "marking pace, per the layout diagram",
        checks: [
          { at: 2, kind: "mirror-left", note: "Check for anyone approaching from the sideline as the pass continues." },
        ],
        controls: { emergencyStop: "emergency-stop-lever" },
        laneNote: "Off the string line. A line this far off the reference reads as crooked from anywhere in the stands.",
      },
    },
    {
      id: "check-paint-flow", kind: "gauge", target: "flow-gauge",
      title: "Check the paint flow rate",
      cue: "Read the flow gauge and commit only inside the label's own coverage band.",
      why: "A flow set too low leaves a thin, patchy line that fades within a week; set too high, it puddles and bleeds past the line's own edge — the gauge is what confirms the flow is actually inside the label's coverage band before the whole field is marked at the wrong rate.",
      gauge: {
        label: "PAINT FLOW RATE", speed: 0.58, green: [0.42, 0.66],
        readout: (t) => `${Math.round(40 + t * 60)}% of label rate`,
        missNote: "Outside the label's coverage band. Adjust the flow and let the reading settle before committing it.",
      },
    },
    {
      id: "open-hopper-valve", kind: "turn", target: "hopper-valve",
      title: "Open the hopper valve",
      cue: "Turn the valve open smoothly once the wand is aimed at the turf.",
      why: "Opening the valve only once the wand is already aimed at open turf is what keeps that first burst of paint from landing wherever the wand happened to be pointed while the valve was still being adjusted.",
      turn: { turns: 0.4, axis: "z", label: "HOPPER VALVE" },
    },
    {
      id: "mark-the-goal-arc", kind: "hold", target: "marker-handle", seconds: 4,
      title: "Mark the goal arc",
      cue: "Hold the wand steady through the full curved pass at the goal mouth.",
      why: "The curved arc at the goal mouth is the one stretch of line that cannot be laid down in a straight push — holding the wand steady through the whole curve, rather than rushing it, is what keeps that arc reading clean instead of faceted like a line drawn in short straight segments.",
      holdBreakNote: "Released the wand before the arc finished. Hold it steady through the whole curved pass, every time.",
    },
    {
      id: "confirm-dry-time", kind: "select", target: "wet-paint-sign",
      title: "Post the wet-paint notice",
      cue: "Set the wet-paint sign before opening the field, until the label's own dry time has passed.",
      why: "A line that looks dry from a few feet away can still transfer onto cleats or a ball for longer than it looks — posting the notice until the label's own dry time has actually passed is what keeps a fresh line from being smeared before it has set.",
    },
    {
      id: "anchor-the-goal", kind: "sequence", anyOrder: true,
      targets: ["stake-anchor-a", "stake-anchor-b", "ground-sleeve-check"],
      itemNames: { "stake-anchor-a": "stake anchor, near post", "stake-anchor-b": "stake anchor, far post", "ground-sleeve-check": "ground sleeve confirmed seated" },
      title: "Anchor the goal at every point",
      cue: "Set both stake anchors and confirm the ground sleeve is fully seated before calling the goal safe.",
      why: "CPSC's own guidance on movable soccer goals exists because a goal anchored at some but not all of its rated points is not actually stable — setting every stake and confirming the ground sleeve is seated is what turns a goal from something that looks anchored into one that has actually met its own manufacturer's stability spec.",
    },
    {
      id: "confirm-anchor-instructions", kind: "select", target: "anchor-instructions-tag",
      title: "Confirm against the manufacturer's instructions",
      cue: "Check the goal's own anchoring instructions tag against what was actually installed.",
      why: "The manufacturer's instructions are the one document that says how many anchors this specific goal model needs and where — checking the installed anchors against that tag is what confirms the job matches the spec rather than what looked like enough.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the field prep log",
      cue: "Log the marking pass, the flow reading and the anchor confirmation before leaving the field.",
      why: "The field prep log is what the next crew and the next inspection both read — a field marked and anchored cleanly but never logged leaves nothing behind to prove the goal was actually anchored to the manufacturer's own spec.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GKF_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 12, a: "#3d7a3a", b: "#457f44" }), { repeat: 7, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );

    // ------------------------------------------------------------------ field hazards
    const sprinklerHead = cyl(g, 0.03, 0.03, 0.06, -0.8, 0.15, 1.4, 0x6f7a6f, { rough: 0.5, metal: 0.3, seg: 10 });
    reg(hits, sprinklerHead, "sprinkler-head-in-path");
    const divot = box(g, 0.2, 0.02, 0.15, 0.4, 0.15, 1.3, 0x3a4a2a, { rough: 0.8, cast: false });
    reg(hits, divot, "turf-divot");
    const oldLine = box(g, 0.5, 0.005, 0.06, -1.4, 0.145, 1.0, 0xb8b0a0, { rough: 0.7, cast: false });
    reg(hits, oldLine, "old-line-residue");
    const clearStrip = group(g, 0.9, 0.15, 1.3);
    reg(hits, clearStrip, "clear-turf-strip");
    const clearStripMesh = box(clearStrip, 0.4, 0.008, 0.2, 0, 0, 0, 0x3f7a3f, { rough: 0.85, cast: false });

    // ------------------------------------------------------------------ paperwork
    const layoutBoard = holoPanel(g, 0.58, 0.42, -2.4, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("FIELD LAYOUT", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Dimensions: per the layout", "Goal placement: per the layout", "Anchoring: per the manufacturer"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: 0.7, accent: GKF_ACCENT });
    reg(hits, layoutBoard, "layout-board");

    // ------------------------------------------------------------------ line marker
    const marker = group(g, -1.6, 0.14, 1.6, -1.4);
    const hopper = box(marker, 0.3, 0.3, 0.3, 0, 0.35, 0, GKF_ACCENT, { rough: 0.5, metal: 0.2 });
    reg(hits, hopper, "reach-into-hopper-running");
    const hopperFillCap = cyl(marker, 0.05, 0.05, 0.03, 0, 0.51, 0, 0xf2c14b, { rough: 0.5, metal: 0.3, seg: 12 });
    reg(hits, hopperFillCap, "hopper-fill");
    const wheelA = cyl(marker, 0.1, 0.1, 0.05, -0.16, 0.1, 0, 0x1c1d1f, { rough: 0.8, seg: 16 });
    reg(hits, wheelA, "wheel-calibration-check");
    const wheelB = cyl(marker, 0.1, 0.1, 0.05, 0.16, 0.1, 0, 0x1c1d1f, { rough: 0.8, seg: 16 });
    const hopperValveObj = cyl(marker, 0.02, 0.02, 0.05, -0.1, 0.35, 0.16, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, hopperValveObj, "hopper-valve");
    const flowShutoffObj = box(marker, 0.04, 0.06, 0.02, 0.12, 0.35, 0.16, 0xd2312b, { rough: 0.5 });
    reg(hits, flowShutoffObj, "flow-shutoff");
    const wand = group(marker, 0.2, 0.3, 0.2, -0.6);
    cyl(wand, 0.012, 0.012, 0.3, 0, 0.15, 0, 0x2b2f34, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, wand, "marker-handle");
    const nozzleTip = cyl(wand, 0.01, 0.015, 0.05, 0, 0.32, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, nozzleTip, "spray-toward-bystander");
    const emergencyStopObj = box(marker, 0.05, 0.05, 0.03, 0, 0.45, 0.16, 0xd2312b, { rough: 0.5 });
    reg(hits, emergencyStopObj, "emergency-stop-lever");
    reg(hits, marker, "marker-rig");
    holoTag(marker, "line marker", 0, 0.65, 0, { css: "#f2c14b", w: 0.28 });

    const flowInst = instrument(g, 2.4, 0.9, 1.4, { ry: -0.4, idle: "-- %", color: GKF_ACCENT });
    holoTag(flowInst, "paint flow gauge", 0, 0.16, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, flowInst, "flow-gauge");

    const paintLabelStand = group(g, -2.3, 0, 0.6, 0.4);
    box(paintLabelStand, 0.24, 0.32, 0.02, 0, 0.16, 0, 0x2b3138, { rough: 0.6 });
    const paintLabelFace = decal(paintLabelStand, 0.2, 0.26, 0, 0.18, 0.011, signFace("PAINT LABEL\nSDS ON FILE", { bg: "#0d1c24", accent: "#f2c14b", scale: 0.22 }), { px: 192 });
    reg(hits, paintLabelFace, "paint-label");

    const stringLineReel = group(g, -2.5, 0, 1.6, 0.4);
    cyl(stringLineReel, 0.06, 0.06, 0.1, 0, 0.05, 0, 0xf2f2ea, { rough: 0.6, seg: 14 });
    reg(hits, stringLineReel, "string-line");
    const cornerSocket = group(g, -1.7, 0, 1.3);
    hits["corner-marker-socket"] = cornerSocket;

    const wetPaintSignObj = box(g, 0.4, 0.3, 0.02, 1.6, 0.3, 0.6, 0xf2c14b, { rough: 0.6 });
    reg(hits, wetPaintSignObj, "wet-paint-sign");

    // ------------------------------------------------------------------ goal
    const goal = group(g, 1.4, 0, -0.6, -0.3);
    for (const sx of [-0.5, 0.5]) box(goal, 0.05, 0.6, 0.05, sx, 0.3, 0, 0xf2f2ea, { rough: 0.6 });
    box(goal, 1.0, 0.05, 0.05, 0, 0.6, 0, 0xf2f2ea, { rough: 0.6 });
    const crossbar = box(goal, 1.0, 0.02, 0.02, 0, 0.6, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, crossbar, "climb-on-unanchored-goal");
    const stakeA = cyl(goal, 0.015, 0.015, 0.15, -0.5, 0.02, 0.15, 0x9aa1a8, { rough: 0.5, metal: 0.6, seg: 10 });
    reg(hits, stakeA, "stake-anchor-a");
    const stakeB = cyl(goal, 0.015, 0.015, 0.15, 0.5, 0.02, 0.15, 0x9aa1a8, { rough: 0.5, metal: 0.6, seg: 10 });
    reg(hits, stakeB, "stake-anchor-b");
    const sleeve = cyl(goal, 0.03, 0.03, 0.06, 0, 0.02, -0.1, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 12 });
    reg(hits, sleeve, "ground-sleeve-check");
    const skipSleeveHazard = box(goal, 0.06, 0.02, 0.06, 0.3, 0.02, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, skipSleeveHazard, "anchor-skip-sleeve");
    const anchorTag = decal(goal, 0.14, 0.09, -0.5, 0.4, 0.026, signFace("ANCHOR PER\nMANUFACTURER", { bg: "#2a1a0a", accent: "#f2c14b", scale: 0.26 }), { px: 192 });
    reg(hits, anchorTag, "anchor-instructions-tag");
    holoTag(goal, "goal", 0, 0.85, 0, { css: "#f2c14b", w: 0.22 });

    const chest = toolChest(g, 2.6, -0.4, { ry: -0.5, color: GKF_ACCENT });
    const eyeProp = box(chest, 0.1, 0.04, 0.02, -0.2, 0.79, 0.06, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");
    const gloveProp = box(chest, 0.1, 0.05, 0.02, -0.08, 0.79, 0.06, 0x8a6a3a, { rough: 0.8 });
    reg(hits, gloveProp, "work-gloves");

    const closingLog = group(g, 2.7, 0, -2.0, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("FIELD PREP LOG\nOPEN", { bg: "#11181f", accent: "#f2c14b", scale: 0.2 }), { px: 320 });
    holoTag(closingLog, "field prep log", 0, 1.34, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew
    const crewMember = standingFigure(g, 2.2, 2.0, { ry: -2.0, cloth: 0x2b3138, vest: GKF_ACCENT, helmet: 0xf2f2f2 });
    holoTag(crewMember, "field crew", 0, 1.95, 0.15, { css: "#f2c14b", w: 0.28 });

    // Child prop, hidden until the bystander-incursion interrupt fires.
    const child = standingFigure(g, -2.9, -1.4, { ry: 1.8, cloth: 0x59c97b });
    child.visible = false;

    const mist = particles(wand, 14, 0xe8d99a, { size: 0.015, life: 0.4, additive: false, opacity: 0.22 });
    mist.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "wind-blows-spray-off-line") { mist.visible = true; }
        if (it.id === "child-runs-onto-field") { child.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-blows-spray-off-line") { mist.visible = false; }
        if (it.id === "child-runs-onto-field") { child.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walk-the-field") {
          sprinklerHead.material = mat(0x59c97b, { rough: 0.5 });
          divot.material = mat(0x59c97b, { rough: 0.6, cast: false });
          oldLine.material = mat(0x59c97b, { rough: 0.6, cast: false });
        }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("FIELD PREP LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.2 }));
        }
      },
      onHazard(hitId) { if (hitId === "spray-toward-bystander") { mist.visible = true; } },

      animate(t, dt, session) {
        crewMember.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (child.visible) child.position.x = -2.9 + (t % 2) * 0.5;
        if (mist.visible) mist.userData.step(dt, new THREE.Vector3(0.2, 0.1, 0), 0.1, 0.1, 0.05);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-paint-flow") {
          const pct = Math.round(40 + gg.t * 60);
          repaint(flowInst.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.66 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
