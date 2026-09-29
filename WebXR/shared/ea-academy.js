// ACADEMY — the Bay Restoration Academy (docs/consoles/ACADEMY.md, docs/bay-academy.md).
//
// One training programme an employer, a union hall, a public agency or a school district can run
// for the eight named EPA San Francisco Bay Program projects and the Port of Oakland's Clean Ports
// program. Every project track traces:
//   work type   — a phrase quoted from the wave's facts file (EPA release of 22 September 2026 and its
//                 coverage; the Port of Oakland's Clean Ports pages), never more than it says
//   → craft     — union ids from tools/unions.json only, described as the registry describes them
//   → training  — real catalog stations, PROJECTSIM / UNIONSIMS simulations and ESTUARY's K-12 lessons
//   → credential — an existing competency on the competency layer (Open Badges, transcript, xAPI)
//                 plus the org layer's cohort certificate.
// The platform has no partnership with any recipient, workforce organisation or union: union names are
// trade references and the practice is taught from each station's own sourced safety content.
// Twelve of the twenty projects are not named in the sources and are never named here.
//
// Seams (documented shapes):
//   eaTracks() -> [{ id, short, project, recipient, programme, facts: [quote], workTypes: [...], gaps: [...] }]
//     workType: { id, facts: "<verbatim facts-file phrase>", practice, crafts: [{ union, role }], stations, sims, k12 }
//   eaResolve(track, { stationIds, simIds }) -> track with each list split into live ids and `pending` ids
//     (UNIONSIMS' us- ids resolve only once they exist in this tree; the rest stay pending, never broken links)
//   eaPathways(track, { stationIds, simIds }) -> [{ role, title, stations, sims, credential: { id, overlap, require } }]
//   eaMatrix({ stationIds, simIds }) -> [{ track, workType, union, station }] (live cells only)
//   eaTemplates({ stationIds, simIds }) -> [{ module: DEAN module doc (dnCleanModule shape), sims, dueDays, track, role, guide }]
//   eaSetUpCohort({ en, dn }, { orgName, trackId, role, seats, startDate }) -> { org, cohort, module, classCode, due }
//   eaCredentials(records) -> { status, badges, xapi } for the Academy's credential ids (competency.js)

import { COMPETENCY_BY_ID, competencyStatus, toCompetencyBadges, toCompetencyXAPI } from "./competency.js";

export const EA_NAME = "Bay Restoration Academy";
export const EA_FACTS_SOURCES = [
  { label: "U.S. EPA — EPA Awards Record $82 Million to Improve Water Quality and Restore Habitat Across San Francisco Bay (22 September 2026)", url: "https://www.epa.gov/newsreleases/epa-awards-record-82-million-improve-water-quality-and-restore-habitat-across-san" },
  { label: "Stormwater (trade press) — coverage of the awards", url: "https://www.stormwater.com/stormwater-management/news/55407138/epa-awards-82-million-for-san-francisco-bay-water-quality-and-stormwater-projects" },
  { label: "Port of Oakland — Clean Ports", url: "https://www.portofoakland.com/cleanports" },
  { label: "Port of Oakland — awarded historic $322 million EPA grant", url: "https://www.portofoakland.com/port-of-oakland-awarded-historic-322-million-epa-grant" },
];
export const EA_NO_PARTNERSHIP = "The Bay Restoration Academy is the platform's own training programme. It has no partnership with any grant recipient, workforce organisation or union, and it does not deliver or describe their programmes. Union names are trade references from the platform's registry; every practice is taught from the station's own cited safety standards.";

