// The Deep — seabed stub (pure data, no three.js).
//
// Team DEEP1 is landing the real seabed as WebXR/shared/underwater-data.js
// (DEEP_BOUNDS, DEEP_DEPTH_RANGE, deepDepthAt, DEEP_ZONES, deepZoneAt,
// DEEP_LANDMARKS, DEEP_SITES, DEEP_LINES, deepLineAt, DEEP_MESH_BUDGET) and
// WebXR/shared/underwater.js (buildUnderwater(parent, { detail, zone }),
// deepLighting(band)). This module is a small, original stylised seabed in
// that exact combined shape — thirteen zones, twenty-two landmarks, thirty-two
// sites and one connected dive-line network — so the dive game
// (WebXR/underwater) runs and its checks pass before that lands. See
// WebXR/underwater/js/seabed.js for the one-line-per-module switch that swaps
// this stub for the real modules once they exist; like bayworld/js/
// world-stub.js it then stays in the tree, unbundled.
//
// Coordinates are metres on the same x/z plane every WebXR app builds on; y is
// up, the surface is y = 0 and the seabed sits at y = -deepDepthAt(x, z). Every
// zone, landmark and site here is generic and original: no real place, owner,
// organisation, date, count or species is named, and no depth here is ever
// shown to a learner as a limit — the field is scenery and gameplay only.

export const DEEP_BOUNDS = { minX: -1000, maxX: 1000, minZ: -700, maxZ: 700 };
export const DEEP_DEPTH_RANGE = [2, 110];

// ------------------------------------------------------------------ zones

export const DEEP_ZONES = [
  { id: "pier-pilings", name: "Pier Pilings", centre: [-800, -500], radius: 220, palette: { water: 0x2f7f8f, seabed: 0x5a5245, accent: 0xd9b36a }, blurb: "A forest of pilings under a working pier, the shallow start of every survey career." },
  { id: "shallow-shelf", name: "Shallow Shelf", centre: [-450, -520], radius: 240, palette: { water: 0x3a93a3, seabed: 0x8a7a5a, accent: 0xf2d27a }, blurb: "Sun-lit sand and shell hash, where the light still reaches the bottom." },
  { id: "eelgrass-meadow", name: "Eelgrass Meadow", centre: [-100, -540], radius: 230, palette: { water: 0x2f8a78, seabed: 0x4f6a3a, accent: 0x8cd56a }, blurb: "A meadow of grass blades bending with the tide, transect grids pinned along its edge." },
  { id: "marsh-mouth", name: "Marsh Mouth", centre: [450, -560], radius: 240, palette: { water: 0x5a8a6a, seabed: 0x6a5a3a, accent: 0xc9c26a }, blurb: "Where a tidal-marsh channel spills into the bay and the water runs brown on the ebb." },
  { id: "outfall-apron", name: "Outfall Apron", centre: [800, -480], radius: 220, palette: { water: 0x3a7a8a, seabed: 0x6a6a6a, accent: 0xa0b8c8 }, blurb: "A stone apron around a diffuser, sampled on the permit clock." },
  { id: "kelp-forest", name: "Kelp Forest", centre: [-750, -80], radius: 260, palette: { water: 0x1f6a5a, seabed: 0x3a3a2a, accent: 0x9ad36a }, blurb: "Kelp on rock, a cathedral of stipes with the light coming down between them." },
  { id: "reef-ball-field", name: "Reef Ball Field", centre: [-300, -100], radius: 240, palette: { water: 0x2a7a8a, seabed: 0x6a6050, accent: 0xe0a86a }, blurb: "Rows of hollow concrete reef balls set out on a grid for a restoration survey." },
  { id: "shipping-channel", name: "Shipping Channel", centre: [200, -80], radius: 260, palette: { water: 0x1f4f6a, seabed: 0x4a4a45, accent: 0xff9a5a }, blurb: "The dredged channel under the traffic lane, a marker chain along its edge." },
  { id: "wreck-hollow", name: "Wreck Hollow", centre: [650, -20], radius: 240, palette: { water: 0x1f4a5a, seabed: 0x3f3a35, accent: 0xc98a5a }, blurb: "A scoured hollow with a small derelict hull settled in it, bow to the current." },
  { id: "sand-plain", name: "Sand Plain", centre: [-750, 420], radius: 260, palette: { water: 0x1f5a6f, seabed: 0x7a7060, accent: 0xd8c89a }, blurb: "Open sand waves rolling away into the dark, an anchor line the only landmark." },
  { id: "deep-trench", name: "Deep Trench", centre: [-150, 450], radius: 300, palette: { water: 0x0f2a40, seabed: 0x2a2a30, accent: 0x6a8ad0 }, blurb: "The deepest water on the map, entered only per the dive plan and the tables the supervisor holds." },
  { id: "seamount", name: "Seamount", centre: [500, 450], radius: 280, palette: { water: 0x1f5a70, seabed: 0x5a4a3a, accent: 0xf0c07a }, blurb: "A pinnacle rising out of deep water, the last stop on the survey career." },
  { id: "tender-anchorage", name: "Tender Anchorage", centre: [850, 300], radius: 220, palette: { water: 0x2a6a80, seabed: 0x5a5a50, accent: 0xa8d0e8 }, blurb: "Mooring blocks and chain under the anchorage where the tender boats lie." },
];

