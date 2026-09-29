// ATMOS's pure half (console ATMOS, docs/consoles/ATMOS.md): the weather a parish is having at an hour, when the lamps
// come on, how thick the fog may get without hiding a site board, which windows and porches glow, and how loud each
// voice of the soundscape should be. No three.js, no Web Audio, no Math.random: the same seed and hour give the same
// answers, so tools/check_atmos.mjs can prove every claim headlessly.
//
// Seams:
//   atWeather(parishId, hour, seed = 1, { nearWater }) -> { kind, cloud, storm, rain, fog, wet, band, stars, moon }
//       hour is continuous world hours (day d, hour h = d * 24 + h); weather changes in AT_SLOT-hour slots, eased
//       between slots so a storm front rolls in rather than switching.
//   atLightsOn(hour) -> bool                       lamps on from AT_DUSK to AT_DAWN
//   atFog({ weather, band, nearWater, readDistance }) -> { near, far, density }   linear scene-fog distances, never
//       dense enough to hide a site board inside its read distance (atFogHides is the proof)
//   atFogHides(fog, distance) -> bool              true if linear fog at `distance` is past half opacity
//   atLampsForChunk(parish, cx, cz, { tier, seed, massFilter }) -> [{ x, y, z, yaw, w, h, kind }]   window, porch lamps
//   atSoundMix({ hour, weather, wind, near }) -> { wind, rain, water, traffic, birds, crickets, horn }   gains 0..1
//   atNearness(parish, x, z) -> { water, arterial, port }   0..1 each, from the engine's water, CITYWORKS' arterials, the port cover
//
// Every top-level name is prefixed at/AT_ (the bundler's one scope). Everything here is procedural: no real building,
// no real weather record — the weather is a seeded pattern, and the lit windows are a seeded fraction of generic massing.

import { NP_SIZE, NP_CHUNK, npMassingForChunk, npWaterAt, npCoverAt } from "./np-parish.js";
import { cwLines, cwSegmentGrid } from "./cw-cityworks.js";

/** Hours: lamps on at dusk, off at dawn; the weather slot length; the board read distance fog must never hide. */
export const AT_DUSK = 18.5;
export const AT_DAWN = 6.25;
export const AT_SLOT = 3;
export const AT_BOARD_READ = 60;
/** The app's time buckets as clock hours (the parishes app cycles dawn → day → dusk → night). */
export const AT_BUCKET_HOUR = { dawn: 6.5, day: 12, dusk: 19, night: 23 };
/** Per-tier caps: lamps (instances of one InstancedMesh) and fog-bank sheets (one InstancedMesh; none on the phone). */
export const AT_BUDGET = { lamps: { low: 180, balanced: 600, high: 1100 }, fogSheets: { low: 0, balanced: 8, high: 14 }, meshes: { low: 1, balanced: 2, high: 2 }, litFraction: 0.32 };
export const AT_KINDS = ["clear", "overcast", "fog", "rain", "storm"];

const atClamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
/** mulberry32, the engine's recipe. */
function atRng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const atHash = (s) => [...String(s)].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 2166136261);

/** Continuous hour → band (the sky.js bands plus dawn). */
export function atBand(hour) {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5 && h < 7) return "dawn";
  if (h >= 7 && h < 18) return "day";
  if (h >= 18 && h < 20) return "dusk";
  return "night";
}

/** Lamps (windows, porches, street and site lights) are on from dusk to dawn. */
export function atLightsOn(hour) {
  const h = ((hour % 24) + 24) % 24;
  return h >= AT_DUSK || h < AT_DAWN;
}

// The slot recipe: fog is likelier at night and dawn over water; storms are rarer and build over a slot.
const AT_RECIPE = {
  clear: { cloud: 0.05, storm: 0, rain: 0, fog: 0, wet: 0 },
  overcast: { cloud: 0.6, storm: 0.1, rain: 0, fog: 0.1, wet: 0.05 },
  fog: { cloud: 0.3, storm: 0, rain: 0, fog: 1, wet: 0.2 },
  rain: { cloud: 0.85, storm: 0.45, rain: 0.7, fog: 0.25, wet: 0.8 },
  storm: { cloud: 1, storm: 1, rain: 1, fog: 0.35, wet: 1 },
};
function atSlotKind(parishId, slot, seed, nearWater) {
  const r = atRng(atHash(`${parishId}|${seed}|${slot}`))();
  const h = (((slot * AT_SLOT) % 24) + 24) % 24;
  const foggy = (h < 9 || h >= 21 ? 0.22 : 0.06) + (nearWater ? 0.12 : 0);
  if (r < foggy) return "fog";
  if (r < foggy + 0.1) return "storm";
  if (r < foggy + 0.22) return "rain";
  if (r < foggy + 0.45) return "overcast";
  return "clear";
}

