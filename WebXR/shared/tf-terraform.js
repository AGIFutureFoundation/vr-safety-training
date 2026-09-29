// TERRAFORM's pure half (console TERRAFORM, docs/consoles/TERRAFORM.md): water, wind and ground cover for the parish
// engine, computed without three.js or the DOM so tools/check_terraform.mjs and any world can ask the same questions.
//
// Seams (the Packs brief's shapes; every answer is deterministic by the parish id or a seed):
//   (the wind seam, tfWind / tfWindAt / tfMotion, lives in shared/tf-water.js — no imports, so any world can take it)
//   tfWaterDepthAt(parish, x, z)       -> metres (0 on land)             rivers, canals, lakes, wetlands, streams, ditches
//   tfFlowAt(parish, x, z)             -> [vx, vz] (m/s)                 downstream along each river's polyline and stream
//   tfLitterAt(parish, chunkKey)       -> [{ id, kind, x, y, z, rot }]   cans, bags, paper, a tyre by a ditch — sparse
//   tfCoverForChunk(parish, cx, cz, tier) -> { tufts, bushes, litter }   grass and bushes by district character
//   tfStreams(parish) / tfCulverts(parish)                               the procedural streams, ditches and culverts
//
// Importing this module registers the channel cut and the wet shoreline on the engine's terrain hooks
// (np-parish.js NP_TERRAIN_HOOKS), so npHeightAt dips under streams and ditches and eases down to every river, canal
// and bayou ribbon; nothing cuts under a levee, nothing cuts where a road crosses (a culvert carries the road).
//
// Everything here is procedural: a stream, ditch, culvert, tuft or can is placed by a seeded roll, never a claim about a
// real place. Every top-level name is prefixed tf/TF_ (the bundler's one scope).

import {
  NP_SIZE, NP_CHUNK, NP_PAD, NP_ROAD_KINDS, NP_WATER_Y, NP_OPEN_WATER, NP_TERRAIN_HOOKS,
  npPrepare, npWaterAt, npHeightAt, npRng, npPointInPoly, npLeveeRise, npPolyLength,
} from "./np-parish.js";

/** Budgets per streamed chunk (one merged cover mesh per chunk) and the cover radius per tier (the phone tier is `low`). */
export const TF_BUDGET = {
  meshesPerChunk: 1, tuftsPerChunk: 360, bushesPerChunk: 24, litterPerChunk: 8, trianglesPerChunk: 6000,
  radius: { low: 1, balanced: 1, high: 1 }, density: { low: 0.35, balanced: 0.7, high: 1 }, streamsPerMap: 8,
};
/** Triangles per cover part (tf-world.js's templates). */
export const TF_TRI = { tuft: 3, bush: 20, can: 12, bag: 20, paper: 2, tyre: 32 };
/** Tuft clusters (seven tufts each), bushes and litter per chunk by district character at the high tier. */
export const TF_COVER = {
  garden: [36, 14, 1], park: [44, 16, 2], suburb: [32, 12, 2], campus: [28, 10, 2], wetland: [20, 6, 1],
  quarter: [8, 2, 5], downtown: [6, 1, 5], industrial: [12, 3, 4], port: [6, 1, 4], refinery: [10, 2, 3], grass: [24, 5, 1],
};
/** Stream and ditch shapes (metres): channel width, depth below the banks, water depth in the channel, bank run. */
export const TF_CHANNEL = {
  stream: { width: 3.2, depth: 1.1, water: 0.35, bank: 3.5, step: 18, speed: 0.4 },
  ditch: { width: 2.2, depth: 0.8, water: 0.25, bank: 2.5, step: 24, speed: 0.2 },
};
/** A ribbon's gentle bank outside its water edge (metres) and the wet strip beyond it. */
export const TF_BANK = 10;
export const TF_WET = 14;
/** Downstream speed (m/s) on each ribbon kind, fastest mid-channel. */
export const TF_FLOW_SPEED = { river: 0.9, bayou: 0.3, canal: 0.2 };

const tfClamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const tfSmooth = (e0, e1, v) => { const t = tfClamp((v - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const tfSeedOf = (s) => [...String(s)].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 2166136261);

// ------------------------------------------------------------------ polylines

/** Nearest point on a polyline: { d, t (along 0..1), dir: [dx, dz] of that segment, x, z }. */
export function tfNearest(x, z, pts) {
  let best = Infinity, bt = 0, bdx = 1, bdz = 0, bx = pts[0][0], bz = pts[0][1], run = 0;
  const total = npPolyLength(pts) || 1;
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [cx, cz] = pts[i];
    const dx = cx - ax, dz = cz - az, L2 = dx * dx + dz * dz, L = Math.sqrt(L2) || 1;
    const u = L2 ? tfClamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1) : 0;
    const px = ax + dx * u, pz = az + dz * u, d = Math.hypot(x - px, z - pz);
    if (d < best) { best = d; bt = (run + u * L) / total; bdx = dx / L; bdz = dz / L; bx = px; bz = pz; }
    run += L;
  }
  return { d: best, t: bt, dir: [bdx, bdz], x: bx, z: bz };
}

function tfSegCross(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-9) return null;
  const u = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, v = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  return u >= 0 && u <= 1 && v >= 0 && v <= 1 ? [a[0] + r[0] * u, a[1] + r[1] * u] : null;
}

function tfBox(pts, pad) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [x, z] of pts) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (z < minZ) minZ = z; if (z > maxZ) maxZ = z; }
  return { minX: minX - pad, maxX: maxX + pad, minZ: minZ - pad, maxZ: maxZ + pad };
}
const tfInBox = (b, x, z) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ;
const tfBoxesMeet = (a, b) => a.minX <= b.maxX && a.maxX >= b.minX && a.minZ <= b.maxZ && a.maxZ >= b.minZ;
const tfRoadHalf = (r) => (NP_ROAD_KINDS[r.kind]?.width ?? 8) / 2;
const tfSurfaceRoads = (parish) => (parish.roads ?? []).filter((r) => r.kind !== "ferry" && !NP_ROAD_KINDS[r.kind]?.clearance && Array.isArray(r.pts) && r.pts.length > 1);

// ------------------------------------------------------------------ streams and ditches

const tfCache = new WeakMap();

/**
 * The procedural streams and ditches of one map, and everything derived from them (cached per parish object):
 * streams meander through `wetland`, `park` and `campus` districts, drainage ditches run straight through `garden` and `suburb` districts, each walking
 * from a seeded source towards the nearest water until it reaches it (its mouth), leaves its district, or nears a site
 * pad or a levee. Points run source → mouth, so flow follows the point order.
 */
