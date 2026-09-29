#!/usr/bin/env node
/**
 * SITEWORKS (Holodeck Packs run, docs/consoles/SITEWORKS.md) — grow the ten parish-engine maps toward 300 job sites.
 *
 * For each map in SW_TARGETS it strips the generated block (between `// sw:begin` and `// sw:end` at the end of the
 * `sites` array of WebXR/shared/np-data-<id>.js), then places new sites until the map holds its target: the
 * district with the fewest sites for its area and character gets the next one, its character's next work type
 * (SW_CYCLES) picks the template (SW_TEMPLATES: an engine kind already used on the maps, unions from
 * tools/unions.json, programmes from the catalog's curricula, a pool of real catalog stations), and a deterministic
 * farthest-point search inside the district finds a spot: dry ground with the whole pad and a margin off open water,
 * off every ribbon's width, off levees, clear of hills, off road ribbons, two pads from every other site, flat.
 *
 * Names are the district's public place name plus a generic work-place word; every blurb opens "A procedural"
 * (sites carry no provenance field, so the blurb says it). No figures, no dates, no business names.
 *
 *   node tools/gen_sw_sites.mjs              # all ten maps
 *   node tools/gen_sw_sites.mjs orleans      # some maps
 *   node tools/gen_sw_sites.mjs --check      # report, write nothing
 *
 * Re-run after merging other consoles' edits to the same maps: the hand-written sites stay first and untouched.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR", "shared");
const E = await import(pathToFileURL(join(SHARED, "np-parish.js")).href);
const CATALOG = JSON.parse(readFileSync(join(ROOT, "WebXR", "smartcity", "catalog.json"), "utf8"));
const UNIONS_RAW = JSON.parse(readFileSync(join(ROOT, "tools", "unions.json"), "utf8"));
const UNION_IDS = new Set((Array.isArray(UNIONS_RAW) ? UNIONS_RAW : UNIONS_RAW.unions ?? Object.values(UNIONS_RAW)).map((u) => u.id));
const STATION_IDS = new Set(CATALOG.stations.map((s) => s.id));
const PROGRAMME_IDS = new Set(CATALOG.curricula.map((c) => c.id));

/** Sites per map after the run, and the id prefix that keeps ids unique across maps. */
export const SW_TARGETS = {
  orleans: { target: 35, prefix: "no" },
  jefferson: { target: 29, prefix: "jf" },
  "st-bernard": { target: 26, prefix: "sb" },
  plaquemines: { target: 21, prefix: "pq" },
  "st-tammany": { target: 31, prefix: "st" },
  "sf-downtown": { target: 27, prefix: "dt" },
  "sf-mission": { target: 28, prefix: "mi" },
  "sf-golden-gate-park": { target: 27, prefix: "gg" },
  "sf-marina": { target: 27, prefix: "ma" },
  "sf-bayview": { target: 29, prefix: "bv" },
};

/**
 * Work types: kind (an engine kind already on the maps), label (the generic place word), unions, programmes,
 * a station pool (each site takes four, rotating through the pool), and the work line for the blurb.
 * `sf` / `no` override unions for San Francisco or New Orleans where the locals differ.
 */
