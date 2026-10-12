// ENV-HD-4 — the robot sites at every hour and in fog and rain (console `hd4`, docs/consoles/ENV-HD-4.md).
// SmartCiti.X Powered by AGI Corp.
//
// Six looks for the robot sites' exteriors, applied through the parishes app's own clock and weather (ATMOS's time buckets and
// weather recipes, TERRAFORM's rain): dawn, day, dusk and night, fog at dawn and rain at dusk. Each look sets the hour band and
// the weather; the site lighting follows a stated policy (floodlights and dock lights on from dusk to dawn and in poor
// visibility), ROBO-EXTERIORS' lit-window mask glows by the same level, and in rain the yards and roofs darken with a cool sheen
// (an up-facing wet tint on the facade materials — a material tweak, no new texture). Fog density comes from ATMOS's atFog.
// Presets: every robot site's wide shot under each look (`window.__parishTest.scene(siteId, shot, look)`; the URL form
// `?scene=<siteId>:<shot>:<look>`; `__parishTest.hd4.lookPresets()` lists them).
//
// Budget (HD4_SITE_LIGHTS_BUDGET): the site lights are built on the desktop high tier only (not balanced, not the phone, not a
// headset browser): three merged meshes per map (the masts, the lamp faces, the light pools on the ground), no real lights
// outdoors and no texture. The phone and headset tiers build nothing here.
//
// SEAMS (every top-level name is hd4/HD4_-prefixed: the bundler shares one scope; three.js comes from the caller):
//   HD4_LOOKS / HD4_LOOK_IDS            plain data: look id -> { time (NP_TIMES), weather (NP_WEATHERS), label }
//   hd4LightLevel({ band, weather })   -> 0..1, the site lighting policy (dawn 0.6, day 0, dusk 0.85, night 1; 0.45 at least
//                                         in fog, rain or storm)
//   hd4LookPresets(parishes, sitesFor) -> [{ id: "<siteId>:wide:<look>", siteId, parish, shot, look, time, weather }]
//   hd4SiteLightSpots(layout)          -> { masts: [{ x, y, z, h }], docks: [{ x, y, z }], pools: [{ x, y, z, r }] } (pure, world)
//   hd4WetUp(THREE, material)          -> { uHd4Wet } (an up-facing wet tint patched into a lit material)
//   hd4MountSiteLights({ THREE, root, layouts, tier, ua, glow, wet }) -> { group, set({ band, weather }), counts(), dispose() }
//                                         glow = ROBO-EXTERIORS' atlas materials (their lit-window mask follows the level);
//                                         wet = the facade materials that take the wet tint

import { hd4Headset } from "./hd4-ultra.js";
import { AT_BOARD_READ } from "./at-atmos.js";

export const HD4_LOOKS = {
  dawn: { time: "dawn", weather: "clear", label: "Dawn" },
  day: { time: "day", weather: "clear", label: "Day" },
  dusk: { time: "dusk", weather: "clear", label: "Dusk" },
  night: { time: "night", weather: "clear", label: "Night" },
  fog: { time: "dawn", weather: "fog", label: "Fog at dawn", fogScale: 0.4 },
  rain: { time: "dusk", weather: "rain", label: "Rain at dusk", fogScale: 0.7 },
};
export const HD4_LOOK_IDS = Object.keys(HD4_LOOKS);
/** A look's scene fog: the page's (ATMOS's) linear fog, drawn in by the look's `fogScale` (a ground fog at the site), never
 *  nearer than ATMOS's floor of three board-read distances, so a site board stays legible. */
export function hd4LookFog(look, fog) {
  const s = HD4_LOOKS[look]?.fogScale ?? 1, floor = AT_BOARD_READ * 3;
  if (!fog || s === 1) return fog ? { near: fog.near, far: fog.far } : null;
  return { near: Math.round(fog.near * s * 100) / 100, far: Math.max(floor, Math.round(fog.far * s)) };
}
export const HD4_SITE_LIGHTS_BUDGET = { meshesPerMap: { low: 0, balanced: 0, high: 3 }, trianglesPerSite: { low: 0, balanced: 0, high: 1200 }, lights: 0, textureBytes: 0 };

const hd4R3 = (v) => Math.round(v * 1000) / 1000;
/** The site lighting policy: floodlights, dock lights and window glow by hour band, and on at least at 0.45 in poor visibility. */
export function hd4LightLevel({ band = "day", weather = null } = {}) {
  const base = { dawn: 0.6, day: 0, dusk: 0.85, night: 1 }[band] ?? 0;
  const murk = Math.max(weather?.fog ?? 0, (weather?.rain ?? 0) * 0.8, (weather?.storm ?? 0) * 0.9);
  return hd4R3(Math.max(base, murk > 0.5 ? 0.45 : 0));
}
/** Every robot site's wide shot under each look. `sitesFor(parish)` gives a map's robot sites (fxSitesFor). */
export function hd4LookPresets(parishes = [], sitesFor = () => []) {
  const out = [];
  for (const p of parishes) {
    let sites = [];
    try { sites = sitesFor(p) ?? []; } catch { sites = []; }
    for (const s of sites) for (const look of HD4_LOOK_IDS) out.push({ id: `${s.id}:wide:${look}`, siteId: s.id, parish: p.id, shot: "wide", look, time: HD4_LOOKS[look].time, weather: HD4_LOOKS[look].weather });
  }
  return out;
}

