/**
 * ROBO-EXTERIORS (loop 10, prefix `fx`, docs/consoles/ROBO-EXTERIORS.md): the six robot sites' buildings from outside.
 * Each robot site (rb-robotics-data.js RB_SITES) gets a dedicated, generic exterior of its kind beside its pad — a
 * fabrication hall, a research lab, a distribution warehouse, a port control tower with crane rails and a container-stack
 * edge, or a construction site — with its streetscape (bollards, EV chargers, loading-bay markings, pictogram-only safety
 * signs), canvas-drawn facade textures (1024 px atlas on the desktop high tier, 512 px on balanced, none on the phone) and
 * lit windows at night under ATMOS's clock (atLightsOn). It registers beside FACADES (it never touches
 * NP_MASSING_HOOKS or fcDetails): one fixed group per site, mounted by the parishes app.
 *
 * Seams (all names prefixed `fx`/`FX_`; the bundler shares one scope):
 *
 *     fxSitesFor(parish) -> [{ ...RB_SITES entry, position: [x, z] }]           (the same positions rbSitesFor resolves)
 *     fxSiteLayout(parish, site) -> { id, kind, x, z, y, yaw, w, d, h, door: { x, z, face, out: [x, z] }, boxes, clear, why }
 *     fxLayoutsFor(parish) -> layouts of this map's robot sites (pure; no three.js)
 *     fxColliders(parish) -> [{ min: [x, y, z], max: [x, y, z], kind, id, door }]  (for WALKABLE's collider seam)
 *     fxDoorFor(parish, siteId) -> { x, z, face, out } | null                      (ROBO-INTERIORS: where the walk-in starts)
 *     fxScene(parish, siteId, shot) -> { siteId, shot, parish, position: [x, y, z], target: [x, y, z], fov } | null
 *     fxBuildSite(THREE, layout, tier) -> THREE.Group "fx-site-<id>", userData.fx = { kind, meshes, triangles }
 *     fxMountExteriors({ THREE, root, parish, tier, hour }) -> { sites, layouts, setHour(h), counts(), scene(id, shot), dispose() }
 *
 * Budgets (FX_BUDGET, per site, measured by tools/check_exteriors.mjs): phone 1 mesh, balanced and high 2 meshes; the
 * site's chunk with FACADES' details and this kit stays inside FC_BUDGET per tier. Texture bytes per map (one shared
 * atlas + a quarter-size lit-window mask, mipmapped): phone 0, balanced <= 1.5 MiB, high <= 6 MiB.
 *
 * Assets rule: geometry from code, textures drawn on a canvas; nothing names a company, union or trade body, the signs are
 * pictograms only (no words), and no building models a real one — every kit is generic by kind.
 */
import { RB_SITES, RB_SSM } from "./rb-robotics-data.js";
import { npHeightAt, npWaterAt, npChunkOf, npMassingForChunk, NP_SIZE } from "./np-parish.js";
import { cwMassFilter, cwSpotBoxes, cwSiteBuilding, cwNearestLine, CW_KERB, CW_SIDEWALK } from "./cw-cityworks.js";
import { atLightsOn } from "./at-atmos.js";

/** The five building kinds (plain data): footprint w × d (m), body height h; the lot adds `front` m of yard toward the pad
 * (truck court, apron, signs) and `side` m each side (EV chargers) — the clearance test covers the whole lot. */
export const FX_KINDS = {
  fabHall: { label: "Fabrication hall", w: 30, d: 20, h: 9, front: 5, side: 5, details: ["tilt-up panels", "roll-up doors", "roof plant", "skylights", "parapet", "entrance canopy"] },
  researchLab: { label: "Research lab", w: 24, d: 16, h: 12, front: 7, side: 5, details: ["curtain-wall mullions", "entrance canopy", "roof plant screen"] },
  distWarehouse: { label: "Distribution warehouse", w: 40, d: 22, h: 10, front: 12, side: 4, details: ["dock doors", "dock bumpers", "dock lights", "raised dock", "truck-court markings", "corrugated cladding"] },
  portTower: { label: "Port control tower", w: 34, d: 10, h: 20, front: 1, side: 1, details: ["control tower", "glazed cab", "crane rails", "container-stack edge", "base building"] },
  constructionSite: { label: "Construction site", w: 40, d: 18, h: 10.2, front: 4, side: 1, details: ["site hoarding", "scaffold", "concrete frame", "site cabin", "water-filled barriers"] },
};
/** Which kind each robot site gets. */
export const FX_SITE_KIND = {
  "rb-site-soma-robot-cell": "fabHall",
  "rb-site-san-jose-robotics-lab": "researchLab",
  "rb-site-west-oakland-warehouse": "distWarehouse",
  "rb-site-orleans-warehouse": "distWarehouse",
  "rb-site-west-oakland-port-automation": "portTower",
  "rb-site-richland-drilling-robot": "constructionSite",
};
/** Pictogram-only safety signs (no words): id -> what the pictogram shows. */
export const FX_PICTOGRAMS = {
  robot: "robot arm in a warning triangle (robot operating)",
  walkway: "walking figure on a green panel (pedestrian walkway)",
  helmet: "head protection in a blue circle (hard hats on)",
  vehicle: "automated vehicle in a warning triangle (robots and vehicles moving)",
  charger: "plug on a green panel (EV charging)",
};
/** Stated budgets per site (meshes, triangles) and per map (texture bytes incl. mipmaps); atlas side per tier. */
export const FX_BUDGET = {
  meshesPerSite: { low: 1, balanced: 2, high: 2 },
  trianglesPerSite: { low: 1500, balanced: 7000, high: 7000 },
  textureBytes: { low: 0, balanced: 1572864, high: 6291456 },
  atlasPx: { low: 0, balanced: 512, high: 1024 },
};
/** The two establishing shots per site. */
export const FX_SHOTS = ["wide", "door"];

const FX_CELLS = ["tiltUp", "rollUp", "curtain", "corrugated", "dockDoor", "towerGlass", "hoarding", "cabin", "robot", "walkway", "helmet", "vehicle", "charger", "truckCourt", "hazard", "door"];
const FX_CELL = Object.fromEntries(FX_CELLS.map((c, i) => [c, i]));
/** A flat colour per cell (the headless stand-in and the phone's look). */
const FX_FLAT = [0xc9c4ba, 0x8d949b, 0x3c5670, 0xa3aab1, 0x5f6b75, 0x2f4a5c, 0x3f6f5f, 0xe6e1d3, 0xf2c200, 0x1f7a3a, 0x1e5aa8, 0xf2c200, 0x1f7a3a, 0x3c4045, 0xe0b300, 0x4b5560];
const FX_C = { wall: 0xbdb7ac, labWall: 0xd8d4cc, shed: 0xb4bac0, tower: 0xd9d6cf, cab: 0x3a4a58, frame: 0xb9b4aa, roof: 0x8f969c, plant: 0x9aa3ab, glass: 0x9fc0d6, steel: 0x6d737a, dark: 0x2a2e33, yellow: 0xe8b923, white: 0xeeeeea, red: 0xc0392b, canopy: 0xe6e6e2, rust: 0xa8432e, blue: 0x2f5f8a, green: 0x3f7a4a, sand: 0xb59a5a, post: 0x5b6168 };

// ------------------------------------------------------------------ layout (pure)

