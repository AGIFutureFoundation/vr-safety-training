import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, mat, decal, mergeStatic, particles } from "./kit.js";
import { facePaint, paintedMat, txTexture, txSharedMat } from "./textures.js";
// holoTag is the one SmartCiti.X-specific set piece this module borrows (the
// floating AR-style name caption over a landmark), the same way
// shared/bayworld.js borrows it; everything else comes from kit.js and
// textures.js, which are generic to every WebXR app.
import { holoTag } from "../smartcity/js/citykit.js";
import {
  DEEP_BOUNDS, DEEP_DEPTH_RANGE, DEEP_ZONES, DEEP_LANDMARKS, DEEP_LINES, DEEP_SITES, DEEP_MESH_BUDGET,
  deepDepthAt, deepZoneAt, deepLineAt, deepBandAt, deepSeededRng,
} from "./underwater-data.js";
export {
  DEEP_BOUNDS, DEEP_DEPTH_RANGE, DEEP_ZONES, DEEP_LANDMARKS, DEEP_LINES, DEEP_SITES, DEEP_MESH_BUDGET,
  deepDepthAt, deepZoneAt, deepLineAt, deepBandAt,
};

// See underwater-data.js for the layout data and the pure zone/depth/line
// functions; this module is the three.js builder over that data, shared by
// team DEEP2 (the swim-or-ROV dive game and its quest layer) and the
// SmartCiti.X stage's "the-deep" scenic district.
//
// The Deep is built the same way shared/bayworld.js's world is: a "high"
// LOD 0 build of the whole 2000×1400 m seabed for a standalone app with its
// own camera and mesh budget, and a "low" compact vignette, independent of
// the zone data, for the shared stage (smartcity/js/districts.js's
// "the-deep" entry). `opts.zone` on a "high" build restricts the build to one
// named zone (DEEP_ZONES' own ids).
//
// Frame: on a "high" build y = 0 is the water surface and the seabed lies at
// y = -deepDepthAt(x, z), so a game places a diver or an ROV between the two.
// On the "low" vignette the silt is at y = 0 — the learner stands on it, the
// way every scenic district's own floor works — and the surface is out of
// sight above the fog.
//
// Every place named here is generic and original, and no depth, gas,
// decompression or current limit is stated anywhere: those are "per the dive
// plan and the tables the supervisor holds" (underwater-data.js's header).
//
// Every top-level name here is prefixed `deep`/`DEEP_`: tools/bundle_webxr.py
// concatenates every module into one scope, so nothing may share a name with
// bayworld.js, fairway.js or districts.js.

// ------------------------------------------------------------------ colour

/** hex 0xRRGGBB * k -> 0xRRGGBB, clamped. */
function deepShade(c, k) {
  const r = Math.max(0, Math.min(255, Math.round(((c >> 16) & 255) * k)));
  const g = Math.max(0, Math.min(255, Math.round(((c >> 8) & 255) * k)));
  const b = Math.max(0, Math.min(255, Math.round((c & 255) * k)));
  return (r << 16) | (g << 8) | b;
}

// ---------------------------------------------------------------- lighting
//
// Three depth bands rather than three times of day: under water the hour
// matters far less than how much of the daylight is left at the bottom.
// `fog` is the water colour the scene fades into, `fogDensity` a per-metre
// exponential density (a caller with linear fog can take
// near = 1 / fogDensity / 6 and far = 1 / fogDensity), `caustic` the
// dappled light the surface throws on the shallow bottom (its intensity
// falls to nothing in the deep band), `particulate` the drifting marine
// snow a build scatters around the viewer.
const DEEP_BANDS = {
  shallow: {
    water: 0x2a6c68, fog: 0x2a6c68, fogDensity: 0.045,
    hemi: [0x9fe0d0, 0x16241e], hemiI: 1.4, key: [0xbff0e4, 1.6],
    caustic: { colour: 0xcaf8ee, intensity: 0.55, speed: 0.8 },
    particulate: { colour: 0xd8f4ec, count: 240, size: 0.03, opacity: 0.45 },
  },
  mid: {
    water: 0x143e48, fog: 0x143e48, fogDensity: 0.07,
    hemi: [0x4f9aa0, 0x0e1a1c], hemiI: 1.0, key: [0x7fc4c0, 0.9],
    caustic: { colour: 0x9fdcd4, intensity: 0.18, speed: 0.5 },
    particulate: { colour: 0xb8dcd8, count: 320, size: 0.035, opacity: 0.4 },
  },
  deep: {
    water: 0x0a2230, fog: 0x0a2230, fogDensity: 0.11,
    hemi: [0x2a5a72, 0x060c10], hemiI: 0.6, key: [0x3f6f88, 0.35],
    caustic: { colour: 0x4f7f96, intensity: 0.0, speed: 0.3 },
    particulate: { colour: 0x8fb4c4, count: 400, size: 0.04, opacity: 0.35 },
  },
};

/** The {water, fog, fogDensity, hemi, hemiI, key, caustic, particulate}
 *  lighting recipe for a depth band ("shallow" | "mid" | "deep", default
 *  "mid"). Pure data — a caller turns it into a THREE.FogExp2, lights and a
 *  particle colour itself, so this module builds under the headless stub. */
export function deepLighting(band) {
  return DEEP_BANDS[band] ?? DEEP_BANDS.mid;
}

// ----------------------------------------------------------------- faces

