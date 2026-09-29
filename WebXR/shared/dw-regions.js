// DEEPWATER — the Deep's Bay Program regions: the waters three of the 2026
// EPA San Francisco Bay Program projects drain to (project facts only from the
// wave's facts file — see docs/consoles/DEEPWATER.md), as three compact
// underwater regions of their own beside the Deep's main seabed
// (shared/underwater-data.js):
//
//   dw-san-pablo-shallows    — San Pablo Bay's shallows off the tidal marsh on
//                              the bay's northern shore (the Strip Marsh East
//                              project's frame): a soft mud bottom, tidal
//                              channel mouths, turbid water that clears on a
//                              flood tide — the sediment the marsh work reuses.
//   dw-san-leandro-bay       — San Leandro Bay at San Leandro Creek's mouth: a
//                              creek mouth and a storm-drain outfall where trash
//                              collects on the bottom — the reason the city's
//                              trash capture devices matter.
//   dw-oakland-middle-harbor — the Oakland Estuary and Middle Harbor off the
//                              port: wharf pilings, the estuary channel and a
//                              storm-drain outfall — the Clean Ports shoreline.
//
// FACTS RULE. Everything below the waterline here is procedural. No depth,
// visibility, current or water-quality figure is stated anywhere: the seabed
// field (dwDepthAtRegion) is a *schematic relative* 0..1 fraction (0 = the
// shore edge of this region's field, 1 = its deepest part), never metres, and
// visibility/current (dwConditionsAt) are schematic relative 0..1 ranges with
// words, driven by a schematic two-floods-two-ebbs-a-day tide clock that is
// not a tide table. Dive limits are "per the dive plan and the tables the
// supervisor holds", as everywhere in the Deep. The regions' frames name real
// water bodies and their general shape only (the shore drawn along the top
// edge of each local field); nothing claims survey accuracy.
//
// SEAMS (documented shapes; every name prefixed dw/DW_ — the bundler shares
// one scope):
//   dwRegions() -> DW_REGIONS; dwRegion(id) -> region | null
//   dwZoneAtRegion(id, x, z) -> zone (nearest centre; never null for a region)
//   dwDepthAtRegion(id, x, z) -> 0..1 schematic relative depth
//   dwTideAt(hours) -> { stage: "flood"|"high"|"ebb"|"low", phase 0..1, level -1..1, flow 0..1 }
//   dwConditionsAt(id, x, z, hours) -> { stage, visibility 0..1, current 0..1,
//        words: { stage, visibility, current }, call, schematic: true }
//   dwShoreEntriesFor(parishOrId) -> [{ id, region, parish, position:[x,z], label, url }]
//   dwDiveUrl(entry, { from, base }) -> "…/underwater/region.html?region=…&entry=…&from=…"
//   dwBuildRegion(THREE, parent, id, { tier, reducedMotion }) -> { group, meshCount,
//        fogFor(conditions) -> { color, density }, animate(t, conditions) }

/** Each region's local field, scene units (metres of scenery): 800 × 600. The
 *  shore runs along the top edge (z = minZ); the water deepens to the south. */
export const DW_FIELD = { minX: -400, maxX: 400, minZ: -300, maxZ: 300 };

/** Mesh budget for one region build ("high"), and the phone tier. */
export const DW_REGION_MESH_BUDGET = { high: 24, phone: 16 };

/** The schematic tide clock's period, hours: two floods and two ebbs a day. */
export const DW_TIDE_PERIOD_H = 12.4;

const DW_SITE_NOTE = "Depth, visibility and current here are schematic relative ranges, never measurements; the dive goes per the dive plan and the supervisor's call.";

/**
 * The three regions. Each: `{ id, name, water, frame:{ lat, lng, note },
 * project:{ recipient, what, source }, shore:{ kind, name }, clarity,
 * clearsOnFlood, currentScale, zones, landmarks, lines, sites, debris }`.
 * `frame` is an approximate centre for the region's local field (two
 * decimals, the water body's general location — never a survey point).
 * `project.what` quotes the facts file's "what it does" only.
 */
