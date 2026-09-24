import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { mat, box, cyl, group, mergeStatic, standingPerson } from "../../shared/kit.js";
import {
  sedan, pickup, semiTractor, forkliftCounterbalance, bucketTruck, busTransit, tractorTrailer, yardHustler, trailer,
} from "../../shared/fleet.js";
import { skidSteer, dumpTruck, craneSpreader, concretePump } from "../../shared/equipment.js";
import { rcFrame, rcPointAt } from "./track.js";
import { RC_VEHICLES } from "./sim.js";

// Night Highway Circuit — the world.
//
// Dresses a compiled track (see track.js) and keeps the scene in step with a
// race (see sim.js). The road, barriers, supports, markings, skyline, tunnel,
// toll plaza, cranes, container stacks, bridge and quarry benches are all
// generated here from the track's own tables: a new track is a new data file,
// and only a genuinely new kind of scenery needs code in this one.
//
// Vehicles are the platform's own fleet and equipment builders
// (shared/fleet.js, shared/equipment.js) at kart scale. Large static geometry
// is written straight into a few merged BufferGeometries (RcMesh below), so a
// whole skyline or a kilometre of barrier is one draw call. Every name,
// colour and shape is original.

const RC_BUILDERS = {
  sedan, pickup, semiTractor, forkliftCounterbalance, skidSteer, dumpTruck, bucketTruck, busTransit, tractorTrailer, yardHustler,
};
const RC_CIVILIAN = [0xb8bec6, 0x2b3a55, 0x8a1f24, 0xe8e6df, 0x3d4a3a, 0x5a5d63, 0x1c1d20, 0x8c6a3c];
const rcHexNum = (c) => (typeof c === "number" ? c : parseInt(String(c).replace("#", ""), 16));

// ------------------------------------------------------------ canvas faces

function rcCanvas(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  try { draw(c.getContext("2d"), w, h); } catch (e) { /* headless: no 2D context */ }
  const t = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace !== undefined) t.colorSpace = THREE.SRGBColorSpace;
  if (THREE.RepeatWrapping !== undefined) { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = 4;
  return t;
}

function rcWindowTex(seed, warm) {
  let a = seed * 9301 + 49297;
  const rnd = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
  return rcCanvas(256, 512, (g, w, h) => {
    g.fillStyle = "#0b0f18"; g.fillRect(0, 0, w, h);
    const cols = 8, rows = 16, cw = w / cols, ch = h / rows;
    for (let r = 1; r < rows; r++) for (let c = 0; c < cols; c++) {
      const lit = rnd();
      g.fillStyle = lit > 0.62 ? (warm ? (rnd() > 0.3 ? "#ffd58a" : "#fff1c9") : (rnd() > 0.4 ? "#cfe4ff" : "#9fc4ff")) : lit > 0.5 ? "#2a3446" : "#141b28";
      g.fillRect(c * cw + 3, r * ch + 5, cw - 6, ch - 9);
    }
    g.fillStyle = "#06080d"; g.fillRect(0, 0, w, ch);     // roof band (row 0)
  });
}

function rcPoolTex() {
  return rcCanvas(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.45, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

function rcTextTex(text, o = {}) {
  const w = o.w ?? 512, h = o.h ?? 128;
  return rcCanvas(w, h, (g) => {
    g.fillStyle = o.bg ?? "#136b3a"; g.fillRect(0, 0, w, h);
    g.strokeStyle = o.edge ?? "#f4f4f4"; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = o.fg ?? "#f4f4f4";
    g.font = `700 ${o.px ?? 54}px 'Barlow Condensed', Arial, sans-serif`;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 2);
  });
}

// ------------------------------------------------------------ the mesher

/** Accumulates flat-shaded quads into one BufferGeometry. */
class RcMesh {
  constructor() { this.p = []; this.n = []; this.uv = []; this.ix = []; }
  get empty() { return this.ix.length === 0; }
  quad(a, b, c, d, uv = [[0, 0], [1, 0], [1, 1], [0, 1]]) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const base = this.p.length / 3;
    for (const [q, t] of [[a, uv[0]], [b, uv[1]], [c, uv[2]], [d, uv[3]]]) {
      this.p.push(q[0], q[1], q[2]); this.n.push(nx, ny, nz); this.uv.push(t[0], t[1]);
    }
    this.ix.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  /** A box centred at (x, y0 + h/2, z), turned ry about Y. `k` scales the UVs (per metre). */
  box(x, y0, z, w, h, d, ry = 0, k = [1 / 8, 1 / 8], o = {}) {
    const c = Math.cos(ry), s = Math.sin(ry);
    const P = (lx, ly, lz) => [x + lx * c + lz * s, y0 + ly, z - lx * s + lz * c];
    const hw = w / 2, hd = d / 2;
    const v0 = o.v0 ?? 0;
    const U = (a, b) => [a * k[0] + (o.u0 ?? 0), b * k[1] + v0];
    const faces = [
      [[hw, 0, hd], [-hw, 0, hd], [-hw, h, hd], [hw, h, hd], w],    // +z... wound outward below
      [[-hw, 0, -hd], [hw, 0, -hd], [hw, h, -hd], [-hw, h, -hd], w],
      [[hw, 0, -hd], [hw, 0, hd], [hw, h, hd], [hw, h, -hd], d],
      [[-hw, 0, hd], [-hw, 0, -hd], [-hw, h, -hd], [-hw, h, hd], d],
    ];
    for (const [a, b, cc, dd, len] of faces) {
      // Outward winding: (b - a) x (d - a) must point away from the centre.
      this.quad(P(...b), P(...a), P(...dd), P(...cc), [U(len, 0), U(0, 0), U(0, h), U(len, h)]);
    }
    if (o.top !== false) {
      const r = o.roofUV ?? null;
      const uvTop = r ? [r, r, r, r] : [U(0, 0), U(w, 0), U(w, d), U(0, d)];
      this.quad(P(-hw, h, hd), P(hw, h, hd), P(hw, h, -hd), P(-hw, h, -hd), uvTop);
    }
    if (o.bottom) this.quad(P(-hw, 0, -hd), P(hw, 0, -hd), P(hw, 0, hd), P(-hw, 0, hd));
  }
  build(material, parent) {
    if (this.empty) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(this.p), 3));
    g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(this.n), 3));
    g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(this.uv), 2));
    const idx = this.p.length / 3 > 65535 ? new Uint32Array(this.ix) : new Uint16Array(this.ix);
    g.setIndex?.(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere?.();
    const m = new THREE.Mesh(g, material);
    m.receiveShadow = true;
    m.matrixAutoUpdate = false;
    m.updateMatrix?.();
    parent.add(m);
    return m;
  }
}

// ------------------------------------------------------------ helpers

/** Surface point at (s, d) raised by `up` along world Y, as an array. */
function rcP(tr, s, d, up = 0) {
  const q = rcPointAt(tr, s, d);
  return [q.x, q.y + up, q.z];
}

/** Minimum plan distance from (x, z) to the centreline (coarse). */
function rcDistToTrack(tr, x, z) {
  let best = Infinity;
  for (let k = 0; k < tr.n; k += 3) best = Math.min(best, (tr.x[k] - x) ** 2 + (tr.z[k] - z) ** 2);
  return Math.sqrt(best);
}

function rcSeeded(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
}

function rcStandardMat(colour, o = {}) {
  return new THREE.MeshStandardMaterial({
    color: colour, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0, emissive: o.emissive ?? 0x000000,
    emissiveIntensity: o.ei ?? 1, map: o.map ?? null, emissiveMap: o.emissiveMap ?? null,
    transparent: !!o.transparent, opacity: o.opacity ?? 1, alphaTest: o.alphaTest ?? 0,
    side: o.double ? THREE.DoubleSide : THREE.FrontSide, depthWrite: o.depthWrite ?? true,
  });
}

function rcGlowMat(colour, opacity = 0.5, map = null) {
  return new THREE.MeshBasicMaterial({
    color: colour, transparent: true, opacity, map, depthWrite: false, blending: THREE.AdditiveBlending, fog: true,
  });
}

// ------------------------------------------------------------ vehicles

/**
 * A fleet vehicle at kart scale inside a wrapper group that the race moves.
 * Returns the wrapper; `userData.parts` are the builder's parts.
 */
export function rcBuildVehicle(parent, builder, scale, livery, opts = {}) {
  const wrap = new THREE.Group();
  const inner = new THREE.Group();
  wrap.add(inner);
  const fn = RC_BUILDERS[builder] ?? sedan;
  const v = fn(inner, 0, 0, 0, { livery, ...(opts.builderOpts ?? {}) });
  inner.scale.setScalar(scale);
  wrap.userData.parts = v.userData?.parts ?? {};
  wrap.userData.inner = inner;
  parent.add(wrap);
  return wrap;
}

function rcRacerModel(parent, r, night) {
  const veh = r.veh;
  const wrap = rcBuildVehicle(parent, veh.builder, veh.scale, { colour: veh.colour, fleetName: "NIGHT CIRCUIT", unitNumber: String(r.id + 1) });
  const [w, h, l] = veh.dims.map((x) => x * veh.scale);
  // The hard-hat shield: a translucent dome.
  const shield = new THREE.Mesh(new THREE.SphereGeometry(Math.max(w, l) * 0.62, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    rcGlowMat(0xffd23a, 0.28));
  shield.visible = false; wrap.add(shield);
  // Boost flare behind the vehicle.
  const flare = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.55, 2.4, 10, 1, true), rcGlowMat(0x5fd8ff, 0.7));
  flare.rotation.x = -Math.PI / 2; flare.position.set(0, 0.6, -l / 2 - 1.1); flare.visible = false; wrap.add(flare);
  // Turn signals: two amber lamps a side, blinking.
  const sigMat = new THREE.MeshBasicMaterial({ color: 0xffa21a });
  const sigL = new THREE.Group(), sigR = new THREE.Group();
  for (const [g, sx] of [[sigL, 1], [sigR, -1]]) {
    for (const sz of [1, -1]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), sigMat);
      m.position.set(sx * (w / 2 + 0.05), Math.min(1.1, h * 0.45), sz * (l / 2 - 0.1));
      g.add(m);
    }
    g.visible = false; wrap.add(g);
  }
  // Headlight pool on the road ahead, at night.
  let beam = null;
  if (night) {
    beam = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.6, 16), rcGlowMat(0xfff0c8, 0.22, rcBeamTex()));
    beam.rotation.x = -Math.PI / 2; beam.position.set(0, 0.08, l / 2 + 8.5);
    wrap.add(beam);
  }
  // A marker over each human's vehicle, in the player's colour.
  let marker = null;
  if (r.human) {
    marker = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0, 1.1, 4), new THREE.MeshBasicMaterial({ color: RC_PLAYER_COLOURS[r.player ?? 0] ?? 0xffffff }));
    marker.position.set(0, h + 1.6, 0);
    wrap.add(marker);
  }
  wrap.userData.fx = { shield, flare, sigL, sigR, beam, marker, h, l, w };
  return wrap;
}