/** The five role pathways, in ladder order. */
export const EA_ROLES = [
  { id: "aware", title: "Awareness and K-12", who: "school districts, public-agency staff and community members", requiredScore: 60, dueDays: 14,
    credentialFrom: ["k12-science", "k12-practical-math", "k12-literacy-and-life-skills"] },
  { id: "entry", title: "Pre-apprentice / entry", who: "pre-apprenticeship cohorts and new hires", requiredScore: 70, dueDays: 21,
    credentialFrom: ["core-trenching", "core-confined-space", "core-lockout-tagout", "core-respiratory-protection", "core-hazard-communication", "wojrc-pathway-edition"] },
  { id: "appr", title: "Apprentice", who: "apprentices in the crafts the work involves", requiredScore: 80, dueDays: 42,
    credentialFrom: ["bay-program-projects", "energy-transition", "port-operations", "hazmat-environmental", "heavy-equipment-operators", "water-and-gas-utility-crews", "bay-restoration-maritime-underwater", "marine-ecology-and-restoration"] },
  { id: "jw", title: "Journeyworker refresher", who: "journey-level workers taking an annual or pre-job refresher", requiredScore: 85, dueDays: 14,
    credentialFrom: ["core-lockout-tagout", "core-confined-space", "core-trenching", "core-respiratory-protection", "hazmat-environmental", "energy-transition"] },
  { id: "lead", title: "Supervisor / crew lead", who: "forepersons, crew leads and agency inspectors", requiredScore: 90, dueDays: 28,
    credentialFrom: ["situational-awareness", "bay-program-projects", "hazmat-environmental", "energy-transition", "core-emergency-response"] },
];

const EA_GSI_CRAFTS = {
  dig: [{ union: "liuna", role: "construction craft laborers on the cut, the shoring and the backfill" }, { union: "iuoe-local3", role: "operating engineers on the compact excavator" }],
  pipe: [{ union: "ua", role: "pipelayers on underdrain and infiltration piping" }, { union: "liuna", role: "laborers in the trench" }],
  plant: [{ union: "liuna", role: "laborers placing soil, mulch and plants" }],
  locate: [{ union: "iuoe-local3", role: "operating engineers digging inside the tolerance zone" }, { union: "uwua", role: "utility crews on locates and hand digs" }],
};
const EA_TRASH_CRAFTS = {
  clean: [{ union: "liuna", role: "construction craft laborers on the surface cleanout" }, { union: "afscme", role: "public-works members on collection-system entry" }],
  vac: [{ union: "teamsters", role: "driving and regulated-soil haul" }, { union: "liuna", role: "laborers on the hose" }],
};
const EA_TRASH_K12 = ["k12-es-what-a-trash-capture-device-does", "k12-es-where-the-storm-drain-goes", "k12-es-plastics-and-the-bay"];
const EA_GSI_K12 = ["k12-es-rain-gardens-a-sponge-in-the-sidewalk", "k12-es-measure-a-rain-garden", "k12-es-where-the-storm-drain-goes"];

/**
 * The nine project tracks. `facts` quotes are verbatim phrases of the facts file (check_academy compares).
 * `gaps` names work the sources state that no station teaches yet — listed honestly, never linked.
 */
