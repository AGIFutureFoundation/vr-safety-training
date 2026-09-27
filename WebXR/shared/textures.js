import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { gradientFill, noiseTexture, grimeOverlay } from "./kit.js";

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
// host: every pixel comes from gradients, canvas fills and Math.random(),
// exactly like citykit.js's existing pavingFace/deckPlateFace/etc., which
// this library is the general-purpose companion to (those stay put; this
// file is for the surfaces every station shares rather than one district's
// own water or steel).
//
// citykit.js re-exports everything here (`export * from "../../shared/
// textures.js"`) so a SmartCiti.X module that already does
// `import { brickFace } from "./citykit.js"` keeps working; shared modules
// (props.js, fleet.js) that cannot import a smartcity-specific file import
// straight from here.

/** hex 0xRRGGBB * k -> "rgb(r,g,b)", clamped. The tiny local version of
 *  fleet.js's flShade/flCss so this module never has to import fleet.js
 *  either — it is used by shared/props.js and shared/fleet.js in turn. */
function shade(hex, k = 1) {
  const r = Math.max(0, Math.min(255, Math.round(((hex >> 16) & 255) * k)));
  const gr = Math.max(0, Math.min(255, Math.round(((hex >> 8) & 255) * k)));
  const b = Math.max(0, Math.min(255, Math.round((hex & 255) * k)));
  return `rgb(${r},${gr},${b})`;
}

// ---------------------------------------------------------------- caching

const _texCache = new Map();

/**
 * A cached, tileable CanvasTexture from a named face painter. The same
 * (key, px, repeat) returns the SAME CanvasTexture instance instead of
 * drawing its canvas again — a station that paints six identical container
 * walls, or a district that stands a dozen bollards, costs one canvas.
 * Clone the result (`tex.clone()`) before touching `.offset`/`.repeat` if
 * the same painted canvas is needed a second time at a different tiling —
 * the pattern districts.js already uses for its own caustic/water maps.
 */
export function facePaint(key, draw, o = {}) {
  const px = o.px ?? 512;
  const repeat = o.repeat ?? 4;
  const cacheKey = `${key}|${px}|${repeat}`;
  const hit = _texCache.get(cacheKey);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = px; canvas.height = px;
  const g = canvas.getContext("2d");
  draw(g, px, px, o);
  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.RepeatWrapping !== undefined) { tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; }
  tex.repeat?.set?.(repeat, repeat);
  tex.anisotropy = 8;
  if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
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
 * smartcity-specific file just to paint a container wall.
 */
export function paintedMat(tex, o = {}) {
  const m = new THREE.MeshStandardMaterial({
    map: tex, color: o.color ?? 0xffffff, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0.05,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
  });
  m.userData.ownMaterial = true;
  m.userData.ownTexture = true;
  return m;
}

// ---------------------------------------------------------------- painters
//
// Every painter tiles seamlessly: its pattern pitch is chosen to divide the
// canvas an integer number of times, so the left edge always continues the
// pattern the right edge ends on (and the top/bottom the same way). Random
// tone jitter is per-cell, not per-pixel-position, so it does not shift
// between repeats either.

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
  noiseTexture(g, w, h, { density: 1600, alpha: 0.07, tone: "40,22,12" });
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
  noiseTexture(g, w, h, { density: 2200, alpha: 0.1, tone: "20,20,18" });
  grimeOverlay(g, w, h, { blotches: 3, streaks: 2, tone: "12,12,10", alpha: 0.14 });
}

/** Cast concrete: `o.finish` "broom" (default, directional broom striations)
 *  or "smooth" (fine grain only, a trowelled slab or a foundation wall). */
export function concreteFace(g, w, h, o = {}) {
  const tone = o.tone ?? "#8b8d89";
  gradientFill(g, w, h, [[0, tone], [1, o.tone2 ?? "#7d7f7b"]]);
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
  grimeOverlay(g, w, h, { blotches: 2, streaks: 2, tone: "10,10,8", alpha: 0.1 });
}