function tfPrep(parish) {
  const hit = tfCache.get(parish);
  if (hit) return hit;
  const prep = npPrepare(parish);
  const roads = tfSurfaceRoads(parish).map((r) => ({ road: r, half: tfRoadHalf(r), box: tfBox(r.pts, tfRoadHalf(r) + 8) }));
  const ribbons = prep.water.filter((w) => w.centre && TF_FLOW_SPEED[w.kind] !== undefined).map((w) => ({ w, box: tfBox(w.centre, w.width / 2 + TF_WET) }));
  const targets = [];
  for (const w of prep.water) if (w.kind !== "wetland") for (const p of (w.centre ?? w.shape)) targets.push(p);
  const streams = [];
  const half = prep.half;
  const sitePts = prep.sites.map((s) => s.position);
  const nearPad = (x, z) => sitePts.some((p) => Math.hypot(x - p[0], z - p[1]) < NP_PAD * 1.8 + 6);
  const nearRoadAlong = (x, z) => roads.some((r) => tfInBox(r.box, x, z) && tfNearest(x, z, r.road.pts).d < r.half + 5);
  const plan = { wetland: ["stream", "stream"], park: ["stream", "stream"], garden: ["ditch"], suburb: ["ditch"], campus: ["stream"] };
  const districts = [...prep.districts].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  for (const d of districts) {
    for (const kind of plan[d.character] ?? []) {
      if (streams.length >= TF_BUDGET.streamsPerMap) break;
      const spec = TF_CHANNEL[kind];
      const rng = npRng(tfSeedOf(`${parish.id}:${d.id}:${kind}:${streams.length}`));
      let sx = 0, sz = 0, ok = false;
      for (let k = 0; k < 24 && !ok; k++) {
        sx = d.bbox.minX + rng() * (d.bbox.maxX - d.bbox.minX); sz = d.bbox.minZ + rng() * (d.bbox.maxZ - d.bbox.minZ);
        ok = npPointInPoly(sx, sz, d.poly) && !npWaterAt(parish, sx, sz) && !nearPad(sx, sz) && npLeveeRise(parish, sx, sz) < 0.2 && !nearRoadAlong(sx, sz) && Math.abs(sx) < half - 40 && Math.abs(sz) < half - 40;
      }
      if (!ok) continue;
      let tx = null, tz = null, td = Infinity;
      for (const p of targets) { const dd = Math.hypot(p[0] - sx, p[1] - sz); if (dd < td) { td = dd; tx = p[0]; tz = p[1]; } }
      let yaw = tx === null ? rng() * Math.PI * 2 : Math.atan2(tz - sz, tx - sx);
      if (kind === "ditch") yaw = Math.round(yaw / (Math.PI / 2)) * (Math.PI / 2);
      const pts = [[sx, sz]];
      let x = sx, z = sz, mouth = false, turned = false;
      for (let step = 0; step < 40; step++) {
        if (kind === "stream") {
          const want = tx === null ? yaw : Math.atan2(tz - z, tx - x);
          let dy = want - yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI;
          yaw += dy * 0.25 + (rng() - 0.5) * 0.9;
        } else if (!turned && step > 4 && rng() < 0.15) { yaw += (rng() < 0.5 ? 1 : -1) * Math.PI / 2; turned = true; }
        const nx = x + Math.cos(yaw) * spec.step, nz = z + Math.sin(yaw) * spec.step;
        if (Math.abs(nx) > half - 20 || Math.abs(nz) > half - 20) break;
        const wet = npWaterAt(parish, nx, nz);
        if (wet && wet.kind !== "wetland") { pts.push([nx, nz]); mouth = true; break; }
        if (!npPointInPoly(nx, nz, d.poly) || nearPad(nx, nz) || npLeveeRise(parish, nx, nz) > 0.2) break;
        pts.push([nx, nz]); x = nx; z = nz;
      }
      if (pts.length < 5) continue;
      const id = `tf-${kind}-${streams.length + 1}`;
      streams.push({ id, kind, district: d.id, mouth, pts, ...spec, box: tfBox(pts, spec.width / 2 + spec.bank + 1) });
    }
  }
  // Culverts: wherever a stream or ditch crosses a road, the road carries on level over a pipe.
  const culverts = [];
  for (const s of streams) {
    s.roads = roads.filter((r) => tfBoxesMeet(r.box, s.box));
    for (const r of s.roads) for (let i = 1; i < s.pts.length; i++) for (let j = 1; j < r.road.pts.length; j++) {
      const p = tfSegCross(s.pts[i - 1], s.pts[i], r.road.pts[j - 1], r.road.pts[j]);
      if (!p) continue;
      const dx = s.pts[i][0] - s.pts[i - 1][0], dz = s.pts[i][1] - s.pts[i - 1][1], L = Math.hypot(dx, dz) || 1;
      culverts.push({ id: `${s.id}-culvert-${culverts.length + 1}`, stream: s.id, road: r.road.id, x: p[0], z: p[1], dir: [dx / L, dz / L], half: r.half });
    }
  }
  // Cover keeps off every drawn road, a bridge's ramps included.
  const coverRoads = (parish.roads ?? []).filter((r) => r.kind !== "ferry" && Array.isArray(r.pts) && r.pts.length > 1).map((r) => ({ road: r, half: tfRoadHalf(r), box: tfBox(r.pts, tfRoadHalf(r) + 8) }));
  const out = { streams, culverts, roads, ribbons, coverRoads };
  tfCache.set(parish, out);
  return out;
}

/** The procedural streams and ditches: `[{ id, kind, district, mouth, pts, width, depth, water, bank }]`, points source → mouth. */
export function tfStreams(parish) { return tfPrep(parish).streams; }
/** The culverts: `[{ id, stream, road, x, z, dir, half }]`, one wherever a stream or ditch crosses a surface road. */
export function tfCulverts(parish) { return tfPrep(parish).culverts; }

/** How much of a stream's cut survives at (x, z): 0 on and just beside a road (the culvert), 1 away from roads. */
function tfRoadKeep(s, x, z) {
  let keep = 1;
  for (const r of s.roads) {
    if (!tfInBox(r.box, x, z)) continue;
    const { d } = tfNearest(x, z, r.road.pts);
    keep = Math.min(keep, tfSmooth(r.half + 2, r.half + 7, d));
  }
  return keep;
}

