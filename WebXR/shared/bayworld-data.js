// Bay World — the pure ground truth: layout data and the zone/height/road
// lookup functions a game, a quest layer or a headless checker can call
// without touching three.js. shared/bayworld.js imports this and adds the
// builder.

// =============================================================================
// Bay World: a large stylised open world loosely modelled on a shoreline city
// and its inland hills — dense streets, a lake, a working port, a stadium
// district, and hills that climb away from the water — shared by two teams
// working in parallel: BAY2 (a free-roam driving-and-exploration game) plays
// it, BAY3 (a quest/objective layer) writes quests against the same sites and
// landmarks. Neither team's own app lives here; this module is only the
// shared ground truth both build against: the layout data (BAY_ZONES,
// BAY_LANDMARKS, BAY_ROADS, BAY_SITES), the pure zone/height/road functions a
// game or a quest script can call without touching three.js, and the one
// builder (shared/bayworld.js's buildBayWorld) that turns all of it into a
// scene.
//
// Everything here is original and generic: every place is named only by a
// plain, generic public-facing name (a downtown tower, a lake promenade, a
// truck yard), never a real organisation, brand or address, and no fact about
// a real place — a date, a height, a count, an owner or an event — is ever
// asserted. The world is *inspired by* a shoreline city with a bay, a port
// and inland hills, the same way shared/fairway.js's course is inspired by a
// golf course without modelling a real one.
//
// ----------------------------------------------------------------- geometry
//
// The world sits on a single field, x:[-1200,1200] z:[-800,800] — 2400 m by
// 1600 m in scene units (metres, the scale the rest of the platform already
// builds in). Sixteen named zones (BAY_ZONES) tile the field by nearest
// centre (bayZoneAt() below). The original ten sit where they always have
// (nothing that existed moved when the field grew): a dense downtown and an
// uptown strip inland of it, a lake, an estuary waterfront, a working port
// with container cranes, a West Oakland-style industrial flank, a
// Fruitvale-style market district, a stadium/arena district (the "Coliseum
// area"), hills that climb to the east, and the approach to a suspension
// bridge on the western edge. Six more ring them: an island across the
// estuary with a yacht harbour, a ferry landing and an airfield park; a
// university-town marina and pier on the north shoreline; a small
// distribution-and-lab town (Emery Crossing) between the bridge approach
// and that shoreline; a marina and treatment plant on the south shoreline;
// the upper hills, a ridge above the hills; and the outer bay, open water
// west of the port with a shipping channel and a buoy-tender pier at its
// edge. Twenty-eight public landmarks (BAY_LANDMARKS) and fifty training
// sites (BAY_SITES) are scattered across those zones, each one nearest to
// its own zone's centre than to any other's — bayZoneAt() assigning by
// nearest centre is what "every landmark/site is inside its own zone"
// actually means here.
//
// `buildBayWorld(parent, opts)` has two `opts.detail` levels, the same split
// shared/fairway.js uses for the same reason:
//   "high" — the whole 2400×1600 m world, built for a standalone free-roam
//     app or a quest layer that brings its own camera and its own mesh
//     budget. Documented budget: BAY_MESH_BUDGET.high.
//   "low" — a compact street-corner vignette near the world origin,
//     self-contained and independent of the zone/site data below. This is
//     what smartcity/js/districts.js's "bay-world" entry asks for: a
//     SmartCiti.X scenic district dropped into the shared stage, which caps a
//     district's own scenery at SCENIC_BUDGET (120 meshes, see districts.js)
//     — rendering the full world there would blow both the budget and the
//     distance the stage's own camera can see, for no benefit the walkable
//     preview was ever going to give a learner anyway.

// --------------------------------------------------------------------- data

/** The world's outer field, in scene units (metres): 2400 m × 1600 m. */
export const BAY_BOUNDS = { minX: -1200, maxX: 1200, minZ: -800, maxZ: 800 };

/** Bounded, continuous range bayHeight() returns, in metres. */
export const BAY_HEIGHT_RANGE = [0, 140];

/**
 * Sixteen zones tiling BAY_BOUNDS by nearest centre (see bayZoneAt()). Each is
 * `{ id, name, centre:[x,z], radius, palette:{accent,ground,structure,trim} }`
 * — `radius` is the zone's approximate visual extent for a builder deciding
 * how far to dress it, not a hard edge (bayZoneAt() assigns every point in
 * the field to its nearest zone centre regardless of radius, so the zones
 * always tile the whole field with no gap and no double cover).
 * `palette` is plain hex numbers in the same {accent, ground, structure,
 * trim} shape shared/textures.js's palette() uses, duplicated here (rather
 * than imported) so this module stays free of any three.js-adjacent import —
 * shared/bayworld.js is what turns a zone's own palette into materials.
 */