/** The weather at `hour` (continuous hours) for a parish: deterministic by seed; eased across the last hour of a slot. */
export function atWeather(parishId, hour, seed = 1, { nearWater = false } = {}) {
  const slot = Math.floor(hour / AT_SLOT), into = hour - slot * AT_SLOT;
  const kind = atSlotKind(parishId, slot, seed, nearWater), next = atSlotKind(parishId, slot + 1, seed, nearWater);
  const ease = atClamp(into - (AT_SLOT - 1)); // the front rolls in over the slot's last hour
  const a = AT_RECIPE[kind], b = AT_RECIPE[next], mix = (k) => Math.round((a[k] + (b[k] - a[k]) * ease) * 1000) / 1000;
  const out = { kind, next, cloud: mix("cloud"), storm: mix("storm"), rain: mix("rain"), fog: mix("fog"), wet: 0, band: atBand(hour) };
  // Wet ground lingers: the wettest of this slot and the two before it, drying by a third a slot.
  let wet = mix("wet");
  for (let k = 1; k <= 2; k++) wet = Math.max(wet, AT_RECIPE[atSlotKind(parishId, slot - k, seed, nearWater)].wet * (1 - k / 3));
  out.wet = Math.round(wet * 1000) / 1000;
  const dark = out.band === "night" || out.band === "dusk";
  out.stars = dark ? Math.round(atClamp(1 - out.cloud * 1.2 - out.fog) * 1000) / 1000 : 0;
  out.moon = dark ? Math.round(atClamp(1 - out.cloud * 0.9 - out.fog * 0.8) * 1000) / 1000 : 0;
  return out;
}

/** The sky.js / weather.js kind for an ATMOS weather (so buildSky's dome, clouds, moon and stars agree). */
export function atSkyKind(w) { return w.storm > 0.7 ? "storm" : w.rain > 0.4 ? "rain" : w.fog > 0.6 ? "fog" : w.cloud > 0.45 ? "overcast" : "clear"; }

/** How much a storm darkens the light: 1 in clear weather down to 0.5 under a full storm front. */
export function atDarken(w) { return Math.round((1 - 0.35 * w.cloud * w.cloud - 0.15 * w.storm) * 1000) / 1000; }

/** Linear scene fog: thicker over water and in a fog bank, but the far distance is floored so a board stays legible. */
export function atFog({ weather, band = "day", nearWater = 0, readDistance = AT_BOARD_READ } = {}) {
  const w = weather ?? { fog: 0, rain: 0, storm: 0 };
  const base = band === "night" ? 1600 : band === "dusk" || band === "dawn" ? 1900 : 2200;
  const thick = atClamp(w.fog * (0.75 + 0.25 * nearWater) + w.rain * 0.35 + w.storm * 0.15);
  // At full fog-bank thickness the far distance drops to ~7% of clear, but never below 3× the read distance.
  const far = Math.max(readDistance * 3, Math.round(base * (1 - 0.93 * thick)));
  const near = Math.round(far * (0.12 - 0.08 * thick) * 100) / 100;
  return { near, far, density: Math.round(thick * 1000) / 1000 };
}

/** True if linear fog at `distance` is past half opacity (the board would be lost in it). */
export function atFogHides(fog, distance) {
  if (distance <= fog.near) return false;
  return (distance - fog.near) / Math.max(1e-6, fog.far - fog.near) > 0.5;
}

// Windows: which massing kinds are buildings, their footprint half-sizes (local x, z) and storeys.
const AT_BUILDINGS = {
  quarterBlock: { hx: 8, hz: 6, top: 7, storeys: 2, porch: false },
  gardenHouse: { hx: 6, hz: 5, top: 5.5, storeys: 1, porch: true },
  suburbHouse: { hx: 5, hz: 4.5, top: 4, storeys: 1, porch: true },
  tower: { hx: 11, hz: 11, top: null, storeys: 0, porch: false },
  campusBlock: { hx: 14, hz: 9, top: null, storeys: 0, porch: false },
};

