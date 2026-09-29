// LA-PROGRAMME — the Louisiana Development Training Programme, data (console LA-PROGRAMME, docs/consoles/LA-PROGRAMME.md,
// docs/louisiana-programme.md). SmartCiti.X Powered by AGI Corp.
//
// Pure data, no imports. The ACADEMY pattern (ea-academy.js) for the Louisiana development sites:
//   track      — the seven projects of the facts file (docs/sources/la-facts.md, a copy of the wave's facts file), FastSites
//                site readiness and the growth cities (places only). `figures` and every work type's `facts` are verbatim
//                phrases of that file; tools/check_la_programme.mjs compares them. No growth percentage is ever quoted.
//   → where    — the fixed map ids and site ids the map consoles build (`$SP/louisiana/*-ids.md`). GUARDED: a place counts only
//                when its map is in this tree and the site is on that map (pjGuardedUs()'s pattern); until then it is pending.
//   → crafts   — tools/unions.json ids, a trade reference only.
//   → training — real catalog stations and the LP_SIMS simulations (every step a real station step).
//   → credential — an existing competency on the competency layer.
// The platform has NO partnership with any company, agency or union named here and never describes an employer's hiring or
// programme: job figures are quoted as the sources state them; roles are general kinds of work to train.
// Every top-level name is prefixed lp/LP_ (the bundler shares one scope).

export const LP_NAME = "Louisiana Development Training Programme";
export const LP_NO_PARTNERSHIP = "The Louisiana Development Training Programme is the platform's own training programme. It has no partnership with SpaceX, Meta, Applied Digital, Shintech, Black Bayou, Saronic, AVEX, Woodside, Louisiana Economic Development or any union, and it does not deliver or describe any employer's or union's programme or hiring. Company names identify the public projects the sources describe; union names are trade references from the platform's registry; every practice is taught from each station's own cited safety standards. Project site layouts on the maps are the platform's illustration: the parishes, waterways and towns are real.";
export const LP_SOURCES = [
  { label: "Louisiana Economic Development — FastSites", url: "https://www.opportunitylouisiana.gov/fastsites" },
  { label: "Louisiana Economic Development — SpaceX Starbase Louisiana", url: "https://www.opportunitylouisiana.gov/spacex" },
  { label: "Louisiana Economic Development — Meta data center", url: "https://www.opportunitylouisiana.gov/data-center/meta" },
  { label: "Louisiana Economic Development — news releases (Applied Digital, Shintech, Black Bayou, Saronic, AVEX)", url: "https://www.opportunitylouisiana.gov/news" },
  { label: "CNBC, 25 August 2026 (Starbase Louisiana)", url: "https://www.cnbc.com" },
  { label: "KPLC, 29 April 2025 (Woodside Louisiana LNG) and 21 May 2026 (Port of Vinton)", url: "https://www.kplctv.com" },
  { label: "Louisiana Radio Network, 15 July 2026 (statewide nonfarm jobs)", url: "https://louisianaradionetwork.com" },
];

// The six role pathways' competency candidates, per level (the best overlap wins; a capstone fills the rest — eaCapstone's rule).
export const LP_LEVELS = [
  { id: "aware", title: "Awareness and K-12", who: "school districts, career centres and community members", requiredScore: 60, dueDays: 14 },
  { id: "entry", title: "Pre-apprentice", who: "pre-apprenticeship cohorts and new entrants", requiredScore: 70, dueDays: 21 },
  { id: "appr", title: "Apprentice", who: "registered apprentices in the crafts the work involves", requiredScore: 80, dueDays: 42 },
  { id: "jw", title: "Journeyworker refresher", who: "journey-level workers taking a pre-job or annual refresher", requiredScore: 85, dueDays: 14 },
  { id: "lead", title: "Supervisor / crew lead", who: "forepersons, crew leads and site safety staff", requiredScore: 90, dueDays: 28 },
];

const LP_K12 = {
  build: ["k12-simple-machines-at-a-crane", "k12-reading-instructions-and-safety-labels", "k12-es-who-does-this-work"],
  power: ["k12-circuits-at-the-electrical-bench", "k12-energy-transfer-at-the-wind-farm", "k12-es-who-does-this-work"],
  water: ["k12-by-how-a-levee-holds-water-back", "k12-es-the-tidal-marsh-nursery", "k12-buoyancy-and-pressure-in-the-deep"],
};

/**
 * Role pathways — general occupational kinds of work (never any employer's hiring). `stations` is the pathway's pool in ladder
 * order (entry takes the first three, apprentice all, refresher the first three plus every simulation, crew lead all plus the
 * debrief). `credentials[level]` are competency ids, the family's preference first.
 */