/** The depth a stream or ditch cuts at (x, z) (metres, 0 outside every channel), and the stream it belongs to. */
export function tfStreamCut(parish, x, z) {
  let best = 0, which = null;
  for (const s of tfPrep(parish).streams) {
    if (!tfInBox(s.box, x, z)) continue;
    const { d } = tfNearest(x, z, s.pts);
    const edge = s.width / 2 + s.bank;
    if (d >= edge) continue;
    const c = s.depth * (1 - tfSmooth(s.width * 0.3, edge, d)) * tfRoadKeep(s, x, z);
    if (c > best) { best = c; which = s; }
  }
  return { cut: best, stream: which };
}

/**
 * The channel cut the engine calls from npHeightAt (before levees and pads; never where a levee rises): a stream or
 * ditch lowers the ground by its profile, and outside each river, canal or bayou ribbon the ground eases down to just
 * above the water line over TF_BANK metres, so the water sits in a channel with banks rather than behind a step.
 */
export function tfChannelCut(parish, x, z, h, water) {
  if (water) return h;
  const P = tfPrep(parish);
  for (const r of P.ribbons) {
    if (!tfInBox(r.box, x, z)) continue;
    const e = tfNearest(x, z, r.w.centre).d - r.w.width / 2;
    if (e > 0 && e < TF_BANK) { const lip = NP_WATER_Y - 0.25; if (h > lip) h = lip + (h - lip) * tfSmooth(0, TF_BANK, e); }
  }
  const { cut } = tfStreamCut(parish, x, z);
  return h - cut;
}

/** The wet shoreline 0..1 at (x, z): a strip beside every ribbon and inside every stream's banks. */
export function tfWetAt(parish, x, z) {
  const P = tfPrep(parish);
  let wet = 0;
  for (const r of P.ribbons) {
    if (!tfInBox(r.box, x, z)) continue;
    const e = tfNearest(x, z, r.w.centre).d - r.w.width / 2;
    if (e > -2 && e < TF_WET) wet = Math.max(wet, 1 - tfSmooth(TF_WET * 0.3, TF_WET, e));
  }
  for (const s of P.streams) {
    if (!tfInBox(s.box, x, z)) continue;
    const { d } = tfNearest(x, z, s.pts);
    if (d < s.width / 2 + s.bank + 2) wet = Math.max(wet, 1 - tfSmooth(s.width / 2, s.width / 2 + s.bank + 2, d));
  }
  return wet;
}

NP_TERRAIN_HOOKS.cut = tfChannelCut;
NP_TERRAIN_HOOKS.wet = tfWetAt;

/** A stream's water surface at its centre nearest (x, z): the channel bed plus the stream's water depth. */
export function tfStreamSurfaceAt(parish, s, x, z) {
  const n = tfNearest(x, z, s.pts);
  return npHeightAt(parish, n.x, n.z) + s.water;
}

// ------------------------------------------------------------------ water depth and flow

/** Water depth in metres at (x, z): below the water line in a river, canal, bayou, lake or wetland; in a stream's channel. */
export function tfWaterDepthAt(parish, x, z) {
  const w = npWaterAt(parish, x, z);
  const g = npHeightAt(parish, x, z);
  if (w) return Math.max(0, (w.kind === "wetland" ? NP_WATER_Y - 0.12 : NP_WATER_Y) - g);
  for (const s of tfPrep(parish).streams) {
    if (!tfInBox(s.box, x, z)) continue;
    const n = tfNearest(x, z, s.pts);
    if (n.d > s.width / 2) continue;
    return Math.max(0, npHeightAt(parish, n.x, n.z) + s.water - g);
  }
  return 0;
}

/** The current at (x, z) in m/s: downstream along a ribbon's polyline (fastest mid-channel) or a stream's points; [0, 0] elsewhere. */
export function tfFlowAt(parish, x, z) {
  const w = npWaterAt(parish, x, z);
  if (w) {
    const speed = TF_FLOW_SPEED[w.kind];
    if (!w.centre || speed === undefined) return [0, 0];
    const n = tfNearest(x, z, w.centre);
    const k = speed * (0.5 + 0.5 * (1 - Math.min(1, (n.d / (w.width / 2)) ** 2)));
    return [n.dir[0] * k, n.dir[1] * k];
  }
  for (const s of tfPrep(parish).streams) {
    if (!tfInBox(s.box, x, z)) continue;
    const n = tfNearest(x, z, s.pts);
    if (n.d <= s.width / 2) return [n.dir[0] * s.speed * tfRoadKeep(s, x, z), n.dir[1] * s.speed * tfRoadKeep(s, x, z)];
  }
  return [0, 0];
}

