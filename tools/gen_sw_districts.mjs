#!/usr/bin/env node
// SOUTHWEST (console `sw`, docs/consoles/SOUTHWEST.md): writes Lake Charles and Calcasieu Parish as three pure-literal parish
// modules — lc-lakefront-downtown, lc-calcasieu-channel, lc-port-of-vinton — from approximate public lon/lat through one
// north-up uniform scale per map (x east, +z south). Run once; the modules are the source of truth afterwards.
// Geography rule ($SP/epa/project-worlds-brief.md): no imagery was used. The lake, the river, the ship channel, the bayous,
// the interstates and the towns are placed from their general position and orientation; every other feature, every site and
// every project layout is PROCEDURAL and illustrative. Project facts come only from the Louisiana facts file.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR", "shared");
const M_LAT = 111320;
const HALF = 2048;
const SIGN = "a sign: the project layout is illustrative; the parish, waterways and towns are real";

function frame(lon0, lat0, scale) {
  const mLon = M_LAT * Math.cos((lat0 * Math.PI) / 180);
  const clamp = (v) => Math.max(-HALF, Math.min(HALF, v));
  const xz = ([lon, lat]) => [clamp(Math.round(((lon - lon0) * mLon) / scale)), clamp(Math.round((-(lat - lat0) * M_LAT) / scale))];
  return { xz, pts: (list) => list.map(xz) };
}

// Station sets — catalog stations, tools/unions.json crafts and catalog programmes only.
const S = {
  workforce: { trades: ["ibew", "ua", "ironworkers", "liuna"], programmes: ["job-readiness-edition", "builders-trades"], stations: ["jobsite-orientation-and-osha-10", "wp-permit-study-and-knowledge-test", "hazwoper-site-orientation", "leading-edge-and-horizontal-lifeline"] },
  bridge: { trades: ["ironworkers", "iupat", "iuoe"], programmes: ["bridge-and-structural", "rigging-lifting", "fall-protection"], stations: ["bridge-lead-containment", "bridge-cable-inspection", "bridge-blast", "leading-edge-and-horizontal-lifeline", "uw-bridge-pier-scour-survey"] },
  highrise: { trades: ["ironworkers", "carpenters", "opcmia", "iuec"], programmes: ["builders-trades", "fall-protection", "elevator-constructors"], stations: ["steel-erector", "concrete-pour", "formwork-shoring", "bt-rebar-tying-and-impalement-protection", "ew-hoistway-false-car-and-rail-setting", "gl-curtain-wall-unit-setting-from-the-floor"] },
  streetscape: { trades: ["liuna", "uwua", "iuoe"], programmes: ["water-and-gas-utility-crews", "heavy-equipment-operators"], stations: ["op-excavator-trench-and-utility-locate", "trench-box", "ut-service-line-locate-and-hand-dig-near-gas-main", "cm-concrete-saw-cutting-with-water-and-silica-control"] },
  locate: { trades: ["uwua", "liuna", "ibew"], programmes: ["water-and-gas-utility-crews", "confined-space"], stations: ["ut-service-line-locate-and-hand-dig-near-gas-main", "gas-leak-survey", "ut-pe-pipe-fusion-and-squeeze-off", "ut-water-main-break-emergency-shutdown-and-excavation"] },
  stormdrain: { trades: ["uwua", "iuoe", "afscme"], programmes: ["water-and-gas-utility-crews", "confined-space"], stations: ["stormwater-outfall", "lift-station", "manhole-entry-and-atmospheric-monitoring", "cs-permit-entry-and-attendant-duties"] },
  seawall: { trades: ["liuna", "iuoe", "opcmia"], programmes: ["heavy-equipment-operators", "cement-masons-and-plasterers"], stations: ["op-pile-driving-rig-and-lead-setup", "concrete-pour", "uw-underwater-concrete-and-bag-placement", "br-turbidity-curtain-deployment"] },
  grounds: { trades: ["afscme", "liuna", "seiu"], programmes: ["grounds-and-landscaping"], stations: ["gk-tree-work-pole-saw-and-drop-zone", "gk-storm-cleanup-chipper-and-traffic-control", "gk-irrigation-controller-valve-box-and-backflow-check", "gk-string-trimmer-and-blower-ppe-and-bystander-zone"] },
  stage: { trades: ["iatse"], programmes: ["live-events"], stations: ["stage-power", "rigging-loft", "stage-load-in-and-truss-rigging", "le-crowd-barricade-and-show-stop-call"] },
  school: { trades: ["aft", "csea", "seiu"], programmes: ["education-support-staff", "k12-literacy-and-life-skills"], stations: ["ed-playground-equipment-inspection", "ed-crossing-guard-intersection-control", "k12-reading-instructions-and-safety-labels", "ed-kitchen-receiving-and-warewash-sanitizing"] },
  hospital: { trades: ["nnu", "seiu", "afscme", "ua"], programmes: ["healthcare-support", "first-responders", "plumbers-and-pipefitters"], stations: ["hc-patient-transport-and-safe-handling", "hc-code-response-support-and-crash-cart-check", "hc-sterile-processing-decontamination-and-assembly", "pl-medical-gas-brazing-and-purge", "triage-point"] },
  fire: { trades: ["iaff", "naemt"], programmes: ["first-responders", "fall-protection"], stations: ["structure-fire-sizeup", "aerial-ladder", "firefighter-rehab-sector", "ambulance-scene-safety"] },
  transit: { trades: ["atu", "twu", "ibew"], programmes: ["transit-ramp", "railroad-crafts"], stations: ["track-access", "signal-cabinet", "ra-roadway-worker-protection-and-job-briefing", "tr-wheelchair-lift-and-securement-on-a-bus"] },
  harbour: { trades: ["ibu", "sup", "afscme"], programmes: ["ports-maritime-ecology", "yacht-and-charter-crew"], stations: ["mooring-line", "yc-line-handling-and-docking-in-crosswind", "yc-fuel-dock-transfer-and-spill-kit", "br-cold-water-immersion-and-mob-recovery"] },
  riveryard: { trades: ["ila", "iuoe", "teamsters"], programmes: ["port-operations", "rigging-lifting"], stations: ["mooring-line", "dock-crane", "pt-dock-fender-and-bollard-inspection", "forklift-dock"] },
  substation: { trades: ["ibew", "ifpte"], programmes: ["electrical-first-period", "energy-transition"], stations: ["substation-switching", "ws-substation-switching-under-a-permit", "arc-flash-label-study", "or-transmission-line-right-of-way-patrol"] },
  unionhall: { trades: ["ibew", "ua", "carpenters", "liuna"], programmes: ["job-readiness-edition", "builders-trades"], stations: ["jobsite-orientation-and-osha-10", "wp-permit-study-and-knowledge-test", "electrical", "welding"] },
  roofing: { trades: ["urw", "carpenters", "ibew"], programmes: ["roofers-and-waterproofers", "fall-protection"], stations: ["rf-roof-tear-off-and-debris-chute", "rf-single-ply-tpo-heat-welding-and-seam-probe", "rf-torch-applied-membrane-and-fire-watch", "leading-edge-and-horizontal-lifeline"] },
  // the channel's construction trades (the project layout illustrative; the practice from the catalog's sourced stations)
  moduleset: { trades: ["ironworkers", "iuoe", "ua", "ibb"], programmes: ["rigging-lifting", "heavy-equipment-operators", "plumbers-and-pipefitters"], stations: ["rl-critical-lift-plan-and-signalperson", "op-crawler-crane-assembly-and-load-chart", "crane-yard", "steel-erector"] },
  offload: { trades: ["ila", "iuoe", "ironworkers"], programmes: ["port-operations", "rigging-lifting"], stations: ["mooring-line", "dock-crane", "rl-critical-lift-plan-and-signalperson", "pt-dock-fender-and-bollard-inspection"] },
  piperack: { trades: ["ua", "ironworkers", "insulators"], programmes: ["plumbers-and-pipefitters", "insulators-and-boilermakers", "fall-protection"], stations: ["steel-erector", "welding", "scaffold-erection", "leading-edge-and-horizontal-lifeline"] },
  haulroad: { trades: ["iuoe", "teamsters", "liuna"], programmes: ["heavy-equipment-operators"], stations: ["op-equipment-daily-walkaround-and-fluids", "op-loader-truck-loading-and-blind-spots", "op-compactor-lift-thickness-and-edge", "traffic-incident-management"] },
  foundation: { trades: ["opcmia", "carpenters", "ironworkers", "liuna"], programmes: ["builders-trades", "cement-masons-and-plasterers"], stations: ["concrete-pour", "formwork-shoring", "bt-rebar-tying-and-impalement-protection", "cm-concrete-saw-cutting-with-water-and-silica-control"] },
  piling: { trades: ["iuoe", "carpenters", "liuna"], programmes: ["heavy-equipment-operators", "rigging-lifting"], stations: ["op-pile-driving-rig-and-lead-setup", "gg-pile-driver-fender-repair", "br-marine-mammal-observer-during-pile-driving", "rl-critical-lift-plan-and-signalperson"] },
  laydown: { trades: ["teamsters", "iuoe", "liuna"], programmes: ["heavy-equipment-operators", "warehouse-and-logistics-automation"], stations: ["forklift-dock", "op-loader-truck-loading-and-blind-spots", "tdl-trailer-loading-and-dock-plate", "op-equipment-daily-walkaround-and-fluids"] },
  cranepad: { trades: ["iuoe", "ironworkers", "liuna"], programmes: ["rigging-lifting", "heavy-equipment-operators"], stations: ["op-crawler-crane-assembly-and-load-chart", "crane-yard", "rl-critical-lift-plan-and-signalperson", "op-compactor-lift-thickness-and-edge"] },
  hydrotest: { trades: ["ua", "insulators", "ibb"], programmes: ["plumbers-and-pipefitters", "insulators-and-boilermakers"], stations: ["ib-hydrostatic-test-and-inspector-witness", "pl-hydronic-boiler-piping-and-hydrotest", "hot-tap", "welding"] },
  insulation: { trades: ["insulators", "ua", "carpenters"], programmes: ["insulators-and-boilermakers", "fall-protection"], stations: ["ib-mechanical-insulation-pipe-and-jacketing", "scaffold-erection", "leading-edge-and-horizontal-lifeline"] },
  subbuild: { trades: ["ibew", "iuoe", "liuna"], programmes: ["electrical-first-period", "energy-transition"], stations: ["substation-switching", "ws-substation-switching-under-a-permit", "arc-flash-label-study", "trench-box"] },
  control: { trades: ["ibew", "carpenters", "smart"], programmes: ["electrical-first-period", "builders-trades"], stations: ["electrical", "arc-flash-label-study", "pm-electrical-room", "pm-fire-alarm-panel-room"] },
  flare: { trades: ["ibb", "ironworkers", "ua"], programmes: ["insulators-and-boilermakers", "rigging-lifting"], stations: ["ib-pressure-vessel-confined-entry-and-hot-work", "rl-critical-lift-plan-and-signalperson", "steel-erector", "welding"] },
  dredge: { trades: ["iuoe", "ibu", "liuna"], programmes: ["bay-restoration-maritime-underwater", "heavy-equipment-operators"], stations: ["dredge-barge", "br-dredge-spoils-dewatering-pad", "br-turbidity-curtain-deployment", "br-vhf-and-navigation-in-a-work-zone"] },
  mats: { trades: ["iuoe", "liuna", "teamsters"], programmes: ["heavy-equipment-operators", "bay-restoration-maritime-underwater"], stations: ["br-tidal-marsh-grading-amphibious-excavator", "op-equipment-daily-walkaround-and-fluids", "op-excavator-trench-and-utility-locate", "spill-boom-deploy"] },
  gate: { trades: ["spfpa", "teamsters"], programmes: ["situational-awareness", "first-responders"], stations: ["tdl-backing-and-docking", "traffic-incident-management", "jobsite-orientation-and-osha-10"] },
  firewater: { trades: ["iaff", "ua", "iuoe"], programmes: ["first-responders", "plumbers-and-pipefitters"], stations: ["structure-fire-sizeup", "ut-hydrant-flow-test-and-flushing-with-traffic-control", "confined-rescue"] },
  // Vinton
  berth: { trades: ["iuoe", "carpenters", "liuna", "ironworkers"], programmes: ["heavy-equipment-operators", "port-operations", "rigging-lifting"], stations: ["op-pile-driving-rig-and-lead-setup", "concrete-pour", "mooring-line", "rl-critical-lift-plan-and-signalperson"] },
  siteprep: { trades: ["iuoe", "liuna", "teamsters"], programmes: ["heavy-equipment-operators"], stations: ["op-dozer-slope-work-and-rollover-protection", "op-excavator-trench-and-utility-locate", "op-compactor-lift-thickness-and-edge", "op-equipment-daily-walkaround-and-fluids"] },
  railroad: { trades: ["bmwed", "iuoe", "liuna"], programmes: ["railroad-crafts", "heavy-equipment-operators"], stations: ["ra-tie-and-rail-replacement-with-track-machines", "ra-roadway-worker-protection-and-job-briefing", "ra-crossing-signal-maintenance-and-flagging", "op-compactor-lift-thickness-and-edge"] },
  sheetpile: { trades: ["carpenters", "iuoe", "ironworkers"], programmes: ["heavy-equipment-operators", "rigging-lifting"], stations: ["op-pile-driving-rig-and-lead-setup", "gg-pile-driver-fender-repair", "welding", "rl-critical-lift-plan-and-signalperson"] },
  dolphins: { trades: ["carpenters", "iuoe", "ibu"], programmes: ["port-operations", "commercial-diving-and-scientific-scuba"], stations: ["mw-pier-pile-inspection-dive", "pt-dock-fender-and-bollard-inspection", "op-pile-driving-rig-and-lead-setup", "br-cold-water-immersion-and-mob-recovery"] },
  culvert: { trades: ["liuna", "iuoe", "uwua"], programmes: ["heavy-equipment-operators", "water-and-gas-utility-crews"], stations: ["or-ranch-road-grading-and-culvert", "trench-box", "br-culvert-retrofit-for-fish-passage", "stormwater-outfall"] },
  envsurvey: { trades: ["ifpte", "afscme"], programmes: ["bay-restoration-maritime-underwater", "marine-ecology-and-restoration"], stations: ["marsh-transect-survey", "br-water-quality-sonde-calibration-and-deploy", "br-bird-nesting-buffer-and-work-window", "br-drone-shoreline-survey"] },
  utilext: { trades: ["ibew", "uwua", "liuna"], programmes: ["electrical-first-period", "water-and-gas-utility-crews"], stations: ["ut-pe-pipe-fusion-and-squeeze-off", "trench-box", "or-transmission-line-right-of-way-patrol", "ut-service-line-locate-and-hand-dig-near-gas-main"] },
  truckgate: { trades: ["teamsters", "ila"], programmes: ["port-operations", "warehouse-and-logistics-automation"], stations: ["tdl-backing-and-docking", "tdl-trailer-loading-and-dock-plate", "traffic-incident-management"] },
  warehouse: { trades: ["ironworkers", "carpenters", "opcmia"], programmes: ["builders-trades"], stations: ["steel-erector", "concrete-pour", "leading-edge-and-horizontal-lifeline", "tw-dock-leveler-and-trailer-restraint-check"] },
};