export const DW_REGIONS = [
  {
    id: "dw-san-pablo-shallows", name: "San Pablo Bay Shallows", water: "San Pablo Bay",
    frame: { lat: 38.1, lng: -122.4, note: "approximate — San Pablo Bay's northern shore along Highway 37; procedural seabed" },
    project: { recipient: "Association of Bay Area Governments (ABAG)", place: "Strip Marsh East, along Highway 37, San Pablo Bay",
      what: "habitat restoration by reusing sediment produced from excavating new tidal channels and lowering berms",
      source: "https://www.epa.gov/newsreleases/epa-awards-record-82-million-improve-water-quality-and-restore-habitat-across-san" },
    shore: { kind: "marsh", name: "the tidal marsh edge" },
    clarity: 0.18, clearsOnFlood: 0.5, currentScale: 0.8, palette: { water: 0x5a6a4a, fog: 0x6a6a4e },
    zones: [
      { id: "dw-sp-marsh-edge", name: "Marsh Edge Shallows", centre: [-150, -230], seabed: 0x6a5a3a, current: 0.4, turbid: 0.7,
        blurb: "The toe of the tidal marsh where the mud meets the marsh plants at the waterline — soft, silty and shallow." },
      { id: "dw-sp-channel-mouths", name: "Tidal Channel Mouths", centre: [220, -200], seabed: 0x5a4a32, current: 1, turbid: 0.9,
        blurb: "Where the marsh's tidal channels spill onto the bay: the current turns with the tide and the ebb carries a plume of fine sediment." },
      { id: "dw-sp-mud-flats", name: "Soft Mud Flats", centre: [-200, 60], seabed: 0x4a4436, current: 0.5, turbid: 0.8,
        blurb: "A wide soft mud bottom where a careless fin kick lifts a cloud that hangs; divers stay off the bottom and on the line." },
      { id: "dw-sp-open-shallows", name: "Open Bay Shallows", centre: [200, 160], seabed: 0x55503e, current: 0.7, turbid: 0.5,
        blurb: "The bay side of the flats, where flood water from the open bay arrives first and the water clears soonest." },
    ],
    landmarks: [
      { id: "dw-sp-channel-marker", name: "Channel Mouth Marker Post", zone: "dw-sp-channel-mouths", position: [230, -230], kind: "post",
        blurb: "A marker post at a channel mouth, the drift survey's start mark." },
      { id: "dw-sp-sediment-plume-line", name: "Sediment Plume Line", zone: "dw-sp-channel-mouths", position: [260, -150], kind: "buoy",
        blurb: "A buoyed line across the channel mouth where the survey team watches the ebb's sediment plume settle." },
      { id: "dw-sp-core-grid", name: "Sediment Core Grid", zone: "dw-sp-mud-flats", position: [-230, 40], kind: "grid",
        blurb: "A pegged grid on the mud where cores are taken in a set order, each peg flagged." },
      { id: "dw-sp-berm-toe", name: "Berm Toe", zone: "dw-sp-marsh-edge", position: [-120, -260], kind: "berm",
        blurb: "The underwater toe of a marsh berm, where lowering work on the shore sends sediment down the slope." },
      { id: "dw-sp-flood-gauge", name: "Flood Tide Staff", zone: "dw-sp-open-shallows", position: [180, 190], kind: "post",
        blurb: "A graduated staff the crew reads to see which way the tide is running before a dive." },
    ],
    lines: [
      { id: "dw-sp-shore-line", name: "Marsh Shore Line", kind: "guideline", points: [[-300, -250], [-150, -230], [220, -200], [330, -230]] },
      { id: "dw-sp-main-line", name: "Flats Guideline", kind: "guideline", points: [[-150, -230], [-200, 60], [200, 160]] },
      { id: "dw-sp-drift-line", name: "Channel Drift Transect", kind: "transect", points: [[220, -200], [230, -230], [260, -150]] },
      { id: "dw-sp-core-line", name: "Core Grid Transect", kind: "transect", points: [[-200, 60], [-230, 40], [-180, 90]] },
    ],
    sites: [
      { id: "dw-sp-sediment-core-site", name: "Sediment Core Site", zone: "dw-sp-mud-flats", position: [-180, 90],
        programmes: ["bay-restoration-maritime-underwater", "commercial-diving-and-scientific-scuba"],
        stations: ["br-underwater-sediment-core-sampling", "br-sediment-chain-of-custody-and-lab-prep", "br-benthic-grab-and-invertebrate-sorting", "cd-low-visibility-and-night-dive-line-work", "cd-scientific-scuba-buddy-check-and-lost-buddy-drill"] },
      { id: "dw-sp-channel-mouth-survey", name: "Channel Mouth Survey", zone: "dw-sp-channel-mouths", position: [250, -180],
        programmes: ["bay-restoration-maritime-underwater", "marine-ecology-and-restoration"],
        stations: ["me-tidal-marsh-channel-restoration-day", "br-turbidity-curtain-deployment", "br-water-quality-sonde-calibration-and-deploy", "br-dive-site-hazard-assessment-and-jsa"] },
      { id: "dw-sp-sediment-reuse-watch", name: "Sediment Reuse Watch", zone: "dw-sp-marsh-edge", position: [-170, -210],
        programmes: ["bay-restoration-maritime-underwater"],
        stations: ["br-tidal-marsh-grading-amphibious-excavator", "br-dredge-material-screening-and-disposal-decision", "br-cold-water-immersion-and-mob-recovery", "br-vhf-and-navigation-in-a-work-zone"] },
    ],
    debris: [],
  },
  {
    id: "dw-san-leandro-bay", name: "San Leandro Bay", water: "San Leandro Bay",
    frame: { lat: 37.74, lng: -122.21, note: "approximate — San Leandro Creek's mouth on San Leandro Bay; procedural seabed" },
    project: { recipient: "City of San Leandro", place: "San Leandro Creek, draining to San Leandro Bay",
      what: "two large trash capture devices in stormwater drains, to reduce trash and pollutants entering San Leandro Bay",
      source: "https://www.epa.gov/newsreleases/epa-awards-record-82-million-improve-water-quality-and-restore-habitat-across-san" },
    shore: { kind: "riprap", name: "the riprap shoreline" },
    clarity: 0.3, clearsOnFlood: 0.35, currentScale: 0.6, palette: { water: 0x3e5e56, fog: 0x4a5e52 },
    zones: [
      { id: "dw-sl-creek-mouth", name: "Creek Mouth", centre: [200, -210], seabed: 0x5a4e36, current: 0.9, turbid: 0.8,
        blurb: "Where San Leandro Creek meets the bay: fresher, murkier water on the ebb and a fan of settled silt." },
      { id: "dw-sl-outfall-apron", name: "Storm-Drain Outfall", centre: [-180, -200], seabed: 0x55554e, current: 0.6, turbid: 0.7,
        blurb: "A storm-drain outfall on a rock apron; what the drains carry off the streets ends up on the bottom here — bags, bottles, cans." },
      { id: "dw-sl-bay-shallows", name: "Bay Shallows", centre: [0, 80], seabed: 0x4e4a3e, current: 0.5, turbid: 0.5,
        blurb: "The open shallows of the bay, soft-bottomed, where the survey lines run out." },
      { id: "dw-sl-riprap-edge", name: "Riprap Edge", centre: [-280, 170], seabed: 0x5e5e58, current: 0.4, turbid: 0.4,
        blurb: "Broken rock armouring the shoreline, where snagged line and lost gear collect in the gaps." },
    ],
    landmarks: [
      { id: "dw-sl-outfall-mouth", name: "Outfall Mouth", zone: "dw-sl-outfall-apron", position: [-190, -250], kind: "pipe",
        blurb: "The mouth of the storm drain; the dive plan flags it and nobody works in front of it while it can flow." },
      { id: "dw-sl-trash-drift", name: "Trash Drift", zone: "dw-sl-outfall-apron", position: [-140, -170], kind: "debris",
        blurb: "Where trash from the drain settles in a drift on the bottom — what capture devices upstream are there to stop." },
      { id: "dw-sl-silt-fan", name: "Creek Silt Fan", zone: "dw-sl-creek-mouth", position: [230, -180], kind: "berm",
        blurb: "A fan of silt the creek drops where it slows, shifting with each storm." },
      { id: "dw-sl-sample-mooring", name: "Sampling Mooring", zone: "dw-sl-bay-shallows", position: [20, 60], kind: "buoy",
        blurb: "A weighted mooring where the water-sampling team clips on, serviced on the crew's schedule." },
      { id: "dw-sl-lost-gear", name: "Lost Gear Snag", zone: "dw-sl-riprap-edge", position: [-300, 190], kind: "debris",
        blurb: "A tangle of lost line and a crab pot wedged in the rock — a recovery job, not a souvenir." },
    ],
    lines: [
      { id: "dw-sl-shore-line", name: "Shore Guideline", kind: "guideline", points: [[-330, -240], [-180, -200], [200, -210], [320, -240]] },
      { id: "dw-sl-main-line", name: "Bay Guideline", kind: "guideline", points: [[-180, -200], [0, 80], [-280, 170]] },
      { id: "dw-sl-debris-transect", name: "Outfall Debris Transect", kind: "transect", points: [[-180, -200], [-190, -250], [-140, -170]] },
      { id: "dw-sl-creek-transect", name: "Creek Mouth Transect", kind: "transect", points: [[200, -210], [230, -180], [0, 80]] },
    ],
    sites: [
      { id: "dw-sl-outfall-debris-survey", name: "Outfall Debris Survey", zone: "dw-sl-outfall-apron", position: [-160, -215],
        programmes: ["bay-restoration-maritime-underwater", "commercial-diving-and-scientific-scuba"],
        stations: ["br-underwater-debris-survey-and-mapping", "br-trash-capture-device-service", "cd-low-visibility-and-night-dive-line-work", "br-shoreline-cleanup-sharps-and-hazardous-debris"] },
      { id: "dw-sl-creek-mouth-sampling", name: "Creek Mouth Sampling", zone: "dw-sl-creek-mouth", position: [180, -190],
        programmes: ["marine-ecology-and-restoration", "bay-restoration-maritime-underwater", "commercial-diving-and-scientific-scuba"],
        stations: ["me-water-column-sampling-from-a-small-boat", "br-water-quality-sonde-calibration-and-deploy", "br-benthic-grab-and-invertebrate-sorting", "cd-scientific-scuba-buddy-check-and-lost-buddy-drill"] },
      { id: "dw-sl-derelict-gear-recovery", name: "Derelict Gear Recovery", zone: "dw-sl-riprap-edge", position: [-260, 150],
        programmes: ["bay-restoration-maritime-underwater", "commercial-diving-and-scientific-scuba"],
        stations: ["br-derelict-gear-recovery-dive", "br-surface-supplied-dive-station-setup", "br-dive-tender-and-umbilical-management", "cd-hydraulic-tools-and-suction-hazards-underwater"] },
    ],
    debris: [{ zone: "dw-sl-outfall-apron", centre: [-160, -200], spread: 60, count: 40 }, { zone: "dw-sl-riprap-edge", centre: [-290, 180], spread: 30, count: 10 }],
  },
  {
    id: "dw-oakland-middle-harbor", name: "Oakland Estuary and Middle Harbor", water: "the Middle Harbor and the Oakland Estuary",
    frame: { lat: 37.8, lng: -122.32, note: "approximate — the Middle Harbor off the Port of Oakland's terminals; procedural seabed" },
    project: { recipient: "Port of Oakland", place: "Port of Oakland",
      what: "four large trash capture devices collecting stormwater from 427 acres of port property, reducing more than 4,700 gallons of trash from entering San Francisco Bay",
      source: "https://www.epa.gov/newsreleases/epa-awards-record-82-million-improve-water-quality-and-restore-habitat-across-san" },
    shore: { kind: "bulkhead", name: "the Middle Harbor bulkhead" },
    clarity: 0.4, clearsOnFlood: 0.3, currentScale: 1, palette: { water: 0x2e5258, fog: 0x3a5a5e },
    zones: [
      { id: "dw-oh-wharf-pilings", name: "Wharf Pilings", centre: [-200, -220], seabed: 0x4e524a, current: 0.4, turbid: 0.5,
        blurb: "Rows of piles under the wharf deck, furred with growth, dim between the shadows of the deck above." },
      { id: "dw-oh-port-outfall", name: "Port Storm-Drain Outfall", centre: [200, -210], seabed: 0x55534c, current: 0.6, turbid: 0.6,
        blurb: "A storm-drain outfall from the terminals' paved yards — the kind of flow the port's trash capture devices treat before it reaches the bay." },
      { id: "dw-oh-middle-harbor", name: "Middle Harbor Shallows", centre: [-150, 90], seabed: 0x4c4a40, current: 0.3, turbid: 0.4,
        blurb: "The sheltered harbor basin, soft-bottomed and calmer than the estuary beside it." },
      { id: "dw-oh-estuary-channel", name: "Estuary Channel Edge", centre: [220, 180], seabed: 0x3e4648, current: 1, turbid: 0.5,
        blurb: "The edge of the estuary's working channel; closed to diving whenever vessel traffic moves, per the dive plan." },
    ],
    landmarks: [
      { id: "dw-oh-piling-rows", name: "Piling Rows", zone: "dw-oh-wharf-pilings", position: [-220, -250], kind: "pilings",
        blurb: "The wharf's piles in rows, each one a job on the inspection sheet." },
      { id: "dw-oh-outfall-mouth", name: "Port Outfall Mouth", zone: "dw-oh-port-outfall", position: [210, -250], kind: "pipe",
        blurb: "The outfall's mouth under the bulkhead, flagged on the dive plan." },
      { id: "dw-oh-debris-drift", name: "Harbor Debris Drift", zone: "dw-oh-port-outfall", position: [170, -170], kind: "debris",
        blurb: "Litter settled below the outfall — bags and bottles the survey maps before recovery." },
      { id: "dw-oh-rov-cage", name: "ROV Launch Point", zone: "dw-oh-middle-harbor", position: [-120, 60], kind: "buoy",
        blurb: "The buoyed point where the ROV crew lands the vehicle and manages the tether." },
      { id: "dw-oh-channel-buoy", name: "Channel Edge Buoy Chain", zone: "dw-oh-estuary-channel", position: [240, 200], kind: "buoy",
        blurb: "The mooring chain of a channel-edge buoy — the line a diver does not cross." },
    ],
    lines: [
      { id: "dw-oh-bulkhead-line", name: "Bulkhead Guideline", kind: "guideline", points: [[-330, -240], [-200, -220], [200, -210], [330, -240]] },
      { id: "dw-oh-main-line", name: "Harbor Guideline", kind: "guideline", points: [[-200, -220], [-150, 90], [220, 180]] },
      { id: "dw-oh-piling-line", name: "Piling Inspection Line", kind: "transect", points: [[-200, -220], [-220, -250], [-170, -250]] },
      { id: "dw-oh-outfall-line", name: "Outfall Debris Transect", kind: "transect", points: [[200, -210], [210, -250], [170, -170]] },
    ],
    sites: [
      { id: "dw-oh-wharf-piling-inspection", name: "Wharf Piling Inspection", zone: "dw-oh-wharf-pilings", position: [-180, -240],
        programmes: ["commercial-diving-and-scientific-scuba", "bay-restoration-maritime-underwater"],
        stations: ["cd-pier-piling-inspection-and-wrap-repair", "cd-underwater-wet-welding-and-cutting", "mw-pier-pile-inspection-dive", "br-surface-supplied-dive-station-setup"] },
      { id: "dw-oh-outfall-debris-watch", name: "Outfall Debris Watch", zone: "dw-oh-port-outfall", position: [180, -200],
        programmes: ["bay-restoration-maritime-underwater", "commercial-diving-and-scientific-scuba"],
        stations: ["br-trash-capture-device-service", "br-underwater-debris-survey-and-mapping", "cd-hydraulic-tools-and-suction-hazards-underwater", "br-vhf-and-navigation-in-a-work-zone"] },
      { id: "dw-oh-harbor-rov-survey", name: "Harbor ROV Survey", zone: "dw-oh-middle-harbor", position: [-130, 100],
        programmes: ["commercial-diving-and-scientific-scuba", "bay-restoration-maritime-underwater"],
        stations: ["cd-rov-launch-recovery-and-tether-management", "cd-decompression-chamber-operations-and-post-dive", "cd-dive-records-and-incident-review", "br-hyperbaric-chamber-standby"] },
    ],
    debris: [{ zone: "dw-oh-port-outfall", centre: [185, -195], spread: 50, count: 30 }],
    pilings: { from: [-320, -270], to: [-80, -200], rows: 3, cols: 10 },
  },
];

