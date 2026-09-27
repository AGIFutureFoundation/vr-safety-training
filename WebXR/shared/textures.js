import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { gradientFill, noiseTexture, grimeOverlay, applyTextureQuality } from "./kit.js";
import { TEXTURE_RES, QUALITY } from "./perf.js";

// -------------------------------------------------------------------------
// Shared texture library — procedural, tileable canvas face painters used
// across the whole platform: the plaza ground, district grounds and
// facades (smartcity/js/districts.js, stage.js), the props kit's big
// surfaces (shared/props.js: containers, barriers, the site office,
// fences), and the fleet's hull and trailer sides (shared/fleet.js). Every
// painter takes `(g, w, h, o)` — a 2D context, the canvas size in pixels and
// options — and draws a pattern designed to repeat cleanly when the texture
// wraps: coursing, planks, stripes and grids are laid out on a pitch that
// divides the canvas evenly, so a mesh that repeats the texture N times
// across its face never shows a seam at N+1. Nothing here is fetched from a
// host by default: every pixel comes from gradients, canvas fills and
// Math.random(), exactly like citykit.js's existing pavingFace/
// deckPlateFace/etc., which this library is the general-purpose companion
// to (those stay put; this file is for the surfaces every station shares
// rather than one district's own water or steel). See "drop-in tile slot"
// below for the seam a real generated tile can use later without any of
// that changing.
//
// citykit.js re-exports everything here (`export * from "../../shared/
// textures.js"`) so a SmartCiti.X module that already does
// `import { brickFace } from "./citykit.js"` keeps working; shared modules
// (props.js, fleet.js) that cannot import a smartcity-specific file import
// straight from here. citykit.js's own surfaceTexture()/texturedMat() —
// used by stage.js and districts.js for the plaza ground and every
// district's facades — are thin wrappers over paintTexture()/paintedMat()
// below, so every district's ground and walls get the same resolution,
// mipmap, anisotropy and detail-map treatment as a painter used directly
// through facePaint(), without districts.js/stage.js changing a call site.
//
// Resolution and quality tiers (docs/textures.md, "Resolution and quality
// tiers"): every painter renders at `TEXTURE_RES` pixels square by default
// (shared/perf.js — 1024 on desktop/VR, 512 on a mobile browser or
// `?quality=low`, 256 with no real canvas to paint on, e.g. the content
// checkers), and a `QUALITY === "high"` material also carries a small
// bump/roughness map painted from the same tileable noise as the colour
// variation below (paintTexture()'s attachDetailMaps()).

/** hex 0xRRGGBB * k -> "rgb(r,g,b)", clamped. The tiny local version of
 *  fleet.js's flShade/flCss so this module never has to import fleet.js
 *  either — it is used by shared/props.js and shared/fleet.js in turn. */
function shade(hex, k = 1) {
  const r = Math.max(0, Math.min(255, Math.round(((hex >> 16) & 255) * k)));
  const gr = Math.max(0, Math.min(255, Math.round(((hex >> 8) & 255) * k)));
  const b = Math.max(0, Math.min(255, Math.round((hex & 255) * k)));
  return `rgb(${r},${gr},${b})`;
}

// Re-exported so a module that already imports from here (or from
// citykit.js's `export *`) can read the same resolution/quality tier this
// file itself paints against, instead of importing shared/perf.js again.
export { TEXTURE_RES, QUALITY };

// ------------------------------------------------------------- value noise
//
// A tileable multi-octave value-noise field: several lattices of random
// values, each finer and fainter than the last, bilinearly interpolated and
// summed. Every lattice wraps its own index (`% n`), so the field's left
// edge is the immediate continuation of its right edge and its top edge of
// its bottom — the same trick shared/kit.js's per-finish surface() maps use
// for their roughness/normal pair, generalised here so any painter can lay a
// broad colour-variation or bump layer under its own pattern.
//
// The octave sum is only ever evaluated at a small, fixed grid (`fieldRes`,
// 96 by default) — not once per output pixel — and the result is then
// upsampled to the canvas's actual size with a single bilinear pass. Doing
// the expensive part (several octaves, each its own random lattice) at a
// bounded size and the cheap part (one lerp) at the canvas's real size is
// what keeps this affordable at TEXTURE_RES 1024: evaluating three octaves
// directly at 1024² was measured at several hundred milliseconds per
// painter (tools/check_textures.mjs's own software rasteriser, run cold at
// 1024px) — an unacceptable stall the first time a station needs its
// textures; this two-step version is the fix. Returns a Float32Array of
// w*h values in [0, 1].
function tileableNoiseSmall(n, o = {}) {
  const octaves = Math.max(1, o.octaves ?? 3);
  const gain = o.gain ?? 0.5;
  const lacunarity = o.lacunarity ?? 2.3;
  const field = new Float32Array(n * n);
  let freq = Math.max(2, o.cells ?? 5), amp = 1, ampSum = 0;
  for (let oct = 0; oct < octaves; oct++) {
    const m = Math.max(2, Math.round(freq));
    const lattice = new Float32Array(m * m);
    for (let i = 0; i < lattice.length; i++) lattice[i] = Math.random();
    for (let y = 0; y < n; y++) {
      const v = (y / n) * m, yi = Math.floor(v), fy = v - yi, sy = fy * fy * (3 - 2 * fy);
      const y0 = yi % m, y1 = (yi + 1) % m, row = y * n;
      for (let x = 0; x < n; x++) {
        const u = (x / n) * m, xi = Math.floor(u), fx = u - xi, sx = fx * fx * (3 - 2 * fx);
        const x0 = xi % m, x1 = (xi + 1) % m;
        const a = lattice[y0 * m + x0] * (1 - sx) + lattice[y0 * m + x1] * sx;
        const b = lattice[y1 * m + x0] * (1 - sx) + lattice[y1 * m + x1] * sx;
        field[row + x] += (a * (1 - sy) + b * sy) * amp;
      }
    }
    ampSum += amp; amp *= gain; freq *= lacunarity;
  }
  for (let i = 0; i < field.length; i++) field[i] /= ampSum;
  return field;
}
/** Bilinear upsample of a tileable n×n field to w×h, wrapping at the edges —
 *  cheap (one lerp per output pixel, no octaves) regardless of how much work
 *  building the small field took. */
