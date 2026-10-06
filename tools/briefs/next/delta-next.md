# DELTA-2 brief — the four parishes, from data to played

Read `docs/consoles/memory/DELTA.md`, then `docs/consoles/DELTA.md`, then `docs/parishes.md`. Prefix every new
top-level name `nd`; the data modules are `WebXR/shared/np-data-{jefferson,st-bernard,plaquemines,st-tammany}.js`
(pure literals, edit them directly). Coordinate with PARISH (the engine, `WebXR/parishes/`, `np-geo.js`, Orleans) and
SECONDLINE (quests, treasures, lessons) before touching shared files; the Facts rule for New Orleans still binds.

## Where it stands (measured, DELTA)
- **Four modules, one schema:** 47 sites (12 / 11 / 12 / 12) naming 186 existing catalog station references
  (no new station), 34 landmarks, 41 anchors, 12 connectors (a causeway, a bridge, a ferry, nine roads), 12 field
  lessons on the RW shape, 8 gated items on the gate contract, water / levees / roads / districts per parish
  (Jefferson 6/4/11/8, St. Bernard 8/3/6/7, Plaquemines 8/3/7/8, St. Tammany 7/2/9/11).
- **Scales:** one map metre = 8 m (Jefferson, St. Bernard), 20 m (Plaquemines), 10 m (St. Tammany); north up, x east,
  +z south; every anchor fits its own affine within a few metres (validator bound 150 m).
- **Connectors:** ends within 1 km by construction; long crossings meet mid-water (Causeway -90.128, 30.170; twin
  spans -89.820, 30.175; Chalmette ferry -89.978, 29.950). Six ends into Orleans are `position: null` with the agreed
  `lonlat`; docs/parishes.md carries the table.
- **Checker:** `tools/check_parish_data.mjs`, 1,788 checks in 0.2 s, in check_all after check_summit (baseline 400 ms).
- Not done: nothing renders yet (the engine is PARISH's); no HUD map, no world card, no links.js entries for these four;
  field lessons are 3 per parish (SECONDLINE's target is 25+ across five); gated items 2 per parish; no eggs.

## Next phase
1. **Merge with PARISH.** When Orleans lands: fill the six Orleans ends with `npGeoToXz("orleans", lonlat)`, add the
   mirror connectors to `np-data-orleans.js`, and check every pair with `check_parish_data` (it verifies the mirror).
   Fold the validator into `check_parishes.mjs` (or keep both; remove the baseline entry if it goes).
2. **Walk each parish in the engine** (`parishes.html?parish=jefferson` …) and fix what the terrain shows: ribbon
   widths that read wrong at each scale, sites that land in a district's blocks, roads that cross water without a
   bridge kind, the lake half of Jefferson (a causeway drive is the payoff — give it a ride like Summit's).
3. **Job boards open by trade:** every site's `trades` are union ids; the board should filter its stations by the
   learner's chosen trade and show the union wordmark from `tools/unions.json`. Measure: 186 references, 0 dead.
4. **Lessons and gates to the bar:** with SECONDLINE, 6+ field lessons per parish (the RW shape, no digits), 5+ gated
   items per parish so check_gates's per-world minimum holds once PARISH exports an aggregated `NP_GATED`.
5. **Satellite ground per parish** through `bayGroundTexture`'s pattern with `npBounds(parish)`; the four maps are
   32–82 km wide, so check the Static Images zoom PARISH picks and that the procedural ground still reads without a token.
6. **Plaquemines at 20 m/map-m** is the coarsest world on the platform: consider a second, finer module for the
   Belle Chasse end if the engine's block massing turns to noise at that scale (measure triangles per chunk first).