/**
 * Shoreline entries: where a parish-engine map's shore opens the Deep at a
 * region. `parish` is a map id that may not be in this tree (TIDELANDS'
 * `bp-*`, BAYMAP's `oak-west-oakland`) — every lookup is guarded. `position`
 * is local map metres when known; otherwise `waterIds` names the map's water
 * polygon(s) to stand the entry on (the vertex nearest the map's centre).
 */
export const DW_SHORE_ENTRIES = [
  { id: "dw-entry-strip-marsh-east", parish: "bp-strip-marsh-east", region: "dw-san-pablo-shallows", site: "dw-sp-channel-mouth-survey",
    label: "Dive entry — San Pablo Bay shallows", waterIds: ["san-pablo-bay"], position: null },
  { id: "dw-entry-san-leandro-bay", parish: "bp-san-leandro-bay", region: "dw-san-leandro-bay", site: "dw-sl-outfall-debris-survey",
    label: "Dive entry — San Leandro Bay", waterIds: ["san-leandro-bay", "san-leandro-creek"], position: null },
  { id: "dw-entry-middle-harbor", parish: "oak-west-oakland", region: "dw-oakland-middle-harbor", site: "dw-oh-wharf-piling-inspection",
    label: "Dive entry — Middle Harbor", waterIds: ["middle-harbor"], near: "middle-harbor-shoreline-park", position: [-335, 494] },
];

