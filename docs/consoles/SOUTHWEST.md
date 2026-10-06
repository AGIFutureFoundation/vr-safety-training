# SOUTHWEST — Lake Charles and Calcasieu Parish in districts (`sw`, port 9004)

Brief: `$SP/louisiana/wave-brief.md` (section SOUTHWEST, the shared rules, the geography rule), the facts file
`$SP/louisiana/la-facts.md` (the only source for project facts), `$SP/packs/packs-brief.md` and `packs-brief-3.md` (the reactor
loop). Base c0883a3. Pattern: docs/consoles/PROJECTLANDS.md and docs/parishes.md. Published ids: `$SP/louisiana/southwest-ids.md`.

## What was built

| map | id | region | scale | sites | what the facts file says there |
|---|---|---|---|---|---|
| Lake Charles Lakefront & Downtown | `lc-lakefront-downtown` | louisiana-cities | 2.2 m per map metre | 20 | Lake Charles is a place only; no growth figure |
| the Calcasieu Ship Channel | `lc-calcasieu-channel` | louisiana-sites | 2.2 | 20 | Woodside Louisiana LNG: $17.5 billion final investment decision, Calcasieu Parish (kplctv.com 2025-04-29; woodside.com) |
| the Port of Vinton | `lc-port-of-vinton` | louisiana-sites | 2.0 | 18 | FastSites: $5.9 million at the Port of Vinton, a 600 ft × 50 ft barge berth (kplctv.com 2026-05-21) |

- **Modules**: `WebXR/shared/np-data-lc-*.js`, pure literals written once by `tools/gen_sw_districts.mjs` (the modules are the source
  afterwards). Registered in `np-parishes.js`, held strict in `check_parishes.mjs`, in both bundle lists of `tools/bundle_webxr.py`.
- **Required ids kept**: `lcd-workforce-centre` (start), `lcd-bridge-work`; `lcc-lng-module-set`, `lcc-marine-offload`,
  `lcc-pipe-rack`; `lpv-barge-berth-build`, `lpv-site-prep`, `lpv-rail-and-road` — plus 50 more sites of the maps' own.
- **Illustrative**: every blurb, module header and a sign landmark say "the project layout is illustrative; the parish, waterways
  and towns are real". The project sites carry `precinct: true`; no site names or describes a real facility; the project map
  blurbs say "a trade reference only: no partnership is claimed". The workforce centre and the trades hall say they are training
  places, not any employer's or union's programme. Crafts come only from `tools/unions.json` (3+ per project).
- **Geography**: laid out from approximate lon/lat, then the lake, the Calcasieu River, Prien Lake, Contraband Bayou, the ship
  channel, the Gulf Intracoastal Waterway, the interstates, US Ninety and Vinton were re-laid against three Copernicus Sentinel-2
  views (2026-09-19 scene; imagery kept in scratch, not committed). Each header carries the attribution line. No figure was read off
  the imagery; no private facility seen on it is named or used.
- **Regions**: `louisiana-sites` and `louisiana-cities` rows (the brief's exact text) in `NP_REGIONS` before Programme Worlds, in
  check_parish_data's `ND_REGIONS`, and PALETTE rows for all three Louisiana regions. `new-orleans-districts` is in PALETTE and
  ND_REGIONS but not in NP_REGIONS here: with no map yet, check_walkable's atlas rule fails on an empty region (NOLA-DISTRICTS adds
  it with its maps).
- **Connectors**: `sw-ld-big-lake-road-south` ↔ `sw-cc-big-lake-road-north` pair the two Lake Charles fields at (-93.260, 30.174)
  (the fields touch there, no overlap); four pending ways out along Interstate Ten and a farm road.
- **Play**: HARVEST's family rule now counts the Louisiana regions as the Gulf Coast family (`HV_GULF_REGIONS`), so the three maps
  get fishing, crab lines, gator watch and a rice-and-crawfish field (none is `representative`). Three field lessons and two
  gated side quests per map. The shared export rebuilt (664.3 KiB of 768). Home card counts updated.

## Cycles

1. Reason: the three boxes must clear every map. Act: probe (`$SP/sw_probe.mjs`: npValidate, fit, bounds overlap, pads, relief)
   after the first generator run. Observed: no overlap with any of 25 maps; 2 anchors short, 2 sites in water, Vinton relief
   3.7 < 3.8 → fixed, probe clean. Committed 1e3040b.
2. Reason: the engine budgets and the region order. Act: check_parishes. Observed: 39165 passed, 1 failed (Programme Worlds must
   come last) → Louisiana rows moved before it; worst high tier 140 / 145 / 135 meshes, ≤ 79407 triangles (budget 260 / 400000).
3. Reason: the coordinator's imagery note — check the water and roads against Sentinel-2 (3 of 4 calls). Act: s2view on each box.
   Observed: the river north of the lake runs at about -93.245 (not -93.235), Prien Lake sits at the field's west edge, the ship
   channel lies on the channel field's west side with the Intracoastal Waterway across its south, and Interstate Ten runs
   south-west to north-east past Vinton with the port on a waterway south of town → all three re-laid; project sites moved onto
   the channel's east bank (illustrative). Committed c56c880, 8c6f738.
4. Reason: data rules. Act: check_parish_data. Observed: 8 fails (field lessons, gated items, a sixth landmark, a figure in the
   berth site's blurb) → three lessons and two side quests per map, the figure kept in the map blurb only; 20259 pass, 0 fail.
5. Reason: the wider checkers read every map. Act: check_palette, check_interiors, check_tycoon, check_walkable, check_harvest,
   check_npc, check_parish_play, check_motorworks, check_bridge, one at a time. Observed: palette 21 fails (rows missing),
   walkable 1 (empty region), npc 1 (two characters on the channel), bridge 2 (export stale) → palette rows, the empty region
   left to its console, an east bank marsh crew (kind wetland), export_shared re-run; all ten pass, 0 fail.
6. Reason: real Louisiana places keep crawfish, rice, fishing and gator watch. Act: HV_GULF_REGIONS in hv-harvest.js.
   Observed: lakefront 7 spots, channel 8, Vinton 6, each with fish, gator and a rice-and-crawfish field; check_harvest OK.
7. Reason: final proof. Act: check_parishes, check_harvest and eval_worlds once. Observed: check_parishes 39180 passed, 0 failed (worst
   high tier: lakefront 140 meshes / 81526 triangles, channel 131 / 70791, Vinton 150 / 72834; budget 260 / 400000); check_harvest
   OK 87 / 0; eval_worlds crashed in its headless browser (browser.newContext: target closed, the shared machine under load) and
   was not re-run (the brief allows one run).

## Seams

- `hvFamily` / `HV_GULF_REGIONS` (hv-harvest.js): other Louisiana consoles' maps inherit the Gulf family by region.
- LA-PROGRAMME: map and site ids above resolve in this tree; the project sites are flagged `precinct: true`.

## Left

- A Sulphur / east Calcasieu map would close the four pending Interstate Ten ways out (`lc-sulphur`, `lc-east-calcasieu`).
- `new-orleans-districts` in NP_REGIONS arrives with NOLA-DISTRICTS' maps.
- gen_treasures for the three maps (the play layer's generator; not run here) and the rebuilt dist bundles (the coordinator).
- Walk-through crossings (WALKABLE) on the paired road were not authored; MOTORWORKS parked vehicles use its defaults.