export const BAY_ZONES = [
  { id: "downtown", name: "Downtown", centre: [0, 0], radius: 180,
    palette: { accent: 0x4fd1ff, ground: 0x3a3f45, structure: 0x2b3542, trim: 0xdfe6ec } },
  { id: "uptown", name: "Uptown", centre: [-40, -230], radius: 140,
    palette: { accent: 0xf2c14b, ground: 0x4a3f3a, structure: 0x8b6a45, trim: 0x2b2f33 } },
  { id: "lake", name: "The Lake", centre: [260, -60], radius: 130,
    palette: { accent: 0x59c97b, ground: 0x2e6b3a, structure: 0x3a4a2c, trim: 0xfff2cc } },
  { id: "estuary-waterfront", name: "Estuary Waterfront", centre: [100, 300], radius: 160,
    palette: { accent: 0x4fd1ff, ground: 0x0f2e3a, structure: 0x6e3328, trim: 0x8b98a5 } },
  { id: "port", name: "The Port", centre: [-380, 350], radius: 180,
    palette: { accent: 0xf0b323, ground: 0x4a3f3a, structure: 0x6b7885, trim: 0x2b2f33 } },
  { id: "west-oakland", name: "West Oakland", centre: [-350, 40], radius: 170,
    palette: { accent: 0xd8232a, ground: 0x3a3f45, structure: 0x7a4a3a, trim: 0x8b929a } },
  { id: "fruitvale", name: "Fruitvale", centre: [450, 260], radius: 150,
    palette: { accent: 0xf07a1f, ground: 0x8b6a45, structure: 0xcfc2b0, trim: 0x4fd6a5 } },
  { id: "coliseum", name: "The Coliseum Area", centre: [600, 370], radius: 160,
    palette: { accent: 0xd8232a, ground: 0xc9a06a, structure: 0x2b3138, trim: 0x3b7bbf } },
  { id: "hills", name: "The Hills", centre: [650, -250], radius: 140,
    palette: { accent: 0x59c97b, ground: 0x333d22, structure: 0x2a2f36, trim: 0xf2c14b } },
  { id: "bridge-approach", name: "Bridge Approach", centre: [-630, -160], radius: 140,
    palette: { accent: 0xd24a1c, ground: 0x3a3f45, structure: 0x8b98a5, trim: 0xdfe6ec } },
  // The six zones the expansion added (tools/briefs/bayexpand-brief.md). Every
  // centre sits far enough from the original ten that no existing landmark or
  // site changed its nearest centre — tools/check_bayworld.mjs confirms it.
  { id: "island-harbour", name: "Island Harbour", centre: [150, 620], radius: 170,
    palette: { accent: 0x4fd6a5, ground: 0xc9b98a, structure: 0xe8e2d4, trim: 0x2b6f8f } },
  { id: "north-shoreline", name: "North Shoreline", centre: [-760, -620], radius: 170,
    palette: { accent: 0x3b7bbf, ground: 0x4d5a3a, structure: 0xd9cfb8, trim: 0x233a52 } },
  { id: "emery-crossing", name: "Emery Crossing", centre: [-680, -370], radius: 140,
    palette: { accent: 0xf2c14b, ground: 0x3a3f45, structure: 0x8b929a, trim: 0x2b2f33 } },
  { id: "south-shoreline", name: "South Shoreline", centre: [750, 640], radius: 170,
    palette: { accent: 0x59c9c9, ground: 0x4a5a4a, structure: 0x9aa6ad, trim: 0xdfe6ec } },
  { id: "upper-hills", name: "The Upper Hills", centre: [950, -550], radius: 220,
    palette: { accent: 0xf07a1f, ground: 0x2f3a1e, structure: 0x3a3228, trim: 0xf2c14b } },
  { id: "outer-bay", name: "The Outer Bay", centre: [-900, 450], radius: 240,
    palette: { accent: 0xd8232a, ground: 0x0f2e3a, structure: 0x6b7885, trim: 0xdfe6ec } },
];

/**
 * Twenty-eight public landmarks, `{ id, name, zone, position:[x,z], kind,
 * blurb }`. Every `name` is a plain generic public-facing name (never a real
 * brand, org or address) and every `blurb` is one generic line asserting no
 * date, height, dimension, count, ownership or history — nothing here could
 * be wrong about a real place because nothing here claims to be one.
 */
export const BAY_LANDMARKS = [
  { id: "lake-necklace", name: "Lakeside Promenade", zone: "lake", position: [275, -47], kind: "park",
    blurb: "A path that circles the lake, strung with lamp posts that come on together at dusk." },
  { id: "downtown-tower", name: "Skyline Tower", zone: "downtown", position: [21, 17], kind: "tower",
    blurb: "A glass-and-steel office tower standing over the downtown core." },
  { id: "historic-theatre", name: "The Regal Theatre", zone: "uptown", position: [-24, -217], kind: "theatre",
    blurb: "A marquee-fronted theatre on the uptown strip, still lit for evening shows." },
  { id: "port-cranes", name: "Harbor Gantry Cranes", zone: "port", position: [-359, 367], kind: "port",
    blurb: "A row of ship-to-shore gantry cranes working the container berths." },
  { id: "waterfront-square", name: "Waterfront Square", zone: "estuary-waterfront", position: [118, 315], kind: "plaza",
    blurb: "An open plaza where the estuary promenade meets the shops behind it." },
  { id: "bridge-approach-plaza", name: "Bridge Approach Plaza", zone: "bridge-approach", position: [-614, -147], kind: "infrastructure",
    blurb: "A toll plaza and viewing turnout where the roadway climbs onto the bridge." },
  { id: "civic-stadium", name: "Civic Stadium", zone: "coliseum", position: [618, 385], kind: "stadium",
    blurb: "An open-air stadium bowl used for games and other large public events." },
  { id: "bayside-arena", name: "Bayside Arena", zone: "coliseum", position: [570, 371], kind: "arena",
    blurb: "An indoor arena beside the stadium, host to basketball and other events." },
  { id: "elevated-transit-station", name: "Overtown Elevated Station", zone: "coliseum", position: [626, 344], kind: "transit",
    blurb: "An elevated rail platform on concrete piers above the boulevard." },
  { id: "market-street-stalls", name: "Market Street Stalls", zone: "fruitvale", position: [467, 274], kind: "market",
    blurb: "A closed street lined with awninged stalls on market days." },
  { id: "overlook-point", name: "Overlook Point", zone: "hills", position: [666, -237], kind: "lookout",
    blurb: "A paved turnout in the hills with a bench and a view back over the water." },
  { id: "redwood-grove-entrance", name: "Redwood Grove Entrance", zone: "hills", position: [623, -249], kind: "park",
    blurb: "A trailhead gate into a stand of tall trees above the city." },
  { id: "tidewater-shoreline-park", name: "Tidewater Shoreline Park", zone: "estuary-waterfront", position: [70, 301], kind: "park",
    blurb: "A shoreline park with a paved path along the mudflats and marsh grass." },
  { id: "rail-depot", name: "Rail Depot", zone: "west-oakland", position: [-330, 56], kind: "transit",
    blurb: "A ground-level rail depot where freight and passenger tracks meet." },
  { id: "fire-station", name: "Fire Station", zone: "fruitvale", position: [422, 261], kind: "civic",
    blurb: "A two-bay fire station with its apparatus doors facing the street." },
  { id: "union-hall", name: "Union Hall", zone: "west-oakland", position: [-382, 41], kind: "civic",
    blurb: "A meeting hall used by local trade union locals for dispatch and training." },
  { id: "bay-city-college", name: "Bay City College", zone: "fruitvale", position: [474, 236], kind: "education",
    blurb: "A community college campus with classroom buildings around a quad." },
  { id: "bay-general-hospital", name: "Bay General Hospital", zone: "coliseum", position: [599, 394], kind: "healthcare",
    blurb: "A community hospital with an emergency entrance and an ambulance bay." },
  { id: "warehouse-district", name: "Warehouse District", zone: "west-oakland", position: [-322, 12], kind: "industrial",
    blurb: "A cluster of brick and steel warehouses along the rail spur." },
  { id: "truck-yard", name: "Truck Yard", zone: "west-oakland", position: [-351, 65], kind: "industrial",
    blurb: "A fenced yard for staging, fuelling and inspecting trucks and trailers." },
  { id: "estuary-marina", name: "Estuary Marina", zone: "estuary-waterfront", position: [126, 274], kind: "marina",
    blurb: "A small-craft marina with floating docks along the estuary." },
  // The expansion's landmarks, one or two per new zone.
  { id: "island-ferry-landing-clock", name: "Ferry Landing Clock", zone: "island-harbour", position: [175, 570], kind: "transit",
    blurb: "A clock on a post at the head of the ferry ramp, where passengers wait for the next boat." },
  { id: "island-beach-esplanade", name: "Island Beach Esplanade", zone: "island-harbour", position: [80, 690], kind: "park",
    blurb: "A paved walk along a sandy beach on the island's open-bay side, with benches facing the water." },
  { id: "north-pier", name: "North Pier", zone: "north-shoreline", position: [-860, -700], kind: "marina",
    blurb: "A long public fishing pier reaching out over the shallows from the marina's breakwater." },
  { id: "emery-public-market", name: "Emery Public Market", zone: "emery-crossing", position: [-690, -330], kind: "market",
    blurb: "A covered food hall of small stalls beside the town's main crossing." },
  { id: "south-shoreline-park", name: "South Shoreline Park", zone: "south-shoreline", position: [700, 705], kind: "park",
    blurb: "A shoreline park of lawns and a bay trail between the marina and the treatment plant." },
  { id: "ridge-trail-summit", name: "Ridge Trail Summit", zone: "upper-hills", position: [1000, -650], kind: "lookout",
    blurb: "A trail junction on the ridgeline where the path tops out and the whole bay opens up below." },
  { id: "channel-marker", name: "Channel Marker", zone: "outer-bay", position: [-950, 520], kind: "infrastructure", afloat: true,
    blurb: "A lit navigation buoy marking the edge of the shipping channel into the port." },
];