export const EA_TRACKS = [
  {
    id: "abag-strip-marsh-east", short: "abag", project: "abag-strip-marsh-east", recipient: "Association of Bay Area Governments (ABAG)", programme: "bay-program-projects", prefer: ["bay-restoration-maritime-underwater", "marine-ecology-and-restoration", "heavy-equipment-operators", "core-trenching"],
    workTypes: [
      { id: "tidal-channels", facts: "excavating new tidal channels", practice: "machine work on soft marsh from mats, hand-crew channel opening, water-control structures",
        crafts: [{ union: "iuoe-local3", role: "operating engineers on the amphibious excavator" }, { union: "liuna", role: "laborers on the hand crew and the mats" }],
        stations: ["br-tidal-marsh-grading-amphibious-excavator", "me-tidal-marsh-channel-restoration-day", "tide-gate"],
        sims: ["ps-tidal-channel-dig", "us-sim-tidal-operator-on-mats", "us-sim-water-control-structure"], k12: ["k12-es-mud-on-the-move"] },
      { id: "berms", facts: "lowering berms", practice: "levee and berm work: seepage, footing and the machine at the crest",
        crafts: [{ union: "liuna", role: "laborers on the levee" }, { union: "iuoe-local3", role: "operating engineers on the berm" }],
        stations: ["br-levee-inspection-and-seepage", "br-tidal-marsh-grading-amphibious-excavator"],
        sims: ["us-sim-levee-laborer"], k12: ["k12-by-how-a-levee-holds-water-back"] },
      { id: "sediment-reuse", facts: "reusing sediment", practice: "dewatering pads, turbidity control, planting and erosion mats on placed sediment",
        crafts: [{ union: "liuna", role: "laborers on the pad, the curtain and the planting crew" }, { union: "iuoe-local3", role: "operating engineers rehandling material" }, { union: "ibu", role: "workboat crews (the ILWU's marine division)" }],
        stations: ["br-dredge-spoils-dewatering-pad", "br-turbidity-curtain-deployment", "br-native-planting-and-erosion-mats"],
        sims: ["us-sim-small-boat-crew"], k12: ["k12-es-the-tidal-marsh-nursery"] },
      { id: "sediment-study", facts: "a report on how sediment moves through the Bay-Delta estuary", practice: "field sampling from a small boat and at the bed, the kind of data work such a study draws on (taught generically)",
        crafts: [{ union: "ibu", role: "workboat crews" }, { union: "carpenters", role: "pile drivers (the registry's note) on commercial dive sampling" }],
        stations: ["me-water-column-sampling-from-a-small-boat", "br-underwater-sediment-core-sampling", "marsh-transect-survey"],
        sims: [], k12: ["k12-es-mud-on-the-move", "k12-es-count-it-a-fair-survey"] },
    ],
    gaps: [],
  },
  {
    id: "bacwa-nutrient-pilots", short: "bacwa", project: "bacwa-nutrient-pilots", recipient: "Bay Area Clean Water Agencies (BACWA)", programme: "bay-program-projects", prefer: ["core-confined-space", "core-lockout-tagout", "water-and-gas-utility-crews"],
    workTypes: [
      { id: "plant-rounds", facts: "reducing nutrient inputs to San Francisco Bay", practice: "treatment plant operator rounds, chemical feed and aeration (at a procedural plant, never a named one)",
        crafts: [{ union: "iuoe", role: "operating and stationary engineers" }, { union: "afscme", role: "public-service plant staff" }, { union: "uwua", role: "water utility crews" }],
        stations: ["bk-wastewater-nutrient-chemical-feed", "chlorine-room", "us-wastewater-plant-operator-rounds"],
        sims: ["us-sim-plant-operator-rounds", "us-sim-chemical-feed"], k12: ["k12-es-too-much-of-a-good-thing"] },
      { id: "process-lockout", facts: "five pilot projects", practice: "lockout and confined-space entry on process equipment while a pilot is installed or changed",
        crafts: [{ union: "iuoe", role: "stationary engineers on process equipment" }, { union: "afscme", role: "public-service plant staff" }],
        stations: ["digester-gas", "lift-station"],
        sims: ["us-sim-process-lockout"], k12: [] },
    ],
    gaps: [],
  },
  {
    id: "san-jose-gsi-plan", short: "sanjose", project: "san-jose-gsi-plan", recipient: "City of San Jose", programme: "bay-program-projects", prefer: ["core-trenching", "heavy-equipment-operators", "water-and-gas-utility-crews"],
    workTypes: [
      { id: "plan-survey", facts: "develop a green stormwater infrastructure implementation plan", practice: "survey, assessment and locates for a plan: outfall sampling, marked utilities, measuring a site",
        crafts: [{ union: "uwua", role: "utility crews on locates" }, { union: "iuoe-local3", role: "operating engineers potholing inside the tolerance zone" }, { union: "liuna", role: "laborers on the survey crew's traffic control" }],
        stations: ["stormwater-outfall", "ut-service-line-locate-and-hand-dig-near-gas-main", "op-excavator-trench-and-utility-locate"],
        sims: ["us-sim-gsi-utility-locate"], k12: ["k12-es-measure-a-rain-garden", "k12-es-count-it-a-fair-survey"] },
    ],
    gaps: [],
  },
  {
    id: "san-pablo-gsi", short: "sanpablo", project: "san-pablo-gsi", recipient: "City of San Pablo", programme: "bay-program-projects", prefer: ["core-trenching", "heavy-equipment-operators", "water-and-gas-utility-crews"],
    workTypes: [
      { id: "gsi-build", facts: "construct and monitor green stormwater infrastructure", practice: "excavation and shoring, underdrain piping, soil and planting",
        crafts: [...EA_GSI_CRAFTS.dig, ...EA_GSI_CRAFTS.pipe.slice(0, 1)],
        stations: ["bk-bioretention-rain-garden-excavation", "trench-box", "pl-underground-sewer-lateral-and-trench-shoring"],
        sims: ["ps-green-stormwater-build", "us-sim-gsi-excavation-and-shoring", "us-sim-gsi-underdrain-piping", "us-sim-gsi-soil-and-planting"], k12: EA_GSI_K12 },
      { id: "gsi-monitor", facts: "capture and treat stormwater runoff", practice: "monitoring what the facility captures: outfall sampling and the drawdown check",
        crafts: [{ union: "liuna", role: "laborers on the monitoring round" }, { union: "afscme", role: "public-service monitoring staff" }],
        stations: ["stormwater-outfall", "bk-bioretention-rain-garden-excavation"],
        sims: [], k12: ["k12-es-where-the-storm-drain-goes"] },
    ],
    gaps: [],
  },
  {
    id: "sfpuc-outer-mission-gsi", short: "sfpuc", project: "sfpuc-outer-mission-gsi", recipient: "San Francisco Public Utilities Commission (SFPUC)", programme: "bay-program-projects", prefer: ["core-trenching", "heavy-equipment-operators", "water-and-gas-utility-crews"],
    workTypes: [
      { id: "rain-gardens", facts: "rain gardens", practice: "a bioretention cell cut into a sidewalk: locate, cut, layers, plants",
        crafts: [...EA_GSI_CRAFTS.dig, ...EA_GSI_CRAFTS.plant],
        stations: ["bk-bioretention-rain-garden-excavation", "br-native-planting-and-erosion-mats"],
        sims: ["ps-green-stormwater-build", "us-sim-gsi-soil-and-planting"], k12: EA_GSI_K12 },
      { id: "sidewalk-filtration", facts: "planted sidewalk filtration systems", practice: "utility locates and a shallow cut beside live traffic and pedestrians",
        crafts: EA_GSI_CRAFTS.locate,
        stations: ["op-excavator-trench-and-utility-locate", "ut-service-line-locate-and-hand-dig-near-gas-main", "bk-bioretention-rain-garden-excavation"],
        sims: ["us-sim-gsi-utility-locate"], k12: ["k12-es-rain-gardens-a-sponge-in-the-sidewalk"] },
      { id: "infiltration", facts: "an underground infiltration system", practice: "a deeper excavation with a protective system and underground piping",
        crafts: EA_GSI_CRAFTS.pipe.concat(EA_GSI_CRAFTS.dig.slice(1)),
        stations: ["trench-box", "pl-underground-sewer-lateral-and-trench-shoring"],
        sims: ["us-sim-gsi-excavation-and-shoring", "us-sim-gsi-underdrain-piping"], k12: ["k12-es-where-the-storm-drain-goes"] },
    ],
    gaps: [],
  },
  {
    id: "san-leandro-trash-capture", short: "sanleandro", project: "san-leandro-trash-capture", recipient: "City of San Leandro", programme: "bay-program-projects", prefer: ["core-confined-space", "bay-program-projects", "core-lockout-tagout"],
    workTypes: [
      { id: "device-cleanout", facts: "two large trash capture devices in stormwater drains", practice: "cleanout from the surface: traffic control, lockout, air monitoring, debris handling",
        crafts: EA_TRASH_CRAFTS.clean,
        stations: ["bk-street-drain-trash-capture-cleanout", "br-trash-capture-device-service", "manhole-entry-and-atmospheric-monitoring"],
        sims: ["ps-trash-capture-cleanout", "us-sim-trash-capture-surface-cleanout"], k12: EA_TRASH_K12 },
      { id: "vacuum-haul", facts: "reduce trash and pollutants entering San Leandro Bay", practice: "vacuum truck hook-up and offload, regulated-waste haul",
        crafts: EA_TRASH_CRAFTS.vac,
        stations: ["us-vacuum-truck-operator-hookup-and-offload", "us-regulated-soil-haul-load-tarp-and-manifest", "br-shoreline-cleanup-sharps-and-hazardous-debris"],
        sims: ["us-sim-vacuum-truck-operator", "us-sim-regulated-waste-haul"], k12: ["k12-es-plastics-and-the-bay"] },
    ],
    gaps: [],
  },
  {
    id: "port-of-oakland-trash-capture", short: "oakport", project: "port-of-oakland-trash-capture", recipient: "Port of Oakland", programme: "bay-program-projects", prefer: ["core-confined-space", "bay-program-projects", "core-lockout-tagout"],
    workTypes: [
      { id: "device-cleanout", facts: "four large trash capture devices collecting stormwater", practice: "cleanout on port property: terminal stormwater, lockout, air monitoring, debris handling",
        crafts: [...EA_TRASH_CRAFTS.clean.slice(0, 1), { union: "ilwu", role: "longshore maintenance on terminal stormwater (trained jointly with the PMA, per the registry)" }],
        stations: ["bk-street-drain-trash-capture-cleanout", "br-trash-capture-device-service", "pt-stormwater-at-the-terminal"],
        sims: ["ps-trash-capture-cleanout", "us-sim-trash-capture-surface-cleanout"], k12: EA_TRASH_K12 },
      { id: "vacuum-haul", facts: "reducing more than 4,700 gallons of trash from entering San Francisco Bay", practice: "vacuum truck hook-up and offload, regulated-waste haul",
        crafts: EA_TRASH_CRAFTS.vac,
        stations: ["us-vacuum-truck-operator-hookup-and-offload", "us-regulated-soil-haul-load-tarp-and-manifest", "br-shoreline-cleanup-sharps-and-hazardous-debris"],
        sims: ["us-sim-vacuum-truck-operator", "us-sim-regulated-waste-haul"], k12: ["k12-es-plastics-and-the-bay"] },
    ],
    gaps: [],
  },
  {
    id: "ccag-pcb-source-control", short: "ccag", project: "ccag-pcb-source-control", recipient: "City/County Association of Governments of San Mateo County (C/CAG)", programme: "bay-program-projects", prefer: ["hazmat-environmental", "core-respiratory-protection"],
    workTypes: [
      { id: "pcb-monitor", facts: "monitor and control PCB sources", practice: "sampling with PPE and decontamination, chain of custody (at a representative area, never a named property)",
        crafts: [{ union: "liuna", role: "hazardous-waste laborers and sample custodians" }, { union: "seiu-1021", role: "public-sector employees (the registry's description)" }],
        stations: ["br-legacy-mercury-and-pcb-hotspot-handling", "br-sediment-chain-of-custody-and-lab-prep", "decon-support-laborer", "stormwater-outfall"],
        sims: ["ps-pcb-sampling", "us-sim-pcb-sampling-decon", "us-sim-pcb-chain-of-custody"], k12: ["k12-es-too-much-of-a-good-thing"] },
      { id: "pcb-control", facts: "control PCB sources", practice: "removing PCB-containing equipment, regulated-soil handling and haul",
        crafts: [{ union: "ibew-local6", role: "electricians (the registry's San Francisco local) on equipment removal" }, { union: "liuna", role: "hazardous-waste laborers" }, { union: "teamsters", role: "regulated-soil haul" }],
        stations: ["pcb-equipment-removal", "us-regulated-soil-haul-load-tarp-and-manifest", "decon-line"],
        sims: ["us-sim-regulated-soil-haul"], k12: [] },
    ],
    gaps: [],
  },
  {
    id: "clean-ports", short: "cleanports", project: "clean-ports", recipient: "Port of Oakland (Clean Ports)", programme: "wojrc-pathway-edition", prefer: ["core-lockout-tagout", "energy-transition", "wojrc-pathway-edition"],
    workTypes: [
      { id: "cargo-equipment", facts: "electric and hydrogen cargo handling equipment", practice: "zero-emission cargo handling equipment: pre-use, hydrogen fuelling, high-voltage lockout",
        crafts: [{ union: "ilwu", role: "longshore equipment operators and mechanics" }, { union: "iam", role: "machinists" }],
        stations: ["cp-zero-emission-terminal-equipment-pre-use", "cp-hydrogen-fuel-cell-equipment-and-fuelling", "cp-high-voltage-lockout-on-electric-cargo-equipment", "straddle-carrier-ops"],
        sims: ["us-sim-ze-equipment-pre-use", "us-sim-battery-electric-lockout"], k12: ["k12-es-clean-air-at-the-port"] },
      { id: "drayage", facts: "drayage trucks", practice: "the zero-emission drayage pre-trip",
        crafts: [{ union: "teamsters", role: "drayage drivers" }],
        stations: ["cp-zero-emission-drayage-truck-pre-trip"],
        sims: ["us-sim-drayage-pre-trip"], k12: ["k12-es-who-does-this-work"] },
      { id: "charging", facts: "charging infrastructure", practice: "charging-yard connectors, e-stops and electrical work",
        crafts: [{ union: "ibew", role: "electricians" }, { union: "ilwu", role: "equipment operators at the charger" }],
        stations: ["cp-charging-yard-connectors-and-e-stops", "et-ev-fleet-depot-charging-and-arc-flash", "charge-point"],
        sims: ["ps-zero-emission-charging-yard", "us-sim-charging-yard-electrical"], k12: ["k12-es-clean-air-at-the-port"] },
      { id: "bess", facts: "a battery energy storage system", practice: "who may enter a battery energy storage site, and the lockout at it",
        crafts: [{ union: "ibew", role: "electricians" }, { union: "ilwu", role: "port workers inducted to the site" }],
        stations: ["cp-battery-energy-storage-site-awareness", "battery-yard", "battery-storage-container-commissioning"],
        sims: ["ps-zero-emission-charging-yard"], k12: [] },
    ],
    gaps: [{ facts: "scrappage of a portion of the existing diesel fleet", note: "no station teaches fleet scrappage yet; the Academy lists it and links nothing" }],
  },
];

