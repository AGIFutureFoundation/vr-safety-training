/**
 * Shared texture library, checked.
 *
 * shared/textures.js is the procedural, tileable canvas face library every
 * station's platform paints with: the plaza ground, district grounds and
 * facades, the props kit's big surfaces and the fleet's hull/trailer sides.
 * This checker holds it to:
 *
 *   - every painter draws against the same stubbed 2D context the other
 *     content checkers use, at every declared size, without throwing;
 *   - every painter tiles: rendered on a real (software) canvas, its left
 *     edge is close in average colour to its right edge, and its top edge
 *     close to its bottom, within a tolerance generous enough for the
 *     random grain/grime every painter also draws;
 *   - facePaint()'s cache actually dedupes: the same (key, px, repeat)
 *     never draws its canvas twice, and a different key/px/repeat does;
 *   - palette() returns exactly the four keys { accent, ground, structure,
 *     trim } for every documented trade name, and falls back to
 *     `construction` for an unknown one rather than throwing.
 *
 *     node tools/check_textures.mjs
 */
import { buildSuite } from "./lib/headless.mjs";

const MODULES = ["shared/kit.js", "shared/textures.js"];
const HARNESS = `export {
  brickFace, blockFace, concreteFace, asphaltFace, corrugatedFace, gratingFace,
  woodGrainFace, tileFace, safetyStripeFace, rustFace, gravelFace, grassFace,
  sandFace, hardwoodCourtFace, plasterFace, stainlessFace,
  turfFace, roughFace, cartPathFace,
  facePaint, facePaintCacheSize, clearFacePaintCache, paintedMat,
  palette, PALETTE_NAMES, THREE,
};`;
const S = await buildSuite(MODULES, HARNESS, "textures");

let failures = 0;
const fail = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };

const PAINTERS = {
  brickFace: S.brickFace, blockFace: S.blockFace, concreteFace: S.concreteFace,
  asphaltFace: S.asphaltFace, corrugatedFace: S.corrugatedFace, gratingFace: S.gratingFace,
  woodGrainFace: S.woodGrainFace, tileFace: S.tileFace, safetyStripeFace: S.safetyStripeFace,
  rustFace: S.rustFace, gravelFace: S.gravelFace, grassFace: S.grassFace, sandFace: S.sandFace,
  hardwoodCourtFace: S.hardwoodCourtFace, plasterFace: S.plasterFace, stainlessFace: S.stainlessFace,
  turfFace: S.turfFace, roughFace: S.roughFace, cartPathFace: S.cartPathFace,
};
const NAMES = Object.keys(PAINTERS);

// ---------------------------------------------------------------- headless
//
// The same stubbed 2D context every other checker draws canvas faces
// against (installDomStubs() in tools/lib/headless.mjs, which buildSuite()
// already called): every property read that is not specifically handled
// hands back a no-op function, so any drawing call is safe to make and
// returns nothing usable — exactly what a painter must survive without
// throwing.
for (const name of NAMES) {
  const draw = PAINTERS[name];
  for (const px of [128, 256, 512]) {
    try {
      const canvas = globalThis.document.createElement("canvas");
      canvas.width = px; canvas.height = px;
      const g = canvas.getContext("2d");
      draw(g, px, px, {});
    } catch (e) {
      fail(name, `threw at ${px}px against the stubbed 2D context — ${e.message}`);
    }
  }
  // Every documented option variant, so a painter's branches (concreteFace's
  // "smooth" finish, asphaltFace's lane paint, hardwoodCourtFace's court
  // line) are exercised too, not only the defaults.
  const variants = {
    concreteFace: [{ finish: "smooth" }, { finish: "broom" }],
    asphaltFace: [{ lanes: 4 }, { lanes: 0 }],
    hardwoodCourtFace: [{ line: "#f6f4ee", lineAt: 0.5 }],
    corrugatedFace: [{ colour: 0x8a2e2e }],
    blockFace: [{ rows: 6, cols: 3 }],
    brickFace: [{ rows: 10, cols: 14 }],
  };
  for (const o of variants[name] ?? []) {
    try {
      const canvas = globalThis.document.createElement("canvas");
      canvas.width = 128; canvas.height = 128;
      draw(canvas.getContext("2d"), 128, 128, o);
    } catch (e) {
      fail(name, `threw with options ${JSON.stringify(o)} — ${e.message}`);
    }
  }
}

