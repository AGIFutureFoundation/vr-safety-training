import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, lathe, group, mat, gradientFill, noiseTexture, grimeOverlay } from "./kit.js";
import {
  FL, flHex, flCss, flShade, flPaint, flCanvasMat, flPanel, flRod, flStrut, flSide,
  flRig, flDone, flLivery, flLiveryMat, flDoorMat, flTreadMat,
} from "./fleet.js";

// Shared site-dressing kit — the clutter that makes a district read as a real
// jobsite or a real street rather than an empty horizon: barricades, a light
// mast, a portable toilet, a site office, a dumpster, scaffold, stacked
// pallets, a cable spool, a hydrant, bollards, a bench, a street tree in
// three sizes, a shrub bed, a chain-link fence panel with a gate, a 20 ft
// shipping container, a fuel tank, a generator on a skid, a mobile crane's
// counterweight stack, and a picnic table.
//
// Same contract as shared/fleet.js: `(parent, x, y, z, opts)`, metres, real
// proportions, footprint centred on the origin in X and Z, y = 0 the ground,
// a baked static shell plus named parts in `userData.parts` for anything
// that swings or lifts (a toilet door, a dumpster lid, a container door, a
// gate leaf). Every builder costs at most 14 authored meshes (before
// mergeStatic), and `PROPS_BUDGET` below declares each one's mesh count,
// footprint and parts; `tools/check_props.mjs` holds every builder to it.
// These dress DISTRICTS (the horizon and edges around a station), never a
// station's own working area — see js/districts.js's `dressing` and
// js/stage.js, which places them after a district builds itself.

/** A prop's paint colour: opts.colour / opts.color, or the class default. */
function prColour(opts, fallback) { return flHex(opts.colour ?? opts.color ?? fallback); }

function prRig(parent, x, y, z, opts, kind, offset = null) {
  return flRig(parent, x, y, z, opts, kind, offset);
}

// ------------------------------------------------------------- barricades

/**
 * Concrete Jersey barrier, F-shape profile, reflective tape baked into the
 * one panel texture. 0.61 m base × 0.81 m tall × 3.05 m (10 ft) run.
 */
export function jerseyBarrier(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0xa9ada4);
  const rig = prRig(parent, x, y, z, opts, "jerseyBarrier");
  const S = rig.shell;
  const face = flCanvasMat(`jersey|${colour}`, 256, 128, (g, w, h) => {
    gradientFill(g, w, h, [[0, flCss(flShade(colour, 1.08))], [1, flCss(flShade(colour, 0.82))]]);
    noiseTexture(g, w, h, { density: 1400, alpha: 0.12 });
    g.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 10; i++) g.fillRect(i * w / 10 + 4, h * 0.32, w / 20, h * 0.2);
    grimeOverlay(g, w, h, { blotches: 3, streaks: 4, alpha: 0.12 });
  }, { rough: 0.85, metal: 0.05 });
  // Profile in [back(-Z), y]: wide base, F-shape shoulder, narrow top rail.
  flSide(S, [[-1.525, 0], [-1.525, 0.1], [-0.3, 0.1], [-0.3, 0.46], [-0.075, 0.46], [-0.075, 0.81],
    [0.075, 0.81], [0.075, 0.46], [0.3, 0.46], [0.3, 0.1], [1.525, 0.1], [1.525, 0]],
  0.61, 0, 0, 0, colour, { material: face, bevel: 0.015 });
  return flDone(rig, { footprint: PROPS_BUDGET.jerseyBarrier.footprint });
}

/** Plastic water/sand-filled lane barrier, 1.83 m modular section. */
export function waterBarrier(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0xe4622a);
  const rig = prRig(parent, x, y, z, opts, "waterBarrier");
  const S = rig.shell;
  const face = flCanvasMat(`waterbar|${colour}`, 256, 128, (g, w, h) => {
    g.fillStyle = flCss(colour); g.fillRect(0, 0, w, h);
    g.fillStyle = "#f4f4f0";
    for (let i = 0; i < 3; i++) g.fillRect(0, h * (0.2 + i * 0.28), w, h * 0.1);
    noiseTexture(g, w, h, { density: 900, alpha: 0.1 });
  }, { rough: 0.5, metal: 0.15 });
  flSide(S, [[-0.9, 0], [-0.9, 0.05], [-0.25, 0.62], [-0.25, 0.78], [0.25, 0.78], [0.25, 0.62], [0.9, 0.05], [0.9, 0]],
    0.5, 0, 0, 0, colour, { material: face, bevel: 0.02 });
  const cap = rig.part("cap", 0, 0.79, 0);
  cyl(cap, 0.07, 0.07, 0.04, 0, 0, 0, 0x2b2f33, { rough: 0.6, metal: 0.3, seg: 10 });
  return flDone(rig, { footprint: PROPS_BUDGET.waterBarrier.footprint });
}

