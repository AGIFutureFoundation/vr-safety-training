import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  blockFace, tileFace, gratingFace, reg,
} from "../citykit.js";
import { cleanRoomBay } from "../../../shared/equipment.js";

import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Payload Crane Lift with a Lift Plan — its own gamified system:
// One Voice.
// 
// A generic payload moved by overhead crane in a depot cleanroom: the lift
// plan briefed, crane and rigging inspected, one signal person, a trial
// lift, tag lines and a clear path. No weight, capacity or height is stated;
// those are the lift plan's and the manufacturer's manual's.
// ?fault=hoist-brake-fault puts the hoist brake in fault and the right
// answer is the crane stop, not the trial lift.

const ORB7_ACCENT = 0xb48cff;

export const SIM_AD_PAYLOAD_CRANE_LIFT_WITH_A_LIFT_PLAN = {
  id: "ad-payload-crane-lift-with-a-lift-plan",
  index: "ad-7",
  domain: "Aerospace",
  trade: "Rigger and crane operator, payload lift in a cleanroom — IAM/UAW",
  category: "Manufacturing & Automation",
  district: "aerospace-depot",
  weather: "overcast",
  certification: "IAM and UAW rigging and assembly training as bodies; ASME B30.2 overhead and gantry cranes and ASME B30.16 overhead underhung and monorail hoists; OSHA 29 CFR 1910.132 personal protective equipment and 29 CFR 1910.147 the control of hazardous energy; the site's written lift plan and the manufacturer's manual",
  name: "Payload Crane Lift with a Lift Plan",
  title: simTitle("Payload Crane Lift with a Lift Plan"),
  tagline: "A sensitive payload moved by overhead crane the way a lift plan intends: the plan read and briefed, the crane and rigging inspected, one designated signal person, a trial lift a hand's width off the stand, tag lines and a clear path, and a stop called by anyone the moment something looks wrong",
  accent: ORB7_ACCENT,
  accentCss: "#b48cff",
  parSeconds: 320,
  footprint: 2.9,
  badge: {id: "one-voice", name: "One Voice", note: "Briefed the lift plan, inspected the rigging, made the trial lift and moved only on the designated signal"},

  game: system({
    name: "One Voice",
    currency: "LIFT",
    ranks: ["Tag-line Hand", "Rigger", "Signal Person", "Lift Director", "One Voice Certified"],
    badges: [
      { id: "trial-first", name: "Trial First", note: "Made the trial lift before the travel", test: AWARD.stepClean("trial-lift") },
      { id: "path-kept", name: "Path Kept", note: "Never travelled the load over a person", test: AWARD.safe },
      { id: "smooth-travel", name: "Smooth Travel", note: "Held the travel speed near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-lift", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-lift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your IAM or UAW local's member assistance programme, or the site's employee assistance line if a close call under a load is what stayed with you",

  faults: [{id: "hoist-brake-fault", label: "Hoist brake: FAULT", step: "trial-go", target: "crane-stop", note: "The hoist is showing a brake fault on the pendant. Do not make the trial lift: hit the crane stop and call maintenance.", from: "trial-lift", cue: "On the signal, lift the payload just clear of the stand and hold."}],

  hazards: {"under-load-hazard": "That walks under the suspended payload to adjust a tag line. Nothing about a lift plan makes it safe to be under a load; rigging, hooks and brakes can all fail, and the person under the load has no time to move.", "two-signals-hazard": "That takes a signal from the technician on the far side as well as from the designated signal person. Two voices giving signals is how a crane ends up moving two ways at once; only the stop is anybody's to give.", "skip-inspection-hazard": "That rigs the sling without inspecting it because it was fine last week. Slings are damaged by the lifts between inspections, and a cut or crushed sling looks fine until it is loaded.", "side-pull-hazard": "That drags the payload sideways with the hook off plumb. A side pull swings the load when it leaves the stand and puts forces on the crane it was never meant to take."},

  lateNotes: {"sling-tag": "The sling's tag and body are inspected before it is rigged, every lift.", "signal-person": "The signal person is named in the brief, and only that person signals the crane."},

  interrupts: [{id: "load-swings", kind: "Load swing", after: "travel-speed", delay: 4, seconds: 11, alert: "The payload has started to swing toward the cleanroom wall during the travel.", cue: "Call a stop and hit the crane stop now.", target: "crane-stop", why: "A swinging load stores energy that only grows as the crane keeps travelling, and stopping the crane lets the tag-line hands settle it before it reaches the wall, the bench or a person.", missNote: "The crane kept travelling with the load swinging. A swing is settled by stopping, not by travelling faster to outrun it.", wrongNote: "Not that — the swinging load is answered with the stop, first."}, {id: "walker-in-path", kind: "Path breach", after: "set-down-hold", delay: 4, seconds: 11, alert: "A technician is walking into the travel path under the next leg of the move.", cue: "Have the signal person hold the crane until the path is clear.", target: "signal-person", why: "The travel path is kept clear for the whole move, and the signal person is the one who holds the crane and clears the path, because only one voice should be telling the operator what happens next.", missNote: "Nobody held the crane while a person walked into the path. The next leg would have carried the load over them.", wrongNote: "That isn't it — the person in the travel path is what needs clearing first."}],

  steps: [
    {id: "ppe", kind: "sequence", anyOrder: true, targets: ["hard-hat-cr", "gloves-cr", "cleanroom-gown-cr"], itemNames: {"hard-hat-cr": "bump cap under the hood", "gloves-cr": "rigging gloves over cleanroom gloves", "cleanroom-gown-cr": "cleanroom gown"}, title: "Gown and suit up for the lift", cue: "Cleanroom gown, a bump cap under the hood and rigging gloves over the cleanroom gloves.", why: "A lift in a cleanroom needs both the room's contamination control and the rigging crew's protection, and wearing rigging gloves over the cleanroom gloves keeps the payload clean while still protecting hands from sling edges and pinch points."},
    {id: "brief", kind: "select", target: "lift-plan", title: "Brief the lift plan", cue: "Walk the crew through the lift plan: load, rigging, path, signals and stop.", why: "The lift plan is where the weight, the rigging, the crane's capacity and the travel path were worked out in advance, and briefing it means every person on the lift knows their job and knows that any of them can call stop."},
    {id: "inspect", kind: "sequence", anyOrder: true, targets: ["sling-tag", "hook-latch", "pendant-cr"], itemNames: {"sling-tag": "sling tag and body inspected", "hook-latch": "hook latch closes", "pendant-cr": "pendant functions checked"}, title: "Inspect crane and rigging", cue: "Inspect the sling's tag and body, the hook latch and the pendant functions.", why: "The pre-use inspection is what catches the sling that was cut on the last lift, the latch that no longer closes and the pendant button that sticks, each of which is invisible until it matters and each of which the lift plan assumed was fine."},
    {id: "name-signal", kind: "select", target: "signal-person", title: "Name the signal person", cue: "Confirm the one designated signal person before the hook moves.", why: "One designated signal person means the operator follows one voice, and naming them out loud before the lift removes the confusion that comes from two helpful people giving two different signals."},
    {id: "plumb-check", kind: "gauge", target: "plumb-meter", title: "Check the hook is plumb", cue: "Read the plumb check and commit only when the hook is over the load's centre.", why: "A hook that is not over the load's centre of gravity tilts or swings the payload the moment it leaves the stand, and checking plumb before taking the weight is how that swing is prevented instead of reacted to.", gauge: { label: "HOOK PLUMB", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "plumb" : "off centre"), missNote: "Not plumb — reposition the crane over the load's centre before taking the weight." }},
    {id: "rig-tagline", kind: "drag", target: "tag-line-cr", drag: {to: "load-dock", radius: 0.4, missNote: "Not attached — clip the tag line to the payload fixture before the trial lift."}, title: "Attach the tag line", cue: "Carry the tag line to the payload fixture and clip it on.", why: "The tag line lets a hand control the payload's rotation from outside the fall zone, which is what keeps people from reaching for a swinging load with their hands."},
    {id: "trial-go", kind: "select", target: "trial-lift", title: "Make the trial lift", cue: "On the signal, lift the payload just clear of the stand and hold.", why: "The trial lift takes the weight just clear of the stand and holds it, so the rigging, the balance and the hoist brake are proven while the load is only a hand's width off its support, not over the floor."},
    {id: "travel-speed", kind: "track", target: "travel-meter", seconds: 8, title: "Travel the payload", cue: "Keep the crane's travel inside the band on the signal person's direction.", why: "Smooth, slow travel is what keeps the payload from swinging, and holding the speed inside the band means the tag-line hands can keep up and the load arrives at the set-down stand under control.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "TRAVEL", readout: (v) => (v < 0.4 ? "creeping" : v > 0.62 ? "too fast" : "smooth") }, holdBreakNote: "The travel left the band. Bring it back before the load swings."},
    {id: "find-damage", kind: "find", noHint: true, targets: ["damaged-sling"], itemNames: {"damaged-sling": "cut sling on the rack"}, itemNotes: {"damaged-sling": "A cut sling is removed from service and tagged so it cannot be picked up for the next lift."}, decoyNotes: {"good-sling": "A sling with its tag legible and its body intact. Nothing to flag there."}, title: "Find the damaged rigging", cue: "Look along the rack for the rigging that must not be used again.", why: "Damaged rigging left on the rack is the next lift's failure, and taking it out of service with a tag now means nobody picks it up in a hurry because it was the nearest one."},
    {id: "set-down-hold", kind: "hold", target: "lower-control", seconds: 5, title: "Lower onto the stand", cue: "Hold the lower control for a slow set-down onto the stand.", why: "The set-down is where fingers and feet get caught and where a payload can be jolted, and a slow, held lower lets the crew guide it onto the stand without anybody's hand between the load and the support.", holdBreakNote: "Released the lower early. Hold it for a slow, controlled set-down."},
    {id: "slack-rigging", kind: "select", target: "slack-check", title: "Confirm the load is supported", cue: "Confirm the payload is fully on the stand before slackening the rigging.", why: "The rigging is only slackened once the stand is carrying the load, because unhooking a payload that is still partly on the sling can let it shift or tip on the stand."},
    {id: "unrig", kind: "sequence", anyOrder: true, targets: ["sling-off", "hook-up"], itemNames: {"sling-off": "sling removed", "hook-up": "hook raised clear"}, title: "Unrig and clear the hook", cue: "Remove the sling and raise the hook clear.", why: "The hook is raised clear so nobody walks into it and so the crane can be parked, and the sling comes off by hand only once the load is supported and the operator has stopped."},
    {id: "find-obstruction", kind: "find", noHint: true, targets: ["cart-in-path"], itemNames: {"cart-in-path": "cart parked in the travel path"}, itemNotes: {"cart-in-path": "A cart left in the travel path is moved and the path marking restored for the next lift."}, decoyNotes: {"path-marking": "A travel-path marking, clear. Nothing to flag there."}, title: "Walk the path", cue: "Before you leave, find what is blocking the next lift's path.", why: "The next lift's plan will assume the path is clear, and a cart parked in it now is the obstruction that forces a crew to improvise under a suspended load later."},
    {id: "closeout", kind: "select", target: "lift-log", title: "Log the lift", cue: "Log the lift, the tagged sling and the path issue.", why: "The lift log is how the site sees which rigging keeps getting damaged and which paths keep getting blocked, and a lift that is not logged leaves the next plan written on assumptions."},
  ],

  build(root) {
    const ACC = ORB7_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floorMesh = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floorMesh.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc9ced2, grout: "#8a9094" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wallMesh = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wallMesh.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7d8790 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const trayMesh = box(g, 1.4, 0.03, 0.8, 3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    trayMesh.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "depot cleanroom, lift bay", -3.8, 3.7, -7.05, { css: "#b48cff", w: 0.5 });
    const rig = cleanRoomBay(g, 0, 0, -4.4, {});
    const P = rig.userData.parts;
    for (const sx of [-2.3, 2.3]) box(g, 0.2, 0.3, 4.2, sx, 2.85, -4.4, 0x3b4148, { rough: 0.6, metal: 0.4 }); const craneBridge = box(g, 4.8, 0.26, 0.3, 0, 2.62, -3.6, 0xf0b323, { rough: 0.5 }); const hookBlock = group(g, 0, 2.1, -3.6); box(hookBlock, 0.2, 0.3, 0.14, 0, 0, 0, 0xf0b323, { rough: 0.5 }); cyl(hookBlock, 0.012, 0.012, 0.5, 0, 0.35, 0, 0x2b2f34, { rough: 0.4, metal: 0.6, seg: 8 }); box(g, 1.0, 0.5, 0.8, 0, 0.35, -3.6, 0xdfe6ea, { rough: 0.4 });
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    post(-1.68, 1.47, 0.95);
    cap["hard-hat-cr"] = box(g, 0.18, 0.14, 0.12, -1.68, 1.02, 1.47, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "bump cap under the hood", -1.68, 1.3, 1.47, { css: "#b48cff", w: 0.5 });
    reg(hits, cap["hard-hat-cr"], "hard-hat-cr");
    post(-2.03, 1.02, 0.95);
    cap["gloves-cr"] = ball(g, 0.075, -2.03, 1.03, 1.02, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "rigging gloves over cleanroom gloves", -2.03, 1.3, 1.02, { css: "#b48cff", w: 0.5 });
    reg(hits, cap["gloves-cr"], "gloves-cr");
    post(-2.22, 0.49, 0.95);
    cap["cleanroom-gown-cr"] = cyl(g, 0.07, 0.07, 0.12, -2.22, 1.01, 0.49, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "cleanroom gown", -2.22, 1.3, 0.49, { css: "#b48cff", w: 0.372 });
    reg(hits, cap["cleanroom-gown-cr"], "cleanroom-gown-cr");
    post(-2.23, -0.05, 0.95);
    cap["sling-tag"] = box(g, 0.18, 0.14, 0.12, -2.23, 1.02, -0.05, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "sling tag and body inspected", -2.23, 1.3, -0.05, { css: "#b48cff", w: 0.5 });
    reg(hits, cap["sling-tag"], "sling-tag");
    post(-2.05, -0.58, 0.95);
    cap["hook-latch"] = ball(g, 0.075, -2.05, 1.03, -0.58, 0x59637a, { rough: 0.45, seg: 12 });
    holoTag(g, "hook latch closes", -2.05, 1.3, -0.58, { css: "#b48cff", w: 0.426 });
    reg(hits, cap["hook-latch"], "hook-latch");
    post(-1.71, -1.04, 0.95);
    cap["pendant-cr"] = cyl(g, 0.07, 0.07, 0.12, -1.71, 1.01, -1.04, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(g, "crane pendant", -1.71, 1.3, -1.04, { css: "#b48cff", w: 0.354 });
    reg(hits, cap["pendant-cr"], "pendant-cr");
    post(-1.22, -1.4, 0.95);
    cap["signal-person"] = box(g, 0.18, 0.14, 0.12, -1.22, 1.02, -1.4, 0xf0b323, { rough: 0.5 });
    holoTag(g, "signal person", -1.22, 1.3, -1.4, { css: "#b48cff", w: 0.354 });
    reg(hits, cap["signal-person"], "signal-person");
    post(-0.64, -1.63, 0.95);
    cap["plumb-meter"] = instrument(g, -0.64, 0.97, -1.63, { ry: 0.29, idle: "--", color: ACC });
    holoTag(g, "plumb meter", -0.64, 1.3, -1.63, { css: "#b48cff", w: 0.31799999999999995 });
    reg(hits, cap["plumb-meter"], "plumb-meter");
    post(0.0, -1.71, 0.95);
    cap["tag-line-cr"] = cyl(g, 0.07, 0.07, 0.12, 0.0, 1.01, -1.71, 0xd8a63a, { rough: 0.5, seg: 12 });
    holoTag(g, "tag line", 0.0, 1.3, -1.71, { css: "#b48cff", w: 0.264 });
    reg(hits, cap["tag-line-cr"], "tag-line-cr");
    post(0.64, -1.63, 0.95);
    cap["load-dock"] = group(g, 0.64, 0.95, -1.63); box(cap["load-dock"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["load-dock"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "load dock", 0.64, 1.3, -1.63, { css: "#b48cff", w: 0.282 });
    reg(hits, cap["load-dock"], "load-dock");
    post(1.22, -1.4, 0.95);
    cap["trial-lift"] = ball(g, 0.075, 1.22, 1.03, -1.4, 0x2b2f34, { rough: 0.45, seg: 12 });
    holoTag(g, "trial lift", 1.22, 1.3, -1.4, { css: "#b48cff", w: 0.3 });
    reg(hits, cap["trial-lift"], "trial-lift");
    post(1.71, -1.04, 0.95);
    cap["travel-meter"] = instrument(g, 1.71, 0.97, -1.04, { ry: -0.86, idle: "--", color: ACC });
    holoTag(g, "travel meter", 1.71, 1.3, -1.04, { css: "#b48cff", w: 0.33599999999999997 });
    reg(hits, cap["travel-meter"], "travel-meter");
    post(2.05, -0.58, 0.95);
    cap["lower-control"] = box(g, 0.18, 0.14, 0.12, 2.05, 1.02, -0.58, 0x3a78c9, { rough: 0.5 });
    holoTag(g, "lower control", 2.05, 1.3, -0.58, { css: "#b48cff", w: 0.354 });
    reg(hits, cap["lower-control"], "lower-control");
    post(2.23, -0.05, 0.95);
    cap["slack-check"] = ball(g, 0.075, 2.23, 1.03, -0.05, 0xd8a63a, { rough: 0.45, seg: 12 });
    holoTag(g, "slack check", 2.23, 1.3, -0.05, { css: "#b48cff", w: 0.31799999999999995 });
    reg(hits, cap["slack-check"], "slack-check");
    post(2.22, 0.49, 0.95);
    cap["sling-off"] = cyl(g, 0.07, 0.07, 0.12, 2.22, 1.01, 0.49, 0x59637a, { rough: 0.5, seg: 12 });
    holoTag(g, "sling removed", 2.22, 1.3, 0.49, { css: "#b48cff", w: 0.354 });
    reg(hits, cap["sling-off"], "sling-off");
    post(2.03, 1.02, 0.95);
    cap["hook-up"] = box(g, 0.18, 0.14, 0.12, 2.03, 1.02, 1.02, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "hook raised clear", 2.03, 1.3, 1.02, { css: "#b48cff", w: 0.426 });
    reg(hits, cap["hook-up"], "hook-up");
    post(1.68, 1.47, 0.95);
    cap["crane-stop"] = ball(g, 0.075, 1.68, 1.03, 1.47, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "crane stop", 1.68, 1.3, 1.47, { css: "#b48cff", w: 0.3 });
    reg(hits, cap["crane-stop"], "crane-stop");
    cap["damaged-sling"] = ball(g, 0.06, -1.6, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["damaged-sling"], "damaged-sling");
    cap["good-sling"] = ball(g, 0.06, -0.53, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["good-sling"], "good-sling");
    cap["cart-in-path"] = ball(g, 0.06, 0.53, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["cart-in-path"], "cart-in-path");
    cap["path-marking"] = ball(g, 0.06, 1.6, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["path-marking"], "path-marking");
    box(g, 3.8, 0.05, 0.4, 0, 0.55, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.55, 0.36, sx, 0.275, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    { const hz = group(g, -1.22, 0, 2.96, 2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("WALK\nUNDER", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "under-load-hazard"); }
    { const hz = group(g, 1.22, 0, 2.96, -2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("TWO\nSIGNALS", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "two-signals-hazard"); }
    { const hz = group(g, -3.04, 0, -1.01, 1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SKIP\nCHECK", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "skip-inspection-hazard"); }
    { const hz = group(g, 3.04, 0, -1.01, -1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SIDE\nPULL", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "side-pull-hazard"); }
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#b48cff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LIFT PLAN · PAYLOAD MOVE", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Load, rigging, capacity: per the lift plan", "One designated signal person", "Trial lift before travel", "Anyone may call stop"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "lift-plan");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("LIFT LOG\nOPEN", { bg: "#11181f", accent: "#b48cff", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "lift log", 0, 1.46, 0, { css: "#b48cff", w: 0.34 });
    reg(hits, logSign, "lift-log");
    for (let i = 0; i < 36; i++) { const side = i % 2 ? 1 : -1; const k = Math.floor(i / 2); box(g, 0.34, 0.2, 0.3, side * 4.3, 0.3 + (k % 4) * 0.42, -5.6 + Math.floor(k / 4) * 0.42, [0x3a78c9, 0xf0b323, 0x59637a][i % 3], { rough: 0.7 }); }
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) box(g, 0.4, 0.03, 2.4, side * 4.3, 0.18 + k * 0.42, -4.6, 0x53585e, { rough: 0.6, metal: 0.4 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.9, 1.0, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(crew, "lift director", 0, 1.95, 0.15, { css: "#b48cff", w: 0.34 });
    const faultOn = /[?&]fault=hoist-brake-fault(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_AD_PAYLOAD_CRANE_LIFT_WITH_A_LIFT_PLAN.steps.find((s) => s.id === "trial-go");
    const fDecl = SIM_AD_PAYLOAD_CRANE_LIFT_WITH_A_LIFT_PLAN.faults[0];
    if (fStep) { fStep.target = faultOn ? fDecl.target : fDecl.from; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    faultLamp.visible = faultOn;
    if (faultOn) holoTag(g, "Hoist brake: FAULT", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 });
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "load-swings") { faultLamp.visible = true; cap["crane-stop"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "walker-in-path") { cap["signal-person"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "load-swings") { faultLamp.visible = false; cap["crane-stop"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "walker-in-path") { cap["signal-person"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "plumb-check") repaint(cap["plumb-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "closeout") repaint(logFace, signFace("LIFT LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        hookBlock.position.y = 2.1 + Math.sin(t * 0.4) * 0.03;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "plumb-check") repaint(cap["plumb-meter"].userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
