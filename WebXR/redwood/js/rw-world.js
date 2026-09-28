// Redwood Reach — the three.js scene: streamed terrain chunks, instanced
// forest per chunk, a coarse horizon mesh for the land beyond the ring, the
// river and the sea, fire roads, the work sites, the field tins, the shared
// sky and wildlife. Everything pure (heights, sites, quests) lives in
// rw-data.js; this file only turns it into meshes.
//
// Top-level names are prefixed rw…/RW_… for the bundler.

import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { buildSky } from "../../shared/sky.js";
import { buildWildlife } from "../../shared/wildlife.js";
import { weatherFor } from "../../shared/weather.js";
import {
  RW_BOUNDS, RW_CHUNK, RW_CHUNKS, RW_BUDGET, RW_SITES, RW_ROADS, RW_TRAILS, RW_RIVER, RW_POWER_LINE,
  rwHeightAt, rwBiomeAt, rwIsWater, rwNoise, rwRiverNearest, rwRiverY, rwRiverHalfWidth, rwPolylineDistance, rwCoastZ,
} from "./rw-data.js";
import { RW_EGGS } from "./rw-lore-data.js";

const RW_GROUND = { redwood: [0x3d4a26, 0x55602f], mixed: [0x4d5a2c, 0x6a6a38], open: [0x8a8a4a, 0xa89a5c], marsh: [0x6f7a44, 0x8a8a52], water: [0x3a4a3a, 0x3a4a3a] };

/** Colour one vertex: biome base, darker on steep ground, sand at the sea. */
function rwGroundColor(x, z, h, slope, out) {
  const biome = rwBiomeAt(x, z, h);
  const [a, b] = RW_GROUND[biome] ?? RW_GROUND.mixed;
  const n = rwNoise(x / 37, z / 37);
  const c = new THREE.Color(a).lerp(new THREE.Color(b), n);
  if (slope > 0.55) c.lerp(new THREE.Color(0x6a5a48), Math.min(1, (slope - 0.55) * 2));
  if (h < 3) c.lerp(new THREE.Color(0xc8b88a), 0.7);
  out.push(c.r, c.g, c.b);
}

/** A merged, vertex-coloured geometry from [geometry, colour, y offset] parts. */
function rwMerge(parts) {
  const pos = [], nor = [], col = [];
  for (const [g0, hex, dy] of parts) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    g.translate(0, dy, 0);
    const c = new THREE.Color(hex);
    const p = g.attributes.position.array, n = g.attributes.normal.array;
    for (let i = 0; i < p.length; i += 3) { pos.push(p[i], p[i + 1], p[i + 2]); nor.push(n[i], n[i + 1], n[i + 2]); col.push(c.r, c.g, c.b); }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return out;
}

/** The three tree kinds, one merged geometry each, unit scale (height ~1). */
function rwTreeGeometries() {
  return {
    // A coast redwood: a tall straight trunk and a narrow crown high up.
    redwood: rwMerge([
      [new THREE.CylinderGeometry(0.018, 0.04, 0.62, 6), 0x7a3b25, 0.31],
      [new THREE.ConeGeometry(0.09, 0.55, 7), 0x2c4a22, 0.7],
      [new THREE.ConeGeometry(0.11, 0.3, 7), 0x264420, 0.5],
    ]),
    // A fir-like conifer of the mixed forest.
    fir: rwMerge([
      [new THREE.CylinderGeometry(0.02, 0.035, 0.3, 5), 0x5a3a24, 0.15],
      [new THREE.ConeGeometry(0.16, 0.5, 7), 0x33552a, 0.45],
      [new THREE.ConeGeometry(0.12, 0.35, 7), 0x3a5e2e, 0.72],
    ]),
    // A broadleaf: short trunk, round crown.
    oak: rwMerge([
      [new THREE.CylinderGeometry(0.04, 0.06, 0.4, 5), 0x5a4630, 0.2],
      [new THREE.IcosahedronGeometry(0.3, 0), 0x5a7a34, 0.62],
    ]),
  };
}

