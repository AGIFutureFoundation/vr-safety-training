import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  mat, HUD, markInteractive, gradientFill, noiseTexture, grimeOverlay,
  figureLook, personHead, personTorso, personLegs, personArm,
} from "../../shared/kit.js";

// SmartCity.X asset kit — the pieces every station is assembled from.
//
// These stations are authored for augmented reality: each one occupies a small
// footprint the learner walks around in their own room, so the props are
// human-scale and free-standing rather than built into walls. Everything reads
// correctly with passthrough behind it, which is why the holographic elements
// are emissive and the physical equipment is not.

export const CITY = {
  accent: 0x4fd1ff,          // SmartCity.X holo cyan
  accentCss: "#4fd1ff",
  holo: 0x7ee6ff,
  violet: 0xa079ff,
  steel: 0x8b949d,
  darkSteel: 0x3c444c,
  case: 0x2a3138,
  hiVis: 0xf2c14b,
  alert: 0xf0645b,
  good: 0x59c97b,
};

// ------------------------------------------------------------ surface textures
//
// Tiling canvas textures for the large flat surfaces (plaza deck, atrium
// floor) that previously read as one flat colour. Generated once per build,
// owned by the material they're attached to (userData.ownTexture/ownMaterial)
// so disposeTree() frees them with the room. Every canvas call is guarded the
// same way kit.js's gradientFill is, so the headless checkers' 2D-context stub
// never throws even though nothing in the checker path actually calls these.

/** A repeating CanvasTexture drawn by `draw(g, w, h)`. */
export function surfaceTexture(draw, o = {}) {
  const px = o.px ?? 512;
  const canvas = document.createElement("canvas");
  canvas.width = px; canvas.height = px;
  const g = canvas.getContext("2d");
  draw(g, px, px);
  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.RepeatWrapping !== undefined) { tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; }
  tex.repeat?.set?.(o.repeat ?? 4, o.repeat ?? 4);
  tex.anisotropy = 8;
  if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A standard material carrying its own (disposable) texture map. */
export function texturedMat(tex, o = {}) {
  const m = new THREE.MeshStandardMaterial({
    map: tex, color: o.color ?? 0xffffff, roughness: o.rough ?? 0.85, metalness: o.metal ?? 0.05,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1, emissiveMap: o.glow ? tex : null,
  });
  m.userData.ownMaterial = true;
  m.userData.ownTexture = true;
  return m;
}

/**
 * Cast-concrete plaza paving: a cool base with per-tile tonal variation, a fine
 * grain, saw-cut seam lines on a grid, and a faint lighter chamfer along each
 * seam so tiles read as separate slabs under raking light.
 */
export function pavingFace(g, w, h, o = {}) {
  const tiles = o.tiles ?? 4;
  const base = o.base ?? "#1a222b";
  gradientFill(g, w, h, [[0, base], [1, o.base2 ?? "#151c24"]]);
  const t = w / tiles;
  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      const v = ((i * 7 + j * 13) % 5) - 2; // deterministic tone jitter per slab
      g.fillStyle = `rgba(${v > 0 ? "255,255,255" : "0,0,0"},${(Math.abs(v) * 0.025).toFixed(3)})`;
      g.fillRect(i * t, j * t, t, t);
    }
  }
  noiseTexture(g, w, h, { density: 2600, alpha: 0.09, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 1400, alpha: 0.06, tone: "200,220,235" });
  g.fillStyle = o.seam ?? "rgba(0,0,0,0.55)";
  for (let i = 0; i <= tiles; i++) {
    g.fillRect(i * t - 1.5, 0, 3, h);
    g.fillRect(0, i * t - 1.5, w, 3);
  }
  g.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i <= tiles; i++) {
    g.fillRect(i * t + 1.5, 0, 1.5, h);
    g.fillRect(0, i * t + 1.5, w, 1.5);
  }
}

/**
 * Anti-slip deck plate for walk lanes: darker steel with a raised-dot pattern
 * and a subtle directional brushing.
 */