/** A cone: taper, reflective band, square base. */
function trafficCone(parent, x, z) {
  const c = group(parent, x, 0, z);
  cyl(c, 0.03, 0.18, 0.71, 0, 0.355, 0, 0xe4622a, { rough: 0.75, seg: 12 });
  cyl(c, 0.05, 0.14, 0.09, 0, 0.44, 0, 0xf4f4f0, { rough: 0.5, seg: 12 });
  box(c, 0.36, 0.03, 0.36, 0, 0.015, 0, 0x22262b, { rough: 0.85 });
  return c;
}
/** A cluster of traffic cones (default 3, triangular). */
export function coneCluster(parent, x, y, z, opts = {}) {
  const rig = prRig(parent, x, y, z, opts, "coneCluster");
  const S = rig.shell;
  const n = opts.count ?? 3;
  const pts = n >= 3 ? [[-0.32, -0.19], [0.32, -0.19], [0, 0.29]] : n === 2 ? [[-0.32, 0], [0.32, 0]] : [[0, 0]];
  for (const [cx, cz] of pts.slice(0, n)) trafficCone(S, cx, cz);
  return flDone(rig, { footprint: PROPS_BUDGET.coneCluster.footprint });
}

// --------------------------------------------------------------- lighting

/**
 * Fixed site light mast: pole, crossbar, four heads. `opts.lit` (0..~2) sets
 * the heads' emissive intensity — a district passes its own night/dusk/day
 * multiplier so the mast reads as switched off by day. Parts: lamps.
 */
export function lightMast(parent, x, y, z, opts = {}) {
  const rig = prRig(parent, x, y, z, opts, "lightMast");
  const S = rig.shell;
  box(S, 0.5, 0.06, 0.5, 0, 0.03, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
  cyl(S, 0.09, 0.13, 8.9, 0, 4.5, 0, 0xc9d0d6, { rough: 0.4, metal: 0.5, finish: "galvanised", seg: 12 });
  box(S, 1.3, 0.09, 0.09, 0, 8.85, 0, 0xc9d0d6, { rough: 0.4, metal: 0.5, finish: "galvanised" });
  const lampMat = mat(0xfff2cc, { emissive: 0xfff2cc, ei: Math.max(0.06, opts.lit ?? 1.4), rough: 0.35 });
  const lamps = [];
  for (const [lx, lz] of [[-0.5, -0.1], [-0.5, 0.1], [0.5, -0.1], [0.5, 0.1]]) {
    const l = rig.part(`lamp${lamps.length}`, lx, 8.7, lz);
    box(l, 0.2, 0.06, 0.16, 0, 0, 0, ...FL.frame);
    const face = box(l, 0.16, 0.02, 0.12, 0, -0.045, 0, 0, {});
    face.material = lampMat;
    lamps.push(l);
  }
  rig.set("lamps", lamps);
  return flDone(rig, { footprint: PROPS_BUDGET.lightMast.footprint });
}

// -------------------------------------------------------------- amenities

/** Portable toilet: single-unit outhouse, hinged door. Parts: door. */
export function portableToilet(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0x2e6b57);
  const rig = prRig(parent, x, y, z, opts, "portableToilet");
  const S = rig.shell;
  const face = flCanvasMat(`potty|${colour}`, 128, 256, (g, w, h) => {
    gradientFill(g, w, h, [[0, flCss(flShade(colour, 1.1))], [1, flCss(flShade(colour, 0.85))]]);
    noiseTexture(g, w, h, { density: 600, alpha: 0.06 });
    g.fillStyle = "rgba(255,255,255,0.85)"; g.fillRect(w * 0.18, h * 0.06, w * 0.64, h * 0.05);
  }, { rough: 0.55, metal: 0.1 });
  box(S, 1.22, 2.1, 1.22, 0, 1.05, 0, colour, { material: face });
  box(S, 1.26, 0.08, 1.26, 0, 2.14, 0, 0xdedfd9, { rough: 0.5 });
  const vent = rig.part("vent", 0.5, 2.24, -0.3);
  cyl(vent, 0.04, 0.04, 0.16, 0, 0, 0, 0xdedfd9, { rough: 0.5, seg: 8 });
  const door = rig.part("door", 0, 1.0, 0.611);
  flPanel(door, 0.7, 1.95, 0, 0, 0, flDoorMat(flLivery(opts.livery, { colour }), "L", { window: 0, marks: "none" }), "+z");
  door.userData.openAngle = -1.2;
  return flDone(rig, { footprint: PROPS_BUDGET.portableToilet.footprint });
}

