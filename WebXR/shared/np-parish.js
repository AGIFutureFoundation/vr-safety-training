// The parish world engine's pure half (console PARISH, docs/consoles/PARISH.md):
// everything a parish map on the shared schema (NP_<PARISH> in
// shared/np-data-<parish>.js) needs computed without three.js or the DOM —
// the flat delta height field with its levees and water beds, the water and
// district tests, the streamed 256 m chunk grid with its LOD rings, the
// deterministic block massing per district character, a polygon
// triangulator for the water bodies, a triangle estimate against the mobile
// budget, and the validator tools/check_parishes.mjs and DELTA's own modules
// run. shared/np-world.js is the three.js builder over this.
//
// Frame: x east, z south (north is -z), the field [-size/2, size/2]², water
// at y = 0, dry ground about NP_GROUND, water beds cut to NP_BED. Nothing here
// is a claim about a real place — the height field is a generic delta.
//
// Every top-level name is prefixed np/NP_ (the bundler concatenates all
// modules into one scope).

export const NP_SIZE = 4096;
export const NP_CHUNK = 256;
export const NP_CHUNKS_PER_SIDE = NP_SIZE / NP_CHUNK;
/** Grid segments per chunk at each LOD ring (0 = the player's chunk and its neighbours); a delta is flat, so few are needed. */
export const NP_LOD_SEGMENTS = [16, 12, 8, 4];
/** Chunks kept loaded around the player, per quality tier (Chebyshev radius). */
export const NP_STREAM_RADIUS = { low: 2, balanced: 3, high: 3 };
/** Chunk rings that carry the district massing (blocks, houses, oaks, sheds, cranes), per tier. */
export const NP_MASS_RADIUS = { low: 1, balanced: 2, high: 2 };
/** Heights (metres): dry ground, the water surface, a water bed, the natural-levee rise beside a river. */
export const NP_GROUND = 0.8;
export const NP_WATER_Y = 0;
export const NP_BED = -3;
export const NP_NATURAL_LEVEE = 1.6;
/** A levee's trapezoid: crest half-width and the batter (run) each side, in metres. */
export const NP_LEVEE_CREST = 3;
export const NP_LEVEE_BATTER = 22;
/** A site's flattened pad radius and the blend beyond it. */
export const NP_PAD = 40;
/** Mesh and triangle budget the builder is held to on a phone (tools/check_parishes.mjs). */
export const NP_BUDGET = { drawCalls: 260, triangles: 400000, chunksLoaded: 49 };
/** The road kinds: ribbon width and colour; a bridge or causeway is an elevated deck, a ferry a water route. */
export const NP_ROAD_KINDS = {
  interstate: { width: 22, colour: 0x3a3d42, lift: 0.3 },
  avenue: { width: 16, colour: 0x4b4d52, lift: 0.25 },
  street: { width: 9, colour: 0x585a5e, lift: 0.2 },
  riverroad: { width: 8, colour: 0x8a7a5c, lift: 0.2 },
  bridge: { width: 14, colour: 0x6f7378, lift: 0.4, clearance: 24 },
  causeway: { width: 14, colour: 0x6f7378, lift: 0.4, clearance: 8 },
  ferry: { width: 0, colour: 0x9fd6ee, lift: 0 },
};
/** The water kinds and their colours. */
export const NP_WATER_KINDS = { river: 0x6b7c68, lake: 0x4f8ea6, canal: 0x5b7f8a, bayou: 0x4f6f5a, wetland: 0x557a6a, gulf: 0x3f7f9c, bay: 0x3f7892, ocean: 0x2f6a8c };
/** The open-water kinds (a polygon a site never sits in): a lake, the gulf, a bay, the ocean. */
export const NP_OPEN_WATER = ["lake", "gulf", "bay", "ocean"];
/** A hill's limits (console GOLDEN-A): radius and height in map metres, and the steepest mean flank a mound may have. */
export const NP_HILL = { minRadius: 80, maxRadius: 1500, maxHeight: 120, maxSlope: 0.35 };
/** The district characters the massing knows (the brief's enum plus "downtown" for a central business district and "park" — trees, no buildings — for a city park, console GOLDEN-A). */
export const NP_CHARACTERS = ["quarter", "garden", "industrial", "suburb", "port", "wetland", "refinery", "campus", "downtown", "park"];
/** The connector kinds; a `world` connector's far end is another world's page (GOLDEN-B, shared/sg-ways.js). */
export const NP_CONNECTOR_KINDS = ["bridge", "causeway", "ferry", "road", "world"];
/** The worlds a `world` connector may lead to, and the page each opens with `?site=` (source layout, relative to WebXR/parishes/). */
export const NP_WAY_WORLDS = { bayworld: "../bayworld/index.html" };

/** Triangles per massing part, by kind (the builder's geometries). */
export const NP_TRI = {
  quarterBlock: 24, gardenHouse: 20, liveOak: 60, shed: 12, crane: 60, suburbHouse: 20, tower: 12, campusBlock: 12,
  cypress: 28, reed: 6, tank: 40, stack: 24, bridgePier: 12, sign: 24,
};

/**
 * Terrain hooks another module may set (console TERRAFORM): `cut(parish, x, z, h, water) -> h` carves channels and banks
 * into the ground before the levees and pads, `wet(parish, x, z) -> 0..1` marks the shoreline strip for the ground colour.
 * Console RELIEF: `relief(parish, x, z) -> metres` is real-ground relief already scaled into the map's schematic range
 * (shared/rl-relief.js, from Mapbox Terrain-RGB, only with a viewer's token); the dry ground rises by the higher of it and
 * the named hills, pads terrace at that height and water beds ignore it, so water stays level.
 * Unset (null), the height field is exactly the delta above.
 */
export const NP_TERRAIN_HOOKS = { cut: null, wet: null, relief: null };

// ------------------------------------------------------------------ maths

const npClamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const npSmooth = (e0, e1, v) => { const t = npClamp((v - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

/** A small seeded RNG (mulberry32). */
export function npRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function npHash(ix, iz, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(seed, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function npValueNoise(x, z, seed) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = npHash(ix, iz, seed), b = npHash(ix + 1, iz, seed), c = npHash(ix, iz + 1, seed), d = npHash(ix + 1, iz + 1, seed);
  return (a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz) * 2 - 1;
}

/** Distance from (x, z) to a polyline; returns { d, t } with t the along-line fraction. */
export function npPolyDistance(x, z, pts) {
  let best = Infinity, bestAlong = 0, run = 0, total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, L = Math.sqrt(L2);
    const u = L2 ? npClamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1) : 0;
    const d = Math.hypot(x - (ax + dx * u), z - (az + dz * u));
    if (d < best) { best = d; bestAlong = (run + u * L) / (total || 1); }
    run += L;
  }
  return { d: best, t: bestAlong };
}

/**
 * Distance only from (x, z) to a polyline (console REACTOR): the same arithmetic as npPolyDistance's `d`, bit for bit,
 * without the along-line total or an object per call — the hot terrain queries need only the distance.
 */
export function npPolyDist(x, z, pts) {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], ax = a[0], az = a[1];
    const dx = b[0] - ax, dz = b[1] - az, L2 = dx * dx + dz * dz;
    const u = L2 ? npClamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1) : 0;
    const d = Math.hypot(x - (ax + dx * u), z - (az + dz * u));
    if (d < best) best = d;
  }
  return best;
}
/** Distance from (x, z) to the segment a–b, npPolyDist's arithmetic on one segment. */
function npSegDist(x, z, a, b) {
  const ax = a[0], az = a[1], dx = b[0] - ax, dz = b[1] - az, L2 = dx * dx + dz * dz;
  const u = L2 ? npClamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1) : 0;
  return Math.hypot(x - (ax + dx * u), z - (az + dz * u));
}
/** A polyline's box, cached on the points array (npBBox's shape). */
const npBoxCache = new WeakMap();
function npPtsBox(pts) {
  let b = npBoxCache.get(pts);
  if (!b) { b = npBBox(pts); npBoxCache.set(pts, b); }
  return b;
}
/** Strictly outside box `b` grown by `pad`: then every point of the polyline is farther than `pad` from (x, z). */
const npOutside = (b, x, z, pad) => x < b.minX - pad || x > b.maxX + pad || z < b.minZ - pad || z > b.maxZ + pad;

/** The length of a polyline in metres. */
export function npPolyLength(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }

/** The point at an along-line fraction t: { x, z, yaw } (yaw faces the direction of travel). */
export function npPolyPointAt(pts, t) {
  const total = npPolyLength(pts), d = npClamp(t, 0, 1) * total;
  let run = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i], L = Math.hypot(bx - ax, bz - az);
    if (run + L >= d || i === pts.length - 1) {
      const u = L ? npClamp((d - run) / L, 0, 1) : 0;
      return { x: ax + (bx - ax) * u, z: az + (bz - az) * u, yaw: Math.atan2(bx - ax, bz - az) };
    }
    run += L;
  }
  return { x: pts[0][0], z: pts[0][1], yaw: 0 };
}

/** Points along a polyline every `spacing` metres (the first and last included). */
export function npPointsAlong(pts, spacing) {
  const out = [];
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / spacing));
    for (let k = i === 1 ? 0 : 1; k <= n; k++) out.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]);
  }
  return out;
}

/** Even-odd point-in-polygon test. */
export function npPointInPoly(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / ((zj - zi) || 1e-12) + xi) inside = !inside;
  }
  return inside;
}

/** A polygon's bounding box `{ minX, maxX, minZ, maxZ }`. */
export function npBBox(poly) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [x, z] of poly) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (z < minZ) minZ = z; if (z > maxZ) maxZ = z; }
  return { minX, maxX, minZ, maxZ };
}

/** The signed area of a polygon (positive when wound counter-clockwise in x/z). */
export function npPolyArea(poly) {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
  return a / 2;
}

/** A closed strip polygon around a centreline of `width` (the river, a canal). */
export function npStripFromCentreline(pts, width) {
  const w = width / 2, left = [], right = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L, nz = dx / L;
    left.push([pts[i][0] + nx * w, pts[i][1] + nz * w]); right.push([pts[i][0] - nx * w, pts[i][1] - nz * w]);
  }
  return [...left, ...right.reverse()];
}

/**
 * Ear-clipping triangulation of a simple polygon: returns index triples into
 * `poly`, wound so the face normal points up (+y) in the x/z frame the
 * builder uses. Degenerate ears are skipped; a polygon that will not clip
 * falls back to a fan so nothing is ever left without a surface.
 */