export function deckPlateFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#232b33"], [1, o.base2 ?? "#1b222a"]], { horizontal: true });
  noiseTexture(g, w, h, { density: 3000, alpha: 0.07, tone: "0,0,0" });
  const step = o.step ?? 24;
  for (let y = step / 2; y < h; y += step) {
    for (let x = ((y / step) | 0) % 2 ? step / 2 : 0; x < w; x += step) {
      g.fillStyle = "rgba(255,255,255,0.10)";
      g.fillRect(x - 2, y - 2, 4, 4);
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(x - 2, y + 2, 4, 1.5);
    }
  }
  for (let y = 0; y < h; y += 3) {
    g.fillStyle = `rgba(255,255,255,${(0.01 + ((y / 3) % 4) * 0.004).toFixed(3)})`;
    g.fillRect(0, y, w, 1);
  }
}

/**
 * Bay water for the shoreline districts: a deep teal base that lightens toward
 * one edge the way water does under a low sky, a fine grain, and two scales of
 * ripple — long low strokes for the swell and short bright flecks where the
 * light catches a crest. Tiled and drifted by the district's animate, so a
 * still disc reads as moving water without a shader.
 */
export function waterFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#0c2531"], [0.55, o.mid ?? "#0f2e3a"], [1, o.base2 ?? "#0a1f29"]]);
  noiseTexture(g, w, h, { density: 2200, alpha: 0.05, tone: "0,0,0" });
  const swell = o.swell ?? 46, crest = o.crest ?? 260;
  for (let i = 0; i < swell; i++) {
    const y = Math.random() * h, x = Math.random() * w, len = 60 + Math.random() * 180;
    g.fillStyle = `rgba(120,170,185,${(0.05 + Math.random() * 0.06).toFixed(3)})`;
    g.fillRect(x, y, len, 1.5);
    g.fillStyle = "rgba(0,0,0,0.10)";
    g.fillRect(x + 6, y + 3, len * 0.7, 1);
  }
  for (let i = 0; i < crest; i++) {
    const y = Math.random() * h, x = Math.random() * w, len = 6 + Math.random() * 22;
    g.fillStyle = `rgba(190,225,235,${(0.08 + Math.random() * 0.14).toFixed(3)})`;
    g.fillRect(x, y, len, 1);
  }
}

/**
 * Tidal mudflat for the marsh edge: a grey-brown base darker where it is
 * still wet, a fine grain, desiccation cracks as short jointed dark strokes,
 * and a few shallow pools that catch the sky. Reads as the ground a living
 * shoreline is built on rather than a lawn.
 */
export function mudflatFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#3a3630"], [1, o.base2 ?? "#2c2a26"]], { radial: true });
  noiseTexture(g, w, h, { density: 3200, alpha: 0.10, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 900, alpha: 0.05, tone: "170,160,140" });
  const cracks = o.cracks ?? 70;
  for (let i = 0; i < cracks; i++) {
    let x = Math.random() * w, y = Math.random() * h;
    const steps = 4 + Math.floor(Math.random() * 6);
    for (let k = 0; k < steps; k++) {
      const dx = (Math.random() - 0.5) * 34, dy = (Math.random() - 0.5) * 34;
      const nx = x + dx, ny = y + dy, len = Math.hypot(dx, dy);
      g.fillStyle = "rgba(0,0,0,0.42)";
      for (let t = 0; t < len; t += 2) g.fillRect(x + (dx * t) / len, y + (dy * t) / len, 1.6, 1.6);
      x = nx; y = ny;
    }
  }
  const pools = o.pools ?? 5;
  for (let i = 0; i < pools; i++) {
    const cx = Math.random() * w, cy = Math.random() * h, r = 14 + Math.random() * 30;
    g.fillStyle = "rgba(70,95,105,0.35)";
    try { g.beginPath(); g.ellipse(cx, cy, r, r * 0.55, Math.random() * Math.PI, 0, Math.PI * 2); g.fill(); } catch { g.fillRect(cx - r, cy - r * 0.55, r * 2, r * 1.1); }
  }
}

