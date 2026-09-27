import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, grassFace, palette, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Greens Mowing & Hole Changing VR — Grounds & Landscaping.
//
// A putting green mowed and its cup moved to the day's new position: the
// green walked for a ball mark and a proud sprinkler head before the reel
// ever turns, the mower's own transport lever used crossing the collar
// instead of cutting a scar into it, the height of cut and the bedknife
// clearance actually checked rather than eyeballed, the reel lifted for the
// cart-path crossing, and the new hole cored, cupped and flagged while the
// old one is filled and tamped so nobody finds it with a footstep. No cutting
// height, green speed number or reel RPM this platform is not certain of
// appears here — every one of them is "per the day's mowing chart" or "per
// the superintendent's plan".

const GKG_ACCENT = 0x3f9c5a;
const GKG_PAL = palette("grounds");

export const SIM_GK_GREENS_MOWING_AND_HOLE_CHANGING = {
  id: "gk-greens-mowing-and-hole-changing",
  index: "gk-08",
  domain: "Grounds & Landscaping",
  trade: "Greenkeeper — SEIU grounds and building staff",
  category: "Grounds & Landscaping",
  district: "open-range",
  weather: "clear",
  certification: "ANSI B71 outdoor power equipment safety specifications for reel mowers; OSHA 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.212 machine guarding and 29 CFR 1910.147 control of hazardous energy; NIOSH guidance on mower reel and cutting-unit incidents; SEIU grounds and building staff training",
  name: "Greens Mowing & Hole Changing",
  title: simTitle("Greens Mowing & Hole Changing"),
  tagline: "A putting green mowed and its cup moved: the green walked before the reel turns, the transport lever used crossing the collar, the cut height and bedknife clearance checked, the reel lifted for the cart path, and the new hole cored while the old one is filled and tamped",
  accent: GKG_ACCENT,
  accentCss: "#3f9c5a",
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "green-changed", name: "Green Changed", note: "Green walked, cut height and bedknife checked, the collar crossed on transport, and the new hole cored and cupped while the old one was filled" },

  supportLine: "your union steward or the club's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Greens Mower", "Greenkeeper Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "reel-safe", name: "Reel Safe", note: "Never reached toward the reel while it was turning", test: AWARD.safe },
      { id: "cut-proven", name: "Cut Proven", note: "Held the cut height and bedknife gauge near band centre", test: AWARD.precise(0.7) },
      { id: "hole-filled", name: "Old Hole Filled", note: "Never left the old hole open", test: AWARD.stepClean("fill-old-hole") },
      { id: "clean-round", name: "Clean Round", note: "No unsafe action anywhere in the run", test: AWARD.clean },
    ],
    challenges: [
      { id: "quick-change", name: "Quick Change", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-run", name: "Clean Run", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "sharp-turn-on-green": "You turned the mower sharply on the putting surface with the reel still engaged. A sharp turn under a spinning reel tears the surface it is meant to cut cleanly, and it is exactly the moment a machine already close to the ground is least predictable if a foot or a hand is anywhere near it.",
    "reach-into-reel": "You reached toward the spinning reel to clear clippings while it was still turning. A reel unit's whole job is to cut grass cleanly at speed, and it does not know the difference between grass and fingers reaching in to clear a jam before the reel is actually stopped.",
    "old-hole-unfilled-tripping": "You left the old hole open on the green. An unfilled hole on a putting surface is a rolled ankle waiting for whoever is not looking down at that exact spot, on ground everyone assumes is flat and finished.",
    "cup-cutter-blade-exposed": "You carried the cup cutter with its cutting edge uncovered. A coring blade sharp enough to cut a clean plug out of dense turf does the same thing to a leg it brushes against while being carried from one hole to the next.",
  },

  lateNotes: {
    "ball-mark-unrepaired": "An unrepaired ball mark heals wrong and leaves a scar in the green long after the mowing pattern would otherwise have made it disappear — it gets fixed on the walk-down, not left for someone else.",
    "cut-height-gauge": "The height of cut is what actually determines the day's green speed, not how fast the mower is pushed across the surface.",
  },

  interrupts: [
    {
      id: "cart-approaches-crossing",
      kind: "Path conflict",
      after: "lift-reel-crossing", delay: 3, seconds: 10,
      alert: "A golf cart has come around the corner toward the cart-path crossing while the mower is still on it.",
      cue: "Wave the cart off before it reaches the crossing point.",
      target: "wave-off-signal",
      why: "A mower crossing a cart path with its reel lifted is still a slow-moving obstacle a cart cannot always see coming around a corner, and waving it off immediately is what keeps a blind crossing from becoming a collision neither driver had time to react to.",
      missNote: "The cart kept approaching while the crossing continued. A slow mower and a moving cart sharing one crossing point needs somebody to call it, not assume the other will.",
      wrongNote: "Not that — waving the cart off is what this crossing needs, before anything else about it continues.",
    },
    {
      id: "player-waiting-to-putt",
      kind: "Course conflict",
      after: "mow-the-green", delay: 4, seconds: 11,
      alert: "A golfer has arrived at the green and is waiting to putt while the mowing pattern is still unfinished.",
      cue: "Signal them to hold using the course radio before finishing the last pass.",
      target: "wave-off-lever",
      why: "A mower still working the green and a golfer ready to putt are not compatible for even one more pass, and calling it on the radio — rather than rushing the last pass or waving them onto a green still being cut — is what keeps both the finish and the golfer's safety from being guessed at.",
      missNote: "The mowing continued while the golfer waited to putt on an unfinished green. Rushing the last pass is how a green gets scalped and a golfer gets a mower in their line at the same time.",
      wrongNote: "Not that — the course radio call is what this moment needs, before the last pass continues.",
    },
  ],

  steps: [
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["eye-protection", "ear-protection"],
      itemNames: { "eye-protection": "eye protection", "ear-protection": "ear protection" },
      title: "Suit up before mowing",
      cue: "Eye protection and ear protection before the mower comes off the trailer.",
      why: "A reel mower throws clippings and grit at exactly eye height as it works, and the engine and reel both run loud enough over a full green rotation to matter for hearing — both go on before the first pass, not partway through the green.",
    },
    {
      id: "read-mowing-chart", kind: "select", target: "mowing-chart-board",
      title: "Read the day's mowing chart",
      cue: "Check the day's cutting height and pattern direction before starting the mower.",
      why: "The mowing chart is where the superintendent sets today's cutting height and pattern for a reason tied to tournament prep, recovery from stress, or the weather — following it is what keeps every green on the course reading consistent rather than each one cut to whatever felt right that morning.",
    },
    {
      id: "walk-the-green", kind: "find", noHint: true,
      targets: ["ball-mark-unrepaired", "animal-pitch-mark", "proud-sprinkler-head"],
      itemNames: { "ball-mark-unrepaired": "the unrepaired ball mark", "animal-pitch-mark": "the pitch mark from wildlife", "proud-sprinkler-head": "the sprinkler head sitting proud of the surface" },
      itemNotes: {
        "ball-mark-unrepaired": "A ball mark left unrepaired heals wrong and scars the green well past today's mowing — it gets fixed now, on the walk-down.",
        "animal-pitch-mark": "A pitch mark like this is a divot the mower reel will catch and tear wider instead of cutting clean over.",
        "proud-sprinkler-head": "A head sitting proud of the surface is exactly what a reel mower's bedknife catches and damages, along with itself.",
      },
      decoyNotes: { "clear-green-surface": "That section of the green is smooth and true, with nothing to repair. Nothing to flag there." },
      title: "Walk the green before the first pass",
      cue: "Three things on this green change the mowing plan — find them before the reel ever turns.",
      why: "A green that looks ready from the edge of the collar is not the same thing as a green someone has actually walked, and a ball mark, a pitch mark or a proud sprinkler head are exactly what a walk-down catches before the mower's reel finds them the hard way.",
    },
    {
      id: "mower-precheck", kind: "sequence", anyOrder: true,
      targets: ["reel-height-check", "bedknife-sharpness-check"],
      itemNames: { "reel-height-check": "reel height setting", "bedknife-sharpness-check": "bedknife sharpness" },
      title: "Precheck the mower's cutting unit",
      cue: "Confirm the reel height matches the chart and the bedknife is sharp before starting.",
      why: "A reel set to the wrong height cuts the whole green to a speed nobody asked for, and a dull bedknife tears grass blades instead of shearing them clean — checking both against the chart before the first pass is what keeps the cut consistent with what the plan actually calls for.",
    },
    {
      id: "confirm-transport-lever", kind: "select", target: "transport-lever",
      title: "Confirm the transport lever before crossing the collar",
      cue: "Engage the transport lever to lift the reel before crossing the collar onto the green.",
      why: "Crossing the collar with the reel still down cuts a scar into the transition every single time — the transport lever is what lifts the cutting unit clear so the mower can move between surfaces without leaving a mark it should never have made.",
    },
    {
      id: "mow-the-green", kind: "drive", target: "mower-rig",
      title: "Mow the green in the day's pattern",
      cue: "Follow the chart's own pattern at mowing speed, watching the mirrors for anyone approaching the green.",
      why: "The day's pattern is set for a reason — recovery, speed, or how the green reads for the next event — and mowing speed with regular mirror checks is what keeps the pass consistent with the chart while still catching a golfer or a cart arriving before the pattern is finished.",
      holdBreakNote: "Off the pattern or outside the speed band. Settle back onto the chart's own line before continuing the pass.",
      drive: {
        path: [[-1.4, 1.2], [-0.6, 0.6], [0.2, 0], [1.0, -0.6], [1.6, -1.2]],
        speedBand: [2, 6], laneWidth: 1.0, graceSeconds: 1.6, checkWindow: 1.2, sceneRate: 0.2,
        bandLabel: "mowing speed, per the day's chart",
        checks: [
          { at: 1, kind: "mirror-left", note: "Mirror check for anyone approaching from the clubhouse side." },
          { at: 3, kind: "mirror-right", note: "Mirror check toward the next tee box as the pattern finishes." },
        ],
        controls: { waveOff: "wave-off-lever" },
        laneNote: "Off the chart's own pattern. A wandering line on a green reads as stripes nobody asked for.",
      },
    },
    {
      id: "adjust-bedknife", kind: "turn", target: "bedknife-adjustment-screw",
      title: "Adjust the bedknife-to-reel clearance",
      cue: "Turn the adjustment screw until the reel and bedknife just kiss along their full length.",
      why: "A reel set too far from the bedknife tears grass instead of shearing it, and one set too tight wears both edges down fast and can seize the unit — turning the adjustment until they just kiss along the whole length is what actually gets a clean, even cut.",
      turn: { turns: 0.35, axis: "z", label: "BEDKNIFE CLEARANCE" },
    },
    {
      id: "check-cut-height", kind: "gauge", target: "cut-height-gauge",
      title: "Check the height of cut",
      cue: "Read the height-of-cut gauge and commit only inside the chart's own band.",
      why: "The height of cut is the one number that actually determines today's green speed, and a gauge reading confirmed inside the chart's band is what proves the mower is set correctly rather than assumed close enough by eye.",
      gauge: {
        label: "HEIGHT OF CUT", speed: 0.58, green: [0.4, 0.62],
        readout: (t) => `${(2 + t * 3).toFixed(2)} mm`,
        missNote: "Outside the chart's band. Adjust the height and let the reading settle before committing it.",
      },
    },
    {
      id: "lift-reel-crossing", kind: "hold", target: "reel-lift-lever", seconds: 4,
      title: "Lift the reel for the cart-path crossing",
      cue: "Hold the reel lifted for the full crossing of the cart path.",
      why: "A reel dropped partway across a cart path catches the hard surface instead of turf, dulling the bedknife and throwing debris exactly where a cart or a golfer might be walking — holding it lifted for the whole crossing, not just the first few feet, is what keeps this short stretch from undoing the precheck's work.",
      holdBreakNote: "The reel dropped before the crossing finished. Hold it lifted the whole way across the cart path, every time.",
    },
    {
      id: "read-hole-position-sheet", kind: "select", target: "hole-position-sheet",
      title: "Read the day's hole position sheet",
      cue: "Check today's marked hole location against the sheet before moving the cup.",
      why: "The hole position sheet is what the superintendent set for today's pin placement, tied to the green's contours and yesterday's wear pattern — moving the cup without checking it risks placing today's hole right back on ground that needs a rest.",
    },
    {
      id: "carry-cup-cutter", kind: "drag", target: "cup-cutter",
      title: "Carry the cup cutter to the new location",
      cue: "Carry the cup cutter, blade guarded, to the marked new hole location.",
      why: "Carrying the cutter with its blade guarded until the moment it is actually used is what keeps a tool sharp enough to core dense turf cleanly from becoming a hazard on the walk between one hole location and the next.",
      drag: { to: "new-hole-socket", radius: 0.4, missNote: "Not on the marked spot — carry the cutter to where the new hole location actually is." },
    },
    {
      id: "core-new-hole", kind: "turn", target: "cup-cutter-handle",
      title: "Core the new hole",
      cue: "Turn and press the cutter down in one steady motion to core the new hole cleanly.",
      why: "A cup cored with a steady, even turn cuts a clean-walled hole the cup sits flush in — a rushed, uneven press tears the edge and leaves a hole that crumbles under the first few putts instead of holding its shape for the day.",
      turn: { turns: 0.4, axis: "y", label: "CUP CUTTER" },
    },
    {
      id: "set-and-fill", kind: "sequence", anyOrder: true,
      targets: ["set-new-cup", "fill-old-hole", "tamp-old-hole"],
      itemNames: { "set-new-cup": "set the new cup and flagstick", "fill-old-hole": "fill the old hole with a plug", "tamp-old-hole": "tamp the old hole level" },
      title: "Set the new cup and close the old hole",
      cue: "Set the new cup and flagstick, fill the old hole with a plug, and tamp it level.",
      why: "Setting the new cup and flagstick is only half the job — filling the old hole with a plug and tamping it level is what keeps that spot from becoming a footstep-deep trap for the next group through, or an eyesore the green carries until the next mowing pattern hides it.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the greens log",
      cue: "Log the cut height, the bedknife check and the new hole position before leaving the green.",
      why: "The greens log is what the superintendent and the next crew both read — a green mowed and changed cleanly but never logged leaves nothing behind to prove the chart was actually followed and the old hole actually closed.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GKG_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 10, a: "#3d7a3a", b: "#457f44" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );
    const green = box(g, 3.2, 0.02, 3.2, 0.2, 0.15, -0.2, 0xffffff, { rough: 0.85, cast: false });
    green.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 16, a: "#4f9c5f", b: "#549f64" }), { repeat: 6, px: 512 }),
      { rough: 0.85, metal: 0.02, color: 0xd0eecb },
    );
    holoTag(green, "putting green", 0, 0.4, -1.4, { css: "#3f9c5a", w: 0.3 });

    const ballMark = ball(green, 0.03, -1.0, 0.02, -1.0, 0x2f6f2f, { rough: 0.6, seg: 8 });
    reg(hits, ballMark, "ball-mark-unrepaired");
    const pitchMark = box(green, 0.06, 0.008, 0.06, -0.4, 0.02, 0.6, 0x3a4a2a, { rough: 0.8, cast: false });
    reg(hits, pitchMark, "animal-pitch-mark");
    const sprinklerHead = cyl(green, 0.03, 0.03, 0.06, 0.8, 0.03, -0.6, 0x6f7a6f, { rough: 0.5, metal: 0.3, seg: 10 });
    reg(hits, sprinklerHead, "proud-sprinkler-head");
    const clearGreen = group(green, 0.4, 0.02, 1.0);
    reg(hits, clearGreen, "clear-green-surface");
    const clearGreenMesh = box(clearGreen, 0.3, 0.008, 0.3, 0, 0, 0, 0x4f9c5f, { rough: 0.8, cast: false });

    const cartPath = box(g, 1.0, 0.02, 3.0, 2.4, 0.16, 0, 0xffffff, { rough: 0.7, cast: false });
    cartPath.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 2, a: "#8a8578", b: "#7c7768" }), { repeat: 2, px: 256 }),
      { rough: 0.7, metal: 0.05, color: 0xc9c3b0 },
    );

    // ------------------------------------------------------------------ mowing chart + mower
    const board = holoPanel(g, 0.58, 0.42, -2.4, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#3f9c5a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("MOWING CHART", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Height of cut: per the chart", "Pattern: per the chart", "Hole position: see sheet"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: 0.7, accent: GKG_ACCENT });
    reg(hits, board, "mowing-chart-board");

    const mower = group(g, -1.6, 0.14, 1.6, -1.4);
    const mowerBody = box(mower, 0.5, 0.28, 1.0, 0, 0.24, 0, GKG_PAL.trim, { rough: 0.5, metal: 0.3 });
    const reelUnit = cyl(mower, 0.12, 0.12, 0.5, 0, 0.1, 0.6, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 14 });
    reelUnit.rotation.z = Math.PI / 2;
    reg(hits, reelUnit, "reach-into-reel");
    reg(hits, mower, "mower-rig");
    const bedknife = box(mower, 0.5, 0.02, 0.05, 0, 0.02, 0.62, 0x2b2f34, { rough: 0.4, metal: 0.5 });
    reg(hits, bedknife, "bedknife-sharpness-check");
    const reelHeightLever = box(mower, 0.05, 0.08, 0.02, -0.2, 0.3, 0.5, 0xf2c14b, { rough: 0.5 });
    reg(hits, reelHeightLever, "reel-height-check");
    const transportLeverObj = box(mower, 0.05, 0.1, 0.02, 0.2, 0.35, -0.3, 0xd2312b, { rough: 0.5 });
    reg(hits, transportLeverObj, "transport-lever");
    const bedknifeScrew = cyl(mower, 0.015, 0.015, 0.03, 0.15, 0.15, 0.6, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, bedknifeScrew, "bedknife-adjustment-screw");
    const reelLiftLeverObj = box(mower, 0.05, 0.1, 0.02, 0, 0.35, -0.3, 0x2f6f4a, { rough: 0.5, transparent: true, opacity: 0.001 });
    reg(hits, reelLiftLeverObj, "reel-lift-lever");
    const waveOffLeverObj = box(mower, 0.04, 0.08, 0.02, -0.24, 0.3, -0.3, 0x59c97b, { rough: 0.5 });
    reg(hits, waveOffLeverObj, "wave-off-lever");
    const sharpTurnZone = box(green, 0.5, 0.02, 0.5, 1.1, 0.02, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sharpTurnZone, "sharp-turn-on-green");
    holoTag(mower, "greens mower", 0, 0.5, 0, { css: "#3f9c5a", w: 0.3 });

    const cutHeightInst = instrument(g, 2.4, 0.9, 1.4, { ry: -0.4, idle: "-- mm", color: GKG_ACCENT });
    holoTag(cutHeightInst, "height of cut gauge", 0, 0.16, 0, { css: "#3f9c5a", w: 0.36 });
    reg(hits, cutHeightInst, "cut-height-gauge");

    // ------------------------------------------------------------------ hole changing
    const oldHole = group(green, -0.6, 0.02, -0.8);
    cyl(oldHole, 0.055, 0.055, 0.03, 0, 0, 0, 0x1c1712, { rough: 0.9, seg: 16 });
    reg(hits, oldHole, "old-hole-unfilled-tripping");
    const fillOldHoleHit = cyl(oldHole, 0.04, 0.04, 0.01, 0, 0.02, 0, 0x6a5a3a, { rough: 0.8, seg: 12 });
    reg(hits, fillOldHoleHit, "fill-old-hole");
    const tampOldHoleHit = box(oldHole, 0.06, 0.01, 0.06, 0.05, 0.02, 0.05, 0x6a5a3a, { rough: 0.8 });
    reg(hits, tampOldHoleHit, "tamp-old-hole");

    const newHoleSocket = group(green, 0.6, 0.02, -0.4);
    hits["new-hole-socket"] = newHoleSocket;
    const newHoleMark = box(green, 0.12, 0.005, 0.12, 0.6, 0.021, -0.4, 0xf2c14b, { rough: 0.6, cast: false });

    const cupCutterGroup = group(g, -2.2, 0.14, 0.4, 0.4);
    cyl(cupCutterGroup, 0.04, 0.04, 0.6, 0, 0.3, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 14 });
    reg(hits, cupCutterGroup, "cup-cutter");
    const cutterBlade = torus(cupCutterGroup, 0.04, 0.006, 0, 0.02, 0, 0xd2312b, { rough: 0.5, metal: 0.5, seg: 8, seg2: 16 });
    reg(hits, cutterBlade, "cup-cutter-blade-exposed");
    const cutterHandle = box(cupCutterGroup, 0.24, 0.03, 0.03, 0, 0.62, 0, 0x2b2f34, { rough: 0.5 });
    reg(hits, cutterHandle, "cup-cutter-handle");

    const newCupHit = cyl(green, 0.05, 0.05, 0.02, 0.6, 0.031, -0.4, 0xf2f2ea, { rough: 0.6, metal: 0.3, seg: 14 });
    reg(hits, newCupHit, "set-new-cup");

    const holeSheet = group(g, -2.5, 0, 1.6, 0.4);
    box(holeSheet, 0.24, 0.32, 0.02, 0, 0.16, 0, 0x2b3138, { rough: 0.6 });
    const holeSheetFace = decal(holeSheet, 0.2, 0.26, 0, 0.18, 0.011, signFace("HOLE POSITION\nSHEET", { bg: "#0d1c24", accent: "#3f9c5a", scale: 0.22 }), { px: 192 });
    reg(hits, holeSheetFace, "hole-position-sheet");

    const chest = toolChest(g, 2.6, -0.6, { ry: -0.5, color: GKG_ACCENT });
    const eyeProp = box(chest, 0.1, 0.04, 0.02, -0.2, 0.79, 0.06, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");
    const earProp = group(chest, -0.05, 0.79, 0.06);
    torus(earProp, 0.045, 0.012, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 16 });
    reg(hits, earProp, "ear-protection");

    const waveOffFlag = group(g, 2.6, 0, 0.6, -0.3);
    ball(waveOffFlag, 0.03, 0, 0.5, 0, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, waveOffFlag, "wave-off-signal");

    const closingLog = group(g, 2.7, 0, -1.9, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("GREENS LOG\nOPEN", { bg: "#11181f", accent: "#3f9c5a", scale: 0.22 }), { px: 320 });
    holoTag(closingLog, "greens log", 0, 1.34, 0, { css: "#3f9c5a", w: 0.32 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew + golf cart
    const crewMember = standingFigure(g, 2.0, 2.2, { ry: -2.0, cloth: 0x2b3138, vest: GKG_ACCENT, helmet: 0xf2f2f2 });
    holoTag(crewMember, "greenkeeper", 0, 1.95, 0.15, { css: "#3f9c5a", w: 0.3 });

    // Golf cart prop, hidden until the path-conflict interrupt fires.
    const cart = group(g, 3.0, 0, 0, -1.6);
    box(cart, 0.5, 0.3, 0.9, 0, 0.25, 0, 0xf2f2ea, { rough: 0.5, metal: 0.2 });
    box(cart, 0.5, 0.02, 0.9, 0, 0.5, 0, 0x2b2f34, { rough: 0.6 });
    for (const wx of [-0.2, 0.2]) for (const wz of [-0.35, 0.35]) cyl(cart, 0.08, 0.08, 0.06, wx, 0.1, wz, 0x1c1d1f, { rough: 0.8, seg: 12 });
    cart.visible = false;

    // Golfer prop, hidden until the course-conflict interrupt fires.
    const golfer = standingFigure(g, -2.9, -1.6, { ry: 1.6, cloth: 0xd8c14b });
    golfer.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "cart-approaches-crossing") { cart.visible = true; }
        if (it.id === "player-waiting-to-putt") { golfer.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cart-approaches-crossing") { cart.visible = false; }
        if (it.id === "player-waiting-to-putt") { golfer.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walk-the-green") {
          ballMark.material = mat(0x59c97b, { rough: 0.6 });
          pitchMark.material = mat(0x59c97b, { rough: 0.6, cast: false });
          sprinklerHead.material = mat(0x59c97b, { rough: 0.5 });
        }
        if (step.id === "core-new-hole") { newHoleMark.material = mat(0x1c1712, { rough: 0.9, cast: false }); }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("GREENS LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.22 }));
        }
      },
      onHazard(hitId) { if (hitId === "sharp-turn-on-green") { mower.rotation.y += 0.4; } },

      animate(t, dt, session) {
        crewMember.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (cart.visible) cart.position.x = 3.0 - (t % 2) * 0.3;
        if (golfer.visible) golfer.position.x = -2.9 + (t % 2) * 0.3;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-cut-height") {
          const mm = (2 + gg.t * 3).toFixed(2);
          repaint(cutHeightInst.userData.screen, signFace(`${mm} mm`, {
            bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
