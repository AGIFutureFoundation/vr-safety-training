import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { dozer } from "../../../shared/equipment.js";
import { cableSpool, fencePanel } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dozer Slope Work & Rollover Protection VR — its own gamified
// system: Slope Control.
//
// The IUOE dozer operator's own procedure for cutting a bench into a slope:
// the ROPS structure inspected and the seatbelt actually buckled before the
// blade ever moves, because the cage only protects a belted operator; the
// slope walked for an undercut edge or a soft shoulder before the machine
// goes anywhere near it; an escape route flagged and a spotter watching the
// edge the operator's own seat cannot judge from above; and the ripper
// raised, never dragging, for the whole crossing. No grade percentage or
// clearance distance here is one this platform is certain of — those live on
// the job's own slope plan.

const OPDZ_ACCENT = 0xb5502a;

export const SIM_OP_DOZER_SLOPE_WORK_AND_ROLLOVER_PROTECTION = {
  id: "op-dozer-slope-work-and-rollover-protection",
  index: "op-2",
  domain: "Construction",
  trade: "Dozer operator — IUOE Local 3 operating engineer",
  category: "Construction & Structural Trades",
  weather: "overcast",
  certification: "IUOE Local 3 operating engineer training; OSHA 29 CFR 1926 Subpart W Rollover protective structures; overhead protection and 29 CFR 1926 Subpart O Motor vehicles, mechanized equipment, and marine operations; 29 CFR 1926.21 safety training and education; NIOSH fatality-investigation findings on rollover incidents",
  name: "Dozer Slope Work & Rollover Protection",
  title: simTitle("Dozer Slope Work & Rollover Protection"),
  tagline: "Crawler dozer cutting a bench into a slope: ROPS inspected, seatbelt buckled, the slope walked for an undercut edge, an escape route flagged, and the ripper kept up for the whole crossing",
  accent: OPDZ_ACCENT,
  accentCss: "#b5502a",
  parSeconds: 275,
  footprint: 2.6,
  badge: { id: "slope-control", name: "Slope Control", note: "ROPS inspected, seatbelt buckled, the edge walked and flagged, and the cut held clean the whole crossing" },

  game: system({
    name: "Slope Control",
    currency: "SLOPE",
    ranks: ["Ground Hand", "Dozer Hand", "Slope Certified", "Bench Authority", "Slope Control Certified"],
    badges: [
      { id: "belted-every-time", name: "Belted Every Time", note: "Never ran the blade without the seatbelt buckled", test: AWARD.stepClean("seatbelt-buckle") },
      { id: "edge-respected", name: "Edge Respected", note: "Never stood or cut inside the undercut zone", test: AWARD.safe },
      { id: "steady-bench", name: "Steady Bench", note: "Held the gauge readings near band centre all shift", test: AWARD.precise(0.72) },
      { id: "clean-cut", name: "Clean Cut Certified", note: "Cut the bench clean, first try", test: AWARD.stepClean("cut-the-bench") },
    ],
    challenges: [
      { id: "quick-bench", name: "Quick Bench", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "slope-streak", name: "Slope Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IUOE local's member assistance programme, or the site's employee assistance line if a close call on that slope is what stayed with you",

  hazards: {
    "slope-edge-stand": "You are working the blade right at the edge of the undercut. The ground under a tracked machine's own weight can give way at an undercut with no warning, and a dozer that starts to roll on a slope gives its operator only the time it takes to have already reacted, not the time it takes to decide to.",
    "unbelted-start": "That starts the blade without the seatbelt buckled. A ROPS cage only protects an operator who stays inside its zone of protection during a rollover, and the seatbelt is the only thing that keeps a body there — a cage over an empty seat protects nobody.",
    "ripper-drag-hazard": "That engages the ripper while the machine is still crossing the slope. A dragging ripper digs into ground the tracks are already relying on for grip, and on a sidehill that is exactly the moment an already marginal footing lets go from underneath the uphill track.",
    "soft-shoulder-hazard": "That shoulder reads soft under the machine's own track pressure. Ground that cannot carry a loaded track's full weight gives way exactly where a slope's grade is already doing half the work of tipping the machine over.",
  },

  lateNotes: {
    "escape-flag-roll": "The escape route gets flagged before the machine is committed to the slope, not found by looking around after something has already gone wrong on it.",
    "grade-rod": "The grade checker reads the slope percentage against the plan while the bench is still open to correct, not after the next lift is already cut on top of it.",
  },

  interrupts: [
    {
      id: "blade-catches-rock",
      kind: "Blade catch",
      after: "cut-the-bench", delay: 4, seconds: 12,
      alert: "The blade has caught a buried rock and the machine has started to lean toward the downhill track.",
      cue: "Call it out and hold the machine level before the lean gets any worse.",
      target: "spotter",
      why: "A lean that starts on a sidehill does not correct itself, and the operator feels it a half-second before anyone watching from the safe side does — which is exactly why calling it out immediately, rather than trying to work through it alone, is what keeps a recoverable lean from becoming a rollover nobody called in time.",
      missNote: "The lean kept building while the cut continued. A dozer that starts to roll on a slope does not give its operator a second attempt at the decision that would have stopped it.",
      wrongNote: "Not that — the lean toward the downhill track is what has to be dealt with before this cut continues.",
    },
    {
      id: "checker-toward-edge",
      kind: "Sightline lost",
      after: "direct-slope-work", delay: 4, seconds: 11,
      alert: "The grade checker has walked toward the undercut edge chasing a reading, out of the operator's clear sightline.",
      cue: "Recall them off the edge before the blade moves any further.",
      target: "sightline-recall",
      why: "A slope's undercut edge is unstable ground by definition, which is exactly the ground a grade checker should never be standing on to take a reading — and the operator, working the blade with attention split between the cut and the signal, is the one person least able to also be watching where that reading is being taken from.",
      missNote: "The grade checker stayed at the edge while the blade kept moving. An undercut edge can give way under a person's own weight with no more warning than it gives a dozer's track.",
      wrongNote: "Not that — get the grade checker off the edge before anything else on this cut matters.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the slope",
      cue: "Hi-vis vest and hard hat before anyone is near the machine.",
      why: "A spotter working a slope has enough to track already without also having to pick a person out of the same dirt-coloured background the machine is sitting in — the vest and hard hat are what make the ground crew visible from the cab at a glance, not a formality before the real work starts.",
    },
    {
      id: "rops-inspect", kind: "select", target: "rops-tag",
      title: "Inspect the ROPS structure",
      cue: "Check the ROPS certification tag and the structure itself for cracks or a prior impact before trusting it.",
      why: "A rollover protective structure that has already absorbed one impact, or one carrying a weld crack nobody caught, is not the certified structure whose rated capacity the operator is trusting their life to — the tag and a visual check are how you confirm the cage over the seat is still the cage it was built to be.",
    },
    {
      id: "walk-the-slope", kind: "find", noHint: true,
      targets: ["undercut-edge", "soft-shoulder-crack", "slope-debris"],
      itemNames: {
        "undercut-edge": "undercut at the slope edge",
        "soft-shoulder-crack": "crack along the soft shoulder",
        "slope-debris": "loose debris on the cut line",
      },
      itemNotes: {
        "undercut-edge": "The ground here overhangs empty space below it — a track that gets anywhere near this edge is trusting dirt that is not actually supporting anything.",
        "soft-shoulder-crack": "A tension crack along this shoulder is the ground telling you it is already failing under its own weight, before a 20-tonne machine adds any more to it.",
        "slope-debris": "Loose rock sitting on the cut line is exactly what a blade catches and kicks sideways into an already marginal footing.",
      },
      decoyNotes: {
        "stable-bench": "That section of bench is compacted, dry and holding its line. Nothing to flag there.",
      },
      title: "Walk the slope before committing the machine",
      cue: "Walk the planned cut line. Three signs the ground is not what it looks like are hiding along it — find them by looking.",
      why: "A slope that reads as solid from the cab is not the same thing as a slope a competent person has actually walked and checked, and NIOSH's own rollover fatality investigations keep finding the same pattern: an operator who trusted how the ground looked instead of how it was tested is the operator who found out the difference from inside a machine that was already going over.",
    },
    {
      id: "seatbelt-buckle", kind: "select", target: "seatbelt",
      title: "Buckle the seatbelt",
      cue: "Buckle in before the blade moves, every time, not just on the steep sections.",
      why: "The ROPS structure only protects an operator who stays inside its zone of protection through a rollover, and the seatbelt is the only thing keeping a body there instead of against the inside of a structure built to survive an impact, not a passenger thrown into its path.",
    },
    {
      id: "slope-plan", kind: "select", target: "slope-plan-board",
      title: "Read the slope plan",
      cue: "Confirm the grade, the cut direction and the marked hazards before committing the machine.",
      why: "The slope plan is what sets today's grade percentage and which direction the bench gets cut in — a dozer working a slope from a direction the plan did not intend can turn a stable cut into one that is now undercutting itself from the wrong side.",
    },
    {
      id: "escape-flag", kind: "drag", target: "escape-flag-roll",
      title: "Flag the escape route",
      cue: "Carry the escape flag to the marked route off the slope before the machine is committed.",
      why: "An escape route decided on after something has already gone wrong is a route chosen under panic, not the one that was actually clearest — flagging it now, while everyone is still calm, is what makes it the route people actually take instead of the first gap they see.",
      drag: { to: "escape-flag-socket", radius: 0.4, missNote: "Not on the marked route — carry the flag to where the escape path actually is." },
    },
    {
      id: "barricade-edge", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "edge-barrier"],
      itemNames: { "cone-a": "cone at the approach", "cone-b": "cone at the toe of the slope", "edge-barrier": "barrier along the undercut edge" },
      title: "Barricade the undercut edge",
      cue: "Cone both approaches and set the barrier the full length of the undercut.",
      why: "A barrier along the undercut is what keeps anyone on foot — a delivery, a visitor, a coworker cutting a corner — from ever finding out the hard way that the ground past that line is not actually holding itself up.",
    },
    {
      id: "spotter-brief", kind: "select", target: "spotter",
      title: "Confirm the spotter's protocol",
      cue: "Agree hand signals and the stop signal with the dedicated spotter before the first cut.",
      why: "The spotter is watching the downhill side and the edge the operator's own seat cannot judge from above, and that only works if both of them already agree what a stop signal looks like before the blade is moving and it is needed for real.",
    },
    {
      id: "blade-angle-set", kind: "turn", target: "blade-tilt-lever",
      title: "Set the blade tilt for the sidehill cut",
      cue: "Turn the tilt lever to angle the blade for the slope, not for flat ground.",
      why: "A blade set flat on a sidehill cuts unevenly and throws material downhill in a way that steepens the very slope the machine is standing on — tilting it to match the grade is what keeps the cut even and keeps the spoil going where the plan wants it, not where gravity happens to take it.",
      turn: { turns: 0.5, axis: "z", label: "BLADE TILT" },
    },
    {
      id: "ripper-stow-check", kind: "select", target: "ripper-stow-indicator",
      title: "Confirm the ripper is stowed",
      cue: "Confirm the ripper is fully raised before crossing the slope face.",
      why: "A ripper that is down while the machine crosses a slope digs into ground the tracks are relying on for grip, on the one section of the job where every bit of that grip is already spoken for — it travels up, every time, until the machine is squared back up on flat ground.",
    },
    {
      id: "cut-the-bench", kind: "hold", target: "dig-controls", seconds: 6,
      title: "Cut the bench",
      cue: "Hold the controls steady for a slow, controlled pass along the marked cut line.",
      why: "A bench cut into a slope is cut slow on purpose — a fast, confident pass is exactly the pass that catches a buried rock or a soft pocket nobody saw from the walk-down, and finds out about it from the machine's own lean instead of from the inspection that was supposed to catch it first.",
      holdBreakNote: "Released the controls mid-cut on the slope. Hold it through the whole pass — that is what keeps this a controlled cut instead of a guess on a grade that does not forgive one.",
    },
    {
      id: "direct-slope-work", kind: "track", target: "spotter", seconds: 8,
      title: "Work the cut under the spotter's signal",
      cue: "Keep the spotter's signal steady, holding the cut inside the safe line clear of the undercut edge.",
      why: "The spotter is watching the one thing the operator's own seat cannot judge from above — how close the track actually is to the undercut edge — and continuous signals are what let the operator trust that distance instead of guessing it from a cab that is already tilted by the grade itself.",
      track: {
        start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12,
        label: "CUT LINE",
        readout: (v) => (v < 0.4 ? "drifting toward the edge" : v > 0.62 ? "drifting off the bench" : "on the marked line"),
      },
      holdBreakNote: "The cut drifted off the marked line. Bring it back on the spotter's signal before the blade moves again.",
    },
    {
      id: "grade-check", kind: "select", target: "grade-rod",
      title: "Confirm the bench against the slope plan",
      cue: "Have the grade checker read the rod against the plan grade while the bench is still open.",
      why: "A second person reading the rod against the plan, independent of the operator, is what actually catches a bench that is running steeper or flatter than the plan allows before the next lift goes on top of it compounding the error.",
    },
    {
      id: "compaction-check", kind: "gauge", target: "compaction-gauge",
      title: "Check the bench compaction",
      cue: "Read the density gauge on the finished bench and commit only inside the target band.",
      why: "A bench that looks finished but was never actually compacted to the target density is a slope that keeps moving under whatever gets built or driven on it next — the gauge is what confirms the bench is actually done, not just cut to shape.",
      gauge: {
        label: "BENCH COMPACTION DENSITY", speed: 0.55, green: [0.55, 0.8],
        readout: (t) => `${Math.round(82 + t * 20)}% of max density`,
        missNote: "Under target. Run the machine over the bench again before calling it finished.",
      },
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the slope work log",
      cue: "Log the cut, the grade reading and the compaction result before shutting the machine down.",
      why: "The slope work log is what the next shift and the next inspection read — a bench that was cut and checked cleanly but never logged against the plan leaves nothing behind to prove the grade was actually verified.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, OPDZ_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.96 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#4a3d29", base2: "#3e331f", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.96, metal: 0.02, color: 0xc4b183 },
    );

    // ------------------------------------------------------------------ the slope
    const slope = group(g, 0.6, 0, 0.6);
    const slopeFace = box(slope, 3.2, 0.02, 2.2, 0, 0.15, 0, 0xffffff, { rough: 0.95, cast: false });
    slopeFace.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#5a4a2e", base2: "#4b3d26", seam: "rgba(0,0,0,0.3)" }), { repeat: 4, px: 384 }),
      { rough: 0.95, metal: 0.02, color: 0xb8a274 },
    );
    slopeFace.rotation.z = -0.14;
    slopeFace.position.y = 0.32;
    box(slope, 3.2, 0.5, 0.1, 0, 0.05, -1.1, 0x453522, { rough: 0.97, cast: false });
    holoTag(slope, "cut bench", 0, 0.7, -0.3, { css: "#b5502a", w: 0.3 });

    const undercutMark = group(slope, -1.4, 0.35, -0.9);
    box(undercutMark, 0.5, 0.06, 0.3, 0, 0, 0, 0x1c1712, { rough: 0.95, cast: false });
    reg(hits, undercutMark, "undercut-edge");
    const softShoulder = group(slope, -0.6, 0.4, -0.7);
    box(softShoulder, 0.4, 0.01, 0.3, 0, 0, 0, 0x3a2f1c, { rough: 0.9, cast: false });
    reg(hits, softShoulder, "soft-shoulder-crack");
    const debris = group(slope, 0.3, 0.45, -0.5);
    for (let i = 0; i < 4; i++) ball(debris, 0.06 + Math.random() * 0.03, i * 0.15 - 0.2, 0, 0, 0x5a5048, { rough: 0.9, seg: 8 });
    reg(hits, debris, "slope-debris");
    const stableBench = group(slope, 1.0, 0.4, -0.6);
    box(stableBench, 0.5, 0.01, 0.3, 0, 0, 0, 0x4b3d26, { rough: 0.9, cast: false });
    reg(hits, stableBench, "stable-bench");

    // Undercut edge hazard zone and soft-shoulder hazard, distinct from the find markers.
    const edgeZone = box(g, 1.6, 0.02, 0.4, -0.8, 0.16, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "undercut — keep back", -0.8, 0.3, -0.3, { css: "#f0645b", w: 0.44 });
    reg(hits, edgeZone, "slope-edge-stand");
    const shoulderZone = box(g, 0.5, 0.02, 0.4, 0.0, 0.16, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, shoulderZone, "soft-shoulder-hazard");

    // ------------------------------------------------------------------ the dozer
    const dz = dozer(g, -1.6, 0.14, 1.6, { ry: -2.1, livery: { colour: OPDZ_ACCENT, fleetName: "SITE GRADE", unitNumber: "DZ-6" } });
    const { rops, blade, ripper, seat, controls } = dz.userData.parts;
    holoTag(dz, "dozer DZ-6", 0, 3.2, 0, { css: "#b5502a", w: 0.36 });
    reg(hits, rops, "rops-tag");
    reg(hits, controls, "dig-controls");
    const seatbelt = group(seat, 0.1, 0.3, -0.1, 0.3);
    box(seatbelt, 0.03, 0.3, 0.02, 0, 0, 0, 0xd8b23a, { rough: 0.7 });
    box(seatbelt, 0.06, 0.03, 0.02, 0, -0.15, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    reg(hits, seatbelt, "seatbelt");
    reg(hits, ripper, "ripper-stow-indicator");

    // Blade tilt lever and ripper decoy control.
    const bladeLever = group(g, -0.6, 0.14, 2.0, 0.3);
    box(bladeLever, 0.08, 0.04, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.55 });
    const tiltLever = cyl(bladeLever, 0.018, 0.018, 0.16, 0.06, 0.5, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.6, rough: 0.4, seg: 12 });
    tiltLever.rotation.x = Math.PI / 2;
    holoTag(bladeLever, "blade tilt", 0, 0.66, 0, { css: "#b5502a", w: 0.28 });
    reg(hits, tiltLever, "blade-tilt-lever");
    const ripperLever = box(bladeLever, 0.08, 0.06, 0.02, -0.14, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(ripperLever, 0.07, 0.05, 0, 0, 0.011, signFace("RIPPER", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    reg(hits, ripperLever, "ripper-drag-hazard");
    const startLever = box(bladeLever, 0.08, 0.06, 0.02, 0.14, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(startLever, 0.07, 0.05, 0, 0, 0.011, signFace("START", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    reg(hits, startLever, "unbelted-start");

    // ------------------------------------------------------------------ guarding
    reg(hits, cone(g, -2.6, 2.5, { color: OPDZ_ACCENT }), "cone-a");
    reg(hits, cone(g, 2.4, -1.0, { color: OPDZ_ACCENT }), "cone-b");
    const barrierPanels = [];
    for (const [bx, bz, ry] of [[-2.3, -0.6, 0], [-1.4, -1.15, 0], [-0.4, -1.15, 0], [0.6, -0.9, Math.PI / 6]]) {
      const p = barrierPanel(g, bx, bz, { ry, w: 1.1, color: OPDZ_ACCENT });
      p.visible = false;
      barrierPanels.push(p);
    }
    const barrierKit = group(g, 2.2, 0, 1.4, -0.4);
    slab(barrierKit, 1.0, 0.14, 0.18, 0, 0.08, 0, OPDZ_ACCENT, { radius: 0.02, rough: 0.6 });
    holoTag(barrierKit, "edge barrier", 0, 0.3, 0, { css: "#b5502a", w: 0.32 });
    reg(hits, barrierKit, "edge-barrier");

    // Escape route flag, staged until it is carried to the socket.
    const escapeRoll = group(g, 2.4, 0.14, 0.4, 0.3);
    cyl(escapeRoll, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(escapeRoll, 0.16, 0.11, 0.01, 0, 0.62, 0.02, 0x59c97b, { rough: 0.55 });
    holoTag(escapeRoll, "escape flag", 0, 0.75, 0, { css: "#b5502a", w: 0.3 });
    reg(hits, escapeRoll, "escape-flag-roll");
    const escapeSocket = group(g, -2.6, 0.14, 0.2);
    hits["escape-flag-socket"] = escapeSocket;

    // Sightline recall flag the checker-toward-edge interrupt is answered with.
    const recallFlag = group(g, -1.6, 0.14, -0.5, 0.4);
    cyl(recallFlag, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(recallFlag, 0.16, 0.11, 0.01, 0, 0.62, 0.02, 0xd2312b, { rough: 0.55 });
    decal(recallFlag, 0.14, 0.09, 0, 0.62, 0.026, signFace("BACK", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(recallFlag, "sightline recall", 0, 0.78, 0, { css: "#b5502a", w: 0.36 });
    reg(hits, recallFlag, "sightline-recall");

    // ------------------------------------------------------------------ crew
    const spotter = standingFigure(g, 1.9, -0.4, { ry: -1.7, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(spotter, "spotter", 0, 1.95, 0.15, { css: "#b5502a", w: 0.24 });
    reg(hits, spotter, "spotter");

    const gradeChecker = standingFigure(g, 2.6, 1.6, { ry: 2.2, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });
    holoTag(gradeChecker, "grade checker", 0, 1.95, 0.15, { css: "#b5502a", w: 0.32 });
    const gradeRod = group(gradeChecker, 0.25, 0, 0.15, -0.3);
    cyl(gradeRod, 0.012, 0.012, 1.5, 0, 0.75, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    box(gradeRod, 0.05, 0.03, 0.01, 0, 1.4, 0.02, 0xd2312b, { rough: 0.5 });
    reg(hits, gradeRod, "grade-rod");
    const gradeCheckerSafe = { x: 2.6, z: 1.6 }, gradeCheckerHot = { x: -1.1, z: -0.8 };

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.58, 0.4, -2.3, 1.5, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b5502a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SLOPE PLAN · BENCH 3", w * 0.06, h * 0.12);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("GRADE PER THE PLAN", w * 0.06, h * 0.3);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Cut direction: per the plan", "Escape route: flagged before cutting",
       "ROPS + seatbelt: mandatory, every pass", "Ripper: stowed for the crossing",
       "Compaction target: per the spec"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.46 + i * 0.11)));
    }, { ry: 0.6, accent: OPDZ_ACCENT });
    reg(hits, plan, "slope-plan-board");

    const chest = toolChest(g, 2.4, -1.8, { ry: -0.5, color: OPDZ_ACCENT });
    const compactMeter = instrument(chest, 0.16, 0.79, 0.06, { ry: -0.4, idle: "-- %", color: OPDZ_ACCENT });
    holoTag(compactMeter, "compaction gauge", 0, 0.16, 0, { css: "#b5502a", w: 0.34 });
    reg(hits, compactMeter, "compaction-gauge");

    const ppeRack = group(g, -2.3, 0, 2.4, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, OPDZ_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#b5502a", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#b5502a", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    const closingLog = group(g, 2.6, 0, -1.9, 0.4);
    slab(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("SLOPE WORK LOG\nOPEN", { bg: "#11181f", accent: "#b5502a", scale: 0.24 }), { px: 320 });
    holoTag(closingLog, "slope work log", 0, 1.34, 0, { css: "#b5502a", w: 0.34 });
    reg(hits, closingLog, "closing-log");

    // Site dressing from the shared props kit.
    fencePanel(g, -2.9, 0, -1.6, { ry: 1.5 });
    cableSpool(g, 2.9, 0, 2.4, { ry: -0.3 });

    const dust = particles(dz, 20, 0x9a8a6a, { size: 0.02, life: 0.6, additive: false, opacity: 0.18 });

    return {
      hits,
      footprint: 2.6,

      onInterrupt(it) {
        if (it.id === "blade-catches-rock") { dz.rotation.z -= 0.12; }
        if (it.id === "checker-toward-edge") { gradeChecker.position.x = gradeCheckerHot.x; gradeChecker.position.z = gradeCheckerHot.z; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "blade-catches-rock") { dz.rotation.z += 0.12; }
        if (it.id === "checker-toward-edge") { gradeChecker.position.x = gradeCheckerSafe.x; gradeChecker.position.z = gradeCheckerSafe.z; }
      },
      onStepComplete(step) {
        if (step.id === "walk-the-slope") {
          undercutMark.children[0].material = mat(0x59c97b, { rough: 0.6 });
          softShoulder.children[0].material = mat(0x59c97b, { rough: 0.6 });
          for (const c of debris.children) c.material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "barricade-edge") barrierPanels.forEach((p) => { p.visible = true; });
        if (step.id === "ripper-stow-check") { ripper.rotation.x = 0; }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("SLOPE WORK LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.24 }));
        }
      },
      onHazard(hitId) { if (hitId === "soft-shoulder-hazard") { dust.visible = true; } },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        gradeChecker.userData.head.rotation.y = Math.sin(t * 0.5 + 1) * 0.3;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.4, 0), 0.15, 0.15, -0.1);
        if (!session?.finished && (!session?.step || session.step.id !== "cut-the-bench")) {
          blade.rotation.z = Math.sin(t * 0.3) * 0.01;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "compaction-check") {
          const pct = Math.round(82 + gg.t * 20);
          repaint(compactMeter.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.8 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