/** Lane width, metres, for BAY_ROADS' half-width and bayRoadAt(). */
const LANE_WIDTH = 3.5;

/**
 * Fifteen road polylines, `{ id, name, lanes, points:[[x,z],...] }`: a
 * freeway spine running the length of the original field, arterials
 * branching off it to each zone's own centre, a waterfront boulevard along
 * the port/estuary shoreline, a switchback climbing into the hills, and the
 * expansion's five: an island crossing off the waterfront, a north shoreline
 * arterial through Emery Crossing, a south shoreline arterial off the end of
 * the freeway, a ridge road on from the top of the switchback, and a short
 * pier road west from the port to the channel edge. Every branch shares an exact
 * endpoint with the spine (or with another branch), so the network is one
 * connected component by construction — see tools/check_bayworld.mjs, which
 * confirms it rather than trusting this comment.
 */
export const BAY_ROADS = [
  { id: "freeway-spine", name: "Bayshore Freeway", lanes: 6, points: [
    [-380, -500], [-380, -160], [-380, 40], [-100, 200], [100, 300], [450, 320], [600, 370], [600, 530],
  ] },
  { id: "arterial-bridge", name: "Bridge Approach Road", lanes: 4, points: [[-630, -160], [-380, -160]] },
  { id: "arterial-downtown", name: "Downtown Connector", lanes: 4, points: [[-100, 200], [0, 0]] },
  { id: "arterial-uptown", name: "Uptown Connector", lanes: 4, points: [[0, 0], [-40, -230]] },
  { id: "arterial-lake", name: "Lakeside Drive", lanes: 2, points: [[-40, -230], [260, -60]] },
  { id: "arterial-westoakland", name: "West Oakland Spur", lanes: 4, points: [[-380, 40], [-350, 40]] },
  { id: "arterial-port", name: "Port Access Road", lanes: 4, points: [[-380, 40], [-380, 350]] },
  { id: "arterial-fruitvale", name: "Fruitvale Connector", lanes: 4, points: [[450, 320], [450, 260]] },
  { id: "waterfront-boulevard", name: "Waterfront Boulevard", lanes: 4, points: [
    [-380, 350], [100, 300], [600, 370],
  ] },
  { id: "hill-switchback", name: "Hill Switchback Road", lanes: 2, points: [
    [600, 370], [640, 300], [610, 220], [650, 150], [615, 50], [650, -50], [620, -150], [650, -250],
  ] },
  // The expansion's roads. Each starts on an existing vertex (a junction the
  // original network already had), so the whole graph stays one piece.
  { id: "island-crossing", name: "Island Crossing", lanes: 4, points: [
    [100, 300], [125, 460], [150, 620], [150, 700],
  ] },
  { id: "north-shoreline-arterial", name: "North Shoreline Arterial", lanes: 4, points: [
    [-630, -160], [-680, -370], [-760, -620], [-820, -700],
  ] },
  { id: "south-shoreline-arterial", name: "South Shoreline Arterial", lanes: 4, points: [
    [600, 530], [700, 600], [750, 640], [820, 700],
  ] },
  { id: "ridge-road", name: "Ridge Road", lanes: 2, points: [
    [650, -250], [720, -350], [820, -420], [950, -550], [1000, -620],
  ] },
  { id: "channel-pier-road", name: "Channel Pier Road", lanes: 2, points: [
    [-380, 350], [-520, 420], [-700, 460],
  ] },
];

/**
 * Fifty training anchors, `{ id, name, zone, position:[x,z],
 * programmes:[...], stations:[...] }`. `programmes` names ids from
 * smartcity/js/curricula.js's CURRICULA (every one of that file's programme
 * ids is anchored at least once, somewhere plausible for its trade —
 * tools/check_bayworld.mjs confirms it); `stations` names a few of that
 * programme's own station ids (smartcity/js/sims/<id>.js), for a quest layer
 * that wants to point a learner at a real station rather than invent one.
 */
