# Console SITEWORKS — 300 job sites across the maps

SmartCiti.X Powered by AGI Corp · Holodeck Packs run · prefix `sw` · port 8979 · temp `$SP/packs/siteworks/` · base 4713545.

## The ask
The owner wants 300 job sites across all maps. The ten parish-engine maps held 109 sites; console BAYMAP adds three
Oakland districts (~27 sites) in parallel. SITEWORKS grows the ten maps to **at least 273** so the run lands at 300+.

## Per-map targets (weighted by district area and character)
| map | before | target | why |
|---|---|---|---|
| orleans | 14 | 35 | sixteen districts, the biggest dry area, every character |
| jefferson | 12 | 29 | suburb and industrial belts, a long west bank waterfront |
| st-bernard | 11 | 26 | a narrow dry ridge between refinery, suburb and marsh |
| plaquemines | 12 | 21 | small towns strung on the river; most of the field is marsh |
| st-tammany | 12 | 31 | wide piney woods and the Slidell and Covington towns |
| sf-downtown | 9 | 27 | dense downtown, SoMa, the waterfront, hills kept clear |
| sf-mission | 9 | 28 | industrial flats, campus, quarter, suburbs |
| sf-golden-gate-park | 9 | 27 | the park, the Richmond and the Sunset |
| sf-marina | 10 | 27 | the Presidio, the Marina, big Richmond and Western Addition blocks |
| sf-bayview | 11 | 29 | port, shipyard clean-up, industrial and suburb |
| **total** | **109** | **280** | + BAYMAP's ~27 → 300+ |

## How
`tools/gen_sw_sites.mjs` (committed, re-runnable) writes the new sites into each `np-data-<id>.js` between
`// sw:begin` and `// sw:end` markers at the end of the `sites` array (existing sites untouched and first, so every
play-layer binding by match still finds the same site). Re-running strips the block and places again from the
current map, so the coordinator can re-run it after merging other consoles' edits to the same maps
(`node tools/gen_sw_sites.mjs` for all ten, or `node tools/gen_sw_sites.mjs orleans sf-mission` for some;
`--check` reports without writing).

- **Kinds and stations**: a template per work type (hotel floor, kitchen, school, clinic, fire station, park yard,
  substation, bus yard, construction, renovation, warehouse, fabrication shop, rail siding, pumping station, port,
  shipyard, harbour, marsh restoration, levee yard, tank farm, campus plant, and so on), each an engine kind already
  used on the maps, with its unions from `tools/unions.json`, its programmes from the catalog's curricula, and a pool
  of real catalog stations; each site takes four from its pool (schools: education-support stations plus K-12 ones,
  as the existing school and campus sites do).
- **Character fit**: each district character has its own cycle of templates (a port district gets port, shipyard,
  harbour and landing; a wetland gets marsh restoration, levee yard, pumping station and trailhead).
- **Placement**: deterministic farthest-point placement inside the district polygon — on dry ground with the whole
  pad (and a margin) off open water, off every ribbon's width, off levees, clear of hills, off road ribbons, at least
  two pads from every other site, and flat.
- **Facts rule**: names are the district's public place name plus a generic work-place word (no business names, no
  figures); every blurb opens "A procedural …" so the site says it is procedural (sites have no provenance field).
- **Regenerated after**: `gen_treasures` (storm and fog kits per site), `gen_home` (site counts), `gen_guide_kb`,
  and whatever else `gen_catalog` chains.

## Checks run (single checkers only)
check_parishes, check_parish_data, check_parish_play, check_krewe, check_npc, check_treasures, check_links, plus the
freshness checkers of what was regenerated (check_home, check_guide). Evals before/after with `tools/eval_worlds.mjs`.

## Seams
None new: the sites ride the existing parish schema; `tools/gen_sw_sites.mjs` is the re-run hook.
