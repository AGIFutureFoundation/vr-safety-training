# CITYWORKS — roads, sidewalks and solid buildings (prefix `cw`, port 8981)

Console CITYWORKS of the Packs run ("SmartCiti.X Powered by AGI Corp", brief `tools/briefs/packs-brief.md`).

## Plan (written before code)
1. **Generator** `tools/gen_cw_streets.mjs` reads the Trade Craft Academy artifact's street fabric
   (`$SP/packs/tcacademy/parishes/maps/streets/<fips>.json`, `provenance: "AUTHORED"` — procedural polylines in local metres
   `[east_m, north_m]` around each file's `frame_origin`, NOT the real street grid). For each New Orleans parish it projects
   all five files (local metres → lon/lat on a sphere at the frame origin → the parish field through `np-geo.js`'s
   `npGeoToXz`), so the fabric runs on across parish lines, then:
   - clips to the field (8 m margin), splits wherever the street or either sidewalk edge sits on water (any water body,
     wetland included), on a levee, or inside a site pad; drops short pieces; simplifies (Douglas–Peucker 1 m);
   - thins locals to a per-chunk budget (arterials and collectors kept whole);
   - builds the road graph with the parish's own named roads (`cwBuildGraph`, shared with the runtime) and drops every
     street piece whose component touches no named road — the fabric adds no islands;
   - writes `WebXR/shared/cw-streets-<parish>.js` (a pure literal, `CW_STREETS_<PARISH>`) with the provenance line.
   Widths are drawn at map scale (arterial 14 m, collector 10 m, local 7 m), not the file's `widths_m`, and the module
   records both. The parishes' own `roads` stay the named ones; nothing here renames or moves them.
2. **Runtime** `WebXR/shared/cw-cityworks.js` (pure): `cwStreets(parish)` (the fabric for a New Orleans parish; a San
   Francisco district has none — it gets kerbs and sidewalks along its own avenues and streets), `cwRoadGraph`,
   `cwSidewalkAt`, `cwColliders`, `cwMassFilter` (massing spots that would stand on a street are dropped).
3. **Builder** `WebXR/shared/cw-streets-world.js` (three.js from the caller): `cwMountStreets({ THREE, root, parish, tier })`
   → per streamed chunk inside the massing ring one merged vertex-coloured mesh (road surfaces, lane dashes on arterials,
   kerbs, sidewalks both sides of arterials, collectors and the named avenues/streets, crosswalks at junctions near a
   site); streetlights along arterials as two InstancedMeshes for the whole loaded set (poles, heads — heads lit at
   night); one merged door-panel mesh (a door on each site building's face toward the nearest road). Phone tier: the ring
   shrinks to 1, no lane dashes, half the lights. Nothing moves (reduced motion is already still).
4. **Mount** in `WebXR/parishes/js/app.js`: `npBuildParish(..., { massFilter })`, `cwMountStreets`, `update` beside
   `world.update`, night from the time of day, and the walk stops at `cwColliders` boxes (slides along walls).
   `np-world.js` gains one optional `opts.massFilter(spot)` — without it the engine behaves exactly as before.
5. **Checker** `tools/check_cityworks.mjs`: every street vertex inside the field and off open water; sidewalks never on
   water; road graph components per parish (the fabric adds none); colliders cover every massing building and every site
   building; meshes/triangles per chunk and the combined build inside `NP_BUDGET` on low and high; determinism.

## Seams
- `cwColliders(parish, chunkKey) -> [{ min: [x, y, z], max: [x, y, z], kind, id?, door? }]` — NEWTON's walls, MENAGERIE's obstacles.
- `cwSidewalkAt(parish, x, z) -> bool` — MENAGERIE's passers-by.
- `cwRoadGraph(parish) -> { nodes: [[x, z]], edges: [{ a, b, cls, width, len, line }] }` — NEWTON's drive mode, MENAGERIE's crossings.
- `cwMassFilter(parish) -> (spot) => bool` — passed to `npBuildParish` as `opts.massFilter`.
- `cwMountStreets({ THREE, root, parish, tier }) -> { update(x, z), setNight(bool), stats(), chunkStats(), crosswalks, lights }` — mounted in the parishes app.

## Log
- 01:18 Base reset to d85a41f (the worktree started on 589f0d8). Eval before (`AS_PORT=8981 node tools/eval_worlds.mjs`,
  browser included): mean 98, the five New Orleans parishes 100 each, the five San Francisco districts 97 each.
- 01:24 `tools/gen_cw_streets.mjs`: orleans 568 streets (13 arterial / 56 collector / 499 local), jefferson 227,
  st-bernard 478, plaquemines 340, st-tammany 824 — every piece in the field, off water, levees and pads, no islands.
- 01:30 `check_cityworks.mjs` 2710 checks, 0 failed. Road graph components with the fabric vs the named roads alone:
  orleans 5 (8), jefferson 3 (5), st-bernard 2 (2), plaquemines 1 (1), st-tammany 1 (2), the SF districts unchanged.
  Worst combined build 190 of 260 meshes and 87,497 of 400,000 triangles; worst street chunk 2,506 of 9,000 triangles.
  Singles: check_parishes 12920/0, check_fleet (143 builders in budget), check_budget (697 stations), check_mobile 158 pass.
- 01:36 Light pools on the pavement at night; night and phone-tier checks.
- 01:39 The parish map (M) draws the fabric as its own "streets" layer, captioned "procedural fabric, not the real grid".
  `check_cityworks.mjs` 2741 checks, 0 failed (61.9 s at load 23).
- 01:41 Eval after (`AS_PORT=8981`, browser included): mean 98, unchanged — every parish page loads at both sizes with no
  page error, the New Orleans parishes 100, the San Francisco districts 97 (their field-lesson finding is SECONDLINE's).

## What is left
- The walk slides along walls but site buildings are solid boxes with a door panel — no interior to enter yet.
- KREWE's kits (`kw-kits.js`) place porches and props by district without knowing the streets; a few stand on a
  sidewalk. Give `kwDressParish` the same `cwMassFilter` (or a `cwSidewalkAt` test) after the merge.
- NEWTON's drive mode should route on `cwRoadGraph` and collide with `cwColliders`; MENAGERIE's passers-by read
  `cwSidewalkAt` and cross at `cwMountStreets(...).crosswalks`.