// ------------------------------------------------------------------ tiling
//
// A minimal software 2D context — no native canvas package here, so this
// rasterises just enough of the API every painter above actually calls
// (fillRect, fillStyle as a colour or a gradient, gradients as their stop
// list) into a real RGBA buffer, so tiling can be judged from real pixels
// rather than trusted on faith. Strokes/paths are no-ops: no painter in
// this library draws one, so there is nothing to approximate.
function parseColor(css) {
  if (!css || typeof css !== "string") return [0, 0, 0, 1];
  let m = /^#([0-9a-f]{6})$/i.exec(css);
  if (m) { const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]; }
  m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(css);
  if (m) return [+m[1], +m[2], +m[3], m[4] !== undefined ? +m[4] : 1];
  return [128, 128, 128, 1]; // unrecognised (a gradient object stringified, etc.) — neutral grey
}
class MiniGradient {
  constructor() { this.stops = []; }
  addColorStop(t, css) { this.stops.push([t, parseColor(css)]); }
  // The mean of its stops — good enough to judge a base wash's edge tone
  // without implementing real gradient interpolation.
  mean() {
    if (!this.stops.length) return [128, 128, 128, 1];
    const acc = [0, 0, 0, 0];
    for (const [, c] of this.stops) for (let i = 0; i < 4; i++) acc[i] += c[i];
    return acc.map((v) => v / this.stops.length);
  }
}
class MiniCtx {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.data = new Float64Array(w * h * 4);
    for (let i = 0; i < w * h; i++) this.data[i * 4 + 3] = 255; // opaque black canvas
    this.fillStyle = "#000000";
  }
  _colorNow() { return this.fillStyle instanceof MiniGradient ? this.fillStyle.mean() : parseColor(this.fillStyle); }
  fillRect(x, y, w, h) {
    const [r, gg, b, a] = this._colorNow();
    const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.w, Math.ceil(x + w)), y1 = Math.min(this.h, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
      const o = (yy * this.w + xx) * 4;
      this.data[o] = this.data[o] * (1 - a) + r * a;
      this.data[o + 1] = this.data[o + 1] * (1 - a) + gg * a;
      this.data[o + 2] = this.data[o + 2] * (1 - a) + b * a;
    }
  }
  clearRect() { /* no painter here relies on transparency reaching the edge check */ }
  createLinearGradient() { return new MiniGradient(); }
  createRadialGradient() { return new MiniGradient(); }
  measureText(s) { return { width: (s?.length ?? 1) * 6 }; }
  beginPath() {} moveTo() {} lineTo() {} closePath() {} stroke() {} fill() {} arc() {}
  strokeRect() {} save() {} restore() {} translate() {} rotate() {}
  set strokeStyle(_v) {} set lineWidth(_v) {} set font(_v) {} set textAlign(_v) {} set textBaseline(_v) {}
  set globalAlpha(_v) {} set lineCap(_v) {}
}
function render(draw, px, o = {}) {
  const ctx = new MiniCtx(px, px);
  draw(ctx, px, px, o);
  return ctx;
}
function edgeMean(ctx, side) {
  const { w, h, data } = ctx;
  const acc = [0, 0, 0]; let n = 0;
  const step = Math.max(1, Math.floor((side === "left" || side === "right" ? h : w) / 64));
  if (side === "left" || side === "right") {
    const x = side === "left" ? 0 : w - 1;
    for (let y = 0; y < h; y += step) { const o = (y * w + x) * 4; acc[0] += data[o]; acc[1] += data[o + 1]; acc[2] += data[o + 2]; n += 1; }
  } else {
    const y = side === "top" ? 0 : h - 1;
    for (let x = 0; x < w; x += step) { const o = (y * w + x) * 4; acc[0] += data[o]; acc[1] += data[o + 1]; acc[2] += data[o + 2]; n += 1; }
  }
  return acc.map((v) => v / n);
}
const TOLERANCE = 60; // per channel, 0-255 — generous: this judges the base
                       // wash's continuity, not a pixel-exact seam, and every
                       // painter also layers random grain/grime on top.