/** The station footprint: a holographic pad the equipment stands on. */
export function stationPad(parent, radius = 1.75, accent = CITY.accent) {
  const g = group(parent);
  torus(g, radius, 0.014, 0, 0.012, 0, accent,
    { emissive: accent, ei: 2.2, rough: 0.4, cast: false, seg: 8, seg2: 56 });
  torus(g, radius - 0.09, 0.005, 0, 0.012, 0, accent,
    { emissive: accent, ei: 1.1, rough: 0.4, cast: false, seg: 6, seg2: 56 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const tick = box(g, 0.03, 0.006, 0.17, Math.sin(a) * radius, 0.012, Math.cos(a) * radius,
      accent, { emissive: accent, ei: 1.8, rough: 0.4, cast: false });
    tick.rotation.y = a;
  }
  return g;
}

/** Free-standing holographic panel: the station's readouts and paperwork in AR. */
export function holoPanel(parent, w, h, x, y, z, draw, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  const accent = o.accent ?? CITY.accent;
  const face = decal(g, w, h, 0, 0, 0, draw, { px: o.px ?? 640, glow: true, ei: o.ei ?? 0.95, transparent: true });
  // Corner brackets rather than a full frame — reads as a projection, not a screen.
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    box(g, w * 0.16, 0.006, 0.004, sx * (w / 2 - w * 0.08), sy * (h / 2), -0.002, accent,
      { emissive: accent, ei: 2.4, rough: 0.4, cast: false });
    box(g, 0.006, h * 0.22, 0.004, sx * (w / 2), sy * (h / 2 - h * 0.11), -0.002, accent,
      { emissive: accent, ei: 2.4, rough: 0.4, cast: false });
  }
  if (o.stalk) {
    cyl(g, 0.008, 0.008, y - 0.02, 0, -(y - 0.02) / 2 - h / 2, 0, accent,
      { emissive: accent, ei: 0.9, rough: 0.4, seg: 8, cast: false });
  }
  g.userData.face = face;
  return g;
}

/** Small floating caption used to name a piece of equipment in the AR overlay. */
export function holoTag(parent, text, x, y, z, o = {}) {
  const accent = o.accent ?? CITY.accent;
  return decal(parent, o.w ?? 0.3, o.h ?? 0.07, x, y, z, (g, w, h) => {
    g.fillStyle = "rgba(6,14,20,0.82)";
    g.fillRect(0, 0, w, h);
    g.fillStyle = o.css ?? CITY.accentCss;
    g.fillRect(0, 0, 4, h);
    g.fillStyle = "#eaf6fb";
    g.font = `600 ${Math.round(h * 0.56)}px 'Barlow Condensed', Arial, sans-serif`;
    g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText(String(text).toUpperCase(), w * 0.06, h * 0.56);
  }, { px: 320, glow: true, ei: 0.8, transparent: true });
}

/**
 * A thin transparent decal laid over a flat-coloured surface to add grain and grime
 * without hiding the material colour underneath — an overlay, not a face.
 */
function weatherPanel(parent, w, h, x, y, z, o = {}) {
  return decal(parent, w, h, x, y, z, (g, cw, ch) => {
    g.clearRect(0, 0, cw, ch);
    noiseTexture(g, cw, ch, { density: o.density ?? 650, alpha: o.alpha ?? 0.05, tone: o.tone ?? "8,8,8" });
    grimeOverlay(g, cw, ch, {
      blotches: o.blotches ?? 3, streaks: o.streaks ?? 2,
      tone: o.tone ?? "12,10,6", alpha: o.grime ?? 0.2,
    });
  }, { px: o.px ?? 192, transparent: true, rough: 0.95 });
}

