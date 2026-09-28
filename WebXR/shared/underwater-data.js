// The Deep — the pure ground truth for the underwater world: the seabed
// layout data and the zone/depth/line lookup functions a dive game, a quest
// layer or a headless checker can call without touching three.js.
// shared/underwater.js imports this and adds the builder.

// =============================================================================
// The Deep: a large stylised dive map under a bay — a shallow shelf off the
// shore, an eelgrass meadow, a kelp forest on rock, a shipping channel, a
// wreck hollow, pier pilings, an outfall apron, a tidal-marsh channel mouth,
// a deep trench and a seamount — shared by two teams working in parallel:
// DEEP2 (a swim-or-ROV dive game with quests and field-note eggs) plays it,
// and this module (DEEP1) is the shared ground truth both build against: the
// layout data (DEEP_ZONES, DEEP_LANDMARKS, DEEP_LINES, DEEP_SITES), the pure
// zone/depth/line functions, and the one builder (shared/underwater.js's
// buildUnderwater) that turns all of it into a scene. It mirrors
// shared/bayworld-data.js's shape on purpose, so the same tools (an atlas, a
// quest generator, a checker) can read either world.
//
// Everything here is original and generic, under the same facts rule as Bay
// World (tools/briefs/bayarea-brief.md): every place is named only by a
// plain, generic public-facing name (a kelp cathedral, a wreck's bow, a pier's
// piling forest), never a real organisation, brand, vessel or address, and no
// fact about a real place — a date, a depth, a count, an owner, an event or a
// species — is ever asserted. Depth, gas, decompression and current limits
// are never stated anywhere in this world: they are "per the dive plan and
// the tables the supervisor holds". deepDepthAt() below is a scenery and
// gameplay field only; its numbers are never shown to a learner as a limit.
//
// ----------------------------------------------------------------- geometry
//
// The world sits on a single field, x:[-1000,1000] z:[-700,700] — 2000 m by
// 1400 m of seabed in scene units (metres). The shore lies along the north
// edge (z = -700) and the seabed slopes away from it to the south, so the
// pier pilings, the shelf, the eelgrass and the marsh mouth are shallow and
// the trench and the seamount's base are deep. Fourteen named zones
// (DEEP_ZONES) tile the field by nearest centre (deepZoneAt()); twenty-five
// landmarks (DEEP_LANDMARKS) and thirty-two dive and survey sites (DEEP_SITES)
// are scattered across them, each nearer its own zone's centre than any
// other's — the same "inside its own zone" rule Bay World uses. Dive lines,
// anchor lines and transects (DEEP_LINES) stand in for roads: one connected
// network a diver or an ROV can follow from the pier to the seamount.
//
// `buildUnderwater(parent, opts)` (shared/underwater.js) has two
// `opts.detail` levels, the same split shared/bayworld.js uses:
//   "high" — the whole 2000×1400 m seabed with its kelp stands, eelgrass,
//     reef balls, wreck, pilings, outfall, fish schools and marsh mouth, for
//     a standalone dive app with its own camera and mesh budget. Documented
//     budget: DEEP_MESH_BUDGET.high.
//   "low" — a compact seabed vignette near the origin, self-contained and
//     independent of the zone/site data. This is what smartcity/js/
//     districts.js's "the-deep" entry asks for, inside SCENIC_BUDGET.

// --------------------------------------------------------------------- data

/** The world's outer field, in scene units (metres): 2000 m × 1400 m of seabed. */
export const DEEP_BOUNDS = { minX: -1000, maxX: 1000, minZ: -700, maxZ: 700 };

/** Bounded, continuous range deepDepthAt() returns: positive metres below the
 *  surface. Scenery and gameplay only — never a limit shown to a learner. */
export const DEEP_DEPTH_RANGE = [1, 120];

/**
 * Fourteen zones tiling DEEP_BOUNDS by nearest centre (see deepZoneAt()).
 * Each is `{ id, name, centre:[x,z], radius, palette:{water, seabed,
 * accent}, blurb }` — `radius` is the zone's approximate visual extent for a
 * builder deciding how far to dress it, not a hard edge (deepZoneAt()
 * assigns every point in the field to its nearest centre regardless of
 * radius, so the zones tile the whole field with no gap and no double
 * cover). `palette` is plain hex numbers; shared/underwater.js turns them
 * into materials, so this module stays free of any three.js import.
 */
