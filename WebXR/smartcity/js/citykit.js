import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  mat, HUD, markInteractive,
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

/** Street / plant equipment cabinet with a hinged door, louvres and plinth. */
export function equipmentCabinet(parent, w, h, d, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const shell = o.color ?? 0x6f7a83;
  box(g, w + 0.1, 0.09, d + 0.1, 0, 0.045, 0, 0x2d3339, { rough: 0.85 });          // plinth
  box(g, w, h, d, 0, 0.09 + h / 2, 0, shell, { rough: o.rough ?? 0.5, metal: o.metal ?? 0.5 });
  box(g, w + 0.06, 0.04, d + 0.06, 0, 0.09 + h + 0.02, 0, shell, { rough: 0.5, metal: 0.5 }); // rain cap
  for (let i = 0; i < 4; i++) {                                                     // louvres
    box(g, w * 0.5, 0.014, 0.01, 0, 0.09 + h * 0.28 + i * 0.05, d / 2 + 0.006, shell,
      { rough: 0.6, metal: 0.4 });
  }
  const door = group(g, -w / 2 + 0.01, 0.09 + h / 2, d / 2);
  box(door, w - 0.03, h - 0.06, 0.022, (w - 0.03) / 2, 0, 0.012, o.doorColor ?? shell,
    { rough: 0.45, metal: 0.55 });
  box(door, 0.03, 0.13, 0.03, w - 0.09, 0, 0.03, CITY.steel, { rough: 0.3, metal: 0.9 });
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
    signFace(label, { bg: o.bg ?? "#161c22", accent: o.css ?? CITY.accentCss, scale: 0.55 }),
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
    [0.042, 1.06], [0.001, 1.065]], 0, 0, 0, color, { rough: 0.45, metal: 0.5, seg: 20 });
  cyl(g, 0.05, 0.055, 0.08, 0, 1.11, 0, CITY.steel, { rough: 0.35, metal: 0.85, seg: 14 });
  if (o.gauge !== false) {
    cyl(g, 0.035, 0.035, 0.014, 0.07, 1.09, 0, 0xdfe4e8, { rough: 0.3, metal: 0.4, seg: 14 })
      .rotation.z = Math.PI / 2;
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
    paperFace("DANGER", o.lines ?? ["DO NOT", "OPERATE"], { bg: "#f4e9d8", band: "#b81410" }), { px: 192 });
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

/** Standing figure — casualties, bystanders, crew members. */
export function standingFigure(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const skin = o.skin ?? 0xc99878;
  const cloth = o.cloth ?? 0x37505f;
  const lying = !!o.lying;
  const body = group(g, 0, 0, 0);
  if (lying) { body.rotation.x = -Math.PI / 2; body.position.set(0, 0.16, 0); }
  box(body, 0.36, 0.52, 0.22, 0, 1.05, 0, cloth, { rough: 0.9 });
  box(body, 0.32, 0.14, 0.22, 0, 0.75, 0, cloth, { rough: 0.9 });
  for (const sx of [-1, 1]) {
    cyl(body, 0.065, 0.06, 0.7, sx * 0.1, 0.35, 0, o.trousers ?? 0x2f3740, { rough: 0.9, seg: 10 });
    box(body, 0.1, 0.06, 0.2, sx * 0.1, 0.03, 0.05, 0x1b1e22, { rough: 0.85 });
    cyl(body, 0.05, 0.045, 0.55, sx * 0.24, 1.02, 0, cloth, { rough: 0.9, seg: 10 });
    ball(body, 0.045, sx * 0.24, 0.73, 0.02, skin, { rough: 0.75, seg: 12 });
  }
  cyl(body, 0.05, 0.055, 0.1, 0, 1.36, 0, skin, { rough: 0.75, seg: 12 });
  const head = group(body, 0, 1.5, 0);
  ball(head, 0.115, 0, 0, 0, skin, { rough: 0.75, seg: 18 });
  box(head, 0.16, 0.1, 0.1, 0, -0.05, 0.05, skin, { rough: 0.75 });
  if (o.helmet) {
    lathe(head, [[0.001, 0.05], [0.09, 0.06], [0.125, 0.02], [0.13, 0.0], [0.001, 0.0]], 0, 0.05, 0,
      o.helmet, { rough: 0.4, seg: 16 });
    box(head, 0.2, 0.02, 0.1, 0, 0.05, 0.09, o.helmet, { rough: 0.4 });
  }
  if (o.vest) box(body, 0.38, 0.46, 0.24, 0, 1.05, 0, o.vest, { rough: 0.85 });
  g.userData.head = head;
  g.userData.body = body;
  return g;
}

/** Distant skyline for the non-AR stage: a silhouette ring, never lit. */
export function skyline(parent, o = {}) {
  const g = group(parent);
  const count = o.count ?? 54;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.05;
    const r = 34 + Math.random() * 16;
    const h = 5 + Math.random() * 22;
    const w = 3 + Math.random() * 5;
    const tower = box(g, w, h, w, Math.sin(a) * r, h / 2 - 1.5, Math.cos(a) * r,
      0x141b23, { rough: 1, cast: false, receive: false });
    tower.rotation.y = a;
    if (Math.random() < 0.55) {
      const lit = box(g, w * 0.7, 0.06, 0.05, Math.sin(a) * r, h * (0.4 + Math.random() * 0.5) - 1.5,
        Math.cos(a) * r + w / 2, 0x4fd1ff,
        { emissive: 0x4fd1ff, ei: 1.4 + Math.random(), rough: 0.4, cast: false, receive: false });
      lit.rotation.y = a;
    }
  }
  return g;
}

export function reg(hits, obj, id) {
  markInteractive(obj, id);
  hits[id] = obj;
  return obj;
}
