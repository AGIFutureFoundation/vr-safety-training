// CITYWORKS (the Packs run, docs/consoles/CITYWORKS.md): roads, sidewalks and solid buildings for the parish engine —
// the pure half (no three.js, no DOM). shared/cw-streets-world.js is the three.js builder over this.
//
// SEAMS (shapes other consoles code against — brief tools/briefs/packs-brief.md, "The seam shapes"):
//   cwColliders(parish, chunkKey) -> [{ min: [x, y, z], max: [x, y, z], kind, id?, door? }]
//       One axis-aligned box per massing building (the engine's npMassingForChunk spots after cwMassFilter) and per
//       site building whose footprint centre lies in the chunk ("cx,cz", npChunkOf's key). A site building's box
//       carries `door: { x, z, face: "n"|"s"|"e"|"w" }` on the face toward the nearest road (where the pad meets it).
//   cwSidewalkAt(parish, x, z) -> bool
//       True on a sidewalk band (both sides of every arterial and collector street and of the named avenues and
//       streets), never on water.
//   cwRoadGraph(parish) -> { nodes: [[x, z]], edges: [{ a, b, cls, width, len }] }
//       The named roads plus the street fabric, split at every crossing and snapped T-junction. cls is the fabric's
//       arterial | collector | local, or the named road's kind (avenue, interstate, bridge, ferry, ...).
//   cwMassFilter(parish) -> (spot) => bool
//       npBuildParish's opts.massFilter: false for a massing spot that would stand on a street or its sidewalk.
//
// The street fabric of a New Orleans parish is AUTHORED procedural fabric (the Trade Craft Academy artifact's
// street polylines, generated into shared/cw-streets-<parish>.js by tools/gen_cw_streets.mjs) — NOT the real street
// grid. The parishes' own `roads` stay the named ones. A San Francisco district has no imported fabric: it gets
// kerbs, sidewalks and lights along its own avenues and streets.
//
// Every top-level name is prefixed cw/CW_ (the bundler concatenates all modules into one scope).

import { NP_SIZE, NP_CHUNK, NP_ROAD_KINDS, NP_PAD, npHeightAt, npWaterAt, npPrepare, npMassingForChunk, npChunkOf, npPolyDistance } from "./np-parish.js";
import { CW_STREETS_ORLEANS } from "./cw-streets-orleans.js";
import { CW_STREETS_JEFFERSON } from "./cw-streets-jefferson.js";
import { CW_STREETS_ST_BERNARD } from "./cw-streets-st-bernard.js";
import { CW_STREETS_PLAQUEMINES } from "./cw-streets-plaquemines.js";
import { CW_STREETS_ST_TAMMANY } from "./cw-streets-st-tammany.js";

/** The generated fabric per parish id (New Orleans only). */
export const CW_FABRIC = {
  orleans: CW_STREETS_ORLEANS, jefferson: CW_STREETS_JEFFERSON, "st-bernard": CW_STREETS_ST_BERNARD,
  plaquemines: CW_STREETS_PLAQUEMINES, "st-tammany": CW_STREETS_ST_TAMMANY,
};

/** The street classes at map scale (metres of the parish field): surface width, sidewalks, lane dashes, lights. */
export const CW_CLASSES = {
  arterial: { width: 14, sidewalk: true, lanes: true, lights: true, colour: 0x45484d },
  collector: { width: 10, sidewalk: true, lanes: false, lights: false, colour: 0x4f5156 },
  local: { width: 7, sidewalk: false, lanes: false, lights: false, colour: 0x5b5d61 },
};
/** Named road kinds that get kerbs and sidewalks (and, for an avenue, lane dashes and lights). */
export const CW_NAMED_SIDEWALK = { avenue: { lanes: true, lights: true }, street: { lanes: false, lights: false } };
/** Kerb and sidewalk widths (metres), their lift above the ground, and the street surface's lift (under a named road's). */
export const CW_KERB = 0.4, CW_SIDEWALK = 3, CW_SIDEWALK_LIFT = 0.3, CW_STREET_LIFT = 0.16;
/** Streetlight spacing along an arterial or avenue (metres); the phone tier keeps every other one. */
export const CW_LIGHT_SPACING = 45;
/** Crosswalks are painted at junctions of sidewalk streets within this distance of a site. */
export const CW_CROSSWALK_NEAR_SITE = 320;
/** Budgets per streamed chunk: the street mesh's triangles, streetlights, and the local street length the generator keeps. */
export const CW_BUDGET = { chunkTriangles: 9000, chunkLights: 24, chunkLocalMetres: 1400, meshesPerChunk: 1, fixedMeshes: 3 };
/** Streets appear only in these chunk rings, per tier (the massing ring or less). */
export const CW_STREET_RADIUS = { low: 1, balanced: 2, high: 2 };

