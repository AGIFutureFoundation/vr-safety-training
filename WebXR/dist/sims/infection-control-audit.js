import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Infection Control Audit VR — Dental & Oral Health.
//
// The CDC's own Infection Prevention Checklist for Dental Settings, walked
// through a whole clinic by the person whose job it is: the infection
// prevention coordinator the CDC's guidance says every dental setting should
// name. Hand hygiene stations, PPE stock, surface barriers, the dental unit
// waterlines sampled and shocked, sharps containers, the sterilisation
// centre's cycle logs and its weekly spore records, and a corrective action
// written against every finding rather than mentioned in passing.
//
// The numbers named are the published ones: the CDC recommends dental unit
// water for non-surgical procedures meet the EPA's regulatory standard for
// drinking water — no more than 500 colony-forming units per millilitre of
// heterotrophic water bacteria — and biological monitoring of sterilisers at
// least weekly. Where a figure belongs to a product rather than a guideline,
// this station sends the auditor to the label.

const INFAUD_ACCENT = 0x72c4e0;
const INFAUD_CSS = "#72c4e0";
const INFAUD_STEEL = 0xb2bcc4;
const INFAUD_CABINET = 0xdee5ea;
const INFAUD_CLEAN = 0x8fd6a0;
const INFAUD_DIRTY = 0xd8823a;

