// CITYWORKS (docs/consoles/CITYWORKS.md): the three.js half — street surfaces, lane dashes, kerbs, sidewalks,
// crosswalks, streetlights and site-building doors over shared/cw-cityworks.js's pure answers.
//
// SEAM: cwMountStreets({ THREE, root, parish, tier }) -> { update(x, z, budget), setNight(on), stats(), chunkStats(), group }
//   Streams with the parish: one merged vertex-coloured mesh per chunk inside CW_STREET_RADIUS[tier] (surfaces of the
//   AUTHORED procedural fabric, lane dashes on arterials and named avenues, kerbs and sidewalks both sides of arterials,
//   collectors and named avenues/streets, zebra crosswalks at junctions near a site), streetlights along arterials and
//   avenues as three InstancedMeshes for the whole loaded set (poles; heads lit at night; light pools shown at night), and one merged mesh of doors on
//   the site buildings' road faces. Nothing animates, so reduced motion needs nothing. Phone tier ("low"): ring 1, no lane
//   dashes, every other light.
//
// Every top-level name is prefixed cw/CW_; three.js comes from the caller as `THREE`.

import { NP_SIZE, NP_CHUNK, npHeightAt, npWaterAt, npChunksAround, npPrepare } from "./np-parish.js";
import {
  CW_KERB, CW_SIDEWALK, CW_SIDEWALK_LIFT, CW_STREET_LIFT, CW_LIGHT_SPACING, CW_BUDGET, CW_STREET_RADIUS, CW_CLASSES,
  cwLines, cwSegmentGrid, cwSegDist, cwSidewalkAt, cwCrosswalkNodes, cwSiteBuilding, cwDoorOf,
} from "./cw-cityworks.js";

const CW_COL = { kerb: 0xbdb8ad, sidewalk: 0xa7a398, dash: 0xe6cf6e, zebra: 0xf2f2ee, door: 0x5e4128 };

/** A quad collector: push(corners[4] as [x, y, z], colour) makes two up-facing triangles. */
function cwQuads(THREE) {
  const pos = [], col = [], c = new THREE.Color();
  function tri(a, b, d, colour) {
    const ux = b[0] - a[0], uz = b[2] - a[2], vx = d[0] - a[0], vz = d[2] - a[2];
    const up = uz * vx - ux * vz >= 0;
    const seq = up ? [a, b, d] : [a, d, b];
    c.setHex(colour);
    for (const p of seq) { pos.push(p[0], p[1], p[2]); col.push(c.r, c.g, c.b); }
  }
  return {
    push(q, colour) { tri(q[0], q[1], q[2], colour); tri(q[0], q[2], q[3], colour); },
    count() { return pos.length / 9; },
    geometry() {
      if (!pos.length) return null;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      g.computeVertexNormals(); g.computeBoundingSphere();
      return g;
    },
  };
}

/** A band along a–b (both [x, z]) between offsets o0..o1 from the centreline (signed), at heights ya, yb. */
function cwBand(a, b, ya, yb, nx, nz, o0, o1) {
  return [[a[0] + nx * o0, ya, a[1] + nz * o0], [b[0] + nx * o0, yb, b[1] + nz * o0], [b[0] + nx * o1, yb, b[1] + nz * o1], [a[0] + nx * o1, ya, a[1] + nz * o1]];
}

/** The streetlight spots of a parish: `[{ x, z, yaw, key }]`, deterministic, along lines that carry lights, off water. */
export function cwLightSpots(parish) {
  const out = [];
  for (const l of cwLines(parish)) {
    if (!l.lights) continue;
    let acc = CW_LIGHT_SPACING / 2, side = 1, k = 0;
    for (let i = 1; i < l.pts.length; i++) {
      const a = l.pts[i - 1], b = l.pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 1e-6) continue;
      const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
      while (acc <= L) {
        const off = l.width / 2 + CW_KERB + 0.6;
        const x = a[0] + ux * acc + nx * off * side, z = a[1] + uz * acc + nz * off * side;
        if (Math.abs(x) < NP_SIZE / 2 - 4 && Math.abs(z) < NP_SIZE / 2 - 4 && !npWaterAt(parish, x, z) && cwSidewalkAt(parish, x, z)) out.push({ x, z, yaw: Math.atan2(-nx * side, -nz * side), n: k });
        k++; side = -side; acc += CW_LIGHT_SPACING;
      }
      acc -= L;
    }
  }
  return out;
}