export const SW_TEMPLATES = {
  hotel: { kind: "hospitality", label: "Hotel Service Floor", trades: ["unite-here", "seiu"], programmes: ["hotel-workers", "culinary-kitchen"],
    pool: ["housekeeping-room-turn", "hw-housekeeping-cart-and-chemical-safety", "hw-banquet-room-flip-and-staging", "hw-flatwork-ironer-and-folder-guarding", "laundry-plant-chemicals", "banquet-setup-lift", "banquet-hot-hold"],
    work: "housekeepers on the room turn, the laundry plant and the banquet crew" },
  kitchen: { kind: "hospitality", label: "Restaurant Kitchen", trades: ["unite-here"], programmes: ["culinary-kitchen", "bartending-course"],
    pool: ["kitchen", "knife-skills", "fryer-oil-change", "walk-in-cooler", "dish-pit", "allergen-control", "bar-well-setup", "grease-trap", "hood-suppression"],
    work: "the line cooks, the dish pit, the walk-in and the bar well" },
  school: { kind: "school", label: "School Campus", trades: ["aft", "csea", "seiu"], programmes: ["education-support-staff", "k12-literacy-and-life-skills"],
    pool: ["ed-custodial-chemical-dilution-and-floor-machine", "ed-playground-equipment-inspection", "ed-crossing-guard-intersection-control", "k12-reading-instructions-and-safety-labels", "ed-kitchen-receiving-and-warewash-sanitizing", "ed-bus-pretrip-and-loading-zone", "k12-first-aid-awareness-call-for-help", "ed-paraeducator-safe-lift-and-transfer", "ed-boiler-room-filter-change-lockout", "k12-teamwork-and-feedback"],
    work: "custodians, the crossing guard, the kitchen crew and a classroom lesson" },
  clinic: { kind: "hospital", label: "Community Clinic", trades: ["nnu", "seiu", "afscme"], programmes: ["healthcare-support", "first-responders"],
    pool: ["hc-patient-transport-and-safe-handling", "hc-environmental-services-isolation-room-turnover", "hc-linen-and-regulated-waste-handling", "triage-point", "hc-workplace-violence-deescalation-at-the-desk", "hc-hazardous-drug-spill-kit-response", "hc-dietary-tray-line-and-allergy-flags", "hc-code-response-support-and-crash-cart-check"],
    work: "patient transport, room turnover, regulated waste and the front desk" },
  dental: { kind: "hospital", label: "Dental Clinic", trades: ["seiu", "ufcw"], programmes: ["dental-hygiene-unspoken-smiles", "dental-careers-unspoken-smiles"],
    pool: ["patient-intake-screening", "operatory-turnover", "instrument-reprocessing", "sharps-exposure-response", "radiograph-safety", "infection-control-audit", "four-handed-dentistry", "chairside-emergency"],
    work: "intake, operatory turnover, instrument reprocessing and chairside safety" },
  health: { kind: "hospital", label: "Public Health Clinic", trades: ["seiu", "afscme", "nnu"], programmes: ["outbreak-response-who"],
    pool: ["who-ppe-donning-and-doffing", "who-vaccination-line", "who-contact-tracing-visit", "who-risk-communication-and-community-engagement", "who-water-sanitation-and-hygiene", "who-surveillance-and-case-definition"],
    work: "the vaccination line, protective equipment, contact tracing and community messages" },
  firehouse: { kind: "fire-station", label: "Fire Station", trades: ["iaff", "naemt"], programmes: ["first-responders", "fall-protection"],
    pool: ["structure-fire-sizeup", "firefighter-rehab-sector", "ambulance-scene-safety", "aerial-ladder", "cardiac-arrest-pit-crew", "overdose-response-naloxone", "traffic-incident-management", "ev-extrication"],
    work: "the engine company's size-up, the aerial ladder, the ambulance crew and rehab" },
  park: { kind: "park", label: "Park Grounds Yard", trades: ["afscme", "liuna", "seiu"], programmes: ["grounds-and-landscaping"],
    pool: ["gk-ride-on-mower-pre-start-and-slope-work", "gk-string-trimmer-and-blower-ppe-and-bystander-zone", "gk-tree-work-pole-saw-and-drop-zone", "gk-irrigation-controller-valve-box-and-backflow-check", "gk-chainsaw-start-and-limbing-on-the-ground", "gk-hardscape-paver-base-and-compaction", "gk-storm-cleanup-chipper-and-traffic-control", "ed-playground-equipment-inspection"],
    work: "mowers, trimmers, tree work and the irrigation boxes" },
  nursery: { kind: "nursery", label: "Plant Nursery", trades: ["afscme", "liuna"], programmes: ["grounds-and-landscaping"],
    pool: ["gk-greenhouse-nursery-chemical-storage-and-eyewash", "gk-pesticide-and-fertilizer-application-per-the-label", "gk-irrigation-controller-valve-box-and-backflow-check", "gk-storm-cleanup-chipper-and-traffic-control", "gk-hardscape-paver-base-and-compaction"],
    work: "the greenhouse chemical store, labelled applications and the irrigation" },
  recreation: { kind: "recreation", label: "Recreation Centre", trades: ["afscme", "seiu"], sf: ["afscme", "seiu-1021"], programmes: ["basketball-fundamentals", "property-management"],
    pool: ["bb-warmup-injury-prevention-and-hydration", "bb-scrimmage-and-sportsmanship-debrief", "pm-pool-and-spa-chemistry", "pm-community-room-and-events", "ed-playground-equipment-inspection", "bb-passing-and-catching", "pm-fitness-room-and-gym"],
    work: "the gym floor, the pool chemistry, the community room and the playground" },
  trail: { kind: "trail", label: "Trailhead Yard", trades: ["afscme", "liuna"], programmes: ["grounds-and-landscaping", "k12-practical-math"],
    pool: ["gk-hardscape-paver-base-and-compaction", "gk-string-trimmer-and-blower-ppe-and-bystander-zone", "k12-reading-a-map-scale-in-bay-world", "gk-tree-work-pole-saw-and-drop-zone", "gk-storm-cleanup-chipper-and-traffic-control"],
    work: "trail crews on the path base, the trimmers and a map-reading lesson" },
  substation: { kind: "substation", label: "Substation", trades: ["ibew"], programmes: ["energy-transition", "electrical-first-period"],
    pool: ["substation-switching", "line-truck", "transformer-vault", "arc-flash-label-study", "battery-yard", "or-transmission-line-right-of-way-patrol", "temporary-site-power"],
    work: "switching under a permit, the line truck, the transformer vault and arc-flash labels" },
  transit: { kind: "transit", label: "Bus Yard", trades: ["atu", "twu", "iam"], programmes: ["transit-ramp", "energy-transition"],
    pool: ["bus-depot-lift", "bus-yard-fuelling-and-brake-check", "tr-wheelchair-lift-and-securement-on-a-bus", "signal-cabinet", "et-ev-fleet-depot-charging-and-arc-flash"],
    work: "the depot lift, fuelling and brake checks, the wheelchair lift and the charging bay" },
  construction: { kind: "construction", label: "Housing Construction Site", trades: ["carpenters", "liuna", "opcmia", "iuoe"], programmes: ["builders-trades", "fall-protection", "cement-masons-and-plasterers"],
    pool: ["concrete-pour", "formwork-shoring", "bt-rebar-tying-and-impalement-protection", "scaffold-erection", "cm-slab-screed-bull-float-and-trowel", "leading-edge-and-horizontal-lifeline", "bt-masonry-wall-layout-and-mortar", "masonry-silica-scaffold", "cm-concrete-saw-cutting-with-water-and-silica-control"],
    work: "forms and rebar for the next pour, the scaffold and the slab finishers" },
  tower: { kind: "construction", label: "High-Rise Site", trades: ["ironworkers", "iuec", "iupat", "carpenters"], programmes: ["fall-protection", "glaziers-and-architectural-metal", "elevator-constructors"],
    pool: ["steel-erector", "leading-edge-and-horizontal-lifeline", "gl-curtain-wall-unit-setting-from-the-floor", "ew-hoistway-false-car-and-rail-setting", "gl-swing-stage-glazing-and-sealant", "fp-anchor-selection-and-rescue-plan", "ew-machine-room-lockout-and-brake-test", "gl-glass-handling-cart-and-crane-vacuum-lifter"],
    work: "steel erectors at the leading edge, the curtain wall going on and the hoistway crew" },
  renovation: { kind: "construction", label: "Renovation Site", trades: ["carpenters", "ua", "insulators", "ibew"], programmes: ["plumbers-and-pipefitters", "insulators-and-boilermakers", "roofers-and-waterproofers"],
    pool: ["pl-copper-press-and-solder-rough-in", "ib-asbestos-glovebag-removal-on-a-pipe", "rf-roof-tear-off-and-debris-chute", "pl-water-heater-and-tpr-valve-replacement", "rf-torch-applied-membrane-and-fire-watch", "pl-natural-gas-pressure-test-and-leak-check", "ib-firestop-and-fire-wrap-installation", "rf-skylight-and-hatch-guarding"],
    work: "plumbers on the rough-in, insulation abatement and the roofers on the tear-off" },
  warehouse: { kind: "warehouse", label: "Distribution Warehouse", trades: ["teamsters"], programmes: ["warehouse-and-logistics-automation", "job-readiness-edition"],
    pool: ["forklift-dock", "tw-dock-leveler-and-trailer-restraint-check", "tw-conveyor-jam-clearing-and-loto", "tdl-pick-pack-and-scan", "tw-battery-change-and-charging-bay-safety", "tw-high-bay-order-picker-fall-protection", "tdl-trailer-loading-and-dock-plate", "tw-amr-traffic-zone-entry-and-lockout"],
    work: "the dock, the conveyors, the charging bay and the order pickers" },
  grocery: { kind: "warehouse", label: "Grocery Distribution Centre", trades: ["ufcw", "teamsters"], programmes: ["grocery-and-meatpacking"],
    pool: ["gr-produce-receiving-cold-chain-and-pallet-jack", "gr-night-stocking-baler-and-compactor-lockout", "gr-meat-dept-band-saw-and-grinder-lockout", "gr-ammonia-leak-alarm-response-cold-plant", "gr-deli-slicer-sanitation-and-allergen-line", "gr-checkstand-ergonomics-and-robbery-prevention"],
    work: "cold-chain receiving, the baler, the meat room and the cold plant alarm" },
  postal: { kind: "warehouse", label: "Mail Processing Plant", trades: ["apwu", "npmhu", "nalc"], programmes: ["postal-and-mail-processing"],
    pool: ["ml-flat-sorter-guarding-and-lockout", "ml-parcel-sorter-conveyor-jam-and-loto", "ml-mail-handler-forklift-and-container-dock", "ml-delivery-van-pretrip-and-route-loading", "ml-suspicious-package-protocol", "ml-heat-and-cold-stress-on-route"],
    work: "the sorters, the container dock, the delivery vans and the package protocol" },
  fab: { kind: "workshop", label: "Fabrication Shop", trades: ["smart", "iam", "ibew"], programmes: ["bay-area-union-edition", "aerospace-defense-and-robotics", "situational-awareness"],
    pool: ["press-brake", "sm-shop-layout-and-shear", "sm-duct-fabrication-and-seams", "welding", "sm-plasma-table-and-fume", "ad-robot-cell-lockout-and-safe-reentry", "cnc-cell", "sm-tig-and-spot-welding"],
    work: "the press brake, the shear, the welding bay and a robot cell" },
  garment: { kind: "workshop", label: "Garment Workshop", trades: ["workers-united"], programmes: ["sewing-garment-trades"],
    pool: ["machine-threading-needle", "lockstitch-seam-guard", "serger-overlock", "cutting-table-rotary", "industrial-press-steam", "garment-inspection-finish", "sewing-ergonomics-shift"],
    work: "the lockstitch and serger lines, the cutting table and the steam press" },
  media: { kind: "events", label: "Sound Stage", trades: ["iatse", "sag-aftra"], programmes: ["screen-and-media-crafts", "live-events"],
    pool: ["md-set-safety-meeting-and-stunt-go-no-go", "md-sound-stage-electrical-distribution-and-cable-crossings", "stage-load-in-and-truss-rigging", "md-camera-dolly-and-crane-track", "stage-power", "md-location-shoot-traffic-control-and-heat-hydration"],
    work: "the set safety meeting, stage power, the truss load-in and the camera track" },
  hall: { kind: "union-hall", label: "Union Hiring Hall", trades: ["carpenters", "ibew", "liuna", "unite-here"], programmes: ["job-readiness-edition", "civic-leadership-and-ei"],
    pool: ["union-hall-and-dispatch", "jobsite-orientation-and-osha-10", "apprenticeship-application-and-test", "public-meeting-chair", "community-listening-session"],
    work: "dispatch, jobsite orientation, the apprenticeship test and the members' meeting" },
  rail: { kind: "rail", label: "Rail Siding", trades: ["bmwed", "blet", "smart-td", "brs"], programmes: ["railroad-crafts"],
    pool: ["ra-roadway-worker-protection-and-job-briefing", "ra-blue-flag-protection-in-the-yard", "ra-switch-inspection-and-lubrication", "ra-hand-brake-and-securement-on-a-grade", "ra-crossing-signal-maintenance-and-flagging", "ra-air-brake-test-and-train-inspection", "ra-tie-and-rail-replacement-with-track-machines"],
    work: "roadway worker protection, blue flags, the switches and the crossing signals" },
  pump: { kind: "pump", label: "Pumping Station", trades: ["iuoe", "ibew", "uwua", "afscme"], programmes: ["water-and-gas-utility-crews", "confined-space", "electrical-first-period"],
    pool: ["lift-station", "valve-vault", "cs-permit-entry-and-attendant-duties", "motor-control-center", "ut-night-storm-response-crew-and-portable-generator", "manhole-entry-and-atmospheric-monitoring", "cs-ventilation-and-air-monitoring-plan"],
    work: "the lift station, the valve vault under a permit, the motor controls and the storm generator" },
  utility: { kind: "staging", label: "Utility Crew Yard", trades: ["uwua", "liuna", "ua"], programmes: ["water-and-gas-utility-crews", "plumbers-and-pipefitters"],
    pool: ["ut-water-main-break-emergency-shutdown-and-excavation", "ut-hydrant-flow-test-and-flushing-with-traffic-control", "ut-service-line-locate-and-hand-dig-near-gas-main", "ut-gas-meter-set-and-regulator-vent", "ut-pe-pipe-fusion-and-squeeze-off", "pl-underground-sewer-lateral-and-trench-shoring"],
    work: "water main repairs, hydrant flushing, locating and hand digging near gas" },
  port: { kind: "port", label: "Cargo Terminal", trades: ["ila", "iuoe", "teamsters"], sf: ["ilwu", "iuoe", "teamsters"], programmes: ["port-operations", "ports-maritime-ecology"],
    pool: ["dock-crane", "container-lashing", "mooring-line", "po-yard-hostler-and-pedestrian-separation", "reefer-yard-monitoring", "straddle-carrier-ops", "shore-power-hookup", "hazmat-container-inspection"],
    work: "the dock crane, lashing gangs, the mooring lines and the reefer yard" },
  shipyard: { kind: "shipyard", label: "Boat Repair Yard", trades: ["ibb", "ironworkers", "ua", "iupat"], programmes: ["insulators-and-boilermakers", "commercial-diving-and-scientific-scuba"],
    pool: ["shipyard-hotwork", "ib-pressure-vessel-confined-entry-and-hot-work", "tank-lining", "cd-pier-piling-inspection-and-wrap-repair", "ib-refractory-and-castable-installation", "cd-underwater-wet-welding-and-cutting"],
    work: "hot work on the hull, tank lining, the piling divers and the boilermakers" },
  harbour: { kind: "harbour", label: "Boat Harbour", trades: ["ibu", "siu"], programmes: ["yacht-and-charter-crew", "marine-ecology-and-restoration"],
    pool: ["yc-line-handling-and-docking-in-crosswind", "yc-fuel-dock-transfer-and-spill-kit", "yc-pre-departure-safety-briefing-and-guest-count", "me-water-column-sampling-from-a-small-boat", "yc-shore-power-connection-and-in-water-electrical-safety", "spill-boom-deploy", "yc-engine-room-pre-start-and-bilge-check"],
    work: "line handling, the fuel dock and its spill kit, the pre-departure briefing and water sampling" },
  landing: { kind: "landing", label: "Workboat Landing", trades: ["ibu", "meba", "siu"], programmes: ["port-operations", "bay-restoration-maritime-underwater"],
    pool: ["mw-workboat-towing-and-line-handling", "br-vhf-and-navigation-in-a-work-zone", "br-cold-water-immersion-and-mob-recovery", "mooring-line", "vessel-gangway-and-hatch-cover-safety", "mw-ferry-deckhand-and-passenger-safety"],
    work: "workboat towing, the radio in a work zone, cold-water recovery and the gangway" },
  wetland: { kind: "wetland", label: "Marsh Restoration Camp", trades: ["liuna", "iuoe", "afscme"], programmes: ["marine-ecology-and-restoration", "bay-restoration-maritime-underwater"],
    pool: ["marsh-transect-survey", "me-tidal-marsh-channel-restoration-day", "br-native-planting-and-erosion-mats", "br-water-quality-sonde-calibration-and-deploy", "living-shoreline", "me-invasive-species-identification-and-reporting", "me-shoreline-debris-and-microplastics-survey", "br-tidal-marsh-grading-amphibious-excavator"],
    work: "the marsh transect, channel restoration, native planting and the water-quality sonde" },
  levee: { kind: "levee", label: "Levee Maintenance Yard", trades: ["liuna", "iuoe", "afscme"], programmes: ["heavy-equipment-operators", "bay-restoration-maritime-underwater"],
    pool: ["br-levee-inspection-and-seepage", "op-dozer-slope-work-and-rollover-protection", "op-compactor-lift-thickness-and-edge", "op-equipment-daily-walkaround-and-fluids", "op-grader-fine-grade-and-crown", "tide-gate"],
    work: "the seepage walk, the dozer on the slope, the compactor and the daily walkaround" },
  refinery: { kind: "refinery", label: "Tank Farm Maintenance Yard", trades: ["usw", "ibb", "ua", "insulators"], programmes: ["insulators-and-boilermakers", "plumbers-and-pipefitters", "confined-space"],
    pool: ["ib-pressure-vessel-confined-entry-and-hot-work", "tank-lining", "cs-permit-entry-and-attendant-duties", "pl-steam-trap-and-condensate-line-repair", "ib-hydrostatic-test-and-inspector-witness", "ib-mechanical-insulation-pipe-and-jacketing", "cs-non-entry-retrieval-and-tripod"],
    work: "vessel entry under a permit, tank lining, steam traps and the hydrostatic test" },
  airmon: { kind: "remediation", label: "Air Monitoring Station", trades: ["afscme", "liuna"], programmes: ["air-quality-monitoring", "hazmat-environmental"],
    pool: ["air-monitor", "mobile-air-lab", "opacity-reading", "stack-test", "drum-sampling-and-overpack", "landfill-gas"],
    work: "the fenceline monitor, the mobile air lab, opacity readings and drum sampling" },
  cleanup: { kind: "remediation", label: "Clean-up Yard", trades: ["liuna", "iuoe", "teamsters"], programmes: ["hunters-point-bay-restoration", "hazmat-environmental"],
    pool: ["soil-loadout", "haul-road-dust", "decon-line", "air-monitor", "stormwater-outfall", "hz-drum-staging-and-compatibility-segregation", "sampling-well", "vapor-mitigation"],
    work: "soil loadout, dust control on the haul road, the decon line and the air monitors" },
  campusplant: { kind: "campus", label: "Campus Central Plant", trades: ["iuoe", "afscme", "seiu", "ibew"], programmes: ["stationary-engineer", "property-management"],
    pool: ["chiller-plant", "boiler-room", "cooling-tower", "se-steam-trap-survey-and-condensate-return", "se-building-automation-alarm-triage", "pm-fire-alarm-panel-room", "pm-electrical-room", "elevator-pit"],
    work: "the chillers, the boiler room, the cooling tower and the alarm panel" },
  lab: { kind: "campus", label: "Research Lab Building", trades: ["aaup", "afscme", "seiu", "iam"], programmes: ["education-support-staff", "aerospace-defense-and-robotics"],
    pool: ["ed-science-lab-chemical-storage-and-eyewash", "ad-cleanroom-gowning-and-esd-discipline", "ad-hazardous-fluid-servicing-with-a-buddy", "hc-hazardous-drug-spill-kit-response", "ad-robot-cell-lockout-and-safe-reentry", "ad-test-stand-exclusion-zone-and-holds"],
    work: "the chemical store and eyewash, cleanroom gowning, fluid servicing and a robot cell" },
};