/** Silt and sand: a muted base with darker specks and a few pale ripples. */
export function deepSiltFace(g, w, h, o = {}) {
  g.fillStyle = o.base ?? "#4a574d"; g.fillRect(0, 0, w, h);
  const rng = deepSeededRng(o.seed ?? 11);
  g.fillStyle = "rgba(0,0,0,0.12)";
  for (let i = 0; i < 260; i++) g.fillRect(rng() * w, rng() * h, 1 + rng() * 3, 1 + rng() * 2);
  g.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 18; i++) g.fillRect(0, (i / 18) * h + rng() * 6, w, 1);
}

/** Dappled surface light on the bottom: soft bright cells on a clear ground. */
function deepCausticFace(g, w, h) {
  g.fillStyle = "rgba(0,0,0,0)"; g.clearRect?.(0, 0, w, h);
  const rng = deepSeededRng(29);
  for (let i = 0; i < 70; i++) {
    const x = rng() * w, y = rng() * h, r = 6 + rng() * 18;
    g.fillStyle = `rgba(210,250,240,${(0.05 + rng() * 0.12).toFixed(3)})`;
    g.beginPath?.(); g.arc?.(x, y, r, 0, Math.PI * 2); g.fill?.();
  }
}

/** Marine growth on a pile or a hull: a dark green-brown wash. */
function deepGrowthFace(g, w, h) {
  g.fillStyle = "#3f4a33"; g.fillRect(0, 0, w, h);
  const rng = deepSeededRng(41);
  for (let i = 0; i < 120; i++) {
    g.fillStyle = rng() < 0.5 ? "rgba(120,140,80,0.35)" : "rgba(40,50,30,0.4)";
    g.fillRect(rng() * w, rng() * h, 2 + rng() * 6, 2 + rng() * 6);
  }
}

// ----------------------------------------------------------------- seabed

/** The seabed slab, height-displaced to -deepDepthAt() (surface at y = 0),
 *  textured with silt. Vertex displacement is guarded the same way
 *  shared/bayworld.js's bwTerrain() is: the headless checkers run against a
 *  stub three.js with no real BufferAttribute API, so this checks for it
 *  first and simply builds a flat slab there instead. */
function deepSeabedSlab(cx, cz, w, d, o = {}) {
  const segX = Math.min(96, Math.max(2, Math.round(w / 20)));
  const segZ = Math.min(96, Math.max(2, Math.round(d / 20)));
  const geo = new THREE.PlaneGeometry(w, d, segX, segZ);
  const pos = geo.attributes?.position;
  if (o.displace !== false && pos && typeof pos.setZ === "function" && typeof pos.getX === "function") {
    for (let i = 0; i < pos.count; i++) {
      // The plane is rotated -90° about x below, so its local +y is world -z
      // and its local +z is world +y: a positive depth goes to a negative y.
      const localX = pos.getX(i), localY = pos.getY(i);
      pos.setZ(i, -deepDepthAt(cx + localX, cz - localY));
    }
    pos.needsUpdate = true;
    if (typeof geo.computeVertexNormals === "function") geo.computeVertexNormals();
  }
  // By depth band (team PALETTE): caustic light over sand in the shallows,
  // the same sand dimmer and cooler in the mid band, plain silt in the deep
  // where no sunlight reaches.
  const rep = Math.max(6, Math.round(Math.max(w, d) / 40));
  const band = o.band ?? "mid";
  const tex = band === "deep"
    ? facePaint("deep-silt", (g, w2, h2) => deepSiltFace(g, w2, h2, { base: "#4a574d" }), { repeat: rep, px: 512 })
    : txTexture("causticSeabed", { palette: `deep-${band}`, seed: 41, intensity: band === "shallow" ? 0.34 : 0.16, repeat: rep });
  const mesh = new THREE.Mesh(geo, paintedMat(tex, { rough: 0.98, metal: 0.0 }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(cx, o.y ?? 0, cz);
  mesh.receiveShadow = true;
  mesh.userData.deepSeabed = true;
  return mesh;
}

/** The water surface seen from below: one translucent sheet at y = 0. */
function deepSurfaceSheet(parent, cx, cz, w, d) {
  const m = new THREE.MeshStandardMaterial({ color: 0x6fc4c0, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.4, side: THREE.DoubleSide, depthWrite: false });
  m.userData.ownMaterial = true;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m);
  sheet.rotation.x = Math.PI / 2;
  sheet.position.set(cx, 0, cz);
  sheet.castShadow = false; sheet.receiveShadow = false;
  parent.add(sheet);
  return sheet;
}

/** A caustic-light sheet a little above the bottom. */
function deepCausticSheet(parent, x, y, z, w, d, intensity) {
  const tex = facePaint("deep-caustic", (g, w2, h2) => deepCausticFace(g, w2, h2), { repeat: Math.max(2, Math.round(Math.max(w, d) / 6)), px: 256 });
  const m = paintedMat(tex, { rough: 1, metal: 0 });
  m.transparent = true; m.opacity = Math.max(0.05, intensity * 0.6); m.depthWrite = false;
  m.blending = THREE.AdditiveBlending;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m);
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.set(x, y, z);
  sheet.castShadow = false; sheet.receiveShadow = false;
  parent.add(sheet);
  return sheet;
}

/** y of the seabed under (x, z) on a "high" build. */
function deepFloorY(x, z) { return -deepDepthAt(x, z); }

// ------------------------------------------------------------ set pieces
//
// Every set piece takes its parent, a world (x, z), the seabed y under it
// and returns the number of meshes it authored, so buildUnderwater()'s
// reported meshCount can be reasoned about set piece by set piece.

