import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group } from "../../shared/kit.js";
import { CITY, surfaceTexture, texturedMat, waterFace, mudflatFace } from "./citykit.js";

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
  const tex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, o), { repeat: 14, px: 512 });
  const w = cyl(g, 66, 66, 0.1, 0, -0.56, 0, 0x0f2e3a, { rough: 0.25, metal: 0.55, seg: 56, cast: false });
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

// ------------------------------------------------------------------ table

const DEFAULT = { sky: 0x0b1220, fog: 0x0f1726, hemi: [0x7f95aa, 0x1a2230], mast: 0xdfeaf2, build: null };

export const DISTRICTS = {
  "Energy & Power": {
    sky: 0x07090f, fog: 0x0a0c12, hemi: [0x7a8aa0, 0x151511], mast: 0xffd9a0,
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
    build(g) {
      flood(g, 0, 18, -24, 0xdfeaf2);
      const beacons = lattice(g, 0, -30, 28);
      monopole(g, -22, -22, 13); monopole(g, 22, -22, 15);
      return (t) => { for (const b of beacons) b.material.emissiveIntensity = 0.5 + Math.max(0, Math.sin(t * 1.1)) * 1.6; };
    },
  },
  "Emergency Services": {
    sky: 0x0a0a0c, fog: 0x100d10, hemi: [0x8a7f88, 0x181214], mast: 0xfff0d6,
    build(g) {
      flood(g, 0, 10, -20, 0xfff0d6, 1.4);
      const bars = [...apparatus(g, -21, -24, 0xb3261e, 0.35), ...apparatus(g, 21, -24, 0xe8ecef, -0.35)];
      return (t) => { for (let i = 0; i < bars.length; i++) bars[i].material.emissiveIntensity = ((Math.floor(t * 4) + i) % 2) ? 2.4 : 0.3; };
    },
  },
  "Manufacturing & Automation": {
    sky: 0x08090c, fog: 0x0c0d10, hemi: [0x7c8590, 0x141414], mast: 0xe6eef4,
    build(g) {
      flood(g, 0, 12, -24, 0xe6eef4);
      shed(g, -22, -26, 14, 10, 0.25); shed(g, 4, -30, 16, 10, 0); shed(g, 26, -24, 12, 9, -0.3);
      const plumes = [stack(g, 14, -33, 17), stack(g, -8, -34, 14)];
      return (t) => { for (let i = 0; i < plumes.length; i++) { const s = 1 + Math.sin(t * 0.6 + i) * 0.12; plumes[i].scale.set(s, 1 + Math.sin(t * 0.4 + i) * 0.25, s); } };
    },
  },
  "Building Systems & Facilities": {
    sky: 0x070a10, fog: 0x0b0e14, hemi: [0x6d8296, 0x121820], mast: 0xe6eef4,
    build(g) {
      flood(g, 0, 10, -22, 0xe6eef4);
      const blades = coolingTower(g, 0, -27);
      return (t) => { blades.rotation.y = t * 2.4; };
    },
  },
  "Construction & Structural Trades": {
    sky: 0x0a0a0a, fog: 0x101010, hemi: [0x8a8f96, 0x181614], mast: 0xfff0d6,
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
    build(g) {
      flood(g, 0, 12, -22, 0xe6dcff);
      const heads = truss(g, 0, -26, 18, 10);
      box(g, 22, 1.2, 12, 0, -0.9, -28, 0x1a1e23, { rough: 0.8, cast: false, receive: false });
      return (t) => { for (const h of heads) { h.yoke.rotation.z = Math.sin(t * 0.9 + h.phase) * 0.7; h.yoke.rotation.x = 0.3 + Math.sin(t * 0.6 + h.phase) * 0.35; h.head.material.emissiveIntensity = 1.4 + Math.max(0, Math.sin(t * 2.2 + h.phase)) * 1.6; } };
    },
  },
  "Maritime & Ports": {
    sky: 0x050c14, fog: 0x08121b, hemi: [0x5f8aa8, 0x0f1a22], mast: 0xd6ecf7,
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
    build(g) {
      flood(g, 0, 12, -22, 0xffd9a0, 1.2);
      const row = restaurantRow(g, -4, -27, 0.05);
      shed(g, 26, -24, 10, 8, -0.4, 2);
      return (t) => { row.fan.rotation.y = t * 6; };
    },
  },
  "Dental & Oral Health": {
    sky: 0x070c10, fog: 0x0b1116, hemi: [0x7f9aa6, 0x141c20], mast: 0xe6f4f0,
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
};

/** The district for a category (the shared plaza with the default sky when
 *  the category has none or the hub is showing). */
export function districtFor(category) {
  return { ...DEFAULT, ...(DISTRICTS[category] ?? {}) };
}