/** The next work type per district character (a district cycles through its list). */
export const SW_CYCLES = {
  quarter: ["kitchen", "school", "renovation", "clinic", "hotel", "garment", "firehouse", "dental", "media"],
  garden: ["school", "park", "renovation", "firehouse", "nursery", "clinic", "recreation"],
  suburb: ["school", "firehouse", "park", "clinic", "recreation", "substation", "grocery", "pump", "construction", "transit", "dental", "health"],
  industrial: ["warehouse", "fab", "rail", "substation", "postal", "grocery", "utility", "transit", "pump", "garment", "construction"],
  port: ["port", "shipyard", "harbour", "landing", "warehouse"],
  wetland: ["wetland", "levee", "pump", "trail", "wetland"],
  refinery: ["refinery", "airmon", "substation", "firehouse", "utility"],
  campus: ["campusplant", "lab", "clinic", "construction", "school"],
  downtown: ["tower", "hotel", "hall", "kitchen", "media", "transit", "clinic"],
  park: ["park", "nursery", "recreation", "trail"],
};
/** How strongly a character draws sites (a marsh or a park takes fewer than a town). */
const SW_CHAR_WEIGHT = { wetland: 0.35, park: 0.6, refinery: 0.8, port: 0.9 };

/** Short public place names where a district's name reads awkwardly in a site name. */
const SW_PLACE = {
  "orleans/university-district": "Uptown Campus", "orleans/medical-district": "Medical District", "orleans/lakeview-gentilly": "Lakeview and Gentilly",
  "orleans/riverfront-wharves": "Riverfront", "orleans/inner-harbor": "Industrial Canal", "orleans/industrial-almonaster": "Almonaster Corridor",
  "orleans/lower-ninth-ward": "Lower Ninth Ward", "orleans/bayou-bienvenue-triangle": "Bayou Bienvenue", "orleans/eastern-lakefront-marsh": "Eastern Lakefront",
  "orleans/garden-district-uptown": "Uptown", "orleans/central-business-district": "Central Business District",
  "jefferson/airport-side": "Kenner Airport Side", "jefferson/bucktown": "Bucktown", "jefferson/westbank-waterfront": "West Bank Waterfront",
  "st-bernard/refinery-corridor": "Refinery Corridor", "st-bernard/battlefield-grounds": "Chalmette", "st-bernard/central-wetlands": "Central Wetlands",
  "st-bernard/shell-beach": "Shell Beach", "st-bernard/eastern-marsh": "Eastern Marsh", "st-bernard/arabi-chalmette": "Arabi and Chalmette",
  "plaquemines/refinery-bend": "Refinery Bend", "plaquemines/the-birdfoot": "Birdfoot Delta", "plaquemines/west-bank-marsh": "West Bank Marsh", "plaquemines/east-bank-marsh": "East Bank Marsh",
  "st-tammany/slidell-industrial": "Slidell", "st-tammany/covington-old-town": "Covington", "st-tammany/piney-woods-west": "Piney Woods West",
  "st-tammany/piney-woods-east": "Piney Woods East", "st-tammany/big-branch": "Big Branch", "st-tammany/madisonville-waterfront": "Madisonville",
  "st-tammany/covington-campus": "Covington Campus",
  "sf-downtown/chinatown-nob-hill": "Nob Hill", "sf-downtown/north-beach": "North Beach", "sf-downtown/russian-hill-marina": "Russian Hill",
  "sf-downtown/western-addition": "Western Addition", "sf-downtown/embarcadero-waterfront": "Embarcadero", "sf-downtown/mission-dolores": "Mission Dolores",
  "sf-mission/mission-district": "Mission", "sf-mission/dogpatch-waterfront": "Dogpatch", "sf-mission/noe-and-castro": "Noe Valley",
  "sf-mission/islais-industrial": "Islais Creek", "sf-mission/downtown-edge": "Rincon",
  "sf-golden-gate-park/lands-end-lincoln-park": "Lincoln Park", "sf-golden-gate-park/lake-merced-shore": "Lake Merced", "sf-golden-gate-park/the-panhandle": "Panhandle",
  "sf-marina/presidio-forest": "Presidio", "sf-marina/western-addition": "Western Addition", "sf-marina/inner-richmond": "Inner Richmond",
  "sf-bayview/port-south": "Southern Waterfront", "sf-bayview/pier-96-yard": "Islais Creek Terminals", "sf-bayview/islais-industrial": "Islais Creek",
  "sf-bayview/mission-edge": "Excelsior", "sf-bayview/shipyard": "Hunters Point Shipyard", "sf-bayview/candlestick": "Candlestick Point",
  "sf-bayview/visitacion": "Visitacion Valley", "sf-bayview/bernal-portola": "Portola",
};