/** This map's robot sites with world positions (anchor + offset, as rb-world.js rbSitesFor resolves them). */
export function fxSitesFor(parish) {
  if (!parish) return [];
  return RB_SITES.filter((s) => s.parish === parish.id).map((s) => {
    const a = (parish.sites ?? []).find((x) => x.id === s.anchor);
    return a ? { ...s, position: [a.position[0] + s.offset[0], a.position[1] + s.offset[1]] } : null;
  }).filter(Boolean);
}

const fxRot = (yaw, lx, lz) => [lx * Math.cos(yaw) + lz * Math.sin(yaw), -lx * Math.sin(yaw) + lz * Math.cos(yaw)];
/** The world AABB of a rotated w × d rectangle centred at (x, z). */
function fxAabb(x, z, w, d, yaw, m = 0) {
  const c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw)), ex = c * w / 2 + s * d / 2 + m, ez = s * w / 2 + c * d / 2 + m;
  return [x - ex, z - ez, x + ex, z + ez];
}
const fxHit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

/** What stands near a site (kept massing boxes, trees, catalog site buildings and boards, roads, water) — cached per map. */
const fxNearCache = new WeakMap();
function fxObstacles(parish, x, z) {
  let per = fxNearCache.get(parish); if (!per) fxNearCache.set(parish, (per = new Map()));
  const { cx, cz, key } = npChunkOf(x, z);
  if (per.has(key)) return per.get(key);
  const keep = cwMassFilter(parish), rects = [], trees = [];
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
    for (const spot of npMassingForChunk(parish, cx + dx, cz + dz)) {
      if (!keep(spot)) continue;
      const boxes = cwSpotBoxes(spot);
      if (boxes.length) for (const b of boxes) rects.push([b.min[0] - 2, b.min[2] - 2, b.max[0] + 2, b.max[2] + 2]);
      else trees.push([spot.x - 4, spot.z - 4, spot.x + 4, spot.z + 4]); // a tree or reed: keep its crown clear of the lot
    }
  }
  (parish.sites ?? []).forEach((s, i) => {
    try { const b = cwSiteBuilding(parish, i); rects.push([b.cx - b.w / 2 - 3, b.cz - b.d / 2 - 3, b.cx + b.w / 2 + 3, b.cz + b.d / 2 + 3]); } catch { /* a site without a building */ }
    rects.push([s.position[0] - 3, s.position[1] + 3, s.position[0] + 3, s.position[1] + 9]); // the job board on its post
  });
  const out = { rects, trees };
  per.set(key, out);
  return out;
}

/** Why a candidate lot is not clear (null when clear). */
function fxBlocked(parish, site, x, z, w, d, yaw, others) {
  const box = fxAabb(x, z, w, d, yaw), half = NP_SIZE / 2 - 60;
  if (box[0] < -half || box[2] > half || box[1] < -half || box[3] > half) return "map edge";
  const [px, pz] = site.position;
  // the robot pad (16 x 12), its warning ring and the e-stop post stay open, with a 3 m walk round them
  if (fxHit(box, [px - 11, pz - 9, px + 11, pz + 9])) return "robot pad";
  const ox = Math.max(box[0], Math.min(px, box[2])), oz = Math.max(box[1], Math.min(pz, box[3]));
  if (Math.hypot(ox - px, oz - pz) < RB_SSM.warn + 3) return "warning zone";
  for (const o of others) if (fxHit(box, o)) return "another robot site";
  const ob = fxObstacles(parish, x, z);
  for (const r of ob.rects) if (fxHit(box, r)) return "a building";
  for (const r of ob.trees) if (fxHit(box, r)) return "a tree";
  for (const [u, v] of [[0, 0], [-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [0, -0.5], [0, 0.5], [-0.5, 0], [0.5, 0]]) {
    const [rx, rz] = fxRot(yaw, u * w, v * d), sx = x + rx, sz = z + rz;
    if (npWaterAt(parish, sx, sz)) return "water";
    const road = cwNearestLine(parish, sx, sz, 60, (l) => l.cls !== "ferry");
    if (road && road.d < road.line.width / 2 + (road.line.sidewalk ? CW_KERB + CW_SIDEWALK : 1) + 2) return "a road";
  }
  return null;
}

/** The lot of one robot site: the first clear candidate round the pad (north, east, west, south; nearer first), deterministic. */
export function fxSiteLayout(parish, site, others = []) {
  const kind = FX_SITE_KIND[site.id];
  const K = FX_KINDS[kind];
  if (!K) return null;
  const [px, pz] = site.position;
  // the port tower stands east or west of the yard: the gantry's crane rails run north–south through the pad
  const dirs = kind === "portTower" ? ["e", "w"] : ["n", "e", "w", "s"];
  let pick = null, firstWhy = null;
  search: for (const gap of [4, 9, 15, 22, 30, 40, 50]) for (const dir of dirs) for (const slide of [0, -12, 12, -24, 24, -36, 36]) {
    const yaw = { n: 0, s: Math.PI, e: -Math.PI / 2, w: Math.PI / 2 }[dir];
    const reach = (dir === "n" || dir === "s" ? 6 : 8) + gap + K.front + K.d / 2;
    const x = px + (dir === "e" ? reach : dir === "w" ? -reach : slide), z = pz + (dir === "n" ? -reach : dir === "s" ? reach : slide);
    const [fx0, fz0] = fxRot(yaw, 0, K.front / 2);
    const why = fxBlocked(parish, site, x + fx0, z + fz0, K.w + 2 * K.side, K.d + K.front, yaw, others) ?? fxCorridor(parish, site, x, z, yaw, kind, K);
    if (!why) { pick = { x, z, yaw, dir, gap }; break search; }
    firstWhy ??= why;
  }
  const clear = !!pick;
  pick ??= { x: px, z: pz - (6 + 30 + K.d / 2), yaw: 0, dir: "n", gap: 30 };
  let y = Infinity;
  for (const [u, v] of [[0, 0], [-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]) { const [rx, rz] = fxRot(pick.yaw, u * K.w, v * K.d); y = Math.min(y, npHeightAt(parish, pick.x + rx, pick.z + rz)); }
  y = Math.max(0, y) - 0.15;
  const doorLocal = fxDoorLocal(kind, K);
  const [dx, dz] = fxRot(pick.yaw, doorLocal[0], doorLocal[1]), [ox, oz] = fxRot(pick.yaw, doorLocal[0], doorLocal[1] + 1.4);
  const face = { n: "s", s: "n", e: "w", w: "e" }[pick.dir]; // the door faces the pad
  const boxes = fxSolids(kind, K).map(([lx, lz, bw, bd, bh]) => {
    const [rx, rz] = fxRot(pick.yaw, lx, lz), a = fxAabb(pick.x + rx, pick.z + rz, bw, bd, pick.yaw);
    return { min: [a[0], y, a[1]], max: [a[2], y + bh, a[3]], kind: `fx-${kind}`, id: site.id };
  });
  boxes[0].door = { x: pick.x + dx, z: pick.z + dz, face };
  const [lx0, lz0] = fxRot(pick.yaw, 0, K.front / 2);
  const lot = fxAabb(pick.x + lx0, pick.z + lz0, K.w + 2 * K.side, K.d + K.front, pick.yaw);
  const approach = fxApproach(parish, site, pick.x, pick.z, pick.yaw, kind, K) ?? [[px, pz], [pick.x + ox, pick.z + oz]];
  return { id: site.id, parish: parish.id, kind, label: K.label, x: pick.x, z: pick.z, y, yaw: pick.yaw, dir: pick.dir, gap: pick.gap, w: K.w, d: K.d, h: K.h, lot, approach,
    pad: [px, Math.max(0, npHeightAt(parish, px, pz)), pz], door: { x: pick.x + dx, z: pick.z + dz, face, out: [pick.x + ox, pick.z + oz] }, boxes, clear, why: clear ? null : firstWhy };
}

/** The solid parts of a kind, as [local x, local z, w, d, h] (the first one carries the door). */
function fxDoorLocal(kind, K) { return { fabHall: [10, K.d / 2], researchLab: [0, K.d / 2], distWarehouse: [16.5, K.d / 2], portTower: [-12, 4], constructionSite: [5.5, 9] }[kind]; }
/** The open walk from the pad to a candidate's door: straight, or an L round a corner (null when none is open). Checked
 * against massing and site buildings (trees can be walked round) and the lot's own solids. */
function fxApproach(parish, site, x, z, yaw, kind, K) {
  const [px, pz] = site.position, [dx, dz] = fxDoorLocal(kind, K), [ox, oz] = fxRot(yaw, dx, dz + 1.4), ex = x + ox, ez = z + oz;
  const own = fxSolids(kind, K).map(([lx, lz, bw, bd]) => { const [rx, rz] = fxRot(yaw, lx, lz); return fxAabb(x + rx, z + rz, bw, bd, yaw, 0.4); });
  const open = (ax, az, bx, bz) => {
    const n = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / 1));
    for (let i = 0; i <= n; i++) {
      const sx = ax + (bx - ax) * i / n, sz = az + (bz - az) * i / n, pt = [sx - 0.3, sz - 0.3, sx + 0.3, sz + 0.3];
      if (Math.hypot(sx - px, sz - pz) < 3) continue; // the walk starts on the pad
      if (own.some((r) => fxHit(pt, r)) || fxObstacles(parish, sx, sz).rects.some((r) => fxHit(pt, [r[0] + 1.5, r[1] + 1.5, r[2] - 1.5, r[3] - 1.5]))) return false;
    }
    return true;
  };
  for (const path of [[[px, pz], [ex, ez]], [[px, pz], [ex, pz], [ex, ez]], [[px, pz], [px, ez], [ex, ez]]]) {
    let ok = true;
    for (let i = 1; i < path.length && ok; i++) ok = open(path[i - 1][0], path[i - 1][1], path[i][0], path[i][1]);
    if (ok) return path;
  }
  return null;
}
function fxCorridor(parish, site, x, z, yaw, kind, K) { return fxApproach(parish, site, x, z, yaw, kind, K) ? null : "the walk to the door"; }
function fxSolids(kind, K) {
  if (kind === "portTower") return [[-12, 0, 10, 8, 4], [6.3, 0, 25.6, 2.6, 5.2], [-12, 0, 5, 5, K.h]];
  if (kind === "constructionSite") return [[0, 0, 24.2, 18, 2.4], [16.5, 0, 6, 2.6, 2.6]];
  if (kind === "distWarehouse") return [[0, 0, K.w, K.d, K.h], [-3.75, K.d / 2 + 0.8, 34, 1.6, 1.2]];
  return [[0, 0, K.w, K.d, K.h]];
}

