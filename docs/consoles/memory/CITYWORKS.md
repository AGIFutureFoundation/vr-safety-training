# CITYWORKS — console memory

Short, durable lessons for the next team at this console. The log and seams are in `docs/consoles/CITYWORKS.md`.

## Conventions
- **The street fabric is AUTHORED procedural** (the Trade Craft Academy artifact's polylines), NOT the real street grid.
  Every generated module and the pure module say so; the checker holds the provenance line. Never call it "the streets
  of" a real place, never give it street names.
- **Regenerate with `node tools/gen_cw_streets.mjs`** (reads `$SP/packs/tcacademy/parishes/maps/streets/<fips>.json`,
  or `--src <dir>`). It projects all five files into every New Orleans parish (the fabric runs across parish lines),
  cuts water (wetland included, tested at the centre and both sidewalk edges), levees and site pads, thins locals to
  `CW_BUDGET.chunkLocalMetres` per chunk and drops pieces whose graph component touches no named road. Deterministic.
- **The files' `widths_m` are map-drawing widths at the artifact's scale** (56–130 m arterials); the engine draws at
  its own map scale (14 / 10 / 7 m). Both are recorded in each module.
- **`np-world.js` takes an optional `opts.massFilter`** — without it the engine is unchanged (check_parishes builds
  without it). `cwColliders` applies the same filter, so a collider exists exactly where a building is drawn (the low
  tier drops every fifth massing spot, so its colliders are a superset there).
- **Budget arithmetic**: streets add one mesh per chunk inside `CW_STREET_RADIUS` (1 on low, 2 otherwise) plus three
  fixed meshes (light poles, light heads, doors). The worst combined build was 189 of 260 meshes (Orleans, high).
- **`check_cityworks.mjs` takes a map id** to run one map (~9 s for Orleans); all ten take about a minute.