const swSlug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const swPlaceOf = (p, d) => SW_PLACE[`${p.id}/${d.id}`] ?? d.name.replace(/^the /i, "").replace(/,.*$/, "").replace(/ along .*$/, "").replace(/^./, (c) => c.toUpperCase());
const MARK_BEGIN = "// sw:begin";
const MARK_END = "// sw:end";

/** Strip the generated block from a module's source. */
export function swStrip(src) {
  const a = src.indexOf(MARK_BEGIN);
  if (a < 0) return src;
  const lineStart = src.lastIndexOf("\n", a) + 1;
  const b = src.indexOf(MARK_END, a);
  const lineEnd = src.indexOf("\n", b) + 1;
  return src.slice(0, lineStart) + src.slice(lineEnd);
}

/** The index of the `]` that closes the parish's `sites` array (string-aware bracket match). */
function swSitesClose(src) {
  const m = /(^|\n)\s*"?sites"?\s*:\s*\[/.exec(src);
  if (!m) throw new Error("no sites array");
  let i = m.index + m[0].length, depth = 1, q = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if (c === "[") depth++;
    else if (c === "]" && --depth === 0) return i;
  }
  throw new Error("unclosed sites array");
}

/** Insert the generated entries at the end of the sites array. */
export function swInsert(src, entries, indent) {
  const close = swSitesClose(src);
  let head = src.slice(0, close).replace(/\s+$/, "");
  if (!/[,[]$/.test(head)) head += ",";
  const closeIndent = indent.slice(0, Math.max(0, indent.length - (indent.length > 2 ? 2 : 1)));
  const block = [`${indent}${MARK_BEGIN} — tools/gen_sw_sites.mjs (console SITEWORKS): procedural sites; re-run the tool, do not hand-edit`,
    ...entries.map((e) => `${indent}${JSON.stringify(e)},`), `${indent}${MARK_END}`].join("\n");
  return `${head}\n${block}\n${closeIndent}${src.slice(close)}`;
}

/** The static spot test for one candidate in one parish (everything but the other sites). */
function swSpotOk(p, prep, x, z, d, loose = false) {
  const half = p.size / 2;
  // Out of the outermost chunk ring, so the streamed square around a site is never clamped by the field's edge.
  if (Math.abs(x) > half - E.NP_CHUNK - 8 || Math.abs(z) > half - E.NP_CHUNK - 8) return false;
  if (!E.npPointInPoly(x, z, d.poly) || E.npDistrictAt(p, x, z)?.id !== d.id) return false;
  // The centre is always off every water body; the pad ring is off open water (a loose spot lets marsh and a levee
  // under the pad, as the river towns' hand-written sites do — the engine flattens the pad).
  const wet = (wx, wz) => { const w = E.npWaterAt(p, wx, wz); return w && !(w.kind === "wetland" && (loose || d.character === "wetland")); };
  if (E.npWaterAt(p, x, z)) return false;
  for (const r of loose ? [20, 45] : [20, 45, 70]) for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
    if (wet(px, pz)) return false;
    if (!loose && E.npLeveeRise(p, px, pz) > 0) return false;
  }
  if (!loose && E.npLeveeRise(p, x, z) > 0) return false;
  // The inner pad (where KREWE's dressing puts a pump house or a shed without its own dry test) is dry of every water.
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; if (E.npWaterAt(p, x + Math.cos(a) * 26, z + Math.sin(a) * 26)) return false; }
  for (const w of p.water ?? []) if (w.width && E.npPolyDistance(x, z, w.poly).d < w.width / 2 + 8 + E.NP_PAD + 12) return false;
  for (const h of p.hills ?? []) if (Math.hypot(x - h.center[0], z - h.center[1]) < h.radius + E.NP_PAD + 20) return false;
  const near = E.npNearestRoad(p, x, z);
  if (near.road && near.road.kind !== "ferry" && near.d < (E.NP_ROAD_KINDS[near.road.kind]?.width ?? 8) / 2 + (loose ? 8 : 16)) return false;
  for (const l of p.landmarks ?? []) if (Math.hypot(x - l.position[0], z - l.position[1]) < 40) return false;
  for (const c of p.connectors ?? []) if (c.from?.position && Math.hypot(x - c.from.position[0], z - c.from.position[1]) < 40) return false;
  const h0 = E.npHeightAt(p, x, z);
  if (!loose && (Math.abs(E.npHeightAt(p, x + 20, z) - h0) > 0.3 || Math.abs(h0 - E.NP_GROUND) > 0.3)) return false;
  void prep;
  return true;
}

