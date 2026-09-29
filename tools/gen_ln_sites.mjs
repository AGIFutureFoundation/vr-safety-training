#!/usr/bin/env node
// SITES-NORTH (console `ln`, docs/consoles/SITES-NORTH.md): writes the three inland / river Louisiana project maps once, as pure
// literal modules — the modules are the source of truth afterwards (the TIDELANDS / PROJECTLANDS pattern).
//
//     node tools/gen_ln_sites.mjs            (writes WebXR/shared/np-data-la-*.js)
//
// Every map is laid out from the place's approximate lon/lat frame (three decimals, `approximate: true`) through one north-up
// uniform scale (x east, +z south); every anchor's map position is its lon/lat pushed through that projection, so the fit is
// exact to rounding. The named towns, rivers and highways are real places named as places; every other feature and every
// project site is PROCEDURAL or ILLUSTRATIVE and says so. Project facts come only from the Louisiana facts file.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "WebXR", "shared");
const M_LAT = 111320;
const LAYOUT = "the project layout is illustrative; the parish, waterways and towns are real";

function frame(centre, scale) {
  const mLon = M_LAT * Math.cos((centre[1] * Math.PI) / 180);
  return {
    xz: ([lon, lat]) => [Math.round(((lon - centre[0]) * mLon) / scale), Math.round((-(lat - centre[1]) * M_LAT) / scale)],
  };
}
const anchor = (f, name, lonlat) => ({ xz: f.xz(lonlat), lonlat, approximate: true, name });
const site = (id, name, kind, position, trades, programmes, stations, blurb, extra = {}) => ({ id, name, kind, position, trades, programmes, stations, blurb, ...extra });
const J = (v) => JSON.stringify(v);
const S2 = "Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).";
// A polyline offset sideways by d map metres (positive = to the right of the direction of travel, x east, +z south), rounded.
function offsetLine(pts, d) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz) || 1;
    return [Math.max(-2048, Math.min(2048, Math.round(p[0] - (dz / n) * d))), Math.max(-2048, Math.min(2048, Math.round(p[1] + (dx / n) * d)))];
  });
}

function emit(file, exportName, header, m) {
  const lines = [];
  lines.push(...header.map((h) => `// ${h}`));
  lines.push(`export const ${exportName} = {`);
  for (const k of ["id", "name", "region", "size", "scale", "blurb", "start"]) lines.push(`  ${k}: ${J(m[k])},`);
  for (const k of ["anchors", "hills", "water", "levees", "roads", "districts", "sites", "landmarks", "connectors", "fieldLessons", "gated"]) {
    if (!m[k].length) { lines.push(`  ${k}: [],`); continue; }
    lines.push(`  ${k}: [`);
    for (const v of m[k]) lines.push(`    ${J(v)},`);
    lines.push("  ],");
  }
  lines.push("};", "");
  writeFileSync(join(OUT, file), lines.join("\n"));
  console.log(`wrote WebXR/shared/${file}: ${m.sites.length} sites, ${m.landmarks.length} landmarks, ${m.roads.length} roads`);
}

const gate = (id, title, parish, s, summary, stations, note) => ({ id, kind: "side-quest", title, world: "parishes", parish, site: s.id, siteName: s.name, summary, gate: { stations, note } });

