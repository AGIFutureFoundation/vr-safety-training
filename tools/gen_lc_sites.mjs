#!/usr/bin/env node
/**
 * SITES-COAST (console `lc`, docs/consoles/SITES-COAST.md): writes the four coastal / Acadiana project maps of the
 * `louisiana-sites` region once, as pure literal modules (WebXR/shared/np-data-la-*.js). The modules are the source of
 * truth afterwards; re-running this overwrites them.
 *
 *     node tools/gen_lc_sites.mjs
 *
 * The geography rule (the Louisiana wave brief): no satellite imagery or map service was reachable, so each map is laid
 * out from what can be stated safely — the place's approximate lon/lat frame (three decimals, `approximate: true`), the
 * general shape and orientation of the named water, highways and towns, and the land-use character. Everything else
 * (bayou courses, canals, pads, yards, every project layout) is PROCEDURAL and labelled so. Project facts come only from
 * the facts file (`la-facts.md`, the Louisiana wave); no site plan is published for any project, so every layout is the
 * platform's illustration. The platform has no partnership with any company named; the crafts are trade references.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR", "shared");
const R3 = (v) => Math.round(v * 1000) / 1000;

/** One north-up uniform projection per map: lon/lat -> map metres (x east, +z south) at `scale` real metres per map metre. */
function frame(lon0, lat0, scale) {
  const kx = (111320 * Math.cos((lat0 * Math.PI) / 180)) / scale, kz = 110860 / scale;
  return { xz: (lon, lat) => [Math.round((lon - lon0) * kx), Math.round(-(lat - lat0) * kz)], ll: ([x, z]) => [R3(lon0 + x / kx), R3(lat0 - z / kz)] };
}
/** An anchor at a named place's approximate lon/lat, placed through the map's projection. */
const anchorsOf = (f, list) => list.map(([name, lon, lat]) => ({ xz: f.xz(lon, lat), lonlat: [R3(lon), R3(lat)], approximate: true, name }));

const SIGN = "a sign: the project layout is illustrative; the parish, waterways and towns are real";
const HEADER = (title, body) => `// ${title} — a Louisiana development site area on the parish schema (console SITES-COAST, docs/consoles/SITES-COAST.md,
// docs/parishes.md). A stylised 4096 m map, not a survey: real places appear only by their public names as places; every
// coordinate is approximate (three decimals, \`approximate: true\`) and exists only to place the map. One north-up uniform
// scale (x east, +z south). ${body}
// THE PROJECT LAYOUT IS ILLUSTRATIVE; THE PARISH, WATERWAYS AND TOWNS ARE REAL. No site plan is published: every pad, yard,
// building and crew here is the platform's PROCEDURAL illustration. Project facts are only those of the facts file, in its
// words. The platform has no partnership with the company named; crafts are trade references, never an employer's programme.
// Written once by tools/gen_lc_sites.mjs; this module is the source afterwards. Pure data, no imports.
`;

const J = (o) => JSON.stringify(o);
function emit(file, exportName, header, map) {
  const lines = [header, `export const ${exportName} = {`];
  for (const [k, v] of Object.entries(map)) {
    if (Array.isArray(v) && v.length && typeof v[0] === "object") { lines.push(`  ${k}: [`); for (const it of v) lines.push(`    ${J(it)},`); lines.push("  ],"); }
    else lines.push(`  ${k}: ${J(v)},`);
  }
  lines.push("};", "");
  writeFileSync(join(SHARED, file), lines.join("\n"));
  console.log(`wrote ${file}: ${map.sites.length} sites, ${map.water.length} water, ${map.roads.length} roads, ${map.districts.length} districts`);
}
const site = (id, name, kind, position, trades, programmes, stations, blurb, extra = {}) => ({ id, name, kind, position, trades, programmes, stations, blurb, ...extra });
const way = (id, name, parish, from, f, to) => ({ id, kind: "road", name, from: { parish, position: from }, to: { parish: to, position: null, lonlat: f.ll(from) }, lonlat: f.ll(from), approximate: true });

