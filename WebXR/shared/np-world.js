// The parish world engine's three.js half (console PARISH, docs/consoles/PARISH.md):
// npBuildParish(root, THREE, parish, opts) builds one parish map from
// shared/np-parish.js's pure answers and returns a world whose update(x, z)
// streams 256 m terrain chunks around the learner at the LOD its ring asks
// for, the inner rings carrying one InstancedMesh per massing kind (a
// quarter's low blocks and galleries, a garden district's houses and live
// oaks, sheds, port cranes, towers, cypress and reed). Beyond the streamed
// square a coarse backdrop of the whole field keeps the horizon for one draw
// call. The fixed features — the water bodies, the levee crowns, the road
// ribbons and bridge decks with their piers, the ferry route, the sites'
// boards, the landmark and connector signs, the lesson signs — are built
// once and are cheap: merged or instanced where they repeat.
//
// Nothing here models a real building: the massing is generic character by
// district. The satellite ground (a Mapbox static image, only when a viewer
// supplies a token — shared/np-geo.js builds the URL, the app loads it) is
// applied through setGroundTexture(): the chunk material swaps its vertex
// colours for the image, whose uv is the world position over the field.
//
// Every top-level name is prefixed np/NP_ (the bundler's one scope); the
// module takes three.js from the caller as `THREE`.

import {
  NP_SIZE, NP_CHUNK, NP_LOD_SEGMENTS, NP_STREAM_RADIUS, NP_MASS_RADIUS, NP_ROAD_KINDS, NP_WATER_Y, NP_GROUND, NP_LEVEE_CREST,
  npHeightAt, npCoverAt, npChunksAround, npMassingForChunk, npPrepare, npTriangulate, npRoadSurfaceAt, npPolyLength, npPointsAlong,
  npPolyPointAt, npDeckHeightAt, npStripFromCentreline, NP_TERRAIN_HOOKS,
} from "./np-parish.js";

const NP_COL = {
  water: [0.16, 0.22, 0.2], wetland: [0.36, 0.45, 0.3], levee: [0.5, 0.62, 0.34], road: [0.24, 0.25, 0.27], pad: [0.62, 0.58, 0.5],
  quarter: [0.5, 0.42, 0.34], garden: [0.38, 0.52, 0.28], industrial: [0.5, 0.5, 0.48], suburb: [0.42, 0.55, 0.3], port: [0.55, 0.54, 0.5],
  downtown: [0.46, 0.46, 0.47], campus: [0.4, 0.54, 0.3], park: [0.36, 0.53, 0.27], refinery: [0.5, 0.47, 0.42], grass: [0.44, 0.56, 0.31],
};