for (const name of NAMES) {
  let ctx;
  try { ctx = render(PAINTERS[name], 128); } catch (e) { fail(name, `threw rendering against the tiling harness — ${e.message}`); continue; }
  const [l, r, t, b] = [edgeMean(ctx, "left"), edgeMean(ctx, "right"), edgeMean(ctx, "top"), edgeMean(ctx, "bottom")];
  const diff = (a, c) => Math.max(...a.map((v, i) => Math.abs(v - c[i])));
  const dx = diff(l, r), dy = diff(t, b);
  if (dx > TOLERANCE) fail(name, `left/right edge average colour differs by ${dx.toFixed(0)} (tolerance ${TOLERANCE}) — does not tile horizontally`);
  if (dy > TOLERANCE) fail(name, `top/bottom edge average colour differs by ${dy.toFixed(0)} (tolerance ${TOLERANCE}) — does not tile vertically`);
}

// ------------------------------------------------------------------ cache
S.clearFacePaintCache();
if (S.facePaintCacheSize() !== 0) fail("cache", "clearFacePaintCache() did not empty the cache");
const drawCounts = {};
const counted = (key) => (g, w, h) => { drawCounts[key] = (drawCounts[key] ?? 0) + 1; g.fillStyle = "#888"; g.fillRect(0, 0, w, h); };
const t1 = S.facePaint("dedupe-a", counted("a"), { px: 64, repeat: 2 });
const t2 = S.facePaint("dedupe-a", counted("a"), { px: 64, repeat: 2 });
if (t1 !== t2) fail("cache", "facePaint() built a second texture for the same (key, px, repeat)");
if (drawCounts.a !== 1) fail("cache", `the "dedupe-a" canvas drew ${drawCounts.a ?? 0} time(s); a repeat call must not redraw it`);
if (S.facePaintCacheSize() !== 1) fail("cache", `cache holds ${S.facePaintCacheSize()} entries after one key; expected 1`);
S.facePaint("dedupe-b", counted("b"), { px: 64, repeat: 2 });
if (S.facePaintCacheSize() !== 2) fail("cache", `cache holds ${S.facePaintCacheSize()} entries after two distinct keys; expected 2`);
// A different repeat for the same key is a different tiling and must draw again.
S.facePaint("dedupe-a", counted("a"), { px: 64, repeat: 4 });
if (drawCounts.a !== 2) fail("cache", "a different repeat for the same key was served from the cache instead of drawn");

// ---------------------------------------------------------------- palette
const REQUIRED_KEYS = ["accent", "ground", "structure", "trim"];
for (const name of S.PALETTE_NAMES) {
  const p = S.palette(name);
  const keys = Object.keys(p).sort();
  if (keys.join(",") !== [...REQUIRED_KEYS].sort().join(",")) {
    fail(`palette:${name}`, `keys are ${keys.join(",")}, expected exactly ${REQUIRED_KEYS.join(",")}`);
  }
  for (const k of REQUIRED_KEYS) {
    if (!Number.isInteger(p[k]) || p[k] < 0 || p[k] > 0xffffff) fail(`palette:${name}`, `"${k}" is not a 0xRRGGBB number (${p[k]})`);
  }
}
const EXPECTED_TRADES = ["construction", "marine", "clinical", "kitchen", "utility", "transit", "rail", "aviation", "gym"];
for (const trade of EXPECTED_TRADES) {
  if (!S.PALETTE_NAMES.includes(trade)) fail("palette", `no "${trade}" palette — the brief names this trade explicitly`);
}
const fallback = S.palette("not-a-real-trade");
const construction = S.palette("construction");
if (JSON.stringify(fallback) !== JSON.stringify(construction)) fail("palette", "an unknown trade name did not fall back to construction");
// Fresh objects: a caller mutating its own copy must never leak into the shared table.
const p1 = S.palette("marine"); p1.accent = 0;
if (S.palette("marine").accent === 0) fail("palette", "palette() hands back a live reference — a caller's edit leaked into the shared table");

console.log(failures
  ? `\n${failures} texture problem(s) found.`
  : `\nAll ${NAMES.length} face painters draw headless and tile within tolerance; the facePaint() cache dedupes; all ${S.PALETTE_NAMES.length} trade palettes carry their four keys.`);
process.exit(failures ? 1 : 0);