export const BAY_SITES = [
  { id: "port-container-terminal", name: "Port Container Terminal", zone: "port", position: [-340, 350],
    programmes: ["wojrc-pathway-edition", "port-operations", "rigging-lifting"], stations: ["mooring-line", "bunkering-watch", "crane-yard", "dock-crane"] },
  { id: "port-rail-yard", name: "Port Rail Yard", zone: "port", position: [-416, 383],
    programmes: ["railroad-crafts"], stations: ["ra-roadway-worker-protection-and-job-briefing", "ra-tie-and-rail-replacement-with-track-machines"] },
  { id: "port-maintenance-shop", name: "Port Maintenance Shop", zone: "port", position: [-375, 293],
    programmes: ["mill-and-mine", "plumbers-and-pipefitters", "insulators-and-boilermakers"], stations: ["pl-medical-gas-brazing-and-purge", "ib-mechanical-insulation-pipe-and-jacketing"] },
  { id: "port-hazmat-response-yard", name: "Port Hazmat Response Yard", zone: "port", position: [-356, 381],
    programmes: ["hazmat-environmental"], stations: ["hunters-point", "abatement-chamber", "decon-line"] },
  { id: "estuary-shoreline-park-trailhead", name: "Shoreline Park Trailhead", zone: "estuary-waterfront", position: [135, 300],
    programmes: ["hunters-point-bay-restoration", "hunters-point-can-we-live"], stations: ["rad-survey", "can-we-live-story", "air-sensor-install"] },
  { id: "estuary-research-dock", name: "Estuary Research Dock", zone: "estuary-waterfront", position: [68, 329],
    programmes: ["ports-maritime-ecology", "marine-ecology-and-restoration", "commercial-diving-and-scientific-scuba"], stations: ["dock-crane", "container-lashing", "shore-power-hookup", "me-water-column-sampling-from-a-small-boat", "me-fish-visual-census-and-data-sheet", "me-invasive-species-identification-and-reporting", "cd-scientific-scuba-buddy-check-and-lost-buddy-drill", "cd-dive-records-and-incident-review"] },
  { id: "estuary-marina-boatyard", name: "Marina Boatyard", zone: "estuary-waterfront", position: [104, 249],
    programmes: ["bay-restoration-maritime-underwater", "yacht-and-charter-crew"], stations: ["br-dive-site-hazard-assessment-and-jsa", "br-surface-supplied-dive-station-setup", "yc-pre-departure-safety-briefing-and-guest-count", "yc-line-handling-and-docking-in-crosswind", "yc-fuel-dock-transfer-and-spill-kit", "yc-engine-room-pre-start-and-bilge-check", "yc-man-overboard-recovery-drill", "yc-galley-fire-and-fixed-system", "yc-tender-launch-and-guest-transfer", "yc-shore-power-connection-and-in-water-electrical-safety"] },
  { id: "downtown-tower-site", name: "Downtown Tower Site", zone: "downtown", position: [40, 0],
    programmes: ["fall-protection", "glaziers-and-architectural-metal", "elevator-constructors"],
    stations: ["steel-erector", "gl-curtain-wall-unit-setting-from-the-floor", "ew-hoistway-false-car-and-rail-setting"] },
  { id: "downtown-civic-center", name: "Downtown Civic Center", zone: "downtown", position: [-36, 33],
    programmes: ["civic-leadership-and-ei", "k12-practical-math"], stations: ["public-comment-prep", "public-meeting-chair", "k12-household-budget-and-first-paycheck"] },
  { id: "downtown-central-plant", name: "Downtown Central Plant", zone: "downtown", position: [5, -57],
    programmes: ["stationary-engineer"], stations: ["boiler-room", "chiller-plant", "cooling-tower"] },
  { id: "downtown-housing-block", name: "Downtown Housing Block", zone: "downtown", position: [24, 31],
    programmes: ["property-management", "roofers-and-waterproofers"], stations: ["pm-lobby-and-front-desk", "rf-torch-applied-membrane-and-fire-watch"] },
  { id: "uptown-construction-site", name: "Uptown Construction Site", zone: "uptown", position: [-9, -230],
    programmes: ["builders-trades", "cement-masons-and-plasterers"], stations: ["concrete-pour", "cm-slab-screed-bull-float-and-trowel"] },
  { id: "uptown-theatre-district", name: "Uptown Theatre District", zone: "uptown", position: [-68, -204],
    programmes: ["screen-and-media-crafts", "bartending-course"], stations: ["bar-well-setup", "id-check-underage"] },
  { id: "uptown-restaurant-row", name: "Uptown Restaurant Row", zone: "uptown", position: [-36, -275],
    programmes: ["grocery-and-meatpacking", "culinary-kitchen"], stations: ["kitchen", "knife-skills", "slicer-lockout"] },
  { id: "uptown-hotel-row", name: "Uptown Hotel Row", zone: "uptown", position: [-21, -206],
    programmes: ["hotel-workers"], stations: ["banquet-hot-hold", "housekeeping-room-turn", "laundry-plant-chemicals"] },
  { id: "lake-loop-boathouse", name: "Lake Loop Boathouse", zone: "lake", position: [289, -60],
    programmes: ["situational-awareness"], stations: ["electrical", "welding", "trench-box"] },
  { id: "lake-necklace-lighting-shed", name: "Lake Necklace Lighting Shed", zone: "lake", position: [234, -36],
    programmes: [], stations: [] },
  { id: "west-oakland-substation-yard", name: "West Oakland Substation Yard", zone: "west-oakland", position: [-313, 40],
    programmes: ["electrical-first-period"], stations: ["electrical", "charge-point", "substation-switching"] },
  { id: "west-oakland-utility-yard", name: "West Oakland Utility Yard", zone: "west-oakland", position: [-384, 71],
    programmes: ["confined-space", "water-and-gas-utility-crews"], stations: ["valve-vault", "ut-water-main-break-emergency-shutdown-and-excavation"] },
  { id: "west-oakland-truck-yard", name: "West Oakland Truck Yard", zone: "west-oakland", position: [-345, -14],
    programmes: ["postal-and-mail-processing", "airline-cabin-and-flight-crew", "job-readiness-edition"], stations: ["drive-city-route-and-turns", "drive-backing-serpentine-and-alley-dock", "forklift-dock"] },
  { id: "west-oakland-warehouse-district", name: "West Oakland Warehouse District", zone: "west-oakland", position: [-327, 70],
    programmes: ["sewing-garment-trades", "warehouse-and-logistics-automation"], stations: ["salon", "machine-threading-needle", "tw-amr-traffic-zone-entry-and-lockout"] },
  { id: "west-oakland-robotics-centre", name: "West Oakland Robotics and Depot Training Centre", zone: "west-oakland", position: [-352, 96],
    programmes: ["aerospace-defense-and-robotics"], stations: ["ad-robot-cell-lockout-and-safe-reentry", "ad-cobot-risk-assessment-and-speed-separation", "ad-depot-tool-control-and-fod-walk"] },
  { id: "west-oakland-union-hall", name: "West Oakland Union Hall", zone: "west-oakland", position: [-395, 32],
    programmes: ["bay-area-union-edition"], stations: ["press-brake", "sm-shop-layout-and-shear"] },
  { id: "west-oakland-air-monitoring-post", name: "West Oakland Air Monitoring Post", zone: "west-oakland", position: [-304, 11],
    programmes: ["air-quality-monitoring"], stations: ["air-monitor", "mobile-air-lab", "opacity-reading"] },
  { id: "fruitvale-community-college", name: "Fruitvale Community College", zone: "fruitvale", position: [483, 260],
    programmes: ["dental-hygiene-unspoken-smiles", "dental-careers-unspoken-smiles", "k12-science"], stations: ["phlebotomy", "dental-careers-pathway", "four-handed-dentistry", "k12-circuits-at-the-electrical-bench"] },
  { id: "fruitvale-fire-station", name: "Fruitvale Fire Station", zone: "fruitvale", position: [420, 287],
    programmes: ["first-responders"], stations: ["triage-point", "structure-fire-sizeup"] },
  { id: "fruitvale-elementary-school", name: "Fruitvale Elementary School", zone: "fruitvale", position: [454, 212],
    programmes: ["education-support-staff", "k12-history-and-civics", "k12-literacy-and-life-skills"], stations: ["ed-custodial-chemical-dilution-and-floor-machine", "ed-playground-equipment-inspection", "ed-bus-pretrip-and-loading-zone", "k12-primary-and-secondary-sources", "k12-reading-instructions-and-safety-labels"] },
  { id: "coliseum-stadium", name: "Coliseum Stadium", zone: "coliseum", position: [635, 370],
    programmes: ["live-events"], stations: ["stage-power", "fly-system", "rigging-loft"] },
  { id: "coliseum-arena", name: "Coliseum Arena", zone: "coliseum", position: [568, 399],
    programmes: ["basketball-fundamentals", "k12-practical-math"], stations: ["bb-warmup-injury-prevention-and-hydration", "bb-stance-and-ball-handling", "k12-measuring-and-scaling-the-court"] },
  { id: "coliseum-elevated-transit-station", name: "Coliseum Elevated Transit Station", zone: "coliseum", position: [604, 319],
    programmes: ["transit-ramp"], stations: ["track-access", "signal-cabinet", "bus-depot-lift"] },
  { id: "coliseum-area-hospital", name: "Coliseum Area Hospital", zone: "coliseum", position: [621, 398],
    programmes: ["outbreak-response-who", "healthcare-support"], stations: ["who-ppe-donning-and-doffing", "hc-patient-transport-and-safe-handling"] },
  { id: "coliseum-airfield-apron", name: "Coliseum Airfield Apron", zone: "coliseum", position: [557, 362],
    programmes: ["aviation-maintenance-and-ground"], stations: ["av-marshalling-and-wingwalker-signals", "av-pushback-tug-and-towbar-connection"] },
  { id: "hills-transmission-corridor", name: "Hills Transmission Corridor", zone: "hills", position: [681, -250],
    programmes: ["energy-transition"], stations: ["solar-deck", "battery-yard", "or-transmission-line-right-of-way-patrol"] },
  { id: "hills-redwood-park-grounds-shop", name: "Redwood Park Grounds Shop", zone: "hills", position: [622, -224],
    programmes: ["grounds-and-landscaping"], stations: ["gk-ride-on-mower-pre-start-and-slope-work", "gk-string-trimmer-and-blower-ppe-and-bystander-zone"] },
  { id: "hills-grading-site", name: "Hills Grading Site", zone: "hills", position: [654, -295],
    programmes: ["heavy-equipment-operators"], stations: ["op-excavator-trench-and-utility-locate", "op-dozer-slope-work-and-rollover-protection"] },
  { id: "hills-lookout-fire-watch", name: "Hills Lookout Fire Watch", zone: "hills", position: [669, -226],
    programmes: [], stations: [] },
  { id: "bridge-approach-toll-plaza", name: "Bridge Approach Toll Plaza", zone: "bridge-approach", position: [-599, -160],
    programmes: ["bridge-and-structural"], stations: ["steel-erector", "bridge-cable-inspection", "bridge-lead-containment"] },
  { id: "bridge-approach-maintenance-yard", name: "Bridge Approach Maintenance Yard", zone: "bridge-approach", position: [-658, -134],
    programmes: [], stations: [] },
  // The expansion's sites (tools/briefs/bayexpand-brief.md), each within a
  // short walk of one of the expansion's roads.
  // The yacht harbour anchors the marine stations the catalog already has;
  // the yacht-and-charter-crew programme and its own stations join this
  // anchor at integration, once that pack lands in the catalog.
  { id: "island-yacht-harbor", name: "Island Yacht Harbor", zone: "island-harbour", position: [105, 640],
    programmes: ["bay-area-union-edition", "port-operations", "yacht-and-charter-crew"], stations: ["mooring-line", "mw-workboat-towing-and-line-handling", "mw-ferry-deckhand-and-passenger-safety", "bunkering-watch", "yc-pre-departure-safety-briefing-and-guest-count", "yc-line-handling-and-docking-in-crosswind", "yc-fuel-dock-transfer-and-spill-kit", "yc-engine-room-pre-start-and-bilge-check", "yc-man-overboard-recovery-drill", "yc-galley-fire-and-fixed-system", "yc-tender-launch-and-guest-transfer", "yc-shore-power-connection-and-in-water-electrical-safety"] },
  { id: "island-ferry-landing", name: "Island Ferry Landing", zone: "island-harbour", position: [165, 595],
    programmes: ["transit-ramp", "bay-area-union-edition", "k12-practical-math"], stations: ["mw-ferry-deckhand-and-passenger-safety", "tr-wheelchair-lift-and-securement-on-a-bus", "forklift-dock", "k12-reading-a-map-scale-in-bay-world"] },
  { id: "island-boatyard", name: "Island Boatyard", zone: "island-harbour", position: [120, 700],
    programmes: ["bay-restoration-maritime-underwater", "bay-area-union-edition"], stations: ["br-derelict-vessel-salvage-rigging", "mw-hull-inspection-and-cleaning-dive", "br-dive-tender-and-umbilical-management"] },
  { id: "island-airfield-park", name: "Island Airfield Park", zone: "island-harbour", position: [190, 690],
    programmes: ["aviation-maintenance-and-ground", "grounds-and-landscaping"], stations: ["av-marshalling-and-wingwalker-signals", "av-ground-power-and-static-bonding-before-fuel", "gk-sports-field-line-marking-and-goal-anchoring"] },
  { id: "north-marina-pier", name: "North Marina Pier", zone: "north-shoreline", position: [-800, -640],
    programmes: ["bay-restoration-maritime-underwater", "ports-maritime-ecology"], stations: ["br-workboat-crane-lift-from-water", "br-vhf-and-navigation-in-a-work-zone", "spill-boom-deploy"] },
  { id: "north-shoreline-field-lab", name: "North Shoreline Field Lab", zone: "north-shoreline", position: [-735, -590],
    programmes: ["air-quality-monitoring", "hunters-point-bay-restoration", "bay-restoration-maritime-underwater", "marine-ecology-and-restoration", "commercial-diving-and-scientific-scuba"], stations: ["air-monitor", "marsh-transect-survey", "eelgrass-transplant", "br-water-quality-sonde-calibration-and-deploy", "me-eelgrass-seed-collection-and-nursery", "me-tidal-marsh-channel-restoration-day", "me-shoreline-debris-and-microplastics-survey", "cd-low-visibility-and-night-dive-line-work", "cd-pier-piling-inspection-and-wrap-repair"] },
  { id: "emery-distribution-center", name: "Emery Distribution Center", zone: "emery-crossing", position: [-640, -400],
    programmes: ["warehouse-and-logistics-automation", "job-readiness-edition"], stations: ["tw-conveyor-jam-clearing-and-loto", "tw-dock-leveler-and-trailer-restraint-check", "tdl-trailer-loading-and-dock-plate"] },
  { id: "emery-lab-campus", name: "Emery Lab Campus", zone: "emery-crossing", position: [-720, -350],
    programmes: ["healthcare-support", "outbreak-response-who"], stations: ["hc-sterile-processing-decontamination-and-assembly", "hc-hazardous-drug-spill-kit-response", "who-surveillance-and-case-definition"] },
  { id: "south-shoreline-marina", name: "South Shoreline Marina", zone: "south-shoreline", position: [790, 690],
    programmes: ["bay-restoration-maritime-underwater", "port-operations"], stations: ["br-cold-water-immersion-and-mob-recovery", "br-boom-towing-between-two-vessels", "mooring-line"] },
  { id: "south-treatment-plant", name: "South Treatment Plant", zone: "south-shoreline", position: [715, 585],
    programmes: ["water-and-gas-utility-crews", "confined-space", "stationary-engineer", "k12-science"], stations: ["ut-water-treatment-chemical-delivery-unloading", "chlorine-room", "lift-station", "cs-permit-entry-and-attendant-duties", "k12-water-cycle-and-filtration"] },
  { id: "ridge-fire-lookout", name: "Ridge Fire Lookout", zone: "upper-hills", position: [985, -585],
    programmes: ["first-responders"], stations: ["wildland-urban-interface", "or-wildland-fireline-construction-and-lookout", "damage-assessment-team"] },
  { id: "ridge-reservoir-yard", name: "Ridge Reservoir Yard", zone: "upper-hills", position: [900, -495],
    programmes: ["water-and-gas-utility-crews", "energy-transition", "heavy-equipment-operators"], stations: ["ut-cathodic-protection-test-station-reading", "or-solar-farm-tracker-row-maintenance", "op-equipment-daily-walkaround-and-fluids"] },
  { id: "channel-buoy-tender-pier", name: "Channel Buoy Tender Pier", zone: "outer-bay", position: [-690, 485],
    programmes: ["port-operations", "ports-maritime-ecology", "marine-ecology-and-restoration", "commercial-diving-and-scientific-scuba"], stations: ["mooring-line", "pilot-transfer", "spill-boom-deploy", "vessel-gangway-and-hatch-cover-safety", "me-kelp-transect-survey-and-photo-quadrats", "me-oyster-reef-monitoring-and-settlement-tiles", "cd-underwater-wet-welding-and-cutting", "cd-rov-launch-recovery-and-tether-management", "cd-decompression-chamber-operations-and-post-dive", "cd-hydraulic-tools-and-suction-hazards-underwater"] },
  // Anchored here: the wind-and-data-infrastructure turbine and substation stations.
  { id: "ridge-wind-farm", name: "Ridge Wind Farm", zone: "upper-hills", position: [960, -520],
    programmes: ["wind-and-data-infrastructure"], stations: ["ws-turbine-climb-and-rescue-kit-check", "ws-nacelle-lockout-and-yaw-brake-fault", "ws-blade-inspection-from-a-platform", "ws-substation-switching-under-a-permit"] },
  // Anchored here: the wind-and-data-infrastructure data-hall stations.
  { id: "emery-data-center-campus", name: "Emery Data Center Campus", zone: "emery-crossing", position: [-610, -330],
    programmes: ["wind-and-data-infrastructure"], stations: ["ws-data-hall-busway-install-and-torque-signoff", "ws-raised-floor-tile-lift-and-cable-tray-safety", "ws-crah-alarm-response-in-a-live-hall", "ws-ocean-pod-retrieval-and-hatch-opening"] },
];

