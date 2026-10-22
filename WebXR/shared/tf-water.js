// TERRAFORM's import-free half (console TERRAFORM, docs/consoles/TERRAFORM.md): the shared wind field and the water
// ripple, so any world (the parishes, Redwood Reach's creek and river) can read the same wind and animate its water
// without the parish engine.
//
// Seams:
//   tfWind(t, seed = 1)          -> { dir: [x, z], speed, gust }   a veering wind with gusts (speed m/s, gust 0..1)
//   tfWindAt(x, z, t, seed = 1)  -> number 0..1                   the wind's strength at a point (gust waves travel)
//   tfMotion(reduced, t)         -> { t, sway, flow }             all zero under reduced motion: a still world
//   tfAnimateWater(THREE, material, { flow: [x, z], reduced }) -> uniforms   a cheap ripple scrolling downstream
//
// Deterministic: no Math.random; the same seed gives the same wind. Every top-level name is prefixed tf/TF_.

const tfwClamp = (v, a, b) => (v < a ? a : v > b ? b : v);
/** A small seeded RNG (mulberry32), the engine's own recipe. */
function tfwRng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const tfwSeedOf = (s) => [...String(s)].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 2166136261);

// ------------------------------------------------------------------ wind

/** The shared wind at time t (seconds): a slowly veering direction, a speed in m/s and a gust 0..1. Same seed, same wind. */
export function tfWind(t, seed = 1) {
  const r = tfwRng(tfwSeedOf(`wind-${seed}`));
  const a0 = r() * Math.PI * 2, s1 = r() * 6.28, s2 = r() * 6.28, s3 = r() * 6.28, s4 = r() * 6.28, s5 = r() * 6.28;
  const a = a0 + 0.35 * Math.sin(t * 0.013 + s1) + 0.2 * Math.sin(t * 0.031 + s2);
  const g = 0.5 + 0.5 * (0.6 * Math.sin(t * 0.37 + s3) + 0.4 * Math.sin(t * 0.91 + s4));
  const gust = tfwClamp(g * g, 0, 1);
  return { dir: [Math.cos(a), Math.sin(a)], speed: 3 + 2 * Math.sin(t * 0.05 + s5) + 4 * gust, gust };
}

/** The wind's strength 0..1 at (x, z): the gust plus waves that travel downwind across the grass. */
export function tfWindAt(x, z, t, seed = 1) {
  const w = tfWind(t, seed);
  const along = (x * w.dir[0] + z * w.dir[1]) / 38 - t * w.speed / 38;
  const across = (x * -w.dir[1] + z * w.dir[0]) / 120;
  return tfwClamp(0.3 + 0.35 * w.gust + 0.25 * Math.sin(along * 2.1) + 0.1 * Math.sin(across + t * 0.2), 0, 1);
}

/** What moves: under reduced motion the world holds still (no sway, no ripple scroll, no flow drift). */
export function tfMotion(reduced, t) { return reduced ? { t: 0, sway: 0, flow: 0 } : { t, sway: 1, flow: 1 }; }

/** prefers-reduced-motion, guarded (a still world when it is set). */
export function tfReducedMotion() {
  try { return !!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches; } catch { return false; }
}

/**
 * Animate a water material in place: a ripple in the diffuse colour that scrolls with `flow` (m/s, world x/z), or with
 * each vertex's `tfFlow` attribute when the geometry carries one. Returns the uniforms; set `uTfTime` each frame
 * (tfMotion keeps it at 0 under reduced motion).
 */
export function tfAnimateWater(THREE, material, { flow = [0.05, 0.02], reduced = false } = {}) {
  const uniforms = { uTfTime: { value: 0 }, uTfFlow: { value: new THREE.Vector2(flow[0], flow[1]) }, uTfStill: { value: reduced ? 1 : 0 } };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vTfXZ;\nvarying vec2 vTfFlow;\n#ifdef TF_FLOW_ATTR\nattribute vec2 tfFlow;\n#endif\nuniform vec2 uTfFlow;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvTfXZ = (modelMatrix * vec4(transformed, 1.0)).xz;\n#ifdef TF_FLOW_ATTR\nvTfFlow = tfFlow;\n#else\nvTfFlow = uTfFlow;\n#endif");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vTfXZ;\nvarying vec2 vTfFlow;\nuniform float uTfTime;")
      .replace("#include <color_fragment>", "#include <color_fragment>\n{ vec2 p = vTfXZ - vTfFlow * uTfTime * 6.0;\n  float r = sin(p.x * 0.23 + p.y * 0.11) * 0.5 + sin(p.x * -0.07 + p.y * 0.31 + 1.7) * 0.35 + sin((p.x + p.y) * 0.53 + uTfTime * 0.6) * 0.15;\n  diffuseColor.rgb *= 0.9 + 0.12 * r; }");
  };
  material.customProgramCacheKey = () => `tf-water-${material.defines?.TF_FLOW_ATTR ? "attr" : "uni"}`;
  material.needsUpdate = true;
  material.userData.tf = uniforms;
  return uniforms;
}

