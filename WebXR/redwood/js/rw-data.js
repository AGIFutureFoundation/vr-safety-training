// Redwood Reach — the pure ground truth for the forest world: the terrain
// field, the river, the fire roads, the work sites, the quest arc, the field
// lessons and the scored activities. No three.js, no DOM, no storage: a game,
// a map, a generator (tools/gen_redwood.mjs) or a headless checker
// (tools/check_redwood.mjs) can import it as-is.
//
// Facts rule (tools/briefs/frontier-brief.md): every place here is a plain,
// generic name — no real forest, park, company, agency or address — and no
// fact about a real place is asserted. Tree heights, slopes and distances in
// this file are scenery and gameplay only; a limit a learner would act on
// always reads "per the plan / permit / label". Fire content teaches
// prevention, preparedness and safe procedure; nothing depicts harm.
//
// Every top-level name is prefixed rw…/RW_… because tools/bundle_webxr.py
// concatenates every module into one scope.

// ------------------------------------------------------------------ geometry
//
// One square field, x and z in [-2048, 2048] — 4096 m on a side in scene
// units (metres). North is -z. The Pacific-style coast runs along the south
// edge; the river rises in the north-east highlands, winds south-west through
// a broad valley and meets the sea at an estuary in the south-west. The field
// is cut into RW_CHUNKS × RW_CHUNKS square chunks of RW_CHUNK metres; the game
// streams the ring of chunks around the player and draws a coarse horizon mesh
// for the rest.

export const RW_BOUNDS = Object.freeze({ minX: -2048, maxX: 2048, minZ: -2048, maxZ: 2048 });
export const RW_SIZE = RW_BOUNDS.maxX - RW_BOUNDS.minX;
export const RW_CHUNK = 256;
export const RW_CHUNKS = RW_SIZE / RW_CHUNK; // 16 × 16 = 256 chunks

/**
 * The per-tier streaming and instancing budget (tools/check_redwood.mjs holds
 * the builder to it). `radius` is the chunk ring kept around the player
 * (radius 2 is a 5 × 5 block), `segments` the terrain grid per chunk side,
 * `trees` the instance cap per chunk across the three tree kinds, `fog` the
 * far fog distance the ring must cover.
 */
export const RW_BUDGET = Object.freeze({
  low: { radius: 2, segments: 16, trees: 70, fog: 520, horizon: 48 },
  balanced: { radius: 2, segments: 24, trees: 120, fog: 620, horizon: 64 },
  high: { radius: 3, segments: 32, trees: 170, fog: 860, horizon: 96 },
});

/** The coastline: the sea begins south of this z for a given x. */
export function rwCoastZ(x) { return 1720 + 90 * Math.sin(x / 310) + 60 * Math.sin(x / 97 + 1.3); }

/** The river's centre line, source (north-east) to mouth (south-west). */
export const RW_RIVER = Object.freeze([
  [1780, -1900], [1560, -1560], [1380, -1260], [1080, -1020], [820, -760], [640, -420],
  [560, -120], [380, 160], [120, 380], [-120, 560], [-300, 820], [-420, 1080],
  [-640, 1320], [-860, 1540], [-980, 1760], [-1040, 2000],
]);

/** The seeded 2D value noise the whole field is built from. */
function rwHash(ix, iz) {
  let h = (ix * 374761393 + iz * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function rwSmooth(t) { return t * t * (3 - 2 * t); }
export function rwNoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = rwSmooth(x - ix), fz = rwSmooth(z - iz);
  const a = rwHash(ix, iz), b = rwHash(ix + 1, iz), c = rwHash(ix, iz + 1), d = rwHash(ix + 1, iz + 1);
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}
function rwFbm(x, z, oct = 5) {
  let s = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < oct; i += 1) { s += amp * rwNoise(x * f + i * 17.3, z * f - i * 9.1); norm += amp; amp *= 0.5; f *= 2.03; }
  return s / norm;
}
function rwRidge(x, z) {
  let s = 0, amp = 0.55, f = 1;
  for (let i = 0; i < 4; i += 1) { const n = 1 - Math.abs(rwNoise(x * f + 41, z * f + 7) * 2 - 1); s += amp * n * n; amp *= 0.5; f *= 2.1; }
  return s;
}
function rwStep(a, b, v) { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); }