const hd4Rot = (yaw, lx, lz) => [lx * Math.cos(yaw) + lz * Math.sin(yaw), -lx * Math.sin(yaw) + lz * Math.cos(yaw)];
/** Where a site's floodlight masts, dock lamps and light pools stand, in world metres (the layout's building frame: +z faces
 *  the pad). Masts stand at the yard's front corners (clear of the door, the chargers and the bollards). */
export function hd4SiteLightSpots(l) {
  const at = (lx, ly, lz) => { const [rx, rz] = hd4Rot(l.yaw, lx, lz); return { x: l.x + rx, y: l.y + ly, z: l.z + rz }; };
  const spec = {
    fabHall: { masts: [[-17.5, 14.4], [17.5, 14.4]], h: 9, docks: [] },
    researchLab: { masts: [[-14.5, 14.4], [14.5, 14.4]], h: 9, docks: [] },
    distWarehouse: { masts: [[-22, 22.4], [22, 22.4]], h: 10, docks: [-16.5, -8.5, -0.5, 7.5] },
    portTower: { masts: [[-17.5, 5.5], [4, 3.0]], h: 12, docks: [] },
    constructionSite: { masts: [[-13, 10.2], [13.2, 10.2]], h: 9, docks: [] },
  }[l.kind] ?? { masts: [], h: 9, docks: [] };
  const D = (l.d ?? 20) / 2;
  const masts = spec.masts.map(([x, z]) => ({ ...at(x, 0, z), h: spec.h, lx: x, lz: z }));
  const docks = spec.docks.map((x) => ({ ...at(x + 2.1, 4.28, D + 0.38), lx: x }));
  // A pool on the ground in front of each mast (toward the lot's middle) and on the dock apron below each dock lamp.
  const pools = [...spec.masts.map(([x, z]) => ({ ...at(x * 0.62, 0.23, z * 0.8), r: 7.5 })), ...spec.docks.map((x) => ({ ...at(x, 0.24, D + 2.6), r: 2.4 }))];
  return { masts, docks, pools, h: spec.h };
}

/** An up-facing wet tint: roofs, yards and markings darken and take a faint cool sheen with `uHd4Wet` (0 dry .. 1 soaked).
 *  Walls (normals not facing up) are untouched. Dry (0), the shader takes the same path as before. */
export function hd4WetUp(THREE, material) {
  if (material?.userData?.hd4Wet) return material.userData.hd4Wet;
  const uniforms = { uHd4Wet: { value: 0 } };
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, r) => {
    prev?.call(material, shader, r);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vHd4Up;")
      .replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>\nvHd4Up = normalize(mat3(modelMatrix) * objectNormal).y;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vHd4Up;\nuniform float uHd4Wet;")
      .replace("#include <color_fragment>", "#include <color_fragment>\nif (uHd4Wet > 0.0) { diffuseColor.rgb *= 1.0 - 0.34 * uHd4Wet * smoothstep(0.6, 0.95, vHd4Up); }")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\nif (uHd4Wet > 0.0) { totalEmissiveRadiance += vec3(0.016, 0.022, 0.032) * uHd4Wet * smoothstep(0.6, 0.95, vHd4Up); }");
  };
  const key = material.customProgramCacheKey?.bind(material);
  material.customProgramCacheKey = () => `${key ? key() : ""}|hd4-wet`;
  material.needsUpdate = true;
  material.userData.hd4Wet = uniforms;
  return uniforms;
}

