# SITES-COAST — four coastal / Acadiana project maps (`lc`, port 9001)

Brief: `$SP/louisiana/wave-brief.md` (section SITES-COAST), facts `$SP/louisiana/la-facts.md` (the only source for project facts),
the Shared rules and reactor loop in `$SP/packs/packs-brief.md` / `packs-brief-3.md`. Base c0883a3. Site ids published in
`$SP/louisiana/sites-coast-ids.md`.

## What was built

Region `louisiana-sites` (the brief's exact NP_REGIONS row; also in check_parish_data's ND_REGIONS) with four strict-engine maps,
written once by `tools/gen_lc_sites.mjs` (the modules are the source afterwards):

| map | scale (real m per map m) | sites | high-tier worst meshes / triangles |
|---|---|---|---|
| `la-starbase-vermilion` — Starbase Louisiana, Vermilion Parish marsh | 6 | 18 | 162 / 55640 |
| `la-black-bayou-cameron` — Black Bayou Energy Hub, Cameron Parish marsh | 3 | 17 | 138 / 69237 |
| `la-saronic-franklin` — Franklin Shipyard on Bayou Teche | 1.5 | 17 | 133 / 73960 |
| `la-avex-new-iberia` — AVEX, Acadiana Regional Airport | 1.2 | 18 | 132 / 83190 |

Every required site id from the brief is present. Each map: named real water and roads (Gulf, White Lake, Freshwater Bayou Canal,
Highway Eighty-Two; Black Bayou, the Gulf Intracoastal Waterway; Bayou Teche, US Highway Ninety, Main Street; the runway),
procedural features labelled procedural, districts, two levees, a sign landmark ("the project layout is illustrative; the
parish, waterways and towns are real"), the same words in the blurb and module header, three field lessons, two gated items,
3+ crafts per project, a `project` block quoting the facts file with its sources, two pending ways out. Water and road layout
checked against Copernicus Sentinel-2 imagery (four s2view calls; no figure read off; imagery kept in scratch). New site kinds
(`tank-farm`, `compressor`, `wellpad`, `pipeline`, `dredge`, `slip`, `hangar`, `paint-shop`, `fuel-farm`) have an
`IX_KIND_STYLE` room and a `TY_KIND_WORDS` listing word. Registered in `np-parishes.js`, both bundles, `NP_ENGINE_STRICT`, and a
docs/parishes.md section with the declared scales and the ways-out table.

**Overlap.** No box overlaps any of the 25 existing maps (check_parishes holds every map). Nearest neighbours in this wave:
SOUTHWEST's `lc-port-of-vinton` (Black Bayou's box ends at 30.085 N) and ACADIANA's Lafayette maps (AVEX's box ends at 30.060 N) —
re-check after the merge.

## Cycles

1. Reason: ids first so LA-PROGRAMME can build on them. Act: sites-coast-ids.md at 09:13. Observed: published (4 maps, 70 ids).
2. Reason: four maps on the schema, registered. Act: gen_lc_sites.mjs + registry/bundler/strict set; check_parish_data. Observed:
   29 fail (region unknown, a curriculum id used as a station, too few lessons/gated/landmarks/levees, docs) → fixed → 12 (docs only).
3. Reason: engine geometry. Act: check_parishes. Observed: 8 fail — relief never reached a levee crest (4 maps), docs scale (4).
4. Reason: imagery arrived. Act: 4 × s2view, re-laid White Lake, Highway Eighty-Two, the canal and coast (Vermilion), the GIWW and
   Black Bayou (Cameron), the Teche's bend and US-90 south-west of Franklin, the runway and the open water (New Iberia); docs
   section. Observed: check_parish_data 20652 pass, 0 fail.
5. Reason: re-run geometry after the re-layout. Act: check_parishes. Observed: 5 fail (relief ×3, a slip basin bed, a sign on a
   ditch) → levee crests on the sample grid, sign moved, basin dropped → 40332 passed, 0 failed.
6. Reason: wider checkers read every site. Act: check_interiors, check_tycoon. Observed: interiors 541 pass 0 fail; tycoon 12 fail
   (listing words read as place names: "airfield", "pipeline spread", "fuel farm fence") → renamed → 7015 passed, 0 failed.

## Left

- HARVEST spot tables (crawfish/rice near Franklin and New Iberia; marsh fishing and gator watch at Vermilion and Cameron):
  not added this round (`hv-harvest.js`); check_harvest, check_walkable, check_npc, check_parish_play, check_motorworks,
  check_bridge, check_palette not run.
- PALETTE's `PA_REGION_CHARACTERS` row for `louisiana-sites`, home card counts (gen_home), gen_treasures, MOTORWORKS vehicles.
- check_parishes was last run before the final rename of three feature names (names only, no geometry).
- A checker section in check_parishes for these four maps (illustrative label, required ids, no overlap) like PROJECTLANDS'.
