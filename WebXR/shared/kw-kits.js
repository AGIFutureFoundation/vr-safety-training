import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball } from "./kit.js";
import { kwPlacements, KW_DRESS_BUDGET } from "./kw-place.js";

// KREWE — the parish kits (docs/consoles/KREWE.md): a streetcar, a pump station house with its
// discharge pipes, a floodwall section and a floodgate, a shrimp boat and an oyster lugger, a
// shotgun-house block, a live oak with root buttresses, a bandstand, a parade barrier run and a
// ferry landing. All procedural, nothing imported, nothing modelled on a real building or boat:
// generic district character.
//
// Same contract as shared/fleet.js and shared/props.js: `(parent, x, y, z, opts)`, metres, front
// (or bow) toward +Z, footprint centred, y = 0 the ground (or the waterline for a hull), a baked
// static group (`userData.fleetBake`) so mergeStatic() leaves one mesh per material. KW_BUDGET
// declares each builder's mesh count and footprint; tools/check_fleet.mjs (this file is one of
// its kits) and tools/check_krewe.mjs hold every builder to it.
//
// In a parish the kits are not built one by one: kwDressParish() bakes each builder once into a
// single vertex-coloured geometry and draws every placement of that kit as one InstancedMesh, so
// the whole dressing of a parish costs at most one draw call per kit (KW_DRESS_BUDGET).
// Names prefixed kw/KW_ (one bundle scope).

const KW_C = {
  green: 0x2f6b3a, glass: 0x28323a, roof: 0x8a8d90, black: 0x26282b, red: 0x9c2b25, cream: 0xe9e0c8,
  brick: 0xa0563f, concrete: 0xb8b4a8, dark: 0x55575a, steel: 0x7d848b, gate: 0xc9a227, white: 0xf1f1ee,
  hull: 0x3b5f7a, hullLow: 0x7a2e2a, deck: 0x9c8466, wood: 0x6f5238, bark: 0x5a4636, leaf: 0x3b6a33, leafB: 0x2f5a2a,
  rail: 0x9aa0a6, orange: 0xd9772b, pile: 0x6b5a44,
};
const KW_SEG = { seg: 8 };

/** A baked root in the fleet contract. */
function kwRoot(parent, x, y, z, opts, kind) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = opts.ry ?? 0;
  g.name = kind;
  g.userData.fleetBake = true;
  g.userData.parts = {};
  parent?.add(g);
  return g;
}
/** An inner group shifted by (ox, oz), so a kit authored off its natural origin still measures centred. */
function kwShift(g, ox, oz) { const inner = new THREE.Group(); inner.position.set(ox, 0, oz); g.add(inner); return inner; }

/** Streetcar: a single car on two trucks with a trolley pole (front toward +Z). */
export function kwStreetcar(parent, x, y, z, opts = {}) {
  const g = kwRoot(parent, x, y, z, opts, "kwStreetcar");
  const L = 14;
  box(g, 2.6, 2.1, L, 0, 1.75, 0, KW_C.green);
  box(g, 2.64, 0.85, L - 1.2, 0, 2.2, 0, KW_C.glass);
  box(g, 2.3, 0.4, L - 0.6, 0, 3.0, 0, KW_C.roof);
  box(g, 1.2, 0.3, L - 4, 0, 3.35, 0, KW_C.roof);
  box(g, 2.66, 0.18, L, 0, 1.1, 0, KW_C.red);
  for (const s of [1, -1]) box(g, 2.2, 0.55, 2.6, 0, 0.35, s * 4.4, KW_C.black);
  const pole = box(g, 0.08, 0.08, 4.2, 0, 4.1, -2.2, KW_C.black);
  pole.rotation.x = 0.28;
  return g;
}