/** Portable site office / job trailer, 20 ft. Parts: door. */
export function siteOffice(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xe6e6e0, fleetName: "SITE OFFICE", unitNumber: "1" });
  const rig = prRig(parent, x, y, z, opts, "siteOffice");
  const S = rig.shell;
  box(S, 2.44, 2.9, 6.1, 0, 1.45, 0, lv.colour, { rough: 0.5, finish: "painted" });
  flPanel(S, 5.6, 1.4, 1.226, 1.65, 0, flLiveryMat(lv, "office", { titleScale: 0.22, titleY: 0.5, stripeY: 0.86, base: lv.colour, pw: 1024, ph: 256 }), "+x");
  const steps = rig.part("steps", 0, 0, 3.16);
  box(steps, 0.85, 0.2, 0.28, 0, 0.1, 0.14, 0x8b929a, { rough: 0.6, metal: 0.3 });
  box(steps, 0.85, 0.4, 0.28, 0, 0.2, -0.14, 0x8b929a, { rough: 0.6, metal: 0.3 });
  const hvac = rig.part("hvac", -0.75, 2.95, 0);
  box(hvac, 0.7, 0.3, 0.6, 0, 0, 0, 0xbfc3c7, { rough: 0.5, metal: 0.4 });
  const door = rig.part("door", 0, 1.05, 3.05);
  box(door, 0.9, 2.05, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
  door.userData.openAngle = -1.2;
  return flDone(rig, { footprint: PROPS_BUDGET.siteOffice.footprint });
}

/** Front-load dumpster, two hinged lids. Parts: lidL, lidR. */
export function dumpster(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0x2e6b3a);
  const rig = prRig(parent, x, y, z, opts, "dumpster");
  const S = rig.shell;
  box(S, 1.37, 1.22, 1.83, 0, 0.61, 0, colour, { rough: 0.6, finish: "painted" });
  for (const [sx, sz] of [[-0.6, -0.75], [0.6, -0.75], [-0.6, 0.75], [0.6, 0.75]]) cyl(S, 0.06, 0.06, 0.14, sx, 0.07, sz, 0x22262b, { rough: 0.7, seg: 8 });
  const lidL = rig.part("lidL", -0.02, 1.24, 0);
  box(lidL, 0.66, 0.04, 1.83, 0.34, 0, 0, colour, { rough: 0.6, finish: "painted" });
  lidL.userData.openAngle = 1.5;
  const lidR = rig.part("lidR", 0.02, 1.24, 0);
  box(lidR, 0.66, 0.04, 1.83, -0.34, 0, 0, colour, { rough: 0.6, finish: "painted" });
  lidR.userData.openAngle = -1.5;
  return flDone(rig, { footprint: PROPS_BUDGET.dumpster.footprint });
}

// -------------------------------------------------------------- structures

/** A two-lift scaffold tower with a planked platform and guardrail. */
export function scaffoldTower(parent, x, y, z, opts = {}) {
  const rig = prRig(parent, x, y, z, opts, "scaffoldTower");
  const S = rig.shell;
  const steel = [0xc9d0d6, { rough: 0.4, metal: 0.5, finish: "galvanised" }];
  for (const [sx, sz] of [[-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]]) flRod(S, 0.025, 4.0, sx, 2.0, sz, "y", ...steel);
  for (const [sz] of [[-0.65], [0.65]]) box(S, 1.3, 0.03, 0.03, 0, 3.95, sz, ...steel);
  for (const [sx] of [[-0.65], [0.65]]) box(S, 0.03, 0.03, 1.3, sx, 3.95, 0, ...steel);
  flStrut(S, [-0.65, 0.1, -0.65], [0.65, 3.9, -0.65], 0.018, ...steel);
  box(S, 1.2, 0.05, 1.2, 0, 2.0, 0, 0xc19a5b, { rough: 0.75, finish: "brushed" });
  box(S, 1.2, 0.12, 0.03, 0, 2.15, -0.6, 0xe4622a, { rough: 0.6 });
  box(S, 0.03, 0.12, 1.2, -0.6, 2.15, 0, 0xe4622a, { rough: 0.6 });
  return flDone(rig, { footprint: PROPS_BUDGET.scaffoldTower.footprint });
}