/** One kelp stand: a stipe leaning a little, two or three blades up it. */
function deepKelpStand(parent, x, y, z, rng, scale = 1) {
  const h = (6 + rng() * 8) * scale;
  const g = group(parent, x, y, z, rng() * Math.PI * 2);
  g.rotation.z = (rng() - 0.5) * 0.12;
  cyl(g, 0.05 * scale, 0.09 * scale, h, 0, h / 2, 0, 0x5a6b2a, { rough: 0.9, seg: 6, cast: false, receive: false });
  let n = 1;
  const blades = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < blades; i++) {
    const by = h * (0.35 + (i / blades) * 0.6);
    const b = box(g, 0.22 * scale, 1.6 * scale, 0.03, 0.15 * scale, by, 0, 0x6f9a3a, { rough: 0.85, opacity: 0.9, cast: false, receive: false });
    b.material = txSharedMat("kelpBlade", { seed: 16 }, { rough: 0.85, opacity: 0.9 });
    b.rotation.y = i * 1.9; b.rotation.z = -0.25;
    n++;
  }
  g.userData.deepSway = { phase: rng() * Math.PI * 2, amount: 0.04 + rng() * 0.04 };
  return n;
}

/** An eelgrass patch: thin blades in a loose grid. */
function deepEelgrassPatch(parent, x, y, z, rng, count, spread) {
  const g = group(parent, x, y, z);
  for (let i = 0; i < count; i++) {
    const px = (rng() - 0.5) * spread, pz = (rng() - 0.5) * spread;
    const h = 0.6 + rng() * 0.6;
    const b = box(g, 0.04, h, 0.012, px, h / 2, pz, rng() < 0.5 ? 0x4f7a3a : 0x5f8a44, { rough: 0.9, cast: false, receive: false });
    b.rotation.y = rng() * Math.PI; b.rotation.z = (rng() - 0.5) * 0.3;
  }
  g.userData.deepSway = { phase: rng() * Math.PI * 2, amount: 0.08 };
  return count;
}

/** A reef ball: a hollow concrete dome (a flattened sphere here). */
function deepReefBall(parent, x, y, z, r = 0.9) {
  const b = ball(parent, r, x, y + r * 0.55, z, 0x7a8078, { rough: 0.95, seg: 10, seg2: 7, cast: false, receive: false });
  b.scale.y = 0.72;
  return 1;
}

/** A pile with growth rings; `h` reaches from the seabed to the deck. */
function deepPile(parent, x, y, z, h, i) {
  const tex = facePaint("deep-growth", (g, w, hh) => deepGrowthFace(g, w, hh), { repeat: 3, px: 256 });
  const p = cyl(parent, 0.3, 0.33, h, x, y + h / 2, z, 0x4a4a3a, { rough: 0.95, seg: 12, cast: false, receive: false });
  p.material = paintedMat(tex, { rough: 0.95 });
  let n = 1;
  for (const [ry, rh] of [[0.4 + (i % 3) * 0.2, 0.5], [1.8 + (i % 2) * 0.4, 0.34]]) {
    cyl(parent, 0.4, 0.43, rh, x, y + ry, z, 0x56613f, { rough: 1, seg: 12, cast: false, receive: false }); n++;
  }
  return n;
}

/** The pier over its piles: a deck at the surface, the pile forest under it. */
function deepPierPilings(parent, x, z, rng) {
  let n = 0;
  const y0 = deepFloorY(x, z);
  const h = -y0 + 1.2;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
    const px = x - 12 + c * 6, pz = z - 9 + r * 6;
    n += deepPile(parent, px, deepFloorY(px, pz), pz, -deepFloorY(px, pz) + 1.2, r * 5 + c);
  }
  box(parent, 32, 0.4, 22, x, 1.4, z, 0x5c4a34, { rough: 0.9, cast: false, receive: false }); n++;
  // The ladder on the landward face.
  for (const sy of [0.0, 0.6, 1.2, 1.8, 2.4]) { box(parent, 0.9, 0.05, 0.05, x + 16.5, y0 + 1 + sy * ((h - 1) / 2.4), z, 0x8b98a5, { rough: 0.5, metal: 0.6, cast: false, receive: false }); n++; }
  for (const sx of [-0.45, 0.45]) { cyl(parent, 0.04, 0.04, h, x + 16.5 + sx, y0 + h / 2, z, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 6, cast: false, receive: false }); n++; }
  return n;
}

/** A boulder garden on sand. */
function deepBoulders(parent, x, z, rng, count, spread) {
  for (let i = 0; i < count; i++) {
    const px = x + (rng() - 0.5) * spread, pz = z + (rng() - 0.5) * spread;
    const r = 0.5 + rng() * 1.4;
    const b = ball(parent, r, px, deepFloorY(px, pz) + r * 0.5, pz, rng() < 0.5 ? 0x6a6a5a : 0x55584a, { rough: 0.98, seg: 8, seg2: 6, cast: false, receive: false });
    b.material = deepReefMat(px, pz, rng() < 0.5 ? 0xd4d4c4 : 0xb8bcae);
    b.scale.y = 0.7;
  }
  return count;
}

/** Reef rock from the pattern set in the depth band's own palette, tinted
 *  per boulder from a two-tone set — shared, so a reef still merges. */
function deepReefMat(x, z, tint = 0xffffff) {
  return txSharedMat("reefRock", { palette: `deep-${deepBandAt(x, z)}`, seed: 17, repeat: 2 }, { color: tint, rough: 0.98 });
}

/** A stock anchor half buried in the sand. */
function deepOldAnchor(parent, x, z) {
  const y = deepFloorY(x, z);
  const g = group(parent, x, y, z, 0.6);
  g.rotation.z = 0.5;
  box(g, 0.14, 3.2, 0.14, 0, 1.2, 0, 0x4a3a2a, { rough: 0.95, cast: false, receive: false });
  box(g, 2.2, 0.16, 0.16, 0, 0.3, 0, 0x4a3a2a, { rough: 0.95, cast: false, receive: false });
  box(g, 1.6, 0.14, 0.14, 0, 2.6, 0, 0x4a3a2a, { rough: 0.95, cast: false, receive: false });
  return 3;
}