export const RC_PLAYER_COLOURS = [0x4fd1ff, 0xff5a7a, 0x8cff5a, 0xffc93c];

let rcBeamCache = null;
function rcBeamTex() {
  if (rcBeamCache) return rcBeamCache;
  rcBeamCache = rcCanvas(64, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, h, 0, 0);
    gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(w * 0.3, h); g.lineTo(0, 0); g.lineTo(w, 0); g.lineTo(w * 0.7, h); g.closePath(); g.fill();
  });
  return rcBeamCache;
}

/** A translucent copy of a racer for the time-trial ghost. */
export function rcGhostModel(parent, vehicleId) {
  const veh = RC_VEHICLES.find((v) => v.id === vehicleId) ?? RC_VEHICLES[0];
  const wrap = rcBuildVehicle(parent, veh.builder, veh.scale, { colour: 0x9fe8ff, fleetName: "GHOST", unitNumber: "0" });
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x8fe3ff, transparent: true, opacity: 0.32, depthWrite: false });
  wrap.traverse((o) => { if (o.isMesh) o.material = ghostMat; });
  return wrap;
}

/** A straddle carrier: four legs, a top frame, a cab and a hanging spreader with its box. */
function rcStraddleCarrier(parent) {
  const g = new THREE.Group();
  const Y = 0xf2c230, W = 5.2, L = 9.5, H = 14;
  for (const sx of [1, -1]) {
    box(g, 0.5, 0.9, L, sx * (W / 2 - 0.25), 0.9, 0, 0x33373c, { finish: "painted" });       // wheel beams
    for (const sz of [1, -1]) {
      box(g, 0.55, H - 1.8, 0.8, sx * (W / 2 - 0.3), 1.4 + (H - 1.8) / 2, sz * (L / 2 - 0.6), Y, { finish: "painted" });
      cyl(g, 0.55, 0.55, 0.5, sx * (W / 2 - 0.3), 0.55, sz * (L / 2 - 0.6), 0x17191c, { finish: "rubber", seg: 14 }).rotation.z = Math.PI / 2;
    }
    box(g, 0.7, 1.0, L, sx * (W / 2 - 0.3), H - 0.3, 0, Y, { finish: "painted" });
  }
  for (const sz of [1, -1]) box(g, W, 0.9, 0.8, 0, H - 0.25, sz * (L / 2 - 0.6), Y, { finish: "painted" });
  box(g, 2.2, 2.2, 2.6, W / 2 - 1.2, H + 1.1, L / 2 - 1.8, 0xe8e8e2, { finish: "painted" });
  box(g, 1.9, 0.9, 0.05, W / 2 - 1.2, H + 1.4, L / 2 - 0.48, 0x223344, { rough: 0.2, metal: 0.3 });
  const beacon = box(g, 0.3, 0.25, 0.3, 0, H + 0.4, 0, 0xffa21a, { emissive: 0xff8a00, ei: 1.2 });
  const sp = craneSpreader(g, 0, 0, 0, { ry: 0 });
  sp.scale.setScalar(0.75); sp.position.set(0, H - 6.4, 0);
  box(g, 2.44, 2.6, 9.1, 0, H - 9.4, 0, 0x2d6fa8, { finish: "painted" });                     // the box it carries
  mergeStatic(g, { local: true });
  parent.add(g);
  g.userData.beacon = beacon;
  return g;
}

function rcHaulTruck(parent) {
  const w = rcBuildVehicle(parent, "dumpTruck", 1.6, { colour: 0xf0b323, fleetName: "PIT OPS", unitNumber: "H-7" });
  const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), new THREE.MeshBasicMaterial({ color: 0xffa21a }));
  beacon.position.set(0, 3.26 * 1.6 + 0.3, 3.2 * 1.6); w.add(beacon);
  w.userData.beacon = beacon;
  return w;
}

// ------------------------------------------------------------ track dressing

const RC_SURFACES = {
  asphalt: { colour: 0x33353a, finish: "asphalt", side: 0x9c9a92 },
  concrete: { colour: 0x7c7b76, finish: "concrete", side: 0x8e8b84 },
  dirt: { colour: 0x8a6848, finish: "concrete", side: 0x6e553c },
  deck: { colour: 0x3a3c40, finish: "asphalt", side: 0x7d8288 },
};

function rcRoad(root, tr) {
  const def = tr.def;
  const surf = RC_SURFACES[def.surface] ?? RC_SURFACES.asphalt;
  const road = new RcMesh();
  const k = 1 / 6;
  for (let i = 0; i < tr.n; i++) {
    const s0 = i * tr.ds, s1 = (i + 1) * tr.ds;
    const a0 = rcP(tr, s0, tr.half), b0 = rcP(tr, s0, -tr.half), a1 = rcP(tr, s1, tr.half), b1 = rcP(tr, s1, -tr.half);
    road.quad(a0, b0, b1, a1, [[0, s0 * k], [tr.width * k, s0 * k], [tr.width * k, s1 * k], [0, s1 * k]]);
  }
  road.build(mat(surf.colour, { finish: surf.finish, rough: 0.92, tile: 1 }), root);

  // Markings: centre line, lane dashes, edge lines.
  const mk = def.markings ?? {};
  const white = new RcMesh(), yellow = new RcMesh();
  const strip = (m, d, w, dash, up = 0.03) => {
    for (let i = 0; i < tr.n; i++) {
      if (dash && (i % 6) > 2) continue;
      const s0 = i * tr.ds, s1 = (i + 1) * tr.ds;
      m.quad(rcP(tr, s0, d + w / 2, up), rcP(tr, s0, d - w / 2, up), rcP(tr, s1, d - w / 2, up), rcP(tr, s1, d + w / 2, up));
    }
  };
  if (mk.centre === "yellow") { strip(yellow, 0.22, 0.16, false); strip(yellow, -0.22, 0.16, false); }
  for (const d of mk.dashes ?? []) strip(white, d, 0.16, true);
  if (mk.edge) { strip(white, tr.half - 0.45, 0.18, false); strip(white, -tr.half + 0.45, 0.18, false); }
  white.build(new THREE.MeshStandardMaterial({ color: 0xe8e8e2, emissive: 0x9a9a92, emissiveIntensity: 0.35, roughness: 0.6 }), root);
  yellow.build(new THREE.MeshStandardMaterial({ color: 0xf2c230, emissive: 0x8a6a10, emissiveIntensity: 0.45, roughness: 0.6 }), root);

  // Start / finish: a chequered strip across the road.
  const chk = rcCanvas(256, 32, (g, w, h) => {
    for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? "#111" : "#f2f2f2"; g.fillRect(x * 16, y * 16, 16, 16); }
  });
  const line = new RcMesh();
  line.quad(rcP(tr, -1.6, tr.half, 0.035), rcP(tr, -1.6, -tr.half, 0.035), rcP(tr, 1.6, -tr.half, 0.035), rcP(tr, 1.6, tr.half, 0.035));
  line.build(new THREE.MeshStandardMaterial({ map: chk, roughness: 0.7, emissive: 0x333333, emissiveIntensity: 0.4 }), root);
}