function upsampleTileable(field, n, w, h) {
  if (w === n && h === n) return field;
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const v = (y / h) * n, yi = Math.floor(v), fy = v - yi;
    const y0 = yi % n, y1 = (yi + 1) % n, row = y * w;
    for (let x = 0; x < w; x++) {
      const u = (x / w) * n, xi = Math.floor(u), fx = u - xi;
      const x0 = xi % n, x1 = (xi + 1) % n;
      const a = field[y0 * n + x0] * (1 - fx) + field[y0 * n + x1] * fx;
      const b = field[y1 * n + x0] * (1 - fx) + field[y1 * n + x1] * fx;
      out[row + x] = a * (1 - fy) + b * fy;
    }
  }
  return out;
}
function tileableNoise(w, h, o = {}) {
  const n = Math.max(16, Math.min(w, h, o.fieldRes ?? 96));
  return upsampleTileable(tileableNoiseSmall(n, o), n, w, h);
}

/**
 * Broad, seam-safe colour variation: reads the canvas's current pixels,
 * shifts each one a little lighter or darker by a multi-octave tileable
 * value-noise field, and writes the result back — the patch-to-patch tonal
 * drift real concrete, asphalt and turf all have at a scale bigger than the
 * fine speckle noiseTexture() already adds, and one that tiles by
 * construction rather than by the tolerance a checker happens to allow.
 * `tone` is a per-channel [r,g,b] weight (0..1, default neutral grey),
 * `amount` the peak shift in 0-255 levels. A silent no-op wherever the 2D
 * context has no real pixel API (the content checkers' stub) — the same
 * rule gradientFill/noiseTexture/grimeOverlay already follow.
 */
export function noiseWash(g, w, h, o = {}) {
  try {
    const img = g.getImageData(0, 0, w, h);
    const data = img.data;
    if (!data || !data.length) return;
    const field = tileableNoise(w, h, o);
    const [tr, tg, tb] = o.tone ?? [1, 1, 1];
    const amount = o.amount ?? 8;
    // No Math.max/min here: a Uint8ClampedArray (what a real 2D context's
    // ImageData carries) clamps to 0-255 on assignment by itself, and
    // skipping the redundant clamp calls is most of this loop's cost at a
    // full 1024² canvas.
    for (let i = 0, p = 0; i < field.length; i++, p += 4) {
      const t = (field[i] - 0.5) * 2 * amount;
      data[p] += t * tr;
      data[p + 1] += t * tg;
      data[p + 2] += t * tb;
    }
    g.putImageData(img, 0, 0);
  } catch { /* headless: no pixel API, so no wash */ }
}

/**
 * A handful of small, soft patches — some lighter, some darker — standing in
 * for the scuffing and abrasion a real surface picks up at handled edges and
 * high-traffic corners. Unlike grimeOverlay (deliberately downward: real
 * dirt falls under gravity), wear is scattered and mixes light with dark so
 * it reads as abrasion rather than another dirt pass. Guarded the same way
 * grimeOverlay is: no draw where the context has no gradient support.
 */
