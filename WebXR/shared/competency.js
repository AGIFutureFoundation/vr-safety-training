// Competency and proof of training — the sober tier above the badges.
//
// A station badge (gamify.js) says a learner played a station well. That is
// motivation, and it is not what a hall, a JATC or a safety director signs.
// What they sign is a *competency*: a named thing a journeyman can do, tied
// to the standards a body actually publishes, demonstrated by passing named
// stations under one stated rule that never bends.
//
// That rule is MASTERY below. It is stricter than the pass rule in
// records.js on purpose: a pass is "you got through it", mastery is "you got
// through it the way the standard describes". Nothing else earns a
// competency — there is no partial credit, no curve, and no second rule for
// a learner who nearly made it. A near miss is reported with the reason it
// did not count (see transcript()), because a learner who cannot see why a
// run failed learns nothing from failing it.
//
// This module is pure data and pure functions over the training record. It
// touches no DOM and no storage, so tools/check_competency.mjs runs the
// whole layer in Node. The only import is the scoring constants from
// game.js, so the rubric a learner reads is the rubric the engine used
// rather than a second copy of it that can drift.

import { STEP_POINTS, WRONG_STEP_PENALTY, HAZARD_PENALTY, MAX_COMBO, INTERRUPT_POINTS, INTERRUPT_SPEED_BONUS } from "./game.js";

/**
 * The mastery rule, stated once. Every status, badge, transcript row and
 * export below reads these numbers rather than repeating them, so the rule a
 * learner is shown and the rule the code applies cannot disagree.
 *
 * - `minStars` 2: the engine's 2-star band is "at most one correction and
 *   inside 1.5x par" (game.js finish()), so stars already encode most of it.
 * - `maxHazardHits` 0: an unsafe action is disqualifying, full stop. A wrong
 *   or unanswered interruption counts as one (game.js resolveInterrupt()).
 * - every interruption answered: the procedure and noticing the alarm are
 *   two different competencies and this layer demands both.
 * - `parMultiple` 1.5: the same multiple the 2-star band uses.
 */
export const MASTERY = {
  id: "mastery-v1",
  minStars: 2,
  maxHazardHits: 0,
  answerEveryInterruption: true,
  parMultiple: 1.5,
  text: "A run demonstrates mastery when it earns two or more stars, records zero unsafe actions, " +
    "answers every interruption it was given, and finishes within 1.5 times the station's par time. " +
    "One mastery run on enough of a competency's stations earns \"demonstrated\"; mastery runs on " +
    "three different days earn \"consistent\". No other rule earns a competency.",
};

/** One clean run demonstrates; mastery on this many different days is consistent. */
const CONSISTENT_DAYS = 3;

/**
 * The scoring rubric, read straight from game.js's own constants so a
 * learner sees why a run scored what it scored. Shown in the Proof tab and
 * repeated in docs/proof-of-training.md.
 */
export const RUBRIC = {
  stepPoints: STEP_POINTS,
  wrongStepPenalty: WRONG_STEP_PENALTY,
  hazardPenalty: HAZARD_PENALTY,
  maxCombo: MAX_COMBO,
  interruptPoints: INTERRUPT_POINTS,
  interruptSpeedBonus: INTERRUPT_SPEED_BONUS,
  timeBonusPerSecond: 2,
  lines: [
    ["Score", `Each correct step in the procedure is worth ${STEP_POINTS} points times the current combo. A wrong control costs ${WRONG_STEP_PENALTY}; touching a registered hazard costs ${HAZARD_PENALTY} and is recorded as an unsafe action. Finishing under par adds 2 points per second saved.`],
    ["Combo", `Correct steps in a row multiply the next step: the multiplier is 1 + 0.1 per step in the streak, capped at ${MAX_COMBO.toFixed(1)}x. Any wrong control resets the streak to zero. Combo raises the score; it never changes the star band.`],
    ["Interruptions", `An alarm that fires mid-procedure is worth ${INTERRUPT_POINTS} points, plus up to ${INTERRUPT_SPEED_BONUS} more the faster it is answered. A wrong answer and no answer are treated the same way: the condition is still there, so both cost ${HAZARD_PENALTY} and count as an unsafe action.`],
    ["Stars", "3 stars: no corrections at all and finished inside par. 2 stars: at most one correction and finished inside 1.5x par. 1 star: anything else. Stars, not score, decide whether a run counts."],
    ["Why a high score can still fail", "Score rewards speed and streaks. Mastery asks a different question — was it safe and complete — so a fast run with one unsafe action scores well and counts for nothing."],
  ],
};

// ------------------------------------------------------------------ standards
//
// Standards live once, in tools/standards.json, with id/body/title/scope/
// source (see tools/briefs/proof-brief.md). That file is another team's work
// and is not in this tree yet, so the ids below are the slug of the body and
// title — the same id that registry will mint for the same standard — and
// this table carries the body and title so the Proof tab and the transcript
// can name a standard rather than print a slug. When standards.json lands,
// tools/check_competency.mjs starts cross-checking every id against it and
// this table becomes the fallback for anything not yet registered.
//
// `source` follows the brief's rule: "verified" only where the citation form
// is one we are sure of, "unverified" for a programme or practice named by
// body and title without a clause number. No clause number here is invented.

