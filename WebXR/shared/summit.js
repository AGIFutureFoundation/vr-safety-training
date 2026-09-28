// Sierra Summit — the three.js builder over shared/summit-data.js.
//
// smBuildSummit(root, THREE, opts) returns a world object whose update(x, z)
// streams terrain chunks around the player: each chunk is one vertex-
// coloured mesh at the LOD its ring asks for (SM_LOD_SEGMENTS), and the
// inner rings carry one InstancedMesh of conifers each. Beyond the streamed
// square a single coarse backdrop mesh of the whole 4096 m field keeps the
// peaks on the horizon for one draw call. The fixed features (road ribbon,
// reservoir, dam, penstock, transmission towers and wires, gondola, site
// buildings and boards, egg cairns, lesson signs) are built once and are
// cheap: instanced where they repeat.
//
// Every top-level name is prefixed `sm` (the bundler's one scope).

import {
  SM_BOUNDS, SM_SIZE, SM_CHUNK, SM_LOD_SEGMENTS, SM_STREAM_RADIUS, SM_TREE_RADIUS, SM_TREES_PER_CHUNK,
  SM_TREE_RING_FACTOR, SM_IMPOSTOR_RING, SM_SCREE, SM_TREELINE, SM_WATER_LEVEL, SM_LAKE, SM_PASS_ROAD, SM_SERVICE_ROAD,
  SM_TRANSMISSION, SM_GONDOLA, SM_PENSTOCK, SM_SITES, SM_LANDMARKS, SM_EGGS, SM_FIELD_LESSONS, SM_TRAILS, SM_TUNNEL_SPAN,
  SM_RIVER, SM_RIVER_CHANNEL,
  smHeightAt, smGradAt, smSnowlineAt, smRiverSurfaceAt, smChunksAround, smTreesForChunk, smPolyDistance, smInLake,
} from "./summit-data.js";

const SM_COL = {
  meadow: [0.42, 0.55, 0.27], forest: [0.24, 0.36, 0.2], scree: [0.52, 0.5, 0.47], rock: [0.4, 0.38, 0.36],
  snow: [0.93, 0.95, 0.98], bed: [0.36, 0.33, 0.28],
};