export function edgeWear(g, w, h, o = {}) {
  const spots = o.spots ?? 5;
  const alpha = o.alpha ?? 0.08;
  for (let i = 0; i < spots; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    const r = Math.min(w, h) * (0.05 + Math.random() * 0.09);
    let grad = null;
    try { grad = g.createRadialGradient(x, y, 0, x, y, r); } catch { grad = null; }
    if (!grad || typeof grad.addColorStop !== "function") continue;
    const tone = Math.random() < 0.5 ? (o.light ?? "255,255,250") : (o.dark ?? "0,0,0");
    grad.addColorStop(0, `rgba(${tone},${alpha})`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

// ---------------------------------------------------------------- caching

const _texCache = new Map();

/**
 * The actual canvas-or-external-tile build behind facePaint() and
 * citykit.js's surfaceTexture(): draws `draw(g, px, px, o)` into a fresh
 * canvas (or, when `o.tile` names a resolved external tile, loads that image
 * instead — see "drop-in tile slot" below), wraps it for tiling, and applies
 * mipmaps/anisotropy plus, at QUALITY "high", a small bump/roughness map
 * painted from the same noise. Exported so citykit.js's surfaceTexture() —
 * which never wants facePaint()'s caching, since its draw closures capture
 * fresh per-call arguments — still gets everything else this file gives a
 * painter.
 */
export function paintTexture(draw, o = {}) {
  const px = o.px ?? TEXTURE_RES;
  const repeat = o.repeat ?? 4;
  const tile = o.tile && typeof THREE.TextureLoader === "function" ? o.tile : null;
  let tex;
  if (tile?.url) {
    tex = new THREE.TextureLoader().load(tile.url);
    tex.userData.external = tile;
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = px; canvas.height = px;
    const g = canvas.getContext("2d");
    draw(g, px, px, o);
    tex = new THREE.CanvasTexture(canvas);
  }
  if (THREE.RepeatWrapping !== undefined) { tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; }
  tex.repeat?.set?.(repeat, repeat);
  applyTextureQuality(tex);
  if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
  if (!tile && QUALITY === "high" && o.detail !== false) attachDetailMaps(tex, o, px, repeat);
  return tex;
}

/** A small grayscale bump/roughness companion canvas, from the same kind of
 *  tileable noise as noiseWash() but painted once at a quarter of the main
 *  canvas's size (never more than 128px) — a bump map has no business at the
 *  full colour resolution, and this keeps the "cheap" in "cheap procedurally
 *  derived roughness/bump variation". Stored on the colour texture's own
 *  userData rather than returned, so paintedMat()/texturedMat() can find it
 *  from the texture alone. QUALITY "low" never calls this (see
 *  paintTexture()); a try/catch because the headless texture stub has no
 *  real pixel API to paint one against. */
function attachDetailMaps(tex, o, px, repeat) {
  try {
    const dpx = Math.max(32, Math.min(128, Math.round(px / 4)));
    const canvas = document.createElement("canvas");
    canvas.width = dpx; canvas.height = dpx;
    const g = canvas.getContext("2d");
    const field = tileableNoise(dpx, dpx, { octaves: 2, cells: o.bumpCells ?? 5 });
    const img = g.createImageData(dpx, dpx);
    for (let i = 0; i < dpx * dpx; i++) {
      const v = Math.round(field[i] * 255);
      const p = i * 4;
      img.data[p] = v; img.data[p + 1] = v; img.data[p + 2] = v; img.data[p + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const map = new THREE.CanvasTexture(canvas);
    if (THREE.RepeatWrapping !== undefined) { map.wrapS = THREE.RepeatWrapping; map.wrapT = THREE.RepeatWrapping; }
    map.repeat?.set?.(repeat, repeat);
    applyTextureQuality(map, { mipmaps: false });
    tex.userData.bumpMap = map;
    tex.userData.roughnessMap = map;
  } catch { /* headless: no pixel API, so no detail maps */ }
}

/**
 * A cached, tileable CanvasTexture from a named face painter. The same
 * (key, px, repeat) returns the SAME CanvasTexture instance instead of
 * drawing its canvas again — a station that paints six identical container
 * walls, or a district that stands a dozen bollards, costs one canvas.
 * Clone the result (`tex.clone()`) before touching `.offset`/`.repeat` if
 * the same painted canvas is needed a second time at a different tiling —
 * the pattern districts.js already uses for its own caustic/water maps.
 *
 * `o.px` picks the resolution (defaults to TEXTURE_RES, so a painter is
 * "at a selectable resolution" simply by passing `{ px }`); `o.tile`, when
 * it names a resolved external tile (`externalTileFor()` below), swaps the
 * procedural canvas for that image and is folded into the cache key like
 * every other option that changes what gets drawn.
 */
export function facePaint(key, draw, o = {}) {
  const px = o.px ?? TEXTURE_RES;
  const repeat = o.repeat ?? 4;
  const cacheKey = `${key}|${px}|${repeat}|${o.tile?.url ?? ""}`;
  const hit = _texCache.get(cacheKey);
  if (hit) return hit;
  const tex = paintTexture(draw, { ...o, px, repeat });
  _texCache.set(cacheKey, tex);
  return tex;
}

/** How many distinct canvases the cache currently holds — read by
 *  tools/check_textures.mjs to confirm the same key never draws twice, and
 *  by anything that wants to know the library's live memory footprint. */
export function facePaintCacheSize() { return _texCache.size; }

/** Empties the cache. Only a test harness that wants a clean slate between
 *  runs should call this — normal code lets the cache live for the page. */
export function clearFacePaintCache() { _texCache.clear(); }

/**
 * A MeshStandardMaterial carrying a face-painted map, tuned per surface.
 * Same contract as citykit.js's texturedMat(), duplicated in this shared
 * module so props.js and fleet.js never have to reach into a
 * smartcity-specific file just to paint a container wall. At QUALITY
 * "high", a texture facePaint() gave a bump/roughness companion (see
 * attachDetailMaps() above) carries it here too — "low" leaves the material
 * flat-shaded exactly as before this existed.
 */
export function paintedMat(tex, o = {}) {
  const extra = {};
  if (QUALITY === "high" && tex?.userData?.bumpMap) {
    extra.bumpMap = tex.userData.bumpMap;
    extra.bumpScale = o.bumpScale ?? 0.015;
  }
  if (QUALITY === "high" && tex?.userData?.roughnessMap) {
    extra.roughnessMap = tex.userData.roughnessMap;
  }
  const m = new THREE.MeshStandardMaterial({
    map: tex, color: o.color ?? 0xffffff, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0.05,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1, emissiveMap: o.glow ? tex : null,
    ...extra,
  });
  m.userData.ownMaterial = true;
  m.userData.ownTexture = true;
  return m;
}

// -------------------------------------------------------- drop-in tile slot
//
// Every painter below draws procedurally by default — see the module doc at
// the top of this file. If a real photographic or PBR tile is generated or
// licensed for one of them later, dropping the file at
// WebXR/assets/textures/<id>.jpg and naming it in manifest.json (id, file,
// licence, provenance — see that directory's README) is enough:
// loadTextureManifest() fetches the manifest once, externalTileFor()
// resolves a painter's id against it, and passing the result as
// `facePaint(key, draw, { tile })` (or `surfaceTexture(draw, { tile })`)
// swaps the procedural canvas for THREE.TextureLoader's image — the painter
// function, its cache key and every existing call site stay unchanged, only
// where the pixels came from does. Nothing calls this automatically today:
// the same seam shared/signage.js already keeps, unused, for a licensed
// union logo (loadBrandManifest()/brandFileFor()) — an app opts in once it
// actually has a tile to offer. tools/check_textures.mjs is what holds
// manifest.json itself to the schema this expects.

/** Maps a face painter's function name to the id docs/textures.md and
 *  manifest.json both use for it — "brickFace" -> "brick", and so on. */
const PAINTER_IDS = {
  brickFace: "brick", blockFace: "block", concreteFace: "concrete", asphaltFace: "asphalt",
  corrugatedFace: "corrugated", gratingFace: "grating", woodGrainFace: "wood", tileFace: "tile",
  safetyStripeFace: "safety-stripe", rustFace: "rust", gravelFace: "gravel", grassFace: "turf",
  sandFace: "sand", hardwoodCourtFace: "hardwood-court", plasterFace: "plaster", stainlessFace: "stainless",
  turfFace: "fairway-turf", roughFace: "rough", cartPathFace: "cart-path",
};
/** The nineteen manifest ids above, for tools/check_textures.mjs and anything
 *  else that wants to enumerate them. */
export const PAINTER_TILE_IDS = Object.values(PAINTER_IDS);
/** The manifest id a painter function is known by, or null for a draw
 *  closure this library does not name (a station's own one-off wrapper). */
export function tileIdFor(draw) { return PAINTER_IDS[draw?.name] ?? null; }

let _manifestPromise = null;
/** The WebXR root for the page asking — same rule as shared/signage.js's
 *  own signageBase(), duplicated rather than imported so this module never
 *  has to depend on signage.js just for a path guess. */
function texturesBase() {
  const here = typeof document !== "undefined" ? document.baseURI ?? "" : "";
  const m = here.match(/^(.*\/)(smartcity|trades|holodeck|instructor)\//);
  return m ? m[1] : (here ? new URL("../", here).href : "");
}
/**
 * The drop-in tile manifest, fetched once. Resolves to `{ tiles, url }` or
 * null: no fetch (headless), no file, or a manifest that does not parse all
 * mean "every painter draws procedurally", which is the shipped state.
 */
export function loadTextureManifest(url = null) {
  if (_manifestPromise && !url) return _manifestPromise;
  if (typeof fetch !== "function") return (_manifestPromise = Promise.resolve(null));
  const target = url ?? `${texturesBase()}assets/textures/manifest.json`;
  return (_manifestPromise = fetch(target)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => (data ? { tiles: data.tiles ?? {}, url: target } : null))
    .catch(() => null));
}
/** A resolved `{ url, licence, provenance }` for a painter id against a
 *  loaded manifest, or null when it names no file (the shipped state, and
 *  every painter's default) or the manifest itself did not load. */
export function externalTileFor(manifest, id) {
  const entry = manifest?.tiles?.[id];
  if (!entry || typeof entry.file !== "string" || !entry.file) return null;
  try { return { url: new URL(entry.file, manifest.url).href, licence: entry.licence ?? null, provenance: entry.provenance ?? null }; } catch { return null; }
}

// ---------------------------------------------------------------- painters
//
// Every painter tiles seamlessly: its pattern pitch is chosen to divide the
// canvas an integer number of times, so the left edge always continues the
// pattern the right edge ends on (and the top/bottom the same way). Random
// tone jitter is per-cell, not per-pixel-position, so it does not shift
// between repeats either. Each one layers, on top of its own pattern: a
// broad seam-safe noiseWash() colour variation, its existing fine-grain
// noiseTexture() speckle, material-specific detail (aggregate specks in
// concrete, tar lines in asphalt, grain fibres in wood, rust bloom on
// corrugated metal, blade texture in turf, wet sheen bands in sand, …), a
// scattered edgeWear() pass, and — where real dirt would collect — a
// directional grimeOverlay() last.

/** Running-bond brick: staggered courses, mortar joints, per-brick tone jitter. */
export function brickFace(g, w, h, o = {}) {
  const rows = o.rows ?? 8, cols = o.cols ?? 12;
  gradientFill(g, w, h, [[0, o.mortar ?? "#8a8378"], [1, o.mortar2 ?? "#7d7669"]]);
  const rh = h / rows, cw = w / cols;
  const bricks = o.brick ?? [0xa8503a, 0x974731, 0xb35a3f, 0x8f4230, 0x9c4e36];
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (cw / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + off, y = r * rh;
      const tone = bricks[((r * 5 + c * 3) % bricks.length + bricks.length) % bricks.length];
      const jitter = 0.92 + (((r * 7 + c * 13) % 5) / 5) * 0.16;
      g.fillStyle = shade(tone, jitter);
      g.fillRect(x + w * 0.006, y + h * 0.012, cw - w * 0.012, rh - h * 0.024);
    }
  }
  noiseWash(g, w, h, { tone: [1, 0.72, 0.55], amount: 9, cells: 5 });
  noiseTexture(g, w, h, { density: 1600, alpha: 0.07, tone: "40,22,12" });
  edgeWear(g, w, h, { spots: 4, alpha: 0.06 });
  grimeOverlay(g, w, h, { blotches: 2, streaks: 3, tone: "15,12,8", alpha: 0.12 });
}

/** Concrete-masonry block coursing: bigger units than brick, tooled joints. */
export function blockFace(g, w, h, o = {}) {
  const rows = o.rows ?? 4, cols = o.cols ?? 6;
  gradientFill(g, w, h, [[0, o.joint ?? "#6b6d6a"], [1, o.joint2 ?? "#616360"]]);
  const rh = h / rows, cw = w / cols;
  const base = o.block ?? 0x8f918b;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (cw / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + off, y = r * rh;
      const jitter = 0.9 + (((r * 11 + c * 7) % 6) / 6) * 0.2;
      g.fillStyle = shade(base, jitter);
      g.fillRect(x + w * 0.008, y + h * 0.02, cw - w * 0.016, rh - h * 0.04);
    }
  }
  noiseWash(g, w, h, { tone: [1, 1, 1], amount: 8, cells: 4 });
  noiseTexture(g, w, h, { density: 2200, alpha: 0.1, tone: "20,20,18" });
  edgeWear(g, w, h, { spots: 4, alpha: 0.06 });
  grimeOverlay(g, w, h, { blotches: 3, streaks: 2, tone: "12,12,10", alpha: 0.14 });
}

/** Cast concrete: `o.finish` "broom" (default, directional broom striations)
 *  or "smooth" (fine grain only, a trowelled slab or a foundation wall). */
export function concreteFace(g, w, h, o = {}) {
  const tone = o.tone ?? "#8b8d89";
  gradientFill(g, w, h, [[0, tone], [1, o.tone2 ?? "#7d7f7b"]]);
  noiseWash(g, w, h, { tone: [1, 1, 1], amount: 10, cells: 6 });
  noiseTexture(g, w, h, { density: 1800, alpha: 0.08, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 900, alpha: 0.05, tone: "230,230,220" });
  if ((o.finish ?? "broom") === "broom") {
    const step = o.step ?? h / 64;
    for (let y = 0; y < h; y += step) {
      const a = 0.03 + (Math.sin(y * 0.7) * 0.5 + 0.5) * 0.03;
      g.fillStyle = `rgba(0,0,0,${a.toFixed(3)})`;
      g.fillRect(0, y, w, Math.max(1, step * 0.5));
    }
  }
  // Aggregate specks: distinct light (quartz) and dark (basalt) flecks
  // visible in the cured mix, scaled to the canvas so they read the same
  // physical size at any resolution rather than shrinking as TEXTURE_RES
  // grows.
  const aggregate = o.aggregate ?? Math.round(260 * (w / 512) * (h / 512));
  const scale = Math.max(w, h) / 512;
  for (let i = 0; i < aggregate; i++) {
    const light = Math.random() < 0.5;
    const s = (0.8 + Math.random() * 1.6) * scale;
    g.fillStyle = light ? `rgba(225,222,212,${(0.25 + Math.random() * 0.25).toFixed(2)})` : `rgba(55,52,46,${(0.2 + Math.random() * 0.25).toFixed(2)})`;
    g.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
  edgeWear(g, w, h, { spots: 4, alpha: 0.07 });
  grimeOverlay(g, w, h, { blotches: 2, streaks: 2, tone: "10,10,8", alpha: 0.1 });
}

/** Dark asphalt aggregate; `o.lanes` (count) paints dashed lane lines. */
export function asphaltFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#2c2e30"], [1, o.base2 ?? "#26282a"]]);
  noiseWash(g, w, h, { tone: [1, 1, 1], amount: 7, cells: 5 });
  noiseTexture(g, w, h, { density: 5200, alpha: 0.16, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 2400, alpha: 0.09, tone: "190,190,190" });
  if (o.lanes) {
    const lw = w / o.lanes;
    g.fillStyle = "rgba(232,232,222,0.85)";
    for (let i = 1; i < o.lanes; i++) {
      for (let y = 0; y < h; y += h / 4) g.fillRect(i * lw - w * 0.006, y, w * 0.012, h * 0.16);
    }
  }
  // Tar/crack-seal lines: a few long, faintly wavy dark lines cutting across
  // the surface — sealed cracks are near-universal on real asphalt. The wave
  // frequency is a whole number of cycles across the canvas width, so the
  // left edge always meets the right edge at the same offset.
  const tarLines = o.tarLines ?? 3;
  for (let i = 0; i < tarLines; i++) {
    const y0 = h * (0.15 + Math.random() * 0.7);
    const amp = h * (0.015 + Math.random() * 0.02);
    const freq = 1 + Math.floor(Math.random() * 3);
    const step = Math.max(2, w / 128), lw = Math.max(1, w * 0.0035);
    g.fillStyle = "rgba(10,10,10,0.5)";
    for (let x = 0; x < w; x += step) {
      const y = y0 + Math.sin((x / w) * Math.PI * 2 * freq) * amp;
      g.fillRect(x, y, step + 1, lw);
    }
  }
  edgeWear(g, w, h, { spots: 3, alpha: 0.06 });
  grimeOverlay(g, w, h, { blotches: 3, streaks: 4, tone: "8,8,8", alpha: 0.14 });
}

/** Vertical corrugated-metal siding: ridge/valley shading, painted colour. */
export function corrugatedFace(g, w, h, o = {}) {
  const colour = o.colour ?? o.color ?? 0x9aa1a8;
  gradientFill(g, w, h, [[0, shade(colour, 1.08)], [1, shade(colour, 0.86)]]);
  const ribs = o.ribs ?? 24, rw = w / ribs;
  for (let i = 0; i < ribs; i++) {
    const x = i * rw;
    g.fillStyle = "rgba(255,255,255,0.16)"; g.fillRect(x, 0, rw * 0.22, h);
    g.fillStyle = "rgba(0,0,0,0.20)"; g.fillRect(x + rw * 0.55, 0, rw * 0.22, h);
  }
  noiseWash(g, w, h, { tone: [1, 1, 1], amount: 6, cells: 4 });
  noiseTexture(g, w, h, { density: 900, alpha: 0.06, tone: "0,0,0" });
  // Rust bloom: a few oxidised patches breaking the paint, heavier toward
  // the bottom where water actually sits and runs.
  const bloom = o.rustBloom ?? 5;
  for (let i = 0; i < bloom; i++) {
    const x = Math.random() * w, y = h * (0.35 + Math.random() * 0.65);
    const r = w * (0.015 + Math.random() * 0.03);
    let grad = null;
    try { grad = g.createRadialGradient(x, y, 0, x, y, r); } catch { grad = null; }
    if (grad && typeof grad.addColorStop === "function") {
      grad.addColorStop(0, "rgba(150,72,28,0.35)");
      grad.addColorStop(1, "rgba(150,72,28,0)");
      g.fillStyle = grad;
    } else {
      g.fillStyle = "rgba(150,72,28,0.12)";
    }
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  edgeWear(g, w, h, { spots: 4, alpha: 0.07 });
  grimeOverlay(g, w, h, { blotches: 2, streaks: 5, tone: "20,18,14", alpha: 0.16 });
}

/** Steel bar grating / diamond-plate deck: a diamond lattice over dark steel. */
export function gratingFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#2a2f33"], [1, o.base2 ?? "#22262a"]]);
  const cell = o.cell ?? w / 16;
  for (let y = 0; y < h + cell; y += cell) {
    for (let x = -cell; x < w + cell; x += cell) {
      const cx = x + ((Math.round(y / cell)) % 2 ? cell / 2 : 0);
      g.fillStyle = "rgba(255,255,255,0.08)";
      g.fillRect(cx - cell * 0.42, y - cell * 0.06, cell * 0.84, cell * 0.1);
      g.fillStyle = "rgba(0,0,0,0.30)";
      g.fillRect(cx - cell * 0.42, y + cell * 0.06, cell * 0.84, cell * 0.06);
    }
  }
  noiseWash(g, w, h, { tone: [1, 1, 1], amount: 6, cells: 4 });
  noiseTexture(g, w, h, { density: 1400, alpha: 0.08, tone: "0,0,0" });
  edgeWear(g, w, h, { spots: 3, alpha: 0.06 });
  grimeOverlay(g, w, h, { blotches: 2, streaks: 3, tone: "10,10,10", alpha: 0.12 });
}

/** Painted plank boards: alternating tone strips with grain streaks. */
export function woodGrainFace(g, w, h, o = {}) {
  const planks = o.planks ?? 8, pw = w / planks;
  const tones = o.tones ?? [0x9a7448, 0x8a6640, 0xa47f52];
  for (let i = 0; i < planks; i++) {
    const tone = tones[i % tones.length];
    g.fillStyle = shade(tone, 1); g.fillRect(i * pw, 0, pw, h);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(i * pw, 0, w * 0.006, h);
    for (let s = 0; s < 5; s++) {
      const gy = (s / 5) * h + ((i * 37) % 11);
      g.fillStyle = `rgba(40,24,10,${(0.05 + (s % 3) * 0.03).toFixed(2)})`;
      g.fillRect(i * pw + pw * 0.08, gy, pw * 0.84, h * 0.02);
    }
    // Longer fibre-grain streaks running the length of the board, gently
    // wavy so they read as grain rather than ruled lines. The wave's
    // frequency is a whole number of cycles down the canvas height, so the
    // top edge always meets the bottom edge at the same offset.
    const fibres = o.grainLines ?? 3;
    for (let f = 0; f < fibres; f++) {
      const gx = i * pw + pw * (0.15 + 0.7 * ((f + 1) / (fibres + 1)));
      const amp = pw * 0.05;
      const freq = 1 + (f % 3);
      const step = Math.max(2, h / 96), fw = Math.max(1, pw * 0.012);
      g.fillStyle = `rgba(40,24,10,${(0.05 + (f % 2) * 0.03).toFixed(2)})`;
      for (let y = 0; y < h; y += step) {
        const x = gx + Math.sin((y / h) * Math.PI * 2 * freq) * amp;
        g.fillRect(x, y, fw, step + 1);
      }
    }
  }
  noiseWash(g, w, h, { tone: [1, 0.7, 0.4], amount: 8, cells: 5 });
  noiseTexture(g, w, h, { density: 1200, alpha: 0.07, tone: "30,18,8" });
  edgeWear(g, w, h, { spots: 4, alpha: 0.06 });
  grimeOverlay(g, w, h, { blotches: 2, streaks: 3, tone: "16,10,4", alpha: 0.12 });
}

/** Ceramic/quarry tile grid: square tiles, grout lines, per-tile jitter. */
export function tileFace(g, w, h, o = {}) {
  const n = o.tiles ?? 6;
  gradientFill(g, w, h, [[0, o.grout ?? "#c7ccce"], [1, o.grout2 ?? "#bcc1c3"]]);
  const t = w / n, base = o.tile ?? 0xe8ecee;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const jitter = 0.94 + (((i * 5 + j * 9) % 6) / 6) * 0.1;
    g.fillStyle = shade(base, jitter);
    g.fillRect(i * t + w * 0.008, j * t + h * 0.008, t - w * 0.016, t - h * 0.016);
  }
  noiseWash(g, w, h, { tone: [1, 1, 1], amount: 5, cells: 4 });
  noiseTexture(g, w, h, { density: 500, alpha: 0.04, tone: "0,0,0" });
  edgeWear(g, w, h, { spots: 3, alpha: 0.05 });
}

/** Diagonal hazard stripes, yellow/black by default (`o.a`/`o.b` swap the pair). */
export function safetyStripeFace(g, w, h, o = {}) {
  const a = o.a ?? "#f2c14b", b = o.b ?? "#1a1a1a";
  g.fillStyle = b; g.fillRect(0, 0, w, h);
  const n = o.stripes ?? 8, sw = (w + h) / n;
  g.fillStyle = a;
  for (let i = -n; i < n * 2; i++) {
    // Parallelogram stripes drawn as stacked rects so the pattern tiles
    // cleanly at 45°: each stripe is one rect per scanline band.
    const x0 = i * sw;
    for (let y = 0; y < h; y += 2) g.fillRect(x0 + y, y, sw / 2, 2);
  }
  noiseTexture(g, w, h, { density: 600, alpha: 0.05, tone: "0,0,0" });
  // Kept deliberately faint: this is high-visibility tape, and colour
  // variation or scuffing here should never read as dirtying the warning.
  edgeWear(g, w, h, { spots: 2, alpha: 0.03 });
}

/** Oxidised steel: mottled rust patches over a dark metal base. */
export function rustFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#4a4640"], [1, o.base2 ?? "#3c3934"]]);
  const patches = o.patches ?? 60;
  for (let i = 0; i < patches; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = w * (0.02 + Math.random() * 0.06);
    const tone = Math.random() < 0.5 ? [180, 90, 40] : [140, 62, 28];
    g.fillStyle = `rgba(${tone[0]},${tone[1]},${tone[2]},${(0.18 + Math.random() * 0.3).toFixed(2)})`;
    g.fillRect(x - r, y - r, r * 2, r * 1.4);
  }
  noiseWash(g, w, h, { tone: [1, 0.55, 0.3], amount: 10, cells: 5 });
  noiseTexture(g, w, h, { density: 3000, alpha: 0.12, tone: "60,30,10" });
  edgeWear(g, w, h, { spots: 4, alpha: 0.07 });
  grimeOverlay(g, w, h, { blotches: 3, streaks: 6, tone: "70,35,12", alpha: 0.2 });
}

/** Loose gravel / crushed aggregate: scattered stone specks, several tones. */
export function gravelFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#6b665c"], [1, o.base2 ?? "#5e5a51"]]);
  const stones = o.stones ?? 900;
  const scale = Math.max(w, h) / 512; // stones stay the same physical size at any TEXTURE_RES
  const tones = ["180,176,166", "140,136,126", "160,150,130", "120,116,108"];
  for (let i = 0; i < stones; i++) {
    const tone = tones[i % tones.length];
    const s = (1.5 + Math.random() * 3.5) * scale;
    g.fillStyle = `rgba(${tone},${(0.35 + Math.random() * 0.35).toFixed(2)})`;
    g.fillRect(Math.random() * w, Math.random() * h, s, s * 0.8);
  }
  noiseWash(g, w, h, { tone: [1, 1, 1], amount: 7, cells: 5 });
  noiseTexture(g, w, h, { density: 2000, alpha: 0.08, tone: "0,0,0" });
  edgeWear(g, w, h, { spots: 3, alpha: 0.05 });
}