export function npTriangulate(poly) {
  const n = poly.length;
  if (n < 3) return [];
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(i);
  if (npPolyArea(poly) < 0) idx.reverse();
  const tris = [];
  const cross = (a, b, c) => (poly[b][0] - poly[a][0]) * (poly[c][1] - poly[a][1]) - (poly[b][1] - poly[a][1]) * (poly[c][0] - poly[a][0]);
  const inTri = (p, a, b, c) => {
    const d1 = cross(a, b, p), d2 = cross(b, c, p), d3 = cross(c, a, p);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  let guard = 0;
  while (idx.length > 3 && guard++ < 4 * n * n) {
    let clipped = false;
    for (let i = 0; i < idx.length; i++) {
      const a = idx[(i + idx.length - 1) % idx.length], b = idx[i], c = idx[(i + 1) % idx.length];
      if (cross(a, b, c) <= 1e-9) continue;
      let ear = true;
      for (const p of idx) { if (p === a || p === b || p === c) continue; if (inTri(p, a, b, c)) { ear = false; break; } }
      if (!ear) continue;
      tris.push([a, b, c]); idx.splice(i, 1); clipped = true; break;
    }
    if (!clipped) break;
  }
  if (idx.length === 3) tris.push([idx[0], idx[1], idx[2]]);
  else if (idx.length > 3) for (let i = 1; i < idx.length - 1; i++) tris.push([idx[0], idx[i], idx[i + 1]]);
  // In the x/z frame a counter-clockwise (positive-area) triangle seen from +y
  // is wound (a, c, b) for three.js's front face: swap to face up.
  return tris.map(([a, b, c]) => [a, c, b]);
}

// ------------------------------------------------------------------ prepared parish

const npPrepCache = new WeakMap();

/**
 * Derived structures for one parish, computed once: water polygons (strips
 * for centrelines), their boxes and colours, levee segments, districts with
 * boxes, site pads, the river centrelines (for the natural levee) and a
 * seed. Every query below reads this.
 */
export function npPrepare(parish) {
  const hit = npPrepCache.get(parish);
  if (hit) return hit;
  const water = (parish.water ?? []).map((w) => {
    const poly = w.width ? npStripFromCentreline(w.poly, w.width) : w.poly;
    return { ...w, shape: poly, bbox: npBBox(poly), colour: NP_WATER_KINDS[w.kind] ?? 0x4f8ea6, centre: w.width ? w.poly : null };
  });
  const districts = (parish.districts ?? []).map((d) => ({ ...d, bbox: npBBox(d.poly) }));
  const rivers = water.filter((w) => w.kind === "river" && w.centre);
  const seed = [...String(parish.id ?? "parish")].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const hills = (parish.hills ?? []).filter((h) => Array.isArray(h?.center) && h.radius > 0 && h.height > 0);
  const prep = { water, districts, rivers, hills, levees: parish.levees ?? [], roads: parish.roads ?? [], sites: parish.sites ?? [], seed, half: (parish.size ?? NP_SIZE) / 2 };
  npPrepCache.set(parish, prep);
  return prep;
}

// One-entry memos (console REACTOR): a terrain vertex asks the same point twice — npHeightAt, then npCoverAt for its
// colour — so the last answer per query is kept. Both queries are pure in (parish, x, z) over the cached npPrepare.
const npWaterMemo = { parish: null, x: NaN, z: NaN, w: null };
const npLeveeMemo = { parish: null, x: NaN, z: NaN, rise: 0 };

/** The water feature at (x, z), or null. */
export function npWaterAt(parish, x, z) {
  const m = npWaterMemo;
  if (m.parish === parish && m.x === x && m.z === z) return m.w;
  const { water } = npPrepare(parish);
  let hit = null;
  for (const w of water) {
    const b = w.bbox;
    if (x < b.minX || x > b.maxX || z < b.minZ || z > b.maxZ) continue;
    if (npPointInPoly(x, z, w.shape)) { hit = w; break; }
  }
  m.parish = parish; m.x = x; m.z = z; m.w = hit;
  return hit;
}

/** True over water (a wetland counts: it is walkable marsh in the builder, but not ground for a site or a road). */
export function npInWater(parish, x, z) { return npWaterAt(parish, x, z) !== null; }

/** The district containing (x, z), or null. */
export function npDistrictAt(parish, x, z) {
  const { districts } = npPrepare(parish);
  for (const d of districts) {
    const b = d.bbox;
    if (x < b.minX || x > b.maxX || z < b.minZ || z > b.maxZ) continue;
    if (npPointInPoly(x, z, d.poly)) return d;
  }
  return null;
}

/** The levee profile at (x, z): the highest crest contribution of any levee, in metres above ground. */
export function npLeveeRise(parish, x, z) {
  const m = npLeveeMemo;
  if (m.parish === parish && m.x === x && m.z === z) return m.rise;
  const rise = npLeveeRiseAt(parish, x, z);
  m.parish = parish; m.x = x; m.z = z; m.rise = rise;
  return rise;
}
function npLeveeRiseAt(parish, x, z) {
  let rise = 0;
  const reach = NP_LEVEE_CREST + NP_LEVEE_BATTER;
  for (const l of npPrepare(parish).levees) {
    if (npOutside(npPtsBox(l.pts), x, z, reach)) continue; // farther than the batter: no rise (REACTOR)
    const d = npPolyDist(x, z, l.pts);
    if (d > reach) continue;
    const k = d <= NP_LEVEE_CREST ? 1 : 1 - npSmooth(NP_LEVEE_CREST, NP_LEVEE_CREST + NP_LEVEE_BATTER, d);
    rise = Math.max(rise, (l.height ?? 4) * k);
  }
  return rise;
}

/**
 * The hills' rise at (x, z), in metres over the flat field (console GOLDEN-A):
 * each hill is a gentle procedural mound, a raised cosine from `height` at its
 * `center` to nothing at `radius`, with a faint ripple so a flank is not a
 * perfect bowl. Overlapping hills take the higher. Zero on a map with no hills
 * (every New Orleans parish), so the delta field is unchanged there. A hill is
 * a name on a mound, never a survey of the real one.
 */
export function npHillRise(parish, x, z) {
  const { hills, seed } = npPrepare(parish);
  let rise = 0;
  for (const hl of hills) {
    const d = Math.hypot(x - hl.center[0], z - hl.center[1]);
    if (d >= hl.radius) continue;
    const k = 0.5 * (1 + Math.cos((Math.PI * d) / hl.radius));
    rise = Math.max(rise, hl.height * k * (1 + 0.04 * npValueNoise(x / 60, z / 60, seed + 11) * (1 - k)));
  }
  return rise;
}

/**
 * BACKDROPS-2 (docs/geo.md §4): real relief from a committed USGS 3DEP height grid, opt-in per map. A map carries
 * `relief: "3dep"` in its data and np-parishes.js attaches `reliefGrid` ({ grid, heights: integer decimetres, row = z,
 * column = x, corners included, over the whole field }) from bd2-relief-data.js, which tools/geo_relief.py writes. Scaled
 * into the map's schematic range the way RELIEF's Mapbox relief is (rl-relief.js; the constants below equal its RL_
 * ones, check_geo proves it): the dry field's real range (2nd to 98th percentile, sea level at the bottom) squeezed under
 * the tallest named hill (3 m on a map with none) and never more than 0.5 map metres per real metre; faded to nothing
 * within 96 m of open water so water stays level with its banks; pads terrace at the rise (npHeightAt); water beds ignore
 * it. The heights shape the schematic ground only: no figure is ever quoted from them.
 */
export const NP_DEM = { flatCap: 3, maxRatio: 0.5, shore: 96, grid: 8, pLo: 0.02, pHi: 0.98 };
const npDemCache = new WeakMap();

/** The prepared 3DEP sampler for a map with `relief: "3dep"` and a grid, or null: { at(x, z), raw(x, z), lo, hi, scale, cap, cachedChunks() }. */
export function npDemSampler(parish) {
  if (parish?.relief !== "3dep" || !parish.reliefGrid) return null;
  let s = npDemCache.get(parish);
  if (s) return s;
  const { grid: G, heights } = parish.reliefGrid, half = (parish.size ?? NP_SIZE) / 2;
  /** Real metres at (x, z), bilinear between grid nodes. */
  const raw = (x, z) => {
    const u = npClamp((x + half) / (2 * half), 0, 1) * (G - 1), v = npClamp((z + half) / (2 * half), 0, 1) * (G - 1);
    const i = Math.min(G - 2, Math.floor(u)), j = Math.min(G - 2, Math.floor(v)), tu = u - i, tv = v - j;
    const a = heights[j * G + i], b = heights[j * G + i + 1], c = heights[(j + 1) * G + i], d = heights[(j + 1) * G + i + 1];
    return ((a * (1 - tu) + b * tu) * (1 - tv) + (c * (1 - tu) + d * tu) * tv) / 10;
  };
  const dry = [];
  for (let j = 0; j <= 32; j++) for (let i = 0; i <= 32; i++) {
    const x = -half + (i / 32) * half * 2, z = -half + (j / 32) * half * 2;
    if (!npWaterAt(parish, x, z)) dry.push(raw(x, z));
  }
  dry.sort((p, q) => p - q);
  const lo = Math.max(0, dry.length ? dry[Math.floor(NP_DEM.pLo * (dry.length - 1))] : 0);
  const hi = dry.length ? dry[Math.floor(NP_DEM.pHi * (dry.length - 1))] : lo;
  const hs = (parish.hills ?? []).map((h) => h.height).filter((h) => h > 0);
  const cap = hs.length ? Math.max(...hs) : NP_DEM.flatCap;
  const scale = Math.min(NP_DEM.maxRatio, cap / Math.max(1, hi - lo));
  const shoreFade = (x, z) => {
    if (npWaterAt(parish, x, z)) return 0;
    const ring = (r) => { for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; if (npWaterAt(parish, x + Math.cos(a) * r, z + Math.sin(a) * r)) return true; } return false; };
    if (!ring(NP_DEM.shore)) return 1;
    for (const r of [NP_DEM.shore / 4, NP_DEM.shore / 2, (NP_DEM.shore * 3) / 4]) if (ring(r)) return npSmooth(0, NP_DEM.shore, r);
    return npSmooth(0, NP_DEM.shore, NP_DEM.shore * 0.875);
  };
  // Per-chunk node grids (NP_DEM.grid + 1 nodes a side, 32 m apart), built on first use and cached by chunk key.
  const n = NP_DEM.grid + 1, step = NP_CHUNK / NP_DEM.grid, chunks = Math.ceil((half * 2) / NP_CHUNK), grids = new Map();
  const nodes = (ci, cj) => {
    const key = ci * 4096 + cj;
    let g = grids.get(key);
    if (g) return g;
    g = new Float32Array(n * n);
    const x0 = -half + ci * NP_CHUNK, z0 = -half + cj * NP_CHUNK;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = x0 + i * step, z = z0 + j * step;
      const v = npClamp((raw(x, z) - lo) * scale, 0, cap);
      g[j * n + i] = v > 0 ? v * shoreFade(x, z) : 0;
    }
    grids.set(key, g);
    return g;
  };
  const at = (x, z) => {
    const fx = npClamp(x + half, 0, half * 2 - 1e-6) / NP_CHUNK, fz = npClamp(z + half, 0, half * 2 - 1e-6) / NP_CHUNK;
    const ci = Math.min(chunks - 1, Math.floor(fx)), cj = Math.min(chunks - 1, Math.floor(fz));
    const g = nodes(ci, cj), u = (fx - ci) * NP_DEM.grid, v = (fz - cj) * NP_DEM.grid;
    const i = Math.min(NP_DEM.grid - 1, Math.floor(u)), j = Math.min(NP_DEM.grid - 1, Math.floor(v)), tu = u - i, tv = v - j;
    const a = g[j * n + i], b = g[j * n + i + 1], c = g[(j + 1) * n + i], d = g[(j + 1) * n + i + 1];
    return (a * (1 - tu) + b * tu) * (1 - tv) + (c * (1 - tu) + d * tu) * tv;
  };
  s = { at, raw, lo, hi, scale, cap, cachedChunks: () => grids.size };
  npDemCache.set(parish, s);
  return s;
}