export const LP_PATHWAYS = [
  { id: "construction", title: "Construction trades", kinds: "electricians, pipefitters, ironworkers, operators, carpenters, labourers",
    crafts: [{ union: "ibew", role: "inside wiremen and linemen" }, { union: "ua", role: "pipefitters and plumbers" }, { union: "ironworkers", role: "structural ironworkers and rebar" }, { union: "iuoe", role: "operating engineers" }, { union: "carpenters", role: "carpenters, millwrights and pile drivers" }, { union: "liuna", role: "construction craft labourers" }],
    tracks: ["meta-richland", "delta-forge", "shintech", "black-bayou", "saronic", "avex", "fastsites", "growth-cities", "starbase"],
    stations: ["op-excavator-trench-and-utility-locate", "trench-box", "concrete-pour", "steel-erector", "scaffold-erection", "crane-yard", "electrical", "formwork-shoring", "op-crawler-crane-assembly-and-load-chart", "bt-rebar-tying-and-impalement-protection"],
    sims: ["lp-sim-duct-bank-excavation", "lp-sim-data-hall-energised-work"], k12: LP_K12.build,
    credentials: { aware: ["k12-practical-math", "k12-science", "k12-literacy-and-life-skills"], entry: ["core-trenching", "builders-trades", "core-fall-protection"], appr: ["builders-trades", "heavy-equipment-operators", "fall-protection"], jw: ["core-trenching", "core-fall-protection", "core-crane-rigging"], lead: ["situational-awareness", "builders-trades"] } },
  { id: "datacenter-ops", title: "Data-center operations", kinds: "critical-environment technicians, electricians, HVAC, network and server techs, safety and security",
    crafts: [{ union: "ibew", role: "critical-facility electricians" }, { union: "ua", role: "HVAC and chilled-water service" }, { union: "iuoe", role: "stationary engineers on the plant" }, { union: "cwa", role: "network and cabling technicians" }],
    tracks: ["meta-richland", "delta-forge"],
    stations: ["data-hall", "ws-data-hall-busway-install-and-torque-signoff", "ws-raised-floor-tile-lift-and-cable-tray-safety", "chiller-plant", "cooling-tower", "motor-control-center", "arc-flash-label-study", "substation-switching", "fire-pump"],
    sims: ["lp-sim-data-hall-energised-work"], k12: LP_K12.power,
    credentials: { aware: ["k12-science", "k12-practical-math"], entry: ["core-lockout-tagout", "electrical-first-period"], appr: ["wind-and-data-infrastructure", "electrical-first-period", "stationary-engineer"], jw: ["core-lockout-tagout", "electrical-first-period"], lead: ["situational-awareness", "wind-and-data-infrastructure"] } },
  { id: "process", title: "Process operators and maintenance", kinds: "chemical and gas-storage operators, maintenance mechanics, instrument and electrical",
    crafts: [{ union: "usw", role: "process operators and maintenance" }, { union: "ua", role: "pipefitters on process piping" }, { union: "insulators", role: "mechanical insulators" }, { union: "ibew", role: "electricians" }],
    tracks: ["shintech", "black-bayou"],
    stations: ["gas-leak-survey", "lp-gas-storage-wellpad-awareness", "motor-control-center", "hot-tap", "pl-natural-gas-pressure-test-and-leak-check", "ib-mechanical-insulation-pipe-and-jacketing", "ib-hydrostatic-test-and-inspector-witness", "chlorine-room", "tank-lining", "ib-pressure-vessel-confined-entry-and-hot-work"],
    sims: ["lp-sim-wellpad-lockout"], k12: LP_K12.build,
    credentials: { aware: ["k12-science", "k12-literacy-and-life-skills"], entry: ["core-lockout-tagout", "core-hazard-communication", "core-confined-space"], appr: ["insulators-and-boilermakers", "plumbers-and-pipefitters", "confined-space"], jw: ["core-lockout-tagout", "core-confined-space", "core-hot-work"], lead: ["situational-awareness", "hazmat-environmental"] } },
  { id: "marine", title: "Marine trades", kinds: "welders, shipfitters, marine electricians, painters and blasters",
    crafts: [{ union: "ibb", role: "shipbuilders and boilermakers" }, { union: "iam", role: "machinists" }, { union: "ibew", role: "marine electricians" }, { union: "iupat", role: "painters and blasters" }, { union: "carpenters", role: "pile drivers on the slips" }],
    tracks: ["saronic"],
    stations: ["shipyard-hotwork", "welding", "lp-marine-vessel-electrical-safety", "shore-power-hookup", "tank-lining", "bridge-blast", "dock-crane", "op-pile-driving-rig-and-lead-setup", "vessel-gangway-and-hatch-cover-safety"],
    sims: ["lp-sim-hull-block-weld-fire-watch"], k12: LP_K12.water,
    credentials: { aware: ["k12-science", "k12-practical-math"], entry: ["core-hot-work", "core-respiratory-protection"], appr: ["port-operations", "insulators-and-boilermakers", "rigging-lifting"], jw: ["core-hot-work", "core-respiratory-protection", "core-confined-space"], lead: ["situational-awareness", "port-operations"] } },
  { id: "aviation-mro", title: "Aviation MRO", kinds: "A&P mechanics, aircraft painters, sheet-metal and composites",
    crafts: [{ union: "iam", role: "aircraft mechanics" }, { union: "iupat", role: "aircraft painters" }, { union: "smart", role: "sheet-metal workers" }, { union: "teamsters", role: "aircraft maintenance technicians" }],
    tracks: ["avex"],
    stations: ["av-hangar-jacking-and-stands", "av-ground-power-and-static-bonding-before-fuel", "paint-sprayer", "ib-spray-foam-and-respirator-fit", "av-borescope-and-tool-control-inventory", "ad-depot-tool-control-and-fod-walk", "av-marshalling-and-wingwalker-signals", "av-pushback-tug-and-towbar-connection"],
    sims: ["lp-sim-paint-hangar-ventilation-ppe", "lp-sim-freighter-conversion-jacking"], k12: LP_K12.build,
    credentials: { aware: ["k12-science", "k12-literacy-and-life-skills"], entry: ["core-respiratory-protection", "aviation-maintenance-and-ground"], appr: ["aviation-maintenance-and-ground", "aerospace-defense-and-robotics"], jw: ["aviation-maintenance-and-ground", "core-respiratory-protection"], lead: ["situational-awareness", "aviation-maintenance-and-ground"] } },
  { id: "launch-support", title: "Launch-site support", kinds: "heavy civil, cryogenic-safety awareness, marsh restoration",
    crafts: [{ union: "iuoe", role: "operating engineers on mats and dredges" }, { union: "liuna", role: "labourers on marsh and civil crews" }, { union: "ironworkers", role: "ironworkers" }, { union: "ua", role: "pipefitters (awareness of cryogenic service only)" }, { union: "ila", role: "longshore workers at the shipping dock" }],
    tracks: ["starbase", "black-bayou"],
    stations: ["br-tidal-marsh-grading-amphibious-excavator", "dredge-barge", "me-tidal-marsh-channel-restoration-day", "marsh-transect-survey", "lp-cryogenic-propellant-awareness", "ad-hazardous-fluid-servicing-with-a-buddy", "ad-test-stand-exclusion-zone-and-holds", "ad-payload-crane-lift-with-a-lift-plan", "br-levee-inspection-and-seepage", "concrete-pour"],
    sims: ["lp-sim-marsh-mat-and-dredge-pipe"], k12: LP_K12.water,
    credentials: { aware: ["k12-science", "k12-practical-math"], entry: ["heavy-equipment-operators", "core-trenching"], appr: ["marine-ecology-and-restoration", "heavy-equipment-operators", "aerospace-defense-and-robotics"], jw: ["heavy-equipment-operators", "core-emergency-response"], lead: ["situational-awareness", "aerospace-defense-and-robotics"] } },
];

