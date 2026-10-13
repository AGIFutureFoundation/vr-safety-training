// REALISM-2 (docs/consoles/REALISM-2.md): street details that read as a kept street — drop kerbs at the zebra crossings,
// bollards beside them, gutter drains along the carriageway, utility covers and tree pits on the sidewalks. One merged,
// vertex-coloured mesh per streamed chunk (one draw call), built from CITYWORKS' pure answers (cwLines, cwSegmentGrid,
// cwCrosswalkNodes, cwColliders) so a new map gets them too. Contact AO is baked into the vertex colours where a part
// meets the ground. Procedural and generic by kind; never data.
//
// Seams (pure except the mount):
//   rzStreetForChunk(parish, cx, cz, tier) -> { parts: [{ kind, x, y, z, yaw, line }], triangles, candidates, dropped }
//       deterministic; tier picks the budget ("low": nothing). A lower tier's parts are a prefix of the higher's.
//   rzStreetGeometry(THREE, parts) -> BufferGeometry (position, normal, color) or null
//   rzStreetOnLane(parish, x, z, r) / rzStreetInBuilding(parish, x, z, r)   the placement tests the checker re-runs
//   rzMountStreet({ THREE, root, parish, tier, ua }) -> { update(x, z, budget), stats(), chunkStats(), group, level, dispose() }
//       mounted beside cwMountStreets (DETAIL holds NP_MASSING_HOOKS' streaming hooks); call update(x, z) where the
//       streets are updated. Inert (no mesh, no material) when rzLevel(tier, ua) is null: the phone and a headset.
//
// Budget per chunk (stated here, measured by tools/check_rz.mjs on every chunk of every map): high 1 mesh / 1,500
// triangles, balanced 1 mesh / 600, phone nothing. Candidates are ordered drop kerbs, bollards, drains, covers, tree
// pits and cut at the budget, so what matters at a crossing is kept first.

import { NP_SIZE, NP_CHUNK, npHeightAt, npWaterAt, npChunksAround } from "./np-parish.js";
import { cwLines, cwSegmentGrid, cwSegDist, cwCrosswalkNodes, cwSidewalkBand, cwColliders, CW_KERB, CW_SIDEWALK, CW_SIDEWALK_LIFT, CW_STREET_LIFT, CW_STREET_RADIUS } from "./cw-cityworks.js";
import { rzLevel, RZ_SURFACES } from "./rz-surfaces.js";

/** The per-chunk budget per tier (meshes, triangles). */
export const RZ_STREET_BUDGET = { meshes: 1, triangles: { high: 1500, balanced: 600, low: 0 } };
/** The gutter strip beside the kerb (m): drains sit in it; nothing REALISM places goes nearer the centreline. */
export const RZ_GUTTER = 0.6;
/** The parts: triangles each, the kinds a tier takes, spacing along a sidewalk line (m). */
export const RZ_STREET_PARTS = {
  dropKerb: { tris: 4, note: "a flush ramp through the kerb at each end of a zebra crossing; procedural" },
  bollard: { tris: 10, note: "a short post beside the drop kerb; procedural" },
  drain: { tris: 2, note: "a gutter grate flush with the carriageway edge; procedural" },
  cover: { tris: 8, note: "a round utility cover on the sidewalk; procedural" },
  treePit: { tris: 10, note: "a soil square with a kerb frame on the sidewalk; procedural" },
};
export const RZ_STREET_TIER_KINDS = { high: ["dropKerb", "bollard", "drain", "cover", "treePit"], balanced: ["dropKerb", "bollard", "drain"], low: [] };
export const RZ_STREET_SPACING = { drain: 23, cover: 41, treePit: 19 };
const RZ_ORDER = ["dropKerb", "bollard", "drain", "cover", "treePit"];
/** Colours (linear RGB-ish hex): the kerb's concrete, cast iron, soil, a painted bollard. */
export const RZ_STREET_COL = { kerb: 0x9a9690, iron: 0x3a3d40, soil: 0x4a3b2c, bollard: 0x2f3338, bollardCap: 0xb9bec4, frame: 0x8c8880 };
/** The contact AO at the ground (a part's lowest vertices are this much of their colour). */
export const RZ_STREET_AO = 0.62;
/** Named roads (no fabric sidewalk) keep a clear shoulder beyond their width (m). */
const RZ_SHOULDER = 1;

