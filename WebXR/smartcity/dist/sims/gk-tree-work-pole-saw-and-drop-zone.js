import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, texturedMat, grassFace, woodGrainFace, palette, reg,
} from "../citykit.js";
import { streetTree } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tree Work: Pole Saw & Drop Zone VR — Grounds & Landscaping.
//
// Ground-based pruning with an extendable pole saw: the site surveyed for an
// overhead line and a dead hanging limb before the saw ever telescopes out,
// the drop zone barricaded and a dedicated spotter briefed, the line
// clearance actually checked with a rangefinder rather than eyeballed, the
// cut made only on the spotter's continuous signal, and the limb confirmed
// stopped before anyone steps in to buck and clear it. No minimum approach
// distance or line voltage this platform is not certain of appears here —
// only "per the utility's own minimum approach distance" and "per the crew's
// drop-zone plan".

const GKW_ACCENT = 0x5a8f3a;
const GKW_PAL = palette("grounds");

export const SIM_GK_TREE_WORK_POLE_SAW_AND_DROP_ZONE = {
  id: "gk-tree-work-pole-saw-and-drop-zone",
  index: "gk-05",
  domain: "Grounds & Landscaping",
  trade: "Grounds tree crew member — LIUNA grounds and landscaping crew",
  category: "Grounds & Landscaping",
  district: "fairway-park",
  weather: "clear",
  certification: "ANSI Z133 safety requirements for arboricultural operations; OSHA 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.133 eye and face protection and 29 CFR 1910.95 occupational noise exposure; NIOSH guidance on tree-care struck-by and electrocution incidents; LIUNA grounds and landscaping crew training",
  name: "Tree Work: Pole Saw & Drop Zone",
  title: simTitle("Tree Work: Pole Saw & Drop Zone"),
  tagline: "A pole saw pruning job worked from the ground: the site surveyed for the overhead line and the dead hanging limb, the drop zone barricaded and a spotter briefed, the line clearance actually checked, and the cut made only on the spotter's signal",
  accent: GKW_ACCENT,
  accentCss: "#5a8f3a",
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "zone-controlled", name: "Zone Controlled", note: "Site surveyed, drop zone barricaded, line clearance proven, and every cut made only on the spotter's signal" },

  supportLine: "your union steward or the grounds department's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Pole Saw Operator", "Zone Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "line-cleared", name: "Line Cleared", note: "Never worked closer than the checked clearance to the line", test: AWARD.safe },
      { id: "signal-only", name: "Signal Only", note: "Never cut without the spotter's clear signal", test: AWARD.stepClean("track-drop-zone") },
      { id: "zone-held", name: "Zone Held", note: "Drop zone barricaded before the first cut", test: AWARD.stepClean("drop-zone-barricade") },
      { id: "steady-cut", name: "Steady Cut", note: "Held the brace and the line-clearance gauge near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-prune", name: "Quick Prune", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "stand-under-drop-zone": "You are standing directly under the limb being cut. A limb coming down does not fall the way it is leaning right up until the cut lets go, and the one place nobody stands for a pruning cut is exactly where you are standing now.",
    "pole-saw-near-line": "You extended the pole saw inside the checked clearance to the overhead line. An aluminium or fibreglass pole saw does not have to touch a line to conduct — closing the gap the rangefinder already measured is closing the one distance this whole job plan depends on staying open.",
    "cut-without-spotter-signal": "You made the cut before the spotter gave the clear signal. The spotter is watching the drop zone and the line clearance from an angle the operator cannot see while sighting the cut, and cutting ahead of their signal removes the one check that catches a bystander or a shifted lean before the limb is already falling.",
    "reach-for-hung-limb": "You reached to pull down a limb that hung up instead of using the pole saw's own technique. A hung limb is holding tension nobody can see, and a hand or a rope pulled on it by feel is how that tension releases all at once, aimed at whoever is closest.",
  },

  lateNotes: {
    "dead-hanging-limb": "A dead limb hanging loose in the canopy — a widow-maker — can come down with no warning at all, which is exactly why it gets flagged and worked around before the pole saw ever goes near that tree.",
    "rangefinder": "The rangefinder reading is what actually proves the clearance to the line, not how far away the tree looks from where the crew is standing.",
  },

  interrupts: [
    {
      id: "limb-lean-shifts",
      kind: "Lean shift",
      after: "brace-and-cut", delay: 3, seconds: 10,
      alert: "A gust has shifted the limb's lean mid-cut, and it is no longer falling toward the planned drop zone.",
      cue: "Sound the retreat whistle and clear the area before the cut is finished.",
      target: "retreat-whistle",
      why: "A limb whose lean has shifted mid-cut is no longer falling where the drop zone plan assumed it would, and the retreat whistle is what tells everyone nearby — including whoever is watching the original zone — to clear the new path before the cut lets go rather than after.",
      missNote: "The cut continued while the lean kept shifting. A falling limb does not wait for the crew to notice the drop zone moved.",
      wrongNote: "Not that — the retreat whistle is what this shifted lean needs before the cut goes any further.",
    },
    {
      id: "passerby-under-tape",
      kind: "Bystander incursion",
      after: "track-drop-zone", delay: 4, seconds: 11,
      alert: "A passerby has ducked under the barricade tape and is walking into the drop zone.",
      cue: "Sound the stop-work horn and halt the cut before the limb comes down.",
      target: "stop-work-horn",
      why: "A barricade only works on someone who respects it, and a passerby already under the tape is already inside the one area the whole plan exists to keep clear — the stop-work horn is what halts the cut immediately, rather than trusting the barricade to have done its job after the fact.",
      missNote: "The cut continued while the passerby was still inside the tape. A drop zone with someone standing in it is not a controlled zone at all.",
      wrongNote: "Not that — the stop-work horn is what this passerby needs, before the cut goes any further.",
    },
  ],

  steps: [
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["hard-hat", "eye-protection", "ear-protection"],
      itemNames: { "hard-hat": "hard hat", "eye-protection": "eye protection", "ear-protection": "ear protection" },
      title: "Suit up before the site survey",
      cue: "Hard hat, eye protection and ear protection before walking the site.",
      why: "Falling debris and sawdust from overhead pruning reach the ground long before the limb does, and the hard hat and eye protection are what the survey and the whole job depend on from the very first look up into the canopy.",
    },
    {
      id: "site-survey", kind: "select", target: "hazard-assessment-board",
      title: "Read the site hazard assessment",
      cue: "Check the job's own hazard assessment for the tree's lean, the line location and any flagged limbs before touching the pole saw.",
      why: "The hazard assessment is where the crew's own survey of this specific tree — its lean, the line's location, any limb already flagged — gets written down before the work starts, so the plan is built on what was actually found rather than on what the crew remembers from the truck.",
    },
    {
      id: "walk-around", kind: "find", noHint: true,
      targets: ["overhead-power-line", "dead-hanging-limb", "line-clearance-marker"],
      itemNames: { "overhead-power-line": "the overhead power line through the canopy", "dead-hanging-limb": "the dead limb hanging loose in the canopy", "line-clearance-marker": "the utility's own line clearance marker" },
      itemNotes: {
        "overhead-power-line": "A line running through this canopy is the one hazard that changes everything about where the pole saw can safely reach.",
        "dead-hanging-limb": "A limb hanging loose like this — a widow-maker — can come down with no warning, which is why it gets flagged before anyone works under this tree.",
        "line-clearance-marker": "The utility's own marker is what tells the crew where its minimum approach distance actually starts, rather than guessing from how far the line looks.",
      },
      decoyNotes: { "clear-canopy-section": "That section of canopy is clear, with nothing overhead and nothing hanging loose. Nothing to flag there." },
      title: "Walk the site before extending the pole saw",
      cue: "Three things about this tree change the plan — find them by looking up and around before the saw comes out.",
      why: "A tree that looks routine from the truck is not the same thing as a tree someone has actually surveyed, and a line through the canopy or a dead hanging limb are exactly the kind of hazard a walk-around catches before the pole saw is anywhere near either one.",
    },
    {
      id: "drop-zone-barricade", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "zone-tape"],
      itemNames: { "cone-a": "cone at the near approach", "cone-b": "cone at the far approach", "zone-tape": "barricade tape around the drop zone" },
      title: "Barricade the drop zone",
      cue: "Cone both approaches and tape off the full drop zone before the first cut.",
      why: "A drop zone that exists only in the crew's head protects nobody who was not in that conversation — coning the approaches and taping the zone is what turns the plan into something a passerby can actually see and stay out of.",
    },
    {
      id: "spotter-brief", kind: "select", target: "spotter",
      title: "Brief the ground spotter",
      cue: "Agree the stop signal and the drop-zone watch with the spotter before the pole saw extends.",
      why: "The spotter is watching the drop zone and the line clearance from an angle the operator sighting the cut cannot hold at the same time, and that only works if both of them already agree on the stop signal before the saw is extended and it is needed for real.",
    },
    {
      id: "pole-saw-precheck", kind: "sequence", anyOrder: true,
      targets: ["blade-sharp-check", "pole-sections-check"],
      itemNames: { "blade-sharp-check": "blade sharpness and guard", "pole-sections-check": "pole section locks" },
      title: "Precheck the pole saw",
      cue: "Confirm the blade is sharp and guarded, and every pole section locks before extending.",
      why: "A dull blade snags instead of cutting clean, and a pole section that is not fully locked can telescope shut under load — checking both before the saw ever extends is what keeps the tool doing what the operator expects instead of failing mid-cut.",
    },
    {
      id: "extend-pole-saw", kind: "turn", target: "pole-lock-collar",
      title: "Extend and lock the pole saw",
      cue: "Turn the locking collar to extend the pole to the working length and confirm it locks.",
      why: "A pole extended without the collar fully locked can slip shorter mid-cut, dropping the head's reach right when the operator is committed to the swing — turning the collar until it locks is what makes the extended length something the operator can actually trust.",
      turn: { turns: 0.4, axis: "z", label: "POLE LOCK" },
    },
    {
      id: "check-line-clearance", kind: "gauge", target: "rangefinder",
      title: "Check the clearance to the line",
      cue: "Read the rangefinder and commit only once the clearance is inside the utility's own safe band.",
      why: "The rangefinder is what actually proves the distance from the pole saw's reach to the line, rather than trusting how far away the line looks from the ground — committing the reading only inside the utility's own minimum approach distance is what keeps this job on the safe side of a line nobody can afford to guess about.",
      gauge: {
        label: "LINE CLEARANCE", speed: 0.55, green: [0.5, 0.85],
        readout: (t) => `${(2 + t * 6).toFixed(1)} m`,
        missNote: "Inside the utility's own minimum approach distance. Reposition before committing this reading.",
      },
    },
    {
      id: "position-pole-saw", kind: "drag", target: "pole-saw",
      title: "Position the pole saw on the target limb",
      cue: "Carry the pole saw head to the marked cutting position on the limb.",
      why: "Positioning the saw head deliberately on the marked cut, rather than swinging the pole around until it happens to catch the limb, is what keeps the first bite of the blade going exactly where the plan intended it to.",
      drag: { to: "cutting-position-socket", radius: 0.4, missNote: "Not on the marked limb — carry the pole saw head to where the cut is planned." },
    },
    {
      id: "brace-and-cut", kind: "hold", target: "cutting-grip", seconds: 5,
      title: "Brace and make the cut",
      cue: "Hold a braced stance and a steady grip for the full cut.",
      why: "A pole saw held loosely kicks back toward the operator the instant the blade binds, and a braced stance held for the whole cut — not just the first bite — is what keeps that kickback from ever reaching the person holding the pole.",
      holdBreakNote: "Released the brace before the cut finished. Hold the stance and the grip steady for the whole cut, every time.",
    },
    {
      id: "track-drop-zone", kind: "track", target: "spotter", seconds: 8,
      title: "Cut only on the spotter's signal",
      cue: "Keep the spotter's signal steady, holding the cut only while the drop zone reads clear.",
      why: "The spotter is watching the one thing the operator sighting the cut cannot hold at the same time — whether the drop zone is actually still clear — and a steady signal is what lets the operator trust that instead of assuming the zone that was clear a minute ago still is.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.12,
        label: "DROP ZONE SIGNAL",
        readout: (v) => (v < 0.4 ? "zone questionable — hold the cut" : v > 0.62 ? "zone questionable — hold the cut" : "zone clear, signal steady"),
      },
      holdBreakNote: "The spotter's signal dropped out of the clear band. Stop cutting until the zone reads clear again.",
    },
    {
      id: "confirm-limb-stopped", kind: "select", target: "fallen-limb",
      title: "Confirm the limb has stopped moving",
      cue: "Wait and confirm the limb is fully still before anyone approaches it.",
      why: "A limb that has just come down can still settle, roll or spring from tension in the branches underneath it — confirming it is fully still before anyone steps in is what keeps the moment right after the cut from being the moment someone gets hurt by it.",
    },
    {
      id: "buck-and-clear", kind: "sequence", anyOrder: true,
      targets: ["buck-cuts", "drag-clear", "chip-pile"],
      itemNames: { "buck-cuts": "buck the limb into sections", "drag-clear": "drag the sections clear of the zone", "chip-pile": "stage the brush at the chip pile" },
      title: "Buck and clear the limb",
      cue: "Buck the limb into sections, drag them clear of the drop zone, and stage the brush at the chip pile.",
      why: "Bucking the limb into manageable sections before dragging anything is what keeps the clearing work from turning into wrestling one long, unpredictable branch across the whole site — staged at the chip pile, it is also ready for whatever the crew does with it next.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the tree work log",
      cue: "Log the survey findings, the line clearance reading and the completed prune before leaving the site.",
      why: "The tree work log is what the next crew and the next inspection both read — a prune done cleanly but never logged leaves nothing behind to prove the line clearance was actually checked and the drop zone actually held.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GKW_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 10, a: "#3d7a3a", b: "#457f44" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );

    // ------------------------------------------------------------------ the tree + line
    const tree = streetTree(g, 0.3, 0, -0.6, { size: "large", ry: 0.4 });
    const overheadLine = group(g, 0, 3.4, -0.6);
    box(overheadLine, 4.4, 0.02, 0.02, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.6, cast: false });
    reg(hits, overheadLine, "overhead-power-line");
    const deadLimb = group(g, 0.9, 3.1, -0.9, 0.3);
    box(deadLimb, 0.06, 0.5, 0.06, 0, -0.25, 0, 0x4a3a28, { rough: 0.9, cast: false });
    reg(hits, deadLimb, "dead-hanging-limb");
    const lineMarker = box(g, 0.1, 0.3, 0.1, -1.8, 0.15, -0.8, 0xf2c14b, { rough: 0.5 });
    reg(hits, lineMarker, "line-clearance-marker");
    const clearCanopy = group(g, -0.8, 3.0, -0.4);
    reg(hits, clearCanopy, "clear-canopy-section");
    const clearCanopyMesh = ball(clearCanopy, 0.06, 0, 0, 0, 0x3a6b3a, { rough: 0.9, seg: 8 });

    const pruneTarget = group(g, 0.5, 2.6, -0.5, 0.2);
    box(pruneTarget, 0.06, 0.4, 0.06, 0, -0.2, 0, 0x4a3a28, { rough: 0.85, cast: false });
    holoTag(pruneTarget, "prune target", 0, 0.5, 0, { css: "#5a8f3a", w: 0.3 });
    const cuttingSocket = group(g, 0.5, 2.6, -0.5);
    hits["cutting-position-socket"] = cuttingSocket;

    // ------------------------------------------------------------------ hazard assessment + pole saw
    const board = holoPanel(g, 0.58, 0.42, -2.4, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5a8f3a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("HAZARD ASSESSMENT", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Line clearance: per the utility", "Drop zone: per the crew plan", "Flagged limb: yes — see canopy"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: 0.7, accent: GKW_ACCENT });
    reg(hits, board, "hazard-assessment-board");

    const poleSaw = group(g, -1.6, 0.14, 1.6, -1.3);
    cyl(poleSaw, 0.02, 0.02, 1.4, 0, 0.7, 0, GKW_PAL.trim, { rough: 0.4, metal: 0.4, seg: 10 });
    const bladeGuard = box(poleSaw, 0.16, 0.03, 0.06, 0, 1.42, 0.05, 0xf2c14b, { rough: 0.6 });
    reg(hits, bladeGuard, "blade-sharp-check");
    const lockCollar = torus(poleSaw, 0.03, 0.012, 0, 0.45, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 8, seg2: 16 });
    lockCollar.rotation.x = Math.PI / 2;
    reg(hits, lockCollar, "pole-sections-check");
    const lockCollarTurn = cyl(poleSaw, 0.035, 0.035, 0.04, 0, 0.9, 0, 0xf2c14b, { rough: 0.5, metal: 0.5, seg: 12 });
    reg(hits, lockCollarTurn, "pole-lock-collar");
    const gripZone = box(poleSaw, 0.05, 0.2, 0.05, 0, 0.15, 0, 0x2b2f34, { rough: 0.6 });
    reg(hits, gripZone, "cutting-grip");
    reg(hits, poleSaw, "pole-saw");
    holoTag(poleSaw, "pole saw", 0, 1.6, 0, { css: "#5a8f3a", w: 0.26 });

    const rangefinder = instrument(g, 2.4, 1.3, 1.4, { ry: -0.4, idle: "-- m", color: GKW_ACCENT });
    holoTag(rangefinder, "rangefinder", 0, 0.16, 0, { css: "#5a8f3a", w: 0.3 });
    reg(hits, rangefinder, "rangefinder");

    const nearLineHazard = box(g, 0.5, 0.4, 0.5, 0.9, 2.9, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, nearLineHazard, "pole-saw-near-line");
    const underZoneHazard = box(g, 1.0, 0.02, 1.0, 0.4, 0.16, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, underZoneHazard, "stand-under-drop-zone");
    const cutNoSignalHazard = box(g, 0.16, 0.1, 0.16, -1.2, 0.5, 1.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cutNoSignalHazard, "cut-without-spotter-signal");
    const reachHungLimbHazard = box(g, 0.16, 0.16, 0.16, 0.9, 2.8, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reachHungLimbHazard, "reach-for-hung-limb");

    // ------------------------------------------------------------------ guarding
    reg(hits, cone(g, -2.6, 2.2, { color: GKW_ACCENT }), "cone-a");
    reg(hits, cone(g, 2.5, -1.6, { color: GKW_ACCENT }), "cone-b");
    const zoneTape = barrierPanel(g, 0.6, -1.6, { ry: 0.1, w: 1.6, color: GKW_ACCENT });
    zoneTape.visible = false;
    reg(hits, zoneTape, "zone-tape");

    const chest = toolChest(g, 2.6, -0.4, { ry: -0.5, color: GKW_ACCENT });

    const fallenLimbGroup = group(g, 0.5, 0, -0.5, 0.2);
    box(fallenLimbGroup, 0.06, 0.06, 0.7, 0, 0.03, 0, 0x4a3a28, { rough: 0.85 });
    fallenLimbGroup.visible = false;
    reg(hits, fallenLimbGroup, "fallen-limb");

    const buckStage = group(g, 1.4, 0, 0.4, -0.3);
    box(buckStage, 0.5, 0.06, 0.3, 0, 0.03, 0, 0x4a3a28, { rough: 0.85 });
    reg(hits, buckStage, "buck-cuts");
    const dragClearSpot = group(g, 2.0, 0, 1.2);
    box(dragClearSpot, 0.02, 0.02, 0.02, 0, 0.01, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, dragClearSpot, "drag-clear");
    const chipPile = group(g, 2.3, 0, 2.0, 0.4);
    let px = 0;
    for (let i = 0; i < 5; i++) { ball(chipPile, 0.05, px, 0.05, (i % 2) * 0.06, 0x6a5a3a, { rough: 0.9, seg: 8 }); px += 0.06; }
    reg(hits, chipPile, "chip-pile");
    const chipMesh = box(chipPile, 0.4, 0.08, 0.4, 0, 0, 0, 0x8a7050, { rough: 0.9 });
    chipMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, {}), { repeat: 2, px: 256 }),
      { rough: 0.9, metal: 0.02, color: 0x8a7050 },
    );

    const closingLog = group(g, 2.7, 0, -2.0, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("TREE WORK LOG\nOPEN", { bg: "#11181f", accent: "#5a8f3a", scale: 0.22 }), { px: 320 });
    holoTag(closingLog, "tree work log", 0, 1.34, 0, { css: "#5a8f3a", w: 0.34 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.6, 0, 1.0, 0.4);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const hatProp = group(ppeRack, -0.06, 0.6, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    reg(hits, hatProp, "hard-hat");
    const eyeProp = box(ppeRack, 0.1, 0.04, 0.02, 0.06, 0.55, 0, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");
    const earProp = group(ppeRack, 0.16, 0.5, 0);
    torus(earProp, 0.045, 0.012, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 16 });
    reg(hits, earProp, "ear-protection");

    const whistle = group(g, -1.9, 0, 2.1, 0.4);
    ball(whistle, 0.03, 0, 0.5, 0, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, whistle, "retreat-whistle");
    const horn = group(g, -1.5, 0, 2.3, 0.4);
    box(horn, 0.06, 0.06, 0.04, 0, 0.5, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, horn, "stop-work-horn");

    // ------------------------------------------------------------------ crew
    const spotter = standingFigure(g, 1.9, 1.6, { ry: -1.9, cloth: 0x2b3138, vest: GKW_ACCENT, helmet: 0xf2f2f2 });
    holoTag(spotter, "spotter", 0, 1.95, 0.15, { css: "#5a8f3a", w: 0.24 });
    reg(hits, spotter, "spotter");

    // Passerby prop, hidden until the bystander-incursion interrupt fires.
    const passerby = standingFigure(g, -2.9, -1.4, { ry: 1.8, cloth: 0x4a5a6a });
    passerby.visible = false;

    const dust = particles(deadLimb, 12, 0x9a8a6a, { size: 0.02, life: 0.5, additive: false, opacity: 0.16 });
    dust.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "limb-lean-shifts") { deadLimb.rotation.z = 0.3; dust.visible = true; }
        if (it.id === "passerby-under-tape") { passerby.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "limb-lean-shifts") { deadLimb.rotation.z = 0; dust.visible = false; }
        if (it.id === "passerby-under-tape") { passerby.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walk-around") {
          overheadLine.children[0].material = mat(0x59c97b, { rough: 0.5, metal: 0.4 });
          deadLimb.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "drop-zone-barricade") { zoneTape.visible = true; }
        if (step.id === "track-drop-zone") { fallenLimbGroup.visible = true; }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("TREE WORK LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.22 }));
        }
      },
      onHazard(hitId) { if (hitId === "stand-under-drop-zone") { dust.visible = true; } },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (passerby.visible) passerby.position.x = -2.9 + (t % 2) * 0.5;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.3, 0), 0.1, 0.1, -0.1);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-line-clearance") {
          const m = (2 + gg.t * 6).toFixed(1);
          repaint(rangefinder.userData.screen, signFace(`${m} m`, {
            bg: "#0d1c24", accent: gg.t > 0.5 && gg.t < 0.85 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