const lpW = (id, facts, practice, crafts, stations, sims = []) => ({ id, facts, practice, crafts, stations, sims });
const lpC = (union, role) => ({ union, role });

/**
 * The tracks. `figures`: verbatim facts-file phrases (quoted with the track's source). `places`: fixed map and site ids from the
 * map consoles — guarded. `workTypes[].facts`: a verbatim facts-file phrase naming the work (or, for the growth cities, the place).
 */
export const LP_TRACKS = [
  { id: "starbase", short: "starbase", name: "Starbase Louisiana (SpaceX)", where: "Vermilion Parish: a 125,000-acre site near Pecan Island and Freshwater City, coastal marsh",
    figures: ["$100 billion", "3,000–10,000 permanent jobs expected (60–80% hired locally)", "construction from 2027, first launch targeted 2029"],
    source: "cnbc.com 2026-08-25; opportunitylouisiana.gov/spacex; space.com", pathways: ["launch-support", "construction"],
    places: [{ map: "la-starbase-vermilion", sites: ["lsb-marsh-survey", "lsb-mat-road-crossing", "lsb-pad-foundation-pour", "lsb-propellant-tank-farm", "lsb-marsh-creation-dredge", "lsb-power-plant-build", "lsb-shipping-dock", "lsb-airport-apron", "lsb-workforce-trailer"] }],
    workTypes: [
      lpW("marsh", "coastal restoration partnering (marsh creation)", "machine work on soft marsh from mats, dredged-material placement and marsh survey", [lpC("iuoe", "operating engineers on the amphibious excavator and the dredge"), lpC("liuna", "labourers on the mats and the survey")], ["br-tidal-marsh-grading-amphibious-excavator", "dredge-barge", "me-tidal-marsh-channel-restoration-day", "marsh-transect-survey"], ["lp-sim-marsh-mat-and-dredge-pipe"]),
      lpW("propellant", "propellant production", "hazardous-fluid and test-stand exclusion awareness only; no process is described", [lpC("ua", "pipefitters (awareness of cryogenic service only)")], ["lp-cryogenic-propellant-awareness", "ad-hazardous-fluid-servicing-with-a-buddy", "ad-test-stand-exclusion-zone-and-holds"]),
      lpW("power", "power generation", "switching under a permit and energised-work boundaries", [lpC("ibew", "electricians and linemen")], ["substation-switching", "ws-substation-switching-under-a-permit"]),
      lpW("shipping", "deepwater shipping access", "dock cranes, mooring and dredging at a berth", [lpC("ila", "longshore workers"), lpC("iuoe", "operating engineers on the dredge")], ["dock-crane", "mooring-line", "dredge-barge"]),
      lpW("vehicle", "vehicle processing", "heavy lifts under a lift plan", [lpC("ironworkers", "riggers and ironworkers"), lpC("iuoe", "crane operators")], ["ad-payload-crane-lift-with-a-lift-plan", "crane-yard"]),
      lpW("airport", "an airport", "ramp signals and aircraft movement", [lpC("iam", "ramp and maintenance crews")], ["av-marshalling-and-wingwalker-signals"]),
    ],
    gaps: [] },
  { id: "meta-richland", short: "meta", name: "Meta data center", where: "Richland Parish (northeast Louisiana, near Monroe)",
    figures: ["more than $50 billion", "about 7,500 construction jobs and 1,000 permanent positions", "500+ operational jobs (electricians, HVAC specialists, server and network techs, safety and security, engineers)", "~10 million sq ft, 5 GW"],
    source: "opportunitylouisiana.gov/data-center/meta; constructiondive.com; wafb.com 2026-07-29", pathways: ["datacenter-ops", "construction"],
    places: [{ map: "la-meta-richland", sites: ["lmr-site-grading", "lmr-duct-bank-crew", "lmr-substation-build", "lmr-data-hall-fitout", "lmr-cooling-plant", "lmr-laydown-yard", "lmr-crane-pad", "lmr-security-gate", "lmr-workforce-centre"] }],
    workTypes: [
      lpW("electricians", "electricians", "energised-work permits, busway installation, arc-flash labels and lockout", [lpC("ibew", "critical-facility electricians")], ["data-hall", "ws-data-hall-busway-install-and-torque-signoff", "arc-flash-label-study", "motor-control-center"], ["lp-sim-data-hall-energised-work"]),
      lpW("hvac", "HVAC specialists", "chilled-water plant and cooling-tower safety", [lpC("ua", "HVAC service"), lpC("iuoe", "stationary engineers")], ["chiller-plant", "cooling-tower"]),
      lpW("network", "server and network techs", "raised-floor tiles and cable-tray work", [lpC("cwa", "network and cabling technicians"), lpC("ibew", "low-voltage electricians")], ["ws-raised-floor-tile-lift-and-cable-tray-safety"]),
      lpW("safety", "safety and security", "fire protection and emergency response on a campus", [lpC("iuoe", "stationary engineers on the fire pump")], ["fire-pump"]),
      lpW("construction", "about 7,500 construction jobs", "excavation, duct banks, concrete, steel and cranes", [lpC("iuoe", "operating engineers"), lpC("liuna", "labourers"), lpC("ironworkers", "ironworkers"), lpC("ibew", "electricians on the duct bank")], ["op-excavator-trench-and-utility-locate", "trench-box", "concrete-pour", "steel-erector", "crane-yard"], ["lp-sim-duct-bank-excavation"]),
    ], gaps: [] },
  { id: "delta-forge", short: "deltaforge", name: "Applied Digital \"Delta Forge 1\" AI factory campus", where: "Rapides Parish (near Boyce, Central Louisiana)",
    figures: ["$3.6 billion", "200 direct full-time jobs; 218 indirect (418 total)", "1,000+ construction jobs at peak", "~300 acres, 300 MW", "operations mid-2027"],
    source: "opportunitylouisiana.gov news; applieddigital.com", pathways: ["datacenter-ops", "construction"],
    places: [{ map: "la-delta-forge-rapides", sites: ["ldf-site-grading", "ldf-steel-erection", "ldf-electrical-room", "ldf-network-cabling", "ldf-cooling-plant"] }],
    workTypes: [
      lpW("campus-power", "300 MW", "substation switching, energised-work permits and lockout", [lpC("ibew", "electricians and linemen")], ["substation-switching", "data-hall", "motor-control-center"], ["lp-sim-data-hall-energised-work"]),
      lpW("cooling", "AI factory campus", "cooling plant and raised-floor work", [lpC("ua", "HVAC and chilled water"), lpC("cwa", "network and cabling technicians")], ["chiller-plant", "ws-raised-floor-tile-lift-and-cable-tray-safety"]),
      lpW("construction", "1,000+ construction jobs at peak", "grading, duct banks, steel erection and concrete", [lpC("iuoe", "operating engineers"), lpC("ironworkers", "ironworkers"), lpC("liuna", "labourers")], ["op-excavator-trench-and-utility-locate", "trench-box", "steel-erector", "concrete-pour"], ["lp-sim-duct-bank-excavation"]),
    ], gaps: [] },
  { id: "shintech", short: "shintech", name: "Shintech expansion", where: "Plaquemine, Iberville Parish (Capital Region)",
    figures: ["$3.4 billion", "163 direct new jobs; 725 retained; 655 indirect (818 total new opportunities)", "first phase 2030"],
    source: "opportunitylouisiana.gov news; lailluminator.com; wafb.com 2026-03-05", pathways: ["process", "construction"],
    places: [{ map: "la-shintech-plaquemine", sites: ["lsp-process-unit-build", "lsp-pipe-rack-crew", "lsp-control-room", "lsp-river-dock", "lsp-tank-farm"] }],
    workTypes: [
      lpW("build", "Shintech expansion", "process-unit construction: pipe racks, scaffolds, insulation and hydrotest (never Shintech's process)", [lpC("ua", "pipefitters"), lpC("insulators", "mechanical insulators"), lpC("carpenters", "scaffold builders"), lpC("ironworkers", "ironworkers")], ["scaffold-erection", "ib-mechanical-insulation-pipe-and-jacketing", "ib-hydrostatic-test-and-inspector-witness", "crane-yard"]),
      lpW("operate", "163 direct new jobs", "process-safety awareness for operators and maintenance: lockout, confined space, chemical handling (taught generically)", [lpC("usw", "process operators and maintenance"), lpC("ibew", "electricians")], ["motor-control-center", "chlorine-room", "tank-lining"]),
    ], gaps: [] },
  { id: "black-bayou", short: "blackbayou", name: "Black Bayou Energy Hub", where: "Cameron Parish (Black Bayou salt dome) and a Lafayette headquarters",
    figures: ["$1.6 billion", "58 new jobs; 1,000+ construction jobs at peak; natural gas storage, blending and transport; operations late 2028"],
    source: "opportunitylouisiana.gov news; americanpress.com 2026-09-11", pathways: ["process", "launch-support", "construction"],
    places: [{ map: "la-black-bayou-cameron", sites: ["lbb-salt-dome-wellpad", "lbb-compressor-station", "lbb-pipeline-spread", "lbb-marsh-board-road"] }],
    workTypes: [
      lpW("storage", "natural gas storage, blending and transport", "gas detection, compressor lockout and hot tapping", [lpC("usw", "gas-storage operators"), lpC("ua", "pipefitters"), lpC("ibew", "electricians")], ["lp-gas-storage-wellpad-awareness", "gas-leak-survey", "motor-control-center", "hot-tap"], ["lp-sim-wellpad-lockout"]),
      lpW("pipeline", "1,000+ construction jobs at peak", "pipeline spread: locates, trench, pressure test, marsh access on board roads", [lpC("ua", "pipeline welders and fitters"), lpC("iuoe", "operating engineers"), lpC("liuna", "labourers")], ["op-excavator-trench-and-utility-locate", "pl-natural-gas-pressure-test-and-leak-check", "br-tidal-marsh-grading-amphibious-excavator"], ["lp-sim-marsh-mat-and-dredge-pipe"]),
    ], gaps: [] },
  { id: "saronic", short: "saronic", name: "Saronic Technologies Franklin Shipyard", where: "Franklin, St. Mary Parish (Bayou Region)",
    figures: ["$300 million", "1,500 direct new jobs; 1,770 indirect (3,270 total)", "autonomous marine vessels; 300,000+ sq ft, three new slips, large-vessel line; operations 2027"],
    source: "opportunitylouisiana.gov news; breakingdefense.com 2025-12", pathways: ["marine", "construction"],
    places: [{ map: "la-saronic-franklin", sites: ["lsf-new-slip-build", "lsf-hull-fabrication", "lsf-marine-electrical", "lsf-launch-and-test", "lsf-blast-and-paint"] }],
    workTypes: [
      lpW("hull", "autonomous marine vessels", "hull fabrication: hot work, ventilation and fire watch", [lpC("ibb", "shipbuilders and boilermakers"), lpC("iam", "machinists")], ["shipyard-hotwork", "welding"], ["lp-sim-hull-block-weld-fire-watch"]),
      lpW("slips", "three new slips", "pile driving, concrete and cranes at the waterfront", [lpC("carpenters", "pile drivers"), lpC("iuoe", "crane operators"), lpC("liuna", "labourers")], ["op-pile-driving-rig-and-lead-setup", "concrete-pour", "dock-crane"]),
      lpW("line", "large-vessel line", "marine electrical, blasting and coating, gangways", [lpC("ibew", "marine electricians"), lpC("iupat", "painters and blasters")], ["lp-marine-vessel-electrical-safety", "shore-power-hookup", "tank-lining", "bridge-blast", "vessel-gangway-and-hatch-cover-safety"]),
    ], gaps: [] },
  { id: "avex", short: "avex", name: "Aviation Exteriors Louisiana (AVEX)", where: "Acadiana Regional Airport, New Iberia (Iberia Parish)",
    figures: ["$74 million+ hangar and site development (with a $10 million FastSites investment)", "249 direct new jobs; 183 retained; 596 indirect (845 total)", "construction complete Q4 2027"],
    source: "opportunitylouisiana.gov news; bizneworleans.com", pathways: ["aviation-mro", "construction"],
    places: [{ map: "la-avex-new-iberia", sites: ["lav-hangar-steel", "lav-paint-hangar", "lav-freighter-conversion-bay", "lav-apron-work", "lav-fuel-farm"] }],
    workTypes: [
      lpW("paint", "aircraft paint", "paint-hangar ventilation, respirator fit and static bonding", [lpC("iupat", "aircraft painters")], ["paint-sprayer", "ib-spray-foam-and-respirator-fit", "av-ground-power-and-static-bonding-before-fuel"], ["lp-sim-paint-hangar-ventilation-ppe"]),
      lpW("maintenance", "maintenance", "jacking and stands, tool control and ramp signals", [lpC("iam", "aircraft mechanics"), lpC("teamsters", "aircraft maintenance technicians")], ["av-hangar-jacking-and-stands", "av-borescope-and-tool-control-inventory", "av-marshalling-and-wingwalker-signals"]),
      lpW("conversion", "passenger-to-freighter conversion", "structural work on a jacked aircraft: stands, tool control and foreign-object walks", [lpC("smart", "sheet-metal workers"), lpC("iam", "aircraft mechanics")], ["av-hangar-jacking-and-stands", "ad-depot-tool-control-and-fod-walk"], ["lp-sim-freighter-conversion-jacking"]),
      lpW("hangar", "hangar and site development", "hangar steel, foundations and cranes", [lpC("ironworkers", "ironworkers"), lpC("iuoe", "crane operators"), lpC("liuna", "labourers")], ["steel-erector", "concrete-pour", "crane-yard"]),
    ], gaps: [] },
  { id: "fastsites", short: "fastsites", name: "FastSites site readiness", where: "the Site Investment and Infrastructure Fund",
    figures: ["created by the Legislature in 2025 with $150 million; $50 million added in 2026, for $200 million total", "awards from $500,000 to $25 million", "$10 million to extend road access at the ~1,000-acre Esperanza site (St. Charles Parish)", "$1.4 million for McLeod Business Park (Lafourche Parish)", "$5.9 million at the Port of Vinton (Calcasieu Parish: a 600 ft × 50 ft barge berth)"],
    source: "opportunitylouisiana.gov/fastsites; kedm.org 2026-09-16; kplctv.com 2026-05-21", pathways: ["construction"],
    places: [{ map: "lc-port-of-vinton", sites: ["lpv-barge-berth-build", "lpv-site-prep", "lpv-rail-and-road"] }],
    notWalkable: ["Esperanza site (St. Charles Parish)", "McLeod Business Park (Lafourche Parish)"],
    workTypes: [
      lpW("roads", "roads", "grading, compaction and work-zone traffic", [lpC("iuoe", "operating engineers"), lpC("liuna", "labourers")], ["op-grader-fine-grade-and-crown", "op-compactor-lift-thickness-and-edge", "op-excavator-trench-and-utility-locate"], ["lp-sim-duct-bank-excavation"]),
      lpW("rail", "rail", "roadway worker protection and track work", [lpC("bmwed", "maintenance-of-way workers")], ["ra-roadway-worker-protection-and-job-briefing", "ra-tie-and-rail-replacement-with-track-machines"]),
      lpW("utilities", "utilities", "locates, trenching and utility crews", [lpC("uwua", "utility crews"), lpC("ibew", "linemen"), lpC("liuna", "labourers")], ["ut-service-line-locate-and-hand-dig-near-gas-main", "trench-box"]),
      lpW("environmental", "environmental work", "stormwater and marsh survey before a site is built", [lpC("liuna", "labourers on the survey and erosion control")], ["stormwater-outfall", "marsh-transect-survey"]),
      lpW("berth", "a 600 ft × 50 ft barge berth", "pile driving, dredging and cranes at a barge berth", [lpC("carpenters", "pile drivers"), lpC("iuoe", "operating engineers on the dredge and the crane")], ["op-pile-driving-rig-and-lead-setup", "dredge-barge", "dock-crane"]),
    ], gaps: [] },
  { id: "growth-cities", short: "cities", name: "Growth cities", where: "Baton Rouge, Lake Charles, Lafayette and Carencro, Monroe, Hammond — named as places only, with no growth figures",
    figures: ["2.01 million nonfarm jobs", "the Baton Rouge metro added about 7,900 nonfarm jobs May 2025 – May 2026", "$17.5 billion final investment decision", "a ~17,000-acre site, 10 miles of river frontage"],
    source: "louisianaradionetwork.com 2026-07-15; wbrz.com; brla.gov newsflash 1738; kplctv.com 2025-04-29; woodside.com; businessreport.com; ascensionedc.com", pathways: ["construction", "process"],
    places: [
      { map: "br-downtown-riverfront", sites: ["brd-workforce-centre", "brd-riverfront-crane-work"] },
      { map: "br-north-industrial", sites: ["brn-turnaround-staging", "brn-pipe-fab-shop"] },
      { map: "br-riverplex-ascension", sites: ["brr-site-clearing", "brr-rail-spur", "brr-river-dock"] },
      { map: "hammond-downtown", sites: ["ham-workforce-centre"] },
      { map: "lc-lakefront-downtown", sites: ["lcd-workforce-centre", "lcd-bridge-work"] },
      { map: "lc-calcasieu-channel", sites: ["lcc-lng-module-set", "lcc-marine-offload", "lcc-pipe-rack"] },
      { map: "laf-downtown", sites: ["lafd-workforce-centre"] },
      { map: "laf-carencro-north", sites: ["lafc-industrial-park"] },
      { map: "monroe-west-monroe", sites: ["mon-workforce-centre", "mon-river-bridge-work"] },
    ],
    workTypes: [
      lpW("baton-rouge", "Baton Rouge metro", "downtown and river-industry trades: cranes, turnaround staging, pipe fabrication", [lpC("ua", "pipefitters"), lpC("iuoe", "crane operators"), lpC("ironworkers", "ironworkers")], ["crane-yard", "scaffold-erection", "ib-mechanical-insulation-pipe-and-jacketing"]),
      lpW("riverplex", "RiverPlex MegaPark", "site clearing, rail spur and river dock on a large industrial site", [lpC("iuoe", "operating engineers"), lpC("bmwed", "maintenance-of-way workers"), lpC("carpenters", "pile drivers")], ["op-dozer-slope-work-and-rollover-protection", "ra-roadway-worker-protection-and-job-briefing", "op-pile-driving-rig-and-lead-setup"]),
      lpW("lake-charles", "Woodside Louisiana LNG", "module setting, marine offload and pipe racks (the layout illustrative; no process described)", [lpC("ironworkers", "riggers"), lpC("ua", "pipefitters"), lpC("ila", "longshore workers")], ["ad-payload-crane-lift-with-a-lift-plan", "dock-crane", "scaffold-erection"]),
      lpW("lafayette", "a Lafayette headquarters", "downtown and industrial-park trades", [lpC("ibew", "electricians"), lpC("carpenters", "carpenters")], ["electrical", "formwork-shoring"]),
      lpW("monroe", "near Monroe", "river bridge and downtown trades", [lpC("ironworkers", "bridge ironworkers"), lpC("iuoe", "operating engineers")], ["steel-erector", "bs-structural-bolting-and-torque"]),
      lpW("hammond", "name these cities as places only", "workforce-centre trades orientation", [lpC("liuna", "labourers"), lpC("carpenters", "carpenters")], ["concrete-pour", "scaffold-erection"]),
    ], gaps: [] },
];