const rzGridCache = new WeakMap(), rzCrossCache = new WeakMap(), rzLenCache = new WeakMap();
function rzGrid(parish) { let g = rzGridCache.get(parish); if (!g) { g = cwSegmentGrid(cwLines(parish)); rzGridCache.set(parish, g); } return g; }
function rzCrossings(parish) { let c = rzCrossCache.get(parish); if (!c) { c = cwCrosswalkNodes(parish); rzCrossCache.set(parish, c); } return c; }
/** Cumulative length at each vertex of a line (so spacing phases are continuous across chunks). */
function rzLengths(line) {
  let L = rzLenCache.get(line);
  if (!L) { L = [0]; for (let i = 1; i < line.pts.length; i++) L.push(L[i - 1] + Math.hypot(line.pts[i][0] - line.pts[i - 1][0], line.pts[i][1] - line.pts[i - 1][1])); rzLenCache.set(line, L); }
  return L;
}
function rzStrHash(s) { let h = 2166136261 >>> 0; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; }

/** True when (x, z) with radius r lies on any line's running lanes (inside width/2 − gutter), or a named road's shoulder. */
export function rzStreetOnLane(parish, x, z, r = 0.3) {
  for (const s of rzGrid(parish).query(x, z, 24)) {
    const { d } = cwSegDist(x, z, s.a, s.b);
    const edge = s.line.sidewalk ? s.line.width / 2 - RZ_GUTTER : s.line.width / 2 + RZ_SHOULDER;
    if (d - r < edge) return true;
  }
  return false;
}
/** True when (x, z) with radius r lies inside a building box of its chunk or a neighbour (CITYWORKS' colliders). */
export function rzStreetInBuilding(parish, x, z, r = 0.3) {
  const cx = Math.floor((x + NP_SIZE / 2) / NP_CHUNK), cz = Math.floor((z + NP_SIZE / 2) / NP_CHUNK);
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    for (const b of cwColliders(parish, `${cx + dx},${cz + dz}`)) if (x > b.min[0] - r && x < b.max[0] + r && z > b.min[2] - r && z < b.max[2] + r) return true;
  }
  return false;
}
const rzPlaceable = (parish, x, z, r) => Math.abs(x) < NP_SIZE / 2 - 4 && Math.abs(z) < NP_SIZE / 2 - 4 && !npWaterAt(parish, x, z) && !rzStreetOnLane(parish, x, z, r) && !rzStreetInBuilding(parish, x, z, r);
const rzRadius = { dropKerb: 0.6, bollard: 0.15, drain: 0.25, cover: 0.35, treePit: 0.7 };

/**
 * The parts of one chunk, deterministic, inside the tier's budget. Crossings: at each zebra crossing's two ends (8 m
 * from the node along each sidewalk line, as CITYWORKS draws them) a drop kerb straddles the kerb and two bollards
 * stand behind it. Along every sidewalk line: a drain in the gutter every 23 m (sides alternating), a cover on the
 * sidewalk every 41 m, and on lines with lanes (avenues, arterials) a tree pit every 19 m near the kerb.
 */