function rcBarriers(root, tr) {
  const def = tr.def;
  const kind = def.barrier ?? "jersey";
  const surf = RC_SURFACES[def.surface] ?? RC_SURFACES.asphalt;
  const profiles = {
    jersey: [[0, 0], [0.06, 0.28], [0.2, 0.45], [0.24, 1.05], [0.46, 1.05], [0.5, 0.45], [0.64, 0.28], [0.7, 0]],
    berm: [[0, 0], [0.7, 1.1], [1.5, 1.35], [2.4, 1.0], [3.2, 0]],
    fence: [[0, 0], [0, 1.0], [0.55, 1.0], [0.6, 0]],
    rail: [[0, 0.55], [0, 0.95], [0.18, 0.95], [0.18, 0.55]],
  };
  const prof = profiles[kind] ?? profiles.jersey;
  const m = new RcMesh();
  for (const sg of [1, -1]) {
    for (let i = 0; i < tr.n; i++) {
      const s0 = i * tr.ds, s1 = (i + 1) * tr.ds;
      for (let j = 0; j < prof.length - 1; j++) {
        const [o0, y0] = prof[j], [o1, y1] = prof[j + 1];
        const A = rcP(tr, s0, sg * (tr.half + o0), y0), B = rcP(tr, s0, sg * (tr.half + o1), y1);
        const C = rcP(tr, s1, sg * (tr.half + o1), y1), D = rcP(tr, s1, sg * (tr.half + o0), y0);
        if (sg > 0) m.quad(A, D, C, B); else m.quad(A, B, C, D);
      }
    }
  }
  const colour = kind === "berm" ? 0x7a5e42 : kind === "rail" ? 0xb9c0c7 : kind === "fence" ? 0xe8742a : 0xbab7ae;
  m.build(mat(colour, { finish: kind === "berm" ? "concrete" : kind === "rail" ? "galvanised" : "concrete", rough: 0.85, metal: kind === "rail" ? 0.4 : 0 }), root);
  if (kind === "rail") {
    const posts = new RcMesh();
    for (const sg of [1, -1]) for (let s = 0; s < tr.L; s += 4) {
      const q = rcPointAt(tr, s, sg * (tr.half + 0.25));
      posts.box(q.x, q.y, q.z, 0.14, 0.95, 0.14, q.head, [1, 1]);
    }
    posts.build(mat(0x8e969d, { finish: "galvanised", metal: 0.4 }), root);
  }
  if (kind === "fence") {
    // Site hoarding: a printed panel on the outside of the water-filled barrier.
    const tex = rcCanvas(512, 128, (g, w, h) => {
      g.fillStyle = "#1d3a5c"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#f2c230"; g.fillRect(0, h - 18, w, 18);
      g.fillStyle = "#f4f6f8"; g.font = "700 46px 'Barlow Condensed', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText("SITE SAFETY  ·  HARD HATS ON", w / 2, h / 2 - 8);
    });
    const hoard = new RcMesh();
    for (const sg of [1, -1]) for (let i = 0; i < tr.n; i++) {
      const s0 = i * tr.ds, s1 = (i + 1) * tr.ds;
      const A = rcP(tr, s0, sg * (tr.half + 0.9), 0), B = rcP(tr, s1, sg * (tr.half + 0.9), 0);
      const C = rcP(tr, s1, sg * (tr.half + 0.9), 2.4), D = rcP(tr, s0, sg * (tr.half + 0.9), 2.4);
      const u0 = (s0 / 12) % 1000, u1 = u0 + tr.ds / 12;
      if (sg > 0) hoard.quad(A, D, C, B, [[u0, 0], [u0, 1], [u1, 1], [u1, 0]]);
      else hoard.quad(A, B, C, D, [[u0, 0], [u1, 0], [u1, 1], [u0, 1]]);
    }
    hoard.build(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, side: THREE.DoubleSide }), root);
  }
  void surf;
}