/** Nearest point on the river: { d, t } — distance and the 0..1 parameter from source to mouth. */
const RW_RIVER_LEN = (() => { let L = 0; for (let i = 1; i < RW_RIVER.length; i += 1) L += Math.hypot(RW_RIVER[i][0] - RW_RIVER[i - 1][0], RW_RIVER[i][1] - RW_RIVER[i - 1][1]); return L; })();
export function rwRiverNearest(x, z) {
  let best = Infinity, bestT = 0, run = 0;
  for (let i = 1; i < RW_RIVER.length; i += 1) {
    const [ax, az] = RW_RIVER[i - 1], [bx, bz] = RW_RIVER[i];
    const vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz, L = Math.sqrt(L2);
    const u = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2));
    const d = Math.hypot(x - (ax + u * vx), z - (az + u * vz));
    if (d < best) { best = d; bestT = (run + u * L) / RW_RIVER_LEN; }
    run += L;
  }
  return { d: best, t: bestT };
}
/** The river's water surface height at parameter t (source 0 → mouth 1). */
export function rwRiverY(t) { return 1.2 + 96 * Math.pow(1 - t, 1.6); }
/** The river's half-width at parameter t — a creek at the source, wide at the estuary. */
export function rwRiverHalfWidth(t) { return 7 + 38 * t * t; }

/** The land before sites and river are cut in: hills, ridges, the coast. */
function rwBaseHeight(x, z) {
  const hills = rwFbm(x / 820, z / 820);
  const ridge = rwRidge(x / 1500, z / 1500);
  const north = rwStep(1900, -1500, z); // 0 on the coast, 1 in the north
  const east = rwStep(-2000, 1800, x) * 0.5 + 0.5;
  let h = 24 + 190 * hills * (0.45 + 0.55 * north) + 230 * ridge * north * east;
  const coast = rwCoastZ(x);
  h *= rwStep(coast + 30, coast - 520, z);
  h -= 9 * rwStep(coast - 40, coast + 120, z);
  return h;
}

/** Scenery ground height at (x, z): the base land with the valley and site pads cut in. */
export function rwHeightAt(x, z) {
  let h = rwBaseHeight(x, z);
  // The lookout's summit: a knob on the ridge that sees the whole valley.
  const lk = RW_SITE_BY_ID.lookout.position;
  const dl = Math.hypot(x - lk[0], z - lk[1]);
  h += 120 * Math.exp(-(dl * dl) / (2 * 260 * 260));
  // The river valley: a broad bowl down to the channel, then the bed.
  const { d, t } = rwRiverNearest(x, z);
  const y = rwRiverY(t), w = rwRiverHalfWidth(t);
  const valley = rwStep(w + 20, w + 560, d);
  h = (y + 3.5) + (h - (y + 3.5)) * valley;
  if (d < w + 20) h = Math.min(h, y - 2.2 + 5.7 * rwStep(w - 4, w + 20, d));
  // Site pads: level ground for each yard, blended into the slope.
  for (const s of RW_SITES) {
    const ds = Math.hypot(x - s.position[0], z - s.position[1]);
    if (ds < s.pad + 70) h = s.padY + (h - s.padY) * rwStep(s.pad, s.pad + 70, ds);
  }
  return h;
}

/** True when (x, z) is in the river channel or the sea. */
export function rwIsWater(x, z) {
  if (z > rwCoastZ(x) + 20) return true;
  const { d, t } = rwRiverNearest(x, z);
  return d < rwRiverHalfWidth(t);
}

// --------------------------------------------------------------------- sites
//
// Eleven work sites. `stations` are existing catalog stations whose trade
// genuinely works at a place like this (tools/check_redwood.mjs resolves every
// id against WebXR/smartcity/catalog.json); `pad` is the level yard radius.
// `padY` is filled in below from the base land, so a pad sits on its hillside.

