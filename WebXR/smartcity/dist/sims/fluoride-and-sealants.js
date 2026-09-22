import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
  seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fluoride and Sealants VR — Dental & Oral Health, station one
// hundred and twenty-four. Preventive care on a child: a fluoride varnish
// application dosed to the age sitting in the chair, and pit-and-fissure
// sealants placed on the molars behind it — the two procedures a school and
// public-health hygiene programme runs most, back to back, on the same visit.

const FLS_ACCENT = 0xf2955e;
const FLS_STEEL = 0x9aa6ac;
const FLS_UPHOLSTERY = 0x5a8fb0;
const FLS_CABINET = 0xe8edf0;

export const SIM_FLUORIDE_AND_SEALANTS = {
  id: "fluoride-and-sealants",
  index: "124",
  domain: "Healthcare",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "SEIU and UFCW dental and clinic staff, AFSCME public-health hygienists, and the ADHA as the hygiene profession's own body; the ADA's evidence-based clinical guidelines on fluoride varnish and on pit-and-fissure sealants; the Dental Hygiene Board of California and the state dental practice act's scope rules on who may place a sealant and under what standing order; OSHA 29 CFR 1910.1030 bloodborne pathogens",
  name: "Fluoride and Sealants",
  title: simTitle("Fluoride and Sealants"),
  tagline: "Preventive care on a child: a caries risk assessment, varnish dosed to the age and painted after isolation, then sealants cleaned, etched to the label's time, rinsed to the frosted look, placed and cured behind eye protection, checked for a high spot and recorded for the recall",
  accent: FLS_ACCENT,
  accentCss: "#f2955e",
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "prevention-recorded", name: "Prevention Recorded", note: "A varnish and sealant visit completed with the dose right for the age and every sealant retained at recall" },

  game: system({
    name: "Prevention Rounds",
    currency: "SEAL",
    ranks: ["Outreach Aide", "Registered Hygienist", "Public Health Lead", "Clinical Lead", "Prevention Certified"],
    badges: [
      { id: "dose-right", name: "Dose Right", note: "The varnish dose held near the correct band for this child's age", test: AWARD.precise(0.72) },
      { id: "no-recontamination", name: "No Recontamination", note: "The etched surface never had to be re-etched", test: AWARD.stepClean("rinse-dry") },
      { id: "clean-visit", name: "Clean Visit", note: "No unsafe action across the whole visit", test: AWARD.safe },
    ],
    challenges: [
      { id: "on-schedule", name: "On Schedule", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-run", name: "Clean Run", note: "No corrections the whole visit", test: AWARD.clean },
      { id: "steady-streak", name: "Steady Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "unmeasured-varnish": "That is a full, uncapped tube with no measured dose taken from it. Fluoride varnish is dosed to the child's age for a real reason — acute fluoride toxicity in a small child is rare precisely because programs measure a dose rather than letting a full tube anywhere near one.",
    "fluoride-paste-decoy": "That prophy paste is fluoridated. Cleaning a tooth with a fluoridated paste right before etching it for a sealant leaves a film that interferes with the acid's ability to etch enamel evenly — the sealant bonds to that film instead of to the tooth, and it does not stay long.",
    "expired-etchant": "That etchant gel is past its date and has separated in the syringe. An etchant that has degraded no longer reaches full strength in the time on the label, and a surface that looks etched from an old gel can still fail to give the sealant anything to mechanically lock onto.",
    "unshielded-curing-light": "That curing light has no shield on its tip. The light is bright enough in the blue spectrum to be a real hazard to the retina at close range, for the child looking up at it and for whoever is holding it — the shield or amber eyewear is not optional trim.",
  },

  lateNotes: {
    "sealant-resin": "Not yet. The tooth is not etched, rinsed and dried to the frosted look this material needs to bond to.",
    "curing-light": "Eye protection goes on before the light does. There is also nothing etched or placed to cure yet.",
    "recall-chart": "Retention is recorded once the sealant is actually placed, cured and checked — there is nothing to record yet.",
  },

  steps: [
    {
      id: "caries-risk", kind: "select", target: "risk-chart",
      title: "Complete the caries risk assessment",
      cue: "Review the caries risk assessment before deciding what this visit needs.",
      why: "A caries risk assessment is what actually decides whether this child needs varnish, sealants, both, or a referral — treating every child on the schedule the same way regardless of risk is how a public-health programme spends its limited chair time on the children who needed it least.",
    },
    {
      id: "varnish-dose", kind: "gauge", target: "varnish-tube",
      title: "Measure the varnish dose for this child's age",
      cue: "Dispense the measured dose this age band calls for, then commit.",
      why: "Fluoride varnish is dosed by age, not by however much comes out of the applicator brush, because a young child's body weight is small enough that an unmeasured over-application is a real ingestion risk rather than a theoretical one. A single-use, pre-measured applicator or a weighed dot on the mixing pad is the control — a full brush loaded from an open tube is not.",
      gauge: {
        label: "VARNISH DOSE", speed: 0.7, green: [0.28, 0.48],
        readout: (t) => (t < 0.28 ? "under-dosed for this age" : t > 0.48 ? "over the age-band dose" : `${(t * 0.5).toFixed(2)} mL`),
        missNote: "Not the dose this age band calls for. Recheck the applicator against the age chart rather than eyeballing the brush.",
      },
    },
    {
      id: "varnish-isolate", kind: "sequence",
      targets: ["cotton-rolls", "dry-angle"],
      itemNames: { "cotton-rolls": "cotton rolls", "dry-angle": "dry-angle" },
      title: "Isolate and dry for the varnish",
      cue: "Cotton rolls around the arch first, then the dry-angle over the parotid duct.",
      why: "The cotton rolls go in first to hold the cheek and tongue clear of the arch, and the dry-angle goes over the parotid duct second because that is the specific source refilling the field with saliva the cotton rolls alone cannot stop. Varnish painted onto a wet surface thins, runs, and sets as a smear instead of the even coat the fluoride release depends on.",
      outOfOrderNote: "Wrong order — the cotton rolls go in first to hold the field, then the dry-angle over the duct to stop it refilling with saliva.",
    },
    {
      id: "varnish-paint", kind: "select", target: "varnish-brush",
      title: "Paint the varnish on all surfaces",
      cue: "Paint the measured dose across all tooth surfaces with the brush.",
      why: "An even, thin coat across every surface is what the ADA's evidence base for varnish is actually built on — patchy coverage on a few teeth is not the same intervention as the trials that showed a caries reduction, whatever dose was measured out for it.",
    },
    {
      id: "post-care", kind: "select", target: "parent-handout",
      title: "Give the parent post-care instructions",
      cue: "Give the parent the take-home instructions before they leave the chair.",
      why: "Varnish needs to stay on the teeth to keep releasing fluoride, and the instructions are what tell a parent to hold off on hard or crunchy food and on brushing for the rest of the day. Skipping this step hands back a child who brushes the varnish off on the ride home.",
    },
    {
      id: "tooth-clean", kind: "select", target: "prophy-cup",
      title: "Clean the sealant tooth",
      cue: "Clean the pits and fissures with plain, non-fluoridated pumice.",
      why: "The molar getting a sealant is cleaned with plain pumice, not the fluoridated paste used everywhere else in a routine cleaning, because a fluoridated paste leaves a film that gets in the way of the etch. This is the one surface in the whole visit where the usual paste is the wrong choice.",
    },
    {
      id: "seal-isolate", kind: "select", target: "isolation-shield",
      title: "Isolate the tooth for bonding",
      cue: "Isolate the tooth completely before any etchant goes on.",
      why: "A sealant's whole bond depends on an etched surface that stays completely dry until the resin is cured, which is a stricter standard than the varnish needed a few minutes ago — a dam or an isolation shield, not cotton rolls alone. Placing a sealant at all is also inside this hygienist's scope only under the state's practice act and the programme's standing order from a supervising dentist, which is confirmed before this tooth is touched, not after.",
    },
    {
      id: "etch-apply", kind: "hold", target: "etchant-gel", seconds: 8,
      title: "Etch to the time on the label",
      cue: "Apply the etchant and hold it on the surface for exactly the time the label states.",
      why: "The etch time on the label is not a suggestion in either direction — short it and the enamel has too little micro-porosity for the resin tags that actually hold a sealant on; run it needlessly long and the tooth sits exposed for no gain while the field's isolation is what is really being risked the longer it goes.",
      holdBreakNote: "You lifted the etchant early. An under-etched surface does not give the resin enough to grip — reapply and hold the full time on the label.",
    },
    {
      id: "rinse-dry", kind: "track", target: "air-water-syringe", seconds: 9,
      title: "Rinse and dry to the frosted look",
      cue: "Rinse thoroughly, then dry until the enamel looks frosted and chalky, not wet.",
      why: "A properly etched surface dries to a dull, frosted, chalk-white look — anything glossy is still wet, and anything that stays glossy after real drying effort was not etched enough to begin with. The frosted appearance is the visual proof the bond has something to hold onto; it is not a formality before the next step.",
      track: {
        start: 0.85, green: [0.1, 0.32], rise: 0.4, fall: 0.55, drift: 0.14, label: "SURFACE MOISTURE",
        readout: (v) => (v > 0.32 ? "still glossy — not dry yet" : v < 0.1 ? "over-dried — recheck isolation" : "frosted and dry"),
      },
      holdBreakNote: "Moisture crept back into band before you finished. Keep drying — a surface that looks frosted for a second and then dulls back to glossy was never fully dry.",
    },
    {
      id: "sealant-place", kind: "select", target: "sealant-resin",
      title: "Place the sealant material",
      cue: "Flow the sealant into the pits and fissures without trapping air.",
      why: "Sealant material is worked into the pits and fissures deliberately, because a bubble trapped under the resin is a void the cure light cannot reach and the tooth cannot self-repair — it is a gap in a surface that was supposed to be sealed shut.",
    },
    {
      id: "eye-protection", kind: "select", target: "protective-glasses",
      title: "Put on eye protection before the light",
      cue: "Give the child protective glasses and put on your own before the curing light comes on.",
      why: "A curing light's output sits in the blue end of the spectrum specifically because that wavelength drives the resin's cure, and that is also the wavelength most associated with retinal risk at close range. The glasses go on before the light does, for the child looking straight up at it as much as for you holding it.",
    },
    {
      id: "cure-light", kind: "hold", target: "curing-light", seconds: 8,
      title: "Cure the sealant the full time",
      cue: "Hold the light steady over the sealant for the manufacturer's full cure time.",
      why: "The cure time on the light and the material's instructions assumes the tip stays aimed at the surface for the whole count — wave it off early and the resin under the surface, away from the light, stays soft long after the top looks set. A sealant that looks cured and is not wears through in weeks instead of years.",
      holdBreakNote: "You pulled the light away before the full cure time. An under-cured sealant looks finished and is not — reseat the light and hold the full count.",
    },
    {
      id: "occlusion-check", kind: "find", noHint: true,
      targets: ["high-spot-mesial", "high-spot-distal"],
      itemNames: { "high-spot-mesial": "the mesial high spot", "high-spot-distal": "the distal high spot" },
      itemNotes: {
        "high-spot-mesial": "The articulating paper marked a heavy contact here. Left alone, the child bites on this spot every time they close, and that pressure is what chips a sealant that would otherwise have lasted.",
        "high-spot-distal": "A second mark on the distal marginal ridge — the same problem on the other side of the sealant, and just as easy to miss if you stop checking after the first one.",
      },
      title: "Check the occlusion",
      cue: "Two spots on this sealant are marked high. Find them on the articulating paper.",
      why: "A sealant sitting proud of the bite gets hit on every closure until it either wears flat the hard way or chips out entirely, and the only way to know it is high is to mark it and look — it is not something you can feel with a rushed check of the bite in a squirming child.",
    },
    {
      id: "excess-removed", kind: "select", target: "finishing-bur",
      title: "Remove the excess and adjust",
      cue: "Adjust the high spots with the finishing bur until the bite is even.",
      why: "The finishing bur takes down exactly the marked high spots and nothing else, because over-adjusting a sealant that is otherwise sitting correctly just opens new margins for the next meal's debris and the next recall's decay risk to start at.",
    },
    {
      id: "retention-record", kind: "select", target: "recall-chart",
      title: "Record retention for the recall",
      cue: "Record today's sealant placement and retention status in the recall chart.",
      why: "A sealant that is not recorded is a sealant nobody checks on. Every retention figure a public-health programme can show a funder or a school district starts with this one line in the chart, at the visit the sealant actually went in.",
    },
  ],

  interrupts: [
    {
      id: "saliva-contamination",
      kind: "Field contamination",
      after: "rinse-dry", delay: 4, seconds: 11,
      alert: "The child's tongue pushes past the dry-angle and saliva flows across the etched surface before the sealant goes on.",
      cue: "The etched surface is contaminated — re-etch it.",
      target: "etchant-gel",
      why: "Saliva redeposits organic pellicle onto microporous etched enamel almost immediately, and once that happens the sealant bonds to a film of contamination instead of to the etched tooth. The fix a moment of dry gauze does not undo is a fresh, timed re-etch — not simply drying the surface again and moving on.",
      missNote: "You proceeded onto the contaminated surface anyway. A sealant placed there looks identical to a properly bonded one on the day it goes in, and fails the same way every skipped re-etch does — quietly, at some recall visit months from now.",
      wrongNote: "It is the etchant. A contaminated surface is fixed by re-etching it, not by drying around the problem.",
    },
    {
      id: "radiometer-low",
      kind: "Equipment fault",
      after: "cure-light", delay: 3, seconds: 11,
      alert: "The curing light's radiometer reading comes back well under the unit's rated output.",
      cue: "This light's output is reading low — switch to the checked backup.",
      target: "backup-curing-light",
      why: "A light guide loses output as cured resin builds up on its tip and a bulb ages, well before either is dim enough to notice by eye, which is exactly why the reading is checked rather than trusted by looking at the beam. A reading this low will not fully polymerize resin at the depth this sealant needs.",
      missNote: "You kept curing with the same light. Every sealant cured on it after that reading is running the same risk of an under-cured base layer that looks finished on top and never fully hardens underneath.",
      wrongNote: "It is the backup light. A low radiometer reading is a fault with this unit, not something a longer hold time fixes.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, FLS_ACCENT);

    // ------------------------------------------------------- child dental chair
    const chairBase = group(g, 0, 0, -0.5);
    cyl(chairBase, 0.2, 0.24, 0.09, 0, 0.045, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    cyl(chairBase, 0.08, 0.09, 0.36, 0, 0.27, 0, FLS_STEEL, { rough: 0.35, metal: 0.75, seg: 16 });
    const chairSeatGroup = group(chairBase, 0, 0.44, 0);
    slab(chairSeatGroup, 0.5, 0.12, 0.54, 0, 0, 0.22, FLS_UPHOLSTERY, { radius: 0.06, rough: 0.6 });
    const chairBack = group(chairSeatGroup, 0, 0.04, -0.2);
    slab(chairBack, 0.48, 0.74, 0.12, 0, 0.34, 0, FLS_UPHOLSTERY, { radius: 0.06, rough: 0.6 });
    chairBack.rotation.x = 0.44;
    slab(chairBack, 0.28, 0.2, 0.09, 0, 0.8, 0.02, FLS_UPHOLSTERY, { radius: 0.05, rough: 0.6 });
    for (const sx of [-1, 1]) {
      slab(chairSeatGroup, 0.08, 0.05, 0.5, sx * 0.27, 0.07, 0.22, FLS_STEEL, { radius: 0.02, rough: 0.4, metal: 0.6 });
    }

    // A small, cheerful decal on the headrest — this is a school and
    // public-health programme's chair, not a general operatory's.
    decal(chairBack, 0.14, 0.06, 0, 0.42, 0.061, signFace("SMILES", { bg: "#5a8fb0", accent: "#f2955e", scale: 0.55 }));

    // Child-scaled reclined patient.
    const patient = seatedFigure(chairSeatGroup, 0, 0.07, 0.34, { skin: 0xcd9a72, cloth: 0xe8c15a });
    patient.root.scale.setScalar(0.72);
    patient.root.rotation.x = 0.44;
    patient.torso.rotation.x = -0.02;

    // Overhead light.
    const lightArm = group(g, -0.32, 0, -1.4);
    cyl(lightArm, 0.045, 0.055, 1.75, 0, 0.87, 0, FLS_STEEL, { rough: 0.3, metal: 0.7, seg: 14 });
    const lightHead = group(lightArm, 0.5, 1.7, 0.26);
    slab(lightHead, 0.36, 0.09, 0.22, 0, 0, 0, 0xdfe4e8, { radius: 0.03, rough: 0.3, metal: 0.3 });
    ball(lightHead, 0.13, 0, -0.05, 0, 0xfdf6e3, { emissive: 0xfdf6e3, ei: 1.1, rough: 0.3 });

    // ---------------------------------------------------------- bracket table
    const bracket = group(g, -0.58, 0, -0.5, 0.3);
    cyl(bracket, 0.045, 0.055, 0.62, 0, 0.31, 0, FLS_STEEL, { rough: 0.3, metal: 0.75, seg: 12 });
    slab(bracket, 0.42, 0.03, 0.28, 0.1, 0.63, 0, 0xf2f5f7, { radius: 0.02, rough: 0.35, metal: 0.1 });

    // Cotton rolls, dry-angle, prophy cup, varnish brush and etchant on the tray.
    const cottonRolls = group(bracket, -0.1, 0.66, -0.06);
    for (let i = 0; i < 2; i++) cyl(cottonRolls, 0.008, 0.008, 0.06, i * 0.02 - 0.01, 0, 0, 0xf6f2ea, { rough: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    reg2(cottonRolls, "cotton-rolls");
    const dryAngle = box(bracket, 0.05, 0.006, 0.04, -0.02, 0.665, -0.02, 0xf0ede2, { rough: 0.85 });
    reg2(dryAngle, "dry-angle");
    const varnishBrush = group(bracket, 0.16, 0.665, -0.05);
    cyl(varnishBrush, 0.005, 0.005, 0.12, 0, 0, 0, 0xe8c15a, { rough: 0.4, seg: 8 });
    cyl(varnishBrush, 0.008, 0.003, 0.02, 0, 0.07, 0, 0xd8a23b, { rough: 0.5, seg: 8 });
    reg2(varnishBrush, "varnish-brush");
    const prophyCup = group(bracket, 0.05, 0.665, 0.06);
    cyl(prophyCup, 0.015, 0.01, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, seg: 10 });
    reg2(prophyCup, "prophy-cup");
    const fluoridePasteDecoy = group(bracket, 0.16, 0.665, 0.07);
    cyl(fluoridePasteDecoy, 0.012, 0.012, 0.05, 0, 0.025, 0, 0x8fd6e8, { rough: 0.4, seg: 10 });
    decal(fluoridePasteDecoy, 0.02, 0.03, 0, 0.05, 0.0121, signFace("F", { bg: "#0f4257", accent: "#6cc6f0", scale: 0.7 }));
    reg2(fluoridePasteDecoy, "fluoride-paste-decoy");

    // ------------------------------------------------------- sealant supplies
    const sealCart = group(g, 0.85, 0, -0.9, -0.4);
    slab(sealCart, 0.5, 0.03, 0.36, 0, 0.78, 0, 0x2d3940, { radius: 0.02, rough: 0.5 });
    cyl(sealCart, 0.05, 0.06, 0.76, 0, 0.39, 0, FLS_STEEL, { rough: 0.3, metal: 0.6, seg: 14 });
    const etchGel = group(sealCart, -0.14, 0.8, -0.06);
    cyl(etchGel, 0.014, 0.016, 0.08, 0, 0.04, 0, 0xd8a23b, { rough: 0.4, metal: 0.2, seg: 12 });
    reg2(etchGel, "etchant-gel");
    const etchExpired = group(sealCart, -0.14, 0.8, 0.06);
    cyl(etchExpired, 0.014, 0.016, 0.08, 0, 0.04, 0, 0x8b6a3a, { rough: 0.6, metal: 0.1, seg: 12 });
    reg2(etchExpired, "expired-etchant");
    const isolationShield = group(sealCart, 0.02, 0.8, 0);
    torus(isolationShield, 0.05, 0.008, 0, 0.03, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    box(isolationShield, 0.09, 0.005, 0.09, 0, 0.03, 0, 0xd8dde0, { rough: 0.6, opacity: 0.75 });
    reg2(isolationShield, "isolation-shield");
    const airWater = group(sealCart, 0.16, 0.8, -0.05);
    cyl(airWater, 0.013, 0.016, 0.13, 0, 0.065, 0, 0xdfe4e8, { rough: 0.3, metal: 0.4, seg: 12 });
    reg2(airWater, "air-water-syringe");
    const sealantResin = group(sealCart, 0.16, 0.8, 0.07);
    cyl(sealantResin, 0.012, 0.014, 0.06, 0, 0.03, 0, 0xeef2ee, { rough: 0.3, opacity: 0.85, seg: 10 });
    reg2(sealantResin, "sealant-resin");
    const finishingBur = group(sealCart, -0.05, 0.8, 0.1);
    cyl(finishingBur, 0.003, 0.001, 0.06, 0, 0.03, 0, FLS_STEEL, { rough: 0.2, metal: 0.9, seg: 8 });
    reg2(finishingBur, "finishing-bur");
    const articulatingPaper = decal(sealCart, 0.08, 0.05, 0.1, 0.815, -0.1,
      paperFace("", ["marked bite"], { bg: "#2b3138", band: "#d8232a" }), { px: 128 });
    articulatingPaper.rotation.x = -Math.PI / 2;

    // Two articulating-paper marks on the placed sealant, found by looking.
    const highSpotMesial = ball(sealantResin, 0.006, -0.012, 0.032, 0.006, 0xd8232a, { emissive: 0xd8232a, ei: 0.8, rough: 0.5 });
    reg2(highSpotMesial, "high-spot-mesial");
    const highSpotDistal = ball(sealantResin, 0.006, 0.012, 0.032, -0.006, 0xd8232a, { emissive: 0xd8232a, ei: 0.8, rough: 0.5 });
    reg2(highSpotDistal, "high-spot-distal");

    // Curing light on its own holder, and the unshielded second unit.
    const curingLight = group(sealCart, -0.2, 0.42, 0.1, -0.4);
    cyl(curingLight, 0.02, 0.025, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.4, seg: 12 });
    const lightTip = cyl(curingLight, 0.012, 0.014, 0.05, 0, 0.09, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.4, rough: 0.3, seg: 10 });
    const shieldRing = torus(curingLight, 0.016, 0.004, 0, 0.115, 0, 0xd8342a, { rough: 0.4, seg: 6, seg2: 14 });
    reg2(curingLight, "curing-light");
    const backupLight = group(sealCart, 0.24, 0.42, -0.14, 0.6);
    cyl(backupLight, 0.02, 0.025, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.4, seg: 12 });
    cyl(backupLight, 0.012, 0.014, 0.05, 0, 0.09, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.4, rough: 0.3, seg: 10 });
    torus(backupLight, 0.016, 0.004, 0, 0.115, 0, 0xd8342a, { rough: 0.4, seg: 6, seg2: 14 });
    reg2(backupLight, "backup-curing-light");
    // A third light on the counter with no shield at all — the trap.
    const unshieldedLight = group(g, 1.6, 0, 0.6, -0.5);
    cyl(unshieldedLight, 0.02, 0.025, 0.14, 0, 0.5, 0, 0x2b3138, { rough: 0.4, metal: 0.4, seg: 12 });
    cyl(unshieldedLight, 0.012, 0.014, 0.05, 0, 0.59, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.6, rough: 0.3, seg: 10 });
    reg2(unshieldedLight, "unshielded-curing-light");

    // Protective glasses on a small stand near the tray.
    const glasses = group(g, 0.6, 0, -0.15);
    torus(glasses, 0.032, 0.006, -0.04, 0.4, 0, 0xd8a23b, { rough: 0.35, opacity: 0.55 });
    torus(glasses, 0.032, 0.006, 0.04, 0.4, 0, 0xd8a23b, { rough: 0.35, opacity: 0.55 });
    box(glasses, 0.04, 0.008, 0.01, 0, 0.4, 0, 0x2b3138, { rough: 0.4 });
    reg2(glasses, "protective-glasses");

    // ------------------------------------------------------- side cabinet & charts
    const cabinet = group(g, -2.6, 0, -1.4, 0.4);
    slab(cabinet, 0.9, 0.9, 0.5, 0, 0.45, 0, FLS_CABINET, { radius: 0.02, rough: 0.45, metal: 0.1 });
    const riskChart = holoPanel(g, 0.52, 0.36, -2.4, 1.5, -1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,14,8,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2955e"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6d9c2";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CARIES RISK — AGE 7", w * 0.06, h * 0.16);
      ctx.fillStyle = "#fdf1e6";
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Risk: moderate", "Varnish: indicated", "Sealants: 1st molars"]
        .forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.38 + i * h * 0.16));
    }, { ry: 0.5, accent: FLS_ACCENT });
    reg2(riskChart, "risk-chart");

    const varnishTube = group(cabinet, 0.25, 0.5, 0.15);
    cyl(varnishTube, 0.02, 0.025, 0.14, 0, 0, 0, 0xd8a23b, { rough: 0.4, metal: 0.2, seg: 12 });
    reg2(varnishTube, "varnish-tube");
    const unmeasuredVarnish = group(cabinet, -0.2, 0.5, 0.15);
    cyl(unmeasuredVarnish, 0.022, 0.028, 0.16, 0, 0, 0, 0xf2ae14, { rough: 0.35, metal: 0.2, seg: 12 });
    ball(unmeasuredVarnish, 0.006, 0, 0.09, 0, 0xd8a23b, { rough: 0.4 });
    reg2(unmeasuredVarnish, "unmeasured-varnish");

    const recallChart = decal(cabinet, 0.3, 0.4, 0, 0.55, 0.26,
      paperFace("RECALL — SEALANTS", ["Tooth #3: --", "Tooth #14: --", "Next: 6 mo"]));
    reg2(recallChart, "recall-chart");

    const handout = decal(cabinet, 0.26, 0.34, -0.3, 0.55, 0.26,
      paperFace("AFTER YOUR VISIT", ["No hard/crunchy food 4h", "Skip brushing tonight", "Sealants: normal bite ok"]));
    reg2(handout, "parent-handout");

    // A bank of labelled supply drawers, and stacked jars of consumables —
    // the ordinary furniture of a school and public-health outreach bay.
    const drawerUnit = group(g, -2.6, 0, -0.7, 0.4);
    slab(drawerUnit, 0.7, 0.5, 0.4, 0, 0.25, 0, FLS_CABINET, { radius: 0.02, rough: 0.5, metal: 0.1 });
    for (let i = 0; i < 4; i++) {
      const dz = -0.26 + i * 0.17;
      box(drawerUnit, 0.62, 0.13, 0.02, 0, 0.25, 0.21, 0xd8dde0, { rough: 0.4 });
      cyl(drawerUnit, 0.006, 0.006, 0.08, dz, 0.25, 0.225, 0x8b929a, { rough: 0.3, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    }
    const jars = group(drawerUnit, 0, 0.51, 0);
    const JAR_LABELS = ["COTTON", "VARNISH", "SEALANT", "BIBS", "STICKERS"];
    JAR_LABELS.forEach((label, i) => {
      const jx = -0.26 + i * 0.13;
      cyl(jars, 0.045, 0.045, 0.12, jx, 0.06, 0, 0xdfe8ee, { rough: 0.1, opacity: 0.5, seg: 14 });
      cyl(jars, 0.046, 0.046, 0.015, jx, 0.128, 0, 0x2b3138, { rough: 0.5, seg: 14 });
      decal(jars, 0.07, 0.03, jx, 0.06, 0.0451, signFace(label, { bg: "#dfe8ee", fg: "#1d3b4a", accent: "#f2955e", scale: 0.4 }), { px: 96 });
    });

    // Wall clock, and a small hand-washing sink for the outreach bay.
    const clock = group(cabinet, 0.3, 1.05, -0.02);
    cyl(clock, 0.08, 0.08, 0.018, 0, 0, 0, 0xf2f5f7, { rough: 0.4, seg: 20 }).rotation.x = Math.PI / 2;
    box(clock, 0.005, 0.05, 0.006, 0, 0.018, 0.01, 0x2b3138, { rough: 0.5 });
    const sink = group(g, 2.9, 0, -1.7, -Math.PI / 2);
    slab(sink, 0.45, 0.13, 0.36, 0, 0.8, 0, 0xd8dde0, { radius: 0.03, rough: 0.35, metal: 0.15 });
    box(sink, 0.38, 0.1, 0.28, 0, 0.76, 0, 0xc4ccd2, { rough: 0.3, metal: 0.1 });
    cyl(sink, 0.01, 0.01, 0.18, 0, 0.94, -0.1, FLS_STEEL, { rough: 0.2, metal: 0.9, seg: 10 });
    cyl(sink, 0.01, 0.01, 0.09, 0, 1.02, -0.02, FLS_STEEL, { rough: 0.2, metal: 0.9, seg: 10 }).rotation.x = Math.PI / 2.4;
    for (const sx of [-1, 1]) cyl(sink, 0.01, 0.012, 0.045, sx * 0.05, 0.93, -0.11, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 10 });

    // A small waiting-side toy box, because this is a child's chair.
    const toyBox = group(g, 2.4, 0, 1.3, -0.3);
    box(toyBox, 0.32, 0.22, 0.26, 0, 0.11, 0, 0xf2955e, { rough: 0.7 });
    for (let i = 0; i < 3; i++) {
      ball(toyBox, 0.03, -0.08 + i * 0.08, 0.24, 0, [0xe8c15a, 0x5a8fb0, 0x59c97b][i], { rough: 0.6 });
    }

    // A parent's waiting chair, a "great job" sticker chart, and the crate
    // this outreach programme's supplies travel in between schools.
    const waitChair = group(g, -2.4, 0, 1.0, 0.6);
    slab(waitChair, 0.44, 0.08, 0.42, 0, 0.42, 0, 0x445868, { radius: 0.03, rough: 0.6 });
    slab(waitChair, 0.4, 0.5, 0.08, 0, 0.68, -0.18, 0x445868, { radius: 0.03, rough: 0.6 });
    for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      cyl(waitChair, 0.018, 0.018, 0.42, dx, 0.19, dz, FLS_STEEL, { rough: 0.3, metal: 0.7, seg: 8 });
    }
    const stickerChart = decal(g, 0.4, 0.5, -3.9, 1.3, 1.6,
      paperFace("STAR CHART", ["Brushed 2x today", "Flossed today", "Great smile!"], { bg: "#fdf1e6" }));
    stickerChart.rotation.y = Math.PI / 2;
    const crate = group(g, 2.9, 0, -0.4, -0.4);
    box(crate, 0.4, 0.28, 0.3, 0, 0.14, 0, 0x5a8fb0, { rough: 0.7 });
    for (let i = 0; i < 3; i++) box(crate, 0.4, 0.02, 0.02, 0, 0.05 + i * 0.09, 0.151, 0x3a5a70, { rough: 0.6, cast: false });
    decal(crate, 0.3, 0.08, 0, 0.24, 0.151, signFace("OUTREACH", { bg: "#3a5a70", accent: "#f2955e", scale: 0.5 }), { px: 128 });
    for (let i = 0; i < 4; i++) {
      box(crate, 0.08, 0.05, 0.08, -0.13 + i * 0.09, 0.31, 0, [0xe8c15a, 0x5a8fb0, 0x59c97b, 0xf2955e][i], { rough: 0.6 });
    }

    const parent = standingFigure(g, -3.3, 0.6, { ry: -1.0, cloth: 0x445868, skin: 0xb98a63 });

    const key = new THREE.DirectionalLight(0xf6fbff, 0.8);
    key.position.set(-2, 4.5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xeaf6fa, 0x445058, 0.9));

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -0.6),

      onStepComplete(step) {
        if (step.id === "varnish-paint") {
          varnishBrush.children[0].material = mat(0xf2c98a, { rough: 0.4 });
        }
        if (step.id === "etch-apply") etchGel.children[0].material = mat(0xf2c98a, { rough: 0.3, opacity: 0.7 });
        if (step.id === "sealant-place") sealantResin.children[0].material = mat(0xdff2ea, { rough: 0.25, opacity: 0.6 });
        if (step.id === "eye-protection") { glasses.position.y = 0.1; }
      },

      onInterrupt(it) {
        if (it.id === "saliva-contamination") {
          sealantResin.children[0].material = mat(0xd8c9a0, { rough: 0.6 });
        }
        if (it.id === "radiometer-low") {
          lightTip.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6 });
          shieldRing.material = mat(0x8b2a24, { rough: 0.5 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "saliva-contamination") sealantResin.children[0].material = mat(0xeef2ee, { rough: 0.3, opacity: 0.85 });
        if (it.id === "radiometer-low") {
          lightTip.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.4 });
          shieldRing.material = mat(0xd8342a, { rough: 0.4 });
        }
      },

      animate(t, dt, session) {
        if (session?.holding && session.step?.id === "cure-light") {
          lightTip.material.emissiveIntensity = 1.4 + Math.sin(t * 30) * 0.3;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "varnish-dose") {
          const ml = (gg.t * 0.5).toFixed(2);
          repaint(riskChart.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,14,8,0.92)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = gg.t >= 0.28 && gg.t <= 0.48 ? "#59c97b" : "#f0645b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#fdf1e6";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(`${ml} mL`, w / 2, h * 0.5);
          });
        }
      },
    };
  },
};
