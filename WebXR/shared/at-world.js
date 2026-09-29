// ATMOS's three.js half (console ATMOS, docs/consoles/ATMOS.md): lit windows, porch lamps and site lights at dusk as
// ONE instanced emissive mesh around the eye, fog banks that roll in over water (one instanced mesh of translucent
// sheets drifting with tfWind; none on the phone), a wet sheen with puddles on roads and sidewalks after rain (a shader
// tweak on the existing street materials — no new meshes), and the storm's darkening of sun, sky and fog.
//
// Seam:
//   atMountAtmos({ THREE, root, parish, tier, reduced, seed, massFilter, siteLights, wetMaterials, fogMaterial })
//     -> { update(x, z), set({ hour, weather }), animate(t, dt, x, z), counts(), lamps, fogBanks }
//   `siteLights` are [{ x, y, z }] (the site boards / buildings), `wetMaterials` the street and sidewalk materials to
//   sheen. Reduced motion: the fog sheets hold still (no drift) and there is no rain (tfMountRain already refuses).
//   atWetSurface(THREE, material) -> uniforms { uAtWet }   the puddle/sheen tweak, reusable by any world
//   atLampsForChunk(parish, cx, cz, { tier, seed, massFilter }) -> [{ x, y, z, yaw, w, h, kind }]   window, porch lamps
//   atNearness(parish, x, z) -> { water, arterial, port }   0..1 each (the engine's water, CITYWORKS' arterials, the port cover)
//
// Every top-level name is prefixed at/AT_; three.js comes from the caller.

import { npChunksAround, npWaterAt, npHeightAt, npMassingForChunk, npCoverAt, NP_SIZE, NP_MASS_RADIUS } from "./np-parish.js";
import { cwLines, cwSegmentGrid } from "./cw-cityworks.js";
import { tfWind } from "./tf-water.js";
import { AT_BUDGET, atLightsOn, atClamp, atRng, atHash } from "./at-atmos.js";

// Windows: which massing kinds are buildings, their footprint half-sizes (local x, z) and storeys.
const AT_BUILDINGS = {
  quarterBlock: { hx: 8, hz: 6, top: 7, storeys: 2, porch: false },
  gardenHouse: { hx: 6, hz: 5, top: 5.5, storeys: 1, porch: true },
  suburbHouse: { hx: 5, hz: 4.5, top: 4, storeys: 1, porch: true },
  tower: { hx: 11, hz: 11, top: null, storeys: 0, porch: false },
  campusBlock: { hx: 14, hz: 9, top: null, storeys: 0, porch: false },
};

/** One chunk's lit windows and porch lamps: a seeded fraction of each building's window slots, generic by kind. */
export function atLampsForChunk(parish, cx, cz, { tier = "high", seed = 1, massFilter = null } = {}) {
  const spots = npMassingForChunk(parish, cx, cz).filter((s) => AT_BUILDINGS[s.kind] && (!massFilter || massFilter(s)));
  const r = atRng(atHash(`${parish.id}|lamps|${cx},${cz}|${seed}`));
  const frac = AT_BUDGET.litFraction * (tier === "low" ? 0.5 : 1);
  const out = [];
  for (const s of spots) {
    const b = AT_BUILDINGS[s.kind];
    // np-world.js scales these kinds by (s, s, s), or by (s, h, s) for the unit-height tower and campus block.
    const hx = b.hx * s.s, hz = b.hz * s.s;
    const height = b.top === null ? s.h : b.top * s.s;
    const storeys = b.top === null ? Math.max(1, Math.min(12, Math.floor(s.h / 3.5))) : b.storeys;
    const c = Math.cos(s.rot), sn = Math.sin(s.rot);
    const place = (lx, ly, lz, yaw, w, h, kind) => out.push({ x: s.x + lx * c + lz * sn, y: s.y + ly, z: s.z - lx * sn + lz * c, yaw: s.rot + yaw, w, h, kind });
    // Four faces, window columns every ~4 m, one row per storey (towers every ~3.5 m, capped).
    for (const [face, yaw] of [[0, 0], [1, Math.PI / 2], [2, Math.PI], [3, -Math.PI / 2]]) {
      const half = face % 2 === 0 ? hx : hz, depth = (face % 2 === 0 ? hz : hx) + 0.06;
      const cols = Math.max(1, Math.min(8, Math.floor((half * 2) / 4)));
      for (let row = 0; row < storeys; row++) for (let col = 0; col < cols; col++) {
        if (r() > frac) continue;
        const along = -half + (half * 2) * (col + 0.5) / cols, y = Math.min(height - 1, 1.8 + row * 3.4);
        const lx = face === 0 ? along : face === 2 ? -along : face === 1 ? depth : -depth;
        const lz = face === 0 ? depth : face === 2 ? -depth : face === 1 ? -along : along;
        place(lx, y, lz, yaw, 1.1, 1.3, "window");
      }
    }
    if (b.porch && r() < 0.7) place(0, 2.3 * s.s, hz + 0.3, 0, 0.35, 0.35, "porch");
  }
  const cap = Math.ceil(AT_BUDGET.lamps[tier] / 9);
  return out.slice(0, cap);
}