/** The ground colour at (x, z) by cover (vertex colours, no textures), with a little grain. */
export function npGroundColour(parish, x, z, out) {
  const c = NP_COL[npCoverAt(parish, x, z)] ?? NP_COL.grass;
  let n = 0.92 + ((Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 + 1) % 1 * 0.14;
  // TERRAFORM's shoreline strip: wet ground reads darker beside the water.
  const wet = NP_TERRAIN_HOOKS.wet ? NP_TERRAIN_HOOKS.wet(parish, x, z) : 0;
  if (wet > 0) n *= 1 - 0.38 * wet;
  out[0] = c[0] * n; out[1] = c[1] * n; out[2] = c[2] * n;
  return out;
}

function npTerrainGeometry(THREE, parish, x0, z0, size, segs, drop = 0) {
  const n = segs + 1;
  const pos = new Float32Array(n * n * 3), col = new Float32Array(n * n * 3), uv = new Float32Array(n * n * 2);
  const step = size / segs, tmp = [0, 0, 0];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = x0 + i * step, z = z0 + j * step, h = npHeightAt(parish, x, z) - drop;
    const k = (j * n + i) * 3;
    pos[k] = x; pos[k + 1] = h; pos[k + 2] = z;
    npGroundColour(parish, x, z, tmp);
    col[k] = tmp[0]; col[k + 1] = tmp[1]; col[k + 2] = tmp[2];
    const u = (j * n + i) * 2;
    uv[u] = (x + NP_SIZE / 2) / NP_SIZE; uv[u + 1] = 1 - (z + NP_SIZE / 2) / NP_SIZE;
  }
  const idx = new (n * n > 65535 ? Uint32Array : Uint16Array)(segs * segs * 6);
  let q = 0;
  for (let j = 0; j < segs; j++) for (let i = 0; i < segs; i++) {
    const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
    idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/** Merge simple geometries into one non-indexed, vertex-coloured geometry. */
function npMerge(THREE, parts) {
  const polys = parts.map(([geo, colour, m]) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); if (m) g.applyMatrix4(m); return [g, colour]; });
  const total = polys.reduce((s, [g]) => s + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  for (const [g, colour] of polys) {
    pos.set(g.attributes.position.array, o * 3);
    const c = new THREE.Color(colour);
    for (let i = 0; i < g.attributes.position.count; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("color", new THREE.BufferAttribute(col, 3));
  out.computeVertexNormals();
  return out;
}

const npM = (THREE, x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
const npMS = (THREE, sx, sy, sz, x, y, z) => new THREE.Matrix4().makeScale(sx, sy, sz).setPosition(x, y, z);

/** The massing geometries by kind: unit-height boxes/cylinders scale to a spot's height; the compound kinds scale uniformly. */
function npMassingGeometries(THREE) {
  const unitBox = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const unitCyl = (r, seg) => new THREE.CylinderGeometry(r, r, 1, seg).translate(0, 0.5, 0);
  return {
    quarterBlock: npMerge(THREE, [[new THREE.BoxGeometry(16, 8, 12), 0xb98c6a, npM(THREE, 0, 4, 0)], [new THREE.BoxGeometry(18, 0.3, 14), 0x3b3f44, npM(THREE, 0, 3.4, 0)]]),
    gardenHouse: npMerge(THREE, [[new THREE.BoxGeometry(12, 6, 10), 0xe7e2d3, npM(THREE, 0, 3, 0)], [new THREE.ConeGeometry(8.4, 3.2, 4).rotateY(Math.PI / 4), 0x5a4a3a, npM(THREE, 0, 7.6, 0)]]),
    liveOak: npMerge(THREE, [[new THREE.CylinderGeometry(0.5, 0.8, 4, 5), 0x5a4030, npM(THREE, 0, 2, 0)], [new THREE.IcosahedronGeometry(5.2, 0), 0x2f5a2a, npMS(THREE, 1.4, 0.8, 1.4, 0, 6.5, 0)], [new THREE.IcosahedronGeometry(3.6, 0), 0x376a30, npMS(THREE, 1.2, 0.7, 1.2, 2.5, 7.8, 1.5)]]),
    shed: npMerge(THREE, [[unitBox, 0x9aa0a6, npMS(THREE, 40, 1, 22, 0, 0, 0)]]),
    crane: npMerge(THREE, [
      [new THREE.BoxGeometry(1.6, 34, 1.6), 0x3f7ab8, npM(THREE, -9, 17, 0)], [new THREE.BoxGeometry(1.6, 34, 1.6), 0x3f7ab8, npM(THREE, 9, 17, 0)],
      [new THREE.BoxGeometry(22, 1.6, 1.6), 0x3f7ab8, npM(THREE, 0, 34, 0)], [new THREE.BoxGeometry(1.6, 1.6, 46), 0x3f7ab8, npM(THREE, 0, 35, 8)], [new THREE.BoxGeometry(4, 3, 4), 0xe8e8e8, npM(THREE, 0, 31, 4)],
    ]),
    suburbHouse: npMerge(THREE, [[new THREE.BoxGeometry(10, 4.5, 9), 0xd9d2c4, npM(THREE, 0, 2.25, 0)], [new THREE.ConeGeometry(7, 2.6, 4).rotateY(Math.PI / 4), 0x6b4f3f, npM(THREE, 0, 5.8, 0)]]),
    tower: npMerge(THREE, [[unitBox, 0x7c8792, npMS(THREE, 22, 1, 22, 0, 0, 0)]]),
    campusBlock: npMerge(THREE, [[unitBox, 0xc9b9a0, npMS(THREE, 28, 1, 18, 0, 0, 0)]]),
    cypress: npMerge(THREE, [[new THREE.CylinderGeometry(0.35, 1.1, 5, 5), 0x6a5540, npM(THREE, 0, 2.5, 0)], [new THREE.ConeGeometry(2.8, 8, 6), 0x3d6b3a, npM(THREE, 0, 8.5, 0)]]),
    reed: npMerge(THREE, [[new THREE.ConeGeometry(0.9, 1.8, 3), 0x8aa050, npM(THREE, 0, 0.9, 0)]]),
    tank: npMerge(THREE, [[unitCyl(9, 10), 0xd8d8d0, new THREE.Matrix4()]]),
    stack: npMerge(THREE, [[unitCyl(1.6, 6), 0xb0a8a0, new THREE.Matrix4()]]),
  };
}

/** Which kinds scale their height by the spot's `h` (unit-height geometries) and which scale uniformly. */
const NP_UNIT_HEIGHT = new Set(["shed", "tower", "campusBlock", "tank", "stack"]);
const NP_UNIFORM_BY_H = { cypress: 12.5, liveOak: 10, reed: 1.8 };

/** A flat ribbon on a surface function along a polyline, wound with the face normal up (SUMMIT-3's lesson). */
function npRibbon(THREE, pts, width, colour, surfaceAt, { stepLen = 8 } = {}) {
  const verts = [], cols = [], c = new THREE.Color(colour);
  const total = npPolyLength(pts);
  if (total < 1) return null;
  let prev = null;
  for (let d = 0; d <= total + 0.01; d += stepLen) {
    const t = Math.min(d, total) / total, p = npPolyPointAt(pts, t);
    const nx = Math.cos(p.yaw), nz = -Math.sin(p.yaw);
    const y = surfaceAt(t, p);
    const w = width / 2;
    const l = [p.x + nx * w, y, p.z + nz * w], r = [p.x - nx * w, y, p.z - nz * w];
    if (prev) { verts.push(...prev.l, ...l, ...prev.r, ...prev.r, ...l, ...r); for (let k = 0; k < 6; k++) cols.push(c.r, c.g, c.b); }
    prev = { l, r };
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  g.computeVertexNormals();
  return g;
}

/** Several ribbon geometries (non-indexed, position + color) concatenated into one. */
function npConcat(THREE, geos) {
  const list = geos.filter(Boolean);
  if (!list.length) return null;
  const total = list.reduce((s, g) => s + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  for (const g of list) { pos.set(g.attributes.position.array, o * 3); col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("color", new THREE.BufferAttribute(col, 3));
  out.computeVertexNormals();
  return out;
}

/** A water polygon as a flat, upward-facing triangulated surface at `y`. */
function npWaterGeometry(THREE, shape, y) {
  const tris = npTriangulate(shape);
  const pos = new Float32Array(tris.length * 9);
  let k = 0;
  for (const [a, b, c] of tris) for (const i of [a, b, c]) { pos[k++] = shape[i][0]; pos[k++] = y; pos[k++] = shape[i][1]; }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

function npSignGeometry(THREE, boardColour, tall = false) {
  const h = tall ? 3.2 : 1.6;
  return npMerge(THREE, [
    [new THREE.BoxGeometry(0.14, h, 0.14), 0x5b4a36, npM(THREE, 0, h / 2, 0)],
    [new THREE.BoxGeometry(tall ? 1.8 : 1.3, tall ? 0.6 : 0.8, 0.08), boardColour, npM(THREE, 0, h + 0.3, 0)],
  ]);
}

/**
 * Build the parish under `root`. opts: { tier: "low"|"balanced"|"high", start: [x, z] }.
 * Returns { update(x, z, budget), animate(dt), stats(), setGroundTexture(tex), siteBoards, lessonSigns, … }.
 */
export function npBuildParish(root, THREE, parish, opts = {}) {
  const tier = opts.tier ?? "high";
  const streamR = NP_STREAM_RADIUS[tier] ?? 3;
  const massR = NP_MASS_RADIUS[tier] ?? 2;
  const prep = npPrepare(parish);
  const groundMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const flatMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const fixed = new THREE.Group(); fixed.name = "parish-fixed"; root.add(fixed);
  const chunkRoot = new THREE.Group(); chunkRoot.name = "parish-chunks"; root.add(chunkRoot);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), v3 = new THREE.Vector3();

  // The backdrop: the whole field, coarse, dropped below the streamed chunks.
  const backdrop = new THREE.Mesh(npTerrainGeometry(THREE, parish, -NP_SIZE / 2, -NP_SIZE / 2, NP_SIZE, 64, 0.6), groundMat);
  backdrop.name = "parish-backdrop";
  fixed.add(backdrop);

  // Water: one flat surface per body (a wetland sits a little lower and is more transparent).
  const waters = [];
  for (const w of prep.water) {
    const wet = w.kind === "wetland";
    const mesh = new THREE.Mesh(npWaterGeometry(THREE, w.shape, wet ? NP_WATER_Y - 0.12 : NP_WATER_Y),
      new THREE.MeshLambertMaterial({ color: w.colour, emissive: 0x0a1a22, transparent: true, opacity: wet ? 0.7 : 0.9, side: THREE.DoubleSide }));
    mesh.name = `water-${w.id}`;
    fixed.add(mesh); waters.push(mesh);
  }

  // Levee crowns: a pale path along every crest, one mesh.
  const crownGeo = npConcat(THREE, prep.levees.map((l) => npRibbon(THREE, l.pts, NP_LEVEE_CREST * 2, 0xb9b08a, (t, p) => npHeightAt(parish, p.x, p.z) + 0.08, { stepLen: 10 })));
  if (crownGeo) { const crowns = new THREE.Mesh(crownGeo, groundMat); crowns.name = "parish-levee-crowns"; fixed.add(crowns); }

  // Roads: one merged ribbon per kind on the road surface (the deck for a bridge); the ferry is a dashed water route.
  const roadMeshes = [];
  const byKind = {};
  for (const r of prep.roads) (byKind[r.kind] ??= []).push(r);
  for (const [kind, list] of Object.entries(byKind)) {
    const style = NP_ROAD_KINDS[kind];
    if (!style || kind === "ferry") continue;
    const geo = npConcat(THREE, list.map((r) => npRibbon(THREE, r.pts, style.width, style.colour, (t) => npRoadSurfaceAt(parish, r, t), { stepLen: style.clearance ? 6 : 8 })));
    if (!geo) continue;
    const mesh = new THREE.Mesh(geo, groundMat); mesh.name = `roads-${kind}`; fixed.add(mesh); roadMeshes.push(mesh);
  }
  // Bridge piers where a deck stands clear of the ground.
  const pierSpots = [];
  for (const r of [...(byKind.bridge ?? []), ...(byKind.causeway ?? [])]) {
    const total = npPolyLength(r.pts);
    for (let d = 20; d < total - 20; d += 36) {
      const t = d / total, p = npPolyPointAt(r.pts, t), deck = npDeckHeightAt(r, t), g = npHeightAt(parish, p.x, p.z);
      if (deck - g > 2.5) pierSpots.push({ x: p.x, z: p.z, y0: Math.min(g, NP_WATER_Y - 1), y1: deck - 0.2, yaw: p.yaw });
    }
  }
  const piers = new THREE.InstancedMesh(new THREE.BoxGeometry(3, 1, 8).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: 0x8f9398 }), Math.max(1, pierSpots.length));
  pierSpots.forEach((p, i) => { q.setFromAxisAngle(up, p.yaw); m4.compose(v3.set(p.x, p.y0, p.z), q, new THREE.Vector3(1, p.y1 - p.y0, 1)); piers.setMatrixAt(i, m4); });
  if (!pierSpots.length) { m4.makeScale(0.0001, 0.0001, 0.0001); piers.setMatrixAt(0, m4); }
  piers.name = "parish-piers"; fixed.add(piers);
  // The ferry route and its boat.
  const ferries = byKind.ferry ?? [];
  let ferryBoat = null, ferryRoute = null;
  if (ferries.length) {
    const seg = [];
    for (const f of ferries) { const pts = npPointsAlong(f.pts, 12); for (let i = 1; i < pts.length; i += 2) seg.push(pts[i - 1][0], NP_WATER_Y + 0.15, pts[i - 1][1], pts[i][0], NP_WATER_Y + 0.15, pts[i][1]); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    const line = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xdff3ff })); line.name = "parish-ferry-route"; fixed.add(line);
    ferryRoute = ferries[0].pts;
    ferryBoat = new THREE.Mesh(npMerge(THREE, [[new THREE.BoxGeometry(14, 2, 6), 0xf4f4f0, npM(THREE, 0, 1, 0)], [new THREE.BoxGeometry(8, 2.4, 4.4), 0x2f6fd6, npM(THREE, 0, 3.2, 0)]]), flatMat);
    ferryBoat.name = "parish-ferry"; fixed.add(ferryBoat);
  }

  // Sites: a low building, a job board on its post, a flag pole.
  const boardMat = new THREE.MeshLambertMaterial({ color: 0xffb020, emissive: 0x442800 });
  const bldMat = new THREE.MeshLambertMaterial({ color: 0xcfc4ae });
  const postMat = new THREE.MeshLambertMaterial({ color: 0x5b4a36 });
  const siteBoards = [];
  prep.sites.forEach((s, i) => {
    const y = npHeightAt(parish, s.position[0], s.position[1]);
    const g = new THREE.Group(); g.name = `site-${s.id}`; g.position.set(s.position[0], y, s.position[1]);
    const w = 16 + (i % 3) * 4, d = 10 + (i % 2) * 4, h = 5 + (i % 4);
    const house = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bldMat); house.position.set(-14, h / 2, -12);
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 0.2), boardMat); board.position.set(0, 1.6, 6);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 0.15), postMat); leg.position.set(0, 0.8, 6);
    g.add(house, board, leg); fixed.add(g);
    siteBoards.push({ site: s, x: s.position[0], z: s.position[1] + 6, y });
  });

  // Landmarks (green signs), connectors (tall white signposts at the way out) and field lessons (blue signs): instanced.
  const landmarks = parish.landmarks ?? [];
  const lmMesh = new THREE.InstancedMesh(npSignGeometry(THREE, 0x2e8b57), flatMat, Math.max(1, landmarks.length));
  landmarks.forEach((l, i) => { m4.makeTranslation(l.position[0], npHeightAt(parish, l.position[0], l.position[1]), l.position[1]); lmMesh.setMatrixAt(i, m4); });
  lmMesh.name = "parish-landmarks"; fixed.add(lmMesh);
  const conns = parish.connectors ?? [];
  const cnMesh = new THREE.InstancedMesh(npSignGeometry(THREE, 0xf2f2f2, true), flatMat, Math.max(1, conns.length));
  conns.forEach((c, i) => { m4.makeTranslation(c.from.position[0], npHeightAt(parish, c.from.position[0], c.from.position[1]), c.from.position[1]); cnMesh.setMatrixAt(i, m4); });
  cnMesh.name = "parish-connectors"; fixed.add(cnMesh);
  const lessons = parish.fieldLessons ?? [];
  const lessonSigns = lessons.map((l) => {
    const site = prep.sites.find((s) => s.id === l.site) ?? prep.sites[0];
    const k = lessons.indexOf(l);
    return { lesson: l, x: site.position[0] + 14 + (k % 3) * 6, z: site.position[1] + 14 };
  });
  const lsMesh = new THREE.InstancedMesh(npSignGeometry(THREE, 0x2f6fd6), flatMat, Math.max(1, lessonSigns.length));
  lessonSigns.forEach((s, i) => { s.y = npHeightAt(parish, s.x, s.z); m4.makeTranslation(s.x, s.y, s.z); lsMesh.setMatrixAt(i, m4); });
  lsMesh.name = "parish-lessons"; fixed.add(lsMesh);

  // ---- streaming
  const massGeo = npMassingGeometries(THREE);
  const loaded = new Map(); // key -> { mesh, mass: InstancedMesh[], lod, massRing }
  let lastKey = null;
  function disposeChunk(c) {
    chunkRoot.remove(c.mesh); c.mesh.geometry.dispose();
    for (const m of c.mass) { chunkRoot.remove(m); m.dispose?.(); }
  }
  function buildChunk(ch) {
    const x0 = -NP_SIZE / 2 + ch.cx * NP_CHUNK, z0 = -NP_SIZE / 2 + ch.cz * NP_CHUNK;
    const mesh = new THREE.Mesh(npTerrainGeometry(THREE, parish, x0, z0, NP_CHUNK, NP_LOD_SEGMENTS[ch.lod]), groundMat);
    mesh.name = `chunk-${ch.key}`;
    chunkRoot.add(mesh);
    const mass = [];
    if (ch.ring <= massR) {
      const spots = npMassingForChunk(parish, ch.cx, ch.cz);
      const groups = {};
      for (const s of spots) (groups[s.kind] ??= []).push(s);
      for (const [kind, list] of Object.entries(groups)) {
        const geo = massGeo[kind]; if (!geo) continue;
        const keep = tier === "low" ? list.filter((_, i) => i % 5 !== 4) : list;
        const im = new THREE.InstancedMesh(geo, flatMat, keep.length);
        keep.forEach((s, i) => {
          q.setFromAxisAngle(up, s.rot);
          const sc = NP_UNIT_HEIGHT.has(kind) ? v3.set(s.s, s.h, s.s) : NP_UNIFORM_BY_H[kind] ? v3.set(s.h / NP_UNIFORM_BY_H[kind], s.h / NP_UNIFORM_BY_H[kind], s.h / NP_UNIFORM_BY_H[kind]) : v3.set(s.s, s.s, s.s);
          m4.compose(new THREE.Vector3(s.x, s.y - 0.15, s.z), q, sc);
          im.setMatrixAt(i, m4);
        });
        im.name = `mass-${kind}-${ch.key}`;
        chunkRoot.add(im); mass.push(im);
      }
    }
    return { mesh, mass, lod: ch.lod, massRing: ch.ring <= massR };
  }
  /** Stream around (x, z). Builds at most `budget` chunks per call so a frame never stalls. */
  function update(x, z, budget = 3) {
    const want = npChunksAround(x, z, streamR);
    const key = want.find((w) => w.ring === 0)?.key;
    const keep = new Set(want.map((w) => w.key));
    for (const [k, c] of loaded) if (!keep.has(k)) { disposeChunk(c); loaded.delete(k); }
    want.sort((a, b) => a.ring - b.ring);
    let built = 0;
    for (const w of want) {
      const c = loaded.get(w.key);
      const needMass = w.ring <= massR;
      if (c && c.lod === w.lod && c.massRing === needMass) continue;
      if (built >= budget) break;
      if (c) disposeChunk(c);
      loaded.set(w.key, buildChunk(w));
      built++;
    }
    lastKey = key;
    return built;
  }

  let clock = 0;
  function animate(dt) {
    clock += dt;
    if (ferryBoat && ferryRoute) {
      const period = 90, k = (clock % (period * 2)) / period, u = k < 1 ? k : 2 - k;
      const p = npPolyPointAt(ferryRoute, u);
      ferryBoat.position.set(p.x, NP_WATER_Y + 0.1, p.z);
      ferryBoat.rotation.y = p.yaw + (k < 1 ? 0 : Math.PI);
    }
  }

  /** Apply a satellite texture of the field (shared/np-geo.js's URL, loaded by the app) to the ground; null restores the vertex colours. */
  function setGroundTexture(tex) {
    if (tex) {
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      groundMat.map = tex; groundMat.vertexColors = false; groundMat.color?.set?.(0xffffff);
    } else { groundMat.map = null; groundMat.vertexColors = true; }
    groundMat.needsUpdate = true;
  }

  function stats() {
    let meshes = 0, triangles = 0, instances = 0;
    root.traverse((o) => {
      if (!(o.isMesh || o.isLine || o.isLineSegments)) return;
      meshes++;
      const g = o.geometry; const tri = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      triangles += o.isInstancedMesh ? tri * o.count : tri;
      if (o.isInstancedMesh && o.name.startsWith("mass-")) instances += o.count;
    });
    return { chunks: loaded.size, meshes, triangles: Math.round(triangles), instances, key: lastKey };
  }

  update(opts.start?.[0] ?? 0, opts.start?.[1] ?? 0, 999);
  return { parish, update, animate, stats, setGroundTexture, siteBoards, lessonSigns, backdrop, waters, roadMeshes, piers, ferryBoat, groundMat, loaded };
}

/** A parish's water strips (for a map): the river and canals widened, the polygons as they are. */
export function npWaterShapes(parish) { return npPrepare(parish).water.map((w) => ({ id: w.id, kind: w.kind, shape: w.shape, colour: w.colour })); }
void npStripFromCentreline; void NP_GROUND;
