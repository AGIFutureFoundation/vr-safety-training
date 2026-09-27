import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  blockFace, tileFace, gratingFace, reg,
} from "../citykit.js";
import { depotHangarBay } from "../../../shared/equipment.js";

import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hazardous Fluid Servicing with a Buddy — its own gamified
// system: Two-Person Rule.
// 
// A generic depot servicing task on the fluid the work order names: the
// SDS read first, PPE from the sheet checked by a buddy, the eyewash
// proven, a controlled transfer over a drip pan, and a leak answered at
// the shut-off. No fluid, quantity, pressure or exposure limit is stated;
// those are the work order's and the SDS's. ?fault=leak-detect makes the
// detector alarm and the right answer the shut-off, not the connection.

const ORB5_ACCENT = 0x9be15d;

export const SIM_AD_HAZARDOUS_FLUID_SERVICING_WITH_A_BUDDY = {
  id: "ad-hazardous-fluid-servicing-with-a-buddy",
  index: "ad-5",
  domain: "Aerospace",
  trade: "Depot servicing technician, hazardous fluid servicing — IAM",
  category: "Mobility & Transit",
  district: "aerospace-depot",
  weather: "overcast",
  certification: "IAM depot maintenance training as a body; FAA 14 CFR 43 maintenance as the civil frame; OSHA 29 CFR 1910.1200 hazard communication, 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.134 respiratory protection and 29 CFR 1910.151 medical services and first aid; ANSI Z358.1 emergency eyewash and shower equipment; the safety data sheet for the fluid named on the work order",
  name: "Hazardous Fluid Servicing with a Buddy",
  title: simTitle("Hazardous Fluid Servicing with a Buddy"),
  tagline: "A servicing task on a fluid the work order names, run the way hazard communication intends: the safety data sheet read first, the PPE it calls for donned and checked by a buddy, the eyewash proven, the transfer made over a drip pan with the buddy watching, and a leak answered by stopping, not by finishing faster",
  accent: ORB5_ACCENT,
  accentCss: "#9be15d",
  parSeconds: 320,
  footprint: 2.9,
  badge: {"id": "two-person-rule", "name": "Two-Person Rule", "note": "Read the SDS, had the PPE checked by a buddy, proved the eyewash and stopped on the first sign of a leak"},

  game: system({
    name: "Two-Person Rule",
    currency: "SDS",
    ranks: ["Helper", "HazCom Trained", "Servicing Technician", "Servicing Lead", "Two-Person Rule Certified"],
    badges: [
      { id: "sds-first", name: "SDS First", note: "Read the safety data sheet before the cart was opened", test: AWARD.stepClean("sds-read") },
      { id: "buddy-watched", name: "Buddy Watched", note: "Never made the transfer without the buddy in place", test: AWARD.safe },
      { id: "steady-flow", name: "Steady Flow", note: "Held the transfer flow near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-service", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-service", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your IAM local's member assistance programme, or the depot's employee assistance line if an exposure or a near miss is what stayed with you",

  faults: [{"id": "leak-detect", "label": "Leak detector: ALARM", "step": "connect-select", "target": "cart-valve", "note": "The leak detector under the cart is alarming. Do not connect: close the cart shut-off first and find the leak.", "from": "service-coupling", "cue": "Connect the servicing line to the port with the buddy watching."}],

  hazards: {"solo-service-hazard": "That starts the transfer while the buddy is away at the crib. The buddy is there for the moment something goes wrong, and that moment does not wait for them to come back.", "no-sds-hazard": "That opens the cart from memory without reading the safety data sheet. The sheet is what says which gloves, which eye and face protection and which first aid this particular fluid needs, and memory of a different fluid is not the same thing.", "wipe-with-rag-hazard": "That wipes the leak up with a shop rag bare-handed. A fluid the SDS says needs chemical gloves does not become safe because the spill is small.", "cap-off-hazard": "That leaves the servicing port cap off to save time later. An open port lets the fluid out and contamination in, and it is the kind of small omission a pre-flight walk-round is not designed to catch."},

  lateNotes: {"sds-binder": "The safety data sheet is read before the cart is opened, every time, for the fluid actually named on the work order.", "chem-gloves": "The glove material is the one the SDS names, checked by the buddy before the cart opens."},

  interrupts: [{"id": "fitting-weeps", "kind": "Leak", "after": "transfer-flow", "delay": 4, "seconds": 11, "alert": "The servicing fitting has started to weep fluid onto the drip pan mid-transfer.", "cue": "Close the cart shut-off now.", "target": "cart-valve", "why": "A weeping fitting under pressure only gets worse, and closing the cart shut-off stops the supply at its source before the leak becomes a spray, which is the one outcome the PPE and the drip pan are least able to handle.", "missNote": "The transfer carried on with the fitting weeping. A leak under flow is stopped at the source first and understood second.", "wrongNote": "Not that — the weeping fitting is answered at the cart shut-off."}, {"id": "buddy-called-away", "kind": "Buddy challenge", "after": "hold-pressure-check", "delay": 4, "seconds": 11, "alert": "Your buddy is being called away to another aircraft while the port is still open.", "cue": "Call your buddy back until the port is capped.", "target": "buddy-call", "why": "The two-person rule holds until the port is capped and the fluid is contained, not until the busiest part looks finished, and the buddy stays until that point because the risky moment is whenever something unexpected happens.", "missNote": "The buddy walked away with the port still open. The work carried on under a rule that no longer had two people in it.", "wrongNote": "That isn't it — the buddy leaving is what needs stopping."}],

  steps: [
    {"id": "sds-read", "kind": "select", "target": "sds-binder", "title": "Read the safety data sheet", "cue": "Read the SDS for the fluid named on the work order before anything else.", "why": "The safety data sheet is the manufacturer's statement of what this fluid does to skin, eyes and lungs, which PPE stops it and what first aid is needed, and reading it before the cart is touched is what makes every later choice an informed one rather than a habit carried over from another fluid."},
    {"id": "brief", "kind": "select", "target": "work-order-hf", "title": "Read the work order", "cue": "Confirm the aircraft, the servicing point and the fluid before opening the cart.", "why": "The work order ties the fluid to the servicing point, and servicing the right point with the wrong fluid is a mistake that can damage a system and expose the crew to something they did not prepare for, so the two are matched before the cart is opened."},
    {"id": "ppe", "kind": "sequence", "anyOrder": true, "targets": ["chem-gloves", "face-shield", "apron-hf"], "itemNames": {"chem-gloves": "chemical gloves", "face-shield": "face shield over goggles", "apron-hf": "chemical apron"}, "title": "Don the PPE the SDS calls for", "cue": "Chemical gloves, face shield over goggles and apron, as the SDS lists.", "why": "The PPE is chosen from the sheet, not from what is nearest on the rack, because a glove material that stops one fluid can be permeated by another in minutes, and the face shield over goggles is what protects against the splash a fitting under pressure can throw."},
    {"id": "buddy-check", "kind": "select", "target": "buddy-call", "title": "Buddy check the PPE", "cue": "Have your buddy check your gloves, cuffs and face shield.", "why": "You cannot see your own cuff gap or the tear in the back of a glove, and the buddy check is the second pair of eyes that catches what the mirror would, before the fluid finds it for you."},
    {"id": "eyewash-test", "kind": "gauge", "target": "eyewash-meter", "title": "Prove the eyewash", "cue": "Run the eyewash and commit only once the flow reads in the green.", "why": "An eyewash that has not been run may deliver rust, stale water or nothing at all, and the seconds after a splash are the worst time to find that out, so the flow is proven now while nobody needs it.", "gauge": { label: "EYEWASH FLOW", speed: 0.6, green: [0.43, 0.61], readout: (t) => (t > 0.43 && t < 0.61 ? "flowing" : "weak flow"), missNote: "Not in the green — report the eyewash and do not start until it flows." }},
    {"id": "place-pan", "kind": "drag", "target": "drip-pan-hf", "drag": {"to": "port-dock", "radius": 0.4, "missNote": "Not placed — set the drip pan under the servicing port before connecting."}, "title": "Place the drip pan", "cue": "Carry the drip pan under the servicing port.", "why": "The drip pan catches the drops that every connection and disconnection lets go, and placing it before connecting means the floor, the drain and the crew's shoes never see the fluid at all."},
    {"id": "connect-select", "kind": "select", "target": "service-coupling", "title": "Connect the servicing line", "cue": "Connect the servicing line to the port with the buddy watching.", "why": "Connection is where a mis-seated coupling shows itself, and doing it with the buddy watching means someone outside the splash path is ready to reach the shut-off if the coupling does not seat the way it should."},
    {"id": "transfer-flow", "kind": "track", "target": "flow-meter", "seconds": 8, "title": "Make the transfer", "cue": "Keep the transfer flow inside the band the procedure sets.", "why": "Too fast a transfer foams, splashes and overfills; too slow stalls and tempts someone to open the valve wide, and holding the flow in the band is what keeps the transfer controlled from start to finish.", "track": { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "FLOW", readout: (v) => (v < 0.4 ? "stalled" : v > 0.62 ? "too fast" : "steady") }, "holdBreakNote": "The flow left the band. Bring it back before the transfer continues."},
    {"id": "find-leak", "kind": "find", "noHint": true, "targets": ["cracked-hose"], "itemNames": {"cracked-hose": "cracked servicing hose"}, "itemNotes": {"cracked-hose": "A cracked hose is taken out of service and tagged; it is not taped and reused."}, "decoyNotes": {"good-hose": "A servicing hose in date and intact. Nothing to flag there."}, "title": "Find the leak source", "cue": "Look along the shelf for the source of the weep.", "why": "A leak stopped at the valve will return the next time the line is used unless its cause is found, and the cracked hose found now is also the one that would have failed completely under the next full transfer."},
    {"id": "hold-pressure-check", "kind": "hold", "target": "pressure-hold", "seconds": 5, "title": "Hold the system check", "cue": "Hold the system check while the level settles.", "why": "The level has to settle before it can be read honestly, and holding the check through the settling time is what stops an overfill or an underfill being signed off on a reading taken too soon.", "holdBreakNote": "Released the check early. Hold it until the level settles."},
    {"id": "disconnect", "kind": "sequence", "anyOrder": false, "targets": ["cart-valve", "service-coupling", "port-cap"], "itemNames": {"cart-valve": "cart shut-off closed", "service-coupling": "line disconnected", "port-cap": "port capped"}, "outOfOrderNote": "Out of order — close the shut-off, then disconnect the line, then cap the port.", "title": "Disconnect and cap", "cue": "Close the shut-off, disconnect the line, then cap the port.", "why": "Closing the supply first means the disconnection releases only what is in the short length of line, and capping the port last keeps contamination out of a system that is now open to the hangar air."},
    {"id": "find-waste", "kind": "find", "noHint": true, "targets": ["open-waste-can"], "itemNames": {"open-waste-can": "unlidded waste can"}, "itemNotes": {"open-waste-can": "Contaminated wipes go in a lidded, labelled waste container; this one is closed and labelled."}, "decoyNotes": {"labelled-drum": "A labelled, lidded waste drum. Nothing to flag there."}, "title": "Check the waste", "cue": "Before you leave, find the waste that is not contained.", "why": "The wipes and pads from a servicing job carry the same fluid the PPE was protecting against, and an open waste can lets it evaporate into the hangar or be handled by someone who never read the sheet."},
    {"id": "doff", "kind": "select", "target": "doff-station", "title": "Doff and wash", "cue": "Remove the gloves and apron at the doffing station and wash your hands.", "why": "Most skin exposure happens taking PPE off, when a contaminated glove touches a clean wrist, and doffing at the station in the right order, then washing, is what keeps the fluid on the PPE and off the person."},
    {"id": "closeout", "kind": "select", "target": "service-log", "title": "Log the servicing", "cue": "Log the fluid, the quantity per the work order, the leak and the tagged hose.", "why": "The service log is what tells the next crew what went into this system and what went wrong doing it, and a leak or a tagged hose that is not written down is a lesson the depot pays for twice."},
  ],

  build(root) {
    const ACC = ORB5_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floorMesh = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floorMesh.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc9ced2, grout: "#8a9094" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wallMesh = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wallMesh.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7d8790 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const trayMesh = box(g, 1.4, 0.03, 0.8, 3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    trayMesh.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "depot hangar, servicing bay", -3.8, 3.7, -7.05, { css: "#9be15d", w: 0.5 });
    const rig = depotHangarBay(g, 0, 0, -5.6, { livery: { colour: 0xdfe6ea, accent: ACC, fleetName: "DEPOT", unitNumber: "BAY 3" } });
    const P = rig.userData.parts;
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    post(-1.68, 1.47, 0.95);
    cap["sds-binder"] = box(g, 0.18, 0.14, 0.12, -1.68, 1.02, 1.47, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "safety data sheet", -1.68, 1.3, 1.47, { css: "#9be15d", w: 0.426 });
    reg(hits, cap["sds-binder"], "sds-binder");
    post(-2.09, 0.9, 0.95);
    cap["chem-gloves"] = ball(g, 0.075, -2.09, 1.03, 0.9, 0xf0b323, { rough: 0.45, seg: 12 });
    holoTag(g, "chemical gloves", -2.09, 1.3, 0.9, { css: "#9be15d", w: 0.38999999999999996 });
    reg(hits, cap["chem-gloves"], "chem-gloves");
    post(-2.25, 0.24, 0.95);
    cap["face-shield"] = cyl(g, 0.07, 0.07, 0.12, -2.25, 1.01, 0.24, 0x3a78c9, { rough: 0.5, seg: 12 });
    holoTag(g, "face shield over goggles", -2.25, 1.3, 0.24, { css: "#9be15d", w: 0.5 });
    reg(hits, cap["face-shield"], "face-shield");
    post(-2.13, -0.42, 0.95);
    cap["apron-hf"] = box(g, 0.18, 0.14, 0.12, -2.13, 1.02, -0.42, 0xd8a63a, { rough: 0.5 });
    holoTag(g, "chemical apron", -2.13, 1.3, -0.42, { css: "#9be15d", w: 0.372 });
    reg(hits, cap["apron-hf"], "apron-hf");
    post(-1.74, -1.01, 0.95);
    cap["buddy-call"] = ball(g, 0.075, -1.74, 1.03, -1.01, 0x59637a, { rough: 0.45, seg: 12 });
    holoTag(g, "call your buddy", -1.74, 1.3, -1.01, { css: "#9be15d", w: 0.38999999999999996 });
    reg(hits, cap["buddy-call"], "buddy-call");
    post(-1.14, -1.45, 0.95);
    cap["eyewash-meter"] = instrument(g, -1.14, 0.97, -1.45, { ry: 0.53, idle: "--", color: ACC });
    holoTag(g, "eyewash meter", -1.14, 1.3, -1.45, { css: "#9be15d", w: 0.354 });
    reg(hits, cap["eyewash-meter"], "eyewash-meter");
    post(-0.4, -1.68, 0.95);
    cap["drip-pan-hf"] = box(g, 0.18, 0.14, 0.12, -0.4, 1.02, -1.68, 0xf0b323, { rough: 0.5 });
    holoTag(g, "drip pan hf", -0.4, 1.3, -1.68, { css: "#9be15d", w: 0.31799999999999995 });
    reg(hits, cap["drip-pan-hf"], "drip-pan-hf");
    post(0.4, -1.68, 0.95);
    cap["port-dock"] = group(g, 0.4, 0.95, -1.68); box(cap["port-dock"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["port-dock"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "port dock", 0.4, 1.3, -1.68, { css: "#9be15d", w: 0.282 });
    reg(hits, cap["port-dock"], "port-dock");
    post(1.14, -1.45, 0.95);
    cap["service-coupling"] = cyl(g, 0.07, 0.07, 0.12, 1.14, 1.01, -1.45, 0xd8a63a, { rough: 0.5, seg: 12 });
    holoTag(g, "line disconnected", 1.14, 1.3, -1.45, { css: "#9be15d", w: 0.426 });
    reg(hits, cap["service-coupling"], "service-coupling");
    post(1.74, -1.01, 0.95);
    cap["flow-meter"] = instrument(g, 1.74, 0.97, -1.01, { ry: -0.88, idle: "--", color: ACC });
    holoTag(g, "flow meter", 1.74, 1.3, -1.01, { css: "#9be15d", w: 0.3 });
    reg(hits, cap["flow-meter"], "flow-meter");
    post(2.13, -0.42, 0.95);
    cap["pressure-hold"] = ball(g, 0.075, 2.13, 1.03, -0.42, 0x2b2f34, { rough: 0.45, seg: 12 });
    holoTag(g, "pressure hold", 2.13, 1.3, -0.42, { css: "#9be15d", w: 0.354 });
    reg(hits, cap["pressure-hold"], "pressure-hold");
    post(2.25, 0.24, 0.95);
    cap["cart-valve"] = cyl(g, 0.07, 0.07, 0.12, 2.25, 1.01, 0.24, 0xf0b323, { rough: 0.5, seg: 12 });
    holoTag(g, "cart shut-off", 2.25, 1.3, 0.24, { css: "#9be15d", w: 0.354 });
    reg(hits, cap["cart-valve"], "cart-valve");
    post(2.09, 0.9, 0.95);
    cap["port-cap"] = box(g, 0.18, 0.14, 0.12, 2.09, 1.02, 0.9, 0x3a78c9, { rough: 0.5 });
    holoTag(g, "port capped", 2.09, 1.3, 0.9, { css: "#9be15d", w: 0.31799999999999995 });
    reg(hits, cap["port-cap"], "port-cap");
    post(1.68, 1.47, 0.95);
    cap["doff-station"] = ball(g, 0.075, 1.68, 1.03, 1.47, 0xd8a63a, { rough: 0.45, seg: 12 });
    holoTag(g, "doff station", 1.68, 1.3, 1.47, { css: "#9be15d", w: 0.33599999999999997 });
    reg(hits, cap["doff-station"], "doff-station");
    cap["cracked-hose"] = ball(g, 0.06, -1.6, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["cracked-hose"], "cracked-hose");
    cap["good-hose"] = ball(g, 0.06, -0.53, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["good-hose"], "good-hose");
    cap["open-waste-can"] = ball(g, 0.06, 0.53, 0.62, -2.7, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, cap["open-waste-can"], "open-waste-can");
    cap["labelled-drum"] = ball(g, 0.06, 1.6, 0.62, -2.7, 0x59637a, { rough: 0.6, seg: 10 });
    reg(hits, cap["labelled-drum"], "labelled-drum");
    box(g, 3.8, 0.05, 0.4, 0, 0.55, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.55, 0.36, sx, 0.275, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    { const hz = group(g, -1.22, 0, 2.96, 2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("GO\nSOLO", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "solo-service-hazard"); }
    { const hz = group(g, 1.22, 0, 2.96, -2.75); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("SKIP\nSDS", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "no-sds-hazard"); }
    { const hz = group(g, -3.04, 0, -1.01, 1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("BARE\nRAG", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "wipe-with-rag-hazard"); }
    { const hz = group(g, 3.04, 0, -1.01, -1.25); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace("CAP\nOFF", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, "cap-off-hazard"); }
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#9be15d"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER · SERVICING", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Fluid: as named on the work order", "PPE: as the SDS calls for", "Buddy in place, eyewash proven", "Leak = stop, isolate, report"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "work-order-hf");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("SERVICE LOG\nOPEN", { bg: "#11181f", accent: "#9be15d", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "service log", 0, 1.46, 0, { css: "#9be15d", w: 0.34 });
    reg(hits, logSign, "service-log");
    for (let i = 0; i < 36; i++) { const side = i % 2 ? 1 : -1; const k = Math.floor(i / 2); box(g, 0.34, 0.2, 0.3, side * 4.3, 0.3 + (k % 4) * 0.42, -5.6 + Math.floor(k / 4) * 0.42, [0x3a78c9, 0xf0b323, 0x59637a][i % 3], { rough: 0.7 }); }
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) box(g, 0.4, 0.03, 2.4, side * 4.3, 0.18 + k * 0.42, -4.6, 0x53585e, { rough: 0.6, metal: 0.4 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(crew, "servicing buddy", 0, 1.95, 0.15, { css: "#9be15d", w: 0.34 });
    const faultOn = /[?&]fault=leak-detect(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_AD_HAZARDOUS_FLUID_SERVICING_WITH_A_BUDDY.steps.find((s) => s.id === "connect-select");
    const fDecl = SIM_AD_HAZARDOUS_FLUID_SERVICING_WITH_A_BUDDY.faults[0];
    if (fStep) { fStep.target = faultOn ? fDecl.target : fDecl.from; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    faultLamp.visible = faultOn;
    if (faultOn) holoTag(g, "Leak detector: ALARM", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 });
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "fitting-weeps") { faultLamp.visible = true; cap["cart-valve"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "buddy-called-away") { cap["buddy-call"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fitting-weeps") { faultLamp.visible = false; cap["cart-valve"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "buddy-called-away") { cap["buddy-call"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "eyewash-test") repaint(cap["eyewash-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "closeout") repaint(logFace, signFace("SERVICE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "eyewash-test") repaint(cap["eyewash-meter"].userData.screen, signFace(gg.t > 0.43 && gg.t < 0.61 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.43 && gg.t < 0.61 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
