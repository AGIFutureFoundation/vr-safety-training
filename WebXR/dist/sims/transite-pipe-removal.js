import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Transite Pipe Removal VR — Water & Environmental, station
// eighty-eight, and another of the trade procedures the demolition-side
// unions run on a former shipyard parcel under a federal cleanup order — no
// real site is named and nothing here dramatises any one cleanup's history.
//
// A run of asbestos-cement (transite) water pipe, dug up out of an
// excavation as OSHA Class II asbestos work. The whole discipline here is
// that the pipe never gets to dry out and never meets a power tool: amended
// water keeps the fibre bound to the material instead of the air, and a hand
// snap cutter or hand saw parts the pipe the way a circular saw never could
// without aerosolising the cut face it just made. Station abatement-chamber
// covers the negative-pressure containment side of asbestos work indoors;
// this is the open-excavation Class II procedure a pipe crew actually runs.

const TPR_ACCENT = 0xd8232a;
const TPR_WHITE = 0xe8e2d4;

export const SIM_TRANSITE_PIPE_REMOVAL = {
  id: "transite-pipe-removal",
  index: "88",
  domain: "Environmental",
  trade: "Asbestos abatement laborer and pipefitter — LIUNA asbestos laborer, UA Local 38 pipefitter, IUOE Local 3 excavation operator",
  category: "Water & Environmental",
  weather: "wind",
  certification: "LIUNA asbestos and hazmat laborers, Cal/OSHA-registered for asbestos work, with UA Local 38 on the pipe and IUOE Local 3 on the excavation; OSHA 29 CFR 1926.1101 Class II asbestos work; EPA NESHAP 40 CFR 61 Subpart M; the local air district's asbestos notification; OSHA 29 CFR 1926 Subpart P excavations",
  name: "Transite Pipe Removal",
  title: simTitle("Transite Pipe Removal"),
  tagline: "Asbestos-cement water pipe out of an excavation as Class II work: wetted and kept wet, cut with a snap cutter — never a power saw — double-bagged at the point of removal, and the air sampling pump running the whole time",
  accent: TPR_ACCENT,
  accentCss: "#d8232a",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "pipe-out-clean", name: "Pipe Out Clean", note: "A transite run removed wet, hand-cut, bagged at the point of removal and manifested, with the sampling pump running the whole job" },

  game: system({
    name: "Fibre Control",
    currency: "FIBRE",
    ranks: ["Ground Hand", "Wet-Method Crew", "Lead Laborer", "Regulated-Area Authority", "Fibre Control Certified"],
    badges: [
      { id: "never-dry", name: "Never Dry", note: "The pipe face was wet through every cut, first time", test: AWARD.stepClean("cut-pipe") },
      { id: "hand-tools-only", name: "Hand Tools Only", note: "Never reached for a power tool on this pipe", test: AWARD.safe },
      { id: "steady-cut", name: "Steady Cut", note: "Held the cutter's feed inside the safe band the whole cut", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-pull", name: "Clean Pull", note: "No corrections anywhere in the removal", test: AWARD.clean },
      { id: "unbroken-wet", name: "Unbroken Wet", note: "Never broke the wet-method hold", test: AWARD.unbroken },
      { id: "bagged-fast", name: "Bagged Fast", note: "Section bagged and the manifest signed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "power-saw": "You reached for the circular saw sitting on the bench. A power saw spinning through asbestos-cement pipe aerosolises exactly the fibre the wet method exists to bind — that is the one tool OSHA's Class II asbestos rule takes off the table outright, no matter how much amended water is standing by.",
    "dry-cut": "You lined up on the stub that was never wetted. A dry face under a snap cutter sheds fibre the instant the blade bites, and 'it's only one cut' is how a Class II job turns into an air sample nobody wants to open — the water goes on before the tool does, every section, no exceptions.",
    "unwrapped-toss": "You tossed the cut section onto the spoil pile instead of bagging it where it came out. A section of transite sitting loose on open ground is a source the wind and every boot on this excavation can spread — it gets sealed in two labelled bags at the point of removal, not carried anywhere first.",
    "early-mask-off": "You pulled the respirator off before you were clear of the regulated area boundary. Fibre that settled on the outside of that mask and on your skin is still on you at the boundary line — the respirator comes off on the clean side of decon, not the moment the last section is in the bag.",
  },

  lateNotes: {
    "sprayer": "Nothing to wet yet — the pipe has to actually be exposed and the regulated area set before the sprayer does any good out here.",
    "snap-cutter": "The cutter waits until the face in front of it is wet — a dry face under a blade is the thing this whole procedure exists to prevent.",
    "waste-bag": "Nothing to bag until a section is actually cut free — a bag opened before there's a section is just an open bag standing in the regulated area.",
    "manifest-clipboard": "Nothing to sign until the section is bagged, labelled and out at the load-out — a manifest for a shipment that doesn't exist yet is a guess.",
  },

  // Interruptions: see the interrupt layer in shared/game.js. Both are armed
  // on a hold or a track step and neither is answerable by its host step's
  // own control.
  interrupts: [
    {
      id: "wind-dries-face",
      kind: "Wind gust",
      after: "cut-pipe", delay: 3, seconds: 12,
      alert: "A gust just swept down the excavation and the cut face has gone matte and pale — the water on it is drying out while the cutter is still on the pipe.",
      cue: "Get the sprayer back on that face before the cutter goes through it dry.",
      target: "sprayer",
      why: "A face that reads wet a minute ago can be dry now — wind off open ground does that in seconds, and a dry face under a moving blade is the one condition the whole wet-method procedure was built to keep from happening. The cutter waits on the water, not the other way round.",
      missNote: "The cutter went through a face that had dried in the wind, and that cut is now an air sample nobody planned on taking.",
      wrongNote: "Not that — the sprayer, back on the face, before the cutter moves again.",
    },
    {
      id: "pump-low-flow",
      kind: "Low flow",
      after: "decon", delay: 3, seconds: 11,
      alert: "The personal air-sampling pump on your belt just alarmed — the flow indicator has dropped into the red, well under the calibrated rate.",
      cue: "Clear the line and get the pump back to its calibrated flow before decon finishes.",
      target: "air-pump",
      why: "A sample pulled at the wrong flow rate is not a smaller version of a real sample — it is a different, uninterpretable number, and the exposure result for this whole shift rides on that pump having run at the rate it was calibrated to, not on it having simply been switched on.",
      missNote: "The pump kept running low-flow through the rest of decon, and the shift's exposure sample is now a number nobody can stand behind.",
      wrongNote: "It's the pump — clear the line and get the flow back to the calibrated rate before anything else here.",
    },
  ],

  steps: [
    {
      id: "notification", kind: "select", target: "work-plan",
      title: "Read the notification and the work plan",
      cue: "Confirm the NESHAP notification, the work plan and the Cal/OSHA asbestos registration before anyone breaks ground.",
      why: "The notification is what tells the air district and the regulators this specific excavation is happening, on this schedule, with this material — a crew that starts cutting before that clock has run is doing the work outside the only oversight this job is required to have.",
    },
    {
      id: "shore", kind: "turn", target: "trench-shield",
      title: "Set the trench shield",
      cue: "Crank the screw jacks until the shield is seated tight against both walls of the excavation.",
      why: "An excavation deep enough to expose a buried main is deep enough to kill somebody in a collapse long before the asbestos in the pipe becomes the day's worst hazard — the shield goes in and is proven tight before anyone works below grade, under OSHA's excavation standard, not the asbestos one.",
      turn: { turns: 0.5, axis: "y", label: "JACK" },
    },
    {
      id: "regulated-area", kind: "sequence", anyOrder: true,
      targets: ["regulated-tape", "warning-sign"],
      itemNames: { "regulated-tape": "regulated-area tape", "warning-sign": "asbestos warning signs" },
      title: "Set the regulated area",
      cue: "Tape the boundary around the excavation and post the asbestos warning signs before the pipe is touched.",
      why: "A regulated area is what makes the line between people who are supposed to be exposed to this work and people who are not into something anyone can see, not something they have to already know. Nobody who isn't on this crew has any business crossing that tape, and the sign is what tells them why before they try.",
    },
    {
      id: "expose-pipe", kind: "find", noHint: true,
      targets: ["pipe-crack", "adjacent-utility"],
      itemNames: { "pipe-crack": "a crack already open in the pipe wall", "adjacent-utility": "a live utility crossing close to the pipe" },
      itemNotes: {
        "pipe-crack": "That section already has a crack running through the wall. A pipe that's already compromised is shedding fibre before a single tool touches it — it gets wetted immediately, not on the same schedule as the sound sections.",
        "adjacent-utility": "There's a live utility line crossing within reach of where the cut is planned. That changes where the excavation can widen and where a hand tool can safely swing — it doesn't stop the job, but it moves the plan.",
      },
      title: "Expose the pipe and read what's actually there",
      cue: "Dig it clear and click the two things on this run that change the plan.",
      why: "The drawing says what should be down there; the excavation says what actually is. A crack already open and a utility crossing close by are both things that move where and how this pipe gets cut, and both are invisible until the pipe is dug out in front of you.",
    },
    {
      id: "don-ppe", kind: "sequence",
      targets: ["coveralls", "respirator", "glove-tape"],
      itemNames: { coveralls: "coveralls", respirator: "respirator", "glove-tape": "taped gloves and boot covers" },
      title: "Don PPE in order",
      cue: "Coveralls first, then the respirator, then tape the gloves and boot covers.",
      why: "The respirator seals against skin, which only works once the suit's hood is out of the way — pull the hood up first and the facepiece is sealing against fabric instead of a face. Taping goes on last because it's what keeps a sleeve from riding up while reaching into the trench, which is most of this job.",
      outOfOrderNote: "Coveralls first, then the respirator seated against your face, then gloves and boots taped last.",
    },
    {
      id: "cassette", kind: "gauge", target: "air-pump",
      title: "Calibrate the personal sampling pump",
      cue: "Read the flow indicator and commit once it holds in the calibrated band before you clip it on.",
      why: "This pump's reading is the exposure record for everyone doing this cut today — a pump calibrated wrong reads a number that means nothing, no matter how carefully the rest of the job goes, and there is no way to redo a shift's sample after the fact.",
      gauge: { label: "SAMPLE FLOW", speed: 0.65, green: [0.4, 0.58], readout: (t) => `${(t * 4).toFixed(2)} L/min`, missNote: "Not in the calibrated band. Adjust the pump and check it again before it goes on your belt." },
    },
    {
      id: "wet-pipe", kind: "hold", target: "sprayer", seconds: 5,
      title: "Wet the pipe with amended water",
      cue: "Hold the amended-water spray on the pipe until the whole face is visibly soaked, not just damp.",
      why: "Amended water carries a surfactant so it soaks into the cement matrix instead of beading off it, and that binding is the entire reason this pipe can be cut at all without a containment tent over the trench — a face that's merely misted dries out again before the cutter ever reaches it.",
      holdBreakNote: "Released the sprayer before the face was actually soaked through — a quick pass just wets the surface, and the fibre underneath is still bound to nothing.",
    },
    {
      id: "cut-pipe", kind: "track", target: "snap-cutter", seconds: 8,
      title: "Cut the pipe with the snap cutter",
      cue: "Hold the cutter's feed steady in the band while the chain works through the wetted pipe.",
      why: "A snap cutter or a hand saw parts asbestos-cement the way it's meant to be parted here: slowly, with the wet fibre held in the material instead of thrown into the air. Steady feed is what keeps the cut clean and the face wet through the whole pass — a jerked or rushed cut re-exposes dry material at exactly the edge the blade just made.",
      track: {
        start: 0.12, green: [0.36, 0.56], rise: 0.5, fall: 0.44, drift: 0.12, label: "CUT RATE",
        readout: (v) => (v < 0.36 ? "stalling on the wall" : v > 0.56 ? "forcing the chain" : "cutting steadily"),
      },
      holdBreakNote: "Cut rate out of band — forcing the chain tears the wetted face and stalling it just burnishes a dry ring. Bring it back and hold it there.",
    },
    {
      id: "bag-section", kind: "drag", target: "waste-bag",
      title: "Double-bag the section at the point of removal",
      cue: "Seal the cut section in two labelled bags right where it came out, then carry it to the load-out.",
      why: "Bagging happens at the point of removal because that is the only moment this section is guaranteed to still be wet and still be exactly where the crew can see it — set it down anywhere else first and it is drying out, unlabelled, on open ground.",
      drag: { to: "bag-out-point", radius: 0.45, missNote: "Not at the load-out. A bagged section set down anywhere else in the regulated area still has to be carried through it again." },
    },
    {
      id: "decon", kind: "hold", target: "decon-station", seconds: 5,
      title: "Decon at the boundary",
      cue: "Hold the wash-down at the boundary station until your suit and boots run clear before crossing the tape.",
      why: "The regulated-area boundary is the one place a person crosses from work that is presumed contaminated to ground that isn't — decon here is what keeps that crossing from being the way fibre actually leaves the site, on somebody's boots instead of in a bag.",
      holdBreakNote: "Crossed the boundary before the wash-down finished — the suit and boots were still carrying material from the trench.",
    },
    {
      id: "manifest", kind: "select", target: "manifest-clipboard",
      title: "Complete the waste manifest",
      cue: "Fill out and sign the hazardous-waste manifest for the bagged sections before the load-out truck takes them.",
      why: "Under NESHAP and RCRA together, bagged transite is not a legal shipment until the manifest states what it is, how much, and where it's going — bags at a load-out with no manifest are just bags as far as anyone downstream can prove.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["loose-bag-seam"],
      itemNames: { "loose-bag-seam": "a loose seam on a bagged section" },
      itemNotes: { "loose-bag-seam": "That bag's outer seam never actually sealed. A bag that looks closed but isn't is the same failure as no bag at all, just harder to notice — this is the last look before it goes on the truck." },
      title: "Walk the load-out before the truck leaves",
      cue: "Walk the bagged sections and click the one seam that's still open before the truck pulls out.",
      why: "Cutting the pipe wet and bagging it fast are two different disciplines from actually checking the bags afterward — this walk is the last chance to catch a seal that didn't take before the manifest's promises are out on a public road.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, TPR_ACCENT);

    // -------------------------------------------------------------- ground
    const ground = box(g, 6.0, 0.14, 5.2, 0, 0.07, 0, 0x8a7a5a, { rough: 0.97 });
    void ground;

    // ------------------------------------------------------------- excavation
    // Cut into a raised apron rather than the ground plane, the same
    // treatment trench-box and hot-tap use, so the trench reads as a hole.
    const APRON = 0.32;
    const apron = group(g, -0.5, 0, -0.4);
    for (const sz of [-1, 1]) {
      box(apron, 3.0, APRON, 0.55, 0, APRON / 2, sz * 1.05, 0x55442e, { rough: 0.98, finish: "concrete", tile: [3, 1] });
    }
    for (const sx of [-1, 1]) {
      box(apron, 0.55, APRON, 1.6, sx * 1.45, APRON / 2, 0, 0x55442e, { rough: 0.98, finish: "concrete", tile: [1, 2] });
    }
    // Spoil heaped on one side.
    for (let i = 0; i < 4; i++) {
      ball(apron, 0.26 + (i % 2) * 0.07, -1.35 + i * 0.55, APRON + 0.14, 1.25, 0x4a3a24, { rough: 1.0, seg: 12 });
    }

    const holeD = 0.9;
    const hole = group(g, -0.5, APRON, -0.4);
    box(hole, 2.6, 0.02, 1.7, 0, -holeD, 0, 0x33291b, { rough: 0.98, cast: false });
    for (const sx of [-1, 1]) box(hole, 0.06, holeD, 1.7, sx * 1.3, -holeD / 2, 0, 0x4a3a24, { rough: 0.96, cast: false });
    for (const sz of [-1, 1]) box(hole, 2.6, holeD, 0.06, 0, -holeD / 2, sz * 0.85, 0x4a3a24, { rough: 0.96, cast: false });

    // Trench shield, tightened onto the walls with screw jacks.
    const shield = group(hole, 0, 0, 0);
    for (const sx of [-1, 1]) box(shield, 0.05, holeD - 0.08, 1.5, sx * 1.2, -holeD / 2, 0, 0xd8b23a, { rough: 0.55, metal: 0.5 });
    const jacks = [];
    for (let i = 0; i < 2; i++) {
      const jack = cyl(shield, 0.03, 0.03, 2.3, 0, -0.3 - i * 0.4, 0.5 - i * 1.0, 0xd8b23a, { rough: 0.55, metal: 0.5, seg: 12 });
      jack.rotation.z = Math.PI / 2;
      jacks.push(jack);
    }
    holoTag(hole, "shielded excavation", 0, 0.42, 0.9, { css: "#f0c419", w: 0.44 });
    reg(hits, shield, "trench-shield");

    // The transite pipe run along the bottom of the trench.
    const pipeGroup = group(hole, 0, -holeD + 0.3, 0);
    const pipeMat = { rough: 0.85, color: 0xb9b2a0 };
    const pipeLeft = cyl(pipeGroup, 0.13, 0.13, 1.1, -0.55, 0, 0, 0xb9b2a0, { rough: 0.85, seg: 18 });
    pipeLeft.rotation.z = Math.PI / 2;
    void pipeMat;
    const pipeRight = cyl(pipeGroup, 0.13, 0.13, 1.1, 0.55, 0, 0, 0xb9b2a0, { rough: 0.85, seg: 18 });
    pipeRight.rotation.z = Math.PI / 2;
    holoTag(pipeGroup, "transite water main", 0, 0.36, 0.2, { css: "#d8232a", w: 0.48 });

    // The already-cracked section and the adjacent utility, found on expose.
    const crackedStub = cyl(pipeGroup, 0.135, 0.135, 0.22, -0.05, 0, 0, 0x9a917c, { rough: 0.9, seg: 16 });
    crackedStub.rotation.z = Math.PI / 2;
    for (let i = 0; i < 3; i++) box(crackedStub, 0.16, 0.01, 0.012, 0, 0.13, -0.05 + i * 0.05, 0x2b2418, { rough: 0.6, cast: false });
    reg(hits, crackedStub, "pipe-crack");
    const adjUtility = cyl(pipeGroup, 0.035, 0.035, 1.2, 0, 0.28, -0.35, 0xb87333, { rough: 0.45, metal: 0.7, seg: 12 });
    adjUtility.rotation.z = Math.PI / 2;
    holoTag(pipeGroup, "live utility crossing", 0, 0.5, -0.35, { css: "#f2894b", w: 0.44 });
    reg(hits, adjUtility, "adjacent-utility");

    // The cut point and the two sections it leaves behind, revealed at "cut-pipe".
    const cutMarker = group(pipeGroup, 0.05, 0, 0);
    box(cutMarker, 0.02, 0.3, 0.3, 0, 0, 0, 0xd8232a, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });
    const freeSection = cyl(pipeGroup, 0.132, 0.132, 0.45, 0.32, 0.03, 0, 0xb9b2a0, { rough: 0.85, seg: 16 });
    freeSection.rotation.z = Math.PI / 2;
    freeSection.visible = false;

    // Wet sheen overlay on the pipe, toggled by the wet-method hold.
    const wetSheen = cyl(pipeGroup, 0.134, 0.134, 1.15, -0.02, 0, 0, 0x3a5a68, { rough: 0.15, opacity: 0.001, transparent: true, seg: 18, cast: false });
    wetSheen.rotation.z = Math.PI / 2;

    // ------------------------------------------------------------ tool bench
    const bench = group(g, 1.6, 0, -1.4, -0.3);
    box(bench, 0.9, 0.08, 0.5, 0, 0.55, 0, 0x3a3c3e, { rough: 0.6, metal: 0.3 });
    for (const sx of [-1, 1]) box(bench, 0.06, 0.55, 0.06, sx * 0.4, 0.275, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });

    // The hand snap cutter — the correct tool.
    const cutter = group(bench, -0.2, 0.6, 0.1, 0.3);
    cyl(cutter, 0.02, 0.02, 0.45, 0, 0.22, 0, 0xd8232a, { rough: 0.55, seg: 10 });
    torus(cutter, 0.14, 0.02, 0, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 10, seg2: 20 }).rotation.y = Math.PI / 2;
    holoTag(cutter, "snap cutter", 0, 0.66, 0, { css: "#f0c419", w: 0.34 });
    reg(hits, cutter, "snap-cutter");

    // The circular saw — the trap. Sitting right beside the correct tool.
    const powerSaw = group(bench, 0.25, 0.6, 0.05, -0.4);
    box(powerSaw, 0.28, 0.16, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.55, metal: 0.4 });
    cyl(powerSaw, 0.11, 0.11, 0.015, 0.1, -0.04, 0.06, 0x1b1e22, { rough: 0.4, metal: 0.6, seg: 20 }).rotation.x = Math.PI / 2;
    box(powerSaw, 0.05, 0.16, 0.05, -0.18, 0.06, 0, 0x2b3138, { rough: 0.5 });
    holoTag(powerSaw, "circular saw — do not use", 0, 0.24, 0, { css: "#f0645b", w: 0.62 });
    reg(hits, powerSaw, "power-saw");

    // A second, never-wetted pipe stub staged as the dry-cut temptation.
    const dryStub = cyl(g, 0.13, 0.13, 0.5, 1.2, 0.14, -0.55, 0x9a917c, { rough: 0.9, seg: 16 });
    dryStub.rotation.z = Math.PI / 2;
    holoTag(g, "unwetted stub — do not cut", 1.2, 0.34, -0.55, { css: "#f0645b", w: 0.56 });
    reg(hits, dryStub, "dry-cut");

    // ---------------------------------------------------------------- sprayer
    const sprayer = group(g, 0.35, 0, -1.1, -0.2);
    cyl(sprayer, 0.09, 0.1, 0.36, 0, 0.2, 0, 0x3a7a5a, { rough: 0.5, metal: 0.2, seg: 16 });
    cyl(sprayer, 0.013, 0.013, 0.24, 0.07, 0.44, 0, 0x22272c, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2.4;
    holoTag(sprayer, "amended water sprayer", 0, 0.58, 0, { css: "#f0c419", w: 0.44 });
    reg(hits, sprayer, "sprayer");
    const spray = particles(sprayer, 30, 0x9fd0e8, { size: 0.02, life: 0.5, additive: false, opacity: 0.6 });

    // ------------------------------------------------------------ regulated area
    const tapePost1 = group(g, -2.2, 0, 1.1);
    cyl(tapePost1, 0.02, 0.02, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const tapePost2 = group(g, 1.3, 0, 1.3);
    cyl(tapePost2, 0.02, 0.02, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const tapeStrip = box(g, 3.6, 0.05, 0.01, -0.45, 0.9, 1.2, TPR_WHITE, { rough: 0.6, cast: false });
    for (let i = -6; i <= 6; i++) box(tapeStrip, 0.16, 0.05, 0.011, i * 0.28, 0, 0, TPR_ACCENT, { rough: 0.6, cast: false });
    holoTag(g, "regulated area — asbestos", -0.45, 1.15, 1.2, { css: "#d8232a", w: 0.6 });
    reg(hits, tapeStrip, "regulated-tape");

    const signPost = group(g, -1.9, 0, 1.6, 0.2);
    cyl(signPost, 0.02, 0.02, 1.3, 0, 0.65, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const signBoard = decal(signPost, 0.34, 0.24, 0, 1.15, 0.02, signFace("DANGER — ASBESTOS", { bg: "#e8e2d4", accent: "#d8232a", scale: 0.4 }), { px: 200 });
    void signBoard;
    holoTag(signPost, "warning sign", 0, 1.42, 0.02, { css: "#d8232a", w: 0.32 });
    reg(hits, signPost, "warning-sign");

    // -------------------------------------------------------------- PPE + notification
    const ppe = group(g, -1.3, 0, -1.6, -0.5);
    box(ppe, 0.06, 1.5, 0.06, 0, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const coverallsProp = box(ppe, 0.4, 0.6, 0.13, 0, 1.05, 0.07, TPR_WHITE, { rough: 0.85 });
    holoTag(ppe, "coveralls", 0, 1.5, 0.07, { css: "#d8232a", w: 0.3 });
    reg(hits, coverallsProp, "coveralls");
    const respMask = group(ppe, 0.14, 0.95, 0.08);
    box(respMask, 0.12, 0.08, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.2 });
    torus(respMask, 0.045, 0.012, 0, 0, 0.03, 0x3c4650, { rough: 0.4 });
    holoTag(respMask, "respirator", 0, 0.14, 0, { css: "#d8232a", w: 0.28 });
    reg(hits, respMask, "respirator");
    const gloveTape = group(ppe, 0, 1.35, 0.07);
    box(gloveTape, 0.1, 0.05, 0.1, -0.08, 0, 0, 0xf2c14b, { rough: 0.6 });
    cyl(gloveTape, 0.04, 0.04, 0.03, 0.08, 0, 0, 0xdfe4e8, { rough: 0.6, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(gloveTape, "gloves + tape", 0, 0.14, 0, { css: "#d8232a", w: 0.3 });
    reg(hits, gloveTape, "glove-tape");

    const plan = holoPanel(g, 0.58, 0.4, -2.1, 1.5, -1.1, (cx, w, h) => {
      cx.fillStyle = "rgba(20,4,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d8232a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#dcb4b0";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("NESHAP NOTIFICATION · N-6604", w * 0.06, h * 0.14);
      cx.fillStyle = "#f7e4e2";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("TRANSITE MAIN — CLASS II", w * 0.06, h * 0.32);
      cx.fillStyle = "#e0bcb8";
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Wet method — amended water only", "Hand tools only, no power saw",
       "Bag at point of removal", "Sampling pump running throughout",
       "Decon before crossing the tape"].forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.09));
    }, { ry: 0.35, accent: TPR_ACCENT });
    reg(hits, plan, "work-plan");

    // ------------------------------------------------------------ sampling pump
    const chest = toolChest(g, 2.1, 0.9, { ry: -0.6, color: TPR_ACCENT });
    const airPump = instrument(chest, -0.05, 0.8, 0.02, { ry: 0.3, idle: "-- L/min", color: TPR_ACCENT });
    holoTag(airPump, "air-sampling pump", 0, 0.17, 0, { css: "#d8232a", w: 0.44 });
    reg(hits, airPump, "air-pump");
    const pumpAlarmLamp = ball(airPump, 0.018, 0.06, 0.03, -0.05, 0xd2312b, { emissive: 0xd2312b, ei: 2.4, rough: 0.4 });
    pumpAlarmLamp.visible = false;

    // -------------------------------------------------------- bagging + load-out
    const bagStation = group(g, 0.5, 0, 0.5);
    box(bagStation, 0.3, 0.02, 0.24, 0, 0.02, 0, 0x2b3138, { rough: 0.7 });
    const bag = group(bagStation, 0, 0, 0);
    const bagInner = box(bag, 0.26, 0.16, 0.16, 0, 0.1, 0, 0xdfe6a8, { rough: 0.55 });
    void bagInner;
    const bagOuter = box(bag, 0.3, 0.2, 0.2, 0, 0.12, 0, TPR_WHITE, { rough: 0.55, opacity: 0.001, transparent: true });
    decal(bag, 0.2, 0.06, 0, 0.22, 0.101, signFace("ASBESTOS WASTE", { bg: "#4a0a0a", accent: "#f2ae14", scale: 0.4 }), { px: 128 });
    holoTag(bag, "double-bag here", 0, 0.32, 0, { css: "#d8232a", w: 0.4 });
    reg(hits, bag, "waste-bag");

    const loadOut = group(g, 1.9, 0, 1.55, -0.3);
    box(loadOut, 0.5, 0.06, 0.4, 0, 0.03, 0, 0x3a4048, { rough: 0.8 });
    box(loadOut, 0.5, 0.7, 0.04, 0, 0.38, -0.2, TPR_WHITE, { rough: 0.3, opacity: 0.4, cast: false });
    decal(loadOut, 0.32, 0.07, 0, 0.72, -0.18, signFace("WASTE LOAD-OUT", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.42 }), { px: 160 });
    holoTag(loadOut, "waste load-out", 0, 0.9, -0.1, { css: "#d8232a", w: 0.36 });
    reg(hits, loadOut, "bag-out-point");

    // The unwrapped toss trap — a heap of loose spoil right by the trench.
    const tossHeap = group(g, -0.8, 0, 1.0);
    for (let i = 0; i < 3; i++) ball(tossHeap, 0.14, i * 0.16 - 0.16, 0.1, 0, 0x8a7a5a, { rough: 1.0, seg: 10 });
    holoTag(tossHeap, "toss it here?", 0, 0.34, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, tossHeap, "unwrapped-toss");

    // ------------------------------------------------------------- decon + gate
    const decon = group(g, -0.2, 0, 1.9, -0.2);
    const deconPad = box(decon, 1.1, 0.02, 0.8, 0, 0.011, 0, TPR_WHITE, { rough: 0.55, metal: 0.15, cast: false });
    void deconPad;
    for (const sx of [-0.4, 0.4]) cyl(decon, 0.03, 0.03, 0.85, sx, 0.3, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    const deconHead = cyl(decon, 0.025, 0.025, 0.09, 0, 0.75, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    void deconHead;
    holoTag(decon, "decon boundary", 0, 0.95, 0, { css: "#d8232a", w: 0.38 });
    reg(hits, decon, "decon-station");
    const deconSpray = particles(decon, 26, 0x9fd0e8, { size: 0.018, life: 0.4, additive: false, opacity: 0.55 });

    // Early respirator removal trap — a bin right at the boundary edge, on
    // the working side of the tape rather than the clean side.
    const earlyBin = group(g, 0.55, 0, 1.75);
    cyl(earlyBin, 0.1, 0.09, 0.2, 0, 0.1, 0, 0x2b3138, { rough: 0.6, seg: 14 });
    holoTag(earlyBin, "mask off here?", 0, 0.24, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, earlyBin, "early-mask-off");

    const gate = group(g, 2.35, 0, 2.0, -0.3);
    const clipboard = group(gate, -0.2, 0, 0.2, 0.5);
    box(clipboard, 0.14, 0.005, 0.2, 0, 0.75, 0, 0xf3efe4, { rough: 0.9 });
    decal(clipboard, 0.12, 0.18, 0, 0.753, 0, signFace("MANIFEST", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.42 })).rotation.x = -Math.PI / 2;
    holoTag(clipboard, "manifest", 0, 0.86, 0, { css: "#d8232a", w: 0.28 });
    reg(hits, clipboard, "manifest-clipboard");

    // The loose seam the final walk has to catch, staged on a second bag at the load-out.
    const shippedBag = group(loadOut, 0, 0.3, 0.15);
    box(shippedBag, 0.26, 0.18, 0.18, 0, 0, 0, TPR_WHITE, { rough: 0.6 });
    const looseSeam = box(shippedBag, 0.24, 0.02, 0.01, 0, 0.09, 0.09, 0x8a7a5a, { rough: 0.7, cast: false });
    reg(hits, looseSeam, "loose-bag-seam");

    barrierPanel(g, -0.6, -2.0, { color: TPR_ACCENT });
    cone(g, 2.0, -1.9, { color: TPR_ACCENT }); cone(g, -2.4, -0.6, { color: TPR_ACCENT });
    const windDust = particles(g, 30, 0xc9b99a, { size: 0.025, life: 0.9, additive: false, opacity: 0.28 });

    // Crew, clear of every control.
    standingFigure(g, -0.9, 0.05, { ry: 1.0, cloth: TPR_WHITE, vest: TPR_ACCENT, helmet: 0xf2f2f2 });
    standingFigure(g, 2.0, 0.4, { ry: -1.6, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });

    // -------------------------------------------------------------- live state
    let wetted = false, cutting = false, gustDrying = false, pumpAlarm = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.05, -1.1),
      footprint: 2.4,
      onStep() {},
      onStepComplete(step) {
        if (step.id === "shore") { for (const j of jacks) j.scale.x = 1.06; }
        if (step.id === "regulated-area") { /* tape and sign already visible */ }
        if (step.id === "expose-pipe") { /* nothing hidden, both stay visible as read items */ }
        if (step.id === "cassette") repaint(airPump.userData.screen, signFace("2.0 L/min", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
        if (step.id === "wet-pipe") { wetted = true; wetSheen.material.opacity = 0.35; }
        if (step.id === "cut-pipe") { cutting = false; freeSection.visible = true; pipeLeft.scale.x = 0.7; pipeRight.position.x = 0.62; }
        if (step.id === "bag-section") { bagOuter.material.transparent = false; bagOuter.material.opacity = 1; }
        if (step.id === "decon") repaint(airPump.userData.screen, signFace("2.0 L/min", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
      },
      onInterrupt(it) {
        if (it.id === "wind-dries-face") { gustDrying = true; wetSheen.visible = false; }
        if (it.id === "pump-low-flow") {
          pumpAlarm = true; pumpAlarmLamp.visible = true;
          repaint(airPump.userData.screen, signFace("0.4 L/min !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.5 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-dries-face") { gustDrying = false; wetSheen.visible = true; }
        if (it.id === "pump-low-flow") {
          pumpAlarm = false; pumpAlarmLamp.visible = false;
          repaint(airPump.userData.screen, signFace("2.0 L/min", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
        }
      },
      onHazard(hitId) {
        if (hitId === "power-saw" || hitId === "dry-cut") { gustDrying = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        windDust.userData.step(dt, new THREE.Vector3(-0.5, 0.5, -0.4), 1.1, 0.35, 0.12);
        if (step?.id === "wet-pipe" && session.holding) {
          spray.visible = true; spray.userData.step(dt, new THREE.Vector3(0, -0.4, 0), 0.12, 1.4, -2.2);
        } else spray.visible = false;
        if (step?.id === "decon" && session.holding) {
          deconSpray.visible = true; deconSpray.userData.step(dt, new THREE.Vector3(0, 0.2, 0), 0.1, 0.9, -1.0);
        } else deconSpray.visible = false;
        if (step?.id === "cut-pipe") { cutting = true; cutMarker.rotation.x = Math.sin(t * 3) * 0.04; }
        void cutting; void wetted; void pumpAlarm;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "cassette") {
          repaint(airPump.userData.screen, signFace(`${(gg.t * 4).toFixed(2)} L/min`, {
            bg: "#0d1c24", accent: gg.t > 0.38 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
        if (session?.track && step?.id === "cut-pipe") {
          const v = session.track.v;
          cutMarker.position.y = -0.02 + v * 0.02;
          if (!gustDrying) wetSheen.material.opacity = v > 0.36 && v < 0.56 ? 0.35 : 0.2;
        }
      },
    };
  },
};
