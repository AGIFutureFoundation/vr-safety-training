import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  blockFace, tileFace, gratingFace, reg,
} from "../citykit.js";
import { amrRobot } from "../../../shared/equipment.js";

import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ AMR Fleet Traffic & E-stop Drill — its own gamified system:
// Lane Discipline.
// 
// A generic robot hall with AMRs on marked lanes: crossings at the marked
// point, an e-stop drill across every unit, a faulted unit taken out of the
// fleet before it is touched, and the lane closed for the recovery. No speed,
// distance or stopping figure is stated; those are the fleet manual's and
// the risk assessment's. ?fault=estop-trip leaves unit 14 with its own
// e-stop tripped, and the recovery starts at the robot, not the console.

const ORB3_ACCENT = 0x4fd1ff;

export const SIM_AD_AMR_FLEET_TRAFFIC_AND_ESTOP_DRILL = {
  id: "ad-amr-fleet-traffic-and-estop-drill",
  index: "ad-3",
  domain: "Robotics",
  trade: "Automation technician, AMR fleet traffic and e-stop — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-factory",
  weather: "overcast",
  certification: "UAW and IAM skilled-trades training as bodies; OSHA 29 CFR 1910.212 general requirements for machines, 29 CFR 1910.147 the control of hazardous energy and 29 CFR 1910.178 powered industrial trucks where lift trucks share the aisle; ANSI R15.06 and ISO 10218 as the robot-safety frame; the fleet manufacturer's manual and the site's traffic plan",
  name: "AMR Fleet Traffic & E-stop Drill",
  title: simTitle("AMR Fleet Traffic & E-stop Drill"),
  tagline: "A floor shared with autonomous mobile robots worked the way the traffic plan intends: people on the walkways and robots on the marked lanes, crossings made only at the marked points, an e-stop drill that proves every robot actually stops, and a fault robot recovered only after it is taken out of the fleet",
  accent: ORB3_ACCENT,
  accentCss: "#4fd1ff",
  parSeconds: 320,
  footprint: 2.9,
  badge: {"id": "lane-discipline", "name": "Lane Discipline", "note": "Crossed only at marked points, proved the e-stops and recovered the faulted robot out of the fleet"},

  game: system({
    name: "Lane Discipline",
    currency: "LANE",
    ranks: ["Floor Walker", "Lane Aware", "Fleet Technician", "Fleet Lead", "Lane Discipline Certified"],
    badges: [
      { id: "drill-proven", name: "Drill Proven", note: "Proved every robot stopped on the e-stop drill", test: AWARD.stepClean("estop-drill") },
      { id: "walkway-only", name: "Walkway Only", note: "Never stepped into a live lane", test: AWARD.safe },
      { id: "steady-escort", name: "Steady Escort", note: "Held the manual push near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-drill", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-floor", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UAW or IAM local's member assistance programme, or the site's employee assistance line if a close call on the floor is what stayed with you",

  faults: [{"id": "estop-trip", "label": "Unit 14: E-STOP TRIPPED", "step": "recover-select", "target": "unit-estop", "note": "Unit 14 is sitting with its own e-stop tripped. Find out why at the robot's e-stop first; do not reset it from the console.", "from": "fleet-remove", "cue": "At the fleet console, take unit 14 out of the fleet before touching it."}],

  hazards: {"cut-across-hazard": "That cuts across the live lane between two robots. A robot's scanner is set to slow and stop for what it can see, but a person stepping out from behind a rack or another robot may be inside its stopping distance before it sees them.", "ride-the-robot-hazard": "That stands on the robot's lift plate to reach the shelf. The lift plate carries loads, not people, and the robot has no way to know a person is riding it when it decides to move.", "block-scanner-hazard": "That hangs a jacket over the robot's scanner to stop it slowing near the bench. A robot that cannot see is a robot that will not stop for the next person, and its safety comes entirely from that scanner.", "push-live-hazard": "That pushes the faulted robot by hand while it is still in the fleet. A unit the controller still thinks is available can be given a new mission and start moving under your hands."},

  lateNotes: {"fleet-remove": "The faulted robot is taken out of the fleet at the console before anyone touches it.", "crossing-point": "The lane is crossed at the marked point, after looking both ways, every time."},

  interrupts: [{"id": "robot-leaves-lane", "kind": "Robot off its lane", "after": "escort-push", "delay": 4, "seconds": 11, "alert": "Another robot has drifted off its lane toward the walkway where a visitor is standing.", "cue": "Hit the fleet pause at the console now.", "target": "fleet-pause", "why": "A robot off its lane is a robot whose map or localisation no longer matches the floor, and pausing the whole fleet is the one control that stops every unit at once while somebody works out which one is lost and why.", "missNote": "The fleet kept running with a robot off its lane beside a person. A lost robot is paused first and diagnosed second.", "wrongNote": "Not that — the robot off its lane is answered with the fleet pause."}, {"id": "forklift-in-lane", "kind": "Mixed traffic", "after": "hold-lane-closed", "delay": 4, "seconds": 11, "alert": "A lift truck has turned into the AMR lane you have just closed for the recovery.", "cue": "Use the zone access request to hold the lane closed and wave the truck back.", "target": "zone-request", "why": "The closed lane is protecting you and the faulted robot, and a lift truck driving into it undoes that protection, so the zone request is used to keep the lane held while the driver is waved back to the aisle the traffic plan gives them.", "missNote": "The lift truck came down the closed lane. A closed lane is only closed if everybody driving the floor is kept out of it.", "wrongNote": "That isn't it — the lift truck in the closed lane is what needs holding back."}],

  steps: [
    {"id": "ppe", "kind": "sequence", "anyOrder": true, "targets": ["hi-vis-vest", "safety-shoes-amr", "safety-glasses-amr"], "itemNames": {"hi-vis-vest": "hi-vis vest", "safety-shoes-amr": "safety shoes", "safety-glasses-amr": "safety glasses"}, "title": "Dress for the floor", "cue": "Hi-vis vest, safety shoes and safety glasses before you step onto the floor.", "why": "A robot floor is shared with lift trucks and tuggers driven by people, and the hi-vis vest is for their eyes, not the robots' — the robots' scanners see a body either way, but a driver turning a corner needs every bit of contrast they can get."},
    {"id": "brief", "kind": "select", "target": "traffic-plan", "title": "Read the traffic plan", "cue": "Find today's lanes, crossings and closed zones before walking onto the floor.", "why": "Robot lanes and crossings change when the floor layout changes, and the traffic plan is what shows today's version — walking the floor from memory means walking yesterday's lanes."},
    {"id": "cross-lane", "kind": "select", "target": "crossing-point", "title": "Cross at the marked point", "cue": "Walk to the marked crossing, look both ways and cross.", "why": "The marked crossing is where robots are configured to slow and where they expect people, and it is the only place where the floor's design has already done half the work of keeping you out of a robot's path."},
    {"id": "estop-drill", "kind": "sequence", "anyOrder": true, "targets": ["drill-unit-1", "drill-unit-2", "drill-unit-3"], "itemNames": {"drill-unit-1": "unit 12 stopped", "drill-unit-2": "unit 14 stopped", "drill-unit-3": "unit 17 stopped"}, "title": "Run the e-stop drill", "cue": "Trigger the drill and confirm each robot on the lane has actually stopped.", "why": "An e-stop drill proves the stop works on every unit, not just the one the technician happened to check last month, and a robot that keeps rolling on the drill is found now instead of on the day somebody needs it to stop."},
    {"id": "scanner-check", "kind": "gauge", "target": "scanner-meter", "title": "Check the unit's scanner field", "cue": "Read the scanner field check and commit only in the green band.", "why": "The robot's scanner is the thing that slows and stops it for people, and the field check is what shows it is clean, aligned and seeing the zone the risk assessment says it should, not a smudged window guessing.", "gauge": { label: "SCANNER FIELD", speed: 0.6, green: [0.43, 0.61], readout: (t) => (t > 0.43 && t < 0.61 ? "field clear" : "check window"), missNote: "Not in the green — clean or check the scanner window before the unit rejoins the lane." }},
    {"id": "recover-select", "kind": "select", "target": "fleet-remove", "title": "Take the faulted unit out of the fleet", "cue": "At the fleet console, take unit 14 out of the fleet before touching it.", "why": "A faulted robot the controller still counts as available can be handed a new mission at any moment, and taking it out of the fleet at the console is what guarantees it will not start moving while a person is next to it."},
    {"id": "close-lane", "kind": "drag", "target": "lane-barrier", "drag": {"to": "lane-dock", "radius": 0.4, "missNote": "Not set — place the barrier across the lane mouth before walking into the lane."}, "title": "Close the lane", "cue": "Carry the lane barrier to the lane mouth and set it.", "why": "The barrier tells the fleet and every driver on the floor that this lane is closed, so the recovery happens inside a space nothing else is routed through rather than in a gap between moving robots."},
    {"id": "escort-push", "kind": "track", "target": "push-meter", "seconds": 8, "title": "Push the unit to the bay", "cue": "In manual mode, keep the push steady inside the band as the unit rolls to the service bay.", "why": "A robot pushed in manual mode has no drive holding it back, and a steady push inside the band keeps it under your control instead of rolling on its own into a rack or a person's ankles.", "track": { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "MANUAL PUSH", readout: (v) => (v < 0.4 ? "stalled" : v > 0.62 ? "too fast" : "steady") }, "holdBreakNote": "The push left the band. Steady it before the unit rolls any further."},
    {"id": "find-cause", "kind": "find", "noHint": true, "targets": ["shrink-wrap"], "itemNames": {"shrink-wrap": "shrink wrap on the caster"}, "itemNotes": {"shrink-wrap": "Shrink wrap wound round a caster is a common reason a unit drifts or faults; it comes off before the unit rejoins."}, "decoyNotes": {"clean-bumper": "A clean bumper strip, intact. Nothing to flag there."}, "title": "Find the cause", "cue": "Look along the shelf for what took the unit off its lane.", "why": "A robot that faulted once will fault again unless the cause is found, and the floor debris wound into a caster is also a sign the lane itself needs sweeping before the next unit runs over it."},
    {"id": "hold-lane-closed", "kind": "hold", "target": "lane-hold", "seconds": 5, "title": "Hold the lane closed", "cue": "Hold the lane closure on the console while the unit is inspected.", "why": "The lane stays closed on the console for the whole inspection, not only until the barrier is in place, because a fleet that reopens the lane on its own schedule can route a unit into the space you are working in.", "holdBreakNote": "Released the lane hold early. Keep it held until the inspection is done."},
    {"id": "return-unit", "kind": "select", "target": "fleet-console", "title": "Return the unit to the fleet", "cue": "Return unit 14 to the fleet once the cause is cleared and the scanner checks green.", "why": "A unit rejoins the fleet only after its fault is cleared and its scanner is proven, because putting it back early turns a known fault into an unexpected one somewhere else on the floor."},
    {"id": "reopen", "kind": "sequence", "anyOrder": true, "targets": ["barrier-lift", "lane-reopen"], "itemNames": {"barrier-lift": "barrier removed", "lane-reopen": "lane reopened"}, "title": "Reopen the lane", "cue": "Remove the barrier and reopen the lane on the console.", "why": "Reopening is done deliberately at both the barrier and the console so that the floor and the fleet agree the lane is live again, instead of one thinking it is closed while the other sends robots through it."},
    {"id": "find-blind-corner", "kind": "find", "noHint": true, "targets": ["missing-mirror"], "itemNames": {"missing-mirror": "missing corner mirror"}, "itemNotes": {"missing-mirror": "The convex mirror at the blind corner is gone; it is reported so the crossing can be made safe again."}, "decoyNotes": {"floor-arrow": "A lane arrow, freshly painted. Nothing to flag there."}, "title": "Walk the lane", "cue": "Before you leave, find what makes this lane less safe than the plan says.", "why": "The traffic plan assumes the floor matches it, and a missing mirror at a blind corner is the kind of gap that lets a person and a robot meet with no warning, so it is reported now rather than noticed after a near miss."},
    {"id": "closeout", "kind": "select", "target": "fleet-log", "title": "Log the drill and the recovery", "cue": "Log the e-stop results, the fault cause and the missing mirror.", "why": "The fleet log is how a pattern shows up — the same unit faulting, the same corner causing trouble — and a drill and a recovery that are not written down teach the floor nothing."},
  ],

  build(root) {
    const ACC = ORB3_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floorMesh = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floorMesh.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc9ced2, grout: "#8a9094" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wallMesh = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wallMesh.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7d8790 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const trayMesh = box(g, 1.4, 0.03, 0.8, 3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    trayMesh.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "robot hall, AMR lane A", -3.8, 3.7, -7.05, { css: "#4fd1ff", w: 0.5 });
    const rig = amrRobot(g, -3.2, 0, -3.0, {});
    const P = rig.userData.parts;
    const amr2 = amrRobot(g, 3.3, 0, -3.4, { ry: 1.2 }); const amr3 = amrRobot(g, 0.2, 0, -4.8, { ry: 0.4 }); box(g, 8.6, 0.006, 1.3, 0, 0.125, -3.4, 0x2f6fe0, { rough: 0.7, opacity: 0.45, transparent: true, cast: false }); for (const dz of [-0.7, 0.7]) box(g, 8.6, 0.008, 0.08, 0, 0.127, -3.4 + dz, 0xf0b323, { rough: 0.6, cast: false });
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    post(-1.68, 1.47, 0.95);
    cap["hi-vis-vest"] = box(g, 0.18, 0.14, 0.12, -1.68, 1.02, 1.47, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "hi-vis vest", -1.68, 1.3, 1.47, { css: "#4fd1ff", w: 0.31799999999999995 });
    reg(hits, cap["hi-vis-vest"], "hi-vis-vest");
    post(-2.0, 1.07, 0.95);
    cap["safety-shoes-amr"] = ball(g, 0.075, -2.0, 1.03, 1.07, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "safety shoes", -2.0, 1.3, 1.07, { css: "#4fd1ff", w: 0.33599999999999997 });
    reg(hits, cap["safety-shoes-amr"], "safety-shoes-amr");
    post(-2.2, 0.61, 0.95);
    cap["safety-glasses-amr"] = cyl(g, 0.07, 0.07, 0.12, -2.2, 1.01, 0.61, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "safety glasses", -2.2, 1.3, 0.61, { css: "#4fd1ff", w: 0.372 });
    reg(hits, cap["safety-glasses-amr"], "safety-glasses-amr");
    post(-2.25, 0.13, 0.95);
    cap["crossing-point"] = box(g, 0.18, 0.14, 0.12, -2.25, 1.02, 0.13, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "crossing point", -2.25, 1.3, 0.13, { css: "#4fd1ff", w: 0.372 });
    reg(hits, cap["crossing-point"], "crossing-point");
    post(-2.15, -0.35, 0.95);
    cap["drill-unit-1"] = ball(g, 0.075, -2.15, 1.03, -0.35, 0x59637a, { rough: 0.45, seg: 12 });
    holoTag(g, "unit 12 stopped", -2.15, 1.3, -0.35, { css: "#4fd1ff", w: 0.38999999999999996 });
    reg(hits, cap["drill-unit-1"], "drill-unit-1");
    post(-1.92, -0.8, 0.95);
    cap["drill-unit-2"] = cyl(g, 0.07, 0.07, 0.12, -1.92, 1.01, -0.8, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(g, "unit 14 stopped", -1.92, 1.3, -0.8, { css: "#4fd1ff", w: 0.38999999999999996 });
    reg(hits, cap["drill-unit-2"], "drill-unit-2");
    post(-1.56, -1.18, 0.95);
    cap["drill-unit-3"] = box(g, 0.18, 0.14, 0.12, -1.56, 1.02, -1.18, 0xf0b323, { rough: 0.5 });
    holoTag(g, "unit 17 stopped", -1.56, 1.3, -1.18, { css: "#4fd1ff", w: 0.38999999999999996 });
    reg(hits, cap["drill-unit-3"], "drill-unit-3");
    post(-1.1, -1.47, 0.95);
    cap["scanner-meter"] = instrument(g, -1.1, 0.97, -1.47, { ry: 0.51, idle: "--", color: ACC });
    holoTag(g, "scanner meter", -1.1, 1.3, -1.47, { css: "#4fd1ff", w: 0.354 });
    reg(hits, cap["scanner-meter"], "scanner-meter");
    post(-0.57, -1.65, 0.95);
    cap["fleet-remove"] = cyl(g, 0.07, 0.07, 0.12, -0.57, 1.01, -1.65, 0xd8a63a, { rough: 0.5, seg: 12 });
    holoTag(g, "fleet remove", -0.57, 1.3, -1.65, { css: "#4fd1ff", w: 0.33599999999999997 });
    reg(hits, cap["fleet-remove"], "fleet-remove");
    post(0.0, -1.71, 0.95);
    cap["lane-barrier"] = box(g, 0.18, 0.14, 0.12, 0.0, 1.02, -1.71, 0x59637a, { rough: 0.5 });
    holoTag(g, "lane barrier", 0.0, 1.3, -1.71, { css: "#4fd1ff", w: 0.33599999999999997 });
    reg(hits, cap["lane-barrier"], "lane-barrier");
    post(0.57, -1.65, 0.95);
    cap["lane-dock"] = group(g, 0.57, 0.95, -1.65); box(cap["lane-dock"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["lane-dock"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "lane dock", 0.57, 1.3, -1.65, { css: "#4fd1ff", w: 0.282 });
    reg(hits, cap["lane-dock"], "lane-dock");
    post(1.1, -1.47, 0.95);
    cap["push-meter"] = instrument(g, 1.1, 0.97, -1.47, { ry: -0.51, idle: "--", color: ACC });
    holoTag(g, "push meter", 1.1, 1.3, -1.47, { css: "#4fd1ff", w: 0.3 });
    reg(hits, cap["push-meter"], "push-meter");
    post(1.56, -1.18, 0.95);
    cap["lane-hold"] = box(g, 0.18, 0.14, 0.12, 1.56, 1.02, -1.18, 0x3a78c9, { rough: 0.5 });
    holoTag(g, "lane hold", 1.56, 1.3, -1.18, { css: "#4fd1ff", w: 0.282 });
    reg(hits, cap["lane-hold"], "lane-hold");
    post(1.92, -0.8, 0.95);
    cap["fleet-console"] = ball(g, 0.075, 1.92, 1.03, -0.8, 0xd8a63a, { rough: 0.45, seg: 12 });
    holoTag(g, "fleet console", 1.92, 1.3, -0.8, { css: "#4fd1ff", w: 0.354 });
    reg(hits, cap["fleet-console"], "fleet-console");
    post(2.15, -0.35, 0.95);
    cap["barrier-lift"] = cyl(g, 0.07, 0.07, 0.12, 2.15, 1.01, -0.35, 0x59637a, { rough: 0.5, seg: 12 });
    holoTag(g, "barrier removed", 2.15, 1.3, -0.35, { css: "#4fd1ff", w: 0.38999999999999996 });
    reg(hits, cap["barrier-lift"], "barrier-lift");
    post(2.25, 0.13, 0.95);
    cap["lane-reopen"] = box(g, 0.18, 0.14, 0.12, 2.25, 1.02, 0.13, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "lane reopened", 2.25, 1.3, 0.13, { css: "#4fd1ff", w: 0.354 });
    reg(hits, cap["lane-reopen"], "lane-reopen");
    post(2.2, 0.61, 0.95);
    cap["fleet-pause"] = ball(g, 0.075, 2.2, 1.03, 0.61, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "fleet pause", 2.2, 1.3, 0.61, { css: "#4fd1ff", w: 0.31799999999999995 });
    reg(hits, cap["fleet-pause"], "fleet-pause");
    post(2.0, 1.07, 0.95);
    cap["zone-request"] = cyl(g, 0.07, 0.07, 0.12, 2.0, 1.01, 1.07, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "zone access request", 2.0, 1.3, 1.07, { css: "#4fd1ff", w: 0.46199999999999997 });
    reg(hits, cap["zone-request"], "zone-request");
    post(1.68, 1.47, 0.95);
    cap["unit-estop"] = box(g, 0.18, 0.14, 0.12, 1.68, 1.02, 1.47, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "robot e-stop", 1.68, 1.3, 1.47, { css: "#4fd1ff", w: 0.33599999999999997 });
    reg(hits, cap["unit-estop"], "unit-estop");
    cap["shrink-wrap"] = ball(g, 0.06, -1.6, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["shrink-wrap"], "shrink-wrap");
    cap["clean-bumper"] = ball(g, 0.06, -0.53, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["clean-bumper"], "clean-bumper");
    cap["missing-mirror"] = ball(g, 0.06, 0.53, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["missing-mirror"], "missing-mirror");
    cap["floor-arrow"] = ball(g, 0.06, 1.6, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["floor-arrow"], "floor-arrow");
    box(g, 3.8, 0.05, 0.4, 0, 0.55, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.55, 0.36, sx, 0.275, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    { const hz = group(g, -1.22, 0, 2.96, 2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("CUT\nACROSS", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "cut-across-hazard"); }
    { const hz = group(g, 1.22, 0, 2.96, -2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("RIDE\nIT", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "ride-the-robot-hazard"); }
    { const hz = group(g, -3.04, 0, -1.01, 1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("COVER\nIT", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "block-scanner-hazard"); }
    { const hz = group(g, 3.04, 0, -1.01, -1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("PUSH\nLIVE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "push-live-hazard"); }
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TRAFFIC PLAN · LANE A", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["People: walkways and marked crossings", "Robots: marked lanes only", "E-stop drill: every unit must stop", "Faulted unit: out of the fleet first"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "traffic-plan");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("FLEET LOG\nOPEN", { bg: "#11181f", accent: "#4fd1ff", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "fleet log", 0, 1.46, 0, { css: "#4fd1ff", w: 0.34 });
    reg(hits, logSign, "fleet-log");
    for (let i = 0; i < 36; i++) { const side = i % 2 ? 1 : -1; const k = Math.floor(i / 2); box(g, 0.34, 0.2, 0.3, side * 4.3, 0.3 + (k % 4) * 0.42, -5.6 + Math.floor(k / 4) * 0.42, [0x3a78c9, 0xf0b323, 0x59637a][i % 3], { rough: 0.7 }); }
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) box(g, 0.4, 0.03, 2.4, side * 4.3, 0.18 + k * 0.42, -4.6, 0x53585e, { rough: 0.6, metal: 0.4 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.9, 1.2, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(crew, "fleet lead", 0, 1.95, 0.15, { css: "#4fd1ff", w: 0.34 });
    const faultOn = /[?&]fault=estop-trip(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_AD_AMR_FLEET_TRAFFIC_AND_ESTOP_DRILL.steps.find((s) => s.id === "recover-select");
    const fDecl = SIM_AD_AMR_FLEET_TRAFFIC_AND_ESTOP_DRILL.faults[0];
    if (fStep) { fStep.target = faultOn ? fDecl.target : fDecl.from; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    faultLamp.visible = faultOn;
    if (faultOn) holoTag(g, "Unit 14: E-STOP TRIPPED", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 });
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "robot-leaves-lane") { faultLamp.visible = true; cap["fleet-pause"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "forklift-in-lane") { cap["zone-request"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "robot-leaves-lane") { faultLamp.visible = false; cap["fleet-pause"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "forklift-in-lane") { cap["zone-request"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "scanner-check") repaint(cap["scanner-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "closeout") repaint(logFace, signFace("FLEET LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "scanner-check") repaint(cap["scanner-meter"].userData.screen, signFace(gg.t > 0.43 && gg.t < 0.61 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.43 && gg.t < 0.61 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