const lpS = (id, title, station, step, practice, safe, unsafe, x = {}) => ({ id, title, station, step, practice, safe, unsafe, requires: [], ...x });

/**
 * LP_SIMS — full-procedure simulations on the fixed sites (PROJECTSIM's PS_SIMS shape + `track`, `unions`). Every step names a
 * real catalog station AND one of that station's own step ids; `gate` marks an order gate, `requires` the gates first. No
 * project figure, no employer's procedure, no injury.
 */
export const LP_SIMS = [
  { id: "lp-sim-data-hall-energised-work", name: "Data Hall Energised-Work Permit", kind: "data-hall", track: "meta-richland", unions: ["ibew"],
    briefing: "A training simulation of tap-off work on a live data-hall busway: take the energised electrical work permit, dress to its arc category, prove which side you are on, lock the B-side feeder, then lift, stab and torque the tap-off and scan it under load. The permit and the lock come before the tile is lifted.",
    steps: [
      lpS("permit", "Take the energised electrical work permit", "data-hall", "eewp", "Read the permit's justification, the boundaries and the arc category before anyone opens a tile.", "Read and sign the permit.", "Start; the permit is on the board.", { gate: "permit" }),
      lpS("ppe", "Dress to the permit's arc category", "data-hall", "arc-ppe", "Put on arc-rated clothing and the face shield to the category on the permit.", "PPE to the category.", "A hard hat is enough for a tap-off.", { requires: ["permit"] }),
      lpS("side", "Prove which side you are on", "data-hall", "prove-side", "Trace the A and B feeds at the label before any lock goes on.", "Prove the side.", "It is always the left side.", { requires: ["permit"] }),
      lpS("lock", "Lock and tag the B-side feeder", "data-hall", "lock-b", "Open the B-side feeder, put your own lock and tag on it.", "Your own lock.", "Ask a colleague to watch the switch.", { gate: "lock", requires: ["permit"] }),
      lpS("tile", "Lift the floor tile and barrier the hole", "data-hall", "tile", "Lift the tile with the lifter and barrier the opening.", "Barrier the hole.", "Leave it open for a minute.", { requires: ["lock"] }),
      lpS("stab", "Stab the tap-off home", "data-hall", "stab", "Seat the tap-off fully on the busway with the lock still on.", "Seated fully.", "Half-seat it and move on.", { requires: ["lock"] }),
      lpS("torque", "Torque the terminations", "data-hall", "torque", "Torque each termination to the value and mark it.", "Torque and mark.", "Hand-tight is fine.", { requires: ["lock"] }),
      lpS("scan", "Thermal-scan under load", "data-hall", "thermal", "After the feeder is restored, scan the terminations under load and record it.", "Scan and record.", "Skip the scan; it torqued fine."),
    ] },
  { id: "lp-sim-duct-bank-excavation", name: "Duct Bank Excavation", kind: "duct-bank", track: "meta-richland", unions: ["iuoe", "liuna", "ibew"],
    briefing: "A training simulation of a duct bank trench: read the locate ticket, verify the marks, barricade the swing, brief the spotter, hand-expose the line, then read the excavation permit and place the trench box before anyone is in the cut. The ticket comes before the bucket; the box before the ladder.",
    steps: [
      lpS("ticket", "Read the locate ticket", "op-excavator-trench-and-utility-locate", "locate-ticket", "Confirm the ticket covers the duct bank run and is current.", "Read the ticket.", "Dig where the drawing says.", { gate: "ticket" }),
      lpS("swing", "Barricade the swing radius", "op-excavator-trench-and-utility-locate", "barricade-swing", "Tape and cone the swing radius before the machine moves.", "Barricade first.", "Everyone knows to stay back."),
      lpS("spotter", "Confirm the spotter's protocol", "op-excavator-trench-and-utility-locate", "spotter-brief", "Agree the stop signal and the radio channel with the spotter.", "Brief the spotter.", "Wave if something is wrong."),
      lpS("pothole", "Hand-expose the marked line", "op-excavator-trench-and-utility-locate", "pothole-expose", "Hand-dig inside the tolerance zone to see the line.", "Hand-expose it.", "Bucket through the tolerance zone.", { requires: ["ticket"] }),
      lpS("permit", "Read the excavation permit", "trench-box", "permit", "Confirm the depth, the soil class and the protective system required.", "Read the protective system.", "Dig first, read later.", { gate: "permit", requires: ["ticket"] }),
      lpS("spoil", "Set the spoil back from the edge", "trench-box", "relocate-spoil", "Keep the spoil back so it cannot load the wall.", "Spoil set back.", "Pile it at the edge."),
      lpS("box", "Place the trench box", "trench-box", "install-box", "Lower the box into the cut before anyone enters.", "Box first.", "Step in to square the walls.", { gate: "box", requires: ["permit"] }),
      lpS("ladder", "Place the access ladder", "trench-box", "place-ladder", "Set the ladder inside the box within reach.", "Ladder in the box.", "Climb the box wall.", { requires: ["box"] }),
    ] },
  { id: "lp-sim-hull-block-weld-fire-watch", name: "Hull Block Weld and Fire Watch", kind: "hull-hotwork", track: "saronic", unions: ["ibb", "iam"],
    briefing: "A training simulation of hot work on a hull block: call the chemist back for the void behind the cut, run the ventilation and prove the air moves, keep the bottles on deck, leak-test the lines, post a fire watch on both sides, cut, then look into the spaces the heat reached and stand the watch after the arc stops.",
    steps: [
      lpS("chemist", "Call the chemist back for the void", "shipyard-hotwork", "recall-chemist", "Have the adjacent void tested before any hot work.", "Test the void.", "The certificate from this morning covers it.", { gate: "chemist" }),
      lpS("duct", "Run the ventilation duct low", "shipyard-hotwork", "duct", "Run the duct to the low corner of the space.", "Duct to the low corner.", "Leave it at the hatch."),
      lpS("air", "Prove the air is moving", "shipyard-hotwork", "airflow", "Check the airflow at the work, not just the blower.", "Prove airflow.", "The blower is on, so it is fine.", { gate: "air" }),
      lpS("bottles", "Rack the bottles on deck", "shipyard-hotwork", "cylinders", "Keep the cylinders on deck, outside the space.", "Bottles on deck.", "Take them down with you."),
      lpS("hose", "Leak-test the lines", "shipyard-hotwork", "hose-test", "Leak-test the hoses before they go down.", "Leak-test first.", "They were fine yesterday."),
      lpS("watch", "Post a fire watch both sides", "shipyard-hotwork", "watches", "Post a watch on each side of the plate with an extinguisher.", "Both sides.", "One watch is enough.", { gate: "watch", requires: ["chemist"] }),
      lpS("cut", "Burn the insert out", "shipyard-hotwork", "cut", "Cut with the watch posted and the air moving.", "Cut with the watch.", "Cut while the watch fetches water.", { requires: ["chemist", "air", "watch"] }),
      lpS("after", "Stand the watch after the arc stops", "shipyard-hotwork", "watch-after", "Keep the watch on after the work stops, as the procedure says.", "Stay on watch.", "Leave as soon as the arc stops.", { requires: ["watch"] }),
    ] },
  { id: "lp-sim-paint-hangar-ventilation-ppe", name: "Paint Hangar Ventilation and PPE", kind: "paint-hangar", track: "avex", unions: ["iupat"],
    briefing: "A training simulation of a coating job under ventilation: read the job data sheet, pass a respirator fit test and a seal check, set up ventilation before any spraying, then check the mix and the film and post the re-entry time. The fit test and the ventilation come before the gun is triggered.",
    steps: [
      lpS("spec", "Read the job data sheet", "ib-spray-foam-and-respirator-fit", "spec", "Read the product's hazards and the respirator it needs.", "Read the sheet.", "Same product as last week."),
      lpS("fit", "Pass the respirator fit test", "ib-spray-foam-and-respirator-fit", "fit-test-reading", "Run the fit-test reading on your own respirator.", "Fit-tested.", "Borrow one that fits roughly.", { gate: "fit" }),
      lpS("seal", "Hold the seal check", "ib-spray-foam-and-respirator-fit", "seal-check", "Do the negative-pressure seal check each time you don it.", "Seal check.", "Skip it when you are in a hurry.", { requires: ["fit"] }),
      lpS("vent", "Set up ventilation before spraying", "ib-spray-foam-and-respirator-fit", "ventilation-setup", "Start the ventilation and confirm it runs before any spraying.", "Ventilation first.", "Start it once the smell builds.", { gate: "vent" }),
      lpS("mix", "Check the mix", "tank-lining", "mix", "Mix and induct the material as the specification says.", "Mix to the spec.", "Eyeball the ratio.", { requires: ["vent"] }),
      lpS("spray", "Apply the coat", "tank-lining", "spray", "Spray with the respirator sealed and the air moving.", "Sealed and ventilated.", "Lift the mask to see better.", { requires: ["fit", "vent"] }),
      lpS("wft", "Check wet film as you go", "tank-lining", "wft", "Check the wet film thickness during the pass.", "Check as you go.", "Check it tomorrow."),
      lpS("reentry", "Post the re-entry time", "ib-spray-foam-and-respirator-fit", "reentry-hold", "Post the space for its re-entry time.", "Post it.", "Let the next crew walk in."),
    ] },
  { id: "lp-sim-marsh-mat-and-dredge-pipe", name: "Marsh Mat Road and Dredge-Pipe Awareness", kind: "marsh-mat", track: "starbase", unions: ["iuoe", "liuna"],
    briefing: "A training simulation of machine work on soft marsh and a dredge beside it: check the permit conditions, confirm the swing radius, lay the mats ahead of the machine and check in with the spotter; on the barge, check the dredging permit, deploy the curtain, set the spuds and test the decant water before any discharge.",
    steps: [
      lpS("check-in", "Check the permit conditions", "br-tidal-marsh-grading-amphibious-excavator", "check-in", "Read the permit conditions and the work limits before the machine moves.", "Read the conditions.", "Start; the limits are obvious.", { gate: "check-in" }),
      lpS("swing", "Confirm the swing radius and buffer", "br-tidal-marsh-grading-amphibious-excavator", "swing-check", "Confirm the swing radius and the buffer around it.", "Confirm the radius.", "Swing and look."),
      lpS("mats", "Lay the mats ahead", "br-tidal-marsh-grading-amphibious-excavator", "mats-place", "Lay the ground mats ahead of the machine before it travels.", "Mats first.", "Track straight onto the marsh.", { gate: "mats", requires: ["check-in"] }),
      lpS("spotter", "Check in with the ground spotter", "br-tidal-marsh-grading-amphibious-excavator", "spotter-checkin", "Check in with the spotter before each move.", "Check in.", "Move and call later.", { requires: ["mats"] }),
      lpS("dredge-permit", "Check the dredging permit", "dredge-barge", "permit", "Read the dredging permit and the sediment conditions.", "Read the permit.", "Same as last season.", { gate: "dredge-permit" }),
      lpS("curtain", "Deploy the turbidity curtain", "dredge-barge", "curtain-deploy", "Deploy the curtain around the work before dredging.", "Curtain first.", "Deploy it if it gets muddy.", { requires: ["dredge-permit"] }),
      lpS("spuds", "Set the spuds", "dredge-barge", "spuds", "Lower and set the spuds before the cycle.", "Spuds set.", "Hold position on the engines."),
      lpS("decant", "Test the decant water", "dredge-barge", "decant", "Test the water before any discharge.", "Test before discharge.", "Let it run.", { requires: ["dredge-permit"] }),
    ] },
  { id: "lp-sim-wellpad-lockout", name: "Gas Storage Compressor Lockout", kind: "wellpad-lockout", track: "black-bayou", unions: ["usw", "ibew"],
    briefing: "A training simulation of lockout on a compressor motor at a gas-storage site: zero the gas detector in clean air, approach upwind, read the bucket's arc-flash label and dress to it, set the boundary, open and lock the disconnect with your own lock and prove it dead before the door opens.",
    steps: [
      lpS("zero", "Zero the gas detector in clean air", "gas-leak-survey", "zero", "Zero the combustible gas indicator in clean air before the approach.", "Zero in clean air.", "Zero it at the pad.", { gate: "zero" }),
      lpS("approach", "Approach upwind", "gas-leak-survey", "approach", "Park upwind, shut down and walk in reading the meter.", "Upwind, reading.", "Drive up to the skid.", { requires: ["zero"] }),
      lpS("label", "Read the arc-flash label", "motor-control-center", "label", "Read the bucket's label: the category and the boundary.", "Read the label.", "Guess the category."),
      lpS("ppe", "Dress to the label", "motor-control-center", "ppe", "Arc-rated PPE to the label's category.", "PPE to the label.", "Sleeves rolled up in the heat."),
      lpS("boundary", "Set the arc-flash boundary", "motor-control-center", "boundary", "Set the boundary so nobody walks into it.", "Boundary set.", "Everyone knows to stay back."),
      lpS("lock", "Lock and tag the disconnect", "motor-control-center", "lock", "Open the disconnect, put on your own lock and tag.", "Your own lock.", "A tag without a lock.", { gate: "lock", requires: ["zero"] }),
      lpS("test", "Prove the bucket dead", "motor-control-center", "test", "Test for absence of voltage before the door opens.", "Test before touch.", "The lock is on, so skip it.", { gate: "test", requires: ["lock"] }),
      lpS("log", "Log it back in service", "motor-control-center", "log", "Log the work and the return to service.", "Log it.", "Tell the next shift."),
    ] },
  { id: "lp-sim-freighter-conversion-jacking", name: "Freighter Conversion Jacking and Stands", kind: "aircraft-jacking", track: "avex", unions: ["iam", "smart"],
    briefing: "A training simulation of putting an aircraft on jacks for structural work: read the jacking plan, confirm the fuel and weight state, position and raise the jacks together, lock the collars, prove it stable, seat the downlock pins and check the stand's guardrail before anyone works at height.",
    steps: [
      lpS("plan", "Read the jacking plan", "av-hangar-jacking-and-stands", "brief", "Read the jacking plan and the points before any jack moves.", "Read the plan.", "Use the last aircraft's plan.", { gate: "plan" }),
      lpS("fuel", "Confirm the fuel and weight state", "av-hangar-jacking-and-stands", "confirm-fuel-state", "Confirm the fuel and weight state against the plan.", "Confirm it.", "Assume it is empty.", { requires: ["plan"] }),
      lpS("position", "Position the jacks", "av-hangar-jacking-and-stands", "position-jacks", "Place each jack at its point.", "At the points.", "Close enough.", { requires: ["plan"] }),
      lpS("raise", "Raise the jacks together", "av-hangar-jacking-and-stands", "raise-jacks-coordinated", "Raise on one caller's count, all jacks together.", "Together.", "One corner at a time.", { requires: ["plan"] }),
      lpS("collars", "Lock the collars", "av-hangar-jacking-and-stands", "lock-collars", "Run the collars down and lock them.", "Collars locked.", "Leave them for later.", { gate: "collars" }),
      lpS("stable", "Prove the aircraft stable", "av-hangar-jacking-and-stands", "stability-check", "Check stability before anyone goes under or up.", "Prove stable.", "It looks steady.", { requires: ["collars"] }),
      lpS("stand", "Position the work stand", "av-hangar-jacking-and-stands", "position-stands", "Bring the stand in once the aircraft is stable.", "After stable.", "Bring it in during the lift.", { requires: ["collars"] }),
      lpS("rail", "Check the stand's guardrail", "av-hangar-jacking-and-stands", "fall-protection-check", "Check the guardrail before working at height.", "Rail checked.", "Lean on it and see."),
    ] },
];