export const DEEP_ZONES = [
  { id: "pier-pilings", name: "The Pier Pilings", centre: [-750, -560], radius: 170,
    palette: { water: 0x1e5a5c, seabed: 0x4a574d, accent: 0xa8f0e0 },
    blurb: "A forest of timber and concrete piles under a public pier, furred with growth and lit from above between the deck planks." },
  { id: "shallow-shelf", name: "The Shallow Shelf", centre: [-350, -560], radius: 200,
    palette: { water: 0x246a66, seabed: 0x8a7a5a, accent: 0xf2c14b },
    blurb: "Sun-lit sand and scattered boulders in the shallows off the shore, where every dive in this world begins." },
  { id: "eelgrass-meadow", name: "Eelgrass Meadow", centre: [100, -540], radius: 200,
    palette: { water: 0x2a6c68, seabed: 0x5a6a3a, accent: 0x59c97b },
    blurb: "A soft-bottom meadow of ribbon grass swaying in the tide, with transplant plots staked along its edge." },
  { id: "marsh-mouth", name: "Marsh Channel Mouth", centre: [650, -560], radius: 190,
    palette: { water: 0x3a6a5a, seabed: 0x6a5a3a, accent: 0x8bd6a5 },
    blurb: "Where a tidal-marsh channel spills onto the flats: turbid water, a sandbar, and current that turns with the tide." },
  { id: "kelp-forest", name: "Kelp Forest", centre: [-500, -220], radius: 200,
    palette: { water: 0x1b5054, seabed: 0x3a3a2a, accent: 0x7ab648 },
    blurb: "Tall kelp anchored to a rocky rise, its canopy closing overhead into shifting green light." },
  { id: "tide-flats", name: "Tide Gauge Flats", centre: [-100, -260], radius: 190,
    palette: { water: 0x1f5c5e, seabed: 0x6a6a5a, accent: 0x4fd1ff },
    blurb: "Open flats with a tide-gauge post and a sonde mooring, the survey teams' usual first stop." },
  { id: "outfall-apron", name: "The Outfall Apron", centre: [400, -260], radius: 190,
    palette: { water: 0x1f5254, seabed: 0x5a5a5a, accent: 0xf07a1f },
    blurb: "A rock apron around an outfall diffuser, its pipe run marked and the discharge zone flagged on every dive plan." },
  { id: "channel-approach", name: "Channel Approach", centre: [-750, 0], radius: 220,
    palette: { water: 0x143e48, seabed: 0x4a4a4a, accent: 0xd8232a },
    blurb: "The western approach to the shipping channel, a buoy chain overhead and traffic that a dive supervisor never lets a diver forget." },
  { id: "shipping-channel", name: "The Shipping Channel", centre: [-150, 60], radius: 230,
    palette: { water: 0x123a44, seabed: 0x3f4a4a, accent: 0xd8232a },
    blurb: "A dredged trough across the middle of the world, marked by a chain of channel markers and closed to diving whenever traffic moves." },
  { id: "reef-ball-field", name: "Reef Ball Field", centre: [350, 0], radius: 200,
    palette: { water: 0x1b5054, seabed: 0x5a6a5a, accent: 0x4fd6a5 },
    blurb: "Rows of hollow concrete reef balls set on the bottom for monitoring, with a settlement-tile rack at one end." },
  { id: "mud-plain", name: "The Mud Plain", centre: [-300, 330], radius: 230,
    palette: { water: 0x112f3c, seabed: 0x3a3a34, accent: 0x8b98a5 },
    blurb: "Flat, featureless soft bottom south of the channel where a fin kick lifts a cloud that hangs for minutes." },
  { id: "wreck-hollow", name: "The Wreck Hollow", centre: [250, 300], radius: 200,
    palette: { water: 0x10323c, seabed: 0x3a4a44, accent: 0xf2c14b },
    blurb: "A scoured hollow beside the channel holding an old workboat hull, bow and stern still readable under the growth." },
  { id: "deep-trench", name: "The Deep Trench", centre: [-700, 480], radius: 260,
    palette: { water: 0x0a2230, seabed: 0x2a2a30, accent: 0x5a7a9a },
    blurb: "A steep-walled trench in the south-west of the world, dark below its lip — the far end of any survey career here." },
  { id: "seamount", name: "The Seamount", centre: [650, 450], radius: 260,
    palette: { water: 0x0f3a44, seabed: 0x4a4038, accent: 0xff8a5a },
    blurb: "A rock mount rising from the deep south-east floor to a pinnacle in clearer, brighter water." },
];

/**
 * Twenty-five landmarks, `{ id, name, zone, position:[x,z], kind, blurb }`.
 * Every `name` is a plain generic name (never a real vessel, org or place)
 * and every `blurb` is one generic line asserting no date, depth, dimension,
 * count, ownership, history or species — nothing here could be wrong about
 * a real place because nothing here claims to be one.
 */
