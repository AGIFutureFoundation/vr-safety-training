# LA-PLAY — the play layer on the Louisiana maps (`lpl`, 9012)

Louisiana round 2. Brief: `$SP/louisiana/round2-brief.md` (section LA-PLAY). Facts: `$SP/louisiana/la-facts.md`. Base
6ffb8b37 (fast-forward). Every map in the regions `louisiana-sites`, `louisiana-cities` and `new-orleans-districts` now has
the play layer: side quests, a path board, crew-kit treasures and lesson finds, parked vehicles that fit its sites, and, on
the city district maps, a lighter harvest table.

## Decision: key the Louisiana maps into PLAYLAYER's module by region

`WebXR/shared/pl-bay-play.js` already carries the play layer for maps outside the five New Orleans parishes, and every
consumer reads it: `eval_worlds`, `gen_treasures`, `check_treasures`, `check_parish_play`, `check_playlayer` and the
parishes app's `#menu-paths` / `#menu-krewe` fallback mounts. LA-PLAY adds `PL_LA_REGIONS` (the three Louisiana regions),
so `PL_REGIONS = [...PL_BAY_REGIONS, ...PL_LA_REGIONS]`. No consumer needed new code, and no list of map ids exists
anywhere. CAPITAL's Baton Rouge and Hammond maps, or any later map in one of these regions, go on the layer as soon as
they are registered, as long as their field lessons name a `k12` and a trade `station` (the round-one schema already asks
for both).

- `PL_BAY_MAPS` keeps its name for its readers. It now holds all 36 maps. `PL_LA_MAPS` holds the 17 Louisiana ones.
- Each row carries `hint`. Louisiana crew kits say "Crews keep a kit near every Louisiana site", and Louisiana lesson finds
  name Louisiana.
- Set ids keep the `bay-kits-<map>` prefix because the treasure readers key on it. Set titles use the short place name
  (`PL_SHORT`: names as places, nothing else).

## What landed

| Layer | On the 17 Louisiana maps |
|---|---|
| Play-layer field lessons | 51 (3 per map, each the map's own lesson with a classroom `k12` and a trade `station`) |
| Side quests (`#menu-krewe`) | 51: meet the crew → classroom station → trade station → the lesson sign |
| Path boards (`#menu-paths`) | 17: trade (a row per site), classroom, play |
| Treasures | a crew kit off every Louisiana site plus a quiet lesson find per lesson. The whole tree grew to 1042 treasures, 60 sets |
| Parked vehicles (MOTORWORKS) | 136 (phone tier 68), 8 per map. Ten new site rules cover the Louisiana site kinds |
| HARVEST | 72 spots. The 8 city district maps take the lighter table |

**MOTORWORKS rules added** (`MV_SITE_RULES`, all existing gated Motor Pool land entries):

| Site kinds | Vehicles |
|---|---|
| fuel farm | fuel truck, tanker |
| tank farm, compressor, wellpad, pipeline, chemical, refinery, hazmat | tanker, pickup |
| hangar, paint shop | pushback tug, boom lift |
| slip, dredge | telehandler, flatbed |
| excavation, mat crossing | backhoe, skid steer |
| energy storage | bucket truck, digger derrick |
| streetcar | bucket truck (for the wire) |
| office, union hall | pool sedan, pickup |
| landing, ferry, marina, lock, shoreline | utility van, pickup |
| wetland, monitoring, survey | UTV, pickup |

Two kinds are still without a rule: `rail` and `bridge`. The rail switcher is class `rail`, which has no road handling.

**HARVEST's lighter table** (`hv-harvest.js`: `HV_CITY_REGIONS`, `hvCityDistrict`, `HV_CITY_MAX_SPOTS = 4`) applies to the
growth-city districts and the New Orleans neighbourhood districts. They get:
- no rice-and-crawfish field unless the map declares `farmland` (Carencro does);
- no shrimp and no oyster;
- crab only off a pier or a beach;
- gator watch only by a bayou or a marsh, never a drainage canal downtown;
- at most four fishing spots.

The activities, games, lines, species and seasons are unchanged. The rural development-site maps keep the full table
(8 of them have a field).

**Two lesson fixes on round-one maps** (text and station only, no geometry):
- `lsf-fl-circuits` (Franklin) named the trades room `electrical`. Its quest board link opened a room, not a station. It now
  names `yc-shore-power-connection-and-in-water-electrical-safety`, a station from that site's own board.
- `sw-cc-fl-crane-balance` (Calcasieu) asked about a "built-up pad". The question now reads "a packed stone pad".

The shared export was regenerated (`exports/shared/holodeck-shared.json`, 622.3 KiB of 768).

## Cycles

1. **Reason:** the 17 maps each have 3 field lessons with `k12` and `station`, and PLAYLAYER's module keys on region. Adding the
   Louisiana regions should give quests, boards and treasures with no consumer edits.
   **Act:** `PL_LA_REGIONS`, `PL_SHORT` names, per-row `hint`; `gen_treasures` reads `d.hint` and names Louisiana in the
   lesson hint.
   **Observe:** `check_playlayer` found 2 failures. Franklin's quest link opened a trades room instead of a station
   (`electrical`), and Calcasieu's lesson had the fact-shaped word "built". `check_treasures` passed: 1042 treasures,
   60 sets.
2. **Reason:** fix the lessons at their source, taking a station from the site's own board (PLAYLAYER cycle 1's pattern).
   **Act:** the station swap and the rewording; treasures regenerated; a Louisiana block added to `check_playlayer` (every
   map of the three regions is on the layer, at least 17 maps, the hint names Louisiana).
   **Observe:** `check_playlayer` 2759/0 (36 maps: 19 Bay Area, 17 Louisiana; 116 lessons; 116 quests); `check_treasures`
   passes; `check_parish_play` 5219/0.