function rcSupports(root, tr) {
  const def = tr.def;
  const kind = def.support ?? "none";
  const gy = def.groundY ?? 0;
  const surf = RC_SURFACES[def.surface] ?? RC_SURFACES.asphalt;
  const edge = tr.half + (def.barrier === "berm" ? 3.2 : 0.8);
  if (kind === "pillars" || kind === "deck") {
    // Deck fascia and soffit.
    const deck = new RcMesh();
    for (let i = 0; i < tr.n; i++) {
      const s0 = i * tr.ds, s1 = (i + 1) * tr.ds;
      for (const sg of [1, -1]) {
        const A = rcP(tr, s0, sg * edge, 0), B = rcP(tr, s1, sg * edge, 0), C = rcP(tr, s1, sg * edge, -1.4), D = rcP(tr, s0, sg * edge, -1.4);
        if (sg > 0) deck.quad(A, B, C, D); else deck.quad(D, C, B, A);
      }
      deck.quad(rcP(tr, s0, -edge, -1.4), rcP(tr, s0, edge, -1.4), rcP(tr, s1, edge, -1.4), rcP(tr, s1, -edge, -1.4));
    }
    deck.build(mat(0x8f8d86, { finish: "concrete" }), root);
    // Pillars, never standing on a lower stretch of the same road, and none in a suspension span.
    const span = (def.scenery ?? []).find((sc) => sc.kind === "suspension");
    const sp0 = span ? tr.uToS(span.from) : -1, sp1 = span ? tr.uToS(span.to) : -1;
    const pil = new RcMesh();
    for (let s = 6; s < tr.L; s += 30) {
      if (span && s > sp0 && s < sp1) continue;
      const q = rcPointAt(tr, s, 0);
      if (q.y - gy < 3) continue;
      let blocked = false;
      for (let k = 0; k < tr.n; k += 2) {
        const along = Math.abs(k * tr.ds - s);
        if (Math.min(along, tr.L - along) < 40) continue;
        if (tr.y[k] < q.y - 2 && Math.hypot(tr.x[k] - q.x, tr.z[k] - q.z) < tr.half + 4) { blocked = true; break; }
      }
      if (blocked) continue;
      pil.box(q.x, gy, q.z, 2.6, q.y - gy - 1.4, 2.6, q.head, [1 / 4, 1 / 4]);
      pil.box(q.x, q.y - 3.0, q.z, tr.width * 0.75, 1.6, 2.8, q.head, [1 / 4, 1 / 4], { bottom: true });
    }
    pil.build(mat(0x9d9a92, { finish: "concrete" }), root);
  } else if (kind === "skirt") {
    // Embankment sides down to the ground, sloping out.
    const sk = new RcMesh();
    for (let i = 0; i < tr.n; i++) {
      const s0 = i * tr.ds, s1 = (i + 1) * tr.ds;
      for (const sg of [1, -1]) {
        const q0 = rcPointAt(tr, s0, sg * edge), q1 = rcPointAt(tr, s1, sg * edge);
        const h0 = Math.max(0, q0.y - gy), h1 = Math.max(0, q1.y - gy);
        if (h0 < 0.05 && h1 < 0.05) continue;
        const f0 = rcFrame(tr, s0), f1 = rcFrame(tr, s1);
        const out0 = h0 * 0.9, out1 = h1 * 0.9;
        const A = [q0.x, q0.y, q0.z], B = [q1.x, q1.y, q1.z];
        const C = [q1.x + f1.lx * sg * out1, gy, q1.z + f1.lz * sg * out1], D = [q0.x + f0.lx * sg * out0, gy, q0.z + f0.lz * sg * out0];
        const v0 = 0, v1 = Math.hypot(h0, out0) / 6;
        const u0 = s0 / 6, u1 = s1 / 6;
        if (sg > 0) sk.quad(A, B, C, D, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
        else sk.quad(A, D, C, B, [[u0, v0], [u0, v1], [u1, v1], [u1, v0]]);
      }
    }
    sk.build(mat(surf.side, { finish: def.surface === "dirt" ? "concrete" : "concrete", rough: 0.95 }), root);
  }
}

function rcGround(root, tr) {
  const def = tr.def, env = def.env ?? {};
  const gy = def.groundY ?? 0;
  const sea = (def.scenery ?? []).find((s) => s.kind === "sea" || s.kind === "water");
  const g = new RcMesh();
  const R = 1400;
  let x0 = -R, x1 = R;
  if (sea?.x0 !== undefined) { if (sea.x0 < 0) x0 = sea.x0; else x1 = sea.x0; }
  if (!(sea && sea.x0 === undefined)) {
    g.quad([x0, gy - 0.02, R], [x1, gy - 0.02, R], [x1, gy - 0.02, -R], [x0, gy - 0.02, -R], [[x0 / 12, R / 12], [x1 / 12, R / 12], [x1 / 12, -R / 12], [x0 / 12, -R / 12]]);
    const finish = def.surface === "dirt" ? "concrete" : "asphalt";
    g.build(mat(rcHexNum(env.ground ?? "#1a1d22"), { finish, rough: 0.95, tile: 1 }), root);
  }
  if (sea) {
    const w = new RcMesh();
    const wy = sea.y ?? gy - 1.2;
    let a = -R * 1.5, b = R * 1.5;
    if (sea.x0 !== undefined) { if (sea.x0 < 0) b = sea.x0; else a = sea.x0; }
    w.quad([a, wy, R * 1.5], [b, wy, R * 1.5], [b, wy, -R * 1.5], [a, wy, -R * 1.5], [[a / 20, 75], [b / 20, 75], [b / 20, -75], [a / 20, -75]]);
    const waterTex = rcCanvas(256, 256, (c, W, H) => {
      c.fillStyle = "#0c1a2a"; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(120,160,200,${0.05 + Math.random() * 0.12})`; c.fillRect(Math.random() * W, Math.random() * H, 10 + Math.random() * 30, 1.5); }
    });
    const wm = new THREE.MeshStandardMaterial({ color: def.id === "bay-fog-span" ? 0x5a6a74 : 0x1a3148, map: waterTex, roughness: 0.25, metalness: 0.35 });
    const mesh = w.build(wm, root);
    if (mesh) mesh.userData.water = waterTex;
    return { water: waterTex, waterY: wy };
  }
  return {};
}

function rcSky(root, def) {
  const env = def.env ?? {};
  const [top, hor] = (env.sky ?? ["#050814", "#1b2340"]).map((c) => new THREE.Color(c));
  const geo = new THREE.SphereGeometry(1900, 24, 12);
  const pos = geo.attributes?.position;
  if (pos?.count) {
    const cols = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 1900;
      const f = Math.max(0, Math.min(1, y * 1.6));
      cols[i * 3] = hor.r + (top.r - hor.r) * f; cols[i * 3 + 1] = hor.g + (top.g - hor.g) * f; cols[i * 3 + 2] = hor.b + (top.b - hor.b) * f;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  }
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide ?? 1, fog: false, depthWrite: false }));
  sky.renderOrder = -10;
  root.add(sky);
  let stars = null;
  if (env.stars) {
    const n = 700, arr = new Float32Array(n * 3);
    const rnd = rcSeeded(77);
    for (let i = 0; i < n; i++) {
      const th = rnd() * Math.PI * 2, ph = Math.acos(0.08 + rnd() * 0.92);
      arr[i * 3] = Math.sin(ph) * Math.cos(th) * 1700; arr[i * 3 + 1] = Math.cos(ph) * 1700; arr[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * 1700;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe8ff, size: 1.6, sizeAttenuation: false, fog: false }));
    root.add(stars);
  }
  return { sky, stars };
}

function rcMoon(root, def) {
  const m = def.env?.moon;
  if (!m) return null;
  const tex = rcCanvas(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w * 0.44, h * 0.42, 10, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "#fffdf2"); gr.addColorStop(0.8, "#e9e4d2"); gr.addColorStop(1, "#cfc8b2");
    g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(150,145,130,0.35)";
    for (const [x, y, r] of [[90, 100, 26], [160, 150, 18], [120, 175, 12], [170, 80, 14], [80, 160, 9]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  });
  const d = new THREE.Vector3(...m.dir).normalize();
  const dist = 1500;
  const moon = new THREE.Mesh(new THREE.CircleGeometry(m.size ?? 30, 40), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, depthWrite: false }));
  moon.position.set(d.x * dist, d.y * dist, d.z * dist);
  moon.lookAt(0, 0, 0);
  root.add(moon);
  const halo = new THREE.Mesh(new THREE.CircleGeometry((m.size ?? 30) * 3.2, 40), rcGlowMat(0x9fb4e8, 0.18, rcPoolTex()));
  halo.material.fog = false;
  halo.position.copy(moon.position).multiplyScalar(1.01);
  halo.lookAt(0, 0, 0);
  root.add(halo);
  // Moonlight on the water: a long, soft, additive streak toward the moon.
  const sea = (def.scenery ?? []).find((s) => s.kind === "sea");
  if (sea) {
    const glint = new THREE.Mesh(new THREE.PlaneGeometry(90, 1100), rcGlowMat(0xcfd9ff, 0.14, rcPoolTex()));
    glint.rotation.x = -Math.PI / 2;
    glint.rotation.z = Math.atan2(d.x, d.z) + Math.PI;
    glint.position.set(sea.x0 - 560, -1.0, 0);
    root.add(glint);
  }
  return moon;
}

function rcSkyline(root, tr, sc, mats) {
  const rnd = rcSeeded(sc.seed ?? 5);
  const [x0, z0, x1, z1] = sc.area;
  const meshes = [new RcMesh(), new RcMesh(), new RcMesh()];
  const beacons = new RcMesh();
  const sea = (tr.def.scenery ?? []).find((s) => s.kind === "sea");
  let placed = 0;
  for (let tries = 0; tries < sc.count * 12 && placed < sc.count; tries++) {
    const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0);
    const w = 14 + rnd() * 20, d = 14 + rnd() * 20;
    if (sea && x - w / 2 < sea.x0 + 20) continue;
    if (rcDistToTrack(tr, x, z) < (sc.avoid ?? 24) + Math.max(w, d) / 2 + tr.half) continue;
    const h = sc.height[0] + Math.pow(rnd(), 1.6) * (sc.height[1] - sc.height[0]);
    const which = placed % 3;
    const ry = (rnd() - 0.5) * 0.3;
    meshes[which].box(x, (tr.def.groundY ?? 0) - 0.5, z, w, h + 0.5, d, ry, [1 / 16, 1 / 32], { roofUV: [0.5, 0.995] });
    if (h > 70) beacons.box(x, h - 0.4, z, 1, 1.2, 1, 0, [1, 1]);
    placed += 1;
  }
  meshes.forEach((m, i) => m.build(mats.windows[i], root));
  beacons.build(new THREE.MeshBasicMaterial({ color: 0xff3a2a }), root);
}

function rcTunnel(root, tr, sc, mats) {
  const s0 = tr.uToS(sc.from), s1 = tr.uToS(sc.to);
  const inner = new RcMesh(), outer = new RcMesh(), strips = new RcMesh();
  const H = 7.5, R = tr.half + 0.8, O = tr.half + 4, TOP = 16;
  const walk = (fn) => { for (let s = s0; s < s1 - 0.01; s += tr.ds) fn(s, Math.min(s1, s + tr.ds)); };
  walk((a, b) => {
    // Inner walls and ceiling (facing in).
    inner.quad(rcP(tr, a, R, 0), rcP(tr, b, R, 0), rcP(tr, b, R, H), rcP(tr, a, R, H));
    inner.quad(rcP(tr, a, -R, 0), rcP(tr, a, -R, H), rcP(tr, b, -R, H), rcP(tr, b, -R, 0));
    inner.quad(rcP(tr, a, R, H), rcP(tr, b, R, H), rcP(tr, b, -R, H), rcP(tr, a, -R, H));
    // Lit strips along the ceiling.
    strips.quad(rcP(tr, a, 3.2, H - 0.05), rcP(tr, b, 3.2, H - 0.05), rcP(tr, b, 2.2, H - 0.05), rcP(tr, a, 2.2, H - 0.05));
    strips.quad(rcP(tr, a, -2.2, H - 0.05), rcP(tr, b, -2.2, H - 0.05), rcP(tr, b, -3.2, H - 0.05), rcP(tr, a, -3.2, H - 0.05));
    // Outer shell: a lit podium block the road runs through.
    const u0 = a / 16, u1 = b / 16, gy = (tr.def.groundY ?? 0) - 0.5;
    const oa = rcPointAt(tr, a, O), ob = rcPointAt(tr, b, O), oc = rcPointAt(tr, a, -O), od = rcPointAt(tr, b, -O);
    const top = Math.max(oa.y, ob.y) + TOP;
    outer.quad([oa.x, gy, oa.z], [oa.x, top, oa.z], [ob.x, top, ob.z], [ob.x, gy, ob.z], [[u0, 0], [u0, (top - gy) / 32], [u1, (top - gy) / 32], [u1, 0]]);
    outer.quad([oc.x, gy, oc.z], [od.x, gy, od.z], [od.x, top, od.z], [oc.x, top, oc.z], [[u0, 0], [u1, 0], [u1, (top - gy) / 32], [u0, (top - gy) / 32]]);
    outer.quad([oa.x, top, oa.z], [oc.x, top, oc.z], [od.x, top, od.z], [ob.x, top, ob.z], [[0.5, 0.995], [0.5, 0.995], [0.5, 0.995], [0.5, 0.995]]);
  });
  // Portal faces at both ends: frame around the opening.
  for (const [s, sg] of [[s0, -1], [s1, 1]]) {
    const q = rcPointAt(tr, s, 0), gy = (tr.def.groundY ?? 0) - 0.5, top = q.y + TOP;
    const P = (d, y) => { const p = rcPointAt(tr, s, d); return [p.x, y, p.z]; };
    const faces = [
      [P(O, gy), P(R, gy), P(R, top), P(O, top)],
      [P(-R, gy), P(-O, gy), P(-O, top), P(-R, top)],
      [P(R, q.y + H), P(-R, q.y + H), P(-R, top), P(R, top)],
      [P(R, gy), P(-R, gy), P(-R, q.y - 1.4), P(R, q.y - 1.4)],
    ];
    for (const [A, B, C, D] of faces) {
      if (sg > 0) outer.quad(A, D, C, B, [[0, 0], [0, 0.4], [0.3, 0.4], [0.3, 0]]);
      else outer.quad(A, B, C, D, [[0, 0], [0.3, 0], [0.3, 0.4], [0, 0.4]]);
    }
  }
  inner.build(mat(0xcfcbc0, { finish: "concrete", rough: 0.7 }), root);
  outer.build(mats.windows[1], root);
  strips.build(new THREE.MeshBasicMaterial({ color: 0xfff1cf }), root);
}

function rcTollPlaza(root, tr, sc, race) {
  const s = tr.uToS(sc.u);
  const q = rcPointAt(tr, s, 0);
  const g = group(root, q.x, q.y, q.z, q.head);
  const W = tr.width + 3;
  box(g, W, 0.8, 11, 0, 6.8, 0, 0xd9d6cc, { finish: "painted" });
  box(g, W, 0.35, 11.4, 0, 7.35, 0, 0x2d6fa8, { finish: "painted" });
  const booths = race.statics.filter((st) => st.kind === "booth");
  for (const b of booths) {
    const lx = b.d;
    box(g, b.w, 2.6, b.l, lx, 0, 0, 0xe9e5da, { finish: "painted" }).position.y = 1.3;
    box(g, b.w + 0.1, 0.9, b.l - 1, lx, 1.8, 0, 0x2a4a66, { rough: 0.15, metal: 0.4 });
    box(g, 0.5, 4.3, 0.5, lx, 4.5, 0, 0xbab7ae, { finish: "concrete" });
    box(g, b.w + 0.6, 0.3, b.l + 0.6, lx, 0.15, 0, 0xf2c230, { finish: "painted" });
  }
  // Lane lights over the gaps (green) and over the booths (red).
  const lanes = [];
  const ds = booths.map((b) => b.d).sort((a, b) => a - b);
  const gaps = [];
  let prev = -tr.half;
  for (const d of ds) { gaps.push((prev + d) / 2); prev = d; }
  gaps.push((prev + tr.half) / 2);
  for (const d of gaps) lanes.push(box(g, 1.1, 0.8, 0.1, d, 6.3, 5.6, 0x3fc26a, { emissive: 0x16d04a, ei: 1.6 }));
  for (const d of ds) lanes.push(box(g, 1.1, 0.8, 0.1, d, 6.3, 5.6, 0xd8322c, { emissive: 0xe01810, ei: 1.6 }));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.4), new THREE.MeshBasicMaterial({ map: rcTextTex("TOLL PLAZA  ·  KEEP TO THE GREEN", { bg: "#1d3a5c", px: 44, w: 768 }) }));
  sign.position.set(0, 7.9, 5.75); g.add(sign);
  mergeStatic(g, { local: true });
}

function rcGantry(root, tr, s, text, o = {}) {
  const q = rcPointAt(tr, s, 0);
  const g = group(root, q.x, q.y, q.z, q.head);
  const W = tr.width + 2.4;
  for (const sx of [1, -1]) box(g, 0.5, 7.2, 0.5, sx * W / 2, 3.6, 0, 0x8e969d, { finish: "galvanised", metal: 0.4 });
  box(g, W + 0.5, 0.6, 0.6, 0, 7.0, 0, 0x8e969d, { finish: "galvanised", metal: 0.4 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(W - 2, 16), 2.0), new THREE.MeshBasicMaterial({ map: rcTextTex(text, o), side: THREE.DoubleSide }));
  sign.position.set(0, 8.3, -0.35);
  sign.rotation.y = Math.PI;
  g.add(sign);
  const lamps = [];
  if (o.lights) {
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.42, 18), new THREE.MeshBasicMaterial({ color: 0x331010 }));
      m.position.set(-2.4 + i * 1.6, 6.15, -0.36); m.rotation.y = Math.PI; g.add(m);
      lamps.push(m);
    }
  }
  mergeStatic(g, { local: true });
  return lamps;
}

function rcLamps(root, tr, sc) {
  const poles = new RcMesh(), heads = new RcMesh(), pools = new RcMesh();
  const H = sc.height ?? 9;
  let side = 1;
  for (let s = 8; s < tr.L; s += sc.every ?? 34) {
    side = -side;
    const edge = tr.half + (tr.def.barrier === "berm" ? 3.6 : 1.3);
    const q = rcPointAt(tr, s, side * edge);
    const f = rcFrame(tr, s);
    poles.box(q.x, q.y, q.z, 0.28, H, 0.28, q.head, [1, 1]);
    const reach = 3.2;
    const hx = q.x - f.lx * side * reach, hz = q.z - f.lz * side * reach;
    const ax = (q.x + hx) / 2, az = (q.z + hz) / 2;
    poles.box(ax, q.y + H - 0.2, az, reach + 0.3, 0.18, 0.18, Math.atan2(f.lx, f.lz) + Math.PI / 2, [1, 1]);
    heads.box(hx, q.y + H - 0.45, hz, 0.9, 0.25, 0.5, q.head, [1, 1]);
    const p = rcPointAt(tr, s, side * (edge - reach));
    const r = 7.5;
    const P = (dx, dz) => [p.x + f.tx * dz + f.lx * dx, p.y + 0.06, p.z + f.tz * dz + f.lz * dx];
    pools.quad(P(r, -r), P(-r, -r), P(-r, r), P(r, r));
  }
  poles.build(mat(0x5d646b, { finish: "galvanised", metal: 0.4 }), root);
  heads.build(new THREE.MeshBasicMaterial({ color: new THREE.Color(sc.colour ?? "#ffc978") }), root);
  pools.build(rcGlowMat(new THREE.Color(sc.colour ?? "#ffc978"), 0.28, rcPoolTex()), root);
}

function rcMasts(root, tr, sc) {
  const poles = new RcMesh(), heads = new RcMesh(), pools = new RcMesh();
  const H = sc.height ?? 26;
  let side = 1;
  for (let s = 20; s < tr.L; s += sc.every ?? 70) {
    side = -side;
    const q = rcPointAt(tr, s, side * (tr.half + 3));
    poles.box(q.x, q.y, q.z, 0.8, H, 0.8, q.head, [1, 1]);
    heads.box(q.x, q.y + H, q.z, 3.2, 0.7, 3.2, q.head, [1, 1]);
    const p = rcPointAt(tr, s, side * (tr.half - 3));
    const r = 16;
    pools.quad([p.x + r, p.y + 0.06, p.z - r], [p.x - r, p.y + 0.06, p.z - r], [p.x - r, p.y + 0.06, p.z + r], [p.x + r, p.y + 0.06, p.z + r]);
  }
  poles.build(mat(0x6d747b, { finish: "galvanised", metal: 0.4 }), root);
  heads.build(new THREE.MeshBasicMaterial({ color: new THREE.Color(sc.colour ?? "#ffd29a") }), root);
  pools.build(rcGlowMat(new THREE.Color(sc.colour ?? "#ffd29a"), 0.22, rcPoolTex()), root);
}

function rcContainerTex() {
  const cols = ["#b8342a", "#2d6fa8", "#2a8a52", "#d8a12a", "#6b6f74", "#8a4a9a", "#d86a2a", "#e6e2d6"];
  return rcCanvas(128, 256, (g, w, h) => {
    const bh = h / cols.length;
    cols.forEach((c, i) => {
      g.fillStyle = c; g.fillRect(0, i * bh, w, bh);
      g.fillStyle = "rgba(0,0,0,0.22)";
      for (let x = 0; x < w; x += 6) g.fillRect(x, i * bh, 2, bh);
      g.fillStyle = "rgba(255,255,255,0.1)"; g.fillRect(0, i * bh, w, 2);
    });
  });
}

function rcContainers(root, tr, sc) {
  const rnd = rcSeeded(sc.seed ?? 3);
  const m = new RcMesh();
  const L = 12.2, W = 2.44, H = 2.6;
  for (const [x0, z0, x1, z1] of sc.rects) {
    const alongX = (x1 - x0) >= (z1 - z0);
    let row = 0;
    for (let a = (alongX ? z0 : x0) + 2; a < (alongX ? z1 : x1) - 2; a += W + 0.35) {
      if (row++ % 7 === 6) continue;        // an aisle for the straddle carriers
      for (let b = (alongX ? x0 : z0) + 7; b < (alongX ? x1 : z1) - 7; b += L + 1.2) {
        const x = alongX ? b : a, z = alongX ? a : b;
        if (rcDistToTrack(tr, x, z) < tr.half + (sc.avoid ?? 8)) continue;
        const tiers = 1 + Math.floor(rnd() * 4);
        for (let t = 0; t < tiers; t++) {
          const band = Math.floor(rnd() * 8);
          const v0 = 1 - (band + 1) / 8;
          m.box(x, t * H, z, alongX ? L : W, H - 0.04, alongX ? W : L, 0, [1 / 12.2, 1 / 8 / 2.6], { v0, roofUV: [0.5, v0 + 0.06] });
        }
      }
    }
  }
  m.build(new THREE.MeshStandardMaterial({ map: rcContainerTex(), roughness: 0.7, metalness: 0.2 }), root);
}

function rcQuayCrane(root, x, z, span) {
  const g = group(root, x, 0, z, 0);
  const C = 0xd8412f, W = 0xe8e6df;
  const [xa, xb] = span.map((v) => v - x);
  for (const lx of [xa, xb]) for (const sz of [8, -8]) box(g, 1.2, 38, 1.2, lx, 19, sz, C, { finish: "painted" });
  for (const lx of [xa, xb]) box(g, 1.4, 1.4, 17.2, lx, 38, 0, C, { finish: "painted" });
  for (const sz of [8, -8]) box(g, xb - xa + 1.2, 1.6, 1.4, (xa + xb) / 2, 38.6, sz, C, { finish: "painted" });
  box(g, 110, 2.2, 3.0, xa + 45, 44, 0, W, { finish: "painted" });       // boom over the water and back-reach
  box(g, 10, 5, 12, xa + 4, 41, 0, W, { finish: "painted" });           // machinery house
  box(g, 1.2, 22, 1.2, (xa + xb) / 2, 50, 4, C, { finish: "painted" });
  box(g, 1.2, 22, 1.2, (xa + xb) / 2, 50, -4, C, { finish: "painted" });
  box(g, 3.5, 3, 3.5, xb + 14, 41.5, 0, 0x2b3a55, { finish: "painted" }); // trolley
  box(g, 0.8, 0.5, 0.8, (xa + xb) / 2, 61.2, 0, 0xff3a2a, { emissive: 0xff2010, ei: 1.5 });
  mergeStatic(g, { local: true });
}

function rcShip(root, sc) {
  const m = new RcMesh();
  const x = sc.x, z = sc.z, L = sc.len ?? 200;
  m.box(x, -1.2, z, 32, 14, L, 0, [1 / 16, 1 / 16]);
  const hull = m.build(mat(0x2a1a1c, { finish: "painted" }), root);
  void hull;
  const c = new RcMesh();
  const rnd = rcSeeded(9);
  for (let bz = z - L / 2 + 14; bz < z + L / 2 - 40; bz += 13.4) {
    for (let bx = x - 13; bx <= x + 13; bx += 2.6) {
      const tiers = 2 + Math.floor(rnd() * 4);
      for (let t = 0; t < tiers; t++) {
        const band = Math.floor(rnd() * 8), v0 = 1 - (band + 1) / 8;
        c.box(bx, 12.8 + t * 2.6, bz, 2.44, 2.56, 12.2, 0, [1 / 12.2, 1 / 8 / 2.6], { v0, roofUV: [0.5, v0 + 0.06] });
      }
    }
  }
  c.build(new THREE.MeshStandardMaterial({ map: rcContainerTex(), roughness: 0.7, metalness: 0.2 }), root);
  const house = new RcMesh();
  house.box(x, 12.8, z + L / 2 - 24, 28, 22, 14, 0, [1 / 16, 1 / 32], { roofUV: [0.5, 0.995] });
  house.build(rcWindowMat(4, true), root);
}

function rcWindowMat(seed, warm) {
  const t = rcWindowTex(seed, warm);
  return new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.85, roughness: 0.55, metalness: 0.2 });
}

function rcSuspension(root, tr, sc) {
  const colour = rcHexNum(sc.colour ?? "#c0452b");
  const paint = mat(colour, { finish: "painted", rough: 0.55 });
  const deckY = sc.deckY ?? 22, H = sc.towerH ?? 118;
  const legX = tr.half * 2 + 5;          // outside both carriageways
  const t = new RcMesh();
  for (const tz of sc.towersZ) {
    for (const sx of [1, -1]) t.box(sx * legX, -2, tz, 4.2, deckY + H + 2, 5.5, 0, [1 / 6, 1 / 6]);
    for (const hy of [deckY + 30, deckY + 62, deckY + 94, deckY + H - 4]) t.box(0, hy, tz, legX * 2, 4, 3.4, 0, [1 / 6, 1 / 6]);
    t.box(0, deckY - 6, tz, legX * 2, 3, 4, 0, [1 / 6, 1 / 6]);
  }
  t.build(paint, root);
  // Main cables and suspenders.
  const zA = sc.towersZ[0], zB = sc.towersZ[1];
  const topY = deckY + H;
  const zAnch = Math.abs(zA) + 170;
  const cableY = (z) => {
    const az = Math.abs(z);
    if (az <= Math.abs(zB)) { const f = z / Math.abs(zB); return deckY + 5 + (topY - deckY - 5) * f * f; }
    const f = (az - Math.abs(zB)) / (zAnch - Math.abs(zB));
    return topY + (deckY + 3 - topY) * f * (2 - f) * 0.5 + (deckY + 3 - topY) * f * 0.5;
  };
  const cables = new RcMesh();
  for (const sx of [1, -1]) {
    const cx = sx * (legX - 0.6);
    for (let z = -zAnch; z < zAnch; z += 6) {
      const y0 = cableY(z), y1 = cableY(z + 6);
      cables.quad([cx - 0.5, y0, z], [cx + 0.5, y0, z], [cx + 0.5, y1, z + 6], [cx - 0.5, y1, z + 6]);
      cables.quad([cx + 0.5, y0 - 0.9, z], [cx - 0.5, y0 - 0.9, z], [cx - 0.5, y1 - 0.9, z + 6], [cx + 0.5, y1 - 0.9, z + 6]);
      cables.quad([cx + 0.5, y0, z], [cx + 0.5, y0 - 0.9, z], [cx + 0.5, y1 - 0.9, z + 6], [cx + 0.5, y1, z + 6]);
      cables.quad([cx - 0.5, y0 - 0.9, z], [cx - 0.5, y0, z], [cx - 0.5, y1, z + 6], [cx - 0.5, y1 - 0.9, z + 6]);
    }
    for (let z = -Math.abs(zB) - 150; z <= Math.abs(zB) + 150; z += 12) {
      if (Math.abs(Math.abs(z) - Math.abs(zB)) < 4) continue;
      const y = cableY(z);
      if (y - deckY < 2) continue;
      cables.box(cx, deckY, z, 0.18, y - deckY, 0.18, 0, [1, 1], { top: false });
    }
  }
  cables.build(mat(colour, { finish: "painted", rough: 0.55, side: 2 }), root);
  // A stiffening truss band under the span.
  const truss = new RcMesh();
  const s0 = tr.uToS(sc.from), s1 = tr.uToS(sc.to);
  void s0; void s1;
  truss.box(0, deckY - 8, 0, legX * 2 - 6, 6.6, 580, 0, [1 / 4, 1 / 4]);
  const trussTex = rcCanvas(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = "#b8452f"; g.lineWidth = 9;
    g.strokeRect(4, 4, w - 8, h - 8);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
  });
  truss.build(new THREE.MeshStandardMaterial({ map: trussTex, color: colour, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 }), root);
  // Aircraft warning lamps on the tower tops.
  const lamps = new RcMesh();
  for (const tz of sc.towersZ) for (const sx of [1, -1]) lamps.box(sx * legX, topY + 0.2, tz, 1, 1, 1, 0, [1, 1]);
  lamps.build(new THREE.MeshBasicMaterial({ color: 0xff3a2a }), root);
}

function rcArrowBoard(root, tr, sc) {
  const q = rcPointAt(tr, tr.uToS(sc.u), sc.d);
  const g = group(root, q.x, q.y, q.z, q.head);
  box(g, 2.0, 0.9, 3.2, 0, 0.5, 0, 0xf07a1c, { finish: "painted" });
  box(g, 0.2, 2.6, 0.2, 0, 1.3, -1, 0x2b3239, { finish: "painted" });
  const tex = rcCanvas(256, 128, (c, w, h) => {
    c.fillStyle = "#101214"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#ffc23a";
    for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(40 + i * 20, h / 2, 7, 0, 7); c.fill(); }
    for (const [x, y] of [[196, 30], [216, 46], [196, 98], [216, 82], [230, 64]]) { c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill(); }
  });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), new THREE.MeshBasicMaterial({ map: tex }));
  panel.position.set(0, 3.0, -0.88);
  panel.rotation.y = Math.PI;
  // The arrow points toward the open lane (left of travel).
  panel.scale.x = -1;
  g.add(panel);
  mergeStatic(g, { local: true });
  return panel;
}

function rcHills(root, sc) {
  const m = new RcMesh();
  for (const [x, z] of sc.at) {
    const r = 180, h = 90, seg = 10;
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const A = [x + Math.cos(a0) * r, -1, z + Math.sin(a0) * r], B = [x + Math.cos(a1) * r, -1, z + Math.sin(a1) * r];
      const T = [x, h, z];
      m.quad(A, T, T, B);
    }
  }
  m.build(new THREE.MeshStandardMaterial({ color: 0x3e4a44, roughness: 1, side: THREE.DoubleSide }), root);
}

function rcBenches(root, tr, sc) {
  const [cx, cz] = sc.centre, [rx, rz] = sc.radius;
  const levels = sc.levels ?? [0, 12, 24, 36];
  const walls = new RcMesh(), tops = new RcMesh();
  const seg = 48, gy = tr.def.groundY ?? 0;
  const rnd = rcSeeded(sc.seed ?? 4);
  const jit = Array.from({ length: seg }, () => 0.96 + rnd() * 0.08);
  for (let li = 0; li < levels.length; li++) {
    const k = 1 + li * 0.07, kn = 1 + (li + 1) * 0.07;
    const y0 = li === 0 ? gy : levels[li], y1 = levels[li + 1] ?? levels[li] + 12;
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const j0 = jit[i], j1 = jit[(i + 1) % seg];
      const P = (a, kk, j, y) => [cx + Math.cos(a) * rx * kk * j, y, cz + Math.sin(a) * rz * kk * j];
      walls.quad(P(a0, k, j0, y0), P(a0, k, j0, y1), P(a1, k, j1, y1), P(a1, k, j1, y0), [[i / 4, y0 / 12], [i / 4, y1 / 12], [(i + 1) / 4, y1 / 12], [(i + 1) / 4, y0 / 12]]);
      tops.quad(P(a0, k, j0, y1), P(a0, kn, j0, y1), P(a1, kn, j1, y1), P(a1, k, j1, y1), [[i / 4, 0], [i / 4, 1], [(i + 1) / 4, 1], [(i + 1) / 4, 0]]);
    }
  }
  const rock = rcCanvas(256, 256, (g, w, h) => {
    g.fillStyle = "#8a6c52"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${60 + Math.random() * 80},${45 + Math.random() * 50},${30 + Math.random() * 30},0.35)`; g.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 12, 2 + Math.random() * 5); }
    g.fillStyle = "rgba(40,28,18,0.35)"; for (let y = 0; y < h; y += 22) g.fillRect(0, y, w, 3);
  });
  walls.build(new THREE.MeshStandardMaterial({ map: rock, roughness: 1, side: THREE.DoubleSide }), root);
  tops.build(mat(0x7a5e44, { finish: "concrete", rough: 1, side: 2 }), root);
}