export const DEEP_LANDMARKS = [
  { id: "piling-forest", name: "Pier Piling Forest", zone: "pier-pilings", position: [-760, -600], kind: "pilings",
    blurb: "Rows of piles under the pier deck, each one furred with growth and ringed by the shadows of the planks above." },
  { id: "pier-ladder", name: "Pier Ladder", zone: "pier-pilings", position: [-700, -540], kind: "ladder",
    blurb: "A steel ladder bolted to the pier's landward face — the surface-supplied crews' way in and out." },
  { id: "shelf-boulder-garden", name: "Shelf Boulder Garden", zone: "shallow-shelf", position: [-330, -600], kind: "boulders",
    blurb: "A scatter of rounded boulders on bright sand, the first thing a new diver learns to navigate around." },
  { id: "old-anchor", name: "The Old Anchor", zone: "shallow-shelf", position: [-390, -520], kind: "anchor",
    blurb: "A stock anchor half buried in the sand, a favourite turning mark for the shelf swim." },
  { id: "eelgrass-edge", name: "Eelgrass Meadow Edge", zone: "eelgrass-meadow", position: [60, -580], kind: "meadow",
    blurb: "The line where the sand gives way to swaying grass, staked with the survey transect's end markers." },
  { id: "eelgrass-nursery-plots", name: "Eelgrass Nursery Plots", zone: "eelgrass-meadow", position: [150, -500], kind: "meadow",
    blurb: "Gridded transplant plots pegged out in the meadow, each corner flagged for the monitoring divers." },
  { id: "marsh-mouth-bar", name: "Marsh Mouth Sandbar", zone: "marsh-mouth", position: [640, -600], kind: "bar",
    blurb: "A ridge of sand built where the marsh channel drops its load, shifting a little with every big tide." },
  { id: "marsh-drift-line", name: "Marsh Drift Line", zone: "marsh-mouth", position: [700, -520], kind: "drift",
    blurb: "A buoyed line across the channel mouth that drift surveys follow with the ebb." },
  { id: "kelp-cathedral", name: "Kelp Cathedral", zone: "kelp-forest", position: [-520, -240], kind: "kelp",
    blurb: "The tallest stand in the forest, where the stipes rise like columns and the canopy closes overhead." },
  { id: "holdfast-ledge", name: "Holdfast Ledge", zone: "kelp-forest", position: [-450, -180], kind: "ledge",
    blurb: "A rock ledge at the forest's edge where the kelp holdfasts grip and the photo quadrats are laid." },
  { id: "tide-gauge-post", name: "Tide Gauge Post", zone: "tide-flats", position: [-120, -240], kind: "gauge",
    blurb: "A graduated post standing on the flats, its face read by every survey team on the way out." },
  { id: "sonde-mooring", name: "Sonde Mooring", zone: "tide-flats", position: [-60, -300], kind: "mooring",
    blurb: "A weighted mooring with a water-quality sonde clipped to its riser, serviced on a schedule the crew holds." },
  { id: "outfall-diffuser", name: "Outfall Diffuser", zone: "outfall-apron", position: [420, -240], kind: "diffuser",
    blurb: "The ported end of an outfall pipe on its rock apron, the discharge zone flagged on every dive plan." },
  { id: "outfall-pipe-run", name: "Outfall Pipe Run", zone: "outfall-apron", position: [370, -320], kind: "pipe",
    blurb: "The buried-and-exposed run of pipe leading out to the diffuser, marked with stakes along its length." },
  { id: "approach-buoy-chain", name: "Approach Buoy Chain", zone: "channel-approach", position: [-760, 20], kind: "markers",
    blurb: "A line of buoy moorings whose chains drop from the surface at the channel's western approach." },
  { id: "channel-marker-chain", name: "Channel Marker Chain", zone: "shipping-channel", position: [-170, 80], kind: "markers",
    blurb: "The moorings of the channel markers, each chain rising out of sight to a lit buoy overhead." },
  { id: "reef-ball-rows", name: "Reef Ball Rows", zone: "reef-ball-field", position: [340, -20], kind: "reef",
    blurb: "Hollow concrete domes in tidy rows, set out on the bottom for the monitoring programme." },
  { id: "settlement-tile-rack", name: "Settlement Tile Rack", zone: "reef-ball-field", position: [400, 30], kind: "rack",
    blurb: "A steel rack of tiles left on the bottom for whatever settles, photographed on a schedule the crew holds." },
  { id: "mud-plain-mooring", name: "Mud Plain Mooring Block", zone: "mud-plain", position: [-320, 350], kind: "mooring",
    blurb: "A concrete mooring block sunk in the mud, its chain the only fixed thing on the plain." },
  { id: "wreck-bow", name: "The Wreck's Bow", zone: "wreck-hollow", position: [230, 280], kind: "wreck",
    blurb: "The upright bow of an old workboat hull in the hollow, its rail still readable under the growth." },
  { id: "wreck-stern", name: "The Wreck's Stern", zone: "wreck-hollow", position: [280, 330], kind: "wreck",
    blurb: "The hull's stern, settled deeper in the scour, where the survey photo line ends." },
  { id: "trench-lip", name: "Trench Lip", zone: "deep-trench", position: [-660, 420], kind: "ledge",
    blurb: "The edge where the mud plain drops away into the dark — the turnaround point on most dive plans." },
  { id: "trench-floor-cairn", name: "Trench Floor Cairn", zone: "deep-trench", position: [-720, 520], kind: "cairn",
    blurb: "A stacked-stone marker on the trench floor left by the ROV crews as a survey datum." },
  { id: "seamount-pinnacle", name: "Seamount Pinnacle", zone: "seamount", position: [660, 440], kind: "pinnacle",
    blurb: "The mount's top, in brighter water, ringed by the transect pins of the capstone survey." },
  { id: "seamount-saddle", name: "Seamount Saddle", zone: "seamount", position: [600, 500], kind: "saddle",
    blurb: "A dip between the pinnacle and a lower shoulder where the ascent line to the surface is set." },
];

/** Half-width, metres, within which deepLineAt() reads a point as on a line. */
const DEEP_LINE_HALF_WIDTH = 4;

/**
 * Dive lines, anchor lines and transects in place of roads, `{ id, name,
 * kind:"transect"|"anchor-line"|"guideline"|"channel", points:[[x,z]…] }`:
 * a shore guideline running the length of the shallows, a main guideline
 * from the pier out across the flats and the channel to the wreck and the
 * seamount, transects across the eelgrass, the kelp, the reef balls and the
 * marsh mouth, anchor lines at the sites a boat works from, and the channel's
 * own centreline. Every branch shares an exact endpoint with another, so the
 * network is one connected component by construction — see
 * tools/check_underwater.mjs, which confirms it rather than trusting this.
 */
export const DEEP_LINES = [
  { id: "shore-guideline", name: "Shore Guideline", kind: "guideline", points: [
    [-760, -600], [-700, -560], [-350, -560], [100, -540], [400, -540], [650, -560],
  ] },
  { id: "main-guideline", name: "Main Guideline", kind: "guideline", points: [
    [-700, -560], [-500, -220], [-100, -260], [-150, 60], [-300, 330], [250, 300], [650, 450],
  ] },
  { id: "kelp-transect", name: "Kelp Transect", kind: "transect", points: [[-500, -220], [-520, -240], [-450, -180]] },
  { id: "eelgrass-transect", name: "Eelgrass Transect", kind: "transect", points: [[100, -540], [60, -580], [150, -500]] },
  { id: "reef-ball-transect", name: "Reef Ball Transect", kind: "transect", points: [[-100, -260], [350, 0], [340, -20], [400, 30]] },
  { id: "outfall-transect", name: "Outfall Transect", kind: "transect", points: [[400, -540], [400, -260], [370, -320], [420, -240]] },
  { id: "marsh-drift-transect", name: "Marsh Drift Transect", kind: "transect", points: [[650, -560], [640, -600], [700, -520]] },
  { id: "wreck-photo-line", name: "Wreck Photo Line", kind: "transect", points: [[250, 300], [230, 280], [280, 330]] },
  { id: "trench-lip-transect", name: "Trench Lip Transect", kind: "transect", points: [[-300, 330], [-660, 420], [-700, 480], [-720, 520]] },
  { id: "seamount-transect", name: "Seamount Transect", kind: "transect", points: [[650, 450], [660, 440], [600, 500]] },
  { id: "pier-anchor-line", name: "Pier Anchor Line", kind: "anchor-line", points: [[-750, -560], [-760, -600]] },
  { id: "flats-anchor-line", name: "Flats Anchor Line", kind: "anchor-line", points: [[-100, -260], [-120, -240], [-60, -300]] },
  { id: "wreck-anchor-line", name: "Wreck Anchor Line", kind: "anchor-line", points: [[250, 300], [250, 340]] },
  { id: "seamount-ascent-line", name: "Seamount Ascent Line", kind: "anchor-line", points: [[600, 500], [640, 470]] },
  { id: "mud-plain-anchor-line", name: "Mud Plain Anchor Line", kind: "anchor-line", points: [[-300, 330], [-320, 350]] },
  { id: "channel-centreline", name: "Channel Centreline", kind: "channel", points: [
    [-1000, 20], [-750, 0], [-400, 40], [-150, 60], [150, 130], [500, 180], [1000, 220],
  ] },
  { id: "approach-anchor-line", name: "Approach Anchor Line", kind: "anchor-line", points: [[-750, 0], [-760, 20]] },
];

