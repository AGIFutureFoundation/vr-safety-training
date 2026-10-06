import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  pavingFace, gratingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ceiling-Drilling Robot Set-Up — its own gamified system: Clear Below.
//
// ROBOPROG (docs/consoles/ROBOPROG.md, docs/robotics-programme.md): the construction-robotics track's robot station. A generic
// mobile ceiling-drilling robot (a tracked base, a mast and a drill head with a dust shroud) drills anchor holes in a concrete
// deck soffit from a layout. The crew sets it up the way the site's work plan and the maker's manual require: the deck scan
// read for embedded services, the work zone barricaded so nobody walks under the mast, the robot's position checked against
// control points, the drill's dust collection connected as the silica standard's table names for drilling, the bit changed
// only with the battery isolated, and the dust cleaned with a vacuum, never swept. No make, speed, depth or position
// tolerance is stated; those belong to the manual and the layout. ?fault=conduit-hit moves the conflict to another hole so
// the right answer is read from the scan, not remembered.

const RPCD_ACCENT = 0xffb35c;

export const SIM_RP_CONSTRUCTION_DRILLING_ROBOT_SETUP = {
  id: "rp-construction-drilling-robot-setup",
  index: "rp-3",
  domain: "Construction",
  trade: "Construction robot operator, ceiling-drilling robot for anchor layout — Carpenters/IBEW",
  category: "Construction & Structural Trades",
  weather: "overcast",
  certification: "Carpenters (UBC) and IBEW apprenticeship training as bodies; OSHA 29 CFR 1926.1153 respirable crystalline silica in construction (its Table 1 names the controls for drilling into concrete), 29 CFR 1926.416 electrical safety-related work practices and 29 CFR 1926.21 safety training and education; ANSI A10.9 concrete and masonry work; the robot maker's manual and the site's work plan for the deck",
  name: "Ceiling-Drilling Robot Set-Up",
  title: simTitle("Ceiling-Drilling Robot Set-Up"),
  tagline: "Setting up a mobile ceiling-drilling robot on a concrete deck: the scan for embedded conduit and tendons read before any hole, the work zone barricaded so nobody stands under the mast, the robot's position checked against control points, the drill's vacuum dust collection running, a bit changed only with the battery isolated, and the dust cleaned with a vacuum instead of a broom",
  accent: RPCD_ACCENT,
  accentCss: "#ffb35c",
  parSeconds: 320,
  footprint: 2.9,
  badge: { id: "clear-below", name: "Clear Below", note: "Read the deck scan, kept the zone under the mast clear, ran the dust collection and isolated the battery for every bit change" },

  game: system({
    name: "Clear Below",
    currency: "AN",
    ranks: ["Labour Hand", "Zone Keeper", "Robot Operator", "Layout Lead", "Clear Below Certified"],
    badges: [
      { id: "scan-first", name: "Scan First", note: "Read the deck scan before the robot moved", test: AWARD.stepClean("deck-scan") },
      { id: "zone-kept", name: "Zone Kept", note: "Stopped the robot when someone walked under the mast", test: AWARD.safe },
      { id: "steady-flow", name: "Steady Flow", note: "Held the vacuum flow near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-setup", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-setup", name: "Clean Set-Up", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your Carpenters or IBEW local's member assistance programme, or the site's employee assistance line, if a near miss on the deck is what stayed with you",

  faults: [{ id: "conduit-hit", label: "Deck scan: CHECK", step: "find-conflict", target: "hole-b", note: "Today the scan puts the embedded conduit under hole B, not hole C. Find the hole you must not drill.", from: "hole-c", cue: "Find the layout hole that lands on an embedded service in the scan." }],

  hazards: {
    "under-mast-hazard": "That walks under the raised mast to pick up a dropped anchor while the robot is drilling. The drill head, the bit and the concrete chips all come down from above, and the barricade exists so that nobody's head is ever where the robot is working.",
    "dry-sweep-hazard": "That sweeps the drilling dust into a pile with a broom. Concrete dust carries respirable crystalline silica, and dry sweeping lifts the finest part of it into the air the crew breathes; the cleanup is done with a vacuum fitted with a HEPA filter.",
    "live-bit-change-hazard": "That changes the drill bit with the battery still connected and the robot only paused. A paused robot can resume on a command from the tablet, and the hands on the bit are the closest thing to the motor when it does.",
    "skip-scan-hazard": "That starts drilling straight from the layout without reading the deck scan. A layout shows where the anchors should go, not what is already inside the slab, and a bit that finds a live conduit or a stressed tendon finds it the hard way.",
  },

  lateNotes: {
    "scan-report": "The deck scan is read against the layout before the robot drives to the first hole, every pour and every bay.",
    "barricade-stand": "The barricade goes up around the robot's whole reach before the mast rises, and stays until the mast is down.",
  },

  interrupts: [
    { id: "walker-under-mast", kind: "Person in zone", after: "enable-hold", delay: 3, seconds: 11, alert: "An electrician has ducked under the barricade tape and is walking toward the robot's mast to reach a ladder.", cue: "Press the remote e-stop now.", target: "remote-estop", why: "The robot has no idea a person has entered the zone under its mast; it will keep drilling and dropping chips on its programmed positions, and the remote e-stop in the operator's hand is the fastest way to make the drill head stop before the person arrives beneath it.", missNote: "The robot kept working with a person inside the barricade. A person in the zone is answered with the e-stop first, and the barricade checked second.", wrongNote: "Not that — someone under the barricade is answered with the remote e-stop." },
    { id: "vac-clog", kind: "Dust collection", after: "drill-track", delay: 3, seconds: 11, alert: "The vacuum's flow alarm has gone off: the filter is loading and dust is escaping round the shroud.", cue: "Stop the drill.", target: "drill-stop", why: "The silica table's control for drilling assumes the dust collector is actually pulling air, and a clogged filter means the shroud is now just a cup that lets dust out around the bit; stopping the drill until the filter is cleaned keeps the control the plan relied on true.", missNote: "The drill ran on with the vacuum alarm sounding. A dust control that has stopped working means the drilling stops too.", wrongNote: "Not that — a clogged dust collector is answered by stopping the drill." },
  ],

  steps: [
    { id: "work-plan", kind: "select", target: "work-plan-board", title: "Read the work plan for the deck", cue: "Read the work plan: the bay, the anchor layout, the robot's zone and who runs it.", why: "A drilling robot carries out a layout without judgement, so everything it should not do has to be settled in the plan first: which bay is ready, where the anchors go, how big the robot's zone is and which trained operator holds the controller, because nobody can renegotiate those once the mast is up." },
    { id: "deck-scan", kind: "select", target: "scan-report", title: "Read the deck scan", cue: "Read the scan of the slab for embedded conduit, tendons and rebar against the layout.", why: "The layout says where anchors should go, the scan says what is already inside the slab, and only the two read together tell the operator whether a hole will meet concrete or meet a live conduit, a post-tensioned tendon or a rebar mat that has to be avoided." },
    { id: "ppe-deck", kind: "sequence", anyOrder: true, targets: ["hardhat-deck", "glasses-deck", "ear-deck"], itemNames: { "hardhat-deck": "hard hat", "glasses-deck": "safety glasses", "ear-deck": "hearing protection" }, title: "Dress for overhead drilling", cue: "Hard hat, safety glasses and hearing protection.", why: "Overhead drilling sends chips and dust downward and fills a concrete bay with noise, so the hard hat, the glasses and the hearing protection are worn by everyone inside the work area, operator included, even though the robot is the one holding the drill." },
    { id: "barricade", kind: "drag", target: "barricade-stand", drag: { to: "zone-corner", radius: 0.4, missNote: "Not placed — set the barricade stand at the corner mark of the robot's reach." }, title: "Barricade the robot's reach", cue: "Carry the barricade stand to the corner mark so the tape encloses the robot's full reach.", why: "The zone under a drilling mast is the one place on the deck nobody should stand, and a barricade around the robot's whole reach is what makes that visible to trades who are busy with their own work and have never seen this robot before." },
    { id: "localise", kind: "gauge", target: "total-station", title: "Check the robot's position on the control points", cue: "Check the robot's position against the control points and commit only when the readout is in the green.", why: "The robot drills where it believes it is, so a position check against the site's control points is what links the holes to the layout; drilling from a wrong position puts every anchor in the wrong place and can move a hole onto the service the scan said to avoid.", gauge: { label: "POSITION", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "on control" : "re-check"), missNote: "Not in the green — the robot's position does not match the control points. Re-check before any hole." } },
    { id: "dust-shroud", kind: "select", target: "dust-shroud", title: "Connect the dust collection", cue: "Connect the drill's shroud to the vacuum dust collector and confirm it is running.", why: "Drilling into concrete makes respirable silica dust, and the silica standard's table pairs drilling with a dust collection system at the bit; a robot drilling dozens of holes in a row multiplies the dust, so the shroud and vacuum are connected and running before the first hole." },
    { id: "find-conflict", kind: "find", noHint: true, targets: ["hole-c"], target: "hole-c", itemNames: { "hole-c": "layout hole over embedded conduit" }, itemNotes: { "hole-c": "A layout hole that lands on an embedded service is removed from the robot's job and referred back for a new position; it is never drilled 'carefully'." }, decoyNotes: { "hole-a": "A hole clear of everything in the scan. It stays in the job.", "hole-b": "A hole near rebar but clear of conduit and tendons in the scan today. It stays in the job." }, title: "Find the hole you must not drill", cue: "Find the layout hole that lands on an embedded service in the scan.", why: "One conflicting hole is enough to cut a live conduit or damage a tendon, and the robot will drill it as readily as any other; taking that position out of the job before the robot starts is how the scan's warning reaches the drill." },
    { id: "enable-hold", kind: "hold", target: "enable-pad", seconds: 5, title: "Hold enable while it drives to hole one", cue: "Hold the controller's enable while the robot drives to the first position.", why: "The robot travels under the operator's continuous permission, so holding enable while it drives keeps a person watching the whole move, ready to let go if a cable, a pallet or a person turns up in its path between the staging area and the first hole.", holdBreakNote: "Let go before the robot reached its position. Hold enable until it stops." },
    { id: "drill-track", kind: "track", target: "vac-flow-meter", seconds: 8, title: "Watch the vacuum flow through the first holes", cue: "Keep the dust collector's flow inside the band while the first holes are drilled.", why: "The dust control works only while the vacuum is pulling enough air at the shroud, and watching the flow through the first holes is how the operator learns whether the filter, the hose and the seal are good enough for the rest of the bay before the dust tells them otherwise.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "VAC FLOW", readout: (v) => (v < 0.4 ? "low flow" : v > 0.62 ? "seal lifted" : "in band") }, holdBreakNote: "The flow left the band. Stop, check the filter and the shroud seal, then resume." },
    { id: "bit-change", kind: "sequence", anyOrder: false, targets: ["drill-stop", "battery-isolator", "bit-holder"], itemNames: { "drill-stop": "drill stopped and mast lowered", "battery-isolator": "battery isolated and locked", "bit-holder": "bit changed" }, outOfOrderNote: "Out of order — stop and lower first, isolate and lock the battery, then change the bit.", title: "Change the bit the safe way", cue: "Stop the drill and lower the mast, isolate and lock the battery, then change the bit.", why: "A worn bit is changed with hands right at the drill head, so the energy behind it has to be gone, not paused: the mast comes down to a reachable height, the battery isolator is opened and locked so the tablet cannot restart it, and only then does anyone touch the chuck." },
    { id: "hepa-clean", kind: "select", target: "hepa-vac", title: "Clean up with the HEPA vacuum", cue: "Clean the dust on the deck and the robot with the HEPA-filtered vacuum.", why: "The dust that escaped is still silica on the floor and on the robot, and a broom or compressed air puts it straight back into the air; a vacuum with a HEPA filter is how the crew cleans without undoing the dust control they ran all shift." },
    { id: "handover", kind: "select", target: "handover-log", title: "Log the as-drilled holes", cue: "Log the holes drilled, the one removed for the conduit, and the bit changes for the foreperson.", why: "The anchors will be loaded by another crew who never saw the scan, so the as-drilled record, with the removed hole and the reason, is how the conflict and the work done reach them; the robot keeps its own log, but the foreperson signs the one people read." },
  ],

  build(root) {
    const ACC = RPCD_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const ground = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.85 });
    ground.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {}), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.02, color: 0xffffff });
    const walk = box(g, 2.2, 0.03, 0.9, -3.2, 0.13, 3.3, 0xffffff, { rough: 0.7, cast: false });
    walk.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "concrete deck bay — procedural, generic drilling robot", -2.4, 3.9, -7.05, { css: "#ffb35c", w: 0.66 });
    // the deck soffit overhead on columns
    const soffit = box(g, 8.6, 0.25, 5.0, 0, 3.6, -4.4, 0xb8b4ac, { rough: 0.95 });
    for (const x of [-4.0, 0, 4.0]) for (const z of [-6.6, -2.2]) box(g, 0.4, 3.5, 0.4, x, 1.75, z, 0xa9a59d, { rough: 0.9 });
    for (let i = 0; i < 8; i++) box(g, 0.06, 0.06, 4.8, -3.5 + i, 3.45, -4.4, 0x7a6a5a, { rough: 0.8 });
    // the robot: tracked base, mast, drill head with dust shroud
    const robot = group(g, 0.2, 0, -4.0);
    box(robot, 1.0, 0.35, 0.7, 0, 0.32, 0, 0xf0a030, { rough: 0.5 });
    for (const sz of [-0.38, 0.38]) box(robot, 1.1, 0.22, 0.14, 0, 0.14, sz, 0x2b2f34, { rough: 0.7 });
    box(robot, 0.36, 0.3, 0.3, -0.25, 0.65, 0, 0x2b2f34, { rough: 0.5 });
    const mast = group(robot, 0.2, 0.5, 0);
    box(mast, 0.16, 2.2, 0.16, 0, 1.1, 0, 0xd8dde2, { rough: 0.4, metal: 0.5 });
    box(mast, 0.12, 1.6, 0.12, 0, 2.6, 0, 0xc0c6cc, { rough: 0.4, metal: 0.5 });
    const head = group(mast, 0, 3.0, 0);
    box(head, 0.3, 0.22, 0.24, 0, 0, 0, 0xf0a030, { rough: 0.5 });
    cyl(head, 0.09, 0.09, 0.14, 0, 0.17, 0, 0x3b4148, { rough: 0.6, seg: 12 });
    cyl(head, 0.012, 0.012, 0.18, 0, 0.3, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6 });
    const hose = cyl(g, 0.04, 0.04, 2.2, 1.4, 1.2, -4.0, 0x2b2f34, { rough: 0.7, seg: 8 }); hose.rotation.z = 0.9;
    // the vacuum dust collector, a pallet of anchors, ladders
    box(g, 0.6, 0.8, 0.5, 2.4, 0.4, -4.4, 0xd2312b, { rough: 0.5 });
    cyl(g, 0.2, 0.2, 0.3, 2.4, 0.95, -4.4, 0x6d767e, { rough: 0.5, seg: 12 });
    for (let i = 0; i < 12; i++) box(g, 0.3, 0.16, 0.22, -3.9 + (i % 4) * 0.32, 0.2 + Math.floor(i / 4) * 0.17, -5.6, [0x6d767e, 0xb08a4a, 0x3a78c9][i % 3], { rough: 0.8 });
    box(g, 1.4, 0.12, 1.0, -3.4, 0.06, -5.6, 0x8a6a3a, { rough: 0.9 });
    for (const sx of [-0.2, 0.2]) box(g, 0.05, 2.4, 0.05, 3.8 + sx, 1.2, -6.2, 0xf0b323, { rough: 0.6 });
    for (let i = 0; i < 7; i++) box(g, 0.45, 0.04, 0.04, 3.8, 0.3 + i * 0.32, -6.2, 0xf0b323, { rough: 0.6 });
    // layout marks on the soffit (the find targets) and the scan conflict marks
    const cap = {};
    const hole = (id, x, z) => { const h = cyl(g, 0.09, 0.09, 0.03, x, 3.46, z, 0x1d4f7a, { rough: 0.5, seg: 12 }); cap[id] = h; reg(hits, h, id); holoTag(g, id.replace("hole-", "hole ").toUpperCase(), x, 3.2, z, { css: "#ffb35c", w: 0.22 }); };
    hole("hole-a", -1.4, -3.4);
    hole("hole-b", 0.0, -3.4);
    hole("hole-c", 1.4, -3.4);
    const conduitLine = box(g, 0.05, 0.02, 2.4, 1.4, 3.465, -4.0, 0xf0645b, { rough: 0.6 });
    // stands on the left and right arcs
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#ffb35c", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("scan-report", "deck scan", -1.68, 1.47, "box", 0x2b2f34);
    put("hardhat-deck", "hard hat", -2.09, 0.9, "ball", 0xf2f2f2);
    put("glasses-deck", "safety glasses", -2.25, 0.24, "box", 0x2b2f34);
    put("ear-deck", "hearing protection", -2.13, -0.42, "cyl", 0xf0b323);
    put("barricade-stand", "barricade stand", -1.74, -1.01, "cyl", 0xd2312b);
    cap["zone-corner"] = group(g, -1.14, 0.95, -1.45); post(-1.14, -1.45, 0.95);
    box(cap["zone-corner"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["zone-corner"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "zone corner mark", -1.14, 1.3, -1.45, { css: "#ffb35c", w: 0.4 }); reg(hits, cap["zone-corner"], "zone-corner");
    put("total-station", "position check", -0.4, -1.68, "meter");
    put("dust-shroud", "dust shroud + vacuum", 0.4, -1.68, "cyl", 0x6d767e);
    put("enable-pad", "controller enable", 1.14, -1.45, "ball", 0x59c97b);
    put("remote-estop", "remote e-stop", 1.74, -1.01, "cyl", 0xd2312b);
    put("vac-flow-meter", "vacuum flow", 2.13, -0.42, "meter");
    put("drill-stop", "stop drill, lower mast", 2.25, 0.24, "box", 0xf0b323);
    put("battery-isolator", "battery isolator + lock", 2.09, 0.9, "box", 0xd2312b);
    put("bit-holder", "drill bit", 1.68, 1.47, "cyl", 0xc0c6cc);
    put("hepa-vac", "HEPA vacuum", 2.9, 1.9, "box", 0x3a78c9);
    // barricade tape around the robot's reach
    for (const [x, z, w, d] of [[0.2, -2.6, 3.4, 0.02], [0.2, -5.4, 3.4, 0.02], [-1.5, -4.0, 0.02, 2.8], [1.9, -4.0, 0.02, 2.8]]) box(g, w, 0.03, d, x, 0.95, z, 0xd2312b, { rough: 0.6 });
    for (const [x, z] of [[-1.5, -2.6], [1.9, -2.6], [-1.5, -5.4], [1.9, -5.4]]) cyl(g, 0.03, 0.05, 1.0, x, 0.5, z, 0xf0b323, { rough: 0.6, seg: 8 });
    // hazard boards
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("under-mast-hazard", "UNDER\nMAST", -1.22, 2.96, 2.75);
    hazard("dry-sweep-hazard", "DRY\nSWEEP", 1.22, 2.96, -2.75);
    hazard("live-bit-change-hazard", "BIT CHANGE\nLIVE", -3.04, -1.01, 1.25);
    hazard("skip-scan-hazard", "SKIP\nSCAN", 3.04, -1.01, -1.25);
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,16,6,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#ffb35c"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fff4e6"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK PLAN · DECK DRILLING", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#e0c9a9";
      ["Bay: as released by the foreperson", "Anchors: from the layout, scan-checked", "Zone: barricade the robot's reach", "Operator: trained, holds the controller"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "work-plan-board");
    const logSign = group(g, 2.9, 0, 0.4, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("AS-DRILLED\nOPEN", { bg: "#1f160b", accent: "#ffb35c", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "as-drilled log", 0, 1.46, 0, { css: "#ffb35c", w: 0.34 });
    reg(hits, logSign, "handover-log");
    const dust = group(g, 0.4, 3.2, -4.0);
    for (let i = 0; i < 5; i++) ball(dust, 0.18 + (i % 2) * 0.08, (i - 2) * 0.2, -(i % 3) * 0.15, 0, 0xd9d4ca, { rough: 1, seg: 8 });
    dust.visible = false;
    const walker = standingFigure(g, -0.4, -3.4, { ry: 0.4, cloth: 0x3a4a5a, helmet: 0xf0b323 });
    walker.visible = false;
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const fore = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(fore, "foreperson", 0, 1.95, 0.15, { css: "#ffb35c", w: 0.3 });
    const faultOn = new URLSearchParams(globalThis.location?.search ?? "").get("fault") === "conduit-hit";
    const fStep = SIM_RP_CONSTRUCTION_DRILLING_ROBOT_SETUP.steps.find((s) => s.id === "find-conflict");
    const fDecl = SIM_RP_CONSTRUCTION_DRILLING_ROBOT_SETUP.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.target = fStep.targets[0]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { conduitLine.position.x = 0.0; holoTag(g, "Deck scan: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.4 }); }
    faultLamp.visible = faultOn;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.6, 3.6),
      onInterrupt(it) {
        if (it.id === "walker-under-mast") { walker.visible = true; faultLamp.visible = true; }
        if (it.id === "vac-clog") { dust.visible = true; cap["vac-flow-meter"].visible = true; cap["drill-stop"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "walker-under-mast") { walker.position.z += 2.2; faultLamp.visible = false; cap["remote-estop"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); }
        if (it.id === "vac-clog") { dust.visible = false; cap["drill-stop"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "localise") repaint(cap["total-station"].userData.screen, signFace("ON", { bg: "#1f160b", accent: "#59c97b", fg: "#ffe9cc", scale: 0.5 }));
        if (step.id === "find-conflict") cap[faultOn ? "hole-b" : "hole-c"].material = mat(0xd2312b, { rough: 0.5 });
        if (step.id === "bit-change") mast.position.y = 0.2;
        if (step.id === "handover") repaint(logFace, signFace("AS-DRILLED\nSIGNED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        fore.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        head.rotation.y = Math.sin(t * 0.8) * 0.2;
        if (dust.visible) dust.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06);
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "localise") repaint(cap["total-station"].userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "ON" : "OFF", { bg: "#1f160b", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#ffe9cc", scale: 0.5 }));
        if (soffit) soffit.visible = true;
      },
    };
  },
};
