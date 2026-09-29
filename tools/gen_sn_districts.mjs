#!/usr/bin/env node
// NEIGHBORHOODS (console `sn`, docs/consoles/NEIGHBORHOODS.md): writes the three walkable San Francisco districts —
// sf-north-beach, sf-haight-castro, sf-sunset-south — as pure-literal parish modules, from approximate public
// lon/lat through one north-up uniform scale per district, and adds the mirror connectors to the coarse districts.
// Run once; the modules are the source of truth afterwards (edit them directly). Places are named, never described
// with figures; everything procedural (the crews, the site names) is a training place, not a real business.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR", "shared");
const M_LAT = 111320;
const HALF = 2048;

function frame(lon0, lat0, scale) {
  const mLon = M_LAT * Math.cos((lat0 * Math.PI) / 180);
  const clamp = (v) => Math.max(-HALF, Math.min(HALF, v));
  const xz = ([lon, lat]) => [Math.round(((lon - lon0) * mLon) / scale), Math.round((-(lat - lat0) * M_LAT) / scale)];
  const xzc = (ll) => xz(ll).map(clamp);
  return { xz, xzc, m: (metres) => Math.round(metres / scale) };
}

const S = {
  harbour: { trades: ["ibu", "sup", "ilwu"], programmes: ["ports-maritime-ecology", "yacht-and-charter-crew"], stations: ["mooring-line", "yc-line-handling-and-docking-in-crosswind", "yc-fuel-dock-transfer-and-spill-kit", "yc-engine-room-pre-start-and-bilge-check", "spill-boom-deploy"] },
  seafood: { trades: ["ufcw", "unite-here", "teamsters"], programmes: ["grocery-and-meatpacking", "culinary-kitchen"], stations: ["receiving-dock-food", "walk-in-cooler", "gr-produce-receiving-cold-chain-and-pallet-jack", "gr-ammonia-leak-alarm-response-cold-plant"] },
  pier: { trades: ["ila", "ilwu", "iuoe"], programmes: ["port-operations", "rigging-lifting"], stations: ["mooring-line", "vessel-gangway-and-hatch-cover-safety", "pt-dock-fender-and-bollard-inspection", "forklift-dock"] },
  cablecar: { trades: ["atu", "iam", "ibew"], programmes: ["transit-ramp", "railroad-crafts"], stations: ["track-access", "signal-cabinet", "ra-hand-brake-and-securement-on-a-grade", "ra-roadway-worker-protection-and-job-briefing"] },
  line: { trades: ["atu", "twu", "ibew"], programmes: ["transit-ramp", "railroad-crafts"], stations: ["track-access", "signal-cabinet", "ra-crossing-signal-maintenance-and-flagging", "ra-switch-inspection-and-lubrication"] },
  transit: { trades: ["atu", "twu", "ibew"], programmes: ["transit-ramp", "railroad-crafts"], stations: ["track-access", "signal-cabinet", "ra-roadway-worker-protection-and-job-briefing", "tr-wheelchair-lift-and-securement-on-a-bus"] },
  school: { trades: ["aft", "csea", "seiu"], programmes: ["education-support-staff", "k12-literacy-and-life-skills"], stations: ["ed-playground-equipment-inspection", "ed-crossing-guard-intersection-control", "k12-reading-instructions-and-safety-labels", "ed-kitchen-receiving-and-warewash-sanitizing"] },
  restaurant: { trades: ["unite-here"], programmes: ["culinary-kitchen", "bartending-course"], stations: ["kitchen", "knife-skills", "hood-suppression", "bar-well-setup", "grease-trap"] },
  kitchen: { trades: ["unite-here"], programmes: ["culinary-kitchen"], stations: ["kitchen-gas-shutoff", "fryer-oil-change", "dish-pit", "prep-cooling", "slicer-lockout"] },
  hotel: { trades: ["unite-here", "seiu"], programmes: ["hotel-workers", "culinary-kitchen"], stations: ["housekeeping-room-turn", "hw-housekeeping-cart-and-chemical-safety", "hw-banquet-room-flip-and-staging", "laundry-plant-chemicals"] },
  clinic: { trades: ["nnu", "seiu", "afscme"], programmes: ["healthcare-support", "first-responders"], stations: ["hc-patient-transport-and-safe-handling", "hc-environmental-services-isolation-room-turnover", "triage-point", "hc-workplace-violence-deescalation-at-the-desk"] },
  hospital: { trades: ["nnu", "seiu", "afscme", "ua"], programmes: ["healthcare-support", "first-responders", "plumbers-and-pipefitters"], stations: ["hc-patient-transport-and-safe-handling", "hc-code-response-support-and-crash-cart-check", "hc-sterile-processing-decontamination-and-assembly", "pl-medical-gas-brazing-and-purge", "triage-point"] },
  fire: { trades: ["iaff", "naemt"], programmes: ["first-responders", "fall-protection"], stations: ["structure-fire-sizeup", "aerial-ladder", "firefighter-rehab-sector", "ambulance-scene-safety"] },
  fireWui: { trades: ["iaff", "naemt"], programmes: ["first-responders"], stations: ["wildland-urban-interface", "structure-fire-sizeup", "cardiac-arrest-pit-crew", "ambulance-scene-safety"] },
  grounds: { trades: ["afscme", "liuna", "seiu"], programmes: ["grounds-and-landscaping"], stations: ["gk-tree-work-pole-saw-and-drop-zone", "gk-string-trimmer-and-blower-ppe-and-bystander-zone", "gk-irrigation-controller-valve-box-and-backflow-check", "gk-chainsaw-start-and-limbing-on-the-ground"] },
  forestry: { trades: ["afscme", "liuna"], programmes: ["grounds-and-landscaping", "first-responders"], stations: ["gk-tree-work-pole-saw-and-drop-zone", "gk-chainsaw-start-and-limbing-on-the-ground", "gk-storm-cleanup-chipper-and-traffic-control", "wildland-urban-interface"] },
  golf: { trades: ["afscme", "liuna", "iuoe"], programmes: ["grounds-and-landscaping"], stations: ["gk-greens-mowing-and-hole-changing", "gk-bunker-renovation-and-drainage", "gk-pesticide-and-fertilizer-application-per-the-label", "gk-irrigation-controller-valve-box-and-backflow-check"] },
  dunes: { trades: ["afscme", "liuna"], programmes: ["marine-ecology-and-restoration", "grounds-and-landscaping"], stations: ["me-shoreline-debris-and-microplastics-survey", "me-invasive-species-identification-and-reporting", "gk-string-trimmer-and-blower-ppe-and-bystander-zone", "gk-storm-cleanup-chipper-and-traffic-control"] },
  renovation: { trades: ["carpenters", "ua", "insulators", "ibew"], programmes: ["plumbers-and-pipefitters", "insulators-and-boilermakers", "roofers-and-waterproofers"], stations: ["ib-asbestos-glovebag-removal-on-a-pipe", "pl-water-heater-and-tpr-valve-replacement", "rf-skylight-and-hatch-guarding", "pl-natural-gas-pressure-test-and-leak-check"] },
  victorian: { trades: ["carpenters", "iupat", "opcmia"], programmes: ["builders-trades", "cement-masons-and-plasterers", "roofers-and-waterproofers"], stations: ["paint-sprayer", "scaffold-erection", "masonry-silica-scaffold", "cm-exterior-plaster-scratch-brown-and-finish-coats", "rf-roof-tear-off-and-debris-chute"] },
  repaint: { trades: ["iupat", "carpenters"], programmes: ["builders-trades", "fall-protection"], stations: ["paint-sprayer", "scaffold-erection", "masonry-silica-scaffold", "leading-edge-and-horizontal-lifeline"] },
  jackson: { trades: ["carpenters", "ua", "opcmia"], programmes: ["roofers-and-waterproofers", "plumbers-and-pipefitters", "cement-masons-and-plasterers"], stations: ["rf-roof-tear-off-and-debris-chute", "pl-copper-press-and-solder-rough-in", "ib-asbestos-glovebag-removal-on-a-pipe", "cm-exterior-plaster-scratch-brown-and-finish-coats"] },
  build: { trades: ["carpenters", "liuna", "ironworkers", "opcmia"], programmes: ["builders-trades"], stations: ["concrete-pour", "formwork-shoring", "bt-rebar-tying-and-impalement-protection", "mass-timber-panel-set"] },
  seawall: { trades: ["uwua", "liuna", "afscme"], programmes: ["water-and-gas-utility-crews", "confined-space"], stations: ["stormwater-outfall", "pl-underground-sewer-lateral-and-trench-shoring", "manhole-entry-and-atmospheric-monitoring", "ut-night-storm-response-crew-and-portable-generator"] },
  water: { trades: ["uwua", "iuoe", "afscme"], programmes: ["water-and-gas-utility-crews", "confined-space"], stations: ["valve-vault", "cs-permit-entry-and-attendant-duties", "ut-water-treatment-chemical-delivery-unloading", "lift-station"] },
  pump: { trades: ["iuoe", "uwua", "afscme"], programmes: ["water-and-gas-utility-crews", "confined-space"], stations: ["lift-station", "stormwater-outfall", "valve-vault", "cs-permit-entry-and-attendant-duties"] },
  stage: { trades: ["iatse"], programmes: ["live-events", "screen-and-media-crafts"], stations: ["stage-power", "fly-system", "rigging-loft", "le-followspot-and-truss-access-at-height", "md-theatre-fly-floor-and-quick-change-lane"] },
  outdoorStage: { trades: ["iatse"], programmes: ["live-events"], stations: ["stage-power", "rigging-loft", "stage-load-in-and-truss-rigging", "le-crowd-barricade-and-show-stop-call"] },
  lifeguard: { trades: ["iaff", "afscme"], programmes: ["first-responders", "bay-restoration-maritime-underwater"], stations: ["br-cold-water-immersion-and-mob-recovery", "yc-man-overboard-recovery-drill", "cardiac-arrest-pit-crew", "ambulance-scene-safety"] },
  plant: { trades: ["aaup", "afscme", "seiu", "ibew"], programmes: ["stationary-engineer", "education-support-staff", "property-management"], stations: ["chiller-plant", "boiler-room", "ed-science-lab-chemical-storage-and-eyewash", "pm-fire-alarm-panel-room"] },
  grocery: { trades: ["ufcw", "teamsters"], programmes: ["grocery-and-meatpacking"], stations: ["gr-produce-receiving-cold-chain-and-pallet-jack", "gr-night-stocking-baler-and-compactor-lockout", "gr-deli-slicer-sanitation-and-allergen-line", "gr-checkstand-ergonomics-and-robbery-prevention"] },
};