/** Survey stakes with a flag each, pegging out a plot or a transect end. */
function deepStakes(parent, points, colour) {
  let n = 0;
  for (const [x, z] of points) {
    const y = deepFloorY(x, z);
    cyl(parent, 0.03, 0.03, 1.2, x, y + 0.6, z, 0xdfe6ec, { rough: 0.5, seg: 6, cast: false, receive: false }); n++;
    box(parent, 0.3, 0.2, 0.02, x + 0.15, y + 1.1, z, colour, { rough: 0.6, emissive: colour, ei: 0.3, cast: false, receive: false }); n++;
  }
  return n;
}

/** A sandbar: a long, low, flattened mound. */
function deepSandbar(parent, x, z, len, ry) {
  const y = deepFloorY(x, z);
  const b = ball(parent, len / 2, x, y, z, 0xb9a77a, { rough: 0.98, seg: 12, seg2: 8, cast: false, receive: false });
  b.scale.set(1, 0.06, 0.28); b.rotation.y = ry;
  return 1;
}

/** A buoyed line: floats along it and a rope between them. */
function deepBuoyedLine(parent, a, b, floats, colour) {
  let n = 0;
  const [ax, az] = a, [bx, bz] = b;
  for (let i = 0; i <= floats; i++) {
    const t = i / floats, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
    ball(parent, 0.22, x, -0.3, z, colour, { rough: 0.5, seg: 8, seg2: 6, cast: false, receive: false }); n++;
  }
  const len = Math.hypot(bx - ax, bz - az);
  const rope = cyl(parent, 0.02, 0.02, len, (ax + bx) / 2, -0.5, (az + bz) / 2, 0xdfe6ec, { rough: 0.7, seg: 5, cast: false, receive: false });
  rope.rotation.z = Math.PI / 2; rope.rotation.y = -Math.atan2(bz - az, bx - ax); n++;
  return n;
}

/** A ledge of stacked rock. */
function deepRockLedge(parent, x, z, len, ry, rng) {
  const y = deepFloorY(x, z);
  const g = group(parent, x, y, z, ry);
  let n = 0;
  for (let i = 0; i < 6; i++) {
    const px = -len / 2 + (i + 0.5) * (len / 6);
    box(g, len / 6 + 0.4, 0.8 + rng() * 0.8, 1.6 + rng(), px, 0.5 + rng() * 0.3, (rng() - 0.5) * 0.6, 0x4a4a42, { rough: 0.98, cast: false, receive: false }).material = deepReefMat(x, z); n++;
  }
  return n;
}

/** A graduated post standing on the flats. */
function deepGaugePost(parent, x, z) {
  const y = deepFloorY(x, z);
  const h = -y + 1.5;
  cyl(parent, 0.12, 0.14, h, x, y + h / 2, z, 0xdfe6ec, { rough: 0.5, seg: 10, cast: false, receive: false });
  decal(parent, 0.26, Math.min(h, 6), x + 0.13, y + Math.min(h, 6) / 2 + 0.4, z, (g, w, hh) => {
    g.fillStyle = "#f2f2ee"; g.fillRect(0, 0, w, hh);
    g.fillStyle = "#1c1f22";
    for (let i = 0; i < 24; i++) g.fillRect(0, (i / 24) * hh, i % 4 === 0 ? w * 0.6 : w * 0.3, 2);
  }, { rough: 0.6 });
  return 2;
}

/** A weighted mooring: a block, a riser and (optionally) a sonde clipped on. */
function deepMooring(parent, x, z, o = {}) {
  const y = deepFloorY(x, z);
  const h = o.riser ?? Math.min(-y - 1, 30);
  box(parent, 1.6, 0.8, 1.6, x, y + 0.4, z, 0x6b7885, { rough: 0.9, cast: false, receive: false });
  cyl(parent, 0.03, 0.03, h, x, y + 0.8 + h / 2, z, 0x2b2f33, { rough: 0.6, metal: 0.5, seg: 6, cast: false, receive: false });
  let n = 2;
  if (o.sonde) { cyl(parent, 0.08, 0.08, 0.7, x + 0.12, y + 2.4, z, 0xf2c14b, { rough: 0.4, seg: 8, cast: false, receive: false }); n++; }
  if (o.float) { ball(parent, 0.35, x, y + 0.8 + h, z, o.float, { rough: 0.5, seg: 8, seg2: 6, cast: false, receive: false }); n++; }
  return n;
}

/** The outfall: a pipe run with stakes and a ported diffuser on a rock apron. */
function deepOutfall(parent, x, z, rng) {
  let n = 0;
  const y = deepFloorY(x, z);
  for (let i = 0; i < 6; i++) {
    const px = x - 60 + i * 12, pz = z - 60 + i * 12;
    const seg = cyl(parent, 0.6, 0.6, 17, px, deepFloorY(px, pz) + 0.5, pz, 0x5a5a5a, { rough: 0.8, metal: 0.2, seg: 10, cast: false, receive: false });
    seg.rotation.z = Math.PI / 2; seg.rotation.y = -Math.PI / 4; n++;
  }
  cyl(parent, 0.7, 0.7, 6, x, y + 0.6, z, 0x4a4a4a, { rough: 0.8, metal: 0.2, seg: 10, cast: false, receive: false }); n++;
  for (let i = 0; i < 5; i++) { cyl(parent, 0.18, 0.18, 0.8, x - 2 + i, y + 1.5, z, 0x6b7885, { rough: 0.6, metal: 0.3, seg: 8, cast: false, receive: false }); n++; }
  n += deepBoulders(parent, x, z, rng, 10, 26);
  return n;
}