// ------------------------------------------------------------------ ground cover and litter

/** The chunk's bounds and what touches it, for the cover test. */
function tfChunkCtx(parish, cx, cz) {
  const x0 = -NP_SIZE / 2 + cx * NP_CHUNK, z0 = -NP_SIZE / 2 + cz * NP_CHUNK;
  const box = { minX: x0, maxX: x0 + NP_CHUNK, minZ: z0, maxZ: z0 + NP_CHUNK };
  const P = tfPrep(parish), prep = npPrepare(parish);
  return {
    x0, z0, box, prep,
    roads: P.coverRoads.filter((r) => tfBoxesMeet(r.box, box)),
    streams: P.streams.filter((s) => tfBoxesMeet(s.box, box)),
    sites: prep.sites.filter((s) => Math.abs(s.position[0] - (x0 + NP_CHUNK / 2)) < NP_CHUNK && Math.abs(s.position[1] - (z0 + NP_CHUNK / 2)) < NP_CHUNK),
  };
}

/**
 * Whether cover may stand at (x, z): not in water (a wetland included), not in a stream's channel, not on a road (its
 * half width plus `margin`), not on a site pad, not on a levee. tools/check_terraform.mjs holds every tuft to this with
 * the exact engine tests.
 */
export function tfGroundOk(parish, x, z, margin = 1.5, ctx = null) {
  if (Math.abs(x) > NP_SIZE / 2 - 4 || Math.abs(z) > NP_SIZE / 2 - 4) return false;
  if (npWaterAt(parish, x, z)) return false;
  const c = ctx ?? tfChunkCtx(parish, ...Object.values(tfChunkIndex(x, z)));
  for (const s of c.sites) if (Math.hypot(x - s.position[0], z - s.position[1]) < NP_PAD + margin) return false;
  for (const r of c.roads) if (tfInBox(r.box, x, z) && tfNearest(x, z, r.road.pts).d < r.half + margin) return false;
  for (const s of c.streams) if (tfInBox(s.box, x, z) && tfNearest(x, z, s.pts).d < s.width / 2 + s.bank * 0.5) return false;
  if (npLeveeRise(parish, x, z) > 0.3) return false;
  return true;
}

/** The chunk indices containing (x, z). */
export function tfChunkIndex(x, z) {
  const n = NP_SIZE / NP_CHUNK;
  return { cx: tfClamp(Math.floor((x + NP_SIZE / 2) / NP_CHUNK), 0, n - 1), cz: tfClamp(Math.floor((z + NP_SIZE / 2) / NP_CHUNK), 0, n - 1) };
}

function tfCharacterAt(prep, x, z) {
  for (const d of prep.districts) {
    const b = d.bbox;
    if (x < b.minX || x > b.maxX || z < b.minZ || z > b.maxZ) continue;
    if (npPointInPoly(x, z, d.poly)) return d.character;
  }
  return "grass";
}

/**
 * The ground cover of one chunk at a tier, deterministic: `{ tufts: [{ x, y, z, h, rot }], bushes: [{ x, y, z, s, rot }],
 * litter: [...] }`. Tufts come in clusters of seven by the district character's density; the phone tier (`low`) carries
 * about a third of the tufts and no bushes. Nothing stands on a road, water, a pad or a levee.
 */