function rcStockpiles(root, sc) {
  const m = new RcMesh();
  for (const [x, z, h] of sc.at) {
    const r = h * 1.6, seg = 14;
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      m.quad([x + Math.cos(a0) * r, -1, z + Math.sin(a0) * r], [x, h - 1, z], [x, h - 1, z], [x + Math.cos(a1) * r, -1, z + Math.sin(a1) * r]);
    }
  }
  m.build(mat(0x9a8a78, { finish: "concrete", rough: 1, side: 2 }), root);
}

function rcCrusher(root, sc) {
  const g = group(root, sc.x, -1, sc.z, 0.4);
  box(g, 12, 10, 10, 0, 5, 0, 0x5d646b, { finish: "painted" });
  box(g, 8, 6, 8, 0, 13, 0, 0xf0b323, { finish: "painted" });
  const conv = box(g, 2.2, 1, 36, 0, 12, 20, 0x3b4046, { finish: "painted" });
  conv.rotation.x = 0.35;
  for (const z of [10, 22, 32]) box(g, 0.5, 10 - z * 0.25, 0.5, 0, (10 - z * 0.25) / 2, z, 0x3b4046, { finish: "painted" });
  mergeStatic(g, { local: true });
}

function rcLatticeMat(colour) {
  const tex = rcCanvas(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = "#ffffff"; g.lineWidth = 5;
    g.strokeRect(2, 2, w - 4, h - 4);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.stroke();
  });
  return new THREE.MeshStandardMaterial({ map: tex, color: colour, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 });
}