export const RW_SITES = [
  { id: "fire-station", name: "Wildland Fire Station", kind: "fire-station", position: [320, 560], pad: 70, trade: "Wildland fire",
    blurb: "The engine bay, the hose racks and the ready board: where the crew stages, briefs and checks every tool before the season's first call.",
    stations: ["or-wildland-fireline-construction-and-lookout", "wildland-urban-interface", "firefighter-rehab-sector"] },
  { id: "lookout", name: "Ridge Fire Lookout", kind: "lookout", position: [1240, -980], pad: 36, trade: "Wildland fire",
    blurb: "A glass cab on steel legs at the top of the ridge, with a view down the whole valley and a logbook for every smoke report.",
    stations: ["or-wildland-fireline-construction-and-lookout", "br-drone-shoreline-survey"] },
  { id: "sawmill", name: "Valley Sawmill & Log Yard", kind: "sawmill", position: [-220, 1200], pad: 100, trade: "Sawmill millwrights and operators",
    blurb: "Log decks, a debarker line, the main mill shed and a loader working the yard — every guard and every lockout point marked.",
    stations: ["conveyor-guard", "tw-conveyor-jam-clearing-and-loto", "op-loader-truck-loading-and-blind-spots", "forklift-dock"] },
  { id: "restoration", name: "Watershed Restoration Reach", kind: "restoration", position: [680, 40], pad: 40, trade: "Watershed restoration",
    blurb: "A reach of river being put back together: log structures keyed into the bank, a culvert being opened for fish, and fresh planting on the slope.",
    stations: ["br-culvert-retrofit-for-fish-passage", "br-native-planting-and-erosion-mats", "br-fish-screen-maintenance", "br-bird-nesting-buffer-and-work-window"] },
  { id: "campground", name: "Fern Hollow Campground & Trailhead", kind: "campground", position: [-860, 180], pad: 80, trade: "Forestry and trail crews",
    blurb: "Tent pads under the big trees, a trailhead kiosk with the trail map, and the camp host's board for the day's closures.",
    stations: ["gk-string-trimmer-and-blower-ppe-and-bystander-zone", "ed-playground-equipment-inspection", "br-volunteer-cleanup-day-safety-lead", "k12-first-aid-awareness-call-for-help"] },
  { id: "nursery", name: "Forest Nursery & Seed Bank", kind: "nursery", position: [-1340, 760], pad: 80, trade: "Forestry nursery",
    blurb: "Greenhouses of seedlings, a cold seed store and a potting shed, supplying the planting crews across the whole reach.",
    stations: ["gk-greenhouse-nursery-chemical-storage-and-eyewash", "me-eelgrass-seed-collection-and-nursery", "gk-pesticide-and-fertilizer-application-per-the-label", "gk-irrigation-controller-valve-box-and-backflow-check"] },
  { id: "substation", name: "Rural Substation & Line Corridor", kind: "substation", position: [1180, 760], pad: 60, trade: "Linemen and substation electricians",
    blurb: "A fenced yard of transformers and switches where the transmission line comes over the ridge, with a cleared corridor the crews keep open.",
    stations: ["substation-switching", "or-transmission-line-right-of-way-patrol", "line-truck", "transformer-vault"] },
  { id: "estuary", name: "Estuary Field Station", kind: "estuary", position: [-1260, 1600], pad: 44, trade: "Watershed restoration",
    blurb: "A boardwalk over the marsh where the river meets the sea, with a field lab, survey stakes and a seine beach.",
    stations: ["marsh-transect-survey", "me-tidal-marsh-channel-restoration-day", "spartina-removal", "br-beach-seine-fish-survey-and-handling"] },
  { id: "equipment-yard", name: "Fire Road Equipment Yard", kind: "equipment-yard", position: [360, -1160], pad: 70, trade: "Heavy equipment on fire roads",
    blurb: "The dozer, the grader and the loader that keep the fire roads open and the fuel breaks cut, parked on a gravel pad by the road gate.",
    stations: ["op-equipment-daily-walkaround-and-fluids", "op-grader-fine-grade-and-crown", "op-dozer-slope-work-and-rollover-protection", "or-ranch-road-grading-and-culvert"] },
  { id: "trail-camp", name: "Trail Crew Spike Camp", kind: "trail-camp", position: [-560, -980], pad: 40, trade: "Forestry and trail crews",
    blurb: "A tool cache, a crew tent and the trail work for the week pinned to a board: brushing, limbing and clearing the blowdown.",
    stations: ["gk-chainsaw-start-and-limbing-on-the-ground", "gk-tree-work-pole-saw-and-drop-zone", "gk-storm-cleanup-chipper-and-traffic-control"] },
  { id: "old-growth", name: "Old-Growth Grove", kind: "grove", position: [-240, 260], pad: 26, trade: "Forestry and trail crews",
    blurb: "The tallest trees in the reach, on a boardwalk loop that keeps feet off the roots — the start of the trail-crew route.",
    stations: ["gk-tree-work-pole-saw-and-drop-zone", "marsh-transect-survey"] },
];
const RW_SITE_BY_ID = Object.fromEntries(RW_SITES.map((s) => [s.id, s]));
for (const s of RW_SITES) s.padY = Math.max(rwRiverY(rwRiverNearest(...s.position).t) + 4, rwBaseHeight(...s.position));
// The lookout sits on its own summit knob (see rwHeightAt).
RW_SITE_BY_ID.lookout.padY += 120;
export function rwSite(id) { return RW_SITE_BY_ID[id] ?? null; }