/** Pump station house with its discharge pipes running out and down toward the levee (+Z). */
export function kwPumpHouse(parent, x, y, z, opts = {}) {
  const g = kwRoot(parent, x, y, z, opts, "kwPumpHouse");
  const hz = -5.2;
  box(g, 12, 7, 9, 0, 3.5, hz, KW_C.brick);
  box(g, 12.6, 0.5, 9.6, 0, 7.25, hz, KW_C.concrete);
  box(g, 2.4, 3.2, 0.2, -3, 1.6, hz + 4.55, KW_C.dark);
  for (const px of [-1, 3]) box(g, 1.6, 1.4, 0.15, px + 1, 4.8, hz + 4.55, KW_C.glass);
  for (const px of [-3.5, 0, 3.5]) {
    const run = cyl(g, 0.55, 0.55, 10, px, 5.2, 4.8, KW_C.steel, KW_SEG);
    run.rotation.x = Math.PI / 2;
    cyl(g, 0.55, 0.55, 4.8, px, 2.8, 9.8, KW_C.steel, KW_SEG);
    box(g, 1.6, 0.4, 1.6, px, 0.2, 9.8, KW_C.concrete);
  }
  return g;
}

/** A floodwall section: a thin concrete wall on its footing, a joint at each end (length along Z). */
export function kwLeveeWall(parent, x, y, z, opts = {}) {
  const g = kwRoot(parent, x, y, z, opts, "kwLeveeWall");
  box(g, 2.4, 0.4, 12, 0, 0.2, 0, KW_C.concrete);
  box(g, 0.6, 3.2, 12, 0, 2.0, 0, KW_C.concrete);
  for (const s of [1, -1]) box(g, 0.66, 3.2, 0.12, 0, 2.0, s * 5.94, KW_C.dark);
  box(g, 0.7, 0.12, 12, 0, 3.66, 0, KW_C.dark);
  return g;
}

/** A floodgate: two piers, a head beam, a swing leaf and its hand wheel (the opening along Z). */
export function kwFloodgate(parent, x, y, z, opts = {}) {
  const g = kwRoot(parent, x, y, z, opts, "kwFloodgate");
  for (const s of [1, -1]) box(g, 1.4, 5, 1.4, 0, 2.5, s * 5.3, KW_C.concrete);
  box(g, 1.4, 0.8, 12, 0, 5.4, 0, KW_C.concrete);
  const leaf = new THREE.Group(); leaf.name = "leaf"; leaf.position.set(0, 0, -4.6); g.add(leaf);
  box(leaf, 0.45, 3.4, 9.2, 0, 1.9, 4.6, KW_C.gate);
  for (let i = 0; i < 3; i++) box(leaf, 0.55, 0.18, 9.2, 0, 0.8 + i * 1.1, 4.6, KW_C.dark);
  const wheel = cyl(g, 0.5, 0.5, 0.1, 0.8, 1.4, 5.3, KW_C.red, KW_SEG);
  wheel.rotation.z = Math.PI / 2;
  box(g, 0.3, 0.08, 10.6, 0, 0.04, 0, KW_C.steel);
  g.userData.parts.leaf = leaf;
  return g;
}

/** A shrimp boat: a white-and-blue hull, a forward wheelhouse, a mast with two outrigger booms. */
export function kwShrimpBoat(parent, x, y, z, opts = {}) {
  const g = kwRoot(parent, x, y, z, opts, "kwShrimpBoat");
  box(g, 3.6, 1.0, 11, 0, 0.5, -0.8, KW_C.hullLow);
  box(g, 3.6, 0.9, 11, 0, 1.45, -0.8, KW_C.white);
  const bow = box(g, 2.5, 1.9, 2.5, 0, 0.95, 4.7, KW_C.white);
  bow.rotation.y = Math.PI / 4;
  box(g, 3.4, 0.12, 10.6, 0, 1.94, -0.8, KW_C.deck);
  box(g, 2.6, 2.0, 2.8, 0, 3.0, 2.4, KW_C.white);
  box(g, 2.66, 0.6, 2.4, 0, 3.4, 2.4, KW_C.glass);
  cyl(g, 0.12, 0.14, 7, 0, 5.45, 0.2, KW_C.steel, { seg: 6 });
  for (const s of [1, -1]) {
    const boom = cyl(g, 0.07, 0.09, 6.4, s * 2.9, 5.0, 0.2, KW_C.steel, { seg: 6 });
    boom.rotation.z = s * 1.0;
    box(g, 0.6, 1.2, 1.2, s * 5.2, 3.0, 0.2, KW_C.dark);
  }
  box(g, 2.8, 0.9, 2.2, 0, 2.45, -4.6, KW_C.dark);
  return g;
}

