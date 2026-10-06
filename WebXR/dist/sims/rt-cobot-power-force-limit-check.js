import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  tileFace, paintedSteelFace, gratingFace, reg,
} from "../citykit.js";
import { cobotBench } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Measuring a Cobot's Contact Forces — its own gamified system: Soft Contact.
//
// ROBOTRAIN (docs/consoles/ROBOTRAIN.md): the second ROBOPROG gap station. A cobot integrator verifies a power-and-force-limited
// application before people share the bench with it: the body regions the risk assessment says can be touched, a force-and-pressure
// measuring device set for that region and mounted where contact can happen, the transient and the quasi-static cases measured
// separately, the readings compared with the limits the risk assessment wrote down, and a sharp tool edge found before anyone
// trusts a number. ISO/TS 15066 is named as the source of the body-region approach; no limit value is quoted — the station's
// gauges read "inside" or "over" the card's band. ?fault=pinch-point moves the tool's sharp edge to the fixture so the find reads
// the scene instead of a memory.

const RTPF_ACCENT = 0x5bb7d9;

export const SIM_RT_COBOT_POWER_FORCE_LIMIT_CHECK = {
  id: "rt-cobot-power-force-limit-check",
  index: "rt-2",
  domain: "Robotics",
  trade: "Cobot integrator, power-and-force-limiting verification on a shared bench — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-training-centre",
  weather: "overcast",
  certification: "UAW and IAM skilled-trades training as bodies; ISO/TS 15066 for collaborative robot applications (power and force limiting, body regions), with ANSI R15.06 and ISO 10218 for the robot and its integration; OSHA 29 CFR 1910.212 general requirements for machines and 29 CFR 1910.132 personal protective equipment; the application's written risk assessment, the measuring device's manual and the manufacturer's manual",
  name: "Measuring a Cobot's Contact Forces",
  title: simTitle("Measuring a Cobot's Contact Forces"),
  tagline: "Verifying a power-and-force-limited cobot before people share its bench: body regions read from the risk assessment, the measuring device set for the region and seated where contact happens, transient and quasi-static contact measured separately, every reading judged against the card's band, a sharp tool edge found and covered, and the result recorded with the device's calibration",
  accent: RTPF_ACCENT,
  accentCss: "#5bb7d9",
  parSeconds: 330,
  footprint: 2.9,
  badge: { id: "soft-contact", name: "Soft Contact", note: "Measured both contact cases for the right body region and let the readings, not the brochure, decide" },

  game: system({
    name: "Soft Contact",
    currency: "FP",
    ranks: ["Observer", "Device Holder", "Measurer", "Verifier", "Soft Contact Lead"],
    badges: [
      { id: "region-first", name: "Region First", note: "Set the device for the body region before the first contact", test: AWARD.stepClean("region-set") },
      { id: "two-cases", name: "Two Cases", note: "Measured transient and quasi-static contact as separate tests", test: AWARD.stepClean("case-order") },
      { id: "steady-reading", name: "Steady Reading", note: "Held the reading inside the card's band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-verify", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-verify", name: "Clean Verification", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UAW or IAM local's training coordinator, or the employee assistance line, if a contact injury on a shared cell is something you want to talk through",

  faults: [{ id: "pinch-point", label: "Tooling edge: CHECK", step: "find-edge", target: "fixture-clamp-edge", note: "Today the exposed edge is on the fixture clamp, not the gripper finger. Find the edge that would turn a contact into a cut.", from: "gripper-finger-edge", cue: "Find the edge on the tooling that would turn an allowed contact into a cut." }],

  hazards: {
    "brochure-hazard": "That signs the verification from the robot's brochure, which says the arm is collaborative. A collaborative robot is only a collaborative application once this tool, this payload, this speed and this bench have been measured; the brochure measured none of them.",
    "hand-test-hazard": "That checks the contact force by letting the arm press on a hand to feel how hard it is. The measuring device exists so no part of a person is the test piece; a hand reads pain, not force, and gives one person's number for everyone's body.",
    "head-region-hazard": "That runs the contact test with the device set for the hand while the arm's path crosses head height. The limits differ by body region, and the region the arm can actually reach is what is set; a hand setting at head height approves a contact the risk assessment forbids.",
    "skip-quasi-hazard": "That measures the transient bump and skips the quasi-static case because the arm never pins anything. The arm pins whatever gets between the tool and the fixture, and the clamping case is the one that keeps pushing; both cases are measured because they fail differently.",
  },

  lateNotes: {
    "risk-assessment-card": "The body regions and the force band come from this application's risk assessment, read first; the device is set from the card, not from a default.",
    "calibration-tag": "The measuring device's calibration tag is checked before the first reading; an uncalibrated device gives a confident number that means nothing.",
  },

  interrupts: [
    { id: "steady-hand", kind: "Hand near contact", after: "contact-hold", delay: 3, seconds: 11, alert: "A coworker has reached in to steady the measuring device as the arm comes down on it.", cue: "Press the bench e-stop now.", target: "bench-estop", why: "The contact test drives the tool onto the device on purpose, and a hand holding that device is where the tool lands; the bench e-stop stops the approach before the next motion, and the device is re-seated with the arm stopped rather than steadied with the arm moving.", missNote: "You let the test run with a hand on the device. A person reaching into the contact point is answered with the bench e-stop.", wrongNote: "Not that — a hand at the contact point is answered with the bench e-stop." },
    { id: "over-band", kind: "Reading over band", after: "reading-track", delay: 3, seconds: 11, alert: "The device readout has gone red: the quasi-static reading is above the band on the card.", cue: "Turn the speed override down.", target: "speed-override", why: "A reading over the band is the application failing its own verification in real time, and the quantity the integrator can change on the spot is speed; the override comes down, the test is rerun, and the result is recorded as it was measured — over, then corrected — not quietly repeated until it passes.", missNote: "The reading stayed over the band and the test went on. An over-band reading is answered by reducing the speed override, then re-measuring.", wrongNote: "Not that — an over-band reading is answered at the speed override." },
  ],

  steps: [
    { id: "risk-regions", kind: "select", target: "risk-assessment-card", title: "Read the body regions on the risk assessment", cue: "Read which body regions the arm can touch in this application and the force band set for each.", why: "Power and force limiting is only a safeguard against the contacts the application can actually make, and the risk assessment names them: which parts of a person are in the arm's reach at which points of the task, and what the allowed band is for each; the device is set from that list, and a region not on it is a reason to stop and ask." },
    { id: "ppe-verify", kind: "sequence", anyOrder: true, targets: ["glasses-verify", "sleeves-verify", "shoes-verify"], itemNames: { "glasses-verify": "safety glasses", "sleeves-verify": "fitted sleeves, no lanyard", "shoes-verify": "safety shoes" }, title: "Dress for the shared bench", cue: "Safety glasses, fitted sleeves with no lanyard, safety shoes.", why: "A verification session puts a person closer to a moving arm than production ever will, and for longer; the glasses are for a part that pops out of a test grip, the fitted sleeves for a gripper that closes on cloth, and the shoes for a measuring stand that gets knocked off the bench." },
    { id: "calibration", kind: "select", target: "calibration-tag", title: "Check the device's calibration tag", cue: "Read the calibration tag on the measuring device and confirm it is in date.", why: "The whole verification rests on one instrument's numbers, and a force-and-pressure device drifts, gets dropped and ages its springs; a tag in date is the only evidence that today's reading relates to the band on the card at all." },
    { id: "region-set", kind: "gauge", target: "region-dial", title: "Set the device for the body region", cue: "Set the device's spring and pad for the body region the arm reaches here, and commit when it reads back.", why: "Each body region has its own spring constant and pad on the device because the body is stiffer at the shin than at the hand, and a reading taken with the wrong set is a number for a region that was not at risk; the readback confirms the set, not the dial's detent.", gauge: { label: "REGION", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "hand / finger set" : "wrong region"), missNote: "Not set — the device reads back a different body region. Set it for the region the arm reaches before measuring." } },
    { id: "device-seat", kind: "drag", target: "measuring-device", drag: { to: "contact-point", radius: 0.4, missNote: "Not seated — the device goes where the tool meets the fixture, the spot a hand would be caught." }, title: "Seat the device at the contact point", cue: "Carry the measuring device to the contact point where the tool meets the fixture and seat it on its stand.", why: "The device measures the contact that happens where it sits, so it goes where a person's hand would be during the task — between tool and fixture — not somewhere convenient; a measurement taken a hand's width away is a measurement of a different contact." },
    { id: "collab-mode", kind: "gauge", target: "mode-readout", title: "Confirm collaborative mode and the test speed", cue: "Confirm the arm is in its collaborative setting at the speed the card names, read back on the pendant.", why: "The force the arm delivers depends on the speed and the mode it runs in, and the verification is of the settings production will use; a test at a gentler setting than production approves a contact nobody will ever make.", gauge: { label: "MODE", speed: 0.6, green: [0.4, 0.58], readout: (t) => (t > 0.4 && t < 0.58 ? "collaborative · card speed" : "check setting"), missNote: "The pendant does not read the collaborative setting at the card's speed. Do not run the contact until it does." } },
    { id: "estop-prove", kind: "select", target: "bench-estop", title: "Prove the bench e-stop", cue: "Press the bench e-stop once, watch the arm hold, then reset.", why: "This test drives the arm into an object on purpose, and the stop is what ends the test if the object turns out to be a person; it is pressed once before the first contact so the integrator knows the circuit, not the brochure, stops this arm today." },
    { id: "contact-hold", kind: "hold", target: "run-key", seconds: 5, title: "Run the transient contact", cue: "Hold the run key while the arm makes its transient contact with the device and the reading settles.", why: "The transient case is the bump: the arm meets the device and the device is free to move away, as a hand would be knocked aside. It is held through the whole approach because the peak comes in the first instant, and letting go early records an approach, not a contact.", holdBreakNote: "Released before the reading settled. Reset the device and run the transient case again." },
    { id: "case-order", kind: "sequence", anyOrder: false, targets: ["record-transient", "clamp-device", "record-quasi"], itemNames: { "record-transient": "record the transient reading", "clamp-device": "clamp the device so it cannot move", "record-quasi": "run and record the quasi-static reading" }, outOfOrderNote: "Out of order — record the transient result, clamp the device, then run the quasi-static case.", title: "Record the transient case, then set up the quasi-static one", cue: "Record the transient reading, clamp the device so it cannot move, then run the quasi-static case.", why: "Quasi-static contact is the pinch: the device, like a hand against the fixture, cannot move away and the arm keeps pushing until it stops itself. It is a different failure with its own band, and the two readings are recorded as two results so a pass on the bump never hides a fail on the pinch." },
    { id: "reading-track", kind: "track", target: "force-readout", seconds: 8, title: "Watch the quasi-static reading inside the band", cue: "Hold the quasi-static contact and keep the reading inside the card's band for the whole dwell.", why: "The quasi-static case lasts as long as the arm pushes, and a reading that starts inside the band and creeps over during the dwell is a fail; watching the whole dwell is how the test measures what a pinned hand would feel, not what the first half-second felt like.", track: { start: 0.5, green: [0.38, 0.6], rise: 0.4, fall: 0.45, drift: 0.13, label: "FORCE", readout: (v) => (v < 0.38 ? "light" : v > 0.6 ? "over band" : "in band") }, holdBreakNote: "The reading left the band during the dwell. Reduce the override and run the quasi-static case again." },
    { id: "find-edge", kind: "find", noHint: true, targets: ["gripper-finger-edge"], target: "gripper-finger-edge", itemNames: { "gripper-finger-edge": "exposed sharp edge on the gripper finger" }, itemNotes: { "gripper-finger-edge": "A force inside the band through a sharp edge still cuts: the finger gets its rounded cover before the result is signed." }, decoyNotes: { "fixture-clamp-edge": "The fixture clamp is radiused and sits under the tool path. Nothing to cover there today.", "part-tray-verify": "The parts tray holds the test parts. It is not in the contact path." }, title: "Find the edge that would turn contact into a cut", cue: "Find the edge on the tooling that would turn an allowed contact into a cut.", why: "The force band assumes contact through a blunt surface spread over the pad, and the same force through a sharp edge or a small point is a cut or a puncture at a reading that passes; the tooling is walked for edges because the device cannot see what shape pressed on it." },
    { id: "edge-cover", kind: "select", target: "edge-cover", title: "Fit the rounded cover", cue: "Fit the rounded cover over the finger edge and check it cannot work loose.", why: "A cover is how a contact that must stay possible is made survivable: it spreads the force over an area and takes the edge out of the equation, and it is checked for a secure fit because a cover that drops off mid-shift leaves the edge in the path with the verification still signed." },
    { id: "record-result", kind: "sequence", anyOrder: false, targets: ["result-readings", "result-device", "result-sign"], itemNames: { "result-readings": "both readings as measured", "result-device": "device serial and calibration", "result-sign": "signature and date" }, outOfOrderNote: "Out of order — the readings as measured, then the device and its calibration, then sign and date.", title: "Record the verification", cue: "Write both readings as measured, the device's serial and calibration, then sign and date.", why: "A verification is a record someone else will read when the application changes or someone is hurt: the readings as measured including the over-band one that was corrected, the device that measured them and its calibration, and who stood here; a signed page with one tidy number tells that reader nothing." },
  ],

  build(root) {
    const ACC = RTPF_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floor = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xd3d8dc, grout: "#8e969c" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wall = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.6 });
    wall.material = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#5e6b74" }), { repeat: 3, px: 512 }), { rough: 0.6, metal: 0.3, color: 0xffffff });
    const deck = box(g, 1.4, 0.03, 0.8, -3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "verification bench — procedural, generic cobot", -3.6, 3.7, -7.05, { css: "#5bb7d9", w: 0.64 });
    const rig = cobotBench(g, 0, 0, -3.6, { colour: 0x5bb7d9 });
    const P = rig.userData.parts ?? {};
    // the measuring stand and fixture on the bench, a pendant on a bracket, the readout mast
    const fixture = box(g, 0.3, 0.1, 0.3, 0.55, 0.98, -3.5, 0x53585e, { rough: 0.5, metal: 0.4 });
    const clamp = box(g, 0.08, 0.14, 0.12, 0.7, 1.08, -3.5, 0x9aa2a8, { rough: 0.4, metal: 0.5 });
    box(g, 0.2, 0.3, 0.06, -1.1, 1.2, -3.9, 0x2b2f34, { rough: 0.5 });
    box(g, 0.14, 0.12, 0.012, -1.1, 1.24, -3.865, 0x1d2329, { rough: 0.3, emissive: 0x103040, ei: 0.4 });
    cyl(g, 0.03, 0.04, 2.2, 1.9, 1.1, -4.6, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const mastLamp = ball(g, 0.05, 1.9, 2.25, -4.6, 0x5a2020, { rough: 0.4, seg: 10 });
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#5bb7d9", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("risk-assessment-card", "risk assessment: body regions", -1.68, 1.47, "box", 0xd8a63a);
    put("glasses-verify", "safety glasses", -2.09, 0.9, "box", 0x2b2f34);
    put("sleeves-verify", "fitted sleeves, no lanyard", -2.25, 0.24, "ball", 0x4b5561);
    put("shoes-verify", "safety shoes", -2.13, -0.42, "cyl", 0x3a3a3a);
    put("calibration-tag", "calibration tag", -1.74, -1.01, "box", 0xf0b323);
    put("region-dial", "device: body region", -1.14, -1.45, "meter");
    put("mode-readout", "mode + speed readout", -0.4, -1.68, "meter");
    put("bench-estop", "bench e-stop", 0.4, -1.68, "cyl", 0xd2312b);
    put("run-key", "run contact test", 1.14, -1.45, "ball", 0x59c97b);
    put("record-transient", "record transient", 1.74, -1.01, "box", 0x3a78c9);
    put("clamp-device", "clamp the device", 2.13, -0.42, "cyl", 0x9aa2a8);
    put("record-quasi", "record quasi-static", 2.25, 0.24, "box", 0x2f6fb0);
    put("force-readout", "force readout", 2.09, 0.9, "meter");
    put("speed-override", "speed override", 1.68, 1.47, "cyl", 0xf0b323);
    put("edge-cover", "rounded finger cover", 2.9, 1.9, "ball", 0x59637a);
    put("result-readings", "readings as measured", -2.9, 1.9, "box", 0x59c97b);
    put("result-device", "device serial + calibration", -3.3, 1.2, "box", 0xf0b323);
    put("result-sign", "sign and date", 3.3, 1.2, "cyl", 0x59637a);
    // the measuring device (drag) and the contact point on the fixture
    const dev = group(g, -0.9, 0.95, -2.3);
    cyl(dev, 0.09, 0.09, 0.06, 0, 0.03, 0, 0xf0b323, { rough: 0.5, seg: 14 }); cyl(dev, 0.03, 0.03, 0.12, 0, 0.12, 0, 0x9aa2a8, { rough: 0.4, metal: 0.5, seg: 10 }); ball(dev, 0.055, 0, 0.21, 0, 0x2b2f34, { rough: 0.6, seg: 12 });
    cap["measuring-device"] = dev; reg(hits, dev, "measuring-device");
    cap["contact-point"] = group(g, 0.55, 1.03, -3.5);
    box(cap["contact-point"], 0.22, 0.01, 0.22, 0, 0, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "contact point: tool meets fixture", 0.55, 1.45, -3.5, { css: "#5bb7d9", w: 0.5 }); reg(hits, cap["contact-point"], "contact-point");
    // the find targets: gripper finger edge, the fixture clamp edge, the parts tray
    const finger = box(g, 0.012, 0.06, 0.04, -0.3, 1.46, -3.26, 0xeaeaea, { rough: 0.3, metal: 0.6 });
    cap["gripper-finger-edge"] = finger; reg(hits, finger, "gripper-finger-edge");
    cap["fixture-clamp-edge"] = clamp; reg(hits, clamp, "fixture-clamp-edge");
    cap["part-tray-verify"] = box(g, 0.34, 0.06, 0.24, 0.9, 0.95, -3.9, 0x2f6f5e, { rough: 0.6 }); reg(hits, cap["part-tray-verify"], "part-tray-verify");
    for (let i = 0; i < 6; i++) box(g, 0.05, 0.05, 0.05, 0.8 + (i % 3) * 0.08, 0.99, -3.95 + Math.floor(i / 3) * 0.08, [0xd8a63a, 0x5bb7d9][i % 2], { rough: 0.5 });
    // the body-region panel
    const regions = holoPanel(g, 0.72, 0.48, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.92)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#5bb7d9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e6f4fa"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CONTACT CASES · THIS BENCH", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9d3e4";
      ["Regions in reach: hand, forearm", "Transient: device free to move", "Quasi-static: device clamped", "Band: from the risk assessment"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, regions, "regions-panel");
    // hazard boards
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("brochure-hazard", "SIGN FROM\nBROCHURE", -1.22, 2.96, 2.75);
    hazard("hand-test-hazard", "TEST ON\nA HAND", 1.22, 2.96, -2.75);
    hazard("head-region-hazard", "WRONG\nREGION", -3.04, -1.01, 1.25);
    hazard("skip-quasi-hazard", "SKIP\nPINCH CASE", 3.04, -1.01, -1.25);
    // result board
    const resSign = group(g, 2.9, 0, 0.4, -0.9);
    box(resSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const resFace = decal(resSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("VERIFY\nOPEN", { bg: "#11181f", accent: "#5bb7d9", scale: 0.26 }), { px: 320 });
    // device cases and spare pads on the wall shelves
    for (let i = 0; i < 18; i++) box(g, 0.5, 0.3, 0.35, -4.0 + (i % 6) * 0.6, 0.3 + Math.floor(i / 6) * 0.45, -6.7, [0x53585e, 0xf0b323, 0x5bb7d9][i % 3], { rough: 0.8 });
    for (const y of [0.14, 0.59, 1.04]) box(g, 3.8, 0.04, 0.45, -2.5, y, -6.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 5; i++) cyl(g, 0.08, 0.08, 0.04, 2.4 + i * 0.25, 0.16, -6.6, [0xf0b323, 0xd2312b, 0x59c97b][i % 3], { rough: 0.6, seg: 12 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const lead = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(lead, "safety lead", 0, 1.95, 0.15, { css: "#5bb7d9", w: 0.3 });
    const coworker = standingFigure(g, 3.9, -2.4, { ry: -1.4, cloth: 0x5a6b7a, helmet: 0x5a6b7a });
    holoTag(coworker, "coworker", 0, 1.95, 0.15, { css: "#5bb7d9", w: 0.26 });
    const faultOn = new URLSearchParams(globalThis.location?.search ?? "").get("fault") === "pinch-point";
    const fStep = SIM_RT_COBOT_POWER_FORCE_LIMIT_CHECK.steps.find((s) => s.id === "find-edge");
    const fDecl = SIM_RT_COBOT_POWER_FORCE_LIMIT_CHECK.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.target = fStep.targets[0]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { finger.material = mat(0x9aa2a8, { rough: 0.6 }); clamp.material = mat(0xeaeaea, { rough: 0.2, metal: 0.7 }); holoTag(g, "Tooling edge: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 }); }
    faultLamp.visible = faultOn;
    let armSpeed = 0.4;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "steady-hand") { faultLamp.visible = true; coworker.position.set(1.3, 0, -2.7); cap["run-key"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "over-band") { cap["force-readout"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 }); mastLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2 }); armSpeed = 0.9; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "steady-hand") { faultLamp.visible = false; coworker.position.set(3.9, 0, -2.4); cap["run-key"].material = mat(0x59c97b, { rough: 0.5 }); cap["bench-estop"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); }
        if (it.id === "over-band") { cap["force-readout"].material = mat(0x59c97b, { rough: 0.5 }); mastLamp.material = mat(0x5a2020, { rough: 0.4 }); cap["speed-override"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.4 }); armSpeed = 0.25; }
      },
      onStepComplete(step) {
        if (step.id === "region-set") repaint(cap["region-dial"].userData.screen, signFace("HAND", { bg: "#0a1a22", accent: "#59c97b", fg: "#dff5fc", scale: 0.45 }));
        if (step.id === "collab-mode") repaint(cap["mode-readout"].userData.screen, signFace("PFL", { bg: "#0a1a22", accent: "#59c97b", fg: "#dff5fc", scale: 0.5 }));
        if (step.id === "device-seat") { fixture.material = mat(0x59637a, { rough: 0.5, metal: 0.4 }); }
        if (step.id === "contact-hold") mastLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.0 });
        if (step.id === "edge-cover") finger.material = mat(0x59c97b, { rough: 0.7 });
        if (step.id === "record-result") repaint(resFace, signFace("VERIFIED\nAS MEASURED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.22 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        lead.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (P.arm) P.arm.rotation.y = Math.sin(t * armSpeed) * 0.5;
        if (P.elbow) P.elbow.rotation.x = Math.sin(t * armSpeed * 1.5) * 0.2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "region-set") repaint(cap["region-dial"].userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "HAND" : "SHIN?", { bg: "#0a1a22", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#dff5fc", scale: 0.45 }));
        if (gg && !gg.committed && session?.step?.id === "collab-mode") repaint(cap["mode-readout"].userData.screen, signFace(gg.t > 0.4 && gg.t < 0.58 ? "PFL" : "CHECK", { bg: "#0a1a22", accent: gg.t > 0.4 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#dff5fc", scale: 0.5 }));
      },
    };
  },
};
