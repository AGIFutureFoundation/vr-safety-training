// REALISM (docs/consoles/REALISM.md): light and sky, calibrated. One exposure table: the sun's intensity and colour and
// the sky fill by time of day, and the fog's density by weather, so day, dusk and night each land inside a stated
// exposure range on every weather. Pure data and arithmetic; no three.js import, no DOM, no network.
//
// Seam:
//   RZ_EXPOSURE[band] -> { sun, sunK, sunHex, hemi, elev }    band: dawn | day | dusk | night
//   RZ_FOG_WEATHER[kind] -> far-distance multiplier (1 clear; < 1 thicker), kind: AT_KINDS (clear | overcast | fog | rain | storm)
//   RZ_RANGE[band] -> [lo, hi]                                 the stated exposure range
//   rzExposure(band, dim = 1) -> number                        the exposure index: sun x luminance(sunHex) x sin(elev) + hemi x 0.6, x dim
//   rzLightFor(band, weatherKind, dim) -> { sun, sunHex, hemi, fogFar }   what the page applies (desktop tiers only)
//
// The page applies it on the desktop balanced and high tiers only (shared/rz-surfaces.js rzLevel); the phone tier and a
// headset browser keep their fixed lights (sun 1.1 / 0.6 / 0.12, sky 0.95 / 0.25) exactly.

/** Colour temperature (K) -> 0xRRGGBB, the usual black-body fit (clamped 1000..12000 K). */
export function rzKelvinHex(k) {
  const t = Math.max(1000, Math.min(12000, k)) / 100;
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return (c(r) << 16) | (c(g) << 8) | c(b);
}

/** Sun intensity, colour temperature and elevation (degrees), sky fill, by band. Night's "sun" is the moon. */
export const RZ_EXPOSURE = {
  dawn: { sun: 0.75, sunK: 3400, hemi: 0.7, elev: 9 },
  day: { sun: 1.25, sunK: 5600, hemi: 0.9, elev: 55 },
  dusk: { sun: 0.8, sunK: 2900, hemi: 0.65, elev: 7 },
  night: { sun: 0.16, sunK: 8000, hemi: 0.3, elev: 35 },
};
for (const b of Object.values(RZ_EXPOSURE)) b.sunHex = rzKelvinHex(b.sunK);

/** Fog far-distance multiplier by weather kind (ATMOS's atFog stays the floor: a site board is never lost). */
export const RZ_FOG_WEATHER = { clear: 1, overcast: 0.8, fog: 0.45, rain: 0.65, storm: 0.55 };

/** The stated exposure ranges (dimensionless index; see rzExposure). Day is brightest, night stays walkable. */
export const RZ_RANGE = { day: [1.0, 1.6], dawn: [0.4, 0.95], dusk: [0.35, 0.9], night: [0.12, 0.35] };
/** The weather dim ATMOS applies (atDarken) goes as low as 0.5 in a storm; the ranges hold down to this dim on day and night. */
export const RZ_DIM_FLOOR = { day: 0.8, dawn: 0.8, dusk: 0.8, night: 0.8 };

const rzLum = (hex) => (0.2126 * ((hex >> 16) & 255) + 0.7152 * ((hex >> 8) & 255) + 0.0722 * (hex & 255)) / 255;
/** The exposure index of a band at a weather dim: direct sun on a horizontal surface plus the sky fill. */
export function rzExposure(band, dim = 1) {
  const e = RZ_EXPOSURE[band] ?? RZ_EXPOSURE.day;
  return (e.sun * rzLum(e.sunHex) * Math.sin(e.elev * Math.PI / 180) + e.hemi * 0.6) * dim;
}

/** What the page applies for a band, a weather kind and ATMOS's dim. fogFar multiplies the far distance the page computed. */
export function rzLightFor(band, weatherKind = "clear", dim = 1) {
  const e = RZ_EXPOSURE[band] ?? RZ_EXPOSURE.day;
  return { sun: e.sun * dim, sunHex: e.sunHex, hemi: e.hemi * dim, fogFar: RZ_FOG_WEATHER[weatherKind] ?? 1 };
}
