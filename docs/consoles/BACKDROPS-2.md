# Console BACKDROPS-2: satellite backdrops for every map, and real relief (prefix `bd2`, port 9021)

Loop 3. The ask: bake Sentinel-2 backdrops for the 25 maps GEO left without one, under a stated budget, with no real
backdrop for representative or procedural maps; wire GEO's USGS 3DEP relief proof into the engine behind a per-map
opt-in and turn it on for two Louisiana maps where the ground really rises. The user-facing reference is
[docs/geo.md](../geo.md) (§2 budget, §4 relief); GEO's log is [GEO.md](GEO.md).

## What shipped

| Piece | Where |
|---|---|
| The backdrop budget, one file both the bake and the checker read: 2600 KB total, three tiers (`louisiana` 512 px q≤80 ≤90 KB; `wide` ≥ 20 km boxes 384 px q≤70 ≤48 KB; `city` 512 px q≤75 ≤64 KB), and the "none" rule | `tools/geo_budget.json` |
| The bake follows the tier, records it in the sidecar, skips representative/procedural maps, `--regions all`, three months of scenes by default | `tools/geo_bake.py`, `tools/geo_maps.mjs` (box width, flags, `relief`) |
| 22 new backdrops: Orleans, Jefferson, St. Bernard, Plaquemines, St. Tammany, the 9 San Francisco maps, the 4 Oakland maps, San Pablo & Richmond, Downtown San Jose, Strip Marsh East, San Leandro Bay | `WebXR/assets/geo/<map>.jpg` + `.json` |
| No backdrop, and no request, for San Mateo County Bayside (representative), the nutrient pilot (representative) and Unspoken Smiles (procedural) | `geoBackdropAllowed` in `WebXR/shared/geo-locate.js`; the guarded call in `WebXR/parishes/js/app.js` |
| 3DEP relief in the engine, opt-in per map (`relief: "3dep"` + committed grid): `npDemSampler`/`npDemRise`, `npGroundRise` takes the higher of hills and relief, pads terrace, water ignores it, a Mapbox hook never stacks | `WebXR/shared/np-parish.js` (`NP_DEM`) |
| The committed grids in engine form, written from the JSON grids; attached by the registry as `reliefGrid` | `tools/geo_relief.py --module` → `WebXR/shared/bd2-relief-data.js`; `WebXR/shared/np-parishes.js` |
| Relief on: Plaquemine Expansion Site (natural levee ridge, river levees) and Baton Rouge Downtown & Riverfront (riverfront levee, the higher downtown ground) | `np-data-la-shintech-plaquemine.js`, `np-data-br-downtown-riverfront.js`, `WebXR/assets/geo/br-downtown-riverfront.relief.json` |
| Bundles carry the grid module before `np-parishes.js` (instructor, parishes) | `tools/bundle_webxr.py` |
| Detail baselines re-measured for the two relief maps | `tools/detail-baseline.json` (`dt_measure.mjs --missing --engine=7fd84a0d`) |
| Checker: every map (tiers, caps, exclusions, no request, no stray file) and the relief (section 8) | `tools/check_geo.mjs` (146 checks) |

Budget used: 2363 KB of 2600 KB for 43 maps (louisiana 21 maps 1269 KB, city 18 maps 1013 KB, wide 4 maps 81 KB).
Largest new file 61 KB; the page loads only the current map's picture.

## Cycles

1. Reason: the budget has to be one stated rule both the bake and the checker read, and the exclusions must be data
   (flags), not a list. Act: `tools/geo_budget.json` (three tiers + "none"), `tier_for`/`no_backdrop` in the bake,
   `km`/flags in `geo_maps.mjs`; three bake shards in the background. Observe: tier preview put the four parish boxes
   of 33–82 km in `wide`, Orleans and the 17 Bay maps in `city`, and the three representative/procedural maps in none.