// ------------------------------------------------------------------ lookups

export function dwRegions() { return DW_REGIONS; }
export function dwRegion(id) { return DW_REGIONS.find((r) => r.id === id) ?? null; }
export function dwSite(siteId) {
  for (const r of DW_REGIONS) { const s = r.sites.find((x) => x.id === siteId); if (s) return { region: r, site: s }; }
  return null;
}
/** `?region=<id>` (and optional `entry`, `from`, `site`) from a search string. */
export function dwRegionFromSearch(search) {
  let p = null;
  try { p = new URLSearchParams(search || ""); } catch { return null; }
  const region = dwRegion(p.get("region"));
  if (!region) return null;
  const entry = DW_SHORE_ENTRIES.find((e) => e.id === p.get("entry")) ?? null;
  const site = region.sites.find((s) => s.id === (p.get("site") ?? entry?.site)) ?? region.sites[0];
  return { region, entry, site, from: p.get("from") || null };
}

function dwDist(ax, az, bx, bz) { return Math.hypot(bx - ax, bz - az); }
function dwClamp01(v) { return Math.max(0, Math.min(1, v)); }
function dwSmooth(t) { const c = dwClamp01(t); return c * c * (3 - 2 * c); }

/** The region's zone nearest (x, z) — zones tile the local field by nearest centre. */
export function dwZoneAtRegion(id, x, z) {
  const r = dwRegion(id);
  if (!r) return null;
  let best = r.zones[0], bd = Infinity;
  for (const zone of r.zones) { const d = dwDist(x, z, zone.centre[0], zone.centre[1]); if (d < bd) { bd = d; best = zone; } }
  return best;
}