/** A chain of buoy moorings: a sinker and a chain rising out of sight. */
function deepMarkerChain(parent, points, colour) {
  let n = 0;
  for (const [x, z] of points) {
    const y = deepFloorY(x, z);
    box(parent, 1.4, 0.7, 1.4, x, y + 0.35, z, 0x4a4a4a, { rough: 0.9, cast: false, receive: false }); n++;
    cyl(parent, 0.05, 0.05, -y, x, y / 2, z, 0x2b2f33, { rough: 0.6, metal: 0.6, seg: 6, cast: false, receive: false }); n++;
    ball(parent, 0.5, x, -0.3, z, colour, { rough: 0.5, seg: 8, seg2: 6, cast: false, receive: false }); n++;
  }
  return n;
}

/** Rows of reef balls with a settlement-tile rack at one end. */
function deepReefBallField(parent, x, z, rows, cols) {
  let n = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const px = x - (cols - 1) * 2.5 + c * 5, pz = z - (rows - 1) * 2.5 + r * 5;
    n += deepReefBall(parent, px, deepFloorY(px, pz), pz, 0.8 + ((r + c) % 3) * 0.12);
  }
  const rx = x + cols * 2.5 + 4, ry = deepFloorY(rx, z);
  box(parent, 2.4, 0.06, 1.2, rx, ry + 0.9, z, 0x8b98a5, { rough: 0.5, metal: 0.5, cast: false, receive: false }); n++;
  for (const sx of [-1, 1]) for (const sz of [-0.5, 0.5]) { cyl(parent, 0.03, 0.03, 0.9, rx + sx, ry + 0.45, z + sz, 0x8b98a5, { rough: 0.5, metal: 0.5, seg: 6, cast: false, receive: false }); n++; }
  for (let i = 0; i < 4; i++) { box(parent, 0.4, 0.03, 0.4, rx - 0.75 + i * 0.5, ry + 0.95, z, 0xb9b29d, { rough: 0.9, cast: false, receive: false }); n++; }
  return n;
}

/** The old workboat hull in its hollow: bow upright, stern settled deeper. */
function deepWreck(parent, x, z, ry) {
  const y = deepFloorY(x, z);
  const g = group(parent, x, y, z, ry);
  g.rotation.z = 0.18;
  const tex = facePaint("deep-growth", (gg, w, hh) => deepGrowthFace(gg, w, hh), { repeat: 3, px: 256 });
  const hull = box(g, 3.2, 2.2, 14, 0, 1.0, 0, 0x4a4a3a, { rough: 0.95, cast: false, receive: false });
  hull.material = paintedMat(tex, { rough: 0.95 });
  const bow = box(g, 2.4, 2.4, 3.2, 0, 1.2, 8.2, 0x4a4a3a, { rough: 0.95, cast: false, receive: false });
  bow.rotation.y = Math.PI / 4;
  box(g, 2.4, 1.8, 3.4, 0, 3.0, -2.5, 0x3f4a44, { rough: 0.95, cast: false, receive: false });
  let n = 3;
  for (let i = 0; i < 6; i++) for (const sx of [-1.5, 1.5]) { cyl(g, 0.04, 0.04, 0.9, sx, 2.55, -6 + i * 2.4, 0x5a5a4a, { rough: 0.9, seg: 6, cast: false, receive: false }); n++; }
  const mast = cyl(g, 0.08, 0.1, 6, 0, 4.5, -1, 0x4a3a2a, { rough: 0.9, seg: 8, cast: false, receive: false });
  mast.rotation.x = 0.35; n++;
  return n;
}

/** A stacked-stone cairn. */
function deepCairn(parent, x, z) {
  const y = deepFloorY(x, z);
  let n = 0;
  for (let i = 0; i < 5; i++) { ball(parent, 0.55 - i * 0.08, x, y + 0.3 + i * 0.55, z, 0x5a5a52, { rough: 0.98, seg: 8, seg2: 6, cast: false, receive: false }); n++; }
  return n;
}

/** The seamount's pinnacle: a rock cone with boulders at its foot. */
function deepPinnacle(parent, x, z, rng) {
  const y = deepFloorY(x, z);
  cyl(parent, 1.2, 6, 9, x, y + 4.5, z, 0x5a4a3a, { rough: 0.98, seg: 12, cast: false, receive: false }).material = deepReefMat(x, z, 0xc8b8a8);
  return 1 + deepBoulders(parent, x, z, rng, 12, 30);
}

/** A school of fish: small bodies in a loose ball that the animate loop
 *  circles slowly around its own centre. */
function deepFishSchool(parent, x, y, z, rng, count, colour) {
  const g = group(parent, x, y, z);
  for (let i = 0; i < count; i++) {
    const f = box(g, 0.08, 0.14, 0.42, (rng() - 0.5) * 3, (rng() - 0.5) * 1.6, (rng() - 0.5) * 3, colour, { rough: 0.4, metal: 0.5, cast: false, receive: false });
    f.rotation.y = (rng() - 0.5) * 0.4;
  }
  g.userData.deepSchool = { r: 3 + rng() * 6, speed: 0.15 + rng() * 0.15, phase: rng() * Math.PI * 2, cx: x, cz: z, y };
  return count;
}

/** A dive line on the bottom: a thin ribbon per segment, laid at the seabed
 *  under its midpoint. Guidelines are pale, transects white, anchor lines
 *  rise as risers instead, and the channel is not drawn (it is the trough). */
