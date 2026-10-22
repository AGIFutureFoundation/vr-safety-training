import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Patient Transport and Safe Handling VR — Healthcare Support,
// station three. The transport tech's own trip end to end: the ID band read
// against the ticket before anyone moves, brakes locked before every
// transfer, a gait belt and a second set of hands instead of a solo lift, the
// room scanned for a line or a footrest that will bite on the way out, the
// elevator ridden the way the building actually wants it ridden, a real
// handoff at the other end instead of a dropped chart, and the equipment
// logged back in the same trip closes on.

const HCT_ACCENT = 0xc97fd1;

export const SIM_HC_PATIENT_TRANSPORT_AND_SAFE_HANDLING = {
  id: "hc-patient-transport-and-safe-handling",
  index: "354",
  domain: "Healthcare Support",
  trade: "Patient transport technician",
  category: "Healthcare Support",
  indoor: "clinic",
  certification: "OSHA's general duty clause and its ergonomics guidance for safe patient handling, drawing on the same lifting principles behind the Revised NIOSH Lifting Equation; OSHA 29 CFR 1910.1030 bloodborne pathogens for tubing and line handling; the CDC's general infection-prevention guidance; SEIU-UHW and NUHW as the training bodies for patient transport staff",
  name: "Patient Transport & Safe Handling",
  title: simTitle("Patient Transport & Safe Handling"),
  tagline: "ID checked against the ticket, brakes locked before every transfer, a gait belt instead of a solo lift, the route scanned for a line or a footrest that bites, and a real handoff at the other end",
  accent: HCT_ACCENT,
  accentCss: "#c97fd1",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "trip-complete", name: "Trip Complete", note: "A patient moved start to finish with the brakes set, the belt on and a real handoff at the other end" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or SEIU-UHW's member resources if a close call on a transfer has you shaken",

  game: system({
    name: "Transport Standard",
    currency: "TRIP",
    ranks: ["New Tech", "Transport Certified", "Lead Tech", "Transport Supervisor", "Safe Handling Certified"],
    badges: [
      { id: "never-solo-lifted", name: "Never Solo-Lifted", note: "Every transfer used the gait belt and a second set of hands", test: AWARD.stepClean("safe-transfer") },
      { id: "brakes-first", name: "Brakes First", note: "Brakes locked before every single transfer", test: AWARD.stepClean("brakes-check") },
      { id: "real-handoff", name: "Real Handoff", note: "A verbal report given at the destination, not just a ticket dropped off", test: AWARD.stepClean("handoff") },
    ],
    challenges: [
      { id: "clean-trip", name: "Clean Trip", note: "No corrections anywhere in the trip", test: AWARD.clean },
      { id: "steady-slide", name: "Steady Slide", note: "Held the slide-board transfer the whole way, first try", test: AWARD.unbroken },
      { id: "fast-trip", name: "Fast Trip", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "solo-lift-attempt": "That's a one-person lift on a patient who needs a gait belt and a second set of hands. Safe patient handling exists because a solo manual lift is exactly the motion that puts a career-ending back injury on the transport tech and the patient both — not because it's slower to ask for help.",
    "unlocked-brake-decoy": "That wheelchair is standing on a ramp with its brakes off. An unlocked chair on any grade rolls the moment weight shifts onto it — brakes get set before anyone reaches for the seat, every time, ramp or flat floor.",
    "blocked-exit-gurney": "That gurney is parked across the fire exit while you finish up. An egress path blocked even for a few minutes is a hazard for everyone on this floor, not just an inconvenience for whoever needs it next.",
    "expired-o2-tag": "That transport oxygen tank's inspection tag is expired. A tank that hasn't been checked on schedule is not the one you grab for a patient who needs oxygen during the trip — pull a current one instead.",
  },

  lateNotes: {
    "verbal-handoff": "There's no one to report to yet — get this patient off the elevator and to the unit first.",
    "log-complete": "Hold that. The equipment goes back to its dock before this trip logs as finished.",
  },

  steps: [
    {
      id: "id-check", kind: "select", target: "id-band-check",
      title: "Verify the ID band against the transport ticket",
      cue: "Read the patient's ID band and match it to the name and destination on the ticket.",
      why: "A transport ticket sends the right equipment to the right room, but only the ID band on the patient's own wrist confirms this is actually the person that ticket is for — moving the wrong patient is a mistake this one check exists to catch before it starts.",
    },
    {
      id: "brakes-check", kind: "select", target: "brakes-check",
      title: "Lock the brakes before the transfer",
      cue: "Set both wheel brakes on the wheelchair before the patient stands.",
      why: "A wheelchair that rolls even a few centimeters while someone is mid-stand is how a controlled transfer becomes a fall — the brakes get checked and locked before anyone puts weight on the footrests or the seat.",
    },
    {
      id: "o2-check", kind: "gauge", target: "o2-tank-gauge",
      title: "Check the transport oxygen tank before disconnecting wall O2",
      cue: "Read the tank gauge and confirm it's in the safe range for the trip before switching over.",
      why: "A transport tank has to carry enough for the trip plus a margin, per its own gauge — switching over on a tank you haven't actually read is how a patient on oxygen ends up between floors with none.",
      gauge: { label: "TANK PRESSURE", speed: 0.6, green: [0.4, 0.75], readout: (t) => (t < 0.4 ? "low — swap the tank" : t > 0.75 ? "reading unsteady — check again" : "sufficient for the trip"), missNote: "Committed on a reading that wasn't actually in range. Switch to a tank you've confirmed before this patient leaves the room." },
    },
    {
      id: "safe-transfer", kind: "sequence",
      noRobot: true, forceClass: "light",
      robotNote: "A gait-belt transfer is hands-on a person's body; this one stays with the transport crew.",
      targets: ["gait-belt-on", "stand-and-pivot", "seat-patient"],
      itemNames: { "gait-belt-on": "apply the gait belt", "stand-and-pivot": "stand and pivot together", "seat-patient": "seat the patient" },
      title: "Transfer with a gait belt, not a solo lift",
      cue: "Apply the gait belt, stand and pivot together, then seat the patient in the wheelchair.",
      why: "The gait belt gives the transport tech a secure hold on the patient's center of gravity instead of an arm or a gown — paired with a second set of hands, it's what turns a stand-and-pivot into a controlled movement instead of a lift either person is doing alone.",
      outOfOrderNote: "Belt on first, then the stand-and-pivot, then seated — skipping straight to the pivot leaves nothing secure to control the movement with.",
    },
    {
      id: "fall-risk", kind: "select", target: "fall-risk-band",
      title: "Apply the fall-risk indicator already on the chart",
      cue: "Check the chart's fall-risk flag and clip on the matching yellow band before the trip starts.",
      why: "The flag is already on the chart — this step is carrying it through, not deciding it. Every unit this patient passes through reads that band on sight, which is the whole point of it following the patient rather than staying on a door nobody's near anymore.",
    },
    {
      id: "hazard-scan", kind: "find", noHint: true,
      targets: ["loose-iv-line", "untucked-footrest"],
      itemNames: { "loose-iv-line": "an IV line that will snag on the doorway", "untucked-footrest": "a footrest not folded up for the transfer" },
      itemNotes: {
        "loose-iv-line": "That line is hanging loose enough to catch on the doorframe the moment this chair moves — it gets gathered and clipped to the pole before you push off, not sorted out after it's already pulled taut.",
        "untucked-footrest": "A footrest left down at knee height is exactly what a patient's shin catches on standing up or sitting down — fold it clear before the transfer, not after someone's already bumped it.",
      },
      title: "Scan the room before you move",
      cue: "Two things in this room will cause a problem the second this chair starts moving. Find them.",
      why: "A trip that starts smoothly and snags on the doorway thirty seconds later is not a trip that started safely — the room gets checked for exactly this kind of thing before the wheels ever turn, not fixed on the fly once something's already caught.",
    },
    {
      id: "footrest-deploy", kind: "turn", target: "wheelchair-footrest",
      title: "Deploy the footrests for the ride",
      cue: "Swing the footrests back into position and confirm they're locked.",
      turn: { turns: 0.4, axis: "x", label: "FOOTREST" },
      why: "Footrests folded up for the transfer go back down and lock before the chair moves anywhere — a foot dragging along the floor the whole trip is its own injury, separate from the one the transfer itself was built to avoid.",
    },
    {
      id: "elevator-hold", kind: "hold", target: "elevator-call-panel", seconds: 5,
      title: "Hold the elevator door while boarding",
      cue: "Press and hold the door-open control while the chair rolls fully inside.",
      why: "A standard elevator door's timer is built for someone walking through empty-handed, not a wheelchair, an IV pole and a tech backing it in — holding the door open is what keeps it from closing on the equipment or the patient mid-load.",
      holdBreakNote: "You let go before the chair was fully clear of the doors. A door that closes on a wheelchair, a pole or a limb doesn't ask whether you meant to release the button.",
    },
    {
      id: "elevator-position", kind: "select", target: "elevator-position",
      title: "Position the equipment foot-end first",
      cue: "Load the wheelchair so the patient faces the doors, per the building's own transport convention.",
      why: "This building's transport routing is written the same way for every crew so nobody has to work out chair orientation fresh on every ride — following it here is what keeps the patient facing out, clear of the closing doors, and the tech in control of the chair the whole ride.",
    },
    {
      id: "handoff", kind: "sequence",
      targets: ["verbal-handoff", "chart-update"],
      itemNames: { "verbal-handoff": "give the verbal handoff", "chart-update": "update the tracking log" },
      title: "Hand off to the receiving unit",
      cue: "Give the receiving staff a verbal report, then update the tracking log with the patient's new location.",
      why: "A ticket dropped at a desk tells nobody anything until someone happens to read it — a verbal handoff means the receiving unit knows this patient arrived the moment they actually did, and the tracking log is what lets the next person who needs to find this patient actually do it.",
      outOfOrderNote: "The verbal report comes first, while the receiving staff is standing right here — the log update is what makes that report findable later, not a replacement for saying it out loud.",
    },
    {
      id: "brakes-recheck", kind: "select", target: "brakes-recheck",
      title: "Lock the brakes again at the destination",
      cue: "Set the brakes before this patient transfers out of the chair.",
      why: "The brakes get set fresh at every stop this trip makes — the ones locked back at the first room mean nothing to a chair that's been rolled, turned and ridden in an elevator since then.",
    },
    {
      id: "bed-transfer", kind: "hold", target: "transfer-board", seconds: 6,
      title: "Slide-board the patient to the bed",
      cue: "Bridge the board between the chair and the bed and hold a steady, controlled slide.",
      why: "A slide board lets the patient's weight move across a smooth bridge instead of being lifted by hand — holding the slide steady rather than rushing it is what keeps the board from shifting out from under the patient halfway across.",
      holdBreakNote: "The slide broke off partway across the board. A patient left mid-slide on an unsupported board is worse off than one who never started moving.",
    },
    {
      id: "equipment-return", kind: "select", target: "equipment-return",
      title: "Return the equipment to its dock",
      cue: "Wheel the chair back to its charging dock and plug it in.",
      why: "Equipment left wherever the last trip ended is equipment the next trip can't find charged and ready — docking it now is what makes the next tech's trip start on time instead of hunting the floor for a working chair.",
    },
    {
      id: "log-complete", kind: "select", target: "log-complete",
      title: "Log the trip complete",
      cue: "Close out the transport ticket in the system.",
      why: "An open ticket reads as a patient still in transit — closing it the moment the trip actually ends is what keeps the tracking board honest for whoever's watching it for the next request.",
    },
  ],

  interrupts: [
    {
      id: "dizzy-patient",
      kind: "Patient feels unsteady",
      after: "safe-transfer", delay: 3, seconds: 12,
      alert: "Right after standing, the patient says they feel dizzy and unsteady.",
      cue: "That gets reported before this trip continues, not noted for later.",
      target: "notify-nurse",
      why: "Dizziness right after a position change is exactly the kind of thing a transport tech isn't the one to judge — it gets escalated to the nursing staff immediately, because continuing the trip on a guess about whether it's nothing is not a call this job makes alone.",
      missNote: "The trip continued with an unreported dizzy spell on the record nowhere. Whatever caused it is now travelling with the patient instead of being looked at where it happened.",
      wrongNote: "It's the call to the nurse — a patient reporting dizziness gets looked at before the trip goes anywhere else.",
    },
    {
      id: "bed-brake-slip",
      kind: "Bed rolled during transfer",
      after: "bed-transfer", delay: 3, seconds: 11,
      alert: "Partway across the slide board, the receiving bed rolls slightly — its brake was never set.",
      cue: "The slide stops until the bed is actually secured.",
      target: "bed-brake-recheck",
      why: "A slide-board transfer only works because both surfaces it bridges are fixed — a bed that can roll turns a controlled slide into an uncontrolled one, and it gets locked down before the transfer continues, not finished quickly to get past the wobble.",
      missNote: "The transfer finished across a bed that was never actually secured. The gap between the board and a bed that can still move is exactly where a patient ends up on the floor instead of on the mattress.",
      wrongNote: "It's the bed's brake — lock it down before the slide continues.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, HCT_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#d6cee0", base2: "#cbc2d8", seam: "rgba(0,0,0,0.12)",
    }), { repeat: 4, px: 256 });
    const floorMat = () => texturedMat(floorTex, { rough: 0.55, metal: 0.04, color: 0xdcd4e6 });
    const floorPatch = slab(g, 3.6, 0.006, 3.4, 0, 0.001, 0, 0xdcd4e6, { radius: 0.05, cast: false });
    floorPatch.material = floorMat();

    // ----------------------------------------------------------------- the bed
    const bedA = group(g, -2.3, 0, -2.4);
    const bedFrame = box(bedA, 1.0, 0.5, 2.0, 0, 0.25, 0, 0x8b929a, { rough: 0.45, metal: 0.5 });
    const bedTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 2, base: "#9aa4a9", base2: "#8b959a", seam: "rgba(0,0,0,0.1)" }), { repeat: 2, px: 192 });
    bedFrame.material = texturedMat(bedTex, { rough: 0.5, metal: 0.4, color: 0x9aa4a9 });
    box(bedA, 0.94, 0.16, 1.9, 0, 0.58, 0, 0xeef2f2, { rough: 0.6 });

    // -------------------------------------------------------------- the patient
    const patient = seatedFigure(bedA, 0.6, 0.6, 0, { skin: 0xd9a985, cloth: 0x8fb9c9 });
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    const idBand = torus(patient.arms[1].shoulder, 0.028, 0.006, 0, -0.18, 0.02, 0xeaf0f2, { rough: 0.4, seg: 6, seg2: 12 });
    reg(hits, idBand, "id-band-check");
    const fallBand = torus(patient.arms[0].shoulder, 0.03, 0.007, 0, -0.18, 0.02, 0xf2c14b, { rough: 0.4, seg: 6, seg2: 12, opacity: 0.001, transparent: true });
    reg(hits, fallBand, "fall-risk-band");
    const gaitBelt = torus(patient.root, 0.16, 0.014, 0, 0.85, 0, 0xc9a34a, { rough: 0.6, seg: 8, seg2: 20 });
    gaitBelt.rotation.x = Math.PI / 2;
    holoTag(gaitBelt, "Gait belt", 0, 0.14, 0, { css: HCT_ACCENT, w: 0.3 });
    reg(hits, gaitBelt, "gait-belt-on");
    const pivotSpot = box(bedA, 0.3, 0.02, 0.3, 0.9, 0.001, 0.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, pivotSpot, "stand-and-pivot");

    // IV pole and loose line near the bed.
    const ivPole = group(bedA, 0.55, 0, 0.5);
    cyl(ivPole, 0.014, 0.014, 1.5, 0, 0.75, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    ball(ivPole, 0.07, 0, 1.5, 0, 0xdfe8ee, { rough: 0.3, opacity: 0.6, transparent: true, seg: 10, seg2: 10 });
    const looseLine = cyl(ivPole, 0.004, 0.004, 0.6, -0.2, 0.4, 0.1, 0xdfe8ee, { rough: 0.3, seg: 6 });
    looseLine.rotation.set(0.2, 0, 1.3);
    holoTag(looseLine, "Line will snag", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, looseLine, "loose-iv-line");

    // ---------------------------------------------------------------- wheelchair
    const chair = group(g, -1.0, 0, -1.8);
    cyl(chair, 0.24, 0.24, 0.03, -0.22, 0.24, 0.2, 0x2b3138, { rough: 0.5, seg: 20 });
    cyl(chair, 0.24, 0.24, 0.03, 0.22, 0.24, 0.2, 0x2b3138, { rough: 0.5, seg: 20 });
    box(chair, 0.5, 0.05, 0.5, 0, 0.5, 0.15, 0x3a4048, { rough: 0.6 });
    box(chair, 0.5, 0.6, 0.05, 0, 0.8, -0.1, 0x3a4048, { rough: 0.6 });
    const brakeLever = box(chair, 0.03, 0.02, 0.08, -0.26, 0.34, 0.3, 0xd8342a, { rough: 0.5 });
    holoTag(chair, "Brakes", -0.26, 0.4, 0.3, { css: HCT_ACCENT, w: 0.28 });
    reg(hits, brakeLever, "brakes-check");
    const footrests = group(chair, 0, 0.15, 0.42);
    box(footrests, 0.4, 0.03, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    reg(hits, footrests, "wheelchair-footrest");
    const untuckedFootrest = box(chair, 0.16, 0.03, 0.08, 0.2, 0.1, 0.5, 0x2b3138, { rough: 0.5 });
    untuckedFootrest.rotation.x = 0.6;
    holoTag(untuckedFootrest, "Footrest not folded", 0, 0.08, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, untuckedFootrest, "untucked-footrest");
    const chairSeat = box(chair, 0.46, 0.06, 0.46, 0, 0.53, 0.15, 0x2b3138, { rough: 0.6, opacity: 0.001, transparent: true, cast: false });
    reg(hits, chairSeat, "seat-patient");

    // Unlocked wheelchair by the ramp — the solo-lift's companion hazard.
    const rampChair = group(g, 3.0, 0, 1.0, 0.4);
    cyl(rampChair, 0.2, 0.2, 0.025, -0.2, 0.2, 0, 0x2b3138, { rough: 0.5, seg: 16 });
    cyl(rampChair, 0.2, 0.2, 0.025, 0.2, 0.2, 0, 0x2b3138, { rough: 0.5, seg: 16 });
    box(rampChair, 0.42, 0.04, 0.42, 0, 0.42, 0, 0x3a4048, { rough: 0.6 });
    holoTag(rampChair, "Brakes off — on a ramp", 0, 0.6, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, rampChair, "unlocked-brake-decoy");
    const rampSlab = slab(g, 1.2, 0.02, 1.0, 3.0, 0.01, 1.3, 0x9aa4a9, { radius: 0.02, rough: 0.7, cast: false });
    rampSlab.rotation.x = -0.1;

    // Solo-lift decoy poster near the bed.
    const soloLift = decal(bedA, 0.3, 0.3, -0.9, 0.6, 0.4,
      paperFace("", ["Lift alone?", "No belt, no help"], { bg: "#fbe0df", band: "#c9302b" }), { px: 220 });
    holoTag(soloLift, "Solo lift?", 0, 0.2, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, soloLift, "solo-lift-attempt");

    // -------------------------------------------------------------- O2 supply
    const o2Rack = group(g, -3.2, 0, -0.6);
    cyl(o2Rack, 0.09, 0.09, 0.7, 0, 0.35, 0, 0x59c9a0, { rough: 0.4, metal: 0.4, seg: 12 });
    const o2Panel = instrument(o2Rack, 0.16, 0.6, 0, { idle: "-- PSI", color: HCT_ACCENT, w: 0.14, d: 0.2, ry: 0 });
    reg(hits, o2Panel, "o2-tank-gauge");
    const expiredTank = cyl(o2Rack, 0.08, 0.08, 0.6, 0.3, 0.3, 0, 0x59c9a0, { rough: 0.4, metal: 0.4, seg: 12 });
    holoTag(expiredTank, "Tag expired", 0, 0.36, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, expiredTank, "expired-o2-tag");

    // ------------------------------------------------------------------ elevator
    const elevator = group(g, 0.6, 0, -0.6, -Math.PI / 2);
    box(elevator, 1.4, 2.2, 0.1, 0, 1.1, 0, 0x8b929a, { rough: 0.4, metal: 0.4 });
    const doorL = box(elevator, 0.62, 2.0, 0.05, -0.31, 1.0, 0.08, 0xb9c4c9, { rough: 0.35, metal: 0.5 });
    const doorR = box(elevator, 0.62, 2.0, 0.05, 0.31, 1.0, 0.08, 0xb9c4c9, { rough: 0.35, metal: 0.5 });
    void doorL; void doorR;
    const callPanel = instrument(elevator, 0.75, 1.2, 0.1, { idle: "HOLD", color: HCT_ACCENT, w: 0.12, d: 0.16, ry: -Math.PI / 2 });
    reg(hits, callPanel, "elevator-call-panel");
    const posMarker = box(elevator, 0.5, 0.02, 0.5, 0, 0.001, 0.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, posMarker, "elevator-position");

    // ------------------------------------------------------------- destination
    const bedB = group(g, 2.2, 0, 1.8);
    const bedFrameB = box(bedB, 1.0, 0.5, 2.0, 0, 0.25, 0, 0x8b929a, { rough: 0.45, metal: 0.5 });
    bedFrameB.material = texturedMat(bedTex, { rough: 0.5, metal: 0.4, color: 0x9aa4a9 });
    box(bedB, 0.94, 0.16, 1.9, 0, 0.58, 0, 0xeef2f2, { rough: 0.6 });
    const bedBrake = box(bedB, 0.08, 0.03, 0.05, 0.4, 0.06, 0.9, 0xd8342a, { rough: 0.5 });
    reg(hits, bedBrake, "bed-brake-recheck");
    const slideBoard = box(bedB, 0.5, 0.02, 0.18, -0.3, 0.58, -0.3, 0xdfa23b, { rough: 0.4 });
    reg(hits, slideBoard, "transfer-board");

    const brakesRecheckMarker = box(chair, 0.04, 0.02, 0.1, -0.26, 0.34, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, brakesRecheckMarker, "brakes-recheck");

    // -------------------------------------------------------------- handoff desk
    const desk = group(g, 2.6, 0, 0.4);
    box(desk, 0.7, 0.75, 0.4, 0, 0.375, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const handoffPanel = holoPanel(g, 0.5, 0.34, 2.6, 1.3, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,10,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c97fd1"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6e3f8";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("HANDOFF", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Report: — · Location: —", w * 0.06, h * 0.6);
    }, { accent: HCT_ACCENT, ry: -0.6 });
    reg(hits, handoffPanel, "verbal-handoff");
    const trackingLog = holoPanel(g, 0.5, 0.34, 3.2, 1.3, -0.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,10,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c97fd1"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6e3f8";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TRACKING LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: in transit", w * 0.06, h * 0.6);
    }, { accent: HCT_ACCENT, ry: -0.9 });
    reg(hits, trackingLog, "chart-update");

    const ticketDecal = decal(desk, 0.24, 0.18, 0, 0.76, 0,
      paperFace("TRANSPORT TICKET", ["Patient: —", "Dest: — "], { bg: "#fbf3df", band: "#c99a2b" }), { px: 220 });
    ticketDecal.rotation.x = -Math.PI / 2;
    void ticketDecal;

    // ------------------------------------------------------------ equipment dock
    const dock = group(g, -0.5, 0, 2.7);
    box(dock, 0.5, 0.06, 0.5, 0, 0.03, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    cyl(dock, 0.02, 0.02, 0.3, 0.2, 0.15, 0, 0x2b3138, { rough: 0.5, seg: 8 });
    holoTag(dock, "Dock", 0, 0.35, 0, { css: HCT_ACCENT, w: 0.3 });
    reg(hits, dock, "equipment-return");

    const logPanel = holoPanel(g, 0.5, 0.34, -0.5, 1.4, 2.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,10,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c97fd1"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6e3f8";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TRIP LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: in progress", w * 0.06, h * 0.6);
    }, { accent: HCT_ACCENT });
    reg(hits, logPanel, "log-complete");

    // Nurse call panel for the dizziness interrupt.
    const nursePanel = group(g, -2.9, 0, -3.0);
    box(nursePanel, 0.1, 0.02, 0.16, 0, 1.0, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    const nurseLamp = ball(nursePanel, 0.012, 0, 1.05, 0.09, 0x59c97b, { emissive: 0x59c97b, ei: 0.4, seg: 8, seg2: 6 });
    holoTag(nursePanel, "Notify nurse", 0, 1.12, 0, { css: HCT_ACCENT, w: 0.36 });
    reg(hits, nursePanel, "notify-nurse");
    void nurseLamp;

    // Gurney blocking the exit — decoy prop across a marked exit path.
    const exitGurney = group(g, 3.4, 0, -2.2, 0.3);
    box(exitGurney, 0.6, 0.6, 1.9, 0, 0.55, 0, 0xd7dce1, { rough: 0.5, metal: 0.15 });
    holoTag(exitGurney, "Blocking exit", 0, 0.9, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, exitGurney, "blocked-exit-gurney");
    const exitSign = decal(g, 0.3, 0.14, 3.4, 2.1, -3.1, signFace("EXIT", { bg: "#123a1e", accent: "#59c97b", scale: 0.6 }));
    void exitSign;

    const tech = standingFigure(g, -0.6, -1.0, { ry: 0.6, cloth: 0x8a5aa0, skin: 0xb98a63 });
    void tech;

    // Linen and supply shelving for depth along the back wall.
    const shelf = group(g, -3.7, 0, -3.0);
    box(shelf, 0.06, 1.4, 0.6, -0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelf, 0.06, 1.4, 0.6, 0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "GAIT BELTS", 0xc9a34a], [0.7, "SLIDE BOARDS", 0xdfa23b], [1.1, "O2 TANKS", 0x59c9a0],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelf, 0.74, 0.02, 0.58, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelf, 0.2, 0.14, 0.18, i * 0.24, y + 0.08, 0, c, { rough: 0.7 });
        decal(shelf, 0.16, 0.05, i * 0.24, y + 0.08, 0.091, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#f6e3f8"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelf, "Transport stock", 0, 1.45, 0, { css: HCT_ACCENT, w: 0.44 });

    // A second transport tech, well clear of any control, and a spare chair.
    const secondTech = standingFigure(g, 2.6, 2.6, { ry: -0.8, cloth: 0x3f6fa0, skin: 0xd9a985 });
    void secondTech;
    const spareChair = group(g, 3.0, 0, -1.6);
    cyl(spareChair, 0.2, 0.2, 0.025, -0.18, 0.2, 0.15, 0x2b3138, { rough: 0.5, seg: 14 });
    cyl(spareChair, 0.2, 0.2, 0.025, 0.18, 0.2, 0.15, 0x2b3138, { rough: 0.5, seg: 14 });
    box(spareChair, 0.42, 0.05, 0.42, 0, 0.42, 0.13, 0x3a4048, { rough: 0.6 });
    box(spareChair, 0.42, 0.5, 0.05, 0, 0.68, -0.08, 0x3a4048, { rough: 0.6 });
    holoTag(spareChair, "Spare wheelchair", 0, 0.95, 0, { css: HCT_ACCENT, w: 0.44 });

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-1.0, 1.1, -1.8),

      onStepComplete(step) {
        if (step.id === "fall-risk") fallBand.material = mat(0xf2c14b, { rough: 0.4 });
        if (step.id === "safe-transfer") { patient.root.position.x -= 0.5; }
        if (step.id === "hazard-scan") { looseLine.visible = false; untuckedFootrest.visible = false; }
        if (step.id === "handoff") {
          repaint(handoffPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,10,22,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#c97fd1"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#f6e3f8";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("HANDOFF", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Report given · Location logged", w * 0.06, h * 0.6);
          });
        }
        if (step.id === "log-complete") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,10,22,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#c97fd1"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#f6e3f8";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("TRIP LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: complete", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "dizzy-patient") nurseLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6 });
        if (it.id === "bed-brake-slip") bedBrake.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dizzy-patient") nurseLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.4 });
        if (it.id === "bed-brake-slip") bedBrake.material = mat(0x59c97b, { rough: 0.5 });
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "o2-check") {
          repaint(o2Panel.userData.screen, signFace(gg.t < 0.4 ? "LOW" : gg.t > 0.75 ? "CHECK" : "OK", {
            bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.75 ? "#59c97b" : "#f0645b", fg: "#f6e3f8", scale: 0.6,
          }));
        }
        if (session?.turn && session.step?.id === "footrest-deploy") footrests.rotation.x = -session.turn.amount * 1.2;
        void t;
      },
    };
  },
};
