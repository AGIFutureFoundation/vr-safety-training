import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, mat, decal, mergeStatic, hex } from "./kit.js";
import { facePaint, paintedMat, turfFace, roughFace, sandFace, cartPathFace, txTexture, txTurfStripeFace } from "./textures.js";
import { FAIRWAY_BOUNDS, FAIRWAY_HEIGHT_RANGE, FAIRWAY_HOLES, FAIRWAY_FACILITY, FAIRWAY_MESH_BUDGET, fairwayHeight, fairwayGreenAt, fairwayLieAt, seededRng, FAIRWAY_HALF_WIDTH, CART_HALF_WIDTH, TEE_RADIUS } from "./fairway-data.js";
export { FAIRWAY_BOUNDS, FAIRWAY_HEIGHT_RANGE, FAIRWAY_HOLES, FAIRWAY_FACILITY, FAIRWAY_MESH_BUDGET, fairwayHeight, fairwayGreenAt, fairwayLieAt };

// See fairway-data.js for the layout data and the pure lie/height functions;
// this module is the three.js builder over that data.

// ----------------------------------------------------------------- meshes
//
// Every builder below is authored the same way as shared/props.js's site
// dressing: `(parent, x, z, ...)`, metres, real proportions, y = 0 the
// ground — but these are not registered in PROPS_BUILDERS/PROPS_BUDGET,
// because they dress a district's OWN course rather than the horizon
// around a station (see props.js's header on that distinction).
/** A textured ribbon between two [x, z] points — the fairway turf between
 *  centreline waypoints, and the cart path beside it. Built directly in
 *  three.js (not kit.js's box/cyl) because neither of those is a plane
 *  between two arbitrary points; oriented with a parent group's yaw so the
 *  Euler math is one rotation, not a compound one. */
function ribbon(parent, a, b, width, key, painter, o = {}) {
  const [ax, az] = a, [bx, bz] = b;
  const dx = bx - ax, dz = bz - az;
  const len = Math.max(0.5, Math.hypot(dx, dz));
  const mx = (ax + bx) / 2, mz = (az + bz) / 2;
  const g = group(parent, mx, o.y ?? 0.02, mz, Math.atan2(-dx, -dz));
  const rep = o.repeat ?? Math.max(1, Math.round(len / 14));
  // A pattern-set surface (o.pattern) paints one canvas and tiles it per
  // segment; a named painter keeps facePaint()'s own key.
  const tex = o.pattern ? txTexture(o.pattern.id, { ...o.pattern, id: undefined, repeat: [1, rep] }) : facePaint(key, painter, { repeat: rep, px: o.px ?? 256 });
  const geo = new THREE.PlaneGeometry(width, len);
  const m = new THREE.Mesh(geo, paintedMat(tex, { rough: o.rough ?? 0.85, metal: o.metal ?? 0.02 }));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  g.add(m);
  return g;
}

/** A flat disc surface (green, bunker or water) at (x, z). */
function discSurface(parent, x, z, radius, colour, o = {}) {
  const d = cyl(parent, radius, radius, o.thickness ?? 0.05, x, o.y ?? 0.015, z, colour,
    { rough: o.rough ?? 0.85, metal: o.metal ?? 0.02, seg: o.seg ?? 24, cast: false });
  if (o.texKey) d.material = paintedMat(facePaint(o.texKey, o.painter, { repeat: o.repeat ?? 3, px: o.px ?? 256 }),
    { rough: o.rough ?? 0.85, metal: o.metal ?? 0.02 });
  return d;
}

function teeMarker(parent, x, z, ry = 0) {
  const g = group(parent, x, 0, z, ry);
  box(g, 1.4, 0.1, 1.0, 0, 0.05, 0, 0xd8c48a, { rough: 0.7, finish: "brushed" });
  ball(g, 0.08, -0.45, 0.13, 0, 0xf2c14b, { rough: 0.4, seg: 8, seg2: 6 });
  return g;
}