/** Mowed turf: green mottle with a subtle mow-stripe alternation. */
export function grassFace(g, w, h, o = {}) {
  const stripes = o.stripes ?? 8, sw = h / stripes;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle = i % 2 ? (o.a ?? "#3f7a3f") : (o.b ?? "#457f45");
    g.fillRect(0, i * sw, w, sw);
  }
  noiseWash(g, w, h, { tone: [0.7, 1, 0.6], amount: 7, cells: 6 });
  noiseTexture(g, w, h, { density: 4000, alpha: 0.1, tone: "20,50,20" });
  noiseTexture(g, w, h, { density: 1200, alpha: 0.08, tone: "90,140,70" });
  // Blade texture: short vertical light/dark strokes reading as individual
  // grass blades under the mow-stripe bands, scaled to the canvas so a
  // higher TEXTURE_RES reads as finer blades rather than sparser ones.
  const blades = o.blades ?? Math.round(2200 * (w / 512) * (h / 512));
  const scale = Math.max(w, h) / 512;
  for (let i = 0; i < blades; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    const len = (2 + Math.random() * 3) * scale;
    const dark = Math.random() < 0.5;
    g.fillStyle = dark ? "rgba(20,45,15,0.22)" : "rgba(150,190,110,0.16)";
    g.fillRect(x, y, Math.max(1, w * 0.0015), len);
  }
  edgeWear(g, w, h, { spots: 3, alpha: 0.04, light: "235,240,210" });
}