// ------------------------------------------------------------------ Starbase Louisiana, Vermilion Parish (scale 6)
{
  const id = "la-starbase-vermilion", S = 6, f = frame(-92.38, 29.64, S);
  emit("np-data-la-starbase-vermilion.js", "NP_LA_STARBASE_VERMILION", HEADER("Starbase Louisiana, Vermilion Parish",
    "About six real metres per map metre, so the coastal marsh near Pecan Island and Freshwater City fits one field: the Gulf to the\n// south, White Lake's southern shore to the north-west, the Freshwater Bayou Canal, Highway Eighty-Two along the Pecan Island ridge."), {
    id, name: "Starbase Louisiana — Vermilion Parish marsh", region: "louisiana-sites", size: 4096, scale: S,
    blurb: "Vermilion Parish's coastal marsh near Pecan Island and Freshwater City, where Starbase Louisiana is planned (SpaceX; $100 billion; a 125,000-acre site; construction from 2027, first launch targeted 2029, per the sources in the facts file): marsh, bayous and canals, the Gulf shore to the south and Highway Eighty-Two along the ridge. The project layout is illustrative; the parish, waterways and towns are real.",
    project: { name: "Starbase Louisiana", company: "SpaceX", facts: "Vermilion Parish: a 125,000-acre site near Pecan Island and Freshwater City, coastal marsh; $100 billion; 3,000–10,000 permanent jobs expected (60–80% hired locally); construction from 2027, first launch targeted 2029; propellant production, power generation, deepwater shipping access, vehicle processing, an airport; coastal restoration partnering (marsh creation)", sources: ["cnbc.com 2026-08-25", "opportunitylouisiana.gov/spacex", "space.com"], illustrative: true },
    start: "lsb-workforce-trailer",
    anchors: anchorsOf(f, [["Pecan Island", -92.440, 29.650], ["Freshwater City (approximate)", -92.312, 29.680], ["the Freshwater Bayou Canal at the Gulf", -92.305, 29.565], ["White Lake's southern shore", -92.470, 29.722], ["the Gulf shore south of Pecan Island", -92.440, 29.563], ["Highway Eighty-Two east of Pecan Island", -92.360, 29.652], ["the marsh north of the ridge", -92.300, 29.735]]),
    hills: [],
    water: [
      { id: "the-gulf", name: "the Gulf", kind: "gulf", poly: [[-2048, 1380], [-1200, 1350], [-300, 1400], [500, 1370], [1300, 1400], [2048, 1360], [2048, 2048], [-2048, 2048]] },
      { id: "white-lake", name: "White Lake", kind: "lake", poly: [[-2048, -2048], [-520, -2048], [-470, -1760], [-900, -1580], [-1500, -1520], [-2048, -1600]] },
      { id: "freshwater-bayou-canal", name: "the Freshwater Bayou Canal", kind: "canal", width: 26, poly: [[1210, -2048], [1200, -1000], [1215, 0], [1205, 900], [1210, 1440]] },
      { id: "north-marsh", name: "the marsh north of the ridge", kind: "wetland", poly: [[-2048, -1540], [-1500, -1460], [-900, -1520], [-430, -1720], [-400, -2048], [1150, -2048], [1150, -420], [-2048, -400]] },
      { id: "east-marsh", name: "the marsh east of the canal", kind: "wetland", poly: [[1270, -2048], [2048, -2048], [2048, 1320], [1270, 1330]] },
      { id: "south-marsh-west", name: "the marsh behind the Gulf shore, west", kind: "wetland", poly: [[-2048, 20], [-1180, 60], [-1180, 1300], [-2048, 1330]] },
      { id: "south-marsh-shore", name: "the marsh behind the Gulf shore", kind: "wetland", poly: [[-1180, 1190], [1150, 1190], [1150, 1320], [-1180, 1320]] },
      { id: "marsh-bayou-north", name: "a marsh bayou (procedural course)", kind: "bayou", width: 12, poly: [[-1800, -1470], [-1500, -1000], [-1600, -700], [-1300, -430]] },
      { id: "tidal-bayou-east", name: "a tidal bayou east of the canal (procedural course)", kind: "bayou", width: 12, poly: [[1450, -1500], [1700, -800], [1600, 0], [1800, 700], [1700, 1390]] },
      { id: "dock-slip", name: "the dock slip off the canal (procedural)", kind: "canal", width: 30, poly: [[1205, 760], [980, 760]] },
      { id: "marsh-creation-cell", name: "the marsh creation cell (procedural)", kind: "wetland", poly: [[-1900, 400], [-1400, 380], [-1350, 900], [-1900, 950]] },
    ],
    levees: [
      { id: "project-storm-berm", name: "the project's storm berm (procedural)", height: 3, pts: [[-1120, 1150], [-300, 1165], [500, 1160], [1120, 1150]] },
      { id: "cell-containment-dike", name: "the marsh creation cell's containment dike (procedural)", height: 1.6, pts: [[-1930, 370], [-1370, 350], [-1320, 930]] },
    ],
    roads: [
      { id: "highway-82", name: "Highway Eighty-Two", kind: "avenue", pts: [[-2048, -200], [-1000, -190], [0, -170], [500, -200], [800, -420], [940, -900], [990, -1500], [1010, -2048]] },
      { id: "project-access-road", name: "the project access road (procedural)", kind: "avenue", pts: [[-100, -175], [-80, 100], [0, 400], [0, 1050]] },
      { id: "pad-road", name: "the pad road (procedural)", kind: "street", pts: [[-1050, 380], [-500, 380], [0, 400], [600, 420], [1050, 420]] },
      { id: "south-service-road", name: "the south service road (procedural)", kind: "street", pts: [[-1050, 950], [0, 960], [1050, 950]] },
      { id: "west-yard-road", name: "the west yard road (procedural)", kind: "street", pts: [[-1050, 380], [-1060, 960]] },
      { id: "dock-road", name: "the dock road (procedural)", kind: "street", pts: [[1050, 420], [1060, 640]] },
      { id: "marsh-mat-road", name: "the marsh mat road (procedural)", kind: "riverroad", pts: [[-1100, 300], [-1400, 250], [-1700, 150]] },
      { id: "ridge-lane", name: "a ridge lane on Pecan Island (procedural)", kind: "street", pts: [[-1500, -190], [-1480, -330]] },
    ],
    districts: [
      { id: "pecan-island-ridge", name: "the Pecan Island ridge", character: "garden", poly: [[-2048, -390], [1150, -410], [1150, 20], [-2048, 10]] },
      { id: "launch-site", name: "the launch site (illustrative)", character: "industrial", poly: [[-100, 480], [1150, 480], [1150, 1180], [-100, 1180]] },
      { id: "production-area", name: "the propellant and power area (illustrative)", character: "refinery", poly: [[-1150, 450], [-120, 450], [-120, 1180], [-1150, 1180]] },
      { id: "processing-campus", name: "the vehicle processing campus (illustrative)", character: "industrial", poly: [[-1150, 60], [1150, 60], [1150, 440], [-1150, 440]] },
      { id: "north-marsh", name: "the marsh north of the ridge", character: "wetland", poly: [[-2048, -1540], [1150, -2048], [1150, -420], [-2048, -400]] },
      { id: "east-marsh", name: "the marsh east of the canal", character: "wetland", poly: [[1270, -2048], [2048, -2048], [2048, 1330], [1270, 1330]] },
      { id: "west-marsh", name: "the marsh behind the Gulf shore, west", character: "wetland", poly: [[-2048, 20], [-1180, 60], [-1180, 1320], [-2048, 1330]] },
    ],
    sites: [
      site("lsb-workforce-trailer", "Starbase Workforce Trailer", "construction", [-300, -60], ["liuna", "carpenters", "iuoe"], ["job-readiness-edition", "builders-trades", "heavy-equipment-operators"], ["jobsite-orientation-and-osha-10", "hazwoper-site-orientation", "wp-apprenticeship-enrollment-day", "apprenticeship-application-and-test"], "The trailer by the highway where every crew starts: site orientation, the day's hazards and the muster point. A trade reference for the kinds of work the project names; it is not an employer's hiring office."),
      site("lsb-marsh-survey", "Marsh Survey Crew", "survey", [-1600, -900], ["liuna", "afscme"], ["bay-restoration-maritime-underwater", "marine-ecology-and-restoration"], ["marsh-transect-survey", "br-drone-shoreline-survey", "br-water-quality-sonde-calibration-and-deploy", "br-bird-nesting-buffer-and-work-window"], "The survey crew walking a transect across the marsh: the line, the drone flight over open water and the nesting buffers flagged before any machine moves."),
      site("lsb-mat-road-crossing", "Mat Road Crossing", "mat-crossing", [-1250, 180], ["iuoe", "liuna"], ["heavy-equipment-operators", "bay-restoration-maritime-underwater"], ["br-tidal-marsh-grading-amphibious-excavator", "op-equipment-daily-walkaround-and-fluids", "op-loader-truck-loading-and-blind-spots", "spill-boom-deploy"], "Where the access road leaves firm ground on timber mats: mats laid ahead of every move, the walkaround, the spill kit on board and a spotter at the edge."),
      site("lsb-pad-foundation-pour", "Pad Foundation Pour", "construction", [400, 800], ["opcmia", "liuna", "ironworkers"], ["cement-masons-and-plasterers", "builders-trades"], ["concrete-pour", "cm-slab-screed-bull-float-and-trowel", "cm-power-trowel-operation-and-guarding", "steel-erector"], "A large pour on the illustrative pad: the pump boom's swing zone, rebar caps, the washout and the finishers' knee boards."),
      site("lsb-propellant-tank-farm", "Propellant Tank Farm Build", "tank-farm", [-600, 800], ["ibb", "ua", "insulators"], ["insulators-and-boilermakers", "plumbers-and-pipefitters", "hazmat-environmental"], ["ib-hydrostatic-test-and-inspector-witness", "ib-mechanical-insulation-pipe-and-jacketing", "ad-test-stand-exclusion-zone-and-holds", "ad-hazardous-fluid-servicing-with-a-buddy"], "Tanks and piping going up for propellant production (the facts file names it). Cryogenic-safety awareness only: very cold liquids burn skin and push air out of low spaces, so the crew keeps the exclusion zone, the face shield and gloves, and never assumes a line is empty. No process is shown."),
      site("lsb-marsh-creation-dredge", "Marsh Creation Dredge Line", "dredge", [-1500, 650], ["iuoe", "liuna", "ibu"], ["bay-restoration-maritime-underwater", "marine-ecology-and-restoration", "heavy-equipment-operators"], ["dredge-barge", "br-dredge-material-screening-and-disposal-decision", "br-dredge-spoils-dewatering-pad", "br-native-planting-and-erosion-mats"], "The coastal restoration partnering the facts file names (marsh creation): a dredge line filling a contained cell, the pipe walked for leaks, and planting once the mud settles."),
      site("lsb-power-plant-build", "Power Plant Build", "plant", [-850, 550], ["ibew", "ua", "ironworkers"], ["electrical-first-period", "energy-transition", "plumbers-and-pipefitters"], ["electrical", "arc-flash-label-study", "substation-switching", "rigging-loft"], "Power generation for the site (the facts file names it) going in: switchgear set, arc-flash labels checked and lifts planned before the steel goes up."),
      site("lsb-shipping-dock", "Shipping Dock", "port", [1000, 690], ["ila", "iuoe", "liuna"], ["port-operations", "ports-maritime-ecology"], ["dock-crane", "vessel-gangway-and-hatch-cover-safety", "op-pile-driving-rig-and-lead-setup", "mw-workboat-towing-and-line-handling"], "The dock on the slip off the canal, for the deepwater shipping access the facts file names: piles driven, lines handled and the crane's swing kept clear."),
      site("lsb-airport-apron", "Airport Apron", "airport", [-700, 250], ["iam", "twu", "liuna"], ["aviation-maintenance-and-ground", "transit-ramp"], ["airport-ramp", "av-marshalling-and-wingwalker-signals", "av-ground-power-and-static-bonding-before-fuel", "av-pushback-tug-and-towbar-connection"], "The apron of the site's airport (the facts file names one): marshalling signals, ground power and bonding before fuel, and the tug's clear zone."),
      site("lsb-vehicle-processing-hangar", "Vehicle Processing Hangar", "hangar", [500, 250], ["ironworkers", "iam", "uaw"], ["aerospace-defense-and-robotics", "bridge-and-structural", "rigging-lifting"], ["ad-payload-crane-lift-with-a-lift-plan", "rl-critical-lift-plan-and-signalperson", "ad-depot-tool-control-and-fod-walk", "steel-erector"], "A tall hangar for vehicle processing (the facts file names it): the steel going up, the critical lift plan and the tool control that keeps a floor clear of loose parts."),
      site("lsb-site-access-road", "Site Access Road Crew", "construction", [150, 100], ["iuoe", "liuna", "teamsters"], ["heavy-equipment-operators", "builders-trades"], ["op-grader-fine-grade-and-crown", "op-compactor-lift-thickness-and-edge", "haul-route-observation", "op-dozer-slope-work-and-rollover-protection"], "The road that carries every truck in: the grader's crown, thin compacted lifts, and the haul route watched for dust and backing trucks."),
      site("lsb-laydown-yard", "Laydown Yard", "staging", [-400, 600], ["teamsters", "iuoe", "liuna"], ["heavy-equipment-operators", "warehouse-and-logistics-automation"], ["forklift-dock", "op-loader-truck-loading-and-blind-spots", "tdl-lifting-and-ergonomics", "crane-yard"], "Where steel, pipe and mats wait: forklift lanes, blind spots around the loaders and the crane's set-up checked."),
      site("lsb-substation-build", "Substation Build", "substation", [-300, 1000], ["ibew", "iuoe"], ["electrical-first-period", "energy-transition", "wind-and-data-infrastructure"], ["substation-switching", "ws-substation-switching-under-a-permit", "arc-flash-label-study", "line-truck"], "A new substation on the illustrative plant side: switching under a permit, the arc-flash boundary and the line truck's set-up."),
      site("lsb-crane-pad", "Heavy Crane Pad", "construction", [800, 350], ["iuoe", "ironworkers"], ["rigging-lifting", "heavy-equipment-operators"], ["op-crawler-crane-assembly-and-load-chart", "rl-critical-lift-plan-and-signalperson", "crane-yard", "bs-tandem-lift-girder-set"], "The prepared pad for the large crawler crane: assembly by the book, the load chart read, and one signalperson for every critical lift."),
      site("lsb-canal-bank-crew", "Canal Bank Crew", "shoreline", [1120, 100], ["liuna", "iuoe", "ibu"], ["bay-restoration-maritime-underwater", "heavy-equipment-operators"], ["br-levee-inspection-and-seepage", "br-cold-water-immersion-and-mob-recovery", "br-turbidity-curtain-deployment", "br-vhf-and-navigation-in-a-work-zone"], "The crew armouring the bank of the Freshwater Bayou Canal by the site: a throw line ready, the curtain around the work and the radio for passing boats."),
      site("lsb-concrete-batch-plant", "Concrete Batch Plant", "yard", [-850, 1000], ["teamsters", "opcmia", "iuoe"], ["cement-masons-and-plasterers", "heavy-equipment-operators"], ["cm-concrete-saw-cutting-with-water-and-silica-control", "concrete-pour", "op-loader-truck-loading-and-blind-spots", "haul-road-dust"], "The on-site batch plant feeding the pours: silica control, the loader's blind spots and the mixer trucks' route kept apart from people on foot."),
      site("lsb-first-aid-station", "Site First Aid Station", "clinic", [200, -60], ["naemt", "iaff"], ["first-responders", "healthcare-support"], ["psychological-first-aid", "traffic-incident-management", "md-location-shoot-traffic-control-and-heat-hydration"], "The medic's trailer by the gate: heat and hydration checks, the incident scene set up safely and the calm first conversation after a bad day."),
      site("lsb-weather-watch-post", "Weather Watch Post", "monitoring", [-1400, -150], ["afscme", "liuna"], ["situational-awareness", "first-responders"], ["shelter-in-place-drill", "ml-heat-and-cold-stress-on-route", "md-location-shoot-traffic-control-and-heat-hydration"], "The post that calls the day on a coastal marsh: heat stress, storms rolling in off the Gulf, and the shelter-in-place plan every crew rehearses."),
    ],
    landmarks: [
      { id: "lsb-project-sign", name: SIGN, position: [-200, -80], kind: "sign" },
      { id: "pecan-island", name: "Pecan Island", position: f.xz(-92.440, 29.650).map((v, i) => i ? v + 60 : v), kind: "town" },
      { id: "freshwater-city", name: "Freshwater City", position: [1100, -760], kind: "town" },
      { id: "gulf-shore", name: "the Gulf shore", position: [0, 1340], kind: "shore" },
      { id: "white-lake-shore", name: "White Lake's southern shore", position: [-900, -1500], kind: "shore" },
      { id: "freshwater-bayou-canal-bank", name: "the Freshwater Bayou Canal", position: [1150, -300], kind: "canal" },
      { id: "vermilion-marsh", name: "the Vermilion Parish marsh", position: [-300, -1100], kind: "marsh" },
    ],
    connectors: [
      way("lc-sb-highway-82-west", "Highway Eighty-Two west toward Grand Chenier", id, [-2040, -200], f, "cameron-grand-chenier"),
      way("lc-sb-highway-82-north", "Highway Eighty-Two north-east toward Abbeville", id, [1010, -2040], f, "vermilion-abbeville"),
    ],
    fieldLessons: [
      { id: "lsb-fl-marsh-speed-bump", title: "A Marsh Slows the Storm", site: "lsb-marsh-creation-dredge", landmark: "gulf-shore", k12: "k12-by-wetlands-as-a-storms-speed-bump", station: "br-native-planting-and-erosion-mats", trade: "Marsh restoration crews", tradeLine: "A restoration crew builds new marsh, because grass and mud take the push out of storm water before it reaches the land.", minutes: 3, steps: ["Look from the dike across the new marsh cell toward the Gulf.", "A wave loses its push as it rolls through grass and shallow mud.", "The crew fills the cell with dredged mud and plants it so the marsh keeps growing."], check: { q: "Why does a crew build marsh along a coast?", options: ["Grass and mud slow storm water before it reaches the land", "Marsh makes the water deeper for ships", "It keeps birds away from the site"], answer: 0, why: "A marsh acts like a speed bump for storm water: plants and shallow mud take away the waves' push." } },
      { id: "lsb-fl-tide-and-mats", title: "Mats on Soft Ground", site: "lsb-mat-road-crossing", k12: "k12-simple-machines-at-a-crane", station: "br-tidal-marsh-grading-amphibious-excavator", trade: "Operating engineers", tradeLine: "An operator lays mats ahead of the machine, because a mat spreads the weight so the marsh can hold it.", minutes: 3, steps: ["Press a finger into soft mud, then press a flat board on it.", "The board spreads the push over more mud, so it sinks less.", "The crew lays timber mats ahead of every move for the same reason."], check: { q: "Why do crews lay mats on the marsh before driving on it?", options: ["The mat spreads the weight so the ground holds", "Mats make the machine go faster", "Mats keep the machine clean"], answer: 0, why: "Spreading a load over a larger area lowers the push on each bit of ground, so soft ground can carry it." } },
      { id: "lsb-fl-tide-graph", title: "Reading the Tide", site: "lsb-canal-bank-crew", landmark: "freshwater-bayou-canal-bank", k12: "k12-graphing-tide-readings-at-the-pier", station: "br-vhf-and-navigation-in-a-work-zone", trade: "Canal bank crews", tradeLine: "A bank crew checks the tide before work, because the water line on the canal moves through the day.", minutes: 3, steps: ["Look at the marks on the canal bank where the water has been.", "Mark the water level each hour and the marks make a wave-shaped graph.", "The crew plans bank work for the low water and keeps a throw line ready."], check: { q: "Why does a canal bank crew check the tide first?", options: ["The water line moves, so work is planned for low water", "The tide tells the time", "To see the boats"], answer: 0, why: "Knowing when the water will rise lets the crew work the bank safely and move before it comes back." } },
    ],
    gated: [
      { id: "lsb-gated-first-pour", kind: "side-quest", title: "The First Pad Pour", world: "parishes", parish: id, site: "lsb-pad-foundation-pour", siteName: "Pad Foundation Pour", summary: "Help the finishing crew through a large pour on the illustrative pad.", gate: { stations: ["concrete-pour", "cm-power-trowel-operation-and-guarding"], note: "Finish the concrete pour and power trowel stations before the pour" } },
      { id: "lsb-gated-marsh-cell", kind: "side-quest", title: "Filling the Marsh Cell", world: "parishes", parish: id, site: "lsb-marsh-creation-dredge", siteName: "Marsh Creation Dredge Line", summary: "Walk the dredge line as it fills the marsh creation cell.", gate: { stations: ["dredge-barge", "br-dredge-spoils-dewatering-pad"], note: "Walk the dredge barge and dewatering pad stations first" } },
    ],
  });
}