function deepLineRibbons(parent, lines) {
  let n = 0;
  for (const line of lines) {
    if (line.kind === "channel") continue;
    if (line.kind === "anchor-line") {
      const [x, z] = line.points[line.points.length - 1];
      n += deepMooring(parent, x, z, { float: 0xf2c14b, riser: Math.max(1, -deepFloorY(x, z) - 0.6) });
      continue;
    }
    const colour = line.kind === "transect" ? 0xf2f2ee : 0xf2c14b;
    for (let i = 1; i < line.points.length; i++) {
      const [ax, az] = line.points[i - 1], [bx, bz] = line.points[i];
      const mx = (ax + bx) / 2, mz = (az + bz) / 2;
      const len = Math.hypot(bx - ax, bz - az);
      const r = box(parent, 0.12, 0.04, len, mx, deepFloorY(mx, mz) + 0.08, mz, colour, { rough: 0.6, emissive: colour, ei: 0.15, cast: false, receive: false });
      r.rotation.y = Math.atan2(bx - ax, bz - az); n++;
    }
  }
  return n;
}

/** A site marker: a job-board pad and a flagged stake, for the game's job
 *  boards to sit on. */
function deepSiteMarker(parent, site, zone) {
  const [x, z] = site.position;
  const y = deepFloorY(x, z);
  const pad = cyl(parent, 1.6, 1.6, 0.12, x, y + 0.06, z, deepShade(zone.palette.seabed, 1.25), { rough: 0.9, seg: 16, cast: false, receive: false });
  pad.userData.deepSite = site.id;
  const n = 1 + deepStakes(parent, [[x + 1.2, z]], zone.palette.accent);
  return n;
}

function deepLabel(parent, name, x, y, z, accent) {
  return holoTag(parent, name, x, y, z, { w: 2.6, h: 0.6, accent });
}

// ------------------------------------------------------------ per landmark

const DEEP_LANDMARK_BUILDERS = {
  "piling-forest": (p, x, z, l, zone, rng) => deepPierPilings(p, x, z, rng),
  "pier-ladder": () => 0, // built as part of the pier above
  "shelf-boulder-garden": (p, x, z, l, zone, rng) => deepBoulders(p, x, z, rng, 14, 40),
  "old-anchor": (p, x, z) => deepOldAnchor(p, x, z),
  "eelgrass-edge": (p, x, z, l, zone, rng) => deepEelgrassPatch(p, x, deepFloorY(x, z), z, rng, 40, 24) + deepStakes(p, [[x - 12, z], [x + 12, z]], zone.palette.accent),
  "eelgrass-nursery-plots": (p, x, z, l, zone, rng) => deepEelgrassPatch(p, x, deepFloorY(x, z), z, rng, 30, 16) + deepStakes(p, [[x - 8, z - 8], [x + 8, z - 8], [x - 8, z + 8], [x + 8, z + 8]], zone.palette.accent),
  "marsh-mouth-bar": (p, x, z) => deepSandbar(p, x, z, 60, 0.4),
  "marsh-drift-line": (p, x, z, l, zone) => deepBuoyedLine(p, [x - 30, z - 10], [x + 30, z + 10], 6, zone.palette.accent),
  "kelp-cathedral": (p, x, z, l, zone, rng) => { let n = 0; for (let i = 0; i < 18; i++) { const px = x + (rng() - 0.5) * 30, pz = z + (rng() - 0.5) * 30; n += deepKelpStand(p, px, deepFloorY(px, pz), pz, rng, 1.6); } return n; },
  "holdfast-ledge": (p, x, z, l, zone, rng) => deepRockLedge(p, x, z, 22, 0.3, rng) + (() => { let n = 0; for (let i = 0; i < 6; i++) { const px = x + (rng() - 0.5) * 20, pz = z + 3 + rng() * 6; n += deepKelpStand(p, px, deepFloorY(px, pz), pz, rng, 1); } return n; })(),
  "tide-gauge-post": (p, x, z) => deepGaugePost(p, x, z),
  "sonde-mooring": (p, x, z) => deepMooring(p, x, z, { sonde: true, float: 0xf2c14b }),
  "outfall-diffuser": (p, x, z, l, zone, rng) => deepOutfall(p, x, z, rng),
  "outfall-pipe-run": (p, x, z, l, zone) => deepStakes(p, [[x - 20, z - 20], [x, z], [x + 20, z + 20]], zone.palette.accent),
  "approach-buoy-chain": (p, x, z, l, zone) => deepMarkerChain(p, [[x - 60, z - 4], [x - 30, z - 2], [x, z], [x + 30, z + 2], [x + 60, z + 4]], zone.palette.accent),
  "channel-marker-chain": (p, x, z, l, zone) => deepMarkerChain(p, [[x - 90, z - 40], [x - 45, z - 20], [x, z], [x + 45, z + 20], [x + 90, z + 40], [x + 135, z + 60]], zone.palette.accent),
  "reef-ball-rows": (p, x, z) => deepReefBallField(p, x, z, 4, 5),
  "settlement-tile-rack": () => 0, // built at the end of the reef ball rows
  "mud-plain-mooring": (p, x, z) => deepMooring(p, x, z, { float: 0x8b98a5 }),
  "wreck-bow": (p, x, z) => deepWreck(p, x + 10, z + 10, -0.8),
  "wreck-stern": () => 0, // the same hull
  "trench-lip": (p, x, z, l, zone, rng) => deepRockLedge(p, x, z, 40, -0.4, rng) + deepRockLedge(p, x + 30, z + 20, 30, -0.7, rng),
  "trench-floor-cairn": (p, x, z) => deepCairn(p, x, z),
  "seamount-pinnacle": (p, x, z, l, zone, rng) => deepPinnacle(p, x, z, rng),
  "seamount-saddle": (p, x, z, l, zone) => deepStakes(p, [[x - 6, z], [x + 6, z], [x, z - 6], [x, z + 6]], zone.palette.accent),
};