/** Pin, pole and a numbered flag — one decal doubles as the flag fabric and
 *  the number every "flags with numbered pins" spec point asks for. */
function flagPole(parent, x, z, number, accent = 0xd8232a) {
  const g = group(parent, x, 0, z);
  cyl(g, 0.022, 0.022, 2.3, 0, 1.15, 0, 0xd8dde3, { rough: 0.4, metal: 0.55, seg: 6, cast: false });
  decal(g, 0.5, 0.32, 0.27, 2.06, 0, (ctx, w, h) => {
    ctx.fillStyle = hex(accent); ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.round(h * 0.6)}px Arial, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(number), w / 2, h / 2 + 1);
  }, { px: 96 });
  return g;
}

function yardagePost(parent, x, z, colour = 0xf4f4f0) {
  return cyl(parent, 0.05, 0.06, 0.9, x, 0.45, z, colour, { rough: 0.6, seg: 8 });
}

function treeCluster(parent, x, z, seed) {
  const r = seededRng(seed);
  const g = group(parent, x, 0, z, r() * Math.PI * 2);
  const trunkH = 2.1 + r() * 1.5;
  cyl(g, 0.13, 0.19, trunkH, 0, trunkH / 2, 0, 0x5b4530, { rough: 0.9, finish: "brushed", seg: 8, cast: false });
  const canopies = [0x2f6b34, 0x39793d];
  for (let i = 0; i < 2; i++) {
    const rr = 1.5 + r() * 1.2;
    ball(g, rr, (r() - 0.5) * 1.5, trunkH + rr * 0.55 + i * 0.55, (r() - 0.5) * 1.5, canopies[i],
      { rough: 0.95, seg: 8, seg2: 6, cast: false });
  }
  return g;
}

function simpleBench(parent, x, z, ry = 0) {
  const g = group(parent, x, 0, z, ry);
  box(g, 1.6, 0.05, 0.4, 0, 0.42, 0, 0x6b4a30, { rough: 0.8, finish: "brushed" });
  box(g, 1.6, 0.5, 0.05, 0, 0.25, -0.18, 0x6b4a30, { rough: 0.8, finish: "brushed" });
  box(g, 1.6, 0.06, 0.42, 0, 0.18, 0, 0x2b2f33, { rough: 0.6, metal: 0.3 });
  return g;
}

function litterBin(parent, x, z) {
  const g = group(parent, x, 0, z);
  cyl(g, 0.28, 0.24, 0.7, 0, 0.35, 0, 0x2e6b3a, { rough: 0.6, seg: 10 });
  cyl(g, 0.3, 0.3, 0.05, 0, 0.72, 0, 0x22262b, { rough: 0.6, seg: 10, cast: false });
  return g;
}

function irrigationHead(parent, x, z) {
  return cyl(parent, 0.06, 0.07, 0.1, x, 0.05, z, 0x3a3f45, { rough: 0.6, seg: 8, cast: false });
}

function valveBox(parent, x, z) {
  return box(parent, 0.32, 0.08, 0.22, x, 0.04, z, 0x2e6b3a, { rough: 0.7, cast: false });
}

/** Pole, arms, three cups and a wind vane — a small weather-station mast for
 *  the maintenance yard, independent of the district's own mast light. */
function weatherMast(parent, x, z) {
  const g = group(parent, x, 0, z);
  cyl(g, 0.05, 0.07, 4.2, 0, 2.1, 0, 0xc9d0d6, { rough: 0.4, metal: 0.5, finish: "galvanised", seg: 10, cast: false });
  const cupArm = group(g, 0, 4.25, 0);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const arm = group(cupArm, 0, 0, 0, a);
    box(arm, 0.28, 0.02, 0.02, 0.14, 0, 0, 0xdedfd9, { rough: 0.5, cast: false });
    ball(arm, 0.06, 0.28, 0, 0, 0xdedfd9, { rough: 0.5, seg: 8, seg2: 6, cast: false });
  }
  const vane = group(g, 0, 3.85, 0);
  box(vane, 0.5, 0.02, 0.14, 0.2, 0, 0, 0xf2c14b, { rough: 0.5, cast: false });
  box(vane, 0.4, 0.04, 0.16, 0, 0, 0, 0x2b2f33, { rough: 0.6, cast: false });
  return g;
}