export const EA_TRACK_BY_ID = Object.fromEntries(EA_TRACKS.map((t) => [t.id, t]));
export function eaTracks() { return EA_TRACKS; }
export function eaTrack(id) { return EA_TRACK_BY_ID[id] ?? EA_TRACKS.find((t) => t.short === id) ?? null; }
export function eaRole(id) { return EA_ROLES.find((r) => r.id === id) ?? null; }

const eaUniq = (a) => [...new Set(a)];
const eaHas = (set, id) => (set instanceof Set ? set.has(id) : Array.isArray(set) ? set.includes(id) : true);

/** Every id a track names, by kind (live and pending together). */
export function eaIdsOf(track) {
  return {
    stations: eaUniq(track.workTypes.flatMap((w) => w.stations)),
    sims: eaUniq(track.workTypes.flatMap((w) => w.sims)),
    k12: eaUniq(track.workTypes.flatMap((w) => w.k12)),
  };
}

/** Split a track's ids into what resolves in this tree and what is pending (UNIONSIMS' us- ids until they land). */
export function eaResolve(track, { stationIds = null, simIds = null } = {}) {
  const pending = [];
  const live = (ids, set) => ids.filter((id) => (eaHas(set, id) ? true : (pending.push(id), false)));
  const workTypes = track.workTypes.map((w) => ({ ...w, stations: live(w.stations, stationIds), sims: live(w.sims, simIds), k12: live(w.k12, stationIds) }));
  return { ...track, workTypes, pending: eaUniq(pending) };
}

