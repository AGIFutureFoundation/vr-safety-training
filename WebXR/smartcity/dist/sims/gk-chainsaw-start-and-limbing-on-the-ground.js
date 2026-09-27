import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, texturedMat, grassFace, woodGrainFace, palette, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Chainsaw Start & Limbing on the Ground VR — Grounds &
// Landscaping.
//
// A downed log limbed on the ground: the chaps, helmet and hearing and hand
// protection on before the saw is touched, the log walked for a spring pole
// and buried debris before the chain ever turns, the saw started braced on
// the ground in its own order, the chain brake proven before the throttle is
// trusted, and every limbing cut made braced, two-handed and with the bar's
// own kickback zone kept clear of anyone else on the crew. No kickback angle
// or chain speed this platform is not certain of appears here — only "per
// the operator's manual" and "per the manufacturer's chain brake spec".

const GKC_ACCENT = 0xd2601c;
const GKC_PAL = palette("grounds");

export const SIM_GK_CHAINSAW_START_AND_LIMBING_ON_THE_GROUND = {
  id: "gk-chainsaw-start-and-limbing-on-the-ground",
  index: "gk-06",
  domain: "Grounds & Landscaping",
  trade: "Grounds tree crew member — AFSCME parks and grounds crew",
  category: "Grounds & Landscaping",
  district: "open-range",
  weather: "clear",
  certification: "ANSI B175 chainsaw safety specifications and ANSI Z133 safety requirements for arboricultural operations; OSHA 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.133 eye and face protection, 29 CFR 1910.95 occupational noise exposure and 29 CFR 1910.138 hand protection; NIOSH guidance on chainsaw kickback and struck-by incidents; AFSCME parks and grounds member training",
  name: "Chainsaw Start & Limbing on the Ground",
  title: simTitle("Chainsaw Start & Limbing on the Ground"),
  tagline: "A downed log limbed on the ground: chaps and PPE on first, the log walked for a spring pole and buried debris, the saw started braced in its own order, the chain brake proven, and every cut made braced, two-handed and clear of anyone else nearby",
  accent: GKC_ACCENT,
  accentCss: "#d2601c",
  parSeconds: 305,
  footprint: 2.8,
  badge: { id: "brake-proven", name: "Brake Proven", note: "PPE on, the log walked for a spring pole, the saw started braced, the chain brake proven, and every cut kept two-handed and clear of the kickback zone" },

  supportLine: "your union steward or the parks department's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Saw Operator", "Chainsaw Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "chaps-on", name: "Chaps On", note: "Never started the saw without the full PPE set", test: AWARD.stepClean("ppe-up") },
      { id: "brake-checked", name: "Brake Checked", note: "Proved the chain brake before trusting the throttle", test: AWARD.stepClean("prove-chain-brake") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-limb", name: "Steady Limb", note: "Held the brace and the chain tension gauge near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-limb", name: "Quick Limbing", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "cut-spring-pole-blind": "You cut straight into that bent sapling without releasing its tension from the correct side. A limb or a sapling bent like that is storing energy the same way a drawn bow does, and cutting it from the wrong side lets that energy release toward whoever is standing where the whip actually travels.",
    "carry-saw-running": "You walked with the saw still running instead of engaging the chain brake first. A running chain swinging at leg height while someone walks is one stumble away from a cut that has nothing to do with the tree at all — the chain brake exists exactly for the distance between one cut and the next.",
    "one-hand-operation": "You ran the saw one-handed. A chainsaw's own kickback happens fast enough that only a full two-handed grip, thumb wrapped under the front handle, gives the operator any real chance of controlling the bar when the tip catches something it should not.",
    "reach-across-body-cut": "You cut with the bar swung across your own legs. Keeping the saw beside the body instead of across it is what keeps a kickback or a slipped cut aimed at open ground instead of at the operator's own knee.",
  },

  lateNotes: {
    "spring-pole": "A bent sapling like this is under real stored tension — the release path gets planned and the cut made from the correct side, never assumed safe because it looks like ordinary brush.",
    "chain-brake-lever": "The chain brake gets proven at idle, engine running, before the throttle is ever trusted on the actual log — not assumed to work because it worked yesterday.",
  },

  interrupts: [
    {
      id: "log-rolls-mid-cut",
      kind: "Load shift",
      after: "brace-and-limb", delay: 3, seconds: 10,
      alert: "The log has started to roll as the last limb's tension releases, shifting toward the operator's stance.",
      cue: "Call the retreat and step clear before the roll continues.",
      target: "retreat-call",
      why: "A log that starts rolling under a released limb does not stop rolling on its own, and calling the retreat immediately — rather than trying to finish the cut from a stance that is no longer stable — is what keeps a shifting load from catching a leg or a foot that was braced for a log that was not moving.",
      missNote: "The cut continued while the log kept rolling. A load that is already moving does not wait for the last cut to finish.",
      wrongNote: "Not that — the retreat call is what this roll needs, before the cut continues.",
    },
    {
      id: "coworker-in-kickback-zone",
      kind: "Bystander incursion",
      after: "track-kickback-zone", delay: 4, seconds: 11,
      alert: "A coworker has stepped into the bar's kickback zone from behind while the saw is running.",
      cue: "Stop the saw at the throttle's own stop lever before the cut continues.",
      target: "stop-saw-lever",
      why: "The kickback zone is the one place nobody but the operator should ever stand while the saw is running, and a coworker who has stepped into it needs the saw stopped immediately — not warned about it after the fact, when a kickback would already have reached them.",
      missNote: "The saw kept running while the coworker was still in the kickback zone. A kickback happens too fast for a shout to be the thing that saves someone standing there.",
      wrongNote: "Not that — stop the saw before anything else about this cut continues.",
    },
  ],

  steps: [
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["chainsaw-chaps", "face-screen-helmet", "ear-protection", "cut-gloves"],
      itemNames: { "chainsaw-chaps": "chainsaw chaps", "face-screen-helmet": "helmet with face screen", "ear-protection": "ear protection", "cut-gloves": "cut-resistant gloves" },
      title: "Suit up before touching the saw",
      cue: "Chaps, helmet with face screen, ear protection and cut-resistant gloves before the saw comes off the truck.",
      why: "Chainsaw chaps are built to jam a moving chain the instant it contacts them, a face screen and hearing protection cover what a running saw throws and how loud it runs, and none of that protection works retroactively — it goes on before the saw is even started, not after the first close call.",
    },
    {
      id: "read-job-plan", kind: "select", target: "job-plan-board",
      title: "Read the limbing job plan",
      cue: "Check the plan's own escape route and limbing order before starting the saw.",
      why: "The job plan is where the crew's own read of this log — which side to work from, where the escape route is — gets written down before the saw starts, so the work follows a plan built on an actual look at the log rather than on assumption.",
    },
    {
      id: "walk-the-log", kind: "find", noHint: true,
      targets: ["spring-pole", "buried-debris", "bystander-too-close"],
      itemNames: { "spring-pole": "the bent sapling under tension", "buried-debris": "debris buried in the log's bark", "bystander-too-close": "a coworker standing too close to the log" },
      itemNotes: {
        "spring-pole": "A sapling bent like this is storing energy the same way a drawn bow does — it gets planned around, not treated like ordinary brush.",
        "buried-debris": "Debris buried in bark is exactly what a chain catches and kicks back on before the operator ever sees it coming.",
        "bystander-too-close": "Anyone standing this close to the log is inside the saw's own working radius before the first cut is even made.",
      },
      decoyNotes: { "clear-work-area": "That stretch of the log is clean bark with clear ground around it. Nothing to flag there." },
      title: "Walk the log before starting the saw",
      cue: "Three things about this log change the plan — find them before the chain ever turns.",
      why: "A downed log that looks like a straightforward limbing job from a distance is not the same thing as a log someone has actually walked and checked, and a spring pole, buried debris or a coworker standing too close are exactly what a walk-down catches before the saw starts.",
    },
    {
      id: "chainsaw-precheck", kind: "sequence", anyOrder: true,
      targets: ["chain-tension-check", "chain-brake-check", "bar-oil-check"],
      itemNames: { "chain-tension-check": "chain tension", "chain-brake-check": "chain brake function", "bar-oil-check": "bar oil level" },
      title: "Precheck the saw",
      cue: "Confirm the chain tension, the chain brake and the bar oil level before fuelling or starting.",
      why: "A loose chain, a chain brake that does not engage, or a dry bar are three separate ways this saw fails exactly when it is needed most — confirming all three before it ever starts is what makes the saw something the operator can trust rather than something they are hoping still works.",
    },
    {
      id: "fuel-the-saw", kind: "select", target: "fuel-cap",
      title: "Fuel the saw safely",
      cue: "Fuel the saw on cool, level ground, away from any ignition source, before starting it.",
      why: "Fuelling a hot saw or fuelling near an ignition source turns a routine top-off into a flash fire risk — doing it on cool, level ground away from anything that could spark is what keeps this the safest five minutes of the whole job, not the most dangerous.",
    },
    {
      id: "start-the-saw", kind: "sequence", anyOrder: false,
      targets: ["choke-set", "ground-brace", "pull-cord"],
      itemNames: { "choke-set": "set the choke", "ground-brace": "brace the saw on the ground", "pull-cord": "pull the starter cord" },
      outOfOrderNote: "That is out of the ground-start's own order. Choke, then brace the saw on the ground, then pull — out of order is exactly how a saw gets started off-balance in someone's hands instead of braced and controlled.",
      title: "Start the saw braced on the ground",
      cue: "Set the choke, brace the saw against the ground with a foot through the rear handle, then pull the cord — in that order.",
      why: "Starting the saw braced on the ground rather than held free in the air is what keeps the first pull from being the moment the saw gets away from the operator — the choke, the brace and the pull each set up the next step in an order that exists because a cold saw starting off-balance is how a foot or a hand ends up in the chain's own path.",
    },
    {
      id: "prove-chain-brake", kind: "select", target: "chain-brake-lever",
      title: "Prove the chain brake",
      cue: "Engage the chain brake at idle and confirm it stops the chain before trusting the throttle.",
      why: "A chain brake proven at idle, engine running, is a fact the operator can trust the rest of the job on — a chain brake assumed to work because it worked yesterday is a guess the first real kickback would be the wrong moment to find out about.",
    },
    {
      id: "position-log", kind: "turn", target: "cant-hook",
      title: "Roll the log into a stable position",
      cue: "Turn the cant hook to roll the log so the limb being cut is clear of the ground.",
      why: "A limb pinned against the ground pinches the bar the instant the cut opens it, and rolling the log with the cant hook so the cut limb has room to fall clear is what keeps that cut from binding the chain halfway through.",
      turn: { turns: 0.4, axis: "z", label: "CANT HOOK" },
    },
    {
      id: "brace-and-limb", kind: "hold", target: "limbing-grip", seconds: 5,
      title: "Brace and limb the log",
      cue: "Hold a two-handed, braced stance for the full limbing pass along the log.",
      why: "A braced, two-handed stance held for the whole pass — not just the first cut — is what actually gives the operator control if the bar catches something in the bark or a limb springs back unexpectedly, rather than a grip that was only ever set up for the easy first cut.",
      holdBreakNote: "Released the brace before the pass finished. Hold the two-handed stance for the whole limbing pass, every time.",
    },
    {
      id: "track-kickback-zone", kind: "track", target: "spotter", seconds: 8,
      title: "Keep the kickback zone clear",
      cue: "Keep the spotter's signal steady, confirming the bar's kickback zone stays clear of anyone else the whole pass.",
      why: "The kickback zone is the one place nobody but the operator should be standing while the saw runs, and the spotter watching it from a clear angle is what catches a coworker drifting into it before the operator — focused on the cut — ever notices.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.12,
        label: "KICKBACK ZONE",
        readout: (v) => (v < 0.4 ? "zone compromised — stop the cut" : v > 0.62 ? "zone compromised — stop the cut" : "zone clear, signal steady"),
      },
      holdBreakNote: "The kickback zone signal dropped out of the clear band. Stop cutting until the zone reads clear again.",
    },
    {
      id: "drag-limb-clear", kind: "drag", target: "cut-limb",
      title: "Drag the cut limb to the brush pile",
      cue: "Carry the cut limb clear of the log and stage it at the brush pile.",
      why: "Clearing each limb to the brush pile as it is cut, rather than letting them pile up around the log, keeps the footing around the saw open for the next cut instead of turning the work area into its own tripping hazard.",
      drag: { to: "brush-pile-socket", radius: 0.4, missNote: "Not at the brush pile — carry the limb to where the brush pile actually is." },
    },
    {
      id: "check-chain-tension-gauge", kind: "gauge", target: "chain-tension-gauge",
      title: "Recheck the chain tension",
      cue: "Read the tension gauge partway through the job and commit only inside the manufacturer's band.",
      why: "A chain stretches as it warms up through a job, and a tension check partway through — not just at the start — is what catches a chain that has gone loose enough to derail before it actually does, mid-cut, in the operator's own hands.",
      gauge: {
        label: "CHAIN TENSION", speed: 0.6, green: [0.42, 0.66],
        readout: (t) => `${Math.round(20 + t * 60)}% deflection`,
        missNote: "Outside the manufacturer's band. Adjust the tension and let the reading settle before committing it.",
      },
    },
    {
      id: "shutdown-saw", kind: "select", target: "shutdown-switch",
      title: "Shut the saw down properly",
      cue: "Engage the chain brake and shut the engine off before setting the saw down.",
      why: "A saw set down with the chain brake off and the engine still idling is a saw that can be bumped into gear by nothing more than its own vibration — shutting it down properly before it is ever set aside is what keeps it inert until the next cut actually starts.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the chainsaw log",
      cue: "Log the precheck, the chain tension reading and the completed limbing before leaving the site.",
      why: "The chainsaw log is what the next operator and the next inspection both read — a job run cleanly but never logged leaves nothing behind to prove the precheck and the chain brake were actually proven before the first cut.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GKC_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 10, a: "#3d7a3a", b: "#457f44" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );

    // ------------------------------------------------------------------ the log
    const log = group(g, 0.3, 0.14, 0.4, 0.2);
    const logMesh = cyl(log, 0.22, 0.24, 2.6, 0, 0.22, 0, 0xffffff, { rough: 0.85, seg: 16 });
    logMesh.rotation.z = Math.PI / 2;
    logMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, {}), { repeat: 3, px: 384 }),
      { rough: 0.9, metal: 0.02, color: 0x8a7050 },
    );
    for (const lx of [-0.9, -0.3, 0.3, 0.9]) {
      const limb = cyl(log, 0.04, 0.06, 0.5, lx, 0.4, 0.15, 0x6a5a3a, { rough: 0.85, seg: 10 });
      limb.rotation.x = -0.6;
    }
    holoTag(log, "downed log", 0, 0.7, 0, { css: "#d2601c", w: 0.28 });

    const debris = ball(log, 0.03, 0.6, 0.35, 0, 0x4a4038, { rough: 0.8, seg: 8 });
    reg(hits, debris, "buried-debris");
    const clearSection = group(log, -0.6, 0.22, 0);
    reg(hits, clearSection, "clear-work-area");
    const clearMesh = box(clearSection, 0.3, 0.02, 0.3, 0, 0, 0.3, 0x4a3a28, { rough: 0.7, cast: false });

    const springPole = group(g, 1.6, 0, 0.6, 0.6);
    cyl(springPole, 0.02, 0.03, 1.0, 0, 0.45, 0, 0x4a6b3a, { rough: 0.85, seg: 10 }).rotation.z = 0.4;
    reg(hits, springPole, "spring-pole");

    const bystander = standingFigure(g, 1.6, 1.5, { ry: -2.2, cloth: 0x2b3138 });
    reg(hits, bystander, "bystander-too-close");

    // ------------------------------------------------------------------ job plan + saw
    const board = holoPanel(g, 0.58, 0.42, -2.4, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d2601c"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LIMBING JOB PLAN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Escape route: marked clear", "Work from the uphill side", "Kickback zone: crew clear"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: 0.7, accent: GKC_ACCENT });
    reg(hits, board, "job-plan-board");

    const saw = group(g, -1.6, 0.14, 1.4, -1.1);
    const sawBody = box(saw, 0.3, 0.2, 0.14, 0, 0.1, 0, GKC_ACCENT, { rough: 0.5, metal: 0.2 });
    const bar = box(saw, 0.5, 0.04, 0.02, 0.4, 0.14, 0, 0x2b2f34, { rough: 0.4, metal: 0.5 });
    const chainMesh = box(saw, 0.5, 0.01, 0.03, 0.4, 0.12, 0, 0x9aa1a8, { rough: 0.3, metal: 0.7 });
    reg(hits, chainMesh, "chain-tension-check");
    const brakeLever = box(saw, 0.06, 0.04, 0.02, -0.05, 0.24, 0.06, 0xf2c14b, { rough: 0.5 });
    reg(hits, brakeLever, "chain-brake-check");
    const oilCap = cyl(saw, 0.02, 0.02, 0.02, -0.12, 0.2, -0.05, 0x2f6f4a, { rough: 0.5, metal: 0.4, seg: 10 });
    reg(hits, oilCap, "bar-oil-check");
    const fuelCapObj = cyl(saw, 0.025, 0.025, 0.02, 0.02, 0.2, -0.05, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 10 });
    reg(hits, fuelCapObj, "fuel-cap");
    const chokeLeverObj = box(saw, 0.03, 0.04, 0.02, -0.14, 0.1, 0.06, 0x2b2f34, { rough: 0.5 });
    reg(hits, chokeLeverObj, "choke-set");
    const braceMark = box(saw, 0.1, 0.01, 0.06, 0, -0.02, 0, 0x2b2f34, { rough: 0.6 });
    reg(hits, braceMark, "ground-brace");
    const pullCordObj = ball(saw, 0.02, 0.12, 0.06, 0, 0xf2f2ea, { rough: 0.6, seg: 10 });
    reg(hits, pullCordObj, "pull-cord");
    const chainBrakeLever2 = box(saw, 0.06, 0.03, 0.02, -0.05, 0.26, 0.06, 0xf2c14b, { rough: 0.5, transparent: true, opacity: 0.001 });
    reg(hits, chainBrakeLever2, "chain-brake-lever");
    const gripHandle = box(saw, 0.04, 0.06, 0.14, -0.16, 0.1, 0, 0x2b2f34, { rough: 0.5 });
    reg(hits, gripHandle, "limbing-grip");
    const stopLeverObj = box(saw, 0.04, 0.04, 0.02, -0.02, 0.28, 0.06, 0xd2312b, { rough: 0.5 });
    reg(hits, stopLeverObj, "stop-saw-lever");
    const shutdownSwitchObj = box(saw, 0.03, 0.03, 0.02, 0.08, 0.24, 0.06, 0x2b3138, { rough: 0.5 });
    reg(hits, shutdownSwitchObj, "shutdown-switch");
    holoTag(saw, "chainsaw", 0, 0.5, 0, { css: "#d2601c", w: 0.26 });

    const realTensionGauge = instrument(g, 2.4, 0.9, 1.2, { ry: -0.4, idle: "-- %", color: GKC_ACCENT });
    holoTag(realTensionGauge, "chain tension gauge", 0, 0.16, 0, { css: "#d2601c", w: 0.36 });
    reg(hits, realTensionGauge, "chain-tension-gauge");

    const oneHandZone = box(g, 0.2, 0.16, 0.2, -1.6, 0.24, 1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, oneHandZone, "one-hand-operation");
    const reachAcrossZone = box(g, 0.3, 0.16, 0.3, 0.3, 0.3, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reachAcrossZone, "reach-across-body-cut");
    const carryRunningZone = box(g, 0.3, 0.2, 0.3, -0.8, 0.25, 2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, carryRunningZone, "carry-saw-running");
    const springPoleBlindZone = box(springPole, 0.2, 0.2, 0.2, 0, 0.4, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, springPoleBlindZone, "cut-spring-pole-blind");

    const cantHook = group(g, 0.9, 0.14, 0.9, -0.4);
    cyl(cantHook, 0.015, 0.015, 0.7, 0, 0.35, 0, 0x6a5a3a, { rough: 0.7, seg: 10 });
    reg(hits, cantHook, "cant-hook");

    const brushPile = group(g, 2.3, 0, 1.6, 0.3);
    for (let i = 0; i < 4; i++) cyl(brushPile, 0.03, 0.04, 0.5, i * 0.1, 0.05, i * 0.03, 0x6a5a3a, { rough: 0.85, seg: 8 });
    const brushSocket = group(g, 2.3, 0, 1.6);
    hits["brush-pile-socket"] = brushSocket;

    const cutLimb = group(g, 0.0, 0.14, 0.9, 0.3);
    cyl(cutLimb, 0.04, 0.05, 0.4, 0, 0.1, 0, 0x6a5a3a, { rough: 0.85, seg: 10 });
    reg(hits, cutLimb, "cut-limb");

    const closingLog = group(g, 2.7, 0, -2.0, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("CHAINSAW LOG\nOPEN", { bg: "#11181f", accent: "#d2601c", scale: 0.22 }), { px: 320 });
    holoTag(closingLog, "chainsaw log", 0, 1.34, 0, { css: "#d2601c", w: 0.34 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.6, 0, 1.0, 0.4);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const chapsProp = box(ppeRack, 0.16, 0.3, 0.02, -0.08, 0.35, 0, 0xf2c14b, { rough: 0.75 });
    reg(hits, chapsProp, "chainsaw-chaps");
    const helmetProp = group(ppeRack, 0.08, 0.6, 0);
    ball(helmetProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    reg(hits, helmetProp, "face-screen-helmet");
    const earProp = group(ppeRack, 0.02, 0.5, 0.08);
    torus(earProp, 0.045, 0.012, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 16 });
    reg(hits, earProp, "ear-protection");
    const gloveProp = box(ppeRack, 0.1, 0.05, 0.02, 0.18, 0.5, 0, 0x8a6a3a, { rough: 0.8 });
    reg(hits, gloveProp, "cut-gloves");

    const retreatFlag = group(g, -1.9, 0, 2.1, 0.4);
    ball(retreatFlag, 0.03, 0, 0.5, 0, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, retreatFlag, "retreat-call");

    // ------------------------------------------------------------------ crew
    const spotter = standingFigure(g, 1.9, -0.6, { ry: -1.9, cloth: 0x2b3138, vest: GKC_ACCENT, helmet: 0xf2f2f2 });
    holoTag(spotter, "spotter", 0, 1.95, 0.15, { css: "#d2601c", w: 0.24 });
    reg(hits, spotter, "spotter");

    // Coworker prop, hidden until the kickback-zone interrupt fires.
    const coworker = standingFigure(g, -2.9, 0.6, { ry: 1.8, cloth: 0x4a5a6a });
    coworker.visible = false;

    const dust = particles(log, 12, 0x9a8a6a, { size: 0.02, life: 0.5, additive: false, opacity: 0.16 });
    dust.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "log-rolls-mid-cut") { log.rotation.x = 0.25; dust.visible = true; }
        if (it.id === "coworker-in-kickback-zone") { coworker.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "log-rolls-mid-cut") { log.rotation.x = 0; dust.visible = false; }
        if (it.id === "coworker-in-kickback-zone") { coworker.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walk-the-log") {
          debris.material = mat(0x59c97b, { rough: 0.6 });
          springPole.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "position-log") { log.rotation.x = 0.15; }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("CHAINSAW LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.22 }));
        }
      },
      onHazard(hitId) { if (hitId === "cut-spring-pole-blind") { springPole.rotation.z = -0.6; } },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (coworker.visible) coworker.position.x = -2.9 + (t % 2) * 0.5;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.3, 0), 0.1, 0.1, -0.1);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-chain-tension-gauge") {
          const pct = Math.round(20 + gg.t * 60);
          repaint(realTensionGauge.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.66 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
