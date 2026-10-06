# NOLA-DISTRICTS — New Orleans broken into neighbourhood districts (`nd`, port 9006)

The `orleans` map holds the city's core at a compressed scale. Four child maps zoom in on it at a near-true scale, each
declaring `parent: "orleans"`, and the overlap rule is extended so a map may overlap only its declared parent.

## What it does

- **Four districts** (region `new-orleans-districts`, "New Orleans Neighbourhoods"), all on the strict engine, written by
  `tools/gen_nd_districts.mjs` as pure-literal modules:
  - `nola-french-quarter-cbd`: the Quarter, the CBD, the edge of the Warehouse District and the riverfront. Scale 0.52, 19 sites.
  - `nola-uptown-garden`: the Garden District, Uptown, the St. Charles streetcar and the river's crescent. Scale 0.9, 18 sites.
  - `nola-mid-city-gentilly`: Mid-City, City Park, Bayou St. John, the Fair Grounds, Gentilly and the London Avenue Canal.
    Scale 1.5, 18 sites.
  - `nola-bywater-lower-ninth`: the Marigny, Bywater, the Industrial Canal and its lock, the Lower Ninth Ward, Holy Cross,
    Bayou Bienvenue and Algiers Point. Scale 1.25, 18 sites.
- **Trades sites**: historic restoration, streetcar track and wire, drainage and pumping, levee and floodwall, hospitality,
  and port, ferry and lock work, plus schools, campuses, hospitals, firehouses and park and marsh crews. Every trade is a
  `tools/unions.json` id and every station a catalog station. Each map also has 3 field lessons and 2 gated side quests.
- **Geography**: the river's centre line, the Industrial Canal, Bayou St. John, the Orleans and London Avenue canals, City
  Park's lagoons and the Fair Grounds were checked against Copernicus Sentinel-2 imagery (2 calls; Contains modified
  Copernicus Sentinel data 2026). The river banks, levees and riverfront roads are offsets of one shared centre line, so the
  four maps agree on the river. No figure was read off the image, and no imagery is committed.
- **Parent/child rule** (`npParentOf`, `npChildrenOf` and `npMayOverlap` in `np-parishes.js`; checked in `check_parishes`):
  - A child's field lies inside its parent's field.
  - It overlaps only its parent. An overlap with a third map is allowed only where the parent already overlaps that map at
    parish scale (Jefferson's and Plaquemines' boxes reach over Orleans). This inherited overlap is noted. A child never
    overlaps a sibling or any other child.
  - Its scale is closer than its parent's.
  - Its zoom-in connectors are paired with the parent at the same `lonlat`. The parent's end stands inside the child's area,
    within two pads of the child's end, and WALKABLE pairs the two both ways.
  - Neighbouring children are joined by crossings of their own.
  - No child site duplicates a parent site on the ground.
- **Connectors**: 8 zoom-in doors on Orleans (2 per district) and 4 crossings between districts (St. Charles, Canal,
  Esplanade and Elysian Fields). check_walkable's headless round trip covers all of them.
- **Supporting changes**:
  - An `NP_REGIONS` row and a `PA_REGION_CHARACTERS` row (the Louisiana palette).
  - HARVEST's `hvFamily` and FACADES' `fcRegionGroup` now read every `new-orleans*` and `louisiana*` region as Louisiana, so
    Louisiana species and Creole facades appear rather than Bay Area ones.
  - HARVEST tests a spot's dryness at its rounded position, so a spot on a narrow canal's bank never rounds into the water.
  - Also updated: both parishes bundles, the home card counts, and the shared export (675 KiB of 768).
  - docs/parishes.md gains a section, "Districts inside a parish", on the pattern.

## Seams

- `npParentOf(parish)` returns the parent map or null.
- `npChildrenOf(id)` returns the child maps of `id`.
- `npMayOverlap(a, b)` returns whether two maps' fields may overlap under the rule.
- Another city's children declare `parent` and follow the same rule. The generator shows how the doors are mirrored into
  the parent.

## Cycles

1. Reason: four boxes inside Orleans that never overlap need seams; Uptown's northern edge must stay below the Quarter's
   southern edge, and the Quarter must end at Esplanade, where the Marigny begins. Act: frames by centre and scale; the
   generator writes the four maps and mirrors 8 doors into Orleans. Observe: check_parish_data 20817 passed, 28 failed (all
   docs/parishes.md listings), with every station, union and programme resolved.
2. Reason: the overlap rule must allow the parent but no sibling, and Jefferson's box covers all of Orleans. Act: npParentOf,
   npChildrenOf and npMayOverlap, the checker's parent/child block (containment, sibling rule, inherited overlaps, zoom-in
   pairing through wkPair), the district block and strict mode. Observe: check_parishes 40775 passed, 14 failed. The failures
   were roads in the river or lagoon, the docs scale, the chunk probe at an edge site, a landmark on water, and one site on
   top of Orleans's bridge crew. All the parent/child checks passed.
3. Reason: fix the geometry rather than the rule. Act: riverfront offsets moved beyond the ribbon, the lagoons moved off
   Rampart and Filmore, the most central site moved last, the lock-side landmark set to kind canal, the vault moved, and
   the docs section written. Observe: check_parishes 40789 passed, 0 failed; check_parish_data 20845 passed, 0 failed.
4. Reason: the palette, HARVEST and FACADES key on the region `new-orleans`, so new Louisiana regions would fall into the Bay
   family. Act: the PA row, a Louisiana-family regex in hvFamily and fcRegionGroup, and the rounded-position spot test.
   Observe: check_palette 536/0, check_harvest 88/0 (115 spots on 24 maps), check_facades 1910/0.
5. Reason: the export, walkable and the home page must know the new maps. Act: export_shared, a walkable run and gen_home.
   Observe: check_bridge 86/86 at 675.3 KiB, check_walkable 2052/0 headless, home card "4 districts · 561 job sites".
6. Reason: LANDMARKS wants its bridge kit on a bridge road. Act: added the Magnolia Bridge and the St. Claude Avenue bridge
   as bridge roads. Observe: check_landmarks went from 4 failures to 1786 passed, 0 failed. check_parishes then flagged the
   Magnolia landmark as standing on water.
7. Reason: a bridge landmark stands at the bank end of its deck. Act: moved it to the west landing, still on the bridge
   road. Observe: check_parishes 40793/0, check_landmarks 1786/0, check_parish_data 20849/0, check_walkable 2052/0,
   check_bridge 86/86, check_harvest 88/0.

## Left

- The Superdome and the Convention Center fall just outside the Quarter/CBD box, which was cut short to keep Uptown and the
  Quarter from overlapping. Audubon Park lies west of Uptown's box.
- Uptown and Mid-City do not meet, so they have no crossing between them. The walk goes through the parent.
- Only check_walkable's headless stage was run. The browser round trip, which starts at Jefferson's door into Orleans, was
  not run on these maps.
- HARVEST places a procedural rice and crawfish field on every Louisiana-family map, including these city districts. A city
  map might want a lighter table.
- `dist/` bundles were not rebuilt, and eval_worlds was not run.