/** The competency among `candidates` that shares the most stations with `stations` (ties: the order given — the track's preference first). */
export function eaCredentialFor(stations, candidates) {
  let best = null;
  for (const id of candidates) {
    const c = COMPETENCY_BY_ID[id];
    if (!c) continue;
    const overlap = c.stations.filter((s) => stations.includes(s)).length;
    if (!best || overlap > best.overlap) best = { id, title: c.title, overlap, require: c.require, stillNeeded: Math.max(0, c.require - overlap) };
  }
  return best;
}

/** Every station any Academy track names (the capstone prefers these). */
const EA_ALL_STATIONS = new Set(EA_TRACKS.flatMap((t) => t.workTypes.flatMap((w) => [...w.stations, ...w.k12])));

/**
 * The capstone that makes a pathway's credential earnable inside its own module: the competency's
 * stations not already in the pathway, Academy stations first, as many as the rule still needs.
 */
export function eaCapstone(credential, stations, stationIds = null) {
  const c = credential && COMPETENCY_BY_ID[credential.id];
  if (!c || !credential.stillNeeded) return [];
  const rest = c.stations.filter((s) => !stations.includes(s) && eaHas(stationIds, s));
  const ranked = [...rest.filter((s) => EA_ALL_STATIONS.has(s) || /^(bk|br|cp|k12-es|me|ut|op)-/.test(s)), ...rest.filter((s) => !(EA_ALL_STATIONS.has(s) || /^(bk|br|cp|k12-es|me|ut|op)-/.test(s)))];
  return ranked.slice(0, credential.stillNeeded);
}