/** Wrapped pallet stack: three loaded pallets under shrink film. */
export function palletStack(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0xc9a86b);
  const rig = prRig(parent, x, y, z, opts, "palletStack");
  const S = rig.shell;
  for (let i = 0; i < 3; i++) {
    box(S, 1.0, 0.5, 1.2, 0, 0.25 + i * 0.5, 0, i % 2 ? 0xd9c58f : 0xcfa46a, { rough: 0.85, finish: "brushed" });
  }
  const wrap = box(S, 1.04, 1.7, 1.24, 0, 0.85, 0, 0xe8f0f2, { rough: 0.3, opacity: 0.28, cast: false });
  wrap.material.transparent = true;
  return flDone(rig, { footprint: PROPS_BUDGET.palletStack.footprint });
}

/** A wound cable/wire reel, standing on its rim, axis along X. */
export function cableSpool(parent, x, y, z, opts = {}) {
  const wood = opts.material !== "steel";
  const colour = prColour(opts, wood ? 0xa9835a : 0x8b929a);
  const rig = prRig(parent, x, y, z, opts, "cableSpool");
  const S = rig.shell;
  const face = flCanvasMat(`spool|${colour}|${wood}`, 128, 128, (g, w, h) => {
    gradientFill(g, w, h, [[0, flCss(flShade(colour, 1.08))], [1, flCss(flShade(colour, 0.82))]]);
    noiseTexture(g, w, h, { density: wood ? 500 : 1400, alpha: wood ? 0.16 : 0.08 });
  }, { rough: wood ? 0.85 : 0.4, metal: wood ? 0.05 : 0.4 });
  for (const sx of [-0.44, 0.44]) {
    const d = cyl(S, 0.75, 0.75, 0.06, sx, 0.75, 0, 0, { seg: 20 });
    d.material = face; d.rotation.z = Math.PI / 2;
  }
  const hub = cyl(S, 0.32, 0.32, 0.76, 0, 0.75, 0, colour, { rough: wood ? 0.9 : 0.45, metal: wood ? 0 : 0.3, seg: 16 });
  hub.rotation.z = Math.PI / 2;
  return flDone(rig, { footprint: PROPS_BUDGET.cableSpool.footprint });
}

/** A standard dry-barrel fire hydrant. */
export function fireHydrant(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0xc8201c);
  const rig = prRig(parent, x, y, z, opts, "fireHydrant");
  const S = rig.shell;
  cyl(S, 0.16, 0.19, 0.06, 0, 0.03, 0, 0x3a3f45, { rough: 0.6, metal: 0.3, seg: 12 });
  lathe(S, [[0.13, 0], [0.14, 0.05], [0.11, 0.08], [0.1, 0.5], [0.15, 0.55], [0.15, 0.62], [0.09, 0.66], [0.001, 0.7]], 0, 0.06, 0, colour, { rough: 0.5, metal: 0.15, seg: 16 });
  for (const ry of [0, Math.PI]) {
    const n = rig.part(`nozzle${ry}`, 0, 0.42, 0);
    n.rotation.y = ry + Math.PI / 2;
    cyl(n, 0.05, 0.05, 0.14, 0.16, 0, 0, colour, { rough: 0.5, metal: 0.15, seg: 10 }).rotation.z = Math.PI / 2;
  }
  ball(S, 0.06, 0, 0.72, 0, 0x2b2f33, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 });
  return flDone(rig, { footprint: PROPS_BUDGET.fireHydrant.footprint });
}

