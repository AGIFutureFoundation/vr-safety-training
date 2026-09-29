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
- `cwRoadGraph(parish) -> { nodes: [[x, z]], edges: [{ a, b, cls, width }] }` — NEWTON's drive mode, MENAGERIE's crossings.
- `cwMassFilter(parish) -> (spot) => bool` — passed to `npBuildParish` as `opts.massFilter`.
- `cwMountStreets({ THREE, root, parish, tier }) -> { update(x, z), setNight(bool), stats() }` — mounted in the parishes app.