/**
 * The five role pathways of a track (live ids only). Awareness: the K-12 lessons. Entry: the first station
 * of each work type and the first simulation. Apprentice: every station and simulation. Journeyworker
 * refresher: every simulation and the first station of each work type. Supervisor / crew lead: every
 * simulation (the crew lead runs the debrief) and every station.
 */
export function eaPathways(track, opts = {}) {
  const t = eaResolve(track, opts);
  const all = eaIdsOf(t);
  const firsts = eaUniq(t.workTypes.map((w) => w.stations[0]).filter(Boolean));
  const build = {
    aware: { stations: eaUniq([...all.k12, "k12-es-who-does-this-work"]).filter((id) => eaHas(opts.stationIds, id)), sims: [] },
    entry: { stations: firsts, sims: all.sims.slice(0, 1) },
    appr: { stations: all.stations, sims: all.sims },
    jw: { stations: firsts, sims: all.sims },
    lead: { stations: all.stations, sims: all.sims },
  };
  return EA_ROLES.map((r) => {
    const p = build[r.id];
    const order = [...(track.prefer ?? []).filter((id) => r.credentialFrom.includes(id)), ...r.credentialFrom];
    const credential = eaCredentialFor(p.stations, [...new Set(order)]);
    const capstone = eaCapstone(credential, p.stations, opts.stationIds);
    return { role: r.id, title: r.title, who: r.who, track: t.id, stations: p.stations, capstone, sims: p.sims, requiredScore: r.requiredScore, dueDays: r.dueDays,
      credential, earnable: !!credential && credential.overlap + capstone.length >= credential.require, certificate: "org cohort certificate (org.js enCertificateSVG)" };
  });
}