/** Documented mesh budget, authored (before mergeStatic — see kit.js's
 *  mergeStatic doc and shared/fairway.js's FAIRWAY_MESH_BUDGET, which this
 *  mirrors: "high" is LOD 0, the whole world; "low" is the compact preview
 *  smartcity/js/districts.js registers). */
export const BAY_MESH_BUDGET = { low: 100, high: 3600 };

// ---------------------------------------------------------------- geometry

/** A small deterministic PRNG (the same LCG shared/fairway-data.js uses), so
 *  a builder's tree/crowd/vehicle scatter is reproducible run to run. */
export function bwSeededRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function bwDist(x0, z0, x1, z1) { return Math.hypot(x1 - x0, z1 - z0); }

/** Shortest distance from a point to a line segment, in the XZ plane. */
function bwDistToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az;
  const lenSq = abx * abx + abz * abz;
  const t = lenSq > 0 ? Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq)) : 0;
  return bwDist(px, pz, ax + abx * t, az + abz * t);
}

/** The zone whose centre is nearest (x, z) — a Voronoi assignment over
 *  BAY_ZONES' centres, which is what makes the zones tile the whole of
 *  BAY_BOUNDS with no gap and no double cover regardless of each zone's own
 *  (approximate, cosmetic) `radius`. Never returns null: every point in the
 *  plane has a nearest centre. */
