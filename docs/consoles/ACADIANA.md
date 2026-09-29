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
- **Registry.** NP_REGIONS gains the three Louisiana rows exactly as the wave brief gives them; PALETTE gains the
  `acadian-cypress` category (cypress and whitewash clapboard under tin), region rows for the three Louisiana regions and
  per-map overrides for Cajun and Creole country; the strict engine set, check_parish_data's region list, the bundler lists
  and docs/parishes.md (section and connector table) carry the three maps.
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