/** Fine sand with low wind ripples. */
export function sandFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#d8c79a"], [1, o.base2 ?? "#c9b686"]], { radial: true });
  noiseWash(g, w, h, { tone: [1, 0.95, 0.8], amount: 8, cells: 6 });
  noiseTexture(g, w, h, { density: 3400, alpha: 0.1, tone: "120,100,60" });
  const step = o.step ?? h / 24;
  for (let y = step / 2; y < h; y += step) {
    g.fillStyle = "rgba(255,250,230,0.08)"; g.fillRect(0, y - 1, w, 2);
    g.fillStyle = "rgba(90,72,40,0.06)"; g.fillRect(0, y + 1, w, 1.5);
  }
  // Wet sheen bands: a couple of broader, brighter horizontal bands — as if
  // damp sand caught the light — laid at even divisions of the canvas so
  // they read the same at every repeat.
  const wetBands = o.wetBands ?? 2;
  for (let i = 0; i < wetBands; i++) {
    const wy = ((i + 0.5) / wetBands) * h, bandH = h * 0.05;
    let grad = null;
    try { grad = g.createLinearGradient(0, wy - bandH, 0, wy + bandH); } catch { grad = null; }
    if (grad && typeof grad.addColorStop === "function") {
      grad.addColorStop(0, "rgba(255,252,235,0)");
      grad.addColorStop(0.5, "rgba(255,252,235,0.16)");
      grad.addColorStop(1, "rgba(255,252,235,0)");
      g.fillStyle = grad;
    } else {
      g.fillStyle = "rgba(255,252,235,0.05)";
    }
    g.fillRect(0, wy - bandH, w, bandH * 2);
  }
  edgeWear(g, w, h, { spots: 3, alpha: 0.05 });
}