/** The 3DEP rise (map metres) at (x, z); 0 on a map without committed relief. */
export function npDemRise(parish, x, z) {
  const s = npDemSampler(parish);
  return s ? s.at(x, z) : 0;
}

/** The hill a point stands on (the one raising it most), or null. */
export function npHillAt(parish, x, z) {
  let best = null, bh = 0.05;
  for (const hl of npPrepare(parish).hills) {
    const d = Math.hypot(x - hl.center[0], z - hl.center[1]);
    if (d >= hl.radius) continue;
    const h = hl.height * 0.5 * (1 + Math.cos((Math.PI * d) / hl.radius));
    if (h > bh) { bh = h; best = hl; }
  }
  return best;
}

/**
 * The ground's rise over the flat field at (x, z): the named hills, or — when RELIEF's hook carries a viewer's Mapbox
 * relief — the higher of the hills and that relief. Exactly npHillRise when the hook is unset.
 */
export function npGroundRise(parish, x, z) {
  const hill = npHillRise(parish, x, z);
  // BACKDROPS-2: a map with committed 3DEP relief uses it (the higher of it and the hills); the Mapbox hook never stacks on it.
  if (parish?.relief === "3dep" && parish.reliefGrid) { const d = npDemRise(parish, x, z); return d > hill ? d : hill; }
  if (!NP_TERRAIN_HOOKS.relief) return hill;
  const rel = NP_TERRAIN_HOOKS.relief(parish, x, z);
  return rel > hill ? rel : hill;
}

/** The dry ground before levees and water: a flat delta with a gentle rise beside each river, and any hills. */
function npBaseGround(parish, x, z) {
  const { rivers, seed } = npPrepare(parish);
  let h = NP_GROUND + npValueNoise(x / 90, z / 90, seed) * 0.25 + npValueNoise(x / 700, z / 700, seed + 1) * 0.35 + npGroundRise(parish, x, z);
  for (const r of rivers) {
    const bank = r.width / 2;
    if (npOutside(npPtsBox(r.centre), x, z, bank + 320)) continue; // beyond the natural levee (REACTOR)
    const d = npPolyDist(x, z, r.centre);
    if (d < bank + 320) h += NP_NATURAL_LEVEE * (1 - npSmooth(bank, bank + 320, d));
  }
  return h;
}

/**
 * Terrain height (metres) at (x, z): the one field every consumer samples.
 * Water beds are cut to NP_BED with a short bank, levees rise as trapezoids,
 * and each site's pad is flattened to NP_GROUND — or, on a hill, to the
 * hill's height at the site's centre, so the pad is a terrace, not a pit.
 */