/** Street / plant equipment cabinet with a hinged door, louvres and plinth. */
export function equipmentCabinet(parent, w, h, d, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const shell = o.color ?? 0x6f7a83;
  box(g, w + 0.1, 0.09, d + 0.1, 0, 0.045, 0, 0x2d3339, { rough: 0.85, finish: "concrete", tile: 2 }); // plinth
  // Painted sheet steel, not a flat swatch: the finish gives the body an orange
  // peel under the key light and a grain on the rain cap. Shared maps, so a
  // yard full of cabinets is still one draw call per colour. See surface().
  box(g, w, h, d, 0, 0.09 + h / 2, 0, shell,
    { rough: o.rough ?? 0.5, metal: o.metal ?? 0.5, finish: o.finish ?? "painted", tile: 2 });
  box(g, w + 0.06, 0.04, d + 0.06, 0, 0.09 + h + 0.02, 0, shell,
    { rough: 0.5, metal: 0.5, finish: o.finish ?? "painted", tile: 2 }); // rain cap
  for (let i = 0; i < 4; i++) {                                                     // louvres
    box(g, w * 0.5, 0.014, 0.01, 0, 0.09 + h * 0.28 + i * 0.05, d / 2 + 0.006, shell,
      { rough: 0.6, metal: 0.4 });
  }
  const door = group(g, -w / 2 + 0.01, 0.09 + h / 2, d / 2);
  box(door, w - 0.03, h - 0.06, 0.022, (w - 0.03) / 2, 0, 0.012, o.doorColor ?? shell,
    { rough: 0.45, metal: 0.55, finish: o.finish ?? "painted", tile: 2 });
  box(door, 0.03, 0.13, 0.03, w - 0.09, 0, 0.03, CITY.steel, { rough: 0.3, metal: 0.9 });
  if (o.weathered !== false) {
    weatherPanel(door, (w - 0.03) * 0.94, (h - 0.06) * 0.94, (w - 0.03) / 2, 0, 0.024,
      { tone: "10,9,6", alpha: 0.045, grime: 0.16 });
  }
  if (o.open) door.rotation.y = o.open;
  g.userData.door = door;
  return g;
}

/** 19-inch equipment rack — telecom nodes, controllers, inverters. */
export function rackFrame(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const h = o.h ?? 1.4;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, 0.035, h, 0.035, sx * 0.24, h / 2, sz * 0.26, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
  }
  box(g, 0.56, 0.03, 0.6, 0, 0.02, 0, CITY.darkSteel, { rough: 0.6, metal: 0.5 });
  return g;
}

/** A rack-mounted unit with a faceplate you can paint. */
export function rackUnit(parent, y, label, o = {}) {
  const g = group(parent, 0, y, 0.26);
  box(g, 0.5, o.h ?? 0.09, 0.5, 0, 0, -0.26, o.color ?? 0x22282e, { rough: 0.5, metal: 0.4 });
  decal(g, 0.46, (o.h ?? 0.09) * 0.7, 0, 0, 0.001,
    signFace(label, { bg: o.bg ?? "#161c22", accent: o.css ?? CITY.accentCss, scale: 0.55, worn: true }),
    { px: 384, glow: !!o.glow, ei: 0.6 });
  for (const sx of [-1, 1]) {
    ball(g, 0.008, sx * 0.2, (o.h ?? 0.09) * 0.28, 0.004, o.lampColor ?? CITY.good,
      { emissive: o.lampColor ?? CITY.good, ei: 2.2 });
  }
  return g;
}

/** Traffic cone with a reflective collar. */
export function cone(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z);
  box(g, 0.3, 0.02, 0.3, 0, 0.01, 0, 0x22262b, { rough: 0.9 });
  cyl(g, 0.03, 0.13, 0.55, 0, 0.29, 0, o.color ?? 0xe4622a, { rough: 0.75, seg: 16 });
  cyl(g, 0.075, 0.095, 0.07, 0, 0.33, 0, 0xe8eef2, { rough: 0.5, seg: 16 });
  return g;
}

/** Folding barrier rail / pedestrian fence panel. */
export function barrierPanel(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const w = o.w ?? 1.3;
  for (const sx of [-1, 1]) {
    cyl(g, 0.02, 0.02, 1.0, sx * (w / 2), 0.5, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 10 });
    box(g, 0.24, 0.02, 0.3, sx * (w / 2), 0.015, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
  }
  for (const y of [0.42, 0.92]) box(g, w, 0.035, 0.02, 0, y, 0, o.color ?? CITY.hiVis, { rough: 0.6 });
  for (let i = 0; i < 5; i++) {
    box(g, 0.018, 0.5, 0.014, -w / 2 + 0.12 + i * ((w - 0.24) / 4), 0.67, 0, CITY.steel,
      { rough: 0.5, metal: 0.6 });
  }
  return g;
}

