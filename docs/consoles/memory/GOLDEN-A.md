# GOLDEN-A memory — read this before touching the San Francisco districts or regions

Short, durable lessons for the next team at this console (the Bayou brief's GOLDEN-A section, docs/consoles/GOLDEN-A.md).

- **Check your base first.** This worktree started at 589f0d8; `git reset --hard a643c66` (local, not a fetch) put it on
  the coordinator's tree. Do that before reading anything.
- **Regions default, they do not migrate.** A map without `region` is New Orleans (`npRegionOf`), so the five parish
  modules were never edited — other consoles (ASSAYER) edit those files in the same run and a one-line `region` field
  would only buy merge conflicts. New regions go in `NP_REGIONS` (np-parishes.js) and in `ND_REGIONS`
  (check_parish_data.mjs) — both lists, or the data checker fails the map.
- **Hills sit under the water cut and over the pad rule.** `npHillRise` is added to the base ground, so water still wins
  (a hill never lifts a bay), and a site pad flattens to `NP_GROUND + npHillRise(site)` — a terrace, not a pit. With no
  hills the old field is bit-identical (the pad base term is skipped when `hills` is empty). Keep `height·π/(2·radius)`
  under `NP_HILL.maxSlope` (0.35) — the validator and both checkers hold it.
- **Write SF from lon/lat, once.** `$SP/bayou/golden-a/gen_sf.mjs` (scratch) holds one shared coastline (bay polygon from
  Fort Point round the Embarcadero to Candlestick; ocean polygon down Ocean Beach), the roads, seawalls, hills, and per-map
  sites; it projects through `x = Δlon·111320·cos(lat0)/2.2`, `z = −Δlat·110574/2.2`, then Sutherland–Hodgman clips
  polygons and Liang–Barsky clips lines to the field. The modules are the source of truth afterwards; edit them directly
  or rerun the generator (it overwrites).
- **Scale floor.** `check_parish_data` wants a field wider than 8 km of ground, so a map needs ≥ ~2 real metres per map
  metre; `check_parishes` wants ≤ 6. SF is at 2.2 (a 9 km box per district; the boxes overlap).
- **Seawalls are levees.** The schema's `levees` (≥ 2 per map in check_parish_data) carry the Embarcadero seawall, the
  Mission Bay seawall, the Ocean Beach seawall and dunes — the shore shifted ~25 map metres inland so the batter meets the
  water's edge. A road along the shore must sit ≥ ~48 map metres inland to clear the batter.
- **History words are grepped over the whole module source** (comments too): "elevation", "founded", "since <digit>",
  "est." fail `check_parishes`. Say "a map number, not a measurement".
- **The Bay Bridge point** `[-122.387, 37.790]` (GOLDEN-B's `sf-bay-bridge`, kind `world`) is on dry land in the Downtown
  map because the coastline there is drawn out to −122.3855 at the anchorage; `check_parishes` asserts it.
- **Checkers:** `node tools/check_parish_data.mjs` (< 1 s) and `node tools/check_parishes.mjs` (~15 s for eight maps; the
  headless three.js build is the cost).
- **A browser smoke without the network.** `$SP/bayou/golden-a/smoke.mjs` serves `WebXR/` on 8993, launches
  `/opt/pw-browsers/chromium` through `/opt/node22/lib/node_modules/playwright`, aborts every non-local request and
  fulfils the cdnjs three.js import with `WebXR/vendor/three/dist/three.module.min.js`. Register the abort route
  **first** — Playwright tries the most recently added route first, so the fulfil must be added after the catch-all.
  `TP=x:z:yaw` teleports through `window.__parishTest` for a second shot.