2. Reason: relief must be in the engine for every consumer (app, check_parishes, detail measure) without a mount step,
   so attach the committed grid through the registry and scale it inside `npGroundRise`. Act: `npDemSampler` in
   np-parish.js (RELIEF's constants, percentile range, per-chunk node grid with shore fade), `bd2-relief-data.js`,
   the registry attach, `relief: "3dep"` on Plaquemine and Baton Rouge downtown (chosen from four 3DEP grids baked to
   scratch; both show a real ridge beside the river). Observe: rise 0..3 m on both, sampler 150–220 ms for a full 64 x 64
   sweep; check_parishes 62985 passed, 0 failed; check_terraform 552877 checks, 0 failed.
3. Reason: re-measure the detail baselines on the relief ground and keep check_detail green. Act: dropped the two rows,
   `dt_measure.mjs --missing --engine=7fd84a0d`. Observe: Plaquemine +1 instance per tier, Baton Rouge unchanged;
   check_detail 467 pass, 0 fail. Committed 7fd84a0d.
4. Reason: the checker must cover every map and prove the exclusions, not only the Louisiana set. Act: check_geo section 7
   rewritten over the registry and the budget file (tier size/quality/cap, local cloud, per-tier totals, no file and no
   request for excluded maps, no stray picture), `geoBackdropAllowed` and the guarded app call; section 8 for the relief.
   Observe: 141 pass / 5 fail — two bakes still running (expected) and "no rise under open water" failed on both relief
   maps: the bilinear node grid gives a small rise at points just inside a bank.
5. Reason: what must hold is the water's height, not the sampler's value at a wet point (npHeightAt replaces the ground
   under water). Act: the check now compares npHeightAt at every water sample with and without the grid. Observe: 143
   pass, 3 fail (only the two unfinished bakes). Committed 2012ab06.
6. Reason: prove the rebuilt bundles run and the page requests nothing for an excluded map. Act: bundled instructor and
   parishes (the bundler's import check passes with the grid module listed), headless run on port 9021 with the vendored
   three.js. Observe: Plaquemine and Marina load with 0 page errors and fetch their own backdrop; San Mateo Bayside makes
   no geo request. Dist restored (the gate regenerates it).
7. Reason: finish the set. Act: Plaquemines (4 tiles) and St. Tammany (2 tiles) baked, 20 and 19 KB. Observe: check_geo 146
   passed, 0 failed · 43/43 backdrops (21/21 Louisiana), 3 maps with none, 2363 KB of 2600 KB; check_mapbox exit 0.
   Committed c2dea4c9.
8. Reason: a Bay map's picture must land in its scene frame like the Louisiana ones, and the other budgets must not
   move. Act: headless capture of West Oakland's parish map canvas from the rebuilt bundle; check_parish_data,
   check_mobile and check_budget. Observe: the imagery's estuary, Alameda shore and the toll plaza sit under the drawn
   ones (drawn water is opaque over the bay, as on the Louisiana maps); check_parish_data 30820 pass, 0 fail;
   check_mobile 158 checks pass; check_budget all 730 stations inside budget.

## Checkers (single runs; check_all never run)

- `check_geo`: 146 passed, 0 failed.
- `check_parishes`: 62985 passed, 0 failed.
- `check_terraform`: 552877 checks, 0 failed.
- `check_detail`: 467 pass, 0 fail.
- `check_mapbox`: exit 0, no FAIL line.
- `check_parish_data`: 30820 pass, 0 fail.
- `check_mobile`: 158 checks pass.
- `check_budget`: all 730 stations inside budget.

## Seams

- `geoBackdropAllowed(parish) -> bool` (geo-locate.js): false for representative, procedural and programme maps.
- `npDemSampler(parish) -> { at, raw, lo, hi, scale, cap, cachedChunks } | null`, `npDemRise(parish, x, z) -> metres`
  (np-parish.js). A map opts in with `relief: "3dep"`; the registry attaches `reliefGrid` from `BD2_RELIEF`.

## Left

- More relief maps: Monroe & West Monroe and Baton Rouge North Industrial have grids with real rises (scratch only).
- SURVEYOR-2 re-laid Hammond this loop; if its anchors moved, re-bake `hammond-downtown` (`--only hammond-downtown`),
  since the picture is in the map's scene frame.
- The small cumulus over the south-west of the Plaquemines picture (local cloud 0.006 by the white-pixel test) could be
  bettered with a fourth month of scenes.
