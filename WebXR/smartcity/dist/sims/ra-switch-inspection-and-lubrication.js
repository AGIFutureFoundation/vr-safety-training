import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Switch Inspection & Lubrication VR — Mobility & Transit.
//
// A hand-thrown switch, taken out of service long enough to check the one
// thing a track circuit cannot see for itself: whether the points actually
// seat tight against the stock rail, whether the heater that keeps them free
// of ice can be trusted not to come back on with a hand still on it, and
// whether the lock that is supposed to hold the whole thing in position
// still does its job. Generic freight territory; no railroad, milepost or
// timetable named.

const RA_SWL_ACCENT = 0xb8a13a;
const RA_SWL_CSS = "#b8a13a";

export const SIM_RA_SWITCH_INSPECTION_AND_LUBRICATION = {
  id: "ra-switch-inspection-and-lubrication",
  index: "424",
  domain: "Track",
  trade: "Switch and turnout maintainer",
  category: "Mobility & Transit",
  weather: "clear",
  certification: "BMWED-qualified switch and turnout maintenance, worked to FRA 49 CFR Part 213 track safety standards for point closure and gauge at the switch, with the switch itself locked out and tagged under FRA 49 CFR Part 214 before any hand goes near the points, and the dispatcher's own record of the switch's position the only thing a BLET engineer or a SMART-TD conductor has to go on before they reach it",
  name: "Switch Inspection & Lubrication",
  title: simTitle("Switch Inspection & Lubrication"),
  tagline: "The switch locked and tagged out of service, the points measured and greased, the heater proved dead before a hand goes near the element, and the whole thing thrown, tested and handed back with the target indicator reading true",
  accent: RA_SWL_ACCENT,
  accentCss: RA_SWL_CSS,
  parSeconds: 300,
  footprint: 2.2,
  supportLine: "your roadmaster or your BMWED local if a close call at the points is still sitting with you after shift",
  badge: { id: "points-true", name: "Points True", note: "Switch locked out, points measured and greased, and handed back seating tight in both positions" },

  game: system({
    name: "Switch Authority",
    currency: "POINT",
    ranks: ["Trackman", "Switch Maintainer", "Lead Maintainer", "Track Supervisor", "Switch Authority Certified"],
    badges: [
      { id: "never-pinched", name: "Never Pinched", note: "Never once with a hand near the points while they moved", test: AWARD.safe },
      { id: "gap-true", name: "Gap True", note: "Every gauge reading near band centre", test: AWARD.precise(0.72) },
      { id: "lockout-clean", name: "Clean Lockout", note: "Lockout and restoration steps worked with no correction", test: AWARD.all(AWARD.stepClean("lock-switch"), AWARD.stepClean("restore-switch")) },
    ],
    challenges: [
      { id: "gang-time", name: "Gang Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-switch", name: "First Switch", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ten-clear", name: "Ten Clear", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "point-pinch": "You reached toward the points while the switch stand was mid-throw. A moving point rail closes against the stock rail with enough force to do exactly what it is built to do to a rail — it does not know the difference between that and a hand.",
    "switch-heater-energized": "You put a hand on the heater element before the lock actually went on the disconnect. A breaker switched off and a breaker locked off are two different guarantees, and the one that matters here is the one a thermostat controller cannot quietly undo.",
    "fouling-lead": "You are standing in the clearance point of the switch lead. A movement routed through this turnout swings through exactly this space, and a switch that reads correctly on the panel is not the same thing as a lead with nobody standing in it.",
    "stood-on-points": "You stepped directly onto the points instead of around them. A point rail is a moving part with a knife edge at the tip, and standing on one while it is out of service is one crew member's bad habit away from a very different day when it isn't.",
  },

  lateNotes: {
    "grease-gun": "The grease goes on the plates once the old grease and grit are actually cleared off, not over the top of them.",
    "debris-1": "Nothing gets logged clear until the walk is actually done.",
  },

  interrupts: [
    {
      id: "heater-reenergized",
      kind: "Thermostat controller resets the heater",
      after: "heater-breaker", delay: 4, seconds: 12,
      alert: "The heater's thermostat controller has cycled back on. The breaker is still off, but the element is warming again under your hand.",
      cue: "Your breaker did not do this. Something else did.",
      target: "lockout-tag",
      why: "A breaker switched off is a position, not a guarantee — a thermostat controller on its own timer has no idea a maintainer's hand is on the element, and it will cycle the circuit back exactly the way it is built to whenever the sensor says the rail is cold. The lock at the disconnect is the one thing between that controller and the element, because it is the only part of this circuit the controller cannot override on its own schedule.",
      missNote: "You kept working with the breaker off and no lock on the disconnect. The controller did exactly what it is built to do, on its own schedule, with no idea a hand was already on the element it was about to warm back up.",
      wrongNote: "Flipping the breaker again is not the fix — it was already off. The lock at the disconnect is what stops the controller from doing this on its own.",
    },
    {
      id: "throw-attempt",
      kind: "Someone else reaches for the switch",
      after: "clearance-dial", delay: 4, seconds: 11,
      alert: "The target indicator has started to move. Somebody else — a crew you have not talked to — is trying to throw this switch from the panel.",
      cue: "The points under your hands are about to move, and it isn't you moving them.",
      target: "radio-handset",
      why: "A switch locked out for maintenance is supposed to be unreachable from anywhere else, but a lock that has not actually been logged with the dispatcher is a lock somebody else has no reason to know is there. The radio is the fastest way to reach whoever is at that panel and stop the throw before the points move under a hand that is still on them.",
      missNote: "You kept working while the indicator kept moving. A switch stand does not check for a hand at the points before it throws, and the only thing that would have stopped this one in time was already in your other hand.",
      wrongNote: "That will not stop a throw commanded from somewhere else. The radio is what reaches whoever is at that panel.",
    },
  ],

  steps: [
    {
      id: "briefing", kind: "select", target: "job-order-board",
      title: "Attend the job briefing",
      cue: "Read the work order: which switch, which position it will be locked in, and what else moves through this lead.",
      why: "A hand-thrown switch taken out of service changes what the rest of the territory can safely assume about this lead, and the gang, the dispatcher and anyone else working nearby all need the same understanding of what is about to happen to it.",
    },
    {
      id: "lock-switch", kind: "sequence",
      targets: ["switch-lock", "lockout-tag"],
      itemNames: { "switch-lock": "lock the switch stand", "lockout-tag": "tag the switch out of service" },
      title: "Lock and tag the switch",
      cue: "Lock the switch stand in position first, then tag it out of service.",
      why: "A lock with no tag on it is a lock the next person to walk up has no way to identify — the tag is what turns a padlock into a record of who has this switch and why, and it goes on only after the lock is actually holding the points where the work needs them.",
      outOfOrderNote: "Wrong order — the lock goes on first. A tag with nothing actually holding the points is a label on a switch that can still be thrown.",
    },
    {
      id: "throw-test", kind: "turn", target: "switch-stand",
      title: "Throw the stand to normal and watch the points",
      cue: "Turn the switch stand to normal and watch where the points actually go.",
      why: "The target on a switch stand tells you what the handle did, not what the points did — the only way to know a point has actually seated is to watch the rail itself close against the stock rail, not the lever that is supposed to be moving it.",
      turn: { turns: 0.5, axis: "y", label: "SWITCH STAND" },
    },
    {
      id: "point-gauge", kind: "gauge", target: "points-gauge",
      title: "Measure the point gap",
      cue: "Set the feeler gauge against the closed point and commit the reading.",
      why: "A point that looks seated can still be standing open a few millimetres at the tip, and that gap is exactly wide enough for a wheel flange to pick the point instead of following it — the feeler gauge is what tells the difference between looks-closed and is-closed.",
      gauge: {
        label: "POINT GAP", speed: 0.68, green: [0.0, 0.18],
        readout: (t) => `${(t * 6).toFixed(1)} mm`,
        missNote: "Open wider than this switch's tolerance. Log the defect and adjust the point before moving on.",
      },
    },
    {
      id: "heater-breaker", kind: "hold", target: "heater-breaker", seconds: 5,
      title: "Lock out the switch heater",
      cue: "Hold the breaker off and confirm zero energy before touching the heater element.",
      why: "A switch heater is live enough to burn and wired to a controller that can bring it back on its own schedule, so the breaker being off is only the first half of proving it safe — the hold is what confirms the reading actually stays at zero rather than assuming the switch position tells the whole story.",
      holdBreakNote: "You let go before zero energy was actually confirmed. A breaker in the off position and a circuit proven dead are not the same fact.",
    },
    {
      id: "grease", kind: "drag", target: "grease-gun",
      title: "Grease the switch plates",
      cue: "Carry the grease gun to the switch plates and work it along the slide.",
      why: "Dry switch plates are what turn a light hand throw into a heavy one, and a heavy throw is exactly the kind of throw a spring or a hand-thrown lever eventually fails to complete — greasing the slide is cheap, and a point that won't fully seat because the plate is dry is not.",
      drag: { to: "lubrication-point", radius: 0.3, missNote: "Not on the plates — carry the gun the rest of the way to the switch slide." },
    },
    {
      id: "lock-inspect", kind: "select", target: "switch-lock",
      title: "Inspect the lock and keeper",
      cue: "Check the lock and the keeper it seats into for wear.",
      why: "A worn keeper lets a locked switch stand work loose under vibration from every train that passes over the adjacent main, and the failure is invisible from a passing inspection — it only shows up the day the lock is holding nothing at all.",
    },
    {
      id: "headblock-gauge", kind: "gauge", target: "headblock-gauge",
      title: "Check the headblock tie spacing",
      cue: "Set the gauge across the headblock ties and commit the reading.",
      why: "The headblock ties carry the switch rods and have to hold their own spacing independent of the running rail's gauge — a headblock that has shifted lets the connecting rods bind or come free exactly when the switch is thrown, which is the one moment this defect actually matters.",
      gauge: {
        label: "HEADBLOCK SPACING", speed: 0.66, green: [0.42, 0.62],
        readout: (t) => `${(1400 + t * 60).toFixed(0)} mm`,
        missNote: "Outside tolerance for this switch. Log the defect before continuing.",
      },
    },
    {
      id: "clearance-dial", kind: "track", target: "clearance-dial", seconds: 6,
      title: "Keep clear of the lead while you function-test",
      cue: "Hold the clearance reading in the green band while the switch is worked through both positions.",
      why: "A function test is the one part of this job that puts the points back in motion, and staying clear of the lead while it happens is what keeps a test of the switch from becoming a test of anyone standing in it.",
      track: { label: "CLEARANCE", green: [0.4, 0.66], rise: 0.48, fall: 0.4, drift: 0.12, readout: (v) => `${Math.round(v * 100)}%` },
      holdBreakNote: "Clearance dropped out of band during the function test. A lead with someone standing in it is not a clear lead, whatever the panel says.",
    },
    {
      id: "throw-confirm", kind: "turn", target: "switch-stand",
      title: "Throw the stand to reverse and watch the points seat",
      cue: "Turn the switch stand to reverse and confirm the points close tight against the stock rail.",
      why: "Both positions get proved, not just the one the switch happened to be left in — a point that seats clean to normal and hangs open a hair to reverse is a defect a single-direction test would never have found.",
      turn: { turns: 0.5, axis: "y", reverse: true, label: "SWITCH STAND" },
    },
    {
      id: "target-check", kind: "select", target: "target-indicator",
      title: "Check the target indicator",
      cue: "Confirm the target reads the same position the points are actually standing in.",
      why: "The target is the one thing a crew approaching this switch can actually see from a distance, and a target that disagrees with the points is worse than no target at all — it tells an approaching crew something that isn't true.",
    },
    {
      id: "debris-walk", kind: "find", noHint: true,
      targets: ["debris-1", "debris-2"],
      itemNames: { "debris-1": "ballast wedged in the point flangeway", "debris-2": "rag left on the switch stand" },
      itemNotes: {
        "debris-1": "A stone in the flangeway is exactly what stops a point from closing the last few millimetres a gauge would otherwise pass.",
        "debris-2": "A rag on a switch stand catches in the connecting rod the first time somebody throws it without looking.",
      },
      title: "Clear debris from the switch",
      cue: "Scan the points and the stand for anything left in the way.",
      why: "A switch that measures correctly today can still fail tomorrow on a stone or a rag nobody noticed, because the gauge only reads what is in the flangeway at the moment it is tested — the walk is what catches what the gauge cannot.",
    },
    {
      id: "restore-switch", kind: "select", target: "lockout-tag",
      title: "Remove the lock and tag",
      cue: "Remove your tag and lock now that the switch is back in working order.",
      why: "The switch is not back in service until your own lock and tag are actually off it — leaving a personal lock on a switch that is done being worked on blocks it from everyone else exactly as effectively as leaving a real defect in place.",
    },
    {
      id: "radio-report", kind: "hold", target: "radio-handset", seconds: 4,
      title: "Report the switch back in service",
      cue: "Call the dispatcher and hold the radio for the read-back confirming the switch is clear.",
      why: "The dispatcher's own record of this switch's position is what a train crew relies on when they cannot see it themselves, and that record does not update until you have said so and had it read back to you.",
      holdBreakNote: "You let go before the read-back came back. The dispatcher's record does not change until they have said so in your own hearing.",
    },
    {
      id: "close-log", kind: "select", target: "closing-log",
      title: "Close the maintenance log",
      cue: "Log the point gap, the headblock reading and any defect flagged today.",
      why: "The next scheduled inspection only knows what this entry tells it — the readings taken today are the baseline the next maintainer compares theirs against, and a gap that is widening slowly is only visible across two logged readings, never one.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, RA_SWL_ACCENT);

    // ------------------------------------------------------------- textures
    const ballastTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#5a564c"); grad.addColorStop(1, "#3e3b33");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const x = (i * 47.3) % w, y = (i * 97.1) % h, r = 1.4 + ((i * 11) % 5) * 0.5;
        cx.fillStyle = i % 4 === 0 ? "rgba(150,140,122,0.55)" : "rgba(30,26,20,0.45)";
        cx.beginPath(); cx.ellipse(x, y, r, r * 0.7, (i % 6) * 0.5, 0, 7); cx.fill();
      }
    }, { repeat: 6 });
    const ballastMat = texturedMat(ballastTex, { rough: 0.96, color: 0x8f887a });

    const tieTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#3a2c20"); grad.addColorStop(0.5, "#2c2117"); grad.addColorStop(1, "#382a1e");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "rgba(0,0,0,0.35)"; cx.lineWidth = 2;
      for (let i = 0; i < 10; i++) { cx.beginPath(); cx.moveTo(0, (i / 10) * h + 4); cx.bezierCurveTo(w * 0.3, (i / 10) * h - 3, w * 0.7, (i / 10) * h + 6, w, (i / 10) * h); cx.stroke(); }
    }, { repeat: 1 });
    const tieMat = texturedMat(tieTex, { rough: 0.9, color: 0x8a7a68 });

    const railTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#c7ccd1"); grad.addColorStop(0.5, "#8a9096"); grad.addColorStop(1, "#5b6167");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "rgba(120,70,40,0.18)";
      for (let i = 0; i < 30; i++) cx.fillRect((i * 37) % w, 0, 2, h);
    }, { repeat: 3 });
    const railMat = texturedMat(railTex, { rough: 0.32, metal: 0.75, color: 0xaab0b6 });

    const platformTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#585440", base2: "#4a4735", seam: "rgba(0,0,0,0.5)",
    }), { repeat: 3 });
    const platformMat = texturedMat(platformTex, { rough: 0.9, color: 0xc9bb86 });

    // ------------------------------------------------------------- the turnout
    // Main rails through, with a diverging pair of points into the siding.
    for (const sx of [-1, 1]) {
      const rail = box(g, 5.2, 0.1, 0.06, 0, 0.21, sx * 0.36, 0xaab0b6, { rough: 0.32, metal: 0.75 });
      rail.material = railMat;
    }
    const ballast = box(g, 5.2, 0.16, 2.2, 0, 0.08, 0, 0x8f887a, { rough: 0.98 });
    ballast.material = ballastMat;
    for (let i = -9; i <= 9; i++) {
      const tie = box(g, 0.16, 0.06, 1.4, i * 0.28, 0.11, 0, 0x8a7a68, { rough: 0.9 });
      tie.material = tieMat;
    }
    // Diverging siding rail.
    const siding = group(g, 0.6, 0, 0);
    for (const sx of [-1, 1]) {
      const r = box(siding, 3.4, 0.1, 0.06, 1.4, 0.21, sx * 0.36 - 0.75, 0xaab0b6, { rough: 0.32, metal: 0.75 });
      r.rotation.y = 0.14;
      r.material = railMat;
    }

    // The points themselves — two short rails that pivot at the heel.
    const pointL = box(g, 1.1, 0.09, 0.05, -0.85, 0.21, -0.36, 0xc7ccd1, { rough: 0.3, metal: 0.75 });
    const pointR = box(g, 1.1, 0.09, 0.05, -0.85, 0.21, 0.36, 0xc7ccd1, { rough: 0.3, metal: 0.75 });
    reg(hits, box(g, 1.4, 0.3, 1.0, -0.85, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "stood-on-points");
    reg(hits, box(g, 0.3, 0.3, 0.5, -0.25, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "point-pinch");

    // Fouling zone across the diverging lead.
    reg(hits, box(g, 3.4, 1.6, 1.4, 2.3, 0.8, -0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "fouling-lead");

    // ------------------------------------------------------------- switch stand
    const standBase = group(g, -1.6, 0, 0, 0);
    box(standBase, 0.42, 0.1, 0.34, 0, 0.05, 0, 0x3a4048, { rough: 0.9, metal: 0.3 });
    cyl(standBase, 0.045, 0.055, 0.78, 0, 0.44, 0, 0x6b7279, { rough: 0.6, metal: 0.5, seg: 10 });
    const switchLever = group(standBase, 0, 0.84, 0);
    box(switchLever, 0.12, 0.09, 0.42, 0, 0, 0.19, RA_SWL_ACCENT, { rough: 0.55, finish: "painted" });
    const targetIndicator = decal(switchLever, 0.24, 0.2, 0, 0.2, 0,
      signFace("NORMAL", { bg: "#1b2026", accent: RA_SWL_CSS, fg: "#ffe8a8", scale: 0.4 }), { px: 192, glow: true, ei: 0.6 });
    holoTag(standBase, "Switch stand", 0, 1.22, 0, { css: RA_SWL_CSS, w: 0.28 });
    reg(hits, switchLever, "switch-stand");
    reg(hits, targetIndicator, "target-indicator");
    const remoteWarnLamp = ball(standBase, 0.03, 0.2, 0.95, -0.1, 0x59636d, { emissive: 0x59636d, ei: 0.2 });
    remoteWarnLamp.visible = false;

    // Lock and tag on a chain at the stand.
    const lockGroup = group(standBase, 0.2, 0.5, 0.1, 0.3);
    box(lockGroup, 0.06, 0.08, 0.02, 0, 0, 0, 0xf2c14b, { rough: 0.5, metal: 0.6 });
    holoTag(lockGroup, "Switch lock", 0, 0.14, 0, { css: RA_SWL_CSS, w: 0.28 });
    reg(hits, lockGroup, "switch-lock");
    const tagGroup = group(standBase, -0.2, 0.5, 0.1, -0.3);
    box(tagGroup, 0.07, 0.1, 0.005, 0, 0, 0, 0xf0645b, { rough: 0.7 });
    tagGroup.visible = false;
    holoTag(tagGroup, "Out-of-service tag", 0, 0.15, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, tagGroup, "lockout-tag");

    // Joint bars either side of the headblock, bolted down.
    for (const sx of [-1, 1]) {
      const bar = box(g, 0.3, 0.08, 0.03, -0.4, 0.19, sx * 0.36, 0x50575e, { rough: 0.55, metal: 0.5 });
      for (let i = 0; i < 3; i++) {
        cyl(bar, 0.012, 0.012, 0.06, -0.1 + i * 0.1, 0, 0, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.x = Math.PI / 2;
      }
    }

    // ------------------------------------------------------------- headblock & gauge tools
    const headblock = group(g, -0.4, 0.13, 0);
    box(headblock, 0.16, 0.06, 1.6, 0, 0, 0, 0x352c22, { rough: 0.95 });
    for (let i = 0; i < 6; i++) {
      cyl(headblock, 0.014, 0.014, 0.05, 0, 0.05, -0.7 + i * 0.28, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 8 });
    }
    reg(hits, headblock, "headblock-gauge");

    const pointsGaugeTool = group(g, -0.85, 0, -0.5, -0.3);
    box(pointsGaugeTool, 0.16, 0.02, 0.02, 0, 0.22, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(pointsGaugeTool, "Feeler gauge", 0, 0.32, 0, { css: RA_SWL_CSS, w: 0.26 });
    reg(hits, pointsGaugeTool, "points-gauge");

    const clearanceDial = instrument(g, 0.4, 0.86, -1.5, { ry: 0.3, idle: "CLEAR", color: RA_SWL_ACCENT });
    holoTag(clearanceDial, "Lead clearance", 0, 0.15, 0, { css: RA_SWL_CSS, w: 0.3 });
    reg(hits, clearanceDial, "clearance-dial");

    // ------------------------------------------------------------- heater cabinet
    const heaterCab = group(g, -2.1, 0, -1.3, -0.4);
    box(heaterCab, 0.4, 0.5, 0.3, 0, 0.25, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    const heaterDoor = box(heaterCab, 0.36, 0.44, 0.02, 0, 0.25, 0.15, 0x3a4048, { rough: 0.65, metal: 0.3 });
    const breakerHandle = box(heaterCab, 0.05, 0.1, 0.03, 0, 0.4, 0.17, 0xf2c14b, { rough: 0.5, metal: 0.5 });
    holoTag(heaterCab, "Heater breaker", 0, 0.55, 0, { css: RA_SWL_CSS, w: 0.3 });
    reg(hits, breakerHandle, "heater-breaker");
    const heaterElement = box(g, 0.5, 0.03, 0.08, -0.85, 0.08, -0.55, 0xf0645b, { rough: 0.6, metal: 0.4 });
    reg(hits, heaterElement, "switch-heater-energized");

    // ------------------------------------------------------------- grease, lock inspect, debris
    const greaseCart = group(g, -2.3, 0, 0.9, 0.3);
    box(greaseCart, 0.3, 0.4, 0.3, 0, 0.2, 0, 0x3a4048, { rough: 0.7, metal: 0.3 });
    const greaseGun = group(greaseCart, 0, 0.42, 0);
    cyl(greaseGun, 0.03, 0.03, 0.28, 0, 0.14, 0, 0x50575e, { rough: 0.5, metal: 0.5, seg: 10 });
    holoTag(greaseCart, "Grease gun", 0, 0.55, 0, { css: RA_SWL_CSS, w: 0.26 });
    reg(hits, greaseGun, "grease-gun");
    hits["lubrication-point"] = box(g, 0.3, 0.2, 1.0, -1.0, 0.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });

    const debris1 = group(g, -0.5, 0.15, -0.36, 0.4);
    cyl(debris1, 0.02, 0.03, 0.03, 0, 0, 0, 0x716c62, { rough: 0.9, seg: 6 });
    reg(hits, debris1, "debris-1");
    const debris2 = group(g, -1.55, 0.86, 0.12);
    box(debris2, 0.1, 0.02, 0.06, 0, 0, 0, 0xb0453f, { rough: 0.85 });
    reg(hits, debris2, "debris-2");

    // ------------------------------------------------------------- briefing, radio, crew
    const briefingBoard = holoPanel(g, 0.6, 0.42, -2.6, 1.55, 1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_SWL_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#d8cf9c";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("JOB ORDER · SWITCH 12", w * 0.06, h * 0.14);
      cx.fillStyle = "#f6f1de";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("INSPECT & LUBRICATE", w * 0.06, h * 0.32);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = "#d6cd9e";
      ["Lock and tag before any hand near the points", "Point gap tolerance: per the standard", "Heater proven dead before touched"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.5 + i * 0.12)));
    }, { ry: 0.6, accent: RA_SWL_ACCENT });
    reg(hits, briefingBoard, "job-order-board");

    const radio = group(g, -2.3, 0, 1.7, -0.3);
    slab(radio, 0.5, 0.16, 0.16, 0, 0.85, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const radioScreen = decal(radio, 0.4, 0.1, 0, 0.87, 0.09,
      signFace("STANDBY", { bg: "#0d1c24", accent: RA_SWL_CSS, fg: "#ffe8a8", scale: 0.5 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(radio, "Dispatcher line", 0, 1.05, 0.08, { css: RA_SWL_CSS, w: 0.32 });
    reg(hits, radio, "radio-handset");

    const maintainer = standingFigure(g, 2.0, -1.4, { ry: 2.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    const secondMaintainer = standingFigure(g, -3.4, 1.4, { ry: -1.0, cloth: 0x2b3138, vest: 0xf2894b, helmet: 0xf2f2f2 });

    // Conduit run from the heater cabinet to the element.
    for (let i = 0; i < 3; i++) {
      cyl(g, 0.02, 0.02, 0.3, -1.7 - i * 0.3, 0.06, -1.1, 0x3a4048, { rough: 0.6, metal: 0.4, seg: 8 }).rotation.z = Math.PI / 2;
    }

    // Spare parts crate and a hand cart, decorative site dressing.
    const crate = group(g, 2.9, 0, -1.9, 0.3);
    box(crate, 0.4, 0.3, 0.3, 0, 0.15, 0, 0x8a6a3a, { rough: 0.85 });
    for (let i = 0; i < 2; i++) box(crate, 0.4, 0.02, 0.02, 0, 0.05 + i * 0.2, 0.15, 0x5a4525, { rough: 0.8 });
    reg(hits, crate, "spare-parts-crate");

    const cart = group(g, 3.1, 0, 0.3, -0.5);
    box(cart, 0.5, 0.05, 0.3, 0, 0.35, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(cart, 0.06, 0.06, 0.03, sx * 0.2, 0.06, sz * 0.12, 0x22262b, { rough: 0.7, seg: 12 }).rotation.x = Math.PI / 2;
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      box(cart, 0.02, 0.3, 0.02, sx * 0.2, 0.2, sz * 0.12, 0x50575e, { rough: 0.5, metal: 0.5 });
    }
    reg(hits, cart, "hand-cart");

    const closeLog = group(g, -2.6, 0, 2.2, -0.4);
    slab(closeLog, 0.4, 0.05, 0.3, 0, 0.86, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const closeScreen = decal(closeLog, 0.32, 0.16, 0, 0.89, 0.0, signFace("OPEN", { bg: "#0d1c24", accent: RA_SWL_CSS, fg: "#ffe8a8", scale: 0.4 }), { glow: true, ei: 0.8, px: 220 });
    closeScreen.rotation.x = -Math.PI / 2;
    holoTag(closeLog, "Maintenance log", 0, 1.0, 0, { css: RA_SWL_CSS, w: 0.32 });
    reg(hits, closeLog, "closing-log");

    // Crew platform.
    const platform = box(g, 1.4, 0.1, 1.0, -2.3, 0.05, 1.1, 0xc9bb86, { rough: 0.9 });
    platform.material = platformMat;

    cone(g, -2.5, 1.0, { color: RA_SWL_ACCENT });
    cone(g, 2.5, 1.0, { color: RA_SWL_ACCENT });

    return {
      hits,
      footprint: 2.2,

      onInterrupt(it) {
        if (it.id === "heater-reenergized") heaterElement.material = mat(0xff8a3d, { emissive: 0xff8a3d, ei: 1.6 });
        if (it.id === "throw-attempt") {
          remoteWarnLamp.visible = true;
          remoteWarnLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2 });
          repaint(targetIndicator, signFace("MOVING", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.4 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "heater-reenergized") heaterElement.material = mat(0xf0645b, { rough: 0.6, metal: 0.4 });
        if (it.id === "throw-attempt") {
          remoteWarnLamp.visible = false;
          repaint(targetIndicator, signFace("NORMAL", { bg: "#1b2026", accent: RA_SWL_CSS, fg: "#ffe8a8", scale: 0.4 }));
        }
      },

      onStepComplete(step) {
        if (step.id === "lock-switch") tagGroup.visible = true;
        if (step.id === "throw-test") { pointL.position.z = -0.36; pointR.position.z = 0.36; }
        if (step.id === "heater-breaker") breakerHandle.material = mat(0x59c97b, { rough: 0.5, metal: 0.5 });
        if (step.id === "grease") { /* visual: darken plate */ }
        if (step.id === "throw-confirm") { pointL.position.z = -0.1; pointR.position.z = 0.62; repaint(targetIndicator, signFace("REVERSE", { bg: "#1b2026", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 })); }
        if (step.id === "debris-walk") { debris1.visible = false; debris2.visible = false; }
        if (step.id === "restore-switch") tagGroup.visible = false;
        if (step.id === "radio-report") repaint(radioScreen, signFace("SWITCH\nIN SERVICE", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        if (step.id === "close-log") repaint(closeScreen, signFace("CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
      },

      animate(t, dt, session) {
        maintainer.userData.head.rotation.y = Math.sin(t * 0.6) * 0.5;
        secondMaintainer.userData.head.rotation.y = Math.sin(t * 0.45 + 0.8) * 0.4;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "point-gauge") {
            pointsGaugeTool.userData; // no-op, readout is on the panel
          }
        }
        const tr = session?.track;
        if (tr && session.step?.id === "clearance-dial") clearanceDial.userData.show?.(`${Math.round(tr.v * 100)}%`);
      },
    };
  },
};
