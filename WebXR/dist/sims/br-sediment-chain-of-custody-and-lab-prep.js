import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { workboat, cargoVan } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sediment Chain of Custody & Lab Prep VR — SF Bay Restoration
// & Cleanup, pack D (contaminated sediment and water quality).
//
// Sediment cores come ashore from a coring barge in a workboat and become
// laboratory samples at a field bench under a canopy on the dock: received
// against the core log and signed for, measured for recovery, extruded, the
// volatile subsample taken off the fresh face before anything is mixed, the
// rest homogenised and jarred, the cooler packed with a temperature blank,
// sealed and relinquished to a courier with both signatures. The learner is
// the field sample custodian on a LIUNA Local 261 remediation crew; the
// coring crew hand and the courier are the two people custody passes
// between. The analyte list, the jar order and every acceptance figure read
// against "the sampling and analysis plan"; nothing here is any real site's
// data, and no result is shown.

const BRCC_ACCENT = 0x8fb85a;

export const SIM_BR_SEDIMENT_CHAIN_OF_CUSTODY_AND_LAB_PREP = {
  id: "br-sediment-chain-of-custody-and-lab-prep",
  index: "BR-D3",
  domain: "Environmental",
  trade: "Field sample custodian on a LIUNA Local 261 remediation crew, receiving cores from a coring barge whose crane an IUOE Local 3 operating engineer runs, and relinquishing coolers to the laboratory's courier",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "fog",
  certification: "LIUNA Local 261 hazardous waste and environmental remediation training (LIUNA Training and Education Fund) for the field sample custodian; IUOE Local 3 operating engineer on the coring barge's crane; OSHA HAZWOPER, 29 CFR 1910.120, for handling contaminated sediment at the bench; EPA QA/G-5 quality assurance project plan practice and the chain of custody built on it; 40 CFR 136 preservation and holding times for the site-water fractions; the Regional Water Quality Control Board's Section 401 certification and Army Corps Section 404 conditions that call for the sediment data; DMMO testing requirements the results are reported against",
  name: "Sediment Chain of Custody & Lab Prep",
  title: simTitle("Sediment Chain of Custody & Lab Prep"),
  tagline: "Cores to coolers without a gap in custody: the sampling plan read, the incoming cores checked and signed for, recovery measured, the core extruded and the volatiles taken off the fresh face, the rest homogenised while the sample fridge alarms, jars filled while an unlabelled bag lands on the bench, the temperature blank packed, the cooler iced, sealed and relinquished with both signatures, the bench closed out, logged and the crew checked in",
  accent: BRCC_ACCENT,
  accentCss: "#8fb85a",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "unbroken-custody", name: "Unbroken Custody", note: "Every core signed in, every jar sealed and every cooler signed out, with nothing unlabelled let into the batch" },

  supportLine: "your union hall's member assistance programme — LIUNA Local 261 — with the employer's employee assistance line behind it",

  game: system({
    name: "Custody Bench",
    currency: "JAR",
    ranks: ["Bench Hand", "Sample Tech", "Field Custodian", "Sample Coordinator", "Custody Bench Certified"],
    badges: [
      { id: "signed-in-clean", name: "Signed In Clean", note: "The plan read and the incoming cores checked and signed for without a correction", test: AWARD.all(AWARD.stepClean("read-sap"), AWARD.stepClean("custody-in")) },
      { id: "nothing-topped-off", name: "Nothing Topped Off", note: "Never a jar topped from another core, never a knife pulled toward a hand, never a cooler handed over unsigned", test: AWARD.safe },
      { id: "recovery-true", name: "Recovery True", note: "Recovery committed and the mix held inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-bench", name: "Clean Bench", note: "No corrections from the plan to the check-in", test: AWARD.clean },
      { id: "even-mix", name: "Even Mix", note: "Held the homogenising in band the whole time", test: AWARD.unbroken },
      { id: "courier-on-time", name: "Courier On Time", note: "Cooler relinquished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "top-off-jar": "You went to top up a short jar with sediment from the next core. A jar is a sample of one core interval, and the moment another core goes into it the result describes neither — worse, it describes a place that does not exist, and a disposal or cleanup decision will be made on it. A short jar is logged short, or the interval is resampled; it is never filled from somewhere else.",
    "knife-toward-hand": "You started to split the core liner with a knife drawn toward the hand holding the tube. Liner plastic is tough and a blade that breaks through it keeps going into whatever is in its path, which here is your own hand and a sediment that may carry anything the profile finds. Liners are opened with the tube cutter on the rack, blade away from the body.",
    "cooler-unsigned": "You went to hand the cooler to the courier to sign later. The relinquish is the moment custody moves from you to them; a cooler that leaves with only one signature has a gap in its record, and a lab result from a sample with a gap in its custody can be — and on contested sites is — thrown out. Both sign, with the time, before the cooler leaves your hands.",
    "coffee-at-bench": "You set your coffee down on the sample bench. Anything open at a bench where contaminated sediment is being mixed collects it, and hand-to-mouth is exactly the route HAZWOPER's hygiene rules close. Food and drink stay outside the bench area, past the wash station, and hands are washed before either.",
  },

  lateNotes: {
    "extruder-crank": "Extrude the core only after its recovery has been measured in the liner — once it is out, the length it came up with can no longer be checked against the drive.",
    "homogenise-paddle": "Homogenise only after the volatile subsample is off the fresh face — mixing first lets the volatiles go before anything has captured them.",
    "temp-blank": "The temperature blank goes in with the filled jars — it is there to say what temperature they travelled at, so it rides with them, not in an empty cooler.",
    "field-log": "The field log is written once the bench is closed out — it records what went to the lab and what was left on the dock.",
  },

  steps: [
    {
      id: "read-sap", kind: "select", target: "sap-binder",
      title: "Read today's page of the sampling and analysis plan",
      cue: "At the binder: which cores and intervals, the analytes, the containers and their order, preservation and holding times, and the laboratory receiving them.",
      why: "The sampling and analysis plan is written under the project's quality assurance plan so that every sample taken on this job is taken the same way and can be compared, and EPA QA/G-5 practice is what makes it the rule rather than a suggestion. The bench works from today's page, because an analyte missed or a container swapped cannot be put right once the core has been mixed.",
    },
    {
      id: "bench-ppe", kind: "sequence", anyOrder: true,
      targets: ["ppe-nitrile", "ppe-glasses", "ppe-apron"],
      itemNames: { "ppe-nitrile": "nitrile gloves, changed between cores", "ppe-glasses": "safety glasses", "ppe-apron": "chemical-resistant apron" },
      title: "Dress for the sample bench",
      cue: "Nitrile gloves — a fresh pair for each core — safety glasses and an apron before any core is opened.",
      why: "The gloves do two jobs: they keep contaminated sediment off the custodian's hands, and changed between cores they keep one core's sediment out of the next core's jars. Glasses matter because sediment flicks off a spoon or a liner edge, and the apron keeps the bench's mess off clothes that go home.",
    },
    {
      id: "check-cores", kind: "find", noHint: true,
      targets: ["cap-cracked", "label-smeared"],
      itemNames: { "cap-cracked": "a core end cap cracked through", "label-smeared": "a core label smeared unreadable" },
      itemNotes: {
        "cap-cracked": "One core's bottom cap has cracked through and the liner has wept water into the tray — the sample has lost pore water and maybe fines, and that goes on the custody form as received, not discovered later.",
        "label-smeared": "The label on the third core has run in the fog and the station number is unreadable. It stays unopened until the coring crew confirms it against their core log.",
      },
      title: "Check the incoming cores against the core log",
      cue: "Before signing anything: every cap on and whole, every label readable and matching the coring crew's log.",
      why: "Signing a custody form says the samples arrived as the form describes them, so the cores are checked first: a cracked cap or a label nobody can read is noted on the form at the hand-off, where it belongs to the coring crew's record. Found after the signature, the same fault belongs to the bench, and the sample's history has a question in it nobody can answer.",
    },
    {
      id: "custody-in", kind: "select", target: "custody-in",
      title: "Sign the cores in from the coring crew",
      cue: "Sign the received line on the coring crew's custody form with the time, noting the cracked cap and the label held for confirmation.",
      why: "This is the first hand-off after the core left the bottom of the Bay, and the received signature is the custodian taking responsibility for exactly what is in the tray. The time and the notes go on with it, because a custody record is only as strong as its weakest transfer, and on a sediment job the data may be argued over long after anyone remembers the day.",
    },
    {
      id: "recovery", kind: "gauge", target: "recovery-tape",
      title: "Measure core recovery against the drive",
      cue: "Run the tape along the sediment in the liner and commit the recovery against the drive length and the plan's acceptance.",
      why: "A core pushed into soft sediment compresses and sometimes loses its bottom, so the length of sediment recovered is measured against how far the tube was driven. The plan says what recovery is acceptable; a core below it may not represent the intervals it was meant to, and that is decided now, before it is cut and mixed and cannot be re-measured.",
      gauge: { label: "RECOVERY", speed: 0.68, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "short against the drive" : t <= 0.58 ? "inside the plan's acceptance" : "tape not on the sediment top"), missNote: "Outside the band — lay the tape from the sediment's top to the base of the liner and read recovery against the drive again." },
    },
    {
      id: "extrude", kind: "turn", target: "extruder-crank",
      title: "Extrude the core onto the tray",
      cue: "Crank the extruder steadily and push the core out of its liner onto the lined tray, top end first as logged.",
      why: "Extruding steadily keeps the core's layers in the order they lay on the bottom of the Bay, which is what the sampling intervals are measured along. A core rammed out in jerks smears one layer into the next, and a core extruded upside down puts every interval in the wrong place without anyone noticing.",
      turn: { turns: 1.5, label: "EXTRUDER", readout: (t) => (t < 0.3 ? "core in the liner" : t < 0.9 ? "extruding — layers intact" : "on the tray, top end logged") },
    },
    {
      id: "voc-subsample", kind: "select", target: "voc-sampler",
      title: "Take the volatile subsample off the fresh face",
      cue: "Before anything is mixed, push the coring syringe into the fresh core face at the plan's interval and cap it straight into its vial.",
      why: "Volatile compounds leave sediment the moment it is disturbed, so the volatile subsample is taken first, from an undisturbed face, with a syringe that goes straight into a sealed vial. Taken after homogenising, it measures what was left after the mixing let the rest escape, which reads low and is worthless as a result.",
    },
    {
      id: "homogenise", kind: "track", target: "homogenise-paddle", seconds: 7,
      title: "Homogenise the interval in the bowl",
      cue: "Mix the interval in the stainless bowl steadily until the colour and texture are even — no splashing, no streaks left.",
      why: "Every jar filled from this interval has to be the same material, or the metals jar and the organics jar describe different sediment. Homogenising steadily to an even colour and texture is how the plan gets that, and it is done in stainless with decontaminated tools because the bowl and the spoon are the only other things the sediment touches.",
      track: { start: 0.12, green: [0.4, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "MIX", readout: (v) => (v < 0.4 ? "still streaked — layers showing" : v > 0.6 ? "splashing over the rim" : "even colour and texture") },
      holdBreakNote: "The mix broke rhythm — either splashing over the rim or leaving streaks. Bring it back to a steady, even mix.",
    },
    {
      id: "fill-jars", kind: "hold", target: "jar-set",
      seconds: 5,
      title: "Fill the jars from the homogenate",
      cue: "Spoon the homogenate into the jars in the plan's order, packed with no headspace, and hold each while the threads are wiped and the lid seated.",
      why: "A jar is filled so that what the lab opens is what left the bowl: packed without air, threads wiped so the lid seals, and the lid seated straight. Sediment on the threads breaks the seal and lets water and volatiles out in transit, which is a lab note that says the sample arrived compromised and a result that carries a qualifier into every report built on it.",
      holdBreakNote: "The lid went on over sediment on the threads. Wipe the threads clean and seat the lid again before the jar goes down.",
    },
    {
      id: "temp-blank", kind: "drag", target: "temp-blank",
      title: "Pack the temperature blank with the jars",
      cue: "Carry the temperature blank from the fridge and seat it in the cooler's well among the filled jars.",
      why: "Samples must travel cold, and the laboratory checks that by measuring the temperature blank when the cooler is opened, not by trusting the ice. The blank rides among the jars, where it takes their temperature, so its reading at the lab is the jars' reading; packed in a corner on top of the ice it proves nothing about the samples.",
      drag: { to: "cooler-well", radius: 0.4, missNote: "Not in the well — the temperature blank sits among the jars, where it will read what they read." },
    },
    {
      id: "custody-out", kind: "sequence",
      targets: ["cooler-ice", "cooler-seal", "custody-out"],
      itemNames: { "cooler-ice": "bagged ice round the jars", "cooler-seal": "custody seals across the lid", "custody-out": "custody form signed by both, with the time" },
      title: "Ice, seal and relinquish the cooler",
      cue: "Bagged ice round the jars, custody seals across the lid, then both you and the courier sign the form with the time.",
      why: "The cooler is iced before it is sealed, because a seal broken to add ice is a seal that has to be explained. The seals across the lid are what the lab checks on arrival, and the relinquish with both signatures and the time is the second hand-off — the one that moves custody off the dock. In that order, every step of the record says the same thing as the cooler.",
      outOfOrderNote: "Out of order — ice first, then the seals across the lid, and the form is signed by both only once the cooler is sealed.",
    },
    {
      id: "bench-close", kind: "find", noHint: true,
      targets: ["rinse-uncovered", "bowl-unwashed"],
      itemNames: { "rinse-uncovered": "the decon rinse bucket left uncovered", "bowl-unwashed": "the mixing bowl put away unwashed" },
      itemNotes: {
        "rinse-uncovered": "The decon rinse water is investigation-derived waste — it holds whatever came off the tools — and an open bucket on a dock is one knock away from the Bay. It is lidded and labelled for handling under the work plan.",
        "bowl-unwashed": "The stainless bowl has gone back in the crate with a film of today's sediment in it; tomorrow's first core would be mixed in it. Every tool is decontaminated before it is packed.",
      },
      title: "Close out the bench",
      cue: "Before the canopy comes down: every tool decontaminated, the rinse water lidded and labelled, nothing left open on the dock.",
      why: "The bench's leftovers are part of the job: decon water carries what came off the tools and is handled as the work plan says, and a tool packed dirty contaminates the next day's first sample. Closing out with a walk finds both before they become a spill report or an unexplained hit in tomorrow's data.",
    },
    {
      id: "field-log", kind: "select", target: "field-log",
      title: "Write the field log",
      cue: "Log the cores received and the cracked cap, the held label, recovery, the volatile vials, the fridge alarm, the unlabelled bag set aside, the cooler, its seals and the relinquish time.",
      why: "The field log is the narrative that the custody forms are the skeleton of: it says why a core was held, what the fridge did and when, and where the unlabelled bag went. A reviewer who finds a qualifier on a result goes to the field log first, and a log written the same day is the only thing that can answer them.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the coring crew",
      cue: "On the radio: the cooler is gone, the held label needs confirming, tomorrow's cores and times, and how the coring crew are after a day on the barge in the fog.",
      why: "The coring crew need to confirm the smeared label against their log before the core can be processed, and they need to know what the bench can take tomorrow. The check-in closes both out loud, and it is also the crew's own — the member assistance line is there for anything that is still with someone after the radio goes quiet.",
    },
  ],

  interrupts: [
    {
      id: "sample-fridge-alarm",
      kind: "Sample fridge temperature alarm",
      after: "homogenise", delay: 3, seconds: 13,
      alert: "The sample fridge is beeping and its lamp has gone red — the door has swung open on its latch and the cores waiting in it are warming.",
      cue: "Shut and latch the fridge door, then check the reading before you go back to the bowl.",
      target: "fridge-door",
      why: "Cores waiting to be processed are held cold for the same reason the cooler is — so what the lab measures is what came off the bottom. An open fridge warms every core in it at once, and the time it was open is something the field log has to record, so the door is shut now and the minutes noted, not after the interval in the bowl is finished.",
      missNote: "The fridge door stayed open while the mixing went on; by the time anyone looked, every core in it had warmed past the plan's limit and had to be logged as compromised.",
      wrongNote: "The fridge door — shut and latch it, then note how long it was open.",
    },
    {
      id: "unlabelled-bag",
      kind: "An unlabelled sample on the bench",
      after: "fill-jars", delay: 2, seconds: 13,
      alert: "Someone from the barge has dropped a zip bag of sediment on the end of your bench — no label, no custody form — and walked off.",
      cue: "Move the bag to the quarantine tray, out of the batch, until someone can say what it is.",
      target: "quarantine-tray",
      why: "A sample with no label and no custody form is not a sample, and on a bench full of jars it is a contamination and a mix-up waiting to happen. It goes to the quarantine tray, apart from the batch, and stays there until the person who took it can document it; nothing from it is jarred on a guess.",
      missNote: "The bag sat on the bench among the jars; someone later assumed it belonged to the last core and jarred it, and a sample of unknown origin went to the lab under that core's number.",
      wrongNote: "The quarantine tray — get the unlabelled bag away from the batch before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BRCC_ACCENT);

    // -------------------------------------------------------- dock and water
    const dock = box(g, 11, 0.1, 6.6, 0, 0.05, -0.3, 0xffffff, { rough: 0.85 });
    dock.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#4a4c4a", base2: "#404240", step: 24 }), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.25, color: 0xd0d0cc });
    box(g, 11, 0.06, 0.1, 0, 0.13, -3.55, CITY.hiVis, { rough: 0.6 });
    const water = box(g, 16, 0.02, 9, 0, 0.004, -8.2, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#16262c", mid: "#1c2f35" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x93a8ae });

    const boat = workboat(g, -1.2, -0.45, -5.2, { ry: Math.PI / 2, livery: { fleetName: "CORING CREW", unitNumber: "CB-2" } });
    void boat;
    const coringHand = standingFigure(g, -3.4, -2.6, { ry: 0.6, cloth: 0x2a3a48, vest: 0xf06a2b, helmet: 0xf2f2ee, gloves: true });
    coringHand.position.y = 0.1;
    holoTag(coringHand, "coring crew hand", 0, 1.95, 0, { css: "#8fb85a", w: 0.34 });

    const van = cargoVan(g, 4.9, 0.1, -2.6, { ry: Math.PI, livery: { fleetName: "LAB COURIER", unitNumber: "C-7" } });
    void van;
    const courier = standingFigure(g, 4.9, 1.45, { ry: -2.8, cloth: 0x3a4a5a, vest: 0x8fb85a });
    courier.position.y = 0.1;
    holoTag(courier, "laboratory courier", 0, 1.95, 0, { css: "#8fb85a", w: 0.34 });

    // ------------------------------------------------------------ canopy
    for (const [x, z] of [[-1.7, -2.1], [1.7, -2.1], [-1.7, 0.1], [1.7, 0.1]]) cyl(g, 0.03, 0.03, 2.3, x, 1.25, z, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(g, 3.6, 0.06, 2.4, 0, 2.42, -1.0, 0x5a7a3a, { rough: 0.8 });

    // ------------------------------------------------------------ the bench
    const bench = group(g, 0, 0.1, -1.1);
    box(bench, 2.6, 0.06, 0.8, 0, 0.88, 0, 0xd8dcdf, { rough: 0.4, metal: 0.3 });
    box(bench, 2.5, 0.85, 0.04, 0, 0.43, -0.36, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    box(bench, 2.4, 0.02, 0.7, 0, 0.92, 0, 0xf2f2ee, { rough: 0.9 });
    // Extruder with a core in it, and the tray.
    const ex = group(bench, -0.85, 0.92, 0);
    box(ex, 0.9, 0.08, 0.14, 0, 0.04, -0.15, 0x5b6771, { rough: 0.5, metal: 0.6 });
    const coreTube = cyl(ex, 0.045, 0.045, 0.8, 0, 0.12, -0.15, 0xdfe6ea, { rough: 0.3, seg: 10 });
    coreTube.rotation.z = Math.PI / 2;
    const crank = group(ex, 0.5, 0.12, -0.15);
    box(crank, 0.03, 0.2, 0.03, 0, 0.1, 0, 0xe8b02e, { rough: 0.5 });
    holoTag(ex, "core extruder", 0, 0.42, -0.15, { css: "#8fb85a", w: 0.28 });
    reg(hits, crank, "extruder-crank");
    const tray = box(ex, 0.8, 0.03, 0.14, 0, 0.02, 0.12, 0x2f4d5f, { rough: 0.6 });
    void tray;
    const coreOut = cyl(ex, 0.04, 0.04, 0.7, 0, 0.07, 0.12, 0x4a3e30, { rough: 0.95, seg: 10 });
    coreOut.rotation.z = Math.PI / 2;
    coreOut.visible = false;
    const tape = group(ex, -0.1, 0.2, -0.26);
    box(tape, 0.8, 0.005, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const tapeFace = decal(tape, 0.16, 0.05, -0.45, 0.02, 0, signFace("RECOVERY", { bg: "#1b1e22", accent: "#8fb85a", fg: "#f2f2ee", scale: 0.5 }), { px: 128 });
    reg(hits, tapeFace, "recovery-tape");
    const voc = group(ex, 0.25, 0.1, 0.12);
    cyl(voc, 0.012, 0.012, 0.12, 0, 0.1, 0, 0xe8edf1, { rough: 0.3, seg: 8 });
    cyl(voc, 0.02, 0.02, 0.05, 0.06, 0.03, 0.05, 0x8fb85a, { rough: 0.4, seg: 8 });
    holoTag(voc, "volatile coring syringe", 0, 0.28, 0, { css: "#8fb85a", w: 0.38 });
    reg(hits, voc, "voc-sampler");
    // Bowl and paddle.
    const bowlGrp = group(bench, 0.1, 0.92, 0.05);
    const bowl = cyl(bowlGrp, 0.2, 0.13, 0.12, 0, 0.06, 0, 0xc0c6cc, { rough: 0.25, metal: 0.85, seg: 16, open: true });
    void bowl;
    const mud = cyl(bowlGrp, 0.17, 0.17, 0.02, 0, 0.08, 0, 0x4a3e30, { rough: 0.95, seg: 16 });
    const paddle = group(bowlGrp, 0.05, 0.1, 0);
    box(paddle, 0.03, 0.3, 0.05, 0, 0.12, 0, 0xc0c6cc, { rough: 0.25, metal: 0.85 });
    holoTag(bowlGrp, "homogenising bowl", 0, 0.46, 0, { css: "#8fb85a", w: 0.34 });
    reg(hits, paddle, "homogenise-paddle");
    // Jars.
    const jars = group(bench, 0.75, 0.92, 0.02);
    const jarMeshes = [];
    for (let i = 0; i < 4; i++) {
      jarMeshes.push(cyl(jars, 0.04, 0.04, 0.1, -0.15 + i * 0.1, 0.05, 0, 0xe6ecef, { rough: 0.2, seg: 10 }));
      cyl(jars, 0.042, 0.042, 0.02, -0.15 + i * 0.1, 0.11, 0, [0xd2312b, 0x2f6fb8, 0x8fb85a, 0xf2c14b][i], { rough: 0.5, seg: 10 });
    }
    holoTag(jars, "sample jars — plan's order", 0, 0.3, 0, { css: "#8fb85a", w: 0.44 });
    reg(hits, jars, "jar-set");
    // Hazards on the bench.
    const nextCore = group(bench, -0.2, 0.92, -0.22);
    cyl(nextCore, 0.045, 0.045, 0.34, 0, 0.05, 0, 0xdfe6ea, { rough: 0.3, seg: 10 }).rotation.z = Math.PI / 2;
    const topHit = box(nextCore, 0.4, 0.2, 0.2, 0, 0.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(nextCore, "top up from the next core?", 0, 0.3, 0, { css: "#e8622a", w: 0.46 });
    reg(hits, topHit, "top-off-jar");
    const knife = group(bench, -1.15, 0.92, 0.25);
    box(knife, 0.18, 0.01, 0.03, 0, 0.01, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    box(knife, 0.1, 0.02, 0.03, -0.13, 0.01, 0, 0x1b1e22, { rough: 0.6 });
    const knifeHit = box(knife, 0.3, 0.15, 0.15, -0.05, 0.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(knife, "slit it toward your hand?", 0, 0.2, 0, { css: "#e8622a", w: 0.44 });
    reg(hits, knifeHit, "knife-toward-hand");
    const cup = group(bench, 1.15, 0.92, 0.26);
    cyl(cup, 0.04, 0.035, 0.11, 0, 0.055, 0, 0xf2f2ee, { rough: 0.6, seg: 10 });
    const cupHit = box(cup, 0.2, 0.2, 0.2, 0, 0.08, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cup, "coffee on the bench?", 0, 0.24, 0, { css: "#e8622a", w: 0.36 });
    reg(hits, cupHit, "coffee-at-bench");
    // The unlabelled bag, off until it lands.
    const strayBag = box(bench, 0.16, 0.05, 0.12, 1.1, 0.95, -0.15, 0x6a5a44, { rough: 0.8 });
    strayBag.visible = false;

    // --------------------------------------------------- incoming core rack
    const rack = group(g, -2.5, 0.1, -0.7, 0.3);
    box(rack, 0.5, 0.8, 1.0, 0, 0.4, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    const cores = [];
    for (let i = 0; i < 3; i++) cores.push(cyl(rack, 0.045, 0.045, 0.9, -0.1 + i * 0.1, 0.86, 0, 0xdfe6ea, { rough: 0.3, seg: 10 }));
    for (const c of cores) c.rotation.x = Math.PI / 2;
    const crack = box(rack, 0.1, 0.1, 0.03, -0.1, 0.86, 0.47, 0xd2312b, { rough: 0.6, emissive: 0x3a0806, ei: 0.4 });
    reg(hits, crack, "cap-cracked");
    const smear = decal(rack, 0.1, 0.08, 0.1, 0.92, 0.1, (cx, w, h) => { cx.fillStyle = "#e8e2d0"; cx.fillRect(0, 0, w, h); cx.fillStyle = "rgba(40,60,120,0.6)"; for (let i = 0; i < 6; i++) cx.fillRect(Math.random() * w, Math.random() * h, w * 0.5, 3); }, { px: 64 });
    smear.rotation.x = -Math.PI / 2;
    reg(hits, smear, "label-smeared");
    holoTag(rack, "incoming cores", 0, 1.15, 0, { css: "#8fb85a", w: 0.3 });
    const cocIn = decal(g, 0.22, 0.28, -1.95, 1.0, 0.15, paperFace("CUSTODY — CORING CREW", ["Relinquished: coring", "Received: —", "Time: —", "Notes: —"], { bg: "#f2efe6", band: "#8fb85a" }), { px: 192 });
    cocIn.rotation.y = 0.5;
    box(g, 0.3, 0.9, 0.3, -1.95, 0.55, 0.0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    reg(hits, cocIn, "custody-in");

    // ------------------------------------------------------------ fridge
    const fridge = group(g, -2.3, 0.1, -2.2, 0.5);
    box(fridge, 0.7, 1.1, 0.6, 0, 0.55, 0, 0xe8edf1, { rough: 0.5 });
    const door = group(fridge, -0.35, 0.55, 0.31);
    box(door, 0.7, 1.08, 0.04, 0.35, 0, 0, 0xdfe6ea, { rough: 0.45 });
    const fridgeLamp = ball(fridge, 0.03, 0.25, 1.02, 0.33, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(fridge, "sample fridge", 0, 1.32, 0, { css: "#8fb85a", w: 0.3 });
    reg(hits, door, "fridge-door");
    const blank = group(fridge, 0.2, 1.12, 0.1);
    cyl(blank, 0.03, 0.03, 0.1, 0, 0.05, 0, 0x2f6fb8, { rough: 0.4, seg: 10 });
    holoTag(blank, "temperature blank", 0, 0.24, 0, { css: "#8fb85a", w: 0.32 });
    reg(hits, blank, "temp-blank");

    // ----------------------------------------- cooler table and quarantine
    const side = group(g, 2.0, 0.1, -0.5, -0.4);
    box(side, 0.9, 0.05, 0.6, 0, 0.72, 0, 0x6b5a48, { rough: 0.8 });
    box(side, 0.8, 0.7, 0.04, 0, 0.35, -0.25, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    const cooler = group(side, 0, 0.75, 0.02);
    box(cooler, 0.5, 0.3, 0.34, 0, 0.15, 0, 0x2f6fb8, { rough: 0.55 });
    const lid = box(cooler, 0.52, 0.04, 0.36, 0, 0.32, -0.1, 0xe8edf1, { rough: 0.55 });
    lid.rotation.x = -0.9;
    const well = group(cooler, 0, 0.3, 0);
    hits["cooler-well"] = well;
    const ice = box(cooler, 0.44, 0.06, 0.28, 0, 0.3, 0, 0xdfeef6, { rough: 0.3 });
    ice.visible = false;
    const iceBag = group(side, -0.36, 0.75, 0.15);
    box(iceBag, 0.18, 0.1, 0.14, 0, 0.05, 0, 0xdfeef6, { rough: 0.3 });
    holoTag(iceBag, "bagged ice", 0, 0.24, 0, { css: "#8fb85a", w: 0.22 });
    reg(hits, iceBag, "cooler-ice");
    const seals = group(side, 0.36, 0.75, 0.18);
    box(seals, 0.12, 0.02, 0.08, 0, 0.01, 0, 0xd2312b, { rough: 0.6 });
    holoTag(seals, "custody seals", 0, 0.18, 0, { css: "#8fb85a", w: 0.26 });
    reg(hits, seals, "cooler-seal");
    const sealOnLid = box(cooler, 0.06, 0.12, 0.005, 0.18, 0.2, 0.172, 0xd2312b, { rough: 0.6 });
    sealOnLid.visible = false;
    const cocOut = decal(g, 0.22, 0.28, 2.75, 1.1, 0.35, paperFace("CUSTODY — TO LAB", ["Relinquished: —", "Received: —", "Time: —", "Seals: —"], { bg: "#f2efe6", band: "#8fb85a" }), { px: 192 });
    cocOut.rotation.y = -0.7;
    box(g, 0.3, 0.95, 0.3, 2.85, 0.57, 0.22, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    reg(hits, cocOut, "custody-out");
    const handHit = box(g, 0.5, 0.5, 0.4, 3.6, 0.9, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "hand it over, sign later?", 3.6, 1.3, 0.6, { css: "#e8622a", w: 0.44 });
    reg(hits, handHit, "cooler-unsigned");
    const quarantine = group(g, 1.3, 0.1, -2.4);
    box(quarantine, 0.6, 0.9, 0.4, 0, 0.45, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    const qTray = box(quarantine, 0.5, 0.06, 0.34, 0, 0.93, 0, 0xf2c14b, { rough: 0.6 });
    void qTray;
    const qBag = box(quarantine, 0.16, 0.05, 0.12, 0, 0.99, 0, 0x6a5a44, { rough: 0.8 });
    qBag.visible = false;
    holoTag(quarantine, "quarantine tray", 0, 1.22, 0, { css: "#8fb85a", w: 0.3 });
    reg(hits, quarantine, "quarantine-tray");

    // ------------------------------------------------------ decon station
    const decon = group(g, -0.6, 0.1, -2.7);
    const rinse = cyl(decon, 0.16, 0.14, 0.36, 0, 0.18, 0, 0x2f6fb8, { rough: 0.6, seg: 12 });
    void rinse;
    const rinseLid = cyl(decon, 0.17, 0.17, 0.03, 0, 0.38, 0, 0x2f6fb8, { rough: 0.6, seg: 12 });
    rinseLid.visible = false;
    const rinseOpen = cyl(decon, 0.14, 0.14, 0.01, 0, 0.35, 0, 0x5a6a5a, { rough: 0.2, emissive: 0x1a2a10, ei: 0.3, seg: 12 });
    reg(hits, rinseOpen, "rinse-uncovered");
    const crate = group(decon, 0.55, 0, 0.1);
    box(crate, 0.4, 0.26, 0.3, 0, 0.13, 0, 0x5a4a38, { rough: 0.85 });
    const dirtyBowl = cyl(crate, 0.15, 0.1, 0.08, 0, 0.3, 0, 0x8a7a64, { rough: 0.6, metal: 0.5, seg: 12 });
    reg(hits, dirtyBowl, "bowl-unwashed");
    holoTag(decon, "decon station", 0.25, 0.7, 0, { css: "#8fb85a", w: 0.28 });

    // ------------------------------------------ PPE, binder, log, radio
    const ppe = group(g, -2.3, 0.1, 1.2, 0.6);
    box(ppe, 0.9, 0.05, 0.4, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(ppe, 0.8, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["ppe-nitrile", -0.28, 0x3a6fd8, "NITRILE"], ["ppe-glasses", 0, 0x1b1e22, "GLASSES"], ["ppe-apron", 0.28, 0x8fb85a, "APRON"]]) {
      const it = group(ppe, dx, 0.8, 0);
      box(it, 0.2, 0.08, 0.16, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.18, 0.05, 0, 0.041, 0, signFace(label, { bg: "#0d1c24", accent: "#8fb85a", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const sap = decal(g, 0.46, 0.34, -1.0, 1.2, 1.6, paperFace("SAMPLING & ANALYSIS PLAN", ["Cores: stations 4–6, intervals per plan", "Volatiles: fresh face, first", "Jars: plan's order, no headspace", "Hold: cold, temperature blank", "Custody: every hand-off signed"], { bg: "#eef2e6", band: "#8fb85a" }), { px: 320 });
    sap.rotation.y = 0.3;
    cyl(g, 0.03, 0.035, 1.0, -1.0, 0.6, 1.58, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, sap, "sap-binder");
    const logBoard = decal(g, 0.46, 0.34, 1.3, 1.2, 1.6, paperFace("FIELD LOG", ["Cores in: —", "Samples: —", "Cooler out: —", "Remarks: —"], { bg: "#eef2e6", band: "#6b7178" }), { px: 256 });
    logBoard.rotation.y = -0.3;
    cyl(g, 0.03, 0.035, 1.0, 1.3, 0.6, 1.58, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "field-log");
    const radioPost = group(g, 0.2, 0.1, 2.0);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "crew radio", 0, 1.3, 0, { css: "#8fb85a", w: 0.24 });
    reg(hits, radioBody, "crew-radio");

    const waterTex = water.material.map;
    let mixA = 0;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -1.1),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "check-cores") { crack.material = mat(0xf2c14b, { rough: 0.6 }); }
        if (step.id === "custody-in") repaint(cocIn, paperFace("CUSTODY — CORING CREW", ["Relinquished: coring", "Received: signed", "Time: logged", "Notes: cap cracked · label held"], { bg: "#f2efe6", band: "#59c97b" }));
        if (step.id === "extrude") { coreTube.visible = false; coreOut.visible = true; }
        if (step.id === "voc-subsample") voc.visible = false;
        if (step.id === "homogenise") mud.material = mat(0x5a4a38, { rough: 0.95 });
        if (step.id === "fill-jars") for (const j of jarMeshes) j.material = mat(0x5a4a38, { rough: 0.6 });
        if (step.id === "temp-blank") { blank.visible = false; }
        if (step.id === "custody-out") {
          ice.visible = true; lid.rotation.x = 0; lid.position.z = 0; sealOnLid.visible = true;
          repaint(cocOut, paperFace("CUSTODY — TO LAB", ["Relinquished: signed", "Received: courier signed", "Time: logged", "Seals: intact, 2"], { bg: "#f2efe6", band: "#59c97b" }));
        }
        if (step.id === "bench-close") { rinseOpen.visible = false; rinseLid.visible = true; dirtyBowl.material = mat(0xc0c6cc, { rough: 0.25, metal: 0.85 }); }
        if (step.id === "field-log") repaint(logBoard, paperFace("FIELD LOG", ["Cores in: 3 · 1 held", "Samples: volatiles + 4 jars", "Cooler out: sealed · signed", "Fridge alarm · stray bag set aside"], { bg: "#eef2e6", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "sample-fridge-alarm") { door.rotation.y = -1.1; fridgeLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0 }); }
        if (it.id === "unlabelled-bag") strayBag.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sample-fridge-alarm") { door.rotation.y = 0; fridgeLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (it.id === "unlabelled-bag") { strayBag.visible = false; qBag.visible = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.005; waterTex.offset.y = t * 0.002; }
        if (session?.turn && step?.id === "extrude") crank.rotation.z = session.turn.amount * Math.PI * 2;
        if (step?.id === "homogenise") { mixA += dt * (1 + (session.track?.v ?? 0) * 4); paddle.position.set(Math.cos(mixA) * 0.08, 0.1, Math.sin(mixA) * 0.08); }
        void CITY;
      },
    };
  },
};