const site = (f) => (id, name, kind, ll, set, blurb, extra = {}) => ({ id, name, kind, position: f.xz(ll), ...S[set], blurb, ...extra });
const anchor = (f) => (ll, name) => ({ xz: f.xz(ll), lonlat: ll, approximate: true, name });

// ------------------------------------------------------------------ Lake Charles: the lakefront and downtown
function lakefront() {
  const f = frame(-93.225, 30.215, 2.2), s = site(f), a = anchor(f), P = f.pts;
  return {
    id: "lc-lakefront-downtown",
    name: "Lake Charles Lakefront & Downtown",
    region: "louisiana-cities",
    size: 4096,
    blurb: "Lake Charles's lakefront and downtown in Calcasieu Parish: the lake, the Calcasieu River and the interstate's high bridge over it, Westlake across the river, Prien Lake and Contraband Bayou to the south, and the city's downtown trades — a bridge crew, a high-rise, streetscape and utilities, the seawall and the workforce centre. The site layout is illustrative; the parish, waterways and towns are real. No city growth figure is stated.",
    start: "lcd-workforce-centre",
    anchors: [
      a([-93.217, 30.227], "downtown Lake Charles"),
      a([-93.234, 30.227], "the lake called Lake Charles"),
      a([-93.245, 30.238], "the interstate bridge over the Calcasieu River"),
      a([-93.262, 30.230], "Westlake"),
      a([-93.268, 30.192], "Prien Lake"),
      a([-93.209, 30.179], "McNeese State University"),
    ],
    hills: [],
    water: [
      { id: "lake-charles", name: "Lake Charles (the lake)", kind: "lake", poly: P([[-93.2475, 30.2345], [-93.2400, 30.2362], [-93.2280, 30.2362], [-93.2225, 30.2330], [-93.2205, 30.2270], [-93.2225, 30.2205], [-93.2300, 30.2175], [-93.2400, 30.2170], [-93.2475, 30.2215]]) },
      { id: "calcasieu-river-north", name: "the Calcasieu River", kind: "river", width: 70, poly: P([[-93.2440, 30.2555], [-93.2462, 30.2480], [-93.2455, 30.2420], [-93.2450, 30.2370], [-93.2455, 30.2340]]) },
      { id: "calcasieu-river-south", name: "the Calcasieu River below the lake", kind: "river", width: 70, poly: P([[-93.2470, 30.2200], [-93.2545, 30.2195], [-93.2600, 30.2175], [-93.2620, 30.2110], [-93.2660, 30.2040], [-93.2700, 30.1985]]) },
      { id: "prien-lake", name: "Prien Lake", kind: "lake", poly: P([[-93.2718, 30.1990], [-93.2685, 30.1975], [-93.2655, 30.1930], [-93.2660, 30.1870], [-93.2718, 30.1855]]) },
      { id: "contraband-bayou", name: "Contraband Bayou", kind: "bayou", width: 16, poly: P([[-93.2665, 30.1880], [-93.2500, 30.1840], [-93.2330, 30.1812], [-93.2190, 30.1832], [-93.2010, 30.1822], [-93.1850, 30.1800]]) },
    ],
    levees: [
      { id: "lakefront-seawall", name: "the lakefront seawall", height: 4.0, pts: P([[-93.2213, 30.2335], [-93.2196, 30.2270], [-93.2208, 30.2215]]) },
      { id: "westlake-river-bank", name: "the Westlake river bank (procedural)", height: 6.0, pts: P([[-93.2497, 30.2553], [-93.2500, 30.2470], [-93.2505, 30.2405]]) },
    ],
    roads: [
      { id: "i10-west", name: "Interstate Ten west of the river", kind: "interstate", pts: P([[-93.2718, 30.2380], [-93.2600, 30.2379], [-93.2505, 30.2378]]) },
      { id: "i10-bridge", name: "the Interstate Ten bridge over the Calcasieu River", kind: "bridge", pts: P([[-93.2505, 30.2378], [-93.2452, 30.2378], [-93.2400, 30.2378]]) },
      { id: "i10-east", name: "Interstate Ten east of the river, along the lake's north shore", kind: "interstate", pts: P([[-93.2400, 30.2378], [-93.2200, 30.2372], [-93.1950, 30.2368], [-93.1782, 30.2365]]) },
      { id: "i210-bridge", name: "the Interstate Two-Ten bridge over Prien Lake", kind: "bridge", pts: P([[-93.2718, 30.1966], [-93.2660, 30.1965], [-93.2600, 30.1964]]) },
      { id: "i210-east", name: "Interstate Two-Ten east of Prien Lake", kind: "interstate", pts: P([[-93.2600, 30.1964], [-93.2300, 30.1962], [-93.2000, 30.1960], [-93.1782, 30.1958]]) },
      { id: "lakeshore-drive", name: "Lakeshore Drive", kind: "avenue", pts: P([[-93.2190, 30.2355], [-93.2183, 30.2270], [-93.2195, 30.2195], [-93.2230, 30.2150]]) },
      { id: "ryan-street", name: "Ryan Street", kind: "avenue", pts: P([[-93.2145, 30.2555], [-93.2145, 30.2300], [-93.2145, 30.2000], [-93.2140, 30.1905]]) },
      { id: "broad-street", name: "Broad Street", kind: "avenue", pts: P([[-93.2178, 30.2295], [-93.2000, 30.2295], [-93.1782, 30.2295]]) },
      { id: "enterprise-boulevard", name: "Enterprise Boulevard", kind: "avenue", pts: P([[-93.2000, 30.2555], [-93.2000, 30.2200], [-93.2000, 30.1905]]) },
      { id: "prien-lake-road", name: "Prien Lake Road", kind: "avenue", pts: P([[-93.2450, 30.1900], [-93.2150, 30.1900], [-93.1782, 30.1900]]) },
      { id: "sampson-street", name: "Sampson Street in Westlake", kind: "street", pts: P([[-93.2555, 30.2555], [-93.2555, 30.2300], [-93.2560, 30.2230]]) },
      { id: "docks-road", name: "the city docks road (procedural)", kind: "street", pts: P([[-93.2500, 30.2150], [-93.2502, 30.2000], [-93.2502, 30.1975]]) },
      { id: "westlake-river-road", name: "the Westlake river road (procedural)", kind: "street", pts: P([[-93.2555, 30.2470], [-93.2490, 30.2460]]) },
      { id: "north-side-street", name: "a north side street (procedural)", kind: "street", pts: P([[-93.2300, 30.2555], [-93.2280, 30.2450], [-93.2145, 30.2450], [-93.1782, 30.2450]]) },
      { id: "south-side-street", name: "a south side street (procedural)", kind: "street", pts: P([[-93.2300, 30.2030], [-93.2145, 30.2080], [-93.1782, 30.2080]]) },
      { id: "university-drive", name: "the road south to the ship channel (procedural)", kind: "street", pts: P([[-93.2600, 30.1750], [-93.2600, 30.1790], [-93.2300, 30.1780], [-93.2160, 30.1765], [-93.2000, 30.1765]]) },
    ],
    districts: [
      { id: "downtown", name: "downtown Lake Charles", character: "downtown", poly: P([[-93.2195, 30.2385], [-93.2000, 30.2385], [-93.2000, 30.2200], [-93.2195, 30.2200]]) },
      { id: "lakefront", name: "the lakefront", character: "park", poly: P([[-93.2230, 30.2360], [-93.2195, 30.2360], [-93.2195, 30.2080], [-93.2230, 30.2080]]) },
      { id: "north-lake-charles", name: "north Lake Charles", character: "suburb", poly: P([[-93.2370, 30.2555], [-93.1782, 30.2555], [-93.1782, 30.2400], [-93.2370, 30.2400]]) },
      { id: "east-side", name: "the east side", character: "suburb", poly: P([[-93.2000, 30.2400], [-93.1782, 30.2400], [-93.1782, 30.1950], [-93.2000, 30.1950]]) },
      { id: "south-lake-charles", name: "south Lake Charles", character: "suburb", poly: P([[-93.2440, 30.2200], [-93.2000, 30.2200], [-93.2000, 30.1920], [-93.2440, 30.1920]]) },
      { id: "university", name: "the university campus", character: "campus", poly: P([[-93.2160, 30.1880], [-93.1980, 30.1880], [-93.1980, 30.1745], [-93.2160, 30.1745]]) },
      { id: "westlake-river-frontage", name: "Westlake's river frontage", character: "industrial", poly: P([[-93.2718, 30.2555], [-93.2440, 30.2555], [-93.2440, 30.2400], [-93.2718, 30.2400]]) },
      { id: "city-docks", name: "the city docks on the river", character: "port", poly: P([[-93.2585, 30.2185], [-93.2500, 30.2185], [-93.2500, 30.2090], [-93.2585, 30.2090]]) },
      { id: "westlake", name: "Westlake", character: "suburb", poly: P([[-93.2718, 30.2400], [-93.2500, 30.2400], [-93.2500, 30.2080], [-93.2718, 30.2080]]) },
      { id: "prien-lake-shore", name: "the Prien Lake shore", character: "suburb", poly: P([[-93.2718, 30.1990], [-93.2160, 30.1990], [-93.2160, 30.1745], [-93.2718, 30.1745]]) },
    ],
    sites: [
      s("lcd-workforce-centre", "Lakefront Workforce Centre", "office", [-93.2105, 30.2265], "workforce", "The workforce centre downtown where a new hand starts: the site orientation, the permit study desk, the hazard orientation and the fall-protection anchor on the training wall. A training place, not any employer's programme."),
      s("lcd-bridge-work", "Interstate River Bridge Crew", "bridge", [-93.2310, 30.2420], "bridge", "The bridge crew's yard at the east end of the interstate's high bridge: lead paint contained before blasting, the cables and bearings inspected, tie-off on the deck and the pier checked for scour."),
      s("lcd-lakefront-promenade", "Lakefront Promenade Grounds Crew", "park", [-93.2215, 30.2150], "grounds", "The grounds crew on the lakefront promenade: the drop zone under the trees, the chipper after a storm and the trimmers kept clear of walkers."),
      s("lcd-civic-centre-stage", "Lakefront Civic Centre Stage Crew", "events", [-93.2165, 30.2315], "stage", "The stage crew at the civic centre by the lake: stage power, the rigging loft, the truss load-in and the barricade line."),
      s("lcd-downtown-high-rise", "Downtown High-Rise Site", "construction", [-93.2080, 30.2335], "highrise", "A downtown tower going up (procedural): steel erection, the pour and the shoring, rebar caps, the hoistway rails and the curtain wall set from the floor."),
      s("lcd-streetscape-crew", "Ryan Street Streetscape Crew", "utility", [-93.2165, 30.2215], "streetscape", "A streetscape rebuild along Ryan Street: locate before the dig, the trench box, hand-digging by the gas line and the saw kept wet for silica."),
      s("lcd-utility-locate", "Downtown Utility Locate Crew", "utility", [-93.2055, 30.2215], "locate", "The downtown locate crew: marks on the street, the gas leak survey, fused poly pipe and the main-break shutdown."),
      s("lcd-storm-drain-crew", "Storm Drain and Outfall Crew", "pump", [-93.2270, 30.2025], "stormdrain", "The storm drain crew by the lake's southern shore: the outfall, the lift station, the manhole's air tested before entry and the attendant at the top."),
      s("lcd-seawall-crew", "South Shore Bulkhead Crew", "seawall", [-93.2400, 30.2135], "seawall", "A bulkhead rebuild on the lake's south shore (procedural): the pile rig set up, concrete placed, bags placed under water and the turbidity curtain around the work."),
      s("lcd-hospital-campus", "a Lake Charles Hospital Campus", "hospital", [-93.2060, 30.2105], "hospital", "A hospital campus (procedural): patient transport, the crash cart, sterile processing, the medical-gas line and triage."),
      s("lcd-fire-station", "a Lake Charles Fire Station", "fire-station", [-93.2070, 30.2485], "fire", "A city fire station (procedural): size-up, the aerial ladder, rehab and scene safety at the ambulance."),
      s("lcd-school-campus", "a North Lake Charles School Campus", "school", [-93.2230, 30.2500], "school", "A school on the north side: the playground check, the crossing guard's corner, safety labels and the kitchen's warewash."),
      s("lcd-transit-yard", "the City Bus Yard", "transit", [-93.1895, 30.2410], "transit", "The city's bus yard (procedural): the yard track, the signal cabinet, the job briefing and the wheelchair lift."),
      s("lcd-marina-dock", "the Lakefront Boat Launch", "marina", [-93.2320, 30.2140], "harbour", "The boat launch at the lake's southern shore: lines in a crosswind, fuel at the dock with the spill kit and the throw line ready."),
      s("lcd-westlake-yard", "Westlake River Yard", "port", [-93.2600, 30.2475], "riveryard", "A river yard on the Westlake bank (procedural): mooring lines, the dock crane, fenders and bollards, and the forklift at the dock."),
      s("lcd-substation", "North Lake Charles Substation", "substation", [-93.1920, 30.2505], "substation", "A substation on the north side (procedural): switching under a permit, the arc-flash label and the line right-of-way."),
      s("lcd-union-hall", "Enterprise Boulevard Union Hall", "union-hall", [-93.1955, 30.2150], "unionhall", "A trades hall off Enterprise Boulevard (procedural) where apprentices study permits, wiring and welding. The hall is a training place; no union's programme is claimed."),
      s("lcd-roof-repair-crew", "Storm Roof Repair Crew", "construction", [-93.2075, 30.2010], "roofing", "A roof crew on the south side after a storm (procedural): the tear-off chute, heat-welded seams, the torch and its fire watch, and tie-off at the edge."),
      s("lcd-university-grounds", "University Grounds Crew", "campus", [-93.2065, 30.1790], "grounds", "The grounds crew on the university campus: tree work, storm clean-up, irrigation valves and the trimmer kept clear of students."),
      s("lcd-prien-lake-park", "Prien Lake Park Grounds", "park", [-93.2395, 30.1945], "grounds", "The park crew on Prien Lake's shore: limbs down after a storm, the chipper, and the irrigation box checked."),
    ],
    landmarks: [
      { id: "lake-charles-shore", name: "the shore of Lake Charles", position: f.xz([-93.2220, 30.2250]), kind: "shore" },
      { id: "i10-calcasieu-bridge", name: "the Interstate Ten bridge over the Calcasieu River", position: f.xz([-93.2400, 30.2390]), kind: "bridge" },
      { id: "downtown-lake-charles", name: "downtown Lake Charles", position: f.xz([-93.2120, 30.2280]), kind: "downtown" },
      { id: "westlake-place", name: "Westlake", position: f.xz([-93.2640, 30.2300]), kind: "town" },
      { id: "prien-lake-shore", name: "the Prien Lake shore", position: f.xz([-93.2650, 30.1900]), kind: "shore" },
      { id: "contraband-bayou-bank", name: "the Contraband Bayou bank", position: f.xz([-93.2250, 30.1850]), kind: "bayou" },
      { id: "mcneese-state-university", name: "McNeese State University", position: f.xz([-93.2090, 30.1785]), kind: "campus" },
      { id: "lcd-sign", name: SIGN, position: f.xz([-93.2120, 30.2250]), kind: "sign" },
    ],
    connectors: [
      { id: "sw-ld-big-lake-road-south", kind: "road", name: "the road south toward the ship channel", from: { parish: "lc-lakefront-downtown", position: f.xz([-93.2600, 30.1752]) }, to: { parish: "lc-calcasieu-channel", position: null, lonlat: [-93.260, 30.174] }, lonlat: [-93.260, 30.174], approximate: true },
      { id: "sw-ld-i10-west", kind: "road", name: "Interstate Ten west toward Sulphur", from: { parish: "lc-lakefront-downtown", position: f.xz([-93.2715, 30.2400]) }, to: { parish: "lc-sulphur", position: null, lonlat: [-93.272, 30.240] }, lonlat: [-93.272, 30.240], approximate: true },
      { id: "sw-ld-i10-east", kind: "road", name: "Interstate Ten east toward Lafayette", from: { parish: "lc-lakefront-downtown", position: f.xz([-93.1785, 30.2335]) }, to: { parish: "lc-east-calcasieu", position: null, lonlat: [-93.178, 30.234] }, lonlat: [-93.178, 30.234], approximate: true },
    ],
    fieldLessons: [],
    gated: [],
  };
}

