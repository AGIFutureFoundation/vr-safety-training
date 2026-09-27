import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  blockFace, tileFace, gratingFace, reg,
} from "../citykit.js";
import { cleanRoomBay } from "../../../shared/equipment.js";

import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cleanroom Gowning & ESD Discipline — its own gamified system:
// Clean and Grounded.
// 
// A generic aerospace depot cleanroom: gowning in the posted order, the
// strap and heel test proven at the tester, the part kept in shielding or
// on the grounded mat, and a stop the moment the path to ground is lost.
// No resistance range, particle class or time is stated here; they belong
// to the site's ESD control programme and the manufacturer's manual.
// ?fault=esd-alarm makes the tester read FAIL and the right next step a
// call to the lead instead of the bench.

const ORB1_ACCENT = 0x6fd3e8;

export const SIM_AD_CLEANROOM_GOWNING_AND_ESD_DISCIPLINE = {
  id: "ad-cleanroom-gowning-and-esd-discipline",
  index: "ad-1",
  domain: "Aerospace",
  trade: "Aerospace assembly technician, cleanroom and ESD control — IAM/UAW",
  category: "Manufacturing & Automation",
  district: "aerospace-depot",
  weather: "overcast",
  certification: "IAM and UAW aerospace assembly training as bodies; OSHA 29 CFR 1910.132 personal protective equipment and 29 CFR 1910.133 eye and face protection; NFPA 77 static electricity; the site's written ESD control programme and gowning procedure",
  name: "Cleanroom Gowning & ESD Discipline",
  title: simTitle("Cleanroom Gowning & ESD Discipline"),
  tagline: "A cleanroom entry run the way contamination and static control actually work: gown in the posted order, prove the wrist strap and heel straps at the tester before touching anything, keep the part on the grounded mat, and stop the job the moment the tester says the path to ground is gone",
  accent: ORB1_ACCENT,
  accentCss: "#6fd3e8",
  parSeconds: 320,
  footprint: 2.9,
  badge: {"id": "clean-and-grounded", "name": "Clean and Grounded", "note": "Gowned in order, proved the path to ground at the tester and never handled the part off the grounded mat"},

  game: system({
    name: "Clean and Grounded",
    currency: "GOWN",
    ranks: ["Visitor", "Gowning Qualified", "ESD Qualified", "Cleanroom Lead", "Clean and Grounded Certified"],
    badges: [
      { id: "tested-first", name: "Tested First", note: "Proved the wrist strap and heel straps before touching the part", test: AWARD.stepClean("strap-test") },
      { id: "no-bare-touch", name: "No Bare Touch", note: "Never handled the part off the grounded mat", test: AWARD.safe },
      { id: "steady-hands", name: "Steady Hands", note: "Held the part level on the mat through the whole transfer", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-gown", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-entry", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your IAM or UAW local's member assistance programme, or the site's employee assistance line if a near miss in the bay is what stayed with you",

  faults: [{"id": "esd-alarm", "label": "ESD tester: FAIL", "step": "strap-verdict", "target": "lead-call", "note": "The tester just read FAIL on the wrist strap. Do not go to the bench: call the lead and swap the strap before anything else.", "from": "bench-mat", "cue": "With a PASS at the tester, go to the grounded mat on the bench."}],

  hazards: {"skip-tester-hazard": "That walks to the bench without testing the wrist strap and heel straps. A strap that looks fine can have a broken conductor inside it, and a person charged up by walking across the floor discharges into the first part they touch without ever feeling it.", "bare-bench-hazard": "That sets the part down on the bare steel of the bench beside the mat. An unprotected part on an ungrounded or insulating surface can take a static discharge it never recovers from, and the damage may not show until the part fails in service.", "gown-out-of-order-hazard": "That pulls the coverall on over street shoes before the booties. Gowning out of order drags the floor's particles up onto the outside of the garment, which is exactly the surface the cleanroom exists to keep clean.", "open-tote-hazard": "That carries the part out of its shielded tote across the room. Outside the tote and away from the mat, the part is exposed to every charged surface and every particle between the door and the bench."},

  lateNotes: {"tester-plate": "The strap test happens before the bench, every entry, not once a shift.", "wrist-strap": "The wrist strap sits snug on skin, not over a sleeve, before the tester is even tried."},

  interrupts: [{"id": "ground-snap-pops", "kind": "Path to ground lost", "after": "transfer-part", "delay": 4, "seconds": 11, "alert": "The wrist strap's coiled cord has popped off the bench ground snap mid-transfer — the continuity monitor is chirping.", "cue": "Stop the transfer now, before the part moves any further with no path to ground.", "target": "bench-stop", "why": "The continuity monitor chirps because the one thing bleeding charge off this technician's body has just come loose, and every second the transfer carries on is a second the part is being handled by someone who is charging up again with every movement.", "missNote": "The transfer carried on with the strap off the snap. A part handled by an ungrounded technician can take a discharge that leaves no mark and fails it later.", "wrongNote": "Not that — the lost ground is what stops this transfer, nothing else first."}, {"id": "visitor-at-the-door", "kind": "Entry challenge", "after": "ionizer-hold", "delay": 4, "seconds": 11, "alert": "A visitor in street clothes has opened the air-shower door and is stepping into the bay.", "cue": "Call the lead so the visitor is stopped and gowned before coming further in.", "target": "lead-call", "why": "A single ungowned person walking into the bay carries in more particles and more charge than the whole shift's work generates, and the lead is the one who stops the entry and walks them back through the gowning order.", "missNote": "Nobody stopped the ungowned visitor. Every step they took into the bay undid the gowning everyone else had done.", "wrongNote": "That isn't it — the ungowned visitor at the door is what needs stopping first."}],

  steps: [
    {"id": "gown", "kind": "sequence", "anyOrder": false, "targets": ["bootie-bin", "hood-rack", "coverall-rack"], "itemNames": {"bootie-bin": "booties over shoes", "hood-rack": "hood and mask", "coverall-rack": "coverall zipped"}, "outOfOrderNote": "Out of order — gowning runs top-down on the posted card for a reason: booties at the bench line first here, then hood, then the coverall, so nothing from the floor rides up the outside.", "title": "Gown in the posted order", "cue": "Booties at the bench line, then hood and mask, then the coverall.", "why": "The gowning order exists so that each layer goes on without dragging the dirt of the last one onto its clean outside surface — booties at the bench line keep street shoes from ever touching the clean side, and the hood goes under the coverall collar so hair and skin stay sealed in."},
    {"id": "brief", "kind": "select", "target": "entry-card", "title": "Read the entry card", "cue": "Confirm the part, the bench and the ESD rules posted for today's job.", "why": "The entry card is what says which part is in work, which bench it belongs on and whether today's job needs anything beyond the standing rules — walking in without it means handling a sensitive part on assumptions nobody signed off."},
    {"id": "air-shower-pass", "kind": "select", "target": "air-shower", "title": "Pass through the air shower", "cue": "Stand through the full air-shower cycle before the inner door opens.", "why": "The air shower strips the loose particles the gowning room could not, and cutting the cycle short carries them straight onto the benches — the inner door waits on the cycle so the cleanest room in the building is never the one a hurry lets the dust into."},
    {"id": "strap-test", "kind": "sequence", "anyOrder": true, "targets": ["wrist-strap", "heel-straps", "tester-plate"], "itemNames": {"wrist-strap": "wrist strap on skin", "heel-straps": "heel straps on", "tester-plate": "stand on the tester plate"}, "title": "Test strap and heel straps", "cue": "Wrist strap snug on skin, heel straps on both shoes, then stand on the tester plate.", "why": "A wrist strap that is loose on a sleeve, or a heel strap tucked under a bootie, reads as protection and delivers none — the tester is the only thing in the room that proves the path from this person to ground is actually complete today."},
    {"id": "strap-verdict", "kind": "select", "target": "bench-mat", "title": "Go to the grounded mat", "cue": "With a PASS at the tester, go to the grounded mat on the bench.", "why": "Only a PASS earns the bench; a FAIL means the strap or the heel straps are not doing their job and the right move is to fix that first, because the damage a charged hand does to a sensitive part is invisible and often shows up only once the part is in service."},
    {"id": "mat-check", "kind": "gauge", "target": "mat-meter", "title": "Check the mat to ground", "cue": "Read the mat's ground check and commit only in the green band the site's procedure sets.", "why": "A dissipative mat with a lifted ground cord is just an insulating sheet with a nice colour, and the meter reading is what shows that this particular mat is still bleeding charge away rather than letting it build under the part.", "gauge": { label: "MAT TO GROUND", speed: 0.6, green: [0.42, 0.6], readout: (t) => (t > 0.42 && t < 0.6 ? "grounded" : "check cord"), missNote: "Not in the green — recheck the mat's ground cord before any part comes out of its tote." }},
    {"id": "carry-tote", "kind": "drag", "target": "part-tote", "drag": {"to": "ground-snap", "radius": 0.4, "missNote": "Not at the bench — set the shielded tote down beside the grounded mat before opening it."}, "title": "Bring the part in its tote", "cue": "Carry the shielded tote to the bench and set it beside the mat before it opens.", "why": "The shielded tote is the part's protection everywhere outside the grounded mat, and it only opens once it is sitting on the bench beside the mat — the part never travels across the room naked, however short the walk looks."},
    {"id": "transfer-part", "kind": "track", "target": "transfer-meter", "seconds": 8, "title": "Transfer the part to the mat", "cue": "Keep the part level and low over the mat as it comes out of the tote.", "why": "A part lifted high or swung across the bench is a part passing through charged air and past charged sleeves; keeping it level and low over the mat keeps it inside the one zone this room has made safe for it.", "track": { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "LEVEL OVER MAT", readout: (v) => (v < 0.4 ? "too low" : v > 0.62 ? "too high" : "level") }, "holdBreakNote": "The part drifted off level over the mat. Bring it back low and steady before setting it down."},
    {"id": "find-charge-source", "kind": "find", "noHint": true, "targets": ["foam-cup"], "itemNames": {"foam-cup": "foam cup on the bench"}, "itemNotes": {"foam-cup": "A foam cup is one of the most chargeable things a person can carry into a bay; it comes off the bench and out of the room."}, "decoyNotes": {"static-shield-bag": "A static-shielding bag, where it belongs. Nothing to flag there."}, "title": "Find the charge source", "cue": "Look along the shelf for the thing that has no business near a sensitive part.", "why": "Insulating plastics hold charge that no wrist strap can bleed off, because they are not connected to anything — a foam cup or a plain plastic bag near the mat can charge a part by induction without ever touching it."},
    {"id": "ionizer-hold", "kind": "hold", "target": "ionizer-switch", "seconds": 5, "title": "Run the bench ionizer", "cue": "Hold the ionizer on while the insulating fixture is neutralised.", "why": "Some things on the bench cannot be grounded because they insulate, and the ionizer is how their charge is neutralised — held through its full cycle, not waved at the fixture for a second on the way to the next task.", "holdBreakNote": "Released the ionizer early. Hold it through the full cycle the procedure sets before the fixture goes near the part."},
    {"id": "sign-traveller", "kind": "select", "target": "traveller-card", "title": "Sign the traveller", "cue": "Record the strap test, the mat check and the handling on the part's traveller.", "why": "The traveller is what the next station and the quality inspector read, and a handling step that is not written down is a handling step nobody can prove was done under control if the part fails later."},
    {"id": "repack", "kind": "sequence", "anyOrder": true, "targets": ["shield-lid", "tote-label"], "itemNames": {"shield-lid": "shielded lid closed", "tote-label": "tote labelled"}, "title": "Repack the part", "cue": "Close the shielded lid and label the tote before it leaves the mat.", "why": "The part leaves the mat the same way it arrived, inside closed shielding — an open tote carried to the next station undoes all the control this bench just exercised, one charged sleeve at a time."},
    {"id": "find-lost-strap", "kind": "find", "noHint": true, "targets": ["cut-strap-cord"], "itemNames": {"cut-strap-cord": "nicked strap cord"}, "itemNotes": {"cut-strap-cord": "A nicked coil cord is the kind of failure that passes one day and fails the next; it is tagged out and replaced, not taped."}, "decoyNotes": {"spare-strap": "A spare strap, sealed and ready. Nothing to flag there."}, "title": "Check the strap cord", "cue": "Before you leave, find the strap cord that should not go back on the rack.", "why": "A damaged cord hung back on the rack becomes somebody else's failed test tomorrow — or worse, a test that passes intermittently — and taking it out of service now is how the next entry starts with a strap that works."},
    {"id": "closeout", "kind": "select", "target": "entry-log", "title": "Close the entry log", "cue": "Log the test result, the handling and the tagged cord before you degown.", "why": "The entry log ties this person's strap test to this part's handling at this time, which is exactly the record anyone investigating a failed part will ask for, and it closes before degowning while the details are still in front of you."},
  ],

  build(root) {
    const ACC = ORB1_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floorMesh = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floorMesh.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc9ced2, grout: "#8a9094" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wallMesh = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wallMesh.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7d8790 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const trayMesh = box(g, 1.4, 0.03, 0.8, 3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    trayMesh.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "depot cleanroom, bay 1", -3.8, 3.7, -7.05, { css: "#6fd3e8", w: 0.5 });
    const rig = cleanRoomBay(g, 0, 0, -4.4, {});
    const P = rig.userData.parts;
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    post(-1.68, 1.47, 0.95);
    cap["bootie-bin"] = box(g, 0.18, 0.14, 0.12, -1.68, 1.02, 1.47, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "booties over shoes", -1.68, 1.3, 1.47, { css: "#6fd3e8", w: 0.44399999999999995 });
    reg(hits, cap["bootie-bin"], "bootie-bin");
    post(-2.02, 1.05, 0.95);
    cap["hood-rack"] = ball(g, 0.075, -2.02, 1.03, 1.05, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "hood and mask", -2.02, 1.3, 1.05, { css: "#6fd3e8", w: 0.354 });
    reg(hits, cap["hood-rack"], "hood-rack");
    post(-2.21, 0.56, 0.95);
    cap["coverall-rack"] = cyl(g, 0.07, 0.07, 0.12, -2.21, 1.01, 0.56, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "coverall zipped", -2.21, 1.3, 0.56, { css: "#6fd3e8", w: 0.38999999999999996 });
    reg(hits, cap["coverall-rack"], "coverall-rack");
    post(-2.24, 0.04, 0.95);
    cap["air-shower"] = box(g, 0.18, 0.14, 0.12, -2.24, 1.02, 0.04, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "air shower", -2.24, 1.3, 0.04, { css: "#6fd3e8", w: 0.3 });
    reg(hits, cap["air-shower"], "air-shower");
    post(-2.11, -0.46, 0.95);
    cap["wrist-strap"] = ball(g, 0.075, -2.11, 1.03, -0.46, 0x59637a, { rough: 0.45, seg: 12 });
    holoTag(g, "wrist strap on skin", -2.11, 1.3, -0.46, { css: "#6fd3e8", w: 0.46199999999999997 });
    reg(hits, cap["wrist-strap"], "wrist-strap");
    post(-1.83, -0.92, 0.95);
    cap["heel-straps"] = cyl(g, 0.07, 0.07, 0.12, -1.83, 1.01, -0.92, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(g, "heel straps on", -1.83, 1.3, -0.92, { css: "#6fd3e8", w: 0.372 });
    reg(hits, cap["heel-straps"], "heel-straps");
    post(-1.41, -1.29, 0.95);
    cap["tester-plate"] = box(g, 0.18, 0.14, 0.12, -1.41, 1.02, -1.29, 0xf0b323, { rough: 0.5 });
    holoTag(g, "ESD tester", -1.41, 1.3, -1.29, { css: "#6fd3e8", w: 0.3 });
    reg(hits, cap["tester-plate"], "tester-plate");
    post(-0.89, -1.56, 0.95);
    cap["bench-mat"] = ball(g, 0.075, -0.89, 1.03, -1.56, 0x3a78c9, { rough: 0.45, seg: 12 });
    holoTag(g, "grounded mat", -0.89, 1.3, -1.56, { css: "#6fd3e8", w: 0.33599999999999997 });
    reg(hits, cap["bench-mat"], "bench-mat");
    post(-0.3, -1.7, 0.95);
    cap["mat-meter"] = instrument(g, -0.3, 0.97, -1.7, { ry: 0.14, idle: "--", color: ACC });
    holoTag(g, "mat meter", -0.3, 1.3, -1.7, { css: "#6fd3e8", w: 0.282 });
    reg(hits, cap["mat-meter"], "mat-meter");
    post(0.3, -1.7, 0.95);
    cap["part-tote"] = box(g, 0.18, 0.14, 0.12, 0.3, 1.02, -1.7, 0x59637a, { rough: 0.5 });
    holoTag(g, "shielded part tote", 0.3, 1.3, -1.7, { css: "#6fd3e8", w: 0.44399999999999995 });
    reg(hits, cap["part-tote"], "part-tote");
    post(0.89, -1.56, 0.95);
    cap["ground-snap"] = group(g, 0.89, 0.95, -1.56); box(cap["ground-snap"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["ground-snap"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "ground snap", 0.89, 1.3, -1.56, { css: "#6fd3e8", w: 0.31799999999999995 });
    reg(hits, cap["ground-snap"], "ground-snap");
    post(1.41, -1.29, 0.95);
    cap["transfer-meter"] = instrument(g, 1.41, 0.97, -1.29, { ry: -0.68, idle: "--", color: ACC });
    holoTag(g, "transfer meter", 1.41, 1.3, -1.29, { css: "#6fd3e8", w: 0.372 });
    reg(hits, cap["transfer-meter"], "transfer-meter");
    post(1.83, -0.92, 0.95);
    cap["ionizer-switch"] = box(g, 0.18, 0.14, 0.12, 1.83, 1.02, -0.92, 0x3a78c9, { rough: 0.5 });
    holoTag(g, "bench ionizer", 1.83, 1.3, -0.92, { css: "#6fd3e8", w: 0.354 });
    reg(hits, cap["ionizer-switch"], "ionizer-switch");
    post(2.11, -0.46, 0.95);
    cap["traveller-card"] = ball(g, 0.075, 2.11, 1.03, -0.46, 0xd8a63a, { rough: 0.45, seg: 12 });
    holoTag(g, "traveller card", 2.11, 1.3, -0.46, { css: "#6fd3e8", w: 0.372 });
    reg(hits, cap["traveller-card"], "traveller-card");
    post(2.24, 0.04, 0.95);
    cap["shield-lid"] = cyl(g, 0.07, 0.07, 0.12, 2.24, 1.01, 0.04, 0x59637a, { rough: 0.5, seg: 12 });
    holoTag(g, "shielded lid closed", 2.24, 1.3, 0.04, { css: "#6fd3e8", w: 0.46199999999999997 });
    reg(hits, cap["shield-lid"], "shield-lid");
    post(2.21, 0.56, 0.95);
    cap["tote-label"] = box(g, 0.18, 0.14, 0.12, 2.21, 1.02, 0.56, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "tote labelled", 2.21, 1.3, 0.56, { css: "#6fd3e8", w: 0.354 });
    reg(hits, cap["tote-label"], "tote-label");
    post(2.02, 1.05, 0.95);
    cap["bench-stop"] = ball(g, 0.075, 2.02, 1.03, 1.05, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "stop the transfer", 2.02, 1.3, 1.05, { css: "#6fd3e8", w: 0.426 });
    reg(hits, cap["bench-stop"], "bench-stop");
    post(1.68, 1.47, 0.95);
    cap["lead-call"] = cyl(g, 0.07, 0.07, 0.12, 1.68, 1.01, 1.47, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "call the lead", 1.68, 1.3, 1.47, { css: "#6fd3e8", w: 0.354 });
    reg(hits, cap["lead-call"], "lead-call");
    cap["foam-cup"] = ball(g, 0.06, -1.6, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["foam-cup"], "foam-cup");
    cap["static-shield-bag"] = ball(g, 0.06, -0.53, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["static-shield-bag"], "static-shield-bag");
    cap["cut-strap-cord"] = ball(g, 0.06, 0.53, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["cut-strap-cord"], "cut-strap-cord");
    cap["spare-strap"] = ball(g, 0.06, 1.6, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["spare-strap"], "spare-strap");
    box(g, 3.8, 0.05, 0.4, 0, 0.55, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.55, 0.36, sx, 0.275, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    { const hz = group(g, -1.22, 0, 2.96, 2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SKIP\nTEST", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "skip-tester-hazard"); }
    { const hz = group(g, 1.22, 0, 2.96, -2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("BARE\nBENCH", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "bare-bench-hazard"); }
    { const hz = group(g, -3.04, 0, -1.01, 1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SUIT\nFIRST", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "gown-out-of-order-hazard"); }
    { const hz = group(g, 3.04, 0, -1.01, -1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("CARRY\nIT", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "open-tote-hazard"); }
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#6fd3e8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("ENTRY CARD · CLEANROOM", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Gowning order: per the posted procedure", "Strap and heel test before the bench", "Part stays on the grounded mat", "Tester fail = stop and report"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "entry-card");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("ENTRY LOG\nOPEN", { bg: "#11181f", accent: "#6fd3e8", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "entry log", 0, 1.46, 0, { css: "#6fd3e8", w: 0.34 });
    reg(hits, logSign, "entry-log");
    for (let i = 0; i < 36; i++) { const side = i % 2 ? 1 : -1; const k = Math.floor(i / 2); box(g, 0.34, 0.2, 0.3, side * 4.3, 0.3 + (k % 4) * 0.42, -5.6 + Math.floor(k / 4) * 0.42, [0x3a78c9, 0xf0b323, 0x59637a][i % 3], { rough: 0.7 }); }
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) box(g, 0.4, 0.03, 2.4, side * 4.3, 0.18 + k * 0.42, -4.6, 0x53585e, { rough: 0.6, metal: 0.4 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.7, -1.0, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(crew, "cleanroom lead", 0, 1.95, 0.15, { css: "#6fd3e8", w: 0.34 });
    const faultOn = /[?&]fault=esd-alarm(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_AD_CLEANROOM_GOWNING_AND_ESD_DISCIPLINE.steps.find((s) => s.id === "strap-verdict");
    const fDecl = SIM_AD_CLEANROOM_GOWNING_AND_ESD_DISCIPLINE.faults[0];
    if (fStep) { fStep.target = faultOn ? fDecl.target : fDecl.from; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    faultLamp.visible = faultOn;
    if (faultOn) holoTag(g, "ESD tester: FAIL", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 });
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "ground-snap-pops") { faultLamp.visible = true; cap["bench-stop"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "visitor-at-the-door") { cap["lead-call"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "ground-snap-pops") { faultLamp.visible = false; cap["bench-stop"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "visitor-at-the-door") { cap["lead-call"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "mat-check") repaint(cap["mat-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "closeout") repaint(logFace, signFace("ENTRY LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "mat-check") repaint(cap["mat-meter"].userData.screen, signFace(gg.t > 0.42 && gg.t < 0.6 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
