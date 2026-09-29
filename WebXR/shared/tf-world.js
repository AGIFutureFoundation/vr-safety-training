// TERRAFORM's three.js half (console TERRAFORM, docs/consoles/TERRAFORM.md): the parish's procedural streams and
// ditches as water ribbons, culvert ends where a road crosses, grass tufts, bushes and litter streamed per chunk as ONE
// merged mesh each (a per-vertex sway weight read by the wind shader), and every water surface animated by a cheap
// ripple that scrolls downstream. Under reduced motion the world holds still.
//
// Seams:
//   tfMountTerraform({ THREE, root, parish, tier, reduced, waters, trees }) -> { update(x, z, budget), animate(t, dt), counts(), litter() }
//   tfMountRain({ THREE, root, tier, reduced }) -> { set(on), animate(t, dt, x, y, z), count() }   streaks slanted by the wind
//   (tfAnimateWater, the reusable water ripple, lives in shared/tf-water.js; Redwood Reach mounts it on its river)
//
// Every top-level name is prefixed tf/TF_; three.js comes from the caller.

import { NP_CHUNK, npHeightAt, npChunksAround } from "./np-parish.js";
import { tfWind, tfMotion, tfAnimateWater, tfReducedMotion } from "./tf-water.js";
import { TF_BUDGET, tfStreams, tfCulverts, tfCoverForChunk, tfCoverTriangles, tfNearest, tfRoadKeep, TF_FLOW_SPEED } from "./tf-terraform.js";

/** A wind-swayed vertex-coloured material: vertices move downwind by their `tfSway` weight, the gust and a travelling wave. */
function tfSwayMaterial(THREE) {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const uniforms = { uTfTime: { value: 0 }, uTfWind: { value: new THREE.Vector2(1, 0) }, uTfGust: { value: 0 }, uTfSway: { value: 1 } };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float tfSway;\nuniform float uTfTime;\nuniform vec2 uTfWind;\nuniform float uTfGust;\nuniform float uTfSway;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n{ float wave = 0.6 + 0.4 * sin(uTfTime * 2.3 + position.x * 0.35 + position.z * 0.27);\n  transformed.xz += uTfWind * tfSway * uTfSway * (0.25 + 0.75 * uTfGust) * wave; }");
  };
  mat.customProgramCacheKey = () => "tf-sway";
  mat.userData.tf = uniforms;
  return mat;
}

/**
 * Sway an instanced tree material (np-world.js `world.treeMaterial`): the canopy leans downwind with height, the
 * trunk's foot stays put. The wind is turned into each instance's own frame so every tree leans the same way.
 */
export function tfSwayTrees(THREE, material) {
  const uniforms = { uTfTime: { value: 0 }, uTfWind: { value: new THREE.Vector2(1, 0) }, uTfGust: { value: 0 }, uTfSway: { value: 1 } };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTfTime;\nuniform vec2 uTfWind;\nuniform float uTfGust;\nuniform float uTfSway;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n#ifdef USE_INSTANCING\n{ mat3 m = mat3(instanceMatrix); float s2 = max(dot(m[0], m[0]), 1e-6);\n  vec3 wl = transpose(m) * vec3(uTfWind.x, 0.0, uTfWind.y) / s2;\n  float lean = max(0.0, position.y - 1.5) * 0.018 * uTfSway * (0.3 + 0.7 * uTfGust) * (0.7 + 0.3 * sin(uTfTime * 1.3 + instanceMatrix[3].x * 0.05 + instanceMatrix[3].z * 0.04));\n  transformed += wl * lean * sqrt(s2); }\n#endif");
  };
  material.customProgramCacheKey = () => "tf-trees";
  material.needsUpdate = true;
  material.userData.tf = uniforms;
  return uniforms;
}