// ---------------------------------------------------------------------------------------------------------------------------
// 1. la-meta-richland — Richland Parish farmland, northeast Louisiana (the Meta data center, per the facts file).
{
  const f = frame([-91.66, 32.45], 4);
  const P = "la-meta-richland";
  const sites = [
    site("lmr-workforce-centre", "Richland Site Workforce Centre", "campus", [20, 600], ["ibew", "liuna", "carpenters"], ["job-readiness-edition", "builders-trades"], ["jobsite-orientation-and-osha-10", "apprenticeship-standards-reading", "union-hall-and-dispatch", "wellness-shift-work-sleep-and-stress"], "The trailers by the gate where every new hand starts: site orientation, the apprenticeship board and the day's safety talk before anyone walks onto the campus."),
    site("lmr-security-gate", "Campus Security Gate", "office", [60, 340], ["spfpa", "teamsters"], ["situational-awareness", "warehouse-and-logistics-automation"], ["tdl-backing-and-docking", "tdl-pretrip-inspection", "traffic-incident-management"], "The gate on the site access road: badges checked, delivery trucks staged and walked in, pedestrians kept to their own lane."),
    site("lmr-site-grading", "Data Center Site Grading", "excavation", [700, 1300], ["iuoe", "liuna", "teamsters"], ["heavy-equipment-operators"], ["op-dozer-slope-work-and-rollover-protection", "op-grader-fine-grade-and-crown", "op-compactor-lift-thickness-and-edge", "op-loader-truck-loading-and-blind-spots"], "The flat fields graded into building pads: dozers and graders on the cut, compaction in thin lifts, and haul trucks kept clear of the blind spots."),
    site("lmr-duct-bank-crew", "Duct Bank Crew", "utility", [1200, 450], ["ibew", "liuna", "iuoe"], ["electrical-first-period", "heavy-equipment-operators", "confined-space"], ["op-excavator-trench-and-utility-locate", "trench-box", "concrete-pour", "manhole-entry-and-atmospheric-monitoring"], "The trench that carries the power conduits between buildings: locate first, the trench box set, the duct bank poured and the pull vaults entered only on a permit."),
    site("lmr-substation-build", "Campus Substation Build", "substation", [1850, 550], ["ibew", "ironworkers", "iuoe"], ["electrical-first-period", "energy-transition", "wind-and-data-infrastructure"], ["substation-switching", "ws-substation-switching-under-a-permit", "arc-flash-label-study", "rl-critical-lift-plan-and-signalperson"], "The high-voltage yard that feeds the campus: transformers set by a planned lift, switching done under a permit and the arc-flash boundary on every label."),
    site("lmr-data-hall-fitout", "Data Hall Fit-Out", "construction", [600, 700], ["ibew", "smart", "cwa"], ["wind-and-data-infrastructure", "electrical-first-period"], ["ws-data-hall-busway-install-and-torque-signoff", "ws-raised-floor-tile-lift-and-cable-tray-safety", "temporary-site-power", "motor-control-center"], "Inside a data hall shell: busway hung and torqued, cable trays run overhead, floor tiles lifted one at a time, and temporary power kept tidy."),
    site("lmr-cooling-plant", "Cooling Plant Build", "plant", [1000, 1000], ["ua", "smart", "insulators"], ["stationary-engineer", "plumbers-and-pipefitters", "insulators-and-boilermakers"], ["chiller-plant", "cooling-tower", "pl-hydronic-boiler-piping-and-hydrotest", "ib-mechanical-insulation-pipe-and-jacketing"], "The chillers and cooling towers that carry heat out of the halls: pipe set and pressure-tested, insulated and jacketed before the plant starts."),
    site("lmr-laydown-yard", "Laydown Yard", "staging", [1450, 1200], ["teamsters", "iuoe", "liuna"], ["warehouse-and-logistics-automation", "rigging-lifting"], ["forklift-dock", "tdl-trailer-loading-and-dock-plate", "tdl-cargo-securement-and-hours", "crane-yard"], "Where steel, switchgear and cable reels wait their turn: forklifts in marked lanes, loads strapped, and every pick planned before it leaves the ground."),
    site("lmr-crane-pad", "Tower Crane Pad", "construction", [400, 1050], ["iuoe", "ironworkers"], ["rigging-lifting", "bridge-and-structural", "fall-protection"], ["op-crawler-crane-assembly-and-load-chart", "rl-critical-lift-plan-and-signalperson", "steel-erector", "leading-edge-and-horizontal-lifeline"], "The crane pad by the rising halls: the load chart read, the signal person in sight, and ironworkers tied off at the leading edge."),
    site("lmr-transmission-line-crew", "Transmission Line Crew", "utility", [1600, -1000], ["ibew", "iuoe"], ["energy-transition", "electrical-first-period"], ["or-transmission-line-right-of-way-patrol", "line-truck", "tower-climb"], "The line crew on the right-of-way north of the interstate: the patrol walks the line, the bucket truck set up, and climbers checked before they go up."),
    site("lmr-generator-yard", "Backup Generator Yard", "energy-storage", [1500, 800], ["ibew", "iuoe", "iam"], ["energy-transition", "stationary-engineer"], ["battery-storage-container-commissioning", "battery-yard", "fire-pump", "ut-night-storm-response-crew-and-portable-generator"], "The yard of standby generators and battery rooms that keep the halls running: commissioning steps, lockout before any panel opens, and the fire pump tested."),
    site("lmr-fiber-vault-crew", "Fiber Vault Crew", "utility", [300, 450], ["cwa", "ibew"], ["wind-and-data-infrastructure", "confined-space"], ["cs-permit-entry-and-attendant-duties", "cs-ventilation-and-air-monitoring-plan", "valve-vault"], "The network crew at an underground vault where the fiber enters the campus: the air tested, the attendant at the hatch, and the permit on the board."),
    site("lmr-concrete-batch-plant", "Concrete Batch Plant", "industrial", [-400, 1250], ["teamsters", "opcmia", "iuoe"], ["cement-masons-and-plasterers", "builders-trades"], ["concrete-pour", "cm-slab-screed-bull-float-and-trowel", "cm-power-trowel-operation-and-guarding", "cm-concrete-saw-cutting-with-water-and-silica-control"], "The batch plant in the fields south of the campus: mixer trucks loaded, slabs screeded and troweled, and saw cutting done wet to hold down the dust."),
    site("lmr-roofing-crew", "Data Hall Roofing Crew", "construction", [900, 550], ["urw", "smart"], ["roofers-and-waterproofers", "fall-protection"], ["rf-single-ply-tpo-heat-welding-and-seam-probe", "rf-skylight-and-hatch-guarding", "leading-edge-and-horizontal-lifeline"], "The crew on a data hall roof: single-ply membrane heat-welded and probed, every hatch guarded, and the edge line up before the first roll is laid."),
    site("lmr-fire-protection-riser", "Fire Protection Riser Room", "fire", [1300, 700], ["ua", "iaff"], ["plumbers-and-pipefitters", "stationary-engineer"], ["pl-fire-sprinkler-riser-and-flow-test", "pm-sprinkler-riser-room", "fire-pump"], "The riser room where the sprinkler mains come in: flow tests witnessed, valves tagged, and the fire pump run on schedule."),
    site("lmr-commissioning-office", "Commissioning Office", "office", [300, 1350], ["ibew", "ua", "ifpte"], ["stationary-engineer", "wind-and-data-infrastructure"], ["se-building-automation-alarm-triage", "ws-crah-alarm-response-in-a-live-hall", "arc-flash-label-study"], "The office where systems are proven before a hall goes live: alarm triage on the automation screens, a live-hall response drill, and the labels checked."),
    site("lmr-stormwater-pond", "Site Stormwater Pond", "stormwater", [1100, 1750], ["liuna", "iuoe"], ["hazmat-environmental", "heavy-equipment-operators"], ["stormwater-outfall", "bk-bioretention-rain-garden-excavation", "op-excavator-trench-and-utility-locate"], "The pond that holds the campus's rain before it leaves the site: the outfall inspected, the banks kept, and silt kept out of the field ditches."),
    site("lmr-bayou-buffer-survey", "Bayou Buffer Survey", "survey", [-1200, 300], ["liuna", "afscme"], ["hazmat-environmental", "marine-ecology-and-restoration"], ["marsh-transect-survey", "stormwater-outfall", "br-native-planting-and-erosion-mats"], "The survey crew walking the bayou's wooded bank west of the campus: the buffer flagged, erosion mats where the bank is bare, and outfalls checked after rain."),
  ];
  const S = Object.fromEntries(sites.map((s) => [s.id, s]));
  emit("np-data-la-meta-richland.js", "NP_LA_META_RICHLAND", [
    "Richland Parish data center site — a Louisiana development site on the parish schema (console SITES-NORTH, docs/consoles/SITES-NORTH.md,",
    "docs/parishes.md). A stylised 4096 m map, not a survey: Holly Ridge, Rayville, Delhi, the interstate and the highway appear only by",
    "their public names as places; every coordinate is approximate (three decimals, `approximate: true`) and exists only to place the map.",
    "One north-up uniform scale (four real metres per map metre, x east, +z south). The bayou, the field ditches, the farm roads and",
    "every building and site are PROCEDURAL; the project layout is ILLUSTRATIVE (no site plan is published): " + LAYOUT + ".",
    S2,
    "The project, as the facts file states it: the Meta data center in Richland Parish (northeast Louisiana, near Monroe), more than",
    "$50 billion, about 10 million sq ft and 5 GW; about 7,500 construction jobs and 1,000 permanent positions (500+ operational) —",
    "sources: opportunitylouisiana.gov/data-center/meta; constructiondive.com; wafb.com 2026-07-29. A trade reference only: the platform",
    "has no partnership with the company; the sites teach the trades' practice from the catalog's sourced stations. Pure data, no imports.",
  ], {
    id: P, name: "Richland Parish Data Center Site", region: "louisiana-sites", size: 4096, scale: 4,
    blurb: `Flat Richland Parish farmland along the interstate near Holly Ridge in northeast Louisiana, where a very large data center campus is being built: site grading, the duct banks, a substation, data hall fit-out, the cooling plant and the workforce centre. ${LAYOUT[0].toUpperCase()}${LAYOUT.slice(1)}.`,
    start: "lmr-workforce-centre",
    anchors: [
      anchor(f, "Holly Ridge", [-91.668, 32.472]),
      anchor(f, "the interstate at the Holly Ridge exit", [-91.668, 32.456]),
      anchor(f, "the interstate west toward Rayville", [-91.745, 32.456]),
      anchor(f, "the interstate east toward Delhi", [-91.575, 32.45]),
      anchor(f, "the highway east of Holly Ridge", [-91.58, 32.465]),
      anchor(f, "Richland Parish farmland south of the interstate", [-91.65, 32.4]),
    ],
    hills: [],
    water: [
      { id: "farm-bayou", name: "a farm bayou (procedural)", kind: "bayou", width: 24, poly: [[-1350, -2048], [-1250, -1400], [-1400, -800], [-1280, -200], [-1420, 400], [-1300, 1100], [-1450, 2048]] },
      { id: "field-drainage-canal", name: "a field drainage canal (procedural)", kind: "canal", width: 10, poly: [[1960, -2048], [1930, -600], [1980, 400], [1960, 2048]] },
      { id: "site-stormwater-pond", name: "the site stormwater pond (illustrative)", kind: "lake", poly: [[1200, 1600], [1650, 1600], [1650, 1900], [1200, 1900]] },
      { id: "south-field-ditch", name: "a south field ditch (procedural)", kind: "canal", width: 8, poly: [[-1440, 1500], [-800, 1560], [0, 1700], [900, 1950], [1200, 2048]] },
    ],
    levees: [
      { id: "pond-berm", name: "the stormwater pond berm (illustrative)", height: 2, pts: [[1180, 1575], [1675, 1575], [1675, 1920]] },
      { id: "bayou-spoil-bank", name: "the bayou's spoil bank (procedural)", height: 1.5, pts: [[-1235, -200], [-1370, 400], [-1255, 1100]] },
    ],
    roads: [
      { id: "interstate-twenty", name: "Interstate Twenty", kind: "interstate", pts: [[-2048, -179], [-1000, -174], [0, -169], [1126, -113], [2048, 0]] },
      { id: "us-highway-eighty", name: "US Highway Eighty", kind: "avenue", pts: [[-2048, -727], [-1000, -620], [-188, -600], [768, -512], [2048, -399]] },
      { id: "holly-ridge-parish-road", name: "the Holly Ridge parish road (procedural course)", kind: "street", pts: [[-188, -2048], [-188, -600], [-150, -172], [-120, 600], [-100, 2048]] },
      { id: "site-access-road", name: "the site access road (illustrative)", kind: "avenue", pts: [[-120, 260], [400, 260], [1750, 260]] },
      { id: "campus-ring-road", name: "the campus ring road (illustrative)", kind: "street", pts: [[200, 260], [200, 1500], [1750, 1500], [1750, 260]] },
      { id: "south-farm-road", name: "a farm road south (procedural)", kind: "street", pts: [[-1800, 900], [-120, 950]] },
    ],
    districts: [
      { id: "holly-ridge", name: "Holly Ridge", character: "suburb", poly: [[-600, -850], [250, -850], [250, -400], [-600, -400]] },
      { id: "fields-north-west", name: "the fields north of the interstate, west (procedural)", character: "garden", poly: [[-2048, -2048], [-600, -2048], [-600, -200], [-2048, -200]] },
      { id: "fields-north-east", name: "the fields north of the interstate, east (procedural)", character: "garden", poly: [[250, -2048], [2048, -2048], [2048, -20], [250, -150]] },
      { id: "data-center-campus", name: "the data center campus (illustrative)", character: "industrial", poly: [[150, 250], [1750, 250], [1750, 1550], [150, 1550]] },
      { id: "workforce-centre-and-gate", name: "the workforce centre and gate (illustrative)", character: "campus", poly: [[-80, 150], [150, 150], [150, 800], [-80, 800]] },
      { id: "substation-yard", name: "the substation yard (illustrative)", character: "industrial", poly: [[1750, 250], [2048, 250], [2048, 900], [1750, 900]] },
      { id: "fields-south", name: "the fields south of the campus (procedural)", character: "garden", poly: [[-2048, 900], [150, 900], [150, 2048], [-2048, 2048]] },
      { id: "bayou-woods", name: "the bayou woods (procedural)", character: "park", poly: [[-1600, -150], [-1000, -150], [-1000, 900], [-1600, 900]] },
    ],
    sites,
    landmarks: [
      { id: "illustrative-layout-sign", name: `a sign: ${LAYOUT}`, position: [-60, 420], kind: "point" },
      { id: "holly-ridge-place", name: "Holly Ridge", position: [-250, -640], kind: "place" },
      { id: "holly-ridge-exit", name: "the interstate at the Holly Ridge exit", position: [-188, -150], kind: "bridge" },
      { id: "farm-bayou-bank", name: "the farm bayou's bank (procedural)", position: [-1230, -700], kind: "canal" },
      { id: "richland-fields", name: "Richland Parish farmland", position: [-900, 1400], kind: "place" },
      { id: "campus-overlook", name: "the campus overlook (illustrative)", position: [100, 1000], kind: "point" },
      { id: "substation-fence", name: "the substation fence line (illustrative)", position: [1800, 800], kind: "point" },
    ],
    connectors: [
      { id: "la-mr-interstate-west", kind: "road", name: "Interstate Twenty west toward Rayville and Monroe", from: { parish: P, position: [-2040, -179] }, to: { parish: "north-louisiana-rayville", position: null, lonlat: [-91.747, 32.456] }, lonlat: [-91.747, 32.456], approximate: true },
      { id: "la-mr-interstate-east", kind: "road", name: "Interstate Twenty east toward Delhi", from: { parish: P, position: [2040, 0] }, to: { parish: "north-louisiana-delhi", position: null, lonlat: [-91.573, 32.45] }, lonlat: [-91.573, 32.45], approximate: true },
    ],
    fieldLessons: [
      { id: "la-lmr-fl-power-to-the-halls", title: "How Power Reaches a Data Hall", site: "lmr-substation-build", landmark: "substation-fence", k12: "k12-circuits-at-the-electrical-bench", station: "substation-switching", trade: "Electricians", tradeLine: "An electrician switches power only under a permit, because a substation holds far more energy than a house circuit.", minutes: 3, steps: ["Look through the fence at the big transformers and the switches beside them.", "Power comes in on the high lines, and the transformers step it down for the buildings.", "Before anyone works on it, the crew switches it off, locks it and proves it is dead."], check: { q: "What does the crew do before working on a switch?", options: ["Switch it off, lock it and test that it is dead", "Work fast so the power is not off long", "Ask a friend to hold the switch"], answer: 0, why: "Switching off, locking out and testing keeps the energy from coming back while hands are on the equipment." } },
      { id: "la-lmr-fl-rain-on-a-big-roof", title: "Where the Rain Goes on a Big Site", site: "lmr-stormwater-pond", k12: "k12-es-where-the-storm-drain-goes", station: "stormwater-outfall", trade: "Labourers and operators", tradeLine: "A site crew keeps the pond and its outfall clean, because rain off roofs and roads carries mud to the field ditches.", minutes: 3, steps: ["Find the pond at the low corner of the campus.", "Rain from the roofs and roads runs here and slows down, so the mud settles out.", "The crew checks the outfall after every storm and clears anything that blocks it."], check: { q: "Why does a big site have a stormwater pond?", options: ["To slow the rain so mud settles before water leaves", "To store drinking water", "To cool the buildings"], answer: 0, why: "Slowing the water lets the soil drop out, so the ditches and the bayou stay cleaner." } },
      { id: "la-lmr-fl-crane-and-signals", title: "A Crane and Its Signal Person", site: "lmr-crane-pad", landmark: "campus-overlook", k12: "k12-simple-machines-at-a-crane", station: "rl-critical-lift-plan-and-signalperson", trade: "Operating engineers", tradeLine: "A crane operator lifts only on a plan and a signal, because the load can hide the path from the cab.", minutes: 3, steps: ["Watch the crane's hook and the wire running over the pulleys at the top.", "Pulleys and a long arm let the crane lift steel far heavier than any person could.", "The operator follows the signal person's hand signs, and nobody walks under the load."], check: { q: "Who guides the crane operator when the load is out of sight?", options: ["The signal person", "Whoever shouts loudest", "Nobody, the operator guesses"], answer: 0, why: "One trained signal person gives clear signs so the operator always knows where the load is." } },
    ],
    gated: [
      gate("la-lmr-gated-first-hall-live", "The First Hall Goes Live", P, S["lmr-commissioning-office"], "Help the commissioning team prove a hall's alarms before it carries load.", ["se-building-automation-alarm-triage", "ws-crah-alarm-response-in-a-live-hall"], "Finish the alarm triage and live-hall response stations before the hall goes live"),
      gate("la-lmr-gated-duct-bank-pour", "Pouring the Duct Bank", P, S["lmr-duct-bank-crew"], "Set the trench box and pour a duct bank between two buildings.", ["op-excavator-trench-and-utility-locate", "trench-box"], "Walk the trench and locate station and the trench box station before the pour"),
    ],
  });
}