export function npHeightAt(parish, x, z) {
  const prep = npPrepare(parish);
  let h = npBaseGround(parish, x, z);
  const w = npWaterAt(parish, x, z);
  if (w) {
    if (w.kind === "wetland") h = NP_WATER_Y - 0.35 + npValueNoise(x / 30, z / 30, prep.seed + 2) * 0.3;
    else {
      // The bank: a bed at NP_BED, rising to the water line within a few metres of the edge.
      let edge = Infinity;
      for (let i = 0, j = w.shape.length - 1; i < w.shape.length; j = i++) {
        const d = npSegDist(x, z, w.shape[j], w.shape[i]);
        if (d < edge) edge = d;
      }
      h = NP_BED + (NP_WATER_Y - 0.4 - NP_BED) * (1 - npSmooth(0, 12, edge));
    }
  }
  const lv = npLeveeRise(parish, x, z);
  // TERRAFORM's channel cut (shared/tf-terraform.js): streams, ditches and river banks; never under a levee.
  if (NP_TERRAIN_HOOKS.cut && lv < 0.3) h = NP_TERRAIN_HOOKS.cut(parish, x, z, h, w);
  h += lv;
  for (const s of prep.sites) {
    const d = Math.hypot(x - s.position[0], z - s.position[1]);
    if (d < NP_PAD * 1.8) { const pad = NP_GROUND + (prep.hills.length || NP_TERRAIN_HOOKS.relief || parish.reliefGrid ? npGroundRise(parish, s.position[0], s.position[1]) : 0); h = pad + (h - pad) * npSmooth(NP_PAD, NP_PAD * 1.8, d); }
  }
  return h;
}

/** Slope (rise over run) at (x, z), by central differences. */
export function npSlopeAt(parish, x, z, e = 3) {
  const dx = npHeightAt(parish, x + e, z) - npHeightAt(parish, x - e, z);
  const dz = npHeightAt(parish, x, z + e) - npHeightAt(parish, x, z - e);
  return Math.hypot(dx, dz) / (2 * e);
}

/** The nearest road (with its distance) to (x, z). */
export function npNearestRoad(parish, x, z) {
  let best = null, bd = Infinity;
  for (const r of npPrepare(parish).roads) { const d = npPolyDist(x, z, r.pts); if (d < bd) { bd = d; best = r; } }
  return { road: best, d: bd };
}

/** The widest road half-width on the map (cached): beyond it no road can claim a point as "road". */
const npReachCache = new WeakMap();
function npRoadReach(parish) {
  let r = npReachCache.get(parish);
  if (r === undefined) { r = 0; for (const rd of npPrepare(parish).roads) r = Math.max(r, (NP_ROAD_KINDS[rd.kind]?.width ?? 8) / 2); npReachCache.set(parish, r); }
  return r;
}

/** Ground cover at (x, z): "water" | "wetland" | "levee" | "road" | "pad" | a district character | "grass". */
export function npCoverAt(parish, x, z) {
  const w = npWaterAt(parish, x, z);
  if (w) return w.kind === "wetland" ? "wetland" : "water";
  if (npLeveeRise(parish, x, z) > 0.5) return "levee";
  // The nearest road decides (npNearestRoad's rule), but only a road nearer than the widest half-width can make this
  // "road", so roads whose box is farther than that are skipped — the same answer without measuring them (REACTOR).
  const reach = npRoadReach(parish);
  let road = null, d = Infinity;
  for (const r of npPrepare(parish).roads) {
    if (npOutside(npPtsBox(r.pts), x, z, reach)) continue;
    const e = npPolyDist(x, z, r.pts); if (e < d) { d = e; road = r; }
  }
  if (road && road.kind !== "ferry" && d < (NP_ROAD_KINDS[road.kind]?.width ?? 8) / 2) return "road";
  if (npPrepare(parish).sites.some((s) => Math.hypot(x - s.position[0], z - s.position[1]) < NP_PAD)) return "pad";
  return npDistrictAt(parish, x, z)?.character ?? "grass";
}

/** A site or landmark by id (either list), or null. */
export function npPlace(parish, id) {
  return (parish.sites ?? []).find((s) => s.id === id) ?? (parish.landmarks ?? []).find((l) => l.id === id) ?? null;
}

/** The point the learner starts from: the parish's `start` site, else the first site. */
export function npStartSite(parish) { return npPlace(parish, parish.start) ?? parish.sites?.[0] ?? null; }

// ------------------------------------------------------------------ bridges

/** A bridge or causeway deck's height above the water line at an along-road fraction: ramps over the first and last fifth. */
export function npDeckHeightAt(road, t) {
  const kind = NP_ROAD_KINDS[road.kind];
  if (!kind?.clearance) return 0;
  const ramp = npSmooth(0, 0.22, t) * (1 - npSmooth(0.78, 1, t));
  return NP_GROUND + kind.clearance * ramp;
}

/** The water kinds a plain road may cross on a short span (the engine bridges them); a river, lake or gulf needs a bridge, causeway or ferry. */
export const NP_SPANNABLE = ["canal", "bayou", "wetland"];

/**
 * The road surface height at an along-road fraction: the deck for a bridge
 * or causeway; over a canal, bayou or wetland a short flat span at bank
 * height; else the ground plus the ribbon lift.
 */
export function npRoadSurfaceAt(parish, road, t) {
  const p = npPolyPointAt(road.pts, t);
  const kind = NP_ROAD_KINDS[road.kind] ?? NP_ROAD_KINDS.street;
  const h = npHeightAt(parish, p.x, p.z);
  if (kind.clearance) return Math.max(h + kind.lift, npDeckHeightAt(road, t));
  const w = npWaterAt(parish, p.x, p.z);
  if (w && NP_SPANNABLE.includes(w.kind)) return Math.max(h, NP_GROUND + 1.4 + npLeveeRise(parish, p.x, p.z)) + kind.lift;
  return h + kind.lift;
}

/**
 * The samples (every 20 m) where a plain road stands in a river, lake or
 * gulf — water it may not cross without a bridge, causeway or ferry.
 * Returns `[{ x, z, water }]`; empty for a sound road.
 */
export function npRoadWet(parish, road) {
  if (NP_ROAD_KINDS[road.kind]?.clearance || road.kind === "ferry") return [];
  const out = [];
  for (const [x, z] of npPointsAlong(road.pts, 20)) {
    const w = npWaterAt(parish, x, z);
    if (w && !NP_SPANNABLE.includes(w.kind)) out.push({ x, z, water: w.id });
  }
  return out;
}

// ------------------------------------------------------------------ chunks

/** The chunk key and indices containing (x, z). */
export function npChunkOf(x, z) {
  const cx = npClamp(Math.floor((x + NP_SIZE / 2) / NP_CHUNK), 0, NP_CHUNKS_PER_SIDE - 1);
  const cz = npClamp(Math.floor((z + NP_SIZE / 2) / NP_CHUNK), 0, NP_CHUNKS_PER_SIDE - 1);
  return { cx, cz, key: `${cx},${cz}` };
}