/** The cover templates: [positions (x, y, z)...], colour, a sway weight per vertex (by height). */
function tfTemplates(THREE) {
  const take = (geo, colour, swayK, lift = 0) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const p = Array.from(g.attributes.position.array);
    let top = 0; for (let i = 1; i < p.length; i += 3) top = Math.max(top, p[i] + lift);
    const sway = []; for (let i = 1; i < p.length; i += 3) sway.push(swayK * Math.max(0, (p[i] + lift) / (top || 1)));
    for (let i = 1; i < p.length; i += 3) p[i] += lift;
    return { p, c: new THREE.Color(colour), sway };
  };
  // A tuft: three blades crossing (one triangle each), 1 m tall before scaling.
  const blade = [];
  for (let k = 0; k < 3; k++) { const a = (k * Math.PI) / 3, cx = Math.cos(a) * 0.2, cz = Math.sin(a) * 0.2; blade.push(-cx, 0, -cz, cx, 0, cz, cx * 0.3, 1, cz * 0.3); }
  const tuftGeo = new THREE.BufferGeometry(); tuftGeo.setAttribute("position", new THREE.Float32BufferAttribute(blade, 3));
  return {
    tuft: take(tuftGeo, 0x6f8f3a, 0.35),
    bush: take(new THREE.IcosahedronGeometry(0.8, 0).scale(1, 0.75, 1), 0x3f6a2e, 0.12, 0.55),
    can: take(new THREE.BoxGeometry(0.07, 0.12, 0.07), 0xc03a2b, 0, 0.06),
    bag: take(new THREE.IcosahedronGeometry(0.22, 0).scale(1, 0.7, 1), 0xe8e8e0, 0, 0.12),
    paper: take(new THREE.PlaneGeometry(0.25, 0.3).rotateX(-Math.PI / 2), 0xf4f1e6, 0, 0.02),
    tyre: take(new THREE.TorusGeometry(0.32, 0.11, 4, 8).rotateX(Math.PI / 2), 0x1e1e20, 0, 0.11),
  };
}