// ------------------------------------------------------------ roads, trails

/** Fire roads (graded, drivable) as polylines through the sites. */
export const RW_ROADS = Object.freeze([
  { id: "valley-road", name: "Valley Fire Road", kind: "fire-road",
    points: [[-1340, 760], [-1100, 640], [-860, 180], [-560, 300], [-240, 260], [320, 560], [520, 520], [900, 640], [1180, 760]] },
  { id: "mill-road", name: "Mill Road", kind: "fire-road",
    points: [[320, 560], [160, 800], [-60, 1000], [-220, 1200], [-900, 1400], [-1260, 1600]] },
  { id: "ridge-road", name: "Ridge Fire Road", kind: "fire-road",
    points: [[320, 560], [300, 100], [680, 40], [460, -520], [360, -1160], [760, -1120], [1040, -1060], [1240, -980]] },
  { id: "spur-road", name: "Spike Camp Spur", kind: "fire-road",
    points: [[360, -1160], [60, -1120], [-260, -1060], [-560, -980]] },
]);
/** Foot trails. */
export const RW_TRAILS = Object.freeze([
  { id: "grove-loop", name: "Grove Boardwalk Loop", points: [[-240, 260], [-320, 200], [-380, 280], [-320, 360], [-240, 260]] },
  { id: "hollow-trail", name: "Hollow Creek Trail", points: [[-860, 180], [-760, -200], [-700, -560], [-560, -980]] },
  { id: "lookout-trail", name: "Lookout Switchbacks", points: [[1040, -1060], [1120, -1180], [1200, -1100], [1240, -980]] },
]);
/** The fuel break the survey walks: a cleared strip along the ridge. */
export const RW_FUEL_BREAK = Object.freeze([[-200, -700], [200, -760], [600, -820], [1000, -860], [1400, -900]]);
/** The transmission line: towers from the ridge to the substation and on west. */
export const RW_POWER_LINE = Object.freeze([[2040, 200], [1600, 480], [1180, 760], [700, 900], [240, 980], [-200, 1020]]);

/** Distance from (x, z) to the nearest point of a polyline. */
export function rwPolylineDistance(pts, x, z) {
  let best = Infinity;
  for (let i = 1; i < pts.length; i += 1) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz || 1;
    const u = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2));
    best = Math.min(best, Math.hypot(x - (ax + u * vx), z - (az + u * vz)));
  }
  return best;
}

/** Which forest a point grows: "redwood" (valley and fog belt), "mixed" (higher slopes), "marsh", "open" or "water". */
export function rwBiomeAt(x, z, h = rwHeightAt(x, z)) {
  if (rwIsWater(x, z)) return "water";
  const coast = rwCoastZ(x);
  if (z > coast - 140 || (x < -900 && z > 1380)) return "marsh";
  if (rwPolylineDistance(RW_FUEL_BREAK, x, z) < 40) return "open";
  if (rwPolylineDistance(RW_POWER_LINE, x, z) < 34) return "open";
  const { d } = rwRiverNearest(x, z);
  if (h < 150 || d < 420) return "redwood";
  if (h > 420 && rwNoise(x / 180, z / 180) > 0.62) return "open";
  return "mixed";
}