/** The chunks to keep loaded around (x, z) at `radius`, each with its LOD ring. */
export function npChunksAround(x, z, radius) {
  const { cx, cz } = npChunkOf(x, z);
  const out = [];
  for (let dz = -radius; dz <= radius; dz++) for (let dx = -radius; dx <= radius; dx++) {
    const ix = cx + dx, iz = cz + dz;
    if (ix < 0 || iz < 0 || ix >= NP_CHUNKS_PER_SIDE || iz >= NP_CHUNKS_PER_SIDE) continue;
    const ring = Math.max(Math.abs(dx), Math.abs(dz));
    out.push({ cx: ix, cz: iz, key: `${ix},${iz}`, ring, lod: Math.min(ring, NP_LOD_SEGMENTS.length - 1) });
  }
  return out;
}

// ------------------------------------------------------------------ massing

/**
 * The block massing per district character: the grid spacing, the kinds it
 * places and how (each spot picks one kind by the seeded roll). Nothing is a
 * real building — a quarter is low blocks with galleries, a garden district
 * houses under live oaks, an industrial corridor sheds, a port cranes along
 * the water, a suburb small houses and trees, a wetland cypress and reed, a
 * refinery tanks and stacks, a campus mid blocks with trees, a downtown towers.
 */
export const NP_MASSING = {
  quarter: { spacing: 26, jitter: 4, kinds: [["quarterBlock", 1]] },
  garden: { spacing: 34, jitter: 8, kinds: [["gardenHouse", 0.55], ["liveOak", 0.45]] },
  industrial: { spacing: 70, jitter: 10, kinds: [["shed", 1]] },
  suburb: { spacing: 30, jitter: 8, kinds: [["suburbHouse", 0.7], ["liveOak", 0.3]] },
  port: { spacing: 60, jitter: 6, kinds: [["crane", 0.35], ["shed", 0.65]] },
  wetland: { spacing: 24, jitter: 10, kinds: [["cypress", 0.35], ["reed", 0.65]] },
  refinery: { spacing: 64, jitter: 8, kinds: [["tank", 0.7], ["stack", 0.3]] },
  campus: { spacing: 48, jitter: 8, kinds: [["campusBlock", 0.5], ["liveOak", 0.5]] },
  downtown: { spacing: 44, jitter: 6, kinds: [["tower", 1]] },
  park: { spacing: 32, jitter: 12, kinds: [["liveOak", 0.55], ["cypress", 0.45]] },
};

/**
 * The massing spots of one chunk, deterministic: `{ kind, x, z, y, rot, s, h }`
 * for every district cell whose centre is inside a district of that
 * character, on dry land (a wetland's own water excepted), off every road's
 * width plus a margin, off every levee, outside every site pad and clear
 * of the water's edge. `h` is the part's height (towers vary).
 */
export function npMassingForChunk(parish, cx, cz) {
  const prep = npPrepare(parish);
  const x0 = -NP_SIZE / 2 + cx * NP_CHUNK, z0 = -NP_SIZE / 2 + cz * NP_CHUNK;
  const out = [];
  const touching = prep.districts.filter((d) => d.bbox.maxX >= x0 && d.bbox.minX <= x0 + NP_CHUNK && d.bbox.maxZ >= z0 && d.bbox.minZ <= z0 + NP_CHUNK);
  for (const d of touching) {
    const m = NP_MASSING[d.character];
    if (!m) continue;
    const gx0 = Math.floor(x0 / m.spacing), gx1 = Math.ceil((x0 + NP_CHUNK) / m.spacing), gz0 = Math.floor(z0 / m.spacing), gz1 = Math.ceil((z0 + NP_CHUNK) / m.spacing);
    for (let gz = gz0; gz < gz1; gz++) for (let gx = gx0; gx < gx1; gx++) {
      const rng = npRng((prep.seed ^ Math.imul(gx + 5000, 7919) ^ Math.imul(gz + 5000, 104729)) >>> 0);
      const x = (gx + 0.5) * m.spacing + (rng() - 0.5) * m.jitter, z = (gz + 0.5) * m.spacing + (rng() - 0.5) * m.jitter;
      if (x < x0 || x >= x0 + NP_CHUNK || z < z0 || z >= z0 + NP_CHUNK) continue;
      if (Math.abs(x) > prep.half - 6 || Math.abs(z) > prep.half - 6) continue;
      if (!npPointInPoly(x, z, d.poly)) continue;
      if (npDistrictAt(parish, x, z) !== d) continue;
      const w = npWaterAt(parish, x, z);
      if (w && !(w.kind === "wetland" && d.character === "wetland")) continue;
      if (npLeveeRise(parish, x, z) > 0.2) continue;
      const near = npNearestRoad(parish, x, z);
      if (near.road && near.road.kind !== "ferry" && near.d < (NP_ROAD_KINDS[near.road.kind]?.width ?? 8) / 2 + 6) continue;
      if (prep.sites.some((s) => Math.hypot(x - s.position[0], z - s.position[1]) < NP_PAD + 8)) continue;
      let roll = rng(), kind = m.kinds[m.kinds.length - 1][0];
      for (const [k, p] of m.kinds) { if (roll < p) { kind = k; break; } roll -= p; }
      const h = kind === "tower" ? 30 + rng() * 90 : kind === "campusBlock" ? 10 + rng() * 8 : kind === "quarterBlock" ? 6 + rng() * 4 : kind === "shed" ? 7 + rng() * 4 : kind === "tank" ? 9 + rng() * 6 : kind === "stack" ? 30 + rng() * 20 : kind === "crane" ? 34 : kind === "cypress" ? 9 + rng() * 6 : kind === "liveOak" ? 8 + rng() * 5 : kind === "reed" ? 1.4 + rng() * 0.8 : 4.5 + rng() * 2.5;
      out.push({ kind, x, z, y: npHeightAt(parish, x, z), rot: rng() * Math.PI * 2, s: 0.85 + rng() * 0.3, h });
    }
  }
  return out;
}

/**
 * A pure worst-case triangle estimate for one streamed view on a tier:
 * every chunk in the square at its ring's LOD, the densest character's
 * massing in every massing chunk, the backdrop and the fixed features'
 * allowance. tools/check_parishes.mjs holds it to NP_BUDGET.triangles and
 * the builder's stats() measures the real count.
 */