/** The zone whose centre is nearest (x, z) — the zone object itself. */
export function deepZoneAt(x, z) {
  let best = DEEP_ZONES[0], bestD = Infinity;
  for (const zone of DEEP_ZONES) {
    const d = Math.hypot(x - zone.centre[0], z - zone.centre[1]);
    if (d < bestD) { bestD = d; best = zone; }
  }
  return best;
}

// ------------------------------------------------------------------ depth

function dvGauss(x, z, cx, cz, r) { const d2 = ((x - cx) ** 2 + (z - cz) ** 2) / (r * r); return Math.exp(-d2); }

/**
 * The seabed depth field, positive metres below the surface, continuous
 * everywhere inside DEEP_BOUNDS. The shelf, the meadow and the pilings are
 * shallow along the north edge; the water deepens to the south into the
 * trench; the channel is a dredged band; the seamount rises out of the deep;
 * the kelp sits on a rock shoulder. Scenery and gameplay only — never shown
 * as a limit.
 */
export function deepDepthAt(x, z) {
  const t = (z - DEEP_BOUNDS.minZ) / (DEEP_BOUNDS.maxZ - DEEP_BOUNDS.minZ);
  let d = 6 + t * 44;
  d += 52 * dvGauss(x, z, -150, 450, 260);                                 // the trench
  d -= 34 * dvGauss(x, z, 500, 450, 170);                                   // the seamount pinnacle
  d += 9 * Math.exp(-((z + 80) ** 2) / (2 * 60 * 60)) * (x > -250 && x < 700 ? 1 : 0.35); // the channel
  d += 8 * dvGauss(x, z, 650, -20, 90);                                     // the wreck hollow
  d -= 3 * dvGauss(x, z, -750, -80, 200);                                   // kelp on a rock shoulder
  d -= 2 * dvGauss(x, z, -800, -500, 150);                                  // the pilings' shallows
  d += 2.5 * Math.sin(x * 0.02) * Math.cos(z * 0.017);                      // sand waves
  return Math.min(DEEP_DEPTH_RANGE[1], Math.max(DEEP_DEPTH_RANGE[0], d));
}

// ------------------------------------------------------------- landmarks