const fxLayoutCache = new WeakMap();
/** Every robot site's lot on this map (cached; later sites keep clear of earlier ones). */
export function fxLayoutsFor(parish) {
  if (!parish) return [];
  if (fxLayoutCache.has(parish)) return fxLayoutCache.get(parish);
  const out = [], others = [];
  for (const s of fxSitesFor(parish)) {
    const l = fxSiteLayout(parish, s, others);
    if (!l) continue;
    const K = FX_KINDS[l.kind], [fx0, fz0] = fxRot(l.yaw, 0, K.front / 2);
    out.push(l); others.push(fxAabb(l.x + fx0, l.z + fz0, l.w + 2 * K.side, l.d + K.front, l.yaw, 3), [s.position[0] - 11, s.position[1] - 9, s.position[0] + 11, s.position[1] + 9]);
  }
  fxLayoutCache.set(parish, out);
  return out;
}
export function fxColliders(parish) { return fxLayoutsFor(parish).flatMap((l) => l.boxes); }
/** The map a robot site is on (for a scene asked on the wrong map). */
export function fxSiteParish(siteId) { return RB_SITES.find((s) => s.id === siteId)?.parish ?? null; }
export function fxDoorFor(parish, siteId) { return fxLayoutsFor(parish).find((l) => l.id === siteId)?.door ?? null; }

/** An establishing shot: "wide" (from beyond the pad, high, the building and the yard in frame) or "door" (the approach). */
export function fxScene(parish, siteId, shot = "wide") {
  const l = fxLayoutsFor(parish).find((x) => x.id === siteId);
  if (!l || !FX_SHOTS.includes(shot)) return null;
  const [nx, nz] = fxRot(l.yaw, 0, 1); // the building's front normal (toward the pad)
  const [tx, tz] = [nx * -1, nz * -1];
  if (shot === "wide") {
    const cx = (l.x + l.pad[0]) / 2, cz = (l.z + l.pad[2]) / 2, side = [-nz, nx], target = [cx + tx * 4, l.y + l.h * 0.4, cz + tz * 4];
    // the first camera spot (16 m up) that stands clear of massing and trees, with the near half of its sight line clear too
    const clear = (x, z, m) => { const ob = fxObstacles(parish, x, z); return ![...ob.rects, ...ob.trees].some((r) => fxHit([x - m, z - m, x + m, z + m], r)); };
    let pos = null;
    cam: for (const extra of [46, 38, 56, 30]) for (const lat of [22, -22, 0, 34, -34]) {
      const back = extra + l.d / 2 + l.gap, px = cx + nx * back + side[0] * lat, pz = cz + nz * back + side[1] * lat;
      if (clear(px, pz, 6) && [0.2, 0.35, 0.5].every((t) => clear(px + (target[0] - px) * t, pz + (target[2] - pz) * t, 2))) { pos = [px, pz]; break cam; }
    }
    if (pos === null) { const back = 46 + l.d / 2 + l.gap; pos = [cx + nx * back + side[0] * 22, cz + nz * back + side[1] * 22]; }
    return { siteId, shot, parish: parish.id, kind: l.kind, position: [pos[0], l.y + 16, pos[1]], target, fov: 55 };
  }
  const [ox, oz] = l.door.out, px = ox + nx * 9 + nz * 2.5, pz = oz + nz * 9 - nx * 2.5;
  return { siteId, shot, parish: parish.id, kind: l.kind, position: [px, Math.max(l.y, npHeightAt(parish, px, pz)) + 1.7, pz], target: [l.door.x, l.y + 2.2, l.door.z], fov: 60 };
}

// ------------------------------------------------------------------ textures (canvas, browser only)

