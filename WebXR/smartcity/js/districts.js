import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, hose, decal, repaint, mat, particles } from "../../shared/kit.js";
import {
  CITY, surfaceTexture, texturedMat, waterFace, mudflatFace, paintedSteelFace, roadwayFace, deckPlateFace,
  siltFace, causticFace, growthFace, hullFace, fogPuffFace, glowFace, pavingFace,
} from "./citykit.js";
import { PROPS_BUILDERS } from "../../shared/props.js";

// Districts: the part of the VR / flat-screen stage that changes with the
// station's trade category. The plaza, marquee and skyline are shared; a
// district adds the horizon a worker in that trade would actually see —
// transmission pylons behind a substation, a container terminal behind a
// lashing deck, a truss arch behind a company switch — plus the sky, fog
// and light-mast tint that go with it. Everything is built from the shared
// kit at twenty to sixty meshes a district, placed in the ring between the
// plaza edge (r ≈ 15) and the skyline (r ≈ 34+), so nothing crowds the
// station and nothing costs a headset frame. Animations are property tweaks
// on already-built materials and groups: no per-frame allocation.

/** Give a mesh its own material so it can pulse without dragging every
 *  cached sibling with it; disposeTree() frees the clone. */
function own(mesh) {
  mesh.material = mesh.material.clone();
  mesh.material.userData.ownMaterial = true;
  return mesh;
}

/** A thin bar between two points (wires, cables, guys). */
function span(g, a, b, r = 0.03, color = 0x4a5561) {
  const [x1, y1, z1] = a, [x2, y2, z2] = b;
  const len = Math.hypot(x2 - x1, y2 - y1, z2 - z1);
  const m = box(g, r, r, len, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2, color, { rough: 0.5, metal: 0.4, cast: false, receive: false });
  m.lookAt(new THREE.Vector3(x2, y2, z2));
  return m;
}

/** Transmission pylon: four splayed legs, three crossarms with insulators, a top beacon. */
function pylon(g, x, z, h = 14, ry = 0) {
  const t = group(g, x, -1.5, z, ry);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = cyl(t, 0.07, 0.16, h, sx * 1.2, h / 2, sz * 1.2, 0x8b98a5, { rough: 0.6, metal: 0.6, seg: 6, cast: false, receive: false });
    leg.rotation.z = -sx * 0.07; leg.rotation.x = sz * 0.07;
  }
  const arms = [];
  for (const [y, w] of [[h * 0.6, 6.4], [h * 0.76, 5.4], [h * 0.9, 4.2]]) {
    box(t, w, 0.16, 0.16, 0, y, 0, 0x8b98a5, { rough: 0.6, metal: 0.6, cast: false, receive: false });
    for (const sx of [-1, 1]) {
      cyl(t, 0.05, 0.05, 0.9, sx * w / 2, y - 0.5, 0, 0xc9d6df, { rough: 0.3, seg: 6, cast: false, receive: false });
      arms.push([x + Math.cos(ry) * sx * w / 2, y - 1.0 - 1.5, z - Math.sin(ry) * sx * w / 2]);
    }
  }
  ball(t, 0.12, 0, h + 0.1, 0, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.6, cast: false, seg: 8, seg2: 6 });
  return arms;
}

/** A floodlight over a district so its structures read against the sky:
 *  a dim directional light aimed at the plaza from above the district, so
 *  the faces that look back at the learner are lit. Directional because a
 *  point light under physically-based falloff is black twenty metres out. */
function flood(g, x, y, z, color = 0xdfeaf2, intensity = 1.1) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(x, y, z);
  g.add(l);
  g.add(l.target);
  return l;
}

/** Night structures carry a little of their own light (sodium wash, deck
 *  lights, safety lighting); a faint self-glow on every unlit district mesh
 *  keeps the silhouettes legible at any exposure without a light per prop. */
export function selfLight(root, ei = 0.22) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material?.emissive || o.material.emissiveIntensity > 0.5 && o.material.emissive.getHex() !== 0) return;
    if (o.material.emissive.getHex() !== 0) return;
    o.material = o.material.clone();
    o.material.userData.ownMaterial = true;
    o.material.emissive.copy(o.material.color);
    o.material.emissiveIntensity = ei;
  });
}

/**
 * Dress a district's own horizon and edges with props from the shared kit
 * (shared/props.js), after the district builds itself. A `dressing` entry is
 * `{ prop, x, z, y, ry, opts, lit }`: `prop` names a PROPS_BUILDERS key, `lit`
 * (true or a number) scales that prop's own `opts.lit` by the current
 * time-of-day mast multiplier, so a light mast reads as switched on at night
 * and barely on by day like every other mast in the scene. This never runs on
 * a station's own working area — a station never calls it, only stage.js
 * does, on the district group, after the district's own build. See
 * districtFor()'s `dressing` field on each entry in DISTRICTS below.
 */
export function dressDistrict(g, list, tod) {
  if (!list) return;
  for (const d of list) {
    const fn = PROPS_BUILDERS[d.prop];
    if (!fn) continue;
    const opts = { ry: d.ry ?? 0, ...(d.opts ?? {}) };
    if (d.lit) opts.lit = (typeof d.lit === "number" ? d.lit : 1.6) * (tod?.mast ?? 1);
    fn(g, d.x, d.y ?? 0, d.z, opts);
  }
}

/** Still water to the horizon, under the skyline and the plaza edge. */
function water(g, color = 0x0a1a26) {
  const w = cyl(g, 64, 64, 0.1, 0, -0.55, 0, color, { rough: 0.22, metal: 0.7, seg: 48, cast: false });
  w.receiveShadow = false;
  return w;
}

/** Ship-to-shore gantry crane silhouette: portal legs, sill beams, boom over the water. */
function gantry(g, x, z, ry = 0) {
  const c = group(g, x, -1.5, z, ry);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(c, 0.22, 0.28, 16, sx * 3, 8, sz * 2.2, 0x6b7885, { rough: 0.55, metal: 0.6, seg: 8, cast: false, receive: false });
  box(c, 7, 0.5, 5, 0, 16, 0, 0x6b7885, { rough: 0.55, metal: 0.6, cast: false, receive: false });
  const boom = box(c, 1.0, 0.8, 24, 0, 17.6, -6, 0x75828f, { rough: 0.55, metal: 0.6, cast: false, receive: false });
  boom.rotation.x = -0.12;
  box(c, 2.4, 2.2, 2.4, 0, 14.6, 3.5, 0x4a5561, { rough: 0.6, metal: 0.4, cast: false, receive: false });
  cyl(c, 0.12, 0.12, 8, 0, 21, -2, 0x6b7885, { rough: 0.55, metal: 0.6, seg: 6, cast: false, receive: false });
  own(ball(c, 0.16, 0, 25, -2, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.5, cast: false, seg: 8, seg2: 6 }));
  return c;
}

const BOX_TONES = [0x7a3a2c, 0x2c5a7a, 0x3d6b3a, 0x8a7a2c, 0x5a5f66, 0x7a2c5a];
function containers(g, x, z, rows = 3, high = 3, ry = 0) {
  const s = group(g, x, -1.5, z, ry);
  let i = 0;
  for (let r = 0; r < rows; r++) for (let h = 0; h < high - (r % 2); h++) {
    box(s, 6.1, 2.6, 2.44, 0, 1.3 + h * 2.62, r * 2.6, BOX_TONES[(i++) % BOX_TONES.length], { rough: 0.7, metal: 0.25, cast: false, receive: false });
  }
  return s;
}

function shed(g, x, z, w = 14, d = 10, ry = 0, teeth = 4) {
  const s = group(g, x, -1.5, z, ry);
  box(s, w, 6, d, 0, 3, 0, 0x4a5561, { rough: 0.75, metal: 0.2, cast: false, receive: false });
  for (let i = 0; i < teeth; i++) {
    const tw = w / teeth;
    const glass = box(s, tw * 0.9, 1.4, 0.08, -w / 2 + tw * (i + 0.5), 6.7, -d / 2 + 0.2, 0x9fd8ff, { emissive: 0x9fd8ff, ei: 0.7, rough: 0.3, cast: false, receive: false });
    glass.rotation.x = -0.35;
    const roof = box(s, tw * 0.98, 0.14, d * 1.02, -w / 2 + tw * (i + 0.5), 6.6, 0.4, 0x3a434d, { rough: 0.7, metal: 0.3, cast: false, receive: false });
    roof.rotation.x = 0.13;
  }
  return s;
}

function stack(g, x, z, h = 16) {
  cyl(g, 0.55, 0.85, h, x, h / 2 - 1.5, z, 0x4a3f3a, { rough: 0.8, seg: 12, cast: false, receive: false });
  for (let b = 0; b < 3; b++) torus(g, 0.7 - b * 0.05, 0.05, x, h * (0.3 + b * 0.3) - 1.5, z, 0xff5f5f, { emissive: 0xff5f5f, ei: 0.9, rough: 0.5, cast: false, seg: 5, seg2: 18 }).rotation.x = Math.PI / 2;
  return ball(g, 1.1, x, h - 0.6, z, 0x8d98a3, { rough: 1, opacity: 0.55, cast: false, seg: 10, seg2: 8 });
}

function apparatus(g, x, z, body, ry = 0) {
  const a = group(g, x, -1.5, z, ry);
  box(a, 8.2, 2.6, 2.5, 0, 2.0, 0, body, { rough: 0.45, metal: 0.35, cast: false, receive: false });
  box(a, 2.4, 2.2, 2.5, 3.2, 1.9, 0, body, { rough: 0.45, metal: 0.35, cast: false, receive: false });
  box(a, 2.2, 0.9, 2.3, 3.25, 2.6, 0, 0x1a2129, { rough: 0.3, metal: 0.5, cast: false, receive: false });
  for (const wx of [-2.6, 2.6]) for (const wz of [-1.2, 1.2]) cyl(a, 0.55, 0.55, 0.4, wx, 0.55, wz, 0x1a1e23, { rough: 0.9, seg: 12, cast: false, receive: false }).rotation.x = Math.PI / 2;
  const bar = [own(box(a, 0.9, 0.22, 0.4, 2.7, 3.2, 0, 0xff3b3b, { emissive: 0xff3b3b, ei: 2, rough: 0.3, cast: false })),
    own(box(a, 0.9, 0.22, 0.4, 3.75, 3.2, 0, 0x3b7bff, { emissive: 0x3b7bff, ei: 2, rough: 0.3, cast: false }))];
  return bar;
}

function towerCrane(g, x, z, h = 22) {
  const c = group(g, x, -1.5, z);
  box(c, 1.6, 0.5, 1.6, 0, 0.25, 0, 0x3a434d, { rough: 0.7, cast: false, receive: false });
  box(c, 1.2, h, 1.2, 0, h / 2, 0, 0xf2c14b, { rough: 0.6, metal: 0.3, cast: false, receive: false });
  const slew = group(c, 0, h, 0);
  box(slew, 1.4, 1.4, 1.6, 0, 0.7, 0.3, 0x4a5561, { rough: 0.6, cast: false, receive: false });
  box(slew, 0.7, 0.7, 20, 0, 1.2, -9.5, 0xf2c14b, { rough: 0.6, metal: 0.3, cast: false, receive: false });
  box(slew, 0.7, 0.7, 6.5, 0, 1.2, 4.2, 0xf2c14b, { rough: 0.6, metal: 0.3, cast: false, receive: false });
  box(slew, 1.2, 1.0, 1.6, 0, 1.3, 6.8, 0x8b98a5, { rough: 0.7, metal: 0.5, cast: false, receive: false });
  cyl(slew, 0.08, 0.08, 4.5, 0, 3.4, 0, 0xf2c14b, { rough: 0.6, seg: 6, cast: false, receive: false });
  span(slew, [0, 5.6, 0], [0, 1.6, -19], 0.04);
  span(slew, [0, 5.6, 0], [0, 1.6, 7], 0.04);
  const trolley = box(slew, 0.9, 0.4, 0.9, 0, 0.75, -12, 0x4a5561, { rough: 0.6, cast: false, receive: false });
  const line = box(slew, 0.03, 9, 0.03, 0, -4, -12, 0x1a1e23, { rough: 0.5, cast: false, receive: false });
  own(ball(slew, 0.14, 0, 1.9, -19.6, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.6, cast: false, seg: 8, seg2: 6 }));
  return { slew, trolley, line };
}

function lattice(g, x, z, h = 26) {
  const t = group(g, x, -1.5, z);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = cyl(t, 0.06, 0.13, h, sx * 0.9, h / 2, sz * 0.9, 0xc9d0d6, { rough: 0.5, metal: 0.6, seg: 6, cast: false, receive: false });
    leg.rotation.z = -sx * 0.05; leg.rotation.x = sz * 0.05;
  }
  for (let y = 3; y < h; y += 4) box(t, 1.8 - y / h * 1.0, 0.1, 1.8 - y / h * 1.0, 0, y, 0, 0xc9d0d6, { rough: 0.5, metal: 0.6, cast: false, receive: false });
  for (const [y, s] of [[h * 0.5, 1], [h * 0.72, -1], [h * 0.86, 1]]) {
    const dish = cyl(t, 1.1, 1.1, 0.25, s * 1.4, y, 0, 0xe6ecf1, { rough: 0.4, seg: 18, cast: false, receive: false });
    dish.rotation.z = Math.PI / 2; dish.rotation.y = s * 0.6;
  }
  const beacons = [];
  for (const y of [h * 0.5, h + 0.2]) beacons.push(own(ball(t, 0.16, 0, y, 0, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.6, cast: false, seg: 8, seg2: 6 })));
  return beacons;
}

function monopole(g, x, z, h = 14) {
  cyl(g, 0.12, 0.2, h, x, h / 2 - 1.5, z, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8, cast: false, receive: false });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const panel = box(g, 0.3, 1.6, 0.12, x + Math.sin(a) * 0.55, h - 2.4, z + Math.cos(a) * 0.55, 0xdfe6ec, { rough: 0.5, cast: false, receive: false });
    panel.rotation.y = a;
  }
}

function truss(g, x, z, w = 16, h = 9) {
  const t = group(g, x, -1.5, z);
  for (const sx of [-1, 1]) {
    for (const [dx, dz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) cyl(t, 0.05, 0.05, h, sx * w / 2 + dx, h / 2, dz, 0xb8c1c9, { rough: 0.4, metal: 0.7, seg: 6, cast: false, receive: false });
    box(t, 1.2, 0.3, 1.2, sx * w / 2, 0.15, 0, 0x4a5561, { rough: 0.6, cast: false, receive: false });
  }
  for (const dz of [-0.35, 0.35]) for (const dy of [-0.35, 0.35]) cyl(t, 0.05, 0.05, w + 0.7, 0, h + dy, dz, 0xb8c1c9, { rough: 0.4, metal: 0.7, seg: 6, cast: false, receive: false }).rotation.z = Math.PI / 2;
  const heads = [];
  const tones = [0xff4fd1, 0x4fd1ff, 0xf2c14b, 0x59c97b, 0xa079ff, 0xff5f5f];
  for (let i = 0; i < 6; i++) {
    const hx = -w / 2 + (i + 0.5) * (w / 6);
    const yoke = group(t, hx, h - 0.6, 0);
    box(yoke, 0.3, 0.3, 0.3, 0, 0.2, 0, 0x1a1e23, { rough: 0.6, cast: false, receive: false });
    const head = own(cyl(yoke, 0.16, 0.24, 0.5, 0, -0.3, 0, tones[i], { emissive: tones[i], ei: 2.2, rough: 0.4, seg: 10, cast: false, receive: false }));
    heads.push({ yoke, head, phase: i * 1.05 });
  }
  return heads;
}

function hill(g, x, z, rx, ry, rz, color = 0x1d2a22) {
  const h = ball(g, 1, x, -1.5, z, color, { rough: 1, cast: false, receive: false, seg: 14, seg2: 10 });
  h.scale.set(rx, ry, rz);
  return h;
}

function monitorMast(g, x, z, h = 6) {
  cyl(g, 0.05, 0.07, h, x, h / 2 - 1.5, z, 0xb8c1c9, { rough: 0.5, metal: 0.6, seg: 6, cast: false, receive: false });
  box(g, 0.5, 0.6, 0.35, x, h - 1.9, z, 0xe6ecf1, { rough: 0.5, cast: false, receive: false });
  for (const s of [-1, 1]) box(g, 0.6, 0.04, 0.04, x + s * 0.35, h - 1.2, z, 0xb8c1c9, { rough: 0.5, cast: false, receive: false });
  return own(ball(g, 0.09, x, h - 1.4, z, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.8, cast: false, seg: 8, seg2: 6 }));
}