/** A clubhouse-style open shelter: floor, four posts, a pitched roof and a
 *  sign — a stop for shade and shelter, not a modelled building interior. */
function clubhouseShelter(parent, x, z, ry = 0) {
  const g = group(parent, x, 0, z, ry);
  box(g, 8, 0.1, 6, 0, 0.05, 0, 0xb9b29d, { rough: 0.85, finish: "concrete" });
  for (const [sx, sz] of [[-3.6, -2.6], [3.6, -2.6], [-3.6, 2.6], [3.6, 2.6]]) {
    box(g, 0.22, 3.0, 0.22, sx, 1.5, sz, 0x6b4a30, { rough: 0.8, finish: "brushed" });
  }
  box(g, 8.6, 0.14, 6.6, 0, 3.05, 0, 0x8b6a45, { rough: 0.75, finish: "brushed" }).rotation.z = 0.14;
  box(g, 8.6, 0.14, 6.6, 0, 3.35, 0, 0x8b6a45, { rough: 0.75, finish: "brushed" }).rotation.z = -0.14;
  decal(g, 2.2, 0.6, 0, 2.35, 3.02, (ctx, w, h) => {
    ctx.fillStyle = "#1a2e1c"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f4f4f0";
    ctx.font = `700 ${Math.round(h * 0.5)}px Arial, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("FAIRWAY PARK", w / 2, h / 2);
  }, { px: 512 });
  return g;
}

/** A rectangular hard-court surface with painted lines, textured with a
 *  simple line pattern baked into the same canvas as the surface tint. */
function courtSurface(parent, x, z, w, d, colour, lineColour, ry = 0) {
  const g = group(parent, x, 0, z, ry);
  const px = 256;
  const tex = facePaint(`court|${colour}|${w}x${d}`, (ctx, cw, ch) => {
    ctx.fillStyle = hex(colour); ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = hex(lineColour);
    ctx.lineWidth = Math.max(2, cw * 0.012);
    ctx.strokeRect(cw * 0.04, ch * 0.04, cw * 0.92, ch * 0.92);
    ctx.beginPath(); ctx.moveTo(cw * 0.5, ch * 0.04); ctx.lineTo(cw * 0.5, ch * 0.96); ctx.stroke();
  }, { px, repeat: 1 });
  const m = box(g, w, 0.06, d, 0, 0.03, 0, colour, { rough: 0.75, cast: false });
  m.material = paintedMat(tex, { rough: 0.7 });
  return g;
}

/** A stepped bleacher block. */
function bleachers(parent, x, z, w, rows, ry = 0) {
  const g = group(parent, x, 0, z, ry);
  const rowH = 0.42, rowD = 0.85;
  for (let i = 0; i < rows; i++) {
    box(g, w, rowH, rowD, 0, rowH * (i + 0.5), -rowD * i, 0x8b929a, { rough: 0.6, metal: 0.2 });
  }
  for (const sx of [-1, 1]) box(g, 0.16, rowH * rows + 0.3, rowD * rows, sx * (w / 2 - 0.1), rowH * rows / 2, -rowD * (rows - 1) / 2, 0x3a3f45, { rough: 0.5, metal: 0.4 });
  return g;
}

/** A goal frame: two posts and a crossbar. */
function goalFrame(parent, x, z, w, h, ry = 0) {
  const g = group(parent, x, 0, z, ry);
  for (const sx of [-1, 1]) box(g, 0.08, h, 0.08, sx * w / 2, h / 2, 0, 0xf4f4f0, { rough: 0.5, metal: 0.2 });
  box(g, w, 0.08, 0.08, 0, h, 0, 0xf4f4f0, { rough: 0.5, metal: 0.2 });
  return g;
}

/** A basketball hoop: backboard, rim and a raked post. */
function basketballHoop(parent, x, z, ry = 0) {
  const g = group(parent, x, 0, z, ry);
  cyl(g, 0.06, 0.08, 3.05, 0, 1.53, -1.2, 0x3a3f45, { rough: 0.6, metal: 0.4, seg: 10 });
  box(g, 1.05, 0.7, 0.05, 0, 3.05, 0, 0xe6eef4, { rough: 0.5, opacity: 0.85 });
  torus(g, 0.23, 0.02, 0, 2.9, 0.3, 0xd8232a, { rough: 0.5, metal: 0.3, seg: 8, seg2: 14 }).rotation.x = Math.PI / 2;
  return g;
}

/** A tennis net between two posts. */
function tennisNet(parent, x, z, w, ry = 0) {
  const g = group(parent, x, 0, z, ry);
  for (const sx of [-1, 1]) cyl(g, 0.03, 0.03, 1.07, sx * w / 2, 0.535, 0, 0x2b2f33, { rough: 0.6, metal: 0.4, seg: 8 });
  box(g, w, 0.9, 0.02, 0, 0.5, 0, 0xf4f4f0, { rough: 0.7, opacity: 0.6, cast: false });
  return g;
}

/** A small equipment shed / pump house: walls, roof, a door decal and a
 *  vent — the same shape at two sizes. */
function yardShed(parent, x, z, w, d, ry, label) {
  const g = group(parent, x, 0, z, ry);
  const h = Math.min(3.2, 2.2 + d * 0.08);
  box(g, w, h, d, 0, h / 2, 0, 0x8b929a, { rough: 0.6, metal: 0.15, finish: "painted" });
  box(g, w + 0.3, 0.14, d + 0.3, 0, h + 0.07, 0, 0x5c4a34, { rough: 0.7, finish: "brushed" });
  decal(g, Math.min(1.6, w * 0.5), Math.min(2.0, h * 0.85), 0, h * 0.42, d / 2 + 0.01, (ctx, cw, ch) => {
    ctx.fillStyle = "#3a3f45"; ctx.fillRect(0, 0, cw, ch);
    if (label) {
      ctx.fillStyle = "#dedfd9";
      ctx.font = `700 ${Math.round(ch * 0.1)}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(label, cw / 2, ch * 0.08);
    }
  }, { px: 256 });
  return g;
}