// ------------------------------------------------------------------ Black Bayou Energy Hub, Cameron Parish (scale 3)
{
  const id = "la-black-bayou-cameron", S = 3, f = frame(-93.60, 30.03, S);
  emit("np-data-la-black-bayou-cameron.js", "NP_LA_BLACK_BAYOU_CAMERON", HEADER("Black Bayou Energy Hub, Cameron Parish",
    "About three real metres per map metre: Cameron Parish marsh around the Black Bayou salt dome, Black Bayou itself, the Gulf\n// Intracoastal Waterway across the field (its course approximate) and the marsh either side."), {
    id, name: "Black Bayou Energy Hub — Cameron Parish marsh", region: "louisiana-sites", size: 4096, scale: S,
    blurb: "Cameron Parish marsh around the Black Bayou salt dome, where the Black Bayou Energy Hub is planned ($1.6 billion; natural gas storage, blending and transport; 1,000+ construction jobs at peak; operations late 2028, per the sources in the facts file): wellpads on board roads, a compressor station, a pipeline spread across the marsh, and the Gulf Intracoastal Waterway. The project layout is illustrative; the parish, waterways and towns are real.",
    project: { name: "Black Bayou Energy Hub", facts: "Cameron Parish (Black Bayou salt dome) and a Lafayette headquarters; $1.6 billion; 58 new jobs; 1,000+ construction jobs at peak; natural gas storage, blending and transport; operations late 2028", sources: ["opportunitylouisiana.gov news", "americanpress.com 2026-09-11"], illustrative: true },
    start: "lbb-workforce-trailer",
    anchors: anchorsOf(f, [["the Black Bayou salt dome (approximate)", -93.600, 30.030], ["Black Bayou, north", -93.615, 30.075], ["Black Bayou, south", -93.585, 29.985], ["the Gulf Intracoastal Waterway, west", -93.655, 30.052], ["the Gulf Intracoastal Waterway, east", -93.545, 30.050], ["Cameron Parish marsh, south-west", -93.650, 29.985], ["Cameron Parish marsh, north-east", -93.550, 30.080]]),
    hills: [],
    water: [
      { id: "black-bayou", name: "Black Bayou", kind: "bayou", width: 22, poly: [[-500, -2048], [-560, -1400], [-380, -900], [-520, -500], [-700, 0], [-520, 600], [-300, 1100], [-100, 1600], [500, 2048]] },
      { id: "gulf-intracoastal-waterway", name: "the Gulf Intracoastal Waterway", kind: "canal", width: 40, poly: [[-2048, -810], [-1000, -790], [0, -760], [1000, -730], [2048, -720]] },
      { id: "marsh-north", name: "the marsh north of the waterway", kind: "wetland", poly: [[-2048, -2048], [2048, -2048], [2048, -1500], [-2048, -1500]] },
      { id: "marsh-south-west", name: "the marsh south-west of the dome", kind: "wetland", poly: [[-2048, 700], [-900, 700], [-900, 2048], [-2048, 2048]] },
      { id: "marsh-south-east", name: "the marsh south-east of the dome", kind: "wetland", poly: [[900, 900], [2048, 900], [2048, 2048], [900, 2048]] },
      { id: "brine-pond", name: "the brine pond (procedural)", kind: "lake", poly: [[1150, -250], [1450, -250], [1450, 0], [1150, 0]] },
      { id: "marsh-pond", name: "a marsh pond (procedural)", kind: "lake", poly: [[-1700, 1300], [-1300, 1250], [-1250, 1600], [-1650, 1650]] },
      { id: "pipeline-canal", name: "an old pipeline canal (procedural)", kind: "canal", width: 14, poly: [[200, 400], [900, 600], [1600, 800], [2048, 900]] },
    ],
    levees: [
      { id: "wellpad-ring-levee", name: "the wellpad ring levee (procedural)", height: 2.4, pts: [[-300, -300], [300, -300], [300, 300], [-300, 300], [-300, -300]] },
      { id: "compressor-berm", name: "the compressor station berm (procedural)", height: 2, pts: [[500, -500], [1000, -500], [1000, -150]] },
    ],
    roads: [
      { id: "parish-road-north", name: "the parish road north toward Vinton (procedural course)", kind: "avenue", pts: [[150, -2048], [160, -1200], [140, -800], [120, -350]] },
      { id: "board-road-west", name: "the marsh board road west (procedural)", kind: "riverroad", pts: [[-300, 0], [-900, 50], [-1500, 200], [-1900, 400]] },
      { id: "board-road-south", name: "the marsh board road south (procedural)", kind: "riverroad", pts: [[0, 320], [100, 900], [300, 1500]] },
      { id: "station-road", name: "the station road (procedural)", kind: "street", pts: [[140, -350], [700, -380], [1200, -400], [1700, -380]] },
      { id: "pipeline-right-of-way", name: "the pipeline right-of-way (procedural)", kind: "riverroad", pts: [[-2048, -1100], [-1000, -1080], [0, -1050], [1000, -1030], [2048, -1000]] },
      { id: "dock-lane", name: "the dock lane (procedural)", kind: "street", pts: [[160, -1200], [700, -950]] },
    ],
    districts: [
      { id: "dome-pad", name: "the salt dome pads (illustrative)", character: "refinery", poly: [[-400, -500], [450, -500], [450, 450], [-400, 450]] },
      { id: "station-yard", name: "the compressor and blending yard (illustrative)", character: "refinery", poly: [[450, -700], [1800, -700], [1800, 200], [450, 200]] },
      { id: "north-bank", name: "the waterway's north bank", character: "industrial", poly: [[-800, -1450], [900, -1450], [900, -850], [-800, -850]] },
      { id: "marsh-north", name: "the marsh north of the waterway", character: "wetland", poly: [[-2048, -2048], [2048, -2048], [2048, -1500], [-2048, -1500]] },
      { id: "marsh-south-west", name: "the marsh south-west of the dome", character: "wetland", poly: [[-2048, 700], [-900, 700], [-900, 2048], [-2048, 2048]] },
      { id: "marsh-south-east", name: "the marsh south-east of the dome", character: "wetland", poly: [[900, 900], [2048, 900], [2048, 2048], [900, 2048]] },
      { id: "cheniere-pasture", name: "the pasture ridges (procedural)", character: "garden", poly: [[-2048, -700], [-800, -700], [-800, 650], [-2048, 650]] },
    ],
    sites: [
      site("lbb-workforce-trailer", "Black Bayou Workforce Trailer", "construction", [300, -1250], ["liuna", "ua", "iuoe"], ["job-readiness-edition", "plumbers-and-pipefitters", "heavy-equipment-operators"], ["jobsite-orientation-and-osha-10", "hazwoper-site-orientation", "wp-apprenticeship-enrollment-day"], "The trailer where every crew starts: site orientation, the gas hazards named, the muster point and the wind sock. A trade reference for the kinds of work the project names, not an employer's hiring office."),
      site("lbb-salt-dome-wellpad", "Salt Dome Wellpad", "wellpad", [0, 0], ["iuoe", "ua", "usw"], ["water-and-gas-utility-crews", "confined-space", "hazmat-environmental"], ["gas-leak-survey", "pl-natural-gas-pressure-test-and-leak-check", "valve-vault", "manhole-entry-and-atmospheric-monitoring"], "A wellpad over the salt dome for gas storage (the facts file names storage): the gas monitor on every belt, isolation before work, and nobody in a low space until the air is tested."),
      site("lbb-compressor-station", "Compressor Station", "compressor", [750, -300], ["ua", "ibew", "iam"], ["plumbers-and-pipefitters", "stationary-engineer", "electrical-first-period"], ["us-treatment-plant-process-pump-lockout", "boiler-room", "arc-flash-label-study", "pl-natural-gas-pressure-test-and-leak-check"], "The compressor building for moving gas in and out of storage: lockout on every machine, hearing protection, and the arc-flash label read before a panel is opened."),
      site("lbb-pipeline-spread", "Pipeline Spread", "pipeline", [-1200, -1150], ["ua", "iuoe", "liuna", "teamsters"], ["plumbers-and-pipefitters", "heavy-equipment-operators", "water-and-gas-utility-crews"], ["welding", "op-excavator-trench-and-utility-locate", "trench-box", "ut-cathodic-protection-test-station-reading"], "A pipeline spread working along the right-of-way for gas transport (the facts file names it): welders under a hot-work permit, the ditch shored or sloped, and the locate marks honoured."),
      site("lbb-marsh-board-road", "Marsh Board Road", "mat-crossing", [-1300, 250], ["iuoe", "liuna"], ["heavy-equipment-operators", "bay-restoration-maritime-underwater"], ["br-tidal-marsh-grading-amphibious-excavator", "op-equipment-daily-walkaround-and-fluids", "spill-boom-deploy"], "The board road across the marsh to the western pads: boards laid ahead, one machine on a span at a time, and the spill boom staged at the edge."),
      site("lbb-blending-skid", "Gas Blending Skid", "industrial", [1300, -550], ["ua", "ibew", "insulators"], ["plumbers-and-pipefitters", "insulators-and-boilermakers"], ["ib-hydrostatic-test-and-inspector-witness", "ib-mechanical-insulation-pipe-and-jacketing", "pl-natural-gas-pressure-test-and-leak-check"], "The skid for gas blending (the facts file names it) being piped and tested: hydrotest with the inspector, insulation jacketed, and leak checks before gas is let in. No process is shown."),
      site("lbb-metering-station", "Metering Station", "utility", [1650, -150], ["ua", "uwua"], ["water-and-gas-utility-crews"], ["ut-gas-meter-set-and-regulator-vent", "gas-leak-survey", "valve-vault"], "A metering station where gas leaves for transport: meters set, regulators vented away from people, and the leak survey walked."),
      site("lbb-hdd-crossing", "Directional Drill Crossing", "pipeline", [-600, -1250], ["iuoe", "liuna", "ua"], ["heavy-equipment-operators", "water-and-gas-utility-crews"], ["op-excavator-trench-and-utility-locate", "ut-service-line-locate-and-hand-dig-near-gas-main", "spill-boom-deploy"], "The drill rig pulling pipe under the waterway: locates first, hand-digging near live lines, and a spill boom ready at the entry pit."),
      site("lbb-brine-pond", "Brine Pond Crew", "utility", [1300, 150], ["liuna", "iuoe"], ["hazmat-environmental", "heavy-equipment-operators"], ["hazwoper-site-orientation", "sampling-well", "op-dozer-slope-work-and-rollover-protection"], "The crew at the procedural brine pond: the liner's edge kept clear, sampling points logged and the dozer kept off the slope's soft lip."),
      site("lbb-laydown-yard", "Pipe Laydown Yard", "staging", [-400, -1100], ["teamsters", "iuoe"], ["heavy-equipment-operators", "warehouse-and-logistics-automation"], ["forklift-dock", "crane-yard", "op-loader-truck-loading-and-blind-spots"], "Where pipe joints are racked and chocked: the side-boom and the forklift lanes kept apart from people on foot."),
      site("lbb-control-building", "Control Building", "plant", [650, 100], ["ibew", "ua"], ["electrical-first-period", "stationary-engineer"], ["electrical", "arc-flash-label-study", "se-building-automation-alarm-triage"], "The control building being wired and commissioned: panels energised in order, alarms tested, and every loop checked against the drawing."),
      site("lbb-barge-landing", "Barge Landing", "landing", [800, -900], ["ila", "ibu", "iuoe"], ["port-operations", "ports-maritime-ecology"], ["mw-workboat-towing-and-line-handling", "vessel-gangway-and-hatch-cover-safety", "dock-crane"], "The landing on the waterway where heavy equipment arrives by barge: lines handled, the gangway rigged and the crane's swing kept clear."),
      site("lbb-hydrotest-station", "Hydrotest Station", "pipeline", [-1000, -300], ["ua", "ibb"], ["plumbers-and-pipefitters", "insulators-and-boilermakers"], ["ib-hydrostatic-test-and-inspector-witness", "pl-hydronic-boiler-piping-and-hydrotest", "pl-natural-gas-pressure-test-and-leak-check"], "A test header on a finished pipeline section: the exclusion zone held while it is under pressure, and the inspector witnessing every step."),
      site("lbb-substation-build", "Substation Build", "substation", [1650, 250], ["ibew", "iuoe"], ["electrical-first-period", "energy-transition"], ["substation-switching", "ws-substation-switching-under-a-permit", "line-truck"], "A small substation to power the compressors: switching under a permit and the line truck set up clear of the overhead."),
      site("lbb-marsh-restoration-crew", "Marsh Restoration Crew", "wetland", [-1500, 1000], ["liuna", "afscme"], ["bay-restoration-maritime-underwater", "marine-ecology-and-restoration"], ["br-native-planting-and-erosion-mats", "marsh-transect-survey", "br-bird-nesting-buffer-and-work-window"], "A crew restoring marsh disturbed by construction: planting, the transect that shows it working and the nesting buffers honoured."),
      site("lbb-fire-water-station", "Fire Water Station", "fire", [400, 600], ["iaff", "ua"], ["first-responders", "plumbers-and-pipefitters"], ["aerial-ladder", "ut-hydrant-flow-test-and-flushing-with-traffic-control", "shelter-in-place-drill"], "The fire water pumps and hydrant loop for the site: flow tested, the response plan rehearsed and the shelter-in-place drill run with every crew."),
      site("lbb-weather-shelter", "Storm and Heat Shelter", "monitoring", [-150, 950], ["afscme", "liuna"], ["situational-awareness", "first-responders"], ["ml-heat-and-cold-stress-on-route", "shelter-in-place-drill", "md-location-shoot-traffic-control-and-heat-hydration"], "The hardened shelter where crews go when storms come in off the Gulf, with water, shade and the heat-stress plan on the wall."),
    ],
    landmarks: [
      { id: "lbb-project-sign", name: SIGN, position: [250, -1350], kind: "sign" },
      { id: "black-bayou-bank", name: "Black Bayou", position: [-620, 300], kind: "canal" },
      { id: "salt-dome", name: "the Black Bayou salt dome (approximate)", position: [0, 180], kind: "marsh" },
      { id: "intracoastal-bank", name: "the Gulf Intracoastal Waterway", position: [0, -840], kind: "canal" },
      { id: "cameron-marsh", name: "the Cameron Parish marsh", position: [-1500, 1500], kind: "marsh" },
      { id: "cameron-marsh-north", name: "the marsh north of the waterway", position: [800, -1800], kind: "marsh" },
    ],
    connectors: [
      way("lc-bb-parish-road-north", "The parish road north toward Vinton", id, [150, -2040], f, "cameron-parish-north"),
      way("lc-bb-board-road-south", "The marsh board road south toward the coast", id, [300, 1500], f, "cameron-parish-coast"),
    ],
    fieldLessons: [
      { id: "lbb-fl-marsh-speed-bump", title: "Why the Marsh Matters Here", site: "lbb-marsh-restoration-crew", landmark: "cameron-marsh", k12: "k12-by-wetlands-as-a-storms-speed-bump", station: "br-native-planting-and-erosion-mats", trade: "Marsh restoration crews", tradeLine: "A restoration crew replants marsh a project disturbed, because the marsh protects the land behind it.", minutes: 3, steps: ["Look across the marsh from the board road.", "Storm water slows as it pushes through grass and shallow mud.", "The crew replants what construction crossed, so the marsh keeps doing its job."], check: { q: "Why does a crew replant marsh after a pipeline crosses it?", options: ["So the marsh keeps slowing storm water", "To hide the pipeline", "Because grass makes gas flow faster"], answer: 0, why: "Marsh grass and mud act as a buffer that takes the push out of storm water." } },
      { id: "lbb-fl-gas-monitor", title: "Air You Cannot See", site: "lbb-salt-dome-wellpad", k12: "k12-es-clean-air-at-the-port", station: "gas-leak-survey", trade: "Gas storage crews", tradeLine: "A crew wears a gas monitor, because some gases have no colour and a meter tells you before you can tell.", minutes: 3, steps: ["Look at the wellpad: pipes and valves, nothing you can see in the air.", "Some gases have no colour or smell, so people use a meter to check.", "The crew clips a monitor on and leaves when it alarms."], check: { q: "Why does a wellpad crew wear gas monitors?", options: ["Some gases cannot be seen or smelled, so a meter warns first", "To measure the weather", "To count the pipes"], answer: 0, why: "A monitor warns the wearer about gas they cannot see, so they can leave early." } },
      { id: "lbb-fl-simple-machines", title: "Lifting Pipe on the Marsh", site: "lbb-laydown-yard", k12: "k12-simple-machines-at-a-crane", station: "crane-yard", trade: "Crane operators and riggers", tradeLine: "A crane crew plans every lift, because a long boom and pulleys trade distance for force and the ground must hold it.", minutes: 3, steps: ["Watch the crane lift a pipe joint off the rack.", "The rope runs over pulleys, so a long pull lifts a heavy load a short way.", "The crew sets the crane on mats and keeps everyone out from under the load."], check: { q: "Why does a crane crew keep people out from under a load?", options: ["A load can swing or drop, so nobody stands beneath it", "To make room for the pipe", "Because the operator likes space"], answer: 0, why: "Nobody stands under a suspended load: if it swings or slips, the space below must be empty." } },
    ],
    gated: [
      { id: "lbb-gated-first-weld", kind: "side-quest", title: "The Tie-In Weld", world: "parishes", parish: id, site: "lbb-pipeline-spread", siteName: "Pipeline Spread", summary: "Help the pipeline spread make a tie-in weld on the right-of-way.", gate: { stations: ["welding", "trench-box"], note: "Finish the welding and trench box stations before the tie-in" } },
      { id: "lbb-gated-wellpad-lockout", kind: "side-quest", title: "Wellpad Lockout", world: "parishes", parish: id, site: "lbb-salt-dome-wellpad", siteName: "Salt Dome Wellpad", summary: "Help the wellpad crew isolate a valve before maintenance.", gate: { stations: ["gas-leak-survey", "valve-vault"], note: "Walk the gas leak survey and valve vault stations first" } },
    ],
  });
}

