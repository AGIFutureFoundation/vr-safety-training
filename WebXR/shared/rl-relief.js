// RELIEF (docs/consoles/RELIEF.md, docs/mapbox.md "Relief from Mapbox Terrain-RGB"): real ground under any parish map,
// only with a viewer's Mapbox token. Two things, both for the map's lon/lat box (shared/np-geo.js npBounds), so they work
// for every map — the New Orleans parishes, the San Francisco and Oakland districts, and any map added later:
//
//   - the satellite drape: one Static Images picture of the box (np-geo.js npSatelliteUrl), its long side capped by tier
//     (RL_BUDGET: 1280 px at most, 640 px on the phone tier);
//   - relief: Mapbox Terrain-RGB tiles covering the box are fetched once, decoded (rlDecodeTerrainRgb), scaled down into
//     the map's schematic range (no taller than the map's tallest named hill; a map with no hills stays nearly flat) and
//     handed to the engine through np-parish.js's NP_TERRAIN_HOOKS.relief. The engine takes the higher of the relief and
//     the named hills, terraces every pad at that height and ignores relief under water, so pads stay flat and water
//     stays level; the relief also fades out beside the water so a lake is not left in a pit. Sampled on a per-chunk
//     grid (RL_GRID) cached by chunk key, so each chunk decodes its relief once.
//
// The rules (tools/check_mapbox.mjs proves them with a stub fetch):
//   - No token, no request: rlLoadRelief() and rlDrapeUrl() return null before touching the network. No token ships.
//   - The phone tier asks for no relief at all and a smaller drape.
//   - A failed, blocked or slow tile (the claude.ai viewer blocks Mapbox's hosts) leaves the schematic ground unchanged:
//     all tiles or none, bounded by a timeout.
//   - The heights are never shown as figures and never claimed as a survey: they only shape a schematic mound field.
//
// Seam (mounted in WebXR/parishes/js/app.js before the world is built, so every feature seats on the same ground):
//   rlPrepareRelief(parish, { token?, tier, fetch?, decodeImage?, timeoutMs? }) -> Promise<sampler | null>
//   sampler: { at(x, z) -> metres, stats: { zoom, tiles, lo, hi, scale, cap }, cachedChunks() }
//
// Pure apart from the default fetch/decoder (browser only). Every top-level name is prefixed rl/RL_.
import { cleanMapboxToken, mapboxToken } from "./mapbox.js";
import { npBounds, npSatelliteUrl, npToGeo } from "./np-geo.js";
import { NP_CHUNK, NP_SIZE, NP_TERRAIN_HOOKS, npWaterAt } from "./np-parish.js";

/** The one Terrain-RGB tile endpoint (raw PNG, 256 px tiles). */
export const RL_TERRAIN_BASE = "https://api.mapbox.com/v4/mapbox.terrain-rgb";
/** Tile side in pixels. */
export const RL_TILE_PX = 256;
/** Per tier: the deepest zoom, the most tiles one map may fetch, and the drape's long side. The phone tier: no relief. */
export const RL_BUDGET = {
  high: { maxZoom: 13, maxTiles: 16, drapeSide: 1280 },
  balanced: { maxZoom: 12, maxTiles: 9, drapeSide: 1024 },
  low: { maxZoom: 0, maxTiles: 0, drapeSide: 640 },
};
/** Relief grid nodes per chunk side (RL_GRID + 1 samples, 32 m apart on a 256 m chunk). */
export const RL_GRID = 8;
/** The relief never rises higher than this on a map with no named hills (a delta stays nearly flat). */
export const RL_FLAT_CAP = 3;
/** Nor is the real ground ever exaggerated: at most this many map metres per real metre. */
export const RL_MAX_RATIO = 0.5;
/** Within this many metres of open water the relief fades to nothing, so water sits level with its banks. */
export const RL_SHORE = 96;

// ------------------------------------------------------------------ pure maths