/** Fairway turf: a tight, bright mow-stripe cut — shorter and greener than
 *  the general-purpose grassFace, for the fairway and green surfaces a golf
 *  course actually maintains differently from its rough (shared/fairway.js). */
export function turfFace(g, w, h, o = {}) {
  const stripes = o.stripes ?? 10, sw = h / stripes;
  const a = o.a ?? "#4a9a4c", b = o.b ?? "#3f8a44";
  for (let i = 0; i < stripes; i++) {
    g.fillStyle = i % 2 ? a : b;
    g.fillRect(0, i * sw, w, sw);
  }
  noiseTexture(g, w, h, { density: 3200, alpha: 0.06, tone: "20,60,20" });
  noiseTexture(g, w, h, { density: 900, alpha: 0.05, tone: "170,210,150" });
}

/** Golf rough: longer, uncut grass beside the fairway — darker, denser and
 *  with no mow-stripe pattern (shared/fairway.js). */
export function roughFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#33502c"], [1, o.base2 ?? "#2a4425"]]);
  noiseTexture(g, w, h, { density: 5200, alpha: 0.14, tone: "12,28,10" });
  noiseTexture(g, w, h, { density: 1800, alpha: 0.09, tone: "90,120,60" });
  grimeOverlay(g, w, h, { blotches: 2, streaks: 1, tone: "20,30,14", alpha: 0.08 });
}