// ------------------------------------------------------------------ Saronic Franklin Shipyard, St. Mary Parish (scale 1.5)
{
  const id = "la-saronic-franklin", S = 1.5, f = frame(-91.505, 29.790, S);
  emit("np-data-la-saronic-franklin.js", "NP_LA_SARONIC_FRANKLIN", HEADER("Saronic's Franklin Shipyard, St. Mary Parish",
    "About one and a half real metres per map metre: Franklin on Bayou Teche (the bayou's course through town approximate), the\n// town's historic streets along the bayou, the US Highway Ninety corridor to the north and cane fields around."), {
    id, name: "Franklin Shipyard — Franklin on Bayou Teche", region: "louisiana-sites", size: 4096, scale: S,
    blurb: "Franklin in St. Mary Parish on Bayou Teche, where Saronic Technologies' Franklin Shipyard is planned ($300 million; autonomous marine vessels; 300,000+ sq ft, three new slips, a large-vessel line; operations 2027, per the sources in the facts file): the bayou, the town's streets and the cane fields, with slips, a hull shop and a paint hall on the bank. The project layout is illustrative; the parish, waterways and towns are real.",
    project: { name: "Saronic Technologies Franklin Shipyard", company: "Saronic Technologies", facts: "Franklin, St. Mary Parish (Bayou Region); $300 million; 1,500 direct new jobs; 1,770 indirect (3,270 total including indirect); autonomous marine vessels; 300,000+ sq ft, three new slips, large-vessel line; operations 2027", sources: ["opportunitylouisiana.gov news", "breakingdefense.com 2025-12"], illustrative: true },
    start: "lsf-workforce-centre",
    anchors: anchorsOf(f, [["Franklin, the town centre", -91.502, 29.796], ["Bayou Teche upstream of Franklin", -91.534, 29.808], ["Bayou Teche downstream of Franklin", -91.476, 29.773], ["US Highway Ninety north of Franklin", -91.500, 29.814], ["cane fields south of the bayou", -91.520, 29.770], ["the east side of Franklin", -91.480, 29.800]]),
    hills: [],
    water: [
      { id: "bayou-teche", name: "Bayou Teche", kind: "bayou", width: 34, poly: [[-2048, -1000], [-1500, -900], [-1000, -650], [-600, -500], [-200, -300], [200, -150], [600, 50], [1000, 300], [1400, 600], [1800, 1100], [2048, 1250]] },
      { id: "drainage-canal", name: "a drainage canal (procedural)", kind: "canal", width: 10, poly: [[-1600, 2048], [-1500, 1200], [-1300, 400], [-1150, -700]] },
      { id: "slip-basin", name: "the new slips' basin (procedural)", kind: "canal", width: 40, poly: [[760, 150], [700, 520]] },
      { id: "cane-ditch-east", name: "a cane field ditch (procedural)", kind: "canal", width: 6, poly: [[1300, 2048], [1250, 1300], [1300, 800]] },
    ],
    levees: [
      { id: "teche-bank-north", name: "the bayou's north bank (procedural)", height: 1.5, pts: [[-1500, -960], [-1000, -710], [-600, -560], [-200, -360]] },
      { id: "shipyard-bank", name: "the shipyard's bayou bank (procedural)", height: 1.8, pts: [[-150, -200], [300, -40], [650, 110]] },
    ],
    roads: [
      { id: "us-highway-90", name: "US Highway Ninety", kind: "interstate", pts: [[-2048, -1500], [-1000, -1400], [0, -1760], [1000, -1650], [2048, -1250]] },
      { id: "main-street", name: "Main Street", kind: "avenue", pts: [[-2048, -1150], [-1500, -1060], [-1000, -800], [-600, -650], [-200, -450], [200, -300], [600, -110], [1000, 150], [1400, 420], [2048, 1000]] },
      { id: "town-cross-street", name: "a cross street to the highway (procedural)", kind: "street", pts: [[-400, -560], [-420, -1100], [-400, -1720]] },
      { id: "east-cross-street", name: "an east side street (procedural)", kind: "street", pts: [[400, -210], [450, -900], [500, -1700]] },
      { id: "shipyard-road", name: "the shipyard road (procedural)", kind: "avenue", pts: [[-300, 700], [300, 750], [900, 800], [1500, 900]] },
      { id: "bayou-bridge", name: "the shipyard's bayou bridge (procedural)", kind: "bridge", pts: [[-320, -440], [-300, -120]] },
      { id: "shipyard-spine", name: "the shipyard spine road (procedural)", kind: "street", pts: [[-300, -120], [-300, 700]] },
      { id: "cane-road", name: "a cane field road (procedural)", kind: "street", pts: [[-300, 700], [-800, 1300], [-1000, 2048]] },
    ],
    districts: [
      { id: "franklin-historic", name: "Franklin's historic streets", character: "quarter", poly: [[-1500, -1400], [300, -1400], [300, -550], [-200, -420], [-1000, -760], [-1500, -1000]] },
      { id: "franklin-east", name: "Franklin's east side", character: "suburb", poly: [[300, -1500], [2048, -1150], [2048, 950], [1400, 380], [300, -250]] },
      { id: "franklin-north", name: "the highway corridor", character: "suburb", poly: [[-2048, -2048], [2048, -2048], [2048, -1400], [-2048, -1350]] },
      { id: "shipyard", name: "the shipyard (illustrative)", character: "port", poly: [[-600, -200], [1350, 560], [1500, 1150], [-600, 1150]] },
      { id: "cane-west", name: "cane fields west of the bayou", character: "garden", poly: [[-2048, -950], [-1200, -700], [-700, 0], [-700, 2048], [-2048, 2048]] },
      { id: "cane-south", name: "cane fields south of the shipyard", character: "garden", poly: [[-600, 1200], [2048, 1200], [2048, 2048], [-600, 2048]] },
    ],
    sites: [
      site("lsf-workforce-centre", "Franklin Shipyard Workforce Centre", "school", [-700, -1000], ["ibb", "ironworkers", "iupat"], ["job-readiness-edition", "insulators-and-boilermakers", "port-operations"], ["jobsite-orientation-and-osha-10", "wp-apprenticeship-enrollment-day", "apprenticeship-standards-reading", "apprenticeship-application-and-test"], "A training room in town for the kinds of shipyard work the project names: orientation, the trades' apprenticeship standards and a first look at the yard's hazards. A trade reference, not an employer's hiring office."),
      site("lsf-new-slip-build", "New Slip Build", "slip", [900, 450], ["iuoe", "liuna", "carpenters"], ["heavy-equipment-operators", "builders-trades", "bridge-and-structural"], ["op-pile-driving-rig-and-lead-setup", "concrete-pour", "trench-box", "br-turbidity-curtain-deployment"], "One of the three new slips the facts file names, being built on the bank: piles driven from the lead, forms poured and the curtain around the in-water work."),
      site("lsf-hull-fabrication", "Hull Fabrication Hall", "shipyard", [250, 350], ["ibb", "ironworkers", "usw"], ["insulators-and-boilermakers", "bridge-and-structural"], ["shipyard-hotwork", "welding", "ib-pressure-vessel-confined-entry-and-hot-work", "rl-critical-lift-plan-and-signalperson"], "Hull blocks welded under a hot-work permit: the fire watch posted, fumes pulled away, and nobody inside a tank until the air is tested."),
      site("lsf-marine-electrical", "Marine Electrical Shop", "workshop", [0, 850], ["ibew", "iuec"], ["electrical-first-period", "yacht-and-charter-crew"], ["electrical", "yc-shore-power-connection-and-in-water-electrical-safety", "arc-flash-label-study"], "Wiring vessels for autonomous operation (the facts file names autonomous marine vessels): circuits dead before touch, shore power connected safely, the arc-flash label read."),
      site("lsf-launch-and-test", "Launch and Test Berth", "port", [1250, 700], ["ibu", "ila", "iuoe"], ["port-operations", "yacht-and-charter-crew"], ["mw-workboat-towing-and-line-handling", "yc-man-overboard-recovery-drill", "br-vhf-and-navigation-in-a-work-zone", "br-cold-water-immersion-and-mob-recovery"], "Where a finished vessel goes into Bayou Teche for testing: lines handled, a float coat on anyone at the edge and the radio used for traffic on the bayou."),
      site("lsf-blast-and-paint", "Blast and Paint Hall", "paint-shop", [-350, 1000], ["iupat", "liuna"], ["hazmat-environmental", "bridge-and-structural"], ["bridge-blast", "paint-sprayer", "tank-lining", "ib-spray-foam-and-respirator-fit"], "Hulls blasted and coated inside an enclosed hall: supplied-air hoods, the respirator fit test and the containment that keeps grit and overspray in."),
      site("lsf-large-vessel-line", "Large-Vessel Line", "shipyard", [600, 950], ["ibb", "ironworkers", "iuoe"], ["insulators-and-boilermakers", "rigging-lifting"], ["op-crawler-crane-assembly-and-load-chart", "bs-tandem-lift-girder-set", "shipyard-hotwork", "leading-edge-and-horizontal-lifeline"], "The large-vessel line the facts file names: blocks lifted in tandem to the load chart, and a lifeline for anyone working at a hull's edge."),
      site("lsf-steel-receiving-yard", "Steel Receiving Yard", "staging", [-100, 200], ["teamsters", "iuoe", "ironworkers"], ["warehouse-and-logistics-automation", "rigging-lifting"], ["forklift-dock", "crane-yard", "tdl-lifting-and-ergonomics"], "Plate and shapes arrive by truck: the forklift lanes, the crane's set-up and the tag lines on every lift."),
      site("lsf-plate-cutting-shop", "Plate Cutting Shop", "workshop", [150, -80], ["ibb", "smart"], ["insulators-and-boilermakers"], ["sm-plasma-table-and-fume", "sm-shop-layout-and-shear", "welding"], "The plasma table cutting hull plate: fume extraction on, guards in place and layout checked before the shear."),
      site("lsf-outfitting-pier", "Outfitting Pier", "landing", [1550, 1000], ["ua", "ibew", "ibb"], ["plumbers-and-pipefitters", "electrical-first-period"], ["vessel-gangway-and-hatch-cover-safety", "confined-rescue", "electrical"], "Vessels alongside for outfitting: the gangway rigged, a rescue plan for every tank entry and the power cables kept off the walkway."),
      site("lsf-crane-rail", "Yard Crane Rail", "construction", [450, 650], ["ironworkers", "iuoe"], ["bridge-and-structural", "rigging-lifting"], ["steel-erector", "dock-crane", "rl-critical-lift-plan-and-signalperson"], "The rail for the yard's gantry crane being set: steel erected, the rail aligned and one signalperson on every lift."),
      site("lsf-bulkhead-piling", "Bulkhead Piling", "shoreline", [-200, -40], ["iuoe", "carpenters", "liuna"], ["heavy-equipment-operators", "bridge-and-structural"], ["op-pile-driving-rig-and-lead-setup", "gg-pile-driver-fender-repair", "br-cold-water-immersion-and-mob-recovery"], "Sheet pile going in along the bayou bank: the lead set plumb, the hammer's zone kept clear and a throw ring at the edge."),
      site("lsf-tool-crib", "Tool Crib", "warehouse", [-500, 450], ["iam", "ibb"], ["aerospace-defense-and-robotics", "insulators-and-boilermakers"], ["av-borescope-and-tool-control-inventory", "ad-depot-tool-control-and-fod-walk"], "Tools signed out and back: shadow boards, the inventory at shift end and nothing left inside a hull."),
      site("lsf-first-aid-station", "Shipyard First Aid Station", "clinic", [-550, 150], ["naemt", "iaff"], ["first-responders"], ["psychological-first-aid", "confined-rescue", "md-location-shoot-traffic-control-and-heat-hydration"], "The yard's medic: heat and hydration in the halls, the confined-space rescue team's kit and the first calm conversation after an incident."),
      site("lsf-machine-shop", "Machine Shop", "workshop", [-200, 600], ["iam", "usw"], ["aerospace-defense-and-robotics"], ["ad-robot-cell-lockout-and-safe-reentry", "ad-cobot-risk-assessment-and-speed-separation", "sm-shop-layout-and-shear"], "The shop turning shafts and fittings: machine guards on, lockout before reaching in, and the robot cell's gate respected."),
      site("lsf-site-utilities", "Site Utilities Crew", "utility", [1100, 1150], ["liuna", "ua", "ibew"], ["water-and-gas-utility-crews", "plumbers-and-pipefitters"], ["op-excavator-trench-and-utility-locate", "trench-box", "ut-pe-pipe-fusion-and-squeeze-off"], "Water, power and drainage run to the new halls: locates first, the trench shored and pipe fused on the bank."),
      site("lsf-security-gate", "Shipyard Gate", "civic", [-800, 700], ["seiu", "teamsters"], ["situational-awareness", "warehouse-and-logistics-automation"], ["haul-route-observation", "traffic-incident-management", "forklift-dock"], "The gate where trucks and people come in: separate lanes, the visitors' briefing and eyes on the haul route."),
    ],
    landmarks: [
      { id: "lsf-project-sign", name: SIGN, position: [-450, -300], kind: "sign" },
      { id: "franklin-town", name: "Franklin", position: f.xz(-91.502, 29.796).map((v, i) => i ? v - 300 : v), kind: "town" },
      { id: "bayou-teche-bank", name: "Bayou Teche", position: [-600, -420], kind: "canal" },
      { id: "main-street-place", name: "Main Street, Franklin", position: [-900, -900], kind: "street" },
      { id: "cane-fields", name: "the cane fields", position: [-1500, 600], kind: "field" },
      { id: "highway-90-corridor", name: "US Highway Ninety", position: [500, -1850], kind: "road" },
    ],
    connectors: [
      way("lc-sf-highway-90-west", "US Highway Ninety west toward Baldwin", id, [-2040, -1500], f, "st-mary-baldwin"),
      way("lc-sf-highway-90-east", "US Highway Ninety east toward Centerville", id, [2040, -1250], f, "st-mary-centerville"),
    ],
    fieldLessons: [
      { id: "lsf-fl-simple-machines", title: "Lifting a Hull Block", site: "lsf-large-vessel-line", k12: "k12-simple-machines-at-a-crane", station: "rl-critical-lift-plan-and-signalperson", trade: "Riggers and crane operators", tradeLine: "A rigging crew plans every big lift, because pulleys and a long boom trade distance for force.", minutes: 3, steps: ["Watch the crane lift a steel block onto the line.", "The rope runs over pulleys, so the drum pulls a long way to lift a heavy load a short way.", "One signalperson guides the operator so everyone knows who is in charge of the lift."], check: { q: "Why does one signalperson guide a big crane lift?", options: ["So the operator gets one clear set of signals", "Because signals are fun", "So the crane goes faster"], answer: 0, why: "One signalperson means no mixed signals, so the operator always knows what to do." } },
      { id: "lsf-fl-circuits", title: "Wiring a Boat", site: "lsf-marine-electrical", k12: "k12-circuits-at-the-electrical-bench", station: "electrical", trade: "Marine electricians", tradeLine: "A marine electrician switches a circuit off and tests it before touching, because water and electricity do not mix.", minutes: 3, steps: ["Look at the panel: each switch feeds one circuit on the boat.", "Electricity flows in a loop, and opening the switch breaks the loop.", "The electrician switches off, locks it and tests it dead before working."], check: { q: "What does an electrician do before touching a circuit?", options: ["Switch it off, lock it and test it dead", "Touch it quickly", "Ask the boat's owner"], answer: 0, why: "Opening, locking and testing the circuit proves it is safe before anyone touches it." } },
      { id: "lsf-fl-levee-bank", title: "Holding the Bayou Bank", site: "lsf-bulkhead-piling", landmark: "bayou-teche-bank", k12: "k12-by-how-a-levee-holds-water-back", station: "op-pile-driving-rig-and-lead-setup", trade: "Pile drivers", tradeLine: "A pile crew drives sheet pile along the bank, because a wall of steel holds the soil back from the water.", minutes: 3, steps: ["Stand on the bank and look at the water on one side and the yard on the other.", "Soil wants to slide toward the water, and water can push through loose soil.", "The crew drives interlocking steel sheets so the bank stays put."], check: { q: "Why does a crew drive sheet pile along a bayou bank?", options: ["To hold the soil back from the water", "To make the bayou deeper", "To keep fish out"], answer: 0, why: "A sheet pile wall holds the bank in place so the yard does not slide into the water." } },
    ],
    gated: [
      { id: "lsf-gated-first-launch", kind: "side-quest", title: "The First Launch", world: "parishes", parish: id, site: "lsf-launch-and-test", siteName: "Launch and Test Berth", summary: "Help the berth crew put a finished vessel into the bayou.", gate: { stations: ["mw-workboat-towing-and-line-handling", "br-cold-water-immersion-and-mob-recovery"], note: "Walk line handling and cold-water recovery before the launch" } },
      { id: "lsf-gated-hull-block", kind: "side-quest", title: "The Hull Block Weld", world: "parishes", parish: id, site: "lsf-hull-fabrication", siteName: "Hull Fabrication Hall", summary: "Stand fire watch while the crew welds a hull block.", gate: { stations: ["shipyard-hotwork", "welding"], note: "Finish shipyard hot work and welding before the block weld" } },
    ],
  });
}