export function bayZoneAt(x, z) {
  let best = BAY_ZONES[0], bestDist = Infinity;
  for (const zone of BAY_ZONES) {
    const d = bwDist(x, z, zone.centre[0], zone.centre[1]);
    if (d < bestDist) { bestDist = d; best = zone; }
  }
  return best;
}

function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// The hills climb away from a single high point out past the eastern edge of
// the Hills zone, and the upper hills climb on from there to a second, higher
// dome on the ridge; every other zone (downtown, the port, the estuary, West
// Oakland, the bridge approach, the island, both shorelines and the outer
// bay) is far enough from both that bayHeight() there is only the small
// citywide undulation below — "flat" in the sense a real downtown grid, a
// container yard or a marina is flat, not perfectly level. The ridge dome's
// falloff is short enough that it adds only a metre or so at the Hills
// zone's own centre, so the original hills read as they did before the
// field grew.
const HILL_PEAK = [650, -250];
const HILL_FALLOFF = 650; // metres: the hill dome is back to the citywide floor at this distance from HILL_PEAK
const HILL_MAX = 88;
const RIDGE_PEAK = [950, -550];
const RIDGE_FALLOFF = 450; // metres: the ridge dome is back to the hill/citywide surface at this distance from RIDGE_PEAK
const RIDGE_MAX = 100;