/** Build one chunk's street geometry (pure over three.js): returns { geometry, triangles, lights: [spots] }. */
export function cwChunkGeometry(THREE, parish, cx, cz, { tier = "high", grid, lights, crosswalks } = {}) {
  const x0 = -NP_SIZE / 2 + cx * NP_CHUNK, z0 = -NP_SIZE / 2 + cz * NP_CHUNK, x1 = x0 + NP_CHUNK, z1 = z0 + NP_CHUNK;
  const Q = cwQuads(THREE);
  const segs = grid.query(x0 + NP_CHUNK / 2, z0 + NP_CHUNK / 2, NP_CHUNK * 0.75).filter((s) => {
    const mx = (s.a[0] + s.b[0]) / 2, mz = (s.a[1] + s.b[1]) / 2;
    return mx >= x0 && mx < x1 && mz >= z0 && mz < z1;
  }).sort((p, q) => p.li - q.li || p.i - q.i);
  for (const s of segs) {
    const l = s.line, a = s.a, b = s.b, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 0.5 || l.deck) continue;
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, w = l.width / 2;
    const ext = l.named ? 0 : Math.min(w * 0.6, 4);
    const pa = [a[0] - ux * ext, a[1] - uz * ext], pb = [b[0] + ux * ext, b[1] + uz * ext];
    const ya = npHeightAt(parish, a[0], a[1]), yb = npHeightAt(parish, b[0], b[1]);
    if (!l.named) Q.push(cwBand(pa, pb, ya + CW_STREET_LIFT, yb + CW_STREET_LIFT, nx, nz, -w, w), CW_CLASSES[l.cls]?.colour ?? 0x555555);
    const lift = l.named ? 0.3 : CW_STREET_LIFT;
    if (l.lanes && tier !== "low") {
      for (let d = 2; d + 3 <= L; d += 9) {
        const p = [a[0] + ux * d, a[1] + uz * d], q = [a[0] + ux * (d + 3), a[1] + uz * (d + 3)];
        const yp = ya + (yb - ya) * (d / L), yq = ya + (yb - ya) * ((d + 3) / L);
        Q.push(cwBand(p, q, yp + lift + 0.03, yq + lift + 0.03, nx, nz, -0.14, 0.14), CW_COL.dash);
      }
    }
    if (l.sidewalk) {
      const n = Math.max(1, Math.ceil(L / 8));
      for (let k = 0; k < n; k++) {
        const t0 = k / n, t1 = (k + 1) / n;
        const p = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], q = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
        const yp = ya + (yb - ya) * t0 + CW_SIDEWALK_LIFT, yq = ya + (yb - ya) * t1 + CW_SIDEWALK_LIFT;
        for (const side of [1, -1]) {
          const mid = w + CW_KERB + CW_SIDEWALK / 2, outer = w + CW_KERB + CW_SIDEWALK;
          const ok = (px, pz) => cwSidewalkAt(parish, px + nx * mid * side, pz + nz * mid * side) && !npWaterAt(parish, px + nx * outer * side, pz + nz * outer * side);
          if (!ok(p[0], p[1]) || !ok(q[0], q[1])) continue;
          Q.push(cwBand(p, q, yp, yq, nx, nz, side * w, side * (w + CW_KERB)), CW_COL.kerb);
          Q.push(cwBand(p, q, yp - 0.02, yq - 0.02, nx, nz, side * (w + CW_KERB), side * (w + CW_KERB + CW_SIDEWALK)), CW_COL.sidewalk);
        }
      }
    }
  }
  // Zebra crosswalks at junctions near a site: across each sidewalk line, 8 m out from the node, both ways.
  for (const c of crosswalks) {
    if (c.x < x0 || c.x >= x1 || c.z < z0 || c.z >= z1) continue;
    const y = npHeightAt(parish, c.x, c.z) + Math.max(CW_STREET_LIFT, 0.3) + 0.04;
    for (const s of grid.query(c.x, c.z, 14)) {
      if (!s.line.sidewalk || s.line.deck) continue;
      const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); if (L < 1) continue;
      const ux = (s.b[0] - s.a[0]) / L, uz = (s.b[1] - s.a[1]) / L, nx = -uz, nz = ux, w = s.line.width / 2;
      for (const sg of [1, -1]) {
        const cxp = c.x + ux * 8 * sg, czp = c.z + uz * 8 * sg;
        if (cwSegDist(cxp, czp, s.a, s.b).d > 0.8) continue;
        for (let o = -w + 0.6; o <= w - 0.6; o += 1.3) {
          const p = [cxp - ux * 1.5, czp - uz * 1.5], q = [cxp + ux * 1.5, czp + uz * 1.5];
          Q.push(cwBand(p, q, y, y, nx, nz, o, o + 0.6), CW_COL.zebra);
        }
      }
    }
  }
  let keep = lights.filter((s) => s.x >= x0 && s.x < x1 && s.z >= z0 && s.z < z1);
  if (tier === "low") keep = keep.filter((s) => s.n % 2 === 0);
  keep = keep.slice(0, CW_BUDGET.chunkLights);
  return { geometry: Q.geometry(), triangles: Q.count(), lights: keep };
}

function cwMergeBoxes(THREE, boxes) {
  const pos = [], col = [], c = new THREE.Color();
  for (const { geo, colour } of boxes) {
    const g = geo.toNonIndexed(); c.setHex(colour);
    const p = g.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) { pos.push(p[i], p[i + 1], p[i + 2]); col.push(c.r, c.g, c.b); }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  out.computeVertexNormals();
  return out;
}