function fuelCabinet(parent, x, z, ry = 0) {
  const g = group(parent, x, 0, z, ry);
  box(g, 2, 1.2, 1.2, 0, 0.6, 0, 0xf0c02c, { rough: 0.6, finish: "painted" });
  box(g, 1.9, 0.9, 0.05, 0, 0.55, 0.61, 0x2b2f33, { rough: 0.7 });
  return g;
}

// ---------------------------------------------------------------- assembly

/** Everything that belongs to one hole: fairway ribbon(s), cart path, tee,
 *  flag, yardage posts, green, bunkers and water. */
function buildHole(parent, hole, opts) {
  const trees = opts.trees !== false;
  for (let i = 1; i < hole.fairway.length; i++) {
    ribbon(parent, hole.fairway[i - 1], hole.fairway[i], FAIRWAY_HALF_WIDTH * 2, "fairway-turf", turfFace,
      { pattern: { id: "turfStripe", a: 0x4a9a4c, b: 0x3f8a44, stripes: 10, seed: 31 } });
  }
  ribbon(parent, hole.cartPath[0], hole.cartPath[1], CART_HALF_WIDTH * 2, "cart-path", cartPathFace, { y: 0.018 });
  discSurface(parent, hole.green.centre[0], hole.green.centre[1], hole.green.radius, 0x4fae54,
    { texKey: "green-turf", painter: (g, w, h) => txTurfStripeFace(g, w, h, { stripes: 16, a: 0x54b258, b: 0x4aa04e, seed: 32 }) });
  for (const b of hole.bunkers) {
    discSurface(parent, b.centre[0], b.centre[1], b.radius, 0xd8c79a, { y: 0.01, texKey: "bunker-sand", painter: sandFace });
  }
  for (const w of hole.water) {
    discSurface(parent, w.centre[0], w.centre[1], w.radius, 0x123a4a, { y: 0.012, rough: 0.12, metal: 0.75 });
  }
  teeMarker(parent, hole.tee[0], hole.tee[1]);
  flagPole(parent, hole.pin[0], hole.pin[1], hole.number);
  // Two yardage posts along the fairway, at roughly a third and two-thirds
  // of the way from tee to green.
  for (const frac of [0.34, 0.68]) {
    const idx = Math.min(hole.fairway.length - 1, Math.max(1, Math.round(frac * (hole.fairway.length - 1))));
    const [ax, az] = hole.fairway[idx - 1], [bx, bz] = hole.fairway[idx];
    yardagePost(parent, ax + (bx - ax) * 0.5, az + (bz - az) * 0.5);
  }
  if (trees) {
    const r = seededRng(hole.number * 97 + 11);
    for (let i = 0; i < 3; i++) {
      const idx = Math.min(hole.fairway.length - 1, Math.floor(r() * hole.fairway.length));
      const [px, pz] = hole.fairway[idx];
      const side = r() < 0.5 ? -1 : 1;
      treeCluster(parent, px + side * (FAIRWAY_HALF_WIDTH + 6 + r() * 10), pz + (r() - 0.5) * 20, hole.number * 1000 + i);
    }
  }
}

