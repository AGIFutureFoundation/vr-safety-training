#!/usr/bin/env node
// NOLA-DISTRICTS (console `nd`, docs/consoles/NOLA-DISTRICTS.md): writes four New Orleans neighbourhood districts at a
// near-true scale — nola-french-quarter-cbd, nola-uptown-garden, nola-mid-city-gentilly, nola-bywater-lower-ninth —
// as pure-literal parish modules, each declaring `parent: "orleans"` (the parent/child "zoom in" pattern, docs/parishes.md),
// from approximate public lon/lat through one north-up uniform scale per district; then adds the mirror connectors to
// the parent (np-data-orleans.js) at the matching place. Run once; the modules are the source of truth afterwards.
//
// Geography: the river's crescent, the Industrial Canal, Bayou St. John, the outfall canals, City Park's lagoons and the
// main streets' run were checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026);
// no figure was read off the image. Places are named, never described with figures; the crews and site names are
// procedural training places, not real businesses.
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
  const ll = ([x, z]) => [lon0 + (x * scale) / mLon, lat0 - (z * scale) / M_LAT];
  return { xz, xzc, ll, m: (metres) => Math.round(metres / scale), scale };
}

// A polyline in lon/lat, densified in map metres and clipped to the field (kept 12 m inside the rim).
function clipLine(F, pts, step = 40) {
  const xz = pts.map(F.xz), out = [];
  const lim = HALF - 12, inside = ([x, z]) => Math.abs(x) <= lim && Math.abs(z) <= lim;
  for (let i = 0; i < xz.length - 1; i++) {
    const [a, b] = [xz[i], xz[i + 1]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) { const t = k / n; const q = [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t)]; if (inside(q)) out.push(q); }
  }
  if (inside(xz[xz.length - 1])) out.push(xz[xz.length - 1]);
  // thin: keep every point where the direction turns, and the ends
  const thin = out.filter((q, i) => i === 0 || i === out.length - 1 || i % 4 === 0);
  return thin;
}
// Offset a map-metre polyline to its left (+1) or right (-1) side, looking downstream, by `d` map metres.
function offset(pts, d, side = 1) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz) || 1;
    // left of travel in a north-up, +z-south frame: (dz, -dx)
    return [Math.round(p[0] + (side * d * dz) / n), Math.round(p[1] - (side * d * dx) / n)].map((v) => Math.max(-HALF + 12, Math.min(HALF - 12, v)));
  });
}
const segDist = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz || 1; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L; t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz); };
const lineDist = (p, pts) => { let d = Infinity; for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, segDist(p, pts[i], pts[i + 1])); return d; };

// ------------------------------------------------------------------ the crafts at each kind of site (catalog ids only)
const S = {
  restore: { trades: ["carpenters", "iupat", "opcmia", "bac"], programmes: ["builders-trades", "cement-masons-and-plasterers", "roofers-and-waterproofers"], stations: ["scaffold-erection", "masonry-silica-scaffold", "cm-exterior-plaster-scratch-brown-and-finish-coats", "rf-roof-tear-off-and-debris-chute", "paint-sprayer"] },
  repaint: { trades: ["iupat", "carpenters"], programmes: ["builders-trades", "fall-protection"], stations: ["paint-sprayer", "scaffold-erection", "masonry-silica-scaffold", "leading-edge-and-horizontal-lifeline"] },
  renovation: { trades: ["carpenters", "ua", "insulators", "ibew"], programmes: ["plumbers-and-pipefitters", "insulators-and-boilermakers", "roofers-and-waterproofers"], stations: ["ib-asbestos-glovebag-removal-on-a-pipe", "pl-water-heater-and-tpr-valve-replacement", "rf-skylight-and-hatch-guarding", "pl-natural-gas-pressure-test-and-leak-check"] },
  roof: { trades: ["carpenters", "iupat", "ua"], programmes: ["roofers-and-waterproofers", "fall-protection"], stations: ["rf-roof-tear-off-and-debris-chute", "rf-skylight-and-hatch-guarding", "leading-edge-and-horizontal-lifeline", "scaffold-erection"] },
  track: { trades: ["atu", "bmwed", "ibew"], programmes: ["transit-ramp", "railroad-crafts"], stations: ["track-access", "signal-cabinet", "ra-crossing-signal-maintenance-and-flagging", "ra-switch-inspection-and-lubrication", "ra-roadway-worker-protection-and-job-briefing"] },
  wire: { trades: ["ibew", "atu", "twu"], programmes: ["transit-ramp", "electrical-first-period"], stations: ["line-truck", "track-access", "signal-cabinet", "ra-roadway-worker-protection-and-job-briefing"] },
  barn: { trades: ["atu", "iam", "ibew", "twu"], programmes: ["transit-ramp", "railroad-crafts"], stations: ["bus-depot-lift", "signal-cabinet", "track-access", "ra-hand-brake-and-securement-on-a-grade"] },
  pump: { trades: ["iuoe", "ibew", "uwua", "afscme"], programmes: ["electrical-first-period", "confined-space", "water-and-gas-utility-crews"], stations: ["lift-station", "ut-night-storm-response-crew-and-portable-generator", "motor-control-center", "cs-permit-entry-and-attendant-duties", "valve-vault"] },
  drain: { trades: ["uwua", "liuna", "afscme"], programmes: ["water-and-gas-utility-crews", "confined-space"], stations: ["stormwater-outfall", "pl-underground-sewer-lateral-and-trench-shoring", "manhole-entry-and-atmospheric-monitoring", "ut-night-storm-response-crew-and-portable-generator"] },
  water: { trades: ["uwua", "iuoe", "afscme"], programmes: ["water-and-gas-utility-crews", "confined-space"], stations: ["valve-vault", "cs-permit-entry-and-attendant-duties", "ut-water-treatment-chemical-delivery-unloading", "lift-station"] },
  levee: { trades: ["iuoe", "liuna", "afscme", "opcmia"], programmes: ["builders-trades", "bay-restoration-maritime-underwater", "heavy-equipment-operators"], stations: ["br-levee-inspection-and-seepage", "op-dozer-slope-work-and-rollover-protection", "op-compactor-lift-thickness-and-edge", "formwork-shoring", "concrete-pour"] },
  floodwall: { trades: ["iuoe", "liuna", "afscme"], programmes: ["hunters-point-bay-restoration", "bay-restoration-maritime-underwater", "grounds-and-landscaping"], stations: ["br-levee-inspection-and-seepage", "tide-gate", "br-shoreline-cleanup-sharps-and-hazardous-debris", "gk-ride-on-mower-pre-start-and-slope-work"] },
  lock: { trades: ["iuoe", "ibu", "meba", "mmp", "siu"], programmes: ["port-operations", "hunters-point-bay-restoration", "bay-area-union-edition"], stations: ["mw-workboat-towing-and-line-handling", "br-vhf-and-navigation-in-a-work-zone", "mooring-line", "pt-dock-fender-and-bollard-inspection"] },
  wharf: { trades: ["ila", "iuoe", "teamsters", "ilwu"], programmes: ["rigging-lifting", "port-operations"], stations: ["dock-crane", "container-lashing", "mooring-line", "po-yard-hostler-and-pedestrian-separation", "vessel-gangway-and-hatch-cover-safety"] },
  pier: { trades: ["ila", "ilwu", "iuoe"], programmes: ["port-operations", "rigging-lifting"], stations: ["mooring-line", "vessel-gangway-and-hatch-cover-safety", "pt-dock-fender-and-bollard-inspection", "forklift-dock"] },
  ferry: { trades: ["ibu", "siu", "mmp"], programmes: ["port-operations", "bay-area-union-edition", "yacht-and-charter-crew"], stations: ["mw-ferry-deckhand-and-passenger-safety", "yc-man-overboard-recovery-drill", "vessel-gangway-and-hatch-cover-safety"] },
  rail: { trades: ["smart-td", "blet", "bmwed", "tcu", "brs"], programmes: ["railroad-crafts"], stations: ["ra-blue-flag-protection-in-the-yard", "rcl-switching", "ra-switch-inspection-and-lubrication", "ra-roadway-worker-protection-and-job-briefing"] },
  restaurant: { trades: ["unite-here"], programmes: ["culinary-kitchen", "bartending-course"], stations: ["kitchen", "knife-skills", "hood-suppression", "bar-well-setup", "grease-trap"] },
  kitchen: { trades: ["unite-here"], programmes: ["culinary-kitchen"], stations: ["kitchen-gas-shutoff", "fryer-oil-change", "dish-pit", "prep-cooling", "slicer-lockout"] },
  hotel: { trades: ["unite-here", "seiu"], programmes: ["hotel-workers", "culinary-kitchen"], stations: ["housekeeping-room-turn", "hw-housekeeping-cart-and-chemical-safety", "hw-banquet-room-flip-and-staging", "laundry-plant-chemicals"] },
  stage: { trades: ["iatse"], programmes: ["live-events"], stations: ["stage-power", "rigging-loft", "stage-load-in-and-truss-rigging", "le-crowd-barricade-and-show-stop-call"] },
  arena: { trades: ["iatse", "seiu", "unite-here", "ibew", "spfpa"], programmes: ["rigging-lifting", "live-events"], stations: ["arena-rigging", "le-crowd-barricade-and-show-stop-call", "le-followspot-and-truss-access-at-height", "stage-power", "chain-hoist"] },
  build: { trades: ["carpenters", "liuna", "ironworkers", "opcmia"], programmes: ["builders-trades"], stations: ["concrete-pour", "formwork-shoring", "bt-rebar-tying-and-impalement-protection", "mass-timber-panel-set"] },
  vault: { trades: ["ibew"], programmes: ["energy-transition", "electrical-first-period"], stations: ["temporary-site-power", "substation-switching", "line-truck", "transformer-vault"] },
  hospital: { trades: ["nnu", "seiu", "afscme", "ua"], programmes: ["healthcare-support", "first-responders", "plumbers-and-pipefitters"], stations: ["hc-patient-transport-and-safe-handling", "hc-code-response-support-and-crash-cart-check", "hc-sterile-processing-decontamination-and-assembly", "pl-medical-gas-brazing-and-purge", "triage-point"] },
  campus: { trades: ["aaup", "afscme", "seiu", "ibew", "ua"], programmes: ["stationary-engineer", "property-management", "education-support-staff"], stations: ["chiller-plant", "pm-fire-alarm-panel-room", "ed-science-lab-chemical-storage-and-eyewash", "pm-electrical-room"] },
  school: { trades: ["aft", "csea", "seiu"], programmes: ["education-support-staff", "k12-literacy-and-life-skills"], stations: ["ed-playground-equipment-inspection", "ed-crossing-guard-intersection-control", "k12-reading-instructions-and-safety-labels", "ed-kitchen-receiving-and-warewash-sanitizing"] },
  fire: { trades: ["iaff", "naemt"], programmes: ["first-responders", "fall-protection"], stations: ["structure-fire-sizeup", "aerial-ladder", "firefighter-rehab-sector", "ambulance-scene-safety"] },
  grounds: { trades: ["afscme", "liuna", "seiu"], programmes: ["grounds-and-landscaping"], stations: ["gk-tree-work-pole-saw-and-drop-zone", "gk-string-trimmer-and-blower-ppe-and-bystander-zone", "gk-irrigation-controller-valve-box-and-backflow-check", "gk-chainsaw-start-and-limbing-on-the-ground"] },
  oaks: { trades: ["afscme", "liuna"], programmes: ["grounds-and-landscaping", "first-responders"], stations: ["gk-tree-work-pole-saw-and-drop-zone", "gk-chainsaw-start-and-limbing-on-the-ground", "gk-storm-cleanup-chipper-and-traffic-control", "gk-string-trimmer-and-blower-ppe-and-bystander-zone"] },
  wetland: { trades: ["liuna", "iuoe", "afscme"], programmes: ["marine-ecology-and-restoration", "bay-restoration-maritime-underwater"], stations: ["marsh-transect-survey", "me-tidal-marsh-channel-restoration-day", "br-native-planting-and-erosion-mats", "br-water-quality-sonde-calibration-and-deploy"] },
  street: { trades: ["liuna", "iuoe", "opcmia", "teamsters"], programmes: ["builders-trades", "heavy-equipment-operators"], stations: ["op-grader-fine-grade-and-crown", "op-compactor-lift-thickness-and-edge", "concrete-pour", "traffic-incident-management"] },
  museum: { trades: ["afscme", "iatse", "seiu"], programmes: ["property-management", "live-events"], stations: ["pm-fire-alarm-panel-room", "pm-community-room-and-events", "rigging-loft", "stage-power"] },
  solar: { trades: ["ibew", "carpenters"], programmes: ["energy-transition", "electrical-first-period"], stations: ["temporary-site-power", "leading-edge-and-horizontal-lifeline", "rf-skylight-and-hatch-guarding", "line-truck"] },
};
const site = (id, name, kind, ll, set, blurb) => ({ id, name, kind, ll, ...S[set], blurb });

