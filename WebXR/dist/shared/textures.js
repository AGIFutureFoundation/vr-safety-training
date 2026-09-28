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
// Every canvas this library paints (or is told about through txNoteCanvas()),
// key -> pixels: what textureStats() reports as the page's canvas spend.
const _txPixels = new Map();
let _txPaintSerial = 0;
/** Records a canvas painted outside this library (a fleet livery face, say)
 *  so textureStats() sees the whole page's canvas spend. Same key, counted once. */
export function txNoteCanvas(key, w, h) {
  if (!_txPixels.has(key)) _txPixels.set(key, Math.max(0, w | 0) * Math.max(0, h | 0));
}

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
    txNoteCanvas(o.statKey ?? `paint#${(_txPaintSerial += 1)}`, px, px);
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
  // Only a real texture: a clone's userData is deep-copied through JSON, so a
  // cloned map carries plain-object companions with no .matrix, and handing
  // those to the renderer throws mid-frame (nothing after it is drawn).
  if (QUALITY === "high" && tex?.userData?.bumpMap?.isTexture) {
    extra.bumpMap = tex.userData.bumpMap;
    extra.bumpScale = o.bumpScale ?? 0.015;
  }
  if (QUALITY === "high" && tex?.userData?.roughnessMap?.isTexture) {
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
  // Team PALETTE's pattern set (see "pattern set" at the end of this file),
  // each known by the id the mobile-look brief names it.
  txTeakDeckFace: "teakDeck", txHullStripeFace: "hullStripe", txNonSkidFace: "nonSkid",
  txHarbourWaterFace: "harbourWater", txCausticSeabedFace: "causticSeabed", txKelpBladeFace: "kelpBlade",
  txReefRockFace: "reefRock", txCrosswalkFace: "crosswalk", txLaneAsphaltFace: "laneAsphalt",
  txBrickPaverFace: "brickPaver", txTileMosaicFace: "tileMosaic", txCorrugatedRoofFace: "corrugatedRoof",
  txGlassCurtainWallFace: "glassCurtainWall", txStuccoWarmFace: "stuccoWarm", txTurfStripeFace: "turfStripe",
  txSailClothFace: "sailCloth", txCanopyFabricFace: "canopyFabric", txRustPatinaFace: "rustPatina",
  txSafetyChevronFace: "safetyChevron", txSignageEnamelFace: "signageEnamel",
};
/** The thirty-nine manifest ids above (nineteen surface painters and the twenty-pattern set), for tools/check_textures.mjs and anything
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
  // Postal and mail processing: dock-grey concrete underfoot, a plant's own
  // steel-grey structure, a carrier-blue accent and a hazard-red trim for
  // LOTO and permit signage.
  postal: { accent: 0x2f6fb0, ground: 0x585d62, structure: 0x9aa1a8, trim: 0xd8232a },
};

/** A trade palette by name (construction, marine, clinical, kitchen,
 *  utility, transit, rail, aviation, gym, warehouse, fairway, grounds,
 *  postal), each `{ accent, ground, structure, trim }`. An unknown name
 *  falls back to `construction` rather than throwing — a station that
 *  misspells a trade still paints something coherent instead of going grey.
 *  Returns a fresh object every call, so a caller may tweak its copy without
 *  touching the shared table. */
export function palette(name) {
  return { ...(PALETTES[name] ?? PALETTES.construction) };
}

/** The palette names above, for anything that wants to enumerate them
 *  (tools/check_textures.mjs, a station picking a trade at random). */
export const PALETTE_NAMES = Object.keys(PALETTES);

// ============================================================ pattern set
//
// Team PALETTE's pattern library (tools/briefs/mobile-look-brief.md): twenty
// named painters for the open worlds — the yacht's deck and hull, the bay's
// water, the Deep's seabed, kelp and reef, the city's roads, pavers, roofs,
// curtain walls and stucco, the park's turf, sails, awnings, weathered steel,
// chevrons and enamel signs. Unlike the painters above, every one of these is
// deterministic: its grain comes from txRng(o.seed), never Math.random(), so
// the same seed paints the same pixels on every device and in every checker
// run. Colours come from the painter's options, or from a TX palette passed
// as `o.pal` (txPalette(name)), so one painter serves day, dusk and night.
// Every pitch divides the canvas, so each tiles like the painters above.
//
// txTexture(id, o) is the one way the worlds reach them: a shared cache keyed
// by painter + resolution + palette (+ seed and options) that never paints
// the same canvas twice — a second tiling of the same canvas is a clone that
// shares its image — at the resolution tier's own size (TX_TIER_RES: low
// 256, mid 512, high 1024; a phone is the low tier). textureStats() reports
// what has been painted: canvases and total pixels.