export function npTriangleEstimate(parish, tier = "high") {
  const r = NP_STREAM_RADIUS[tier] ?? 3, mr = NP_MASS_RADIUS[tier] ?? 2;
  let tri = 64 * 64 * 2; // the coarse backdrop
  let densest = 0;
  for (const [ch, m] of Object.entries(NP_MASSING)) {
    const cells = (NP_CHUNK / m.spacing) ** 2;
    const per = m.kinds.reduce((s, [k, p]) => s + p * (NP_TRI[k] ?? 20), 0);
    densest = Math.max(densest, cells * per);
    void ch;
  }
  for (const c of npChunksAround(0, 0, r)) {
    tri += NP_LOD_SEGMENTS[c.lod] ** 2 * 2;
    if (c.ring <= mr) tri += densest * (tier === "low" ? 0.6 : 1);
  }
  // Fixed features: water polygons, levee crowns, road ribbons, bridge piers, sites, signs.
  const roadM = (parish.roads ?? []).reduce((s, rd) => s + npPolyLength(rd.pts), 0);
  const leveeM = (parish.levees ?? []).reduce((s, l) => s + npPolyLength(l.pts), 0);
  tri += Math.round(roadM / 8) * 2 + Math.round(leveeM / 10) * 6 + (parish.water ?? []).length * 400 + (parish.sites ?? []).length * 120 + (parish.landmarks ?? []).length * 40;
  return Math.round(tri);
}

// ------------------------------------------------------------------ validation

/**
 * Validate one parish against the shared schema. `ctx` supplies what the
 * platform knows: `{ stations: Set, k12: Set, programmes: Set, unions: Set,
 * parishes: Map<id, parish> }`. Returns a list of problems (empty when the
 * module is sound). DELTA's modules run this before the checker does.
 */