// --------------------------------------------------------------- landmarks
//
// Named places for eggs, field lessons and the map. Generic names only.

export const RW_LANDMARKS = [
  { id: "cathedral-ring", name: "Cathedral Ring", position: [-300, 300], site: "old-growth" },
  { id: "fallen-giant", name: "The Fallen Giant", position: [-380, 230], site: "old-growth" },
  { id: "grove-bench", name: "Grove Bench", position: [-190, 320], site: "old-growth" },
  { id: "engine-bay", name: "Engine Bay Ready Board", position: [350, 540], site: "fire-station" },
  { id: "hose-tower", name: "Hose Drying Tower", position: [280, 600], site: "fire-station" },
  { id: "helispot", name: "Valley Helispot", position: [420, 660], site: "fire-station" },
  { id: "lookout-cab", name: "Lookout Cab", position: [1250, -990], site: "lookout" },
  { id: "firefinder-rock", name: "Firefinder Rock", position: [1190, -940], site: "lookout" },
  { id: "switchback-bend", name: "Switchback Bend", position: [1120, -1180], site: "lookout" },
  { id: "log-deck", name: "Cold Log Deck", position: [-300, 1150], site: "sawmill" },
  { id: "debarker", name: "Debarker Line", position: [-150, 1250], site: "sawmill" },
  { id: "planer-shed", name: "Planer Shed", position: [-170, 1130], site: "sawmill" },
  { id: "log-jam", name: "Engineered Log Jam", position: [560, -80], site: "restoration" },
  { id: "old-culvert", name: "Old Culvert Crossing", position: [400, 40], site: "restoration" },
  { id: "willow-stakes", name: "Willow Stake Bank", position: [600, 10], site: "restoration" },
  { id: "trailhead-kiosk", name: "Trailhead Kiosk", position: [-820, 200], site: "campground" },
  { id: "amphitheatre", name: "Campfire Amphitheatre", position: [-900, 120], site: "campground" },
  { id: "host-site", name: "Camp Host Site", position: [-930, 240], site: "campground" },
  { id: "seed-vault", name: "Cold Seed Vault", position: [-1370, 720], site: "nursery" },
  { id: "shade-house", name: "Shade House", position: [-1300, 800], site: "nursery" },
  { id: "potting-shed", name: "Potting Shed", position: [-1390, 800], site: "nursery" },
  { id: "switchyard-gate", name: "Switchyard Gate", position: [1140, 720], site: "substation" },
  { id: "corridor-tower", name: "Corridor Tower", position: [1600, 480], site: "substation" },
  { id: "danger-tree", name: "Marked Danger Tree", position: [920, 860], site: "substation" },
  { id: "boardwalk-end", name: "Boardwalk End", position: [-1300, 1650], site: "estuary" },
  { id: "seine-beach", name: "Seine Beach", position: [-1180, 1700], site: "estuary" },
  { id: "tide-stake", name: "Tide Stake", position: [-1220, 1560], site: "estuary" },
  { id: "dozer-line", name: "Dozer Line Overlook", position: [420, -1200], site: "equipment-yard" },
  { id: "road-gate", name: "Fire Road Gate", position: [300, -1120], site: "equipment-yard" },
  { id: "water-tank", name: "Fire Road Water Tank", position: [440, -1100], site: "equipment-yard" },
  { id: "tool-cache", name: "Tool Cache", position: [-540, -1000], site: "trail-camp" },
  { id: "blowdown", name: "Blowdown Across the Trail", position: [-700, -560], site: "trail-camp" },
  { id: "waterbar", name: "Stone Waterbar", position: [-760, -200], site: "trail-camp" },
  { id: "fuel-break-west", name: "Fuel Break West Post", position: [-200, -700], site: "equipment-yard" },
  { id: "fuel-break-east", name: "Fuel Break East Post", position: [1400, -900], site: "lookout" },
  { id: "river-mouth", name: "River Mouth Bar", position: [-1150, 1770], site: "estuary" },
];
const RW_LANDMARK_BY_ID = Object.fromEntries(RW_LANDMARKS.map((l) => [l.id, l]));
export function rwLandmark(id) { return RW_LANDMARK_BY_ID[id] ?? null; }