/** A small seeded PRNG (mulberry32): same seed, same sequence, anywhere. */
export function txRng(seed = 1) {
  let a = (Math.floor(seed) >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** 0xRRGGBB (times k, clamped) -> "rgba(r,g,b,a)". */
function txCss(hexv, k = 1, a = 1) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgba(${c((hexv >> 16) & 255)},${c((hexv >> 8) & 255)},${c(hexv & 255)},${a})`;
}
/** Seeded speckle: `n` small rects of one tone, sized to the canvas. */
function txSpeckle(g, w, h, r, n, rgb, alpha, size = 1.5) {
  const s = Math.max(1, (size * Math.max(w, h)) / 256);
  g.fillStyle = `rgba(${rgb},${alpha})`;
  for (let i = 0; i < n; i++) g.fillRect(r() * w, r() * h, s * (0.6 + r()), s * (0.6 + r()));
}
/** How many speckles a painter lays at this size (scaled from 256 px). */
function txDensity(w, h, per256) { return Math.round(per256 * (w * h) / 65536); }

/** Teak deck planking: pale planks with staggered butt joints and black caulk seams. */
export function txTeakDeckFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 11), planks = o.planks ?? 8, pw = w / planks;
  const tones = o.tones ?? [0xb8935e, 0xaa8452, 0xc09b66, 0xb08a58];
  g.fillStyle = "#1c1a17"; g.fillRect(0, 0, w, h);
  const seam = Math.max(1, w / 256);
  for (let i = 0; i < planks; i++) {
    const joint = (((i * 3) % 4) / 4) * h;
    for (const [y0, y1] of [[0, joint], [joint, h]]) {
      if (y1 - y0 < 1) continue;
      g.fillStyle = txCss(tones[Math.floor(r() * tones.length)], 0.94 + r() * 0.12);
      g.fillRect(i * pw + seam, y0 + seam, pw - seam * 2, y1 - y0 - seam * 2);
    }
    for (let s = 0; s < 4; s++) {
      g.fillStyle = `rgba(70,45,20,${(0.08 + r() * 0.08).toFixed(3)})`;
      g.fillRect(i * pw + pw * (0.2 + r() * 0.6), 0, Math.max(1, pw * 0.03), h);
    }
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 400), "60,40,20", 0.12);
}

/** Hull side with a sheer stripe at the top, a boot-top stripe above the
 *  antifouling: `o.hull`, `o.stripe`, `o.bootTop`, `o.bottom` colours. Tiles
 *  along the hull (horizontally) only, by design. */
export function txHullStripeFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 12);
  const hull = o.hull ?? 0xf4f5f2, stripe = o.stripe ?? 0x2b6f9e;
  g.fillStyle = txCss(hull); g.fillRect(0, 0, w, h);
  g.fillStyle = txCss(hull, 0.93); g.fillRect(0, h * 0.5, w, h * 0.28);
  g.fillStyle = txCss(stripe); g.fillRect(0, h * 0.06, w, h * 0.06);
  g.fillStyle = txCss(o.bootTop ?? stripe); g.fillRect(0, h * 0.78, w, h * 0.06);
  g.fillStyle = txCss(o.bottom ?? 0x1a2a3a); g.fillRect(0, h * 0.86, w, h * 0.14);
  txSpeckle(g, w, h, r, txDensity(w, h, 120), "0,0,0", 0.05);
}

/** Diamond non-skid: a lattice of small raised diamonds on a pale deck. */
export function txNonSkidFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 13), base = o.colour ?? 0xdcdcd4, n = o.cells ?? 16, c = w / n;
  g.fillStyle = txCss(base); g.fillRect(0, 0, w, h);
  const rows = Math.max(2, Math.round(c / 2));
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const cx = i * c + c / 2, cy = j * c + c / 2;
    for (let k = 0; k < rows; k++) {
      const t = (k / (rows - 1)) * 2 - 1, half = (1 - Math.abs(t)) * c * 0.32;
      g.fillStyle = txCss(base, t < 0 ? 1.08 : 0.84);
      g.fillRect(cx - half, cy + t * c * 0.32, half * 2, Math.max(1, (c * 0.64) / rows));
    }
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 160), "0,0,0", 0.06);
}

/** Harbour water: layered ripple dashes over a still base, and a sparkle band. */
export function txHarbourWaterFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 14), water = o.water ?? o.pal?.water ?? 0x1d5a78;
  g.fillStyle = txCss(water); g.fillRect(0, 0, w, h);
  const rows = 32, rh = h / rows;
  for (let j = 0; j < rows; j++) {
    g.fillStyle = txCss(water, 0.9 + 0.12 * Math.sin((j / rows) * Math.PI * 4), 0.5);
    g.fillRect(0, j * rh, w, rh);
  }
  for (const [layer, count, len, alpha, tone] of [[0, 90, 0.12, 0.18, "0,0,0"], [1, 120, 0.08, 0.16, "210,232,240"], [2, 60, 0.05, 0.22, "235,245,250"]]) {
    g.fillStyle = `rgba(${tone},${alpha})`;
    const n = txDensity(w, h, count);
    for (let i = 0; i < n; i++) {
      const y = Math.floor(r() * rows) * rh + rh * (0.2 + layer * 0.25);
      g.fillRect(r() * w, y, w * len * (0.5 + r()), Math.max(1, rh * 0.18));
    }
  }
  // The sparkle band: a stretch of bright glints where the low sun catches the chop.
  const band0 = h * (o.sparkleAt ?? 0.42), bandH = h * 0.16;
  g.fillStyle = `rgba(255,250,232,${o.sparkle ?? 0.55})`;
  const glints = txDensity(w, h, 140);
  for (let i = 0; i < glints; i++) {
    const s = Math.max(1, w / 256) * (1 + r() * 2);
    g.fillRect(r() * w, band0 + r() * bandH, s * 2.5, s * 0.6);
  }
}

/** Caustic light over sand: a bright wavering web laid over a sandy floor. */
export function txCausticSeabedFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 15), sand = o.sand ?? o.pal?.sand ?? 0xc8b98a;
  g.fillStyle = txCss(sand); g.fillRect(0, 0, w, h);
  txSpeckle(g, w, h, r, txDensity(w, h, 600), "90,74,44", 0.14);
  txSpeckle(g, w, h, r, txDensity(w, h, 300), "250,240,210", 0.12);
  const lines = o.lines ?? 6, step = Math.max(1, w / 128), lw = Math.max(1, w / 170);
  g.fillStyle = `rgba(${o.light ?? "235,252,245"},${o.intensity ?? 0.32})`;
  for (let i = 0; i < lines; i++) {
    const y0 = (i + 0.5) * (h / lines), amp = (h / lines) * 0.35, f = 1 + (i % 3), ph = r() * Math.PI * 2;
    for (let x = 0; x < w; x += step) g.fillRect(x, y0 + Math.sin((x / w) * Math.PI * 2 * f + ph) * amp, step + 0.5, lw);
    const x0 = (i + 0.5) * (w / lines), f2 = 1 + ((i + 1) % 3), ph2 = r() * Math.PI * 2;
    for (let y = 0; y < h; y += step) g.fillRect(x0 + Math.sin((y / h) * Math.PI * 2 * f2 + ph2) * amp, y, lw, step + 0.5);
  }
}

/** A kelp blade: olive-bronze lamina, darker ruffled margins, a pale midrib. */
export function txKelpBladeFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 16), base = o.colour ?? 0x6b5a26, strips = 16, sw = w / strips;
  for (let i = 0; i < strips; i++) {
    const t = Math.abs((i + 0.5) / strips - 0.5) * 2;
    g.fillStyle = txCss(base, 1.12 - t * 0.4); g.fillRect(i * sw, 0, sw + 0.5, h);
  }
  g.fillStyle = txCss(base, 1.45, 0.8); g.fillRect(w * 0.47, 0, w * 0.06, h);
  const bumps = 12, bh = h / bumps;
  for (let j = 0; j < bumps; j++) {
    g.fillStyle = txCss(base, 0.6, 0.5);
    g.fillRect(0, j * bh, w * (0.06 + r() * 0.05), bh * 0.6);
    g.fillRect(w - w * (0.06 + r() * 0.05), j * bh + bh * 0.4, w * 0.11, bh * 0.6);
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 300), "40,34,10", 0.12);
}

/** Reef rock: dark stone mottled with boulders, crusts of pink coralline and pale barnacles. */
export function txReefRockFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 17), base = o.rock ?? o.pal?.structure ?? 0x4a4a44;
  g.fillStyle = txCss(base); g.fillRect(0, 0, w, h);
  for (let i = 0; i < txDensity(w, h, 70); i++) {
    const s = w * (0.04 + r() * 0.1);
    g.fillStyle = txCss(base, 0.7 + r() * 0.6, 0.55); g.fillRect(r() * w, r() * h, s, s * (0.6 + r() * 0.5));
  }
  const crust = o.crust ?? 0xb86a78;
  for (let i = 0; i < txDensity(w, h, 30); i++) {
    const s = w * (0.02 + r() * 0.05);
    g.fillStyle = txCss(crust, 0.8 + r() * 0.3, 0.45); g.fillRect(r() * w, r() * h, s, s * 0.7);
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 400), "220,215,200", 0.2, 1.2);
  txSpeckle(g, w, h, r, txDensity(w, h, 500), "10,10,10", 0.2);
}

/** Zebra crosswalk: bold white bars across dark asphalt, worn where wheels run. */
export function txCrosswalkFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 18), bars = o.bars ?? 6, bw = w / bars;
  g.fillStyle = o.base ?? "#2c2e30"; g.fillRect(0, 0, w, h);
  txSpeckle(g, w, h, r, txDensity(w, h, 700), "0,0,0", 0.2);
  txSpeckle(g, w, h, r, txDensity(w, h, 300), "170,170,170", 0.12);
  g.fillStyle = o.paint ?? "rgba(238,238,228,0.92)";
  for (let i = 0; i < bars; i++) g.fillRect(i * bw + bw * 0.25, 0, bw * 0.5, h);
  txSpeckle(g, w, h, r, txDensity(w, h, 500), "44,46,48", 0.45, 2);
}

/** Lane asphalt with worn lane paint: dashed dividers, solid edges, wear gaps. */
export function txLaneAsphaltFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 19), lanes = o.lanes ?? 2, lw = w / lanes;
  g.fillStyle = o.base ?? "#2f3133"; g.fillRect(0, 0, w, h);
  txSpeckle(g, w, h, r, txDensity(w, h, 900), "0,0,0", 0.2);
  txSpeckle(g, w, h, r, txDensity(w, h, 400), "180,180,180", 0.1);
  const line = Math.max(1, w * 0.012);
  g.fillStyle = "rgba(10,10,10,0.35)"; g.fillRect(lw * 0.5 - w * 0.03, 0, w * 0.06, h); // wheel-track polish
  g.fillStyle = o.paint ?? "rgba(236,232,214,0.85)";
  for (let i = 1; i < lanes; i++) for (let y = 0; y < h; y += h / 4) g.fillRect(i * lw - line / 2, y, line, h / 8);
  if (o.edge !== false) { g.fillRect(w * 0.02, 0, line, h); g.fillRect(w * 0.98 - line, 0, line, h); }
  txSpeckle(g, w, h, r, txDensity(w, h, 400), "47,49,51", 0.55, 1.6);
}

/** Basket-weave brick pavers: pairs of bricks turning a quarter each cell. */
export function txBrickPaverFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 20), n = o.cells ?? 8, c = w / n;
  const tones = o.tones ?? [0x9c4e36, 0xa8583c, 0x8f4530, 0xb0654a];
  g.fillStyle = o.joint ?? "#7a7266"; g.fillRect(0, 0, w, h);
  const j = Math.max(1, c * 0.05);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const flip = (x + y) % 2;
    for (let k = 0; k < 2; k++) {
      g.fillStyle = txCss(tones[Math.floor(r() * tones.length)], 0.92 + r() * 0.14);
      if (flip) g.fillRect(x * c + (k * c) / 2 + j, y * c + j, c / 2 - j * 2, c - j * 2);
      else g.fillRect(x * c + j, y * c + (k * c) / 2 + j, c - j * 2, c / 2 - j * 2);
    }
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 300), "30,16,10", 0.12);
}

/** Tile mosaic: small tesserae in a warm market-square palette on pale grout. */
export function txTileMosaicFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 21), n = o.cells ?? 16, c = w / n;
  const tones = o.tones ?? [0xd9774a, 0xe6b35a, 0x3f8a8c, 0xf2e6c8, 0xb8563a, 0x2f6f8c];
  g.fillStyle = o.grout ?? "#e4ddd0"; g.fillRect(0, 0, w, h);
  const j = Math.max(1, c * 0.08);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const border = x % 8 === 0 || y % 8 === 0;
    g.fillStyle = txCss(border ? tones[0] : tones[Math.floor(r() * tones.length)], 0.9 + r() * 0.15);
    g.fillRect(x * c + j, y * c + j, c - j * 2, c - j * 2);
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 120), "0,0,0", 0.06);
}

/** Corrugated roof sheet: ribs running across the fall, fixings and rust runs. */
export function txCorrugatedRoofFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 22), colour = o.colour ?? 0x8a9097, ribs = o.ribs ?? 16, rh = h / ribs;
  g.fillStyle = txCss(colour); g.fillRect(0, 0, w, h);
  for (let i = 0; i < ribs; i++) {
    g.fillStyle = txCss(colour, 1.2, 0.6); g.fillRect(0, i * rh, w, rh * 0.25);
    g.fillStyle = txCss(colour, 0.7, 0.6); g.fillRect(0, i * rh + rh * 0.55, w, rh * 0.25);
  }
  g.fillStyle = "rgba(40,40,40,0.5)";
  const s = Math.max(1, w / 200);
  for (let i = 0; i < ribs; i += 4) for (let x = 0; x < 8; x++) g.fillRect((x + 0.5) * (w / 8), i * rh + rh * 0.1, s * 2, s * 2);
  for (let i = 0; i < 6; i++) {
    g.fillStyle = `rgba(150,74,30,${(0.12 + r() * 0.12).toFixed(3)})`;
    g.fillRect(r() * w, 0, w * (0.005 + r() * 0.01), h);
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 200), "0,0,0", 0.08);
}

/** Glass curtain wall: heavy mullions, light transoms, sky reflections and a few lit panes. */
export function txGlassCurtainWallFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 23), cols = o.cols ?? 6, rows = o.rows ?? 8;
  const glass = o.glass ?? o.pal?.glass ?? 0x2a4a5e, frame = o.frame ?? 0x9aa4ab;
  g.fillStyle = txCss(frame, 0.8); g.fillRect(0, 0, w, h);
  const cw = w / cols, rh = h / rows, m = Math.max(1, cw * 0.07), t = Math.max(1, rh * 0.04);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const lit = r() < (o.lit ?? 0.12);
    g.fillStyle = lit ? "rgba(255,226,160,0.95)" : txCss(glass, 0.85 + r() * 0.3);
    g.fillRect(x * cw + m, y * rh + t, cw - m * 2, rh - t * 2);
    if (!lit) { g.fillStyle = "rgba(200,225,240,0.18)"; g.fillRect(x * cw + m, y * rh + t, cw - m * 2, (rh - t * 2) * 0.35); }
  }
  // Diagonal reflection streaks, drawn as stepped rects that wrap so they tile.
  g.fillStyle = "rgba(230,242,250,0.10)";
  const step = Math.max(2, h / 64);
  for (const x0 of [0.15, 0.55]) for (let y = 0; y < h; y += step) g.fillRect((x0 * w + y * 0.5) % w, y, w * 0.08, step);
  g.fillStyle = txCss(frame, 1.1);
  for (let x = 0; x <= cols; x++) g.fillRect(x * cw - m / 2, 0, m, h);
}

/** Warm stucco: sun-warmed plaster, trowel mottle and fine sand grain. */
export function txStuccoWarmFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 24), base = o.base ?? 0xe0b98a;
  g.fillStyle = txCss(base); g.fillRect(0, 0, w, h);
  for (let i = 0; i < txDensity(w, h, 50); i++) {
    const s = w * (0.05 + r() * 0.12);
    g.fillStyle = txCss(base, 0.9 + r() * 0.2, 0.35); g.fillRect(r() * w, r() * h, s * 1.6, s);
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 700), "120,90,50", 0.1);
  txSpeckle(g, w, h, r, txDensity(w, h, 300), "255,248,230", 0.12);
}

/** Turf mow stripes: alternating light and dark bands with blade speckle. */
export function txTurfStripeFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 25), n = o.stripes ?? 8, sw = h / n;
  const a = o.a ?? 0x4f9a48, b = o.b ?? 0x3f8440;
  for (let i = 0; i < n; i++) { g.fillStyle = txCss(i % 2 ? a : b); g.fillRect(0, i * sw, w, sw); }
  const blades = txDensity(w, h, 1200), s = Math.max(1, w / 256);
  for (let i = 0; i < blades; i++) {
    g.fillStyle = r() < 0.5 ? "rgba(20,50,16,0.22)" : "rgba(170,210,120,0.18)";
    g.fillRect(r() * w, r() * h, s, s * (2 + r() * 3));
  }
}

/** Sail cloth: off-white panels with double-stitched seams and a fine weave. */
export function txSailClothFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 26), base = o.colour ?? 0xf1ede2, panels = o.panels ?? 4, ph = h / panels;
  g.fillStyle = txCss(base); g.fillRect(0, 0, w, h);
  const step = Math.max(2, w / 128);
  g.fillStyle = "rgba(0,0,0,0.03)";
  for (let x = 0; x < w; x += step * 2) g.fillRect(x, 0, step, h);
  for (let y = 0; y < h; y += step * 2) g.fillRect(0, y, w, step);
  for (let i = 0; i < panels; i++) {
    g.fillStyle = txCss(base, 0.86); g.fillRect(0, i * ph, w, Math.max(1, h * 0.012));
    g.fillStyle = "rgba(90,90,80,0.35)";
    for (let x = 0; x < w; x += step * 3) { g.fillRect(x, i * ph + h * 0.02, step * 1.5, 1); g.fillRect(x, i * ph + h * 0.03, step * 1.5, 1); }
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 60), "120,110,90", 0.06);
}

/** Canopy fabric: awning stripes with a woven texture and soft fold shading. */
export function txCanopyFabricFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 27), n = o.stripes ?? 8, sw = w / n;
  const a = o.a ?? 0x2f7a6a, b = o.b ?? 0xf2ead8;
  // Laid half a stripe off the edge, so both canvas edges fall mid-stripe in
  // the same colour and the awning repeats without a doubled band.
  for (let i = 0; i <= n; i++) { g.fillStyle = txCss(i % 2 ? b : a); g.fillRect((i - 0.5) * sw, 0, sw, h); }
  const folds = 4, fh = h / folds;
  for (let i = 0; i < folds; i++) { g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(0, i * fh + fh * 0.6, w, fh * 0.4); }
  const step = Math.max(2, w / 128);
  g.fillStyle = "rgba(255,255,255,0.05)";
  for (let y = 0; y < h; y += step * 2) g.fillRect(0, y, w, step * 0.5);
  txSpeckle(g, w, h, r, txDensity(w, h, 100), "0,0,0", 0.05);
}

/** Rust patina: painted steel breaking down into rust blooms and downward runs. */
export function txRustPatinaFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 28), paint = o.paint ?? 0x4f6a78;
  g.fillStyle = txCss(paint); g.fillRect(0, 0, w, h);
  for (let i = 0; i < txDensity(w, h, 60); i++) {
    const s = w * (0.02 + r() * 0.08);
    g.fillStyle = r() < 0.5 ? `rgba(168,84,34,${(0.35 + r() * 0.3).toFixed(3)})` : `rgba(120,56,24,${(0.3 + r() * 0.3).toFixed(3)})`;
    g.fillRect(r() * w, r() * h, s, s * (0.5 + r() * 0.6));
  }
  for (let i = 0; i < 10; i++) {
    g.fillStyle = `rgba(140,66,26,${(0.1 + r() * 0.15).toFixed(3)})`;
    g.fillRect(r() * w, 0, Math.max(1, w * (0.004 + r() * 0.01)), h);
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 600), "60,30,12", 0.16);
}

/** Safety chevrons: bold V bands, amber on black by default (`o.a`/`o.b`). */
export function txSafetyChevronFace(g, w, h, o = {}) {
  const a = o.a ?? "#f2c14b", b = o.b ?? "#1a1a1a", n = o.bands ?? 4, p = h / n;
  g.fillStyle = b; g.fillRect(0, 0, w, h);
  g.fillStyle = a;
  const step = Math.max(1, Math.round(w / 128));
  for (let x = 0; x < w; x += step) {
    const off = (Math.abs(x + step / 2 - w / 2) * (2 * h)) / w / n;
    for (let k = 0; k < n; k++) {
      const y = ((k * p + off) % h + h) % h;
      g.fillRect(x, y, step, p / 2);
      if (y + p / 2 > h) g.fillRect(x, y - h, step, p / 2);
    }
  }
}

/** A blank vitreous-enamel sign plate: gloss field, white keyline, corner
 *  rivets, and `o.text` lettered across it when given. */
export function txSignageEnamelFace(g, w, h, o = {}) {
  const r = txRng(o.seed ?? 29), bg = o.bg ?? o.pal?.accents?.[0] ?? 0x0072b2;
  g.fillStyle = txCss(bg, 0.8); g.fillRect(0, 0, w, h);
  g.fillStyle = txCss(bg); g.fillRect(w * 0.03, h * 0.03, w * 0.94, h * 0.94);
  g.fillStyle = o.keyline ?? "rgba(245,245,238,0.95)";
  const k = Math.max(1, w * 0.018);
  g.fillRect(w * 0.08, h * 0.08, w * 0.84, k); g.fillRect(w * 0.08, h * 0.92 - k, w * 0.84, k);
  g.fillRect(w * 0.08, h * 0.08, k, h * 0.84); g.fillRect(w * 0.92 - k, h * 0.08, k, h * 0.84);
  g.fillStyle = "rgba(255,255,255,0.10)"; g.fillRect(w * 0.03, h * 0.03, w * 0.94, h * 0.3);
  g.fillStyle = "rgba(200,205,210,0.9)";
  const rv = Math.max(2, w * 0.03);
  for (const [x, y] of [[0.05, 0.05], [0.95, 0.05], [0.05, 0.95], [0.95, 0.95]]) g.fillRect(x * w - rv / 2, y * h - rv / 2, rv, rv);
  if (o.text && typeof g.fillText === "function") {
    g.fillStyle = "#f5f5ee"; g.font = `700 ${Math.round(h * 0.28)}px Arial, sans-serif`;
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(o.text).slice(0, 24), w / 2, h / 2);
  }
  txSpeckle(g, w, h, r, txDensity(w, h, 30), "0,0,0", 0.08);
}

/** The pattern set by manifest id — the id PAINTER_IDS, manifest.json and
 *  txTexture() all use. */
export const TX_PAINTERS = {
  teakDeck: txTeakDeckFace, hullStripe: txHullStripeFace, nonSkid: txNonSkidFace,
  harbourWater: txHarbourWaterFace, causticSeabed: txCausticSeabedFace, kelpBlade: txKelpBladeFace,
  reefRock: txReefRockFace, crosswalk: txCrosswalkFace, laneAsphalt: txLaneAsphaltFace,
  brickPaver: txBrickPaverFace, tileMosaic: txTileMosaicFace, corrugatedRoof: txCorrugatedRoofFace,
  glassCurtainWall: txGlassCurtainWallFace, stuccoWarm: txStuccoWarmFace, turfStripe: txTurfStripeFace,
  sailCloth: txSailClothFace, canopyFabric: txCanopyFabricFace, rustPatina: txRustPatinaFace,
  safetyChevron: txSafetyChevronFace, signageEnamel: txSignageEnamelFace,
};
export const TX_PAINTER_IDS = Object.keys(TX_PAINTERS);

// --------------------------------------------------------------- palettes
//
// World palettes for the open worlds, and a colour-blind-safe accent set
// (the Okabe–Ito hues plus black and white). Each palette lists which of
// those accents it uses; txPaletteContrast() holds every listed accent to a
// WCAG contrast of at least 3:1 against the palette's ground, which is what
// tools/check_textures.mjs asserts for every palette.
export const TX_ACCENTS = {
  orange: 0xe69f00, sky: 0x56b4e9, green: 0x009e73, yellow: 0xf0e442,
  blue: 0x0072b2, vermillion: 0xd55e00, purple: 0xcc79a7, black: 0x000000, white: 0xffffff,
};
const TX_PALETTES = {
  "bayworld-day": { ground: 0x3c6b2f, water: 0x2a6a88, sand: 0xd8c79a, structure: 0x8b929a, trim: 0xdfe6ec, glass: 0x3a6a88, accents: ["yellow", "white", "black"] },
  "bayworld-dusk": { ground: 0x2e3a2c, water: 0x2a4258, sand: 0xa8906a, structure: 0x6a5a5e, trim: 0xe6b98f, glass: 0x5a4a62, accents: ["yellow", "orange", "sky", "white"] },
  "bayworld-night": { ground: 0x141c22, water: 0x0f2230, sand: 0x5a5448, structure: 0x2b3542, trim: 0x8b98a5, glass: 0x16232c, accents: ["yellow", "orange", "sky", "purple", "white"] },
  regatta: { ground: 0x1d5a78, water: 0x1d5a78, sand: 0xd8c79a, structure: 0xf4f5f2, trim: 0x2b6f9e, glass: 0x2a4a5e, accents: ["yellow", "orange", "white"] },
  "deep-shallow": { ground: 0x2a6a6e, water: 0x2a6a6e, sand: 0xc8b98a, structure: 0x5a5a4e, trim: 0x8a7a3a, glass: 0x2a4a5e, accents: ["yellow", "white", "black"] },
  "deep-mid": { ground: 0x1c3f4a, water: 0x1c3f4a, sand: 0x8a8468, structure: 0x46504a, trim: 0x6b5a26, glass: 0x1c3040, accents: ["yellow", "orange", "sky", "white"] },
  "deep-deep": { ground: 0x0a161e, water: 0x0a161e, sand: 0x4a4a40, structure: 0x2e3432, trim: 0x3a3420, glass: 0x0a161e, accents: ["yellow", "orange", "sky", "purple", "white"] },
};
export const TX_PALETTE_NAMES = Object.keys(TX_PALETTES);
/** A world palette by name — `{ name, ground, water, sand, structure, trim,
 *  glass, accentNames, accents: [0xRRGGBB…] }`. A fresh object every call;
 *  an unknown name falls back to "bayworld-day". */
export function txPalette(name) {
  const known = !!TX_PALETTES[name];
  const p = TX_PALETTES[known ? name : "bayworld-day"];
  return { ...p, name: known ? name : "bayworld-day", accentNames: [...p.accents], accents: p.accents.map((a) => TX_ACCENTS[a]) };
}
function txLinear(c) { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }
/** WCAG relative luminance of 0xRRGGBB. */
export function txLuminance(c) { return 0.2126 * txLinear((c >> 16) & 255) + 0.7152 * txLinear((c >> 8) & 255) + 0.0722 * txLinear(c & 255); }
/** WCAG contrast ratio of two 0xRRGGBB colours (1..21). */
export function txContrast(a, b) {
  const x = txLuminance(a), y = txLuminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** Every accent of a palette against its ground: `{ ok, worst, pairs }`,
 *  `ok` when each ratio is at least `min` (3 by default). */
export function txPaletteContrast(name, min = 3) {
  const p = txPalette(name);
  const pairs = p.accentNames.map((a, i) => ({ accent: a, ratio: +txContrast(p.accents[i], p.ground).toFixed(2) }));
  const worst = pairs.reduce((m, q) => Math.min(m, q.ratio), Infinity);
  return { ok: pairs.length > 0 && worst >= min, worst, pairs };
}

// ------------------------------------------------------------ the cache
/** Canvas size per resolution tier: a phone is "low". */
export const TX_TIER_RES = { low: 256, mid: 512, high: 1024 };
/** The tier this page paints at: "low" headless or on a phone
 *  (QUALITY "low"), "mid" for a 512 px TEXTURE_RES, "high" otherwise. */
export function txTier() {
  if (TEXTURE_RES <= 256 || QUALITY === "low") return "low";
  return TEXTURE_RES >= 1024 ? "high" : "mid";
}
/** Caps an explicit canvas size at the page's tier, so a builder that asks
 *  for 512 px still paints 256 on a phone. */
export function txTierPx(px) { return Math.max(16, Math.min(px, TX_TIER_RES[txTier()])); }
const _txCanvases = new Map();   // canvas key -> CanvasTexture (one canvas each)
const _txTiled = new Map();      // canvas key + repeat -> texture sharing that canvas
let _txHits = 0, _txMisses = 0;
/**
 * A tileable texture from the pattern set: `id` a TX_PAINTER_IDS entry, `o`
 * { palette (name), tier, px, scale (fraction of the tier size), repeat
 * (number or [u, v]), seed, …painter options }. Painted once per painter +
 * resolution + palette (+ seed and options); every other request for that
 * canvas — any repeat — reuses it.
 */
export function txTexture(id, o = {}) {
  const draw = TX_PAINTERS[id];
  if (!draw) throw new Error(`textures: unknown pattern "${id}"`);
  const tier = TX_TIER_RES[o.tier] ? o.tier : txTier();
  const px = Math.max(32, Math.min(TX_TIER_RES[tier], o.px ?? Math.round(TX_TIER_RES[tier] * (o.scale ?? 1))));
  const pal = o.palette ? txPalette(o.palette) : null;
  const { palette: _p, tier: _t, px: _x, scale: _s, repeat: _r, ...paint } = o;
  const key = `${id}|${px}|${pal?.name ?? "-"}|${JSON.stringify(paint)}`;
  const rep = Array.isArray(o.repeat) ? o.repeat : [o.repeat ?? 1, o.repeat ?? 1];
  const tiledKey = `${key}|${rep[0]}x${rep[1]}`;
  const tiled = _txTiled.get(tiledKey);
  if (tiled) { _txHits += 1; return tiled; }
  let base = _txCanvases.get(key);
  if (base) _txHits += 1;
  else {
    _txMisses += 1;
    base = paintTexture((g, w, h) => draw(g, w, h, { ...paint, pal }), { px, repeat: 1, detail: false, statKey: `tx|${key}` });
    if (base.userData) base.userData.txPattern = id;
    _txCanvases.set(key, base);
  }
  const tex = (rep[0] === 1 && rep[1] === 1) || typeof base.clone !== "function" ? base : base.clone();
  if (tex !== base && base.userData) tex.userData = { ...base.userData };   // share, never JSON-copy, the companions
  if (tex !== base && THREE.RepeatWrapping !== undefined) { tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; }
  tex.repeat?.set?.(rep[0], rep[1]);
  _txTiled.set(tiledKey, tex);
  return tex;
}
const _txSharedMats = new Map();
/** One shared material per pattern + options, NOT flagged ownMaterial, so
 *  every mesh that wears it (a kelp forest's blades, a reef's boulders)
 *  still merges into one draw under kit.js's mergeStatic(). */
export function txSharedMat(id, o = {}, m = {}) {
  const key = `${id}|${JSON.stringify(o)}|${JSON.stringify(m)}`;
  let mat = _txSharedMats.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({
      map: txTexture(id, o), color: m.color ?? 0xffffff, roughness: m.rough ?? 0.9, metalness: m.metal ?? 0,
      transparent: (m.opacity ?? 1) < 1, opacity: m.opacity ?? 1,
    });
    mat.userData.txShared = key;
    _txSharedMats.set(key, mat);
  }
  return mat;
}
/** A painted material from the pattern set: txTexture() + paintedMat(). */
export function txMaterial(id, o = {}, m = {}) { return paintedMat(txTexture(id, o), m); }
/** What the page has painted: `{ canvases, pixels, megapixels, patterns,
 *  hits, misses, tier }` — `canvases`/`pixels` cover every canvas painted
 *  through this library (facePaint(), paintTexture(), txTexture()) or
 *  noted with txNoteCanvas() (the fleet's livery faces). */
export function textureStats() {
  let pixels = 0;
  for (const v of _txPixels.values()) pixels += v;
  return { canvases: _txPixels.size, pixels, megapixels: +(pixels / 1e6).toFixed(3), patterns: _txCanvases.size, hits: _txHits, misses: _txMisses, tier: txTier() };
}
/** Empties the pattern cache and the stats — test harnesses only. */
export function txResetTextures() { _txCanvases.clear(); _txTiled.clear(); _txPixels.clear(); _txSharedMats.clear(); _txHits = 0; _txMisses = 0; }