/** One chunk's cover as a single merged geometry (position, colour, tfSway), plus its counts. */
function tfCoverGeometry(THREE, T, cover) {
  const parts = [];
  for (const t of cover.tufts) parts.push([T.tuft, t.x, t.y, t.z, t.rot, 0.9, t.h, 0.9]);
  for (const b of cover.bushes) parts.push([T.bush, b.x, b.y, b.z, b.rot, b.s, b.s, b.s]);
  for (const l of cover.litter) parts.push([T[l.kind] ?? T.can, l.x, l.y, l.z, l.rot, 1, 1, 1]);
  const n = parts.reduce((s, [t]) => s + t.p.length / 3, 0);
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sway = new Float32Array(n);
  let o = 0;
  for (const [t, x, y, z, rot, sx, sy, sz] of parts) {
    const c = Math.cos(rot), s = Math.sin(rot), shade = 0.85 + ((x * 7.13 + z * 3.71) % 1 + 1) % 1 * 0.3;
    for (let i = 0; i < t.p.length; i += 3) {
      const lx = t.p[i] * sx, ly = t.p[i + 1] * sy, lz = t.p[i + 2] * sz;
      pos[o * 3] = x + lx * c - lz * s; pos[o * 3 + 1] = y + ly - 0.05; pos[o * 3 + 2] = z + lx * s + lz * c;
      col[o * 3] = t.c.r * shade; col[o * 3 + 1] = t.c.g * shade; col[o * 3 + 2] = t.c.b * shade;
      sway[o] = t.sway[i / 3] * sy;
      o++;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setAttribute("tfSway", new THREE.BufferAttribute(sway, 1));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/**
 * Mount TERRAFORM on a parish world. `waters` are the engine's water meshes (np-world.js `world.waters`), animated in
 * place. Returns { update(x, z, budget), animate(t, dt), counts(), litter(), streams, culverts, root }.
 */
export function tfMountTerraform({ THREE, root, parish, tier = "high", reduced = tfReducedMotion(), waters = [], trees = null, seed = 1 } = {}) {
  const group = new THREE.Group(); group.name = "tf-terraform"; root.add(group);
  const streams = tfStreams(parish), culverts = tfCulverts(parish);
  const waterUniforms = [];
  // The engine's water bodies: a ribbon scrolls downstream along its overall direction; a lake drifts with the wind.
  const w0 = tfWind(0, seed);
  for (const mesh of waters) {
    const id = String(mesh.name ?? "").replace(/^water-/, "");
    const w = (parish.water ?? []).find((x) => x.id === id);
    let flow = [w0.dir[0] * 0.04, w0.dir[1] * 0.04];
    if (w?.width && TF_FLOW_SPEED[w.kind] !== undefined && w.poly.length > 1) {
      const a = w.poly[0], b = w.poly[w.poly.length - 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      flow = [((b[0] - a[0]) / L) * TF_FLOW_SPEED[w.kind], ((b[1] - a[1]) / L) * TF_FLOW_SPEED[w.kind]];
    }
    if (mesh.material) waterUniforms.push(tfAnimateWater(THREE, mesh.material, { flow, reduced }));
  }
  // The streams and ditches: one merged ribbon at each channel's water line, a per-vertex downstream direction.
  let streamMesh = null;
  if (streams.length) {
    const pos = [], flow = [];
    for (const s of streams) {
      const pts = [];
      for (let i = 1; i < s.pts.length; i++) { const [ax, az] = s.pts[i - 1], [bx, bz] = s.pts[i]; for (let k = 0; k < 3; k++) pts.push([ax + (bx - ax) * k / 3, az + (bz - az) * k / 3]); }
      pts.push(s.pts[s.pts.length - 1]);
      let prev = null;
      for (let i = 0; i < pts.length; i++) {
        const [x, z] = pts[i], n = tfNearest(x, z, s.pts), hw = s.width / 2;
        const y = npHeightAt(parish, x, z) + s.water;
        const l = [x - n.dir[1] * hw, y, z + n.dir[0] * hw], r = [x + n.dir[1] * hw, y, z - n.dir[0] * hw];
        if (tfRoadKeep(s, x, z) < 0.5) { prev = null; continue; } // the culvert: no water drawn over the road
        if (prev) { pos.push(...prev.l, ...prev.r, ...l, ...l, ...prev.r, ...r); for (let k = 0; k < 6; k++) flow.push(n.dir[0] * s.speed, n.dir[1] * s.speed); }
        prev = { l, r };
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("tfFlow", new THREE.Float32BufferAttribute(flow, 2));
    g.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({ color: 0x4f7f86, emissive: 0x0a1a22, transparent: true, opacity: 0.88, side: THREE.DoubleSide });
    mat.defines = { TF_FLOW_ATTR: "" };
    waterUniforms.push(tfAnimateWater(THREE, mat, { reduced }));
    streamMesh = new THREE.Mesh(g, mat); streamMesh.name = "tf-streams"; group.add(streamMesh);
  }
  // Culvert ends: a short concrete pipe mouth each side of the road, instanced.
  const ends = [];
  for (const c of culverts) for (const side of [-1, 1]) {
    const x = c.x + c.dir[0] * side * (c.half + 1.4), z = c.z + c.dir[1] * side * (c.half + 1.4);
    ends.push({ x, z, y: npHeightAt(parish, x, z) + 0.2, yaw: Math.atan2(c.dir[0], c.dir[1]) });
  }
  const culvertMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.55, 0.55, 1.6, 8, 1, true).rotateX(Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x9a9690, side: THREE.DoubleSide }), Math.max(1, ends.length));
  { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
    ends.forEach((e, i) => { q.setFromAxisAngle(up, e.yaw); m4.compose(new THREE.Vector3(e.x, e.y, e.z), q, one); culvertMesh.setMatrixAt(i, m4); });
    if (!ends.length) { m4.makeScale(1e-4, 1e-4, 1e-4); culvertMesh.setMatrixAt(0, m4); } }
  culvertMesh.name = "tf-culverts"; group.add(culvertMesh);

  // Cover, streamed: one merged mesh per chunk inside the tier's radius.
  const T = tfTemplates(THREE), swayMat = tfSwayMaterial(THREE), radius = TF_BUDGET.radius[tier] ?? 1;
  const loaded = new Map();
  function build(ch) {
    const cover = tfCoverForChunk(parish, ch.cx, ch.cz, tier);
    const mesh = new THREE.Mesh(tfCoverGeometry(THREE, T, cover), swayMat);
    mesh.name = `tf-cover-${ch.key}`; mesh.frustumCulled = true; group.add(mesh);
    return { mesh, cover, tri: tfCoverTriangles(cover) };
  }
  function update(x, z, budget = 1) {
    const want = npChunksAround(x, z, radius);
    const keep = new Set(want.map((w) => w.key));
    for (const [k, c] of loaded) if (!keep.has(k)) { group.remove(c.mesh); c.mesh.geometry.dispose(); loaded.delete(k); }
    let built = 0;
    for (const w of want.sort((a, b) => a.ring - b.ring)) {
      if (loaded.has(w.key)) continue;
      if (built >= budget) break;
      loaded.set(w.key, build(w)); built++;
    }
    return built;
  }
  const treeUniforms = trees ? tfSwayTrees(THREE, trees) : null;
  function animate(t) {
    const m = tfMotion(reduced, t);
    const w = tfWind(m.t, seed);
    for (const u of [swayMat.userData.tf, treeUniforms]) {
      if (!u) continue;
      u.uTfTime.value = m.t; u.uTfWind.value.set(w.dir[0], w.dir[1]); u.uTfGust.value = w.gust; u.uTfSway.value = m.sway;
    }
    for (const wu of waterUniforms) wu.uTfTime.value = m.t * m.flow;
  }
  function counts() {
    let tufts = 0, bushes = 0, litter = 0, triangles = 0;
    for (const c of loaded.values()) { tufts += c.cover.tufts.length; bushes += c.cover.bushes.length; litter += c.cover.litter.length; triangles += c.tri; }
    return { chunks: loaded.size, meshes: loaded.size + 1 + (streamMesh ? 1 : 0), tufts, bushes, litter, triangles, streams: streams.length, culverts: culverts.length, reduced, perChunk: NP_CHUNK };
  }
  const litter = () => [...loaded.values()].flatMap((c) => c.cover.litter);
  animate(0);
  return { root: group, update, animate, counts, litter, streams, culverts, swayMaterial: swayMat, waterUniforms, treeUniforms };
}

/** Rain streaks per tier (one LineSegments mesh around the eye; none at all under reduced motion). */
export const TF_RAIN = { low: 250, balanced: 700, high: 1200, box: 50, fall: 11 };

/**
 * Rain that reads the wind: streaks fall through a box around the eye, slanted and carried downwind by tfWind. One
 * mesh, shown only while `set(true)` (a storm) and never under reduced motion (a still world has no rain).
 */
export function tfMountRain({ THREE, root, tier = "high", reduced = tfReducedMotion(), seed = 1 } = {}) {
  const n = TF_RAIN[tier] ?? TF_RAIN.high, B = TF_RAIN.box;
  const base = new Float32Array(n * 3);
  let a = 0x9e3779b9 ^ seed;
  const rnd = () => { a = (Math.imul(a ^ (a >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0; return a / 4294967296; };
  for (let i = 0; i < n; i++) { base[i * 3] = (rnd() - 0.5) * B; base[i * 3 + 1] = rnd() * B; base[i * 3 + 2] = (rnd() - 0.5) * B; }
  const pos = new Float32Array(n * 6);
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mesh = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xb8c8d8, transparent: true, opacity: 0.55 }));
  mesh.name = "tf-rain"; mesh.frustumCulled = false; mesh.visible = false; root.add(mesh);
  let on = false;
  return {
    mesh,
    set(v) { on = !!v && !reduced; mesh.visible = on; },
    count() { return on ? n : 0; },
    animate(t, dt, x, y, z) {
      if (!on) return;
      const w = tfWind(t, seed), drift = w.speed * 0.9, fall = TF_RAIN.fall;
      const sx = w.dir[0] * drift * 0.06, sz = w.dir[1] * drift * 0.06;
      for (let i = 0; i < n; i++) {
        const h = ((base[i * 3 + 1] - t * fall) % B + B) % B;
        const px = ((base[i * 3] + w.dir[0] * drift * t * 0.2) % B + B * 1.5) % B - B / 2, pz = ((base[i * 3 + 2] + w.dir[1] * drift * t * 0.2) % B + B * 1.5) % B - B / 2;
        const k = i * 6;
        pos[k] = x + px; pos[k + 1] = y - 8 + h; pos[k + 2] = z + pz;
        pos[k + 3] = x + px - sx * 6; pos[k + 4] = y - 8 + h + 0.7; pos[k + 5] = z + pz - sz * 6;
      }
      g.attributes.position.needsUpdate = true;
    },
  };
}
