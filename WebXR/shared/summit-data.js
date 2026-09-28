// Sierra Summit — the pure ground truth for the mountain world: the terrain
// field, the sites, landmarks, roads, lines, eggs, field lessons, quests and
// scored activities. No three.js and no DOM, so a quest layer, the Guide's
// knowledge-base generator, the Unity exporter and tools/check_summit.mjs can
// all read it headless. shared/summit.js adds the three.js builder.
//
// Everything here is original and generic under the platform's facts rule
// (tools/briefs/frontier-brief.md): no real resort, dam, utility, agency or
// address is named; places are plain descriptive names. No limit is stated:
// approach distances, load ratings, gas readings and avalanche terms read
// "per the plan / permit / label". Egg lessons are quoted verbatim from the
// first sentence of a real station step's own `why` text (`cites` names the
// station and step, and tools/check_summit.mjs verifies the quote).
//
// Geometry: one field x,z in [-2048, 2048] — 4096 m by 4096 m in scene units
// (metres), north is -z. The valley floor and the pass road's foot sit to
// the south-west; the land climbs to a main peak in the north and an eastern
// transmission ridge. Terrain is streamed in 256 m chunks (16 x 16 = 256);
// smHeightAt() is the one height function every consumer samples.
//
// Every top-level name is prefixed `sm`/`SM_` (the bundler concatenates all
// modules into one scope).

/** The world's field in metres. */
export const SM_BOUNDS = { minX: -2048, maxX: 2048, minZ: -2048, maxZ: 2048 };
export const SM_SIZE = 4096;
/** Terrain chunk edge in metres, and the number of chunks per side. */
export const SM_CHUNK = 256;
export const SM_CHUNKS_PER_SIDE = SM_SIZE / SM_CHUNK;
/** Grid segments per chunk at each LOD ring (0 = the player's chunk and its neighbours). */
export const SM_LOD_SEGMENTS = [32, 24, 12, 8];
/** Chunks kept loaded around the player, per quality tier (Chebyshev radius). */
export const SM_STREAM_RADIUS = { low: 2, balanced: 3, high: 3 };
/** Chunk rings that carry instanced conifers, per tier. */
export const SM_TREE_RADIUS = { low: 1, balanced: 2, high: 2 };
/** Conifers per full forested chunk at ring 0 (fewer further out). */
export const SM_TREES_PER_CHUNK = 200;
/** Share of SM_TREES_PER_CHUNK each tree ring carries; ring 2 is half of what it was and draws billboard impostors. */
export const SM_TREE_RING_FACTOR = [1, 0.8, 0.28];
/** The ring from which conifers are two-quad impostors instead of the three-part mesh. */
export const SM_IMPOSTOR_RING = 2;
/** Triangles per tree, by representation (the builder's geometries: cylinder(4) + cone(6) + cone(5); two crossed quads). */
export const SM_TRI = { conifer: 38, impostor: 4, backdrop: 96 * 96 * 2 };
/** Heights (metres) where the land changes character. */
export const SM_TREELINE = 760;
export const SM_SNOWLINE = 900;
export const SM_SCREE = 640;
/** Mesh and triangle budget the builder is held to (tools/check_summit.mjs). */
export const SM_BUDGET = { drawCalls: 180, triangles: 420000, chunksLoaded: 49 };

/**
 * A pure, worst-case triangle estimate for one streamed view on a tier:
 * every chunk in the square at its ring's LOD, every tree ring fully
 * forested, plus the backdrop. The builder's stats() measures the real
 * count; tools/check_summit.mjs holds this estimate to SM_BUDGET.triangles.
 */
export function smTriangleEstimate(tier = "high") {
  const r = SM_STREAM_RADIUS[tier] ?? 3, tr = SM_TREE_RADIUS[tier] ?? 2;
  let tri = SM_TRI.backdrop;
  for (const c of smChunksAround(0, 0, r)) {
    tri += SM_LOD_SEGMENTS[c.lod] ** 2 * 2;
    if (c.ring <= tr) {
      const n = Math.round(SM_TREES_PER_CHUNK * (SM_TREE_RING_FACTOR[c.ring] ?? SM_TREE_RING_FACTOR.at(-1)) * (tier === "low" ? 0.5 : 1));
      tri += n * (c.ring >= SM_IMPOSTOR_RING ? SM_TRI.impostor : SM_TRI.conifer);
    }
  }
  return tri;
}

// ------------------------------------------------------------------ noise

/** A small seeded RNG (mulberry32). */
export function smRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SM_SEED = 4417;

function smHash(ix, iz) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(SM_SEED, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smValueNoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = smHash(ix, iz), b = smHash(ix + 1, iz), c = smHash(ix, iz + 1), d = smHash(ix + 1, iz + 1);
  return (a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz) * 2 - 1;
}

function smFbm(x, z, oct) {
  let s = 0, amp = 1, f = 1, norm = 0;
  for (let i = 0; i < oct; i++) { s += smValueNoise(x * f, z * f) * amp; norm += amp; amp *= 0.5; f *= 2.03; }
  return s / norm;
}

function smRidged(x, z, oct) {
  let s = 0, amp = 1, f = 1, norm = 0;
  for (let i = 0; i < oct; i++) { const n = 1 - Math.abs(smValueNoise(x * f + 17.3, z * f - 9.1)); s += n * n * amp; norm += amp; amp *= 0.5; f *= 2.11; }
  return s / norm;
}

const smClamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smSmooth = (e0, e1, v) => { const t = smClamp((v - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

/** Distance from (x, z) to a polyline [[x, z], …]; returns { d, t } with t the along-line fraction. */
export function smPolyDistance(x, z, pts) {
  let best = Infinity, bestAlong = 0, run = 0, total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, L = Math.sqrt(L2);
    const u = L2 ? smClamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1) : 0;
    const d = Math.hypot(x - (ax + dx * u), z - (az + dz * u));
    if (d < best) { best = d; bestAlong = (run + u * L) / (total || 1); }
    run += L;
  }
  return { d: best, t: bestAlong };
}

// ------------------------------------------------------------------ layout

/** The pass road: from the valley gate over the pass, through the tunnel, down the far side. */
export const SM_PASS_ROAD = [
  [-1950, 1850], [-1500, 1450], [-1100, 1150], [-500, 950], [0, 700], [300, 300], [450, -150], [600, -560],
  [900, -900], [1400, -1300], [1950, -1850],
];
/** The service road from the pass road to the dam, the ranger station and the gondola shop. */
export const SM_SERVICE_ROAD = [[-1100, 1150], [-1050, 1050], [-760, 520], [-1230, 290], [-760, 520], [-260, -240]];
/** The transmission line, substation to the far ridge. */
export const SM_TRANSMISSION = [[1050, 420], [1300, -100], [1480, -560], [1650, -1100], [1820, -1700]];
/** The gondola, bottom (maintenance shop) to top (summit station). */
export const SM_GONDOLA = [[-240, -300], [160, -1150]];
/** The penstock, dam intake to powerhouse. */
export const SM_PENSTOCK = [[-640, 360], [-560, 760]];
/** The reservoir behind the dam. */
export const SM_LAKE = { centre: [-700, -40], radius: 380 };
/** The tailrace river: from the powerhouse down the valley to the south-west corner, under the pass road once (a culvert). */
export const SM_RIVER = [[-560, 790], [-646, 913], [-789, 957], [-753, 1103], [-766, 1252], [-844, 1380], [-952, 1484], [-1075, 1571], [-1225, 1573], [-1224, 1723], [-1195, 1870], [-1278, 1995], [-1250, 2048]];
/** The river channel: half-width in metres where the bed is cut, its depth below the banks, and the corridor the banks blend over. */
export const SM_RIVER_CHANNEL = { width: 14, depth: 2.6, corridor: 70 };
/** Hiking trails (the orienteering course follows the first). */
export const SM_TRAILS = [
  { id: "lookout-trail", name: "West Ridge Lookout Trail", pts: [[-1230, 290], [-1300, 100], [-1380, -150], [-1450, -400], [-1510, -690]] },
  { id: "lakeshore-trail", name: "Lakeshore Trail", pts: [[-1230, 290], [-1120, 120], [-1110, -260], [-800, -480], [-420, -380], [-260, -240]] },
  { id: "summit-traverse", name: "Summit Traverse", pts: [[160, -1150], [250, -1350], [520, -1480], [820, -1560]] },
];

const SM_MAIN_PEAK = [250, -1350];
const SM_EAST_RIDGE = [[1300, -100], [1820, -1700]];
const SM_WEST_KNOB = [-1510, -690];

/** The eight work sites and the valley base. `pad` is the flattened radius. */
export const SM_SITES = [
  { id: "valley-base", name: "Valley Base", zone: "valley", at: [-1500, 1450], pad: 70, stations: [],
    blurb: "The trailhead car park and crew muster point at the foot of the pass road, where every visit starts." },
  { id: "water-plant", name: "Valley Water Treatment Plant", zone: "valley", at: [-1050, 1050], pad: 70,
    trade: "Water treatment plant operators", stations: ["chlorine-room", "ut-water-treatment-chemical-delivery-unloading", "lift-station", "k12-water-cycle-and-filtration"],
    blurb: "The plant below the dam that turns reservoir water into drinking water: chemical deliveries, the chlorine room and the lift station." },
  { id: "dam", name: "Hydroelectric Dam & Penstock", zone: "reservoir", at: [-760, 520], pad: 60,
    trade: "Boilermakers, divers and plant operators", stations: ["ib-pressure-vessel-confined-entry-and-hot-work", "confined-rescue", "uw-intake-screen-cleaning-with-lockout", "ib-hydrostatic-test-and-inspector-witness"],
    blurb: "The concrete dam holding the reservoir, its intake and the steel penstock running down to the powerhouse." },
  { id: "ranger-station", name: "Ranger Station & Trailhead", zone: "reservoir", at: [-1230, 290], pad: 55,
    trade: "Wildland firefighters and trail crews", stations: ["or-wildland-fireline-construction-and-lookout", "wildland-urban-interface", "gk-chainsaw-start-and-limbing-on-the-ground", "psychological-first-aid", "k12-first-aid-awareness-call-for-help"],
    blurb: "The ranger station at the lake's west shore, the trail register and the start of the lookout trail." },
  { id: "pass-road", name: "Pass Road Crew Yard", zone: "pass", at: [0, 700], pad: 60,
    trade: "Operating engineers, drivers and traffic control", stations: ["drive-mountain-grade-and-engine-brake", "gk-storm-cleanup-chipper-and-traffic-control", "traffic-incident-management", "or-ranch-road-grading-and-culvert", "op-compactor-lift-thickness-and-edge"],
    blurb: "The road crew's yard on the climb to the pass: grading, culverts, storm clean-up and the avalanche-season traffic control the plan calls for." },
  { id: "tunnel-portal", name: "Pass Tunnel Portal", zone: "pass", at: [600, -560], pad: 55,
    trade: "Tunnel and heavy civil crews", stations: ["cm-shotcrete-nozzle-and-rebound", "op-excavator-trench-and-utility-locate", "scaffold-erection"],
    blurb: "The portal where the pass road goes under the ridge: shotcrete on the portal face, a utility trench and the scaffold at the headwall." },
  { id: "gondola-shop", name: "Gondola Maintenance Shop", zone: "pass", at: [-240, -300], pad: 55,
    trade: "Lift mechanics and riggers", stations: ["ew-machine-room-lockout-and-brake-test", "ew-elevator-entrapment-and-rescue-with-fire-service", "rl-critical-lift-plan-and-signalperson"],
    blurb: "The bottom station's shop: the drive room, the haul-rope brakes and the cabin-rescue drill, run the way the lift's own plan sets out." },
  { id: "substation", name: "Ridge Substation", zone: "ridge", at: [1050, 420], pad: 60,
    trade: "Substation electricians", stations: ["substation-switching", "arc-flash-label-study"],
    blurb: "The fenced substation where the ridge line lands: switching orders, read-backs and every door's arc-flash label." },
  { id: "ridge-line", name: "Transmission Ridge Line Crew", zone: "ridge", at: [1480, -560], pad: 50,
    trade: "Outside lineworkers and tower climbers", stations: ["line-truck", "or-transmission-line-right-of-way-patrol", "tower-climb", "fp-anchor-selection-and-rescue-plan"],
    blurb: "The line crew's staging pad under the ridge towers: right-of-way patrol, rubber goods, the climb and the rescue plan." },
];

/** The five zones, each with a centre (sites belong to the nearest). */
export const SM_ZONES = [
  { id: "valley", name: "The Valley Floor", centre: [-1300, 1300], blurb: "Meadow and pine at the foot of the pass, the treatment plant and the valley base." },
  { id: "reservoir", name: "The Reservoir", centre: [-900, 200], blurb: "The lake behind the dam, its shoreline trail and the ranger station." },
  { id: "pass", name: "The Pass", centre: [350, -50], blurb: "The pass road's switchbacks, the crew yard and the tunnel under the ridge." },
  { id: "summit", name: "The High Summit", centre: [100, -1100], blurb: "Scree and snowfields above the treeline, the gondola and the summit lookout." },
  { id: "ridge", name: "The Transmission Ridge", centre: [1400, -300], blurb: "The long eastern ridge the transmission line follows down to the substation." },
];

/** Named landmarks (no board; eggs and field lessons hang off them). */
export const SM_LANDMARKS = [
  { id: "summit-lookout", name: "Summit Lookout", at: [250, -1350], blurb: "A stone lookout hut on the main peak with a view over every site in the world." },
  { id: "west-lookout", name: "West Ridge Lookout", at: [-1510, -690], blurb: "A timber fire lookout on a knob above the lake, the end of the orienteering course." },
  { id: "reservoir-shore", name: "Reservoir Shore", at: [-1110, -260], blurb: "A gravel beach on the lake's west shore where the lakeshore trail runs." },
  { id: "powerhouse", name: "Powerhouse", at: [-560, 780], blurb: "The powerhouse at the foot of the penstock where falling water turns the turbines." },
  { id: "gondola-top", name: "Gondola Top Station", at: [160, -1150], blurb: "The upper terminal of the gondola, the start of the summit traverse and the survey route." },
  { id: "pass-summit", name: "The Pass Saddle", at: [450, -150], blurb: "The high point of the pass road, a lay-by and a view down both sides." },
  { id: "avalanche-gallery", name: "Avalanche Chute Sign", at: [300, 300], blurb: "A roadside board where the pass road crosses a chute, the place the traffic-control plan starts in winter." },
  { id: "far-gate", name: "Far Side Gate", at: [1400, -1300], blurb: "The pass road's gate on the far side of the tunnel, looking down the next valley." },
  { id: "snowfield", name: "High Snowfield", at: [620, -1520], blurb: "A broad snowfield below the summit traverse, where the survey route runs." },
  { id: "meadow", name: "Valley Meadow", at: [-1700, 1000], blurb: "An open meadow west of the plant where the valley trail loops." },
];

// ----------------------------------------------------------------- terrain

/** The pass road's height profile: [along-road fraction, metres]; the tunnel runs between the two portals. */
export const SM_ROAD_PROFILE = [[0, 150], [0.28, 190], [0.45, 330], [0.62, 560], [0.7, 600], [0.8, 600], [0.9, 520], [1, 430]];
/** Along-road fractions of the tunnel (no road bed is cut between them). */
export const SM_TUNNEL_SPAN = [0.7, 0.8];

function smRoadHeight(t) {
  const P = SM_ROAD_PROFILE;
  for (let i = 1; i < P.length; i++) if (t <= P[i][0]) {
    const u = (t - P[i - 1][0]) / (P[i][0] - P[i - 1][0]);
    return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u * u * (3 - 2 * u);
  }
  return P[P.length - 1][1];
}

/** The road bed's height at an along-road fraction. */
export function smRoadHeightAt(t) { return smRoadHeight(t); }

function smNatural(x, z) {
  const t = smClamp((1400 - z) / 3000, 0, 1);
  let h = 200 + 560 * t * t;
  const pk = Math.hypot(x - SM_MAIN_PEAK[0], z - SM_MAIN_PEAK[1]);
  h += 760 * Math.exp(-(pk * pk) / (2 * 640 * 640));
  const er = smPolyDistance(x, z, SM_EAST_RIDGE).d;
  h += 380 * Math.exp(-(er * er) / (2 * 280 * 280)) * smSmooth(600, -400, z);
  const wk = Math.hypot(x - SM_WEST_KNOB[0], z - SM_WEST_KNOB[1]);
  h += 300 * Math.exp(-(wk * wk) / (2 * 380 * 380));
  h += smRidged(x / 1100, z / 1100, 5) * 210 * (0.25 + t) - 70;
  h += smFbm(x / 300, z / 300, 4) * 28;
  return h;
}

function smRawHeight(x, z) {
  let h = smNatural(x, z);
  // The pass road: a cut-and-fill corridor held to the road's own profile,
  // except under the ridge, where the tunnel carries it.
  const r = smPolyDistance(x, z, SM_PASS_ROAD);
  const inTunnel = r.t > SM_TUNNEL_SPAN[0] && r.t < SM_TUNNEL_SPAN[1];
  if (r.d < 160 && !inTunnel) {
    const w = 1 - smSmooth(14, 160, r.d);
    h += (smRoadHeight(r.t) - h) * w;
  }
  // The river: its bed is held to a profile that only ever descends (the
  // running minimum of the natural ground along it), the banks blend to it
  // over the corridor, and a shallow channel is cut in the middle. Both
  // yield within the road corridor, where a culvert carries the river under
  // the road bed.
  const rv = smPolyDistance(x, z, SM_RIVER);
  if (rv.d < SM_RIVER_CHANNEL.corridor) {
    const open = smSmooth(12, 40, r.d);
    const prof = smRiverProfile(rv.t);
    if (prof < h) h += (prof - h) * (1 - smSmooth(6, SM_RIVER_CHANNEL.corridor, rv.d)) * open;
    if (rv.d < SM_RIVER_CHANNEL.width) h -= SM_RIVER_CHANNEL.depth * (1 - smSmooth(3, SM_RIVER_CHANNEL.width, rv.d)) * open;
  }
  return h;
}

/**
 * The river's bed profile: the natural ground sampled every SM_RIVER_STEP
 * metres along the polyline, held to its running minimum so the bed never
 * rises downstream. Sampled once at load; smRiverProfile(t) interpolates.
 */
const SM_RIVER_STEP = 16;
const SM_RIVER_TOTAL = SM_RIVER.slice(1).reduce((s, q, k) => s + Math.hypot(q[0] - SM_RIVER[k][0], q[1] - SM_RIVER[k][1]), 0);
const SM_RIVER_PROFILE = (() => {
  const n = Math.ceil(SM_RIVER_TOTAL / SM_RIVER_STEP), out = [];
  let run = 0, i = 1, floor = Infinity;
  for (let k = 0; k <= n; k++) {
    const d = Math.min(SM_RIVER_TOTAL, k * SM_RIVER_STEP);
    while (i < SM_RIVER.length - 1 && run + Math.hypot(SM_RIVER[i][0] - SM_RIVER[i - 1][0], SM_RIVER[i][1] - SM_RIVER[i - 1][1]) < d) { run += Math.hypot(SM_RIVER[i][0] - SM_RIVER[i - 1][0], SM_RIVER[i][1] - SM_RIVER[i - 1][1]); i++; }
    const L = Math.hypot(SM_RIVER[i][0] - SM_RIVER[i - 1][0], SM_RIVER[i][1] - SM_RIVER[i - 1][1]) || 1;
    const u = smClamp((d - run) / L, 0, 1);
    const x = SM_RIVER[i - 1][0] + (SM_RIVER[i][0] - SM_RIVER[i - 1][0]) * u, z = SM_RIVER[i - 1][1] + (SM_RIVER[i][1] - SM_RIVER[i - 1][1]) * u;
    floor = Math.min(floor, smNatural(x, z) - 1);
    out.push(floor);
  }
  return out;
})();
function smRiverProfile(t) {
  const f = smClamp(t, 0, 1) * (SM_RIVER_PROFILE.length - 1), i = Math.min(SM_RIVER_PROFILE.length - 2, Math.floor(f)), u = f - i;
  return SM_RIVER_PROFILE[i] + (SM_RIVER_PROFILE[i + 1] - SM_RIVER_PROFILE[i]) * u;
}
/** The river's surface height at an along-river fraction (the bed plus most of the channel's depth). */
export function smRiverSurfaceAt(t) { return smRiverProfile(t) - SM_RIVER_CHANNEL.depth + 0.9; }

/** The reservoir's water level (metres), fixed from the terrain at load. */
export const SM_WATER_LEVEL = Math.round(smRawHeight(SM_LAKE.centre[0], SM_LAKE.centre[1]) + 6);

const SM_PAD_HEIGHTS = SM_SITES.map((s) => smRawHeight(s.at[0], s.at[1]));

/** Terrain height (metres) at (x, z): the one field every consumer samples. */
export function smHeightAt(x, z) {
  let h = smRawHeight(x, z);
  // The reservoir: a bowl below the water level, a rim above it.
  const ld = Math.hypot(x - SM_LAKE.centre[0], z - SM_LAKE.centre[1]);
  const R = SM_LAKE.radius;
  if (ld < R * 1.45) {
    const bowl = SM_WATER_LEVEL - 4 - 38 * Math.sqrt(Math.max(0, 1 - ld / R));
    const rim = Math.max(h, SM_WATER_LEVEL + 3 + (ld - R) * 0.25);
    h = ld < R ? bowl + (h - bowl) * 0 : rim + (h - rim) * smSmooth(R, R * 1.45, ld);
  }
  // Site pads: flatten to the pad's own height.
  for (let i = 0; i < SM_SITES.length; i++) {
    const s = SM_SITES[i];
    const d = Math.hypot(x - s.at[0], z - s.at[1]);
    if (d < s.pad * 1.8) h = SM_PAD_HEIGHTS[i] + (h - SM_PAD_HEIGHTS[i]) * smSmooth(s.pad, s.pad * 1.8, d);
  }
  return h;
}

/** True inside the reservoir's water. */
export function smInLake(x, z) { return Math.hypot(x - SM_LAKE.centre[0], z - SM_LAKE.centre[1]) < SM_LAKE.radius && smHeightAt(x, z) < SM_WATER_LEVEL; }

/** Slope (rise over run) at (x, z), by central differences. */
export function smSlopeAt(x, z, e = 4) {
  const dx = smHeightAt(x + e, z) - smHeightAt(x - e, z);
  const dz = smHeightAt(x, z + e) - smHeightAt(x, z - e);
  return Math.hypot(dx, dz) / (2 * e);
}

/**
 * The height gradient at (x, z) by central differences: { dx, dz, slope, aspect }.
 * `aspect` is -1 for a slope facing north (uphill toward +z, since north is
 * -z), +1 facing south, 0 for east/west or flat ground.
 */
export function smGradAt(x, z, e = 4) {
  const dx = (smHeightAt(x + e, z) - smHeightAt(x - e, z)) / (2 * e);
  const dz = (smHeightAt(x, z + e) - smHeightAt(x, z - e)) / (2 * e);
  const slope = Math.hypot(dx, dz);
  return { dx, dz, slope, aspect: slope > 0.02 ? -dz / slope : 0 };
}

/** The snowline at a point: lower on north-facing ground, higher on south-facing, by SM_SNOW_ASPECT metres. */
export const SM_SNOW_ASPECT = 80;
export function smSnowlineAt(aspect) { return SM_SNOWLINE + aspect * SM_SNOW_ASPECT; }

/** True within the river channel's water. */
export function smInRiver(x, z) { return smPolyDistance(x, z, SM_RIVER).d < SM_RIVER_CHANNEL.width * 0.45 && smPolyDistance(x, z, SM_PASS_ROAD).d > 12; }

/** Ground cover at (x, z): "water" | "snow" | "scree" | "rock" | "meadow" | "forest" | "road". */
export function smCoverAt(x, z, h = smHeightAt(x, z), slope = smSlopeAt(x, z)) {
  if (smInLake(x, z) || smInRiver(x, z)) return "water";
  if (smPolyDistance(x, z, SM_PASS_ROAD).d < 7) return "road";
  if (h > smSnowlineAt(smGradAt(x, z).aspect) && slope < 0.9) return "snow";
  if (slope > 1.0) return "rock";
  if (h > SM_SCREE) return "scree";
  return smFbm(x / 180 + 40, z / 180, 3) > -0.05 ? "forest" : "meadow";
}

/** The zone a point belongs to (nearest centre). */
export function smZoneAt(x, z) {
  let best = SM_ZONES[0], bd = Infinity;
  for (const zn of SM_ZONES) { const d = Math.hypot(x - zn.centre[0], z - zn.centre[1]); if (d < bd) { bd = d; best = zn; } }
  return best;
}

/** The chunk key and indices containing (x, z). */
export function smChunkOf(x, z) {
  const cx = smClamp(Math.floor((x - SM_BOUNDS.minX) / SM_CHUNK), 0, SM_CHUNKS_PER_SIDE - 1);
  const cz = smClamp(Math.floor((z - SM_BOUNDS.minZ) / SM_CHUNK), 0, SM_CHUNKS_PER_SIDE - 1);
  return { cx, cz, key: `${cx},${cz}` };
}

/** The chunks to keep loaded around (x, z) at `radius`, each with its LOD ring. */
export function smChunksAround(x, z, radius) {
  const { cx, cz } = smChunkOf(x, z);
  const out = [];
  for (let dz = -radius; dz <= radius; dz++) for (let dx = -radius; dx <= radius; dx++) {
    const ix = cx + dx, iz = cz + dz;
    if (ix < 0 || iz < 0 || ix >= SM_CHUNKS_PER_SIDE || iz >= SM_CHUNKS_PER_SIDE) continue;
    const ring = Math.max(Math.abs(dx), Math.abs(dz));
    out.push({ cx: ix, cz: iz, key: `${ix},${iz}`, ring, lod: Math.min(ring, SM_LOD_SEGMENTS.length - 1) });
  }
  return out;
}

/** Tree positions for one chunk: deterministic per chunk, only where the cover is forest. */
export function smTreesForChunk(cx, cz, count = SM_TREES_PER_CHUNK) {
  const rng = smRng(SM_SEED ^ (cx * 7919 + cz * 104729));
  const x0 = SM_BOUNDS.minX + cx * SM_CHUNK, z0 = SM_BOUNDS.minZ + cz * SM_CHUNK;
  const out = [];
  for (let i = 0; i < count * 2 && out.length < count; i++) {
    const x = x0 + rng() * SM_CHUNK, z = z0 + rng() * SM_CHUNK;
    const h = smHeightAt(x, z);
    if (h > SM_TREELINE - rng() * 80) continue;
    const s = smSlopeAt(x, z, 3);
    if (s > 0.85) continue;
    if (smCoverAt(x, z, h, s) !== "forest") continue;
    if (SM_SITES.some((st) => Math.hypot(x - st.at[0], z - st.at[1]) < st.pad + 10)) continue;
    if (smPolyDistance(x, z, SM_SERVICE_ROAD).d < 8) continue;
    if (smPolyDistance(x, z, SM_RIVER).d < SM_RIVER_CHANNEL.width + 4) continue;
    if (SM_TRAILS.some((t) => smPolyDistance(x, z, t.pts).d < 3)) continue;
    out.push({ x, z, y: h, s: 0.7 + rng() * 0.8, r: rng() * Math.PI * 2 });
  }
  return out;
}

// -------------------------------------------------------------------- eggs
//
// Thirty-two field notes, the Bay World egg format (bayworld/js/quests-data.js):
// found, not given; each lesson is the first sentence of the cited station
// step's own `why`. A few sit behind the skill-gate contract (docs in
// tools/briefs/frontier-brief.md) as a reward for learning.

const SM_EGG_TABLE = [
  // [slug, landmark or site id, x, z, stationId, stepId, lesson]
  ["glove-test", "ridge-line", 1500, -520, "line-truck", "glove-test", "A pinhole in rubber goods is invisible to the eye until it is under pressure."],
  ["sleeve-check", "ridge-line", 1440, -600, "line-truck", "sleeve-check", "Sleeves cover the reach between the glove cuff and the shoulder — a cut, an ozone crack or embedded debris there is just as live a path to a phase conductor as the same defect would be in the glove itself."],
  ["row-weather", "ridge-line", 1650, -1080, "or-transmission-line-right-of-way-patrol", "weather-conditions", "Wind decides how a conductor sags and swings and how fast anything that ignites near it will run through dry range grass, and both of those change the segment's risk hour to hour."],
  ["rf-survey", "ridge-line", 1300, -120, "tower-climb", "rf-survey", "RF exposure is invisible, has no immediate sensation, and is averaged over time — so it is measured, not judged."],
  ["harness", "ridge-line", 1810, -1680, "tower-climb", "harness-donning", "The harness is fitted and checked first, because a lanyard clipped to slack webbing is a fall arrested by your ribs."],
  ["tether-tools", "summit-lookout", 270, -1330, "tower-climb", "tether-tools", "Anything untethered is a dropped object the moment a glove slips, a hand cramps or a gust hits."],
  ["fall-plan", "gondola-top", 180, -1130, "fp-anchor-selection-and-rescue-plan", "read-fall-protection-plan", "The fall protection plan is what turns an edge into a system with numbers behind it — the load an anchor is actually rated for, how much clearance a fall needs below it, and how long a suspended worker can safely wait for rescue."],
  ["order-changed", "substation", 1090, 440, "substation-switching", "order-changed", "A verbal change to a switching order is not a switching order."],
  ["readback", "substation", 1010, 380, "substation-switching", "readback", "Two people agree on every switch before it moves, because the operator at the cubicle cannot see the rest of the system and the control centre cannot see the cubicle."],
  ["breaker", "substation", 1100, 360, "substation-switching", "breaker", "The breaker is the one device in this line-up built to interrupt load current without destroying itself doing it."],
  ["combustibles", "dam", -700, 540, "ib-pressure-vessel-confined-entry-and-hot-work", "combustibles-clear", "NFPA 51B's combustibles clearance is not a formality around the actual weld — it is the reason a patch job stays a patch job instead of becoming a fire with the crew still inside the vessel it started in."],
  ["meter-alarms", "powerhouse", -540, 800, "confined-rescue", "meter-alarms", "A space that was inside the band twenty minutes ago is not inside it now."],
  ["isolate", "powerhouse", -590, 760, "confined-rescue", "isolate", "A closed valve is still a valve somebody else can open from a panel that has no idea a rescue is underway below it."],
  ["zero-energy", "dam", -820, 500, "uw-intake-screen-cleaning-with-lockout", "verify-zero-energy", "A lockout is not proven by looking at the breaker — it is proven by trying to start whatever it feeds and watching nothing happen."],
  ["hydro-ramp", "dam", -660, 470, "ib-hydrostatic-test-and-inspector-witness", "pressurize-ramp", "A steady ramp gives every joint in the system time to show a problem gradually — a weep, a seep, a fitting working loose — while the pressure is still low enough to shut the pump down safely."],
  ["damage-read", "avalanche-gallery", 320, 320, "gk-storm-cleanup-chipper-and-traffic-control", "read-damage-assessment", "The damage assessment is where the first crew through already noted what looked dangerous — reading it before setup means today's crew is working from what was actually found, not discovering the same hazards again from scratch."],
  ["grade-sign", "pass-summit", 470, -130, "drive-mountain-grade-and-engine-brake", "drm-sign", "A grade is driven with the numbers on its sign, read before the crest: how steep it is, how far it runs, the speed trucks are advised to hold and where the escape ramp is."],
  ["crest-gear", "pass-summit", 430, -170, "drive-mountain-grade-and-engine-brake", "drm-crest", "The gear for the descent is chosen at the top, while the rig is still slow enough to shift easily."],
  ["descent", "far-gate", 1420, -1280, "drive-mountain-grade-and-engine-brake", "drm-descent", "Down the grade the engine brake carries the load and the service brakes are for the moments it cannot."],
  ["taper", "pass-road", 40, 720, "traffic-incident-management", "taper-length", "A taper is a calculation, not a feel."],
  ["arrow-board", "avalanche-gallery", 280, 280, "traffic-incident-management", "arrow-board", "Cones tell a driver something is wrong; an arrow tells them what to do about it, from far enough back to do it calmly."],
  ["shotcrete-clear", "tunnel-portal", 620, -540, "cm-shotcrete-nozzle-and-rebound", "clear-crew", "A charged shotcrete line delivers mix and rebound at the same velocity the moment the trigger is pulled, and nobody standing close to the panel for a last-minute look has any warning before that happens."],
  ["locate-marks", "tunnel-portal", 570, -590, "op-excavator-trench-and-utility-locate", "verify-marks", "A mark on the ground only means what a competent locate put there, and paint that is faded, contradictory or unfinished is not that — it is a line whose real position nobody has actually confirmed today."],
  ["sills", "tunnel-portal", 640, -600, "scaffold-erection", "sills", "The sill spreads the leg load over the ground; the base plate sits on the sill, never on the ground or a block."],
  ["own-lock", "gondola-shop", -220, -280, "ew-machine-room-lockout-and-brake-test", "lock", "Your padlock is the only thing on this switch that only you can take off, and that is the entire point of fitting it before a caliper or a feeler gauge ever touches the brake."],
  ["verify-zero", "gondola-shop", -270, -320, "ew-machine-room-lockout-and-brake-test", "verify-zero", "A locked-open switch describes what the switch is doing; it says nothing about what is happening at the terminals the meter actually touches."],
  ["spot-weather", "west-lookout", -1490, -670, "wildland-urban-interface", "weather-brief", "Everything the crew is about to commit to this structure is a bet against what the fire does in the next hour, and the spot weather forecast is the best information anybody has about that bet before conditions actually change."],
  ["honest-answer", "ranger-station", -1250, 310, "psychological-first-aid", "honest-information", "The honest answer, including 'we don't know yet,' respects a person more than a comforting guess does, and it is the only answer that will still be true the next time she asks somebody else the same question."],
  ["scba", "water-plant", -1020, 1080, "chlorine-room", "scba", "Nobody works a chlorine cylinder alone in this room."],
  ["vent-first", "water-plant", -1080, 1020, "lift-station", "gas", "Testing through the vent with the hatch still closed means the first reading is taken with nobody's face anywhere near the opening it turns out to be bad news at."],
  ["lift-plan", "pass-road", -30, 680, "op-compactor-lift-thickness-and-edge", "lift-plan", "The compaction spec sets the loose lift thickness this drum can actually compact all the way through — a lift built thicker than the spec allows can look fully rolled on top while the bottom of it stays loose the whole time."],
  ["walkaround", "valley-base", -1480, 1470, "or-ranch-road-grading-and-culvert", "equipment-find", "A worn edge or a blocked camera found at the walkaround gets fixed in the yard with the machine shut down; the same defect found mid-pass is a defect the operator is working around instead of one that got fixed."],
];

/** Eggs hidden behind a skill gate (the frontier brief's gate contract). */
const SM_EGG_GATES = {
  "tether-tools": { stations: ["tower-climb"], note: "Finish the tower climb to find the note the climbers left at the summit." },
  "fall-plan": { stations: ["fp-anchor-selection-and-rescue-plan"], note: "Anchor selection and a rescue plan before the top station's edge." },
  "spot-weather": { stations: ["wildland-urban-interface"], note: "The lookout's weather note opens after the wildland-urban interface station." },
};

function smPlaceName(id) {
  return (SM_SITES.find((s) => s.id === id) ?? SM_LANDMARKS.find((l) => l.id === id))?.name ?? id;
}

export const SM_EGGS = SM_EGG_TABLE.map(([slug, place, x, z, stationId, stepId, lesson]) => {
  const landmark = smPlaceName(place);
  const egg = {
    id: `sm-egg-${slug}`,
    title: `Field Note — ${landmark}`,
    giver: "found, not given",
    site: landmark,
    kind: "egg",
    tier: 0,
    requires: null,
    landmark,
    place,
    at: [x, z],
    method: "goto",
    cites: { app: "smartcity", stationId, stepId },
    lesson,
    reward: { xp: 25, badge: "Field Note" },
    steps: [
      { type: "goto", target: landmark, text: `Walk to ${landmark} and look for the stone cairn.` },
      { type: "find", target: `sm-egg-${slug}`, text: `Under the top stone of the cairn near ${landmark}, a field note reads: "${lesson}"` },
    ],
  };
  if (SM_EGG_GATES[slug]) egg.gate = SM_EGG_GATES[slug];
  return egg;
});

// ------------------------------------------------------------ field lessons
//
// SCHOLAR-2's field-lesson schema was not merged when this world was built,
// so this one is documented here and kept compatible in spirit: a 2-4 minute
// micro-lesson at a landmark, tied to a K-12 station and to the trade that
// uses the idea, ending in one check question.
//   { id, title, k12, trade, place, at, minutes, steps: [text…],
//     check: { q, choices: [text…], answer: index }, station }

export const SM_FIELD_LESSONS = [
  { id: "sm-fl-contours", title: "Reading contour lines", k12: "k12-reading-a-map-scale-in-bay-world", trade: "Trail crews and rangers read contours to plan a route that avoids the steepest ground.",
    place: "ranger-station", at: [-1210, 270], minutes: 3, station: "or-wildland-fireline-construction-and-lookout",
    steps: ["A contour line joins points on the map that are at the same height.", "Where contour lines crowd close together the ground is steep; where they spread apart it is gentle.", "Open the map (M) and find the lookout trail: it climbs where the lines are spread, not straight up where they crowd."],
    check: { q: "Contour lines packed close together mean the ground is…", choices: ["Steep", "Flat", "Under water"], answer: 0 } },
  { id: "sm-fl-scale", title: "Map scale and distance", k12: "k12-reading-a-map-scale-in-bay-world", trade: "A road crew measures a work zone off the plan sheet with its scale bar.",
    place: "valley-base", at: [-1520, 1430], minutes: 2, station: "gk-storm-cleanup-chipper-and-traffic-control",
    steps: ["A map's scale says how many metres on the ground one unit on the map stands for.", "This world's map is square and the world is 4096 m across, so half the map's width is 2048 m of walking.", "Estimate the walk to the water plant on the map, then walk it and compare with the distance on the HUD."],
    check: { q: "If the map is 4096 m across, a quarter of its width is…", choices: ["1024 m", "2048 m", "512 m"], answer: 0 } },
  { id: "sm-fl-falling-water", title: "Falling water as stored energy", k12: "k12-energy-transfer-at-the-wind-farm", trade: "Plant operators at a powerhouse watch water's stored energy become electrical energy.",
    place: "powerhouse", at: [-540, 760], minutes: 3, station: "ib-hydrostatic-test-and-inspector-witness",
    steps: ["Water held high behind a dam has stored (potential) energy because of its height.", "As it falls through the penstock that energy becomes motion (kinetic energy).", "The moving water spins a turbine, and the turbine turns a generator that makes electrical energy — the same chain of transfers the wind-farm lesson follows with moving air."],
    check: { q: "Water behind a dam stores energy mainly because of its…", choices: ["Height", "Colour", "Temperature"], answer: 0 } },
  { id: "sm-fl-pressure-depth", title: "Pressure grows with depth", k12: "k12-buoyancy-and-pressure-in-the-deep", trade: "A diver clearing a dam intake and the engineer who designed the wall both plan for pressure that grows with depth.",
    place: "dam", at: [-740, 490], minutes: 3, station: "uw-intake-screen-cleaning-with-lockout",
    steps: ["Water pushes on everything in it, and the deeper you go the more water sits above you.", "That is why a dam wall is built thicker at the bottom than at the top.", "Look at the dam's face: it widens toward its base, where the push of the water is greatest."],
    check: { q: "Why is a dam thicker at the bottom?", choices: ["Water pressure is greatest at the bottom", "To save concrete at the top only", "Snow collects at the bottom"], answer: 0 } },
  { id: "sm-fl-water-cycle", title: "From snowpack to tap", k12: "k12-water-cycle-and-filtration", trade: "Water treatment operators treat the reservoir water that the mountain's snow and rain supply.",
    place: "water-plant", at: [-1070, 1070], minutes: 3, station: "chlorine-room",
    steps: ["Water evaporates, condenses into clouds and falls as rain or snow on the mountain.", "Snowmelt and rain run downhill into streams and the reservoir.", "At the treatment plant the water is filtered and disinfected before it goes to homes — the plant is one stop on the water cycle, not its end."],
    check: { q: "Snow on the summit reaches the reservoir mainly by…", choices: ["Melting and running downhill", "Being carried by trucks", "Blowing uphill"], answer: 0 } },
  { id: "sm-fl-circuit", title: "A complete circuit", k12: "k12-circuits-at-the-electrical-bench", trade: "Substation electricians open a breaker to break a circuit before anyone works on it.",
    place: "substation", at: [1030, 450], minutes: 3, station: "substation-switching",
    steps: ["Current only flows around a complete loop — a closed circuit.", "Opening a switch or a breaker breaks the loop, so current stops.", "That is why the switching order opens the circuit first, and then the crew proves it is dead before they touch it."],
    check: { q: "What happens to current when a breaker opens the circuit?", choices: ["It stops flowing in that circuit", "It doubles", "It flows faster"], answer: 0 } },
  { id: "sm-fl-labels", title: "Reading a hazard label", k12: "k12-reading-instructions-and-safety-labels", trade: "Water plant operators read a chemical's label and data sheet before a delivery is unloaded.",
    place: "water-plant", at: [-1030, 1030], minutes: 2, station: "ut-water-treatment-chemical-delivery-unloading",
    steps: ["A hazard label names the chemical, shows pictograms and a signal word, and says how to protect yourself.", "The label and the safety data sheet — not memory — say what protective equipment the job needs.", "Before any delivery, the crew reads the label on the load and matches it to the paperwork."],
    check: { q: "Where does the crew find the protection a chemical needs?", choices: ["On its label and data sheet", "By guessing from the colour", "From the truck's paint"], answer: 0 } },
  { id: "sm-fl-grade", title: "Grade as a ratio", k12: "k12-measuring-and-scaling-the-court", trade: "Drivers and road crews read a grade as rise over run, and the pass road's signs state it.",
    place: "pass-summit", at: [460, -120], minutes: 3, station: "drive-mountain-grade-and-engine-brake",
    steps: ["A road's grade is how much it rises for each unit it runs forward, written as a percentage.", "Rising 6 m over 100 m of road is a 6% grade; the same rise over 50 m is twice as steep.", "The HUD shows the slope under your feet: compare the switchbacks with the straight climb beside them."],
    check: { q: "A road that rises 5 m over 100 m has a grade of…", choices: ["5%", "50%", "20%"], answer: 0 } },
  { id: "sm-fl-incident-report", title: "Writing a clear trail report", k12: "k12-writing-a-clear-incident-report", trade: "Rangers and patrollers write what they saw, where and when — facts first, no guesses.",
    place: "west-lookout", at: [-1530, -700], minutes: 3, station: "or-transmission-line-right-of-way-patrol",
    steps: ["A clear report says what happened, where, when and who was involved.", "It sticks to what the writer saw, and says plainly what they do not know yet.", "From the lookout, write a one-line report of something you can see: the place, the time on the HUD clock, and what it is."],
    check: { q: "A good report sticks to…", choices: ["What the writer actually saw", "What might have happened", "Opinions about who is to blame"], answer: 0 } },
  { id: "sm-fl-call-for-help", title: "Calling for help on the mountain", k12: "k12-first-aid-awareness-call-for-help", trade: "Rangers and lift crews give a clear location first when they call for help.",
    place: "gondola-top", at: [140, -1170], minutes: 2, station: "ew-elevator-entrapment-and-rescue-with-fire-service",
    steps: ["When someone is hurt, make sure you are safe, then call for help.", "Say where you are first — a named place like 'the gondola top station' — so help can find you.", "Stay on the line and do what the call-taker asks."],
    check: { q: "What should you say first when calling for help?", choices: ["Where you are", "Your favourite colour", "Nothing, just hang up"], answer: 0 } },
];

// ------------------------------------------------------------------ quests
//
// The main arc (kind "main", chained by `requires`) and gated side quests
// (kind "side", each with a `gate` in the contract's schema). Step types are
// Bay World's: goto | station | find | talk.

export const SM_MAIN_QUESTS = [
  { id: "sm-main-00-arrive", title: "Up the Valley", giver: "the crew dispatcher", site: "valley-base", kind: "main", tier: 1, requires: null,
    steps: [{ type: "goto", target: "valley-base", text: "Check in at the valley base muster board." }, { type: "goto", target: "water-plant", text: "Walk up the valley road to the treatment plant." }], reward: { xp: 40, badge: "Valley Walker" } },
  { id: "sm-main-01-water", title: "Water Before Anything", giver: "the plant's lead operator", site: "water-plant", kind: "main", tier: 1, requires: "sm-main-00-arrive",
    steps: [{ type: "station", target: "chlorine-room", text: "Run the chlorine room changeout from the plant's job board." }], reward: { xp: 60, badge: "Plant Hand" } },
  { id: "sm-main-02-dam", title: "Behind the Wall", giver: "the dam's plant supervisor", site: "dam", kind: "main", tier: 2, requires: "sm-main-01-water",
    steps: [{ type: "goto", target: "dam", text: "Follow the service road up to the dam." }, { type: "station", target: "uw-intake-screen-cleaning-with-lockout", text: "Lock out the intake before the screen is cleaned." }], reward: { xp: 80, badge: "Dam Crew" } },
  { id: "sm-main-03-ranger", title: "The Trail Register", giver: "the duty ranger", site: "ranger-station", kind: "main", tier: 2, requires: "sm-main-02-dam",
    steps: [{ type: "goto", target: "ranger-station", text: "Sign the trail register at the ranger station." }, { type: "goto", target: "west-lookout", text: "Hike to the West Ridge Lookout." }], reward: { xp: 80, badge: "Lookout" } },
  { id: "sm-main-04-road", title: "Keep the Pass Open", giver: "the road crew foreman", site: "pass-road", kind: "main", tier: 3, requires: "sm-main-03-ranger",
    steps: [{ type: "goto", target: "pass-road", text: "Report to the pass road crew yard." }, { type: "station", target: "drive-mountain-grade-and-engine-brake", text: "Take the mountain grade the way the sign says." }], reward: { xp: 100, badge: "Pass Crew" } },
  { id: "sm-main-05-tunnel", title: "Under the Ridge", giver: "the portal's heading boss", site: "tunnel-portal", kind: "main", tier: 3, requires: "sm-main-04-road",
    steps: [{ type: "goto", target: "tunnel-portal", text: "Drive or walk up to the tunnel portal." }, { type: "station", target: "cm-shotcrete-nozzle-and-rebound", text: "Clear the crew and shoot the portal face." }], reward: { xp: 100, badge: "Portal Crew" } },
  { id: "sm-main-06-lines", title: "Power Off the Ridge", giver: "the substation's switching operator", site: "substation", kind: "main", tier: 4, requires: "sm-main-05-tunnel",
    steps: [{ type: "station", target: "substation-switching", text: "Switch the substation with an order and a read-back." }, { type: "goto", target: "ridge-line", text: "Climb to the ridge line crew's pad." }], reward: { xp: 120, badge: "Ridge Crew" } },
  { id: "sm-main-07-gondola", title: "The Lift Before the Guests", giver: "the lift's lead mechanic", site: "gondola-shop", kind: "main", tier: 4, requires: "sm-main-06-lines",
    steps: [{ type: "station", target: "ew-machine-room-lockout-and-brake-test", text: "Lock out the drive and test the brake." }], reward: { xp: 120, badge: "Lift Crew" } },
  { id: "sm-main-08-summit", title: "Every Site From the Top", giver: "the whole mountain", site: "summit-lookout", kind: "main", tier: 5, requires: "sm-main-07-gondola",
    steps: [{ type: "goto", target: "summit-lookout", text: "Stand at the summit lookout and pick out every site you worked." }], reward: { xp: 200, badge: "Sierra Summit" } },
];

export const SM_SIDE_QUESTS = [
  { id: "sm-side-night-patrol", title: "Night Patrol on the Ridge", giver: "the line crew foreman", site: "ridge-line", kind: "side", tier: 3, requires: null,
    gate: { stations: ["line-truck"], note: "Rubber goods and the tailboard first: finish the line truck station." },
    steps: [{ type: "goto", target: "ridge-line", text: "Walk the ridge towers at dusk with the patrol log." }, { type: "station", target: "or-transmission-line-right-of-way-patrol", text: "Patrol the right-of-way." }], reward: { xp: 90, badge: "Night Patrol", cosmetic: "reflective-vest-stripe" } },
  { id: "sm-side-cabin-rescue", title: "Cabin Rescue Drill", giver: "the lift's rescue lead", site: "gondola-shop", kind: "side", tier: 3, requires: null,
    gate: { stations: ["ew-machine-room-lockout-and-brake-test"], note: "Lockout and the brake test come before any rescue drill on the lift." },
    steps: [{ type: "station", target: "ew-elevator-entrapment-and-rescue-with-fire-service", text: "Run the entrapment and rescue drill with the fire service." }], reward: { xp: 90, badge: "Rescue Ready", cosmetic: "helmet-sticker-cabin" } },
  { id: "sm-side-avalanche-control", title: "Avalanche-Season Traffic Control", giver: "the road crew foreman", site: "pass-road", kind: "side", tier: 3, requires: null,
    gate: { stations: ["traffic-incident-management"], note: "Set a taper the way the plan calculates it before winter traffic control." },
    steps: [{ type: "goto", target: "avalanche-gallery", text: "Walk to the chute sign where the winter plan starts." }, { type: "station", target: "gk-storm-cleanup-chipper-and-traffic-control", text: "Clear storm debris behind a proper work zone." }], reward: { xp: 90, badge: "Winter Road", cosmetic: "beanie-orange" } },
  { id: "sm-side-penstock-walk", title: "Penstock Inspection Walk", giver: "the dam's plant supervisor", site: "dam", kind: "side", tier: 3, requires: null,
    gate: { stations: ["uw-intake-screen-cleaning-with-lockout", "ib-hydrostatic-test-and-inspector-witness"], note: "Lockout at the intake and a witnessed hydrotest before the penstock walk." },
    steps: [{ type: "goto", target: "powerhouse", text: "Walk the penstock down to the powerhouse." }, { type: "station", target: "confined-rescue", text: "Rehearse the confined-space rescue plan at the powerhouse." }], reward: { xp: 100, badge: "Penstock Walker", cosmetic: "gloves-blue" } },
  { id: "sm-side-fire-lookout", title: "Fire Lookout Watch", giver: "the duty ranger", site: "ranger-station", kind: "side", tier: 2, requires: "sm-main-03-ranger",
    gate: { stations: ["or-wildland-fireline-construction-and-lookout"], note: "Fireline construction and lookouts first: the watch is a crew job." },
    steps: [{ type: "goto", target: "west-lookout", text: "Take the watch at the West Ridge Lookout." }, { type: "station", target: "wildland-urban-interface", text: "Walk the wildland-urban interface plan with the engine crew." }], reward: { xp: 90, badge: "Fire Lookout", cosmetic: "bandana-green" } },
  { id: "sm-side-portal-trench", title: "Utility Trench at the Portal", giver: "the portal's heading boss", site: "tunnel-portal", kind: "side", tier: 3, requires: null,
    gate: { stations: ["op-excavator-trench-and-utility-locate"], note: "Verify the locate marks before any digging at the portal." },
    steps: [{ type: "station", target: "scaffold-erection", text: "Build the headwall scaffold on proper sills." }], reward: { xp: 90, badge: "Portal Trench", cosmetic: "hardhat-decal-portal" } },
  { id: "sm-side-arc-labels", title: "Every Door Has a Label", giver: "the substation's switching operator", site: "substation", kind: "side", tier: 3, requires: null,
    gate: { stations: ["substation-switching"], programmes: [{ id: "electrical-first-period", minStars: 1 }], note: "Switching first; the label study builds on it." },
    steps: [{ type: "station", target: "arc-flash-label-study", text: "Walk the line-up and study every arc-flash label." }], reward: { xp: 90, badge: "Label Reader", cosmetic: "arc-hood-trim" } },
  { id: "sm-side-plant-delivery", title: "The Morning Delivery", giver: "the plant's lead operator", site: "water-plant", kind: "side", tier: 2, requires: "sm-main-01-water",
    gate: { stations: ["chlorine-room"], k12: ["k12-reading-instructions-and-safety-labels"], note: "The chlorine room and the safety-labels lesson before a chemical delivery." },
    steps: [{ type: "station", target: "ut-water-treatment-chemical-delivery-unloading", text: "Receive and unload the chemical delivery." }], reward: { xp: 80, badge: "Delivery Hand", cosmetic: "apron-teal" } },
];

// -------------------------------------------------------------- activities
//
// Two scored activities, both scored on safe practice, never on speed alone:
// the orienteering course (map checks at every control, staying on the trail,
// turning back if the weather turns) and the survey route (logging every
// point while keeping out of the marked avalanche-terrain zones).

export const SM_ACTIVITIES = [
  { id: "sm-act-lookout-orienteering", name: "Hike to the Lookout — Orienteering", kind: "orienteering", start: "ranger-station",
    controls: [[-1300, 100], [-1380, -150], [-1450, -400], [-1510, -690]], trail: "lookout-trail", offTrailMetres: 25,
    scoring: { control: 20, mapCheck: 5, offTrailPenalty: 2, signOut: 10 },
    blurb: "Sign out at the register, then find four controls up the lookout trail. Each control scores when you reach it and check the map there (M); leaving the trail costs points; signing back in at the station finishes the course." },
  { id: "sm-act-snowfield-survey", name: "Snowfield Survey Route", kind: "survey", start: "gondola-top",
    points: [[260, -1250], [400, -1400], [560, -1470], [700, -1560], [860, -1600], [980, -1520]],
    avoid: [{ at: [480, -1600], r: 90, note: "Marked avalanche terrain — the route plan keeps you out" }, { at: [800, -1420], r: 80, note: "Cornice edge — stay back per the plan" }],
    scoring: { point: 15, zoneEntryPenalty: 25, buddyCheck: 5 },
    blurb: "A snowcat-free survey on foot from the gondola top: log six survey points in order and radio a buddy check at each; stepping into a marked avalanche zone costs more than any point is worth." },
];

/** Every gated item in this world, for tools/check_gates.mjs (QUESTMASTER). */
export const SM_GATED = [
  ...SM_SIDE_QUESTS.filter((q) => q.gate).map((q) => ({ id: q.id, kind: "quest", gate: q.gate })),
  ...SM_EGGS.filter((e) => e.gate).map((e) => ({ id: e.id, kind: "egg", gate: e.gate })),
];

/** A site or landmark by id. */
export function smPlace(id) { return SM_SITES.find((s) => s.id === id) ?? SM_LANDMARKS.find((l) => l.id === id) ?? null; }
