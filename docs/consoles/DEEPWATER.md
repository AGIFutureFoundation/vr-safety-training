# DEEPWATER — the underwater regions the Bay Program projects touch (`dw`, port 8968)

Brief: project-worlds wave, section DEEPWATER. Facts about the Bay Program come only from the wave's facts file
(`epa-2026-facts.md`); nothing about depth or water quality is stated as a figure — every depth, visibility and current in
these regions is a **schematic** relative range (words and a 0..1 fraction), labelled as such, never a measurement.

## Plan

- `WebXR/shared/dw-regions.js` — pure data and functions (no three.js import): three regions, each a compact procedural
  seabed field of its own (`DW_REGIONS`: zones tiling the field by nearest centre, landmarks, guide lines, dive sites with
  real catalog stations from `commercial-diving-and-scientific-scuba` (`cd-*`), `bay-restoration-maritime-underwater`
  (`br-*`), `marine-ecology-and-restoration` (`me-*`) and `mw-*`); a schematic two-tides-a-day clock (`dwTideAt`) and
  per-region tide-driven visibility/current (`dwConditionsAt` — San Pablo's turbid water clears on the flood); shoreline
  entries (`DW_SHORE_ENTRIES`, `dwShoreEntriesFor`) keyed by parish id behind guards (TIDELANDS' `bp-*`, BAYMAP's
  `oak-west-oakland`), and `dwBuildRegion(THREE, parent, id)` — one merged/instanced build inside `DW_REGION_MESH_BUDGET`.
- `WebXR/underwater/region.html` + `js/dw-region-app.js` — the Deep at a region: swim camera, tide clock, the conditions
  as words, dive-site boards with station links (return to the region's site), passport award on a site visit, and a
  "Back to shore" link to the parish map it came from. `underwater.html?region=<id>` forwards there.
- Parishes app: a "Dive entry" row on maps that have a shoreline entry (guarded), opening the region with the passport.
- Checker additions in `tools/check_underwater.mjs` (section "regions").

## Seams

- `dwRegions()`, `dwRegion(id)`, `dwZoneAtRegion(id, x, z)`, `dwDepthAtRegion(id, x, z)` (schematic scenery field),
  `dwTideAt(hours) -> { stage: "flood"|"high"|"ebb"|"low", phase }`, `dwConditionsAt(id, x, z, hours) -> { stage,
  visibility 0..1, current 0..1, words: { visibility, current, stage } }`.
- `dwShoreEntriesFor(parishOrId) -> [{ id, region, parish, position:[x,z], label, url }]` — guarded against maps not in the
  tree; `dwDiveUrl(entry, { from })`.
- `dwBuildRegion(THREE, parent, id, { tier }) -> { group, meshCount, animate(t) }`.

## Cycles

(reason → act → observe; one line each)
0. Baseline — reason: the Deep holds at 039f09e before any change. Check: check_underwater last line. Observed: PASS, high 1056 ≤ 1400, low 89 ≤ 100.
1. Regions data + builder + checker section — reason: three regions (dw-san-pablo-shallows, dw-san-leandro-bay, dw-oakland-middle-harbor) with zones tiling, sites on real stations, tide-driven conditions, shore entries, builds under DW_REGION_MESH_BUDGET. Check: check_underwater "regions:" line. Observed: first run FAIL (headless stub lacks computeVertexNormals / Lambert / LineSegments; meshCount missed Points/Lines) → fixed → PASS: 3 regions, 12 zones, 9 dive sites, 28 real stations, 3 shoreline entries; visibility ebb→flood poor→good (San Pablo, San Leandro), fair→good (Oakland); meshes 12–14 high / 11–13 phone ≤ 24/16; main Deep still 1056 ≤ 1400.
2. Region page + entries — reason: a dive entry opens the Deep at its region with the passport and a way back. Act: underwater/region.html + js/dw-region-app.js (tide clock, conditions in words, site boards with real station links, ppAward('dw-region') once per site, Back to shore), underwater.html?region= forwards, menu link, parishes app 'Dive entries from this shore' row (guarded, window.__parishTest.diveEntries). Check: node --check, check_underwater_game, check_dive_quests, check_imports. Observed: PASS all four (68 dives register; 945 modules call only what they import).
Left: in-world shore buoy marker on the parish maps (entries only show on bp-strip-marsh-east, bp-san-leandro-bay, oak-west-oakland once TIDELANDS/BAYMAP merge); headless browser run of region.html; eval_worlds not run.

## Shoreline entries on the merged maps (BAYSEAMS)
- All three entries resolve: `dw-entry-strip-marsh-east` on TIDELANDS' San Pablo Bay shore, `dw-entry-san-leandro-bay` at San Leandro
  Creek, `dw-entry-middle-harbor` on BAYMAP's West Oakland at the Middle Harbor edge beside `middle-harbor-shoreline-park` (was
  60 m inland beside a landmark id the map does not carry).
- The parishes app draws a dive-flag post at each entry: one InstancedMesh per map (`dw-dive-entries`, one draw call).
- `bay-program-projects` is anchored at Bay World's `port-container-terminal` (check_underwater: every programme anchored).
