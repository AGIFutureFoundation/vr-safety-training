import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hand Brake & Securement on a Grade VR — Mobility & Transit.
//
// A cut left standing on a grade is held by hand brakes, never by air —
// because air leaks off and nobody is there when it does. The whole job is
// proving that, not assuming it: enough brakes applied from the downgrade
// end first, wound up hard, backed by chocks, and the securement tested by
// releasing the air and watching for the one thing that says it didn't hold.
// Generic freight territory; no railroad, milepost or timetable named.

const RA_HBS_ACCENT = 0x4f9d5c;
const RA_HBS_CSS = "#4f9d5c";

export const SIM_RA_HAND_BRAKE_AND_SECUREMENT_ON_A_GRADE = {
  id: "ra-hand-brake-and-securement-on-a-grade",
  index: "426",
  domain: "Track",
  trade: "Conductor / trainman",
  category: "Mobility & Transit",
  weather: "clear",
  certification: "Securement worked to FRA 49 CFR Part 232, including the effectiveness test that has to prove hand brakes hold before the air is trusted for anything else, on a cut protected by three-step under FRA 49 CFR Part 214 before anyone goes near the coupler, called and confirmed with the dispatcher the way a BLET-qualified engineer and a SMART-TD conductor both expect a securement report to read",
  name: "Hand Brake & Securement on a Grade",
  title: simTitle("Hand Brake & Securement on a Grade"),
  tagline: "Enough hand brakes applied from the downgrade end first, wound up hard, backed by chocks, tested by releasing the air and watching for the one thing that says it didn't hold, and the locomotive parted only once three-step is confirmed",
  accent: RA_HBS_ACCENT,
  accentCss: RA_HBS_CSS,
  parSeconds: 320,
  footprint: 2.3,
  supportLine: "your trainmaster or your SMART-TD local if a rollaway close call is still sitting with you after shift",
  badge: { id: "held-on-the-grade", name: "Held On The Grade", note: "Securement proved by test, not assumed from a count of turns on a wheel" },

  game: system({
    name: "Securement Authority",
    currency: "GRADE",
    ranks: ["Trainman", "Qualified Conductor", "Lead Conductor", "Trainmaster", "Securement Certified"],
    badges: [
      { id: "never-below", name: "Never Below", note: "Never once standing in the rollaway path during the test", test: AWARD.safe },
      { id: "calc-true", name: "Calc True", note: "Every securement calculation and test reading near band centre", test: AWARD.precise(0.72) },
      { id: "test-clean", name: "Clean Test", note: "Release and push-pull test steps worked with no correction", test: AWARD.all(AWARD.stepClean("air-release"), AWARD.stepClean("push-pull-test")) },
    ],
    challenges: [
      { id: "grade-time", name: "Grade Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-secure", name: "First Secure", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ten-clear", name: "Ten Clear", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "downhill-side-stand": "You are standing directly downgrade of the cut during the test. If the securement has not actually held, this is exactly the path the equipment takes, and it takes it with no warning beyond the sound you would already be standing in.",
    "between-cars-uncoupling": "You reached for the coupler before three-step was confirmed. A locomotive is only proven unable to move once the crew has heard the acknowledgement — reaching in ahead of that is trusting a machine that has not yet said it can't.",
    "chock-reach-unsecured": "You reached toward the wheel to place a chock before any hand brake was actually applied. A cut with no brakes set at all can move on a grade with nothing but its own weight, and a hand at the wheel is the last place you want to be when it does.",
    "brake-wheel-pinch": "You put a hand on the hand brake wheel while someone else was already winding it. A wheel under load from a chain that is taking up hard can catch a hand in the spokes exactly the way it is built to move rope or chain, and it does not know the difference.",
  },

  lateNotes: {
    "left-chock": "Nothing gets logged clear until the walk is actually done.",
  },

  interrupts: [
    {
      id: "creep-detected",
      kind: "The cut moves during the release test",
      after: "air-release", delay: 4, seconds: 12,
      alert: "The cut has crept half a car length downgrade. The hand brakes you applied are not enough on their own.",
      cue: "That is the one thing this test exists to catch, and it just happened.",
      target: "lead-handbrake",
      why: "A push-pull test with the air released is the only way to find out whether hand brakes alone actually hold this tonnage on this grade, and creep during the test means the answer is no — the fix is more brake, applied and wound up hard, before anything else about this cut is trusted, including the air that just came back off.",
      missNote: "You let the creep continue without adding brake. A cut that moves half a car length on its own with the air off does not stop moving because the test is over — it stops when something wound tight enough actually holds it, and nothing you did just added that.",
      wrongNote: "That does not add holding force to a cut that is already moving. Get another hand brake wound up hard.",
    },
    {
      id: "wheel-slip-warning",
      kind: "A hand brake wheel spins loose under load",
      after: "watch-dial", delay: 4, seconds: 11,
      alert: "The hand brake wheel on the lead car has started spinning back on its own — the pawl has slipped and the chain is paying back out.",
      cue: "That brake is losing its hold while you're watching for exactly this.",
      target: "lead-handbrake",
      why: "A pawl that has slipped is a hand brake that is no longer actually applying force, whatever the wheel's earlier position suggested, and a brake losing tension while the cut is still on the grade is the one failure this whole test is built to catch before it becomes a rollaway rather than after.",
      missNote: "You watched the wheel spin back without re-taking it up. A hand brake that has slipped its pawl holds nothing at all, and the only way it holds anything again is somebody winding it back up.",
      wrongNote: "That does not re-tension a slipped brake. Take the wheel back up.",
    },
  ],

  steps: [
    {
      id: "briefing", kind: "select", target: "grade-profile-board",
      title: "Read the grade profile",
      cue: "Check the grade, the tonnage and the number of cars in the cut.",
      why: "How many hand brakes this cut needs is worked from the grade and the tonnage on the profile board, not guessed by feel — a cut on a steeper grade or carrying more tonnage needs more braking force than the same count of cars would on level track.",
    },
    {
      id: "securement-calc", kind: "gauge", target: "securement-calc",
      title: "Calculate the number of hand brakes required",
      cue: "Set the calculator against the grade and tonnage and commit the required count.",
      why: "Securement is a number worked from a chart against the actual grade and tonnage, per the rulebook — applying whatever number of brakes feels sufficient is exactly the habit that works right up until the one cut where it doesn't.",
      gauge: {
        label: "BRAKES REQUIRED", speed: 0.66, green: [0.54, 0.74],
        readout: (t) => `${Math.round(2 + t * 3)} cars`,
        missNote: "That count does not match this grade and tonnage. Recalculate before applying brakes.",
      },
    },
    {
      id: "apply-brakes", kind: "sequence",
      targets: ["car-1-handbrake", "car-2-handbrake"],
      itemNames: { "car-1-handbrake": "apply hand brake — downgrade car", "car-2-handbrake": "apply hand brake — second car" },
      title: "Apply hand brakes from the downgrade end",
      cue: "Apply the downgrade car's hand brake first, then the next one up the grade.",
      why: "The downgrade car is the one that starts a rollaway the moment the cut begins to move, so it is the first brake applied and the one this whole securement depends on most — working up the grade after that is what actually resists the cut as a whole, not just its leading edge.",
      outOfOrderNote: "Wrong order — the downgrade car goes first. A cut braked from the wrong end can still start moving before the brake that would have stopped it is even applied.",
    },
    {
      id: "wind-tight", kind: "turn", target: "lead-handbrake",
      title: "Wind the lead hand brake up hard",
      cue: "Turn the hand brake wheel until it is fully taken up, not just engaged.",
      why: "A hand brake that is engaged but not wound up hard is a brake that is holding almost nothing — the chain has to be taken up tight enough that the shoe is actually loaded against the wheel, and how hard is a thing this test checks rather than assumes.",
      turn: { turns: 2, axis: "x", label: "HAND BRAKE" },
    },
    {
      id: "chock", kind: "drag", target: "chocks",
      title: "Chock the wheels",
      cue: "Carry the chocks from the kit to the downgrade wheel and set them.",
      why: "Chocks are the backup to the hand brakes, not a replacement for them — if a brake's pawl slips or a chain stretches under load, the chock is the one piece of this securement that has no moving parts left to fail.",
      drag: { to: "chock-position", radius: 0.3, missNote: "Not seated against the wheel — carry the chock the rest of the way and set it flush." },
    },
    {
      id: "chock-check", kind: "select", target: "chock-check",
      title: "Verify the chock is seated",
      cue: "Check the chock sits flush against the wheel with no gap.",
      why: "A chock resting near the wheel instead of against it does nothing until the wheel has already rolled far enough to reach it, which defeats the entire point of a backup that is supposed to act before the hand brakes are tested to their limit.",
    },
    {
      id: "air-release", kind: "hold", target: "air-release-valve", seconds: 5,
      title: "Release the air brakes",
      cue: "Hold the release valve open and watch the cut while the air bleeds off.",
      why: "The air brakes have to come off before the hand brakes can be tested on their own, because a cut that is only standing still because the air is still applied has not actually been proven secure by anything this crew did — releasing it is what turns an assumption into a test.",
      holdBreakNote: "You let go of the valve before the air was fully off. A partial release leaves some of the air brake still doing the holding, which is exactly what this test is supposed to rule out.",
    },
    {
      id: "watch-dial", kind: "track", target: "watch-dial", seconds: 6,
      title: "Watch for movement",
      cue: "Hold your attention on the cut in the green band for the full watch, not just the first few seconds.",
      why: "A securement failure does not always show itself the instant the air comes off — a brake that is barely holding can creep for several seconds before it either catches or lets go entirely, so the watch runs the full count rather than ending the moment nothing has happened yet.",
      holdBreakNote: "Attention dropped out of band during the watch. A creep that starts in the exact second nobody is looking is a creep that gets found by somebody else, somewhere downgrade.",
    },
    {
      id: "push-pull-test", kind: "select", target: "test-point",
      title: "Perform the push-pull test",
      cue: "Apply force at the test point and confirm the cut does not move.",
      why: "The push-pull test is the actual proof this securement holds — not the number of brakes applied, not how many turns went onto a wheel, but whether the cut resists an applied force the way a securely braked cut is supposed to.",
    },
    {
      id: "three-step", kind: "select", target: "three-step-button",
      title: "Confirm three-step on the locomotive",
      cue: "Call for three-step and wait for the acknowledgement before approaching the coupler.",
      why: "Three-step is the locomotive's own undertaking that it cannot move — brakes applied, reverser centred, power off — and it is confirmed before anyone goes near the coupler because a locomotive that has not yet answered is a locomotive this crew has no proof cannot move.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["left-chock", "open-tool-box"],
      itemNames: { "left-chock": "spare chock left on the ballast", "open-tool-box": "tool box left open on the shoulder" },
      itemNotes: {
        "left-chock": "A chock left where nobody set it is a chock that will not be there the next time this cut needs one.",
        "open-tool-box": "An open lid catches wind and rain both; closed and latched before it is left for the next crew.",
      },
      title: "Walk the cut before you leave it",
      cue: "Scan the worksite and clear anything that didn't make it back into the kit.",
      why: "A securement job leaves chocks, tools and paperwork scattered the length of the cut, and the only check that catches what did not make it back is somebody actually walking the ground before signing off.",
    },
    {
      id: "uncouple", kind: "select", target: "uncouple-lever",
      title: "Uncouple the locomotive",
      cue: "Pull the uncoupling lever now that three-step is confirmed and the cut is proven secure.",
      why: "The locomotive is parted from a cut that has already been tested and proven, in that order — uncoupling first and testing the securement afterward would mean finding out it failed with nothing left attached to help hold it.",
    },
    {
      id: "radio-report", kind: "hold", target: "radio-handset", seconds: 4,
      title: "Report the cut secured",
      cue: "Call the dispatcher and hold the radio for the read-back confirming the securement.",
      why: "The dispatcher's own record of this cut being secured is what every other crew in the yard relies on when they cannot see it themselves, and that record does not change until you have said so and had it read back to you.",
      holdBreakNote: "You let go before the read-back came back. The record does not change until the dispatcher has said so in your own hearing.",
    },
    {
      id: "close-log", kind: "select", target: "closing-log",
      title: "Close the securement log",
      cue: "Log the brake count, the grade and the result of the push-pull test.",
      why: "The next crew to touch this cut only knows what this entry tells them — how many brakes, how hard, and whether the test actually passed. A securement job with no log behind it is, to the next crew, a cut nobody has proven anything about.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RA_HBS_ACCENT);

    // ------------------------------------------------------------- textures
    const ballastTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#585349"); grad.addColorStop(1, "#3c3830");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const x = (i * 43.7) % w, y = (i * 79.3) % h, r = 1.4 + ((i * 15) % 5) * 0.5;
        cx.fillStyle = i % 4 === 0 ? "rgba(150,140,122,0.55)" : "rgba(30,26,20,0.45)";
        cx.beginPath(); cx.ellipse(x, y, r, r * 0.7, (i % 6) * 0.5, 0, 7); cx.fill();
      }
    }, { repeat: 6 });
    const ballastMat = texturedMat(ballastTex, { rough: 0.96, color: 0x8b8578 });

    const railTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#c7ccd1"); grad.addColorStop(0.5, "#8a9096"); grad.addColorStop(1, "#5b6167");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "rgba(120,70,40,0.18)";
      for (let i = 0; i < 30; i++) cx.fillRect((i * 37) % w, 0, 2, h);
    }, { repeat: 3 });
    const railMat = texturedMat(railTex, { rough: 0.32, metal: 0.75, color: 0xaab0b6 });

    const tieTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#3a2c20"); grad.addColorStop(0.5, "#2c2117"); grad.addColorStop(1, "#382a1e");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "rgba(0,0,0,0.35)"; cx.lineWidth = 2;
      for (let i = 0; i < 10; i++) { cx.beginPath(); cx.moveTo(0, (i / 10) * h + 4); cx.bezierCurveTo(w * 0.3, (i / 10) * h - 3, w * 0.7, (i / 10) * h + 6, w, (i / 10) * h); cx.stroke(); }
    }, { repeat: 1 });
    const tieMat = texturedMat(tieTex, { rough: 0.9, color: 0x8a7a68 });

    const platformTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#3f5342", base2: "#334336", seam: "rgba(0,0,0,0.5)",
    }), { repeat: 3 });
    const platformMat = texturedMat(platformTex, { rough: 0.9, color: 0xa8c7ac });

    // ------------------------------------------------------------- graded track
    const trackTilt = group(g, 0, 0, 0, 0);
    trackTilt.rotation.z = 0.045;
    const ballast = box(trackTilt, 6.2, 0.16, 1.6, 0, 0.08, 0, 0x8b8578, { rough: 0.98 });
    ballast.material = ballastMat;
    for (const sx of [-1, 1]) {
      const rail = box(trackTilt, 6.2, 0.1, 0.06, 0, 0.21, sx * 0.36, 0xaab0b6, { rough: 0.32, metal: 0.75 });
      rail.material = railMat;
    }
    for (let i = -11; i <= 11; i++) {
      const tie = box(trackTilt, 0.16, 0.06, 0.9, i * 0.27, 0.11, 0, 0x8a7a68, { rough: 0.9 });
      tie.material = tieMat;
    }

    // Grade profile board.
    const gradeBoard = holoPanel(g, 0.6, 0.42, -3.0, 1.55, 1.4, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_HBS_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#b6d6ba";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("GRADE PROFILE · SIDING 6", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6ec";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("DESCENDING GRADE", w * 0.06, h * 0.32);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = "#bcdec0";
      ["Grade and tonnage: per the rulebook chart", "Hand brakes proven by push-pull test", "Chocks back every securement"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.5 + i * 0.12)));
    }, { ry: 0.6, accent: RA_HBS_ACCENT });
    reg(hits, gradeBoard, "grade-profile-board");

    const calcTool = group(g, -2.4, 0, 1.5, -0.3);
    slab(calcTool, 0.2, 0.14, 0.03, 0, 0.85, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const calcReadout = decal(calcTool, 0.16, 0.08, 0, 0.87, 0.02,
      signFace("-- cars", { bg: "#0d1c24", accent: RA_HBS_CSS, scale: 0.5 }), { glow: true, ei: 0.7, px: 200 });
    holoTag(calcTool, "Securement calc", 0, 1.0, 0, { css: RA_HBS_CSS, w: 0.32 });
    reg(hits, calcTool, "securement-calc");

    // ------------------------------------------------------------- freight cars
    function freightCar(parent, x, colour, marks) {
      const c = group(parent, x, 0, 0);
      box(c, 1.9, 1.4, 1.4, 0, 1.4, 0, colour, { rough: 0.78, metal: 0.22, finish: "painted" });
      box(c, 1.96, 0.18, 1.46, 0, 2.14, 0, 0x4a4048, { rough: 0.7, metal: 0.4 });
      decal(c, 0.7, 0.16, -0.3, 1.9, 0.71, (cx, w, h) => {
        cx.clearRect(0, 0, w, h);
        cx.fillStyle = "#d8ccc0";
        cx.font = `600 ${Math.round(h * 0.8)}px 'Barlow Condensed', Arial, sans-serif`;
        cx.textAlign = "left"; cx.textBaseline = "middle";
        cx.fillText(marks, 0, h * 0.56);
      }, { px: 220, transparent: true, rough: 0.9 });
      for (const sx of [-1, 1]) {
        box(c, 0.68, 0.28, 1.0, sx * 0.62, 0.36, 0, 0x22201e, { rough: 0.9 });
        for (const sz of [-1, 1]) {
          cyl(c, 0.24, 0.24, 0.08, sx * 0.62, 0.3, sz * 0.46, 0x4c4340, { rough: 0.5, metal: 0.7, seg: 14 }).rotation.x = Math.PI / 2;
        }
      }
      return c;
    }
    const carDown = freightCar(trackTilt, -2.0, 0x3f6b48, "SCX 55103");
    const carMid = freightCar(trackTilt, 0.0, 0x4a5a3f, "SCX 55104");
    const carLoco = group(trackTilt, 2.4, 0, 0, -0.3);
    box(carLoco, 2.6, 0.24, 1.56, 0, 0.58, 0, 0x2b3138, { rough: 0.7, metal: 0.45 });
    box(carLoco, 1.5, 0.98, 1.14, -0.42, 1.26, 0, 0x2f3841, { rough: 0.6, metal: 0.4 });
    box(carLoco, 0.78, 1.18, 1.3, 0.62, 1.36, 0, 0x2f3841, { rough: 0.6, metal: 0.4 });

    // Coupler and drawbar between the second car and the locomotive.
    const drawbar = box(trackTilt, 0.36, 0.2, 0.26, 1.2, 0.6, 0, 0x5b6269, { rough: 0.6, metal: 0.5 });
    reg(hits, drawbar, "uncouple-lever");
    const betweenTrap = box(trackTilt, 0.6, 1.6, 1.2, 1.2, 0.8, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, betweenTrap, "between-cars-uncoupling");

    // Three-step control on the locomotive.
    const threeStep = box(carLoco, 0.08, 0.035, 0.05, 0.4, 0.95, 0.3, 0x2f6fd8, { rough: 0.5, emissive: 0x2f6fd8, ei: 0.8 });
    holoTag(carLoco, "Three-step", 0.4, 1.15, 0.3, { css: "#2f6fd8", w: 0.28 });
    reg(hits, threeStep, "three-step-button");

    // Hand brake wheels on the two cars.
    function handbrakeWheel(parent, x, id) {
      const hb = group(parent, x, 1.46, -0.72);
      const wheel = torus(hb, 0.15, 0.018, 0, 0, 0, 0xd8dce0, { rough: 0.5, metal: 0.7, seg: 6, seg2: 18 });
      wheel.rotation.y = Math.PI / 2;
      reg(hits, wheel, id);
      const pinch = box(hb, 0.3, 0.3, 0.3, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      return { hb, wheel, pinch };
    }
    const hbDown = handbrakeWheel(trackTilt, -2.0, "lead-handbrake");
    const hbMid = handbrakeWheel(trackTilt, 0.0, "car-2-handbrake");
    reg(hits, hbDown.pinch, "brake-wheel-pinch");
    holoTag(hbDown.hb, "Lead hand brake", 0, 0.24, 0, { css: RA_HBS_CSS, w: 0.32 });
    // The downgrade car's own apply-step marker, its own hit distinct from the
    // wheel used for the wind-tight turn and the interrupt target above.
    const applyMarkerDown = box(hbDown.hb, 0.05, 0.05, 0.05, 0, -0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, applyMarkerDown, "car-1-handbrake");

    // Chocks and wheel.
    const chockCart = group(g, -2.7, 0, -0.4, 0.3);
    box(chockCart, 0.3, 0.3, 0.3, 0, 0.15, 0, 0x3a4048, { rough: 0.7, metal: 0.3 });
    const chock = box(chockCart, 0.16, 0.1, 0.14, 0, 0.35, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(chockCart, "Wheel chocks", 0, 0.5, 0, { css: RA_HBS_CSS, w: 0.28 });
    reg(hits, chock, "chocks");
    hits["chock-position"] = box(trackTilt, 0.3, 0.2, 0.3, -2.62, 0.1, -0.46, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    const chockSeated = box(trackTilt, 0.16, 0.1, 0.14, -2.62, 0.1, -0.46, 0xf2c14b, { rough: 0.6 });
    chockSeated.visible = false;
    reg(hits, chockSeated, "chock-check");
    reg(hits, box(trackTilt, 0.5, 0.4, 0.5, -2.62, 0.2, -0.36, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "chock-reach-unsecured");

    // Air release valve.
    const releaseValve = group(carLoco, -1.1, 0.9, -0.7, -0.4);
    cyl(releaseValve, 0.04, 0.045, 0.12, 0, 0, 0, 0x59636d, { rough: 0.5, metal: 0.5, seg: 10 });
    const releaseHandle = box(releaseValve, 0.16, 0.03, 0.03, 0, 0.09, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(releaseValve, "Air release", 0, 0.2, 0, { css: RA_HBS_CSS, w: 0.3 });
    reg(hits, releaseHandle, "air-release-valve");

    const watchDial = instrument(g, -1.4, 0.86, 1.2, { ry: -0.5, idle: "WATCH", color: RA_HBS_ACCENT });
    holoTag(watchDial, "Rollaway watch", 0, 0.15, 0, { css: RA_HBS_CSS, w: 0.32 });
    reg(hits, watchDial, "watch-dial");

    const testPoint = group(trackTilt, -1.0, 0.7, 0.75, -0.5);
    box(testPoint, 0.1, 0.1, 0.1, 0, 0, 0, RA_HBS_ACCENT, { rough: 0.6, emissive: RA_HBS_ACCENT, ei: 0.4 });
    holoTag(testPoint, "Test point", 0, 0.18, 0, { css: RA_HBS_CSS, w: 0.26 });
    reg(hits, testPoint, "test-point");

    // Downhill rollaway path — a trap the whole length of the cut, downgrade.
    reg(hits, box(trackTilt, 3.0, 1.8, 1.4, -4.6, 0.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "downhill-side-stand");

    // Left tools.
    const leftChock = group(g, -0.6, 0.12, -0.9, 0.4);
    box(leftChock, 0.16, 0.1, 0.14, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    reg(hits, leftChock, "left-chock");
    const openBox = group(g, 2.9, 0, 1.3);
    box(openBox, 0.3, 0.16, 0.2, 0, 0.08, 0, 0x3a4048, { rough: 0.8, metal: 0.3 });
    const boxLid = box(openBox, 0.3, 0.02, 0.2, 0, 0.2, -0.1, 0x3a4048, { rough: 0.8, metal: 0.3 });
    boxLid.rotation.x = -0.9;
    reg(hits, openBox, "open-tool-box");

    // Radio, crew, closing log.
    const radio = group(g, -2.7, 0, 1.6, -0.3);
    slab(radio, 0.5, 0.16, 0.16, 0, 0.85, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const radioScreen = decal(radio, 0.4, 0.1, 0, 0.87, 0.09,
      signFace("STANDBY", { bg: "#0d1c24", accent: RA_HBS_CSS, fg: "#d3f2d8", scale: 0.5 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(radio, "Dispatcher line", 0, 1.05, 0.08, { css: RA_HBS_CSS, w: 0.32 });
    reg(hits, radio, "radio-handset");

    const conductor = standingFigure(g, 3.4, -1.6, { ry: -2.3, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    const secondHand = standingFigure(g, -3.5, 2.0, { ry: 0.8, cloth: 0x2b3138, vest: 0xf2894b, helmet: 0xf2f2f2 });

    // Extra rigging detail on the two secured cars — ladders, sill steps and
    // grab irons that a securement crew actually climbs and holds onto.
    for (const c of [carDown, carMid]) {
      for (const sz of [-1, 1]) {
        cyl(c, 0.02, 0.02, 0.9, -1.0, 1.1, sz * 0.73, 0xc0c6cc, { rough: 0.5, metal: 0.6, seg: 6 }).rotation.z = 0.15;
        box(c, 0.28, 0.02, 0.02, -1.0, 0.9, sz * 0.73, 0xc0c6cc, { rough: 0.5, metal: 0.6 });
        box(c, 0.28, 0.02, 0.02, -1.0, 0.55, sz * 0.73, 0xc0c6cc, { rough: 0.5, metal: 0.6 });
      }
    }
    // Extra ties either side of the graded track for a fuller ballast bed.
    for (let i = -13; i <= -12; i++) box(trackTilt, 0.16, 0.06, 0.9, i * 0.27, 0.11, 0, 0x8a7a68, { rough: 0.9 }).material = tieMat;
    for (let i = 12; i <= 13; i++) box(trackTilt, 0.16, 0.06, 0.9, i * 0.27, 0.11, 0, 0x8a7a68, { rough: 0.9 }).material = tieMat;

    const closeLog = group(g, -2.7, 0, 2.4, -0.4);
    slab(closeLog, 0.4, 0.05, 0.3, 0, 0.86, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const closeScreen = decal(closeLog, 0.32, 0.16, 0, 0.89, 0.0, signFace("OPEN", { bg: "#0d1c24", accent: RA_HBS_CSS, fg: "#d3f2d8", scale: 0.4 }), { glow: true, ei: 0.8, px: 220 });
    closeScreen.rotation.x = -Math.PI / 2;
    holoTag(closeLog, "Securement log", 0, 1.0, 0, { css: RA_HBS_CSS, w: 0.32 });
    reg(hits, closeLog, "closing-log");

    const platform = box(g, 1.4, 0.1, 1.0, -2.9, 0.05, 0.6, 0xa8c7ac, { rough: 0.9 });
    platform.material = platformMat;

    cone(g, -3.2, 1.0, { color: RA_HBS_ACCENT });
    cone(g, 3.2, 1.0, { color: RA_HBS_ACCENT });

    let secured = false;

    return {
      hits,
      footprint: 2.3,

      onInterrupt(it) {
        if (it.id === "creep-detected") { carDown.position.x -= 0.25; carMid.position.x -= 0.25; }
        if (it.id === "wheel-slip-warning") hbDown.wheel.rotation.x = 0.6;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "creep-detected") { carDown.position.x += 0.25; carMid.position.x += 0.25; }
        if (it.id === "wheel-slip-warning") hbDown.wheel.rotation.x = 0;
      },

      onStepComplete(step) {
        if (step.id === "securement-calc") repaint(calcReadout, signFace("2 cars", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 }));
        if (step.id === "wind-tight") hbDown.wheel.material = mat(0x59c97b, { rough: 0.5, metal: 0.6 });
        if (step.id === "chock") { chock.visible = false; chockSeated.visible = true; }
        if (step.id === "air-release") repaint(radioScreen, signFace("AIR\nOFF", { bg: "#0d1c14", accent: RA_HBS_CSS, fg: "#d3f2d8", scale: 0.3 }));
        if (step.id === "uncouple") { carLoco.position.x += 0.3; }
        if (step.id === "walk") { leftChock.visible = false; boxLid.rotation.x = -1.57; }
        if (step.id === "radio-report") { secured = true; repaint(radioScreen, signFace("CUT\nSECURED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 })); }
        if (step.id === "close-log") repaint(closeScreen, signFace("CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
      },

      animate(t, dt, session) {
        conductor.userData.head.rotation.y = Math.sin(t * 0.5) * 0.4;
        secondHand.userData.head.rotation.y = Math.sin(t * 0.4 + 1.4) * 0.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "securement-calc") {
          repaint(calcReadout, signFace(`${Math.round(2 + gg.t * 3)} cars`, {
            bg: "#0d1c24", accent: gg.t > 0.54 && gg.t < 0.74 ? "#59c97b" : "#f2c14b", scale: 0.5,
          }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "watch-dial") watchDial.userData.show?.(`${Math.round(tr.v * 100)}%`);
        void secured;
      },
    };
  },
};