/** Mount the site lights for this map's robot sites (high tier, not a headset; elsewhere a stub that builds nothing). */
export function hd4MountSiteLights({ THREE, root, layouts = [], tier = "high", ua = typeof navigator !== "undefined" ? navigator.userAgent : "", glow = [], wet = [] } = {}) {
  let state = { band: "day", level: 0, wet: 0, lit: false };
  const builds = !!THREE && tier === "high" && !hd4Headset(ua) && layouts.length > 0;
  const glowMats = glow.filter(Boolean), wetU = builds ? wet.filter(Boolean).map((m) => hd4WetUp(THREE, m)) : [];
  if (!builds) {
    return { group: null, built: false, set: ({ band = "day", weather = null } = {}) => (state = { band, level: hd4LightLevel({ band, weather }), wet: weather?.wet ?? 0, lit: false }), counts: () => ({ built: false, tier, meshes: 0, triangles: 0, lights: 0, masts: 0, docks: 0, pools: 0, ...state }), dispose() {} };
  }
  const group = new THREE.Group(); group.name = "hd4-site-lights"; root?.add(group);
  const body = { pos: [], col: [] }, lens = { pos: [], col: [] }, pool = { pos: [], col: [] };
  const c = new THREE.Color();
  const put = (bag, geo, colour, m) => {
    const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(m); c.set(colour);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { bag.pos.push(p.getX(i), p.getY(i), p.getZ(i)); bag.col.push(c.r, c.g, c.b); }
    g.dispose(); if (g !== geo) geo.dispose();
  };
  const M = (x, y, z, yaw = 0) => new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  let masts = 0, docks = 0, pools = 0;
  for (const l of layouts) {
    const sp = hd4SiteLightSpots(l);
    for (const m of sp.masts) {
      masts++;
      put(body, new THREE.BoxGeometry(0.24, m.h, 0.24), 0x5b6168, M(m.x, m.y + m.h / 2, m.z, l.yaw));
      put(body, new THREE.BoxGeometry(0.5, 0.5, 0.5), 0x4a4f55, M(m.x, m.y + 0.25, m.z, l.yaw)); // the base
      put(body, new THREE.BoxGeometry(1.9, 0.12, 0.12), 0x5b6168, M(m.x, m.y + m.h, m.z, l.yaw)); // the crossarm
      for (const s of [-0.65, 0.65]) {
        const [ox, oz] = hd4Rot(l.yaw, s, 0);
        put(body, new THREE.BoxGeometry(0.62, 0.26, 0.44), 0x3b4046, M(m.x + ox, m.y + m.h - 0.2, m.z + oz, l.yaw)); // a flood head
        put(lens, new THREE.BoxGeometry(0.54, 0.04, 0.36), 0xfff1d6, M(m.x + ox, m.y + m.h - 0.35, m.z + oz, l.yaw)); // its lens
      }
    }
    for (const d of sp.docks) { docks++; put(lens, new THREE.BoxGeometry(0.22, 0.04, 0.26), 0xffd27a, M(d.x, d.y, d.z, l.yaw)); }
    for (const p of sp.pools) {
      pools++;
      const n = 20, warm = p.r > 4 ? [0.5, 0.45, 0.34] : [0.55, 0.42, 0.2];
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
        pool.pos.push(p.x, p.y, p.z, p.x + Math.cos(a1) * p.r, p.y, p.z + Math.sin(a1) * p.r, p.x + Math.cos(a0) * p.r, p.y, p.z + Math.sin(a0) * p.r);
        pool.col.push(...warm, 0, 0, 0, 0, 0, 0);
      }
    }
  }
  const geoOf = (bag) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(bag.pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(bag.col, 3)); g.computeVertexNormals(); return g; };
  const mastMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  wetU.push(hd4WetUp(THREE, mastMat));
  const lensMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  const poolMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const meshes = [[body, mastMat, "hd4-site-masts"], [lens, lensMat, "hd4-site-lamps"], [pool, poolMat, "hd4-site-pools"]].map(([bag, mat, name]) => {
    const mesh = new THREE.Mesh(geoOf(bag), mat); mesh.name = name; group.add(mesh); return mesh;
  });
  const [, lensMesh, poolMesh] = meshes;
  poolMesh.renderOrder = 2; poolMesh.visible = false;
  const triangles = Math.round((body.pos.length + lens.pos.length + pool.pos.length) / 9);
  function set({ band = "day", weather = null } = {}) {
    const level = hd4LightLevel({ band, weather }), wetV = hd4R3(weather?.wet ?? 0);
    lensMat.color.setScalar(level > 0 ? 0.55 + 0.45 * level : 0.32);
    poolMat.color.setScalar(level * (1 + 0.55 * wetV));
    poolMesh.visible = level > 0;
    for (const m of glowMats) { if (!m?.emissive) continue; m.emissive.setHex(level > 0 ? 0xffcf8a : 0x000000); m.emissiveIntensity = level > 0 ? 0.3 + 0.65 * level : 1; }
    for (const u of wetU) u.uHd4Wet.value = wetV;
    state = { band, level, wet: wetV, lit: level > 0 };
    return state;
  }
  return {
    group, built: true, set, meshes: lensMesh ? meshes : [],
    counts: () => ({ built: true, tier, meshes: meshes.length, triangles, lights: 0, masts, docks, pools, perSite: Math.round(triangles / Math.max(1, layouts.length)), ...state }),
    dispose() { for (const m of meshes) { m.geometry.dispose(); m.material.dispose(); } root?.remove(group); },
  };
}