/**
 * Deterministic terrain height at (x, z), in metres, bounded to
 * BAY_HEIGHT_RANGE and continuous everywhere (a sum of smooth sine/cosine
 * terms and two clamped smoothstep domes, clamping a continuous function stays
 * continuous — see shared/fairway.js's fairwayHeight() for the same
 * reasoning). Used both to give the built terrain its relief and, by a
 * free-roam game or a quest script, to place a vehicle or a walking figure at
 * the right elevation without touching three.js.
 */
export function bayHeight(x, z) {
  const d = bwDist(x, z, HILL_PEAK[0], HILL_PEAK[1]);
  const t = smoothstep(Math.max(0, 1 - d / HILL_FALLOFF));
  const hill = t * HILL_MAX;
  const ridge = Math.sin(x * 0.01 + z * 0.008) * 3 * t;
  const d2 = bwDist(x, z, RIDGE_PEAK[0], RIDGE_PEAK[1]);
  const t2 = smoothstep(Math.max(0, 1 - d2 / RIDGE_FALLOFF));
  const upper = t2 * RIDGE_MAX;
  const citywide = 1.2 * Math.sin(x * 0.006 + 1.1) * Math.cos(z * 0.005 - 0.4)
    + 0.8 * Math.cos((x - z) * 0.004);
  const raw = hill + ridge + upper + citywide;
  return Math.max(BAY_HEIGHT_RANGE[0], Math.min(BAY_HEIGHT_RANGE[1], raw));
}

// ------------------------------------------------------------------ water
//
// Where Bay World is wet. bayHeight() is clamped to BAY_HEIGHT_RANGE (never
// below 0 m), and the bay-water slabs sit at y -0.4, so a terrain built
// straight from bayHeight() buried every slab under grass — the Regatta's
// courses and marinas read as turf. The fix (team PALETTE): the builder's
// terrain samples txGroundHeight() instead, which carves a seabed at
// TX_SEABED_DROP below each water surface everywhere inside that water's
// rectangle grown by TX_SHORE_MARGIN (one terrain cell, so every triangle
// touching a point on the water is fully carved), and the water mesh itself
// is laid over the rectangle grown by twice that margin, so the sloping bank
// between a carved vertex and the first dry one is always under water rather
// than open to the sky. Each entry is `[cx, cz, w, d, y]`: the rectangle the
// Regatta's rgOnWater() treats as afloat (regatta/js/courses.js's RG_WATER
// mirrors the first four) and the water surface's centre height. The lake is
// the fifth, laid on the hillside east of the promenade at a level just
// under the lowest ground around it, so its own bank never floats.
export const TX_SHORE_MARGIN = 40;
export const TX_SEABED_DROP = 2.6;
export const TX_WATER_THICKNESS = 0.1;
/** The terrain slab's vertex grid for a w × d build — the same rule
 *  shared/bayworld.js's bwTerrain() uses, so a checker can find the cell a
 *  point lies in without three.js. */
export function txTerrainSegments(w, d) {
  return [Math.min(64, Math.max(2, Math.round(w / 20))), Math.min(64, Math.max(2, Math.round(d / 20)))];
}
function txLakeLevel(cx, cz, w, d) {
  const m = TX_SHORE_MARGIN * 2;
  let lo = Infinity;
  for (let x = cx - w / 2 - m; x <= cx + w / 2 + m; x += 5) {
    for (let z = cz - d / 2 - m; z <= cz + d / 2 + m; z += 5) lo = Math.min(lo, bayHeight(x, z));
  }
  return +(lo - 0.45).toFixed(2);
}
export const TX_BAY_WATER = [
  [-180, 460, 900, 260, -0.4],   // the port and estuary shore
  [-1000, 380, 400, 840, -0.4],  // the outer bay and its shipping channel
  [-1060, -420, 280, 760, -0.4], // the north channel the north shoreline's pier faces
  [0, 765, 2400, 70, -0.4],      // the open water the island and the south shore look out on
  [350, -140, 100, 60, txLakeLevel(350, -140, 100, 60)], // the lake, east of the promenade
];
function txInRect(x, z, cx, cz, w, d, grow) {
  return Math.abs(x - cx) <= w / 2 + grow && Math.abs(z - cz) <= d / 2 + grow;
}
/** Terrain height the built world's ground actually carries at (x, z):
 *  bayHeight(), carved down to a seabed under every TX_BAY_WATER body. */
