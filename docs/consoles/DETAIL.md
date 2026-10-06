# Console DETAIL

- Console: DETAIL (the Louisiana wave, prefix `dt`, port 9007)
- Brief: `$SP/louisiana/wave-brief.md` (section DETAIL), under the Shared rules of `packs-brief.md` and the reactor loop of `packs-brief-3.md`
- Base: c0883a3. DETAIL owns `WebXR/shared/np-world.js` this round.

## What it does
The user asked for 100× the procedural detail on the 4096 m maps. DETAIL builds it as **seeded instanced scatter**, never data:
`WebXR/shared/dt-detail.js` generates, per streamed chunk, street kit (lamps, hydrants, meters, sign posts, mailboxes, bins,
benches, bollards, power poles and wires, lane dashes, edge lines and crosswalk stripes as flat decals), yards (fence panels
round each house lot, hedges, flowers, clutter, a mailbox, an AC unit), roofs (AC units, vents, solar panels, roof tanks on
every flat roof), vegetation (grass tufts, weeds, shrubs, small trees, palms, hanging moss on live oaks and cypress, cypress
knees), marsh and water edge (reeds, lily pads, pilings, crab-trap floats), farm (crop rows, rice-check water, hay bales, farm
fences), industry (pallets, drums, containers, pipe runs round tanks, valves) and site clutter (cones, barriers, stacks, drums,
marks). Keyed by cover and district character (unknown characters fall back by name: `farm|rice|cane…` → farm, `marsh|bayou…`
→ wetland, and so on), never by map id, so the Louisiana maps get it when they merge.

## Modules
- `WebXR/shared/dt-detail.js` — `dtDetailForChunk`, `dtMountDetail`, `dtGeometries`, `dtDigest`, `dtExportParams`,
  `DT_FAMILIES` (15 families, 2–20 triangles an instance), `DT_| map | tier | before: massing inst. | before: meshes | before: triangles | after: + pool inst. | after: meshes | after: triangles | pool triangles |
|---|---|---|---|---|---|---|---|---|
| bay-san-jose | low | 507 | 78 | 39,816 | 1,786 | 93 | 47,542 | 7,726 |
| bay-san-jose | balanced | 1,657 | 156 | 136,304 | 8,993 | 171 | 170,356 | 39,866 |
| bay-san-jose | high | 1,657 | 156 | 136,304 | 20,828 | 171 | 243,328 | 107,024 |
| bay-san-pablo | low | 573 | 81 | 39,911 | 1,787 | 96 | 47,589 | 7,678 |
| bay-san-pablo | balanced | 1,752 | 158 | 139,267 | 9,464 | 173 | 169,027 | 42,048 |
| bay-san-pablo | high | 1,752 | 158 | 139,267 | 22,959 | 173 | 235,203 | 106,498 |
| sf-marina | low | 702 | 97 | 40,263 | 1,860 | 112 | 47,545 | 7,858 |
| sf-marina | balanced | 2,342 | 170 | 179,475 | 8,963 | 185 | 211,433 | 39,640 |
| sf-marina | high | 2,342 | 170 | 179,475 | 20,714 | 185 | 276,063 | 99,158 |
| sf-bayview | low | 699 | 91 | 37,595 | 1,851 | 106 | 45,003 | 8,764 |
| sf-bayview | balanced | 2,251 | 160 | 174,503 | 9,258 | 175 | 205,673 | 42,188 |
| sf-bayview | high | 2,251 | 160 | 174,503 | 21,301 | 175 | 270,123 | 100,058 |
| orleans | low | 580 | 122 | 48,941 | 1,854 | 137 | 55,965 | 8,420 |
| orleans | balanced | 1,543 | 198 | 125,051 | 10,646 | 213 | 165,045 | 49,262 |
| orleans | high | 1,543 | 198 | 125,051 | 24,225 | 213 | 223,347 | 115,250 |

(Before: `node tools/dt_measure.mjs --table` on the unmodified engine. After: `node tools/check_detail.mjs`'s notes. Meshes rise by the pool's 15; the "after" worst triangles on the balanced tier also count ring-1 FACADES, as before. Limits: 260 meshes, 400,000 triangles.)` (the per-8 m-cell scatter by cover/character),
  `DT_DENSITY` (high 1, balanced ¼, low 1/20), `DT_FADE` (nearest ring 1, then 0.12, 0.03), `DT_CAPACITY`, `DT_BUDGET`.
- `WebXR/shared/np-world.js` — `NP_MASSING_HOOKS` gains `chunkLoaded`, `chunkUnloaded`, `streamed`; chunk records carry their key;
  `stats()` adds `detailInstances`. Unset, the engine builds exactly what it built before.