/** The massing kinds that are buildings, with their footprint half-extents (x, z) and height at scale 1 ("h" = the spot's h). */
export const CW_BUILDINGS = {
  quarterBlock: { hx: 9, hz: 7, h: 8 },
  gardenHouse: { hx: 6, hz: 5, h: 9.2 },
  suburbHouse: { hx: 5, hz: 4.5, h: 7.1 },
  shed: { hx: 20, hz: 11, h: "h", unitH: true },
  tower: { hx: 11, hz: 11, h: "h", unitH: true },
  campusBlock: { hx: 14, hz: 9, h: "h", unitH: true },
  tank: { hx: 9, hz: 9, h: "h", unitH: true },
  stack: { hx: 1.6, hz: 1.6, h: "h", unitH: true },
  crane: { legs: [[-9, 0], [9, 0]], hx: 0.8, hz: 0.8, h: 34 },
};
/** A tree's clearance from a street (it is not a collider). */
const CW_TREE_R = 3;

// ------------------------------------------------------------------ fabric and lines

/** The street fabric of a parish: `[{ id, cls, width, pts }]` (empty for a San Francisco district). */
export function cwStreets(parish) {
  const f = CW_FABRIC[parish?.id];
  return (f?.streets ?? []).map((s) => ({ ...s, width: CW_CLASSES[s.cls]?.width ?? 7 }));
}

/** The provenance line of a parish's fabric, or null. */
export function cwProvenance(parish) { return CW_FABRIC[parish?.id]?.provenance ?? null; }

const cwLineCache = new WeakMap();
/**
 * Every line CITYWORKS draws or routes on: the named roads (`named: true`, their kind as cls) and the fabric.
 * Each carries `sidewalk`, `lanes`, `lights`.
 */
export function cwLines(parish) {
  const hit = cwLineCache.get(parish);
  if (hit) return hit;
  const lines = [];
  for (const r of parish.roads ?? []) {
    const k = NP_ROAD_KINDS[r.kind];
    if (!k || !Array.isArray(r.pts) || r.pts.length < 2) continue;
    const sw = CW_NAMED_SIDEWALK[r.kind];
    lines.push({ id: r.id, cls: r.kind, width: k.width, pts: r.pts, named: true, sidewalk: !!sw, lanes: !!sw?.lanes, lights: !!sw?.lights, deck: !!k.clearance || r.kind === "ferry" });
  }
  for (const s of cwStreets(parish)) {
    const c = CW_CLASSES[s.cls] ?? CW_CLASSES.local;
    lines.push({ id: s.id, cls: s.cls, width: c.width, pts: s.pts, named: false, sidewalk: c.sidewalk, lanes: c.lanes, lights: c.lights, deck: false });
  }
  cwLineCache.set(parish, lines);
  return lines;
}

// ------------------------------------------------------------------ segment grid