/** An oyster lugger: a broad low hull, a wide open deck for sacks, a wheelhouse aft. */
export function kwOysterLugger(parent, x, y, z, opts = {}) {
  const root = kwRoot(parent, x, y, z, opts, "kwOysterLugger"), g = kwShift(root, 0, -0.65);
  box(g, 4.4, 1.1, 11, 0, 0.55, -0.4, KW_C.hull);
  const bow = box(g, 3.1, 1.1, 3.1, 0, 0.55, 5.0, KW_C.hull);
  bow.rotation.y = Math.PI / 4;
  box(g, 4.2, 0.12, 11, 0, 1.16, -0.4, KW_C.deck);
  for (const s of [1, -1]) box(g, 0.12, 0.5, 10, s * 2.14, 1.45, -0.4, KW_C.white);
  box(g, 3.0, 2.2, 2.6, 0, 2.3, -4.3, KW_C.white);
  box(g, 3.06, 0.6, 2.2, 0, 2.8, -4.3, KW_C.glass);
  for (let i = 0; i < 4; i++) box(g, 0.9, 0.5, 0.7, -1.2 + (i % 2) * 2.4, 1.47, 1.2 + Math.floor(i / 2) * 1.4, KW_C.pile);
  cyl(g, 0.1, 0.12, 4.2, 0, 3.3, 0.2, KW_C.steel, { seg: 6 });
  return root;
}

/** A shotgun-house block: four narrow single-storey houses side by side, gable to the street (+Z), each with a front porch. */
export function kwShotgunBlock(parent, x, y, z, opts = {}) {
  const g = kwRoot(parent, x, y, z, opts, "kwShotgunBlock");
  const paint = [0xd9c27a, 0x9fc3c9, 0xe0a3a0, 0xb9d39a];
  const W = 4.2, gap = 1.6, n = 4;
  for (let i = 0; i < n; i++) {
    const hx = -((n - 1) * (W + gap)) / 2 + i * (W + gap);
    box(g, W, 1.0, 14, hx, 0.5, -0.6, KW_C.concrete);
    box(g, W, 3.4, 14, hx, 2.7, -0.6, paint[i]);
    for (const s of [1, -1]) {
      const r = box(g, W * 0.62, 0.18, 14.4, hx + s * W * 0.26, 5.0, -0.6, KW_C.roof);
      r.rotation.z = -s * 0.55;
    }
    box(g, W, 0.2, 1.8, hx, 1.1, 7.2, KW_C.wood);
    for (const s of [1, -1]) box(g, 0.14, 2.6, 0.14, hx + s * (W / 2 - 0.2), 2.4, 7.9, KW_C.white);
    box(g, 1.1, 2.2, 0.1, hx - 0.9, 2.3, 6.42, KW_C.dark);
  }
  return g;
}

/** A live oak: a short trunk on flaring root buttresses, long low limbs and a broad flattened crown. */
export function kwLiveOak(parent, x, y, z, opts = {}) {
  const g = kwRoot(parent, x, y, z, opts, "kwLiveOak");
  cyl(g, 0.55, 0.85, 3.4, 0, 1.7, 0, KW_C.bark, { seg: 7 });
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + 0.4;
    const r = box(g, 0.5, 0.7, 2.0, Math.sin(a) * 0.9, 0.7, Math.cos(a) * 0.9, KW_C.bark);
    r.rotation.order = "YXZ"; r.rotation.y = a; r.rotation.x = 0.35;
  }
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.3;
    const limb = box(g, 0.45, 0.45, 5.2, Math.sin(a) * 2.4, 3.8, Math.cos(a) * 2.4, KW_C.bark);
    limb.rotation.order = "YXZ"; limb.rotation.y = a; limb.rotation.x = -0.3;
  }
  const crown = [[0, 6.2, 0, 5.6], [3.4, 5.6, 1.6, 3.6], [-2.8, 5.8, -2.4, 3.8], [-1.2, 5.4, 3.4, 3.2]];
  for (const [cx, cy, cz, r] of crown) {
    const c = ball(g, r, cx, cy, cz, cx === 0 ? KW_C.leaf : KW_C.leafB, { seg: 7, seg2: 5 });
    c.scale.set(1.25, 0.5, 1.25);
  }
  return g;
}

