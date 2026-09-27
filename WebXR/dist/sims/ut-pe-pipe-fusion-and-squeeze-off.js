import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, gravelFace, corrugatedFace, gratingFace, woodGrainFace, safetyStripeFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ PE Pipe Fusion & Squeeze-Off VR — Energy & Power, UWUA /
// IBEW gas-utility plastic-pipe joiner.
//
// Polyethylene gas pipe is stopped without ever being cut open: a squeeze-off
// bar collapses the bore flat and holds it there long enough that the
// section past it can be worked on as if it were isolated by a valve that
// does not exist. Once it is safe to open, a butt-fusion joint is only as
// good as the two faces it is made from — scraped clean, wiped free of
// anything the heater plate would otherwise weld into the joint, and heated
// to the same soak on both sides before they are ever brought together. None
// of it is proof on its own; the bead is inspected once it cools, and the
// squeeze-off itself is let go slowly, because a joint that looks perfect and
// a bore released all at once are two different ways this job can still go
// wrong on the way out.
// Sited generically: no real pipe size, SDR or fusion parameter is invented
// as a code requirement — every number here is what the machine and the
// manufacturer's own procedure call for on this job.

const UT6_ACCENT = 0xf2a03a;
const UT6_CSS = "#f2a03a";
const UT6_PAL = palette("utility");