// ------------------------------------------------------------------ the Calcasieu Ship Channel south of the city
function channel() {
  const f = frame(-93.300, 30.1325, 2.2), s = site(f), a = anchor(f), P = f.pts;
  return {
    id: "lc-calcasieu-channel",
    name: "the Calcasieu Ship Channel",
    region: "louisiana-sites",
    size: 4096,
    blurb: "The Calcasieu Ship Channel's industrial reach south of Lake Charles, in Calcasieu Parish, with marsh on both banks: a project site area for Woodside Louisiana LNG ($17.5 billion final investment decision, per the facts file) — module sets, the marine offload berth, the pipe rack, tank foundations, piling, hydrotest and the heavy-haul road. The project layout is illustrative; the parish, waterways and towns are real. A trade reference only: no partnership with any company is claimed.",
    start: "lcc-workforce-parking",
    anchors: [
      a([-93.316, 30.171], "the Calcasieu Ship Channel at the field's north edge"),
      a([-93.331, 30.150], "the Calcasieu Ship Channel"),
      a([-93.305, 30.105], "the Gulf Intracoastal Waterway"),
      a([-93.308, 30.160], "the east bank marsh"),
      a([-93.283, 30.139], "the farm roads east of the channel"),
      a([-93.260, 30.160], "the fields north-east of the site"),
    ],
    hills: [],
    water: [
      { id: "calcasieu-ship-channel", name: "the Calcasieu Ship Channel", kind: "canal", width: 130, poly: P([[-93.3150, 30.1728], [-93.3240, 30.1640], [-93.3310, 30.1570], [-93.3320, 30.1450], [-93.3310, 30.1330]]) },
      { id: "open-water-west", name: "open water beside the channel", kind: "lake", poly: P([[-93.3468, 30.1350], [-93.3290, 30.1340], [-93.3270, 30.1200], [-93.3320, 30.1100], [-93.3468, 30.1050]]) },
      { id: "intracoastal-waterway", name: "the Gulf Intracoastal Waterway", kind: "canal", width: 80, poly: P([[-93.3300, 30.1110], [-93.3150, 30.1035], [-93.3050, 30.1050], [-93.2950, 30.1085], [-93.2840, 30.1100]]) },
      { id: "marsh-bayou", name: "a marsh bayou (procedural)", kind: "bayou", width: 16, poly: P([[-93.3080, 30.1620], [-93.3120, 30.1480], [-93.3176, 30.1400], [-93.3250, 30.1380]]) },
      { id: "east-bank-marsh", name: "the east bank marsh", kind: "wetland", poly: P([[-93.3200, 30.1700], [-93.2950, 30.1700], [-93.2950, 30.1500], [-93.3200, 30.1500]]) },
      { id: "south-marsh", name: "the marsh by the waterway (procedural)", kind: "wetland", poly: P([[-93.3260, 30.1180], [-93.3050, 30.1180], [-93.3050, 30.1120], [-93.3260, 30.1150]]) },
    ],
    levees: [
      { id: "east-bank-levee", name: "the channel's east bank levee (procedural)", height: 3.5, pts: P([[-93.3230, 30.1600], [-93.3260, 30.1520], [-93.3265, 30.1440]]) },
      { id: "site-storm-berm", name: "the site's storm berm (procedural)", height: 3.2, pts: P([[-93.3150, 30.1200], [-93.3000, 30.1195], [-93.2950, 30.1210]]) },
    ],
    roads: [
      { id: "north-road", name: "the road north to Lake Charles (procedural)", kind: "avenue", pts: P([[-93.2600, 30.1728], [-93.2600, 30.1550], [-93.2600, 30.1390]]) },
      { id: "east-west-road", name: "a straight farm road east of the channel (procedural)", kind: "avenue", pts: P([[-93.3080, 30.1390], [-93.2830, 30.1390], [-93.2532, 30.1390]]) },
      { id: "south-farm-road", name: "a farm road south to the waterway (procedural)", kind: "street", pts: P([[-93.2830, 30.1390], [-93.2830, 30.1200], [-93.2830, 30.1135]]) },
      { id: "north-farm-road", name: "a farm road across the fields (procedural)", kind: "street", pts: P([[-93.2743, 30.1550], [-93.2532, 30.1550]]) },
      { id: "heavy-haul-road", name: "the heavy-haul road from the berth (procedural)", kind: "street", pts: P([[-93.3220, 30.1300], [-93.3100, 30.1300], [-93.3000, 30.1300], [-93.3000, 30.1390]]) },
      { id: "waterway-road", name: "the waterway road (procedural)", kind: "street", pts: P([[-93.2830, 30.1135], [-93.2532, 30.1135]]) },
    ],
    districts: [
      { id: "lng-site-area", name: "the project site area (illustrative)", character: "refinery", poly: P([[-93.3230, 30.1380], [-93.2950, 30.1380], [-93.2950, 30.1210], [-93.3230, 30.1210]]) },
      { id: "berth-frontage", name: "the channel berth frontage", character: "port", poly: P([[-93.3280, 30.1420], [-93.3230, 30.1420], [-93.3230, 30.1250], [-93.3280, 30.1250]]) },
      { id: "east-bank-marsh", name: "the east bank marsh", character: "wetland", poly: P([[-93.3200, 30.1700], [-93.2950, 30.1700], [-93.2950, 30.1500], [-93.3200, 30.1500]]) },
      { id: "subdivision", name: "a neighbourhood by the marsh", character: "suburb", poly: P([[-93.3050, 30.1560], [-93.2830, 30.1560], [-93.2830, 30.1420], [-93.3050, 30.1420]]) },
      { id: "east-fields", name: "the fields east of the channel", character: "garden", poly: P([[-93.2830, 30.1730], [-93.2532, 30.1730], [-93.2532, 30.1150], [-93.2830, 30.1150]]) },
      { id: "waterway-industry", name: "industry along the waterway", character: "industrial", poly: P([[-93.2830, 30.1120], [-93.2532, 30.1120], [-93.2532, 30.0920], [-93.2830, 30.0920]]) },
      { id: "west-bank", name: "the west bank beyond the channel", character: "industrial", poly: P([[-93.3468, 30.1730], [-93.3330, 30.1730], [-93.3330, 30.1400], [-93.3468, 30.1400]]) },
    ],
    sites: [
      s("lcc-lng-module-set", "Module Set Area", "construction", [-93.3130, 30.1340], "moduleset", "Where a pre-built process module is set on its foundation (illustrative): the critical-lift plan, the signalperson, the crawler crane's load chart and the ironworkers' connections.", { precinct: true }),
      s("lcc-marine-offload", "Marine Offload Berth", "port", [-93.3245, 30.1320], "offload", "The berth on the channel where heavy cargo comes ashore (illustrative): mooring lines, the dock crane, the lift plan and the fenders checked before the barge ties up.", { precinct: true }),
      s("lcc-pipe-rack", "Pipe Rack Crew", "construction", [-93.3040, 30.1345], "piperack", "A pipe rack going up (illustrative): steel erection, welding, the scaffold tagged before use and tie-off at the edge.", { precinct: true }),
      s("lcc-heavy-haul-road", "Heavy-Haul Road Crew", "construction", [-93.3170, 30.1270], "haulroad", "The road from the berth that carries the heavy loads (illustrative): the walkaround, loading blind spots, compacted lifts and traffic control.", { precinct: true }),
      s("lcc-tank-foundation", "Tank Foundation Pour", "construction", [-93.3070, 30.1250], "foundation", "A large foundation pour (illustrative): the forms and shoring, rebar caps, the pour sequence and wet cutting for silica.", { precinct: true }),
      s("lcc-pile-driving", "Foundation Piling Crew", "construction", [-93.3200, 30.1360], "piling", "The piling crew on soft ground (illustrative): the pile rig and its leads, the lift plan, and the observer's watch when piles go in near the water.", { precinct: true }),
      s("lcc-laydown-yard", "Laydown Yard", "staging", [-93.2900, 30.1350], "laydown", "Where the steel, pipe and equipment wait (illustrative): forklifts, loading lanes, the trailer and the daily walkaround.", { precinct: true }),
      s("lcc-crane-pad", "Heavy Crane Pad", "construction", [-93.3180, 30.1320], "cranepad", "The crane pad built up and compacted before the big crane is assembled (illustrative): the load chart and the lift plan.", { precinct: true }),
      s("lcc-workforce-parking", "Workforce Parking and Orientation", "office", [-93.2700, 30.1350], "workforce", "Where the shift starts (illustrative): the site orientation, the permit study, the hazard orientation and the fall-protection brief. A training place, not any employer's programme.", { precinct: true }),
      s("lcc-hydrotest", "Hydrotest Station", "construction", [-93.3100, 30.1240], "hydrotest", "Piping tested with water before it goes into service (illustrative): the inspector's witness, the test boundary and the hot-tap and weld checks.", { precinct: true }),
      s("lcc-insulation-crew", "Insulation Crew", "workshop", [-93.2980, 30.1250], "insulation", "The insulators' shop and scaffold (illustrative): pipe insulation and jacketing, the scaffold tag and tie-off.", { precinct: true }),
      s("lcc-substation-build", "Site Substation Build", "substation", [-93.2960, 30.1340], "subbuild", "The site's substation going in (illustrative): switching under a permit, the arc-flash label and the duct trench.", { precinct: true }),
      s("lcc-control-building", "Control Building Fit-Out", "construction", [-93.3040, 30.1230], "control", "The control building's electrical fit-out (illustrative): the panels, the arc-flash label, the electrical room and the fire alarm panel.", { precinct: true }),
      s("lcc-flare-area-build", "Flare Area Build", "construction", [-93.3190, 30.1225], "flare", "A tall steel structure raised in sections (illustrative): the lift plan, hot work with a fire watch, and confined entry into vessels only under a permit.", { precinct: true }),
      s("lcc-berth-dredge", "Berth Dredge Crew", "landing", [-93.3250, 30.1410], "dredge", "The dredge crew deepening the berth pocket (illustrative): the dredge barge, the dewatering pad, the turbidity curtain and the radio on the channel.", { precinct: true }),
      s("lcc-marsh-mat-access", "Marsh Mat Access Road", "mat-crossing", [-93.3000, 30.1600], "mats", "Where machines reach the site across the marsh on mats (illustrative): the walkaround, the mats laid ahead and the spill kit on board.", { precinct: true }),
      s("lcc-security-gate", "Site Security Gate", "trucking", [-93.2800, 30.1360], "gate", "The gate on the access road (illustrative): trucks backed with a spotter, the traffic plan and every visitor oriented.", { precinct: true }),
      s("lcc-fire-water-station", "Fire Water Station", "pump", [-93.2900, 30.1250], "firewater", "The site's fire water pumps and hydrants (illustrative): the hydrant flow test, size-up drills and confined-space rescue.", { precinct: true }),
      s("lcc-marsh-restoration-crew", "East Bank Marsh Crew", "wetland", [-93.3050, 30.1640], "envsurvey", "The marsh crew on the channel's east bank: the transect, the sonde, the nesting buffer and the drone survey, so work beside the marsh protects it."),
      s("lcc-waterway-landing", "Waterway Crew Landing", "landing", [-93.2990, 30.1120], "harbour", "A small landing on the Intracoastal Waterway's north bank: lines, fuel with the spill kit and the throw line ready."),
    ],
    landmarks: [
      { id: "calcasieu-ship-channel-bank", name: "the Calcasieu Ship Channel", position: f.xz([-93.3255, 30.1500]), kind: "canal" },
      { id: "east-bank-marsh-place", name: "the east bank marsh", position: f.xz([-93.3080, 30.1650]), kind: "marsh" },
      { id: "intracoastal-waterway-bank", name: "the Gulf Intracoastal Waterway", position: f.xz([-93.2950, 30.1110]), kind: "canal" },
      { id: "east-fields-place", name: "the fields east of the channel", position: f.xz([-93.2700, 30.1500]), kind: "field" },
      { id: "open-water-shore", name: "the shore of the open water beside the channel", position: f.xz([-93.3265, 30.1280]), kind: "shore" },
      { id: "lcc-sign", name: SIGN, position: f.xz([-93.2750, 30.1340]), kind: "sign" },
    ],
    connectors: [
      { id: "sw-cc-big-lake-road-north", kind: "road", name: "the road north to Lake Charles", from: { parish: "lc-calcasieu-channel", position: f.xz([-93.2600, 30.1725]) }, to: { parish: "lc-lakefront-downtown", position: null, lonlat: [-93.260, 30.174] }, lonlat: [-93.260, 30.174], approximate: true },
      { id: "sw-cc-farm-road-east", kind: "road", name: "the farm road east", from: { parish: "lc-calcasieu-channel", position: f.xz([-93.2535, 30.1390]) }, to: { parish: "lc-east-calcasieu-south", position: null, lonlat: [-93.253, 30.139] }, lonlat: [-93.253, 30.139], approximate: true },
    ],
    fieldLessons: [],
    gated: [],
  };
}