// The Mississippi's centre line through the city (checked against the imagery): the Uptown crescent, north past the CBD
// and the Quarter, east round Algiers Point, past the Bywater and Holy Cross.
const RIVER = [[-90.132, 29.9118], [-90.118, 29.9108], [-90.1045, 29.9112], [-90.0948, 29.9138], [-90.0850, 29.9170], [-90.0775, 29.9200], [-90.0715, 29.9240], [-90.0665, 29.9290], [-90.0632, 29.9360], [-90.0608, 29.9430], [-90.0590, 29.9495], [-90.0572, 29.9545], [-90.0535, 29.9580], [-90.0480, 29.9595], [-90.0420, 29.9597], [-90.0342, 29.9582], [-90.0260, 29.9552], [-90.0180, 29.9512], [-90.0100, 29.9485], [-90.0000, 29.9460]];
const RIVER_M = 620; // the ribbon's width on the ground (the imagery shows the channel about this wide; a drawing width, not a survey)

// ------------------------------------------------------------------ the four districts
const D = [
  {
    id: "nola-french-quarter-cbd", exp: "NP_NOLA_FRENCH_QUARTER_CBD", name: "The French Quarter, the CBD & the Riverfront",
    lon0: -90.0698, lat0: 29.9555, scale: 0.52,
    blurb: "New Orleans's old heart on foot: the French Quarter's galleried streets between Canal Street and Esplanade, Jackson Square on the river, the CBD's towers and the edge of the Warehouse District, with the riverfront's wharves and floodwall. The site layouts are illustrative; the streets, the river and the squares are real.",
    start: "nfq-workforce-centre",
    anchors: [["Jackson Square", -90.063, 29.958], ["Lafayette Square", -90.071, 29.949], ["Louis Armstrong Park", -90.068, 29.962], ["the foot of Canal Street", -90.064, 29.951], ["the French Market", -90.061, 29.961], ["Duncan Plaza", -90.077, 29.953], ["the corner of Canal and Rampart", -90.072, 29.955]],
    water: [
      { id: "mississippi-river", name: "the Mississippi River", kind: "river", river: true },
      { id: "armstrong-park-lagoon-north", name: "the lagoon in Louis Armstrong Park, north arm", kind: "lake", ll: [[-90.0690, 29.9622], [-90.0676, 29.9627], [-90.0671, 29.9620], [-90.0686, 29.9615]] },
      { id: "armstrong-park-lagoon-south", name: "the lagoon in Louis Armstrong Park, south arm", kind: "lake", ll: [[-90.0684, 29.9611], [-90.0672, 29.9615], [-90.0667, 29.9609], [-90.0680, 29.9605]] },
    ],
    levees: [["riverfront-floodwall", "the riverfront floodwall", 4, "bank", 1, 70], ["french-market-floodwall", "the floodwall behind the French Market", 4, [[-90.0612, 29.9575], [-90.0600, 29.9598], [-90.0592, 29.9612]]]],
    roads: [
      ["canal-street", "Canal Street and its streetcar", "avenue", [[-90.0645, 29.9512], [-90.0690, 29.9535], [-90.0740, 29.9565], [-90.0790, 29.9595], [-90.0830, 29.9615]]],
      ["decatur-street", "Decatur Street", "street", [[-90.0652, 29.9530], [-90.0632, 29.9560], [-90.0618, 29.9585], [-90.0600, 29.9615]]],
      ["bourbon-street", "Bourbon Street", "street", [[-90.0690, 29.9545], [-90.0668, 29.9575], [-90.0645, 29.9605], [-90.0625, 29.9632]]],
      ["north-rampart-street", "North Rampart Street", "street", [[-90.0720, 29.9562], [-90.0698, 29.9593], [-90.0675, 29.9625], [-90.0655, 29.9655]]],
      ["poydras-street", "Poydras Street", "avenue", [[-90.0648, 29.9482], [-90.0700, 29.9488], [-90.0760, 29.9495], [-90.0815, 29.9505]]],
      ["st-charles-avenue", "St. Charles Avenue and its streetcar", "street", [[-90.0695, 29.9548], [-90.0702, 29.9515], [-90.0710, 29.9480], [-90.0718, 29.9445]]],
      ["riverfront-streetcar", "the riverfront streetcar line", "street", "bank", 1, 150],
      ["claiborne-interstate", "the interstate over Claiborne Avenue", "interstate", [[-90.0830, 29.9555], [-90.0775, 29.9598], [-90.0735, 29.9640], [-90.0712, 29.9665]]],
      ["esplanade-avenue", "Esplanade Avenue", "avenue", [[-90.0590, 29.9612], [-90.0610, 29.9630], [-90.0635, 29.9650]]],
    ],
    districts: [["french-quarter", "the French Quarter", "quarter", [-90.0700, 29.9555, -90.0592, 29.9651]], ["cbd", "the Central Business District", "downtown", [-90.0808, 29.9480, -90.0650, 29.9560]], ["warehouse-district", "the edge of the Warehouse District", "industrial", [-90.0740, 29.9459, -90.0655, 29.9482]], ["treme-edge", "the edge of Tremé", "garden", [-90.0808, 29.9585, -90.0690, 29.9651]], ["riverfront", "the riverfront", "port", [-90.0660, 29.9459, -90.0588, 29.9540]], ["superdome-edge", "the Poydras corridor", "downtown", [-90.0808, 29.9459, -90.0740, 29.9480]]],
    sites: [
      site("nfq-workforce-centre", "the French Quarter Trades Workforce Centre", "construction", [-90.0735, 29.9530], "build", "A workforce centre off Canal Street where crews sign in, brief and are matched to the Quarter's restoration and the CBD's building work."),
      site("nfq-balcony-restoration", "a French Quarter Gallery and Balcony Restoration", "construction", [-90.0655, 29.9580], "restore", "A galleried building on a Quarter street under repair: scaffold on a narrow sidewalk, silica control on old brick, lime plaster and a roof tear-off."),
      site("nfq-masonry-repointing", "a Quarter Masonry Repointing Crew", "construction", [-90.0640, 29.9615], "repaint", "Old soft brick repointed by hand: the scaffold, the dust control and the painter's lifeline."),
      site("nfq-french-market-shed-repair", "the French Market Shed Repair", "market", [-90.0612, 29.9596], "roof", "The market's long sheds under roof repair above the stalls: the tear-off chute, guarded hatches and lifelines."),
      site("nfq-canal-streetcar-track", "the Canal Street Streetcar Track Crew", "streetcar", [-90.0712, 29.9543], "track", "Track work on the Canal Street line between the traffic lanes: roadway worker protection, the switch and the crossing signals."),
      site("nfq-riverfront-streetcar-track", "the Riverfront Streetcar Track Crew", "streetcar", [-90.0650, 29.9500], "track", "The riverfront line along the floodwall: flagging the crossings and keeping the switches clean."),
      site("nfq-drainage-line-replacement", "a Quarter Drainage Line Replacement", "stormwater", [-90.0680, 29.9600], "drain", "An old drain line replaced under a Quarter street: the trench box, the manhole's air check and the storm call-out."),
      site("nfq-riverfront-floodwall-gate", "the Riverfront Floodwall Gate Crew", "floodgate", [-90.0632, 29.9545], "floodwall", "A gate in the riverfront floodwall: the closing drill, the seepage walk and the batture's debris."),
      site("nfq-hotel-kitchen", "a Quarter Hotel Kitchen", "hospitality", [-90.0668, 29.9555], "kitchen", "A hotel kitchen off Bourbon Street: the gas shut-off, the fryer oil change, the dish pit and the slicer lockout."),
      site("nfq-hotel-facade", "a CBD Hotel Service Floor", "hotel", [-90.0745, 29.9510], "hotel", "A tall hotel's service floors: room turns, the housekeeping cart, banquet flips and the laundry chemicals."),
      site("nfq-restaurant-row", "a Restaurant Row on Decatur Street", "hospitality", [-90.0628, 29.9590], "restaurant", "Kitchens and bars facing the river: the line, the hood, the bar well and the grease trap."),
      site("nfq-river-wharf-crew", "a Riverfront Wharf Crew", "port", [-90.0635, 29.9475], "wharf", "A working wharf below the CBD: the crane, the lashing gear, the lines and the gangway."),
      site("nfq-ferry-landing", "the Canal Street Ferry Landing Crew", "ferry", [-90.0640, 29.9515], "ferry", "The landing at the foot of Canal Street for the ferry across to Algiers: the gangway, passengers and a man-overboard drill."),
      site("nfq-high-rise-build", "a CBD High-Rise Build", "construction", [-90.0770, 29.9480], "build", "A tower going up off Poydras Street: the pour, the shoring and rebar caps on every bar."),
      site("nfq-water-main", "a CBD Water Main Crew", "utility", [-90.0780, 29.9545], "water", "A water main and its valve vault under a CBD street: the permit entry, the chemical delivery and the lift station."),
      site("nfq-electrical-vault", "a CBD Electrical Vault Crew", "substation", [-90.0720, 29.9500], "vault", "An underground vault feeding the towers: switching, the transformer vault and the line truck."),
      site("nfq-street-and-sidewalk-crew", "a Quarter Street and Sidewalk Crew", "construction", [-90.0690, 29.9630], "street", "A street rebuilt block by block: the grade and crown, the compactor, the pour and traffic kept moving."),
      site("nfq-fire-station", "a French Quarter Fire Station", "fire-station", [-90.0700, 29.9590], "fire", "A firehouse by the Quarter: size-up on narrow streets under galleries, the aerial ladder and rehab after a long call."),
      site("nfq-arena-rigging", "a CBD Arena Rigging Crew", "stadium", [-90.0795, 29.9520], "arena", "The arena crew at the CBD's edge: the rigging points, the followspots, the barricade and show power."),
    ],
    landmarks: [["jackson-square", "Jackson Square", "square", -90.0630, 29.9575, "church-towers"], ["st-louis-cathedral", "St. Louis Cathedral", "church", -90.0637, 29.9580], ["canal-street-streetcar", "a streetcar on Canal Street", "place", -90.0700, 29.9540, "streetcar"], ["armstrong-park-arch", "the arch at Louis Armstrong Park", "park", -90.0683, 29.9600, "gateway-arch"], ["riverfront-floodwall-gate", "a riverfront floodwall gate", "levee", -90.0628, 29.9535, "tide-gate"], ["french-market", "the French Market", "market", -90.0606, 29.9602], ["lafayette-square", "Lafayette Square", "park", -90.0710, 29.9490], ["nfq-sign", "a sign: the site layouts are illustrative; the streets, the river and the squares are real", "sign", -90.0725, 29.9525]],
    connectors: [
      // [id, kind, name, to, lonlat, backId, backName, (own end lon/lat when it differs from the agreed point)]
      ["nd-fq-orleans-canal", "road", "Canal Street out to the whole of New Orleans", "orleans", [-90.0760, 29.9578], "conn-nd-french-quarter-canal", "Canal Street into the French Quarter and the CBD (zoom in)"],
      ["nd-fq-orleans-esplanade", "road", "Esplanade Avenue out to the whole of New Orleans", "orleans", [-90.0620, 29.9638], "conn-nd-french-quarter-esplanade", "Esplanade Avenue into the French Quarter (zoom in)"],
      ["nd-fq-uptown-st-charles", "road", "St. Charles Avenue up to the Garden District and Uptown", "nola-uptown-garden", [-90.0760, 29.9440], "nd-up-fq-st-charles", "St. Charles Avenue down to the CBD and the French Quarter", [-90.0716, 29.9468], [-90.0810, 29.9380]],
      ["nd-fq-mid-city-canal", "road", "Canal Street out to Mid-City", "nola-mid-city-gentilly", [-90.0830, 29.9640], "nd-mc-fq-canal", "Canal Street in to the CBD and the French Quarter", [-90.0795, 29.9598], [-90.0880, 29.9675]],
      ["nd-fq-bywater-esplanade", "road", "Across Esplanade Avenue into the Marigny", "nola-bywater-lower-ninth", [-90.0585, 29.9630], "nd-bw-fq-esplanade", "Across Esplanade Avenue into the French Quarter", [-90.0602, 29.9622], [-90.0570, 29.9640]],
    ],
    lessons: [
      { id: "nd-fl-balcony-scaffold", title: "Why a Scaffold Needs a Covered Walkway", site: "nfq-balcony-restoration", landmark: "jackson-square", k12: "k12-reading-instructions-and-safety-labels", station: "scaffold-erection", trade: "Restoration carpenters", tradeLine: "A restoration crew builds its scaffold with a covered walkway so people on the narrow sidewalk stay safe underneath.", minutes: 3, steps: ["Look up at the old gallery wrapped in scaffold.", "Under it there is a covered walkway for people passing by.", "Tools and bits of plaster cannot fall on anyone below."], check: { q: "Why does the scaffold have a covered walkway?", options: ["So falling things cannot hit people walking by", "So the painters can nap", "So the street looks newer"], answer: 0, why: "Overhead protection keeps the public safe while the crew works above the sidewalk." } },
      { id: "nd-fl-floodwall-gate", title: "A Gate in the Floodwall", site: "nfq-riverfront-floodwall-gate", landmark: "riverfront-floodwall-gate", k12: "k12-reading-instructions-and-safety-labels", station: "br-levee-inspection-and-seepage", trade: "Levee and floodwall crews", tradeLine: "A floodwall crew practises closing the gates before high water and walks the wall looking for seeping water.", minutes: 3, steps: ["Find the wide gate in the wall by the river.", "When the river rises, the crew closes it so the wall has no gap.", "They walk the wall and look for water seeping through."], check: { q: "When does the crew close the gate?", options: ["When the river rises high", "Every lunchtime", "Only when it is sunny"], answer: 0, why: "Closing the gate before high water keeps the river out of the streets." } },
      { id: "nd-fl-streetcar-track", title: "Working Beside a Streetcar Line", site: "nfq-canal-streetcar-track", landmark: "canal-street-streetcar", k12: "k12-reading-instructions-and-safety-labels", station: "ra-roadway-worker-protection-and-job-briefing", trade: "Track crews", tradeLine: "A track crew holds a short briefing and posts a lookout before anyone steps between the rails.", minutes: 2, steps: ["Watch the crew gather before they start.", "They agree who watches for streetcars and how to warn everyone.", "Only then does anyone step onto the track."], check: { q: "What happens before the crew steps onto the track?", options: ["A briefing and a lookout", "A race to the corner", "Nothing at all"], answer: 0, why: "A briefing and a lookout mean everyone knows a streetcar is coming in time to clear." } },
    ],
    gated: [
      { id: "nd-fq-gated-gallery-rail", kind: "side-quest", title: "Rebuild a Gallery Railing", site: "nfq-balcony-restoration", siteName: "a French Quarter Gallery and Balcony Restoration", gate: { stations: ["scaffold-erection"], note: "Learn to build and inspect a scaffold before you work on the gallery above the street" } },
      { id: "nd-fq-gated-gate-drill", kind: "side-quest", title: "Close the Floodwall Gate", site: "nfq-riverfront-floodwall-gate", siteName: "the Riverfront Floodwall Gate Crew", gate: { stations: ["br-levee-inspection-and-seepage"], note: "Learn to inspect a levee and spot seepage before you join the gate closing drill" } },
    ],
  },
  {
    id: "nola-uptown-garden", exp: "NP_NOLA_UPTOWN_GARDEN", name: "The Garden District & Uptown",
    lon0: -90.0995, lat0: 29.9288, scale: 0.9,
    blurb: "The river's crescent above the CBD on foot: the Garden District's houses and live oaks, the St. Charles Avenue streetcar, Magazine Street's shops, Uptown's shotgun rows and the wharves along the bend. The site layouts are illustrative; the streets, the river and the neighbourhoods are real.",
    start: "nup-st-charles-streetcar-track",
    anchors: [["Lafayette Cemetery", -90.085, 29.929], ["the corner of St. Charles and Napoleon", -90.103, 29.925], ["the corner of St. Charles and Louisiana", -90.094, 29.926], ["Loyola and Tulane on St. Charles", -90.118, 29.936], ["the corner of Magazine and Jackson", -90.081, 29.927], ["the Napoleon Avenue wharf", -90.104, 29.917], ["the corner of Claiborne and Napoleon", -90.101, 29.938]],
    water: [
      { id: "mississippi-river", name: "the Mississippi River", kind: "river", river: true },
      { id: "uptown-batture", name: "the river's batture below the Uptown levee", kind: "wetland", bank: 1, from: 330, to: 380 },
      { id: "bend-batture", name: "the batture at the river bend by the wharves", kind: "wetland", ll: [[-90.1185, 29.9150], [-90.1120, 29.9142], [-90.1120, 29.9150], [-90.1185, 29.9158]] },
    ],
    levees: [["uptown-river-levee", "the Uptown river levee", 5, "bank", 1, 400], ["wharf-floodwall", "the floodwall behind the wharves", 4, "bank", 1, 460]],
    roads: [
      ["st-charles-avenue", "St. Charles Avenue and its streetcar", "avenue", [[-90.0775, 29.9440], [-90.0790, 29.9330], [-90.0860, 29.9285], [-90.0935, 29.9258], [-90.1025, 29.9252], [-90.1120, 29.9295], [-90.1215, 29.9360]]],
      ["magazine-street", "Magazine Street", "street", [[-90.0745, 29.9330], [-90.0810, 29.9265], [-90.0900, 29.9225], [-90.1030, 29.9205], [-90.1150, 29.9235], [-90.1230, 29.9275]]],
      ["tchoupitoulas-street", "Tchoupitoulas Street", "street", "bank", 1, 520],
      ["napoleon-avenue", "Napoleon Avenue", "avenue", [[-90.1040, 29.9175], [-90.1030, 29.9250], [-90.1010, 29.9380], [-90.1000, 29.9450]]],
      ["louisiana-avenue", "Louisiana Avenue", "avenue", [[-90.0905, 29.9195], [-90.0935, 29.9258], [-90.0965, 29.9380]]],
      ["jackson-avenue", "Jackson Avenue", "avenue", [[-90.0770, 29.9235], [-90.0790, 29.9330], [-90.0815, 29.9440]]],
      ["south-claiborne-avenue", "South Claiborne Avenue", "avenue", [[-90.0830, 29.9448], [-90.0930, 29.9410], [-90.1010, 29.9380], [-90.1120, 29.9410], [-90.1185, 29.9440]]],
      ["prytania-street", "Prytania Street", "street", [[-90.0760, 29.9345], [-90.0830, 29.9280], [-90.0920, 29.9240], [-90.1030, 29.9228]]],
    ],
    districts: [["garden-district", "the Garden District", "garden", [-90.0900, 29.9240, -90.0805, 29.9330]], ["irish-channel", "the Irish Channel", "suburb", [-90.0900, 29.9185, -90.0805, 29.9240]], ["uptown", "Uptown", "garden", [-90.1150, 29.9230, -90.0900, 29.9380]], ["freret-broadmoor", "Freret and the edge of Broadmoor", "suburb", [-90.1150, 29.9380, -90.0840, 29.9453]], ["uptown-wharves", "the Uptown wharves", "port", [-90.1186, 29.9122, -90.0880, 29.9185]], ["universities", "the universities on St. Charles", "campus", [-90.1186, 29.9310, -90.1150, 29.9420]]],
    sites: [
      site("nup-shotgun-restoration", "an Uptown Shotgun House Restoration", "construction", [-90.1080, 29.9290], "restore", "A shotgun house brought back room by room: scaffold on the side alley, old plaster, a lime finish and a new roof."),
      site("nup-ironwork-restoration", "a Garden District Ironwork and Paint Crew", "construction", [-90.0855, 29.9270], "repaint", "Cast iron fences and galleries stripped and painted: the sprayer, dust control and the painter's lifeline."),
      site("nup-st-charles-streetcar-track", "the St. Charles Streetcar Track Crew", "streetcar", [-90.0960, 29.9262], "track", "Track work on the neutral ground under the oaks: roadway worker protection, the switch and the crossing signals."),
      site("nup-streetcar-overhead-wire", "the St. Charles Overhead Wire Crew", "streetcar", [-90.1150, 29.9322], "wire", "The wire above the streetcar line: the line truck, lookouts on the neutral ground and the signal cabinet."),
      site("nup-drainage-culvert", "a Napoleon Avenue Drainage Culvert Crew", "stormwater", [-90.1015, 29.9320], "drain", "A big drainage culvert under the avenue's neutral ground: the trench, the manhole's air check and the storm call-out."),
      site("nup-pumping-station", "an Uptown Drainage Pumping Station", "pump", [-90.0985, 29.9410], "pump", "A pumping station that lifts the rain out of Uptown's streets: the motor control centre, the permit entry and the storm generator."),
      site("nup-river-levee-crew", "the Uptown River Levee Crew", "levee", [-90.0925, 29.9185], "levee", "The crew on the river levee: seepage walks, the dozer on the slope and a floodwall pour."),
      site("nup-magazine-street-kitchen", "a Magazine Street Restaurant Kitchen", "hospitality", [-90.0960, 29.9222], "restaurant", "A kitchen on Magazine Street: the line, the hood, the bar well and the grease trap."),
      site("nup-hospital-campus", "an Uptown Hospital Campus", "hospital", [-90.0900, 29.9305], "hospital", "A hospital campus off the avenue: moving patients safely, the crash cart, sterile processing and medical gas."),
      site("nup-university-facilities", "a University Facilities Crew on St. Charles", "campus", [-90.1165, 29.9380], "campus", "The crews that keep a campus running: the chiller plant, the fire alarm room and the science lab's storage."),
      site("nup-river-wharf", "an Uptown River Wharf Crew", "port", [-90.1070, 29.9190], "pier", "A wharf on the river bend: lines, gangways, fenders and the forklift lane."),
      site("nup-live-oak-crew", "the St. Charles Live Oak Crew", "park", [-90.1060, 29.9262], "oaks", "The crew that cares for the avenue's live oaks: the pole saw, the drop zone and storm clean-up with traffic control."),
      site("nup-school-campus", "an Uptown School Campus", "school", [-90.1120, 29.9365], "school", "A school off the avenue: the playground check, the crossing guard's corner and the safety labels in the kitchen."),
      site("nup-lead-safe-painting", "a Lower Garden District Repaint", "construction", [-90.0825, 29.9395], "repaint", "An old house repainted lead-safe: containment, the sprayer, the scaffold and the lifeline."),
      site("nup-gas-service", "an Uptown House Renovation", "construction", [-90.0930, 29.9360], "renovation", "An old house's pipes and water heater renewed: the glovebag on old lagging, the gas pressure test and a guarded hatch."),
      site("nup-roofing-crew", "an Irish Channel Roofing Crew", "construction", [-90.0860, 29.9215], "roof", "A roof tear-off on a raised cottage: the debris chute, a guarded skylight and a lifeline."),
      site("nup-fire-station", "an Uptown Fire Station", "fire-station", [-90.1045, 29.9340], "fire", "A firehouse on the avenue: size-up among old wooden houses, the aerial ladder and rehab after a long call."),
      site("nup-streetcar-barn-yard", "a Streetcar Maintenance Yard", "streetcar", [-90.1175, 29.9425], "barn", "Where the avenue's cars are kept up: the lift, the signal cabinet and a car secured on the yard track."),
    ],
    landmarks: [["lafayette-cemetery", "Lafayette Cemetery", "place", -90.0852, 29.9289], ["st-charles-streetcar", "a streetcar on St. Charles Avenue", "place", -90.0990, 29.9255, "streetcar"], ["garden-district-houses", "the Garden District's houses", "neighbourhood", -90.0870, 29.9255, "victorian-house"], ["uptown-shotgun-row", "a row of Uptown shotgun houses", "neighbourhood", -90.1060, 29.9300, "shotgun-row"], ["napoleon-wharf", "the wharves on the river bend", "riverfront", -90.1045, 29.9185, "wharf-pier-shed"], ["university-towers", "the universities on St. Charles", "campus", -90.1170, 29.9355, "campanile"], ["uptown-levee", "the Uptown river levee", "levee", -90.0960, 29.9180], ["nup-sign", "a sign: the site layouts are illustrative; the streets, the river and the neighbourhoods are real", "sign", -90.0975, 29.9275]],
    connectors: [
      ["nd-up-orleans-st-charles", "road", "St. Charles Avenue out to the whole of New Orleans", "orleans", [-90.1100, 29.9285], "conn-nd-uptown-st-charles", "St. Charles Avenue into the Garden District and Uptown (zoom in)"],
      ["nd-up-orleans-claiborne", "road", "South Claiborne Avenue out to the whole of New Orleans", "orleans", [-90.0900, 29.9420], "conn-nd-uptown-claiborne", "South Claiborne Avenue into Uptown (zoom in)"],
    ],
    lessons: [
      { id: "nd-fl-streetcar-wire", title: "The Wire Over the Streetcar", site: "nup-streetcar-overhead-wire", landmark: "st-charles-streetcar", k12: "k12-reading-instructions-and-safety-labels", station: "line-truck", trade: "Overhead line electricians", tradeLine: "An overhead line crew treats the streetcar wire as live until it is proven dead and keeps ladders and poles well clear.", minutes: 3, steps: ["Look up at the thin wire above the tracks.", "It carries the power that moves the streetcar.", "The crew keeps poles and ladders away from it unless it is switched off and tested."], check: { q: "Why do people keep poles and ladders away from the wire?", options: ["It carries power and can hurt you", "It is freshly painted", "Birds sit on it"], answer: 0, why: "Overhead wires carry electricity, so only trained crews work near them once the power is off." } },
      { id: "nd-fl-live-oak-drop-zone", title: "The Drop Zone Under a Live Oak", site: "nup-live-oak-crew", landmark: "garden-district-houses", k12: "k12-reading-instructions-and-safety-labels", station: "gk-tree-work-pole-saw-and-drop-zone", trade: "Tree crews", tradeLine: "A tree crew marks a drop zone with cones before a single branch is cut, and keeps everyone outside it.", minutes: 2, steps: ["Find the cones in a circle under the big oak.", "That circle is where cut branches can land.", "Everyone who is not cutting stays outside the cones."], check: { q: "Who may stand inside the cones?", options: ["Only the crew doing the cutting", "Anyone who wants to watch", "People waiting for the streetcar"], answer: 0, why: "Keeping people outside the drop zone means a falling branch cannot hit anyone." } },
      { id: "nd-fl-pump-in-the-rain", title: "Why the City Pumps the Rain", site: "nup-pumping-station", k12: "k12-reading-instructions-and-safety-labels", station: "lift-station", trade: "Pump station operators", tradeLine: "A pump station operator checks every pump and alarm before a storm, because the city's streets sit low and rain must be lifted out.", minutes: 3, steps: ["Find the big building by the drainage canal.", "Inside, pumps lift rainwater out of the low streets.", "Before a storm the crew checks every pump and alarm."], check: { q: "Why does the crew check the pumps before a storm?", options: ["So rain can be lifted out of the streets", "So the building stays cool", "So the canal gets deeper"], answer: 0, why: "Working pumps move storm water away before streets and homes flood." } },
    ],
    gated: [
      { id: "nd-up-gated-wire-walk", kind: "side-quest", title: "Walk the Wire With the Line Crew", site: "nup-streetcar-overhead-wire", siteName: "the St. Charles Overhead Wire Crew", gate: { stations: ["ra-roadway-worker-protection-and-job-briefing"], note: "Learn roadway worker protection before you walk the line with the overhead wire crew" } },
      { id: "nd-up-gated-oak-storm", kind: "side-quest", title: "Clear the Avenue After a Storm", site: "nup-live-oak-crew", siteName: "the St. Charles Live Oak Crew", gate: { stations: ["gk-tree-work-pole-saw-and-drop-zone"], note: "Learn the pole saw and the drop zone before you help clear branches off the avenue" } },
    ],
  },
  {
    id: "nola-mid-city-gentilly", exp: "NP_NOLA_MID_CITY_GENTILLY", name: "Mid-City, City Park & Gentilly",
    lon0: -90.0905, lat0: 29.9935, scale: 1.5,
    blurb: "The back of town between the river and the lake on foot: Mid-City's streets along Canal Street's streetcar, City Park's oaks and lagoons, Bayou St. John, the Fair Grounds, and Gentilly along the London Avenue Canal. The site layouts are illustrative; the streets, the canals, the bayou and the park are real.",
    start: "nmc-canal-streetcar-track",
    anchors: [["the museum in City Park", -90.093, 29.986], ["the Fair Grounds", -90.081, 29.984], ["the Magnolia Bridge on Bayou St. John", -90.087, 29.981], ["the corner of Canal and Carrollton", -90.101, 29.975], ["the London Avenue Canal at Mirabeau", -90.069, 30.010], ["the Orleans Avenue Canal at the interstate", -90.098, 29.996], ["the corner of Gentilly and Elysian Fields", -90.061, 30.001], ["Dillard University", -90.065, 29.992]],
    water: [
      { id: "bayou-st-john", name: "Bayou St. John", kind: "bayou", width: 55, ll: [[-90.0852, 30.0225], [-90.0848, 30.0100], [-90.0845, 30.0030], [-90.0855, 29.9950], [-90.0868, 29.9880], [-90.0880, 29.9820], [-90.0878, 29.9770]] },
      { id: "london-avenue-canal", name: "the London Avenue Canal", kind: "canal", width: 40, ll: [[-90.0692, 30.0225], [-90.0690, 30.0100], [-90.0690, 29.9925]] },
      { id: "orleans-avenue-canal", name: "the Orleans Avenue Canal", kind: "canal", width: 40, ll: [[-90.0985, 30.0225], [-90.0984, 30.0100], [-90.0983, 29.9960]] },
      { id: "city-park-big-lake", name: "City Park's Big Lake", kind: "lake", ll: [[-90.0935, 29.9888], [-90.0905, 29.9890], [-90.0898, 29.9908], [-90.0930, 29.9910]] },
      { id: "city-park-lagoon", name: "a City Park lagoon", kind: "lake", ll: [[-90.0950, 30.0040], [-90.0925, 30.0045], [-90.0915, 30.0072], [-90.0940, 30.0078]] },
    ],
    levees: [["london-canal-floodwall-east", "the London Avenue Canal floodwall, east side", 4, [[-90.0686, 30.0225], [-90.0685, 29.9930]]], ["london-canal-floodwall-west", "the London Avenue Canal floodwall, west side", 4, [[-90.0697, 30.0225], [-90.0696, 29.9930]]], ["orleans-canal-floodwall", "the Orleans Avenue Canal floodwall", 4, [[-90.0978, 30.0225], [-90.0977, 29.9965]]]],
    roads: [
      ["canal-street", "Canal Street and its streetcar", "avenue", [[-90.0800, 29.9600], [-90.0880, 29.9650], [-90.0950, 29.9705], [-90.1010, 29.9750], [-90.1075, 29.9805]]],
      ["north-carrollton-avenue", "North Carrollton Avenue and its streetcar", "avenue", [[-90.1010, 29.9750], [-90.0970, 29.9800], [-90.0935, 29.9848]]],
      ["esplanade-avenue", "Esplanade Avenue", "avenue", [[-90.0620, 29.9665], [-90.0720, 29.9730], [-90.0800, 29.9790], [-90.0870, 29.9840]]],
      ["gentilly-boulevard", "Gentilly Boulevard", "avenue", [[-90.0825, 29.9865], [-90.0760, 29.9900], [-90.0680, 29.9960], [-90.0600, 30.0030]]],
      ["elysian-fields-avenue", "Elysian Fields Avenue", "avenue", [[-90.0592, 29.9800], [-90.0600, 29.9950], [-90.0610, 30.0120], [-90.0615, 30.0220]]],
      ["interstate-six-ten", "the interstate across the city's middle", "interstate", [[-90.1223, 29.9965], [-90.1000, 29.9962], [-90.0850, 29.9950], [-90.0700, 29.9922], [-90.0600, 29.9900]]],
      ["north-broad-street", "North Broad Street", "avenue", [[-90.0870, 29.9660], [-90.0835, 29.9730], [-90.0790, 29.9800]]],
      ["filmore-avenue", "Filmore Avenue", "street", [[-90.1200, 30.0060], [-90.1000, 30.0060], [-90.0850, 30.0058], [-90.0600, 30.0055]]],
      ["mirabeau-avenue", "Mirabeau Avenue", "street", [[-90.0845, 30.0105], [-90.0700, 30.0100], [-90.0600, 30.0095]]],
      ["city-park-avenue", "City Park Avenue", "street", [[-90.1075, 29.9805], [-90.1000, 29.9830], [-90.0935, 29.9848]]],
    ],
    districts: [["mid-city", "Mid-City", "suburb", [-90.1100, 29.9659, -90.0850, 29.9830]], ["city-park", "City Park", "park", [-90.0985, 29.9850, -90.0855, 30.0211]], ["bayou-st-john", "Bayou St. John", "garden", [-90.0880, 29.9760, -90.0800, 29.9860]], ["gentilly", "Gentilly", "suburb", [-90.0840, 29.9900, -90.0586, 30.0211]], ["seventh-ward", "the Seventh Ward", "quarter", [-90.0800, 29.9700, -90.0586, 29.9900]], ["lakeview-edge", "the edge of Lakeview", "suburb", [-90.1223, 29.9950, -90.0990, 30.0211]], ["cemeteries", "the cemeteries at the end of Canal Street", "park", [-90.1223, 29.9780, -90.1080, 29.9900]]],
    sites: [
      site("nmc-cottage-restoration", "a Seventh Ward Creole Cottage Restoration", "construction", [-90.0700, 29.9800], "restore", "A Creole cottage brought back: scaffold on the banquette, silica control on old brick, lime plaster and a new roof."),
      site("nmc-canal-streetcar-track", "the Canal Streetcar Line Track Crew", "streetcar", [-90.0955, 29.9718], "track", "Track work on the Canal Street line's neutral ground toward the cemeteries: roadway worker protection, the switch and the signals."),
      site("nmc-carrollton-streetcar-wire", "the Carrollton Streetcar Overhead Wire Crew", "streetcar", [-90.0985, 29.9790], "wire", "The overhead wire where the line turns up Carrollton to the park: the line truck, the lookouts and the signal cabinet."),
      site("nmc-pumping-station", "a Mid-City Drainage Pumping Station", "pump", [-90.0965, 29.9960], "pump", "A pumping station that sends the rain toward the lake through the Orleans Avenue Canal: the motor control centre, permit entry and the storm generator."),
      site("nmc-london-canal-floodwall", "the London Avenue Canal Floodwall Crew", "floodwall", [-90.0710, 30.0060], "levee", "The crew on the canal's floodwall: the seepage walk, the dozer on the slope and a floodwall pour."),
      site("nmc-bayou-st-john-bank", "the Bayou St. John Bank Crew", "wetland", [-90.0830, 29.9900], "wetland", "The bayou's banks kept healthy: the transect, native planting, erosion mats and the water quality probe."),
      site("nmc-city-park-grounds", "the City Park Grounds Crew", "park", [-90.0960, 30.0010], "oaks", "The park's oaks and lawns: the pole saw, the drop zone, the chipper and the trimmer's bystander zone."),
      site("nmc-museum-conservation", "a City Park Museum Events Crew", "theatre", [-90.0915, 29.9868], "museum", "The crew behind a museum's evenings: the fire alarm room, the events set-up and rigging for the show."),
      site("nmc-school-campus", "a Mid-City School Campus", "school", [-90.0890, 29.9735], "school", "A school off Esplanade: the playground check, the crossing guard's corner and the safety labels in the kitchen."),
      site("nmc-university-campus", "a Gentilly University Facilities Crew", "campus", [-90.0640, 29.9935], "campus", "The crews that keep a campus in Gentilly running: the chiller plant, the fire alarm room and the lab's storage."),
      site("nmc-fairgrounds-event-crew", "the Fair Grounds Festival Stage Crew", "events", [-90.0780, 29.9850], "stage", "The crew that builds the festival stages at the Fair Grounds: stage power, the rigging loft, truss load-in and the barricade."),
      site("nmc-restaurant-kitchen", "a Mid-City Restaurant Kitchen", "hospitality", [-90.0920, 29.9695], "kitchen", "A kitchen on the streetcar line: the gas shut-off, the fryer oil change, the dish pit and the slicer lockout."),
      site("nmc-drainage-culvert", "a Gentilly Drainage Culvert Crew", "stormwater", [-90.0760, 30.0005], "drain", "A culvert that carries Gentilly's rain to the canal: the trench box, the manhole's air check and the storm call-out."),
      site("nmc-street-reconstruction", "a Mid-City Street Reconstruction", "construction", [-90.0840, 29.9760], "street", "A street rebuilt with new drains under it: the grade and crown, the compactor, the pour and traffic kept moving."),
      site("nmc-fire-station", "a Gentilly Fire Station", "fire-station", [-90.0650, 30.0120], "fire", "A firehouse on a Gentilly avenue: size-up, the aerial ladder and rehab after a long call."),
      site("nmc-roofing-crew", "a Gentilly Roofing Crew", "construction", [-90.0770, 30.0150], "roof", "A roof tear-off on a raised house: the debris chute, a guarded skylight and a lifeline."),
      site("nmc-substation", "a Mid-City Electrical Substation", "substation", [-90.1060, 29.9900], "vault", "A neighbourhood substation: switching, the transformer vault and the line truck."),
      site("nmc-hospital-campus", "a Mid-City Hospital Campus", "hospital", [-90.0835, 29.9680], "hospital", "A hospital campus near Canal Street: moving patients safely, the crash cart, sterile processing and medical gas."),
    ],
    landmarks: [["city-park-oaks", "City Park's live oaks", "park", -90.0945, 29.9930], ["magnolia-bridge", "the Magnolia Bridge on Bayou St. John", "bridge", -90.0872, 29.9812, "truss-bridge"], ["fair-grounds", "the Fair Grounds", "place", -90.0808, 29.9838], ["london-canal-pump", "a pumping station on the London Avenue Canal", "canal", -90.0705, 30.0200, "levee-pump-station"], ["canal-streetcar-cemeteries", "a streetcar at the end of Canal Street", "place", -90.1060, 29.9795, "streetcar"], ["city-park-boardwalk", "a boardwalk by a City Park lagoon", "park", -90.0955, 30.0060, "marsh-boardwalk"], ["museum-colonnade", "the museum's columns in City Park", "place", -90.0932, 29.9862, "rotunda-colonnade"], ["nmc-sign", "a sign: the site layouts are illustrative; the streets, the canals, the bayou and the park are real", "sign", -90.0920, 29.9760]],
    connectors: [
      ["nd-mc-orleans-carrollton", "road", "North Carrollton Avenue out to the whole of New Orleans", "orleans", [-90.0975, 29.9795], "conn-nd-mid-city-carrollton", "North Carrollton Avenue into Mid-City and City Park (zoom in)"],
      ["nd-mc-orleans-gentilly", "road", "Gentilly Boulevard out to the whole of New Orleans", "orleans", [-90.0680, 29.9962], "conn-nd-mid-city-gentilly", "Gentilly Boulevard into Gentilly (zoom in)"],
      ["nd-mc-bywater-elysian", "road", "Elysian Fields Avenue down to the Marigny", "nola-bywater-lower-ninth", [-90.0586, 29.9760], "nd-bw-mc-elysian", "Elysian Fields Avenue up to Gentilly", [-90.0597, 29.9820], [-90.0570, 29.9720]],
    ],
    lessons: [
      { id: "nd-fl-canal-floodwall", title: "A Wall Along the Canal", site: "nmc-london-canal-floodwall", landmark: "london-canal-pump", k12: "k12-reading-instructions-and-safety-labels", station: "br-levee-inspection-and-seepage", trade: "Levee and floodwall crews", tradeLine: "A floodwall crew walks the canal wall often, looking for wet ground or bubbling water on the dry side.", minutes: 3, steps: ["Find the long wall beside the canal.", "Rain water from the streets is pumped into the canal toward the lake.", "The crew walks the dry side looking for wet ground or bubbling water."], check: { q: "What is the crew looking for on the dry side of the wall?", options: ["Wet ground or bubbling water", "Lost footballs", "New paint"], answer: 0, why: "Water showing up on the dry side can mean the wall needs repair before the next storm." } },
      { id: "nd-fl-bayou-bank", title: "Plants That Hold the Bank", site: "nmc-bayou-st-john-bank", landmark: "magnolia-bridge", k12: "k12-reading-instructions-and-safety-labels", station: "br-native-planting-and-erosion-mats", trade: "Wetland restoration crews", tradeLine: "A restoration crew plants native grasses and lays erosion mats so the bayou's bank holds together.", minutes: 2, steps: ["Look along the edge of the bayou.", "Roots of native plants hold the soil in place.", "Where the bank is bare, the crew lays mats and plants new grass."], check: { q: "What holds the soil of the bank in place?", options: ["Roots of native plants", "Painted rocks", "Fishing lines"], answer: 0, why: "Roots bind the soil, so the water cannot wash the bank away." } },
      { id: "nd-fl-festival-barricade", title: "The Barricade in Front of the Stage", site: "nmc-fairgrounds-event-crew", landmark: "fair-grounds", k12: "k12-reading-instructions-and-safety-labels", station: "le-crowd-barricade-and-show-stop-call", trade: "Stagehands", tradeLine: "A stage crew sets a sturdy barricade and agrees who can call a show stop before any crowd arrives.", minutes: 3, steps: ["Find the metal barrier in front of the stage.", "It keeps a space clear between the crowd and the stage.", "The crew agrees who can stop the show if someone needs help."], check: { q: "Why is there a clear space in front of the stage?", options: ["So the crew can help anyone who needs it", "So the band can sit down", "So the grass can grow"], answer: 0, why: "A clear space and a show stop call let the crew reach anyone quickly." } },
    ],
    gated: [
      { id: "nd-mc-gated-festival-stage", kind: "side-quest", title: "Build the Festival Stage", site: "nmc-fairgrounds-event-crew", siteName: "the Fair Grounds Festival Stage Crew", gate: { stations: ["stage-load-in-and-truss-rigging"], note: "Learn the load-in and truss rigging before you help build the festival stage" } },
      { id: "nd-mc-gated-canal-walk", kind: "side-quest", title: "Walk the Canal Wall Before a Storm", site: "nmc-london-canal-floodwall", siteName: "the London Avenue Canal Floodwall Crew", gate: { stations: ["br-levee-inspection-and-seepage"], note: "Learn to inspect a levee for seepage before you walk the canal wall with the crew" } },
    ],
  },
  {
    id: "nola-bywater-lower-ninth", exp: "NP_NOLA_BYWATER_LOWER_NINTH", name: "The Marigny, Bywater, the Lower Ninth Ward & Holy Cross",
    lon0: -90.03186, lat0: 29.963, scale: 1.25,
    blurb: "Downriver from the Quarter on foot: the Marigny and Bywater's shotgun rows, the riverfront park and wharves, the rail line, the Industrial Canal and its lock, and across it the Lower Ninth Ward and Holy Cross on the levee, with Bayou Bienvenue's marsh behind. The site layouts are illustrative; the streets, the river, the canal and the neighbourhoods are real.",
    start: "nbw-st-claude-streetcar-track",
    anchors: [["Washington Square in the Marigny", -90.057, 29.965], ["the Industrial Canal lock", -90.026, 29.961], ["the Holy Cross levee", -90.015, 29.955], ["Algiers Point", -90.053, 29.953], ["the corner of St. Claude and Poland", -90.032, 29.965], ["the Bayou Bienvenue wetland", -90.015, 29.981], ["the corner of Claiborne and Tennessee", -90.018, 29.968], ["the corner of Elysian Fields and Claiborne", -90.057, 29.974]],
    water: [
      { id: "mississippi-river", name: "the Mississippi River", kind: "river", river: true },
      { id: "industrial-canal", name: "the Industrial Canal", kind: "canal", width: 150, ll: [[-90.0258, 29.9555], [-90.0260, 29.9620], [-90.0262, 29.9700], [-90.0265, 29.9790], [-90.0270, 29.9860]] },
      { id: "bayou-bienvenue", name: "the Bayou Bienvenue wetland", kind: "wetland", ll: [[-90.0200, 29.9780], [-90.0120, 29.9765], [-90.0065, 29.9755], [-90.0065, 29.9855], [-90.0200, 29.9855]] },
    ],
    levees: [["bywater-river-levee", "the river levee along the Bywater and Holy Cross", 5, "bank", 1, 390], ["algiers-point-levee", "the Algiers Point levee", 5, "bank", -1, 390], ["industrial-canal-floodwall-east", "the Industrial Canal floodwall, Lower Ninth side", 5, [[-90.0245, 29.9600], [-90.0247, 29.9700], [-90.0250, 29.9790]]], ["industrial-canal-floodwall-west", "the Industrial Canal floodwall, Bywater side", 5, [[-90.0273, 29.9600], [-90.0276, 29.9700], [-90.0280, 29.9790]]]],
    roads: [
      ["st-claude-avenue", "St. Claude Avenue", "avenue", [[-90.0584, 29.9655], [-90.0500, 29.9668], [-90.0420, 29.9672], [-90.0340, 29.9662], [-90.0262, 29.9635], [-90.0180, 29.9608], [-90.0065, 29.9575]]],
      ["north-claiborne-avenue", "North Claiborne Avenue", "avenue", [[-90.0584, 29.9745], [-90.0460, 29.9755], [-90.0340, 29.9740], [-90.0262, 29.9715], [-90.0150, 29.9685], [-90.0065, 29.9665]]],
      ["dauphine-street", "Dauphine Street", "street", [[-90.0584, 29.9640], [-90.0480, 29.9640], [-90.0400, 29.9630], [-90.0300, 29.9608]]],
      ["elysian-fields-avenue", "Elysian Fields Avenue", "avenue", [[-90.0560, 29.9630], [-90.0570, 29.9720], [-90.0580, 29.9855]]],
      ["poland-avenue", "Poland Avenue", "street", [[-90.0318, 29.9612], [-90.0325, 29.9700], [-90.0330, 29.9780]]],
      ["florida-avenue", "Florida Avenue", "street", [[-90.0440, 29.9840], [-90.0330, 29.9820], [-90.0262, 29.9800], [-90.0150, 29.9760], [-90.0065, 29.9745]]],
      ["tennessee-street", "Tennessee Street", "street", [[-90.0165, 29.9585], [-90.0180, 29.9680], [-90.0195, 29.9765]]],
      ["the-interstate-east", "the interstate toward New Orleans East", "interstate", [[-90.0584, 29.9795], [-90.0480, 29.9840], [-90.0380, 29.9858]]],
      ["algiers-point-streets", "the streets of Algiers Point", "street", [[-90.0580, 29.9420], [-90.0540, 29.9475], [-90.0500, 29.9520]]],
    ],
    districts: [["marigny", "the Faubourg Marigny", "quarter", [-90.0584, 29.9620, -90.0480, 29.9720]], ["bywater", "the Bywater", "suburb", [-90.0480, 29.9610, -90.0275, 29.9760]], ["lower-ninth-ward", "the Lower Ninth Ward", "suburb", [-90.0245, 29.9640, -90.0060, 29.9760]], ["holy-cross", "Holy Cross", "garden", [-90.0245, 29.9540, -90.0060, 29.9640]], ["riverfront-wharves", "the riverfront wharves and rail line", "industrial", [-90.0460, 29.9600, -90.0290, 29.9625]], ["bienvenue-marsh", "the Bayou Bienvenue marsh", "wetland", [-90.0200, 29.9765, -90.0060, 29.9855]], ["algiers-point", "Algiers Point", "garden", [-90.0584, 29.9400, -90.0480, 29.9530]]],
    sites: [
      site("nbw-creole-cottage-restoration", "a Marigny Creole Cottage Restoration", "construction", [-90.0540, 29.9665], "restore", "A Creole cottage on a Marigny street: scaffold on the banquette, silica control on old brick, lime plaster and a new roof."),
      site("nbw-st-claude-streetcar-track", "the St. Claude Streetcar Track Crew", "streetcar", [-90.0450, 29.9678], "track", "Track work on the St. Claude line: roadway worker protection, the switch and the crossing signals."),
      site("nbw-industrial-canal-floodwall", "the Industrial Canal Floodwall Crew", "floodwall", [-90.0225, 29.9720], "levee", "The crew on the canal's floodwall on the Lower Ninth side: the seepage walk, the dozer on the slope and a floodwall pour."),
      site("nbw-canal-lock-crew", "the Industrial Canal Lock Crew", "lock", [-90.0295, 29.9635], "lock", "The crew that works vessels through the lock between the river and the canal: towing lines, the radio, mooring and fenders."),
      site("nbw-river-levee-crew", "the Holy Cross River Levee Crew", "levee", [-90.0120, 29.9570], "levee", "The crew on the river levee at Holy Cross: seepage walks, the dozer on the slope and a floodwall pour."),
      site("nbw-pumping-station", "a Bywater Drainage Pumping Station", "pump", [-90.0380, 29.9790], "pump", "A pumping station that lifts the rain out of the Bywater: the motor control centre, permit entry and the storm generator."),
      site("nbw-home-rebuild", "a Lower Ninth Ward Home Rebuild", "construction", [-90.0150, 29.9710], "build", "A raised house going up on new piers: the pour, the shoring and rebar caps, with the crew's safety briefing first."),
      site("nbw-bienvenue-wetland", "the Bayou Bienvenue Wetland Crew", "wetland", [-90.0140, 29.9745], "wetland", "The crew at the marsh behind the Lower Ninth: the transect, native planting, erosion mats and the water quality probe."),
      site("nbw-wharf-crew", "a Bywater Riverfront Wharf Crew", "port", [-90.0380, 29.9625], "wharf", "A working wharf on the river: the crane, the lashing gear, the lines and the gangway."),
      site("nbw-rail-yard", "the Bywater Rail Line Crew", "rail", [-90.0435, 29.9760], "rail", "The rail line through the Bywater: blue-flag protection, switching and the roadway worker briefing."),
      site("nbw-marigny-kitchen", "a Frenchmen Street Restaurant Kitchen", "hospitality", [-90.0565, 29.9650], "restaurant", "A kitchen near the music clubs: the line, the hood, the bar well and the grease trap."),
      site("nbw-music-venue-rigging", "a Marigny Music Venue Stage Crew", "theatre", [-90.0525, 29.9640], "stage", "A club stage's crew: stage power, the rigging loft, truss load-in and the barricade and show stop."),
      site("nbw-school-campus", "a Lower Ninth Ward School Campus", "school", [-90.0110, 29.9690], "school", "A school in the Lower Ninth: the playground check, the crossing guard's corner and the safety labels in the kitchen."),
      site("nbw-fire-station", "a Bywater Fire Station", "fire-station", [-90.0350, 29.9700], "fire", "A firehouse in the Bywater: size-up among wooden houses, the aerial ladder and rehab after a long call."),
      site("nbw-drainage-crew", "a Lower Ninth Drainage Crew", "stormwater", [-90.0200, 29.9660], "drain", "Drain lines renewed under the Lower Ninth's streets: the trench box, the manhole's air check and the storm call-out."),
      site("nbw-solar-roof", "a Holy Cross Solar Roof Install", "construction", [-90.0170, 29.9600], "solar", "Solar panels on a raised house's roof: temporary power, the lifeline, a guarded hatch and the line truck."),
      site("nbw-riverfront-park-crew", "the Riverfront Park Grounds Crew", "park", [-90.0480, 29.9632], "grounds", "The crew that keeps the riverfront park along the Bywater: the pole saw, the trimmer's bystander zone and the irrigation box."),
      site("nbw-algiers-ferry-landing", "the Algiers Point Ferry Landing Crew", "ferry", [-90.0538, 29.9488], "ferry", "The Algiers Point landing for the ferry across to the Quarter: the gangway, passengers and a man-overboard drill."),
    ],
    landmarks: [["industrial-canal-lock", "the Industrial Canal lock", "lock", -90.0262, 29.9608, "canal-lock"], ["holy-cross-levee", "the Holy Cross levee", "levee", -90.0140, 29.9560], ["bienvenue-boardwalk", "a boardwalk over the Bayou Bienvenue marsh", "wetland", -90.0170, 29.9800, "marsh-boardwalk"], ["bywater-shotgun-row", "a row of Bywater shotgun houses", "neighbourhood", -90.0400, 29.9660, "shotgun-row"], ["st-claude-bridge", "the St. Claude Avenue bridge over the canal", "bridge", -90.0262, 29.9636, "truss-bridge"], ["marigny-streetcar", "a streetcar on St. Claude Avenue", "place", -90.0500, 29.9670, "streetcar"], ["algiers-point-landing", "the landing at Algiers Point", "point", -90.0540, 29.9495], ["nbw-sign", "a sign: the site layouts are illustrative; the streets, the river, the canal and the neighbourhoods are real", "sign", -90.0420, 29.9690]],
    connectors: [
      ["nd-bw-orleans-st-claude", "road", "St. Claude Avenue out to the whole of New Orleans", "orleans", [-90.0330, 29.9664], "conn-nd-bywater-st-claude", "St. Claude Avenue into the Bywater (zoom in)"],
      ["nd-bw-orleans-lower-ninth", "road", "North Claiborne Avenue out to the whole of New Orleans", "orleans", [-90.0150, 29.9690], "conn-nd-lower-ninth-claiborne", "North Claiborne Avenue into the Lower Ninth Ward (zoom in)"],
    ],
    lessons: [
      { id: "nd-fl-canal-lock", title: "How a Lock Lifts a Boat", site: "nbw-canal-lock-crew", landmark: "industrial-canal-lock", k12: "k12-simple-machines-at-a-crane", station: "mw-workboat-towing-and-line-handling", trade: "Lock and towboat crews", tradeLine: "A lock crew fills or empties the chamber slowly while the deckhands keep their lines tended and stand clear of the bight.", minutes: 3, steps: ["Find the long chamber with gates at each end.", "A boat goes in, the gates close, and water fills or drains to match the other side.", "Deckhands tend their lines and never stand where a line could snap back."], check: { q: "Where should a deckhand never stand?", options: ["Where a tight line could snap back", "On the deck", "Next to the crew"], answer: 0, why: "A line under strain can snap back hard, so crews stand clear of it." } },
      { id: "nd-fl-marsh-transect", title: "Counting Plants Along a Line", site: "nbw-bienvenue-wetland", landmark: "bienvenue-boardwalk", k12: "k12-reading-instructions-and-safety-labels", station: "marsh-transect-survey", trade: "Wetland scientists and crews", tradeLine: "A wetland crew stretches a line across the marsh and records what grows along it, the same way each time, to see how it changes.", minutes: 3, steps: ["Look out from the boardwalk at the marsh.", "The crew stretches a line and notes the plants along it.", "Doing it the same way each time shows whether the marsh is growing back."], check: { q: "Why does the crew do the count the same way each time?", options: ["So they can see how the marsh changes", "So it is faster to finish", "So the birds stay away"], answer: 0, why: "The same method each time makes changes in the marsh easy to see." } },
      { id: "nd-fl-raised-house", title: "Why New Houses Stand Up High", site: "nbw-home-rebuild", k12: "k12-reading-instructions-and-safety-labels", station: "bt-rebar-tying-and-impalement-protection", trade: "Carpenters and concrete crews", tradeLine: "A building crew caps every sticking-up bar on the piers so nobody can fall onto one while the house goes up.", minutes: 2, steps: ["Find the new piers the house will stand on.", "Houses here are raised so water can pass under them in a flood.", "Every steel bar sticking up gets a bright cap so nobody can fall onto it."], check: { q: "Why do the steel bars get caps?", options: ["So nobody can be hurt falling onto them", "To make them look nice", "To keep them warm"], answer: 0, why: "Caps cover sharp ends, so a trip or fall onto a bar does not cause an injury." } },
    ],
    gated: [
      { id: "nd-bw-gated-lock-through", kind: "side-quest", title: "Take a Towboat Through the Lock", site: "nbw-canal-lock-crew", siteName: "the Industrial Canal Lock Crew", gate: { stations: ["mw-workboat-towing-and-line-handling"], note: "Learn towing and line handling before you work a boat through the lock" } },
      { id: "nd-bw-gated-marsh-plant", kind: "side-quest", title: "Plant the Marsh Edge", site: "nbw-bienvenue-wetland", siteName: "the Bayou Bienvenue Wetland Crew", gate: { stations: ["br-native-planting-and-erosion-mats"], note: "Learn native planting and erosion mats before you help plant the marsh edge" } },
    ],
  },
];