/** A trunk's collision radius at the ground (matches the drawn cylinder's base). */
export function rwTrunkRadius(t) { return t.s * (t.kind === "redwood" ? 0.04 : t.kind === "fir" ? 0.035 : 0.06); }

/** The deterministic tree layout for one chunk: [{ kind, x, z, s, r }]. Pure except for rwHeightAt. */
export function rwChunkTrees(cx, cz, cap) {
  const x0 = RW_BOUNDS.minX + cx * RW_CHUNK, z0 = RW_BOUNDS.minZ + cz * RW_CHUNK;
  const out = [];
  const step = 12;
  for (let gz = 0; gz < RW_CHUNK / step && out.length < cap; gz += 1) {
    for (let gx = 0; gx < RW_CHUNK / step && out.length < cap; gx += 1) {
      const j = rwNoise(cx * 97 + gx * 3.1, cz * 89 + gz * 2.7);
      const k = rwNoise(cx * 53 + gx * 1.7 + 11, cz * 61 + gz * 1.3 + 5);
      const x = x0 + (gx + j) * step, z = z0 + (gz + k) * step;
      const h = rwHeightAt(x, z);
      const biome = rwBiomeAt(x, z, h);
      if (biome === "water" || biome === "open" || biome === "marsh") continue;
      const density = biome === "redwood" ? 0.5 : 0.36;
      if (rwNoise(x / 9 + 3, z / 9 - 7) > density + 0.25) continue;
      // Clear the roads, the trails and the site yards.
      let clear = false;
      for (const r of RW_ROADS) if (rwPolylineDistance(r.points, x, z) < 9) { clear = true; break; }
      if (clear) continue;
      for (const t of RW_TRAILS) if (rwPolylineDistance(t.points, x, z) < 4) { clear = true; break; }
      if (clear) continue;
      for (const s of RW_SITES) if (Math.hypot(x - s.position[0], z - s.position[1]) < s.pad + 6) { clear = true; break; }
      if (clear) continue;
      const kind = biome === "redwood" ? (j > 0.82 ? "oak" : "redwood") : (k > 0.7 ? "oak" : "fir");
      const s = kind === "redwood" ? 38 + 30 * k : kind === "fir" ? 18 + 14 * j : 9 + 6 * j;
      out.push({ kind, x, z, y: h - 0.4, s, r: j * 6.28 });
    }
  }
  return out;
}

