# PARISH-2 brief — the parish engine, one phase further

Read first: `docs/consoles/PARISH.md` (the schema decisions), `docs/consoles/memory/PARISH.md`, the Crescent brief's data contract, and DELTA's `docs/parishes.md` once it lands. Prefix `np`; port 8990.

## Where PARISH left it (measured)
- `tools/check_parishes.mjs`: 1412 checks green on one parish (Orleans: 14 sites, 34 roads, 16 districts, 18 landmarks, 10 water bodies, 9 levees, 6 connectors, 6 field lessons, 2 gated items); five of the six connectors are *pending* (Jefferson and St. Bernard not in the tree at hand-back).
- Headless build on the vendored three.js: high tier 49 chunks, worst 171 meshes / 70 083 triangles (budget 260 / 400 000); low tier 25 chunks, 118 / 44 447; pure worst-case estimate 101 214 / 54 775. Build time ~4 s headless.
- Orleans is stylised at 3.41 × 3.43 real metres per world metre (lon −90.125…−89.980, lat 29.912…30.038); anchor residual 0.4 m.
- The homepage card carries a real capture (WebXR/home/img/parishes.jpg, 2 KB… regenerate after the massing improves).

## Phase 2
1. **Massing that reads.** The first capture is a flat plain with one building: raise the district character — galleries as posts and rails on the quarter blocks, a shotgun-house profile in the suburbs, live oaks arching over the garden avenues, wharf sheds and gantry cranes along the river's strip, the downtown towers stepped — and colour the ground by district with a block-and-street grid in the vertex colours (spacing from `NP_MASSING`). Hold the budget: worst site under 200 meshes / 150 k triangles on high.
2. **Levees you can walk and read.** A floodwall (a thin concrete wall on the canal crests, `levees[].wall: true`), gates where a road crosses a levee, the pumping station's discharge pipes over the lakefront levee; the height field already carries the trapezoid.
3. **Connectors that travel.** When DELTA's parishes are in: E at a way out loads the other parish at the paired connector's `from` (the checker already pairs by id); a "crossing" toast names the public crossing. Add the Jefferson causeway and the twin span as `causeway` kinds if their parishes draw them.
4. **The Atlas.** A DOM-only parish section in `bayworld/js/atlas.js` from `np-parishes.js` (the data is pure): districts, water, roads, sites with programme chips, deep links `parishes.html?parish=<id>&site=<id>`, the Mapbox map through `npBounds` when a token exists.
5. **Guide knowledge.** `gen_guide_kb.mjs` entries for every parish's sites and landmarks (the Summit pattern at line ~126), so the Guide can answer "where is the pumping station".
6. **Checker growth.** Absorb DELTA's `check_parish_data.mjs` assertions or call its validator from `check_parishes`, so one checker owns the schema; add `check_links`' world table entry for `parishes/parishes.html` (station links in the flat build) and `check_mobile`'s `GAMES_ALL` entry (a phone frame budget on the real page).
7. **Numbers to beat.** 1412 checks; worst 171 meshes / 70 k triangles; 6 field lessons (SECONDLINE brings 25+); a 4 s headless build — stream the first ring only at start and let `update` fill the rest over the first second.
