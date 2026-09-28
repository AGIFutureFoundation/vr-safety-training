# GOLDEN-A-2 brief — San Francisco on the engine, one phase further

Read first: `docs/consoles/GOLDEN-A.md` (plan and log), `docs/consoles/memory/GOLDEN-A.md`, the SF section of
`docs/parishes.md`, and GOLDEN-B's log (Marina & Presidio, Bayview & Hunters Point, the Bay Bridge `world` connector).
Prefix `sf`.

## Where GOLDEN-A left it (measured)
- Regions in `np-parishes.js` (`NP_REGIONS`, `npRegionOf`, `npRegion`, `npRegionGroups`); a map with no `region` is New
  Orleans. The selector (menu and P modal) draws a heading per region, then its maps; the title is `<map> — <region title>`.
- Hills in the schema and in `npHeightAt` (`npHillRise`, `npHillAt`, `NP_HILL`); pads terrace on a hill; the HUD names the
  hill underfoot. Water kinds `bay`, `ocean`; district character `park`.
- Three districts, 9 sites each, all stations existing catalog ids (no new station): `sf-downtown` (4 hills, 3 water,
  3 seawalls, 14 roads, 5 connectors), `sf-mission` (3 hills, 3 water, 3 seawalls, 13 roads, 5 connectors),
  `sf-golden-gate-park` (Twin Peaks, the ocean and three lakes, 2 seawalls/dunes, 11 roads, 3 connectors).
- Headless build (high): worst 139 / 134 / 145 meshes and 65 k / 62 k / 79 k triangles at a site (budget 260 / 400 k).
  In Chromium at 1280×720 and 360×640 every SF map and Orleans load with no page error.
- `check_parishes` 10 276 checks green; `check_parish_data` 4 038 green. `WebXR/parishes/dist/parishes.html` was **not**
  rebuilt (the gate regenerates output) — run `python3 tools/bundle_webxr.py parishes` before a release.

## Phase 2
1. **Hills that read.** The mounds are honest but pale: shade the ground by slope in `npGroundColour` (a darker flank,
   a lighter crown), let `npMassingForChunk` thin the massing on steep flanks, and add a street grid that follows the
   slope (Lombard's crooked block as a switchback road). Hold the budget.
2. **The GOLDEN-B seams.** When `np-data-sf-marina.js` and `np-data-sf-bayview.js` land, the five pending connectors
   resolve; check both ends within 2 km and that each is mirrored (same kind and lonlat). The Bay Bridge `world` kind is
   GOLDEN-B's; the Downtown map keeps `[-122.387, 37.790]` on dry ground (the checker asserts it).
3. **Play layer.** SF side games and field lessons on the play layer (`sl-parish-play.js` binds by site id): a cable car
   grip-and-brake order at the barn, a ferry line-up at the Ferry Building, a beach flag-and-call drill at the lifeguard
   station, a mower slope walk in the park. Each behind a union station, each teaching as it plays.
4. **Wildlife and weather that fit.** Fog rolling in off the ocean for Golden Gate Park (weather `fog` default at dawn),
   gulls over the Embarcadero, pelicans over the bay (already wired when a map has bay or ocean water).
5. **A region card.** Home and the Atlas list maps by region (the Atlas section PARISH-2 proposed can use
   `npRegionGroups` directly).