const CW_CELL = 64;
/** A spatial index of line segments: `{ query(x, z, r) -> [{ line, i, a, b }] }`. */
export function cwSegmentGrid(lines, cell = CW_CELL) {
  const grid = new Map();
  const put = (k, seg) => { let l = grid.get(k); if (!l) grid.set(k, (l = [])); l.push(seg); };
  lines.forEach((line, li) => {
    for (let i = 1; i < line.pts.length; i++) {
      const a = line.pts[i - 1], b = line.pts[i];
      const seg = { line, li, i, a, b };
      const x0 = Math.floor(Math.min(a[0], b[0]) / cell), x1 = Math.floor(Math.max(a[0], b[0]) / cell);
      const z0 = Math.floor(Math.min(a[1], b[1]) / cell), z1 = Math.floor(Math.max(a[1], b[1]) / cell);
      for (let gz = z0; gz <= z1; gz++) for (let gx = x0; gx <= x1; gx++) put(`${gx},${gz}`, seg);
    }
  });
  return {
    grid, cell,
    query(x, z, r) {
      const out = new Set();
      for (let gz = Math.floor((z - r) / cell); gz <= Math.floor((z + r) / cell); gz++)
        for (let gx = Math.floor((x - r) / cell); gx <= Math.floor((x + r) / cell); gx++) for (const s of grid.get(`${gx},${gz}`) ?? []) out.add(s);
      return [...out];
    },
  };
}

/** Distance from (x, z) to segment a–b, with the parameter t and the signed side (+ left of a→b in x-east/z-south). */
export function cwSegDist(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1e-9;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2));
  const px = a[0] + dx * t, pz = a[1] + dz * t;
  return { d: Math.hypot(x - px, z - pz), t, px, pz, side: Math.sign(dx * (z - a[1]) - dz * (x - a[0])) };
}

const cwGridCache = new WeakMap();
function cwGridOf(parish) {
  let g = cwGridCache.get(parish);
  if (!g) { g = cwSegmentGrid(cwLines(parish)); cwGridCache.set(parish, g); }
  return g;
}

// ------------------------------------------------------------------ sidewalks

/** The sidewalk band of a line: from the kerb's outer edge to the sidewalk's outer edge (distance from the centreline). */
export function cwSidewalkBand(line) { const i = line.width / 2 + CW_KERB; return [i, i + CW_SIDEWALK]; }

/** SEAM — true on a sidewalk (both sides of arterial and collector streets, named avenues and streets); never on water. */
export function cwSidewalkAt(parish, x, z) {
  const g = cwGridOf(parish);
  let band = false;
  for (const s of g.query(x, z, 12)) {
    if (!s.line.sidewalk) continue;
    const [i0, i1] = cwSidewalkBand(s.line);
    const { d } = cwSegDist(x, z, s.a, s.b);
    if (d < s.line.width / 2) return false; // on a carriageway (a crossing street's surface wins)
    if (d >= i0 && d <= i1) band = true;
  }
  return band && !npWaterAt(parish, x, z);
}

/** The nearest line (drawn or named) to (x, z) within r: `{ line, d, px, pz }` or null. */
export function cwNearestLine(parish, x, z, r = 200, filter = null) {
  const g = cwGridOf(parish);
  let best = null;
  for (let rr = Math.min(r, 32); ; rr = Math.min(r, rr * 2)) {
    for (const s of g.query(x, z, rr)) {
      if (filter && !filter(s.line)) continue;
      const h = cwSegDist(x, z, s.a, s.b);
      if (!best || h.d < best.d) best = { line: s.line, d: h.d, px: h.px, pz: h.pz };
    }
    if ((best && best.d <= rr) || rr >= r) break;
  }
  return best && best.d <= r ? best : null;
}

// ------------------------------------------------------------------ road graph

/**
 * Build a road graph over polylines `[{ pts, cls, width, named? }]`: every crossing splits both lines, every
 * dangling end within `snap` metres of another line joins it. Returns `{ nodes: [[x, z]], edges: [{ a, b, cls,
 * width, len, line }] }`. Pure and deterministic (tools/gen_cw_streets.mjs uses it too).
 */