/** Cart path: light aggregate paving with expansion joints at a fixed pitch
 *  (shared/fairway.js's golf-cart paths, or any narrow service path). */
export function cartPathFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#c7c0ac"], [1, o.base2 ?? "#b9b29d"]]);
  noiseTexture(g, w, h, { density: 2600, alpha: 0.1, tone: "60,54,40" });
  const step = o.step ?? w / 6;
  g.strokeStyle = "rgba(70,64,50,0.4)";
  g.lineWidth = Math.max(1, h * 0.01);
  for (let x = step; x < w; x += step) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  grimeOverlay(g, w, h, { blotches: 2, streaks: 2, tone: "40,36,26", alpha: 0.1 });
}

/** Gym-floor maple hardwood: narrow long strips along the run, `o.lines`
 *  paints a court line across the boards (colour, at fraction `o.lineAt`). */
export function hardwoodCourtFace(g, w, h, o = {}) {
  const planks = o.planks ?? 14;
  gradientFill(g, w, h, [[0, "#c9a06a"], [1, "#bd9260"]], { horizontal: true });
  const pw = w / planks;
  for (let i = 0; i < planks; i++) {
    const jitter = 0.95 + ((i * 7) % 6) / 6 * 0.14;
    g.fillStyle = shade(0xc9a06a, jitter); g.fillRect(i * pw, 0, pw, h);
    g.fillStyle = "rgba(70,45,15,0.18)"; g.fillRect(i * pw, 0, w * 0.003, h);
  }
  noiseWash(g, w, h, { tone: [1, 0.85, 0.6], amount: 5, cells: 5 });
  noiseTexture(g, w, h, { density: 900, alpha: 0.05, tone: "70,45,15" });
  if (o.line) {
    const ly = h * (o.lineAt ?? 0.5);
    g.fillStyle = o.line;
    g.fillRect(0, ly - h * 0.012, w, h * 0.024);
  }
  // A satin poly finish: a soft sheen band, not a stripe — a court reads wet-look.
  g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(0, 0, w, h * 0.5);
  // A well-kept floor gets light scuffing near the free-throw and key
  // areas, never grime — kept faint and skewed light rather than dark.
  edgeWear(g, w, h, { spots: 3, alpha: 0.035, light: "255,250,235", dark: "70,45,15" });
}