/** A bandstand: a raised octagonal deck, eight posts, a low railing and a pointed roof. */
export function kwBandstand(parent, x, y, z, opts = {}) {
  const g = kwRoot(parent, x, y, z, opts, "kwBandstand");
  cyl(g, 5, 5.2, 1.2, 0, 0.6, 0, KW_C.concrete, KW_SEG);
  cyl(g, 4.9, 4.9, 0.15, 0, 1.27, 0, KW_C.wood, KW_SEG);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + Math.PI / 8;
    cyl(g, 0.14, 0.14, 3.4, Math.sin(a) * 4.5, 3.0, Math.cos(a) * 4.5, KW_C.white, { seg: 6 });
  }
  cyl(g, 4.6, 4.6, 0.12, 0, 2.3, 0, KW_C.white, { ...KW_SEG, open: true });
  cyl(g, 0.3, 5.6, 2.4, 0, 5.9, 0, KW_C.red, KW_SEG);
  box(g, 2.4, 0.6, 1.6, 0, 0.3, 5.6, KW_C.concrete);
  return g;
}

/** A parade barrier run: six interlocking steel crowd barriers in a line (along X), on flat feet. */
export function kwParadeBarriers(parent, x, y, z, opts = {}) {
  const g = kwRoot(parent, x, y, z, opts, "kwParadeBarriers");
  const n = 6, P = 2.3;
  for (let i = 0; i < n; i++) {
    const px = -((n - 1) * P) / 2 + i * P;
    box(g, P - 0.1, 0.06, 0.06, px, 1.1, 0, KW_C.rail);
    box(g, P - 0.1, 0.06, 0.06, px, 0.25, 0, KW_C.rail);
    box(g, P - 0.3, 0.8, 0.02, px, 0.68, 0, KW_C.steel);
    for (const s of [1, -1]) box(g, 0.08, 0.06, 0.7, px + s * (P / 2 - 0.2), 0.03, 0, KW_C.dark);
  }
  box(g, 1.6, 0.3, 0.03, 0, 0.8, 0.04, KW_C.orange);
  return g;
}

/** A ferry landing: an apron ramp down to the water (+Z), two pile dolphins, a waiting shelter and bollards. */
export function kwFerryLanding(parent, x, y, z, opts = {}) {
  const root = kwRoot(parent, x, y, z, opts, "kwFerryLanding"), g = kwShift(root, 1.08, 0.1);
  box(g, 9, 0.6, 8, 0, 0.3, -4, KW_C.concrete);
  const ramp = box(g, 7, 0.4, 8, 0, 0.5, 3.8, KW_C.steel);
  ramp.rotation.x = 0.06;
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) cyl(g, 0.3, 0.3, 3.2, s * (5.4 + (i === 2 ? 0.55 : 0)), 1.6, 6.2 + (i === 1 ? 0.6 : 0), KW_C.pile, { seg: 6 });
    cyl(g, 0.2, 0.25, 0.6, s * 4.0, 0.9, -1.0, KW_C.dark, { seg: 6 });
  }
  for (const [sx, sz] of [[-2.2, -6.8], [2.2, -6.8], [-2.2, -4.6], [2.2, -4.6]]) box(g, 0.14, 2.6, 0.14, sx - 5.8, 1.9, sz, KW_C.white);
  box(g, 5.2, 0.2, 3.0, -5.8, 3.3, -5.7, KW_C.roof);
  box(g, 3.6, 0.5, 0.5, -5.8, 0.85, -5.7, KW_C.wood);
  return root;
}

/**
 * The kits and what each costs: meshes after mergeStatic(), footprint [W, H, L] in metres
 * (measured with `node tools/check_fleet.mjs --measure`), and triangles as drawn in a parish
 * (tools/check_krewe.mjs measures them from the builder's own geometry parameters).
 */