// ---------------------------------------------------------------------------------------------------------------------------
// 2. la-delta-forge-rapides — near Boyce, Rapides Parish, by the Red River (Applied Digital's Delta Forge 1, per the facts file).
{
  const f = frame([-92.66, 31.385], 3);
  const P = "la-delta-forge-rapides";
  const RED = [[-1178, -2048], [-1101, -1434], [-870, -1024], [-512, -717], [-256, -358], [0, -154], [307, -92], [614, -41], [870, 154], [1126, 358], [1536, 420], [2048, 358]];
  const sites = [
    site("ldf-workforce-centre", "Boyce Workforce Centre", "campus", [-300, -100], ["ibew", "liuna", "ironworkers"], ["job-readiness-edition", "builders-trades"], ["jobsite-orientation-and-osha-10", "apprenticeship-application-and-test", "union-hall-and-dispatch", "first-period-evaluation"], "The workforce centre in Boyce where new hands start: site orientation, the apprenticeship test and the dispatch board before the bus to the campus."),
    site("ldf-security-gate", "Campus Security Gate", "office", [300, 380], ["spfpa", "teamsters"], ["situational-awareness", "warehouse-and-logistics-automation"], ["tdl-backing-and-docking", "tdl-pretrip-inspection", "traffic-incident-management"], "The gate off the campus access road: badges, the delivery queue and a clear walking lane beside the truck lane."),
    site("ldf-site-grading", "Campus Site Grading", "excavation", [1100, 1300], ["iuoe", "liuna", "teamsters"], ["heavy-equipment-operators"], ["op-dozer-slope-work-and-rollover-protection", "op-grader-fine-grade-and-crown", "op-compactor-lift-thickness-and-edge", "op-equipment-daily-walkaround-and-fluids"], "The pads cut and filled in the fields south of the interstate: the walkaround first, then the dozer, the grader and the compactor in thin lifts."),
    site("ldf-steel-erection", "Steel Erection", "construction", [700, 600], ["ironworkers", "iuoe"], ["bridge-and-structural", "fall-protection", "rigging-lifting"], ["steel-erector", "bs-structural-bolting-and-torque", "leading-edge-and-horizontal-lifeline", "rl-critical-lift-plan-and-signalperson"], "The frame of a campus building going up: columns and beams set on a lift plan, bolts torqued, and every ironworker tied off at the edge."),
    site("ldf-electrical-room", "Electrical Room", "substation", [900, 750], ["ibew"], ["electrical-first-period", "wind-and-data-infrastructure"], ["motor-control-center", "arc-flash-label-study", "temporary-site-power", "ws-data-hall-busway-install-and-torque-signoff"], "The switchgear room between the halls: gear set and torqued, arc-flash labels on every door, and temporary power kept apart from the permanent gear."),
    site("ldf-network-cabling", "Network Cabling Crew", "utility", [900, 1050], ["cwa", "ibew"], ["wind-and-data-infrastructure"], ["ws-raised-floor-tile-lift-and-cable-tray-safety", "ws-crah-alarm-response-in-a-live-hall", "tower-climb"], "The crew pulling network cable through the halls: floor tiles lifted one at a time, trays loaded evenly, and ladders footed on the raised floor."),
    site("ldf-cooling-plant", "Cooling Plant Build", "plant", [1150, 900], ["ua", "smart", "insulators"], ["stationary-engineer", "plumbers-and-pipefitters", "insulators-and-boilermakers"], ["chiller-plant", "cooling-tower", "ib-hydrostatic-test-and-inspector-witness", "sm-duct-hanging-and-seismic-bracing"], "The cooling plant for the campus: chilled-water pipe set and hydrotested with an inspector watching, ducts hung and braced, towers built."),
    site("ldf-substation-build", "Campus Substation Build", "substation", [1550, 850], ["ibew", "ironworkers", "iuoe"], ["electrical-first-period", "energy-transition"], ["substation-switching", "ws-substation-switching-under-a-permit", "rl-critical-lift-plan-and-signalperson", "arc-flash-label-study"], "The substation at the campus edge: transformers set on a planned lift, switching done under a permit, and the boundary taped before any door opens."),
    site("ldf-laydown-yard", "Laydown Yard", "staging", [600, 1200], ["teamsters", "iuoe"], ["warehouse-and-logistics-automation", "rigging-lifting"], ["forklift-dock", "tdl-cargo-securement-and-hours", "crane-yard", "tdl-lifting-and-ergonomics"], "The yard where steel and gear wait for the crane: forklift lanes painted, loads strapped, and heavy boxes lifted with the legs, not the back."),
    site("ldf-crane-pad", "Crane Pad", "construction", [400, 700], ["iuoe", "ironworkers"], ["rigging-lifting", "heavy-equipment-operators"], ["op-crawler-crane-assembly-and-load-chart", "rigging-loft", "chain-hoist"], "The crawler crane's pad: the crane assembled on firm ground, the load chart read for every pick, and rigging inspected before it goes on the hook."),
    site("ldf-duct-bank-crew", "Duct Bank Crew", "utility", [1000, 580], ["ibew", "liuna", "iuoe"], ["electrical-first-period", "heavy-equipment-operators", "confined-space"], ["op-excavator-trench-and-utility-locate", "trench-box", "concrete-pour", "cs-permit-entry-and-attendant-duties"], "The duct bank trench from the substation to the halls: the locate, the trench box, the pour, and a permit for every vault entry."),
    site("ldf-concrete-pour", "Foundation Pour", "construction", [650, 900], ["opcmia", "carpenters", "liuna"], ["cement-masons-and-plasterers", "builders-trades"], ["concrete-pour", "formwork-shoring", "bt-rebar-tying-and-impalement-protection", "cm-slab-screed-bull-float-and-trowel"], "A building's slab and footings: forms braced, rebar capped, the pump truck's boom clear of the lines, and the slab screeded and troweled."),
    site("ldf-generator-yard", "Backup Generator Yard", "energy-storage", [1350, 1100], ["ibew", "iam", "iuoe"], ["energy-transition", "stationary-engineer"], ["battery-storage-container-commissioning", "battery-yard", "ut-night-storm-response-crew-and-portable-generator"], "Standby generators and battery rooms: commissioning checklists, lockout before any panel opens, and the fuel tanks' spill kits in reach."),
    site("ldf-fire-protection-crew", "Fire Protection Crew", "fire", [1250, 720], ["ua", "iaff"], ["plumbers-and-pipefitters", "stationary-engineer"], ["pl-fire-sprinkler-riser-and-flow-test", "fire-pump", "pm-sprinkler-riser-room"], "The sprinkler fitters and the fire pump house: risers flow-tested, valves tagged and the pump run with the fire service's eyes on it."),
    site("ldf-stormwater-pond", "Site Stormwater Pond", "stormwater", [1600, 1380], ["liuna", "iuoe"], ["hazmat-environmental", "heavy-equipment-operators"], ["stormwater-outfall", "op-excavator-trench-and-utility-locate", "bk-bioretention-rain-garden-excavation"], "The pond at the campus's low corner: the banks shaped, the outfall kept clear, and mud kept out of the ditches after rain."),
    site("ldf-red-river-levee-patrol", "Red River Levee Patrol", "levee", [-623, -588], ["liuna", "afscme"], ["hazmat-environmental", "bay-restoration-maritime-underwater"], ["br-levee-inspection-and-seepage", "br-cold-water-immersion-and-mob-recovery", "stormwater-outfall"], "The patrol on the Red River levee's land side: the crest walked, wet spots on the land side flagged, and a throw line kept ready near the water."),
    site("ldf-commissioning-office", "Commissioning Office", "office", [500, 500], ["ibew", "ua", "ifpte"], ["stationary-engineer", "wind-and-data-infrastructure"], ["se-building-automation-alarm-triage", "ws-crah-alarm-response-in-a-live-hall", "arc-flash-label-study"], "The office that proves each system before it carries load: alarm triage on the automation screens, a live-hall drill and the labels walked."),
  ];
  const S = Object.fromEntries(sites.map((s) => [s.id, s]));
  emit("np-data-la-delta-forge-rapides.js", "NP_LA_DELTA_FORGE_RAPIDES", [
    "Delta Forge campus near Boyce — a Louisiana development site on the parish schema (console SITES-NORTH, docs/consoles/SITES-NORTH.md,",
    "docs/parishes.md). A stylised 4096 m map, not a survey: Boyce, the Red River, the interstate and the state highway appear only by",
    "their public names as places; every coordinate is approximate (three decimals, `approximate: true`) and exists only to place the map.",
    "One north-up uniform scale (three real metres per map metre, x east, +z south). The levees' lines, Bayou Rapides's",
    "course, the lake's outline, the pine hills' rise and every building and site are PROCEDURAL; the project layout is ILLUSTRATIVE (no",
    "site plan is published): " + LAYOUT + ".",
    S2,
    "The project, as the facts file states it: Applied Digital's Delta Forge 1 AI factory campus, Rapides Parish (near Boyce, Central",
    "Louisiana), $3.6 billion, ~300 acres and 300 MW; 200 direct full-time jobs, 218 indirect (418 total); 1,000+ construction jobs at peak;",
    "operations mid-2027 — sources: opportunitylouisiana.gov news; applieddigital.com. A trade reference only: the platform has no",
    "partnership with the company; the sites teach the trades' practice from the catalog's sourced stations. Pure data, no imports.",
  ], {
    id: P, name: "Delta Forge Campus near Boyce", region: "louisiana-sites", size: 4096, scale: 3,
    blurb: `Rapides Parish in Central Louisiana, near Boyce on the Red River, where an AI factory campus is being built south of the interstate: site grading, steel erection, the electrical room, network cabling and the cooling plant. ${LAYOUT[0].toUpperCase()}${LAYOUT.slice(1)}.`,
    start: "ldf-workforce-centre",
    anchors: [
      anchor(f, "Boyce", [-92.668, 31.39]),
      anchor(f, "the Red River north of Boyce", [-92.668, 31.397]),
      anchor(f, "the Red River east of Boyce", [-92.625, 31.376]),
      anchor(f, "the interstate south-east of Boyce", [-92.62, 31.37]),
      anchor(f, "the interstate north-west of Boyce", [-92.7, 31.398]),
      anchor(f, "the Red River upstream of Boyce", [-92.695, 31.424]),
    ],
    hills: [
      { id: "pine-hills-south-west", name: "the pine hills rising to the south-west (procedural)", center: [-1600, 1600], radius: 700, height: 20 },
    ],
    water: [
      { id: "red-river", name: "the Red River", kind: "river", width: 80, poly: RED },
      { id: "red-river-oxbow", name: "an old bend of the Red River (oxbow lake)", kind: "lake", poly: [[614, -358], [819, -435], [1075, -410], [1178, -282], [1101, -128], [973, -205], [819, -256], [666, -205]] },
      { id: "bayou-rapides", name: "Bayou Rapides (course procedural)", kind: "bayou", width: 16, poly: [[-358, 205], [-435, 614], [-205, 973], [307, 1229], [819, 1536], [1229, 2048]] },
      { id: "lake-west-of-boyce", name: "a lake west of Boyce (procedural outline)", kind: "lake", poly: [[-2048, -358], [-1741, -307], [-1638, 0], [-1741, 256], [-2048, 307]] },
      { id: "site-stormwater-pond", name: "the site stormwater pond (illustrative)", kind: "lake", poly: [[1450, 1480], [1750, 1480], [1750, 1700], [1450, 1700]] },
    ],
    levees: [
      { id: "red-river-south-levee", name: "the Red River levee, south-west bank", height: 4, pts: offsetLine(RED, 120) },
      { id: "red-river-north-levee", name: "the Red River levee, north-east bank", height: 4, pts: offsetLine(RED, -120).filter((q) => q[0] < 560 || q[0] > 1250) },
      { id: "pond-berm", name: "the stormwater pond berm (illustrative)", height: 2, pts: [[1440, 1470], [1760, 1470], [1760, 1710]] },
    ],
    roads: [
      { id: "interstate-forty-nine", name: "Interstate Forty-Nine", kind: "interstate", pts: [[-2048, -1101], [-1024, -282], [154, 164], [1126, 512], [2048, 768]] },
      { id: "louisiana-highway-one", name: "Louisiana Highway One", kind: "avenue", pts: [[-2048, -1250], [-1100, -500], [-400, -230], [200, -20], [640, 330]] },
      { id: "levee-road", name: "the levee road (procedural)", kind: "riverroad", pts: offsetLine(RED, 170).filter((q) => q[0] < 500) },
      { id: "campus-access-road", name: "the campus access road (illustrative)", kind: "avenue", pts: [[250, 200], [300, 480], [800, 800], [1450, 1250]] },
      { id: "campus-cross-road", name: "the campus cross road (illustrative)", kind: "street", pts: [[450, 400], [1650, 1000]] },
      { id: "boyce-main-street", name: "Boyce's main street (procedural grid)", kind: "street", pts: [[-560, -250], [-120, -40]] },
    ],
    districts: [
      { id: "boyce", name: "Boyce", character: "suburb", poly: [[-700, -450], [0, -450], [0, 60], [-700, 60]] },
      { id: "delta-forge-campus", name: "the AI factory campus (illustrative)", character: "industrial", poly: [[200, 350], [1700, 780], [1700, 1500], [900, 1400], [300, 1100], [200, 600]] },
      { id: "river-side-fields", name: "the fields along the river (procedural)", character: "garden", poly: [[-1600, -900], [-700, -600], [-700, -450], [-1600, -700]] },
      { id: "far-bank-fields", name: "the Red River's far bank (procedural fields and woods)", character: "garden", poly: [[-1000, -2048], [2048, -2048], [2048, 200], [600, -500], [-600, -900], [-1000, -1300]] },
      { id: "fields-south", name: "the fields south of the interstate (procedural)", character: "garden", poly: [[-1400, 200], [200, 700], [300, 1150], [900, 1450], [900, 2048], [-1400, 2048]] },
      { id: "pine-hills-edge", name: "the pine hills' edge (procedural)", character: "park", poly: [[-2048, 900], [-1400, 900], [-1400, 2048], [-2048, 2048]] },
    ],
    sites,
    landmarks: [
      { id: "illustrative-layout-sign", name: `a sign: ${LAYOUT}`, position: [250, 460], kind: "point" },
      { id: "boyce-place", name: "Boyce", position: [-420, -180], kind: "place" },
      { id: "red-river-bank", name: "the Red River bank at Boyce", position: [-305, -323], kind: "river" },
      { id: "red-river-levee-crest", name: "the Red River levee crest", position: [-590, -630], kind: "point" },
      { id: "interstate-overpass", name: "the interstate overpass by the campus", position: [154, 164], kind: "bridge" },
      { id: "bayou-rapides-bank", name: "the Bayou Rapides bank (course procedural)", position: [-470, 620], kind: "canal" },
      { id: "red-river-oxbow-shore", name: "the shore of the Red River's old bend", position: [900, -150], kind: "shore" },
      { id: "pine-hills", name: "the pine hills (procedural)", position: [-1600, 1600], kind: "hill" },
    ],
    connectors: [
      { id: "la-df-interstate-north-west", kind: "road", name: "Interstate Forty-Nine north-west toward Natchitoches", from: { parish: P, position: [-2040, -1095] }, to: { parish: "central-louisiana-north", position: null, lonlat: [-92.724, 31.415] }, lonlat: [-92.724, 31.415], approximate: true },
      { id: "la-df-interstate-alexandria", kind: "road", name: "Interstate Forty-Nine south-east toward Alexandria", from: { parish: P, position: [2040, 766] }, to: { parish: "central-louisiana-alexandria", position: null, lonlat: [-92.596, 31.364] }, lonlat: [-92.596, 31.364], approximate: true },
    ],
    fieldLessons: [
      { id: "la-ldf-fl-river-and-levee", title: "The River and Its Levee", site: "ldf-red-river-levee-patrol", landmark: "red-river-levee-crest", k12: "k12-by-how-a-levee-holds-water-back", station: "br-levee-inspection-and-seepage", trade: "Levee patrol crews", tradeLine: "A patrol walks the levee and looks for wet ground on the dry side, because seepage is the first sign of trouble.", minutes: 3, steps: ["Stand on the levee's land side and look up at the grassy crest.", "On the far side the Red River runs high after rain; the packed earth holds it back.", "The patrol looks for wet or bubbling ground on the dry side and reports it at once."], check: { q: "What does the levee patrol look for?", options: ["Wet or bubbling ground on the dry side", "Fish in the river", "Cars on the highway"], answer: 0, why: "Water pushing through a levee shows up as wet ground on the land side before anything else." } },
      { id: "la-ldf-fl-steel-frame", title: "How a Steel Frame Stands Up", site: "ldf-steel-erection", k12: "k12-simple-machines-at-a-crane", station: "steel-erector", trade: "Ironworkers", tradeLine: "An ironworker ties off before stepping to the edge, because a frame going up has open sides and no floor yet.", minutes: 3, steps: ["Look up at the columns standing in rows and the beams bolted between them.", "The crane lifts each beam; ironworkers guide it with tag lines and bolt it in place.", "Every worker at the edge wears a harness clipped to a line before they move."], check: { q: "What does an ironworker do before working at an open edge?", options: ["Clip a harness to a line", "Hold on with one hand", "Wait for the wind to stop"], answer: 0, why: "A harness clipped to a strong line stops a fall before it happens to the ground." } },
      { id: "la-ldf-fl-keeping-it-cool", title: "Keeping the Computers Cool", site: "ldf-cooling-plant", k12: "k12-water-cycle-and-filtration", station: "chiller-plant", trade: "Pipefitters", tradeLine: "A pipefitter tests every pipe with water pressure before the plant runs, because a leak near electrical gear is dangerous.", minutes: 3, steps: ["Find the big pipes running from the cooling towers to the halls.", "Cool water flows in, picks up the heat from the computers, and flows back out to the towers.", "Before it runs, the fitters fill the pipes and hold the pressure to prove there are no leaks."], check: { q: "Why are the cooling pipes tested before the plant runs?", options: ["To find leaks before water reaches electrical gear", "To make the pipes shiny", "To use up extra water"], answer: 0, why: "Water and electricity must stay apart, so every joint is proven tight first." } },
    ],
    gated: [
      gate("la-ldf-gated-topping-out", "Topping Out the Frame", P, S["ldf-steel-erection"], "Set the last beam on a campus building with the ironworkers.", ["steel-erector", "rl-critical-lift-plan-and-signalperson"], "Finish the steel erector and critical lift stations before the last beam"),
      gate("la-ldf-gated-energise-gear", "Energising the Switchgear", P, S["ldf-electrical-room"], "Help the electricians prove the gear and energise the room.", ["arc-flash-label-study", "motor-control-center"], "Walk the arc flash label and motor control centre stations before the gear is energised"),
    ],
  });
}