/** Dark asphalt aggregate; `o.lanes` (count) paints dashed lane lines. */
export function asphaltFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#2c2e30"], [1, o.base2 ?? "#26282a"]]);
  noiseTexture(g, w, h, { density: 5200, alpha: 0.16, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 2400, alpha: 0.09, tone: "190,190,190" });
  if (o.lanes) {
    const lw = w / o.lanes;
    g.fillStyle = "rgba(232,232,222,0.85)";
    for (let i = 1; i < o.lanes; i++) {
      for (let y = 0; y < h; y += h / 4) g.fillRect(i * lw - w * 0.006, y, w * 0.012, h * 0.16);
    }
  }
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
  noiseTexture(g, w, h, { density: 900, alpha: 0.06, tone: "0,0,0" });
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
  noiseTexture(g, w, h, { density: 1400, alpha: 0.08, tone: "0,0,0" });
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
  }
  noiseTexture(g, w, h, { density: 1200, alpha: 0.07, tone: "30,18,8" });
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
  noiseTexture(g, w, h, { density: 500, alpha: 0.04, tone: "0,0,0" });
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
  noiseTexture(g, w, h, { density: 3000, alpha: 0.12, tone: "60,30,10" });
  grimeOverlay(g, w, h, { blotches: 3, streaks: 6, tone: "70,35,12", alpha: 0.2 });
}

/** Loose gravel / crushed aggregate: scattered stone specks, several tones. */
export function gravelFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#6b665c"], [1, o.base2 ?? "#5e5a51"]]);
  const stones = o.stones ?? 900;
  const tones = [ "180,176,166", "140,136,126", "160,150,130", "120,116,108" ];
  for (let i = 0; i < stones; i++) {
    const tone = tones[i % tones.length];
    const s = 1.5 + Math.random() * 3.5;
    g.fillStyle = `rgba(${tone},${(0.35 + Math.random() * 0.35).toFixed(2)})`;
    g.fillRect(Math.random() * w, Math.random() * h, s, s * 0.8);
  }
  noiseTexture(g, w, h, { density: 2000, alpha: 0.08, tone: "0,0,0" });
}

/** Mowed turf: green mottle with a subtle mow-stripe alternation. */
export function grassFace(g, w, h, o = {}) {
  const stripes = o.stripes ?? 8, sw = h / stripes;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle = i % 2 ? (o.a ?? "#3f7a3f") : (o.b ?? "#457f45");
    g.fillRect(0, i * sw, w, sw);
  }
  noiseTexture(g, w, h, { density: 4000, alpha: 0.1, tone: "20,50,20" });
  noiseTexture(g, w, h, { density: 1200, alpha: 0.08, tone: "90,140,70" });
}

/** Fine sand with low wind ripples. */
export function sandFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#d8c79a"], [1, o.base2 ?? "#c9b686"]], { radial: true });
  noiseTexture(g, w, h, { density: 3400, alpha: 0.1, tone: "120,100,60" });
  const step = o.step ?? h / 24;
  for (let y = step / 2; y < h; y += step) {
    g.fillStyle = "rgba(255,250,230,0.08)"; g.fillRect(0, y - 1, w, 2);
    g.fillStyle = "rgba(90,72,40,0.06)"; g.fillRect(0, y + 1, w, 1.5);
  }
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
  noiseTexture(g, w, h, { density: 900, alpha: 0.05, tone: "70,45,15" });
  if (o.line) {
    const ly = h * (o.lineAt ?? 0.5);
    g.fillStyle = o.line;
    g.fillRect(0, ly - h * 0.012, w, h * 0.024);
  }
  // A satin poly finish: a soft sheen band, not a stripe — a court reads wet-look.
  g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(0, 0, w, h * 0.5);
}

/** Painted plaster / stucco: trowelled low-frequency mottle, no coursing. */
export function plasterFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#d8d3c6"], [1, o.base2 ?? "#cdc8bb"]], { radial: true });
  noiseTexture(g, w, h, { density: 2600, alpha: 0.05, tone: "60,55,45" });
  noiseTexture(g, w, h, { density: 700, alpha: 0.04, tone: "255,255,250" });
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
  noiseTexture(g, w, h, { density: 700, alpha: 0.04, tone: "40,45,50" });
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
  // Grounds and landscaping: mowed turf underfoot, a cedar-brown equipment
  // shed or mulch bed for the structure tone, and the safety-orange accent a
  // grounds crew's own machinery and cones already carry.
  grounds: { accent: 0xf07a1f, ground: 0x3c6b2f, structure: 0x6a5138, trim: 0xd8c14b },
};

/** A trade palette by name (construction, marine, clinical, kitchen,
 *  utility, transit, rail, aviation, gym, grounds), each `{ accent, ground,
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