// ------------------------------------------------------------------- quests
//
// Step shape: { type: "goto", site } | { type: "station", site, station } |
// { type: "find", egg } | { type: "activity", activity } | { type: "lesson", lesson }.
// A gated quest carries the shared gate contract (frontier brief):
// gate: { stations?, programmes?, quests?, k12?, note }.

export const RW_MAIN_ARC = [
  { id: "rw-main-1-arrive", title: "Into the Reach", giver: "the station captain", kind: "main",
    steps: [
      { type: "goto", site: "fire-station", text: "Report to the Wildland Fire Station and read the ready board." },
      { type: "goto", site: "old-growth", text: "Walk the Grove Boardwalk Loop with the crew — feet on the boards, off the roots." },
    ], reward: { xp: 100, badge: "Reach Newcomer" } },
  { id: "rw-main-2-lookout", title: "Eyes on the Ridge", giver: "the lookout", kind: "main", requires: "rw-main-1-arrive",
    steps: [
      { type: "goto", site: "equipment-yard", text: "Take the Ridge Fire Road to the equipment yard and sign past the gate." },
      { type: "goto", site: "lookout", text: "Climb to the Ridge Fire Lookout and learn how a smoke report is logged." },
      { type: "station", site: "lookout", station: "or-wildland-fireline-construction-and-lookout", text: "Run the fireline and lookout station: LCES named before a tool moves." },
    ], reward: { xp: 250, badge: "Ridge Watch" } },
  { id: "rw-main-3-roads", title: "Keep the Roads Open", giver: "the equipment operator", kind: "main", requires: "rw-main-2-lookout",
    steps: [
      { type: "station", site: "equipment-yard", station: "op-equipment-daily-walkaround-and-fluids", text: "Walk the machine around before it moves: the operator's daily check." },
      { type: "activity", activity: "fuel-break-survey", text: "Walk the fuel break with the survey sheet." },
    ], reward: { xp: 400, badge: "Road Keeper" } },
  { id: "rw-main-4-river", title: "Put the River Back", giver: "the restoration lead", kind: "main", requires: "rw-main-3-roads",
    steps: [
      { type: "goto", site: "restoration", text: "Meet the restoration crew at the reach." },
      { type: "activity", activity: "river-count", text: "Count the restoration features along the reach." },
      { type: "station", site: "restoration", station: "br-culvert-retrofit-for-fish-passage", text: "Open the old culvert for fish — dry, fish-excluded channel first." },
    ], reward: { xp: 550, badge: "Reach Restorer" } },
  { id: "rw-main-5-mill", title: "Down at the Mill", giver: "the mill millwright", kind: "main", requires: "rw-main-4-river",
    steps: [
      { type: "goto", site: "sawmill", text: "Follow Mill Road down the valley to the sawmill." },
      { type: "station", site: "sawmill", station: "conveyor-guard", text: "Guard the conveyor before anyone reaches in." },
    ], reward: { xp: 700, badge: "Millwright's Mark" } },
  { id: "rw-main-6-estuary", title: "Where the River Meets the Sea", giver: "the estuary field lead", kind: "main", requires: "rw-main-5-mill",
    steps: [
      { type: "goto", site: "estuary", text: "Walk the boardwalk to the Estuary Field Station." },
      { type: "station", site: "estuary", station: "marsh-transect-survey", text: "Walk the marsh on a fixed line with the survey crew." },
      { type: "activity", activity: "trail-crew-route", text: "Close out the season with the trail-crew route." },
    ], reward: { xp: 850, badge: "Redwood Reach Steward" } },
];

