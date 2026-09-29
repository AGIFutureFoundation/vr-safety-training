# ATMOS — deep environment: weather, light and sound (console `at`, third wave)

Brief: `packs-brief-3.md` (section ATMOS) over `packs-brief.md`'s Shared rules. Prefix `at`, port 8976. Everything here is
procedural: the weather is a seeded pattern (no weather record of a real place), the lit windows are a seeded fraction of the
engine's generic massing, and the soundscape is synthesised with Web Audio (no audio files, no recordings).

## Modules
- `WebXR/shared/at-atmos.js` — pure: `atWeather`, `atLightsOn`, `atFog`/`atFogHides`, `atLampsForChunk`, `atNearness`,
  `atSoundMix`, `atWeatherOf`, `atSkyKind`, `atDarken`, `AT_BUDGET`.
- `WebXR/shared/at-world.js` — three.js: `atMountAtmos` (one InstancedMesh of lamps: windows, porches, site lights; one
  InstancedMesh of fog-bank sheets over water, none on the phone tier) and `atWetSurface` (the wet-road/puddle shader tweak on
  the existing CITYWORKS street material and the engine's road ribbons — no new meshes).
- `WebXR/shared/at-sound.js` — Web Audio: `atMountSound` / `atBuildGraph` (7 voices: wind, rain, water, traffic, birds,
  crickets, the port's horn; one shared seeded noise buffer, filters and oscillators). Muted by default; refuses to turn on
  under reduced motion.
- Checker `tools/check_atmos.mjs` (in `check_all.mjs` and `docs/perf/checkers-baseline.json`).

## Seams
- `atWeather(parishId, hour, seed = 1, { nearWater }) -> { kind, next, cloud, storm, rain, fog, wet, band, stars, moon }`
- `atLightsOn(hour) -> bool` (on from `AT_DUSK` 18.5 h to `AT_DAWN` 6.25 h)
- `atFog({ weather, band, nearWater, readDistance }) -> { near, far, density }`; `atFogHides(fog, d) -> bool`
- `atMountAtmos({ THREE, root, parish, tier, reduced, seed, massFilter, siteLights, wetMaterials }) -> { update(x, z), set({ hour, weather }), animate(t), counts() }`
- `atWetSurface(THREE, material) -> { uAtWet }`
- `atMountSound({ AudioContext, reduced, seed }) -> { enabled(), setEnabled(on), update(mix, t), graph(), master() }`
- `atSoundMix({ hour, weather, wind, near }) -> { wind, rain, water, traffic, birds, crickets, horn }`
- Reads TERRAFORM's `tfWind` (fog drift, sound wind, rain slant through `tfMountRain`), CITYWORKS' `cwLines`/`cwSegmentGrid`
  (traffic near arterials), `cwMassFilter` (lamps only on massing that stands), the street material (wet sheen) and
  `setNight` (unchanged: street lights at dusk). sky.js's `buildSky` keeps the dome, moon and stars; ATMOS picks its weather
  kind (`atSkyKind`) so a clear night shows them and a storm hides them.
- Mounted: the parishes app (`WebXR/parishes/js/app.js`: the F key gains a sixth weather, "live" = ATMOS's seeded weather; a
  "Sound: off" toggle bottom-right; `window.__parishTest.atmos`), and Redwood Reach (soundscape + toggle).

## Cycles
1. Reason: the pure half + checker prove determinism, dusk/dawn, fog-vs-board, moon/stars, silent audio, budgets. Act: at-atmos.js, at-sound.js, at-world.js, check_atmos.mjs. Observe: `check_atmos: 146 checks, 0 failed (51.8 s)`; worst 201 meshes (orleans/high) of 260, ATMOS adds 1 (phone) / 2 (desktop). PASS.
2. Reason: mount in the parishes app without breaking the engine's budgets or the imports contract. Act: app.js mount (lamps, fog, wet sheen, storm darkening, rain driven by the front, sound toggle). Observe: `check_imports: All 946 modules call only what they declare or import.`; `check_parishes: 12920 passed, 0 failed`. PASS.
3. Reason: Redwood Reach takes the soundscape, and both bundles carry the new modules (the bundler refuses a missing one). Act: at-atmos.js made import-free (engine readers moved to at-world.js), Redwood mount + toggle, `APPS` module lists, bundles rebuilt. Observe: bundler `[parishes] wrote … (2996 KB, 84 modules)`, `[redwood] wrote … (1785 KB, 46 modules)`; `check_atmos: 146 checks, 0 failed (31.3 s)`; `check_imports: All 946 modules …`. PASS.
4. Reason: the real pages boot with ATMOS and no page errors (headless Chromium, port 8976). Act: scratch probe `$SP/packs/atmos/live.mjs`. Observe: sf-marina and orleans (source and dist): lamps 124 / 129 hidden by day, all lit at dusk; night fog 16–317 m (a board at 60 m reads); storm wet 1, rain 250 streaks; `Sound: off`, master 0; Redwood dist `Sound: off`, 74 river points; 0 page errors. PASS.
5. Reason: the shared budgets hold. Observe: `check_budget: All 697 stations inside budget …`; `check_mobile: 158 checks pass …`; `check_fleet: All 143 kit builders render headlessly …`; `check_parishes: 12920 passed, 0 failed`. PASS.