function buildFacility(parent, opts) {
  const f = FAIRWAY_FACILITY;
  const [tx, tz] = f.track.centre;
  torus(parent, f.track.rx, f.track.laneWidth / 2 + 1, tx, 0.02, tz, 0x9a5a34, { rough: 0.85, seg: 8, seg2: 48 }).rotation.x = Math.PI / 2;
  const pitch = box(parent, f.pitch.w, 0.05, f.pitch.d, tx, 0.03, tz, 0x3f8a44, { rough: 0.85, cast: false });
  pitch.material = paintedMat(txTexture("turfStripe", { stripes: 12, seed: 33, repeat: 4 }), { rough: 0.8 });
  goalFrame(parent, tx, tz - f.pitch.d / 2 + 0.5, 7.3, 2.4);
  goalFrame(parent, tx, tz + f.pitch.d / 2 - 0.5, 7.3, 2.4, Math.PI);

  const bc = f.basketballCourt;
  courtSurface(parent, bc.centre[0], bc.centre[1], bc.w, bc.d, 0xc9a06a, 0xf4f4f0);
  basketballHoop(parent, bc.centre[0] - bc.w / 2 + 0.6, bc.centre[1], -Math.PI / 2);
  basketballHoop(parent, bc.centre[0] + bc.w / 2 - 0.6, bc.centre[1], Math.PI / 2);

  for (const tc of f.tennisCourts) {
    courtSurface(parent, tc.centre[0], tc.centre[1], tc.w, tc.d, 0x2e6b57, 0xf4f4f0);
    tennisNet(parent, tc.centre[0], tc.centre[1], tc.d);
  }

  bleachers(parent, f.bleachers.centre[0], f.bleachers.centre[1], f.bleachers.w, f.bleachers.rows);

  const y = f.maintenanceYard;
  yardShed(parent, y.equipmentShed.centre[0], y.equipmentShed.centre[1], y.equipmentShed.w, y.equipmentShed.d, 0, "EQUIPMENT");
  yardShed(parent, y.pumpHouse.centre[0], y.pumpHouse.centre[1], y.pumpHouse.w, y.pumpHouse.d, 0.3, "IRRIGATION PUMP");
  fuelCabinet(parent, y.fuelCabinet.centre[0], y.fuelCabinet.centre[1], 0.2);
  const yz = y.zone;
  const fenceY = 1.1;
  box(parent, yz.maxX - yz.minX, fenceY, 0.05, (yz.minX + yz.maxX) / 2, fenceY / 2, yz.minZ, 0xb9c0c6, { rough: 0.5, metal: 0.4, opacity: 0.7 });
  box(parent, yz.maxX - yz.minX, fenceY, 0.05, (yz.minX + yz.maxX) / 2, fenceY / 2, yz.maxZ, 0xb9c0c6, { rough: 0.5, metal: 0.4, opacity: 0.7 });
  box(parent, 0.05, fenceY, yz.maxZ - yz.minZ, yz.minX, fenceY / 2, (yz.minZ + yz.maxZ) / 2, 0xb9c0c6, { rough: 0.5, metal: 0.4, opacity: 0.7 });
  box(parent, 0.05, fenceY, yz.maxZ - yz.minZ, yz.maxX, fenceY / 2, (yz.minZ + yz.maxZ) / 2, 0xb9c0c6, { rough: 0.5, metal: 0.4, opacity: 0.7 });

  weatherMast(parent, f.weatherMast.centre[0], f.weatherMast.centre[1]);
  if (opts.detail !== "low") {
    litterBin(parent, bc.centre[0], bc.centre[1] - bc.d / 2 - 1.2);
    simpleBench(parent, tx - f.track.rx - 3, tz);
  }
}