/** One chunk's lit windows and porch lamps: a seeded fraction of each building's window slots, generic by kind. */
export function atLampsForChunk(parish, cx, cz, { tier = "high", seed = 1, massFilter = null } = {}) {
  const spots = npMassingForChunk(parish, cx, cz).filter((s) => AT_BUILDINGS[s.kind] && (!massFilter || massFilter(s)));
  const r = atRng(atHash(`${parish.id}|lamps|${cx},${cz}|${seed}`));
  const frac = AT_BUDGET.litFraction * (tier === "low" ? 0.5 : 1);
  const out = [];
  for (const s of spots) {
    const b = AT_BUILDINGS[s.kind];
    // np-world.js scales these kinds by (s, s, s), or by (s, h, s) for the unit-height tower and campus block.
    const hx = b.hx * s.s, hz = b.hz * s.s;
    const height = b.top === null ? s.h : b.top * s.s;
    const storeys = b.top === null ? Math.max(1, Math.min(12, Math.floor(s.h / 3.5))) : b.storeys;
    const c = Math.cos(s.rot), sn = Math.sin(s.rot);
    const place = (lx, ly, lz, yaw, w, h, kind) => out.push({ x: s.x + lx * c + lz * sn, y: s.y + ly, z: s.z - lx * sn + lz * c, yaw: s.rot + yaw, w, h, kind });
    // Four faces, window columns every ~4 m, one row per storey (towers every ~3.5 m, capped).
    for (const [face, yaw] of [[0, 0], [1, Math.PI / 2], [2, Math.PI], [3, -Math.PI / 2]]) {
      const half = face % 2 === 0 ? hx : hz, depth = (face % 2 === 0 ? hz : hx) + 0.06;
      const cols = Math.max(1, Math.min(8, Math.floor((half * 2) / 4)));
      for (let row = 0; row < storeys; row++) for (let col = 0; col < cols; col++) {
        if (r() > frac) continue;
        const along = -half + (half * 2) * (col + 0.5) / cols, y = Math.min(height - 1, 1.8 + row * 3.4);
        const lx = face === 0 ? along : face === 2 ? -along : face === 1 ? depth : -depth;
        const lz = face === 0 ? depth : face === 2 ? -depth : face === 1 ? -along : along;
        place(lx, y, lz, yaw, 1.1, 1.3, "window");
      }
    }
    if (b.porch && r() < 0.7) place(0, 2.3 * s.s, hz + 0.3, 0, 0.35, 0.35, "porch");
  }
  const cap = Math.ceil(AT_BUDGET.lamps[tier] / 9);
  return out.slice(0, cap);
}

/** How near (0..1) the eye is to water, an arterial and the port, sampled on two rings (cheap: ~17 lookups). */
const atGridCache = new WeakMap();
export function atNearness(parish, x, z) {
  let water = 0, port = 0;
  for (const [rad, wgt] of [[0, 1], [60, 0.8], [140, 0.45]]) {
    const n = rad ? 8 : 1;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2, px = x + Math.cos(a) * rad, pz = z + Math.sin(a) * rad;
      if (Math.abs(px) > NP_SIZE / 2 || Math.abs(pz) > NP_SIZE / 2) continue;
      if (npWaterAt(parish, px, pz)) water = Math.max(water, wgt);
      if (npCoverAt(parish, px, pz) === "port") port = Math.max(port, wgt);
    }
  }
  let grid = atGridCache.get(parish);
  if (!grid) { grid = cwSegmentGrid(cwLines(parish)); atGridCache.set(parish, grid); }
  let arterial = 0;
  for (const s of grid.query(x, z, 90)) {
    if (s.line.cls !== "arterial" && !s.line.named) continue;
    const ax = s.a[0], az = s.a[1], bx = s.b[0], bz = s.b[1], L2 = (bx - ax) ** 2 + (bz - az) ** 2 || 1;
    const t = atClamp(((x - ax) * (bx - ax) + (z - az) * (bz - az)) / L2);
    const d = Math.hypot(x - (ax + (bx - ax) * t), z - (az + (bz - az) * t));
    arterial = Math.max(arterial, atClamp(1 - d / 90));
  }
  return { water, arterial: Math.round(arterial * 1000) / 1000, port };
}

/** The soundscape's gains 0..1 per voice: weather, the hour and what is near. Pure; the audio graph only follows it. */
export function atSoundMix({ hour = 12, weather = null, wind = 0.3, near = { water: 0, arterial: 0, port: 0 } } = {}) {
  const w = weather ?? { rain: 0, storm: 0, fog: 0 };
  const h = ((hour % 24) + 24) % 24, day = h >= 6 && h < 19, dark = h >= 20 || h < 5;
  const wet = atClamp(w.rain + w.storm * 0.3);
  const r3 = (v) => Math.round(atClamp(v) * 1000) / 1000;
  return {
    wind: r3(0.15 + 0.55 * wind + 0.3 * w.storm),
    rain: r3(wet),
    water: r3(near.water * 0.8),
    traffic: r3(near.arterial * (day ? 0.7 : 0.35)),
    birds: r3(day ? 0.5 * (1 - wet) * (1 - near.arterial * 0.5) : 0),
    crickets: r3(dark ? 0.45 * (1 - wet) : 0),
    horn: r3(near.port * (w.fog > 0.5 ? 0.9 : 0.4)),
  };
}

/** An authored weather kind (the app's F key: clear, overcast, fog, wind, storm, rain) as an ATMOS weather at `hour`. */
export function atWeatherOf(kind, hour = 12) {
  const r = AT_RECIPE[kind] ?? (kind === "wind" ? { ...AT_RECIPE.clear, cloud: 0.3, storm: 0.2 } : AT_RECIPE.clear);
  const band = atBand(hour), dark = band === "night" || band === "dusk";
  return { kind: AT_RECIPE[kind] ? kind : "clear", next: kind, ...r, band, stars: dark ? Math.max(0, 1 - r.cloud * 1.2 - r.fog) : 0, moon: dark ? Math.max(0, 1 - r.cloud * 0.9 - r.fog * 0.8) : 0 };
}