/** Place the generated sites for one parish (the parish object has no generated sites in it). */
export function swPlan(p, cfg) {
  const prep = E.npPrepare(p);
  const need = cfg.target - p.sites.length;
  const out = [];
  if (need <= 0) return out;
  const MIN_SEP = 2 * E.NP_PAD + 12;
  const all = p.sites.map((s) => s.position.slice());
  const ids = new Set(p.sites.map((s) => s.id)), names = new Set(p.sites.map((s) => s.name));
  const dist = p.districts.map((d) => {
    const bb = E.npBBox(d.poly), step = 20, cands = [], loose = [];
    for (let z = Math.ceil(bb.minZ / step) * step; z <= bb.maxZ; z += step) for (let x = Math.ceil(bb.minX / step) * step; x <= bb.maxX; x += step) {
      if (swSpotOk(p, prep, x, z, d)) cands.push([x, z]); else if (swSpotOk(p, prep, x, z, d, true)) loose.push([x, z]);
    }
    const area = Math.abs(E.npPolyArea(d.poly)) / 1e6;
    const have = p.sites.filter((s) => E.npDistrictAt(p, ...s.position)?.id === d.id).length;
    return { d, cands, loose, weight: Math.pow(Math.max(area, 0.02), 0.6) * (SW_CHAR_WEIGHT[d.character] ?? 1), have, added: 0, cx: (bb.minX + bb.maxX) / 2, cz: (bb.minZ + bb.maxZ) / 2 };
  });
  const minDist = (x, z) => all.reduce((m, q) => Math.min(m, Math.hypot(x - q[0], z - q[1])), Infinity);
  for (let n = 0; n < need; n++) {
    const free = (list) => list.some(([x, z]) => minDist(x, z) >= MIN_SEP);
    const order = dist.filter((r) => SW_CYCLES[r.d.character] && (free(r.cands) || free(r.loose)))
      .sort((a, b) => (a.have + a.added + 1) / a.weight - (b.have + b.added + 1) / b.weight || a.d.id.localeCompare(b.d.id));
    const r = order[0];
    if (!r) break;
    let best = null, bestD = -1;
    for (const [x, z] of free(r.cands) ? r.cands : r.loose) { const md = minDist(x, z); if (md >= MIN_SEP && md > bestD + 1e-9) { best = [x, z]; bestD = md; } }
    const cycle = SW_CYCLES[r.d.character];
    const tkey = cycle[(r.added + r.have) % cycle.length];
    const t = SW_TEMPLATES[tkey];
    const place = swPlaceOf(p, r.d);
    let name = `${place} ${t.label}`;
    if (names.has(name)) {
      const dx = best[0] - r.cx, dz = best[1] - r.cz;
      const side = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? "East" : "West") : (dz > 0 ? "South" : "North");
      name = `${place} ${side} ${t.label}`;
      for (const alt of ["North", "South", "East", "West", "Upper", "Lower", "Riverside", "Crossroads"]) { if (!names.has(name)) break; name = `${place} ${alt} ${t.label}`; }
    }
    let id = `${cfg.prefix}-sw-${swSlug(name)}`;
    while (ids.has(id)) id += "-b";
    const regionSf = p.region === "san-francisco";
    const trades = (regionSf ? t.sf : t.no) ?? t.trades;
    const k = (r.added + out.length) % t.pool.length;
    const stations = [0, 1, 2, 3].map((i) => t.pool[(k + i) % t.pool.length]).filter((s, i, a) => a.indexOf(s) === i);
    const entry = { id, name, kind: t.kind, position: best, trades, programmes: t.programmes, stations,
      blurb: `A procedural ${t.label.toLowerCase().replace(/^(.)/, (c) => c)} in ${r.d.name}: ${t.work}.` };
    out.push(entry); all.push(best); ids.add(id); names.add(name); r.added++;
  }
  return out;
}