/** A row of steel bollards. `opts.count` (default 5), `opts.spacing` (1.5 m). */
export function bollardRow(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0xf0c02c);
  const n = opts.count ?? 5, gap = opts.spacing ?? 1.5;
  const rig = prRig(parent, x, y, z, opts, "bollardRow");
  const S = rig.shell;
  const start = -((n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) {
    const bx = start + i * gap;
    cyl(S, 0.075, 0.08, 1.0, bx, 0.5, 0, colour, { rough: 0.55, metal: 0.2, finish: "painted", seg: 12 });
    ball(S, 0.078, bx, 1.0, 0, colour, { rough: 0.4, metal: 0.3, seg: 10, seg2: 8 });
  }
  return flDone(rig, { footprint: [Math.max(0.16, (n - 1) * gap + 0.16), 1.08, 0.16] });
}

/** A slatted park bench. */
export function parkBench(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0x2b3138);
  const rig = prRig(parent, x, y, z, opts, "parkBench");
  const S = rig.shell;
  for (let i = 0; i < 3; i++) box(S, 1.8, 0.04, 0.11, 0, 0.44 + i * 0.001, -0.14 + i * 0.14, 0x8b6a45, { rough: 0.8, finish: "brushed" });
  for (let i = 0; i < 2; i++) { const b = box(S, 1.8, 0.04, 0.1, 0, 0.72 + i * 0.13, -0.2, 0x8b6a45, { rough: 0.8, finish: "brushed" }); b.rotation.x = -0.22; }
  for (const sx of [-1, 1]) box(S, 0.06, 0.45, 0.5, sx * 0.87, 0.225, -0.02, colour, { rough: 0.5, metal: 0.4 });
  return flDone(rig, { footprint: PROPS_BUDGET.parkBench.footprint });
}

// ------------------------------------------------------------ landscaping