let fxSeed = 1;
const fxRand = () => ((fxSeed = (fxSeed * 16807) % 2147483647) / 2147483647);
/** Paint one cell (x0, y0, s px). With `mask`, only what glows at night is drawn (white on black). */
function fxPaintCell(g, id, x0, y0, s, mask) {
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x0 + x * s, y0 + y * s, w * s, h * s); };
  const L = (x1, y1, x2, y2, c, lw) => { g.strokeStyle = c; g.lineWidth = Math.max(1, lw * s); g.beginPath(); g.moveTo(x0 + x1 * s, y0 + y1 * s); g.lineTo(x0 + x2 * s, y0 + y2 * s); g.stroke(); };
  const P = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo : g.moveTo).call(g, x0 + x * s, y0 + y * s)); g.closePath(); g.fill(); };
  const C = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x0 + x * s, y0 + y * s, r * s, 0, Math.PI * 2); g.fill(); };
  fxSeed = 7 + FX_CELL[id] * 131;
  const lit = (x, y, w, h) => { if (mask) R(x, y, w, h, "#ffffff"); };
  if (mask) R(0, 0, 1, 1, "#000000");
  if (id === "tiltUp") {
    if (!mask) { R(0, 0, 1, 1, "#c9c4ba"); for (let i = 0; i < 900; i++) R(fxRand(), fxRand(), 0.004, 0.004, fxRand() < 0.5 ? "#b8b2a6" : "#d6d1c7"); for (let i = 1; i < 4; i++) L(i / 4, 0, i / 4, 1, "#8e887d", 0.006); L(0, 0.7, 1, 0.7, "#a59f94", 0.004); R(0.05, 0.08, 0.9, 0.12, "#2b3440"); for (let i = 1; i < 6; i++) L(0.05 + i * 0.15, 0.08, 0.05 + i * 0.15, 0.2, "#9aa3ab", 0.004); }
    lit(0.05, 0.08, 0.9, 0.12);
  } else if (id === "rollUp") {
    if (!mask) { R(0, 0, 1, 1, "#8d949b"); for (let i = 0; i < 20; i++) L(0.04, 0.04 + i * 0.048, 0.96, 0.04 + i * 0.048, "#6f767d", 0.006); R(0, 0, 0.04, 1, "#3b4046"); R(0.96, 0, 0.04, 1, "#3b4046"); R(0, 0, 1, 0.04, "#3b4046"); }
  } else if (id === "curtain") {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      const x = c / 6 + 0.01, y = r / 4 + 0.02, w = 1 / 6 - 0.02, h = 1 / 4 - 0.07;
      if (!mask) { g.fillStyle = r % 2 ? "#3c5670" : "#466482"; g.fillRect(x0 + x * s, y0 + y * s, w * s, h * s); R(x, y, w * 0.35, h, "rgba(255,255,255,0.08)"); }
      else if (fxRand() < 0.62) lit(x, y, w, h);
    }
    if (!mask) { for (let c = 0; c <= 6; c++) R(c / 6 - 0.006, 0, 0.012, 1, "#d9dde2"); for (let r = 0; r <= 4; r++) R(0, r / 4 - 0.03, 1, 0.05, "#c4c9cf"); }
  } else if (id === "corrugated") {
    if (!mask) { R(0, 0, 1, 1, "#a3aab1"); for (let i = 0; i < 32; i++) R(i / 32, 0, 1 / 64, 1, "#8b9299"); R(0, 0.94, 1, 0.06, "#6f767d"); R(0.1, 0.1, 0.8, 0.07, "#2b3440"); }
    lit(0.1, 0.1, 0.8, 0.07);
  } else if (id === "dockDoor") {
    if (!mask) { R(0, 0, 1, 1, "#1d2024"); R(0.08, 0.1, 0.84, 0.86, "#5f6b75"); for (let i = 0; i < 14; i++) L(0.08, 0.14 + i * 0.06, 0.92, 0.14 + i * 0.06, "#4d5861", 0.006); R(0.08, 0.1, 0.84, 0.03, "#e8b923"); }
  } else if (id === "towerGlass") {
    if (!mask) { R(0, 0, 1, 1, "#2f4a5c"); for (let c = 0; c < 5; c++) R(c / 5 + 0.01, 0.06, 1 / 5 - 0.02, 0.84, "#4b7088"); for (let c = 0; c <= 5; c++) R(c / 5 - 0.008, 0, 0.016, 1, "#c9ced3"); R(0, 0, 1, 0.06, "#c9ced3"); R(0, 0.9, 1, 0.1, "#c9ced3"); }
    for (let c = 0; c < 5; c++) lit(c / 5 + 0.01, 0.06, 1 / 5 - 0.02, 0.84);
  } else if (id === "hoarding") {
    if (!mask) { R(0, 0, 1, 1, "#3f6f5f"); for (let i = 1; i < 4; i++) L(i / 4, 0, i / 4, 1, "#2f5649", 0.008); R(0, 0, 1, 0.05, "#e8e4d8"); R(0, 0.95, 1, 0.05, "#e8e4d8"); C(0.5, 0.5, 0.17, "#1e5aa8"); P([[0.39, 0.55], [0.39, 0.47], [0.44, 0.4], [0.56, 0.4], [0.61, 0.47], [0.61, 0.55]], "#ffffff"); R(0.35, 0.55, 0.3, 0.035, "#ffffff"); }
  } else if (id === "cabin") {
    if (!mask) { R(0, 0, 1, 1, "#e6e1d3"); for (let i = 0; i < 10; i++) L(0, i / 10, 1, i / 10, "#d2ccbc", 0.004); R(0.12, 0.25, 0.4, 0.3, "#2b3440"); R(0.66, 0.2, 0.22, 0.8, "#6d7378"); }
    lit(0.12, 0.25, 0.4, 0.3);
  } else if (id === "robot" || id === "vehicle") {
    if (!mask) {
      R(0, 0, 1, 1, "#ffffff"); P([[0.5, 0.06], [0.95, 0.9], [0.05, 0.9]], "#1a1a1a"); P([[0.5, 0.16], [0.86, 0.84], [0.14, 0.84]], "#f2c200");
      if (id === "robot") { R(0.36, 0.72, 0.18, 0.06, "#1a1a1a"); L(0.45, 0.72, 0.45, 0.52, "#1a1a1a", 0.05); L(0.45, 0.52, 0.62, 0.42, "#1a1a1a", 0.045); L(0.62, 0.42, 0.66, 0.55, "#1a1a1a", 0.035); C(0.45, 0.52, 0.035, "#1a1a1a"); }
      else { R(0.32, 0.56, 0.36, 0.16, "#1a1a1a"); C(0.38, 0.75, 0.04, "#1a1a1a"); C(0.62, 0.75, 0.04, "#1a1a1a"); R(0.46, 0.5, 0.08, 0.06, "#1a1a1a"); }
    }
  } else if (id === "walkway" || id === "charger") {
    if (!mask) {
      R(0, 0, 1, 1, "#1f7a3a"); R(0.04, 0.04, 0.92, 0.92, "#23864a");
      if (id === "walkway") { C(0.52, 0.22, 0.07, "#ffffff"); L(0.5, 0.32, 0.46, 0.58, "#ffffff", 0.06); L(0.46, 0.58, 0.34, 0.82, "#ffffff", 0.055); L(0.46, 0.58, 0.6, 0.8, "#ffffff", 0.055); L(0.49, 0.38, 0.32, 0.5, "#ffffff", 0.045); L(0.49, 0.38, 0.66, 0.48, "#ffffff", 0.045); }
      else { R(0.36, 0.28, 0.28, 0.3, "#ffffff"); R(0.41, 0.16, 0.05, 0.12, "#ffffff"); R(0.54, 0.16, 0.05, 0.12, "#ffffff"); L(0.5, 0.58, 0.5, 0.86, "#ffffff", 0.05); }
    } else if (id === "charger") lit(0.36, 0.28, 0.28, 0.3);
  } else if (id === "helmet") {
    if (!mask) { R(0, 0, 1, 1, "#ffffff"); C(0.5, 0.5, 0.46, "#1e5aa8"); P([[0.27, 0.62], [0.27, 0.5], [0.36, 0.34], [0.5, 0.29], [0.64, 0.34], [0.73, 0.5], [0.73, 0.62]], "#ffffff"); R(0.2, 0.62, 0.6, 0.07, "#ffffff"); }
  } else if (id === "truckCourt") {
    if (!mask) { R(0, 0, 1, 1, "#3c4045"); for (let i = 0; i < 400; i++) R(fxRand(), fxRand(), 0.006, 0.006, fxRand() < 0.5 ? "#34383d" : "#464a50"); R(0.03, 0, 0.05, 1, "#e8c33a"); R(0.92, 0, 0.05, 1, "#e8c33a"); R(0.03, 0.02, 0.94, 0.05, "#e8c33a"); }
  } else if (id === "hazard") {
    if (!mask) { R(0, 0, 1, 1, "#1a1a1a"); for (let i = -4; i < 8; i++) P([[i * 0.16, 1], [i * 0.16 + 0.08, 1], [i * 0.16 + 0.08 + 1, 0], [i * 0.16 + 1, 0]], "#e0b300"); }
  } else if (id === "door") {
    if (!mask) { R(0, 0, 1, 1, "#9aa0a6"); R(0.18, 0.08, 0.64, 0.92, "#4b5560"); R(0.3, 0.16, 0.4, 0.3, "#2b3440"); R(0.7, 0.55, 0.06, 0.04, "#d9dde2"); }
    lit(0.3, 0.16, 0.4, 0.3);
  }
}

