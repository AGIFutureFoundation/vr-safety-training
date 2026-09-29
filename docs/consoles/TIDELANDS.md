# TIDELANDS — the Bay Program project areas as 4 km worlds (`tl`, port 8967)

Brief: `$SP/epa/project-worlds-brief.md` (section TIDELANDS), `bay-program-brief.md`, and the facts file
`epa-2026-facts.md` (the only source for project facts). Base 039f09e.

## Plan

A region `bay-program` ("Bay Program Project Areas", noun "site area") on the parish engine, with 4096 m maps where
the named projects work. Every map is procedural in detail: laid out from the place's approximate lat/lng frame
(np-geo.js), the shoreline's general shape and orientation, the named water bodies, highways and creeks, and the
land-use character. No survey accuracy is claimed and no figure is given for any place.

- `bp-strip-marsh-east` — Strip Marsh East on San Pablo Bay's northern shore along Highway 37 (ABAG's project, per the
  facts file): tidal marsh (wetland water), sloughs and Sonoma Creek as water, berms and a levee road, the highway as a
  named road; sites for tidal channel excavation, berm lowering, sediment reuse, a monitoring station and a staging yard.
- `bp-san-leandro-bay` — San Leandro Creek's mouth and San Leandro Bay's shore (the City of San Leandro's project):
  the creek as water, the storm drain crew, the two trash capture device sites, a shoreline park, industrial frontage;
  connectors to BAYMAP's `oak-fruitvale-estuary` (the Fruitvale field reaches San Leandro Bay), pending until merged.
- `sf-outer-mission` — sf-mission's field ends at about 37.722 N (computed from its fit); the Outer Mission lies south of
  that, around Mission Street near the city's southern edge, so it gets its own district (region `san-francisco`, since
  every `sf-` map names that region): planted sidewalk filtration, rain gardens, the underground infiltration site, a
  school, a transit corridor; paired connectors with sf-mission.

Stations: the existing bay-restoration, hunters-point, hazmat, confined-space, utility, heavy-equipment and grounds
stations that fit (BAYKEEPER's `bk-*` and CLEANPORTS' `cp-*` when they merge).

## Cycles

1. Reason: sf-mission's southern edge, from its fit (npBounds). Observed: minLat 37.722 N; the Outer Mission lies south of it,
   so sf-outer-mission is its own district.
2. Reason: region bay-program + the three maps generated and registered; check_parish_data passes. Observed: 17 fails (digits in
   "Highway 37" names, sf-mission's paired ends null, docs rows missing) -> renamed "Highway Thirty-Seven", filled the paired
   positions, wrote the docs section -> 6152 checks pass, 0 fail.
3. Reason: the three maps in NP_ENGINE_STRICT; check_parishes strict lines pass. Observed: 4 fails (Arrowhead Marsh landmark
   on water; three modules not in the parishes bundle list) -> landmark kind point, bundle_webxr.py lists the modules.
   Worst meshes/triangles: sf-outer-mission 147 / 77849 (high), bp-strip-marsh-east 146 / 59384, bp-san-leandro-bay 124 / 38756.
4. Reason: checker extension (region noun, strict, the brief's site kinds, named water and roads, two trash capture sites,
   sf-mission's edge north of the Outer Mission, no figures, procedural label). Observed: check_parishes 16632 passed, 0 failed.
5. Left: field lessons tied to ESTUARY's es-* ids, gen_treasures with BAYQUEST, home card counts by region, the rebuilt dist
   bundle (the coordinator regenerates), BAYMAP's mirror connectors in oak-fruitvale-estuary.

## Seams

- `NP_REGIONS` gains `{ id: "bay-program", name: "Bay Program Project Areas", noun: "site area" }`; `npRegionGroups`
  shows it after San Francisco (and after BAYMAP's `oakland` when that merges — the coordinator keeps the order).
- `bp-sl-*` connectors name `oak-fruitvale-estuary` with `to.position: null` and the agreed `lonlat`; BAYMAP's module
  should list the mirror crossings under its own ids at the same `lonlat` (docs/parishes.md table).