export const SIM_UT_PE_PIPE_FUSION_AND_SQUEEZE_OFF = {
  id: "ut-pe-pipe-fusion-and-squeeze-off",
  index: "ut-06",
  domain: "Energy",
  trade: "UWUA / IBEW gas-utility qualified plastic-pipe joiner",
  category: "Energy & Power",
  weather: "overcast",
  certification: "UWUA / IBEW gas-utility plastic-pipe joiner qualification; 49 CFR Part 192 (PHMSA) for the operator's qualified-joiner and plastic-pipe-joining procedure; OSHA 29 CFR 1910.147 the control of hazardous energy, applied here as the squeeze-off that stands in for a valve; the fusion machine and pipe manufacturer's own procedure for the facing, heat-soak and joining parameters",
  name: "PE Pipe Fusion & Squeeze-Off",
  title: simTitle("PE Pipe Fusion & Squeeze-Off"),
  tagline: "A squeeze-off bar standing in for a valve that does not exist, a butt-fusion joint made from two faces scraped clean and heat-soaked evenly, and the bead inspected and the bore released slowly before either one is trusted",
  accent: UT6_ACCENT,
  accentCss: UT6_CSS,
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "joint-and-bore-proven", name: "Joint & Bore Proven", note: "A section squeezed off, cut, fused on clean faces with an even heat soak, the bead inspected, and the bore released slowly and leak-checked before the crew left" },

  game: system({
    name: "Distribution Authority",
    currency: "SCFH",
    ranks: ["Apprentice", "Service Crew", "Qualified Joiner", "Crew Lead", "Distribution Authority Certified"],
    badges: [
      { id: "bore-fully-collapsed", name: "Bore Fully Collapsed", note: "The squeeze-off held its full dwell before anything downstream was cut", test: AWARD.stepClean("squeeze-off-hold") },
      { id: "clean-faces-only", name: "Clean Faces Only", note: "No unsafe action was recorded getting the joint fused", test: AWARD.safe },
      { id: "even-heat-soak", name: "Even Heat Soak", note: "Held the heater plate temperature steady through the whole soak", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-fusion", name: "Clean Fusion", note: "No corrections from the work order to the log", test: AWARD.clean },
      { id: "unbroken-cool", name: "Unbroken Cooling Watch", note: "The joining pressure watch ran to completion without a break", test: AWARD.unbroken },
      { id: "section-live-fast", name: "Section Live Fast", note: "Released and leak-checked inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-squeeze-off-dwell": "You went to cut into the pipe before the squeeze-off had held its full dwell. A bore that has not fully collapsed is a bore that is still passing gas, however still the outside of the pipe looks — cutting into it on the strength of a glance rather than the dwell time is cutting into a line this crew has not actually proven closed.",
    "contaminated-fusion-face": "You went to bring the pipe ends together for fusion without wiping the faced surfaces clean first. Oil, dirt or even a bare hand's own residue left on a freshly scraped face becomes part of the joint the moment the heater plate melts it in, and a contaminated fusion can look identical to a good one right up until it fails under pressure.",
    "release-squeeze-off-too-fast": "You went to snap the squeeze-off open all at once instead of releasing it slowly. Polyethylene pipe that has been held collapsed for a dwell needs time to round back out on its own — released suddenly, the bore can crease or the pipe wall can crack right at the edge of where the bar was holding it.",
    "skip-bead-inspection": "You went to log this fusion joint as good without ever inspecting the bead. The bead is the one visible sign of what actually happened inside that joint — uneven, rolled the wrong way, or missing on one side, it is telling this crew something a perfect-looking outside of the pipe never will.",
  },

  lateNotes: {
    "heater-plate": "The heater plate goes against the pipe ends only once they are faced, cleaned and aligned — not before any of those three are done.",
    "squeeze-bar-release": "The squeeze-off releases only after the new joint has cooled, been inspected and logged — not on the assumption that a good-looking bead means the job is finished.",
  },

  // Two things that happen to a joiner whose hands are on a squeeze-off bar
  // or a heater plate. See shared/game.js.
  interrupts: [
    {
      id: "second-squeeze-off-confirm",
      kind: "Dispatch calls to confirm the backup squeeze-off",
      after: "squeeze-off-hold", delay: 3, seconds: 12,
      alert: "Dispatch is calling to confirm a backup squeeze-off point is actually staged downstream before this pipe gets cut.",
      cue: "Answer the radio and confirm the backup is in place before the cut proceeds.",
      target: "backup-radio",
      why: "A single squeeze-off standing in for a valve is exactly the kind of thing that is supposed to have a second one staged behind it, and confirming that over the radio now — rather than finding out it was never set up after the pipe is already open — is what keeps a squeeze-off failure from becoming an uncontrolled release with nothing behind it.",
      missNote: "The call went unanswered while the crew moved toward the cut. Whether a backup squeeze-off was actually staged downstream was never confirmed before this pipe was opened.",
      wrongNote: "It is the radio call about the backup. The squeeze-off in front of you has not changed — this is about whether a second one exists at all.",
    },
    {
      id: "wind-affects-heat-soak",
      kind: "Wind gusts across the open heater plate",
      after: "heat-soak", delay: 3, seconds: 11,
      alert: "A gust of wind is blowing straight across the heater plate, cooling one side of the pipe faces faster than the other while they are supposed to be soaking evenly.",
      cue: "Get the wind shield up around the heater plate before the soak finishes uneven.",
      target: "wind-shield",
      why: "An uneven heat soak makes an uneven joint no amount of careful joining afterward can fix, and the wind shield is what keeps both faces soaking at the same rate the machine's procedure actually assumes they are at — skipped, this fusion is compromised before the plate ever comes out.",
      missNote: "The wind kept cutting across the heater plate with no shield up. One face soaked cooler than the other, and the joint that came from it carries that difference whether or not the bead shows it later.",
      wrongNote: "It is the wind shield, round the heater plate. The squeeze-off bar has nothing to do with an uneven heat soak.",
    },
  ],

  supportLine: "your utility's employee assistance programme, or your UWUA or IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order",
      title: "Read the work order and machine record",
      cue: "Check the work order for pipe size and SDR, and confirm the fusion machine's calibration record.",
      why: "A fusion machine's own procedure is matched to a specific pipe size and wall thickness, and a joint made on the wrong setting from an uncalibrated machine can look identical to a correct one until it is tested — checked here, before either pipe end is ever touched.",
    },
    {
      id: "inspect-pipe", kind: "find", noHint: true,
      targets: ["pipe-gouge", "pipe-out-of-round"],
      itemNames: { "pipe-gouge": "a gouge in the pipe wall", "pipe-out-of-round": "an out-of-round section of pipe" },
      itemNotes: {
        "pipe-gouge": "This gouge cuts deep enough into the wall that it has to be cut out of the section entirely — a fusion joint made past it does nothing for a wall that is already thinned here.",
        "pipe-out-of-round": "This length of pipe has gone oval enough that the squeeze-off bar will not close evenly on it — reround it or move the squeeze point before the bar ever closes.",
      },
      title: "Inspect the pipe before squeezing or fusing it",
      cue: "Walk the pipe and find what has to be dealt with before either the squeeze-off or the fusion joint happens here.",
      why: "A gouge or an out-of-round section both change what a squeeze-off or a fusion joint actually does at that exact point on the pipe, and catching either one now is the difference between working around a known defect and discovering it mid-procedure.",
    },
    {
      id: "squeeze-off-setup", kind: "sequence",
      targets: ["position-squeeze-bar", "close-squeeze-jaws"],
      itemNames: { "position-squeeze-bar": "squeeze bar positioned", "close-squeeze-jaws": "jaws closed slowly" },
      title: "Position and close the squeeze-off",
      cue: "Position the squeeze bar on sound, round pipe, then close the jaws slowly.",
      why: "The bar goes on a length of pipe this crew just proved round and sound, because a squeeze-off closed on a flaw does not seal evenly — closed slowly rather than snapped shut, the bore collapses the way the tool is designed to close it rather than however fast the operator's grip happens to move.",
      outOfOrderNote: "Position the bar first, then close the jaws slowly — jaws closed before the bar is actually positioned close on whatever happened to be underneath them.",
    },
    {
      id: "squeeze-off-hold", kind: "hold", target: "squeeze-bar", seconds: 5,
      title: "Hold the squeeze-off to full dwell",
      cue: "Hold the jaws closed for the full dwell time until the bore is fully collapsed.",
      why: "The bore does not collapse the instant the jaws touch — it takes the dwell time for the pipe wall to actually flatten and stay flattened, and cutting into the pipe before that dwell is finished is cutting into a line that only looks stopped from the outside.",
      holdBreakNote: "The jaws came off before the dwell finished — hold again, a bore that has not fully collapsed is still a bore passing gas downstream of this bar.",
    },
    {
      id: "position-pipe-ends", kind: "drag", target: "fusion-pipe-end",
      title: "Bring the pipe ends into the fusion machine",
      cue: "Carry the cut pipe end into the fusion machine's clamps.",
      why: "Both ends are carried into the same set of clamps so the machine, not two separate hands, decides the alignment — a pipe end brought in and forced to fit afterward is already fighting the alignment the joint depends on.",
      drag: { to: "fusion-clamp", radius: 0.42, missNote: "Not seated in the clamp — a pipe end resting against the machine instead of held square in the jaws will not face or fuse true." },
    },
    {
      id: "face-and-clean", kind: "sequence",
      targets: ["face-pipe-ends", "clean-faced-ends", "check-alignment"],
      itemNames: { "face-pipe-ends": "both ends faced", "clean-faced-ends": "faced ends wiped clean", "check-alignment": "alignment and gap checked" },
      title: "Face, clean, then check alignment",
      cue: "Face both pipe ends, wipe the faced surfaces clean, then check the alignment and gap between them.",
      why: "Facing exposes a fresh, flat surface on each end; cleaning is what keeps that surface fresh rather than contaminated the instant it is touched again; and the alignment check is what confirms the two ends actually meet true before the heater plate ever goes near either one.",
      outOfOrderNote: "Face, then clean, then check alignment — cleaning before the ends are faced wipes a surface that is about to be scraped away anyway.",
    },
    {
      id: "heater-plate-temp", kind: "gauge", target: "heater-plate",
      title: "Bring the heater plate to temperature",
      cue: "Bring the heater plate's reading into the machine's own band, then commit.",
      why: "A plate that is too cool never fully melts the faces it touches, and one that runs too hot can degrade the material before the pipe ends ever come together — this is checked against the machine's own procedure, not against a guess at how warm the plate feels from the handle.",
      gauge: { label: "HEATER PLATE TEMP", speed: 0.6, green: [0.55, 0.75], readout: (t) => `${Math.round(300 + t * 200)}°F`, missNote: "That is outside the machine's own fusion temperature band — let it settle and read it again before it ever touches the pipe." },
    },
    {
      id: "heat-soak", kind: "hold", target: "heater-plate", seconds: 5,
      title: "Hold both faces on the heater plate",
      cue: "Hold both pipe ends against the heater plate for the full soak.",
      why: "Both faces need the same soak time against the same plate to melt evenly — held for the full time rather than pulled early because the surface looks shiny enough, the melt actually reaches the depth the joint strength depends on.",
      holdBreakNote: "The ends came off the plate before the soak finished — hold again, a short soak melts the surface without the depth this joint needs to hold.",
    },
    {
      id: "swap-and-join", kind: "turn", target: "carriage-lever",
      title: "Swing the plate clear and join the ends",
      cue: "Turn the carriage lever to swing the heater plate out and bring the melted faces together.",
      why: "The swap from plate to joined faces has to happen fast enough that neither melted surface has time to skin over in the open air — the carriage lever is what makes that one continuous motion instead of two separate ones with a gap the joint cannot afford between them.",
      turn: { turns: 0.5, axis: "y", label: "CARRIAGE LEVER" },
    },
    {
      id: "joining-pressure-watch", kind: "track", target: "carriage-gauge", seconds: 7,
      title: "Hold the joining pressure through cooling",
      cue: "Watch the joining pressure hold steady in the band for the whole cooling period.",
      why: "The joint is still forming while it cools, and a pressure that drops or spikes mid-cool changes the shape of the bead the machine is actually producing — held steady for the full watch, the cooling happens the way the manufacturer's procedure assumes it will.",
      track: { start: 0.55, green: [0.42, 0.65], rise: 0.06, fall: 0.3, drift: 0.1, label: "JOINING PRESSURE", readout: (v) => (v < 0.42 ? "dropping — the joint is losing its hold" : v > 0.65 ? "over pressure" : "holding steady") },
      holdBreakNote: "That pressure moved out of band during the cooling watch — the joint cooled under conditions the procedure did not call for, and the bead needs a harder look because of it.",
    },
    {
      id: "inspect-bead", kind: "find",
      targets: ["cold-fusion-sign", "witness-marks-aligned"],
      itemNames: { "cold-fusion-sign": "a sign of a cold fusion in the bead", "witness-marks-aligned": "the witness marks lined up" },
      itemNotes: {
        "cold-fusion-sign": "One side of this bead is thin and glassy compared to the other — a sign the two faces did not actually fuse evenly, whatever the outside of the joint looks like.",
        "witness-marks-aligned": "The witness marks either side of the joint line up straight, which is what confirms the pipe did not twist during the join.",
      },
      title: "Inspect the finished bead",
      cue: "Walk the bead once it has cooled and find what it is actually telling this crew.",
      why: "The bead is the only visible record of what happened inside a joint that is otherwise sealed shut — an even, symmetric bead with the witness marks aligned is what a correctly made fusion actually looks like, and anything else is a joint that needs a second opinion before it goes into service.",
    },
    {
      id: "log-fusion", kind: "select", target: "fusion-log",
      title: "Log the fusion joint",
      cue: "Record the machine ID, the fusion parameters, and the operator on the fusion log.",
      why: "A fusion joint with no record is a joint the next crew can never trace back to a specific machine, setting or operator if a problem ever shows up on this line — the log is what turns a good joint into a joint the utility can actually stand behind years from now.",
    },
    {
      id: "release-squeeze-off", kind: "turn", target: "squeeze-bar-release",
      title: "Release the squeeze-off slowly",
      cue: "Turn the release screw slowly, letting the pipe round back out on its own.",
      why: "The pipe has been held flat for a dwell and needs time to round back out the same way it was closed — released slowly, the bore recovers evenly; snapped open, the wall can crease or crack right where the bar was holding it.",
      turn: { turns: 0.6, axis: "y", reverse: true, label: "SQUEEZE-OFF RELEASE" },
    },
    {
      id: "leak-check-after-release", kind: "gauge", target: "gas-detector",
      title: "Leak-check the new joint",
      cue: "Sweep the new joint with the detector and bring the reading to a clean result before you commit.",
      why: "Everything up to this point has been proof the procedure was followed correctly; this is proof the pipe itself agrees — a clean sweep on the detector is what actually closes this job out, not the fusion looking right and the bore sounding like it reopened.",
      gauge: { label: "COMBUSTIBLE GAS", speed: 0.6, green: [0.0, 0.15], readout: (t) => (t < 0.15 ? "clear" : `${Math.round(t * 100)}% LEL`), missNote: "That is not a clean reading at the new joint — recheck it before this section is called finished." },
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, UT6_ACCENT);

    // ---------------------------------------------------------------- ground
    const groundTex = surfaceTexture((ctx, w, h) => gravelFace(ctx, w, h, { base: "#6b665c", base2: "#5e5a51" }), { repeat: 4, px: 320 });
    const groundPlane = box(g, 5.0, 0.06, 4.2, 0, 0.03, 0, 0xffffff, { rough: 0.95 });
    groundPlane.material = texturedMat(groundTex, { rough: 0.95, metal: 0.02, color: UT6_PAL.ground });
    const matTex = surfaceTexture((ctx, w, h) => corrugatedFace(ctx, w, h, { colour: 0x8a8f95 }), { repeat: 2, px: 256 });
    const workMat = box(g, 2.4, 0.02, 1.6, 0.2, 0.02, -0.2, 0xffffff, { rough: 0.6, metal: 0.3 });
    workMat.material = texturedMat(matTex, { rough: 0.6, metal: 0.3 });

    // Pipe run with the squeeze-off point and the pipe defects.
    const pipe = group(g, -1.6, 0.12, -1.0);
    const pipeMain = cyl(pipe, 0.07, 0.07, 2.2, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 16 });
    pipeMain.rotation.z = Math.PI / 2;
    holoTag(pipe, "PE gas main", 0, 0.24, 0, { css: UT6_CSS, w: 0.3 });
    const gouge = box(pipe, 0.04, 0.02, 0.02, -0.6, 0.06, 0, 0x8a3020, { rough: 0.8 });
    reg(hits, gouge, "pipe-gouge");
    const outOfRound = cyl(pipe, 0.075, 0.06, 0.08, 0.6, 0, 0, 0xd8b23a, { rough: 0.5, seg: 16 });
    outOfRound.rotation.z = Math.PI / 2;
    reg(hits, outOfRound, "pipe-out-of-round");

    // Squeeze-off bar.
    const squeeze = group(pipe, -0.2, 0, 0, 0);
    box(squeeze, 0.03, 0.24, 0.08, 0, 0.14, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const jawTop = box(squeeze, 0.1, 0.03, 0.08, 0, 0.09, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    holoTag(squeeze, "squeeze-off bar", 0, 0.32, 0, { css: UT6_CSS, w: 0.34 });
    reg(hits, jawTop, "close-squeeze-jaws");
    hits["position-squeeze-bar"] = squeeze;
    reg(hits, squeeze, "squeeze-bar");
    const releaseScrew = cyl(squeeze, 0.015, 0.015, 0.1, 0, 0.26, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 10 });
    reg(hits, releaseScrew, "squeeze-bar-release");
    const skipDwell = box(g, 0.2, 0.2, 0.2, -1.4, 0.5, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut it now, looks stopped?", -1.4, 0.75, -0.7, { css: "#d2312b", w: 0.5 });
    reg(hits, skipDwell, "skip-squeeze-off-dwell");
    const releaseFast = box(g, 0.2, 0.2, 0.2, -1.9, 0.5, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just pop it open?", -1.95, 0.75, -0.4, { css: "#d2312b", w: 0.4 });
    reg(hits, releaseFast, "release-squeeze-off-too-fast");

    // Fusion machine downstream of the squeeze-off.
    const machine = group(g, 1.2, 0, -0.3, -0.4);
    box(machine, 0.9, 0.5, 0.6, 0, 0.25, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(machine, "fusion machine", 0, 0.6, 0, { css: UT6_CSS, w: 0.32 });
    const clampL = box(machine, 0.16, 0.16, 0.5, -0.4, 0.28, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
    const clampR = box(machine, 0.16, 0.16, 0.5, 0.4, 0.28, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
    void clampL;
    hits["fusion-clamp"] = clampR;
    const fusionEndPipe = cyl(machine, 0.07, 0.07, 0.5, -0.3, 0.28, 0, 0xf2c14b, { rough: 0.5, seg: 14 });
    fusionEndPipe.rotation.z = Math.PI / 2;
    holoTag(machine, "pipe end", -0.3, 0.42, 0, { css: UT6_CSS, w: 0.26 });
    reg(hits, fusionEndPipe, "fusion-pipe-end");
    const facedMark = torus(machine, 0.07, 0.008, -0.1, 0.28, 0, 0x8a939b, { rough: 0.4, metal: 0.6, seg: 8, seg2: 14 });
    facedMark.rotation.y = Math.PI / 2;
    reg(hits, facedMark, "face-pipe-ends");
    const cleanMark = ball(machine, 0.02, 0.0, 0.36, 0.1, 0xbfe6f5, { rough: 0.2, opacity: 0.6, transparent: true });
    reg(hits, cleanMark, "clean-faced-ends");
    const alignMark = box(machine, 0.02, 0.02, 0.5, 0, 0.42, 0, 0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.4 });
    reg(hits, alignMark, "check-alignment");

    const heaterPlate = group(machine, 0, 0.28, 0, 0);
    box(heaterPlate, 0.03, 0.3, 0.5, 0, 0, 0, 0xd2312b, { rough: 0.4, metal: 0.3 });
    holoTag(heaterPlate, "heater plate", 0, 0.2, 0, { css: "#d2312b", w: 0.3 });
    const heaterInst = instrument(heaterPlate, 0, 0.22, 0, { idle: "-- °F", color: 0x2b2f34, w: 0.13, d: 0.02 });
    reg(hits, heaterInst, "heater-plate");
    const contaminated = box(machine, 0.06, 0.02, 0.06, 0.1, 0.34, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(machine, "touch it, skip the wipe?", 0.15, 0.55, -0.1, { css: "#d2312b", w: 0.46 });
    reg(hits, contaminated, "contaminated-fusion-face");

    const carriage = group(machine, 0.5, 0.28, 0, -0.6);
    box(carriage, 0.12, 0.1, 0.1, 0, 0, 0, 0x8a939b, { rough: 0.5, metal: 0.6 });
    holoTag(carriage, "carriage lever", 0, 0.16, 0, { css: UT6_CSS, w: 0.34 });
    reg(hits, carriage, "carriage-lever");
    const carriageGaugeInst = instrument(carriage, 0.16, 0, 0, { idle: "-- bar", color: 0x2b2f34, w: 0.13, d: 0.02 });
    reg(hits, carriageGaugeInst, "carriage-gauge");

    const bead = torus(machine, 0.075, 0.012, 0.1, 0.28, 0, 0xb8402f, { rough: 0.55, seg: 10, seg2: 18 });
    bead.rotation.y = Math.PI / 2;
    holoTag(machine, "fusion bead", 0.1, 0.44, 0, { css: "#b8402f", w: 0.3 });
    reg(hits, bead, "cold-fusion-sign");
    const witnessMarks = box(machine, 0.02, 0.02, 0.5, 0.1, 0.5, 0, 0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.4 });
    reg(hits, witnessMarks, "witness-marks-aligned");
    const skipBead = box(g, 0.2, 0.2, 0.2, 1.6, 0.9, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "call it good, skip the look?", 1.65, 1.15, -0.5, { css: "#d2312b", w: 0.5 });
    reg(hits, skipBead, "skip-bead-inspection");

    // Wind shield, radios, detector.
    const windShield = group(g, 1.6, 0, 0.6, -0.5);
    box(windShield, 0.6, 0.6, 0.03, 0, 0.4, 0, 0x8a8f95, { rough: 0.6, metal: 0.3 });
    holoTag(windShield, "wind shield", 0, 0.72, 0, { css: UT6_CSS, w: 0.3 });
    reg(hits, windShield, "wind-shield");
    const backupRadio = box(g, 0.09, 0.16, 0.05, -2.2, 0.9, 0.6, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "backup radio", -2.2, 1.14, 0.6, { css: UT6_CSS, w: 0.3 });
    reg(hits, backupRadio, "backup-radio");
    const detector = group(g, 2.2, 0, -0.2, 0.4);
    box(detector, 0.1, 0.18, 0.05, 0, 0.5, 0, 0x2b3138, { rough: 0.5 });
    holoTag(detector, "gas detector", 0, 0.68, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, detector, "gas-detector");

    // Boards.
    const orderBoard = group(g, -2.2, 0, -1.7, 0.4);
    box(orderBoard, 0.5, 0.7, 0.04, 0, 0.35, 0, UT6_PAL.structure, { rough: 0.7 });
    const orderPanel = decal(orderBoard, 0.44, 0.32, 0, 0.68, 0.03, paperFace("PE FUSION WORK ORDER", ["Pipe size / SDR per order", "Fusion machine calibration on file", "Fusion parameters per manufacturer"], { scale: 0.68 }));
    holoTag(orderBoard, "work order", 0, 0.9, 0, { css: UT6_CSS, w: 0.32 });
    reg(hits, orderPanel, "work-order");

    const logBench = group(g, -2.2, 0, 1.7);
    box(logBench, 0.9, 0.72, 0.5, 0, 0.36, 0, UT6_PAL.structure, { rough: 0.7, metal: 0.2 });
    const logPanel = decal(logBench, 0.3, 0.36, 0, 0.73, 0, paperFace("FUSION LOG", ["Machine ID ___", "Parameters ___", "Operator ___"], { scale: 0.8 }));
    logPanel.rotation.x = -Math.PI / 2;
    holoTag(logBench, "fusion log", 0, 0.94, 0, { css: UT6_CSS, w: 0.28 });
    reg(hits, logPanel, "fusion-log");

    toolChest(g, 2.4, 1.7);
    // A crate of spare fittings and a striped guard rail round the fusion
    // machine, and a small canopy over it for weather protection — texture
    // variety beyond the ground and the corrugated work mat.
    const woodTex = surfaceTexture((ctx, w, h) => woodGrainFace(ctx, w, h, { planks: 6 }), { repeat: 1, px: 220 });
    const crate = box(g, 0.5, 0.35, 0.4, -2.5, 0.175, 0.0, 0xffffff, { rough: 0.8 });
    crate.material = texturedMat(woodTex, { rough: 0.8 });
    for (let i = 0; i < 4; i++) cyl(g, 0.02, 0.02, 0.12, -2.65 + (i % 2) * 0.3, 0.36 + Math.floor(i / 2) * 0.06, -0.1 + (i % 2) * 0.15, 0xf2c14b, { rough: 0.5, seg: 8 });
    const stripeTex = surfaceTexture((ctx, w, h) => safetyStripeFace(ctx, w, h, { a: "#f2c14b", b: "#1a1a1a", stripes: 6 }), { repeat: 1, px: 160 });
    const guardRail = box(g, 0.9, 0.12, 0.03, 1.2, 0.55, 0.65, 0xffffff, { rough: 0.6 });
    guardRail.material = texturedMat(stripeTex, { rough: 0.6 });
    for (const dx of [-0.4, 0.4]) cyl(g, 0.02, 0.02, 0.5, 1.2 + dx, 0.28, 0.65, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 8 });
    const canopyPost = (x, z) => cyl(g, 0.02, 0.02, 1.4, x, 0.7, z, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 8 });
    for (const [cx, cz] of [[0.6, -1.0], [1.8, -1.0], [0.6, 0.4], [1.8, 0.4]]) canopyPost(cx, cz);
    box(g, 1.4, 0.03, 1.6, 1.2, 1.42, -0.3, 0xdfe6ec, { rough: 0.7, opacity: 0.9, transparent: true, cast: false });
    lockTag(g, -1.0, 0.5, -1.1, { color: 0xf2c14b, lines: ["SQUEEZE", "OFF"] });
    const joiner = standingFigure(g, 0.2, 1.9, { ry: -2.6, cloth: 0x2b6f8f, vest: 0xf2c14b });
    void joiner;

    holoPanel(g, 0.95, 0.6, 2.2, 0, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "#2a1a03"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = UT6_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fdf0d4"; ctx.fillText("PE FUSION & SQUEEZE-OFF", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fffaf0";
      ["Full dwell before you cut", "Clean faces, even heat soak", "Inspect the bead before logging", "Release the bore slowly"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { ry: -0.5, accent: UT6_ACCENT });

    let soaking = false, cooling = false, radioAlert = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-pipe") { gouge.visible = false; outOfRound.visible = false; }
        if (step.id === "squeeze-off-hold") { jawTop.position.y = 0.03; }
        if (step.id === "position-pipe-ends") { fusionEndPipe.position.set(0, 0.28, 0); }
        if (step.id === "heater-plate-temp") repaint(heaterInst.userData.screen, signFace("425", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "heat-soak") soaking = false;
        if (step.id === "swap-and-join") { heaterPlate.visible = false; }
        if (step.id === "joining-pressure-watch") { cooling = false; repaint(carriageGaugeInst.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 })); }
        if (step.id === "release-squeeze-off") { jawTop.position.y = 0.09; }
      },
      onInterrupt(it) {
        if (it.id === "second-squeeze-off-confirm") { radioAlert = true; backupRadio.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 }); }
        if (it.id === "wind-affects-heat-soak") { heaterPlate.rotation.z = 0.15; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-squeeze-off-confirm") { radioAlert = false; backupRadio.material = mat(0x1b1e23, { rough: 0.5 }); }
        if (it.id === "wind-affects-heat-soak") { heaterPlate.rotation.z = 0; }
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.step?.id === "heat-soak") soaking = true;
        if (session?.step?.id === "joining-pressure-watch") cooling = true;
        if (soaking) repaint(heaterInst.userData.screen, signFace("425", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (cooling) repaint(carriageGaugeInst.userData.screen, signFace(`${(0.9 + Math.sin(t) * 0.05).toFixed(2)}`, { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          const step = session?.step;
          if (step?.id === "heater-plate-temp") repaint(heaterInst.userData.screen, signFace(`${Math.round(300 + gg.t * 200)}`, { bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.75 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
          if (step?.id === "leak-check-after-release") { /* handled by readout */ }
        }
        if (session?.turn && session.step?.id === "swap-and-join") carriage.rotation.y = session.turn.amount * Math.PI * 2;
        if (session?.turn && session.step?.id === "release-squeeze-off") releaseScrew.rotation.y = session.turn.amount * Math.PI * 2;
        void dt; void radioAlert;
      },
    };
  },
};