const STREET_TREE_SIZE = {
  small: { trunkH: 2.6, trunkR: 0.09, canopyR: 1.2, canopyY: 3.0 },
  medium: { trunkH: 3.4, trunkR: 0.15, canopyR: 1.9, canopyY: 4.2 },
  large: { trunkH: 4.2, trunkR: 0.22, canopyR: 2.8, canopyY: 5.6 },
};
/** A street tree in a tree grate. `opts.size`: "small" | "medium" | "large". */
export function streetTree(parent, x, y, z, opts = {}) {
  const size = STREET_TREE_SIZE[opts.size] ? opts.size : "medium";
  const s = STREET_TREE_SIZE[size];
  const rig = prRig(parent, x, y, z, opts, `streetTree:${size}`);
  const S = rig.shell;
  box(S, 1.1, 0.05, 1.1, 0, 0.025, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
  cyl(S, s.trunkR, s.trunkR * 1.3, s.trunkH, 0, s.trunkH / 2, 0, 0x5b4530, { rough: 0.9, finish: "brushed", seg: 10 });
  ball(S, s.canopyR, 0, s.canopyY, 0, 0x3a6b3a, { rough: 0.95, seg: 10, seg2: 8 });
  ball(S, s.canopyR * 0.72, s.canopyR * 0.35, s.canopyY + s.canopyR * 0.5, s.canopyR * 0.2, 0x477a47, { rough: 0.95, seg: 8, seg2: 6 });
  torus(S, 0.5, 0.04, 0, 0.05, 0, 0x2b2318, { rough: 0.9, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
  return flDone(rig, { footprint: PROPS_BUDGET[`streetTree:${size}`].footprint });
}

/** A low planting bed: a curbed row of shrubs. `opts.count` (default 5). */
export function shrubBed(parent, x, y, z, opts = {}) {
  const n = opts.count ?? 5;
  const rig = prRig(parent, x, y, z, opts, "shrubBed");
  const S = rig.shell;
  box(S, 2.3, 0.22, 1.0, 0, 0.11, 0, 0x8b8177, { rough: 0.85, finish: "concrete" });
  for (let i = 0; i < n; i++) {
    const sx = -0.7 + (i / Math.max(1, n - 1)) * 1.4;
    ball(S, 0.3, sx, 0.42, 0, i % 2 ? 0x3f7a3f : 0x4a8a4a, { rough: 0.95, seg: 8, seg2: 6 });
  }
  return flDone(rig, { footprint: PROPS_BUDGET.shrubBed.footprint });
}

// ---------------------------------------------------------------- fencing

const prChainlinkMat = () => flCanvasMat("chainlink", 256, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.strokeStyle = "rgba(180,188,194,0.65)"; g.lineWidth = 2;
  const cell = 14;
  for (let i = -h; i < w + h; i += cell) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke(); }
}, { rough: 0.5, metal: 0.5, transparent: true, double: true });

/** A 10 ft chain-link fence panel between two posts, top and bottom rail. */
export function fencePanel(parent, x, y, z, opts = {}) {
  const rig = prRig(parent, x, y, z, opts, "fencePanel");
  const S = rig.shell;
  const steel = [0xb9c0c6, { rough: 0.45, metal: 0.5, finish: "galvanised" }];
  for (const px of [-1.5, 1.5]) flRod(S, 0.035, 1.9, px, 0.95, 0, "y", ...steel);
  for (const py of [0.06, 1.83]) box(S, 3.05, 0.025, 0.025, 0, py, 0, ...steel);
  flPanel(S, 2.95, 1.77, 0, 0.95, 0, prChainlinkMat(), "+z");
  return flDone(rig, { footprint: PROPS_BUDGET.fencePanel.footprint });
}

/** A chain-link fence panel with a swinging single gate leaf. Parts: gate. */
export function fencePanelGate(parent, x, y, z, opts = {}) {
  const rig = prRig(parent, x, y, z, opts, "fencePanel:gate");
  const S = rig.shell;
  const steel = [0xb9c0c6, { rough: 0.45, metal: 0.5, finish: "galvanised" }];
  for (const px of [-1.5, 1.5]) flRod(S, 0.04, 1.9, px, 0.95, 0, "y", ...steel);
  const gate = rig.part("gate", -1.5, 0, 0);
  for (const py of [0.06, 1.83]) box(gate, 2.9, 0.03, 0.03, 1.5, py, 0, ...steel);
  flPanel(gate, 2.85, 1.77, 1.5, 0.95, 0, prChainlinkMat(), "+z");
  const latch = rig.part("latch", 1.5, 0.95, 0);
  box(latch, 0.08, 0.14, 0.05, 0, 0, 0, 0x2b2f33, { rough: 0.6, metal: 0.4 });
  gate.userData.openAngle = 1.4;
  return flDone(rig, { footprint: PROPS_BUDGET["fencePanel:gate"].footprint });
}

// ------------------------------------------------------------------ yard

const prCorrugatedMat = (colour, key) => flCanvasMat(`corrugated|${key}|${colour}`, 512, 128, (g, w, h) => {
  gradientFill(g, w, h, [[0, flCss(flShade(colour, 1.1))], [1, flCss(flShade(colour, 0.8))]]);
  for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"; g.fillRect(i * w / 40, 0, w / 80, h); }
  grimeOverlay(g, w, h, { blotches: 3, streaks: 6, alpha: 0.14 });
}, { rough: 0.55, metal: 0.35 });

/** 20 ft ISO shipping container. Parts: doorL, doorR. */
export function shippingContainer(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x8a2e2e, fleetName: "SITE STORAGE", unitNumber: "20" });
  const rig = prRig(parent, x, y, z, opts, "shippingContainer");
  const S = rig.shell;
  const corrugated = prCorrugatedMat(lv.colour, "wall");
  box(S, 2.44, 2.59, 6.06, 0, 1.295, 0, lv.colour, { material: corrugated });
  box(S, 2.5, 0.12, 6.1, 0, 2.6, 0, lv.colour, { rough: 0.5, metal: 0.3 });
  flPanel(S, 5.9, 0.5, 1.221, 2.0, 0, flLiveryMat(lv, "cntrTop", { titleScale: 0.5, titleY: 0.5, stripeY: 1.5, pw: 1024, ph: 128 }), "+x");
  for (const sx of [-1, 1]) {
    const d = rig.part(sx > 0 ? "doorR" : "doorL", sx * 0.61, 1.295, 3.02);
    flPanel(d, 1.19, 2.5, 0, 0, 0.01, flDoorMat(lv, sx > 0 ? "R" : "L", { window: 0, marks: "fleet" }), "+z");
    d.userData.openAngle = sx > 0 ? 1.2 : -1.2;
  }
  return flDone(rig, { footprint: PROPS_BUDGET.shippingContainer.footprint, livery: lv });
}

/** Small skid-mounted site fuel tank, twin saddle stand. */
export function fuelTank(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0xf0c02c);
  const rig = prRig(parent, x, y, z, opts, "fuelTank");
  const S = rig.shell;
  for (const sx of [-0.85, 0.85]) box(S, 0.15, 0.8, 1.0, sx, 0.4, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
  flRod(S, 0.58, 2.2, 0, 0.8, 0, "x", colour, { rough: 0.45, metal: 0.25, seg: 18 });
  const gauge = rig.part("gauge", 0, 1.38, 0.4);
  cyl(gauge, 0.05, 0.05, 0.03, 0, 0, 0, 0x2b2f33, { rough: 0.4, metal: 0.4, seg: 10 });
  return flDone(rig, { footprint: PROPS_BUDGET.fuelTank.footprint });
}

