import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  seatedFigure, mat, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cylinderTank,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Nitrous Oxide Monitoring VR — Dental & Oral Health.
// A hygienist administers nitrous oxide-oxygen sedation to an anxious patient
// under the Dental Hygiene Board of California's separate nitrous oxide
// permit for hygienists, inside the scope the state's practice act sets for
// that permit. The whole procedure sits on two numbers: the permit's ceiling
// on the concentration delivered to the patient, and NIOSH's recommended
// exposure limit of 25 ppm for everyone else breathing this room's air while
// it runs — which is why the fail-safe, the scavenging system and the room's
// own exhaust are checked before the mask ever touches a face.

const NOM_ACCENT = 0x8fd6c9;

export const SIM_NITROUS_OXIDE_MONITORING = {
  id: "nitrous-oxide-monitoring",
  index: "125",
  domain: "Dental & Oral Health",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "The Dental Hygiene Board of California's nitrous oxide-oxygen sedation permit for hygienists, held separately from the hygiene licence, and the scope the state dental practice act sets for it; NIOSH's recommended exposure limit for nitrous oxide of 25 ppm during administration and its scavenging-system guidance; the ADA's guidelines for the use of sedation and general anesthesia; OSHA 29 CFR 1910.1030 bloodborne pathogens for patient contact",
  name: "Nitrous Oxide Monitoring",
  title: simTitle("Nitrous Oxide Monitoring"),
  tagline: "Permit, patient screening, fail-safe and scavenging checks, titration and monitored recovery on a nitrous oxide-oxygen sedation",
  accent: NOM_ACCENT,
  accentCss: "#8fd6c9",
  parSeconds: 260,
  footprint: 2.3,
  badge: { id: "clean-titration", name: "Clean Titration", note: "Permit verified, screening clean, and the whole sedation held inside the permit's ceiling" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, which is also where an occupational exposure concern of your own belongs, with the ADHA's member resources behind it",

  game: system({
    name: "Sedation Practice",
    currency: "N2O",
    ranks: ["Permit Candidate", "Permitted Hygienist", "Sedation Lead", "Board Reviewer", "Sedation Certified"],
    badges: [
      { id: "screened-clean", name: "Screened Clean", note: "Every contraindication caught before the mask goes on", test: AWARD.stepClean("screening") },
      { id: "never-alone", name: "Never Alone", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-hand", name: "Steady Hand", note: "Titration held close to the plan's target", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "on-permit-time", name: "On Permit Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-sedation", name: "Clean Sedation", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "five-straight", name: "Five Straight", note: "Five correct actions in a row", test: AWARD.streak(5) },
    ],
  }),

  hazards: {
    "ignition-source": "That curing light is switched on next to a mask running oxygen. Oxygen-enriched air makes ordinary ignition sources burn hotter and faster than they do in room air — the mask is off, or the light is off, never both live at once.",
    "leave-patient": "You reached for the page instead of staying with your patient. A sedated patient is never left alone in the chair — respiratory depression and airway obstruction develop in the minute nobody is watching, which is why this permit requires continuous monitoring, not periodic checks.",
    "reused-hood": "That nasal hood is still creased from the last patient and was never in the sterilisation tray. A single-use scavenging hood goes in the waste after one patient; reusing it carries saliva and whatever it carried between two people who never consented to sharing it.",
    "bypass-fitting": "That quick-connect adapter routes nitrous straight to the mask around the blender's fail-safe. The fail-safe is the one thing standing between a set flow and a patient breathing pure nitrous oxide with no oxygen in the line at all — nothing on this cart is ever plumbed around it.",
  },

  lateNotes: {
    "flow-dial": "Not yet — the mask is not sealed to the patient's face and the scavenging line is not confirmed. Titrating flow into an open room helps nobody and simply raises the ambient reading.",
    "o2-recovery": "The sedation is still running. Recovery oxygen starts once the nitrous has been turned back down to zero, not before.",
    "discharge-checklist": "Recovery has not run its full course yet. The discharge criteria are checked once the patient has had the required minutes on 100 percent oxygen, not on the way there.",
  },

  steps: [
    {
      id: "permit-check", kind: "select", target: "permit-board",
      title: "Verify the permit and today's scope",
      cue: "Check the wall-mounted nitrous oxide permit and the practice act's scope for it.",
      why: "The Dental Hygiene Board of California issues this permit separately from the hygiene licence, and the state practice act is what actually authorises a hygienist to administer nitrous oxide-oxygen sedation rather than only monitor it. That authority is confirmed before the first tank valve turns, not assumed because the equipment is sitting there.",
    },
    {
      id: "screening", kind: "find", noHint: true,
      targets: ["screen-pregnancy", "screen-copd", "screen-nasal"],
      itemNames: {
        "screen-pregnancy": "pregnancy status on the chart",
        "screen-copd": "COPD history on the chart",
        "screen-nasal": "the patient's blocked nose",
      },
      itemNotes: {
        "screen-pregnancy": "First-trimester pregnancy is a relative contraindication the chart has to answer before the mask ever goes on — nitrous oxide is deferred in the first trimester where an alternative exists.",
        "screen-copd": "A patient who depends on a hypoxic drive to breathe can be pushed into respiratory depression by a gas mix built around adding oxygen, which is exactly what this delivery system does.",
        "screen-nasal": "A nose that will not pass air makes the whole delivery route pointless before the tank is even opened — nitrous oxide-oxygen sedation is delivered nasally, and a blocked airway defeats it at the mask.",
      },
      title: "Screen the patient before the mask goes on",
      cue: "Read the chart and look at your patient. Three things rule this sedation out or change it today.",
      why: "The screening happens before the equipment does anything, because a contraindication caught after the tanks are running is a contraindication answered by turning everything back off with a patient already part-sedated. Pregnancy, respiratory history and a nose that will not pass air are the three the practice act expects a permitted hygienist to catch every time.",
    },
    {
      id: "failsafe", kind: "select", target: "failsafe-indicator",
      title: "Confirm the fail-safe",
      cue: "Check the blender's fail-safe indicator — nitrous cannot flow without a minimum oxygen supply behind it.",
      why: "The fail-safe is the mechanical guarantee that this machine cannot deliver nitrous oxide without oxygen behind it, even if every dial on the front is turned wrong. Confirming it before use is what makes titration afterward a dosing decision instead of a bet on nothing else on the cart having failed first.",
    },
    {
      id: "o2-flush", kind: "select", target: "o2-flush",
      title: "Flush with 100% oxygen",
      cue: "Run the oxygen flush before the mask touches the patient's face.",
      why: "A flush clears whatever was left in the lines from the last patient and proves oxygen delivery works before nitrous is anywhere in the circuit. Every sedation on this cart starts and ends on oxygen alone — this is the start.",
    },
    {
      id: "scavenging", kind: "sequence",
      targets: ["scavenging-hose", "room-exhaust"],
      itemNames: { "scavenging-hose": "scavenging hose to the mask", "room-exhaust": "room exhaust" },
      title: "Connect scavenging and confirm the room's exhaust",
      cue: "Connect the scavenging hose to the mask, then confirm the room's exhaust is drawing.",
      why: "The scavenging mask carries the patient's exhaled nitrous oxide away before it becomes the room's air, and NIOSH's own guidance on scavenging is what this connection is built to satisfy. The room exhaust is the second layer behind it — together they are what keeps everyone else in this operatory under the 25 ppm recommended exposure limit for the whole appointment.",
      outOfOrderNote: "Scavenging connects to the mask before the room's exhaust is checked — confirming exhaust into a mask that is not yet capturing anything checks the wrong half of the system.",
    },
    {
      id: "mask-fit", kind: "drag", target: "nasal-mask",
      noRobot: true, forceClass: "light",
      robotNote: "A mask on a patient's face is airway equipment; fitting it belongs to the clinician.",
      title: "Fit the nasal mask",
      cue: "Fit the nasal hood to the patient and seat it against the face.",
      why: "A mask that is not sealed against the face leaks nitrous oxide into the room instead of delivering it to the patient — the patient gets an under-dose and the room gets the difference. A proper seal is what makes every reading after this one mean what it says.",
      drag: { to: "patient-face", radius: 0.35, missNote: "Not seated against the face. A gap at the mask is nitrous going into the room, not into the patient." },
    },
    {
      id: "titrate", kind: "gauge", target: "flow-dial",
      title: "Titrate nitrous up from oxygen in plan increments",
      cue: "Start on 100% oxygen and raise nitrous in the plan's increments — commit inside the effective band.",
      why: "Titration starts on pure oxygen and climbs in small increments toward the concentration this patient actually needs, never jumping to an estimated dose. Too little leaves an anxious patient still anxious and reaching for the mask themselves; going straight past the effective range for speed is how a sedation ends up needing rescue instead of recovery.",
      gauge: {
        label: "N2O CONCENTRATION", speed: 0.55, green: [0.28, 0.5],
        readout: (t) => `${Math.round(t * 70)}% N2O`,
        missNote: "Outside the titration band the plan sets for this patient — bring the flow back and commit inside it.",
      },
    },
    {
      id: "monitor-hold", kind: "hold", target: "patient-face", seconds: 9,
      noRobot: true, forceClass: "none",
      robotNote: "Staying with a sedated patient is a duty of care, not a task to delegate.",
      title: "Stay with the patient and watch for response",
      cue: "Hold your attention on the patient's face and breathing — do not leave them.",
      why: "A sedated patient is monitored continuously, not glanced at between other tasks, because the signs that a sedation has gone too deep — slowed breathing, a patient who stops answering you — develop over seconds and are missed by anyone who looked away. This permit exists on the premise that somebody is watching the whole time.",
      holdBreakNote: "You looked away before the check was finished. Continuous observation is the entire safety margin on a sedation with no reversal agent in routine use — hold the full watch.",
    },
    {
      id: "record", kind: "select", target: "record-chart",
      title: "Record the response and the concentration",
      cue: "Chart the patient's response and the delivered concentration — repeated every five minutes through the appointment.",
      why: "A response and a concentration written down every five minutes is what turns 'the patient seemed fine' into a record the board, the next hygienist and the patient's own chart can all rely on. It is also how a slow drift into over-sedation gets caught by the numbers before it is caught by anything else.",
    },
    {
      id: "concentration-hold", kind: "hold", target: "room-monitor", seconds: 6,
      title: "Confirm the room stays under the exposure limit",
      cue: "Hold on the ambient monitor and confirm the reading stays under the recommended limit through the appointment.",
      why: "NIOSH's recommended exposure limit for nitrous oxide during administration is 25 ppm, and the room monitor is the only thing that proves the scavenging and exhaust are actually holding that line rather than merely being connected. A reading that creeps up mid-appointment means somebody other than the patient is now the one being dosed.",
      holdBreakNote: "You stopped watching the monitor before the window closed — a creeping reading caught halfway through tells you nothing about whether it kept creeping.",
    },
    {
      id: "titrate-down", kind: "turn", target: "flow-dial",
      title: "Return to 100% oxygen",
      cue: "Turn the nitrous supply back to zero — 100% oxygen only — before recovery starts.",
      why: "Nitrous comes off before recovery begins, not during it — recovery is measured in minutes on oxygen alone, and that clock has no meaning while nitrous is still in the mix. Turning the dial back is a discrete, deliberate action, not something left to trail off on its own.",
      turn: { turns: 1, axis: "y", label: "N2O SUPPLY" },
    },
    {
      id: "recovery", kind: "hold", target: "o2-recovery", seconds: 8,
      title: "Recover on 100% oxygen",
      cue: "Hold the patient on 100% oxygen for the full recovery time the plan requires.",
      why: "Diffusion hypoxia is what happens when nitrous is stopped and the patient goes straight to room air — nitrous leaves the bloodstream faster than oxygen replaces it and dilutes the oxygen in the lungs on the way out. The minutes of 100% oxygen after the gas is off are what this recovery period exists to prevent, not a formality tacked onto the end.",
      holdBreakNote: "Recovery oxygen came off early. Diffusion hypoxia is the whole reason this period has a minimum length — cutting it short is cutting out the part that protects the patient.",
    },
    {
      id: "discharge", kind: "select", target: "discharge-checklist",
      title: "Confirm discharge criteria",
      cue: "Confirm the discharge criteria on the checklist before the patient stands.",
      why: "A patient who is alert, oriented and steady is the standard this checklist exists to confirm before they leave the chair, not an impression formed from across the room. Standing a patient up on the strength of how they look, ahead of the checklist, is how a steady-seeming patient buckles on the first step off the footrest.",
    },
  ],

  interrupts: [
    {
      id: "vacuum-loses-suction",
      kind: "Equipment fault",
      after: "monitor-hold", delay: 4, seconds: 12,
      alert: "The scavenging vacuum has gone quiet — it has lost suction, and the mask is no longer pulling exhaled gas away.",
      cue: "Check the scavenging connection, not the patient's dial.",
      target: "scavenging-hose",
      why: "A scavenging system that has lost suction stops protecting the room the instant it happens, and the room's exposure climbs from that second regardless of what the patient's own dial reads. The connection is what you check, because the fix is there, not at the flowmeter.",
      missNote: "The vacuum stayed off through the rest of the appointment. Every minute after that is a minute the room ran over the recommended exposure limit while the monitoring log still said the scavenging system was in use.",
      wrongNote: "It is the scavenging connection. The patient's dose has not changed — what changed is whether anyone else in the room is still protected from it.",
    },
    {
      id: "patient-oversedated",
      kind: "Patient reaction",
      after: "recovery", delay: 3, seconds: 11,
      alert: "The patient has gone quiet, looks nauseated and is slower to answer you than they were a minute ago — this is over-sedation, not calm.",
      cue: "Bring the concentration down. Do not wait to see if it passes.",
      target: "flow-dial",
      why: "Nausea and slowed responsiveness partway through a sedation are the early signs of going deeper than the plan intended, and the correct response is reducing the dose immediately rather than waiting to see whether it resolves on its own. Titration works in both directions, and backing off is not a failure of the plan — it is the plan.",
      missNote: "The concentration stayed where it was while the patient got quieter. Over-sedation does not correct itself, and the standard response — bringing the flow back down without delay — is the entire reason titration is adjustable in the first place.",
      wrongNote: "It is the flow dial. An over-sedated patient needs less nitrous now, not a different reading recorded about them.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, NOM_ACCENT);

    // ------------------------------------------------------------- dental chair
    const chair = group(g, -0.55, 0, -1.05, 0.35);
    slab(chair, 0.62, 0.5, 1.5, 0, 0.45, 0, 0x3c5a66, { radius: 0.08, rough: 0.6 });
    const back = slab(chair, 0.6, 0.9, 0.5, 0, 0.85, -0.75, 0x3c5a66, { radius: 0.07, rough: 0.6 });
    back.rotation.x = -0.55;
    const headrest = slab(chair, 0.32, 0.26, 0.14, 0, 1.42, -1.02, 0x3c5a66, { radius: 0.05, rough: 0.6 });
    headrest.rotation.x = -0.55;
    const base = cyl(chair, 0.26, 0.32, 0.42, 0, 0.22, 0, 0x4a545a, { rough: 0.4, metal: 0.5, seg: 16 });
    cyl(chair, 0.34, 0.34, 0.05, 0, 0.02, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    void base;

    // Cuspidor bowl and overhead operatory light — standard dental chair furniture.
    const cuspidorArm = group(chair, -0.5, 0, 0.15, 0.5);
    cyl(cuspidorArm, 0.02, 0.02, 0.55, 0, 0.5, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    cyl(cuspidorArm, 0.02, 0.02, 0.3, 0, 0.76, 0.15, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = 0.5;
    const bowl = cyl(cuspidorArm, 0.12, 0.06, 0.1, 0, 0.9, 0.28, 0xe8ecef, { rough: 0.25, seg: 18 });
    void bowl;
    cyl(cuspidorArm, 0.03, 0.03, 0.12, 0.1, 1.0, 0.2, 0xdfe4e8, { rough: 0.3, seg: 10 });
    const opLightArm = group(chair, 0.1, 0, 0.5, -0.3);
    cyl(opLightArm, 0.02, 0.02, 0.9, 0, 1.0, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    cyl(opLightArm, 0.02, 0.02, 0.4, 0, 1.4, 0.2, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = 0.9;
    const opLightHead = slab(opLightArm, 0.28, 0.08, 0.16, 0, 1.6, 0.4, 0xe8ecef, { radius: 0.03, rough: 0.4, metal: 0.2 });
    void opLightHead;
    ball(opLightArm, 0.02, 0, 1.56, 0.48, 0xfff6dc, { emissive: 0xfff6dc, ei: 1.0 });

    const patient = seatedFigure(chair, 0, 1.02, -0.42, { skin: 0xc99878, cloth: 0x6b7f8c, ry: -0.15 });
    // Robot training: this is a person, so the head and the torso are
    // keep-out volumes an embodied trainee never enters unless the step it
    // is working declares patient contact. See shared/robot-embodiment.js.
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    patient.torso.rotation.x = -0.55;
    patient.head.rotation.x = 0.5;
    reg(hits, patient.head, "patient-face");

    // Chart clip on the armrest with the three screening indicators.
    const chart = group(chair, 0.34, 0.5, 0.1, -0.2);
    slab(chart, 0.26, 0.34, 0.02, 0, 0.17, 0, 0xe8e2d0, { radius: 0.01, rough: 0.7 });
    decal(chart, 0.22, 0.28, 0, 0.17, 0.011, paperFace("PATIENT SCREEN", [
      "Pregnancy: 1st trimester", "History: COPD, mild", "Nasal: R side congested",
    ]));
    const pregTag = holoTag(chart, "Pregnancy status", 0.16, 0.3, 0.02, { css: "#f0645b", w: 0.34 });
    reg(hits, pregTag, "screen-pregnancy");
    const copdTag = holoTag(chart, "COPD history", 0.16, 0.2, 0.02, { css: "#f0645b", w: 0.28 });
    reg(hits, copdTag, "screen-copd");
    const noseTag = holoTag(patient.head, "Nasal congestion", 0.18, 0.02, 0.1, { css: "#f0645b", w: 0.3 });
    reg(hits, noseTag, "screen-nasal");

    // ------------------------------------------------------------- sedation cart
    const cart = group(g, 1.15, 0, -0.5, -0.4);
    slab(cart, 0.5, 0.9, 0.36, 0, 0.45, 0, 0x3a4148, { radius: 0.03, rough: 0.5, metal: 0.3 });
    const n2oTank = cylinderTank(cart, -0.32, -0.02, 0x3f7fc9, { plateLabel: "N2O", plateLines: ["NITROUS OXIDE", "USP"] });
    n2oTank.scale.setScalar(0.62);
    n2oTank.position.set(-0.32, 0, -0.02);
    const o2Tank = cylinderTank(cart, -0.02, -0.02, 0x59c97b, { plateLabel: "O2", plateLines: ["OXYGEN", "USP"] });
    o2Tank.scale.setScalar(0.62);
    o2Tank.position.set(-0.02, 0, -0.02);

    const blender = group(cart, 0, 0.92, 0.05);
    box(blender, 0.46, 0.24, 0.28, 0, 0, 0, 0xe8ecef, { rough: 0.4, metal: 0.2 });
    const flowScreen = decal(blender, 0.24, 0.09, 0, 0.03, 0.141,
      signFace("100% O2", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }), { glow: true, ei: 0.7 });
    const failsafeLamp = ball(blender, 0.018, -0.16, -0.06, 0.141, CITY.good, { emissive: CITY.good, ei: 1.6 });
    reg(hits, failsafeLamp, "failsafe-indicator");
    holoTag(blender, "Fail-safe indicator", -0.16, 0.1, 0.14, { css: "#8fd6c9", w: 0.34 });
    const flushBtn = box(blender, 0.05, 0.02, 0.05, 0.16, -0.06, 0.145, 0xf2c14b, { rough: 0.5 });
    reg(hits, flushBtn, "o2-flush");
    holoTag(blender, "O2 flush", 0.16, 0.1, 0.14, { css: "#59c97b", w: 0.24 });

    const flowKnob = group(blender, 0, -0.16, 0.141, 0);
    cyl(flowKnob, 0.035, 0.035, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.6, seg: 16 });
    const flowPointer = box(flowKnob, 0.03, 0.008, 0.008, 0, 0.016, 0.02, 0xdfe4e8, { rough: 0.4 });
    reg(hits, flowKnob, "flow-dial");

    // Mask and hose from the blender to the patient.
    const maskHose = hose(cart, [[0, 1.05, 0.2], [0, 1.1, 0.6], [-0.5, 1.15, 0.95]], 0.014, 0xdfe4e8, { steps: 16, rough: 0.5 });
    const mask = group(cart, -0.5, 1.15, 0.95);
    torus(mask, 0.045, 0.02, 0, 0, 0, 0xe8b23a, { rough: 0.5, seg: 8, seg2: 18 });
    ball(mask, 0.038, 0, 0, 0.012, 0xf2d78a, { rough: 0.5, opacity: 0.85 });
    reg(hits, mask, "nasal-mask");
    void maskHose;

    // Scavenging hose peeling off the mask to the wall vacuum port.
    const scavHose = hose(cart, [[-0.5, 1.13, 0.98], [-1.0, 0.9, 1.1], [-1.9, 0.4, 0.95]], 0.016, 0x7c8590, { steps: 16, rough: 0.6 });
    void scavHose;
    const vacPort = group(g, -0.75, 0, 0.45);
    box(vacPort, 0.18, 0.2, 0.1, 0, 0.4, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    holoTag(vacPort, "Scavenging line", 0, 0.55, 0, { css: "#8fd6c9", w: 0.34 });
    reg(hits, vacPort, "scavenging-hose");

    // Room exhaust readout on the wall.
    const exhaust = instrument(g, -2.1, 1.4, -1.4, { idle: "DRAW OK", color: NOM_ACCENT, w: 0.16, d: 0.24, ry: 0.5 });
    holoTag(exhaust, "Room exhaust", 0, 0.16, 0, { css: "#8fd6c9", w: 0.3 });
    reg(hits, exhaust, "room-exhaust");

    // Ambient room monitor near the chair — the NIOSH exposure-limit readout.
    const roomMonitor = instrument(g, 0.6, 1.35, 0.9, { idle: "-- ppm", color: NOM_ACCENT, w: 0.15, d: 0.22, ry: -0.6 });
    holoTag(roomMonitor, "Room N2O monitor", 0, 0.16, 0, { css: "#8fd6c9", w: 0.36 });
    reg(hits, roomMonitor, "room-monitor");

    // ------------------------------------------------------------- boards
    const permit = holoPanel(g, 0.56, 0.4, -1.9, 1.55, 0.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,18,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fd6c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#cdeee6";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DHBC NITROUS OXIDE PERMIT", w * 0.06, h * 0.15);
      ctx.fillStyle = "#eefaf5";
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Permit holder: hygienist of record", "Scope: N2O-O2 sedation, this office",
       "NIOSH REL: 25 ppm during administration", "Renewal current — see wall copy"]
        .forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.34 + i * 0.15)));
    }, { ry: 0.6, accent: NOM_ACCENT });
    reg(hits, permit, "permit-board");

    const chartBoard = group(g, 1.6, 0, 1.3, -0.3);
    box(chartBoard, 0.32, 0.02, 0.24, 0, 0.9, 0, 0x2b3138, { rough: 0.6 });
    const recordScreen = decal(chartBoard, 0.28, 0.2, 0, 0.91, 0,
      signFace("READY", { bg: "#0d1c24", accent: "#8fd6c9", fg: "#dfffea", scale: 0.5 }), { glow: true, ei: 0.65 });
    recordScreen.rotation.x = -Math.PI / 2;
    reg(hits, chartBoard, "record-chart");

    const dischargeBoard = holoPanel(g, 0.5, 0.36, 2.0, 1.5, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,18,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fd6c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eefaf5";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("DISCHARGE CRITERIA", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Alert · oriented · steady gait", w / 2, h * 0.62);
      ctx.fillText("Vitals at baseline", w / 2, h * 0.8);
    }, { ry: -0.5, accent: NOM_ACCENT });
    reg(hits, dischargeBoard, "discharge-checklist");

    // Recovery oxygen line, a separate simple nasal cannula on the tray.
    const recoveryCannula = group(cart, 0.18, 1.0, 0.3);
    torus(recoveryCannula, 0.03, 0.008, 0, 0, 0, 0xdfe4e8, { rough: 0.6, seg: 8, seg2: 14 });
    holoTag(recoveryCannula, "Recovery O2", 0, 0.1, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, recoveryCannula, "o2-recovery");

    // ------------------------------------------------------------- hazards
    // A curing light left on beside the running mask — ignition source in O2-enriched air.
    const curingLight = group(g, -0.1, 0, 1.1, 0.3);
    box(curingLight, 0.05, 0.14, 0.05, 0, 0.16, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    const lightTip = ball(curingLight, 0.022, 0, 0.24, 0, 0x7ee6ff, { emissive: 0x7ee6ff, ei: 1.8 });
    holoTag(curingLight, "Curing light — on", 0, 0.34, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, lightTip, "ignition-source");

    // A wall pager — the temptation to step out while the patient is sedated.
    const pager = group(g, -2.15, 0, 0.6, 0.5);
    box(pager, 0.16, 0.22, 0.06, 0, 1.3, 0, 0xdfe4e8, { rough: 0.5 });
    decal(pager, 0.13, 0.06, 0, 1.36, 0.031, signFace("PAGE", { bg: "#dfe4e8", fg: "#1d3b4a", accent: "#f0645b", scale: 0.55 }));
    holoTag(pager, "Answer the page?", 0, 1.5, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, pager, "leave-patient");

    // A reused nasal hood on the counter, still creased from the last patient.
    const oldHood = group(g, 1.9, 0, 1.3, -0.2);
    torus(oldHood, 0.04, 0.016, 0, 0.05, 0, 0xc7a86a, { rough: 0.85, seg: 8, seg2: 14 });
    holoTag(oldHood, "Nasal hood — reused?", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, oldHood, "reused-hood");

    // A bypass fitting sitting on the cart shelf, wired around the fail-safe.
    const bypass = group(cart, 0.16, 0.6, -0.15);
    cyl(bypass, 0.012, 0.012, 0.12, 0, 0, 0, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(bypass, "Bypass fitting", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, bypass, "bypass-fitting");

    // A backup oxygen cylinder against the wall, and a dental assistant clear of the controls.
    const backupO2 = cylinderTank(g, 2.15, -1.4, 0x59c97b, { plateLabel: "O2", plateLines: ["BACKUP SUPPLY"] });
    void backupO2;

    // Sink counter and supply cabinet against the back wall — the operatory's
    // own fixed furniture, dressed with the day's clutter rather than left bare.
    const sinkCounter = counter(g, 1.1, 0.5, -2.0, -2.0, 0xdfe4e8, { ry: 0 });
    box(sinkCounter, 0.32, 0.1, 0.3, 0, 0.97, 0, 0xc7d0d6, { radius: 0.02, rough: 0.3, metal: 0.2 });
    cyl(sinkCounter, 0.012, 0.012, 0.16, 0, 1.1, -0.1, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    for (let i = 0; i < 3; i++) {
      cyl(sinkCounter, 0.012, 0.012, 0.05 + i * 0.01, -0.3 + i * 0.28, 0.98, 0.12, 0xdfe4e8, { rough: 0.5, seg: 10 });
    }
    cabinet(g, 1.0, 0.5, 0.3, -2.0, 1.65, -2.0, 0xdfe4e8, { doorColor: 0xcfd8de });
    const stool = group(g, 0.25, 0, -1.9, 0.4);
    cyl(stool, 0.18, 0.2, 0.05, 0, 0.48, 0, 0x3c5a66, { rough: 0.6, seg: 16 });
    cyl(stool, 0.03, 0.03, 0.45, 0, 0.24, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 12 });
    cyl(stool, 0.2, 0.2, 0.03, 0, 0.02, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 16 });

    const assistant = standingFigure(g, 1.9, -0.15, { ry: -2.2, cloth: 0x4aa6a0 });
    void assistant;

    let flowState = 0;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(-0.4, 1.1, -0.6),

      onStepComplete(step, session) {
        if (step.id === "o2-flush") repaint(flowScreen, signFace("FLUSH OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "mask-fit") { mask.position.set(0.02, -0.02, 0.08); patient.head.add(mask); }
        if (step.id === "titrate") flowState = 1;
        if (step.id === "record") repaint(recordScreen, signFace("LOGGED", { bg: "#0d1c24", accent: "#8fd6c9", fg: "#dfffea", scale: 0.55 }));
        if (step.id === "titrate-down") { flowState = 0; repaint(flowScreen, signFace("100% O2", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 })); }
      },

      onInterrupt(it) {
        if (it.id === "vacuum-loses-suction") { vacPort.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.7, rough: 0.5 }); }
        if (it.id === "patient-oversedated") { patient.head.rotation.z = -0.35; patient.torso.rotation.z = -0.1; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vacuum-loses-suction") { vacPort.children[0].material = mat(0x8b929a, { rough: 0.5, metal: 0.4 }); }
        if (it.id === "patient-oversedated") { patient.head.rotation.z = 0; patient.torso.rotation.z = 0; }
      },

      animate(t, dt, session) {
        if (session?.turn && session.step?.id === "titrate-down") flowPointer.rotation.y = -session.turn.amount * Math.PI * 2;
        patient.head.rotation.y = -0.1 + Math.sin(t * 0.5) * 0.05;
        patient.torso.position.y = Math.sin(t * 1.2) * 0.004;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "titrate") {
          const pct = Math.round(gg.t * 70);
          repaint(flowScreen, signFace(`${pct}% N2O`, {
            bg: "#0d1c24", accent: pct >= 20 && pct <= 35 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (session?.step?.id === "concentration-hold" && session.holding) {
          const ppm = (18 + Math.sin(t * 2) * 3).toFixed(1);
          repaint(roomMonitor.userData.screen, signFace(`${ppm} ppm`, {
            bg: "#0d1c24", accent: Number(ppm) < 25 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
        void flowState;
      },
    };
  },
};