function rcTowerCranes(root, sc) {
  const lat = rcLatticeMat(0xf2c230);
  const m = new RcMesh(), solid = new RcMesh(), red = new RcMesh();
  for (const [x, z, H, ang] of sc.at) {
    m.box(x, 0, z, 2, H, 2, 0, [1 / 2, 1 / 2]);
    const c = Math.cos(ang), s = Math.sin(ang);
    const jl = 55, cj = 16;
    m.box(x + s * (jl / 2 - 2), H + 0.6, z + c * (jl / 2 - 2), 1.6, 1.8, jl, ang, [1 / 1.8, 1 / 1.8]);
    m.box(x - s * cj / 2, H + 0.6, z - c * cj / 2, 1.6, 1.4, cj, ang, [1 / 1.6, 1 / 1.6]);
    m.box(x, H + 2.4, z, 1.4, 7, 1.4, 0, [1 / 1.4, 1 / 1.4]);
    solid.box(x - s * (cj - 2), H - 1.8, z - c * (cj - 2), 3, 2.6, 4, ang, [1 / 3, 1 / 3]);   // counterweight
    solid.box(x + s * 2.2, H - 1.6, z + c * 2.2, 2.2, 2.2, 2.4, ang, [1 / 3, 1 / 3]);         // cab
    const hx = x + s * 34, hz = z + c * 34;
    solid.box(hx, H - 22, hz, 0.08, 22, 0.08, 0, [1, 1]);
    solid.box(hx, H - 25, hz, 1.6, 1.4, 7, ang + 0.6, [1 / 4, 1 / 4]);                         // the load, a bundle of steel
    red.box(x + s * (jl - 3), H + 1.6, z + c * (jl - 3), 0.6, 0.6, 0.6, 0, [1, 1]);
    red.box(x, H + 6, z, 0.6, 0.6, 0.6, 0, [1, 1]);
  }
  m.build(lat, root);
  solid.build(mat(0x5d646b, { finish: "painted" }), root);
  red.build(new THREE.MeshBasicMaterial({ color: 0xff3a2a }), root);
}