/**
 * Schematic relative depth 0..1 at (x, z) in a region's local field: 0 at the
 * shore edge, deepening southward, with a shallow bar at channel/creek mouths
 * and a deeper trough along the Oakland channel edge. Not metres — a scenery
 * and gameplay field only, never shown to a learner as a figure.
 */
export function dwDepthAtRegion(id, x, z) {
  const r = dwRegion(id);
  if (!r) return 0;
  const t = dwClamp01((z - DW_FIELD.minZ) / (DW_FIELD.maxZ - DW_FIELD.minZ));
  let d = 0.08 + 0.62 * dwSmooth(t);
  const mouth = r.zones.find((q) => q.id.endsWith("channel-mouths") || q.id.endsWith("creek-mouth"));
  if (mouth) d -= 0.08 * dwSmooth(1 - dwDist(x, z, mouth.centre[0], mouth.centre[1]) / 120);
  const channel = r.zones.find((q) => q.id.endsWith("estuary-channel"));
  if (channel) d += 0.25 * dwSmooth(1 - dwDist(x, z, channel.centre[0], channel.centre[1]) / 220);
  d += 0.02 * Math.sin(x * 0.03 + 0.4) * Math.cos(z * 0.025);
  return Math.max(0.02, Math.min(1, d));
}

/**
 * The schematic tide at `hours` (any real number): a sine over
 * DW_TIDE_PERIOD_H, rising = flood, falling = ebb, and a slack stage near the
 * top ("high") and bottom ("low"). `flow` (0..1) is how hard it runs. Not a
 * tide table — a teaching clock for "check which way the tide is running".
 */