/** A single flat ground slab textured with roughFace, optionally height-
 *  displaced. Vertex displacement is guarded: the headless content checkers
 *  run against a stub three.js with no real BufferAttribute API (see
 *  tools/lib/headless.mjs), so this checks for that API before touching it —
 *  the same defensive pattern kit.js's surface() and mergeStatic() use — and
 *  simply builds a flat mesh there instead of throwing. */
function buildTerrain(cx, cz, w, d, opts) {
  const geo = new THREE.PlaneGeometry(w, d, Math.min(48, Math.round(w / 12)), Math.min(48, Math.round(d / 12)));
  const pos = geo.attributes?.position;
  if (pos && typeof pos.setZ === "function" && typeof pos.getX === "function") {
    for (let i = 0; i < pos.count; i++) {
      const localX = pos.getX(i), localY = pos.getY(i);
      pos.setZ(i, fairwayHeight(cx + localX, cz + localY) * 0.5);
    }
    pos.needsUpdate = true;
    if (typeof geo.computeVertexNormals === "function") geo.computeVertexNormals();
  }
  const tex = facePaint("fairway-rough-ground", roughFace, { repeat: Math.max(4, Math.round(Math.max(w, d) / 40)), px: 512 });
  const mesh = new THREE.Mesh(geo, paintedMat(tex, { rough: 0.92, metal: 0.02 }));
  // Rotated on the MESH, not baked into the geometry with geo.rotateX(): a
  // content checker that reads a flat floor's footprint off `mesh.rotation`
  // (tools/check_districts.mjs's extents()/solids(), the same convention
  // citykit.js's floorPaint() and every other ground plane in this codebase
  // already follows) would otherwise see an unrotated width×height slab and
  // mistake this floor for a wall the height of the whole terrain.
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(cx, 0, cz);
  mesh.receiveShadow = true;
  return mesh;
}

/** The full course: nine holes, the sports facility, and the district
 *  furniture (benches, bins, irrigation heads, valve boxes) scattered
 *  across it. LOD 0 — documented budget FAIRWAY_MESH_BUDGET.high. */