export function cwBuildGraph(lines, { snap = 6 } = {}) {
  const grid = cwSegmentGrid(lines, 48);
  const splits = lines.map((l) => l.pts.map(() => [])); // per line, per segment index i (1..n-1): list of [t, x, z]
  const addSplit = (li, i, t, x, z) => splits[li][i].push([t, x, z]);
  const seen = new Set();
  for (const segs of grid.grid.values()) {
    for (let p = 0; p < segs.length; p++) for (let q = p + 1; q < segs.length; q++) {
      const s = segs[p], u = segs[q];
      if (s.li === u.li && Math.abs(s.i - u.i) <= 1) continue;
      const key = s.li < u.li || (s.li === u.li && s.i < u.i) ? `${s.li}:${s.i}|${u.li}:${u.i}` : `${u.li}:${u.i}|${s.li}:${s.i}`;
      if (seen.has(key)) continue; seen.add(key);
      const r = s.b[0] - s.a[0], rz = s.b[1] - s.a[1], w = u.b[0] - u.a[0], wz = u.b[1] - u.a[1];
      const den = r * wz - rz * w;
      if (Math.abs(den) < 1e-9) continue;
      const qx = u.a[0] - s.a[0], qz = u.a[1] - s.a[1];
      const t = (qx * wz - qz * w) / den, v = (qx * rz - qz * r) / den;
      if (t < 0 || t > 1 || v < 0 || v > 1) continue;
      const x = s.a[0] + r * t, z = s.a[1] + rz * t;
      addSplit(s.li, s.i, t, x, z); addSplit(u.li, u.i, v, x, z);
    }
  }
  // Dangling ends: join the nearest other line within snap.
  const ends = lines.map((l) => [l.pts[0].slice(), l.pts[l.pts.length - 1].slice()]);
  lines.forEach((l, li) => {
    for (const e of [0, 1]) {
      const [x, z] = ends[li][e];
      let best = null;
      for (const s of grid.query(x, z, snap)) {
        if (s.li === li) continue;
        const h = cwSegDist(x, z, s.a, s.b);
        if (h.d <= snap && (!best || h.d < best.h.d)) best = { s, h };
      }
      if (best) { addSplit(best.s.li, best.s.i, best.h.t, best.h.px, best.h.pz); ends[li][e] = [best.h.px, best.h.pz]; }
    }
  });
  const nodes = [], index = new Map();
  const nodeOf = (x, z) => {
    const k = `${Math.round(x * 2)},${Math.round(z * 2)}`;
    let n = index.get(k);
    if (n === undefined) { n = nodes.length; nodes.push([Math.round(x * 10) / 10, Math.round(z * 10) / 10]); index.set(k, n); }
    return n;
  };
  const edges = [];
  lines.forEach((l, li) => {
    const seq = [];
    const n = l.pts.length;
    seq.push({ x: ends[li][0][0], z: ends[li][0][1], node: true });
    for (let i = 1; i < n; i++) {
      for (const [, x, z] of splits[li][i].sort((a, b) => a[0] - b[0])) seq.push({ x, z, node: true });
      const last = i === n - 1;
      seq.push(last ? { x: ends[li][1][0], z: ends[li][1][1], node: true } : { x: l.pts[i][0], z: l.pts[i][1], node: false });
    }
    let from = nodeOf(seq[0].x, seq[0].z), len = 0;
    for (let k = 1; k < seq.length; k++) {
      len += Math.hypot(seq[k].x - seq[k - 1].x, seq[k].z - seq[k - 1].z);
      if (!seq[k].node) continue;
      const to = nodeOf(seq[k].x, seq[k].z);
      if (to !== from) edges.push({ a: from, b: to, cls: l.cls, width: l.width, len: Math.round(len * 10) / 10, line: l.id });
      from = to; len = 0;
    }
  });
  return { nodes, edges };
}