/** Ambient dressing per zone beyond its landmarks: kelp on the rock, grass
 *  in the meadow, boulders on the shelf and the mount, a fish school or two. */
function deepDressZone(parent, zone, rng) {
  let n = 0;
  const [cx, cz] = zone.centre;
  const at = (r) => { const a = rng() * Math.PI * 2, d = zone.radius * (0.1 + rng() * r); return [cx + Math.cos(a) * d, cz + Math.sin(a) * d]; };
  if (zone.id === "kelp-forest") for (let i = 0; i < 24; i++) { const [x, z] = at(0.7); n += deepKelpStand(parent, x, deepFloorY(x, z), z, rng, 1.2); }
  if (zone.id === "eelgrass-meadow") for (let i = 0; i < 4; i++) { const [x, z] = at(0.7); n += deepEelgrassPatch(parent, x, deepFloorY(x, z), z, rng, 24, 18); }
  if (zone.id === "shallow-shelf" || zone.id === "seamount" || zone.id === "deep-trench") n += deepBoulders(parent, cx, cz, rng, 8, zone.radius * 1.2);
  if (zone.id === "mud-plain" || zone.id === "shipping-channel") {
    // A few pieces of sunk debris — the debris-sweep activities' targets.
    for (let i = 0; i < 5; i++) { const [x, z] = at(0.8); const d = box(parent, 0.6 + rng(), 0.3, 0.8 + rng(), x, deepFloorY(x, z) + 0.15, z, 0x3a3f45, { rough: 0.9, cast: false, receive: false }); d.rotation.y = rng() * 3; n++; }
  }
  const schools = zone.id === "deep-trench" ? 1 : zone.id === "kelp-forest" || zone.id === "reef-ball-field" || zone.id === "wreck-hollow" ? 3 : 2;
  for (let i = 0; i < schools; i++) {
    const [x, z] = at(0.6);
    const y = deepFloorY(x, z) + 2 + rng() * 4;
    n += deepFishSchool(parent, x, y, z, rng, 8, rng() < 0.5 ? 0x9fb4c4 : 0xc9d0d6);
  }
  return n;
}

/** Everything that belongs to one zone: its landmarks, its sites, its own
 *  ambient dressing and a caustic sheet if it is shallow. */
function deepBuildZone(parent, zone) {
  const rng = deepSeededRng(zone.id.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 13));
  let n = deepDressZone(parent, zone, rng);
  for (const landmark of DEEP_LANDMARKS) {
    if (landmark.zone !== zone.id) continue;
    const build = DEEP_LANDMARK_BUILDERS[landmark.id];
    const [x, z] = landmark.position;
    if (build) n += build(parent, x, z, landmark, zone, rng);
    deepLabel(parent, landmark.name, x, deepFloorY(x, z) + 4, z, zone.palette.accent); n++;
  }
  for (const site of DEEP_SITES) {
    if (site.zone !== zone.id) continue;
    n += deepSiteMarker(parent, site, zone);
  }
  const band = deepBandAt(zone.centre[0], zone.centre[1]);
  const light = deepLighting(band);
  if (light.caustic.intensity > 0) {
    deepCausticSheet(parent, zone.centre[0], deepFloorY(zone.centre[0], zone.centre[1]) + 0.3, zone.centre[1], zone.radius * 1.4, zone.radius * 1.4, light.caustic.intensity); n++;
  }
  return n;
}

// ---------------------------------------------------------------- assembly

/** The whole seabed (or one named zone): the slab, the surface, the lines,
 *  every zone's own set pieces, sites, labels and fish. LOD 0 — documented
 *  budget DEEP_MESH_BUDGET.high. */
function deepBuildWorld(parent, opts) {
  const zones = opts.zone ? DEEP_ZONES.filter((z) => z.id === opts.zone) : DEEP_ZONES;
  const { minX, maxX, minZ, maxZ } = DEEP_BOUNDS;
  const w = maxX - minX, d = maxZ - minZ, cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  const band = opts.band ?? (zones.length === 1 ? deepBandAt(zones[0].centre[0], zones[0].centre[1]) : "mid");
  parent.add(deepSeabedSlab(cx, cz, w, d, { band }));
  deepSurfaceSheet(parent, cx, cz, w, d);
  const lines = opts.zone ? DEEP_LINES.filter((l) => l.points.some(([x, z]) => deepZoneAt(x, z).id === opts.zone)) : DEEP_LINES;
  deepLineRibbons(parent, lines);
  for (const zone of zones) deepBuildZone(parent, zone);
}

/** A compact seabed vignette at the origin, independent of the zone/site/
 *  landmark data — sized for the shared SmartCiti.X stage's own scenic-
 *  district budget (SCENIC_BUDGET, see smartcity/js/districts.js). The silt
 *  is at y = 0 and the learner stands on it; the station's own work area at
 *  the middle and the walk in from the spawn (0, 5.2) are kept clear, the
 *  same clearances tools/check_districts.mjs measures. */
