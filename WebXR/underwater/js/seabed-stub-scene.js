import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  DEEP_BOUNDS, DEEP_ZONES, DEEP_LANDMARKS, DEEP_SITES, DEEP_LINES, DEEP_MESH_BUDGET,
  deepDepthAt, deepZoneAt, dvSeededRng,
} from "./seabed-stub.js";

// The Deep — seabed builder stub (three.js). Team DEEP1's real builder is
// WebXR/shared/underwater.js: buildUnderwater(parent, { detail, zone }) and
// deepLighting(band). This is a small stand-in in that exact shape so the
// dive game renders before it lands — a seabed of zone discs stepped to the
// depth field, kelp stands, eelgrass tufts, reef balls, a wreck, pilings,
// an outfall pipe, a marsh mouth bar, a mooring chain and the dive lines,
// under a translucent surface. world.js swaps this for the real module in
// one import line; this file then stays in the tree, unbundled.

const dvStd = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05, ...o });

/**
 * Fog colour and density, hemisphere light, key light, caustic strength and
 * particulate density for a depth band: "shallow" (sun-lit, caustics),
 * "mid" (blue-green, dim), "deep" (near-dark, the lamp does the work).
 * Pure and deterministic.
 */
export function deepLighting(band) {
  const table = {
    shallow: { fog: { color: 0x2f8fa8, density: 0.012 }, hemi: [0x9fe0f0, 0x1a3a40], hemiI: 0.9, key: [0xeaf8ff, 0.9], caustic: 0.8, particulate: 0.3 },
    mid: { fog: { color: 0x14505f, density: 0.02 }, hemi: [0x4fa0b8, 0x0a2028], hemiI: 0.55, key: [0xa0d8e8, 0.45], caustic: 0.3, particulate: 0.6 },
    deep: { fog: { color: 0x061a26, density: 0.032 }, hemi: [0x1a4a60, 0x040c12], hemiI: 0.25, key: [0x6a9ab0, 0.15], caustic: 0, particulate: 0.9 },
  };
  return { band: table[band] ? band : "mid", ...(table[band] ?? table.mid) };
}

/**
 * Builds the seabed into `parent`. `opts.detail` is "high" (the whole field,
 * within DEEP_MESH_BUDGET.high) or "low" (a self-contained vignette of one
 * zone near the origin, within DEEP_MESH_BUDGET.low); `opts.zone` focuses
 * the scatter on one zone. Returns `{ root, meshCount, budget, surface, lights }`.
 */
