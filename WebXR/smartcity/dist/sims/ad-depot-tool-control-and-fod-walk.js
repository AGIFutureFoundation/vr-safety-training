import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  blockFace, tileFace, gratingFace, reg,
} from "../citykit.js";
import { depotHangarBay } from "../../../shared/equipment.js";

import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Depot Tool Control & FOD Walk — its own gamified system:
// Nothing on the Floor.
// 
// A generic depot hangar bay around the shared regional jet: kit counted
// out and back against its shadows, loose items tethered, a shoulder-to-
// shoulder FOD walk and a release only on a complete count. No torque,
// interval or count is stated; those are the work order's and the depot's
// tool-control programme's. ?fault=tool-missing makes the count come back
// one short and the right answer stop work, not release.

const ORB4_ACCENT = 0xffc857;

export const SIM_AD_DEPOT_TOOL_CONTROL_AND_FOD_WALK = {
  id: "ad-depot-tool-control-and-fod-walk",
  index: "ad-4",
  domain: "Aerospace",
  trade: "Depot aircraft maintainer, tool control and FOD prevention — IAM",
  category: "Mobility & Transit",
  district: "aerospace-depot",
  weather: "overcast",
  certification: "IAM depot and aircraft maintenance training as a body; FAA 14 CFR 43 maintenance, preventive maintenance, rebuilding and alteration and 14 CFR 145 repair stations as the civil frame; OSHA 29 CFR 1910.132 personal protective equipment and 29 CFR 1910.22 walking-working surfaces; the depot's written tool-control and foreign-object-damage prevention programme",
  name: "Depot Tool Control & FOD Walk",
  title: simTitle("Depot Tool Control & FOD Walk"),
  tagline: "A depot maintenance task closed out the way tool control and FOD prevention actually work: the crib kit signed out and counted, every loose item tethered or pocketed at the aircraft, a shoulder-to-shoulder FOD walk of the bay, and the aircraft released only when the kit counts back complete",
  accent: ORB4_ACCENT,
  accentCss: "#ffc857",
  parSeconds: 320,
  footprint: 2.9,
  badge: {id: "nothing-on-the-floor", name: "Nothing on the Floor", note: "Counted the kit out and back, walked the bay shoulder to shoulder and released the aircraft with nothing missing"},

  game: system({
    name: "Nothing on the Floor",
    currency: "FOD",
    ranks: ["Helper", "Tool Control Qualified", "Maintainer", "Crew Chief", "Nothing on the Floor Certified"],
    badges: [
      { id: "kit-counted", name: "Kit Counted", note: "Counted the kit out against its shadows before the task", test: AWARD.stepClean("kit-out") },
      { id: "no-loose-items", name: "No Loose Items", note: "Never carried an untethered item to the aircraft", test: AWARD.safe },
      { id: "even-line", name: "Even Line", note: "Held the FOD walk line near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-walk", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-release", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your IAM local's member assistance programme, or the depot's employee assistance line if a close call on the ramp or in the bay is what stayed with you",

  faults: [{id: "tool-missing", label: "Kit count: ONE SHORT", step: "release-select", target: "stop-work", note: "The kit has counted back one short. Do not release the aircraft: stop work and start the lost-tool search.", from: "release-button", cue: "With the kit counted back complete, release the aircraft on the work order."}],

  hazards: {"sign-anyway-hazard": "That signs the aircraft off with an empty shadow in the kit. A tool unaccounted for may be inside an access panel or an intake, and the only honest answer to an empty shadow is to find it.", "loose-pen-hazard": "That walks to the aircraft with a pen and a torch loose in the chest pocket. Anything that can fall out when you lean into a bay can end up where it jams a control or gets drawn into an engine.", "skip-walk-hazard": "That skips the FOD walk because the bay looks clean. Small hardware, rivet tails and safety-wire clippings are exactly the debris that is invisible from standing height.", "borrow-tool-hazard": "That borrows a tool from the next crew's kit. A tool that is not in your kit is a tool your count will never catch if it goes missing, and it leaves a hole in theirs."},

  lateNotes: {"kit-shadow-1": "The kit is counted against its shadows at sign-out, before the aircraft is touched.", "rivet-tail": "Debris found on the walk is picked up and bagged, not kicked aside."},

  interrupts: [{id: "panel-closing", kind: "Panel closing", after: "fod-walk", delay: 4, seconds: 11, alert: "A coworker is about to close the access panel you were working in before the kit has been counted back.", cue: "Call stop work before the panel is closed.", target: "stop-work", why: "An access panel closed before the count is a panel that may have a tool behind it, and opening it again later costs more than a few seconds of stop work now, so the call is made before the fasteners go in.", missNote: "The panel was closed before the kit was counted back. Whatever was left behind it is now sealed inside the aircraft.", wrongNote: "Not that — the panel closing before the count is what needs stopping."}, {id: "crib-mixup", kind: "Crib challenge", after: "hold-count", delay: 4, seconds: 11, alert: "The crib attendant is about to book the kit back in without looking at the shadows.", cue: "Call the crib attendant back to count the kit against its shadows.", target: "crib-attendant", why: "The crib's own count is the second check on yours, and a kit booked in unseen turns two counts into one — the attendant is asked to count it against the shadows so the depot's record matches what is actually in the drawer.", missNote: "The kit was booked back in without a look. The crib's record now says complete whether or not it is.", wrongNote: "That isn't it — the kit being booked in unseen is what needs correcting."}],

  steps: [
    {id: "ppe", kind: "sequence", anyOrder: true, targets: ["safety-glasses-dt", "hearing-protection-dt", "safety-shoes-dt"], itemNames: {"safety-glasses-dt": "safety glasses", "hearing-protection-dt": "hearing protection", "safety-shoes-dt": "safety shoes"}, title: "Suit up for the bay", cue: "Safety glasses, hearing protection and safety shoes before the crib window.", why: "The depot bay runs rivet guns, air tools and ground equipment around every aircraft in it, and the protection is for the hangar's hazards as much as for this one task, because noise and flying debris do not respect whose job it is."},
    {id: "brief", kind: "select", target: "work-order-dt", title: "Read the work order", cue: "Confirm the task, the access panels and the kit the task calls for.", why: "The work order is what says which panels will be open and which kit is needed, and it is also what the count at the end is measured against — a task started without it has no defined finish line."},
    {id: "kit-out", kind: "sequence", anyOrder: true, targets: ["kit-shadow-1", "kit-shadow-2", "kit-shadow-3"], itemNames: {"kit-shadow-1": "ratchet in its shadow", "kit-shadow-2": "torque driver in its shadow", "kit-shadow-3": "inspection mirror in its shadow"}, title: "Sign out and count the kit", cue: "Check every tool against its shadow before the kit leaves the crib.", why: "The count at sign-out is the baseline the count at release is measured against; without it a missing tool at the end cannot be told apart from a tool that was never in the kit, and the lost-tool search starts from a guess."},
    {id: "tether", kind: "select", target: "tether-point", title: "Tether and pocket loose items", cue: "Tether the torch and zip away the pen before you go to the aircraft.", why: "Pens, torches, badges and earplug cases are the classic foreign objects because nobody counts them as tools, and tethering or zipping them away is how they stay on the person instead of inside a wheel well."},
    {id: "torque-check", kind: "gauge", target: "torque-meter", title: "Check the torque driver", cue: "Read the torque driver's calibration check and commit only in the green band.", why: "A driver out of its calibration date or reading outside its check band will torque every fastener wrong without any sign, and the check is what proves the tool this task depends on is telling the truth today.", gauge: { label: "CAL CHECK", speed: 0.6, green: [0.42, 0.6], readout: (t) => (t > 0.42 && t < 0.6 ? "in cal" : "out of cal"), missNote: "Not in the green — return the driver to the crib and draw a calibrated one." }},
    {id: "stage-kit", kind: "drag", target: "kit-tray", drag: {to: "stand-dock", radius: 0.4, missNote: "Not staged — set the kit tray on the work stand, not on the wing or the floor."}, title: "Stage the kit on the stand", cue: "Carry the kit tray to the work stand and set it there.", why: "A kit staged on the work stand is a kit in one known place; tools set down on a wing, a tyre or the floor are tools that get walked away from and found later by the aircraft's first flight."},
    {id: "fod-walk", kind: "track", target: "walk-line", seconds: 8, title: "Walk the bay shoulder to shoulder", cue: "Keep the FOD walk line even inside the band as the crew moves across the bay.", why: "A FOD walk works because the line is even and slow, each person's strip overlapping the next, and a line that bunches or races leaves gaps where the one rivet tail that matters sits unnoticed.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "WALK LINE", readout: (v) => (v < 0.4 ? "lagging" : v > 0.62 ? "racing" : "even") }, holdBreakNote: "The line drifted out of step. Even it up before the walk moves on."},
    {id: "find-debris", kind: "find", noHint: true, targets: ["rivet-tail"], itemNames: {"rivet-tail": "rivet tail on the floor"}, itemNotes: {"rivet-tail": "A rivet tail is exactly the size of debris an intake pulls in; it is bagged and logged."}, decoyNotes: {"floor-seam": "A floor expansion joint, as built. Nothing to flag there."}, title: "Find the debris", cue: "Look along the shelf and the floor for what should not be in the bay.", why: "The walk exists to find the item nobody meant to leave, and bagging what is found also tells the crew where it came from, so the task that shed it can be done more tidily next time."},
    {id: "hold-count", kind: "hold", target: "count-hold", seconds: 5, title: "Hold the release while the kit is counted", cue: "Hold the release hold while the kit is counted back against its shadows.", why: "The release hold keeps the aircraft from being signed off while the count is happening, so there is never a moment where the paperwork says done and the kit is still being looked at.", holdBreakNote: "Released the hold before the count finished. Keep it until every shadow is checked."},
    {id: "release-select", kind: "select", target: "release-button", title: "Release the aircraft", cue: "With the kit counted back complete, release the aircraft on the work order.", why: "The aircraft is released only on a complete count, because a release is a promise that nothing from this task is left inside it, and that promise is only as good as the count behind it."},
    {id: "return-kit", kind: "sequence", anyOrder: true, targets: ["kit-return", "crib-sign"], itemNames: {"kit-return": "kit returned", "crib-sign": "crib sign-in"}, title: "Return the kit", cue: "Return the kit to the crib and sign it back in.", why: "The crib's sign-in closes the loop the sign-out opened, and a kit that is not signed back in shows as out on the depot's board, which is the first thing checked when a tool turns up where it should not."},
    {id: "find-tag", kind: "find", noHint: true, targets: ["broken-tether"], itemNames: {"broken-tether": "frayed tool tether"}, itemNotes: {"broken-tether": "A frayed tether is a dropped tool waiting to happen; it is tagged and replaced."}, decoyNotes: {"good-tether": "A tether with its clip intact. Nothing to flag there."}, title: "Check the tethers", cue: "Find the tether that should not go back on the rack.", why: "A tether that fails is worse than none because the crew trusts it, and taking a frayed one out of service now is how the next task starts with tethers that actually hold."},
    {id: "closeout", kind: "select", target: "bay-log", title: "Log the task", cue: "Log the counts, the debris found and the tagged tether.", why: "The bay log is how the depot sees where debris keeps coming from and which kits keep coming back short, and it is written before the crew moves on while the details are still in front of them."},
  ],

  build(root) {
    const ACC = ORB4_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floorMesh = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floorMesh.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc9ced2, grout: "#8a9094" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wallMesh = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wallMesh.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7d8790 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const trayMesh = box(g, 1.4, 0.03, 0.8, 3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    trayMesh.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "depot hangar, bay 3", -3.8, 3.7, -7.05, { css: "#ffc857", w: 0.5 });
    const rig = depotHangarBay(g, 0, 0, -5.6, { livery: { colour: 0xdfe6ea, accent: ACC, fleetName: "DEPOT", unitNumber: "BAY 3" } });
    const P = rig.userData.parts;
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    post(-1.68, 1.47, 0.95);
    cap["safety-glasses-dt"] = box(g, 0.18, 0.14, 0.12, -1.68, 1.02, 1.47, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "safety glasses", -1.68, 1.3, 1.47, { css: "#ffc857", w: 0.372 });
    reg(hits, cap["safety-glasses-dt"], "safety-glasses-dt");
    post(-2.03, 1.02, 0.95);
    cap["hearing-protection-dt"] = ball(g, 0.075, -2.03, 1.03, 1.02, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "hearing protection", -2.03, 1.3, 1.02, { css: "#ffc857", w: 0.44399999999999995 });
    reg(hits, cap["hearing-protection-dt"], "hearing-protection-dt");
    post(-2.22, 0.49, 0.95);
    cap["safety-shoes-dt"] = cyl(g, 0.07, 0.07, 0.12, -2.22, 1.01, 0.49, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "safety shoes", -2.22, 1.3, 0.49, { css: "#ffc857", w: 0.33599999999999997 });
    reg(hits, cap["safety-shoes-dt"], "safety-shoes-dt");
    post(-2.23, -0.05, 0.95);
    cap["kit-shadow-1"] = box(g, 0.18, 0.14, 0.12, -2.23, 1.02, -0.05, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "ratchet in its shadow", -2.23, 1.3, -0.05, { css: "#ffc857", w: 0.49799999999999994 });
    reg(hits, cap["kit-shadow-1"], "kit-shadow-1");
    post(-2.05, -0.58, 0.95);
    cap["kit-shadow-2"] = ball(g, 0.075, -2.05, 1.03, -0.58, 0x59637a, { rough: 0.45, seg: 12 });
    holoTag(g, "torque driver in its shadow", -2.05, 1.3, -0.58, { css: "#ffc857", w: 0.5 });
    reg(hits, cap["kit-shadow-2"], "kit-shadow-2");
    post(-1.71, -1.04, 0.95);
    cap["kit-shadow-3"] = cyl(g, 0.07, 0.07, 0.12, -1.71, 1.01, -1.04, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(g, "inspection mirror in its shadow", -1.71, 1.3, -1.04, { css: "#ffc857", w: 0.5 });
    reg(hits, cap["kit-shadow-3"], "kit-shadow-3");
    post(-1.22, -1.4, 0.95);
    cap["tether-point"] = box(g, 0.18, 0.14, 0.12, -1.22, 1.02, -1.4, 0xf0b323, { rough: 0.5 });
    holoTag(g, "tool tether", -1.22, 1.3, -1.4, { css: "#ffc857", w: 0.31799999999999995 });
    reg(hits, cap["tether-point"], "tether-point");
    post(-0.64, -1.63, 0.95);
    cap["torque-meter"] = instrument(g, -0.64, 0.97, -1.63, { ry: 0.29, idle: "--", color: ACC });
    holoTag(g, "torque meter", -0.64, 1.3, -1.63, { css: "#ffc857", w: 0.33599999999999997 });
    reg(hits, cap["torque-meter"], "torque-meter");
    post(0.0, -1.71, 0.95);
    cap["kit-tray"] = cyl(g, 0.07, 0.07, 0.12, 0.0, 1.01, -1.71, 0xd8a63a, { rough: 0.5, seg: 12 });
    holoTag(g, "kit tray", 0.0, 1.3, -1.71, { css: "#ffc857", w: 0.264 });
    reg(hits, cap["kit-tray"], "kit-tray");
    post(0.64, -1.63, 0.95);
    cap["stand-dock"] = group(g, 0.64, 0.95, -1.63); box(cap["stand-dock"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["stand-dock"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "stand dock", 0.64, 1.3, -1.63, { css: "#ffc857", w: 0.3 });
    reg(hits, cap["stand-dock"], "stand-dock");
    post(1.22, -1.4, 0.95);
    cap["walk-line"] = instrument(g, 1.22, 0.97, -1.4, { ry: -0.58, idle: "--", color: ACC });
    holoTag(g, "walk line", 1.22, 1.3, -1.4, { css: "#ffc857", w: 0.282 });
    reg(hits, cap["walk-line"], "walk-line");
    post(1.71, -1.04, 0.95);
    cap["count-hold"] = cyl(g, 0.07, 0.07, 0.12, 1.71, 1.01, -1.04, 0xf0b323, { rough: 0.5, seg: 12 });
    holoTag(g, "count hold", 1.71, 1.3, -1.04, { css: "#ffc857", w: 0.3 });
    reg(hits, cap["count-hold"], "count-hold");
    post(2.05, -0.58, 0.95);
    cap["release-button"] = box(g, 0.18, 0.14, 0.12, 2.05, 1.02, -0.58, 0x3a78c9, { rough: 0.5 });
    holoTag(g, "release button", 2.05, 1.3, -0.58, { css: "#ffc857", w: 0.372 });
    reg(hits, cap["release-button"], "release-button");
    post(2.23, -0.05, 0.95);
    cap["kit-return"] = ball(g, 0.075, 2.23, 1.03, -0.05, 0xd8a63a, { rough: 0.45, seg: 12 });
    holoTag(g, "kit returned", 2.23, 1.3, -0.05, { css: "#ffc857", w: 0.33599999999999997 });
    reg(hits, cap["kit-return"], "kit-return");
    post(2.22, 0.49, 0.95);
    cap["crib-sign"] = cyl(g, 0.07, 0.07, 0.12, 2.22, 1.01, 0.49, 0x59637a, { rough: 0.5, seg: 12 });
    holoTag(g, "crib sign-in", 2.22, 1.3, 0.49, { css: "#ffc857", w: 0.33599999999999997 });
    reg(hits, cap["crib-sign"], "crib-sign");
    post(2.03, 1.02, 0.95);
    cap["stop-work"] = box(g, 0.18, 0.14, 0.12, 2.03, 1.02, 1.02, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "stop work", 2.03, 1.3, 1.02, { css: "#ffc857", w: 0.282 });
    reg(hits, cap["stop-work"], "stop-work");
    post(1.68, 1.47, 0.95);
    cap["crib-attendant"] = ball(g, 0.075, 1.68, 1.03, 1.47, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "crib attendant", 1.68, 1.3, 1.47, { css: "#ffc857", w: 0.372 });
    reg(hits, cap["crib-attendant"], "crib-attendant");
    cap["rivet-tail"] = ball(g, 0.06, -1.6, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["rivet-tail"], "rivet-tail");
    cap["floor-seam"] = ball(g, 0.06, -0.53, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["floor-seam"], "floor-seam");
    cap["broken-tether"] = ball(g, 0.06, 0.53, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["broken-tether"], "broken-tether");
    cap["good-tether"] = ball(g, 0.06, 1.6, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["good-tether"], "good-tether");
    box(g, 3.8, 0.05, 0.4, 0, 0.55, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.55, 0.36, sx, 0.275, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    { const hz = group(g, -1.22, 0, 2.96, 2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SIGN\nIT", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "sign-anyway-hazard"); }
    { const hz = group(g, 1.22, 0, 2.96, -2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("POCKET\nLOOSE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "loose-pen-hazard"); }
    { const hz = group(g, -3.04, 0, -1.01, 1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SKIP\nWALK", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "skip-walk-hazard"); }
    { const hz = group(g, 3.04, 0, -1.01, -1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("BORROW", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "borrow-tool-hazard"); }
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#ffc857"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER · BAY 3", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Kit: per the crib sign-out", "Loose items tethered or pocketed", "FOD walk before release", "Kit counts back complete"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "work-order-dt");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("BAY LOG\nOPEN", { bg: "#11181f", accent: "#ffc857", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "bay log", 0, 1.46, 0, { css: "#ffc857", w: 0.34 });
    reg(hits, logSign, "bay-log");
    for (let i = 0; i < 36; i++) { const side = i % 2 ? 1 : -1; const k = Math.floor(i / 2); box(g, 0.34, 0.2, 0.3, side * 4.3, 0.3 + (k % 4) * 0.42, -5.6 + Math.floor(k / 4) * 0.42, [0x3a78c9, 0xf0b323, 0x59637a][i % 3], { rough: 0.7 }); }
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) box(g, 0.4, 0.03, 2.4, side * 4.3, 0.18 + k * 0.42, -4.6, 0x53585e, { rough: 0.6, metal: 0.4 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -4.0, 0.4, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(crew, "crew chief", 0, 1.95, 0.15, { css: "#ffc857", w: 0.34 });
    const faultOn = /[?&]fault=tool-missing(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_AD_DEPOT_TOOL_CONTROL_AND_FOD_WALK.steps.find((s) => s.id === "release-select");
    const fDecl = SIM_AD_DEPOT_TOOL_CONTROL_AND_FOD_WALK.faults[0];
    if (fStep) { fStep.target = faultOn ? fDecl.target : fDecl.from; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    faultLamp.visible = faultOn;
    if (faultOn) holoTag(g, "Kit count: ONE SHORT", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 });
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "panel-closing") { faultLamp.visible = true; cap["stop-work"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "crib-mixup") { cap["crib-attendant"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "panel-closing") { faultLamp.visible = false; cap["stop-work"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "crib-mixup") { cap["crib-attendant"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "torque-check") repaint(cap["torque-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "closeout") repaint(logFace, signFace("BAY LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "torque-check") repaint(cap["torque-meter"].userData.screen, signFace(gg.t > 0.42 && gg.t < 0.6 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