function coolingTower(g, x, z) {
  const c = group(g, x, -1.5, z);
  box(c, 12, 1.2, 9, 0, 0.6, 0, 0x4a5561, { rough: 0.75, cast: false, receive: false });
  cyl(c, 2.6, 3.1, 4.4, -2.8, 3.4, 0, 0x8b949d, { rough: 0.6, metal: 0.4, seg: 20, open: true, cast: false, receive: false });
  const fan = torus(c, 1.9, 0.12, -2.8, 5.65, 0, 0x4a5561, { rough: 0.6, metal: 0.5, cast: false, seg: 6, seg2: 28 });
  fan.rotation.x = Math.PI / 2;
  const blades = group(c, -2.8, 5.62, 0);
  for (let i = 0; i < 4; i++) box(blades, 3.4, 0.05, 0.28, 0, 0, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, cast: false, receive: false }).rotation.y = (i / 4) * Math.PI;
  for (let i = 0; i < 3; i++) {
    box(c, 2.2, 1.6, 2.2, 1.6 + i * 2.6, 2.0, 1.8, 0x8b949d, { rough: 0.6, metal: 0.4, cast: false, receive: false });
    torus(c, 0.7, 0.06, 1.6 + i * 2.6, 2.85, 1.8, 0x4a5561, { rough: 0.6, cast: false, seg: 5, seg2: 20 }).rotation.x = Math.PI / 2;
  }
  box(c, 8, 0.5, 0.5, 1.5, 1.6, -2.2, 0x8b98a5, { rough: 0.5, metal: 0.6, cast: false, receive: false });
  return blades;
}

function guideway(g, z = -24, span_ = 56) {
  const w = group(g, 0, -1.5, z);
  for (let x = -span_ / 2; x <= span_ / 2; x += 8) cyl(w, 0.6, 0.8, 7, x, 3.5, 0, 0x3a434d, { rough: 0.7, seg: 10, cast: false, receive: false });
  box(w, span_ + 2, 1.0, 3.6, 0, 7.5, 0, 0x75828f, { rough: 0.7, metal: 0.2, cast: false, receive: false });
  for (const s of [-1, 1]) box(w, span_ + 2, 0.5, 0.15, 0, 8.25, s * 1.7, 0x8b98a5, { rough: 0.6, cast: false, receive: false });
  const train = group(w, 0, 9.0, 0);
  for (let c = 0; c < 3; c++) {
    box(train, 7.4, 1.9, 2.4, c * 7.8 - 7.8, 0, 0, 0xdfe6ec, { rough: 0.35, metal: 0.4, cast: false, receive: false });
    box(train, 6.6, 0.55, 2.46, c * 7.8 - 7.8, 0.25, 0, 0xffe9a8, { emissive: 0xffe9a8, ei: 1.1, rough: 0.4, cast: false, receive: false });
  }
  own(ball(train, 0.14, -11.8, 0.4, 0, 0xffffff, { emissive: 0xffffff, ei: 2.2, cast: false, seg: 8, seg2: 6 }));
  const lamps = [];
  for (const x of [-18, 18]) {
    cyl(w, 0.1, 0.1, 5, x, 2.5, 6, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8, cast: false, receive: false });
    box(w, 0.4, 1.2, 0.4, x, 5.6, 6, 0x1a1e23, { rough: 0.6, cast: false, receive: false });
    lamps.push(own(ball(w, 0.14, x, 5.95, 6.22, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.8, cast: false, seg: 8, seg2: 6 })));
    lamps.push(own(ball(w, 0.14, x, 5.3, 6.22, 0x59c97b, { emissive: 0x59c97b, ei: 0.3, cast: false, seg: 8, seg2: 6 })));
  }
  return { train, lamps, span: span_ };
}

/** Blast containment: a scaffold cage wrapped in shroud sheeting with the
 *  work inside, a negative-air machine drawing the dust out one end, and a
 *  blast light that reads through the sheeting as the operator works. */
function containment(g, x, z, w = 14, h = 9, ry = 0) {
  const c = group(g, x, -1.5, z, ry);
  const d = 8;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(c, 0.055, 0.055, h, sx * w / 2, h / 2, sz * d / 2, 0x9aa6b2, { rough: 0.5, metal: 0.6, seg: 6, cast: false, receive: false });
  for (let y = 2; y <= h; y += 2.2) {
    for (const sz of [-1, 1]) box(c, w, 0.07, 0.07, 0, y, sz * d / 2, 0x9aa6b2, { rough: 0.5, metal: 0.6, cast: false, receive: false });
    for (const sx of [-1, 1]) box(c, 0.07, 0.07, d, sx * w / 2, y, 0, 0x9aa6b2, { rough: 0.5, metal: 0.6, cast: false, receive: false });
  }
  cyl(c, 2.6, 2.6, h - 2.6, 0, (h - 2.6) / 2 + 0.4, 0, 0x6f7a84, { rough: 0.85, seg: 20, cast: false, receive: false });
  const sheets = [];
  for (const [sx, sz, sw, rot] of [[0, -1, w, 0], [0, 1, w, 0], [-1, 0, d, Math.PI / 2], [1, 0, d, Math.PI / 2]]) {
    const p = box(c, sw, h, 0.06, sx * w / 2, h / 2, sz * d / 2, 0xdfe6ec, { emissive: 0xbfe0ff, ei: 0.3, rough: 0.85, opacity: 0.5, cast: false, receive: false });
    p.rotation.y = rot;
    sheets.push(own(p));
  }
  box(c, w, 0.06, d, 0, h, 0, 0xcdd6de, { rough: 0.85, opacity: 0.45, cast: false, receive: false });
  const neg = group(c, w / 2 + 2.6, 0, 1.4, 0);
  box(neg, 2.4, 1.5, 1.5, 0, 0.75, 0, 0x2f6f8f, { rough: 0.5, metal: 0.4, cast: false, receive: false });
  box(neg, 1.4, 0.9, 0.08, 0, 0.85, 0.78, 0x1a1e23, { rough: 0.8, cast: false, receive: false });
  const duct = cyl(neg, 0.42, 0.42, 3.0, -1.9, 1.1, 0, 0x9aa6b2, { rough: 0.7, metal: 0.3, seg: 12, cast: false, receive: false });
  duct.rotation.z = Math.PI / 2;
  const plume = ball(neg, 0.85, 1.9, 1.5, 0, 0x8d98a3, { rough: 1, opacity: 0.3, cast: false, seg: 10, seg2: 8 });
  return { sheets, plume };
}

/** Abrasive silo on legs, with the blast pots and hose reel it feeds. */
function abrasiveSilo(g, x, z) {
  const s = group(g, x, -1.5, z);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) cyl(s, 0.13, 0.13, 5, sx * 1.5, 2.5, sz * 1.5, 0x6b7885, { rough: 0.6, metal: 0.5, seg: 8, cast: false, receive: false });
  cyl(s, 2.1, 2.1, 6, 0, 8.2, 0, 0xc9d0d6, { rough: 0.55, metal: 0.4, seg: 20, cast: false, receive: false });
  cyl(s, 2.1, 0.45, 1.6, 0, 4.4, 0, 0xb0b9c2, { rough: 0.6, metal: 0.4, seg: 20, cast: false, receive: false });
  cyl(s, 2.1, 1.0, 1.2, 0, 11.6, 0, 0xb0b9c2, { rough: 0.6, metal: 0.4, seg: 20, cast: false, receive: false });
  for (let i = 0; i < 4; i++) box(s, 0.5, 0.06, 0.06, 2.0, 5.6 + i * 1.5, 0, 0xf2c14b, { rough: 0.6, cast: false, receive: false });
  for (const sx of [-1, 1]) {
    cyl(s, 0.45, 0.45, 1.7, sx * 1.0, 0.85, 2.8, 0xf2c14b, { rough: 0.6, metal: 0.3, seg: 12, cast: false, receive: false });
    cyl(s, 0.45, 0.2, 0.5, sx * 1.0, 1.95, 2.8, 0xd9a72c, { rough: 0.6, metal: 0.3, seg: 12, cast: false, receive: false });
  }
  const reel = torus(s, 0.7, 0.22, 3.0, 0.9, 2.6, 0x2a3b33, { rough: 0.9, cast: false, seg: 8, seg2: 20 });
  reel.rotation.y = Math.PI / 2;
  return s;
}

/** A drum rack of coating stock under a tarp roof, with mixed pails out front. */
function coatingStore(g, x, z, ry = 0) {
  const r = group(g, x, -1.5, z, ry);
  box(r, 9, 0.2, 3.4, 0, 0.1, 0, 0x3a434d, { rough: 0.9, cast: false, receive: false });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(r, 0.07, 0.07, 3.2, sx * 4.2, 1.6, sz * 1.5, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 6, cast: false, receive: false });
  box(r, 9.4, 0.08, 3.8, 0, 3.25, 0, 0x2f5f4a, { rough: 0.9, cast: false, receive: false });
  const tones = [0x2f6f8f, 0xb3261e, 0x3d6b3a, 0x8a7a2c, 0x5a5f66];
  for (let i = 0; i < 10; i++) {
    const dx = -3.8 + (i % 5) * 1.9, dy = 0.75 + Math.floor(i / 5) * 1.5;
    cyl(r, 0.42, 0.42, 1.3, dx, dy, 0, tones[i % tones.length], { rough: 0.55, metal: 0.35, seg: 14, cast: false, receive: false });
    for (const ry2 of [-0.35, 0.35]) torus(r, 0.43, 0.04, dx, dy + ry2, 0, 0x2a2f36, { rough: 0.7, cast: false, seg: 5, seg2: 16 }).rotation.x = Math.PI / 2;
  }
  for (let i = 0; i < 4; i++) cyl(r, 0.24, 0.2, 0.42, -3.4 + i * 1.1, 0.41, 2.4, 0xdfe6ec, { rough: 0.5, seg: 12, cast: false, receive: false });
  return r;
}

/** Dehumidifier skid: the machine that holds the dew point while a lining cures. */
function dehuSkid(g, x, z, ry = 0) {
  const s = group(g, x, -1.5, z, ry);
  box(s, 6.4, 0.3, 2.6, 0, 0.15, 0, 0x4a5561, { rough: 0.8, metal: 0.3, cast: false, receive: false });
  box(s, 5.6, 2.2, 2.2, 0, 1.4, 0, 0xdfe6ec, { rough: 0.5, metal: 0.3, cast: false, receive: false });
  box(s, 1.6, 1.1, 0.08, -1.6, 1.7, 1.13, 0x1a2129, { rough: 0.4, cast: false, receive: false });
  const lamp = own(ball(s, 0.11, 1.9, 2.0, 1.13, 0x59c97b, { emissive: 0x59c97b, ei: 1.4, cast: false, seg: 8, seg2: 6 }));
  const duct = cyl(s, 0.5, 0.5, 4.5, 3.6, 2.0, 0, 0xc9d0d6, { rough: 0.7, metal: 0.3, seg: 14, cast: false, receive: false });
  duct.rotation.z = Math.PI / 2;
  for (let i = 0; i < 4; i++) torus(s, 0.52, 0.05, 2.2 + i * 1.1, 2.0, 0, 0x9aa6b2, { rough: 0.6, cast: false, seg: 5, seg2: 16 }).rotation.y = Math.PI / 2;
  return lamp;
}

/** Bay water to the horizon, textured and drifting: the shoreline districts'
 *  version of water(). Returns the texture so animate can slide it. */
function bayWater(g, o = {}) {
  const r = o.r ?? 66;
  const tex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, o), { repeat: o.repeat ?? 14, px: 512 });
  const w = cyl(g, r, r, 0.1, 0, o.y ?? -0.56, 0, 0x0f2e3a, { rough: 0.25, metal: 0.55, seg: 56, cast: false });
  w.material = texturedMat(tex, { rough: 0.28, metal: 0.5, color: 0xa8c4cc });
  w.receiveShadow = false;
  return tex;
}

/** The tidal flat between the plaza edge and the water. */
function mudflat(g, r = 26) {
  const tex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h), { repeat: 9, px: 512 });
  const m = cyl(g, r, r + 1.5, 0.12, 0, -0.5, 0, 0x3a3630, { rough: 0.95, seg: 48, cast: false });
  m.material = texturedMat(tex, { rough: 0.95, metal: 0.02, color: 0xc9bfae });
  m.receiveShadow = false;
  return m;
}

/** A clump of cordgrass on the flat: a dozen thin blades leaning off vertical
 *  so a cluster reads as a plant and not a picket. */
function cordgrass(g, x, z, n = 12, tone = 0x5d7a3a) {
  const c = group(g, x, -0.45, z, Math.random() * Math.PI);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, r = 0.12 + Math.random() * 0.35, hh = 0.7 + Math.random() * 0.6;
    const b = box(c, 0.035, hh, 0.012, Math.cos(a) * r, hh / 2, Math.sin(a) * r, i % 3 ? tone : 0x8a8f4a, { rough: 0.9, cast: false, receive: false });
    b.rotation.z = (Math.random() - 0.5) * 0.5; b.rotation.x = (Math.random() - 0.5) * 0.4;
  }
  return c;
}

/** Site perimeter: chain-link between posts along an arc, with a dust
 *  monitor and its beacon every few bays — the fence the neighbourhood is on
 *  the other side of. Returns the beacons. */
function perimeter(g, r = 20, a0 = -1.9, a1 = -1.2, bays = 7) {
  const beacons = [];
  for (let i = 0; i <= bays; i++) {
    const a = a0 + (a1 - a0) * (i / bays);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    cyl(g, 0.04, 0.04, 2.4, x, -0.3, z, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 6, cast: false, receive: false });
    if (i < bays) {
      const na = a0 + (a1 - a0) * ((i + 1) / bays);
      const mx = (x + Math.sin(na) * r) / 2, mz = (z + Math.cos(na) * r) / 2;
      const len = Math.hypot(Math.sin(na) * r - x, Math.cos(na) * r - z);
      const panel = box(g, len, 2.2, 0.02, mx, -0.4, mz, 0xb8c1c9, { rough: 0.6, metal: 0.4, opacity: 0.35, cast: false, receive: false });
      panel.rotation.y = -((a + na) / 2);
    }
    if (i % 3 === 1) {
      box(g, 0.34, 0.5, 0.28, x, 0.75, z, 0xe6ecf1, { rough: 0.5, cast: false, receive: false });
      cyl(g, 0.05, 0.05, 0.3, x, 1.15, z, 0x4a5561, { rough: 0.5, seg: 6, cast: false, receive: false });
      beacons.push(own(ball(g, 0.08, x, 1.36, z, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.6, cast: false, seg: 8, seg2: 6 })));
    }
  }
  return beacons;
}