function rcFrames(root, tr, sc) {
  const conc = new RcMesh();
  for (const [x, z, w, d, floors] of sc.at) {
    const fh = 3.6;
    for (let f = 0; f <= floors; f++) conc.box(x, f * fh, z, w, 0.35, d, 0, [1 / 6, 1 / 6], { bottom: true });
    for (let cx = -w / 2 + 1; cx <= w / 2 - 1; cx += 7.5) for (let cz = -d / 2 + 1; cz <= d / 2 - 1; cz += 7.5) {
      conc.box(x + cx, 0, z + cz, 0.6, floors * fh, 0.6, 0, [1 / 4, 1 / 4]);
    }
  }
  conc.build(mat(0xa9a59b, { finish: "concrete" }), root);
  void tr;
}

function rcPour(root, tr, race, sc) {
  // The wet slab: a glossy patch over the slick zone, and the pump that placed it.
  const wet = new RcMesh();
  for (const z of race.slicks) {
    for (let s = z.s0; s < z.s1; s += tr.ds) {
      const b = Math.min(z.s1, s + tr.ds);
      wet.quad(rcP(tr, s, z.d + z.w / 2, 0.05), rcP(tr, s, z.d - z.w / 2, 0.05), rcP(tr, b, z.d - z.w / 2, 0.05), rcP(tr, b, z.d + z.w / 2, 0.05));
    }
  }
  wet.build(new THREE.MeshStandardMaterial({ color: 0x9b9a95, roughness: 0.08, metalness: 0.2, emissive: 0x202020 }), root);
  const q = rcPointAt(tr, tr.uToS(sc.u) + 6, tr.half + 7);
  concretePump(root, q.x, q.y, q.z, { ry: q.head + Math.PI / 2 });
}

// ------------------------------------------------------------ the world

/**
 * Build the world for a race into `root`. Returns the handle the app drives
 * each frame with update(race, dt, now).
 */