export function tfCoverForChunk(parish, cx, cz, tier = "high") {
  const ctx = tfChunkCtx(parish, cx, cz);
  const dens = TF_BUDGET.density[tier] ?? 1;
  const keepTuft = (i) => ((i * 7919) % 20) < dens * 20; // a lighter tier keeps a fixed subset of the high tier's tufts
  let tuftIndex = 0;
  const rng = npRng(tfSeedOf(`${parish.id}:cover:${cx},${cz}`));
  const tufts = [], bushes = [];
  // Sample the chunk's character on a 4 × 4 grid; each cell carries its share of the clusters.
  for (let gz = 0; gz < 4; gz++) for (let gx = 0; gx < 4; gx++) {
    const ch = tfCharacterAt(ctx.prep, ctx.x0 + (gx + 0.5) * 64, ctx.z0 + (gz + 0.5) * 64);
    const [clusters, nb] = TF_COVER[ch] ?? TF_COVER.grass;
    const nc = Math.round(clusters / 16 + rng() * 0.5);
    for (let c = 0; c < nc; c++) {
      const x = ctx.x0 + (gx + rng()) * 64, z = ctx.z0 + (gz + rng()) * 64;
      if (!tfGroundOk(parish, x, z, 4, ctx)) continue;
      for (let k = 0; k < 7 && tufts.length < TF_BUDGET.tuftsPerChunk; k++) {
        const tx = x + (rng() - 0.5) * 5, tz = z + (rng() - 0.5) * 5;
        const h = 0.35 + rng() * 0.45, rot = rng() * Math.PI;
        if (!tfGroundOk(parish, tx, tz, 1, ctx)) continue;
        if (keepTuft(tuftIndex++)) tufts.push({ x: tx, y: npHeightAt(parish, tx, tz), z: tz, h, rot });
      }
    }
    const nbush = Math.round(nb / 16 + rng() * 0.4);
    for (let b = 0; b < nbush; b++) {
      const x = ctx.x0 + (gx + rng()) * 64, z = ctx.z0 + (gz + rng()) * 64, sc = 0.7 + rng() * 0.8, rot = rng() * Math.PI * 2;
      if (tier === "low" || bushes.length >= TF_BUDGET.bushesPerChunk || (tier === "balanced" && b % 4 === 3)) continue;
      if (!tfGroundOk(parish, x, z, 2.5, ctx)) continue;
      bushes.push({ x, y: npHeightAt(parish, x, z), z, s: sc, rot });
    }
  }
  return { tufts, bushes, litter: tfLitterAt(parish, `${cx},${cz}`) };
}

/**
 * The litter of one chunk (the play layer picks it up later): cans, bags and paper by the district's character —
 * more in a quarter, downtown, an industrial corridor or a port, a little elsewhere — and a tyre dumped by a ditch or
 * stream when one runs through. `[{ id, kind, x, y, z, rot }]`, deterministic by parish and chunk; never on a road,
 * water or a pad.
 */
export function tfLitterAt(parish, chunkKey) {
  const [cx, cz] = String(chunkKey).split(",").map(Number);
  if (!Number.isInteger(cx) || !Number.isInteger(cz)) return [];
  const ctx = tfChunkCtx(parish, cx, cz);
  const rng = npRng(tfSeedOf(`${parish.id}:litter:${cx},${cz}`));
  const ch = tfCharacterAt(ctx.prep, ctx.x0 + NP_CHUNK / 2, ctx.z0 + NP_CHUNK / 2);
  const n = (TF_COVER[ch] ?? TF_COVER.grass)[2];
  const out = [];
  const kinds = ["can", "bag", "paper"];
  for (let i = 0; i < n * 2 && out.length < n; i++) {
    const x = ctx.x0 + rng() * NP_CHUNK, z = ctx.z0 + rng() * NP_CHUNK, kind = kinds[Math.floor(rng() * kinds.length)];
    if (!tfGroundOk(parish, x, z, 1.5, ctx)) continue;
    out.push({ id: `tf-litter-${cx}-${cz}-${out.length + 1}`, kind, x, y: npHeightAt(parish, x, z), z, rot: rng() * Math.PI * 2 });
  }
  for (const s of ctx.streams) {
    if (out.length >= TF_BUDGET.litterPerChunk || rng() > 0.5) continue;
    for (let k = 0; k < 6; k++) {
      const p = s.pts[Math.floor(rng() * s.pts.length)];
      if (!tfInBox(ctx.box, p[0], p[1])) continue;
      const a = rng() * Math.PI * 2, x = p[0] + Math.cos(a) * (s.width / 2 + s.bank + 1.2), z = p[1] + Math.sin(a) * (s.width / 2 + s.bank + 1.2);
      if (!tfGroundOk(parish, x, z, 1.5, ctx)) continue;
      out.push({ id: `tf-litter-${cx}-${cz}-${out.length + 1}`, kind: "tyre", x, y: npHeightAt(parish, x, z), z, rot: rng() * Math.PI, by: s.id });
      break;
    }
  }
  return out;
}

/** Triangles a chunk's cover costs (tf-world.js's templates). */
export function tfCoverTriangles(cover) {
  return cover.tufts.length * TF_TRI.tuft + cover.bushes.length * TF_TRI.bush + cover.litter.reduce((s, l) => s + (TF_TRI[l.kind] ?? 12), 0);
}

/** Open water a stream may end in (for the checker's mouth test). */
export const TF_MOUTH_KINDS = [...NP_OPEN_WATER, "river", "canal", "bayou"];