/** Side quests: each is gated on real stations (the skill-gate contract). */
export const RW_SIDE_QUESTS = [
  { id: "rw-side-night-lookout", title: "Night Watch at the Lookout", site: "lookout", kind: "side",
    gate: { stations: ["or-wildland-fireline-construction-and-lookout"], note: "Fireline and lookout first — you log smoke only once you know LCES." },
    steps: [{ type: "goto", site: "lookout", text: "Take the dusk-to-dark watch and log each light on the ridge the way the lookout showed you." }],
    reward: { xp: 150, cosmetic: "Lookout's wool cap" } },
  { id: "rw-side-danger-tree", title: "The Danger Tree Survey", site: "substation", kind: "side",
    gate: { stations: ["or-transmission-line-right-of-way-patrol"], note: "Right-of-way patrol first — a line is treated as energised from the first look." },
    steps: [{ type: "goto", site: "substation", text: "Walk the corridor with the patrol and flag the marked danger tree for the line clearance crew." }],
    reward: { xp: 150, cosmetic: "Corridor flagging vest" } },
  { id: "rw-side-mill-restart", title: "Safe Restart at the Mill", site: "sawmill", kind: "side",
    gate: { stations: ["tw-conveyor-jam-clearing-and-loto"], note: "Jam clearing and lockout first — nobody restarts a line they did not lock out." },
    steps: [{ type: "goto", site: "sawmill", text: "Walk the restart checklist with the millwright: headcount, guards on, lock off last." }],
    reward: { xp: 150, cosmetic: "Millwright's tape measure" } },
  { id: "rw-side-blowdown", title: "Clear the Blowdown", site: "trail-camp", kind: "side",
    gate: { stations: ["gk-chainsaw-start-and-limbing-on-the-ground"], note: "Chainsaw start and limbing first — the saw is started braced on the ground." },
    steps: [{ type: "goto", site: "trail-camp", text: "Size up the blowdown across the Hollow Creek Trail with the sawyer and plan the cuts." }],
    reward: { xp: 150, cosmetic: "Trail crew hard hat sticker" } },
  { id: "rw-side-grade-the-spur", title: "Grade the Spur Road", site: "equipment-yard", kind: "side",
    gate: { stations: ["op-grader-fine-grade-and-crown"], note: "Grader fine grade first — a crown is only as good as its stringline." },
    steps: [{ type: "goto", site: "equipment-yard", text: "Ride along while the spur road is crowned and the waterbars reset." }],
    reward: { xp: 150, cosmetic: "Operator's gloves" } },
  { id: "rw-side-seed-run", title: "The Seed Run", site: "nursery", kind: "side",
    gate: { stations: ["gk-greenhouse-nursery-chemical-storage-and-eyewash"], note: "Nursery chemical storage first — the path to the eyewash stays clear." },
    steps: [{ type: "goto", site: "nursery", text: "Carry the labelled seed lots from the vault to the potting shed in the order on the sheet." }],
    reward: { xp: 150, cosmetic: "Seed-bank apron" } },
  { id: "rw-side-seine-day", title: "Seine Day at the Mouth", site: "estuary", kind: "side",
    gate: { stations: ["br-beach-seine-fish-survey-and-handling"], note: "Beach seine survey first — the net is hauled as one crew." },
    steps: [{ type: "goto", site: "estuary", text: "Help haul the seine at Seine Beach and read each count back to the recorder." }],
    reward: { xp: 150, cosmetic: "Waders patch" } },
  { id: "rw-side-ember-ready", title: "Ember-Ready Campground", site: "campground", kind: "side",
    gate: { stations: ["wildland-urban-interface"], note: "Wildland-urban interface first — prep against embers before the wind turns." },
    steps: [{ type: "goto", site: "campground", text: "Walk the campground with the camp host and clear the fire rings' surroundings per the posted plan." }],
    reward: { xp: 150, cosmetic: "Camp host lanyard" } },
  { id: "rw-side-planting-crew", title: "Plant the Bank", site: "restoration", kind: "side",
    gate: { stations: ["br-native-planting-and-erosion-mats"], note: "Native planting and erosion mats first — the mat goes down before the plants." },
    steps: [{ type: "goto", site: "restoration", text: "Lay out the planting grid on the graded bank with the crew lead." }],
    reward: { xp: 150, cosmetic: "Planting bar charm" } },
  { id: "rw-side-rehab-drill", title: "Rehab Drill", site: "fire-station", kind: "side",
    gate: { stations: ["firefighter-rehab-sector"], note: "Firefighter rehab sector first — the crew is the patient in rehab." },
    steps: [{ type: "goto", site: "fire-station", text: "Set up the shade, water and rest point for a training day, the way the rehab station taught it." }],
    reward: { xp: 150, cosmetic: "Station T-shirt" } },
];