export function rwBuildWorld(scene, opts = {}) {
  const tierName = opts.tier ?? "high";
  const budget = RW_BUDGET[tierName] ?? RW_BUDGET.high;
  const root = new THREE.Group();
  root.name = "redwood";
  scene.add(root);

  // ------------------------------------------------------------ light, sky
  const hemi = new THREE.HemisphereLight(0xdcefff, 0x2a3218, 0.9);
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.0);
  sun.position.set(300, 500, 200);
  root.add(hemi, sun);
  const weather = weatherFor(opts.weather ?? "clear");
  const sky = buildSky(root, { time: opts.time ?? "day", weather, radius: Math.min(900, budget.fog * 0.95) });
  scene.background = new THREE.Color(sky.recipe.sky);
  scene.fog = new THREE.Fog(sky.recipe.fog, budget.fog * 0.25, budget.fog);

  const groundMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const treeMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const trees = rwTreeGeometries();
  // Understory geometry: a fern clump (a flattened, splayed cone) and a fallen log.
  const fernGeo = new THREE.ConeGeometry(0.9, 0.9, 6, 1, true); fernGeo.translate(0, 0.35, 0);
  const fernMat = new THREE.MeshLambertMaterial({ color: 0x3f6a2a, side: THREE.DoubleSide });
  const logGeo = new THREE.CylinderGeometry(0.6, 0.7, 14, 7); logGeo.rotateZ(Math.PI / 2);
  const logMat = new THREE.MeshLambertMaterial({ color: 0x5a3a26 });
  const blockedRoads = (x, z) => RW_ROADS.some((r) => rwPolylineDistance(r.points, x, z) < 6) || RW_TRAILS.some((t) => rwPolylineDistance(t.points, x, z) < 2.5)
    || RW_SITES.some((st) => Math.hypot(x - st.position[0], z - st.position[1]) < st.pad);

  // --------------------------------------------------------- horizon mesh
  // The whole field at a coarse grid, a few metres low, so the land beyond
  // the streamed ring still reads as ridges under the fog.
  {
    const n = budget.horizon, pos = [], col = [], idx = [];
    for (let j = 0; j <= n; j += 1) for (let i = 0; i <= n; i += 1) {
      const x = RW_BOUNDS.minX + (i / n) * (RW_BOUNDS.maxX - RW_BOUNDS.minX), z = RW_BOUNDS.minZ + (j / n) * (RW_BOUNDS.maxZ - RW_BOUNDS.minZ);
      const h = rwHeightAt(x, z);
      pos.push(x, h - 6, z);
      const c = new THREE.Color(rwIsWater(x, z) ? 0x2a4a50 : h > 300 ? 0x4a5236 : 0x2e4222);
      col.push(c.r, c.g, c.b);
    }
    for (let j = 0; j < n; j += 1) for (let i = 0; i < n; i += 1) { const a = j * (n + 1) + i; idx.push(a, a + n + 1, a + 1, a + 1, a + n + 1, a + n + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, groundMat);
    m.name = "rw-horizon";
    root.add(m);
  }

  // ------------------------------------------------------------ the sea
  const seaMat = new THREE.MeshLambertMaterial({ color: 0x2f6f86, transparent: true, opacity: 0.88 });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(RW_BOUNDS.maxX - RW_BOUNDS.minX + 2000, 900), seaMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(0, 0.2, rwCoastZ(0) + 480);
  root.add(sea);

  // ------------------------------------------------------------ the river
  {
    const pos = [], idx = [];
    const samples = 240;
    const pts = [];
    for (let i = 1; i < RW_RIVER.length; i += 1) {
      const [ax, az] = RW_RIVER[i - 1], [bx, bz] = RW_RIVER[i];
      const n = Math.ceil(Math.hypot(bx - ax, bz - az) / (4096 / samples));
      for (let k = 0; k < n; k += 1) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
    }
    pts.push(RW_RIVER[RW_RIVER.length - 1]);
    for (let i = 0; i < pts.length; i += 1) {
      const [x, z] = pts[i];
      const [nx, nz] = pts[Math.min(pts.length - 1, i + 1)], [px, pz] = pts[Math.max(0, i - 1)];
      let dx = nx - px, dz = nz - pz; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      const { t } = rwRiverNearest(x, z);
      const y = rwRiverY(t), w = rwRiverHalfWidth(t) + 3;
      pos.push(x - dz * w, y, z + dx * w, x + dz * w, y, z - dx * w);
      if (i > 0) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const river = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0x3f7f8f, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
    river.name = "rw-river";
    root.add(river);
  }

  // ---------------------------------------------------- roads and trails
  function ribbon(points, width, color, lift, step = 6) {
    const pos = [], idx = [];
    const pts = [];
    for (let i = 1; i < points.length; i += 1) {
      const [ax, az] = points[i - 1], [bx, bz] = points[i];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step));
      for (let k = 0; k < n; k += 1) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
    }
    pts.push(points[points.length - 1]);
    for (let i = 0; i < pts.length; i += 1) {
      const [x, z] = pts[i];
      const [nx, nz] = pts[Math.min(pts.length - 1, i + 1)], [px, pz] = pts[Math.max(0, i - 1)];
      let dx = nx - px, dz = nz - pz; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      const lx = x - dz * width, lz = z + dx * width, rx = x + dz * width, rz = z - dx * width;
      pos.push(lx, Math.max(rwHeightAt(lx, lz), rwHeightAt(x, z)) + lift, lz, rx, Math.max(rwHeightAt(rx, rz), rwHeightAt(x, z)) + lift, rz);
      if (i > 0) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    root.add(m);
    return m;
  }
  for (const r of RW_ROADS) ribbon(r.points, 3.2, 0x9a8866, 0.3);
  for (const t of RW_TRAILS) ribbon(t.points, 0.9, 0x7a6448, 0.2, 4);

  // --------------------------------------------------- the power line
  {
    const towerMat = new THREE.MeshLambertMaterial({ color: 0x8a9098 });
    const pts = [];
    for (let i = 1; i < RW_POWER_LINE.length; i += 1) {
      const [ax, az] = RW_POWER_LINE[i - 1], [bx, bz] = RW_POWER_LINE[i];
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 160));
      for (let k = 0; k < n; k += 1) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
    }
    pts.push(RW_POWER_LINE[RW_POWER_LINE.length - 1]);
    const tg = new THREE.CylinderGeometry(0.6, 1.8, 30, 4);
    const tower = new THREE.InstancedMesh(tg, towerMat, pts.length);
    const m4 = new THREE.Matrix4();
    const wire = [];
    pts.forEach(([x, z], i) => {
      const y = rwHeightAt(x, z);
      m4.makeTranslation(x, y + 15, z); tower.setMatrixAt(i, m4);
      wire.push(new THREE.Vector3(x, y + 29, z));
    });
    root.add(tower);
    const wg = new THREE.BufferGeometry().setFromPoints(wire);
    root.add(new THREE.Line(wg, new THREE.LineBasicMaterial({ color: 0x222222 })));
  }

  // --------------------------------------------------------- the sites
  const siteGroups = [];
  const labelCache = new Map();
  function label(text, color = "#fff6d8") {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 96;
    const g = c.getContext("2d");
    if (g) {
      g.fillStyle = "rgba(20,28,16,0.82)"; g.fillRect(0, 0, 512, 96);
      g.strokeStyle = "#e0a040"; g.lineWidth = 4; g.strokeRect(2, 2, 508, 92);
      g.fillStyle = color; g.font = "600 40px Barlow, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(text, 256, 50);
    }
    const tex = new THREE.CanvasTexture(c);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, fog: false }));
    sp.scale.set(16, 3, 1);
    labelCache.set(text, sp);
    return sp;
  }
  const M = (hex) => new THREE.MeshLambertMaterial({ color: hex });
  const mats = { wood: M(0x8a5a36), red: M(0xb8322a), roof: M(0x4a4a44), steel: M(0x9aa0a6), glass: new THREE.MeshLambertMaterial({ color: 0xcfe8f0, transparent: true, opacity: 0.55 }),
    yellow: M(0xe0b020), green: M(0x3a6a3a), tent: M(0xd08a3a), log: M(0x6a4028), gravel: M(0x9a9282), board: M(0x3a2a1a), white: M(0xe8e4d8) };
  function box(g, w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y + h / 2, z); g.add(m); return m; }
  function cyl(g, r, h, mat, x, y, z, rotZ = 0) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), mat); m.position.set(x, y, z); m.rotation.z = rotZ; g.add(m); return m; }
  function dress(s, g) {
    switch (s.kind) {
      case "fire-station":
        box(g, 26, 8, 14, mats.red, 0, 0, 0); box(g, 28, 1, 16, mats.roof, 0, 8, 0);
        box(g, 8, 3, 3.4, mats.red, 10, 0, 14); box(g, 3, 18, 3, mats.steel, -16, 0, 6);
        box(g, 20, 0.2, 20, mats.gravel, 18, 0, 26); break;
      case "lookout":
        for (const [a, b] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) box(g, 0.5, 14, 0.5, mats.steel, a, 0, b);
        box(g, 8, 3.2, 8, mats.glass, 0, 14, 0); box(g, 9, 0.6, 9, mats.roof, 0, 17.2, 0); box(g, 9, 0.4, 9, mats.wood, 0, 13.8, 0); break;
      case "sawmill":
        box(g, 60, 12, 22, mats.roof, 0, 0, 0); box(g, 30, 7, 14, mats.wood, 44, 0, 10);
        for (let i = 0; i < 6; i += 1) for (let k = 0; k < 3; k += 1) cyl(g, 0.7, 14, mats.log, -40 + k * 1.5, 0.7 + i * 1.3 * 0 + k * 1.2, -30 + i * 4, Math.PI / 2);
        box(g, 30, 1.2, 2, mats.steel, 0, 3, 16); box(g, 6, 3.4, 4, mats.yellow, 30, 0, -26); break;
      case "restoration":
        for (let i = 0; i < 5; i += 1) cyl(g, 0.5, 10, mats.log, -60 + i * 6, -1, -60 + i * 4, Math.PI / 2.3);
        box(g, 6, 2.5, 3, mats.white, 0, 0, 0); box(g, 3, 1.4, 5, mats.yellow, 8, 0, 4);
        for (let i = 0; i < 10; i += 1) box(g, 0.15, 1.2, 0.15, mats.green, -12 + i * 2.4, 0, 12); break;
      case "campground":
        for (let i = 0; i < 6; i += 1) { const t = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.2, 4), mats.tent); t.position.set(-30 + i * 11, 1.1, -12 + (i % 2) * 20); g.add(t); box(g, 2.4, 0.8, 1.2, mats.wood, -27 + i * 11, 0, -8 + (i % 2) * 20); }
        box(g, 4, 3, 0.4, mats.board, 30, 0, 10); box(g, 8, 3.5, 5, mats.wood, 34, 0, -24); break;
      case "nursery":
        for (let i = 0; i < 3; i += 1) box(g, 10, 4, 30, mats.glass, -20 + i * 14, 0, 0);
        box(g, 12, 5, 10, mats.white, 30, 0, -20); box(g, 8, 4, 8, mats.wood, 30, 0, 18); break;
      case "substation":
        box(g, 50, 0.2, 40, mats.gravel, 0, 0, 0);
        for (let i = 0; i < 4; i += 1) box(g, 4, 4, 3, mats.steel, -15 + i * 10, 0, 0);
        for (const [x, z, w, d] of [[0, -20, 50, 0.2], [0, 20, 50, 0.2], [-25, 0, 0.2, 40], [25, 0, 0.2, 40]]) box(g, w, 2.4, d, mats.steel, x, 0, z);
        box(g, 0.6, 14, 0.6, mats.wood, -10, 0, 10); box(g, 0.6, 14, 0.6, mats.wood, 10, 0, 10); break;
      case "estuary":
        box(g, 3, 0.4, 60, mats.wood, 0, 0.6, 20); box(g, 10, 4, 8, mats.white, 0, 0, -12);
        for (let i = 0; i < 8; i += 1) box(g, 0.2, 1.4, 0.2, mats.yellow, -10 + i * 3, 0, 30 + (i % 2) * 4); break;
      case "equipment-yard":
        box(g, 40, 0.2, 30, mats.gravel, 0, 0, 0); box(g, 7, 3.2, 3.5, mats.yellow, -10, 0, 0); box(g, 9, 2.6, 2.6, mats.yellow, 4, 0, 6);
        box(g, 6, 3, 3, mats.yellow, 14, 0, -6); box(g, 18, 6, 10, mats.roof, 0, 0, -18); cyl(g, 3, 6, mats.green, 18, 3, 12); break;
      case "trail-camp":
        for (let i = 0; i < 3; i += 1) { const t = new THREE.Mesh(new THREE.ConeGeometry(2, 2.4, 4), mats.green); t.position.set(-8 + i * 7, 1.2, -6); g.add(t); }
        box(g, 4, 2, 2, mats.board, 8, 0, 6); box(g, 3, 1.8, 0.3, mats.board, -6, 0, 8); break;
      case "grove":
        box(g, 2, 0.3, 30, mats.wood, 0, 0.4, 0); box(g, 3, 0.8, 0.8, mats.wood, 4, 0, 6);
        cyl(g, 3.2, 60, mats.log, -20, 30, 12); cyl(g, 2.8, 54, mats.log, 16, 27, -14); cyl(g, 1.8, 40, mats.log, -40, 0.6, -30, Math.PI / 2); break;
      default: box(g, 6, 3, 6, mats.wood, 0, 0, 0);
    }
    // The job board: a post and a sign, always at the yard's north edge.
    box(g, 0.25, 2.2, 0.25, mats.wood, -2, 0, -s.pad * 0.5); box(g, 0.25, 2.2, 0.25, mats.wood, 2, 0, -s.pad * 0.5);
    box(g, 4.6, 2.2, 0.2, mats.board, 0, 1.4, -s.pad * 0.5);
  }
  for (const s of RW_SITES) {
    const g = new THREE.Group();
    g.position.set(s.position[0], s.padY, s.position[1]);
    g.name = `rw-site-${s.id}`;
    dress(s, g);
    const lb = label(s.name);
    lb.position.set(0, s.kind === "lookout" ? 24 : 16, 0);
    g.add(lb);
    g.visible = false;
    root.add(g);
    siteGroups.push({ site: s, group: g });
  }

  // ------------------------------------------------------ the field tins
  const tinGeo = new THREE.BoxGeometry(0.5, 0.35, 0.35);
  const tinMat = new THREE.MeshLambertMaterial({ color: 0x3a9a8a, emissive: 0x1a5a50 });
  const tinMeshes = new Map();
  for (const e of RW_EGGS) {
    const m = new THREE.Mesh(tinGeo, tinMat);
    const [x, z] = e.position;
    m.position.set(x, rwHeightAt(x, z) + 0.9, z);
    m.visible = false;
    m.userData.egg = e.id;
    root.add(m);
    tinMeshes.set(e.id, m);
  }

  // ---------------------------------------------------------- wildlife
  const est = RW_SITES.find((s) => s.id === "estuary").position;
  const wild = [
    buildWildlife(root, { zone: { x: est[0], z: est[1] + 60, w: 160, d: 100, y: 0.3 }, kind: "shorebirds" }),
    buildWildlife(root, { zone: { x: est[0] + 200, z: est[1] + 220, w: 260, d: 140, y: 12 }, kind: "pelicans" }),
    buildWildlife(root, { zone: { x: -600, z: 1950, w: 400, d: 120, y: 18 }, kind: "gulls" }),
    buildWildlife(root, { zone: { x: -1500, z: 1920, w: 200, d: 80, y: 0.2 }, kind: "seals" }),
  ];

  // --------------------------------------------------------- chunk ring
  const chunks = new Map();
  const queue = [];
  function buildChunk(cx, cz) {
    const seg = budget.segments;
    const x0 = RW_BOUNDS.minX + cx * RW_CHUNK, z0 = RW_BOUNDS.minZ + cz * RW_CHUNK;
    const pos = [], nor = [], col = [], idx = [];
    const e = 1.5;
    for (let j = 0; j <= seg; j += 1) for (let i = 0; i <= seg; i += 1) {
      const x = x0 + (i / seg) * RW_CHUNK, z = z0 + (j / seg) * RW_CHUNK;
      const h = rwHeightAt(x, z);
      const hx = rwHeightAt(x + e, z) - rwHeightAt(x - e, z), hz = rwHeightAt(x, z + e) - rwHeightAt(x, z - e);
      const n = new THREE.Vector3(-hx, 2 * e, -hz).normalize();
      pos.push(x, h, z); nor.push(n.x, n.y, n.z);
      rwGroundColor(x, z, h, 1 - n.y, col);
    }
    for (let j = 0; j < seg; j += 1) for (let i = 0; i < seg; i += 1) { const a = j * (seg + 1) + i; idx.push(a, a + seg + 1, a + 1, a + 1, a + seg + 1, a + seg + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    const ground = new THREE.Mesh(g, groundMat);
    ground.name = `rw-chunk-${cx}-${cz}`;
    const group = new THREE.Group();
    group.add(ground);
    const layout = layoutFor(cx, cz);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), sc = new THREE.Vector3();
    let instances = 0;
    for (const kind of ["redwood", "fir", "oak"]) {
      const list = layout.filter((t) => t.kind === kind);
      if (!list.length) continue;
      const im = new THREE.InstancedMesh(trees[kind], treeMat, list.length);
      list.forEach((t, i) => { q.setFromAxisAngle(up, t.r); v.set(t.x, t.y, t.z); sc.set(t.s, t.s, t.s); m4.compose(v, q, sc); im.setMatrixAt(i, m4); });
      im.computeBoundingSphere();
      group.add(im);
      instances += list.length;
    }
    // The understory: sword-fern clumps under the redwoods and the odd
    // fallen log, one instanced mesh each, from the same seeded noise.
    const ferns = [], logs = [];
    const fstep = budget.segments >= 32 ? 9 : 14;
    for (let gz = 0; gz < RW_CHUNK / fstep; gz += 1) for (let gx = 0; gx < RW_CHUNK / fstep; gx += 1) {
      const fx = x0 + (gx + rwNoise(cx * 31 + gx * 1.9, cz * 29 + gz * 2.3)) * fstep, fz = z0 + (gz + rwNoise(cx * 17 + gx * 2.9 + 3, cz * 13 + gz * 1.1)) * fstep;
      const fh = rwHeightAt(fx, fz);
      if (rwBiomeAt(fx, fz, fh) !== "redwood" || blockedRoads(fx, fz)) continue;
      const n = rwNoise(fx / 5, fz / 5);
      if (n > 0.62 && logs.length < 6 && rwNoise(fx / 3 + 9, fz / 3) > 0.7) logs.push([fx, fh, fz, n]);
      else if (n > 0.3) ferns.push([fx, fh, fz, n]);
    }
    for (const [list, geo, mat] of [[ferns, fernGeo, fernMat], [logs, logGeo, logMat]]) {
      if (!list.length) continue;
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach(([fx, fh, fz, n], i) => {
        q.setFromAxisAngle(up, n * 20); v.set(fx, fh + (geo === logGeo ? 0.6 : 0), fz);
        const k = geo === logGeo ? 1 : 0.8 + n; sc.set(k, k, k); m4.compose(v, q, sc); im.setMatrixAt(i, m4);
      });
      im.computeBoundingSphere();
      group.add(im);
    }
    group.userData = { cx, cz, instances, understory: ferns.length + logs.length };
    root.add(group);
    return group;
  }
  function disposeChunk(group) {
    root.remove(group);
    for (const c of group.children) { if (c.isInstancedMesh) c.dispose?.(); else c.geometry?.dispose?.(); }
  }
  // Trunk colliders: every tree's trunk radius plus a walker's clearance,
  // read from the same deterministic layout the chunk was drawn from.
  const layouts = new Map();
  function layoutFor(cx, cz) {
    const k = `${cx},${cz}`;
    if (!layouts.has(k)) { layouts.set(k, rwChunkTrees(cx, cz, budget.trees)); if (layouts.size > 80) layouts.delete(layouts.keys().next().value); }
    return layouts.get(k);
  }
  function blocked(x, z, clearance = 0.7) {
    const ccx = Math.floor((x - RW_BOUNDS.minX) / RW_CHUNK), ccz = Math.floor((z - RW_BOUNDS.minZ) / RW_CHUNK);
    for (let dz = -1; dz <= 1; dz += 1) for (let dx = -1; dx <= 1; dx += 1) {
      const cx = ccx + dx, cz = ccz + dz;
      if (cx < 0 || cz < 0 || cx >= RW_CHUNKS || cz >= RW_CHUNKS) continue;
      const x0 = RW_BOUNDS.minX + cx * RW_CHUNK, z0 = RW_BOUNDS.minZ + cz * RW_CHUNK;
      if (x < x0 - 8 || x > x0 + RW_CHUNK + 8 || z < z0 - 8 || z > z0 + RW_CHUNK + 8) continue;
      for (const t of layoutFor(cx, cz)) if (Math.hypot(x - t.x, z - t.z) < rwTrunkRadius(t) + clearance) return true;
    }
    return false;
  }
  let lastKey = "";
  function stream(px, pz, { all = false } = {}) {
    const ccx = Math.floor((px - RW_BOUNDS.minX) / RW_CHUNK), ccz = Math.floor((pz - RW_BOUNDS.minZ) / RW_CHUNK);
    const key = `${ccx},${ccz}`;
    if (key !== lastKey) {
      lastKey = key;
      const want = new Set();
      const R = budget.radius;
      for (let dz = -R; dz <= R; dz += 1) for (let dx = -R; dx <= R; dx += 1) {
        const cx = ccx + dx, cz = ccz + dz;
        if (cx < 0 || cz < 0 || cx >= RW_CHUNKS || cz >= RW_CHUNKS) continue;
        want.add(`${cx},${cz}`);
      }
      for (const [k, g] of chunks) if (!want.has(k)) { disposeChunk(g); chunks.delete(k); }
      queue.length = 0;
      [...want].filter((k) => !chunks.has(k))
        .sort((a, b) => { const [ax, az] = a.split(",").map(Number), [bx, bz] = b.split(",").map(Number); return Math.hypot(ax - ccx, az - ccz) - Math.hypot(bx - ccx, bz - ccz); })
        .forEach((k) => queue.push(k));
    }
    // A couple of chunks a frame, nearest first, so a phone never hitches.
    let n = all ? Infinity : 2;
    while (queue.length && n > 0) {
      const k = queue.shift();
      const [cx, cz] = k.split(",").map(Number);
      chunks.set(k, buildChunk(cx, cz));
      n -= 1;
    }
    for (const { site, group } of siteGroups) group.visible = Math.hypot(px - site.position[0], pz - site.position[1]) < budget.fog;
    for (const m of tinMeshes.values()) m.visible = !m.userData.found && Math.hypot(px - m.position.x, pz - m.position.z) < 220;
  }

  // ------------------------------------------------------ time of day
  let hour = opts.hour ?? 10;
  let clock = 0;
  function setHour(h) {
    hour = ((h % 24) + 24) % 24;
    const band = hour >= 6 && hour < 18 ? "day" : (hour >= 18 && hour < 20) || (hour >= 5 && hour < 6) ? "dusk" : "night";
    sky.set(band, weather);
    const r = sky.recipe;
    scene.background.setHex(r.sky);
    scene.fog.color.setHex(r.fog);
    const day = band === "day" ? 1 : band === "dusk" ? 0.55 : 0.22;
    sun.intensity = 1.0 * day; hemi.intensity = 0.35 + 0.55 * day;
    const a = ((hour - 6) / 12) * Math.PI;
    sun.position.set(Math.cos(a) * 500, Math.max(60, Math.sin(a) * 500), 200);
    return band;
  }
  let band = setHour(hour);

  function update(dt, camera) {
    clock += dt;
    sky.animate(clock, dt, camera);
    for (const w of wild) w.animate(clock, dt);
    for (const m of tinMeshes.values()) if (m.visible) m.rotation.y += dt;
    stream(camera.position.x, camera.position.z);
  }

  return {
    root, sky, update, stream, setHour, get hour() { return hour; }, get band() { return band; }, set band(b) { band = b; },
    chunks, siteGroups, tinMeshes, budget, blocked,
    markFound(id) { const m = tinMeshes.get(id); if (m) { m.userData.found = true; m.visible = false; } },
    stats() { let inst = 0, tris = 0; for (const g of chunks.values()) { inst += g.userData.instances; tris += g.children[0].geometry.index.count / 3; } return { chunks: chunks.size, instances: inst, groundTriangles: tris }; },
  };
}