export const DEEP_LANDMARKS = [
  { id: "piling-forest", name: "The Piling Forest", zone: "pier-pilings", position: [-820, -560], kind: "pilings", blurb: "Rows of timber and concrete piles under the pier deck, wrapped in growth." },
  { id: "rope-knot-piling", name: "The Knotted Piling", zone: "pier-pilings", position: [-760, -470], kind: "pilings", blurb: "One piling with an old mooring rope still knotted around it." },
  { id: "tide-gauge-post", name: "The Tide-Gauge Post", zone: "shallow-shelf", position: [-480, -580], kind: "post", blurb: "A staff gauge on a post, its marks read from the surface." },
  { id: "shell-hash-bank", name: "The Shell Hash Bank", zone: "shallow-shelf", position: [-400, -470], kind: "bank", blurb: "A low bank of broken shell the current sorts and re-sorts." },
  { id: "eelgrass-meadow-edge", name: "The Meadow Edge", zone: "eelgrass-meadow", position: [-140, -600], kind: "meadow", blurb: "The line where the grass thins to bare sand, pinned with transect stakes." },
  { id: "quadrat-grid", name: "The Quadrat Grid", zone: "eelgrass-meadow", position: [-40, -500], kind: "grid", blurb: "A planting grid of numbered stakes for a transplant survey." },
  { id: "marsh-mouth-bar", name: "The Marsh Mouth Bar", zone: "marsh-mouth", position: [420, -600], kind: "bar", blurb: "A sand bar across the channel mouth that the ebb pours over." },
  { id: "channel-mouth-stakes", name: "The Channel Stakes", zone: "marsh-mouth", position: [500, -520], kind: "post", blurb: "Stakes marking the marsh channel's line out into the bay." },
  { id: "outfall-diffuser", name: "The Outfall Diffuser", zone: "outfall-apron", position: [820, -500], kind: "pipe", blurb: "A capped diffuser pipe on a stone apron, sampled under the permit." },
  { id: "kelp-cathedral", name: "The Kelp Cathedral", zone: "kelp-forest", position: [-780, -60], kind: "kelp", blurb: "The grandest stand in the forest, light falling in shafts between the stipes." },
  { id: "kelp-holdfast-rock", name: "The Holdfast Rock", zone: "kelp-forest", position: [-700, -160], kind: "rock", blurb: "A boulder with holdfasts gripping every face of it." },
  { id: "rock-arch", name: "The Rock Arch", zone: "kelp-forest", position: [-840, 20], kind: "rock", blurb: "A low arch of rock a diver swims beside, never through." },
  { id: "reef-ball-rows", name: "The Reef Ball Rows", zone: "reef-ball-field", position: [-320, -80], kind: "reef", blurb: "Reef balls set on a grid, each one numbered on a tag." },
  { id: "settlement-tile-rack", name: "The Settlement Tile Rack", zone: "reef-ball-field", position: [-240, -160], kind: "rack", blurb: "A rack of settlement tiles for a monitoring survey." },
  { id: "channel-marker-chain", name: "The Marker Chain", zone: "shipping-channel", position: [160, -140], kind: "chain", blurb: "A chain of channel markers along the dredged edge." },
  { id: "cable-crossing-marker", name: "The Cable Crossing", zone: "shipping-channel", position: [280, -30], kind: "post", blurb: "A marker over a buried cable crossing the channel bed." },
  { id: "wreck-bow", name: "The Wreck's Bow", zone: "wreck-hollow", position: [640, -40], kind: "wreck", blurb: "A small derelict hull, its bow to the current, surveyed by photograph." },
  { id: "wreck-stern", name: "The Wreck's Stern", zone: "wreck-hollow", position: [680, 20], kind: "wreck", blurb: "The stern of the same hull, settled deeper in the scour." },
  { id: "anchor-line-buoy-block", name: "The Anchor Block", zone: "sand-plain", position: [-740, 400], kind: "block", blurb: "A concrete mooring block on open sand, an anchor line rising from it." },
  { id: "trench-lip", name: "The Trench Lip", zone: "deep-trench", position: [-160, 300], kind: "edge", blurb: "Where the sand plain drops away into the trench." },
  { id: "seamount-pinnacle", name: "The Pinnacle", zone: "seamount", position: [510, 440], kind: "rock", blurb: "The top of the seamount, the highest point in the deep water." },
  { id: "mooring-block-chain", name: "The Mooring Chain", zone: "tender-anchorage", position: [860, 280], kind: "chain", blurb: "Chain and mooring blocks under the anchorage." },
];

// ------------------------------------------------------------------ sites
//
// Dive and survey sites, `{ id, name, zone, position:[x,z], programmes:[…],
// stations:[…] }`, anchoring real programme ids from
// smartcity/js/curricula.js and real station ids from the catalog. The `cd-`
// (commercial diving and scientific scuba) and `me-` (marine ecology) packs
// named in tools/briefs/dive-brief.md join at integration: their intended
// anchors are noted in comments beside the site they belong at and are not
// listed as stations until they exist in the catalog.