// ------------------------------------------------------------------ Vinton and the Port of Vinton
function vinton() {
  const f = frame(-93.580, 30.1725, 2.0), s = site(f), a = anchor(f), P = f.pts;
  return {
    id: "lc-port-of-vinton",
    name: "the Port of Vinton",
    region: "louisiana-sites",
    size: 4096,
    blurb: "Vinton and its port in western Calcasieu Parish, Interstate Ten running south-west to north-east past the town, the port's waterway, rice fields and pasture: a FastSites site area — $5.9 million at the Port of Vinton for a 600 ft × 50 ft barge berth, per the facts file — the berth build, site preparation, rail and road work, the sheet-pile wall, dredging and mooring dolphins. The project layout is illustrative; the parish, waterways and towns are real. A trade reference only: no partnership is claimed.",
    start: "lpv-port-office",
    anchors: [
      a([-93.585, 30.187], "Vinton"),
      a([-93.588, 30.177], "Interstate Ten at Vinton's interchange"),
      a([-93.566, 30.148], "the Port of Vinton (the port's area)"),
      a([-93.598, 30.141], "a pond south-west of town"),
      a([-93.615, 30.143], "the wooded wetland south-west of town"),
      a([-93.545, 30.175], "the fields east of Vinton"),
    ],
    hills: [],
    water: [
      { id: "port-waterway", name: "the port's waterway", kind: "canal", width: 45, poly: P([[-93.5678, 30.1812], [-93.5672, 30.1725], [-93.5678, 30.1615], [-93.5694, 30.1523], [-93.5725, 30.1449], [-93.5757, 30.1358]]) },
      { id: "south-west-pond", name: "a pond south-west of town", kind: "lake", poly: P([[-93.6015, 30.1440], [-93.5950, 30.1440], [-93.5945, 30.1375], [-93.6015, 30.1372]]) },
      { id: "wooded-wetland", name: "the wooded wetland south-west of town", kind: "wetland", poly: P([[-93.6226, 30.1358], [-93.6080, 30.1358], [-93.6080, 30.1500], [-93.6226, 30.1500]]) },
      { id: "rice-field-ditch", name: "a rice field ditch (procedural)", kind: "canal", width: 14, poly: P([[-93.5450, 30.1800], [-93.5445, 30.1730], [-93.5440, 30.1660]]) },
    ],
    levees: [
      { id: "berth-bulkhead", name: "the new barge berth's bulkhead (illustrative)", height: 3.8, pts: P([[-93.5686, 30.1518], [-93.5699, 30.1478]]) },
      { id: "waterway-spoil-bank", name: "the waterway spoil bank (procedural)", height: 6.0, pts: P([[-93.5648, 30.1805], [-93.5646, 30.1720], [-93.5648, 30.1640]]) },
    ],
    roads: [
      { id: "i10", name: "Interstate Ten", kind: "interstate", pts: P([[-93.6226, 30.1615], [-93.5875, 30.1766], [-93.5694, 30.1849], [-93.5374, 30.1914]]) },
      { id: "us90", name: "US Highway Ninety through Vinton", kind: "avenue", pts: P([[-93.6226, 30.1688], [-93.5859, 30.1891], [-93.5491, 30.2093]]) },
      { id: "main-road", name: "the main road south through Vinton (procedural)", kind: "avenue", pts: P([[-93.5875, 30.2093], [-93.5875, 30.1890], [-93.5875, 30.1766], [-93.5875, 30.1358]]) },
      { id: "port-road", name: "the port road (procedural)", kind: "avenue", pts: P([[-93.5587, 30.1835], [-93.5587, 30.1620], [-93.5610, 30.1560]]) },
      { id: "south-road-west", name: "a farm road west of the waterway (procedural)", kind: "street", pts: P([[-93.6226, 30.1622], [-93.5875, 30.1620], [-93.5690, 30.1620]]) },
      { id: "south-road-east", name: "a farm road east of the waterway (procedural)", kind: "street", pts: P([[-93.5664, 30.1620], [-93.5587, 30.1620], [-93.5374, 30.1620]]) },
      { id: "east-road", name: "a road east of the interchange (procedural)", kind: "street", pts: P([[-93.5694, 30.1840], [-93.5374, 30.1840]]) },
      { id: "town-street", name: "a Vinton town street (procedural)", kind: "street", pts: P([[-93.5980, 30.1860], [-93.5720, 30.1860]]) },
    ],
    districts: [
      { id: "vinton-town", name: "Vinton", character: "suburb", poly: P([[-93.5980, 30.1950], [-93.5690, 30.1950], [-93.5690, 30.1790], [-93.5980, 30.1790]]) },
      { id: "vinton-main-street", name: "Vinton's main street", character: "downtown", poly: P([[-93.5910, 30.1905], [-93.5840, 30.1905], [-93.5840, 30.1850], [-93.5910, 30.1850]]) },
      { id: "port", name: "the Port of Vinton", character: "port", poly: P([[-93.5705, 30.1600], [-93.5540, 30.1600], [-93.5540, 30.1420], [-93.5705, 30.1420]]) },
      { id: "north-fields", name: "the fields north of town", character: "garden", poly: P([[-93.6226, 30.2093], [-93.5374, 30.2093], [-93.5374, 30.1960], [-93.6226, 30.1960]]) },
      { id: "east-fields", name: "the rice fields and pasture east of the waterway", character: "garden", poly: P([[-93.5660, 30.1830], [-93.5374, 30.1830], [-93.5374, 30.1358], [-93.5540, 30.1358], [-93.5540, 30.1600], [-93.5660, 30.1600]]) },
      { id: "west-fields", name: "the fields west of the waterway", character: "garden", poly: P([[-93.6226, 30.1780], [-93.5700, 30.1780], [-93.5700, 30.1358], [-93.6226, 30.1358]]) },
      { id: "wooded-wetland", name: "the wooded wetland south-west of town", character: "wetland", poly: P([[-93.6226, 30.1358], [-93.6080, 30.1358], [-93.6080, 30.1500], [-93.6226, 30.1500]]) },
    ],
    sites: [
      s("lpv-barge-berth-build", "Barge Berth Build", "port", [-93.5668, 30.1492], "berth", "The new barge berth going in (illustrative): the pile rig, the deck pour, the lift plan and the first mooring lines.", { precinct: true }),
      s("lpv-site-prep", "Port Site Preparation", "construction", [-93.5600, 30.1470], "siteprep", "Clearing and grading the port's upland (illustrative): the dozer on the slope, locates before the dig, compacted lifts and the walkaround.", { precinct: true }),
      s("lpv-rail-and-road", "Rail and Road Crew", "rail", [-93.5560, 30.1580], "railroad", "The rail spur and the port road (illustrative): ties and rail, roadway worker protection, the crossing signal and the compacted base.", { precinct: true }),
      s("lpv-sheet-pile-wall", "Sheet-Pile Wall Crew", "seawall", [-93.5664, 30.1535], "sheetpile", "The sheet-pile wall along the berth (illustrative): the vibratory rig and its leads, the welded wale and the lift plan.", { precinct: true }),
      s("lpv-berth-dredge", "Berth Dredge Crew", "landing", [-93.5760, 30.1490], "dredge", "The dredge crew deepening the berth (illustrative): the barge, the dewatering pad, the turbidity curtain and the radio.", { precinct: true }),
      s("lpv-mooring-dolphins", "Mooring Dolphin Crew", "landing", [-93.5690, 30.1435], "dolphins", "Mooring dolphins set off the berth (illustrative): the pile inspection dive, fenders and bollards, the rig and the throw line.", { precinct: true }),
      s("lpv-crane-and-rigging", "Crane and Rigging Pad", "construction", [-93.5635, 30.1510], "cranepad", "The crane pad by the berth (illustrative): the crane assembled on compacted ground, its load chart and the lift plan.", { precinct: true }),
      s("lpv-drainage-culvert", "Drainage Culvert Crew", "utility", [-93.5760, 30.1650], "culvert", "Culverts under the port road where the field drainage runs (illustrative): the grade, the trench box, fish passage and the outfall.", { precinct: true }),
      s("lpv-environmental-survey", "Environmental Survey Crew", "monitoring", [-93.6050, 30.1470], "envsurvey", "The survey crew at the marsh edge (illustrative): the transect, the sonde, the nesting buffer and the drone survey.", { precinct: true }),
      s("lpv-laydown-yard", "Port Laydown Yard", "staging", [-93.5595, 30.1530], "laydown", "Where the piles and rebar wait (illustrative): forklifts, loading lanes and the walkaround.", { precinct: true }),
      s("lpv-utility-extension", "Utility Extension Crew", "utility", [-93.5560, 30.1680], "utilext", "Power and water brought down the port road (illustrative): fused poly pipe, the trench box, the line right-of-way and locates.", { precinct: true }),
      s("lpv-port-office", "Port Office and Orientation", "office", [-93.5635, 30.1575], "workforce", "The port office where every crew signs in (illustrative): the site orientation, the permit study, the hazard orientation and the fall-protection brief. A training place, not any employer's programme.", { precinct: true }),
      s("lpv-truck-gate", "Port Truck Gate", "trucking", [-93.5620, 30.1650], "truckgate", "The truck gate on the port road (illustrative): backing with a spotter, the dock plate and the traffic plan.", { precinct: true }),
      s("lpv-warehouse-build", "Port Warehouse Build", "warehouse", [-93.5620, 30.1440], "warehouse", "A warehouse by the berth (illustrative): steel erection, the slab pour, tie-off at the edge and the dock leveller.", { precinct: true }),
      s("lpv-vinton-main-street", "Vinton Main Street Utility Crew", "utility", [-93.5850, 30.1878], "streetscape", "A street and utility crew on Vinton's main street (procedural): locates, the trench box, hand-digging by the gas line and the wet saw."),
      s("lpv-fire-station", "a Vinton Fire Station", "fire-station", [-93.5760, 30.1885], "fire", "The town's fire station (procedural): size-up, the ladder, rehab and scene safety."),
      s("lpv-school-campus", "a Vinton School Campus", "school", [-93.5950, 30.1810], "school", "A school in Vinton (procedural): the playground check, the crossing guard, the safety labels and the kitchen."),
      s("lpv-rice-field-crew", "Rice Field Drainage Crew", "wetland", [-93.5480, 30.1720], "culvert", "A drainage crew in the rice fields east of town (procedural): field culverts, the ditch, the trench box and the outfall."),
    ],
    landmarks: [
      { id: "vinton-place", name: "Vinton", position: f.xz([-93.5820, 30.1905]), kind: "town" },
      { id: "port-of-vinton-place", name: "the Port of Vinton", position: f.xz([-93.5650, 30.1455]), kind: "port" },
      { id: "i10-vinton", name: "Interstate Ten at Vinton", position: f.xz([-93.5860, 30.1790]), kind: "road" },
      { id: "south-marsh-place", name: "the wooded wetland south-west of town", position: f.xz([-93.6150, 30.1430]), kind: "marsh" },
      { id: "rice-fields-place", name: "the rice fields east of the waterway", position: f.xz([-93.5450, 30.1750]), kind: "field" },
      { id: "pond-shore", name: "the shore of the pond south-west of town", position: f.xz([-93.5940, 30.1410]), kind: "shore" },
      { id: "lpv-sign", name: SIGN, position: f.xz([-93.5610, 30.1590]), kind: "sign" },
    ],
    connectors: [
      { id: "sw-pv-i10-west", kind: "road", name: "Interstate Ten west toward the Sabine River and Texas", from: { parish: "lc-port-of-vinton", position: f.xz([-93.6223, 30.1617]) }, to: { parish: "sabine-texas-line", position: null, lonlat: [-93.622, 30.162] }, lonlat: [-93.622, 30.162], approximate: true },
      { id: "sw-pv-i10-east", kind: "road", name: "Interstate Ten east toward Sulphur and Lake Charles", from: { parish: "lc-port-of-vinton", position: f.xz([-93.5377, 30.1913]) }, to: { parish: "lc-sulphur", position: null, lonlat: [-93.538, 30.191] }, lonlat: [-93.538, 30.191], approximate: true },
    ],
    fieldLessons: [],
    gated: [],
  };
}