export function rcBuildWorld(root, race, opts = {}) {
  const tr = race.track, def = tr.def;
  const night = !!def.env?.stars;
  const mats = { windows: [rcWindowMat(1, true), rcWindowMat(2, false), rcWindowMat(3, true)] };
  const sky = rcSky(root, def);
  const ground = rcGround(root, tr);
  rcMoon(root, def);
  rcRoad(root, tr);
  rcBarriers(root, tr);
  rcSupports(root, tr);
  let startLamps = [], arrow = null;
  for (const sc of def.scenery ?? []) {
    if (sc.kind === "skyline") rcSkyline(root, tr, sc, mats);
    else if (sc.kind === "tunnel") rcTunnel(root, tr, sc, mats);
    else if (sc.kind === "tollPlaza") rcTollPlaza(root, tr, sc, race);
    else if (sc.kind === "lamps") rcLamps(root, tr, sc);
    else if (sc.kind === "masts") rcMasts(root, tr, sc);
    else if (sc.kind === "overheadSign") rcGantry(root, tr, tr.uToS(sc.u), sc.text);
    else if (sc.kind === "containers") rcContainers(root, tr, sc);
    else if (sc.kind === "quayCranes") for (const [x, z] of sc.at) rcQuayCrane(root, x, z, sc.span);
    else if (sc.kind === "ship") rcShip(root, sc);
    else if (sc.kind === "reeferRow") {
      for (let i = 0; i < sc.count; i++) {
        const f = sc.count > 1 ? i / (sc.count - 1) : 0;
        const x = sc.from[0] + (sc.to[0] - sc.from[0]) * f, z = sc.from[1] + (sc.to[1] - sc.from[1]) * f;
        trailer(root, x, 0, z, { kind: "reefer", ry: Math.PI, livery: { colour: 0xe8e6df, fleetName: "COLD CHAIN", unitNumber: `R${10 + i}` } });
        box(root, 0.5, 1.6, 0.5, x + 2, 0.8, z + 9.5, 0x3fc26a, { emissive: 0x16b04a, ei: 0.6 });
      }
    } else if (sc.kind === "suspension") rcSuspension(root, tr, sc);
    else if (sc.kind === "arrowBoard") arrow = rcArrowBoard(root, tr, sc);
    else if (sc.kind === "hills") rcHills(root, sc);
    else if (sc.kind === "benches") rcBenches(root, tr, sc);
    else if (sc.kind === "stockpiles") rcStockpiles(root, sc);
    else if (sc.kind === "crusher") rcCrusher(root, sc);
    else if (sc.kind === "towerCranes") rcTowerCranes(root, sc);
    else if (sc.kind === "frames") rcFrames(root, tr, sc);
    else if (sc.kind === "pour") rcPour(root, tr, race, sc);
    else if (sc.kind === "haulSigns") for (const u of sc.u) rcGantry(root, tr, tr.uToS(u), "HAUL TRUCK CROSSING · YIELD", { bg: "#c8871a", fg: "#101010", edge: "#101010", px: 44, w: 768 });
  }
  startLamps = rcGantry(root, tr, 0, def.name.toUpperCase(), { bg: "#141a24", fg: "#ffd23a", edge: "#ffd23a", lights: true, px: 50, w: 768 });

  // Boost pads: one mesh, animated chevrons.
  const padTex = rcCanvas(64, 128, (g, w, h) => {
    g.fillStyle = "#0a2a3a"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#39d4ff";
    for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(6, y + 28); g.lineTo(w / 2, y + 6); g.lineTo(w - 6, y + 28); g.lineTo(w - 18, y + 28); g.lineTo(w / 2, y + 16); g.lineTo(18, y + 28); g.closePath(); g.fill(); }
  });
  const pads = new RcMesh();
  for (const p of tr.boostPads) {
    const s0 = p.s - p.len / 2, s1 = p.s + p.len / 2;
    pads.quad(rcP(tr, s0, p.d + p.w / 2, 0.045), rcP(tr, s0, p.d - p.w / 2, 0.045), rcP(tr, s1, p.d - p.w / 2, 0.045), rcP(tr, s1, p.d + p.w / 2, 0.045), [[0, 0], [1, 0], [1, 2], [0, 2]]);
  }
  pads.build(new THREE.MeshBasicMaterial({ map: padTex, color: 0xffffff }), root);

  // Item crates: hazard-striped supply crates that spin and bob.
  const crateTex = rcCanvas(128, 128, (g, w, h) => {
    g.fillStyle = "#f2c230"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#15171a";
    for (let i = -4; i < 8; i++) { g.beginPath(); g.moveTo(i * 24, h); g.lineTo(i * 24 + 12, h); g.lineTo(i * 24 + 12 + h, 0); g.lineTo(i * 24 + h, 0); g.closePath(); g.fill(); }
    g.fillStyle = "#f4f6f8"; g.fillRect(24, 24, w - 48, h - 48);
    g.fillStyle = "#e8742a"; g.beginPath(); g.moveTo(w / 2, 34); g.lineTo(w / 2 + 22, h - 38); g.lineTo(w / 2 - 22, h - 38); g.closePath(); g.fill();
    g.fillStyle = "#f4f6f8"; g.fillRect(w / 2 - 14, 64, 28, 7);
  });
  const crateMat = new THREE.MeshStandardMaterial({ map: crateTex, emissive: 0xffffff, emissiveMap: crateTex, emissiveIntensity: 0.55, roughness: 0.5 });
  const crates = race.boxes.map((b) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), crateMat);
    m.position.set(b.x, b.y + 1.3, b.z);
    root.add(m);
    return m;
  });

  // Statics: booths are part of the plaza; cones, trench boxes and parked vehicles here.
  const coneTex = rcCanvas(32, 64, (g, w, h) => {
    g.fillStyle = "#f06a1c"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#f4f6f8"; g.fillRect(0, h * 0.3, w, h * 0.16); g.fillRect(0, h * 0.56, w, h * 0.1);
  });
  const coneMat = new THREE.MeshStandardMaterial({ map: coneTex, roughness: 0.6, emissive: 0x401800, emissiveIntensity: 0.4 });
  const coneGeo = new THREE.CylinderGeometry(0.06, 0.34, 0.9, 12);
  const staticMeshes = race.statics.map((s) => {
    if (s.kind === "cone") {
      const m = new THREE.Mesh(coneGeo, coneMat);
      m.position.set(s.x, s.y + 0.45, s.z);
      root.add(m);
      return m;
    }
    if (s.kind === "trench") {
      const g = group(root, s.x, s.y, s.z, s.h);
      box(g, s.w, 1.2, s.l - 0.2, 0, 0.6, 0, 0x6d747b, { finish: "galvanised", metal: 0.4 });
      box(g, s.w + 0.1, 0.25, 0.25, 0, 1.3, s.l / 2 - 0.3, 0x3b4046, { finish: "painted" });
      box(g, 0.12, 0.3, s.l - 0.4, s.d > 0 ? -s.w / 2 : s.w / 2, 1.65, 0, 0xf07a1c, { emissive: 0x401800, ei: 0.5 });
      mergeStatic(g, { local: true });
      return null;
    }
    if (s.kind === "parked") {
      const w = rcBuildVehicle(root, s.vehicle, 1, { colour: 0xe8e8e2, fleetName: "BRIDGE MAINT", unitNumber: "W-3" });
      w.position.set(s.x, s.y, s.z); w.rotation.y = s.h;
      // Two of the crew, in the closure, behind the truck.
      const f = rcFrame(tr, s.s - 9);
      for (const off of [-0.8, 0.9]) {
        const q = rcPointAt(tr, s.s - 8 + off * 3, s.d + off);
        const p = standingPerson(root, q.x, q.z, { ry: f.head + Math.PI + off, hat: 0xf2f2f2 });
        p.root.position.y = q.y;
      }
      return null;
    }
    return null;
  });

  // Traffic, crossings, racers.
  const trafficModels = race.traffic.map((t, i) => {
    const colour = t.kind === "sedan" || t.kind === "pickup" ? RC_CIVILIAN[i % RC_CIVILIAN.length] : t.kind === "yardHustler" ? 0xf0a31c : t.kind === "dumpTruck" ? 0xf0b323 : 0xe8e6df;
    return rcBuildVehicle(root, t.kind, 1, { colour, fleetName: t.kind === "tractorTrailer" ? "HIGHWAY FREIGHT" : t.kind === "yardHustler" ? "YARD" : "CITY", unitNumber: String(100 + i) });
  });
  const crossingModels = race.crossings.map((c) => (c.kind === "haulTruck" ? rcHaulTruck(root) : rcStraddleCarrier(root)));
  const racerModels = race.racers.map((r) => rcRacerModel(root, r, night));

  // Dropped item pools.
  const dropCone = new THREE.CylinderGeometry(0.08, 0.42, 1.0, 12);
  const paintTex = rcCanvas(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(245,245,238,0.95)";
    g.beginPath();
    for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2, r = 44 + Math.sin(i * 2.3) * 12; g.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); }
    g.fill();
    g.fillStyle = "rgba(242,194,48,0.95)"; g.fillRect(14, h / 2 - 5, w - 28, 10);
  });
  const paintMat = new THREE.MeshStandardMaterial({ map: paintTex, transparent: true, roughness: 0.05, metalness: 0.1, depthWrite: false });
  const pool = { cone: [], paint: [] };
  const dropMesh = (kind) => {
    const list = pool[kind];
    const m = kind === "paint" ? new THREE.Mesh(new THREE.CircleGeometry(2.7, 24), paintMat) : new THREE.Mesh(dropCone, coneMat);
    if (kind === "paint") m.rotation.x = -Math.PI / 2;
    m.visible = false;
    root.add(m);
    list.push(m);
    return m;
  };
  for (let i = 0; i < 12; i++) dropMesh("cone");
  for (let i = 0; i < 4; i++) dropMesh("paint");
  // The tow strap.
  const strapMat = new THREE.MeshBasicMaterial({ color: 0xffb020 });
  const straps = race.racers.map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 1), strapMat); m.visible = false; root.add(m); return m; });

  // Dust behind racers on dirt.
  let dust = null;
  if (def.env?.dust) {
    const n = 360, arr = new Float32Array(n * 3).fill(-999);
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    dust = { points: new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xc9a27a, size: 2.6, transparent: true, opacity: 0.35, depthWrite: false })), arr, life: new Float32Array(n), vel: new Float32Array(n * 3), next: 0, n };
    dust.points.frustumCulled = false;
    root.add(dust.points);
  }

  const handle = {
    racerModels, trafficModels, crossingModels, crates, staticMeshes, startLamps, sky, ground, dust, arrow,
    ghost: null,
    update(race, dt, now) {
      const blink = Math.floor(now * 2.5) % 2 === 0;
      race.racers.forEach((r, i) => {
        const m = racerModels[i];
        m.position.set(r.x, r.y + (r.hopT > 0 ? Math.sin((r.hopT / 0.2) * Math.PI) * 0.35 : 0), r.z);
        m.rotation.set(-(r.pitch ?? 0), r.h + (r.drifting ? r.driftDir * 0.28 : 0), r.roll ?? 0, "YXZ");
        const fx = m.userData.fx;
        fx.shield.visible = r.shieldT > 0;
        fx.flare.visible = r.boostT > 0;
        if (fx.flare.visible) fx.flare.scale.set(1, 0.7 + Math.random() * 0.6, 1);
        fx.sigL.visible = !!r.signal && r.signal.dir > 0 && blink;
        fx.sigR.visible = !!r.signal && r.signal.dir < 0 && blink;
        const wheels = m.userData.parts.wheels;
        if (Array.isArray(wheels)) for (const w of wheels) if (w?.rotation) w.rotation.x += (r.v * dt) / 0.45;
        const strap = straps[i];
        const tgt = r.towT > 0 && r.towTarget != null ? race.racers[r.towTarget] : null;
        strap.visible = !!tgt;
        if (tgt) {
          const dx = tgt.x - r.x, dy = tgt.y - r.y, dz = tgt.z - r.z, len = Math.hypot(dx, dy, dz);
          strap.position.set((r.x + tgt.x) / 2, (r.y + tgt.y) / 2 + 0.8, (r.z + tgt.z) / 2);
          strap.scale.set(1, 1, len);
          strap.lookAt(tgt.x, tgt.y + 0.8, tgt.z);
        }
      });
      race.traffic.forEach((t, i) => { const m = trafficModels[i]; m.position.set(t.x, t.y, t.z); m.rotation.y = t.h; });
      race.crossings.forEach((c, i) => {
        const m = crossingModels[i]; m.position.set(c.x, c.y, c.z); m.rotation.y = c.h;
        if (m.userData.beacon) m.userData.beacon.visible = !c.warn || blink;
      });
      race.boxes.forEach((b, i) => {
        const m = crates[i];
        m.visible = b.t <= 0;
        m.rotation.y = now * 1.6 + i; m.rotation.x = 0.4;
        m.position.y = b.y + 1.3 + Math.sin(now * 3 + i) * 0.18;
      });
      race.statics.forEach((s, i) => { const m = staticMeshes[i]; if (m) m.visible = !(s.down > 0); });
      const used = { cone: 0, paint: 0 };
      for (const h of race.drops) {
        const kind = h.kind === "paint" ? "paint" : "cone";
        const list = pool[kind];
        const m = list[used[kind]] ?? dropMesh(kind);
        used[kind] += 1;
        m.visible = true;
        m.position.set(h.x, h.y + (kind === "paint" ? 0.06 : 0.5), h.z);
      }
      for (const kind of ["cone", "paint"]) for (let k = used[kind]; k < pool[kind].length; k++) pool[kind][k].visible = false;
      padTex.offset && (padTex.offset.y = -(now * 1.8) % 1);
      if (ground.water?.offset) { ground.water.offset.x = (now * 0.01) % 1; ground.water.offset.y = (now * 0.004) % 1; }
      // Start lights: four reds count down, then all green.
      if (startLamps.length) {
        const c = race.count;
        startLamps.forEach((l, k) => {
          let col = 0x331010;
          if (race.phase === "countdown") col = c < 3.5 - k * 0.0 && (3.5 - c) >= k * 0.9 ? 0xff2a1a : 0x331010;
          else col = race.t < 4 ? 0x2aff5a : 0x103318;
          l.material.color.setHex?.(col);
        });
      }
      if (arrow) arrow.visible = blink;
      if (dust) {
        const { arr, life, vel, n } = dust;
        for (const r of race.racers) {
          if (Math.abs(r.v) < 8 || Math.random() > 0.55) continue;
          const k = dust.next; dust.next = (dust.next + 1) % n;
          const back = r.p.l / 2 + 0.5;
          arr[k * 3] = r.x - Math.sin(r.h) * back + (Math.random() - 0.5) * 1.5;
          arr[k * 3 + 1] = r.y + 0.6;
          arr[k * 3 + 2] = r.z - Math.cos(r.h) * back + (Math.random() - 0.5) * 1.5;
          vel[k * 3] = (Math.random() - 0.5) * 2; vel[k * 3 + 1] = 1.2 + Math.random(); vel[k * 3 + 2] = (Math.random() - 0.5) * 2;
          life[k] = 1.6;
        }
        for (let k = 0; k < n; k++) {
          if (life[k] <= 0) continue;
          life[k] -= dt;
          if (life[k] <= 0) { arr[k * 3 + 1] = -999; continue; }
          arr[k * 3] += vel[k * 3] * dt; arr[k * 3 + 1] += vel[k * 3 + 1] * dt; arr[k * 3 + 2] += vel[k * 3 + 2] * dt;
        }
        const pa = dust.points.geometry.attributes?.position;
        if (pa) pa.needsUpdate = true;
      }
      if (handle.ghost && handle.ghostPose) {
        const g = handle.ghostPose;
        handle.ghost.visible = true;
        handle.ghost.position.set(g.x, g.y, g.z);
        handle.ghost.rotation.set(0, g.h, 0);
      } else if (handle.ghost) handle.ghost.visible = false;
    },
    setGhost(vehicleId) {
      if (handle.ghost) root.remove(handle.ghost);
      handle.ghost = vehicleId ? rcGhostModel(root, vehicleId) : null;
      if (handle.ghost) handle.ghost.visible = false;
    },
    meshCount() {
      let n = 0;
      root.traverse((o) => { if (o.isMesh && o.visible !== false) n += 1; });
      return n;
    },
  };
  void opts;
  return handle;
}

/** Lights and fog for a track: returned so the app can apply them to its scene. */
export function rcEnvironment(root, def) {
  const env = def.env ?? {};
  const [hs, hg, hi] = env.hemi ?? ["#7f93c8", "#141824", 0.7];
  const hemi = new THREE.HemisphereLight(new THREE.Color(hs), new THREE.Color(hg), hi);
  root.add(hemi);
  const sun = new THREE.DirectionalLight(new THREE.Color(env.sun?.colour ?? "#ffffff"), env.sun?.intensity ?? 0.7);
  const d = env.sun?.dir ?? [0.5, 0.6, 0.3];
  sun.position.set(d[0] * 500, d[1] * 500, d[2] * 500);
  root.add(sun);
  return {
    fog: env.fog ? { colour: new THREE.Color(env.fog[0]), near: env.fog[1], far: env.fog[2] } : null,
    background: new THREE.Color((env.sky ?? ["#050814", "#1b2340"])[1]),
    exposure: env.exposure ?? 1,
  };
}