/** A clamshell dredge on a spud barge, a scow alongside and the turbidity
 *  curtain's float line around the work — environmental dredging seen from
 *  the shore. Returns the parts that move. */
function dredge(g, x, z, ry = 0) {
  const d = group(g, x, -0.5, z, ry);
  box(d, 18, 1.6, 9, 0, 0.8, 0, 0x3c4a58, { rough: 0.7, metal: 0.3, cast: false, receive: false });
  for (const sx of [-1, 1]) cyl(d, 0.22, 0.22, 9, sx * 8.2, 4.5, -3.6, 0x4a5561, { rough: 0.6, metal: 0.4, seg: 8, cast: false, receive: false });
  box(d, 4.2, 2.6, 4.2, -4, 2.9, 0, 0xdfe6ec, { rough: 0.5, cast: false, receive: false });
  box(d, 3.8, 0.6, 4.3, -4, 3.4, 0, 0xffe9a8, { emissive: 0xffe9a8, ei: 0.9, rough: 0.4, cast: false, receive: false });
  const slew = group(d, 2, 1.6, 0);
  box(slew, 3.4, 2.6, 3.4, 0, 1.3, 0, 0xf2c14b, { rough: 0.6, metal: 0.3, cast: false, receive: false });
  box(slew, 2.2, 1.2, 2.0, 0.4, 3.2, 0.6, 0x2a3138, { rough: 0.5, metal: 0.4, cast: false, receive: false });
  // Boom raised toward -z: a positive tilt about x lifts the far end.
  const boom = box(slew, 0.5, 0.5, 16, 0, 2.8, -7, 0xf2c14b, { rough: 0.6, metal: 0.3, cast: false, receive: false });
  boom.rotation.x = 0.6;
  const line = box(slew, 0.03, 6, 0.03, 0, 4.0, -13.6, 0x1a1e23, { rough: 0.5, cast: false, receive: false });
  const bucket = box(slew, 1.4, 1.1, 1.2, 0, 0.6, -13.6, 0x2a3138, { rough: 0.7, metal: 0.5, cast: false, receive: false });
  own(ball(slew, 0.16, 0, 7.4, -13.9, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.5, cast: false, seg: 8, seg2: 6 }));
  const scow = group(d, 0, 0, 8.5);
  box(scow, 22, 1.3, 6, 0, 0.65, 0, 0x2f3a45, { rough: 0.75, metal: 0.3, cast: false, receive: false });
  box(scow, 20, 0.5, 4.6, 0, 1.4, 0, 0x4a3f3a, { rough: 0.95, cast: false, receive: false });
  for (let i = 0; i < 14; i++) {
    const a = -0.5 + (i / 13) * 2.6, rr = 17;
    ball(d, 0.28, Math.cos(a) * rr, 0.18, -Math.sin(a) * rr - 8, i % 2 ? 0xff7a3b : 0xf2c14b, { rough: 0.8, cast: false, seg: 6, seg2: 5 });
  }
  return { d, slew, line, bucket };
}


/** A restaurant row for the hospitality horizon: a low brick block with lit
 *  awnings and a kitchen exhaust fan, and a loading yard with a reefer van
 *  backed to the dock — the back-of-house side of the trade, where deliveries
 *  are received and the grease interceptor is pumped. */
function restaurantRow(g, x, z, ry = 0) {
  const s = group(g, x, -1.5, z, ry);
  box(s, 22, 7, 9, 0, 3.5, 0, 0x5a4034, { rough: 0.9, metal: 0.05, cast: false, receive: false });
  for (let i = 0; i < 4; i++) {
    const ax = -8 + i * 5.3;
    const awn = box(s, 4.2, 0.12, 1.6, ax, 3.1, -5.2, i % 2 ? 0xb8862b : 0x8a2b2b, { emissive: i % 2 ? 0xb8862b : 0x8a2b2b, ei: 0.35, rough: 0.8, cast: false, receive: false });
    awn.rotation.x = 0.28;
    box(s, 3.6, 2.1, 0.08, ax, 1.55, -4.55, 0xffd9a0, { emissive: 0xffd9a0, ei: 0.9, rough: 0.3, cast: false, receive: false });
  }
  cyl(s, 0.9, 0.9, 1.2, 6, 7.6, 1.5, 0x8b98a5, { rough: 0.6, metal: 0.5, cast: false, receive: false });
  const fan = cyl(s, 0.7, 0.7, 0.1, 6, 8.25, 1.5, 0x3a434d, { rough: 0.5, metal: 0.6, cast: false, receive: false });
  // Loading yard: dock, reefer van, crates.
  box(s, 8, 1.1, 3, 14.5, 0.55, 1.5, 0x4a5561, { rough: 0.85, cast: false, receive: false });
  box(s, 6.2, 2.6, 2.5, 15.5, 2.4, 4.6, 0xdfe6ea, { rough: 0.5, metal: 0.3, cast: false, receive: false });
  box(s, 1.8, 1.9, 2.3, 19.6, 2.0, 4.6, 0x2b3542, { rough: 0.5, metal: 0.4, cast: false, receive: false });
  for (let i = 0; i < 3; i++) box(s, 0.9, 0.7, 0.9, 11.6 + i * 1.1, 1.45, 0.9, 0x3b7bbf, { rough: 0.9, cast: false, receive: false });
  return { s, fan };
}

/** A community clinic block for the dental horizon: a pale two-storey
 *  building with a lit cross and ribbon windows, a covered entrance, and the
 *  outreach van parked beside it with its awning out. */
function clinicBlock(g, x, z, ry = 0) {
  const s = group(g, x, -1.5, z, ry);
  box(s, 20, 9, 10, 0, 4.5, 0, 0xcfd6dc, { rough: 0.8, metal: 0.05, cast: false, receive: false });
  for (let f = 0; f < 2; f++) box(s, 17, 1.3, 0.08, 0, 2.6 + f * 3.6, -5.05, 0x9fd8ff, { emissive: 0x9fd8ff, ei: 0.55, rough: 0.3, cast: false, receive: false });
  box(s, 6, 0.2, 3.2, -4, 3.1, -6.4, 0x8b98a5, { rough: 0.6, metal: 0.4, cast: false, receive: false });
  cyl(s, 0.12, 0.12, 3.0, -6.6, 1.55, -7.7, 0x8b98a5, { rough: 0.6, metal: 0.5, cast: false, receive: false });
  cyl(s, 0.12, 0.12, 3.0, -1.4, 1.55, -7.7, 0x8b98a5, { rough: 0.6, metal: 0.5, cast: false, receive: false });
  const cross = group(s, 6, 8.2, -5.15);
  const a = box(cross, 1.6, 0.5, 0.1, 0, 0, 0, 0x4fd6a5, { emissive: 0x4fd6a5, ei: 1.6, rough: 0.3, cast: false, receive: false });
  const b = box(cross, 0.5, 1.6, 0.1, 0, 0, 0, 0x4fd6a5, { emissive: 0x4fd6a5, ei: 1.6, rough: 0.3, cast: false, receive: false });
  own(a); own(b);
  // Outreach van with its awning out.
  box(s, 6.4, 2.7, 2.4, 14.5, 1.9, -2, 0xf2f4f6, { rough: 0.45, metal: 0.3, cast: false, receive: false });
  box(s, 1.7, 1.6, 2.3, 18.5, 1.35, -2, 0x2b3542, { rough: 0.5, metal: 0.4, cast: false, receive: false });
  box(s, 5.6, 0.5, 0.06, 14.5, 2.4, -3.22, 0x4fd6a5, { rough: 0.7, cast: false, receive: false });
  const awn = box(s, 5.8, 0.08, 2.4, 14.5, 3.1, -4.4, 0xdfe6ea, { rough: 0.8, cast: false, receive: false });
  awn.rotation.x = 0.12;
  return { s, cross: [a, b] };
}


/** The public side of a cleanup fence: a row of houses on a residential
 *  street, the chain-link and posted signage of a parcel across the road,
 *  a fence-line monitor mast, and the community centre whose lit sign is
 *  the neighbourhood's own. This is the horizon a community monitor works
 *  against — always from this side of the fence. */
function fencedParcelStreet(g, x, z, ry = 0) {
  const s = group(g, x, -1.5, z, ry);
  // Row houses, stepped, with lit windows.
  for (let i = 0; i < 5; i++) {
    const hx = -14 + i * 6.2, tone = [0xcfc2b0, 0xb9c6cf, 0xd8cfc0, 0xc5c9b8, 0xd2c4bd][i];
    box(s, 5.4, 6 + (i % 2) * 0.8, 7, hx, 3 + (i % 2) * 0.4, 0, tone, { rough: 0.9, metal: 0.02, cast: false, receive: false });
    const roof = box(s, 5.8, 0.3, 7.4, hx, 6.15 + (i % 2) * 0.8, 0, 0x5a4a44, { rough: 0.85, cast: false, receive: false });
    roof.rotation.z = 0.04;
    for (let w = 0; w < 2; w++) box(s, 1.1, 1.4, 0.08, hx - 1.3 + w * 2.6, 2.4, -3.55, 0xffe6b0, { emissive: 0xffe6b0, ei: 0.7, rough: 0.3, cast: false, receive: false });
    box(s, 1.1, 1.4, 0.08, hx, 4.6, -3.55, 0xffe6b0, { emissive: 0xffe6b0, ei: 0.5, rough: 0.3, cast: false, receive: false });
  }
  // The parcel fence across the road: posts, mesh panels, posted signs.
  for (let i = 0; i < 9; i++) {
    cyl(s, 0.06, 0.06, 2.6, -18 + i * 4.5, 1.3, -14, 0x8b98a5, { rough: 0.6, metal: 0.6, cast: false, receive: false });
    if (i < 8) box(s, 4.4, 2.4, 0.03, -15.75 + i * 4.5, 1.3, -14, 0xa7b3bf, { rough: 0.5, metal: 0.5, opacity: 0.35, cast: false, receive: false });
    if (i % 3 === 1) box(s, 0.9, 0.6, 0.04, -18 + i * 4.5 + 1.2, 1.7, -13.95, 0xfff2a8, { emissive: 0xfff2a8, ei: 0.25, rough: 0.7, cast: false, receive: false });
  }
  // Fence-line monitor mast on the public side.
  const mast = group(s, 6, 0, -12.2);
  cyl(mast, 0.05, 0.05, 3.2, 0, 1.6, 0, 0xdfe6ea, { rough: 0.5, metal: 0.6, cast: false, receive: false });
  box(mast, 0.5, 0.36, 0.3, 0, 3.0, 0, 0x2b3542, { rough: 0.5, metal: 0.4, cast: false, receive: false });
  const lamp = box(mast, 0.12, 0.12, 0.12, 0.22, 3.25, 0, 0x4fd6a5, { emissive: 0x4fd6a5, ei: 1.6, rough: 0.4, cast: false, receive: false });
  own(lamp);
  // Community centre with a lit sign.
  box(s, 12, 5, 8, 19, 2.5, -4, 0xe4d9c6, { rough: 0.9, metal: 0.02, cast: false, receive: false });
  box(s, 9, 1.0, 0.1, 19, 4.4, -8.05, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.9, rough: 0.5, cast: false, receive: false });
  box(s, 6, 2.2, 0.08, 19, 1.5, -8.05, 0xffe6b0, { emissive: 0xffe6b0, ei: 0.55, rough: 0.3, cast: false, receive: false });
  return { s, lamp };
}

/** A garment-district loft: a brick block with tall factory windows lit
 *  floor by floor, a loading dock with rolling racks, and the water tower
 *  on the roof — the building a sewing floor sits inside. */
function garmentLoft(g, x, z, ry = 0) {
  const s = group(g, x, -1.5, z, ry);
  box(s, 24, 14, 12, 0, 7, 0, 0x7a4a3a, { rough: 0.9, metal: 0.03, cast: false, receive: false });
  const panes = [];
  for (let f = 0; f < 4; f++) for (let w = 0; w < 7; w++) {
    const pane = box(s, 2.2, 2.1, 0.08, -9.6 + w * 3.2, 2.2 + f * 3.2, -6.05, 0xdbe9ff, { emissive: 0xdbe9ff, ei: 0.35 + ((f + w) % 3) * 0.2, rough: 0.3, cast: false, receive: false });
    own(pane); panes.push(pane);
  }
  cyl(s, 1.4, 1.4, 2.6, 8, 15.6, 2, 0x5a4a44, { rough: 0.9, cast: false, receive: false });
  for (let i = 0; i < 4; i++) cyl(s, 0.08, 0.08, 2.4, 8 + Math.cos(i * 1.57) * 1.2, 15.2, 2 + Math.sin(i * 1.57) * 1.2, 0x3a3a3a, { rough: 0.7, metal: 0.5, cast: false, receive: false });
  // Loading dock with rolling garment racks.
  box(s, 8, 1.1, 3, 14.5, 0.55, -4.5, 0x4a5561, { rough: 0.85, cast: false, receive: false });
  for (let i = 0; i < 3; i++) {
    const rx = 12.5 + i * 1.8;
    cyl(s, 0.03, 0.03, 1.6, rx, 1.9, -4.5, 0x8b98a5, { rough: 0.5, metal: 0.7, cast: false, receive: false });
    box(s, 1.4, 0.04, 0.04, rx, 2.7, -4.5, 0x8b98a5, { rough: 0.5, metal: 0.7, cast: false, receive: false });
    box(s, 1.2, 0.9, 0.5, rx, 2.2, -4.5, [0xb86bd6, 0x3b7bbf, 0xd67b6b][i], { rough: 0.9, cast: false, receive: false });
  }
  return { s, panes };
}

// ------------------------------------------------------- scenic districts
//
// golden-gate-deck and bay-underwater are not a horizon behind the plaza:
// the learner stands IN them — on a suspension-bridge deck, on the bottom of
// the bay — so each brings its own ground and the stage leaves the plaza,
// masts, marquee and apron out (`plaza: false`, see stage.js). They are built
// once here and any station uses one by naming it: `district:
// "golden-gate-deck"` or `district: "bay-underwater"`.
//
// Their budget is their own: at most SCENIC_BUDGET meshes each, counted the
// way tools/check_budget.mjs counts a station, so a station's 150–280 still
// fits on top. Most of the repetition (railing balusters, suspender ropes,
// cones, piles, growth rings) goes through bake(), which builds the parts
// with the ordinary kit calls and hands back ONE mesh; what is left is
// merged per material by the stage's mergeStatic() at the end of the build.

export const SCENIC_BUDGET = 120;

/** Position of `o` in the frame of `stop` (its own little tree's root),
 *  scale-then-rotate-then-translate like three.js, so a part inside a
 *  rotated group is recorded where it really is. */
function framePos(o, stop = null, p = { x: 0, y: 0, z: 0 }) {
  let { x, y, z } = p;
  for (let n = o; n && n !== stop; n = n.parent) {
    const sc = n.scale;
    if (sc) { x *= sc.x ?? 1; y *= sc.y ?? 1; z *= sc.z ?? 1; }
    const r = n.rotation;
    if (r) {
      if (r.z) { const c = Math.cos(r.z), s = Math.sin(r.z); [x, y] = [x * c - y * s, x * s + y * c]; }
      if (r.y) { const c = Math.cos(r.y), s = Math.sin(r.y); [x, z] = [x * c + z * s, -x * s + z * c]; }
      if (r.x) { const c = Math.cos(r.x), s = Math.sin(r.x); [y, z] = [y * c - z * s, y * s + z * c]; }
    }
    x += n.position?.x ?? 0; y += n.position?.y ?? 0; z += n.position?.z ?? 0;
  }
  return { x, y, z };
}