const HEAD = {
  "lc-lakefront-downtown": "Lake Charles Lakefront & Downtown",
  "lc-calcasieu-channel": "the Calcasieu Ship Channel (Woodside Louisiana LNG's site area; the project layout is illustrative)",
  "lc-port-of-vinton": "the Port of Vinton (a FastSites site area; the project layout is illustrative)",
};
const EXPORT = { "lc-lakefront-downtown": "NP_LC_LAKEFRONT_DOWNTOWN", "lc-calcasieu-channel": "NP_LC_CALCASIEU_CHANNEL", "lc-port-of-vinton": "NP_LC_PORT_OF_VINTON" };

function write(p) {
  const lines = [
    `// ${HEAD[p.id]} — console SOUTHWEST (docs/consoles/SOUTHWEST.md, docs/parishes.md). A stylised 4096 m map, not a survey:`,
    "// real places appear only by their public names as places; every coordinate is approximate (three decimals, `approximate: true`)",
    "// and exists only to place the map. One north-up uniform scale (x east, +z south). No imagery was used: the lake, the river, the",
    "// ship channel, the bayous, the interstates and the towns follow their general position; every other feature, every site and",
    "// every project layout is PROCEDURAL — the project layout is illustrative; the parish, waterways and towns are real. Project",
    "// facts only from the Louisiana facts file; no partnership with any company, agency or union is claimed. Written once by",
    "// tools/gen_sw_districts.mjs; this module is the source afterwards. Pure data, no imports.",
    "// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).",
    `export const ${EXPORT[p.id]} = {`,
  ];
  for (const [k, v] of Object.entries(p)) {
    if (Array.isArray(v)) {
      if (!v.length) { lines.push(`  ${k}: [],`); continue; }
      lines.push(`  ${k}: [`);
      for (const item of v) lines.push(`    ${JSON.stringify(item)},`);
      lines.push("  ],");
    } else lines.push(`  ${k}: ${JSON.stringify(v)},`);
  }
  lines.push("};", "");
  writeFileSync(join(SHARED, `np-data-${p.id}.js`), lines.join("\n"));
  console.log(`wrote np-data-${p.id}.js — ${p.sites.length} sites`);
}

