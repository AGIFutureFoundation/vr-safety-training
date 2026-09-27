import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";

// Generic wildlife for the open worlds: gull and pelican flocks over water,
// shorebirds on a shoreline, seals on a float, a fish school and a ray
// under the surface (the dive game and the outer bay), a kelp crab on a
// rock. Every animal is a few low-mesh parts with a simple motion loop
// driven by property writes, and every group is tagged
// `userData.wildlife = { kind }` so a game can count a sighting.
//
// Nothing here is a claim about a real place: the kinds are the generic
// coastal ones, the counts are a scene's own budget, not a census, and no
// season is stated. The zone a caller passes is a plain rectangle
// `{ x, z, w, d, y }` (centre, extent, surface height in metres), so this
// module imports no world data and any world can use it.
//
// Top-level names are prefixed wl…/WILDLIFE_… for the bundler
// (tools/bundle_webxr.py concatenates every module into one scope).

/** Per kind: the default count for one group and the meshes it costs
 *  (tools/check_sky.mjs builds each and holds it to this). `total` is the
 *  ceiling for one of everything, which is what Bay World builds. */
export const WILDLIFE_BUDGET = {
  gulls: { count: 8, meshes: 24, motion: "circle" },
  pelicans: { count: 4, meshes: 12, motion: "glide" },
  shorebirds: { count: 6, meshes: 12, motion: "dash" },
  seals: { count: 3, meshes: 7, motion: "bask" },
  fish: { count: 60, meshes: 1, motion: "school" },
  ray: { count: 1, meshes: 2, motion: "figure-eight" },
  crab: { count: 1, meshes: 4, motion: "sidestep" },
  total: 62,
};
export const WILDLIFE_KINDS = Object.keys(WILDLIFE_BUDGET).filter((k) => k !== "total");

/** Deterministic per-group randomness, so two builds of the same zone match. */
function wlRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function wlMat(colour, o = {}) {
  const m = new THREE.MeshStandardMaterial({ color: colour, roughness: o.rough ?? 0.85, metalness: o.metal ?? 0.05, ...(o.extra ?? {}) });
  m.userData.ownMaterial = true;
  return m;
}

function wlBox(parent, w, h, d, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.userData.noMerge = true;
  mesh.castShadow = false;
  parent.add(mesh);
  return mesh;
}

function wlBall(parent, r, x, y, z, material, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.userData.noMerge = true;
  mesh.castShadow = false;
  parent.add(mesh);
  return mesh;
}

function wlUnit(parent, kind, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.userData.wildlife = { kind };
  parent.add(g);
  return g;
}

// ---------------------------------------------------------------- birds

/** A bird as body plus two wings hinged at the body: 3 meshes. */
function wlBird(parent, kind, x, y, z, o) {
  const g = wlUnit(parent, kind, x, y, z);
  const body = wlBox(g, o.len * 0.35, o.len * 0.22, o.len, 0, 0, 0, o.body);
  const left = wlBox(g, o.span / 2, 0.04, o.len * 0.45, -o.span / 4, 0, 0, o.wing);
  const right = wlBox(g, o.span / 2, 0.04, o.len * 0.45, o.span / 4, 0, 0, o.wing);
  g.userData.wings = [left, right];
  return { g, body, left, right };
}

function wlFlap(unit, t, rate, amount) {
  const a = Math.sin(t * rate + unit.phase) * amount;
  unit.left.rotation.z = a;
  unit.right.rotation.z = -a;
}

/** Gulls: circle the zone at their own radius, height and speed. */
function wlGulls(parent, zone, count, rng) {
  const body = wlMat(0xf2f4f6), wing = wlMat(0xb8bfc6);
  const units = [];
  for (let i = 0; i < count; i++) {
    const u = wlBird(parent, "gulls", zone.x, zone.y + 14, zone.z, { len: 0.55, span: 1.3, body, wing });
    u.radius = Math.min(zone.w, zone.d) * (0.12 + rng() * 0.3);
    u.height = zone.y + 10 + rng() * 14;
    u.speed = (0.25 + rng() * 0.25) * (rng() < 0.5 ? 1 : -1);
    u.phase = rng() * Math.PI * 2;
    u.cx = zone.x + (rng() - 0.5) * zone.w * 0.3;
    u.cz = zone.z + (rng() - 0.5) * zone.d * 0.3;
    units.push(u);
  }
  return (t) => {
    for (const u of units) {
      const a = t * u.speed + u.phase;
      u.g.position.set(u.cx + Math.cos(a) * u.radius, u.height + Math.sin(t * 0.7 + u.phase) * 1.2, u.cz + Math.sin(a) * u.radius);
      u.g.rotation.y = -a + (u.speed > 0 ? 0 : Math.PI);
      wlFlap(u, t, 7, 0.55);
    }
  };
}

