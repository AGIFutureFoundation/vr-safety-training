import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  standingPerson, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Overdose Response — Naloxone VR — Emergency Services.
// An opioid overdose in a public restroom, the way it actually gets found:
// by a bystander, in a stall, with no clean story about what was taken or
// how much. Naloxone reverses the respiratory depression, not the opioid
// itself, which is the whole reason the call does not end at the first
// dose — a short-acting reversal against a long-acting opioid means the
// person can stop breathing again before the ambulance is halfway to the
// hospital, and the response the whole crew works from assumes that.

const ODN_ACCENT = 0x5aa8e0;

export const SIM_OVERDOSE_RESPONSE_NALOXONE = {
  id: "overdose-response-naloxone",
  index: "201",
  domain: "Emergency Services",
  trade: "EMT — NAGE/AFSCME EMS local",
  category: "Emergency Services",
  indoor: "service",
  certification: "The FDA-approved naloxone product labeling for intranasal dosing, onset and repeat-dose timing; the CDC's guidance on opioid overdose response and take-home naloxone programmes; the NHTSA National EMS Scope of Practice for EMT-level naloxone administration and rescue breathing; OSHA 29 CFR 1910.1030 bloodborne pathogens for every sharps and body-fluid exposure on scene; NAGE and AFSCME EMS locals as the workforce's unions; SAMHSA's overdose-prevention and harm-reduction guidance for the referral this call closes on.",
  name: "Overdose Response — Naloxone",
  title: simTitle("Overdose Response — Naloxone"),
  tagline: "An opioid overdose reversed in a restroom stall: the sharps check, rescue breaths, naloxone timed against renarcotization, and the harm-reduction handoff",
  accent: ODN_ACCENT,
  accentCss: "#5aa8e0",
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "reversal-clean", name: "Reversal Clean", note: "A full reversal run with the sharps cleared, the second stop in breathing caught, and the referral actually handed over" },

  game: system({
    name: "Overdose Response",
    currency: "NARCAN",
    ranks: ["EMT Basic", "Reversal Trained", "Field Certified", "Crew Lead", "Harm Reduction Certified"],
    badges: [
      { id: "scene-cleared", name: "Scene Cleared", note: "Every sharp and unknown substance found before patient contact", test: AWARD.stepClean("scene-safety-sharps") },
      { id: "no-exposure", name: "No Exposure", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-breaths", name: "Steady Breaths", note: "Rescue-breathing rate held in band the whole cycle", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "fast-reversal", name: "Fast Reversal", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-call", name: "Clean Call", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "bare-hand-contact": "You wiped the vomit from the patient's mouth with a bare hand. An unresponsive person found down is an unknown bloodborne exposure risk the same as any other patient — gloves go on before the first hands-on contact, not after the first thing that needed wiping.",
    "recap-needle": "You went to recap the used needle on the floor before bagging it. Recapping a used needle by hand is one of the leading causes of on-duty sharps injuries in EMS precisely because it feels like tidiness — a used needle goes straight into the sharps container, cap left exactly where it fell.",
    "leave-supine-after-reversal": "You left the patient flat on their back once breathing came back. Naloxone does not treat nausea, and a reversed patient who vomits while lying flat can aspirate it — the recovery position is what keeps that airway clear while you are still assessing everything else.",
    "premature-departure": "You started packing up to leave a few minutes after the patient came round and started talking. Naloxone's effect can wear off well before a long-acting opioid does, and a patient who looks fine can stop breathing again with nobody watching — this call is not over until the observation window medical control sets has actually run.",
  },

  lateNotes: {
    "naloxone-atomizer-2": "Give the first dose the time it needs and reassess on the clock before reaching for a second one.",
    "leave-behind-kit-box": "There's no one steady enough to hand this to yet — wait until breathing and responsiveness are both back.",
    "transport-refusal-board": "Too soon to document this — you don't have a clear read on their breathing and mental status yet.",
    "syringe-service-card": "Finish the wake-up conversation and the leave-behind kit before starting the harm-reduction handoff.",
  },

  steps: [
    {
      id: "scene-safety-sharps", kind: "find", noHint: true,
      targets: ["visible-needle", "unknown-substance-baggie", "blood-on-floor"],
      itemNames: { "visible-needle": "used needle on the floor", "unknown-substance-baggie": "unlabeled baggie of residue", "blood-on-floor": "blood near the stall wall" },
      itemNotes: {
        "visible-needle": "A used needle, uncapped, near the patient's foot — noted and stepped around before anyone kneels down.",
        "unknown-substance-baggie": "An open baggie with residue in it. Not tasted, not field-tested — noted for the receiving hospital, nothing more.",
        "blood-on-floor": "A small amount of dried blood on the stall wall, from an injection site or a fall — another reason gloves go on before contact.",
      },
      title: "Scene safety and the sharps check, before you kneel down",
      cue: "Scan the stall before you touch anything: sharps, unknown substances, blood.",
      why: "A restroom stall where somebody overdosed is a scene with sharps in it whether or not you can see one yet, and the walk-through happens standing up, before anybody kneels into a space they have not actually looked at — a needle found after your knee is already on the floor is a needle found the hard way.",
    },
    {
      id: "responsiveness-breathing", kind: "hold", target: "patient-airway", seconds: 6,
      title: "Check responsiveness and breathing",
      cue: "Tap and shout, then watch the chest for normal breathing.",
      why: "Opioid overdose kills through respiratory depression, so the whole first assessment is built around breathing — a patient who is unresponsive but still breathing normally needs a different response than one who is not breathing at all, and rushing this check is how a slow-breathing patient gets treated as an apnea and an apnea gets treated as a nap.",
      holdBreakNote: "You broke off before confirming what the breathing actually looked like. A glance is not the same as watching the chest for a full cycle.",
    },
    {
      id: "rescue-breaths", kind: "track", target: "bvm-mask", seconds: 8,
      title: "Rescue breaths before naloxone reaches anywhere",
      cue: "Bag at the correct rate — about one breath every five to six seconds.",
      track: {
        start: 0.2, green: [0.38, 0.6], rise: 0.5, fall: 0.4, drift: 0.12, label: "BREATH RATE",
        readout: (v) => (v < 0.38 ? "too slow" : v > 0.6 ? "too fast" : "good rate"),
      },
      why: "Naloxone takes a couple of minutes to reverse anything even given correctly, and oxygen does not wait for the drug to work — rescue breathing at the correct rate is what actually keeps this patient alive during that gap, while too fast raises chest pressure and pushes air into the stomach instead of the lungs.",
      holdBreakNote: "Rate drifted out of band. Too slow starves the patient of oxygen; too fast fights against the lungs instead of filling them — bring it back into the band and hold it.",
    },
    {
      id: "naloxone-first-dose", kind: "select", target: "naloxone-atomizer-1",
      title: "Give the first dose of naloxone",
      cue: "Give the first intranasal dose while rescue breathing continues.",
      why: "The first dose goes in as soon as it is drawn up and ready, without pausing the breathing you are already giving — naloxone does not act instantly, so the ventilation that is keeping this patient alive right now does not stop just because a dose has been administered.",
    },
    {
      id: "timing-check", kind: "gauge", target: "reassess-clock",
      title: "Time the reassessment window",
      cue: "Watch the clock and commit the moment it reaches the window for reassessing response to the first dose.",
      gauge: { label: "REASSESS AT", speed: 0.6, green: [0.4, 0.62], readout: (t) => `${(t * 5).toFixed(1)} min`, missNote: "Off the window naloxone's own onset time sets — reassess inside that window rather than by feel." },
      why: "Naloxone needs a couple of minutes to take effect, and reassessing too early just tells you the drug has not worked yet, which is not the same as it not working — the window is set by how the drug actually behaves, not by how urgent the room feels while you are standing in it.",
    },
    {
      id: "second-dose", kind: "select", target: "naloxone-atomizer-2",
      title: "Give a second dose if the response is still inadequate",
      cue: "If breathing is still inadequate at reassessment, give the second dose.",
      why: "A single dose does not always reverse enough respiratory depression on its own, particularly against a strong or long-acting opioid, and the protocol's answer to an inadequate response at the reassessment window is a second dose — not more time, and not a stronger first guess next time.",
    },
    {
      id: "recovery-position", kind: "turn", target: "patient-shoulder",
      title: "Roll the patient into the recovery position",
      cue: "Once breathing is adequate, roll the patient onto their side.",
      turn: { turns: 0.5, axis: "z", label: "ROLL TO RECOVERY" },
      why: "The recovery position keeps the airway clear if this patient vomits, which reversal patients do often enough that it is planned for rather than reacted to — rolled onto their side with the airway lowest, anything that comes up drains out instead of down.",
    },
    {
      id: "wake-agitated-response", kind: "select", target: "calm-words-card",
      title: "What you say when they wake up agitated",
      cue: "Speak calmly, low and slow: who you are, what happened, that they are safe. No lecture.",
      why: "A patient reversed by naloxone often wakes into sudden, unpleasant withdrawal, confused and sometimes combative, and the instinct to lecture them about what just happened is exactly the wrong instinct — a level voice, their own name, and a plain statement of what happened and that they are safe is what actually gets a frightened, sick person to stay still long enough to be helped.",
    },
    {
      id: "leave-behind-kit", kind: "drag", target: "leave-behind-kit-box",
      title: "Leave a naloxone kit behind",
      cue: "Carry the leave-behind kit over and set it with the patient's own things.",
      drag: { to: "patient-belongings", radius: 0.5, missNote: "Not left with their things — a kit that never makes it into their bag is a kit that does not go home with them." },
      why: "A take-home naloxone kit left with this patient's own belongings, not just offered and forgotten, is what the CDC's guidance on overdose response actually asks for — the person most likely to reverse the next overdose in this patient's life is not going to be an EMT, and this is the one thing on this call that outlives the ambulance ride.",
    },
    {
      id: "transport-or-refusal", kind: "select", target: "transport-refusal-board",
      title: "Document transport or refusal",
      cue: "Confirm mental status and breathing are both stable, then document transport or an informed refusal.",
      why: "A patient who is alert, oriented and breathing normally can legally refuse transport, but that refusal only holds up if it is actually informed — documented against a clear mental status and breathing check, not assumed because they are sitting up and talking a few minutes after a reversal that can still wear off.",
    },
    {
      id: "thank-bystander", kind: "select", target: "bystander-point",
      title: "Thank the bystander and ask what they saw",
      cue: "Thank the person who gave the first dose, and ask what they saw before you arrived.",
      why: "Whoever gave that first dose bought this patient the minutes it took you to get here, and a plain thank-you said to their face, followed by a real question about what they saw, does two things at once — it treats a bystander's naloxone use as exactly the life-saving act it was, and it gets you the timeline the hospital will actually want.",
    },
    {
      id: "harm-reduction-referral", kind: "sequence",
      targets: ["syringe-service-card", "treatment-line-card", "followup-card"],
      itemNames: { "syringe-service-card": "syringe service programme card", "treatment-line-card": "treatment access line card", "followup-card": "follow-up contact card" },
      title: "Offer the harm-reduction referral",
      cue: "Hand over the syringe service card, then the treatment line, then the follow-up contact — in that order.",
      why: "The referral goes in that order because each card only means something once the one before it has landed — the syringe service programme addresses today's risk, the treatment line addresses the choice to change it, and the follow-up card is what makes either one more than a piece of paper handed to somebody at the worst moment of their week.",
      outOfOrderNote: "Syringe service, then the treatment line, then follow-up — leading with a treatment pitch before the immediate safety information lands reads as a lecture, not help.",
    },
    {
      id: "operational-log", kind: "select", target: "incident-log-board",
      title: "Log the run",
      cue: "Log both doses with their times, the response to each, and what the bystander reported.",
      why: "The receiving hospital needs to know exactly how much naloxone already went in and when, because that changes how long they watch this patient and for what — a timeline reconstructed from memory back at the station is a timeline that is already missing the minutes that mattered most.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with your partner before the next call",
      cue: "Ask how your partner is doing, and name the peer-support line before you clear the scene.",
      why: "A reversal call, especially one where the patient stopped breathing twice, is exactly what this department's critical-incident stress protocol exists for — a short, ordinary check-in that names the peer-support line out loud is what keeps a hard call from turning into something a partner carries alone.",
    },
  ],

  interrupts: [
    {
      id: "renarcotization-apnea",
      kind: "Patient stops breathing again",
      after: "timing-check", delay: 3, seconds: 12,
      alert: "The patient has stopped breathing again — naloxone's effect is already wearing off faster than the opioid did.",
      cue: "Back to rescue breaths right now, before anything else.",
      target: "bvm-mask",
      why: "Naloxone's duration is shorter than many opioids', especially the stronger synthetic ones, so a patient can look reversed and then slide back into respiratory depression well before you are anywhere near a hospital — the answer the instant it happens is the same bag you already know how to use, not a bigger dose reached for in a panic.",
      missNote: "Breathing stayed inadequate for the rest of that window before anybody picked the bag back up. Oxygen does not wait for a decision about the next dose — ventilation comes first, every single time this happens, and it can happen more than once on the same patient.",
      wrongNote: "It is the bag, not another dose yet and not the clock. Get air moving again first.",
    },
    {
      id: "bystander-films",
      kind: "Bystander filming",
      after: "rescue-breaths", delay: 4, seconds: 12,
      alert: "Someone in the doorway has their phone up, filming the patient over your shoulder.",
      cue: "Ask them to stop, and move them back — with respect, not a scene of your own.",
      target: "filmer-point",
      why: "A patient reversed from an overdose is at the worst, most exposed moment of their week, and a video of it posted without consent is a second harm this call did not need to add — asking the person filming to stop, calmly and directly, and moving them back out of the doorway protects the patient's dignity without turning the restroom into a confrontation.",
      missNote: "The filming kept going the whole time nobody addressed it. Whatever else this call gets right, a video of a stranger's worst day ending up online because nobody asked the person filming to stop is a harm this crew could have prevented in one sentence.",
      wrongNote: "It is the person filming in the doorway. Ask them to stop and step back — the patient is not a moment for anybody's phone.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, ODN_ACCENT);

    // -------------------------------------------------------------- restroom
    const stall = group(g, -1.0, 0, -0.9, 0.3);
    box(stall, 0.05, 1.8, 1.1, -0.55, 0.9, 0, 0xc7cdd2, { rough: 0.5, metal: 0.15 });
    box(stall, 0.05, 1.8, 1.1, 0.55, 0.9, 0, 0xc7cdd2, { rough: 0.5, metal: 0.15 });
    const stallDoor = box(stall, 0.04, 1.6, 0.72, 0, 0.85, 0.7, 0xdfe4e8, { rough: 0.45, metal: 0.15 });
    stallDoor.rotation.y = 1.0;
    const toilet = group(stall, 0, 0, -0.6);
    cyl(toilet, 0.19, 0.16, 0.34, 0, 0.17, 0, 0xf2f4f4, { rough: 0.3, seg: 16 });
    torus(toilet, 0.18, 0.03, 0, 0.36, 0, 0xf2f4f4, { rough: 0.3, seg: 8, seg2: 20 });

    const sinkCounter = group(g, 1.7, 0, -1.4, -0.4);
    slab(sinkCounter, 1.1, 0.06, 0.42, 0, 0.9, 0, 0xc9ccc8, { radius: 0.02, rough: 0.35 });
    cyl(sinkCounter, 0.17, 0.19, 0.2, -0.3, 0.78, 0, 0xdfe4e4, { rough: 0.3, seg: 16 });
    cyl(sinkCounter, 0.17, 0.19, 0.2, 0.3, 0.78, 0, 0xdfe4e4, { rough: 0.3, seg: 16 });
    for (const sx of [-0.3, 0.3]) cyl(sinkCounter, 0.012, 0.012, 0.14, sx, 1.03, -0.1, CITY.steel, { rough: 0.3, metal: 0.75, seg: 8 });
    box(sinkCounter, 1.1, 0.9, 0.02, 0, 1.4, -0.2, 0xdfeaf0, { rough: 0.15, opacity: 0.4, transparent: true, cast: false });
    for (const sx of [-1, 1]) {
      box(g, 0.02, 1.5, 0.32, sx * 0.55, 0.75, -1.4, 0x2b3138, { rough: 0.7, cast: false });
    }

    // Mirror, dispensers and a second empty stall — the ordinary furniture of
    // a public restroom, so the room reads as itself rather than a diagram.
    box(sinkCounter, 1.0, 0.7, 0.02, 0, 1.85, -0.22, 0xdfeaf0, { rough: 0.1, opacity: 0.5, transparent: true, cast: false });
    box(sinkCounter, 1.06, 0.02, 0.02, 0, 2.21, -0.22, 0x8b929a, { rough: 0.4, metal: 0.6, cast: false });
    const towelDispenser = group(g, 2.3, 0, -1.35, -0.4);
    box(towelDispenser, 0.24, 0.3, 0.1, 0, 1.1, 0, 0xdfe4e4, { rough: 0.4, metal: 0.15 });
    box(towelDispenser, 0.16, 0.02, 0.02, 0, 0.93, 0.05, 0xc7cdd2, { rough: 0.5 });
    const soapDispenser = group(sinkCounter, -0.3, 0.94, -0.08);
    cyl(soapDispenser, 0.02, 0.024, 0.1, 0, 0, 0, 0xdfe4e4, { rough: 0.4, seg: 10 });
    cyl(soapDispenser, 0.008, 0.008, 0.03, 0, 0.07, 0.01, 0x8b929a, { rough: 0.5, metal: 0.4, seg: 8 });
    const dryer = group(g, 2.3, 0, -1.75, -0.4);
    box(dryer, 0.2, 0.22, 0.16, 0, 1.15, 0, 0xc7cdd2, { rough: 0.35, metal: 0.3 });
    box(dryer, 0.14, 0.02, 0.02, 0, 1.02, 0.09, 0x8b929a, { rough: 0.4, metal: 0.5 });
    const trashCan = group(g, -1.9, 0, -1.9);
    cyl(trashCan, 0.16, 0.13, 0.4, 0, 0.2, 0, 0x4a545a, { rough: 0.7, seg: 14 });
    cyl(trashCan, 0.17, 0.17, 0.02, 0, 0.4, 0, 0x2b3138, { rough: 0.6, seg: 14 });
    const stall2 = group(g, -1.0, 0, 0.5, 0.3);
    box(stall2, 0.05, 1.8, 1.1, -0.55, 0.9, 0, 0xc7cdd2, { rough: 0.5, metal: 0.15 });
    box(stall2, 0.05, 1.8, 1.1, 0.55, 0.9, 0, 0xc7cdd2, { rough: 0.5, metal: 0.15 });
    box(stall2, 0.04, 1.6, 0.72, 0, 0.85, 0.55, 0xdfe4e8, { rough: 0.45, metal: 0.15 });
    cyl(stall2, 0.16, 0.13, 0.32, 0, 0.16, -0.6, 0xf2f4f4, { rough: 0.3, seg: 14 });
    for (let i = 0; i < 3; i++) {
      box(g, 4.4, 0.1, 0.02, 0, 0.05 + i * 0.55, -1.98, 0xb9c4c9, { rough: 0.6, cast: false });
    }
    const ceilingVent = group(g, 0, 0, 0.3);
    box(ceilingVent, 0.3, 0.02, 0.3, 0, 2.5, 0, 0xc7cdd2, { rough: 0.5, cast: false });

    // -------------------------------------------------------------- patient
    const patient = standingFigure(g, 0.1, -0.65, { lying: true, ry: 0.3, cloth: 0x4a4a52, skin: 0xc79a72 });
    holoTag(g, "Patient — overdose", 0.1, 0.32, -0.85, { css: "#5aa8e0", w: 0.4 });
    reg(hits, patient.userData.head, "patient-airway");
    const shoulderPoint = group(g, -0.15, 0.17, -0.6);
    ball(shoulderPoint, 0.02, 0, 0, 0, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.0 });
    reg(hits, shoulderPoint, "patient-shoulder");
    const belongings = group(g, 0.55, 0, -0.85);
    box(belongings, 0.24, 0.12, 0.16, 0, 0.06, 0, 0x5a4a3a, { rough: 0.8 });
    holoTag(belongings, "Patient's bag", 0, 0.16, 0, { css: "#5aa8e0", w: 0.3 });
    reg(hits, belongings, "patient-belongings");

    // Sharps and scene hazards on the stall floor.
    const needle = group(g, -0.6, 0, -1.15);
    cyl(needle, 0.004, 0.004, 0.09, 0, 0.005, 0, 0xd8dce0, { rough: 0.3, metal: 0.5, seg: 6 }).rotation.z = 1.3;
    holoTag(needle, "Used needle", 0, 0.1, 0, { css: "#e0524a", w: 0.28 });
    reg(hits, needle, "visible-needle");
    const baggie = group(g, -1.1, 0, -1.2);
    box(baggie, 0.06, 0.005, 0.05, 0, 0.005, 0, 0xe8e2c8, { rough: 0.4, opacity: 0.8, transparent: true, cast: false });
    holoTag(baggie, "Unknown residue", 0, 0.08, 0, { css: "#e0524a", w: 0.36 });
    reg(hits, baggie, "unknown-substance-baggie");
    const bloodMark = box(g, 0.1, 0.14, 0.006, -1.15, 0.5, -1.34, 0x6a1f1a, { rough: 0.6, opacity: 0.7, transparent: true, cast: false });
    holoTag(g, "Blood on the wall", -1.15, 0.66, -1.34, { css: "#e0524a", w: 0.32 });
    reg(hits, bloodMark, "blood-on-floor");

    // Bare-hand-contact and recap-needle decoys.
    const bareContact = group(g, 0.35, 0.16, -0.9);
    ball(bareContact, 0.02, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 0.9 });
    holoTag(g, "Wipe with a bare hand?", 0.35, 0.3, -1.05, { css: "#e0524a", w: 0.42 });
    reg(hits, bareContact, "bare-hand-contact");
    const recapDecoy = group(g, -0.6, 0, -1.15);
    ball(recapDecoy, 0.012, 0.02, 0.04, 0, 0xe0524a, { emissive: 0xe0524a, ei: 0.9 });
    holoTag(g, "Recap it first?", -0.6, 0.16, -1.3, { css: "#e0524a", w: 0.32 });
    reg(hits, recapDecoy, "recap-needle");
    const leaveSupineDecoy = group(g, 0.35, 0.18, -0.45);
    ball(leaveSupineDecoy, 0.016, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 0.9 });
    holoTag(g, "Leave them flat on their back?", 0.35, 0.34, -0.3, { css: "#e0524a", w: 0.56 });
    reg(hits, leaveSupineDecoy, "leave-supine-after-reversal");

    // ------------------------------------------------------------- equipment
    const kit = toolChest(g, 1.9, 0.5, { ry: -0.7, color: ODN_ACCENT });
    const naloxone1 = group(kit, -0.06, 0.86, 0.1);
    box(naloxone1, 0.06, 0.1, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.4 });
    holoTag(kit, "Naloxone — dose 1", 0, 1.02, 0, { css: "#5aa8e0", w: 0.4 });
    reg(hits, naloxone1, "naloxone-atomizer-1");
    const naloxone2 = group(kit, 0.1, 0.86, 0.1);
    box(naloxone2, 0.06, 0.1, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.4 });
    holoTag(kit, "Naloxone — dose 2", 0.1, 0.15, 0.1, { css: "#5aa8e0", w: 0.4 });
    reg(hits, naloxone2, "naloxone-atomizer-2");

    const bvm = group(g, 0.55, 0, -0.35, -0.6);
    ball(bvm, 0.06, 0, 0.2, 0, 0x59c97b, { rough: 0.5 });
    torus(bvm, 0.05, 0.018, -0.1, 0.16, 0, 0xdfe4e8, { rough: 0.5, seg: 12 });
    reg(hits, bvm, "bvm-mask");

    const clock = instrument(g, 1.5, 0.98, -0.55, { ry: -0.5, idle: "-- min", color: ODN_ACCENT });
    holoTag(clock, "Reassess clock", 0, 0.2, 0, { css: "#5aa8e0", w: 0.34 });
    reg(hits, clock, "reassess-clock");

    const calmCard = decal(g, 0.3, 0.18, 1.6, 0.75, -0.1, signFace("STAY CALM", { bg: "#0d1c24", accent: "#5aa8e0", scale: 0.45 }), { px: 160 });
    holoTag(g, "Plain words, no lecture", 1.6, 0.9, -0.1, { css: "#5aa8e0", w: 0.42 });
    reg(hits, calmCard, "calm-words-card");

    const leaveBehindKit = group(g, 1.9, 0, 1.0, -0.3);
    box(leaveBehindKit, 0.16, 0.1, 0.12, 0, 0.05, 0, 0xf2c14b, { rough: 0.5 });
    decal(leaveBehindKit, 0.13, 0.05, 0, 0.101, 0, signFace("TAKE-HOME NALOXONE", { bg: "#241a10", accent: "#5aa8e0", scale: 0.34 }), { px: 160 });
    holoTag(leaveBehindKit, "Leave-behind kit", 0, 0.16, 0, { css: "#5aa8e0", w: 0.4 });
    reg(hits, leaveBehindKit, "leave-behind-kit-box");

    const transportBoard = decal(g, 0.3, 0.16, 1.5, 0.7, 1.2, signFace("TRANSPORT / REFUSAL", { bg: "#0d1c24", accent: "#5aa8e0", scale: 0.34 }), { px: 200 });
    holoTag(g, "Transport or refusal", 1.5, 0.84, 1.2, { css: "#5aa8e0", w: 0.4 });
    reg(hits, transportBoard, "transport-refusal-board");

    // Premature-departure decoy near the door.
    const packUp = group(g, 2.0, 0, 1.9, 0.3);
    box(packUp, 0.14, 0.02, 0.1, 0, 0.01, 0, 0xe0524a, { emissive: 0xe0524a, ei: 0.5, rough: 0.6 });
    holoTag(g, "Pack up and clear already?", 2.0, 0.1, 2.05, { css: "#e0524a", w: 0.5 });
    reg(hits, packUp, "premature-departure");

    // Harm-reduction referral cards, and the bystander who dosed.
    const referralTable = group(g, -1.9, 0, 1.4, 0.4);
    slab(referralTable, 0.6, 0.03, 0.4, 0, 0.72, 0, 0xdfe4de, { radius: 0.02, rough: 0.5 });
    const syringeCard = decal(referralTable, 0.22, 0.3, -0.16, 0.74, 0, paperFace("SYRINGE SERVICES", ["Clean supplies", "No questions asked"], { band: "#2f8f6a" }));
    syringeCard.rotation.x = -Math.PI / 2;
    reg(hits, syringeCard, "syringe-service-card");
    const treatmentCard = decal(referralTable, 0.22, 0.3, 0, 0.741, 0, paperFace("TREATMENT ACCESS", ["24-hour access line", "No appointment needed"], { band: "#5aa8e0" }));
    treatmentCard.rotation.x = -Math.PI / 2;
    reg(hits, treatmentCard, "treatment-line-card");
    const followupCard = decal(referralTable, 0.22, 0.3, 0.16, 0.742, 0, paperFace("FOLLOW-UP", ["Call left with the patient", "Their choice, their call"], { band: "#f2c14b" }));
    followupCard.rotation.x = -Math.PI / 2;
    reg(hits, followupCard, "followup-card");

    function crew(x, z, ry, o) {
      const p = standingPerson(g, x, z, { ry, ...o });
      p.root.userData.crew = true;
      return p;
    }
    const bystander = crew(0.85, -0.85, -2.4, { cloth: 0x5a5248, hiVis: false, skin: 0xb98868 });
    holoTag(bystander.root, "Bystander — gave dose 1", 0, 1.85, 0, { css: "#5aa8e0", w: 0.5 });
    reg(hits, bystander.root, "bystander-point");

    const filmer = crew(1.15, 1.75, -2.6, { cloth: 0x4a4a52, hiVis: false, skin: 0xc79a72 });
    filmer.root.visible = false;

    const logBoard = holoPanel(g, 0.56, 0.4, -2.3, 1.7, 2.0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,24,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5aa8e0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#dcecfa";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("INCIDENT LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#bcdcf4";
      cx.fillText("Both doses · times · bystander report", w / 2, h * 0.6);
      cx.fillText("Signed off before transport", w / 2, h * 0.78);
    }, { ry: 0.5, accent: ODN_ACCENT });
    reg(hits, logBoard, "incident-log-board");

    const checkinBoard = holoPanel(g, 0.5, 0.34, 0.9, 1.7, 2.35, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,24,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5aa8e0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#dcecfa";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.36);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#bcdcf4";
      cx.fillText("How's your partner · peer-support line named", w / 2, h * 0.68);
    }, { ry: -0.4, accent: ODN_ACCENT });
    reg(hits, checkinBoard, "crew-checkin-board");

    const doorway = group(g, 1.9, 0, 2.0, 0.5);
    box(doorway, 0.08, 2.0, 0.9, 0, 1.0, 0, 0x2a2b31, { rough: 0.7 });
    const filmerPoint = group(g, 1.8, 0, 1.75);
    ball(filmerPoint, 0.02, 0, 1.3, 0, ODN_ACCENT, { emissive: ODN_ACCENT, ei: 1.2 });
    holoTag(filmerPoint, "Ask them to stop, step back", 0, 1.5, 0, { css: "#5aa8e0", w: 0.5 });
    reg(hits, filmerPoint, "filmer-point");

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0.1, 1.1, -0.5),

      onStepComplete(step) {
        if (step.id === "naloxone-first-dose") { naloxone1.children[0].material = mat(0x59c97b, { rough: 0.4 }); }
        if (step.id === "second-dose") { naloxone2.children[0].material = mat(0x59c97b, { rough: 0.4 }); }
        if (step.id === "recovery-position") { patient.rotation.z = 0.6; }
      },

      onInterrupt(it) {
        if (it.id === "bystander-films") { filmer.root.visible = true; filmer.root.position.set(1.6, 0, 2.1); }
        if (it.id === "renarcotization-apnea") { patient.userData.head.rotation.z = 0.45; bvm.children[0].material = mat(0xe0524a, { emissive: 0xe0524a, ei: 1.1, rough: 0.5 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bystander-films") { filmer.root.position.set(1.15, 0, 1.75); filmer.root.visible = false; }
        if (it.id === "renarcotization-apnea") { patient.userData.head.rotation.z = 0; bvm.children[0].material = mat(0x59c97b, { rough: 0.5 }); }
      },

      animate(t, dt, session) {
        const tr = session?.track;
        if (session?.step?.id === "rescue-breaths") {
          const inBand = tr ? tr.v >= 0.38 && tr.v <= 0.6 : true;
          bvm.children[0].material = mat(inBand ? 0x59c97b : 0xe0524a, { rough: 0.5 });
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "timing-check") {
          repaint(clock.userData.screen, signFace(`${(gg.t * 5).toFixed(1)} min`, {
            bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.62 ? "#59c97b" : "#e0524a", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        bystander.head.rotation.y = Math.sin(t * 0.4) * 0.2;
        void stallDoor; void toilet;
      },
    };
  },
};