/** Painted plaster / stucco: trowelled low-frequency mottle, no coursing. */
export function plasterFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#d8d3c6"], [1, o.base2 ?? "#cdc8bb"]], { radial: true });
  noiseWash(g, w, h, { tone: [1, 1, 1], amount: 7, cells: 4 });
  noiseTexture(g, w, h, { density: 2600, alpha: 0.05, tone: "60,55,45" });
  noiseTexture(g, w, h, { density: 700, alpha: 0.04, tone: "255,255,250" });
  edgeWear(g, w, h, { spots: 4, alpha: 0.05 });
  grimeOverlay(g, w, h, { blotches: 2, streaks: 1, tone: "40,36,28", alpha: 0.08 });
}

/** Brushed stainless: cool base, long directional brush streaks, a soft sheen band. */
export function stainlessFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#c7cdd1"], [1, o.base2 ?? "#b5bcc1"]], { horizontal: true });
  for (let y = 0; y < h; y += 2) {
    const a = 0.02 + Math.random() * 0.03;
    g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    g.fillRect(0, y, w, 1);
  }
  g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, h * 0.32, w, h * 0.1);
  noiseWash(g, w, h, { tone: [1, 1, 1], amount: 4, cells: 3 });
  noiseTexture(g, w, h, { density: 700, alpha: 0.04, tone: "40,45,50" });
  // Kept very faint: brushed stainless reads as clean, close-tolerance
  // metal, not a weathered surface.
  edgeWear(g, w, h, { spots: 2, alpha: 0.03 });
}

// ------------------------------------------------------------------ palette

/**
 * Trade palettes: four roles every station/prop can pull a colour from
 * without inventing its own — `accent` (the trade's signal/highlight
 * colour), `ground` (the surface underfoot), `structure` (the dominant
 * built material) and `trim` (a secondary accent for bands, doors, lines).
 * Values are plain 0xRRGGBB numbers, ready for `mat()`/`box()`/etc.
 */
const PALETTES = {
  construction: { accent: 0xf2c14b, ground: 0x4a3f3a, structure: 0xd24a1c, trim: 0x2b2f33 },
  marine: { accent: 0x4fd1ff, ground: 0x0f2e3a, structure: 0x6e3328, trim: 0x8b98a5 },
  clinical: { accent: 0x4fd6a5, ground: 0xe4e9ec, structure: 0xcfd6dc, trim: 0x2b3542 },
  kitchen: { accent: 0xf2a03a, ground: 0x2a2f36, structure: 0xc9d0d6, trim: 0x8a2b2b },
  utility: { accent: 0x59c97b, ground: 0x3a434d, structure: 0x6f7a83, trim: 0xf2c14b },
  transit: { accent: 0xffe9a8, ground: 0x232b33, structure: 0x75828f, trim: 0xdfe6ec },
  rail: { accent: 0x59c97b, ground: 0x3a3d41, structure: 0x8b98a5, trim: 0xf2c14b },
  aviation: { accent: 0xffb13a, ground: 0x2f333a, structure: 0xdfe6ea, trim: 0xc8201c },
  gym: { accent: 0xd8232a, ground: 0xc9a06a, structure: 0x2b3138, trim: 0x3b7bbf },
  warehouse: { accent: 0xf0b323, ground: 0x6d7379, structure: 0x8b929a, trim: 0x2f6f8c },
  fairway: { accent: 0xd8232a, ground: 0x3f8a44, structure: 0x8b6a45, trim: 0xf2c14b },
  // Grounds and landscaping: mowed turf underfoot, a cedar-brown equipment
  // shed or mulch bed for the structure tone, and the safety-orange accent a
  // grounds crew's own machinery and cones already carry.
  grounds: { accent: 0xf07a1f, ground: 0x3c6b2f, structure: 0x6a5138, trim: 0xd8c14b },
};

/** A trade palette by name (construction, marine, clinical, kitchen,
 *  utility, transit, rail, aviation, gym, warehouse, fairway, grounds), each `{ accent, ground,
 *  structure, trim }`. An unknown name falls back to `construction` rather
 *  than throwing — a station that misspells a trade still paints something
 *  coherent instead of going grey. Returns a fresh object every call, so a
 *  caller may tweak its copy without touching the shared table. */
export function palette(name) {
  return { ...(PALETTES[name] ?? PALETTES.construction) };
}

/** The palette names above, for anything that wants to enumerate them
 *  (tools/check_textures.mjs, a station picking a trade at random). */
export const PALETTE_NAMES = Object.keys(PALETTES);
