import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, instrument, equipmentCabinet,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ultrasonic Scaling VR — Dental & Oral Health, station one hundred
// and twenty-two. A scaling and root planing appointment for a hygiene training
// programme: the waterline verified before anyone sits down, PPE and loupes on,
// the insert matched to the deposit, the evacuator doing its job continuously
// rather than only when somebody remembers it, and the operator's own wrist and
// shoulders held as carefully as the patient's root surfaces are.

const USC_ACCENT = 0x3fb8cc;
const USC_STEEL = 0x9aa6ac;
const USC_UPHOLSTERY = 0x3a6f7c;
const USC_CABINET = 0xe8edf0;

export const SIM_ULTRASONIC_SCALING = {
  id: "ultrasonic-scaling",
  index: "122",
  domain: "Healthcare",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "SEIU and UFCW dental and clinic staff, and the ADHA as the hygiene profession's own body; the Dental Hygiene Board of California and the state dental practice act on scope of practice and local anesthesia; the CDC's Guidelines for Infection Control in Dental Health-Care Settings, including its dental unit waterline standard of no more than 500 CFU/mL of heterotrophic bacteria; OSHA 29 CFR 1910.1030 bloodborne pathogens; NIOSH's guidance on dental ergonomics and neutral posture at the operatory",
  name: "Ultrasonic Scaling",
  title: simTitle("Ultrasonic Scaling"),
  tagline: "A scaling and root planing appointment: the waterline verified and flushed, PPE and loupes on, the insert matched to the deposit, the evacuator held on the aerosol, the tip adapted and kept moving, and the operator's own wrist and shoulders held neutral through the whole appointment",
  accent: USC_ACCENT,
  accentCss: "#3fb8cc",
  parSeconds: 265,
  footprint: 2.4,
  badge: { id: "srp-clean-run", name: "Clean Debridement", note: "A full scaling and root planing appointment with the waterline verified, the insert adapted correctly and posture held neutral throughout" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "the ADHA's member resources on hygienist ergonomics and career longevity, or your employer's employee assistance program",

  game: system({
    name: "Operatory Standard",
    currency: "CALC",
    ranks: ["Chairside Aide", "Registered Hygienist", "Perio Specialist", "Clinical Lead", "Operatory Certified"],
    badges: [
      { id: "water-verified", name: "Water Verified", note: "Waterline log checked and the line flushed before the handpiece touched the patient", test: AWARD.stepClean("waterline-flush") },
      { id: "neutral-adaptation", name: "Neutral Adaptation", note: "Every graded reading held near band centre", test: AWARD.precise(0.72) },
      { id: "clean-field", name: "Clean Field", note: "No unsafe action across the whole appointment", test: AWARD.safe },
    ],
    challenges: [
      { id: "on-schedule", name: "On Schedule", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-run", name: "Clean Run", note: "No corrections the whole appointment", test: AWARD.clean },
      { id: "steady-hand", name: "Steady Hand", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "low-stool": "That is the stool the way it was left, not the way it was set. Sitting hunched into a chair adjusted for the patient rather than for you is exactly the posture NIOSH's dental ergonomics guidance ties to the profession's very high rate of wrist, neck and shoulder injury — the damage is cumulative and it starts on ordinary days like this one.",
    "flat-adapt-model": "That teaching model is set up showing the tip laid flat against the facial surface. Adapting an ultrasonic insert flat or perpendicular instead of at the manufacturer's working angle gouges cementum and root surface that has no enamel left to protect it, and can burn the tissue underneath if the tip ever sits still at that angle.",
    "hve-uncradled": "The evacuator is lying loose on the tray instead of seated in its holder. An ultrasonic tip aerosolises the biofilm and calculus it is removing continuously, not only when the handpiece is running loudest, and a suction line off its mount is a suction line doing nothing for the room's air.",
    "capped-irrig-tip": "That spare insert's irrigation channel is visibly capped. Loading a tip whose water passage is blocked drives the heat a vibrating insert generates straight into the tooth and, in a deep pocket, toward the pulp — the tip runs dry however careful the technique is around it.",
  },

  lateNotes: {
    "scaler-handpiece": "Not yet. The tip for this deposit has not been chosen and the power has not been set — picking up the handpiece now means guessing at both.",
    "hve-tip": "The evacuator is seated later, once the handpiece is about to start running. Positioning it now just means moving it twice.",
    "explorer": "The explorer verifies a surface after it has actually been debrided. There is nothing to check yet.",
  },

  steps: [
    {
      id: "posture-setup", kind: "select", target: "operator-stool",
      title: "Set the stool and chair for neutral posture",
      cue: "Adjust your stool height and the chair position before you pick up anything.",
      why: "Posture is set before the first instrument, not adjusted around it. NIOSH's dental ergonomics guidance ties the profession's very high rate of wrist, neck and shoulder injury to exactly this habit — reaching down into a chair set for the patient's comfort rather than for the clinician's. The stool comes up and the chair goes back until your forearms sit roughly parallel to the floor and your shoulders can actually drop.",
    },
    {
      id: "pre-check", kind: "find", noHint: true,
      targets: ["worn-tip-indicator", "full-suction-trap", "expired-strip"],
      itemNames: {
        "worn-tip-indicator": "the insert past its wear line",
        "full-suction-trap": "the vacuum system's full solids trap",
        "expired-strip": "the out-of-date water test strip",
      },
      itemNotes: {
        "worn-tip-indicator": "This insert's wear indicator line has already been reached. Manufacturers put that mark there because efficiency drops sharply past it — roughly half its removal power is already gone, whatever the ultrasound sounds like.",
        "full-suction-trap": "The solids trap on the vacuum line is full. A full trap chokes suction exactly when the evacuator is needed most, and nobody notices until the aerosol it should have caught is already in the air.",
        "expired-strip": "The last waterline test strip on the counter is weeks past its result date. An old result is not evidence the line is clean today — it is evidence nobody has checked since.",
      },
      title: "Walk the delivery unit before you seat anyone",
      cue: "Three things on this unit are not ready for a patient. Find them by looking.",
      why: "None of these three failures announce themselves the way a dropped instrument does — a worn tip still cuts something, a full trap still sounds like suction, and an old test strip still sits in the drawer looking official. Catching them here, before the chair reclines, is the only point in the appointment where finding one costs nothing but a look.",
    },
    {
      id: "chart-review", kind: "select", target: "perio-chart",
      title: "Read the periodontal chart and medical history",
      cue: "Check the pocket depths and the medical history before the tip goes anywhere.",
      why: "Pocket depths on the chart are what tell you which insert and which power setting this quadrant actually needs, and the medical history is where an anticoagulant, an implanted cardiac device or a latex allergy shows up before it becomes a problem in the chair rather than after. Skipping straight to the handpiece treats every mouth in this operatory as the same mouth.",
    },
    {
      id: "waterline-check", kind: "select", target: "waterline-log",
      title: "Confirm today's shock-and-test result",
      cue: "Check the line has been shocked and tested to schedule, not just plumbed in.",
      why: "The CDC holds dental unit water for non-surgical procedures to the same 500 CFU/mL heterotrophic-plate-count ceiling that public drinking water is held to — and biofilm inside these narrow lines builds toward that limit on its own schedule whether or not anyone remembers to shock and test the system. A log with no recent result is not evidence the water is safe; it is evidence nobody looked.",
    },
    {
      id: "waterline-flush", kind: "hold", target: "waterline-valve", seconds: 8,
      title: "Flush the line to waste",
      cue: "Run the line to waste and hold the flush for the full count before it ever touches the patient.",
      why: "CDC guidance calls for flushing waterlines and handpieces for the recommended interval at the start of the day and between patients, discharging the water that sat stagnant in the tubing overnight rather than the first thing that touches somebody's mouth. A quick tap of the pedal is not the flush — it only looks like the flush.",
      holdBreakNote: "You let go before the flush ran its course. Reseat the valve and hold the full interval — a half-flushed line still delivers whatever grew in it overnight.",
    },
    {
      id: "rinse", kind: "select", target: "prerinse-cup",
      forceClass: "light",
      robotNote: "Handing the rinse cup up to the patient: contact with the person, no force in it.",
      title: "Give the patient the pre-procedural rinse",
      cue: "Have the patient rinse with the antimicrobial pre-procedural rinse before you start.",
      why: "A pre-procedural antimicrobial rinse is standard CDC infection-control practice before an aerosol-generating instrument goes to work, because it cuts the microbial load in the spray before that spray ever leaves the mouth. It is protecting you and whoever else is in the room, not the patient's teeth.",
    },
    {
      id: "ppe-sequence", kind: "sequence",
      targets: ["loupes", "mask", "gloves"],
      itemNames: { loupes: "loupes", mask: "mask", gloves: "gloves" },
      title: "Put on loupes, mask, then gloves",
      cue: "Loupes and mask first, gloves last, over hands already sanitised.",
      why: "Loupes and mask go on first, before anything else touches your face; gloves go on last, over hands already sanitised, so they stay the clean barrier OSHA's bloodborne pathogens standard treats them as. Reverse it and the last thing you touch before gloving is a loupe frame or a mask strap that just picked up whatever was on your hands a moment before.",
      outOfOrderNote: "Wrong order — loupes and mask go on first; gloves go on last, over already-sanitised hands, or they stop being a clean barrier.",
    },
    {
      id: "tip-select", kind: "select", target: "scaler-tip-perio",
      title: "Choose the insert for this deposit",
      cue: "Choose the slim perio insert the chart calls for, not whatever was already in the tray.",
      why: "A heavier universal tip clears supragingival calculus fast but is too bulky to adapt subgingivally without gouging cementum; a slim perio insert reaches root surfaces without harming them but will not touch heavy bridging calculus. Matching the insert to what the chart actually shows is what separates efficient debridement from either burnishing calculus smooth or roughing up a root that already has no enamel on it.",
    },
    {
      id: "power-set", kind: "gauge", target: "power-dial",
      title: "Set the power for this insert and deposit",
      cue: "Set the power for this insert and this deposit, then commit the reading.",
      why: "Too little power burnishes calculus into a smooth, sealed layer that reattaches almost immediately; too much power chatters the tip against enamel and root surface and turns a controlled instrument into one that gouges. A piezoelectric unit runs this deposit low-to-moderate because the frequency is doing the work — pushing the dial up is not the same as pushing the tip harder.",
      gauge: {
        label: "POWER SETTING", speed: 0.75, green: [0.3, 0.55],
        readout: (t) => (t < 0.3 ? "low" : t > 0.55 ? "high" : `${Math.round(t * 100)}%`),
        missNote: "Outside the setting this insert and this deposit call for. Recheck the manufacturer's chart for the tip you loaded rather than guessing at the dial.",
      },
    },
    {
      id: "hve-position", kind: "select", target: "hve-tip",
      title: "Seat the evacuator in its holder",
      cue: "Seat the high-volume evacuator in the holder before the handpiece starts running.",
      why: "An ultrasonic tip aerosolises the very biofilm and calculus it is removing, and the evacuator is what pulls that spray out of the breathing zone before it settles on a surface or into a lung — yours or the patient's. Seated in the holder rather than left on the tray, it is doing its job continuously instead of only when somebody remembers to pick it up.",
    },
    {
      id: "retraction", kind: "hold", target: "mouth-mirror", seconds: 8,
      noRobot: true, forceClass: "light",
      robotNote: "The mirror is inside the mouth, holding tissue off the working field.",
      title: "Hold the mirror for retraction and visibility",
      cue: "Hold the mirror steady for retraction and visibility on the posterior surface.",
      why: "The mirror is doing two things at once here: retracting the cheek or tongue clear of a moving tip, and giving you the only view you have of a posterior lingual surface you cannot see directly. Let it drift and the tissue it was holding back falls against an instrument that has no way of telling calculus from a cheek.",
      holdBreakNote: "You let the mirror drop before the surface was clear. Reseat the retraction and hold it — that tissue is not clear of the tip until you do.",
    },
    {
      id: "adapt-tip", kind: "track", target: "scaler-handpiece", seconds: 10,
      noRobot: true, forceClass: "light",
      robotNote: "An ultrasonic tip on a root surface is the exact reason a robot does not do this step.",
      title: "Adapt the tip and keep it moving",
      cue: "Keep the lateral surface adapted at the manufacturer's angle, and keep it moving.",
      why: "The manufacturer's angle for these inserts is a narrow window either side of parallel to the tooth surface. Lay the tip flatter and it burnishes deposit smooth instead of removing it; tip it steeper and the point starts gouging cementum and root surface that has no enamel left to protect it. A tip held still at any angle overheats a spot it was designed never to sit on.",
      track: {
        start: 0.12, green: [0.3, 0.55], rise: 0.5, fall: 0.42, drift: 0.12, label: "ADAPTATION ANGLE",
        readout: (v) => (v < 0.3 ? "too flat — burnishing the surface" : v > 0.55 ? "too steep — gouging the root" : "adapted and moving"),
      },
      holdBreakNote: "The adaptation drifted out of the window. Bring it back and keep moving — dwelling here at any angle risks the root surface or the pulp underneath it.",
    },
    {
      id: "water-flow-check", kind: "gauge", target: "flow-dial",
      title: "Confirm the spray at the tip",
      cue: "Dial the lavage to a fine halo of mist at the tip — not a drip, not a jet — then commit the reading.",
      gauge: {
        label: "LAVAGE FLOW", speed: 0.7, green: [0.4, 0.68],
        readout: (t) => (t < 0.4 ? "dripping — tip will heat" : t > 0.68 ? "flooding the field" : "fine halo of mist"),
        missNote: "Off the band. A drip cannot carry the heat off an insert vibrating this fast, and a jet floods the field so you cannot see the surface you are instrumenting — bring it back to a visible halo of mist at the working end.",
      },
      why: "The water is not there for comfort — it is what carries heat away from a tip vibrating tens of thousands of times a second, and a dry or under-irrigated insert sends that heat straight into the tooth and, in a deep pocket, toward the pulp. A visible fan of fine spray at the working end is the check; the flow rate is not something you can judge by ear over suction alone.",
    },
    {
      id: "explorer-verify", kind: "select", target: "explorer",
      noRobot: true, forceClass: "light",
      robotNote: "The explorer is intraoral, and it is sharp.",
      title: "Verify the surface with the explorer",
      cue: "Verify the root surface is smooth with the explorer before moving on.",
      why: "An ultrasonic tip tells you what it removed by sound and feel; the explorer is what actually confirms the root surface underneath is smooth rather than still catching on a burnished ledge of calculus. Evidence-based root debridement calls for a tactile check, not a visual one — subgingival calculus rarely shows and almost always feels.",
    },
    {
      id: "comfort-check", kind: "select", target: "patient-signal",
      noRobot: true, forceClass: "none",
      robotNote: "Checking in with the patient is a conversation, not a reach.",
      title: "Check in with the patient",
      cue: "Check in with the patient and confirm the anesthesia plan is within your scope here.",
      why: "Whether you can administer local anesthesia at all, and under what supervision, is set by the Dental Hygiene Board of California and this state's dental practice act, not by what would be convenient in the chair — some settings require additional certification and a supervision level this operatory may or may not have on hand. Checking that before instrumenting a sensitive area is what keeps the appointment inside your actual scope of practice.",
    },
  ],

  interrupts: [
    {
      id: "waterline-dry",
      kind: "Equipment fault",
      after: "adapt-tip", delay: 4, seconds: 12,
      alert: "The spray at the tip has stopped. The line has run dry mid-scaling and the insert is buzzing against a hot, unlubricated surface.",
      cue: "No spray at the tip — the line has run dry.",
      target: "flow-dial",
      why: "A vibrating insert with no water reaching it stops cooling and starts heating the exact tooth structure it was cutting a moment ago, and in a deep pocket that heat has nowhere to go but toward the pulp. The fix is the flow control, not more pressure on the tooth.",
      missNote: "You kept working the dry tip. A few more seconds of a hot, unlubricated insert against that root surface is enough to leave a burn injury on tissue that gives no other warning before it happens.",
      wrongNote: "It is the flow control. Restoring the water is what stops the heat — nothing else at this chair does.",
    },
    {
      id: "gag-reflex",
      kind: "Patient reaction",
      after: "retraction", delay: 3, seconds: 11,
      alert: "The patient's head snaps forward and they gag hard, jerking toward the moving tip still in your hand.",
      cue: "The patient just moved toward the tip — get off the pedal.",
      target: "foot-pedal",
      why: "A gag reflex arrives with no warning, and a hand still moving toward a mouth that is coming toward it at the same moment is exactly how a vibrating tip clips soft tissue instead of a root surface. The foot comes off the pedal before anything else happens.",
      missNote: "The handpiece kept running through the movement. Most of the time nothing catches; the times it does, it is a soft-tissue laceration from an instrument that was still active when it should not have been.",
      wrongNote: "It is the pedal. Stopping the instrument is the only response that matters in the second a patient's head is already moving toward it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, USC_ACCENT);

    // ---------------------------------------------------------- dental chair
    const chairBase = group(g, 0, 0, -0.5);
    cyl(chairBase, 0.22, 0.26, 0.1, 0, 0.05, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    cyl(chairBase, 0.09, 0.1, 0.42, 0, 0.31, 0, USC_STEEL, { rough: 0.35, metal: 0.75, seg: 16 });
    const chairSeatGroup = group(chairBase, 0, 0.52, 0);
    slab(chairSeatGroup, 0.62, 0.14, 0.66, 0, 0, 0.28, USC_UPHOLSTERY, { radius: 0.07, rough: 0.6 });
    const chairBack = group(chairSeatGroup, 0, 0.05, -0.22);
    slab(chairBack, 0.6, 0.9, 0.14, 0, 0.4, 0, USC_UPHOLSTERY, { radius: 0.07, rough: 0.6 });
    chairBack.rotation.x = 0.42; // reclined
    const headrest = slab(chairBack, 0.34, 0.24, 0.1, 0, 0.98, 0.02, USC_UPHOLSTERY, { radius: 0.06, rough: 0.6 });
    for (const sx of [-1, 1]) {
      slab(chairSeatGroup, 0.1, 0.06, 0.62, sx * 0.34, 0.09, 0.28, USC_STEEL, { radius: 0.02, rough: 0.4, metal: 0.6 });
    }

    // Reclined patient, lying back into the chair with the mouth toward the
    // operator's side of the headrest.
    const patient = seatedFigure(chairSeatGroup, 0, 0.08, 0.42, { skin: 0xcd9a72, cloth: 0x8fa3ad });
    // Robot training: this is a person, so the head and the torso are
    // keep-out volumes an embodied trainee never enters unless the step it
    // is working declares patient contact. See shared/robot-embodiment.js.
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    patient.root.rotation.x = 0.42;
    patient.torso.rotation.x = -0.02;
    reg2(patient.head, "patient-signal");

    // ---------------------------------------------------------- bracket table
    const bracket = group(g, -0.62, 0, -0.55, 0.3);
    cyl(bracket, 0.05, 0.06, 0.7, 0, 0.35, 0, USC_STEEL, { rough: 0.3, metal: 0.75, seg: 12 });
    const trayTop = slab(bracket, 0.46, 0.03, 0.3, 0.1, 0.71, 0, 0xf2f5f7, { radius: 0.02, rough: 0.35, metal: 0.1 });
    const mirror = group(bracket, -0.05, 0.735, -0.02);
    cyl(mirror, 0.028, 0.028, 0.004, 0, 0, 0, 0xdfe8ee, { rough: 0.1, metal: 0.85, seg: 16 });
    cyl(mirror, 0.005, 0.005, 0.14, 0, -0.075, 0, USC_STEEL, { rough: 0.2, metal: 0.9, seg: 8 });
    reg2(mirror, "mouth-mirror");
    const explorerTool = group(bracket, 0.05, 0.735, -0.05);
    cyl(explorerTool, 0.004, 0.001, 0.13, 0, 0, 0, USC_STEEL, { rough: 0.15, metal: 0.9, seg: 8 });
    cyl(explorerTool, 0.006, 0.006, 0.09, 0, -0.1, 0, 0x2b3138, { rough: 0.5, seg: 8 });
    reg2(explorerTool, "explorer");
    const prerinse = cyl(bracket, 0.035, 0.03, 0.06, 0.16, 0.745, 0.06, 0xdfe8ee, { rough: 0.15, opacity: 0.6, seg: 14 });
    reg2(prerinse, "prerinse-cup");

    // ------------------------------------------------------- delivery unit
    const unit = group(g, 0.95, 0, -0.85, -0.35);
    box(unit, 0.1, 0.1, 0.1, 0, 0.05, 0, 0x2b3138, { rough: 0.7, cast: false }); // plinth
    cyl(unit, 0.06, 0.07, 1.15, 0, 0.62, 0, USC_STEEL, { rough: 0.3, metal: 0.7, seg: 16 });
    const controlHead = group(unit, 0, 1.22, 0);
    slab(controlHead, 0.42, 0.28, 0.16, 0, 0, 0, USC_CABINET, { radius: 0.02, rough: 0.4, metal: 0.15 });
    const powerDial = instrument(controlHead, 0, 0.02, 0.09, { w: 0.13, d: 0.13, idle: "--", color: USC_ACCENT, ry: 0 });
    reg2(powerDial, "power-dial");
    const flowKnob = cyl(controlHead, 0.022, 0.022, 0.03, -0.14, 0, 0.09, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 14 });
    flowKnob.rotation.x = Math.PI / 2;
    reg2(flowKnob, "flow-dial");
    const wLog = decal(controlHead, 0.14, 0.1, 0.16, 0.05, 0.082,
      paperFace("WATERLINE", ["Shock: this AM", "Test: 210 CFU/mL", "Limit: 500 CFU/mL"], { bg: "#eef2ee" }), { px: 220 });
    reg2(wLog, "waterline-log");
    const wValve = cyl(unit, 0.018, 0.018, 0.05, 0.1, 1.02, 0.08, 0xd8a23b, { rough: 0.4, metal: 0.6, seg: 10 });
    reg2(wValve, "waterline-valve");
    const flushSpray = particles(unit, 20, 0xbfe8f2, { size: 0.012, life: 0.35, additive: false, opacity: 0.55 });

    // Handpiece and its coiled cord, cradled on the unit until it is picked up.
    const handpiece = group(unit, -0.18, 1.02, 0.1, -0.2);
    cyl(handpiece, 0.017, 0.02, 0.16, 0, 0, 0, 0x3a4048, { rough: 0.4, metal: 0.4, seg: 12 });
    const tipLive = cyl(handpiece, 0.0025, 0.0015, 0.045, 0.01, 0.1, 0, USC_STEEL, { rough: 0.15, metal: 0.9, seg: 6 });
    hose(unit, [[-0.18, 1.02, 0.1], [-0.05, 0.85, 0.14], [0.05, 0.7, 0.1], [0, 0.6, 0.02]], 0.012, 0x2b3138, { steps: 14, rough: 0.7 });
    reg2(handpiece, "scaler-handpiece");

    // Tip caddy: the perio tip the step wants, a heavier decoy tip, a spare
    // whose irrigation channel is capped, and one visibly past its wear line.
    const caddy = group(unit, 0.16, 1.0, 0.11);
    box(caddy, 0.16, 0.02, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    const tipPerio = cyl(caddy, 0.006, 0.003, 0.1, -0.05, 0.06, 0, USC_STEEL, { rough: 0.15, metal: 0.9, seg: 8 });
    reg2(tipPerio, "scaler-tip-perio");
    const tipHeavy = cyl(caddy, 0.009, 0.005, 0.09, 0.02, 0.05, 0, USC_STEEL, { rough: 0.2, metal: 0.85, seg: 8 });
    reg2(tipHeavy, "scaler-tip-heavy");
    const tipCapped = group(caddy, 0.055, 0.05, 0);
    cyl(tipCapped, 0.006, 0.003, 0.08, 0, 0, 0, 0xb8c0c6, { rough: 0.3, metal: 0.7, seg: 8 });
    ball(tipCapped, 0.005, 0, 0.045, 0, 0xd8232a, { rough: 0.6 });
    reg2(tipCapped, "capped-irrig-tip");
    const tipWorn = group(caddy, -0.02, 0.05, -0.028);
    cyl(tipWorn, 0.0055, 0.0025, 0.085, 0, 0, 0, 0x8b929a, { rough: 0.6, metal: 0.5, seg: 8 });
    box(tipWorn, 0.012, 0.003, 0.003, 0, -0.02, 0.006, 0xd8232a, { rough: 0.5, cast: false });
    reg2(tipWorn, "worn-tip-indicator");

    // -------------------------------------------------------------- HVE arm
    const hveHolder = group(unit, 0.22, 0.95, -0.12);
    box(hveHolder, 0.05, 0.1, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.6, cast: false });
    const hveWand = group(hveHolder, 0, 0.14, 0);
    cyl(hveWand, 0.016, 0.02, 0.22, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.3, seg: 12 });
    hveWand.rotation.z = 0.25;
    reg2(hveHolder, "hve-tip");
    // The uncradled twin, lying loose on the bracket tray — the trap.
    const hveLoose = group(bracket, 0.16, 0.735, 0.08, 0.6);
    cyl(hveLoose, 0.016, 0.02, 0.2, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.3, seg: 12 });
    hveLoose.rotation.z = Math.PI / 2;
    reg2(hveLoose, "hve-uncradled");

    // A full solids trap under the unit's vacuum line.
    const trap = cyl(unit, 0.05, 0.05, 0.09, -0.1, 0.2, -0.06, 0x8b6a3a, { rough: 0.55, metal: 0.1, seg: 14, opacity: 0.65 });
    reg2(trap, "full-suction-trap");

    // ------------------------------------------------------------ operator stool
    const stool = group(g, 0.7, 0, 0.55, -0.6);
    cyl(stool, 0.19, 0.2, 0.06, 0, 0.03, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(stool, 0.03, 0.035, 0.5, 0, 0.29, 0, USC_STEEL, { rough: 0.3, metal: 0.8, seg: 12 });
    const stoolSeat = slab(stool, 0.36, 0.09, 0.34, 0, 0.58, 0, 0x2f6f7c, { radius: 0.1, rough: 0.65 });
    reg2(stool, "operator-stool");

    // The decoy: an assistant's stool never raised off its lowest setting.
    const lowStool = group(g, -1.5, 0, 0.7, 0.4);
    cyl(lowStool, 0.18, 0.19, 0.05, 0, 0.025, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 16 });
    cyl(lowStool, 0.028, 0.03, 0.16, 0, 0.11, 0, USC_STEEL, { rough: 0.3, metal: 0.8, seg: 10 });
    slab(lowStool, 0.32, 0.08, 0.3, 0, 0.23, 0, 0x5a656d, { radius: 0.09, rough: 0.7 });
    reg2(lowStool, "low-stool");

    // Foot pedal near the base of the chair — the answer to the gag reflex.
    const pedal = group(g, 0.32, 0, 0.15);
    slab(pedal, 0.14, 0.03, 0.2, 0, 0.015, 0, 0x2b3138, { radius: 0.02, rough: 0.6 });
    box(pedal, 0.08, 0.02, 0.1, 0, 0.035, -0.03, 0x3a4048, { rough: 0.6 });
    reg2(pedal, "foot-pedal");

    // -------------------------------------------------------------- side cabinet
    const cabinet = equipmentCabinet(g, 0.9, 0.95, 0.5, -2.6, -1.6, { ry: 0.4, color: USC_CABINET, doorColor: USC_CABINET, rough: 0.4, metal: 0.1, weathered: false });
    const chartHolder = holoPanel(g, 0.5, 0.36, -2.4, 1.55, -1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,16,18,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#3fb8cc"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c9e7ec";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PERIO CHART — QUAD 3", w * 0.06, h * 0.16);
      ctx.fillStyle = "#eaf6f8";
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Pocket depths: 4-6mm", "Bleeding on probing: yes", "Anticoag: none noted", "Pacer/AICD: none noted"]
        .forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.36 + i * h * 0.15));
    }, { ry: 0.5, accent: USC_ACCENT });
    reg2(chartHolder, "perio-chart");
    const expiredStrip = decal(cabinet, 0.1, 0.14, 0.25, 0.98, 0.22,
      paperFace("H2O TEST", ["Result: --", "Read: 41 days ago"], { bg: "#efe6c9", worn: true }), { px: 160 });
    expiredStrip.rotation.x = -Math.PI / 2.3;
    reg2(expiredStrip, "expired-strip");

    // ------------------------------------------------------------- PPE stand
    const ppe = group(g, 2.7, 0, -0.3, -1.3);
    slab(ppe, 0.34, 0.85, 0.07, 0, 0.45, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.4 });
    box(ppe, 0.36, 0.03, 0.09, 0, 0.87, 0, USC_ACCENT, { emissive: USC_ACCENT, ei: 0.3, rough: 0.5, cast: false });
    const loupesFrame = group(ppe, 0, 0.7, 0.055);
    torus(loupesFrame, 0.028, 0.006, -0.045, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    torus(loupesFrame, 0.028, 0.006, 0.045, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    box(loupesFrame, 0.05, 0.01, 0.01, 0, 0, 0, 0x2b3138, { rough: 0.4 });
    for (const sx of [-1, 1]) box(loupesFrame, 0.014, 0.03, 0.005, sx * 0.075, 0.01, 0.02, 0x2b3138, { rough: 0.4 });
    reg2(loupesFrame, "loupes");
    const maskBox = box(ppe, 0.2, 0.09, 0.05, 0, 0.45, 0.045, 0x2f6f7c, { rough: 0.5 });
    decal(maskBox, 0.16, 0.06, 0, 0, 0.026, signFace("MASK", { bg: "#0f4257", accent: "#6cc6f0", scale: 0.6 }));
    reg2(maskBox, "mask");
    const gloveBox = box(ppe, 0.16, 0.09, 0.1, 0, 0.2, 0.045, 0xeaf2f4, { rough: 0.55 });
    decal(gloveBox, 0.13, 0.05, 0, 0.05, 0.051, signFace("GLOVES", { bg: "#eaf2f4", fg: "#0f4257", accent: "#3fb8cc", scale: 0.5 }));
    reg2(gloveBox, "gloves");

    // ------------------------------------------------------ sterilisation counter
    const farCounter = group(g, -4.3, 0, -1.2, Math.PI / 2);
    slab(farCounter, 2.1, 0.06, 0.55, 0, 0.9, 0, 0xdfe4e8, { radius: 0.02, rough: 0.4, metal: 0.1 });
    for (let i = -1; i <= 1; i++) box(farCounter, 0.5, 0.86, 0.5, i * 0.65, 0.43, 0, 0xc9d0d4, { rough: 0.5, metal: 0.1 });
    const pouches = group(farCounter, 0.4, 0.94, 0);
    for (let i = 0; i < 5; i++) box(pouches, 0.16, 0.02, 0.08, -0.3 + i * 0.15, i * 0.021, 0, 0xdfe8ee, { rough: 0.3, opacity: 0.55, cast: false });
    const sharpsBin = group(farCounter, -0.9, 0.9, 0);
    box(sharpsBin, 0.16, 0.24, 0.12, 0, 0.12, 0, 0xd8342a, { rough: 0.6 });
    decal(sharpsBin, 0.13, 0.06, 0, 0.14, 0.061, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#fff", scale: 0.5 }));

    // A chairside teaching typodont on the counter, set up wrong — the tip
    // held flat against the facial surface instead of at the working angle.
    const typodont = group(farCounter, 0.85, 0.94, 0.12, 0.3);
    box(typodont, 0.1, 0.06, 0.14, 0, 0.03, 0, 0xf2ede0, { rough: 0.5 });
    for (let i = 0; i < 6; i++) box(typodont, 0.014, 0.03, 0.014, -0.035 + i * 0.014, 0.075, 0.05, 0xf6f2ea, { rough: 0.3 });
    const demoTip = cyl(typodont, 0.004, 0.002, 0.07, 0, 0.09, 0.05, USC_STEEL, { rough: 0.2, metal: 0.85, seg: 8 });
    demoTip.rotation.z = Math.PI / 2; // laid flat against the facial surface
    reg2(typodont, "flat-adapt-model");

    // A bank of labelled supply drawers under the cabinet, and jarred
    // consumables on top of it — the ordinary furniture of a working bay.
    const drawerUnit = group(g, -2.6, 0, -0.75, 0.4);
    slab(drawerUnit, 0.7, 0.5, 0.4, 0, 0.25, 0, USC_CABINET, { radius: 0.02, rough: 0.5, metal: 0.1 });
    for (let i = 0; i < 4; i++) {
      const dz = -0.26 + i * 0.17;
      box(drawerUnit, 0.62, 0.13, 0.02, 0, 0.25, 0.21, 0xd8dde0, { rough: 0.4 });
      cyl(drawerUnit, 0.006, 0.006, 0.08, dz, 0.25, 0.225, 0x8b929a, { rough: 0.3, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    }
    const jars = group(drawerUnit, 0, 0.51, 0);
    const JAR_LABELS = ["GAUZE", "COTTON", "TIPS", "BURS", "FLOSS"];
    JAR_LABELS.forEach((label, i) => {
      const jx = -0.26 + i * 0.13;
      cyl(jars, 0.045, 0.045, 0.12, jx, 0.06, 0, 0xdfe8ee, { rough: 0.1, opacity: 0.5, seg: 14 });
      cyl(jars, 0.046, 0.046, 0.015, jx, 0.128, 0, 0x2b3138, { rough: 0.5, seg: 14 });
      decal(jars, 0.07, 0.03, jx, 0.06, 0.0451, signFace(label, { bg: "#dfe8ee", fg: "#1d3b4a", accent: "#3fb8cc", scale: 0.5 }), { px: 96 });
    });

    // Wall clock over the sterilisation counter, and a wall-mounted sink.
    const clock = group(farCounter, 0, 1.5, -0.02);
    cyl(clock, 0.09, 0.09, 0.02, 0, 0, 0, 0xf2f5f7, { rough: 0.4, seg: 20 }).rotation.x = Math.PI / 2;
    box(clock, 0.005, 0.06, 0.006, 0, 0.02, 0.011, 0x2b3138, { rough: 0.5 });
    box(clock, 0.04, 0.005, 0.006, 0.015, 0, 0.011, 0x2b3138, { rough: 0.5 });
    const sink = group(g, 3.1, 0, -1.7, -Math.PI / 2);
    slab(sink, 0.5, 0.15, 0.4, 0, 0.85, 0, 0xd8dde0, { radius: 0.03, rough: 0.35, metal: 0.15 });
    box(sink, 0.42, 0.12, 0.32, 0, 0.8, 0, 0xc4ccd2, { rough: 0.3, metal: 0.1 });
    cyl(sink, 0.012, 0.012, 0.2, 0, 1.0, -0.12, USC_STEEL, { rough: 0.2, metal: 0.9, seg: 10 });
    cyl(sink, 0.012, 0.012, 0.1, 0, 1.09, -0.03, USC_STEEL, { rough: 0.2, metal: 0.9, seg: 10 }).rotation.x = Math.PI / 2.4;
    for (const sx of [-1, 1]) cyl(sink, 0.012, 0.014, 0.05, sx * 0.06, 0.99, -0.13, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 10 });

    const assistant = standingFigure(g, -3.6, -0.5, { ry: -1.1, cloth: 0x2f6f7c, skin: 0xb98a63 });

    const key = new THREE.DirectionalLight(0xf6fbff, 0.8);
    key.position.set(-2, 4.5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xeaf6fa, 0x445058, 0.9));

    let flushing = false;
    let handpieceHeld = false;
    let dripT = 0;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -0.6),

      onStepComplete(step) {
        if (step.id === "waterline-flush") flushing = false;
        if (step.id === "tip-select") {
          tipLive.material = mat(0x59c97b, { rough: 0.15, metal: 0.9 });
          tipPerio.material = mat(0x59c97b, { rough: 0.15, metal: 0.9 });
        }
        if (step.id === "power-set") repaint(powerDial.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "hve-position") { hveWand.rotation.z = -0.1; }
        if (step.id === "adapt-tip") handpieceHeld = true;
        if (step.id === "explorer-verify") explorerTool.rotation.z = 0.4;
      },

      onInterrupt(it) {
        if (it.id === "waterline-dry") {
          flushing = false;
          tipLive.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.3, metal: 0.5 });
          repaint(powerDial.userData.screen, signFace("DRY", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.6 }));
        }
        if (it.id === "gag-reflex") {
          patient.head.rotation.x = -0.4;
          patient.torso.rotation.x = -0.22;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "waterline-dry") {
          tipLive.material = mat(0x59c97b, { rough: 0.15, metal: 0.9 });
          repaint(powerDial.userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (it.id === "gag-reflex") { patient.head.rotation.x = 0; patient.torso.rotation.x = -0.02; }
      },

      animate(t, dt, session) {
        if (session?.step?.id === "waterline-flush" && session.holding) {
          flushing = true;
          if (flushSpray.visible !== undefined) flushSpray.visible = true;
          flushSpray.userData.step(dt, new THREE.Vector3(0.1, 1.0, 0.08), 0.02, 0.4, -1.4);
        } else if (flushSpray.visible) flushSpray.visible = false;

        dripT += dt;
        if (handpieceHeld) tipLive.rotation.z = Math.sin(t * 40) * 0.02;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "power-set") {
          const pct = Math.round(gg.t * 100);
          repaint(powerDial.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c24", accent: gg.t >= 0.3 && gg.t <= 0.55 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
      },
    };
  },
};