/** Connected components of a graph: `{ count, of: Int32Array (node -> component) }`. */
export function cwComponents(graph) {
  const parent = new Int32Array(graph.nodes.length).map((_, i) => i);
  const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  for (const e of graph.edges) { const a = find(e.a), b = find(e.b); if (a !== b) parent[a] = b; }
  const of = new Int32Array(graph.nodes.length), ids = new Map();
  const used = new Set(); for (const e of graph.edges) { used.add(e.a); used.add(e.b); }
  for (let i = 0; i < graph.nodes.length; i++) { const r = find(i); if (!ids.has(r)) ids.set(r, ids.size); of[i] = ids.get(r); }
  const comps = new Set(); for (const i of used) comps.add(of[i]);
  return { count: comps.size, of };
}

const cwGraphCache = new WeakMap();
/** SEAM — the road graph of a parish: named roads plus the fabric, `{ nodes: [[x, z]], edges: [{ a, b, cls, width, len }] }`. */
export function cwRoadGraph(parish) {
  let g = cwGraphCache.get(parish);
  if (!g) { g = cwBuildGraph(cwLines(parish)); cwGraphCache.set(parish, g); }
  return g;
}

/** Junctions of the graph where two or more sidewalk lines meet (degree ≥ 3), within CW_CROSSWALK_NEAR_SITE of a site. */
export function cwCrosswalkNodes(parish) {
  const g = cwRoadGraph(parish), sites = parish.sites ?? [];
  const lines = new Map(cwLines(parish).map((l) => [l.id, l]));
  const deg = new Map();
  for (const e of g.edges) {
    if (!lines.get(e.line)?.sidewalk) continue;
    for (const n of [e.a, e.b]) { const l = deg.get(n) ?? []; l.push(e); deg.set(n, l); }
  }
  const out = [];
  for (const [n, es] of deg) {
    if (es.length < 3) continue;
    const [x, z] = g.nodes[n];
    if (!sites.some((s) => Math.hypot(x - s.position[0], z - s.position[1]) < CW_CROSSWALK_NEAR_SITE)) continue;
    if (npWaterAt(parish, x, z)) continue;
    out.push({ node: n, x, z, edges: es });
  }
  return out;
}

// ------------------------------------------------------------------ solids

/** Footprint half-extents of a rotated box (rotation about y). */
function cwRotExtents(hx, hz, rot) {
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot));
  return [c * hx + s * hz, s * hx + c * hz];
}

const cwFilterCache = new WeakMap();
/** SEAM — npBuildParish's opts.massFilter: false for a massing spot that would stand on a fabric street or its sidewalk. */
export function cwMassFilter(parish) {
  let f = cwFilterCache.get(parish);
  if (f) return f;
  const fabric = cwLines(parish).filter((l) => !l.named);
  const grid = cwSegmentGrid(fabric);
  f = (spot) => {
    if (!fabric.length) return true;
    const b = CW_BUILDINGS[spot.kind];
    const r = b ? Math.hypot(b.legs ? 10 : b.hx, b.hz) * (spot.s ?? 1) * 0.85 : CW_TREE_R;
    for (const s of grid.query(spot.x, spot.z, r + 20)) {
      const reach = s.line.width / 2 + (s.line.sidewalk ? CW_KERB + CW_SIDEWALK : 1) + r;
      if (cwSegDist(spot.x, spot.z, s.a, s.b).d < reach) return false;
    }
    return true;
  };
  cwFilterCache.set(parish, f);
  return f;
}

/** The boxes of one massing spot (a crane gives one per leg). */
export function cwSpotBoxes(spot) {
  const b = CW_BUILDINGS[spot.kind];
  if (!b) return [];
  const s = spot.s ?? 1;
  const height = b.h === "h" ? spot.h : b.h * s;
  const y0 = spot.y - 0.15, y1 = y0 + height;
  if (b.legs) {
    const c = Math.cos(spot.rot), sn = Math.sin(spot.rot);
    return b.legs.map(([lx, lz]) => {
      const x = spot.x + (lx * c + lz * sn) * s, z = spot.z + (-lx * sn + lz * c) * s;
      return { min: [x - b.hx * s, y0, z - b.hz * s], max: [x + b.hx * s, y1, z + b.hz * s], kind: spot.kind };
    });
  }
  const [ex, ez] = cwRotExtents(b.hx * s, b.hz * s, spot.rot);
  return [{ min: [spot.x - ex, y0, spot.z - ez], max: [spot.x + ex, y1, spot.z + ez], kind: spot.kind }];
}