/** Rough half-extents of a kit primitive (box, cylinder, sphere, torus,
 *  plane), for the layout checker; null when the geometry says nothing. */
function halfExtents(m) {
  const p = m.geometry?.parameters;
  if (!p) return null;
  let hx, hy, hz;
  if (p.width !== undefined) { hx = p.width / 2; hy = (p.height ?? 0) / 2; hz = (p.depth ?? 0) / 2; }
  else if (p.radiusTop !== undefined) { hx = hz = Math.max(p.radiusTop, p.radiusBottom); hy = p.height / 2; }
  else if (p.tube !== undefined) { hx = hy = hz = p.radius + p.tube; }
  else if (p.radius !== undefined) { hx = hy = hz = p.radius; }
  else return null;
  const s = m.scale ?? { x: 1, y: 1, z: 1 };
  hx *= s.x ?? 1; hy *= s.y ?? 1; hz *= s.z ?? 1;
  if (Math.abs(Math.sin(m.rotation?.y ?? 0)) > 0.7) [hx, hz] = [hz, hx];
  if (Math.abs(Math.sin(m.rotation?.x ?? 0)) > 0.7 || Math.abs(Math.sin(m.rotation?.z ?? 0)) > 0.7) { const k = Math.max(hx, hy, hz); hx = hy = hz = k; }
  return [hx, hy, hz];
}

/**
 * Build static parts with the ordinary kit calls into a scratch group, and
 * add ONE mesh to `parent` carrying all of their geometry in `material`.
 * Where three.js has no geometry API (the headless checkers' stub) the mesh
 * is empty; either way it is one mesh, and `userData.parts` records where
 * each part stood so the layout checker can still see them.
 */
function bake(parent, material, fill, o = {}) {
  const tmp = new THREE.Group();
  fill(tmp);
  const meshes = [];
  tmp.traverse((m) => { if (m.isMesh) meshes.push(m); });
  const parts = meshes.map((m) => ({ p: framePos(m, tmp), h: halfExtents(m) }));
  const geometry = new THREE.BufferGeometry();
  if (typeof geometry.applyMatrix4 === "function" && THREE.Float32BufferAttribute) {
    tmp.updateMatrixWorld(true);
    const pos = [], nor = [], uv = [];
    for (const m of meshes) {
      const src = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      src.applyMatrix4(m.matrixWorld);
      const P = src.getAttribute("position"), N = src.getAttribute("normal"), U = src.getAttribute("uv");
      for (let i = 0; i < P.count; i++) {
        pos.push(P.getX(i), P.getY(i), P.getZ(i));
        nor.push(N.getX(i), N.getY(i), N.getZ(i));
        uv.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0);
      }
      src.dispose();
      m.geometry.dispose();
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geometry.computeBoundingSphere();
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = !!o.cast;
  mesh.receiveShadow = o.receive !== false;
  mesh.userData.parts = parts;
  // Something that moves (a car, a school of fish) keeps its own mesh: the
  // stage's merge bakes everything else into world space where it stands.
  if (o.noMerge) mesh.userData.noMerge = true;
  parent.add(mesh);
  return mesh;
}

/** A bar between two points inside a bake (bracing, bridles, diagonals). */
function bar(t, a, b, r) {
  const m = span(t, a, b, r);
  return m;
}

/** A transparent sheet with a tiling canvas on it (fog banks, light shafts,
 *  the surface seen from below). Unlit, so it reads the same at any hour;
 *  `fog: false` keeps a sheet visible through the scene fog. */
let edgeFadeTex = null;
/** A soft-edged white rectangle on black, shared as the alpha map of every
 *  sheet so no fog bank shows the straight edge of the plane it is drawn on.
 *  Built once and kept, like a mat() material. */
function edgeFade() {
  if (edgeFadeTex) return edgeFadeTex;
  edgeFadeTex = surfaceTexture((cx, w, h) => {
    // Concentric rectangles, black at the rim to white a third of the way in.
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const k = i / steps, v = Math.round(255 * (k * k * (3 - 2 * k)));
      const inset = k * w * 0.34;
      cx.fillStyle = `rgb(${v},${v},${v})`;
      cx.fillRect(inset, inset, w - inset * 2, h - inset * 2);
    }
  }, { px: 128, repeat: 1 });
  return edgeFadeTex;
}

function sheet(g, w, h, draw, o = {}) {
  const tex = surfaceTexture(draw, { px: o.px ?? 256, repeat: o.repeat ?? 1 });
  const material = new THREE.MeshBasicMaterial({
    map: tex, alphaMap: o.fade === false ? null : edgeFade(),
    color: o.color ?? 0xffffff, transparent: true, opacity: o.opacity ?? 1, depthWrite: false,
    side: THREE.DoubleSide, fog: o.fog !== false,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  material.userData.ownMaterial = true;
  material.userData.ownTexture = true;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
  m.rotation.x = o.rx ?? 0; m.rotation.y = o.ry ?? 0;
  m.castShadow = false; m.receiveShadow = false;
  g.add(m);
  return { mesh: m, tex };
}

/** Slide a texture if this three.js has texture transforms (the headless
 *  stub does not). */
function slide(tex, x, y) { if (tex?.offset) tex.offset.set(x, y); }

// The deck, in metres from the stage origin: the roadway runs along z, the
// main cables hang in the planes x = ±GG.cable, the tower stands ahead of
// the learner (−z) and the cable sags to its low point behind them (+z).
const GG = {
  half: 10.4,          // roadway half-width: six lanes
  barrier: 10.65,      // traffic barrier between the roadway and the cable line
  cable: 11.3,         // main-cable plane
  walk: 12.2,          // sidewalk and cable-line strip centre (10.4 … 14.0), kerb at the roadway edge
  rail: 14.1,          // outer railing
  len: 116,            // deck length modelled
  towerZ: -34,
  saddle: 46.8,        // main cable over the tower saddle
  lowZ: 50, lowY: 2.6, // the cable's low point, where it comes down to the deck
  water: -46,          // the bay, far below
};
const ggCableY = (z) => GG.lowY + (GG.saddle - GG.lowY) * ((z - GG.lowZ) / (GG.towerZ - GG.lowZ)) ** 2;
const ggCableSlope = (z) => 2 * (GG.saddle - GG.lowY) * (z - GG.lowZ) / (GG.towerZ - GG.lowZ) ** 2;
// International Orange, in the 0xf04a00 family, for the plain-painted steel.
const GG_ORANGE = 0xd24a1c;

/**
 * golden-gate-deck: a suspension-bridge deck the learner stands on, a tower
 * rising ahead in International Orange (riveted plate drawn by
 * paintedSteelFace), the main cables curving down from the saddles toward
 * the deck with the suspender ropes hanging from them, deck railings, a
 * sidewalk and light standards, a lane closure with cones and an arrow
 * board, a cable traveller parked on the main cable, the bay far below and
 * the marine layer rolling in from the strait.
 */
function goldenGateDeck(g, env) {
  const night = env.time === "night", dusk = env.time === "dusk";
  const orange = mat(GG_ORANGE, { rough: 0.62, metal: 0.35 });
  flood(g, 0, 32, 26, 0xe6ecf0, 1.0);
  flood(g, -26, 18, 12, 0xdfe6ea, 0.5);

  // ---- the deck: roadway, sidewalks, the stiffening truss under it
  const roadTex = surfaceTexture((cx, w, h) => roadwayFace(cx, w, h, { lanes: 6 }), { px: 512 });
  roadTex.repeat?.set?.(1, 16);
  const road = box(g, GG.half * 2, 0.3, GG.len, 0, -0.15, 0, 0x3a3d41, { cast: false });
  road.material = texturedMat(roadTex, { rough: 0.92, metal: 0.02 });
  road.receiveShadow = true;
  const walkTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#8d9094", base2: "#7f8286", seam: "rgba(0,0,0,0.35)" }), { px: 256 });
  walkTex.repeat?.set?.(1.5, 48);
  const walkMat = texturedMat(walkTex, { rough: 0.95, metal: 0.02 });
  for (const sx of [-1, 1]) {
    const w = box(g, 3.6, 0.2, GG.len, sx * GG.walk, 0.1, 0, 0x8d9094, { cast: false });
    w.material = walkMat;
  }
  box(g, GG.rail * 2 + 0.4, 1.1, GG.len, 0, -0.85, 0, GG_ORANGE, { rough: 0.62, metal: 0.35, cast: false });
  bake(g, orange, (t) => {
    for (const sx of [-1, 1]) {
      const x = sx * (GG.rail - 0.1);
      box(t, 0.5, 0.5, GG.len, x, -1.6, 0, 0);
      box(t, 0.5, 0.5, GG.len, x, -7.4, 0, 0);
      for (let z = -GG.len / 2; z <= GG.len / 2; z += 7.25) {
        box(t, 0.4, 5.8, 0.4, x, -4.5, z, 0);
        if (z + 7.25 <= GG.len / 2) bar(t, [x, -1.6, z], [x, -7.4, z + 7.25], 0.3);
      }
      // Outer railing: posts, top and bottom rails, close-set balusters.
      box(t, 0.16, 0.12, GG.len, sx * GG.rail, 1.5, 0, 0);
      box(t, 0.12, 0.1, GG.len, sx * GG.rail, 0.34, 0, 0);
      for (let z = -GG.len / 2; z <= GG.len / 2; z += 0.32) box(t, 0.035, 1.12, 0.035, sx * GG.rail, 0.92, z, 0);
      for (let z = -GG.len / 2; z <= GG.len / 2; z += 3.2) box(t, 0.14, 1.34, 0.14, sx * GG.rail, 0.87, z, 0);
      // Light standards on the cable line: pole and outreach arm.
      for (const z of [-52, -18, 6, 30, 54]) {
        cyl(t, 0.09, 0.15, 8, sx * 10.95, 4, z, 0, { seg: 10 });
        box(t, 1.9, 0.12, 0.12, sx * 10.1, 7.95, z, 0);
      }
    }
  }, { receive: false });

  // Traffic barrier between roadway and the cable line.
  bake(g, mat(0x9aa1a8, { rough: 0.45, metal: 0.6 }), (t) => {
    for (const sx of [-1, 1]) {
      for (let z = -GG.len / 2; z <= GG.len / 2; z += 2.5) box(t, 0.12, 0.82, 0.12, sx * GG.barrier, 0.41, z, 0);
      for (const y of [0.55, 0.82]) box(t, 0.1, 0.22, GG.len, sx * GG.barrier, y, 0, 0);
    }
  });
  // Lamp heads, and the lamps themselves: sodium at night, barely on by day.
  bake(g, mat(0x3a3f45, { rough: 0.5, metal: 0.5 }), (t) => {
    for (const sx of [-1, 1]) for (const z of [-52, -18, 6, 30, 54]) box(t, 0.5, 0.2, 0.9, sx * 9.2, 7.88, z, 0);
  });
  const lampI = night ? 2.4 : dusk ? 1.5 : 0.3;
  bake(g, mat(0xffd9a0, { emissive: 0xffd9a0, ei: lampI, rough: 0.4 }), (t) => {
    for (const sx of [-1, 1]) for (const z of [-52, -18, 6, 30, 54]) box(t, 0.4, 0.05, 0.7, sx * 9.2, 7.76, z, 0);
  });

  // ---- the tower: riveted legs and portal struts, saddles, aviation lights
  const legTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { cols: 2, rows: 4 }), { px: 512 });
  legTex.repeat?.set?.(1, 9);
  const legMat = texturedMat(legTex, { rough: 0.62, metal: 0.3 });
  const strutTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { cols: 4, rows: 2 }), { px: 512 });
  strutTex.repeat?.set?.(5, 1);
  const strutMat = texturedMat(strutTex, { rough: 0.62, metal: 0.3 });
  const beacons = [];
  for (const sx of [-1, 1]) {
    const x = sx * GG.cable;
    box(g, 2.0, 60, 5.0, x, -16, GG.towerZ, GG_ORANGE, { cast: false }).material = legMat;
    box(g, 1.7, 30.8, 4.2, x, 29.4, GG.towerZ, GG_ORANGE, { cast: false }).material = legMat;
    box(g, 2.3, 2.0, 4.8, x, 45.8, GG.towerZ, GG_ORANGE, { cast: false }).material = strutMat;
    beacons.push(own(ball(g, 0.3, x, 47.9, GG.towerZ, 0xff3b30, { emissive: 0xff3b30, ei: 2, cast: false, seg: 10, seg2: 8 })));
  }
  for (const [y, h] of [[11.8, 2.8], [25.2, 2.6], [38.2, 2.4]]) {
    box(g, GG.cable * 2 - 1.7, h, 2.4, 0, y, GG.towerZ, GG_ORANGE, { cast: false }).material = strutMat;
  }

  // ---- main cables, cable bands and suspender ropes
  const cableMat = { rough: 0.62, metal: 0.35, steps: 140, seg: 10, cast: false };
  for (const sx of [-1, 1]) {
    const x = sx * GG.cable;
    const pts = [[x, 22, -60], [x, 31, -52], [x, 40, -43], [x, GG.saddle, GG.towerZ]];
    for (let z = GG.towerZ + 4; z <= GG.len / 2; z += 4) pts.push([x, ggCableY(z), z]);
    hose(g, pts, 0.42, GG_ORANGE, cableMat);
  }
  const hangers = [];
  for (let z = GG.towerZ + 4.5; z <= GG.len / 2 - 1; z += 4.25) hangers.push(z);
  bake(g, orange, (t) => {
    for (const sx of [-1, 1]) {
      box(t, 1.7, 1.4, 3.6, sx * GG.cable, GG.saddle + 0.4, GG.towerZ, 0);
      for (const z of hangers) {
        box(t, 0.95, 0.55, 0.9, sx * GG.cable, ggCableY(z), z, 0);
        box(t, 0.34, 0.42, 0.6, sx * GG.cable, 0.21, z, 0);
      }
    }
  }, { receive: false });
  bake(g, mat(0xa9401a, { rough: 0.7, metal: 0.3 }), (t) => {
    for (const sx of [-1, 1]) for (const z of hangers) {
      const top = ggCableY(z) - 0.3, len = top - 0.4;
      for (const dz of [-0.14, 0.14]) box(t, 0.07, len, 0.07, sx * GG.cable, 0.4 + len / 2, z + dz, 0);
    }
  }, { receive: false });

  // ---- the cable traveller, parked on the strait-side main cable
  const tz = -9;
  const trav = group(g, -GG.cable, ggCableY(tz), tz);
  trav.rotation.x = -Math.atan(ggCableSlope(tz));
  bake(trav, mat(0x2a2f35, { rough: 0.6, metal: 0.5 }), (t) => {
    for (const z of [-1.1, 1.1]) for (const x of [-0.2, 0.2]) cyl(t, 0.22, 0.22, 0.14, x, 0.66, z, 0, { seg: 14 }).rotation.z = Math.PI / 2;
  });
  bake(trav, mat(CITY.hiVis, { rough: 0.55, metal: 0.3 }), (t) => {
    for (const sx of [-1, 1]) {
      box(t, 0.08, 1.9, 2.7, sx * 0.62, -0.05, 0, 0);
      for (const z of [-1.15, 1.15]) box(t, 0.05, 1.0, 0.05, sx * 1.55, -0.4, z, 0);
      box(t, 0.05, 0.05, 2.35, sx * 1.55, 0.1, 0, 0);
    }
    for (const z of [-1.1, 1.1]) box(t, 1.32, 0.12, 0.14, 0, 0.9, z, 0);
  }, { receive: false });
  box(trav, 3.2, 0.08, 2.4, 0, -0.95, 0, 0x5a636c, { rough: 0.7, metal: 0.5, cast: false });
  const travLamp = own(ball(trav, 0.12, 0, 1.05, 0, 0xf2a03a, { emissive: 0xf2a03a, ei: 1.8, cast: false, seg: 8, seg2: 6 }));

  // ---- the lane closure: a taper into the tangent, and the arrow board
  // upstream of it. Traffic runs toward −z in the lanes left open (x > 3.5).
  const cones = [];
  for (let i = 0; i <= 7; i++) cones.push([-10.0 + (13.9 * i) / 7, 46 - (24 * i) / 7]);
  for (let z = 18.5; z >= -27; z -= 3.5) cones.push([3.9, z]);
  bake(g, mat(0xe4622a, { rough: 0.75 }), (t) => { for (const [x, z] of cones) cyl(t, 0.035, 0.16, 0.7, x, 0.37, z, 0, { seg: 12 }); }, { receive: false });
  bake(g, mat(0xe8eef2, { rough: 0.45, emissive: 0x9aa3aa, ei: night ? 0.7 : 0.1 }), (t) => {
    for (const [x, z] of cones) { cyl(t, 0.1, 0.12, 0.1, x, 0.46, z, 0, { seg: 12 }); cyl(t, 0.066, 0.08, 0.07, x, 0.61, z, 0, { seg: 12 }); }
  }, { receive: false });
  bake(g, mat(0x22262b, { rough: 0.9 }), (t) => { for (const [x, z] of cones) box(t, 0.38, 0.03, 0.38, x, 0.015, z, 0); });

  const ab = group(g, -8.2, 0, 50);
  bake(ab, mat(0xe8b830, { rough: 0.6, metal: 0.3 }), (t) => {
    box(t, 1.7, 0.55, 2.3, 0, 0.75, 0, 0);
    box(t, 0.14, 0.14, 1.4, 0, 0.55, -1.8, 0);
    box(t, 0.16, 2.4, 0.16, 0, 2.0, 0.5, 0);
    box(t, 2.6, 1.4, 0.12, 0, 3.4, 0.62, 0);
  }, { receive: false });
  bake(ab, mat(0x1a1e23, { rough: 0.9 }), (t) => { for (const sx of [-1, 1]) cyl(t, 0.34, 0.34, 0.22, sx * 0.95, 0.34, 0.2, 0, { seg: 14 }).rotation.z = Math.PI / 2; });
  // The lamp panel: amber dots in an arrow pointing into the open lanes.
  const board = decal(ab, 2.4, 1.2, 0, 3.4, 0.69, (cx, w, h) => {
    cx.fillStyle = "#07090b"; cx.fillRect(0, 0, w, h);
    const dot = (x, y) => { cx.fillStyle = "#ffb13a"; try { cx.beginPath(); cx.arc(x, y, h * 0.035, 0, Math.PI * 2); cx.fill(); } catch { cx.fillRect(x - 3, y - 3, 6, 6); } };
    const cyM = h / 2, step = h * 0.1;
    for (let x = w * 0.14; x <= w * 0.7; x += step) dot(x, cyM);
    for (let k = 1; k <= 4; k++) { dot(w * 0.78 - k * step, cyM - k * step); dot(w * 0.78 - k * step, cyM + k * step); }
    dot(w * 0.78, cyM);
  }, { px: 512, glow: true, ei: 1.8 });

  // A crew truck inside the closure, beacon turning.
  const truck = group(g, -6.6, 0, -9);
  bake(truck, mat(0xe6e9ec, { rough: 0.5, metal: 0.3 }), (t) => {
    box(t, 2.2, 1.7, 4.2, 0, 1.45, 0.9, 0);
    box(t, 2.2, 1.4, 1.9, 0, 1.3, -2.2, 0);
  }, { receive: false });
  box(truck, 2.1, 0.55, 0.06, 0, 1.75, -3.16, 0x1d2630, { rough: 0.2, metal: 0.6, cast: false });
  bake(truck, mat(0x1a1e23, { rough: 0.9 }), (t) => { for (const z of [-2.1, 1.9]) for (const sx of [-1, 1]) cyl(t, 0.42, 0.42, 0.3, sx * 1.0, 0.42, z, 0, { seg: 14 }).rotation.z = Math.PI / 2; });
  const truckLamp = own(box(truck, 0.9, 0.16, 0.26, 0, 2.1, -2.2, 0xf2a03a, { emissive: 0xf2a03a, ei: 1.6, cast: false }));

  // Traffic in the lanes left open.
  const cars = [];
  for (const [x, tone, v, ph] of [[5.2, 0x2b4a6b, 9, 0], [8.7, 0xc9ccd0, 12, 60]]) {
    const c = group(g, x, 0, 0);
    const moving = { receive: false, noMerge: true };
    bake(c, mat(tone, { rough: 0.35, metal: 0.55 }), (t) => { box(t, 1.8, 0.75, 4.4, 0, 0.62, 0, 0); box(t, 1.6, 0.6, 2.2, 0, 1.22, 0.2, 0); }, moving);
    bake(c, mat(0x151b22, { rough: 0.9 }), (t) => { for (const z of [-1.4, 1.4]) for (const sx of [-1, 1]) cyl(t, 0.33, 0.33, 0.22, sx * 0.82, 0.33, z, 0, { seg: 12 }).rotation.z = Math.PI / 2; }, moving);
    bake(c, mat(0xfff1d6, { emissive: 0xfff1d6, ei: night ? 2.4 : 1.2, rough: 0.3 }), (t) => { for (const sx of [-1, 1]) box(t, 0.36, 0.14, 0.05, sx * 0.62, 0.72, -2.21, 0); }, moving);
    cars.push({ c, v, ph });
  }

  // ---- the bay far below, the far shores, the marine layer
  const waterTex = bayWater(g, { y: GG.water, r: 200, repeat: 44 });
  for (const [x, z, rx, ry, rz, tone] of [[-34, -122, 70, 62, 36, 0x3a4636], [44, 124, 60, 50, 30, 0x3c443a], [70, -96, 40, 34, 26, 0x39433a]]) {
    ball(g, 1, x, GG.water, z, tone, { rough: 1, cast: false, receive: false, seg: 16, seg2: 12 }).scale.set(rx, ry, rz);
  }
  const tone = night ? "118,132,146" : dusk ? "214,196,196" : "236,240,243";
  // The marine layer: patchy sheets under the deck with the water showing
  // between them, banks standing up off the strait side, one crossing the
  // road far ahead, and a wisp the tower top stands out of.
  const puff = (a, n = 26) => (cx, w, h) => fogPuffFace(cx, w, h, { tone, alpha: a, puffs: n });
  const fogs = [
    sheet(g, 260, 260, puff(0.32, 12), { y: -18, rx: -Math.PI / 2, opacity: 0.7, repeat: 3 }),
    sheet(g, 260, 260, puff(0.38, 14), { y: -32, rx: -Math.PI / 2, opacity: 0.8, repeat: 2 }),
    sheet(g, 220, 60, puff(0.4), { x: -70, y: -8, ry: Math.PI / 2, opacity: 0.85, repeat: 2 }),
    sheet(g, 240, 70, puff(0.46), { x: -100, y: 0, ry: Math.PI / 2, opacity: 0.95, repeat: 2 }),
    sheet(g, 120, 34, puff(0.38), { z: -78, y: 6, opacity: 0.7, repeat: 2 }),
    sheet(g, 70, 70, puff(0.34), { z: GG.towerZ, y: 35, rx: -Math.PI / 2, opacity: 0.55, repeat: 1 }),
  ];

  return (tt, dt = 0.016) => {
    slide(waterTex, tt * 0.003, Math.sin(tt * 0.05) * 0.02);
    for (let i = 0; i < fogs.length; i++) slide(fogs[i].tex, tt * (0.004 + i * 0.0015), Math.sin(tt * 0.03 + i) * 0.02);
    for (let i = 0; i < beacons.length; i++) beacons[i].material.emissiveIntensity = Math.sin(tt * 2.1 + i * 0.4) > 0.2 ? 2.6 : 0.3;
    board.material.emissiveIntensity = (tt % 1.2) < 0.75 ? 1.8 : 0.12;
    travLamp.material.emissiveIntensity = Math.sin(tt * 3.1) > 0 ? 2.2 : 0.4;
    truckLamp.material.emissiveIntensity = 0.8 + Math.max(0, Math.sin(tt * 5.2)) * 1.6;
    for (const car of cars) car.c.position.z = GG.len / 2 - ((tt * car.v + car.ph) % GG.len);
    void dt;
  };
}

