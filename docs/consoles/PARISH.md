# Console PARISH — the New Orleans parish world engine and Orleans Parish

Team: PARISH · Brief: the PARISH section and the Shared data contract of `$SP/crescent/crescent-brief.md`, under
`tools/briefs/console-brief.md`, `tools/briefs/frontier-brief.md` and `tools/briefs/mapbox-brief.md` · Branch: `worktree-agent-ad03e5f48dc0f8209` off the coordinator's tree (01539ab) · Port 8990 · Prefix `np`.

Rules held: real places by public name only (a parish, a neighbourhood, a bridge, a park, a canal, a port, a university, a stadium district); no history, dates, statistics, addresses, business or venue-sponsor names; coordinates approximate (three decimals, `approximate: true`) and only to place a map; no building modelled — district character by procedural block massing; Mapbox only with a viewer's token, never a request without one; every page works in the procedural fallback; no violence, gambling, loot or purchases.

## Schema decisions (for DELTA and SECONDLINE — written in the first ten minutes)
1. **Frame.** `x` east, `z` south (north is `-z`, as in Summit); the field is `[-2048, 2048]²`. Each parish chooses its own scale so the whole parish fits its 4096 m — Orleans is stylised at roughly 1 world metre ≈ 3.4 real metres (lon −90.125…−89.980, lat 29.919…30.045), so the lake shore, the river's bend, the outfall canals, the Industrial Canal and the Bayou Bienvenue wetland all fit. `np-geo.js` fits `lon = a·x + b·z + c`, `lat = d·x + e·z + f` by least squares over `anchors` (bay-geo's maths, self-contained); with anchors generated from one affine the residual is ~0.
2. **Water.** `poly` with a `width` is a **centreline** (river, canal, bayou) the engine widens into a strip; `poly` without `width` is a **closed polygon** (lake, wetland, gulf). Water surface is `y = 0`; dry ground sits at about `y = 0.8` (a flat delta with ±0.4 m noise, a natural-levee rise near the river); water beds are cut to `−3`.
3. **Levees.** `pts` is a centreline, `height` the crest above ground (river levee 6, lakefront 5, canal floodwalls 4); the trapezoid is 6 m of crest and 22 m of batter each side, so a levee is walkable.
4. **Roads.** `kind` sets width and colour: interstate 22 m, avenue 16, street 9, riverroad 8, bridge/causeway 14 (an elevated deck that ramps to a clearance over water, with piers), ferry 0 (a dashed water route, not a ribbon). Every road point must be on dry land except bridge, causeway and ferry.
5. **Districts.** `character` is the brief's enum plus `"downtown"` (towers) for a central business district; the engine masses blocks per character on a deterministic grid inside the polygon, off roads, water and site pads.
6. **Sites.** `position` on dry land; `trades` are `tools/unions.json` ids; `programmes` are catalog curricula ids; `stations` are catalog station ids (the checker resolves all three). `kind` is free text (port, levee, pump, streetcar, rail, hospital, campus, stadium, hospitality, wetland, lock, ferry, bridge).
7. **Connectors are paired by id.** A crossing has the same `id` in both parishes' `connectors` (`from` in the owning parish, `to` in the other). `tools/check_parishes.mjs` projects `from.position` with the owner's fit and `to.position` with the other parish's fit and requires them within 1 km; it also requires `to.position` inside the other parish's bounds. When the other module is not in the tree yet, that connector is reported as *pending*, not failed; when the gap is over 1 km the checker prints the `to.position` that would close it (`npGeoToXz(other, npToGeo(owner, from))`). A ferry may connect a parish to itself (`from.parish === to.parish`).
8. **Orleans connectors DELTA should pair** (id · public crossing · approximate lon/lat of the crossing):
   - `conn-i10-17th-street-canal` · Interstate 10 at the 17th Street Canal (to jefferson) · −90.125, 29.995
   - `conn-lakefront-17th-street-canal` · the lakefront road at the canal mouth (to jefferson) · −90.124, 30.021
   - `conn-westbank-expressway` · the West Bank Expressway south of Algiers (to jefferson) · −90.045, 29.919
   - `conn-st-claude-avenue-east` · St. Claude Avenue at the parish line (to st-bernard) · −89.980, 29.965
   - `conn-river-road-holy-cross` · the river road east of Holy Cross (to st-bernard) · −89.980, 29.947
   - `conn-canal-street-ferry` · the Canal Street ferry (orleans to orleans, Algiers Point)
   Orleans reaches St. Tammany and Plaquemines only through Jefferson and St. Bernard.
9. **fieldLessons** are on the RW shape (`id` with `-fl-`, `title`, `site`, `landmark?`, `k12`, `trade`, `tradeLine`, `minutes` 2–4, `steps[3]`, `check { q, options, answer, why }`); ids `np-<parish>-fl-…`. **gated** items carry `world: "parishes"`, `parish`, `site` and the gate contract; ids `np-<parish>-gated-…`.
10. **Registry.** `WebXR/shared/np-parishes.js` imports every `np-data-<parish>.js` and exports `NP_PARISHES` (an array) and `npParish(id)`; DELTA adds one import and one array entry per parish. The checker also globs `np-data-*.js` so a module missing from the registry is a failure, not a silence.

## Plan
- `WebXR/shared/np-geo.js` (pure fit, bounds, satellite URL), `np-data-orleans.js` (Orleans on the contract), `np-parishes.js` (registry), `np-parish.js` (pure engine helpers: height, water, levees, chunks, massing spots, triangulation, validator, budgets), `np-world.js` (the three.js builder: streamed 256 m chunks with LOD, water, levee crowns, road ribbons, bridges, massing, sites, landmarks, connectors, satellite ground).
- `WebXR/parishes/parishes.html` + `js/app.js` (+ `js/state.js` ledger): `?parish=<id>`, the parish selector, HUD map with districts and connectors, job boards through `lkStationLink` (from "parishes"), the passport round trip, Home and the Guide, sky/weather, egrets/pelicans/herons.
- Wiring: `wildlife.js` (egrets, herons), `links.js`, `passport.js` names, `field-lessons.js` page table, the bundler ("parishes" app and flat page), `gen_home.mjs` card, `gen_seo.mjs` app entry, `tools/check_parishes.mjs` in `check_all`.

## Log
- 18:44 UTC · Worktree was at the initial prototype (589f0d8), not the coordinator's tree; reset it to the local 01539ab (an ancestor check first, no fetch), set identity · next: read the briefs and the Summit engine.
- 18:58 UTC · Read the brief, console/frontier/mapbox briefs, SUMMIT-3 memory, CARTOGRAPHER's log, summit-data/summit/app/state, check_summit, bay-geo, mapbox, links, field-lessons, wildlife, passport, the bundler, check_all, check_gates, check_k12, check_home, check_interop, gen_seo, check_design. Schema decisions above written for DELTA · next: the Orleans data module (generated from approximate lon/lat by a scratch script), then the engine.