/** The site building of site index i (the same box np-world.js draws: w × h × d at (-14, -12) from the site). */
export function cwSiteBuilding(parish, i) {
  const s = npPrepare(parish).sites[i];
  const w = 16 + (i % 3) * 4, d = 10 + (i % 2) * 4, h = 5 + (i % 4);
  const cx = s.position[0] - 14, cz = s.position[1] - 12, y = npHeightAt(parish, s.position[0], s.position[1]);
  return { site: s, cx, cz, w, d, h, y };
}

/** The door of a site building: on the face toward the nearest road (named or fabric). */
export function cwDoorOf(parish, b) {
  const near = cwNearestLine(parish, b.cx, b.cz, 2000, (l) => l.cls !== "ferry");
  const dx = near ? near.px - b.cx : 0, dz = near ? near.pz - b.cz : 1;
  if (Math.abs(dx) * b.d > Math.abs(dz) * b.w) {
    const e = dx > 0; return { x: b.cx + (e ? b.w / 2 : -b.w / 2), z: b.cz, face: e ? "e" : "w" };
  }
  const so = dz > 0; return { x: b.cx, z: b.cz + (so ? b.d / 2 : -b.d / 2), face: so ? "s" : "n" };
}

const cwColliderCache = new WeakMap();
/** SEAM — the collider boxes of one chunk ("cx,cz"): massing buildings after cwMassFilter and site buildings (with doors). */
export function cwColliders(parish, chunkKey) {
  let per = cwColliderCache.get(parish);
  if (!per) cwColliderCache.set(parish, (per = new Map()));
  if (per.has(chunkKey)) return per.get(chunkKey);
  const [cx, cz] = String(chunkKey).split(",").map(Number);
  const keep = cwMassFilter(parish);
  const out = [];
  for (const spot of npMassingForChunk(parish, cx, cz)) if (keep(spot)) out.push(...cwSpotBoxes(spot));
  const sites = npPrepare(parish).sites;
  for (let i = 0; i < sites.length; i++) {
    const b = cwSiteBuilding(parish, i);
    if (npChunkOf(b.cx, b.cz).key !== chunkKey) continue;
    out.push({ min: [b.cx - b.w / 2, b.y, b.cz - b.d / 2], max: [b.cx + b.w / 2, b.y + b.h, b.cz + b.d / 2], kind: "site", id: b.site.id, door: cwDoorOf(parish, b) });
  }
  per.set(chunkKey, out);
  return out;
}

/**
 * Move a walker of radius r from (x, z) toward (nx, nz) against the colliders of the chunks around it; slides along a
 * wall (x then z). Returns [x, z].
 */
export function cwBlockWalk(parish, x, z, nx, nz, r = 0.4) {
  const boxes = [];
  const { cx, cz } = npChunkOf(nx, nz);
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) boxes.push(...cwColliders(parish, `${cx + dx},${cz + dz}`));
  const hit = (px, pz) => boxes.some((b) => px > b.min[0] - r && px < b.max[0] + r && pz > b.min[2] - r && pz < b.max[2] + r);
  if (!hit(nx, nz) || hit(x, z)) return [nx, nz]; // free, or already inside (a spawn point): let the walker out
  if (!hit(nx, z)) return [nx, z];
  if (!hit(x, nz)) return [x, nz];
  return [x, z];
}

/** The chunk key a point falls in (re-exported for callers of cwColliders). */
export function cwChunkKey(x, z) { return npChunkOf(x, z).key; }
void NP_SIZE; void NP_CHUNK; void NP_PAD; void npPolyDistance;