const smStep = (e0, e1, v) => { const t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const smMix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** Strata noise in [-1, 1]: near-horizontal bands that wander with position, for cliff bands and scree fans. */
function smBandNoise(x, z, h) { return Math.sin(h * 0.09 + Math.sin(x * 0.021) * 1.7 + Math.cos(z * 0.017) * 1.3); }

/**
 * The ground colour for a height, slope and aspect (vertex colours, no
 * textures). Cliffs (slope over one) read as banded rock; the snowline is
 * lower on north-facing ground (smSnowlineAt); scree comes in by height
 * above the scree line and, below it, in fans down steep gullies.
 */
export function smGroundColour(x, z, h, slope, out, aspect = 0) {
  let c;
  const band = smBandNoise(x, z, h);
  if (h < SM_WATER_LEVEL + 1 && smInLake(x, z)) c = SM_COL.bed;
  else if (slope > 1.0) { const k = band > 0.25 ? 0.78 : band < -0.35 ? 1.12 : 1; c = [SM_COL.rock[0] * k, SM_COL.rock[1] * k, SM_COL.rock[2] * k]; }
  else if (h > smSnowlineAt(aspect) + slope * 90) c = SM_COL.snow;
  else {
    const byHeight = smStep(SM_SCREE - 40, SM_SCREE + 120, h);
    const fan = smStep(0.5, 0.85, slope) * smStep(SM_SCREE - 240, SM_SCREE, h) * (0.55 + 0.45 * band);
    const base = (Math.sin(x * 0.011) + Math.cos(z * 0.013)) > 0.2 ? SM_COL.meadow : SM_COL.forest;
    c = smMix(base, SM_COL.scree, Math.min(1, byHeight + fan));
  }
  const n = 0.92 + ((Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 + 1) % 1 * 0.14;
  out[0] = c[0] * n; out[1] = c[1] * n; out[2] = c[2] * n;
  return out;
}

function smTerrainGeometry(THREE, x0, z0, size, segs, drop = 0) {
  const n = segs + 1;
  const pos = new Float32Array(n * n * 3), col = new Float32Array(n * n * 3);
  const step = size / segs, tmp = [0, 0, 0];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = x0 + i * step, z = z0 + j * step, h = smHeightAt(x, z) - drop;
    const k = (j * n + i) * 3;
    pos[k] = x; pos[k + 1] = h; pos[k + 2] = z;
    const gr = smGradAt(x, z, Math.max(3, step * 0.5));
    smGroundColour(x, z, h + drop, gr.slope, tmp, gr.aspect);
    col[k] = tmp[0]; col[k + 1] = tmp[1]; col[k + 2] = tmp[2];
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
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/** Merge simple geometries into one non-indexed, vertex-coloured geometry. */
function smMerge(THREE, parts) {
  const polys = parts.map(([geo, colour, m]) => { const g = geo.index ? geo.toNonIndexed() : geo; if (m) g.applyMatrix4(m); return [g, colour]; });
  const total = polys.reduce((s, [g]) => s + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  for (const [g, colour] of polys) {
    const p = g.attributes.position.array; pos.set(p, o * 3);
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

/** A billboard impostor for far conifers: two crossed vertical quads, 4 triangles, drawn double-sided. */
function smImpostorGeometry(THREE) {
  const quad = new THREE.PlaneGeometry(5.2, 10.4).translate(0, 5.2, 0);
  return smMerge(THREE, [[quad, 0x21492d, new THREE.Matrix4()], [quad, 0x1e432a, new THREE.Matrix4().makeRotationY(Math.PI / 2)]]);
}

function smConiferGeometry(THREE) {
  const M = (y) => new THREE.Matrix4().makeTranslation(0, y, 0);
  return smMerge(THREE, [
    [new THREE.CylinderGeometry(0.25, 0.35, 2.4, 4), 0x5a3d26, M(1.2)],
    [new THREE.ConeGeometry(2.6, 6.2, 6), 0x1f4a2c, M(5.0)],
    [new THREE.ConeGeometry(1.7, 5.0, 5), 0x245433, M(8.2)],
  ]);
}

function smTowerGeometry(THREE) {
  const parts = [];
  const leg = new THREE.BoxGeometry(0.5, 32, 0.5);
  for (const [x, z, rx, rz] of [[-2.4, -2.4, 0.08, -0.08], [2.4, -2.4, 0.08, 0.08], [-2.4, 2.4, -0.08, -0.08], [2.4, 2.4, -0.08, 0.08]]) {
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, 0, rz)); m.setPosition(x * 0.6, 16, z * 0.6);
    parts.push([leg, 0x9aa3ad, m]);
  }
  for (const y of [8, 16, 24]) parts.push([new THREE.BoxGeometry(4.4 - y * 0.06, 0.3, 0.3), 0x9aa3ad, new THREE.Matrix4().makeTranslation(0, y, 0)]);
  parts.push([new THREE.BoxGeometry(14, 0.5, 0.6), 0x9aa3ad, new THREE.Matrix4().makeTranslation(0, 30, 0)]);
  parts.push([new THREE.BoxGeometry(9, 0.5, 0.6), 0x9aa3ad, new THREE.Matrix4().makeTranslation(0, 25, 0)]);
  return smMerge(THREE, parts);
}

function smCairnGeometry(THREE) {
  const M = (y, s) => new THREE.Matrix4().makeScale(s, s * 0.7, s).setPosition(0, y, 0);
  return smMerge(THREE, [
    [new THREE.DodecahedronGeometry(0.6, 0), 0x8f8a80, M(0.35, 1)],
    [new THREE.DodecahedronGeometry(0.45, 0), 0x9d978c, M(0.95, 1)],
    [new THREE.DodecahedronGeometry(0.3, 0), 0xb9b2a4, M(1.4, 1)],
    [new THREE.BoxGeometry(0.28, 0.02, 0.2), 0xf2e6b8, new THREE.Matrix4().makeTranslation(0, 1.66, 0)],
  ]);
}

function smSignGeometry(THREE) {
  return smMerge(THREE, [
    [new THREE.BoxGeometry(0.12, 1.6, 0.12), 0x6b4a2e, new THREE.Matrix4().makeTranslation(0, 0.8, 0)],
    [new THREE.BoxGeometry(1.2, 0.8, 0.08), 0x2f6fd6, new THREE.Matrix4().makeTranslation(0, 1.7, 0)],
    [new THREE.BoxGeometry(1.0, 0.1, 0.1), 0xffd24a, new THREE.Matrix4().makeTranslation(0, 2.14, 0.02)],
  ]);
}

/** A flat ribbon draped on the terrain along a polyline (road or trail). */
function smRibbon(THREE, pts, width, lift, colour, { skip = null, stepLen = 8, surface = null, omit = null } = {}) {
  const verts = [], cols = [], c = new THREE.Color(colour);
  let total = 0; const lens = [0];
  for (let i = 1; i < pts.length; i++) { total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(total); }
  const at = (d) => {
    let i = 1; while (i < lens.length - 1 && lens[i] < d) i++;
    const u = (d - lens[i - 1]) / ((lens[i] - lens[i - 1]) || 1);
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1;
    return { x: ax + dx * u, z: az + dz * u, nx: -dz / L, nz: dx / L };
  };
  let prev = null;
  for (let d = 0; d <= total + 0.01; d += stepLen) {
    const p = at(Math.min(d, total));
    const off = (skip && d / total > skip[0] && d / total < skip[1]) || (omit && omit(p.x, p.z));
    const w = width / 2;
    const l = [p.x + p.nx * w, 0, p.z + p.nz * w], r = [p.x - p.nx * w, 0, p.z - p.nz * w];
    if (surface) { l[1] = r[1] = surface(Math.min(d, total) / (total || 1)) + lift; }
    else { l[1] = smHeightAt(l[0], l[2]) + lift; r[1] = smHeightAt(r[0], r[2]) + lift; }
    if (prev && !off && !prev.off) {
      verts.push(...prev.l, ...prev.r, ...l, ...prev.r, ...r, ...l);
      for (let k = 0; k < 6; k++) cols.push(c.r, c.g, c.b);
    }
    prev = { l, r, off };
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  g.computeVertexNormals();
  return g;
}

function smCatenary(a, b, sag, n = 12) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    out.push(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag * 4 * u * (1 - u), a[2] + (b[2] - a[2]) * u);
  }
  return out;
}

function smPointsAlong(pts, spacing) {
  const out = [];
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / spacing));
    for (let k = i === 1 ? 0 : 1; k <= n; k++) out.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]);
  }
  return out;
}