- `tools/dt_measure.mjs` — the measure (`--baseline` wrote `tools/detail-baseline.json` from the unmodified engine; `--table`).
- `tools/check_detail.mjs` — the proof (in `check_all.mjs` and `docs/perf/checkers-baseline.json`).

## Seams
- `dtDetailForChunk(parish, cx, cz, tier, { ring, spots, tally }) -> { families: { [id]: { n, mats, cols } }, count, tiers }` — pure,
  deterministic; lower tiers and farther rings are subsets (one threshold per candidate).
- `dtMountDetail(root, THREE, parish, { tier, hooks }) -> { flush, stats, dispose, meshes, group }` — the pool; call before
  `npBuildParish`. Mounted in the parishes app (`WebXR/parishes/js/app.js`), bundled after `np-world.js` / `fc-facades.js`.
- Engine hooks: `chunkLoaded({ THREE, parish, chunk, spots, tier })`, `chunkUnloaded({ parish, key })`, `streamed({ parish })`.
- TradeQuest export: `tools/tq_bridge.mjs` reads `dtExportParams()` into the facades section as `detail` (seed rule, density,
  fade, capacity, families, table — parameters only, never instances).

## Budgets (and why)
- Pool: 15 InstancedMeshes (≤ 16), frustum culling off (the pool is the learner's surroundings), two shared Lambert materials.
- Visible-set triangles: high 170k, balanced 85k, low 26k (Σ capacity × triangles, proven). The worst full build measured
  before DETAIL (five densest maps, start + every site, FACADES on) is 179,475 triangles at high and ~49k at low against the
  engine's 400,000, so high leaves ≈ 50k headroom for streets, life and weather; the phone tier adds ≤ 26k.
- Generation per chunk (high, the heaviest): median ≤ 12 ms, worst ≤ 90 ms (median of three re-timings of the eight slowest
  chunks). The machine was shared with seven other consoles, so single-run maxima are reported, not judged.

## Measured before / after (five densest maps; full streamed build at the start and every site, FACADES mounted)
Instances = the engine's massing instances drawn (before) / plus DETAIL's pool instances (after); worst over the walk.

TABLE

Ratio (every chunk at the nearest ring's density vs the baseline): high min 123.2× (sf-marina), median 339.0×, max 968.0×; balanced min 30.8×, median 84.8×, max 242.0×; low min 7.6×, median 22.0×, max 58.5× — every map clears 100× / 25× / 5×.

## Cycles
1. Reason: measure first — count massing + FACADES instances over every chunk of all 25 maps per tier; proof = `tools/detail-baseline.json` written. Observed: 25 maps, high 2,408 (jefferson) … 21,660 (bay-san-jose); worst full build 198 meshes (orleans high), 179,475 triangles (sf-marina high). Pass.
2. Reason: first scatter pass at the table's raw density; proof = ratio ≥ 100× and median generation small. Observed: ratios 215–563× but 30k instances a chunk and median 10–22 ms. Fail on time.
3. Reason: scale the table (DT_CELL_SCALE 0.45) to cut generation; proof = thinnest map still ≥ 100×. Observed: sf-marina 102.7× (too thin a margin), median 6.6–9.7 ms. Raised to 0.55.
4. Reason: full check_detail; proof = its pass/fail line. Observed: 207 pass, 6 fail — reed/cone geometries were 6/8 triangles not 3/4, the capacities 0.5 % over budget, single-run worst 201 ms (p95 23 ms), the TQ check looked for a missing file. Ratio min: high 123×, balanced 30.8×, low 7.6× (all sf-marina).
5. Reason: declare the true triangle counts, trim capacities, time the worst chunk noise-robustly, point the TQ check at tq_bridge.mjs; proof = check_detail passes and check_parishes still passes. Observed: check_detail 213 pass, 0 fail (pool capacity high 168,840 / balanced 84,420 / low 24,900 triangles; generation median ≤ 12 ms and worst ≤ 90 ms both pass); check_parishes 35134 passed, 0 failed; check_proving 162 checks pass. Pass.

## Left
- A browser look at the scatter (headless only this round); ATMOS-style reduced-motion is moot (nothing moves).
- Generation runs on the main thread inside the engine's two-chunks-a-frame stream; a worker or time-slicing would remove the
  worst-case spikes on slow phones.
- (Done by DETAIL-2, `docs/consoles/DETAIL-2.md`.) The Louisiana maps' own characters (farm, marsh) fall back by name; once they merge, give them explicit DT_TABLE rows and a
  baseline row (check_detail notes maps without one).
- check_mobile (headless Chromium over the dist bundles) was not run this round: the bundles were not rebuilt and the machine was shared; check_proving passes.
- (Sampled by DETAIL-2.) check_detail takes ~2.5 min on the shared machine (the ratio walk generates all 6,400 chunks); a sampled walk would cut it.