const fxStore = new WeakMap(); // THREE -> { mats: Map, canvases: [] }
function fxStoreOf(THREE) { let s = fxStore.get(THREE); if (!s) fxStore.set(THREE, (s = { mats: new Map(), canvases: [], textures: [] })); return s; }

/** The tier's materials: { body, skin } (skin = the textured atlas, or a vertex-coloured stand-in headless). `atlasPx`
 *  overrides the tier's atlas side (ENV-HD-4's opt-in Ultra setting draws it at 2048 on the desktop high tier). */
function fxMaterials(THREE, tier, atlasPx = null) {
  const st = fxStoreOf(THREE), key = atlasPx ? `${tier}@${atlasPx}` : tier;
  if (st.mats.has(key)) return st.mats.get(key);
  const body = Object.assign(new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), { name: "fx-body" });
  let skin = null;
  const px = atlasPx ?? FX_BUDGET.atlasPx[tier] ?? 0;
  if (px && typeof document !== "undefined" && document.createElement) {
    try {
      const paint = (side, mask) => {
        const cv = document.createElement("canvas"); cv.width = side; cv.height = side;
        const g = cv.getContext("2d"); if (!g) return null;
        const s = side / 4;
        FX_CELLS.forEach((id, i) => { g.save(); g.beginPath(); g.rect((i % 4) * s, Math.floor(i / 4) * s, s, s); g.clip(); fxPaintCell(g, id, (i % 4) * s, Math.floor(i / 4) * s, s, mask); g.restore(); });
        st.canvases.push({ tier, mask, w: side, h: side });
        const t = new THREE.CanvasTexture(cv);
        if ("SRGBColorSpace" in THREE) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = tier === "high" ? 8 : 4; st.textures.push(t);
        return t;
      };
      const map = paint(px, false), glow = paint(px / 4, true);
      if (map && glow) skin = Object.assign(new THREE.MeshLambertMaterial({ map, emissiveMap: glow, emissive: 0x000000 }), { name: "fx-atlas" });
    } catch { skin = null; }
  }
  skin ??= Object.assign(new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x000000 }), { name: "fx-atlas-flat" });
  const out = { body, skin };
  st.mats.set(key, out);
  return out;
}

/** Texture bytes this page actually allocated for the kit (canvases drawn, RGBA, mipmaps included). */
export function fxTextureBytes(THREE) { return Math.round((fxStore.get(THREE)?.canvases ?? []).reduce((s, c) => s + c.w * c.h * 4 * 4 / 3, 0)); }

// ------------------------------------------------------------------ geometry