/**
 * Build the world under `root`. opts: { tier: "low"|"balanced"|"high" }.
 * Returns { update(x, z), stats(), eggMesh, eggIndex, siteBoards, … }.
 */
export function smBuildSummit(root, THREE, opts = {}) {
  const tier = opts.tier ?? "high";
  const streamR = SM_STREAM_RADIUS[tier] ?? 3;
  const treeR = SM_TREE_RADIUS[tier] ?? 2;
  const groundMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const flatMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const fixed = new THREE.Group(); fixed.name = "summit-fixed"; root.add(fixed);
  const chunkRoot = new THREE.Group(); chunkRoot.name = "summit-chunks"; root.add(chunkRoot);

  // The backdrop: the whole field, coarse, dropped below the streamed chunks.
  const backdrop = new THREE.Mesh(smTerrainGeometry(THREE, SM_BOUNDS.minX, SM_BOUNDS.minZ, SM_SIZE, 96, 14), groundMat);
  backdrop.name = "summit-backdrop";
  fixed.add(backdrop);

  // The reservoir.
  const water = new THREE.Mesh(new THREE.CircleGeometry(SM_LAKE.radius * 1.08, 48).rotateX(-Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: 0x2f6f8f, transparent: true, opacity: 0.88 }));
  water.position.set(SM_LAKE.centre[0], SM_WATER_LEVEL, SM_LAKE.centre[1]);
  water.name = "summit-reservoir";
  fixed.add(water);

  // The river: a flat water ribbon on the channel's own descending surface, absent under the road's culvert.
  const riverMat = new THREE.MeshLambertMaterial({ color: 0x3a7fa0, transparent: true, opacity: 0.86 });
  const river = new THREE.Mesh(smRibbon(THREE, SM_RIVER, SM_RIVER_CHANNEL.width * 0.9, 0, 0x3a7fa0,
    { stepLen: 10, surface: smRiverSurfaceAt, omit: (x, z) => smPolyDistance(x, z, SM_PASS_ROAD).d < 12 }), riverMat);
  river.name = "summit-river";
  fixed.add(river);

  // Roads and trails.
  fixed.add(new THREE.Mesh(smRibbon(THREE, SM_PASS_ROAD, 8, 0.35, 0x3b3d40, { skip: SM_TUNNEL_SPAN }), groundMat));
  fixed.add(new THREE.Mesh(smRibbon(THREE, SM_SERVICE_ROAD, 5, 0.3, 0x6d6152), groundMat));
  for (const t of SM_TRAILS) fixed.add(new THREE.Mesh(smRibbon(THREE, t.pts, 1.6, 0.25, 0x9b8561, { stepLen: 6 }), groundMat));

  // The dam: a wall across the reservoir's south rim, thicker at its base.
  const damZ = SM_LAKE.centre[1] + SM_LAKE.radius + 6;
  const damBase = smHeightAt(SM_LAKE.centre[0], damZ + 80);
  const damH = SM_WATER_LEVEL + 5 - damBase;
  const damGeo = new THREE.BufferGeometry();
  {
    const w = 340, top = 6, base = 40, y0 = damBase - 4, y1 = SM_WATER_LEVEL + 5, x0 = SM_LAKE.centre[0];
    const P = [[-w / 2, y0, -base / 2], [w / 2, y0, -base / 2], [w / 2, y0, base / 2], [-w / 2, y0, base / 2],
      [-w / 2, y1, -top / 2], [w / 2, y1, -top / 2], [w / 2, y1, top / 2], [-w / 2, y1, top / 2]].map(([x, y, z]) => [x + x0, y, z + damZ]);
    const F = [[0, 1, 5, 4], [2, 3, 7, 6], [3, 0, 4, 7], [1, 2, 6, 5], [4, 5, 6, 7]];
    const v = [];
    for (const [a, b, c, d] of F) v.push(...P[a], ...P[b], ...P[c], ...P[a], ...P[c], ...P[d]);
    damGeo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    damGeo.computeVertexNormals();
  }
  const dam = new THREE.Mesh(damGeo, new THREE.MeshLambertMaterial({ color: 0xb8b4aa, side: THREE.DoubleSide }));
  dam.name = "summit-dam";
  fixed.add(dam);

  // The penstock: a steel pipe down the slope to the powerhouse.
  {
    const [a, b] = SM_PENSTOCK;
    const A = new THREE.Vector3(a[0], smHeightAt(a[0], a[1]) + 2, a[1]);
    const B = new THREE.Vector3(b[0], smHeightAt(b[0], b[1]) + 2, b[1]);
    const len = A.distanceTo(B);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, len, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0x55606a }));
    pipe.position.copy(A).lerp(B, 0.5);
    pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    pipe.name = "summit-penstock";
    fixed.add(pipe);
    const ph = new THREE.Mesh(new THREE.BoxGeometry(40, 16, 26), new THREE.MeshLambertMaterial({ color: 0x9c8f7c }));
    ph.position.set(b[0], smHeightAt(b[0], b[1]) + 8, b[1] + 12);
    fixed.add(ph);
  }

  // Transmission towers (instanced) and their three-phase wires.
  const towerPts = smPointsAlong(SM_TRANSMISSION, 180);
  const towers = new THREE.InstancedMesh(smTowerGeometry(THREE), flatMat, towerPts.length);
  const wire = [];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
  towerPts.forEach(([x, z], i) => {
    const nx = towerPts[Math.min(i + 1, towerPts.length - 1)], pv = towerPts[Math.max(i - 1, 0)];
    const yaw = Math.atan2(nx[0] - pv[0], nx[1] - pv[1]) + Math.PI / 2;
    q.setFromAxisAngle(up, yaw);
    m4.compose(new THREE.Vector3(x, smHeightAt(x, z) - 0.5, z), q, s1);
    towers.setMatrixAt(i, m4);
  });
  for (let i = 1; i < towerPts.length; i++) {
    const [ax, az] = towerPts[i - 1], [bx, bz] = towerPts[i];
    const yaw = Math.atan2(bx - ax, bz - az) + Math.PI / 2;
    for (const off of [-6.5, 0, 6.5]) {
      const ox = Math.sin(yaw) * off, oz = Math.cos(yaw) * off;
      const A = [ax + ox, smHeightAt(ax, az) + 29.5, az + oz], B = [bx + ox, smHeightAt(bx, bz) + 29.5, bz + oz];
      const pts = smCatenary(A, B, 7);
      for (let k = 3; k < pts.length; k += 3) wire.push(pts[k - 3], pts[k - 2], pts[k - 1], pts[k], pts[k + 1], pts[k + 2]);
    }
  }
  towers.name = "summit-towers";
  fixed.add(towers);
  const wireGeo = new THREE.BufferGeometry(); wireGeo.setAttribute("position", new THREE.Float32BufferAttribute(wire, 3));
  fixed.add(new THREE.LineSegments(wireGeo, new THREE.LineBasicMaterial({ color: 0x2b2f33 })));

  // The gondola: towers, a haul rope and cabins that circulate.
  const [gA, gB] = SM_GONDOLA;
  const gPts = smPointsAlong([gA, gB], 150);
  const gTowers = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.8, 1.2, 22, 6).translate(0, 11, 0), new THREE.MeshLambertMaterial({ color: 0xd9dde2 }), gPts.length);
  const ropeY = gPts.map(([x, z]) => smHeightAt(x, z) + 21);
  gPts.forEach(([x, z], i) => { m4.makeTranslation(x, smHeightAt(x, z), z); gTowers.setMatrixAt(i, m4); });
  fixed.add(gTowers);
  const ropeGeo = new THREE.BufferGeometry();
  const rope = [];
  for (let i = 1; i < gPts.length; i++) rope.push(gPts[i - 1][0], ropeY[i - 1], gPts[i - 1][1], gPts[i][0], ropeY[i], gPts[i][1]);
  ropeGeo.setAttribute("position", new THREE.Float32BufferAttribute(rope, 3));
  fixed.add(new THREE.LineSegments(ropeGeo, new THREE.LineBasicMaterial({ color: 0x222222 })));
  const cabins = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, 2.2, 2.4).translate(0, -2.2, 0), new THREE.MeshLambertMaterial({ color: 0xe8492f }), 8);
  fixed.add(cabins);
  const ropeAt = (u) => {
    const f = Math.max(0, Math.min(1, u)) * (gPts.length - 1), i = Math.min(gPts.length - 2, Math.floor(f)), k = f - i;
    return [gPts[i][0] + (gPts[i + 1][0] - gPts[i][0]) * k, ropeY[i] + (ropeY[i + 1] - ropeY[i]) * k, gPts[i][1] + (gPts[i + 1][1] - gPts[i][1]) * k];
  };

  // Sites: a building or two, a fence line for the substation, and a job board.
  const boardMat = new THREE.MeshLambertMaterial({ color: 0xffb020, emissive: 0x442800 });
  const bldMat = new THREE.MeshLambertMaterial({ color: 0xc7bca8 });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x7a3b2a });
  const siteBoards = [];
  const siteRng = (i) => ((Math.sin(i * 91.7) * 43758.5) % 1 + 1) % 1;
  SM_SITES.forEach((s, i) => {
    const y = smHeightAt(s.at[0], s.at[1]);
    const g = new THREE.Group(); g.name = `site-${s.id}`; g.position.set(s.at[0], y, s.at[1]);
    const nb = s.id === "valley-base" ? 1 : 2;
    for (let b = 0; b < nb; b++) {
      const w = 12 + siteRng(i * 3 + b) * 12, d = 10 + siteRng(i * 5 + b) * 8, h = 5 + siteRng(i * 7 + b) * 5;
      const house = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bldMat);
      house.position.set(-18 + b * 30, h / 2, -14);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, 3, 4).rotateY(Math.PI / 4), roofMat);
      roof.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
      roof.position.set(-18 + b * 30, h + 1.5, -14);
      g.add(house, roof);
    }
    const post = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 0.2), boardMat);
    post.position.set(0, 1.6, 6);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 0.15), roofMat);
    leg.position.set(0, 0.8, 6);
    g.add(post, leg);
    fixed.add(g);
    siteBoards.push({ site: s, x: s.at[0], z: s.at[1] + 6, y });
  });

  // Landmarks: the two lookouts get a hut; the tunnel gets its portal.
  for (const l of SM_LANDMARKS) {
    const y = smHeightAt(l.at[0], l.at[1]);
    if (l.id === "summit-lookout" || l.id === "west-lookout") {
      const hut = new THREE.Group(); hut.position.set(l.at[0], y, l.at[1]); hut.name = `landmark-${l.id}`;
      const legH = l.id === "west-lookout" ? 9 : 0;
      if (legH) for (const [dx, dz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.3, legH, 0.3), roofMat); lg.position.set(dx, legH / 2, dz); hut.add(lg); }
      const cab = new THREE.Mesh(new THREE.BoxGeometry(5, 3.2, 5), new THREE.MeshLambertMaterial({ color: l.id === "west-lookout" ? 0x8a6a45 : 0x8e8a82 }));
      cab.position.y = legH + 1.6;
      const rf = new THREE.Mesh(new THREE.ConeGeometry(4.4, 2, 4).rotateY(Math.PI / 4), roofMat); rf.position.y = legH + 4.2;
      hut.add(cab, rf); fixed.add(hut);
    }
  }
  {
    const portalT = SM_TUNNEL_SPAN;
    for (const [px, pz, face] of [[600, -560, 0], [900, -900, Math.PI]]) {
      const y = smHeightAt(px, pz);
      const pg = new THREE.Group(); pg.position.set(px, y, pz); pg.name = "tunnel-portal";
      const dir = Math.atan2(900 - 600, -900 + 560) + face;
      pg.rotation.y = dir;
      const wall = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 3), new THREE.MeshLambertMaterial({ color: 0x9d9a92 }));
      wall.position.set(0, 7, 0);
      const hole = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), new THREE.MeshBasicMaterial({ color: 0x07090b }));
      hole.position.set(0, 4, 1.55);
      pg.add(wall, hole); fixed.add(pg);
    }
    void portalT;
  }

  // Egg cairns (instanced; a found one is scaled to nothing) and lesson signs.
  const eggMesh = new THREE.InstancedMesh(smCairnGeometry(THREE), flatMat, SM_EGGS.length);
  eggMesh.name = "summit-eggs";
  const eggIndex = new Map();
  SM_EGGS.forEach((e, i) => {
    m4.makeTranslation(e.at[0], smHeightAt(e.at[0], e.at[1]), e.at[1]);
    eggMesh.setMatrixAt(i, m4); eggIndex.set(e.id, i);
  });
  fixed.add(eggMesh);
  const lessonMesh = new THREE.InstancedMesh(smSignGeometry(THREE), flatMat, SM_FIELD_LESSONS.length);
  lessonMesh.name = "summit-lessons";
  SM_FIELD_LESSONS.forEach((l, i) => { m4.makeTranslation(l.position[0], smHeightAt(l.position[0], l.position[1]), l.position[1]); lessonMesh.setMatrixAt(i, m4); });
  fixed.add(lessonMesh);
  function hideEgg(id) {
    const i = eggIndex.get(id); if (i === undefined) return;
    m4.makeScale(0.0001, 0.0001, 0.0001); eggMesh.setMatrixAt(i, m4); eggMesh.instanceMatrix.needsUpdate = true;
  }

  // ---- streaming
  const conifer = smConiferGeometry(THREE);
  const impostor = smImpostorGeometry(THREE);
  const impostorMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const loaded = new Map(); // key -> { mesh, trees, lod, treeRing }
  let lastKey = null;
  function disposeChunk(c) {
    chunkRoot.remove(c.mesh); c.mesh.geometry.dispose();
    if (c.trees) { chunkRoot.remove(c.trees); c.trees.dispose?.(); }
  }
  function buildChunk(ch) {
    const x0 = SM_BOUNDS.minX + ch.cx * SM_CHUNK, z0 = SM_BOUNDS.minZ + ch.cz * SM_CHUNK;
    const mesh = new THREE.Mesh(smTerrainGeometry(THREE, x0, z0, SM_CHUNK, SM_LOD_SEGMENTS[ch.lod]), groundMat);
    mesh.name = `chunk-${ch.key}`;
    chunkRoot.add(mesh);
    let trees = null;
    if (ch.ring <= treeR) {
      const n = Math.round(SM_TREES_PER_CHUNK * (SM_TREE_RING_FACTOR[ch.ring] ?? SM_TREE_RING_FACTOR[SM_TREE_RING_FACTOR.length - 1]) * (tier === "low" ? 0.5 : 1));
      const list = smTreesForChunk(ch.cx, ch.cz, n);
      if (list.length) {
        const far = ch.ring >= SM_IMPOSTOR_RING;
        trees = new THREE.InstancedMesh(far ? impostor : conifer, far ? impostorMat : flatMat, list.length);
        list.forEach((t, i) => {
          q.setFromAxisAngle(up, t.r);
          m4.compose(new THREE.Vector3(t.x, t.y - 0.3, t.z), q, new THREE.Vector3(t.s, t.s * (0.9 + (i % 5) * 0.06), t.s));
          trees.setMatrixAt(i, m4);
        });
        trees.name = `trees-${ch.key}`;
        chunkRoot.add(trees);
      }
    }
    return { mesh, trees, lod: ch.lod, treeRing: ch.ring <= treeR };
  }
  /** Stream around (x, z). Builds at most `budget` chunks per call so a frame never stalls. */
  function update(x, z, budget = 3) {
    const want = smChunksAround(x, z, streamR);
    const key = want.find((w) => w.ring === 0)?.key;
    const keep = new Set(want.map((w) => w.key));
    for (const [k, c] of loaded) if (!keep.has(k)) { disposeChunk(c); loaded.delete(k); }
    want.sort((a, b) => a.ring - b.ring);
    let built = 0;
    for (const w of want) {
      const c = loaded.get(w.key);
      const needTrees = w.ring <= treeR;
      if (c && c.lod === w.lod && c.treeRing === needTrees) continue;
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
    for (let i = 0; i < 8; i++) {
      let u = ((clock * 0.01 + i / 8) % 1);
      const going = u < 0.5; u = going ? u * 2 : 2 - u * 2;
      const p = ropeAt(u);
      m4.makeTranslation(p[0] + (going ? 2 : -2), p[1], p[2]);
      cabins.setMatrixAt(i, m4);
    }
    cabins.instanceMatrix.needsUpdate = true;
  }

  function stats() {
    let meshes = 0, triangles = 0, trees = 0;
    root.traverse((o) => {
      if (!(o.isMesh || o.isLine)) return;
      meshes++;
      const g = o.geometry; const tri = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      triangles += o.isInstancedMesh ? tri * o.count : tri;
      if (o.name.startsWith("trees-")) trees += o.count;
    });
    return { chunks: loaded.size, meshes, triangles: Math.round(triangles), trees, key: lastKey };
  }

  update(opts.start?.[0] ?? 0, opts.start?.[1] ?? 0, 999);
  return { update, animate, stats, eggMesh, eggIndex, hideEgg, siteBoards, backdrop, water, river, dam, damHeight: damH, towers, cabins, loaded };
}