export const SIM_INFECTION_CONTROL_AUDIT = {
  id: "infection-control-audit",
  index: "215",
  domain: "Dental & Oral Health",
  trade: "Dental infection prevention coordinator",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "The CDC's Guidelines for Infection Control in Dental Health-Care Settings (2003), its 2016 Summary, and the CDC's Infection Prevention Checklist for Dental Settings, which is the document this audit is actually walking; the CDC's recommendation that dental unit water for non-surgical procedures meet the EPA's regulatory standard for drinking water of no more than 500 CFU/mL of heterotrophic water bacteria, and that sterilisers be biologically monitored at least weekly; OSHA 29 CFR 1910.1030 bloodborne pathogens — the written exposure control plan, engineering controls, sharps containers and the sharps injury log — and 1910.1200 hazard communication for the disinfectants and waterline treatments; EPA registration of those surface disinfectants and waterline products, whose own labels set the contact and dwell times; DANB's Certified Dental Assistant infection control component; the ADA and the American Dental Assistants Association (ADAA); the state dental board, which inspects against the same guidance; SEIU and UFCW as the unions representing clinic staff in organised practices",
  name: "Infection Control Audit",
  title: simTitle("Infection Control Audit"),
  tagline: "The CDC checklist walked through a whole clinic: hand hygiene, PPE, barriers, waterlines sampled and shocked, sharps, sterilisation logs, spore records and a corrective action per finding",
  accent: INFAUD_ACCENT,
  accentCss: INFAUD_CSS,
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "checklist-walked", name: "Checklist Walked", note: "A whole-clinic audit with every finding written up and a corrective action against each one" },

  game: system({
    name: "Infection Prevention",
    currency: "CFU",
    ranks: ["Audit Observer", "Assistant Auditor", "Infection Control Lead", "Prevention Coordinator", "Board Inspector"],
    badges: [
      { id: "waterline-proven", name: "Waterline Proven", note: "The line sampled, shocked and dwelt for the label's own time", test: AWARD.stepClean("dwell-hold") },
      { id: "nothing-touched", name: "Nothing Touched", note: "No unsafe action anywhere in the walk", test: AWARD.safe },
      { id: "chamber-read", name: "Chamber Read", note: "The cycle parameters read off the chart rather than assumed", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-audit", name: "Clean Audit", note: "No corrections anywhere in the walk", test: AWARD.clean },
      { id: "held-the-dwell", name: "Held The Dwell", note: "Every timed hold carried to full duration first time", test: AWARD.unbroken },
      { id: "before-first-patient", name: "Before First Patient", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dry-wipe": "That dry paper towel on the chair arm is what somebody used instead of a disinfectant. A dry wipe moves contamination around a surface and disinfects none of it — an EPA-registered product held wet for the contact time printed on its own label is the only thing that does, and a surface wiped dry looks exactly like one that was.",
    "overfilled-sharps": "That sharps container is filled past its own fill line. Past the line, the next thing dropped in hits what is already there and comes back out, which is precisely the injury OSHA's bloodborne pathogens standard put the container there to engineer away — it is replaced at the line, not pressed down.",
    "expired-spore-strips": "That box of biological indicator strips is past its expiry date. An expired spore strip may fail to grow whether or not the cycle worked, which turns every weekly test run on it into a result that proves nothing — and a sterilisation record built on those is a record that will not survive being read.",
    "bare-hand-scrub": "Somebody is hand-scrubbing contaminated instruments with bare hands at that sink. Puncture-resistant utility gloves, and mechanical cleaning in an ultrasonic or a washer rather than a hand scrub, are what the CDC's dental guidance calls for — a hand brush against a contaminated sharp is the most predictable exposure in the whole building.",
  },

  lateNotes: {
    "shock-pump": "Not yet. Nothing is shocked into a line that has not been sampled first — the sample is the baseline the shock is supposed to be measured against.",
    "corrective-form": "Too early. A corrective action is written against findings, and the walk has not finished producing them yet.",
    "audit-report": "The audit is not complete. Signing the report before the sterilisation records have been read is signing for something nobody looked at.",
  },

  steps: [
    {
      id: "checklist-open", kind: "select", target: "cdc-checklist",
      title: "Open the checklist and the written plan",
      cue: "Take up the CDC's Infection Prevention Checklist for Dental Settings, and confirm the clinic's written plan names a coordinator.",
      why: "An audit is a document walked rather than an impression formed, which is why the CDC publishes the checklist at all — it fixes what is being looked at before anybody starts looking and stops the walk becoming a tour of whatever happens to be visible. The written infection-control plan, with a named coordinator and OSHA's exposure control plan behind it, is the first line on it, because a clinic without one has nothing for the rest of the checklist to measure against.",
    },
    {
      id: "hand-hygiene-audit", kind: "find", noHint: true,
      targets: ["empty-dispenser", "obstructed-sink", "missing-towels"],
      itemNames: {
        "empty-dispenser": "the empty alcohol rub dispenser",
        "obstructed-sink": "the sink with a box stacked in it",
        "missing-towels": "the empty paper towel holder",
      },
      itemNotes: {
        "empty-dispenser": "An empty dispenser is a hand hygiene station that does not exist. The CDC's guidance is built on hand hygiene being available at the point of care, and an empty one at the point of care is worse than none at all because everyone walks past it believing it is there.",
        "obstructed-sink": "A sink with supplies stacked in it cannot be used for handwashing, and handwashing rather than an alcohol rub is what is required when hands are visibly soiled. Blocking the sink quietly removes the option that covers the cases the rub does not.",
        "missing-towels": "No towels means wet hands, and wet hands recontaminate on the first thing they touch and on the tap they turn off. The towel is part of the hand hygiene procedure rather than an amenity beside it.",
      },
      title: "Audit the hand hygiene stations",
      cue: "Three things at these stations mean hand hygiene cannot actually be performed here. Find them.",
      why: "Hand hygiene is the single most effective measure in the CDC's dental guidance and the one most often defeated by logistics rather than by anybody's decision — an empty dispenser, a sink somebody is using as a shelf, a towel holder nobody refilled. None of these is a training failure and all of them stop the procedure happening, which is why an audit looks at whether the station works rather than whether the staff know what to do at it.",
    },
    {
      id: "ppe-audit", kind: "sequence", anyOrder: true,
      targets: ["mask-stock", "eyewear-stock", "gown-stock", "glove-sizes"],
      itemNames: {
        "mask-stock": "masks and respirators",
        "eyewear-stock": "eye protection with side shields",
        "gown-stock": "protective clothing",
        "glove-sizes": "gloves in the sizes people actually wear",
      },
      title: "Audit the PPE stock",
      cue: "Masks, eye protection with side shields, gowns, and gloves in every size the staff actually need.",
      why: "OSHA requires the employer to provide PPE at no cost and in the sizes staff need, which is the part audits skip: a cupboard full of large gloves is a cupboard that has quietly made barrier precautions optional for half the team. Eye protection has to have side shields to be eye protection at all, and a respirator programme brings fit testing with it — so what is on the shelf decides what is possible at the chair.",
    },
    {
      id: "surface-barriers", kind: "select", target: "barrier-station",
      title: "Check the barrier stock and how it is being changed",
      cue: "Look at the barrier supplies and at whether the high-touch surfaces in this operatory are actually covered.",
      why: "Surface barriers exist for the points that are hard to clean and touched every appointment — light handles, chair switches, the air-water syringe, tubing — and they work only because they are single-use. The audit question is not whether barriers are in the building but whether the ones on the equipment are fresh, because a barrier reused between patients is a contaminated surface with a plastic film over it.",
    },
    {
      id: "waterline-valve", kind: "turn", target: "waterline-valve",
      title: "Isolate the line and open the treatment port",
      cue: "Close the line off from the unit and open its treatment port before anything is drawn or dosed.",
      why: "A dental unit waterline is narrow-bore tubing where water sits still between patients, and biofilm grows on the tubing wall from the first day the unit is installed. Isolating the line is what lets it be sampled and treated without either operation reaching a patient's mouth, and opening the treatment port on a line still connected to the unit is how a chemical ends up somewhere the label never intended.",
      turn: { turns: 1, axis: "y", label: "LINE ISOLATION" },
    },
    {
      id: "waterline-sample", kind: "drag", target: "sample-vial",
      title: "Take the waterline sample",
      cue: "Fill the vial off the isolated line and set it in the cooler for the laboratory.",
      why: "The sample is the whole point of the exercise: the CDC's position is that dental unit water for non-surgical procedures should meet the EPA's drinking-water standard of no more than 500 CFU/mL of heterotrophic water bacteria, and there is no way to know whether a line does except to send water off and have it counted. Shocking a line without ever sampling it is treating a number nobody has.",
      drag: { to: "sample-cooler", radius: 0.36, missNote: "Not in the cooler. A sample left standing warm on a counter grows on the way to the laboratory, and the count that comes back describes the journey rather than the line." },
    },
    {
      id: "shock-dose", kind: "track", target: "shock-pump", seconds: 8,
      title: "Shock the line at the product's own concentration",
      cue: "Draw the shock treatment through at the concentration the product's label sets — hold it in band.",
      why: "A waterline shock treatment is an EPA-registered product with a concentration and a dwell time printed on its own label, and neither number transfers from one product to another. Under-dosed, it thins the biofilm and leaves the anchoring layer to regrow within days; over-dosed, it attacks the tubing itself and puts a line into failure that will be blamed on age. The label is the specification.",
      track: {
        start: 0.12, green: [0.38, 0.62], rise: 0.5, fall: 0.44, drift: 0.14, label: "SHOCK CONCENTRATION",
        readout: (v) => (v < 0.38 ? "under-dosed — biofilm survives" : v > 0.62 ? "over-dosed — attacking the tubing" : "at the label's concentration"),
      },
      holdBreakNote: "The concentration drifted off the label's figure. Under it the biofilm's base layer survives and regrows in days; over it the treatment starts working on the tubing instead.",
    },
    {
      id: "dwell-hold", kind: "hold", target: "dwell-timer", seconds: 8,
      title: "Hold the dwell time",
      cue: "Leave the treatment standing in the line for the full dwell the label requires — nothing flushed through early.",
      why: "Biofilm is a structure rather than a film, and the dwell time on that label is how long the product needs in contact with it to get through to the tubing wall. Flushed early, the line looks and tastes exactly the same and the base layer is intact, so the next sample comes back high and everybody concludes the product does not work — when what actually happened is that it was never given the time its own label asked for.",
      holdBreakNote: "The dwell was cut short. A line flushed before the label's time has had a rinse rather than a shock, and the count in three weeks will say so without anybody knowing why.",
    },
    {
      id: "sharps-audit", kind: "find", noHint: true,
      targets: ["unmounted-container", "wrong-stream-container", "blocked-container"],
      itemNames: {
        "unmounted-container": "the sharps container sitting on the floor",
        "wrong-stream-container": "the needle in the red bag",
        "blocked-container": "the container mounted out of reach of the chair",
      },
      itemNotes: {
        "unmounted-container": "A container on the floor tips, and a tipped sharps container empties. OSHA's requirement is for a closable, puncture-resistant, leakproof container kept upright — mounting it is what keeps it upright when somebody's foot finds it.",
        "wrong-stream-container": "A needle in a red biohazard bag is a sharp in a soft container, and it will go through that bag into the hand of whoever lifts it. Regulated waste streams are separate because one of them is designed to resist a point and the other is not.",
        "blocked-container": "A container the operator cannot reach from the chair means the sharp travels across the room in somebody's hand first. OSHA's standard puts the container as close as practical to the point of use precisely to delete that journey.",
      },
      title: "Audit the sharps containers",
      cue: "Three things about how sharps are contained in this clinic will not survive an inspection. Find them.",
      why: "Sharps injuries in dentistry happen between the point of use and the container, so almost everything protective about a sharps container is about where it is rather than what it is: upright, mounted, within arm's reach of the chair, and the only thing a sharp ever goes into. An audit finding here is also an entry that belongs in the sharps injury log the exposure control plan requires, because a container in the wrong place has a history.",
    },
    {
      id: "chamber-gauge", kind: "gauge", target: "sterilizer-chart",
      title: "Read the steriliser's cycle parameters",
      cue: "Read the chart recorder for the last cycle and commit the temperature and hold it actually reached.",
      why: "A steriliser that has completed a cycle and a steriliser that has reached sterilising conditions are different claims, and only the cycle record distinguishes them — a chamber that came up short on temperature or held for less than its programme still ends with a beep and a door that opens. Reading the trace rather than the beep is the whole reason mechanical monitoring exists alongside the chemical and biological kinds.",
      gauge: {
        label: "CHAMBER TEMPERATURE", speed: 0.5, green: [0.44, 0.64],
        readout: (t) => `${Math.round(118 + t * 22)} C at full hold`,
        missNote: "That is not what the trace shows. A cycle logged at a temperature it did not reach is a load released on a number somebody wanted rather than one the chamber recorded.",
      },
    },
    {
      id: "record-review", kind: "sequence",
      targets: ["cycle-log", "indicator-log", "spore-report"],
      itemNames: {
        "cycle-log": "the cycle log",
        "indicator-log": "the chemical indicator record",
        "spore-report": "the weekly spore reports",
      },
      title: "Read the sterilisation records in order",
      cue: "Cycle log first, then the chemical indicator record, then the weekly biological results.",
      why: "The three kinds of monitoring answer three different questions and they are read in ascending order of proof: the cycle log says the machine ran, the chemical indicator says the pack saw sterilising conditions, and the weekly spore test is the only one that says organisms were actually killed. Reading the spore results first and the cycle log never is how a clinic ends up with a year of passing tests and no idea which loads they belonged to.",
      outOfOrderNote: "Out of order. The cycle log is what the indicators and the spore results are attached to — read backwards, a passing spore test is a result with no load behind it.",
    },
    {
      id: "corrective-action", kind: "select", target: "corrective-form",
      title: "Write a corrective action against every finding",
      cue: "For each finding: what it was, why it happened, what was done, who owns it and when it gets re-checked.",
      why: "A finding without a corrective action is a note, and notes recur in the next audit word for word. The cause matters as much as the fix — an empty dispenser because nobody was assigned restocking comes back next month unless the assignment changes — and the re-check date is what separates a clinic that audits itself from one that documents itself. Any load affected by a monitoring failure also gets recalled here rather than mentioned.",
    },
    {
      id: "audit-signoff", kind: "drag", target: "audit-report",
      title: "Sign the audit into the written plan",
      cue: "Sign the report and file it with the clinic's written infection-control plan, with the re-audit date on it.",
      why: "The signed audit belongs with the written plan because that is the file a state board inspector, an OSHA compliance officer and the next coordinator all read — a report in somebody's drawer is a report that did not happen. Dating the re-audit on the way in is what makes this a programme rather than an event, and the plan is where anybody looking can see whether the last round of findings were ever closed.",
      drag: { to: "plan-binder", radius: 0.36, missNote: "Not filed. An audit that lives on a clipboard is an audit nobody inheriting this role will ever find." },
    },
    {
      id: "staff-checkin", kind: "select", target: "staff-board",
      title: "Brief the staff on what you found",
      cue: "Walk the findings with the assistant whose operatory they came from — and ask what is making it hard.",
      why: "An audit is worthless if it arrives as a reprimand, because the next one will be walked in front of a clinic that has tidied for the auditor rather than shown them the problem. The overfilled container and the empty dispenser almost always mean a supply chain or a staffing squeeze rather than a person not caring, and the assistant standing there is the only person who knows which — asking is how the corrective action gets aimed at the cause.",
    },
  ],

  interrupts: [
    {
      id: "chair-seated-mid-shock",
      kind: "Patient at a treated chair",
      after: "shock-dose", delay: 4, seconds: 12,
      alert: "An assistant has just walked a patient into Operatory 2 and is reclining the chair — that unit's waterline is full of shock treatment.",
      cue: "Get that chair out of service before the syringe is touched.",
      target: "out-of-service-tag",
      why: "A waterline part-way through a shock treatment holds a concentrated EPA-registered chemical that is nowhere near drinking water, and the air-water syringe on that unit will deliver it to a mouth without anybody choosing to. The control is a physical tag on the chair, because a verbal warning across a clinic is not a control at all.",
      missNote: "The chair went into use with shock treatment still standing in its line. Whatever that patient's syringe delivered came out of a bottle labelled as a disinfectant, and nothing in the record will say so — the only trace will be a complaint nobody can explain.",
      wrongNote: "It is the out-of-service tag. The line is not the problem to solve in the next ten seconds; the chair being available is.",
    },
    {
      id: "cycle-aborted-load-out",
      kind: "Sterilisation failure",
      after: "dwell-hold", delay: 3, seconds: 12,
      alert: "The steriliser has alarmed across the hall — the cycle aborted part-way, and somebody has already unloaded the pouches onto the clean side.",
      cue: "Those packs are not sterile. Quarantine the whole load.",
      target: "quarantine-bin",
      why: "A load from an aborted cycle is unprocessed instrumentation that looks identical to sterile instrumentation, and the moment it is on the clean side nobody downstream can tell the two apart. Quarantining the whole load — not sorting it, not re-running the ones that look fine — is what keeps that ambiguity from reaching a patient, and the CDC's guidance treats any failure as covering every load back to the last known pass.",
      missNote: "The aborted load stayed on the clean side and went into circulation. Every one of those packs will be opened by somebody who trusts it, and the only honest answer afterwards is that nobody knows which patients received unprocessed instruments.",
      wrongNote: "It is the quarantine bin. The load goes out of reach first; working out what failed in the steriliser comes after nothing unprocessed can be picked up by mistake.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, INFAUD_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#cdd8dc", base2: "#c3ced4", seam: "rgba(0,0,0,0.1)",
    }), { repeat: 6, px: 256 });
    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#eff4f6", base2: "#e3eaed", seam: "rgba(0,0,0,0.06)",
    }), { repeat: 3, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.06, rough: 0.88, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.88, metal: 0.03, color: 0xffffff });
    // The dirty-to-clean flow line painted across the sterilisation floor.
    slab(g, 0.08, 0.004, 3.4, 1.5, 0.004, 1.3, INFAUD_DIRTY, { radius: 0.01, rough: 0.9, cast: false });

    // ------------------------------------------------ hand hygiene station wall
    const hygieneWall = group(g, -2.45, 0, -0.6, 1.4);
    box(hygieneWall, 0.08, 2.3, 2.6, 0, 1.15, 0, 0xe8edef, { rough: 0.7 });
    const hygieneCounter = group(hygieneWall, 0.36, 0, -0.5);
    box(hygieneCounter, 0.56, 0.86, 1.0, 0, 0.43, 0, INFAUD_CABINET, { rough: 0.5, metal: 0.12 });
    const hygieneTop = slab(hygieneCounter, 0.6, 0.04, 1.06, 0, 0.88, 0, 0xffffff, { radius: 0.01, rough: 0.42 });
    hygieneTop.material = texturedMat(topTex, { rough: 0.42, metal: 0.05, color: 0xffffff });
    // The sink with a supplies box stacked in it.
    const obstructedSink = group(hygieneCounter, 0, 0.84, -0.26);
    cyl(obstructedSink, 0.19, 0.19, 0.15, 0, 0, 0, 0xdde6ea, { rough: 0.3, metal: 0.25, seg: 18, open: true, side: 2 });
    cyl(obstructedSink, 0.02, 0.02, 0.32, 0, 0.2, -0.2, INFAUD_STEEL, { rough: 0.28, metal: 0.9, seg: 10 });
    cyl(obstructedSink, 0.014, 0.014, 0.16, 0, 0.34, -0.12, INFAUD_STEEL, { rough: 0.28, metal: 0.9, seg: 10 }).rotation.x = 1.1;
    box(obstructedSink, 0.22, 0.14, 0.2, 0, 0.04, 0.0, 0xc4a171, { rough: 0.8 });
    decal(obstructedSink, 0.16, 0.06, 0, 0.11, 0.01, signFace("SUPPLIES", { bg: "#d8b384", accent: "#7a5a33", scale: 0.4 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(obstructedSink, "Sink blocked", 0, 0.24, 0.1, { css: "#f0b86e", w: 0.36 });
    reg(hits, obstructedSink, "obstructed-sink");

    // The empty alcohol rub dispenser and the empty towel holder.
    const emptyDispenser = group(hygieneWall, 0.12, 1.36, 0.2);
    box(emptyDispenser, 0.11, 0.26, 0.1, 0, 0, 0, 0xeff4f6, { rough: 0.45, opacity: 0.75, transparent: true });
    box(emptyDispenser, 0.07, 0.03, 0.06, 0, -0.16, 0.02, 0x3c4249, { rough: 0.5 });
    decal(emptyDispenser, 0.09, 0.05, 0, 0.09, 0.052, signFace("EMPTY", { bg: "#eff4f6", fg: "#a5261e", accent: "#f0645b", scale: 0.5 }), { px: 128 });
    holoTag(emptyDispenser, "Rub empty", 0, 0.2, 0, { css: "#f0b86e", w: 0.3 });
    reg(hits, emptyDispenser, "empty-dispenser");

    const towelHolder = group(hygieneWall, 0.12, 1.32, -1.0);
    box(towelHolder, 0.12, 0.3, 0.26, 0, 0, 0, INFAUD_STEEL, { rough: 0.45, metal: 0.5 });
    box(towelHolder, 0.02, 0.06, 0.22, 0.06, -0.17, 0, 0x8e979f, { rough: 0.45, metal: 0.5 });
    holoTag(towelHolder, "No towels", 0, 0.24, 0, { css: "#f0b86e", w: 0.32 });
    reg(hits, towelHolder, "missing-towels");

    // The working alcohol rub and towel stack, so the fixed state has somewhere
    // to appear.
    const spareStock = group(hygieneCounter, 0, 0.9, 0.34);
    box(spareStock, 0.16, 0.12, 0.2, 0, 0.06, 0, 0xeef4f6, { rough: 0.6 });
    box(spareStock, 0.14, 0.05, 0.18, 0, 0.145, 0, 0xf8fafb, { rough: 0.85 });
    holoTag(spareStock, "Spare stock", 0, 0.26, 0, { css: INFAUD_CSS, w: 0.34 });

    // ------------------------------------------------------------- operatory 1
    const op1 = group(g, -0.25, 0, -1.55, 0.25);
    slab(op1, 0.56, 0.12, 1.34, 0, 0.5, 0, 0x455a68, { radius: 0.06, rough: 0.6 });
    const op1Back = slab(op1, 0.52, 0.8, 0.54, 0, 0.82, -0.5, 0x455a68, { radius: 0.06, rough: 0.6 });
    op1Back.rotation.x = -1.0;
    cyl(op1, 0.05, 0.07, 0.66, 0, 0.24, 0, CITY.darkSteel, { rough: 0.3, metal: 0.85, seg: 12 });
    cyl(op1, 0.2, 0.24, 0.06, 0, 0.03, 0, 0x2d333a, { rough: 0.45, metal: 0.5, seg: 16 });
    // Barrier station: fresh film, fresh sleeves, tape.
    const barrierStation = group(op1, 0.52, 0.92, 0.3, -0.4);
    box(barrierStation, 0.2, 0.09, 0.14, 0, 0, 0, 0xeff4f6, { rough: 0.55 });
    box(barrierStation, 0.18, 0.03, 0.12, 0, 0.06, 0, 0xf8fbfc, { rough: 0.5, opacity: 0.6, transparent: true });
    cyl(barrierStation, 0.03, 0.03, 0.06, 0.12, 0.02, 0, 0x72c4e0, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    decal(barrierStation, 0.15, 0.05, 0, 0.078, 0, signFace("BARRIERS", { bg: "#eff4f6", accent: INFAUD_CSS, scale: 0.42 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(barrierStation, "Barrier stock", 0, 0.16, 0, { css: INFAUD_CSS, w: 0.36 });
    reg(hits, barrierStation, "barrier-station");
    // A stand under the barrier station so it is not floating off the chair.
    box(op1, 0.3, 0.9, 0.26, 0.52, 0.45, 0.3, INFAUD_CABINET, { rough: 0.5 });

    // The dry paper towel on the chair arm — the hazard.
    const dryWipe = group(op1, -0.32, 0.58, 0.3);
    slab(dryWipe, 0.12, 0.02, 0.12, 0, 0, 0, 0xf4f6f8, { radius: 0.02, rough: 0.92 });
    holoTag(dryWipe, "Dry wipe only", 0, 0.08, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, dryWipe, "dry-wipe");

    // The sharps container on the floor, and the one out of reach.
    const unmountedContainer = group(g, -1.35, 0, -0.85, 0.5);
    box(unmountedContainer, 0.26, 0.3, 0.2, 0, 0.16, 0, 0xd8342a, { rough: 0.6 });
    box(unmountedContainer, 0.28, 0.05, 0.22, 0, 0.33, 0, 0xf2e9c9, { rough: 0.55 });
    decal(unmountedContainer, 0.22, 0.1, 0, 0.18, 0.102, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.38 }), { px: 192 });
    holoTag(unmountedContainer, "On the floor", 0, 0.46, 0, { css: "#f0b86e", w: 0.36 });
    reg(hits, unmountedContainer, "unmounted-container");

    const blockedContainer = group(g, 0.85, 0, -2.6, -0.3);
    cyl(blockedContainer, 0.02, 0.02, 1.7, 0, 0.85, 0, 0x8d959d, { rough: 0.5, metal: 0.5, seg: 10 });
    box(blockedContainer, 0.24, 0.28, 0.18, 0, 1.78, 0, 0xd8342a, { rough: 0.6 });
    box(blockedContainer, 0.26, 0.05, 0.2, 0, 1.94, 0, 0xf2e9c9, { rough: 0.55 });
    holoTag(blockedContainer, "Out of reach", 0, 2.06, 0, { css: "#f0b86e", w: 0.36 });
    reg(hits, blockedContainer, "blocked-container");

    const wrongStream = group(g, 0.2, 0, -2.5, 0.4);
    cyl(wrongStream, 0.17, 0.13, 0.4, 0, 0.2, 0, 0x4a5157, { rough: 0.6, seg: 14 });
    cyl(wrongStream, 0.18, 0.18, 0.3, 0, 0.32, 0, 0xd8342a, { rough: 0.7, seg: 14, opacity: 0.75, transparent: true });
    cyl(wrongStream, 0.002, 0.002, 0.05, 0.05, 0.46, 0.04, INFAUD_STEEL, { rough: 0.15, metal: 0.9, seg: 6 }).rotation.z = 0.8;
    decal(wrongStream, 0.14, 0.08, 0, 0.32, 0.182, signFace("RED BAG", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.34 }), { px: 160 });
    holoTag(wrongStream, "Needle in a bag", 0, 0.62, 0, { css: "#f0b86e", w: 0.42 });
    reg(hits, wrongStream, "wrong-stream-container");

    // The overfilled container in the sterilisation room — the hazard.
    const overfilled = group(g, 2.05, 0, -0.55, -1.0);
    box(overfilled, 0.26, 0.32, 0.2, 0, 1.06, 0, 0xd8342a, { rough: 0.6 });
    box(overfilled, 0.28, 0.05, 0.22, 0, 1.24, 0, 0xf2e9c9, { rough: 0.55 });
    for (let i = 0; i < 4; i++) {
      cyl(overfilled, 0.002, 0.002, 0.06, -0.06 + i * 0.04, 1.28, 0.03, INFAUD_STEEL, { rough: 0.15, metal: 0.9, seg: 6 }).rotation.z = 0.4 + i * 0.3;
    }
    cyl(overfilled, 0.028, 0.028, 0.9, -0.18, 0.55, 0, 0x8d959d, { rough: 0.5, metal: 0.4, seg: 10 });
    decal(overfilled, 0.22, 0.03, 0, 1.15, 0.102, signFace("FILL LINE", { bg: "#f2ae14", accent: "#a5261e", scale: 0.42 }), { px: 192 });
    holoTag(overfilled, "Past the line", 0, 1.4, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, overfilled, "overfilled-sharps");

    // ---------------------------------------------- operatory 2 / the waterline
    const op2 = group(g, 1.45, 0, -1.9, -0.35);
    slab(op2, 0.56, 0.12, 1.34, 0, 0.5, 0, 0x455a68, { radius: 0.06, rough: 0.6 });
    const op2Back = slab(op2, 0.52, 0.8, 0.54, 0, 0.82, -0.5, 0x455a68, { radius: 0.06, rough: 0.6 });
    op2Back.rotation.x = -1.0;
    cyl(op2, 0.05, 0.07, 0.66, 0, 0.24, 0, CITY.darkSteel, { rough: 0.3, metal: 0.85, seg: 12 });
    cyl(op2, 0.2, 0.24, 0.06, 0, 0.03, 0, 0x2d333a, { rough: 0.45, metal: 0.5, seg: 16 });
    const op2Tag = box(op2, 0.22, 0.14, 0.02, 0, 1.0, 0.4, 0xf0645b, { rough: 0.5 });
    decal(op2, 0.18, 0.1, 0, 1.0, 0.412, signFace("OUT OF SERVICE", { bg: "#f8837a", accent: "#5a1410", scale: 0.28 }), { px: 192 });
    holoTag(op2, "Out-of-service tag", 0, 1.16, 0.4, { css: INFAUD_CSS, w: 0.5 });
    reg(hits, op2Tag, "out-of-service-tag");
    op2Tag.visible = true;

    const waterlineBox = group(g, 2.15, 0, -1.9, -0.8);
    box(waterlineBox, 0.44, 1.0, 0.34, 0, 0.5, 0, 0x5b6771, { rough: 0.5, metal: 0.3 });
    const waterlineValve = torus(waterlineBox, 0.07, 0.014, 0.16, 0.74, 0.18, 0x2f7d4a, { rough: 0.5, seg: 6, seg2: 18 });
    waterlineValve.rotation.x = Math.PI / 2;
    holoTag(waterlineBox, "Line isolation", 0.16, 0.9, 0.18, { css: INFAUD_CSS, w: 0.4 });
    reg(hits, waterlineValve, "waterline-valve");
    hose(waterlineBox, [[0.16, 0.62, 0.18], [0.0, 0.42, 0.3], [-0.2, 0.2, 0.22]], 0.012, 0xbfd6e2, { steps: 10, rough: 0.4 });

    const shockPump = group(waterlineBox, -0.12, 1.06, 0.1);
    cyl(shockPump, 0.05, 0.055, 0.2, 0, 0.1, 0, 0x2f8c9c, { rough: 0.4, seg: 14 });
    cyl(shockPump, 0.02, 0.02, 0.07, 0, 0.23, 0, 0xd7dee3, { rough: 0.35, metal: 0.5, seg: 10 });
    decal(shockPump, 0.08, 0.07, 0, 0.12, 0.056, paperFace("", ["SHOCK", "SEE LABEL", "DWELL"], { bg: "#e6f4f8" }), { px: 160 });
    holoTag(shockPump, "Shock treatment", 0, 0.32, 0, { css: INFAUD_CSS, w: 0.44 });
    reg(hits, shockPump, "shock-pump");

    const dwellTimer = instrument(g, 1.75, 1.02, -1.15, { ry: -0.6, idle: "DWELL", color: 0x2f5f6b, w: 0.15, d: 0.2 });
    holoTag(dwellTimer, "Dwell timer", 0, 0.18, 0, { css: INFAUD_CSS, w: 0.36 });
    reg(hits, dwellTimer, "dwell-timer");
    // A small trolley under the timer.
    const timerTrolley = group(g, 1.75, 0, -1.15);
    box(timerTrolley, 0.36, 0.04, 0.3, 0, 0.98, 0, INFAUD_CABINET, { rough: 0.5 });
    for (const [dx, dz] of [[-0.14, -0.11], [0.14, 0.11]]) {
      cyl(timerTrolley, 0.016, 0.016, 0.96, dx, 0.48, dz, 0x8d959d, { rough: 0.5, metal: 0.4, seg: 8 });
    }
    void timerTrolley;

    const sampleVial = group(g, 1.3, 1.02, -1.02, 0.3);
    cyl(sampleVial, 0.018, 0.018, 0.07, 0, 0.035, 0, 0xdff0f8, { rough: 0.2, seg: 12, opacity: 0.55, transparent: true });
    cyl(sampleVial, 0.02, 0.02, 0.012, 0, 0.076, 0, 0x2f7d4a, { rough: 0.5, seg: 12 });
    holoTag(sampleVial, "Waterline sample", 0, 0.16, 0, { css: INFAUD_CSS, w: 0.46 });
    reg(hits, sampleVial, "sample-vial");

    const sampleCooler = group(g, 0.85, 0, 0.1, 0.6);
    box(sampleCooler, 0.34, 0.26, 0.26, 0, 0.13, 0, 0xdfe9ef, { rough: 0.55 });
    box(sampleCooler, 0.36, 0.05, 0.28, 0, 0.28, 0, 0x5f9ec4, { rough: 0.5 });
    box(sampleCooler, 0.1, 0.03, 0.04, 0, 0.31, 0.1, 0x3c4249, { rough: 0.5 });
    decal(sampleCooler, 0.26, 0.1, 0, 0.16, 0.132, signFace("TO LAB", { bg: "#e4eef4", accent: "#2f6f86", scale: 0.4 }), { px: 192 });
    holoTag(sampleCooler, "Sample cooler", 0, 0.42, 0, { css: INFAUD_CSS, w: 0.4 });
    reg(hits, sampleCooler, "sample-cooler");

    // --------------------------------------------------- sterilisation centre
    const sterileWall = group(g, 2.6, 0, 1.2, -Math.PI / 2);
    box(sterileWall, 2.6, 2.3, 0.08, 0, 1.15, 0, 0xe8edef, { rough: 0.7 });
    const dirtySide = group(g, 1.95, 0, 0.75, -Math.PI / 2);
    box(dirtySide, 0.9, 0.86, 0.56, 0, 0.43, 0, INFAUD_CABINET, { rough: 0.5, metal: 0.12 });
    const dirtyTop = slab(dirtySide, 0.96, 0.04, 0.6, 0, 0.88, 0, 0xffffff, { radius: 0.01, rough: 0.42 });
    dirtyTop.material = texturedMat(topTex, { rough: 0.42, metal: 0.05, color: 0xffffff });
    decal(dirtySide, 0.5, 0.1, 0, 0.92, 0.0, signFace("DIRTY SIDE", { bg: "#f2e2cc", accent: "#a5661e", scale: 0.38 }), { px: 224 }).rotation.x = -Math.PI / 2;
    // The hand-scrub sink with bare hands in it — the hazard.
    const scrubSink = group(dirtySide, -0.24, 0.84, 0.0);
    cyl(scrubSink, 0.16, 0.16, 0.14, 0, 0, 0, 0xdde6ea, { rough: 0.3, metal: 0.25, seg: 16, open: true, side: 2 });
    for (let i = 0; i < 3; i++) {
      cyl(scrubSink, 0.004, 0.004, 0.12, -0.04 + i * 0.04, -0.03, 0.02, INFAUD_STEEL, { rough: 0.3, metal: 0.85, seg: 6 }).rotation.z = Math.PI / 2.2;
    }
    box(scrubSink, 0.06, 0.02, 0.1, 0.06, -0.02, -0.04, 0x2f6f86, { rough: 0.6 });
    holoTag(scrubSink, "Bare-hand scrub", 0, 0.16, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, scrubSink, "bare-hand-scrub");

    // The ultrasonic cleaner — the mechanical alternative.
    const ultrasonic = group(dirtySide, 0.24, 0.9, 0.0);
    box(ultrasonic, 0.26, 0.16, 0.2, 0, 0.08, 0, 0xc6ced4, { rough: 0.45, metal: 0.4 });
    box(ultrasonic, 0.22, 0.02, 0.16, 0, 0.17, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 0.2, rough: 0.3 });
    decal(ultrasonic, 0.18, 0.05, 0, 0.09, 0.101, signFace("ULTRASONIC", { bg: "#22303c", accent: INFAUD_CSS, scale: 0.36 }), { px: 160 });

    const cleanSide = group(g, 1.95, 0, 2.0, -Math.PI / 2);
    box(cleanSide, 1.0, 0.86, 0.56, 0, 0.43, 0, INFAUD_CABINET, { rough: 0.5, metal: 0.12 });
    const cleanTop = slab(cleanSide, 1.06, 0.04, 0.6, 0, 0.88, 0, 0xffffff, { radius: 0.01, rough: 0.42 });
    cleanTop.material = texturedMat(topTex, { rough: 0.42, metal: 0.05, color: 0xffffff });
    decal(cleanSide, 0.5, 0.1, 0, 0.92, 0.0, signFace("CLEAN SIDE", { bg: "#e2f2e6", accent: "#2f7d4a", scale: 0.38 }), { px: 224 }).rotation.x = -Math.PI / 2;

    // The autoclave, with its chart recorder.
    const autoclave = group(cleanSide, -0.3, 0.9, -0.02);
    box(autoclave, 0.42, 0.36, 0.4, 0, 0.18, 0, 0xcdd6dc, { rough: 0.4, metal: 0.5 });
    cyl(autoclave, 0.13, 0.13, 0.06, 0, 0.18, 0.21, 0x9ba7ae, { rough: 0.35, metal: 0.7, seg: 18 }).rotation.x = Math.PI / 2;
    cyl(autoclave, 0.03, 0.03, 0.07, 0.15, 0.18, 0.22, 0x3c4249, { rough: 0.4, metal: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    const sterilizerChart = group(cleanSide, -0.3, 1.34, 0.0);
    box(sterilizerChart, 0.24, 0.16, 0.03, 0, 0, 0, 0x22282e, { rough: 0.45, metal: 0.2 });
    const chartFace = decal(sterilizerChart, 0.21, 0.13, 0, 0, 0.018, (cx, w, h) => {
      cx.fillStyle = "#f6f2e4"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "rgba(0,0,0,0.12)";
      for (let i = 1; i < 5; i++) { cx.beginPath(); cx.moveTo(0, (h * i) / 5); cx.lineTo(w, (h * i) / 5); cx.stroke(); }
      cx.strokeStyle = "#a5261e"; cx.lineWidth = 3;
      cx.beginPath();
      cx.moveTo(w * 0.05, h * 0.85);
      cx.lineTo(w * 0.3, h * 0.28);
      cx.lineTo(w * 0.7, h * 0.26);
      cx.lineTo(w * 0.95, h * 0.82);
      cx.stroke();
      cx.fillStyle = "#3c4249";
      cx.font = `600 ${Math.round(h * 0.14)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("CYCLE 214", w * 0.06, h * 0.12);
    }, { px: 256 });
    holoTag(sterilizerChart, "Chart recorder", 0, 0.14, 0, { css: INFAUD_CSS, w: 0.42 });
    reg(hits, sterilizerChart, "sterilizer-chart");

    // The aborted load the second interruption puts on the clean side.
    const abortedLoad = group(cleanSide, 0.16, 0.92, 0.06);
    for (let i = 0; i < 3; i++) {
      box(abortedLoad, 0.16, 0.02, 0.1, 0, i * 0.024, i * 0.012, 0xf2f6f8, { rough: 0.6, opacity: 0.85, transparent: true });
    }
    holoTag(abortedLoad, "Aborted cycle", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    abortedLoad.visible = false;

    const quarantineBin = group(g, 1.35, 0, 2.5, -1.0);
    cyl(quarantineBin, 0.17, 0.14, 0.42, 0, 0.21, 0, 0xf0b86e, { rough: 0.6, seg: 16 });
    cyl(quarantineBin, 0.18, 0.18, 0.04, 0, 0.44, 0, 0xd8923a, { rough: 0.55, seg: 16 });
    decal(quarantineBin, 0.16, 0.1, 0, 0.24, 0.172, signFace("QUARANTINE", { bg: "#f8d8a8", accent: "#8a4a10", scale: 0.32 }), { px: 192 });
    holoTag(quarantineBin, "Quarantine", 0, 0.58, 0, { css: INFAUD_CSS, w: 0.34 });
    reg(hits, quarantineBin, "quarantine-bin");

    // The expired spore strips on the shelf — the hazard.
    const shelf = group(g, 2.5, 0, 2.5, -1.2);
    box(shelf, 0.06, 1.0, 0.6, -0.3, 0.5, 0, 0x8d959d, { rough: 0.5, metal: 0.4 });
    box(shelf, 0.06, 1.0, 0.6, 0.3, 0.5, 0, 0x8d959d, { rough: 0.5, metal: 0.4 });
    box(shelf, 0.66, 0.02, 0.58, 0, 0.62, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
    box(shelf, 0.66, 0.02, 0.58, 0, 1.0, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
    const expiredStrips = group(shelf, -0.16, 0.66, 0);
    box(expiredStrips, 0.16, 0.08, 0.12, 0, 0.04, 0, 0xe8dfc8, { rough: 0.7 });
    decal(expiredStrips, 0.13, 0.05, 0, 0.04, 0.061, signFace("EXP 2024", { bg: "#efe4c8", accent: "#a5261e", scale: 0.38 }), { px: 160 });
    holoTag(expiredStrips, "Expired strips", 0, 0.16, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, expiredStrips, "expired-spore-strips");
    const goodStrips = box(shelf, 0.16, 0.08, 0.12, 0.16, 0.7, 0, 0xdff0e4, { rough: 0.7 });
    decal(shelf, 0.13, 0.05, 0.16, 0.7, 0.061, signFace("IN DATE", { bg: "#dff0e4", accent: "#2f7d4a", scale: 0.4 }), { px: 160 });
    void goodStrips;

    // ------------------------------------------------------------- PPE cupboard
    const ppeCupboard = group(g, -2.6, 0, 2.15, 1.1);
    box(ppeCupboard, 0.5, 1.9, 1.1, 0, 0.95, 0, INFAUD_CABINET, { rough: 0.5, metal: 0.12 });
    for (let i = 0; i < 3; i++) {
      box(ppeCupboard, 0.02, 0.02, 1.06, 0.26, 0.55 + i * 0.44, 0, 0x8e979f, { rough: 0.45, metal: 0.5 });
    }
    const maskStock = box(ppeCupboard, 0.2, 0.14, 0.24, 0.16, 1.5, -0.32, 0xe6eef4, { rough: 0.7 });
    decal(ppeCupboard, 0.16, 0.06, 0.262, 1.5, -0.32, signFace("MASKS", { bg: "#22303c", accent: INFAUD_CSS, scale: 0.4 }), { px: 128 }).rotation.y = Math.PI / 2;
    holoTag(ppeCupboard, "Masks", 0.3, 1.66, -0.32, { css: INFAUD_CSS, w: 0.24 });
    reg(hits, maskStock, "mask-stock");
    const eyewearStock = group(ppeCupboard, 0.16, 1.1, -0.32);
    box(eyewearStock, 0.2, 0.07, 0.006, 0.02, 0, 0.012, 0xcfeaf6, { rough: 0.2, opacity: 0.5, transparent: true });
    box(eyewearStock, 0.03, 0.07, 0.03, 0.02, 0, -0.1, 0x2f5f7c, { rough: 0.35, metal: 0.2 });
    box(eyewearStock, 0.03, 0.07, 0.03, 0.02, 0, 0.1, 0x2f5f7c, { rough: 0.35, metal: 0.2 });
    holoTag(ppeCupboard, "Side shields", 0.3, 1.24, -0.32, { css: INFAUD_CSS, w: 0.36 });
    reg(hits, eyewearStock, "eyewear-stock");
    const gownStock = box(ppeCupboard, 0.2, 0.12, 0.26, 0.16, 0.7, -0.32, 0xcfe4e2, { rough: 0.85 });
    holoTag(ppeCupboard, "Gowns", 0.3, 0.84, -0.32, { css: INFAUD_CSS, w: 0.24 });
    reg(hits, gownStock, "gown-stock");
    const gloveSizes = group(ppeCupboard, 0.16, 1.5, 0.3);
    const GLOVE_TONES = [0x6fa8d6, 0x8fd6a0, 0xe2b0c4];
    for (let i = 0; i < 3; i++) {
      box(gloveSizes, 0.2, 0.12, 0.2, 0, -i * 0.42, 0, GLOVE_TONES[i], { rough: 0.65 });
    }
    decal(ppeCupboard, 0.16, 0.06, 0.262, 1.5, 0.3, signFace("S / M / L", { bg: "#22303c", accent: INFAUD_CSS, scale: 0.36 }), { px: 128 }).rotation.y = Math.PI / 2;
    holoTag(ppeCupboard, "Glove sizes", 0.3, 1.68, 0.3, { css: INFAUD_CSS, w: 0.34 });
    reg(hits, gloveSizes, "glove-sizes");

    // ---------------------------------------------- the checklist and the file
    const auditTrolley = group(g, -1.6, 0, 1.15, 0.95);
    box(auditTrolley, 0.5, 0.04, 0.38, 0, 0.96, 0, INFAUD_CABINET, { rough: 0.5 });
    box(auditTrolley, 0.5, 0.04, 0.38, 0, 0.6, 0, INFAUD_CABINET, { rough: 0.5 });
    for (const [dx, dz] of [[-0.22, -0.16], [0.22, 0.16]]) {
      cyl(auditTrolley, 0.016, 0.016, 0.94, dx, 0.47, dz, 0x8d959d, { rough: 0.5, metal: 0.4, seg: 8 });
    }

    const cdcChecklist = group(auditTrolley, -0.13, 0.99, 0, 0.1);
    box(cdcChecklist, 0.19, 0.02, 0.25, 0, 0, 0, 0x2f6f86, { rough: 0.6 });
    box(cdcChecklist, 0.18, 0.006, 0.24, 0, 0.014, 0, 0xf8f5ea, { rough: 0.9 });
    decal(cdcChecklist, 0.16, 0.21, 0, 0.019, 0, paperFace("INFECTION PREVENTION", [
      "Written plan + coordinator", "Hand hygiene, PPE, barriers",
      "Waterlines, sharps, sterilisation", "Findings + corrective action",
    ], { bg: "#f8f5ea", band: "#2f6f86" }), { px: 320 }).rotation.x = -Math.PI / 2;
    holoTag(cdcChecklist, "CDC checklist", 0, 0.14, 0, { css: INFAUD_CSS, w: 0.42 });
    reg(hits, cdcChecklist, "cdc-checklist");

    const correctiveForm = group(auditTrolley, 0.13, 0.99, 0, -0.15);
    box(correctiveForm, 0.18, 0.006, 0.24, 0, 0, 0, 0xf6f0e2, { rough: 0.9 });
    decal(correctiveForm, 0.17, 0.22, 0, 0.005, 0, paperFace("CORRECTIVE ACTION", [
      "Finding", "Cause", "Action + owner", "Re-check date",
    ], { bg: "#f8f2e4", band: "#a5661e" }), { px: 288 }).rotation.x = -Math.PI / 2;
    holoTag(correctiveForm, "Corrective action", 0, 0.12, 0, { css: INFAUD_CSS, w: 0.48 });
    reg(hits, correctiveForm, "corrective-form");

    const auditReport = group(auditTrolley, 0.0, 0.63, 0.02, 0.2);
    box(auditReport, 0.2, 0.008, 0.26, 0, 0, 0, 0xeef4f8, { rough: 0.9 });
    decal(auditReport, 0.19, 0.24, 0, 0.006, 0, paperFace("AUDIT REPORT", [
      "Findings this round", "Signed + dated", "Re-audit date",
    ], { bg: "#eff4f8", band: "#2f7d4a" }), { px: 288 }).rotation.x = -Math.PI / 2;
    holoTag(auditReport, "Audit report", 0, 0.12, 0, { css: INFAUD_CSS, w: 0.38 });
    reg(hits, auditReport, "audit-report");

    const planBinder = group(g, -2.6, 0, 0.95, 0.9);
    box(planBinder, 0.34, 0.78, 0.3, 0, 0.39, 0, INFAUD_CABINET, { rough: 0.55 });
    box(planBinder, 0.26, 0.08, 0.32, 0, 0.82, 0, 0x2f6f86, { rough: 0.7 });
    box(planBinder, 0.25, 0.06, 0.3, 0, 0.85, 0.005, 0xf8f5ea, { rough: 0.9 });
    decal(planBinder, 0.22, 0.26, 0, 0.885, 0.005, paperFace("WRITTEN PLAN", [
      "Exposure control plan", "Infection control policy", "Audit file",
    ], { bg: "#f8f5ea", band: "#2f6f86" }), { px: 288 }).rotation.x = -Math.PI / 2;
    holoTag(planBinder, "Written plan", 0, 1.0, 0, { css: INFAUD_CSS, w: 0.36 });
    reg(hits, planBinder, "plan-binder");

    // Records boards on the sterilisation wall.
    const cycleLog = holoPanel(g, 0.5, 0.32, 2.42, 1.52, 0.55, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = INFAUD_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c8e8f4";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("CYCLE LOG", w * 0.06, h * 0.18);
      cx.fillStyle = "#eaf6fb";
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      ["Load 214  08:10  operator JR", "Contents listed", "Parameters recorded"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.19)));
    }, { accent: INFAUD_ACCENT, ry: -Math.PI / 2 });
    reg(hits, cycleLog, "cycle-log");

    const indicatorLog = holoPanel(g, 0.5, 0.32, 2.42, 1.52, 1.35, (cx, w, h) => {
      cx.fillStyle = "rgba(8,22,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = INFAUD_CLEAN; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#cfeedd";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("CHEMICAL INDICATORS", w * 0.06, h * 0.18);
      cx.fillStyle = "#eaf6f0";
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      ["Internal + external, every pack", "Colour change checked at opening", "Failures logged"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.19)));
    }, { accent: INFAUD_CLEAN, ry: -Math.PI / 2 });
    reg(hits, indicatorLog, "indicator-log");

    const sporeReport = holoPanel(g, 0.5, 0.32, 2.42, 1.52, 2.15, (cx, w, h) => {
      cx.fillStyle = "rgba(20,16,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b490e0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e4d8ff";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SPORE TESTS — WEEKLY", w * 0.06, h * 0.18);
      cx.fillStyle = "#f2ecff";
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      ["Week 34  pass", "Week 35  pass", "Week 36  awaiting"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.19)));
    }, { accent: 0xb490e0, ry: -Math.PI / 2 });
    reg(hits, sporeReport, "spore-report");

    const staffBoard = holoPanel(g, 0.56, 0.36, -2.55, 1.44, 0.15, (cx, w, h) => {
      cx.fillStyle = "rgba(14,12,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0b86e"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe2bd";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("STAFF BRIEFING", w * 0.06, h * 0.16);
      cx.fillStyle = "#fff3e4";
      cx.font = `${Math.round(h * 0.095)}px Arial, sans-serif`;
      ["Findings walked, not read out", "Supply gap or staffing?",
        "What would make it easier?"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.19)));
    }, { accent: 0xf0b86e, ry: 1.45 });
    reg(hits, staffBoard, "staff-board");

    // ------------------------------------------------------------------- crew
    const assistant = standingFigure(g, -1.85, -0.15, { ry: 0.8, cloth: 0x2f6f86, skin: 0xb98a63, seed: 41 });
    const patientFigure = standingFigure(g, 0.65, -0.75, { ry: -1.2, cloth: 0x7c6f5f, skin: 0xd9a985, seed: 45 });
    patientFigure.visible = false;

    const steam = particles(g, 22, 0xdff0f8, { size: 0.012, life: 0.5, additive: false, opacity: 0.4 });
    let dosing = false, chairAlert = false, loadAlert = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.25, 1.1, -1.55),

      onStep(step) { dosing = step.id === "shock-dose"; },

      onStepComplete(step) {
        if (step.id === "hand-hygiene-audit") {
          repaint(emptyDispenser.children[2], signFace("FULL", { bg: "#eff4f6", fg: "#2f7d4a", accent: INFAUD_CLEAN, scale: 0.5 }));
          obstructedSink.children[3].visible = false;
          towelHolder.children[1].material = mat(0xf8fafb, { rough: 0.85 });
        }
        if (step.id === "surface-barriers") {
          barrierStation.children[1].material = mat(0xffffff, { rough: 0.45, opacity: 0.8 });
          dryWipe.visible = false;
        }
        if (step.id === "waterline-sample") {
          sampleVial.parent.remove(sampleVial);
          sampleCooler.add(sampleVial);
          sampleVial.position.set(0, 0.16, 0);
          sampleVial.rotation.set(0, 0, 0);
        }
        if (step.id === "sharps-audit") {
          unmountedContainer.position.set(-1.35, 0.72, -0.9);
          wrongStream.children[2].visible = false;
          blockedContainer.children[1].position.y = 1.02;
          blockedContainer.children[2].position.y = 1.18;
        }
        if (step.id === "chamber-gauge") {
          repaint(chartFace, (cx, w, h) => {
            cx.fillStyle = "#f6f2e4"; cx.fillRect(0, 0, w, h);
            cx.strokeStyle = "#2f7d4a"; cx.lineWidth = 3;
            cx.beginPath();
            cx.moveTo(w * 0.05, h * 0.85);
            cx.lineTo(w * 0.28, h * 0.2);
            cx.lineTo(w * 0.74, h * 0.19);
            cx.lineTo(w * 0.95, h * 0.82);
            cx.stroke();
            cx.fillStyle = "#3c4249";
            cx.font = `600 ${Math.round(h * 0.14)}px Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillText("CYCLE 214  READ", w * 0.06, h * 0.12);
          });
        }
        if (step.id === "record-review") expiredStrips.visible = false;
        if (step.id === "audit-signoff") {
          auditReport.parent.remove(auditReport);
          planBinder.add(auditReport);
          auditReport.position.set(0, 0.9, 0.01);
          auditReport.rotation.set(0, 0, 0);
        }
      },

      onInterrupt(it) {
        if (it.id === "chair-seated-mid-shock") {
          chairAlert = true;
          patientFigure.visible = true;
          patientFigure.position.set(0.8, 0, -1.9);
        }
        if (it.id === "cycle-aborted-load-out") {
          loadAlert = true;
          abortedLoad.visible = true;
        }
      },

      onInterruptEnd(it) {
        if (it.id === "chair-seated-mid-shock") {
          chairAlert = false;
          op2Tag.material.emissiveIntensity = 1;
          if (it.resolved === "answered") {
            patientFigure.visible = false;
            op2Tag.position.z = 0.48;
            op2Tag.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.6, rough: 0.5 });
          }
        }
        if (it.id === "cycle-aborted-load-out") {
          loadAlert = false;
          if (it.resolved === "answered") {
            abortedLoad.parent.remove(abortedLoad);
            quarantineBin.add(abortedLoad);
            abortedLoad.position.set(0, 0.34, 0);
            abortedLoad.visible = true;
          }
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        steam.visible = dosing && !!session?.track;
        if (steam.visible) steam.userData.step(dt, new THREE.Vector3(2.0, 1.3, -1.8), 0.06, 0.4, 0.6);
        if (chairAlert) op2Tag.position.x = Math.sin(t * 5) * 0.03;
        if (loadAlert) abortedLoad.position.y = 0.92 + Math.abs(Math.sin(t * 3)) * 0.02;
      },
    };
  },
};
