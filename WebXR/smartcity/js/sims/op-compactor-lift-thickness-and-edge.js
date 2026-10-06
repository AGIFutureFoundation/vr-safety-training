import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { compactor } from "../../../shared/equipment.js";
import { cableSpool } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Compactor Lift Thickness & Edge VR — its own gamified system:
// Lift Control.
//
// The IUOE compactor operator's own procedure for rolling a fill in lifts:
// the loose lift measured against the spec before the drum ever touches it,
// the fill edge marked and kept back from, a spotter watching the one thing
// the operator's own seat cannot judge — how close the drum actually sits to
// an unsupported edge — and every lift proven with a density reading before
// the next one goes on top of it. No lift thickness or density target here
// is one this platform is certain of — those live on the job's own
// compaction spec.

const OPCP_ACCENT = 0x8a6a2f;

export const SIM_OP_COMPACTOR_LIFT_THICKNESS_AND_EDGE = {
  id: "op-compactor-lift-thickness-and-edge",
  index: "op-5",
  domain: "Construction",
  trade: "Compactor operator — IUOE Local 3 operating engineer",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "IUOE Local 3 operating engineer training; OSHA 29 CFR 1926.602 Material handling equipment and 29 CFR 1926 Subpart O Motor vehicles, mechanized equipment, and marine operations; 29 CFR 1926.21 safety training and education; NIOSH fatality-investigation findings on rollover incidents near unsupported edges",
  name: "Compactor Lift Thickness & Edge",
  title: simTitle("Compactor Lift Thickness & Edge"),
  tagline: "Single-drum compactor rolling a fill in lifts: the loose lift measured against the spec, the edge marked and kept back from, a spotter watching the drum's distance from it, and every lift proven with a density reading",
  accent: OPCP_ACCENT,
  accentCss: "#8a6a2f",
  parSeconds: 260,
  footprint: 2.5,
  badge: { id: "lift-control", name: "Lift Control", note: "Every lift measured before rolling, the edge kept back from, and the density proven before the next lift went on" },

  game: system({
    name: "Lift Control",
    currency: "LIFT",
    ranks: ["Ground Hand", "Compactor Hand", "Lift Certified", "Edge Authority", "Lift Control Certified"],
    badges: [
      { id: "edge-held", name: "Edge Held", note: "Never rolled the drum inside the marked edge setback", test: AWARD.safe },
      { id: "belted-every-pass", name: "Belted Every Pass", note: "Never started a pass without the seatbelt buckled", test: AWARD.stepClean("rops-seatbelt") },
      { id: "steady-density", name: "Steady Density", note: "Held the gauge readings near band centre all shift", test: AWARD.precise(0.72) },
      { id: "lift-clean", name: "Lift Measured Clean", note: "Measure the lift thickness clean, first try", test: AWARD.stepClean("stake-lift") },
    ],
    challenges: [
      { id: "quick-lift", name: "Quick Lift", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "lift-streak", name: "Lift Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IUOE local's member assistance programme, or the site's employee assistance line if a close call at that edge is what stayed with you",

  hazards: {
    "edge-drum-hazard": "The drum is inside the marked setback from the fill edge. Compacted fill at an unsupported edge can still give way under a rolling drum's weight, and a single-drum machine that starts to go over that edge has nothing to catch it on the way down.",
    "unbelted-start": "That starts the drum rolling without the seatbelt buckled. The ROPS canopy over this seat only protects an operator who stays inside its zone of protection through a rollover, and the belt is the only thing that keeps a body there.",
    "oversized-rock-hazard": "That rock sitting in the roll path is larger than this lift's spec allows compacted into it. A rock that size leaves a void under it once it works loose, and a fill with a void in it settles unevenly under whatever gets built on top later.",
    "probe-left-in-lift": "That drives the drum over ground with the density probe still inserted. A probe left in the lift gets crushed or dragged the instant a multi-tonne drum rolls over it, and the reading it was in the middle of taking is gone with it.",
  },

  lateNotes: {
    "stake-a": "The lift gets staked and measured before the first pass compacts it, not after a lift that turned out too thick to compact properly all the way through.",
    "probe-roll": "The density reading happens after this lift is rolled to its full pass count, not partway through when the number would not mean anything yet.",
  },

  interrupts: [
    {
      id: "drum-nears-edge",
      kind: "Edge drift",
      after: "roll-pass", delay: 4, seconds: 12,
      alert: "The drum has drifted closer to the fill edge than the marked setback allows while attention was on the pass count.",
      cue: "Call it out and pull the drum back before it closes on the edge any further.",
      target: "spotter",
      why: "A drift toward an unsupported edge does not correct itself, and the operator is the one person least able to judge that distance accurately from directly above it — calling it out the moment it is seen is what keeps a recoverable drift from becoming a rollover with nothing underneath it.",
      missNote: "The drum kept closing on the edge while the pass continued. A compactor that goes over an unsupported edge does not give its operator a second chance at the decision that would have stopped it.",
      wrongNote: "Not that — the drift toward the edge is what has to be dealt with before this pass continues.",
    },
    {
      id: "rock-kicked-up",
      kind: "Debris kicked up",
      after: "direct-roll-pattern", delay: 4, seconds: 11,
      alert: "The drum has kicked a buried rock loose into the roll path just ahead of the next pass.",
      cue: "Signal stop and get the rock cleared before the drum reaches it.",
      target: "debris-stop-flag",
      why: "A rock the drum has already kicked loose is a rock that can be thrown clear of the roll path the instant the drum contacts it again, and it is also proof this lift was never actually clean of oversized material in the first place — both are reasons to stop before the next pass, not after.",
      missNote: "The pass continued over the loosened rock. A rock thrown by a compactor drum travels with enough force to injure anyone standing where it lands, and it also leaves a void in the lift right where the rock used to be.",
      wrongNote: "Not that — the rock in the roll path is what has to be cleared before this pass continues.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the fill",
      cue: "Hi-vis vest and hard hat before anyone is near the machine.",
      why: "A spotter watching a drum's distance from an edge has enough to track already without also having to pick a person out of the same dirt-coloured background the fill is made of — the vest and hard hat make the ground crew visible from the seat at a glance.",
    },
    {
      id: "rops-seatbelt", kind: "select", target: "seatbelt",
      title: "Buckle the seatbelt",
      cue: "Buckle in before the drum moves, every pass, not just the ones near the edge.",
      why: "The ROPS canopy only protects an operator who stays inside its zone of protection through a rollover, and the seatbelt is the only thing that keeps a body there instead of against the inside of a structure built to survive an impact, not a passenger thrown into its path.",
    },
    {
      id: "lift-plan", kind: "select", target: "lift-plan-board",
      title: "Read the compaction spec",
      cue: "Confirm the lift thickness, the pass count and the density target before the first roll.",
      why: "The compaction spec sets the loose lift thickness this drum can actually compact all the way through — a lift built thicker than the spec allows can look fully rolled on top while the bottom of it stays loose the whole time.",
    },
    {
      id: "walk-the-lift", kind: "find", noHint: true,
      targets: ["uncompacted-pocket", "oversized-rock", "wet-spot"],
      itemNames: {
        "uncompacted-pocket": "uncompacted pocket in the lift",
        "oversized-rock": "oversized rock in the lift",
        "wet-spot": "wet spot in the lift",
      },
      itemNotes: {
        "uncompacted-pocket": "A soft pocket that gives underfoot is fill that has not actually been compacted yet, whatever the surface next to it looks like.",
        "oversized-rock": "A rock bigger than the spec allows leaves a void under it once it works loose under load — it comes out before the drum ever reaches it.",
        "wet-spot": "Fill compacted wet of its target moisture does not reach the same density no matter how many passes the drum makes over it.",
      },
      decoyNotes: {
        "clean-lift": "That section of lift is dry, even and free of oversized material. Nothing to flag there.",
      },
      title: "Walk the lift before the first pass",
      cue: "Walk the lift. Three problems are hiding in it — find them by looking.",
      why: "A lift that looks ready from the seat is not the same thing as one a competent person has actually walked — a pocket, an oversized rock or a wet spot found now costs a shovel and a few minutes, and found later costs a fill that settles unevenly under whatever gets built on it.",
    },
    {
      id: "stake-lift", kind: "sequence", anyOrder: true,
      targets: ["stake-a", "stake-b"],
      itemNames: { "stake-a": "thickness stake at the near end", "stake-b": "thickness stake at the far end" },
      title: "Stake the lift thickness",
      cue: "Set both thickness stakes to the spec depth before the first pass.",
      why: "The stakes are the visible check the operator can see from the seat that this lift was actually built to the spec's loose thickness, not to whatever depth the dozer happened to leave it at.",
    },
    {
      id: "barricade-edge", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "edge-barrier"],
      itemNames: { "cone-a": "cone at the approach", "cone-b": "cone at the far side", "edge-barrier": "barrier along the fill edge" },
      title: "Barricade the fill edge",
      cue: "Cone both approaches and set the barrier the full length of the unsupported edge.",
      why: "A barrier along the edge is the visible line that keeps the setback honest for everyone on the crew, not just for the operator trying to judge the same distance from directly above it.",
    },
    {
      id: "spotter-brief", kind: "select", target: "spotter",
      title: "Confirm the spotter's protocol",
      cue: "Agree hand signals and the stop signal with the dedicated spotter before the first pass.",
      why: "The spotter is watching the one thing the operator's own seat cannot judge — how close the drum actually sits to the edge — and that only works if both of them already agree what a stop signal looks like before the drum is rolling and it is needed for real.",
    },
    {
      id: "vibration-mode", kind: "turn", target: "vibration-dial",
      title: "Set the vibration mode for this lift",
      cue: "Turn the dial to the amplitude and frequency this lift's material calls for.",
      why: "The wrong vibration setting for the material either fails to reach the target density or over-compacts it into a surface that will not bond with the next lift — the dial gets set to what this lift's material actually needs, not left at whatever the last lift used.",
      turn: { turns: 0.5, axis: "y", label: "VIBRATION MODE" },
    },
    {
      id: "density-probe", kind: "drag", target: "probe-roll",
      title: "Place the density probe",
      cue: "Carry the density probe to the test point and seat it before reading it.",
      why: "The probe only reads what it is actually seated in — placing it deliberately at the marked test point is what makes the reading that follows mean something about this lift, rather than about wherever the probe happened to be dropped.",
      drag: { to: "probe-socket", radius: 0.4, missNote: "Not seated at the test point — set the probe on the marked spot before it will read anything." },
    },
    {
      id: "roll-pass", kind: "hold", target: "compactor-controls", seconds: 6,
      title: "Roll the lift",
      cue: "Hold the controls steady through one slow, controlled pass, watching the setback the whole time.",
      why: "A controlled pass near an edge is slow on purpose — a fast, confident pass is exactly the pass where a small drift toward the edge goes unnoticed until the drum is already past the point a correction can catch it.",
      holdBreakNote: "Released the controls mid-pass, near the edge. Hold it through the whole pass — that is what keeps this a controlled roll instead of a guess at the setback.",
    },
    {
      id: "direct-roll-pattern", kind: "track", target: "spotter", seconds: 8,
      title: "Roll the pattern under the spotter's signal",
      cue: "Keep the spotter's signal steady, holding the drum's overlap pattern clear of the marked edge.",
      why: "The overlap pattern is what gets full density across the whole lift instead of stripes of it, and the spotter's continuous signal is what lets the operator run that pattern with confidence instead of splitting attention between the pattern and the edge at the same time.",
      track: {
        start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12,
        label: "ROLL PATTERN",
        readout: (v) => (v < 0.4 ? "drifting toward the edge" : v > 0.62 ? "drifting off the lift" : "on the overlap pattern"),
      },
      holdBreakNote: "The roll pattern drifted off line. Bring it back on the spotter's signal before the drum moves again.",
    },
    {
      id: "density-check", kind: "gauge", target: "density-gauge",
      title: "Read the density gauge",
      cue: "Read the probe and commit only inside the target density band.",
      why: "A lift that looks fully rolled from the seat is not the same thing as one that has actually reached the spec's target density — the gauge is the only reading that confirms this lift is done, rather than merely finished-looking.",
      gauge: {
        label: "LIFT DENSITY", speed: 0.55, green: [0.55, 0.8],
        readout: (t) => `${Math.round(82 + t * 20)}% of max density`,
        missNote: "Under target. Run another pass over this lift before calling it compacted.",
      },
    },
    {
      id: "pass-count-confirm", kind: "select", target: "pass-tally",
      title: "Confirm the pass count against the spec",
      cue: "Confirm the number of passes on this lift matches what the spec calls for.",
      why: "A lift that reached density on fewer passes than the spec calls for is a lift that got lucky, not one that was actually built to a repeatable standard — the count and the density reading together are what the next inspection can actually check against.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the lift log",
      cue: "Log the thickness, the pass count and the density reading before shutting the machine down.",
      why: "The lift log is what the next lift and the next inspection both read — a lift that was compacted correctly but never logged leaves nothing behind to prove it, which matters the moment anything above it ever settles unevenly.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, OPCP_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.2, 0.14, 5.8, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#4d4130", base2: "#413524", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xc7b48c },
    );

    // ------------------------------------------------------------------ the fill edge
    const edge = group(g, -1.6, 0, 0.4);
    box(edge, 1.6, 0.5, 2.4, 0, -0.1, 0, 0x453522, { rough: 0.97, cast: false });
    holoTag(edge, "unsupported fill edge", 0, 0.3, 1.3, { css: "#8a6a2f", w: 0.5 });
    const edgeHazard = box(g, 0.6, 0.02, 2.2, -1.0, 0.16, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, edgeHazard, "edge-drum-hazard");

    // ------------------------------------------------------------------ the compactor
    const cp = compactor(g, 0.4, 0.14, 0.4, { ry: -1.6, livery: { colour: OPCP_ACCENT, fleetName: "SITE LIFT", unitNumber: "CP-8" } });
    const { seat, controls, drum } = cp.userData.parts;
    holoTag(cp, "compactor CP-8", 0, 3.3, 0, { css: "#8a6a2f", w: 0.32 });
    reg(hits, controls, "compactor-controls");
    const seatbelt = group(seat, 0.1, 0.3, -0.1, 0.3);
    box(seatbelt, 0.03, 0.3, 0.02, 0, 0, 0, 0xd8b23a, { rough: 0.7 });
    box(seatbelt, 0.06, 0.03, 0.02, 0, -0.15, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    reg(hits, seatbelt, "seatbelt");

    const dialPost = group(g, 1.3, 0.14, 1.2, 0.3);
    box(dialPost, 0.08, 0.04, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.55 });
    const dial = cyl(dialPost, 0.06, 0.06, 0.03, 0, 0.55, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.5, rough: 0.4, seg: 16 });
    dial.rotation.x = Math.PI / 2;
    holoTag(dialPost, "vibration dial", 0, 0.68, 0, { css: "#8a6a2f", w: 0.32 });
    reg(hits, dial, "vibration-dial");
    const startLever = box(dialPost, 0.08, 0.06, 0.02, 0.14, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(startLever, 0.07, 0.05, 0, 0, 0.011, signFace("START", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    reg(hits, startLever, "unbelted-start");

    // ------------------------------------------------------------------ lift walk-down
    const lift = group(g, 1.4, 0, -1.2);
    const pocket = group(lift, -0.6, 0.155, 0);
    box(pocket, 0.3, 0.005, 0.3, 0, 0, 0, 0x2f2618, { rough: 0.9, cast: false });
    reg(hits, pocket, "uncompacted-pocket");
    const bigRock = group(lift, 0.2, 0.16, 0.1);
    ball(bigRock, 0.14, 0, 0, 0, 0x5a5048, { rough: 0.9, seg: 12 });
    reg(hits, bigRock, "oversized-rock");
    const oversizedHazard = group(lift, 0.9, 0.16, -0.2);
    ball(oversizedHazard, 0.12, 0, 0, 0, 0x5a5048, { rough: 0.9, seg: 12 });
    reg(hits, oversizedHazard, "oversized-rock-hazard");
    const wetSpot = group(lift, 0, 0.152, -0.5);
    box(wetSpot, 0.3, 0.004, 0.3, 0, 0, 0, 0x2b2318, { rough: 0.5, opacity: 0.6, transparent: true, cast: false });
    reg(hits, wetSpot, "wet-spot");
    const cleanLift = group(lift, 1.2, 0.155, -0.4);
    box(cleanLift, 0.3, 0.005, 0.3, 0, 0, 0, 0x4b3d26, { rough: 0.9, cast: false });
    reg(hits, cleanLift, "clean-lift");

    // ------------------------------------------------------------------ stakes + barricade
    const stakeA = group(g, -0.6, 0.14, -2.0);
    cyl(stakeA, 0.015, 0.015, 0.35, 0, 0.17, 0, 0xf2c14b, { rough: 0.6, seg: 8 });
    reg(hits, stakeA, "stake-a");
    const stakeB = group(g, 0.8, 0.14, -2.0);
    cyl(stakeB, 0.015, 0.015, 0.35, 0, 0.17, 0, 0xf2c14b, { rough: 0.6, seg: 8 });
    reg(hits, stakeB, "stake-b");

    reg(hits, cone(g, -2.6, 2.0, { color: OPCP_ACCENT }), "cone-a");
    reg(hits, cone(g, -2.6, -1.5, { color: OPCP_ACCENT }), "cone-b");
    const barrierPanels = [];
    for (const [bx, bz, ry] of [[-2.0, 1.4, Math.PI / 2], [-2.0, 0.3, Math.PI / 2], [-2.0, -0.7, Math.PI / 2]]) {
      const p = barrierPanel(g, bx, bz, { ry, w: 1.1, color: OPCP_ACCENT });
      p.visible = false;
      barrierPanels.push(p);
    }
    const barrierKit = group(g, 2.4, 0, 1.6, -0.4);
    slab(barrierKit, 1.0, 0.14, 0.18, 0, 0.08, 0, OPCP_ACCENT, { radius: 0.02, rough: 0.6 });
    holoTag(barrierKit, "edge barrier", 0, 0.3, 0, { css: "#8a6a2f", w: 0.32 });
    reg(hits, barrierKit, "edge-barrier");

    // Density probe, staged until it is carried to the test point.
    const probeRoll = group(g, 2.2, 0.14, -0.6, 0.3);
    cyl(probeRoll, 0.03, 0.03, 0.4, 0, 0.2, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 10 });
    holoTag(probeRoll, "density probe", 0, 0.44, 0, { css: "#8a6a2f", w: 0.32 });
    reg(hits, probeRoll, "probe-roll");
    const probeSocket = group(lift, -0.2, 0.16, 0.6);
    hits["probe-socket"] = probeSocket;
    reg(hits, probeSocket, "probe-left-in-lift");
    const densityGauge = instrument(g, 2.2, 0, -1.4, { ry: -0.3, idle: "-- %", color: OPCP_ACCENT });
    holoTag(densityGauge, "density gauge", 0, 0.16, 0, { css: "#8a6a2f", w: 0.34 });
    reg(hits, densityGauge, "density-gauge");

    // Debris stop flag the rock-kicked-up interrupt is answered with.
    const debrisFlag = group(g, 0.3, 0.14, -2.3, 0.3);
    cyl(debrisFlag, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(debrisFlag, 0.16, 0.11, 0.01, 0, 0.62, 0.02, 0xd2312b, { rough: 0.55 });
    decal(debrisFlag, 0.14, 0.09, 0, 0.62, 0.026, signFace("STOP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(debrisFlag, "debris stop", 0, 0.78, 0, { css: "#8a6a2f", w: 0.3 });
    reg(hits, debrisFlag, "debris-stop-flag");

    // ------------------------------------------------------------------ crew
    const spotter = standingFigure(g, 2.9, -2.2, { ry: 1.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(spotter, "spotter", 0, 1.95, 0.15, { css: "#8a6a2f", w: 0.24 });
    reg(hits, spotter, "spotter");
    const spotterSafe = { x: 2.9, z: -2.2 };

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.58, 0.4, -2.5, 1.5, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8a6a2f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("COMPACTION SPEC · LIFT 4", w * 0.06, h * 0.12);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("THICKNESS PER THE SPEC", w * 0.06, h * 0.3);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Loose lift thickness: per the spec", "Pass count: per the spec",
       "Density target: per the spec", "Edge setback: barricade before rolling"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.5, accent: OPCP_ACCENT });
    reg(hits, plan, "lift-plan-board");

    const chest = toolChest(g, -2.4, -0.6, { ry: -0.5, color: OPCP_ACCENT });
    const tallyMeter = instrument(chest, 0.16, 0.79, 0.06, { ry: -0.4, idle: "0 passes", color: OPCP_ACCENT });
    holoTag(tallyMeter, "pass tally", 0, 0.16, 0, { css: "#8a6a2f", w: 0.3 });
    reg(hits, tallyMeter, "pass-tally");

    const ppeRack = group(g, -2.7, 0, 2.3, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, OPCP_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#8a6a2f", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#8a6a2f", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    const closingLog = group(g, 2.5, 0, 2.3, 0.4);
    slab(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("LIFT LOG\nOPEN", { bg: "#11181f", accent: "#8a6a2f", scale: 0.3 }), { px: 320 });
    holoTag(closingLog, "lift log", 0, 1.34, 0, { css: "#8a6a2f", w: 0.28 });
    reg(hits, closingLog, "closing-log");

    // Site dressing from the shared props kit.
    cableSpool(g, -2.9, 0, -1.9, { ry: 0.4 });

    const dust = particles(cp, 20, 0x9a8a6a, { size: 0.02, life: 0.6, additive: false, opacity: 0.18 });

    return {
      hits,
      footprint: 2.5,

      onInterrupt(it) {
        if (it.id === "drum-nears-edge") { cp.position.x -= 0.3; }
        if (it.id === "rock-kicked-up") { bigRock.position.x += 0.4; bigRock.position.z -= 0.3; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "drum-nears-edge") { cp.position.x += 0.3; }
        if (it.id === "rock-kicked-up") { bigRock.position.x -= 0.4; bigRock.position.z += 0.3; }
      },
      onStepComplete(step) {
        if (step.id === "walk-the-lift") {
          pocket.children[0].material = mat(0x59c97b, { rough: 0.6 });
          bigRock.children[0].material = mat(0x59c97b, { rough: 0.6 });
          wetSpot.children[0].material = mat(0x59c97b, { rough: 0.6, opacity: 0.3, transparent: true });
        }
        if (step.id === "barricade-edge") barrierPanels.forEach((p) => { p.visible = true; });
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("LIFT LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },
      onHazard(hitId) { if (hitId === "probe-left-in-lift") { dust.visible = true; } },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.4, 0), 0.15, 0.15, -0.1);
        if (!session?.finished) drum.rotation.x += dt * (session?.step?.id === "roll-pass" || session?.step?.id === "direct-roll-pattern" ? 1.2 : 0.15);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "density-check") {
          const pct = Math.round(82 + gg.t * 20);
          repaint(densityGauge.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.8 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