const site = (id, name, kind, ll, set, blurb) => ({ id, name, kind, ll, ...S[set], blurb });

// ------------------------------------------------------------------ the three districts (approximate lon/lat)
const D = [
  {
    id: "sf-north-beach", exp: "NP_SF_NORTH_BEACH", name: "North Beach, Chinatown & Fisherman's Wharf", lon0: -122.410, lat0: 37.802, scale: 1,
    blurb: "San Francisco's north-east corner on foot: Telegraph Hill and Coit Tower over North Beach, Chinatown's lanes, the wharf's fishing fleet and piers, and the cable cars climbing Russian Hill and Nob Hill.",
    start: "columbus-restaurant-row",
    anchors: [["Coit Tower", -122.406, 37.802], ["the Transamerica Pyramid", -122.403, 37.795], ["Washington Square", -122.410, 37.801], ["Portsmouth Square", -122.405, 37.795], ["Pier Thirty-Nine", -122.410, 37.809], ["Aquatic Park", -122.422, 37.807], ["Lombard Street's switchbacks", -122.419, 37.802], ["the Ferry Building", -122.394, 37.796], ["Ghirardelli Square", -122.423, 37.806]],
    hills: [["telegraph-hill", "Telegraph Hill", -122.406, 37.802, 250, 40], ["russian-hill", "Russian Hill", -122.418, 37.801, 300, 45], ["nob-hill", "Nob Hill", -122.414, 37.792, 320, 45]],
    water: [
      { id: "san-francisco-bay", name: "San Francisco Bay", kind: "bay", ll: [[-122.45, 37.8075], [-122.4255, 37.808], [-122.421, 37.8085], [-122.417, 37.809], [-122.413, 37.809], [-122.409, 37.810], [-122.405, 37.8095], [-122.401, 37.8065], [-122.398, 37.803], [-122.396, 37.7995], [-122.3935, 37.797], [-122.391, 37.793], [-122.389, 37.789], [-122.38, 37.786], [-122.38, 37.83], [-122.45, 37.83]] },
      { id: "aquatic-park-cove", name: "the cove at Aquatic Park", kind: "bay", ll: [[-122.4245, 37.8079], [-122.4215, 37.8076], [-122.4195, 37.8082], [-122.4195, 37.8095], [-122.4245, 37.8095]] },
      { id: "wharf-lagoon", name: "the fishing fleet's lagoon at the wharf", kind: "bay", ll: [[-122.4178, 37.8084], [-122.4150, 37.8083], [-122.4140, 37.8095], [-122.4180, 37.8098]] },
    ],
    levees: [["embarcadero-seawall", "the Embarcadero seawall", 3.5, [[-122.4045, 37.8086], [-122.4005, 37.8058], [-122.3975, 37.8023], [-122.3955, 37.7992], [-122.393, 37.7962], [-122.3905, 37.7925], [-122.3888, 37.789]]], ["aquatic-park-seawall", "the seawall along Aquatic Park", 3, [[-122.4262, 37.8072], [-122.4240, 37.8074], [-122.4218, 37.8071]]]],
    roads: [
      ["the-embarcadero", "the Embarcadero", "avenue", [[-122.4135, 37.8079], [-122.409, 37.8083], [-122.405, 37.8080], [-122.402, 37.8053], [-122.399, 37.8020], [-122.397, 37.7988], [-122.3948, 37.796], [-122.3925, 37.7922], [-122.3905, 37.7882], [-122.3875, 37.7855]]],
      ["columbus-avenue", "Columbus Avenue", "avenue", [[-122.4045, 37.7955], [-122.4085, 37.7990], [-122.4135, 37.8030], [-122.4175, 37.8062]]],
      ["grant-avenue", "Grant Avenue", "street", [[-122.4058, 37.7880], [-122.4063, 37.7950], [-122.4072, 37.8030]]],
      ["stockton-street", "Stockton Street", "street", [[-122.4068, 37.7850], [-122.4082, 37.7960], [-122.4105, 37.8045]]],
      ["powell-street", "Powell Street and its cable car line", "street", [[-122.4078, 37.7850], [-122.4100, 37.7960], [-122.4125, 37.8050]]],
      ["hyde-street", "Hyde Street and its cable car line", "street", [[-122.4165, 37.7900], [-122.4185, 37.8000], [-122.4202, 37.8062]]],
      ["broadway", "Broadway", "avenue", [[-122.4330, 37.7960], [-122.4150, 37.7973], [-122.4050, 37.7978], [-122.3995, 37.7985]]],
      ["lombard-street", "Lombard Street", "street", [[-122.4330, 37.8003], [-122.4200, 37.8020], [-122.4100, 37.8030]]],
      ["jefferson-street", "Jefferson Street along the wharf", "street", [[-122.4225, 37.8068], [-122.4180, 37.8072], [-122.4120, 37.8076]]],
    ],
    districts: [["north-beach", "North Beach", "quarter", [-122.4135, 37.7975, -122.4045, 37.8045]], ["chinatown", "Chinatown", "quarter", [-122.4105, 37.7900, -122.4040, 37.7975]], ["fishermans-wharf", "Fisherman's Wharf", "port", [-122.4230, 37.8045, -122.4070, 37.8085]], ["telegraph-hill", "Telegraph Hill", "garden", [-122.4080, 37.7985, -122.4010, 37.8060]], ["russian-hill", "Russian Hill", "garden", [-122.4240, 37.7960, -122.4135, 37.8045]], ["jackson-square", "Jackson Square and the Financial District's edge", "downtown", [-122.4045, 37.7860, -122.3960, 37.7985]], ["nob-hill", "Nob Hill", "garden", [-122.4200, 37.7860, -122.4105, 37.7960]], ["the-embarcadero-waterfront", "the Embarcadero waterfront", "port", [-122.4040, 37.7950, -122.3900, 37.8070]]],
    sites: [
      site("wharf-fishing-fleet", "the Wharf Fishing Fleet Berths", "marina", [-122.4185, 37.8076], "harbour", "The fishing boats' berths behind the wharf: lines in a crosswind, the fuel dock, the bilge check before the boats go out."),
      site("wharf-seafood-dock", "the Wharf Seafood Receiving Dock", "market", [-122.4138, 37.8066], "seafood", "Where the catch comes off the boats and into the cold room: pallet jacks, the cold chain and the alarm on the cooling plant."),
      site("embarcadero-pier-shed", "an Embarcadero Pier Shed", "port", [-122.4028, 37.8038], "pier", "A working pier shed on the waterfront: lines, gangways, fenders and the forklift lane."),
      site("hyde-street-cable-car-crew", "the Hyde Street Cable Car Crew", "streetcar", [-122.4196, 37.8052], "cablecar", "The crew at the top of the Hyde Street line: the grip, the track slot, and a car secured on a grade."),
      site("powell-street-cable-car-crew", "the Powell Street Cable Car Crew", "transit", [-122.4076, 37.7862], "line", "The crew at the foot of Powell Street where the cars turn: the switch, the crossing signals and the track slot."),
      site("washington-square-school", "a North Beach School Campus", "school", [-122.4118, 37.7993], "school", "A school by Washington Square: the playground check, the crossing guard's corner and the safety labels in the kitchen."),
      site("columbus-restaurant-row", "the Restaurant Row on Columbus Avenue", "hospitality", [-122.4090, 37.7983], "restaurant", "North Beach's row of kitchens and bars: the line, the hood, the bar well and the grease trap."),
      site("nb-chinatown-kitchens", "a Chinatown Restaurant Kitchen", "hospitality", [-122.4062, 37.7945], "kitchen", "A busy kitchen off Grant Avenue: the gas shut-off, the fryer oil change, the dish pit and the slicer lockout."),
      site("wharf-hotel-service", "a Wharf Hotel Service Floor", "hospitality", [-122.4165, 37.8055], "hotel", "A hotel floor above the wharf: room turns, the housekeeping cart, banquet flips and the laundry chemicals."),
      site("chinatown-community-clinic", "a Chinatown Community Clinic", "hospital", [-122.4088, 37.7924], "clinic", "A neighbourhood clinic: moving patients safely, turning over a room, triage and calm at the front desk."),
      site("north-beach-fire-station", "a North Beach Fire Station", "fire-station", [-122.4098, 37.8032], "fire", "A firehouse between the hills: size-up on narrow streets, the aerial ladder and rehab after a long call."),
      site("telegraph-hill-grounds", "the Telegraph Hill Grounds Crew", "park", [-122.4028, 37.7998], "grounds", "The crew that keeps the hill's gardens and steps: pole saws, trimmers and the irrigation boxes."),
      site("jackson-square-renovation", "a Jackson Square Renovation Site", "construction", [-122.4020, 37.7962], "jackson", "An old brick building being brought up to date: roof tear-off, new copper, lagged pipe and fresh plaster."),
      site("embarcadero-seawall-crew", "the Embarcadero Seawall Crew", "seawall", [-122.3998, 37.8008], "seawall", "The crew behind the seawall: storm outfalls, sewer laterals, manholes and the night storm call-out."),
    ],
    landmarks: [["coit-tower", "Coit Tower", "tower", -122.406, 37.802, "coit-tower"], ["transamerica-pyramid", "the Transamerica Pyramid", "tower", -122.4028, 37.7952, "transamerica-pyramid"], ["lombard-switchbacks", "Lombard Street's switchbacks", "switchbacks", -122.4187, 37.8021], ["hyde-street-turntable", "the cable car turntable at Hyde Street", "place", -122.4206, 37.8064, "cable-car-turntable"], ["powell-street-turntable", "the cable car turntable at Powell Street", "place", -122.4079, 37.7848, "cable-car-turntable"], ["hyde-street-cable-car", "a cable car on Hyde Street", "place", -122.4188, 37.8010, "cable-car"], ["pier-thirty-nine", "Pier Thirty-Nine", "place", -122.4098, 37.8084, "wharf-pier-shed"], ["washington-square", "Washington Square", "place", -122.4101, 37.8008], ["dragon-gate", "the gate at Grant Avenue", "gate", -122.4058, 37.7906], ["ferry-building", "the Ferry Building", "place", -122.3940, 37.7955, "ferry-building"], ["fishermans-wharf", "Fisherman's Wharf", "place", -122.4152, 37.8078]],
    connectors: [
      ["sf-nb-embarcadero-south", "road", "The Embarcadero south to the Ferry Building and Downtown", "sf-downtown", [-122.391, 37.788], "sf-dt-north-beach-embarcadero", "The Embarcadero north to Fisherman's Wharf and North Beach"],
      ["sf-nb-powell-south", "road", "Powell Street south to Union Square and Downtown", "sf-downtown", [-122.408, 37.785], "sf-dt-north-beach-powell", "Powell Street north to North Beach and the wharf"],
      ["sf-nb-bay-street-west", "road", "Bay Street west to Fort Mason and the Marina", "sf-marina", [-122.432, 37.805], "sf-ma-north-beach-bay-street", "Bay Street east to North Beach and the wharf"],
    ],
    lessons: [
      { id: "sn-fl-cable-car-grip", title: "How a Cable Car Climbs a Hill", site: "hyde-street-cable-car-crew", landmark: "hyde-street-turntable", k12: "k12-simple-machines-at-a-crane", station: "ra-hand-brake-and-securement-on-a-grade", trade: "Cable car crew", tradeLine: "A cable car crew grips a moving cable under the street and sets the brakes firmly before anyone steps off on a hill.", minutes: 3, steps: ["Look down at the slot between the rails in the street.", "A cable runs under it all day, and the car grips it to climb.", "On a steep street the crew sets the brakes before people step off."], check: { q: "Why does the crew set the brakes before people step off on a hill?", options: ["So the car cannot roll while people move", "So the bell rings louder", "So the car goes faster later"], answer: 0, why: "A car on a slope wants to roll; the brakes hold it still while people get on and off." } },
      { id: "sn-fl-cold-chain-catch", title: "Keeping the Catch Cold", site: "wharf-seafood-dock", k12: "k12-reading-instructions-and-safety-labels", station: "gr-produce-receiving-cold-chain-and-pallet-jack", trade: "Seafood dock crew", tradeLine: "A seafood dock crew moves the catch from boat to cold room quickly and reads every label on the way.", minutes: 3, steps: ["Watch the crates come off the boat onto the dock.", "The crew moves them into the cold room without waiting in the sun.", "Every crate has a label that says what it is and when it came in."], check: { q: "Why does the crew move the catch into the cold room quickly?", options: ["Cold keeps food safe to eat", "The crates are too heavy to leave", "The boat needs the dock back"], answer: 0, why: "Food stays safe when it stays cold from the boat to the kitchen." } },
      { id: "sn-fl-kitchen-hood", title: "The Hood Over the Stove", site: "columbus-restaurant-row", k12: "k12-fractions-in-the-kitchen", station: "hood-suppression", trade: "Line cooks", tradeLine: "A line cook keeps the hood and its filters clean and knows where the fire system's pull station is.", minutes: 2, steps: ["Find the big metal hood above the stove.", "It pulls smoke and grease up and away from the cooks.", "A clean filter and a clear pull station keep the kitchen safe."], check: { q: "What does the hood over the stove do?", options: ["It pulls smoke and grease away", "It keeps the food warm", "It holds the pans"], answer: 0, why: "The hood draws smoke and grease out so the kitchen stays clear and safer from fire." } },
    ],
    gated: [
      { id: "sn-nb-gated-fleet-dawn", kind: "side-quest", title: "Out With the Fleet at First Light", site: "wharf-fishing-fleet", siteName: "the Wharf Fishing Fleet Berths", gate: { stations: ["yc-line-handling-and-docking-in-crosswind"], note: "Learn to handle lines in a crosswind before you go out with the fleet" } },
      { id: "sn-nb-gated-turntable", kind: "side-quest", title: "Turn the Car at Hyde Street", site: "hyde-street-cable-car-crew", siteName: "the Hyde Street Cable Car Crew", gate: { stations: ["ra-hand-brake-and-securement-on-a-grade"], note: "Learn to secure a car on a grade before you help turn one on the table" } },
    ],
  },
  {
    id: "sf-haight-castro", exp: "NP_SF_HAIGHT_CASTRO", name: "Haight, Castro & Twin Peaks", lon0: -122.443, lat0: 37.763, scale: 1,
    blurb: "The hills at the city's middle on foot: Twin Peaks and Mount Sutro, Corona Heights and Buena Vista over rows of Victorian houses in the Haight and the Castro, the Market Street corridor and the park's east end.",
    start: "castro-station-transit",
    anchors: [["Alamo Square", -122.434, 37.776], ["the Castro Theatre", -122.435, 37.762], ["Buena Vista Park", -122.441, 37.768], ["Duboce Park", -122.433, 37.769], ["the corner of Haight and Ashbury", -122.447, 37.770], ["Kezar Stadium", -122.455, 37.767], ["Mission Dolores Park", -122.428, 37.760], ["Sutro Tower", -122.453, 37.755], ["Twin Peaks", -122.448, 37.753], ["Corona Heights", -122.438, 37.765]],
    hills: [["twin-peaks", "Twin Peaks", -122.4475, 37.7525, 450, 70], ["mount-sutro", "Mount Sutro", -122.4575, 37.7585, 350, 55], ["corona-heights", "Corona Heights", -122.438, 37.765, 150, 22], ["buena-vista", "Buena Vista", -122.441, 37.7685, 200, 30], ["tank-hill", "Tank Hill", -122.4475, 37.7605, 110, 14], ["alamo-square", "Alamo Square", -122.4345, 37.7765, 160, 14]],
    water: [
      { id: "laguna-honda-reservoir", name: "Laguna Honda Reservoir", kind: "lake", ll: [[-122.4611, 37.7524], [-122.4580, 37.7524], [-122.4578, 37.7507], [-122.4610, 37.7505]] },
      { id: "alvord-lake", name: "Alvord Lake", kind: "lake", ll: [[-122.4556, 37.7688], [-122.4548, 37.7688], [-122.4547, 37.7683], [-122.4556, 37.7682]] },
      { id: "lily-pond", name: "the Lily Pond in Golden Gate Park", kind: "lake", ll: [[-122.4585, 37.7718], [-122.4568, 37.7719], [-122.4566, 37.7712], [-122.4584, 37.7711]] },
    ],
    levees: [["laguna-honda-east-embankment", "the east embankment of Laguna Honda Reservoir", 3, [[-122.4575, 37.7527], [-122.4574, 37.7503]]], ["laguna-honda-south-embankment", "the south embankment of Laguna Honda Reservoir", 3, [[-122.4613, 37.7501], [-122.4577, 37.7500]]]],
    roads: [
      ["market-street", "Market Street", "avenue", [[-122.4200, 37.7738], [-122.4285, 37.7680], [-122.4350, 37.7628], [-122.4420, 37.7560], [-122.4520, 37.7470]]],
      ["haight-street", "Haight Street", "street", [[-122.4250, 37.7726], [-122.4380, 37.7710], [-122.4525, 37.7694]]],
      ["castro-street", "Castro Street", "street", [[-122.4362, 37.7695], [-122.4352, 37.7600], [-122.4345, 37.7470]]],
      ["divisadero-street", "Divisadero Street", "street", [[-122.4390, 37.7810], [-122.4380, 37.7715]]],
      ["the-panhandle-streets", "Fell and Oak Streets along the Panhandle", "avenue", [[-122.4250, 37.7755], [-122.4400, 37.7735], [-122.4530, 37.7718]]],
      ["twin-peaks-boulevard", "Twin Peaks Boulevard", "street", [[-122.4420, 37.7615], [-122.4455, 37.7560], [-122.4470, 37.7545]]],
      ["seventeenth-street", "Seventeenth Street", "street", [[-122.4205, 37.7632], [-122.4330, 37.7626], [-122.4430, 37.7620]]],
      ["stanyan-street", "Stanyan Street", "street", [[-122.4535, 37.7770], [-122.4535, 37.7650]]],
      ["church-street", "Church Street and its streetcar line", "street", [[-122.4290, 37.7720], [-122.4283, 37.7600], [-122.4275, 37.7470]]],
    ],
    districts: [["haight-ashbury", "Haight-Ashbury", "quarter", [-122.4535, 37.7660, -122.4420, 37.7740]], ["the-castro", "the Castro", "quarter", [-122.4400, 37.7560, -122.4290, 37.7660]], ["twin-peaks-slopes", "Twin Peaks", "park", [-122.4540, 37.7470, -122.4420, 37.7580]], ["cole-valley", "Cole Valley", "garden", [-122.4540, 37.7580, -122.4460, 37.7660]], ["duboce-triangle", "Duboce Triangle and the Lower Haight", "garden", [-122.4400, 37.7660, -122.4250, 37.7740]], ["golden-gate-park-east", "Golden Gate Park's east end", "park", [-122.4663, 37.7660, -122.4540, 37.7730]], ["alamo-square-rows", "the rows around Alamo Square", "garden", [-122.4420, 37.7740, -122.4250, 37.7814]], ["laguna-honda-slopes", "Forest Hill and the Laguna Honda slopes", "suburb", [-122.4663, 37.7446, -122.4540, 37.7580]]],
    sites: [
      site("alamo-square-victorian-row", "an Alamo Square Victorian Row Restoration", "construction", [-122.4318, 37.7752], "victorian", "A row of Victorian houses under restoration: scaffold up, the old paint stripped with care, a new roof and fresh plaster."),
      site("haight-victorian-renovation", "a Haight Victorian House Renovation", "construction", [-122.4462, 37.7712], "renovation", "An old house being made sound inside: lagged pipe removed by the book, a new water heater, the gas line tested."),
      site("castro-victorian-repaint", "a Castro Victorian Repaint", "construction", [-122.4378, 37.7592], "repaint", "A tall wooden front being repainted: the scaffold, the sprayer, dust control and a lifeline at the roof edge."),
      site("duboce-hospital-campus", "the Hospital Campus by Duboce Park", "hospital", [-122.4362, 37.7684], "hospital", "A hospital campus on the hill's shoulder: patient moves, code carts, sterile processing and the medical gas lines."),
      site("castro-station-transit", "the Castro Street Station Crew", "transit", [-122.4350, 37.7632], "transit", "The station under Market Street and the corridor above it: track access, the signal cabinet and the lift."),
      site("church-street-line-crew", "the Church Street Line Crew", "streetcar", [-122.4278, 37.7672], "line", "The streetcar line along Church Street: the switch, the crossing signals and the track slot on the hill."),
      site("castro-theatre-stage-crew", "the Castro's Theatre Stage Crew", "theatre", [-122.4338, 37.7608], "stage", "The crew behind the marquee: stage power, the fly system, the loft and the follow spot high on the truss."),
      site("golden-gate-park-east-crew", "the Golden Gate Park East End Crew", "park", [-122.4600, 37.7695], "grounds", "The park crew yard at the east end of the park: pole saws, trimmers and the irrigation boxes."),
      site("buena-vista-grounds", "the Buena Vista Grounds Crew", "park", [-122.4385, 37.7718], "forestry", "The crew on the wooded hill: tree work, the chipper on a steep road and a watch on dry brush."),
      site("haight-school-campus", "a Haight School Campus", "school", [-122.4498, 37.7665], "school", "A school in the Haight: the playground check, the crossing guard's corner and the kitchen's safety labels."),
      site("castro-restaurant-kitchens", "the Castro's Restaurant Kitchens", "hospitality", [-122.4318, 37.7634], "restaurant", "A row of kitchens and bars near the theatre: the line, the hood, the bar well and the grease trap."),
      site("cole-valley-fire-station", "a Cole Valley Fire Station", "fire-station", [-122.4505, 37.7640], "fireWui", "A firehouse under the forested hills: the wildland edge, size-up on steep streets and cardiac response."),
      site("mount-sutro-forest-crew", "the Mount Sutro Forest Crew", "forestry", [-122.4628, 37.7640], "forestry", "The forest crew at the foot of Mount Sutro: pole saws, chainsaws, storm clean-up and the wildland edge."),
      site("laguna-honda-valve-house", "the Laguna Honda Reservoir Valve House", "pump", [-122.4566, 37.7516], "water", "The valve house by the reservoir: the vault, a permit entry, the chemical delivery and the lift station."),
    ],
    landmarks: [["painted-ladies", "the Painted Ladies", "place", -122.4330, 37.7762, "painted-ladies"], ["castro-theatre-marquee", "the Castro's theatre marquee", "theatre-marquee", -122.4348, 37.7620], ["twin-peaks-summit", "the top of Twin Peaks", "hill", -122.4475, 37.7525], ["sutro-tower", "Sutro Tower", "mast", -122.4528, 37.7552], ["haight-ashbury-corner", "the corner of Haight and Ashbury", "place", -122.4468, 37.7700], ["corona-heights-outcrop", "the rock at Corona Heights", "hill", -122.4380, 37.7650], ["harvey-milk-plaza-flag", "the flag at Harvey Milk Plaza", "flag", -122.4352, 37.7625], ["kezar-stadium", "Kezar Stadium", "place", -122.4557, 37.7668], ["haight-victorian-house", "a Victorian house in the Haight", "place", -122.4450, 37.7708, "victorian-house"], ["castro-victorian-house", "a Victorian house in the Castro", "place", -122.4368, 37.7605, "victorian-house"]],
    connectors: [
      ["sf-hc-fell-street-west", "road", "Fell Street west into Golden Gate Park", "sf-golden-gate-park", [-122.454, 37.772], "sf-gp-haight-castro-fell", "Fell Street east to the Haight and the Castro"],
      ["sf-hc-market-street-east", "road", "Market Street east toward Church Street and the Mission", "sf-mission", [-122.422, 37.772], "sf-mi-haight-castro-market", "Market Street west to the Castro"],
      ["sf-hc-seventeenth-street-east", "road", "Seventeenth Street east to the Mission", "sf-mission", [-122.421, 37.763], "sf-mi-haight-castro-seventeenth", "Seventeenth Street west to the Castro"],
      ["sf-hc-divisadero-north", "road", "Divisadero Street north to Geary and the Western Addition", "sf-downtown", [-122.439, 37.781], "sf-dt-haight-castro-divisadero", "Divisadero Street south to the Haight"],
    ],
    lessons: [
      { id: "sn-fl-victorian-scaffold", title: "Why a Painter Builds a Scaffold", site: "castro-victorian-repaint", landmark: "haight-victorian-house", k12: "k12-slope-and-angles-on-a-ramp", station: "scaffold-erection", trade: "Painters", tradeLine: "A painter builds a level scaffold with rails before working high on a tall wooden house front.", minutes: 3, steps: ["Look up at the tall wooden front of the house.", "The painter builds a level scaffold with rails to stand on.", "A level base and full rails keep the painter from slipping or falling."], check: { q: "Why does the scaffold need rails and a level base?", options: ["So the painter cannot slip or fall", "So the paint dries faster", "So the house looks taller"], answer: 0, why: "Rails and a level base keep a worker steady and safe up high." } },
      { id: "sn-fl-streetcar-signal", title: "Signals on the Streetcar Line", site: "church-street-line-crew", k12: "k12-by-a-streetcar-timetable", station: "ra-crossing-signal-maintenance-and-flagging", trade: "Streetcar signal crew", tradeLine: "A streetcar signal crew keeps the lights at crossings working and flags traffic while they fix them.", minutes: 3, steps: ["Find the lights where the streetcar crosses a street.", "They tell cars and people when a streetcar is coming.", "When the crew fixes a light, a flagger guides traffic by hand."], check: { q: "What does a flagger do while the signal is being fixed?", options: ["Guides traffic safely by hand", "Drives the streetcar", "Sells tickets"], answer: 0, why: "Someone must still tell people when it is safe to cross while the light is off." } },
      { id: "sn-fl-reservoir-to-tap", title: "From the Reservoir to the Tap", site: "laguna-honda-valve-house", k12: "k12-by-the-water-cycle-from-lake-to-tap", station: "valve-vault", trade: "Water system operators", tradeLine: "A water operator opens and closes the big valves that send stored water down the hill to homes.", minutes: 3, steps: ["Look at the reservoir holding water on the hillside.", "Pipes carry the water downhill to homes and schools.", "Operators turn big valves in a vault to send it where it is needed."], check: { q: "Why is a reservoir often up on a hill?", options: ["Water can flow downhill to homes", "It is easier to swim in", "Hills are always wet"], answer: 0, why: "Water stored high flows down through the pipes to the taps below." } },
    ],
    gated: [
      { id: "sn-hc-gated-marquee", kind: "side-quest", title: "Light the Marquee With the Stage Crew", site: "castro-theatre-stage-crew", siteName: "the Castro's Theatre Stage Crew", gate: { stations: ["stage-power"], note: "Learn how the stage crew handles show power before you help light the marquee" } },
      { id: "sn-hc-gated-painted-row", kind: "side-quest", title: "Colour a Painted Row", site: "alamo-square-victorian-row", siteName: "an Alamo Square Victorian Row Restoration", gate: { stations: ["scaffold-erection"], note: "Learn to build a safe scaffold before you help colour a Victorian row" } },
    ],
  },
  {
    id: "sf-sunset-south", exp: "NP_SF_SUNSET_SOUTH", name: "the Sunset & Ocean Beach South", lon0: -122.4844, lat0: 37.7215, scale: 1.2,
    blurb: "The city's south-west corner on foot: Ocean Beach below the Sunset, the dunes and bluffs at Fort Funston, Lake Merced and its greens, Pine Lake and Stern Grove, the university campus, Stonestown and Merced Heights.",
    start: "sf-state-campus-plant",
    anchors: [["Lake Merced", -122.491, 37.727], ["Fort Funston", -122.502, 37.714], ["the university campus", -122.479, 37.723], ["Stonestown", -122.476, 37.728], ["Parkmerced", -122.482, 37.716], ["Pine Lake", -122.488, 37.737], ["the zoo", -122.503, 37.733], ["Merced Heights", -122.470, 37.718], ["Ocean Beach at Sloat Boulevard", -122.506, 37.735]],
    hills: [["merced-heights", "Merced Heights", -122.4700, 37.7175, 300, 30]],
    water: [
      { id: "pacific-ocean", name: "the Pacific Ocean off Ocean Beach", kind: "ocean", ll: [[-122.53, 37.76], [-122.5075, 37.76], [-122.5075, 37.7436], [-122.5070, 37.7355], [-122.5055, 37.7260], [-122.5040, 37.7180], [-122.5030, 37.7100], [-122.5010, 37.7030], [-122.4995, 37.68], [-122.53, 37.68]] },
      { id: "lake-merced", name: "Lake Merced", kind: "lake", ll: [[-122.4960, 37.7320], [-122.4895, 37.7335], [-122.4850, 37.7310], [-122.4845, 37.7265], [-122.4880, 37.7250], [-122.4930, 37.7255], [-122.4970, 37.7285]] },
      { id: "lake-merced-south", name: "Lake Merced's south arm", kind: "lake", ll: [[-122.4960, 37.7222], [-122.4905, 37.7212], [-122.4880, 37.7185], [-122.4890, 37.7140], [-122.4940, 37.7130], [-122.4970, 37.7165]] },
      { id: "pine-lake", name: "Pine Lake", kind: "lake", ll: [[-122.4895, 37.7372], [-122.4855, 37.7370], [-122.4853, 37.7361], [-122.4893, 37.7360]] },
    ],
    levees: [["great-highway-seawall", "the seawall along the Great Highway", 3.5, [[-122.5066, 37.7430], [-122.5061, 37.7340]]], ["lake-merced-embankment", "the embankment along Lake Merced's east shore", 2.5, [[-122.4838, 37.7320], [-122.4834, 37.7255]]]],
    roads: [
      ["great-highway", "the Great Highway", "avenue", [[-122.5052, 37.7436], [-122.5040, 37.7330]]],
      ["skyline-boulevard", "Skyline Boulevard", "avenue", [[-122.5040, 37.7330], [-122.5020, 37.7230], [-122.5006, 37.7130], [-122.4985, 37.7050], [-122.4970, 37.6995]]],
      ["sloat-boulevard", "Sloat Boulevard", "avenue", [[-122.5040, 37.7356], [-122.4900, 37.7356], [-122.4750, 37.7356]]],
      ["nineteenth-avenue", "Nineteenth Avenue", "avenue", [[-122.4752, 37.7436], [-122.4752, 37.7230], [-122.4722, 37.7100]]],
      ["ocean-avenue", "Ocean Avenue", "street", [[-122.4800, 37.7256], [-122.4650, 37.7242], [-122.4570, 37.7232]]],
      ["lake-merced-boulevard", "Lake Merced Boulevard", "street", [[-122.4826, 37.7345], [-122.4822, 37.7200], [-122.4845, 37.7100]]],
      ["john-muir-drive", "John Muir Drive", "street", [[-122.5000, 37.7092], [-122.4880, 37.7092], [-122.4842, 37.7118]]],
      ["brotherhood-way", "Brotherhood Way", "street", [[-122.4760, 37.7130], [-122.4600, 37.7152]]],
      ["junipero-serra-boulevard", "Junipero Serra Boulevard", "avenue", [[-122.4712, 37.7436], [-122.4690, 37.7300], [-122.4718, 37.7050]]],
    ],
    districts: [["ocean-beach-south", "Ocean Beach south and the zoo", "park", [-122.5075, 37.7280, -122.4990, 37.7436]], ["fort-funston", "Fort Funston", "park", [-122.5040, 37.7000, -122.4980, 37.7200]], ["lake-merced-shores", "Lake Merced and its greens", "park", [-122.4990, 37.7110, -122.4840, 37.7340]], ["the-parkside", "the Parkside", "suburb", [-122.4990, 37.7356, -122.4760, 37.7436]], ["stonestown-and-the-campus", "Stonestown and the university campus", "campus", [-122.4830, 37.7200, -122.4700, 37.7350]], ["parkmerced", "Parkmerced", "suburb", [-122.4840, 37.7090, -122.4740, 37.7200]], ["merced-heights-and-ingleside", "Merced Heights and Ingleside Terraces", "garden", [-122.4700, 37.7100, -122.4570, 37.7340]], ["westlake-edge", "Westlake, over the county line", "suburb", [-122.4980, 37.6995, -122.4600, 37.7080]]],
    sites: [
      site("ocean-beach-south-lifeguards", "the Ocean Beach South Lifeguard Crew", "lifeguard", [-122.5030, 37.7400], "lifeguard", "The beach crew below the Sunset: cold water, rip currents, a person in the water and a call for help."),
      site("fort-funston-dune-crew", "the Fort Funston Dune and Bluff Crew", "park", [-122.5025, 37.7150], "dunes", "The crew on the dunes above the beach: litter and plastics surveys, invasive plants, trimmers and storm clean-up."),
      site("zoo-grounds-yard", "the Zoo Grounds Crew Yard", "park", [-122.5008, 37.7318], "grounds", "The grounds crew yard by the zoo: pole saws, trimmers and the irrigation boxes."),
      site("sf-state-campus-plant", "the University Campus Plant Room", "campus", [-122.4792, 37.7228], "plant", "The plant room under the campus: the chiller, the boiler, the lab's chemical store and the fire alarm panel."),
      site("stonestown-housing-site", "a Stonestown Housing Construction Site", "construction", [-122.4775, 37.7292], "build", "A new housing block going up: the concrete pour, the forms and shores, capped rebar and timber panels."),
      site("stonestown-grocery-dock", "the Stonestown Grocery Receiving Dock", "warehouse", [-122.4790, 37.7330], "grocery", "A grocery's back dock: the cold chain, the baler and compactor, the deli slicer and the checkstand."),
      site("parkmerced-grounds", "the Parkmerced Grounds Crew", "park", [-122.4800, 37.7160], "grounds", "The crew that keeps the lawns and trees between the towers: pole saws, trimmers and the irrigation boxes."),
      site("ingleside-school-campus", "an Ingleside Terraces School Campus", "school", [-122.4642, 37.7262], "school", "A school on the hill's shoulder: the playground check, the crossing guard's corner and the kitchen's labels."),
      site("nineteenth-avenue-fire-station", "a Nineteenth Avenue Fire Station", "fire-station", [-122.4728, 37.7402], "fire", "A firehouse on the avenue: size-up, the aerial ladder, rehab and a scene kept safe for the ambulance."),
      site("stern-grove-crew", "the Stern Grove and Pine Lake Crew", "forestry", [-122.4830, 37.7388], "forestry", "The crew in the grove's tall trees: pole saws, chainsaws, the chipper and a watch on dry brush."),
      site("stern-grove-stage-crew", "the Stern Grove Stage Crew", "theatre", [-122.4798, 37.7372], "outdoorStage", "The outdoor stage in the grove: show power, the loft, the truss load-in and the crowd barricade."),
      site("lake-merced-greens-crew", "the Lake Merced Greens Crew", "park", [-122.4935, 37.7240], "golf", "The greens crew between the lake's arms: mowing and hole changes, bunkers, fertiliser by the label and irrigation."),
      site("lake-merced-pump-crew", "the Lake Merced Pump Station Crew", "pump", [-122.4985, 37.7255], "pump", "The pump crew at the lake's edge: the lift station, the storm outfall, the valve vault and a permit entry."),
      site("nineteenth-avenue-line-crew", "the Nineteenth Avenue Streetcar Crew", "streetcar", [-122.4728, 37.7218], "line", "The streetcar line down the avenue past the campus: the switch, the crossing signals and the track slot."),
    ],
    landmarks: [["lake-merced-shore", "Lake Merced", "shore", -122.4835, 37.7290], ["fort-funston-bluffs", "the bluffs at Fort Funston", "point", -122.5035, 37.7130], ["ocean-beach", "Ocean Beach", "shore", -122.5060, 37.7390], ["the-zoo", "the zoo", "place", -122.5025, 37.7335], ["pine-lake-shore", "Pine Lake", "shore", -122.4850, 37.7366], ["stern-grove", "Stern Grove", "place", -122.4810, 37.7378], ["university-campus", "the university campus", "campus", -122.4800, 37.7240], ["merced-heights", "Merced Heights", "hill", -122.4700, 37.7175]],
    connectors: [
      ["sf-ss-great-highway-north", "road", "The Great Highway north along Ocean Beach", "sf-golden-gate-park", [-122.505, 37.743], "sf-gp-sunset-great-highway", "The Great Highway south to Ocean Beach south and Fort Funston"],
      ["sf-ss-nineteenth-avenue-north", "road", "Nineteenth Avenue north through the Sunset", "sf-golden-gate-park", [-122.475, 37.743], "sf-gp-sunset-nineteenth", "Nineteenth Avenue south to Stonestown and the campus"],
      ["sf-ss-ocean-avenue-east", "road", "Ocean Avenue east to the Outer Mission", "sf-outer-mission", [-122.458, 37.721], null, null],
    ],
    lessons: [
      { id: "sn-fl-rip-current", title: "Reading the Water at Ocean Beach", site: "ocean-beach-south-lifeguards", landmark: "ocean-beach", k12: "k12-first-aid-awareness-call-for-help", station: "br-cold-water-immersion-and-mob-recovery", trade: "Ocean lifeguards", tradeLine: "An ocean lifeguard reads the waves for rip currents and calls for help before anyone else goes in.", minutes: 3, steps: ["Look at the waves rolling in along the beach.", "A calm-looking gap can be a rip current pulling out to sea.", "If someone is in trouble, call a lifeguard instead of swimming out."], check: { q: "What should you do if you see someone in trouble in the water?", options: ["Call a lifeguard for help", "Swim out alone", "Walk away"], answer: 0, why: "Lifeguards are trained and equipped for cold water; calling them keeps more people safe." } },
      { id: "sn-fl-dune-plants", title: "Plants That Hold the Dunes", site: "fort-funston-dune-crew", landmark: "fort-funston-bluffs", k12: "k12-ecosystems-at-the-kelp-transect", station: "me-invasive-species-identification-and-reporting", trade: "Dune restoration crew", tradeLine: "A dune crew learns which plants belong on the dunes and reports the ones that crowd them out.", minutes: 3, steps: ["Look at the low plants growing on the sand.", "Their roots hold the sand when the wind blows.", "The crew reports plants that do not belong so native ones can grow."], check: { q: "Why do dune plants matter?", options: ["Their roots hold the sand in place", "They make the beach louder", "They keep the water warm"], answer: 0, why: "Roots bind the sand so the wind and waves do not carry the dunes away." } },
      { id: "sn-fl-lake-pump", title: "What a Pump Station Does in the Rain", site: "lake-merced-pump-crew", landmark: "lake-merced-shore", k12: "k12-by-what-a-pump-station-does-in-the-rain", station: "lift-station", trade: "Pump station operators", tradeLine: "A pump station operator checks the pumps and alarms so rain water keeps moving when storms come.", minutes: 3, steps: ["Find the small building by the lake's edge.", "Inside, pumps lift water so it can flow where it should.", "The crew checks the pumps and alarms before a storm arrives."], check: { q: "Why does the crew check the pumps before a storm?", options: ["So water keeps moving when rain falls", "So the lake gets bigger", "So the building stays warm"], answer: 0, why: "Working pumps move storm water away before streets and homes flood." } },
    ],
    gated: [
      { id: "sn-ss-gated-beach-patrol", kind: "side-quest", title: "Beach Patrol at Low Tide", site: "ocean-beach-south-lifeguards", siteName: "the Ocean Beach South Lifeguard Crew", gate: { stations: ["br-cold-water-immersion-and-mob-recovery"], note: "Learn cold water safety before you walk the beach patrol with the lifeguards" } },
      { id: "sn-ss-gated-grove-show", kind: "side-quest", title: "Set Up the Grove Stage", site: "stern-grove-stage-crew", siteName: "the Stern Grove Stage Crew", gate: { stations: ["stage-load-in-and-truss-rigging"], note: "Learn the load-in and truss rigging before you help set up the stage in the grove" } },
    ],
  },
];