export function dwTideAt(hours) {
  const h = Number(hours) || 0;
  const phase = (((h / DW_TIDE_PERIOD_H) % 1) + 1) % 1;
  const level = Math.sin(2 * Math.PI * phase);
  const rate = Math.cos(2 * Math.PI * phase);
  const flow = Math.abs(rate);
  const stage = flow < 0.3 ? (level > 0 ? "high" : "low") : rate > 0 ? "flood" : "ebb";
  return { stage, phase, level, flow };
}

const DW_STAGE_WORDS = { flood: "flood tide (rising)", high: "high slack", ebb: "ebb tide (falling)", low: "low slack" };

/**
 * Visibility and current at (x, z) in region `id` at `hours`: schematic
 * relative 0..1 ranges (relative to this region, never a figure), with words
 * and the dive call a supervisor would make in words. A flood brings clearer
 * bay water in (most in San Pablo's shallows: `clearsOnFlood`); an ebb carries
 * the marsh's and the creek's sediment out, murkiest in turbid zones.
 */
export function dwConditionsAt(id, x, z, hours) {
  const r = dwRegion(id);
  if (!r) return null;
  const zone = dwZoneAtRegion(id, x, z);
  const tide = dwTideAt(hours);
  const flood = tide.stage === "flood" ? tide.flow : tide.stage === "high" ? 0.5 : 0;
  const ebb = tide.stage === "ebb" ? tide.flow : tide.stage === "low" ? 0.3 : 0;
  const visibility = dwClamp01(r.clarity * (1 - 0.4 * zone.turbid) + r.clearsOnFlood * flood - 0.25 * zone.turbid * ebb + 0.1);
  const current = dwClamp01(tide.flow * zone.current * r.currentScale);
  const vw = visibility < 0.3 ? "poor" : visibility < 0.55 ? "fair" : "good";
  const cw = current < 0.2 ? "slack" : current < 0.45 ? "light" : current < 0.7 ? "moderate" : "strong";
  const call = cw === "strong" ? "Hold at the surface: the tide is running hard here — wait for the turn, per the dive plan."
    : vw === "poor" ? "Line work only: stay on the guideline with your buddy, per the dive plan."
    : "Workable: brief the dive, check the tide, keep to the plan.";
  return { stage: tide.stage, visibility, current, zone: zone.id,
    words: { stage: DW_STAGE_WORDS[tide.stage], visibility: vw, current: cw }, call, note: DW_SITE_NOTE, schematic: true };
}

// ---------------------------------------------------------- shoreline entries

/** Stand an entry on the parish map: its `position`, else the vertex of the
 *  named water polygon nearest the map's centre, else null. Guarded against a
 *  parish (or a water list) that is missing. */
export function dwResolveEntryPosition(entry, parish) {
  if (entry.position) return entry.position;
  const waters = (parish?.water ?? []).filter((w) => entry.waterIds?.includes(w?.id));
  let best = null, bd = Infinity;
  for (const w of waters) for (const p of w.poly ?? w.pts ?? []) {
    const d = Math.hypot(p[0], p[1]);
    if (d < bd) { bd = d; best = [p[0], p[1]]; }
  }
  return best;
}

/** The URL that opens the Deep at an entry's region (and site), with a way back. */
export function dwDiveUrl(entry, { from = null, base = "../underwater/region.html" } = {}) {
  const q = new URLSearchParams({ region: entry.region, entry: entry.id });
  if (entry.site) q.set("site", entry.site);
  if (from) q.set("from", from);
  return `${base}?${q.toString()}`;
}

/**
 * The shoreline entries on a parish map (by id or the parish object), each
 * `{ id, region, parish, position, label, url }` — an entry whose map is not
 * in the tree, or that cannot be stood on the map, is left out.
 */