// ------------------------------------------------------------------ AVEX, Acadiana Regional Airport, New Iberia (scale 1.2)
{
  const id = "la-avex-new-iberia", S = 1.2, f = frame(-91.884, 30.038, S);
  emit("np-data-la-avex-new-iberia.js", "NP_LA_AVEX_NEW_IBERIA", HEADER("AVEX at Acadiana Regional Airport, New Iberia",
    "About 1.2 real metres per map metre: Acadiana Regional Airport on the north-west side of New Iberia, Iberia Parish, its\n// main runway running roughly north–south, the airfield's aprons and the cane fields around it."), {
    id, name: "AVEX Hangars — Acadiana Regional Airport, New Iberia", region: "louisiana-sites", size: 4096, scale: S,
    blurb: "Acadiana Regional Airport in New Iberia, Iberia Parish, where Aviation Exteriors Louisiana (AVEX) is building ($74 million+ hangar and site development with a $10 million FastSites investment; aircraft paint, maintenance and passenger-to-freighter conversion; construction complete Q4 2027, per the sources in the facts file): the runway, the aprons, hangar steel going up and the cane fields around. The project layout is illustrative; the parish, waterways and towns are real.",
    project: { name: "Aviation Exteriors Louisiana (AVEX)", company: "AVEX", facts: "Acadiana Regional Airport, New Iberia (Iberia Parish); $74 million+ hangar and site development (with a $10 million FastSites investment); 249 direct new jobs; 183 retained; 596 indirect (845 total including indirect); aircraft paint, maintenance and passenger-to-freighter conversion; construction complete Q4 2027", sources: ["opportunitylouisiana.gov news", "bizneworleans.com"], illustrative: true },
    start: "lav-workforce-centre",
    anchors: anchorsOf(f, [["Acadiana Regional Airport", -91.884, 30.038], ["the runway's north end (approximate)", -91.886, 30.052], ["the runway's south end (approximate)", -91.881, 30.024], ["New Iberia, toward the town (approximate)", -91.862, 30.020], ["cane fields west of the airfield", -91.905, 30.040], ["cane fields north of the airfield", -91.880, 30.058]]),
    hills: [],
    water: [
      { id: "coulee-west", name: "a drainage coulee (procedural)", kind: "canal", width: 10, poly: [[-1500, -2048], [-1450, -900], [-1550, 200], [-1400, 1200], [-1500, 2048]] },
      { id: "stormwater-pond", name: "the airfield stormwater pond (procedural)", kind: "lake", poly: [[900, 1200], [1300, 1200], [1300, 1500], [900, 1500]] },
      { id: "coulee-east", name: "a field ditch east of the airfield (procedural)", kind: "canal", width: 8, poly: [[1700, -2048], [1650, -600], [1750, 800], [1700, 2048]] },
    ],
    levees: [
      { id: "pond-berm", name: "the stormwater pond's berm (procedural)", height: 1.5, pts: [[860, 1160], [1340, 1160], [1340, 1540]] },
      { id: "coulee-spoil-bank", name: "the coulee's spoil bank (procedural)", height: 1.2, pts: [[-1430, -1600], [-1400, -900], [-1480, 0]] },
    ],
    roads: [
      { id: "main-runway", name: "the main runway", kind: "interstate", pts: [[-150, -1300], [0, 0], [150, 1300]] },
      { id: "parallel-taxiway", name: "the parallel taxiway", kind: "avenue", pts: [[180, -1250], [320, 0], [460, 1250]] },
      { id: "airport-road", name: "the airport road toward New Iberia (procedural course)", kind: "avenue", pts: [[2048, 1400], [1400, 1000], [1000, 700], [900, 300], [900, -400]] },
      { id: "hangar-row", name: "the hangar row (procedural)", kind: "street", pts: [[900, -400], [900, -900], [700, -1300]] },
      { id: "apron-service-road", name: "the apron service road (procedural)", kind: "street", pts: [[900, 100], [1400, 100], [1400, -700]] },
      { id: "cane-road-north", name: "a cane field road (procedural)", kind: "street", pts: [[-1000, -2048], [-900, -1500], [-600, -1500]] },
      { id: "fuel-farm-road", name: "the fuel farm road (procedural)", kind: "street", pts: [[1000, 700], [1300, 600], [1600, 400]] },
    ],
    districts: [
      { id: "airfield", name: "the airfield", character: "park", poly: [[-700, -1500], [700, -1500], [700, 1500], [-700, 1500]] },
      { id: "hangar-campus", name: "the AVEX hangar campus (illustrative)", character: "industrial", poly: [[700, -1400], [1600, -1400], [1600, 300], [700, 300]] },
      { id: "airport-business", name: "the airport business park", character: "industrial", poly: [[700, 300], [1600, 300], [1600, 1150], [700, 1150]] },
      { id: "cane-west", name: "cane fields west of the airfield", character: "garden", poly: [[-2048, -2048], [-700, -2048], [-700, 2048], [-2048, 2048]] },
      { id: "cane-north", name: "cane fields north of the airfield", character: "garden", poly: [[-700, -2048], [2048, -2048], [2048, -1500], [-700, -1500]] },
      { id: "new-iberia-edge", name: "the edge of New Iberia", character: "suburb", poly: [[1600, -1500], [2048, -1500], [2048, 2048], [1600, 2048]] },
      { id: "cane-south", name: "cane fields south of the airfield", character: "garden", poly: [[-700, 1500], [1600, 1500], [1600, 2048], [-700, 2048]] },
    ],
    sites: [
      site("lav-workforce-centre", "Airport Workforce Centre", "school", [1300, 900], ["iam", "ironworkers", "iupat"], ["job-readiness-edition", "aviation-maintenance-and-ground", "aerospace-defense-and-robotics"], ["jobsite-orientation-and-osha-10", "wp-apprenticeship-enrollment-day", "apprenticeship-standards-reading"], "A training room for the kinds of work the project names — aircraft paint, maintenance and freighter conversion — and the hangar build. A trade reference, not an employer's hiring office."),
      site("lav-hangar-steel", "Hangar Steel Erection", "hangar", [1150, -1000], ["ironworkers", "iuoe"], ["bridge-and-structural", "rigging-lifting"], ["steel-erector", "leading-edge-and-horizontal-lifeline", "bs-structural-bolting-and-torque", "op-crawler-crane-assembly-and-load-chart"], "Long-span hangar steel going up: connectors tied off, bolts torqued to the mark, the crane's load chart read before every pick."),
      site("lav-paint-hangar", "Paint Hangar", "paint-shop", [1150, -600], ["iupat", "iam"], ["aviation-maintenance-and-ground", "hazmat-environmental"], ["paint-sprayer", "ib-spray-foam-and-respirator-fit", "cm-epoxy-floor-coating-and-ventilation", "av-hangar-jacking-and-stands"], "Aircraft paint (the facts file names it): the booth's ventilation running, the respirator fit tested, and stands and fall protection around the fuselage."),
      site("lav-freighter-conversion-bay", "Freighter Conversion Bay", "hangar", [1150, -200], ["iam", "smart", "ibew"], ["aviation-maintenance-and-ground", "aerospace-defense-and-robotics"], ["av-hangar-jacking-and-stands", "ad-depot-tool-control-and-fod-walk", "av-borescope-and-tool-control-inventory", "ad-hazardous-fluid-servicing-with-a-buddy"], "Passenger-to-freighter conversion (the facts file names it): the aircraft on jacks, tools counted in and out, and fluids serviced with a buddy."),
      site("lav-apron-work", "Apron Work", "airport", [600, -300], ["iam", "twu", "liuna"], ["aviation-maintenance-and-ground", "transit-ramp"], ["airport-ramp", "av-marshalling-and-wingwalker-signals", "av-pushback-tug-and-towbar-connection", "ad-depot-tool-control-and-fod-walk"], "The apron in front of the hangars: marshalling signals, wingwalkers on every tow, and the foreign-object walk before aircraft move."),
      site("lav-fuel-farm", "Fuel Farm", "fuel-farm", [1500, 550], ["teamsters", "ua", "iam"], ["aviation-maintenance-and-ground", "hazmat-environmental"], ["av-ground-power-and-static-bonding-before-fuel", "yc-fuel-dock-transfer-and-spill-kit", "spill-boom-deploy"], "The airfield's fuel farm: bonding before every transfer, the spill kit at hand and no ignition source inside the fence."),
      site("lav-hangar-foundation", "Hangar Foundation", "construction", [900, -1250], ["opcmia", "liuna", "carpenters"], ["cement-masons-and-plasterers", "builders-trades"], ["concrete-pour", "cm-slab-screed-bull-float-and-trowel", "cm-power-trowel-operation-and-guarding"], "The hangar's slab and footings: the pump's swing zone, rebar caps, and finishers on a very large floor."),
      site("lav-hangar-doors", "Hangar Door Install", "construction", [1450, -1000], ["ironworkers", "iuec", "ibew"], ["bridge-and-structural", "elevator-constructors"], ["rl-critical-lift-plan-and-signalperson", "ew-machine-room-lockout-and-brake-test", "leading-edge-and-horizontal-lifeline"], "The big hangar doors hung and wired: a critical lift plan, the drive locked out during adjustment, and fall protection at the header."),
      site("lav-sheet-metal-shop", "Sheet Metal Shop", "workshop", [1400, -350], ["smart", "iam"], ["aerospace-defense-and-robotics", "aviation-maintenance-and-ground"], ["sm-shop-layout-and-shear", "sm-tig-and-spot-welding", "ad-depot-tool-control-and-fod-walk"], "Structural repairs and new parts for the conversions: the shear's guard, the welding screen and the tool count."),
      site("lav-composite-shop", "Composite Shop", "workshop", [1400, 50], ["iam", "iupat"], ["aerospace-defense-and-robotics"], ["ad-cleanroom-gowning-and-esd-discipline", "ib-spray-foam-and-respirator-fit", "ad-hazardous-fluid-servicing-with-a-buddy"], "Composite repair: resins handled with gloves and ventilation, dust kept down, and the clean area's gowning rules."),
      site("lav-avionics-wiring", "Avionics and Wiring Bench", "workshop", [1000, 100], ["ibew", "iam"], ["electrical-first-period", "aviation-maintenance-and-ground"], ["electrical", "ad-cleanroom-gowning-and-esd-discipline", "av-ground-power-and-static-bonding-before-fuel"], "Aircraft wiring for maintenance and conversion: power off before work, static control on the bench, ground power connected safely."),
      site("lav-site-utilities", "Site Utilities Crew", "utility", [800, 800], ["liuna", "ua", "iuoe"], ["water-and-gas-utility-crews", "heavy-equipment-operators"], ["op-excavator-trench-and-utility-locate", "trench-box", "ut-water-main-break-emergency-shutdown-and-excavation"], "Roads, water and drainage for the new hangars, the kinds of site work FastSites funds: locates first and every trench shored."),
      site("lav-taxiway-connector", "Taxiway Connector", "airport", [650, -900], ["iuoe", "liuna", "opcmia"], ["heavy-equipment-operators", "cement-masons-and-plasterers"], ["op-grader-fine-grade-and-crown", "op-compactor-lift-thickness-and-edge", "cm-concrete-saw-cutting-with-water-and-silica-control"], "Pavement tying the new hangars to the taxiway: grade and compaction, saw-cut joints under water for silica, and a runway escort for every crossing."),
      site("lav-paint-mix-room", "Paint Mix Room", "chemical", [900, -700], ["iupat", "teamsters"], ["hazmat-environmental"], ["tdl-hazmat-labeling-and-segregation", "hazmat-container-inspection", "paint-sprayer"], "Coatings mixed and stored: labels and segregation, containers inspected, and ventilation on before a lid comes off."),
      site("lav-ground-support-yard", "Ground Support Equipment Yard", "yard", [1450, 300], ["iam", "teamsters"], ["aviation-maintenance-and-ground", "transit-ramp"], ["av-pushback-tug-and-towbar-connection", "av-deicing-truck-boom-operations", "op-equipment-daily-walkaround-and-fluids"], "Tugs, lifts and ground power units maintained and checked: the walkaround before use and the tow bar connected by the book."),
      site("lav-airport-fire-station", "Airport Fire Station", "fire-station", [-350, 1300], ["iaff", "naemt"], ["first-responders"], ["aerial-ladder", "shelter-in-place-drill", "traffic-incident-management"], "The airfield's rescue and firefighting crew: equipment checks, the response drill, and scene safety on the apron."),
      site("lav-stormwater-pond", "Stormwater Pond Crew", "stormwater", [1100, 1600], ["liuna", "iuoe"], ["water-and-gas-utility-crews", "heavy-equipment-operators"], ["stormwater-outfall", "op-dozer-slope-work-and-rollover-protection", "br-cold-water-immersion-and-mob-recovery"], "The crew shaping the airfield's procedural stormwater pond: the dozer off the soft edge and a throw ring by the water."),
      site("lav-laydown-yard", "Hangar Laydown Yard", "staging", [1300, 700], ["teamsters", "iuoe", "ironworkers"], ["rigging-lifting", "warehouse-and-logistics-automation"], ["forklift-dock", "crane-yard", "tdl-lifting-and-ergonomics"], "Steel, panels and doors waiting to go up: forklift lanes, dunnage under every bundle and the crane set up on firm ground."),
    ],
    landmarks: [
      { id: "lav-project-sign", name: SIGN, position: [1250, 1000], kind: "sign" },
      { id: "acadiana-regional-airport", name: "Acadiana Regional Airport", position: [850, 500], kind: "airport" },
      { id: "main-runway-end", name: "the main runway's north end", position: [-120, -1350], kind: "airport" },
      { id: "new-iberia-toward", name: "toward New Iberia", position: [1900, 1300], kind: "town" },
      { id: "cane-fields-west", name: "the cane fields", position: [-1200, 0], kind: "field" },
      { id: "parallel-taxiway-place", name: "the parallel taxiway", position: [450, 1300], kind: "airport" },
    ],
    connectors: [
      way("lc-av-airport-road-east", "The airport road toward New Iberia", id, [2040, 1400], f, "iberia-new-iberia"),
      way("lc-av-cane-road-north", "A cane field road north", id, [-1000, -2040], f, "iberia-north"),
    ],
    fieldLessons: [
      { id: "lav-fl-slope-ramp", title: "Why Hangar Floors Slope", site: "lav-hangar-foundation", k12: "k12-slope-and-angles-on-a-ramp", station: "concrete-pour", trade: "Cement masons", tradeLine: "A finisher gives a big floor a gentle slope, so water runs to the drains instead of pooling under an aircraft.", minutes: 3, steps: ["Look along the new hangar floor toward the drain line.", "The floor drops a tiny amount over a long distance, a gentle slope.", "Water on a slope runs downhill to the drain, so the floor stays dry and safe."], check: { q: "Why does a hangar floor slope gently toward drains?", options: ["So water runs off instead of pooling", "To make aircraft roll away", "Because concrete cannot be flat"], answer: 0, why: "A gentle slope carries water to the drains, which keeps the floor safe to walk and work on." } },
      { id: "lav-fl-circuits", title: "Static and Fuel", site: "lav-fuel-farm", k12: "k12-circuits-at-the-electrical-bench", station: "av-ground-power-and-static-bonding-before-fuel", trade: "Aircraft fuellers", tradeLine: "A fueller clips a bonding wire on before fuel flows, because a spark from static can light fuel vapour.", minutes: 3, steps: ["Watch the fueller clip a wire from the truck to the aircraft.", "The wire lets static electricity flow away safely instead of jumping as a spark.", "Only then does the fuel start to flow."], check: { q: "Why is a bonding wire clipped on before fuelling?", options: ["It lets static flow away so no spark jumps", "It holds the hose in place", "It measures the fuel"], answer: 0, why: "Bonding joins the two so static cannot build up and spark near fuel vapour." } },
      { id: "lav-fl-storm-drain", title: "Where the Airfield's Rain Goes", site: "lav-stormwater-pond", k12: "k12-es-where-the-storm-drain-goes", station: "stormwater-outfall", trade: "Stormwater crews", tradeLine: "A stormwater crew keeps the pond and ditches clear, because rain off a big paved airfield has to go somewhere.", minutes: 3, steps: ["Look at the paved apron and the grass ditches beside it.", "Rain runs off pavement fast and flows down the ditches to the pond.", "The pond holds the water and lets it out slowly, so the fields do not flood."], check: { q: "Why does an airfield have a stormwater pond?", options: ["To hold rain from the pavement and let it out slowly", "For aircraft to land on", "To store fuel"], answer: 0, why: "Pavement sheds rain fast; the pond slows it down so it does not flood the land downstream." } },
    ],
    gated: [
      { id: "lav-gated-top-out", kind: "side-quest", title: "Topping Out the Hangar", world: "parishes", parish: id, site: "lav-hangar-steel", siteName: "Hangar Steel Erection", summary: "Help the ironworkers set the last roof truss on the hangar.", gate: { stations: ["steel-erector", "leading-edge-and-horizontal-lifeline"], note: "Finish steel erection and the leading-edge lifeline before the top-out" } },
      { id: "lav-gated-paint-booth", kind: "side-quest", title: "Paint Hangar Ventilation Check", world: "parishes", parish: id, site: "lav-paint-hangar", siteName: "Paint Hangar", summary: "Check the paint hangar's ventilation and PPE with the painters before a shift.", gate: { stations: ["paint-sprayer", "ib-spray-foam-and-respirator-fit"], note: "Finish the paint sprayer and respirator fit stations before the shift" } },
    ],
  });
}