// ------------------------------------------------------------------ write
const HEADER = (d) => `// ${d.name} — one 4096 m streamed San Francisco district on the shared parish schema
// (docs/parishes.md, docs/consoles/NEIGHBORHOODS.md), region "san-francisco", drawn at a walkable scale
// (\`scale\`: real metres per map metre), so the field is the walk.
//
// Facts rule: real places appear only by their public names, as places (a neighbourhood, a hill, a park, a pier,
// a square, a street); no history, dates, statistics, addresses, business names or heights of real places. Coordinates are
// approximate (three decimals, \`approximate: true\`) and exist only to place a map. The crews and site names are
// procedural training places, not real businesses. \`hills\` are gentle procedural mounds centred at the named
// hill's approximate lon/lat, named only (a height is a map number, never a real height). A landmark's \`lm\` names a
// LANDMARKS kit kind (lmBuild); until the kit merges the engine draws its generic landmark.
//
// Written once by tools/gen_sn_districts.mjs from approximate lon/lat; edit the numbers here directly. Pure: no
// three.js, no DOM. Every top-level name is prefixed np/NP_ (the bundler concatenates all modules into one scope).
`;
const box = (F, [a, b, c, e]) => [F.xzc([a, e]), F.xzc([c, e]), F.xzc([c, b]), F.xzc([a, b])];
const out = {};
for (const d of D) {
  const F = frame(d.lon0, d.lat0, d.scale);
  const p = {
    id: d.id, name: d.name, region: "san-francisco", size: 4096, scale: d.scale, blurb: d.blurb, start: d.start,
    anchors: d.anchors.map(([name, lon, lat]) => ({ xz: F.xz([lon, lat]), lonlat: [lon, lat], approximate: true, name })),
    hills: d.hills.map(([id, name, lon, lat, r, h]) => ({ id, name, center: F.xz([lon, lat]), radius: F.m(r), height: h })),
    water: d.water.map((w) => ({ id: w.id, name: w.name, kind: w.kind, poly: w.ll.map(F.xzc) })),
    levees: d.levees.map(([id, name, height, ll]) => ({ id, name, height, pts: ll.map(F.xzc) })),
    roads: d.roads.map(([id, name, kind, ll]) => ({ id, name, kind, pts: ll.map(F.xzc) })),
    districts: d.districts.map(([id, name, character, b]) => ({ id, name, character, poly: box(F, b) })),
    sites: d.sites.map(({ ll, ...s }) => ({ id: s.id, name: s.name, kind: s.kind, position: F.xz(ll), trades: s.trades, programmes: s.programmes, stations: s.stations, blurb: s.blurb })),
    landmarks: d.landmarks.map(([id, name, kind, lon, lat, lm]) => ({ id, name, position: F.xz([lon, lat]), kind, ...(lm ? { lm } : {}) })),
    connectors: [],
    fieldLessons: d.lessons,
    gated: d.gated.map((g) => ({ ...g, world: "parishes", parish: d.id, summary: g.title })),
  };
  out[d.id] = { d, p, F };
}
// connectors: the far end through the other district's own fit
const NP = (await import(pathToFileURL(join(SHARED, "np-geo.js")).href));
const coarse = {};
for (const id of ["sf-downtown", "sf-mission", "sf-marina", "sf-golden-gate-park"]) {
  const exp = { "sf-downtown": "NP_SF_DOWNTOWN", "sf-mission": "NP_SF_MISSION", "sf-marina": "NP_SF_MARINA", "sf-golden-gate-park": "NP_SF_GOLDEN_GATE_PARK" }[id];
  coarse[id] = { exp, p: (await import(pathToFileURL(join(SHARED, `np-data-${id}.js`)).href))[exp] };
}
for (const { d, p, F } of Object.values(out)) {
  for (const [cid, kind, name, to, lonlat, backId, backName] of d.connectors) {
    const other = coarse[to]?.p;
    p.connectors.push({ id: cid, kind, name, from: { parish: d.id, position: F.xz(lonlat) }, to: { parish: to, position: other ? NP.npGeoToXz(other, lonlat).map(Math.round) : null, lonlat }, lonlat, approximate: true });
    if (other && backId) {
      const list = other.connectors.filter((c) => c.id !== backId);
      list.push({ id: backId, kind, name: backName, from: { parish: to, position: NP.npGeoToXz(other, lonlat).map(Math.round) }, to: { parish: d.id, position: F.xz(lonlat), lonlat }, lonlat, approximate: true });
      other.connectors = list;
      coarse[to].dirty = true;
    }
  }
  writeFileSync(join(SHARED, `np-data-${d.id}.js`), `${HEADER(d)}\nexport const ${d.exp} = ${JSON.stringify(p, null, 1)};\n`);
  console.log(`wrote np-data-${d.id}.js: ${p.sites.length} sites, ${p.landmarks.length} landmarks, ${p.hills.length} hills, ${p.connectors.length} connectors`);
}
// mirror connectors: rewrite only the connectors array of each coarse module, keeping the rest of the file as it is
for (const [id, c] of Object.entries(coarse)) {
  if (!c.dirty) continue;
  const file = join(SHARED, `np-data-${id}.js`);
  const src = readFileSync(file, "utf8");
  const mine = c.p.connectors.filter((x) => x.to?.parish && out[x.to.parish]);
  let next;
  const pretty = src.match(/\n "connectors": \[[\s\S]*?\n \],\n/);
  const compact = src.match(/\n  connectors: \[\n([\s\S]*?)\n  \],\n/);
  if (pretty) {
    const body = JSON.stringify(c.p.connectors, null, 1).split("\n").map((l, i) => (i ? " " + l : l)).join("\n");
    next = src.replace(pretty[0], `\n "connectors": ${body},\n`);
  } else if (compact) {
    const kept = compact[1].split("\n").filter((l) => !mine.some((x) => l.includes(`"id":"${x.id}"`)));
    next = src.replace(compact[0], `\n  connectors: [\n${[...kept, ...mine.map((x) => `    ${JSON.stringify(x)},`)].join("\n")}\n  ],\n`);
  } else throw new Error(`${id}: connectors array not found`);
  writeFileSync(file, next);
  console.log(`mirrored connectors into np-data-${id}.js (${c.p.connectors.length})`);
}