export function dwShoreEntriesFor(parishOrId, { from = null, base } = {}) {
  const id = typeof parishOrId === "string" ? parishOrId : parishOrId?.id;
  if (!id) return [];
  const parish = typeof parishOrId === "object" ? parishOrId : null;
  const out = [];
  for (const e of DW_SHORE_ENTRIES) {
    if (e.parish !== id) continue;
    const position = dwResolveEntryPosition(e, parish);
    if (!position) continue;
    out.push({ id: e.id, region: e.region, parish: id, site: e.site, position, label: e.label,
      url: dwDiveUrl(e, { from: from ?? `../parishes/parishes.html?parish=${encodeURIComponent(id)}`, base }) });
  }
  return out;
}

// ------------------------------------------------------------------- builder

function dwRng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function dwHash(str) { let h = 2166136261; for (const c of String(str)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

/** Scene drop, scene units, for depth fraction 1 — scenery scale only. */
const DW_SCENE_DROP = 24;

/** Seabed y (scene units) at (x, z) in a region: the surface is y = 0. */
export function dwFloorY(id, x, z) { return -2 - DW_SCENE_DROP * dwDepthAtRegion(id, x, z); }

/**
 * Build a region's seabed into `parent`: one displaced seabed mesh with zone
 * colours, a water surface, the shore strip, instanced landmarks by kind,
 * instanced site buoys, merged guide lines, instanced debris and pilings where
 * the region has them, eelgrass/marsh stems and a particulate cloud whose
 * opacity follows visibility. Everything instanced or merged; the phone tier
 * halves the counts and drops the stems. `THREE` is passed in so this module
 * imports nothing.
 */
export function dwBuildRegion(THREE, parent, id, { tier = "high", reducedMotion = false } = {}) {
  const r = dwRegion(id);
  if (!r) throw new Error(`dwBuildRegion: unknown region ${id}`);
  const phone = tier === "phone" || tier === "low";
  const rng = dwRng(dwHash(id));
  const group = new THREE.Group();
  group.name = `dw-region:${id}`;
  const W = DW_FIELD.maxX - DW_FIELD.minX, D = DW_FIELD.maxZ - DW_FIELD.minZ;

  // seabed
  const segX = phone ? 40 : 80, segZ = phone ? 30 : 60;
  const geo = new THREE.PlaneGeometry(W, D, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array((pos.count ?? 0) * 3);
  const col = new THREE.Color();
  for (let i = 0; i < (pos.count ?? 0); i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i, dwFloorY(id, x, z));
    col.setHex(dwZoneAtRegion(id, x, z).seabed);
    const k = 0.9 + 0.2 * rng();
    colors[i * 3] = col.r * k; colors[i * 3 + 1] = col.g * k; colors[i * 3 + 2] = col.b * k;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals?.();
  const seabed = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
  seabed.name = "dw-seabed";
  group.add(seabed);

  // water surface (seen from below)
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ color: r.palette.water, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  surf.rotation.x = -Math.PI / 2; surf.position.y = 0; surf.name = "dw-surface";
  group.add(surf);

  // shore strip along the top edge
  const shoreColor = r.shore.kind === "marsh" ? 0x5a7a3a : r.shore.kind === "riprap" ? 0x6a6a64 : 0x8a8a84;
  const shore = new THREE.Mesh(new THREE.BoxGeometry(W, 6, 24), new THREE.MeshStandardMaterial({ color: shoreColor }));
  shore.position.set(0, 1, DW_FIELD.minZ - 8); shore.name = `dw-shore:${r.shore.kind}`;
  group.add(shore);

  // instanced helper
  const inst = (name, geom, color, items) => {
    if (!items.length) return null;
    const m = new THREE.InstancedMesh(geom, new THREE.MeshStandardMaterial({ color }), items.length);
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(it[0], it[1], it[2]); o.rotation.set(0, it[3] ?? 0, it[5] ?? 0); o.scale.setScalar(it[4] ?? 1);
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    });
    m.name = name; group.add(m); return m;
  };

  // landmarks by kind
  const KIND = {
    post: [() => new THREE.CylinderGeometry(0.3, 0.3, 8, 6), 0xd8c070, 4],
    buoy: [() => new THREE.SphereGeometry(1.2, 8, 6), 0xf07a1f, 1.5],
    grid: [() => new THREE.BoxGeometry(12, 0.3, 12), 0xf2c14b, 0.2],
    berm: [() => new THREE.SphereGeometry(10, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), 0x6a5a3a, 0],
    pipe: [() => new THREE.CylinderGeometry(2, 2, 14, 10), 0x7a7a74, 1],
    debris: [() => new THREE.BoxGeometry(3, 1, 3), 0x8a6a4a, 0.5],
    pilings: [() => new THREE.CylinderGeometry(0.6, 0.6, 30, 6), 0x5a4a3a, 14],
  };
  const byKind = {};
  for (const l of r.landmarks) (byKind[l.kind] ??= []).push(l);
  for (const [kind, ls] of Object.entries(byKind)) {
    const [mk, color, lift] = KIND[kind] ?? KIND.post;
    inst(`dw-landmarks:${kind}`, mk(), color, ls.map((l) => [l.position[0], dwFloorY(id, l.position[0], l.position[1]) + lift, l.position[1], 0, 1, kind === "pipe" ? Math.PI / 2 : 0]));
  }

  // site buoys (floating) and site plates (on the bottom)
  inst("dw-site-buoys", new THREE.CylinderGeometry(1.4, 1.4, 2, 10), 0xffd23f, r.sites.map((s) => [s.position[0], 0.6, s.position[1]]));
  inst("dw-site-plates", new THREE.CylinderGeometry(4, 4, 0.4, 12), 0x4fd1ff, r.sites.map((s) => [s.position[0], dwFloorY(id, s.position[0], s.position[1]) + 0.3, s.position[1]]));

  // merged guide lines
  const lp = [];
  for (const line of r.lines) for (let i = 1; i < line.points.length; i++) {
    const [ax, az] = line.points[i - 1], [bx, bz] = line.points[i];
    lp.push(ax, dwFloorY(id, ax, az) + 0.6, az, bx, dwFloorY(id, bx, bz) + 0.6, bz);
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lp), 3));
  const lines = new (THREE.LineSegments ?? THREE.Line)(lg, new THREE.LineBasicMaterial({ color: 0xf2f2e0 }));
  lines.name = "dw-lines"; group.add(lines);

  // debris drifts (trash on the bottom below outfalls)
  const deb = [];
  for (const d of r.debris ?? []) {
    const n = phone ? Math.ceil(d.count / 2) : d.count;
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2, rr = d.spread * Math.sqrt(rng());
      const x = d.centre[0] + Math.cos(a) * rr, z = d.centre[1] + Math.sin(a) * rr;
      deb.push([x, dwFloorY(id, x, z) + 0.3, z, rng() * Math.PI, 0.6 + rng() * 0.8]);
    }
  }
  inst("dw-debris", new THREE.BoxGeometry(1, 0.5, 0.7), 0xb0a080, deb);

  // wharf pilings (Oakland)
  if (r.pilings) {
    const p = [], { from, to, rows, cols } = r.pilings;
    for (let i = 0; i < rows; i++) for (let j = 0; j < (phone ? Math.ceil(cols / 2) : cols); j++) {
      const x = from[0] + (to[0] - from[0]) * (j / Math.max(1, cols - 1)) * (phone ? 2 : 1);
      const z = from[1] + (to[1] - from[1]) * (i / Math.max(1, rows - 1));
      p.push([x, dwFloorY(id, x, z) + 15, z]);
    }
    inst("dw-pilings", new THREE.CylinderGeometry(0.7, 0.7, 34, 6), 0x5a4a3a, p);
  }

  // marsh/eelgrass stems along the shallow edge
  if (!phone) {
    const st = [];
    for (let i = 0; i < 160; i++) {
      const x = DW_FIELD.minX + rng() * W, z = DW_FIELD.minZ + rng() * 90;
      st.push([x, dwFloorY(id, x, z) + 1.2, z, rng() * Math.PI, 0.8 + rng() * 0.6]);
    }
    inst("dw-stems", new THREE.BoxGeometry(0.15, 2.4, 0.15), r.shore.kind === "marsh" ? 0x6a8a3a : 0x4a7a4a, st);
  }

  // particulate (turbidity) — opacity follows visibility
  const pc = phone ? 300 : 900, pp = new Float32Array(pc * 3);
  for (let i = 0; i < pc; i++) { pp[i * 3] = DW_FIELD.minX + rng() * W; pp[i * 3 + 1] = -1 - rng() * DW_SCENE_DROP; pp[i * 3 + 2] = DW_FIELD.minZ + rng() * D; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  const pmat = new THREE.PointsMaterial({ color: r.palette.fog, size: 0.5, transparent: true, opacity: 0.5 });
  const particles = new THREE.Points(pg, pmat); particles.name = "dw-particulate"; group.add(particles);

  parent.add(group);
  let meshCount = 0;
  group.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) meshCount += 1; });
  const fogColor = new THREE.Color(r.palette.fog);
  return {
    group, meshCount, region: r,
    /** Fog for the conditions: poorer visibility, denser fog (scenery only). */
    fogFor(c) { return { color: fogColor, density: 0.006 + 0.05 * (1 - (c?.visibility ?? 0.5)) }; },
    animate(t, c) {
      pmat.opacity = 0.15 + 0.6 * (1 - (c?.visibility ?? 0.5));
      if (!reducedMotion) particles.position.x = Math.sin(t * 0.1) * 4 * (0.3 + (c?.current ?? 0));
    },
  };
}