/** Build one site's group: the body (vertex colours) and, above the phone tier, the atlas skin. Origin = the robot pad. */
export function fxBuildSite(THREE, l, tier = "high", { atlasPx = null } = {}) {
  const lean = tier === "low", K = FX_KINDS[l.kind];
  const body = { pos: [], col: [] }, skin = { pos: [], uv: [], col: [] };
  const bm = new THREE.Matrix4().makeRotationY(l.yaw).setPosition(l.x - l.pad[0], l.y - l.pad[1], l.z - l.pad[2]);
  const v = new THREE.Vector3(), c = new THREE.Color();
  const put = (geo, colour, m) => {
    const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(m); c.set(colour);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { body.pos.push(p.getX(i), p.getY(i), p.getZ(i)); body.col.push(c.r, c.g, c.b); }
    g.dispose(); geo.dispose();
  };
  const local = (x, y, z, ry = 0) => bm.clone().multiply(new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z));
  const yard = (x, y, z, ry = 0) => new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z);
  // box / cylinder in the building's frame (B) or the pad's frame (Y); `keep` = also on the phone tier
  const B = (w, h, d, col, x, y, z, keep = false, ry = 0) => { if (lean && !keep) return; put(new THREE.BoxGeometry(w, h, d), col, local(x, y, z, ry)); };
  const hi = tier === "high";
  const H = (w, h, d, col, x, y, z, ry = 0) => { if (hi) put(new THREE.BoxGeometry(w, h, d), col, local(x, y, z, ry)); };
  const Y = (w, h, d, col, x, y, z, keep = false, ry = 0) => { if (lean && !keep) return; put(new THREE.BoxGeometry(w, h, d), col, yard(x, y, z, ry)); };
  const Cyl = (r, h, col, x, y, z, seg = 6) => { if (lean) return; put(new THREE.CylinderGeometry(r, r, h, seg), col, local(x, y, z)); };
  // a textured quad (the skin) facing local +z after `ry`; on the phone tier quads are dropped (the body colours stay)
  const quad = (cell, w, h, m) => {
    if (lean) return;
    const i = FX_CELL[cell], col = i % 4, row = Math.floor(i / 4), e = 0.004;
    const u0 = col / 4 + e, u1 = (col + 1) / 4 - e, v1 = 1 - row / 4 - e, v0 = 1 - (row + 1) / 4 + e;
    const corners = [[-w / 2, -h / 2, u0, v0], [w / 2, -h / 2, u1, v0], [w / 2, h / 2, u1, v1], [-w / 2, -h / 2, u0, v0], [w / 2, h / 2, u1, v1], [-w / 2, h / 2, u0, v1]];
    c.set(FX_FLAT[i]);
    for (const [x, y, uu, vv] of corners) { v.set(x, y, 0).applyMatrix4(m); skin.pos.push(v.x, v.y, v.z); skin.uv.push(uu, vv); skin.col.push(c.r, c.g, c.b); }
  };
  const Q = (cell, w, h, x, y, z, ry = 0) => quad(cell, w, h, local(x, y, z, ry));
  // floor markings: the building frame's origin is 0.15 m under the lot's lowest ground (the body sinks in, as massing does),
  // so its markings ride 0.2 m up; the pad frame's sit 0.1 m over the pad's ground (clear of the 8 cm pad slab's edge)
  const QF = (cell, w, d, x, z, ry = 0, frame = "b") => quad(cell, w, d, (frame === "b" ? local(x, 0.2, z, ry) : yard(x, 0.1, z, ry)).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2)));
  /** Wrap a w × d × h wall in a cell, split into panels of about `pm` metres. */
  const wrap = (cell, w, d, h, y0, pm, faces = [0, 1, 2, 3], cx = 0, cz = 0) => {
    for (const f of faces) {
      const span = f < 2 ? w : d, n = Math.max(1, Math.round(span / pm)), ry = [0, Math.PI, Math.PI / 2, -Math.PI / 2][f];
      const off = f < 2 ? d / 2 + 0.03 : w / 2 + 0.03;
      for (let i = 0; i < n; i++) {
        const u = -span / 2 + (i + 0.5) * span / n, [ox, oz] = fxRot(ry, u, off);
        Q(cell, span / n, h, cx + ox, y0 + h / 2, cz + oz, ry);
      }
    }
  };
  const sign = (cell, x, z, ry, frame = "b", h = 2.2) => { // a pictogram on a post: post + back plate in the body, the face in the skin
    const M = frame === "b" ? local : yard;
    if (!lean) { put(new THREE.BoxGeometry(0.08, h, 0.08), FX_C.post, M(x, h / 2, z, ry)); put(new THREE.BoxGeometry(0.66, 0.66, 0.04), FX_C.post, M(x, h + 0.1, z + 0.0, ry)); }
    quad(cell, 0.6, 0.6, M(x, h + 0.1, z, ry).multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.03)));
  };
  const bollards = (xs, z, frame = "b") => { for (const x of xs) { if (lean) continue; const M = frame === "b" ? local : yard; put(new THREE.CylinderGeometry(0.12, 0.12, 1, 6), FX_C.yellow, M(x, 0.5, z)); } };
  const charger = (x, z, ry) => { // an EV charger pedestal with its pictogram and a marked bay
    B(0.45, 1.4, 0.3, FX_C.white, x, 0.7, z, false, ry); B(0.36, 0.3, 0.02, FX_C.dark, x + Math.sin(ry) * 0.16, 1.15, z + Math.cos(ry) * 0.16, false, ry);
    Q("charger", 0.3, 0.3, x + Math.sin(ry) * 0.17, 0.8, z + Math.cos(ry) * 0.17, ry);
    const [ax, az] = fxRot(ry, 1.3, 0), [bx, bz] = fxRot(ry, -1.3, 0), [fx2, fz2] = fxRot(ry, 0, 2.6);
    B(0.1, 0.04, 5, FX_C.white, x + ax + fx2, 0.19, z + az + fz2, false, ry); B(0.1, 0.04, 5, FX_C.white, x + bx + fx2, 0.19, z + bz + fz2, false, ry);
  };
  const D = K.d / 2, W = K.w / 2;

  if (l.kind === "fabHall") {
    B(K.w, K.h, K.d, FX_C.wall, 0, K.h / 2, 0, true);
    B(K.w, 0.8, 0.3, FX_C.roof, 0, K.h + 0.4, D - 0.15); B(K.w, 0.8, 0.3, FX_C.roof, 0, K.h + 0.4, -D + 0.15); B(0.3, 0.8, K.d, FX_C.roof, W - 0.15, K.h + 0.4, 0); B(0.3, 0.8, K.d, FX_C.roof, -W + 0.15, K.h + 0.4, 0);
    wrap("tiltUp", K.w, K.d, K.h, 0, 7.5);
    for (const x of [-8, 1]) { Q("rollUp", 5, 5.5, x, 2.75, D + 0.06); B(5.6, 0.4, 0.3, FX_C.steel, x, 5.7, D + 0.15); QF("hazard", 5, 0.9, x, D + 0.8); B(5, 5.5, 0.04, FX_C.steel, x, 2.75, D + 0.02, true); }
    Q("door", 1.4, 2.6, 10, 1.3, D + 0.06); B(3.2, 0.15, 1.8, FX_C.canopy, 10, 3.1, D + 0.9); B(0.1, 3, 0.1, FX_C.post, 8.5, 1.5, D + 1.7); B(0.1, 3, 0.1, FX_C.post, 11.5, 1.5, D + 1.7);
    B(3, 1.6, 2.2, FX_C.plant, -6, K.h + 0.8, -3, true); B(2.4, 1.4, 2, FX_C.plant, 5, K.h + 0.7, 3); B(6, 0.6, 0.6, FX_C.plant, -1, K.h + 0.3, -3);
    for (const z of [-5, 0, 5]) B(K.w * 0.6, 0.5, 1.4, FX_C.glass, -2, K.h + 0.25, z);
    bollards([-11.2, -4.8, -2.2, 4.2, 8, 12], D + 2.4);
    charger(W + 2.5, D - 3, -Math.PI / 2); charger(W + 2.5, D - 8, -Math.PI / 2);
    sign("robot", 6.5, D + 3.2, 0); sign("vehicle", -3.5, D + 3.2, 0); sign("walkway", 13, D + 2.2, 0);
    // high tier: downpipes, a sunshade over the clerestory band, door guide rails, skylight frames, plant louvres, wall lamps
    for (const x of [-W + 0.4, -W / 3, W / 3, W - 0.4]) H(0.16, K.h, 0.16, FX_C.steel, x, K.h / 2, D + 0.12);
    H(K.w * 0.9, 0.08, 0.7, FX_C.steel, 0, K.h * 0.83, D + 0.35);
    for (const x of [-8, 1]) { H(0.18, 5.6, 0.22, FX_C.dark, x - 2.6, 2.8, D + 0.1); H(0.18, 5.6, 0.22, FX_C.dark, x + 2.6, 2.8, D + 0.1); H(0.3, 0.2, 0.3, FX_C.white, x, 6.2, D + 0.3); }
    for (const z of [-5, 0, 5]) { H(K.w * 0.6, 0.08, 0.08, FX_C.steel, -2, K.h + 0.54, z - 0.7); H(K.w * 0.6, 0.08, 0.08, FX_C.steel, -2, K.h + 0.54, z + 0.7); for (let i = 0; i < 6; i++) H(0.06, 0.5, 1.45, FX_C.steel, -2 - K.w * 0.3 + i * K.w * 0.12, K.h + 0.3, z); }
    for (let i = 0; i < 7; i++) H(0.05, 1.2, 2, FX_C.dark, -7.4 + i * 0.45, K.h + 0.8, -1.88);
    H(0.3, 0.2, 0.3, FX_C.white, 10, 3.4, D + 0.2);
  } else if (l.kind === "researchLab") {
    B(K.w, K.h, K.d, FX_C.labWall, 0, K.h / 2, 0, true);
    wrap("curtain", K.w, K.d, K.h - 0.6, 0.6, 6);
    for (const x of [-9.6, -4.8, 4.8, 9.6]) B(0.2, K.h, 0.5, FX_C.white, x, K.h / 2, D + 0.3);
    B(8, 0.3, 4, FX_C.canopy, 0, 3.6, D + 2, true); B(0.18, 3.5, 0.18, FX_C.post, -3.6, 1.75, D + 3.8); B(0.18, 3.5, 0.18, FX_C.post, 3.6, 1.75, D + 3.8);
    Q("door", 1.4, 2.6, -0.75, 1.3, D + 0.36); Q("door", 1.4, 2.6, 0.75, 1.3, D + 0.36);
    B(8, 2, 0.15, FX_C.plant, 0, K.h + 1, 3); B(8, 2, 0.15, FX_C.plant, 0, K.h + 1, -3); B(0.15, 2, 6, FX_C.plant, 4, K.h + 1, 0); B(0.15, 2, 6, FX_C.plant, -4, K.h + 1, 0); B(3, 1.6, 2.4, FX_C.plant, 0, K.h + 0.8, 0, true);
    bollards([-6, -4, 4, 6, 8, -8], D + 4.6);
    charger(W + 2.5, D - 2, -Math.PI / 2); charger(W + 2.5, D - 7, -Math.PI / 2);
    sign("robot", 5.5, D + 5.4, 0); sign("walkway", -5.5, D + 5.4, 0);
    // high tier: spandrel ledges, rooftop panels on frames, planters and a bike rack on the plaza
    for (const y of [4.1, 7.9]) H(K.w + 0.4, 0.12, 0.45, FX_C.white, 0, y, D + 0.25);
    for (let i = 0; i < 6; i++) { H(1.6, 0.06, 1.0, FX_C.cab, -8.5 + (i % 3) * 2, K.h + 0.6, -5 + Math.floor(i / 3) * 1.6, 0); H(0.06, 0.5, 0.06, FX_C.steel, -8.5 + (i % 3) * 2, K.h + 0.3, -5.4 + Math.floor(i / 3) * 1.6); }
    for (const x of [-7.5, 7.5]) { H(2.2, 0.7, 1.2, FX_C.frame, x, 0.35, D + 3.2); H(2, 0.15, 1, FX_C.green, x, 0.75, D + 3.2); }
    for (let i = 0; i < 5; i++) { H(0.06, 0.8, 0.06, FX_C.steel, -10.6 + i * 0.7, 0.4, D + 1.2); H(0.06, 0.8, 0.06, FX_C.steel, -10.6 + i * 0.7, 0.4, D + 1.9); H(0.06, 0.06, 0.76, FX_C.steel, -10.6 + i * 0.7, 0.8, D + 1.55); }
  } else if (l.kind === "distWarehouse") {
    B(K.w, K.h, K.d, FX_C.shed, 0, K.h / 2, 0, true);
    B(K.w, 0.7, 0.3, FX_C.roof, 0, K.h + 0.35, D - 0.15); B(K.w, 0.7, 0.3, FX_C.roof, 0, K.h + 0.35, -D + 0.15); B(1.6, 1.2, 1.6, FX_C.plant, -8, K.h + 0.6, 0); B(1.6, 1.2, 1.6, FX_C.plant, 8, K.h + 0.6, 0);
    wrap("corrugated", K.w, K.d, K.h, 0, 8);
    B(34, 1.2, 1.6, FX_C.steel, -3.75, 0.6, D + 0.8, true);
    for (const x of [-16.5, -8.5, -0.5, 7.5]) {
      Q("dockDoor", 3.2, 3.4, x, 2.9, D + 0.06); B(3.2, 3.4, 0.04, FX_C.dark, x, 2.9, D + 0.02, true);
      B(0.3, 0.5, 0.3, FX_C.dark, x - 1.3, 0.9, D + 1.75); B(0.3, 0.5, 0.3, FX_C.dark, x + 1.3, 0.9, D + 1.75);
      B(0.28, 0.22, 0.34, FX_C.yellow, x + 2.1, 4.4, D + 0.2);
      QF("truckCourt", 3.6, 10, x, D + 6.8);
    }
    Q("door", 1.3, 2.5, 16.5, 1.25, D + 0.06); B(3, 0.15, 1.6, FX_C.canopy, 16.5, 3.0, D + 0.8);
    bollards([14.6, 15.2, 17.8, 18.4], D + 1.8);
    charger(W + 1.6, D - 3, -Math.PI / 2); charger(W + 1.6, D - 8, -Math.PI / 2);
    sign("vehicle", 11.5, D + 3.4, 0); sign("walkway", 19.2, D + 2.4, 0);
    // high tier: dock shelters round each door, dock leveller plates, downpipes, a parked trailer at the first dock
    for (const x of [-16.5, -8.5, -0.5, 7.5]) { H(3.9, 0.45, 0.5, FX_C.dark, x, 4.85, D + 0.3); H(0.35, 3.6, 0.5, FX_C.dark, x - 1.78, 2.95, D + 0.3); H(0.35, 3.6, 0.5, FX_C.dark, x + 1.78, 2.95, D + 0.3); H(2.6, 0.05, 1.3, FX_C.steel, x, 1.22, D + 0.95); }
    for (const x of [-W + 0.4, -12.5, 3.5, W - 0.4]) H(0.16, K.h, 0.16, FX_C.steel, x, K.h / 2, D + 0.12);
    H(2.5, 2.8, 10, FX_C.white, -16.5, 2.6, D + 6.8); H(2.3, 0.3, 9.4, FX_C.dark, -16.5, 1.05, D + 6.8);
    for (const z of [D + 9.6, D + 10.8]) for (const x of [-17.6, -15.4]) Cyl(0.5, 0.3, FX_C.dark, x, 0.5, z, 8);
  } else if (l.kind === "portTower") {
    B(10, 4, 8, FX_C.wall, -12, 2, 0, true); wrap("corrugated", 10, 8, 4, 0, 5, [0, 1, 2, 3], -12, 0); Q("door", 1.3, 2.5, -12, 1.25, 4.06);
    B(5, K.h, 5, FX_C.tower, -12, K.h / 2, 0, true);
    B(9, 3.6, 9, FX_C.cab, -12, K.h + 1.8, 0, true); B(10, 0.35, 10, FX_C.white, -12, K.h + 3.75, 0); Cyl(0.08, 4, FX_C.steel, -10, K.h + 5.9, -2);
    wrap("towerGlass", 9, 9, 2.6, K.h + 0.55, 9, [0, 1, 2, 3], -12, 0);
    const cont = [FX_C.rust, FX_C.blue, FX_C.green, FX_C.sand];
    for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) B(6.1, 2.5, 2.44, cont[(i + k) % 4], -6.5 + 6.4 + i * 6.4 - 0.05, 1.27 + k * 2.6, 0, k === 0);
    // the yard (pad frame): crane rails under the gantry's legs, hazard ends, the crossing's pictograms
    for (const x of [-6.2, 6.2]) { Y(0.3, 0.16, 56, FX_C.steel, x, 0.08, 0, true); QF("hazard", 1.2, 1.2, x, 28.6, 0, "y"); QF("hazard", 1.2, 1.2, x, -28.6, 0, "y"); }
    sign("vehicle", 9.5, 10, Math.PI, "y"); sign("walkway", -9.5, 10, Math.PI, "y");
    bollards([-9, -6, -3], 5.5);
    charger(-5, -2.5, Math.PI / 2); charger(-5, 2.5, Math.PI / 2);
    // high tier: cab mullions, a walkway rail round the cab, container door ends and twist-lock castings, shaft stair windows
    for (let i = 0; i < 4; i++) for (const f of [0, 1, 2, 3]) { const [ox, oz] = fxRot([0, Math.PI, Math.PI / 2, -Math.PI / 2][f], -3.4 + i * 2.27, 4.56); H(0.1, 2.6, 0.1, FX_C.white, -12 + ox, K.h + 1.85, oz); }
    for (const f of [0, 1, 2, 3]) { const ry = [0, Math.PI, Math.PI / 2, -Math.PI / 2][f], [ox, oz] = fxRot(ry, 0, 5.2); H(10.4, 0.06, 0.06, FX_C.steel, -12 + ox, K.h + 0.9, oz, ry); }
    for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) { H(0.06, 2.3, 2.3, FX_C.dark, 0.3 + i * 6.4 + 3.02, 1.27 + k * 2.6, 0); H(0.06, 2.3, 2.3, FX_C.dark, 0.3 + i * 6.4 - 3.02, 1.27 + k * 2.6, 0); }
    for (let y = 6; y < K.h - 1; y += 3) H(0.6, 1.2, 0.05, FX_C.cab, -12, y, 2.53);
  } else if (l.kind === "constructionSite") {
    // the concrete frame (two slabs poured, the third floor's columns up)
    for (const x of [-8, -2.7, 2.7, 8]) for (const z of [-5, 0, 5]) B(0.4, K.h, 0.4, FX_C.frame, x, K.h / 2, z, x === -8 || x === 8);
    B(18, 0.25, 12, FX_C.frame, 0, 3.4, 0, true); B(18, 0.25, 12, FX_C.frame, 0, 6.8, 0, true);
    // scaffold on the front face
    for (let i = 0; i <= 9; i++) { B(0.06, 9, 0.06, FX_C.steel, -9 + i * 2, 4.5, 7.2); B(0.06, 9, 0.06, FX_C.steel, -9 + i * 2, 4.5, 6.3); }
    for (const y of [2, 4, 6, 8]) { B(18, 0.06, 1, FX_C.sand, 0, y, 6.75); B(18, 0.05, 0.05, FX_C.steel, 0, y + 1, 7.2); }
    if (lean) B(18, 8, 0.9, FX_C.steel, 0, 4, 6.75, true);
    // the hoarding round the lot (a gate on the pad side), panels in the skin
    const hz = 9, hx = 12.1, hh = 2.4;
    B(hx * 2, hh, 0.1, FX_C.green, 0, hh / 2, -hz, true); B(0.1, hh, hz * 2, FX_C.green, hx, hh / 2, 0, true); B(0.1, hh, hz * 2, FX_C.green, -hx, hh / 2, 0, true);
    B(15.1, hh, 0.1, FX_C.green, -4.55, hh / 2, hz, true); B(4, hh, 0.1, FX_C.green, 10.1, hh / 2, hz, true);
    for (let i = 0; i < 5; i++) Q("hoarding", 3.02, hh, -12.1 + 1.51 + i * 3.02, hh / 2, hz + 0.07);
    Q("hoarding", 4, hh, 10.1, hh / 2, hz + 0.07);
    for (let i = 0; i < 8; i++) Q("hoarding", 3.025, hh, -12.1 + 1.51 + i * 3.025, hh / 2, -hz - 0.07, Math.PI);
    for (let i = 0; i < 6; i++) { Q("hoarding", 3, hh, hx + 0.07, hh / 2, -9 + 1.5 + i * 3, Math.PI / 2); Q("hoarding", 3, hh, -hx - 0.07, hh / 2, -9 + 1.5 + i * 3, -Math.PI / 2); }
    for (const x of [3.6, 5.2, 6.8]) { B(1.4, 0.9, 0.5, x === 5.2 ? FX_C.white : FX_C.red, x, 0.45, hz + 1.2); }
    // the site cabin outside the hoarding, on blocks
    B(6, 2.6, 2.5, FX_C.white, 16.5, 1.6, 0, true); Q("cabin", 6, 2.6, 16.5, 1.6, 1.29); B(1.2, 0.3, 0.8, FX_C.steel, 18, 0.15, 1.7);
    sign("helmet", 2, hz + 0.3, 0, "b", 1.6); sign("robot", 8.6, hz + 0.3, 0, "b", 1.6); sign("walkway", 14, 3, 0, "b", 1.6);
    bollards([1.8, 8.6], hz + 2.2);
    // high tier: scaffold braces and toe boards, hoarding posts, rebar starters on the top floor, a material hoist
    for (let i = 0; i < 9; i += 2) H(0.05, 2.9, 0.05, FX_C.steel, -8 + i * 2, 3, 7.25, 0);
    for (const y of [2, 4, 6, 8]) H(18, 0.15, 0.03, FX_C.yellow, 0, y + 0.12, 7.28);
    for (let i = 0; i <= 8; i++) { H(0.12, 2.5, 0.12, FX_C.steel, -12.1 + i * 3.02, 1.25, hz - 0.1); H(0.12, 2.5, 0.12, FX_C.steel, -12.1 + i * 3.02, 1.25, -hz + 0.1); }
    for (const x of [-8, -2.7, 2.7, 8]) for (const z of [-5, 0, 5]) H(0.04, 0.9, 0.04, FX_C.rust, x + 0.12, K.h + 0.45, z + 0.12);
    H(1.6, K.h + 2, 1.6, FX_C.yellow, -10.4, (K.h + 2) / 2, -3); H(1.4, 1.2, 1.4, FX_C.steel, -10.4, 4.2, -3);
  }

  const group = new THREE.Group(); group.name = `fx-site-${l.id}`;
  group.position.set(l.pad[0], l.pad[1], l.pad[2]);
  const mats = fxMaterials(THREE, tier, atlasPx);
  const geoOf = (bag, uv) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(bag.pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(bag.col, 3));
    if (uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(bag.uv, 2));
    g.computeVertexNormals();
    return g;
  };
  let triangles = 0;
  const bodyMesh = new THREE.Mesh(geoOf(body, false), mats.body); bodyMesh.name = `fx-body-${l.kind}`; group.add(bodyMesh); triangles += body.pos.length / 9;
  if (skin.pos.length) { const sk = new THREE.Mesh(geoOf(skin, true), mats.skin); sk.name = `fx-skin-${l.kind}`; group.add(sk); triangles += skin.pos.length / 9; }
  group.userData.fx = { id: l.id, kind: l.kind, meshes: group.children.length, triangles: Math.round(triangles) };
  group.dispose = () => { for (const o of group.children) o.geometry.dispose(); };
  return group;
}