/** Rolling tool chest — the technician's kit at every station. */
export function toolChest(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  slab(g, 0.62, 0.62, 0.4, 0, 0.42, 0, o.color ?? 0xb8402f, { radius: 0.02, rough: 0.5, metal: 0.3 });
  for (let i = 0; i < 3; i++) {
    box(g, 0.56, 0.02, 0.01, 0, 0.24 + i * 0.16, 0.205, 0x1b1e22, { rough: 0.6 });
    box(g, 0.16, 0.02, 0.02, 0, 0.31 + i * 0.16, 0.208, CITY.steel, { rough: 0.35, metal: 0.85 });
  }
  slab(g, 0.66, 0.03, 0.44, 0, 0.74, 0, 0x2b3138, { radius: 0.02, rough: 0.4, metal: 0.5 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const c = cyl(g, 0.045, 0.045, 0.02, sx * 0.24, 0.045, sz * 0.15, 0x14171a, { rough: 0.85, seg: 12 });
    c.rotation.z = Math.PI / 2;
  }
  return g;
}

/** Gas / fluid cylinder, upright and secured. */
export function cylinderTank(parent, x, z, color, o = {}) {
  const g = group(parent, x, 0, z);
  lathe(g, [[0.001, 0], [0.1, 0.01], [0.105, 0.06], [0.105, 0.86], [0.08, 0.95], [0.042, 0.99],
    [0.042, 1.06], [0.001, 1.065]], 0, 0, 0, color, { rough: 0.45, metal: 0.5, seg: 28, finish: "galvanised" });
  cyl(g, 0.05, 0.055, 0.08, 0, 1.11, 0, CITY.steel, { rough: 0.35, metal: 0.85, seg: 18, finish: "brushed" });
  if (o.gauge !== false) {
    cyl(g, 0.035, 0.035, 0.014, 0.07, 1.09, 0, 0xdfe4e8, { rough: 0.3, metal: 0.4, seg: 14 })
      .rotation.z = Math.PI / 2;
  }
  if (o.plate !== false) {
    const plate = group(g, 0.107, o.plateY ?? 0.5, 0, Math.PI / 2);
    decal(plate, o.plateW ?? 0.15, o.plateH ?? 0.19, 0, 0, 0.001, (cx, cw, ch) => {
      gradientFill(cx, cw, ch, [[0, "#eee7d6"], [1, "#cfc6ab"]]);
      noiseTexture(cx, cw, ch, { density: 420, alpha: 0.06, tone: "70,58,32" });
      grimeOverlay(cx, cw, ch, { blotches: 2, streaks: 2, tone: "55,44,24", alpha: 0.2 });
      cx.strokeStyle = "#3a4450"; cx.lineWidth = Math.max(2, ch * 0.02);
      cx.strokeRect(ch * 0.06, ch * 0.06, cw - ch * 0.12, ch - ch * 0.12);
      cx.fillStyle = "#22303c";
      cx.font = `700 ${Math.round(ch * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(o.plateLabel ?? "CYLINDER", cw / 2, ch * 0.22);
      cx.fillStyle = "#5a4a2a";
      cx.font = `${Math.round(ch * 0.08)}px Arial, sans-serif`;
      (o.plateLines ?? ["INSPECT BEFORE USE", "SEE TAG FOR CONTENTS"]).forEach((line, i) =>
        cx.fillText(line, cw / 2, ch * 0.42 + i * ch * 0.11));
    }, { px: 160, rough: 0.75 });
  }
  return g;
}

/** Pipe run with flanges — plant rooms, vaults, chiller skids. */
export function pipeRun(parent, points, radius, color, o = {}) {
  const g = group(parent);
  hose(g, points, radius, color, { steps: o.steps ?? 24, rough: o.rough ?? 0.5, metal: o.metal ?? 0.6 });
  for (const p of o.flanges ?? []) {
    const f = cyl(g, radius * 1.8, radius * 1.8, 0.03, p[0], p[1], p[2], CITY.darkSteel,
      { rough: 0.5, metal: 0.7, seg: 16 });
    if (o.flangeAxis === "z") f.rotation.x = Math.PI / 2;
    if (o.flangeAxis === "x") f.rotation.z = Math.PI / 2;
  }
  return g;
}

/** Hand wheel valve on a body — vaults, chiller plant, water main. */
export function valveWheel(parent, x, y, z, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  const r = o.r ?? 0.16;
  box(g, 0.16, 0.18, 0.16, 0, 0, 0, o.body ?? 0x2f6f4a, { rough: 0.6, metal: 0.4 });
  cyl(g, 0.02, 0.02, 0.2, 0, 0.16, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 10 });
  const wheel = group(g, 0, 0.27, 0);
  torus(wheel, r, 0.016, 0, 0, 0, o.color ?? 0xb8402f, { rough: 0.6, seg: 8, seg2: 24 })
    .rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const spoke = box(wheel, r * 2, 0.014, 0.02, 0, 0, 0, o.color ?? 0xb8402f, { rough: 0.6 });
    spoke.rotation.y = (i * Math.PI) / 4;
  }
  cyl(wheel, 0.028, 0.028, 0.03, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 12 });
  g.userData.wheel = wheel;
  return g;
}

/** Padlock and tag, the shared vocabulary of every isolation step. */
export function lockTag(parent, x, y, z, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  torus(g, 0.022, 0.006, 0, 0.024, 0, 0xc0c6cc, { rough: 0.25, metal: 0.95 }).rotation.y = Math.PI / 2;
  box(g, 0.03, 0.04, 0.017, 0, 0, 0, o.color ?? 0xd8232a, { rough: 0.5 });
  const tag = decal(g, 0.075, 0.1, 0, -0.085, 0.008,
    paperFace("DANGER", o.lines ?? ["DO NOT", "OPERATE"], { bg: "#f4e9d8", band: "#b81410", worn: true }), { px: 192 });
  tag.rotation.z = o.tilt ?? 0.07;
  return g;
}

/** Hand-held instrument with a live canvas readout — meters, probes, analysers. */
export function instrument(parent, x, y, z, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  slab(g, o.w ?? 0.13, 0.04, o.d ?? 0.21, 0, 0, 0, o.color ?? CITY.hiVis, { radius: 0.012, rough: 0.55 });
  const screen = decal(g, (o.w ?? 0.13) * 0.78, (o.d ?? 0.21) * 0.34, 0, 0.021, -(o.d ?? 0.21) * 0.2,
    signFace(o.idle ?? "----", { bg: "#0d1c24", accent: CITY.accentCss, fg: "#bfeaf7", scale: 0.62 }),
    { glow: true, ei: 0.85, px: 320 });
  screen.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    box(g, 0.02, 0.006, 0.014, -0.035 + (i % 3) * 0.035, 0.022, (o.d ?? 0.21) * 0.16 + Math.floor(i / 3) * 0.03,
      0x22262b, { rough: 0.6 });
  }
  g.userData.screen = screen;
  return g;
}

/**
 * Standing figure — casualties, bystanders, crew members.
 *
 * Built from the shared figure parts in shared/kit.js, so a SmartCiti.X crew
 * member and a Trade Skills bay hand are the same person in different work
 * dress. Thirteen meshes bare, which is what the old block-and-ball stand-in
 * cost: see the people section of kit.js for where each one goes.
 *
 * `skin` and `seed` are optional — left alone, the figure takes a skin tone,
 * a hair colour and one of six faces from its own position, so a crew of six
 * is six people rather than one person six times.
 */
export function standingFigure(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  // Tag them the way the trades bays tag theirs, so tools/check_layout.mjs
  // holds a SmartCiti.X figure to the same rule: a person has to be standing
  // somewhere, not inside a cabinet. A figure that is meant to be lying down,
  // or riding something, is exempt — that is where it is supposed to be.
  // `atStation` is for a figure whose position against the equipment is the
  // content — a casualty down the hole, a coworker riding the forks. Those are
  // meant to be where they are; everyone else is standing somewhere and has to
  // be standing somewhere real.
  if (!o.lying && !o.atStation) g.userData.crew = true;
  const look = figureLook(o, x, z);
  const cloth = o.cloth ?? 0x37505f;
  const trousers = o.trousers ?? 0x2f3740;
  const lying = !!o.lying;
  const body = group(g, 0, 0, 0);
  if (lying) { body.rotation.x = -Math.PI / 2; body.position.set(0, 0.16, 0); }
  personTorso(body, {
    cloth, trousers, harness: o.harness,
    // A hi-vis vest is the garment worn over the shirt, so it takes the
    // torso's colour instead of costing a second shell around it, and the two
    // reflective bands across it are the one mesh that is added.
    jacket: o.vest ?? cloth,
    vis: o.vest ? (o.bands ?? 0xdfe8ee) : null,
    ei: 0.45,
  });
  personLegs(body, { trousers });
  const head = group(body, 0, 1.5, 0);
  personHead(head, { look, k: 0.9, helmet: o.helmet, respirator: o.respirator });
  for (const sx of [-1, 1]) {
    personArm(body, sx, { sleeve: cloth, skin: look.skin, glove: o.gloves });
  }
  g.userData.head = head;
  g.userData.body = body;
  return g;
}

// Discrete tone/finish sets — reused across towers so the material cache stays small
// instead of minting one unique material per random roughness value.
const SKY_TONES = [0x283547, 0x2d3c53, 0x222d3d, 0x323e51, 0x1f2b3b, 0x354a62];
const SKY_ROUGH = [0.82, 0.88, 0.94, 1.0];
const SKY_WINDOW = [0x4fd1ff, 0x7ee6ff, 0xffd28a, 0xa079ff];

/**
 * Distant skyline for the non-AR stage: a silhouette ring, never lit by scene lights.
 * Each tower gets its own height/tone/window-band treatment so the ring reads as a
 * real mixed-use district rather than a repeated block; a handful of rooftops carry a
 * slow-pulsing beacon (returned in `userData.beacons` for the caller to animate).
 */
export function skyline(parent, o = {}) {
  const g = group(parent);
  const count = o.count ?? 54;
  const beacons = [];
  // A district on a shoreline opens the ring toward the water: `gap` is the
  // [from, to] bearing (radians, 0 = +z, π = the side the learner faces) in
  // which no tower is built, so the horizon there is whatever the district
  // puts across the bay instead of a wall of city.
  const gap = o.gap ?? null;
  const inGap = (a) => { if (!gap) return false; const n = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); return n >= gap[0] && n <= gap[1]; };
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.05;
    if (inGap(a)) continue;
    const r = 34 + Math.random() * 16;
    const h = 5 + Math.random() * 24;
    const w = 3 + Math.random() * 5;
    const tone = SKY_TONES[i % SKY_TONES.length];
    const rough = SKY_ROUGH[i % SKY_ROUGH.length];
    const metal = i % 5 === 0 ? 0.3 : 0;
    const tower = box(g, w, h, w, Math.sin(a) * r, h / 2 - 1.5, Math.cos(a) * r,
      tone, { rough, metal, cast: false, receive: false });
    tower.rotation.y = a;
    const bands = 1 + (i % 3 === 0 ? 1 : 0);
    for (let b = 0; b < bands; b++) {
      if ((i + b * 7) % 5 === 0) continue; // leave some floors dark
      const wt = SKY_WINDOW[(i + b) % SKY_WINDOW.length];
      const lit = box(g, w * (0.55 + ((i + b) % 4) * 0.06), 0.06, 0.05,
        Math.sin(a) * r, h * (0.25 + b * 0.32 + ((i * 7 + b) % 5) * 0.05) - 1.5,
        Math.cos(a) * r + w / 2, wt,
        { emissive: wt, ei: 1.3 + ((i + b) % 4) * 0.35, rough: 0.4, cast: false, receive: false });
      lit.rotation.y = a;
    }
    if (i % 9 === 0) {
      const beacon = ball(g, 0.09, Math.sin(a) * r, h - 1.5 + 0.12, Math.cos(a) * r, 0xff5f5f,
        { emissive: 0xff5f5f, ei: 1.6, rough: 0.3, cast: false });
      // Give each beacon its own material instance (cheap — a handful of towers only)
      // so the pulse below can stagger per-beacon instead of every one sharing (and
      // fighting over) the single cached material `mat()` would otherwise reuse.
      beacon.material = beacon.material.clone();
      beacon.material.userData.ownMaterial = true; // disposeTree() should free this clone
      beacon.userData.phase = (i / count) * Math.PI * 2;
      beacons.push(beacon);
    }
  }
  g.userData.beacons = beacons;
  return g;
}

export function reg(hits, obj, id) {
  markInteractive(obj, id);
  hits[id] = obj;
  return obj;
}