export function npValidate(parish, ctx = {}) {
  const bad = [];
  const str = (v) => typeof v === "string" && v.trim().length > 0;
  const pt = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
  const inField = (p) => pt(p) && Math.abs(p[0]) <= (parish.size ?? NP_SIZE) / 2 && Math.abs(p[1]) <= (parish.size ?? NP_SIZE) / 2;
  const ids = (list, what) => { const seen = new Set(); for (const it of list ?? []) { if (!str(it?.id)) bad.push(`${what}: an entry has no id`); else if (seen.has(it.id)) bad.push(`${what}: duplicate id ${it.id}`); seen.add(it?.id); } };
  if (!str(parish.id) || !/^[a-z][a-z0-9-]*$/.test(parish.id)) bad.push("id missing or not a slug");
  if (!str(parish.name)) bad.push("no name");
  if (parish.size !== NP_SIZE) bad.push(`size ${parish.size} is not ${NP_SIZE}`);
  if (parish.scale != null && !(Number.isFinite(parish.scale) && parish.scale >= 0.5 && parish.scale <= 25)) bad.push(`scale ${parish.scale} is not a number of real metres per metre between one half and twenty-five`);
  const anchors = parish.anchors ?? [];
  if (anchors.length < 6 || anchors.length > 10) bad.push(`${anchors.length} anchors (need six to ten)`);
  for (const a of anchors) {
    if (!inField(a.xz)) bad.push(`anchor ${a.name ?? "?"}: xz outside the field`);
    if (!pt(a.lonlat) || Math.abs(a.lonlat[0]) > 180 || Math.abs(a.lonlat[1]) > 90) bad.push(`anchor ${a.name ?? "?"}: lonlat malformed`);
    else if (a.lonlat.some((v) => Math.round(v * 1000) / 1000 !== v)) bad.push(`anchor ${a.name ?? "?"}: lonlat carries more than three decimals`);
    if (a.approximate !== true) bad.push(`anchor ${a.name ?? "?"}: not marked approximate`);
    if (!str(a.name)) bad.push("an anchor has no name");
  }
  for (const [list, what] of [[parish.water, "water"], [parish.levees, "levees"], [parish.roads, "roads"], [parish.districts, "districts"], [parish.sites, "sites"], [parish.landmarks, "landmarks"], [parish.connectors, "connectors"], [parish.fieldLessons, "fieldLessons"], [parish.gated, "gated"]]) {
    if (!Array.isArray(list)) bad.push(`${what} is not an array`); else ids(list, what);
  }
  if (parish.region !== undefined && !/^[a-z][a-z0-9-]*$/.test(String(parish.region))) bad.push(`region ${parish.region} is not a slug`);
  if (parish.hills !== undefined) {
    if (!Array.isArray(parish.hills)) bad.push("hills is not an array");
    else {
      ids(parish.hills, "hills");
      for (const hl of parish.hills) {
        if (!str(hl.name) || /\d/.test(hl.name)) bad.push(`hill ${hl.id}: a name with no digits`);
        if (!inField(hl.center)) bad.push(`hill ${hl.id}: center outside the field`);
        if (!(hl.radius >= NP_HILL.minRadius && hl.radius <= NP_HILL.maxRadius)) bad.push(`hill ${hl.id}: radius ${hl.radius}`);
        if (!(hl.height > 0 && hl.height <= NP_HILL.maxHeight)) bad.push(`hill ${hl.id}: height ${hl.height}`);
        else if ((hl.height * Math.PI) / (2 * hl.radius) > NP_HILL.maxSlope) bad.push(`hill ${hl.id}: flank steeper than a gentle mound`);
        if (inField(hl.center) && npWaterAt(parish, ...hl.center)) bad.push(`hill ${hl.id}: its crown is in the water`);
      }
    }
  }
  for (const w of parish.water ?? []) {
    if (!Object.keys(NP_WATER_KINDS).includes(w.kind)) bad.push(`water ${w.id}: kind ${w.kind}`);
    if (!Array.isArray(w.poly) || w.poly.length < (w.width ? 2 : 3) || !w.poly.every(inField)) bad.push(`water ${w.id}: poly malformed or outside the field`);
    if (w.width !== undefined && !(w.width > 0)) bad.push(`water ${w.id}: width`);
  }
  for (const l of parish.levees ?? []) {
    if (!Array.isArray(l.pts) || l.pts.length < 2 || !l.pts.every(inField)) bad.push(`levee ${l.id}: pts malformed or outside the field`);
    if (!(l.height > 0 && l.height <= 12)) bad.push(`levee ${l.id}: height ${l.height}`);
  }
  for (const r of parish.roads ?? []) {
    if (!NP_ROAD_KINDS[r.kind]) bad.push(`road ${r.id}: kind ${r.kind}`);
    if (!Array.isArray(r.pts) || r.pts.length < 2 || !r.pts.every(inField)) bad.push(`road ${r.id}: pts malformed or outside the field`);
    else { const wet = npRoadWet(parish, r); if (wet.length) bad.push(`road ${r.id}: ${wet.length} samples in ${[...new Set(wet.map((w) => w.water))].join(", ")} without a bridge`); }
  }
  for (const d of parish.districts ?? []) {
    if (!NP_CHARACTERS.includes(d.character)) bad.push(`district ${d.id}: character ${d.character}`);
    if (!str(d.name)) bad.push(`district ${d.id}: no name`);
    if (!Array.isArray(d.poly) || d.poly.length < 3 || !d.poly.every(inField)) bad.push(`district ${d.id}: poly malformed or outside the field`);
  }
  const siteIds = new Set((parish.sites ?? []).map((s) => s.id)), landmarkIds = new Set((parish.landmarks ?? []).map((l) => l.id));
  if ((parish.sites ?? []).length < 8) bad.push(`${(parish.sites ?? []).length} sites (need eight or more)`);
  for (const s of parish.sites ?? []) {
    if (!str(s.name) || !str(s.kind)) bad.push(`site ${s.id}: no name or kind`);
    if (!inField(s.position)) bad.push(`site ${s.id}: position outside the field`);
    else if (npWaterAt(parish, ...s.position) && npWaterAt(parish, ...s.position).kind !== "wetland") bad.push(`site ${s.id}: in the water`);
    if (!Array.isArray(s.trades) || !s.trades.length) bad.push(`site ${s.id}: no trades`);
    else if (ctx.unions) for (const t of s.trades) if (!ctx.unions.has(t)) bad.push(`site ${s.id}: union ${t} is not in tools/unions.json`);
    if (!Array.isArray(s.stations) || !s.stations.length) bad.push(`site ${s.id}: no stations`);
    else if (ctx.stations) for (const id of s.stations) if (!ctx.stations.has(id)) bad.push(`site ${s.id}: station ${id} is not in the catalog`);
    if (!Array.isArray(s.programmes)) bad.push(`site ${s.id}: programmes is not an array`);
    else if (ctx.programmes) for (const id of s.programmes) if (!ctx.programmes.has(id)) bad.push(`site ${s.id}: programme ${id} is not in the catalog`);
  }
  for (const l of parish.landmarks ?? []) {
    if (!str(l.name) || !str(l.kind)) bad.push(`landmark ${l.id}: no name or kind`);
    if (!inField(l.position)) bad.push(`landmark ${l.id}: position outside the field`);
  }
  for (const c of parish.connectors ?? []) {
    if (!NP_CONNECTOR_KINDS.includes(c.kind)) bad.push(`connector ${c.id}: kind ${c.kind}`);
    if (!str(c.name)) bad.push(`connector ${c.id}: no name`);
    if (c.from?.parish !== parish.id) bad.push(`connector ${c.id}: from.parish is not ${parish.id}`);
    if (!inField(c.from?.position)) bad.push(`connector ${c.id}: from.position outside the field`);
    if (c.kind === "world") {
      // A way out to another world: `to: { world, site, href }`, the href that world's page with `?site=`.
      const page = NP_WAY_WORLDS[c.to?.world];
      if (!page) bad.push(`connector ${c.id}: world ${c.to?.world} is not a known world`);
      else if (!str(c.to?.site) || c.to?.href !== `${page}?site=${encodeURIComponent(c.to.site)}`) bad.push(`connector ${c.id}: href is not ${page}?site=<site>`);
      if (ctx.worldSites?.[c.to?.world] && !ctx.worldSites[c.to.world].has(c.to?.site)) bad.push(`connector ${c.id}: ${c.to?.site} is not a ${c.to?.world} site`);
      continue;
    }
    if (!str(c.to?.parish)) bad.push(`connector ${c.id}: to.parish missing`);
    if (c.to?.position != null && !pt(c.to.position)) bad.push(`connector ${c.id}: to.position malformed`);
    if (c.to?.position == null && !pt(c.to?.lonlat)) bad.push(`connector ${c.id}: to needs a position or a lonlat`);
  }
  for (const l of parish.fieldLessons ?? []) {
    if (!/-fl-/.test(l.id ?? "")) bad.push(`lesson ${l.id}: id lacks -fl-`);
    if (!siteIds.has(l.site)) bad.push(`lesson ${l.id}: site ${l.site} is not a site`);
    if (l.landmark && !landmarkIds.has(l.landmark)) bad.push(`lesson ${l.id}: landmark ${l.landmark} is not a landmark`);
    if (ctx.k12 && !ctx.k12.has(l.k12)) bad.push(`lesson ${l.id}: k12 ${l.k12} is not a classroom station`);
    for (const f of ["title", "trade", "tradeLine"]) if (!str(l[f])) bad.push(`lesson ${l.id}: no ${f}`);
    if (!(l.minutes >= 2 && l.minutes <= 4)) bad.push(`lesson ${l.id}: minutes ${l.minutes}`);
    if (!Array.isArray(l.steps) || l.steps.length !== 3 || !l.steps.every(str)) bad.push(`lesson ${l.id}: steps are not three sentences`);
    const c = l.check;
    if (!c || !str(c.q) || !Array.isArray(c.options) || c.options.length < 2 || !Number.isInteger(c.answer) || c.answer < 0 || c.answer >= c.options.length || !str(c.why)) bad.push(`lesson ${l.id}: check malformed`);
    if (/\d/.test([l.title, l.tradeLine, ...(l.steps ?? []), c?.q ?? "", ...(c?.options ?? []), c?.why ?? ""].join(" "))) bad.push(`lesson ${l.id}: text states a figure`);
  }
  for (const g of parish.gated ?? []) {
    if (!str(g.title) || !str(g.kind)) bad.push(`gated ${g.id}: no title or kind`);
    if (g.world !== "parishes" || g.parish !== parish.id) bad.push(`gated ${g.id}: world/parish are not parishes/${parish.id}`);
    if (!siteIds.has(g.site)) bad.push(`gated ${g.id}: site ${g.site} is not a site`);
    if (!g.gate || !str(g.gate.note)) bad.push(`gated ${g.id}: no gate note`);
    if (ctx.stations) for (const id of [...(g.gate?.stations ?? []), ...(g.gate?.k12 ?? [])]) if (!ctx.stations.has(id)) bad.push(`gated ${g.id}: station ${id} is not in the catalog`);
    if (g.gate?.note && /\d/.test(g.gate.note.replace(/K-12/g, ""))) bad.push(`gated ${g.id}: the note carries a digit`);
  }
  return bad;
}
