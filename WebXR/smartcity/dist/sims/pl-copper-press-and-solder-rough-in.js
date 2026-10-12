import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, pipeRun, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Copper Press & Solder Rough-In VR — Building Systems &
// Facilities, UA plumbers and pipefitters.
//
// The same wall cavity gets both joining methods on the same rough-in, and
// each one fails in a way that looks identical to success right up until it
// is pressurised. A press fitting that never actually got squeezed sits on
// the tube looking exactly like one that did, and the only proof either way
// is the witness mark a go/no-go gauge is built to check for. A soldered
// joint made with the wrong alloy looks like any other bright joint until
// the day someone learns what alloy touched their drinking water. And a
// line run too close to the framing's exposed face is invisible from either
// side of the wall the moment drywall goes up — which is exactly why the
// nail plate goes on before that day arrives, not after somebody's saw hits
// copper looking for a stud.

const CPS_ACCENT = 0x5a8fd8;

export const SIM_PL_COPPER_PRESS_AND_SOLDER_ROUGH_IN = {
  id: "pl-copper-press-and-solder-rough-in",
  index: "pl-05",
  domain: "Building Systems & Facilities",
  trade: "UA plumber / rough-in installer",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "UA plumbers and pipefitters apprenticeship; ASME B31.9 building services piping; the Uniform Plumbing Code (UPC) for potable water materials and joints; 8 CCR 3203 injury and illness prevention; 29 CFR 1910.132 personal protective equipment",
  name: "Copper Press & Solder Rough-In",
  title: simTitle("Copper Press & Solder Rough-In"),
  tagline: "A rough-in run two ways on the same wall: a press fitting proven with a go/no-go gauge rather than trusted by eye, a soldered joint made with the alloy potable water actually allows, and a nail plate on before the line disappears behind drywall for good",
  accent: CPS_ACCENT,
  accentCss: "#5a8fd8",
  parSeconds: 260,
  footprint: 2.2,
  badge: { id: "rough-in-proven", name: "Rough-In Proven", note: "A press joint gauge-checked, a solder joint made in the right alloy, and every line protected before the wall closes over it" },

  game: system({
    name: "Rough-In Authority",
    currency: "JOINT",
    ranks: ["Apprentice", "Journeyman", "Plumber", "Lead Plumber", "Rough-In Certified"],
    badges: [
      { id: "drained-before-cut", name: "Drained Before Cut", note: "The section was isolated and drained before any pipe was opened", test: AWARD.stepClean("isolate") },
      { id: "never-unproven", name: "Never Unproven", note: "No press joint went uncovered without the go/no-go check", test: AWARD.safe },
      { id: "steady-heat", name: "Steady Heat", note: "Held the torch heat inside the band the whole joint", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-rough-in", name: "Clean Rough-In", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unbroken-press", name: "Unbroken Press", note: "The press cycle never interrupted mid-squeeze", test: AWARD.unbroken },
      { id: "wall-closed-fast", name: "Wall Closed Fast", note: "Signed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unpressed-fitting": "You called that press fitting done without checking it on the go/no-go gauge. An unpressed fitting sits on the tube looking exactly like a pressed one — same collar, same colour, same fit by eye — and the only difference shows up the day it is finally under pressure and the tube pulls straight out of it.",
    "leaded-solder-potable": "You reached for the leaded solder on this potable water joint. Lead solder was never allowed on drinking water lines for exactly the reason it sounds like: whatever the joint touches, the water running past it touches too, for as long as that joint exists.",
    "torch-near-flammable": "You lit the torch with the joint sitting an arm's length from exposed insulation paper in the cavity. A wall cavity full of dry framing and paper-faced insulation does not need much heat to start smouldering somewhere the torch was never actually pointed, and by the time anyone smells it the fire is already inside a wall nobody can see into.",
    "skip-nail-plate": "You closed up this stud bay without a nail plate over the line. A line run within the protected distance of the framing's face is invisible the moment drywall goes up, and the first screw or nail that goes in looking for a stud finds the pipe instead — on a day long after anyone remembers this rough-in happened.",
  },

  lateNotes: {
    "main-valve": "The main gets reopened once the rough-in is fully proven, not the moment the last joint looks finished.",
    "press-tool": "The press cycle runs to its own full stroke and stop — a squeeze that gets interrupted partway through is not a pressed joint, whatever the collar looks like afterward.",
    "torch-heat": "The joint is soldered in the alloy chosen at the bench, after the tube is reamed and dry-fitted, not before either of those is done.",
  },

  // Two things that happen to a plumber whose hands are on a press tool or a
  // torch and whose eyes are on the joint. See shared/game.js.
  interrupts: [
    {
      id: "smoke-alarm-trips",
      kind: "The smoke detector in the next bay trips",
      // Armed on entering the solder track step, so the window overlaps
      // torch heat — answered at the detector, not the torch itself.
      after: "solder-joint", delay: 3, seconds: 11,
      alert: "The battery smoke detector in the next stud bay just started chirping an alarm from the torch heat.",
      cue: "That detector needs silencing and checking before you keep soldering — it is doing exactly what it is supposed to.",
      target: "smoke-detector",
      why: "A smoke detector alarming from torch heat is usually nothing, and treating it that way without a glance is exactly how the one time it is not nothing gets missed — checking it costs ten seconds, and ignoring a working detector on principle undoes the entire reason it is mounted there.",
      missNote: "The detector kept sounding while the joint got finished anyway. Whatever set it off never actually got looked at.",
      wrongNote: "It is the detector in the next bay, not the torch. The torch is doing what it is meant to; the alarm is asking to be checked.",
    },
    {
      id: "no-water-report",
      kind: "A call comes in that a fixture still has no water",
      // Armed after the valve is reopened, answered at the main valve
      // itself rather than at the rough-in checklist the learner moves to.
      after: "restore", delay: 3, seconds: 12,
      alert: "Someone downstream just called in that their fixture still has no water pressure after the main was reopened.",
      cue: "Read the house pressure gauge and confirm the main is actually delivering pressure before you move on to closing out the paperwork.",
      target: "pressure-check-gauge",
      why: "A valve that feels open and a main that is actually delivering full pressure downstream are not always the same thing, especially one that was worked earlier in the same visit, and a downstream report of no pressure is the clearest evidence available that this needs a second look — on the gauge, not just on the valve handle — before the job gets called finished.",
      missNote: "The report sat unanswered while the paperwork got finished anyway. Whoever called in still has no water, and nobody went back to check the gauge.",
      wrongNote: "It is the house pressure gauge. The report is about pressure actually reaching a fixture, which the valve handle alone cannot confirm.",
    },
  ],

  steps: [
    {
      id: "drawing", kind: "select", target: "iso-drawing",
      title: "Read the rough-in isometric",
      cue: "Check the isometric: pipe sizes, fitting types, and which sections use press versus solder.",
      why: "ASME B31.9 and the plans together decide which joints on this run are allowed to be press fittings and which need to be soldered, and a plumber working from memory instead of the isometric can join two sections the plan never intended to be interchangeable.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["main-valve", "open-drain-cock", "verify-drained"],
      itemNames: { "main-valve": "main closed", "open-drain-cock": "drain cock opened", "verify-drained": "line confirmed drained" },
      title: "Isolate and drain the section",
      cue: "Close the main, open the drain cock, and confirm the section is actually drained before cutting in.",
      why: "A line that is closed but not drained still has standing water and residual pressure behind the first cut, and a plumber who skips the drain check finds that out the moment the saw goes through the pipe wall instead of before it.",
      outOfOrderNote: "Close the main, then drain it, then confirm — confirming before the drain is even opened confirms nothing.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["dented-tube", "wrong-oring"],
      itemNames: { "dented-tube": "dented section of tube", "wrong-oring": "wrong O-ring colour on a fitting" },
      itemNotes: {
        "dented-tube": "This length has a dent right where a press fitting would need to seat — a press fitting closed over a dent never forms a full, even seal around the tube.",
        "wrong-oring": "This fitting's O-ring is the wrong colour for the system it is staged for — the wrong elastomer can look identical while being rated for entirely the wrong service.",
      },
      title: "Inspect the tube and fittings before assembly",
      cue: "Check the staged tube and fittings before anything gets joined.",
      why: "A dent under a press collar and the wrong O-ring behind a fitting's jaws are both invisible once the joint is made — finding them on the bench, where the bad piece just gets set aside, is the only point in this job where either one costs nothing.",
    },
    {
      id: "method", kind: "select", target: "method-board",
      title: "Confirm the joining method for this section",
      cue: "Check the method board for which technique this concealed section actually calls for.",
      why: "Press and solder are not interchangeable by preference — a section that will be inaccessible once the wall is closed, or one going in without a permit for open flame that day, is exactly the case the plan calls out for press, and working from habit instead of the board puts the wrong method on the wrong run.",
    },
    {
      id: "ream", kind: "hold", target: "reamer", seconds: 4,
      title: "Ream and deburr the cut end",
      cue: "Hold the reamer on the freshly cut tube end until the burr is fully cleared.",
      why: "A burr left inside a cut tube end narrows the bore right at the joint and gives turbulence a place to start eroding the copper from the inside, years before the rest of the run would ever show wear — reaming it now costs seconds; finding pinhole erosion at a joint later costs a wall.",
      holdBreakNote: "The reamer came off before the burr was fully cleared — finish it, a partial ream still leaves an edge inside the joint.",
    },
    {
      id: "fit-press", kind: "drag", target: "press-fitting",
      title: "Fit the press fitting onto the cleaned tube",
      cue: "Drag the fitting onto the tube end until it seats fully against the stop.",
      why: "A press fitting has to be pushed on to its full depth before the tool ever closes on it — a fitting left short of the stop gets squeezed in the wrong place on its own barrel, which can crush the seal instead of forming it.",
      drag: { to: "tube-socket", radius: 0.4, missNote: "Not seated to the stop — a fitting pressed short of full depth does not seal where the tool actually closes on it." },
    },
    {
      id: "press-cycle", kind: "hold", target: "press-tool", seconds: 5,
      title: "Run the press tool through its full cycle",
      cue: "Hold the press tool's trigger until the jaws complete their full stroke and release on their own.",
      why: "The tool's jaws are built to run one continuous stroke that fully collapses the fitting around the tube and the O-ring in a single motion, and a squeeze that gets interrupted partway and restarted can leave the collar formed unevenly in a way the finished joint hides completely from view.",
      holdBreakNote: "The press cycle stopped short of its full stroke — run it again from a fresh position, a half-formed collar is not a pressed joint.",
    },
    {
      id: "gonogo", kind: "gauge", target: "gonogo-gauge",
      title: "Check the joint on the go/no-go gauge",
      cue: "Slide the go/no-go gauge over the pressed collar and commit once it reads a proper press.",
      why: "This gauge exists because a pressed collar and an unpressed one are visually the same fitting from three feet away, and it is the only tool on this bench that actually measures the collar's profile against what a completed press cycle is supposed to produce, rather than trusting how the joint looks.",
      gauge: { label: "COLLAR CHECK", speed: 0.65, green: [0.5, 0.7], readout: (t) => (t > 0.5 && t < 0.7 ? "properly pressed" : "check again"), missNote: "That reading says this collar was not fully pressed — redo the cycle before this joint goes anywhere near the wall." },
    },
    {
      id: "alloy", kind: "select", target: "solder-alloy",
      title: "Select the alloy for the soldered joint",
      cue: "Choose the lead-free alloy staged for potable water, not the general-purpose solder on the same bench.",
      why: "The Uniform Plumbing Code allows only lead-free solder on a potable water joint, and a general-purpose spool sitting on the same bench by habit is exactly how the wrong alloy ends up on a line somebody is going to drink from.",
    },
    {
      id: "solder-joint", kind: "track", target: "torch-heat", seconds: 7,
      title: "Solder the joint at a steady heat",
      cue: "Keep the torch heat in the band while the solder draws into the joint by capillary action.",
      why: "Too little heat and the solder balls up on the surface instead of being drawn in; too much and it can scorch the flux before the joint ever wicks solder along its full depth — a steady heat in the middle of that band is what makes a fully filled joint rather than one that only looks filled from the outside edge.",
      track: { start: 0.5, green: [0.42, 0.62], rise: 0.1, fall: 0.3, drift: 0.13, label: "TORCH HEAT", readout: (v) => (v < 0.42 ? "too cool — solder balling up" : v > 0.62 ? "too hot — scorching the flux" : "drawing in evenly") },
      holdBreakNote: "Heat ran outside the band on that joint — recheck it before it disappears behind drywall.",
    },
    {
      id: "restore", kind: "turn", target: "main-valve",
      title: "Reopen the main once the rough-in is proven",
      cue: "Open the main back up now both joints are checked and the run is ready to test.",
      why: "The main only comes back on once every joint made during this isolation has actually been proven — a press collar gauge-checked, a solder joint visually sound — because pressurising a run with an unproven joint still in it just moves the discovery of a bad joint from the bench to the inside of a closed wall.",
      turn: { turns: 0.75, axis: "y", label: "MAIN VALVE" },
    },
    {
      id: "postwork", kind: "sequence",
      targets: ["wipe-joint", "check-witness-mark", "record-log"],
      itemNames: { "wipe-joint": "solder joint wiped clean", "check-witness-mark": "press witness mark checked", "record-log": "rough-in log recorded" },
      title: "Close out both joints",
      cue: "Wipe the solder joint, check the press fitting's witness mark, and record the log.",
      why: "Wiping the flux residue off the soldered joint now, while it is still visible, is the last chance to see a joint that never actually wicked solder all the way round — flux residue hides a cold joint just as well as it hides a good one once it dries in place.",
      outOfOrderNote: "Wipe, then check the mark, then record — recording a joint before checking it writes down a result nobody has confirmed yet.",
    },
    {
      id: "walk-cavity", kind: "find",
      targets: ["nail-plate-missing", "no-support-strap"],
      itemNames: { "nail-plate-missing": "line unprotected at the stud face", "no-support-strap": "unsupported run sagging off its strap" },
      itemNotes: {
        "nail-plate-missing": "This line runs within the protected distance of the stud's exposed face with no nail plate over it — the exact spot a drywall fastener goes looking for a stud.",
        "no-support-strap": "This section has come off its strap and is resting directly on the bottom plate instead of hanging clear of it.",
      },
      title: "Walk the cavity before it is covered",
      cue: "Walk the stud bay one more time and find what will matter once drywall goes up.",
      why: "Both of these become permanently invisible the moment the wall closes, and both are the kind of thing a rough-in inspector is specifically looking for — finding them now is a five-minute fix; finding them after cover means opening a wall that was just closed.",
    },
    {
      id: "call-inspection", kind: "select", target: "inspection-checklist",
      title: "Complete the rough-in checklist and call for inspection",
      cue: "Fill in the rough-in checklist and call it in before any drywall goes up.",
      why: "A rough-in inspection exists specifically because everything checked on this checklist becomes unverifiable once the wall is closed — the checklist and the inspector's own eyes are the last chance either one gets to catch what this crew might have missed.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, CPS_ACCENT);

    const floorTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#c7bfa8"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      for (let i = 0; i < 30; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 40, 3);
    }, { repeat: 4 });
    box(g, 5.2, 0.08, 4.4, 0, 0.04, 0, 0xffffff, { rough: 0.7 }).material = texturedMat(floorTex, { color: 0xc7bfa8, rough: 0.7 });

    // The open stud-bay wall: exposed framing, insulation paper, and the
    // cavity the rough-in actually lives in.
    const wallTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#c9a876"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(120,90,50,0.2)";
      for (let i = 0; i < 20; i++) ctx.fillRect(0, (i / 20) * h, w, 1.5);
    }, { repeat: 2 });
    const cavity = group(g, 0, 0, -1.9);
    for (const sx of [-2.3, -0.9, 0.5, 1.9]) {
      const stud = box(cavity, 0.12, 2.6, 0.09, sx, 1.3, 0, 0xffffff, { rough: 0.85 });
      stud.material = texturedMat(wallTex, { color: 0xc9a876, rough: 0.85 });
    }
    box(cavity, 5.2, 0.12, 0.1, 0, 0.06, 0, 0xb89660, { rough: 0.85 });
    const insul = box(cavity, 1.3, 2.2, 0.02, 1.2, 1.3, 0.06, 0xdfd2b0, { rough: 0.9, opacity: 0.9, transparent: true });
    holoTag(cavity, "torch-near-flammable check", 1.2, 2.5, 0.06, { css: "#5a8fd8", w: 0.5 });
    const torchNearFlame = box(cavity, 0.2, 0.2, 0.2, 1.0, 1.5, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, torchNearFlame, "torch-near-flammable");
    void insul;

    // Smoke detector on the ceiling of the next bay.
    const detector = group(g, 1.9, 2.5, -1.85);
    cyl(detector, 0.09, 0.09, 0.03, 0, 0, 0, 0xf4f7f8, { rough: 0.4, seg: 16 });
    const detLight = ball(detector, 0.012, 0, -0.02, 0.06, 0x3a3f44, { emissive: 0x000000, ei: 0 });
    holoTag(detector, "smoke detector", 0, -0.15, 0, { css: "#5a8fd8", w: 0.32 });
    reg(hits, detLight, "smoke-detector");

    // Running pipe: cold water main coming in, valve, drain cock.
    const mainRun = group(cavity, -1.6, 1.0, 0.1);
    pipeRun(mainRun, [[-0.6, 0, 0], [0.6, 0, 0]], 0.045, 0xc78a4a, {});
    const mainValve = valveWheel(mainRun, 0, 0, 0.12, { color: 0x4fd1ff, body: 0x2b2f34, r: 0.07 });
    holoTag(mainRun, "main valve", 0, 0.24, 0.12, { css: "#5a8fd8", w: 0.3 });
    reg(hits, mainValve, "main-valve");
    const drainCock = cyl(mainRun, 0.02, 0.02, 0.08, 0.35, -0.06, 0.1, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    holoTag(mainRun, "drain cock", 0.35, 0.1, 0.1, { css: "#5a8fd8", w: 0.28 });
    reg(hits, drainCock, "open-drain-cock");
    const drainCheck = box(mainRun, 0.14, 0.14, 0.14, 0.35, -0.3, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mainRun, "confirm drained", 0.35, -0.12, 0.1, { css: "#5a8fd8", w: 0.36 });
    const pressureCheckGauge = instrument(mainRun, -0.35, 0.2, 0.12, { idle: "-- psi", color: 0x2b2f34, w: 0.13, d: 0.15 });
    holoTag(mainRun, "house pressure gauge", -0.35, 0.4, 0.12, { css: "#5a8fd8", w: 0.42 });
    reg(hits, pressureCheckGauge, "pressure-check-gauge");
    reg(hits, drainCheck, "verify-drained");

    // Bench: iso drawing, method board, tools.
    const bench = group(g, -1.9, 0.1, 0.9);
    box(bench, 1.3, 0.76, 0.55, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const iso = decal(bench, 0.34, 0.42, -0.4, 0.78, 0, paperFace("ROUGH-IN ISOMETRIC", ["Cold water — 3/4in copper", "Concealed run: press", "Accessible run: solder", "Potable: lead-free only"], { scale: 0.8 }));
    iso.rotation.x = -Math.PI / 2;
    holoTag(bench, "iso drawing", -0.4, 0.98, 0, { css: "#5a8fd8", w: 0.3 });
    reg(hits, iso, "iso-drawing");
    const method = decal(bench, 0.3, 0.36, 0.0, 0.78, 0.02, paperFace("METHOD BOARD", ["Press: concealed / no permit for flame", "Solder: accessible runs only"], { scale: 0.85 }));
    method.rotation.x = -Math.PI / 2;
    holoTag(bench, "method board", 0.0, 0.98, 0.05, { css: "#5a8fd8", w: 0.32 });
    reg(hits, method, "method-board");
    const checklist = decal(bench, 0.3, 0.36, 0.42, 0.78, 0.05, paperFace("ROUGH-IN CHECKLIST", ["Press joints gauged", "Solder alloy lead-free", "Nail plates installed", "Straps secure"], { scale: 0.85 }));
    checklist.rotation.x = -Math.PI / 2;
    holoTag(bench, "rough-in checklist", 0.42, 0.98, 0.1, { css: "#5a8fd8", w: 0.44 });
    reg(hits, checklist, "inspection-checklist");

    // Staged tube and fittings for the inspect step.
    const stagedTube = group(g, -0.8, 0.86, 0.9, 0.4);
    const dent = cyl(stagedTube, 0.02, 0.02, 0.5, 0, 0, 0, 0xc78a4a, { rough: 0.4, metal: 0.4, seg: 14 });
    dent.rotation.z = Math.PI / 2;
    reg(hits, dent, "dented-tube");
    const fittingBad = torus(stagedTube, 0.03, 0.012, 0.3, 0.02, 0, 0xd2312b, { rough: 0.6, seg: 8, seg2: 16 });
    reg(hits, fittingBad, "wrong-oring");

    // Reamer, work tube, press fitting and tool.
    const reamer = group(g, 0.4, 0.86, 0.9, -0.3);
    cyl(reamer, 0.02, 0.03, 0.14, 0, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 12 });
    box(reamer, 0.09, 0.03, 0.03, -0.1, 0.02, 0, 0xd8232a, { rough: 0.5 });
    holoTag(reamer, "reamer", 0, 0.14, 0, { css: "#5a8fd8", w: 0.26 });
    reg(hits, reamer, "reamer");

    const workTube = cyl(g, 0.022, 0.022, 0.45, 0.9, 0.86, 0.9, 0xc78a4a, { rough: 0.35, metal: 0.4, seg: 14 });
    workTube.rotation.z = Math.PI / 2;
    holoTag(g, "cleaned tube end", 0.9, 1.0, 0.9, { css: "#5a8fd8", w: 0.36 });
    const tubeSocket = group(g, 0.9, 0.86, 0.9);
    hits["tube-socket"] = tubeSocket;

    const pressFitting = group(g, 1.6, 0.86, 1.3, -0.4);
    cyl(pressFitting, 0.045, 0.045, 0.14, 0, 0, 0, 0xd8a35a, { rough: 0.4, metal: 0.4, seg: 16 });
    torus(pressFitting, 0.045, 0.01, 0.06, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.6, seg: 8, seg2: 16 });
    holoTag(pressFitting, "press fitting", 0, 0.16, 0, { css: "#5a8fd8", w: 0.3 });
    reg(hits, pressFitting, "press-fitting");

    const pressTool = group(g, 1.8, 0.86, 0.6, 0.5);
    box(pressTool, 0.14, 0.3, 0.12, 0, 0.15, 0, 0xd8232a, { rough: 0.5, metal: 0.3 });
    for (const sx of [-1, 1]) box(pressTool, 0.03, 0.08, 0.1, sx * 0.08, 0.32, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    holoTag(pressTool, "press tool", 0, 0.5, 0, { css: "#5a8fd8", w: 0.28 });
    reg(hits, pressTool, "press-tool");
    const jawLight = ball(pressTool, 0.014, 0, 0.02, 0.07, 0x3a3f44, { emissive: 0x000000, ei: 0 });
    void jawLight;
    const unpressedTarget = box(g, 0.2, 0.2, 0.2, 1.6, 1.2, 1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "call it done without the gauge?", 1.6, 1.42, 1.3, { css: "#d2312b", w: 0.6 });
    reg(hits, unpressedTarget, "unpressed-fitting");

    const gauge = group(g, 2.1, 0.86, 1.0, -0.3);
    torus(gauge, 0.05, 0.012, 0, 0, 0, 0x59c97b, { rough: 0.4, seg: 8, seg2: 16 });
    box(gauge, 0.1, 0.02, 0.02, 0.08, 0, 0, 0x59c97b, { rough: 0.5 });
    const gonogoInst = instrument(gauge, 0.14, 0.1, 0, { idle: "--", color: 0x2b2f34, w: 0.13, d: 0.15 });
    holoTag(gauge, "go/no-go gauge", 0, 0.2, 0, { css: "#5a8fd8", w: 0.32 });
    reg(hits, gonogoInst, "gonogo-gauge");

    // Solder alloy bin and the joint being soldered.
    const alloyBin = group(g, -0.4, 0.86, 1.3, 0.3);
    const leadFree = cyl(alloyBin, 0.008, 0.008, 0.3, -0.05, 0, 0, 0xd7dce1, { rough: 0.25, metal: 0.85, seg: 8 });
    leadFree.rotation.z = Math.PI / 2;
    decal(alloyBin, 0.1, 0.04, -0.05, 0.03, 0, signFace("LEAD-FREE", { bg: "#0d2418", accent: "#59c97b", scale: 0.42 }));
    holoTag(alloyBin, "lead-free solder", -0.05, 0.1, 0, { css: "#5a8fd8", w: 0.36 });
    reg(hits, leadFree, "solder-alloy");
    const leaded = cyl(alloyBin, 0.008, 0.008, 0.3, 0.1, -0.02, 0.05, 0x8a5a3a, { rough: 0.4, metal: 0.6, seg: 8 });
    leaded.rotation.z = Math.PI / 2;
    holoTag(alloyBin, "general-purpose solder", 0.1, 0.06, 0.05, { css: "#8fa9c4", w: 0.44 });
    const leadedTarget = box(g, 0.2, 0.2, 0.2, -0.1, 1.1, 1.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just grab what's closest?", -0.1, 1.32, 1.35, { css: "#d2312b", w: 0.5 });
    reg(hits, leadedTarget, "leaded-solder-potable");

    const solderJoint = group(cavity, -0.5, 1.0, 0.12);
    const torchHeatInst = instrument(solderJoint, 0, 0.2, 0, { idle: "-- degF", color: 0x2b2f34, w: 0.14, d: 0.16 });
    holoTag(solderJoint, "torch heat", 0, 0.36, 0, { css: "#5a8fd8", w: 0.28 });
    reg(hits, torchHeatInst, "torch-heat");

    // Post-work: wipe/witness mark/log.
    const wipeCloth = box(g, 0.14, 0.02, 0.1, 1.6, 0.87, 1.5, 0xdfe6ec, { rough: 0.8 });
    reg(hits, wipeCloth, "wipe-joint");
    const witnessMark = box(pressFitting, 0.01, 0.01, 0.05, 0, 0.05, 0.05, 0xf2c14b, { rough: 0.5, cast: false });
    reg(hits, witnessMark, "check-witness-mark");
    const logPaper = decal(bench, 0.3, 0.36, 0.42, 0.78, 0.12, paperFace("ROUGH-IN LOG", ["Press joints ___", "Solder joints ___", "Nail plates ___"], { scale: 0.85 }));
    logPaper.rotation.x = -Math.PI / 2;
    reg(hits, logPaper, "record-log");

    // Walk-round: nail plate and strap.
    const plateSpot = group(cavity, -0.9, 1.0, 0.12);
    box(plateSpot, 0.03, 0.14, 0.1, 0, 0, 0, 0x8a939b, { rough: 0.5, metal: 0.6, opacity: 0.001, transparent: true, cast: false });
    reg(hits, plateSpot, "nail-plate-missing");
    const sagStrap = group(cavity, 1.9, 0.5, 0.12);
    cyl(sagStrap, 0.022, 0.022, 0.4, 0, 0, 0, 0xc78a4a, { rough: 0.4, metal: 0.4, seg: 12 }).rotation.z = Math.PI / 2;
    reg(hits, sagStrap, "no-support-strap");
    const skipPlateTarget = box(g, 0.2, 0.2, 0.2, -0.9, 1.8, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "close it up without the plate?", -0.9, 2.0, -1.6, { css: "#d2312b", w: 0.56 });
    reg(hits, skipPlateTarget, "skip-nail-plate");

    const boardPanel = group(g, 2.1, 0, 1.8, -0.5);
    holoPanel(boardPanel, 0.95, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0d1b2e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#5a8fd8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dfeaff"; ctx.fillText("ROUGH-IN — STUD BAY 3", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eef4ff";
      ["Isolate and drain before any pipe opens", "Check every press joint on the gauge", "Lead-free solder only on potable water", "Steady heat — not too cool, not too hot", "Nail plate before the wall closes over it"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.12)));
    }, { accent: CPS_ACCENT });

    const plumber = standingFigure(g, 0.0, 0.2, { ry: 3.0, cloth: 0x4a6fa8 });
    holoTag(plumber, "plumber", 0, 1.9, 0, { css: "#5a8fd8", w: 0.28 });
    toolChest(g, 2.4, 1.6);
    // More of the stud bay: fire blocking, an outlet box on the next stud
    // over, and a stack of fittings staged on the bench for the run.
    for (const sx of [-1.6, 1.2]) box(cavity, 0.12, 0.09, 0.09, sx, 0.7, 0, 0xffffff, { rough: 0.85 }).material = texturedMat(wallTex, { color: 0xc9a876, rough: 0.85 });
    const outletBox = group(cavity, -0.9, 0.5, 0.06);
    box(outletBox, 0.08, 0.11, 0.06, 0, 0, 0, 0x3a3f44, { rough: 0.6, metal: 0.3 });
    box(outletBox, 0.09, 0.02, 0.01, 0, 0.05, 0.03, 0xdfe6ec, { rough: 0.5 });
    for (let i = 0; i < 8; i++) {
      const stackFitting = torus(g, 0.035, 0.01, -0.9 + (i % 4) * 0.1, 0.86 + Math.floor(i / 4) * 0.06, 1.7, 0xd8a35a, { rough: 0.4, metal: 0.4, seg: 8, seg2: 14 });
      stackFitting.rotation.x = Math.PI / 2;
    }
    const spareCoil = torus(g, 0.14, 0.03, 2.3, 0.5, 1.6, 0xc78a4a, { rough: 0.4, metal: 0.4, seg: 10, seg2: 20 });
    spareCoil.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) box(g, 0.5, 0.05, 0.4, 1.1, 0.025 + i * 0.06, 1.9, 0xdfd2b0, { rough: 0.9 });
    for (const [x, z] of [[2.3, -2.1], [-2.4, -2.1]]) cone(g, x, z);

    let heating = false, pressing = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.1, 0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect") { dent.visible = false; fittingBad.visible = false; }
        if (step.id === "ream") repaint(gonogoInst.userData.screen, signFace("READY", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "fit-press") { pressFitting.position.set(0.9, 0.86, 0.9); pressFitting.rotation.y = 0; }
        if (step.id === "press-cycle") { pressing = false; jawLight.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0 }); }
        if (step.id === "gonogo") repaint(gonogoInst.userData.screen, signFace("PASS", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "solder-joint") { heating = false; repaint(torchHeatInst.userData.screen, signFace("FILLED", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 })); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "smoke-alarm-trips") detLight.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4 });
        if (it.id === "no-water-report") { pressureCheckGauge.children[0].material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.6, rough: 0.5 }); repaint(pressureCheckGauge.userData.screen, signFace("CHECK", { bg: "#2a1c05", accent: "#f2c14b", fg: "#fff3e2", scale: 0.55 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "smoke-alarm-trips") detLight.material = mat(0x3a3f44, { emissive: 0x000000, ei: 0 });
        if (it.id === "no-water-report") { pressureCheckGauge.children[0].material = mat(CITY.hiVis, { rough: 0.55 }); repaint(pressureCheckGauge.userData.screen, signFace("-- psi", { bg: "#0d1c24", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.55 })); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "press-cycle" && session.holding) pressing = true;
        if (pressing) jawLight.material.emissiveIntensity = 1.0 + Math.sin(t * 10) * 0.5;
        if (step?.id === "solder-joint" && session.track) { heating = true; repaint(torchHeatInst.userData.screen, signFace(`${Math.round(500 + session.track.v * 400)}`, { bg: "#0d1c24", accent: session.track.v > 0.42 && session.track.v < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 })); }
        void heating;
        if (session?.turn && step?.id === "restore") mainValve.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