/** How near (0..1) the eye is to water, an arterial and the port, sampled on two rings (cheap: ~17 lookups). */
const atGridCache = new WeakMap();
export function atNearness(parish, x, z) {
  let water = 0, port = 0;
  for (const [rad, wgt] of [[0, 1], [60, 0.8], [140, 0.45]]) {
    const n = rad ? 8 : 1;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2, px = x + Math.cos(a) * rad, pz = z + Math.sin(a) * rad;
      if (Math.abs(px) > NP_SIZE / 2 || Math.abs(pz) > NP_SIZE / 2) continue;
      if (npWaterAt(parish, px, pz)) water = Math.max(water, wgt);
      if (npCoverAt(parish, px, pz) === "port") port = Math.max(port, wgt);
    }
  }
  let grid = atGridCache.get(parish);
  if (!grid) { grid = cwSegmentGrid(cwLines(parish)); atGridCache.set(parish, grid); }
  let arterial = 0;
  for (const s of grid.query(x, z, 90)) {
    if (s.line.cls !== "arterial" && !s.line.named) continue;
    const ax = s.a[0], az = s.a[1], bx = s.b[0], bz = s.b[1], L2 = (bx - ax) ** 2 + (bz - az) ** 2 || 1;
    const t = atClamp(((x - ax) * (bx - ax) + (z - az) * (bz - az)) / L2);
    const d = Math.hypot(x - (ax + (bx - ax) * t), z - (az + (bz - az) * t));
    arterial = Math.max(arterial, atClamp(1 - d / 90));
  }
  return { water, arterial: Math.round(arterial * 1000) / 1000, port };
}


/** Wet roads: darker, a cool sheen, and seeded puddle patches by world position that read as standing water. */
export function atWetSurface(THREE, material) {
  const uniforms = { uAtWet: { value: 0 } };
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, r) => {
    prev?.call(material, shader, r);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vAtXZ;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvAtXZ = (modelMatrix * vec4(transformed, 1.0)).xz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vAtXZ;\nuniform float uAtWet;")
      .replace("#include <color_fragment>", "#include <color_fragment>\nif (uAtWet > 0.0) { float n = sin(vAtXZ.x * 0.31 + sin(vAtXZ.y * 0.17) * 2.0) * sin(vAtXZ.y * 0.27 + sin(vAtXZ.x * 0.13) * 2.0);\n  float puddle = smoothstep(0.55, 0.7, n) * uAtWet;\n  diffuseColor.rgb = mix(diffuseColor.rgb * (1.0 - 0.28 * uAtWet), vec3(0.36, 0.42, 0.5), puddle * 0.6); }")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.02, 0.025, 0.035) * uAtWet;");
  };
  const key = material.customProgramCacheKey?.bind(material);
  material.customProgramCacheKey = () => `${key ? key() : ""}|at-wet`;
  material.needsUpdate = true;
  material.userData.at = uniforms;
  return uniforms;
}

