import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";

// Shared procedural asset kit. Every prop in the simulator is built from these
// primitives at real-world scale in metres, so rooms stay consistent and no
// external model files are needed.

export const TAU = Math.PI * 2;

// HUD tokens from DESIGN.md, reused so the web build reads like the headset build.
export const HUD = {
  void: "#071018", panel: "#101C27", raised: "#172735", text: "#F4F8FB",
  muted: "#9FB0BF", accent: "#37D6C0", warn: "#F2B84B", danger: "#F0645B",
  edge: "#426174", good: "#59C97B",
};

const materialCache = new Map();
const disposables = new Set();

export function mat(color, o = {}) {
  const key = [color, o.rough ?? 0.8, o.metal ?? 0, o.emissive ?? 0, o.ei ?? 1,
    o.opacity ?? 1, o.flat ? 1 : 0, o.side ?? 0].join("|");
  let m = materialCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: o.rough ?? 0.8,
      metalness: o.metal ?? 0,
      emissive: o.emissive ?? 0x000000,
      emissiveIntensity: o.ei ?? 1,
      transparent: (o.opacity ?? 1) < 1,
      opacity: o.opacity ?? 1,
      flatShading: !!o.flat,
      side: o.side === 2 ? THREE.DoubleSide : THREE.FrontSide,
    });
    materialCache.set(key, m);
  }
  return m;
}

function track(geometry) { disposables.add(geometry); return geometry; }

/** Dispose geometry created for a room. Materials stay cached and shared. */
export function disposeTree(root) {
  root.traverse((o) => {
    if (o.isMesh || o.isLine || o.isPoints) {
      o.geometry?.dispose();
      disposables.delete(o.geometry);
      if (o.material?.map && o.material.userData.ownTexture) o.material.map.dispose();
      if (o.material?.userData.ownMaterial) o.material.dispose();
    }
  });
  root.parent?.remove(root);
}

export function group(parent, x = 0, y = 0, z = 0, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent?.add(g);
  return g;
}