export const KW_BUDGET = {
  streetcar: { build: "kwStreetcar", meshes: 5, footprint: [2.66, 4.64, 14], tri: 96 },
  pumpHouse: { build: "kwPumpHouse", meshes: 5, footprint: [12.6, 7.5, 20.6], tri: 288 },
  leveeWall: { build: "kwLeveeWall", meshes: 2, footprint: [2.4, 3.72, 12], tri: 60 },
  floodgate: { build: "kwFloodgate", meshes: 5, footprint: [1.55, 5.8, 12], tri: 128, parts: ["leaf"] },
  shrimpBoat: { build: "kwShrimpBoat", meshes: 6, footprint: [11.28, 8.95, 12.77], tri: 180 },
  oysterLugger: { build: "kwOysterLugger", meshes: 6, footprint: [4.4, 5.4, 13.09], tri: 156 },
  shotgunBlock: { build: "kwShotgunBlock", meshes: 9, footprint: [21.9, 5.76, 15.9], tri: 384 },
  liveOak: { build: "kwLiveOak", meshes: 3, footprint: [15.45, 9, 14.55], tri: 336 },
  bandstand: { build: "kwBandstand", meshes: 4, footprint: [11.2, 7.1, 12], tri: 316 },
  paradeBarriers: { build: "kwParadeBarriers", meshes: 4, footprint: [13.7, 1.13, 0.7], tri: 372 },
  ferryLanding: { build: "kwFerryLanding", meshes: 7, footprint: [14.65, 3.4, 15.8], tri: 288 },
};

export const KW_KIT_BUILDERS = {
  kwStreetcar, kwPumpHouse, kwLeveeWall, kwFloodgate, kwShrimpBoat, kwOysterLugger,
  kwShotgunBlock, kwLiveOak, kwBandstand, kwParadeBarriers, kwFerryLanding,
};

// ------------------------------------------------------------------ baking and dressing a parish

/**
 * Bake one builder into a single non-indexed geometry with the material colours as vertex
 * colours (the parish engine's own convention, np-world.js's npMerge). `three` is the caller's
 * three.js module.
 */
export function kwBakeKit(three, build) {
  const tmp = new three.Group();
  const g = KW_KIT_BUILDERS[build](tmp, 0, 0, 0, {});
  tmp.updateMatrixWorld(true);
  const parts = [];
  g.traverse((o) => { if (o.isMesh && o.geometry) parts.push(o); });
  const polys = parts.map((m) => { const geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone(); geo.applyMatrix4(m.matrixWorld); return [geo, m.material?.color ?? new three.Color(0xcccccc)]; });
  const total = polys.reduce((s, [geo]) => s + geo.attributes.position.count, 0);
  const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  for (const [geo, c] of polys) {
    pos.set(geo.attributes.position.array, o * 3);
    for (let i = 0; i < geo.attributes.position.count; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
    o += geo.attributes.position.count;
    geo.dispose();
  }
  const out = new three.BufferGeometry();
  out.setAttribute("position", new three.BufferAttribute(pos, 3));
  out.setAttribute("color", new three.BufferAttribute(col, 3));
  out.computeVertexNormals();
  out.computeBoundingSphere();
  return out;
}

/**
 * Dress a parish with the kits: kwPlacements() (pure, kw-place.js) decides where by district
 * character and site kind; each kit becomes one InstancedMesh. Returns
 * `{ group, meshes, spots, stats() }`. `opts.tier` ("low" | "balanced" | "high") trims the list.
 */
export function kwDressParish(root, three, parish, opts = {}) {
  const spots = kwPlacements(parish, { tier: opts.tier ?? "high" });
  const group = new three.Group(); group.name = "kw-dressing";
  const material = new three.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const byKit = {};
  for (const s of spots) (byKit[s.kit] ??= []).push(s);
  const meshes = [];
  const m4 = new three.Matrix4(), q = new three.Quaternion(), up = new three.Vector3(0, 1, 0), one = new three.Vector3(1, 1, 1), p = new three.Vector3();
  for (const [kit, list] of Object.entries(byKit)) {
    const spec = KW_BUDGET[kit];
    if (!spec) continue;
    const im = new three.InstancedMesh(kwBakeKit(three, spec.build), material, list.length);
    list.forEach((s, i) => { q.setFromAxisAngle(up, s.ry ?? 0); m4.compose(p.set(s.x, s.y, s.z), q, s.scale ? new three.Vector3(s.scale, s.scale, s.scale) : one); im.setMatrixAt(i, m4); });
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere?.();
    im.name = `kw-${kit}`;
    group.add(im); meshes.push(im);
  }
  root.add(group);
  function stats() {
    let triangles = 0;
    for (const m of meshes) triangles += (m.geometry.attributes.position.count / 3) * m.count;
    return { drawCalls: meshes.length, triangles: Math.round(triangles), placements: spots.length, budget: KW_DRESS_BUDGET };
  }
  return { group, meshes, spots, stats };
}