export function rzStreetForChunk(parish, cx, cz, tier = "high") {
  const kinds = RZ_STREET_TIER_KINDS[tier] ?? [];
  const budget = RZ_STREET_BUDGET.triangles[tier] ?? 0;
  const out = { parts: [], triangles: 0, candidates: 0, dropped: 0 };
  if (!kinds.length || budget <= 0) return out;
  const x0 = -NP_SIZE / 2 + cx * NP_CHUNK, z0 = -NP_SIZE / 2 + cz * NP_CHUNK, x1 = x0 + NP_CHUNK, z1 = z0 + NP_CHUNK;
  const inChunk = (x, z) => x >= x0 && x < x1 && z >= z0 && z < z1;
  const grid = rzGrid(parish);
  const cand = { dropKerb: [], bollard: [], drain: [], cover: [], treePit: [] };
  const yOf = (x, z, lift) => npHeightAt(parish, x, z) + lift;
  // crossings whose ends may fall in this chunk (a node up to 10 m outside still reaches in)
  for (const c of rzCrossings(parish)) {
    if (c.x < x0 - 12 || c.x >= x1 + 12 || c.z < z0 - 12 || c.z >= z1 + 12) continue;
    for (const s of grid.query(c.x, c.z, 14)) {
      if (!s.line.sidewalk || s.line.deck) continue;
      const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); if (L < 1) continue;
      const ux = (s.b[0] - s.a[0]) / L, uz = (s.b[1] - s.a[1]) / L, nx = -uz, nz = ux, w = s.line.width / 2;
      const yaw = Math.atan2(ux, uz);
      for (const sg of [1, -1]) {
        const px = c.x + ux * 8 * sg, pz = c.z + uz * 8 * sg;
        if (cwSegDist(px, pz, s.a, s.b).d > 0.8) continue;
        for (const side of [1, -1]) {
          const kx = px + nx * side * (w + 0.6), kz = pz + nz * side * (w + 0.6);
          if (inChunk(kx, kz)) cand.dropKerb.push({ kind: "dropKerb", x: kx, z: kz, y: yOf(kx, kz, CW_STREET_LIFT), yaw, line: s.line.id, side, top: CW_SIDEWALK_LIFT - CW_STREET_LIFT });
          const bd = w + CW_KERB + 0.9;
          for (const o of [1.4, -1.4]) {
            const bx = px + ux * o + nx * side * bd, bz = pz + uz * o + nz * side * bd;
            if (inChunk(bx, bz)) cand.bollard.push({ kind: "bollard", x: bx, z: bz, y: yOf(bx, bz, CW_SIDEWALK_LIFT), yaw, line: s.line.id });
          }
        }
      }
    }
  }
  // along the sidewalk lines that touch this chunk
  const seen = new Set();
  for (const s of grid.query((x0 + x1) / 2, (z0 + z1) / 2, NP_CHUNK * 0.71 + 8)) {
    const l = s.line;
    if (!l.sidewalk || l.deck || seen.has(l.id)) continue;
    seen.add(l.id);
    const Ls = rzLengths(l), total = Ls[Ls.length - 1], h = rzStrHash(l.id), [i0] = cwSidewalkBand(l), w = l.width / 2;
    const walk = (kind, spacing, lateral, lift, both) => {
      if (!kinds.includes(kind)) return;
      let acc = (h % 1000) / 1000 * spacing + spacing * 0.5, k = 0;
      for (let i = 1; i < l.pts.length; i++) {
        const a = l.pts[i - 1], b = l.pts[i], L = Ls[i] - Ls[i - 1]; if (L < 1e-6) continue;
        const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, yaw = Math.atan2(ux, uz);
        while (acc < Ls[i]) {
          const t = acc - Ls[i - 1], side = both ? 1 : (k % 2 ? -1 : 1);
          const px = a[0] + ux * t, pz = a[1] + uz * t;
          const sides = both ? [1, -1] : [side];
          for (const sd of sides) {
            const x = px + nx * sd * lateral, z = pz + nz * sd * lateral;
            if (inChunk(x, z) && t > 2 && t < L - 2 && acc > 10 && acc < total - 10) cand[kind].push({ kind, x, z, y: yOf(x, z, lift), yaw, line: l.id, side: sd });
          }
          acc += spacing; k++;
        }
      }
    };
    walk("drain", RZ_STREET_SPACING.drain, w - 0.3, l.named ? 0.3 : CW_STREET_LIFT, false);
    walk("cover", RZ_STREET_SPACING.cover, i0 + 1.0, CW_SIDEWALK_LIFT, false);
    if (l.lanes) walk("treePit", RZ_STREET_SPACING.treePit, i0 + CW_SIDEWALK - 1.0, CW_SIDEWALK_LIFT, true);
  }
  // keep what fits, in priority order; every kept part passes the placement tests (drive lane, water, building)
  for (const kind of RZ_ORDER) {
    if (!kinds.includes(kind)) continue;
    const list = cand[kind].sort((p, q) => p.x - q.x || p.z - q.z);
    for (const p of list) {
      out.candidates++;
      if (!rzPlaceable(parish, p.x, p.z, rzRadius[kind])) { out.dropped++; continue; }
      const tris = RZ_STREET_PARTS[kind].tris;
      if (out.triangles + tris > budget) { out.dropped++; continue; }
      out.parts.push(p); out.triangles += tris;
    }
  }
  return out;
}