/** Pelicans: a slow line, gliding, one long pass across the zone and back. */
function wlPelicans(parent, zone, count, rng) {
  const body = wlMat(0xd9cfc0), wing = wlMat(0x6b625a);
  const units = [];
  for (let i = 0; i < count; i++) {
    const u = wlBird(parent, "pelicans", zone.x, zone.y + 6, zone.z, { len: 1.1, span: 2.6, body, wing });
    u.offset = i * 3.2;
    u.phase = i * 0.9;
    units.push(u);
  }
  const half = Math.max(20, zone.w * 0.45);
  const period = Math.max(30, half / 4);
  return (t) => {
    const k = (t % (period * 2)) / period;         // 0..2
    const dir = k < 1 ? 1 : -1;
    const x = zone.x + (k < 1 ? -half + k * 2 * half : half - (k - 1) * 2 * half);
    for (const u of units) {
      u.g.position.set(x - dir * u.offset, zone.y + 5 + Math.sin(t * 0.5 + u.phase) * 0.8, zone.z + u.offset * 0.6 * (u.offset % 2 ? 1 : -1));
      u.g.rotation.y = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      wlFlap(u, t, 2.2, 0.25);
    }
  };
}

/** Shorebirds: body and legs, short dashes along the tide line with pauses. */
function wlShorebirds(parent, zone, count, rng) {
  const body = wlMat(0x8d8a80), leg = wlMat(0x3a3530);
  const units = [];
  for (let i = 0; i < count; i++) {
    const x = zone.x + (rng() - 0.5) * zone.w, z = zone.z + (rng() - 0.5) * zone.d;
    const g = wlUnit(parent, "shorebirds", x, zone.y, z);
    wlBall(g, 0.09, 0, 0.2, 0, body, 1, 0.8, 1.6);
    wlBox(g, 0.06, 0.16, 0.02, 0, 0.08, 0, leg);
    units.push({ g, x0: x, z0: z, phase: rng() * 10, span: 1.5 + rng() * 2.5, dir: rng() < 0.5 ? 1 : -1 });
  }
  return (t) => {
    for (const u of units) {
      const cyc = (t * 0.6 + u.phase) % 4;             // dash for 1 s of every 4
      const run = cyc < 1 ? cyc : 1;
      u.g.position.x = u.x0 + u.dir * run * u.span;
      u.g.position.y = zone.y + (cyc < 1 ? Math.abs(Math.sin(cyc * 18)) * 0.03 : 0);
      u.g.rotation.y = u.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (cyc > 3.9) u.dir = -u.dir;
    }
  };
}

// ---------------------------------------------------------------- water

/** Seals on a float: one plank, each seal a body and a head. Bob, roll,
 *  and one at a time lifts its head. */
function wlSeals(parent, zone, count, rng) {
  const plank = wlMat(0x7a6a55), hide = wlMat(0x5a5048, { rough: 0.6 });
  const raft = wlUnit(parent, "seals", zone.x, zone.y, zone.z);
  wlBox(raft, 5.5, 0.25, 3.2, 0, 0.12, 0, plank);
  const units = [];
  for (let i = 0; i < count; i++) {
    const g = wlUnit(raft, "seals", -1.6 + i * 1.6, 0.25, (i % 2 ? 0.6 : -0.6));
    wlBall(g, 0.42, 0, 0.3, 0, hide, 1, 0.7, 2.2);
    const head = wlBall(g, 0.2, 0, 0.45, 0.95, hide);
    units.push({ g, head, phase: i * 2.1 });
  }
  return (t) => {
    raft.position.y = zone.y + Math.sin(t * 0.8) * 0.06;
    raft.rotation.z = Math.sin(t * 0.6) * 0.03;
    raft.rotation.x = Math.cos(t * 0.5) * 0.02;
    for (const u of units) u.head.position.y = 0.45 + Math.max(0, Math.sin(t * 0.35 + u.phase)) * 0.3;
  };
}

/** A fish school: one point cloud moving as a body on an ellipse below
 *  the surface, each point wobbling when the geometry API is real. */
function wlFish(parent, zone, count, rng) {
  const g = wlUnit(parent, "fish", zone.x, zone.y - 2.5, zone.z);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rng() - 0.5) * 6;
    positions[i * 3 + 1] = (rng() - 0.5) * 1.6;
    positions[i * 3 + 2] = (rng() - 0.5) * 3;
  }
  const geo = new THREE.BufferGeometry();
  const Attr = THREE.Float32BufferAttribute ?? THREE.BufferAttribute;
  geo.setAttribute("position", new Attr(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xa9c4cf, size: 0.18, transparent: true, opacity: 0.85, depthWrite: false, sizeAttenuation: true });
  mat.userData.ownMaterial = true;
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  g.add(pts);
  const rx = Math.max(6, zone.w * 0.3), rz = Math.max(4, zone.d * 0.3);
  const live = geo.attributes?.position?.array === positions;
  return (t, dt) => {
    const a = t * 0.12;
    g.position.set(zone.x + Math.cos(a) * rx, zone.y - 2.5 + Math.sin(t * 0.3) * 0.4, zone.z + Math.sin(a) * rz);
    g.rotation.y = -a;
    if (live && dt > 0) {
      for (let i = 0; i < count; i++) positions[i * 3 + 1] += Math.sin(t * 3 + i) * dt * 0.15;
      geo.attributes.position.needsUpdate = true;
    }
  };
}