/** Small diesel generator on a skid (no wheels — set down, not towed). */
export function generatorSkid(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0xf2c14b);
  const rig = prRig(parent, x, y, z, opts, "generatorSkid");
  const S = rig.shell;
  box(S, 1.0, 0.14, 2.2, 0, 0.07, 0, 0x2b2f33, { rough: 0.7, metal: 0.4 });
  box(S, 0.94, 1.1, 2.1, 0, 0.69, 0, colour, { rough: 0.5, finish: "painted" });
  flPanel(S, 0.9, 0.9, 0, 0.75, -1.051, flDoorMat(flLivery(opts.livery, { colour }), "L", { window: 0, marks: "none" }), "-z");
  const stack = rig.part("stack", 0.3, 1.24, 0.9);
  cyl(stack, 0.05, 0.05, 0.3, 0, 0, 0, 0x3a3f45, { rough: 0.6, metal: 0.4, seg: 8 });
  const panel = rig.part("controlPanel", 0, 0.9, 1.061);
  flPanel(panel, 0.4, 0.3, 0, 0, 0, mat(0x1a1e23, { rough: 0.4, emissive: 0x59c97b, ei: 0.4 }), "+z");
  return flDone(rig, { footprint: PROPS_BUDGET.generatorSkid.footprint });
}

/** A mobile crane's stacked counterweight slabs. `opts.count` (default 5). */
export function counterweightStack(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0x3a3f45);
  const n = opts.count ?? 5;
  const rig = prRig(parent, x, y, z, opts, "counterweightStack");
  const S = rig.shell;
  for (let i = 0; i < n; i++) box(S, 2.5, 0.28, 1.0, 0, 0.15 + i * 0.3, 0, i === 0 ? 0xf0c02c : colour, { rough: 0.6, finish: "painted" });
  return flDone(rig, { footprint: [2.5, Math.max(0.3, n * 0.3), 1.0] });
}

/** A-frame picnic table. */
export function picnicTable(parent, x, y, z, opts = {}) {
  const colour = prColour(opts, 0x8b6a45);
  const rig = prRig(parent, x, y, z, opts, "picnicTable");
  const S = rig.shell;
  box(S, 1.5, 0.05, 0.8, 0, 0.75, 0, colour, { rough: 0.75, finish: "brushed" });
  for (const sz of [-0.62, 0.62]) box(S, 1.5, 0.05, 0.26, 0, 0.45, sz, colour, { rough: 0.75, finish: "brushed" });
  for (const sx of [-0.62, 0.62]) {
    const leg = box(S, 0.06, 0.9, 1.5, sx, 0.45, 0, 0x5c4a34, { rough: 0.8, finish: "brushed" });
    leg.rotation.z = sx > 0 ? -0.35 : 0.35;
  }
  return flDone(rig, { footprint: PROPS_BUDGET.picnicTable.footprint });
}

// ------------------------------------------------------------------ budget

/**
 * Declared mesh count (after mergeStatic), footprint [width X, height Y,
 * length Z] in metres and required named parts per builder. Every entry is
 * at most 14 AUTHORED meshes (before merge) — tools/check_props.mjs holds
 * every builder to its declared count, footprint and parts, and to that
 * ceiling.
 */