// ------------------------------------------------------------------ the mount

/** Mount this map's robot-site exteriors under `root`. `hour` (0–24) sets the lit windows (ATMOS's dusk and dawn).
 *  `atlasPx` (ENV-HD-4's Ultra, desktop high only) draws the facade atlas at that side instead of the tier's. */
export function fxMountExteriors({ THREE, root, parish, tier = "high", hour = 12, atlasPx = null } = {}) {
  const tierKey = tier === "low" ? "low" : tier === "balanced" ? "balanced" : "high";
  const px = tierKey === "high" && atlasPx ? atlasPx : null; // never on balanced or the phone tier
  const layouts = fxLayoutsFor(parish);
  const group = THREE ? new THREE.Group() : null;
  if (group) { group.name = "fx-exteriors"; root?.add(group); }
  const built = THREE ? layouts.map((l) => { const g = fxBuildSite(THREE, l, tierKey, { atlasPx: px }); group.add(g); return g; }) : [];
  let lit = null;
  function setHour(h) {
    const on = atLightsOn(h);
    if (on === lit || !THREE) return on;
    lit = on;
    const m = fxMaterials(THREE, tierKey, px).skin;
    m.emissive.setHex(on ? 0xffcf8a : 0x000000); m.emissiveIntensity = on ? 0.95 : 1;
    return on;
  }
  setHour(hour);
  function counts() {
    let meshes = 0, triangles = 0;
    for (const g of built) { meshes += g.userData.fx.meshes; triangles += g.userData.fx.triangles; }
    return { tier: tierKey, sites: layouts.length, meshes, triangles, lit: !!lit, textureBytes: THREE ? fxTextureBytes(THREE) : 0, perSite: built.map((g) => g.userData.fx) };
  }
  return {
    sites: layouts.map((l) => ({ id: l.id, kind: l.kind, label: l.label, door: l.door, clear: l.clear })),
    layouts, group, setHour, counts,
    scene: (siteId, shot) => fxScene(parish, siteId, shot),
    dispose() { for (const g of built) { g.dispose(); group.remove(g); } root?.remove(group); },
  };
}