export function atMountAtmos({ THREE, root, parish, tier = "high", reduced = false, seed = 1, massFilter = null, siteLights = [], wetMaterials = [] } = {}) {
  const group = new THREE.Group(); group.name = "atmos"; root.add(group);
  const cap = AT_BUDGET.lamps[tier] ?? AT_BUDGET.lamps.high;
  // Lamps: a unit quad scaled per instance, coloured per kind, unlit (MeshBasic) so it glows; shown only when lamps are on.
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, fog: true });
  const lamps = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), lampMat, cap);
  lamps.name = "at-lamps"; lamps.count = 0; lamps.visible = false; lamps.frustumCulled = false; group.add(lamps);
  const colours = { window: new THREE.Color(0xffd48a), porch: new THREE.Color(0xfff0c0), site: new THREE.Color(0xe8f0ff) };
  // Fog banks: big low translucent sheets over nearby water, drifting downwind. None on the phone tier.
  const sheets = AT_BUDGET.fogSheets[tier] ?? 0;
  let fogBanks = null;
  const fogMat = new THREE.MeshBasicMaterial({ color: 0xdfe6ea, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false });
  if (sheets > 0) {
    fogBanks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), fogMat, sheets);
    fogBanks.name = "at-fog-banks"; fogBanks.count = 0; fogBanks.visible = false; fogBanks.frustumCulled = false; group.add(fogBanks);
  }
  const wetUniforms = wetMaterials.filter(Boolean).map((m) => atWetSurface(THREE, m));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), sc = new THREE.Vector3();
  let lastKey = null, lampList = [], fogSpots = [], state = { hour: 12, weather: null, on: false };

  function rebuildLamps(x, z) {
    const radius = NP_MASS_RADIUS[tier] ?? 1;
    lampList = [];
    for (const ch of npChunksAround(x, z, radius).sort((a, b) => a.ring - b.ring)) lampList.push(...atLampsForChunk(parish, ch.cx, ch.cz, { tier, seed, massFilter }));
    const sites = siteLights.filter((s) => Math.hypot(s.x - x, s.z - z) < 600).map((s) => ({ x: s.x, y: s.y + 6.5, z: s.z, yaw: 0, w: 1.4, h: 0.5, kind: "site" }));
    lampList = [...sites, ...lampList].slice(0, cap);
    lampList.forEach((l, i) => {
      q.setFromAxisAngle(up, l.yaw); m4.compose(v.set(l.x, l.y, l.z), q, sc.set(l.w, l.h, 1));
      lamps.setMatrixAt(i, m4); lamps.setColorAt(i, colours[l.kind] ?? colours.window);
    });
    lamps.count = lampList.length;
    lamps.instanceMatrix.needsUpdate = true; if (lamps.instanceColor) lamps.instanceColor.needsUpdate = true;
  }
  function rebuildFog(x, z) {
    fogSpots = [];
    if (!fogBanks) return;
    for (let k = 0; k < 64 && fogSpots.length < sheets; k++) {
      const a = k * 2.399963, rad = 80 + 34 * Math.sqrt(k) * 4; // a sunflower spiral out to ~1 km
      const px = x + Math.cos(a) * rad, pz = z + Math.sin(a) * rad;
      if (Math.abs(px) > NP_SIZE / 2 || Math.abs(pz) > NP_SIZE / 2 || !npWaterAt(parish, px, pz)) continue;
      fogSpots.push({ x: px, z: pz, y: npHeightAt(parish, px, pz) + 6 + (k % 3) * 3, s: 180 + (k % 4) * 60 });
    }
  }
  function update(x, z) {
    const key = `${Math.floor(x / 128)},${Math.floor(z / 128)}`;
    if (key === lastKey) return false;
    lastKey = key; rebuildLamps(x, z); rebuildFog(x, z); placeFog(0);
    return true;
  }
  function placeFog(t) {
    if (!fogBanks) return;
    const w = tfWind(reduced ? 0 : t, seed), drift = reduced ? 0 : (t * w.speed * 0.4) % 200;
    fogSpots.forEach((f, i) => {
      m4.compose(v.set(f.x + w.dir[0] * (drift - 100), f.y, f.z + w.dir[1] * (drift - 100)), q.identity(), sc.set(f.s, 1, f.s * 0.6));
      fogBanks.setMatrixAt(i, m4);
    });
    fogBanks.count = fogSpots.length; fogBanks.instanceMatrix.needsUpdate = true;
  }
  /** Set the hour and ATMOS weather: lamps on at dusk, fog banks by fog thickness, wet sheen by wetness. */
  function set({ hour = 12, weather = null } = {}) {
    state = { hour, weather, on: atLightsOn(hour) };
    lamps.visible = state.on && lamps.count > 0;
    const fog = weather?.fog ?? 0;
    fogMat.opacity = Math.min(0.55, fog * 0.5);
    if (fogBanks) fogBanks.visible = fog > 0.2 && fogBanks.count > 0;
    for (const u of wetUniforms) u.uAtWet.value = weather?.wet ?? 0;
    return state;
  }
  function animate(t) { if (fogBanks?.visible && !reduced) placeFog(t); }
  function counts() {
    return { meshes: group.children.length, lamps: lamps.count, lampsLit: lamps.visible ? lamps.count : 0, windows: lampList.filter((l) => l.kind === "window").length, porches: lampList.filter((l) => l.kind === "porch").length, sites: lampList.filter((l) => l.kind === "site").length, fogSheets: fogSpots.length, fogShown: !!fogBanks?.visible, wet: wetUniforms[0]?.uAtWet.value ?? 0, wetMaterials: wetUniforms.length, on: state.on };
  }
  return { root: group, update, set, animate, counts, lamps, fogBanks, wetUniforms };
}