export const PROPS_BUDGET = {
  jerseyBarrier: { build: "jerseyBarrier", meshes: 1, footprint: [0.61, 0.81, 3.05], parts: [], note: "concrete F-shape traffic barrier, 10 ft run" },
  waterBarrier: { build: "waterBarrier", meshes: 2, footprint: [0.5, 0.79, 1.83], parts: [], note: "plastic water/sand-filled lane barrier" },
  coneCluster: { build: "coneCluster", meshes: 9, footprint: [1.0, 0.71, 0.84], parts: [], note: "three traffic cones in a triangle" },
  lightMast: { build: "lightMast", meshes: 10, footprint: [1.3, 9.0, 0.5], parts: ["lamps"], note: "fixed site light mast, four heads, lit at night" },
  portableToilet: { build: "portableToilet", meshes: 4, footprint: [1.26, 2.32, 1.26], parts: ["door"], note: "single-unit portable toilet" },
  siteOffice: { build: "siteOffice", meshes: 6, footprint: [2.45, 3.1, 6.49], parts: ["door"], note: "20 ft portable site office" },
  dumpster: { build: "dumpster", meshes: 4, footprint: [1.37, 1.26, 1.83], parts: ["lidL", "lidR"], note: "front-load construction dumpster" },
  scaffoldTower: { build: "scaffoldTower", meshes: 14, footprint: [1.4, 4.0, 1.4], parts: [], note: "two-lift scaffold tower with platform and guardrail" },
  palletStack: { build: "palletStack", meshes: 4, footprint: [1.04, 1.7, 1.24], parts: [], note: "three loaded pallets under shrink film" },
  cableSpool: { build: "cableSpool", meshes: 3, footprint: [0.9, 1.5, 1.5], parts: [], note: "wound cable reel, standing on its rim" },
  fireHydrant: { build: "fireHydrant", meshes: 6, footprint: [0.38, 0.78, 0.46], parts: [], note: "dry-barrel fire hydrant" },
  bollardRow: { build: "bollardRow", meshes: 10, footprint: [6.16, 1.08, 0.16], parts: [], note: "row of five steel bollards" },
  parkBench: { build: "parkBench", meshes: 7, footprint: [1.8, 0.94, 0.5], parts: [], note: "slatted park bench" },
  "streetTree:small": { build: "streetTree", opts: { size: "small" }, meshes: 5, footprint: [2.48, 4.46, 2.4], parts: [], note: "young street tree in a tree grate" },
  "streetTree:medium": { build: "streetTree", opts: { size: "medium" }, meshes: 5, footprint: [3.93, 6.52, 3.8], parts: [], note: "established street tree in a tree grate" },
  "streetTree:large": { build: "streetTree", opts: { size: "large" }, meshes: 5, footprint: [5.8, 9.02, 5.6], parts: [], note: "mature street tree in a tree grate" },
  shrubBed: { build: "shrubBed", meshes: 6, footprint: [2.3, 0.72, 1.0], parts: [], note: "curbed planting bed, five shrubs" },
  fencePanel: { build: "fencePanel", meshes: 5, footprint: [3.05, 1.9, 0.07], parts: [], note: "10 ft chain-link fence panel" },
  "fencePanel:gate": { build: "fencePanelGate", meshes: 6, footprint: [3.05, 1.9, 0.07], parts: ["gate"], note: "chain-link fence panel with a swinging gate leaf" },
  shippingContainer: { build: "shippingContainer", meshes: 5, footprint: [2.44, 2.65, 6.06], parts: ["doorL", "doorR"], note: "20 ft ISO shipping container, oxide red" },
  "shippingContainer:blue": { build: "shippingContainer", opts: { livery: { colour: 0x2e4a7a, fleetName: "SITE STORAGE", unitNumber: "20" } }, meshes: 5, footprint: [2.44, 2.65, 6.06], parts: ["doorL", "doorR"], note: "20 ft ISO shipping container, marine blue" },
  fuelTank: { build: "fuelTank", meshes: 4, footprint: [2.2, 1.38, 1.16], parts: ["gauge"], note: "skid fuel tank on a twin saddle stand" },
  generatorSkid: { build: "generatorSkid", meshes: 6, footprint: [1.0, 1.34, 2.2], parts: ["stack", "controlPanel"], note: "diesel generator on a skid" },
  counterweightStack: { build: "counterweightStack", meshes: 5, footprint: [2.5, 1.5, 1.0], parts: [], note: "mobile crane counterweight, five slabs" },
  picnicTable: { build: "picnicTable", meshes: 5, footprint: [1.6, 0.9, 1.5], parts: [], note: "A-frame picnic table" },
};

/** The builders by the name PROPS_BUDGET's `build` field uses. */
export const PROPS_BUILDERS = {
  jerseyBarrier, waterBarrier, coneCluster, lightMast, portableToilet, siteOffice, dumpster,
  scaffoldTower, palletStack, cableSpool, fireHydrant, bollardRow, parkBench, streetTree,
  shrubBed, fencePanel, fencePanelGate, shippingContainer, fuelTank, generatorSkid,
  counterweightStack, picnicTable,
};