export function buildUnderwater(parent, opts = {}) {
  const detail = opts.detail === "low" ? "low" : "high";
  const focus = opts.zone ?? null;
  const root = new THREE.Group();
  root.name = "the-deep";
  let meshCount = 0;
  const add = (m) => { root.add(m); meshCount += 1; return m; };
  const at = (mesh, x, y, z) => { mesh.position.set(x, y, z); return mesh; };

  const hemi = new THREE.HemisphereLight(0x9fe0f0, 0x1a3a40, 0.9);
  const key = new THREE.DirectionalLight(0xeaf8ff, 0.9);
  key.position.set(60, 200, -40);
  root.add(hemi, key);

  const w = DEEP_BOUNDS.maxX - DEEP_BOUNDS.minX, d = DEEP_BOUNDS.maxZ - DEEP_BOUNDS.minZ;
  const zones = detail === "low" ? [deepZoneAt(0, 0)] : DEEP_ZONES;

  // Surface and a base seabed slab at the field's mean depth.
  const surface = add(new THREE.Mesh(new THREE.PlaneGeometry(detail === "low" ? 120 : w, detail === "low" ? 120 : d),
    new THREE.MeshStandardMaterial({ color: 0x5fb8d8, transparent: true, opacity: 0.35, side: THREE.DoubleSide, roughness: 0.2 })));
  surface.rotation.x = -Math.PI / 2;
  surface.userData.deepSurface = true;
  const base = add(new THREE.Mesh(new THREE.PlaneGeometry(detail === "low" ? 120 : w, detail === "low" ? 120 : d), dvStd(0x3a3a35)));
  base.rotation.x = -Math.PI / 2;
  base.position.y = -(detail === "low" ? deepDepthAt(0, 0) + 0.5 : 60);
  base.userData.deepSeabed = true;

  // One stepped disc per zone at that zone's own depth, tinted by its palette.
  for (const zone of zones) {
    const [cx, cz] = detail === "low" ? [0, 0] : zone.centre;
    const depth = deepDepthAt(cx, cz);
    const disc = add(new THREE.Mesh(new THREE.CircleGeometry(detail === "low" ? 55 : zone.radius, 24), dvStd(zone.palette.seabed)));
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(cx, -depth, cz);
    disc.userData.deepZone = zone.id;
  }

  // Scatter per zone: kelp, eelgrass, reef balls, pilings, chain, rock,
  // wreck, outfall, marsh bar — deterministic, counted against the budget.
  const kelpMat = dvStd(0x5a8a3a), grassMat = dvStd(0x6aa04a), reefMat = dvStd(0x9a8a70), pileMat = dvStd(0x4a3a2a),
    rockMat = dvStd(0x555048), hullMat = dvStd(0x6a4a3a, { metalness: 0.3 }), pipeMat = dvStd(0x8a8a80, { metalness: 0.4 }), chainMat = dvStd(0x3a3a40, { metalness: 0.6 });
  const perZone = detail === "low" ? 24 : focus ? 30 : 70;
  for (const zone of zones) {
    const [cx, cz] = detail === "low" ? [0, 0] : zone.centre;
    const count = focus && zone.id !== focus ? Math.floor(perZone / 3) : perZone;
    const rng = dvSeededRng(Math.round(cx * 31 + cz * 17 + count) >>> 0);
    for (let i = 0; i < count; i++) {
      const ang = rng() * Math.PI * 2, r = rng() * (detail === "low" ? 50 : zone.radius * 0.8);
      const x = cx + Math.cos(ang) * r, z = cz + Math.sin(ang) * r;
      if (x < DEEP_BOUNDS.minX || x > DEEP_BOUNDS.maxX || z < DEEP_BOUNDS.minZ || z > DEEP_BOUNDS.maxZ) continue;
      const y = -deepDepthAt(x, z);
      switch (zone.id) {
        case "kelp-forest": { const h = 6 + rng() * 10; at(add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, h, 5), kelpMat)), x, y + h / 2, z); break; }
        case "eelgrass-meadow": at(add(new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 5), grassMat)), x, y + 0.7, z); break;
        case "reef-ball-field": at(add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), reefMat)), x, y + 0.6, z); break;
        case "pier-pilings": { const h = deepDepthAt(x, z) + 3; at(add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, h, 8), pileMat)), x, y + h / 2, z); break; }
        case "tender-anchorage": at(add(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.12, 6, 10), chainMat)), x, y + 0.3, z); break;
        case "seamount": case "wreck-hollow": case "deep-trench": at(add(new THREE.Mesh(new THREE.OctahedronGeometry(0.8 + rng() * 1.6), rockMat)), x, y + 0.5, z); break;
        default: if (rng() < 0.4) at(add(new THREE.Mesh(new THREE.SphereGeometry(0.3 + rng() * 0.5, 6, 5), rockMat)), x, y + 0.2, z);
      }
    }
  }

  if (detail === "high") {
    // The wreck: a hull box with a raised bow, in the hollow.
    const bow = DEEP_LANDMARKS.find((l) => l.id === "wreck-bow"), stern = DEEP_LANDMARKS.find((l) => l.id === "wreck-stern");
    if (bow && stern) {
      const mx = (bow.position[0] + stern.position[0]) / 2, mz = (bow.position[1] + stern.position[1]) / 2;
      const hull = at(add(new THREE.Mesh(new THREE.BoxGeometry(6, 3.5, 24), hullMat)), mx, -deepDepthAt(mx, mz) + 1.6, mz);
      hull.rotation.y = Math.atan2(bow.position[0] - stern.position[0], bow.position[1] - stern.position[1]);
      hull.rotation.z = 0.25;
      at(add(new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.2, 4), hullMat)), mx, -deepDepthAt(mx, mz) + 4, mz);
    }
    // The outfall: a pipe along the apron to its diffuser.
    const diff = DEEP_LANDMARKS.find((l) => l.id === "outfall-diffuser");
    if (diff) {
      const pipe = at(add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 90, 8), pipeMat)), diff.position[0] + 40, -deepDepthAt(diff.position[0], diff.position[1]) + 0.6, diff.position[1] - 20);
      pipe.rotation.z = Math.PI / 2;
    }
    // The marsh mouth bar: a low mound across the channel mouth.
    const bar = DEEP_LANDMARKS.find((l) => l.id === "marsh-mouth-bar");
    if (bar) at(add(new THREE.Mesh(new THREE.SphereGeometry(30, 10, 6), dvStd(0x8a7a5a))), bar.position[0], -deepDepthAt(bar.position[0], bar.position[1]) - 26, bar.position[1]);
    // Landmark markers and site pads.
    for (const l of DEEP_LANDMARKS) at(add(new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.4, 6), dvStd(0xf0c07a, { emissive: 0x804a10, emissiveIntensity: 0.3 }))), l.position[0], -deepDepthAt(l.position[0], l.position[1]) + 1.2, l.position[1]);
    for (const s of DEEP_SITES) {
      const pad = at(add(new THREE.Mesh(new THREE.CircleGeometry(4, 16), dvStd(0x4fd1ff, { emissive: 0x1a5a70, emissiveIntensity: 0.4 }))), s.position[0], -deepDepthAt(s.position[0], s.position[1]) + 0.12, s.position[1]);
      pad.rotation.x = -Math.PI / 2;
      pad.userData.deepSite = s.id;
    }
    // Dive lines: a thin box per segment, laid on the seabed.
    const lineMat = dvStd(0xf2f2e0, { emissive: 0x606050, emissiveIntensity: 0.3 });
    for (const line of DEEP_LINES) {
      for (let i = 1; i < line.points.length; i++) {
        const [ax, az] = line.points[i - 1], [bx, bz] = line.points[i];
        const len = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2;
        const seg = at(add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, len), lineMat)), mx, -deepDepthAt(mx, mz) + 0.4, mz);
        seg.rotation.y = Math.atan2(bx - ax, bz - az);
      }
    }
  }

  parent.add(root);
  const budget = DEEP_MESH_BUDGET[detail];
  return { root, meshCount, budget, surface, lights: { hemi, key } };
}