/** The competency matrix: one row per live (track, work type, union, station) cell. */
export function eaMatrix(opts = {}) {
  const rows = [];
  for (const tr of EA_TRACKS) {
    const t = eaResolve(tr, opts);
    for (const w of t.workTypes) for (const c of w.crafts) for (const s of w.stations) rows.push({ track: t.id, workType: w.id, facts: w.facts, union: c.union, station: s });
  }
  return rows;
}

/** The debrief prompts an instructor asks after a module (generic, practice-led; no project figures). */
function eaDebrief(w) {
  return [
    `Which step of "${w.practice}" did the crew have to do before anything else, and why?`,
    "Where did an interruption on the station change the plan, and who had the authority to stop the work?",
    "What would you tell a new crew member on day one about this work?",
  ];
}

/**
 * DEAN module templates, one per track and role: `{ module, sims, dueDays, track, role, credential, guide }`.
 * `module` is a DEAN module doc (dnCleanModule / dnValidateDoc shape): stations and K-12 lessons as
 * `{ kind: "station", id, world: "smartcity" }`. Simulations launch through PROJECTSIM (`projectsim:<id>`).
 */
export function eaTemplates(opts = {}) {
  const out = [];
  for (const tr of EA_TRACKS) {
    const t = eaResolve(tr, opts);
    for (const p of eaPathways(tr, opts)) {
      const role = eaRole(p.role);
      const lessons = [...p.stations, ...p.capstone].map((id) => ({ kind: "station", id, world: "smartcity" }));
      if (!lessons.length) continue;
      const guide = {
        objectives: t.workTypes.filter((w) => w.stations.some((s) => p.stations.includes(s)) || p.role === "aware").map((w) => `Explain and practise ${w.practice} — work the sources describe as "${w.facts}".`),
        practice: [...p.stations, ...p.capstone].map((id) => ({ station: id, capstone: p.capstone.includes(id) })), // the generator joins each station's cited standards (catalog `certification`)
        simulations: p.sims.map((id) => ({ sim: id, launch: `projectsim:${id}`, passMark: 80 })),
        debrief: t.workTypes.flatMap(eaDebrief).slice(0, 4),
        assessment: `Every station passed with a module score of ${role.requiredScore} or more${p.sims.length ? `; every simulation at 80 or more with no order-gate penalty` : ""}. The pathway ends in the ${p.credential?.id ?? "—"} competency — ${p.credential?.require ?? 0} mastery runs from its list, ${p.credential?.overlap ?? 0} in the track's stations${p.capstone.length ? ` and ${p.capstone.length} in the capstone` : ""} — and the cohort certificate.`,
      };
      out.push({
        track: t.id, role: p.role, dueDays: role.dueDays, sims: p.sims, credential: p.credential, guide,
        module: { v: 1, kind: "module", id: `mod-ea-${t.short}-${p.role}`, title: `${EA_NAME} · ${t.recipient} · ${role.title}`, lessons, due: null, requiredScore: role.requiredScore, assign: [] },
      });
    }
  }
  return out;
}