function deepBuildVignette(parent, opts) {
  const rng = deepSeededRng(77);
  const tex = txTexture("causticSeabed", { palette: "deep-shallow", seed: 41, intensity: 0.34, repeat: 12 });
  const floor = cyl(parent, 42, 42, 0.3, 0, -0.15, 0, 0x4a574d, { seg: 48, cast: false });
  floor.material = paintedMat(tex, { rough: 0.98 });
  deepCausticSheet(parent, 0, 0.02, 0, 60, 60, deepLighting("shallow").caustic.intensity);
  // A kelp stand to the west, eelgrass to the east, well outside the station's own circle.
  for (let i = 0; i < 8; i++) deepKelpStand(parent, -9 - rng() * 6, 0, -7 + rng() * 14, rng, 1.0);
  deepEelgrassPatch(parent, 9, 0, 3, rng, 18, 5);
  // Reef balls in a short row across the back.
  for (let i = 0; i < 4; i++) deepReefBall(parent, -4.5 + i * 3, 0, -9.5, 0.8);
  // Pier piles rising out of sight behind them.
  for (let i = 0; i < 6; i++) deepPile(parent, -6 + (i % 3) * 6, 0, -14 - Math.floor(i / 3) * 4, 20, i);
  // A guideline across the silt, an ascent line to the east.
  box(parent, 30, 0.04, 0.12, 0, 0.04, -5.5, 0xf2c14b, { rough: 0.6, emissive: 0xf2c14b, ei: 0.15, cast: false, receive: false });
  cyl(parent, 0.03, 0.03, 20, 7.5, 10, -6, 0xdfe6ec, { rough: 0.6, seg: 6, cast: false, receive: false });
  ball(parent, 0.35, 7.5, 0.35, -6, 0xf2c14b, { rough: 0.5, seg: 8, seg2: 6, cast: false, receive: false });
  // The wreck's bow off to the south-east.
  const bow = group(parent, 12, 0, 9, -0.9);
  bow.rotation.z = 0.15;
  box(bow, 2.6, 2.0, 6, 0, 0.9, 0, 0x3f4a44, { rough: 0.95, cast: false, receive: false });
  const bowCap = box(bow, 2.0, 2.2, 2.6, 0, 1.1, 3.8, 0x3f4a44, { rough: 0.95, cast: false, receive: false });
  bowCap.rotation.y = Math.PI / 4;
  cyl(bow, 0.07, 0.09, 5, 0, 3.5, -1, 0x4a3a2a, { rough: 0.9, seg: 8, cast: false, receive: false });
  // A fish school overhead, circling.
  deepFishSchool(parent, 0, 3.2, -2, rng, 10, 0xc9d0d6);
  deepLabel(parent, "The Deep", 0, 4.2, -9.5, 0xa8f0e0);
  deepLabel(parent, "Kelp stand", -11, 3.4, 0, 0x7ab648);
}

/** Drifting marine snow: one Points cloud the animate loop keeps drifting
 *  around `focus` (default the origin). */
function deepParticulate(parent, band) {
  const p = deepLighting(band).particulate;
  const pts = particles(parent, p.count, p.colour, { size: p.size, opacity: p.opacity, additive: false, life: 6 });
  pts.visible = true;
  return pts;
}

/**
 * Build the Deep.
 *   parent  a group (or scene) to build into
 *   opts    { detail: "low" | "high" (default "high"), zone: a DEEP_ZONES id
 *             to build only that zone on a "high" build, band: "shallow" |
 *             "mid" | "deep" for the lights (default from the zone, or "mid"),
 *             time, weather (accepted for the stage's contract; the water
 *             ignores the hour) }
 * Returns { detail, band, lighting, meshCount, merged, animate(t, dt, focus) }.
 * `meshCount` is the authored count before mergeStatic() (see
 * DEEP_MESH_BUDGET's doc); `animate` sways the kelp and the eelgrass, circles
 * the fish schools and drifts the particulate around `focus` ({x, y, z},
 * default the origin) — the same contract shared/bayworld.js's
 * buildBayWorld() returns, with an animate that does something.
 */
export function buildUnderwater(parent, opts = {}) {
  const detail = opts.detail === "low" ? "low" : "high";
  const zone = opts.zone ? DEEP_ZONES.find((z) => z.id === opts.zone) : null;
  const band = opts.band ?? (detail === "low" ? "shallow" : zone ? deepBandAt(zone.centre[0], zone.centre[1]) : "mid");
  const lighting = deepLighting(band);
  const hemi = new THREE.HemisphereLight(lighting.hemi[0], lighting.hemi[1], lighting.hemiI);
  parent.add(hemi);
  const sun = new THREE.DirectionalLight(lighting.key[0], lighting.key[1]);
  sun.position.set(20, 60, 10);
  parent.add(sun);

  if (detail === "low") deepBuildVignette(parent, opts);
  else deepBuildWorld(parent, opts);
  const snow = deepParticulate(parent, band);

  let meshCount = 0;
  const swaying = [], schools = [];
  parent.traverse((o) => {
    if (o.isMesh || o.isPoints || o.isLine) meshCount += 1;
    if (o.userData?.deepSway) swaying.push(o);
    if (o.userData?.deepSchool) schools.push(o);
  });
  const merged = mergeStatic(parent);

  const origin = { x: 0, y: detail === "low" ? 1.5 : -8, z: 0 };
  return {
    detail,
    band,
    lighting,
    meshCount,
    merged,
    animate(t = 0, dt = 0.016, focus = origin) {
      for (const g of swaying) {
        const s = g.userData.deepSway;
        g.rotation.z = Math.sin(t * 0.6 + s.phase) * s.amount;
      }
      for (const g of schools) {
        const s = g.userData.deepSchool;
        const a = t * s.speed + s.phase;
        g.position.set(s.cx + Math.cos(a) * s.r, s.y + Math.sin(t * 0.4 + s.phase) * 0.4, s.cz + Math.sin(a) * s.r);
        g.rotation.y = -a;
      }
      snow.userData.step?.(dt, focus, 14, 0.08, -0.01);
    },
  };
}