/**
 * Thirty-two dive and survey sites, `{ id, name, zone, position:[x,z],
 * programmes:[...], stations:[...] }`. `programmes` names ids from
 * smartcity/js/curricula.js's CURRICULA — the marine, restoration, port and
 * environmental programmes a dive site plausibly anchors (every curriculum
 * programme is anchored somewhere across DEEP_SITES and BAY_SITES together;
 * tools/check_underwater.mjs confirms it); `stations` names real station ids
 * from smartcity/js/sims/ (the `br-`, `mw-`, `uw-`, restoration and port
 * stations that exist today) for a quest layer that wants to point a learner
 * at a real station rather than invent one.
 *
 * The commercial-diving/scientific-scuba pack (`cd-`) and the marine-ecology
 * pack (`me-`) named in tools/briefs/dive-brief.md join these anchors at
 * integration, once their stations exist in the catalog; the comment on each
 * site below says which ids are expected to land there.
 */
export const DEEP_SITES = [
  // ---- the pier pilings
  // Anchored here: cd-pier-piling-inspection-and-wrap-repair, cd-underwater-wet-welding-and-cutting.
  { id: "pier-piling-inspection-station", name: "Pier Piling Inspection Station", zone: "pier-pilings", position: [-740, -580],
    programmes: ["bay-area-union-edition", "commercial-diving-and-scientific-scuba"], stations: ["mw-pier-pile-inspection-dive", "mw-underwater-welding-and-cutting", "gg-pile-driver-fender-repair", "cd-pier-piling-inspection-and-wrap-repair", "cd-underwater-wet-welding-and-cutting"] },
  // Anchored here: cd-decompression-chamber-operations-and-post-dive, cd-dive-records-and-incident-review.
  { id: "pier-surface-supplied-station", name: "Pier Surface-Supplied Station", zone: "pier-pilings", position: [-720, -530],
    programmes: ["bay-restoration-maritime-underwater", "commercial-diving-and-scientific-scuba"], stations: ["br-surface-supplied-dive-station-setup", "br-dive-tender-and-umbilical-management", "br-hyperbaric-chamber-standby", "cd-decompression-chamber-operations-and-post-dive", "cd-dive-records-and-incident-review"] },
  { id: "pier-creosote-pile-site", name: "Pier Creosote Pile Site", zone: "pier-pilings", position: [-790, -560],
    programmes: ["hunters-point-bay-restoration", "heavy-equipment-operators"], stations: ["creosote-pile-removal", "op-pile-driving-rig-and-lead-setup", "br-marine-mammal-observer-during-pile-driving"] },
  // ---- the shallow shelf
  // Anchored here: cd-scientific-scuba-buddy-check-and-lost-buddy-drill.
  { id: "shelf-checkout-site", name: "Shelf Checkout Site", zone: "shallow-shelf", position: [-360, -540],
    programmes: ["bay-restoration-maritime-underwater", "situational-awareness", "commercial-diving-and-scientific-scuba"], stations: ["br-dive-site-hazard-assessment-and-jsa", "br-cold-water-immersion-and-mob-recovery", "trench-box", "cd-scientific-scuba-buddy-check-and-lost-buddy-drill"] },
  { id: "shelf-debris-sweep", name: "Shelf Debris Sweep", zone: "shallow-shelf", position: [-320, -580],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-underwater-debris-survey-and-mapping", "br-derelict-gear-recovery-dive", "br-shoreline-cleanup-sharps-and-hazardous-debris"] },
  { id: "shelf-lift-bag-site", name: "Shelf Lift Bag Site", zone: "shallow-shelf", position: [-400, -580],
    programmes: ["bay-area-union-edition", "rigging-lifting"], stations: ["uw-lift-bag-rigging-and-object-recovery", "rl-critical-lift-plan-and-signalperson"] },
  // ---- the eelgrass meadow
  // Anchored here: me-eelgrass-seed-collection-and-nursery.
  { id: "eelgrass-transplant-plots", name: "Eelgrass Transplant Plots", zone: "eelgrass-meadow", position: [130, -520],
    programmes: ["hunters-point-bay-restoration", "marine-ecology-and-restoration"], stations: ["eelgrass-transplant", "br-native-planting-and-erosion-mats", "me-eelgrass-seed-collection-and-nursery"] },
  // Anchored here: me-fish-visual-census-and-data-sheet.
  { id: "eelgrass-fish-census-line", name: "Eelgrass Fish Census Line", zone: "eelgrass-meadow", position: [80, -560],
    programmes: ["bay-restoration-maritime-underwater", "marine-ecology-and-restoration"], stations: ["br-beach-seine-fish-survey-and-handling", "br-benthic-grab-and-invertebrate-sorting", "br-restoration-data-qa-and-public-reporting", "me-fish-visual-census-and-data-sheet"] },
  { id: "eelgrass-turbidity-curtain", name: "Eelgrass Turbidity Curtain", zone: "eelgrass-meadow", position: [40, -500],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-turbidity-curtain-deployment", "br-bird-nesting-buffer-and-work-window"] },
  // ---- the marsh channel mouth
  // Anchored here: me-tidal-marsh-channel-restoration-day.
  { id: "marsh-mouth-tide-gate", name: "Marsh Mouth Tide Gate", zone: "marsh-mouth", position: [660, -530],
    programmes: ["hunters-point-bay-restoration", "marine-ecology-and-restoration"], stations: ["tide-gate", "marsh-transect-survey", "living-shoreline", "me-tidal-marsh-channel-restoration-day"] },
  { id: "marsh-mouth-culvert", name: "Marsh Mouth Culvert", zone: "marsh-mouth", position: [620, -580],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-culvert-retrofit-for-fish-passage", "br-fish-screen-maintenance", "br-tidal-marsh-grading-amphibious-excavator"] },
  { id: "marsh-mouth-invasive-plot", name: "Marsh Mouth Invasive Plot", zone: "marsh-mouth", position: [700, -570],
    programmes: ["hunters-point-bay-restoration", "bay-restoration-maritime-underwater"], stations: ["spartina-removal", "br-intertidal-invasive-removal-by-hand-crew", "br-levee-inspection-and-seepage"] },
  // ---- the kelp forest
  // Anchored here: me-kelp-transect-survey-and-photo-quadrats.
  { id: "kelp-transect-start", name: "Kelp Transect Start", zone: "kelp-forest", position: [-480, -200],
    programmes: ["bay-restoration-maritime-underwater", "marine-ecology-and-restoration"], stations: ["br-underwater-debris-survey-and-mapping", "br-restoration-data-qa-and-public-reporting", "me-kelp-transect-survey-and-photo-quadrats"] },
  // Anchored here: cd-low-visibility-and-night-dive-line-work.
  { id: "kelp-night-line-site", name: "Kelp Night Line Site", zone: "kelp-forest", position: [-530, -260],
    programmes: ["bay-area-union-edition", "commercial-diving-and-scientific-scuba"], stations: ["mw-diver-emergency-and-recovery", "mw-dive-supervisor-and-dive-plan", "cd-low-visibility-and-night-dive-line-work"] },
  // ---- the tide gauge flats
  { id: "flats-sonde-station", name: "Flats Sonde Station", zone: "tide-flats", position: [-80, -280],
    programmes: ["bay-restoration-maritime-underwater", "air-quality-monitoring"], stations: ["br-water-quality-sonde-calibration-and-deploy", "air-monitor", "sensor-colocation-check"] },
  // Anchored here: me-water-column-sampling-from-a-small-boat.
  { id: "flats-sediment-core-site", name: "Flats Sediment Core Site", zone: "tide-flats", position: [-130, -230],
    programmes: ["bay-restoration-maritime-underwater", "hunters-point-can-we-live", "marine-ecology-and-restoration"], stations: ["br-underwater-sediment-core-sampling", "br-sediment-chain-of-custody-and-lab-prep", "shoreline-sediment-grab", "me-water-column-sampling-from-a-small-boat"] },
  { id: "flats-workboat-anchorage", name: "Flats Workboat Anchorage", zone: "tide-flats", position: [-60, -240],
    programmes: ["bay-restoration-maritime-underwater", "bay-area-union-edition"], stations: ["br-workboat-crane-lift-from-water", "br-vhf-and-navigation-in-a-work-zone", "mw-workboat-towing-and-line-handling"] },
  // ---- the outfall apron
  { id: "outfall-diffuser-inspection", name: "Outfall Diffuser Inspection", zone: "outfall-apron", position: [410, -260],
    programmes: ["hazmat-environmental", "water-and-gas-utility-crews"], stations: ["stormwater-outfall", "ut-cathodic-protection-test-station-reading"] },
  // Anchored here: cd-hydraulic-tools-and-suction-hazards-underwater.
  { id: "outfall-intake-lockout-site", name: "Outfall Intake Lockout Site", zone: "outfall-apron", position: [380, -290],
    programmes: ["bay-area-union-edition", "confined-space", "commercial-diving-and-scientific-scuba"], stations: ["uw-intake-screen-cleaning-with-lockout", "uw-pipeline-crossing-inspection-dive", "cs-permit-entry-and-attendant-duties", "cd-hydraulic-tools-and-suction-hazards-underwater"] },
  { id: "outfall-discharge-photo-point", name: "Outfall Discharge Photo Point", zone: "outfall-apron", position: [440, -220],
    programmes: ["hunters-point-can-we-live"], stations: ["discharge-photo-doc", "air-sensor-install"] },
  // ---- the channel approach
  { id: "approach-buoy-tender-station", name: "Approach Buoy Tender Station", zone: "channel-approach", position: [-740, -20],
    programmes: ["port-operations", "ports-maritime-ecology"], stations: ["mooring-line", "pilot-transfer", "spill-boom-deploy"] },
  { id: "approach-boom-tow-site", name: "Approach Boom Tow Site", zone: "channel-approach", position: [-780, 40],
    programmes: ["bay-restoration-maritime-underwater", "bay-area-union-edition"], stations: ["br-boom-towing-between-two-vessels", "mw-oil-transfer-watch-and-boom", "br-debris-skimmer-vessel-operations"] },
  // ---- the shipping channel
  { id: "channel-dredge-survey", name: "Channel Dredge Survey", zone: "shipping-channel", position: [-140, 40],
    programmes: ["hunters-point-bay-restoration", "bay-restoration-maritime-underwater"], stations: ["dredge-barge", "br-dredge-material-screening-and-disposal-decision", "br-barge-loading-of-contaminated-sediment"] },
  { id: "channel-scour-survey", name: "Channel Scour Survey", zone: "shipping-channel", position: [-180, 90],
    programmes: ["bay-area-union-edition", "bridge-and-structural"], stations: ["uw-bridge-pier-scour-survey", "uw-underwater-concrete-and-bag-placement", "bridge-cable-inspection"] },
  // ---- the reef ball field
  // Anchored here: me-oyster-reef-monitoring-and-settlement-tiles, me-invasive-species-identification-and-reporting.
  { id: "reef-ball-monitoring-plot", name: "Reef Ball Monitoring Plot", zone: "reef-ball-field", position: [360, -10],
    programmes: ["hunters-point-bay-restoration", "ports-maritime-ecology", "marine-ecology-and-restoration"], stations: ["oyster-reef-monitoring", "ballast-water-sampling", "me-oyster-reef-monitoring-and-settlement-tiles", "me-invasive-species-identification-and-reporting"] },
  { id: "reef-ball-placement-site", name: "Reef Ball Placement Site", zone: "reef-ball-field", position: [330, 40],
    programmes: ["bay-restoration-maritime-underwater", "port-operations"], stations: ["br-workboat-crane-lift-from-water", "br-derelict-vessel-salvage-rigging", "container-lashing"] },
  // ---- the mud plain
  { id: "mud-plain-hotspot-survey", name: "Mud Plain Hotspot Survey", zone: "mud-plain", position: [-290, 310],
    programmes: ["bay-restoration-maritime-underwater", "hunters-point-bay-restoration"], stations: ["br-legacy-mercury-and-pcb-hotspot-handling", "sediment-cap", "rad-survey"] },
  { id: "mud-plain-trash-capture", name: "Mud Plain Trash Capture Site", zone: "mud-plain", position: [-330, 360],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-trash-capture-device-service", "br-volunteer-cleanup-day-safety-lead"] },
  // ---- the wreck hollow
  { id: "wreck-photo-survey", name: "Wreck Photo Survey", zone: "wreck-hollow", position: [240, 310],
    programmes: ["bay-restoration-maritime-underwater", "bay-area-union-edition"], stations: ["br-underwater-debris-survey-and-mapping", "mw-hull-inspection-and-cleaning-dive", "br-drone-shoreline-survey"] },
  { id: "wreck-salvage-rigging", name: "Wreck Salvage Rigging", zone: "wreck-hollow", position: [270, 260],
    programmes: ["bay-restoration-maritime-underwater", "rigging-lifting"], stations: ["br-derelict-vessel-salvage-rigging", "uw-lift-bag-rigging-and-object-recovery", "rl-critical-lift-plan-and-signalperson"] },
  // ---- the deep trench
  // Anchored here: cd-rov-launch-recovery-and-tether-management.
  { id: "trench-rov-station", name: "Trench ROV Station", zone: "deep-trench", position: [-680, 460],
    programmes: ["bay-area-union-edition", "commercial-diving-and-scientific-scuba"], stations: ["uw-rov-pre-dive-and-tether-management", "mw-dive-supervisor-and-dive-plan", "cd-rov-launch-recovery-and-tether-management"] },
  // ---- the seamount
  // Anchored here: me-shoreline-debris-and-microplastics-survey (the capstone survey).
  { id: "seamount-capstone-survey", name: "Seamount Capstone Survey", zone: "seamount", position: [640, 460],
    programmes: ["bay-restoration-maritime-underwater", "first-responders", "marine-ecology-and-restoration"], stations: ["br-restoration-data-qa-and-public-reporting", "br-hyperbaric-chamber-standby", "damage-assessment-team", "me-shoreline-debris-and-microplastics-survey"] },
  // Anchored here: ws-ocean-pod-retrieval-and-hatch-opening.
  { id: "mud-plain-data-pod-skid", name: "Mud Plain Data Pod Skid", zone: "mud-plain", position: [-270, 380],
    programmes: ["wind-and-data-infrastructure"], stations: ["ws-ocean-pod-retrieval-and-hatch-opening"] },
];

/** Documented mesh budget, authored (before mergeStatic — see kit.js's
 *  mergeStatic doc and shared/bayworld-data.js's BAY_MESH_BUDGET, which this
 *  mirrors: "high" is LOD 0, the whole seabed; "low" is the compact vignette
 *  smartcity/js/districts.js registers as "the-deep"). */
export const DEEP_MESH_BUDGET = { low: 100, high: 1400 };

// ---------------------------------------------------------------- geometry

/** A small deterministic PRNG (the same LCG shared/bayworld-data.js's
 *  bwSeededRng uses), so a builder's kelp/fish/reef scatter is reproducible
 *  run to run. Its own copy, so this module imports nothing. */
export function deepSeededRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function deepDist(x0, z0, x1, z1) { return Math.hypot(x1 - x0, z1 - z0); }

/** Shortest distance from a point to a line segment, in the XZ plane. */
function deepDistToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az;
  const lenSq = abx * abx + abz * abz;
  const t = lenSq > 0 ? Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq)) : 0;
  return deepDist(px, pz, ax + abx * t, az + abz * t);
}

function deepSmooth(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/** A smooth bump of height 1 at (cx, cz) falling to 0 at `falloff` metres. */
function deepBump(x, z, cx, cz, falloff) {
  return deepSmooth(Math.max(0, 1 - deepDist(x, z, cx, cz) / falloff));
}

/** The zone whose centre is nearest (x, z) — a Voronoi assignment over
 *  DEEP_ZONES' centres, which is what makes the zones tile the whole of
 *  DEEP_BOUNDS with no gap and no double cover regardless of each zone's
 *  own (approximate, cosmetic) `radius`. Never returns null. */
export function deepZoneAt(x, z) {
  let best = DEEP_ZONES[0], bestDist = Infinity;
  for (const zone of DEEP_ZONES) {
    const d = deepDist(x, z, zone.centre[0], zone.centre[1]);
    if (d < bestDist) { bestDist = d; best = zone; }
  }
  return best;
}

// The seabed field. The shelf slopes gently away from the shore (z = -700)
// to the south; on top of it: the dredged channel trough along the channel
// centreline, the wreck's scour hollow, the trench's deep bowl, and three
// rises — the kelp forest's rock, the seamount, and the sandbar at the marsh
// mouth. Everything is a smooth bump or a sine term, so the sum is
// continuous everywhere, and clamping a continuous function to
// DEEP_DEPTH_RANGE keeps it continuous.
const DEEP_SHELF_NEAR = 4;    // metres below the surface at the shore edge
const DEEP_SHELF_FAR = 40;    // metres below the surface at the far edge, before the features
const DEEP_CHANNEL_CUT = 14;  // extra metres in the channel trough
const DEEP_CHANNEL_SIGMA = 70;
const DEEP_TRENCH_CENTRE = [-700, 480];
const DEEP_TRENCH_FALLOFF = 260;
const DEEP_TRENCH_CUT = 70;
const DEEP_WRECK_CENTRE = [250, 300];
const DEEP_WRECK_FALLOFF = 120;
const DEEP_WRECK_CUT = 8;
const DEEP_SEAMOUNT_CENTRE = [650, 450];
const DEEP_SEAMOUNT_FALLOFF = 220;
const DEEP_SEAMOUNT_RISE = 22;
const DEEP_KELP_ROCK_CENTRE = [-500, -220];
const DEEP_KELP_ROCK_FALLOFF = 160;
const DEEP_KELP_ROCK_RISE = 5;
const DEEP_MARSH_BAR_CENTRE = [640, -600];
const DEEP_MARSH_BAR_FALLOFF = 90;
const DEEP_MARSH_BAR_RISE = 2;

const DEEP_CHANNEL_LINE = DEEP_LINES.find((l) => l.id === "channel-centreline");

function deepDistToPolyline(x, z, points) {
  let best = Infinity;
  for (let i = 1; i < points.length; i++) {
    const [ax, az] = points[i - 1], [bx, bz] = points[i];
    best = Math.min(best, deepDistToSegment(x, z, ax, az, bx, bz));
  }
  return best;
}

/**
 * Deterministic seabed depth at (x, z) in positive metres below the surface,
 * bounded to DEEP_DEPTH_RANGE and continuous everywhere. Used to give the
 * built seabed its relief and, by a dive game or a quest script, to place a
 * diver, an ROV or a set piece on the bottom without touching three.js.
 * Scenery and gameplay only: never shown to a learner as a limit.
 */
export function deepDepthAt(x, z) {
  const { minZ, maxZ } = DEEP_BOUNDS;
  const t = Math.max(0, Math.min(1, (z - minZ) / (maxZ - minZ)));
  const shelf = DEEP_SHELF_NEAR + (DEEP_SHELF_FAR - DEEP_SHELF_NEAR) * t;
  const dChannel = deepDistToPolyline(x, z, DEEP_CHANNEL_LINE.points);
  const channel = DEEP_CHANNEL_CUT * Math.exp(-(dChannel * dChannel) / (2 * DEEP_CHANNEL_SIGMA * DEEP_CHANNEL_SIGMA));
  const trench = DEEP_TRENCH_CUT * deepBump(x, z, DEEP_TRENCH_CENTRE[0], DEEP_TRENCH_CENTRE[1], DEEP_TRENCH_FALLOFF);
  const wreck = DEEP_WRECK_CUT * deepBump(x, z, DEEP_WRECK_CENTRE[0], DEEP_WRECK_CENTRE[1], DEEP_WRECK_FALLOFF);
  const seamount = DEEP_SEAMOUNT_RISE * deepBump(x, z, DEEP_SEAMOUNT_CENTRE[0], DEEP_SEAMOUNT_CENTRE[1], DEEP_SEAMOUNT_FALLOFF);
  const kelpRock = DEEP_KELP_ROCK_RISE * deepBump(x, z, DEEP_KELP_ROCK_CENTRE[0], DEEP_KELP_ROCK_CENTRE[1], DEEP_KELP_ROCK_FALLOFF);
  const marshBar = DEEP_MARSH_BAR_RISE * deepBump(x, z, DEEP_MARSH_BAR_CENTRE[0], DEEP_MARSH_BAR_CENTRE[1], DEEP_MARSH_BAR_FALLOFF);
  const ripple = 0.6 * Math.sin(x * 0.02 + 0.7) * Math.cos(z * 0.017 - 0.3) + 0.4 * Math.cos((x + z) * 0.011);
  const raw = shelf + channel + trench + wreck - seamount - kelpRock - marshBar + ripple;
  return Math.max(DEEP_DEPTH_RANGE[0], Math.min(DEEP_DEPTH_RANGE[1], raw));
}

/**
 * Whether (x, z) sits on a DEEP_LINES polyline, and which one: `{ onLine:
 * true, id, kind, heading }` (`heading` the bearing in radians of the nearest
 * segment, atan2(dx, dz)) at the nearest line within DEEP_LINE_HALF_WIDTH, or
 * `null` everywhere else — a dive game's "follow the line" HUD and a quest
 * script's "is the diver on the transect" check both read this directly,
 * with no three.js dependency.
 */
export function deepLineAt(x, z) {
  let best = null, bestDist = Infinity;
  for (const line of DEEP_LINES) {
    for (let i = 1; i < line.points.length; i++) {
      const [ax, az] = line.points[i - 1], [bx, bz] = line.points[i];
      const d = deepDistToSegment(x, z, ax, az, bx, bz);
      if (d < bestDist) {
        bestDist = d;
        best = { d, id: line.id, kind: line.kind, heading: Math.atan2(bx - ax, bz - az) };
      }
    }
  }
  if (!best || best.d > DEEP_LINE_HALF_WIDTH) return null;
  return { onLine: true, id: best.id, kind: best.kind, heading: best.heading };
}

/**
 * The depth band a point on the seabed falls in — `"shallow" | "mid" |
 * "deep"` — the same three bands shared/underwater.js's deepLighting() takes.
 * Thresholds are the world's own scenery thresholds, not dive limits.
 */
export function deepBandAt(x, z) {
  const d = deepDepthAt(x, z);
  return d < 12 ? "shallow" : d < 40 ? "mid" : "deep";
}

// ------------------------------------------------ layers and interactive assets
//
// World detail (tools/briefs/worlds-detail-brief.md, console CARTOGRAPHER):
// pure data derived from the tables above, read by the Deep's own map
// (underwater/js/dive-map.js), its world build and
// tools/check_worlds_detail.mjs. Every top-level name is prefixed `ct`/`CT_`
// because the bundler concatenates every module into one scope.

/** The map layers the Deep's map can toggle, in drawing order. */
export const CT_DEEP_LAYERS = [
  { id: "roads", label: "Dive lines and the channel", colour: 0xf2f2e0, on: true, source: "DEEP_LINES" },
  { id: "jobs", label: "Dive sites by programme", colour: 0xf2c14b, on: true, source: "DEEP_SITES, coloured by first programme" },
  { id: "landmarks", label: "Landmarks", colour: 0xa8f0e0, on: true, source: "DEEP_LANDMARKS" },
  { id: "activities", label: "Activities and eggs found", colour: 0x8cff5a, on: false, source: "the activities and the lantern dives, done or open" },
  { id: "assets", label: "Interactive assets", colour: 0x4fd1ff, on: false, source: "CT_DEEP_ASSETS" },
  { id: "wildlife", label: "Wildlife sightings", colour: 0x59c9c9, on: false, source: "CT_DEEP_WILDLIFE" },
];

/**
 * Sighting spots on the seabed map, by zone: generic kinds only (a fish
 * school, a ray, a crab, seals at the pier), never a species claim or a
 * count — a place a diver may see life, not a survey result.
 */
export const CT_DEEP_WILDLIFE = [
  { kind: "fish", zone: "kelp-forest", area: { x: -500, z: -220, w: 80, d: 60 } },
  { kind: "fish", zone: "reef-ball-field", area: { x: 350, z: 0, w: 80, d: 60 } },
  { kind: "ray", zone: "tide-flats", area: { x: -100, z: -260, w: 90, d: 50 } },
  { kind: "crab", zone: "pier-pilings", area: { x: -760, z: -600, w: 20, d: 20 } },
  { kind: "seals", zone: "pier-pilings", area: { x: -700, z: -540, w: 30, d: 30 } },
  { kind: "fish", zone: "wreck-hollow", area: { x: 250, z: 300, w: 60, d: 40 } },
  { kind: "shorebirds", zone: "marsh-mouth", area: { x: 650, z: -560, w: 70, d: 30 } },
];

/** The Deep's interactive set dressing, what E does at each, and the page it links to. */
export const CT_DEEP_ASSET_KINDS = {
  buoy: { label: "Line buoy", does: "Shows the dive line it marks and where it leads.", link: "site", colour: 0xff9a5a },
  "dive-slate": { label: "Dive slate", does: "Holds the dive plan for the nearest station, then opens it.", link: "station", colour: 0xe8e2d4 },
  "survey-marker": { label: "Survey marker", does: "Opens the programme overview for the survey work anchored here.", link: "programme", colour: 0xf2c14b },
  "tool-basket": { label: "Tool basket", does: "Shows the tools lowered for the nearest station, then opens that station.", link: "station", colour: 0x4fd1ff },
};

function ctDeepRing(p, i, r) {
  const a = (i * 2.399963) % (Math.PI * 2);
  return [Math.round((p[0] + Math.cos(a) * r) * 10) / 10, Math.round((p[1] + Math.sin(a) * r) * 10) / 10];
}

function ctBuildDeepAssets() {
  const out = [];
  const rota = ["dive-slate", "survey-marker", "tool-basket"];
  DEEP_SITES.forEach((s, i) => {
    let kind = rota[i % rota.length];
    const st = s.stations?.[0] ?? null, prog = s.programmes?.[0] ?? null;
    let link = kind === "survey-marker" ? (prog ? { type: "programme", id: prog, site: s.id } : null) : (st ? { type: "station", id: st, site: s.id } : null);
    if (!link) { kind = "buoy"; link = { type: "site", id: s.id }; }
    out.push({ id: `ct-${kind}-${s.id}`, kind, zone: s.zone, near: s.id, name: `${CT_DEEP_ASSET_KINDS[kind].label} · ${s.name}`,
      position: ctDeepRing(s.position, i, 18), programmes: s.programmes ?? [], stations: s.stations ?? [], link });
  });
  // A buoy at the first point of every line: it names the line and links to the nearest site's ?site= page.
  DEEP_LINES.forEach((line, i) => {
    const p = line.points[0];
    let best = null, bd = Infinity;
    for (const s of DEEP_SITES) { const d = Math.hypot(s.position[0] - p[0], s.position[1] - p[1]); if (d < bd) { bd = d; best = s; } }
    out.push({ id: `ct-buoy-${line.id}`, kind: "buoy", zone: deepZoneAt(p[0], p[1]), near: best.id, line: line.id,
      name: `${CT_DEEP_ASSET_KINDS.buoy.label} · ${line.name}`, position: ctDeepRing(p, i, 4), programmes: best.programmes ?? [], stations: best.stations ?? [],
      link: { type: "site", id: best.id } });
  });
  return out;
}

/** Every interactive asset in the Deep: `{ id, kind, zone, near, name, position:[x,z], programmes, stations, link, line? }`. */
export const CT_DEEP_ASSETS = ctBuildDeepAssets();
