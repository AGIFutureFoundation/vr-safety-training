import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, texturedMat, asphaltFace, grassFace, palette, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Storm Cleanup: Chipper & Traffic Control VR — Grounds &
// Landscaping.
//
// A downed-limb cleanup along a roadside shoulder after a storm: the damage
// walked for a sagging line and a tree still under tension before the crew
// sets up, the taper and the signs placed to the traffic-control plan before
// anyone works the shoulder, the chipper's own infeed guard and discharge
// chute checked and pointed away from the lane, every branch fed from behind
// the marked line and never chased in by hand, and the machine actually
// locked out before anyone clears a jam. No lane width, taper length or
// infeed clearance this platform is not certain of appears here — every one
// of them is "per the traffic-control plan" and "per the operator's manual".

const GKS_ACCENT = 0xe0642a;
const GKS_PAL = palette("grounds");

export const SIM_GK_STORM_CLEANUP_CHIPPER_AND_TRAFFIC_CONTROL = {
  id: "gk-storm-cleanup-chipper-and-traffic-control",
  index: "gk-10",
  domain: "Grounds & Landscaping",
  trade: "Grounds storm-response crew member — LIUNA grounds and landscaping crew",
  category: "Grounds & Landscaping",
  district: "fairway-park",
  weather: "wind",
  certification: "ANSI Z133 safety requirements for arboricultural operations, including chippers used on a tree crew; Manual on Uniform Traffic Control Devices (MUTCD) for the roadside work zone; OSHA 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.212 machine guarding and 29 CFR 1910.147 control of hazardous energy; LIUNA grounds and landscaping crew training",
  name: "Storm Cleanup: Chipper & Traffic Control",
  title: simTitle("Storm Cleanup: Chipper & Traffic Control"),
  tagline: "A roadside storm cleanup after the wind: the damage walked for a sagging line, the taper and signs set to the traffic-control plan, the chipper's own guard checked and its chute aimed off the lane, every branch fed from behind the line, and the machine locked out before any jam is cleared",
  accent: GKS_ACCENT,
  accentCss: "#e0642a",
  parSeconds: 310,
  footprint: 2.8,
  badge: { id: "shoulder-cleared", name: "Shoulder Cleared", note: "Taper set, the chipper guard checked, every branch fed from behind the line, and the shoulder cleared without a single unsafe act" },

  supportLine: "your union steward or the grounds department's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Storm Crew", "Chipper Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "guard-checked", name: "Guard Checked", note: "Never fed the chipper without the infeed guard confirmed", test: AWARD.stepClean("chipper-precheck") },
      { id: "hands-clear", name: "Hands Clear", note: "Never reached past the feed line into the infeed", test: AWARD.safe },
      { id: "locked-for-jams", name: "Locked for Jams", note: "Locked out the chipper before clearing a jam", test: AWARD.stepClean("lockout-for-jam") },
      { id: "steady-taper", name: "Steady Taper", note: "Held the flagger signal and the chipper gauge near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-clear", name: "Quick Clear", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "reach-into-infeed-hopper": "You reached into the infeed hopper while the chipper was running. The rollers that pull a branch into a chipper's blades do not know the difference between wood and an arm reaching in after it, and that pull does not stop or reverse just because a hand followed the branch too far.",
    "loose-clothing-near-infeed": "That loose strap is hanging right where the infeed rollers can catch it. A chipper's rollers pull whatever they grab all the way through, and a sleeve, a drawstring or a loose strap caught at the infeed does not let go the way a hand pulling back on its own would.",
    "stand-in-traffic-lane-unprotected": "You are standing in the open travel lane before the taper is set. A shoulder cleanup with no taper up yet is a work zone drivers have had no warning about, and standing in the lane on that assumption is trusting every driver to see what nothing has told them is there.",
    "clear-jam-without-lockout": "You reached for that jam without locking the chipper out first. A jammed feed can release all at once the moment something shifts, and a machine that is not locked out is a machine that can start pulling again with a hand already inside it.",
  },

  lateNotes: {
    "sagging-power-line": "A line sagging this low from storm damage gets treated as energised until the utility says otherwise — it never gets assumed dead because the power looks out.",
    "infeed-guard-check": "The infeed guard and the discharge chute direction get confirmed every time the chipper is set up fresh, not assumed unchanged from the last job.",
  },

  interrupts: [
    {
      id: "branch-kicks-back",
      kind: "Kickback",
      after: "feed-branch-from-line", delay: 3, seconds: 10,
      alert: "A branch has caught crosswise in the infeed rollers and kicked back hard toward the feed line.",
      cue: "Hit the feed reverse lever before the kickback reaches anyone standing at the line.",
      target: "feed-reverse-lever",
      why: "A branch that kicks back out of the infeed is moving with real force behind it, and the reverse lever is what actually stops the rollers from driving it further rather than hoping the next branch feeds through cleaner — reversing immediately is what keeps that kickback from becoming a strike.",
      missNote: "The infeed kept running while the branch kept kicking back. A jammed feed does not clear itself by continuing to feed into it.",
      wrongNote: "Not that — the feed reverse lever is what this kickback needs, before anything else about this feed continues.",
    },
    {
      id: "car-drifts-into-taper",
      kind: "Traffic incursion",
      after: "track-flagger-signal", delay: 4, seconds: 11,
      alert: "A car has drifted across the taper line and is closing on the work zone from the open lane.",
      cue: "Raise the stop paddle before the car reaches the crew.",
      target: "stop-sign-paddle",
      why: "A car already drifting across the taper has already missed the cones, and the flagger's stop paddle is the one thing left that can actually get a driver's attention before the crew's own workspace becomes the car's path — raising it immediately is what this drift needs, not a wave that assumes the driver already sees the zone.",
      missNote: "The car kept closing while the crew kept working. A taper that a car has already crossed is not doing its job for the crew standing past it.",
      wrongNote: "Not that — the stop paddle is what this drift needs, before the car reaches the crew.",
    },
  ],

  steps: [
    {
      id: "read-damage-assessment", kind: "select", target: "assessment-board",
      title: "Read the storm damage assessment",
      cue: "Check the work order's own notes on downed limbs and line damage before setting up.",
      why: "The damage assessment is where the first crew through already noted what looked dangerous — reading it before setup means today's crew is working from what was actually found, not discovering the same hazards again from scratch.",
    },
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["hard-hat", "eye-protection", "ear-protection", "cut-gloves"],
      itemNames: { "hard-hat": "hard hat", "eye-protection": "eye protection", "ear-protection": "ear protection", "cut-gloves": "cut-resistant gloves" },
      title: "Suit up before setting up",
      cue: "Hard hat, eye protection, ear protection and cut-resistant gloves before the truck is even unloaded.",
      why: "Storm debris drops without warning from branches still settling overhead, the chipper runs loud enough to matter for a whole shift, and handling splintered, wet wood all day is exactly what gloves are for — all of it goes on before the first branch is even dragged to the chipper.",
    },
    {
      id: "walk-the-damage", kind: "find", noHint: true,
      targets: ["sagging-power-line", "tree-under-tension", "debris-blocking-drain"],
      itemNames: { "sagging-power-line": "the power line sagging from storm damage", "tree-under-tension": "the storm-damaged tree still under tension", "debris-blocking-drain": "debris blocking the storm drain" },
      itemNotes: {
        "sagging-power-line": "A line sagging this low gets treated as energised until the utility confirms otherwise — never assumed dead because the storm knocked it loose.",
        "tree-under-tension": "A tree damaged like this can still be holding tension in ways that are not obvious from the ground, and it gets planned around before anyone works underneath it.",
        "debris-blocking-drain": "Debris blocking a storm drain during continued rain is how a cleanup site turns into a flooded one before the crew is even done.",
      },
      decoyNotes: { "clear-debris-pile": "That pile is loose brush with nothing hazardous mixed into it. Nothing to flag there." },
      title: "Walk the damage before setting anything up",
      cue: "Three things about this site change the plan — find them before the taper or the chipper are even placed.",
      why: "A storm site that looks like straightforward brush from the truck is not the same thing as a site someone has actually walked, and a sagging line, a tree under tension or a blocked drain are exactly what a walk-down catches before the crew sets up anywhere near them.",
    },
    {
      id: "set-up-traffic-control", kind: "sequence", anyOrder: true,
      targets: ["taper-cones", "advance-warning-sign", "flagger-station"],
      itemNames: { "taper-cones": "taper cones", "advance-warning-sign": "advance warning sign", "flagger-station": "flagger station" },
      title: "Set up the traffic-control zone",
      cue: "Set the taper cones, the advance warning sign and the flagger station to the traffic-control plan.",
      why: "A taper set to the plan, an advance sign giving drivers time to react, and a flagger stationed where they can actually be seen are what turn an open shoulder into an announced work zone drivers have real warning about, rather than one they discover at the last second.",
    },
    {
      id: "chipper-precheck", kind: "sequence", anyOrder: true,
      targets: ["infeed-guard-check", "discharge-chute-check"],
      itemNames: { "infeed-guard-check": "infeed guard", "discharge-chute-check": "discharge chute direction" },
      title: "Precheck the chipper",
      cue: "Confirm the infeed guard is in place and the discharge chute is aimed away from the lane and the crew.",
      why: "The infeed guard is what keeps a hand from following a branch too far in, and a discharge chute aimed away from the lane and the crew is what keeps the chipped debris from becoming its own hazard the moment the machine starts running.",
    },
    {
      id: "rotate-discharge-chute", kind: "turn", target: "chute-rotate",
      title: "Aim the discharge chute",
      cue: "Turn the chute to aim the discharge away from the open lane and anyone standing nearby.",
      why: "Chipped debris leaves the discharge chute with real force behind it, and turning the chute to aim it at open ground — not the lane, not the crew — is what keeps that debris from becoming a hazard of its own the moment the chipper starts feeding.",
      turn: { turns: 0.4, axis: "y", label: "DISCHARGE CHUTE" },
    },
    {
      id: "feed-branch-from-line", kind: "hold", target: "feed-control-lever", seconds: 5,
      title: "Feed the branch from behind the line",
      cue: "Hold the feed control engaged while feeding from behind the marked no-hands line for the full pass.",
      why: "The marked line is set at the distance the infeed rollers can reach a hand that follows a branch too far — holding the feed control from behind that line for the whole pass, not just the first push, is what keeps the operator's hands exactly where the rollers cannot reach them.",
      holdBreakNote: "Released the feed control before the branch cleared the infeed. Hold it from behind the line for the whole pass, every time.",
    },
    {
      id: "track-flagger-signal", kind: "track", target: "flagger", seconds: 8,
      title: "Work the shoulder under the flagger's signal",
      cue: "Keep the flagger's signal steady, working the shoulder only while traffic reads clear.",
      why: "The flagger is watching the approach the crew working the shoulder cannot see while focused on the chipper, and a steady signal is what lets the crew trust the lane is actually clear instead of assuming the taper alone is doing the whole job.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.12,
        label: "FLAGGER SIGNAL",
        readout: (v) => (v < 0.4 ? "traffic approaching — hold work" : v > 0.62 ? "traffic approaching — hold work" : "lane clear, signal steady"),
      },
      holdBreakNote: "The flagger's signal dropped out of the clear band. Hold the work until the signal reads clear again.",
    },
    {
      id: "drag-brush-to-chipper", kind: "drag", target: "brush-bundle",
      title: "Stage brush at the chipper",
      cue: "Carry the cleared brush from the shoulder to the chipper's staging area.",
      why: "Staging brush at the chipper before it is ever fed keeps the feeding operator working steadily from one bundle to the next, instead of stepping away from the infeed mid-feed to fetch more material.",
      drag: { to: "infeed-staging-socket", radius: 0.4, missNote: "Not at the staging area — carry the brush to where the chipper's staging spot actually is." },
    },
    {
      id: "check-chipper-gauge", kind: "gauge", target: "chipper-gauge",
      title: "Check the chipper's hydraulic pressure",
      cue: "Read the pressure gauge and commit only inside the manufacturer's band.",
      why: "A chipper running outside its own hydraulic pressure band feeds unevenly and stalls on branches it should handle cleanly — the gauge is what confirms the machine is actually running the way its manual expects before the crew trusts it with a full afternoon of feeding.",
      gauge: {
        label: "HYDRAULIC PRESSURE", speed: 0.58, green: [0.42, 0.68],
        readout: (t) => `${Math.round(1200 + t * 800)} psi`,
        missNote: "Outside the manufacturer's band. Let the machine idle and the reading settle before committing it.",
      },
    },
    {
      id: "brief-estop-location", kind: "select", target: "estop-brief",
      title: "Confirm the e-stop location with the crew",
      cue: "Point out the emergency stop's location to everyone working near the chipper.",
      why: "An emergency stop nobody but the operator knows the location of is not actually an emergency stop for the rest of the crew — confirming it with everyone working nearby is what makes it something anyone can reach in the second it actually matters.",
    },
    {
      id: "lockout-for-jam", kind: "select", target: "chipper-lockout",
      title: "Lock out the chipper before clearing a jam",
      cue: "Lock out the chipper's own energy source before reaching toward a jam.",
      why: "A jam that releases suddenly does not wait for a hand to be clear of the infeed — locking the chipper out before reaching toward it is what actually removes the hazard, rather than trusting that the machine will stay still because nothing is currently moving.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the storm cleanup log",
      cue: "Log the damage findings, the traffic-control setup and the cleared shoulder before leaving the site.",
      why: "The storm cleanup log is what the utility crew and the next inspection both read — a shoulder cleared cleanly but never logged leaves nothing behind to prove the sagging line was actually flagged and the traffic control actually held the whole time.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GKS_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 10, a: "#3d7a3a", b: "#457f44" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );
    const road = box(g, 6.4, 0.02, 1.6, 0, 0.15, -2.4, 0xffffff, { rough: 0.85, cast: false });
    road.material = texturedMat(
      surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { lanes: 2 }), { repeat: 5, px: 512 }),
      { rough: 0.85, metal: 0.03, color: 0x8a8a8a },
    );

    // ------------------------------------------------------------------ hazards found on the walk
    const powerLine = group(g, -1.0, 1.4, -1.6, 0.2);
    box(powerLine, 3.0, 0.02, 0.02, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.6, cast: false });
    reg(hits, powerLine, "sagging-power-line");
    const damagedTree = group(g, 1.6, 0, 1.2, 0.3);
    cyl(damagedTree, 0.15, 0.18, 1.6, 0, 0.8, 0, 0x5b4530, { rough: 0.9, seg: 12 }).rotation.z = 0.3;
    reg(hits, damagedTree, "tree-under-tension");
    const drainDebris = group(g, -2.4, 0, -1.6, 0.4);
    for (let i = 0; i < 4; i++) cyl(drainDebris, 0.03, 0.04, 0.4, i * 0.08, 0.05, i * 0.04, 0x6a5a3a, { rough: 0.85, seg: 8 });
    reg(hits, drainDebris, "debris-blocking-drain");
    const clearPile = group(g, 0.6, 0, 1.8, 0.3);
    for (let i = 0; i < 3; i++) cyl(clearPile, 0.03, 0.04, 0.35, i * 0.07, 0.05, 0, 0x6a5a3a, { rough: 0.85, seg: 8 });
    reg(hits, clearPile, "clear-debris-pile");

    // ------------------------------------------------------------------ paperwork
    const board = holoPanel(g, 0.58, 0.42, -2.4, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0642a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DAMAGE ASSESSMENT", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Taper: per the MUTCD plan", "Line: treat as energised", "Chipper set-up: per the manual"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: 0.7, accent: GKS_ACCENT });
    reg(hits, board, "assessment-board");

    // ------------------------------------------------------------------ traffic control
    reg(hits, cone(g, -2.6, -1.8, { color: GKS_ACCENT }), "taper-cones");
    const warningSign = box(g, 0.5, 0.5, 0.03, -3.0, 0.5, -1.6, 0xf2c14b, { rough: 0.6 });
    reg(hits, warningSign, "advance-warning-sign");
    const flaggerStationHit = box(g, 0.3, 0.02, 0.3, -1.4, 0.16, -1.9, 0xf2c14b, { rough: 0.6, cast: false });
    reg(hits, flaggerStationHit, "flagger-station");
    const laneHazardZone = box(g, 1.5, 0.02, 1.0, 0, 0.16, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, laneHazardZone, "stand-in-traffic-lane-unprotected");
    const stopPaddleObj = group(g, -1.4, 0, -1.9, -0.3);
    cyl(stopPaddleObj, 0.01, 0.01, 0.6, 0, 0.3, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 8 });
    torus(stopPaddleObj, 0.08, 0.014, 0, 0.65, 0, 0xd2312b, { rough: 0.55, seg: 8, seg2: 20 });
    reg(hits, stopPaddleObj, "stop-sign-paddle");

    // ------------------------------------------------------------------ chipper
    const chipper = group(g, -0.8, 0.14, 1.6, -1.2);
    const chipperBody = box(chipper, 0.9, 0.5, 0.5, 0, 0.35, 0, GKS_ACCENT, { rough: 0.5, metal: 0.3 });
    const infeedHopper = box(chipper, 0.4, 0.2, 0.3, 0.5, 0.5, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    reg(hits, infeedHopper, "reach-into-infeed-hopper");
    const infeedGuardObj = box(chipper, 0.42, 0.05, 0.32, 0.5, 0.62, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, infeedGuardObj, "infeed-guard-check");
    const looseStrap = box(chipper, 0.02, 0.15, 0.02, 0.55, 0.55, 0.16, 0xd8c14b, { rough: 0.7 });
    reg(hits, looseStrap, "loose-clothing-near-infeed");
    const chuteObj = cyl(chipper, 0.08, 0.1, 0.4, -0.4, 0.7, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 14 });
    chuteObj.rotation.z = Math.PI / 2.4;
    reg(hits, chuteObj, "discharge-chute-check");
    const chuteRotateObj = cyl(chipper, 0.02, 0.02, 0.03, -0.4, 0.5, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 10 });
    reg(hits, chuteRotateObj, "chute-rotate");
    const feedLeverObj = box(chipper, 0.05, 0.16, 0.03, 0.2, 0.5, 0.28, 0xd2312b, { rough: 0.5 });
    reg(hits, feedLeverObj, "feed-control-lever");
    const feedReverseObj = box(chipper, 0.05, 0.12, 0.03, 0.35, 0.5, 0.28, 0x59c97b, { rough: 0.5 });
    reg(hits, feedReverseObj, "feed-reverse-lever");
    const estopObj = ball(chipper, 0.04, -0.3, 0.55, 0.2, 0xd2312b, { emissive: 0xd2312b, ei: 0.6, rough: 0.4, seg: 12 });
    reg(hits, estopObj, "estop-brief");
    const lockoutPointObj = box(chipper, 0.06, 0.08, 0.03, -0.3, 0.35, 0.24, 0x2b3138, { rough: 0.5 });
    reg(hits, lockoutPointObj, "chipper-lockout");
    const jamZone = box(chipper, 0.3, 0.15, 0.2, 0.5, 0.4, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, jamZone, "clear-jam-without-lockout");
    const feedLine = box(g, 0.6, 0.01, 0.06, 0.1, 0.16, 2.0, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(chipper, "chipper", 0, 0.85, 0, { css: "#e0642a", w: 0.24 });

    const pressureInst = instrument(g, 2.4, 0.9, 1.4, { ry: -0.4, idle: "-- psi", color: GKS_ACCENT });
    holoTag(pressureInst, "hydraulic pressure gauge", 0, 0.16, 0, { css: "#e0642a", w: 0.4 });
    reg(hits, pressureInst, "chipper-gauge");

    const brushBundleObj = group(g, 2.0, 0, 2.0, 0.4);
    for (let i = 0; i < 3; i++) cyl(brushBundleObj, 0.03, 0.04, 0.5, i * 0.08, 0.1, 0, 0x6a5a3a, { rough: 0.85, seg: 10 });
    reg(hits, brushBundleObj, "brush-bundle");
    const stagingSocket = group(g, 0.1, 0, 2.3);
    hits["infeed-staging-socket"] = stagingSocket;

    const chest = toolChest(g, 2.6, -0.6, { ry: -0.5, color: GKS_ACCENT });
    const hatProp = group(chest, -0.2, 0.79, 0.06);
    ball(hatProp, 0.07, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    reg(hits, hatProp, "hard-hat");
    const eyeProp = box(chest, 0.1, 0.04, 0.02, -0.05, 0.79, 0.06, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");
    const earProp = group(chest, 0.08, 0.79, 0.06);
    torus(earProp, 0.045, 0.012, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 16 });
    reg(hits, earProp, "ear-protection");
    const gloveProp = box(chest, 0.1, 0.05, 0.02, 0.2, 0.79, 0.06, 0x8a6a3a, { rough: 0.8 });
    reg(hits, gloveProp, "cut-gloves");

    const closingLog = group(g, 2.7, 0, -0.4, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("STORM CLEANUP LOG\nOPEN", { bg: "#11181f", accent: "#e0642a", scale: 0.2 }), { px: 320 });
    holoTag(closingLog, "storm cleanup log", 0, 1.34, 0, { css: "#e0642a", w: 0.36 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew
    const flagger = standingFigure(g, -1.4, -0.9, { ry: 1.4, cloth: 0x2b3138, vest: GKS_ACCENT, helmet: 0xf2f2f2 });
    holoTag(flagger, "flagger", 0, 1.95, 0.15, { css: "#e0642a", w: 0.24 });
    reg(hits, flagger, "flagger");

    // Car prop, hidden until the traffic-incursion interrupt fires.
    const car = group(g, -3.2, 0, -2.4, 0);
    box(car, 1.6, 0.5, 0.7, 0, 0.35, 0, 0x4a5a6a, { rough: 0.4, metal: 0.4 });
    box(car, 0.9, 0.3, 0.66, -0.1, 0.72, 0, 0x2b3542, { rough: 0.3, metal: 0.5, transparent: true, opacity: 0.6 });
    car.visible = false;

    const dust = particles(chipper, 20, 0x8a7050, { size: 0.02, life: 0.5, additive: false, opacity: 0.2 });
    dust.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "branch-kicks-back") { chipper.rotation.z = 0.06; dust.visible = true; }
        if (it.id === "car-drifts-into-taper") { car.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "branch-kicks-back") { chipper.rotation.z = 0; dust.visible = false; }
        if (it.id === "car-drifts-into-taper") { car.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walk-the-damage") {
          powerLine.children[0].material = mat(0x59c97b, { rough: 0.5, metal: 0.4 });
          damagedTree.children[0].material = mat(0x59c97b, { rough: 0.6 });
          drainDebris.children.forEach((c) => { c.material = mat(0x59c97b, { rough: 0.6 }); });
        }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("STORM CLEANUP LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.2 }));
        }
      },
      onHazard(hitId) { if (hitId === "reach-into-infeed-hopper") { dust.visible = true; } },

      animate(t, dt, session) {
        flagger.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (car.visible) car.position.x = -3.2 + (t % 2) * 0.6;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(-0.3, 0.4, 0), 0.14, 0.14, 0.1);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-chipper-gauge") {
          const psi = Math.round(1200 + gg.t * 800);
          repaint(pressureInst.userData.screen, signFace(`${psi} psi`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.68 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