export function txGroundHeight(x, z) {
  let h = bayHeight(x, z);
  for (const [cx, cz, w, d, y] of TX_BAY_WATER) {
    if (txInRect(x, z, cx, cz, w, d, TX_SHORE_MARGIN)) h = Math.min(h, y - TX_SEABED_DROP);
  }
  return h;
}
/** The top of the built water surface covering (x, z), or null where no
 *  water mesh reaches — the mesh is each rectangle grown by twice
 *  TX_SHORE_MARGIN (see the header above). */
export function txWaterTopAt(x, z) {
  let top = null;
  for (const [cx, cz, w, d, y] of TX_BAY_WATER) {
    if (txInRect(x, z, cx, cz, w, d, TX_SHORE_MARGIN * 2)) top = Math.max(top ?? -Infinity, y + TX_WATER_THICKNESS / 2);
  }
  return top;
}
/** The highest terrain vertex of the full-world ground cell holding (x, z):
 *  an upper bound on the rendered ground there, since a triangle never rises
 *  above its own corners. */
export function txGroundMaxAt(x, z) {
  const { minX, maxX, minZ, maxZ } = BAY_BOUNDS;
  const [sx, sz] = txTerrainSegments(maxX - minX, maxZ - minZ);
  const cw = (maxX - minX) / sx, cd = (maxZ - minZ) / sz;
  const i = Math.max(0, Math.min(sx - 1, Math.floor((x - minX) / cw)));
  const j = Math.max(0, Math.min(sz - 1, Math.floor((z - minZ) / cd)));
  let hi = -Infinity;
  for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) hi = Math.max(hi, txGroundHeight(minX + (i + a) * cw, minZ + (j + b) * cd));
  return hi;
}
/** The rendered ground height at (x, z) on the full-world terrain, exactly:
 *  the triangle of the ground cell that holds the point, interpolated.
 *  three.js's PlaneGeometry splits each cell along the diagonal from its
 *  (i, j+1) corner to its (i+1, j) corner (world x index i, world z index j,
 *  after bwTerrain()'s turn), so the first triangle is u + v <= 1. */
export function txGroundSurfaceAt(x, z) {
  const { minX, maxX, minZ, maxZ } = BAY_BOUNDS;
  const [sx, sz] = txTerrainSegments(maxX - minX, maxZ - minZ);
  const cw = (maxX - minX) / sx, cd = (maxZ - minZ) / sz;
  const i = Math.max(0, Math.min(sx - 1, Math.floor((x - minX) / cw)));
  const j = Math.max(0, Math.min(sz - 1, Math.floor((z - minZ) / cd)));
  const u = Math.max(0, Math.min(1, (x - minX) / cw - i)), v = Math.max(0, Math.min(1, (z - minZ) / cd - j));
  const at = (a, b) => txGroundHeight(minX + (i + a) * cw, minZ + (j + b) * cd);
  const h00 = at(0, 0), h10 = at(1, 0), h01 = at(0, 1), h11 = at(1, 1);
  if (u + v <= 1) return h00 + u * (h10 - h00) + v * (h01 - h00);
  return h11 + (1 - u) * (h01 - h11) + (1 - v) * (h10 - h11);
}

// ------------------------------------------------------------------ quays
//
// The estuary body (TX_BAY_WATER[0]) and the south strip ([3]) carve their
// seabed under the port, the estuary front, the island and the south shore,
// so those sites once stood over water (PALETTE's open item). Rather than
// shrink the water the regatta races on, each shore carries a quay: a
// concrete slab from the seabed up to TX_QUAY_TOP, just over the water top
// and just over the flat shore's clamped 0 m ground so the deck never
// z-fights the turf. Each entry is `[cx, cz, w, d]`; shared/bayworld.js's
// buildWorld() lays one box per entry, and tools/check_bayworld.mjs holds
// every site and landmark to ground or a quay and every berth and course
// point off them. The regatta's rgOnWater() treats a quay as shore.
export const TX_QUAY_TOP = 0.12;
export const TX_BAY_QUAYS = [
  [-385, 340, 130, 120], // the port: container terminal, rail yard, hazmat yard, cranes, maintenance shop
  [100, 299, 120, 74],   // the estuary front: research dock, trailhead, waterfront square, shoreline park
  [177.5, 591.5, 75, 67],  // the island's ferry landing and its clock, east of the regatta's start grid
  [138.5, 668, 153, 96],   // the island's harbour, boatyard, airfield park and beach esplanade
  [745, 697.5, 170, 55],   // the south shore: shoreline park and the marina's quay
];
/** The index of the quay whose deck covers (x, z) — shrunk by `inset`
 *  metres on every side — or -1 where no quay does. */
export function txQuayAt(x, z, inset = 0) {
  return TX_BAY_QUAYS.findIndex(([cx, cz, w, d]) => txInRect(x, z, cx, cz, w, d, -inset));
}
/** Where each marina's floats lie: the water beside its quay site, keyed by
 *  the BAY_SITES or BAY_LANDMARKS id whose set piece they are. The site
 *  itself stands on the quay; its floats and moored hulls stay afloat. */
export const TX_MARINA_FLOATS = {
  "island-yacht-harbor": [15, 560],
  "north-marina-pier": [-930, -640],
  "south-shoreline-marina": [800, 765],
  "estuary-marina": [120, 352],
};

/**
 * Whether (x, z) sits on a BAY_ROADS polyline, and which one: `{ onRoad:
 * true, lane, heading }` (`lane` the road's own lane count, `heading` the
 * bearing in radians of the nearest segment, atan2(dx, dz)) at the nearest
 * road within its own half-width (lanes × lane width ÷ 2), or `null`
 * everywhere else — a free-roam game's traffic AI and a quest script's "is
 * the learner on the road" check both read this directly, with no three.js
 * dependency.
 */
export function bayRoadAt(x, z) {
  let best = null, bestDist = Infinity;
  for (const road of BAY_ROADS) {
    const halfWidth = (road.lanes * LANE_WIDTH) / 2;
    for (let i = 1; i < road.points.length; i++) {
      const [ax, az] = road.points[i - 1], [bx, bz] = road.points[i];
      const d = bwDistToSegment(x, z, ax, az, bx, bz);
      if (d < bestDist) {
        bestDist = d;
        best = { d, halfWidth, lane: road.lanes, heading: Math.atan2(bx - ax, bz - az) };
      }
    }
  }
  if (!best || best.d > best.halfWidth) return null;
  return { onRoad: true, lane: best.lane, heading: best.heading };
}