// ------------------------------------------------------------------ geometry

function rzCol(hex, k = 1) { return [((hex >> 16) & 255) / 255 * k, ((hex >> 8) & 255) / 255 * k, (hex & 255) / 255 * k]; }
/** Merges the parts into one vertex-coloured, flat-normal geometry (contact AO on each part's ground vertices). */
export function rzStreetGeometry(THREE, parts) {
  if (!parts?.length) return null;
  const pos = [], col = [], nrm = [];
  const tri = (a, b, c, ca, cb, cc) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const L = Math.hypot(nx, ny, nz) || 1; nx /= L; ny /= L; nz /= L;
    pos.push(...a, ...b, ...c); col.push(...ca, ...cb, ...cc); for (let i = 0; i < 3; i++) nrm.push(nx, ny, nz);
  };
  const quad = (a, b, c, d, ca, cb, cc, cd) => { tri(a, b, c, ca, cb, cc); tri(a, c, d, ca, cc, cd); };
  for (const p of parts) {
    const cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
    // local u along the line, v across (toward the part's side), to world
    const W = (u, v, y) => [p.x + u * sy + v * cy, y, p.z + u * cy - v * sy];
    const side = p.side ?? 1;
    if (p.kind === "dropKerb") {
      // a ramp 1.6 m along the kerb, from the gutter (flush) up to the sidewalk, 1.4 m deep; two side triangles
      const lo = p.y + 0.01, hi = p.y + (p.top ?? 0.14) + 0.01, hu = 0.8, dv = 0.7;
      const g = rzCol(RZ_STREET_COL.kerb, RZ_STREET_AO), k = rzCol(RZ_STREET_COL.kerb);
      const a = W(-hu, -dv * side, lo), b = W(hu, -dv * side, lo), c = W(hu, dv * side, hi), d = W(-hu, dv * side, hi);
      if (side > 0) quad(a, b, c, d, g, g, k, k); else quad(b, a, d, c, g, g, k, k);
      const e = W(-hu, dv * side, lo), f = W(hu, dv * side, lo);
      if (side > 0) { tri(a, d, e, g, k, g); tri(b, f, c, g, g, k); } else { tri(a, e, d, g, g, k); tri(b, c, f, g, k, g); }
    } else if (p.kind === "bollard") {
      const r = 0.12, hgt = 0.95, y0 = p.y, y1 = p.y + hgt;
      const lo = rzCol(RZ_STREET_COL.bollard, RZ_STREET_AO), hiC = rzCol(RZ_STREET_COL.bollard), cap = rzCol(RZ_STREET_COL.bollardCap);
      const c4 = [[-r, -r], [r, -r], [r, r], [-r, r]];
      for (let i = 0; i < 4; i++) { const [u0, v0] = c4[i], [u1, v1] = c4[(i + 1) % 4]; quad(W(u0, v0, y0), W(u1, v1, y0), W(u1, v1, y1), W(u0, v0, y1), lo, lo, hiC, hiC); }
      quad(W(-r, -r, y1), W(-r, r, y1), W(r, r, y1), W(r, -r, y1), cap, cap, cap, cap);
    } else if (p.kind === "drain") {
      const y = p.y + 0.03, c = rzCol(RZ_STREET_COL.iron);
      quad(W(-0.45, -0.2, y), W(-0.45, 0.2, y), W(0.45, 0.2, y), W(0.45, -0.2, y), c, c, c, c);
    } else if (p.kind === "cover") {
      const y = p.y + 0.03, r = 0.35, c = rzCol(RZ_STREET_COL.iron), ce = rzCol(RZ_STREET_COL.iron, 0.8), n = 8;
      for (let i = 0; i < n; i++) { const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2; tri(W(0, 0, y), W(Math.cos(a1) * r, Math.sin(a1) * r, y), W(Math.cos(a0) * r, Math.sin(a0) * r, y), c, ce, ce); }
    } else if (p.kind === "treePit") {
      const y = p.y + 0.03, y2 = y + 0.05, ro = 0.7, ri = 0.55, s = rzCol(RZ_STREET_COL.soil, 0.85), f = rzCol(RZ_STREET_COL.frame), fa = rzCol(RZ_STREET_COL.frame, RZ_STREET_AO);
      quad(W(-ri, -ri, y), W(-ri, ri, y), W(ri, ri, y), W(ri, -ri, y), s, s, s, s);
      const o = [[-ro, -ro], [-ro, ro], [ro, ro], [ro, -ro]], iN = [[-ri, -ri], [-ri, ri], [ri, ri], [ri, -ri]];
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(W(o[i][0], o[i][1], y2), W(o[j][0], o[j][1], y2), W(iN[j][0], iN[j][1], y2), W(iN[i][0], iN[i][1], y2), fa, fa, f, f); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeBoundingSphere?.();
  return g;
}

// ------------------------------------------------------------------ mount

/** SEAM — the street details under `root`, streamed by update(x, z) like CITYWORKS' streets. Inert off the desktop tiers. */
export function rzMountStreet({ THREE, root, parish, tier = "high", ua } = {}) {
  const level = rzLevel(tier, ua);
  const group = new THREE.Group(); group.name = "rz-street";
  const loaded = new Map();
  if (!level) return { level: null, group, update() {}, stats: () => ({ level: null, chunks: 0, meshes: 0, triangles: 0, parts: 0 }), chunkStats: () => [], dispose() {} };
  root.add(group);
  const radius = CW_STREET_RADIUS[tier] ?? 2;
  const mat = level === "high"
    ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: RZ_SURFACES.concrete.rough, metalness: 0 })
    : new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.name = `rz-street-${level}`;
  function drop(k) { const c = loaded.get(k); if (c?.mesh) { group.remove(c.mesh); c.mesh.geometry.dispose(); } loaded.delete(k); }
  function update(x, z, budget = 2) {
    const want = npChunksAround(x, z, radius).sort((a, b) => a.ring - b.ring);
    const keep = new Set(want.map((w) => w.key));
    for (const k of [...loaded.keys()]) if (!keep.has(k)) drop(k);
    let built = 0;
    for (const w of want) {
      if (loaded.has(w.key)) continue;
      if (built >= budget) break;
      const r = rzStreetForChunk(parish, w.cx, w.cz, tier);
      const geo = rzStreetGeometry(THREE, r.parts);
      let mesh = null;
      if (geo) { mesh = new THREE.Mesh(geo, mat); mesh.name = `rz-street-${w.key}`; mesh.frustumCulled = true; group.add(mesh); }
      loaded.set(w.key, { mesh, triangles: r.triangles, parts: r.parts.length });
      built++;
    }
  }
  const chunkStats = () => [...loaded.entries()].map(([key, c]) => ({ key, meshes: c.mesh ? 1 : 0, triangles: c.triangles, parts: c.parts }));
  const stats = () => { let meshes = 0, triangles = 0, parts = 0; for (const c of loaded.values()) { if (c.mesh) meshes++; triangles += c.triangles; parts += c.parts; } return { level, chunks: loaded.size, meshes, triangles, parts }; };
  function dispose() { for (const k of [...loaded.keys()]) drop(k); root.remove(group); mat.dispose(); }
  return { level, group, update, stats, chunkStats, dispose };
}