3. **Reason:** MOTORWORKS already parked 8 vehicles per Louisiana map, but 28 Louisiana site kinds had no rule. Tank farms
   and hangars were getting whatever the ring found. Proof: `check_motorworks` place and data lines.
   **Act:** 10 site rules.
   **Observe:** 136 parked (phone 68); only `rail` and `bridge` are left without a rule; `check_motorworks` 36/0.
4. **Reason:** rice fields were landing downtown (Uptown, Mid-City, Bywater), and City Park's lagoons offered shrimp and crab.
   City district maps need a lighter table, keyed by region.
   **Act:** `hvCityDistrict`, the lighter activity filter, the four-spot cap, the field gate widened from growth cities to
   every city district; a `check_harvest` line for each rule, plus one proving the rural site maps keep their fields.
   **Observe:** `check_harvest` 103/0. That is 166 spots on 36 maps; the 8 city district maps are light, and 8 rural site
   maps keep a field.
5. **Reason:** the eval should see the Louisiana maps at the parishes' score.
   **Act:** first run, `AS_PORT=9012 node tools/eval_worlds.mjs` (browser).
   **Observe:** the browser pass crashed at `browser.newContext` ("Target page, context or browser has been closed") and the
   run hit its time limit with no scores. That was probably a shared-machine browser; nothing in the page was at fault.
6. **Reason:** use the second and last allowed run headless.
   **Act:** `node tools/eval_worlds.mjs --no-browser`.
   **Observe:** all 17 Louisiana maps scored 100; mean 100 over 47 subjects; 5 findings, none of them LA-PLAY's. Before this
   work, each of these maps failed the "play layer offers three or more field lessons (0)" check, which cost 5 points (95),
   as Unspoken Smiles still does.
7. **Reason:** the station swap and the new treasures change the shared export.
   **Act:** `check_bridge`, `export_shared`.
   **Observe:** 85/86 (the export was stale), then 86/86 after the re-export. `check_parish_data` 28676/0 and `check_k12`
   2955/0 after the lesson edits.

## Eval (`node tools/eval_worlds.mjs --no-browser`; the browser pass is not scored)

| Map | Score |
|---|---:|
| la-starbase-vermilion, la-black-bayou-cameron, la-saronic-franklin, la-avex-new-iberia | 100 |
| la-meta-richland, la-delta-forge-rapides, la-shintech-plaquemine, lc-calcasieu-channel, lc-port-of-vinton | 100 |
| laf-downtown, laf-carencro-north, monroe-west-monroe, lc-lakefront-downtown | 100 |
| nola-french-quarter-cbd, nola-uptown-garden, nola-mid-city-gentilly, nola-bywater-lower-ninth | 100 |

## Seams

- `PL_LA_REGIONS`, `PL_LA_MAPS`, `PL_LA_TREASURE_HINT` (`pl-bay-play.js`). Every other seam is PLAYLAYER's, unchanged.
- `HV_CITY_REGIONS`, `HV_CITY_MAX_SPOTS`, `hvCityDistrict(parish)` (`hv-harvest.js`).
- `MV_SITE_RULES` rows for the Louisiana kinds (`mv-motorworks.js`).

## Left

- **Eval:** the browser half of `eval_worlds` (loads, and the live `#menu-paths` / `#menu-krewe` mount on a Louisiana map)
  was not scored, because the browser crashed on the shared machine. `sv_survey` on two Louisiana maps would prove the boards
  in the page.
- **Vehicles:** there is no `rail` or `bridge` rule. A rail switcher needs road handling or a rail drive mode (NEWTON).
  Watercraft at landings and slips wait on NEWTON's water drive mode.
- **Harvest:** Richland has no spots because its map has no fishable water. Uptown's gator watch sits on a marsh polygon the
  map declares.
- **Files:** `dist/` bundles were not rebuilt (DETAIL-2 and CAPTURE rebuild them). The `bay-kits-` set-id prefix stays for
  the readers.