/** A ray: a flat body and a tail, gliding a slow figure-eight under the
 *  surface, wing tips flexing through the body's scale. */
function wlRay(parent, zone, count, rng) {
  const skin = wlMat(0x4a5a60, { rough: 0.7 });
  const g = wlUnit(parent, "ray", zone.x, zone.y - 3, zone.z);
  const body = wlBall(g, 1, 0, 0, 0, skin, 1.3, 0.12, 1);
  wlBox(g, 0.06, 0.05, 1.6, 0, 0, -1.6, skin);
  const rx = Math.max(8, zone.w * 0.25), rz = Math.max(5, zone.d * 0.2);
  return (t) => {
    const a = t * 0.15;
    const x = Math.sin(a) * rx, z = Math.sin(2 * a) * rz;
    const dx = Math.cos(a) * rx, dz = 2 * Math.cos(2 * a) * rz;
    g.position.set(zone.x + x, zone.y - 3 + Math.sin(t * 0.4) * 0.5, zone.z + z);
    g.rotation.y = Math.atan2(dx, dz);
    body.scale.x = 1.3 + Math.sin(t * 1.6) * 0.15;
  };
}

/** A kelp crab on a rock: body, two claws, the rock. Sidesteps, pauses. */
function wlCrab(parent, zone, count, rng) {
  const rock = wlMat(0x5c5a55, { rough: 0.95 }), shell = wlMat(0x8a5a2e, { rough: 0.6 });
  const g = wlUnit(parent, "crab", zone.x, zone.y, zone.z);
  wlBall(g, 0.9, 0, 0.1, 0, rock, 1.4, 0.6, 1.1);
  const crab = new THREE.Group();
  crab.position.set(0, 0.62, 0);
  g.add(crab);
  wlBox(crab, 0.22, 0.08, 0.18, 0, 0, 0, shell);
  wlBox(crab, 0.06, 0.04, 0.12, -0.12, 0, 0.12, shell);
  wlBox(crab, 0.06, 0.04, 0.12, 0.12, 0, 0.12, shell);
  return (t) => {
    const cyc = (t * 0.5) % 6;
    const step = cyc < 2 ? Math.sin(cyc * Math.PI / 2) * 0.5 : cyc < 4 ? 0.5 : 0.5 - Math.sin((cyc - 4) * Math.PI / 2) * 0.5;
    crab.position.x = -0.25 + step;
    crab.position.y = 0.62 + (cyc < 2 || cyc >= 4 ? Math.abs(Math.sin(t * 12)) * 0.01 : 0);
  };
}

const WILDLIFE_BUILDERS = { gulls: wlGulls, pelicans: wlPelicans, shorebirds: wlShorebirds, seals: wlSeals, fish: wlFish, ray: wlRay, crab: wlCrab };

/**
 * Build one wildlife group.
 *   parent  the world's root (or any group)
 *   o       { zone: { x, z, w, d, y }, kind, count, seed }
 * Returns { root, kind, count, meshCount, animate(t, dt) }. `root` and every
 * individual carry `userData.wildlife = { kind }`; a game counts a sighting
 * by traversing for that tag near the player.
 */
export function buildWildlife(parent, o = {}) {
  const kind = WILDLIFE_KINDS.includes(o.kind) ? o.kind : "gulls";
  const budget = WILDLIFE_BUDGET[kind];
  const count = Math.max(1, Math.min(budget.count, o.count ?? budget.count));
  const z = o.zone ?? {};
  const zone = { x: z.x ?? 0, z: z.z ?? 0, w: Math.max(4, z.w ?? 60), d: Math.max(4, z.d ?? 60), y: z.y ?? 0 };
  const root = new THREE.Group();
  root.name = `wildlife-${kind}`;
  root.userData.wildlife = { kind, count, at: [zone.x, zone.z] };
  parent.add(root);
  const rng = wlRng((o.seed ?? 11) * 131 + kind.length * 17 + Math.round(zone.x + zone.z));
  const step = WILDLIFE_BUILDERS[kind](root, zone, count, rng);
  let meshCount = 0;
  root.traverse((n) => { if (n.isMesh || n.isPoints) meshCount += 1; });
  step(0, 0);
  return {
    root, kind, count, meshCount,
    animate(t, dt = 0) { step(t, dt); },
  };
}

/** Count the wildlife groups within `radius` of a point, by kind — the
 *  sighting a Field Guide egg (bayworld/js/quests-data.js) is looking for. */
export function wlSightings(root, x, z, radius = 40) {
  const seen = {};
  root.traverse((n) => {
    const w = n.userData?.wildlife;
    if (!w?.at) return; // one per group (its zone centre), not per animal
    if (Math.hypot(w.at[0] - x, w.at[1] - z) <= radius) seen[w.kind] = (seen[w.kind] ?? 0) + 1;
  });
  return seen;
}