// The bottom of the bay: the learner stands on silt at y = 0 beside a
// pier's piles, a ship's hull alongside, and the dive stage they came down on.
const UW_PILES = [[-10, -7], [-6, -7], [-2, -7], [2, -7], [-10, -12.5], [-6, -12.5], [-2, -12.5], [2, -12.5], [-10, -2], [-10, 3.5]];

/**
 * bay-underwater: blue-green water closing in a few metres out, a caustic
 * net of light sliding over the silt, the piles and the hull, bubbles, a
 * pier's piles ringed with marine growth, a ship's side plate with its weld
 * seams and zinc anodes, a dive stage with rails on the bottom, and the
 * umbilical rising from it to the glow of the surface.
 */
function bayUnderwater(g, env) {
  const k = { night: 0.3, dusk: 0.65, day: 1 }[env.time] ?? 1;
  const cTone = 0xa8f0e0;
  // Down-welling light off the surface, raking in from the pier side so the
  // ship's side plate (which faces the learner, away from the key) reads.
  flood(g, -12, 16, 3, 0x9fe6da, 0.9 * k);
  // One caustic canvas, three texture transforms: the floor, the piles and
  // the hull each tile it at their own scale, and all three slide.
  const caustic = surfaceTexture((cx, w, h) => causticFace(cx, w, h), { px: 256, repeat: 14 });
  const cPile = caustic.clone ? caustic.clone() : caustic;
  const cHull = caustic.clone ? caustic.clone() : caustic;
  cPile.repeat?.set?.(1.5, 9); cHull.repeat?.set?.(9, 3.5);
  cPile.needsUpdate = true; cHull.needsUpdate = true;
  const caustics = [caustic, cPile, cHull];

  // ---- the silt
  const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 512, repeat: 12 });
  const floor = cyl(g, 42, 42, 0.3, 0, -0.15, 0, 0x4a574d, { seg: 48, cast: false });
  const floorMat = texturedMat(siltTex, { rough: 1, metal: 0, color: 0xc2ccbc, emissive: cTone, ei: 0.3 * k });
  floorMat.emissiveMap = caustic;
  floor.material = floorMat;
  floor.receiveShadow = true;
  bake(g, mat(0x3f463f, { rough: 1 }), (t) => {
    for (const [x, z, r] of [[-6.5, 6.5, 0.5], [5.5, 6.8, 0.35], [-8, -4.5, 0.6], [6.2, -9, 0.45], [-4.2, -10, 0.4], [9, 9, 0.7], [-12, 8, 0.8]]) {
      ball(t, r, x, 0.02, z, 0, { seg: 10, seg2: 7 }).scale.set(1, 0.45, 0.8);
    }
  });

  // ---- the pier: piles, growth rings, mussel clumps, bracing
  const growthTex = surfaceTexture((cx, w, h) => growthFace(cx, w, h), { px: 512 });
  growthTex.repeat?.set?.(2, 1);
  const pileMat = texturedMat(growthTex, { rough: 0.95, metal: 0.02, emissive: cTone, ei: 0.26 * k });
  pileMat.emissiveMap = cPile;
  bake(g, pileMat, (t) => { for (const [x, z] of UW_PILES) cyl(t, 0.3, 0.32, 20, x, 10, z, 0, { seg: 16 }); });
  bake(g, mat(0x56613f, { rough: 1 }), (t) => {
    UW_PILES.forEach(([x, z], i) => {
      for (const [y, hh] of [[0.35 + (i % 3) * 0.2, 0.5], [1.7 + (i % 2) * 0.4, 0.34], [3.3 + (i % 4) * 0.3, 0.26]]) cyl(t, 0.4, 0.43, hh, x, y, z, 0, { seg: 16 });
    });
  }, { receive: false });
  bake(g, mat(0x1c1f2a, { rough: 0.8, metal: 0.1 }), (t) => {
    UW_PILES.forEach(([x, z], i) => {
      for (let j = 0; j < 4; j++) { const a = i * 1.7 + j * 1.57; ball(t, 0.16 + (j % 2) * 0.05, x + Math.cos(a) * 0.36, 0.15 + (j % 3) * 0.18, z + Math.sin(a) * 0.36, 0, { seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    });
    torus(t, 0.36, 0.13, 7.4, 0.12, 7.8, 0, { seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
  }, { receive: false });
  // One pile has had a band scraped back to bare concrete for inspection.
  cyl(g, 0.325, 0.325, 0.5, -2, 1.25, -7, 0x9aa29c, { rough: 0.9, seg: 16, cast: false });
  bake(g, mat(0x3e3a30, { rough: 0.95 }), (t) => {
    for (const z of [-7, -12.5]) for (let i = 0; i < 3; i++) {
      const x0 = -10 + i * 4;
      bar(t, [x0, 3.2, z], [x0 + 4, 6.8, z], 0.16);
      bar(t, [x0, 6.8, z], [x0 + 4, 3.2, z], 0.16);
    }
    bar(t, [-10, 3.5, -7], [-10, 6.5, -2], 0.16);
  }, { receive: false });

  // ---- the ship alongside: side plate, bilge, flat of bottom, seams, anodes
  const hullTex = surfaceTexture((cx, w, h) => hullFace(cx, w, h), { px: 512, repeat: 1 });
  const hullMat = texturedMat(hullTex, { rough: 0.75, metal: 0.2, color: 0xffffff, emissive: cTone, ei: 0.08 * k });
  hullMat.emissiveMap = cHull;
  // The ship lies to +x: its side plate faces the learner at x = 7.4, just
  // past the edge of the roam circle, from 2.2m off the silt up into the
  // murk; below that the bilge turns away under the ship to the flat of
  // bottom, a metre off the silt.
  const H = { side: 7.4, top: 10, turn: 2.2, flatY: 1.2, flatOut: 13 };
  const sideH = H.top - H.turn, sideY = (H.top + H.turn) / 2;
  box(g, 0.5, sideH, 20, H.side, sideY, -2, 0x6e3328, { cast: false }).material = hullMat;
  const bilgeTurn = box(g, 0.5, 1.5, 20, H.side + 0.55, (H.turn + H.flatY) / 2, -2, 0x6e3328, { cast: false });
  bilgeTurn.material = hullMat;
  bilgeTurn.rotation.z = 0.83;
  box(g, H.flatOut - H.side - 1.1, 0.5, 20, (H.flatOut + H.side + 1.1) / 2, H.flatY, -2, 0x6e3328, { cast: false }).material = hullMat;
  box(g, 0.06, 0.7, 12, H.side + 0.32, H.flatY + 0.25, -2, 0x4f2a22, { rough: 0.8, metal: 0.2, cast: false }).rotation.z = -0.74;
  const face = H.side - 0.285;
  // Weld seams on the side plate: the horizontal seams, the vertical butts,
  // and the seam where the side meets the bilge strake.
  bake(g, mat(0x9a6452, { rough: 0.5, metal: 0.45 }), (t) => {
    for (const y of [H.turn + 0.1, 4.8, sideY + 1.3]) box(t, 0.07, 0.08, 20, face, y, -2, 0);
    for (const z of [-5.33, 1.33]) box(t, 0.07, sideH, 0.08, face, sideY, z, 0);
  }, { receive: false });
  // Zinc anodes welded to the side plate; the second is wasted away to half
  // its size — the thing a hull inspection is looking for.
  bake(g, mat(0xa3a9ad, { rough: 0.5, metal: 0.65 }), (t) => {
    for (const [z, len] of [[-3.5, 1.0], [3.0, 0.55], [6.8, 1.0]]) {
      box(t, 0.2, len > 0.8 ? 0.3 : 0.18, len, face - 0.1, 3.1, z, 0);
      for (const dz of [-len / 2 - 0.08, len / 2 + 0.08]) box(t, 0.12, 0.06, 0.14, face - 0.06, 3.1, z + dz, 0);
    }
  }, { receive: false });

  // ---- the dive stage, its bridle and lift wire, the umbilical
  const stage = group(g, -4.3, 0, 2.8, 0.25);
  box(stage, 1.6, 0.06, 1.6, 0, 0.26, 0, 0x3a4048, { rough: 0.7, metal: 0.5, cast: false });
  bake(stage, mat(CITY.hiVis, { rough: 0.55, metal: 0.3 }), (t) => {
    for (const sx of [-1, 1]) {
      box(t, 0.1, 0.2, 1.8, sx * 0.7, 0.1, 0, 0);
      for (const sz of [-1, 1]) box(t, 0.08, 2.3, 0.08, sx * 0.8, 1.4, sz * 0.8, 0);
      box(t, 1.68, 0.08, 0.08, 0, 2.52, sx * 0.8, 0);
      box(t, 0.08, 0.08, 1.68, sx * 0.8, 2.52, 0, 0);
      box(t, 0.06, 0.06, 1.62, sx * 0.8, 1.35, 0, 0);
    }
    box(t, 1.62, 0.06, 0.06, 0, 1.35, -0.8, 0);
  }, { receive: false });
  bake(stage, mat(0x8b949d, { rough: 0.45, metal: 0.7 }), (t) => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bar(t, [sx * 0.8, 2.56, sz * 0.8], [0, 4.2, 0], 0.03);
    box(t, 0.04, 20, 0.04, 0, 14.2, 0, 0);
    torus(t, 0.12, 0.03, 0, 4.25, 0, 0, { seg: 6, seg2: 12 });
  }, { receive: false });
  box(stage, 0.42, 0.3, 0.26, 0.35, 0.44, -0.45, 0x2a3b33, { rough: 0.9, cast: false });
  hose(g, [[-7.9, 24, 9.2], [-6.8, 15, 7.4], [-5.4, 7, 5.0], [-4.6, 3.0, 3.4], [-3.7, 1.5, 2.7], [-3.0, 0.12, 3.1], [-2.2, 0.1, 4.0], [-1.4, 0.1, 4.7], [-0.8, 0.1, 5.1]], 0.055, 0xe8b830, { rough: 0.6, steps: 90, seg: 8, cast: false });

  // ---- light from above: the surface glow and a few shafts through it
  const glowTone = { night: 0x3a5058, dusk: 0x8fb0a0, day: 0xd8f4ec }[env.time] ?? 0xd8f4ec;
  sheet(g, 80, 80, (cx, w, h) => glowFace(cx, w, h), { x: -6, y: 26, z: 6, rx: Math.PI / 2, additive: true, fog: false, fade: false, color: glowTone, opacity: 0.9 });
  const shaftTex = surfaceTexture((cx, w, h) => {
    cx.clearRect?.(0, 0, w, h);
    let grad = null;
    try { grad = cx.createLinearGradient(0, 0, 0, h); } catch { grad = null; }
    if (grad && typeof grad.addColorStop === "function") { grad.addColorStop(0, "rgba(220,255,245,0.9)"); grad.addColorStop(1, "rgba(220,255,245,0)"); cx.fillStyle = grad; }
    else cx.fillStyle = "rgba(220,255,245,0.4)";
    cx.fillRect(w * 0.2, 0, w * 0.6, h);
  }, { px: 128, repeat: 1 });
  const shaftMat = new THREE.MeshBasicMaterial({ map: shaftTex, color: glowTone, transparent: true, opacity: 0.16 * k, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  shaftMat.userData.ownMaterial = true; shaftMat.userData.ownTexture = true;
  bake(g, shaftMat, (t) => {
    for (const [x, z, ry, w] of [[-5, -3, 0.3, 2.6], [3.5, -4, 1.2, 2.0], [-7.5, 5, 2.0, 3.0], [1.5, 7.5, 0.8, 1.8], [6, 2.5, 2.6, 2.2]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 26), shaftMat);
      m.position.set(x, 13, z); m.rotation.y = ry; m.rotation.z = 0.12;
      t.add(m);
    }
  }, { receive: false });

  // ---- life: bubbles from a diver under the hull and from the stage, gas
  // working out of the silt, drifting particulate, a small school of fish
  const bubbles = [
    { pts: particles(g, 44, 0xdaf6f0, { size: 0.07, opacity: 0.6, additive: false, life: 3.2 }), at: { x: 6.4, y: 1.2, z: -1.5 }, spread: 0.35 },
    { pts: particles(g, 24, 0xdaf6f0, { size: 0.05, opacity: 0.55, additive: false, life: 3.0 }), at: { x: -4.0, y: 2.7, z: 2.5 }, spread: 0.25 },
    { pts: particles(g, 14, 0xdaf6f0, { size: 0.045, opacity: 0.5, additive: false, life: 2.6 }), at: { x: -7.6, y: 0.1, z: -4.2 }, spread: 0.2 },
  ];
  const snow = particles(g, 140, 0xcfd8c8, { size: 0.035, opacity: 0.45, additive: false, life: 9 });
  // particles() draws square points; a bubble is a bright ring, so each
  // cloud gets a small round sprite of its own (freed with its material).
  for (const b of [...bubbles.map((x) => x.pts), snow]) {
    b.visible = true;
    const dot = surfaceTexture((cx, w, h) => {
      cx.clearRect?.(0, 0, w, h);
      cx.strokeStyle = "rgba(255,255,255,0.95)"; cx.lineWidth = w * 0.09;
      cx.fillStyle = "rgba(255,255,255,0.28)";
      try { cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2); cx.fill(); cx.stroke(); } catch { cx.fillRect(w * 0.2, h * 0.2, w * 0.6, h * 0.6); }
    }, { px: 32, repeat: 1 });
    b.material.map = dot;
    b.material.alphaTest = 0.05;
    b.material.userData.ownTexture = true;
  }
  const school = group(g, -5.5, 3.8, -3.2);
  bake(school, mat(0xb8c4c8, { rough: 0.35, metal: 0.7 }), (t) => {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, r = 1.4 + (i % 3) * 0.35;
      const f = ball(t, 0.1, Math.cos(a) * r, ((i * 7) % 5) * 0.16 - 0.3, Math.sin(a) * r, 0, { seg: 8, seg2: 6 });
      f.scale.set(0.35, 0.7, 1.5); f.rotation.y = -a;
    }
  }, { receive: false, noMerge: true });
  const snowAt = { x: 0, y: 2.6, z: 0 };

  return (tt, dt = 0.016) => {
    slide(caustic, tt * 0.011, Math.sin(tt * 0.21) * 0.04);
    slide(cPile, Math.sin(tt * 0.17) * 0.05, tt * 0.009);
    slide(cHull, tt * 0.008, Math.cos(tt * 0.19) * 0.04);
    floorMat.emissiveIntensity = 0.3 * k * (0.82 + Math.sin(tt * 0.7) * 0.18);
    pileMat.emissiveIntensity = 0.26 * k * (0.82 + Math.sin(tt * 0.6 + 1) * 0.18);
    hullMat.emissiveIntensity = 0.08 * k * (0.82 + Math.sin(tt * 0.5 + 2) * 0.18);
    shaftMat.opacity = 0.16 * k * (0.75 + Math.sin(tt * 0.35) * 0.25);
    for (const b of bubbles) b.pts.userData.step(dt, b.at, b.spread, 0.8, 0.35);
    snow.userData.step(dt, snowAt, 18, 0.06, -0.004);
    school.rotation.y = tt * 0.32;
    school.position.y = 3.8 + Math.sin(tt * 0.4) * 0.3;
  };
}

// ------------------------------------------------------------------ gym-court
//
// An indoor school or recreation-centre gym, generic: a maple floor with the
// lines of a high-school-sized court, a hoop on a stanchion behind each
// baseline, folding bleachers down both sidelines, padded walls, exit doors,
// and a scoreboard on the far wall. The learner stands on the floor at the
// centre circle; the station is built on top of it. Nothing here is any real
// gym. Court markings are drawn to the familiar proportions and are scenery,
// not a rules reference — no dimension in the station text rests on them.
const GYM = {
  halfL: 13, halfW: 7.5,      // the court lines
  floorL: 32, floorW: 20,     // the maple, wall to wall
  wallH: 9, rim: 3.05,
  basket: 11.75,              // basket centre from the half-court line
};

/** Maple strip flooring: narrow boards in slightly varied tones, staggered
 *  end joints and a fine grain, under a satin finish. */
function hardwoodFace(g, w, h) {
  const boards = 16, bw = w / boards;
  for (let i = 0; i < boards; i++) {
    let y = -((i * 37) % 97);
    while (y < h) {
      const len = 90 + ((i * 53 + y * 7) % 110);
      const tone = 196 + ((i * 31 + Math.round(y) * 3) % 26);
      g.fillStyle = `rgb(${tone},${Math.round(tone * 0.74)},${Math.round(tone * 0.46)})`;
      g.fillRect(i * bw, y, bw, len);
      g.fillStyle = "rgba(90,52,20,0.18)";
      for (let k = 0; k < 4; k++) g.fillRect(i * bw + 2 + k * (bw / 4), y + 4, 1, len - 8);
      g.fillStyle = "rgba(60,34,12,0.55)";
      g.fillRect(i * bw, y + len - 1, bw, 1.5);
      y += len;
    }
    g.fillStyle = "rgba(60,34,12,0.4)";
    g.fillRect(i * bw, 0, 1, h);
  }
}

/** Painted concrete block: a warm off-white with the mortar grid. */
function blockWallFace(g, w, h) {
  g.fillStyle = "#d9d4c8"; g.fillRect(0, 0, w, h);
  const rows = 8, bh = h / rows, bl = w / 4;
  g.fillStyle = "rgba(120,112,98,0.55)";
  for (let r = 0; r < rows; r++) {
    g.fillRect(0, r * bh, w, 2);
    const off = r % 2 ? bl / 2 : 0;
    for (let x = off; x < w; x += bl) g.fillRect(x, r * bh, 2, bh);
  }
}

function scoreboardFace(g, w, h, clock = "00:00") {
  g.fillStyle = "#0b0d10"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#c8a24a"; g.lineWidth = Math.max(3, h * 0.02); g.strokeRect(6, 6, w - 12, h - 12);
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "#f2efe6"; g.font = `700 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText("HOME", w * 0.18, h * 0.2); g.fillText("GUEST", w * 0.82, h * 0.2); g.fillText("PRACTICE", w * 0.5, h * 0.2);
  g.fillStyle = "#ff5a36"; g.font = `700 ${Math.round(h * 0.34)}px 'Courier New', monospace`;
  g.fillText("00", w * 0.18, h * 0.55); g.fillText("00", w * 0.82, h * 0.55);
  g.fillStyle = "#ffcf4a"; g.fillText(clock, w * 0.5, h * 0.55);
  g.fillStyle = "#9fe0a8"; g.font = `700 ${Math.round(h * 0.1)}px Arial, sans-serif`;
  g.fillText("PERIOD 1", w * 0.5, h * 0.85);
}

/** One hoop on a padded stanchion behind the baseline at x = side·halfL. */
function gymHoop(g, side) {
  const bx = side * GYM.basket, bb = side * (GYM.basket + 0.38);
  const base = side * (GYM.halfL + 1.5);
  box(g, 1.2, 0.5, 1.4, base, 0.25, 0, 0x1f3a6b, { rough: 0.8 });
  box(g, 0.5, 1.9, 0.5, base, 1.2, 0, 0x1f3a6b, { rough: 0.85 });
  cyl(g, 0.09, 0.11, 2.6, base, 3.1, 0, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
  const arm = box(g, Math.abs(base - bb), 0.14, 0.14, (base + bb) / 2, 3.65, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
  arm.rotation.z = side * 0.06;
  const board = box(g, 0.04, 1.07, 1.83, bb, 3.45, 0, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.55, transparent: true, cast: false });
  void board;
  box(g, 0.05, 0.45, 0.59, bb - side * 0.01, 3.27, 0, 0xf4f4f4, { rough: 0.5, emissive: 0xffffff, ei: 0.15, cast: false });
  const rim = torus(g, 0.23, 0.012, bx, GYM.rim, 0, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
  rim.rotation.x = Math.PI / 2;
  cyl(g, 0.23, 0.15, 0.42, bx, GYM.rim - 0.22, 0, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.55, transparent: true, seg: 14, cast: false });
}

/**
 * gym-court: the indoor court a youth-sports station stands on. Returns the
 * frame animation: the scoreboard's practice clock, repainted once a second.
 */
function gymCourt(g, env) {
  const day = env.time === "day";
  // Two lights of its own: a broad fill from the roof fixtures and a warmer
  // key from the clerestory side so the far wall and bleachers read.
  flood(g, 0, 8.6, 6, 0xfff2dc, day ? 1.0 : 0.85);
  flood(g, -10, 7, -4, 0xffe6c0, 0.55);

  // ---- the floor: maple wall to wall, a satin finish that holds the light
  const woodTex = surfaceTexture(hardwoodFace, { px: 512, repeat: 8 });
  woodTex.repeat?.set?.(10, 6);
  const floor = box(g, GYM.floorL, 0.1, GYM.floorW, 0, -0.05, 0, 0xc89a62, { cast: false });
  floor.material = texturedMat(woodTex, { rough: 0.42, metal: 0.04, color: 0xf2e2c8 });
  floor.receiveShadow = true;

  // Painted lanes and the centre circle, in the home colour.
  bake(g, mat(0x7a1f2b, { rough: 0.5 }), (t) => {
    for (const side of [-1, 1]) box(t, 5.8, 0.006, 4.9, side * (GYM.halfL - 2.9), 0.004, 0, 0);
    cyl(t, 1.8, 1.8, 0.006, 0, 0.004, 0, 0, { seg: 40 });
  }, { receive: true });

  // Every line on the court in one mesh.
  bake(g, mat(0xf6f4ee, { rough: 0.5 }), (t) => {
    const L = (w, d, x, z) => box(t, w, 0.008, d, x, 0.006, z, 0);
    // A painted circle as short chords: flat parts the layout checker reads
    // as floor markings rather than as a ring standing up.
    const ring = (cx, cz, r) => {
      const n = 28, chord = 2 * r * Math.sin(Math.PI / n) + 0.01;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        box(t, 0.05, 0.008, chord, cx + Math.cos(a) * r, 0.006, cz + Math.sin(a) * r, 0).rotation.y = -a;
      }
    };
    for (const s of [-1, 1]) {
      L(GYM.halfL * 2 + 0.05, 0.05, 0, s * GYM.halfW);                     // sideline
      L(0.05, GYM.halfW * 2, s * GYM.halfL, 0);                             // baseline
      for (const zz of [-2.45, 2.45]) L(5.8, 0.05, s * (GYM.halfL - 2.9), zz); // lane lines
      L(0.05, 4.9, s * (GYM.halfL - 5.8), 0);                               // free-throw line
      ring(s * (GYM.halfL - 5.8), 0, 1.8);
      // The arc, as short chords around the basket.
      const R = 6.02, bx = s * GYM.basket;
      for (let k = 0; k <= 18; k++) {
        const a = -1.35 + (k / 18) * 2.7;
        const seg = box(t, 0.05, 0.008, 0.72, bx - s * Math.cos(a) * R, 0.006, Math.sin(a) * R, 0);
        seg.rotation.y = s * a;
      }
      for (const zz of [-1, 1]) L(Math.max(0.05, GYM.halfL - GYM.basket), 0.05, s * (GYM.halfL - (GYM.halfL - GYM.basket) / 2), zz * 6.02);
    }
    L(0.05, GYM.halfW * 2, 0, 0);                                           // half-court line
    ring(0, 0, 1.8);
  }, { receive: true });

  // ---- walls, wall pads, ceiling and trusses
  const wallTex = surfaceTexture(blockWallFace, { px: 256, repeat: 6 });
  bake(g, texturedMat(wallTex, { rough: 0.9, color: 0xffffff }), (t) => {
    box(t, GYM.floorL, GYM.wallH, 0.3, 0, GYM.wallH / 2, -GYM.floorW / 2 - 0.15, 0);
    box(t, GYM.floorL, GYM.wallH, 0.3, 0, GYM.wallH / 2, GYM.floorW / 2 + 0.15, 0);
    box(t, 0.3, GYM.wallH, GYM.floorW, -GYM.floorL / 2 - 0.15, GYM.wallH / 2, 0, 0);
    box(t, 0.3, GYM.wallH, GYM.floorW, GYM.floorL / 2 + 0.15, GYM.wallH / 2, 0, 0);
  }, { receive: true });
  bake(g, mat(0x1f3a6b, { rough: 0.85 }), (t) => {
    // Padding on the end walls behind the baskets, where a player running
    // out the baseline actually lands.
    for (const s of [-1, 1]) box(t, 0.12, 1.9, 12, s * (GYM.floorL / 2 - 0.06), 1.15, 0, 0);
  });
  box(g, GYM.floorL + 0.6, 0.25, GYM.floorW + 0.6, 0, GYM.wallH + 0.12, 0, 0x2a2d31, { rough: 0.9, cast: false });
  bake(g, mat(0x4a4f56, { rough: 0.6, metal: 0.5 }), (t) => {
    for (let i = -3; i <= 3; i++) box(t, 0.18, 0.5, GYM.floorW, i * 4.4, GYM.wallH - 0.3, 0, 0);
  }, { receive: false });
  bake(g, mat(0xfff6e0, { emissive: 0xfff6e0, ei: 1.6, rough: 0.4 }), (t) => {
    for (let i = -3; i <= 3; i++) for (const z of [-5, 0, 5]) box(t, 0.9, 0.08, 0.9, i * 4.4 + 2.2, GYM.wallH - 0.7, z, 0);
  }, { receive: false });

  // ---- bleachers: five rows on the far side, three behind the learner
  const bleacherRows = (t, zFront, dir, rows) => {
    for (let r = 0; r < rows; r++) box(t, 20, 0.45 * (r + 1), 0.8, 0, 0.225 * (r + 1), zFront + dir * (0.4 + r * 0.8), 0);
  };
  bake(g, mat(0x6b7078, { rough: 0.7, metal: 0.3 }), (t) => { bleacherRows(t, -8.6, -1, 5); bleacherRows(t, 8.6, 1, 3); });
  bake(g, mat(0xb88a54, { rough: 0.55 }), (t) => {
    for (let r = 0; r < 5; r++) box(t, 20, 0.05, 0.34, 0, 0.45 * (r + 1) + 0.03, -8.6 - (0.25 + r * 0.8), 0);
    for (let r = 0; r < 3; r++) box(t, 20, 0.05, 0.34, 0, 0.45 * (r + 1) + 0.03, 8.6 + (0.25 + r * 0.8), 0);
  });
  bake(g, mat(0xc9ced4, { rough: 0.4, metal: 0.7 }), (t) => {
    for (const x of [-10, 10]) {
      box(t, 0.05, 1.0, 4.0, x, 2.1, -10.6 + 2.0, 0).rotation.x = -0.51;
      box(t, 0.05, 0.9, 2.4, x, 1.3, 8.6 + 1.2, 0).rotation.x = 0.51;
    }
  }, { receive: false });

  // ---- the scoreboard on the far wall, and the banners either side of it
  box(g, 5.2, 2.2, 0.3, 0, 6.1, -GYM.floorW / 2 + 0.05, 0x14171b, { rough: 0.6, metal: 0.3, cast: false });
  const sb = decal(g, 4.9, 1.95, 0, 6.1, -GYM.floorW / 2 + 0.22, (c, w, h) => scoreboardFace(c, w, h), { px: 512, glow: true, ei: 1.1 });
  for (const [x, text] of [[-8.5, "FUNDAMENTALS FIRST"], [8.5, "HYDRATE · REST · RESPECT"]]) {
    decal(g, 3.6, 0.9, x, 6.4, -GYM.floorW / 2 + 0.2, gymBanner(text), { px: 384 });
  }

  // ---- doors: two exits on the end walls, each lit
  for (const s of [-1, 1]) {
    box(g, 0.12, 2.2, 1.8, s * (GYM.floorL / 2 - 0.02), 1.1, -7.2, 0x6b4a2e, { rough: 0.6 });
    box(g, 0.1, 0.3, 0.7, s * (GYM.floorL / 2 - 0.06), 2.55, -7.2, 0xd8261e, { emissive: 0xff3a2a, ei: 1.8, rough: 0.4, cast: false });
  }

  gymHoop(g, -1); gymHoop(g, 1);

  let lastSecond = -1;
  return (tt) => {
    const sec = Math.floor(tt);
    if (sec === lastSecond) return;
    lastSecond = sec;
    const left = Math.max(0, 8 * 60 - (sec % (8 * 60)));
    const clock = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
    if (sb.userData?.ctx) repaint(sb, (c, w, h) => scoreboardFace(c, w, h, clock));
  };
}

/** A plain painted banner. */
function gymBanner(text) {
  return (c, w, h) => {
    c.fillStyle = "#7a1f2b"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#f2efe6"; c.fillRect(0, h * 0.08, w, h * 0.04); c.fillRect(0, h * 0.88, w, h * 0.04);
    c.textAlign = "center"; c.textBaseline = "middle";
    let px = Math.round(h * 0.34);
    c.font = `700 ${px}px 'Barlow Condensed', Arial, sans-serif`;
    const tw = c.measureText?.(text)?.width;
    if (tw && tw > w * 0.9) { px = Math.floor(px * (w * 0.9) / tw); c.font = `700 ${px}px 'Barlow Condensed', Arial, sans-serif`; }
    c.fillText(text, w / 2, h * 0.52);
  };
}

// ------------------------------------------------------------------ table

// A baseline horizon dressing every district inherits unless it names its
// own `dressing` (a category-specific one below) or turns it off with
// `dressing: null` (the underwater and gym-court scenic districts, which
// stand the learner on a floor these props would sit on top of).
const DEFAULT_DRESSING = [
  { prop: "parkBench", x: -15, z: -8, ry: 0.3 },
  { prop: "streetTree:medium", x: 15, z: -8 },
  { prop: "bollardRow", x: 0, z: -10.5, opts: { count: 3 } },
];
const DEFAULT = { sky: 0x0b1220, fog: 0x0f1726, hemi: [0x7f95aa, 0x1a2230], mast: 0xdfeaf2, build: null, dressing: DEFAULT_DRESSING };

export const DISTRICTS = {
  "Energy & Power": {
    sky: 0x07090f, fog: 0x0a0c12, hemi: [0x7a8aa0, 0x151511], mast: 0xffd9a0,
    dressing: [
      { prop: "fuelTank", x: -17, z: -7, ry: 0.4 },
      { prop: "generatorSkid", x: 17, z: -7, ry: -0.3 },
      { prop: "jerseyBarrier", x: 0, z: -11.2 },
    ],
    build(g) {
      flood(g, 0, 16, -24, 0xffd9a0);
      const arms = [pylon(g, -26, -26, 15, 0.35), pylon(g, 0, -31, 17, 0), pylon(g, 26, -26, 15, -0.35)];
      for (let i = 0; i < arms.length - 1; i++) for (let k = 0; k < 6; k++) span(g, arms[i][k], arms[i + 1][k], 0.035);
      pylon(g, -30, 14, 13, 1.2); pylon(g, 30, 14, 13, -1.2);
      return null;
    },
  },
  "Mobility & Transit": {
    sky: 0x070a12, fog: 0x0a0e18, hemi: [0x6d8296, 0x121820], mast: 0xe9f1f7,
    dressing: [
      { prop: "parkBench", x: -16, z: -6.5, ry: 0.3 },
      { prop: "streetTree:medium", x: 16, z: -6.5 },
      { prop: "bollardRow", x: 0, z: -10, opts: { count: 4 } },
    ],
    build(g) {
      flood(g, 0, 14, -20, 0xe9f1f7);
      const gw = guideway(g);
      return (t) => {
        gw.train.position.x = ((t * 3.2) % (gw.span + 30)) - gw.span / 2 - 15;
        const stop = Math.sin(t * 0.7) > 0;
        for (let i = 0; i < gw.lamps.length; i += 2) { gw.lamps[i].material.emissiveIntensity = stop ? 1.8 : 0.25; gw.lamps[i + 1].material.emissiveIntensity = stop ? 0.25 : 1.8; }
      };
    },
  },
  "Water & Environmental": {
    sky: 0x06101a, fog: 0x0a1620, hemi: [0x5f8aa8, 0x0f1a22], mast: 0xd6ecf7,
    dressing: [
      { prop: "cableSpool", x: -17, z: -7, opts: { material: "steel" } },
      { prop: "fireHydrant", x: 17, z: -7 },
      { prop: "jerseyBarrier", x: 0, z: -11.2 },
    ],
    build(g) {
      flood(g, 0, 12, -22, 0xd6ecf7);
      water(g, 0x0b1e2c);
      for (const x of [-24, 24]) {
        const tank = group(g, x, -1.5, -25);
        cyl(tank, 7, 7, 2.4, 0, 1.2, 0, 0x8b949d, { rough: 0.6, metal: 0.3, seg: 32, open: true, cast: false, receive: false });
        cyl(tank, 6.7, 6.7, 0.1, 0, 2.3, 0, 0x1c4a5c, { rough: 0.2, metal: 0.6, seg: 32, cast: false, receive: false });
        box(tank, 14.4, 0.25, 0.9, 0, 2.7, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, cast: false, receive: false });
        cyl(tank, 0.5, 0.5, 3.2, 0, 3.4, 0, 0x4a5561, { rough: 0.6, seg: 10, cast: false, receive: false });
      }
      return null;
    },
  },
  "Connectivity & Telecom": {
    sky: 0x06090f, fog: 0x090d14, hemi: [0x6d8296, 0x121820], mast: 0xdfeaf2,
    dressing: [
      { prop: "cableSpool", x: -16, z: -7 },
      { prop: "palletStack", x: 16, z: -7, ry: -0.4 },
    ],
    build(g) {
      flood(g, 0, 18, -24, 0xdfeaf2);
      const beacons = lattice(g, 0, -30, 28);
      monopole(g, -22, -22, 13); monopole(g, 22, -22, 15);
      return (t) => { for (const b of beacons) b.material.emissiveIntensity = 0.5 + Math.max(0, Math.sin(t * 1.1)) * 1.6; };
    },
  },
  "Emergency Services": {
    sky: 0x0a0a0c, fog: 0x100d10, hemi: [0x8a7f88, 0x181214], mast: 0xfff0d6,
    dressing: [
      { prop: "jerseyBarrier", x: -16, z: -8, ry: 1.5708 },
      { prop: "lightMast", x: 16, z: -8, lit: true },
      { prop: "coneCluster", x: 0, z: -11 },
    ],
    build(g) {
      flood(g, 0, 10, -20, 0xfff0d6, 1.4);
      const bars = [...apparatus(g, -21, -24, 0xb3261e, 0.35), ...apparatus(g, 21, -24, 0xe8ecef, -0.35)];
      return (t) => { for (let i = 0; i < bars.length; i++) bars[i].material.emissiveIntensity = ((Math.floor(t * 4) + i) % 2) ? 2.4 : 0.3; };
    },
  },
  "Manufacturing & Automation": {
    sky: 0x08090c, fog: 0x0c0d10, hemi: [0x7c8590, 0x141414], mast: 0xe6eef4,
    dressing: [
      { prop: "palletStack", x: -16, z: -7, ry: 0.3 },
      { prop: "dumpster", x: 16, z: -7 },
    ],
    build(g) {
      flood(g, 0, 12, -24, 0xe6eef4);
      shed(g, -22, -26, 14, 10, 0.25); shed(g, 4, -30, 16, 10, 0); shed(g, 26, -24, 12, 9, -0.3);
      const plumes = [stack(g, 14, -33, 17), stack(g, -8, -34, 14)];
      return (t) => { for (let i = 0; i < plumes.length; i++) { const s = 1 + Math.sin(t * 0.6 + i) * 0.12; plumes[i].scale.set(s, 1 + Math.sin(t * 0.4 + i) * 0.25, s); } };
    },
  },
  "Building Systems & Facilities": {
    sky: 0x070a10, fog: 0x0b0e14, hemi: [0x6d8296, 0x121820], mast: 0xe6eef4,
    dressing: [
      { prop: "dumpster", x: -16, z: -7, ry: 0.3 },
      { prop: "scaffoldTower", x: 16, z: -7 },
    ],
    build(g) {
      flood(g, 0, 10, -22, 0xe6eef4);
      const blades = coolingTower(g, 0, -27);
      return (t) => { blades.rotation.y = t * 2.4; };
    },
  },
  "Construction & Structural Trades": {
    sky: 0x0a0a0a, fog: 0x101010, hemi: [0x8a8f96, 0x181614], mast: 0xfff0d6,
    dressing: [
      { prop: "scaffoldTower", x: -17, z: -8 },
      { prop: "portableToilet", x: 17, z: -8, ry: -0.3 },
      { prop: "palletStack", x: 0, z: -11.5, ry: 0.2 },
    ],
    build(g) {
      flood(g, 0, 16, -22, 0xfff0d6, 1.4);
      const crane = towerCrane(g, 20, -27, 24);
      const crane2 = towerCrane(g, -26, -22, 18);
      for (let i = 0; i < 7; i++) {
        const b = box(g, 2.6, 0.9, 0.6, -9 + i * 3, -1.05, -19.5, i % 2 ? 0xd9dde2 : 0xf2c14b, { rough: 0.8, cast: false, receive: false });
        b.rotation.y = 0.15;
      }
      box(g, 10, 4.5, 6, 6, 0.75, -30, 0x8b98a5, { rough: 0.7, metal: 0.3, cast: false, receive: false });
      return (t) => { crane.slew.rotation.y = Math.sin(t * 0.12) * 0.9; crane2.slew.rotation.y = 2.4 + Math.sin(t * 0.09 + 1) * 0.7; crane.trolley.position.z = -12 + Math.sin(t * 0.3) * 4; crane.line.position.z = crane.trolley.position.z; };
    },
  },
  "Entertainment & Live Events": {
    sky: 0x0a0716, fog: 0x0e0a1c, hemi: [0x7f6ba8, 0x14101c], mast: 0xe6dcff,
    dressing: [
      { prop: "lightMast", x: -16, z: -8, lit: true },
      { prop: "jerseyBarrier", x: 16, z: -8, ry: 1.5708 },
      { prop: "bollardRow", x: 0, z: -11.5, opts: { count: 3 } },
    ],
    build(g) {
      flood(g, 0, 12, -22, 0xe6dcff);
      const heads = truss(g, 0, -26, 18, 10);
      box(g, 22, 1.2, 12, 0, -0.9, -28, 0x1a1e23, { rough: 0.8, cast: false, receive: false });
      return (t) => { for (const h of heads) { h.yoke.rotation.z = Math.sin(t * 0.9 + h.phase) * 0.7; h.yoke.rotation.x = 0.3 + Math.sin(t * 0.6 + h.phase) * 0.35; h.head.material.emissiveIntensity = 1.4 + Math.max(0, Math.sin(t * 2.2 + h.phase)) * 1.6; } };
    },
  },
  "Maritime & Ports": {
    sky: 0x050c14, fog: 0x08121b, hemi: [0x5f8aa8, 0x0f1a22], mast: 0xd6ecf7,
    // A port district gets containers and bollards, close in on the near
    // edge of the yard — foreground detail in front of the distant gantries
    // and box stacks the district already builds further out.
    dressing: [
      { prop: "shippingContainer", x: -16, z: -9, ry: 0.35 },
      { prop: "shippingContainer:blue", x: -12.5, z: -9.3, ry: 0.35 },
      { prop: "shippingContainer", x: 16, z: -9, ry: -0.35 },
      { prop: "bollardRow", x: 0, z: -9.5, opts: { count: 5 } },
    ],
    build(g) {
      flood(g, 0, 16, -26, 0xd6ecf7, 2.8);
      water(g);
      gantry(g, -24, -30); gantry(g, 24, -30);
      containers(g, -14, -21, 3, 3, 0.15); containers(g, 15, -20, 2, 4, -0.2);
      const hull = group(g, 0, -1.5, -46);
      box(hull, 44, 4, 10, 0, 2, 0, 0x3c4a58, { rough: 0.7, metal: 0.3, cast: false, receive: false });
      box(hull, 6, 6, 8, 16, 7, 0, 0xdfe6ec, { rough: 0.5, cast: false, receive: false });
      box(hull, 5.6, 0.5, 8.1, 16, 8.2, 0, 0xffe9a8, { emissive: 0xffe9a8, ei: 1.0, rough: 0.4, cast: false, receive: false });
      for (let i = 0; i < 4; i++) box(hull, 6, 5, 8, -14 + i * 6.2, 6.5, 0, BOX_TONES[i], { rough: 0.7, metal: 0.25, cast: false, receive: false });
      return null;
    },
  },
  "Environmental Monitoring": {
    // A bay shoreline under a cleanup order: fog off the water, a tidal flat
    // with cordgrass coming back along it, the site fence with its dust
    // monitors, and a clamshell dredge working sediment inside a turbidity
    // curtain offshore. The hills are the neighbourhood above the fence.
    sky: 0x0a1014, fog: 0x141d22, hemi: [0x8aa0a4, 0x121a16], mast: 0xe6f2ea,
    // No city between the learner and the water: the ring opens across the
    // side they face, and the far shore's hills stand across the bay instead.
    skylineGap: [Math.PI - 1.15, Math.PI + 1.15],
    // Tucked behind the learner, on the neighbourhood side away from the
    // water, the cordgrass line and the dredge already working the flat.
    dressing: [
      { prop: "fireHydrant", x: 26, z: 15 },
      { prop: "portableToilet", x: -26, z: 15, ry: 0.4 },
    ],
    build(g) {
      flood(g, 0, 12, -24, 0xe6f2ea, 1.2);
      const waterTex = bayWater(g);
      mudflat(g, 26);
      hill(g, -34, -56, 30, 8, 14, 0x232c22); hill(g, 8, -62, 36, 10, 16, 0x1f281f); hill(g, 46, -44, 26, 7, 12, 0x232c22);
      hill(g, 40, 18, 22, 6, 12, 0x2a3222);
      for (let i = 0; i < 14; i++) {
        const a = -2.6 + i * 0.27, r = 17.5 + (i % 3) * 1.6;
        cordgrass(g, Math.sin(a) * r, Math.cos(a) * r, 10 + (i % 4) * 2);
      }
      const beacons = perimeter(g, 20, -1.0, -0.25, 8);
      const leds = [monitorMast(g, -18, -18, 6), monitorMast(g, 21, -12, 7)];
      const dr = dredge(g, 19, -27, -0.45);
      const sock = group(g, -14, -0.5, -20);
      cyl(sock, 0.05, 0.05, 6, 0, 3, 0, 0xb8c1c9, { rough: 0.5, seg: 6, cast: false, receive: false });
      const cone = cyl(sock, 0.28, 0.14, 1.6, 0.9, 5.9, 0, 0xff7a3b, { rough: 0.9, seg: 10, open: true, cast: false, receive: false });
      cone.rotation.z = Math.PI / 2;
      return (t) => {
        waterTex.offset.x = t * 0.004; waterTex.offset.y = Math.sin(t * 0.05) * 0.02;
        for (let i = 0; i < leds.length; i++) leds[i].material.emissiveIntensity = ((Math.floor(t * 1.5 + i * 0.7)) % 3 === 0) ? 2.2 : 0.4;
        for (let i = 0; i < beacons.length; i++) beacons[i].material.emissiveIntensity = Math.sin(t * 2.4 + i) > 0.6 ? 2.4 : 0.5;
        cone.rotation.y = Math.sin(t * 0.5) * 0.5;
        dr.d.position.y = -0.5 + Math.sin(t * 0.6) * 0.06; dr.d.rotation.z = Math.sin(t * 0.45) * 0.008;
        // The bucket cycle: down, dwell, up and slew to the scow, back.
        const c = (t * 0.18) % 1;
        const drop = c < 0.3 ? c / 0.3 : c < 0.5 ? 1 : c < 0.8 ? 1 - (c - 0.5) / 0.3 : 0;
        dr.line.scale.y = 1 + drop * 0.3; dr.line.position.y = 4.0 - drop * 0.9;
        dr.bucket.position.y = 0.6 - drop * 1.8;
        dr.slew.rotation.y = c >= 0.8 ? Math.sin((c - 0.8) / 0.2 * Math.PI) * 1.2 : 0;
      };
    },
  },
  "Surface Prep & Coatings": {
    sky: 0x0b0906, fog: 0x12100b, hemi: [0x8f8272, 0x1a1512], mast: 0xffe2b8,
    dressing: [
      { prop: "dumpster", x: -16, z: -7, ry: 0.3 },
      { prop: "palletStack", x: 16, z: -7 },
    ],
    build(g) {
      flood(g, 0, 14, -22, 0xffe2b8, 1.3);
      const con = containment(g, -16, -26, 14, 9, 0.28);
      abrasiveSilo(g, 8, -30);
      coatingStore(g, 24, -22, -0.5);
      const dehu = dehuSkid(g, -1, -20, 0.1);
      return (t) => {
        // The blast light inside the shroud rises and falls with the nozzle:
        // long passes, a pause to move the staging, another pass.
        const on = Math.sin(t * 0.55) > -0.3;
        const flick = on ? 0.9 + Math.sin(t * 9) * 0.25 + Math.sin(t * 23) * 0.1 : 0.12;
        for (const s of con.sheets) s.material.emissiveIntensity = flick;
        // Negative-air keeps pulling whether or not the nozzle is open.
        const p = 1 + Math.sin(t * 0.9) * 0.14;
        con.plume.scale.set(p, 1 + Math.sin(t * 0.7) * 0.22, p);
        // Dehumidifier cycles green (holding dew point) to amber (regenerating).
        const reg = Math.sin(t * 0.22) > 0.7;
        dehu.material.emissive.setHex(reg ? 0xf2c14b : 0x59c97b);
        dehu.material.emissiveIntensity = reg ? 2.0 : 1.4;
      };
    },
  },
  "Culinary & Hospitality": {
    sky: 0x0d0906, fog: 0x14100c, hemi: [0x9a8770, 0x1c1410], mast: 0xffd9a0,
    dressing: [
      { prop: "parkBench", x: -15, z: -7, ry: 0.3 },
      { prop: "picnicTable", x: 15, z: -7, ry: -0.3 },
    ],
    build(g) {
      flood(g, 0, 12, -22, 0xffd9a0, 1.2);
      const row = restaurantRow(g, -4, -27, 0.05);
      shed(g, 26, -24, 10, 8, -0.4, 2);
      return (t) => { row.fan.rotation.y = t * 6; };
    },
  },
  "Dental & Oral Health": {
    sky: 0x070c10, fog: 0x0b1116, hemi: [0x7f9aa6, 0x141c20], mast: 0xe6f4f0,
    dressing: [
      { prop: "parkBench", x: -15, z: -6.5, ry: 0.3 },
      { prop: "streetTree:small", x: 15, z: -6.5 },
    ],
    build(g) {
      flood(g, 0, 12, -22, 0xe6f4f0, 1.1);
      const clinic = clinicBlock(g, -2, -28, -0.04);
      monopole(g, 24, -26, 10);
      return (t) => {
        const ei = 1.3 + Math.sin(t * 1.6) * 0.35;
        for (const m of clinic.cross) m.material.emissiveIntensity = ei;
      };
    },
  },
  "Community Environmental Justice": {
    sky: 0x0c1018, fog: 0x121826, hemi: [0x8c9bb0, 0x1a1c22], mast: 0xffe6b0,
    dressing: [
      { prop: "parkBench", x: -15, z: -6.5, ry: 0.3 },
      { prop: "shrubBed", x: 15, z: -6.5 },
    ],
    build(g) {
      flood(g, 0, 12, -22, 0xffe6b0, 1.1);
      const st = fencedParcelStreet(g, -3, -27, 0.03);
      return (t) => { st.lamp.material.emissiveIntensity = 1.2 + (Math.sin(t * 2.2) > 0.6 ? 1.2 : 0); };
    },
  },
  "Sewing & Garment Trades": {
    sky: 0x0d0a12, fog: 0x141020, hemi: [0x9a8cb0, 0x1c1620], mast: 0xf0e6ff,
    dressing: [
      { prop: "palletStack", x: -15, z: -7, ry: 0.3 },
      { prop: "dumpster", x: 15, z: -7 },
    ],
    build(g) {
      flood(g, 0, 14, -22, 0xf0e6ff, 1.1);
      const loft = garmentLoft(g, 2, -30, -0.04);
      return (t) => { const k = Math.floor(t * 0.5) % loft.panes.length; loft.panes[k].material.emissiveIntensity = 0.3 + (Math.sin(t * 3) > 0 ? 0.6 : 0); };
    },
  },
  // ---- scenic districts: a station names one with `district: "<id>"`.
  "golden-gate-deck": {
    // The deck is the ground: no plaza, masts, marquee or apron under it.
    plaza: false,
    sky: 0x121a24, fog: 0x1c2530, hemi: [0x9aa8b4, 0x1a2026], mast: 0xffd9a0,
    // The marine layer is the district's own: fog banks standing off the
    // strait and lying under the deck (the sheets in goldenGateDeck) under
    // a flat overcast light, with the bay still visible from the railing.
    // A station's own weather replaces the overcast — `weather: "fog"` closes
    // it right in, so the tower top goes and the radio takes over — and so
    // does `?weather=`.
    weather: "overcast",
    // Held back far enough that fog weather (×0.34) still shows the tower
    // from the station and loses its top from the gate.
    fogRange: [34, 190],
    far: 220,
    // Out onto the sidewalk to the railing: from the middle of a 28m deck the
    // water below is hidden by the deck edge; from the rail it is not.
    roam: 13.2,
    // The city stands across the bay on the +x side, far off and far below
    // the deck; the strait side (−x) and both ends of the bridge stay open.
    skyline: { gap: [[0, 0.75], [2.4, Math.PI * 2]], base: GG.water, radius: 112, spread: 30, hScale: 2.6, wScale: 2, count: 70 },
    // The Bay district: a chain-link fence and a light mast on the sidewalk,
    // well clear of the roadway, the lane closure and the spawn-to-station
    // walk (spawn is at (0, 9.4), the station at the origin).
    dressing: [
      { prop: "fencePanel", x: 13, z: -38, ry: 1.5708 },
      { prop: "lightMast", x: 13, z: -25, lit: true },
    ],
    build(g, _accent, env = {}) { return goldenGateDeck(g, env); },
  },
  "bay-underwater": {
    plaza: false,
    // Nothing — the learner stands on the silt the district itself lays down.
    dressing: null,
    sky: 0x0c2c30, fog: 0x0c2c30, mast: 0xa8f0e0,
    // Its own water colour at every hour; nothing from TIME's day/dusk skies.
    skyByTime: {
      night: { sky: 0x0b2a2e, fog: 0x0b2a2e },
      dusk: { sky: 0x1b5054, fog: 0x1b5054 },
      day: { sky: 0x2a6c68, fog: 0x2a6c68 },
    },
    hemi: [0x9fe0d0, 0x16241e],
    key: 0x9fe6da,
    // Visibility of a few metres: the station is clear from the spawn, the
    // piles and the hull fade out past it.
    fogRange: [1.2, 15],
    far: 40,
    skyline: false,
    // There is no weather on the bottom of the bay. The station's own and
    // the URL's are both ignored, and the stage reports these instead.
    forceWeather: true, weather: "clear",
    weatherKind: "underwater", weatherLabel: "Underwater",
    weatherNote: "Low visibility on the bottom — the umbilical and the supervisor on the comms are the line back to the surface. Depth, gas and decompression limits are per the dive plan and the tables the supervisor holds.",
    // Closer in than the plaza's gate: past about ten metres the water hides everything.
    spawn: { x: 0, z: 5.2, ry: 0 },
    roam: 7,
    build(g, _accent, env = {}) { return bayUnderwater(g, env); },
  },
  "gym-court": {
    // An indoor gym: the maple floor is the ground, so no plaza, masts,
    // marquee, apron or skyline. Its own light at every hour, its own
    // conditions whatever the station or the URL asks (there is no rain on
    // a gym floor), and a scoreboard chip on the HUD (react-ui.js
    // courtReadout) that shows the run's own drills, fouls and clock.
    // No dressing either — a bench and a hydrant have no business on a
    // basketball court.
    dressing: null,
    plaza: false,
    sky: 0x1c1814, fog: 0x1c1814, mast: 0xfff2dc,
    skyByTime: {
      night: { sky: 0x1a1612, fog: 0x1a1612 },
      dusk: { sky: 0x1e1a15, fog: 0x1e1a15 },
      day: { sky: 0x24201a, fog: 0x24201a },
    },
    hemi: [0xfff4e2, 0x5a4a36],
    key: 0xfff2dc,
    fogRange: [40, 95],
    far: 90,
    skyline: false,
    forceWeather: true, weather: "clear",
    weatherKind: "clear", weatherLabel: "Indoor court",
    weatherNote: "Climate-controlled gym floor. Heat and hydration still follow the session plan and the athletic trainer: a cool gym does not replace water breaks, and a wet patch on the maple is the hazard to watch.",
    // The scoreboard chip: the labels are the district's, every number is the run's own.
    scoreboard: { period: "Practice", home: "Drills", guest: "Fouls" },
    // On the floor in front of the near bleachers, facing the station at centre court.
    spawn: { x: 0, z: 6.2, ry: 0 },
    roam: 7.2,
    build(g, _accent, env = {}) { return gymCourt(g, env); },
  },
};

/** The ids of the scenic districts (a whole scene, not a horizon). */
export const SCENIC_DISTRICTS = Object.keys(DISTRICTS).filter((k) => DISTRICTS[k].plaza === false);

/** The district for a category (the shared plaza with the default sky when
 *  the category has none or the hub is showing). */
export function districtFor(category) {
  return { ...DEFAULT, ...(DISTRICTS[category] ?? {}) };
}