// ------------------------------------------------------------------ write
const HEADER = (d) => `// ${d.name} — one 4096 m streamed New Orleans neighbourhood district on the shared parish schema
// (docs/parishes.md "Districts inside a parish", docs/consoles/NOLA-DISTRICTS.md), region "new-orleans-districts",
// \`parent: "orleans"\`: a near-true-scale child of the Orleans map (the "zoom in"), walked into from the parent at the
// matching place and back out; its field may overlap only its parent, never a sibling district.
//
// Facts rule: real places appear only by their public names, as places (a neighbourhood, a street, a square, a park, the
// river, a canal); no history, dates, statistics, addresses, business names or heights of real places. Coordinates are
// approximate (three decimals, \`approximate: true\`) and exist only to place a map. The project and site layouts are
// illustrative (PROCEDURAL): the crews and site names are training places, not real businesses; the parish, the
// waterways and the neighbourhoods are real.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
//
// Written once by tools/gen_nd_districts.mjs from approximate lon/lat; edit the numbers here directly. Pure: no
// three.js, no DOM. Every top-level name is prefixed np/NP_ (the bundler concatenates all modules into one scope).
`;
const box = (F, [a, b, c, e]) => [F.xzc([a, e]), F.xzc([c, e]), F.xzc([c, b]), F.xzc([a, b])];
const out = {};
const warn = [];
for (const d of D) {
  const F = frame(d.lon0, d.lat0, d.scale);
  const river = clipLine(F, RIVER);
  const riverHalf = F.m(RIVER_M) / 2;
  const bank = (side, metres) => offset(river, F.m(metres), side);
  const p = {
    id: d.id, name: d.name, region: "new-orleans-districts", parent: "orleans", size: 4096, scale: d.scale, blurb: d.blurb, start: d.start,
    anchors: d.anchors.map(([name, lon, lat]) => ({ xz: F.xz([lon, lat]), lonlat: [lon, lat], approximate: true, name })),
    water: d.water.map((w) => {
      if (w.river) return { id: w.id, name: w.name, kind: w.kind, width: F.m(RIVER_M), poly: river };
      if (w.bank) { const a = bank(w.bank, w.from), b = bank(w.bank, w.to); return { id: w.id, name: w.name, kind: w.kind, poly: [...a, ...b.reverse()] }; }
      return { id: w.id, name: w.name, kind: w.kind, ...(w.width ? { width: F.m(w.width) } : {}), poly: w.width ? clipLine(F, w.ll) : w.ll.map(F.xzc) };
    }),
    levees: d.levees.map(([id, name, height, ll, side, metres]) => ({ id, name, height, pts: ll === "bank" ? bank(side, metres) : clipLine(F, ll) })),
    roads: d.roads.map(([id, name, kind, ll, side, metres]) => ({ id, name, kind, pts: ll === "bank" ? bank(side, metres) : clipLine(F, ll) })),
    districts: d.districts.map(([id, name, character, b]) => ({ id, name, character, poly: box(F, b) })),
    sites: d.sites.map(({ ll, ...s }) => ({ id: s.id, name: s.name, kind: s.kind, position: F.xz(ll), trades: s.trades, programmes: s.programmes, stations: s.stations, blurb: s.blurb })),
    landmarks: d.landmarks.map(([id, name, kind, lon, lat, lm]) => ({ id, name, position: F.xz([lon, lat]), kind, ...(lm ? { lm } : {}) })),
    connectors: [],
    fieldLessons: d.lessons,
    gated: d.gated.map((g) => ({ ...g, world: "parishes", parish: d.id, summary: g.title })),
  };
  // keep drawn roads and pads off the river: report anything inside the ribbon
  for (const s of p.sites) {
    const dd = lineDist(s.position, river);
    if (river.length > 1 && dd < riverHalf + 30) warn.push(`${d.id}/${s.id}: ${Math.round(dd)} m from the river's centre (half width ${riverHalf})`);
    for (const w of p.water.filter((x) => x.width && !x.river)) { const q = lineDist(s.position, w.poly); if (q < w.width / 2 + 30) warn.push(`${d.id}/${s.id}: ${Math.round(q)} m from ${w.id}`); }
    if (Math.abs(s.position[0]) > HALF - 40 || Math.abs(s.position[1]) > HALF - 40) warn.push(`${d.id}/${s.id}: off the field ${s.position}`);
  }
  out[d.id] = { d, p, F };
}
// connectors: every far end through the other map's own fit
const NP = await import(pathToFileURL(join(SHARED, "np-geo.js")).href);
const orleansMod = await import(pathToFileURL(join(SHARED, "np-data-orleans.js")).href);
const parent = orleansMod.NP_ORLEANS;
const orleansBack = [];
const fitOf = (id) => (id === "orleans" ? { xz: (ll) => NP.npGeoToXz(parent, ll).map(Math.round) } : { xz: out[id].F.xz });
for (const { d, p, F } of Object.values(out)) {
  for (const [cid, kind, name, to, lonlat, backId, backName, ownLl, farLl] of d.connectors) {
    const own = ownLl ?? lonlat, far = farLl ?? lonlat;
    p.connectors.push({ id: cid, kind, name, from: { parish: d.id, position: F.xz(own) }, to: { parish: to, position: fitOf(to).xz(far), lonlat }, lonlat, approximate: true });
    if (to === "orleans") orleansBack.push({ id: backId, kind, name: backName, from: { parish: "orleans", position: fitOf("orleans").xz(lonlat) }, to: { parish: d.id, position: F.xz(own), lonlat }, lonlat, approximate: true });
    else if (out[to]) out[to].d.connectors.some((c) => c[0] === backId) || out[to].p.connectors.push({ id: backId, kind, name: backName, from: { parish: to, position: out[to].F.xz(far) }, to: { parish: d.id, position: F.xz(own), lonlat }, lonlat, approximate: true });
  }
}
for (const { d, p } of Object.values(out)) {
  writeFileSync(join(SHARED, `np-data-${d.id}.js`), `${HEADER(d)}\nexport const ${d.exp} = ${JSON.stringify(p, null, 1)};\n`);
  console.log(`wrote np-data-${d.id}.js: ${p.sites.length} sites, ${p.landmarks.length} landmarks, ${p.roads.length} roads, ${p.connectors.length} connectors`);
}
// mirror connectors into the parent: rewrite only Orleans's connectors array (pretty JSON, one-space indent)
{
  const file = join(SHARED, "np-data-orleans.js");
  const src = readFileSync(file, "utf8");
  const kept = parent.connectors.filter((c) => !orleansBack.some((b) => b.id === c.id) && !String(c.id).startsWith("conn-nd-"));
  const all = [...kept, ...orleansBack];
  const pretty = src.match(/\n "connectors": \[[\s\S]*?\n \],\n/);
  if (!pretty) throw new Error("orleans: connectors array not found");
  const body = JSON.stringify(all, null, 1).split("\n").map((l, i) => (i ? " " + l : l)).join("\n");
  writeFileSync(file, src.replace(pretty[0], `\n "connectors": ${body},\n`));
  console.log(`mirrored ${orleansBack.length} connectors into np-data-orleans.js (${all.length} in all)`);
}
for (const w of warn) console.log(`  ! ${w}`);