export const DEEP_SITES = [
  // Pier pilings — the start of the survey career.
  { id: "pier-piling-survey", name: "Pier Piling Survey", zone: "pier-pilings", position: [-790, -520],
    programmes: ["bay-area-union-edition"], stations: ["mw-pier-pile-inspection-dive", "mw-dive-supervisor-and-dive-plan"] }, // cd-pier-piling-inspection-and-wrap-repair joins here
  { id: "pier-dive-station", name: "Pier Dive Station", zone: "pier-pilings", position: [-850, -460],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-dive-site-hazard-assessment-and-jsa", "br-surface-supplied-dive-station-setup", "br-dive-tender-and-umbilical-management"] },
  { id: "pier-hull-berth", name: "Pier Hull Berth", zone: "pier-pilings", position: [-730, -540],
    programmes: ["bay-area-union-edition"], stations: ["mw-hull-inspection-and-cleaning-dive"] },
  // Shallow shelf.
  { id: "shelf-training-ground", name: "Shelf Training Ground", zone: "shallow-shelf", position: [-460, -500],
    programmes: ["bay-area-union-edition"], stations: ["mw-diver-emergency-and-recovery"] }, // cd-scientific-scuba-buddy-check-and-lost-buddy-drill joins here
  { id: "shelf-gauge-station", name: "Gauge Station", zone: "shallow-shelf", position: [-500, -600],
    programmes: ["hunters-point-bay-restoration"], stations: ["tide-gate", "stormwater-outfall"] },
  { id: "shelf-seine-beach", name: "Seine Beach", zone: "shallow-shelf", position: [-380, -450],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-beach-seine-fish-survey-and-handling", "br-benthic-grab-and-invertebrate-sorting"] },
  // Eelgrass meadow.
  { id: "meadow-transplant-grid", name: "Meadow Transplant Grid", zone: "eelgrass-meadow", position: [-60, -520],
    programmes: ["hunters-point-bay-restoration"], stations: ["eelgrass-transplant", "living-shoreline"] }, // me-eelgrass-seed-collection-and-nursery joins here
  { id: "meadow-transect-edge", name: "Meadow Transect Edge", zone: "eelgrass-meadow", position: [-160, -580],
    programmes: ["hunters-point-bay-restoration"], stations: ["marsh-transect-survey", "oyster-reef-monitoring"] }, // me-kelp-transect-survey-and-photo-quadrats, me-fish-visual-census-and-data-sheet join here
  // Marsh mouth.
  { id: "marsh-channel-mouth", name: "Marsh Channel Mouth", zone: "marsh-mouth", position: [440, -570],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-tidal-marsh-grading-amphibious-excavator", "br-culvert-retrofit-for-fish-passage"] }, // me-tidal-marsh-channel-restoration-day joins here
  { id: "marsh-mouth-drift-line", name: "Marsh Drift Line", zone: "marsh-mouth", position: [480, -510],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-turbidity-curtain-deployment", "br-water-quality-sonde-calibration-and-deploy"] },
  { id: "marsh-bar-cleanup", name: "Marsh Bar Cleanup", zone: "marsh-mouth", position: [400, -620],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-shoreline-cleanup-sharps-and-hazardous-debris", "br-volunteer-cleanup-day-safety-lead"] }, // me-shoreline-debris-and-microplastics-survey joins here
  // Outfall apron.
  { id: "outfall-sampling-point", name: "Outfall Sampling Point", zone: "outfall-apron", position: [810, -520],
    programmes: ["hazmat-environmental", "hunters-point-bay-restoration"], stations: ["stormwater-outfall", "air-monitor"] },
  { id: "outfall-trash-capture", name: "Trash Capture Net", zone: "outfall-apron", position: [780, -440],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-trash-capture-device-service"] },
  // Kelp forest.
  { id: "kelp-transect-start", name: "Kelp Transect Start", zone: "kelp-forest", position: [-770, -100],
    programmes: ["hunters-point-bay-restoration"], stations: ["marsh-transect-survey"] }, // me-kelp-transect-survey-and-photo-quadrats joins here
  { id: "kelp-holdfast-station", name: "Holdfast Station", zone: "kelp-forest", position: [-690, -180],
    programmes: ["bay-area-union-edition"], stations: ["uw-rov-pre-dive-and-tether-management"] }, // cd-low-visibility-and-night-dive-line-work joins here
  { id: "kelp-arch-survey", name: "Arch Survey", zone: "kelp-forest", position: [-830, 40],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-underwater-debris-survey-and-mapping"] },
  // Reef ball field.
  { id: "reef-ball-survey", name: "Reef Ball Survey", zone: "reef-ball-field", position: [-310, -60],
    programmes: ["hunters-point-bay-restoration"], stations: ["oyster-reef-monitoring", "living-shoreline"] }, // me-oyster-reef-monitoring-and-settlement-tiles joins here
  { id: "reef-concrete-placement", name: "Reef Concrete Placement", zone: "reef-ball-field", position: [-250, -140],
    programmes: ["bay-area-union-edition"], stations: ["uw-underwater-concrete-and-bag-placement", "uw-lift-bag-rigging-and-object-recovery"] },
  { id: "reef-core-station", name: "Reef Core Station", zone: "reef-ball-field", position: [-360, -170],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-underwater-sediment-core-sampling", "br-sediment-chain-of-custody-and-lab-prep"] },
  // Shipping channel.
  { id: "channel-marker-inspection", name: "Channel Marker Inspection", zone: "shipping-channel", position: [170, -120],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-vhf-and-navigation-in-a-work-zone", "br-cold-water-immersion-and-mob-recovery"] },
  { id: "channel-cable-crossing", name: "Cable Crossing Dive", zone: "shipping-channel", position: [270, -50],
    programmes: ["bay-area-union-edition"], stations: ["uw-pipeline-crossing-inspection-dive", "uw-bridge-pier-scour-survey"] }, // cd-hydraulic-tools-and-suction-hazards-underwater joins here
  { id: "channel-dredge-station", name: "Channel Dredge Station", zone: "shipping-channel", position: [220, -10],
    programmes: ["hunters-point-bay-restoration"], stations: ["dredge-barge", "sediment-cap"] },
  { id: "channel-ballast-check", name: "Ballast Check Berth", zone: "shipping-channel", position: [120, -40],
    programmes: ["ports-maritime-ecology"], stations: ["ballast-water-sampling", "spill-boom-deploy", "pilot-transfer"] },
  // Wreck hollow.
  { id: "wreck-photo-survey", name: "Wreck Photo Survey", zone: "wreck-hollow", position: [630, -60],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-underwater-debris-survey-and-mapping", "br-derelict-vessel-salvage-rigging"] }, // cd-dive-records-and-incident-review joins here
  { id: "wreck-gear-recovery", name: "Wreck Gear Recovery", zone: "wreck-hollow", position: [690, 40],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-derelict-gear-recovery-dive", "br-workboat-crane-lift-from-water"] },
  { id: "wreck-cutting-station", name: "Wreck Cutting Station", zone: "wreck-hollow", position: [610, 10],
    programmes: ["bay-area-union-edition"], stations: ["mw-underwater-welding-and-cutting"] }, // cd-underwater-wet-welding-and-cutting joins here
  // Sand plain.
  { id: "sand-anchor-line", name: "Sand Plain Anchor Line", zone: "sand-plain", position: [-760, 380],
    programmes: ["bay-area-union-edition"], stations: ["mw-workboat-towing-and-line-handling"] },
  { id: "sand-intake-screen", name: "Intake Screen", zone: "sand-plain", position: [-700, 460],
    programmes: ["bay-area-union-edition", "bay-restoration-maritime-underwater"], stations: ["uw-intake-screen-cleaning-with-lockout", "br-fish-screen-maintenance"] },
  // Deep trench.
  { id: "trench-lip-station", name: "Trench Lip Station", zone: "deep-trench", position: [-170, 320],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-hyperbaric-chamber-standby"] }, // cd-decompression-chamber-operations-and-post-dive joins here
  { id: "trench-rov-launch", name: "Trench ROV Launch", zone: "deep-trench", position: [-120, 480],
    programmes: ["bay-area-union-edition"], stations: ["uw-rov-pre-dive-and-tether-management"] }, // cd-rov-launch-recovery-and-tether-management joins here
  // Seamount.
  { id: "seamount-pinnacle-survey", name: "Pinnacle Survey", zone: "seamount", position: [500, 430],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-marine-mammal-observer-during-pile-driving", "br-restoration-data-qa-and-public-reporting"] }, // me-invasive-species-identification-and-reporting joins here
  { id: "seamount-water-column", name: "Seamount Water Column", zone: "seamount", position: [560, 500],
    programmes: ["bay-restoration-maritime-underwater"], stations: ["br-water-quality-sonde-calibration-and-deploy"] }, // me-water-column-sampling-from-a-small-boat joins here
  // Tender anchorage.
  { id: "anchorage-mooring-blocks", name: "Anchorage Mooring Blocks", zone: "tender-anchorage", position: [840, 320],
    programmes: ["ports-maritime-ecology", "bay-area-union-edition"], stations: ["mooring-line", "mw-oil-transfer-watch-and-boom"] },
];

// ------------------------------------------------------------------ lines
//
// Dive lines in place of roads: one connected network (every line shares an
// exact endpoint with another, directly or transitively). A main guideline
// runs the length of the field; anchor lines rise at the sites it passes;
// transects branch to the survey grids; the channel line follows the dredged
// edge.

export const DEEP_LINES = [
  { id: "main-guideline", name: "Main Guideline", kind: "guideline", points: [[-820, -500], [-460, -500], [-100, -520], [200, -80], [640, -40], [500, 430]] },
  { id: "kelp-transect", name: "Kelp Transect", kind: "transect", points: [[-460, -500], [-750, -80], [-830, 40]] },
  { id: "reef-transect", name: "Reef Transect", kind: "transect", points: [[-100, -520], [-300, -100], [-360, -170]] },
  { id: "meadow-transect", name: "Meadow Transect", kind: "transect", points: [[-100, -520], [-160, -580], [-40, -500]] },
  { id: "marsh-channel-line", name: "Marsh Channel Line", kind: "channel", points: [[200, -80], [450, -560], [420, -600]] },
  { id: "outfall-line", name: "Outfall Line", kind: "guideline", points: [[450, -560], [800, -480]] },
  { id: "shipping-channel-edge", name: "Channel Edge", kind: "channel", points: [[-300, -100], [200, -80], [640, -40]] },
  { id: "sand-plain-line", name: "Sand Plain Line", kind: "guideline", points: [[-300, -100], [-750, 420]] },
  { id: "trench-line", name: "Trench Line", kind: "guideline", points: [[-300, -100], [-160, 300], [-120, 480]] },
  { id: "anchorage-line", name: "Anchorage Line", kind: "guideline", points: [[640, -40], [850, 300]] },
  { id: "pier-anchor-line", name: "Pier Anchor Line", kind: "anchor-line", points: [[-820, -500], [-850, -460]] },
  { id: "seamount-anchor-line", name: "Seamount Anchor Line", kind: "anchor-line", points: [[500, 430], [560, 500]] },
  { id: "trench-anchor-line", name: "Trench Anchor Line", kind: "anchor-line", points: [[-750, 420], [-700, 460]] },
];

export const DEEP_LINE_HALF_WIDTH = 6;

function dvDistToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az, l2 = abx * abx + abz * abz;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / l2)) : 0;
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
}

/** `{ onLine: true, id, heading }` when (x, z) is within DEEP_LINE_HALF_WIDTH
 *  of a dive line, else null. */
export function deepLineAt(x, z) {
  let best = null, bestD = DEEP_LINE_HALF_WIDTH;
  for (const line of DEEP_LINES) {
    for (let i = 1; i < line.points.length; i++) {
      const [ax, az] = line.points[i - 1], [bx, bz] = line.points[i];
      const d = dvDistToSegment(x, z, ax, az, bx, bz);
      if (d <= bestD) { bestD = d; best = { onLine: true, id: line.id, heading: Math.atan2(bx - ax, bz - az) }; }
    }
  }
  return best;
}

export const DEEP_MESH_BUDGET = { high: 2400, low: 110 };

/** A small deterministic PRNG (mulberry32), for the scatter the builder and
 *  the game both need to agree on. */
export function dvSeededRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