/** slug(body + title) — the id form tools/standards.json mints. */
export function standardSlug(body, title) {
  return `${body} ${title}`.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const S = (id, body, title, scope, source = "verified") => ({ id, body, title, scope, source });

/**
 * The standards the competencies below cite. Keyed by id for lookup; the
 * short ids are stable hand-written keys, and `slug` on each entry is the
 * body+title slug the shared registry will use, so the two can be joined.
 */
export const STANDARDS = Object.fromEntries([
  S("osha-1910-147", "OSHA", "29 CFR 1910.147 The control of hazardous energy (lockout/tagout)", ["Energy & Power", "Manufacturing", "Food Service"]),
  S("osha-1910-146", "OSHA", "29 CFR 1910.146 Permit-required confined spaces", ["Water & Environmental", "Manufacturing"]),
  S("osha-1910-134", "OSHA", "29 CFR 1910.134 Respiratory protection", ["Hazmat & Environmental", "Emergency Response"]),
  S("osha-1910-1200", "OSHA", "29 CFR 1910.1200 Hazard communication", ["Hospitality", "Health & Clinical", "Garment Trades"]),
  S("hipaa-privacy-rule", "HHS", "HIPAA Privacy and Security Rules (45 CFR Parts 160 and 164)", ["Dental & Oral Health", "Emergency Services", "Community Environmental Justice", "Trade Skills Simulator"]),
  S("osha-1910-1030", "OSHA", "29 CFR 1910.1030 Bloodborne pathogens", ["Health & Clinical", "Hospitality"]),
  S("osha-1910-120", "OSHA", "29 CFR 1910.120 Hazardous waste operations and emergency response (HAZWOPER)", ["Hazmat & Environmental"]),
  S("osha-1910-252", "OSHA", "29 CFR 1910.252 Welding, cutting and brazing — general requirements", ["Metal Trades"]),
  S("osha-1910-212", "OSHA", "29 CFR 1910.212 General requirements for all machines", ["Manufacturing", "Garment Trades"]),
  S("osha-1910-178", "OSHA", "29 CFR 1910.178 Powered industrial trucks", ["Transit & Logistics"]),
  S("osha-1910-151", "OSHA", "29 CFR 1910.151 Medical services and first aid", ["Emergency Response"]),
  S("osha-1910-272", "OSHA", "29 CFR 1910.272 Grain handling facilities", ["Manufacturing"]),
  S("osha-1915", "OSHA", "29 CFR 1915 Subpart B Confined and enclosed spaces in shipyard employment", ["Maritime"]),
  S("osha-1917", "OSHA", "29 CFR 1917 Marine terminals", ["Maritime"]),
  S("osha-1918", "OSHA", "29 CFR 1918 Safety and health regulations for longshoring", ["Maritime"]),
  S("osha-1926-subpart-m", "OSHA", "29 CFR 1926 Subpart M Fall protection", ["Construction", "Telecom"]),
  S("osha-1926-subpart-l", "OSHA", "29 CFR 1926 Subpart L Scaffolds", ["Construction"]),
  S("osha-1926-subpart-p", "OSHA", "29 CFR 1926 Subpart P Excavations", ["Construction", "Water & Environmental"]),
  S("osha-1926-subpart-q", "OSHA", "29 CFR 1926 Subpart Q Concrete and masonry construction", ["Construction"]),
  S("osha-1926-subpart-r", "OSHA", "29 CFR 1926 Subpart R Steel erection", ["Construction"]),
  S("osha-1926-subpart-cc", "OSHA", "29 CFR 1926 Subpart CC Cranes and derricks in construction", ["Construction", "Rigging"]),
  S("osha-1926-62", "OSHA", "29 CFR 1926.62 Lead in construction", ["Construction"]),
  S("osha-1926-1101", "OSHA", "29 CFR 1926.1101 Asbestos in construction", ["Hazmat & Environmental"]),
  S("osha-1926-1153", "OSHA", "29 CFR 1926.1153 Respirable crystalline silica", ["Construction"]),
  S("osha-1926-20-b-2", "OSHA", "29 CFR 1926.20(b)(2) Competent person accident prevention responsibilities", ["Construction"]),
  S("nfpa-70e", "NFPA", "70E Standard for Electrical Safety in the Workplace", ["Energy & Power"]),
  S("nfpa-70-art-690", "NFPA", "70 National Electrical Code Article 690 Solar photovoltaic systems", ["Energy & Power"]),
  S("nfpa-51b", "NFPA", "51B Standard for Fire Prevention During Welding, Cutting, and Other Hot Work", ["Metal Trades"]),
  S("nfpa-25", "NFPA", "25 Standard for the Inspection, Testing, and Maintenance of Water-Based Fire Protection Systems", ["Building Systems"]),
  S("nfpa-96", "NFPA", "96 Standard for Ventilation Control and Fire Protection of Commercial Cooking Operations", ["Food Service"]),
  S("nfpa-470", "NFPA", "470 Hazardous Materials/Weapons of Mass Destruction Standard for Responders", ["Hazmat & Environmental"]),
  S("nfpa-855", "NFPA", "855 Standard for the Installation of Stationary Energy Storage Systems", ["Energy & Power"]),
  S("nfpa-1006", "NFPA", "1006 Standard for Technical Rescue Personnel Professional Qualifications", ["Emergency Response"]),
  S("nfpa-1500", "NFPA", "1500 Standard on Fire Department Occupational Safety, Health, and Wellness Program", ["Emergency Response"]),
  S("nfpa-1584", "NFPA", "1584 Standard on the Rehabilitation Process for Members During Emergency Operations and Training Exercises", ["Emergency Response"]),
  S("ansi-z359", "ANSI/ASSP", "Z359 Fall Protection Code", ["Construction", "Telecom"]),
  S("ansi-z49-1", "ANSI/AWS", "Z49.1 Safety in Welding, Cutting, and Allied Processes", ["Metal Trades"]),
  S("ansi-a10-9", "ANSI/ASSP", "A10.9 Safety Requirements for Concrete and Masonry Work", ["Construction"]),
  S("asme-b30-16", "ASME", "B30 Safety Standard for Cableways, Cranes, Derricks, Hoists, Hooks, Jacks and Slings", ["Rigging"]),
  S("asme-bpvc", "ASME", "Boiler and Pressure Vessel Code", ["Building Systems"]),
  S("aws-d1-5", "AWS", "D1.5 Bridge Welding Code", ["Construction"]),
  S("ansi-e1-4", "ESTA/ANSI", "E1.4-1 Manual Counterweight Rigging Systems", ["Live Events"]),
  S("ashrae-188", "ASHRAE", "Standard 188 Legionellosis: Risk Management for Building Water Systems", ["Building Systems"]),
  S("nccco-certification", "NCCCO", "Certified Crane Operator programme", ["Rigging"], "unverified"),
  S("etcp-certification", "ETCP", "Entertainment Technician Certification Program — Certified Rigger", ["Live Events", "Rigging"], "unverified"),
  S("niosh-ergonomics", "NIOSH", "Ergonomics guidance for seated repetitive work", ["Garment Trades"], "unverified"),
  S("samhsa-trauma-informed", "SAMHSA", "Concept of Trauma and Guidance for a Trauma-Informed Approach", ["Emergency Response", "Health & Clinical"]),
  S("pfa-field-guide", "WHO and NCTSN", "Psychological First Aid field guidance — look, listen, link", ["Emergency Response"]),
  S("nims-ics", "FEMA", "NIMS/ICS foundation, IS-100 and IS-700", ["Emergency Response"]),
  S("hhs-45-cfr-46", "HHS", "45 CFR 46 Protection of human subjects — informed consent", ["Community Science"]),
  S("cdc-guidance", "CDC", "Guidelines for Infection Control in Dental Health-Care Settings", ["Health & Clinical"]),
  S("fda-food-code", "FDA", "Food Code, as adopted in the California Retail Food Code", ["Food Service"]),
  S("epa-40-cfr-58", "EPA", "40 CFR 58 Ambient air quality surveillance", ["Air Quality"]),
  S("rcra-40-cfr-262", "EPA", "40 CFR 262 Standards applicable to generators of hazardous waste", ["Hazmat & Environmental"]),
  S("epa-40-cfr-441", "EPA", "40 CFR 441 Dental office point source category — amalgam separators", ["Health & Clinical"]),
  S("epa-method-9", "EPA", "Method 9 Visual determination of the opacity of emissions (40 CFR 60 Appendix A)", ["Air Quality"]),
  S("marssim", "Multi-Agency (NRC, EPA, DOE, DOD)", "MARSSIM Multi-Agency Radiation Survey and Site Investigation Manual", ["Hazmat & Environmental"]),
  S("nrc-10-cfr-20", "NRC", "10 CFR 20 Standards for protection against radiation", ["Hazmat & Environmental"]),
  S("usace-section-404", "US Army Corps of Engineers", "Clean Water Act Section 404 permit programme", ["Water & Environmental"]),
  S("uscg-33-cfr-156-150", "USCG", "33 CFR 156 Oil and hazardous material transfer operations", ["Maritime"]),
  S("imo-csm", "IMO", "Cargo Securing Manual requirements", ["Maritime"], "unverified"),
  S("carb-at-berth", "CARB", "At-Berth Regulation for ocean-going vessels", ["Maritime"], "unverified"),
  S("fra-49-cfr-214", "FRA", "49 CFR 214 Subpart C Roadway worker protection", ["Transit & Logistics"]),
  S("faa-14-cfr-139-303", "FAA", "14 CFR 139 Certification of airports", ["Transit & Logistics"]),
  S("phmsa-49-cfr-192", "PHMSA", "49 CFR 192 Minimum federal safety standards for gas pipelines", ["Energy & Power"]),
  S("cal-osha-3345", "Cal/OSHA", "8 CCR 3345 Hotel housekeeping musculoskeletal injury prevention", ["Hospitality"]),
  S("calosha-8-ccr-3342", "Cal/OSHA", "8 CCR 3342 Workplace violence prevention plan", ["Hospitality", "Food Service"]),
  S("calosha-8-ccr-5141-1", "Cal/OSHA", "8 CCR 5141.1 Protection from wildfire smoke", ["Air Quality"]),
  S("abc-rbs-training", "California ABC", "Responsible Beverage Service Training Program Act", ["Food Service"]),
].map((s) => [s.id, { ...s, slug: standardSlug(s.body, s.title) }]));

/** The body and title behind a standard id, or a placeholder for an unknown one. */
export function standard(id) {
  return STANDARDS[id] ?? { id, body: "Unregistered", title: id, scope: [], source: "unverified", slug: id };
}

// --------------------------------------------------------------- competencies
//
// Two tiers, one list. A `programme` competency mirrors a block in
// smartcity/js/curricula.js one-for-one — same id, same stations — because a
// hall that buys the block wants one line on the transcript for it, and
// check_competency.mjs fails the build if the two ever drift apart. A `core`
// competency cuts across programmes: fall protection is fall protection
// whether it was earned on a tower, a scaffold or a bridge cable, and a
// worker who can prove it should be able to prove it once.
//
// `require` is how many of the named stations need a mastery run. Programme
// competencies ask for half their stations, capped at six, because a
// twenty-six station survey block should not need twenty-six mastery runs to
// say something true. Core competencies name their number outright.

/** One competency per training programme in smartcity/js/curricula.js — same
 * id, same stations, kept in step by tools/check_competency.mjs. */
export const PROGRAMME_COMPETENCIES = [
  {
    id: "electrical-first-period",
    title: "Isolate, lock out and prove dead before working an energised circuit",
    kind: "programme",
    standards: ["nfpa-70e", "osha-1910-147", "osha-1926-20-b-2"],
    stations: [
      "electrical", "charge-point", "substation-switching", "line-truck",
      "battery-yard", "motor-control-center", "arc-flash-label-study", "temporary-site-power"
    ],
    require: 4,
  },
  {
    id: "confined-space",
    title: "Enter, attend and rescue from a permit-required confined space",
    kind: "programme",
    standards: ["osha-1910-146", "nfpa-1006", "osha-1910-134"],
    stations: [
      "valve-vault", "lift-station", "chlorine-room", "confined-rescue"
    ],
    require: 2,
  },
  {
    id: "fall-protection",
    title: "Work at height on a fall-arrest system the worker has proven",
    kind: "programme",
    standards: ["osha-1926-subpart-m", "osha-1926-subpart-l", "ansi-z359"],
    stations: [
      "scaffold-erection", "steel-erector", "tower-climb", "microwave-backhaul",
      "aerial-ladder"
    ],
    require: 3,
  },
  {
    id: "hazmat-environmental",
    title: "Contain, decontaminate and monitor a hazardous-materials release",
    kind: "programme",
    standards: ["osha-1910-120", "nfpa-470", "osha-1910-134"],
    stations: [
      "hunters-point", "abatement-chamber", "decon-line", "air-monitor",
      "stormwater-outfall", "pressure-washer"
    ],
    require: 3,
  },
  {
    id: "rigging-lifting",
    title: "Rig and land a load to an engineered lift plan",
    kind: "programme",
    standards: ["asme-b30-16", "osha-1926-subpart-cc", "nccco-certification", "etcp-certification"],
    stations: [
      "crane-yard", "dock-crane", "chain-hoist", "rigging-loft",
      "fly-system"
    ],
    require: 3,
  },
  {
    id: "stationary-engineer",
    title: "Operate and prove a building's boiler, chiller and fire-protection plant",
    kind: "programme",
    standards: ["asme-bpvc", "ashrae-188", "nfpa-25"],
    stations: [
      "boiler-room", "chiller-plant", "cooling-tower", "fire-pump",
      "elevator-pit"
    ],
    require: 3,
  },
  {
    id: "port-operations",
    title: "Work a marine terminal transfer, mooring and lashing watch",
    kind: "programme",
    standards: ["uscg-33-cfr-156-150", "imo-csm", "osha-1917"],
    stations: [
      "mooring-line", "bunkering-watch", "container-lashing", "dock-crane"
    ],
    require: 2,
  },
  {
    id: "transit-ramp",
    title: "Take access and move equipment on live rail and airfield operations",
    kind: "programme",
    standards: ["fra-49-cfr-214", "faa-14-cfr-139-303", "osha-1910-178"],
    stations: [
      "track-access", "signal-cabinet", "bus-depot-lift", "airport-ramp",
      "forklift-dock"
    ],
    require: 3,
  },
  {
    id: "energy-transition",
    title: "Commission and isolate photovoltaic, storage and charging systems",
    kind: "programme",
    standards: ["nfpa-70e", "nfpa-855", "nfpa-70-art-690"],
    stations: [
      "solar-deck", "battery-yard", "charge-point", "substation-switching",
      "cell-site-battery"
    ],
    require: 3,
  },
  {
    id: "live-events",
    title: "Rig and power a performance space to entertainment practice",
    kind: "programme",
    standards: ["etcp-certification", "ansi-e1-4", "nfpa-70e"],
    stations: [
      "stage-power", "fly-system", "rigging-loft", "chain-hoist"
    ],
    require: 2,
  },
  {
    id: "hunters-point-bay-restoration",
    title: "Work a radiological and chemical cleanup inside the fence and at the water's edge",
    kind: "programme",
    standards: ["osha-1910-120", "marssim", "nrc-10-cfr-20", "rcra-40-cfr-262", "usace-section-404"],
    stations: [
      "hunters-point", "rad-survey", "building-rad-scan", "air-monitor",
      "soil-loadout", "haul-road-dust", "pcb-equipment-removal", "transite-pipe-removal",
      "ust-removal", "decon-line", "sampling-well", "well-install",
      "pump-and-treat", "vapor-mitigation", "isco-injection", "stormwater-outfall",
      "bioswale-build", "dredge-barge", "oyster-reef-monitoring", "marsh-transect-survey",
      "sediment-cap", "creosote-pile-removal", "tide-gate", "living-shoreline",
      "spartina-removal", "eelgrass-transplant"
    ],
    require: 6,
  },
  {
    id: "culinary-kitchen",
    title: "Run a commercial kitchen to food-safety, machine-guarding and hood standards",
    kind: "programme",
    standards: ["fda-food-code", "nfpa-96", "osha-1910-147"],
    stations: [
      "kitchen", "knife-skills", "slicer-lockout", "bakery-mixer",
      "fryer-oil-change", "hood-suppression", "kitchen-gas-shutoff", "walk-in-cooler",
      "receiving-dock-food", "prep-cooling", "dish-pit", "grease-trap",
      "allergen-control", "banquet-hot-hold", "cafeteria-serving", "grill-line-burns"
    ],
    require: 6,
  },
  {
    id: "dental-hygiene-unspoken-smiles",
    title: "Deliver chairside hygiene under dental infection-control practice",
    kind: "programme",
    standards: ["cdc-guidance", "osha-1910-1030", "osha-1910-1200", "epa-40-cfr-441"],
    stations: [
      "phlebotomy", "operatory-turnover", "instrument-reprocessing", "sharps-exposure-response",
      "patient-intake-screening", "radiograph-safety", "periodontal-charting", "ultrasonic-scaling",
      "aerosol-management", "fluoride-and-sealants", "nitrous-oxide-monitoring", "chairside-emergency",
      "amalgam-waste-handling", "mobile-dental-outreach", "pediatric-visit", "oral-cancer-screening"
    ],
    require: 6,
  },
  {
    id: "dental-careers-unspoken-smiles",
    title: "Work a dental clinic's assisting, radiography, sterilisation, laboratory and front-office roles under the practice act",
    kind: "programme",
    standards: ["cdc-guidance", "osha-1910-1030", "osha-1910-1200", "hipaa-privacy-rule"],
    stations: [
      "patient-intake-screening", "dental-careers-pathway", "four-handed-dentistry", "dental-radiography-fmx",
      "sterilisation-technician-cycle", "dental-lab-bench", "orthodontic-assisting", "oral-surgery-assisting",
      "front-office-treatment-coordination", "infection-control-audit", "school-screening-outreach", "implant-surgery-assisting",
      "endodontic-assisting", "denture-delivery-and-adjustment", "special-needs-and-geriatric-dentistry", "teledentistry-and-triage"
    ],
    require: 6,
  },
  {
    id: "bay-area-union-edition",
    title: "Work the Bay Area's sheet metal, bridge, port maintenance and marine trades to their unions' standards",
    kind: "programme",
    standards: ["osha-1926-subpart-r", "osha-1926-subpart-m", "osha-1910-134"],
    stations: [
      "press-brake", "steel-erector", "container-lashing", "mooring-line"
    ],
    require: 2,
  },
  {
    id: "job-readiness-edition",
    title: "Get and keep a job: warehouse and Class A driving, apprenticeship entry, financial footing and wellness",
    kind: "programme",
    standards: ["osha-1910-178", "samhsa-trauma-informed"],
    stations: [
      "forklift-dock", "trades-lineage-briefing", "wellness-shift-work-sleep-and-stress", "wellness-peer-support-conversation",
      "wellness-substance-use-and-the-job", "wellness-asking-for-help-and-resources"
    ],
    require: 3,
  },
  {
    id: "civic-leadership-and-ei",
    title: "Lead in public: listen, decide, own the call, and run a meeting people trust",
    kind: "programme",
    standards: ["samhsa-trauma-informed", "nims-ics"],
    stations: [
      "public-comment-prep"
    ],
    require: 1,
  },
  {
    id: "property-management",
    title: "Run a building zone by zone under the fire, housing and safety codes that govern it",
    kind: "programme",
    standards: ["osha-1910-147", "nfpa-25"],
    stations: [
      "boiler-room"
    ],
    require: 1,
  },
  {
    id: "outbreak-response-who",
    title: "Respond to an outbreak under WHO infection-prevention and outbreak-communication practice",
    kind: "programme",
    standards: ["cdc-guidance", "osha-1910-1030", "osha-1910-134"],
    stations: [
      "decon-line"
    ],
    require: 1,
  },
  {
    id: "bartending-course",
    title: "Serve alcohol responsibly and handle the room behind the bar",
    kind: "programme",
    standards: ["abc-rbs-training", "calosha-8-ccr-3342", "fda-food-code"],
    stations: [
      "kitchen", "bar-well-setup", "id-check-underage", "jigger-pour-spec",
      "cutoff-overservice", "spiked-drink-response", "patron-deescalation", "keg-cellar-co2",
      "ice-well-breakage", "draught-line-cleaning", "till-drop-robbery", "allergen-cocktail",
      "last-call-lockup", "tip-pool-labor", "wvpp-panic-button", "rbs-service-capstone"
    ],
    require: 6,
  },
  {
    id: "hunters-point-can-we-live",
    title: "Run community air, soil and biomonitoring science to a defensible record",
    kind: "programme",
    standards: ["hhs-45-cfr-46", "osha-1910-120", "osha-1910-134", "calosha-8-ccr-5141-1", "epa-40-cfr-58"],
    stations: [
      "can-we-live-story", "air-sensor-install", "sensor-colocation-check", "air-network-data-qa",
      "odor-complaint-log", "biomonitoring-consent", "sample-kit-shipping", "results-return-visit",
      "smoke-day-outreach", "fenceline-dust-monitor", "haul-route-observation", "met-station-siting",
      "dust-plan-review", "community-soil-split", "garden-soil-screen", "shoreline-sediment-grab",
      "discharge-photo-doc", "rad-meter-basics", "parcel-status-walk", "retest-witnessing",
      "abatement-perimeter-awareness", "hazwoper-site-orientation", "decon-support-laborer", "public-comment-prep",
      "youth-patrol-training", "shelter-in-place-drill"
    ],
    require: 6,
  },
  {
    id: "sewing-garment-trades",
    title: "Operate guarded industrial sewing, cutting and pressing equipment",
    kind: "programme",
    standards: ["osha-1910-212", "osha-1910-147", "osha-1910-1200", "niosh-ergonomics"],
    stations: [
      "salon", "machine-threading-needle", "lockstitch-seam-guard", "serger-overlock",
      "cutting-table-rotary", "pattern-marking-layout", "hem-and-buttonhole", "industrial-press-steam",
      "sewing-ergonomics-shift", "alteration-repair-ticket", "garment-inspection-finish"
    ],
    require: 6,
  },
  {
    id: "bridge-and-structural",
    title: "Inspect, contain and rebuild structural steel and bridge deck work",
    kind: "programme",
    standards: ["osha-1926-subpart-m", "osha-1926-subpart-r", "osha-1926-62", "aws-d1-5", "ansi-z359"],
    stations: [
      "steel-erector", "bridge-cable-inspection", "bridge-lead-containment", "deck-joint-replacement"
    ],
    require: 2,
  },
  {
    id: "hotel-workers",
    title: "Turn rooms and run back-of-house plant under the housekeeping and violence-prevention standards",
    kind: "programme",
    standards: ["cal-osha-3345", "calosha-8-ccr-3342", "osha-1910-1200", "osha-1910-1030"],
    stations: [
      "banquet-hot-hold", "housekeeping-room-turn", "laundry-plant-chemicals", "banquet-setup-lift"
    ],
    require: 2,
  },
  {
    id: "builders-trades",
    title: "Form, shore, set and cut to the engineer's drawings without breathing silica",
    kind: "programme",
    standards: ["osha-1926-subpart-q", "osha-1926-subpart-l", "osha-1926-1153", "ansi-a10-9"],
    stations: [
      "concrete-pour", "formwork-shoring", "mass-timber-panel-set", "masonry-silica-scaffold"
    ],
    require: 2,
  },
  {
    id: "first-responders",
    title: "Take command of a scene and care for the people in it",
    kind: "programme",
    standards: ["nfpa-1500", "nfpa-1584", "nims-ics", "samhsa-trauma-informed", "pfa-field-guide", "osha-1910-134"],
    stations: [
      "triage-point", "structure-fire-sizeup", "firefighter-rehab-sector", "wildland-urban-interface",
      "cardiac-arrest-pit-crew", "overdose-response-naloxone", "ambulance-scene-safety", "crisis-intervention-call",
      "critical-incident-debrief", "traffic-incident-management", "trauma-informed-intake", "crisis-line-shift",
      "home-visit-safety", "shelter-intake-operations", "damage-assessment-team", "psychological-first-aid"
    ],
    require: 6,
  },
  {
    id: "situational-awareness",
    title: "Hold the procedure while the site interrupts you",
    kind: "programme",
    standards: ["osha-1926-20-b-2", "nfpa-70e", "osha-1910-146", "osha-1926-subpart-p", "osha-1926-subpart-cc"],
    stations: [
      "electrical", "welding", "trench-box", "crane-yard",
      "chlorine-room", "confined-rescue", "substation-switching", "airport-ramp",
      "fire-pump", "tower-climb", "elevator-pit", "boiler-room",
      "forklift-dock", "phlebotomy", "transformer-vault", "wind-nacelle",
      "digester-gas", "data-hall", "steel-erector", "triage-point",
      "dock-crane", "press-brake"
    ],
    require: 6,
  },
  {
    id: "ports-maritime-ecology",
    title: "Work the waterfront without putting it in the bay",
    kind: "programme",
    standards: ["osha-1918", "carb-at-berth", "osha-1910-120", "usace-section-404"],
    stations: [
      "dock-crane", "container-lashing", "shore-power-hookup", "bunkering-watch",
      "ballast-water-sampling", "spill-boom-deploy", "pilot-transfer", "mooring-line",
      "reefer-yard-monitoring", "straddle-carrier-ops", "hazmat-container-inspection"
    ],
    require: 6,
  },
  {
    id: "air-quality-monitoring",
    title: "Measure, read and report what a stack and a fence line are emitting",
    kind: "programme",
    standards: ["epa-method-9", "epa-40-cfr-58"],
    stations: [
      "air-monitor", "mobile-air-lab", "opacity-reading", "stack-test",
      "landfill-gas", "soil-loadout"
    ],
    require: 3,
  },
];

/**
 * The cross-programme competencies. These are the things a hall asks about
 * first — "is he tied off, does he lock out, can he wear air" — and they are
 * deliberately answerable from stations in different programmes, because a
 * worker does not learn fall protection once in one block.
 */
export const CORE_COMPETENCIES = [
  {
    id: "core-fall-protection",
    title: "Fall Protection",
    kind: "core",
    standards: ["osha-1926-subpart-m", "osha-1926-subpart-l", "ansi-z359"],
    stations: [
      "scaffold-erection", "steel-erector", "tower-climb", "microwave-backhaul", "aerial-ladder",
      "solar-deck", "bridge-cable-inspection", "mast-climber", "arena-rigging",
      "mass-timber-panel-set", "masonry-silica-scaffold"
    ],
    require: 3,
  },
  {
    id: "core-lockout-tagout",
    title: "Lockout/Tagout and the control of hazardous energy",
    kind: "core",
    standards: ["osha-1910-147", "nfpa-70e", "osha-1910-212"],
    stations: [
      "electrical", "charge-point", "substation-switching", "motor-control-center", "battery-yard",
      "conveyor-guard", "press-brake", "robot-cell", "cnc-cell", "slicer-lockout",
      "bakery-mixer", "lift-station", "boiler-room", "transformer-vault"
    ],
    require: 3,
  },
  {
    id: "core-confined-space",
    title: "Confined Space entry, attendance and atmosphere",
    kind: "core",
    standards: ["osha-1910-146", "nfpa-1006", "osha-1910-134"],
    stations: [
      "valve-vault", "lift-station", "chlorine-room", "confined-rescue", "grease-trap",
      "tank-lining", "digester-gas", "landfill-gas", "grain-bin", "ballast-water-sampling"
    ],
    require: 3,
  },
  {
    id: "core-hot-work",
    title: "Hot Work — permit, watch and the space behind the plate",
    kind: "core",
    standards: ["osha-1910-252", "nfpa-51b", "ansi-z49-1", "osha-1915"],
    stations: [
      "welding", "shipyard-hotwork", "hot-tap", "plumbing", "digester-gas"
    ],
    require: 2,
  },
  {
    id: "core-trenching",
    title: "Trenching and Excavation — protective systems and the competent person",
    kind: "core",
    standards: ["osha-1926-subpart-p", "osha-1926-20-b-2"],
    stations: [
      "trench-box", "ust-removal", "hot-tap", "gas-leak-survey", "bioswale-build"
    ],
    require: 2,
  },
  {
    id: "core-crane-rigging",
    title: "Crane and Rigging — the lift plan, the load and the landing",
    kind: "core",
    standards: ["asme-b30-16", "osha-1926-subpart-cc", "nccco-certification", "etcp-certification"],
    stations: [
      "crane-yard", "dock-crane", "chain-hoist", "rigging-loft", "fly-system",
      "arena-rigging", "container-lashing", "creosote-pile-removal", "dredge-barge",
      "mass-timber-panel-set"
    ],
    require: 3,
  },
  {
    id: "core-respiratory-protection",
    title: "Respiratory Protection — selection, proving and working on air",
    kind: "core",
    standards: ["osha-1910-134", "osha-1926-1153", "calosha-8-ccr-5141-1"],
    stations: [
      "abatement-chamber", "chlorine-room", "hazmat-entry", "bridge-lead-containment", "bridge-blast",
      "tank-lining", "masonry-silica-scaffold", "firefighter-rehab-sector", "structure-fire-sizeup",
      "decon-support-laborer", "hazwoper-site-orientation", "smoke-day-outreach"
    ],
    require: 3,
  },
  {
    id: "core-hazard-communication",
    title: "Hazard Communication — the label, the sheet and the dose",
    kind: "core",
    standards: ["osha-1910-1200", "osha-1910-1030"],
    stations: [
      "laundry-plant-chemicals", "housekeeping-room-turn", "dish-pit", "operatory-turnover",
      "amalgam-waste-handling", "keg-cellar-co2", "draught-line-cleaning", "bar-well-setup",
      "salon", "garment-inspection-finish"
    ],
    require: 3,
  },
  {
    id: "core-emergency-response",
    title: "Emergency Response — the first five minutes",
    kind: "core",
    standards: ["nfpa-1006", "nfpa-1500", "osha-1910-151", "nims-ics"],
    stations: [
      "triage-point", "chairside-emergency", "ev-extrication", "kitchen-gas-shutoff", "confined-rescue",
      "shelter-in-place-drill", "structure-fire-sizeup", "shelter-intake-operations",
      "damage-assessment-team", "hazmat-entry", "wildland-urban-interface"
    ],
    require: 3,
  },
  {
    id: "core-trauma-informed-practice",
    title: "Trauma-informed Practice — consent, dignity and de-escalation",
    kind: "core",
    standards: ["samhsa-trauma-informed", "pfa-field-guide", "hhs-45-cfr-46", "calosha-8-ccr-3342"],
    stations: [
      "psychological-first-aid", "patient-intake-screening", "patron-deescalation",
      "spiked-drink-response", "biomonitoring-consent", "results-return-visit",
      "can-we-live-story", "shelter-intake-operations", "till-drop-robbery"
    ],
    require: 3,
  },
];
/** Every competency, programme tier then core tier. */
export const COMPETENCIES = [...PROGRAMME_COMPETENCIES, ...CORE_COMPETENCIES];

/** Lookup by id. */
export const COMPETENCY_BY_ID = Object.fromEntries(COMPETENCIES.map((c) => [c.id, c]));

// ------------------------------------------------------------------- mastery

/** Whole seconds as m:ss, for a transcript a person reads. */
export function clockText(seconds) {
  const s = Math.max(0, Math.round(seconds | 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** The interruption tally on a record, normalised. Absent means none fired. */
function interrupts(record) {
  const iv = record?.interrupts ?? record?.debrief?.interrupts;
  if (!iv) return null;
  return { answered: iv.answered | 0, wrong: iv.wrong | 0, missed: iv.missed | 0 };
}

/** The par this run is judged against: the argument first, then the record's own. */
function parOf(record, parSeconds) {
  const par = parSeconds ?? record?.parSeconds;
  return typeof par === "number" && par > 0 ? par : null;
}

/**
 * Why a run did not reach mastery, or null when it did. One reason, the first
 * that applies, in the order the rule states them — a learner who touched a
 * live bus and also ran long needs to hear about the live bus.
 *
 * This is the single place the rule is evaluated: isMastery() is this
 * function asking whether there was anything to say, and the transcript
 * prints what it said.
 */
export function masteryShortfall(record, parSeconds) {
  if (!record || typeof record !== "object") return { rule: "record", reason: "No attempt record." };
  const stars = record.stars | 0;
  if (stars < MASTERY.minStars) {
    return { rule: "stars", reason: `${stars} star${stars === 1 ? "" : "s"} — mastery needs ${MASTERY.minStars}. The 2-star band is at most one correction and inside 1.5x par.` };
  }
  const hazards = record.hazardHits | 0;
  if (hazards > MASTERY.maxHazardHits) {
    return { rule: "unsafe", reason: `${hazards} unsafe action${hazards === 1 ? "" : "s"} — mastery allows none.` };
  }
  const iv = interrupts(record);
  if (iv && (iv.wrong > 0 || iv.missed > 0)) {
    const parts = [];
    if (iv.missed) parts.push(`${iv.missed} missed`);
    if (iv.wrong) parts.push(`${iv.wrong} answered wrongly`);
    return { rule: "interrupts", reason: `${parts.join(" and ")} of ${iv.answered + iv.wrong + iv.missed} interruptions — mastery needs every one answered.` };
  }
  const par = parOf(record, parSeconds);
  if (par != null) {
    const limit = par * MASTERY.parMultiple;
    const seconds = record.seconds | 0;
    if (seconds > limit) {
      return { rule: "time", reason: `${clockText(seconds)} against par ${clockText(par)} — mastery allows ${clockText(limit)}.` };
    }
  }
  return null;
}

/**
 * The mastery rule. `parSeconds` overrides the record's own par (an
 * instructor re-judging a run against a station whose par has since moved);
 * when neither is known the time limit cannot be applied and the other three
 * conditions decide.
 */
export function isMastery(record, parSeconds) {
  return masteryShortfall(record, parSeconds) === null;
}

// -------------------------------------------------------------------- status

/** The UTC calendar day of an ISO timestamp — what "different days" counts. */
function day(at) {
  const s = String(at ?? "");
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
}

/** A compact, serialisable view of one attempt, for status and transcript. */
function attemptRow(r) {
  const par = parOf(r, null);
  const shortfall = masteryShortfall(r);
  return {
    attemptId: r.id ?? null,
    at: r.at ?? null,
    stationId: r.simId ?? null,
    stationName: r.simName ?? r.simId ?? null,
    learner: r.learnerName ?? r.learner ?? null,
    score: r.score | 0,
    stars: r.stars | 0,
    hazardHits: r.hazardHits | 0,
    errors: r.errors | 0,
    interrupts: interrupts(r),
    seconds: r.seconds | 0,
    parSeconds: par,
    parRatio: par ? Math.round((r.seconds | 0) / par * 100) / 100 : null,
    mastery: shortfall === null,
    reason: shortfall?.reason ?? null,
    rule: shortfall?.rule ?? null,
  };
}

/** Best first: mastery over not, then stars, then score. */
function betterAttempt(a, b) {
  if (!b) return a;
  if (a.mastery !== b.mastery) return a.mastery ? a : b;
  if (a.stars !== b.stars) return a.stars > b.stars ? a : b;
  return a.score >= b.score ? a : b;
}

/**
 * Where the learner stands on every competency, from the training record.
 *
 * Per competency: `demonstrated` when `require` of its stations each carry at
 * least one mastery run; `consistent` when it is demonstrated and its mastery
 * runs fall on three or more different days. `stations` holds one entry per
 * station the record has any attempt on — `best` is the best attempt seen
 * there and `masteryAt` the timestamp of the FIRST mastery run, which is the
 * date the station was earned and the date the badge is issued on.
 */
export function competencyStatus(records = []) {
  const byStation = new Map();
  for (const r of records) {
    if (!r?.simId) continue;
    if (!byStation.has(r.simId)) byStation.set(r.simId, []);
    byStation.get(r.simId).push(r);
  }
  const out = {};
  for (const c of COMPETENCIES) {
    const stations = {};
    const days = new Set();
    let masteryRuns = 0, attempts = 0;
    const earnedDates = [];
    for (const id of c.stations) {
      const runs = byStation.get(id);
      if (!runs?.length) continue;
      let best = null, masteryAt = null;
      for (const r of runs) {
        const row = attemptRow(r);
        attempts += 1;
        best = betterAttempt(row, best);
        if (!row.mastery) continue;
        masteryRuns += 1;
        days.add(day(row.at));
        if (masteryAt == null || String(row.at) < String(masteryAt)) masteryAt = row.at;
      }
      stations[id] = { best, masteryAt };
      if (masteryAt) earnedDates.push(masteryAt);
    }
    const stationsMet = earnedDates.length;
    const demonstrated = stationsMet >= c.require;
    // Dated by the evidence rather than by the export: the competency was
    // earned the moment its `require`-th station was, so that is the date the
    // badge is issued on. Sorted chronologically, not in station order.
    earnedDates.sort((a, b) => String(a).localeCompare(String(b)));
    const earnedAt = demonstrated ? earnedDates[c.require - 1] ?? null : null;
    out[c.id] = {
      id: c.id, title: c.title, kind: c.kind, standards: c.standards,
      require: c.require, total: c.stations.length,
      demonstrated,
      consistent: demonstrated && days.size >= CONSISTENT_DAYS,
      status: demonstrated ? (days.size >= CONSISTENT_DAYS ? "consistent" : "demonstrated") : "in progress",
      stationsMet, masteryRuns, attempts, days: days.size,
      earnedAt,
      stations,
    };
  }
  return out;
}

/** Ids of competencies demonstrated in `after` that were not in `before`. */
export function newlyDemonstrated(before, after) {
  return Object.keys(after).filter((id) => after[id].demonstrated && !before?.[id]?.demonstrated);
}

// ----------------------------------------------------------------- transcript

/**
 * The proof transcript: one row per competency the learner has touched, with
 * the evidence under it. `evidence` is every attempt on the competency's
 * stations, newest first, each carrying score, stars, unsafe actions, the
 * interruption tally and time against par — and, for a run that did not
 * count, the reason. That reason is the point of the whole table: a learner
 * looking at a near miss can see it was one missed alarm rather than "fail".
 *
 * `opts.all` keeps competencies with no attempts at all (the full catalogue,
 * for a hall printing what is available); by default they are dropped.
 */
export function transcript(records = [], { learner = null, all = false } = {}) {
  const status = competencyStatus(records);
  const rows = [];
  for (const c of COMPETENCIES) {
    const st = status[c.id];
    const stations = new Set(c.stations);
    const evidence = records
      .filter((r) => stations.has(r?.simId))
      .map(attemptRow)
      .sort((a, b) => String(b.at).localeCompare(String(a.at)));
    if (!evidence.length && !all) continue;
    rows.push({
      learner: learner ?? evidence.find((e) => e.learner)?.learner ?? "YOU",
      competency: { id: c.id, title: c.title, kind: c.kind },
      status: st.status,
      demonstrated: st.demonstrated,
      consistent: st.consistent,
      stationsMet: st.stationsMet,
      require: st.require,
      total: st.total,
      days: st.days,
      earnedAt: st.earnedAt,
      standards: c.standards.map((id) => {
        const s = standard(id);
        return { id: s.id, body: s.body, title: s.title, source: s.source };
      }),
      masteryRule: MASTERY.text,
      evidence,
    });
  }
  return rows;
}

/** Flat CSV of the transcript — one row per evidence attempt. */
const PROOF_COLUMNS = [
  "learner", "competency", "competencyTitle", "status", "stationsMet", "require",
  "standards", "at", "stationId", "stationName", "attemptId",
  "score", "stars", "hazardHits", "interruptsAnswered", "interruptsWrong", "interruptsMissed",
  "seconds", "parSeconds", "parRatio", "mastery", "reason",
];

function proofCsvCell(v) {
  if (v == null) return "";
  const s = Array.isArray(v) ? v.join("; ") : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** RFC 4180 CSV of the proof transcript, one line per evidence attempt. */
export function toProofCSV(rows) {
  const lines = [PROOF_COLUMNS.join(",")];
  for (const row of rows) {
    for (const e of row.evidence) {
      const flat = {
        learner: row.learner, competency: row.competency.id, competencyTitle: row.competency.title,
        status: row.status, stationsMet: row.stationsMet, require: row.require,
        standards: row.standards.map((s) => `${s.body} ${s.title}`),
        at: e.at, stationId: e.stationId, stationName: e.stationName, attemptId: e.attemptId,
        score: e.score, stars: e.stars, hazardHits: e.hazardHits,
        interruptsAnswered: e.interrupts?.answered ?? "", interruptsWrong: e.interrupts?.wrong ?? "", interruptsMissed: e.interrupts?.missed ?? "",
        seconds: e.seconds, parSeconds: e.parSeconds, parRatio: e.parRatio,
        mastery: e.mastery, reason: e.reason,
      };
      lines.push(PROOF_COLUMNS.map((c) => proofCsvCell(flat[c])).join(","));
    }
  }
  return lines.join("\r\n") + "\r\n";
}

// --------------------------------------------------------- competency badges

function competencyBadgeImage(label) {
  const safe = String(label).replace(/[<>&"]/g, "").slice(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" rx="24" fill="#0b1219"/>` +
    `<rect x="36" y="34" width="168" height="140" rx="10" fill="none" stroke="#7ee6ff" stroke-width="8"/>` +
    `<path d="M74 104 l24 24 l48 -52" fill="none" stroke="#59c97b" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<text x="120" y="208" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#e6f0f6">${safe}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Open Badges 2.0 assertions for demonstrated competencies — the second,
 * sober tier beside the station badges in records.js, which stay exactly as
 * they are. Each assertion carries the competency, every standard it
 * evidences (as OB alignment entries a receiving system can read), the
 * station ids, the attempt ids behind it, and the mastery rule text in the
 * criteria narrative, so a hall reading it later can tell what was actually
 * required without this repository in front of them.
 *
 * Like the station badges these are self-asserted by a static page: the ids
 * are laid out as URLs under `homePage` ready for a hall that hosts them,
 * which is what makes hosted verification mean anything.
 */
export function toCompetencyBadges(records = [], {
  issuerName = "SmartCiti.X Training Network",
  homePage = "https://smartciti.example",
  actorName = "YOU",
  learnerHome = null,
  learnerId = null,
  learnerName = null,
} = {}) {
  const status = competencyStatus(records);
  const out = [];
  for (const c of COMPETENCIES) {
    const st = status[c.id];
    if (!st.demonstrated) continue;
    const evidence = [];
    const stationIds = [];
    for (const [id, s] of Object.entries(st.stations)) {
      if (!s.masteryAt) continue;
      stationIds.push(id);
      const best = s.best;
      evidence.push({
        id: `${homePage}/xapi/statements/${best.attemptId}`,
        name: best.stationName ?? id,
        narrative: `${id}: ${best.stars} stars, ${best.hazardHits} unsafe actions, ` +
          `${best.interrupts ? `${best.interrupts.answered} of ${best.interrupts.answered + best.interrupts.wrong + best.interrupts.missed} interruptions answered, ` : "no interruptions fired, "} ` +
          `${clockText(best.seconds)} against par ${best.parSeconds ? clockText(best.parSeconds) : "—"}; mastery run ${best.attemptId} on ${day(s.masteryAt)}.`,
      });
    }
    const home = learnerHome ?? homePage;
    const who = learnerId ?? actorName;
    const standards = c.standards.map((id) => standard(id));
    out.push({
      "@context": "https://w3id.org/openbadges/v2",
      type: "Assertion",
      id: `${home}/credentials/competency/${encodeURIComponent(c.id)}`,
      recipient: {
        type: "url", hashed: false,
        identity: `${home}/learners/${encodeURIComponent(who)}`,
        name: learnerName ?? actorName,
      },
      issuedOn: st.earnedAt ?? new Date().toISOString(),
      verification: { type: "hosted" },
      badge: {
        type: "BadgeClass",
        id: `${homePage}/badges/competency/${encodeURIComponent(c.id)}`,
        name: c.title,
        description: `Competency "${c.title}" (${c.id}), demonstrated on ${st.stationsMet} of the ${st.total} stations named for it, ` +
          `${st.require} being required. Evidenced against ${standards.map((s) => `${s.body} ${s.title}`).join("; ")}. ` +
          `Status: ${st.status}${st.consistent ? ` (mastery runs on ${st.days} different days)` : ""}. ` +
          "A demonstrated competency evidences readiness against the named standards; it is not a licence or a certification issued by those bodies.",
        image: competencyBadgeImage(c.id),
        criteria: { narrative: `${MASTERY.text} This competency requires mastery on ${c.require} of these stations: ${c.stations.join(", ")}.` },
        issuer: { type: "Profile", id: `${homePage}/issuer`, name: issuerName, url: homePage },
        tags: ["competency", c.kind, ...new Set(standards.map((s) => s.body))],
        alignment: standards.map((s) => ({
          targetName: `${s.body} — ${s.title}`,
          targetUrl: `${homePage}/standards/${encodeURIComponent(s.id)}`,
          targetCode: s.id,
          targetFramework: s.body,
          targetDescription: s.source === "verified" ? s.title : `${s.title} (citation form unverified in this registry)`,
        })),
      },
      evidence,
      // The detail a receiving system wants as data rather than prose. Extra
      // keys on an assertion are ignored by a strict OB 2.0 validator (the
      // verifier in WebXR/verify/ checks the assertion and passes this
      // through), so nothing is lost by carrying it.
      competency: {
        id: c.id, title: c.title, kind: c.kind,
        status: st.status, demonstrated: true, consistent: st.consistent,
        require: c.require, stationsMet: st.stationsMet, stationsTotal: st.total, masteryDays: st.days,
        stations: c.stations,
        stationsDemonstrated: stationIds,
        attempts: evidence.map((e) => e.id.split("/").pop()),
        standards: standards.map((s) => ({ id: s.id, body: s.body, title: s.title, source: s.source, slug: s.slug })),
        masteryRule: { id: MASTERY.id, text: MASTERY.text },
      },
    });
  }
  return out;
}

/**
 * xAPI statements for demonstrated competencies, verb "achieved" — what goes
 * through the live LRS queue (shared/lrs.js) beside the per-attempt
 * passed/failed statements. The assertion rides along in an extension so an
 * LRS holds the credential and its evidence, not just the fact.
 *
 * `only` limits it to named competency ids, which is what the app uses to
 * send exactly the competencies a run just earned.
 */
export function toCompetencyXAPI(records = [], {
  homePage = "https://smartciti.example",
  actorName = "YOU",
  learnerName = null,
  learnerId = null,
  learnerHome = null,
  only = null,
  app = "smartcity",
} = {}) {
  const ext = (k) => `${homePage}/xapi/ext/${k}`;
  const wanted = only ? new Set(only) : null;
  const status = competencyStatus(records);
  const assertions = Object.fromEntries(
    toCompetencyBadges(records, { homePage, actorName, learnerName, learnerId, learnerHome })
      .map((a) => [a.competency.id, a]),
  );
  const statements = [];
  for (const c of COMPETENCIES) {
    const st = status[c.id];
    if (!st.demonstrated) continue;
    if (wanted && !wanted.has(c.id)) continue;
    const assertion = assertions[c.id];
    const at = st.earnedAt ?? new Date().toISOString();
    statements.push({
      // Stable and derived from the competency, so an LRS de-duplicates a
      // competency that is re-sent rather than recording it twice.
      id: `${app}-competency-${c.id}`,
      timestamp: at,
      actor: {
        objectType: "Agent",
        name: learnerName ?? actorName,
        account: { homePage: learnerHome ?? homePage, name: learnerId ?? actorName },
      },
      verb: { id: "http://adlnet.gov/expapi/verbs/achieved", display: { "en-US": "achieved" } },
      object: {
        objectType: "Activity",
        id: `${homePage}/competency/${encodeURIComponent(c.id)}`,
        definition: {
          name: { "en-US": c.title },
          description: { "en-US": `Competency ${c.id}: mastery on ${st.stationsMet} of ${st.total} stations, ${c.require} required.` },
          type: "http://adlnet.gov/expapi/activities/objective",
        },
      },
      result: {
        success: true,
        completion: true,
        extensions: {
          [ext("competency")]: c.id,
          [ext("competency-status")]: st.status,
          [ext("stations-demonstrated")]: Object.entries(st.stations).filter(([, s]) => s.masteryAt).map(([id]) => id),
          [ext("attempts")]: assertion?.competency.attempts ?? [],
          [ext("standards")]: c.standards.map((id) => standard(id).slug),
          [ext("mastery-rule")]: MASTERY.text,
          [ext("open-badge")]: assertion ?? null,
        },
      },
      context: {
        platform: "SmartCiti.X ~VR Simulators",
        extensions: { [ext("competency-kind")]: c.kind, [ext("mastery-rule-id")]: MASTERY.id },
      },
    });
  }
  return { statements };
}
