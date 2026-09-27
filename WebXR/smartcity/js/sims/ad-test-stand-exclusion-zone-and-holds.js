import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  blockFace, tileFace, gratingFace, reg,
} from "../citykit.js";
import { testStand } from "../../../shared/equipment.js";

import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Test Stand Exclusion Zone & Holds — its own gamified system:
// Anyone Can Hold.
// 
// A generic propulsion test stand: the zone swept on foot and chained, a
// head count matched to the roster, the countdown polled from the bunker,
// a hold called by anyone with a reason, and the stand safed and locked
// before the zone opens. No engine, fuel, distance or time is stated; those
// are the site's test procedure's. ?fault=sensor-fault puts a stand sensor
// in fault and the right answer is a hold, not a go.

const ORB6_ACCENT = 0xff6b5e;

export const SIM_AD_TEST_STAND_EXCLUSION_ZONE_AND_HOLDS = {
  id: "ad-test-stand-exclusion-zone-and-holds",
  index: "ad-6",
  domain: "Aerospace",
  trade: "Test stand technician, exclusion zone and countdown holds — IAM/UAW",
  category: "Manufacturing & Automation",
  district: "aerospace-depot",
  weather: "overcast",
  certification: "IAM and UAW test and assembly training as bodies; OSHA 29 CFR 1910.147 the control of hazardous energy, 29 CFR 1910.95 occupational noise exposure, 29 CFR 1910.38 emergency action plans and 29 CFR 1910.132 personal protective equipment; ANSI Z535.4 safety signs; the site's written test procedure and the manufacturer's manual",
  name: "Test Stand Exclusion Zone & Holds",
  title: simTitle("Test Stand Exclusion Zone & Holds"),
  tagline: "A generic propulsion test run the way a test procedure keeps people alive: the exclusion zone swept and chained, a head count against the roster, the countdown run from the bunker with every station polled, and a hold called by anyone who sees a reason — then the stand made safe before anyone walks back out",
  accent: ORB6_ACCENT,
  accentCss: "#ff6b5e",
  parSeconds: 320,
  footprint: 2.9,
  badge: {"id": "anyone-can-hold", "name": "Anyone Can Hold", "note": "Swept and chained the zone, matched the head count and called the hold the moment a reason appeared"},

  game: system({
    name: "Anyone Can Hold",
    currency: "HOLD",
    ranks: ["Observer", "Zone Sweeper", "Test Technician", "Test Conductor", "Anyone Can Hold Certified"],
    badges: [
      { id: "count-matched", name: "Count Matched", note: "Matched the head count to the roster before the countdown", test: AWARD.stepClean("head-count") },
      { id: "zone-kept", name: "Zone Kept", note: "Never let the countdown run with the zone open", test: AWARD.safe },
      { id: "steady-poll", name: "Steady Poll", note: "Held the countdown poll near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-safe", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-test", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your IAM or UAW local's member assistance programme, or the site's employee assistance line if a near miss at the stand is what stayed with you",

  faults: [{"id": "sensor-fault", "label": "Stand sensor: FAULT", "step": "go-poll", "target": "hold-button", "note": "A stand sensor has gone to fault on the console. Do not give your go: call a hold.", "from": "go-button", "cue": "With your station ready, give your go on the net."}],

  hazards: {"shortcut-sweep-hazard": "That signs the sweep off from the bunker window without walking the zone. Somebody kneeling behind a cabinet or a vehicle parked in the lee of the deflector cannot be seen from the window.", "count-close-enough-hazard": "That starts the countdown with the head count one short because someone probably left early. An unmatched count means a person may be inside the zone, and the countdown waits until the count is a fact.", "walk-out-early-hazard": "That walks out to the stand before it has been made safe. The run ending is not the same as the stand holding no energy, and the procedure's safing steps are what make the walk out survivable.", "unhook-chain-hazard": "That unhooks the zone chain to let a vehicle through during the countdown. The chain is the zone; a gap in it is an invitation to the next person to walk through too."},

  lateNotes: {"zone-chain": "The zone is chained and posted before the countdown starts.", "sweep-lee": "The lee of the deflector is swept on foot, because the window cannot see into it."},

  interrupts: [{"id": "person-in-zone", "kind": "Zone breach", "after": "countdown-poll", "delay": 4, "seconds": 11, "alert": "The zone camera shows a person walking in past the chain during the countdown.", "cue": "Call a hold now.", "target": "hold-button", "why": "A person inside the zone during a countdown is exactly the situation the hold exists for, and anyone on the net can and must call it — the countdown can always restart, the person cannot be un-hurt.", "missNote": "The countdown kept running with a person inside the zone. A hold costs minutes; not calling it can cost a life.", "wrongNote": "Not that — a person in the zone is answered with a hold, first."}, {"id": "gate-left-open", "kind": "Zone challenge", "after": "safing-hold", "delay": 4, "seconds": 11, "alert": "A driver has unhooked the zone chain to bring a cart in before the stand is safed.", "cue": "Get the zone chain back up before anyone else walks through.", "target": "zone-chain", "why": "The stand is not safe until the procedure says so, and the chain is the only thing telling everybody outside that; putting it back up is what keeps the next person from following the driver in.", "missNote": "The chain stayed down before the stand was safed. The zone was open to anyone who walked past.", "wrongNote": "That isn't it — the open chain is what needs fixing first."}],

  steps: [
    {"id": "ppe", "kind": "sequence", "anyOrder": true, "targets": ["hearing-protection-ts", "safety-glasses-ts", "hi-vis-ts"], "itemNames": {"hearing-protection-ts": "hearing protection", "safety-glasses-ts": "safety glasses", "hi-vis-ts": "hi-vis vest"}, "title": "Suit up for the test area", "cue": "Hearing protection, safety glasses and hi-vis before the sweep.", "why": "A test area is loud even between runs and full of vehicles and cables, and the hi-vis is what lets the conductor pick out every person on the zone camera during the sweep, which is the whole point of sweeping."},
    {"id": "brief", "kind": "select", "target": "test-procedure", "title": "Read the test procedure", "cue": "Confirm the zone distance, the stations on the net and the hold rules.", "why": "The test procedure sets the exclusion zone, lists every station that must give a go and states who may call a hold, and a crew that has not read it is running somebody else's memory of a different test."},
    {"id": "sweep", "kind": "sequence", "anyOrder": true, "targets": ["sweep-north", "sweep-south", "sweep-lee"], "itemNames": {"sweep-north": "north sector swept", "sweep-south": "south sector swept", "sweep-lee": "deflector lee swept"}, "title": "Sweep the zone on foot", "cue": "Walk every sector of the zone, including the lee of the deflector.", "why": "The sweep is done on foot because the places a person is most likely to be missed — behind cabinets, under vehicles, in the lee of the deflector — are exactly the places a window or a camera cannot see into."},
    {"id": "chain-zone", "kind": "select", "target": "zone-chain", "title": "Chain and post the zone", "cue": "Chain the zone entry and hang the DANGER sign.", "why": "The chain and the sign turn the swept zone into a closed one, so that nobody arriving after the sweep walks in unaware, and the sign states the hazard in the standard format every worker is trained to read."},
    {"id": "head-count", "kind": "gauge", "target": "count-meter", "title": "Match the head count", "cue": "Read the head count against the roster and commit only when it matches.", "why": "A head count that matches the roster is the only evidence that everybody who came into the test area is now in the bunker, and a count that is one short is a reason to stop, not a rounding error.", "gauge": { label: "HEAD COUNT", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "matches roster" : "count short"), missNote: "The count does not match — find the missing person before the countdown starts." }},
    {"id": "go-poll", "kind": "select", "target": "go-button", "title": "Give your station's go", "cue": "With your station ready, give your go on the net.", "why": "Each station's go is a statement that its part of the test is ready and safe, and giving it only when that is true is what makes the poll mean something rather than being a round of habit."},
    {"id": "place-shield", "kind": "drag", "target": "blast-shutter", "drag": {"to": "window-dock", "radius": 0.4, "missNote": "Not closed — set the shutter over the bunker window before the countdown."}, "title": "Close the bunker shutter", "cue": "Carry the shutter to the bunker window and close it.", "why": "The shutter protects the people behind the window from anything the stand might throw if the run goes wrong, and it goes on before the countdown because nobody will have time to fit it during one."},
    {"id": "countdown-poll", "kind": "track", "target": "countdown-meter", "seconds": 8, "title": "Run the countdown poll", "cue": "Keep the countdown poll inside the band as each station reports.", "why": "A countdown poll that races skips stations and one that drags invites people to wander, and keeping it in the band means every station is heard and the net stays focused on the one thing that matters: whether to hold.", "track": { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "COUNTDOWN POLL", readout: (v) => (v < 0.4 ? "dragging" : v > 0.62 ? "racing" : "on pace") }, "holdBreakNote": "The poll left the band. Steady it before the next station reports."},
    {"id": "find-issue", "kind": "find", "noHint": true, "targets": ["unsecured-cable"], "itemNames": {"unsecured-cable": "unsecured cable across the zone"}, "itemNotes": {"unsecured-cable": "An unsecured cable across the zone is a trip for the recovery crew and can be thrown by the run; it is logged and secured."}, "decoyNotes": {"secured-conduit": "A conduit clamped to the pad. Nothing to flag there."}, "title": "Find the zone issue", "cue": "On the camera, find what should not be loose in the zone.", "why": "Anything loose in the zone can move during a run, and a cable left across the path is also what trips the first person walking back out, so it is found on the camera now rather than after."},
    {"id": "safing-hold", "kind": "hold", "target": "safing-switch", "seconds": 5, "title": "Safe the stand", "cue": "Hold the safing switch through the procedure's safing sequence.", "why": "The end of a run is not the end of the hazard; stored energy, hot surfaces and trapped pressure remain until the safing sequence has run, and holding the switch through the whole sequence is what lets the stand reach a state people can approach.", "holdBreakNote": "Released safing early. Hold it through the full sequence."},
    {"id": "lock-stand", "kind": "select", "target": "stand-lock", "title": "Lock out the stand", "cue": "Apply the lockout to the stand's control before the zone opens.", "why": "The lockout keeps the stand from being started while people are on the pad, turning the safing into a state nobody can undo by accident from the bunker."},
    {"id": "open-zone", "kind": "sequence", "anyOrder": true, "targets": ["all-clear", "chain-down"], "itemNames": {"all-clear": "all clear called", "chain-down": "chain lowered"}, "title": "Open the zone", "cue": "Call the all clear on the net, then lower the chain.", "why": "The all clear on the net is what tells every station the zone is open, and lowering the chain only after it means the physical barrier and the spoken one always agree."},
    {"id": "find-sign", "kind": "find", "noHint": true, "targets": ["faded-sign"], "itemNames": {"faded-sign": "faded DANGER sign"}, "itemNotes": {"faded-sign": "A faded DANGER sign is replaced; a sign nobody can read warns nobody."}, "decoyNotes": {"fresh-sign": "A DANGER sign in good order. Nothing to flag there."}, "title": "Check the signage", "cue": "Before you leave, find the sign that no longer does its job.", "why": "Zone signs weather in the sun and the exhaust, and a faded one is replaced now because the next crew will rely on it the same way this one did."},
    {"id": "closeout", "kind": "select", "target": "test-log", "title": "Close the test log", "cue": "Log the sweep, the count, any holds and the zone issues.", "why": "The test log is the record the next test and any investigation reads, and a hold that is logged with its reason teaches the whole site something, while one that is not is just a delay nobody remembers."},
  ],

  build(root) {
    const ACC = ORB6_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floorMesh = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floorMesh.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc9ced2, grout: "#8a9094" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wallMesh = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wallMesh.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7d8790 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const trayMesh = box(g, 1.4, 0.03, 0.8, 3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    trayMesh.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "depot test area, stand 1", -3.8, 3.7, -7.05, { css: "#ff6b5e", w: 0.5 });
    const rig = testStand(g, 0, 0, -4.6, {});
    const P = rig.userData.parts;
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    post(-1.68, 1.47, 0.95);
    cap["hearing-protection-ts"] = box(g, 0.18, 0.14, 0.12, -1.68, 1.02, 1.47, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "hearing protection", -1.68, 1.3, 1.47, { css: "#ff6b5e", w: 0.44399999999999995 });
    reg(hits, cap["hearing-protection-ts"], "hearing-protection-ts");
    post(-2.03, 1.02, 0.95);
    cap["safety-glasses-ts"] = ball(g, 0.075, -2.03, 1.03, 1.02, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "safety glasses", -2.03, 1.3, 1.02, { css: "#ff6b5e", w: 0.372 });
    reg(hits, cap["safety-glasses-ts"], "safety-glasses-ts");
    post(-2.22, 0.49, 0.95);
    cap["hi-vis-ts"] = cyl(g, 0.07, 0.07, 0.12, -2.22, 1.01, 0.49, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "hi-vis vest", -2.22, 1.3, 0.49, { css: "#ff6b5e", w: 0.31799999999999995 });
    reg(hits, cap["hi-vis-ts"], "hi-vis-ts");
    post(-2.23, -0.05, 0.95);
    cap["sweep-north"] = box(g, 0.18, 0.14, 0.12, -2.23, 1.02, -0.05, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "north sector swept", -2.23, 1.3, -0.05, { css: "#ff6b5e", w: 0.44399999999999995 });
    reg(hits, cap["sweep-north"], "sweep-north");
    post(-2.05, -0.58, 0.95);
    cap["sweep-south"] = ball(g, 0.075, -2.05, 1.03, -0.58, 0x59637a, { rough: 0.45, seg: 12 });
    holoTag(g, "south sector swept", -2.05, 1.3, -0.58, { css: "#ff6b5e", w: 0.44399999999999995 });
    reg(hits, cap["sweep-south"], "sweep-south");
    post(-1.71, -1.04, 0.95);
    cap["sweep-lee"] = cyl(g, 0.07, 0.07, 0.12, -1.71, 1.01, -1.04, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(g, "deflector lee swept", -1.71, 1.3, -1.04, { css: "#ff6b5e", w: 0.46199999999999997 });
    reg(hits, cap["sweep-lee"], "sweep-lee");
    post(-1.22, -1.4, 0.95);
    cap["zone-chain"] = box(g, 0.18, 0.14, 0.12, -1.22, 1.02, -1.4, 0xf0b323, { rough: 0.5 });
    holoTag(g, "zone chain", -1.22, 1.3, -1.4, { css: "#ff6b5e", w: 0.3 });
    reg(hits, cap["zone-chain"], "zone-chain");
    post(-0.64, -1.63, 0.95);
    cap["count-meter"] = instrument(g, -0.64, 0.97, -1.63, { ry: 0.29, idle: "--", color: ACC });
    holoTag(g, "count meter", -0.64, 1.3, -1.63, { css: "#ff6b5e", w: 0.31799999999999995 });
    reg(hits, cap["count-meter"], "count-meter");
    post(0.0, -1.71, 0.95);
    cap["go-button"] = cyl(g, 0.07, 0.07, 0.12, 0.0, 1.01, -1.71, 0xd8a63a, { rough: 0.5, seg: 12 });
    holoTag(g, "go button", 0.0, 1.3, -1.71, { css: "#ff6b5e", w: 0.282 });
    reg(hits, cap["go-button"], "go-button");
    post(0.64, -1.63, 0.95);
    cap["blast-shutter"] = box(g, 0.18, 0.14, 0.12, 0.64, 1.02, -1.63, 0x59637a, { rough: 0.5 });
    holoTag(g, "blast shutter", 0.64, 1.3, -1.63, { css: "#ff6b5e", w: 0.354 });
    reg(hits, cap["blast-shutter"], "blast-shutter");
    post(1.22, -1.4, 0.95);
    cap["window-dock"] = group(g, 1.22, 0.95, -1.4); box(cap["window-dock"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["window-dock"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "window dock", 1.22, 1.3, -1.4, { css: "#ff6b5e", w: 0.31799999999999995 });
    reg(hits, cap["window-dock"], "window-dock");
    post(1.71, -1.04, 0.95);
    cap["countdown-meter"] = instrument(g, 1.71, 0.97, -1.04, { ry: -0.86, idle: "--", color: ACC });
    holoTag(g, "countdown meter", 1.71, 1.3, -1.04, { css: "#ff6b5e", w: 0.38999999999999996 });
    reg(hits, cap["countdown-meter"], "countdown-meter");
    post(2.05, -0.58, 0.95);
    cap["safing-switch"] = box(g, 0.18, 0.14, 0.12, 2.05, 1.02, -0.58, 0x3a78c9, { rough: 0.5 });
    holoTag(g, "stand safing", 2.05, 1.3, -0.58, { css: "#ff6b5e", w: 0.33599999999999997 });
    reg(hits, cap["safing-switch"], "safing-switch");
    post(2.23, -0.05, 0.95);
    cap["stand-lock"] = ball(g, 0.075, 2.23, 1.03, -0.05, 0xd8a63a, { rough: 0.45, seg: 12 });
    holoTag(g, "stand lock", 2.23, 1.3, -0.05, { css: "#ff6b5e", w: 0.3 });
    reg(hits, cap["stand-lock"], "stand-lock");
    post(2.22, 0.49, 0.95);
    cap["all-clear"] = cyl(g, 0.07, 0.07, 0.12, 2.22, 1.01, 0.49, 0x59637a, { rough: 0.5, seg: 12 });
    holoTag(g, "all clear called", 2.22, 1.3, 0.49, { css: "#ff6b5e", w: 0.408 });
    reg(hits, cap["all-clear"], "all-clear");
    post(2.03, 1.02, 0.95);
    cap["chain-down"] = box(g, 0.18, 0.14, 0.12, 2.03, 1.02, 1.02, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "chain lowered", 2.03, 1.3, 1.02, { css: "#ff6b5e", w: 0.354 });
    reg(hits, cap["chain-down"], "chain-down");
    post(1.68, 1.47, 0.95);
    cap["hold-button"] = ball(g, 0.075, 1.68, 1.03, 1.47, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "call a hold", 1.68, 1.3, 1.47, { css: "#ff6b5e", w: 0.31799999999999995 });
    reg(hits, cap["hold-button"], "hold-button");
    cap["unsecured-cable"] = ball(g, 0.06, -1.6, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["unsecured-cable"], "unsecured-cable");
    cap["secured-conduit"] = ball(g, 0.06, -0.53, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["secured-conduit"], "secured-conduit");
    cap["faded-sign"] = ball(g, 0.06, 0.53, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["faded-sign"], "faded-sign");
    cap["fresh-sign"] = ball(g, 0.06, 1.6, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["fresh-sign"], "fresh-sign");
    box(g, 3.8, 0.05, 0.4, 0, 0.55, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.55, 0.36, sx, 0.275, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    { const hz = group(g, -1.22, 0, 2.96, 2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("WINDOW\nSWEEP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "shortcut-sweep-hazard"); }
    { const hz = group(g, 1.22, 0, 2.96, -2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("CLOSE\nENOUGH", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "count-close-enough-hazard"); }
    { const hz = group(g, -3.04, 0, -1.01, 1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("WALK\nOUT", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "walk-out-early-hazard"); }
    { const hz = group(g, 3.04, 0, -1.01, -1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("UNHOOK", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "unhook-chain-hazard"); }
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#ff6b5e"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TEST PROCEDURE · STAND 1", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Zone distance: per the test procedure", "Sweep, chain and post the zone", "Head count against the roster", "Anyone may call a hold"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "test-procedure");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("TEST LOG\nOPEN", { bg: "#11181f", accent: "#ff6b5e", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "test log", 0, 1.46, 0, { css: "#ff6b5e", w: 0.34 });
    reg(hits, logSign, "test-log");
    for (let i = 0; i < 36; i++) { const side = i % 2 ? 1 : -1; const k = Math.floor(i / 2); box(g, 0.34, 0.2, 0.3, side * 4.3, 0.3 + (k % 4) * 0.42, -5.6 + Math.floor(k / 4) * 0.42, [0x3a78c9, 0xf0b323, 0x59637a][i % 3], { rough: 0.7 }); }
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) box(g, 0.4, 0.03, 2.4, side * 4.3, 0.18 + k * 0.42, -4.6, 0x53585e, { rough: 0.6, metal: 0.4 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.9, 0.6, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(crew, "test conductor", 0, 1.95, 0.15, { css: "#ff6b5e", w: 0.34 });
    const faultOn = /[?&]fault=sensor-fault(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_AD_TEST_STAND_EXCLUSION_ZONE_AND_HOLDS.steps.find((s) => s.id === "go-poll");
    const fDecl = SIM_AD_TEST_STAND_EXCLUSION_ZONE_AND_HOLDS.faults[0];
    if (fStep) { fStep.target = faultOn ? fDecl.target : fDecl.from; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    faultLamp.visible = faultOn;
    if (faultOn) holoTag(g, "Stand sensor: FAULT", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 });
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "person-in-zone") { faultLamp.visible = true; cap["hold-button"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "gate-left-open") { cap["zone-chain"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "person-in-zone") { faultLamp.visible = false; cap["hold-button"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "gate-left-open") { cap["zone-chain"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "head-count") repaint(cap["count-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "closeout") repaint(logFace, signFace("TEST LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "head-count") repaint(cap["count-meter"].userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
