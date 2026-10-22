import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { grader } from "../../../shared/equipment.js";
import { fencePanel } from "../../../shared/props.js";
import { level } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Grader Fine Grade & Crown VR — its own gamified system: Grade
// Authority.
//
// The IUOE motor grader operator's own procedure for fine-grading a road
// surface to its crown: the subgrade walked for a soft spot or a high spot
// before the first pass, a stringline set as the visible reference the
// moldboard is cut against, the circle angled for the day's crown, the lane
// barricaded before the machine works it, and the finished crown checked
// with a straightedge and the drainage outlet confirmed clear before anyone
// calls it done. No crown percentage or clearance distance here is one this
// platform is certain of — those live on the job's own grading plan.

const OPGR_ACCENT = 0x3f7fb0;

export const SIM_OP_GRADER_FINE_GRADE_AND_CROWN = {
  id: "op-grader-fine-grade-and-crown",
  index: "op-4",
  domain: "Construction",
  trade: "Motor grader operator — IUOE Local 3 operating engineer",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "IUOE Local 3 operating engineer training; OSHA 29 CFR 1926.602 Material handling equipment and 29 CFR 1926 Subpart O Motor vehicles, mechanized equipment, and marine operations; 29 CFR 1926.21 safety training and education; NIOSH fatality-investigation findings on struck-by incidents in active work lanes",
  name: "Grader Fine Grade & Crown",
  title: simTitle("Grader Fine Grade & Crown"),
  tagline: "Motor grader fine-grading a road surface to its crown: the subgrade walked, a stringline set, the circle angled, the lane barricaded, and the finished crown checked with a straightedge before the drainage outlet is confirmed clear",
  accent: OPGR_ACCENT,
  accentCss: "#3f7fb0",
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "grade-authority", name: "Grade Authority", note: "Subgrade walked, the crown cut clean to the stringline, and the finished surface checked before it was called done" },

  game: system({
    name: "Grade Authority",
    currency: "GRADE",
    ranks: ["Ground Hand", "Grader Hand", "Crown Certified", "Grade Authority", "Grade Authority Certified"],
    badges: [
      { id: "lane-held", name: "Lane Held", note: "Never worked the lane before it was barricaded", test: AWARD.safe },
      { id: "stringline-true", name: "Stringline True", note: "Set the stringline clean, first try", test: AWARD.stepClean("set-stringline") },
      { id: "steady-crown", name: "Steady Crown", note: "Held the gauge readings near band centre all shift", test: AWARD.precise(0.72) },
      { id: "clean-cut", name: "Clean Cut Certified", note: "Cut the fine-grade pass clean, first try", test: AWARD.stepClean("fine-grade-pass") },
    ],
    challenges: [
      { id: "quick-crown", name: "Quick Crown", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "grade-streak", name: "Grade Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IUOE local's member assistance programme, or the site's employee assistance line if a close call in the lane is what stayed with you",

  hazards: {
    "unmarked-lane-hazard": "You are running the moldboard in a lane that is not yet barricaded. A grader working a live lane at walking pace is still a machine a driver has seconds to react to, and the barricade is what turns that reaction time into distance instead of a guess.",
    "circle-underfoot": "You are standing next to the circle while it is turning. The circle and drawbar carry enough torque to angle a loaded moldboard, and a hand or a foot anywhere near it when it turns is not something the mechanism has any way to sense.",
    "outlet-block-hazard": "That pushes spoil straight into the drainage outlet the crown is supposed to be draining toward. Blocking the one place the water this crown is shedding is meant to go turns a finished grade into standing water on the first rain after the crew has already left.",
    "blade-drop-hazard": "That drops the moldboard without confirming what is underneath it first. A blade that comes down on a foot or a hand does not care that the operator meant to lower it slowly — the clearance gets confirmed before the lever moves, not after.",
  },

  lateNotes: {
    "sensor-roll": "The slope sensor gets mounted before the first pass sets the crown, not fitted afterward to check a crown that has already been cut without it.",
    "straightedge": "The straightedge checks the crown once the pass is finished and the surface has stopped moving, not while the moldboard is still cutting it.",
  },

  interrupts: [
    {
      id: "vehicle-enters-lane",
      kind: "Lane incursion",
      after: "fine-grade-pass", delay: 4, seconds: 12,
      alert: "A pickup has turned into the work lane ahead of the moldboard, past the barricade's own gap.",
      cue: "Stop the pass and get the stop paddle up before the grader closes any further on that gap.",
      target: "stop-paddle",
      why: "A barricade only controls the traffic that respects it — the plan still needs a live response for the vehicle that does not, and a stop paddle raised the instant an incursion is seen is the only thing standing between a slow-moving grader and a driver who is not expecting it to be there.",
      missNote: "The pass continued while the pickup closed the gap the barricade was supposed to prevent. A grader at working speed does not stop in the distance a driver has to react in.",
      wrongNote: "Not that — the vehicle in the lane is what has to be dealt with before this pass continues.",
    },
    {
      id: "stringline-sags",
      kind: "Reference lost",
      after: "direct-grade-pass", delay: 4, seconds: 11,
      alert: "The stringline has sagged off a stake and no longer reads true along this section of the cut.",
      cue: "Call for the restring before the moldboard cuts against a reference that has already gone bad.",
      target: "restring-flag",
      why: "Every pass after this one is cut against whatever the stringline shows, whether or not the line is still telling the truth — a sagged reference that goes uncorrected does not fail loudly, it just quietly cuts the wrong crown into ground the crew has already moved past.",
      missNote: "The pass continued against a stringline that had already sagged. The crown it cut was wrong from that point on, and nothing about the pass itself would have shown it.",
      wrongNote: "Not that — the sagged stringline is what has to be corrected before this pass means anything.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the lane",
      cue: "Hi-vis vest and hard hat before anyone is near the machine.",
      why: "A grader working a live lane depends on being seen by anyone approaching it as much as it depends on the operator seeing them — the vest and hard hat are what make the ground crew visible at the distance a driver actually needs to react.",
    },
    {
      id: "grading-plan", kind: "select", target: "grading-plan-board",
      title: "Read the grading plan",
      cue: "Confirm the crown percentage, the cut direction and the marked hazards before committing the machine.",
      why: "The grading plan sets today's crown percentage and which way the surface has to drain — a grader cutting to a crown it was not given, or in a direction the plan did not intend, produces a surface that looks finished and sheds water the wrong way regardless.",
    },
    {
      id: "walk-subgrade", kind: "find", noHint: true,
      targets: ["soft-spot", "high-spot", "subgrade-debris"],
      itemNames: {
        "soft-spot": "soft spot in the subgrade",
        "high-spot": "high spot in the subgrade",
        "subgrade-debris": "debris left on the subgrade",
      },
      itemNotes: {
        "soft-spot": "Ground that gives under a boot is ground that will not hold a compacted crown for long once traffic starts using it.",
        "high-spot": "A high spot the moldboard has to cut through first changes how the rest of the pass tracks — better to know about it before the blade finds it.",
        "subgrade-debris": "A rock or a broken chunk of base left on the subgrade is exactly what a moldboard catches and drags a groove through the finished crown behind it.",
      },
      decoyNotes: {
        "clean-subgrade": "That section of subgrade is clean, firm and level. Nothing to flag there.",
      },
      title: "Walk the subgrade before the first pass",
      cue: "Walk the planned cut line. Three problems in the subgrade are hiding along it — find them by looking.",
      why: "A subgrade that looks ready from the cab is not the same thing as one a competent person has actually walked — a soft spot, a high spot or debris the walk-down would have caught costs far less to fix now than it does once it is buried under a crown that was cut on top of it.",
    },
    {
      id: "set-stringline", kind: "sequence", anyOrder: true,
      targets: ["stake-a", "stake-b"],
      itemNames: { "stake-a": "stake at the near end", "stake-b": "stake at the far end" },
      title: "Set the stringline stakes",
      cue: "Set both stakes and pull the stringline taut between them before the first pass.",
      why: "The stringline is the one reference the operator can actually see from the cab while cutting — set it before the pass starts, and every pass after the first one is cut against a visible line instead of a memory of where the grade was supposed to be.",
    },
    {
      id: "barricade-lane", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "lane-barrier"],
      itemNames: { "cone-a": "cone at the approach", "cone-b": "cone at the far end", "lane-barrier": "lane barrier" },
      title: "Barricade the work lane",
      cue: "Cone both approaches and set the barrier the full length of the lane being cut.",
      why: "A grader moves at walking pace, which reads as harmless right up until a driver closes the distance faster than the machine can clear the lane — the barricade is what keeps that distance a driver's problem to manage from a hundred feet back, not the operator's problem to react to at the last second.",
    },
    {
      id: "spotter-brief", kind: "select", target: "spotter",
      title: "Confirm the spotter's protocol",
      cue: "Agree hand signals and the stop signal with the dedicated spotter before the first pass.",
      why: "The spotter is watching the lane approach and the circle's own danger zone, both of which sit outside the cab's own sightline — that only works if both of them already agree what a stop signal looks like before the moldboard is moving and it is needed for real.",
    },
    {
      id: "circle-angle-set", kind: "turn", target: "circle-angle-lever",
      title: "Angle the circle for the crown",
      cue: "Turn the circle lever to set the moldboard angle the day's crown calls for.",
      why: "The circle sets the moldboard's angle to the direction of travel, and that angle is what actually shapes the crown — a circle left at yesterday's setting cuts yesterday's crown into today's surface no matter how carefully the rest of the pass is run.",
      turn: { turns: 0.55, axis: "y", label: "CIRCLE ANGLE" },
    },
    {
      id: "sensor-mount", kind: "drag", target: "sensor-roll",
      title: "Mount the slope sensor",
      cue: "Carry the slope sensor to the moldboard mount before the first pass sets the crown.",
      why: "The sensor is what turns the crown from a number on the plan into a live reading the operator can cut against in real time — mounting it before the first pass means every pass from the first one on is checked against the actual crown, not assumed from how the last job felt.",
      drag: { to: "sensor-socket", radius: 0.4, missNote: "Not seated on the mount — set the sensor on the moldboard bracket before it will read anything." },
    },
    {
      id: "crown-check", kind: "gauge", target: "slope-sensor",
      title: "Read the crown sensor",
      cue: "Check the cross-slope reading and commit only inside the target crown band.",
      why: "The crown percentage is what makes this surface actually shed water instead of pond on it, and the sensor is the only way to confirm the moldboard is cutting the plan's crown rather than whatever angle looks about right from the cab.",
      gauge: {
        label: "CROSS-SLOPE — CROWN", speed: 0.55, green: [0.44, 0.6],
        readout: (t) => `${(1.5 + t * 3).toFixed(1)}%`,
        missNote: "Outside the target crown. Adjust the circle angle before this pass cuts the surface.",
      },
    },
    {
      id: "fine-grade-pass", kind: "hold", target: "grader-controls", seconds: 6,
      title: "Make the fine-grade pass",
      cue: "Hold the controls steady for one slow, controlled pass along the stringline.",
      why: "A fine-grade pass is run slow on purpose — a fast, confident pass is exactly the pass that drifts off the stringline half an inch at a time without the operator noticing until the whole run is out of crown from one end to the other.",
      holdBreakNote: "Released the controls mid-pass. Hold it through the whole run — that is what keeps this pass on the stringline instead of a guess at where it was.",
    },
    {
      id: "direct-grade-pass", kind: "track", target: "grade-checker", seconds: 8,
      title: "Work the pass under the checker's signal",
      cue: "Keep the grade checker's signal steady, holding the cut on the stringline the whole pass.",
      why: "The grade checker is watching the stringline and the moldboard's actual line against it, from an angle the cab cannot match — continuous signals from that vantage are what keep the pass honest to the string instead of to whatever line looks straight from the seat.",
      track: {
        start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12,
        label: "CUT LINE",
        readout: (v) => (v < 0.4 ? "drifting low of the string" : v > 0.62 ? "drifting high of the string" : "on the stringline"),
      },
      holdBreakNote: "The cut drifted off the stringline. Bring it back on the checker's signal before the moldboard moves again.",
    },
    {
      id: "straightedge-check", kind: "gauge", target: "straightedge",
      title: "Check the finished crown",
      cue: "Lay the straightedge across the crown and commit once the gap reads inside tolerance.",
      why: "A crown that looks even from the cab can still have a low spot the straightedge catches immediately — checking it here, while the surface is still open to correct, is what keeps a defect from being discovered later by the first puddle that forms on it.",
      gauge: {
        label: "STRAIGHTEDGE — SURFACE GAP", speed: 0.5, green: [0.35, 0.55],
        readout: (t) => `${Math.round(t * 20)} mm gap`,
        missNote: "Outside tolerance. Run the pass again over this section before calling the crown finished.",
      },
    },
    {
      id: "drainage-outlet-check", kind: "select", target: "drainage-outlet",
      title: "Confirm the drainage outlet is clear",
      cue: "Confirm the outlet the crown drains toward is clear before signing off the surface.",
      why: "A crown only does its job if the water it sheds actually has somewhere to go — an outlet left blocked or buried under the day's spoil turns a correctly cut crown into a surface that ponds water at the low edge on the very first rain.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the grading log",
      cue: "Log the crown reading and the straightedge result before shutting the machine down.",
      why: "The grading log is what the next inspection and the next shift both read — a crown that was cut and checked cleanly but never logged against the plan leaves nothing behind to prove the grade was actually verified.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, OPGR_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.6, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.92 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#4d4133", base2: "#413728", seam: "rgba(0,0,0,0.4)" }), { repeat: 7, px: 512 }),
      { rough: 0.92, metal: 0.03, color: 0xc7b48c },
    );

    // ------------------------------------------------------------------ the grader
    const gr = grader(g, -0.8, 0.14, 0.4, { ry: 1.6, livery: { colour: OPGR_ACCENT, fleetName: "SITE GRADE", unitNumber: "GR-14" } });
    const { moldboard, circle, door } = gr.userData.parts;
    holoTag(gr, "grader GR-14", 0, 3.5, 0, { css: "#3f7fb0", w: 0.32 });
    reg(hits, door, "grader-controls");
    reg(hits, circle, "circle-underfoot");

    const circleLever = group(g, 0.6, 0.14, 1.2, 0.3);
    box(circleLever, 0.08, 0.04, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.55 });
    const circleLeverKnob = cyl(circleLever, 0.018, 0.018, 0.16, 0.06, 0.5, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.6, rough: 0.4, seg: 12 });
    circleLeverKnob.rotation.z = Math.PI / 2;
    holoTag(circleLever, "circle angle", 0, 0.66, 0, { css: "#3f7fb0", w: 0.3 });
    reg(hits, circleLeverKnob, "circle-angle-lever");
    const bladeDropLever = box(circleLever, 0.08, 0.06, 0.02, -0.14, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(bladeDropLever, 0.07, 0.05, 0, 0, 0.011, signFace("DROP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    reg(hits, bladeDropLever, "blade-drop-hazard");

    // Sensor, staged until it is mounted on the moldboard bracket.
    const sensorRoll = group(g, 1.4, 0.14, 1.0, 0.3);
    box(sensorRoll, 0.14, 0.1, 0.08, 0, 0.06, 0, 0x2b3138, { rough: 0.6, metal: 0.2 });
    holoTag(sensorRoll, "slope sensor", 0, 0.24, 0, { css: "#3f7fb0", w: 0.3 });
    reg(hits, sensorRoll, "sensor-roll");
    const sensorSocket = group(moldboard, 0, 0.6, 0);
    hits["sensor-socket"] = sensorSocket;
    const slopeSensor = instrument(g, 1.4, 0, 1.6, { ry: -0.3, idle: "-- %", color: OPGR_ACCENT });
    holoTag(slopeSensor, "slope sensor readout", 0, 0.16, 0, { css: "#3f7fb0", w: 0.4 });
    reg(hits, slopeSensor, "slope-sensor");

    // ------------------------------------------------------------------ stringline
    const stringA = group(g, -2.2, 0.14, -1.4);
    cyl(stringA, 0.02, 0.02, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    reg(hits, stringA, "stake-a");
    const stringB = group(g, 2.2, 0.14, -1.4);
    cyl(stringB, 0.02, 0.02, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    reg(hits, stringB, "stake-b");
    const string = cyl(g, 0.006, 0.006, 4.4, 0, 0.7, -1.4, 0xf2c14b, { rough: 0.6, seg: 6 });
    string.rotation.z = Math.PI / 2;

    // Restring flag the stringline-sags interrupt is answered with.
    const restringFlag = group(g, 0.5, 0.14, -1.9, 0.3);
    cyl(restringFlag, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(restringFlag, 0.16, 0.11, 0.01, 0, 0.62, 0.02, 0x59c97b, { rough: 0.55 });
    holoTag(restringFlag, "restring", 0, 0.78, 0, { css: "#3f7fb0", w: 0.28 });
    reg(hits, restringFlag, "restring-flag");

    // ------------------------------------------------------------------ subgrade
    const subgrade = group(g, -0.4, 0, 1.9);
    const softSpot = group(subgrade, -0.9, 0.155, 0);
    box(softSpot, 0.3, 0.005, 0.3, 0, 0, 0, 0x2f2618, { rough: 0.9, cast: false });
    reg(hits, softSpot, "soft-spot");
    const highSpot = group(subgrade, 0, 0.2, 0.2);
    box(highSpot, 0.3, 0.08, 0.3, 0, 0, 0, 0x5a4a2e, { rough: 0.9, cast: false });
    reg(hits, highSpot, "high-spot");
    const subDebris = group(subgrade, 0.8, 0.18, 0);
    for (let i = 0; i < 3; i++) ball(subDebris, 0.05, i * 0.12 - 0.1, 0, 0, 0x5a5048, { rough: 0.9, seg: 8 });
    reg(hits, subDebris, "subgrade-debris");
    const cleanSub = group(subgrade, 1.6, 0.155, 0);
    box(cleanSub, 0.3, 0.005, 0.3, 0, 0, 0, 0x4b3d26, { rough: 0.9, cast: false });
    reg(hits, cleanSub, "clean-subgrade");

    // ------------------------------------------------------------------ guarding
    reg(hits, cone(g, -2.8, -2.3, { color: OPGR_ACCENT }), "cone-a");
    reg(hits, cone(g, 2.8, -2.3, { color: OPGR_ACCENT }), "cone-b");
    const barrierPanels = [];
    for (const [bx, bz, ry] of [[-2.5, -0.5, Math.PI / 2], [-2.5, -2.0, Math.PI / 2], [-1.4, -2.6, 0], [-0.4, -2.6, 0], [0.6, -2.6, 0]]) {
      const p = barrierPanel(g, bx, bz, { ry, w: 1.1, color: OPGR_ACCENT });
      p.visible = false;
      barrierPanels.push(p);
    }
    const laneBarrierPost = group(g, 2.4, 0, -0.6, -0.4);
    slab(laneBarrierPost, 1.0, 0.14, 0.18, 0, 0.08, 0, OPGR_ACCENT, { radius: 0.02, rough: 0.6 });
    holoTag(laneBarrierPost, "lane barrier", 0, 0.3, 0, { css: "#3f7fb0", w: 0.32 });
    reg(hits, laneBarrierPost, "lane-barrier");
    const unmarkedLane = box(g, 1.2, 0.02, 1.0, 2.3, 0.16, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "open lane — barricade first", 2.3, 0.32, -1.2, { css: "#f0645b", w: 0.5 });
    reg(hits, unmarkedLane, "unmarked-lane-hazard");

    // Stop paddle the vehicle-enters-lane interrupt is answered with.
    const stopPaddle = group(g, 2.6, 0.14, -1.9, 0.3);
    cyl(stopPaddle, 0.012, 0.012, 0.9, 0, 0.45, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    cyl(stopPaddle, 0.14, 0.14, 0.02, 0, 0.85, 0, 0xd2312b, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    decal(stopPaddle, 0.13, 0.13, 0, 0.86, 0, signFace("STOP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.6 }));
    holoTag(stopPaddle, "stop paddle", 0, 1.0, 0, { css: "#3f7fb0", w: 0.3 });
    reg(hits, stopPaddle, "stop-paddle");

    // Drainage outlet, downhill of the crown.
    const outlet = group(g, -2.6, 0, 1.8);
    box(outlet, 0.4, 0.1, 0.4, 0, 0.05, 0, 0x2b2f34, { rough: 0.7 });
    cyl(outlet, 0.1, 0.1, 0.3, 0, 0.05, 0.3, 0x1c1712, { rough: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(outlet, "drainage outlet", 0, 0.3, 0, { css: "#3f7fb0", w: 0.32 });
    reg(hits, outlet, "drainage-outlet");
    const outletBlockLever = box(outlet, 0.08, 0.06, 0.02, 0.25, 0.2, 0.1, 0xd2312b, { rough: 0.5 });
    decal(outletBlockLever, 0.07, 0.05, 0, 0, 0.011, signFace("PUSH IN", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.42 }));
    reg(hits, outletBlockLever, "outlet-block-hazard");

    // ------------------------------------------------------------------ crew
    const spotter = standingFigure(g, 2.4, 1.6, { ry: -2.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(spotter, "spotter", 0, 1.95, 0.15, { css: "#3f7fb0", w: 0.24 });
    reg(hits, spotter, "spotter");

    const gradeChecker = standingFigure(g, -1.6, -1.6, { ry: 1.2, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });
    holoTag(gradeChecker, "grade checker", 0, 1.95, 0.15, { css: "#3f7fb0", w: 0.32 });
    reg(hits, gradeChecker, "grade-checker");
    const straightedgeTool = level(gradeChecker, 0.3, 0.9, 0.1, { ry: 0.3 });
    holoTag(straightedgeTool, "straightedge", 0, 0.14, 0, { css: "#3f7fb0", w: 0.32 });
    reg(hits, straightedgeTool, "straightedge");

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.58, 0.4, -2.6, 1.5, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#3f7fb0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("GRADING PLAN · SECTION 3", w * 0.06, h * 0.12);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CROWN PER THE PLAN", w * 0.06, h * 0.3);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Cut direction: per the plan", "Lane: barricade before working it",
       "Stringline: set before the first pass", "Straightedge tolerance: per the spec",
       "Outlet: confirm clear before sign-off"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.46 + i * 0.11)));
    }, { ry: 0.5, accent: OPGR_ACCENT });
    reg(hits, plan, "grading-plan-board");

    const ppeRack = group(g, -2.9, 0, 2.4, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, OPGR_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#3f7fb0", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#3f7fb0", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    const closingLog = group(g, 2.7, 0, 2.4, 0.4);
    slab(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("GRADING LOG\nOPEN", { bg: "#11181f", accent: "#3f7fb0", scale: 0.28 }), { px: 320 });
    holoTag(closingLog, "grading log", 0, 1.34, 0, { css: "#3f7fb0", w: 0.3 });
    reg(hits, closingLog, "closing-log");

    // Site dressing from the shared props kit.
    fencePanel(g, -2.9, 0, -0.8, { ry: 1.5 });

    const dust = particles(gr, 20, 0x9a8a6a, { size: 0.02, life: 0.6, additive: false, opacity: 0.18 });

    return {
      hits,
      footprint: 2.6,

      onInterrupt(it) {
        if (it.id === "vehicle-enters-lane") { spotter.position.x -= 0.5; }
        if (it.id === "stringline-sags") { string.position.y -= 0.18; string.rotation.x = 0.05; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vehicle-enters-lane") { spotter.position.x += 0.5; }
        if (it.id === "stringline-sags") { string.position.y += 0.18; string.rotation.x = 0; }
      },
      onStepComplete(step) {
        if (step.id === "walk-subgrade") {
          softSpot.children[0].material = mat(0x59c97b, { rough: 0.6 });
          highSpot.children[0].material = mat(0x59c97b, { rough: 0.6 });
          for (const c of subDebris.children) c.material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "barricade-lane") barrierPanels.forEach((p) => { p.visible = true; });
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("GRADING LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        }
      },
      onHazard(hitId) { if (hitId === "outlet-block-hazard") { dust.visible = true; } },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        gradeChecker.userData.head.rotation.y = Math.sin(t * 0.5 + 1) * 0.3;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.4, 0), 0.15, 0.15, -0.1);
        if (!session?.finished && (!session?.step || session.step.id !== "fine-grade-pass")) {
          moldboard.rotation.y = Math.sin(t * 0.3) * 0.01;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "crown-check") {
            const pct = (1.5 + gg.t * 3).toFixed(1);
            repaint(slopeSensor.userData.screen, signFace(`${pct}%`, {
              bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
