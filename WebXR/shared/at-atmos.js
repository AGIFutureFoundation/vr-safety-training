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
//   atSoundMix({ hour, weather, wind, near }) -> { wind, rain, water, traffic, birds, crickets, horn }   gains 0..1
//
// Every top-level name is prefixed at/AT_ (the bundler's one scope). Everything here is procedural: no real building,
// no real weather record — the weather is a seeded pattern, and the lit windows are a seeded fraction of generic massing.

// (No imports: the engine-reading helpers atLampsForChunk and atNearness live in at-world.js, so a world without the
// parish engine — Redwood Reach — can take the weather and the sound mix alone.)

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

export const atClamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
/** mulberry32, the engine's recipe. */
export function atRng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const atHash = (s) => [...String(s)].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 2166136261);

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
