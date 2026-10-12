// The project precincts (console PROJECTLANDS, docs/consoles/PROJECTLANDS.md, docs/parishes.md): for every project named in
// the facts file (epa-2026-facts.md) and the Port of Oakland's Clean Ports award, the walkable map and the sites where its
// kinds of work are taught. Pure data plus a guard, no imports.
//
// `us` lists UNIONSIMS' stations and simulations for each project's crafts ($SP/restoration/unionsims-ids.md, final ids from
// its hand-back; its module shared/us-unionsims.js carries usSimsFor(project) and usPlaces). They are GUARDED: an id counts only once it resolves (a catalog station, or a simulation id the caller knows), so this file can
// ship before UNIONSIMS merges and never sends a learner to a station that does not exist yet. The sites' own `stations`
// arrays carry only catalog stations that resolve today.
export const PJ_PRECINCTS = [
  { project: "port-of-oakland-trash-capture", recipient: "Port of Oakland", program: "EPA San Francisco Bay Program",
    parish: "oak-west-oakland", representative: false,
    sites: ["oak-port-trash-capture-outer-harbor", "oak-port-trash-capture-middle-harbor"],
    us: { stations: ["us-vacuum-truck-operator-hookup-and-offload", "us-regulated-soil-haul-load-tarp-and-manifest"], sims: ["us-sim-trash-capture-surface-cleanout", "us-sim-vacuum-truck-operator", "us-sim-regulated-waste-haul"] } },
  { project: "port-of-oakland-clean-ports", recipient: "Port of Oakland", program: "EPA Clean Ports Program",
    parish: "oak-west-oakland", representative: false,
    sites: ["oak-port-charging-yard", "oak-port-battery-storage-site", "oak-port-drayage-staging", "oak-port-ze-equipment-yard"],
    us: { stations: [], sims: ["us-sim-ze-equipment-pre-use", "us-sim-battery-electric-lockout", "us-sim-charging-yard-electrical", "us-sim-drayage-pre-trip"] } },
  { project: "ccag-pcb-source-control", recipient: "City/County Association of Governments of San Mateo County (C/CAG)", program: "EPA San Francisco Bay Program",
    parish: "bp-san-mateo-shoreline", representative: true,
    sites: ["smc-pcb-soil-sampling", "smc-decon-line", "smc-storm-drain-sediment-sampling", "smc-regulated-soil-loadout", "smc-pcb-equipment-removal", "smc-drum-staging-yard", "smc-outfall-monitoring", "smc-marsh-sediment-coring", "smc-lab-intake", "smc-excavation-cell"],
    us: { stations: ["us-regulated-soil-haul-load-tarp-and-manifest"], sims: ["us-sim-pcb-chain-of-custody", "us-sim-regulated-soil-haul"] } },
  { project: "bacwa-nutrient-pilots", recipient: "Bay Area Clean Water Agencies (BACWA)", program: "EPA San Francisco Bay Program",
    parish: "bp-nutrient-pilot", representative: true,
    sites: ["npp-operator-rounds", "npp-chemical-feed-building", "npp-aeration-basin-deck", "npp-pilot-process-skid", "npp-digester-complex", "npp-plant-lab", "npp-outfall-monitoring", "npp-chemical-delivery-dock", "npp-electrical-substation", "npp-maintenance-shop"],
    us: { stations: ["us-treatment-plant-process-pump-lockout"], sims: ["us-sim-plant-operator-rounds", "us-sim-process-lockout"] },
    // Where UNIONSIMS' nutrient-reduction simulations should play once its usPlaces is re-pointed from islais-creek-pump-station.
    usPlaces: [{ sim: "us-sim-plant-operator-rounds", site: "npp-operator-rounds" }, { sim: "us-sim-process-lockout", site: "npp-pilot-process-skid" }, { sim: "us-sim-process-lockout", site: "npp-maintenance-shop" }] },
  { project: "san-jose-gsi-plan", recipient: "City of San Jose", program: "EPA San Francisco Bay Program",
    parish: "bay-san-jose", representative: false,
    sites: ["downtown-stormwater-crew-yard", "sj-gsi-street-survey", "sj-gsi-site-assessment", "sj-gsi-planning-studio"],
    us: { stations: [], sims: ["us-sim-gsi-utility-locate"] } },
  { project: "san-pablo-gsi", recipient: "City of San Pablo", program: "EPA San Francisco Bay Program",
    parish: "bay-san-pablo", representative: false,
    sites: ["san-pablo-stormwater-crew", "sp-gsi-bioretention-build", "sp-gsi-monitoring-point", "sp-gsi-underdrain-crew"],
    us: { stations: [], sims: ["us-sim-gsi-excavation-and-shoring", "us-sim-gsi-underdrain-piping", "us-sim-gsi-soil-and-planting", "us-sim-gsi-utility-locate"] } },
  { project: "sfpuc-outer-mission-gsi", recipient: "San Francisco Public Utilities Commission (SFPUC)", program: "EPA San Francisco Bay Program",
    parish: "sf-outer-mission", representative: false,
    sites: ["om-planted-sidewalk-filtration", "om-rain-garden-block", "om-underground-infiltration-site", "om-underdrain-piping-crew", "om-gsi-monitoring-crew", "om-utility-locate-crew"],
    us: { stations: [], sims: ["us-sim-gsi-excavation-and-shoring", "us-sim-gsi-underdrain-piping", "us-sim-gsi-soil-and-planting", "us-sim-gsi-utility-locate"] } },
  { project: "san-leandro-trash-capture", recipient: "City of San Leandro", program: "EPA San Francisco Bay Program",
    parish: "bp-san-leandro-bay", representative: false,
    sites: ["slb-trash-capture-device-north", "slb-trash-capture-device-south", "slb-vacuum-truck-staging", "slb-debris-haul-transfer", "slb-storm-drain-crew"],
    us: { stations: ["us-vacuum-truck-operator-hookup-and-offload", "us-regulated-soil-haul-load-tarp-and-manifest"], sims: ["us-sim-trash-capture-surface-cleanout", "us-sim-vacuum-truck-operator", "us-sim-regulated-waste-haul"] } },
  { project: "abag-strip-marsh-east", recipient: "Association of Bay Area Governments (ABAG)", program: "EPA San Francisco Bay Program",
    parish: "bp-strip-marsh-east", representative: false,
    sites: ["sme-tidal-channel-excavation", "sme-berm-lowering", "sme-sediment-reuse-placement", "sme-small-boat-landing", "sme-water-control-structure", "sme-marsh-mat-crossing", "sme-levee-road-patrol"],
    us: { stations: [], sims: ["us-sim-tidal-operator-on-mats", "us-sim-levee-laborer", "us-sim-water-control-structure", "us-sim-small-boat-crew"] } },
];

/** A precinct by project id, or null. */
export function pjPrecinct(project) { return PJ_PRECINCTS.find((p) => p.project === project) ?? null; }

/** The precincts on one map. */
export function pjPrecinctsOn(parishId) { return PJ_PRECINCTS.filter((p) => p.parish === parishId); }

/**
 * The guard: a precinct's UNIONSIMS ids that resolve now. `stations` is a Set (or array) of catalog station ids, `sims` of
 * simulation ids (PS_SIMS ids once UNIONSIMS merges its simulations there). Unresolved ids are returned as `pending`.
 */
export function pjGuardedUs(precinct, { stations = [], sims = [] } = {}) {
  const st = stations instanceof Set ? stations : new Set(stations), sm = sims instanceof Set ? sims : new Set(sims);
  const us = precinct?.us ?? { stations: [], sims: [] };
  return {
    stations: us.stations.filter((id) => st.has(id)),
    sims: us.sims.filter((id) => sm.has(id)),
    pending: [...us.stations.filter((id) => !st.has(id)), ...us.sims.filter((id) => !sm.has(id))],
  };
}