// ---------------------------------------------------------------------------------------------------------------------------
// 3. la-shintech-plaquemine — Plaquemine, Iberville Parish, on the Mississippi (Shintech's expansion, per the facts file).
{
  const f = frame([-91.24, 30.27], 3);
  const P = "la-shintech-plaquemine";
  const MS = [[2048, -1860], [1300, -1830], [614, -1745], [330, -1460], [210, -1050], [260, -720], [520, -460], [1024, -300], [1536, -250], [2048, -280]];
  const sites = [
    site("lsp-workforce-centre", "Plaquemine Workforce Centre", "campus", [-300, -250], ["ua", "ibew", "liuna"], ["job-readiness-edition", "plumbers-and-pipefitters"], ["jobsite-orientation-and-osha-10", "hazwoper-site-orientation", "apprenticeship-standards-reading", "union-hall-and-dispatch"], "The workforce centre on the edge of Plaquemine: site orientation, the plant-site hazard briefing and the apprenticeship board before the bus to the expansion."),
    site("lsp-gate-and-badging", "Gate and Badging", "office", [600, 230], ["spfpa", "teamsters"], ["situational-awareness", "hazmat-environmental"], ["hazwoper-site-orientation", "tdl-hazmat-labeling-and-segregation", "tdl-pretrip-inspection"], "The plant gate: badges, the site safety briefing, and every load's hazard placards checked before a truck rolls in."),
    site("lsp-process-unit-build", "Process Unit Build", "construction", [100, 700], ["ua", "ironworkers", "ibb"], ["plumbers-and-pipefitters", "insulators-and-boilermakers", "bridge-and-structural"], ["ib-pressure-vessel-confined-entry-and-hot-work", "steel-erector", "scaffold-erection", "cs-permit-entry-and-attendant-duties"], "A new process unit's structure and vessels going up: steel set, vessels entered only on a permit, and hot work watched. Process safety awareness only: the plant's own process is not taught here."),
    site("lsp-pipe-rack-crew", "Pipe Rack Crew", "construction", [350, 800], ["ua", "ironworkers", "iuoe"], ["plumbers-and-pipefitters", "rigging-lifting", "fall-protection"], ["rl-critical-lift-plan-and-signalperson", "leading-edge-and-horizontal-lifeline", "ib-hydrostatic-test-and-inspector-witness", "chain-hoist"], "The pipe rack that carries lines across the unit: spools lifted on a plan, fitters tied off on the rack, and every line pressure-tested before it is signed."),
    site("lsp-control-room", "Control Room Build-Out", "office", [400, 450], ["ibew", "ifpte"], ["electrical-first-period", "stationary-engineer"], ["motor-control-center", "arc-flash-label-study", "se-building-automation-alarm-triage"], "The control room's gear and screens being installed: panels torqued, arc-flash labels posted and the alarm screens tested before operators move in."),
    site("lsp-river-dock", "River Dock", "port", [1150, 60], ["ila", "siu", "iuoe"], ["port-operations", "rigging-lifting"], ["mooring-line", "dock-crane", "vessel-gangway-and-hatch-cover-safety", "yc-fuel-dock-transfer-and-spill-kit"], "The dock at the Mississippi levee east of town: barges moored with lines kept out of the snap-back zone, the dock crane's picks planned, and the spill kit by the transfer."),
    site("lsp-tank-farm", "Tank Farm", "chemical", [500, 1150], ["ua", "ibb", "iupat"], ["hazmat-environmental", "confined-space", "insulators-and-boilermakers"], ["tank-lining", "cs-ventilation-and-air-monitoring-plan", "drum-sampling-and-overpack", "ib-pressure-vessel-confined-entry-and-hot-work"], "New storage tanks inside their containment walls: shells welded, linings applied with the air tested and ventilated. Process safety awareness only: no product or process is described."),
    site("lsp-laydown-yard", "Laydown Yard", "staging", [-250, 1250], ["teamsters", "iuoe"], ["warehouse-and-logistics-automation", "rigging-lifting"], ["forklift-dock", "tdl-cargo-securement-and-hours", "crane-yard"], "Pipe spools, steel and valves staged for the unit: forklift lanes marked, loads strapped and every pick planned from the yard."),
    site("lsp-heavy-lift-crane-pad", "Heavy-Lift Crane Pad", "construction", [-150, 600], ["iuoe", "ironworkers"], ["rigging-lifting", "heavy-equipment-operators"], ["op-crawler-crane-assembly-and-load-chart", "rl-critical-lift-plan-and-signalperson", "rigging-loft"], "The big crawler crane's mat for setting vessels: ground bearing checked, the critical lift plan signed, and the rigging inspected before the vessel leaves its saddles."),
    site("lsp-rail-yard", "Rail Spur Yard", "rail", [-700, 1100], ["smart-td", "bmwed", "teamsters"], ["railroad-crafts"], ["ra-blue-flag-protection-in-the-yard", "ra-roadway-worker-protection-and-job-briefing", "ra-switch-inspection-and-lubrication", "ra-hand-brake-and-securement-on-a-grade"], "The plant's rail spur west of the highway: blue flags up before anyone goes between cars, the job briefing, and hand brakes set on every car left standing."),
    site("lsp-electrical-substation", "Plant Substation", "substation", [100, 1300], ["ibew", "iuoe"], ["electrical-first-period", "energy-transition"], ["substation-switching", "ws-substation-switching-under-a-permit", "transformer-vault"], "The expansion's substation: switching under a permit, the transformer vault locked, and the boundary taped before any work."),
    site("lsp-insulation-crew", "Insulation Crew", "workshop", [150, 1000], ["insulators", "iupat"], ["insulators-and-boilermakers"], ["ib-mechanical-insulation-pipe-and-jacketing", "ib-firestop-and-fire-wrap-installation", "ib-asbestos-glovebag-removal-on-a-pipe"], "The insulators' shop and the lines they cover: pipe insulated and jacketed, fire wrap on the steel, and old lagging handled only by the glovebag method."),
    site("lsp-scaffold-yard", "Scaffold Yard", "yard", [-500, 520], ["carpenters", "liuna"], ["fall-protection", "builders-trades"], ["scaffold-erection", "fp-anchor-selection-and-rescue-plan", "masonry-silica-scaffold"], "The scaffold builders' yard: tubes and planks inspected, tags written for every scaffold, and the rescue plan ready before anyone climbs."),
    site("lsp-hydrotest-crew", "Hydrotest Crew", "utility", [650, 1450], ["ua", "ibb"], ["plumbers-and-pipefitters", "insulators-and-boilermakers"], ["ib-hydrostatic-test-and-inspector-witness", "pl-hydronic-boiler-piping-and-hydrotest", "pl-natural-gas-pressure-test-and-leak-check"], "The crew proving new lines and vessels with water pressure: the area barricaded, the gauges watched and the inspector witnessing before anything is signed off."),
    site("lsp-levee-crossing", "Levee Crossing", "levee", [1500, 80], ["liuna", "iuoe"], ["bay-restoration-maritime-underwater", "heavy-equipment-operators"], ["br-levee-inspection-and-seepage", "op-excavator-trench-and-utility-locate", "br-cold-water-immersion-and-mob-recovery"], "Where the dock's lines and road cross the Mississippi River levee east of town: the levee's crown kept whole, seepage watched, and a throw line kept ready on the river side."),
    site("lsp-emergency-response-station", "Emergency Response Station", "fire-station", [650, 650], ["iaff", "naemt"], ["first-responders", "hazmat-environmental"], ["hz-level-b-entry-and-scba-change-out", "decon-line", "structure-fire-sizeup", "triage-point"], "The site's emergency station: the brigade's suits and air, the decon line laid out, and drills run so everyone knows the muster point."),
    site("lsp-cooling-tower-build", "Cooling Tower Build", "construction", [-200, 900], ["carpenters", "ua", "ironworkers"], ["stationary-engineer", "fall-protection", "builders-trades"], ["cooling-tower", "formwork-shoring", "leading-edge-and-horizontal-lifeline"], "A cooling tower rising beside the unit: the basin formed and poured, the frame built with every worker tied off, and the fill set from inside a guarded deck."),
  ];
  const S = Object.fromEntries(sites.map((s) => [s.id, s]));
  emit("np-data-la-shintech-plaquemine.js", "NP_LA_SHINTECH_PLAQUEMINE", [
    "Plaquemine expansion site — a Louisiana development site on the parish schema (console SITES-NORTH, docs/consoles/SITES-NORTH.md,",
    "docs/parishes.md). A stylised 4096 m map, not a survey: Plaquemine, the Mississippi River, Bayou Plaquemine, the Plaquemine Lock and",
    "the state highway appear only by their public names as places; every coordinate is approximate (three decimals, `approximate: true`)",
    "and exists only to place the map. One north-up uniform scale (three real metres per map metre, x east, +z south). The river's bends,",
    "the levees' lines, the field canal, the town grid and every building and site are PROCEDURAL; the project layout is",
    "ILLUSTRATIVE (no site plan is published): " + LAYOUT + ".",
    S2,
    "The project, as the facts file states it: the Shintech expansion, Plaquemine, Iberville Parish (Capital Region), $3.4 billion; 163",
    "direct new jobs, 725 retained, 655 indirect (818 total new opportunities); first phase 2030 — sources: opportunitylouisiana.gov news;",
    "lailluminator.com; wafb.com 2026-03-05. A trade reference only: the platform has no partnership with the company. Process safety is",
    "taught as awareness from the catalog's sourced stations; the company's own process is never described. Pure data, no imports.",
  ], {
    id: P, name: "Plaquemine Expansion Site", region: "louisiana-sites", size: 4096, scale: 3,
    blurb: `Plaquemine in Iberville Parish on the Mississippi's west bank: the river and its levees, Bayou Plaquemine and the old lock, the town, and fields south of town where a chemical plant expansion is being built — the process unit, the pipe rack, the control room, the river dock and the tank farm (process safety awareness only). ${LAYOUT[0].toUpperCase()}${LAYOUT.slice(1)}.`,
    start: "lsp-workforce-centre",
    anchors: [
      anchor(f, "Plaquemine", [-91.235, 30.289]),
      anchor(f, "the Mississippi River off Plaquemine", [-91.233, 30.294]),
      anchor(f, "Bayou Plaquemine south-west of town", [-91.278, 30.256]),
      anchor(f, "the state highway south-east of Plaquemine", [-91.202, 30.23]),
      anchor(f, "the east bank inside the bend", [-91.2, 30.298]),
      anchor(f, "the state highway north of Plaquemine", [-91.251, 30.322]),
    ],
    hills: [],
    water: [
      { id: "mississippi-river", name: "the Mississippi River", kind: "river", width: 260, poly: MS },
      { id: "bayou-plaquemine", name: "Bayou Plaquemine", kind: "bayou", width: 26, poly: [[-2048, 870], [-1540, 700], [-1000, 340], [-700, 0], [-360, -560], [-100, -760], [20, -840]] },
      { id: "west-field-canal", name: "a field drainage canal west of town (procedural)", kind: "canal", width: 12, poly: [[-2048, -1200], [-1300, -1100], [-800, -1300], [-600, -2048]] },
    ],
    levees: [
      { id: "west-bank-levee", name: "the Mississippi River levee, town side", height: 5, pts: offsetLine(MS, -190) },
      { id: "east-bank-levee", name: "the Mississippi River levee, inside the bend", height: 5, pts: offsetLine(MS, 190) },
    ],
    roads: [
      { id: "louisiana-highway-one", name: "Louisiana Highway One", kind: "avenue", pts: [[-410, -2048], [-260, -1500], [-170, -1000], [-100, -600], [250, -280], [650, 20], [1000, 860], [1485, 2048]] },
      { id: "west-bank-river-road", name: "the town-side River Road", kind: "riverroad", pts: offsetLine(MS, -235).filter((q) => q[1] < -1500 || q[0] > 700) },
      { id: "east-bank-river-road", name: "the River Road inside the bend", kind: "riverroad", pts: offsetLine(MS, 240) },
      { id: "plaquemine-main-street", name: "Plaquemine's main street (procedural grid)", kind: "street", pts: [[-520, -300], [-120, -560]] },
      { id: "south-town-street", name: "a town street south of the bayou (procedural)", kind: "street", pts: [[-560, -100], [150, -160]] },
      { id: "plant-access-road", name: "the plant access road (illustrative)", kind: "street", pts: [[-450, 380], [700, 330], [900, 500]] },
    ],
    districts: [
      { id: "plaquemine-town", name: "Plaquemine", character: "downtown", poly: [[-600, -1100], [-150, -1100], [-60, -640], [300, -300], [250, 0], [-600, 0]] },
      { id: "plaquemine-north", name: "north Plaquemine (procedural)", character: "suburb", poly: [[-600, -2048], [300, -2048], [0, -1500], [-150, -1100], [-600, -1100]] },
      { id: "east-bank-point", name: "the east bank inside the bend (procedural fields)", character: "garden", poly: [[560, -1330], [1300, -1600], [2048, -1620], [2048, -520], [1060, -520], [640, -660], [480, -800]] },
      { id: "plant-expansion", name: "the plant expansion (illustrative)", character: "industrial", poly: [[-600, 300], [700, 280], [1000, 860], [1250, 1600], [-600, 1600]] },
      { id: "river-dock", name: "the river dock at the levee (illustrative)", character: "port", poly: [[900, -60], [1400, -30], [1400, 180], [900, 180]] },
      { id: "south-east-fields", name: "the fields south-east of town (procedural)", character: "garden", poly: [[1050, 200], [2048, 150], [2048, 2048], [1485, 2048], [1000, 860]] },
      { id: "west-fields", name: "the fields west of town (procedural)", character: "garden", poly: [[-2048, -2048], [-600, -2048], [-600, 2048], [-2048, 2048]] },
    ],
    sites,
    landmarks: [
      { id: "illustrative-layout-sign", name: `a sign: ${LAYOUT}`, position: [480, 250], kind: "point" },
      { id: "plaquemine-place", name: "Plaquemine", position: [-150, -400], kind: "place" },
      { id: "plaquemine-lock", name: "the Plaquemine Lock", position: [-20, -870], kind: "canal" },
      { id: "mississippi-west-bank", name: "the Mississippi's bank at Plaquemine", position: [125, -655], kind: "river" },
      { id: "bayou-plaquemine-bank", name: "the Bayou Plaquemine bank", position: [-640, 40], kind: "canal" },
      { id: "west-field-canal-bank", name: "the field canal bank (procedural)", position: [-1300, -1040], kind: "canal" },
      { id: "east-bank-place", name: "the east bank inside the bend", position: [1280, -1024], kind: "shore" },
    ],
    connectors: [
      { id: "la-sp-highway-one-north", kind: "road", name: "Louisiana Highway One north toward Port Allen and Baton Rouge", from: { parish: P, position: [-410, -2040] }, to: { parish: "capital-region-west-bank", position: null, lonlat: [-91.253, 30.325] }, lonlat: [-91.253, 30.325], approximate: true },
      { id: "la-sp-highway-one-south", kind: "road", name: "Louisiana Highway One south along the river parishes", from: { parish: P, position: [1480, 2040] }, to: { parish: "capital-region-south", position: null, lonlat: [-91.194, 30.215] }, lonlat: [-91.194, 30.215], approximate: true },
    ],
    fieldLessons: [
      { id: "la-lsp-fl-river-levee", title: "The Great River's Levee", site: "lsp-levee-crossing", landmark: "mississippi-west-bank", k12: "k12-by-how-a-levee-holds-water-back", station: "br-levee-inspection-and-seepage", trade: "Levee crews", tradeLine: "A levee crew keeps the crown whole where pipes and roads cross it, because a weak spot can let the river through.", minutes: 3, steps: ["Climb the road onto the levee and look at the wide brown river beyond it.", "The levee is packed earth; it keeps the high river out of the town and the plant.", "Where a road or pipe crosses, the crew checks the ground after every high river for wet spots."], check: { q: "Why does a crew check the levee where pipes cross it?", options: ["A crossing can become a weak spot for water", "To count the barges", "To paint the pipes"], answer: 0, why: "Anything that cuts through a levee must be watched so the river cannot find a path." } },
      { id: "la-lsp-fl-reading-labels", title: "Reading a Hazard Label", site: "lsp-gate-and-badging", k12: "k12-reading-instructions-and-safety-labels", station: "tdl-hazmat-labeling-and-segregation", trade: "Truck drivers and gate staff", tradeLine: "A driver and the gate check every hazard placard, because the label tells everyone what is inside and how to stay safe.", minutes: 3, steps: ["Look at the diamond-shaped placards on the trucks waiting at the gate.", "Each colour and picture tells what kind of hazard the load carries.", "The gate checks the label against the paperwork before the truck may drive in."], check: { q: "What does a hazard placard tell you?", options: ["What kind of danger the load has", "Who owns the truck", "How fast the truck can go"], answer: 0, why: "Placards warn workers and responders what is inside so they can act safely." } },
      { id: "la-lsp-fl-barges-on-the-river", title: "Barges on the River", site: "lsp-river-dock", k12: "k12-by-the-rivers-current-and-a-pilots-job", station: "mooring-line", trade: "Dock workers and deckhands", tradeLine: "A deckhand stays out of the snap-back zone when mooring, because a line under load can whip back if it parts.", minutes: 3, steps: ["Watch the barges tied up along the dock and the river flowing past them.", "The current pushes on the barges, so thick lines hold them to the dock.", "The crew stands clear of the lines' path when they are pulled tight."], check: { q: "Where should a deckhand stand when a mooring line is pulled tight?", options: ["Out of the line's snap-back path", "Right beside the line", "On top of the line"], answer: 0, why: "A tight line that breaks whips back hard, so the crew stays out of its path." } },
    ],
    gated: [
      gate("la-lsp-gated-vessel-set", "Setting the First Vessel", P, S["lsp-heavy-lift-crane-pad"], "Help the heavy-lift crew set a vessel on its foundation.", ["op-crawler-crane-assembly-and-load-chart", "rl-critical-lift-plan-and-signalperson"], "Finish the crawler crane and critical lift stations before the vessel is set"),
      gate("la-lsp-gated-hydrotest", "Proving the Lines", P, S["lsp-hydrotest-crew"], "Hydrotest a new line with the fitters and the inspector.", ["ib-hydrostatic-test-and-inspector-witness", "scaffold-erection"], "Walk the hydrostatic test and scaffold stations before the test"),
    ],
  });
}