/** Validate a template table against the catalog and the unions registry (throws on any unknown id). */
export function swValidateTemplates() {
  const bad = [];
  for (const [k, t] of Object.entries(SW_TEMPLATES)) {
    for (const u of [...t.trades, ...(t.sf ?? []), ...(t.no ?? [])]) if (!UNION_IDS.has(u)) bad.push(`${k}: union ${u}`);
    for (const c of t.programmes) if (!PROGRAMME_IDS.has(c)) bad.push(`${k}: programme ${c}`);
    for (const s of t.pool) if (!STATION_IDS.has(s)) bad.push(`${k}: station ${s}`);
    if (/\d/.test(t.label + t.work)) bad.push(`${k}: a figure in the label or work line`);
  }
  for (const [ch, list] of Object.entries(SW_CYCLES)) for (const k of list) if (!SW_TEMPLATES[k]) bad.push(`cycle ${ch}: ${k}`);
  return bad;
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--check");
  const only = args.filter((a) => !a.startsWith("--"));
  const bad = swValidateTemplates();
  if (bad.length) { console.error(`gen_sw_sites: templates do not resolve:\n  ${bad.join("\n  ")}`); process.exit(1); }
  let total = 0, before = 0;
  for (const [id, cfg] of Object.entries(SW_TARGETS)) {
    const file = join(SHARED, `np-data-${id}.js`);
    const src0 = readFileSync(file, "utf8");
    const src = swStrip(src0);
    if (only.length && !only.includes(id)) continue;
    // Load the stripped module from a data URL so the hand-written sites are the ones placed around.
    const m = await import(`data:text/javascript;base64,${Buffer.from(src).toString("base64")}`);
    const p = Object.values(m).find((v) => v && Array.isArray(v?.sites));
    const entries = swPlan(p, cfg);
    const indentMatch = /\n(\s*)[{"]/.exec(src.slice(src.search(/"?sites"?\s*:\s*\[/)));
    const indent = indentMatch ? indentMatch[1] : "    ";
    const next = entries.length ? swInsert(src, entries, indent) : src;
    if (!dry && next !== src0) writeFileSync(file, next);
    before += p.sites.length; total += p.sites.length + entries.length;
    const short = cfg.target - p.sites.length - entries.length;
    console.log(`  ${id}: ${p.sites.length} hand-written + ${entries.length} procedural = ${p.sites.length + entries.length}${short > 0 ? ` (${short} short of ${cfg.target}: no room left)` : ""}`);
  }
  console.log(`gen_sw_sites: ${total} sites on the ten maps (${before} hand-written)${dry ? " — check only, nothing written" : ""}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