// ---------------------------------------------------------------- activities
//
// Three scored activities, scored on safe practice. Each waypoint asks one
// question whose answer is the station's own habit, never a number.

export const RW_ACTIVITIES = [
  { id: "trail-crew-route", name: "Trail-Crew Route", site: "old-growth",
    blurb: "Walk the crew's route from the grove to the spike camp, stopping at each work point to call the safe move before the tool comes out.",
    waypoints: [
      { at: [-240, 260], q: "Before the crew walks off the boardwalk, what is set first?", options: ["The route and the check-in time, told to someone at camp", "Nothing — the trail is marked"], answer: 0 },
      { at: [-760, -200], q: "A waterbar is clogged with debris. How do you clear it?", options: ["Tool from the uphill side, footing checked first", "Kick it clear from below"], answer: 0 },
      { at: [-700, -560], q: "A tree is down across the trail. What comes before the saw?", options: ["Size up the tension and the escape route", "Start cutting where it is easiest to reach"], answer: 0 },
      { at: [-560, -980], q: "Back at camp, the saw is put away. What is checked?", options: ["Chain brake on, cooled, stored in its cache", "Left on the stump for tomorrow"], answer: 0 },
    ] },
  { id: "fuel-break-survey", name: "Fuel-Break Survey", site: "equipment-yard",
    blurb: "Walk the ridge fuel break post to post and record what each plot shows, the way the survey sheet asks.",
    waypoints: [
      { at: [-200, -700], q: "Branches reach from the grass up into the crowns here. What do you record?", options: ["Ladder fuels present — flag for treatment per the plan", "Nothing unusual"], answer: 0 },
      { at: [200, -760], q: "Brush is piled beside the road. What goes on the sheet?", options: ["Location of the pile for the plan's disposal method", "Burn it now"], answer: 0 },
      { at: [600, -820], q: "The break is clear and mowed here. What do you record?", options: ["Plot maintained, photo taken from the post", "Skip the plot"], answer: 0 },
      { at: [1000, -860], q: "A spark arrester is missing on a parked machine. What next?", options: ["Tag it out and report it to the operator", "Note it for next season"], answer: 0 },
      { at: [1400, -900], q: "The survey is done. Where does the sheet go?", options: ["To the lead, checked and signed, the same day", "In the truck for later"], answer: 0 },
    ] },
  { id: "river-count", name: "River-Restoration Count", site: "restoration",
    blurb: "Walk the reach and count the restoration features at each marker; accuracy and staying out of the channel are the score.",
    waypoints: [
      { at: [680, 40], q: "Where do you walk to count the log structures?", options: ["On the bank, outside the flagged work zone", "Wading down the channel"], answer: 0 },
      { at: [560, -80], q: "The log jam's anchors are exposed. What do you record?", options: ["Photo and note for the engineer, no touching", "Pull the loose one free"], answer: 0 },
      { at: [400, 40], q: "The culvert crossing has a fish-exclusion net up. What do you do?", options: ["Stay clear and note it on the sheet", "Step over it to count faster"], answer: 0 },
      { at: [600, 10], q: "Fresh willow stakes on the bank: how do you count them?", options: ["From the edge, without stepping on the mat", "Walk the mat to count up close"], answer: 0 },
    ] },
];

/** Every gated item in this world, for tools/check_gates.mjs and the lock UI. */
export function rwGatedItems() {
  return RW_SIDE_QUESTS.filter((q) => q.gate).map((q) => ({ id: q.id, kind: "quest", world: "redwood", site: q.site, gate: q.gate }));
}

/** The in-game map's layers. */
export const RW_MAP_LAYERS = Object.freeze([
  { id: "sites", label: "Work sites" }, { id: "roads", label: "Fire roads" }, { id: "trails", label: "Trails" },
  { id: "water", label: "River & estuary" }, { id: "lessons", label: "K-12 field lessons" }, { id: "quests", label: "Quests & locks" },
  { id: "found", label: "Found treasures" },
]);
