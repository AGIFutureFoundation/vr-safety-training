// REALISM (docs/consoles/REALISM.md): what each surface is made of. A table of physical material classes (brick,
// concrete, asphalt, metal cladding, wood, stucco, clay tile, glass) with a roughness, a metalness and a detail scale,
// the map from PALETTE's pixel painters (shared/textures.js TX_PX_PAINTERS) and the pattern set's painters to a class,
// and one procedural, tileable detail map (canvas-free value noise, so it paints headless and in a worker alike).
//
// Seam (pure data and one painter; no three.js import, no DOM, no network):
//   RZ_SURFACES[cls] -> { rough, metal, detail, grime, note }      the classes
//   rzSurfaceOf(painterId) -> class id                               PALETTE pixel painter or pattern-set id -> class
//   rzSurfaceFor(painterId) -> RZ_SURFACES entry (falls back to concrete)
//   rzDetailPixels(px, seed) -> Uint8Array RGBA                      R fine grain, G grime blotches, B vertical streaks
//   RZ_DETAIL_TIERS { high: 256, balanced: 0, low: 0 }               detail map size per tier (0: none)
//   rzShade(h, s, streak, cls) -> factor                             the same grime/AO term the shader runs (for checks)
//
// Budgets (stated here, measured by tools/check_rz.mjs): the high tier adds ONE detail map, 256 x 256 RGBA (256 KiB,
// 341 KiB with mipmaps) shared by every textured facade material; balanced adds no texture (grime and contact shading
// only, computed in the shader from the height above the building's base); the phone tier ("low") adds nothing at all.
// No meshes and no triangles are added on any tier. Everything is procedural and generic by kind.

/** Physical classes. rough/metal: the PBR factors on the desktop high tier. detail: the fine map's strength (0..1).
 *  grime: how strongly the class takes ground grime and sill streaks (glass and metal shed it; render and brick hold it). */
export const RZ_SURFACES = {
  brick: { rough: 0.88, metal: 0, detail: 0.22, grime: 1.0, note: "fired clay brick, mortar joints; procedural" },
  concrete: { rough: 0.92, metal: 0, detail: 0.26, grime: 1.0, note: "cast or panel concrete, form ties; procedural" },
  asphalt: { rough: 0.96, metal: 0, detail: 0.34, grime: 0.6, note: "road asphalt, aggregate; procedural" },
  metal: { rough: 0.48, metal: 0.55, detail: 0.14, grime: 0.55, note: "profiled metal cladding; procedural" },
  wood: { rough: 0.78, metal: 0, detail: 0.2, grime: 0.85, note: "painted timber boards and shingles; procedural" },
  stucco: { rough: 0.9, metal: 0, detail: 0.24, grime: 1.0, note: "rendered wall, trowel texture; procedural" },
  tile: { rough: 0.7, metal: 0, detail: 0.18, grime: 0.7, note: "clay roof tile; procedural" },
  glass: { rough: 0.12, metal: 0.25, detail: 0.06, grime: 0.35, note: "glazed curtain wall; procedural" },
};
export const RZ_SURFACE_IDS = Object.keys(RZ_SURFACES);

/** PALETTE pixel painters and pattern-set painters -> class. Anything unlisted reads as concrete. */
export const RZ_PAINTER_SURFACE = {
  // PALETTE pixel painters (pa-palette-data.js PA_TEXTURES)
  clapboard: "wood", shingle: "wood", stucco: "stucco", spanishTile: "tile", brick: "brick", corrugated: "metal",
  concretePanel: "concrete", windowGrid: "glass",
  // the older face painters' tile ids and the pattern set (textures.js PAINTER_TILE_IDS / TX_PAINTER_IDS)
  block: "concrete", concrete: "concrete", asphalt: "asphalt", grating: "metal", woodGrain: "wood", rust: "metal",
  stainless: "metal", plaster: "stucco", hardwoodCourt: "wood", laneAsphalt: "asphalt",
};

export function rzSurfaceOf(painterId) { return RZ_PAINTER_SURFACE[painterId] ?? "concrete"; }
export function rzSurfaceFor(painterId) { return RZ_SURFACES[rzSurfaceOf(painterId)]; }

/** Detail-map edge per tier: the high tier only. */
export const RZ_DETAIL_TIERS = { high: 256, balanced: 0, low: 0 };
/** The grime/contact constants the shader and rzShade() share. */
export const RZ_SHADE = { contactH: 0.9, contactMin: 0.62, grimeH: 2.4, grimeMin: 0.8, floorH: 3.2, sillLo: 0.42, sillHi: 0.74, streak: 0.16 };