function buildCourse(parent, opts) {
  const { minX, maxX, minZ, maxZ } = FAIRWAY_BOUNDS;
  const w = maxX - minX, d = maxZ - minZ, cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  parent.add(buildTerrain(cx, cz, w, d, opts));

  for (const hole of FAIRWAY_HOLES) buildHole(parent, hole, opts);
  buildFacility(parent, opts);
  clubhouseShelter(parent, -40, -34, 0);

  // District furniture spread across the fairways: irrigation heads near
  // every green, valve boxes near every tee, a handful of benches and bins
  // along the cart paths.
  const r = seededRng(4242);
  for (const hole of FAIRWAY_HOLES) {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + r();
      irrigationHead(parent, hole.green.centre[0] + Math.cos(a) * (hole.green.radius + 2), hole.green.centre[1] + Math.sin(a) * (hole.green.radius + 2));
    }
    valveBox(parent, hole.tee[0] + 3, hole.tee[1] + 1.5);
    if (hole.number % 3 === 0) {
      const mid = hole.cartPath[0];
      simpleBench(parent, mid[0] + 2.5, mid[1] + 6);
      litterBin(parent, mid[0] + 2.0, mid[1] + 8);
    }
  }
  return {};
}

/** A compact clubhouse-and-first-tee vignette near the world origin,
 *  independent of the FAIRWAY_HOLES layout, sized for the shared SmartCiti.X
 *  stage's own scenic-district budget (SCENIC_BUDGET, see
 *  smartcity/js/districts.js). Keeps the origin (and the walk from the
 *  spawn to it) clear, the same convention every scenic district's own
 *  station pad relies on. */
function buildPreview(parent, opts) {
  parent.add(buildTerrain(0, 4, 90, 70, opts));
  ribbon(parent, [10, -20], [10, 24], 5.0, "cart-path", cartPathFace, { y: 0.018 });
  clubhouseShelter(parent, -18, 8, 0.35);
  teeMarker(parent, 12, -12, -0.2);
  discSurface(parent, 16, 6, 7, 0x4fae54, { texKey: "green-turf-preview", painter: (g, w, h) => txTurfStripeFace(g, w, h, { stripes: 12, a: 0x54b258, b: 0x4aa04e, seed: 32 }) });
  discSurface(parent, 24, 3, 3.4, 0xd8c79a, { y: 0.01, texKey: "bunker-sand", painter: sandFace });
  flagPole(parent, 16, 6, 1);
  const r = seededRng(7);
  for (let i = 0; i < 4; i++) {
    const a = 0.6 + i * 1.4;
    treeCluster(parent, -12 + Math.cos(a) * 16, 14 + Math.sin(a) * 12, 300 + i);
  }
  simpleBench(parent, -8, -6, 0.5);
  litterBin(parent, -6, -8);
  return {};
}

/**
 * Build Fairway Park.
 *   parent  a group (or scene) to build into
 *   opts    { detail: "low" | "high" (default "high") }
 * Returns { meshCount, animate(t, dt) }. `meshCount` is the authored count
 * before mergeStatic() (see FAIRWAY_MESH_BUDGET's doc); `animate` is a
 * no-op placeholder today (nothing here moves per frame yet) kept so a
 * caller wiring this into a district's own animate loop — see
 * smartcity/js/districts.js — never has to special-case "this build
 * returned nothing".
 */
export function buildFairwayPark(parent, opts = {}) {
  const detail = opts.detail === "low" ? "low" : "high";
  const hemi = new THREE.HemisphereLight(0xdcefe0, 0x3a4a2c, 1.1);
  parent.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff6e8, 1.0);
  sun.position.set(60, 90, 40);
  parent.add(sun);

  if (detail === "low") buildPreview(parent, opts);
  else buildCourse(parent, opts);

  let meshCount = 0;
  parent.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) meshCount += 1; });
  const merged = mergeStatic(parent);

  return {
    detail,
    meshCount,
    merged,
    animate() {},
  };
}
