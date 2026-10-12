import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles,
  ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dental Laboratory Bench VR — Dental & Oral Health.
//
// The laboratory technician's bench, which is the dental career furthest from
// a patient's mouth and closest to a machine shop: an impression that arrives
// contaminated and is disinfected to its own manufacturer's time before it is
// touched, stone measured by ratio instead of by eye and mixed under vacuum,
// a model poured on a vibrator and separated only when it has set, a trimmer
// run wet behind its guard, a polishing lathe with its shield down and no
// glove or sleeve anywhere near the wheel, pumice that is changed rather than
// shared between cases, and a thermoformed tray made to the prescription the
// dentist actually wrote.
//
// The credential named is the National Board for Certification in Dental
// Laboratory Technology's Certified Dental Technician, and the dust rules are
// OSHA's respirable crystalline silica standard and NIOSH's guidance. Nothing
// here invents a clause number.

const DLB_ACCENT = 0xc8a6e0;
const DLB_BENCH = 0x9e8f7c;
const DLB_STONE = 0xe8dfc8;

export const SIM_DENTAL_LAB_BENCH = {
  id: "dental-lab-bench",
  index: "216",
  domain: "Dental",
  trade: "Dental laboratory technician (CDT)",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "The National Board for Certification in Dental Laboratory Technology's Certified Dental Technician (CDT) credential and the National Association of Dental Laboratories as the trade's body; the state dental practice act, which requires a written prescription from the dentist for every case a laboratory makes; the CDC's Guidelines for Infection Control in Dental Health-Care Settings for handling incoming impressions and outgoing cases; the FDA's device requirements for what a laboratory fabricates; OSHA 29 CFR 1910.1053 respirable crystalline silica, 1910.212 machine guarding, 1910.1200 hazard communication and NIOSH's dust-control guidance; SEIU and UFCW clinic and laboratory staff agreements",
  name: "Dental Laboratory Bench",
  title: simTitle("Dental Laboratory Bench"),
  tagline: "The lab bench as a trade: impressions disinfected to time, stone mixed by ratio under vacuum, models poured and trimmed wet, a lathe behind its shield, pumice changed per case and a tray made to the written prescription",
  accent: DLB_ACCENT,
  accentCss: "#c8a6e0",
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "case-made-right", name: "Case Made Right", note: "One case carried from a disinfected impression to a finished tray with the dust controlled and the prescription honoured" },

  game: system({
    name: "Bench Craft",
    currency: "CASE",
    ranks: ["Lab Apprentice", "Bench Technician", "Certified Dental Technician", "Laboratory Lead", "Bench Craft Certified"],
    badges: [
      { id: "disinfected-on-arrival", name: "Disinfected On Arrival", note: "The impression was disinfected to its own time before anything was poured", test: AWARD.stepClean("disinfect-impression") },
      { id: "dust-controlled", name: "Dust Controlled", note: "No unsafe action anywhere on the bench", test: AWARD.safe },
      { id: "ratio-by-measure", name: "Ratio By Measure", note: "Water and powder committed inside the band rather than guessed", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-case", name: "Clean Case", note: "No corrections anywhere in the case", test: AWARD.clean },
      { id: "held-the-mix", name: "Held The Mix", note: "Both timed passages carried without a break", test: AWARD.unbroken },
      { id: "case-on-time", name: "Case On Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dlb-dry-trimming": "That model is being ground on the trimmer with the water off. Dental stone and investment are silica-bearing, and dry grinding is how respirable crystalline silica gets into the air of a laboratory — OSHA's silica standard exists because that dust causes irreversible lung disease, and the water feed on the trimmer is the engineering control that stops it ever becoming airborne.",
    "dlb-glove-at-lathe": "A gloved hand and a loose sleeve are reaching over the polishing wheel. A lathe has no clutch and no pain reflex: a glove finger or a cuff that touches the wheel is pulled in with the whole hand behind it, which is why the lathe is worked with bare hands, sleeves fastened, hair tied and nothing loose anywhere near the spindle.",
    "dlb-undisinfected-impression": "That impression has come out of the courier bag and gone straight onto the bench. Anything arriving from an operatory has been in a patient's mouth and has not been decontaminated by the journey — the CDC's dental guidelines put disinfection at the point the case is received, because after that it has already touched everything you touch.",
    "dlb-shared-pumice": "The pumice in that pan has been used across every case on the bench today. Wet pumice is an ideal carrier: contamination from one case is worked into the surface of the next appliance by the same wheel, and the fix is trivial — fresh slurry in a disinfected pan for each case, which is exactly why nobody does it when they are behind.",
  },

  lateNotes: {
    "dlb-impression": "Not yet. There is no mix to pour, and an impression lifted out of the bath before its time has been disinfected for less time than its own label calls for.",
    "dlb-blank-sheet": "Hold that. There is no model to form over yet, and a thermoformed sheet pulled over an empty platform is a wasted blank and a wasted heat cycle.",
    "dlb-case-log": "The case is not finished. The record is written from what was actually made and measured, at the end of the bench work.",
  },

  steps: [
    {
      id: "receive-case", kind: "select", target: "dlb-case-pan",
      title: "Receive the case into its own pan",
      cue: "Take the case into a labelled pan with its prescription, and treat everything in it as contaminated.",
      why: "A case arriving from an operatory is an impression, a bite registration and a written prescription, and all of it has been in or near a patient's mouth. Keeping it in one labelled pan means nothing gets separated from the prescription that says what to make, and treating the pan as contaminated until the impression has been disinfected keeps the boundary somewhere you can actually see it.",
    },
    {
      id: "disinfect-impression", kind: "hold", target: "dlb-disinfect-bath", seconds: 6,
      title: "Disinfect the impression for its own stated time",
      cue: "Rinse the debris off, immerse or spray to the product's instructions, and hold for that time — no longer.",
      why: "Two rules collide here and both matter. An impression must be disinfected before anyone works on it, because it carries saliva and blood into a room with no patient in it; and an impression left in disinfectant past the time its own manufacturer states absorbs water and distorts, so the model poured from it fits nothing. The stated time is a maximum as much as a minimum.",
      holdBreakNote: "Taken out early. The impression has not had the contact time the product's own instructions call for, so nothing that follows happens on a decontaminated surface.",
    },
    {
      id: "measure-ratio", kind: "gauge", target: "dlb-water-powder",
      title: "Measure the water and powder by ratio",
      cue: "Weigh the stone and measure the water to the ratio on the box, and commit inside the band.",
      gauge: {
        label: "WATER : POWDER", speed: 0.6, green: [0.4, 0.58],
        readout: (t) => (t < 0.4 ? "too dry — crumbly, unreadable detail" : t > 0.58 ? "too wet — weak, chalky model" : "at the stated ratio"),
        missNote: "Off the stated ratio. Too little water gives a mix too thick to flow into the detail; too much gives a model soft enough to abrade under a finger, and either way the fit of everything built on it is already wrong.",
      },
      why: "The strength, setting time and dimensional accuracy of dental stone are all properties of one number: the water-powder ratio the manufacturer states. Mixed by eye it is never that number, and the model that results is either too weak to trim or too thick to have flowed into the detail — and nothing later in the case can recover accuracy that was lost in a mixing bowl.",
    },
    {
      id: "vacuum-mix", kind: "track", target: "dlb-vacuum-mixer", seconds: 7,
      title: "Mix under vacuum at a steady speed",
      cue: "Run the vacuum mixer and keep the spatulation speed inside the band for the whole mix.",
      why: "Vacuum mixing pulls the air out of the slurry, and air is what becomes a bubble on a cusp tip or a void under a margin. Speed matters in both directions: too slow and the powder is not fully wetted before the stone starts to set, too fast and the mix is whipped and heats, shortening the working time you were counting on to pour a whole arch.",
      track: {
        start: 0.16, green: [0.38, 0.6], rise: 0.5, fall: 0.44, drift: 0.12, label: "SPATULATION",
        readout: (v) => (v < 0.38 ? "too slow — powder not wetted" : v > 0.6 ? "too fast — whipped and warming" : "smooth, deaerated mix"),
      },
      holdBreakNote: "The mix speed left the band. Settle it back inside and carry the rest of the mix there — an uneven mix sets unevenly.",
    },
    {
      id: "vibrator-amplitude", kind: "turn", target: "dlb-vibrator-dial",
      title: "Set the vibrator to a low amplitude",
      cue: "Wind the vibrator down to a gentle setting before the impression goes on it.",
      turn: { turns: 1.0, axis: "y", label: "VIBRATOR" },
      why: "A vibrator is there to walk the stone into the deepest part of the impression and to float trapped air up out of it, and that only happens at low amplitude. Turned up, the vibration throws the mix around the impression instead of moving it forward, tears the finer detail off a wet surface and drives air in rather than out.",
    },
    {
      id: "pour-model", kind: "drag", target: "dlb-impression",
      title: "Pour the model from one corner",
      cue: "Set the impression on the vibrator platform and run the stone in from one corner in small increments.",
      why: "Stone poured in from one corner and allowed to flow across the impression pushes the air ahead of it and out; dumped in all at once it traps air in the exact places the model matters most, which are the deep, narrow parts — the cusp tips and the margins. Small increments from one place is the only pouring technique that reliably produces a bubble-free model.",
      drag: { to: "dlb-vibrator-slot", radius: 0.4, missNote: "Not on the platform. Seat the impression squarely on the vibrator so the stone flows where the vibration is, not off the edge of the tray." },
    },
    {
      id: "separate-model", kind: "select", target: "dlb-separate-model",
      title: "Separate the model only when it has set",
      cue: "Wait out the setting time on the box before you lift the impression off.",
      why: "Dental stone reaches its handling strength at the time its manufacturer states, and the last part to get there is the fine detail at the tooth surfaces. Separated early, the cusp tips and margins come away inside the impression rather than staying on the model, and the damage is invisible until something is built on it that does not fit.",
    },
    {
      id: "start-trimmer", kind: "sequence",
      targets: ["dlb-trimmer-guard", "dlb-trimmer-water", "dlb-trimmer-switch"],
      itemNames: { "dlb-trimmer-guard": "guard down", "dlb-trimmer-water": "water on", "dlb-trimmer-switch": "then power" },
      outOfOrderNote: "Out of order. Guard down, water running, and only then the switch — a trimmer started dry or unguarded has already thrown dust and grit before anyone can reach the controls again. Reset and take them in that order.",
      title: "Start the model trimmer in order",
      cue: "Guard down, water flowing, then switch on.",
      why: "The order is the control. The guard has to be in place before there is anything spinning behind it, and the water has to be running before the wheel touches stone, because the first second of dry grinding is the second that puts silica in the air. Started in any other order the machine is briefly doing exactly what all the guarding exists to prevent.",
    },
    {
      id: "lathe-faults", kind: "find", noHint: true,
      targets: ["dlb-cracked-wheel", "dlb-loose-chuck"],
      itemNames: { "dlb-cracked-wheel": "a cracked polishing wheel", "dlb-loose-chuck": "a chuck that has not been tightened" },
      itemNotes: {
        "dlb-cracked-wheel": "There is a split running in from the rim of this wheel. At lathe speed a cracked wheel comes apart and leaves in pieces along the plane it was spinning in, which is straight at whoever is standing at the machine.",
        "dlb-loose-chuck": "This chuck is finger-tight only. A mandrel that works loose under load walks out of the spindle with the wheel still turning, and it takes the appliance in your fingers with it.",
      },
      title: "Find the two faults on the lathe before it is switched on",
      cue: "Two things on this lathe will fail the moment it is under load. Find them.",
      why: "A polishing lathe spins fast, has a lot of rotating mass and nothing to stop it once it is going, so the whole inspection happens before the switch. A cracked wheel and an untightened chuck are both plainly visible standing still and both entirely invisible at speed — they announce themselves by failing, and OSHA's machine guarding requirements exist because that failure is always in someone's direction.",
    },
    {
      id: "dust-controls", kind: "sequence", anyOrder: true,
      targets: ["dlb-extraction-hood", "dlb-respirator", "dlb-face-shield"],
      itemNames: { "dlb-extraction-hood": "local extraction on", "dlb-respirator": "fit-tested respirator", "dlb-face-shield": "full face shield" },
      itemNotes: {
        "dlb-extraction-hood": "The hood captures dust at the point it is generated, which is the only place it can be captured before it is in the room's air.",
        "dlb-respirator": "A fit-tested respirator, because extraction is never total on a hand-held workpiece and the residue is respirable silica.",
        "dlb-face-shield": "A shield rather than glasses: a lathe throws pumice slurry and, on a bad day, the fragments of a wheel.",
      },
      title: "Set the dust and face controls before polishing",
      cue: "Extraction on at the hood, respirator fitted, face shield down — order doesn't matter.",
      why: "Polishing and grinding acrylic, stone and alloy is the part of this trade that carries a long-term health cost rather than an immediate one, which is exactly why it gets skipped. Local extraction at the source, a fit-tested respirator for what the extraction misses, and a shield for what the wheel throws: OSHA's silica standard treats the first as the primary control and the respirator as what sits on top of it, never instead.",
    },
    {
      id: "lathe-shield", kind: "select", target: "dlb-lathe-shield",
      title: "Work behind the lathe's own shield",
      cue: "Bring the shield down and keep your hands below the spindle line.",
      why: "The shield is between your face and the plane the wheel would leave in, and hands below the spindle line means the wheel throws slurry and debris downward and away rather than up into your eyes. Both of those are habits rather than fittings: the shield only works when it is down, and a technician who reaches over the top of it has removed the guard without touching it.",
    },
    {
      id: "fresh-pumice", kind: "select", target: "dlb-pumice-pan",
      title: "Change to fresh pumice for this case",
      cue: "Empty the pan, disinfect it, and mix fresh slurry before this appliance touches the wheel.",
      why: "Wet pumice shared between cases is a transport medium — one case's contamination gets worked into the surface of the next appliance by the same wheel, and that appliance is going into somebody's mouth. A pan emptied and disinfected between cases with fresh slurry mixed in it costs a couple of minutes and is the only version of polishing that does not undo the disinfection at both ends of the job.",
    },
    {
      id: "form-tray", kind: "drag", target: "dlb-blank-sheet",
      title: "Thermoform the tray over the model",
      cue: "Load the blank into the former's frame over the model and pull it down.",
      why: "A thermoformed tray is only as good as the model under it and the sheet chosen for the job: too thin and it tears at the incisal edges, too thick and it will not seat. Loaded square in the frame over a properly trimmed model, the sheet draws down into the detail and comes off as an appliance that matches the mouth it was made from rather than one that needs adjusting in the chair.",
      drag: { to: "dlb-former-slot", radius: 0.4, missNote: "Not seated in the frame. A blank clamped crooked draws down unevenly and comes off thin on one side — set it square before the heater comes over it." },
    },
    {
      id: "prescription-checkin", kind: "select", target: "dlb-prescription-checkin",
      title: "Check the finished case against the prescription with the laboratory lead",
      cue: "Read the dentist's written prescription back against what you have made, with the lead.",
      why: "A laboratory works from a written prescription from the dentist, which every state practice act requires and which is the only document that says what was actually ordered — material, design, shade, date wanted. Reading it back against the finished case with the lead is what catches the case made correctly to the wrong instruction, which is by far the most common way a technically perfect appliance comes back from a surgery.",
    },
    {
      id: "case-log", kind: "select", target: "dlb-case-log",
      title: "Close the case record and disinfect the case out",
      cue: "Record the materials and lots, note the disinfection in and out, and bag the case for return.",
      why: "The record closes the loop the prescription opened: what was made, from which material and lot, by whom, and that the case was disinfected both on arrival and before it went back. The outgoing disinfection is the half people forget — an appliance that has been handled all day on a bench goes back into a patient's mouth, and the record is what says somebody dealt with that.",
    },
  ],

  interrupts: [
    {
      id: "dlb-over-immersed",
      kind: "Material distortion",
      after: "disinfect-impression", delay: 3, seconds: 12,
      alert: "The impression has been sitting in the disinfectant well past the time on the bottle and the material is visibly swelling.",
      cue: "Get it out and rinsed before the swelling is built into the model.",
      target: "dlb-rinse-station",
      why: "Hydrocolloid and several other impression materials absorb water, so immersion beyond the manufacturer's stated time swells the impression and every dimension taken from it afterwards is wrong. The answer is the rinse station: out, rinsed, drained, and poured — an over-immersed impression cannot be corrected later, only re-taken.",
      missNote: "The impression stayed in the bath. Everything poured from it will be dimensionally wrong in a way no measurement on the bench will reveal, and the fault will surface as an appliance that does not seat — which means the patient is recalled for a new impression and the whole case is made twice.",
      wrongNote: "It is the rinse station. Out of the bath, rinsed and drained, and pour it now — time in disinfectant is a maximum, not just a minimum.",
    },
    {
      id: "dlb-extraction-off",
      kind: "Dust control failure",
      after: "vacuum-mix", delay: 3, seconds: 11,
      alert: "The extraction has been switched off at the wall and someone on the next bench is grinding a model dry — the room is filling with dust.",
      cue: "The extraction comes back on before anyone takes another breath in here.",
      target: "dlb-extraction-switch",
      why: "Respirable silica does not smell, does not sting and does not make anyone cough on the day, which is why an extraction system that has been switched off at the wall can stay off for a whole shift. OSHA's silica standard puts engineering controls first precisely because the exposure is invisible; the switch is the control, and it is on the wall rather than on the machine.",
      missNote: "The extraction stayed off while the bench kept working. Nobody in the room noticed anything at all — that is the entire nature of a silica exposure, and the dose from a shift like this is added to every other shift like it for the rest of a career.",
      wrongNote: "It is the wall switch for the extraction. Nothing else in this room removes dust from the air once it is airborne.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, DLB_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#c4c0b4", base2: "#b9b5aa", seam: "rgba(0,0,0,0.13)",
    }), { repeat: 4, px: 256 });
    const benchTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 5, px: 256 });

    const floorPlate = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xc4c0b4, { radius: 0.05, cast: false });
    floorPlate.material = texturedMat(floorTex, { rough: 0.78, metal: 0.03, color: 0xcdc9bd });

    // --------------------------------------------------------- the receiving bay
    const receiving = group(g, -2.35, 0, 1.0, 0.7);
    box(receiving, 1.3, 0.88, 0.58, 0, 0.44, 0, DLB_BENCH, { rough: 0.7, metal: 0.05 });
    const receivingTop = slab(receiving, 1.36, 0.05, 0.62, 0, 0.9, 0, 0xb8b2a4, { radius: 0.01, rough: 0.6 });
    void receivingTop;
    decal(receiving, 0.5, 0.1, 0, 0.64, 0.3, signFace("CASES IN — DISINFECT HERE", { bg: "#4a3f30", accent: "#f2e2b8", scale: 0.28 }), { px: 256 });

    const casePan = group(receiving, -0.4, 0.93, 0.02, 0.2);
    box(casePan, 0.3, 0.07, 0.22, 0, 0.035, 0, 0x6f5ba8, { rough: 0.55 });
    box(casePan, 0.26, 0.02, 0.18, 0, 0.07, 0, 0x5a4a8c, { rough: 0.6 });
    const rxSheet = decal(casePan, 0.14, 0.18, 0.08, 0.075, 0,
      paperFace("LAB Rx", ["Bleaching tray", "Upper, 1.0 mm", "Dentist signature"], { band: "#c8a6e0" }), { px: 192 });
    rxSheet.rotation.x = -Math.PI / 2;
    holoTag(casePan, "case pan + prescription", 0, 0.2, 0, { css: "#c8a6e0", w: 0.56 });
    reg(hits, casePan, "dlb-case-pan");

    // The disinfection bath with a timer, and the rinse station beside it.
    const bath = group(receiving, 0.12, 0.93, 0.02);
    box(bath, 0.3, 0.14, 0.24, 0, 0.07, 0, 0x2f6f8c, { rough: 0.4, metal: 0.15 });
    const bathFluid = box(bath, 0.27, 0.02, 0.21, 0, 0.13, 0, 0x8fd6c4, { rough: 0.15, metal: 0.1, opacity: 0.6, transparent: true, cast: false });
    ownMaterial(bathFluid);
    const bathTimer = decal(bath, 0.12, 0.05, 0, 0.09, 0.122, signFace("10:00", { bg: "#0f2a33", accent: "#9fe8c0", scale: 0.5 }), { px: 160 });
    holoTag(bath, "disinfection bath", 0, 0.24, 0, { css: "#c8a6e0", w: 0.46 });
    reg(hits, bath, "dlb-disinfect-bath");

    // The impression that will be poured, floating in the bath.
    const impression = group(bath, 0, 0.12, 0);
    const impressionTray = torus(impression, 0.07, 0.022, 0, 0, 0, 0xcfd6db, { rough: 0.45, metal: 0.3, seg: 8, seg2: 20 });
    impressionTray.rotation.x = Math.PI / 2;
    impressionTray.scale.set(1, 1, 0.65);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ball(impression, 0.011, Math.cos(a) * 0.07, 0.012, Math.sin(a) * 0.045, 0xd8a8c4, { rough: 0.6, seg: 8 });
    }
    holoTag(impression, "impression", 0, 0.08, 0, { css: "#c8a6e0", w: 0.34 });
    reg(hits, impression, "dlb-impression");

    const rinse = group(receiving, 0.48, 0.9, 0.02);
    cyl(rinse, 0.13, 0.13, 0.14, 0, 0, 0, 0xdfe4e8, { rough: 0.25, metal: 0.35, seg: 18, open: true, side: 2 });
    const tap = cyl(rinse, 0.014, 0.014, 0.26, 0, 0.16, -0.14, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    tap.rotation.x = -0.4;
    torus(rinse, 0.03, 0.008, 0, 0.26, -0.11, CITY.steel, { rough: 0.3, metal: 0.85, seg: 6, seg2: 14 });
    holoTag(rinse, "rinse station", 0, 0.34, 0, { css: "#c8a6e0", w: 0.4 });
    reg(hits, rinse, "dlb-rinse-station");
    const rinseJet = cyl(rinse, 0.004, 0.006, 0.16, 0, 0.06, -0.06, 0xbfe4f2, { emissive: 0xbfe4f2, ei: 0.4, rough: 0.2, opacity: 0.55, transparent: true, seg: 8, cast: false });
    rinseJet.visible = false;

    // The impression that never saw the bath — the hazard.
    const dirtyImpression = group(g, -1.55, 0, 1.75, -0.3);
    const courierBag = box(dirtyImpression, 0.22, 0.14, 0.1, 0, 0.98, 0, 0xb8b09c, { rough: 0.8 });
    const bareTray = torus(dirtyImpression, 0.06, 0.02, 0.0, 1.06, 0.09, 0xc4a0b8, { rough: 0.6, seg: 8, seg2: 18 });
    bareTray.rotation.x = Math.PI / 2;
    bareTray.scale.set(1, 1, 0.65);
    for (const sx of [-1, 1]) cyl(dirtyImpression, 0.016, 0.016, 0.92, sx * 0.08, 0.46, 0, 0x6f7a83, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(dirtyImpression, "straight out of the bag", 0, 1.18, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, dirtyImpression, "dlb-undisinfected-impression");
    void courierBag;

    // ------------------------------------------------------------ the pour bench
    const pourBench = group(g, -0.3, 0, -2.0, 0);
    box(pourBench, 1.9, 0.88, 0.6, 0, 0.44, 0, DLB_BENCH, { rough: 0.7, metal: 0.05 });
    const pourTop = slab(pourBench, 1.96, 0.05, 0.64, 0, 0.9, 0, 0xb6bec4, { radius: 0.01 });
    pourTop.material = texturedMat(benchTex, { rough: 0.5, metal: 0.35, color: 0xb6bec4 });
    for (let i = 0; i < 4; i++) {
      box(pourBench, 0.42, 0.24, 0.02, -0.7 + i * 0.47, 0.64, 0.31, 0x8d8474, { rough: 0.65 });
      box(pourBench, 0.14, 0.018, 0.018, -0.7 + i * 0.47, 0.64, 0.33, 0x8d959d, { rough: 0.3, metal: 0.8 });
    }

    // Stone bin and the measuring set.
    const stoneBin = group(pourBench, -0.76, 0.92, 0.02, 0.15);
    cyl(stoneBin, 0.1, 0.09, 0.2, 0, 0.1, 0, 0xe4dcc4, { rough: 0.85, seg: 16 });
    cyl(stoneBin, 0.105, 0.105, 0.02, 0, 0.21, 0, 0xcfc7ae, { rough: 0.8, seg: 16 });
    decal(stoneBin, 0.13, 0.07, 0, 0.11, 0.095, paperFace("", ["TYPE III STONE", "30 mL : 100 g"], { bg: "#f6f1e0" }), { px: 176 });
    const scale = group(pourBench, -0.5, 0.92, 0.02);
    box(scale, 0.18, 0.05, 0.16, 0, 0.025, 0, 0x3a4048, { rough: 0.45, metal: 0.3 });
    const scaleFace = decal(scale, 0.13, 0.04, 0, 0.052, -0.04, signFace("--- g", { bg: "#101a1e", accent: "#9fe8c0", scale: 0.45 }), { px: 160 });
    scaleFace.rotation.x = -Math.PI / 2;
    const beaker = cyl(scale, 0.035, 0.03, 0.09, 0.14, 0.045, 0, 0xdfe8ee, { rough: 0.15, metal: 0.05, opacity: 0.55, transparent: true, seg: 16 });
    holoTag(scale, "water : powder", 0, 0.16, 0, { css: "#c8a6e0", w: 0.42 });
    reg(hits, scale, "dlb-water-powder");
    void beaker; void stoneBin;

    // Vacuum mixer.
    const mixer = group(pourBench, -0.12, 0.92, 0.0, -0.1);
    box(mixer, 0.26, 0.3, 0.22, 0, 0.15, 0, 0xe0dcd2, { rough: 0.5, metal: 0.2 });
    const mixBowl = cyl(mixer, 0.07, 0.06, 0.12, 0, 0.36, 0.02, DLB_STONE, { rough: 0.6, seg: 18 });
    const mixLid = cyl(mixer, 0.075, 0.075, 0.03, 0, 0.43, 0.02, 0x8d959d, { rough: 0.4, metal: 0.5, seg: 18 });
    const mixLamp = box(mixer, 0.05, 0.015, 0.03, 0.08, 0.26, 0.112, DLB_ACCENT, { emissive: DLB_ACCENT, ei: 0.5, rough: 0.4, cast: false });
    ownMaterial(mixLamp);
    const mixFace = decal(mixer, 0.16, 0.05, -0.02, 0.26, 0.112, signFace("VACUUM MIX", { bg: "#2e2638", accent: "#e3ccf7", scale: 0.32 }), { px: 192 });
    holoTag(mixer, "vacuum mixer", 0, 0.52, 0, { css: "#c8a6e0", w: 0.42 });
    reg(hits, mixer, "dlb-vacuum-mixer");
    void mixBowl; void mixLid;

    // Vibrator with its amplitude dial and its platform socket.
    const vibrator = group(pourBench, 0.34, 0.92, 0.0, 0.1);
    box(vibrator, 0.3, 0.1, 0.26, 0, 0.05, 0, 0x4e5860, { rough: 0.45, metal: 0.35 });
    const vibPlatform = slab(vibrator, 0.28, 0.02, 0.24, 0, 0.11, 0, 0x2b3138, { radius: 0.01, rough: 0.9 });
    const vibDial = group(vibrator, 0.19, 0.05, 0.0);
    cyl(vibDial, 0.045, 0.045, 0.03, 0, 0, 0, CITY.hiVis, { rough: 0.5, metal: 0.3, seg: 16 }).rotation.z = Math.PI / 2;
    box(vibDial, 0.075, 0.01, 0.01, 0.02, 0.02, 0, 0x2b3138, { rough: 0.6 });
    holoTag(vibDial, "amplitude", 0, 0.12, 0, { css: "#c8a6e0", w: 0.32 });
    reg(hits, vibDial, "dlb-vibrator-dial");
    const vibSocket = box(vibrator, 0.26, 0.08, 0.22, 0, 0.16, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, vibSocket, "dlb-vibrator-slot");
    void vibPlatform;

    // The poured model, hidden until it exists, and the separation bench.
    const model = group(pourBench, 0.78, 0.94, 0.02, 0.2);
    cyl(model, 0.075, 0.08, 0.05, 0, 0.025, 0, DLB_STONE, { rough: 0.8, seg: 20 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 1.5 - 0.4;
      box(model, 0.016, 0.03, 0.016, Math.cos(a) * 0.055, 0.065, Math.sin(a) * 0.04, 0xf4efe0, { rough: 0.7 });
    }
    holoTag(model, "model — separate when set", 0, 0.16, 0, { css: "#c8a6e0", w: 0.58 });
    reg(hits, model, "dlb-separate-model");

    // ----------------------------------------------------------- the model trimmer
    const trimmer = group(g, 1.85, 0, -1.4, -0.6);
    box(trimmer, 0.6, 0.9, 0.5, 0, 0.45, 0, 0xd8d2c4, { rough: 0.55, metal: 0.15 });
    const trimTable = slab(trimmer, 0.44, 0.02, 0.34, 0, 0.92, 0.04, 0x8d959d, { radius: 0.01, rough: 0.4, metal: 0.5 });
    const trimWheel = cyl(trimmer, 0.15, 0.15, 0.04, 0, 0.94, -0.16, 0x9a9384, { rough: 0.9, seg: 24 });
    const trimGuard = group(trimmer, 0, 0.98, -0.1);
    const guardPlate = slab(trimGuard, 0.4, 0.22, 0.02, 0, 0.1, 0, 0xbfe4f2, { radius: 0.02, rough: 0.2, opacity: 0.5, transparent: true });
    ownMaterial(guardPlate);
    trimGuard.rotation.x = -0.9;
    holoTag(trimGuard, "guard", 0, 0.3, 0, { css: "#c8a6e0", w: 0.26 });
    reg(hits, trimGuard, "dlb-trimmer-guard");

    const waterValve = group(trimmer, -0.26, 0.86, 0.14);
    torus(waterValve, 0.05, 0.01, 0, 0, 0, 0x2f6f4a, { rough: 0.5, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    cyl(waterValve, 0.012, 0.012, 0.06, 0, 0, 0, 0x8d959d, { rough: 0.4, metal: 0.6, seg: 8 }).rotation.x = Math.PI / 2;
    hose(trimmer, [[-0.26, 0.86, 0.16], [-0.1, 0.95, 0.0], [0, 0.99, -0.12]], 0.009, 0x88b8cc, { steps: 10, rough: 0.5 });
    holoTag(waterValve, "water on", 0, 0.12, 0, { css: "#c8a6e0", w: 0.3 });
    reg(hits, waterValve, "dlb-trimmer-water");
    const trimJet = cyl(trimmer, 0.004, 0.008, 0.12, 0, 0.99, -0.13, 0xbfe4f2, { emissive: 0xbfe4f2, ei: 0.4, rough: 0.2, opacity: 0.5, transparent: true, seg: 8, cast: false });
    trimJet.visible = false;

    const trimSwitch = group(trimmer, 0.26, 0.82, 0.24);
    box(trimSwitch, 0.09, 0.06, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const trimSwitchLamp = box(trimSwitch, 0.055, 0.022, 0.02, 0, 0.012, 0.024, CITY.good, { emissive: CITY.good, ei: 0.3, rough: 0.4, cast: false });
    ownMaterial(trimSwitchLamp);
    holoTag(trimSwitch, "power", 0, 0.1, 0, { css: "#c8a6e0", w: 0.26 });
    reg(hits, trimSwitch, "dlb-trimmer-switch");

    // A model already on the wheel with the water off — the hazard.
    const dryTrim = group(trimmer, 0.02, 0.96, -0.14);
    cyl(dryTrim, 0.06, 0.065, 0.045, 0, 0, 0.1, DLB_STONE, { rough: 0.85, seg: 18 });
    holoTag(dryTrim, "grinding dry", 0, 0.12, 0.1, { css: "#f0645b", w: 0.38 });
    reg(hits, dryTrim, "dlb-dry-trimming");
    void trimTable; void trimWheel;

    // --------------------------------------------------------- the polishing lathe
    const lathe = group(g, 2.3, 0, 0.55, -1.0);
    box(lathe, 0.7, 0.9, 0.5, 0, 0.45, 0, 0xd8d2c4, { rough: 0.55, metal: 0.15 });
    const latheBody = box(lathe, 0.4, 0.2, 0.24, 0, 1.0, 0, 0x4e5860, { rough: 0.4, metal: 0.45 });
    for (const sx of [-1, 1]) {
      const spindle = cyl(lathe, 0.014, 0.014, 0.12, sx * 0.26, 1.0, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 10 });
      spindle.rotation.z = Math.PI / 2;
    }
    const wheelLeft = cyl(lathe, 0.075, 0.075, 0.03, -0.32, 1.0, 0, 0xe0d4c0, { rough: 0.85, seg: 22 });
    wheelLeft.rotation.z = Math.PI / 2;
    const wheelRight = cyl(lathe, 0.075, 0.075, 0.03, 0.32, 1.0, 0, 0xd8c4b0, { rough: 0.85, seg: 22 });
    wheelRight.rotation.z = Math.PI / 2;
    holoTag(lathe, "polishing lathe", 0, 1.3, 0, { css: "#c8a6e0", w: 0.44 });
    void latheBody;

    const cracked = group(lathe, -0.32, 1.0, 0.0);
    box(cracked, 0.004, 0.06, 0.032, 0.02, 0.04, 0, 0x4a3a30, { rough: 0.8, cast: false });
    box(cracked, 0.004, 0.04, 0.032, 0.02, -0.05, 0, 0x4a3a30, { rough: 0.8, cast: false });
    holoTag(cracked, "cracked wheel", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, cracked, "dlb-cracked-wheel");

    const looseChuck = group(lathe, 0.32, 1.0, 0.06);
    cyl(looseChuck, 0.022, 0.022, 0.03, 0, 0, 0, 0x8d959d, { rough: 0.35, metal: 0.7, seg: 14 }).rotation.z = Math.PI / 2;
    for (let i = 0; i < 3; i++) box(looseChuck, 0.03, 0.006, 0.006, 0, 0.02, 0, 0xc4ccd2, { rough: 0.4, metal: 0.6 }).rotation.x = (i / 3) * Math.PI;
    holoTag(looseChuck, "chuck finger-tight", 0, 0.12, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, looseChuck, "dlb-loose-chuck");

    const latheShield = group(lathe, 0, 1.14, 0.18);
    cyl(latheShield, 0.01, 0.01, 0.2, -0.3, -0.08, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 8 });
    cyl(latheShield, 0.01, 0.01, 0.2, 0.3, -0.08, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 8 });
    const shieldPane = slab(latheShield, 0.66, 0.26, 0.006, 0, 0.06, 0, 0xbfe4f2, { radius: 0.02, rough: 0.2, opacity: 0.45, transparent: true });
    ownMaterial(shieldPane);
    latheShield.rotation.x = -0.8;
    holoTag(latheShield, "lathe shield", 0, 0.3, 0, { css: "#c8a6e0", w: 0.38 });
    reg(hits, latheShield, "dlb-lathe-shield");

    // Extraction hood over the lathe, and its wall switch.
    const hood = group(lathe, 0, 1.55, -0.1);
    box(hood, 0.8, 0.06, 0.4, 0, 0.16, 0, 0x8d959d, { rough: 0.5, metal: 0.45 });
    for (let i = 0; i < 4; i++) box(hood, 0.74, 0.012, 0.03, 0, 0.13, -0.14 + i * 0.09, 0x6f7a83, { rough: 0.55, metal: 0.4, cast: false });
    cyl(hood, 0.09, 0.09, 0.7, 0.28, 0.55, -0.1, 0x9aa4ad, { rough: 0.5, metal: 0.4, seg: 14 });
    const hoodLamp = box(hood, 0.1, 0.02, 0.04, -0.3, 0.13, 0.18, CITY.good, { emissive: CITY.good, ei: 0.3, rough: 0.4, cast: false });
    ownMaterial(hoodLamp);
    holoTag(hood, "local extraction", 0, 0.3, 0.2, { css: "#c8a6e0", w: 0.44 });
    reg(hits, hood, "dlb-extraction-hood");

    const extractSwitch = group(g, 2.75, 0, 1.75, -1.4);
    box(extractSwitch, 0.16, 0.22, 0.06, 0, 1.3, 0, 0xe4e0d4, { rough: 0.6 });
    const switchLever = box(extractSwitch, 0.07, 0.09, 0.04, 0, 1.33, 0.04, 0xd8342a, { rough: 0.5 });
    ownMaterial(switchLever);
    decal(extractSwitch, 0.13, 0.05, 0, 1.19, 0.035, signFace("EXTRACTION", { bg: "#3a352a", accent: "#f2e2b8", scale: 0.3 }), { px: 176 });
    holoTag(extractSwitch, "extraction — wall switch", 0, 1.48, 0, { css: "#c8a6e0", w: 0.56 });
    reg(hits, extractSwitch, "dlb-extraction-switch");

    // Pumice pan, fresh and shared.
    const pumice = group(lathe, -0.02, 0.94, 0.3);
    cyl(pumice, 0.08, 0.07, 0.06, 0, 0, 0, 0x8d959d, { rough: 0.5, metal: 0.4, seg: 18 });
    const pumiceSlurry = cyl(pumice, 0.072, 0.072, 0.02, 0, 0.025, 0, 0xcfc7ae, { rough: 0.9, seg: 18, cast: false });
    ownMaterial(pumiceSlurry);
    holoTag(pumice, "pumice pan", 0, 0.14, 0, { css: "#c8a6e0", w: 0.34 });
    reg(hits, pumice, "dlb-pumice-pan");

    const sharedPumice = group(g, 1.95, 0, 1.4, -0.3);
    box(sharedPumice, 0.34, 0.88, 0.3, 0, 0.44, 0, DLB_BENCH, { rough: 0.7 });
    cyl(sharedPumice, 0.085, 0.075, 0.07, 0, 0.92, 0, 0x8d959d, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(sharedPumice, 0.078, 0.078, 0.025, 0, 0.95, 0, 0x8a7f66, { rough: 0.95, seg: 18, cast: false });
    holoTag(sharedPumice, "same pan all day", 0, 1.06, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, sharedPumice, "dlb-shared-pumice");

    // A gloved hand and a loose cuff over the wheel — the hazard.
    const gloveAtLathe = group(lathe, 0.32, 1.1, 0.06);
    ball(gloveAtLathe, 0.028, 0, 0, 0, 0x4f8fd8, { rough: 0.7, seg: 12 });
    cyl(gloveAtLathe, 0.03, 0.036, 0.07, 0.04, 0.03, 0, 0xe4e9ec, { rough: 0.85, seg: 12 }).rotation.z = 0.8;
    holoTag(gloveAtLathe, "glove and cuff at the wheel", 0, 0.12, 0, { css: "#f0645b", w: 0.6 });
    reg(hits, gloveAtLathe, "dlb-glove-at-lathe");

    // ------------------------------------------------------------- PPE and former
    const ppeRack = group(g, 0.55, 0, 2.3, -0.2);
    slab(ppeRack, 0.7, 1.7, 0.08, 0, 0.85, 0, 0x6f6456, { radius: 0.02, rough: 0.6 });
    const respirator = group(ppeRack, -0.18, 1.1, 0.08);
    ball(respirator, 0.065, 0, 0, 0, 0xdfe4e8, { rough: 0.7, seg: 14 });
    for (const sx of [-1, 1]) cyl(respirator, 0.03, 0.03, 0.03, sx * 0.07, -0.01, 0.02, 0x9aa4ad, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(respirator, 0.16, 0.012, 0.012, 0, 0.04, -0.03, 0xc4ccd2, { rough: 0.7 });
    holoTag(respirator, "fit-tested respirator", 0, 0.16, 0, { css: "#c8a6e0", w: 0.52 });
    reg(hits, respirator, "dlb-respirator");

    const faceShield = group(ppeRack, 0.18, 1.12, 0.08);
    torus(faceShield, 0.085, 0.014, 0, 0.06, 0, 0x2f6f8c, { rough: 0.35, metal: 0.2, seg: 6, seg2: 18 });
    const shieldVisor = slab(faceShield, 0.24, 0.2, 0.008, 0, -0.03, 0.02, 0xd8eef6, { radius: 0.03, rough: 0.15, opacity: 0.45, transparent: true });
    holoTag(faceShield, "face shield", 0, 0.18, 0, { css: "#c8a6e0", w: 0.36 });
    reg(hits, faceShield, "dlb-face-shield");
    void shieldVisor;

    const former = group(g, 2.45, 0, 2.25, -0.55);
    box(former, 0.42, 0.9, 0.4, 0, 0.45, 0, 0xd8d2c4, { rough: 0.55, metal: 0.15 });
    const formerBase = slab(former, 0.34, 0.03, 0.3, 0, 0.92, 0, 0x8d959d, { radius: 0.01, rough: 0.4, metal: 0.5 });
    for (let i = 0; i < 16; i++) {
      box(former, 0.014, 0.008, 0.014, -0.12 + (i % 4) * 0.08, 0.94, -0.1 + Math.floor(i / 4) * 0.07, 0x6f7a83, { rough: 0.6, cast: false });
    }
    const formerFrame = group(former, 0, 1.1, 0);
    box(formerFrame, 0.34, 0.03, 0.3, 0, 0, 0, 0x4e5860, { rough: 0.45, metal: 0.4 });
    box(formerFrame, 0.28, 0.02, 0.24, 0, 0.012, 0, 0x2b3138, { rough: 0.6 });
    const heater = box(former, 0.32, 0.06, 0.28, 0, 1.3, 0, 0x8d5a3c, { rough: 0.7 });
    const heaterCoils = box(former, 0.26, 0.012, 0.22, 0, 1.27, 0, 0xf28b3c, { emissive: 0xf28b3c, ei: 0.7, rough: 0.5, cast: false });
    ownMaterial(heaterCoils);
    holoTag(former, "vacuum former", 0, 1.46, 0, { css: "#c8a6e0", w: 0.42 });
    const formerSocket = box(formerFrame, 0.3, 0.08, 0.26, 0, 0.05, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, formerSocket, "dlb-former-slot");
    void formerBase; void heater;

    const blankStack = group(g, 1.6, 0, 2.6, -0.35);
    box(blankStack, 0.3, 0.86, 0.28, 0, 0.43, 0, DLB_BENCH, { rough: 0.7 });
    const blank = group(blankStack, 0, 0.9, 0);
    for (let i = 0; i < 3; i++) slab(blank, 0.2, 0.004, 0.2, 0, i * 0.006, 0, 0xeff6f8, { radius: 0.01, rough: 0.25, opacity: 0.7, transparent: true });
    decal(blankStack, 0.16, 0.05, 0, 0.93, 0.15, signFace("1.0 mm BLANKS", { bg: "#4a4436", accent: "#eaf6fb", scale: 0.3 }), { px: 176 });
    holoTag(blank, "tray blank", 0, 0.12, 0, { css: "#c8a6e0", w: 0.32 });
    reg(hits, blank, "dlb-blank-sheet");

    // --------------------------------------------------------- the case-out bench
    const caseOut = group(g, -2.5, 0, -0.9, 0.9);
    box(caseOut, 1.1, 0.88, 0.52, 0, 0.44, 0, DLB_BENCH, { rough: 0.7 });
    const caseOutTop = slab(caseOut, 1.16, 0.05, 0.56, 0, 0.9, 0, 0xb8b2a4, { radius: 0.01, rough: 0.6 });
    void caseOutTop;
    const caseLog = decal(caseOut, 0.28, 0.34, -0.26, 0.928, 0.02,
      paperFace("CASE RECORD", ["Materials + lots", "Disinfected in / out", "Made by · date"], { band: "#c8a6e0" }), { px: 256 });
    caseLog.rotation.x = -Math.PI / 2;
    holoTag(caseOut, "case record", -0.26, 1.06, 0.02, { css: "#c8a6e0", w: 0.38 });
    reg(hits, caseLog, "dlb-case-log");

    const returnBag = group(caseOut, 0.28, 0.93, 0.02, -0.2);
    box(returnBag, 0.24, 0.06, 0.18, 0, 0.03, 0, 0xdfe8ee, { rough: 0.5, opacity: 0.8, transparent: true });
    decal(returnBag, 0.18, 0.05, 0, 0.062, 0, signFace("DISINFECTED OUT", { bg: "#eef7f4", accent: "#2f7d4a", scale: 0.3 }), { px: 192 })
      .rotation.x = -Math.PI / 2;
    holoTag(returnBag, "case out", 0, 0.14, 0, { css: "#c8a6e0", w: 0.3 });

    // --------------------------------------------------------- the laboratory lead
    const lead = standingFigure(g, -2.55, 0.15, { ry: 1.5, cloth: 0x5a4a7c, vest: DLB_ACCENT, skin: 0xa26d48 });
    holoTag(lead, "laboratory lead", 0, 1.8, 0, { css: "#c8a6e0", w: 0.44 });
    const leadMark = box(lead, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, leadMark, "dlb-prescription-checkin");

    const bencher = standingFigure(g, -2.6, 2.6, { ry: 2.2, cloth: 0x4a6f7a, skin: 0x6a4128 });
    holoTag(bencher, "next bench", 0, 1.78, 0, { css: "#c8a6e0", w: 0.34 });

    const panel = holoPanel(g, 0.76, 0.5, 0.2, 1.7, -2.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,12,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c8a6e0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e9d8f7";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LABORATORY — BENCH RULES", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f6edfd";
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Disinfect in · disinfect out", "Trim wet, behind the guard",
       "No gloves or sleeves at the lathe", "Fresh pumice for every case"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.34 + i * 0.16));
      });
    }, { accent: DLB_ACCENT });
    void panel;

    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.3, 0.06, 0.34, i * 1.3, 2.62, -0.4, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.16, 0.02, 0.26, i * 1.3, 2.585, -0.4, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.5, rough: 0.4, cast: false });
    }

    const key = new THREE.DirectionalLight(0xfff4e6, 0.85);
    key.position.set(2.2, 4.6, -2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xfdf6ff, 0x60564c, 0.9));

    const dust = particles(g, 30, 0xd8d2c0, { size: 0.014, life: 0.7, additive: false, opacity: 0.45 });
    dust.visible = false;
    let mixing = false, dusty = false, rinsing = false;
    const bathHome = impression.position.clone();

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -1.6),

      onStep(step) { mixing = step.id === "vacuum-mix"; },

      onStepComplete(step) {
        if (step.id === "receive-case") repaint(bathTimer, signFace("READY", { bg: "#0f2a33", accent: "#9fe8c0", scale: 0.45 }));
        if (step.id === "disinfect-impression") {
          repaint(bathTimer, signFace("DONE", { bg: "#12352a", accent: "#9fe8c0", scale: 0.45 }));
          impression.scale.set(1, 1, 1);
          dirtyImpression.visible = false;
        }
        if (step.id === "measure-ratio") repaint(scaleFace, signFace("100 g", { bg: "#101a1e", accent: "#9fe8c0", scale: 0.42 }));
        if (step.id === "vacuum-mix") repaint(mixFace, signFace("MIX DONE", { bg: "#243a30", accent: "#9fe8c0", scale: 0.32 }));
        if (step.id === "pour-model") {
          impression.parent.remove(impression);
          vibrator.add(impression);
          impression.position.set(0, 0.16, 0);
          impression.rotation.set(0, 0, 0);
        }
        if (step.id === "start-trimmer") { trimJet.visible = true; dryTrim.visible = false; }
        if (step.id === "lathe-faults") { cracked.visible = false; looseChuck.visible = false; }
        if (step.id === "dust-controls") hoodLamp.material.emissiveIntensity = 1.3;
        if (step.id === "lathe-shield") { latheShield.rotation.x = -0.15; gloveAtLathe.visible = false; }
        if (step.id === "fresh-pumice") {
          pumiceSlurry.material.color.set(0xeae4d2);
          sharedPumice.visible = false;
        }
        if (step.id === "form-tray") {
          blank.parent.remove(blank);
          formerFrame.add(blank);
          blank.position.set(0, 0.03, 0);
          blank.rotation.set(0, 0, 0);
          heaterCoils.material.emissiveIntensity = 1.6;
        }
        if (step.id === "case-log") {
          repaint(caseLog, paperFace("CASE RECORD", ["Bleaching tray · 1.0 mm", "Disinfected in / out", "Checked against Rx"], { band: "#2f8f6a" }));
        }
      },

      onInterrupt(it) {
        if (it.id === "dlb-over-immersed") {
          impression.scale.set(1.25, 1.25, 1.25);
          bathFluid.material.emissive.set(CITY.alert);
          bathFluid.material.emissiveIntensity = 0.9;
        }
        if (it.id === "dlb-extraction-off") {
          dusty = true;
          dust.visible = true;
          hoodLamp.material.emissive.set(CITY.alert);
          hoodLamp.material.emissiveIntensity = 1.2;
          switchLever.position.y = 1.30;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dlb-over-immersed") {
          impression.scale.set(1, 1, 1);
          impression.position.copy(bathHome);
          bathFluid.material.emissiveIntensity = 0.0;
          rinsing = true;
          rinseJet.visible = true;
        }
        if (it.id === "dlb-extraction-off") {
          dusty = false;
          dust.visible = false;
          hoodLamp.material.emissive.set(CITY.good);
          hoodLamp.material.emissiveIntensity = 1.0;
          switchLever.position.y = 1.36;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wheelLeft.rotation.y = t * 6;
        wheelRight.rotation.y = -t * 6;
        if (dusty) dust.userData.step(dt, new THREE.Vector3(2.3, 1.1, 0.55), 0.2, 0.4, 0.5);
        if (rinsing) rinseJet.material.emissiveIntensity = 0.3 + Math.abs(Math.sin(t * 6)) * 0.3;
        const tr = session?.track;
        if (mixing && tr) {
          const ok = tr.v >= 0.38 && tr.v <= 0.6;
          mixLamp.material.emissive.set(ok ? CITY.good : CITY.alert);
          mixLamp.material.emissiveIntensity = 0.5 + (ok ? 0.4 : 1.0) * Math.abs(Math.sin(t * 4));
        }
      },
    };
  },
};
