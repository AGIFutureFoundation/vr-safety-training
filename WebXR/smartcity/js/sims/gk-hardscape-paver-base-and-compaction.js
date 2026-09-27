import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, gravelFace, grassFace, palette, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hardscape Paver Base & Compaction VR — Grounds & Landscaping.
//
// A paver patio built from the ground up: the plan read for the pattern and
// the base depth, the utility locate confirmed before the excavation
// starts, the base graded and compacted in checked lifts rather than
// eyeballed, pavers lifted with a team or a mechanical aid instead of a bent
// back, the plate compactor run with feet clear of the plate, the pattern
// laid along a string line, the edge restraint set on both sides, and the
// joints swept with sand and given a final compaction check. No base depth,
// compaction percentage or paver dimension this platform is not certain of
// appears here — every one of them is "per the hardscape plan".

const GKH_ACCENT = 0x9a8060;
const GKH_PAL = palette("grounds");

export const SIM_GK_HARDSCAPE_PAVER_BASE_AND_COMPACTION = {
  id: "gk-hardscape-paver-base-and-compaction",
  index: "gk-11",
  domain: "Grounds & Landscaping",
  trade: "Hardscape and grounds crew member — LIUNA grounds and landscaping crew",
  category: "Grounds & Landscaping",
  district: "open-range",
  weather: "clear",
  certification: "OSHA 29 CFR 1926 Subpart P Excavations, including the excavation's own competent person inspection duties; OSHA 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.95 occupational noise exposure and 29 CFR 1910.212 machine guarding; NIOSH guidance on manual material handling; LIUNA grounds and landscaping crew training",
  name: "Hardscape Paver Base & Compaction",
  title: simTitle("Hardscape Paver Base & Compaction"),
  tagline: "A paver patio built from the ground up: the plan read, the locate confirmed, the base graded and compacted in checked lifts, pavers lifted as a team, the plate compactor run with feet clear, and the pattern laid along a string line with the edge restraint set",
  accent: GKH_ACCENT,
  accentCss: "#9a8060",
  parSeconds: 310,
  footprint: 2.8,
  badge: { id: "base-proven", name: "Base Proven", note: "Locate confirmed, the base compacted to a checked density, pavers lifted safely, and the pattern finished with edge restraint set on both sides" },

  supportLine: "your union steward or the grounds department's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Hardscape Crew", "Paver Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "locate-confirmed", name: "Locate Confirmed", note: "Never dug before the utility locate was confirmed", test: AWARD.stepClean("confirm-locate") },
      { id: "safe-lift", name: "Safe Lift", note: "Never lifted pavers with an unsafe technique", test: AWARD.safe },
      { id: "base-compacted", name: "Base Compacted", note: "Held the density gauge near band centre", test: AWARD.precise(0.72) },
      { id: "clean-round", name: "Clean Round", note: "No unsafe action anywhere in the run", test: AWARD.clean },
    ],
    challenges: [
      { id: "quick-patio", name: "Quick Patio", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-run", name: "Clean Run", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "compactor-near-foot": "You ran the plate compactor with your foot right at the edge of the plate. A vibrating plate compactor does not stop the instant it meets resistance, and a foot that close is trusting a machine built to compact aggregate to somehow tell the difference between gravel and a boot.",
    "lift-pavers-improper": "You lifted that stack of pavers bent at the waist instead of with your legs or a second person. Concrete pavers are heavy enough, stacked together, that a bad lift does not announce the strain until the next morning — lifting with the legs, or getting a second set of hands, is what keeps today's patio from becoming tomorrow's back injury.",
    "dig-over-marked-utility": "You dug straight over the marked utility line with the machine instead of hand-digging it. A locate mark is where the utility actually is, and running equipment over that mark trusts a margin the locate process was never meant to provide.",
    "reach-under-running-compactor": "You reached under the compactor to clear debris while it was still running. A running plate compactor vibrates and can shift the instant something under it moves, and a hand reaching in to clear what looks like a simple jam is trusting a machine that has not actually been shut down to stay predictable.",
  },

  lateNotes: {
    "utility-marker-unclear": "A marker this unclear does not get dug near until the utility itself confirms the line's actual location — a faded mark is not the same as no hazard there.",
    "density-gauge": "The density gauge is what actually proves the base is compacted to the plan's own spec, not how solid the surface feels underfoot.",
  },

  interrupts: [
    {
      id: "compactor-hits-obstruction",
      kind: "Equipment jolt",
      after: "compact-the-base", delay: 3, seconds: 10,
      alert: "The compactor plate has struck a buried obstruction and kicked sideways toward the excavation edge.",
      cue: "Hit the compactor's kill switch before it reaches the edge.",
      target: "compactor-kill-switch",
      why: "A compactor that has already kicked sideways once can do it again on the same obstruction, and killing the engine immediately — rather than trying to steer it clear — is what stops a machine already out of the operator's full control before it reaches the excavation edge.",
      missNote: "The compactor kept running while it kept drifting toward the edge. A machine that has already kicked once does not become predictable again on its own.",
      wrongNote: "Not that — the kill switch is what this jolt needs, before the compactor drifts any further.",
    },
    {
      id: "coworker-steps-on-fresh-pavers",
      kind: "Work interference",
      after: "lay-pattern-under-string", delay: 4, seconds: 11,
      alert: "A coworker has stepped onto the freshly laid pavers before the pattern has set, shifting two of them out of line.",
      cue: "Call the stop-work before any more of the pattern is disturbed.",
      target: "stop-work-call",
      why: "Pavers just set into a fresh bed are not locked in yet, and a footstep on them shifts the pattern the string line was set up to keep straight — calling the stop immediately is what keeps two shifted pavers from becoming a whole section that has to be pulled up and reset.",
      missNote: "The coworker kept walking across the fresh pattern while it kept shifting. A pattern disturbed before it sets does not settle back into line on its own.",
      wrongNote: "Not that — the stop-work call is what this moment needs, before the pattern shifts any further.",
    },
  ],

  steps: [
    {
      id: "read-hardscape-plan", kind: "select", target: "plan-board",
      title: "Read the hardscape plan",
      cue: "Check the plan's own paver pattern and base depth before the first shovel moves.",
      why: "The hardscape plan is what sets the pattern, the base depth and the edge restraint layout for this specific patio — reading it before excavation starts is what keeps the whole build following the design instead of an approximation of it made as the work goes.",
    },
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["work-gloves", "eye-protection", "ear-protection"],
      itemNames: { "work-gloves": "work gloves", "eye-protection": "eye protection", "ear-protection": "ear protection" },
      title: "Suit up before excavation",
      cue: "Work gloves, eye protection and ear protection before the compactor or the pavers are touched.",
      why: "Handling aggregate and pavers all day is exactly what gloves are for, eye protection covers the grit a compactor kicks up, and a plate compactor runs loud enough over a full patio to matter for hearing — all three go on before the first shovel of base material moves.",
    },
    {
      id: "walk-the-site", kind: "find", noHint: true,
      targets: ["utility-marker-unclear", "tree-root-in-path", "drainage-slope-issue"],
      itemNames: { "utility-marker-unclear": "the faded, unclear utility marker", "tree-root-in-path": "the tree root running through the excavation", "drainage-slope-issue": "the spot where the grade slopes the wrong way" },
      itemNotes: {
        "utility-marker-unclear": "A marker this faded is not a marker anyone can trust the location from — it gets confirmed with the utility before digging near it.",
        "tree-root-in-path": "A root running through the planned excavation changes where the base can actually be dug to depth without damaging the tree.",
        "drainage-slope-issue": "A patio graded to slope the wrong way ponds water against whatever it is built next to instead of carrying it away.",
      },
      decoyNotes: { "clear-excavation-area": "That section of the site is clear ground with a consistent grade. Nothing to flag there." },
      title: "Walk the site before excavating",
      cue: "Three things about this site change the plan — find them before the first cut.",
      why: "A site that looks ready for excavation from the plan alone is not the same thing as a site someone has actually walked, and an unclear utility marker, a tree root or a drainage issue are exactly what a walk-down catches before the excavation makes any of them worse.",
    },
    {
      id: "confirm-locate", kind: "select", target: "locate-board",
      title: "Confirm the utility locate",
      cue: "Check the locate tickets against the marked lines before the excavation starts.",
      why: "A locate ticket confirmed against the actual marks on the ground is what turns a call made days ago into a fact the crew can trust before the first cut goes anywhere near a marked utility.",
    },
    {
      id: "excavate-and-grade", kind: "sequence", anyOrder: true,
      targets: ["excavate-to-depth", "grade-check"],
      itemNames: { "excavate-to-depth": "excavate to the plan's depth", "grade-check": "check the grade slope" },
      title: "Excavate and grade the base",
      cue: "Excavate to the plan's own depth and confirm the grade slopes the direction the plan calls for.",
      why: "Excavating to the plan's own depth is what leaves room for every layer the base actually needs, and checking the grade slope before any base material goes in is what keeps water moving away from the patio instead of pooling against whatever it sits beside.",
    },
    {
      id: "spread-aggregate-base", kind: "drag", target: "aggregate-bag",
      title: "Spread the aggregate base material",
      cue: "Carry the aggregate from the stockpile to the excavation and spread it evenly.",
      why: "Spreading the aggregate evenly across the excavation before compacting it is what keeps the base from ending up thicker in some spots than others — a base that varies in thickness compacts unevenly no matter how carefully the compactor runs over it after.",
      drag: { to: "base-area-socket", radius: 0.4, missNote: "Not in the excavation — carry the aggregate to where the base area actually is." },
    },
    {
      id: "adjust-screed-rail", kind: "turn", target: "screed-adjust-bolt",
      title: "Adjust the screed rail",
      cue: "Turn the adjustment bolts until the screed rail sits level to the plan's own base depth.",
      why: "A screed rail set level to the plan's depth is what actually gives an even base to strike off — one set crooked leaves the same thickness error baked into the base that the compactor and every paver afterward will simply sit on top of.",
      turn: { turns: 0.35, axis: "z", label: "SCREED RAIL" },
    },
    {
      id: "compact-the-base", kind: "hold", target: "compactor-handle", seconds: 5,
      title: "Compact the base",
      cue: "Hold the compactor steady for the full pass, feet clear of the plate.",
      why: "A base compacted with the plate held steady for the whole pass — not walked over quickly — is what actually achieves an even density across the excavation, and keeping feet clear of the plate for that whole pass is what keeps the compactor's own vibration from ever reaching a foot standing too close.",
      holdBreakNote: "Released the compactor before the pass finished. Hold it steady for the full pass, every time.",
    },
    {
      id: "check-base-density", kind: "gauge", target: "density-gauge",
      title: "Check the base compaction density",
      cue: "Read the density gauge and commit only inside the plan's own compaction band.",
      why: "A base that looks solid underfoot is not the same thing as a base compacted to the plan's own density — the gauge is what actually confirms the compaction before the pavers go down and hide the base from ever being checked again.",
      gauge: {
        label: "BASE COMPACTION DENSITY", speed: 0.55, green: [0.55, 0.8],
        readout: (t) => `${Math.round(82 + t * 20)}% of max density`,
        missNote: "Under the plan's target. Run the compactor over the base again before committing this reading.",
      },
    },
    {
      id: "lay-pattern-under-string", kind: "track", target: "paver-string", seconds: 8,
      title: "Lay the pattern along the string line",
      cue: "Keep the paver joints steady under the string line across the whole pattern.",
      why: "The string line is the one reference that keeps a paver pattern straight across a patio wide enough that eye alone drifts — a laying pass that strays from it leaves joints that wander and a pattern that reads crooked from any angle across the finished surface.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.12,
        label: "PAVER JOINT LINE",
        readout: (v) => (v < 0.4 ? "drifting off the string" : v > 0.62 ? "drifting off the string" : "on the string line"),
      },
      holdBreakNote: "The joint line drifted off the string. Bring the pattern back onto the string line before continuing.",
    },
    {
      id: "set-edge-restraint", kind: "sequence", anyOrder: true,
      targets: ["edge-restraint-a", "edge-restraint-b"],
      itemNames: { "edge-restraint-a": "edge restraint, near side", "edge-restraint-b": "edge restraint, far side" },
      title: "Set the edge restraint",
      cue: "Set the edge restraint on both sides of the finished pattern before sanding the joints.",
      why: "Edge restraint set on both sides is what actually keeps the whole pattern from spreading apart under foot traffic over the following seasons — a patio finished without it looks the same on day one but starts drifting apart from the edges in by the first summer.",
    },
    {
      id: "sweep-joint-sand", kind: "select", target: "joint-sand",
      title: "Sweep polymeric sand into the joints",
      cue: "Sweep the sand into every joint before the final compaction pass.",
      why: "Sand swept fully into every joint is what locks the pattern together and keeps individual pavers from rocking underfoot — a joint left half-empty is a paver that will work loose the first time real weight crosses it.",
    },
    {
      id: "final-compaction-pass", kind: "select", target: "final-compaction-check",
      title: "Run the final compaction pass",
      cue: "Confirm the final compaction pass has set the sand and seated every paver.",
      why: "The final compaction pass is what actually seats every paver into the sand bed and activates the polymeric joint sand — skipping it leaves a patio that looks finished but has not actually locked together the way the plan's own build-up was designed to.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the hardscape log",
      cue: "Log the locate confirmation, the density reading and the finished pattern before leaving the site.",
      why: "The hardscape log is what the next crew and the next inspection both read — a patio built cleanly but never logged leaves nothing behind to prove the locate was confirmed and the base actually compacted to the plan's own spec.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GKH_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 10, a: "#3d7a3a", b: "#457f44" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );
    const excavation = box(g, 2.6, 0.02, 2.2, 0.3, 0.13, -0.4, 0xffffff, { rough: 0.9, cast: false });
    excavation.material = texturedMat(
      surfaceTexture((cx, w, h) => gravelFace(cx, w, h, {}), { repeat: 4, px: 384 }),
      { rough: 0.9, metal: 0.02, color: 0xb0a890 },
    );
    holoTag(excavation, "paver base", 0, 0.4, -1.2, { css: "#9a8060", w: 0.3 });

    // ------------------------------------------------------------------ hazards found on the walk
    const utilityMarker = box(g, 0.06, 0.2, 0.06, -1.6, 0.15, 1.0, 0x6a6a5a, { rough: 0.6 });
    reg(hits, utilityMarker, "utility-marker-unclear");
    const treeRoot = cyl(g, 0.04, 0.05, 1.0, -0.8, 0.05, 0.2, 0x5b4530, { rough: 0.9, seg: 10 });
    treeRoot.rotation.z = Math.PI / 2.2;
    reg(hits, treeRoot, "tree-root-in-path");
    const drainageIssue = box(g, 0.4, 0.02, 0.3, 1.4, 0.15, 1.0, 0x3a4a2a, { rough: 0.8, cast: false });
    reg(hits, drainageIssue, "drainage-slope-issue");
    const clearArea = group(g, 1.8, 0.15, 1.6);
    reg(hits, clearArea, "clear-excavation-area");
    const clearAreaMesh = box(clearArea, 0.4, 0.008, 0.3, 0, 0, 0, 0x3f7a3f, { rough: 0.85, cast: false });

    const digHazardZone = box(g, 0.3, 0.02, 0.3, -1.6, 0.16, 1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, digHazardZone, "dig-over-marked-utility");

    // ------------------------------------------------------------------ paperwork
    const planBoard = holoPanel(g, 0.58, 0.42, -2.4, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9a8060"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("HARDSCAPE PLAN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Base depth: per the plan", "Pattern: per the plan", "Edge restraint: both sides"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: 0.7, accent: GKH_ACCENT });
    reg(hits, planBoard, "plan-board");

    const locateBoard = group(g, -2.4, 0, 0.6, 0.4);
    box(locateBoard, 0.3, 0.4, 0.03, 0, 0.2, 0, 0x2b3138, { rough: 0.6 });
    const locateFace = decal(locateBoard, 0.26, 0.34, 0, 0.2, 0.017, signFace("LOCATE\nTICKETS ON FILE", { bg: "#0d1c24", accent: "#9a8060", scale: 0.22 }), { px: 192 });
    reg(hits, locateFace, "locate-board");

    const gradeCheckHit = group(excavation, -0.6, 0.02, 0.5);
    const gradeCheckMesh = box(gradeCheckHit, 0.2, 0.008, 0.2, 0, 0, 0, 0x9a8060, { rough: 0.8, cast: false });
    reg(hits, gradeCheckHit, "grade-check");
    const excavateHit = group(excavation, 0.5, 0.02, -0.5);
    const excavateMesh = box(excavateHit, 0.3, 0.008, 0.3, 0, 0, 0, 0x9a8060, { rough: 0.8, cast: false });
    reg(hits, excavateHit, "excavate-to-depth");

    // ------------------------------------------------------------------ compactor + tools
    const compactor = group(g, -1.7, 0.14, 1.6, -1.3);
    const compactorPlate = box(compactor, 0.35, 0.1, 0.45, 0, 0.05, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    reg(hits, compactorPlate, "compactor-near-foot");
    const compactorEngine = box(compactor, 0.28, 0.24, 0.3, 0, 0.28, -0.1, GKH_ACCENT, { rough: 0.5, metal: 0.3 });
    const compactorHandleObj = box(compactor, 0.03, 0.03, 0.5, 0, 0.45, -0.5, 0x2b2f34, { rough: 0.5 });
    reg(hits, compactorHandleObj, "compactor-handle");
    const killSwitchObj = ball(compactor, 0.025, 0.1, 0.5, -0.5, 0xd2312b, { emissive: 0xd2312b, ei: 0.6, rough: 0.4, seg: 12 });
    reg(hits, killSwitchObj, "compactor-kill-switch");
    const reachUnderZone = box(compactor, 0.3, 0.06, 0.4, 0, 0.02, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reachUnderZone, "reach-under-running-compactor");
    holoTag(compactor, "plate compactor", 0, 0.6, 0, { css: "#9a8060", w: 0.32 });

    const screedBolt = cyl(g, 0.015, 0.015, 0.04, 0.4, 0.16, -1.4, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, screedBolt, "screed-adjust-bolt");

    const densityInst = instrument(g, 2.4, 0.9, 1.4, { ry: -0.4, idle: "-- %", color: GKH_ACCENT });
    holoTag(densityInst, "density gauge", 0, 0.16, 0, { css: "#9a8060", w: 0.28 });
    reg(hits, densityInst, "density-gauge");

    const aggregateBagObj = group(g, -2.4, 0, 1.6, 0.4);
    box(aggregateBagObj, 0.24, 0.16, 0.16, 0, 0.08, 0, 0xb0a890, { rough: 0.8 });
    reg(hits, aggregateBagObj, "aggregate-bag");
    const baseSocket = group(g, 0.3, 0, -0.4);
    hits["base-area-socket"] = baseSocket;

    const pavers = group(g, -2.0, 0.14, -0.6, 0.4);
    for (let i = 0; i < 4; i++) box(pavers, 0.2, 0.03, 0.2, i * 0.02, 0.03 + i * 0.032, i * 0.02, 0x8a8580, { rough: 0.7 });
    reg(hits, pavers, "lift-pavers-improper");

    const stringPost1 = cyl(g, 0.01, 0.01, 0.4, -0.9, 0.32, -1.2, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    const stringPost2 = cyl(g, 0.01, 0.01, 0.4, 1.4, 0.32, -1.2, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    const paverString = box(g, 2.3, 0.005, 0.005, 0.25, 0.5, -1.2, 0xf2c14b, { rough: 0.4, cast: false });
    reg(hits, paverString, "paver-string");

    const edgeA = box(g, 2.6, 0.06, 0.06, 0.3, 0.16, -1.5, 0x2b3138, { rough: 0.6 });
    reg(hits, edgeA, "edge-restraint-a");
    const edgeB = box(g, 2.6, 0.06, 0.06, 0.3, 0.16, 0.7, 0x2b3138, { rough: 0.6 });
    reg(hits, edgeB, "edge-restraint-b");

    const jointSandObj = group(g, 1.8, 0, -1.0, 0.4);
    box(jointSandObj, 0.24, 0.16, 0.16, 0, 0.08, 0, 0xd8c9a0, { rough: 0.85 });
    reg(hits, jointSandObj, "joint-sand");

    const finalCheckHit = box(excavation, 0.5, 0.008, 0.5, 0.2, 0.011, 0.3, 0x8a8580, { rough: 0.7, cast: false });
    reg(hits, finalCheckHit, "final-compaction-check");

    const chest = toolChest(g, 2.6, -0.6, { ry: -0.5, color: GKH_ACCENT });
    const gloveProp = box(chest, 0.1, 0.05, 0.02, -0.2, 0.79, 0.06, 0x8a6a3a, { rough: 0.8 });
    reg(hits, gloveProp, "work-gloves");
    const eyeProp = box(chest, 0.1, 0.04, 0.02, -0.08, 0.79, 0.06, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");
    const earProp = group(chest, 0.06, 0.79, 0.06);
    torus(earProp, 0.045, 0.012, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 16 });
    reg(hits, earProp, "ear-protection");

    const stopWorkFlag = group(g, -2.6, 0, 2.1, 0.4);
    ball(stopWorkFlag, 0.03, 0, 0.5, 0, 0xd2312b, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, stopWorkFlag, "stop-work-call");

    const closingLog = group(g, 2.7, 0, -2.0, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("HARDSCAPE LOG\nOPEN", { bg: "#11181f", accent: "#9a8060", scale: 0.2 }), { px: 320 });
    holoTag(closingLog, "hardscape log", 0, 1.34, 0, { css: "#9a8060", w: 0.34 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew
    const crewMember = standingFigure(g, 2.3, 2.0, { ry: -2.0, cloth: 0x2b3138, vest: GKH_ACCENT, helmet: 0xf2f2f2 });
    holoTag(crewMember, "grounds crew", 0, 1.95, 0.15, { css: "#9a8060", w: 0.32 });

    // Coworker prop, hidden until the work-interference interrupt fires.
    const coworker = standingFigure(g, -2.9, -1.4, { ry: 1.8, cloth: 0x4a5a6a });
    coworker.visible = false;

    const dust = particles(compactor, 14, 0xb0a890, { size: 0.02, life: 0.5, additive: false, opacity: 0.18 });
    dust.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "compactor-hits-obstruction") { compactor.rotation.y += 0.2; dust.visible = true; }
        if (it.id === "coworker-steps-on-fresh-pavers") { coworker.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "compactor-hits-obstruction") { compactor.rotation.y -= 0.2; dust.visible = false; }
        if (it.id === "coworker-steps-on-fresh-pavers") { coworker.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walk-the-site") {
          utilityMarker.material = mat(0x59c97b, { rough: 0.6 });
          treeRoot.material = mat(0x59c97b, { rough: 0.6 });
          drainageIssue.material = mat(0x59c97b, { rough: 0.6, cast: false });
        }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("HARDSCAPE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.2 }));
        }
      },
      onHazard(hitId) { if (hitId === "dig-over-marked-utility") { dust.visible = true; } },

      animate(t, dt, session) {
        crewMember.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (coworker.visible) coworker.position.x = -2.9 + (t % 2) * 0.5;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.2, 0), 0.1, 0.1, -0.1);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-base-density") {
          const pct = Math.round(82 + gg.t * 20);
          repaint(densityInst.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.8 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