/** Where each simulation plays: fixed site ids on the map consoles' maps — GUARDED (resolved only when map and site exist). */
export const LP_SIM_PLACES = [
  { sim: "lp-sim-data-hall-energised-work", map: "la-meta-richland", site: "lmr-data-hall-fitout" },
  { sim: "lp-sim-data-hall-energised-work", map: "la-delta-forge-rapides", site: "ldf-electrical-room" },
  { sim: "lp-sim-duct-bank-excavation", map: "la-meta-richland", site: "lmr-duct-bank-crew" },
  { sim: "lp-sim-duct-bank-excavation", map: "la-delta-forge-rapides", site: "ldf-site-grading" },
  { sim: "lp-sim-hull-block-weld-fire-watch", map: "la-saronic-franklin", site: "lsf-hull-fabrication" },
  { sim: "lp-sim-paint-hangar-ventilation-ppe", map: "la-avex-new-iberia", site: "lav-paint-hangar" },
  { sim: "lp-sim-paint-hangar-ventilation-ppe", map: "la-saronic-franklin", site: "lsf-blast-and-paint" },
  { sim: "lp-sim-marsh-mat-and-dredge-pipe", map: "la-starbase-vermilion", site: "lsb-mat-road-crossing" },
  { sim: "lp-sim-marsh-mat-and-dredge-pipe", map: "la-starbase-vermilion", site: "lsb-marsh-creation-dredge" },
  { sim: "lp-sim-marsh-mat-and-dredge-pipe", map: "la-black-bayou-cameron", site: "lbb-marsh-board-road" },
  { sim: "lp-sim-wellpad-lockout", map: "la-black-bayou-cameron", site: "lbb-salt-dome-wellpad" },
  { sim: "lp-sim-wellpad-lockout", map: "la-black-bayou-cameron", site: "lbb-compressor-station" },
  { sim: "lp-sim-freighter-conversion-jacking", map: "la-avex-new-iberia", site: "lav-freighter-conversion-bay" },
];