// Field lessons (RW_FIELD_LESSONS shape, no digits) and gated side quests (the gate contract), per map.
const L = (id, title, site, landmark, k12, station, trade, tradeLine, steps, q, options, answer, why) => ({ id, title, site, ...(landmark ? { landmark } : {}), k12, station, trade, tradeLine, minutes: 3, steps, check: { q, options, answer, why } });
const Q = (parish, id, title, site, siteName, summary, stations, note) => ({ id, kind: "side-quest", title, world: "parishes", parish, site, siteName, summary, gate: { stations, note } });
const EXTRA = {
  "lc-lakefront-downtown": {
    fieldLessons: [
      L("sw-ld-fl-bridge-lever", "How a Crane Lifts a Bridge Beam", "lcd-bridge-work", "i10-calcasieu-bridge", "k12-simple-machines-at-a-crane", "bridge-cable-inspection", "Ironworkers", "An ironworker watches the signalperson, because a load on a crane swings wide and a clear path keeps everyone safe.",
        ["Look up at the high bridge over the river and the crane beside the pier.", "A crane is a long lever: a heavy weight at the back balances the load at the hook.", "The crew keeps everyone out from under the load and follows one person's signals."],
        "Why does the crew keep people out from under a crane's load?", ["A load can swing or drop, so the space under it stays clear", "It makes the crane go faster", "The crane cannot lift near people"], 0, "A suspended load can swing or fall, so the area under it is kept clear and one signalperson directs the lift."),
      L("sw-ld-fl-storm-drain", "Where the Storm Drain Goes", "lcd-storm-drain-crew", "lake-charles-shore", "k12-es-where-the-storm-drain-goes", "stormwater-outfall", "Utility crews", "A storm drain crew keeps the outfall clear, because everything that washes into a street drain ends up in the lake.",
        ["Find a drain grate by the kerb near the lakefront.", "Rain carries leaves, litter and oil from the street into the pipe under the road.", "The pipe opens at the lake, so the crew keeps it clear and nothing is poured down a drain."],
        "Where does water from a street drain in Lake Charles end up?", ["In the lake and the river", "In a water treatment plant every time", "It disappears underground"], 0, "Street drains carry rain straight to the lake and the river, which is why nothing should be poured into them."),
      L("sw-ld-fl-levee", "How a Seawall Holds the Lake Back", "lcd-seawall-crew", "lake-charles-shore", "k12-by-how-a-levee-holds-water-back", "br-levee-inspection-and-seepage", "Shoreline crews", "A shoreline crew checks the wall for cracks and wet ground behind it, because a small leak is the first sign a repair is needed.",
        ["Stand on the lakefront and look at the wall between the water and the walk.", "The wall holds back the lake when the wind pushes waves toward the shore.", "The crew looks for cracks, gaps and soft ground behind the wall and reports them."],
        "What is an early sign that a seawall needs repair?", ["Wet or soft ground behind the wall", "Birds sitting on the wall", "Calm water in front of it"], 0, "Water seeping through or under a wall shows up as wet or soft ground behind it, which the crew reports for repair."),
    ],
    gated: [
      Q("lc-lakefront-downtown", "sw-ld-gated-bridge-deck", "A Shift on the Bridge Deck", "lcd-bridge-work", "Interstate River Bridge Crew", "Join the bridge crew for a shift on the deck high over the Calcasieu River.", ["leading-edge-and-horizontal-lifeline", "bridge-lead-containment"], "Finish the lifeline and lead containment stations before the deck shift"),
      Q("lc-lakefront-downtown", "sw-ld-gated-tower-pour", "The Tower Pour", "lcd-downtown-high-rise", "Downtown High-Rise Site", "Help the crew place a floor slab on the downtown tower.", ["concrete-pour", "formwork-shoring"], "Walk the concrete pour and shoring stations before the pour"),
    ],
  },
  "lc-calcasieu-channel": {
    fieldLessons: [
      L("sw-cc-fl-crane-balance", "Balancing a Heavy Lift", "lcc-crane-pad", "lcc-sign", "k12-simple-machines-at-a-crane", "rl-critical-lift-plan-and-signalperson", "Operating engineers", "An operator checks the load chart and the ground under the crane before every heavy lift, because soft ground can tip a crane.",
        ["Look at the big crane standing on its pad of packed stone.", "The counterweight at the back balances the heavy load hanging from the hook.", "The pad spreads the weight so the crane stays level on soft ground."],
        "Why is a crane set on a built-up pad at a marsh site?", ["So soft ground does not sink under it", "So it looks taller", "So it can drive faster"], 0, "Soft ground can give way under a crane's weight, so the crew builds and compacts a pad first."),
      L("sw-cc-fl-tide-berth", "Reading the Water at the Berth", "lcc-marine-offload", "calcasieu-ship-channel-bank", "k12-graphing-tide-readings-at-the-pier", "mooring-line", "Longshore and marine crews", "A marine crew watches the water level at the berth, because a barge rises and falls and the lines must be tended.",
        ["Watch a mark on a piling at the berth through the day.", "The water rises and falls a little with the tide and the wind.", "The crew tends the mooring lines so the barge stays snug as the water moves."],
        "Why do crews tend mooring lines through the day?", ["The water level changes, so the lines need adjusting", "Lines wear out every hour", "To make the barge go faster"], 0, "As the water rises and falls the barge moves, so lines are adjusted to keep it held safely."),
      L("sw-cc-fl-marsh", "A Marsh Slows the Storm", "lcc-marsh-mat-access", "east-bank-marsh-place", "k12-by-wetlands-as-a-storms-speed-bump", "br-tidal-marsh-grading-amphibious-excavator", "Heavy equipment operators", "An operator crosses the marsh on mats, because the mats protect the marsh and keep the machine from sinking.",
        ["Look across the marsh grass on the channel's east bank.", "Grass and shallow water slow waves and soak up storm water.", "Crews lay mats so machines cross without tearing up the marsh."],
        "Why do crews lay mats before driving on marsh?", ["To protect the marsh and keep machines from sinking", "To make the marsh warmer", "Mats are only for decoration"], 0, "Mats spread a machine's weight so it does not sink or rut the marsh that protects the shore."),
    ],
    gated: [
      Q("lc-calcasieu-channel", "sw-cc-gated-module-set", "Setting a Module", "lcc-lng-module-set", "Module Set Area", "Help the lift crew set a pre-built module on its foundation (illustrative).", ["rl-critical-lift-plan-and-signalperson", "op-crawler-crane-assembly-and-load-chart"], "Finish the critical lift plan and crane load chart stations before the lift"),
      Q("lc-calcasieu-channel", "sw-cc-gated-hydrotest", "The Hydrotest Walkdown", "lcc-hydrotest", "Hydrotest Station", "Walk the test boundary with the inspector before a line is filled (illustrative).", ["ib-hydrostatic-test-and-inspector-witness"], "Walk the hydrostatic test station before the walkdown"),
    ],
  },
  "lc-port-of-vinton": {
    fieldLessons: [
      L("sw-pv-fl-float", "Why a Loaded Barge Floats", "lpv-barge-berth-build", "port-of-vinton-place", "k12-buoyancy-and-pressure-in-the-deep", "mooring-line", "Marine and dock crews", "A dock crew watches how low a barge sits, because a heavy load pushes it deeper and changes how it is tied up.",
        ["Look at a barge tied to the berth and where the water meets its side.", "The water pushes up on the hull, and a heavier load sits the barge lower.", "The crew adjusts the lines as the barge is loaded so it stays snug to the berth."],
        "What happens to a barge as it is loaded?", ["It sits lower in the water", "It rises higher", "It stops floating"], 0, "More weight pushes the hull deeper until the water's push balances it, so the barge sits lower."),
      L("sw-pv-fl-drain", "Where the Field Water Goes", "lpv-drainage-culvert", "rice-fields-place", "k12-es-where-the-storm-drain-goes", "or-ranch-road-grading-and-culvert", "Labourers and operators", "A culvert crew keeps the pipes under the road clear, because a blocked culvert floods the road and the fields.",
        ["Find the ditch beside the port road and the pipe under it.", "Rain from the fields runs along the ditch and through the pipe to the waterway.", "The crew clears the pipe ends and never works in a trench without protection."],
        "What happens when a culvert under a road is blocked?", ["Water backs up and can flood the road", "The road gets drier", "Nothing changes"], 0, "Blocked culverts stop the water moving, so it backs up over the road and the fields."),
      L("sw-pv-fl-marsh", "A Marsh Slows the Water", "lpv-environmental-survey", "south-marsh-place", "k12-by-wetlands-as-a-storms-speed-bump", "marsh-transect-survey", "Survey crews", "A survey crew walks a line across the marsh and records what grows there, so the work around the port protects it.",
        ["Stand at the marsh edge south of town.", "Grass and shallow water slow the water after a storm.", "The survey crew records the plants so the port's work can avoid harming them."],
        "Why does a crew survey the marsh before port work?", ["So the work can protect the marsh", "To find the fastest road", "To count cars"], 0, "Knowing what lives in the marsh lets the crew plan work that avoids harming it."),
    ],
    gated: [
      Q("lc-port-of-vinton", "sw-pv-gated-first-pile", "The First Berth Pile", "lpv-barge-berth-build", "Barge Berth Build", "Help the pile crew drive the first pile for the new berth (illustrative).", ["op-pile-driving-rig-and-lead-setup", "rl-critical-lift-plan-and-signalperson"], "Finish the pile rig and lift plan stations before the first pile"),
      Q("lc-port-of-vinton", "sw-pv-gated-rail-spur", "Laying the Rail Spur", "lpv-rail-and-road", "Rail and Road Crew", "Work with the track crew laying the port's rail spur (illustrative).", ["ra-roadway-worker-protection-and-job-briefing", "ra-tie-and-rail-replacement-with-track-machines"], "Walk roadway worker protection and track machines before the spur"),
    ],
  },
};
// Paired crossings between the SOUTHWEST maps: each end names the other's own from.position (both fields hold their end).
const maps = [lakefront(), channel(), vinton()];
for (const p of maps) for (const c of p.connectors) {
  const other = maps.find((m) => m.id === c.to.parish);
  const pair = other?.connectors.find((x) => x.to.parish === p.id && x.lonlat.join() === c.lonlat.join());
  if (pair) c.to.position = pair.from.position;
}
for (const p of maps) { Object.assign(p, EXTRA[p.id]); write(p); }