function rzHash(x, y, seed) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(seed | 0, 0x9e3779b9);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Tileable value noise at `cells` cells across the tile, sampled at (u, v) in [0, 1). */
function rzNoise(u, v, cells, seed) {
  const x = u * cells, y = v * cells, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const w = (i) => ((i % cells) + cells) % cells;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = rzHash(w(x0), w(y0), seed), b = rzHash(w(x0 + 1), w(y0), seed), c = rzHash(w(x0), w(y0 + 1), seed), d = rzHash(w(x0 + 1), w(y0 + 1), seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
/** The detail map's pixels, deterministic by seed and tileable on both axes. Mean of each channel sits near 0.5. */
export function rzDetailPixels(px = 256, seed = 1) {
  const out = new Uint8Array(px * px * 4);
  for (let y = 0; y < px; y++) for (let x = 0; x < px; x++) {
    const u = x / px, v = y / px;
    const grain = 0.5 * rzNoise(u, v, 64, seed) + 0.3 * rzNoise(u, v, 32, seed + 1) + 0.2 * rzNoise(u, v, 128, seed + 2);
    const blotch = 0.6 * rzNoise(u, v, 4, seed + 3) + 0.4 * rzNoise(u, v, 8, seed + 4);
    const streak = 0.7 * rzNoise(u, v * 0.0 + 0.5, 48, seed + 5) + 0.3 * rzNoise(u, v, 6, seed + 6);
    const i = (y * px + x) * 4;
    out[i] = Math.round(255 * grain); out[i + 1] = Math.round(255 * blotch); out[i + 2] = Math.round(255 * streak); out[i + 3] = 255;
  }
  return out;
}

const rzSmooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** The multiplier the facade shader applies at height h (m above the building's base), for a wall (roof: no streaks).
 *  s: grime blotch 0..1, streak: streak noise 0..1, cls: class id. Mirrors RZ_SHADE_GLSL exactly. */
export function rzShade(h, s = 0.5, streak = 0.5, cls = "concrete", roof = false) {
  const k = RZ_SURFACES[cls]?.grime ?? 1, S = RZ_SHADE;
  const contact = S.contactMin + (1 - S.contactMin) * rzSmooth(0, S.contactH, h);
  const grime = 1 - (1 - (S.grimeMin + (1 - S.grimeMin) * rzSmooth(0, S.grimeH, h))) * (0.6 + 0.8 * s) * k;
  const f = (h / S.floorH) - Math.floor(h / S.floorH);
  const sill = roof || h < S.floorH * 0.9 ? 0 : rzSmooth(S.sillHi, S.sillLo, f) * (f > S.sillLo - 0.1 ? 1 : 0) * S.streak * streak * k;
  return contact * grime * (1 - sill);
}
/** A standalone headset browser keeps the plain path (its look is fixed): the same test the HD modules use. */
export const rzHeadset = (ua = typeof navigator !== "undefined" ? navigator.userAgent : "") => /OculusBrowser|PICO|Quest|Wolvic|Mobile VR/i.test(String(ua || ""));
/** The REALISM level for a tier: "high" (PBR, detail, grime), "balanced" (grime and contact only) or null (phone, headset). */
export function rzLevel(tier, ua) { return rzHeadset(ua) ? null : tier === "high" ? "high" : tier === "balanced" ? "balanced" : null; }

/** The same term in GLSL (h, s, streak, k = class grime, roof flag) -> float. Kept beside rzShade so they match. */
export const RZ_SHADE_GLSL = `float rzShadeF( float h, float s, float st, float k, float roof ) {
  float contact = ${RZ_SHADE.contactMin.toFixed(3)} + ${(1 - RZ_SHADE.contactMin).toFixed(3)} * smoothstep( 0.0, ${RZ_SHADE.contactH.toFixed(3)}, h );
  float grime = 1.0 - ( 1.0 - ( ${RZ_SHADE.grimeMin.toFixed(3)} + ${(1 - RZ_SHADE.grimeMin).toFixed(3)} * smoothstep( 0.0, ${RZ_SHADE.grimeH.toFixed(3)}, h ) ) ) * ( 0.6 + 0.8 * s ) * k;
  float f = fract( h / ${RZ_SHADE.floorH.toFixed(3)} );
  float sill = ( roof > 0.5 || h < ${(RZ_SHADE.floorH * 0.9).toFixed(3)} ) ? 0.0 : ( 1.0 - smoothstep( ${RZ_SHADE.sillLo.toFixed(3)}, ${RZ_SHADE.sillHi.toFixed(3)}, f ) ) * step( ${(RZ_SHADE.sillLo - 0.1).toFixed(3)}, f ) * ${RZ_SHADE.streak.toFixed(3)} * st * k;
  return contact * grime * ( 1.0 - sill );
}`;
