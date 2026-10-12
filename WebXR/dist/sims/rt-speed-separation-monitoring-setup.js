import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  tileFace, paintedSteelFace, gratingFace, equipmentCabinet, reg,
} from "../citykit.js";
import { cobotBench } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Setting Up Speed-and-Separation Monitoring — its own gamified system: Measured Distance.
//
// ROBOTRAIN (docs/consoles/ROBOTRAIN.md): the last ROBOPROG gap station. A robot integrator sets up an area scanner's warning
// and protective fields around a cobot cell so that the arm slows when a person approaches and stops before they can reach it:
// the reach marked on the floor, the fields sized from the stopping-distance the risk assessment worked out (never a figure the
// station states), the scanner's shadow found behind a cabinet, muting confirmed off, the fields walked with a test piece, the
// stop measured, and the configuration committed with a checksum. ISO/TS 15066 and ISO 10218-2 are named; no clause or
// distance is quoted. ?fault=reflector-shadow puts the blind spot behind a reflective sign instead of the cabinet.

const RTSS_ACCENT = 0x9b7fe0;

export const SIM_RT_SPEED_SEPARATION_MONITORING_SETUP = {
  id: "rt-speed-separation-monitoring-setup",
  index: "rt-4",
  domain: "Robotics",
  trade: "Robot integrator, area-scanner fields for a shared cobot cell — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-training-centre",
  weather: "overcast",
  certification: "UAW and IAM skilled-trades training as bodies; ISO/TS 15066 for collaborative robot applications (speed and separation monitoring) and ISO 10218 with ANSI R15.06 for the robot system and its integration; OSHA 29 CFR 1910.212 general requirements for machines and 29 CFR 1910.132 personal protective equipment; the cell's written risk assessment, the scanner manufacturer's manual and the robot manufacturer's manual",
  name: "Setting Up Speed-and-Separation Monitoring",
  title: simTitle("Setting Up Speed-and-Separation Monitoring"),
  tagline: "Configuring the area scanner around a shared cobot cell: the arm's reach marked on the floor, the protective field sized from the stopping distance the risk assessment worked out, the warning field outside it, the scanner's blind spot found behind a cabinet, muting confirmed off, every field walked with a test piece, the stop measured, and the configuration committed under its checksum",
  accent: RTSS_ACCENT,
  accentCss: "#9b7fe0",
  parSeconds: 340,
  footprint: 2.9,
  badge: { id: "measured-distance", name: "Measured Distance", note: "Sized the fields from the stopping distance, found the shadow and walked every field before committing" },

  game: system({
    name: "Measured Distance",
    currency: "SP",
    ranks: ["Observer", "Field Setter", "Field Walker", "Integrator", "Measured Distance Lead"],
    badges: [
      { id: "reach-first", name: "Reach First", note: "Marked the arm's reach before sizing a field", test: AWARD.stepClean("reach-mark") },
      { id: "shadow-found", name: "Shadow Found", note: "Found the scanner's blind spot before the walk test", test: AWARD.stepClean("find-shadow") },
      { id: "steady-walk", name: "Steady Walk", note: "Held the approach speed inside the test band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-fields", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-fields", name: "Clean Set-up", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UAW or IAM local's training coordinator, or the employee assistance line, if a close call with a robot that did not stop is still with you",

  faults: [{ id: "reflector-shadow", label: "Scanner shadow: CHECK", step: "find-shadow", target: "reflective-sign", note: "Today the blind spot is behind the reflective sign leaning on the fence, not the cabinet. Find where the scanner cannot see.", from: "shadow-cabinet", cue: "Find where the scanner cannot see a person approaching." }],

  hazards: {
    "default-field-hazard": "That loads the scanner's factory default fields and calls them good. The protective field is sized from this arm's stopping distance at this speed with this payload, worked out in the risk assessment; a default is a shape that fits no cell in particular.",
    "shrink-field-hazard": "That shrinks the protective field so the operator can stand closer to the bench and work faster. A smaller field means the arm gets less distance to stop in, and the stopping distance did not change because the operator wanted to be closer.",
    "mute-on-hazard": "That leaves muting enabled from the commissioning run so parts carts stop tripping the field. Muting is the scanner choosing to ignore an intrusion; a field that ignores carts also ignores the person pushing one.",
    "skip-walk-hazard": "That commits the configuration from the screen without walking the fields. The screen shows the fields the scanner thinks it has; a person with a test piece shows the fields it actually has, including the shadow the screen cannot draw.",
  },

  lateNotes: {
    "ssm-sheet": "The stopping distance and the approach speed the risk assessment used are read before any field is drawn; the fields are their consequence, not a judgement by eye.",
    "muting-switch": "Muting is confirmed off, with the indicator read, before the walk test; a muted field passes every walk test and protects nobody.",
  },

  interrupts: [
    { id: "cart-shadow", kind: "Person in shadow", after: "walk-hold", delay: 3, seconds: 11, alert: "A coworker pushing a parts cart has walked into the scanner's shadow behind the cabinet, heading for the bench.", cue: "Press the cell e-stop now.", target: "cell-estop", why: "A person in the shadow is a person the scanner cannot slow the arm for, and the walk test is running with the arm live; the e-stop stops the arm the way the protective field should have, and the shadow is dealt with by moving the cabinet or adding a scanner, with the arm stopped.", missNote: "You kept the walk test running with someone in the scanner's shadow. A person where the scanner cannot see is answered with the cell e-stop.", wrongNote: "Not that — a person in the shadow is answered with the cell e-stop." },
    { id: "late-stop", kind: "Stop too late", after: "stop-track", delay: 3, seconds: 11, alert: "The stop-distance readout has gone red: the arm came to rest inside the mark where it should already have been stopped.", cue: "Increase the protective field.", target: "protective-dial", why: "A stop that lands inside the mark means the field is too small for this arm's stopping distance at this speed, and the honest correction is a bigger field or a slower arm, never a mark moved to where the arm happened to stop; the field is increased, the test rerun, and both results recorded.", missNote: "The arm kept stopping inside the mark and the test went on. A late stop is answered by increasing the protective field and measuring again.", wrongNote: "Not that — a late stop is answered at the protective-field setting." },
  ],

  steps: [
    { id: "ssm-read", kind: "select", target: "ssm-sheet", title: "Read the stopping distance and approach speed", cue: "Read the risk assessment's stopping distance for this arm and the approach speed it assumed for a person.", why: "Speed and separation monitoring works only if the protective field is at least as deep as the distance the arm needs to stop plus the distance a person covers while it does, and both of those were worked out in the risk assessment for this arm, this speed and this payload; the fields are drawn from that sheet, and an integrator who draws them by eye is drawing a hope." },
    { id: "ppe-ssm", kind: "sequence", anyOrder: true, targets: ["glasses-ssm", "vest-ssm", "shoes-ssm"], itemNames: { "glasses-ssm": "safety glasses", "vest-ssm": "high-visibility vest", "shoes-ssm": "safety shoes" }, title: "Dress for the walk tests", cue: "Safety glasses, a high-visibility vest and safety shoes.", why: "A field walk is a person deliberately approaching a live arm, over and over, in a bay with carts and cable trays; the vest is for the coworkers driving those carts, the shoes for the tray edges, and the glasses because the arm is cycling a part while you walk at it." },
    { id: "reach-mark", kind: "drag", target: "reach-marker", drag: { to: "reach-spot", radius: 0.4, missNote: "Not placed — the reach mark goes at the farthest point the tool can swing to, not where the bench ends." }, title: "Mark the arm's reach on the floor", cue: "Place the reach mark at the farthest point the tool can swing to with its longest tool fitted.", why: "Every field is measured outward from where the arm can actually hurt someone, which is the tool's farthest sweep with the longest tool fitted, not the edge of the bench the arm is bolted to; marking it on the floor turns a number in a manual into a line the fields can be sized from and walked against." },
    { id: "protective-set", kind: "gauge", target: "protective-dial", title: "Set the protective field", cue: "Set the protective field so it reaches at least the stopping distance plus the approach allowance beyond the reach mark.", why: "The protective field is the stop: when it is broken, the arm must come to rest before the person reaches the mark, and the only way that happens is if the field is as deep as the stopping distance plus the ground a person covers while the arm stops; a field set from the sheet is a stop that arrives in time, and the readback confirms the scanner took the depth.", gauge: { label: "PROTECT", speed: 0.6, green: [0.56, 0.74], readout: (t) => (t < 0.56 ? "shallower than the sheet" : t > 0.74 ? "deeper than the bay" : "matches the sheet"), missNote: "The protective field does not match the sheet. A shallower field is a stop that arrives late." } },
    { id: "warning-set", kind: "gauge", target: "warning-dial", title: "Set the warning field outside it", cue: "Set the warning field outside the protective field so the arm slows before it has to stop.", why: "The warning field is the slow-down: a person entering it brings the arm to its reduced speed, which shortens the stopping distance before the protective field is ever touched, and it has to sit wholly outside the protective field or the arm is asked to slow and stop in the same instant; the gap between the two is the margin the cell actually runs on.", gauge: { label: "WARN", speed: 0.6, green: [0.6, 0.8], readout: (t) => (t < 0.6 ? "inside protective" : t > 0.8 ? "past the walkway" : "outside protective"), missNote: "The warning field is not outside the protective field. Set it wider before the walk." } },
    { id: "muting-off", kind: "select", target: "muting-switch", title: "Confirm muting is off", cue: "Check the muting switch and its indicator: off, before any test.", why: "Muting tells the scanner to ignore an intrusion for a while, and a scanner left muted from commissioning passes every walk test while protecting nobody; the switch and the indicator are both read because a switch can be off while a configuration still mutes a field on a timer." },
    { id: "find-shadow", kind: "find", noHint: true, targets: ["shadow-cabinet"], target: "shadow-cabinet", itemNames: { "shadow-cabinet": "the cabinet casting a scanner shadow toward the bench" }, itemNotes: { "shadow-cabinet": "Behind the cabinet the scanner sees nothing: the cabinet moves, a second scanner is added or the approach is fenced before the fields are trusted." }, decoyNotes: { "reflective-sign": "The reflective sign faces away from the scanner and casts no shadow on an approach path. Nothing to move there today.", "cable-tray": "The cable tray is below the scanner's plane and does not block it. It stays." }, title: "Find where the scanner cannot see", cue: "Find where the scanner cannot see a person approaching.", why: "A scanner sees in straight lines from one point on the bench front, and anything solid between it and the floor it is meant to watch casts a shadow where a person can walk right up to the arm unseen; the shadow is found by eye and by walking, because the configuration screen draws the fields the scanner wants, not the ones the room allows." },
    { id: "estop-ssm", kind: "select", target: "cell-estop", title: "Prove the cell e-stop", cue: "Press the cell e-stop once, watch the arm hold, and reset it before the walk tests start.", why: "The walk tests send a person toward a live arm on purpose to see whether the fields stop it, and the e-stop is what ends a test where they do not; it is pressed once before the first walk so the integrator knows that today's circuit stops this arm, not because the screen says so." },
    { id: "walk-hold", kind: "hold", target: "test-piece", seconds: 5, title: "Walk the warning field with the test piece", cue: "Carry the test piece into the warning field at the sheet's approach speed and hold while the arm slows.", why: "The test piece is the size of a leg so the scanner sees what it will have to see, and the walk is at the approach speed the sheet assumed, because a slower walk flatters the field; holding inside the warning field until the arm settles at reduced speed is how the warning field is proved as a slow-down rather than a line on a screen.", holdBreakNote: "Stepped out before the arm settled at reduced speed. Walk the warning field again at the sheet's speed." },
    { id: "stop-track", kind: "track", target: "stop-readout", seconds: 8, title: "Measure where the arm stops", cue: "Walk into the protective field and watch the stop-distance readout stay outside the reach mark.", why: "The protective field is proved by where the arm comes to rest when a person walks into it, and the readout compares that to the mark on the floor; an arm that stops outside the mark every time is a field sized right, and one that lands inside it even once is a field or a speed that has to change before anyone shares the bench.", track: { start: 0.5, green: [0.4, 0.64], rise: 0.4, fall: 0.45, drift: 0.13, label: "STOP", readout: (v) => (v < 0.4 ? "early" : v > 0.64 ? "inside mark" : "outside mark") }, holdBreakNote: "The arm stopped inside the mark. Increase the field or lower the speed, then measure again." },
    { id: "approach-order", kind: "sequence", anyOrder: false, targets: ["walk-front", "walk-side", "walk-shadow-side"], itemNames: { "walk-front": "approach from the front", "walk-side": "approach from the open side", "walk-shadow-side": "approach from the side the shadow was on" }, outOfOrderNote: "Out of order — front first, then the open side, then the side the shadow was on.", title: "Walk every approach", cue: "Repeat the walk from the front, the open side and the side the shadow was on.", why: "A field proved from one direction is proved for one direction; people come at a bench from wherever their work takes them, and the approach that was in shadow a minute ago is the one most worth walking now that the cabinet has moved." },
    { id: "commit-config", kind: "select", target: "commit-key", title: "Commit the configuration under its checksum", cue: "Commit the field configuration and read back its checksum on the screen.", why: "The scanner's configuration is what will protect the next shift, and a checksum is how anyone later can tell whether the fields running are the fields that were walked; committing without reading it back leaves a configuration that may be the one tested, or the one before it." },
    { id: "record-ssm", kind: "sequence", anyOrder: false, targets: ["record-fields", "record-walks", "record-sign"], itemNames: { "record-fields": "field depths and the checksum", "record-walks": "each walk and where the arm stopped", "record-sign": "signature and date" }, outOfOrderNote: "Out of order — the fields and checksum, then the walks as measured, then sign and date.", title: "Record the set-up", cue: "Write the field depths and checksum, every walk with where the arm stopped, then sign and date.", why: "The record is read when the cell changes or someone is hurt: the fields and the checksum that identifies them, every walk including the one that stopped inside the mark before the field grew, and who stood here; it is what turns a configuration into a safeguard someone can audit." },
  ],

  build(root) {
    const ACC = RTSS_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floor = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xcfd4d8, grout: "#878f95" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wall = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.6 });
    wall.material = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#4f5a66", base2: "#44505b" }), { repeat: 3, px: 512 }), { rough: 0.6, metal: 0.3, color: 0xffffff });
    const deck = box(g, 1.4, 0.03, 0.8, -3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "scanner set-up bay — procedural, generic cobot", -3.6, 3.7, -7.05, { css: "#9b7fe0", w: 0.64 });
    const rig = cobotBench(g, 0, 0, -3.6, { colour: 0x9b7fe0 });
    const P = rig.userData.parts ?? {};
    // the fields drawn on the floor (resized as they are set), the scanner's fan, the configuration laptop
    const warnField = box(g, 3.4, 0.004, 2.6, 0, 0.126, -3.4, 0xf0b323, { rough: 0.7, opacity: 0.16, transparent: true, cast: false });
    const protField = box(g, 2.4, 0.004, 1.7, 0, 0.13, -3.5, 0xd2312b, { rough: 0.7, opacity: 0.18, transparent: true, cast: false });
    const fan = box(g, 2.6, 0.004, 1.3, 0, 0.134, -2.5, 0x9b7fe0, { rough: 0.7, opacity: 0.12, transparent: true, cast: false });
    const laptop = group(g, -2.6, 0.84, -2.4);
    box(laptop, 1.1, 0.06, 0.6, 0, -0.02, 0, 0x3b4148, { rough: 0.6 }); for (const sx of [-0.5, 0.5]) for (const sz of [-0.25, 0.25]) box(laptop, 0.04, 0.8, 0.04, sx, -0.42, sz, 0x2b2f34, { rough: 0.6 });
    box(laptop, 0.34, 0.02, 0.24, 0, 0.02, 0, 0x1d2329, { rough: 0.5 }); const screen = box(laptop, 0.34, 0.22, 0.015, 0, 0.14, -0.12, 0x1d2329, { rough: 0.3, emissive: 0x201838, ei: 0.5 }); screen.rotation.x = -0.25;
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#9b7fe0", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("ssm-sheet", "risk assessment: stopping distance", -1.68, 1.47, "box", 0xd8a63a);
    put("glasses-ssm", "safety glasses", -2.09, 0.9, "box", 0x2b2f34);
    put("vest-ssm", "high-visibility vest", -2.25, 0.24, "ball", 0xf0b323);
    put("shoes-ssm", "safety shoes", -2.13, -0.42, "cyl", 0x3a3a3a);
    put("protective-dial", "protective field", -1.74, -1.01, "meter");
    put("warning-dial", "warning field", -1.14, -1.45, "meter");
    put("muting-switch", "muting: off", -0.4, -1.68, "box", 0x59c97b);
    put("cell-estop", "cell e-stop", 0.4, -1.68, "cyl", 0xd2312b);
    put("stop-readout", "stop distance", 1.14, -1.45, "meter");
    put("walk-front", "walk: front", 1.74, -1.01, "ball", 0x59c97b);
    put("walk-side", "walk: open side", 2.13, -0.42, "ball", 0x3a78c9);
    put("walk-shadow-side", "walk: shadow side", 2.25, 0.24, "ball", 0x9b7fe0);
    put("commit-key", "commit + checksum", 2.09, 0.9, "box", 0x2f6fb0);
    put("record-fields", "fields + checksum", 1.68, 1.47, "box", 0x59c97b);
    put("record-walks", "walks as measured", 2.9, 1.9, "box", 0xf0b323);
    put("record-sign", "sign and date", 3.3, 1.2, "cyl", 0x59637a);
    // the test piece (hold) and the reach marker (drag) with its spot
    cap["test-piece"] = cyl(g, 0.04, 0.04, 0.7, -2.9, 1.3, 1.9, 0x2b2f34, { rough: 0.6, seg: 10 }); post(-2.9, 1.9, 0.95);
    holoTag(g, "test piece (leg-sized)", -2.9, 1.78, 1.9, { css: "#9b7fe0", w: 0.4 }); reg(hits, cap["test-piece"], "test-piece");
    cap["reach-marker"] = cyl(g, 0.16, 0.16, 0.02, -3.3, 0.96, 1.2, 0x9b7fe0, { rough: 0.6, emissive: 0x9b7fe0, ei: 0.3 }); post(-3.3, 1.2, 0.95);
    reg(hits, cap["reach-marker"], "reach-marker");
    cap["reach-spot"] = group(g, 0, 0.14, -2.35);
    box(cap["reach-spot"], 0.4, 0.01, 0.4, 0, 0, 0, 0x2b2f34, { rough: 0.6, cast: false }); box(cap["reach-spot"], 0.3, 0.012, 0.3, 0, 0.004, 0, ACC, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "farthest tool sweep", 0, 1.4, -2.35, { css: "#9b7fe0", w: 0.36 }); reg(hits, cap["reach-spot"], "reach-spot");
    // the find targets: the cabinet in the scanner's view, a reflective sign, a cable tray
    const cab = equipmentCabinet(g, 0.6, 1.4, 0.5, 1.9, -2.6, {});
    cap["shadow-cabinet"] = cab; reg(hits, cab, "shadow-cabinet");
    const shadow = box(g, 0.7, 0.004, 1.4, 1.9, 0.138, -1.7, 0x1d2329, { rough: 0.9, opacity: 0.35, transparent: true, cast: false });
    const sign = box(g, 0.5, 0.36, 0.02, -2.4, 0.9, -5.4, 0xeaeaea, { rough: 0.2, metal: 0.4 }); sign.rotation.y = 0.4;
    cap["reflective-sign"] = sign; reg(hits, sign, "reflective-sign");
    cap["cable-tray"] = box(g, 2.6, 0.06, 0.2, -1.2, 0.03, -5.0, 0x8a939b, { rough: 0.5, metal: 0.5 }); reg(hits, cap["cable-tray"], "cable-tray");
    // the field sheet panel
    const sheet = holoPanel(g, 0.72, 0.48, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(14,8,24,0.92)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#9b7fe0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#efe8fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SSM FIELDS · FROM THE SHEET", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#c9b9ee";
      ["Protective: stop before the mark", "Warning: slow, outside protective", "Muting: off · checksum read back", "Walk every approach, test piece"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, sheet, "sheet-panel");
    // hazard boards
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("default-field-hazard", "FACTORY\nDEFAULT", -1.22, 2.96, 2.75);
    hazard("shrink-field-hazard", "SHRINK\nTHE FIELD", 1.22, 2.96, -2.75);
    hazard("mute-on-hazard", "LEAVE\nMUTING ON", -3.04, -1.01, 1.25);
    hazard("skip-walk-hazard", "SKIP THE\nWALK", 3.04, -1.01, -1.25);
    // configuration board
    const cfgSign = group(g, 2.9, 0, 0.4, -0.9);
    box(cfgSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const cfgFace = decal(cfgSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("FIELDS\nUNSET", { bg: "#11181f", accent: "#9b7fe0", scale: 0.26 }), { px: 320 });
    // scanner spares and cart row along the wall
    for (let i = 0; i < 18; i++) box(g, 0.5, 0.3, 0.35, -4.0 + (i % 6) * 0.6, 0.3 + Math.floor(i / 6) * 0.45, -6.7, [0x53585e, 0xf0b323, 0x9b7fe0][i % 3], { rough: 0.8 });
    for (const y of [0.14, 0.59, 1.04]) box(g, 3.8, 0.04, 0.45, -2.5, y, -6.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    const cart = group(g, 3.6, 0, -5.6);
    box(cart, 0.6, 0.05, 0.4, 0, 0.75, 0, 0x6f7a83, { rough: 0.5, metal: 0.4 }); for (const sx of [-0.27, 0.27]) for (const sz of [-0.17, 0.17]) { box(cart, 0.03, 0.7, 0.03, sx, 0.38, sz, 0x53585e, { rough: 0.5 }); cyl(cart, 0.05, 0.05, 0.03, sx, 0.03, sz, 0x1d2329, { rough: 0.6, seg: 10 }); }
    for (let i = 0; i < 4; i++) box(cart, 0.1, 0.08, 0.1, -0.2 + i * 0.13, 0.82, 0, [0xd8a63a, 0x9b7fe0][i % 2], { rough: 0.5 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const lead = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(lead, "safety lead", 0, 1.95, 0.15, { css: "#9b7fe0", w: 0.3 });
    const coworker = standingFigure(g, 3.9, -2.4, { ry: -1.4, cloth: 0x5a6b7a, helmet: 0x5a6b7a });
    holoTag(coworker, "coworker", 0, 1.95, 0.15, { css: "#9b7fe0", w: 0.26 });
    const faultOn = new URLSearchParams(globalThis.location?.search ?? "").get("fault") === "reflector-shadow";
    const fStep = SIM_RT_SPEED_SEPARATION_MONITORING_SETUP.steps.find((s) => s.id === "find-shadow");
    const fDecl = SIM_RT_SPEED_SEPARATION_MONITORING_SETUP.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.target = fStep.targets[0]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { cab.position.set(3.6, 0, -4.4); sign.position.set(1.9, 0.9, -2.6); sign.rotation.y = 0; shadow.position.set(1.9, 0.138, -1.7); holoTag(g, "Scanner shadow: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 }); }
    faultLamp.visible = faultOn;
    let armSpeed = 0.6;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "cart-shadow") { faultLamp.visible = true; coworker.position.set(1.9, 0, -1.4); cart.position.set(2.3, 0, -1.4); shadow.visible = true; }
        if (it.id === "late-stop") { cap["stop-readout"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 }); protField.scale.set(0.7, 1, 0.7); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cart-shadow") { faultLamp.visible = false; coworker.position.set(3.9, 0, -2.4); cart.position.set(3.6, 0, -5.6); cap["cell-estop"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); armSpeed = 0; }
        if (it.id === "late-stop") { cap["stop-readout"].material = mat(0x59c97b, { rough: 0.5 }); protField.scale.set(1.1, 1, 1.1); cap["protective-dial"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.4 }); }
      },
      onStepComplete(step) {
        if (step.id === "protective-set") { protField.scale.set(1, 1, 1); protField.material = mat(0xd2312b, { rough: 0.7, opacity: 0.3, transparent: true }); repaint(cap["protective-dial"].userData.screen, signFace("SHEET", { bg: "#140c22", accent: "#59c97b", fg: "#efe8fb", scale: 0.42 })); }
        if (step.id === "warning-set") { warnField.scale.set(1.15, 1, 1.15); warnField.material = mat(0xf0b323, { rough: 0.7, opacity: 0.28, transparent: true }); repaint(cap["warning-dial"].userData.screen, signFace("OUTER", { bg: "#140c22", accent: "#59c97b", fg: "#efe8fb", scale: 0.42 })); }
        if (step.id === "find-shadow") { cab.position.set(3.6, 0, -4.4); shadow.visible = false; }
        if (step.id === "walk-hold") armSpeed = 0.25;
        if (step.id === "commit-config") { screen.material = mat(0x1d2329, { rough: 0.3, emissive: 0x1f6a3a, ei: 0.6 }); repaint(cfgFace, signFace("FIELDS\nCOMMITTED", { bg: "#11181f", accent: "#59c97b", fg: "#bff7d4", scale: 0.24 })); }
      },
      onHazard() {},
      animate(t, dt, session) {
        lead.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (P.arm) P.arm.rotation.y = Math.sin(t * armSpeed) * 0.5;
        if (P.elbow) P.elbow.rotation.x = Math.sin(t * armSpeed * 1.5) * 0.2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "protective-set") { protField.scale.set(0.6 + gg.t * 0.7, 1, 0.6 + gg.t * 0.7); repaint(cap["protective-dial"].userData.screen, signFace(gg.t > 0.56 && gg.t < 0.74 ? "SHEET" : gg.t <= 0.56 ? "SHORT" : "WIDE", { bg: "#140c22", accent: gg.t > 0.56 && gg.t < 0.74 ? "#59c97b" : "#f0645b", fg: "#efe8fb", scale: 0.42 })); }
        if (gg && !gg.committed && session?.step?.id === "warning-set") { warnField.scale.set(0.7 + gg.t * 0.6, 1, 0.7 + gg.t * 0.6); repaint(cap["warning-dial"].userData.screen, signFace(gg.t > 0.6 && gg.t < 0.8 ? "OUTER" : gg.t <= 0.6 ? "INSIDE" : "FAR", { bg: "#140c22", accent: gg.t > 0.6 && gg.t < 0.8 ? "#59c97b" : "#f0645b", fg: "#efe8fb", scale: 0.42 })); }
      },
    };
  },
};