/** Terrain-RGB → metres: −10000 + (R·65536 + G·256 + B) × 0.1 (Mapbox's published encoding). */
export function rlDecodeTerrainRgb(r, g, b) { return -10000 + (r * 65536 + g * 256 + b) * 0.1; }

/** Web Mercator: lon/lat → global pixel coordinates at zoom z (tile px each). */
export function rlLonLatToPixel(lon, lat, z, tile = RL_TILE_PX) {
  const n = 2 ** z * tile, phi = (Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180;
  return [((lon + 180) / 360) * n, ((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2) * n];
}

/** The slippy-map tiles `{ z, x, y }` covering a lon/lat box at zoom z, row by row. */
export function rlTilesForBox(box, z) {
  const [x0, y0] = rlLonLatToPixel(box.minLon, box.maxLat, z).map((v) => Math.floor(v / RL_TILE_PX));
  const [x1, y1] = rlLonLatToPixel(box.maxLon, box.minLat, z).map((v) => Math.floor(v / RL_TILE_PX));
  const out = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push({ z, x, y });
  return out;
}

/** The deepest zoom whose tiles for the box fit the tier's budget; null on the phone tier (no relief). */
export function rlReliefZoom(box, tier = "high") {
  const b = RL_BUDGET[tier] ?? RL_BUDGET.balanced;
  if (!b.maxZoom || !b.maxTiles) return null;
  for (let z = b.maxZoom; z >= 8; z--) if (rlTilesForBox(box, z).length <= b.maxTiles) return z;
  return null;
}

/** One Terrain-RGB tile's URL. Pure; without a public token there is no URL. */
export function rlTileUrl({ z, x, y }, token) {
  const clean = cleanMapboxToken(token);
  return clean ? `${RL_TERRAIN_BASE}/${z}/${x}/${y}.pngraw?access_token=${encodeURIComponent(clean)}` : null;
}

/** The satellite drape's URL for the map's box, its long side capped by tier. Null without a token. */
export function rlDrapeUrl(parish, token, tier = "high") {
  const clean = cleanMapboxToken(token);
  if (!clean) return null;
  return npSatelliteUrl(parish, clean, { longSide: (RL_BUDGET[tier] ?? RL_BUDGET.balanced).drapeSide });
}

/** The highest the relief may rise on this map: its tallest named hill, or RL_FLAT_CAP on a map with none. */
export function rlReliefCap(parish) {
  const hs = (parish?.hills ?? []).map((h) => h.height).filter((h) => h > 0);
  return hs.length ? Math.max(...hs) : RL_FLAT_CAP;
}

const rlSmooth = (e0, e1, v) => { const t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** 0 on or at open water, rising to 1 at RL_SHORE metres from it (a coarse ring search; cached per chunk node). */
export function rlShoreFade(parish, x, z) {
  if (npWaterAt(parish, x, z)) return 0;
  const dirs = 8;
  const ring = (r) => { for (let i = 0; i < dirs; i++) { const a = (i / dirs) * Math.PI * 2; if (npWaterAt(parish, x + Math.cos(a) * r, z + Math.sin(a) * r)) return true; } return false; };
  if (!ring(RL_SHORE)) return 1;
  for (const r of [RL_SHORE / 4, RL_SHORE / 2, (RL_SHORE * 3) / 4]) if (ring(r)) return rlSmooth(0, RL_SHORE, r);
  return rlSmooth(0, RL_SHORE, RL_SHORE * 0.875);
}

/**
 * The sampler over decoded tiles: `tiles` is `[{ z, x, y, width, height, heights: Float32Array (metres) }]`, all one zoom.
 * Returns `{ at(x, z), stats, cachedChunks(), real(lon, lat) }`: at() is the scaled, shore-faded relief in map metres,
 * bilinear on a per-chunk grid built on first use and cached by chunk key.
 */
export function rlMakeSampler(parish, tiles) {
  const z = tiles[0].z, byKey = new Map(tiles.map((t) => [`${t.x},${t.y}`, t]));
  const xs = tiles.map((t) => t.x), ys = tiles.map((t) => t.y);
  const gx0 = Math.min(...xs) * RL_TILE_PX, gx1 = (Math.max(...xs) + 1) * RL_TILE_PX - 1;
  const gy0 = Math.min(...ys) * RL_TILE_PX, gy1 = (Math.max(...ys) + 1) * RL_TILE_PX - 1;
  const px = (gx, gy) => {
    gx = Math.max(gx0, Math.min(gx1, gx)); gy = Math.max(gy0, Math.min(gy1, gy));
    const t = byKey.get(`${Math.floor(gx / RL_TILE_PX)},${Math.floor(gy / RL_TILE_PX)}`);
    if (!t) return 0;
    const lx = Math.floor((gx % RL_TILE_PX) * (t.width / RL_TILE_PX)), ly = Math.floor((gy % RL_TILE_PX) * (t.height / RL_TILE_PX));
    return t.heights[ly * t.width + lx];
  };
  /** Real metres at lon/lat, bilinear between pixel centres. */
  const real = (lon, lat) => {
    const [fx, fy] = rlLonLatToPixel(lon, lat, z).map((v) => v - 0.5);
    const ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    const a = px(ix, iy), b = px(ix + 1, iy), c = px(ix, iy + 1), d = px(ix + 1, iy + 1);
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
  // The scale: the dry field's real range (sea level at the bottom) squeezed into the map's schematic range.
  const half = (parish.size ?? NP_SIZE) / 2, cap = rlReliefCap(parish);
  let lo = Infinity, hi = -Infinity;
  for (let j = 0; j <= 32; j++) for (let i = 0; i <= 32; i++) {
    const x = -half + (i / 32) * half * 2, zz = -half + (j / 32) * half * 2;
    if (npWaterAt(parish, x, zz)) continue;
    const h = real(...npToGeo(parish, [x, zz]));
    if (h < lo) lo = h; if (h > hi) hi = h;
  }
  if (!Number.isFinite(lo)) { lo = 0; hi = 0; }
  lo = Math.max(0, lo);
  const scale = Math.min(RL_MAX_RATIO, cap / Math.max(1, hi - lo));
  const grids = new Map(), n = RL_GRID + 1, step = NP_CHUNK / RL_GRID, chunks = Math.ceil((half * 2) / NP_CHUNK);
  const grid = (ci, cj) => {
    const key = `${ci},${cj}`;
    let g = grids.get(key);
    if (g) return g;
    g = new Float32Array(n * n);
    const x0 = -half + ci * NP_CHUNK, z0 = -half + cj * NP_CHUNK;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = x0 + i * step, zz = z0 + j * step;
      const v = Math.max(0, Math.min(cap, (real(...npToGeo(parish, [x, zz])) - lo) * scale));
      g[j * n + i] = v > 0 ? v * rlShoreFade(parish, x, zz) : 0;
    }
    grids.set(key, g);
    return g;
  };
  const at = (x, zz) => {
    const fx = Math.max(0, Math.min(half * 2 - 1e-6, x + half)) / NP_CHUNK, fz = Math.max(0, Math.min(half * 2 - 1e-6, zz + half)) / NP_CHUNK;
    const ci = Math.min(chunks - 1, Math.floor(fx)), cj = Math.min(chunks - 1, Math.floor(fz));
    const g = grid(ci, cj);
    const u = (fx - ci) * RL_GRID, v = (fz - cj) * RL_GRID;
    const i = Math.min(RL_GRID - 1, Math.floor(u)), j = Math.min(RL_GRID - 1, Math.floor(v)), tu = u - i, tv = v - j;
    const a = g[j * n + i], b = g[j * n + i + 1], c = g[(j + 1) * n + i], d = g[(j + 1) * n + i + 1];
    return (a * (1 - tu) + b * tu) * (1 - tv) + (c * (1 - tu) + d * tu) * tv;
  };
  return { at, real, stats: { zoom: z, tiles: tiles.length, lo, hi, scale, cap }, cachedChunks: () => grids.size };
}

// ------------------------------------------------------------------ network (token-gated)

/** The browser's decoder: a tile response → `{ width, height, data }` RGBA, with no colour conversion. */
async function rlDecodeImageDefault(res) {
  const blob = await res.blob();
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const cv = typeof OffscreenCanvas === "function" ? new OffscreenCanvas(bmp.width, bmp.height)
    : Object.assign(document.createElement("canvas"), { width: bmp.width, height: bmp.height });
  const cx = cv.getContext("2d", { willReadFrequently: true });
  cx.drawImage(bmp, 0, 0);
  return cx.getImageData(0, 0, bmp.width, bmp.height);
}

/** RGBA pixels → Float32Array metres. */
export function rlDecodePixels({ width, height, data }) {
  const out = new Float32Array(width * height);
  for (let i = 0, k = 0; i < out.length; i++, k += 4) out[i] = rlDecodeTerrainRgb(data[k], data[k + 1], data[k + 2]);
  return out;
}

/**
 * Fetch and decode the Terrain-RGB tiles for the map's box and build its sampler. Resolves to null — with no request at
 * all — without a public token or on the phone tier; to null as well when any tile fails or the timeout passes (all
 * tiles or none). `opts.fetch` and `opts.decodeImage(response) -> { width, height, data }` are the test seams.
 */
export async function rlLoadRelief(parish, opts = {}) {
  const token = cleanMapboxToken(opts.token === undefined ? mapboxToken() : opts.token);
  if (!token) return null;
  const box = npBounds(parish), zoom = rlReliefZoom(box, opts.tier ?? "high");
  if (zoom == null) return null;
  const f = opts.fetch ?? (typeof globalThis.fetch === "function" ? (...a) => globalThis.fetch(...a) : null);
  if (!f) return null;
  const decode = opts.decodeImage ?? rlDecodeImageDefault;
  const ctl = typeof AbortController === "function" ? new AbortController() : null;
  const work = Promise.all(rlTilesForBox(box, zoom).map(async (t) => {
    const res = await f(rlTileUrl(t, token), { mode: "cors", credentials: "omit", signal: ctl?.signal });
    if (!res?.ok) throw new Error(`tile ${t.z}/${t.x}/${t.y}: ${res?.status}`);
    const img = await decode(res);
    return { ...t, width: img.width, height: img.height, heights: rlDecodePixels(img) };
  }));
  let timer = null;
  const timeout = new Promise((resolve) => { timer = setTimeout(() => { ctl?.abort(); resolve(null); }, opts.timeoutMs ?? 4000); });
  try {
    const tiles = await Promise.race([work, timeout]);
    return tiles ? rlMakeSampler(parish, tiles) : null;
  } catch (_) { return null; } finally { clearTimeout(timer); }
}

/** Hand a sampler to the engine for this map (NP_TERRAIN_HOOKS.relief); other maps read no relief. */
export function rlMountRelief(parish, sampler) {
  NP_TERRAIN_HOOKS.relief = sampler ? (p, x, z) => (p === parish ? sampler.at(x, z) : 0) : null;
  return !!sampler;
}

/** Take the relief away: the height field is the schematic one again. */
export function rlUnmountRelief() { NP_TERRAIN_HOOKS.relief = null; }

/** Load and mount in one step (the app's call). Null, and the engine untouched, without a token or on the phone tier. */
export async function rlPrepareRelief(parish, opts = {}) {
  const sampler = await rlLoadRelief(parish, opts);
  if (sampler) rlMountRelief(parish, sampler);
  return sampler;
}