/** A date `days` after `start` (YYYY-MM-DD). */
export function eaDueDate(start, days) {
  const d = new Date(`${/^\d{4}-\d{2}-\d{2}$/.test(start ?? "") ? start : new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Run a cohort on the existing layers: an organisation and a cohort with its seats (org.js — no payment,
 * no price), the track's DEAN module saved with its due date and required score and assigned to the
 * cohort's invite code (dn-modules.js). `en` and `dn` are those modules (passed in, so this file stays pure).
 */
export function eaSetUpCohort({ en, dn, stationIds = null, simIds = null }, { orgName, trackId, role = "appr", seats = 20, startDate = null } = {}) {
  const track = eaTrack(trackId);
  const tpl = eaTemplates({ stationIds, simIds }).find((x) => x.track === track?.id && x.role === role);
  if (!track || !tpl) return null;
  const org = en.enOrgs().find((o) => o.name === orgName) ?? en.enCreateOrg({ name: orgName, programmes: [track.programme] });
  if (!org) return null;
  const cohort = en.enCreateCohort({ orgId: org.id, name: `${track.short} · ${eaRole(role).title}`, programme: track.programme, edition: EA_NAME, startDate, seats });
  if (!cohort) return null;
  const due = eaDueDate(cohort.startDate, tpl.dueDays);
  const module = dn.dnSaveModule({ ...tpl.module, due });
  dn.dnAssign(module.id, cohort.code);
  return { org, cohort, module: dn.dnModule(module.id), classCode: cohort.code, due, sims: tpl.sims };
}

/** Every credential id the Academy's pathways end in. */
export function eaCredentialIds(opts = {}) {
  return eaUniq(EA_TRACKS.flatMap((t) => eaPathways(t, opts).map((p) => p.credential?.id).filter(Boolean)));
}

/** The learner's Academy credentials on the competency layer: status, Open Badges and xAPI, filtered to the Academy's ids. */
export function eaCredentials(records = [], opts = {}) {
  const ids = new Set(eaCredentialIds(opts));
  const status = Object.fromEntries(Object.entries(competencyStatus(records)).filter(([id]) => ids.has(id)));
  const badges = toCompetencyBadges(records, opts.badge ?? {}).filter((b) => [...ids].some((id) => JSON.stringify(b).includes(id)));
  const xapi = toCompetencyXAPI(records, opts.xapi ?? {});
  return { status, badges, xapi: Array.isArray(xapi) ? xapi.filter((s) => [...ids].some((id) => JSON.stringify(s).includes(id))) : xapi };
}
