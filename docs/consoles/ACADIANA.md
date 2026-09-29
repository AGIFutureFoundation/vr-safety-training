# ACADIANA — Lafayette, Carencro and Monroe (`ac`, port 9005)

Brief: `$SP/louisiana/wave-brief.md` (section ACADIANA), the facts file `$SP/louisiana/la-facts.md` (the only source for
project facts; no city growth figure is stated), the packs briefs' shared rules and reactor loop. Base c0883a3.

## What was built

| map | region | scale | sites | where |
|---|---|---|---|---|
| `laf-downtown` — Downtown Lafayette and the Vermilion | louisiana-cities | 2 m/m | 20 (`lafd-*`) | lon -92.053 … -91.967, lat 30.182 … 30.256 |
| `laf-carencro-north` — Carencro and North Lafayette | louisiana-cities | 2 m/m | 18 (`lafc-*`) | lon -92.090 … -92.004, lat 30.259 … 30.332 |
| `monroe-west-monroe` — Monroe and West Monroe | louisiana-cities | 3 m/m | 18 (`mon-*`) | lon -92.160 … -92.030, lat 32.455 … 32.565 |

- **Laid out from lon/lat.** A scratch layout script (kept in `$SP/louisiana/ac/`, not shipped) converts every river, road,
  district, site and landmark from lon/lat through one north-up uniform frame per map, so the anchors fit with almost no
  residual. It checks each site stays clear of water, roads and levees before a module is written.
- **Imagery check.** The Vermilion (it enters from the east north of the airport, bends south past downtown's south-east and
  runs west-south-west), the Evangeline Thruway's line from the interstates' interchange past downtown to the airport, the
  interstates' interchange position (about 30.261 N, which set the two Lafayette maps' shared edge), the Ouachita's bends and
  oxbow south of the interstate, Bayou DeSiard's meanders and the Monroe airport were matched to two Copernicus Sentinel-2
  views (2026 scenes; imagery kept in scratch, not committed). No figure was read off the imagery.
- **Illustrative sites.** Every blurb, module header and a sign landmark says the site layouts are illustrative and the
  cities, rivers and roads are real. The workforce centres say "a trade reference only: no employer's or union's programme is
  delivered here". Monroe is named as a place only (nearest city to the Richland Parish project, by geography).
- **Registry.** NP_REGIONS gains the `louisiana-cities` row exactly as the wave brief gives it (the other two Louisiana rows
  are left to the consoles whose maps fill them: WALKABLE's atlas requires every region to hold a map); check_parish_data's
  region list knows all three. PALETTE gains the `acadian-cypress` category (cypress and whitewash clapboard under tin), region
  rows for the three Louisiana regions and per-map overrides for Cajun and Creole country; the strict engine set, the bundler
  lists, the homepage (regenerated), the TradeQuest shared export (658.7 of 768 KiB) and docs/parishes.md (section and
  connector table) carry the three maps.
- **HARVEST.** `hvFamily` treats every Louisiana region as the Louisiana family (its agency and species); the inland growth
  cities play fish and gator only (no crab, shrimp or oyster so far from the coast); a campus pond is not a spot; the
  rice-and-crawfish field goes only to a city map that declares `farmland: true` (Carencro). Spots: two on the Vermilion,
  two on Bayou Carencro plus the field, two each on the Ouachita and Bayou DeSiard.
- **Bayou Carencro** is drawn on an approximate course (named so on the map); the canal, pond, pit, the Vermilion's bank
  protection and the flood bank are labelled procedural.
- **Site kinds** are existing kinds only, so interiors (IX_KIND_STYLE), listings (TY_KIND_WORDS) and NPC placement already
  cover them.

## Cycles

1. Reason: frame each map from real geography before writing data. Act: two Sentinel-2 views (Lafayette plus Carencro, Monroe)
   read against the planned polylines. Observed: the Vermilion enters from the east, not the north, and the interstates'
   interchange sits near 30.261 N → river redrawn, Lafayette frame moved north-east, Carencro frame starts at 30.259 N.
2. Reason: every site clear of water, roads and levees. Act: layout script's clearance pass. Observed: 4 sites too close to
   Congress Street, Johnston Street, Pont des Mouton Road and DeSiard Street → moved; all three maps clear.
3. Reason: the data rules. Act: check_parish_data. Observed: 26 fail (anchors, landmarks, field lessons, gated, levees,
   connectors, docs) → added; then 13 fail (a three-water / two-levee rule, a four-decimal anchor, docs) → fixed → 20115 pass, 0 fail.
4. Reason: strict engine geometry and budgets. Act: check_parishes. Observed: 13 fail — roads wet in the Vermilion and the
   Ouachita, a bridge landmark on water, relief short of a levee crest on the Lafayette maps, Monroe's last site too near the
   edge (15 chunks) → the Vermilion drawn as the bayou it is (short spans), the interstate bridge and the Endom Bridge as bridge
   roads, levees placed on the sampling grid, the site order changed → 39062 passed, 0 failed; worst high tier laf-downtown
   145 meshes / 72440 triangles, laf-carencro-north 125 / 77970, monroe-west-monroe 135 / 64372 (budget 260 / 400000).
5. Reason: hidden play on real Louisiana water. Act: check_harvest. Observed: 1 fail (a DeSiard spot in the water at a sharp
   meander) and California's family on Louisiana maps → meander smoothed, Louisiana family for every Louisiana region, inland
   rule → 87 passed, 0 failed (fields only on Carencro).
6. Reason: the wider checkers read every site. Act: check_palette, check_interiors, check_tycoon, check_walkable, check_npc,
   check_parish_play, check_motorworks one at a time. Observed: palette 1 fail (sign ink not a design token) → token; tycoon 3
   fail ("Rail Yard" read as a place name; no waterside shop in Lafayette) → "South Monroe Rail Yard", the bank crew moved
   nearer the Vermilion; walkable 1 fail (two empty regions in the atlas) → own region only → all pass.
7. Reason: the shared surfaces. Act: gen_home, export_shared, check_bridge, check_home. Observed: check_bridge 86/86 (export
   658.7 KiB of 768); check_home 1 fail left: the dist copy of the homepage differs (the coordinator rebuilds dist).

## Left

- `dist/` rebuild (the coordinator's bundler run) so check_home's dist-copy line passes.
- The Lafayette maps' pending ways out (`ac-lafd-thruway-south`, `ac-lafc-i49-north`) and Monroe's (`ac-mon-i20-east`,
  `ac-mon-i20-west`) point at placeholder maps; re-point them if a neighbour map is ever drawn next to these edges.
- gen_treasures for the three maps (the play layer's generator; check_parish_play passes without it).
- eval_worlds not run (machine shared by eight consoles); run it at the integration gate.
