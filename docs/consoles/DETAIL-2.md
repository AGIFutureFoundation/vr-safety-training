# Console DETAIL-2

- Console: DETAIL-2 (Louisiana round 2, prefix `dt2`, port 9014)
- Brief: `$SP/louisiana/round2-brief.md` (section DETAIL-2), under the rules of `$SP/louisiana/wave-brief.md`
- Base: 6ffb8b37 (round 1 merged: 42 maps in 10 regions). Builds on DETAIL (`docs/consoles/DETAIL.md`).

## What it does
1. **Baselines for every map.** `tools/dt_measure.mjs --missing --engine=<hash>` measures only the maps with no row in
   `tools/detail-baseline.json`, on the same unmodified path DETAIL used (massing + FACADES, the DETAIL hooks unset; it
   refuses to run if they are set), and merges them in with the tree they were measured on (`engine` per row; the 25 old
   rows keep c0883a3). 17 rows added at 6ffb8b37; the file now covers all 42 maps. check_detail now fails a map with no
   row (it used to note it and skip), so a map merged later (CAPITAL's Baton Rouge and Hammond) needs one
   `dt_measure --missing` run.
2. **Louisiana scatter rows.** The Louisiana maps use the shared characters (garden, park, industrial, port, refinery,
   quarter, wetland), so DETAIL's name fallback never fired for them. DETAIL-2 keys their look by **region** and
   **district name**, never by map id (`DT_LA_REGIONS`, `DT_VARIANTS`, `dtVariants(parish)` in `dt-detail.js`):
   - `cane` (cane stalks in 1.5 m rows, headlands, farm fence) and `rice` (1 m rows, rice-check water) for garden
     districts named for cane, rice or fields;
   - `cypress` (reeds, cypress, knees, lily pads) for every wetland in the region; `bayouedge`, `bayoushore` and
     `crabwater` replace the water's-edge rows: crab-trap floats, pilings, knees and stacked crab traps;
   - `piperack` (posts, beams and two pipe runs lifted 4.6–5.4 m, in straight 8 m rows; drums, valves) for refinery
     districts and industrial districts named for a plant, process, propellant, compressor or blending yard;
   - `apron` (apron slabs, taxi lines, taxiway lights, chocks, ground-support carts) for a park named for a runway,
     taxiway or apron; `hangar` (the same kit plus tugs and pallets) for industrial districts named for a hangar or
     airport;
   - `slipway` (slip rails and keel blocks in 4 m rows, pilings, steel plate, containers) for a port named for a
     shipyard, boatyard or slipway;
   - `gallery` for the French Quarter and its neighbours (Marigny, Tremé, Faubourg, Seventh Ward): gas lamps at street
     level, and on every quarter block in the district a gallery on its front: iron posts to the ground, the gallery
     floor, iron railings on three sides and hanging ferns.
   A 4th table entry is a row spacing (the x coordinate snapped to row lines, the yaw along the row), drawing the same
   random numbers as before, so tiers and rings still nest. No new family, geometry, material or capacity: the pool,
   its triangle budget and the export's shape are unchanged (`dtExportParams()` gains `variants`).
3. **A sampled check_detail.** The ratio walk generates a stratified one-in-four sample (one chunk in every 2×2 block,
   its place drawn from the map id). The map total is estimated as 4 × the sample sum and judged on its **−3σ lower
   bound** (simple-random-sample standard error with the finite-population correction; stratifying only narrows the
   true spread). A map whose bound misses any tier's target is walked in full and judged on the exact total, so the
   proof never passes on an estimate alone. `--full` restores the exact walk everywhere. New checks: every map has a
   baseline row; every variant row exists; the Louisiana rows are on exactly for the Louisiana regions; every matching
   district takes its row; each row is used by at least one map; `dt-detail.js` names no map id.

## Louisiana ratios (exact, every chunk, after the rows)
Every chunk of every Louisiana-region map generated (the checker's tally pass over every chunk; `check_detail.mjs --full` reproduces it), before the rows
(6ffb8b37's generator) → after. Targets: 100× high, 25× balanced, 5× low. All 22 clear them; the thinnest is
nola-french-quarter-cbd (a dense FACADES baseline). Ratios fall a little where the `cypress` row replaced the heavier
generic wetland row (Vermilion, Plaquemines) and rise where cane, pipe racks and slipways replaced garden/industrial.

| map | region | baseline high | high (before → after) | balanced | low |
|---|---|---|---|---|---|
| orleans | (new-orleans) | 14,373 | 318.4× → **307.0×** | 79.6× → **76.8×** | 19.5× → **18.8×** |
| jefferson | (new-orleans) | 2,408 | 968.0× → **952.9×** | 242.0× → **238.0×** | 58.5× → **57.6×** |
| st-bernard | (new-orleans) | 5,825 | 863.4× → **807.3×** | 215.8× → **201.8×** | 52.7× → **49.2×** |
| plaquemines | (new-orleans) | 6,798 | 420.3× → **358.9×** | 105.1× → **89.6×** | 25.8× → **22.0×** |
| st-tammany | (new-orleans) | 4,628 | 712.4× → **689.3×** | 178.5× → **172.7×** | 43.5× → **42.1×** |
| la-starbase-vermilion | louisiana-sites | 14,450 | 340.4× → **284.4×** | 85.2× → **71.2×** | 20.9× → **17.5×** |
| la-black-bayou-cameron | louisiana-sites | 11,910 | 470.1× → **426.0×** | 117.5× → **106.4×** | 28.8× → **26.1×** |
| la-saronic-franklin | louisiana-sites | 24,079 | 171.8× → **194.9×** | 42.9× → **48.8×** | 10.6× → **12.0×** |
| la-avex-new-iberia | louisiana-sites | 16,642 | 273.3× → **251.6×** | 68.4× → **62.9×** | 16.8× → **15.4×** |
| laf-downtown | louisiana-cities | 21,189 | 215.5× → **209.7×** | 53.9× → **52.5×** | 13.3× → **12.9×** |
| laf-carencro-north | louisiana-cities | 10,932 | 396.1× → **395.4×** | 99.1× → **98.9×** | 24.2× → **24.2×** |
| monroe-west-monroe | louisiana-cities | 7,854 | 610.1× → **602.4×** | 152.4× → **150.5×** | 37.2× → **36.7×** |
| la-meta-richland | louisiana-sites | 13,264 | 352.4× → **407.9×** | 88.0× → **102.0×** | 21.5× → **24.9×** |
| la-delta-forge-rapides | louisiana-sites | 12,055 | 395.0× → **452.2×** | 98.7× → **113.1×** | 24.1× → **27.6×** |
| la-shintech-plaquemine | louisiana-sites | 14,486 | 290.4× → **340.7×** | 72.6× → **85.2×** | 17.7× → **20.9×** |
| lc-lakefront-downtown | louisiana-cities | 19,891 | 219.0× → **218.8×** | 54.8× → **54.8×** | 13.5× → **13.5×** |
| lc-calcasieu-channel | louisiana-sites | 9,098 | 476.0× → **497.6×** | 119.2× → **124.5×** | 29.0× → **30.4×** |
| lc-port-of-vinton | louisiana-sites | 16,754 | 290.9× → **335.3×** | 72.8× → **83.8×** | 17.9× → **20.5×** |
| nola-french-quarter-cbd | new-orleans-districts | 21,137 | 133.6× → **135.8×** | 33.4× → **33.9×** | 8.3× → **8.4×** |
| nola-uptown-garden | new-orleans-districts | 14,762 | 294.3× → **293.1×** | 73.7× → **73.4×** | 18.0× → **17.9×** |
| nola-mid-city-gentilly | new-orleans-districts | 23,957 | 206.6× → **207.5×** | 51.6× → **51.8×** | 12.7× → **12.8×** |
| nola-bywater-lower-ninth | new-orleans-districts | 11,894 | 377.2× → **370.3×** | 94.3× → **92.6×** | 23.1× → **22.7×** |

## Checkers
Single checkers only (check_all was never run or imported). The machine was shared with the other consoles at load
10–25 throughout.

| checker | result | time |
|---|---|---|
| `node tools/check_detail.mjs` (final, sampled) | **435 pass, 1 fail** — every map has a baseline row and clears 100× / 25× / 5×; every budget and wiring check passes; the one fail is the generation median, 12.2 ms CPU against 12 ms (wall clock 20.2 ms at load 22) | 2 min 31 s wall, 55.7 s CPU (user + sys) |
| `node tools/check_detail.mjs` (the unchanged checker, before sampling) | 296 pass, 2 fail (both generation time) | 7 min 35 s wall |
| `node tools/check_mobile.mjs` over a fresh `bundle_webxr.py` dist | **158 pass, 0 fail** | 3 min 39 s |
| `tools/dt_measure.mjs --missing` | 17 rows added, 42 in all | 6.4 s |

Ratio verdicts (final run): high min 123.2× (sf-marina, walked in full because its sampled bound fell short), median
333.9×, max 999.0×; balanced min 30.8×; low min 7.6×. The worst bounded full build with the pool full stays under 260
meshes and 400,000 triangles on all five densest maps (la-saronic-franklin, nola-mid-city-gentilly, bay-san-jose,
bay-san-pablo, laf-downtown) at every tier.

## Cycles
0. Reason: bring the worktree to round 1's integration; proof = HEAD hash. Act: `git merge --ff-only 6ffb8b37`.
   Observed: HEAD 6ffb8b3735a3. Pass.
1. Reason: 17 maps merged after DETAIL have no baseline row, so check_detail skipped their ratio. Act: `dt_measure
   --missing --engine=6ffb8b37` (unmodified path, hooks asserted unset). Proof = 42 rows. Observed: 17 rows in 6.4 s
   (la-saronic-franklin the densest new baseline, 24,079 at high). Pass.
2. Reason: measure the Louisiana ratios with DETAIL's generator before changing it. Observed: all 22 clear the targets;
   thinnest nola-french-quarter-cbd 133.6× / 33.4× / 8.3×. Pass.
3. Reason: the Louisiana maps use the shared characters, so DETAIL's name fallback never fired; key their rows by region
   and district name. Act: `DT_LA_REGIONS`, `DT_VARIANTS`, `dtVariants`, 12 rows, gallery kit on quarter blocks. Proof =
   ratios still clear and every intended district takes its row. Observed: first run ReferenceError (npDistrictAt not
   imported); fixed; all 22 clear (table above); cane 8 maps, piperack 6, hangar 4, gallery 4, apron 1, rice 1,
   slipway 1. Pass.
4. Reason: the unchanged checker on all 42 maps as the reference. Observed: 296 pass, 2 fail — every ratio passes
   exactly; the two fails are generation time (wall-clock median 17.2 ms against 12, worst 321 ms against 90) on a
   machine at load 10–25; 7 min 35 s. Fail on time only.
5. Reason: sample the ratio walk (stratified 1-in-4, −3σ bound, full walk when short). Proof = runtime and the same
   verdicts. Observed: 440 pass, 2 fail (the same two), 5 min 29 s: walk 116 s (2,880 chunks; sf-marina, the thinnest
   map at 123×, walked in full), but the five full builds took 196 s. Pass on the proof, fail on time.
6. Reason: the builds' time is detail generation, and the pool's contribution is bounded by its capacity, so build the
   engine without it and add the pool's worst case (15 meshes, capacity triangles), with one live build for the pool
   itself; judge generation cost on CPU time, not the shared wall clock. Observed: 434 pass, 2 fail, 1 min 51 s: walk
   69 s, builds 28 s; CPU median 12.4 ms (≤ 12), worst 93 ms (≤ 90) — just over. Fail on time by 3 %.
7. Reason: a profile shows `put`, `push` and the garbage collector at ~45 %: per-candidate `[tier, p]` destructuring,
   per-cell neighbour arrays and closures, 256-instance buffers doubling. Act: flat typed arrays, an allocation-free
   neighbour test, 1,024-instance buffers. Proof = identical output. Observed: digests, counts and tier tallies
   identical on 252 chunks (6 per map, two tiers/rings). check_detail: 435 pass, 1 fail (median 12.2 ms CPU, budget 12; the worst now 47 ms), 2 min 31 s wall at load 22, 55.7 s CPU. Pass except the median by 2 %.
8. Reason: prove the pages on phones. Act: `python3 tools/bundle_webxr.py` (25 s, 15 bundles, 1,350 files), then
   `node tools/check_mobile.mjs`. Observed: 158 checks pass (6 games × portrait 360×640 and landscape 640×360), 3 min
   39 s. The rebuilt dist was then restored to the committed one (not required by any checker). Pass.

## Left
- **Under 60 s wall.** The checker now needs 55.7 s of CPU in all (it was ~7.5 min wall), so on a quiet machine it is
  just under a minute; at load 20+ it took 2.5 min wall. A 1-in-8 stride (the bound stays sound; more maps would fall
  back to a full walk) or a worker per region would give headroom.
- **The generation median** sits at the 12 ms budget (12.2 ms CPU at load 22; side-by-side samples were too noisy at this load to separate the old and new generators — sf-marina, whose path is unchanged, read 11.6–17.5 ms). Re-run check_detail on a quiet machine; if it still misses, the next cuts are in `put` /
  `push` (string-keyed lookups per candidate) or a count-only tally pass for the checker.
- **CAPITAL's Baton Rouge and Hammond maps**, if they merge after this: run `node tools/dt_measure.mjs --missing
  --engine=<hash>` once (check_detail fails a map with no row). Their region will match `DT_LA_REGIONS` if it contains
  "louisiana"; districts named for cane, rice, fields, a runway, hangar, shipyard or plant get their rows by name.
- **The committed dist is stale**: a fresh bundle adds the 17 new maps' `np-data-*.js` and changes 13 tracked files
  (and three `lp-*` sims), which check_mobile passed on. It was restored, not committed (no checker requires it);
  integration should rebuild dist once all round-2 merges land.
- A browser look at the Louisiana rows (CAPTURE's shots will show them); the gallery is placed on each quarter block's
  local +z face, which is not always the street side.