/** SEAM — mount the streets, sidewalks, lights and doors under `root`; call update(x, z) beside the world's update. */
export function cwMountStreets({ THREE, root, parish, tier = "high" }) {
  const radius = CW_STREET_RADIUS[tier] ?? 2;
  const group = new THREE.Group(); group.name = "cityworks"; root.add(group);
  const lines = cwLines(parish);
  const grid = cwSegmentGrid(lines);
  const lights = cwLightSpots(parish);
  const crosswalks = cwCrosswalkNodes(parish);
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const loaded = new Map();

  // Streetlights: poles (vertex-coloured) and heads (lit at night), one InstancedMesh each for the loaded set.
  const cap = (2 * radius + 1) ** 2 * CW_BUDGET.chunkLights;
  const poleGeo = cwMergeBoxes(THREE, [
    { geo: new THREE.BoxGeometry(0.18, 7, 0.18).translate(0, 3.5, 0), colour: 0x5c6167 },
    { geo: new THREE.BoxGeometry(0.12, 0.12, 1.8).translate(0, 6.9, 0.9), colour: 0x5c6167 },
  ]);
  const poleMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const headMat = new THREE.MeshBasicMaterial({ color: 0x8a8f96 });
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, cap); poles.name = "cw-streetlight-poles"; poles.count = 0;
  const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.18, 0.8).translate(0, 6.78, 1.7), headMat, cap); heads.name = "cw-streetlight-heads"; heads.count = 0;
  // Light pools on the pavement: flat warm discs, shown only at night (one more InstancedMesh; nothing moves).
  const poolMat = new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.22, depthWrite: false });
  const pools = new THREE.InstancedMesh(new THREE.CircleGeometry(5, 12).rotateX(-Math.PI / 2).translate(0, -0.1, 1.7), poolMat, cap); pools.name = "cw-streetlight-pools"; pools.count = 0; pools.visible = false;
  group.add(poles, heads, pools);

  // Doors on the site buildings' road faces: one merged mesh.
  const doorBoxes = npPrepare(parish).sites.map((_, i) => {
    const b = cwSiteBuilding(parish, i), d = cwDoorOf(parish, b);
    const ns = d.face === "n" || d.face === "s";
    const off = (d.face === "s" || d.face === "e" ? 1 : -1) * 0.09;
    return { geo: new THREE.BoxGeometry(ns ? 1.6 : 0.16, 2.4, ns ? 0.16 : 1.6).translate(d.x + (ns ? 0 : off), b.y + 1.2, d.z + (ns ? off : 0)), colour: CW_COL.door };
  });
  const doors = doorBoxes.length ? new THREE.Mesh(cwMergeBoxes(THREE, doorBoxes), poleMat) : null;
  if (doors) { doors.name = "cw-site-doors"; group.add(doors); }

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  function refreshLights() {
    let n = 0;
    for (const c of loaded.values()) for (const s of c.lights) {
      if (n >= cap) break;
      q.setFromAxisAngle(up, s.yaw); m4.compose(v.set(s.x, npHeightAt(parish, s.x, s.z) + CW_SIDEWALK_LIFT, s.z), q, one);
      poles.setMatrixAt(n, m4); heads.setMatrixAt(n, m4); pools.setMatrixAt(n, m4); n++;
    }
    poles.count = heads.count = pools.count = n;
    poles.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = pools.instanceMatrix.needsUpdate = true;
    poles.computeBoundingSphere?.(); heads.computeBoundingSphere?.(); pools.computeBoundingSphere?.();
  }
  function drop(k) { const c = loaded.get(k); if (c.mesh) { group.remove(c.mesh); c.mesh.geometry.dispose(); } loaded.delete(k); }
  function update(x, z, budget = 2) {
    const want = npChunksAround(x, z, radius).sort((a, b) => a.ring - b.ring);
    const keep = new Set(want.map((w) => w.key));
    let changed = false;
    for (const k of [...loaded.keys()]) if (!keep.has(k)) { drop(k); changed = true; }
    let built = 0;
    for (const w of want) {
      if (loaded.has(w.key)) continue;
      if (built >= budget) break;
      const r = cwChunkGeometry(THREE, parish, w.cx, w.cz, { tier, grid, lights, crosswalks });
      let mesh = null;
      if (r.geometry) { mesh = new THREE.Mesh(r.geometry, mat); mesh.name = `cw-streets-${w.key}`; group.add(mesh); }
      loaded.set(w.key, { mesh, triangles: r.triangles, lights: r.lights });
      built++; changed = true;
    }
    if (changed) refreshLights();
    return built;
  }
  function setNight(on) { headMat.color.setHex(on ? 0xfff0b8 : 0x8a8f96); pools.visible = !!on; }
  function chunkStats() { return [...loaded.entries()].map(([key, c]) => ({ key, meshes: c.mesh ? 1 : 0, triangles: c.triangles, lights: c.lights.length })); }
  function stats() {
    let meshes = 0, triangles = 0;
    group.traverse((o) => { if (!o.isMesh) return; meshes++; const t = o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3; triangles += o.isInstancedMesh ? t * o.count : t; });
    return { chunks: loaded.size, meshes, triangles: Math.round(triangles), lights: poles.count, crosswalks: crosswalks.length };
  }
  return { update, setNight, stats, chunkStats, group, lights, crosswalks };
}