export function box(parent, w, h, d, x, y, z, color, o = {}) {
  const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

export function cyl(parent, rTop, rBot, h, x, y, z, color, o = {}) {
  const m = new THREE.Mesh(
    track(new THREE.CylinderGeometry(rTop, rBot, h, o.seg ?? 20, 1, !!o.open)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

export function ball(parent, r, x, y, z, color, o = {}) {
  const m = new THREE.Mesh(track(new THREE.SphereGeometry(r, o.seg ?? 18, o.seg2 ?? 14)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

export function torus(parent, r, tube, x, y, z, color, o = {}) {
  const m = new THREE.Mesh(track(new THREE.TorusGeometry(r, tube, o.seg ?? 10, o.seg2 ?? 24)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  parent.add(m);
  return m;
}

/** Rounded slab — a box with chamfered vertical edges. Reads far better than a plain cube. */
export function slab(parent, w, h, d, x, y, z, color, o = {}) {
  const r = Math.min(o.radius ?? 0.02, w / 2 - 0.001, d / 2 - 0.001);
  const shape = new THREE.Shape();
  const hw = w / 2 - r, hd = d / 2 - r;
  shape.moveTo(-hw - r, -hd);
  shape.lineTo(-hw - r, hd);
  shape.quadraticCurveTo(-hw - r, hd + r, -hw, hd + r);
  shape.lineTo(hw, hd + r);
  shape.quadraticCurveTo(hw + r, hd + r, hw + r, hd);
  shape.lineTo(hw + r, -hd);
  shape.quadraticCurveTo(hw + r, -hd - r, hw, -hd - r);
  shape.lineTo(-hw, -hd - r);
  shape.quadraticCurveTo(-hw - r, -hd - r, -hw - r, -hd);
  const geo = track(new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 4 }));
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, h / 2, 0);
  const m = new THREE.Mesh(geo, mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

/** Lathe profile — bottles, jars, funnels. `profile` is [[radius, y], ...] bottom-up. */
export function lathe(parent, profile, x, y, z, color, o = {}) {
  const pts = profile.map(([r, py]) => new THREE.Vector2(Math.max(r, 0.0005), py));
  const m = new THREE.Mesh(track(new THREE.LatheGeometry(pts, o.seg ?? 20)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

/** Flexible run — cables, hoses, tubing. `points` are local Vector3-ish triples. */
export function hose(parent, points, radius, color, o = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const m = new THREE.Mesh(
    track(new THREE.TubeGeometry(curve, o.steps ?? 32, radius, o.seg ?? 8, false)), mat(color, o));
  m.castShadow = o.cast !== false;
  parent.add(m);
  return m;
}

// ---------------------------------------------------------------- canvas art

/** Painted panel: signage, dials, labels, screens. Returns the mesh; texture is owned by it. */
export function decal(parent, w, h, x, y, z, draw, o = {}) {
  const px = o.px ?? 512;
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = Math.max(8, Math.round(px * (h / w)));
  const g = canvas.getContext("2d");
  draw(g, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  const material = new THREE.MeshStandardMaterial({
    map: tex, roughness: o.rough ?? 0.7, metalness: o.metal ?? 0,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    emissiveMap: o.glow ? tex : null,
    transparent: !!o.transparent,
    side: THREE.DoubleSide,
  });
  material.userData.ownMaterial = true;
  material.userData.ownTexture = true;
  const m = new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), material);
  m.position.set(x, y, z);
  m.castShadow = false;
  m.receiveShadow = false;
  m.userData.canvas = canvas;
  m.userData.ctx = g;
  m.userData.texture = tex;
  parent.add(m);
  return m;
}

export function repaint(mesh, draw) {
  const { ctx, canvas, texture } = mesh.userData;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(ctx, canvas.width, canvas.height);
  texture.needsUpdate = true;
}

// ---------------------------------------------------------------- surface texture helpers

/**
 * Flat gradient fill for a canvas 2D context. Falls back to a solid fill using the
 * gradient's last stop when the context has no real gradient support (e.g. the
 * headless mock used by the CI content checkers), so callers never need to special-case it.
 */
export function gradientFill(g, w, h, stops, o = {}) {
  let grad = null;
  try {
    grad = o.radial
      ? g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2)
      : g.createLinearGradient(0, 0, o.horizontal ? w : 0, o.horizontal ? 0 : h);
  } catch { grad = null; }
  if (grad && typeof grad.addColorStop === "function") {
    for (const [stop, color] of stops) grad.addColorStop(stop, color);
    g.fillStyle = grad;
  } else {
    g.fillStyle = stops[stops.length - 1][1];
  }
  g.fillRect(0, 0, w, h);
}

/** Cheap grain: scattered translucent specks that break up a flat canvas fill. */
export function noiseTexture(g, w, h, o = {}) {
  const count = Math.round((o.density ?? 900) * (w * h) / (512 * 512));
  const alpha = o.alpha ?? 0.05;
  const tone = o.tone ?? "0,0,0";
  for (let i = 0; i < count; i++) {
    g.fillStyle = `rgba(${tone},${(Math.random() * alpha).toFixed(3)})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
}

/**
 * Weathering pass: soft grime blotches and drip streaks toward the lower half of a
 * panel. Silently draws nothing where the 2D context has no gradient support, rather
 * than throwing, so it is safe to call from code paths the headless checkers exercise.
 */
export function grimeOverlay(g, w, h, o = {}) {
  const tone = o.tone ?? "18,14,9";
  const alpha = o.alpha ?? 0.22;
  for (let i = 0; i < (o.blotches ?? 4); i++) {
    const x = Math.random() * w, y = h * (0.5 + Math.random() * 0.5);
    const r = Math.min(w, h) * (0.18 + Math.random() * 0.22);
    let grad = null;
    try { grad = g.createRadialGradient(x, y, 0, x, y, r); } catch { grad = null; }
    if (!grad || typeof grad.addColorStop !== "function") continue;
    grad.addColorStop(0, `rgba(${tone},${alpha})`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < (o.streaks ?? 3); i++) {
    const x = w * (0.1 + Math.random() * 0.8);
    const len = h * (0.25 + Math.random() * 0.45);
    let grad = null;
    try { grad = g.createLinearGradient(x, 0, x, len); } catch { grad = null; }
    if (!grad || typeof grad.addColorStop !== "function") continue;
    grad.addColorStop(0, `rgba(${tone},${alpha * 0.8})`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    g.fillStyle = grad;
    g.fillRect(x - (o.streakWidth ?? 2), 0, o.streakWidth ?? 2, len);
  }
}

/** Standard sign face: dark plate, accent rule, centred caps text. */
export function signFace(text, o = {}) {
  return (g, w, h) => {
    g.fillStyle = o.bg ?? "#0b141d";
    g.fillRect(0, 0, w, h);
    if (o.worn) {
      noiseTexture(g, w, h, { density: 500, alpha: 0.05, tone: "0,0,0" });
      grimeOverlay(g, w, h, { blotches: 2, streaks: 2, alpha: 0.16 });
    }
    g.fillStyle = o.accent ?? HUD.accent;
    g.fillRect(0, h - Math.max(3, h * 0.07), w, Math.max(3, h * 0.07));
    g.fillStyle = o.fg ?? HUD.text;
    g.font = `600 ${Math.round(h * (o.scale ?? 0.46))}px 'Barlow Condensed', Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const lines = String(text).split("\n");
    const step = h * 0.44;
    lines.forEach((line, i) => g.fillText(line, w / 2, h / 2 - ((lines.length - 1) * step) / 2 + i * step));
  };
}

/** Printed paper: permit, chart, schedule, label sheet. */
export function paperFace(title, rows, o = {}) {
  return (g, w, h) => {
    g.fillStyle = o.bg ?? "#f2efe6";
    g.fillRect(0, 0, w, h);
    if (o.worn) {
      noiseTexture(g, w, h, { density: 350, alpha: 0.05, tone: o.wornTone ?? "90,74,46" });
      grimeOverlay(g, w, h, { blotches: 2, streaks: 1, tone: o.wornTone ?? "120,96,52", alpha: 0.16 });
    }
    g.fillStyle = o.band ?? "#22303c";
    g.fillRect(0, 0, w, h * 0.16);
    g.fillStyle = "#ffffff";
    g.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.fillText(title, w * 0.05, h * 0.08);
    g.fillStyle = "#1d262e";
    g.font = `${Math.round(h * 0.062)}px Arial, sans-serif`;
    rows.forEach((row, i) => {
      const y = h * 0.26 + i * h * 0.1;
      g.fillStyle = "#63707c";
      g.fillRect(w * 0.05, y + h * 0.045, w * 0.9, 1);
      g.fillStyle = "#1d262e";
      g.fillText(row, w * 0.06, y);
    });
  };
}

// ---------------------------------------------------------------- room shells

/**
 * Enclosed room shell with floor, four walls, ceiling and a skirting rail.
 * Rooms are built around the origin; the learner spawns near +z looking to -z.
 */
export function shell(parent, o = {}) {
  const w = o.w ?? 8, d = o.d ?? 8, h = o.h ?? 3.1;
  const g = group(parent);
  const floor = box(g, w, 0.12, d, 0, -0.06, 0, o.floor ?? 0x3a4048,
    { rough: o.floorRough ?? 0.85, metal: o.floorMetal ?? 0, cast: false });
  floor.receiveShadow = true;
  box(g, w, h, 0.12, 0, h / 2, -d / 2, o.wall ?? 0x5b6672, { rough: 0.94, cast: false });
  box(g, 0.12, h, d, -w / 2, h / 2, 0, o.wall ?? 0x5b6672, { rough: 0.94, cast: false });
  box(g, 0.12, h, d, w / 2, h / 2, 0, o.wall ?? 0x5b6672, { rough: 0.94, cast: false });
  box(g, w, 0.12, d, 0, h, 0, o.ceiling ?? 0x2b3238, { rough: 0.96, cast: false });
  if (o.backWall !== false) box(g, w, h, 0.12, 0, h / 2, d / 2, o.wall ?? 0x5b6672, { rough: 0.94, cast: false });
  if (o.skirt !== false) {
    box(g, w, 0.1, 0.04, 0, 0.05, -d / 2 + 0.08, o.skirtColor ?? 0x2a3038, { cast: false });
    box(g, 0.04, 0.1, d, -w / 2 + 0.08, 0.05, 0, o.skirtColor ?? 0x2a3038, { cast: false });
    box(g, 0.04, 0.1, d, w / 2 - 0.08, 0.05, 0, o.skirtColor ?? 0x2a3038, { cast: false });
  }
  return g;
}

/** Recessed ceiling panel that also acts as the room's key light source. */
export function ceilingPanel(parent, x, z, o = {}) {
  const y = o.y ?? 3.02;
  box(parent, o.w ?? 1.2, 0.06, o.d ?? 0.32, x, y, z, 0x22282e, { cast: false, rough: 0.6, metal: 0.5 });
  const lens = box(parent, (o.w ?? 1.2) - 0.08, 0.03, (o.d ?? 0.32) - 0.06, x, y - 0.05, z,
    o.color ?? 0xfff4e2, { cast: false, emissive: o.color ?? 0xfff4e2, ei: o.ei ?? 1.5, rough: 0.4 });
  const lamp = new THREE.PointLight(o.color ?? 0xfff4e2, o.lamp ?? 1.5, o.range ?? 9, 2);
  lamp.position.set(x, y - 0.18, z);
  parent.add(lamp);
  return lens;
}

// ------------------------------------------------------------ composite props

/** Stainless / laminate work counter with legs, apron and optional undershelf. */
export function counter(parent, w, d, x, z, color = 0x9aa4ad, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const hgt = o.height ?? 0.92;
  slab(g, w, 0.05, d, 0, hgt, 0, color, { rough: o.rough ?? 0.34, metal: o.metal ?? 0.72, radius: 0.02 });
  box(g, w - 0.06, 0.1, 0.03, 0, hgt - 0.08, -d / 2 + 0.03, color, { rough: 0.4, metal: 0.6 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    cyl(g, 0.022, 0.022, hgt - 0.05, sx * (w / 2 - 0.09), (hgt - 0.05) / 2, sz * (d / 2 - 0.09),
      0x7c848c, { rough: 0.35, metal: 0.85, seg: 10 });
  }
  if (o.undershelf !== false) {
    slab(g, w - 0.16, 0.03, d - 0.16, 0, 0.24, 0, color, { rough: 0.45, metal: 0.6, radius: 0.01 });
  }
  return g;
}

/** Wheeled trolley — salon trolley, phlebotomy cart, tool cart. */
export function trolley(parent, x, z, color = 0x2b3239, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const w = o.w ?? 0.52, d = o.d ?? 0.4;
  for (const y of [0.34, 0.6, 0.86]) slab(g, w, 0.028, d, 0, y, 0, color, { rough: 0.42, metal: 0.35, radius: 0.015 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    cyl(g, 0.014, 0.014, 0.86, sx * (w / 2 - 0.03), 0.45, sz * (d / 2 - 0.03), 0x8d959d,
      { rough: 0.3, metal: 0.9, seg: 8 });
    const caster = cyl(g, 0.035, 0.035, 0.018, sx * (w / 2 - 0.03), 0.035, sz * (d / 2 - 0.03), 0x16191d,
      { rough: 0.8, seg: 12 });
    caster.rotation.z = Math.PI / 2;
  }
  return g;
}

/** Wall cabinet with doors and handles. */
export function cabinet(parent, w, h, d, x, y, z, color = 0xd7dce1, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  box(g, w, h, d, 0, 0, 0, color, { rough: 0.55, metal: 0.1 });
  const gap = 0.006;
  for (const sx of [-1, 1]) {
    box(g, w / 2 - gap, h - 0.04, 0.018, sx * (w / 4), 0, d / 2 + 0.01, o.doorColor ?? color,
      { rough: 0.42, metal: 0.15 });
    box(g, 0.02, 0.11, 0.02, sx * 0.045, 0, d / 2 + 0.03, 0x8d959d, { rough: 0.3, metal: 0.9 });
  }
  return g;
}

/** Seated human stand-in: client in a salon chair, patient in a draw chair. */
export function seatedFigure(parent, x, y, z, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  const skin = o.skin ?? 0xc99878;
  const cloth = o.cloth ?? 0x37505f;
  const torso = group(g, 0, 0, 0);
  box(torso, 0.4, 0.5, 0.26, 0, 0.72, 0, cloth, { rough: 0.9 });
  box(torso, 0.34, 0.16, 0.26, 0, 0.42, 0.02, cloth, { rough: 0.9 });        // lap
  for (const sx of [-1, 1]) {
    box(torso, 0.14, 0.14, 0.44, sx * 0.16, 0.4, 0.2, cloth, { rough: 0.9 }); // thighs
    cyl(torso, 0.055, 0.05, 0.42, sx * 0.16, 0.21, 0.4, cloth, { rough: 0.9, seg: 10 });
  }
  const head = group(torso, 0, 1.06, 0.01);
  ball(head, 0.115, 0, 0, 0, skin, { rough: 0.75, seg: 20 });
  box(head, 0.16, 0.1, 0.1, 0, -0.05, 0.05, skin, { rough: 0.75 });          // jaw
  cyl(torso, 0.05, 0.055, 0.12, 0, 0.98, 0, skin, { rough: 0.75, seg: 12 }); // neck
  const arms = [];
  for (const sx of [-1, 1]) {
    const shoulder = group(torso, sx * 0.23, 0.88, 0);
    cyl(shoulder, 0.05, 0.045, 0.3, 0, -0.15, 0, cloth, { rough: 0.9, seg: 10 });
    const fore = group(shoulder, 0, -0.3, 0);
    cyl(fore, 0.042, 0.038, 0.28, 0, -0.13, 0.02, skin, { rough: 0.75, seg: 10 });
    ball(fore, 0.045, 0, -0.28, 0.04, skin, { rough: 0.75, seg: 12 });
    arms.push({ shoulder, fore });
  }
  return { root: g, torso, head, arms };
}

// ------------------------------------------------------------------ particles

/** Cheap additive point burst reused for sparks, steam and water. */
export function particles(parent, count, color, o = {}) {
  const positions = new Float32Array(count * 3);
  const geo = track(new THREE.BufferGeometry());
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color, size: o.size ?? 0.02, transparent: true, opacity: o.opacity ?? 0.9,
    blending: o.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
    depthWrite: false, sizeAttenuation: true,
  });
  material.userData.ownMaterial = true;
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  points.visible = false;
  parent.add(points);
  const life = new Float32Array(count);
  const vel = new Float32Array(count * 3);
  points.userData.step = (dt, origin, spread, speed, gravity) => {
    for (let i = 0; i < count; i++) {
      life[i] -= dt;
      if (life[i] <= 0) {
        life[i] = 0.25 + Math.random() * (o.life ?? 0.6);
        positions[i * 3] = origin.x + (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = origin.y + (Math.random() - 0.5) * spread;
        positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * spread;
        vel[i * 3] = (Math.random() - 0.5) * speed;
        vel[i * 3 + 1] = (Math.random() * 0.6 + 0.4) * speed;
        vel[i * 3 + 2] = (Math.random() - 0.5) * speed;
      }
      positions[i * 3] += vel[i * 3] * dt;
      positions[i * 3 + 1] += vel[i * 3 + 1] * dt;
      positions[i * 3 + 2] += vel[i * 3 + 2] * dt;
      vel[i * 3 + 1] += gravity * dt;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return points;
}

/**
 * A one-shot, self-driving particle celebration for "big moment" feedback — a
 * hot-streak step, a rank-up, a personal best. Parented once to `parent` (any
 * static node already in the scene, e.g. the room root); after that, call the
 * returned `fire(localPoint)` whenever the moment happens and call `update(dt)`
 * unconditionally from the render loop — it is a cheap no-op once the burst
 * has finished, so the caller never needs to track whether one is playing.
 */
export function celebrationBurst(parent, o = {}) {
  const points = particles(parent, o.count ?? 70, o.color ?? 0xffe37a, {
    size: o.size ?? 0.032, life: o.life ?? 0.6, additive: o.additive !== false, opacity: o.opacity ?? 0.95,
  });
  const origin = new THREE.Vector3();
  let timer = 0;
  return {
    fire(localPoint) {
      origin.copy(localPoint);
      timer = o.duration ?? 0.5;
      points.visible = true;
    },
    update(dt) {
      if (timer <= 0) { if (points.visible) points.visible = false; return; }
      timer -= dt;
      points.userData.step(dt, origin, o.spread ?? 0.1, o.speed ?? 1.6, o.gravity ?? -1.8);
    },
  };
}

// ------------------------------------------------------------------- helpers

export function markInteractive(objectOrGroup, id, o = {}) {
  objectOrGroup.userData.hitId = id;
  objectOrGroup.userData.hitLabel = o.label ?? id;
  return objectOrGroup;
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export { THREE };
