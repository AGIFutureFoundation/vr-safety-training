# RELIEF — hills where they really are, and Mapbox relief under the maps (console `rl`)

Brief: the owner's RELIEF task over `packs-brief.md`'s Shared rules and `packs-brief-3.md`'s reactor loop. Prefix `rl`,
port 8965. Two parts:

1. **Build time — real hill positions.** Every named hill on the San Francisco and Oakland maps is audited: its public
   name's approximate lon/lat is pushed through that map's fit (`npGeoToXz`) and the hill's `center` moves there when it is
   off by more than its radius; named hills the field contains but the map lacks are added. Names and approximate positions
   only — heights stay schematic map numbers, relative to each other, never a measurement.
2. **Runtime — Mapbox terrain and imagery, token-gated.** `WebXR/shared/rl-relief.js` extends the Mapbox layer to the
   parish engine for any map by its lon/lat box: the satellite drape (one Static Images picture of the box, capped by tier)
   and relief sampled from Mapbox Terrain-RGB tiles, decoded, scaled down into the map's schematic range and blended into
   `npHeightAt` through a new `NP_TERRAIN_HOOKS.relief` hook so pads stay flat and water stays level. Cached per chunk.
   Without a token nothing changes and no request is made. Proved by `tools/check_mapbox.mjs` with a stub fetch.

## Plan

- Audit script (scratch) → `docs/parishes.md` "Hills: approximate positions" table and the moves in the data modules.
- `np-parish.js`: `NP_TERRAIN_HOOKS.relief(parish, x, z) -> metres` (null = unchanged field), added to the dry ground, the
  pad terrace height reads it at the pad's centre, and water beds and wetlands ignore it (water stays level).
- `rl-relief.js` (pure, no three.js, no DOM): `rlDecodeTerrainRgb(r, g, b)`, `rlTilesForBox(box, zoom)`, `rlTileUrl`,
  `rlReliefZoom(parish, tier)`, `rlLoadRelief(parish, { token, fetch, decodeImage, tier })` → a relief sampler with a
  per-chunk grid cache, `rlMountRelief(parish, sampler)` / `rlUnmountRelief()`, `rlDrapeUrl(parish, token, tier)`.
- The parishes app: with a token, await the relief (bounded wait) before the world is built so every feature seats on the
  same ground; the drape uses `rlDrapeUrl` (phone tier: no relief, a smaller image).
- `check_mapbox.mjs`: Terrain-RGB decode of known pixels, no request without a token, the tile list covers the box, the
  blend keeps pads flat and water level, the relief stays inside the schematic range, phone tier requests no relief.

## Cycles

1. Audit every SF/Oakland hill against its public position → the audit prints each hill's offset; moved where off > radius.
   Observed: Bayview Hill (sf-bayview) off 266 > r 230; Adams Point (oak-downtown-lake) off 189 > r 130; Lincoln Highlands
   (oak-fruitvale-estuary) off 491 > r 240. Every other named hill within its radius.
   Moved those three; added 20 named hills inside their fields (table in `docs/parishes.md`). check_parishes' pad rule
   now reads "clear of the hill, or on a terrace at its height" (the owner's rule), because the real Adams Point carries
   the Lakeside Park pad and the real Nob Hill a Marina school pad. First run: 1 fail (Lone Mountain's crown sat inside
   the campus pad's blend, 14.0 m); moved its centre onto the campus pad (41 m, inside approximate) →
   `check_parishes: 19175 passed, 0 failed`; `check_parish_data: … 12130 checks pass, 0 fail`.
2. The engine hook `NP_TERRAIN_HOOKS.relief` + `npGroundRise` (higher of hills and relief; pads terrace at it; water beds
   ignore it) → check_parishes unchanged with the hook unset. Observed: `check_parishes: 19175 passed, 0 failed`.
3. `rl-relief.js` (decode, tiles for any box, tier budget, per-chunk cached sampler, shore fade, all-or-none with a
   timeout) and seven RELIEF checks in `check_mapbox.mjs` with a stub fetch. First run: 2 fails — relief interpolated
   0.17 m onto a water point (grid-cell leak; the bed ignores it — the check now asserts the shore fade is 0 on water
   and the leak is small), and docs/mapbox.md lacked the section. Second run: Orleans' water bed moved at 522,522 — a
   pad's blend owns that water edge (unchanged rule), excluded from the water sample. Third run: pass —
   `RELIEF: Terrain-RGB decodes exactly; no token (or the phone tier) makes no request; 13 maps fit the tile budget by
   their lon/lat box; with a stub service 9 tile requests, relief capped at 58 m; 74 pads stay flat and 446 water
   samples stay level under relief; ≤ 107 chunk grids cached.`
4. Mount in the parishes app (token-gated await before `npBuildParish`; drape capped by tier), bundle list → the bundle
   builds (`[parishes] wrote … 99 modules`) and its module script passes `node --check`; check_parishes passes with the
   app regex widened to `npSatelliteUrl(parish, token[,)]`. Runtime cost measured: a chunk's relief grid 0.7–1.5 ms,
   built once per chunk.

## Seams

- `NP_TERRAIN_HOOKS.relief(parish, x, z) -> metres` (np-parish.js; null = the schematic field) and `npGroundRise(parish, x, z)`.
- `rlPrepareRelief(parish, { token?, tier, fetch?, decodeImage?, timeoutMs? }) -> Promise<sampler | null>`;
  `sampler: { at(x, z), real(lon, lat), stats: { zoom, tiles, lo, hi, scale, cap }, cachedChunks() }`.
- `rlDrapeUrl(parish, token, tier)`, `rlTilesForBox(box, z)`, `rlReliefZoom(box, tier)`, `rlDecodeTerrainRgb(r, g, b)`,
  `rlMountRelief(parish, sampler)`, `rlUnmountRelief()`, `RL_BUDGET`.
- Mounted in `WebXR/parishes/js/app.js` (token-gated await before the world is built; drape capped by tier).

## Evals

- Before (793d16d, browser pass on): `eval_worlds: 18 subjects, mean 98, 11 findings` (SF/Oakland districts 97–100).
- After (twice): `eval_worlds: 18 subjects, mean 97, 11 findings`, but both runs printed `browser pass skipped: listen
  EADDRINUSE … 8990` (another console's eval held the shared port), so every subject lost its loads column; with the
  browser pass off no subject lost a resolves, budget or facts point, and the findings list is unchanged. Re-run on a
  quiet machine at integration.
