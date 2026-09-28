import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  blockFace, tileFace, gratingFace, reg,
} from "../citykit.js";
import { cobotBench } from "../../../shared/equipment.js";
import { teachPendant } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cobot Risk Assessment & Speed-and-Separation — its own
// gamified system: Tested, Not Trusted.
// 
// A generic collaborative robot bench: the application walked against its
// risk assessment, the scanner zones proven with a body, the stopping and
// contact checks run, and the bench released only on tested controls. No
// speed, distance or force is stated; those are the assessment's and the
// manufacturer's manual's. ?fault=scanner-blocked blocks the scanner window
// and the right answer is the cobot e-stop, not the release.

const ORB8_ACCENT = 0x5ee0b0;

export const SIM_AD_COBOT_RISK_ASSESSMENT_AND_SPEED_SEPARATION = {
  id: "ad-cobot-risk-assessment-and-speed-separation",
  index: "ad-8",
  domain: "Robotics",
  trade: "Automation technician, collaborative robot application — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-training-centre",
  weather: "overcast",
  certification: "UAW and IAM skilled-trades training as bodies; ANSI R15.06 and ISO 10218 industrial robot safety, including collaborative operation; OSHA 29 CFR 1910.212 general requirements for machines and 29 CFR 1910.147 the control of hazardous energy; the application's written risk assessment and the manufacturer's manual",
  name: "Cobot Risk Assessment & Speed-and-Separation",
  title: simTitle("Cobot Risk Assessment & Speed-and-Separation"),
  tagline: "A collaborative robot bench brought into service the way a risk assessment demands: the application walked task by task, the area scanner's warning and protective zones proven with a body, speed-and-separation shown to slow and stop the arm, and the bench released only when every hazard on the sheet has a control that was actually tested",
  accent: ORB8_ACCENT,
  accentCss: "#5ee0b0",
  parSeconds: 320,
  footprint: 2.9,
  badge: {id: "tested-not-trusted", name: "Tested, Not Trusted", note: "Walked the risk assessment, proved the scanner zones with a body and saw the arm slow and stop before releasing the bench"},

  game: system({
    name: "Tested, Not Trusted",
    currency: "COBOT",
    ranks: ["Operator", "Application Aware", "Cobot Technician", "Integration Lead", "Tested, Not Trusted Certified"],
    badges: [
      { id: "zones-proven", name: "Zones Proven", note: "Proved both scanner zones with a body before release", test: AWARD.stepClean("zone-test") },
      { id: "no-bypass", name: "No Bypass", note: "Never muted the scanner to finish faster", test: AWARD.safe },
      { id: "steady-approach", name: "Steady Approach", note: "Held the approach walk near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-assess", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-release", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UAW or IAM local's member assistance programme, or the centre's employee assistance line if a close call at a bench is what stayed with you",

  faults: [{id: "scanner-blocked", label: "Area scanner: WINDOW BLOCKED", step: "release-select", target: "cobot-estop", note: "The area scanner reports its window blocked. Do not release the bench: stop the cobot and clear the scanner first.", from: "release-button", cue: "With every control tested, release the bench for use."}],

  hazards: {"mute-scanner-hazard": "That mutes the area scanner so the arm stops slowing when you lean in. Speed-and-separation is the control; muting it turns a collaborative application into an unguarded robot with a person beside it.", "no-body-test-hazard": "That signs the scanner zones off from the settings screen without walking into them. Settings say what the scanner should do; only a body walking into the zone shows what it actually does.", "sharp-gripper-hazard": "That fits the sharp-edged finger set the assessment never covered. The collaborative assessment was done for the gripper on the sheet; a new tool with edges is a new hazard the sheet does not answer.", "raise-speed-hazard": "That raises the arm's speed to hit the cycle time without reassessing. Speed changes the separation the arm needs, and a new speed means a new assessment, not a quicker version of the old one."},

  lateNotes: {"zone-walk-warn": "The scanner zones are proven by walking into them, not read off the settings screen.", "task-list": "Every task the operator does at the bench is on the assessment before the bench goes live."},

  interrupts: [{id: "arm-does-not-slow", kind: "Control failure", after: "approach-walk", delay: 4, seconds: 11, alert: "You have walked into the warning zone and the arm has not slowed at all.", cue: "Hit the cobot e-stop now.", target: "cobot-estop", why: "An arm that does not slow when a person enters the warning zone is a control that has failed its test, and the e-stop is what ends the risk now; the bench is not released until the reason is found and the test passes.", missNote: "The arm kept full speed with a person in the zone. A failed control is stopped, not watched.", wrongNote: "Not that — the arm not slowing is answered with the e-stop."}, {id: "student-reaches-in", kind: "Classroom challenge", after: "force-hold", delay: 4, seconds: 11, alert: "A student at the next desk is reaching into the cobot's work area to pick up a part.", cue: "Call the instructor so the student is stopped and briefed.", target: "instructor-call", why: "The assessment covers the operator the bench was designed for, not a student who has not been briefed, and the instructor is the one who stops the reach and explains why the zone is not a shelf.", missNote: "Nobody stopped the student reaching into the work area. The bench was never assessed for that person or that task.", wrongNote: "That isn't it — the student reaching in is what needs stopping first."}],

  steps: [
    {id: "ppe", kind: "sequence", anyOrder: true, targets: ["safety-glasses-cb", "safety-shoes-cb", "hair-tie-cb"], itemNames: {"safety-glasses-cb": "safety glasses", "safety-shoes-cb": "safety shoes", "hair-tie-cb": "long hair tied back"}, title: "Prepare for the bench", cue: "Safety glasses, safety shoes and long hair tied back before the bench.", why: "Working beside a moving arm means loose hair, sleeves and lanyards are the things that get caught first, and the glasses protect against a part flicked from the gripper, which the arm's own safety functions do nothing about."},
    {id: "brief", kind: "select", target: "risk-sheet", title: "Open the risk assessment", cue: "Open the application's risk assessment and read the hazards it lists.", why: "A collaborative application is only collaborative because a risk assessment showed its hazards are controlled for this task, this tool and this layout, and the sheet is where those findings live and where any change has to be written first."},
    {id: "walk-tasks", kind: "sequence", anyOrder: false, targets: ["task-list", "tool-check", "layout-check"], itemNames: {"task-list": "operator tasks walked", "tool-check": "gripper matches the sheet", "layout-check": "layout matches the sheet"}, outOfOrderNote: "Out of order — walk the operator's tasks first, then check the gripper, then the layout against the sheet.", title: "Walk the application", cue: "Walk the operator's tasks, then check the gripper and the layout against the sheet.", why: "The assessment is only valid for the tasks, tool and layout it describes, and walking each against the bench as it stands today is how a changed fixture or a swapped gripper is caught before it becomes the hazard nobody assessed."},
    {id: "clean-scanner", kind: "select", target: "scanner-window", title: "Check the area scanner", cue: "Check the area scanner's window is clean and unobstructed.", why: "The area scanner is what the arm relies on to know where people are, and a smudged or obstructed window can make it see a person too late or not at all, which undoes speed-and-separation without any warning on the screen."},
    {id: "zone-test", kind: "sequence", anyOrder: false, targets: ["zone-walk-warn", "zone-walk-stop"], itemNames: {"zone-walk-warn": "walked into the warning zone: arm slowed", "zone-walk-stop": "walked into the protective zone: arm stopped"}, outOfOrderNote: "Out of order — prove the warning zone first, then the protective zone.", title: "Prove the zones with a body", cue: "Walk into the warning zone and watch the arm slow, then into the protective zone and watch it stop.", why: "Speed-and-separation only works if the arm really slows and stops at the zones the assessment set, and the only honest test is a person walking into them while the arm runs, because a settings screen shows intent, not behaviour."},
    {id: "stop-time", kind: "gauge", target: "stop-meter", title: "Check the stopping performance", cue: "Read the stopping check and commit only in the green band the manual sets.", why: "The separation distance depends on how quickly the arm actually stops, and a stopping check outside its band means the zones drawn on the floor are too small for the arm as it behaves today.", gauge: { label: "STOP CHECK", speed: 0.6, green: [0.43, 0.61], readout: (t) => (t > 0.43 && t < 0.61 ? "within band" : "out of band"), missNote: "Not in the band — the zones are not valid for this arm until the stopping performance is corrected." }},
    {id: "stage-part", kind: "drag", target: "part-blank", drag: {to: "tray-dock", radius: 0.4, missNote: "Not in the tray — set the part in the fixture tray, not in the arm's path."}, title: "Stage the part", cue: "Carry a part blank to the fixture tray.", why: "Parts are staged in the tray the assessment describes so that the operator's hands go only where the analysis expected them, rather than into the arm's path to rescue a part set down somewhere convenient."},
    {id: "approach-walk", kind: "track", target: "approach-meter", seconds: 8, title: "Walk the approach", cue: "Keep your approach to the bench steady inside the band as the arm runs.", why: "The zones are calibrated for a person walking at a normal pace, and a steady approach inside the band shows the arm slowing smoothly rather than stopping abruptly, which tells you the separation is set right for real use.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "APPROACH", readout: (v) => (v < 0.4 ? "hesitating" : v > 0.62 ? "rushing" : "steady") }, holdBreakNote: "The approach left the band. Steady your pace before you reach the zone."},
    {id: "find-gap", kind: "find", noHint: true, targets: ["sharp-fixture"], itemNames: {"sharp-fixture": "sharp fixture corner"}, itemNotes: {"sharp-fixture": "A sharp fixture corner in the arm's path is a pinch and cut hazard the assessment missed; it is written up and guarded."}, decoyNotes: {"rounded-corner": "A radiused bench corner, as assessed. Nothing to flag there."}, title: "Find the unassessed hazard", cue: "Look along the shelf for the hazard the sheet does not cover.", why: "Walking the bench always turns up something the desk review missed, and a sharp corner where the arm can trap a hand is exactly the kind of detail that decides whether contact is harmless or not."},
    {id: "force-hold", kind: "hold", target: "force-test", seconds: 5, title: "Run the contact check", cue: "Hold the contact check through the test the manual describes.", why: "Where the application relies on limiting contact force, the check is run through its whole cycle with the manufacturer's test method, because a partial check proves nothing about the moment the arm actually meets a hand.", holdBreakNote: "Released the contact check early. Hold it through the full test."},
    {id: "release-select", kind: "select", target: "release-button", title: "Release the bench", cue: "With every control tested, release the bench for use.", why: "Release is the statement that every hazard on the sheet has a control and every control has been tested, and releasing on anything less is releasing on hope rather than on the evidence the assessment asked for."},
    {id: "update-sheet", kind: "sequence", anyOrder: true, targets: ["sheet-finding", "sheet-control"], itemNames: {"sheet-finding": "sharp corner added", "sheet-control": "guard added as control"}, title: "Update the risk assessment", cue: "Add the sharp corner and its guard to the sheet.", why: "A hazard found and fixed but not written into the assessment will be missed again the next time the bench is changed, and updating the sheet is how the finding outlives the person who found it."},
    {id: "find-pendant", kind: "find", noHint: true, targets: ["pendant-auto"], itemNames: {"pendant-auto": "pendant left in automatic"}, itemNotes: {"pendant-auto": "A pendant left in automatic mode on a bench after teaching is switched back and stowed."}, decoyNotes: {"pendant-holster": "A pendant holster, empty and ready. Nothing to flag there."}, title: "Check the pendant", cue: "Before you leave, find the setting that should not be left as it is.", why: "A pendant left in the wrong mode is how the next person teaching the arm finds it moving faster than they expect, so it is returned to the state the procedure sets before the bench is left."},
    {id: "closeout", kind: "select", target: "release-log", title: "Sign the release", cue: "Sign the release log with the tests run and the sheet updated.", why: "The release log records who tested what and when, so that when the bench changes, the next person knows what the last release was based on and what needs testing again."},
  ],

  build(root) {
    const ACC = ORB8_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floorMesh = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floorMesh.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc9ced2, grout: "#8a9094" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wallMesh = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wallMesh.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7d8790 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const trayMesh = box(g, 1.4, 0.03, 0.8, 3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    trayMesh.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "training centre, cobot bench", -3.8, 3.7, -7.05, { css: "#5ee0b0", w: 0.5 });
    const rig = cobotBench(g, 0, 0, -3.6, {});
    const P = rig.userData.parts;
    const pendant = teachPendant(g, -1.3, 0.96, -3.6, { ry: 0.3 }); reg(hits, pendant, "pendant-cb");
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    post(-1.68, 1.47, 0.95);
    cap["safety-glasses-cb"] = box(g, 0.18, 0.14, 0.12, -1.68, 1.02, 1.47, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "safety glasses", -1.68, 1.3, 1.47, { css: "#5ee0b0", w: 0.372 });
    reg(hits, cap["safety-glasses-cb"], "safety-glasses-cb");
    post(-2.0, 1.07, 0.95);
    cap["safety-shoes-cb"] = ball(g, 0.075, -2.0, 1.03, 1.07, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "safety shoes", -2.0, 1.3, 1.07, { css: "#5ee0b0", w: 0.33599999999999997 });
    reg(hits, cap["safety-shoes-cb"], "safety-shoes-cb");
    post(-2.2, 0.61, 0.95);
    cap["hair-tie-cb"] = cyl(g, 0.07, 0.07, 0.12, -2.2, 1.01, 0.61, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "long hair tied back", -2.2, 1.3, 0.61, { css: "#5ee0b0", w: 0.46199999999999997 });
    reg(hits, cap["hair-tie-cb"], "hair-tie-cb");
    post(-2.25, 0.13, 0.95);
    cap["task-list"] = box(g, 0.18, 0.14, 0.12, -2.25, 1.02, 0.13, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "operator tasks walked", -2.25, 1.3, 0.13, { css: "#5ee0b0", w: 0.49799999999999994 });
    reg(hits, cap["task-list"], "task-list");
    post(-2.15, -0.35, 0.95);
    cap["tool-check"] = ball(g, 0.075, -2.15, 1.03, -0.35, 0x59637a, { rough: 0.45, seg: 12 });
    holoTag(g, "gripper matches the sheet", -2.15, 1.3, -0.35, { css: "#5ee0b0", w: 0.5 });
    reg(hits, cap["tool-check"], "tool-check");
    post(-1.92, -0.8, 0.95);
    cap["layout-check"] = cyl(g, 0.07, 0.07, 0.12, -1.92, 1.01, -0.8, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(g, "layout matches the sheet", -1.92, 1.3, -0.8, { css: "#5ee0b0", w: 0.5 });
    reg(hits, cap["layout-check"], "layout-check");
    post(-1.56, -1.18, 0.95);
    cap["scanner-window"] = box(g, 0.18, 0.14, 0.12, -1.56, 1.02, -1.18, 0xf0b323, { rough: 0.5 });
    holoTag(g, "area scanner", -1.56, 1.3, -1.18, { css: "#5ee0b0", w: 0.33599999999999997 });
    reg(hits, cap["scanner-window"], "scanner-window");
    post(-1.1, -1.47, 0.95);
    cap["zone-walk-warn"] = ball(g, 0.075, -1.1, 1.03, -1.47, 0x3a78c9, { rough: 0.45, seg: 12 });
    holoTag(g, "walked into the warning zone: arm slowed", -1.1, 1.3, -1.47, { css: "#5ee0b0", w: 0.5 });
    reg(hits, cap["zone-walk-warn"], "zone-walk-warn");
    post(-0.57, -1.65, 0.95);
    cap["zone-walk-stop"] = cyl(g, 0.07, 0.07, 0.12, -0.57, 1.01, -1.65, 0xd8a63a, { rough: 0.5, seg: 12 });
    holoTag(g, "walked into the protective zone: arm stopped", -0.57, 1.3, -1.65, { css: "#5ee0b0", w: 0.5 });
    reg(hits, cap["zone-walk-stop"], "zone-walk-stop");
    post(0.0, -1.71, 0.95);
    cap["stop-meter"] = instrument(g, 0.0, 0.97, -1.71, { ry: -0.0, idle: "--", color: ACC });
    holoTag(g, "stop meter", 0.0, 1.3, -1.71, { css: "#5ee0b0", w: 0.3 });
    reg(hits, cap["stop-meter"], "stop-meter");
    post(0.57, -1.65, 0.95);
    cap["part-blank"] = ball(g, 0.075, 0.57, 1.03, -1.65, 0x2b2f34, { rough: 0.45, seg: 12 });
    holoTag(g, "part blank", 0.57, 1.3, -1.65, { css: "#5ee0b0", w: 0.3 });
    reg(hits, cap["part-blank"], "part-blank");
    post(1.1, -1.47, 0.95);
    cap["tray-dock"] = group(g, 1.1, 0.95, -1.47); box(cap["tray-dock"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["tray-dock"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "tray dock", 1.1, 1.3, -1.47, { css: "#5ee0b0", w: 0.282 });
    reg(hits, cap["tray-dock"], "tray-dock");
    post(1.56, -1.18, 0.95);
    cap["approach-meter"] = instrument(g, 1.56, 0.97, -1.18, { ry: -0.77, idle: "--", color: ACC });
    holoTag(g, "approach meter", 1.56, 1.3, -1.18, { css: "#5ee0b0", w: 0.372 });
    reg(hits, cap["approach-meter"], "approach-meter");
    post(1.92, -0.8, 0.95);
    cap["force-test"] = ball(g, 0.075, 1.92, 1.03, -0.8, 0xd8a63a, { rough: 0.45, seg: 12 });
    holoTag(g, "force test", 1.92, 1.3, -0.8, { css: "#5ee0b0", w: 0.3 });
    reg(hits, cap["force-test"], "force-test");
    post(2.15, -0.35, 0.95);
    cap["release-button"] = cyl(g, 0.07, 0.07, 0.12, 2.15, 1.01, -0.35, 0x59637a, { rough: 0.5, seg: 12 });
    holoTag(g, "release button", 2.15, 1.3, -0.35, { css: "#5ee0b0", w: 0.372 });
    reg(hits, cap["release-button"], "release-button");
    post(2.25, 0.13, 0.95);
    cap["sheet-finding"] = box(g, 0.18, 0.14, 0.12, 2.25, 1.02, 0.13, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "sharp corner added", 2.25, 1.3, 0.13, { css: "#5ee0b0", w: 0.44399999999999995 });
    reg(hits, cap["sheet-finding"], "sheet-finding");
    post(2.2, 0.61, 0.95);
    cap["sheet-control"] = ball(g, 0.075, 2.2, 1.03, 0.61, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "guard added as control", 2.2, 1.3, 0.61, { css: "#5ee0b0", w: 0.5 });
    reg(hits, cap["sheet-control"], "sheet-control");
    post(2.0, 1.07, 0.95);
    cap["cobot-estop"] = cyl(g, 0.07, 0.07, 0.12, 2.0, 1.01, 1.07, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "cobot e-stop", 2.0, 1.3, 1.07, { css: "#5ee0b0", w: 0.33599999999999997 });
    reg(hits, cap["cobot-estop"], "cobot-estop");
    post(1.68, 1.47, 0.95);
    cap["instructor-call"] = box(g, 0.18, 0.14, 0.12, 1.68, 1.02, 1.47, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "call the instructor", 1.68, 1.3, 1.47, { css: "#5ee0b0", w: 0.46199999999999997 });
    reg(hits, cap["instructor-call"], "instructor-call");
    cap["sharp-fixture"] = ball(g, 0.06, -1.6, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["sharp-fixture"], "sharp-fixture");
    cap["rounded-corner"] = ball(g, 0.06, -0.53, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["rounded-corner"], "rounded-corner");
    cap["pendant-auto"] = ball(g, 0.06, 0.53, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["pendant-auto"], "pendant-auto");
    cap["pendant-holster"] = ball(g, 0.06, 1.6, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["pendant-holster"], "pendant-holster");
    box(g, 3.8, 0.05, 0.4, 0, 0.55, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.55, 0.36, sx, 0.275, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    { const hz = group(g, -1.22, 0, 2.96, 2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("MUTE\nIT", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "mute-scanner-hazard"); }
    { const hz = group(g, 1.22, 0, 2.96, -2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SCREEN\nONLY", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "no-body-test-hazard"); }
    { const hz = group(g, -3.04, 0, -1.01, 1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SHARP\nFINGERS", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "sharp-gripper-hazard"); }
    { const hz = group(g, 3.04, 0, -1.01, -1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SPEED\nUP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "raise-speed-hazard"); }
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#5ee0b0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("RISK ASSESSMENT · COBOT BENCH", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Tasks and hazards: per the assessment", "Speeds, zones, forces: per the manual", "Prove each control with a body", "Release only when every line is tested"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "risk-sheet");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("RISK SHEET\nOPEN", { bg: "#11181f", accent: "#5ee0b0", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "release log", 0, 1.46, 0, { css: "#5ee0b0", w: 0.34 });
    reg(hits, logSign, "release-log");
    for (let i = 0; i < 36; i++) { const side = i % 2 ? 1 : -1; const k = Math.floor(i / 2); box(g, 0.34, 0.2, 0.3, side * 4.3, 0.3 + (k % 4) * 0.42, -5.6 + Math.floor(k / 4) * 0.42, [0x3a78c9, 0xf0b323, 0x59637a][i % 3], { rough: 0.7 }); }
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) box(g, 0.4, 0.03, 2.4, side * 4.3, 0.18 + k * 0.42, -4.6, 0x53585e, { rough: 0.6, metal: 0.4 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(crew, "integration lead", 0, 1.95, 0.15, { css: "#5ee0b0", w: 0.34 });
    const faultOn = /[?&]fault=scanner-blocked(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_AD_COBOT_RISK_ASSESSMENT_AND_SPEED_SEPARATION.steps.find((s) => s.id === "release-select");
    const fDecl = SIM_AD_COBOT_RISK_ASSESSMENT_AND_SPEED_SEPARATION.faults[0];
    if (fStep) { fStep.target = faultOn ? fDecl.target : fDecl.from; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    faultLamp.visible = faultOn;
    if (faultOn) holoTag(g, "Area scanner: WINDOW BLOCKED", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 });
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "arm-does-not-slow") { faultLamp.visible = true; cap["cobot-estop"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "student-reaches-in") { cap["instructor-call"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "arm-does-not-slow") { faultLamp.visible = false; cap["cobot-estop"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "student-reaches-in") { cap["instructor-call"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "stop-time") repaint(cap["stop-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "closeout") repaint(logFace, signFace("RISK SHEET\nSIGNED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        P.arm.rotation.y = Math.sin(t * 0.7) * 0.9;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "stop-time") repaint(cap["stop-meter"].userData.screen, signFace(gg.t > 0.43 && gg.t < 0.61 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.43 && gg.t < 0.61 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
